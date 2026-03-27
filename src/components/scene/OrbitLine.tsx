import { useMemo } from 'react';
import { Line } from '@react-three/drei';
import * as THREE from 'three';
import type { CelestialBody } from '../../types/celestial';
import { scaleDistance } from '../../utils/scale';

interface OrbitLineProps {
  body: CelestialBody;
  color?: string;
  segments?: number;
}

export function OrbitLine({ body, color = '#444444', segments = 128 }: OrbitLineProps) {
  const points = useMemo(() => {
    if (body.semiMajorAxis === 0) return [];

    const pts: THREE.Vector3[] = [];
    const scaledAxis = scaleDistance(body.semiMajorAxis);

    for (let i = 0; i <= segments; i++) {
      const angle = (i / segments) * Math.PI * 2;
      // Approximate ellipse with mean anomaly (simplified for visualization)
      const r = scaledAxis * (1 - body.eccentricity * body.eccentricity) /
                (1 + body.eccentricity * Math.cos(angle));

      // Apply inclination
      const inclinationRad = (body.inclination * Math.PI) / 180;
      const x = r * Math.cos(angle);
      const y = r * Math.sin(angle) * Math.cos(inclinationRad);
      const z = r * Math.sin(angle) * Math.sin(inclinationRad);

      pts.push(new THREE.Vector3(x, z, y)); // Swap y and z for Three.js
    }

    return pts;
  }, [body, segments]);

  if (points.length === 0) return null;

  return <Line points={points} color={color} lineWidth={1} opacity={0.5} transparent />;
}