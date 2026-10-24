import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Search, 
  MapPin, 
  Calendar, 
  Sparkles, 
  Sprout, 
  Waves, 
  Globe, 
  ArrowRight, 
  AlertCircle, 
  CheckCircle2, 
  ChevronDown,
  ChevronUp,
  Layers,
  Clock,
  SlidersHorizontal
} from 'lucide-react';
import { api } from '../services/api';
import { AOIMapPicker } from '../components/map/AOIMapPicker';
import { UseCaseType, STACScene } from '../types/job';

const AOI_PRESETS = [
  {
    id: 'iowa_corn',
    name: 'Iowa Farmland',
    location: 'United States',
    useCase: 'crop_monitoring' as UseCaseType,
    bbox: [-93.65, 41.55, -93.58, 41.62] as [number, number, number, number],
    startDate: '2024-07-01',
    endDate: '2024-07-20',
    targetDate: '2024-07-12',
    icon: '🌽',
    badge: 'Agriculture',
    desc: 'Clear crop canopy with minimal cloud interference.'
  },
  {
    id: 'rhine_flood',
    name: 'Rhine Floodplain',
    location: 'Germany',
    useCase: 'flood_response' as UseCaseType,
    bbox: [7.55, 50.32, 7.64, 50.38] as [number, number, number, number],
    startDate: '2024-06-01',
    endDate: '2024-06-15',
    targetDate: '2024-06-08',
    icon: '🌊',
    badge: 'Disaster Rapid',
    desc: 'Tracks water boundaries while filtering false cloud shadows.'
  },
  {
    id: 'sf_bay',
    name: 'San Francisco Bay',
    location: 'United States',
    useCase: 'general' as UseCaseType,
    bbox: [-122.45, 37.75, -122.38, 37.81] as [number, number, number, number],
    startDate: '2024-01-01',
    endDate: '2024-01-20',
    targetDate: '2024-01-14',
    icon: '🌉',
    badge: 'Coastal & Urban',
    desc: 'Marine stratocumulus vs high-altitude cirrus veils.'
  },
  {
    id: 'mumbai_monsoon',
    name: 'Mumbai Monsoon',
    location: 'India',
    useCase: 'flood_response' as UseCaseType,
    bbox: [72.82, 18.95, 72.92, 19.05] as [number, number, number, number],
    startDate: '2024-07-20',
    endDate: '2024-07-31',
    targetDate: '2024-07-28',
    icon: '🌧️',
    badge: 'Cloudy Area Demo',
    desc: 'Persistent monsoon cover — tests cloud warning & radar alternatives.'
  }
];

