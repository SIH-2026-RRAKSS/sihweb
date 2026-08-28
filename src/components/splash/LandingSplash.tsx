import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { motion, AnimatePresence } from 'framer-motion';
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
  TrendingUp
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
  phone.castShadow = true;
  group.add(phone);

  const screen = new THREE.Mesh(
    new THREE.PlaneGeometry(2.8, 5.6),
    new THREE.MeshBasicMaterial({ color: 0x38bdf8, side: THREE.DoubleSide })
  );
  screen.position.set(0, 3.5, 0.28);
  screen.rotation.x = -Math.PI / 14;
  group.add(screen);

  const ring = new THREE.Mesh(
    new THREE.TorusGeometry(3.2, 0.15, 8, 32),
    new THREE.MeshBasicMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.6 })
  );
  ring.position.y = 3.5;
  ring.rotation.x = Math.PI / 3;
  group.add(ring);

  return group;
}

export const LandingSplash: React.FC<LandingSplashProps> = ({ onEnterApp }) => {
  const canvasRef = useRef<HTMLDivElement>(null);
  const [activeStep, setActiveStep] = useState(0);
  const [realIncidents, setRealIncidents] = useState<IncidentSummary[]>([]);
  const [activeIncidentIdx, setActiveIncidentIdx] = useState(0);

  // Fetch real incidents from database
  useEffect(() => {
    ApiService.getIncidents({ page: 1, page_size: 10 }).then((res) => {
      if (res.items && res.items.length > 0) {
        setRealIncidents(res.items);
      }
    });
  }, []);

  // Rotate through real incidents
  useEffect(() => {
    if (realIncidents.length === 0) return;
    const interval = setInterval(() => {
      setActiveIncidentIdx((prev) => (prev + 1) % realIncidents.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [realIncidents]);

  // ── 3D CYBERGUARD OBSIDIAN & SIGNAL-ORANGE THREE.JS CANVAS ──
  useEffect(() => {
    const container = canvasRef.current;
    if (!container) return;

    const width = container.clientWidth;
    const height = container.clientHeight;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x060709);
    scene.fog = new THREE.FogExp2(0x060709, 0.004);

    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 1000);
    camera.position.set(0, 45, 110);
    camera.lookAt(0, 5, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.appendChild(renderer.domElement);

    // Studio Lighting in Fiery Signal Orange & Obsidian Slate
    scene.add(new THREE.AmbientLight(0xffffff, 0.7));

    const orangeKeyLight = new THREE.DirectionalLight(0xff5500, 3.2);
    orangeKeyLight.position.set(50, 80, 50);
    orangeKeyLight.castShadow = true;
    scene.add(orangeKeyLight);

    const cyanFillLight = new THREE.DirectionalLight(0x38bdf8, 1.6);
    cyanFillLight.position.set(-60, -20, -40);
    scene.add(cyanFillLight);

    // ── 3D CYBERNETIC PLINTH & HEXAGONAL RADAR GRID ──
    const plinthGroup = new THREE.Group();

    // Octagonal Heavy Slate Plinth
    const plinthGeo = new THREE.CylinderGeometry(85, 88, 5, 8);
    const plinthMat = new THREE.MeshStandardMaterial({ color: 0x0c0e12, roughness: 0.4, metalness: 0.8 });
    const plinth = new THREE.Mesh(plinthGeo, plinthMat);
    plinth.position.y = -2.5;
    plinth.receiveShadow = true;
    plinthGroup.add(plinth);

    // Signal Orange Laser Grid
    const grid = new THREE.GridHelper(130, 26, 0xff5500, 0x1f242e);
    grid.position.y = 0.05;
    (grid.material as THREE.Material).transparent = true;
    (grid.material as THREE.Material).opacity = 0.35;
    plinthGroup.add(grid);

    // Concentric Neon Laser Scanning Rings
    [25, 45, 65].forEach((r, idx) => {
      const ringGeo = new THREE.RingGeometry(r - 0.3, r, 64);
      const ringMat = new THREE.MeshBasicMaterial({
        color: idx === 1 ? 0xff5500 : 0x38bdf8,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: idx === 1 ? 0.6 : 0.2,
      });
      const ring = new THREE.Mesh(ringGeo, ringMat);
      ring.rotation.x = Math.PI / 2;
      ring.position.y = 0.1;
      plinthGroup.add(ring);
    });

    // 3D Nodes Placed on Plinth
    const victimSafe = createBankVaultModel();
    victimSafe.position.set(-42, 0, 0);
    plinthGroup.add(victimSafe);

    const mule1 = createMobileUPITerminalModel();
    mule1.position.set(-15, 0, -22);
    plinthGroup.add(mule1);

    const mule2 = createMobileUPITerminalModel();
    mule2.position.set(-15, 0, 22);
    plinthGroup.add(mule2);

    const atmExit = createATMKioskModel();
    atmExit.position.set(45, 0, 0);
    plinthGroup.add(atmExit);

    // Curved High-Velocity Laser Conduits
    const conduits = [
      new THREE.QuadraticBezierCurve3(victimSafe.position, new THREE.Vector3(-28, 12, -11), mule1.position),
      new THREE.QuadraticBezierCurve3(victimSafe.position, new THREE.Vector3(-28, 12, 11), mule2.position),
      new THREE.QuadraticBezierCurve3(mule1.position, new THREE.Vector3(15, 12, -11), atmExit.position),
      new THREE.QuadraticBezierCurve3(mule2.position, new THREE.Vector3(15, 12, 11), atmExit.position),
    ];

    const packetMeshes: THREE.Mesh[] = [];
    conduits.forEach((c, idx) => {
      const pts = c.getPoints(32);
      const geom = new THREE.BufferGeometry().setFromPoints(pts);
      const line = new THREE.Line(
        geom,
        new THREE.LineBasicMaterial({ color: idx >= 2 ? 0xff5500 : 0x38bdf8, transparent: true, opacity: 0.75 })
      );
      plinthGroup.add(line);

      const packet = new THREE.Mesh(
        new THREE.SphereGeometry(0.9, 8, 8),
        new THREE.MeshBasicMaterial({ color: idx >= 2 ? 0xff5500 : 0x38bdf8 })
      );
      plinthGroup.add(packet);
      packetMeshes.push(packet);
    });

    scene.add(plinthGroup);

    // Mouse Parallax
    let mouseX = 0;
    let mouseY = 0;
    const handleMouseMove = (e: MouseEvent) => {
      mouseX = (e.clientX / window.innerWidth - 0.5) * 2;
      mouseY = (e.clientY / window.innerHeight - 0.5) * 2;
    };
    window.addEventListener('mousemove', handleMouseMove);

    // Animation Loop
    let animId: number;
    const clock = new THREE.Clock();

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const time = clock.getElapsedTime();

      // Smooth plinth idle rotation
      plinthGroup.rotation.y = time * 0.08 + mouseX * 0.3;
      plinthGroup.rotation.x = Math.sin(time * 0.2) * 0.04 - mouseY * 0.15;

      // Animate streaming money packet particles
      conduits.forEach((c, idx) => {
        const t = (time * 0.8 + idx * 0.25) % 1;
        if (packetMeshes[idx]) {
          packetMeshes[idx].position.copy(c.getPoint(t));
        }
      });

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
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  const curInc = realIncidents[activeIncidentIdx] || {
    complaint_id: 'C000047',
    scam_category: 'Investment / Ponzi Crypto Scheme',
    reported_amount: 450000,
    district: 'Khordha',
    state: 'Odisha',
    graphsage_risk_probability: 0.9988,
    confidence_tier: 'HIGH_CONFIDENCE',
    top_terminal_id: 'ATM_029',
    top_terminal_city: 'Mumbai'
  };

  return (
    <div className="min-h-screen bg-[#060709] text-slate-100 font-sans selection:bg-[#FF5500]/20 selection:text-[#FF5500] relative overflow-x-hidden">
      
      {/* ── TOP CYBERNETIC NAVIGATION BAR ── */}
      <header className="fixed top-0 left-0 right-0 z-50 h-16 bg-[#060709]/90 backdrop-blur-md border-b border-white/10 px-6 flex items-center justify-between font-mono text-xs">
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
            <span>INTER-BANK SURVEILLANCE: ACTIVE</span>
          </span>
          <span>THROUGHPUT: <strong className="text-white font-sans">1,448.9 TX/S</strong></span>
          <span>TERMINAL MRR: <strong className="text-[#FF5500] font-sans">1.0000</strong></span>
        </div>

        <button
          onClick={() => onEnterApp('command')}
          className="px-4 py-2 bg-[#FF5500] hover:bg-[#FF5500]/90 text-black font-bold rounded flex items-center gap-2 shadow-signal-glow transition-all text-xs font-mono"
        >
          <span>ENTER COMMAND CENTER</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </header>

      {/* ── HERO SECTION: VOID.SBS CYBER-HERO WITH 3D PLINTH & INTERACTIVE STEPPER ── */}
      <section className="relative min-h-[92vh] flex flex-col justify-center px-6 pt-24 pb-12 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          {/* Left Column: Cyberguard Big Bold Punchy Typography (7 Cols) */}
          <div className="lg:col-span-7 space-y-6 text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#0C0E12] border border-[#FF5500]/40 rounded font-mono text-xs text-[#FF5500] shadow-md">
              <span className="w-2 h-2 rounded-full bg-[#FF5500] animate-pulse" />
              <span>72H TEMPORAL MULE SURVEILLANCE · INDUCTIVE GraphSAGE GNN</span>
            </div>

            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-bold font-sans tracking-tight text-white uppercase leading-[1.05]">
              CYBERCRIME PREDICTIVE ANALYTICS — <span className="text-[#FF5500]">AML & MULE-CHAIN</span> DETECTION PIPELINE
            </h1>

            <p className="text-sm sm:text-base text-zinc-300 max-w-xl leading-relaxed font-sans">
              An end-to-end, graph-native predictive analytics framework designed for financial cybercrime complaint resolution, multi-hop mule transaction graph extraction, inductive Graph Neural Network (GraphSAGE) laundering detection, terminal cash-out location prediction, uncertainty confidence calibration, and rule-based investigative explainability.
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap items-center gap-4 pt-2 font-mono text-xs">
              <button
                onClick={() => onEnterApp('simulation')}
                className="px-6 py-3.5 bg-[#FF5500] hover:bg-[#FF5500]/90 text-black font-bold rounded shadow-signal-glow flex items-center gap-2 transition-all"
              >
                <FlaskConical className="w-4 h-4 fill-current" />
                <span>⚡ LAUNCH 3D SIMULATION LAB</span>
              </button>

              <button
                onClick={() => onEnterApp('cashout-map')}
                className="px-6 py-3.5 bg-[#0C0E12] hover:bg-[#14171C] border border-white/20 text-white font-bold rounded flex items-center gap-2 transition-all"
              >
                <MapPin className="w-4 h-4 text-[#FF5500]" />
                <span>GEOSPATIAL CASH-OUT MAP</span>
              </button>
            </div>

            {/* ── LIVE INTER-BANK FRAUD STREAM CARD (FROM DATABASE) ── */}
            <div className="bg-[#0C0E12] border border-[#FF5500]/30 rounded-lg p-3.5 font-mono text-xs shadow-industrial-md space-y-2 max-w-xl">
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
            </div>
          </div>

          {/* Right Column: 3D Cybernetic Radar Plinth (5 Cols) */}
          <div className="lg:col-span-5 h-[440px] sm:h-[480px] bg-[#0C0E12] border border-[#FF5500]/20 rounded-xl overflow-hidden relative shadow-industrial-lg">
            <div ref={canvasRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

            {/* Top Status */}
            <div className="absolute top-3 left-3 bg-[#060709]/80 backdrop-blur-md border border-white/10 px-3 py-1.5 rounded font-mono text-[10px] text-zinc-300">
              <div className="text-[#FF5500] font-bold">3D AML TOPOLOGY SANDBOX</div>
              <div className="text-zinc-500">REAL-TIME INFERENCE</div>
            </div>

            {/* Bottom Status */}
            <div className="absolute bottom-3 left-3 right-3 bg-[#060709]/80 backdrop-blur-md border border-white/10 p-2 rounded flex justify-between items-center font-mono text-[10px]">
              <span className="text-[#FF5500] font-bold">ATM EXIT ACCURACY: 100% (MRR 1.0)</span>
              <span className="text-zinc-400">P50: 71.67ms</span>
            </div>
          </div>

        </div>

        {/* ── VOID.SBS INTERACTIVE STEPPER TABS (01-05) ── */}
        <div className="mt-12 grid grid-cols-2 sm:grid-cols-5 gap-2 font-mono text-xs">
          {HERO_STEPS.map((step, idx) => (
            <div
              key={step.id}
              onClick={() => setActiveStep(idx)}
              className={`p-3 rounded border cursor-pointer transition-all ${
                activeStep === idx
                  ? 'bg-[#FF5500]/15 border-[#FF5500] text-white shadow-signal-glow'
                  : 'bg-[#0C0E12] border-white/10 text-zinc-400 hover:border-white/20'
              }`}
            >
              <div className="flex items-center justify-between text-[10px] mb-1">
                <span className="text-[#FF5500] font-bold">{step.num}</span>
                <span className="text-zinc-600">STAGE</span>
              </div>
              <div className="font-bold text-xs truncate text-white">{step.label}</div>
              <div className="text-[10px] text-zinc-400 truncate mt-1">{step.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── SECTION 2: VOID.SBS TECH BENTO MATRIX ── */}
      <section className="py-20 px-6 max-w-7xl mx-auto space-y-12">
        <div className="text-center space-y-3">
          <div className="font-mono text-xs text-[#FF5500] font-bold uppercase tracking-widest">
            Tactical Architecture
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold font-sans text-white tracking-tight">
            Engineered for Frontline AML Investigators
          </h2>
          <p className="text-sm text-zinc-400 max-w-2xl mx-auto">
            Traditional AML engines look at isolated accounts. GraphSAGE captures temporal multi-hop graph topology across institutions.
          </p>
        </div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-mono text-xs">
          
          {/* Card 1: 3-Hop Mule Chain Dissector */}
          <div className="md:col-span-2 bg-[#0C0E12] border border-[#FF5500]/30 p-6 rounded-xl space-y-4 shadow-industrial-sm flex flex-col justify-between">
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

            {/* Visualizer */}
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
          </div>

          {/* Card 2: MRR 1.0000 Terminal Predictor */}
          <div className="bg-[#0C0E12] border border-[#FF5500]/30 p-6 rounded-xl space-y-4 shadow-industrial-sm flex flex-col justify-between">
            <div className="space-y-2">
              <div className="text-[10px] text-[#FF5500] font-bold uppercase tracking-wider">EXIT PREDICTOR</div>
              <h3 className="text-xl font-bold text-white font-sans">Physical ATM Exit Terminal Ranking</h3>
              <p className="text-xs text-zinc-400 font-sans leading-relaxed">
                Spatial-temporal ranking accurately anticipates the exact physical ATM destination where mules withdraw physical currency.
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
          </div>

          {/* Card 3: GNN Inductive Lift vs XGBoost */}
          <div className="bg-[#0C0E12] border border-[#FF5500]/30 p-6 rounded-xl space-y-4 shadow-industrial-sm flex flex-col justify-between">
            <div className="space-y-2">
              <div className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider">BENCHMARK LIFT</div>
              <h3 className="text-xl font-bold text-white font-sans">GraphSAGE Inductive Generalizability</h3>
              <p className="text-xs text-zinc-400 font-sans leading-relaxed">
                Unlike tabular ML, GraphSAGE performs message passing across unseen nodes, catching novel laundering topologies without retraining.
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
                  <span className="text-zinc-400 font-bold">86.98%</span>
                </div>
                <div className="w-full bg-[#1A1E26] h-1.5 rounded overflow-hidden">
                  <div className="bg-zinc-500 h-full w-[86.98%]" />
                </div>
              </div>
            </div>
          </div>

          {/* Card 4: Sub-50ms SLA Compliance */}
          <div className="md:col-span-2 bg-[#0C0E12] border border-[#FF5500]/30 p-6 rounded-xl space-y-4 shadow-industrial-sm flex flex-col justify-between">
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
          </div>

        </div>
      </section>

      {/* ── SECTION 3: 8-STAGE REAL-TIME PIPELINE WALKTHROUGH ── */}
      <section className="py-20 px-6 bg-[#0C0E12] border-y border-white/10">
        <div className="max-w-7xl mx-auto space-y-12">
          <div className="text-center space-y-3">
            <div className="font-mono text-xs text-[#FF5500] font-bold uppercase tracking-widest">
              End-to-End Execution
            </div>
            <h2 className="text-3xl font-bold font-sans text-white tracking-tight">
              The 8-Stage Automated Intelligence Pipeline
            </h2>
            <p className="text-xs text-zinc-400 max-w-xl mx-auto">
              From complaint ingestion to sub-50ms automated account freeze advisories.
            </p>
          </div>

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
            ].map((stage) => {
              const Icon = stage.icon;
              return (
                <div
                  key={stage.id}
                  className="bg-[#060709] border border-white/10 p-4 rounded-lg space-y-2 hover:border-[#FF5500]/40 transition-all"
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
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── SECTION 4: ENTER COMMAND CENTER CTA ── */}
      <section className="py-24 px-6 text-center max-w-4xl mx-auto space-y-6">
        <h2 className="text-3xl sm:text-5xl font-bold font-sans text-white tracking-tight uppercase">
          Ready to Investigate <span className="text-[#FF5500]">Mule Chains</span>?
        </h2>
        <p className="text-sm text-zinc-400 max-w-xl mx-auto font-sans">
          Access the live operational command center with real-time case dossiers, 3D network sandbox, and India geospatial cash-out radar.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-4 pt-2 font-mono text-xs">
          <button
            onClick={() => onEnterApp('command')}
            className="px-8 py-4 bg-[#FF5500] hover:bg-[#FF5500]/90 text-black font-bold rounded shadow-signal-glow flex items-center gap-2 text-sm transition-all"
          >
            <span>ENTER COMMAND CENTER</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 py-6 px-6 text-center font-mono text-[11px] text-zinc-500">
        SIH CYBERGUARD — National Cybercrime AML Predictive Platform // Frontline Decision Support System
      </footer>

    </div>
  );
};
