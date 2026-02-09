import { useFilterStore } from '@/stores/filterStore';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

export function TimeRangeSelector() {
  const { dateRange, setDateRange } = useFilterStore();

  const setFrom = (d: Date | null) => d && setDateRange({ ...dateRange, from: d });
  const setTo = (d: Date | null) => d && setDateRange({ ...dateRange, to: d });

  const presets = [
    { label: '7 Tage', days: 7 },
    { label: '1 Monat', days: 30 },
    { label: '1 Jahr', days: 365 },
  ];

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-[#333]">Zeitraum</label>
      <div className="flex flex-col gap-2">
        <DatePicker
          selected={dateRange.from}
          onChange={setFrom}
          selectsStart
          startDate={dateRange.from}
          endDate={dateRange.to}
          className="w-full rounded border border-[#ccc] bg-white px-2 py-1.5 text-sm text-[#333]"
          dateFormat="dd.MM.yyyy"
        />
        <DatePicker
          selected={dateRange.to}
          onChange={setTo}
          selectsEnd
          startDate={dateRange.from}
          endDate={dateRange.to}
          minDate={dateRange.from}
          className="w-full rounded border border-[#ccc] bg-white px-2 py-1.5 text-sm text-[#333]"
          dateFormat="dd.MM.yyyy"
        />
        <div className="flex flex-wrap gap-1">
          {presets.map(({ label, days }) => (
            <button
              key={label}
              type="button"
              onClick={() => {
                const to = new Date();
                const from = new Date();
                from.setDate(from.getDate() - days);
                setDateRange({ from, to });
              }}
              className="btn-lm-primary rounded px-2 py-1 text-xs"
            >
              {label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
