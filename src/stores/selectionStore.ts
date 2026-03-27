import { create } from 'zustand';
import type { SelectionState } from '../types/celestial';

interface SelectionActions {
  select: (id: string | null) => void;
  focus: (id: string | null) => void;
  clearSelection: () => void;
}

export const useSelectionStore = create<SelectionState & SelectionActions>((set) => ({
  // State
  selectedId: null,
  focusedId: null,

  // Actions
  select: (id) => set({ selectedId: id }),
  focus: (id) => set({ focusedId: id }),
  clearSelection: () => set({ selectedId: null, focusedId: null }),
}));