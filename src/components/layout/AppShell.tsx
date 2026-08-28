import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  FlaskConical,
  ListFilter,
  Network,
  MapPin,
  SlidersHorizontal,
  FileText,
  Activity,
  ChevronLeft,
  ChevronRight,
  Shield,
  Clock,
  Radio,
  Wifi,
  Database
} from 'lucide-react';

import { TrinetraLogo } from '../ui/TrinetraLogo';

export type NavPage =
  | 'command'
  | 'simulation'
  | 'incidents'
  | 'network'
  | 'cashout-map'
  | 'policy'
  | 'dossier'
  | 'health'
  | 'splash';

interface AppShellProps {
  activePage: NavPage;
  onNavigate: (page: NavPage) => void;
  backendOnline: boolean;
  activeDataset: 'SYNTHETIC_A' | 'IBM_B' | 'ELLIPTIC_C';
  onToggleDataset: (dataset: 'SYNTHETIC_A' | 'IBM_B' | 'ELLIPTIC_C') => void;
  children: React.ReactNode;
}

const NAV_ITEMS: { id: NavPage; label: string; code: string; icon: any; is3D?: boolean }[] = [
  { id: 'command', label: 'Command Center', code: 'CMD-01', icon: LayoutDashboard },
  { id: 'simulation', label: '3D Simulation Lab', code: 'SIM-3D', icon: FlaskConical, is3D: true },
  { id: 'incidents', label: 'Incident Queue', code: 'INC-QUEUE', icon: ListFilter },
  { id: 'network', label: '3D Network Explorer', code: 'NET-EXP', icon: Network },
  { id: 'cashout-map', label: 'Cash-Out Map', code: 'GEO-MAP', icon: MapPin },
  { id: 'policy', label: 'Threshold Policy', code: 'POL-TUNE', icon: SlidersHorizontal },
  { id: 'dossier', label: 'Case Dossiers', code: 'CASE-DOS', icon: FileText },
  { id: 'health', label: 'System Telemetry', code: 'SYS-MON', icon: Activity },
];

