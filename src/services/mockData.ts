import {
  IncidentSummary,
  IncidentDetail,
  GraphStructure,
  EntityLocation,
  PolicyTuneResult,
  PipelineStats,
  StreamingBenchmark,
  ThreeWayBenchmarkRow,
  HealthResponse
} from '../types';

export const MOCK_HEALTH: HealthResponse = {
  status: "HEALTHY",
  timestamp: new Date().toISOString(),
  graphsage_model_loaded: true,
  xgboost_model_loaded: true,
  database_connected: true,
  streaming_graph_nodes: 750,
  streaming_graph_edges: 5000
};

export const MOCK_PIPELINE_STATS: PipelineStats = {
  total_incidents_monitored: 1000,
  predictions_calibrated: 1000,
  tier_breakdown: {
    HIGH_CONFIDENCE: 142,
    MEDIUM_CONFIDENCE: 218,
    NORMAL: 640
  },
  model_comparison: {
    GraphSAGE_Test_F1: "90.66% ± 1.58%",
    XGBoost_Baseline_F1: "86.98% ± 2.28%",
    Terminal_Prediction_MRR: "1.0000",
    Top1_CashOut_Accuracy: "100.0%"
  }
};

export const MOCK_INCIDENTS: IncidentSummary[] = [
  {
    complaint_id: "C000001",
    reported_account_number: "ACC_992019283",
    reported_amount: 15000.00,
    scam_category: "Reward Points / Cashback SMS",
    district: "Patna",
    state: "Bihar",
    graphsage_risk_probability: 0.0160,
    confidence_tier: "NORMAL",
    top_terminal_id: "NONE",
    top_terminal_city: "No Exit Convergence"
  },
  {
    complaint_id: "C000002",
    reported_account_number: "ACC_881920391",
    reported_amount: 8500.00,
    scam_category: "Tech Support Impersonation",
    district: "Nagpur",
    state: "Maharashtra",
    graphsage_risk_probability: 0.0120,
    confidence_tier: "NORMAL",
    top_terminal_id: "NONE",
    top_terminal_city: "No Exit Convergence"
  },
  {
    complaint_id: "C000003",
    reported_account_number: "ACC_229103847",
    reported_amount: 267125.17,
    scam_category: "Payment Fraud",
    district: "Tirupati",
    state: "Andhra Pradesh",
    graphsage_risk_probability: 0.0290,
    confidence_tier: "NORMAL",
    top_terminal_id: "NONE",
    top_terminal_city: "No Exit Convergence"
  },
  {
    complaint_id: "C000004",
    reported_account_number: "ACC_112093849",
    reported_amount: 40000.00,
    scam_category: "Payment Fraud",
    district: "Ambala",
    state: "Haryana",
    graphsage_risk_probability: 0.7500,
    confidence_tier: "MEDIUM_CONFIDENCE",
    top_terminal_id: "ATM_020",
    top_terminal_city: "Ahmedabad"
  },
  {
    complaint_id: "C000005",
    reported_account_number: "ACC_772910384",
    reported_amount: 12000.00,
    scam_category: "Matrimonial / Dating Fraud",
    district: "Jaipur",
    state: "Rajasthan",
    graphsage_risk_probability: 0.0080,
    confidence_tier: "NORMAL",
    top_terminal_id: "NONE",
    top_terminal_city: "No Exit Convergence"
  },
  {
    complaint_id: "C000035",
    reported_account_number: "ACC_771829302",
    reported_amount: 398700.37,
    scam_category: "Online Banking Fraud",
    district: "Varanasi",
    state: "Uttar Pradesh",
    graphsage_risk_probability: 0.9936,
    confidence_tier: "HIGH_CONFIDENCE",
    top_terminal_id: "ATM_018",
    top_terminal_city: "Pune"
  },
  {
    complaint_id: "C000047",
    reported_account_number: "ACC_998124501",
    reported_amount: 345014.73,
    scam_category: "Shopping Fraud / Ponzi",
    district: "South Delhi",
    state: "Delhi",
    graphsage_risk_probability: 0.9638,
    confidence_tier: "HIGH_CONFIDENCE",
    top_terminal_id: "ATM_002",
    top_terminal_city: "Delhi"
  },
  {
    complaint_id: "C000048",
    reported_account_number: "ACC_442910839",
    reported_amount: 195000.00,
    scam_category: "Loan App Extortion / Harassment",
    district: "South West",
    state: "Delhi",
    graphsage_risk_probability: 0.9812,
    confidence_tier: "HIGH_CONFIDENCE",
    top_terminal_id: "ATM_002",
    top_terminal_city: "Delhi"
  },
  {
    complaint_id: "C000056",
    reported_account_number: "ACC_331094821",
    reported_amount: 80788.64,
    scam_category: "Identity Theft / Extortion",
    district: "Bikaner",
    state: "Rajasthan",
    graphsage_risk_probability: 0.9909,
    confidence_tier: "HIGH_CONFIDENCE",
    top_terminal_id: "ATM_023",
    top_terminal_city: "Bhopal"
  },
  {
    complaint_id: "C000080",
    reported_account_number: "ACC_550192847",
    reported_amount: 120000.00,
    scam_category: "Customs Parcel / Gift Courier Fraud",
    district: "Hyderabad",
    state: "Telangana",
    graphsage_risk_probability: 0.8415,
    confidence_tier: "MEDIUM_CONFIDENCE",
    top_terminal_id: "ATM_012",
    top_terminal_city: "Hyderabad"
  },
  {
    complaint_id: "C000122",
    reported_account_number: "ACC_881920394",
    reported_amount: 1000.00,
    scam_category: "Online Banking Fraud",
    district: "Rajkot",
    state: "Gujarat",
    graphsage_risk_probability: 0.7150,
    confidence_tier: "MEDIUM_CONFIDENCE",
    top_terminal_id: "ATM_020",
    top_terminal_city: "Ahmedabad"
  },
  {
    complaint_id: "C000150",
    reported_account_number: "ACC_662910482",
    reported_amount: 145000.00,
    scam_category: "SIM Swap / OTP Interception",
    district: "Pune",
    state: "Maharashtra",
    graphsage_risk_probability: 0.7110,
    confidence_tier: "MEDIUM_CONFIDENCE",
    top_terminal_id: "ATM_018",
    top_terminal_city: "Pune"
  }
];

