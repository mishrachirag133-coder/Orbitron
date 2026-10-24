import React from 'react';
import { Info, ShieldAlert } from 'lucide-react';

export const HonestDisclaimer: React.FC<{ compact?: boolean }> = ({ compact = false }) => {
  if (compact) {
    return (
      <div className="flex items-center gap-1.5 text-[11px] text-slate-500 font-mono">
        <Info className="w-3.5 h-3.5 text-amber-600 shrink-0" />
        <span>Notice: Decision support only, not an official warning system.</span>
      </div>
    );
  }

  return (
    <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs text-slate-600 flex items-start gap-3 shadow-xs">
      <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
      <div className="space-y-1">
        <div className="font-semibold text-slate-800 text-xs flex items-center gap-2">
          <span>Decision Support System (Operational Scope & Honesty Notice)</span>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-200 text-slate-700">
            Hackathon Protocol
          </span>
        </div>
        <p className="text-[11px] text-slate-500 leading-relaxed">
          Cloud Breaker provides radiometric quality intelligence and Sentinel-2 SCL trust scoring for target AOI windows. 
          This platform is designed for research, mission planning, and decision support—<strong>not an official disaster warning system</strong>. 
          Algorithm accuracy targets are development goals; rigorous field validation must precede real-world emergency response deployments.
        </p>
      </div>
    </div>
  );
};
