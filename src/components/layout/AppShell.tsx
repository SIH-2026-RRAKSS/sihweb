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
  Database,
  Zap,
  Lock,
  UserCheck,
  Building2,
  ShieldAlert,
  ShieldCheck,
  LogOut,
  ChevronDown,
  UploadCloud,
  FileSpreadsheet,
  AlertOctagon,
  PlusCircle,
  FolderClock,
  Settings,
  Cpu
} from 'lucide-react';

import { TrinetraLogo } from '../ui/TrinetraLogo';
import { useAuth, PERSONA_PRESETS } from '../../context/AuthContext';
import { UserRole } from '../../types';
import { ApiService } from '../../services/api';

export type NavPage =
  | 'command'
  | 'simulation'
  | 'incidents'
  | 'network'
  | 'cashout-map'
  | 'policy'
  | 'dossier'
  | 'health'
  | 'splash'
  | 'live-demo'
  | 'freeze-leo'
  | 'bank-freeze'
  | 'bank-uploads'
  | 'citizen-portal'
  | 'new-complaint'
  | 'my-complaints'
  | 'admin-console'
  | 'mlops-dashboard'
  | 'login';

interface AppShellProps {
  activePage: NavPage;
  onNavigate: (page: NavPage) => void;
  backendOnline: boolean;
  activeDataset: 'SYNTHETIC_A' | 'IBM_B' | 'ELLIPTIC_C';
  onToggleDataset: (dataset: 'SYNTHETIC_A' | 'IBM_B' | 'ELLIPTIC_C') => void;
  children: React.ReactNode;
}

interface NavItemDef {
  id: NavPage;
  label: string;
  code: string;
  icon: any;
  is3D?: boolean;
  allowedRoles: UserRole[];
}

const ALL_NAV_ITEMS: NavItemDef[] = [
  // ── LEO & CYBER COMMAND ──
  { id: 'command', label: 'Command Center', code: 'CMD-01', icon: LayoutDashboard, allowedRoles: ['CYBER_OFFICER', 'ADMIN'] },
  { id: 'incidents', label: 'Incident Queue', code: 'INC-QUEUE', icon: ListFilter, allowedRoles: ['CYBER_OFFICER', 'POLICE', 'ADMIN'] },
  { id: 'freeze-leo', label: 'Emergency Freezes', code: 'LEA-FRZ', icon: AlertOctagon, allowedRoles: ['CYBER_OFFICER', 'POLICE', 'ADMIN'] },
  { id: 'network', label: '3D Network Explorer', code: 'NET-EXP', icon: Network, is3D: true, allowedRoles: ['CYBER_OFFICER', 'POLICE', 'ADMIN'] },
  { id: 'cashout-map', label: 'Cash-Out Map', code: 'GEO-MAP', icon: MapPin, allowedRoles: ['CYBER_OFFICER', 'POLICE', 'ADMIN'] },
  { id: 'dossier', label: 'Case Dossiers', code: 'CASE-DOS', icon: FileText, allowedRoles: ['CYBER_OFFICER', 'POLICE', 'ADMIN'] },
  { id: 'simulation', label: '3D Simulation Lab', code: 'SIM-3D', icon: FlaskConical, is3D: true, allowedRoles: ['CYBER_OFFICER', 'ADMIN'] },
  { id: 'policy', label: 'Threshold Policy', code: 'POL-TUNE', icon: SlidersHorizontal, allowedRoles: ['CYBER_OFFICER', 'ADMIN'] },

  // ── BANK COMPLIANCE & NODAL ──
  { id: 'bank-freeze', label: 'Freeze Action Inbox', code: 'BNK-INBOX', icon: AlertOctagon, allowedRoles: ['BANK_MANAGER', 'BANK_EMPLOYEE', 'ADMIN'] },
  { id: 'bank-uploads', label: 'Bank CSV Uploads', code: 'BNK-UPL', icon: UploadCloud, allowedRoles: ['BANK_MANAGER', 'BANK_EMPLOYEE', 'ADMIN'] },

  // ── CITIZEN COMPLAINT PORTAL ──
  { id: 'citizen-portal', label: 'Citizen Home', code: 'CIT-HOME', icon: UserCheck, allowedRoles: ['COMPLAINANT'] },
  { id: 'new-complaint', label: 'File Fraud Complaint', code: 'CIT-NEW', icon: PlusCircle, allowedRoles: ['COMPLAINANT'] },
  { id: 'my-complaints', label: 'My Complaints', code: 'CIT-LIST', icon: FolderClock, allowedRoles: ['COMPLAINANT'] },

  // ── SYSTEM ADMIN & MLOPS ──
  { id: 'admin-console', label: 'Admin Console', code: 'ADM-MAIN', icon: Settings, allowedRoles: ['ADMIN'] },
  { id: 'mlops-dashboard', label: 'MLOps & Models', code: 'MLOPS-REG', icon: Cpu, allowedRoles: ['ADMIN', 'CYBER_OFFICER'] },

  // ── SYSTEM TELEMETRY ──
  { id: 'health', label: 'System Telemetry', code: 'SYS-MON', icon: Activity, allowedRoles: ['CYBER_OFFICER', 'POLICE', 'BANK_MANAGER', 'BANK_EMPLOYEE', 'ADMIN'] },
  { id: 'live-demo', label: 'Live Backend Demo', code: 'API-DEMO', icon: Zap, allowedRoles: ['CYBER_OFFICER', 'ADMIN'] },
];

