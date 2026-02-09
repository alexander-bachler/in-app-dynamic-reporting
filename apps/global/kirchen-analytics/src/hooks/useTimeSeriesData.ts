import { useEffect } from 'react';
import { useFilterStore } from '@/stores/filterStore';
import { useDataStore } from '@/stores/dataStore';
import { getGranularityForRange, DEFAULT_TIMEZONE } from '@/utils/granularity';

/** When selected objects (churches) change, fetch measuring points for those objects. */
export function useMeasuringPointsForChurches() {
  const selectedChurchIds = useFilterStore((s) => s.selectedChurchIds);
  const fetchMeasuringPointsForObjects = useDataStore(
    (s) => s.fetchMeasuringPointsForObjects
  );

  useEffect(() => {
    fetchMeasuringPointsForObjects(selectedChurchIds);
  }, [selectedChurchIds, fetchMeasuringPointsForObjects]);
}

/** Load time-series data for selected measuring points. Call from "Daten laden" button. */
export function useLoadTimeSeriesData() {
  const { dateRange, selectedMeasuringPointIds } = useFilterStore();
  const { measuringPointsForSelection, fetchTimeSeriesDataForMeasuringPoints } =
    useDataStore();

  return async () => {
    if (selectedMeasuringPointIds.length === 0) return;

    const granularity = getGranularityForRange(dateRange.from, dateRange.to);
    const timeFrom = String(dateRange.from.getTime());
    const timeTo = String(dateRange.to.getTime());

    const measuringPointIds = selectedMeasuringPointIds
      .map((id) => measuringPointsForSelection.find((mp) => mp.object_id === id))
      .filter((mp): mp is NonNullable<typeof mp> => mp != null)
      .map((mp) => ({
        objectId: mp.object_id,
        name: mp.payload?.title ?? mp.object_id,
        unit: mp.measurement?.unit ?? '',
      }));

    if (measuringPointIds.length === 0) return;

    await fetchTimeSeriesDataForMeasuringPoints({
      measuringPointIds,
      timeFrom,
      timeTo,
      granularity,
      timeZone: DEFAULT_TIMEZONE,
    });
  };
}
