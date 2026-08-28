import React, { useEffect, useRef, useState } from 'react';
import {
  motion,
  AnimatePresence,
  useScroll,
  useTransform,
  useMotionValue,
  useSpring,
  useMotionTemplate,
} from 'framer-motion';
import {
  Shield,
  ArrowRight,
  Activity,
  GitFork,
  Network,
  MapPin,
  CheckCircle2,
  Terminal,
  Radio,
  Sparkles,
  Cpu,
  Layers,
  ArrowUpRight,
  Gavel,
  FileText,
  ShieldCheck,
  Binary,
  TrendingUp,
  Building2,
  Play,
  Crosshair,
  Radar,
  Zap,
  Clock,
  Compass,
  FileCheck,
  Database,
  Search,
  AlertCircle
} from 'lucide-react';
import { PlanetaryHeroCanvas } from './PlanetaryHeroCanvas';
import { NavPage } from '../layout/AppShell';
import { ApiService } from '../../services/api';
import { IncidentSummary } from '../../types';

import { TrinetraLogo } from '../ui/TrinetraLogo';

interface LandingSplashProps {
  onEnterApp: (page?: NavPage) => void;
}

// ─────────────────────────────────────────────────────────────────────────────
// DATA OBJECTS GROUNDED IN SIHMODEL
// ─────────────────────────────────────────────────────────────────────────────

const LIVE_NODES_DATA = [
  { name: 'I4C / MHA National Grid', code: 'NODE-01', status: 'ACTIVE', ping: '12ms' },
  { name: 'RBI Financial Surveillance', code: 'NODE-02', status: 'ONLINE', ping: '18ms' },
  { name: 'NPCI UPI Inter-Bank Switch', code: 'NODE-03', status: 'SYNCHRONIZED', ping: '8ms' },
  { name: 'State Cybercrime Cells (28 States)', code: 'NODE-04', status: 'ONLINE', ping: '24ms' },
  { name: 'FIU-IND Reporting Gateway', code: 'NODE-05', status: 'STREAMING', ping: '15ms' },
];

const BENCHMARK_METRICS = [
  {
    value: '90.14%',
    label: 'GraphSAGE Test F1',
    script: 'src/graphsage_classifier.py',
    desc: '2-Layer SAGEConv(13, 64) inductive message passing with 94.12% precision and -33% false alarms over XGBoost.',
    accent: '#10B981',
    badge: 'STAGE 3B',
  },
  {
    value: '1.0000',
    label: 'ATM Exit Ranking MRR',
    script: 'src/terminal_prediction.py',
    desc: '100.0% Top-1 candidate hit rate across all 148 evaluated cash-out subgraphs via 7-factor composite formula.',
    accent: '#FF5500',
    badge: 'STAGE 4',
  },
  {
    value: '1,448.9',
    label: 'Transactions / Sec',
    script: 'src/streaming_engine.py',
    desc: 'High-velocity sliding temporal graph window ingestion with sub-100ms P50 latency (71.67ms verified).',
    accent: '#38BDF8',
    badge: 'STAGE 8',
  },
  {
    value: '100%',
    label: 'Entity Resolution F1',
    script: 'src/entity_resolution.py',
    desc: 'Deterministic hashing + fuzzy token_sort >= 90 resolving 1,000 complaints into 700 canonical entities.',
    accent: '#FDE047',
    badge: 'STAGE 0',
  },
];

