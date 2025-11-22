import React, { useState } from 'react';

function MeasuringPointsList({ points, selectedPoint, positionedPoints, onSelectPoint }) {
  const [searchTerm, setSearchTerm] = useState('');

  // Filter points based on search term
  const filteredPoints = points.filter(point => {
    const title = point.payload?.title?.toLowerCase() || '';
    const objectId = point.object_id?.toLowerCase() || '';
    const search = searchTerm.toLowerCase();
    return title.includes(search) || objectId.includes(search);
  });

  // Check if a point is already positioned
  const isPositioned = (objectId) => {
    return positionedPoints.some(p => p.object_id === objectId);
  };

  return (
    <div>
      <input
        type="text"
        placeholder="Messpunkte suchen..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        style={{
          width: '100%',
          padding: '8px',
          marginBottom: '10px',
          border: '1px solid #ddd',
          borderRadius: '4px'
        }}
      />

      <div className="measuring-points-list">
        {filteredPoints.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '20px', color: '#999' }}>
            Keine Messpunkte gefunden
          </div>
        ) : (
          filteredPoints.map((point) => (
            <div
              key={point.object_id}
              className={`measuring-point-item ${
                selectedPoint?.object_id === point.object_id ? 'selected' : ''
              }`}
              onClick={() => onSelectPoint(point)}
              style={{
                opacity: isPositioned(point.object_id) ? 0.6 : 1
              }}
            >
              <div className="measuring-point-name">
                {point.payload?.title || 'Unbekannt'}
                {isPositioned(point.object_id) && (
                  <span style={{ marginLeft: '8px', fontSize: '12px' }}>✓</span>
                )}
              </div>
              <div className="measuring-point-id">
                {point.object_id}
              </div>
            </div>
          ))
        )}
      </div>

      {selectedPoint && (
        <div style={{
          marginTop: '10px',
          padding: '10px',
          backgroundColor: '#e7f3ff',
          borderRadius: '4px',
          fontSize: '12px'
        }}>
          <strong>Ausgewählt:</strong><br />
          {selectedPoint.payload?.title || selectedPoint.object_id}
        </div>
      )}
    </div>
  );
}

export default MeasuringPointsList;
