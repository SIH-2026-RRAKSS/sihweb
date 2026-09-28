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
import { useAsyncState, AsyncStatus } from '../../hooks/useAsyncState';
import { LottieLoader } from '../ui/LottieLoader';
import { EmptyState } from '../ui/EmptyState';
import { AlertTriangle } from 'lucide-react';

export const ModelRegistryView: React.FC = () => {
  const [promotingId, setPromotingId] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [promoteError, setPromoteError] = useState<string | null>(null);

  const {
    status: fetchStatus,
    error: fetchError,
    isOffline,
    data: rawModels,
    setData: setModels,
    run: runFetch,
    retry,
  } = useAsyncState<RegisteredModel[]>({
    initialData: [],
  });

  const models = rawModels || [];

  const fetchModels = () => {
    runFetch(async () => {
      return await ApiService.getModelRegistry();
    });
  };

  useEffect(() => {
    fetchModels();
  }, []);

  const handlePromote = async (modelId: string, name: string) => {
    try {
      setPromoteError(null);
      setPromotingId(modelId);
      const updatedList = await ApiService.promoteModelToChampion(modelId);
      setModels(updatedList);
      setSuccessMessage(`Model ${name} successfully promoted to PRODUCTION CHAMPION.`);
      setTimeout(() => setSuccessMessage(null), 4000);
    } catch (err: any) {
      setPromoteError(err?.message || `Failed to promote model ${name} to champion.`);
    } finally {
      setPromotingId(null);
    }
  };

  const champion = models.find((m) => m.status === 'CHAMPION');

  return (
    <div className="space-y-4 font-sans text-xs animate-fadeIn">
      {/* ── ERROR BANNERS ── */}
      {promoteError && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-2.5 rounded-2xl flex items-center justify-between text-xs font-medium shadow-sm animate-fadeIn">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-red-600 flex-shrink-0" />
            <span>Promotion Failure: {promoteError}</span>
          </div>
          <button
            onClick={() => setPromoteError(null)}
            className="text-red-600 hover:text-red-900 font-bold px-2 py-0.5 text-xs bg-red-100 hover:bg-red-200 rounded transition-colors"
          >
            Dismiss
          </button>
        </div>
      )}

      {fetchError && models.length > 0 && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-2.5 rounded-2xl flex items-center justify-between text-xs font-medium shadow-sm animate-fadeIn">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-red-600 flex-shrink-0" />
            <span>Registry synchronization notice: {fetchError}</span>
          </div>
          <button
            onClick={() => retry()}
            className="px-2.5 py-1 bg-red-100 hover:bg-red-200 text-red-800 rounded font-bold transition-colors"
          >
            Retry
          </button>
        </div>
      )}

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
              <span className="text-[9px] uppercase font-bold text-slate-400 block">
                Validation Peak F1 {champion.validationPeakEpoch ? `(Epoch ${champion.validationPeakEpoch})` : ''}
              </span>
              <span className="text-base font-bold text-amber-400 font-mono">
                {champion.f1Score !== null && champion.f1Score !== undefined
                  ? `${(champion.f1Score * 100).toFixed(2)}%`
                  : 'Metrics unavailable'}
              </span>
            </div>
            <div className="w-px h-8 bg-white/10" />
            <div className="text-center">
              <span className="text-[9px] uppercase font-bold text-slate-400 block">PR-AUC</span>
              <span className="text-base font-bold text-emerald-400 font-mono">
                {champion.prAuc !== null && champion.prAuc !== undefined ? champion.prAuc.toFixed(3) : '—'}
              </span>
            </div>
            {champion.mrrScore !== null && champion.mrrScore !== undefined && (
              <>
                <div className="w-px h-8 bg-white/10" />
                <div className="text-center">
                  <span className="text-[9px] uppercase font-bold text-slate-400 block">Terminal MRR</span>
                  <span className="text-base font-bold text-blue-400 font-mono">{champion.mrrScore.toFixed(2)}</span>
                </div>
              </>
            )}
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
            <RefreshCw className={`w-3.5 h-3.5 ${fetchStatus === AsyncStatus.LOADING ? 'animate-spin' : ''}`} />
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
            {fetchStatus === AsyncStatus.LOADING && models.length === 0 ? (
              <tr>
                <td colSpan={8} className="p-8 text-center">
                  <div className="flex flex-col justify-center items-center gap-2">
                    <LottieLoader status={fetchStatus} />
                    <span className="text-xs text-slate-500 font-medium">Loading model registry...</span>
                  </div>
                </td>
              </tr>
            ) : fetchStatus === AsyncStatus.ERROR && models.length === 0 ? (
              <tr>
                <td colSpan={8} className="p-8">
                  <EmptyState
                    variant={isOffline ? 'offline' : 'empty'}
                    title={isOffline ? 'Model Registry Offline' : 'Failed to Load Models'}
                    message={fetchError || 'Unable to retrieve registered models.'}
                    onRetry={retry}
                  />
                </td>
              </tr>
            ) : models.length === 0 ? (
              <tr>
                <td colSpan={8} className="p-8">
                  <EmptyState
                    variant="empty"
                    title="No Models Registered"
                    message="No model versions have been registered in the governance catalog."
                  />
                </td>
              </tr>
            ) : models.map((m) => {
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
                    {m.f1Score !== null && m.f1Score !== undefined ? `${(m.f1Score * 100).toFixed(2)}%` : '—'}
                  </td>
                  <td className="p-3 text-right font-mono text-slate-800">
                    {m.prAuc !== null && m.prAuc !== undefined ? m.prAuc.toFixed(3) : '—'}
                  </td>
                  <td className="p-3 text-right font-mono text-slate-800">
                    {m.mrrScore !== null && m.mrrScore !== undefined ? m.mrrScore.toFixed(2) : '—'}
                  </td>
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
