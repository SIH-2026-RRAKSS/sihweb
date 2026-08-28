import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { motion, AnimatePresence, useScroll, useTransform, useMotionValue, useSpring, useMotionTemplate } from 'framer-motion';
import {
  Shield,
  Zap,
  FlaskConical,
  MapPin,
  ArrowRight,
  ChevronDown,
  Terminal,
  Activity,
  Layers,
  Cpu,
  Binary,
  GitFork,
  Network,
  ShieldCheck,
  FileText,
  Gavel,
  CheckCircle2,
  Clock,
  Radio,
  ExternalLink,
  Flame,
  AlertTriangle,
  Lock,
  Boxes,
  RotateCcw,
  Sparkles,
  Eye,
  Sliders,
  TrendingUp,
  Code,
  HelpCircle,
  BarChart3,
  Server
} from 'lucide-react';
import { ApiService } from '../../services/api';
import { IncidentSummary } from '../../types';
import { NavPage } from '../layout/AppShell';

interface LandingSplashProps {
  onEnterApp: (page?: NavPage) => void;
}

// Interactive Stepper Tabs mapped to actual model stages
const HERO_STEPS = [
  { id: 'GRAPH', num: '01', label: '72H SUBGRAPH (STAGE 2)', desc: 'Extracts closed ±72h, ≤3-hop directed MultiDiGraph incident subgraphs around canonical entity seeds.' },
  { id: 'GNN', num: '02', label: 'GraphSAGE GNN (STAGE 3)', desc: 'Inductive SAGEConv(13, 64) message passing achieving 90.14% Test F1 and -33% false alarms over XGBoost.' },
  { id: 'CASHOUT', num: '03', label: 'ATM EXIT RANKING (STAGE 4)', desc: '7-factor multi-criteria composite ranking anticipating physical cash-out terminals with MRR 1.0000.' },
  { id: 'EXPLAIN', num: '04', label: 'TIERS & EXPLAINABILITY (STAGE 5/6)', desc: '64-dim embedding uncertainty calibration (High/Med/Novel) and structured plain-English briefings (5.40 reasons/case).' },
  { id: 'POLICY', num: '05', label: 'TUNABLE POLICY & STREAM (STAGE 7/8)', desc: 'Investigator-tunable decision threshold (τ ∈ [0.10, 0.90], Peak F1 91.43%) with 1,448.9 Tx/sec stream processing.' },
];

const METRICS_STRIP = [
  { label: 'INCIDENT SUBGRAPHS', value: '1,000', sub: '±72h, ≤3-Hop Closed Horizons', icon: GitFork, color: 'text-[#FF5500]' },
  { label: 'GRAPHSAGE TEST F1', value: '90.14%', sub: '-33% False Alarms vs XGBoost', icon: Network, color: 'text-[#38BDF8]' },
  { label: 'ATM PREDICTION MRR', value: '1.0000', sub: '100.0% Top-1 Candidate Hit Rate', icon: MapPin, color: 'text-amber-400' },
  { label: 'STREAM INGESTION', value: '1,448.9', sub: 'Tx/Sec (71.67ms P50 Latency)', icon: Activity, color: 'text-emerald-400' },
];

const LIVE_TICKER_STREAM = [
  { id: 'C000035', state: 'UP', city: 'Varanasi ➔ Bengaluru', amount: '₹4,50,000', terminal: 'ATM_008', risk: '99.4%', tier: 'HIGH_CONFIDENCE' },
  { id: 'C000056', state: 'MP', city: 'Bhopal MP Nagar', amount: '₹8,20,000', terminal: 'ATM_023', risk: '99.1%', tier: 'HIGH_CONFIDENCE' },
  { id: 'C000047', state: 'MH', city: 'Delhi ➔ Mumbai', amount: '₹4,50,000', terminal: 'ATM_029', risk: '96.4%', tier: 'HIGH_CONFIDENCE' },
  { id: 'C000122', state: 'RJ', city: 'Jaipur Consolidation', amount: '₹71,500', terminal: 'ATM_015', risk: '71.5%', tier: 'MEDIUM_CONFIDENCE' },
  { id: 'C000001', state: 'KL', city: 'Kochi Retail Settlement', amount: '₹25,000', terminal: 'MERCHANT', risk: '1.6%', tier: 'NORMAL' },
];

const ARCHITECTURE_FAQS = [
  {
    q: 'Why does GraphSAGE outperform XGBoost on multi-hop mule detection?',
    a: 'Tabular models like XGBoost only inspect flat aggregated node metrics (e.g. out-degree, total transacted volume), making them blind to intermediate fan-out, fan-in structuring, and topological flow bottlenecks. GraphSAGE aggregates relational features from 2-hop neighborhoods via SAGEConv, capturing syndicate structures with 94.12% precision and a 33% reduction in false positives.',
  },
  {
    q: 'How does Stage 4 predict physical ATM cash-out exit locations?',
    a: 'The terminal predictor computes a composite ranking score using 7 observable signals: S_gnn (0.25), S_hop (0.20), S_cw (0.20), S_vol (0.15), S_rec (0.10), S_up (0.05), and S_geo (0.05). Across all 148 evaluated subgraphs containing cash exits, the Top-1 candidate achieved a 100.00% hit rate with MRR 1.0000.',
  },
  {
    q: 'What is the purpose of the ±72-hour closed subgraph horizon in Stage 2?',
    a: 'Mule accounts typically disperse stolen capital into cash within hours of a cybercrime complaint. Strictly bounding graphs to ±72 hours and ≤3 hops captures the full operational lifecycle of the money trail while preventing exponential graph expansion across national banking networks.',
  },
  {
    q: 'How does Stage 5 handle novel, first-time laundering rings?',
    a: 'Stage 5 extracts 64-dimensional latent graph embeddings from the GNN read-out layer and measures cosine similarity against cataloged reference rings. Incidents with elevated GNN risk (P ≥ 0.50) but low reference similarity (< 0.85) are flagged as FIRST_TIME_RING_CANDIDATE to surface emerging syndicates rather than forcing premature attribution.',
  },
];

