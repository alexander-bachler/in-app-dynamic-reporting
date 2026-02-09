import { useState, useEffect } from 'react';
import L from 'leaflet';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { useDataStore } from '@/stores/dataStore';

// Fix default icon in bundler (Vite)
const icon = new L.Icon.Default();
(icon as unknown as { _getIconUrl?: () => void })._getIconUrl = undefined;
L.Icon.Default.mergeOptions({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const DEFAULT_CENTER: [number, number] = [47.8, 13.04];
const DEFAULT_ZOOM = 8;

export function ChurchMap() {
  const [mounted, setMounted] = useState(false);
  const { objectTree } = useDataStore();

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 0);
    return () => clearTimeout(t);
  }, []);

  const flatNodes = (nodes: { object_id: string; title: string; children: unknown[] }[]) =>
    nodes.flatMap((n) => [
      { id: n.object_id, title: n.title },
      ...flatNodes((n.children as typeof nodes) ?? []),
    ]);
  const items = flatNodes(objectTree);

  if (!mounted) {
    return (
      <div className="lm-panel flex h-96 w-full items-center justify-center text-[#666]">
        Karte wird geladen…
      </div>
    );
  }

  return (
    <div className="lm-panel h-96 w-full overflow-hidden">
      <MapContainer center={DEFAULT_CENTER} zoom={DEFAULT_ZOOM} style={{ height: '100%', width: '100%' }}>
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution="&copy; OpenStreetMap" />
        {items.length > 0 && (
          <Marker position={DEFAULT_CENTER}>
            <Popup>
              <strong>Kirchen / Objekte</strong>
              <ul className="mt-1 list-inside list-disc text-sm">
                {items.slice(0, 15).map((node) => (
                  <li key={node.id}>{node.title}</li>
                ))}
                {items.length > 15 && <li>… und weitere</li>}
              </ul>
            </Popup>
          </Marker>
        )}
      </MapContainer>
    </div>
  );
}
