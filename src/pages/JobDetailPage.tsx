import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useJobDetail } from '../hooks/useJobs';
import { 
  ArrowLeft, 
  Download, 
  Share2, 
  RefreshCw, 
  CheckCircle2, 
  Clock, 
  MapPin, 
  FileText, 
  Satellite, 
  Cpu, 
  Sparkles, 
  Layers, 
  AlertTriangle,
  Code,
  ShieldCheck,
  Eye
} from 'lucide-react';
import { StatusBadge } from '../components/common/StatusBadge';
import { ClarityScoreRing } from '../components/common/ClarityScoreRing';
import { MapViewer } from '../components/map/MapViewer';
import { ClassDistributionChart } from '../components/charts/ClassDistributionChart';
import { PerBandChart } from '../components/charts/PerBandChart';
import { DownstreamRadarChart } from '../components/charts/DownstreamRadarChart';

export const JobDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { data: job, isLoading, error, refetch, isRefetching } = useJobDetail(id);

  const [activeTab, setActiveTab] = useState<'map' | 'perBand' | 'rawJson'>('map');
  const [showExportModal, setShowExportModal] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);

  if (isLoading) {
    return (
      <div className="h-96 flex flex-col items-center justify-center space-y-4">
        <div className="w-10 h-10 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
        <div className="text-sm font-mono text-slate-400">Loading Job Telemetry & Rasters...</div>
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="p-8 bg-slate-900 border border-slate-800 rounded-2xl text-center space-y-4 max-w-lg mx-auto mt-12">
        <AlertTriangle className="w-10 h-10 text-rose-400 mx-auto" />
        <h2 className="text-lg font-bold text-white">Job Analysis Not Found</h2>
        <p className="text-xs text-slate-400">
          The requested job ID could not be loaded from the backend or local cache.
        </p>
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-600 text-slate-950 text-xs font-bold"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Return to Dashboard</span>
        </Link>
      </div>
    );
  }

  const isCompleted = job.status === 'done';
  const isRunningOrPending = job.status === 'running' || job.status === 'pending';
  const report = job.report;

  const handleDownloadJSON = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(job, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `${job.job_id}_clarityx_report.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleCopyReport = () => {
    navigator.clipboard.writeText(JSON.stringify(job, null, 2));
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Breadcrumb */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-4 border-b border-slate-800">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <Link to="/jobs" className="hover:text-emerald-400 flex items-center gap-1 transition-colors">
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Jobs Archive</span>
            </Link>
            <span>/</span>
            <span className="font-mono text-slate-300">{job.job_id}</span>
          </div>

          <div className="flex flex-wrap items-center gap-3 pt-1">
            <h1 className="text-xl sm:text-2xl font-extrabold text-white font-mono tracking-tight">
              {job.filename || job.job_id}
            </h1>
            <StatusBadge status={job.status} progress={job.progress} size="md" />
            <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
              {job.sensor}
            </span>
            <span className={`text-xs font-mono px-2 py-0.5 rounded border uppercase ${
              job.engine === 'deep'
                ? 'bg-purple-500/10 text-purple-400 border-purple-500/30'
                : 'bg-sky-500/10 text-sky-400 border-sky-500/30'
            }`}>
              Engine: {job.engine}
            </span>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => refetch()}
            className={`p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors ${
              isRefetching ? 'animate-spin text-emerald-400' : ''
            }`}
            title="Refresh job status"
          >
            <RefreshCw className="w-4 h-4" />
          </button>

          {isCompleted && (
            <button
              onClick={() => setShowExportModal(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold text-xs transition-all shadow-md shadow-emerald-600/20"
            >
              <Download className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>Export Report</span>
            </button>
          )}
        </div>
      </div>

      {/* Running / Queued Telemetry Banner */}
      {isRunningOrPending && (
        <div className="bg-slate-900 border border-sky-500/30 rounded-2xl p-6 relative overflow-hidden shadow-xl">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-sky-400 animate-ping" />
                <h3 className="text-base font-bold text-white">
                  Neural Cloud-Masking Pipeline Executing...
                </h3>
              </div>
              <p className="text-xs text-slate-400">
                Segmenting atmospheric cirrus veils, cumulus boundaries, and ground shadow reprojections.
              </p>
            </div>
            <div className="text-right">
              <span className="text-2xl font-bold font-mono text-sky-400">
                {job.progress || 25}%
              </span>
              <div className="text-[10px] text-slate-500 font-mono">
                Auto-refreshing live socket
              </div>
            </div>
          </div>

          <div className="w-full h-2 rounded-full bg-slate-950 mt-4 overflow-hidden border border-slate-800">
            <div
              className="h-full bg-gradient-to-r from-sky-500 via-teal-400 to-emerald-400 transition-all duration-500"
              style={{ width: `${job.progress || 25}%` }}
            />
          </div>

          {/* Stepper info */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 text-[11px] text-slate-400 font-mono">
            <div className="flex items-center gap-1.5 text-emerald-400">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>1. Tile Ingestion</span>
            </div>
            <div className={`flex items-center gap-1.5 ${(job.progress || 0) >= 30 ? 'text-emerald-400' : 'text-slate-500'}`}>
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>2. Radiometric Calib</span>
            </div>
            <div className={`flex items-center gap-1.5 ${(job.progress || 0) >= 60 ? 'text-emerald-400' : 'text-slate-500'}`}>
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>3. U-Net Transformer</span>
            </div>
            <div className={`flex items-center gap-1.5 ${(job.progress || 0) >= 90 ? 'text-emerald-400' : 'text-slate-500'}`}>
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>4. Quality Indexing</span>
            </div>
          </div>
        </div>
      )}

      {/* Main Map Viewer & Intelligence Summary */}
      <div className="space-y-4">
        {/* Navigation tabs */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-2">
          <div className="flex items-center gap-2 text-xs font-medium">
            <button
              onClick={() => setActiveTab('map')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
                activeTab === 'map'
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-semibold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Interactive Satellite Map</span>
            </button>

            <button
              onClick={() => setActiveTab('perBand')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
                activeTab === 'perBand'
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-semibold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Per-Band Spectral Quality</span>
            </button>

            <button
              onClick={() => setActiveTab('rawJson')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
                activeTab === 'rawJson'
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-semibold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Code className="w-3.5 h-3.5" />
              <span>Raw Report JSON</span>
            </button>
          </div>

          {job.bounds?.location_name && (
            <div className="hidden sm:flex items-center gap-1.5 text-xs text-slate-400 font-medium">
              <MapPin className="w-3.5 h-3.5 text-emerald-400" />
              <span className="truncate max-w-xs">{job.bounds.location_name}</span>
            </div>
          )}
        </div>

        {/* Tab 1: Interactive Map Viewer */}
        {activeTab === 'map' && (
          <MapViewer
            rgbUrl={job.rgb_preview_url}
            maskUrl={job.mask_url}
            bounds={job.bounds}
            sensor={job.sensor}
          />
        )}

        {/* Tab 2: Per-Band Spectral Quality Details */}
        {activeTab === 'perBand' && report && (
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Layers className="w-4 h-4 text-emerald-400" />
              <span>Multispectral Channel Breakdown (Atmospheric SNR & Signal Degradation)</span>
            </h3>
            <PerBandChart data={report.per_band} />

            {/* Per-band data table */}
            <div className="mt-4 overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-800 bg-slate-950 text-slate-400 font-mono">
                    <th className="py-2.5 px-3">Spectral Channel</th>
                    <th className="py-2.5 px-3">SNR (Signal-to-Noise Ratio)</th>
                    <th className="py-2.5 px-3">Atmospheric Degradation</th>
                    <th className="py-2.5 px-3">Quality Assessment</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-mono">
                  {report.per_band.map((b) => (
                    <tr key={b.band} className="hover:bg-slate-800/40">
                      <td className="py-2 px-3 font-semibold text-slate-200">{b.band}</td>
                      <td className="py-2 px-3 text-emerald-400 font-bold">{b.snr} dB</td>
                      <td className="py-2 px-3 text-amber-400 font-bold">{b.degradation}%</td>
                      <td className="py-2 px-3">
                        <span className={`text-[10px] px-2 py-0.5 rounded-full border ${
                          b.degradation < 10
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                            : b.degradation < 25
                            ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                            : 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                        }`}>
                          {b.degradation < 10 ? 'Optimal' : b.degradation < 25 ? 'Fair' : 'Degraded'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 3: Raw JSON Inspector */}
        {activeTab === 'rawJson' && (
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3 font-mono text-xs">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <span className="text-slate-400">FastAPI /jobs/{job.job_id} Payload Response:</span>
              <button
                onClick={handleCopyReport}
                className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-sans transition-colors"
              >
                {copySuccess ? 'Copied!' : 'Copy JSON'}
              </button>
            </div>
            <pre className="text-emerald-400 bg-slate-950 p-4 rounded-lg overflow-x-auto max-h-[500px]">
              {JSON.stringify(job, null, 2)}
            </pre>
          </div>
        )}
      </div>

      {/* Intelligence KPI Cards & Visualizations Grid */}
      {report && (
        <div className="space-y-6">
          {/* 3 Metric Intelligence Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* 1. Usable Land Percentage */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5">
              <div className="flex items-center justify-between text-slate-400 mb-2">
                <span className="text-xs font-semibold uppercase tracking-wider">
                  Usable Land Surface
                </span>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  Target: &gt;70%
                </span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-extrabold font-mono text-white">
                  {report.usable_land_percentage}%
                </span>
                <span className="text-xs text-slate-400">Clean Pixels</span>
              </div>
              <p className="text-[11px] text-slate-400 mt-2">
                Surface area unobstructed by heavy clouds or projected cloud shadows.
              </p>
            </div>

            {/* 2. Cirrus Attenuation Factor */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5">
              <div className="flex items-center justify-between text-slate-400 mb-2">
                <span className="text-xs font-semibold uppercase tracking-wider">
                  Cirrus Attenuation Factor
                </span>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">
                  B9 Band Absorption
                </span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-extrabold font-mono text-amber-400">
                  {report.cirrus_attenuation_factor}
                </span>
                <span className="text-xs text-slate-400 font-mono">(0.00 - 1.00)</span>
              </div>
              <p className="text-[11px] text-slate-400 mt-2">
                High-altitude semi-transparent ice-crystal optical depth coefficient.
              </p>
            </div>

            {/* 3. Shadow Impact Score */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5">
              <div className="flex items-center justify-between text-slate-400 mb-2">
                <span className="text-xs font-semibold uppercase tracking-wider">
                  Shadow Impact Index
                </span>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-purple-500/10 text-purple-400 border border-purple-500/20">
                  Geometric Projection
                </span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-extrabold font-mono text-purple-400">
                  {report.shadow_impact_score}%
                </span>
                <span className="text-xs text-slate-400">Loss</span>
              </div>
              <p className="text-[11px] text-slate-400 mt-2">
                Ground illumination loss calculated from solar azimuth & cloud elevation vectors.
              </p>
            </div>
          </div>

          {/* 3 Key Intelligence Panels: ClarityScore Master, Class Distribution, Downstream Usability */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Panel 1: Master ClarityScore */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <h3 className="text-sm font-bold text-white">ClarityScore™ Index</h3>
                  <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    ISO-Compliant
                  </span>
                </div>
                <p className="text-xs text-slate-400">
                  Overall radiometric & optical quality score for machine learning pipelines
                </p>
              </div>

              <div className="py-4">
                <ClarityScoreRing score={report.clarityscore} size={170} />
              </div>

              <div className="text-[11px] text-slate-400 bg-slate-950/60 p-2.5 rounded-lg border border-slate-800/80">
                Score integrates visible, NIR, and SWIR signal attenuation against atmospheric scatter.
              </div>
            </div>

            {/* Panel 2: Class Distribution Breakdown */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 flex flex-col justify-between">
              <div>
                <h3 className="text-sm font-bold text-white mb-1">Class Area Distribution</h3>
                <p className="text-xs text-slate-400">
                  Pixel classification partition of processed satellite footprint
                </p>
              </div>

              <div className="py-2">
                <ClassDistributionChart distribution={report.class_distribution} />
              </div>
            </div>

            {/* Panel 3: Downstream Usability Intelligence */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 flex flex-col justify-between">
              <div>
                <h3 className="text-sm font-bold text-white mb-1">Downstream Usability</h3>
                <p className="text-xs text-slate-400">
                  Model fitness ratings for specialized machine learning tasks
                </p>
              </div>

              <div className="py-2">
                <DownstreamRadarChart ratings={report.downstream_usability_rating} />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Export Report Modal */}
      {showExportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-emerald-400" />
                <h3 className="font-semibold text-white">Export Analysis Intelligence</h3>
              </div>
              <button
                onClick={() => setShowExportModal(false)}
                className="text-slate-400 hover:text-white text-sm"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-400">
              Download structured data packages for GIS pipelines, automated downstream ingestion, or executive reporting.
            </p>

            <div className="space-y-2.5 text-xs">
              {/* Option 1: Full JSON Report */}
              <button
                onClick={handleDownloadJSON}
                className="w-full p-3 rounded-lg bg-slate-950 border border-slate-800 hover:border-emerald-500/50 hover:bg-slate-850 flex items-center justify-between text-left transition-colors"
              >
                <div>
                  <div className="font-semibold text-slate-200">Full ClarityX JSON Report</div>
                  <div className="text-slate-500 text-[11px]">Includes all telemetry, per-band SNR, and downstream ratings</div>
                </div>
                <Download className="w-4 h-4 text-emerald-400" />
              </button>

              {/* Option 2: Print / Save Executive Summary */}
              <button
                onClick={() => window.print()}
                className="w-full p-3 rounded-lg bg-slate-950 border border-slate-800 hover:border-emerald-500/50 hover:bg-slate-850 flex items-center justify-between text-left transition-colors"
              >
                <div>
                  <div className="font-semibold text-slate-200">Print / PDF Executive Summary</div>
                  <div className="text-slate-500 text-[11px]">Formatted layout for mission operators & quality sign-off</div>
                </div>
                <FileText className="w-4 h-4 text-sky-400" />
              </button>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
              <button
                onClick={() => setShowExportModal(false)}
                className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
