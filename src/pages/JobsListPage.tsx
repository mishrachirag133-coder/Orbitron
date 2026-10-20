import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { 
  History, 
  Search, 
  Filter, 
  Plus, 
  ArrowUpRight, 
  Satellite, 
  Sparkles,
  SlidersHorizontal,
  RefreshCw
} from 'lucide-react';
import { useJobs } from '../hooks/useJobs';
import { StatusBadge } from '../components/common/StatusBadge';
import { JobStatus, SensorType, EngineType } from '../types/job';

export const JobsListPage: React.FC = () => {
  const { data: jobs = [], isLoading, refetch, isRefetching } = useJobs();

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSensor, setSelectedSensor] = useState<string>('all');
  const [selectedEngine, setSelectedEngine] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [minClarity, setMinClarity] = useState<number>(0);

  const filteredJobs = useMemo(() => {
    return jobs.filter((job) => {
      // Search
      const matchesSearch =
        !searchQuery ||
        job.job_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (job.filename && job.filename.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (job.bounds?.location_name && job.bounds.location_name.toLowerCase().includes(searchQuery.toLowerCase()));

      // Sensor
      const matchesSensor = selectedSensor === 'all' || job.sensor === selectedSensor;

      // Engine
      const matchesEngine = selectedEngine === 'all' || job.engine === selectedEngine;

      // Status
      const matchesStatus = selectedStatus === 'all' || job.status === selectedStatus;

      // Min Clarity
      const clarity = job.report?.clarityscore ?? 0;
      const matchesClarity = minClarity === 0 || clarity >= minClarity;

      return matchesSearch && matchesSensor && matchesEngine && matchesStatus && matchesClarity;
    });
  }, [jobs, searchQuery, selectedSensor, selectedEngine, selectedStatus, minClarity]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono font-semibold text-emerald-400 uppercase tracking-wider">
              Archive & Telemetry Registry
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
          </div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">
            Satellite Jobs Registry
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Browse and inspect all multispectral cloud-masking runs, sensor telemetry, and quality grade reports.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => refetch()}
            className={`p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors ${
              isRefetching ? 'animate-spin text-emerald-400' : ''
            }`}
            title="Refresh jobs"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <Link
            to="/new"
            className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-slate-950 text-xs font-bold transition-all shadow-md shadow-emerald-600/20 flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>New Analysis</span>
          </Link>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          {/* Search Box */}
          <div className="relative md:col-span-2">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by job ID, scene name, or AOI location..."
              className="w-full pl-9 pr-3.5 py-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-100 text-xs focus:outline-none focus:border-emerald-500 transition-colors"
            />
          </div>

          {/* Sensor Constellation Filter */}
          <div>
            <select
              value={selectedSensor}
              onChange={(e) => setSelectedSensor(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-200 text-xs focus:outline-none focus:border-emerald-500"
            >
              <option value="all">All Constellations</option>
              <option value="Sentinel-2">Sentinel-2 MSI</option>
              <option value="Landsat-8/9">Landsat-8/9 OLI</option>
              <option value="PlanetScope">PlanetScope 3m</option>
              <option value="WorldView-3">WorldView-3 Submeter</option>
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-200 text-xs focus:outline-none focus:border-emerald-500"
            >
              <option value="all">All Execution States</option>
              <option value="done">Completed (Done)</option>
              <option value="running">In Flight (Running)</option>
              <option value="pending">Queued (Pending)</option>
              <option value="failed">Failed</option>
            </select>
          </div>
        </div>

        {/* Second row: Engine filter & Min Clarity Slider */}
        <div className="flex flex-wrap items-center justify-between gap-4 pt-2 border-t border-slate-800/60 text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-300">Engine:</span>
            {['all', 'deep', 'fast'].map((eng) => (
              <button
                key={eng}
                type="button"
                onClick={() => setSelectedEngine(eng)}
                className={`px-2.5 py-1 rounded-md capitalize font-mono text-[11px] transition-colors ${
                  selectedEngine === eng
                    ? 'bg-slate-700 text-white font-semibold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {eng}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <span>Min ClarityScore:</span>
            <input
              type="range"
              min="0"
              max="90"
              step="5"
              value={minClarity}
              onChange={(e) => setMinClarity(Number(e.target.value))}
              className="w-24 h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
            />
            <span className="font-mono text-emerald-400 font-bold w-12 text-right">
              {minClarity > 0 ? `≥${minClarity}%` : 'Any'}
            </span>
          </div>
        </div>
      </div>

      {/* Jobs Table */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950/60 text-slate-400 font-mono text-[11px]">
                <th className="py-3 px-4">Job Identifier</th>
                <th className="py-3 px-4">Scene & AOI Location</th>
                <th className="py-3 px-4">Sensor</th>
                <th className="py-3 px-4">Engine</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">ClarityScore</th>
                <th className="py-3 px-4">Usable Land</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredJobs.map((job) => (
                <tr
                  key={job.job_id}
                  className="hover:bg-slate-800/40 transition-colors group"
                >
                  {/* Job ID */}
                  <td className="py-3.5 px-4 font-mono font-semibold text-emerald-400">
                    <Link to={`/jobs/${job.job_id}`} className="hover:underline">
                      {job.job_id}
                    </Link>
                  </td>

                  {/* Scene & AOI */}
                  <td className="py-3.5 px-4">
                    <div className="font-medium text-slate-200 truncate max-w-xs" title={job.filename}>
                      {job.filename || job.s3_key}
                    </div>
                    {job.bounds?.location_name && (
                      <div className="text-[11px] text-slate-500 truncate max-w-xs">
                        {job.bounds.location_name}
                      </div>
                    )}
                  </td>

                  {/* Sensor */}
                  <td className="py-3.5 px-4 text-slate-300 font-medium">
                    {job.sensor}
                  </td>

                  {/* Engine */}
                  <td className="py-3.5 px-4">
                    <span className={`text-[10px] font-mono px-2 py-0.5 rounded border uppercase ${
                      job.engine === 'deep'
                        ? 'bg-purple-500/10 text-purple-400 border-purple-500/20'
                        : 'bg-sky-500/10 text-sky-400 border-sky-500/20'
                    }`}>
                      {job.engine}
                    </span>
                  </td>

                  {/* Status */}
                  <td className="py-3.5 px-4">
                    <StatusBadge status={job.status} progress={job.progress} size="sm" />
                  </td>

                  {/* ClarityScore */}
                  <td className="py-3.5 px-4 font-mono">
                    {job.report ? (
                      <span className={`font-bold ${
                        job.report.clarityscore >= 80
                          ? 'text-emerald-400'
                          : job.report.clarityscore >= 60
                          ? 'text-amber-400'
                          : 'text-rose-400'
                      }`}>
                        {job.report.clarityscore.toFixed(1)}%
                      </span>
                    ) : (
                      <span className="text-slate-600">—</span>
                    )}
                  </td>

                  {/* Usable Land */}
                  <td className="py-3.5 px-4 font-mono text-slate-300">
                    {job.report ? `${job.report.usable_land_percentage}%` : '—'}
                  </td>

                  {/* Actions */}
                  <td className="py-3.5 px-4 text-right">
                    <Link
                      to={`/jobs/${job.job_id}`}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded bg-slate-800 hover:bg-emerald-600 hover:text-slate-950 text-slate-200 text-xs font-semibold transition-colors"
                    >
                      <span>Open Viewer</span>
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </Link>
                  </td>
                </tr>
              ))}

              {filteredJobs.length === 0 && (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-500">
                    No satellite scenes match the selected filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
