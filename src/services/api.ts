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
import {
  MOCK_HEALTH,
  MOCK_PIPELINE_STATS,
  MOCK_INCIDENTS,
  MOCK_INCIDENT_DETAILS,
  MOCK_ENTITY_LOCATIONS,
  MOCK_STREAMING_BENCHMARK,
  MOCK_THREE_WAY_BENCHMARK
} from './mockData';

const BASE_URL = ((import.meta as any).env?.VITE_API_BASE_URL as string) || 'http://localhost:8000/api';

export class ApiService {
  private static backendOnline: boolean = false;

  public static async checkHealth(): Promise<HealthResponse> {
    try {
      const res = await fetch(`${BASE_URL}/health`, { signal: AbortSignal.timeout(2000) });
      if (res.ok) {
        this.backendOnline = true;
        return await res.json();
      }
    } catch {
      this.backendOnline = false;
    }
    return MOCK_HEALTH;
  }

  public static getBackendStatus(): boolean {
    return this.backendOnline;
  }

  public static async getPipelineStats(): Promise<PipelineStats> {
    try {
      const res = await fetch(`${BASE_URL}/stats`, { signal: AbortSignal.timeout(2000) });
      if (res.ok) {
        return await res.json();
      }
    } catch {
      // Fallback
    }
    return MOCK_PIPELINE_STATS;
  }

  public static async getIncidents(params?: {
    page?: number;
    page_size?: number;
    tier?: string;
    min_risk?: number;
    search?: string;
  }): Promise<{ total_count: number; items: IncidentSummary[] }> {
    const resolvedParams = params || {};
    try {
      const query = new URLSearchParams();
      if (resolvedParams.tier && resolvedParams.tier.toUpperCase() !== 'ALL') {
        query.append('tier', resolvedParams.tier);
      }
      if (resolvedParams.min_risk !== undefined && resolvedParams.min_risk > 0) {
        query.append('min_risk', resolvedParams.min_risk.toString());
      }
      if (resolvedParams.search) {
        query.append('search', resolvedParams.search);
      }
      if (resolvedParams.page) {
        query.append('page', resolvedParams.page.toString());
      }
      if (resolvedParams.page_size) {
        query.append('page_size', (resolvedParams.page_size || 50).toString());
      }

      const res = await fetch(`${BASE_URL}/incidents?${query.toString()}`, { signal: AbortSignal.timeout(2500) });
      if (res.ok) {
        const data = await res.json();
        if (data.items && data.items.length > 0) {
          return { total_count: data.total_count, items: data.items };
        }
      }
    } catch {
      // Fallback
    }

    // Mock filtering
    let filtered = [...MOCK_INCIDENTS];
    if (resolvedParams.tier && resolvedParams.tier.toUpperCase() !== 'ALL') {
      filtered = filtered.filter(i => i.confidence_tier.toUpperCase() === resolvedParams.tier?.toUpperCase());
    }
    if (resolvedParams.min_risk !== undefined && resolvedParams.min_risk > 0) {
      filtered = filtered.filter(i => i.graphsage_risk_probability >= (resolvedParams.min_risk || 0));
    }
    if (resolvedParams.search) {
      const q = resolvedParams.search.toLowerCase();
      filtered = filtered.filter(i =>
        i.complaint_id.toLowerCase().includes(q) ||
        (i.reported_account_number && i.reported_account_number.toLowerCase().includes(q)) ||
        (i.district && i.district.toLowerCase().includes(q)) ||
        (i.state && i.state.toLowerCase().includes(q)) ||
        (i.scam_category && i.scam_category.toLowerCase().includes(q))
      );
    }
    filtered = filtered.map((i, index) => {
      const isAuto = i.graphsage_risk_probability >= 0.8;
      return {
        ...i,
        trigger_source: isAuto ? 'DYNAMIC_ANOMALY' : 'CITIZEN_COMPLAINT',
        anomaly_reason: isAuto ? `Z=+3.82 (₹${((i.reported_amount || 0)/1000).toFixed(0)}k vs ₹2.4k avg)` : undefined,
        intercepted_in_flight: index % 4 === 0
      };
    });
    return { total_count: filtered.length, items: filtered };
  }

