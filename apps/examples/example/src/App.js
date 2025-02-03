import React, {useState, useEffect} from 'react';
import {HashRouter} from 'react-router-dom'; // Importiere HashRouter
import DevicesPage from './pages/DevicesPage';
import ObjectsPage from './pages/ObjectsPage';
import {Tab, Tabs, TabList, TabPanel} from 'react-tabs';
import 'react-tabs/style/react-tabs.css'; // Importiere die Styles für die Tabs
import {Spinner, Alert} from 'react-bootstrap'; // Importiere Spinner und Alert von Bootstrap
import ApiClient from '@project/api-client';

function App() {
    const [activeTab, setActiveTab] = useState('Devices');
    const [devices, setDevices] = useState([]);
    const [loading, setLoading] = useState(false); // State für den Ladezustand
    const [objectTree, setObjectTree] = useState([]); // State für den Objektbaum
    const [selectedDeviceId, setSelectedDeviceId] = useState('');
    const [selectedInputId, setSelectedInputId] = useState('');
    const [dateFrom, setDateFrom] = useState('');
    const [dateTo, setDateTo] = useState('');
    const [chartData, setChartData] = useState({labels: [], datasets: []}); // State für die Chart-Daten
    const [selectedObjectId, setSelectedObjectId] = useState(''); // State für das ausgewählte Objekt
    const [measuringPoints, setMeasuringPoints] = useState([]); // State für die Messpunkte
    const [selectedMeasuringPointId, setSelectedMeasuringPointId] = useState(''); // State für den ausgewählten Messpunkt
    const [inputs, setInputs] = useState([]); // State für die Eingaben
    const [error, setError] = useState(null); // State für Fehler
    const [apiClient] = useState(new ApiClient());

    useEffect(() => {
        // Reset chart data when switching tabs
        setChartData({labels: [], datasets: []});

        // Token aus URL-Parametern extrahieren
        const params = new URLSearchParams(window.location.search);
        const token = params.get('token');

        if (token) {
            apiClient.setAccessToken(token); // Setze das Access-Token
            fetchDevicesWithToken(); // Rufe Geräte mit Token ab
        } else {
            fetchDevices(); // Rufe Geräte ohne Token ab
        }
    }, [activeTab]);

    const fetchDevicesWithToken = async () => {
        setLoading(true);
        try {
            const response = await apiClient.getAllDevices();
            console.log('Devices: ', response);
            setDevices(response); // Setze die Geräte in den State
        } catch (error) {
            console.error('Fehler beim Abrufen der Geräte:', error);
            setError('Fehler beim Abrufen der Geräte. Bitte überprüfen Sie den Token.');
        } finally {
            setLoading(false);
        }
    };

    const fetchDevices = async () => {
        if (activeTab === 'Devices') {
            const response = await apiClient.getAllDevices();
            console.log('Devices: ', response);
            setDevices(response); // Setze die Geräte in den State
        }
    };

    useEffect(() => {
        if (activeTab === 'Objects') {
            fetchObjectTree(); // Rufe den Objektbaum ab, wenn der Tab gewechselt wird
        }
    }, [activeTab]);

    const fetchObjectTree = async () => {
        setLoading(true); // Setze den Ladezustand auf true
        try {
            const tree = await apiClient.getObjectTree(); // Rufe den Objektbaum ab
            console.log('Objektbaum:', tree); // Debugging: Zeige den abgerufenen Baum an
            setObjectTree(tree); // Setze den Objektbaum in den State
        } catch (error) {
            console.error('Fehler beim Abrufen des Objektbaums:', error);
        } finally {
            setLoading(false); // Setze den Ladezustand auf false
        }
    };

    const renderObjectOptions = (tree, level = 0) => {
        return tree.flatMap(obj => [
            <option key={obj.object_id} value={obj.object_id}>
                {'-'.repeat(level)} {obj.title} (ID: {obj.object_id}) {/* Einrückung durch Bindestriche */}
            </option>,
            ...(obj.children && obj.children.length > 0 ? renderObjectOptions(obj.children, level + 1) : [])
        ]);
    };

    const handleInputChange = (event) => {
        setSelectedInputId(event.target.value);
    };

    const handleDateFromChange = (event) => {
        setDateFrom(event.target.value);
    };

    const handleDateToChange = (event) => {
        setDateTo(event.target.value);
    };

    return (
        <HashRouter>
            <div className="container mt-4" style={{position: 'relative'}}>
                {loading && (
                    <div className="spinner-overlay d-flex justify-content-center align-items-center" style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        zIndex: 1000,
                        backgroundColor: 'rgba(255, 255, 255, 0.8)'
                    }}>
                        <Spinner animation="border"/>
                    </div>
                )}
                {error && (
                    <Alert variant="danger" onClose={() => setError(null)} dismissible>
                        {error}
                    </Alert>
                )}
                <Tabs selectedTabClassName="active"
                      onSelect={tabIndex => setActiveTab(tabIndex === 0 ? 'Devices' : 'Objects')}>
                    <TabList>
                        <Tab>Devices</Tab>
                        <Tab>Objects</Tab>
                    </TabList>

                    <TabPanel>
                        <DevicesPage
                            apiClient={apiClient}
                            selectedDeviceId={selectedDeviceId}
                            setSelectedDeviceId={setSelectedDeviceId}
                            selectedInputId={selectedInputId}
                            setSelectedInputId={setSelectedInputId}
                            dateFrom={dateFrom}
                            dateTo={dateTo}
                            setDateFrom={setDateFrom}
                            setDateTo={setDateTo}
                            chartData={chartData}
                            setChartData={setChartData}
                            devices={devices}
                            inputs={inputs}
                            setInputs={setInputs}
                            handleDateFromChange={handleDateFromChange}
                            handleDateToChange={handleDateToChange}
                        />
                    </TabPanel>
                    <TabPanel>
                        <ObjectsPage
                            apiClient={apiClient}
                            selectedObjectId={selectedObjectId}
                            setSelectedObjectId={setSelectedObjectId}
                            measuringPoints={measuringPoints}
                            setMeasuringPoints={setMeasuringPoints}
                            selectedMeasuringPointId={selectedMeasuringPointId}
                            setSelectedMeasuringPointId={setSelectedMeasuringPointId}
                            dateFrom={dateFrom}
                            dateTo={dateTo}
                            setDateFrom={setDateFrom}
                            setDateTo={setDateTo}
                            chartData={chartData}
                            setChartData={setChartData}
                            objectTree={objectTree}
                            setObjectTree={setObjectTree}
                            renderObjectOptions={renderObjectOptions}
                            handleDateFromChange={handleDateFromChange}
                            handleDateToChange={handleDateToChange}
                        />
                    </TabPanel>
                </Tabs>
            </div>
        </HashRouter>
    );
}

export default App;