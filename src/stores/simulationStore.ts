import { create } from 'zustand';
import type { SimulationState } from '../types/celestial';

interface SimulationActions {
  setTimeScale: (scale: number) => void;
  setRotationMultiplier: (multiplier: number) => void;
  setOrbitMultiplier: (multiplier: number) => void;
  togglePause: () => void;
  advanceTime: (deltaSeconds: number) => void;
  resetTime: () => void;
}

const DEFAULT_CONFIG = {
  timeScale: 0.1,              // Days per second
  rotationMultiplier: 1,
  orbitMultiplier: 1,
  isPaused: false,
  elapsedTime: 0,
};

export const useSimulationStore = create<SimulationState & SimulationActions>((set, get) => ({
  // State
  timeScale: DEFAULT_CONFIG.timeScale,
  rotationMultiplier: DEFAULT_CONFIG.rotationMultiplier,
  orbitMultiplier: DEFAULT_CONFIG.orbitMultiplier,
  isPaused: DEFAULT_CONFIG.isPaused,
  elapsedTime: DEFAULT_CONFIG.elapsedTime,

  // Actions
  setTimeScale: (scale) => set({ timeScale: Math.max(0.01, Math.min(100, scale)) }),
  setRotationMultiplier: (multiplier) => set({ rotationMultiplier: multiplier }),
  setOrbitMultiplier: (multiplier) => set({ orbitMultiplier: multiplier }),
  togglePause: () => set((state) => ({ isPaused: !state.isPaused })),
  advanceTime: (deltaSeconds) => {
    const state = get();
    if (state.isPaused) return;
    set({ elapsedTime: state.elapsedTime + deltaSeconds * state.timeScale * state.orbitMultiplier });
  },
  resetTime: () => set({ elapsedTime: 0 }),
}));