// Procedural 3D Builders in Cyberguard Orange / Obsidian
function createATMKioskModel(): THREE.Group {
  const group = new THREE.Group();

  const body = new THREE.Mesh(
    new THREE.BoxGeometry(4.2, 8.5, 4.2),
    new THREE.MeshStandardMaterial({ color: 0x0c0e12, metalness: 0.9, roughness: 0.2 })
  );
  body.position.y = 4.25;
  body.castShadow = true;
  group.add(body);

  const screenBezel = new THREE.Mesh(
    new THREE.BoxGeometry(3.2, 2.8, 0.6),
    new THREE.MeshStandardMaterial({ color: 0x060709, roughness: 0.5 })
  );
  screenBezel.position.set(0, 5.6, 2.0);
  group.add(screenBezel);

  const screen = new THREE.Mesh(
    new THREE.PlaneGeometry(2.6, 2.0),
    new THREE.MeshBasicMaterial({ color: 0xff5500, side: THREE.DoubleSide })
  );
  screen.position.set(0, 5.6, 2.32);
  group.add(screen);

  const slot = new THREE.Mesh(
    new THREE.BoxGeometry(2.2, 0.4, 0.8),
    new THREE.MeshStandardMaterial({ color: 0x10b981, emissive: 0x10b981, emissiveIntensity: 0.8 })
  );
  slot.position.set(0, 3.4, 2.0);
  group.add(slot);

  const canopy = new THREE.Mesh(
    new THREE.BoxGeometry(4.4, 1.4, 4.4),
    new THREE.MeshStandardMaterial({ color: 0xff5500, emissive: 0xff5500, emissiveIntensity: 0.9 })
  );
  canopy.position.set(0, 9.2, 0);
  group.add(canopy);

  const ring = new THREE.Mesh(
    new THREE.RingGeometry(5.5, 7.0, 32),
    new THREE.MeshBasicMaterial({ color: 0xff5500, transparent: true, opacity: 0.45, side: THREE.DoubleSide })
  );
  ring.rotateX(-Math.PI / 2);
  ring.position.y = 0.05;
  group.add(ring);

  return group;
}

function createBankVaultModel(): THREE.Group {
  const group = new THREE.Group();

  const vault = new THREE.Mesh(
    new THREE.BoxGeometry(6, 6, 6),
    new THREE.MeshStandardMaterial({ color: 0x141820, metalness: 0.95, roughness: 0.15 })
  );
  vault.position.y = 3.0;
  vault.castShadow = true;
  group.add(vault);

  const rim = new THREE.Mesh(
    new THREE.CylinderGeometry(2.4, 2.4, 0.6, 24),
    new THREE.MeshStandardMaterial({ color: 0xff5500, metalness: 0.8, roughness: 0.2 })
  );
  rim.rotateX(Math.PI / 2);
  rim.position.set(0, 3.0, 3.1);
  group.add(rim);

  const wheel = new THREE.Mesh(
    new THREE.TorusGeometry(1.6, 0.2, 8, 24),
    new THREE.MeshStandardMaterial({ color: 0xffffff, metalness: 0.9 })
  );
  wheel.position.set(0, 3.0, 3.4);
  group.add(wheel);

  return group;
}

function createMobileUPITerminalModel(): THREE.Group {
  const group = new THREE.Group();

  const phone = new THREE.Mesh(
    new THREE.BoxGeometry(3.2, 6.2, 0.5),
    new THREE.MeshStandardMaterial({ color: 0x0a0c10, metalness: 0.9, roughness: 0.1 })
  );
  phone.position.y = 3.5;
  phone.rotation.x = -Math.PI / 14;
  group.add(phone);

  const screen = new THREE.Mesh(
    new THREE.PlaneGeometry(2.8, 5.4),
    new THREE.MeshBasicMaterial({ color: 0x38bdf8, side: THREE.DoubleSide })
  );
  screen.position.set(0, 3.5, 0.28);
  screen.rotation.x = -Math.PI / 14;
  group.add(screen);

  const ring = new THREE.Mesh(
    new THREE.TorusGeometry(3.4, 0.15, 8, 24),
    new THREE.MeshBasicMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.8 })
  );
  ring.position.y = 3.5;
  ring.rotation.x = Math.PI / 3;
  group.add(ring);

  return group;
}

