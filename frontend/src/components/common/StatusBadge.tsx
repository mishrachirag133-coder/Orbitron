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
    sm: 'text-xs px-2 py-0.5 gap-1 font-medium',
    md: 'text-xs px-2.5 py-1 gap-1.5 font-medium',
    lg: 'text-sm px-3.5 py-1.5 gap-2 font-medium',
  }[size];

  switch (status) {
    case 'done':
      return (
        <span className={`inline-flex items-center rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 ${sizeClasses}`}>
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
          <span>Completed</span>
        </span>
      );

    case 'running':
      return (
        <span className={`inline-flex items-center rounded-full bg-blue-50 text-blue-700 border border-blue-200 ${sizeClasses}`}>
          <Loader2 className="w-3.5 h-3.5 text-blue-600 animate-spin" />
          <span>Processing {progress ? `(${progress}%)` : '...'}</span>
        </span>
      );

    case 'pending':
      return (
        <span className={`inline-flex items-center rounded-full bg-amber-50 text-amber-800 border border-amber-200 ${sizeClasses}`}>
          <Clock className="w-3.5 h-3.5 text-amber-600" />
          <span>Queued</span>
        </span>
      );

    case 'failed':
      return (
        <span className={`inline-flex items-center rounded-full bg-rose-50 text-rose-700 border border-rose-200 ${sizeClasses}`}>
          <XCircle className="w-3.5 h-3.5 text-rose-600" />
          <span>Failed</span>
        </span>
      );

    default:
      return (
        <span className={`inline-flex items-center rounded-full bg-slate-100 text-slate-700 border border-slate-200 ${sizeClasses}`}>
          <span>{status}</span>
        </span>
      );
  }
};
