import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { 
  Layers, 
  Sliders, 
  SplitSquareVertical, 
  Eye, 
  Maximize2, 
  Minimize2, 
  Compass, 
  ShieldCheck,
  CheckCircle2,
  Sparkles
} from 'lucide-react';
import { GeoBounds } from '../../types/job';
import { SourceBadge } from '../common/SourceBadge';

interface MapViewerProps {
  rgbUrl?: string;
  maskUrl?: string;
  trustUrl?: string;
  bounds?: GeoBounds;
  sensor?: string;
  sourceBadge?: string;
}

export const MapViewer: React.FC<MapViewerProps> = ({
  rgbUrl = 'https://images.unsplash.com/photo-1541872703-74c5e44368f9?auto=format&fit=crop&w=1600&q=80',
  maskUrl,
  trustUrl,
  bounds,
  sensor = 'Sentinel-2 L2A',
  sourceBadge = 'REAL',
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const rgbOverlayRef = useRef<L.ImageOverlay | null>(null);
  const analysisOverlayRef = useRef<L.ImageOverlay | null>(null);
  const polygonRef = useRef<L.Polygon | null>(null);

  // Active right layer in split/blend: 'trust' | 'scl'
  const [activeAnalysisLayer, setActiveAnalysisLayer] = useState<'trust' | 'scl'>('trust');
  // Viewer mode: 'split' | 'blend' | 'rgb' | 'analysis'
  const [viewMode, setViewMode] = useState<'split' | 'blend' | 'rgb' | 'analysis'>('split');
  const [overlayOpacity, setOverlayOpacity] = useState<number>(0.85);
  const [splitPosition, setSplitPosition] = useState<number>(50); // percentage 0-100
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [showBBox, setShowBBox] = useState<boolean>(true);
  const [cursorCoords, setCursorCoords] = useState<{ lat: number; lng: number } | null>(null);

  // Determine lat/lng bounds from GeoBounds
  const bbox = bounds?.bbox;
  let southWest: L.LatLng;
  let northEast: L.LatLng;
  let centerLat: number;
  let centerLng: number;

  if (bbox && bbox.length === 4) {
    southWest = L.latLng(bbox[1], bbox[0]);
    northEast = L.latLng(bbox[3], bbox[2]);
    centerLat = (bbox[1] + bbox[3]) / 2.0;
    centerLng = (bbox[0] + bbox[2]) / 2.0;
  } else if (bounds?.center) {
    centerLat = bounds.center[0];
    centerLng = bounds.center[1];
    southWest = L.latLng(centerLat - 0.05, centerLng - 0.06);
    northEast = L.latLng(centerLat + 0.05, centerLng + 0.06);
  } else {
    centerLat = 37.7749;
    centerLng = -122.4194;
    southWest = L.latLng(centerLat - 0.05, centerLng - 0.06);
    northEast = L.latLng(centerLat + 0.05, centerLng + 0.06);
  }

  const imageBounds = L.latLngBounds(southWest, northEast);
  const currentAnalysisUrl = activeAnalysisLayer === 'trust' ? (trustUrl || maskUrl) : (maskUrl || trustUrl);

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

      // Clean satellite basemap
      L.tileLayer(
        'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
        {
          attribution: 'Esri, Maxar',
          maxZoom: 18,
        }
      ).addTo(map);

      // Create RGB Image Overlay
      const rgbLayer = L.imageOverlay(rgbUrl, imageBounds, {
        opacity: 1,
        interactive: false,
      }).addTo(map);

      // Create Analysis Overlay (Trust or SCL Mask)
      const analysisLayer = L.imageOverlay(currentAnalysisUrl || rgbUrl, imageBounds, {
        opacity: 0.85,
        interactive: false,
      }).addTo(map);

      // Create AOI bounding box rectangle
      const polygon = L.rectangle(imageBounds, {
        color: '#10b981',
        weight: 2,
        fillColor: 'transparent',
        dashArray: '5, 5',
      }).addTo(map);

      mapInstanceRef.current = map;
      rgbOverlayRef.current = rgbLayer;
      analysisOverlayRef.current = analysisLayer;
      polygonRef.current = polygon;

      map.fitBounds(imageBounds, { padding: [30, 30] });

      map.on('mousemove', (e: L.LeafletMouseEvent) => {
        setCursorCoords({
          lat: Number(e.latlng.lat.toFixed(5)),
          lng: Number(e.latlng.lng.toFixed(5)),
        });
      });
    } else {
      mapInstanceRef.current.fitBounds(imageBounds, { padding: [30, 30] });
      if (polygonRef.current) {
        polygonRef.current.setBounds(imageBounds);
      }
      if (rgbOverlayRef.current) {
        rgbOverlayRef.current.setBounds(imageBounds);
        rgbOverlayRef.current.setUrl(rgbUrl);
      }
      if (analysisOverlayRef.current && currentAnalysisUrl) {
        analysisOverlayRef.current.setBounds(imageBounds);
        analysisOverlayRef.current.setUrl(currentAnalysisUrl);
      }
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [centerLat, centerLng, rgbUrl, currentAnalysisUrl]);

  // Adjust layer opacities and visibility
  useEffect(() => {
    if (!analysisOverlayRef.current || !rgbOverlayRef.current) return;

    if (viewMode === 'rgb') {
      rgbOverlayRef.current.setOpacity(1);
      analysisOverlayRef.current.setOpacity(0);
    } else if (viewMode === 'analysis') {
      rgbOverlayRef.current.setOpacity(0);
      analysisOverlayRef.current.setOpacity(1);
    } else if (viewMode === 'blend') {
      rgbOverlayRef.current.setOpacity(1);
      analysisOverlayRef.current.setOpacity(overlayOpacity);
    } else if (viewMode === 'split') {
      rgbOverlayRef.current.setOpacity(1);
      analysisOverlayRef.current.setOpacity(0.9);
    }
  }, [viewMode, overlayOpacity, currentAnalysisUrl]);

  // Update overlay URL when toggling Trust vs SCL
  useEffect(() => {
    if (analysisOverlayRef.current && currentAnalysisUrl) {
      analysisOverlayRef.current.setUrl(currentAnalysisUrl);
    }
  }, [activeAnalysisLayer, currentAnalysisUrl]);

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
    setTimeout(() => {
      mapInstanceRef.current?.invalidateSize();
    }, 150);
  };

  return (
    <div
      className={`relative rounded-xl overflow-hidden border border-slate-800 bg-slate-950 flex flex-col transition-all duration-300 ${
        isFullscreen ? 'fixed inset-0 z-50 rounded-none' : 'h-[520px] w-full'
      }`}
    >
      {/* Top Map Action Toolbar */}
      <div className="absolute top-3 left-3 right-3 z-20 flex flex-wrap items-center justify-between gap-2 pointer-events-none">
        {/* Left: View Mode Pills */}
        <div className="pointer-events-auto flex items-center bg-slate-900/90 backdrop-blur-md border border-slate-700/80 rounded-lg p-1 shadow-xl">
          <button
            onClick={() => setViewMode('split')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
              viewMode === 'split'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
            title="Split swipe slider comparison"
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
            onClick={() => setViewMode('analysis')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
              viewMode === 'analysis'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
            title="Show trust score / mask layer only"
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Quality Layer</span>
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
            <span>RGB True Color</span>
          </button>
        </div>

        {/* Right: Layer Switcher (Trust vs SCL) & Controls */}
        <div className="pointer-events-auto flex items-center gap-2">
          {/* Trust vs SCL Toggle */}
          <div className="flex items-center bg-slate-900/90 backdrop-blur-md border border-slate-700/80 rounded-lg p-1 text-xs">
            <button
              onClick={() => setActiveAnalysisLayer('trust')}
              className={`px-2.5 py-1 rounded transition-colors font-semibold ${
                activeAnalysisLayer === 'trust'
                  ? 'bg-emerald-600 text-slate-950 shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Trust Score (0-1)
            </button>
            <button
              onClick={() => setActiveAnalysisLayer('scl')}
              className={`px-2.5 py-1 rounded transition-colors font-semibold ${
                activeAnalysisLayer === 'scl'
                  ? 'bg-purple-600 text-white shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              SCL Mask (0-11)
            </button>
          </div>

          {viewMode === 'blend' && (
            <div className="flex items-center gap-2 bg-slate-900/90 backdrop-blur-md border border-slate-700/80 rounded-lg px-3 py-1.5 text-xs text-slate-300 shadow-xl">
              <span className="text-slate-400 font-mono">Alpha:</span>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={overlayOpacity}
                onChange={(e) => setOverlayOpacity(parseFloat(e.target.value))}
                className="w-20 h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-emerald-500"
              />
              <span className="font-mono text-emerald-400">{Math.round(overlayOpacity * 100)}%</span>
            </div>
          )}

          <SourceBadge type={sourceBadge} size="sm" />

          <button
            onClick={toggleFullscreen}
            className="p-1.5 rounded-lg bg-slate-900/90 backdrop-blur-md border border-slate-700/80 text-slate-300 hover:text-white transition-colors shadow-xl"
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
          {/* Right side banner tag */}
          <div className="absolute top-16 right-4 bg-slate-900/90 border border-emerald-500/40 text-emerald-300 font-mono text-xs px-2.5 py-1 rounded shadow-lg backdrop-blur-sm pointer-events-none flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span>{activeAnalysisLayer === 'trust' ? 'Trust Layer (0.0 - 1.0)' : 'SCL Classification Mask'}</span>
          </div>
        </div>
      )}

      {viewMode === 'split' && (
        <div
          className="absolute top-16 left-4 bg-slate-900/90 border border-slate-700/80 text-slate-200 font-mono text-xs px-2.5 py-1 rounded shadow-lg backdrop-blur-sm pointer-events-none z-10"
          style={{ opacity: splitPosition < 15 ? 0 : 1 }}
        >
          True Color RGB AOI Window
        </div>
      )}

      {/* Split Slider Handle */}
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

      {/* Bottom Floating Legend & Geospatial Telemetry HUD */}
      <div className="absolute bottom-3 left-3 z-20 pointer-events-none flex flex-wrap items-end gap-3">
        {/* Dynamic Legend based on active layer */}
        {activeAnalysisLayer === 'trust' ? (
          <div className="pointer-events-auto bg-slate-900/95 backdrop-blur-md border border-slate-800 rounded-lg p-2.5 shadow-2xl flex flex-wrap items-center gap-3 text-xs">
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider pr-1 border-r border-slate-800 font-mono">
              Trust Score Ramp:
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-sm bg-emerald-500 inline-block" />
              <span className="text-slate-300 font-medium">1.0 (Clear Surface)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-sm bg-amber-500 inline-block" />
              <span className="text-slate-300 font-medium">0.4 (Cirrus Veil)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-sm bg-purple-500 inline-block" />
              <span className="text-slate-300 font-medium">0.15 (Shadow)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-sm bg-rose-500 inline-block" />
              <span className="text-slate-300 font-medium">0.0 (Cloud / No Data)</span>
            </div>
          </div>
        ) : (
          <div className="pointer-events-auto bg-slate-900/95 backdrop-blur-md border border-slate-800 rounded-lg p-2.5 shadow-2xl flex flex-wrap items-center gap-2.5 text-xs">
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider pr-1 border-r border-slate-800 font-mono">
              SCL Classes:
            </div>
            <div className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-sm bg-emerald-500" />
              <span className="text-slate-300 text-[11px]">Vegetation (4)</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-sm bg-amber-600" />
              <span className="text-slate-300 text-[11px]">Soil (5)</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-sm bg-sky-500" />
              <span className="text-slate-300 text-[11px]">Water (6)</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-sm bg-purple-500" />
              <span className="text-slate-300 text-[11px]">Shadow (3)</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-sm bg-yellow-400" />
              <span className="text-slate-300 text-[11px]">Cirrus (10)</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-sm bg-white" />
              <span className="text-slate-300 text-[11px]">Cloud (8/9)</span>
            </div>
          </div>
        )}

        {/* Location & Cursor Telemetry */}
        {cursorCoords && (
          <div className="pointer-events-auto bg-slate-900/90 backdrop-blur-md border border-slate-800 rounded-lg px-2.5 py-1.5 shadow-xl text-[11px] font-mono text-slate-400 flex items-center gap-2">
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
