import { useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { useTexture } from '@react-three/drei';
import * as THREE from 'three';
import type { CelestialBody as CelestialBodyType } from '../../types/celestial';
import { useSimulationStore } from '../../stores/simulationStore';
import { calculateOrbitalPosition, calculateMeanAnomaly } from '../../utils/orbital';
import { scaleDistance } from '../../utils/scale';

interface CelestialBodyProps {
  body: CelestialBodyType;
  onClick?: () => void;
}

export function CelestialBody({ body, onClick }: CelestialBodyProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const groupRef = useRef<THREE.Group>(null);

  const { isPaused, elapsedTime, rotationMultiplier, orbitMultiplier } = useSimulationStore();

  // Load texture
  const texture = useTexture(body.textureUrl);
  texture.colorSpace = THREE.SRGBColorSpace;

  // Animation frame
  useFrame((state, delta) => {
    if (!meshRef.current || !groupRef.current) return;

    // Rotation
    if (!isPaused && body.rotationPeriod !== 0) {
      const rotationSpeed = (2 * Math.PI) / (body.rotationPeriod * 86400); // rad/sec at 1x
      meshRef.current.rotation.y += rotationSpeed * delta * 1000 * rotationMultiplier;
    }

    // Orbital motion
    if (!isPaused && body.semiMajorAxis > 0 && body.orbitalPeriod > 0) {
      const time = elapsedTime + delta * 0.1 * orbitMultiplier;
      const meanAnomaly = calculateMeanAnomaly(time, body.orbitalPeriod);
      const [x, y, z] = calculateOrbitalPosition({
        semiMajorAxis: scaleDistance(body.semiMajorAxis),
        eccentricity: body.eccentricity,
        inclination: body.inclination,
        meanAnomaly,
      });
      groupRef.current.position.set(x, z, y); // Swap y and z for Three.js coordinate system
    }
  });

  // Initial position for static bodies
  useEffect(() => {
    if (groupRef.current && body.semiMajorAxis > 0 && body.orbitalPeriod > 0) {
      const meanAnomaly = calculateMeanAnomaly(elapsedTime, body.orbitalPeriod);
      const [x, y, z] = calculateOrbitalPosition({
        semiMajorAxis: scaleDistance(body.semiMajorAxis),
        eccentricity: body.eccentricity,
        inclination: body.inclination,
        meanAnomaly,
      });
      groupRef.current.position.set(x, z, y);
    }
  }, [body, elapsedTime]);

  const isSun = body.type === 'star';

  return (
    <group ref={groupRef}>
      <mesh
        ref={meshRef}
        onClick={(e) => {
          e.stopPropagation();
          onClick?.();
        }}
      >
        <sphereGeometry args={[body.renderRadius, 64, 64]} />
        {isSun ? (
          <meshBasicMaterial map={texture} />
        ) : (
          <meshStandardMaterial map={texture} />
        )}
      </mesh>
      {isSun && (
        <pointLight intensity={2} distance={0} decay={0} />
      )}
    </group>
  );
}