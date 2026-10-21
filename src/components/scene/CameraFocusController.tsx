import { useEffect, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { OrbitControls } from '@react-three/drei';
import { useSelectionStore } from '../../stores/selectionStore';
import { CELESTIAL_BODIES } from '../../data/planets';
import { getBodyGroup } from '../../utils/bodyRegistry';

interface CameraFocusControllerProps {
  controlsRef: React.RefObject<React.ComponentRef<typeof OrbitControls> | null>;
}

/**
 * Follows the focused body with the camera.
 *
 * `focusedId` is set by the selector or by clicking a body. While focused,
 * the OrbitControls target is glued to the body's (moving) world position and
 * the camera is shifted by the same delta, so the user keeps full orbit/zoom
 * control while the body stays centered. On each focus *change* the view also
 * flies to a distance proportional to the body's size, then hands zoom back
 * to the user.
 */
export function CameraFocusController({ controlsRef }: CameraFocusControllerProps) {
  const focusedId = useSelectionStore((s) => s.focusedId);
  const camera = useThree((s) => s.camera);
  const flightDistance = useRef<number | null>(null);

  useEffect(() => {
    if (!focusedId) {
      flightDistance.current = null;
      return;
    }
    const body = CELESTIAL_BODIES[focusedId];
    flightDistance.current = body ? Math.max(body.renderRadius * 8, 3) : null;
  }, [focusedId]);

  useFrame((_, delta) => {
    if (!focusedId) return;
    const controls = controlsRef.current;
    const group = getBodyGroup(focusedId);
    if (!controls || !group) return;

    const target = group.getWorldPosition(new THREE.Vector3());
    // Frame-rate independent damping (~2s convergence at any fps). A fixed
    // per-frame lerp would converge 10x slower at 6 fps than at 60 fps.
    const lerpFactor = 1 - Math.exp(-3 * delta);

    // Re-anchor the view to the body, shifting the camera by the same delta
    // so the user's current orbit angle and zoom are preserved.
    const prevTarget = controls.target.clone();
    controls.target.lerp(target, lerpFactor);
    camera.position.add(controls.target.clone().sub(prevTarget));

    // Initial flight after a focus change: converge on the viewing distance,
    // then release so the user's scroll-zoom wins from then on.
    if (flightDistance.current !== null) {
      const offset = camera.position.clone().sub(controls.target);
      const newLength = THREE.MathUtils.lerp(offset.length(), flightDistance.current, lerpFactor);
      offset.setLength(newLength);
      camera.position.copy(controls.target).add(offset);
      if (Math.abs(newLength - flightDistance.current) < 0.05) {
        flightDistance.current = null;
      }
    }

    controls.update();
  });

  return null;
}
