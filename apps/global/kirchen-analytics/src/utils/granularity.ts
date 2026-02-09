/**
 * Auto granularity for API based on selected date range.
 * Long range -> coarser granularity for performance.
 */

const MS_PER_DAY = 24 * 60 * 60 * 1000;
const DAYS_PER_YEAR = 365;
const DAYS_PER_MONTH = 30;

export type Granularity = 'PT15M' | 'PT1H' | 'P1D';

export function getGranularityForRange(from: Date, to: Date): Granularity {
  const ms = to.getTime() - from.getTime();
  const days = ms / MS_PER_DAY;
  if (days > DAYS_PER_YEAR) return 'P1D';
  if (days > DAYS_PER_MONTH) return 'PT1H';
  return 'PT15M';
}

export const DEFAULT_TIMEZONE = 'Europe/Vienna';
