/**
 * Extensible parameter registry: API-sourced and calculated parameters.
 * Used for filter UI and mapping to chart series.
 */

import type { ParameterDefinition, ParameterGroup } from '../types';

export const PARAMETER_GROUPS: Record<ParameterGroup, string> = {
  base: 'Basis (API)',
  calculated: 'Berechnet',
  wind: 'Wind',
};

export const PARAMETERS: ParameterDefinition[] = [
  { id: 'temp', name: '01_Temperatur', unit: '°C', color: '#2563eb', group: 'base', source: 'api' },
  { id: 'rh', name: '02_r.LF', unit: '%', color: '#059669', group: 'base', source: 'api' },
  { id: 'ofl_t', name: '03_OFL-T', unit: '°C', color: '#7c3aed', group: 'base', source: 'api' },
  { id: 'saturation_pa', name: '04_Sättigungsdruck', unit: 'Pa', color: '#dc2626', group: 'calculated', source: 'calculated', calculationKey: 'saturationPressurePa' },
  { id: 'saturation_hpa', name: '05_WD Sättigungsdruck', unit: 'hPa', color: '#ea580c', group: 'calculated', source: 'calculated', calculationKey: 'saturationPressureHPa' },
  { id: 'max_feuchte', name: '06_max. Feuchte', unit: 'g/m³', color: '#ca8a04', group: 'calculated', source: 'calculated', calculationKey: 'maxHumidityGpm3' },
  { id: 'partial_hpa', name: '07_WD Partialdruck', unit: 'hPa', color: '#c026d3', group: 'calculated', source: 'calculated', calculationKey: 'partialPressureHPa' },
  { id: 'abs_feuchte', name: '08_Absolute Feuchte', unit: 'g/m³', color: '#0d9488', group: 'calculated', source: 'calculated', calculationKey: 'absoluteHumidityGpm3' },
  { id: 'taupunkt', name: '09_Taupunkt', unit: '°C', color: '#0369a1', group: 'calculated', source: 'calculated', calculationKey: 'dewPointCelsius' },
  { id: 'feuchtkugel', name: '10_Feuchtkugelt.', unit: '°C', color: '#4f46e5', group: 'calculated', source: 'calculated', calculationKey: 'wetBulbCelsius' },
  { id: 'aw', name: '11_aw-Wert', unit: '', color: '#65a30d', group: 'calculated', source: 'calculated', calculationKey: 'waterActivity' },
  { id: 'wind', name: '12_Windgeschwindigkeit', unit: 'm/s', color: '#0891b2', group: 'wind', source: 'api' },
  { id: 'wind_nord', name: '13_Nord-Windgeschwindigkeit', unit: 'm/s', color: '#0e7490', group: 'wind', source: 'api' },
  { id: 'wind_ost', name: '14_Ost-Windgeschwindigkeit', unit: 'm/s', color: '#155e75', group: 'wind', source: 'api' },
];

export function getParameterById(id: string): ParameterDefinition | undefined {
  return PARAMETERS.find((p) => p.id === id);
}

export function getParametersByGroup(group: ParameterGroup): ParameterDefinition[] {
  return PARAMETERS.filter((p) => p.group === group);
}

export function getCalculatedParameterIds(): string[] {
  return PARAMETERS.filter((p) => p.source === 'calculated').map((p) => p.id);
}

export function getApiParameterIds(): string[] {
  return PARAMETERS.filter((p) => p.source === 'api').map((p) => p.id);
}
