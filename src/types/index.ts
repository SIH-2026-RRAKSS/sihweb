export type ConfidenceTier = 'HIGH_CONFIDENCE' | 'MEDIUM_CONFIDENCE' | 'NORMAL' | 'UNCLASSIFIED';

export interface IncidentSummary {
  complaint_id: string;
  reported_account_number?: string;
  reported_amount?: number;
  scam_category?: string;
  district?: string;
  state?: string;
  graphsage_risk_probability: number;
  confidence_tier: ConfidenceTier;
  top_terminal_id?: string;
  top_terminal_city?: string;
  trigger_source?: 'CITIZEN_COMPLAINT' | 'DYNAMIC_ANOMALY';
  anomaly_reason?: string;
  intercepted_in_flight?: boolean;
}

export interface ComplaintDetail {
  complaint_id: string;
  complaint_date: string;
  complainant_name: string;
  reported_account_number: string;
  reported_ifsc: string;
  reported_amount: number;
  scam_category: string;
  location: string;
}

export interface ResolvedEntity {
  entity_id: string;
  canonical_holder_name: string;
  bank_name: string;
  coordinates?: [number, number] | null;
}

export interface TerminalPredictionDetails {
  terminal_id?: string;
  city?: string;
  terminal_score?: number;
  rationale?: string;
  reason?: string;
}

export interface IncidentDetail {
  complaint: {
    complaint_id: string;
    complaint_date: string;
    complainant_name: string;
    reported_account_number: string;
    reported_ifsc: string;
    reported_amount: number;
    scam_category: string;
    location: string;
  };
  resolved_canonical_entity: {
    entity_id: string;
    canonical_holder_name: string;
    bank_name: string;
    coordinates: [number, number];
  };
  model_prediction: {
    graphsage_risk_probability: number; // Head 1: Macro Ring Risk
    node_mule_probability_head2?: number; // Head 2: Micro Node Risk
    confidence_tier: ConfidenceTier;
    top_terminal_id: string;
    top_terminal_score: number;
    top_terminal_city: string;
    top_terminals?: Array<{ id: string; city: string; score: number; distance_km: number }>;
    executive_summary: string;
  };
  investigative_evidence_bullets: string[];
  top_terminal_details?: TerminalPredictionDetails;
}

export interface GraphNode {
  id: string;
  label: string;
  node_type: 'ACCOUNT' | 'ATM' | 'ROOT';
  is_incident: boolean;
  is_terminal: boolean;
  hop_distance: number;
  city?: string;
  in_degree: number;
  out_degree: number;
  total_incoming_amount: number;
  total_outgoing_amount: number;
  color: string;
  x?: number;
  y?: number;
  vx?: number;
  vy?: number;
}

export interface GraphEdge {
  source: string;
  target: string;
  transaction_id: string;
  amount: number;
  timestamp?: string;
  is_cash_out: boolean;
  channel?: string;
}

export interface GraphStructure {
  incident_id: string;
  num_nodes: number;
  num_edges: number;
  nodes: GraphNode[];
  edges: GraphEdge[];
}

export interface PolicyTuneResult {
  threshold: number;
  dataset: string;
  policy_tier_name: string;
  total_eval_samples: number;
  alerts_generated: number;
  alert_rate_percent: number;
  precision_percent: number;
  recall_percent: number;
  f1_score_percent: number;
  false_positives: number;
  true_positives: number;
}

export interface HealthResponse {
  status: string;
  timestamp: string;
  graphsage_model_loaded: boolean;
  xgboost_model_loaded: boolean;
  database_connected: boolean;
  streaming_graph_nodes: number;
  streaming_graph_edges: number;
}

export interface PipelineStats {
  total_incidents_monitored: number;
  predictions_calibrated: number;
  tier_breakdown: {
    HIGH_CONFIDENCE: number;
    MEDIUM_CONFIDENCE: number;
    NORMAL: number;
  };
  model_comparison: {
    GraphSAGE_Test_F1: string;
    XGBoost_Baseline_F1: string;
    Terminal_Prediction_MRR: string;
    Top1_CashOut_Accuracy: string;
  };
}

export interface StreamingBenchmark {
  status?: string;
  window_hours?: number;
  total_transactions_ingested?: number;
  ingestion_rate_tx_per_sec: number;
  total_inference_queries?: number;
  p50_latency_ms: number;
  p90_latency_ms?: number;
  p95_latency_ms: number;
  p99_latency_ms: number;
  max_latency_ms?: number;
  sub_50ms_sla_compliant?: boolean;
}

export interface EntityLocation {
  entity_id: string;
  entity_type: 'MULE_ACCOUNT' | 'ATM_TERMINAL' | 'COMPLAINT_ORIGIN';
  holder_name?: string;
  city: string;
  state: string;
  latitude: number;
  longitude: number;
  risk_probability: number;
  confidence_tier: ConfidenceTier;
  flagged_amount?: number;
}

export interface ThreeWayBenchmarkRow {
  dataset: string;
  evaluation_task: string;
  sample_size: string;
  xgboost_f1: string;
  graphsage_f1: string;
  f1_delta: string;
  precision: string;
  recall: string;
  pr_auc: string;
}
