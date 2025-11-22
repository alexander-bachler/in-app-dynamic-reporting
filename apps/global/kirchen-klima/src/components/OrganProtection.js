import React, { useEffect, useRef, useState } from 'react';
import { Chart } from 'chart.js/auto';
import annotationPlugin from 'chartjs-plugin-annotation';
import { checkOrganProtection } from '../utils/climate-math';

Chart.register(annotationPlugin);

/**
 * Organ Protection Widget - Climate Corridor Monitor
 * Displays temperature vs. humidity with safe zone for pipe organs
 * Prevents detuning and material damage (cracks, swelling)
 */
const OrganProtection = ({ organData = [] }) => {
    const chartRef = useRef(null);
    const chartInstance = useRef(null);
    const [currentStatus, setCurrentStatus] = useState(null);

    // Climate corridor for organs
    const TEMP_MIN = 8;
    const TEMP_MAX = 20;
    const RH_MIN = 50;
    const RH_MAX = 70;

    useEffect(() => {
        if (organData.length === 0) return;

        // Check current status
        const latest = organData[organData.length - 1];
        const status = checkOrganProtection(latest.temperature, latest.relativeHumidity);
        setCurrentStatus(status);
    }, [organData]);

    useEffect(() => {
        if (!chartRef.current) return;

        const ctx = chartRef.current.getContext('2d');

        // Destroy existing chart
        if (chartInstance.current) {
            chartInstance.current.destroy();
        }

        // Prepare data points
        const dataPoints = organData.map(point => ({
            x: point.temperature,
            y: point.relativeHumidity,
            timestamp: point.timestamp
        }));

        // Get current point (latest)
        const currentPoint = dataPoints.length > 0 ? dataPoints[dataPoints.length - 1] : null;

        // Create chart
        chartInstance.current = new Chart(ctx, {
            type: 'scatter',
            data: {
                datasets: [
                    {
                        label: 'Messungen (letzte 7 Tage)',
                        data: dataPoints.slice(0, -1), // All except current
                        backgroundColor: function(context) {
                            const point = context.raw;
                            if (!point) return 'rgba(75, 192, 192, 0.5)';

                            const inCorridor = point.x >= TEMP_MIN && point.x <= TEMP_MAX &&
                                             point.y >= RH_MIN && point.y <= RH_MAX;

                            return inCorridor ? 'rgba(75, 192, 192, 0.5)' : 'rgba(255, 99, 132, 0.5)';
                        },
                        borderColor: 'rgba(75, 192, 192, 0.8)',
                        pointRadius: 4,
                        pointHoverRadius: 6
                    },
                    {
                        label: 'Aktueller Wert',
                        data: currentPoint ? [currentPoint] : [],
                        backgroundColor: function(context) {
                            const point = context.raw;
                            if (!point) return 'rgba(255, 206, 86, 1)';

                            const inCorridor = point.x >= TEMP_MIN && point.x <= TEMP_MAX &&
                                             point.y >= RH_MIN && point.y <= RH_MAX;

                            return inCorridor ? 'rgba(40, 167, 69, 1)' : 'rgba(220, 53, 69, 1)';
                        },
                        borderColor: 'rgba(0, 0, 0, 1)',
                        borderWidth: 2,
                        pointRadius: 10,
                        pointHoverRadius: 12,
                        pointStyle: 'star'
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: {
                        display: true,
                        text: 'Orgelschutz - Klimakorridor',
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
                                const label = context.dataset.label || '';
                                const temp = context.parsed.x.toFixed(1);
                                const rh = context.parsed.y.toFixed(1);
                                return `${label}: ${temp}°C, ${rh}% rF`;
                            }
                        }
                    },
                    annotation: {
                        annotations: {
                            safeZone: {
                                type: 'box',
                                xMin: TEMP_MIN,
                                xMax: TEMP_MAX,
                                yMin: RH_MIN,
                                yMax: RH_MAX,
                                backgroundColor: 'rgba(144, 238, 144, 0.2)',
                                borderColor: 'rgba(40, 167, 69, 0.8)',
                                borderWidth: 3,
                                label: {
                                    display: true,
                                    content: 'SICHERER BEREICH',
                                    position: 'center',
                                    font: {
                                        size: 14,
                                        weight: 'bold'
                                    },
                                    color: 'rgba(0, 100, 0, 0.8)'
                                }
                            },
                            tempMinLine: {
                                type: 'line',
                                xMin: TEMP_MIN,
                                xMax: TEMP_MIN,
                                borderColor: 'rgba(255, 99, 132, 0.5)',
                                borderWidth: 2,
                                borderDash: [5, 5]
                            },
                            tempMaxLine: {
                                type: 'line',
                                xMin: TEMP_MAX,
                                xMax: TEMP_MAX,
                                borderColor: 'rgba(255, 99, 132, 0.5)',
                                borderWidth: 2,
                                borderDash: [5, 5]
                            },
                            rhMinLine: {
                                type: 'line',
                                yMin: RH_MIN,
                                yMax: RH_MIN,
                                borderColor: 'rgba(255, 99, 132, 0.5)',
                                borderWidth: 2,
                                borderDash: [5, 5]
                            },
                            rhMaxLine: {
                                type: 'line',
                                yMin: RH_MAX,
                                yMax: RH_MAX,
                                borderColor: 'rgba(255, 99, 132, 0.5)',
                                borderWidth: 2,
                                borderDash: [5, 5]
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        type: 'linear',
                        position: 'bottom',
                        title: {
                            display: true,
                            text: 'Temperatur (°C)',
                            font: {
                                size: 14,
                                weight: 'bold'
                            }
                        },
                        min: 0,
                        max: 30,
                        ticks: {
                            stepSize: 2
                        }
                    },
                    y: {
                        title: {
                            display: true,
                            text: 'Relative Luftfeuchte (%)',
                            font: {
                                size: 14,
                                weight: 'bold'
                            }
                        },
                        min: 30,
                        max: 90,
                        ticks: {
                            stepSize: 10
                        }
                    }
                }
            }
        });

        return () => {
            if (chartInstance.current) {
                chartInstance.current.destroy();
            }
        };
    }, [organData]);

    const getStatusColor = (risk) => {
        if (risk === 'hoch') return 'danger';
        if (risk === 'mittel') return 'warning';
        return 'success';
    };

    const getStatusIcon = (inCorridor) => {
        return inCorridor ? '✓' : '✗';
    };

    return (
        <div className="card mb-4">
            <div className="card-body">
                <div style={{ position: 'relative', height: '450px' }}>
                    <canvas ref={chartRef}></canvas>
                </div>
                {currentStatus && (
                    <div className="mt-3">
                        <div className={`alert alert-${getStatusColor(currentStatus.risk)}`}>
                            <div className="row align-items-center">
                                <div className="col-md-1 text-center">
                                    <div style={{ fontSize: '48px' }}>
                                        {getStatusIcon(currentStatus.inCorridor)}
                                    </div>
                                </div>
                                <div className="col-md-11">
                                    <h5>Status Orgelklima</h5>
                                    <p className="mb-2">
                                        <strong>Aktuelle Werte:</strong> {currentStatus.temperature.toFixed(1)}°C, {currentStatus.relativeHumidity.toFixed(1)}% rF
                                    </p>
                                    <p className="mb-2">
                                        <strong>Zielkorridor:</strong> Temperatur {currentStatus.corridor.temp}, Feuchte {currentStatus.corridor.rh}
                                    </p>
                                    <p className="mb-0">
                                        <strong>{currentStatus.warning}</strong>
                                    </p>
                                </div>
                            </div>
                        </div>
                        <div className="alert alert-info mt-2">
                            <h6>Warum dieser Korridor?</h6>
                            <ul className="mb-0">
                                <li><strong>Temperatur 8-20°C:</strong> Vermeidung von Verstimmung durch thermische Ausdehnung der Pfeifen</li>
                                <li><strong>Feuchte 50-70%:</strong> Schutz vor Rissen (zu trocken) und Quellung (zu feucht) bei Holzpfeifen und -konstruktionen</li>
                                <li><strong>Stabilität wichtig:</strong> Schwankungen führen zu häufiger Nachstimmung und Material-Ermüdung</li>
                            </ul>
                        </div>
                        <div className="mt-2 small text-muted">
                            <p className="mb-0">
                                <em>Hinweis: Der optimale Klimakorridor kann je nach Orgelbauart und Alter variieren.
                                Konsultieren Sie im Zweifel einen Orgelbauer oder Restaurator.</em>
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default OrganProtection;
