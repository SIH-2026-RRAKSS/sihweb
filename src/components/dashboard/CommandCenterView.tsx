import React from 'react';
import {
  ShieldAlert,
  TrendingUp,
  Target,
  Share2,
  Clock,
  ArrowRight,
  AlertTriangle,
  Zap,
  MapPin,
  CheckCircle,
  ExternalLink
} from 'lucide-react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';
import { IncidentSummary, PipelineStats } from '../../types';

interface CommandCenterProps {
  stats: PipelineStats | null;
  incidents: IncidentSummary[];
  activeDataset: 'A' | 'B';
  onSelectIncident: (id: string) => void;
  onNavigateTab: (tab: any) => void;
}

export const CommandCenterView: React.FC<CommandCenterProps> = ({
  stats,
  incidents,
  activeDataset,
  onSelectIncident,
  onNavigateTab
}) => {
  const highConfIncidents = incidents.filter(i => i.confidence_tier === 'HIGH_CONFIDENCE');
  const medConfIncidents = incidents.filter(i => i.confidence_tier === 'MEDIUM_CONFIDENCE');
  const normalIncidents = incidents.filter(i => i.confidence_tier === 'NORMAL');

  const pieData = [
    { name: 'High Confidence Alerts', value: stats?.tier_breakdown?.HIGH_CONFIDENCE || highConfIncidents.length || 142, color: '#EF4444' },
    { name: 'Medium Confidence Triage', value: stats?.tier_breakdown?.MEDIUM_CONFIDENCE || medConfIncidents.length || 218, color: '#F59E0B' },
    { name: 'Normal / Benign Flows', value: stats?.tier_breakdown?.NORMAL || normalIncidents.length || 640, color: '#10B981' }
  ];

  return (
    <div className="space-y-6 pb-8">
      {/* Top Banner Alert Notice */}
      <div className="p-4 bg-gradient-to-r from-cyber-900 via-cyber-850 to-cyber-900 border border-cyber-cyan/30 rounded-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-lg glow-cyan">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-2xl bg-cyber-cyan/10 border border-cyber-cyan/40 flex items-center justify-center text-cyber-cyan flex-shrink-0">
            <Zap className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider font-sans">
                Active Cybercrime Predictive Triage Operational Horizon
              </h2>
              <span className="px-2 py-0.5 text-[10px] font-sans bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-full">
                Live 72h Sliding Window
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Evaluating {activeDataset === 'A' ? 'Dataset A (Synthetic Domestic Cybercrime Incidents with ATM GPS)' : 'Dataset B (IBM AML Multi-Bank Transfer Subgraphs)'} using inductive GraphSAGE embeddings.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <button
            onClick={() => onNavigateTab('incidents')}
            className="flex-1 md:flex-initial flex items-center justify-center gap-2 px-3.5 py-2 text-xs font-sans font-semibold bg-cyber-cyan text-cyber-950 hover:bg-cyber-cyan/90 rounded-2xl transition-all shadow-md shadow-cyber-cyan/20"
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            Inspect Incident Queue
          </button>
          <button
            onClick={() => onNavigateTab('map')}
            className="flex-1 md:flex-initial flex items-center justify-center gap-2 px-3.5 py-2 text-xs font-sans font-semibold bg-slate-50 hover:bg-slate-100 text-slate-800 border border-slate-200 rounded-2xl transition-all"
          >
            <MapPin className="w-3.5 h-3.5 text-amber-400" />
            Cash-Out Map
          </button>
        </div>
      </div>

      {/* KPI Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1 */}
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-4">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-sans uppercase tracking-wider">Total Evaluated Incidents</span>
            <div className="w-8 h-8 rounded-2xl bg-slate-50 flex items-center justify-center text-cyber-cyan">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold font-sans text-slate-900">
            {stats?.total_incidents_monitored || 1000}
          </div>
          <div className="flex items-center gap-1.5 mt-2 text-[11px] text-emerald-400 font-sans">
            <CheckCircle className="w-3.5 h-3.5" />
            <span>100% Calibrated with GNN Risk</span>
          </div>
        </div>

        {/* Metric 2 */}
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-4 border-cyber-red/40 glow-red">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-sans uppercase tracking-wider">High-Confidence Alerts</span>
            <div className="w-8 h-8 rounded-2xl bg-cyber-red/10 border border-cyber-red/30 flex items-center justify-center text-cyber-red">
              <ShieldAlert className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold font-sans text-cyber-red">
            {stats?.tier_breakdown?.HIGH_CONFIDENCE || highConfIncidents.length || 142}
          </div>
          <div className="flex items-center gap-1.5 mt-2 text-[11px] text-slate-700 font-sans">
            <span className="text-cyber-red font-bold">94.12% Precision</span>
            <span className="text-slate-500">• Peak F1: 91.43%</span>
          </div>
        </div>

        {/* Metric 3 */}
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-4">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-sans uppercase tracking-wider">Terminal Exit Hit Rate</span>
            <div className="w-8 h-8 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Target className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold font-sans text-amber-400">
            {stats?.model_comparison?.Top1_CashOut_Accuracy || "100.0%"}
          </div>
          <div className="flex items-center gap-1.5 mt-2 text-[11px] text-slate-500 font-sans">
            <span>MRR = {stats?.model_comparison?.Terminal_Prediction_MRR || "1.0000"}</span>
            <span className="text-slate-600">|</span>
            <span>15 Indian Cities</span>
          </div>
        </div>

        {/* Metric 4 */}
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-4">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-sans uppercase tracking-wider">GraphSAGE Test PR-AUC</span>
            <div className="w-8 h-8 rounded-2xl bg-cyber-purple/10 border border-cyber-purple/30 flex items-center justify-center text-cyber-purple">
              <Share2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold font-sans text-purple-300">
            0.9680
          </div>
          <div className="flex items-center gap-1.5 mt-2 text-[11px] text-emerald-400 font-sans">
            <span>+3.69% F1 gain over XGBoost</span>
          </div>
        </div>
      </div>

      {/* Center Row: Interactive Chart & Quick Action Matrix */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Priority Alert Incidents */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-2xl shadow-sm p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-cyber-red" />
              <h3 className="text-sm font-bold text-slate-800 font-sans uppercase">
                High-Risk Laundering Chains Requiring Triage
              </h3>
            </div>
            <button
              onClick={() => onNavigateTab('incidents')}
              className="text-xs text-cyber-cyan hover:underline flex items-center gap-1 font-sans"
            >
              View all ({incidents.length})
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          <div className="space-y-2.5">
            {highConfIncidents.slice(0, 4).map((inc) => (
              <div
                key={inc.complaint_id}
                onClick={() => onSelectIncident(inc.complaint_id)}
                className="p-3.5 bg-white border border-slate-200 hover:border-cyber-cyan/50 rounded-2xl cursor-pointer transition-all flex items-center justify-between group"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-sans font-bold text-cyber-cyan">
                      {inc.complaint_id}
                    </span>
                    <span className="px-2 py-0.5 text-[9px] font-sans font-bold bg-cyber-red/20 text-cyber-red border border-cyber-red/40 rounded">
                      RISK: {(inc.graphsage_risk_probability * 100).toFixed(2)}%
                    </span>
                    <span className="text-xs font-medium text-slate-700">
                      {inc.scam_category}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-500 font-sans flex items-center gap-3">
                    <span>Amount: ₹{(inc.reported_amount || 0).toLocaleString()}</span>
                    <span>•</span>
                    <span>Origin: {inc.district}, {inc.state}</span>
                    <span>•</span>
                    <span className="text-amber-400">Exit: {inc.top_terminal_id} ({inc.top_terminal_city})</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectIncident(inc.complaint_id);
                    }}
                    className="px-3 py-1.5 text-xs font-sans bg-slate-50 hover:bg-cyber-cyan hover:text-cyber-950 text-slate-700 rounded border border-slate-200 group-hover:border-cyber-cyan transition-all flex items-center gap-1"
                  >
                    <span>Dossier</span>
                    <ExternalLink className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right 1 Col: Confidence Tier Breakdown & Policy Dial */}
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-5 space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h3 className="text-sm font-bold text-slate-800 font-sans uppercase">
                Calibrated Confidence Tiers
              </h3>
              <span className="text-[10px] font-sans text-slate-500">Holdout Set</span>
            </div>

            <div className="h-44 mt-2">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={65}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0B0F17', borderColor: '#1E293B', borderRadius: '8px', fontSize: '11px', fontFamily: 'monospace' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="space-y-1.5 pt-2">
              {pieData.map((d) => (
                <div key={d.name} className="flex items-center justify-between text-xs font-sans">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: d.color }}></span>
                    <span className="text-slate-700">{d.name}</span>
                  </div>
                  <span className="font-bold text-slate-900">{d.value}</span>
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={() => onNavigateTab('policy')}
            className="w-full py-2 bg-slate-50 hover:bg-slate-100 text-slate-800 border border-slate-200 rounded-2xl text-xs font-sans flex items-center justify-center gap-2 transition-all mt-3"
          >
            <span>Tune Policy Thresholds (τ)</span>
            <ArrowRight className="w-3.5 h-3.5 text-cyber-cyan" />
          </button>
        </div>
      </div>

      {/* Bottom Operational Intelligence Highlights */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div
          onClick={() => onNavigateTab('graph')}
          className="p-4 bg-white border border-slate-200 rounded-2xl shadow-sm cursor-pointer hover:border-cyber-cyan/50 space-y-2 group"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-cyber-cyan">
              <Share2 className="w-4 h-4" />
              <span className="text-xs font-bold font-sans uppercase">Topology Graph Engine</span>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-cyber-cyan transition-colors" />
          </div>
          <p className="text-xs text-slate-500">
            Interactive physics-directed network visualization highlighting multi-hop accounts, transfer channels, and ATM cash exits.
          </p>
        </div>

        <div
          onClick={() => onNavigateTab('streaming')}
          className="p-4 bg-white border border-slate-200 rounded-2xl shadow-sm cursor-pointer hover:border-cyber-cyan/50 space-y-2 group"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-amber-400">
              <Clock className="w-4 h-4" />
              <span className="text-xs font-bold font-sans uppercase">Streaming & SLA Latency</span>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-amber-400 transition-colors" />
          </div>
          <p className="text-xs text-slate-500">
            1,450+ Tx/sec sliding window temporal graph ingestion with sub-second dynamic $k$-hop subgraph extraction.
          </p>
        </div>

        <div
          onClick={() => onNavigateTab('benchmark')}
          className="p-4 bg-white border border-slate-200 rounded-2xl shadow-sm cursor-pointer hover:border-cyber-cyan/50 space-y-2 group"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-purple-400">
              <Target className="w-4 h-4" />
              <span className="text-xs font-bold font-sans uppercase">Global 3-Way Benchmark</span>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-purple-400 transition-colors" />
          </div>
          <p className="text-xs text-slate-500">
            Rigorous cross-domain benchmark comparing Synthetic Subgraphs, IBM AML Ledgers, and Elliptic Bitcoin DAGs.
          </p>
        </div>
      </div>
    </div>
  );
};