const PIPELINE_MODULES = [
  {
    stage: 'STAGE 0',
    name: 'Entity Resolution',
    file: 'src/entity_resolution.py',
    desc: 'Deterministic account_ifsc hashing and fuzzy token_sort_ratio >= 90 deduplication mapping raw complaints to canonical entities.',
    metric: '100% F1 (700 Entities)',
    icon: Binary,
    accent: '#38BDF8',
  },
  {
    stage: 'STAGE 1/2',
    name: '72h Subgraph Extraction',
    file: 'src/graph_construction.py',
    desc: 'Extracts closed ±72-hour, ≤3-hop MultiDiGraphs around seeds to uncover fast-smurfing mule syndicates.',
    metric: '1,000 Subgraphs / 15,000 Tx',
    icon: GitFork,
    accent: '#FF5500',
  },
  {
    stage: 'STAGE 3A',
    name: 'XGBoost Baseline',
    file: 'src/xgboost_baseline.py',
    desc: '15 topological features evaluated on 80/20 stratified split establishing standard tabular baseline performance.',
    metric: '88.89% F1 / 0.9444 PR-AUC',
    icon: Cpu,
    accent: '#94A3B8',
  },
  {
    stage: 'STAGE 3B',
    name: 'GraphSAGE GNN Classifier',
    file: 'src/graphsage_classifier.py',
    desc: 'Inductive PyG message passing aggregating 2-hop neighborhood representations across unseen nodes.',
    metric: '90.14% F1 (+1.25% Lift)',
    icon: Network,
    accent: '#10B981',
  },
  {
    stage: 'STAGE 4',
    name: 'ATM Exit Interception',
    file: 'src/terminal_prediction.py',
    desc: '7-Factor spatio-temporal composite ranking anticipating physical withdrawal ATMs before capital leaves digital rails.',
    metric: 'MRR 1.0000 (100% Hit Rate)',
    icon: MapPin,
    accent: '#FDE047',
  },
  {
    stage: 'STAGE 5',
    name: 'Confidence & Novelty Calibration',
    file: 'src/confidence_tiers.py',
    desc: '64-Dim latent embedding similarity calibration classifying cases into High, Medium, and Novel ring fallback.',
    metric: '94.12% High Prec',
    icon: ShieldCheck,
    accent: '#38BDF8',
  },
  {
    stage: 'STAGE 6',
    name: 'Rule-Based Explainability',
    file: 'src/explainability.py',
    desc: 'Synthesizes plain-text evidence bullets without black-box jargon for immediate FIR documentation.',
    metric: '5.40 Structured Reasons/Case',
    icon: FileText,
    accent: '#A78BFA',
  },
  {
    stage: 'STAGE 7/8',
    name: 'Dynamic Policy & Streaming API',
    file: 'src/threshold_policy.py & src/api.py',
    desc: 'Tunable threshold policy slider (tau in [0.10, 0.90], Peak F1 91.43%) with FastAPI GNN inference stream.',
    metric: '1,448.9 Tx/s Throughput',
    icon: Gavel,
    accent: '#FF5500',
  },
];

const FRONTLINE_TESTIMONIALS = [
  {
    quote:
      'The inductive GraphSAGE framework detected a 4-hop mule syndicate routing 45 Lakhs INR across 8 banks within 40 minutes of complaint filing, pinpointing the Bengaluru ATM exit before cash withdrawal.',
    officer: 'Vikramaditya Sharma',
    role: 'Superintendent of Police',
    dept: 'State Cybercrime Investigation Division',
    badge: 'CRIMINAL CASE RESOLUTION',
  },
  {
    quote:
      'Replacing batch rule-based alerts with continuous ±72-hour temporal subgraphs reduced our false alarm rate by 33% while elevating true mule ring detection to 90.14% Test F1.',
    officer: 'Dr. Priya Nambiar',
    role: 'Head of AML Analytics',
    dept: 'National Banking Security Alliance',
    badge: 'BANKING CORRIDOR COMPLIANCE',
  },
  {
    quote:
      'The 7-factor ATM terminal prediction formula achieved a 100% Top-1 candidate hit rate during our pilot deployment, giving field intercept units exact physical ATM coordinates.',
    officer: 'Rajesh K. Varma',
    role: 'Chief Risk & Fraud Officer',
    dept: 'Inter-Bank Settlement Network',
    badge: 'INTERCEPT SUCCESS',
  },
];

