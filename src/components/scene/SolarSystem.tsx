import { Suspense } from 'react';
import { CelestialBody } from './CelestialBody';
import { OrbitLine } from './OrbitLine';
import { StarField } from './StarField';
import { ROOT_BODIES, MOONS, CELESTIAL_BODIES } from '../../data/planets';
import { useSelectionStore } from '../../stores/selectionStore';
import { useSimulationStore } from '../../stores/simulationStore';
import { useFrame } from '@react-three/fiber';

export function SolarSystem() {
  const { select, focus } = useSelectionStore();
  const advanceTime = useSimulationStore((state) => state.advanceTime);

  // Advance simulation time each frame
  useFrame((_, delta) => {
    advanceTime(delta);
  });

  const handleBodyClick = (id: string) => {
    select(id);
    focus(id);
  };

  return (
    <Suspense fallback={null}>
      {/* Background */}
      <StarField />

      {/* Ambient light for non-sun bodies */}
      <ambientLight intensity={0.1} />

      {/* Sun and planets */}
      {ROOT_BODIES.map((body) => (
        <group key={body.id}>
          <CelestialBody
            body={body}
            onClick={() => handleBodyClick(body.id)}
          />
          {body.semiMajorAxis > 0 && <OrbitLine body={body} />}
        </group>
      ))}

      {/* Moons */}
      {MOONS.map((moon) => {
        const parent = CELESTIAL_BODIES[moon.parentId!];
        if (!parent) return null;

        return (
          <group key={moon.id}>
            <CelestialBody
              body={moon}
              onClick={() => handleBodyClick(moon.id)}
            />
            <OrbitLine body={moon} color="#333333" />
          </group>
        );
      })}
    </Suspense>
  );
}