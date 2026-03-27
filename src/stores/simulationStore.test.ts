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