export const AppShell: React.FC<AppShellProps> = ({
  activePage,
  onNavigate,
  backendOnline,
  activeDataset,
  onToggleDataset,
  children,
}) => {
  const { user, role, switchPersona, logout } = useAuth();
  const [collapsed, setCollapsed] = useState(false);
  const [showPersonaMenu, setShowPersonaMenu] = useState(false);
  const [time, setTime] = useState<{ ist: string; utc: string }>({ ist: '', utc: '' });
  const [stats, setStats] = useState<any>(null);
  const [bench, setBench] = useState<any>(null);

  useEffect(() => {
    Promise.all([
      ApiService.getPipelineStats().catch(() => null),
      ApiService.getStreamingBenchmark().catch(() => null)
    ]).then(([s, b]) => {
      if (s) setStats(s);
      if (b) setBench(b);
    });
  }, [activeDataset]);

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

  const visibleNavItems = ALL_NAV_ITEMS.filter(
    (item) => !role || item.allowedRoles.includes(role)
  );

  const getRoleBadge = (r: UserRole | null) => {
    switch (r) {
      case 'CYBER_OFFICER':
        return { label: 'CYBER OFFICER', bg: 'bg-orange-50 border-orange-200 text-orange-700' };
      case 'POLICE':
        return { label: 'POLICE SHO', bg: 'bg-blue-50 border-blue-200 text-blue-700' };
      case 'BANK_MANAGER':
        return { label: 'BANK NODAL MGR', bg: 'bg-emerald-50 border-emerald-200 text-emerald-700' };
      case 'BANK_EMPLOYEE':
        return { label: 'BANK OFFICER', bg: 'bg-emerald-50 border-emerald-200 text-emerald-700' };
      case 'COMPLAINANT':
        return { label: 'CITIZEN', bg: 'bg-purple-50 border-purple-200 text-purple-700' };
      case 'ADMIN':
        return { label: 'ADMINISTRATOR', bg: 'bg-amber-50 border-amber-200 text-amber-700' };
      default:
        return { label: 'GUEST', bg: 'bg-slate-100 border-slate-200 text-slate-700' };
    }
  };

  const roleBadge = getRoleBadge(role);

  return (
    <div className="flex flex-col h-screen w-screen bg-[#F8FAFC] text-slate-900 font-sans antialiased overflow-hidden select-none">
      
      {/* ── 1. TOP COMMAND BAR ── */}
      <header className="h-12 bg-white border-b border-slate-200 px-4 flex items-center justify-between font-sans text-xs z-50 flex-shrink-0 shadow-sm">
        {/* Left: Brand Identity (Click to Splash) */}
        <div 
          onClick={() => onNavigate('splash')} 
          className="flex items-center gap-2.5 cursor-pointer group"
          title="Return to Splash Overview (Team Trinetra)"
        >
          <TrinetraLogo size="sm" showLangBadge={false} intervalMs={2800} theme="light" />
          <span className="text-[10px] text-slate-500 font-sans hidden sm:inline-block border-l border-slate-200 pl-2.5">
            AML DEFCON-2
          </span>
        </div>

        {/* Center: Live Status & Role Badges */}
        <div className="hidden md:flex items-center gap-3 text-[11px]">
          <div className={`flex items-center gap-1.5 px-2.5 py-0.5 rounded border font-bold ${roleBadge.bg}`}>
            <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
            <span>{roleBadge.label}</span>
          </div>

          {(role === 'CYBER_OFFICER' || role === 'ADMIN' || role === 'POLICE') && (
            <div className="flex items-center gap-1.5 text-slate-500">
              <span>DATASET:</span>
              <span className="text-slate-900 font-bold">{activeDataset}</span>
            </div>
          )}

          <div className="flex items-center gap-1.5 text-slate-500">
            <span>FASTAPI:</span>
            <span className={`font-bold ${backendOnline ? 'text-emerald-600' : 'text-slate-500'}`}>
              {backendOnline ? '200 OK' : 'LOCAL MOCK'}
            </span>
          </div>
        </div>

        {/* Right: Military Time & User Profile Chip */}
        <div className="flex items-center gap-3 text-[11px] text-slate-500 font-sans">
          <div className="hidden sm:flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-slate-500" />
            <span className="text-slate-900 font-bold">{time.ist || '00:00:00'}</span>
            <span className="text-slate-500 text-[9px]">IST</span>
          </div>

          <div className="relative">
            <button
              onClick={() => setShowPersonaMenu(!showPersonaMenu)}
              className="flex items-center gap-2 px-2.5 py-1 rounded-lg border border-slate-200 hover:border-slate-300 bg-slate-50 hover:bg-slate-100 transition-all text-slate-800 font-medium"
            >
              <div className="w-5 h-5 rounded-full bg-[#FF5500] text-white flex items-center justify-center font-bold text-[10px]">
                {user?.name ? user.name[0] : 'U'}
              </div>
              <span className="max-w-[110px] truncate font-bold">{user?.name || 'Guest User'}</span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>

            {/* Persona Quick Switcher Dropdown */}
            {showPersonaMenu && (
              <div className="absolute right-0 mt-1.5 w-64 bg-white border border-slate-200 rounded-xl shadow-xl p-2 z-50 space-y-1">
                <div className="px-2 py-2 text-xs font-bold text-slate-800 border-b border-slate-100 mb-1">
                  <div className="text-[10px] text-slate-400 uppercase">Current Profile</div>
                  <div className="truncate">{user?.name}</div>
                  <div className="text-[10px] text-emerald-600 truncate mt-0.5">{user?.email}</div>
                </div>

                <div>
                  <button
                    onClick={() => {
                      logout();
                      setShowPersonaMenu(false);
                      onNavigate('login');
                    }}
                    className="w-full text-left px-2 py-2 rounded-lg text-xs text-red-600 hover:bg-red-50 flex items-center gap-1.5 font-bold mt-1"
                  >
                    <LogOut className="w-3.5 h-3.5" /> Sign Out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* ── 2. MAIN WORKSPACE (SIDEBAR + CONTENT) ── */}
      <div className="flex flex-1 min-h-0 overflow-hidden">
        
        {/* Left Navigation Rail */}
        <aside className={`${collapsed ? 'w-16' : 'w-56'} bg-white border-r border-slate-200 flex flex-col justify-between p-2.5 transition-all duration-300 z-40 flex-shrink-0 font-sans shadow-sm`}>
          <div className="space-y-1">
            {visibleNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = activePage === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => onNavigate(item.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded text-xs transition-all ${
                    isActive
                      ? 'bg-gradient-to-r from-[#FF7A1A] to-[#EA580C] text-slate-900 font-bold shadow-md shadow-orange-500/20'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                  title={collapsed ? item.label : undefined}
                >
                  <Icon className={`w-4 h-4 flex-shrink-0 ${isActive ? 'text-slate-900' : 'text-slate-500'}`} />
                  {!collapsed && (
                    <div className="flex-1 text-left flex items-center justify-between truncate">
                      <span className="truncate">{item.label}</span>
                      {item.is3D && (
                        <span className={`text-[8px] px-1 py-0.2 rounded font-bold ${isActive ? 'bg-white/20 text-slate-900' : 'bg-orange-50 text-orange-600 border border-orange-200'}`}>
                          3D
                        </span>
                      )}
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          {/* Dataset Switcher & Collapse Toggle (Only for LEO/Admin) */}
          <div className="space-y-2 pt-2 border-t border-slate-200 text-[10px]">
            {!collapsed && (role === 'CYBER_OFFICER' || role === 'ADMIN' || role === 'POLICE') && (
              <div className="space-y-1">
                <span className="text-slate-500 font-bold uppercase tracking-wider block text-[9px]">
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

      {/* ── 3. BOTTOM TELEMETRY STRIP ── */}
      <footer className="h-7 bg-white border-t border-slate-200 px-4 flex items-center justify-between font-sans text-[10px] text-slate-500 z-50 flex-shrink-0">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            <span>STREAM: <strong className="text-slate-800 font-sans">{bench?.ingestion_rate_tx_per_sec || '1,448.90'} TX/SEC</strong></span>
          </div>
          <span className="text-slate-700">|</span>
          <div>ACTIVE CHAINS: <strong className="text-[#FF5500] font-sans">{stats?.tier_breakdown?.HIGH_CONFIDENCE || '48'} RINGS</strong></div>
          <span className="text-slate-700">|</span>
          <div>CASH-OUT EXPOSURE: <strong className="text-amber-600 font-sans">₹4.82 CR</strong></div>
        </div>

        <div className="hidden sm:flex items-center gap-4">
          <div>CLEARANCE: <strong className="text-slate-700">{user?.role || 'CYBER_OFFICER'}</strong></div>
          <span className="text-slate-700">|</span>
          <div>POLICY: <strong className="text-slate-700">τ = 0.50</strong></div>
          <span className="text-slate-700">|</span>
          <div className={`font-bold ${bench?.p50_latency_ms > 50 ? 'text-amber-600' : 'text-emerald-600'}`}>
            P50: {bench?.p50_latency_ms || '71.67'}ms ({bench?.p50_latency_ms > 50 ? 'SLA MISS' : 'SLA OK'})
          </div>
        </div>
      </footer>

    </div>
  );
};
