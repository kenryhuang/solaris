import { useProgress } from '@react-three/drei';

export function LoadingScreen() {
  const { progress, active } = useProgress();

  if (!active) return null;

  return (
    <div className="fixed inset-0 bg-black flex flex-col items-center justify-center z-50">
      <h2 className="text-white text-2xl mb-4">Loading Solar System...</h2>
      <div className="w-64 h-2 bg-gray-800 rounded overflow-hidden">
        <div
          className="h-full bg-blue-500 transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>
      <p className="text-gray-400 mt-2">{progress.toFixed(0)}%</p>
    </div>
  );
}