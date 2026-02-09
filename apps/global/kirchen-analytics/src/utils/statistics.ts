/**
 * Min, max, mean, median from time-series values.
 */

import type { Statistics, TimeSeriesPoint } from '../types';

export function computeStatistics(values: number[]): Statistics | null {
  if (values.length === 0) return null;
  const sorted = [...values].sort((a, b) => a - b);
  const sum = values.reduce((s, v) => s + v, 0);
  const min = sorted[0]!;
  const max = sorted[sorted.length - 1]!;
  const mean = sum / values.length;
  const mid = Math.floor(sorted.length / 2);
  const median = sorted.length % 2 === 0 ? (sorted[mid - 1]! + sorted[mid]!) / 2 : sorted[mid]!;
  return { min, max, mean, median };
}

export function statisticsFromTimeSeries(points: TimeSeriesPoint[]): Statistics | null {
  const values = points.map((p) => p.val).filter((v) => typeof v === 'number' && !Number.isNaN(v));
  return computeStatistics(values);
}
