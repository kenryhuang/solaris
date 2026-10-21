import { describe, it, expect, beforeEach } from 'vitest';
import { useSimulationStore } from './simulationStore';

describe('simulationStore', () => {
  beforeEach(() => {
    // Reset store to initial state
    useSimulationStore.setState({
      timeScale: 0.1,
      rotationMultiplier: 1,
      orbitMultiplier: 1,
      isPaused: false,
      elapsedTime: 0,
      rotationTime: 0,
    });
  });

  it('has correct initial state', () => {
    const state = useSimulationStore.getState();
    expect(state.timeScale).toBe(0.1);
    expect(state.rotationMultiplier).toBe(1);
    expect(state.orbitMultiplier).toBe(1);
    expect(state.isPaused).toBe(false);
    expect(state.elapsedTime).toBe(0);
  });

  it('sets time scale', () => {
    const { setTimeScale } = useSimulationStore.getState();
    setTimeScale(5);
    expect(useSimulationStore.getState().timeScale).toBe(5);
  });

  it('toggles pause', () => {
    const { togglePause } = useSimulationStore.getState();
    expect(useSimulationStore.getState().isPaused).toBe(false);
    togglePause();
    expect(useSimulationStore.getState().isPaused).toBe(true);
    togglePause();
    expect(useSimulationStore.getState().isPaused).toBe(false);
  });

  it('advances time', () => {
    const { advanceTime } = useSimulationStore.getState();
    advanceTime(1); // 1 second at 0.1 days/sec = 0.1 days
    expect(useSimulationStore.getState().elapsedTime).toBeCloseTo(0.1, 5);
  });

  it('does not advance time when paused', () => {
    const { togglePause, advanceTime } = useSimulationStore.getState();
    togglePause();
    advanceTime(1);
    expect(useSimulationStore.getState().elapsedTime).toBe(0);
  });
});

describe('simulationStore rotation/revolution synchronisation', () => {
  beforeEach(() => {
    useSimulationStore.setState({
      timeScale: 0.1,
      rotationMultiplier: 1,
      orbitMultiplier: 1,
      isPaused: false,
      elapsedTime: 0,
      rotationTime: 0,
    });
  });

  it('advances the rotation clock on the same day-based time base as the orbit clock', () => {
    const { advanceTime } = useSimulationStore.getState();
    advanceTime(1); // 1 real second at 0.1 days/sec = 0.1 simulated days
    const state = useSimulationStore.getState();
    expect(state.rotationTime).toBeCloseTo(0.1, 5);
    expect(state.rotationTime).toBeCloseTo(state.elapsedTime, 10);
  });

  it('keeps both clocks in lockstep across many frames at any frame rate', () => {
    const { advanceTime } = useSimulationStore.getState();
    // 60 fps for 10 real seconds
    for (let i = 0; i < 600; i++) advanceTime(1 / 60);
    const state = useSimulationStore.getState();
    expect(state.elapsedTime).toBeCloseTo(1, 5);   // 10 s * 0.1 days/s
    expect(state.rotationTime).toBeCloseTo(1, 5);  // identical time base
  });

  it('scales both clocks together when the days/sec setting changes', () => {
    const { setTimeScale, advanceTime } = useSimulationStore.getState();
    setTimeScale(10);
    advanceTime(1);
    const state = useSimulationStore.getState();
    expect(state.elapsedTime).toBeCloseTo(10, 5);
    expect(state.rotationTime).toBeCloseTo(10, 5);
  });

  it('does not advance the rotation clock while paused', () => {
    const { togglePause, advanceTime } = useSimulationStore.getState();
    togglePause();
    advanceTime(1);
    expect(useSimulationStore.getState().rotationTime).toBe(0);
  });

  it('resets both clocks together', () => {
    const { advanceTime, resetTime } = useSimulationStore.getState();
    advanceTime(5);
    resetTime();
    const state = useSimulationStore.getState();
    expect(state.elapsedTime).toBe(0);
    expect(state.rotationTime).toBe(0);
  });
});
