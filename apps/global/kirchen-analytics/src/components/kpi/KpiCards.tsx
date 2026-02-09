import { useDataStore } from '@/stores/dataStore';
import { statisticsFromTimeSeries } from '@/utils/statistics';

export function KpiCards() {
  const { timeSeriesSeries } = useDataStore();
  const allPoints = timeSeriesSeries.flatMap((s) => s.data.map(([ts, val]) => ({ ts, val })));
  const stats = statisticsFromTimeSeries(allPoints);

  if (!stats) {
    return (
      <div className="lm-panel p-4 text-[#666]">
        Keine Daten. Bitte Objekte, Messpunkte wählen und Daten laden.
      </div>
    );
  }

  const cards = [
    { label: 'Min', value: stats.min.toFixed(2) },
    { label: 'Max', value: stats.max.toFixed(2) },
    { label: 'Mittelwert', value: stats.mean.toFixed(2) },
    { label: 'Median', value: stats.median.toFixed(2) },
  ];

  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
      {cards.map(({ label, value }) => (
        <div key={label} className="lm-panel overflow-hidden">
          <div className="lm-panel-heading">{label}</div>
          <div className="p-4 text-xl font-semibold text-[#333]">{value}</div>
        </div>
      ))}
    </div>
  );
}
