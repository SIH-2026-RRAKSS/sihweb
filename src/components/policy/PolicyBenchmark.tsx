import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  SlidersHorizontal,
  ShieldCheck,
  TrendingUp,
  AlertTriangle,
  FileSpreadsheet,
  CheckCircle,
  Database,
  Cpu
} from 'lucide-react';
import { GlassCard } from '../ui/GlassCard';
import { KPICard } from '../ui/KPICard';
import { ApiService } from '../../services/api';
import { PolicyTuneResult, ThreeWayBenchmarkRow } from '../../types';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';

export const PolicyBenchmark: React.FC = () => {
  const [threshold, setThreshold] = useState<number>(0.50);
  const [policyData, setPolicyData] = useState<PolicyTuneResult | null>(null);
  const [benchmarkData, setBenchmarkData] = useState<ThreeWayBenchmarkRow[]>([]);
  const [chartData, setChartData] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [currentPolicy, benchmarks] = await Promise.all([
          ApiService.tunePolicy(threshold),
          ApiService.getThreeWayBenchmark()
        ]);
        
        setPolicyData(currentPolicy);
        setBenchmarkData(benchmarks);
        
        // Fetch points for the chart
        const points = [0.1, 0.3, 0.5, 0.7, 0.8, 0.9];
        const chartPoints = await Promise.all(
          points.map(async (t) => {
            const res = await ApiService.tunePolicy(t);
            return {
              threshold: `τ=${t.toFixed(1)}`,
              precision: Number(res.precision_percent.toFixed(1)),
              recall: Number(res.recall_percent.toFixed(1)),
              f1: Number(res.f1_score_percent.toFixed(1)),
            };
          })
        );
        setChartData(chartPoints);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [threshold]);

  const getOperationalMode = (t: number) => {
    if (t <= 0.2) return { name: 'HIGH SENSITIVITY // ZERO TOLERANCE', color: 'text-amber-cash border-amber-500/50 bg-amber-500/10' };
    if (t <= 0.5) return { name: 'BALANCED TRIAGE // DEFAULT OPERATIONAL', color: 'text-neon-cyan border-cyan-500/50 bg-cyan-500/10' };
    if (t <= 0.8) return { name: 'HIGH PRECISION // STRICT EVIDENCE', color: 'text-acid-green border-green-500/50 bg-green-500/10' };
    return { name: 'CRITICAL ALERT // AUTOMATED FREEZE ACTION', color: 'text-crimson-alert border-red-500/50 bg-red-500/10' };
  };

  const mode = getOperationalMode(threshold);

  return (
    <div className="space-y-3 font-sans">
      {/* ── SECTION A: TACTICAL THRESHOLD CONSOLE ── */}
      <GlassCard padding="md" glow="cyan">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-cyan-500/30 pb-2.5 mb-4">
          <div className="flex items-center gap-2">
            <div className="p-1 border border-cyan-500 bg-cyan-500/10 text-neon-cyan">
              <SlidersHorizontal className="w-4 h-4" />
            </div>
            <div>
              <div className="font-sans text-xs font-black tracking-wider text-neon-cyan text-glow-cyan">
                OPERATIONAL THRESHOLD POLICY CONSOLE (τ)
              </div>
              <div className="text-[9px] text-slate-500">
                DYNAMIC TRIAGE CALIBRATION & WORKLOAD IMPACT
              </div>
            </div>
          </div>

          <div className={`px-2.5 py-1 border font-sans text-[10px] font-bold ${mode.color}`}>
            {mode.name}
          </div>
        </div>

        {/* Threshold Slider Slider Control */}
        <div className="space-y-2 mb-6">
          <div className="flex justify-between text-xs font-bold">
            <span className="text-slate-700">POLICY DECISION THRESHOLD:</span>
            <span className="text-neon-cyan text-sm text-glow-cyan font-sans">τ = {threshold.toFixed(2)}</span>
          </div>

          <input
            type="range"
            min="0.10"
            max="0.90"
            step="0.05"
            value={threshold}
            onChange={(e) => setThreshold(Number(e.target.value))}
            className="w-full h-2 bg-white border border-slate-200 rounded-none appearance-none accent-neon-cyan cursor-pointer"
          />

          <div className="flex justify-between text-[9px] text-slate-500 font-sans">
            <span>0.10 (MAX RECALL)</span>
            <span>0.50 (BALANCED)</span>
            <span>0.90 (MAX PRECISION)</span>
          </div>
        </div>

        {/* Live Metrics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-6">
          <div className="p-3 bg-white border border-slate-200">
            <div className="text-[10px] text-slate-500 mb-1">PRECISION:</div>
            <div className="text-xl font-bold text-neon-cyan">
              {policyData ? `${policyData.precision_percent.toFixed(1)}%` : '--'}
            </div>
            <div className="text-[8px] text-slate-500 mt-1">TRUE POSITIVES / ALERTS</div>
          </div>

          <div className="p-3 bg-white border border-slate-200">
            <div className="text-[10px] text-slate-500 mb-1">RECALL:</div>
            <div className="text-xl font-bold text-acid-green">
              {policyData ? `${policyData.recall_percent.toFixed(1)}%` : '--'}
            </div>
            <div className="text-[8px] text-slate-500 mt-1">ILLICIT CAPTURE RATE</div>
          </div>

          <div className="p-3 bg-white border border-slate-200">
            <div className="text-[10px] text-slate-500 mb-1">F1 OPTIMIZATION:</div>
            <div className="text-xl font-bold text-amber-cash">
              {policyData ? `${policyData.f1_score_percent.toFixed(1)}%` : '--'}
            </div>
            <div className="text-[8px] text-slate-500 mt-1">HARMONIC MEAN</div>
          </div>

          <div className="p-3 bg-white border border-slate-200">
            <div className="text-[10px] text-slate-500 mb-1">FALSE POSITIVES:</div>
            <div className="text-xl font-bold text-crimson-alert">
              {policyData ? `${policyData.false_positives} / 200` : '--'}
            </div>
            <div className="text-[8px] text-slate-500 mt-1">UNNECESSARY FREEZES</div>
          </div>
        </div>

        {/* Precision / Recall Trade-off Chart */}
        <div className="h-52 w-full bg-white p-2 border border-slate-200">
          <div className="text-[10px] text-slate-500 mb-2 font-bold flex items-center justify-between">
            <span>PRECISION / RECALL / F1 TRADEOFF CURVE (RECHARTS)</span>
            <span className="text-neon-cyan">τ RANGE: 0.10 - 0.90</span>
          </div>

          <ResponsiveContainer width="100%" height="85%">
            <AreaChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#18253d" />
              <XAxis dataKey="threshold" stroke="#64748b" tick={{ fontSize: 9 }} />
              <YAxis stroke="#64748b" tick={{ fontSize: 9 }} domain={[60, 100]} />
              <Tooltip
                contentStyle={{ backgroundColor: '#05070b', borderColor: '#00E5FF', fontSize: 10 }}
              />
              <Area type="monotone" dataKey="precision" name="Precision %" stroke="#00E5FF" fill="#00E5FF" fillOpacity={0.15} />
              <Area type="monotone" dataKey="recall" name="Recall %" stroke="#00FF9D" fill="#00FF9D" fillOpacity={0.1} />
              <Area type="monotone" dataKey="f1" name="F1 Score %" stroke="#FFB000" fill="#FFB000" fillOpacity={0.1} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </GlassCard>

      {/* ── SECTION B: 3-WAY MULTI-DATASET BENCHMARK ── */}
      <GlassCard padding="md" glow="cyan">
        <div className="flex items-center gap-2 border-b border-cyan-500/30 pb-2 mb-3">
          <div className="p-1 border border-cyan-500 bg-cyan-500/10 text-neon-cyan">
            <Cpu className="w-4 h-4" />
          </div>
          <div>
            <div className="font-sans text-xs font-black tracking-wider text-neon-cyan text-glow-cyan">
              3-WAY BENCHMARK EVALUATION MATRIX (STAGE 7)
            </div>
            <div className="text-[9px] text-slate-500">
              SYNTHETIC TYPOLOGY VS IBM AML MULTI-BANK VS ELLIPTIC BITCOIN DAG
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-sans">
            <thead className="bg-white border-b border-cyan-500/30 text-[10px] text-slate-500">
              <tr>
                <th className="p-3">DATASET BENCHMARK</th>
                <th className="p-3">EVALUATION TASK</th>
                <th className="p-3">XGBOOST BASELINE F1</th>
                <th className="p-3">GRAPHSAGE GNN F1</th>
                <th className="p-3">F1 DELTA (p-val)</th>
                <th className="p-3">PR-AUC</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80 bg-white">
              {benchmarkData.map((row, i) => (
                <tr key={i} className="hover:bg-slate-50 transition-colors">
                  <td className="p-3 font-bold text-slate-900">{row.dataset}</td>
                  <td className="p-3 text-slate-500 text-[10px]">{row.evaluation_task}</td>
                  <td className="p-3 text-slate-700">{row.xgboost_f1}</td>
                  <td className="p-3 text-neon-cyan font-bold text-glow-cyan">{row.graphsage_f1}</td>
                  <td className="p-3 text-acid-green font-bold">{row.f1_delta}</td>
                  <td className="p-3 text-amber-cash font-bold">{row.pr_auc}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-3 p-2 bg-white border border-slate-200 text-[10px] text-slate-500 flex items-center justify-between">
          <span>TERMINAL PREDICTION MRR: <span className="text-acid-green font-bold">1.0000 (TOP-1 CASH-OUT ACCURACY: 100.0%)</span></span>
          <span className="text-amber-cash font-bold">ALL BENCHMARKS EVALUATED ON SYNTHETIC HOLDOUT SUITES</span>
        </div>
      </GlassCard>
    </div>
  );
};
