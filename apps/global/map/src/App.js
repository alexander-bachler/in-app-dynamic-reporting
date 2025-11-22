import React, { useState, useEffect, useCallback } from 'react';
import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import ApiClient from '@project/api-client';
import PDFViewer from './components/PDFViewer';
import MeasuringPointsList from './components/MeasuringPointsList';

function App() {
  const [apiClient] = useState(() => new ApiClient());
  const [pdfFile, setPdfFile] = useState(null);
  const [measuringPoints, setMeasuringPoints] = useState([]);
  const [selectedPoint, setSelectedPoint] = useState(null);
  const [positionedPoints, setPositionedPoints] = useState([]);
  const [liveData, setLiveData] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load measuring points from API
  useEffect(() => {
    const loadMeasuringPoints = async () => {
      try {
        setLoading(true);
        setError(null);
        const points = await apiClient.getMeasuringPoint();
        setMeasuringPoints(points);
      } catch (err) {
        console.error('Error loading measuring points:', err);
        setError('Fehler beim Laden der Messpunkte: ' + err.message);
      } finally {
        setLoading(false);
      }
    };

    loadMeasuringPoints();
  }, [apiClient]);

  // Load saved configuration from localStorage
  useEffect(() => {
    const savedConfig = localStorage.getItem('mapReportConfig');
    if (savedConfig) {
      try {
        const config = JSON.parse(savedConfig);
        if (config.positionedPoints) {
          setPositionedPoints(config.positionedPoints);
        }
      } catch (err) {
        console.error('Error loading saved configuration:', err);
      }
    }
  }, []);

  // Save configuration to localStorage
  const saveConfiguration = useCallback(() => {
    const config = {
      positionedPoints
    };
    localStorage.setItem('mapReportConfig', JSON.stringify(config));
  }, [positionedPoints]);

  // Fetch live data for positioned points
  const fetchLiveData = useCallback(async () => {
    if (positionedPoints.length === 0) return;

    const now = new Date();
    const timeTo = now.toISOString();
    const timeFrom = new Date(now.getTime() - 60000).toISOString(); // Last minute

    const newLiveData = {};

    for (const point of positionedPoints) {
      try {
        const data = await apiClient.getDataForMeasuringPoint(
          point.object_id,
          timeFrom,
          timeTo,
          'PT1M',
          'Europe/Vienna'
        );

        if (data && data.length > 0) {
          const latestData = data[data.length - 1];
          newLiveData[point.object_id] = {
            value: latestData.value,
            unit: latestData.unit || '',
            timestamp: latestData.time
          };
        }
      } catch (err) {
        console.error(`Error fetching data for point ${point.object_id}:`, err);
      }
    }

    setLiveData(newLiveData);
  }, [positionedPoints, apiClient]);

  // Set up interval for live data fetching
  useEffect(() => {
    if (positionedPoints.length === 0) return;

    // Initial fetch
    fetchLiveData();

    // Set up 10-second interval
    const interval = setInterval(() => {
      fetchLiveData();
    }, 10000);

    return () => clearInterval(interval);
  }, [positionedPoints, fetchLiveData]);

  // Handle PDF file upload
  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file && file.type === 'application/pdf') {
      setPdfFile(file);
    } else {
      alert('Bitte wählen Sie eine gültige PDF-Datei aus.');
    }
  };

  // Handle measuring point selection
  const handlePointSelect = (point) => {
    setSelectedPoint(point);
  };

  // Handle positioning a measuring point on the PDF
  const handleAddPosition = (position) => {
    if (!selectedPoint) return;

    const newPoint = {
      ...selectedPoint,
      position: {
        x: position.x,
        y: position.y
      }
    };

    setPositionedPoints(prev => {
      // Remove if already positioned
      const filtered = prev.filter(p => p.object_id !== selectedPoint.object_id);
      return [...filtered, newPoint];
    });

    setSelectedPoint(null);
  };

  // Handle updating position of an existing marker
  const handleUpdatePosition = (objectId, newPosition) => {
    setPositionedPoints(prev =>
      prev.map(point =>
        point.object_id === objectId
          ? { ...point, position: newPosition }
          : point
      )
    );
  };

  // Handle removing a positioned point
  const handleRemovePoint = (objectId) => {
    setPositionedPoints(prev =>
      prev.filter(point => point.object_id !== objectId)
    );
  };

  // Clear all positioned points
  const handleClearAll = () => {
    if (window.confirm('Möchten Sie wirklich alle positionierten Messpunkte entfernen?')) {
      setPositionedPoints([]);
      setLiveData({});
    }
  };

  return (
    <div className="App">
      <div className="container">
        <div className="header">
          <h1>Map Reporting</h1>
          <p>Laden Sie ein PDF hoch und positionieren Sie Messpunkte für Live-Datenvisualisierung</p>
        </div>

        {error && <div className="error">{error}</div>}

        <div className="main-content">
          <div className="sidebar">
            <div className="upload-section">
              <h3>PDF hochladen</h3>
              <div className="file-input-wrapper">
                <input
                  type="file"
                  id="pdf-upload"
                  accept="application/pdf"
                  onChange={handleFileUpload}
                />
                <label htmlFor="pdf-upload" className="file-input-label">
                  {pdfFile ? pdfFile.name : 'PDF auswählen'}
                </label>
              </div>
            </div>

            <div className="measuring-points-section">
              <h3>Messpunkte</h3>
              {loading ? (
                <div className="loading">Lade Messpunkte...</div>
              ) : (
                <MeasuringPointsList
                  points={measuringPoints}
                  selectedPoint={selectedPoint}
                  positionedPoints={positionedPoints}
                  onSelectPoint={handlePointSelect}
                />
              )}
            </div>

            <div className="controls">
              <button className="btn btn-primary" onClick={saveConfiguration}>
                Speichern
              </button>
              <button className="btn btn-danger" onClick={handleClearAll}>
                Alle löschen
              </button>
            </div>
          </div>

          <div className="map-viewer">
            {pdfFile ? (
              <PDFViewer
                file={pdfFile}
                positionedPoints={positionedPoints}
                liveData={liveData}
                selectedPoint={selectedPoint}
                onAddPosition={handleAddPosition}
                onUpdatePosition={handleUpdatePosition}
                onRemovePoint={handleRemovePoint}
              />
            ) : (
              <div className="empty-state">
                <div className="empty-state-icon">📄</div>
                <div className="empty-state-text">Kein PDF geladen</div>
                <div className="empty-state-subtext">
                  Laden Sie ein PDF hoch, um zu beginnen
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
