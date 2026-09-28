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
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  ReferenceLine
} from 'recharts';
import { useAsyncState, AsyncStatus } from '../../hooks/useAsyncState';
import { LottieLoader } from '../ui/LottieLoader';
import { EmptyState } from '../ui/EmptyState';

export const PolicyBenchmark: React.FC<{ activeDataset?: string }> = ({ activeDataset }) => {
  const [threshold, setThreshold] = useState<number>(0.50);
  const [policyData, setPolicyData] = useState<PolicyTuneResult | null>(null);
  const [benchmarkData, setBenchmarkData] = useState<ThreeWayBenchmarkRow[]>([]);
  const [chartData, setChartData] = useState<any[]>([]);

  const { status, error, isOffline, run, retry } = useAsyncState<void>();

  useEffect(() => {
    const timerId = setTimeout(() => {
      run(async () => {
        const [currentPolicy, benchmarks] = await Promise.all([
          ApiService.tunePolicy(threshold, activeDataset),
          ApiService.getThreeWayBenchmark()
        ]);
        
        setPolicyData(currentPolicy);
        setBenchmarkData(benchmarks);
        
        // Fetch points for the chart, ensuring active threshold is included
        const basePoints = [0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9];
        const roundedT = Number(threshold.toFixed(2));
        const allPoints = Array.from(new Set([...basePoints, roundedT])).sort((a, b) => a - b);
        
        const chartPoints = await Promise.all(
          allPoints.map(async (t) => {
            const res = await ApiService.tunePolicy(t, activeDataset);
            return {
              rawThreshold: t,
              precision: Number(res.precision_percent.toFixed(1)),
              recall: Number(res.recall_percent.toFixed(1)),
              f1: Number(res.f1_score_percent.toFixed(1)),
            };
          })
        );
        setChartData(chartPoints);
      });
    }, 300);

    return () => clearTimeout(timerId);
  }, [threshold, activeDataset]);

  const getOperationalMode = (t: number) => {
    if (t <= 0.2) return { name: 'HIGH SENSITIVITY // ZERO TOLERANCE', color: 'text-amber-cash border-amber-500/50 bg-amber-500/10' };
    if (t <= 0.5) return { name: 'BALANCED TRIAGE // DEFAULT OPERATIONAL', color: 'text-neon-cyan border-cyan-500/50 bg-cyan-500/10' };
    if (t <= 0.8) return { name: 'HIGH PRECISION // STRICT EVIDENCE', color: 'text-acid-green border-green-500/50 bg-green-500/10' };
    return { name: 'CRITICAL ALERT // AUTOMATED FREEZE ACTION', color: 'text-crimson-alert border-red-500/50 bg-red-500/10' };
  };

  const mode = getOperationalMode(threshold);

  if (status === AsyncStatus.LOADING && !policyData) {
    return (
      <div className="p-12 flex justify-center items-center bg-white rounded-2xl border border-slate-200 shadow-saas-card">
        <LottieLoader status={status} label="Calibrating operational decision policy and benchmarks..." />
      </div>
    );
  }

  if (status === AsyncStatus.ERROR && !policyData) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-saas-card">
        <EmptyState
          variant={isOffline ? 'offline' : 'empty'}
          title={isOffline ? 'FastAPI Backend Offline' : 'Failed to Load Policy Benchmarks'}
          description={error || 'Unable to compute policy calibration curves.'}
          onRetry={retry}
        />
      </div>
    );
  }

  return (
    <div className="space-y-3 font-sans">
      {error && (
        <div className="bg-red-50 p-4 rounded-xl border border-red-200 text-red-700 flex items-center justify-between text-xs mb-3">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-red-500 shrink-0" />
            <span>Policy calibration update failed: {error}</span>
          </div>
          <button
            onClick={retry}
            className="px-3 py-1 bg-white border border-red-200 text-red-700 rounded-lg font-bold text-[11px] hover:bg-red-50 transition-colors shadow-xs"
          >
            Retry Calibration
          </button>
        </div>
      )}

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
                DYNAMIC TRIAGE CALIBRATION & WORKLOAD IMPACT (SIMULATED SWEEP)
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
          <div className="p-3 bg-white border border-slate-200 rounded-xl shadow-xs">
            <div className="text-[10px] text-slate-500 font-bold mb-1">PRECISION:</div>
            <div className="text-xl font-bold font-mono text-emerald-600">
              {policyData?.precision_percent != null ? `${policyData.precision_percent.toFixed(1)}%` : '—'}
            </div>
            <div className="text-[9px] text-slate-400 mt-1">TRUE POSITIVES / ALERTS</div>
          </div>

          <div className="p-3 bg-white border border-slate-200 rounded-xl shadow-xs">
            <div className="text-[10px] text-slate-500 font-bold mb-1">RECALL:</div>
            <div className="text-xl font-bold font-mono text-sky-600">
              {policyData?.recall_percent != null ? `${policyData.recall_percent.toFixed(1)}%` : '—'}
            </div>
            <div className="text-[9px] text-slate-400 mt-1">ILLICIT CAPTURE RATE</div>
          </div>

          <div className="p-3 bg-white border border-slate-200 rounded-xl shadow-xs">
            <div className="text-[10px] text-slate-500 font-bold mb-1">F1 OPTIMIZATION:</div>
            <div className="text-xl font-bold font-mono text-[#FF5500]">
              {policyData?.f1_score_percent != null ? `${policyData.f1_score_percent.toFixed(1)}%` : '—'}
            </div>
            <div className="text-[9px] text-slate-400 mt-1">HARMONIC MEAN</div>
          </div>

          <div className="p-3 bg-white border border-slate-200 rounded-xl shadow-xs">
            <div className="text-[10px] text-slate-500 font-bold mb-1">FALSE POSITIVES:</div>
            <div className="text-xl font-bold font-mono text-slate-800">
              {policyData?.false_positives != null ? `${policyData.false_positives} / ${policyData.total_eval_samples ?? 200}` : '—'}
            </div>
            <div className="text-[9px] text-amber-600 font-bold mt-1">SIMULATED FP ESTIMATE</div>
          </div>
        </div>

        {/* Precision / Recall Trade-off Chart */}
        <div className="h-64 w-full bg-white p-3 border border-slate-200 rounded-xl shadow-xs">
          <div className="text-[10px] text-slate-500 mb-2 font-bold flex items-center justify-between">
            <span className="uppercase tracking-wider">Precision / Recall / F1 Tradeoff Curve (Simulated Policy Sweep)</span>
            <span className="font-mono text-[#FF5500] font-bold">ACTIVE τ = {threshold.toFixed(2)}</span>
          </div>

          <ResponsiveContainer width="100%" height="88%">
            <LineChart data={chartData} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
              <CartesianGrid stroke="#E2E8F0" vertical={false} />
              <XAxis
                type="number"
                dataKey="rawThreshold"
                domain={[0.1, 0.9]}
                stroke="#64748B"
                tick={{ fill: '#64748B', fontSize: 10 }}
                tickFormatter={(val) => `τ=${Number(val).toFixed(2)}`}
                axisLine={{ stroke: '#CBD5E1' }}
              />
              <YAxis stroke="#64748B" tick={{ fill: '#64748B', fontSize: 10 }} domain={[0, 100]} unit="%" axisLine={{ stroke: '#CBD5E1' }} />
              <Tooltip
                content={({ active, payload, label }) => {
                  if (!active || !payload || !payload.length) return null;
                  return (
                    <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-lg text-xs space-y-1.5 min-w-[150px]">
                      <div className="font-bold text-slate-800 font-mono border-b border-slate-100 pb-1 flex items-center justify-between">
                        <span>Threshold</span>
                        <span className="text-[#FF5500]">τ={typeof label === 'number' ? label.toFixed(2) : label}</span>
                      </div>
                      {payload.map((entry, idx) => (
                        <div key={idx} className="flex items-center justify-between gap-3 text-[11px]">
                          <span className="flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
                            <span className="text-slate-600 font-medium">{entry.name}</span>
                          </span>
                          <span className="font-mono font-bold text-slate-900">{entry.value}%</span>
                        </div>
                      ))}
                    </div>
                  );
                }}
              />
              <Legend verticalAlign="top" align="right" height={24} iconType="circle" wrapperStyle={{ fontSize: 11, color: '#64748B' }} />
              <ReferenceLine
                x={threshold}
                stroke="#FF5500"
                strokeDasharray="3 3"
                strokeWidth={1.5}
                label={{ value: `τ=${threshold.toFixed(2)}`, position: 'top', fill: '#FF5500', fontSize: 10, fontWeight: 700 }}
              />
              <Line type="monotone" dataKey="precision" name="Precision" stroke="#10B981" strokeWidth={2} dot={{ r: 3, fill: '#10B981' }} activeDot={{ r: 5 }} />
              <Line type="monotone" dataKey="recall" name="Recall" stroke="#0284C7" strokeWidth={2} dot={{ r: 3, fill: '#0284C7' }} activeDot={{ r: 5 }} />
              <Line type="monotone" dataKey="f1" name="F1 Score" stroke="#FF5500" strokeWidth={2.5} dot={{ r: 3.5, fill: '#FF5500' }} activeDot={{ r: 6 }} />
            </LineChart>
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
            <thead className="bg-slate-50 border-b border-slate-200 text-[10px] text-slate-500 font-bold uppercase tracking-wider">
              <tr>
                <th className="p-3">DATASET BENCHMARK</th>
                <th className="p-3">EVALUATION TASK</th>
                <th className="p-3">XGBOOST BASELINE F1</th>
                <th className="p-3">GRAPHSAGE GNN F1</th>
                <th className="p-3">F1 DELTA (p-val)</th>
                <th className="p-3">PR-AUC</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {benchmarkData.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center">
                    <div className="flex flex-col items-center justify-center space-y-2 py-4">
                      <div className="p-3 bg-slate-100 rounded-2xl text-slate-400">
                        <Cpu className="w-6 h-6" />
                      </div>
                      <div className="font-bold text-slate-700 text-xs">No benchmark evaluations recorded yet</div>
                      <p className="text-[11px] text-slate-400 max-w-sm">
                        Benchmark evaluations are computed when holdout test suites run across multi-bank models.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                benchmarkData.map((row, i) => (
                  <tr key={i} className="hover:bg-slate-50 transition-colors">
                    <td className="p-3 font-bold text-slate-900">{row.dataset}</td>
                    <td className="p-3 text-slate-500 text-[10px]">{row.evaluation_task}</td>
                    <td className="p-3 text-slate-700">{row.xgboost_f1}</td>
                    <td className="p-3 text-neon-cyan font-bold text-glow-cyan">{row.graphsage_f1}</td>
                    <td className="p-3 text-acid-green font-bold">{row.f1_delta}</td>
                    <td className="p-3 text-amber-cash font-bold">{row.pr_auc}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="mt-3 p-2 bg-white border border-slate-200 text-[10px] text-slate-500 flex items-center justify-between">
          <span>TERMINAL PREDICTION MRR: <span className="text-emerald-600 font-bold">1.0 (TOP-1 CASH-OUT ACCURACY: 100.0%, n=101, avg 1.9 candidates)</span></span>
          <span className="text-slate-600 font-bold">ALL BENCHMARKS EVALUATED ON SYNTHETIC HOLDOUT SUITES</span>
        </div>
      </GlassCard>
    </div>
  );
};
