import React, { useState } from 'react';
import { Line } from 'react-chartjs-2';
import { Chart, registerables } from 'chart.js';
import { Spinner } from 'react-bootstrap';

Chart.register(...registerables);

const DevicesPage = ({
                         apiClient,
                         selectedDeviceId,
                         setSelectedDeviceId,
                         selectedInputId,
                         setSelectedInputId,
                         dateFrom,
                         dateTo,
                         setDateFrom,
                         setDateTo,
                         chartData = { labels: [], datasets: [] },
                         setChartData,
                         devices,
                         inputs,
                         setInputs,
                         handleDateFromChange,
                         handleDateToChange
                     }) => {
    const [loading, setLoading] = useState(false);
    const [tableData, setTableData] = useState([]);
    const [granularity, setGranularity] = useState('PT1H'); // Default Granularität

    const handleDeviceChange = async (event) => {
        const deviceId = event.target.value;
        setSelectedDeviceId(deviceId);

        if (deviceId) {
            const response = await apiClient.getInputsForDevice({ deviceId });
            setInputs(response.included);
        } else {
            setInputs([]);
        }
    };

    const fetchDataForInput = async () => {
        if (selectedDeviceId && selectedInputId && dateFrom && dateTo) {
            setLoading(true);
            const timeFrom = new Date(dateFrom).getTime();
            const timeTo = new Date(dateTo).getTime();

            const response = await apiClient.getDataForInput(timeFrom, timeTo, selectedInputId, granularity);
            console.log('Daten für den Eingang:', response);

            if (!response || response.length === 0) {
                setChartData({ labels: [], datasets: [] });
                setTableData([]);
            } else {
                const newChartData = {
                    labels: response.map(item => new Date(item.ts).toLocaleString()),
                    datasets: [
                        {
                            label: 'Wert',
                            data: response.map(item => item.val),
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

    const handleFlushCache = () => {
        apiClient.flushCache();
    };

    return (
        <div className="filter-container d-flex flex-column align-items-center mb-3">
            <div className="d-flex flex-row align-items-center mb-3">
                <select className="form-select me-2" onChange={handleDeviceChange} value={selectedDeviceId}>
                    <option value="">Wähle ein Gerät</option>
                    {devices.map(device => (
                        <option key={device.id} value={device.id}>
                            {device.title}
                        </option>
                    ))}
                </select>
                <select className="form-select me-2" value={selectedInputId} onChange={e => setSelectedInputId(e.target.value)}>
                    <option value="">Wähle einen Eingang</option>
                    {inputs.map(input => (
                        <option key={input.id} value={input.id}>
                            {input.attributes.title} (Alias: {input.attributes.alias})
                        </option>
                    ))}
                </select>
                <select className="form-select me-2" onChange={e => setGranularity(e.target.value)} value={granularity}>
                    <option value="PT1M">Minütlich</option>
                    <option value="PT15M">Alle 15 Minuten</option>
                    <option value="PT1H">Stündlich</option>
                    <option value="P1D">Täglich</option>
                </select>
                <input type="date" className="form-control me-2" value={dateFrom} onChange={handleDateFromChange} />
                <span className="mx-2">-</span>
                <input type="date" className="form-control me-2" value={dateTo} onChange={handleDateToChange} />
                <button className="btn btn-primary" onClick={fetchDataForInput}>Load</button>
                <button className="btn btn-danger ms-2" onClick={handleFlushCache}>Flush Cache</button>
            </div>

            <div className="d-flex flex-row justify-content-center align-items-start mt-3" style={{ width: '100%' }}>
                <div className="table-container me-3" style={{ flex: 1, overflowY: 'auto', maxHeight: '400px' }}>
                    {loading ? (
                        <div className="d-flex justify-content-center align-items-center" style={{ height: '100px' }}>
                            <Spinner animation="border" />
                        </div>
                    ) : (
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
                    )}
                </div>

                <div className="chart-container" style={{ flex: 1 }}>
                    {chartData && chartData.labels && chartData.datasets && chartData.labels.length > 0 && chartData.datasets.length > 0 && (
                        <Line data={chartData} />
                    )}
                </div>
            </div>
        </div>
    );
};

export default DevicesPage;