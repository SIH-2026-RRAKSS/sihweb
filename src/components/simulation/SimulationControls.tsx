import React, { useState, useEffect } from 'react';
import { Play, Pause, RotateCcw, Zap, Sliders, User, ArrowRight, Search } from 'lucide-react';
import { ApiService } from '../../services/api';
import { IncidentSummary } from '../../types';

export interface SimulationParams {
  amount: number;
  hopCount: number;
  muleCount: number;
  anomalyIntensity: 'Low' | 'Medium' | 'High';
  threshold: number;
}

export interface SimulationControlsProps {
  state: 'idle' | 'running' | 'paused' | 'complete';
  speed: number;
  scenario: string;
  seedEntityId: string;
  params: SimulationParams;
  onPlay: () => void;
  onPause: () => void;
  onReset: () => void;
  onSpeedChange: (speed: number) => void;
  onScenarioChange: (scenario: string) => void;
  onSeedEntityChange: (entityId: string) => void;
  onParamsChange: (params: SimulationParams) => void;
  onInject: () => void;
}

const SCENARIOS = [
  { id: 'fan-out', name: 'Fan-Out Layering Ring', desc: '1 victim → 3 mules → 2 layering → 1 ATM', risk: 'HIGH', badgeColor: 'bg-[#FF5500]/15 text-[#FF5500] border-[#FF5500]/30' },
  { id: 'multi-hop', name: 'Multi-Hop Mule Chain', desc: '4-Hop cascading accounts to Bhopal exit', risk: 'HIGH', badgeColor: 'bg-[#FF5500]/15 text-[#FF5500] border-[#FF5500]/30' },
  { id: 'atm-blitz', name: 'ATM Cash-Out Blitz', desc: 'Synchronized withdrawals across 3 cities', risk: 'CRITICAL', badgeColor: 'bg-rose-500/15 text-rose-400 border-rose-500/30' },
  { id: 'fan-in', name: 'Fan-In Structuring Smurf', desc: 'Multiple micro-transfers consolidating', risk: 'MEDIUM', badgeColor: 'bg-amber-500/15 text-amber-400 border-amber-500/30' },
  { id: 'novel-ring', name: 'Novel Syndicate Signature', desc: 'Unobserved temporal graph pattern', risk: 'HIGH', badgeColor: 'bg-[#FF5500]/15 text-[#FF5500] border-[#FF5500]/30' },
  { id: 'normal-tx', name: 'Legitimate Merchant Flow', desc: 'Standard business transaction pattern', risk: 'CLEARED', badgeColor: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30' },
];

export const SimulationControls: React.FC<SimulationControlsProps> = ({
  state,
  speed,
  scenario,
  seedEntityId,
  params,
  onPlay,
  onPause,
  onReset,
  onSpeedChange,
  onScenarioChange,
  onSeedEntityChange,
  onParamsChange,
  onInject,
}) => {
  const [incidentsList, setIncidentsList] = useState<IncidentSummary[]>([]);
  const [tierFilter, setTierFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Fetch full incident roster from ApiService
  useEffect(() => {
    const loadAllIncidents = async () => {
      try {
        const res = await ApiService.getIncidents({ page: 1, page_size: 1000 });
        if (res.items && res.items.length > 0) {
          // Sort in serial order
          const sorted = [...res.items].sort((a, b) => {
            const numA = parseInt(a.complaint_id.replace(/\D/g, ''), 10) || 0;
            const numB = parseInt(b.complaint_id.replace(/\D/g, ''), 10) || 0;
            return numA - numB;
          });
          setIncidentsList(sorted);
        }
      } catch (err) {
        console.error('Failed to load incident roster for simulation:', err);
      }
    };
    loadAllIncidents();
  }, []);

  const filteredIncidents = incidentsList.filter((i) => {
    if (tierFilter !== 'ALL' && i.confidence_tier !== tierFilter) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        i.complaint_id.toLowerCase().includes(q) ||
        (i.scam_category && i.scam_category.toLowerCase().includes(q)) ||
        (i.district && i.district.toLowerCase().includes(q))
      );
    }
    return true;
  });

  const handleSelectCase = (chosenId: string) => {
    onSeedEntityChange(chosenId);
    const chosen = incidentsList.find(i => i.complaint_id === chosenId);
    if (chosen) {
      const isHigh = chosen.confidence_tier === 'HIGH_CONFIDENCE';
      const isNormal = chosen.confidence_tier === 'NORMAL';
      onParamsChange({
        ...params,
        amount: chosen.reported_amount || 450000,
        hopCount: isNormal ? 1 : (isHigh ? 4 : 2),
        muleCount: isNormal ? 1 : (isHigh ? 6 : 3),
      });
      if (isNormal) onScenarioChange('normal-tx');
      else if (chosen.top_terminal_id && chosen.top_terminal_id !== 'NONE') onScenarioChange('fan-out');
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-3.5 flex flex-col space-y-3.5 text-slate-800 overflow-y-auto shadow-sm h-full font-sans text-xs">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-2.5">
        <div className="flex items-center gap-2">
          <Sliders className="w-3.5 h-3.5 text-[#FF5500]" />
          <div>
            <div className="font-bold tracking-tight text-slate-900 text-xs">
              SIMULATION CONTROLLER
            </div>
            <div className="text-[9px] text-slate-500">STAGE 0-8 REAL-TIME INFERENCE</div>
          </div>
        </div>

        <span className="text-[9px] bg-slate-100 border border-slate-200 text-slate-500 px-2 py-0.5 rounded font-bold">
          {incidentsList.length} CASES
        </span>
      </div>

      {/* ── 1. COMPREHENSIVE SEED ENTITY SELECTOR ── */}
      <div className="space-y-2 bg-slate-50 p-2.5 border border-slate-200 rounded">
        <div className="flex items-center justify-between">
          <label className="text-[10px] text-slate-700 font-bold flex items-center gap-1.5">
            <User className="w-3 h-3 text-[#FF5500]" />
            <span>INVESTIGATION SEED ENTITY:</span>
          </label>

          {/* Quick Tier Pill */}
          <select
            value={tierFilter}
            onChange={(e) => setTierFilter(e.target.value)}
            className="bg-white border border-white/15 text-slate-700 px-1.5 py-0.5 rounded text-[9px] font-bold focus:outline-none"
          >
            <option value="ALL">ALL TIERS</option>
            <option value="HIGH_CONFIDENCE">CRITICAL</option>
            <option value="MEDIUM_CONFIDENCE">SUSPICIOUS</option>
            <option value="NORMAL">CLEARED</option>
          </select>
        </div>

        {/* Search / Filter Roster Dropdown */}
        <select
          value={seedEntityId}
          onChange={(e) => handleSelectCase(e.target.value)}
          className="w-full bg-white border border-white/15 text-slate-900 px-2.5 py-1.5 rounded text-[11px] font-bold focus:border-[#FF5500] focus:outline-none"
        >
          {filteredIncidents.slice(0, 100).map((inc) => (
            <option key={inc.complaint_id} value={inc.complaint_id}>
              {inc.complaint_id} — {inc.scam_category || 'Flow'} (₹{(inc.reported_amount || 0).toLocaleString('en-IN')} / {inc.district || 'City'} ➔ {inc.top_terminal_city || 'N/A'}) [{inc.confidence_tier}]
            </option>
          ))}
        </select>
      </div>

      {/* ── 2. MAIN PLAY / PAUSE / RESET & SPEED ── */}
      <div className="grid grid-cols-3 gap-1.5 text-xs">
        {state === 'running' ? (
          <button
            onClick={onPause}
            className="py-2 bg-amber-500/20 hover:bg-amber-500/30 text-amber-400 border border-amber-500/40 rounded flex items-center justify-center gap-1.5 font-bold transition-all"
          >
            <Pause className="w-3.5 h-3.5 fill-current" />
            <span>PAUSE</span>
          </button>
        ) : (
          <button
            onClick={onPlay}
            className="py-2 bg-[#FF5500] hover:bg-[#FF5500]/90 text-black rounded flex items-center justify-center gap-1.5 font-bold shadow-signal-glow transition-all"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>EXECUTE</span>
          </button>
        )}

        <button
          onClick={onReset}
          className="py-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded flex items-center justify-center gap-1 font-bold transition-all"
        >
          <RotateCcw className="w-3 h-3" />
          <span>RESET</span>
        </button>

        {/* Speed Controls */}
        <div className="flex border border-slate-200 bg-slate-50 rounded p-0.5">
          {[1, 5, 20].map((s) => (
            <button
              key={s}
              onClick={() => onSpeedChange(s)}
              className={`flex-1 py-0.5 text-[10px] rounded font-bold ${
                speed === s
                  ? 'bg-white text-black shadow-sm'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              {s}X
            </button>
          ))}
        </div>
      </div>

      {/* ── 3. INJECT SUSPICIOUS TRANSACTION ── */}
      <button
        onClick={onInject}
        className="w-full py-2 bg-[#FF5500]/10 hover:bg-[#FF5500]/20 border border-[#FF5500]/40 text-[#FF5500] rounded text-[11px] font-bold tracking-wider flex items-center justify-center gap-1.5 transition-all"
      >
        <Zap className="w-3.5 h-3.5" />
        <span>INJECT SUSPICIOUS TRANSACTION</span>
      </button>

      {/* ── 4. ATTACK SCENARIO SELECTOR ── */}
      <div className="space-y-1.5">
        <div className="text-[10px] uppercase tracking-wider text-slate-500 font-bold flex items-center justify-between">
          <span>Attack Typology</span>
          <span className="text-slate-900">6 PRESETS</span>
        </div>
        
        <div className="space-y-1 max-h-[130px] overflow-y-auto pr-1">
          {SCENARIOS.map((scen) => (
            <div
              key={scen.id}
              onClick={() => onScenarioChange(scen.id)}
              className={`p-2 border rounded cursor-pointer transition-all ${
                scenario === scen.id
                  ? 'bg-slate-100 border-white/30 text-slate-900 shadow-sm'
                  : 'bg-slate-50 border-slate-100 text-slate-500 hover:border-white/15'
              }`}
            >
              <div className="flex items-center justify-between text-[11px] font-bold">
                <span>{scen.name}</span>
                <span className={`text-[8px] px-1.5 py-0.2 border rounded ${scen.badgeColor}`}>
                  {scen.risk}
                </span>
              </div>
              <div className="text-[9px] text-slate-500 truncate mt-0.5">
                {scen.desc}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── 5. PARAMETER SLIDERS ── */}
      <div className="space-y-2.5 border-t border-slate-200 pt-2.5 text-[10px]">
        <div className="space-y-1">
          <div className="flex justify-between">
            <span className="text-slate-500">DISPUTED AMOUNT:</span>
            <span className="text-slate-900 font-bold">₹{params.amount.toLocaleString('en-IN')}</span>
          </div>
          <input
            type="range"
            min="10000"
            max="1000000"
            step="10000"
            value={params.amount}
            onChange={(e) => onParamsChange({ ...params, amount: Number(e.target.value) })}
            className="w-full h-1 bg-slate-100 rounded appearance-none accent-[#FF5500] cursor-pointer"
          />
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-1">
            <div className="flex justify-between">
              <span className="text-slate-500">HOPS (1-5):</span>
              <span className="text-slate-900 font-bold">{params.hopCount}</span>
            </div>
            <input
              type="range"
              min="1"
              max="5"
              value={params.hopCount}
              onChange={(e) => onParamsChange({ ...params, hopCount: Number(e.target.value) })}
              className="w-full h-1 bg-slate-100 rounded appearance-none accent-white cursor-pointer"
            />
          </div>

          <div className="space-y-1">
            <div className="flex justify-between">
              <span className="text-slate-500">MULES (1-8):</span>
              <span className="text-slate-900 font-bold">{params.muleCount}</span>
            </div>
            <input
              type="range"
              min="1"
              max="8"
              value={params.muleCount}
              onChange={(e) => onParamsChange({ ...params, muleCount: Number(e.target.value) })}
              className="w-full h-1 bg-slate-100 rounded appearance-none accent-white cursor-pointer"
            />
          </div>
        </div>

        <div className="space-y-1">
          <div className="flex justify-between">
            <span className="text-slate-500">POLICY THRESHOLD (τ):</span>
            <span className="text-amber-400 font-bold">τ = {params.threshold.toFixed(2)}</span>
          </div>
          <input
            type="range"
            min="0.1"
            max="0.9"
            step="0.05"
            value={params.threshold}
            onChange={(e) => onParamsChange({ ...params, threshold: Number(e.target.value) })}
            className="w-full h-1 bg-slate-100 rounded appearance-none accent-amber-400 cursor-pointer"
          />
        </div>
      </div>
    </div>
  );
};
