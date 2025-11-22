import React, { useState, useRef, useCallback } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import 'react-pdf/dist/esm/Page/TextLayer.css';

// Set up the worker for PDF.js using unpkg CDN
pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

function PDFViewer({
  file,
  positionedPoints,
  liveData,
  selectedPoint,
  onAddPosition,
  onUpdatePosition,
  onRemovePoint
}) {
  const [numPages, setNumPages] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [draggedMarker, setDraggedMarker] = useState(null);
  const containerRef = useRef(null);

  function onDocumentLoadSuccess({ numPages }) {
    setNumPages(numPages);
  }

  function onPageLoadSuccess() {
    // Page loaded successfully
  }

  // Handle click on PDF to add a new marker
  const handlePdfClick = (event) => {
    if (!selectedPoint || draggedMarker) return;

    const rect = event.currentTarget.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    // Convert to percentage for responsive positioning
    const xPercent = (x / rect.width) * 100;
    const yPercent = (y / rect.height) * 100;

    onAddPosition({
      x: xPercent,
      y: yPercent
    });
  };

  // Handle marker drag start
  const handleMarkerDragStart = (event, point) => {
    event.stopPropagation();
    setDraggedMarker(point.object_id);
  };

  // Handle marker drag
  const handleMarkerDrag = useCallback((event) => {
    if (!draggedMarker || !containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    // Convert to percentage
    const xPercent = Math.max(0, Math.min(100, (x / rect.width) * 100));
    const yPercent = Math.max(0, Math.min(100, (y / rect.height) * 100));

    onUpdatePosition(draggedMarker, {
      x: xPercent,
      y: yPercent
    });
  }, [draggedMarker, onUpdatePosition]);

  // Handle marker drag end
  const handleMarkerDragEnd = () => {
    setDraggedMarker(null);
  };

  // Set up drag listeners
  React.useEffect(() => {
    if (draggedMarker) {
      document.addEventListener('mousemove', handleMarkerDrag);
      document.addEventListener('mouseup', handleMarkerDragEnd);

      return () => {
        document.removeEventListener('mousemove', handleMarkerDrag);
        document.removeEventListener('mouseup', handleMarkerDragEnd);
      };
    }
  }, [draggedMarker, handleMarkerDrag]);

  // Handle marker removal (right-click)
  const handleMarkerContextMenu = (event, objectId) => {
    event.preventDefault();
    if (window.confirm('Möchten Sie diesen Messpunkt entfernen?')) {
      onRemovePoint(objectId);
    }
  };

  return (
    <div>
      <div style={{ marginBottom: '10px' }}>
        <p>
          Seite {pageNumber} von {numPages || '--'}
        </p>
        {numPages > 1 && (
          <div>
            <button
              className="btn btn-secondary"
              disabled={pageNumber <= 1}
              onClick={() => setPageNumber(pageNumber - 1)}
            >
              Vorherige
            </button>
            <button
              className="btn btn-secondary"
              style={{ marginLeft: '10px' }}
              disabled={pageNumber >= numPages}
              onClick={() => setPageNumber(pageNumber + 1)}
            >
              Nächste
            </button>
          </div>
        )}
      </div>

      <div
        className="pdf-container"
        ref={containerRef}
        onClick={handlePdfClick}
        style={{
          position: 'relative',
          cursor: selectedPoint ? 'crosshair' : 'default'
        }}
      >
        <Document
          file={file}
          onLoadSuccess={onDocumentLoadSuccess}
          loading={<div className="loading">PDF wird geladen...</div>}
          error={<div className="error">Fehler beim Laden der PDF-Datei</div>}
        >
          <Page
            pageNumber={pageNumber}
            onLoadSuccess={onPageLoadSuccess}
            className="pdf-page"
            renderTextLayer={true}
            renderAnnotationLayer={true}
          />
        </Document>

        {/* Render markers for positioned points */}
        {positionedPoints.map((point) => {
          const data = liveData[point.object_id];
          return (
            <div
              key={point.object_id}
              className="marker"
              style={{
                left: `${point.position.x}%`,
                top: `${point.position.y}%`
              }}
              onMouseDown={(e) => handleMarkerDragStart(e, point)}
              onContextMenu={(e) => handleMarkerContextMenu(e, point.object_id)}
              title={point.payload?.title || point.object_id}
            >
              {data && (
                <div className="marker-popup">
                  <div className="marker-label">
                    {point.payload?.title || point.object_id}
                  </div>
                  <div className="marker-value">
                    {data.value !== null && data.value !== undefined
                      ? `${data.value.toFixed(2)} ${data.unit}`
                      : 'N/A'}
                  </div>
                </div>
              )}
              <span style={{ fontSize: '16px' }}>📍</span>
            </div>
          );
        })}
      </div>

      {selectedPoint && (
        <div style={{ marginTop: '10px', padding: '10px', backgroundColor: '#e7f3ff', borderRadius: '4px' }}>
          <strong>Ausgewählt:</strong> {selectedPoint.payload?.title || selectedPoint.object_id}
          <br />
          <small>Klicken Sie auf die PDF, um den Messpunkt zu positionieren</small>
        </div>
      )}
    </div>
  );
}

export default PDFViewer;
