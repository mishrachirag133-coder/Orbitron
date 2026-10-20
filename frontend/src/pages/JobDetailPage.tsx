import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useJobDetail } from '../hooks/useJobs';
import { 
  ArrowLeft, 
  Download, 
  RefreshCw, 
  CheckCircle2, 
  MapPin, 
  FileText, 
  Layers, 
  AlertTriangle,
  Code,
  Eye,
  Printer
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
      <div className="h-96 flex flex-col items-center justify-center space-y-3">
        <div className="w-8 h-8 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin" />
        <div className="text-sm text-slate-600 font-medium">Loading satellite imagery details...</div>
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="p-8 bg-white border border-slate-200 rounded-2xl text-center space-y-4 max-w-lg mx-auto mt-12 shadow-sm">
        <AlertTriangle className="w-10 h-10 text-rose-500 mx-auto" />
        <h2 className="text-lg font-bold text-slate-900">Analysis Not Found</h2>
        <p className="text-xs text-slate-600">
          The requested scene ID could not be loaded. Please return to the library.
        </p>
        <Link
          to="/jobs"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Return to Imagery Library</span>
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
    downloadAnchor.setAttribute('download', `${job.job_id}_quality_report.json`);
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
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-4 border-b border-slate-200">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <Link to="/jobs" className="hover:text-slate-900 flex items-center gap-1 transition-colors font-medium">
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Imagery Library</span>
            </Link>
            <span>/</span>
            <span className="font-mono text-slate-700">{job.job_id}</span>
          </div>

          <div className="flex flex-wrap items-center gap-3 pt-1">
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              {job.filename || job.job_id}
            </h1>
            <StatusBadge status={job.status} progress={job.progress} size="md" />
            <span className="text-xs px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200 font-medium">
              {job.sensor}
            </span>
          </div>

          {job.bounds?.location_name && (
            <div className="flex items-center gap-1 text-xs text-slate-500 pt-0.5">
              <MapPin className="w-3.5 h-3.5 text-slate-400" />
              <span>{job.bounds.location_name}</span>
            </div>
          )}
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => refetch()}
            className={`p-2 rounded-lg bg-white hover:bg-slate-50 text-slate-600 border border-slate-300 transition-colors shadow-xs ${
              isRefetching ? 'animate-spin text-emerald-600' : ''
            }`}
            title="Refresh status"
          >
            <RefreshCw className="w-4 h-4" />
          </button>

          {isCompleted && (
            <button
              onClick={() => setShowExportModal(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs transition-colors shadow-sm"
            >
              <Download className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>Export Report</span>
            </button>
          )}
        </div>
      </div>

      {/* Running / Queued Telemetry Banner */}
      {isRunningOrPending && (
        <div className="bg-white border border-blue-200 rounded-xl p-5 shadow-sm space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
                <h3 className="text-sm font-bold text-slate-900">
                  Cloud Masking Analysis in Progress
                </h3>
              </div>
              <p className="text-xs text-slate-500">
                Segmenting optical clouds, thin cirrus veils, and ground shadows...
              </p>
            </div>
            <div className="text-right">
              <span className="text-2xl font-bold font-mono text-blue-600">
                {job.progress || 25}%
              </span>
            </div>
          </div>

          <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
            <div
              className="h-full bg-blue-600 transition-all duration-300 rounded-full"
              style={{ width: `${job.progress || 25}%` }}
            />
          </div>
        </div>
      )}

      {/* Main Map Viewer & Tabs */}
      <div className="space-y-4">
        {/* Navigation tabs */}
        <div className="flex items-center justify-between border-b border-slate-200 pb-2">
          <div className="flex items-center gap-2 text-xs font-medium">
            <button
              onClick={() => setActiveTab('map')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors ${
                activeTab === 'map'
                  ? 'bg-slate-900 text-white font-semibold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Interactive Viewer</span>
            </button>

            <button
              onClick={() => setActiveTab('perBand')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors ${
                activeTab === 'perBand'
                  ? 'bg-slate-900 text-white font-semibold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Spectral Channels</span>
            </button>

            <button
              onClick={() => setActiveTab('rawJson')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors ${
                activeTab === 'rawJson'
                  ? 'bg-slate-900 text-white font-semibold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Code className="w-3.5 h-3.5" />
              <span>Raw Data (JSON)</span>
            </button>
          </div>
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

        {/* Tab 2: Spectral Band Signal Quality */}
        {activeTab === 'perBand' && report && (
          <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-4 shadow-sm">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Layers className="w-4 h-4 text-emerald-600" />
              <span>Multispectral Channel Breakdown (Signal Quality & Degradation)</span>
            </h3>
            <PerBandChart data={report.per_band} />

            {/* Per-band data table */}
            <div className="mt-4 overflow-x-auto border border-slate-200 rounded-lg">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 text-slate-700 font-semibold">
                    <th className="py-2.5 px-3">Spectral Channel</th>
                    <th className="py-2.5 px-3">Signal-to-Noise (SNR)</th>
                    <th className="py-2.5 px-3">Atmospheric Degradation</th>
                    <th className="py-2.5 px-3">Quality Rating</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-mono">
                  {report.per_band.map((b) => (
                    <tr key={b.band} className="hover:bg-slate-50">
                      <td className="py-2 px-3 font-semibold text-slate-900">{b.band}</td>
                      <td className="py-2 px-3 text-emerald-700 font-bold">{b.snr} dB</td>
                      <td className="py-2 px-3 text-amber-700 font-bold">{b.degradation}%</td>
                      <td className="py-2 px-3 font-sans">
                        <span className={`text-[10px] px-2 py-0.5 rounded-full border font-medium ${
                          b.degradation < 10
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : b.degradation < 25
                            ? 'bg-amber-50 text-amber-800 border-amber-200'
                            : 'bg-rose-50 text-rose-700 border-rose-200'
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
          <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-3 font-mono text-xs shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-200 pb-2">
              <span className="text-slate-600 font-sans">Full Analysis Object:</span>
              <button
                onClick={handleCopyReport}
                className="px-2.5 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-sans transition-colors border border-slate-200"
              >
                {copySuccess ? 'Copied!' : 'Copy JSON'}
              </button>
            </div>
            <pre className="text-slate-800 bg-slate-50 p-4 rounded-lg overflow-x-auto max-h-[500px] border border-slate-200">
              {JSON.stringify(job, null, 2)}
            </pre>
          </div>
        )}
      </div>

      {/* Intelligence KPI Cards & Visualizations Grid */}
      {report && (
        <div className="space-y-6">
          {/* 3 Metric Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* 1. Usable Land Percentage */}
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-1">
              <div className="flex items-center justify-between text-slate-500 mb-2">
                <span className="text-xs font-semibold uppercase tracking-wider">
                  Clear Ground Surface
                </span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 font-medium">
                  Usable Area
                </span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold font-mono text-slate-900">
                  {report.usable_land_percentage}%
                </span>
                <span className="text-xs text-slate-500">Unobstructed</span>
              </div>
              <p className="text-xs text-slate-500 pt-1">
                Surface area free of thick cloud cover or ground shadows.
              </p>
            </div>

            {/* 2. Cirrus Attenuation */}
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-1">
              <div className="flex items-center justify-between text-slate-500 mb-2">
                <span className="text-xs font-semibold uppercase tracking-wider">
                  Cloud & Cirrus Cover
                </span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200 font-medium">
                  Atmosphere
                </span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold font-mono text-amber-700">
                  {(report.class_distribution.thick_cloud + report.class_distribution.thin_cirrus).toFixed(1)}%
                </span>
                <span className="text-xs text-slate-500">Total Clouds</span>
              </div>
              <p className="text-xs text-slate-500 pt-1">
                {report.class_distribution.thick_cloud}% thick cloud, {report.class_distribution.thin_cirrus}% thin cirrus.
              </p>
            </div>

            {/* 3. Shadow Impact Score */}
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-1">
              <div className="flex items-center justify-between text-slate-500 mb-2">
                <span className="text-xs font-semibold uppercase tracking-wider">
                  Shadow Impact
                </span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-purple-50 text-purple-700 border border-purple-200 font-medium">
                  Shadows
                </span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold font-mono text-purple-700">
                  {report.class_distribution.shadow}%
                </span>
                <span className="text-xs text-slate-500">Projected Shadow</span>
              </div>
              <p className="text-xs text-slate-500 pt-1">
                Ground illumination obscured by projected cloud shadows.
              </p>
            </div>
          </div>

          {/* 3 Key Intelligence Panels */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Panel 1: Master ClarityScore */}
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <h3 className="text-sm font-bold text-slate-900">Overall Quality Grade</h3>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                    Quality Rating
                  </span>
                </div>
                <p className="text-xs text-slate-500">
                  Overall optical clarity calculated for this satellite scene
                </p>
              </div>

              <div className="py-4">
                <ClarityScoreRing score={report.clarityscore} size={160} />
              </div>

              <div className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                Score indicates whether this scene is suitable for accurate land-cover classification.
              </div>
            </div>

            {/* Panel 2: Class Distribution Breakdown */}
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex flex-col justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900 mb-1">Scene Class Distribution</h3>
                <p className="text-xs text-slate-500">
                  Breakdown of clear ground, clouds, and shadow coverage
                </p>
              </div>

              <div className="py-2">
                <ClassDistributionChart distribution={report.class_distribution} />
              </div>
            </div>

            {/* Panel 3: Downstream Usability */}
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex flex-col justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900 mb-1">Application Suitability</h3>
                <p className="text-xs text-slate-500">
                  Estimated suitability for downstream computer vision tasks
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-md w-full p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-emerald-600" />
                <h3 className="font-bold text-slate-900">Export Analysis Report</h3>
              </div>
              <button
                onClick={() => setShowExportModal(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-semibold"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-600">
              Download structured data for GIS workflows, reports, or archiving.
            </p>

            <div className="space-y-2.5 text-xs">
              {/* Option 1: Full JSON Report */}
              <button
                onClick={handleDownloadJSON}
                className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/30 flex items-center justify-between text-left transition-colors"
              >
                <div>
                  <div className="font-semibold text-slate-900">Download Full JSON Report</div>
                  <div className="text-slate-500 text-[11px]">Includes all classification metrics, coordinates, and ratings</div>
                </div>
                <Download className="w-4 h-4 text-emerald-600" />
              </button>

              {/* Option 2: Print Summary */}
              <button
                onClick={() => window.print()}
                className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/30 flex items-center justify-between text-left transition-colors"
              >
                <div>
                  <div className="font-semibold text-slate-900">Print / PDF Summary</div>
                  <div className="text-slate-500 text-[11px]">Formatted printable summary sheet</div>
                </div>
                <Printer className="w-4 h-4 text-slate-600" />
              </button>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                onClick={() => setShowExportModal(false)}
                className="px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-xs font-semibold text-slate-700 transition-colors"
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
