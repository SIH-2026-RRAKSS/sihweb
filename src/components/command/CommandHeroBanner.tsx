import React from 'react';
import {
  ShieldAlert,
  Zap,
  FlaskConical,
  MapPin,
  SlidersHorizontal,
  ArrowRight
} from 'lucide-react';
import { NavPage } from '../layout/AppShell';

interface CommandHeroBannerProps {
  onNavigate?: (page: NavPage) => void;
}

export const CommandHeroBanner: React.FC<CommandHeroBannerProps> = ({ onNavigate }) => {
  return (
    <div className="relative bg-[#0C0E12] border border-white/10 p-5 rounded-lg shadow-industrial-md overflow-hidden select-none">
      <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
        {/* Left: Industrial Intelligence Status */}
        <div className="space-y-2 max-w-2xl font-mono">
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-2.5 py-0.5 bg-[#FF5500]/10 border border-[#FF5500]/30 text-[#FF5500] text-[10px] font-bold tracking-widest uppercase rounded">
              DEFCON-2 // REAL-TIME SURVEILLANCE
            </span>
            <span className="px-2.5 py-0.5 bg-white/5 border border-white/10 text-zinc-300 text-[10px] font-bold rounded">
              GraphSAGE GNN v2.4 OPERATIONAL
            </span>
            <span className="px-2.5 py-0.5 bg-amber-500/10 border border-amber-500/30 text-amber-400 text-[10px] font-bold rounded">
              TERMINAL MRR: 1.0000
            </span>
          </div>

          <h1 className="text-xl md:text-2xl font-bold font-sans text-white tracking-tight leading-tight uppercase">
            CYBERCRIME PREDICTIVE ANALYTICS — <span className="text-[#FF5500]">AML & MULE-CHAIN</span> DETECTION PIPELINE
          </h1>

          <p className="text-xs text-zinc-400 leading-relaxed max-w-xl font-sans">
            An end-to-end graph-native framework for financial cybercrime complaint resolution, multi-hop mule graph extraction, inductive GraphSAGE detection, and terminal cash-out prediction.
          </p>
        </div>

        {/* Right: Quick Launchpad Action Buttons */}
        <div className="flex flex-col sm:flex-row md:flex-col gap-2 w-full md:w-auto flex-shrink-0 font-mono">
          <button
            onClick={() => onNavigate?.('simulation')}
            className="px-5 py-2.5 bg-white hover:bg-zinc-200 text-black font-bold text-xs tracking-wider flex items-center justify-center gap-2 rounded shadow-md transition-all"
          >
            <FlaskConical className="w-4 h-4 fill-current" />
            <span>⚡ LAUNCH 3D SIMULATION LAB</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onNavigate?.('cashout-map')}
              className="flex-1 px-3 py-1.5 bg-[#12151B] hover:bg-[#1A1E26] border border-white/10 text-amber-400 text-[11px] font-bold flex items-center justify-center gap-1.5 rounded transition-colors"
            >
              <MapPin className="w-3.5 h-3.5" />
              <span>GEO MAP</span>
            </button>

            <button
              onClick={() => onNavigate?.('policy')}
              className="flex-1 px-3 py-1.5 bg-[#12151B] hover:bg-[#1A1E26] border border-white/10 text-zinc-300 text-[11px] font-bold flex items-center justify-center gap-1.5 rounded transition-colors"
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>POLICY (τ)</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
