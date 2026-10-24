import React from 'react';
import { SourceBadgeType } from '../../types/job';

interface SourceBadgeProps {
  type: SourceBadgeType | string;
  size?: 'xs' | 'sm' | 'md';
  showLabel?: boolean;
}

export const SourceBadge: React.FC<SourceBadgeProps> = ({
  type,
  size = 'xs',
  showLabel = true,
}) => {
  const normType = (type || 'REAL').toUpperCase();

  const configs: Record<string, { bg: string; text: string; border: string; label: string; desc: string }> = {
    REAL: {
      bg: 'bg-emerald-50',
      text: 'text-emerald-700',
      border: 'border-emerald-200',
      label: 'REAL DATA',
      desc: 'Computed directly from Sentinel-2 L2A STAC raster pixels inside your AOI window.'
    },
    ESTIMATE: {
      bg: 'bg-sky-50',
      text: 'text-sky-700',
      border: 'border-sky-200',
      label: 'ESTIMATE',
      desc: 'Modeled downstream index or regional 100km tile average.'
    },
    DEMO: {
      bg: 'bg-amber-50',
      text: 'text-amber-800',
      border: 'border-amber-200',
      label: 'DEMO BUNDLE',
      desc: 'Offline cached benchmark sample. Clearly separated from live provider feeds.'
    },
    UNAVAILABLE: {
      bg: 'bg-rose-50',
      text: 'text-rose-700',
      border: 'border-rose-200',
      label: 'UNAVAILABLE',
      desc: 'Band missing or out-of-bounds in this acquisition.'
    }
  };

  const config = configs[normType] || configs.REAL;

  const sizeClass = {
    xs: 'text-[9px] px-1.5 py-0.2',
    sm: 'text-[10px] px-2 py-0.5',
    md: 'text-xs px-2.5 py-1',
  }[size];

  return (
    <span
      className={`inline-flex items-center gap-1 font-mono font-bold rounded uppercase tracking-wider border transition-colors cursor-help ${config.bg} ${config.text} ${config.border} ${sizeClass}`}
      title={config.desc}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current" />
      {showLabel && <span>{config.label}</span>}
    </span>
  );
};