export const NewAnalysisPage: React.FC = () => {
  const navigate = useNavigate();

  // Active preset or custom
  const [selectedPresetId, setSelectedPresetId] = useState<string>('iowa_corn');

  // AOI parameters
  const [bbox, setBBox] = useState<[number, number, number, number]>([-93.65, 41.55, -93.58, 41.62]);
  const [startDate, setStartDate] = useState('2024-07-01');
  const [endDate, setEndDate] = useState('2024-07-20');
  const [targetDate, setTargetDate] = useState('2024-07-12');
  const [useCase, setUseCase] = useState<UseCaseType>('crop_monitoring');
  const [showAdvancedCoords, setShowAdvancedCoords] = useState(false);

  // Search & Analysis States
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<STACScene[] | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [analyzingSceneId, setAnalyzingSceneId] = useState<string | null>(null);

  // Handle Preset AOI click
  const handleSelectPreset = (p: typeof AOI_PRESETS[0]) => {
    setSelectedPresetId(p.id);
    setBBox(p.bbox);
    setStartDate(p.startDate);
    setEndDate(p.endDate);
    setTargetDate(p.targetDate);
    setUseCase(p.useCase);
    setSearchResults(null);
    setErrorMessage(null);
  };

  // Direct 1-Click Fast Analysis
  const handleDirectAnalyze = async () => {
    setIsAnalyzing(true);
    setErrorMessage(null);

    try {
      // Find matching preset scene ID or search STAC
      let targetSceneId = '';
      if (selectedPresetId === 'iowa_corn') {
        targetSceneId = 'S2A_MSIL2A_20240712_IOWA_DEMO';
      } else if (selectedPresetId === 'rhine_flood') {
        targetSceneId = 'S2B_MSIL2A_20240608_RHINE_DEMO';
      } else if (selectedPresetId === 'sf_bay') {
        targetSceneId = 'S2A_MSIL2A_20240114_SF_DEMO';
      } else if (selectedPresetId === 'mumbai_monsoon') {
        targetSceneId = 'S2B_MSIL2A_20240728_MUMBAI_DEMO';
      } else {
        // Query STAC to find the best scene for the custom bbox
        const searchRes = await api.searchScenes({
          aoi: { bbox },
          start_date: startDate,
          end_date: endDate,
          target_date: targetDate,
          use_case: useCase,
        });

        if (searchRes.scenes && searchRes.scenes.length > 0) {
          targetSceneId = searchRes.scenes[0].scene_id;
        } else {
          targetSceneId = 'S2A_MSIL2A_CUSTOM_DEMO';
        }
      }

      // Dispatch Analysis
      const res = await api.analyzeAOI({
        scene_id: targetSceneId,
        aoi: { bbox },
        use_case: useCase,
        target_date: targetDate,
      });

      navigate(`/jobs/${res.job_id}`);
    } catch (err: any) {
      setErrorMessage(err?.message || 'Could not analyze satellite imagery. Please try again.');
      setIsAnalyzing(false);
    }
  };

  // Optional: Browse all available 5-day passes
  const handleBrowsePasses = async () => {
    setIsSearching(true);
    setErrorMessage(null);
    try {
      const res = await api.searchScenes({
        aoi: { bbox },
        start_date: startDate,
        end_date: endDate,
        target_date: targetDate,
        use_case: useCase,
      });
      setSearchResults(res.scenes);
    } catch (err: any) {
      setErrorMessage(err?.message || 'Failed to search scenes.');
    } finally {
      setIsSearching(false);
    }
  };

  const handleAnalyzeSpecificScene = async (sceneId: string) => {
    setAnalyzingSceneId(sceneId);
    setErrorMessage(null);
    try {
      const res = await api.analyzeAOI({
        scene_id: sceneId,
        aoi: { bbox },
        use_case: useCase,
        target_date: targetDate,
      });
      navigate(`/jobs/${res.job_id}`);
    } catch (err: any) {
      setErrorMessage(err?.message || 'Analysis failed. Please retry.');
      setAnalyzingSceneId(null);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-12">
      {/* Hero Welcome Banner */}
      <div className="bg-gradient-to-br from-white to-slate-50 border border-slate-200/90 rounded-2xl p-6 sm:p-8 shadow-xs">
        <div className="max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-semibold border border-emerald-200">
            <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
            <span>Instant Sentinel-2 Quality & Cloud Masking</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            Check True Satellite Quality for Your Field or Region
          </h1>
          <p className="text-sm text-slate-600 leading-relaxed">
            Standard catalogs report cloud cover for massive 100km tiles, hiding whether your specific field is clear. 
            Select your location below to see real clear ground percentage, cloud veils, and quality confidence in seconds.
          </p>
        </div>
      </div>

      {errorMessage && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2.5 shadow-xs">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
          <span className="font-medium">{errorMessage}</span>
        </div>
      )}

      {/* Step 1: Select Area (1-Click Presets or Map) */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-slate-100 pb-3">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold">1</span>
              <span>Choose Location</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Pick a quick sample area or click anywhere on the world map.
            </p>
          </div>
          <span className="text-[11px] font-mono text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200 self-start sm:self-auto">
            Zero 500MB Tile Downloads
          </span>
        </div>

        {/* 1-Click Preset Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {AOI_PRESETS.map((p) => {
            const isSelected = selectedPresetId === p.id;
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => handleSelectPreset(p)}
                className={`p-4 rounded-xl border text-left transition-all relative flex flex-col justify-between ${
                  isSelected
                    ? 'border-emerald-500 bg-emerald-50/50 shadow-sm ring-2 ring-emerald-500/20'
                    : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-2xl">{p.icon}</span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      isSelected 
                        ? 'bg-emerald-600 text-white' 
                        : 'bg-slate-100 text-slate-600'
                    }`}>
                      {p.badge}
                    </span>
                  </div>
                  <h3 className="font-bold text-sm text-slate-900">{p.name}</h3>
                  <div className="text-[11px] text-slate-400 font-medium mb-1.5">{p.location}</div>
                  <p className="text-xs text-slate-600 leading-snug">{p.desc}</p>
                </div>

                <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-[11px] text-slate-500 font-medium">{p.startDate.slice(5)} to {p.endDate.slice(5)}</span>
                  <span className={`font-semibold ${isSelected ? 'text-emerald-700' : 'text-slate-400'}`}>
                    {isSelected ? '✓ Selected' : 'Choose →'}
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Map Picker */}
        <div className="space-y-2 pt-2">
          <div className="flex items-center justify-between text-xs text-slate-600 font-medium">
            <span className="flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-emerald-600" />
              <span>Interactive Map (Click anywhere to relocate target window)</span>
            </span>
            <button
              type="button"
              onClick={() => setShowAdvancedCoords(!showAdvancedCoords)}
              className="text-slate-500 hover:text-slate-800 flex items-center gap-1"
            >
              <span>{showAdvancedCoords ? 'Hide Coordinates' : 'Show Coordinates'}</span>
              {showAdvancedCoords ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
          </div>

          <AOIMapPicker bbox={bbox} onBBoxChange={(newBBox) => {
            setBBox(newBBox);
            setSelectedPresetId('custom');
          }} />

          {/* Optional Collapsible Coordinates for power users */}
          {showAdvancedCoords && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 text-xs font-mono bg-slate-50 p-3 rounded-lg border border-slate-200">
              <div>
                <label className="text-[10px] text-slate-500 block mb-0.5">West (Min Lon)</label>
                <input
                  type="number"
                  step="0.001"
                  value={bbox[0]}
                  onChange={(e) => setBBox([parseFloat(e.target.value) || 0, bbox[1], bbox[2], bbox[3]])}
                  className="w-full px-2 py-1 rounded bg-white border border-slate-300 text-slate-900"
                />
              </div>
              <div>
                <label className="text-[10px] text-slate-500 block mb-0.5">South (Min Lat)</label>
                <input
                  type="number"
                  step="0.001"
                  value={bbox[1]}
                  onChange={(e) => setBBox([bbox[0], parseFloat(e.target.value) || 0, bbox[2], bbox[3]])}
                  className="w-full px-2 py-1 rounded bg-white border border-slate-300 text-slate-900"
                />
              </div>
              <div>
                <label className="text-[10px] text-slate-500 block mb-0.5">East (Max Lon)</label>
                <input
                  type="number"
                  step="0.001"
                  value={bbox[2]}
                  onChange={(e) => setBBox([bbox[0], bbox[1], parseFloat(e.target.value) || 0, bbox[3]])}
                  className="w-full px-2 py-1 rounded bg-white border border-slate-300 text-slate-900"
                />
              </div>
              <div>
                <label className="text-[10px] text-slate-500 block mb-0.5">North (Max Lat)</label>
                <input
                  type="number"
                  step="0.001"
                  value={bbox[3]}
                  onChange={(e) => setBBox([bbox[0], bbox[1], bbox[2], parseFloat(e.target.value) || 0])}
                  className="w-full px-2 py-1 rounded bg-white border border-slate-300 text-slate-900"
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Step 2: Use-Case & Preferences */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-5">
        <div className="border-b border-slate-100 pb-3">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <span className="flex items-center justify-center w-6 h-6 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold">2</span>
            <span>Target Goal & Timing</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Tells the analyzer what you care most about (plants, water, or general land).
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {[
            {
              id: 'crop_monitoring',
              title: 'Crops & Farming',
              icon: Sprout,
              desc: 'High sensitivity to thin cirrus haze & clouds over crops.'
            },
            {
              id: 'flood_response',
              title: 'Water & Floods',
              icon: Waves,
              desc: 'Filters out false cloud shadows that look like water.'
            },
            {
              id: 'general',
              title: 'General Land Cover',
              icon: Globe,
              desc: 'Balanced optical quality for urban, terrain & land use.'
            }
          ].map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setUseCase(item.id as UseCaseType)}
              className={`p-3.5 rounded-xl border text-left transition-all flex items-start gap-3 ${
                useCase === item.id
                  ? 'border-emerald-600 bg-emerald-50/50 text-slate-900 ring-1 ring-emerald-500/30'
                  : 'border-slate-200 bg-slate-50 hover:bg-slate-100/70 text-slate-600'
              }`}
            >
              <div className={`p-2 rounded-lg ${useCase === item.id ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-600'}`}>
                <item.icon className="w-4 h-4" />
              </div>
              <div className="flex-1">
                <div className="font-bold text-xs text-slate-900">{item.title}</div>
                <div className="text-[11px] text-slate-500 mt-0.5 leading-snug">{item.desc}</div>
              </div>
            </button>
          ))}
        </div>

        {/* Date Selector Row */}
        <div className="pt-2 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-slate-500 shrink-0" />
            <span className="text-xs font-semibold text-slate-800">Date Range:</span>
            <span className="text-xs text-slate-600 font-mono">
              {startDate} <span className="text-slate-400">→</span> {endDate}
            </span>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <label className="text-slate-500 font-medium">Change dates:</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="px-2.5 py-1 rounded-md bg-white border border-slate-300 text-slate-800 font-mono text-xs"
            />
            <span className="text-slate-400">to</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="px-2.5 py-1 rounded-md bg-white border border-slate-300 text-slate-800 font-mono text-xs"
            />
          </div>
        </div>
      </div>

      {/* Main Call to Action Bar */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <div className="font-bold text-sm text-slate-900 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-emerald-600" />
            <span>Ready to Inspect Quality</span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Will stream Sentinel-2 L2A imagery and calculate exact usable land percentage.
          </p>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <button
            type="button"
            onClick={handleBrowsePasses}
            disabled={isSearching || isAnalyzing}
            className="flex-1 sm:flex-initial px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-semibold transition-colors disabled:opacity-50"
          >
            {isSearching ? 'Checking passes...' : 'Browse Available Passes'}
          </button>

          <button
            type="button"
            onClick={handleDirectAnalyze}
            disabled={isAnalyzing}
            className="flex-1 sm:flex-initial px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isAnalyzing ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Analyzing Imagery...</span>
              </>
            ) : (
              <>
                <span>Analyze Satellite Quality</span>
                <ArrowRight className="w-4 h-4 stroke-[2.5]" />
              </>
            )}
          </button>
        </div>
      </div>

      {/* Available 5-Day Satellite Passes (Only shown if user clicks browse) */}
      {searchResults && searchResults.length > 0 && (
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="font-bold text-sm text-slate-900">
                Available Sentinel-2 Satellite Passes ({searchResults.length})
              </h3>
              <p className="text-xs text-slate-500">
                Pick any pass below to run detailed AOI cloud and usable land analysis.
              </p>
            </div>
            <button
              onClick={() => setSearchResults(null)}
              className="text-xs text-slate-400 hover:text-slate-600"
            >
              Close
            </button>
          </div>

          <div className="space-y-2.5">
            {searchResults.map((scene) => {
              const sceneId = scene.scene_id;
              const isAnalyzingThis = analyzingSceneId === sceneId;
              const cloud = scene.scene_cloud_cover_pct ?? 0;
              return (
                <div
                  key={sceneId}
                  className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-colors"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-xs text-slate-800">
                        {scene.datetime?.slice(0, 10) || '2024-07-12'}
                      </span>
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                        cloud < 20 
                          ? 'bg-emerald-100 text-emerald-800' 
                          : cloud < 60 
                            ? 'bg-amber-100 text-amber-800' 
                            : 'bg-rose-100 text-rose-800'
                      }`}>
                        {cloud}% Regional Clouds
                      </span>
                    </div>
                    <div className="text-[11px] font-mono text-slate-500 truncate max-w-md">
                      {sceneId}
                    </div>
                  </div>

                  <button
                    onClick={() => handleAnalyzeSpecificScene(sceneId)}
                    disabled={isAnalyzingThis}
                    className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs transition-colors shrink-0 flex items-center justify-center gap-1.5 disabled:opacity-50 shadow-xs"
                  >
                    {isAnalyzingThis ? (
                      <>
                        <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Analyzing...</span>
                      </>
                    ) : (
                      <>
                        <span>Analyze This Pass</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </>
                    )}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
