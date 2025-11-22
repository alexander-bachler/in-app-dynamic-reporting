# Kirchen-Klima-Monitor

Spezialisiertes Monitoring-System für sakrale Gebäude zum Schutz von Orgel, Mauerwerk und Kunstwerken.

## Überblick

Der Kirchen-Klima-Monitor ist eine React-Anwendung, die speziell für die Überwachung des Raumklimas in Kirchen entwickelt wurde. Das System bietet vier spezialisierte Monitoring-Widgets:

### 1. Schimmelrisiko-Monitor (Sedlbauer-Modell)
- Zeigt das Schimmelrisiko basierend auf wissenschaftlichen Isoplethen-Diagrammen
- Visualisiert Temperatur vs. Luftfeuchte mit LIM-Kurven (Lowest Isopleth for Mold)
- Warnt bei kritischen Bedingungen

### 2. Intelligente Lüftungsentscheidung
- Vergleicht absolute Luftfeuchte innen vs. außen
- Ampelsystem für Lüftungsempfehlungen
- Berechnet optimale Lüftungszeiten (Taupunkt-Lüftung)

### 3. Salz-Wächter (Mauerwerksschutz)
- Überwacht Salzkristallisation im Mauerwerk
- Zeigt kritische Feuchteschwellen für verschiedene Salze
- Zählt Phasenwechsel zur Bewertung der Materialbelastung

### 4. Orgelschutz (Klimakorridor)
- Überwacht den optimalen Klimakorridor für Pfeifenorgeln
- Temperaturbereich: 8-20°C
- Feuchtebereich: 50-70% rF
- Schutz vor Verstimmung und Materialschäden

## Physikalische Berechnungen

Das System implementiert folgende wissenschaftliche Formeln:

- **Magnus-Formel**: Berechnung der absoluten Luftfeuchte
- **Taupunkt-Berechnung**: Kondensationsrisiko an kalten Oberflächen
- **EMC (Equilibrium Moisture Content)**: Holzausgleichsfeuchte für Orgelschutz
- **Sedlbauer-Isoplethen**: Schimmelrisikomodell für verschiedene Substrate
- **Salzkristallisation**: Kritische Feuchteschwellen für Bausalze

## Installation

```bash
# Aus dem Root-Verzeichnis des Monorepos
npm install

# Oder spezifisch für dieses Workspace
npm install --workspace=kirchen-klima
```

## Konfiguration

1. Kopieren Sie `.env.example` zu `.env`:
```bash
cp .env.example .env
```

2. Tragen Sie Ihre LineMetrics API-Zugangsdaten ein:
```
REACT_APP_CLIENT_ID=your_client_id
REACT_APP_CLIENT_SECRET=your_client_secret
REACT_APP_BASE_URL=https://api.linemetrics.com/v2
```

## Entwicklung

```bash
npm run start --workspace=kirchen-klima
```

Die Anwendung wird unter `http://localhost:3000` verfügbar sein.

## Build

```bash
npm run build --workspace=kirchen-klima
```

Der Build wird nach `build/global/kirchen-klima/` exportiert.

## Sensor-Konfiguration

Das System benötigt folgende Sensoren:

1. **Innensensor**: Temperatur und relative Feuchte im Kirchenraum
2. **Außensensor**: Temperatur und relative Feuchte außerhalb
3. **Wand-Sensor**: Relative Feuchte an der Wand (für Salz-Monitoring)
4. **Orgel-Sensor**: Temperatur und relative Feuchte in Orgelnähe

## Technologie-Stack

- **React 19**: UI-Framework
- **Chart.js 4**: Datenvisualisierung
- **chartjs-plugin-annotation**: Annotationen für kritische Bereiche
- **date-fns**: Datums-Handling
- **React Bootstrap**: UI-Komponenten
- **@project/api-client**: LineMetrics API-Integration

## Wissenschaftliche Grundlagen

Die Implementierung basiert auf folgenden wissenschaftlichen Quellen:

- Sedlbauer, K.: "Vorhersage von Schimmelpilzbildung auf und in Bauteilen"
- DIN 4108: Wärmeschutz und Energie-Einsparung in Gebäuden
- WTA-Merkblatt 6-5: Schimmelpilze in Innenräumen
- VDI 3814: Orgelbauklima

## Lizenz

Proprietär - LineMetrics GmbH