export const MOCK_INCIDENT_DETAILS: Record<string, IncidentDetail> = {
  "C000047": {
    complaint: {
      complaint_id: "C000047",
      complaint_date: "2026-02-14T09:32:00Z",
      complainant_name: "Subhashree Mohanty",
      reported_account_number: "ACC_998124501",
      reported_ifsc: "HDFC0001420",
      reported_amount: 450000.00,
      scam_category: "Investment / Ponzi Crypto Scheme",
      location: "Khordha, Odisha"
    },
    resolved_canonical_entity: {
      entity_id: "ENT_000185",
      canonical_holder_name: "Rahul Dey",
      bank_name: "HDFC Bank (Bhubaneswar Main Branch)",
      coordinates: [20.271796, 85.835788]
    },
    model_prediction: {
      graphsage_risk_probability: 0.9988,
      confidence_tier: "HIGH_CONFIDENCE",
      top_terminal_id: "ATM_029",
      top_terminal_score: 0.6172,
      top_terminal_city: "Mumbai",
      executive_summary: "High-confidence suspicious laundering ring detected. Complaint funds were rapidly fanned out across 3 downstream mule hops within 14 hours and channeled towards ATM_029 in Mumbai."
    },
    investigative_evidence_bullets: [
      "High-confidence suspicious incident: GraphSAGE risk score is 0.9988, exceeding the 0.50 operational threshold.",
      "Topology spans 3 downstream entity hops with 5 validated AML structuring signals.",
      "Instantaneous velocity: 92.4% of disputed funds (₹4,15,800) moved out within 45 minutes of receipt.",
      "Resolved beneficiary entity ENT_000185 connects to 4 known high-velocity mule accounts across Mumbai and Bhubaneswar.",
      "Structural topology closely aligns with known mule ring signature #MR-2026-09 (similarity score: 0.9988)."
    ],
    top_terminal_details: {
      terminal_id: "ATM_029",
      city: "Mumbai",
      terminal_score: 0.6172,
      rationale: "Rapid downstream fund forwarding terminated at physical ATM cash withdrawal terminal ATM_029 located in Mumbai."
    }
  },
  "C000056": {
    complaint: {
      complaint_id: "C000056",
      complaint_date: "2026-02-18T14:15:00Z",
      complainant_name: "Anand Verma",
      reported_account_number: "ACC_331094821",
      reported_ifsc: "SBIN0004921",
      reported_amount: 820000.00,
      scam_category: "Digital Arrest / Law Enforcement Impersonation",
      location: "Bhopal, Madhya Pradesh"
    },
    resolved_canonical_entity: {
      entity_id: "ENT_000513",
      canonical_holder_name: "Vikramjit Singh",
      bank_name: "State Bank of India (MP Nagar)",
      coordinates: [23.259933, 77.412615]
    },
    model_prediction: {
      graphsage_risk_probability: 0.9988,
      confidence_tier: "HIGH_CONFIDENCE",
      top_terminal_id: "ATM_023",
      top_terminal_score: 0.7884,
      top_terminal_city: "Bhopal",
      executive_summary: "Severe multi-tier extortion chain identified. Rapid fund disbursement through synthetic intermediate accounts terminating at ATM_023."
    },
    investigative_evidence_bullets: [
      "Model-derived risk probability is 0.9988 (Tier: HIGH_CONFIDENCE).",
      "Immediate structuring: 6 split transfers of ₹1,35,000 executed within 18 minutes.",
      "Downstream terminal ATM_023 located in Bhopal identified with high cash-out affinity score of 0.7884.",
      "Identified as part of syndicate operation active in Madhya Pradesh and Rajasthan corridors."
    ],
    top_terminal_details: {
      terminal_id: "ATM_023",
      city: "Bhopal",
      terminal_score: 0.7884,
      rationale: "Downstream mule accounts terminated in multiple synchronized cash withdrawals at ATM_023 in MP Nagar."
    }
  }
};

