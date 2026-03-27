import { useSimulationStore } from '../../stores/simulationStore';

export function ControlPanel() {
  const {
    timeScale,
    setTimeScale,
    rotationMultiplier,
    setRotationMultiplier,
    orbitMultiplier,
    setOrbitMultiplier,
    isPaused,
    togglePause,
    elapsedTime,
    resetTime,
  } = useSimulationStore();

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-gray-900/90 text-white p-4">
      <div className="max-w-4xl mx-auto flex flex-wrap items-center gap-6">
        {/* Play/Pause */}
        <button
          onClick={togglePause}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded font-medium"
        >
          {isPaused ? '▶ Play' : '⏸ Pause'}
        </button>

        {/* Reset */}
        <button
          onClick={resetTime}
          className="px-4 py-2 bg-gray-600 hover:bg-gray-700 rounded"
        >
          ↺ Reset
        </button>

        {/* Orbit Speed */}
        <div className="flex items-center gap-2">
          <label className="text-sm text-gray-300">Orbit Speed:</label>
          <input
            type="range"
            min="0.01"
            max="100"
            step="0.01"
            value={orbitMultiplier}
            onChange={(e) => setOrbitMultiplier(parseFloat(e.target.value))}
            className="w-32"
          />
          <span className="text-sm w-16">{orbitMultiplier.toFixed(2)}x</span>
        </div>

        {/* Rotation Speed */}
        <div className="flex items-center gap-2">
          <label className="text-sm text-gray-300">Rotation:</label>
          <input
            type="range"
            min="0"
            max="10"
            step="0.1"
            value={rotationMultiplier}
            onChange={(e) => setRotationMultiplier(parseFloat(e.target.value))}
            className="w-24"
          />
          <span className="text-sm w-12">{rotationMultiplier.toFixed(1)}x</span>
        </div>

        {/* Time Scale */}
        <div className="flex items-center gap-2">
          <label className="text-sm text-gray-300">Days/sec:</label>
          <input
            type="range"
            min="0.01"
            max="100"
            step="0.01"
            value={timeScale}
            onChange={(e) => setTimeScale(parseFloat(e.target.value))}
            className="w-24"
          />
          <span className="text-sm w-16">{timeScale.toFixed(2)}</span>
        </div>

        {/* Elapsed Time */}
        <div className="text-sm text-gray-400">
          Elapsed: {elapsedTime.toFixed(1)} days
        </div>
      </div>
    </div>
  );
}