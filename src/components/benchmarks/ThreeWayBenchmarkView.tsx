import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  Award,
  Database
} from 'lucide-react';
import { ThreeWayBenchmarkRow } from '../../types';
import { ApiService } from '../../services/api';

export const ThreeWayBenchmarkView: React.FC = () => {
  const [rows, setRows] = useState<ThreeWayBenchmarkRow[]>([]);

  useEffect(() => {
    ApiService.getThreeWayBenchmarks().then(setRows);
  }, []);

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-cyber-700 pb-3">
        <div>
          <h2 className="text-base font-bold font-mono text-slate-100 uppercase tracking-wide flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-purple-400" />
            Global 3-Way Multi-Dataset Architecture Benchmark
          </h2>
          <p className="text-xs text-slate-400">
            Multi-seed empirical comparison demonstrating inductive Graph Neural Network generalization across distinct topologies.
          </p>
        </div>

        <span className="px-3 py-1 text-xs font-mono font-bold bg-purple-500/10 text-purple-300 border border-purple-500/30 rounded-2xl">
          Inductive GraphSAGE vs XGBoost
        </span>
      </div>

      {/* 3 Dataset Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Dataset A */}
        <div className="cyber-card p-5 space-y-3.5 border-cyber-cyan/40 glow-cyan">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-cyber-cyan bg-cyber-cyan/10 px-2 py-0.5 rounded border border-cyber-cyan/30">
              Dataset A (Synthetic)
            </span>
            <span className="text-[10px] font-mono text-emerald-400 font-bold">p = 0.0231 &lt; 0.05</span>
          </div>

          <div>
            <h3 className="text-sm font-bold font-mono text-slate-100">
              Domestic Cybercrime Subgraphs
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              1,000 subgraphs with 15 Indian cities GPS and ATM hardware IDs.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-cyber-800 font-mono text-center">
            <div className="p-2 bg-cyber-950 rounded">
              <div className="text-[9px] text-slate-500 uppercase">XGBoost Baseline</div>
              <div className="text-xs font-bold text-slate-300">86.98% ± 2.28%</div>
            </div>
            <div className="p-2 bg-cyber-950 rounded border border-cyber-cyan/30">
              <div className="text-[9px] text-cyber-cyan uppercase">GraphSAGE GNN</div>
              <div className="text-xs font-bold text-cyber-cyan">90.66% ± 1.58%</div>
            </div>
          </div>

          <div className="p-2.5 bg-emerald-500/10 border border-emerald-500/30 rounded text-[11px] font-mono text-emerald-300 flex items-center gap-1.5">
            <Award className="w-3.5 h-3.5 flex-shrink-0" />
            <span>F1 Gain: +3.69% (Statistically Significant)</span>
          </div>
        </div>

        {/* Dataset B */}
        <div className="cyber-card p-5 space-y-3.5 border-purple-500/40">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded border border-purple-500/30">
              Dataset B (IBM AML HI-Small)
            </span>
            <span className="text-[10px] font-mono text-emerald-400 font-bold">Latency: 3.40ms</span>
          </div>

          <div>
            <h3 className="text-sm font-bold font-mono text-slate-100">
              Multi-Bank Ledger Transactions
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Empirical GraphSAGE benchmark on IBM AML HI-Small dataset.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-cyber-800 font-mono text-center">
            <div className="p-2 bg-cyber-950 rounded">
              <div className="text-[9px] text-slate-500 uppercase">ROC-AUC</div>
              <div className="text-xs font-bold text-slate-300">0.9456</div>
            </div>
            <div className="p-2 bg-cyber-950 rounded border border-purple-500/30">
              <div className="text-[9px] text-purple-300 uppercase">F1-Score</div>
              <div className="text-xs font-bold text-purple-300">62.92%</div>
            </div>
          </div>

          <div className="p-2.5 bg-purple-500/10 border border-purple-500/30 rounded text-[11px] font-mono text-purple-300 flex items-center gap-1.5 justify-between">
            <div className="flex items-center gap-1.5">
              <Award className="w-3.5 h-3.5 flex-shrink-0" />
              <span>Precision: 58.14%</span>
            </div>
            <span>Recall: 68.56%</span>
          </div>
        </div>

        {/* Dataset C */}
        <div className="cyber-card p-5 space-y-3.5 border-slate-700">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/30">
              Dataset C (Elliptic)
            </span>
            <span className="text-[10px] font-mono text-slate-400">Temporal Benchmark</span>
          </div>

          <div>
            <h3 className="text-sm font-bold font-mono text-slate-100">
              Bitcoin Transaction DAG
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              203,769 transaction nodes, 234,355 payment edges (Temporal Split).
            </p>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-cyber-800 font-mono text-center">
            <div className="p-2 bg-cyber-950 rounded">
              <div className="text-[9px] text-slate-500 uppercase">Test Illicit Rate</div>
              <div className="text-xs font-bold text-slate-300">6.50% (1,083 / 16.6k)</div>
            </div>
            <div className="p-2 bg-cyber-950 rounded border border-amber-500/30">
              <div className="text-[9px] text-amber-400 uppercase">GraphSAGE F1</div>
              <div className="text-xs font-bold text-amber-400">46.44% ± 2.52%</div>
            </div>
          </div>

          <div className="p-2.5 bg-amber-500/10 border border-amber-500/30 rounded text-[11px] font-mono text-amber-300 flex items-center gap-1.5">
            <span>Inductive DAG Baseline Established</span>
          </div>
        </div>
      </div>

      {/* Detailed Benchmark Matrix Table */}
      <div className="cyber-card p-5 space-y-3">
        <div className="flex items-center justify-between border-b border-cyber-700 pb-2.5">
          <h3 className="text-xs font-bold font-mono text-slate-200 uppercase flex items-center gap-2">
            <Database className="w-4 h-4 text-cyber-cyan" />
            Standardized Three-Way Multi-Dataset Benchmark Matrix
          </h3>
          <span className="text-[10px] font-mono text-slate-400">5 Random Seeds (Mean ± Std)</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-cyber-950 text-slate-400 border-b border-cyber-800 text-[10px] uppercase">
              <tr>
                <th className="py-3 px-3">Dataset Corpus</th>
                <th className="py-3 px-3">Evaluation Task</th>
                <th className="py-3 px-3">Test Size (N_test)</th>
                <th className="py-3 px-3">XGBoost Baseline</th>
                <th className="py-3 px-3">GraphSAGE GNN</th>
                <th className="py-3 px-3">Statistical Delta (Δ)</th>
                <th className="py-3 px-3">PR-AUC</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-cyber-800 text-slate-200">
              {rows.map((row) => (
                <tr key={row.dataset} className="hover:bg-cyber-800/40 transition-colors">
                  <td className="py-3 px-3 font-bold text-cyber-cyan">{row.dataset}</td>
                  <td className="py-3 px-3 text-slate-300">{row.evaluation_task}</td>
                  <td className="py-3 px-3 text-slate-400">{row.sample_size}</td>
                  <td className="py-3 px-3">{row.xgboost_f1}</td>
                  <td className="py-3 px-3 text-emerald-400 font-bold">{row.graphsage_f1}</td>
                  <td className="py-3 px-3 font-semibold text-purple-300">{row.f1_delta}</td>
                  <td className="py-3 px-3 text-amber-400 font-bold">{row.pr_auc}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
