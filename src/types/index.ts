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
  intercepted_in_flight?: boolean;
  status?: string;
  assignedOfficerName?: string;
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
  node_mule_score?: number;
  is_dormant?: boolean;
  isolation_reason?: string;
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
  is_dormant?: boolean;
  dormant_reason?: string;
  lifetime_tx_count?: number;
  nearest_activity?: string;
  is_historical_expanded?: boolean;
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
  pr_auc: string;
}

// ==============================================================================
// Multi-Role & Enterprise Domain Interfaces
// ==============================================================================

export type UserRole =
  | 'COMPLAINANT'
  | 'POLICE'
  | 'CYBER_OFFICER'
  | 'BANK_EMPLOYEE'
  | 'BANK_MANAGER'
  | 'ADMIN';

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  bankId?: string | null;
  bankName?: string | null;
  jurisdictionId?: string | null;
  jurisdictionName?: string | null;
  employeeId?: string | null;
  phone?: string | null;
}

export interface AuthTokenResponse {
  accessToken: string;
  refreshToken?: string;
  tokenType: string;
  expiresIn: number;
  user: UserProfile;
}

// --- Emergency Freeze Domain ---
export type FreezeStatus = 'PENDING' | 'ACKNOWLEDGED' | 'FROZEN' | 'REJECTED' | 'EXPIRED';

export interface FreezeRequest {
  id: string;
  incidentId: string;
  complaintReference?: string;
  targetAccountId: string;
  targetAccountName?: string;
  bankId: string;
  bankName: string;
  ifscPrefix?: string;
  freezeAmount: number;
  reason: string;
  status: FreezeStatus;
  requestedByOfficerId: string;
  requestedByOfficerName?: string;
  requestedAt: string;
  slaDeadline: string;
  slaRemainingSeconds?: number;
  slaBreached?: boolean;
  acknowledgedAt?: string;
  frozenAt?: string;
  bankReferenceNumber?: string;
  rejectionReason?: string;
}

// --- Citizen Complaints Domain ---
export type ComplaintLifecycleStatus =
  | 'SUBMITTED'
  | 'UNDER_TRIAGE'
  | 'UNDER_INVESTIGATION'
  | 'FREEZE_INITIATED'
  | 'FUNDS_FROZEN'
  | 'ESCALATED'
  | 'RESOLVED'
  | 'CLOSED';

export interface CitizenComplaint {
  id: string;
  referenceNumber: string;
  complainantName: string;
  phone: string;
  victimAccount: string;
  victimIfsc: string;
  suspectAccount: string;
  suspectIfsc?: string;
  amount: number;
  transactionUtr: string;
  transactionTimestamp: string;
  category: string;
  incidentNarrative?: string;
  jurisdictionId?: string;
  jurisdictionName?: string;
  status: ComplaintLifecycleStatus;
  createdAt: string;
  updatedAt?: string;
  assignedOfficerName?: string;
  assignedOfficerRank?: string;
  riskScore?: number;
  confidenceTier?: ConfidenceTier;
  freezeCount?: number;
  evidenceFiles?: Array<{ id: string; fileName: string; fileType: string; uploadedAt: string; sizeBytes: number }>;
}

export interface ComplaintCreatePayload {
  complainantName: string;
  phone: string;
  victimAccount: string;
  victimIfsc: string;
  suspectAccount: string;
  suspectIfsc?: string;
  amount: number;
  transactionUtr: string;
  transactionTimestamp: string;
  category: string;
  incidentNarrative?: string;
  jurisdictionId?: string;
}

// --- Bank Upload Domain ---
export type BankUploadStatus = 'PENDING_REVIEW' | 'ACCEPTED' | 'REJECTED';

export interface BankUploadBatch {
  id: string;
  bankId: string;
  bankName: string;
  fileName: string;
  fileSizeBytes: number;
  totalTransactions: number;
  flaggedCount: number;
  uploadedAt: string;
  uploadedByUserName: string;
  status: BankUploadStatus;
  reviewNotes?: string;
  reviewedBy?: string;
  reviewedAt?: string;
}

// --- Admin & Jurisdictions ---
export interface BankMaster {
  id: string;
  code: string;
  name: string;
  active: boolean;
  ifscPrefixes?: string[];
  createdAt: string;
}

export interface JurisdictionMaster {
  id: string;
  name: string;
  level: 'STATE' | 'DISTRICT' | 'STATION';
  parentId?: string | null;
  path: string;
  createdAt: string;
}

export interface StaffUserMaster {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  employeeId?: string;
  bankId?: string;
  bankName?: string;
  jurisdictionId?: string;
  jurisdictionName?: string;
  status: 'ACTIVE' | 'DEACTIVATED';
  lastRosterSync?: string;
}

// --- MLOps Domain ---
export interface GraphSnapshot {
  id: string;
  snapshotName: string;
  capturedAt: string;
  totalNodes: number;
  totalEdges: number;
  anomalyRatePercent: number;
  f1Score: number;
  datasetType: string;
}

export interface RegisteredModel {
  id: string;
  modelName: string;
  version: string;
  framework: string;
  f1Score: number;
  prAuc: number;
  mrrScore: number;
  status: 'CHAMPION' | 'CANDIDATE' | 'ARCHIVED';
  trainedAt: string;
  parametersCount: number;
}
