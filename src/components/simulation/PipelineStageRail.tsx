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
  Activity
} from 'lucide-react';

interface PipelineStageRailProps {
  currentStage: number;
  stageTimings: number[];
  state: 'idle' | 'running' | 'paused' | 'complete';
  onSelectStage?: (stage: number) => void;
}

const STAGES = [
  { id: 1, stageNum: '00', name: 'Entity Resolution', desc: 'Canonical Identity', latency: '4.2ms', icon: Binary },
  { id: 2, stageNum: '01/02', name: '72h Subgraph', desc: '3-Hop Temporal', latency: '18.6ms', icon: GitFork },
  { id: 3, stageNum: '03A', name: 'XGBoost Baseline', desc: 'Tabular Metrics', latency: '8.1ms', icon: Cpu },
  { id: 4, stageNum: '03B', name: 'GraphSAGE GNN', desc: 'Inductive Message', latency: '24.7ms', icon: Network },
  { id: 5, stageNum: '04', name: 'Terminal Ranking', desc: 'Exit Sort (MRR 1.0)', latency: '6.5ms', icon: MapPin },
  { id: 6, stageNum: '05', name: 'Confidence Tier', desc: 'Embedding Similarity', latency: '2.1ms', icon: ShieldCheck },
  { id: 7, stageNum: '06', name: 'Explainability', desc: 'Evidence Rationale', latency: '5.8ms', icon: FileText },
  { id: 8, stageNum: '07/08', name: 'Policy Decision', desc: 'Tunable Threshold', latency: '1.4ms', icon: Gavel },
];

export const PipelineStageRail: React.FC<PipelineStageRailProps> = ({
  currentStage,
  state,
  onSelectStage,
}) => {
  const progressPercent = Math.min(100, (currentStage / 8) * 100);

  return (
    <div className="relative bg-white border border-slate-200 rounded-2xl p-2.5 flex flex-col space-y-2 font-sans text-xs shadow-sm overflow-hidden select-none">
      
      {/* Top Track & Status */}
      <div className="flex items-center justify-between">
        
        {/* Stages Strip */}
        <div className="flex items-center gap-1.5 flex-1 overflow-x-auto pr-3 scrollbar-none">
          {STAGES.map((stage, idx) => {
            const Icon = stage.icon;
            const isActive = currentStage === stage.id;
            const isComplete = currentStage > stage.id || state === 'complete';

            return (
              <React.Fragment key={stage.id}>
                <motion.div
                  onClick={() => onSelectStage?.(stage.id)}
                  className={`relative px-3 py-1.5 rounded flex items-center gap-2 cursor-pointer flex-shrink-0 transition-colors z-10 ${
                    isActive
                      ? 'text-black font-bold'
                      : isComplete
                      ? 'text-slate-900 hover:text-slate-900 bg-slate-100 border border-slate-200'
                      : 'text-slate-500 hover:text-slate-700 bg-white/[0.02] border border-transparent'
                  }`}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {/* Motion Gliding Active Pill (Motion.dev LayoutId) */}
                  {isActive && (
                    <motion.div
                      layoutId="activeStagePill"
                      className="absolute inset-0 bg-[#FF5500] rounded shadow-signal-glow z-[-1]"
                      transition={{ type: 'spring', stiffness: 380, damping: 28 }}
                    />
                  )}

                  <Icon className="w-3.5 h-3.5 flex-shrink-0" />
                  <div className="flex flex-col text-left">
                    <span className="text-[11px] font-bold tracking-tight whitespace-nowrap">
                      {stage.name}
                    </span>
                    <div className="flex items-center gap-1.5 text-[9px] opacity-80 whitespace-nowrap">
                      <span>{stage.latency}</span>
                      {isComplete && !isActive && <span className="text-emerald-400 font-bold">✓</span>}
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
        <div className="pl-3 border-l border-slate-200 flex-shrink-0 flex items-center gap-2">
          <motion.span
            className={`text-[10px] px-2.5 py-1 rounded font-bold uppercase tracking-wider ${
              state === 'running'
                ? 'bg-[#FF5500]/15 text-[#FF5500] border border-[#FF5500]/40'
                : state === 'complete'
                ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/40'
                : 'bg-slate-100 text-slate-500 border border-slate-200'
            }`}
            animate={state === 'running' ? { opacity: [0.7, 1, 0.7] } : { opacity: 1 }}
            transition={{ duration: 1.2, repeat: Infinity }}
          >
            {state === 'running' ? `STAGE ${currentStage}/8 EXECUTING` : state === 'complete' ? 'INFERENCE VERIFIED' : 'STANDBY'}
          </motion.span>
        </div>

      </div>

      {/* Bottom Glowing Laser Progress Line */}
      <div className="relative w-full bg-[#161A22] h-1 rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-gradient-to-r from-[#FF5500] via-[#FF7700] to-[#38BDF8] rounded-full shadow-signal-glow relative"
          initial={{ width: '0%' }}
          animate={{ width: `${progressPercent}%` }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        >
          {state === 'running' && (
            <motion.div
              className="absolute right-0 top-0 bottom-0 w-4 bg-white rounded-full blur-[2px]"
              animate={{ opacity: [0.4, 1, 0.4] }}
              transition={{ duration: 0.6, repeat: Infinity }}
            />
          )}
        </motion.div>
      </div>

    </div>
  );
};
