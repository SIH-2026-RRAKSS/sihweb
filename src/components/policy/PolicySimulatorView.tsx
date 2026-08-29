import React, { useState, useEffect } from 'react';
import {
  Sliders,
  Scale
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid
} from 'recharts';
import { PolicyTuneResult } from '../../types';
import { ApiService } from '../../services/api';
import { MOCK_POLICY_TABLE } from '../../services/mockData';

export const PolicySimulatorView: React.FC = () => {
  const [tauGraph, setTauGraph] = useState<number>(0.70); // Filter ring-level alerts
  const [tauNode, setTauNode] = useState<number>(0.85); // Immediate account freezing
  const [activeDataset, setActiveDataset] = useState<string>('synthetic');
  const [policyResult, setPolicyResult] = useState<PolicyTuneResult | null>(null);

  useEffect(() => {
    // API tune endpoint drives macro queue alerts (tauGraph)
    ApiService.tunePolicy(tauGraph, activeDataset).then(setPolicyResult);
  }, [tauGraph, activeDataset]);

  // Curve data
  const prCurveData = MOCK_POLICY_TABLE.map(p => ({
    threshold: `τ = ${p.threshold.toFixed(2)}`,
    tau: p.threshold,
    precision: p.precision_percent,
    recall: p.recall_percent,
    f1: p.f1_score_percent,
    alerts: p.alerts_generated
  }));

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-3">
        <div>
          <h2 className="text-base font-bold font-sans text-slate-900 uppercase tracking-wide flex items-center gap-2">
            <Sliders className="w-5 h-5 text-cyber-cyan" />
            Alert Threshold Calibration & Caseload Policy Simulator
          </h2>
          <p className="text-xs text-slate-500">
            Navigate the operational tradeoff between detection sensitivity (recall) and investigator caseload triage capacity.
          </p>
        </div>

        {/* Dataset selector */}
        <div className="flex items-center gap-2">
          <label className="text-xs font-sans text-slate-500">Policy Corpus:</label>
          <select
            value={activeDataset}
            onChange={(e) => setActiveDataset(e.target.value)}
            className="px-3 py-1.5 text-xs font-sans bg-white border border-slate-200 rounded-2xl text-cyber-cyan focus:border-cyber-cyan focus:outline-none"
          >
            <option value="synthetic">Dataset A: Synthetic Domestic (200 Holdout)</option>
            <option value="ibm">Dataset B: IBM AML Multi-Bank (200 Holdout)</option>
          </select>
        </div>
      </div>

      {/* Interactive Dial & Slider Card */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6 bg-gradient-to-r from-cyber-900 via-cyber-850 to-cyber-900 border-cyber-cyan/40 glow-cyan space-y-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="text-xs font-sans uppercase text-slate-500">
              Graph Alert Threshold (τ_graph)
            </div>
            <div className="text-3xl font-black font-sans text-cyber-cyan mt-1 flex items-baseline gap-2">
              τ_g = {tauGraph.toFixed(2)}
              <span className="text-xs font-semibold px-2 py-0.5 rounded bg-cyber-cyan/10 text-cyber-cyan border border-cyber-cyan/30">
                {policyResult?.policy_tier_name || 'BALANCED_TRIAGE'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4 text-xs font-sans">
            <div className="p-3 bg-white rounded-2xl border border-slate-200 text-center min-w-[120px]">
              <div className="text-[10px] text-slate-500 uppercase">Alert Caseload</div>
              <div className="text-lg font-bold text-amber-400">{policyResult?.alerts_generated || 44} / 200</div>
              <div className="text-[9px] text-slate-500">({policyResult?.alert_rate_percent || 22.0}% Rate)</div>
            </div>

            <div className="p-3 bg-white rounded-2xl border border-slate-200 text-center min-w-[120px]">
              <div className="text-[10px] text-slate-500 uppercase">Expected F1-Score</div>
              <div className="text-lg font-bold text-emerald-400">{policyResult?.f1_score_percent.toFixed(2) || '88.89'}%</div>
              <div className="text-[9px] text-slate-500">Harmonic Mean</div>
            </div>
          </div>
        </div>

        {/* Dual Sliders */}
        <div className="space-y-6 pt-2">
          {/* Tau Graph Slider */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-sans font-bold text-cyber-cyan">
              <span>Macro Alert Cutoff (τ_graph)</span>
              <span>{tauGraph.toFixed(2)}</span>
            </div>
            <input
              type="range"
              min="0.10"
              max="0.90"
              step="0.05"
              value={tauGraph}
              onChange={(e) => setTauGraph(parseFloat(e.target.value))}
              className="w-full h-2 bg-white rounded-2xl appearance-none cursor-pointer accent-cyber-cyan"
            />
            <div className="flex justify-between text-[10px] font-sans text-slate-500">
              <span>0.10 (High Sensitivity)</span>
              <span>0.90 (High Precision)</span>
            </div>
          </div>

          {/* Tau Node Slider */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-sans font-bold text-amber-400">
              <span>Account Freeze Cutoff (τ_node)</span>
              <span>{tauNode.toFixed(2)}</span>
            </div>
            <input
              type="range"
              min="0.50"
              max="0.99"
              step="0.01"
              value={tauNode}
              onChange={(e) => setTauNode(parseFloat(e.target.value))}
              className="w-full h-2 bg-white rounded-2xl appearance-none cursor-pointer accent-amber-400"
            />
            <div className="flex justify-between text-[10px] font-sans text-slate-500">
              <span>0.50 (Aggressive Freezing)</span>
              <span>0.99 (Conservative / Sure Bets)</span>
            </div>
          </div>
        </div>
      </div>

      {/* 4 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-4">
          <div className="text-[10px] font-sans text-slate-500 uppercase">Alert Precision</div>
          <div className="text-2xl font-bold font-sans text-emerald-400 mt-1">
            {policyResult?.precision_percent.toFixed(2) || '81.82'}%
          </div>
          <div className="text-[11px] text-slate-500 font-sans mt-1">
            {policyResult?.false_positives || 8} False Positives out of {policyResult?.alerts_generated || 44}
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-4">
          <div className="text-[10px] font-sans text-slate-500 uppercase">Laundering Recall</div>
          <div className="text-2xl font-bold font-sans text-cyber-cyan mt-1">
            {policyResult?.recall_percent.toFixed(2) || '97.30'}%
          </div>
          <div className="text-[11px] text-slate-500 font-sans mt-1">
            {policyResult?.true_positives || 36} of 37 Illicit Chains Caught
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-4">
          <div className="text-[10px] font-sans text-slate-500 uppercase">Investigation Workload</div>
          <div className="text-2xl font-bold font-sans text-amber-400 mt-1">
            {policyResult?.alert_rate_percent || 22.0}%
          </div>
          <div className="text-[11px] text-slate-500 font-sans mt-1">
            78.0% Benign Incidents Auto-Filtered
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-4">
          <div className="text-[10px] font-sans text-slate-500 uppercase">Recommended Policy Tier</div>
          <div className="text-sm font-bold font-sans text-purple-300 mt-2">
            {policyResult?.policy_tier_name || 'BALANCED_TRIAGE'}
          </div>
          <div className="text-[11px] text-slate-500 font-sans mt-1">
            Calibrated on Holdout Subgraphs
          </div>
        </div>
      </div>

      {/* Precision-Recall Curve Visualization */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-5 space-y-3">
        <div className="flex items-center justify-between border-b border-slate-200 pb-2.5">
          <h3 className="text-xs font-bold font-sans text-slate-800 uppercase flex items-center gap-2">
            <Scale className="w-4 h-4 text-cyber-cyan" />
            Precision vs Recall Tradeoff Across Decision Cutoffs (τ)
          </h3>
          <span className="text-[10px] font-sans text-slate-500">PR-AUC = 0.9782</span>
        </div>

        <div className="h-64 mt-2">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={prCurveData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" />
              <XAxis dataKey="threshold" stroke="#94A3B8" fontSize={10} fontFamily="monospace" />
              <YAxis domain={[50, 100]} stroke="#94A3B8" fontSize={10} fontFamily="monospace" />
              <Tooltip
                contentStyle={{ backgroundColor: '#0B0F17', borderColor: '#1E293B', borderRadius: '8px', fontSize: '11px', fontFamily: 'monospace' }}
              />
              <Line type="monotone" dataKey="precision" stroke="#10B981" strokeWidth={2.5} name="Precision (%)" />
              <Line type="monotone" dataKey="recall" stroke="#00F0FF" strokeWidth={2.5} name="Recall (%)" />
              <Line type="monotone" dataKey="f1" stroke="#F59E0B" strokeWidth={2} strokeDasharray="3 3" name="F1-Score (%)" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Pre-Evaluated Matrix Table */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-5 space-y-3">
        <div className="flex items-center justify-between border-b border-slate-200 pb-2.5">
          <h3 className="text-xs font-bold font-sans text-slate-800 uppercase">
            Operational Policy Calibration Matrix (Holdout N = 200)
          </h3>
          <span className="text-[10px] font-sans text-slate-500">Synthetic Ground Truth</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-sans">
            <thead className="bg-white text-slate-500 border-b border-slate-200 text-[10px] uppercase">
              <tr>
                <th className="py-2.5 px-3">Cutoff (τ)</th>
                <th className="py-2.5 px-3">Policy Tier</th>
                <th className="py-2.5 px-3">Alerts</th>
                <th className="py-2.5 px-3">Alert Rate</th>
                <th className="py-2.5 px-3">Precision</th>
                <th className="py-2.5 px-3">Recall</th>
                <th className="py-2.5 px-3">F1-Score</th>
                <th className="py-2.5 px-3">TP / FP</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-cyber-800">
              {MOCK_POLICY_TABLE.map((row) => {
                const isSelected = Math.abs(row.threshold - tauGraph) < 0.04;
                return (
                  <tr
                    key={row.threshold}
                    className={`transition-colors ${isSelected ? 'bg-cyber-cyan/15 text-cyber-cyan font-bold' : 'hover:bg-slate-50 text-slate-700'}`}
                  >
                    <td className="py-2.5 px-3">τ = {row.threshold.toFixed(2)}</td>
                    <td className="py-2.5 px-3">{row.policy_tier_name}</td>
                    <td className="py-2.5 px-3">{row.alerts_generated}</td>
                    <td className="py-2.5 px-3">{row.alert_rate_percent}%</td>
                    <td className="py-2.5 px-3 text-emerald-400">{row.precision_percent.toFixed(1)}%</td>
                    <td className="py-2.5 px-3 text-cyan-300">{row.recall_percent.toFixed(1)}%</td>
                    <td className="py-2.5 px-3 text-amber-400 font-bold">{row.f1_score_percent.toFixed(1)}%</td>
                    <td className="py-2.5 px-3">{row.true_positives} / {row.false_positives}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
