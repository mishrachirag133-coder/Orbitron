import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { ClassDistribution } from '../../types/job';

interface ClassDistributionChartProps {
  distribution: ClassDistribution;
}

const COLORS = {
  clear: '#059669', // emerald
  thick_cloud: '#0284c7', // sky
  thin_cirrus: '#f59e0b', // amber
  shadow: '#9333ea', // purple
};

const LABELS: Record<string, string> = {
  clear: 'Clear Ground',
  thick_cloud: 'Thick Cloud',
  thin_cirrus: 'Thin Cirrus',
  shadow: 'Cloud Shadow',
};

export const ClassDistributionChart: React.FC<ClassDistributionChartProps> = ({ distribution }) => {
  const data = [
    { name: LABELS.clear, key: 'clear', value: distribution.clear, color: COLORS.clear },
    { name: LABELS.thick_cloud, key: 'thick_cloud', value: distribution.thick_cloud, color: COLORS.thick_cloud },
    { name: LABELS.thin_cirrus, key: 'thin_cirrus', value: distribution.thin_cirrus, color: COLORS.thin_cirrus },
    { name: LABELS.shadow, key: 'shadow', value: distribution.shadow, color: COLORS.shadow },
  ];

  return (
    <div className="flex flex-col h-full justify-between">
      <div className="relative h-44 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const item = payload[0].payload;
                  return (
                    <div className="bg-white border border-slate-200 p-2.5 rounded-lg shadow-md text-xs">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                        <span className="font-semibold text-slate-800">{item.name}</span>
                      </div>
                      <div className="font-mono text-slate-900 font-bold text-sm">
                        {item.value}% of Scene
                      </div>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={50}
              outerRadius={75}
              paddingAngle={3}
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} stroke="#ffffff" strokeWidth={2} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>

        {/* Center label */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-xl font-bold font-mono text-slate-900">
            {distribution.clear}%
          </span>
          <span className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">
            Clear Area
          </span>
        </div>
      </div>

      {/* Grid percentage legend */}
      <div className="grid grid-cols-2 gap-2 mt-2 pt-2 border-t border-slate-200">
        {data.map((item) => (
          <div key={item.key} className="flex items-center justify-between text-xs bg-slate-50 px-2.5 py-1.5 rounded-lg border border-slate-200">
            <div className="flex items-center gap-1.5 truncate">
              <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
              <span className="text-slate-600 truncate text-[11px] font-medium">{item.name}</span>
            </div>
            <span className="font-mono font-bold text-slate-900 ml-1 text-xs">
              {item.value}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
