import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { generateAsteroidPositions, generateAsteroidSizes, ASTEROID_BELT_CONFIG } from '../../utils/asteroid';
import { useSimulationStore } from '../../stores/simulationStore';
import { calculateMeanAnomaly } from '../../utils/orbital';

export function AsteroidBelt() {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const { isPaused, elapsedTime, orbitMultiplier, timeScale } = useSimulationStore();

  // Generate asteroid positions and sizes
  const { positions, sizes, initialAngles } = useMemo(() => {
    const count = ASTEROID_BELT_CONFIG.count;
    const pos = generateAsteroidPositions(count);
    const sz = generateAsteroidSizes(count);
    const angles = pos.map(([x, z]) => Math.atan2(z, x));
    return { positions: pos, sizes: sz, initialAngles: angles };
  }, []);

  // Initialize instanced mesh matrices
  useMemo(() => {
    if (!meshRef.current) return;

    const matrix = new THREE.Matrix4();
    const position = new THREE.Vector3();

    for (let i = 0; i < positions.length; i++) {
      const [x, y, z] = positions[i];
      position.set(x, y, z);
      matrix.setPosition(position);
      matrix.scale(new THREE.Vector3(sizes[i], sizes[i], sizes[i]));
      meshRef.current.setMatrixAt(i, matrix);
    }

    meshRef.current.instanceMatrix.needsUpdate = true;
  }, [positions, sizes]);

  // Animate asteroids (slow orbital motion)
  useFrame((_, delta) => {
    if (!meshRef.current || isPaused) return;

    const matrix = new THREE.Matrix4();
    const position = new THREE.Vector3();

    // Asteroids orbit very slowly (typical period ~3-5 years)
    const typicalOrbitalPeriod = 1500; // ~4 years in days

    for (let i = 0; i < positions.length; i++) {
      const [baseX, baseY, baseZ] = positions[i];
      const baseDistance = Math.sqrt(baseX * baseX + baseZ * baseZ);
      const initialAngle = initialAngles[i];

      // Calculate new angle based on elapsed time
      const time = elapsedTime + delta * timeScale * orbitMultiplier;
      const angleOffset = calculateMeanAnomaly(time, typicalOrbitalPeriod + Math.random() * 500);
      const newAngle = initialAngle + angleOffset * 0.001; // Very slow rotation

      const x = baseDistance * Math.cos(newAngle);
      const z = baseDistance * Math.sin(newAngle);

      position.set(x, baseY, z);
      matrix.setPosition(position);
      matrix.scale(new THREE.Vector3(sizes[i], sizes[i], sizes[i]));
      meshRef.current.setMatrixAt(i, matrix);
    }

    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  // Gray/brown color for asteroids
  const material = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      color: '#4A4A4A',
      roughness: 0.9,
      metalness: 0.1,
    });
  }, []);

  return (
    <instancedMesh
      ref={meshRef}
      args={[new THREE.IcosahedronGeometry(1, 0), material, ASTEROID_BELT_CONFIG.count]}
      frustumCulled={false}
    />
  );
}