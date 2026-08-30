import {
  IncidentSummary,
  IncidentDetail,
  GraphStructure,
  EntityLocation,
  PolicyTuneResult,
  PipelineStats,
  StreamingBenchmark,
  ThreeWayBenchmarkRow,
  HealthResponse,
  ConfidenceTier
} from '../types';

const BASE_URL = ((import.meta as any).env?.VITE_API_BASE_URL as string) || '/api';

export class ApiService {
  private static backendOnline: boolean = false;

  public static async checkHealth(): Promise<HealthResponse> {
    try {
      const res = await fetch(`${BASE_URL}/health`, { signal: AbortSignal.timeout(5000) });
      if (!res.ok) throw new Error(`API Error: ${res.status}`);
      this.backendOnline = true;
      return await res.json();
    } catch (e) {
      this.backendOnline = false;
      throw e;
    }
  }

  public static getBackendStatus(): boolean {
    return this.backendOnline;
  }

  public static async getPipelineStats(): Promise<PipelineStats> {
    const res = await fetch(`${BASE_URL}/stats`, { signal: AbortSignal.timeout(5000) });
    if (!res.ok) throw new Error(`API Error: ${res.status}`);
    return await res.json();
  }

  public static async getIncidents(params?: {
    page?: number;
    page_size?: number;
    tier?: string;
    min_risk?: number;
    search?: string;
  }): Promise<{ total_count: number; items: IncidentSummary[] }> {
    const resolvedParams = params || {};
    const query = new URLSearchParams();
    if (resolvedParams.tier && resolvedParams.tier.toUpperCase() !== 'ALL') query.append('tier', resolvedParams.tier);
    if (resolvedParams.min_risk !== undefined && resolvedParams.min_risk > 0) query.append('min_risk', resolvedParams.min_risk.toString());
    if (resolvedParams.search) query.append('search', resolvedParams.search);
    if (resolvedParams.page) query.append('page', resolvedParams.page.toString());
    if (resolvedParams.page_size) query.append('page_size', (resolvedParams.page_size || 50).toString());

    const res = await fetch(`${BASE_URL}/incidents?${query.toString()}`, { signal: AbortSignal.timeout(6000) });
    if (!res.ok) throw new Error(`API Error: ${res.status}`);
    const data = await res.json();
    return { total_count: data.total_count || 0, items: data.items || [] };
  }

  public static async getIncidentDetail(incidentId: string): Promise<IncidentDetail> {
    const res = await fetch(`${BASE_URL}/incidents/${incidentId}`, { signal: AbortSignal.timeout(6000) });
    if (!res.ok) throw new Error(`API Error: ${res.status}`);
    return await res.json();
  }

  public static async getIncidentGraph(incidentId: string): Promise<GraphStructure> {
    const res = await fetch(`${BASE_URL}/incidents/${incidentId}/graph`, { signal: AbortSignal.timeout(6000) });
    if (!res.ok) throw new Error(`API Error: ${res.status}`);
    return await res.json();
  }

  public static async getEntityLocations(): Promise<EntityLocation[]> {
    const res = await fetch(`${BASE_URL}/entities/locations`, { signal: AbortSignal.timeout(3000) });
    if (!res.ok) throw new Error(`API Error: ${res.status}`);
    const data = await res.json();
    if (Array.isArray(data)) return data;
    throw new Error('Invalid response format: expected array');
  }

  public static async tunePolicy(threshold: number, dataset?: string): Promise<PolicyTuneResult> {
    const res = await fetch(`${BASE_URL}/policy/tune`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        threshold,
        dataset: (dataset === 'IBM_B' || dataset === 'ibm') ? 'ibm' : 'synthetic'
      }),
      signal: AbortSignal.timeout(5000)
    });
    if (!res.ok) throw new Error(`API Error: ${res.status}`);
    return await res.json();
  }

  public static async tunePolicyThreshold(threshold: number, dataset?: string): Promise<PolicyTuneResult> {
    return this.tunePolicy(threshold, dataset);
  }

  public static async predictLiveEntity(entityId: string, maxHops: number = 3): Promise<any> {
    const res = await fetch(`${BASE_URL}/predict/subgraph`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ seed_entity_id: entityId, max_hops: maxHops }),
      signal: AbortSignal.timeout(5000)
    });
    if (!res.ok) throw new Error(`API Error: ${res.statusText}`);
    const data = await res.json();
    return {
      ...data,
      graphsage_risk_probability: data.risk_probability,
      confidence_tier: data.confidence_tier,
      top_terminal_id: data.terminals?.[0]?.terminal_id || 'NONE',
      top_terminal_city: data.terminals?.[0]?.city || 'N/A',
      subgraph_node_count: data.num_nodes,
      subgraph_edge_count: data.num_edges
    };
  }

  public static async getStreamingBenchmark(): Promise<StreamingBenchmark> {
    const res = await fetch(`${BASE_URL}/streaming/benchmark`, { signal: AbortSignal.timeout(5000) });
    if (!res.ok) throw new Error(`API Error: ${res.status}`);
    const data = await res.json();
    return {
      ingestion_rate_tx_per_sec: data.ingestion_rate_tx_per_sec,
      p50_latency_ms: data.p50_latency_ms,
      p90_latency_ms: data.p90_latency_ms,
      p95_latency_ms: data.p95_latency_ms,
      p99_latency_ms: data.p99_latency_ms,
      total_transactions_ingested: data.transactions_ingested,
      sub_50ms_sla_compliant: data.sub_50ms_sla_passed
    };
  }

  public static async getThreeWayBenchmarks(): Promise<ThreeWayBenchmarkRow[]> {
    const res = await fetch(`${BASE_URL}/benchmarks/three_way`, { signal: AbortSignal.timeout(5000) });
    if (!res.ok) throw new Error(`API Error: ${res.status}`);
    const data = await res.json();
    if (Array.isArray(data)) {
      return data.map((item: any) => ({
        dataset: item.dataset,
        evaluation_task: item.task_type || item.evaluation_task,
        sample_size: item.n_test ? `${item.n_test} test samples` : item.sample_size,
        xgboost_f1: item.xgboost_f1,
        graphsage_f1: item.graphsage_f1,
        f1_delta: item.f1_delta,
        precision: item.precision,
        recall: item.recall,
        pr_auc: item.graphsage_pr_auc || item.pr_auc
      }));
    }
    return [];
  }

  public static async getThreeWayBenchmark(): Promise<ThreeWayBenchmarkRow[]> {
    return this.getThreeWayBenchmarks();
  }
}
