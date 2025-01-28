import React, { useState, useEffect } from 'react';
import { getMeasuringPoint, getDataForMeasuringPoint, getObjectTree } from '../api'; 
import { Line } from 'react-chartjs-2';
import { Chart, registerables } from 'chart.js';
import { Spinner } from 'react-bootstrap';

Chart.register(...registerables);

const ObjectsPage = ({ 
    selectedObjectId, 
    setSelectedObjectId, 
    measuringPoints, 
    setMeasuringPoints, 
    selectedMeasuringPointId, 
    setSelectedMeasuringPointId, 
    dateFrom, 
    dateTo, 
    setDateFrom, 
    setDateTo, 
    chartData = { labels: [], datasets: [] }, 
    setChartData, 
    objectTree, 
    setObjectTree, 
    renderObjectOptions, 
    handleDateFromChange, 
    handleDateToChange 
}) => {
    const [loading, setLoading] = useState(false);
    const [tableData, setTableData] = useState([]); 
    const [granularity, setGranularity] = useState('PT1H'); // Default Granularität

    useEffect(() => {
        const fetchObjectTree = async () => {
            setLoading(true);
            try {
                const tree = await getObjectTree();
                setObjectTree(tree);
            } catch (error) {
                console.error('Fehler beim Abrufen des Objektbaums:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchObjectTree();
    }, [setObjectTree]);

    const handleObjectChange = async (event) => {
        const objectId = event.target.value;
        setSelectedObjectId(objectId);

        if (objectId) {
            setLoading(true);
            try {
                const response = await getMeasuringPoint(objectId);
                setMeasuringPoints(response); 
            } catch (error) {
                console.error('Fehler beim Abrufen der Messpunkte:', error);
            } finally {
                setLoading(false);
            }
        } else {
            setMeasuringPoints([]); 
        }
    };

    const fetchDataForMeasuringPoint = async () => {
        if (selectedMeasuringPointId && dateFrom && dateTo) {
            setLoading(true);
            const timeFrom = new Date(dateFrom).getTime(); 
            const timeTo = new Date(dateTo).getTime(); 

            const response = await getDataForMeasuringPoint(selectedMeasuringPointId, timeFrom, timeTo, granularity);
            console.log('Daten für den Messpunkt:', response);

            if (!response || response.length === 0) {
                setChartData({ labels: [], datasets: [] });
                setTableData([]); 
            } else {
                const newChartData = {
                    labels: response.map(item => new Date(item.ts).toLocaleString()), 
                    datasets: [
                        {
                            label: 'Messpunkt Wert',
                            data: response.map(item => item.val !== null ? item.val : 0), 
                            borderColor: 'rgba(75, 192, 192, 1)',
                            backgroundColor: 'rgba(75, 192, 192, 0.2)',
                        },
                    ],
                };
                setChartData(newChartData);
                setTableData(response); 
            }
            setLoading(false);
        }
    };

    return (
        <div className="filter-container d-flex flex-column align-items-center mb-3">
            {loading ? (
                <div className="spinner-container d-flex justify-content-center align-items-center" style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', zIndex: 1000, backgroundColor: 'rgba(255, 255, 255, 0.8)' }}>
                    <Spinner animation="border" />
                </div>
            ) : (
                <>
                    <div className="d-flex flex-row align-items-center mb-3">
                        <select className="form-select me-2" onChange={handleObjectChange} value={selectedObjectId}>
                            <option value="">Wähle ein Objekt</option>
                            {renderObjectOptions(objectTree)} 
                        </select>
                        <select className="form-select me-2" onChange={e => setSelectedMeasuringPointId(e.target.value)} value={selectedMeasuringPointId}>
                            <option value="">Wähle einen Messpunkt</option>
                            {measuringPoints.map(point => (
                                <option key={point.object_id} value={point.object_id}>
                                    {point.payload.title} (ID: {point.object_id}) 
                                </option>
                            ))}
                        </select>
                        <select className="form-select me-2" onChange={e => setGranularity(e.target.value)} value={granularity}>
                            <option value="PT1M">Minütlich</option>
                            <option value="PT15M">Alle 15 Minuten</option>
                            <option value="PT1H">Stündlich</option>
                            <option value="P1D">Täglich</option>
                            <option value="P1W">Wöchentlich</option>
                        </select>
                        <input type="date" className="form-control me-2" value={dateFrom} onChange={handleDateFromChange} />
                        <span className="mx-2">-</span>
                        <input type="date" className="form-control me-2" value={dateTo} onChange={handleDateToChange} />
                        <button className="btn btn-primary" onClick={fetchDataForMeasuringPoint}>Load</button>
                    </div>

                    <div className="d-flex flex-row justify-content-center align-items-start mt-3" style={{ width: '100%' }}>
                        <div className="table-container me-3" style={{ flex: 1, overflowY: 'auto', maxHeight: '400px' }}>
                            <table className="table">
                                <thead>
                                    <tr>
                                        <th>Zeitstempel</th>
                                        <th>Wert</th>
                                        <th>Min</th>
                                        <th>Max</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {tableData.slice(0, 10).map((item, index) => (
                                        <tr key={index}>
                                            <td>{new Date(item.ts).toLocaleString()}</td>
                                            <td>{item.val !== null ? item.val : 'N/A'}</td>
                                            <td>{item.min !== null ? item.min : 'N/A'}</td>
                                            <td>{item.max !== null ? item.max : 'N/A'}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        <div className="chart-container" style={{ flex: 1 }}>
                            {chartData && chartData.labels && chartData.datasets && chartData.labels.length > 0 && chartData.datasets.length > 0 && (
                                <Line data={chartData} />
                            )}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default ObjectsPage; 