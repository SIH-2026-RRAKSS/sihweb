import React, { useState } from 'react';
import {
  Play,
  ShieldAlert,
  Network,
  AlertTriangle,
  Copy,
  Check,
  ChevronDown,
  ChevronUp,
  Cpu,
  Layers,
  MapPin,
  Clock,
  ArrowRight,
} from 'lucide-react';
import { ApiService } from '../../services/api';
import { ThreeNetworkCanvas } from './ThreeNetworkCanvas';
import { useAsyncState, AsyncStatus } from '../../hooks/useAsyncState';
import { LottieLoader } from '../ui/LottieLoader';
import { EmptyState } from '../ui/EmptyState';
import { LivePredictResponse } from '../../types';
import { ConfidenceBadge } from '../ui/ConfidenceBadge';
import { RISK_THRESHOLDS, getRiskStyle, getTierLabel } from '../incidents/incidentConstants';

export const SimulationLab: React.FC = () => {
  const [seedEntityId, setSeedEntityId] = useState<string>('ENT_000185');
  const [clientLatencyMs, setClientLatencyMs] = useState<number | null>(null);
  const [inputVal, setInputVal] = useState<string>('ENT_000185');
  const [isRawJsonExpanded, setIsRawJsonExpanded] = useState<boolean>(false);
  const [copiedJson, setCopiedJson] = useState<boolean>(false);

  const {
    status,
    error,
    isOffline,
    data: predictionResult,
    run,
    retry,
  } = useAsyncState<LivePredictResponse | null>({
    initialData: null,
  });

  const handleRunInference = async (entityId: string = seedEntityId) => {
    if (!entityId.trim()) return;
    setClientLatencyMs(null);

    const startTime = performance.now();
    try {
      await run(async () => {
        const res = await ApiService.predictLiveEntity(entityId.trim(), 3);
        const endTime = performance.now();
        setClientLatencyMs(Math.round(endTime - startTime));
        return res;
      });
    } catch {
      // Handled by useAsyncState
    }
  };

  const handleCopyJson = () => {
    if (!predictionResult) return;
    navigator.clipboard.writeText(JSON.stringify(predictionResult, null, 2));
    setCopiedJson(true);
    setTimeout(() => setCopiedJson(false), 2000);
  };

  const topTerminal = predictionResult?.terminals?.[0];
  const primaryRisk = predictionResult?.risk_probability ?? 0;

  return (
    <div className="h-full flex flex-col gap-3 p-4 bg-slate-50 overflow-y-auto font-sans text-xs">
      {/* ── 1. TOP HEADER INFERENCE RUNNER CARD ── */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-[#FF5500]/10 border border-[#FF5500]/30 rounded-lg text-[#FF5500]">
            <Cpu className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-sm font-bold font-sans text-slate-900 tracking-wide flex items-center gap-2">
              <span>GraphSAGE Inference Runner</span>
              <span className="text-[10px] font-mono bg-slate-100 text-slate-700 px-2 py-0.5 rounded border border-slate-200">
                INDUCTIVE GNN
              </span>
            </h1>
            <p className="text-[11px] text-slate-500">
              Run inductive live inference against real-time subgraphs and simulate temporal transaction fan-out.
            </p>
          </div>
        </div>

        {/* Input & Run CTA */}
        <div className="flex items-center gap-2">
          <div className="relative">
            <input
              type="text"
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              className="bg-slate-50 border border-slate-300 rounded-lg px-3 py-1.5 text-xs font-mono font-medium text-slate-800 focus:outline-none focus:border-[#FF5500] w-48 sm:w-56"
              placeholder="e.g. ENT_000185"
            />
          </div>

          <button
            onClick={() => {
              setSeedEntityId(inputVal);
              handleRunInference(inputVal);
            }}
            disabled={status === AsyncStatus.LOADING || !inputVal.trim()}
            className="bg-[#FF5500] hover:bg-[#FF5500]/90 text-white font-bold py-1.5 px-4 rounded-lg flex items-center gap-2 disabled:opacity-50 transition-colors shadow-sm"
          >
            {status === AsyncStatus.LOADING ? (
              'Running...'
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Run Inference</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* ── ERROR STATE (when previous prediction exists) ── */}
      {error && predictionResult && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-xl text-xs flex items-center justify-between font-medium">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
            <span>Error during live inference: {error}</span>
          </div>
          <button
            onClick={() => retry()}
            className="px-2.5 py-1 bg-red-100 hover:bg-red-200 text-red-800 rounded font-bold transition-colors"
          >
            Retry
          </button>
        </div>
      )}

      {/* ── LOADING STATE ── */}
      {status === AsyncStatus.LOADING && (
        <div className="p-12 flex flex-col items-center justify-center bg-white rounded-xl border border-slate-200 shadow-sm space-y-2">
          <LottieLoader status={status} />
          <span className="text-xs font-mono font-bold text-slate-600">
            Extracting 3-hop subgraph and executing inductive GraphSAGE forward pass...
          </span>
        </div>
      )}

      {/* ── MAIN CONTENT (SPLIT LAYOUT) ── */}
      {predictionResult ? (
        <div className="flex flex-col lg:flex-row gap-3 min-h-[500px]">
          {/* ── LEFT PANEL: INFERENCE RESULT SUMMARY (380px) ── */}
          <div className="w-full lg:w-[380px] bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex flex-col space-y-4 shrink-0">
            {/* Header with Real State */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
              <span className="font-bold text-xs text-slate-900 tracking-wide font-sans">
                INFERENCE RESULT SUMMARY
              </span>
              {predictionResult.low_information ? (
                <span className="text-[10px] font-bold font-mono bg-amber-50 text-amber-700 border border-amber-200 px-2 py-0.5 rounded">
                  Status: Low information
                </span>
              ) : (
                <span className="text-[10px] font-bold font-mono bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded">
                  Status: Complete
                </span>
              )}
            </div>

            {/* Low-Information Status Alert */}
            {predictionResult.low_information ? (
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-amber-800 space-y-1">
                <div className="text-[11px] font-bold flex items-center gap-1.5 text-amber-900">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                  <span>Low Information Entity Subgraph</span>
                </div>
                <p className="text-[10px] text-amber-800 leading-relaxed">
                  {predictionResult.status_reason || 'Insufficient edge data recorded within the sliding surveillance window.'}
                </p>
              </div>
            ) : (
              /* Primary Risk Card */
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-lg space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-700 uppercase">
                    GraphSAGE Ring Risk
                  </span>
                  <ConfidenceBadge tier={predictionResult.confidence_tier} size="sm" />
                </div>

                <div className="flex items-baseline gap-2">
                  <span
                    className={`text-2xl font-bold font-mono tracking-tight ${
                      getRiskStyle(primaryRisk, predictionResult.confidence_tier).textColor
                    }`}
                  >
                    {(primaryRisk * 100).toFixed(1)}%
                  </span>
                  <span className="text-[10px] text-slate-500 font-mono">
                    ({primaryRisk.toFixed(4)})
                  </span>
                </div>

                {/* Shared Risk Progress Bar */}
                <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden relative">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${
                      getRiskStyle(primaryRisk, predictionResult.confidence_tier).barColor
                    }`}
                    style={{ width: `${Math.min(100, Math.max(0, primaryRisk * 100))}%` }}
                  />
                  {/* 70% threshold marker */}
                  <div className="absolute top-0 bottom-0 left-[70%] w-0.5 bg-slate-400 opacity-60" />
                </div>
                <div className="flex justify-between text-[9px] font-mono text-slate-500">
                  <span>0%</span>
                  <span>Threshold: 70%</span>
                  <span>100%</span>
                </div>
                {primaryRisk >= RISK_THRESHOLDS.CRITICAL &&
                  getTierLabel(predictionResult.confidence_tier) !== 'Critical' && (
                    <div className="text-[10px] text-amber-600 font-mono flex items-center gap-1 mt-1">
                      <span>High score, insufficient structure</span>
                    </div>
                )}
              </div>
            )}

            {/* Key Model Metrics Grid */}
            <div className="space-y-2 border-t border-slate-100 pt-2.5">
              <div className="flex justify-between items-center text-slate-600">
                <span>Seed Entity:</span>
                <span className="font-bold text-slate-900 font-mono">{predictionResult.seed_entity_id}</span>
              </div>

              <div className="flex justify-between items-center text-slate-600">
                <span>Subgraph Scale:</span>
                <span className="font-bold text-slate-900 font-mono">
                  {predictionResult.num_nodes} Nodes · {predictionResult.num_edges} Edges
                </span>
              </div>

              <div className="flex justify-between items-center text-slate-600">
                <span>Exit Terminal:</span>
                <span className="font-bold text-slate-900 font-mono">
                  {topTerminal?.terminal_id || '—'}
                </span>
              </div>

              <div className="flex justify-between items-center text-slate-600">
                <span>Exit City:</span>
                <span className="font-bold text-slate-900">
                  {topTerminal?.city || '—'}
                </span>
              </div>

              <div className="flex justify-between items-center text-slate-600">
                <span>Exit Score:</span>
                <span className="font-bold text-slate-900 font-mono">
                  {topTerminal?.score !== undefined ? `${(topTerminal.score * 100).toFixed(1)}%` : '—'}
                </span>
              </div>

              {clientLatencyMs !== null && (
                <div className="flex justify-between items-center text-slate-600">
                  <span>Round-trip time (client):</span>
                  <span className="font-bold text-emerald-700 font-mono">{clientLatencyMs} ms</span>
                </div>
              )}
            </div>

            {/* Collapsible Raw Model Output JSON */}
            <div className="border border-slate-200 rounded-lg overflow-hidden flex-1 flex flex-col">
              <button
                onClick={() => setIsRawJsonExpanded(!isRawJsonExpanded)}
                className="w-full px-3 py-2 bg-slate-50 hover:bg-slate-100 flex items-center justify-between text-[11px] font-bold text-slate-700 transition-colors"
              >
                <span>Raw model output</span>
                <div className="flex items-center gap-1.5">
                  {isRawJsonExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                </div>
              </button>

              {isRawJsonExpanded && (
                <div className="p-2.5 bg-slate-900 text-slate-200 overflow-auto max-h-56 text-[10px] font-mono relative">
                  <button
                    onClick={handleCopyJson}
                    className="absolute top-2 right-2 p-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded border border-slate-700 flex items-center gap-1 text-[9px] font-sans"
                    title="Copy Raw JSON"
                  >
                    {copiedJson ? (
                      <>
                        <Check className="w-3 h-3 text-emerald-400" />
                        <span className="text-emerald-400">Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" />
                        <span>Copy</span>
                      </>
                    )}
                  </button>
                  <pre className="pr-12">{JSON.stringify(predictionResult, null, 2)}</pre>
                </div>
              )}
            </div>
          </div>

          {/* ── RIGHT PANEL: THREE.JS 3D CANVAS VIEWPORT (flex-1) ── */}
          <div className="flex-1 bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm flex flex-col min-h-[460px]">
            <ThreeNetworkCanvas
              seedEntityId={seedEntityId}
              predictionResult={predictionResult}
            />
          </div>
        </div>
      ) : status === AsyncStatus.ERROR && !predictionResult ? (
        <div className="flex-1 bg-white rounded-xl border border-slate-200 shadow-sm flex items-center justify-center p-8 min-h-[420px]">
          <EmptyState
            variant={isOffline ? 'offline' : 'empty'}
            title={isOffline ? 'Inference Engine Offline' : 'Inference Failed'}
            message={error || 'Failed to execute GraphSAGE live inference.'}
            onRetry={retry}
          />
        </div>
      ) : (
        /* Idle State (Prompt user to enter entity) */
        status !== AsyncStatus.LOADING && (
          <div className="flex-1 p-16 flex flex-col items-center justify-center bg-white rounded-xl border border-slate-200 text-center space-y-3 shadow-sm min-h-[420px]">
            <div className="p-3 rounded-full bg-slate-100 text-slate-500">
              <Network className="w-8 h-8 text-[#FF5500]" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-800 font-sans">
                Ready for Live Inference
              </h3>
              <p className="text-xs text-slate-500 max-w-sm mt-0.5">
                Enter an entity ID (e.g. <span className="font-mono text-slate-700">ENT_000185</span>) and click{' '}
                <span className="text-[#FF5500] font-bold">Run Inference</span> to compute the GraphSAGE multi-hop risk and visualize the 3D propagation network.
              </p>
            </div>
          </div>
        )
      )}
    </div>
  );
};