export const MOCK_GRAPHS: Record<string, GraphStructure> = {
  "C000047": {
    incident_id: "C000047",
    num_nodes: 9,
    num_edges: 10,
    nodes: [
      {
        id: "ENT_000185",
        label: "Rahul Dey (Seed Complaint)",
        node_type: "ROOT",
        is_incident: true,
        is_terminal: false,
        hop_distance: 0,
        city: "Bhubaneswar",
        in_degree: 0,
        out_degree: 3,
        total_incoming_amount: 0,
        total_outgoing_amount: 450000,
        color: "#EF4444"
      },
      {
        id: "ENT_000214",
        label: "Mule Account 1",
        node_type: "ACCOUNT",
        is_incident: false,
        is_terminal: false,
        hop_distance: 1,
        city: "Bhubaneswar",
        in_degree: 1,
        out_degree: 2,
        total_incoming_amount: 150000,
        total_outgoing_amount: 148000,
        color: "#3B82F6"
      },
      {
        id: "ENT_000098",
        label: "Mule Account 2",
        node_type: "ACCOUNT",
        is_incident: false,
        is_terminal: false,
        hop_distance: 1,
        city: "Kolkata",
        in_degree: 1,
        out_degree: 2,
        total_incoming_amount: 180000,
        total_outgoing_amount: 175000,
        color: "#3B82F6"
      },
      {
        id: "ENT_000341",
        label: "Mule Account 3",
        node_type: "ACCOUNT",
        is_incident: false,
        is_terminal: false,
        hop_distance: 1,
        city: "Mumbai",
        in_degree: 1,
        out_degree: 1,
        total_incoming_amount: 120000,
        total_outgoing_amount: 119000,
        color: "#3B82F6"
      },
      {
        id: "ENT_000412",
        label: "Layering Node A",
        node_type: "ACCOUNT",
        is_incident: false,
        is_terminal: false,
        hop_distance: 2,
        city: "Mumbai",
        in_degree: 2,
        out_degree: 1,
        total_incoming_amount: 220000,
        total_outgoing_amount: 215000,
        color: "#06B6D4"
      },
      {
        id: "ENT_000509",
        label: "Layering Node B",
        node_type: "ACCOUNT",
        is_incident: false,
        is_terminal: false,
        hop_distance: 2,
        city: "Pune",
        in_degree: 1,
        out_degree: 1,
        total_incoming_amount: 103000,
        total_outgoing_amount: 100000,
        color: "#06B6D4"
      },
      {
        id: "ENT_000677",
        label: "Terminal Holder",
        node_type: "ACCOUNT",
        is_incident: false,
        is_terminal: false,
        hop_distance: 3,
        city: "Mumbai",
        in_degree: 2,
        out_degree: 1,
        total_incoming_amount: 315000,
        total_outgoing_amount: 310000,
        color: "#A855F7"
      },
      {
        id: "ATM_029",
        label: "ATM_029 (Mumbai Exit)",
        node_type: "ATM",
        is_incident: false,
        is_terminal: true,
        hop_distance: 3,
        city: "Mumbai",
        in_degree: 2,
        out_degree: 0,
        total_incoming_amount: 410000,
        total_outgoing_amount: 0,
        color: "#F59E0B"
      },
      {
        id: "ATM_014",
        label: "ATM_014 (Secondary Exit)",
        node_type: "ATM",
        is_incident: false,
        is_terminal: true,
        hop_distance: 2,
        city: "Pune",
        in_degree: 1,
        out_degree: 0,
        total_incoming_amount: 40000,
        total_outgoing_amount: 0,
        color: "#F59E0B"
      }
    ],
    edges: [
      { source: "ENT_000185", target: "ENT_000214", transaction_id: "TX_47_01", amount: 150000, timestamp: "2026-02-14T09:45:00Z", is_cash_out: false, channel: "IMPS" },
      { source: "ENT_000185", target: "ENT_000098", transaction_id: "TX_47_02", amount: 180000, timestamp: "2026-02-14T09:50:00Z", is_cash_out: false, channel: "NEFT" },
      { source: "ENT_000185", target: "ENT_000341", transaction_id: "TX_47_03", amount: 120000, timestamp: "2026-02-14T09:52:00Z", is_cash_out: false, channel: "UPI" },
      { source: "ENT_000214", target: "ENT_000412", transaction_id: "TX_47_04", amount: 100000, timestamp: "2026-02-14T10:15:00Z", is_cash_out: false, channel: "RTGS" },
      { source: "ENT_000214", target: "ENT_000509", transaction_id: "TX_47_05", amount: 48000, timestamp: "2026-02-14T10:20:00Z", is_cash_out: false, channel: "IMPS" },
      { source: "ENT_000098", target: "ENT_000412", transaction_id: "TX_47_06", amount: 120000, timestamp: "2026-02-14T10:30:00Z", is_cash_out: false, channel: "IMPS" },
      { source: "ENT_000341", target: "ENT_000677", transaction_id: "TX_47_07", amount: 119000, timestamp: "2026-02-14T10:45:00Z", is_cash_out: false, channel: "NEFT" },
      { source: "ENT_000412", target: "ENT_000677", transaction_id: "TX_47_08", amount: 196000, timestamp: "2026-02-14T11:10:00Z", is_cash_out: false, channel: "IMPS" },
      { source: "ENT_000677", target: "ATM_029", transaction_id: "TX_47_09", amount: 310000, timestamp: "2026-02-14T11:40:00Z", is_cash_out: true, channel: "ATM_WITHDRAWAL" },
      { source: "ENT_000509", target: "ATM_014", transaction_id: "TX_47_10", amount: 40000, timestamp: "2026-02-14T12:05:00Z", is_cash_out: true, channel: "ATM_WITHDRAWAL" }
    ]
  }
};

