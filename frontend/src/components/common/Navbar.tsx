import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Orbit, 
  LogOut, 
  Plus, 
  LayoutDashboard,
  FolderArchive,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useHealth } from '../../hooks/useJobs';

export const Navbar: React.FC = () => {
  const { user, logout, isMockMode, toggleMockMode } = useAuth();
  const { data: health } = useHealth();
  const location = useLocation();

  const isLiveHealthy = health?.status === 'ok' || health?.status === 'healthy';

  return (
    <header className="h-16 border-b border-slate-200 bg-white sticky top-0 z-40 px-4 sm:px-6 flex items-center justify-between">
      {/* Brand & Left Logo */}
      <div className="flex items-center gap-8">
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center text-white transition-transform group-hover:scale-105">
            <Orbit className="w-4 h-4 stroke-[2.5]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-base font-bold tracking-tight text-slate-900">
                Clarity<span className="text-emerald-600">X</span>
              </span>
              <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                Satellite Inspector
              </span>
            </div>
          </div>
        </Link>

        {/* Quick Top Navigation for mobile/desktop */}
        <nav className="hidden md:flex items-center gap-1">
          <Link
            to="/"
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
              location.pathname === '/'
                ? 'bg-slate-100 text-slate-900 font-semibold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            Dashboard
          </Link>
          <Link
            to="/jobs"
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
              location.pathname.startsWith('/jobs')
                ? 'bg-slate-100 text-slate-900 font-semibold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            All Imagery
          </Link>
        </nav>
      </div>

      {/* Right controls */}
      <div className="flex items-center gap-3">
        {/* Mock/Live status toggle */}
        <button
          onClick={() => toggleMockMode()}
          className={`hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium border transition-colors ${
            isMockMode
              ? 'bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100'
              : 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
          }`}
          title="Click to toggle between Demo Data and Live Backend"
        >
          <span className={`w-2 h-2 rounded-full ${isMockMode ? 'bg-amber-500' : 'bg-emerald-500'}`} />
          <span>{isMockMode ? 'Demo Mode' : (isLiveHealthy ? 'Live API Connected' : 'Live Mode')}</span>
        </button>

        {/* New Analysis Button */}
        <Link
          to="/new"
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-xs transition-colors shadow-sm"
        >
          <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
          <span>Upload Image</span>
        </Link>

        {/* User profile / Logout */}
        {user && (
          <div className="flex items-center gap-2 pl-3 border-l border-slate-200">
            <div className="hidden lg:flex flex-col text-right">
              <span className="text-xs font-semibold text-slate-800">{user.email.split('@')[0]}</span>
              <span className="text-[11px] text-slate-500">{user.role || 'Analyst'}</span>
            </div>
            <button
              onClick={logout}
              className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-colors"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </header>
  );
};
