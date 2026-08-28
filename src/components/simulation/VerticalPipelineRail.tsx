import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
  Activity,
  Flame
} from 'lucide-react';
import { SimulationResults } from './SimulationLab';

interface VerticalPipelineRailProps {
  currentStage: number;
  stageTimings: number[];
  state: 'idle' | 'running' | 'paused' | 'complete';
  results: SimulationResults | null;
  onSelectStage?: (stage: number) => void;
}

const STAGES = [
  {
    id: 1,
    name: 'STAGE 1: ENTITY RESOLUTION',
    desc: 'Canonical Identity Resolution',
    icon: Binary,
    latency: '4.2ms',
    getResult: () => 'ENT_000185 (HDFC Bank - Rahul Dey)',
  },
  {
    id: 2,
    name: 'STAGE 2: 72H SUBGRAPH EXTRACTION',
    desc: '3-Hop Temporal Topology',
    icon: GitFork,
    latency: '18.6ms',
    getResult: () => '9 Nodes, 10 Edges, 3 Downstream Hops',
  },
  {
    id: 3,
    name: 'STAGE 3: XGBOOST BASELINE',
    desc: 'Tabular Feature Evaluation',
    icon: Cpu,
    latency: '8.1ms',
    getResult: (res: SimulationResults | null) => `XGB Score: ${(res?.xgboostScore ? res.xgboostScore * 100 : 88.9).toFixed(1)}% (Baseline)`,
  },
  {
    id: 4,
    name: 'STAGE 4: GRAPHSAGE GNN MODEL',
    desc: 'Inductive Message Passing',
    icon: Network,
    latency: '24.7ms',
    getResult: (res: SimulationResults | null) => `GNN Score: ${(res?.graphsageScore ? res.graphsageScore * 100 : 99.88).toFixed(1)}% [CRITICAL]`,
  },
  {
    id: 5,
    name: 'STAGE 5: ATM TERMINAL RANKING',
    desc: 'Cash-Out Destination Sorting',
    icon: MapPin,
    latency: '6.5ms',
    getResult: (res: SimulationResults | null) => `Top Terminal: ${res?.terminalPrediction.id || 'ATM_029'} (Mumbai - 95%)`,
  },
  {
    id: 6,
    name: 'STAGE 6: CONFIDENCE TIERING',
    desc: 'Automated AML Triage Matrix',
    icon: ShieldCheck,
    latency: '2.1ms',
    getResult: (res: SimulationResults | null) => `Classification: ${res?.confidenceTier || 'HIGH_CONFIDENCE'}`,
  },
  {
    id: 7,
    name: 'STAGE 7: GNN EXPLAINABILITY',
    desc: 'Topology & Velocity Signatures',
    icon: FileText,
    latency: '5.8ms',
    getResult: () => '4 Structuring Signals (92.4% velocity / 45m)',
  },
  {
    id: 8,
    name: 'STAGE 8: THRESHOLD DECISION (τ)',
    desc: 'Automated Freeze Advisory',
    icon: Gavel,
    latency: '1.4ms',
    getResult: (res: SimulationResults | null) => res?.action || 'FREEZE ADVISORY GENERATED // ESCALATE',
  },
];

export const VerticalPipelineRail: React.FC<VerticalPipelineRailProps> = ({
  currentStage,
  stageTimings,
  state,
  results,
  onSelectStage,
}) => {
  return (
    <div className="h-full bg-cyber-900 border border-cyan-500/30 p-2.5 flex flex-col font-mono text-xs overflow-hidden hud-bracket">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-cyan-500/30 pb-2 mb-2">
        <div className="flex items-center gap-2">
          <div className="p-1 border border-cyan-500 bg-cyan-500/10 text-neon-cyan">
            <Activity className="w-4 h-4 animate-pulse" />
          </div>
          <div>
            <div className="text-[11px] font-black text-neon-cyan text-glow-cyan">
              VERTICAL PIPELINE RAIL
            </div>
            <div className="text-[8px] text-slate-500">
              STAGES 1 TO 8 SEQUENTIAL STREAM
            </div>
          </div>
        </div>

        <span className={`text-[9px] px-1.5 py-0.5 border font-bold ${
          state === 'running' 
            ? 'border-cyan-400 bg-cyan-500/20 text-neon-cyan animate-pulse' 
            : state === 'complete' 
            ? 'border-green-500 bg-green-500/20 text-acid-green' 
            : 'border-slate-800 text-slate-500'
        }`}>
          {state === 'running' ? 'STREAMING' : state === 'complete' ? 'VERIFIED' : 'STANDBY'}
        </span>
      </div>

      {/* Stage Nodes Stream List */}
      <div className="flex-1 overflow-y-auto space-y-1.5 pr-1">
        {STAGES.map((stage, idx) => {
          const Icon = stage.icon;
          const isActive = currentStage === stage.id;
          const isComplete = currentStage > stage.id || state === 'complete';
          const isPending = currentStage < stage.id && state !== 'complete';

          return (
            <motion.div
              key={stage.id}
              onClick={() => onSelectStage?.(stage.id)}
              className={`p-2 border transition-all relative cursor-pointer ${
                isActive
                  ? 'bg-cyan-500/20 border-cyan-400 text-neon-cyan shadow-neon-cyan'
                  : isComplete
                  ? 'bg-cyber-950 border-acid-green/40 text-slate-200'
                  : 'bg-cyber-950/40 border-slate-800/80 text-slate-600 opacity-60'
              }`}
              whileHover={{ x: 2 }}
            >
              {/* Connector line to next stage */}
              {idx < STAGES.length - 1 && (
                <div className={`absolute left-4 -bottom-2 w-0.5 h-2 z-0 ${
                  isComplete ? 'bg-acid-green' : isActive ? 'bg-neon-cyan animate-pulse' : 'bg-slate-800'
                }`} />
              )}

              {/* Stage Header */}
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-1.5">
                  <div className={`p-1 border ${
                    isActive
                      ? 'border-cyan-400 bg-cyan-400/20 text-neon-cyan'
                      : isComplete
                      ? 'border-acid-green/40 bg-acid-green/10 text-acid-green'
                      : 'border-slate-800 text-slate-600'
                  }`}>
                    <Icon className="w-3 h-3" />
                  </div>
                  <span className="text-[10px] font-black tracking-tight">
                    {stage.name}
                  </span>
                </div>

                <span className="text-[9px] text-slate-500">{stage.latency}</span>
              </div>

              {/* Real-time Streaming Output Telemetry */}
              <AnimatePresence>
                {isComplete ? (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="mt-1 pt-1 border-t border-slate-800/80 text-[9px] text-acid-green flex items-center justify-between"
                  >
                    <span className="font-bold truncate max-w-[200px]">
                      ✔ {stage.getResult(results)}
                    </span>
                    <span className="text-[8px] text-slate-500">DONE</span>
                  </motion.div>
                ) : isActive ? (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="mt-1 pt-1 border-t border-cyan-500/30 text-[9px] text-neon-cyan flex items-center gap-1.5 animate-pulse"
                  >
                    <span className="w-1.5 h-1.5 bg-neon-cyan rounded-none animate-ping" />
                    <span>INFERENCE IN PROGRESS...</span>
                  </motion.div>
                ) : (
                  <div className="text-[9px] text-slate-600 truncate mt-0.5">
                    {stage.desc}
                  </div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};
