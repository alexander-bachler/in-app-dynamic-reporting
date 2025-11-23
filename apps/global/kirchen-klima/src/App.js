import React, { useState, useEffect, useCallback } from 'react';
import { HashRouter } from 'react-router-dom';
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import 'react-tabs/style/react-tabs.css';
import { Spinner, Alert } from 'react-bootstrap';
import ApiClient from '@project/api-client';
import { subDays, startOfDay, endOfDay } from 'date-fns';
import { calculateAbsoluteHumidity } from './utils/climate-math';

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

    const fetchDevices = useCallback(async () => {
        setLoading(true);
        try {
            const response = await apiClient.getAllDevices();
            console.log('Devices:', response);
            setDevices(response);
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

    const fetchSensorData = async (deviceId, inputId, days = 30) => {
        const from = startOfDay(subDays(new Date(), days)).toISOString();
        const to = endOfDay(new Date()).toISOString();

        try {
            const response = await apiClient.getInputData(deviceId, inputId, from, to);
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
                const [deviceId, inputId] = selectedIndoorSensor.split(':');
                promises.push(
                    fetchSensorData(deviceId, inputId, 30).then(data => {
                        const processed = processSensorData(data, 'indoor');
                        setSedlbauerData(processed);
                        setIndoorVentilationData(processed);
                    })
                );
            }

            if (selectedOutdoorSensor) {
                const [deviceId, inputId] = selectedOutdoorSensor.split(':');
                promises.push(
                    fetchSensorData(deviceId, inputId, 7).then(data => {
                        const processed = processSensorData(data, 'outdoor');
                        setOutdoorVentilationData(processed);
                    })
                );
            }

            if (selectedWallSensor) {
                const [deviceId, inputId] = selectedWallSensor.split(':');
                promises.push(
                    fetchSensorData(deviceId, inputId, 7).then(data => {
                        const processed = processSensorData(data, 'wall');
                        setWallData(processed);
                    })
                );
            }

            if (selectedOrganSensor) {
                const [deviceId, inputId] = selectedOrganSensor.split(':');
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

    return (
        <HashRouter>
            <div className="container-fluid mt-4" style={{ position: 'relative' }}>
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

                <header className="mb-4">
                    <h1 className="display-4">🏛️ Kirchen-Klima-Monitor</h1>
                    <p className="lead">
                        Spezialisiertes Monitoring-System für sakrale Gebäude - Schutz von Orgel, Mauerwerk und Kunstwerken
                    </p>
                </header>

                {error && (
                    <Alert variant="danger" onClose={() => setError(null)} dismissible>
                        {error}
                    </Alert>
                )}

                <div className="card mb-4">
                    <div className="card-header">
                        <h5>Sensor-Konfiguration</h5>
                    </div>
                    <div className="card-body">
                        <div className="row">
                            <div className="col-md-3">
                                <label className="form-label">Innensensor (Temp/Feuchte)</label>
                                <select
                                    className="form-select"
                                    value={selectedIndoorSensor}
                                    onChange={(e) => setSelectedIndoorSensor(e.target.value)}
                                >
                                    <option value="">-- Sensor auswählen --</option>
                                    {devices.map(device => (
                                        <optgroup key={device.id} label={device.name || `Device ${device.id}`}>
                                            {device.inputs && device.inputs.map(input => (
                                                <option key={input.id} value={`${device.id}:${input.id}`}>
                                                    {input.name || `Input ${input.id}`}
                                                </option>
                                            ))}
                                        </optgroup>
                                    ))}
                                </select>
                            </div>
                            <div className="col-md-3">
                                <label className="form-label">Außensensor (Temp/Feuchte)</label>
                                <select
                                    className="form-select"
                                    value={selectedOutdoorSensor}
                                    onChange={(e) => setSelectedOutdoorSensor(e.target.value)}
                                >
                                    <option value="">-- Sensor auswählen --</option>
                                    {devices.map(device => (
                                        <optgroup key={device.id} label={device.name || `Device ${device.id}`}>
                                            {device.inputs && device.inputs.map(input => (
                                                <option key={input.id} value={`${device.id}:${input.id}`}>
                                                    {input.name || `Input ${input.id}`}
                                                </option>
                                            ))}
                                        </optgroup>
                                    ))}
                                </select>
                            </div>
                            <div className="col-md-3">
                                <label className="form-label">Wand-Sensor (Feuchte)</label>
                                <select
                                    className="form-select"
                                    value={selectedWallSensor}
                                    onChange={(e) => setSelectedWallSensor(e.target.value)}
                                >
                                    <option value="">-- Sensor auswählen --</option>
                                    {devices.map(device => (
                                        <optgroup key={device.id} label={device.name || `Device ${device.id}`}>
                                            {device.inputs && device.inputs.map(input => (
                                                <option key={input.id} value={`${device.id}:${input.id}`}>
                                                    {input.name || `Input ${input.id}`}
                                                </option>
                                            ))}
                                        </optgroup>
                                    ))}
                                </select>
                            </div>
                            <div className="col-md-3">
                                <label className="form-label">Orgel-Sensor (Temp/Feuchte)</label>
                                <select
                                    className="form-select"
                                    value={selectedOrganSensor}
                                    onChange={(e) => setSelectedOrganSensor(e.target.value)}
                                >
                                    <option value="">-- Sensor auswählen --</option>
                                    {devices.map(device => (
                                        <optgroup key={device.id} label={device.name || `Device ${device.id}`}>
                                            {device.inputs && device.inputs.map(input => (
                                                <option key={input.id} value={`${device.id}:${input.id}`}>
                                                    {input.name || `Input ${input.id}`}
                                                </option>
                                            ))}
                                        </optgroup>
                                    ))}
                                </select>
                            </div>
                        </div>
                        <div className="mt-3">
                            <button
                                className="btn btn-primary"
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
                        <div className="mt-4">
                            <h3>Dashboard - Alle Monitore</h3>
                            <p className="text-muted">
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
                        <div className="mt-4">
                            <h3>Schimmelrisiko-Analyse (Sedlbauer-Modell)</h3>
                            <p className="text-muted">
                                Überwachung des Schimmelrisikos basierend auf wissenschaftlichen Isoplethen-Diagrammen.
                            </p>
                            <SedlbauerMonitor data={sedlbauerData} />
                        </div>
                    </TabPanel>

                    <TabPanel>
                        <div className="mt-4">
                            <h3>Intelligente Lüftungsentscheidung</h3>
                            <p className="text-muted">
                                Vergleich der absoluten Feuchte zwischen innen und außen - für optimale Lüftungsentscheidungen.
                            </p>
                            <VentilationWidget
                                indoorData={indoorVentilationData}
                                outdoorData={outdoorVentilationData}
                            />
                        </div>
                    </TabPanel>

                    <TabPanel>
                        <div className="mt-4">
                            <h3>Salz-Wächter - Mauerwerksschutz</h3>
                            <p className="text-muted">
                                Überwachung von Salzkristallisation im Mauerwerk zur Vermeidung von Bauschäden.
                            </p>
                            <SaltMonitor wallData={wallData} />
                        </div>
                    </TabPanel>

                    <TabPanel>
                        <div className="mt-4">
                            <h3>Orgelschutz - Klimakorridor</h3>
                            <p className="text-muted">
                                Überwachung des optimalen Klimakorridors für Pfeifenorgeln - Schutz vor Verstimmung und Materialschäden.
                            </p>
                            <OrganProtection organData={organData} />
                        </div>
                    </TabPanel>
                </Tabs>

                <footer className="mt-5 mb-4 text-center text-muted">
                    <small>
                        LineMetrics Kirchen-Klima-Monitor v1.0 | Entwickelt für den Schutz sakraler Gebäude und Kunstwerke
                    </small>
                </footer>
            </div>
        </HashRouter>
    );
}

export default App;
