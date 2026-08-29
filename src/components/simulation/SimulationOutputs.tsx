import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldAlert, MapPin, CheckCircle2, FileText, ArrowRight, Activity, Cpu, ShieldCheck, AlertTriangle } from 'lucide-react';
import { SimulationResults } from './SimulationLab';
import { IncidentDetail } from '../../types';

interface SimulationOutputsProps {
  currentStage: number;
  results: SimulationResults | null;
  incidentDetail?: IncidentDetail | null;
  state: 'idle' | 'running' | 'paused' | 'complete';
  onNavigateToDossier?: (complaintId: string) => void;
}

export const SimulationOutputs: React.FC<SimulationOutputsProps> = ({
  currentStage,
  results,
  incidentDetail,
  state,
  onNavigateToDossier,
}) => {
  const isComplete = state === 'complete' || currentStage === 8;
  const isStage3Plus = currentStage >= 3;
  const isStage4Plus = currentStage >= 4;
  const isStage5Plus = currentStage >= 5;
  const isStage7Plus = currentStage >= 7;

  const isNormal = results?.confidenceTier === 'NORMAL' || incidentDetail?.model_prediction.confidence_tier === 'NORMAL';
  const gnnScore = results?.graphsageScore ?? (incidentDetail?.model_prediction.graphsage_risk_probability ?? 0.95);
  const xgbScore = results?.xgboostScore ?? 0.8889;
  const tier = results?.confidenceTier ?? (incidentDetail?.model_prediction.confidence_tier ?? 'HIGH_CONFIDENCE');

  const terminalId = results?.terminalPrediction.id || incidentDetail?.model_prediction.top_terminal_id || (isNormal ? 'NONE' : 'ATM_008');
  const terminalCity = results?.terminalPrediction.city || incidentDetail?.model_prediction.top_terminal_city || (isNormal ? 'Legitimate Direct Settlement' : 'Bengaluru (Indiranagar)');

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-4 flex flex-col space-y-3.5 text-slate-800 overflow-y-auto shadow-sm h-full font-sans text-xs select-none">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-2.5">
        <div className="flex items-center gap-2">
          <Activity className="w-3.5 h-3.5 text-[#FF5500]" />
          <div>
            <div className="font-bold tracking-tight text-slate-900 text-xs">
              INTELLIGENCE TELEMETRY
            </div>
            <div className="text-[9px] text-slate-500">STAGE 0-8 REAL-TIME INFERENCE</div>
          </div>
        </div>

        <motion.span
          className={`text-[9px] px-2 py-0.5 rounded font-bold ${
            isComplete ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30' : 'bg-slate-100 text-slate-500'
          }`}
          animate={isComplete ? { scale: [1, 1.05, 1] } : {}}
          transition={{ duration: 0.3 }}
        >
          STAGE {currentStage}/8
        </motion.span>
      </div>

      {/* ── 1. GRAPHSAGE RISK SCORE GAUGE ── */}
      <div className="bg-slate-50 border border-slate-200 rounded p-3 space-y-2">
        <div className="flex items-center justify-between text-[11px]">
          <span className="text-slate-500 font-bold">GraphSAGE GNN SCORE</span>
          <span className={`font-bold px-1.5 py-0.2 rounded text-[10px] ${
            isStage4Plus
              ? tier === 'HIGH_CONFIDENCE'
                ? 'bg-[#FF5500]/15 text-[#FF5500] border border-[#FF5500]/30'
                : (tier === 'MEDIUM_CONFIDENCE' ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30' : 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30')
              : 'text-zinc-600'
          }`}>
            {isStage4Plus ? tier : 'STANDBY'}
          </span>
        </div>

        <div className="flex items-baseline justify-between pt-1">
          <motion.span
            className="text-2xl font-bold font-sans text-slate-900 tracking-tight"
            key={isStage4Plus ? gnnScore : 'standby'}
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
          >
            {isStage4Plus ? `${(gnnScore * 100).toFixed(2)}%` : '--.-%'}
          </motion.span>
          <span className="text-[10px] text-slate-500">POLICY τ = 0.50</span>
        </div>

        <div className="w-full bg-slate-100 h-2 rounded overflow-hidden">
          <motion.div
            className={`h-full ${
              tier === 'HIGH_CONFIDENCE' ? 'bg-[#FF5500]' : (tier === 'MEDIUM_CONFIDENCE' ? 'bg-amber-400' : 'bg-emerald-400')
            }`}
            initial={{ width: '0%' }}
            animate={{ width: isStage4Plus ? `${Math.min(100, Math.max(2, gnnScore * 100))}%` : '0%' }}
            transition={{ type: 'spring', stiffness: 260, damping: 24 }}
          />
        </div>
      </div>

      {/* ── 2. MODEL COMPARISON (GRAPHSAGE VS XGBOOST) ── */}
      <div className="bg-slate-50 border border-slate-200 rounded p-2.5 space-y-2 text-[10px]">
        <div className="text-slate-500 font-bold uppercase tracking-wider">
          Baseline vs Graph Inductive Lift
        </div>

        <div className="space-y-1.5">
          <div>
            <div className="flex justify-between text-slate-500 mb-0.5">
              <span>GraphSAGE GNN (Stage 3B):</span>
              <span className="text-slate-900 font-bold">{isStage3Plus ? `${(gnnScore * 100).toFixed(1)}%` : '--'}</span>
            </div>
            <div className="w-full bg-slate-100 h-1 rounded overflow-hidden">
              <motion.div
                className="h-full bg-[#FF5500]"
                initial={{ width: '0%' }}
                animate={{ width: isStage3Plus ? `${gnnScore * 100}%` : '0%' }}
                transition={{ type: 'spring', stiffness: 260, damping: 24 }}
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between text-slate-500 mb-0.5">
              <span>XGBoost Baseline (Stage 3A):</span>
              <span className="text-slate-700 font-bold">{isStage3Plus ? `${(xgbScore * 100).toFixed(1)}%` : '--'}</span>
            </div>
            <div className="w-full bg-slate-100 h-1 rounded overflow-hidden">
              <motion.div
                className="h-full bg-zinc-400"
                initial={{ width: '0%' }}
                animate={{ width: isStage3Plus ? `${xgbScore * 100}%` : '0%' }}
                transition={{ type: 'spring', stiffness: 260, damping: 24 }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* ── 3. PREDICTED CASH-OUT EXIT TERMINAL ── */}
      <div className="bg-slate-50 border border-slate-200 rounded p-2.5 space-y-1.5">
        <div className="flex items-center justify-between text-[10px] text-amber-400 font-bold">
          <span className="flex items-center gap-1">
            <MapPin className="w-3 h-3 text-amber-400" />
            <span>{isNormal ? 'SETTLEMENT ENDPOINT' : 'PREDICTED CASH-OUT TERMINAL'}</span>
          </span>
          <span>{isNormal ? 'CLEARED' : 'MRR: 1.0000'}</span>
        </div>

        <div className="flex justify-between items-baseline pt-0.5">
          <span className="text-sm font-bold text-slate-900">
            {isStage5Plus ? (isNormal ? 'Verified Merchant' : terminalId) : '---'}
          </span>
          <span className="text-[11px] text-slate-500 truncate max-w-[150px]">
            {isStage5Plus ? terminalCity : 'Calculating...'}
          </span>
        </div>
      </div>

      {/* ── 4. INVESTIGATIVE EVIDENCE BULLETS (STAGE 6) ── */}
      <div className="space-y-1.5 flex-1 min-h-[110px]">
        <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">
          AI Evidence Briefing (Stage 6)
        </div>

        <div className="space-y-1 text-[10px] text-slate-700">
          {(isStage7Plus && results?.evidence && results.evidence.length > 0
            ? results.evidence
            : [
                `Closed ±72h, ≤3-hop temporal subgraph active for seed ${incidentDetail?.complaint.complaint_id || 'incident'}.`,
                'GraphSAGE inductive SAGEConv evaluating multi-hop neighborhood.',
                'Awaiting automated threshold decision policy advisory.',
              ]
          ).slice(0, 3).map((bullet, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: idx * 0.08 }}
              className="flex items-start gap-1.5 bg-slate-50 p-1.5 border border-slate-100 rounded"
            >
              <CheckCircle2 className="w-3 h-3 text-[#FF5500] flex-shrink-0 mt-0.5" />
              <span className="leading-snug text-slate-700">{bullet}</span>
            </motion.div>
          ))}
        </div>
      </div>

      {/* ── 5. ACTION ADVISORY & DOSSIER BUTTON ── */}
      {isComplete && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 350, damping: 25 }}
          className="pt-2 border-t border-slate-200 space-y-2"
        >
          <div className={`p-2 rounded text-center font-bold text-[10px] ${
            tier === 'HIGH_CONFIDENCE'
              ? 'bg-[#FF5500]/15 text-[#FF5500] border border-[#FF5500]/30'
              : (tier === 'MEDIUM_CONFIDENCE' ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30' : 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30')
          }`}>
            {results?.action || (tier === 'HIGH_CONFIDENCE' ? 'ESCALATE // REQUEST IMMEDIATE FREEZE' : (tier === 'MEDIUM_CONFIDENCE' ? 'FLAG FOR TRIAGE // ENHANCED MONITORING' : 'DISMISS ALERT // VALIDATED NORMAL'))}
          </div>

          {onNavigateToDossier && incidentDetail?.complaint.complaint_id && (
            <motion.button
              onClick={() => onNavigateToDossier(incidentDetail.complaint.complaint_id)}
              className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-900 border border-slate-200 rounded font-bold text-[10px] flex items-center justify-center gap-1.5 transition-colors"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <span>OPEN COMPLETE CASE DOSSIER</span>
              <ArrowRight className="w-3 h-3" />
            </motion.button>
          )}
        </motion.div>
      )}
    </div>
  );
};
