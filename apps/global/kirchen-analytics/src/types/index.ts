/**
 * Central type definitions for Kirchenklima Analytics.
 */

/** Object tree node (church, building, room, etc.) from getObjectTree() */
export interface ObjectTreeNode {
  object_id: string;
  title: string;
  custom_key: string;
  children: ObjectTreeNode[];
}

/** Device from getAllDevices() */
export interface Device {
  id: string;
  [key: string]: unknown;
}

/** Device input/channel from getInputsForDevice() */
export interface DeviceInput {
  id: string;
  [key: string]: unknown;
}

/** Measuring point (attribute) from v2/children?object_type=attribute */
export interface MeasuringPoint {
  object_id: string;
  parent_id?: string;
  payload?: { title?: string; type?: string };
  measurement?: { unit?: string };
  [key: string]: unknown;
}

/** Single time-series data point from API (getDataForInput / getDataForMeasuringPoint) */
export interface TimeSeriesPoint {
  ts: number;
  val: number;
  min?: number;
  max?: number;
}

/** Parameter source: from API or calculated client-side */
export type ParameterSource = 'api' | 'calculated';

/** Parameter group for UI grouping */
export type ParameterGroup = 'base' | 'calculated' | 'wind';

/** Key of a single-value calculation function in utils/calculations */
export type CalculationKey =
  | 'saturationPressurePa'
  | 'saturationPressureHPa'
  | 'partialPressureHPa'
  | 'maxHumidityGpm3'
  | 'absoluteHumidityGpm3'
  | 'dewPointCelsius'
  | 'wetBulbCelsius'
  | 'waterActivity';

/** Parameter definition in the registry */
export interface ParameterDefinition {
  id: string;
  name: string;
  unit: string;
  color: string;
  group: ParameterGroup;
  source: ParameterSource;
  /** For calculated params: key of the calculation function */
  calculationKey?: CalculationKey;
}

/** Date range for filters */
export interface DateRange {
  from: Date;
  to: Date;
}

/** Filter state (Zustand store) */
export interface FilterState {
  dateRange: DateRange;
  selectedChurchIds: string[];
  selectedMeasuringPointIds: string[];
  selectedParameterIds: string[];
}

/** Time-series series for charts (one per device/input or measuring point) */
export interface TimeSeriesSeries {
  id: string;
  name: string;
  parameterId: string;
  unit: string;
  color: string;
  data: [number, number][]; // [timestamp, value]
}

/** KPI statistics */
export interface Statistics {
  min: number;
  max: number;
  mean: number;
  median: number;
}
