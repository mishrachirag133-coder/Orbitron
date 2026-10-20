import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { mockBackend } from '../../services/mockService';
import { RotateCcw, ArrowRightLeft, Info } from 'lucide-react';
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
    <div className="bg-amber-50 border-b border-amber-200/80 px-4 py-2 flex flex-wrap items-center justify-between text-xs text-amber-900 gap-2">
      <div className="flex items-center gap-2">
        <Info className="w-3.5 h-3.5 text-amber-600 shrink-0" />
        <span className="font-semibold text-amber-950">Demo Mode Active:</span>
        <span className="text-amber-800">
          Showing sample satellite data. You can upload custom images or reset demo data at any time.
        </span>
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={handleReset}
          className="flex items-center gap-1 text-amber-800 hover:text-amber-950 font-medium transition-colors"
          title="Restore sample scenes and jobs"
        >
          <RotateCcw className="w-3 h-3" />
          <span>Reset Sample Data</span>
        </button>

        <span className="text-amber-300">|</span>

        <button
          onClick={() => toggleMockMode(false)}
          className="flex items-center gap-1 text-emerald-700 hover:text-emerald-800 font-semibold transition-colors"
        >
          <ArrowRightLeft className="w-3 h-3" />
          <span>Connect Live API</span>
        </button>
      </div>
    </div>
  );
};
