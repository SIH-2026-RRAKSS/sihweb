import React from 'react';
import { motion } from 'framer-motion';
import {
  ShieldAlert,
  Share2,
  Clock,
  Target,
  ArrowUpRight,
  TrendingUp,
  Activity,
  Layers,
  CheckCircle2
} from 'lucide-react';
import { SpotlightCard } from '../ui/SpotlightCard';
import { NumberTicker } from '../ui/NumberTicker';
import { PipelineStats } from '../../types';

interface TacticalBentoGridProps {
  stats: PipelineStats | null;
  highRiskExposure: number;
}

const formatRupee = (amount: number): string => {
  if (amount >= 10000000) {
    return `₹${(amount / 10000000).toFixed(2)}Cr`;
  }
  if (amount >= 100000) {
    return `₹${(amount / 100000).toFixed(2)}L`;
  }
  return `₹${amount.toLocaleString('en-IN')}`;
};

export const TacticalBentoGrid: React.FC<TacticalBentoGridProps> = ({ stats, highRiskExposure }) => {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
      {/* 1. HIGH RISK ALERTS */}
      <SpotlightCard
        spotlightColor="rgba(255, 85, 0, 0.09)"
        className="p-4 bg-white border border-slate-200/90 rounded-2xl shadow-sm hover:border-orange-500/30 transition-all"
      >
        <div className="flex items-center justify-between text-[10px] font-mono text-slate-500 mb-2">
          <span className="flex items-center gap-1.5 font-bold">
            <span className="w-1.5 h-1.5 rounded-full bg-[#FF5500] animate-ping" />
            [01 // THREATS]
          </span>
          <span className="text-[#FF5500] font-bold bg-orange-50 px-1.5 py-0.2 rounded border border-orange-200/60">
            +14% VEL
          </span>
        </div>

        <div className="text-2xl sm:text-3xl font-bold font-mono tracking-tight text-slate-900 flex items-baseline gap-1.5">
          <NumberTicker value={stats ? stats.tier_breakdown.HIGH_CONFIDENCE : 142} />
          <span className="text-xs font-sans text-slate-400 font-semibold">CASES</span>
        </div>

        <div className="text-[11px] text-slate-600 font-medium mt-1">High-Risk Mule Networks</div>

        <div className="w-full h-1 bg-slate-100 rounded-full mt-3 overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: '68%' }}
            transition={{ duration: 1, ease: 'easeOut' }}
            className="h-full bg-[#FF5500]"
          />
        </div>
      </SpotlightCard>

      {/* 2. MULE SYNDICATES */}
      <SpotlightCard
        spotlightColor="rgba(245, 158, 11, 0.09)"
        className="p-4 bg-white border border-slate-200/90 rounded-2xl shadow-sm hover:border-amber-500/30 transition-all"
      >
        <div className="flex items-center justify-between text-[10px] font-mono text-slate-500 mb-2">
          <span className="font-bold">[02 // RINGS]</span>
          <span className="text-amber-600 font-bold bg-amber-50 px-1.5 py-0.2 rounded border border-amber-200/60">
            72H WIN
          </span>
        </div>

        <div className="text-2xl sm:text-3xl font-bold font-mono tracking-tight text-slate-900 flex items-baseline gap-1.5">
          <NumberTicker value={48} />
          <span className="text-xs font-sans text-slate-400 font-semibold">RINGS</span>
        </div>

        <div className="text-[11px] text-slate-600 font-medium mt-1">Coordinated Graph Topologies</div>

        <div className="w-full h-1 bg-slate-100 rounded-full mt-3 overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: '52%' }}
            transition={{ duration: 1, ease: 'easeOut' }}
            className="h-full bg-amber-500"
          />
        </div>
      </SpotlightCard>

      {/* 3. CASH-OUT EXPOSURE */}
      <SpotlightCard
        spotlightColor="rgba(255, 85, 0, 0.09)"
        className="p-4 bg-white border border-slate-200/90 rounded-2xl shadow-sm hover:border-orange-500/30 transition-all"
      >
        <div className="flex items-center justify-between text-[10px] font-mono text-slate-500 mb-2">
          <span className="font-bold">[03 // EXPOSURE]</span>
          <span className="text-[#FF5500] font-bold bg-orange-50 px-1.5 py-0.2 rounded border border-orange-200/60">
            CRITICAL
          </span>
        </div>

        <div className="text-2xl sm:text-3xl font-bold font-mono tracking-tight text-slate-900">
          {formatRupee(highRiskExposure || 48200000)}
        </div>

        <div className="text-[11px] text-slate-600 font-medium mt-1">Flagged Laundering Volume</div>

        <div className="w-full h-1 bg-slate-100 rounded-full mt-3 overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: '84%' }}
            transition={{ duration: 1, ease: 'easeOut' }}
            className="h-full bg-[#FF5500]"
          />
        </div>
      </SpotlightCard>

      {/* 4. TRIAGE QUEUE */}
      <SpotlightCard
        spotlightColor="rgba(59, 130, 246, 0.09)"
        className="p-4 bg-white border border-slate-200/90 rounded-2xl shadow-sm hover:border-blue-500/30 transition-all"
      >
        <div className="flex items-center justify-between text-[10px] font-mono text-slate-500 mb-2">
          <span className="font-bold">[04 // TRIAGE]</span>
          <span className="text-blue-600 font-bold bg-blue-50 px-1.5 py-0.2 rounded border border-blue-200/60">
            SLA &lt;2H
          </span>
        </div>

        <div className="text-2xl sm:text-3xl font-bold font-mono tracking-tight text-slate-900 flex items-baseline gap-1.5">
          <NumberTicker value={stats ? stats.tier_breakdown.MEDIUM_CONFIDENCE : 218} />
          <span className="text-xs font-sans text-slate-400 font-semibold">PENDING</span>
        </div>

        <div className="text-[11px] text-slate-600 font-medium mt-1">Awaiting Officer Review</div>

        <div className="w-full h-1 bg-slate-100 rounded-full mt-3 overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: '58%' }}
            transition={{ duration: 1, ease: 'easeOut' }}
            className="h-full bg-blue-500"
          />
        </div>
      </SpotlightCard>

      {/* 5. GNN F1 ACCURACY */}
      <SpotlightCard
        spotlightColor="rgba(16, 185, 129, 0.09)"
        className="p-4 bg-white border border-slate-200/90 rounded-2xl shadow-sm hover:border-emerald-500/30 transition-all col-span-2 sm:col-span-1"
      >
        <div className="flex items-center justify-between text-[10px] font-mono text-slate-500 mb-2">
          <span className="font-bold">[05 // ACCURACY]</span>
          <span className="text-emerald-600 font-bold bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200/60">
            MRR 1.000
          </span>
        </div>

        <div className="text-2xl sm:text-3xl font-bold font-mono tracking-tight text-emerald-600">
          90.14%
        </div>

        <div className="text-[11px] text-slate-600 font-medium mt-1">GraphSAGE Inductive Test</div>

        <div className="w-full h-1 bg-slate-100 rounded-full mt-3 overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: '90.14%' }}
            transition={{ duration: 1, ease: 'easeOut' }}
            className="h-full bg-emerald-500"
          />
        </div>
      </SpotlightCard>
    </div>
  );
};
