import { useRef, useEffect, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { useTexture } from '@react-three/drei';
import * as THREE from 'three';
import type { CelestialBody as CelestialBodyType } from '../../types/celestial';
import { useSimulationStore } from '../../stores/simulationStore';
import { calculateRotationAngle } from '../../utils/orbital';
import { computeBodyPosition } from '../../utils/positions';
import { registerBody, unregisterBody } from '../../utils/bodyRegistry';

interface CelestialBodyProps {
  body: CelestialBodyType;
  /** Parent body for moons — their orbit is relative to it, not the origin. */
  parent?: CelestialBodyType;
  onClick?: () => void;
}

// Check if textureUrl is actually a color (for placeholder bodies)
function isColorUrl(url: string): boolean {
  return url.startsWith('#');
}

export function CelestialBody({ body, parent, onClick }: CelestialBodyProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const groupRef = useRef<THREE.Group>(null);

  const { isPaused, elapsedTime, rotationTime, rotationMultiplier, orbitMultiplier, timeScale } =
    useSimulationStore();

  // Load texture if available, otherwise use placeholder color
  const isPlaceholder = isColorUrl(body.textureUrl);
  const texture = isPlaceholder ? null : useTexture(body.textureUrl);

  // Publish this body's scene group so camera focus and moon orbit lines can
  // read its ground-truth world position.
  useEffect(() => {
    const group = groupRef.current;
    if (!group) return;
    registerBody(body.id, group);
    return () => unregisterBody(body.id);
  }, [body.id]);

  // Animation frame
  useFrame((_, delta) => {
    if (!meshRef.current || !groupRef.current) return;

    // Self-rotation.
    //
    // The angle is *set* from the absolute simulated-day clock instead of being
    // accumulated from real-time deltas. The previous implementation integrated
    // `(2π / (P_rot * 86400)) * delta * 1000`, i.e. real seconds per second with
    // an arbitrary 1000x factor, which ignored `timeScale` entirely: at the
    // default 0.1 days/sec a planet spun ~8.64x too slowly relative to its own
    // orbit, the "Days/sec" slider changed revolution but not rotation, and the
    // accumulated angle drifted out of phase on every pause/resume/reset and
    // with every frame-rate change. Both motions now read the same day-based
    // time base, so 1 simulated day = exactly 1 turn for Earth.
    //
    // `delta * timeScale * rotationMultiplier` mirrors the orbital path below so
    // spin and revolution stay in phase within the current frame rather than
    // lagging it by one tick.
    // While paused the absolute clock is used as-is, so spin freezes together
    // with the orbit instead of creeping ahead of it.
    const rotationClock = isPaused
      ? rotationTime
      : rotationTime + delta * timeScale * rotationMultiplier;
    meshRef.current.rotation.y = calculateRotationAngle(rotationClock, body.rotationPeriod);

    // Orbital motion.
    // `orbitalPeriod !== 0` (not `> 0`) so retrograde orbits such as Triton's
    // (-5.877 days) actually revolve backwards instead of sitting frozen at
    // M = 0 while the body keeps spinning.
    // Moons are positioned relative to their parent (see computeBodyPosition),
    // not around the scene origin.
    if (!isPaused && body.semiMajorAxis > 0 && body.orbitalPeriod !== 0) {
      const time = elapsedTime + delta * timeScale * orbitMultiplier;
      const [x, y, z] = computeBodyPosition(body, parent, time);
      groupRef.current.position.set(x, y, z);
    }
  });

  // Initial position for static bodies
  useEffect(() => {
    if (groupRef.current && body.semiMajorAxis > 0 && body.orbitalPeriod !== 0) {
      const [x, y, z] = computeBodyPosition(body, parent, elapsedTime);
      groupRef.current.position.set(x, y, z);
    }
  }, [body, parent, elapsedTime]);

  // Keep the spin angle correct while paused / on reset / on first mount, where
  // useFrame either does not run or must not advance the clock.
  useEffect(() => {
    if (meshRef.current) {
      meshRef.current.rotation.y = calculateRotationAngle(rotationTime, body.rotationPeriod);
    }
  }, [body, rotationTime]);

  const isSun = body.type === 'star';

  // Create material for placeholder-colored bodies
  const placeholderMaterial = useMemo(() => {
    if (!isPlaceholder) return null;
    return new THREE.MeshStandardMaterial({
      color: body.textureUrl,
      roughness: 0.8,
      metalness: 0.1,
    });
  }, [isPlaceholder, body.textureUrl]);

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
        ) : isPlaceholder ? (
          <primitive object={placeholderMaterial!} attach="material" />
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