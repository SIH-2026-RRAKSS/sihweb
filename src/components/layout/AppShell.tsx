import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Menu,
  LayoutDashboard,
  FlaskConical,
  ListFilter,
  Network,
  MapPin,
  SlidersHorizontal,
  Activity,
  ChevronLeft,
  ChevronRight,
  Clock,
  Zap,
  UserCheck,
  LogOut,
  ChevronDown,
  UploadCloud,
  AlertOctagon,
  PlusCircle,
  FolderClock,
  Settings,
  Cpu,
  ShieldCheck,
} from 'lucide-react';

import { TrinetraLogo } from '../ui/TrinetraLogo';
import { useAuth } from '../../context/AuthContext';
import { useConnectivity } from '../../context/ConnectivityContext';
import { formatCompactINR } from '../../utils/formatINR';
import { UserRole } from '../../types';
import { ApiService, isDemoMode } from '../../services/api';

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
  backendOnline: boolean;
  activeDataset: 'SYNTHETIC_A' | 'IBM_B' | 'ELLIPTIC_C';
  onToggleDataset: (dataset: 'SYNTHETIC_A' | 'IBM_B' | 'ELLIPTIC_C') => void;
  children?: React.ReactNode;
}

interface NavItemDef {
  id: string; // the path without leading slash
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

const PERSONA_OPTIONS: { role: UserRole; name: string; title: string; defaultPath: string }[] = [
  { role: 'CYBER_OFFICER', name: 'Inspector Sanjay Rao', title: 'Cyber Crime Officer', defaultPath: '/command' },
  { role: 'POLICE', name: 'SHO Vikramaditya V.', title: 'Police Station SHO', defaultPath: '/incidents' },
  { role: 'BANK_MANAGER', name: 'Pooja Nair', title: 'Bank Nodal Manager', defaultPath: '/bank-freeze' },
  { role: 'BANK_EMPLOYEE', name: 'Rohit Kulkarni', title: 'Bank Officer', defaultPath: '/bank-freeze' },
  { role: 'COMPLAINANT', name: 'Aaditya Roy', title: 'Citizen Complainant', defaultPath: '/citizen-portal' },
  { role: 'ADMIN', name: 'Dr. Anand Verma', title: 'System Administrator', defaultPath: '/admin-console' },
];

export const AppShell: React.FC<AppShellProps> = ({
  backendOnline: _backendOnline,
  activeDataset,
  onToggleDataset,
  children,
}) => {
  const navigate = useNavigate();
  const location = useLocation();

  const { user, role, switchPersona, logout } = useAuth();
  const [collapsed, setCollapsed] = useState(typeof window !== 'undefined' ? window.innerWidth < 768 : false);
  const [showPersonaMenu, setShowPersonaMenu] = useState(false);
  const [time, setTime] = useState<{ ist: string; utc: string }>({ ist: '', utc: '' });
  const [stats, setStats] = useState<any>(null);
  const [bench, setBench] = useState<any>(null);

  const { fastApiStatus, restStatus } = useConnectivity();

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
      
      {/* ── 1. TOP COMMAND BAR (h-12 / 48px) ── */}
      <header className="h-12 bg-white border-b border-[#E2E8F0] px-4 flex items-center justify-between shrink-0 z-50 shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
        
        {/* LEFT CLUSTER: Mobile Toggle + Logo Unit + Role Badge */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="md:hidden p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
            title="Toggle Navigation Menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Fixed-width Logo Container to prevent rotating script layout shift */}
          <div
            onClick={() => navigate('/splash')}
            className="flex items-center gap-2 cursor-pointer group min-w-[170px] sm:min-w-[195px]"
            title="Return to Splash Overview (Team Trinetra)"
          >
            <TrinetraLogo size="sm" showLangBadge={false} intervalMs={2800} theme="light" />
            <span className="hidden sm:inline-block bg-slate-100 text-slate-700 text-[10px] font-mono font-bold px-1.5 py-0.5 rounded border border-slate-200 tracking-wider">
              DEFCON-2
            </span>
          </div>

          {/* Security Clearance Pill */}
          <div className={`hidden sm:flex items-center gap-1.5 px-2 py-0.5 rounded-md border text-[11px] font-bold tracking-wide ${roleBadge.bg}`}>
            <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
            <span>{roleBadge.label}</span>
          </div>
        </div>

        {/* CENTER CLUSTER: Contained Unified System-Status Unit */}
        <div className="hidden md:flex items-center">
          <div className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-1 flex items-center gap-3 text-[11px] shadow-sm">
            {(role === 'CYBER_OFFICER' || role === 'ADMIN' || role === 'POLICE') && (
              <>
                <div className="flex items-center gap-1.5">
                  <span className="text-slate-400 font-semibold tracking-wider text-[10px]">DATASET:</span>
                  <span className="font-mono font-bold text-slate-800 tracking-tight">{activeDataset}</span>
                </div>
                <div className="w-px h-3.5 bg-slate-300" />
              </>
            )}

            {/* REST API Health */}
            <div className="flex items-center gap-1.5">
              <span className={`w-2 h-2 rounded-full ${restStatus === '200 OK' ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`} />
              <span className="text-slate-400 font-semibold tracking-wider text-[10px]">REST API:</span>
              <span className={`font-mono font-bold ${restStatus === '200 OK' ? 'text-emerald-600' : 'text-red-600'}`}>{restStatus}</span>
            </div>

            <div className="w-px h-3.5 bg-slate-300" />

            {/* FASTAPI Model Health */}
            <div className="flex items-center gap-1.5">
              <span className={`w-2 h-2 rounded-full ${fastApiStatus === '200 OK' ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`} />
              <span className="text-slate-400 font-semibold tracking-wider text-[10px]">FASTAPI:</span>
              <span className={`font-mono font-bold ${fastApiStatus === '200 OK' ? 'text-emerald-600' : 'text-red-600'}`}>{fastApiStatus}</span>
            </div>
          </div>
        </div>

        {/* RIGHT CLUSTER: Military Clock + Real User Profile Dropdown */}
        <div className="flex items-center gap-2.5">
          {/* Sample Data Badge (shown only if demo mode is enabled) */}
          {isDemoMode() && (
            <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-300 uppercase tracking-widest font-mono shadow-xs">
              SAMPLE DATA
            </span>
          )}

          {/* Military Dual Clock Chip */}
          <div className="hidden sm:flex items-center bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 gap-1.5 text-[11px] text-slate-700 font-mono shadow-xs">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            <span className="font-bold text-slate-800 tracking-tight">{time.ist || '00:00:00'}</span>
            <span className="text-[9px] font-sans font-bold text-slate-500 bg-slate-200/70 px-1 py-0.5 rounded">IST</span>
          </div>

          {/* User Profile & Persona Dropdown (Bound to AuthContext) */}
          <div className="relative">
            <button
              onClick={() => setShowPersonaMenu(!showPersonaMenu)}
              className="flex items-center bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 gap-2 hover:bg-slate-100 cursor-pointer transition-colors shadow-xs"
              title="User Account & Persona Switcher"
            >
              <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-[#FF5500] to-amber-500 flex items-center justify-center text-white text-[11px] font-bold shadow-xs">
                {(user?.name ? user.name[0] : 'U').toUpperCase()}
              </div>
              <div className="hidden md:flex flex-col text-left leading-none">
                <span className="text-xs font-semibold text-slate-800 max-w-[120px] truncate">{user?.name || 'Officer'}</span>
                <span className="text-[9px] text-slate-400 font-medium truncate mt-0.5">{roleBadge.label}</span>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 ml-0.5" />
            </button>

            {/* Persona Quick Switcher Dropdown */}
            {showPersonaMenu && (
              <div className="absolute right-0 mt-1.5 w-64 bg-white border border-slate-200 rounded-xl shadow-xl p-2 z-50 space-y-2">
                <div className="px-2 py-1.5 text-xs font-bold text-slate-800 border-b border-slate-100">
                  <div className="text-[10px] text-slate-400 uppercase tracking-wider">Current Account</div>
                  <div className="truncate text-slate-900 font-bold mt-0.5">{user?.name || 'Authorized User'}</div>
                  <div className="text-[10px] text-emerald-600 truncate">{user?.email || 'session@netraa.gov.in'}</div>
                  <div className="text-[9px] text-slate-500 font-mono mt-1 bg-slate-100 px-1.5 py-0.5 rounded inline-block">
                    ROLE: {user?.role || 'CYBER_OFFICER'}
                  </div>
                </div>

                <div>
                  <div className="px-2 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Quick Switch Persona
                  </div>
                  <div className="space-y-0.5 max-h-48 overflow-y-auto">
                    {PERSONA_OPTIONS.map((p) => {
                      const isCurrent = user?.role === p.role;
                      return (
                        <button
                          key={p.role}
                          onClick={() => {
                            switchPersona(p.role);
                            setShowPersonaMenu(false);
                            navigate(p.defaultPath);
                          }}
                          className={`w-full text-left px-2 py-1.5 rounded-lg text-xs flex items-center justify-between transition-colors ${
                            isCurrent
                              ? 'bg-orange-50 text-orange-700 font-bold'
                              : 'text-slate-700 hover:bg-slate-50 font-medium'
                          }`}
                        >
                          <div className="truncate">
                            <div className="truncate text-[11px]">{p.name}</div>
                            <div className="text-[9px] text-slate-400">{p.title}</div>
                          </div>
                          {isCurrent && <span className="w-1.5 h-1.5 rounded-full bg-[#FF5500] shrink-0" />}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="border-t border-slate-100 pt-1">
                  <button
                    onClick={() => {
                      logout();
                      setShowPersonaMenu(false);
                      navigate('/login');
                    }}
                    className="w-full text-left px-2 py-1.5 rounded-lg text-xs text-red-600 hover:bg-red-50 flex items-center gap-2 font-bold transition-colors"
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
        <aside className={`${collapsed ? 'w-16 p-2' : 'w-60 p-3'} bg-white border-r border-[#E2E8F0] flex flex-col justify-between transition-all duration-200 z-40 shrink-0 font-sans shadow-xs`}>
          <div className="space-y-1 overflow-y-auto">
            {!collapsed && (
              <div className="px-2 pb-1.5 pt-0.5 text-[9px] font-bold uppercase tracking-wider text-slate-400">
                Operations & Governance
              </div>
            )}

            {visibleNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = item.id === 'incidents'
                ? location.pathname.startsWith('/incidents') || location.pathname.startsWith('/dossier')
                : location.pathname.startsWith(`/${item.id}`);

              return (
                <button
                  key={item.id}
                  onClick={() => navigate(`/${item.id}`)}
                  className={`group w-full flex items-center rounded-lg text-xs transition-all ${
                    collapsed ? 'justify-center px-2 py-2' : 'justify-between px-2.5 py-2'
                  } ${
                    isActive
                      ? 'bg-gradient-to-r from-[#FF7A1A] to-[#EA580C] text-white shadow-sm shadow-orange-500/25 font-semibold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50 font-medium'
                  }`}
                  title={collapsed ? item.label : undefined}
                >
                  <div className={`flex items-center ${collapsed ? '' : 'gap-3'}`}>
                    <Icon className={`w-4 h-4 shrink-0 stroke-[1.75] ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-600'}`} />
                    {!collapsed && <span className="truncate">{item.label}</span>}
                  </div>

                  {!collapsed && (
                    <div className="flex items-center gap-1.5">
                      {item.is3D && (
                        <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded font-mono ${
                          isActive
                            ? 'bg-white/20 text-white'
                            : 'bg-orange-50 text-orange-600 border border-orange-200'
                        }`}>
                          3D
                        </span>
                      )}
                      {isActive && <span className="w-1.5 h-1.5 rounded-full bg-white/80 shrink-0" />}
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          {/* Bottom Sidebar Section: Dataset Switcher & Collapse Toggle */}
          <div className="pt-3 border-t border-[#E2E8F0] space-y-2.5 shrink-0">
            {!collapsed && (role === 'CYBER_OFFICER' || role === 'ADMIN' || role === 'POLICE') && (
              <div className="bg-slate-50 p-2 rounded-lg border border-slate-200">
                <div className="text-[9px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 flex items-center justify-between">
                  <span>EVALUATION DATASET:</span>
                  <span className="text-[8px] bg-slate-200/70 text-slate-600 font-mono px-1 rounded">3 SOURCES</span>
                </div>
                <div className="space-y-1 font-mono">
                  {(['SYNTHETIC_A', 'IBM_B', 'ELLIPTIC_C'] as const).map((ds) => {
                    const isSelected = activeDataset === ds;
                    const dsLabel = ds === 'SYNTHETIC_A' ? '[A] SYNTHETIC MULE' : ds === 'IBM_B' ? '[B] IBM MULTI-BANK' : '[C] ELLIPTIC BITCOIN';
                    return (
                      <button
                        key={ds}
                        onClick={() => onToggleDataset(ds)}
                        className={`w-full text-left text-[10px] px-2 py-1 rounded transition-colors flex items-center justify-between ${
                          isSelected
                            ? 'bg-white text-slate-900 border border-slate-300 shadow-2xs font-bold'
                            : 'text-slate-500 hover:text-slate-800 hover:bg-white/60 font-medium'
                        }`}
                      >
                        <span className="truncate">{dsLabel}</span>
                        {isSelected ? (
                          <span className="w-1.5 h-1.5 rounded-full bg-[#FF5500] shrink-0" />
                        ) : (
                          <span className="text-[9px] text-slate-400 font-sans">Ready</span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            <button
              onClick={() => setCollapsed(!collapsed)}
              className="w-full rounded-md border border-slate-200 text-slate-500 text-[10px] font-semibold py-1.5 flex items-center justify-center gap-1.5 hover:bg-slate-50 hover:text-slate-800 transition-colors uppercase tracking-wider"
              title={collapsed ? 'Expand Navigation Rail' : 'Collapse Navigation Rail'}
            >
              {collapsed ? (
                <ChevronRight className="w-3.5 h-3.5" />
              ) : (
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

      {/* ── 3. BOTTOM TELEMETRY STRIP (h-7 / 28px) ── */}
      <footer className="h-7 bg-white border-t border-[#E2E8F0] px-4 flex items-center justify-between text-[10px] text-slate-500 font-mono shrink-0 z-50 select-none">
        
        {/* Left Telemetry Group (Live Dynamic Bindings) */}
        <div className="flex items-center gap-2.5">
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-bold text-slate-800">
              STREAM: {bench?.ingestion_rate_tx_per_sec ? `${bench.ingestion_rate_tx_per_sec} TX/SEC` : 'STREAMING...'}
            </span>
          </div>

          <span className="text-slate-300 font-sans">|</span>

          <div>
            <span className="font-bold text-[#FF5500]">
              ACTIVE CHAINS: {stats?.tier_breakdown?.HIGH_CONFIDENCE !== undefined ? `${stats.tier_breakdown.HIGH_CONFIDENCE} RINGS` : '--'}
            </span>
          </div>

          <span className="text-slate-300 font-sans">|</span>

          <div>
            <span className="font-bold text-amber-600">
              HIGH-CONFIDENCE EXPOSURE: {stats?.high_risk_exposure ? formatCompactINR(stats.high_risk_exposure) : '—'}
            </span>
          </div>
        </div>

        {/* Right Telemetry Group (Live Dynamic Bindings) */}
        <div className="hidden sm:flex items-center gap-2.5">
          <div>
            <span className="font-bold text-slate-700">
              CLEARANCE: {user?.role || 'CYBER_OFFICER'}
            </span>
          </div>

          <span className="text-slate-300 font-sans">|</span>

          <div>
            <span className="font-bold text-slate-700">
              POLICY: &tau; = 0.50
            </span>
          </div>

          <span className="text-slate-300 font-sans">|</span>

          <div className={`flex items-center gap-1 font-bold ${bench?.p50_latency_ms > 50 ? 'text-amber-600' : 'text-emerald-600'}`}>
            <ShieldCheck className="w-3 h-3" />
            <span>
              P50: {bench?.p50_latency_ms ? `${bench.p50_latency_ms}ms` : 'SLA OK'} ({bench?.p50_latency_ms > 50 ? 'SLA MISS' : 'SLA OK'})
            </span>
          </div>
        </div>
      </footer>

    </div>
  );
};


