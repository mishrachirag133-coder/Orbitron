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
    { subject: 'Vegetation (NDVI)', value: ratings.ndvi, fullMark: 100 },
    { subject: 'Building Footprints', value: ratings.building_seg, fullMark: 100 },
    { subject: 'Change Detection', value: ratings.change_detection, fullMark: 100 },
  ];

  const getUsabilityBadge = (score: number) => {
    if (score >= 80) {
      return {
        label: 'Optimal',
        icon: <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />,
        color: 'text-emerald-700 bg-emerald-50 border-emerald-200',
      };
    } else if (score >= 50) {
      return {
        label: 'Marginal',
        icon: <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />,
        color: 'text-amber-800 bg-amber-50 border-amber-200',
      };
    } else {
      return {
        label: 'Infeasible',
        icon: <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />,
        color: 'text-rose-700 bg-rose-50 border-rose-200',
      };
    }
  };

  return (
    <div className="flex flex-col h-full justify-between">
      <div className="h-44 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
            <PolarGrid stroke="#e2e8f0" />
            <PolarAngleAxis dataKey="subject" stroke="#64748b" fontSize={10} />
            <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="#cbd5e1" fontSize={9} />
            <Radar
              name="Usability Index"
              dataKey="value"
              stroke="#0284c7"
              fill="#0284c7"
              fillOpacity={0.25}
            />
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const item = payload[0].payload;
                  return (
                    <div className="bg-white border border-slate-200 p-2.5 rounded-lg shadow-md text-xs">
                      <div className="text-slate-700 font-semibold">{item.subject}</div>
                      <div className="font-mono text-sky-700 font-bold text-sm">
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
      <div className="space-y-2 mt-2 pt-2 border-t border-slate-200 text-xs">
        {/* NDVI */}
        <div className="flex items-center justify-between bg-slate-50 px-2.5 py-1.5 rounded-lg border border-slate-200">
          <div className="flex items-center gap-2">
            <Sprout className="w-3.5 h-3.5 text-emerald-600" />
            <span className="text-slate-700 font-medium">Vegetation (NDVI)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-mono font-bold text-slate-900">{ratings.ndvi}%</span>
            {(() => {
              const b = getUsabilityBadge(ratings.ndvi);
              return (
                <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] border font-medium ${b.color}`}>
                  {b.icon}
                  {b.label}
                </span>
              );
            })()}
          </div>
        </div>

        {/* Building Segmentation */}
        <div className="flex items-center justify-between bg-slate-50 px-2.5 py-1.5 rounded-lg border border-slate-200">
          <div className="flex items-center gap-2">
            <Building2 className="w-3.5 h-3.5 text-sky-600" />
            <span className="text-slate-700 font-medium">Urban & Structures</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-mono font-bold text-slate-900">{ratings.building_seg}%</span>
            {(() => {
              const b = getUsabilityBadge(ratings.building_seg);
              return (
                <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] border font-medium ${b.color}`}>
                  {b.icon}
                  {b.label}
                </span>
              );
            })()}
          </div>
        </div>

        {/* Change Detection */}
        <div className="flex items-center justify-between bg-slate-50 px-2.5 py-1.5 rounded-lg border border-slate-200">
          <div className="flex items-center gap-2">
            <GitCompare className="w-3.5 h-3.5 text-purple-600" />
            <span className="text-slate-700 font-medium">Temporal Change</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-mono font-bold text-slate-900">{ratings.change_detection}%</span>
            {(() => {
              const b = getUsabilityBadge(ratings.change_detection);
              return (
                <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] border font-medium ${b.color}`}>
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
