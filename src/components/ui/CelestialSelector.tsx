import { useState } from 'react';
import { useSelectionStore } from '../../stores/selectionStore';
import { ALL_BODIES } from '../../data/planets';

export function CelestialSelector() {
  const [isOpen, setIsOpen] = useState(false);
  const { select, focus, selectedId } = useSelectionStore();

  const selectedBody = selectedId ? ALL_BODIES.find((b) => b.id === selectedId) : null;

  const handleSelect = (id: string) => {
    select(id);
    focus(id);
    setIsOpen(false);
  };

  return (
    <div className="fixed top-4 left-4 z-10">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="bg-gray-900/90 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-gray-800/90"
      >
        <span>{selectedBody?.name || 'Select Body'}</span>
        <span className="text-gray-400">{isOpen ? '▲' : '▼'}</span>
      </button>

      {isOpen && (
        <div className="mt-1 bg-gray-900/95 text-white rounded-lg shadow-lg overflow-hidden w-48 max-h-96 overflow-y-auto">
          {['star', 'planet', 'moon'].map((type) => (
            <div key={type}>
              <div className="px-3 py-1 bg-gray-800 text-xs uppercase text-gray-400 font-semibold sticky top-0">
                {type === 'star' ? 'Stars' : type === 'planet' ? 'Planets' : 'Moons'}
              </div>
              {ALL_BODIES.filter((b) => b.type === type).map((body) => (
                <button
                  key={body.id}
                  onClick={() => handleSelect(body.id)}
                  className={`w-full text-left px-3 py-2 hover:bg-blue-600 ${
                    selectedId === body.id ? 'bg-blue-700' : ''
                  }`}
                >
                  {body.name}
                </button>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}