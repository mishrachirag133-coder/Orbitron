import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import { MapPin, Compass } from 'lucide-react';

interface AOIMapPickerProps {
  bbox: [number, number, number, number]; // [minLon, minLat, maxLon, maxLat]
  onBBoxChange: (bbox: [number, number, number, number]) => void;
}

export const AOIMapPicker: React.FC<AOIMapPickerProps> = ({ bbox, onBBoxChange }) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const rectangleRef = useRef<L.Rectangle | null>(null);

  const [minLon, minLat, maxLon, maxLat] = bbox;
  const centerLat = (minLat + maxLat) / 2.0;
  const centerLng = (minLon + maxLon) / 2.0;

  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [centerLat, centerLng],
        zoom: 12,
        zoomControl: false,
      });

      L.control.zoom({ position: 'bottomright' }).addTo(map);

      // Clean satellite basemap
      L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
        attribution: 'Esri, Maxar',
        maxZoom: 18,
      }).addTo(map);

      const bounds = L.latLngBounds([minLat, minLon], [maxLat, maxLon]);
      const rect = L.rectangle(bounds, {
        color: '#10b981',
        weight: 2,
        fillColor: '#10b981',
        fillOpacity: 0.15,
        dashArray: '5, 5',
      }).addTo(map);

      mapInstanceRef.current = map;
      rectangleRef.current = rect;
      map.fitBounds(bounds, { padding: [30, 30] });

      // Click to center or move AOI
      map.on('click', (e: L.LeafletMouseEvent) => {
        const cLat = e.latlng.lat;
        const cLng = e.latlng.lng;
        const halfLat = 0.035;
        const halfLng = 0.045;
        const newBbox: [number, number, number, number] = [
          Number((cLng - halfLng).toFixed(4)),
          Number((cLat - halfLat).toFixed(4)),
          Number((cLng + halfLng).toFixed(4)),
          Number((cLat + halfLat).toFixed(4)),
        ];
        onBBoxChange(newBbox);
      });
    } else {
      const bounds = L.latLngBounds([minLat, minLon], [maxLat, maxLon]);
      if (rectangleRef.current) {
        rectangleRef.current.setBounds(bounds);
      }
      mapInstanceRef.current.panTo([centerLat, centerLng]);
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [minLon, minLat, maxLon, maxLat]);

  return (
    <div className="relative rounded-xl overflow-hidden border border-slate-800 bg-slate-950 h-64 w-full">
      <div ref={mapContainerRef} className="w-full h-full" />

      {/* Top overlay hint */}
      <div className="absolute top-2.5 left-2.5 z-20 pointer-events-none">
        <div className="bg-slate-900/90 backdrop-blur-md border border-slate-700/80 rounded-lg px-2.5 py-1 text-xs text-slate-300 font-mono shadow-lg flex items-center gap-1.5">
          <MapPin className="w-3.5 h-3.5 text-emerald-400" />
          <span>Click map to reposition Target Field AOI</span>
        </div>
      </div>

      {/* Bottom overlay coordinates */}
      <div className="absolute bottom-2.5 left-2.5 z-20 pointer-events-none">
        <div className="bg-slate-900/90 backdrop-blur-md border border-slate-700/80 rounded-lg px-2.5 py-1 text-[11px] text-slate-400 font-mono shadow-lg">
          BBOX: [{minLon.toFixed(3)}, {minLat.toFixed(3)}, {maxLon.toFixed(3)}, {maxLat.toFixed(3)}]
        </div>
      </div>
    </div>
  );
};