export const AppShell: React.FC<AppShellProps> = ({
  activePage,
  onNavigate,
  backendOnline,
  activeDataset,
  onToggleDataset,
  children,
}) => {
  const [collapsed, setCollapsed] = useState(false);
  const [time, setTime] = useState<{ ist: string; utc: string }>({ ist: '', utc: '' });

  // Real military dual clocks
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const istStr = now.toLocaleTimeString('en-GB', { timeZone: 'Asia/Kolkata' });
      const utcStr = now.toLocaleTimeString('en-GB', { timeZone: 'UTC' });
      setTime({ ist: istStr, utc: utcStr });
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col h-screen w-screen bg-[#F8FAFC] text-slate-900 font-sans antialiased overflow-hidden select-none">
      
      {/* ── 1. TOP COMMAND BAR (WHITE THEME) ── */}
      <header className="h-12 bg-white border-b border-slate-200 px-4 flex items-center justify-between font-mono text-xs z-50 flex-shrink-0 shadow-sm">
        {/* Left: Brand Identity (Click to Splash) */}
        <div 
          onClick={() => onNavigate('splash')} 
          className="flex items-center gap-2.5 cursor-pointer group"
          title="Return to Splash Overview (Team Trinetra)"
        >
          <TrinetraLogo size="sm" showLangBadge={false} intervalMs={2800} theme="light" />
          <span className="text-[10px] text-slate-500 font-mono hidden sm:inline-block border-l border-slate-200 pl-2.5">
            AML DEFCON-2
          </span>
        </div>

        {/* Center: Live Status Badges */}
        <div className="hidden md:flex items-center gap-4 text-[11px]">
          <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded bg-orange-50 border border-orange-200 text-orange-700 font-bold">
            <span className="w-1.5 h-1.5 rounded-full bg-[#FF5500] animate-pulse" />
            <span>THREAT LEVEL: DEFCON-2</span>
          </div>

          <div className="flex items-center gap-1.5 text-slate-500">
            <span>DATASET:</span>
            <span className="text-slate-900 font-bold">{activeDataset}</span>
          </div>

          <div className="flex items-center gap-1.5 text-slate-500">
            <span>FASTAPI:</span>
            <span className={`font-bold ${backendOnline ? 'text-emerald-600' : 'text-slate-400'}`}>
              {backendOnline ? '200 OK' : 'MOCK FALLBACK'}
            </span>
          </div>
        </div>

        {/* Right: Military Time */}
        <div className="flex items-center gap-3 text-[11px] text-slate-500 font-mono">
          <div className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-slate-900 font-bold">{time.ist || '00:00:00'}</span>
            <span className="text-slate-400 text-[9px]">IST</span>
          </div>
          <span className="text-slate-300">|</span>
          <div className="text-slate-400">
            <span>{time.utc || '00:00:00'}</span>
            <span className="text-[9px] ml-0.5">UTC</span>
          </div>
        </div>
      </header>

      {/* ── 2. MAIN WORKSPACE (SIDEBAR + CONTENT) ── */}
      <div className="flex flex-1 min-h-0 overflow-hidden">
        
        {/* Left Navigation Rail */}
        <aside className={`${collapsed ? 'w-16' : 'w-56'} bg-white border-r border-slate-200 flex flex-col justify-between p-2.5 transition-all duration-300 z-40 flex-shrink-0 font-mono shadow-sm`}>
          <div className="space-y-1">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive = activePage === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => onNavigate(item.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded text-xs transition-all ${
                    isActive
                      ? 'bg-gradient-to-r from-[#FF7A1A] to-[#EA580C] text-white font-bold shadow-md shadow-orange-500/20'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                  title={collapsed ? item.label : undefined}
                >
                  <Icon className={`w-4 h-4 flex-shrink-0 ${isActive ? 'text-white' : 'text-slate-500'}`} />
                  {!collapsed && (
                    <div className="flex-1 text-left flex items-center justify-between truncate">
                      <span className="truncate">{item.label}</span>
                      {item.is3D && (
                        <span className={`text-[8px] px-1 py-0.2 rounded font-bold ${isActive ? 'bg-white/20 text-white' : 'bg-orange-50 text-orange-600 border border-orange-200'}`}>
                          3D
                        </span>
                      )}
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          {/* Dataset Switcher & Collapse Toggle */}
          <div className="space-y-2 pt-2 border-t border-slate-200 text-[10px]">
            {!collapsed && (
              <div className="space-y-1">
                <span className="text-slate-400 font-bold uppercase tracking-wider block text-[9px]">
                  EVALUATION DATASET:
                </span>
                {(['SYNTHETIC_A', 'IBM_B', 'ELLIPTIC_C'] as const).map((ds) => (
                  <button
                    key={ds}
                    onClick={() => onToggleDataset(ds)}
                    className={`w-full text-left px-2 py-1 rounded font-bold truncate transition-colors ${
                      activeDataset === ds
                        ? 'bg-slate-100 text-slate-900 border border-slate-300'
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    {ds === 'SYNTHETIC_A' ? '[A] SYNTHETIC MULE' : ds === 'IBM_B' ? '[B] IBM MULTI-BANK' : '[C] ELLIPTIC BITCOIN'}
                  </button>
                ))}
              </div>
            )}

            <button
              onClick={() => setCollapsed(!collapsed)}
              className="w-full flex items-center justify-center gap-1.5 py-1.5 text-slate-500 hover:text-slate-900 border border-slate-200 hover:border-slate-300 rounded transition-colors text-[10px]"
            >
              {collapsed ? <ChevronRight className="w-3.5 h-3.5" /> : (
                <>
                  <ChevronLeft className="w-3.5 h-3.5" />
                  <span>COLLAPSE RAIL</span>
                </>
              )}
            </button>
          </div>
        </aside>

        {/* Central Viewport Content */}
        <main className="flex-1 bg-[#F8FAFC] p-3 overflow-y-auto min-w-0">
          {children}
        </main>
      </div>

      {/* ── 3. BOTTOM CONTINUOUS TELEMETRY STRIP ── */}
      <footer className="h-7 bg-white border-t border-slate-200 px-4 flex items-center justify-between font-mono text-[10px] text-slate-500 z-50 flex-shrink-0">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            <span>STREAM: <strong className="text-slate-800 font-sans">1,448.90 TX/SEC</strong></span>
          </div>
          <span className="text-slate-300">|</span>
          <div>ACTIVE CHAINS: <strong className="text-[#FF5500] font-sans">48 RINGS</strong></div>
          <span className="text-slate-300">|</span>
          <div>CASH-OUT EXPOSURE: <strong className="text-amber-600 font-sans">₹4.82 CR</strong></div>
        </div>

        <div className="hidden sm:flex items-center gap-4">
          <div>GRAPH SCALE: <strong className="text-slate-700">750 NODES / 5,000 EDGES</strong></div>
          <span className="text-slate-300">|</span>
          <div>POLICY: <strong className="text-slate-700">τ = 0.50</strong></div>
          <span className="text-slate-300">|</span>
          <div className="text-emerald-600 font-bold">P50: 71.67ms (SLA OK)</div>
        </div>
      </footer>

    </div>
  );
};