export const LandingSplash: React.FC<LandingSplashProps> = ({ onEnterApp }) => {
  const canvasRef = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLDivElement>(null);

  const [activeStep, setActiveStep] = useState<number>(0);
  const [openFaqIdx, setOpenFaqIdx] = useState<number | null>(0);
  const [compareTab, setCompareTab] = useState<'GNN' | 'XGBOOST'>('GNN');
  const [realIncidents, setRealIncidents] = useState<IncidentSummary[]>([]);
  const [activeIncidentIdx, setActiveIncidentIdx] = useState<number>(0);

  // ── Motion.dev Scroll Parallax Hooks ──
  const { scrollYProgress } = useScroll();
  const heroY = useTransform(scrollYProgress, [0, 0.25], [0, 60]);
  const hero3DScale = useTransform(scrollYProgress, [0, 0.3], [1, 0.9]);

  // ── Motion.dev Mouse Spotlight Beam ──
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const springX = useSpring(mouseX, { stiffness: 120, damping: 25 });
  const springY = useSpring(mouseY, { stiffness: 120, damping: 25 });
  const spotlightBackground = useMotionTemplate`radial-gradient(650px circle at ${springX}px ${springY}px, rgba(255, 85, 0, 0.14), transparent 80%)`;

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const { clientX, clientY } = e;
    mouseX.set(clientX);
    mouseY.set(clientY);
  };

  // Fetch real complaints from Database
  useEffect(() => {
    const loadRealData = async () => {
      try {
        const res = await ApiService.getIncidents({ page: 1, page_size: 20 });
        if (res.items && res.items.length > 0) {
          const highRisk = res.items.filter(i => i.confidence_tier === 'HIGH_CONFIDENCE');
          setRealIncidents(highRisk.length > 0 ? highRisk : res.items);
        }
      } catch (err) {
        console.error('Failed to load incident stream for landing:', err);
      }
    };
    loadRealData();
  }, []);

  useEffect(() => {
    if (realIncidents.length === 0) return;
    const interval = setInterval(() => {
      setActiveIncidentIdx(prev => (prev + 1) % realIncidents.length);
    }, 4500);
    return () => clearInterval(interval);
  }, [realIncidents]);

  // 3D Canvas Scene
  useEffect(() => {
    const container = canvasRef.current;
    if (!container) return;

    const width = container.clientWidth;
    const height = container.clientHeight;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x060709);
    scene.fog = new THREE.FogExp2(0x060709, 0.005);

    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 1000);
    camera.position.set(0, 60, 110);
    camera.lookAt(0, 5, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    container.appendChild(renderer.domElement);

    scene.add(new THREE.AmbientLight(0xf4f4f5, 0.9));

    const keyLight = new THREE.DirectionalLight(0xffffff, 2.2);
    keyLight.position.set(50, 80, 50);
    keyLight.castShadow = true;
    scene.add(keyLight);

    const rimLight = new THREE.DirectionalLight(0xff5500, 1.8);
    rimLight.position.set(-60, 30, -50);
    scene.add(rimLight);

    const plinthGroup = new THREE.Group();
    const plinthGeo = new THREE.CylinderGeometry(60, 64, 4, 48);
    const plinthMat = new THREE.MeshStandardMaterial({ color: 0x0c0e12, roughness: 0.5, metalness: 0.6 });
    const plinth = new THREE.Mesh(plinthGeo, plinthMat);
    plinth.position.y = -2;
    plinth.receiveShadow = true;
    plinthGroup.add(plinth);

    const gridHelper = new THREE.GridHelper(100, 24, 0xff5500, 0x1f242e);
    gridHelper.position.y = 0.05;
    (gridHelper.material as THREE.Material).transparent = true;
    (gridHelper.material as THREE.Material).opacity = 0.4;
    plinthGroup.add(gridHelper);
    scene.add(plinthGroup);

    const vault = createBankVaultModel();
    vault.position.set(-32, 0, 0);
    plinthGroup.add(vault);

    const phone1 = createMobileUPITerminalModel();
    phone1.position.set(-10, 0, -16);
    plinthGroup.add(phone1);

    const phone2 = createMobileUPITerminalModel();
    phone2.position.set(10, 0, 16);
    plinthGroup.add(phone2);

    const atm = createATMKioskModel();
    atm.position.set(32, 0, 0);
    plinthGroup.add(atm);

    const makeCurve = (p1: THREE.Vector3, p2: THREE.Vector3, colorHex: number) => {
      const mid = new THREE.Vector3().addVectors(p1, p2).multiplyScalar(0.5);
      mid.y += 8;
      const curve = new THREE.QuadraticBezierCurve3(p1, mid, p2);
      const geom = new THREE.BufferGeometry().setFromPoints(curve.getPoints(30));
      const mat = new THREE.LineBasicMaterial({ color: colorHex, transparent: true, opacity: 0.8 });
      return new THREE.Line(geom, mat);
    };

    plinthGroup.add(makeCurve(new THREE.Vector3(-32, 0, 0), new THREE.Vector3(-10, 0, -16), 0xff5500));
    plinthGroup.add(makeCurve(new THREE.Vector3(-10, 0, -16), new THREE.Vector3(10, 0, 16), 0x38bdf8));
    plinthGroup.add(makeCurve(new THREE.Vector3(10, 0, 16), new THREE.Vector3(32, 0, 0), 0xf59e0b));

    let animId: number;
    const animate = () => {
      animId = requestAnimationFrame(animate);
      plinthGroup.rotation.y += 0.0015;
      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  const curInc = realIncidents[activeIncidentIdx] || {
    complaint_id: 'C000035',
    scam_category: 'Investment / Part-Time Job Task Scheme',
    reported_amount: 450000,
    district: 'Varanasi',
    state: 'Uttar Pradesh',
    graphsage_risk_probability: 0.9936,
    confidence_tier: 'HIGH_CONFIDENCE',
    top_terminal_id: 'ATM_008',
    top_terminal_city: 'Bengaluru (Indiranagar)'
  };

  return (
    <div
      onMouseMove={handleMouseMove}
      className="min-h-screen bg-[#060709] text-slate-100 font-sans selection:bg-[#FF5500]/20 selection:text-[#FF5500] relative overflow-x-hidden"
    >
      {/* ── Motion.dev Dynamic Mouse-Tracking Spotlight Halo ── */}
      <motion.div
        className="pointer-events-none fixed inset-0 z-30 transition-opacity duration-300"
        style={{ background: spotlightBackground }}
      />

      {/* ── Floating Background Ambient Cyber Orbs ── */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden opacity-30">
        <motion.div
          animate={{ x: [0, 50, -30, 0], y: [0, -40, 40, 0] }}
          transition={{ duration: 15, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute top-[10%] left-[5%] w-[450px] h-[450px] rounded-full bg-[#FF5500]/15 blur-[120px]"
        />
        <motion.div
          animate={{ x: [0, -40, 30, 0], y: [0, 50, -30, 0] }}
          transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute top-[45%] right-[5%] w-[500px] h-[500px] rounded-full bg-[#38BDF8]/15 blur-[140px]"
        />
        <motion.div
          animate={{ x: [0, 30, -50, 0], y: [0, -30, 40, 0] }}
          transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute top-[80%] left-[20%] w-[400px] h-[400px] rounded-full bg-emerald-500/10 blur-[120px]"
        />
      </div>

      {/* ── Pinned Scroll Progress Indicator ── */}
      <motion.div
        className="fixed top-0 left-0 right-0 h-[2.5px] bg-gradient-to-r from-[#FF5500] via-[#FF7700] to-[#38BDF8] z-50 origin-left"
        style={{ scaleX: scrollYProgress }}
      />

      {/* ── TOP CYBERNETIC NAVIGATION BAR ── */}
      <header className="fixed top-0 left-0 right-0 z-40 h-16 bg-[#060709]/90 backdrop-blur-md border-b border-white/10 px-6 flex items-center justify-between font-mono text-xs">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded bg-[#FF5500] text-black font-bold flex items-center justify-center shadow-signal-glow">
            <Shield className="w-4 h-4 fill-current" />
          </div>
          <div>
            <div className="text-sm font-bold tracking-tight text-white font-sans flex items-center gap-2">
              <span>SIH CYBERGUARD</span>
              <span className="text-[9px] bg-[#FF5500]/15 text-[#FF5500] border border-[#FF5500]/30 px-1.5 py-0.2 rounded font-mono font-bold">
                DEFCON-2
              </span>
            </div>
            <div className="text-[10px] text-zinc-500 font-mono">
              NATIONAL AML FRAUD RADAR & MULE-CHAIN SURVEILLANCE
            </div>
          </div>
        </div>

        <div className="hidden md:flex items-center gap-6 text-zinc-400 font-mono text-xs">
          <span className="flex items-center gap-1.5 text-white">
            <span className="w-2 h-2 rounded-full bg-[#FF5500] animate-pulse" />
            <span>SURVEILLANCE: ACTIVE</span>
          </span>
          <span>THROUGHPUT: <strong className="text-white font-sans">1,448.9 TX/S</strong></span>
          <span>TERMINAL MRR: <strong className="text-[#FF5500] font-sans">1.0000</strong></span>
        </div>

        <motion.button
          onClick={() => onEnterApp('command')}
          className="px-4 py-2 bg-[#FF5500] hover:bg-[#FF5500]/90 text-black font-bold rounded flex items-center gap-2 shadow-signal-glow transition-all text-xs font-mono"
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
        >
          <span>ENTER COMMAND CENTER</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </motion.button>
      </header>

      {/* ── HERO SECTION: MULTI-LAYER SCROLL PARALLAX ── */}
      <section
        ref={heroRef}
        className="relative min-h-[92vh] flex flex-col justify-center px-6 pt-24 pb-8 max-w-7xl mx-auto z-10"
      >
        <motion.div
          style={{ y: heroY }}
          className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center"
        >
          
          {/* Left Column: Authentic Problem Statement & Actions (7 Cols) */}
          <div className="lg:col-span-7 space-y-6 text-left">
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="inline-flex items-center gap-2 px-3 py-1 bg-[#0C0E12] border border-[#FF5500]/40 rounded font-mono text-xs text-[#FF5500] shadow-md"
            >
              <span className="w-2 h-2 rounded-full bg-[#FF5500] animate-pulse" />
              <span>72H TEMPORAL MULE SURVEILLANCE · INDUCTIVE GraphSAGE GNN</span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-3xl sm:text-5xl lg:text-6xl font-bold font-sans tracking-tight text-white uppercase leading-[1.05]"
            >
              CYBERCRIME PREDICTIVE ANALYTICS — <span className="text-[#FF5500]">AML & MULE-CHAIN</span> DETECTION PIPELINE
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-sm sm:text-base text-zinc-300 max-w-xl leading-relaxed font-sans"
            >
              An end-to-end, graph-native predictive analytics framework designed for financial cybercrime complaint resolution, multi-hop mule transaction graph extraction, inductive Graph Neural Network (GraphSAGE) laundering detection, terminal cash-out location prediction, uncertainty confidence calibration, and rule-based investigative explainability.
            </motion.p>

            {/* CTAs with Spring Reactions */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="flex flex-wrap items-center gap-4 pt-2 font-mono text-xs"
            >
              <motion.button
                onClick={() => onEnterApp('simulation')}
                className="px-6 py-3.5 bg-[#FF5500] hover:bg-[#FF5500]/90 text-black font-bold rounded shadow-signal-glow flex items-center gap-2 transition-all"
                whileHover={{ scale: 1.02, boxShadow: '0 0 25px rgba(255, 85, 0, 0.4)' }}
                whileTap={{ scale: 0.98 }}
              >
                <FlaskConical className="w-4 h-4 fill-current" />
                <span>⚡ LAUNCH 3D SIMULATION LAB</span>
              </motion.button>

              <motion.button
                onClick={() => onEnterApp('cashout-map')}
                className="px-6 py-3.5 bg-[#0C0E12] hover:bg-[#14171C] border border-white/20 text-white font-bold rounded flex items-center gap-2 transition-all"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <MapPin className="w-4 h-4 text-[#FF5500]" />
                <span>GEOSPATIAL CASH-OUT MAP</span>
              </motion.button>
            </motion.div>

            {/* ── LIVE INTER-BANK FRAUD STREAM CARD (FROM DATABASE) ── */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="bg-[#0C0E12] border border-[#FF5500]/30 rounded-lg p-3.5 font-mono text-xs shadow-industrial-md space-y-2 max-w-xl backdrop-blur-md"
            >
              <div className="flex items-center justify-between border-b border-white/10 pb-2 text-[10px]">
                <span className="flex items-center gap-1.5 text-zinc-400 font-bold">
                  <Radio className="w-3 h-3 text-[#FF5500] animate-pulse" />
                  <span>INTER-BANK FRAUD LEDGER STREAM (LIVE DATABASE)</span>
                </span>
                <span className="text-zinc-500">I4C / RBI COMPLIANT</span>
              </div>

              <div className="flex items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white text-xs">{curInc.scam_category || 'Suspected Flow'}</span>
                    <span className="text-[9px] px-1.5 py-0.2 bg-[#FF5500]/20 text-[#FF5500] border border-[#FF5500]/40 rounded font-bold">
                      {(curInc.graphsage_risk_probability * 100).toFixed(1)}% {curInc.confidence_tier}
                    </span>
                  </div>
                  <div className="text-[11px] text-zinc-400 truncate mt-0.5">
                    {curInc.district}, {curInc.state} {curInc.top_terminal_city && curInc.top_terminal_city !== 'NONE' ? `➔ ${curInc.top_terminal_city} (${curInc.top_terminal_id})` : '➔ Direct Settlement'}
                  </div>
                </div>

                <div className="text-right flex-shrink-0 font-sans">
                  <div className="text-sm font-bold text-white">₹{(curInc.reported_amount || 0).toLocaleString('en-IN')}</div>
                  <div className="text-[9px] text-zinc-500 font-mono">{curInc.complaint_id}</div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Right Column: 3D Cybernetic Radar Plinth with Scroll Parallax (5 Cols) */}
          <motion.div
            style={{ scale: hero3DScale }}
            className="lg:col-span-5 h-[440px] sm:h-[480px] bg-[#0C0E12] border border-[#FF5500]/20 rounded-xl overflow-hidden relative shadow-industrial-lg"
          >
            <div ref={canvasRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

            <div className="absolute top-3 left-3 bg-[#060709]/80 backdrop-blur-md border border-white/10 px-3 py-1.5 rounded font-mono text-[10px] text-zinc-300">
              <div className="text-[#FF5500] font-bold">3D AML TOPOLOGY SANDBOX</div>
              <div className="text-zinc-500">REAL-TIME INFERENCE</div>
            </div>

            <div className="absolute bottom-3 left-3 right-3 bg-[#060709]/80 backdrop-blur-md border border-white/10 p-2 rounded flex justify-between items-center font-mono text-[10px]">
              <span className="text-[#FF5500] font-bold">ATM EXIT ACCURACY: 100% (MRR 1.0)</span>
              <span className="text-zinc-400">P50: 71.67ms</span>
            </div>
          </motion.div>

        </motion.div>

        {/* ── MOTION.DEV INTERACTIVE STEPPER TABS (01-05) WITH LAYOUTID ── */}
        <div className="mt-12 grid grid-cols-2 sm:grid-cols-5 gap-2 font-mono text-xs">
          {HERO_STEPS.map((step, idx) => {
            const isCur = activeStep === idx;
            return (
              <motion.div
                key={step.id}
                onClick={() => setActiveStep(idx)}
                className={`relative p-3 rounded cursor-pointer transition-colors z-10 ${
                  isCur
                    ? 'text-white'
                    : 'bg-[#0C0E12]/80 border border-white/10 text-zinc-400 hover:border-white/20'
                }`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {isCur && (
                  <motion.div
                    layoutId="heroStepPill"
                    className="absolute inset-0 bg-[#FF5500]/15 border border-[#FF5500] rounded shadow-signal-glow z-[-1]"
                    transition={{ type: 'spring', stiffness: 350, damping: 28 }}
                  />
                )}

                <div className="flex items-center justify-between text-[10px] mb-1">
                  <span className="text-[#FF5500] font-bold">{step.num}</span>
                  <span className="text-zinc-500 text-[9px]">PIPELINE</span>
                </div>
                <div className="font-bold text-xs truncate text-white">{step.label}</div>
                <div className="text-[10px] text-zinc-400 truncate mt-1">{step.desc}</div>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* ── SECTION 2: LIVE METRIC COUNTERS STRIP ── */}
      <section className="py-12 px-6 border-y border-white/10 bg-[#080A0E] relative z-10">
        <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 font-mono">
          {METRICS_STRIP.map((m, idx) => {
            const Icon = m.icon;
            return (
              <motion.div
                key={m.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: idx * 0.08 }}
                whileHover={{ scale: 1.02, borderColor: 'rgba(255, 85, 0, 0.4)' }}
                className="bg-[#0C0E12] border border-white/10 p-5 rounded-lg space-y-1.5 shadow-industrial-sm"
              >
                <div className="flex items-center justify-between text-[10px] text-zinc-500">
                  <span>{m.label}</span>
                  <Icon className={`w-4 h-4 ${m.color}`} />
                </div>
                <div className="text-3xl font-bold font-sans text-white tracking-tight">
                  {m.value}
                </div>
                <div className="text-[10px] text-zinc-400">
                  {m.sub}
                </div>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* ── SECTION 3: INFINITE LIVE ALERT MARQUEE RIBBON ── */}
      <div className="border-b border-white/10 bg-[#0C0E12]/80 overflow-hidden py-2.5 font-mono text-[11px] select-none">
        <motion.div
          animate={{ x: [0, -1200] }}
          transition={{ repeat: Infinity, duration: 28, ease: 'linear' }}
          className="flex items-center gap-8 whitespace-nowrap"
        >
          {[...LIVE_TICKER_STREAM, ...LIVE_TICKER_STREAM].map((item, i) => (
            <div key={i} className="flex items-center gap-3">
              <span className="w-1.5 h-1.5 rounded-full bg-[#FF5500] animate-pulse" />
              <span className="text-white font-bold">{item.id} ({item.state})</span>
              <span className="text-zinc-400">{item.city}</span>
              <span className="text-emerald-400 font-bold">{item.amount}</span>
              <span className="px-1.5 py-0.2 bg-[#FF5500]/20 text-[#FF5500] border border-[#FF5500]/40 rounded text-[9px] font-bold">
                {item.risk} {item.tier}
              </span>
              <span className="text-amber-400 text-[10px]">➔ {item.terminal}</span>
              <span className="text-zinc-600">|</span>
            </div>
          ))}
        </motion.div>
      </div>

      {/* ── SECTION 4: BENTO MATRIX WITH 3D HOVER TILT & SCROLL PARALLAX ── */}
      <section className="py-24 px-6 max-w-7xl mx-auto space-y-12 z-10 relative">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.5 }}
          className="text-center space-y-3"
        >
          <div className="font-mono text-xs text-[#FF5500] font-bold uppercase tracking-widest">
            Tactical Architecture
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold font-sans text-white tracking-tight">
            Engineered for Frontline AML Investigators
          </h2>
          <p className="text-sm text-zinc-400 max-w-2xl mx-auto">
            Traditional AML engines look at isolated accounts. GraphSAGE captures temporal multi-hop graph topology across institutions.
          </p>
        </motion.div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-mono text-xs">
          
          {/* Card 1: 3-Hop Mule Chain Dissector */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.5 }}
            whileHover={{ scale: 1.01, rotateX: 1, rotateY: -1 }}
            className="md:col-span-2 bg-[#0C0E12] border border-[#FF5500]/30 p-6 rounded-xl space-y-4 shadow-industrial-sm flex flex-col justify-between"
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between text-[10px]">
                <span className="text-[#FF5500] font-bold uppercase tracking-wider">TYPOLOGY DISSECTOR</span>
                <span className="px-2 py-0.5 bg-[#FF5500]/15 text-[#FF5500] border border-[#FF5500]/30 rounded font-bold">DEFCON-2</span>
              </div>
              <h3 className="text-xl font-bold text-white font-sans">Multi-Hop Layering & Fast-Smurfing Chains</h3>
              <p className="text-xs text-zinc-400 font-sans leading-relaxed">
                Illicit funds are rapidly fanned out across multiple intermediate accounts within 45 minutes to defeat legacy 24-hour batch rules.
              </p>
            </div>

            <div className="bg-[#060709] p-4 border border-white/10 rounded-lg space-y-3">
              <div className="flex items-center justify-between text-[10px] text-zinc-400">
                <span>SIMULATED ATTACK FLOW:</span>
                <span className="text-[#FF5500] font-bold">₹4,50,000 DISPUTED</span>
              </div>

              <div className="grid grid-cols-4 gap-2 text-center text-[10px]">
                <div className="p-2 bg-white/5 border border-white/10 rounded">
                  <div className="text-zinc-500">SEED ORIGIN</div>
                  <div className="text-white font-bold mt-1">Victim Safe</div>
                  <div className="text-[#FF5500] text-[9px]">Odisha HDFC</div>
                </div>
                <div className="p-2 bg-[#38BDF8]/10 border border-[#38BDF8]/30 rounded">
                  <div className="text-[#38BDF8]">HOP 1 (MULE)</div>
                  <div className="text-white font-bold mt-1">3 UPI Mules</div>
                  <div className="text-zinc-400 text-[9px]">Kolkata/Ranchi</div>
                </div>
                <div className="p-2 bg-white/5 border border-white/10 rounded">
                  <div className="text-zinc-400">HOP 2 (LAYER)</div>
                  <div className="text-white font-bold mt-1">Bank Clearing</div>
                  <div className="text-zinc-400 text-[9px]">Nagpur Hub</div>
                </div>
                <div className="p-2 bg-[#FF5500]/10 border border-[#FF5500]/30 rounded">
                  <div className="text-[#FF5500] font-bold">CASH-OUT EXIT</div>
                  <div className="text-white font-bold mt-1">ATM_029 Kiosk</div>
                  <div className="text-[#FF5500] text-[9px]">Mumbai (Nariman)</div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Card 2: MRR 1.0000 Terminal Predictor */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.5, delay: 0.1 }}
            whileHover={{ scale: 1.01, rotateX: 1, rotateY: 1 }}
            className="bg-[#0C0E12] border border-[#FF5500]/30 p-6 rounded-xl space-y-4 shadow-industrial-sm flex flex-col justify-between"
          >
            <div className="space-y-2">
              <div className="text-[10px] text-[#FF5500] font-bold uppercase tracking-wider">EXIT PREDICTOR</div>
              <h3 className="text-xl font-bold text-white font-sans">Physical ATM Exit Terminal Ranking</h3>
              <p className="text-xs text-zinc-400 font-sans leading-relaxed">
                Spatial-temporal composite ranking formula anticipating physical cash withdrawal exits.
              </p>
            </div>

            <div className="bg-[#060709] p-4 border border-white/10 rounded-lg space-y-2">
              <div className="flex justify-between items-baseline">
                <span className="text-[10px] text-zinc-500">TERMINAL MRR:</span>
                <span className="text-2xl font-bold font-sans text-[#FF5500]">1.0000</span>
              </div>
              <div className="text-[10px] text-zinc-400">Top-1 ATM Prediction Accuracy: 100.0%</div>
              <div className="w-full bg-[#1A1E26] h-1.5 rounded overflow-hidden">
                <div className="bg-[#FF5500] h-full w-full" />
              </div>
            </div>
          </motion.div>

          {/* Card 3: GNN Inductive Lift vs XGBoost */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.5, delay: 0.2 }}
            whileHover={{ scale: 1.01, rotateX: -1, rotateY: -1 }}
            className="bg-[#0C0E12] border border-[#FF5500]/30 p-6 rounded-xl space-y-4 shadow-industrial-sm flex flex-col justify-between"
          >
            <div className="space-y-2">
              <div className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider">BENCHMARK LIFT</div>
              <h3 className="text-xl font-bold text-white font-sans">GraphSAGE Inductive Generalizability</h3>
              <p className="text-xs text-zinc-400 font-sans leading-relaxed">
                GraphSAGE performs neighborhood message passing across unseen nodes, catching novel laundering topologies without retraining.
              </p>
            </div>

            <div className="space-y-2 text-[10px]">
              <div>
                <div className="flex justify-between mb-1">
                  <span>GraphSAGE Test F1:</span>
                  <span className="text-white font-bold">90.14%</span>
                </div>
                <div className="w-full bg-[#1A1E26] h-1.5 rounded overflow-hidden">
                  <div className="bg-[#FF5500] h-full w-[90.14%]" />
                </div>
              </div>
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-zinc-400">XGBoost Baseline F1:</span>
                  <span className="text-zinc-400 font-bold">88.89%</span>
                </div>
                <div className="w-full bg-[#1A1E26] h-1.5 rounded overflow-hidden">
                  <div className="bg-zinc-500 h-full w-[88.89%]" />
                </div>
              </div>
            </div>
          </motion.div>

          {/* Card 4: Sub-100ms SLA Stream Ingestion */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.5, delay: 0.3 }}
            whileHover={{ scale: 1.01, rotateX: -1, rotateY: 1 }}
            className="md:col-span-2 bg-[#0C0E12] border border-[#FF5500]/30 p-6 rounded-xl space-y-4 shadow-industrial-sm flex flex-col justify-between"
          >
            <div className="space-y-2">
              <div className="text-[10px] text-[#38BDF8] font-bold uppercase tracking-wider">REAL-TIME TELEMETRY</div>
              <h3 className="text-xl font-bold text-white font-sans">High-Throughput Banking Stream Ingestion</h3>
              <p className="text-xs text-zinc-400 font-sans leading-relaxed">
                Capable of processing streaming inter-bank transactions at high velocity with sub-100ms P50 latency.
              </p>
            </div>

            <div className="grid grid-cols-3 gap-3 text-[11px] bg-[#060709] p-3.5 border border-white/10 rounded-lg">
              <div>
                <div className="text-zinc-500 text-[10px]">STREAM RATE</div>
                <div className="text-lg font-bold text-white font-sans">1,448.9</div>
                <div className="text-[9px] text-zinc-500">TX / SEC</div>
              </div>
              <div>
                <div className="text-zinc-500 text-[10px]">P50 LATENCY</div>
                <div className="text-lg font-bold text-emerald-400 font-sans">71.67ms</div>
                <div className="text-[9px] text-emerald-400">SLA &lt; 100ms OK</div>
              </div>
              <div>
                <div className="text-zinc-500 text-[10px]">EVAL SCALE</div>
                <div className="text-lg font-bold text-white font-sans">1,000</div>
                <div className="text-[9px] text-zinc-500">COMPLAINTS</div>
              </div>
            </div>
          </motion.div>

        </div>
      </section>

      {/* ── SECTION 5: 8-STAGE REAL-TIME PIPELINE SCROLL STAGGER ── */}
      <section className="py-24 px-6 bg-[#0C0E12] border-y border-white/10 relative z-10">
        <div className="max-w-7xl mx-auto space-y-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.5 }}
            className="text-center space-y-3"
          >
            <div className="font-mono text-xs text-[#FF5500] font-bold uppercase tracking-widest">
              End-to-End Execution
            </div>
            <h2 className="text-3xl font-bold font-sans text-white tracking-tight">
              The 8-Stage Automated Intelligence Pipeline
            </h2>
            <p className="text-xs text-zinc-400 max-w-xl mx-auto">
              From deterministic entity resolution to automated account freeze advisories.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 font-mono text-xs">
            {[
              { id: 'STAGE 0', title: 'Entity Resolution', script: 'src/entity_resolution.py', desc: '2-Layer deterministic & fuzzy (token_sort ≥ 90) deduplication across 700 canonical entities.', latency: '100% F1', icon: Binary },
              { id: 'STAGE 1/2', title: '72h Subgraph Extraction', script: 'src/graph_construction.py', desc: 'Extracts closed ±72h, ≤3-hop directed MultiDiGraph incident subgraphs (1,000 graphs).', latency: '15,000 Tx', icon: GitFork },
              { id: 'STAGE 3A', title: 'XGBoost Baseline', script: 'src/xgboost_baseline.py', desc: '15 topological metrics evaluated on 80/20 stratified split (88.89% Test F1, 0.9444 PR-AUC).', latency: '88.89% F1', icon: Cpu },
              { id: 'STAGE 3B', title: 'GraphSAGE GNN', script: 'src/graphsage_classifier.py', desc: '2-Layer SAGEConv(13, 64) inductive message passing (90.14% Test F1, -33% false alarms).', latency: '90.14% F1', icon: Network },
              { id: 'STAGE 4', title: 'ATM Exit Ranking', script: 'src/terminal_prediction.py', desc: '7-Factor composite multi-criteria ranking anticipating physical cash-out terminals.', latency: 'MRR 1.0000', icon: MapPin },
              { id: 'STAGE 5', title: 'Confidence Tiering & Novelty', script: 'src/confidence_tiers.py', desc: '64-Dim latent embedding similarity calibration categorizing High, Med, and Novel ring fallback.', latency: '72.57% Prec', icon: ShieldCheck },
              { id: 'STAGE 6', title: 'GNN Explainability', script: 'src/explainability.py', desc: 'Synthesizes plain-text evidence bullets (avg 5.40 reasons/case) without black-box jargon.', latency: '5.40 Reasons', icon: FileText },
              { id: 'STAGE 7/8', title: 'Tunable Policy & Live API', script: 'src/threshold_policy.py', desc: 'Dynamic threshold tuning (τ ∈ [0.10, 0.90], Peak F1 91.43%) + FastAPI GNN inference.', latency: '1,448.9 Tx/s', icon: Gavel },
            ].map((stage, sIdx) => {
              const Icon = stage.icon;
              return (
                <motion.div
                  key={stage.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-40px' }}
                  transition={{ duration: 0.4, delay: sIdx * 0.06 }}
                  whileHover={{ scale: 1.02, borderColor: 'rgba(255, 85, 0, 0.4)' }}
                  className="bg-[#060709] border border-white/10 p-4 rounded-lg space-y-2 transition-all"
                >
                  <div className="flex items-center justify-between">
                    <div className="p-1.5 bg-white/5 border border-white/10 rounded text-[#FF5500]">
                      <Icon className="w-3.5 h-3.5" />
                    </div>
                    <span className="text-[#FF5500] font-bold text-[10px]">{stage.id}</span>
                  </div>
                  <div>
                    <h4 className="font-bold text-white text-xs font-sans">{stage.title}</h4>
                    <div className="text-[9px] text-[#38BDF8] font-mono">{stage.script}</div>
                    <p className="text-[10px] text-zinc-400 leading-relaxed font-sans mt-1">{stage.desc}</p>
                  </div>
                  <div className="pt-2 border-t border-white/5 flex justify-between items-center text-[9px] text-zinc-500">
                    <span>Benchmark:</span>
                    <span className="text-emerald-400 font-bold">{stage.latency}</span>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── SECTION 6: ARCHITECTURAL FAQ ACCORDION (MOTION.DEV ANIMATEPRESENCE) ── */}
      <section className="py-24 px-6 max-w-4xl mx-auto space-y-10 z-10 relative">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center space-y-3"
        >
          <div className="font-mono text-xs text-[#FF5500] font-bold uppercase tracking-widest">
            TECHNICAL DEEP DIVE
          </div>
          <h2 className="text-3xl font-bold font-sans text-white tracking-tight">
            Frequently Asked Architecture Questions
          </h2>
          <p className="text-xs text-zinc-400 max-w-lg mx-auto font-sans">
            Rigorous mathematical rationale behind inductive graph learning and cash-out prediction.
          </p>
        </motion.div>

        <div className="space-y-3 font-mono text-xs">
          {ARCHITECTURE_FAQS.map((faq, fIdx) => {
            const isOpen = openFaqIdx === fIdx;
            return (
              <motion.div
                key={fIdx}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: fIdx * 0.08 }}
                className="bg-[#0C0E12] border border-white/10 rounded-lg overflow-hidden transition-colors"
              >
                <button
                  onClick={() => setOpenFaqIdx(isOpen ? null : fIdx)}
                  className="w-full p-4 flex items-center justify-between text-left hover:bg-white/[0.02] transition-colors"
                >
                  <span className="font-bold text-white text-xs sm:text-sm font-sans flex items-center gap-2">
                    <HelpCircle className="w-4 h-4 text-[#FF5500] flex-shrink-0" />
                    <span>{faq.q}</span>
                  </span>
                  <ChevronDown className={`w-4 h-4 text-zinc-400 transition-transform duration-300 ${isOpen ? 'rotate-180 text-[#FF5500]' : ''}`} />
                </button>

                <AnimatePresence>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: 'easeInOut' }}
                    >
                      <div className="p-4 pt-0 text-zinc-300 font-sans text-xs leading-relaxed border-t border-white/5">
                        {faq.a}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* ── SECTION 7: ENTER COMMAND CENTER CTA ── */}
      <section className="py-24 px-6 text-center max-w-4xl mx-auto space-y-6 z-10 relative">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-3xl sm:text-5xl font-bold font-sans text-white tracking-tight uppercase"
        >
          Ready to Investigate <span className="text-[#FF5500]">Mule Chains</span>?
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="text-sm text-zinc-400 max-w-xl mx-auto font-sans"
        >
          Access the live operational command center with real-time case dossiers, 3D network sandbox, and India geospatial cash-out radar.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="flex flex-wrap items-center justify-center gap-4 pt-2 font-mono text-xs"
        >
          <motion.button
            onClick={() => onEnterApp('command')}
            className="px-8 py-4 bg-[#FF5500] hover:bg-[#FF5500]/90 text-black font-bold rounded shadow-signal-glow flex items-center gap-2 text-sm transition-all"
            whileHover={{ scale: 1.03, boxShadow: '0 0 30px rgba(255, 85, 0, 0.45)' }}
            whileTap={{ scale: 0.97 }}
          >
            <span>ENTER COMMAND CENTER</span>
            <ArrowRight className="w-4 h-4" />
          </motion.button>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 py-6 px-6 text-center font-mono text-[11px] text-zinc-500 z-10 relative">
        SIH CYBERGUARD — National Cybercrime AML Predictive Platform // Frontline Decision Support System
      </footer>

    </div>
  );
};
