import { describe, it, expect, beforeEach } from 'vitest';
import { useSelectionStore } from './selectionStore';

describe('selectionStore', () => {
  beforeEach(() => {
    useSelectionStore.setState({
      selectedId: null,
      focusedId: null,
    });
  });

  it('has correct initial state', () => {
    const state = useSelectionStore.getState();
    expect(state.selectedId).toBeNull();
    expect(state.focusedId).toBeNull();
  });

  it('selects a body', () => {
    const { select } = useSelectionStore.getState();
    select('earth');
    expect(useSelectionStore.getState().selectedId).toBe('earth');
  });

  it('focuses a body', () => {
    const { focus } = useSelectionStore.getState();
    focus('mars');
    expect(useSelectionStore.getState().focusedId).toBe('mars');
  });

  it('clears selection', () => {
    const { select, clearSelection } = useSelectionStore.getState();
    select('earth');
    clearSelection();
    expect(useSelectionStore.getState().selectedId).toBeNull();
  });
});