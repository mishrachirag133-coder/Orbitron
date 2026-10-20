import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  UploadCloud, 
  FolderArchive, 
  Layers, 
  Info,
  CheckCircle2
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
      label: 'Dashboard',
      icon: LayoutDashboard,
      badge: null,
    },
    {
      to: '/new',
      label: 'Upload Image',
      icon: UploadCloud,
      badge: 'New',
      badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    },
    {
      to: '/jobs',
      label: 'Imagery Library',
      icon: FolderArchive,
      badge: activeCount > 0 ? `${activeCount} running` : `${totalCount}`,
      badgeColor: activeCount > 0 ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-slate-100 text-slate-600 border-slate-200',
    },
  ];

  return (
    <aside className="w-60 border-r border-slate-200 bg-white p-4 hidden md:flex flex-col justify-between shrink-0">
      <div className="space-y-6">
        {/* Navigation list */}
        <div className="space-y-1">
          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider px-3 mb-2">
            Main Menu
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
                <span className={`text-[10px] px-2 py-0.5 rounded-full border font-medium ${item.badgeColor}`}>
                  {item.badge}
                </span>
              )}
            </NavLink>
          ))}
        </div>

        {/* Friendly User Guide / Explanation Card */}
        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2.5">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-800">
            <Info className="w-3.5 h-3.5 text-slate-500" />
            <span>How it Works</span>
          </div>

          <div className="space-y-2 text-[11px] text-slate-600">
            <div className="flex items-start gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 mt-1 shrink-0" />
              <div>
                <span className="font-medium text-slate-800">Clear Ground:</span>
                <p className="text-slate-500 text-[10px] leading-tight">High quality surface pixels ready for GIS and NDVI analysis.</p>
              </div>
            </div>

            <div className="flex items-start gap-2">
              <span className="w-2 h-2 rounded-full bg-sky-500 mt-1 shrink-0" />
              <div>
                <span className="font-medium text-slate-800">Cloud & Cirrus:</span>
                <p className="text-slate-500 text-[10px] leading-tight">Accurately detected and masked to avoid distorted measurements.</p>
              </div>
            </div>

            <div className="flex items-start gap-2">
              <span className="w-2 h-2 rounded-full bg-purple-500 mt-1 shrink-0" />
              <div>
                <span className="font-medium text-slate-800">Cloud Shadows:</span>
                <p className="text-slate-500 text-[10px] leading-tight">Segmented using solar geometry and cloud height models.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer information */}
      <div className="pt-4 border-t border-slate-200 text-[11px] text-slate-500 space-y-1">
        <div className="flex items-center justify-between">
          <span className="font-medium text-slate-700">ClarityX v1.0</span>
          <span className="inline-flex items-center gap-1 text-emerald-600 font-medium">
            <CheckCircle2 className="w-3 h-3" /> System Ready
          </span>
        </div>
        <p className="text-[10px] text-slate-400">
          Clean satellite quality intelligence
        </p>
      </div>
    </aside>
  );
};
