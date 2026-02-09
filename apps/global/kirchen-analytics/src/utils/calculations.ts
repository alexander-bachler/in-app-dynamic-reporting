/**
 * Client-side calculations for derived climate parameters from temperature and relative humidity.
 * Formulas based on standard meteorological and building physics (Magnus, etc.).
 */

/** Saturation vapour pressure in Pa (Magnus formula) */
export function saturationPressurePa(tempCelsius: number): number {
  return 611.2 * Math.exp((17.62 * tempCelsius) / (243.12 + tempCelsius));
}

/** Saturation vapour pressure in hPa */
export function saturationPressureHPa(tempCelsius: number): number {
  return saturationPressurePa(tempCelsius) / 100;
}

/** Partial pressure (vapour pressure) in Pa from RH and temperature */
export function partialPressurePa(tempCelsius: number, rhPercent: number): number {
  return (rhPercent / 100) * saturationPressurePa(tempCelsius);
}

/** Partial pressure in hPa */
export function partialPressureHPa(tempCelsius: number, rhPercent: number): number {
  return partialPressurePa(tempCelsius, rhPercent) / 100;
}

/** Maximum absolute humidity (saturation) in g/m³ */
export function maxAbsoluteHumidityGpm3(tempCelsius: number): number {
  const Rv = 461.495; // J/(kg·K)
  const pSat = saturationPressurePa(tempCelsius);
  const T = tempCelsius + 273.15;
  return (pSat * 1000) / (Rv * T); // approx * 1e6/1e3 for g/m³ -> pSat/(Rv*T) * 1e3
}
// Simpler approximation: ρ = 0.216 * pSat / (T) with pSat in hPa, T in K -> g/m³
const Rv = 461.5;
export function maxHumidityGpm3(tempCelsius: number): number {
  const pSat = saturationPressurePa(tempCelsius);
  const T = tempCelsius + 273.15;
  return (1e3 * pSat) / (Rv * T);
}

/** Absolute humidity in g/m³ from temperature and RH (Magnus-based) */
export function absoluteHumidityGpm3(tempCelsius: number, rhPercent: number): number {
  return (rhPercent / 100) * maxHumidityGpm3(tempCelsius);
}

/** Dew point in °C (approximation) */
export function dewPointCelsius(tempCelsius: number, rhPercent: number): number {
  const a = 17.27;
  const b = 237.7;
  const alpha = Math.log(rhPercent / 100) + (a * tempCelsius) / (b + tempCelsius);
  return (b * alpha) / (a - alpha);
}

/** Wet-bulb temperature in °C (approximation; iterative solution simplified) */
export function wetBulbCelsius(tempCelsius: number, rhPercent: number): number {
  const tw = tempCelsius - (1 - rhPercent / 100) * (tempCelsius - 14) * 0.2;
  return Math.max(-20, Math.min(60, tw));
}

/** Water activity aw (0–1) from RH: aw ≈ RH/100 */
export function waterActivity(rhPercent: number): number {
  return Math.min(1, Math.max(0, rhPercent / 100));
}

/** Calculate all derived values for a single (T, RH) point */
export function derivedValues(tempCelsius: number, rhPercent: number) {
  return {
    saturationPressurePa: saturationPressurePa(tempCelsius),
    saturationPressureHPa: saturationPressureHPa(tempCelsius),
    partialPressurePa: partialPressurePa(tempCelsius, rhPercent),
    partialPressureHPa: partialPressureHPa(tempCelsius, rhPercent),
    maxHumidityGpm3: maxHumidityGpm3(tempCelsius),
    absoluteHumidityGpm3: absoluteHumidityGpm3(tempCelsius, rhPercent),
    dewPointCelsius: dewPointCelsius(tempCelsius, rhPercent),
    wetBulbCelsius: wetBulbCelsius(tempCelsius, rhPercent),
    waterActivity: waterActivity(rhPercent),
  };
}
