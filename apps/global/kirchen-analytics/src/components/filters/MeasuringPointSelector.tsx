import { useFilterStore } from '@/stores/filterStore';
import { useDataStore } from '@/stores/dataStore';
import type { ObjectTreeNode } from '@/types';
import type { MeasuringPoint } from '@/types';

function buildIdToTitle(nodes: ObjectTreeNode[]): Map<string, string> {
  const m = new Map<string, string>();
  const walk = (list: ObjectTreeNode[]) => {
    for (const n of list) {
      m.set(n.object_id, n.title);
      walk(n.children);
    }
  };
  walk(nodes);
  return m;
}

function getMeasuringPointName(mp: MeasuringPoint, idToTitle: Map<string, string>): string {
  const title = mp.payload?.title ?? idToTitle.get(mp.object_id);
  return title ?? mp.object_id;
}

export function MeasuringPointSelector() {
  const { objectTree, measuringPointsForSelection } = useDataStore();
  const {
    selectedChurchIds,
    selectedMeasuringPointIds,
    toggleMeasuringPoint,
    clearMeasuringPointSelection,
  } = useFilterStore();
  const idToTitle = buildIdToTitle(objectTree);

  if (selectedChurchIds.length === 0) {
    return (
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-[#333]">Messpunkte</label>
        </div>
        <div className="max-h-40 overflow-y-auto rounded border border-[#e3e3e3] bg-white p-3 text-sm text-[#666] shadow-[0_1px_2px_rgba(0,0,0,0.05)]">
          Bitte zuerst Objekt(e) auswählen.
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-[#333]">Messpunkte</label>
        <button
          type="button"
          onClick={clearMeasuringPointSelection}
          className="text-xs text-[#666] hover:underline"
        >
          Löschen
        </button>
      </div>
      <div className="max-h-48 overflow-y-auto rounded border border-[#e3e3e3] bg-white shadow-[0_1px_2px_rgba(0,0,0,0.05)]">
        {measuringPointsForSelection.length === 0 ? (
          <p className="p-2 text-sm text-[#666]">Keine Messpunkte unter den gewählten Objekten.</p>
        ) : (
          measuringPointsForSelection.map((mp) => {
            const name = getMeasuringPointName(mp, idToTitle);
            const unit = mp.measurement?.unit ? ` (${mp.measurement.unit})` : '';
            const label = `${name}${unit}`;
            return (
              <label
                key={mp.object_id}
                className="flex cursor-pointer items-center gap-2 border-b border-[#eee] px-2 py-1.5 last:border-0 hover:bg-[#f0f0f0]"
              >
                <input
                  type="checkbox"
                  checked={selectedMeasuringPointIds.includes(mp.object_id)}
                  onChange={() => toggleMeasuringPoint(mp.object_id)}
                  className="rounded border-[#ccc]"
                />
                <span className="text-sm text-[#333]">{label}</span>
              </label>
            );
          })
        )}
      </div>
    </div>
  );
}
