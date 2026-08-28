import React from 'react';
import { ShieldAlert, MapPin, CheckCircle2, FileText, ArrowRight, Activity, Cpu } from 'lucide-react';
import { SimulationResults } from './SimulationLab';

interface SimulationOutputsProps {
  currentStage: number;
  results: SimulationResults | null;
  state: 'idle' | 'running' | 'paused' | 'complete';
}

export const SimulationOutputs: React.FC<SimulationOutputsProps> = ({
  currentStage,
  results,
  state,
}) => {
  const isComplete = state === 'complete' || currentStage === 8;
  const isStage4Plus = currentStage >= 4;

  return (
    <div className="bg-[#0C0E12] border border-white/10 rounded-lg p-3.5 flex flex-col space-y-3.5 text-slate-200 overflow-y-auto shadow-industrial-sm h-full font-mono text-xs">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
        <div className="flex items-center gap-2">
          <Activity className="w-3.5 h-3.5 text-[#FF5500]" />
          <div>
            <div className="font-bold tracking-tight text-white text-xs">
              INTELLIGENCE TELEMETRY
            </div>
            <div className="text-[9px] text-zinc-500">STAGE OUTPUTS & RATIONALE</div>
          </div>
        </div>

        <span className={`text-[9px] px-2 py-0.5 rounded font-bold ${
          isComplete ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30' : 'bg-white/5 text-zinc-400'
        }`}>
          STAGE {currentStage}/8
        </span>
      </div>

      {/* ── 1. GRAPHSAGE RISK SCORE GAUGE ── */}
      <div className="bg-[#060709] border border-white/10 rounded p-3 space-y-2">
        <div className="flex items-center justify-between text-[11px]">
          <span className="text-zinc-400 font-bold">GRAPHSAGE GNN SCORE</span>
          <span className={`font-bold px-1.5 py-0.2 rounded text-[10px] ${
            isStage4Plus
              ? (results?.graphsageScore || 0) > 0.8
                ? 'bg-[#FF5500]/15 text-[#FF5500] border border-[#FF5500]/30'
                : 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
              : 'text-zinc-600'
          }`}>
            {isStage4Plus ? (results?.confidenceTier || 'HIGH_CONFIDENCE') : 'STANDBY'}
          </span>
        </div>

        <div className="flex items-baseline justify-between pt-1">
          <span className="text-2xl font-bold font-sans text-white tracking-tight">
            {isStage4Plus ? `${((results?.graphsageScore || 0.9988) * 100).toFixed(1)}%` : '--.-%'}
          </span>
          <span className="text-[10px] text-zinc-500">POLICY τ = 0.50</span>
        </div>

        <div className="w-full bg-[#1A1E26] h-1.5 rounded overflow-hidden">
          <div
            className={`h-full transition-all duration-500 ${
              isStage4Plus
                ? (results?.graphsageScore || 0) > 0.8 ? 'bg-[#FF5500]' : 'bg-emerald-400'
                : 'bg-transparent'
            }`}
            style={{ width: isStage4Plus ? `${(results?.graphsageScore || 0.9988) * 100}%` : '0%' }}
          />
        </div>
      </div>

      {/* ── 2. MODEL COMPARISON (GRAPHSAGE VS XGBOOST) ── */}
      <div className="bg-[#060709] border border-white/10 rounded p-2.5 space-y-2 text-[10px]">
        <div className="text-zinc-400 font-bold uppercase tracking-wider">
          Baseline vs Graph Inductive Lift
        </div>

        <div className="space-y-1.5">
          <div>
            <div className="flex justify-between text-zinc-400 mb-0.5">
              <span>GraphSAGE GNN:</span>
              <span className="text-white font-bold">{isStage4Plus ? `${((results?.graphsageScore || 0.9988) * 100).toFixed(1)}%` : '--'}</span>
            </div>
            <div className="w-full bg-[#1A1E26] h-1 rounded overflow-hidden">
              <div className="h-full bg-[#FF5500]" style={{ width: isStage4Plus ? `${(results?.graphsageScore || 0.9988) * 100}%` : '0%' }} />
            </div>
          </div>

          <div>
            <div className="flex justify-between text-zinc-400 mb-0.5">
              <span>XGBoost Baseline:</span>
              <span className="text-zinc-300 font-bold">{currentStage >= 3 ? `${((results?.xgboostScore || 0.8889) * 100).toFixed(1)}%` : '--'}</span>
            </div>
            <div className="w-full bg-[#1A1E26] h-1 rounded overflow-hidden">
              <div className="h-full bg-zinc-400" style={{ width: currentStage >= 3 ? `${(results?.xgboostScore || 0.8889) * 100}%` : '0%' }} />
            </div>
          </div>
        </div>
      </div>

      {/* ── 3. PREDICTED CASH-OUT EXIT TERMINAL ── */}
      <div className="bg-[#060709] border border-white/10 rounded p-2.5 space-y-1.5">
        <div className="flex items-center justify-between text-[10px] text-amber-400 font-bold">
          <span className="flex items-center gap-1">
            <MapPin className="w-3 h-3 text-amber-400" />
            <span>PREDICTED EXIT TERMINAL</span>
          </span>
          <span>MRR: 1.0000</span>
        </div>

        <div className="flex justify-between items-baseline pt-0.5">
          <span className="text-sm font-bold text-white">
            {currentStage >= 5 ? (results?.terminalPrediction.id || 'ATM_029') : '---'}
          </span>
          <span className="text-[11px] text-zinc-400">
            {currentStage >= 5 ? (results?.terminalPrediction.city || 'Mumbai (Nariman Point)') : 'Calculating...'}
          </span>
        </div>
      </div>

      {/* ── 4. INVESTIGATIVE EVIDENCE BULLETS ── */}
      <div className="space-y-1.5">
        <div className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">
          Evidence Rationale (Stage 7)
        </div>

        <div className="space-y-1 text-[10px] text-zinc-300">
          {(currentStage >= 7 && results?.evidence
            ? results.evidence
            : [
                'Temporal subgraph analysis active for 72-hour window.',
                'GraphSAGE evaluating topological message passing.',
                'Awaiting automated threshold decision advisory.',
              ]
          ).map((bullet, idx) => (
            <div key={idx} className="flex items-start gap-1.5 bg-[#060709] p-1.5 border border-white/5 rounded">
              <CheckCircle2 className="w-3 h-3 text-[#FF5500] flex-shrink-0 mt-0.5" />
              <span className="leading-snug text-zinc-300">{bullet}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── 5. ACTION ADVISORY BUTTON ── */}
      {isComplete && (
        <div className="pt-2 border-t border-white/10">
          <div className="p-2 bg-[#FF5500]/10 border border-[#FF5500]/30 rounded text-center">
            <div className="text-[10px] text-[#FF5500] font-bold">
              {results?.action || 'ESCALATE // REQUEST IMMEDIATE FREEZE'}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
