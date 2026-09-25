import React, { useState, useEffect } from 'react';
import {
  Cpu,
  Trophy,
  CheckCircle2,
  Sparkles,
  ArrowUpRight,
  TrendingUp,
  Layers,
  History,
  RefreshCw,
  GitBranch
} from 'lucide-react';
import { ApiService } from '../../services/api';
import { RegisteredModel } from '../../types';

export const ModelRegistryView: React.FC = () => {
  const [models, setModels] = useState<RegisteredModel[]>([]);
  const [loading, setLoading] = useState(true);
  const [promotingId, setPromotingId] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const fetchModels = async () => {
    try {
      setLoading(true);
      const data = await ApiService.getModelRegistry();
      setModels(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchModels();
  }, []);

  const handlePromote = async (modelId: string, name: string) => {
    try {
      setPromotingId(modelId);
      const updatedList = await ApiService.promoteModelToChampion(modelId);
      setModels(updatedList);
      setSuccessMessage(`Model ${name} successfully promoted to PRODUCTION CHAMPION.`);
      setTimeout(() => setSuccessMessage(null), 4000);
    } catch (err) {
      console.error(err);
    } finally {
      setPromotingId(null);
    }
  };

  const champion = models.find((m) => m.status === 'CHAMPION');

  return (
    <div className="space-y-4 font-sans text-xs animate-fadeIn">
      {/* ── SUCCESS BANNER ── */}
      {successMessage && (
        <div className="bg-emerald-50 border border-emerald-300 text-emerald-800 px-4 py-2.5 rounded-2xl flex items-center gap-2 font-medium shadow-sm animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* ── CHAMPION HERO HIGHLIGHT ── */}
      {champion && (
        <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white p-5 rounded-3xl shadow-saas-card flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="p-3 bg-amber-500 text-slate-950 rounded-2xl shadow-lg">
              <Trophy className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-400 text-slate-950 uppercase tracking-wider">
                  ACTIVE PRODUCTION CHAMPION
                </span>
                <span className="text-slate-400 font-mono text-[11px]">{champion.version}</span>
              </div>
              <h2 className="text-base font-bold text-white font-sans mt-0.5">{champion.modelName}</h2>
              <p className="text-[11px] text-slate-300">
                Framework: <strong>{champion.framework}</strong> · {(champion.parametersCount / 1000).toFixed(0)}k Parameters
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 bg-white/5 border border-white/10 px-4 py-2.5 rounded-2xl">
            <div className="text-center">
              <span className="text-[9px] uppercase font-bold text-slate-400 block">Test F1-Score</span>
              <span className="text-base font-bold text-amber-400 font-mono">{(champion.f1Score * 100).toFixed(2)}%</span>
            </div>
            <div className="w-px h-8 bg-white/10" />
            <div className="text-center">
              <span className="text-[9px] uppercase font-bold text-slate-400 block">PR-AUC</span>
              <span className="text-base font-bold text-emerald-400 font-mono">{champion.prAuc.toFixed(3)}</span>
            </div>
            <div className="w-px h-8 bg-white/10" />
            <div className="text-center">
              <span className="text-[9px] uppercase font-bold text-slate-400 block">Terminal MRR</span>
              <span className="text-base font-bold text-blue-400 font-mono">{champion.mrrScore.toFixed(2)}</span>
            </div>
          </div>
        </div>
      )}

      {/* ── ALL REGISTERED MODELS TABLE ── */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-saas-card">
        <div className="p-3.5 border-b border-slate-200 flex items-center justify-between">
          <div className="font-bold text-slate-900 text-xs flex items-center gap-2">
            <Layers className="w-4 h-4 text-slate-500" />
            <span>MODEL GOVERNANCE REGISTRY & BENCHMARKS</span>
          </div>
          <button
            onClick={fetchModels}
            className="p-1 hover:bg-slate-100 rounded text-slate-500"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        <table className="w-full text-left text-xs font-sans">
          <thead className="bg-slate-50 border-b border-slate-200 text-[10px] text-slate-500 font-bold uppercase tracking-wider">
            <tr>
              <th className="p-3">MODEL NAME & VERSION</th>
              <th className="p-3">ARCHITECTURE</th>
              <th className="p-3 text-right">F1-SCORE</th>
              <th className="p-3 text-right">PR-AUC</th>
              <th className="p-3 text-right">MRR (CASHOUT)</th>
              <th className="p-3">TRAINED DATE</th>
              <th className="p-3">STATUS</th>
              <th className="p-3 text-center">GOVERNANCE</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white">
            {models.map((m) => {
              const isChamp = m.status === 'CHAMPION';
              const isCand = m.status === 'CANDIDATE';

              return (
                <tr key={m.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="p-3">
                    <div className="font-bold text-slate-900 text-xs">{m.modelName}</div>
                    <div className="text-[10px] text-slate-400 font-mono">{m.version}</div>
                  </td>
                  <td className="p-3 font-medium text-slate-700">{m.framework}</td>
                  <td className="p-3 text-right font-mono font-bold text-slate-900">
                    {(m.f1Score * 100).toFixed(2)}%
                  </td>
                  <td className="p-3 text-right font-mono text-slate-800">{m.prAuc.toFixed(3)}</td>
                  <td className="p-3 text-right font-mono text-slate-800">{m.mrrScore.toFixed(2)}</td>
                  <td className="p-3 text-slate-500 text-[11px]">
                    {new Date(m.trainedAt).toLocaleDateString()}
                  </td>
                  <td className="p-3">
                    <span
                      className={`text-[9px] px-2.5 py-0.5 rounded-full font-bold uppercase border ${
                        isChamp
                          ? 'bg-amber-50 text-amber-800 border-amber-300'
                          : isCand
                          ? 'bg-blue-50 text-blue-700 border-blue-200'
                          : 'bg-slate-100 text-slate-600 border-slate-200'
                      }`}
                    >
                      {m.status}
                    </span>
                  </td>
                  <td className="p-3 text-center">
                    {isCand && (
                      <button
                        onClick={() => handlePromote(m.id, m.modelName)}
                        disabled={promotingId === m.id}
                        className="px-2.5 py-1 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-lg text-[10px] shadow-sm transition-all"
                      >
                        {promotingId === m.id ? 'Promoting...' : 'Promote to Champion'}
                      </button>
                    )}
                    {isChamp && (
                      <span className="text-[10px] font-bold text-amber-700 flex items-center justify-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Serving Live</span>
                      </span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
