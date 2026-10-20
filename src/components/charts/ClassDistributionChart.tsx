import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { ClassDistribution } from '../../types/job';

interface ClassDistributionChartProps {
  distribution: ClassDistribution;
}

const COLORS = {
  clear: '#10b981', // emerald
  thick_cloud: '#38bdf8', // sky blue
  thin_cirrus: '#f59e0b', // amber
  shadow: '#a855f7', // purple
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
                    <div className="bg-slate-900 border border-slate-700 p-2.5 rounded-lg shadow-xl text-xs">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                        <span className="font-semibold text-white">{item.name}</span>
                      </div>
                      <div className="font-mono text-emerald-400 font-bold text-sm">
                        {item.value}% of Scene Area
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
                <Cell key={`cell-${index}`} fill={entry.color} stroke="#090d16" strokeWidth={2} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>

        {/* Center label */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-xl font-bold font-mono text-white">
            {distribution.clear}%
          </span>
          <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
            Clear Area
          </span>
        </div>
      </div>

      {/* Grid percentage legend */}
      <div className="grid grid-cols-2 gap-2 mt-2 pt-2 border-t border-slate-800/80">
        {data.map((item) => (
          <div key={item.key} className="flex items-center justify-between text-xs bg-slate-900/40 px-2 py-1.5 rounded border border-slate-800">
            <div className="flex items-center gap-1.5 truncate">
              <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
              <span className="text-slate-400 truncate">{item.name}</span>
            </div>
            <span className="font-mono font-semibold text-slate-200 ml-1">
              {item.value}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