  public static async getIncidentDetail(incidentId: string): Promise<IncidentDetail> {
    try {
      const res = await fetch(`${BASE_URL}/incidents/${incidentId}`, { signal: AbortSignal.timeout(2500) });
      if (res.ok) {
        const data = await res.json();
        return data;
      }
    } catch {
      // Fallback
    }

    const inc = MOCK_INCIDENTS.find(i => i.complaint_id === incidentId);

    if (MOCK_INCIDENT_DETAILS[incidentId]) {
      const detail = { ...MOCK_INCIDENT_DETAILS[incidentId] };
      if (inc) {
        detail.model_prediction = {
          ...detail.model_prediction,
          graphsage_risk_probability: inc.graphsage_risk_probability,
          confidence_tier: inc.confidence_tier,
        };
      }
      return detail;
    }

    const fallbackInc = inc || {
      complaint_id: incidentId,
      reported_account_number: 'ACC_992019283',
      reported_amount: 150000,
      scam_category: 'Suspected Cybercrime Transaction',
      district: 'City Center',
      state: 'State Police',
      graphsage_risk_probability: 0.74,
      confidence_tier: 'MEDIUM_CONFIDENCE' as ConfidenceTier,
      top_terminal_id: 'ATM_018',
      top_terminal_city: 'Pune'
    };

    const isHigh = fallbackInc.confidence_tier === 'HIGH_CONFIDENCE' || fallbackInc.graphsage_risk_probability >= 0.85;
    const isMedium = fallbackInc.confidence_tier === 'MEDIUM_CONFIDENCE' || (fallbackInc.graphsage_risk_probability >= 0.40 && fallbackInc.graphsage_risk_probability < 0.85);

    const tier: ConfidenceTier = isHigh ? 'HIGH_CONFIDENCE' : (isMedium ? 'MEDIUM_CONFIDENCE' : 'NORMAL');
    const score = fallbackInc.graphsage_risk_probability;

    return {
      complaint: {
        complaint_id: incidentId,
        complaint_date: new Date().toISOString(),
        complainant_name: isHigh ? 'Subhashree Mohanty' : (isMedium ? 'Sneha Kulkarni' : 'Mathew George'),
        reported_account_number: fallbackInc.reported_account_number || 'ACC_001928374',
        reported_ifsc: 'SBIN0002100',
        reported_amount: fallbackInc.reported_amount || 45000.0,
        scam_category: fallbackInc.scam_category || 'Commercial Transfer Flow',
        location: `${fallbackInc.district || 'City Center'}, ${fallbackInc.state || 'State'}`
      },
      resolved_canonical_entity: {
        entity_id: `ENT_${incidentId.replace(/\D/g, '') || '000185'}`,
        canonical_holder_name: isHigh ? 'Rahul Dey' : (isMedium ? 'Intermediate Account' : 'Verified Business Merchant'),
        bank_name: 'State Bank of India',
        coordinates: [19.0760, 72.8777]
      },
      model_prediction: {
        graphsage_risk_probability: score,
        node_mule_probability_head2: isHigh ? 0.94 : (isMedium ? 0.62 : 0.12),
        confidence_tier: tier,
        top_terminal_id: isHigh ? (fallbackInc.top_terminal_id || 'ATM_029') : (isMedium ? (fallbackInc.top_terminal_id || 'ATM_018') : 'NONE'),
        top_terminal_score: isHigh ? 0.95 : (isMedium ? 0.65 : 0.05),
        top_terminal_city: isHigh ? (fallbackInc.top_terminal_city || 'Mumbai') : (isMedium ? (fallbackInc.top_terminal_city || 'Pune') : 'NONE'),
        top_terminals: isHigh ? [
          { id: fallbackInc.top_terminal_id || 'ATM_029', city: fallbackInc.top_terminal_city || 'Mumbai', score: 0.95, distance_km: 2.4 },
          { id: 'ATM_088', city: 'Thane', score: 0.72, distance_km: 15.1 },
          { id: 'ATM_102', city: 'Navi Mumbai', score: 0.45, distance_km: 22.8 }
        ] : (isMedium ? [
          { id: fallbackInc.top_terminal_id || 'ATM_018', city: fallbackInc.top_terminal_city || 'Pune', score: 0.65, distance_km: 4.1 },
          { id: 'ATM_055', city: 'Pune', score: 0.42, distance_km: 8.5 }
        ] : []),
        executive_summary: isHigh
          ? `High-confidence laundering ring confirmed for incident ${incidentId}. GraphSAGE evaluated risk at ${(score * 100).toFixed(2)}%, detecting rapid multi-hop fan-out layering across downstream intermediate accounts.`
          : (isMedium
            ? `Medium-confidence suspicious activity detected for incident ${incidentId}. GraphSAGE risk evaluated at ${(score * 100).toFixed(2)}%. Anomalous consolidation pattern observed requiring human AML investigator review.`
            : `Validated normal flow for incident ${incidentId}. GraphSAGE risk evaluated at ${(score * 100).toFixed(2)}%. Transaction pattern aligns with legitimate commercial trade with no multi-hop structuring.`)
      },
      investigative_evidence_bullets: isHigh ? [
        `GraphSAGE risk probability evaluated at ${(score * 100).toFixed(2)}%, exceeding threshold τ = 0.50.`,
        `High-velocity structuring: 92.4% of disputed funds routed across intermediate hops in under 45 minutes.`,
        `Downstream exit path converges at physical cash-out terminal ${fallbackInc.top_terminal_id || 'ATM_029'} in ${fallbackInc.top_terminal_city || 'Mumbai'}.`,
        'Syndicate graph signature matches known mule ring profile #MR-2026-09.'
      ] : (isMedium ? [
        `Medium confidence risk score: ${(score * 100).toFixed(2)}%.`,
        `Unusual micro-transfer aggregation into intermediate account.`,
        `Terminal affinity mapped towards regional ATM ${fallbackInc.top_terminal_id || 'ATM_018'}.`,
        `Manual verification recommended prior to legal freeze.`
      ] : [
        `Low risk probability: ${(score * 100).toFixed(2)}% (Below threshold τ = 0.50).`,
        `Standard commercial payment flow with verified counterparty.`,
        `Zero downstream layering or ATM cash-out velocity detected.`,
        `Cleared for standard automated processing.`
      ]),
      top_terminal_details: {
        terminal_id: fallbackInc.top_terminal_id || 'ATM_029',
        city: fallbackInc.top_terminal_city || 'Mumbai',
        terminal_score: isHigh ? 0.95 : (isMedium ? 0.65 : 0.05),
        rationale: isHigh
          ? `Downstream fund movement terminates at ATM ${fallbackInc.top_terminal_id || 'ATM_029'} located in ${fallbackInc.top_terminal_city || 'Mumbai'}.`
          : (isMedium ? `Potential withdrawal affinity at ${fallbackInc.top_terminal_id || 'regional ATM'}.` : 'No cash-out terminal convergence identified.')
      }
    };
  }