export const MOCK_POLICY_TABLE: PolicyTuneResult[] = [
  { threshold: 0.1, dataset: "synthetic", policy_tier_name: "HIGH_SENSITIVITY", total_eval_samples: 200, alerts_generated: 55, alert_rate_percent: 27.5, precision_percent: 67.27, recall_percent: 100.0, f1_score_percent: 80.43, false_positives: 18, true_positives: 37 },
  { threshold: 0.3, dataset: "synthetic", policy_tier_name: "BALANCED_TRIAGE", total_eval_samples: 200, alerts_generated: 46, alert_rate_percent: 23.0, precision_percent: 78.26, recall_percent: 97.3, f1_score_percent: 86.75, false_positives: 10, true_positives: 36 },
  { threshold: 0.5, dataset: "synthetic", policy_tier_name: "BALANCED_TRIAGE", total_eval_samples: 200, alerts_generated: 44, alert_rate_percent: 22.0, precision_percent: 81.82, recall_percent: 97.3, f1_score_percent: 88.89, false_positives: 8, true_positives: 36 },
  { threshold: 0.7, dataset: "synthetic", policy_tier_name: "HIGH_PRECISION", total_eval_samples: 200, alerts_generated: 40, alert_rate_percent: 20.0, precision_percent: 87.5, recall_percent: 94.59, f1_score_percent: 90.91, false_positives: 5, true_positives: 35 },
  { threshold: 0.8, dataset: "synthetic", policy_tier_name: "HIGH_PRECISION", total_eval_samples: 200, alerts_generated: 38, alert_rate_percent: 19.0, precision_percent: 92.11, recall_percent: 94.59, f1_score_percent: 93.33, false_positives: 3, true_positives: 35 },
  { threshold: 0.9, dataset: "synthetic", policy_tier_name: "HIGH_CONFIDENCE_ALERT", total_eval_samples: 200, alerts_generated: 30, alert_rate_percent: 15.0, precision_percent: 96.67, recall_percent: 78.38, f1_score_percent: 86.57, false_positives: 1, true_positives: 29 }
];

