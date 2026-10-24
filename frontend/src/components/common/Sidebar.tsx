import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Search, 
  FolderArchive, 
  CheckCircle2, 
  Target,
  Info
} from 'lucide-react';
import { useJobs } from '../../hooks/useJobs';

export const Sidebar: React.FC = () => {
  const { data: jobs } = useJobs();

  const activeCount = jobs?.filter(
    (j) => j.status === 'pending' || j.status === 'running'
  ).length || 0;

  const totalCount = jobs?.length || 0;

  const navItems = [
    {
      to: '/',
      label: 'Dashboard Overview',
      icon: LayoutDashboard,
      badge: null,
    },
    {
      to: '/new',
      label: 'Select AOI & Search',
      icon: Search,
      badge: 'STAC',
      badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    },
    {
      to: '/jobs',
      label: 'Scene Registry',
      icon: FolderArchive,
      badge: activeCount > 0 ? `${activeCount} in flight` : `${totalCount}`,
      badgeColor: activeCount > 0 ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-slate-100 text-slate-600 border-slate-200',
    },
  ];

  return (
    <aside className="w-60 border-r border-slate-200 bg-white p-4 hidden md:flex flex-col justify-between shrink-0 shadow-xs">
      <div className="space-y-6">
        {/* Navigation list */}
        <div className="space-y-1">
          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider px-3 mb-2">
            Intelligence Console
          </div>
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) =>
                `flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                  isActive
                    ? 'bg-slate-100 text-slate-900 font-semibold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`
              }
            >
              <div className="flex items-center gap-2.5">
                <item.icon className="w-4 h-4 text-slate-500" />
                <span>{item.label}</span>
              </div>
              {item.badge && (
                <span className={`text-[10px] px-2 py-0.5 rounded-full border font-mono ${item.badgeColor}`}>
                  {item.badge}
                </span>
              )}
            </NavLink>
          ))}
        </div>

        {/* Cloud Breaker Mission Architecture Panel */}
        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
              <Target className="w-3.5 h-3.5 text-emerald-600" />
              <span>Core Architecture</span>
            </span>
            <span className="text-[9px] font-mono font-medium px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800 border border-emerald-200">
              S2-L2A
            </span>
          </div>

          <div className="space-y-2 text-[11px] text-slate-600 leading-relaxed">
            <div className="flex items-start gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-600 mt-1 shrink-0" />
              <div>
                <strong className="text-slate-800">AOI Window Reads:</strong>
                <p className="text-[10px] text-slate-500">Streams COG rasters via HTTP range requests without downloading 100km tiles.</p>
              </div>
            </div>

            <div className="flex items-start gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-500 mt-1 shrink-0" />
              <div>
                <strong className="text-slate-800">SCL Trust Fusion:</strong>
                <p className="text-[10px] text-slate-500">Generates per-pixel trust scores (0-1) penalizing cirrus and shadows.</p>
              </div>
            </div>

            <div className="flex items-start gap-2">
              <span className="w-2 h-2 rounded-full bg-sky-600 mt-1 shrink-0" />
              <div>
                <strong className="text-slate-800">Explainable Ranks:</strong>
                <p className="text-[10px] text-slate-500">Decomposes scores by use-case (crop, flood, general).</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer information & disclaimer */}
      <div className="pt-4 border-t border-slate-200 text-[11px] text-slate-500 space-y-1">
        <div className="flex items-center justify-between">
          <span className="font-semibold text-slate-700">Cloud Breaker v1.0</span>
          <span className="inline-flex items-center gap-1 text-emerald-600 font-mono text-[10px] font-medium">
            <CheckCircle2 className="w-3 h-3" /> STAC Ready
          </span>
        </div>
        <p className="text-[10px] text-slate-400 leading-tight">
          Decision support only, not an official warning system.
        </p>
      </div>
    </aside>
  );
};