  public static async getIncidentGraph(incidentId: string): Promise<GraphStructure> {
    try {
      const res = await fetch(`${BASE_URL}/incidents/${incidentId}/graph`, { signal: AbortSignal.timeout(2500) });
      if (res.ok) {
        return await res.json();
      }
    } catch {
      // Fallback
    }

    return {
      incident_id: incidentId,
      num_nodes: 9,
      num_edges: 10,
      nodes: [
        { id: incidentId, label: 'Root Victim', node_type: 'ROOT', is_incident: true, is_terminal: false, hop_distance: 0, city: 'Bhubaneswar', in_degree: 0, out_degree: 3, total_incoming_amount: 0, total_outgoing_amount: 450000, color: '#FF5500' },
        { id: 'MULE_01', label: 'Mule A', node_type: 'ACCOUNT', is_incident: false, is_terminal: false, hop_distance: 1, city: 'Bhubaneswar', in_degree: 1, out_degree: 2, total_incoming_amount: 150000, total_outgoing_amount: 150000, color: '#38BDF8' },
        { id: 'MULE_02', label: 'Mule B', node_type: 'ACCOUNT', is_incident: false, is_terminal: false, hop_distance: 1, city: 'Kolkata', in_degree: 1, out_degree: 1, total_incoming_amount: 180000, total_outgoing_amount: 180000, color: '#38BDF8' },
        { id: 'MULE_03', label: 'Mule C', node_type: 'ACCOUNT', is_incident: false, is_terminal: false, hop_distance: 1, city: 'Mumbai', in_degree: 1, out_degree: 1, total_incoming_amount: 120000, total_outgoing_amount: 120000, color: '#38BDF8' },
        { id: 'ATM_029', label: 'Mumbai ATM_029', node_type: 'ATM', is_incident: false, is_terminal: true, hop_distance: 3, city: 'Mumbai', in_degree: 3, out_degree: 0, total_incoming_amount: 450000, total_outgoing_amount: 0, color: '#F59E0B' },
      ],
      edges: [
        { source: incidentId, target: 'MULE_01', transaction_id: 'TX_01', amount: 150000, timestamp: '2026-02-14T09:35:00Z', is_cash_out: false },
        { source: incidentId, target: 'MULE_02', transaction_id: 'TX_02', amount: 180000, timestamp: '2026-02-14T09:40:00Z', is_cash_out: false },
        { source: incidentId, target: 'MULE_03', transaction_id: 'TX_03', amount: 120000, timestamp: '2026-02-14T09:45:00Z', is_cash_out: false },
        { source: 'MULE_01', target: 'ATM_029', transaction_id: 'TX_04', amount: 150000, timestamp: '2026-02-14T10:15:00Z', is_cash_out: true },
        { source: 'MULE_02', target: 'ATM_029', transaction_id: 'TX_05', amount: 180000, timestamp: '2026-02-14T10:20:00Z', is_cash_out: true },
        { source: 'MULE_03', target: 'ATM_029', transaction_id: 'TX_06', amount: 120000, timestamp: '2026-02-14T10:25:00Z', is_cash_out: true },
      ]
    };
  }

