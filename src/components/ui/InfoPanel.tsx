import { useSelectionStore } from '../../stores/selectionStore';
import { CELESTIAL_BODIES } from '../../data/planets';

export function InfoPanel() {
  const selectedId = useSelectionStore((state) => state.selectedId);

  if (!selectedId) {
    return (
      <div className="fixed top-4 right-4 bg-gray-900/90 text-white p-4 rounded-lg w-64">
        <p className="text-gray-400 text-sm">Click a celestial body to see info</p>
      </div>
    );
  }

  const body = CELESTIAL_BODIES[selectedId];
  if (!body) return null;

  return (
    <div className="fixed top-4 right-4 bg-gray-900/90 text-white p-4 rounded-lg w-64">
      <h2 className="text-xl font-bold mb-2">{body.name}</h2>
      <div className="space-y-1 text-sm">
        <p>
          <span className="text-gray-400">Type:</span>{' '}
          <span className="capitalize">{body.type}</span>
        </p>
        <p>
          <span className="text-gray-400">Radius:</span>{' '}
          {body.radius.toLocaleString()} km
        </p>
        {body.semiMajorAxis > 0 && (
          <>
            <p>
              <span className="text-gray-400">Orbital Period:</span>{' '}
              {body.orbitalPeriod.toFixed(2)} days
            </p>
            <p>
              <span className="text-gray-400">Distance from Sun:</span>{' '}
              {(body.semiMajorAxis / 1e6).toFixed(1)} M km
            </p>
            <p>
              <span className="text-gray-400">Eccentricity:</span>{' '}
              {body.eccentricity.toFixed(4)}
            </p>
            <p>
              <span className="text-gray-400">Inclination:</span>{' '}
              {body.inclination.toFixed(2)}°
            </p>
          </>
        )}
        <p>
          <span className="text-gray-400">Rotation Period:</span>{' '}
          {Math.abs(body.rotationPeriod).toFixed(2)} days
          {body.rotationPeriod < 0 && ' (retrograde)'}
        </p>
        <p>
          <span className="text-gray-400">Axial Tilt:</span>{' '}
          {body.axialTilt.toFixed(2)}°
        </p>
      </div>
    </div>
  );
}