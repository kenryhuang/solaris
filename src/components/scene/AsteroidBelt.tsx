import { useMemo, useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { generateAsteroidPositions, generateAsteroidSizes, ASTEROID_BELT_CONFIG } from '../../utils/asteroid';
import { useSimulationStore } from '../../stores/simulationStore';
import { calculateMeanAnomaly } from '../../utils/orbital';

export function AsteroidBelt() {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const { isPaused, elapsedTime, orbitMultiplier, timeScale } = useSimulationStore();

  // Reusable objects to avoid per-frame allocation
  const matrixRef = useRef(new THREE.Matrix4());
  const positionRef = useRef(new THREE.Vector3());
  const scaleRef = useRef(new THREE.Vector3(1, 1, 1));

  // Generate asteroid positions, sizes, and orbital offsets
  const { positions, sizes, initialAngles, orbitalPeriodOffsets } = useMemo(() => {
    const count = ASTEROID_BELT_CONFIG.count;
    const pos = generateAsteroidPositions(count);
    const sz = generateAsteroidSizes(count);
    const angles = pos.map(([x, z]) => Math.atan2(z, x));
    // Precompute random orbital period offsets (each asteroid orbits at slightly different speed)
    const offsets = Array.from({ length: count }, () => Math.random() * 500);
    return { positions: pos, sizes: sz, initialAngles: angles, orbitalPeriodOffsets: offsets };
  }, []);

  // Initialize instanced mesh matrices
  useEffect(() => {
    if (!meshRef.current) return;

    const matrix = matrixRef.current;
    const position = positionRef.current;
    const scale = scaleRef.current;

    for (let i = 0; i < positions.length; i++) {
      const [x, y, z] = positions[i];
      position.set(x, y, z);
      matrix.setPosition(position);
      scale.set(sizes[i], sizes[i], sizes[i]);
      matrix.scale(scale);
      meshRef.current.setMatrixAt(i, matrix);
    }

    meshRef.current.instanceMatrix.needsUpdate = true;
  }, [positions, sizes]);

  // Animate asteroids (slow orbital motion)
  useFrame((_, delta) => {
    if (!meshRef.current || isPaused) return;

    const matrix = matrixRef.current;
    const position = positionRef.current;
    const scale = scaleRef.current;
    const typicalOrbitalPeriod = 1500; // ~4 years in days

    for (let i = 0; i < positions.length; i++) {
      const [baseX, baseY, baseZ] = positions[i];
      const baseDistance = Math.sqrt(baseX * baseX + baseZ * baseZ);
      const initialAngle = initialAngles[i];
      const periodOffset = orbitalPeriodOffsets[i];

      // Calculate new angle based on elapsed time
      const time = elapsedTime + delta * timeScale * orbitMultiplier;
      const angleOffset = calculateMeanAnomaly(time, typicalOrbitalPeriod + periodOffset);
      const newAngle = initialAngle + angleOffset * 0.001; // Very slow rotation

      const x = baseDistance * Math.cos(newAngle);
      const z = baseDistance * Math.sin(newAngle);

      position.set(x, baseY, z);
      matrix.setPosition(position);
      scale.set(sizes[i], sizes[i], sizes[i]);
      matrix.scale(scale);
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