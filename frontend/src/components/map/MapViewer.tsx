import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { Layers, Sliders, SplitSquareVertical, Eye, Maximize2, Minimize2, Compass } from 'lucide-react';
import { GeoBounds } from '../../types/job';

interface MapViewerProps {
  rgbUrl?: string;
  maskUrl?: string;
  bounds?: GeoBounds;
  sensor?: string;
}

export const MapViewer: React.FC<MapViewerProps> = ({
  rgbUrl = 'https://images.unsplash.com/photo-1541872703-74c5e44368f9?auto=format&fit=crop&w=1600&q=80',
  maskUrl = 'https://images.unsplash.com/photo-1502134249126-9f3755a50d78?auto=format&fit=crop&w=1600&q=80',
  bounds,
  sensor = 'Sentinel-2',
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const rgbOverlayRef = useRef<L.ImageOverlay | null>(null);
  const maskOverlayRef = useRef<L.ImageOverlay | null>(null);
  const polygonRef = useRef<L.Polygon | null>(null);

  // Viewer modes: 'split' | 'blend' | 'rgb' | 'mask'
  const [viewMode, setViewMode] = useState<'split' | 'blend' | 'rgb' | 'mask'>('split');
  const [maskOpacity, setMaskOpacity] = useState<number>(0.75);
  const [splitPosition, setSplitPosition] = useState<number>(50); // percentage 0-100
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [showBBox, setShowBBox] = useState<boolean>(true);
  const [cursorCoords, setCursorCoords] = useState<{ lat: number; lng: number } | null>(null);

  const centerLat = bounds?.center ? bounds.center[0] : 37.7749;
  const centerLng = bounds?.center ? bounds.center[1] : -122.4194;

  const southWest = L.latLng(centerLat - 0.12, centerLng - 0.18);
  const northEast = L.latLng(centerLat + 0.12, centerLng + 0.18);
  const imageBounds = L.latLngBounds(southWest, northEast);

  // Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [centerLat, centerLng],
        zoom: 12,
        zoomControl: false,
        attributionControl: true,
      });

      L.control.zoom({ position: 'bottomright' }).addTo(map);

      // Clean Esri Satellite Basemap
      const esriSatellite = L.tileLayer(
        'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
        {
          attribution: 'Esri, Maxar',
          maxZoom: 18,
        }
      );

      esriSatellite.addTo(map);

      // Create RGB Image Overlay
      const rgbLayer = L.imageOverlay(rgbUrl, imageBounds, {
        opacity: 1,
        interactive: false,
      }).addTo(map);

      // Create Mask Overlay
      const maskLayer = L.imageOverlay(maskUrl, imageBounds, {
        opacity: 0.75,
        interactive: false,
      }).addTo(map);

      // Create AOI bounding box polygon
      const polygon = L.rectangle(imageBounds, {
        color: '#059669',
        weight: 2,
        fillColor: 'transparent',
        dashArray: '5, 5',
      }).addTo(map);

      mapInstanceRef.current = map;
      rgbOverlayRef.current = rgbLayer;
      maskOverlayRef.current = maskLayer;
      polygonRef.current = polygon;

      map.fitBounds(imageBounds, { padding: [20, 20] });

      map.on('mousemove', (e: L.LeafletMouseEvent) => {
        setCursorCoords({
          lat: Number(e.latlng.lat.toFixed(5)),
          lng: Number(e.latlng.lng.toFixed(5)),
        });
      });
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [centerLat, centerLng]);

  // Adjust layer opacities and visibility based on viewMode
  useEffect(() => {
    if (!maskOverlayRef.current || !rgbOverlayRef.current) return;

    if (viewMode === 'rgb') {
      rgbOverlayRef.current.setOpacity(1);
      maskOverlayRef.current.setOpacity(0);
    } else if (viewMode === 'mask') {
      rgbOverlayRef.current.setOpacity(0);
      maskOverlayRef.current.setOpacity(1);
    } else if (viewMode === 'blend') {
      rgbOverlayRef.current.setOpacity(1);
      maskOverlayRef.current.setOpacity(maskOpacity);
    } else if (viewMode === 'split') {
      rgbOverlayRef.current.setOpacity(1);
      maskOverlayRef.current.setOpacity(0.85);
    }
  }, [viewMode, maskOpacity]);

  // Toggle bounding box polygon
  useEffect(() => {
    if (!polygonRef.current || !mapInstanceRef.current) return;
    if (showBBox) {
      polygonRef.current.addTo(mapInstanceRef.current);
    } else {
      polygonRef.current.remove();
    }
  }, [showBBox]);

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
    setTimeout(() => {
      mapInstanceRef.current?.invalidateSize();
    }, 150);
  };

  return (
    <div
      className={`relative rounded-xl overflow-hidden border border-slate-200 bg-slate-100 flex flex-col transition-all duration-300 ${
        isFullscreen ? 'fixed inset-0 z-50 rounded-none' : 'h-[500px] w-full shadow-sm'
      }`}
    >
      {/* Top Map Action Toolbar */}
      <div className="absolute top-3 left-3 right-3 z-20 flex flex-wrap items-center justify-between gap-2 pointer-events-none">
        {/* Left: Mode selector pill */}
        <div className="pointer-events-auto flex items-center bg-white/95 backdrop-blur-md border border-slate-200 rounded-lg p-1 shadow-md">
          <button
            onClick={() => setViewMode('split')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
              viewMode === 'split'
                ? 'bg-slate-900 text-white shadow-xs font-semibold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
            title="Split swipe slider"
          >
            <SplitSquareVertical className="w-3.5 h-3.5" />
            <span>Split View</span>
          </button>

          <button
            onClick={() => setViewMode('blend')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
              viewMode === 'blend'
                ? 'bg-slate-900 text-white shadow-xs font-semibold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
            title="Blend overlay with opacity slider"
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Blend Overlay</span>
          </button>

          <button
            onClick={() => setViewMode('rgb')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
              viewMode === 'rgb'
                ? 'bg-slate-900 text-white shadow-xs font-semibold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
            title="Natural True Color Image"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Satellite Only</span>
          </button>

          <button
            onClick={() => setViewMode('mask')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
              viewMode === 'mask'
                ? 'bg-slate-900 text-white shadow-xs font-semibold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
            title="Cloud Mask Only"
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Mask Only</span>
          </button>
        </div>

        {/* Right: Quick toggles */}
        <div className="pointer-events-auto flex items-center gap-2">
          {viewMode === 'blend' && (
            <div className="flex items-center gap-2 bg-white/95 backdrop-blur-md border border-slate-200 rounded-lg px-3 py-1.5 shadow-md text-xs text-slate-700">
              <span className="text-slate-500 font-medium">Mask Opacity:</span>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={maskOpacity}
                onChange={(e) => setMaskOpacity(parseFloat(e.target.value))}
                className="w-20 h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
              />
              <span className="font-mono font-semibold text-slate-900 w-8 text-right">
                {Math.round(maskOpacity * 100)}%
              </span>
            </div>
          )}

          <button
            onClick={() => setShowBBox(!showBBox)}
            className={`px-3 py-1.5 rounded-lg border text-xs font-medium backdrop-blur-md shadow-md transition-colors ${
              showBBox
                ? 'bg-white border-emerald-600 text-emerald-700 font-semibold'
                : 'bg-white/95 border-slate-200 text-slate-600 hover:text-slate-900'
            }`}
            title="Toggle Bounding Boundary"
          >
            Boundary Box
          </button>

          <button
            onClick={toggleFullscreen}
            className="p-2 rounded-lg bg-white/95 backdrop-blur-md border border-slate-200 text-slate-600 hover:text-slate-900 transition-colors shadow-md"
            title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
          >
            {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Map Leaflet Container */}
      <div ref={mapContainerRef} className="w-full h-full relative" />

      {/* Split screen visual swipe curtain when in 'split' mode */}
      {viewMode === 'split' && (
        <div
          className="absolute inset-0 pointer-events-none z-10 overflow-hidden"
          style={{ clipPath: `inset(0 0 0 ${splitPosition}%)` }}
        >
          <div className="absolute top-16 right-4 bg-white/95 border border-slate-200 text-slate-800 text-xs px-2.5 py-1 rounded shadow-md font-medium pointer-events-none">
            Cloud Mask Layer
          </div>
        </div>
      )}

      {viewMode === 'split' && (
        <div
          className="absolute top-16 left-4 bg-white/95 border border-slate-200 text-slate-800 text-xs px-2.5 py-1 rounded shadow-md font-medium pointer-events-none z-10"
          style={{ opacity: splitPosition < 15 ? 0 : 1 }}
        >
          True Color ({sensor})
        </div>
      )}

      {/* Split Slider Handle (Interactive) */}
      {viewMode === 'split' && (
        <div
          className="absolute top-0 bottom-0 z-20 w-1 bg-white cursor-ew-resize flex items-center justify-center pointer-events-auto shadow-md"
          style={{ left: `${splitPosition}%` }}
        >
          <div className="w-7 h-7 -ml-3 bg-white text-slate-800 rounded-full flex items-center justify-center shadow-lg border border-slate-300">
            <SplitSquareVertical className="w-3.5 h-3.5" />
          </div>
        </div>
      )}

      {/* Bottom Floating Legend & Geospatial Coordinates */}
      <div className="absolute bottom-3 left-3 z-20 pointer-events-none flex flex-wrap items-end gap-3">
        {/* Classification Color Legend */}
        <div className="pointer-events-auto bg-white/95 backdrop-blur-md border border-slate-200 rounded-lg p-2.5 shadow-md flex flex-wrap items-center gap-3 text-xs">
          <div className="text-[11px] font-bold text-slate-700 uppercase tracking-wider pr-1 border-r border-slate-200">
            Legend:
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-xs bg-emerald-600 inline-block" />
            <span className="text-slate-700 font-medium">Clear Ground</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-xs bg-sky-500 inline-block" />
            <span className="text-slate-700 font-medium">Thick Cloud</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-xs bg-amber-500 inline-block" />
            <span className="text-slate-700 font-medium">Thin Cirrus</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-xs bg-purple-500 inline-block" />
            <span className="text-slate-700 font-medium">Cloud Shadow</span>
          </div>
        </div>

        {/* Location & Cursor Telemetry */}
        {cursorCoords && (
          <div className="pointer-events-auto bg-white/95 backdrop-blur-md border border-slate-200 rounded-lg px-2.5 py-1.5 shadow-md text-[11px] font-mono text-slate-600 flex items-center gap-2">
            <Compass className="w-3.5 h-3.5 text-slate-500" />
            <span>Lat: {cursorCoords.lat}°</span>
            <span className="text-slate-300">|</span>
            <span>Lng: {cursorCoords.lng}°</span>
            {bounds?.resolution_m && (
              <>
                <span className="text-slate-300">|</span>
                <span className="text-slate-700 font-semibold">{bounds.resolution_m}m/px</span>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
