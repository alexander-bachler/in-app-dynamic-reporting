import React, { useEffect, useRef } from 'react';
import { Chart, registerables } from 'chart.js';
import 'chartjs-adapter-date-fns';
import { getVentilationRecommendation } from '../utils/climate-math';

// Register Chart.js components
Chart.register(...registerables);

/**
 * Intelligent Ventilation Decision Widget
 * Shows absolute humidity comparison between indoor and outdoor
 * Provides traffic light recommendation for ventilation
 */
const VentilationWidget = ({ indoorData = [], outdoorData = [] }) => {
    const chartRef = useRef(null);
    const chartInstance = useRef(null);

    // Get current recommendation
    const currentRecommendation = indoorData.length > 0 && outdoorData.length > 0
        ? getVentilationRecommendation(
            indoorData[indoorData.length - 1].temperature,
            indoorData[indoorData.length - 1].relativeHumidity,
            outdoorData[outdoorData.length - 1].temperature,
            outdoorData[outdoorData.length - 1].relativeHumidity
        )
        : null;

    useEffect(() => {
        if (!chartRef.current) return;

        const ctx = chartRef.current.getContext('2d');

        // Destroy existing chart
        if (chartInstance.current) {
            chartInstance.current.destroy();
        }

        // Prepare data
        const indoorAHData = indoorData.map(point => ({
            x: new Date(point.timestamp),
            y: point.absoluteHumidity
        }));

        const outdoorAHData = outdoorData.map(point => ({
            x: new Date(point.timestamp),
            y: point.absoluteHumidity
        }));

        // Create chart
        chartInstance.current = new Chart(ctx, {
            type: 'line',
            data: {
                datasets: [
                    {
                        label: 'Innen (absolute Feuchte)',
                        data: indoorAHData,
                        borderColor: 'rgb(255, 99, 132)',
                        backgroundColor: 'rgba(255, 99, 132, 0.2)',
                        borderWidth: 2,
                        fill: false,
                        tension: 0.4,
                        pointRadius: 2,
                        pointHoverRadius: 5
                    },
                    {
                        label: 'Außen (absolute Feuchte)',
                        data: outdoorAHData,
                        borderColor: 'rgb(54, 162, 235)',
                        backgroundColor: 'rgba(54, 162, 235, 0.2)',
                        borderWidth: 2,
                        fill: false,
                        tension: 0.4,
                        pointRadius: 2,
                        pointHoverRadius: 5
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: {
                        display: true,
                        text: 'Absolute Luftfeuchte - Lüftungsentscheidung',
                        font: {
                            size: 16,
                            weight: 'bold'
                        }
                    },
                    legend: {
                        display: true,
                        position: 'top'
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                return `${context.dataset.label}: ${context.parsed.y.toFixed(2)} g/m³`;
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        type: 'time',
                        time: {
                            unit: 'hour',
                            displayFormats: {
                                hour: 'dd.MM HH:mm'
                            }
                        },
                        title: {
                            display: true,
                            text: 'Zeit'
                        }
                    },
                    y: {
                        title: {
                            display: true,
                            text: 'Absolute Feuchte (g/m³)',
                            font: {
                                size: 14,
                                weight: 'bold'
                            }
                        },
                        beginAtZero: false
                    }
                }
            }
        });

        return () => {
            if (chartInstance.current) {
                chartInstance.current.destroy();
            }
        };
    }, [indoorData, outdoorData]);

    // Traffic light component
    const TrafficLight = ({ color }) => {
        const colors = {
            green: '#28a745',
            yellow: '#ffc107',
            red: '#dc3545'
        };

        return (
            <div style={{
                width: '80px',
                height: '80px',
                borderRadius: '50%',
                backgroundColor: colors[color] || colors.yellow,
                border: '3px solid #333',
                boxShadow: '0 4px 8px rgba(0,0,0,0.3)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '36px',
                color: 'white'
            }}>
                {color === 'green' && '✓'}
                {color === 'red' && '✗'}
                {color === 'yellow' && '?'}
            </div>
        );
    };

    return (
        <div className="card mb-4">
            <div className="card-body">
                <div className="row">
                    <div className="col-md-9">
                        <div style={{ position: 'relative', height: '350px' }}>
                            <canvas ref={chartRef}></canvas>
                        </div>
                    </div>
                    <div className="col-md-3 d-flex flex-column align-items-center justify-content-center">
                        {currentRecommendation && (
                            <>
                                <h5 className="mb-3">Lüftungsampel</h5>
                                <TrafficLight color={currentRecommendation.color} />
                                <div className="mt-3 text-center">
                                    <strong>{currentRecommendation.recommendation}</strong>
                                    <p className="small mt-2">{currentRecommendation.action}</p>
                                </div>
                            </>
                        )}
                    </div>
                </div>
                {currentRecommendation && (
                    <div className="mt-3 alert alert-secondary">
                        <strong>Aktuelle Werte:</strong>
                        <ul className="mb-0 mt-2">
                            <li>Innen: {currentRecommendation.indoorAH} g/m³</li>
                            <li>Außen: {currentRecommendation.outdoorAH} g/m³</li>
                            <li>Differenz: {currentRecommendation.difference} g/m³</li>
                        </ul>
                        <p className="mb-0 mt-2">
                            <em>Lüften ist sinnvoll, wenn die Außenluft trockener ist als die Innenluft (absolute Feuchte Außen {'<'} Innen).</em>
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default VentilationWidget;
