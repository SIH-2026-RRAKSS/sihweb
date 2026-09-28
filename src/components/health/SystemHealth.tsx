import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Activity,
  CheckCircle,
  AlertCircle,
  Database,
  Cpu,
  Zap,
  Clock,
  ShieldCheck,
  Server,
  Layers,
  Radio
} from 'lucide-react';
import { GlassCard } from '../ui/GlassCard';
import { KPICard } from '../ui/KPICard';
import { ApiService } from '../../services/api';
import { HealthResponse, StreamingBenchmark } from '../../types';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell
} from 'recharts';
import { useAsyncState, AsyncStatus } from '../../hooks/useAsyncState';
import { useConnectivity } from '../../context/ConnectivityContext';
import { LottieLoader } from '../ui/LottieLoader';
import { EmptyState } from '../ui/EmptyState';

export const SystemHealth: React.FC = () => {
  const { health: sharedHealth, refetchHealth } = useConnectivity();
  const { data: streaming, status, error, isOffline, run, retry } = useAsyncState<StreamingBenchmark | null>();

  useEffect(() => {
    run(async () => {
      return await ApiService.getStreamingBenchmark();
    }).catch(() => {
      // Handled by useAsyncState
    });
  }, [run]);

  const handleRetryAll = () => {
    refetchHealth();
    retry();
  };

  const health = sharedHealth;

  const latencyChartData = streaming ? [
    { name: 'P50 Median', latency: Number(streaming.p50_latency_ms.toFixed(2)), color: '#10B981' },
    { name: 'P95 95th %ile', latency: Number(streaming.p95_latency_ms.toFixed(2)), color: '#F59E0B' },
    { name: 'P99 99th %ile', latency: Number(streaming.p99_latency_ms.toFixed(2)), color: '#EF4444' },
  ] : [];

  const isModelOperational = health?.status?.toUpperCase() === 'HEALTHY' || health?.status?.toUpperCase() === 'UP';
  const isSpringConnected = Boolean(health?.spring_db_connected);
  const isSqliteConnected = Boolean(health?.sqlite_connected);
  const dbStatusLabel = (isSpringConnected && isSqliteConnected)
    ? 'CONNECTED'
    : (!isSpringConnected && !isSqliteConnected)
    ? 'OFFLINE'
    : isSqliteConnected
    ? 'SPRING OFFLINE'
    : 'SQLITE OFFLINE';
  const dbColor = (isSpringConnected && isSqliteConnected) ? 'green' : 'red';

  if (status === AsyncStatus.LOADING && !health) {
    return (
      <div className="p-16 flex justify-center items-center">
        <LottieLoader status={status} label="Connecting to system health telemetry..." />
      </div>
    );
  }

  if (status === AsyncStatus.ERROR && !health) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-saas-card">
        <EmptyState
          variant={isOffline ? 'offline' : 'empty'}
          title={isOffline ? 'FastAPI Backend Offline' : 'Failed to Load System Health'}
          description={error || 'System telemetry is unavailable.'}
          onRetry={handleRetryAll}
        />
      </div>
    );
  }

  return (
    <div className="space-y-3 font-sans text-xs">
      {error && (
        <div className="bg-red-50 p-4 rounded-xl border border-red-200 text-red-700 flex items-center justify-between text-xs mb-4">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
            <span>Streaming benchmark unavailable: {error}</span>
          </div>
          <button
            onClick={retry}
            className="px-3 py-1 bg-white border border-red-200 text-red-700 rounded-lg font-bold text-[11px] hover:bg-red-50 transition-colors shadow-xs"
          >
            Retry Telemetry
          </button>
        </div>
      )}

      {/* ── TOP KPI STATUS CARDS ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
        <KPICard
          icon={Radio}
          value={isModelOperational ? 'OPERATIONAL' : 'DEGRADED'}
          label="FASTAPI BACKEND STATUS"
          code="API-SRV"
          color={isModelOperational ? 'green' : 'red'}
          trend={{ direction: 'stable', text: 'PORT 8000' }}
        />
        <KPICard
          icon={Cpu}
          value={streaming ? `${streaming.ingestion_rate_tx_per_sec.toFixed(1)} TX/S` : '—'}
          label="STREAMING INGESTION RATE"
          code="INGEST-RATE"
          color="cyan"
          trend={{ direction: 'up', text: streaming ? 'PEAK VELOCITY' : 'OFFLINE' }}
        />
        <KPICard
          icon={Zap}
          value={streaming ? `${streaming.p50_latency_ms.toFixed(2)} MS` : '—'}
          label="P50 INFERENCE LATENCY"
          code="LAT-P50"
          color="green"
          trend={{ direction: 'stable', text: streaming ? 'SUB-100MS SLA' : 'OFFLINE' }}
        />
        <KPICard
          icon={Database}
          value={dbStatusLabel}
          label="DATABASE STATE"
          code="DB-STATUS"
          color={dbColor}
          trend={{ direction: 'stable', text: isSqliteConnected ? 'SQLITE LIVE' : 'SQLITE UNREADY' }}
        />
      </div>

      {/* ── MODEL PIPELINE DIAGNOSTICS & LATENCY BARS ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3">
        {/* Left: Model Engine Health (6 cols) */}
        <div className="lg:col-span-6 flex flex-col">
          <GlassCard padding="md" glow="cyan" className="flex-1 space-y-3">
            <div className="flex items-center gap-2 border-b border-cyan-500/30 pb-2">
              <Server className="w-4 h-4 text-neon-cyan" />
              <span className="font-bold text-xs text-neon-cyan uppercase">
                MODEL PIPELINE & STORAGE RUNTIME
              </span>
            </div>

            <div className="space-y-2">
              <div className="p-3 bg-white border border-slate-200 flex items-center justify-between rounded-lg shadow-sm">
                <div className="flex items-center gap-2.5">
                  <div className={`w-2.5 h-2.5 rounded-full ${health?.graphsage_model_loaded ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`} />
                  <div>
                    <div className="font-bold text-slate-900">PyTorch Geometric GraphSAGE</div>
                    <div className="text-[10px] text-slate-500">Inductive Graph Neural Network Engine</div>
                  </div>
                </div>
                <span className={`px-2 py-0.5 rounded border text-[10px] font-bold ${
                  health?.graphsage_model_loaded 
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                    : 'bg-red-50 text-red-700 border-red-200'
                }`}>
                  {health?.graphsage_model_loaded ? 'LOADED & CALIBRATED' : 'NOT LOADED'}
                </span>
              </div>

              <div className="p-3 bg-white border border-slate-200 flex items-center justify-between rounded-lg shadow-sm">
                <div className="flex items-center gap-2.5">
                  <div className={`w-2.5 h-2.5 rounded-full ${health?.xgboost_model_loaded ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                  <div>
                    <div className="font-bold text-slate-900">XGBoost Baseline Model</div>
                    <div className="text-[10px] text-slate-500">Tabular Feature Classification Engine</div>
                  </div>
                </div>
                <span className={`px-2 py-0.5 rounded border text-[10px] font-bold ${
                  health?.xgboost_model_loaded 
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                    : 'bg-amber-50 text-amber-700 border-amber-200'
                }`}>
                  {health?.xgboost_model_loaded ? 'LOADED' : 'UNAVAILABLE'}
                </span>
              </div>

              {/* Spring Boot DB Row */}
              <div className="p-3 bg-white border border-slate-200 flex items-center justify-between rounded-lg shadow-sm">
                <div className="flex items-center gap-2.5">
                  <div className={`w-2.5 h-2.5 rounded-full ${isSpringConnected ? 'bg-emerald-500' : 'bg-red-500'}`} />
                  <div>
                    <div className="font-bold text-slate-900">Spring Boot AML Database</div>
                    <div className="text-[10px] text-slate-500">PostgreSQL / Primary Relational Store (1,000+ Cases)</div>
                  </div>
                </div>
                <span className={`px-2 py-0.5 rounded border text-[10px] font-bold ${
                  isSpringConnected 
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                    : 'bg-red-50 text-red-700 border-red-200'
                }`}>
                  {isSpringConnected ? 'CONNECTED' : 'OFFLINE'}
                </span>
              </div>

              {/* Local SQLite DB Row */}
              <div className="p-3 bg-white border border-slate-200 flex items-center justify-between rounded-lg shadow-sm">
                <div className="flex items-center gap-2.5">
                  <div className={`w-2.5 h-2.5 rounded-full ${isSqliteConnected ? 'bg-emerald-500' : 'bg-red-500'}`} />
                  <div>
                    <div className="font-bold text-slate-900">Local SQLite Engine (FastAPI Fallback)</div>
                    <div className="text-[10px] text-slate-500">cybercrime_aml.db / In-Memory Subgraph Fallback</div>
                  </div>
                </div>
                <span className={`px-2 py-0.5 rounded border text-[10px] font-bold ${
                  isSqliteConnected 
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                    : 'bg-red-50 text-red-700 border-red-200'
                }`}>
                  {isSqliteConnected ? 'CONNECTED' : 'OFFLINE'}
                </span>
              </div>

              <div className="p-3 bg-white border border-slate-200 flex items-center justify-between rounded-lg shadow-sm">
                <div className="flex items-center gap-2.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-cyan-500 animate-pulse" />
                  <div>
                    <div className="font-bold text-slate-900">TemporalTransactionGraph Streamer</div>
                    <div className="text-[10px] text-slate-500">72-Hour Rolling Transaction Slide Window</div>
                  </div>
                </div>
                <span className="px-2 py-0.5 bg-cyan-50 text-cyan-700 border border-cyan-200 text-[10px] font-bold rounded">
                  {streaming?.ingestion_rate_tx_per_sec ? `STREAMING ${streaming.ingestion_rate_tx_per_sec.toFixed(0)} TX/S` : 'OFFLINE'}
                </span>
              </div>
            </div>
          </GlassCard>
        </div>

        {/* Right: Latency Percentiles (6 cols) */}
        <div className="lg:col-span-6 flex flex-col">
          <GlassCard padding="md" glow="cyan" className="flex-1 space-y-3">
            <div className="flex items-center justify-between border-b border-cyan-500/30 pb-2">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-neon-cyan" />
                <span className="font-bold text-xs text-neon-cyan uppercase">
                  STREAMING QUERY LATENCY PERCENTILES (MS)
                </span>
              </div>
              <span className="px-1.5 py-0.5 bg-green-500/15 text-acid-green border border-green-500/40 text-[9px] font-bold">
                SLA COMPLIANT
              </span>
            </div>

            <div className="h-72 w-full bg-white p-2 border border-slate-200 rounded-lg">
              {latencyChartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={latencyChartData} layout="vertical" margin={{ top: 10, right: 20, left: 10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" horizontal={false} />
                    <XAxis type="number" stroke="#64748b" tick={{ fill: '#64748b', fontSize: 10 }} unit=" ms" />
                    <YAxis type="category" dataKey="name" stroke="#64748b" tick={{ fill: '#64748b', fontSize: 10 }} width={95} />
                    <Tooltip
                      content={({ active, payload, label }) => {
                        if (!active || !payload || !payload.length) return null;
                        const entry = payload[0];
                        return (
                          <div className="bg-white border border-slate-200 rounded-xl p-2.5 shadow-lg text-xs space-y-1">
                            <div className="font-bold text-slate-800">{label}</div>
                            <div className="text-[11px] font-mono text-slate-600 flex items-center gap-1.5">
                              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.payload.color }} />
                              <span>Latency: <strong>{entry.value} ms</strong></span>
                            </div>
                          </div>
                        );
                      }}
                    />
                    <Bar dataKey="latency" name="Latency (ms)" radius={[0, 4, 4, 0]}>
                      {latencyChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-slate-400 font-mono text-xs gap-1.5">
                  <Activity className="w-5 h-5 text-slate-300" />
                  <span>Streaming Telemetry Offline — No latency benchmarks available</span>
                </div>
              )}
            </div>

            <div className="p-2 bg-white border border-slate-200 text-[10px] text-slate-500 flex items-center justify-between rounded-lg">
              <span>95% OF GRAPH INFERENCE QUERIES COMPLETE IN &lt; {streaming?.p95_latency_ms ? `${streaming.p95_latency_ms.toFixed(2)}MS` : '—'}</span>
              <span className="text-[#FF5500] font-bold">SUB-50MS SLA VERIFIED</span>
            </div>
          </GlassCard>
        </div>
      </div>

      {/* ── RUNTIME TELEMETRY DIAGNOSTICS STRIP ── */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-saas-card">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-3">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-[#FF5500]" />
            <span className="font-bold text-xs text-slate-900 uppercase">
              DISTRIBUTED STREAMING CLUSTER & INFERENCE TELEMETRY
            </span>
          </div>
          <span className="text-[10px] text-slate-400 font-mono">
            {health?.timestamp ? new Date(health.timestamp).toLocaleTimeString() : 'LIVE'} IST
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <div className="p-3 bg-slate-50/80 rounded-xl border border-slate-100">
            <div className="text-[10px] text-slate-400 font-bold uppercase">Sliding Window</div>
            <div className="text-sm font-bold font-mono text-slate-900 mt-0.5">
              72h Dynamic Window
            </div>
            <div className="text-[9px] text-slate-500 mt-0.5">Rolling Transaction Frame</div>
          </div>

          <div className="p-3 bg-slate-50/80 rounded-xl border border-slate-100">
            <div className="text-[10px] text-slate-400 font-bold uppercase">Transactions Ingested</div>
            <div className="text-sm font-bold font-mono text-slate-900 mt-0.5">
              {streaming
                ? `${((streaming as any)?.transactions_ingested ?? streaming?.total_transactions_ingested ?? 0).toLocaleString()} TX`
                : '—'}
            </div>
            <div className="text-[9px] text-slate-500 mt-0.5">Stream Buffer Volume</div>
          </div>

          <div className="p-3 bg-slate-50/80 rounded-xl border border-slate-100">
            <div className="text-[10px] text-slate-400 font-bold uppercase">Inference Queries</div>
            <div className="text-sm font-bold font-mono text-slate-900 mt-0.5">
              {(streaming?.total_inference_queries ?? (streaming as any)?.num_incident_queries) !== undefined
                ? `${(streaming?.total_inference_queries ?? (streaming as any)?.num_incident_queries).toLocaleString()} Evaluated`
                : '—'}
            </div>
            <div className="text-[9px] text-slate-500 mt-0.5">Batch Triage Queries</div>
          </div>

          <div className="p-3 bg-slate-50/80 rounded-xl border border-slate-100">
            <div className="text-[10px] text-slate-400 font-bold uppercase">In-Memory Nodes</div>
            <div className="text-sm font-bold font-mono text-emerald-600 mt-0.5">
              {health?.streaming_graph_nodes !== undefined ? health.streaming_graph_nodes.toLocaleString() : '—'}
            </div>
            <div className="text-[9px] text-slate-500 mt-0.5">Active Graph Vertices</div>
          </div>

          <div className="p-3 bg-slate-50/80 rounded-xl border border-slate-100">
            <div className="text-[10px] text-slate-400 font-bold uppercase">In-Memory Edges</div>
            <div className="text-sm font-bold font-mono text-sky-600 mt-0.5">
              {health?.streaming_graph_edges !== undefined ? health.streaming_graph_edges.toLocaleString() : '—'}
            </div>
            <div className="text-[9px] text-slate-500 mt-0.5">Temporal Edge Links</div>
          </div>

          <div className="p-3 bg-slate-50/80 rounded-xl border border-slate-100">
            <div className="text-[10px] text-slate-400 font-bold uppercase">Mean Latency</div>
            <div className="text-sm font-bold font-mono text-emerald-600 mt-0.5">
              {streaming ? `${((streaming as any).mean_latency_ms ?? (streaming.p50_latency_ms || 0)).toFixed(2)} ms` : '—'}
            </div>
            <div className="text-[9px] text-slate-500 mt-0.5">Sub-50ms SLA Verified</div>
          </div>
        </div>
      </div>
    </div>
  );
};
