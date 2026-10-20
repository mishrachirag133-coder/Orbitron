import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Orbit, 
  Activity, 
  Key, 
  LogOut, 
  SlidersHorizontal, 
  ExternalLink, 
  Cpu, 
  Plus, 
  ShieldCheck,
  RefreshCw
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useHealth } from '../../hooks/useJobs';

export const Navbar: React.FC = () => {
  const { user, logout, isMockMode, toggleMockMode } = useAuth();
  const { data: health, isLoading: isHealthLoading, refetch: refetchHealth } = useHealth();
  const navigate = useNavigate();
  const [showConfigModal, setShowConfigModal] = useState(false);

  return (
    <header className="h-16 border-b border-slate-800 bg-slate-950/90 backdrop-blur-md sticky top-0 z-40 px-4 sm:px-6 flex items-center justify-between">
      {/* Brand & Left Logo */}
      <div className="flex items-center gap-6">
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center shadow-lg shadow-emerald-500/20 group-hover:scale-105 transition-transform">
            <Orbit className="w-5 h-5 text-slate-950" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold tracking-tight text-white group-hover:text-emerald-400 transition-colors">
                Clarity<span className="text-emerald-400">X</span>
              </span>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                v2.4-AI
              </span>
            </div>
            <p className="text-[10px] text-slate-400 hidden sm:block tracking-wide">
              Satellite Cloud-Masking & Intelligence
            </p>
          </div>
        </Link>
      </div>

      {/* Right controls */}
      <div className="flex items-center gap-3">
        {/* Mock/Live Status Pill */}
        <button
          onClick={() => toggleMockMode()}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-mono border transition-all ${
            isMockMode
              ? 'bg-amber-500/10 text-amber-400 border-amber-500/30 hover:bg-amber-500/20'
              : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20'
          }`}
          title="Click to toggle between Mock and Live API"
        >
          <span className={`w-2 h-2 rounded-full ${isMockMode ? 'bg-amber-400' : 'bg-emerald-400'} animate-pulse`} />
          <span className="font-semibold">{isMockMode ? 'Mock Simulation Mode' : 'Live FastAPI Backend'}</span>
        </button>

        {/* Health status */}
        <button
          onClick={() => setShowConfigModal(true)}
          className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-300 hover:border-slate-700 transition-colors"
          title="View API status and parameters"
        >
          <Activity className="w-3.5 h-3.5 text-emerald-400" />
          <span>API Health:</span>
          <span className="text-emerald-400 font-mono font-medium">
            {health?.status || (isHealthLoading ? 'Checking...' : 'Healthy')}
          </span>
        </button>

        {/* New Analysis Button */}
        <Link
          to="/new"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-semibold text-xs transition-all shadow-md shadow-emerald-600/20"
        >
          <Plus className="w-3.5 h-3.5 stroke-[3]" />
          <span>New Analysis</span>
        </Link>

        {/* User profile / Logout */}
        {user && (
          <div className="flex items-center gap-2 pl-2 border-l border-slate-800">
            <div className="hidden lg:flex flex-col text-right">
              <span className="text-xs font-medium text-slate-200">{user.email.split('@')[0]}</span>
              <span className="text-[10px] text-slate-500">{user.role || 'Operator'}</span>
            </div>
            <button
              onClick={logout}
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* Diagnostics / API Settings Modal */}
      {showConfigModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Cpu className="w-5 h-5 text-emerald-400" />
                <h3 className="font-semibold text-white">System & API Diagnostics</h3>
              </div>
              <button
                onClick={() => setShowConfigModal(false)}
                className="text-slate-400 hover:text-white text-sm"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 font-mono space-y-1.5">
                <div className="flex justify-between text-slate-400">
                  <span>API Base URL:</span>
                  <span className="text-white truncate max-w-[200px]">
                    {import.meta.env.VITE_API_URL || 'Mock Fallback Active'}
                  </span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Backend State:</span>
                  <span className="text-emerald-400 font-bold">{health?.status || 'Online'}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Inference Engines:</span>
                  <span className="text-slate-200">Fast ONNX + Deep Transformer</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>GPU Acceleration:</span>
                  <span className="text-emerald-400">NVIDIA TensorRT Active</span>
                </div>
              </div>

              <div className="p-3 rounded-lg bg-emerald-500/5 border border-emerald-500/20 text-slate-300">
                <div className="flex items-center gap-1.5 font-semibold text-emerald-400 mb-1">
                  <ShieldCheck className="w-4 h-4" />
                  Demonstration Ready
                </div>
                ClarityX includes built-in mock telemetry so you can evaluate cloud masks, SNR charts, and downstream scores without waiting for server configurations.
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => {
                  refetchHealth();
                  setShowConfigModal(false);
                }}
                className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-200 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
