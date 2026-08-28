import React from 'react';
import { motion } from 'framer-motion';
import {
  Binary,
  GitFork,
  Cpu,
  Network,
  MapPin,
  ShieldCheck,
  FileText,
  Gavel,
  CheckCircle2,
  Activity
} from 'lucide-react';

interface PipelineStageRailProps {
  currentStage: number;
  stageTimings: number[];
  state: 'idle' | 'running' | 'paused' | 'complete';
  onSelectStage?: (stage: number) => void;
}

const STAGES = [
  { id: 1, name: '1. Entity Resolution', desc: 'Canonical Identity', latency: '4.2ms', icon: Binary },
  { id: 2, name: '2. Subgraph Extraction', desc: '3-Hop Temporal', latency: '18.6ms', icon: GitFork },
  { id: 3, name: '3. XGBoost Baseline', desc: 'Tabular Features', latency: '8.1ms', icon: Cpu },
  { id: 4, name: '4. GraphSAGE GNN', desc: 'Inductive Message', latency: '24.7ms', icon: Network },
  { id: 5, name: '5. Terminal Ranking', desc: 'Exit Sort (MRR 1.0)', latency: '6.5ms', icon: MapPin },
  { id: 6, name: '6. Confidence Tier', desc: 'Triage Threshold', latency: '2.1ms', icon: ShieldCheck },
  { id: 7, name: '7. Explainability', desc: 'Topology Signatures', latency: '5.8ms', icon: FileText },
  { id: 8, name: '8. Policy Decision', desc: 'Account Freeze', latency: '1.4ms', icon: Gavel },
];

export const PipelineStageRail: React.FC<PipelineStageRailProps> = ({
  currentStage,
  state,
  onSelectStage,
}) => {
  return (
    <div className="bg-[#0C0E12] border border-white/10 rounded-lg p-2.5 flex items-center justify-between font-mono text-xs shadow-industrial-sm overflow-hidden">
      {/* Stages Strip */}
      <div className="flex items-center gap-1.5 flex-1 overflow-x-auto pr-2">
        {STAGES.map((stage, idx) => {
          const Icon = stage.icon;
          const isActive = currentStage === stage.id;
          const isComplete = currentStage > stage.id || state === 'complete';
          const isPending = currentStage < stage.id && state !== 'complete';

          return (
            <React.Fragment key={stage.id}>
              <motion.div
                onClick={() => onSelectStage?.(stage.id)}
                className={`px-2.5 py-1.5 rounded flex items-center gap-2 cursor-pointer transition-all flex-shrink-0 ${
                  isActive
                    ? 'bg-[#FF5500] text-black font-bold shadow-signal-glow'
                    : isComplete
                    ? 'bg-white/10 text-white border border-white/15'
                    : 'bg-white/[0.03] text-zinc-500 border border-transparent hover:text-zinc-300'
                }`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Icon className="w-3.5 h-3.5" />
                <div className="flex flex-col">
                  <span className="text-[11px] font-bold tracking-tight">
                    {stage.name}
                  </span>
                  <div className="flex items-center gap-1.5 text-[9px] opacity-75">
                    <span>{stage.latency}</span>
                    {isComplete && <span className="text-emerald-400">✓</span>}
                  </div>
                </div>
              </motion.div>

              {idx < STAGES.length - 1 && (
                <span className={`text-[10px] ${isComplete ? 'text-[#FF5500]' : 'text-zinc-700'}`}>
                  →
                </span>
              )}
            </React.Fragment>
          );
        })}
      </div>

      {/* Pipeline Status Tag */}
      <div className="pl-3 border-l border-white/10 flex-shrink-0 flex items-center gap-2">
        <span className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase tracking-wider ${
          state === 'running'
            ? 'bg-[#FF5500]/15 text-[#FF5500] border border-[#FF5500]/40 animate-pulse'
            : state === 'complete'
            ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/40'
            : 'bg-white/5 text-zinc-400 border border-white/10'
        }`}>
          {state === 'running' ? 'INFERENCE ACTIVE' : state === 'complete' ? 'VERIFIED' : 'STANDBY'}
        </span>
      </div>
    </div>
  );
};
