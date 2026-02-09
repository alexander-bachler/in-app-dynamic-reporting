import React from 'react';
import ReactECharts from 'echarts-for-react';
import { useDataStore } from '@/stores/dataStore';
import { getGranularityForRange } from '@/utils/granularity';
import { useFilterStore } from '@/stores/filterStore';

/**
 * Multi-parameter time series with dual Y-axis when two different parameters are present.
 */
export function MultiAxisChart() {
  const { timeSeriesSeries } = useDataStore();
  const { dateRange } = useFilterStore();

  const granularity = getGranularityForRange(dateRange.from, dateRange.to);

  const seriesByParam = timeSeriesSeries.reduce(
    (acc, s) => {
      if (!acc[s.parameterId]) acc[s.parameterId] = [];
      acc[s.parameterId].push(s);
      return acc;
    },
    {} as Record<string, typeof timeSeriesSeries>,
  );
  const paramIds = Object.keys(seriesByParam);

  const option: import('echarts').EChartsOption = {
    tooltip: { trigger: 'axis' },
    legend: { data: timeSeriesSeries.map((s) => s.name), bottom: 0 },
    grid: { left: '3%', right: '4%', bottom: '15%', top: '10%', containLabel: true },
    xAxis: { type: 'time' },
    yAxis:
      paramIds.length > 1
        ? [
            { type: 'value', name: timeSeriesSeries[0]?.unit ?? '', position: 'left' },
            { type: 'value', name: timeSeriesSeries.find((s) => s.parameterId !== paramIds[0])?.unit ?? '', position: 'right' },
          ]
        : { type: 'value' },
    dataZoom: [{ type: 'inside' }, { type: 'slider' }],
    toolbox: {
      feature: {
        saveAsImage: {},
        dataZoom: { yAxisIndex: 'none' },
        restore: {},
      },
    },
    series: timeSeriesSeries.map((s, i) => ({
      name: s.name,
      type: 'line',
      data: s.data,
      smooth: true,
      yAxisIndex: paramIds.length > 1 ? (s.parameterId === paramIds[0] ? 0 : 1) : undefined,
    })),
  };

  if (timeSeriesSeries.length === 0) {
    return (
      <div className="lm-panel flex h-80 items-center justify-center text-center text-[#666]">
        Mehrfach-Parameter: Mehrere Parameter wählen und Daten laden (Granularität: {granularity}).
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