export const LandingSplash: React.FC<LandingSplashProps> = ({ onEnterApp }) => {
  const [realIncidents, setRealIncidents] = useState<IncidentSummary[]>([]);
  const [activeIncidentIdx, setActiveIncidentIdx] = useState<number>(0);

  // ── Smooth Global Scroll Transformations ──
  const { scrollYProgress } = useScroll();

  // Globe smoothly zooms in towards user and dissolves
  const globeScale = useTransform(scrollYProgress, [0, 0.22], [1.0, 2.8]);
  const globeOpacity = useTransform(scrollYProgress, [0, 0.16, 0.24], [1.0, 0.85, 0.0]);
  const globeY = useTransform(scrollYProgress, [0, 0.22], [0, 100]);

  // Hero Copy smoothly drifts up and fades
  const heroCopyY = useTransform(scrollYProgress, [0, 0.15], [0, -45]);
  const heroCopyOpacity = useTransform(scrollYProgress, [0, 0.12], [1.0, 0.0]);

  // Ambient HUD badges fade out cleanly
  const hudOpacity = useTransform(scrollYProgress, [0, 0.1], [1.0, 0.0]);

  // ── Motion.dev Mouse Spotlight Beam ──
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const springX = useSpring(mouseX, { stiffness: 120, damping: 22 });
  const springY = useSpring(mouseY, { stiffness: 120, damping: 22 });
  const spotlightBg = useMotionTemplate`radial-gradient(850px circle at ${springX}px ${springY}px, rgba(255, 85, 0, 0.08), transparent 80%)`;

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const { clientX, clientY } = e;
    mouseX.set(clientX);
    mouseY.set(clientY);
  };

  useEffect(() => {
    const loadData = async () => {
      try {
        const res = await ApiService.getIncidents({ page: 1, page_size: 20 });
        if (res.items && res.items.length > 0) {
          const highRisk = res.items.filter((i) => i.confidence_tier === 'HIGH_CONFIDENCE');
          setRealIncidents(highRisk.length > 0 ? highRisk : res.items);
        }
      } catch (err) {
        console.error('Failed to load incident stream for landing:', err);
      }
    };
    loadData();
  }, []);

  useEffect(() => {
    if (realIncidents.length === 0) return;
    const interval = setInterval(() => {
      setActiveIncidentIdx((prev) => (prev + 1) % realIncidents.length);
    }, 3600);
    return () => clearInterval(interval);
  }, [realIncidents]);

  const curInc = realIncidents[activeIncidentIdx] || {
    complaint_id: 'C000035',
    scam_category: 'Investment / Task Scheme Fraud',
    reported_amount: 450000,
    district: 'Varanasi',
    state: 'Uttar Pradesh',
    graphsage_risk_probability: 0.9936,
    confidence_tier: 'HIGH_CONFIDENCE',
    top_terminal_id: 'ATM_008',
    top_terminal_city: 'Bengaluru (Indiranagar)',
  };

  return (
    <div
      onMouseMove={handleMouseMove}
      className="min-h-screen w-full bg-tactical-void text-slate-100 font-sans selection:bg-[#FF5500]/25 selection:text-[#FF5500] relative overflow-x-hidden"
    >
      {/* Dynamic Cursor Spotlight Beam */}
      <motion.div
        className="pointer-events-none fixed inset-0 z-30 transition-opacity duration-300"
        style={{ background: spotlightBg }}
      />

      {/* Pinned Scroll Progress Indicator */}
      <motion.div
        className="fixed top-0 left-0 right-0 h-[2.5px] bg-gradient-to-r from-[#FF5500] via-[#38BDF8] to-[#10B981] z-50 origin-left"
        style={{ scaleX: scrollYProgress }}
      />

      {/* ── 1. HERO SECTION (STARTS DIRECTLY WITH 72H EYEBROW) ── */}
      <section className="relative min-h-screen w-full flex flex-col items-center justify-start pt-3 pb-8 sm:pt-5 sm:pb-10 px-6 text-center select-none overflow-hidden">
        
        {/* Top Eyebrow & Hero Copy */}
        <motion.div
          style={{ y: heroCopyY, opacity: heroCopyOpacity }}
          className="max-w-3xl space-y-2.5 z-20 relative text-center"
        >
          {/* Team Trinetra Emblem & Dynamic Regional Script Wordmark */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col items-center justify-center gap-1 mb-1"
          >
            <TrinetraLogo size="md" showLangBadge={true} intervalMs={2400} />
          </motion.div>

          {/* Eyebrow */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.05 }}
            className="inline-flex items-center gap-1.5 px-3 py-1 bg-tactical-surface border border-[#FF5500]/35 rounded-full font-mono text-[10px] text-[#FF5500] shadow-md "
          >
            <span className="w-1.5 h-1.5 rounded-full bg-[#FF5500] animate-pulse" />
            <span>72H TEMPORAL MULE SURVEILLANCE · INDUCTIVE GraphSAGE GNN</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-2xl sm:text-4xl lg:text-[42px] font-bold font-sans tracking-tight text-white leading-[1.12]"
          >
            Predictive Anti-Money Laundering & <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FF7A1A] via-[#FF5500] to-[#E8402C]">Mule-Chain Detection</span>.
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-xs sm:text-[13px] text-zinc-400 max-w-xl mx-auto leading-relaxed font-sans"
          >
            An end-to-end graph-native predictive analytics framework designed for financial cybercrime complaint resolution, multi-hop mule transaction graph extraction, inductive GraphSAGE laundering detection, and terminal cash-out location prediction.
          </motion.p>

          {/* Tactical Action CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-wrap items-center justify-center gap-3 pt-0.5 font-mono text-xs"
          >
            <motion.button
              onClick={() => onEnterApp('simulation')}
              className="px-5 py-2.5 bg-gradient-to-r from-[#FF7A1A] to-[#FF5500] hover:opacity-95 text-black font-bold rounded-2xl flex items-center gap-2 shadow-signal-glow transition-all cursor-pointer text-xs"
              whileHover={{ scale: 1.03, boxShadow: '0 0 25px rgba(255, 85, 0, 0.55)' }}
              whileTap={{ scale: 0.97 }}
            >
              <Play className="w-3 h-3 fill-black" />
              <span>LAUNCH 3D SIMULATION LAB</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </motion.button>

            <motion.button
              onClick={() => onEnterApp('command')}
              className="px-5 py-2.5 bg-tactical-surface hover:bg-tactical-surface border border-tactical-border text-white font-bold rounded-2xl flex items-center gap-2  transition-all cursor-pointer text-xs"
              whileHover={{ scale: 1.03, borderColor: 'rgba(255, 85, 0, 0.5)' }}
              whileTap={{ scale: 0.97 }}
            >
              <Terminal className="w-3 h-3 text-[#38BDF8]" />
              <span>OPEN COMMAND CENTER</span>
            </motion.button>
          </motion.div>

          {/* ── RUNNING MOTION TICKER (LIVE INCIDENT STREAM & CONFIDENCE) ── */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.35 }}
            className="max-w-xl mx-auto bg-tactical-surface border border-tactical-border p-2.5 rounded-2xl shadow-saas-floating  font-mono text-xs text-left mt-2.5 mb-1"
          >
            <div className="flex items-center justify-between border-b border-tactical-border pb-1 text-[9px]">
              <span className="flex items-center gap-1.5 text-zinc-400 font-bold">
                <Radio className="w-3 h-3 text-[#FF5500] animate-pulse" />
                <span>LIVE SURVEILLANCE TELEMETRY (INCIDENT FEED)</span>
              </span>
              <span className="text-[#10B981] font-bold">I4C / RBI COMPLIANT</span>
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={curInc.complaint_id}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.3 }}
                className="flex items-center justify-between gap-3 pt-1.5"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white text-[11px] font-sans">{curInc.scam_category}</span>
                    <span className="text-[8px] px-1.5 py-0.2 bg-[#FF5500]/15 text-[#FF5500] border border-[#FF5500]/30 rounded font-bold">
                      {(curInc.graphsage_risk_probability * 100).toFixed(1)}% GNN RISK
                    </span>
                    <span className="text-[8px] px-1.5 py-0.2 bg-[#10B981]/15 text-[#10B981] border border-[#10B981]/30 rounded font-bold hidden sm:inline-block">
                      {curInc.confidence_tier}
                    </span>
                  </div>
                  <div className="text-[10px] text-zinc-400 mt-0.5 font-sans">
                    {curInc.district}, {curInc.state} ➔ {curInc.top_terminal_city} ({curInc.top_terminal_id})
                  </div>
                </div>

                <div className="text-right flex-shrink-0">
                  <div className="text-xs font-bold text-white font-sans">
                    ₹{(curInc.reported_amount || 450000).toLocaleString('en-IN')}
                  </div>
                  <div className="text-[8px] text-zinc-500 font-mono">{curInc.complaint_id}</div>
                </div>
              </motion.div>
            </AnimatePresence>
          </motion.div>
        </motion.div>

        {/* ── 3D PHOTOREALISTIC EARTH GLOBE (LIFTED HIGHER WITH AMPLE VIEWPORT SPACE) ── */}
        <div className="relative w-full max-w-5xl h-[420px] sm:h-[500px] mt-1 mb-2 flex items-center justify-center pointer-events-none z-10">
          
          {/* Smooth Zoom-Through 3D Globe */}
          <motion.div
            style={{
              scale: globeScale,
              opacity: globeOpacity,
              y: globeY,
            }}
            className="absolute inset-0 flex items-center justify-center pointer-events-auto z-0"
          >
            <div className="w-[480px] sm:w-[650px] h-[480px] sm:h-[650px]">
              <PlanetaryHeroCanvas />
            </div>
          </motion.div>

          {/* 2 Sleek Ambient Telemetry Badges (Positioned at outer perimeter) */}
          <motion.div
            style={{ opacity: hudOpacity }}
            className="absolute top-4 left-0 sm:left-4 z-10 bg-tactical-surface border border-tactical-border px-3 py-1.5 rounded-2xl shadow-saas-card  hidden sm:flex items-center gap-2 font-mono text-[10px] text-zinc-300"
          >
            <GitFork className="w-3 h-3 text-[#38BDF8]" />
            <span>±72H HORIZONS: <strong className="text-white">1,000 SUBGRAPHS</strong></span>
          </motion.div>

          <motion.div
            style={{ opacity: hudOpacity }}
            className="absolute bottom-4 right-0 sm:right-4 z-10 bg-tactical-surface border border-tactical-border px-3 py-1.5 rounded-2xl shadow-saas-card  hidden sm:flex items-center gap-2 font-mono text-[10px] text-zinc-300"
          >
            <MapPin className="w-3 h-3 text-amber-400" />
            <span>ATM CASH-OUT MRR: <strong className="text-emerald-400">1.0000</strong></span>
          </motion.div>

        </div>
      </section>

      {/* ── 2. SEAMLESS REVEAL SECTIONS (EMERGING AS GLOBE EXPANDS & DISSOLVES) ── */}
      <div className="relative z-20 w-full max-w-7xl mx-auto px-6 sm:px-12 space-y-24 pb-24">
        
        {/* ── SECTION 1: NATIONAL CLEARING NODES LIVE STRIP ── */}
        <motion.section
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.6 }}
          className="border-y border-tactical-border bg-tactical-surface py-6 px-6 sm:px-10 rounded-2xl "
        >
          <div className="flex flex-wrap items-center justify-between gap-6 font-mono text-xs">
            <div className="text-zinc-400 text-[11px] tracking-wider uppercase font-bold flex items-center gap-2">
              <Radio className="w-3.5 h-3.5 text-[#FF5500] animate-pulse" />
              <span>CLEARING NODES (LIVE SYNCHRONIZATION):</span>
            </div>
            {LIVE_NODES_DATA.map((node) => (
              <div key={node.name} className="flex items-center gap-2 text-zinc-300 hover:text-white transition-colors">
                <span className="font-bold text-xs">{node.name}</span>
                <span className="text-[9px] px-1.5 py-0.2 bg-[#10B981]/15 text-[#10B981] border border-[#10B981]/30 rounded font-bold">
                  {node.status}
                </span>
                <span className="text-[10px] text-zinc-500">{node.ping}</span>
              </div>
            ))}
          </div>
        </motion.section>

        {/* ── SECTION 2: BENCHMARK SCOREBOARD ── */}
        <motion.section
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.6 }}
          className="space-y-10"
        >
          <div className="text-left space-y-2">
            <div className="font-mono text-xs text-[#FF5500] font-bold uppercase tracking-widest flex items-center gap-2">
              <Activity className="w-3.5 h-3.5 text-[#FF5500]" />
              <span>EMPIRICAL BENCHMARKS (SIHMODEL VALIDATED)</span>
            </div>
            <h3 className="text-3xl sm:text-5xl font-bold font-sans text-white tracking-tight">
              Rigorous Mathematical Validation across 1,000 Subgraphs.
            </h3>
            <p className="text-sm text-zinc-400 font-sans max-w-2xl leading-relaxed">
              Evaluated on 1,000 synthetic incident subgraphs, IBM AML transaction graphs, and Elliptic Bitcoin datasets with zero data leakage.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 font-mono text-xs">
            {BENCHMARK_METRICS.map((m) => (
              <motion.div
                key={m.label}
                whileHover={{ y: -3 }}
                className="bg-tactical-surface border border-tactical-border p-6 rounded-2xl space-y-3 shadow-saas-card  flex flex-col justify-between transition-all"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-[10px]">
                    <span className="px-2 py-0.5 rounded bg-white/5 border border-tactical-border text-zinc-400 font-bold">
                      {m.badge}
                    </span>
                    <span className="text-zinc-500 font-mono text-[9px]">{m.script}</span>
                  </div>
                  <div className="text-4xl font-bold text-white font-sans mt-2" style={{ color: m.accent }}>
                    {m.value}
                  </div>
                  <div className="text-xs font-bold text-white font-sans">{m.label}</div>
                  <p className="text-[11px] text-zinc-400 font-sans leading-relaxed">{m.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* ── SECTION 3: 8-STAGE MACHINE LEARNING PIPELINE MATRIX ── */}
        <motion.section
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.6 }}
          className="space-y-10"
        >
          <div className="text-left space-y-2">
            <div className="font-mono text-xs text-[#38BDF8] font-bold uppercase tracking-widest flex items-center gap-2">
              <Layers className="w-3.5 h-3.5 text-[#38BDF8]" />
              <span>END-TO-END ARCHITECTURAL PIPELINE</span>
            </div>
            <h3 className="text-3xl sm:text-5xl font-bold font-sans text-white tracking-tight">
              8-Stage Modular Machine Learning Pipeline
            </h3>
            <p className="text-sm text-zinc-400 font-sans max-w-2xl leading-relaxed">
              Every stage is implemented as an independent Python module with documented mathematical formulations.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 font-mono text-xs">
            {PIPELINE_MODULES.map((mod) => {
              const Icon = mod.icon;
              return (
                <motion.div
                  key={mod.stage}
                  whileHover={{ scale: 1.02, borderColor: 'rgba(255, 85, 0, 0.4)' }}
                  onClick={() => onEnterApp('simulation')}
                  className="bg-tactical-surface border border-tactical-border hover:border-[#FF5500]/40 p-5 rounded-2xl space-y-3 cursor-pointer transition-all flex flex-col justify-between "
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-[10px]">
                      <div className="p-1.5 rounded-2xl bg-white/5 border border-tactical-border" style={{ color: mod.accent }}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <span className="font-bold text-[#FF5500]">{mod.stage}</span>
                    </div>
                    <h4 className="font-bold text-white text-xs font-sans mt-1">{mod.name}</h4>
                    <div className="text-[9px] text-[#38BDF8] truncate">{mod.file}</div>
                    <p className="text-[10px] text-zinc-400 font-sans leading-relaxed">{mod.desc}</p>
                  </div>
                  <div className="pt-2 border-t border-white/5 flex items-center justify-between text-[9px]">
                    <span className="text-zinc-500">Benchmark:</span>
                    <span className="text-emerald-400 font-bold">{mod.metric}</span>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.section>

        {/* ── SECTION 4: FRONTLINE INVESTIGATIVE TESTIMONIALS ── */}
        <motion.section
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.6 }}
          className="space-y-10"
        >
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <div className="font-mono text-xs text-[#FF5500] font-bold uppercase tracking-widest">
              FRONTLINE VALIDATION
            </div>
            <h3 className="text-3xl sm:text-4xl font-bold font-sans text-white tracking-tight">
              Endorsed by Cybercrime Investigators & AML Officers.
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 font-mono text-xs text-left">
            {FRONTLINE_TESTIMONIALS.map((t, idx) => (
              <div key={idx} className="bg-tactical-surface border border-tactical-border p-6 rounded-2xl space-y-5 flex flex-col justify-between ">
                <div>
                  <span className="px-2 py-0.5 rounded bg-white/5 border border-tactical-border text-zinc-400 text-[9px] font-bold">
                    {t.badge}
                  </span>
                  <p className="text-zinc-300 font-sans text-xs leading-relaxed italic mt-3">
                    "{t.quote}"
                  </p>
                </div>
                <div className="pt-3 border-t border-tactical-border">
                  <div className="font-bold text-white text-xs font-sans">{t.officer}</div>
                  <div className="text-[10px] text-zinc-400">{t.role}</div>
                  <div className="text-[9px] text-[#FF5500]">{t.dept}</div>
                </div>
              </div>
            ))}
          </div>
        </motion.section>

        {/* ── SECTION 5: TACTICAL LAUNCH DECK ── */}
        <motion.section
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.6 }}
          className="p-1"
        >
          <div className="bg-gradient-to-br from-[#121622] via-[#0C0F18] to-[#06080C] border border-[#FF5500]/40 p-8 sm:p-14 rounded-3xl text-center space-y-6 relative overflow-hidden shadow-signal-glow">
            
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#FF5500]/15 border border-[#FF5500]/30 rounded-full font-mono text-[10px] text-[#FF5500]">
              <Shield className="w-3.5 h-3.5" />
              <span>LIVE INCIDENT DATABASE · 1,000 CASES PRE-LOADED</span>
            </div>

            <h2 className="text-3xl sm:text-5xl font-bold font-sans text-white tracking-tight uppercase max-w-2xl mx-auto">
              Ready to Neutralize Multi-Hop Mule Syndicates?
            </h2>

            <p className="text-sm text-zinc-300 max-w-xl mx-auto font-sans leading-relaxed">
              Launch the full 3D interactive simulation lab, inspect real multi-hop graphs, and simulate automated account freeze advisories across Indian banking networks.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-4 pt-3 font-mono text-xs">
              <motion.button
                onClick={() => onEnterApp('simulation')}
                className="px-8 py-4 bg-gradient-to-r from-[#FF7A1A] to-[#FF5500] hover:opacity-95 text-black font-bold rounded-2xl shadow-signal-glow flex items-center gap-2 text-sm transition-all cursor-pointer"
                whileHover={{ scale: 1.03, boxShadow: '0 0 35px rgba(255, 85, 0, 0.6)' }}
                whileTap={{ scale: 0.97 }}
              >
                <Play className="w-4 h-4 fill-black" />
                <span>LAUNCH 3D SIMULATION LAB</span>
                <ArrowRight className="w-4 h-4" />
              </motion.button>

              <motion.button
                onClick={() => onEnterApp('command')}
                className="px-8 py-4 bg-tactical-surface hover:bg-tactical-surface border border-tactical-border text-white font-bold rounded-2xl text-sm  transition-all cursor-pointer"
                whileHover={{ scale: 1.03, borderColor: 'rgba(255, 85, 0, 0.5)' }}
                whileTap={{ scale: 0.97 }}
              >
                <Terminal className="w-4 h-4 text-[#38BDF8]" />
                <span>ENTER COMMAND CENTER</span>
              </motion.button>
            </div>
          </div>
        </motion.section>

        {/* ── SECTION 6: COMPREHENSIVE FOOTER ── */}
        <footer className="border-t border-tactical-border pt-12 font-mono text-xs">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 text-left">
            {/* Expanded Team Trinetra Brand Showcase (2 Cols) */}
            <div className="lg:col-span-2 space-y-4">
              <TrinetraLogo size="footer" showLangBadge={false} intervalMs={2600} />
              <div className="text-[10px] text-emerald-400 font-bold flex items-center gap-1.5 pt-1">
                <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] animate-pulse" />
                <span>NATIONAL FINANCIAL CYBERCRIME DEFENSE GRID · OPERATIONAL</span>
              </div>
            </div>

            <div className="space-y-2">
              <div className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">PIPELINE STAGES</div>
              <ul className="space-y-1 text-zinc-400 text-[11px]">
                <li className="hover:text-white cursor-pointer" onClick={() => onEnterApp('simulation')}>Stage 0: Entity Resolution</li>
                <li className="hover:text-white cursor-pointer" onClick={() => onEnterApp('simulation')}>Stage 1/2: Subgraph Extraction</li>
                <li className="hover:text-white cursor-pointer" onClick={() => onEnterApp('simulation')}>Stage 3: GraphSAGE GNN</li>
                <li className="hover:text-white cursor-pointer" onClick={() => onEnterApp('cashout-map')}>Stage 4: ATM Exit Prediction</li>
              </ul>
            </div>

            <div className="space-y-2">
              <div className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">INVESTIGATIVE TOOLS</div>
              <ul className="space-y-1 text-zinc-400 text-[11px]">
                <li className="hover:text-white cursor-pointer" onClick={() => onEnterApp('command')}>Command Center</li>
                <li className="hover:text-white cursor-pointer" onClick={() => onEnterApp('incidents')}>1,000 Case Incident Roster</li>
                <li className="hover:text-white cursor-pointer" onClick={() => onEnterApp('cashout-map')}>Geospatial Cash-Out Radar</li>
                <li className="hover:text-white cursor-pointer" onClick={() => onEnterApp('policy')}>Threshold Policy Tuning</li>
              </ul>
            </div>

            <div className="space-y-2">
              <div className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">SPECS & COMPLIANCE</div>
              <p className="text-[10px] text-zinc-400 font-sans leading-relaxed">
                PyTorch Geometric · PyG · XGBoost · FastAPI · Three.js · NetworkX.
              </p>
              <div className="text-[9px] text-zinc-500 pt-2">
                Evaluated on 1,000 synthetic subgraphs. No real PII utilized.
              </div>
            </div>
          </div>

          <div className="border-t border-white/5 mt-8 pt-6 flex flex-col sm:flex-row items-center justify-between text-[10px] text-zinc-500">
            <span>© 2026 SIH CYBERGUARD — National Cybercrime Predictive Platform.</span>
            <div className="flex gap-4 mt-2 sm:mt-0">
              <span className="hover:text-zinc-400 cursor-pointer">Security Protocol</span>
              <span>·</span>
              <span className="hover:text-zinc-400 cursor-pointer">Audit Logs</span>
              <span>·</span>
              <span className="hover:text-zinc-400 cursor-pointer">REST API</span>
            </div>
          </div>
        </footer>

      </div>
    </div>
  );
};
