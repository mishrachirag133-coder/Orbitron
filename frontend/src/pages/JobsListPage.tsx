import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { 
  Search, 
  Plus, 
  ArrowRight, 
  RefreshCw,
  SlidersHorizontal,
  X
} from 'lucide-react';
import { useJobs } from '../hooks/useJobs';
import { StatusBadge } from '../components/common/StatusBadge';

export const JobsListPage: React.FC = () => {
  const { data: jobs = [], isLoading, refetch, isRefetching } = useJobs();

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSensor, setSelectedSensor] = useState<string>('all');
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

      // Status
      const matchesStatus = selectedStatus === 'all' || job.status === selectedStatus;

      // Min Clarity
      const clarity = job.report?.clarityscore ?? 0;
      const matchesClarity = minClarity === 0 || clarity >= minClarity;

      return matchesSearch && matchesSensor && matchesStatus && matchesClarity;
    });
  }, [jobs, searchQuery, selectedSensor, selectedStatus, minClarity]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Imagery Library
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-1">
            Browse, search, and inspect satellite scenes, cloud masks, and quality grades.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => refetch()}
            className={`p-2 rounded-lg bg-white hover:bg-slate-50 text-slate-600 border border-slate-300 transition-colors shadow-xs ${
              isRefetching ? 'animate-spin text-emerald-600' : ''
            }`}
            title="Refresh imagery list"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <Link
            to="/new"
            className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold transition-colors shadow-sm flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Upload Image</span>
          </Link>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          {/* Search Box */}
          <div className="relative md:col-span-2">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by file name or location..."
              className="w-full pl-9 pr-8 py-2 rounded-lg bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 focus:bg-white transition-colors"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Sensor Filter */}
          <div>
            <select
              value={selectedSensor}
              onChange={(e) => setSelectedSensor(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 text-slate-800 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            >
              <option value="all">All Sensors</option>
              <option value="Sentinel-2">Sentinel-2 (MSI)</option>
              <option value="Landsat-8/9">Landsat 8/9</option>
              <option value="PlanetScope">PlanetScope</option>
              <option value="WorldView-3">WorldView-3</option>
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 text-slate-800 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            >
              <option value="all">All Statuses</option>
              <option value="done">Completed</option>
              <option value="running">In Progress</option>
              <option value="pending">Queued</option>
              <option value="failed">Failed</option>
            </select>
          </div>
        </div>

        {/* Second row: Min Clarity Filter */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs text-slate-600">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-3.5 h-3.5 text-slate-400" />
            <span>Minimum Quality:</span>
            <input
              type="range"
              min="0"
              max="90"
              step="5"
              value={minClarity}
              onChange={(e) => setMinClarity(Number(e.target.value))}
              className="w-28 h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
            />
            <span className="font-semibold text-slate-800 text-xs min-w-10">
              {minClarity > 0 ? `≥${minClarity}%` : 'Any'}
            </span>
          </div>

          <div className="text-xs text-slate-500">
            Showing <span className="font-semibold text-slate-900">{filteredJobs.length}</span> of {jobs.length} scenes
          </div>
        </div>
      </div>

      {/* Jobs Table */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/80 text-slate-600 font-medium text-[11px]">
                <th className="py-3 px-4">Scene & File</th>
                <th className="py-3 px-4">Location</th>
                <th className="py-3 px-4">Sensor</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Quality Score</th>
                <th className="py-3 px-4">Clear Ground</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredJobs.map((job) => (
                <tr
                  key={job.job_id}
                  className="hover:bg-slate-50/80 transition-colors group"
                >
                  {/* File & ID */}
                  <td className="py-3.5 px-4">
                    <Link
                      to={`/jobs/${job.job_id}`}
                      className="font-semibold text-slate-900 hover:text-emerald-700 block"
                    >
                      {job.filename || job.job_id}
                    </Link>
                    <span className="text-[10px] font-mono text-slate-400">
                      ID: {job.job_id}
                    </span>
                  </td>

                  {/* Location */}
                  <td className="py-3.5 px-4 text-slate-600">
                    <div className="truncate max-w-xs" title={job.bounds?.location_name}>
                      {job.bounds?.location_name || 'Global Coverage'}
                    </div>
                  </td>

                  {/* Sensor */}
                  <td className="py-3.5 px-4">
                    <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200 text-[11px] font-medium">
                      {job.sensor}
                    </span>
                  </td>

                  {/* Status */}
                  <td className="py-3.5 px-4">
                    <StatusBadge status={job.status} progress={job.progress} size="sm" />
                  </td>

                  {/* Quality Score */}
                  <td className="py-3.5 px-4 font-mono">
                    {job.report ? (
                      <span className={`font-bold ${
                        job.report.clarityscore >= 80
                          ? 'text-emerald-700'
                          : job.report.clarityscore >= 60
                          ? 'text-amber-700'
                          : 'text-rose-700'
                      }`}>
                        {job.report.clarityscore.toFixed(1)}%
                      </span>
                    ) : (
                      <span className="text-slate-400">—</span>
                    )}
                  </td>

                  {/* Clear Land */}
                  <td className="py-3.5 px-4 font-mono text-slate-700">
                    {job.report ? `${job.report.usable_land_percentage}%` : '—'}
                  </td>

                  {/* Actions */}
                  <td className="py-3.5 px-4 text-right">
                    <Link
                      to={`/jobs/${job.job_id}`}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-medium transition-colors"
                    >
                      <span>Inspect</span>
                      <ArrowRight className="w-3 h-3" />
                    </Link>
                  </td>
                </tr>
              ))}

              {filteredJobs.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-500">
                    No satellite scenes match your search filters.
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
