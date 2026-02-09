import { useFilterStore } from '@/stores/filterStore';
import { PARAMETERS, PARAMETER_GROUPS } from '@/utils/parameters';

export function ParameterSelector() {
  const { selectedParameterIds, toggleParameter, clearParameterSelection } = useFilterStore();

  const byGroup = PARAMETERS.reduce(
    (acc, p) => {
      if (!acc[p.group]) acc[p.group] = [];
      acc[p.group].push(p);
      return acc;
    },
    {} as Record<string, typeof PARAMETERS>,
  );

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-[#333]">Parameter</label>
        <button type="button" onClick={clearParameterSelection} className="text-xs text-[#666] hover:underline">
          Löschen
        </button>
      </div>
      <div className="max-h-48 overflow-y-auto rounded border border-[#e3e3e3] bg-white shadow-[0_1px_2px_rgba(0,0,0,0.05)]">
        {(Object.keys(byGroup) as (keyof typeof PARAMETER_GROUPS)[]).map((group) => (
          <div key={group}>
            <div className="bg-[#e7e7e7] px-2 py-1 text-xs font-semibold text-[#333]">
              {PARAMETER_GROUPS[group]}
            </div>
            {byGroup[group].map((p) => (
              <label
                key={p.id}
                className="flex cursor-pointer items-center gap-2 border-b border-[#eee] px-2 py-1.5 last:border-0 hover:bg-[#f0f0f0]"
              >
                <input
                  type="checkbox"
                  checked={selectedParameterIds.includes(p.id)}
                  onChange={() => toggleParameter(p.id)}
                  className="rounded border-[#ccc]"
                />
                <span className="text-sm text-[#333]">{p.name}</span>
                {p.unit && <span className="text-xs text-[#666]">{p.unit}</span>}
              </label>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
