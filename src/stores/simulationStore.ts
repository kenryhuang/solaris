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
  rotationTime: 0,
};

export const useSimulationStore = create<SimulationState & SimulationActions>((set, get) => ({
  // State
  timeScale: DEFAULT_CONFIG.timeScale,
  rotationMultiplier: DEFAULT_CONFIG.rotationMultiplier,
  orbitMultiplier: DEFAULT_CONFIG.orbitMultiplier,
  isPaused: DEFAULT_CONFIG.isPaused,
  elapsedTime: DEFAULT_CONFIG.elapsedTime,
  rotationTime: DEFAULT_CONFIG.rotationTime,

  // Actions
  setTimeScale: (scale) => set({ timeScale: Math.max(0.01, Math.min(100, scale)) }),
  setRotationMultiplier: (multiplier) => set({ rotationMultiplier: multiplier }),
  setOrbitMultiplier: (multiplier) => set({ orbitMultiplier: multiplier }),
  togglePause: () => set((state) => ({ isPaused: !state.isPaused })),
  advanceTime: (deltaSeconds) => {
    const state = get();
    if (state.isPaused) return;

    // Both clocks are expressed in *simulated days* and are advanced from the
    // same real-time delta through the same `timeScale`. That shared time base
    // is what keeps self-rotation synchronised with orbital revolution:
    // 1 simulated day always equals 1 Earth turn *and* 1/365.256 of its orbit,
    // independent of frame rate, pause state or the days-per-second setting.
    // `rotationMultiplier` / `orbitMultiplier` remain user-facing exaggeration
    // knobs and default to 1, i.e. physically faithful.
    const simulatedDays = deltaSeconds * state.timeScale;

    set({
      elapsedTime: state.elapsedTime + simulatedDays * state.orbitMultiplier,
      rotationTime: state.rotationTime + simulatedDays * state.rotationMultiplier,
    });
  },
  resetTime: () => set({ elapsedTime: 0, rotationTime: 0 }),
}));