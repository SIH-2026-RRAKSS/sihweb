import React, { useState, useEffect } from 'react';
import {
  Cpu,
  Layers,
  Activity,
  GitBranch,
  Play,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  TrendingUp,
  Database,
  BarChart3,
  Sliders,
  Sparkles
} from 'lucide-react';
import { ApiService } from '../../services/api';
import { GraphSnapshot } from '../../types';
import { ModelRegistryView } from './ModelRegistryView';

export const MlOpsDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'SNAPSHOTS' | 'REGISTRY'>('SNAPSHOTS');
  const [snapshots, setSnapshots] = useState<GraphSnapshot[]>([]);
  const [loading, setLoading] = useState(true);
  const [isRetraining, setIsRetraining] = useState(false);
  const [retrainProgress, setRetrainProgress] = useState(0);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Retrain modal params
  const [showRetrainModal, setShowRetrainModal] = useState(false);
  const [epochs, setEpochs] = useState(150);
  const [learningRate, setLearningRate] = useState('0.001');
  const [datasetChoice, setDatasetChoice] = useState('SYNTHETIC_A');

  const fetchSnapshots = async () => {
    try {
      setLoading(true);
      const data = await ApiService.getGraphSnapshots();
      setSnapshots(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSnapshots();
  }, []);

  const handleStartRetrain = async () => {
    setShowRetrainModal(false);
    setIsRetraining(true);
    setRetrainProgress(10);

    const interval = setInterval(() => {
      setRetrainProgress((prev) => (prev < 90 ? prev + 12 : prev));
    }, 400);

    try {
      const res = await ApiService.triggerRetraining({
        epochs,
        learningRate: parseFloat(learningRate),
        dataset: datasetChoice,
      });

      clearInterval(interval);
      setRetrainProgress(100);
      setSuccessMessage(`GraphSAGE Retraining Completed! Candidate model version ${res.candidateVersion} registered.`);
      setTimeout(() => setSuccessMessage(null), 6000);
      fetchSnapshots();
    } catch (err) {
      clearInterval(interval);
      console.error(err);
    } finally {
      setTimeout(() => {
        setIsRetraining(false);
        setRetrainProgress(0);
      }, 800);
    }
  };

  return (
    <div className="space-y-4 font-sans text-xs">
      {/* ── ALERTS & RETRAINING PROGRESS ── */}
      {successMessage && (
        <div className="bg-emerald-50 border border-emerald-300 text-emerald-800 px-4 py-2.5 rounded-2xl flex items-center gap-2 font-medium shadow-sm animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {isRetraining && (
        <div className="bg-white border border-[#FF5500]/30 p-4 rounded-2xl shadow-saas-card space-y-2 animate-fadeIn">
          <div className="flex items-center justify-between text-xs font-bold text-slate-800">
            <span className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#FF5500] animate-spin" />
              <span>Training 2-Hop GraphSAGE Architecture on GPU Cluster (Epochs: {epochs})...</span>
            </span>
            <span className="font-mono text-[#FF5500]">{retrainProgress}%</span>
          </div>
          <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
            <div
              className="bg-gradient-to-r from-orange-500 to-[#FF5500] h-full transition-all duration-300"
              style={{ width: `${retrainProgress}%` }}
            />
          </div>
        </div>
      )}

      {/* ── HEADER BANNER ── */}
      <div className="bg-white border border-slate-200 p-4 rounded-2xl flex flex-wrap items-center justify-between gap-3 shadow-saas-card">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-orange-50 border border-orange-200 rounded-xl text-[#FF5500]">
            <Cpu className="w-5 h-5" />
          </div>
          <div>
            <div className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <span>MLOPS OPS CENTER & GRAPH GOVERNANCE</span>
              <span className="text-[10px] bg-orange-100 text-[#FF5500] font-bold px-2 py-0.5 rounded-full border border-orange-200">
                CONTINUOUS LEARNING
              </span>
            </div>
            <div className="text-[11px] text-slate-500">
              Graph snapshot versioning, concept drift monitoring, and active GraphSAGE model retraining pipeline
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowRetrainModal(true)}
            disabled={isRetraining}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-[#FF5500] hover:bg-orange-600 text-white font-bold rounded-xl shadow-sm transition-all disabled:opacity-50"
          >
            <Play className="w-4 h-4" />
            <span>TRIGGER RETRAINING</span>
          </button>

          <button
            onClick={fetchSnapshots}
            className="p-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-slate-600 transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* ── TABS SELECTOR ── */}
      <div className="bg-white border border-slate-200 p-2.5 rounded-2xl flex items-center justify-between shadow-saas-card">
        <div className="flex border border-slate-200 bg-slate-50 rounded-xl p-1 text-xs">
          <button
            onClick={() => setActiveTab('SNAPSHOTS')}
            className={`flex items-center gap-2 px-4 py-1.5 rounded-lg font-bold transition-colors ${
              activeTab === 'SNAPSHOTS'
                ? 'bg-white text-slate-900 shadow-sm border border-slate-200/60'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Database className="w-4 h-4" />
            <span>Graph Snapshots & Drift ({snapshots.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('REGISTRY')}
            className={`flex items-center gap-2 px-4 py-1.5 rounded-lg font-bold transition-colors ${
              activeTab === 'REGISTRY'
                ? 'bg-white text-slate-900 shadow-sm border border-slate-200/60'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Model Registry & Governance</span>
          </button>
        </div>
      </div>

      {/* ── TAB 1: SNAPSHOTS & DRIFT ── */}
      {activeTab === 'SNAPSHOTS' && (
        <div className="space-y-4">
          {/* Drift Metric Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-saas-card space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Concept Drift Index</span>
                <span className="text-[10px] bg-emerald-50 text-emerald-700 font-bold px-2 py-0.5 rounded-full">
                  STABLE (0.024)
                </span>
              </div>
              <div className="text-xl font-bold text-slate-900 font-mono">98.4% Similarity</div>
              <p className="text-[10px] text-slate-500">
                Embedding distribution drift against baseline training set within tolerance (PSI &lt; 0.1).
              </p>
            </div>

            <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-saas-card space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Graph Node Growth</span>
                <span className="text-[10px] bg-blue-50 text-blue-700 font-bold px-2 py-0.5 rounded-full">
                  +14.2% / WEEK
                </span>
              </div>
              <div className="text-xl font-bold text-slate-900 font-mono">1,824 New Accounts</div>
              <p className="text-[10px] text-slate-500">
                Streaming dynamic graph construction adding edges in real-time.
              </p>
            </div>

            <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-saas-card space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Automated Trigger Status</span>
                <span className="text-[10px] bg-purple-50 text-purple-700 font-bold px-2 py-0.5 rounded-full">
                  SCHEDULED (SUNDAY)
                </span>
              </div>
              <div className="text-xl font-bold text-slate-900 font-mono">Weekly Retrain</div>
              <p className="text-[10px] text-slate-500">
                Next automated parameter sweep scheduled in 48 hours.
              </p>
            </div>
          </div>

          {/* Snapshots Table */}
          <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-saas-card">
            <div className="p-3.5 border-b border-slate-200 font-bold text-slate-900 text-xs">
              HISTORICAL GRAPH SNAPSHOTS
            </div>

            <table className="w-full text-left text-xs font-sans">
              <thead className="bg-slate-50 border-b border-slate-200 text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                <tr>
                  <th className="p-3">SNAPSHOT ID</th>
                  <th className="p-3">DATASET PROFILE</th>
                  <th className="p-3 text-right">TOTAL NODES</th>
                  <th className="p-3 text-right">TOTAL EDGES</th>
                  <th className="p-3 text-right">ANOMALY RATE</th>
                  <th className="p-3 text-right">EVAL F1-SCORE</th>
                  <th className="p-3">TIMESTAMP</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {snapshots.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-3 font-mono font-bold text-slate-900">{s.snapshotName}</td>
                    <td className="p-3">
                      <span className="font-mono text-[10px] bg-slate-100 px-2 py-0.5 rounded text-slate-700 font-bold">
                        {s.datasetType}
                      </span>
                    </td>
                    <td className="p-3 text-right font-mono font-bold text-slate-900">
                      {s.totalNodes.toLocaleString()}
                    </td>
                    <td className="p-3 text-right font-mono text-slate-800">
                      {s.totalEdges.toLocaleString()}
                    </td>
                    <td className="p-3 text-right font-mono font-bold text-red-600">
                      {s.anomalyRatePercent}%
                    </td>
                    <td className="p-3 text-right font-mono font-bold text-emerald-600">
                      {(s.f1Score * 100).toFixed(2)}%
                    </td>
                    <td className="p-3 text-slate-500 text-[11px]">
                      {new Date(s.capturedAt).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── TAB 2: MODEL REGISTRY ── */}
      {activeTab === 'REGISTRY' && <ModelRegistryView />}

      {/* ── MODAL: RETRAINING PIPELINE ── */}
      {showRetrainModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-md shadow-2xl p-5 space-y-4 font-sans animate-fadeIn">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-orange-50 text-[#FF5500] rounded-xl">
                  <Play className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">Configure GraphSAGE Retraining</h3>
                  <p className="text-[10px] text-slate-500">Spin up training job on GPU cluster</p>
                </div>
              </div>
              <button
                onClick={() => setShowRetrainModal(false)}
                className="text-slate-400 hover:text-slate-700 font-bold text-lg"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-700 uppercase">Target Evaluation Dataset</label>
                <select
                  value={datasetChoice}
                  onChange={(e) => setDatasetChoice(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:border-[#FF5500] focus:outline-none"
                >
                  <option value="SYNTHETIC_A">Dataset A: Synthetic Mule Graph (1,000 Cases)</option>
                  <option value="IBM_B">Dataset B: IBM Multi-Bank AML Graph</option>
                  <option value="ELLIPTIC_C">Dataset C: Elliptic Bitcoin Graph</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-700 uppercase">Epochs</label>
                  <input
                    type="number"
                    value={epochs}
                    onChange={(e) => setEpochs(parseInt(e.target.value) || 100)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-mono text-slate-900 focus:border-[#FF5500] focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-700 uppercase">Learning Rate (Adam)</label>
                  <input
                    type="text"
                    value={learningRate}
                    onChange={(e) => setLearningRate(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-mono text-slate-900 focus:border-[#FF5500] focus:outline-none"
                  />
                </div>
              </div>

              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-[11px] text-slate-600 space-y-1">
                <span className="font-bold text-slate-900 block">Architecture Architecture Pipeline:</span>
                <span>• 2-Hop GraphSAGE Neighbor Aggregation</span>
                <span className="block">• Dual Task Head: Macro Ring Risk + Micro Node Mule Score</span>
                <span className="block">• Cosine Similarity Terminal MRR Ranking</span>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                onClick={() => setShowRetrainModal(false)}
                className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl font-bold hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={handleStartRetrain}
                className="px-4 py-2 bg-[#FF5500] hover:bg-orange-600 text-white rounded-xl font-bold shadow-sm"
              >
                Launch Retraining Job
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
