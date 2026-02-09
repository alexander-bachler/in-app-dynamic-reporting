import { create } from 'zustand';
import type { DateRange, FilterState } from '@/types';

const defaultRange: DateRange = (() => {
  const to = new Date();
  const from = new Date();
  from.setMonth(from.getMonth() - 1);
  return { from, to };
})();

interface FilterStore extends FilterState {
  setDateRange: (range: DateRange) => void;
  setSelectedChurchIds: (ids: string[]) => void;
  setSelectedMeasuringPointIds: (ids: string[]) => void;
  setSelectedParameterIds: (ids: string[]) => void;
  toggleChurch: (id: string) => void;
  toggleMeasuringPoint: (id: string) => void;
  toggleParameter: (id: string) => void;
  clearChurchSelection: () => void;
  clearMeasuringPointSelection: () => void;
  clearParameterSelection: () => void;
  selectAllChurches: (allIds: string[]) => void;
}

export const useFilterStore = create<FilterStore>((set) => ({
  dateRange: defaultRange,
  selectedChurchIds: [],
  selectedMeasuringPointIds: [],
  selectedParameterIds: [],

  setDateRange: (range) => set({ dateRange: range }),
  setSelectedChurchIds: (ids) => set({ selectedChurchIds: ids }),
  setSelectedMeasuringPointIds: (ids) => set({ selectedMeasuringPointIds: ids }),
  setSelectedParameterIds: (ids) => set({ selectedParameterIds: ids }),

  toggleChurch: (id) =>
    set((s) => ({
      selectedChurchIds: s.selectedChurchIds.includes(id)
        ? s.selectedChurchIds.filter((x) => x !== id)
        : [...s.selectedChurchIds, id],
    })),
  toggleMeasuringPoint: (id) =>
    set((s) => ({
      selectedMeasuringPointIds: s.selectedMeasuringPointIds.includes(id)
        ? s.selectedMeasuringPointIds.filter((x) => x !== id)
        : [...s.selectedMeasuringPointIds, id],
    })),
  toggleParameter: (id) =>
    set((s) => ({
      selectedParameterIds: s.selectedParameterIds.includes(id)
        ? s.selectedParameterIds.filter((x) => x !== id)
        : [...s.selectedParameterIds, id],
    })),

  clearChurchSelection: () => set({ selectedChurchIds: [] }),
  clearMeasuringPointSelection: () => set({ selectedMeasuringPointIds: [] }),
  clearParameterSelection: () => set({ selectedParameterIds: [] }),

  selectAllChurches: (allIds) => set({ selectedChurchIds: allIds }),
}));
