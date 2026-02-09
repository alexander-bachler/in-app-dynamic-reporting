import React from 'react';
import ReactECharts from 'echarts-for-react';
import { useDataStore } from '@/stores/dataStore';
import { computeStatistics } from '@/utils/statistics';

export function TimeSeriesChart() {
  const { timeSeriesSeries } = useDataStore();

  const allValues = timeSeriesSeries.flatMap((s) => s.data.map(([, v]) => v));
  const stats = computeStatistics(allValues);

  const series: import('echarts').SeriesOption[] = timeSeriesSeries.map((s, idx) => {
    const base: import('echarts').SeriesOption = {
      name: s.name,
      type: 'line',
      data: s.data,
      smooth: true,
    };
    if (stats && idx === 0) {
      (base as import('echarts').LineSeriesOption).markLine = {
        data: [
          { type: 'average', name: 'Mittelwert' },
          { type: 'min', name: 'Min' },
          { type: 'max', name: 'Max' },
          { yAxis: stats.median, name: 'Median' },
        ],
        label: { formatter: '{b}: {c}' },
      };
    }
    return base;
  });

  const option: import('echarts').EChartsOption = {
    tooltip: { trigger: 'axis' },
    legend: { data: timeSeriesSeries.map((s) => s.name), bottom: 0 },
    grid: { left: '3%', right: '4%', bottom: '15%', top: '10%', containLabel: true },
    xAxis: { type: 'time' },
    yAxis: { type: 'value' },
    dataZoom: [{ type: 'inside' }, { type: 'slider' }],
    toolbox: {
      feature: {
        saveAsImage: {},
        dataZoom: { yAxisIndex: 'none' },
        restore: {},
      },
    },
    series,
  };

  if (timeSeriesSeries.length === 0) {
    return (
      <div className="lm-panel flex h-80 items-center justify-center text-[#666]">
        Keine Zeitreihen. Filter wählen und Daten laden.
      </div>
    );
  }

  return (
    <div className="lm-panel overflow-hidden p-2">
      <div className="h-80 w-full">
        <ReactECharts option={option} style={{ height: '100%', width: '100%' }} />
      </div>
    </div>
  );
}
