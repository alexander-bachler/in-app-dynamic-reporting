import React, { useEffect, useRef, useState } from 'react';
import { Chart, registerables } from 'chart.js';
import annotationPlugin from 'chartjs-plugin-annotation';
import { calculateSaltRisk } from '../utils/climate-math';
import { format } from 'date-fns';

// Register Chart.js components
Chart.register(...registerables, annotationPlugin);

/**
 * Salt Monitor for Masonry Protection
 * Monitors relative humidity to prevent salt crystallization damage
 * Tracks phase transitions that cause material stress
 */
const SaltMonitor = ({ wallData = [] }) => {
    const chartRef = useRef(null);
    const chartInstance = useRef(null);
    const [phaseTransitions, setPhaseTransitions] = useState(0);
    const [currentRisk, setCurrentRisk] = useState(null);

    useEffect(() => {
        if (wallData.length === 0) return;

        // Calculate phase transitions (crossing 75% threshold)
        let transitions = 0;
        let wasAbove75 = wallData[0].relativeHumidity >= 75;

        for (let i = 1; i < wallData.length; i++) {
            const isAbove75 = wallData[i].relativeHumidity >= 75;
            if (isAbove75 !== wasAbove75) {
                transitions++;
                wasAbove75 = isAbove75;
            }
        }

        setPhaseTransitions(transitions);

        // Calculate current risk
        const latestRH = wallData[wallData.length - 1].relativeHumidity;
        setCurrentRisk(calculateSaltRisk(latestRH));
    }, [wallData]);

    useEffect(() => {
        if (!chartRef.current) return;

        const ctx = chartRef.current.getContext('2d');

        // Destroy existing chart
        if (chartInstance.current) {
            chartInstance.current.destroy();
        }

        // Prepare data
        const labels = wallData.map(point => format(new Date(point.timestamp), 'dd.MM HH:mm'));
        const rhData = wallData.map(point => point.relativeHumidity);

        // Create chart
        chartInstance.current = new Chart(ctx, {
            type: 'line',
            data: {
                labels,
                datasets: [
                    {
                        label: 'Relative Feuchte Wand',
                        data: rhData,
                        borderColor: 'rgb(75, 192, 192)',
                        backgroundColor: 'rgba(75, 192, 192, 0.2)',
                        borderWidth: 2,
                        fill: true,
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
                        text: 'Salz-Wächter - Mauerwerksschutz',
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
                                return `${context.dataset.label}: ${context.parsed.y.toFixed(1)}% rF`;
                            }
                        }
                    },
                    annotation: {
                        annotations: {
                            saltNaCl: {
                                type: 'line',
                                yMin: 75.5,
                                yMax: 75.5,
                                borderColor: 'rgb(255, 99, 132)',
                                borderWidth: 2,
                                borderDash: [5, 5],
                                label: {
                                    display: true,
                                    content: 'NaCl (Kochsalz) 75.5%',
                                    position: 'end',
                                    backgroundColor: 'rgba(255, 99, 132, 0.8)',
                                    color: 'white',
                                    font: {
                                        size: 11
                                    }
                                }
                            },
                            saltNaNO3: {
                                type: 'line',
                                yMin: 74,
                                yMax: 74,
                                borderColor: 'rgb(255, 159, 64)',
                                borderWidth: 2,
                                borderDash: [5, 5],
                                label: {
                                    display: true,
                                    content: 'NaNO₃ (Natriumnitrat) 74%',
                                    position: 'start',
                                    backgroundColor: 'rgba(255, 159, 64, 0.8)',
                                    color: 'white',
                                    font: {
                                        size: 11
                                    }
                                }
                            },
                            saltNa2SO4: {
                                type: 'line',
                                yMin: 84,
                                yMax: 84,
                                borderColor: 'rgb(153, 102, 255)',
                                borderWidth: 2,
                                borderDash: [5, 5],
                                label: {
                                    display: true,
                                    content: 'Na₂SO₄ (Glaubersalz) 84%',
                                    position: 'end',
                                    backgroundColor: 'rgba(153, 102, 255, 0.8)',
                                    color: 'white',
                                    font: {
                                        size: 11
                                    }
                                }
                            },
                            criticalZone: {
                                type: 'box',
                                yMin: 70,
                                yMax: 80,
                                backgroundColor: 'rgba(255, 206, 86, 0.1)',
                                borderWidth: 0,
                                label: {
                                    display: true,
                                    content: 'Kritischer Bereich',
                                    position: 'center'
                                }
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        title: {
                            display: true,
                            text: 'Zeit'
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
                        max: 95,
                        ticks: {
                            stepSize: 5
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
    }, [wallData]);

    const getRiskColor = (risk) => {
        if (risk === 'hoch') return 'danger';
        if (risk === 'mittel') return 'warning';
        return 'success';
    };

    return (
        <div className="card mb-4">
            <div className="card-body">
                <div style={{ position: 'relative', height: '400px' }}>
                    <canvas ref={chartRef}></canvas>
                </div>
                {currentRisk && (
                    <div className="mt-3">
                        <div className={`alert alert-${getRiskColor(currentRisk.overallRisk)}`}>
                            <div className="row">
                                <div className="col-md-6">
                                    <h5>Aktuelle Risikobewertung</h5>
                                    <p className="mb-2">
                                        <strong>Gesamtrisiko:</strong> {currentRisk.overallRisk.toUpperCase()}
                                    </p>
                                    <p className="mb-2">
                                        <strong>Aktuelle rF:</strong> {currentRisk.relativeHumidity.toFixed(1)}%
                                    </p>
                                    <p className="mb-0">
                                        <strong>Empfehlung:</strong> {currentRisk.recommendation}
                                    </p>
                                </div>
                                <div className="col-md-6">
                                    <h5>Phasenwechsel-Zähler</h5>
                                    <p className="mb-2">
                                        <strong>Anzahl Übergänge (75%):</strong> {phaseTransitions}
                                    </p>
                                    <p className="mb-0 small">
                                        <em>Häufige Phasenwechsel (Kristallisation ↔ Lösung) belasten das Mauerwerk besonders stark.</em>
                                    </p>
                                </div>
                            </div>
                        </div>
                        {currentRisk.risks && currentRisk.risks.length > 0 && (
                            <div className="alert alert-info mt-2">
                                <strong>Salzanalyse:</strong>
                                <ul className="mb-0 mt-2">
                                    {currentRisk.risks.map((risk, index) => (
                                        <li key={index}>
                                            <strong>{risk.salt}:</strong> {risk.message}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                        <div className="mt-2 small text-muted">
                            <p className="mb-1"><strong>Hintergrund:</strong></p>
                            <p className="mb-0">
                                Salze im Mauerwerk wechseln je nach Luftfeuchte zwischen gelöstem und kristallinem Zustand.
                                Beim Kristallisieren dehnen sie sich aus und erzeugen Sprengdruck im Material.
                                Häufige Phasenwechsel führen zu mechanischer Zerstörung (Ausblühungen, Abplatzungen).
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SaltMonitor;
