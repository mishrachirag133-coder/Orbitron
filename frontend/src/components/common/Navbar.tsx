import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Orbit, 
  Search,
  FolderArchive,
  Sparkles,
  Layers,
  CheckCircle2,
  Activity
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useHealth, useJobs } from '../../hooks/useJobs';

export const Navbar: React.FC = () => {
  const { user, isMockMode, toggleMockMode } = useAuth();
  const { data: health } = useHealth();
  const { data: jobs = [] } = useJobs();
  const location = useLocation();

  const isLiveHealthy = health?.status === 'ok' || health?.status === 'healthy';

  return (
    <header className="h-16 border-b border-slate-200 bg-white sticky top-0 z-40 px-4 sm:px-6 lg:px-8 flex items-center justify-between shadow-xs">
      {/* Brand & Left Logo */}
      <div className="flex items-center gap-6 sm:gap-8">
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center text-white transition-transform group-hover:scale-105 shadow-sm">
            <Orbit className="w-5 h-5 stroke-[2.2]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-base font-bold tracking-tight text-slate-900">
                Cloud<span className="text-emerald-600">Breaker</span>
              </span>
              <span className="hidden sm:inline-flex text-[10px] font-mono font-medium px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                Sentinel-2 L2A
              </span>
            </div>
            <p className="hidden sm:block text-[11px] text-slate-600 font-medium">
              Satellite Cloud & Usability Intelligence
            </p>
          </div>
        </Link>

        {/* Primary Navigation Tabs */}
        <nav className="flex items-center gap-1.5 text-xs font-medium">
          <Link
            to="/"
            className={`px-3.5 py-2 rounded-lg flex items-center gap-1.5 transition-all ${
              location.pathname === '/' || location.pathname === '/new'
                ? 'bg-emerald-50 text-emerald-900 font-semibold border border-emerald-200/80 shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Search className="w-3.5 h-3.5 text-emerald-700" />
            <span>Analyze Imagery</span>
          </Link>

          <Link
            to="/jobs"
            className={`px-3.5 py-2 rounded-lg flex items-center gap-1.5 transition-all ${
              location.pathname.startsWith('/jobs')
                ? 'bg-emerald-50 text-emerald-900 font-semibold border border-emerald-200/80 shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <FolderArchive className="w-3.5 h-3.5 text-slate-500" />
            <span>Saved Scans</span>
            {jobs.length > 0 && (
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-slate-200 text-slate-700 font-bold ml-0.5">
                {jobs.length}
              </span>
            )}
          </Link>
        </nav>
      </div>

      {/* Right controls */}
      <div className="flex items-center gap-3">
        {/* Subtle Live / Demo Status Pill */}
        <button
          onClick={() => toggleMockMode()}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
            isMockMode
              ? 'bg-amber-50 text-amber-900 border-amber-300 hover:bg-amber-100'
              : 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
          }`}
          title="Click to toggle between Live Planetary Computer STAC and Offline Benchmark Data"
        >
          <span className={`w-2 h-2 rounded-full ${isMockMode ? 'bg-amber-500' : 'bg-emerald-600 animate-pulse'}`} />
          <span className="font-mono text-[11px]">
            {isMockMode ? 'Demo Mode' : (isLiveHealthy ? 'Live STAC Connected' : 'Live Mode')}
          </span>
        </button>

        {/* User Profile Badge */}
        <div className="hidden md:flex items-center gap-2 pl-3 border-l border-slate-200 text-xs">
          <div className="w-7 h-7 rounded-full bg-slate-100 border border-slate-300 flex items-center justify-center font-bold text-slate-600 text-[11px]">
            EO
          </div>
          <span className="text-slate-600 font-medium">{user?.email?.split('@')[0] || 'Analyst'}</span>
        </div>
      </div>
    </header>
  );
};
