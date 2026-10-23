import { Suspense } from 'react';
import { CelestialBody } from './CelestialBody';
import { OrbitLine } from './OrbitLine';
import { StarField } from './StarField';
import { ROOT_BODIES, MOONS_BY_PARENT } from '../../data/planets';
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

      {/* Ambient light so night sides stay visible (physically they'd be pitch black) */}
      <ambientLight intensity={0.6} />

      {/* The Sun and the eight planets — one celestial body per data entry.
          The scene renders exactly ROOT_BODIES plus each planet's moons
          (MOONS_BY_PARENT), so the visible body count always matches the
          data source. */}
      {ROOT_BODIES.map((body) => (
        <group key={body.id}>
          <CelestialBody
            body={body}
            onClick={() => handleBodyClick(body.id)}
          />
          {body.semiMajorAxis > 0 && <OrbitLine body={body} />}
          {/* Moons orbit their parent planet, not the scene origin. */}
          {(MOONS_BY_PARENT[body.id] ?? []).map((moon) => (
            <group key={moon.id}>
              <CelestialBody
                body={moon}
                parent={body}
                onClick={() => handleBodyClick(moon.id)}
              />
              <OrbitLine body={moon} parent={body} color="#555566" />
            </group>
          ))}
        </group>
      ))}
    </Suspense>
  );
}
