import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { Layers, Sliders, SplitSquareVertical, Eye, Maximize2, Minimize2, MapPin, Compass } from 'lucide-react';
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
  const [basemapType, setBasemapType] = useState<'satellite' | 'dark'>('satellite');
  const [showBBox, setShowBBox] = useState<boolean>(true);
  const [cursorCoords, setCursorCoords] = useState<{ lat: number; lng: number } | null>(null);

  // Selected layers to show
  const [activeClasses, setActiveClasses] = useState({
    clear: true,
    thickCloud: true,
    thinCirrus: true,
    shadow: true,
  });

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

      // Basemap Layer
      const esriSatellite = L.tileLayer(
        'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
        {
          attribution: 'Esri, Maxar, Earthstar Geographics',
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
        color: '#10b981',
        weight: 1.5,
        fillColor: 'transparent',
        dashArray: '4, 4',
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

  // Adjust layer opacities and visibility based on viewMode and settings
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
      // In split mode, the custom DOM split handles visual separation
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

  const handleSplitDrag = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
    const percentage = (x / rect.width) * 100;
    setSplitPosition(percentage);
  };

  return (
    <div
      className={`relative rounded-xl overflow-hidden border border-slate-800 bg-slate-950 flex flex-col transition-all duration-300 ${
        isFullscreen ? 'fixed inset-0 z-50 rounded-none' : 'h-[540px] w-full'
      }`}
    >
      {/* Top Map Action Toolbar */}
      <div className="absolute top-3 left-3 right-3 z-20 flex flex-wrap items-center justify-between gap-2 pointer-events-none">
        {/* Left: Mode selector pill */}
        <div className="pointer-events-auto flex items-center bg-slate-900/90 backdrop-blur-md border border-slate-700/80 rounded-lg p-1 shadow-xl">
          <button
            onClick={() => setViewMode('split')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
              viewMode === 'split'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
            title="Split screen slider comparison"
          >
            <SplitSquareVertical className="w-3.5 h-3.5" />
            <span>Split Swipe</span>
          </button>

          <button
            onClick={() => setViewMode('blend')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
              viewMode === 'blend'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
            title="Blend overlay with opacity slider"
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Blend Alpha</span>
          </button>

          <button
            onClick={() => setViewMode('rgb')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
              viewMode === 'rgb'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
            title="True color RGB only"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>RGB Only</span>
          </button>

          <button
            onClick={() => setViewMode('mask')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
              viewMode === 'mask'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
            title="Cloud mask classification only"
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Mask Only</span>
          </button>
        </div>

        {/* Right: Quick toggles (Bounding box, Fullscreen) */}
        <div className="pointer-events-auto flex items-center gap-2">
          {viewMode === 'blend' && (
            <div className="flex items-center gap-2 bg-slate-900/90 backdrop-blur-md border border-slate-700/80 rounded-lg px-3 py-1.5 shadow-xl text-xs text-slate-300">
              <span className="text-slate-400 font-mono">Opacity:</span>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={maskOpacity}
                onChange={(e) => setMaskOpacity(parseFloat(e.target.value))}
                className="w-24 h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-emerald-500"
              />
              <span className="font-mono text-emerald-400 w-8 text-right">
                {Math.round(maskOpacity * 100)}%
              </span>
            </div>
          )}

          <button
            onClick={() => setShowBBox(!showBBox)}
            className={`px-2.5 py-1.5 rounded-lg border text-xs font-medium backdrop-blur-md transition-colors ${
              showBBox
                ? 'bg-slate-900/90 border-emerald-500/40 text-emerald-300'
                : 'bg-slate-900/70 border-slate-800 text-slate-400 hover:text-white'
            }`}
            title="Toggle AOI Bounding Box"
          >
            AOI Polygon
          </button>

          <button
            onClick={toggleFullscreen}
            className="p-1.5 rounded-lg bg-slate-900/90 backdrop-blur-md border border-slate-700/80 text-slate-300 hover:text-white hover:border-slate-500 transition-colors shadow-xl"
            title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
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
          {/* Right side mask banner tag */}
          <div className="absolute top-16 right-4 bg-purple-950/80 border border-purple-500/40 text-purple-300 font-mono text-xs px-2.5 py-1 rounded shadow-lg backdrop-blur-sm pointer-events-none">
            Mask Layer (AI Segmented)
          </div>
        </div>
      )}

      {viewMode === 'split' && (
        <div
          className="absolute top-16 left-4 bg-sky-950/80 border border-sky-500/40 text-sky-300 font-mono text-xs px-2.5 py-1 rounded shadow-lg backdrop-blur-sm pointer-events-none z-10"
          style={{ opacity: splitPosition < 15 ? 0 : 1 }}
        >
          RGB True Color ({sensor})
        </div>
      )}

      {/* Split Slider Handle (Interactive) */}
      {viewMode === 'split' && (
        <div
          className="absolute top-0 bottom-0 z-20 w-1 bg-emerald-400 cursor-ew-resize flex items-center justify-center pointer-events-auto"
          style={{ left: `${splitPosition}%` }}
        >
          <div className="w-7 h-7 -ml-3 bg-emerald-500 text-slate-950 rounded-full flex items-center justify-center shadow-lg border border-white/50">
            <SplitSquareVertical className="w-4 h-4" />
          </div>
        </div>
      )}

      {/* Bottom Floating Legend & Geospatial Coordinates */}
      <div className="absolute bottom-3 left-3 z-20 pointer-events-none flex flex-wrap items-end gap-3">
        {/* Classification Color Legend */}
        <div className="pointer-events-auto bg-slate-900/90 backdrop-blur-md border border-slate-800 rounded-lg p-2.5 shadow-2xl flex flex-wrap items-center gap-3 text-xs">
          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider pr-1 border-r border-slate-800">
            Mask Legend:
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-sm bg-emerald-500 inline-block shadow-sm shadow-emerald-500/40" />
            <span className="text-slate-300 font-medium">Clear Surface</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-sm bg-sky-400 inline-block shadow-sm shadow-sky-400/40" />
            <span className="text-slate-300 font-medium">Thick Cloud</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-sm bg-amber-400 inline-block shadow-sm shadow-amber-400/40" />
            <span className="text-slate-300 font-medium">Thin Cirrus</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-sm bg-purple-500 inline-block shadow-sm shadow-purple-500/40" />
            <span className="text-slate-300 font-medium">Cloud Shadow</span>
          </div>
        </div>

        {/* Location & Cursor Telemetry HUD */}
        {cursorCoords && (
          <div className="pointer-events-auto bg-slate-900/80 backdrop-blur-md border border-slate-800/80 rounded-lg px-2.5 py-1.5 shadow-xl text-[11px] font-mono text-slate-400 flex items-center gap-2">
            <Compass className="w-3.5 h-3.5 text-emerald-400" />
            <span>Lat: {cursorCoords.lat}°</span>
            <span className="text-slate-600">|</span>
            <span>Lng: {cursorCoords.lng}°</span>
            {bounds?.resolution_m && (
              <>
                <span className="text-slate-600">|</span>
                <span className="text-emerald-400">{bounds.resolution_m}m/px</span>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
