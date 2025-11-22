/**
 * Climate Math Utilities for Church Climate Monitoring
 * Implements physical calculations for temperature, humidity, and material protection
 */

/**
 * Calculate absolute humidity using Magnus formula
 * Used for: Indoor vs Outdoor ventilation decision (dew point ventilation)
 *
 * @param {number} temp - Temperature in Celsius
 * @param {number} rh - Relative humidity in percent (0-100)
 * @returns {number} Absolute humidity in g/m³
 */
export function calculateAbsoluteHumidity(temp, rh) {
    const mw = 18.016; // Molecular weight of water vapor (g/mol)
    const r = 8314.3;  // Universal gas constant (J/(kmol·K))
    const tk = temp + 273.15; // Temperature in Kelvin

    // Saturation vapor pressure (hPa) - Magnus formula
    let a, b;
    if (temp >= 0) {
        a = 7.5;
        b = 237.3;
    } else {
        a = 7.6;
        b = 240.7;
    }

    const sdd = 6.1078 * Math.pow(10, (a * temp) / (b + temp));

    // Actual vapor pressure
    const dd = (rh / 100) * sdd;

    // Absolute humidity in g/m³
    const absoluteHumidity = (100000 * mw * dd) / (r * tk);

    return absoluteHumidity;
}

/**
 * Calculate dew point temperature
 * Used for: Condensation risk assessment on cold surfaces (walls, windows)
 *
 * @param {number} temp - Temperature in Celsius
 * @param {number} rh - Relative humidity in percent (0-100)
 * @returns {number} Dew point temperature in Celsius
 */
export function calculateDewPoint(temp, rh) {
    const a = 17.27;
    const b = 237.7;

    const alpha = ((a * temp) / (b + temp)) + Math.log(rh / 100);
    const dewPoint = (b * alpha) / (a - alpha);

    return dewPoint;
}

/**
 * Calculate Equilibrium Moisture Content (EMC) for wood
 * Used for: Organ protection - warning against cracks (too dry) or swelling (too humid)
 * Based on simplified Hailwood-Horrobin model
 *
 * @param {number} temp - Temperature in Celsius
 * @param {number} rh - Relative humidity in percent (0-100)
 * @returns {number} EMC in percent
 */
export function calculateEMC(temp, rh) {
    // Simplified EMC calculation for spruce wood (common in organs)
    // Based on empirical forest products laboratory data

    // Convert to decimal
    const rhDecimal = rh / 100;

    // Avoid division by zero
    if (rhDecimal >= 0.99) return 30; // Maximum EMC
    if (rhDecimal <= 0.01) return 0;  // Minimum EMC

    // Simplified Hailwood-Horrobin equation
    const k = 0.791 + 0.000463 * rh - 0.000000844 * Math.pow(rh, 2);
    const k1 = 6.34 + 0.000775 * rh - 0.0000935 * Math.pow(rh, 2);
    const k2 = 1.09 + 0.0284 * rh - 0.0000904 * Math.pow(rh, 2);

    // Temperature correction factor
    const tempCorrection = 1 - 0.0025 * (temp - 20);

    // Simplified EMC formula
    const w = 330 + 0.452 * rh + 0.00415 * Math.pow(rh, 2);
    const emc = (1800 / w) * (k * rhDecimal) / (1 - k * rhDecimal) +
                (k1 * k * rhDecimal + 2 * k1 * k2 * Math.pow(k * rhDecimal, 2)) /
                (1 + k1 * k * rhDecimal + k1 * k2 * Math.pow(k * rhDecimal, 2));

    return emc * tempCorrection * 100; // Convert to percentage
}

/**
 * Calculate salt crystallization risk
 * Used for: Masonry protection - avoiding salt crystallization phases
 *
 * @param {number} rh - Relative humidity in percent (0-100)
 * @returns {object} Risk assessment with phase information
 */
export function calculateSaltRisk(rh) {
    const risks = [];

    // Critical RH values for common salts in church masonry
    const saltThresholds = {
        sodiumChloride: { threshold: 75.5, name: 'Natriumchlorid (Kochsalz)', phase: 'Kristallisation' },
        sodiumNitrate: { threshold: 74.0, name: 'Natriumnitrat', phase: 'Kristallisation' },
        sodiumSulfate: { threshold: 84.0, name: 'Natriumsulfat (Glaubersalz)', phase: 'Kristallisation' },
        magnesiumChloride: { threshold: 33.0, name: 'Magnesiumchlorid', phase: 'Dauerhaft gelöst' }
    };

    let overallRisk = 'niedrig';

    // Check each salt threshold
    Object.entries(saltThresholds).forEach(([key, salt]) => {
        if (rh >= salt.threshold - 5 && rh <= salt.threshold + 5) {
            risks.push({
                salt: salt.name,
                status: 'kritisch',
                message: `RH nahe ${salt.threshold}% - ${salt.phase} möglich`
            });
            overallRisk = 'hoch';
        } else if (rh > salt.threshold + 5) {
            risks.push({
                salt: salt.name,
                status: 'gelöst',
                message: `Salz gelöst (RH > ${salt.threshold}%)`
            });
        }
    });

    // Check for phase transition risk (cycling around threshold)
    if (rh >= 70 && rh <= 80) {
        overallRisk = overallRisk === 'hoch' ? 'hoch' : 'mittel';
    }

    return {
        overallRisk,
        relativeHumidity: rh,
        risks,
        recommendation: overallRisk === 'hoch'
            ? 'Klimastabilisierung empfohlen - Phasenwechsel vermeiden'
            : overallRisk === 'mittel'
            ? 'Klimaüberwachung erforderlich'
            : 'Klimabedingungen stabil'
    };
}