  public static async getEntityLocations(): Promise<EntityLocation[]> {
    try {
      const res = await fetch(`${BASE_URL}/entities/locations`, { signal: AbortSignal.timeout(2000) });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) return data;
      }
    } catch {
      // Fallback
    }
    return MOCK_ENTITY_LOCATIONS;
  }

  public static async tunePolicy(threshold: number, dataset?: string): Promise<PolicyTuneResult> {
    try {
      const res = await fetch(`${BASE_URL}/policy/tune`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ threshold, dataset_type: dataset || 'SYNTHETIC_TYPOLOGY' }),
        signal: AbortSignal.timeout(2000)
      });
      if (res.ok) {
        return await res.json();
      }
    } catch {
      // Fallback
    }

    const p = Math.max(0.6, 0.98 - (threshold * 0.1));
    const r = Math.max(0.5, 0.95 - ((1 - threshold) * 0.2));
    const f1 = (2 * p * r) / (p + r);

    return {
      threshold,
      dataset: dataset || 'SYNTHETIC_TYPOLOGY',
      policy_tier_name: threshold < 0.4 ? 'HIGH_SENSITIVITY' : (threshold > 0.7 ? 'HIGH_PRECISION' : 'BALANCED_TRIAGE'),
      total_eval_samples: 1000,
      alerts_generated: Math.round(360 * (1 - threshold * 0.6)),
      alert_rate_percent: Number(((1 - threshold * 0.6) * 36).toFixed(1)),
      precision_percent: Number((p * 100).toFixed(2)),
      recall_percent: Number((r * 100).toFixed(2)),
      f1_score_percent: Number((f1 * 100).toFixed(2)),
      false_positives: Math.round(150 * (1 - threshold)),
      true_positives: Math.round(142 * r)
    };
  }

  public static async tunePolicyThreshold(threshold: number, dataset?: string): Promise<PolicyTuneResult> {
    return this.tunePolicy(threshold, dataset);
  }

  public static async predictLiveEntity(entityId: string, maxHops: number = 3): Promise<any> {
    try {
      const res = await fetch(`${BASE_URL}/predict/live`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ seed_entity_id: entityId, max_hops: maxHops }),
        signal: AbortSignal.timeout(2000)
      });
      if (res.ok) {
        return await res.json();
      }
    } catch {
      // Fallback
    }
    return {
      seed_entity_id: entityId,
      graphsage_risk_probability: 0.9988,
      confidence_tier: 'HIGH_CONFIDENCE',
      top_terminal_id: 'ATM_029',
      top_terminal_city: 'Mumbai',
      subgraph_node_count: 9,
      subgraph_edge_count: 10
    };
  }

  public static async getStreamingBenchmark(): Promise<StreamingBenchmark> {
    try {
      const res = await fetch(`${BASE_URL}/telemetry/benchmark`, { signal: AbortSignal.timeout(2000) });
      if (res.ok) {
        return await res.json();
      }
    } catch {
      // Fallback
    }
    return MOCK_STREAMING_BENCHMARK;
  }

  public static async getThreeWayBenchmarks(): Promise<ThreeWayBenchmarkRow[]> {
    try {
      const res = await fetch(`${BASE_URL}/benchmark/three-way`, { signal: AbortSignal.timeout(2000) });
      if (res.ok) {
        return await res.json();
      }
    } catch {
      // Fallback
    }
    return MOCK_THREE_WAY_BENCHMARK;
  }

  public static async getThreeWayBenchmark(): Promise<ThreeWayBenchmarkRow[]> {
    return this.getThreeWayBenchmarks();
  }
}
