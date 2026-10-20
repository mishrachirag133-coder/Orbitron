import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  UploadCloud, 
  History, 
  Satellite, 
  Layers, 
  Sparkles, 
  ShieldAlert,
  Server,
  FileCheck
} from 'lucide-react';
import { useJobs } from '../../hooks/useJobs';

export const Sidebar: React.FC = () => {
  const { data: jobs } = useJobs();

  const activeCount = jobs?.filter(
    (j) => j.status === 'pending' || j.status === 'running'
  ).length || 0;

  const navItems = [
    {
      to: '/',
      label: 'Overview & Stats',
      icon: LayoutDashboard,
      badge: null,
    },
    {
      to: '/new',
      label: 'New Analysis',
      icon: UploadCloud,
      badge: 'Upload',
      badgeColor: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
    },
    {
      to: '/jobs',
      label: 'Jobs Registry',
      icon: History,
      badge: activeCount > 0 ? `${activeCount} Active` : null,
      badgeColor: 'bg-sky-500/10 text-sky-400 border-sky-500/30 animate-pulse',
    },
  ];

  return (
    <aside className="w-64 border-r border-slate-800 bg-slate-950/60 p-4 hidden md:flex flex-col justify-between shrink-0">
      <div className="space-y-6">
        {/* Navigation list */}
        <div className="space-y-1">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-3 mb-2">
            Intelligence Console
          </div>
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) =>
                `flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-sm font-semibold'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                }`
              }
            >
              <div className="flex items-center gap-2.5">
                <item.icon className="w-4 h-4" />
                <span>{item.label}</span>
              </div>
              {item.badge && (
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full border font-mono ${item.badgeColor}`}>
                  {item.badge}
                </span>
              )}
            </NavLink>
          ))}
        </div>

        {/* Engine Capabilities Panel */}
        <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800/80 space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-300 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              Engine Architecture
            </span>
            <span className="text-[9px] font-mono uppercase px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              Active
            </span>
          </div>

          <div className="space-y-1.5 text-[11px]">
            <div className="p-2 rounded bg-slate-950/60 border border-slate-800/60 flex items-start gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-400 mt-1 shrink-0" />
              <div>
                <div className="font-semibold text-slate-200">Deep Foundation</div>
                <div className="text-[10px] text-slate-400 leading-tight">
                  Transformer U-Net with Cirrus & Shadow cast geometry
                </div>
              </div>
            </div>

            <div className="p-2 rounded bg-slate-950/60 border border-slate-800/60 flex items-start gap-2">
              <div className="w-2 h-2 rounded-full bg-sky-400 mt-1 shrink-0" />
              <div>
                <div className="font-semibold text-slate-200">Fast Spectral</div>
                <div className="text-[10px] text-slate-400 leading-tight">
                  Sub-second ONNX band indexing & thresholding
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Constellations Supported */}
        <div className="px-3 space-y-2">
          <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
            Supported Constellations
          </div>
          <div className="flex flex-wrap gap-1.5">
            {['Sentinel-2', 'Landsat 8/9', 'PlanetScope', 'WorldView-3'].map((sat) => (
              <span
                key={sat}
                className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-900 text-slate-400 border border-slate-800"
              >
                {sat}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Footer telemetry */}
      <div className="pt-4 border-t border-slate-900 text-[11px] text-slate-400 space-y-1">
        <div className="flex items-center justify-between">
          <span>ClarityScore™ Protocol</span>
          <span className="font-mono text-emerald-400">v2.4-ISO</span>
        </div>
        <div className="text-[10px] text-slate-400">
          Earth Observation Cloud Quality Intelligence
        </div>
      </div>
    </aside>
  );
};
