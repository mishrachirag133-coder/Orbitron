import React from 'react';
import { JobStatus } from '../../types/job';
import { CheckCircle2, Clock, Loader2, XCircle } from 'lucide-react';

interface StatusBadgeProps {
  status: JobStatus;
  progress?: number;
  size?: 'sm' | 'md' | 'lg';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, progress, size = 'md' }) => {
  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5 gap-1',
    md: 'text-xs px-2.5 py-1 gap-1.5 font-medium',
    lg: 'text-sm px-3.5 py-1.5 gap-2 font-medium',
  }[size];

  switch (status) {
    case 'done':
      return (
        <span className={`inline-flex items-center rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 ${sizeClasses}`}>
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
          <span>Completed</span>
        </span>
      );

    case 'running':
      return (
        <span className={`inline-flex items-center rounded-full bg-sky-500/10 text-sky-400 border border-sky-500/30 ${sizeClasses}`}>
          <Loader2 className="w-3.5 h-3.5 text-sky-400 animate-spin" />
          <span>Running {progress ? `(${progress}%)` : '...'}</span>
        </span>
      );

    case 'pending':
      return (
        <span className={`inline-flex items-center rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/30 ${sizeClasses}`}>
          <Clock className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
          <span>Queued</span>
        </span>
      );

    case 'failed':
      return (
        <span className={`inline-flex items-center rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/30 ${sizeClasses}`}>
          <XCircle className="w-3.5 h-3.5 text-rose-400" />
          <span>Failed</span>
        </span>
      );

    default:
      return (
        <span className={`inline-flex items-center rounded-full bg-slate-700/50 text-slate-300 border border-slate-600 ${sizeClasses}`}>
          <span>{status}</span>
        </span>
      );
  }
};
