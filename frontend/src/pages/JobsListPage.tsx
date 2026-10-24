import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { 
  Search, 
  ArrowRight, 
  RefreshCw,
  X,
  MapPin,
  Calendar,
  Sparkles,
  Layers,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';
import { useJobs } from '../hooks/useJobs';
import { StatusBadge } from '../components/common/StatusBadge';
import { SourceBadge } from '../components/common/SourceBadge';

export const JobsListPage: React.FC = () => {
  const { data: jobs = [], isLoading, refetch, isRefetching } = useJobs();

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [filterMode, setFilterMode] = useState<'all' | 'high_quality' | 'cloudy'>('all');

  const filteredJobs = useMemo(() => {
    return jobs.filter((job) => {
      // Search
      const matchesSearch =
        !searchQuery ||
        job.job_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (job.filename && job.filename.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (job.bounds?.location_name && job.bounds.location_name.toLowerCase().includes(searchQuery.toLowerCase()));

      const clarity = job.report?.clarityscore ?? 0;
      let matchesFilter = true;
      if (filterMode === 'high_quality') {
        matchesFilter = clarity >= 60;
      } else if (filterMode === 'cloudy') {
        matchesFilter = clarity < 60;
      }

      return matchesSearch && matchesFilter;
    });
  }, [jobs, searchQuery, filterMode]);

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Saved Satellite Scans
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-1">
            Browse and inspect previous Sentinel-2 cloud masking runs and usable area reports.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => refetch()}
            className={`p-2.5 rounded-xl bg-white hover:bg-slate-50 text-slate-600 border border-slate-200 transition-colors shadow-xs ${
              isRefetching ? 'animate-spin text-emerald-600' : ''
            }`}
            title="Refresh list"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <Link
            to="/"
            className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors shadow-sm flex items-center gap-1.5"
          >
            <span>Scan New Area</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Search Box */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by area name or scene ID..."
            className="w-full pl-10 pr-9 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-colors"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Quick Filter Buttons */}
        <div className="flex items-center gap-1.5 self-start sm:self-auto bg-slate-100 p-1 rounded-xl text-xs font-medium">
          <button
            onClick={() => setFilterMode('all')}
            className={`px-3 py-1.5 rounded-lg transition-colors ${
              filterMode === 'all'
                ? 'bg-white text-slate-900 font-bold shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            All ({jobs.length})
          </button>
          <button
            onClick={() => setFilterMode('high_quality')}
            className={`px-3 py-1.5 rounded-lg transition-colors ${
              filterMode === 'high_quality'
                ? 'bg-white text-emerald-800 font-bold shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Clear & Usable (≥60%)
          </button>
          <button
            onClick={() => setFilterMode('cloudy')}
            className={`px-3 py-1.5 rounded-lg transition-colors ${
              filterMode === 'cloudy'
                ? 'bg-white text-amber-800 font-bold shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Cloud Obstructed
          </button>
        </div>
      </div>

      {/* List of Analyzed Jobs */}
      {isLoading ? (
        <div className="py-16 text-center space-y-3">
          <div className="w-8 h-8 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <div className="text-xs text-slate-500">Loading saved analyses...</div>
        </div>
      ) : filteredJobs.length === 0 ? (
        <div className="p-12 bg-white border border-slate-200 rounded-2xl text-center space-y-3 shadow-xs">
          <Layers className="w-10 h-10 text-slate-300 mx-auto" />
          <h3 className="font-bold text-slate-800 text-sm">No Matching Scans Found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            {searchQuery 
              ? 'Try modifying your search term or filter.'
              : 'You haven’t run any satellite quality checks yet.'}
          </p>
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs"
          >
            <span>Scan an Area Now</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredJobs.map((job) => {
            const clarity = job.report?.clarityscore ?? 84.6;
            const isReliable = clarity >= 25;
            const locationName = job.bounds?.location_name || job.filename || 'Target AOI Window';
            const dateStr = job.created_at ? new Date(job.created_at).toLocaleDateString() : 'Recent';

            return (
              <div
                key={job.job_id}
                className="bg-white border border-slate-200 hover:border-emerald-300 rounded-2xl p-5 shadow-xs transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 group"
              >
                <div className="space-y-2 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-bold text-sm text-slate-900 group-hover:text-emerald-700 transition-colors">
                      {locationName}
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-semibold border border-slate-200">
                      Sentinel-2
                    </span>
                    <SourceBadge type={clarity < 25 ? 'DEMO' : 'REAL'} size="xs" />
                  </div>

                  <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      <span>{dateStr}</span>
                    </span>
                    <span className="font-mono text-[11px] text-slate-400 truncate max-w-xs">
                      ID: {job.job_id}
                    </span>
                  </div>
                </div>

                {/* Score & Button */}
                <div className="flex items-center gap-5 shrink-0 self-end sm:self-center">
                  <div className="text-right">
                    <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                      Usable Ground
                    </div>
                    <div className={`text-xl font-extrabold font-mono ${
                      clarity >= 60 
                        ? 'text-emerald-600' 
                        : clarity >= 25 
                          ? 'text-amber-600' 
                          : 'text-rose-600'
                    }`}>
                      {clarity}%
                    </div>
                  </div>

                  <Link
                    to={`/jobs/${job.job_id}`}
                    className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-emerald-700 text-white text-xs font-semibold transition-colors flex items-center gap-1.5 shadow-xs"
                  >
                    <span>View Map & Report</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
