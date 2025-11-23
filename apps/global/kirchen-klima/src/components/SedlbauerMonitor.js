import React, { useEffect, useRef } from 'react';
import { Chart } from 'chart.js/auto';
import annotationPlugin from 'chartjs-plugin-annotation';

Chart.register(annotationPlugin);

/**
 * Sedlbauer Monitor - Isopleth Diagram for Mold Risk Assessment
 * Shows temperature vs. humidity with LIM (Lowest Isopleth for Mold) curves
 */
const SedlbauerMonitor = ({ data = [] }) => {
    const chartRef = useRef(null);
    const chartInstance = useRef(null);

    useEffect(() => {
        if (!chartRef.current) return;

        const ctx = chartRef.current.getContext('2d');

        // Destroy existing chart
        if (chartInstance.current) {
            chartInstance.current.destroy();
        }

        // Generate LIM curves for substrate classes
        const generateLIMCurve = (substratClass) => {
            const points = [];
            for (let temp = 0; temp <= 30; temp += 0.5) {
                let limThreshold;

                if (substratClass === 1) {
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

                points.push({ x: temp, y: limThreshold });
            }
            return points;
        };

        const limClass1 = generateLIMCurve(1);
        const limClass2 = generateLIMCurve(2);

        // Prepare measurement data points
        const measurementPoints = data.map(point => ({
            x: point.temperature,
            y: point.relativeHumidity
        }));

        // Create chart
        chartInstance.current = new Chart(ctx, {
            type: 'scatter',
            data: {
                datasets: [
                    {
                        label: 'LIM Substratklasse I (Putz, Holz)',
                        data: limClass1,
                        type: 'line',
                        borderColor: 'rgb(255, 99, 132)',
                        backgroundColor: 'rgba(255, 99, 132, 0.1)',
                        borderWidth: 2,
                        fill: {
                            target: 'origin',
                            above: 'rgba(255, 99, 132, 0.2)'
                        },
                        pointRadius: 0,
                        tension: 0.4
                    },
                    {
                        label: 'LIM Substratklasse II (Mineralisch)',
                        data: limClass2,
                        type: 'line',
                        borderColor: 'rgb(255, 159, 64)',
                        backgroundColor: 'rgba(255, 159, 64, 0.1)',
                        borderWidth: 2,
                        borderDash: [5, 5],
                        fill: false,
                        pointRadius: 0,
                        tension: 0.4
                    },
                    {
                        label: 'Messungen (letzte 30 Tage)',
                        data: measurementPoints,
                        type: 'scatter',
                        backgroundColor: function(context) {
                            const point = context.raw;
                            if (!point) return 'rgba(75, 192, 192, 0.7)';

                            // Check if point is in risk zone (above LIM curve)
                            const temp = point.x;
                            let limThreshold;

                            if (temp < 0) limThreshold = 100;
                            else if (temp < 10) limThreshold = 85 - (temp * 0.5);
                            else if (temp < 20) limThreshold = 80;
                            else if (temp <= 30) limThreshold = 78 + (temp - 20) * 0.2;
                            else limThreshold = 100;

                            return point.y >= limThreshold ? 'rgba(255, 0, 0, 0.7)' : 'rgba(75, 192, 192, 0.7)';
                        },
                        borderColor: 'rgba(75, 192, 192, 1)',
                        pointRadius: 4,
                        pointHoverRadius: 6
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: {
                        display: true,
                        text: 'Schimmelrisiko-Monitor (Sedlbauer-Isoplethen)',
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
                                xMin: 0,
                                xMax: 30,
                                yMin: 0,
                                yMax: 78,
                                backgroundColor: 'rgba(144, 238, 144, 0.1)',
                                borderWidth: 0,
                                label: {
                                    display: true,
                                    content: 'Sicherer Bereich',
                                    position: 'start'
                                }
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
                            stepSize: 5
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
                        min: 40,
                        max: 100,
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
    }, [data]);

    return (
        <div className="card mb-4">
            <div className="card-body">
                <div style={{ position: 'relative', height: '400px' }}>
                    <canvas ref={chartRef}></canvas>
                </div>
                <div className="mt-3 alert alert-info">
                    <strong>Legende:</strong>
                    <ul className="mb-0 mt-2">
                        <li><strong>Grüne Punkte:</strong> Sicherer Bereich - kein Schimmelrisiko</li>
                        <li><strong>Rote Punkte:</strong> Risikobereich - Schimmelgefahr!</li>
                        <li><strong>LIM-Kurven:</strong> Grenzen für Schimmelwachstum bei unterschiedlichen Materialien</li>
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default SedlbauerMonitor;
