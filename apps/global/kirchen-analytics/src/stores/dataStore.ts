import { create } from 'zustand';
import type { ObjectTreeNode } from '@/types';
import type { TimeSeriesPoint } from '@/types';
import type { TimeSeriesSeries } from '@/types';
import type { MeasuringPoint } from '@/types';

type ApiClientLike = {
  getObjectTree: (objectId: string | null) => Promise<ObjectTreeNode[]>;
  getChildren: (objectId: string, objectType: string, limit?: number, offset?: number, loadInputRef?: boolean) => Promise<unknown[]>;
  getDataForMeasuringPoint: (measuringPointId: string, timeFrom: string, timeTo: string, granularity?: string, timeZone?: string) => Promise<TimeSeriesPoint[]>;
};

interface DataStore {
  apiClient: ApiClientLike | null;
  objectTree: ObjectTreeNode[];
  /** Measuring points for selected objects (church + descendants) */
  measuringPointsForSelection: MeasuringPoint[];
  timeSeriesSeries: TimeSeriesSeries[];
  loading: boolean;
  error: string | null;

  setApiClient: (client: ApiClientLike | null) => void;
  setObjectTree: (tree: ObjectTreeNode[]) => void;
  setMeasuringPointsForSelection: (points: MeasuringPoint[]) => void;
  setTimeSeriesSeries: (series: TimeSeriesSeries[]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;

  fetchObjectTree: () => Promise<void>;
  fetchMeasuringPointsForObjects: (objectIds: string[]) => Promise<void>;
  fetchTimeSeriesDataForMeasuringPoints: (params: {
    measuringPointIds: { objectId: string; name: string; unit: string }[];
    timeFrom: string;
    timeTo: string;
    granularity: string;
    timeZone?: string;
  }) => Promise<void>;
  clearError: () => void;
}

async function getAttributeChildren(
  apiClient: ApiClientLike,
  objectId: string
): Promise<unknown[]> {
  const client = apiClient as Record<string, unknown>;
  const gc = client.getChildren as
    | ((id: string, type: string, limit?: number, offset?: number, loadInputRef?: boolean) => Promise<unknown[]>)
    | undefined;
  if (typeof gc === 'function') {
    return gc(objectId, 'attribute', 1000, 0, false);
  }
  const getToken = client.getAccessToken as ((this: unknown) => Promise<string>) | undefined;
  const token =
    typeof getToken === 'function' ? await getToken.call(client) : (client.accessToken as string) ?? '';
  const baseUrl = (
    (client.baseUrl as string) ??
    (window as { env?: { REACT_APP_BASE_URL?: string } }).env?.REACT_APP_BASE_URL ??
    ''
  ).replace(/\/v2\/?$/, '');
  if (!baseUrl || !token) return [];
  const url = `${baseUrl}/v2/children/${objectId}?object_type=attribute&limit=1000`;
  const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
  if (!res.ok) return [];
  const data = await res.json();
  return Array.isArray(data) ? data : [];
}

function toMeasuringPoint(raw: unknown): MeasuringPoint | null {
  const o = raw as { object_id?: string; parent_id?: string; payload?: { title?: string }; measurement?: { unit?: string } };
  if (!o?.object_id) return null;
  return {
    object_id: o.object_id,
    parent_id: o.parent_id,
    payload: o.payload,
    measurement: o.measurement,
    ...o,
  };
}

export const useDataStore = create<DataStore>((set, get) => ({
  apiClient: null,
  objectTree: [],
  measuringPointsForSelection: [],
  timeSeriesSeries: [],
  loading: false,
  error: null,

  setApiClient: (apiClient) => set({ apiClient }),
  setObjectTree: (objectTree) => set({ objectTree }),
  setMeasuringPointsForSelection: (measuringPointsForSelection) =>
    set({ measuringPointsForSelection }),
  setTimeSeriesSeries: (timeSeriesSeries) => set({ timeSeriesSeries }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),

  clearError: () => set({ error: null }),

  fetchObjectTree: async () => {
    const { apiClient } = get();
    if (!apiClient) return;
    set({ loading: true, error: null });
    try {
      const tree = await apiClient.getObjectTree(null);
      set({ objectTree: tree ?? [], loading: false });
    } catch (e) {
      set({
        error: e instanceof Error ? e.message : 'Failed to load object tree',
        loading: false,
      });
    }
  },

  fetchMeasuringPointsForObjects: async (objectIds: string[]) => {
    const { apiClient, objectTree } = get();
    if (!apiClient || objectIds.length === 0) {
      set({ measuringPointsForSelection: [] });
      return;
    }
    const collectDescendantIds = (
      nodes: ObjectTreeNode[],
      selected: string[]
    ): Set<string> => {
      const result = new Set<string>();
      const add = (n: ObjectTreeNode) => {
        result.add(n.object_id);
        n.children.forEach(add);
      };
      const walk = (items: ObjectTreeNode[]) => {
        for (const n of items) {
          if (selected.includes(n.object_id)) add(n);
          else walk(n.children);
        }
      };
      walk(nodes);
      return result;
    };
    const ids = Array.from(collectDescendantIds(objectTree, objectIds));
    const all: MeasuringPoint[] = [];
    for (const objectId of ids) {
      try {
        const children = await getAttributeChildren(apiClient, objectId);
        const list = Array.isArray(children) ? children : [];
        for (const c of list) {
          const mp = toMeasuringPoint(c);
          if (mp) all.push(mp);
        }
      } catch {
        /* skip */
      }
    }
    set({ measuringPointsForSelection: all });
  },

  fetchTimeSeriesDataForMeasuringPoints: async (params) => {
    const { apiClient } = get();
    if (!apiClient) return;
    const {
      measuringPointIds,
      timeFrom,
      timeTo,
      granularity,
      timeZone = 'Europe/Vienna',
    } = params;
    set({ loading: true, error: null });
    try {
      const series: TimeSeriesSeries[] = [];
      for (const { objectId, name, unit } of measuringPointIds) {
        const raw = await apiClient.getDataForMeasuringPoint(
          objectId,
          timeFrom,
          timeTo,
          granularity,
          timeZone
        );
        const data = (Array.isArray(raw) ? raw : []).map(
          (p: TimeSeriesPoint) => [p.ts, p.val] as [number, number]
        );
        series.push({
          id: objectId,
          name,
          parameterId: '',
          unit,
          color: '#2563eb',
          data,
        });
      }
      set({ timeSeriesSeries: series, loading: false });
    } catch (e) {
      set({
        error: e instanceof Error ? e.message : 'Failed to load time series data',
        loading: false,
        timeSeriesSeries: [],
      });
    }
  },
}));
