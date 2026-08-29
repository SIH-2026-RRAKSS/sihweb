import React from 'react';
import { Shield, Radio, Activity, Search, UserCheck, Terminal } from 'lucide-react';
import { HealthResponse } from '../../types';

interface NavbarProps {
  health: HealthResponse | null;
  activeDataset: 'A' | 'B';
  onDatasetChange: (dataset: 'A' | 'B') => void;
  onOpenSandbox: () => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  health,
  activeDataset,
  onDatasetChange,
  onOpenSandbox,
  searchQuery,
  onSearchChange
}) => {
  const isOnline = health?.database_connected ?? false;

  return (
    <header className="sticky top-0 z-40 h-16 bg-white border-b border-slate-200  px-4 lg:px-6 flex items-center justify-between shadow-lg shadow-black/40">
      {/* Brand & Title */}
      <div className="flex items-center gap-3">
        <div className="relative flex items-center justify-center w-10 h-10 rounded-2xl bg-slate-50 border border-cyber-cyan/40 glow-cyan">
          <Shield className="w-5 h-5 text-cyber-cyan animate-pulse" />
          <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyber-cyan opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-cyber-cyan"></span>
          </span>
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-black tracking-wider text-slate-900 uppercase">
              SIH Cyber<span className="text-cyber-cyan">Guard</span>
            </span>
            <span className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-sans font-semibold bg-cyber-cyan/10 text-cyber-cyan border border-cyber-cyan/30 rounded">
              v1.0 AML-GNN
            </span>
          </div>
          <p className="text-[11px] text-slate-500 font-sans hidden md:block">
            Multi-Dataset Mule-Chain Detection & Triage Architecture
          </p>
        </div>
      </div>

      {/* Center Search Bar */}
      <div className="hidden lg:flex items-center flex-1 max-w-md mx-6">
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search Complaint ID, Account Number, District, Scam Type..."
            className="w-full pl-9 pr-4 py-1.5 text-xs bg-white border border-slate-200 rounded-2xl text-slate-800 placeholder-slate-500 focus:outline-none focus:border-cyber-cyan focus:ring-1 focus:ring-cyber-cyan transition-all font-sans"
          />
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-3">
        {/* Dataset Toggle */}
        <div className="flex items-center p-0.5 bg-white border border-slate-200 rounded-2xl text-xs font-sans">
          <button
            onClick={() => onDatasetChange('A')}
            className={`px-2.5 py-1 rounded transition-colors ${
              activeDataset === 'A'
                ? 'bg-cyber-cyan/20 text-cyber-cyan font-bold border border-cyber-cyan/40'
                : 'text-slate-500 hover:text-slate-800'
            }`}
            title="Dataset A: Synthetic Domestic Cybercrime Subgraphs (1,000 Incidents with GPS & ATMs)"
          >
            Dataset A (Domestic)
          </button>
          <button
            onClick={() => onDatasetChange('B')}
            className={`px-2.5 py-1 rounded transition-colors ${
              activeDataset === 'B'
                ? 'bg-cyber-cyan/20 text-cyber-cyan font-bold border border-cyber-cyan/40'
                : 'text-slate-500 hover:text-slate-800'
            }`}
            title="Dataset B: IBM AML Multi-Bank Transfer Subgraphs (Real-world rails)"
          >
            Dataset B (IBM AML)
          </button>
        </div>

        {/* Quick Sandbox Trigger */}
        <button
          onClick={onOpenSandbox}
          className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs font-sans bg-slate-50 hover:bg-slate-100 text-slate-800 border border-slate-200 rounded-2xl transition-all"
        >
          <Terminal className="w-3.5 h-3.5 text-cyber-cyan" />
          <span>Live GNN Sandbox</span>
        </button>

        {/* Backend Heartbeat Pill */}
        <div
          className={`flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-sans rounded-full border ${
            isOnline
              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
              : 'bg-cyber-amber/10 text-cyber-amber border-cyber-amber/30'
          }`}
          title={isOnline ? "FastAPI Server Connected (Port 8000)" : "Using High-Fidelity Local Engine"}
        >
          <Radio className={`w-3 h-3 ${isOnline ? 'animate-pulse text-emerald-400' : 'text-cyber-amber'}`} />
          <span className="font-semibold">{isOnline ? 'API LIVE :8000' : 'STANDALONE MODE'}</span>
        </div>

        {/* User Role Pill */}
        <div className="hidden xl:flex items-center gap-2 pl-2 border-l border-slate-200">
          <div className="w-7 h-7 rounded-full bg-slate-50 border border-slate-200 flex items-center justify-center text-cyber-cyan">
            <UserCheck className="w-3.5 h-3.5" />
          </div>
          <div className="text-left">
            <div className="text-[11px] font-bold text-slate-800 leading-none">IO / FIU Analyst</div>
            <div className="text-[9px] text-emerald-400 font-sans">RBAC: Active</div>
          </div>
        </div>
      </div>
    </header>
  );
};
