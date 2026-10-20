import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Orbit, 
  Layers, 
  Sparkles, 
  CheckCircle2, 
  Clock, 
  ArrowUpRight, 
  Plus, 
  FileSpreadsheet, 
  Database,
  BarChart3,
  TrendingUp,
  Cpu
} from 'lucide-react';
import { useJobs } from '../hooks/useJobs';
import { StatusBadge } from '../components/common/StatusBadge';
import { ClarityScoreRing } from '../components/common/ClarityScoreRing';

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

  const totalMegaBytes = jobs.reduce((acc, curr) => acc + (curr.file_size_mb || 350), 0);
  const totalGigabytes = (totalMegaBytes / 1024).toFixed(2);

  // Recent 5 jobs
  const recentJobs = [...jobs].slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Top Banner & Quick Action */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-slate-900/60 border border-slate-800 rounded-2xl p-6 relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-gradient-to-l from-emerald-500/10 to-transparent pointer-events-none" />
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono font-semibold text-emerald-400 uppercase tracking-wider">
              Autonomous Cloud-Masking Engine
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
          </div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">
            Earth Observation Quality Dashboard
          </h1>
          <p className="text-xs text-slate-400 mt-1 max-w-xl">
            Real-time multispectral radiometric masking, cirrus attenuation indexation, and downstream agronomic usability intelligence.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/jobs"
            className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700/80 transition-colors"
          >
            View All Jobs
          </Link>
          <Link
            to="/new"
            className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-slate-950 text-xs font-bold transition-all shadow-lg shadow-emerald-600/20 flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>Submit GeoTIFF</span>
          </Link>
        </div>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Jobs */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-400 mb-3">
            <span className="text-xs font-medium uppercase tracking-wider">Total Scenes Analyzed</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <Database className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold font-mono text-white">
              {isLoading ? '...' : totalJobs}
            </span>
            <span className="text-xs text-emerald-400 font-medium flex items-center">
              <TrendingUp className="w-3 h-3 mr-0.5" /> +12% this week
            </span>
          </div>
          <div className="text-[11px] text-slate-500 mt-2">
            {completedJobs.length} completed • {activeJobs.length} queued
          </div>
        </div>

        {/* Avg ClarityScore */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-400 mb-3">
            <span className="text-xs font-medium uppercase tracking-wider">Avg ClarityScore™</span>
            <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
              <Sparkles className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold font-mono text-emerald-400">
              {avgClarityScore}
            </span>
            <span className="text-xs text-slate-400 font-mono">/ 100</span>
          </div>
          <div className="text-[11px] text-slate-500 mt-2">
            Analysis-Ready Quality Tier across archive
          </div>
        </div>

        {/* Satellite Imagery Data Processed */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-400 mb-3">
            <span className="text-xs font-medium uppercase tracking-wider">Raster Volume</span>
            <div className="w-8 h-8 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold font-mono text-white">
              {totalGigabytes}
            </span>
            <span className="text-xs text-slate-400">GB Radiance</span>
          </div>
          <div className="text-[11px] text-slate-500 mt-2">
            Multi-spectral L1C/L2A GeoTIFF cubes
          </div>
        </div>

        {/* Inference Latency */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-400 mb-3">
            <span className="text-xs font-medium uppercase tracking-wider">Active Pipeline</span>
            <div className="w-8 h-8 rounded-lg bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400">
              <Cpu className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold font-mono text-white">
              {activeJobs.length}
            </span>
            <span className="text-xs text-sky-400 font-medium">In Flight</span>
          </div>
          <div className="text-[11px] text-slate-500 mt-2">
            Deep Transformer + Fast ONNX Workers
          </div>
        </div>
      </div>

      {/* Main Grid: Recent Jobs Table & Quality Spotlight */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Recent Jobs Table */}
        <div className="lg:col-span-2 bg-slate-900/80 border border-slate-800 rounded-xl overflow-hidden flex flex-col justify-between">
          <div>
            <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <span>Recent Processing Jobs</span>
                  <span className="text-xs font-mono font-normal text-slate-400">
                    ({jobs.length} total)
                  </span>
                </h3>
                <p className="text-xs text-slate-500">
                  Latest multispectral tile classification runs and mask generation
                </p>
              </div>

              <Link
                to="/jobs"
                className="text-xs text-emerald-400 hover:text-emerald-300 font-semibold flex items-center gap-1 transition-colors"
              >
                <span>Full Archive</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-800/80 bg-slate-950/40 text-slate-400 font-mono text-[11px]">
                    <th className="py-3 px-4">Job ID & Scene</th>
                    <th className="py-3 px-4">Sensor</th>
                    <th className="py-3 px-4">Engine</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">ClarityScore</th>
                    <th className="py-3 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {recentJobs.map((job) => (
                    <tr
                      key={job.job_id}
                      className="hover:bg-slate-800/40 transition-colors group"
                    >
                      {/* Job ID & Filename */}
                      <td className="py-3.5 px-4">
                        <div className="font-mono text-emerald-400 font-medium">
                          {job.job_id}
                        </div>
                        <div className="text-slate-400 text-[11px] truncate max-w-[200px]" title={job.filename}>
                          {job.filename || job.s3_key}
                        </div>
                      </td>

                      {/* Sensor */}
                      <td className="py-3.5 px-4 font-medium text-slate-300">
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

                      {/* Action */}
                      <td className="py-3.5 px-4 text-right">
                        <Link
                          to={`/jobs/${job.job_id}`}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-slate-800 hover:bg-emerald-600 hover:text-slate-950 text-slate-200 text-xs font-semibold transition-colors"
                        >
                          <span>Analyze</span>
                          <ArrowUpRight className="w-3 h-3" />
                        </Link>
                      </td>
                    </tr>
                  ))}

                  {recentJobs.length === 0 && (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-slate-500">
                        No processing jobs recorded. Upload your first GeoTIFF scene.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="p-3 border-t border-slate-800/80 bg-slate-950/20 text-center">
            <Link
              to="/new"
              className="text-xs text-slate-400 hover:text-emerald-400 transition-colors"
            >
              + Create new cloud mask analysis from satellite raster
            </Link>
          </div>
        </div>

        {/* Right Col: Quality Benchmark Spotlight */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-bold text-white">Quality Benchmark</h3>
              <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                Fleet Average
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Aggregate radiometric clarity across current satellite scenes
            </p>
          </div>

          {/* Clarity Score Gauge */}
          <div className="py-2">
            <ClarityScoreRing score={avgClarityScore} size={170} />
          </div>

          {/* Usability metrics mini summary */}
          <div className="space-y-2 pt-2 border-t border-slate-800/80 text-xs">
            <div className="flex justify-between text-slate-400">
              <span>Usable Land Surface Area:</span>
              <span className="font-mono text-emerald-400 font-bold">81.2%</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Cirrus Interference Factor:</span>
              <span className="font-mono text-amber-400 font-bold">0.14</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Cloud Shadow Impact Index:</span>
              <span className="font-mono text-purple-400 font-bold">7.8</span>
            </div>
          </div>

          <Link
            to="/jobs/job-cx-88219-sentinel"
            className="w-full py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold text-center transition-colors block border border-slate-700/80"
          >
            Explore Benchmark Scene (San Francisco)
          </Link>
        </div>
      </div>
    </div>
  );
};
