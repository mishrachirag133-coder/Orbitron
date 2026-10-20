import React from 'react';
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Tooltip
} from 'recharts';
import { DownstreamUsabilityRating } from '../../types/job';
import { Sprout, Building2, GitCompare, CheckCircle, AlertTriangle } from 'lucide-react';

interface DownstreamRadarChartProps {
  ratings: DownstreamUsabilityRating;
}

export const DownstreamRadarChart: React.FC<DownstreamRadarChartProps> = ({ ratings }) => {
  const radarData = [
    { subject: 'NDVI Vegetation', value: ratings.ndvi, fullMark: 100 },
    { subject: 'Building Footprints', value: ratings.building_seg, fullMark: 100 },
    { subject: 'Change Detection', value: ratings.change_detection, fullMark: 100 },
  ];

  const getUsabilityBadge = (score: number) => {
    if (score >= 80) {
      return {
        label: 'Optimal',
        icon: <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />,
        color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
      };
    } else if (score >= 50) {
      return {
        label: 'Marginal',
        icon: <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />,
        color: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
      };
    } else {
      return {
        label: 'Infeasible',
        icon: <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />,
        color: 'text-rose-400 bg-rose-500/10 border-rose-500/20',
      };
    }
  };

  return (
    <div className="flex flex-col h-full justify-between">
      <div className="h-44 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
            <PolarGrid stroke="#1e293b" />
            <PolarAngleAxis dataKey="subject" stroke="#94a3b8" fontSize={10} />
            <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="#334155" fontSize={9} />
            <Radar
              name="Usability Index"
              dataKey="value"
              stroke="#38bdf8"
              fill="#38bdf8"
              fillOpacity={0.35}
            />
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const item = payload[0].payload;
                  return (
                    <div className="bg-slate-900 border border-slate-700 p-2 rounded shadow-xl text-xs">
                      <div className="text-slate-300 font-medium">{item.subject}</div>
                      <div className="font-mono text-sky-400 font-bold text-sm">
                        {item.value} / 100
                      </div>
                    </div>
                  );
                }
                return null;
              }}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>

      {/* Breakdown list */}
      <div className="space-y-2 mt-2 pt-2 border-t border-slate-800/80 text-xs">
        {/* NDVI */}
        <div className="flex items-center justify-between bg-slate-900/40 px-2.5 py-1.5 rounded border border-slate-800">
          <div className="flex items-center gap-2">
            <Sprout className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-slate-300 font-medium">NDVI Agronomy</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-mono font-bold text-slate-200">{ratings.ndvi}%</span>
            {(() => {
              const b = getUsabilityBadge(ratings.ndvi);
              return (
                <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] border ${b.color}`}>
                  {b.icon}
                  {b.label}
                </span>
              );
            })()}
          </div>
        </div>

        {/* Building Segmentation */}
        <div className="flex items-center justify-between bg-slate-900/40 px-2.5 py-1.5 rounded border border-slate-800">
          <div className="flex items-center gap-2">
            <Building2 className="w-3.5 h-3.5 text-sky-400" />
            <span className="text-slate-300 font-medium">Building Footprints</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-mono font-bold text-slate-200">{ratings.building_seg}%</span>
            {(() => {
              const b = getUsabilityBadge(ratings.building_seg);
              return (
                <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] border ${b.color}`}>
                  {b.icon}
                  {b.label}
                </span>
              );
            })()}
          </div>
        </div>

        {/* Change Detection */}
        <div className="flex items-center justify-between bg-slate-900/40 px-2.5 py-1.5 rounded border border-slate-800">
          <div className="flex items-center gap-2">
            <GitCompare className="w-3.5 h-3.5 text-purple-400" />
            <span className="text-slate-300 font-medium">Temporal Change</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-mono font-bold text-slate-200">{ratings.change_detection}%</span>
            {(() => {
              const b = getUsabilityBadge(ratings.change_detection);
              return (
                <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] border ${b.color}`}>
                  {b.icon}
                  {b.label}
                </span>
              );
            })()}
          </div>
        </div>
      </div>
    </div>
  );
};
