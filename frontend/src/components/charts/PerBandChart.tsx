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
        <span className="text-xs text-slate-600 font-medium">
          Multispectral Signal Quality across Sensor Channels
        </span>
        <div className="flex items-center gap-1 bg-slate-100 border border-slate-200 rounded-md p-0.5 text-xs">
          <button
            onClick={() => setMetric('both')}
            className={`px-2 py-0.5 rounded transition-colors ${
              metric === 'both' ? 'bg-white text-slate-900 font-medium shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setMetric('snr')}
            className={`px-2 py-0.5 rounded transition-colors ${
              metric === 'snr' ? 'bg-white text-emerald-700 font-medium shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            SNR (dB)
          </button>
          <button
            onClick={() => setMetric('degradation')}
            className={`px-2 py-0.5 rounded transition-colors ${
              metric === 'degradation' ? 'bg-white text-amber-800 font-medium shadow-xs' : 'text-slate-600 hover:text-slate-900'
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
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
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
                    <div className="bg-white border border-slate-200 p-3 rounded-lg shadow-md text-xs space-y-1">
                      <div className="font-semibold text-slate-900 border-b border-slate-100 pb-1">
                        Channel: {label}
                      </div>
                      {payload.map((p, i) => (
                        <div key={i} className="flex items-center justify-between gap-4 font-mono">
                          <span style={{ color: p.color }}>{p.name}:</span>
                          <span className="font-bold text-slate-900">
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
                name="Signal-to-Noise (SNR dB)"
                fill="#059669"
                radius={[4, 4, 0, 0]}
              />
            )}
            {(metric === 'both' || metric === 'degradation') && (
              <Bar
                dataKey="degradation"
                name="Degradation %"
                fill="#d97706"
                radius={[4, 4, 0, 0]}
              />
            )}
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
