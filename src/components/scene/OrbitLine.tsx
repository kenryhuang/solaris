import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Line } from '@react-three/drei';
import * as THREE from 'three';
import type { CelestialBody } from '../../types/celestial';
import { scaleDistance, scaleMoonDistance } from '../../utils/scale';
import { getBodyGroup } from '../../utils/bodyRegistry';

interface OrbitLineProps {
  body: CelestialBody;
  /** Parent body for moons — the orbit circle follows it through the scene. */
  parent?: CelestialBody;
  color?: string;
  segments?: number;
}

export function OrbitLine({ body, parent, color = '#444444', segments = 128 }: OrbitLineProps) {
  const groupRef = useRef<THREE.Group>(null);

  const points = useMemo(() => {
    if (body.semiMajorAxis === 0) return [];

    const isMoon = body.type === 'moon' && parent;
    const scaledAxis = isMoon
      ? scaleMoonDistance(body.semiMajorAxis, parent.renderRadius)
      : scaleDistance(body.semiMajorAxis);

    const pts: THREE.Vector3[] = [];
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
  }, [body, parent, segments]);

  // Moon orbit circles are drawn relative to their parent, which keeps
  // moving — re-anchor the circle to the parent's world position each frame.
  useFrame(() => {
    if (!parent || !groupRef.current) return;
    const parentGroup = getBodyGroup(parent.id);
    if (!parentGroup) return;
    groupRef.current.position.copy(parentGroup.position);
  });

  if (points.length === 0) return null;

  return (
    <group ref={groupRef}>
      <Line points={points} color={color} lineWidth={1} opacity={0.5} transparent />
    </group>
  );
}
