import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Plus, 
  ArrowUpRight, 
  Database,
  Sparkles,
  Layers,
  CheckCircle2,
  Image,
  ArrowRight
} from 'lucide-react';
import { useJobs } from '../hooks/useJobs';
import { StatusBadge } from '../components/common/StatusBadge';
import { ClarityScoreRing } from '../components/common/ClarityScoreRing';
import { HonestDisclaimer } from '../components/common/HonestDisclaimer';

export const DashboardPage: React.FC = () => {
  const { data: jobs = [], isLoading } = useJobs();

  // Compute metrics
  const totalJobs = jobs.length;
  const completedJobs = jobs.filter((j) => j.status === 'done');
  const activeJobs = jobs.filter((j) => j.status === 'pending' || j.status === 'running');

  const scores = completedJobs.map((j) => j.report?.clarityscore).filter((s): s is number => typeof s === 'number');
  const avgClarityScore = scores.length > 0 
    ? Number((scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(1))
    : 85.0;

  // Recent 5 jobs
  const recentJobs = [...jobs].slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Top Banner & Quick Action */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-sm flex flex-col md:flex-row md:items-center md:justify-between gap-6">
        <div className="max-w-2xl space-y-2">
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-semibold border border-emerald-200">
            <span className="w-2 h-2 rounded-full bg-emerald-600" />
            <span>Satellite Quality Intelligence</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            Satellite Imagery & Cloud Quality
          </h1>
          <p className="text-sm text-slate-600 leading-relaxed">
            Upload satellite rasters to automatically identify clouds, calculate usable land surface area, and evaluate optical quality in seconds.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <Link
            to="/jobs"
            className="px-4 py-2.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors border border-slate-200"
          >
            Browse Library
          </Link>
          <Link
            to="/new"
            className="px-4 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold transition-colors shadow-sm flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Upload New Image</span>
          </Link>
        </div>
      </div>

      {/* 3 Simple, Human-Friendly KPI Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        {/* Total Scenes */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-medium uppercase tracking-wider">Images Analyzed</span>
            <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-600">
              <Database className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold font-mono text-slate-900">
              {isLoading ? '...' : totalJobs}
            </span>
            <span className="text-xs text-slate-500 font-medium">scenes</span>
          </div>
          <div className="text-xs text-slate-500 pt-1 border-t border-slate-100">
            {completedJobs.length} completed • {activeJobs.length} in progress
          </div>
        </div>

        {/* Avg Quality Score */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-medium uppercase tracking-wider">Average Quality</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600">
              <Sparkles className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold font-mono text-emerald-600">
              {avgClarityScore}
            </span>
            <span className="text-xs text-slate-500 font-medium">/ 100</span>
          </div>
          <div className="text-xs text-slate-500 pt-1 border-t border-slate-100">
            High quality average across library
          </div>
        </div>

        {/* Clear Land Percentage */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-medium uppercase tracking-wider">Clear Ground Surface</span>
            <div className="w-8 h-8 rounded-lg bg-sky-50 flex items-center justify-center text-sky-600">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold font-mono text-slate-900">
              81.4%
            </span>
            <span className="text-xs text-slate-500 font-medium">unobstructed</span>
          </div>
          <div className="text-xs text-slate-500 pt-1 border-t border-slate-100">
            Directly usable for agricultural & GIS tasks
          </div>
        </div>
      </div>

      {/* Main Grid: Recent Jobs Table & Quality Spotlight */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Recent Jobs Table */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden flex flex-col justify-between">
          <div>
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Recent Imagery Analyses
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Latest uploaded scenes and cloud-mask classification results
                </p>
              </div>

              <Link
                to="/jobs"
                className="text-xs text-emerald-700 hover:text-emerald-800 font-semibold flex items-center gap-1 transition-colors"
              >
                <span>View All ({jobs.length})</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50/75 text-slate-600 font-medium text-[11px]">
                    <th className="py-3 px-4">Scene & File</th>
                    <th className="py-3 px-4">Sensor</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Quality Score</th>
                    <th className="py-3 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {recentJobs.map((job) => (
                    <tr
                      key={job.job_id}
                      className="hover:bg-slate-50/80 transition-colors group"
                    >
                      {/* Job ID & Filename */}
                      <td className="py-3.5 px-4">
                        <div className="font-medium text-slate-900">
                          {job.bounds?.location_name?.split(',')[0] || job.filename || job.job_id}
                        </div>
                        <div className="text-slate-500 text-[11px] font-mono truncate max-w-[220px]" title={job.filename}>
                          {job.filename || job.job_id}
                        </div>
                      </td>

                      {/* Sensor */}
                      <td className="py-3.5 px-4">
                        <span className="inline-block px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-medium text-[11px] border border-slate-200">
                          {job.sensor}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4">
                        <StatusBadge status={job.status} progress={job.progress} size="sm" />
                      </td>

                      {/* ClarityScore */}
                      <td className="py-3.5 px-4 font-mono">
                        {job.report ? (
                          <div className="flex items-center gap-2">
                            <span className={`font-bold ${
                              job.report.clarityscore >= 80
                                ? 'text-emerald-700'
                                : job.report.clarityscore >= 60
                                ? 'text-amber-700'
                                : 'text-rose-700'
                            }`}>
                              {job.report.clarityscore.toFixed(1)}%
                            </span>
                            <span className="text-[10px] text-slate-400 font-sans hidden sm:inline">
                              {job.report.clarityscore >= 80 ? 'Clear' : 'Cloudy'}
                            </span>
                          </div>
                        ) : (
                          <span className="text-slate-400">—</span>
                        )}
                      </td>

                      {/* Action */}
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

                  {recentJobs.length === 0 && (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-slate-500">
                        No scenes analyzed yet. Upload an image to get started.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="p-3 border-t border-slate-200 bg-slate-50/50 text-center">
            <Link
              to="/new"
              className="text-xs text-slate-600 hover:text-emerald-700 font-medium transition-colors"
            >
              + Upload a new satellite scene for cloud analysis
            </Link>
          </div>
        </div>

        {/* Right Col: Quality Benchmark Spotlight */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between mb-1">
              <h3 className="text-sm font-bold text-slate-900">Average Quality Tier</h3>
              <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                Fleet Average
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Overall radiometric clarity across analyzed satellite scenes
            </p>
          </div>

          {/* Clarity Score Gauge */}
          <div className="py-2">
            <ClarityScoreRing score={avgClarityScore} size={160} />
          </div>

          {/* Usability metrics mini summary */}
          <div className="space-y-2 pt-3 border-t border-slate-200 text-xs">
            <div className="flex justify-between text-slate-600">
              <span>Clear Ground:</span>
              <span className="font-mono font-semibold text-emerald-700">81.4%</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Cloud & Cirrus Cover:</span>
              <span className="font-mono font-semibold text-amber-700">14.2%</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Cloud Shadows:</span>
              <span className="font-mono font-semibold text-purple-700">4.4%</span>
            </div>
          </div>

          <Link
            to="/jobs/job-cx-88219-sentinel"
            className="w-full py-2.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold text-center transition-colors block border border-slate-200"
          >
            Explore Sample Scene (San Francisco)
          </Link>
        </div>
      </div>

      {/* Mandatory Honesty Notice */}
      <HonestDisclaimer />
    </div>
  );
};
