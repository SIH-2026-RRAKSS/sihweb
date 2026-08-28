import React from 'react';
import {
  LayoutDashboard,
  ShieldAlert,
  Share2,
  MapPin,
  Zap,
  Sliders,
  BarChart3,
  FlaskConical,
  Cpu,
  CheckCircle2
} from 'lucide-react';

export type NavTab = 
  | 'dashboard'
  | 'incidents'
  | 'graph'
  | 'map'
  | 'streaming'
  | 'policy'
  | 'benchmark'
  | 'sandbox';

interface SidebarProps {
  currentTab: NavTab;
  onTabChange: (tab: NavTab) => void;
  highRiskCount: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onTabChange,
  highRiskCount
}) => {
  const navItems: { id: NavTab; label: string; icon: React.FC<{ className?: string }>; badge?: number | string }[] = [
    { id: 'dashboard', label: 'Command Center', icon: LayoutDashboard },
    { id: 'incidents', label: 'Incident Queue', icon: ShieldAlert, badge: highRiskCount > 0 ? `${highRiskCount} Alerts` : undefined },
    { id: 'graph', label: 'Network Visualizer', icon: Share2 },
    { id: 'map', label: 'Geospatial Cash-Out', icon: MapPin },
    { id: 'streaming', label: 'Streaming & SLA', icon: Zap },
    { id: 'policy', label: 'Threshold Policy', icon: Sliders },
    { id: 'benchmark', label: '3-Way Benchmark', icon: BarChart3 },
    { id: 'sandbox', label: 'Live GNN Sandbox', icon: FlaskConical },
  ];

  return (
    <aside className="w-64 bg-cyber-900/90 border-r border-cyber-700/60 flex flex-col justify-between flex-shrink-0 h-[calc(100vh-4rem)] p-3">
      {/* Navigation List */}
      <div className="space-y-1.5">
        <div className="px-3 py-2 text-[10px] font-mono font-bold tracking-wider text-slate-500 uppercase">
          Tactical Operations
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium transition-all ${
                isActive
                  ? 'bg-cyber-cyan/15 text-cyber-cyan font-bold border border-cyber-cyan/30 glow-cyan'
                  : 'text-slate-300 hover:text-slate-100 hover:bg-cyber-800/80 border border-transparent'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-4 h-4 ${isActive ? 'text-cyber-cyan' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </div>
              {item.badge && (
                <span className="px-2 py-0.5 text-[10px] font-mono font-bold bg-cyber-red/20 text-cyber-red border border-cyber-red/40 rounded-full animate-pulse">
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Model & Architecture Status Widget */}
      <div className="p-3 bg-cyber-950/90 border border-cyber-700/80 rounded-xl space-y-2.5">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-mono text-slate-400 flex items-center gap-1.5">
            <Cpu className="w-3.5 h-3.5 text-cyber-cyan" />
            GraphSAGE GNN
          </span>
          <span className="flex items-center gap-1 text-[10px] font-mono text-emerald-400">
            <CheckCircle2 className="w-3 h-3" />
            Stage 8 Validated
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2 text-center pt-1 border-t border-cyber-800">
          <div className="p-1.5 bg-cyber-900 rounded border border-cyber-800">
            <div className="text-[9px] text-slate-500 uppercase">Test F1-Score</div>
            <div className="text-xs font-mono font-bold text-cyber-cyan">90.66%</div>
          </div>
          <div className="p-1.5 bg-cyber-900 rounded border border-cyber-800">
            <div className="text-[9px] text-slate-500 uppercase">Terminal MRR</div>
            <div className="text-xs font-mono font-bold text-amber-400">1.0000</div>
          </div>
        </div>

        <div className="text-[10px] text-slate-400 font-mono text-center pt-1 leading-tight">
          Sliding 72h Horizon • ≤3 Hops
        </div>
      </div>
    </aside>
  );
};
