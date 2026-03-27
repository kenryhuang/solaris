import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { SolarSystem } from './components/scene/SolarSystem';
import { ControlPanel } from './components/ui/ControlPanel';
import { InfoPanel } from './components/ui/InfoPanel';
import { CelestialSelector } from './components/ui/CelestialSelector';

export default function App() {
  return (
    <div className="w-screen h-screen bg-black">
      <Canvas
        camera={{
          position: [50, 30, 50],
          fov: 60,
          near: 0.1,
          far: 1000,
        }}
      >
        <SolarSystem />
        <OrbitControls
          enableDamping
          dampingFactor={0.05}
          minDistance={1}
          maxDistance={200}
        />
      </Canvas>

      <CelestialSelector />
      <InfoPanel />
      <ControlPanel />

      <h1 className="fixed top-4 left-1/2 -translate-x-1/2 text-white text-xl font-bold pointer-events-none">
        Solar System Simulator
      </h1>
    </div>
  );
}