/**
 * Calculate mold risk according to Sedlbauer isopleth model
 * Used for: Sedlbauer Monitor widget
 *
 * @param {number} temp - Temperature in Celsius
 * @param {number} rh - Relative humidity in percent (0-100)
 * @param {number} substratClass - Substrate class (0=optimal, 1=medium, 2=poor)
 * @returns {object} Mold risk assessment
 */
export function calculateMoldRisk(temp, rh, substratClass = 1) {
    // Simplified LIM (Lowest Isopleth for Mold) curves
    // Based on Sedlbauer model for substrate class I and II

    let limThreshold;

    if (substratClass === 0) {
        // Substrate class 0 (optimal for mold - biologically degradable)
        limThreshold = 80;
    } else if (substratClass === 1) {
        // Substrate class I (medium - e.g., plaster, wood)
        if (temp < 0) limThreshold = 100;
        else if (temp < 10) limThreshold = 85 - (temp * 0.5);
        else if (temp < 20) limThreshold = 80;
        else if (temp <= 30) limThreshold = 78 + (temp - 20) * 0.2;
        else limThreshold = 100;
    } else {
        // Substrate class II (poor - mineral substrates)
        if (temp < 0) limThreshold = 100;
        else if (temp < 10) limThreshold = 90 - (temp * 0.3);
        else if (temp < 20) limThreshold = 87;
        else if (temp <= 30) limThreshold = 85 + (temp - 20) * 0.3;
        else limThreshold = 100;
    }

    const isMoldRisk = rh >= limThreshold;
    const safetyMargin = limThreshold - rh;

    return {
        isMoldRisk,
        currentRH: rh,
        limThreshold,
        safetyMargin,
        riskLevel: isMoldRisk ? 'hoch' : safetyMargin < 5 ? 'mittel' : 'niedrig',
        recommendation: isMoldRisk
            ? 'ACHTUNG: Schimmelrisiko! Lüften oder Heizen erforderlich'
            : safetyMargin < 5
            ? 'Grenzbereich - Klimaüberwachung empfohlen'
            : 'Klima im sicheren Bereich'
    };
}

/**
 * Determine ventilation recommendation
 * Used for: Intelligent ventilation decision widget (traffic light)
 *
 * @param {number} indoorTemp - Indoor temperature in Celsius
 * @param {number} indoorRH - Indoor relative humidity in percent
 * @param {number} outdoorTemp - Outdoor temperature in Celsius
 * @param {number} outdoorRH - Outdoor relative humidity in percent
 * @param {number} buffer - Safety buffer for absolute humidity difference in g/m³
 * @returns {object} Ventilation recommendation
 */
export function getVentilationRecommendation(indoorTemp, indoorRH, outdoorTemp, outdoorRH, buffer = 0.5) {
    const indoorAH = calculateAbsoluteHumidity(indoorTemp, indoorRH);
    const outdoorAH = calculateAbsoluteHumidity(outdoorTemp, outdoorRH);

    const difference = indoorAH - outdoorAH;

    let recommendation, color, action;

    if (difference > buffer) {
        // Outdoor air is drier - ventilation reduces indoor humidity
        recommendation = 'Lüften empfohlen';
        color = 'green';
        action = 'Fenster öffnen oder "Heiliges-Geist-Loch" nutzen';
    } else if (difference < -buffer) {
        // Outdoor air is more humid - ventilation increases indoor humidity
        recommendation = 'Nicht lüften';
        color = 'red';
        action = 'Fenster geschlossen halten';
    } else {
        // Similar humidity levels
        recommendation = 'Neutral';
        color = 'yellow';
        action = 'Kurzes Lüften möglich, aber kaum Effekt';
    }

    return {
        recommendation,
        color,
        action,
        indoorAH: indoorAH.toFixed(2),
        outdoorAH: outdoorAH.toFixed(2),
        difference: difference.toFixed(2)
    };
}

/**
 * Check if climate is within organ protection corridor
 * Used for: Organ protection widget
 *
 * @param {number} temp - Temperature in Celsius
 * @param {number} rh - Relative humidity in percent (0-100)
 * @returns {object} Organ protection assessment
 */
export function checkOrganProtection(temp, rh) {
    // Typical climate corridor for pipe organs
    const tempMin = 8;
    const tempMax = 20;
    const rhMin = 50;
    const rhMax = 70;

    const tempInRange = temp >= tempMin && temp <= tempMax;
    const rhInRange = rh >= rhMin && rh <= rhMax;
    const inCorridor = tempInRange && rhInRange;

    let risk = 'niedrig';
    let warning = '';

    if (!tempInRange) {
        if (temp < tempMin) {
            warning = `Temperatur zu niedrig (${temp.toFixed(1)}°C < ${tempMin}°C)`;
            risk = 'mittel';
        } else {
            warning = `Temperatur zu hoch (${temp.toFixed(1)}°C > ${tempMax}°C) - Verstimmung möglich`;
            risk = 'mittel';
        }
    }

    if (!rhInRange) {
        if (rh < rhMin) {
            warning += (warning ? ' | ' : '') + `Luftfeuchte zu niedrig (${rh.toFixed(1)}% < ${rhMin}%) - Rissbildung möglich`;
            risk = 'hoch';
        } else {
            warning += (warning ? ' | ' : '') + `Luftfeuchte zu hoch (${rh.toFixed(1)}% > ${rhMax}%) - Quellung möglich`;
            risk = 'hoch';
        }
    }

    return {
        inCorridor,
        risk,
        warning: warning || 'Klima im optimalen Bereich',
        temperature: temp,
        relativeHumidity: rh,
        corridor: {
            temp: `${tempMin}-${tempMax}°C`,
            rh: `${rhMin}-${rhMax}%`
        }
    };
}
