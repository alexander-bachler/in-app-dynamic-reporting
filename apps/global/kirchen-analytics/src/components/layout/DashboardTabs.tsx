import { useState } from 'react';
import { KpiCards } from '../kpi/KpiCards';
import { TimeSeriesChart } from '../charts/TimeSeriesChart';
import { MultiAxisChart } from '../charts/MultiAxisChart';
import { ChurchMap } from '../map/ChurchMap';
import { useLoadTimeSeriesData } from '@/hooks/useTimeSeriesData';
import { useFilterStore } from '@/stores/filterStore';
import { useDataStore } from '@/stores/dataStore';

const TABS = [
  { id: 'dashboard', label: 'Dashboard' },
  { id: 'chart', label: 'Zeitreihen' },
  { id: 'multi', label: 'Mehrfach-Parameter' },
  { id: 'map', label: 'Karte' },
] as const;

export function DashboardTabs() {
  const [active, setActive] = useState<(typeof TABS)[number]['id']>('dashboard');
  const [mapKey, setMapKey] = useState(0);
  const loadData = useLoadTimeSeriesData();
  const selectedMeasuringPointIds = useFilterStore((s) => s.selectedMeasuringPointIds);
  const loading = useDataStore((s) => s.loading);

  const canLoad = selectedMeasuringPointIds.length > 0;

  const handleTabChange = (id: (typeof TABS)[number]['id']) => {
    if (id === 'map') setMapKey((k) => k + 1);
    setActive(id);
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-2 border-b border-[#dbdbdb] pb-3">
        <button
          type="button"
          onClick={() => loadData()}
          disabled={!canLoad || loading}
          className="btn-lm-success rounded px-4 py-2 text-sm font-medium disabled:opacity-50"
        >
          {loading ? 'Lade…' : 'Daten laden'}
        </button>
        {!canLoad && (
          <span className="text-sm text-[#666]">Objekte und Messpunkte wählen.</span>
        )}
      </div>
      <div className="flex gap-0 border-b border-[#dbdbdb]">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => handleTabChange(tab.id)}
            className={`px-4 py-2.5 text-sm font-medium transition-colors ${
              active === tab.id
                ? '-mb-px border border-[#dbdbdb] border-b-2 border-b-[#f8f8f8] bg-[#fefefe] text-[#333]'
                : 'border border-transparent bg-[#f0f0f0] text-[#333] hover:bg-[#e8e8e8]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
      {active === 'dashboard' && (
        <div className="space-y-4">
          <KpiCards />
          <TimeSeriesChart />
        </div>
      )}
      {active === 'chart' && <TimeSeriesChart />}
      {active === 'multi' && <MultiAxisChart />}
      {active === 'map' && <ChurchMap key={mapKey} />}
    </div>
  );
}
