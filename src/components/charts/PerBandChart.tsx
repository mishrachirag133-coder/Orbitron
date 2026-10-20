import React, { useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';
import { PerBandQuality } from '../../types/job';

interface PerBandChartProps {
  data: PerBandQuality[];
}

export const PerBandChart: React.FC<PerBandChartProps> = ({ data }) => {
  const [metric, setMetric] = useState<'both' | 'snr' | 'degradation'>('both');

  return (
    <div className="flex flex-col h-full">
      {/* Metric filter buttons */}
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs text-slate-400 font-medium">
          Multispectral Signal Quality across Sensor Channels
        </span>
        <div className="flex items-center gap-1 bg-slate-900 border border-slate-800 rounded-md p-0.5 text-xs">
          <button
            onClick={() => setMetric('both')}
            className={`px-2 py-0.5 rounded transition-colors ${
              metric === 'both' ? 'bg-slate-700 text-white font-medium' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Combined
          </button>
          <button
            onClick={() => setMetric('snr')}
            className={`px-2 py-0.5 rounded transition-colors ${
              metric === 'snr' ? 'bg-emerald-500/20 text-emerald-300 font-medium' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            SNR (dB)
          </button>
          <button
            onClick={() => setMetric('degradation')}
            className={`px-2 py-0.5 rounded transition-colors ${
              metric === 'degradation' ? 'bg-amber-500/20 text-amber-300 font-medium' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Degradation %
          </button>
        </div>
      </div>

      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            margin={{ top: 10, right: 10, left: -20, bottom: 20 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
            <XAxis
              dataKey="band"
              stroke="#64748b"
              fontSize={11}
              tickLine={false}
              angle={-25}
              textAnchor="end"
              height={45}
            />
            <YAxis
              stroke="#64748b"
              fontSize={11}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip
              content={({ active, payload, label }) => {
                if (active && payload && payload.length) {
                  return (
                    <div className="bg-slate-900 border border-slate-700 p-3 rounded-lg shadow-2xl text-xs space-y-1">
                      <div className="font-semibold text-slate-200 border-b border-slate-800 pb-1">
                        Channel: {label}
                      </div>
                      {payload.map((p, i) => (
                        <div key={i} className="flex items-center justify-between gap-4 font-mono">
                          <span style={{ color: p.color }}>{p.name}:</span>
                          <span className="font-bold text-white">
                            {p.value} {p.name?.toString().includes('SNR') ? 'dB' : '%'}
                          </span>
                        </div>
                      ))}
                    </div>
                  );
                }
                return null;
              }}
            />
            <Legend
              wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }}
              iconType="circle"
            />
            {(metric === 'both' || metric === 'snr') && (
              <Bar
                dataKey="snr"
                name="SNR (Signal-to-Noise dB)"
                fill="#10b981"
                radius={[4, 4, 0, 0]}
              />
            )}
            {(metric === 'both' || metric === 'degradation') && (
              <Bar
                dataKey="degradation"
                name="Atmospheric Degradation %"
                fill="#f59e0b"
                radius={[4, 4, 0, 0]}
              />
            )}
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