export const MOCK_THREE_WAY_BENCHMARK: ThreeWayBenchmarkRow[] = [
  {
    dataset: "Dataset A (Synthetic Typologies)",
    evaluation_task: "Incident Subgraph Binary Classification",
    sample_size: "N = 200 (37 Illicit / 18.5%)",
    xgboost_f1: "86.98% ± 2.28%",
    graphsage_f1: "90.66% ± 1.58%",
    f1_delta: "+3.69% (p = 0.0231 < 0.05)",
    precision: "89.66% ± 3.54%",
    recall: "91.89% ± 3.82%",
    pr_auc: "0.9680 ± 0.0117"
  },
  {
    dataset: "Dataset B (IBM AML Multi-Bank)",
    evaluation_task: "Holdout Subgraph Binary Classification",
    sample_size: "N = 200 (59 Illicit / 29.5%)",
    xgboost_f1: "73.93% ± 3.37%",
    graphsage_f1: "77.70% ± 2.57%",
    f1_delta: "+3.76% (p = 0.0032 < 0.01)",
    precision: "72.33% ± 2.11%",
    recall: "84.41% ± 7.80%",
    pr_auc: "0.8775 ± 0.0198"
  },
  {
    dataset: "Dataset C (Elliptic Bitcoin DAG)",
    evaluation_task: "Inductive Node Classification (UTXO Temporal)",
    sample_size: "N = 16,670 (1,083 Illicit / 6.50%)",
    xgboost_f1: "N/A (DAG Node Benchmark)",
    graphsage_f1: "46.44% ± 2.52%",
    f1_delta: "Inductive Baseline Established",
    precision: "35.75% ± 3.58%",
    recall: "66.85% ± 2.40%",
    pr_auc: "0.5118 ± 0.0396"
  }
];

export const MOCK_STREAMING_BENCHMARK: StreamingBenchmark = {
  status: "OPERATIONAL",
  window_hours: 72,
  total_transactions_ingested: 5000,
  ingestion_rate_tx_per_sec: 1448.90,
  total_inference_queries: 100,
  p50_latency_ms: 2.14,
  p90_latency_ms: 3.41,
  p95_latency_ms: 4.05,
  p99_latency_ms: 4.88,
  max_latency_ms: 4.95,
  sub_50ms_sla_compliant: true
};

