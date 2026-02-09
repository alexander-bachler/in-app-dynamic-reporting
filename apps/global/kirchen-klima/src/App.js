import React, { useState, useEffect, useCallback } from 'react';
import { HashRouter } from 'react-router-dom';
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import 'react-tabs/style/react-tabs.css';
import { Spinner, Alert } from 'react-bootstrap';
import ApiClient from '@project/api-client';
import { subDays, startOfDay, endOfDay } from 'date-fns';
import { calculateAbsoluteHumidity } from './utils/climate-math';
import { demoScenarios, convertMockDataForWidget } from './utils/mockData';

// Import widgets
import SedlbauerMonitor from './components/SedlbauerMonitor';
import VentilationWidget from './components/VentilationWidget';
import SaltMonitor from './components/SaltMonitor';
import OrganProtection from './components/OrganProtection';

function App() {
    const [apiClient] = useState(new ApiClient());
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Sensor selections
    const [devices, setDevices] = useState([]);
    const [selectedIndoorSensor, setSelectedIndoorSensor] = useState('');
    const [selectedOutdoorSensor, setSelectedOutdoorSensor] = useState('');
    const [selectedWallSensor, setSelectedWallSensor] = useState('');
    const [selectedOrganSensor, setSelectedOrganSensor] = useState('');

    // Data for widgets
    const [sedlbauerData, setSedlbauerData] = useState([]);
    const [indoorVentilationData, setIndoorVentilationData] = useState([]);
    const [outdoorVentilationData, setOutdoorVentilationData] = useState([]);
    const [wallData, setWallData] = useState([]);
    const [organData, setOrganData] = useState([]);
    
    // Demo mode
    const [demoMode, setDemoMode] = useState(false);
    const [selectedScenario, setSelectedScenario] = useState('optimal');
    const [showDemoMenu, setShowDemoMenu] = useState(false);

    const fetchDevices = useCallback(async () => {
        setLoading(true);
        try {
            const response = await apiClient.getAllDevices();
            console.log('Raw API Response:', response);
            console.log('First device structure:', response[0]);
            
            // Erstmal nur die ersten 5 Geräte für Debug
            const limitedDevices = response.slice(0, 5);
            
            // Für jedes Gerät die Inputs laden
            const devicesWithInputs = await Promise.all(
                limitedDevices.map(async (device, index) => {
                    console.log(`Processing device ${index}:`, device);
                    
                    try {
                        const deviceDetails = await apiClient.getInputsForDevice({ deviceId: device.id });
                        console.log(`Device ${device.id} details:`, deviceDetails);
                        
                        const processedDevice = {
                            id: device.id,
                            name: device.title || device.name || device.payload?.title || `Device ${device.id}`,
                            inputs: deviceDetails.included || deviceDetails.inputs || []
                        };
                        
                        console.log(`Processed device:`, processedDevice);
                        return processedDevice;
                    } catch (err) {
                        console.warn(`Fehler beim Laden der Inputs für Device ${device.id}:`, err);
                        return {
                            id: device.id,
                            name: device.title || device.name || device.payload?.title || `Device ${device.id}`,
                            inputs: []
                        };
                    }
                })
            );
            
            console.log('Final devices with inputs:', devicesWithInputs);
            setDevices(devicesWithInputs);
        } catch (err) {
            console.error('Fehler beim Abrufen der Geräte:', err);
            setError('Fehler beim Abrufen der Geräte. Bitte überprüfen Sie die Verbindung.');
        } finally {
            setLoading(false);
        }
    }, [apiClient]);

    useEffect(() => {
        // Extract token from URL parameters
        const params = new URLSearchParams(window.location.search);
        const token = params.get('token');

        if (token) {
            apiClient.setAccessToken(token);
        }
        fetchDevices();
    }, [apiClient, fetchDevices]);

    // Close demo menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (showDemoMenu && !event.target.closest('.demo-controls')) {
                setShowDemoMenu(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [showDemoMenu]);

    const fetchSensorData = async (deviceId, inputId, days = 30) => {
        const from = startOfDay(subDays(new Date(), days)).getTime();
        const to = endOfDay(new Date()).getTime();

        try {
            // Falls inputId undefined ist (Gerät direkt ausgewählt), verwende eine Standard-Input-ID
            if (!inputId) {
                console.warn(`Keine Input-ID für Device ${deviceId}, versuche Gerätedaten zu laden`);
                // Versuche zuerst die Inputs für das Gerät zu finden
                const deviceDetails = await apiClient.getInputsForDevice({ deviceId });
                const inputs = deviceDetails.included || deviceDetails.inputs || [];
                if (inputs && inputs.length > 0) {
                    inputId = inputs[0].id; // Verwende den ersten Input
                    console.log(`Verwende ersten Input: ${inputId}`);
                } else {
                    console.error(`Keine Inputs für Device ${deviceId} gefunden`);
                    return [];
                }
            }

            const response = await apiClient.getDataForInput(from, to, inputId);
            return response;
        } catch (err) {
            console.error(`Fehler beim Abrufen der Daten für Device ${deviceId}, Input ${inputId}:`, err);
            return [];
        }
    };

    const processSensorData = (rawData, sensorType) => {
        if (!rawData || rawData.length === 0) return [];

        // Assume data has temperature and humidity
        // Adjust based on your actual API response structure
        return rawData.map(point => {
            const temp = point.temperature || point.value; // Adjust field names
            const rh = point.humidity || point.relativeHumidity || 60; // Adjust field names
            const timestamp = point.timestamp || point.time;

            return {
                timestamp,
                temperature: temp,
                relativeHumidity: rh,
                absoluteHumidity: calculateAbsoluteHumidity(temp, rh)
            };
        });
    };

    const handleLoadData = async () => {
        setLoading(true);
        setError(null);

        try {
            // Fetch data for all selected sensors
            const promises = [];

            if (selectedIndoorSensor) {
                const parts = selectedIndoorSensor.split(':');
                const deviceId = parts[0];
                const inputId = parts[1]; // kann undefined sein bei direkter Gerätauswahl
                promises.push(
                    fetchSensorData(deviceId, inputId, 30).then(data => {
                        const processed = processSensorData(data, 'indoor');
                        setSedlbauerData(processed);
                        setIndoorVentilationData(processed);
                    })
                );
            }

            if (selectedOutdoorSensor) {
                const parts = selectedOutdoorSensor.split(':');
                const deviceId = parts[0];
                const inputId = parts[1]; // kann undefined sein bei direkter Gerätauswahl
                promises.push(
                    fetchSensorData(deviceId, inputId, 7).then(data => {
                        const processed = processSensorData(data, 'outdoor');
                        setOutdoorVentilationData(processed);
                    })
                );
            }

            if (selectedWallSensor) {
                const parts = selectedWallSensor.split(':');
                const deviceId = parts[0];
                const inputId = parts[1]; // kann undefined sein bei direkter Gerätauswahl
                promises.push(
                    fetchSensorData(deviceId, inputId, 7).then(data => {
                        const processed = processSensorData(data, 'wall');
                        setWallData(processed);
                    })
                );
            }

            if (selectedOrganSensor) {
                const parts = selectedOrganSensor.split(':');
                const deviceId = parts[0];
                const inputId = parts[1]; // kann undefined sein bei direkter Gerätauswahl
                promises.push(
                    fetchSensorData(deviceId, inputId, 7).then(data => {
                        const processed = processSensorData(data, 'organ');
                        setOrganData(processed);
                    })
                );
            }

            await Promise.all(promises);
        } catch (err) {
            console.error('Fehler beim Laden der Daten:', err);
            setError('Fehler beim Laden der Sensordaten.');
        } finally {
            setLoading(false);
        }
    };

    const loadDemoData = (scenarioKey = selectedScenario) => {
        const scenario = demoScenarios[scenarioKey];
        if (!scenario) return;

        console.log(`Loading demo scenario: ${scenario.name}`);
        
        // Konvertiere Mock-Daten für Widgets
        const indoorData = convertMockDataForWidget(scenario.indoor);
        const outdoorData = convertMockDataForWidget(scenario.outdoor);
        const organData = convertMockDataForWidget(scenario.organ);
        const wallData = convertMockDataForWidget(scenario.wall);

        // Setze Daten für alle Widgets
        setSedlbauerData(indoorData);
        setIndoorVentilationData(indoorData);
        setOutdoorVentilationData(outdoorData);
        setOrganData(organData);
        setWallData(wallData);

        // Aktiviere Demo-Modus
        setDemoMode(true);
        setSelectedScenario(scenarioKey);
        
        console.log(`Demo-Daten geladen: ${scenario.description}`);
    };

    const exitDemoMode = () => {
        setDemoMode(false);
        // Lösche alle Daten
        setSedlbauerData([]);
        setIndoorVentilationData([]);
        setOutdoorVentilationData([]);
        setOrganData([]);
        setWallData([]);
        console.log('Demo-Modus beendet');
    };

    return (
        <HashRouter>
            <div className="app-container" style={{ 
                maxHeight: '100vh', 
                overflow: 'auto',
                padding: '0.75rem'
            }}>
                {loading && (
                    <div className="spinner-overlay d-flex justify-content-center align-items-center" style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        zIndex: 1000,
                        backgroundColor: 'rgba(255, 255, 255, 0.8)'
                    }}>
                        <Spinner animation="border" />
                    </div>
                )}

                <header className="mb-2">
                    <h2 className="mb-1">🏛️ Kirchen-Klima-Monitor</h2>
                    <p className="text-muted small mb-2">
                        Monitoring für sakrale Gebäude - Schutz von Orgel, Mauerwerk und Kunstwerken
                    </p>
                </header>

                {error && (
                    <Alert variant="danger" onClose={() => setError(null)} dismissible>
                        {error}
                    </Alert>
                )}

                <div className="card mb-3 sensor-config-compact">
                    <div className="card-header d-flex justify-content-between align-items-center py-2">
                        <h6 className="mb-0">Sensor-Konfiguration</h6>
                        <div className="demo-controls position-relative">
                            {!demoMode ? (
                                <div>
                                    <button 
                                        className="btn btn-info btn-sm py-1 px-2" 
                                        onClick={() => setShowDemoMenu(!showDemoMenu)}
                                    >
                                        🎭 Demo
                                    </button>
                                    {showDemoMenu && (
                                        <div className="position-absolute bg-white border rounded shadow p-2 mt-1" style={{zIndex: 1000, minWidth: '300px', right: 0}}>
                                            <div className="mb-2"><strong>Demo-Szenarien:</strong></div>
                                            {Object.entries(demoScenarios).map(([key, scenario]) => (
                                                <button 
                                                    key={key}
                                                    className="btn btn-outline-primary btn-sm d-block w-100 mb-2 text-start py-1" 
                                                    onClick={() => {
                                                        loadDemoData(key);
                                                        setShowDemoMenu(false);
                                                    }}
                                                >
                                                    <strong>{scenario.name}</strong><br/>
                                                    <small className="text-muted">{scenario.description}</small>
                                                </button>
                                            ))}
                                            <button 
                                                className="btn btn-sm btn-outline-secondary w-100 py-1"
                                                onClick={() => setShowDemoMenu(false)}
                                            >
                                                Abbrechen
                                            </button>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="demo-active">
                                    <span className="badge bg-info me-2">
                                        🎭 {demoScenarios[selectedScenario]?.name}
                                    </span>
                                    <button 
                                        className="btn btn-sm btn-outline-secondary me-2 py-1 px-2"
                                        onClick={exitDemoMode}
                                    >
                                        Beenden
                                    </button>
                                    <button 
                                        className="btn btn-sm btn-outline-info py-1 px-2"
                                        onClick={() => setShowDemoMenu(!showDemoMenu)}
                                    >
                                        Wechseln
                                    </button>
                                    {showDemoMenu && (
                                        <div className="position-absolute bg-white border rounded shadow p-2 mt-1" style={{zIndex: 1000, minWidth: '250px', right: 0}}>
                                            {Object.entries(demoScenarios).map(([key, scenario]) => (
                                                <button 
                                                    key={key}
                                                    className="btn btn-outline-primary btn-sm d-block w-100 mb-1 py-1" 
                                                    onClick={() => {
                                                        loadDemoData(key);
                                                        setShowDemoMenu(false);
                                                    }}
                                                >
                                                    {scenario.name}
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                    <div className="card-body py-2">
                        <div className="row g-2">
                            <div className="col-md-3">
                                <label className="form-label-compact">🏛️ Innen</label>
                                <select
                                    className="form-select form-select-sm"
                                    value={selectedIndoorSensor}
                                    onChange={(e) => setSelectedIndoorSensor(e.target.value)}
                                >
                                    <option value="">-- Auswählen --</option>
                                    {devices.map(device => (
                                        <optgroup key={device.id} label={device.name || `Device ${device.id}`}>
                                            {device.inputs && device.inputs.length > 0 ? (
                                                device.inputs.map(input => (
                                                    <option key={input.id} value={`${device.id}:${input.id}`}>
                                                        {input.attributes?.title || input.attributes?.alias || input.name || input.title || `Input ${input.id}`}
                                                    </option>
                                                ))
                                            ) : (
                                                <option value={device.id}>
                                                    {device.name} (Gerät direkt)
                                                </option>
                                            )}
                                        </optgroup>
                                    ))}
                                </select>
                            </div>
                            <div className="col-md-3">
                                <label className="form-label-compact">🌤️ Außen</label>
                                <select
                                    className="form-select form-select-sm"
                                    value={selectedOutdoorSensor}
                                    onChange={(e) => setSelectedOutdoorSensor(e.target.value)}
                                >
                                    <option value="">-- Auswählen --</option>
                                    {devices.map(device => (
                                        <optgroup key={device.id} label={device.name || `Device ${device.id}`}>
                                            {device.inputs && device.inputs.length > 0 ? (
                                                device.inputs.map(input => (
                                                    <option key={input.id} value={`${device.id}:${input.id}`}>
                                                        {input.attributes?.title || input.attributes?.alias || input.name || input.title || `Input ${input.id}`}
                                                    </option>
                                                ))
                                            ) : (
                                                <option value={device.id}>
                                                    {device.name} (Gerät direkt)
                                                </option>
                                            )}
                                        </optgroup>
                                    ))}
                                </select>
                            </div>
                            <div className="col-md-3">
                                <label className="form-label-compact">🧱 Wand</label>
                                <select
                                    className="form-select form-select-sm"
                                    value={selectedWallSensor}
                                    onChange={(e) => setSelectedWallSensor(e.target.value)}
                                >
                                    <option value="">-- Auswählen --</option>
                                    {devices.map(device => (
                                        <optgroup key={device.id} label={device.name || `Device ${device.id}`}>
                                            {device.inputs && device.inputs.length > 0 ? (
                                                device.inputs.map(input => (
                                                    <option key={input.id} value={`${device.id}:${input.id}`}>
                                                        {input.attributes?.title || input.attributes?.alias || input.name || input.title || `Input ${input.id}`}
                                                    </option>
                                                ))
                                            ) : (
                                                <option value={device.id}>
                                                    {device.name} (Gerät direkt)
                                                </option>
                                            )}
                                        </optgroup>
                                    ))}
                                </select>
                            </div>
                            <div className="col-md-3">
                                <label className="form-label-compact">🎹 Orgel</label>
                                <select
                                    className="form-select form-select-sm"
                                    value={selectedOrganSensor}
                                    onChange={(e) => setSelectedOrganSensor(e.target.value)}
                                >
                                    <option value="">-- Auswählen --</option>
                                    {devices.map(device => (
                                        <optgroup key={device.id} label={device.name || `Device ${device.id}`}>
                                            {device.inputs && device.inputs.length > 0 ? (
                                                device.inputs.map(input => (
                                                    <option key={input.id} value={`${device.id}:${input.id}`}>
                                                        {input.attributes?.title || input.attributes?.alias || input.name || input.title || `Input ${input.id}`}
                                                    </option>
                                                ))
                                            ) : (
                                                <option value={device.id}>
                                                    {device.name} (Gerät direkt)
                                                </option>
                                            )}
                                        </optgroup>
                                    ))}
                                </select>
                            </div>
                        </div>
                        <div className="mt-2">
                            <button
                                className="btn btn-primary btn-sm"
                                onClick={handleLoadData}
                                disabled={!selectedIndoorSensor && !selectedOutdoorSensor && !selectedWallSensor && !selectedOrganSensor}
                            >
                                Daten laden
                            </button>
                        </div>
                    </div>
                </div>

                <Tabs>
                    <TabList>
                        <Tab>📊 Übersicht</Tab>
                        <Tab>🦠 Schimmelrisiko</Tab>
                        <Tab>🌬️ Lüftung</Tab>
                        <Tab>🧱 Mauerwerk</Tab>
                        <Tab>🎹 Orgelschutz</Tab>
                    </TabList>

                    <TabPanel>
                        <div className="mt-2">
                            <h4>Dashboard - Alle Monitore</h4>
                            <p className="text-muted small mb-2">
                                Diese Übersicht zeigt alle wichtigen Klimaparameter für Ihr Kirchengebäude auf einen Blick.
                            </p>
                            <div className="row">
                                <div className="col-md-6">
                                    <SedlbauerMonitor data={sedlbauerData} />
                                </div>
                                <div className="col-md-6">
                                    <OrganProtection organData={organData} />
                                </div>
                            </div>
                            <div className="row">
                                <div className="col-12">
                                    <VentilationWidget
                                        indoorData={indoorVentilationData}
                                        outdoorData={outdoorVentilationData}
                                    />
                                </div>
                            </div>
                        </div>
                    </TabPanel>

                    <TabPanel>
                        <div className="mt-2">
                            <h4>Schimmelrisiko-Analyse (Sedlbauer-Modell)</h4>
                            <p className="text-muted small mb-2">
                                Überwachung des Schimmelrisikos basierend auf wissenschaftlichen Isoplethen-Diagrammen.
                            </p>
                            <SedlbauerMonitor data={sedlbauerData} />
                        </div>
                    </TabPanel>

                    <TabPanel>
                        <div className="mt-2">
                            <h4>Intelligente Lüftungsentscheidung</h4>
                            <p className="text-muted small mb-2">
                                Vergleich der absoluten Feuchte zwischen innen und außen - für optimale Lüftungsentscheidungen.
                            </p>
                            <VentilationWidget
                                indoorData={indoorVentilationData}
                                outdoorData={outdoorVentilationData}
                            />
                        </div>
                    </TabPanel>

                    <TabPanel>
                        <div className="mt-2">
                            <h4>Salz-Wächter - Mauerwerksschutz</h4>
                            <p className="text-muted small mb-2">
                                Überwachung von Salzkristallisation im Mauerwerk zur Vermeidung von Bauschäden.
                            </p>
                            <SaltMonitor wallData={wallData} />
                        </div>
                    </TabPanel>

                    <TabPanel>
                        <div className="mt-2">
                            <h4>Orgelschutz - Klimakorridor</h4>
                            <p className="text-muted small mb-2">
                                Überwachung des optimalen Klimakorridors für Pfeifenorgeln - Schutz vor Verstimmung und Materialschäden.
                            </p>
                            <OrganProtection organData={organData} />
                        </div>
                    </TabPanel>
                </Tabs>

                <footer className="mt-3 mb-2 text-center text-muted">
                    <small style={{ fontSize: '0.75rem' }}>
                        LineMetrics Kirchen-Klima-Monitor v1.0
                    </small>
                </footer>
            </div>
        </HashRouter>
    );
}

export default App;
