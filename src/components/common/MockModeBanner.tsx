import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { mockBackend } from '../../services/mockService';
import { Sparkles, RotateCcw, AlertCircle, ArrowRightLeft } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';

export const MockModeBanner: React.FC = () => {
  const { isMockMode, toggleMockMode } = useAuth();
  const queryClient = useQueryClient();

  if (!isMockMode) return null;

  const handleReset = () => {
    mockBackend.resetDefaults();
    queryClient.invalidateQueries({ queryKey: ['jobs'] });
  };

  return (
    <div className="bg-gradient-to-r from-amber-500/10 via-emerald-500/10 to-sky-500/10 border-b border-amber-500/20 px-4 py-2 flex flex-wrap items-center justify-between text-xs text-slate-300 gap-2">
      <div className="flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
        <span className="font-semibold text-amber-300">DEMO SIMULATION ACTIVE:</span>
        <span className="text-slate-400 hidden sm:inline">
          FastAPI backend not detected or mock mode enabled. Real-time satellite pipeline simulated.
        </span>
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={handleReset}
          className="flex items-center gap-1 text-slate-400 hover:text-white transition-colors"
          title="Restore sample scenes and jobs"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset Sample Jobs</span>
        </button>

        <span className="text-slate-700">|</span>

        <button
          onClick={() => toggleMockMode(false)}
          className="flex items-center gap-1 text-emerald-400 hover:text-emerald-300 font-medium transition-colors"
        >
          <ArrowRightLeft className="w-3.5 h-3.5" />
          <span>Connect Live API</span>
        </button>
      </div>
    </div>
  );
};