export const MOCK_ENTITY_LOCATIONS: EntityLocation[] = [
  { entity_id: "ENT_000185", entity_type: "MULE_ACCOUNT", holder_name: "Rahul Dey", city: "Bhubaneswar", state: "Odisha", latitude: 20.271796, longitude: 85.835788, risk_probability: 0.9988, confidence_tier: "HIGH_CONFIDENCE", flagged_amount: 450000 },
  { entity_id: "ATM_029", entity_type: "ATM_TERMINAL", holder_name: "SBI ATM - Nariman Point", city: "Mumbai", state: "Maharashtra", latitude: 18.9255, longitude: 72.8242, risk_probability: 0.95, confidence_tier: "HIGH_CONFIDENCE", flagged_amount: 310000 },
  { entity_id: "ENT_000513", entity_type: "MULE_ACCOUNT", holder_name: "Vikramjit Singh", city: "Bhopal", state: "Madhya Pradesh", latitude: 23.259933, longitude: 77.412615, risk_probability: 0.9988, confidence_tier: "HIGH_CONFIDENCE", flagged_amount: 820000 },
  { entity_id: "ATM_023", entity_type: "ATM_TERMINAL", holder_name: "HDFC ATM - MP Nagar", city: "Bhopal", state: "Madhya Pradesh", latitude: 23.2324, longitude: 77.4332, risk_probability: 0.92, confidence_tier: "HIGH_CONFIDENCE", flagged_amount: 820000 },
  { entity_id: "ENT_000387", entity_type: "MULE_ACCOUNT", holder_name: "Pooja Hegde", city: "Bengaluru", state: "Karnataka", latitude: 12.9716, longitude: 77.5946, risk_probability: 0.9986, confidence_tier: "HIGH_CONFIDENCE", flagged_amount: 310000 },
  { entity_id: "ATM_008", entity_type: "ATM_TERMINAL", holder_name: "Axis ATM - Indiranagar", city: "Bengaluru", state: "Karnataka", latitude: 12.9784, longitude: 77.6408, risk_probability: 0.91, confidence_tier: "HIGH_CONFIDENCE", flagged_amount: 290000 },
  { entity_id: "ENT_000047", entity_type: "MULE_ACCOUNT", holder_name: "Amitabh Sen", city: "Delhi", state: "Delhi", latitude: 28.6139, longitude: 77.2090, risk_probability: 0.9969, confidence_tier: "HIGH_CONFIDENCE", flagged_amount: 195000 },
  { entity_id: "ATM_002", entity_type: "ATM_TERMINAL", holder_name: "ICICI ATM - Connaught Place", city: "Delhi", state: "Delhi", latitude: 28.6315, longitude: 77.2167, risk_probability: 0.88, confidence_tier: "HIGH_CONFIDENCE", flagged_amount: 190000 },
  { entity_id: "ENT_000493", entity_type: "MULE_ACCOUNT", holder_name: "Kavita Rao", city: "Jaipur", state: "Rajasthan", latitude: 26.9124, longitude: 75.7873, risk_probability: 0.8840, confidence_tier: "MEDIUM_CONFIDENCE", flagged_amount: 75000 },
  { entity_id: "ATM_015", entity_type: "ATM_TERMINAL", holder_name: "PNB ATM - MI Road", city: "Jaipur", state: "Rajasthan", latitude: 26.9198, longitude: 75.8115, risk_probability: 0.85, confidence_tier: "MEDIUM_CONFIDENCE", flagged_amount: 75000 },
  { entity_id: "ENT_000449", entity_type: "MULE_ACCOUNT", holder_name: "Syed Imran", city: "Hyderabad", state: "Telangana", latitude: 17.3850, longitude: 78.4867, risk_probability: 0.8415, confidence_tier: "MEDIUM_CONFIDENCE", flagged_amount: 120000 },
  { entity_id: "ATM_012", entity_type: "ATM_TERMINAL", holder_name: "SBI ATM - Banjara Hills", city: "Hyderabad", state: "Telangana", latitude: 17.4156, longitude: 78.4350, risk_probability: 0.82, confidence_tier: "MEDIUM_CONFIDENCE", flagged_amount: 110000 },
  { entity_id: "ENT_000576", entity_type: "MULE_ACCOUNT", holder_name: "Deepak Patel", city: "Ahmedabad", state: "Gujarat", latitude: 23.0225, longitude: 72.5714, risk_probability: 0.7930, confidence_tier: "MEDIUM_CONFIDENCE", flagged_amount: 98000 },
  { entity_id: "ATM_020", entity_type: "ATM_TERMINAL", holder_name: "Kotak ATM - SG Highway", city: "Ahmedabad", state: "Gujarat", latitude: 23.0543, longitude: 72.5189, risk_probability: 0.78, confidence_tier: "MEDIUM_CONFIDENCE", flagged_amount: 95000 },
  { entity_id: "ENT_000485", entity_type: "MULE_ACCOUNT", holder_name: "Sneha Kulkarni", city: "Pune", state: "Maharashtra", latitude: 18.5204, longitude: 73.8567, risk_probability: 0.7420, confidence_tier: "MEDIUM_CONFIDENCE", flagged_amount: 145000 },
  { entity_id: "ATM_018", entity_type: "ATM_TERMINAL", holder_name: "Canara ATM - Shivajinagar", city: "Pune", state: "Maharashtra", latitude: 18.5314, longitude: 73.8446, risk_probability: 0.75, confidence_tier: "MEDIUM_CONFIDENCE", flagged_amount: 140000 },
  { entity_id: "ENT_000325", entity_type: "MULE_ACCOUNT", holder_name: "Mathew George", city: "Kochi", state: "Kerala", latitude: 9.9312, longitude: 76.2673, risk_probability: 0.1250, confidence_tier: "NORMAL", flagged_amount: 25000 },
  { entity_id: "ATM_014", entity_type: "ATM_TERMINAL", holder_name: "Federal ATM - MG Road", city: "Kochi", state: "Kerala", latitude: 9.9723, longitude: 76.2789, risk_probability: 0.45, confidence_tier: "NORMAL", flagged_amount: 20000 }
];
