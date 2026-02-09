// Mock-Daten für Demo der Kirchenklima App

// Generiere realistische Klimadaten für die letzten 30 Tage
const generateClimateData = (baseTemp, baseHumidity, variance = 2, days = 30) => {
    const data = [];
    const now = new Date();
    
    for (let i = days; i >= 0; i--) {
        const timestamp = new Date(now.getTime() - (i * 24 * 60 * 60 * 1000));
        
        // Tägliche und stündliche Schwankungen simulieren
        const dayOfYear = Math.floor((timestamp - new Date(timestamp.getFullYear(), 0, 0)) / (1000 * 60 * 60 * 24));
        const seasonalVariation = Math.sin((dayOfYear / 365) * 2 * Math.PI) * 3; // Jahreszeitliche Schwankung
        const hourVariation = Math.sin((timestamp.getHours() / 24) * 2 * Math.PI) * variance;
        const randomVariation = (Math.random() - 0.5) * variance;
        
        const temperature = baseTemp + seasonalVariation + hourVariation + randomVariation;
        const relativeHumidity = Math.max(30, Math.min(90, 
            baseHumidity + (Math.random() - 0.5) * 15 + seasonalVariation
        ));
        
        // Berechne absolute Feuchte (vereinfacht nach Magnus-Formel)
        const saturationPressure = 6.112 * Math.exp((17.67 * temperature) / (temperature + 243.5));
        const vaporPressure = (relativeHumidity / 100) * saturationPressure;
        const absoluteHumidity = (2.1674 * vaporPressure) / (273.15 + temperature);
        
        data.push({
            timestamp: timestamp.toISOString(),
            ts: timestamp.getTime(), // Für API-Kompatibilität
            val: temperature, // Hauptwert für Charts
            temperature: Math.round(temperature * 10) / 10,
            relativeHumidity: Math.round(relativeHumidity * 10) / 10,
            absoluteHumidity: Math.round(absoluteHumidity * 100) / 100
        });
    }
    
    return data;
};

// Verschiedene Klimaszenarien für Demo
export const mockClimateData = {
    // Innenklima - optimal für Kirchenraum
    indoor: generateClimateData(15, 60, 2, 30), // 15°C ±2°C, 60% rF
    
    // Außenklima - typisch für Norddeutschland im Winter
    outdoor: generateClimateData(5, 80, 4, 30), // 5°C ±4°C, 80% rF
    
    // Orgelbereich - etwas wärmer und stabiler
    organ: generateClimateData(16, 55, 1.5, 30), // 16°C ±1.5°C, 55% rF
    
    // Wandbereich - kühler und feuchter
    wall: generateClimateData(12, 70, 3, 30), // 12°C ±3°C, 70% rF
    
    // Problematisches Szenario - zu feucht
    problematic: generateClimateData(18, 85, 2, 30), // 18°C, 85% rF - Schimmelrisiko
    
    // Trockenes Szenario - zu trocken für Orgel
    dry: generateClimateData(22, 35, 2, 30) // 22°C, 35% rF - Orgelschäden möglich
};

// Demo-Szenarien für verschiedene Situationen
export const demoScenarios = {
    optimal: {
        name: "Optimales Kirchenklima",
        description: "Ideale Bedingungen für Orgel und Kunstwerke",
        indoor: mockClimateData.indoor,
        outdoor: mockClimateData.outdoor,
        organ: mockClimateData.organ,
        wall: mockClimateData.indoor
    },
    
    winter: {
        name: "Winterbetrieb",
        description: "Typische Winterbedingungen mit Heizung",
        indoor: generateClimateData(18, 45, 3, 30), // Geheizt, trocken
        outdoor: generateClimateData(-2, 85, 5, 30), // Kalt, feucht
        organ: generateClimateData(16, 50, 2, 30),
        wall: generateClimateData(14, 65, 4, 30)
    },
    
    summer: {
        name: "Sommerbetrieb", 
        description: "Warme Sommerbedingungen",
        indoor: generateClimateData(22, 65, 3, 30), // Warm
        outdoor: generateClimateData(25, 70, 4, 30), // Heiß, schwül
        organ: generateClimateData(20, 60, 2, 30),
        wall: generateClimateData(19, 70, 3, 30)
    },
    
    critical: {
        name: "Kritische Bedingungen",
        description: "Problematische Werte - Schimmel- und Orgelrisiko",
        indoor: mockClimateData.problematic,
        outdoor: generateClimateData(8, 90, 3, 30), // Sehr feucht
        organ: generateClimateData(25, 40, 3, 30), // Zu warm und trocken
        wall: generateClimateData(10, 95, 2, 30) // Sehr feucht - Schimmelrisiko
    },
    
    maintenance: {
        name: "Wartungsmodus",
        description: "Während Renovierung - instabile Bedingungen",
        indoor: generateClimateData(12, 75, 5, 30), // Instabil
        outdoor: mockClimateData.outdoor,
        organ: generateClimateData(8, 80, 4, 30), // Zu kalt und feucht
        wall: generateClimateData(15, 85, 6, 30) // Sehr instabil
    }
};

// Hilfsfunktion um Mock-Daten in das erwartete Format zu konvertieren
export const convertMockDataForWidget = (mockData, sensorType = 'temperature') => {
    return mockData.map(point => ({
        ...point,
        // Stelle sicher, dass alle erwarteten Felder vorhanden sind
        temperature: point.temperature || point.val || 15,
        relativeHumidity: point.relativeHumidity || 60,
        absoluteHumidity: point.absoluteHumidity || 8.5
    }));
};

// Demo-Geräte für die Auswahl
export const mockDevices = [
    {
        id: 'demo-indoor-sensor',
        name: 'Demo Innensensor (Temp/Feuchte)',
        inputs: [
            {
                id: 'demo-temp-indoor',
                attributes: {
                    title: 'Innentemperatur',
                    alias: 'T_innen'
                }
            },
            {
                id: 'demo-rh-indoor', 
                attributes: {
                    title: 'Innenluftfeuchte',
                    alias: 'RH_innen'
                }
            }
        ]
    },
    {
        id: 'demo-outdoor-sensor',
        name: 'Demo Außensensor (Temp/Feuchte)',
        inputs: [
            {
                id: 'demo-temp-outdoor',
                attributes: {
                    title: 'Außentemperatur', 
                    alias: 'T_außen'
                }
            },
            {
                id: 'demo-rh-outdoor',
                attributes: {
                    title: 'Außenluftfeuchte',
                    alias: 'RH_außen'
                }
            }
        ]
    },
    {
        id: 'demo-organ-sensor',
        name: 'Demo Orgelsensor (Temp/Feuchte)',
        inputs: [
            {
                id: 'demo-temp-organ',
                attributes: {
                    title: 'Orgeltemperatur',
                    alias: 'T_orgel'
                }
            },
            {
                id: 'demo-rh-organ',
                attributes: {
                    title: 'Orgelluftfeuchte', 
                    alias: 'RH_orgel'
                }
            }
        ]
    },
    {
        id: 'demo-wall-sensor',
        name: 'Demo Wandsensor (Feuchte)',
        inputs: [
            {
                id: 'demo-rh-wall',
                attributes: {
                    title: 'Wandfeuchte',
                    alias: 'RH_wand'
                }
            }
        ]
    }
];
