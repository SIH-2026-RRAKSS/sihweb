import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { RotateCcw, Maximize2, Sparkles, Layers, Shield, Eye, MapPin, Building, Smartphone, HardDrive } from 'lucide-react';
import { IncidentDetail } from '../../types';

export interface SimNode3D {
  id: string;
  label: string;
  type: 'VICTIM' | 'MULE' | 'LAYERING' | 'ATM' | 'MERCHANT';
  city: string;
  risk: number;
  amount: number;
  hopLevel: number;
  position: THREE.Vector3;
  mesh?: THREE.Group;
  color: string;
  targetScale: number;
  currentScale: number;
}

export interface SimEdge3D {
  source: string;
  target: string;
  amount: number;
  hopLevel: number;
  isCashOut: boolean;
  isSuspicious: boolean;
  curve: THREE.QuadraticBezierCurve3;
  coreLine: THREE.Line;
  glowLine: THREE.Line;
  drawProgress: number;
  targetDrawProgress: number;
}

interface ThreeNetworkCanvasProps {
  currentStage: number;
  seedEntityId: string;
  incidentDetail?: IncidentDetail | null;
  speed: number;
  onSelectNode?: (node: SimNode3D | null) => void;
}

// ─────────────────────────────────────────────────────────────────────────────
// 🌟 EPIC CINEMATIC 3D PROCEDURAL ASSET BUILDERS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * 🏧 EPIC INDUSTRIAL ATM CASH-OUT KIOSK WITH ACTIVE LASER TURRET
 */
function createEpicATMKioskModel(colorHex: number = 0xf97316, terminalLabel: string = 'ATM CASH-OUT'): THREE.Group {
  const group = new THREE.Group();

  // 1. Heavy Chamfered Base Pedestal
  const baseGeo = new THREE.BoxGeometry(6.0, 1.0, 6.0);
  const baseMat = new THREE.MeshStandardMaterial({
    color: 0x0a0d14,
    roughness: 0.7,
    metalness: 0.8,
  });
  const base = new THREE.Mesh(baseGeo, baseMat);
  base.position.y = 0.5;
  base.receiveShadow = true;
  group.add(base);

  // 2. Kiosk Main Monolith Body (Carbon Slate)
  const bodyGeo = new THREE.BoxGeometry(4.8, 8.2, 4.6);
  const bodyMat = new THREE.MeshStandardMaterial({
    color: 0x121620,
    metalness: 0.92,
    roughness: 0.18,
  });
  const body = new THREE.Mesh(bodyGeo, bodyMat);
  body.position.y = 5.0;
  body.castShadow = true;
  body.receiveShadow = true;
  group.add(body);

  // 3. Angled Upper Console Fascia
  const fasciaGeo = new THREE.BoxGeometry(4.5, 4.4, 2.2);
  const fasciaMat = new THREE.MeshStandardMaterial({
    color: 0x1b2230,
    metalness: 0.95,
    roughness: 0.15,
  });
  const fascia = new THREE.Mesh(fasciaGeo, fasciaMat);
  fascia.position.set(0, 9.2, 1.6);
  fascia.rotation.x = -Math.PI / 10;
  group.add(fascia);

  // 4. Ultra-Crisp Canvas OLED Glass Screen
  const screenCanvas = document.createElement('canvas');
  screenCanvas.width = 512;
  screenCanvas.height = 320;
  const sCtx = screenCanvas.getContext('2d');
  if (sCtx) {
    sCtx.fillStyle = '#050811';
    sCtx.fillRect(0, 0, 512, 320);

    sCtx.strokeStyle = '#f59e0b';
    sCtx.lineWidth = 6;
    sCtx.strokeRect(10, 10, 492, 300);

    sCtx.fillStyle = '#f59e0b';
    sCtx.font = 'bold 30px monospace';
    sCtx.fillText('24H ATM // CASH TERMINAL', 28, 58);

    sCtx.font = '20px monospace';
    sCtx.fillStyle = '#38bdf8';
    sCtx.fillText(`EXIT: ${terminalLabel}`, 28, 110);
    sCtx.fillStyle = '#e2e8f0';
    sCtx.fillText('DISPENSING: CASH EJECT READY', 28, 155);

    sCtx.fillStyle = '#1e293b';
    sCtx.fillRect(28, 190, 456, 26);
    sCtx.fillStyle = '#10b981';
    sCtx.fillRect(28, 190, 420, 26);

    sCtx.fillStyle = '#ffffff';
    sCtx.font = 'bold 18px monospace';
    sCtx.fillText('STAGE 4: TOP-1 CASH-OUT MATCH (MRR 1.0)', 36, 260);
  }
  const screenTex = new THREE.CanvasTexture(screenCanvas);
  const screenMat = new THREE.MeshBasicMaterial({ map: screenTex });
  const screen = new THREE.Mesh(new THREE.PlaneGeometry(3.8, 2.4), screenMat);
  screen.position.set(0, 9.7, 2.72);
  screen.rotation.x = -Math.PI / 10;
  group.add(screen);

  // 5. Specular Chrome Keypad Console
  const keypad = new THREE.Mesh(
    new THREE.BoxGeometry(2.8, 1.4, 0.45),
    new THREE.MeshStandardMaterial({ color: 0xe2e8f0, metalness: 0.98, roughness: 0.05 })
  );
  keypad.position.set(0, 7.5, 2.6);
  keypad.rotation.x = -Math.PI / 6;
  group.add(keypad);

  // 6. Recessed Cash Dispenser Tray with Glowing Emerald Notes
  const tray = new THREE.Mesh(
    new THREE.BoxGeometry(3.2, 0.75, 1.5),
    new THREE.MeshStandardMaterial({ color: 0x06080d, roughness: 0.5 })
  );
  tray.position.set(0, 4.6, 2.45);
  group.add(tray);

  const notes = new THREE.Mesh(
    new THREE.BoxGeometry(2.6, 0.35, 1.1),
    new THREE.MeshStandardMaterial({
      color: 0x10b981,
      emissive: 0x10b981,
      emissiveIntensity: 1.0,
    })
  );
  notes.position.set(0, 4.6, 2.8);
  group.add(notes);

  // 7. Overhead Glowing Neon Canopy ("24H ATM")
  const canopy = new THREE.Mesh(
    new THREE.BoxGeometry(5.4, 1.8, 5.2),
    new THREE.MeshStandardMaterial({
      color: colorHex,
      emissive: colorHex,
      emissiveIntensity: 0.9,
      metalness: 0.6,
      roughness: 0.1,
    })
  );
  canopy.position.set(0, 12.2, 0);
  group.add(canopy);

  // 8. 360° Surveillance Security Camera Turret with Active Laser Target
  const turretGroup = new THREE.Group();
  turretGroup.position.set(0, 13.3, 0);
  turretGroup.name = 'atmTurret';

  const camBase = new THREE.Mesh(
    new THREE.CylinderGeometry(1.0, 1.0, 0.5, 24),
    new THREE.MeshStandardMaterial({ color: 0x27272a, metalness: 0.95 })
  );
  turretGroup.add(camBase);

  const camDome = new THREE.Mesh(
    new THREE.SphereGeometry(0.7, 24, 24, 0, Math.PI * 2, 0, Math.PI / 2),
    new THREE.MeshStandardMaterial({ color: 0x18181b, metalness: 0.98, roughness: 0.05 })
  );
  camDome.position.y = 0.25;
  turretGroup.add(camDome);

  const camEye = new THREE.Mesh(
    new THREE.SphereGeometry(0.22, 12, 12),
    new THREE.MeshBasicMaterial({ color: 0xff0000 })
  );
  camEye.position.set(0, 0.4, 0.55);
  turretGroup.add(camEye);

  const laserBeamGeo = new THREE.ConeGeometry(3.5, 14, 16, 1, true);
  laserBeamGeo.rotateX(Math.PI / 3);
  const laserBeamMat = new THREE.MeshBasicMaterial({
    color: 0xff0000,
    transparent: true,
    opacity: 0.12,
    side: THREE.DoubleSide,
  });
  const laserBeam = new THREE.Mesh(laserBeamGeo, laserBeamMat);
  laserBeam.position.set(0, 0, 7);
  turretGroup.add(laserBeam);
  group.add(turretGroup);

  // 9. Ground Glowing Concentric Laser Perimeter Target Rings
  const groundRing1 = new THREE.Mesh(
    new THREE.RingGeometry(7.5, 9.0, 48),
    new THREE.MeshBasicMaterial({ color: colorHex, transparent: true, opacity: 0.5, side: THREE.DoubleSide })
  );
  groundRing1.rotateX(-Math.PI / 2);
  groundRing1.position.y = 0.08;
  group.add(groundRing1);

  const groundRing2 = new THREE.Mesh(
    new THREE.RingGeometry(10.0, 10.4, 48),
    new THREE.MeshBasicMaterial({ color: colorHex, transparent: true, opacity: 0.25, side: THREE.DoubleSide })
  );
  groundRing2.rotateX(-Math.PI / 2);
  groundRing2.position.y = 0.08;
  group.add(groundRing2);

  return group;
}

/**
 * 🏛️ EPIC NEOCLASSICAL BANK INSTITUTION / CLEARING HUB
 */
function createEpicBankBranchModel(): THREE.Group {
  const group = new THREE.Group();

  [
    { w: 14.0, h: 0.75, d: 12.0, y: 0.38, color: 0x141822 },
    { w: 12.8, h: 0.65, d: 10.8, y: 1.05, color: 0x1a202c },
    { w: 11.8, h: 0.55, d: 9.8, y: 1.62, color: 0x222a3a },
  ].forEach((tier) => {
    const mesh = new THREE.Mesh(
      new THREE.BoxGeometry(tier.w, tier.h, tier.d),
      new THREE.MeshStandardMaterial({ color: tier.color, metalness: 0.9, roughness: 0.2 })
    );
    mesh.position.y = tier.y;
    mesh.receiveShadow = true;
    group.add(mesh);
  });

  const hall = new THREE.Mesh(
    new THREE.BoxGeometry(9.8, 7.8, 7.8),
    new THREE.MeshStandardMaterial({ color: 0x0d1118, metalness: 0.92, roughness: 0.18 })
  );
  hall.position.y = 5.7;
  hall.castShadow = true;
  group.add(hall);

  const colMat = new THREE.MeshStandardMaterial({
    color: 0xf8fafc,
    metalness: 0.95,
    roughness: 0.08,
  });
  [-4.2, -1.8, 1.8, 4.2].forEach((x) => {
    const col = new THREE.Mesh(new THREE.CylinderGeometry(0.52, 0.58, 7.6, 28), colMat);
    col.position.set(x, 5.6, 4.4);
    col.castShadow = true;
    group.add(col);

    const cap = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.4, 1.4), colMat);
    cap.position.set(x, 9.6, 4.4);
    group.add(cap);

    const baseCap = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.4, 1.4), colMat);
    baseCap.position.set(x, 2.0, 4.4);
    group.add(baseCap);
  });

  const beam = new THREE.Mesh(
    new THREE.BoxGeometry(12.5, 1.0, 10.5),
    new THREE.MeshStandardMaterial({ color: 0x27303f, metalness: 0.9, roughness: 0.15 })
  );
  beam.position.y = 10.2;
  group.add(beam);

  const roof = new THREE.Mesh(
    new THREE.ConeGeometry(8.6, 3.6, 4),
    new THREE.MeshStandardMaterial({
      color: 0x38bdf8,
      metalness: 0.8,
      roughness: 0.15,
      emissive: 0x0284c7,
      emissiveIntensity: 0.45,
    })
  );
  roof.rotateY(Math.PI / 4);
  roof.position.set(0, 12.5, 0);
  roof.castShadow = true;
  group.add(roof);

  const crestGroup = new THREE.Group();
  crestGroup.position.set(0, 15.6, 0);
  crestGroup.name = 'floatingShield';

  const shieldRing = new THREE.Mesh(
    new THREE.TorusGeometry(1.8, 0.2, 14, 36),
    new THREE.MeshStandardMaterial({
      color: 0x38bdf8,
      emissive: 0x38bdf8,
      emissiveIntensity: 1.0,
    })
  );
  crestGroup.add(shieldRing);

  const shieldCore = new THREE.Mesh(
    new THREE.OctahedronGeometry(0.8, 0),
    new THREE.MeshStandardMaterial({
      color: 0xffffff,
      emissive: 0x38bdf8,
      emissiveIntensity: 0.8,
    })
  );
  crestGroup.add(shieldCore);
  group.add(crestGroup);

  return group;
}

/**
 * 📱 EPIC TITANIUM CYBER SMARTPHONE (MOBILE UPI MULE) WITH 3D HOLOGRAM
 */
function createEpicMobileUPITerminalModel(risk: number, label: string = 'UPI MULE'): THREE.Group {
  const group = new THREE.Group();
  
  let accentColorStr = '#10B981'; // Emerald / Benign
  if (risk >= 0.70) accentColorStr = '#EF4444'; // Crimson / Confirmed Mule
  else if (risk > 0.30) accentColorStr = '#F97316'; // Amber / Watchlist

  const colorObj = new THREE.Color(accentColorStr);
  const accentColor = colorObj.getHex();

  const bodyGeo = new THREE.BoxGeometry(4.0, 8.2, 0.7);
  const bodyMat = new THREE.MeshStandardMaterial({
    color: 0x0c0f16,
    metalness: 0.98,
    roughness: 0.1,
  });
  const body = new THREE.Mesh(bodyGeo, bodyMat);
  body.position.y = 4.8;
  body.rotation.x = -Math.PI / 14;
  body.castShadow = true;
  group.add(body);

  const qrCanvas = document.createElement('canvas');
  qrCanvas.width = 400;
  qrCanvas.height = 600;
  const qCtx = qrCanvas.getContext('2d');
  if (qCtx) {
    qCtx.fillStyle = '#05070d';
    qCtx.fillRect(0, 0, 400, 600);

    qCtx.fillStyle = accentColorStr;
    qCtx.fillRect(0, 0, 400, 70);
    qCtx.fillStyle = '#000000';
    qCtx.font = 'bold 24px sans-serif';
    qCtx.fillText('UPI FAST-PAY // NODE', 25, 45);

    qCtx.fillStyle = '#ffffff';
    qCtx.fillRect(60, 110, 280, 280);
    qCtx.fillStyle = '#000000';
    qCtx.fillRect(80, 130, 70, 70);
    qCtx.fillRect(250, 130, 70, 70);
    qCtx.fillRect(80, 300, 70, 70);
    qCtx.fillStyle = accentColorStr;
    qCtx.fillRect(180, 230, 40, 40);

    qCtx.fillStyle = '#ffffff';
    qCtx.font = 'bold 24px sans-serif';
    qCtx.fillText(label.slice(0, 18), 40, 450);
    qCtx.fillStyle = accentColorStr;
    qCtx.font = '18px monospace';
    qCtx.fillText(`RISK PROBABILITY: ${(risk * 100).toFixed(1)}%`, 45, 510);
  }
  const qrTex = new THREE.CanvasTexture(qrCanvas);
  const screenMat = new THREE.MeshBasicMaterial({ map: qrTex, side: THREE.DoubleSide });
  const screen = new THREE.Mesh(new THREE.PlaneGeometry(3.6, 7.6), screenMat);
  screen.position.set(0, 4.8, 0.42);
  screen.rotation.x = -Math.PI / 14;
  group.add(screen);

  const holoGroup = new THREE.Group();
  holoGroup.position.set(0, 10.2, 0);
  holoGroup.name = 'orbitRing';

  const holoDiamond = new THREE.Mesh(
    new THREE.OctahedronGeometry(1.4, 0),
    new THREE.MeshStandardMaterial({
      color: accentColor,
      emissive: accentColor,
      emissiveIntensity: 0.95,
      wireframe: true,
    })
  );
  holoGroup.add(holoDiamond);

  const ring1 = new THREE.Mesh(
    new THREE.TorusGeometry(3.2, 0.14, 12, 36),
    new THREE.MeshBasicMaterial({ color: accentColor, transparent: true, opacity: 0.7 })
  );
  ring1.rotation.x = Math.PI / 2.5;
  holoGroup.add(ring1);
  group.add(holoGroup);

  return group;
}

/**
 * 🏦 EPIC HEAVY TITANIUM BANK SAFE VAULT (SEED ORIGIN)
 */
function createEpicBankVaultModel(): THREE.Group {
  const group = new THREE.Group();

  const vaultGeo = new THREE.BoxGeometry(7.5, 7.5, 7.5);
  const vaultMat = new THREE.MeshStandardMaterial({
    color: 0x171c26,
    metalness: 0.98,
    roughness: 0.15,
  });
  const vault = new THREE.Mesh(vaultGeo, vaultMat);
  vault.position.y = 3.75;
  vault.castShadow = true;
  vault.receiveShadow = true;
  group.add(vault);

  const frame = new THREE.Mesh(
    new THREE.CylinderGeometry(3.2, 3.2, 1.0, 40),
    new THREE.MeshStandardMaterial({ color: 0xff5500, metalness: 0.92, roughness: 0.18 })
  );
  frame.rotateX(Math.PI / 2);
  frame.position.set(0, 3.75, 3.9);
  group.add(frame);

  const wheelGroup = new THREE.Group();
  wheelGroup.position.set(0, 3.75, 4.5);
  wheelGroup.name = 'vaultWheel';

  const rim = new THREE.Mesh(
    new THREE.TorusGeometry(2.2, 0.28, 16, 40),
    new THREE.MeshStandardMaterial({ color: 0xf8fafc, metalness: 0.98, roughness: 0.05 })
  );
  wheelGroup.add(rim);

  const hub = new THREE.Mesh(
    new THREE.CylinderGeometry(0.8, 0.8, 0.5, 24),
    new THREE.MeshStandardMaterial({ color: 0xff5500, metalness: 0.95 })
  );
  hub.rotateX(Math.PI / 2);
  wheelGroup.add(hub);

  for (let i = 0; i < 4; i++) {
    const spoke = new THREE.Mesh(
      new THREE.CylinderGeometry(0.16, 0.16, 4.4, 12),
      new THREE.MeshStandardMaterial({ color: 0xd4d4d8, metalness: 0.95 })
    );
    spoke.rotateZ((i * Math.PI) / 4);
    wheelGroup.add(spoke);
  }
  group.add(wheelGroup);

  const warningRing = new THREE.Mesh(
    new THREE.RingGeometry(6.2, 7.8, 48),
    new THREE.MeshBasicMaterial({ color: 0xff5500, transparent: true, opacity: 0.55, side: THREE.DoubleSide })
  );
  warningRing.rotateX(-Math.PI / 2);
  warningRing.position.y = 0.08;
  group.add(warningRing);

  return group;
}

/**
 * 🏪 EPIC VERIFIED MERCHANT STOREFRONT MODEL
 */
function createEpicVerifiedMerchantModel(): THREE.Group {
  const group = new THREE.Group();

  const base = new THREE.Mesh(
    new THREE.BoxGeometry(9.2, 5.4, 8.2),
    new THREE.MeshStandardMaterial({ color: 0x10261c, metalness: 0.88, roughness: 0.15 })
  );
  base.position.y = 2.7;
  group.add(base);

  const canopy = new THREE.Mesh(
    new THREE.BoxGeometry(10.0, 1.8, 9.0),
    new THREE.MeshStandardMaterial({ color: 0x10b981, emissive: 0x10b981, emissiveIntensity: 0.75 })
  );
  canopy.position.set(0, 6.3, 0);
  group.add(canopy);

  const badge = new THREE.Mesh(
    new THREE.TorusGeometry(1.8, 0.22, 12, 32),
    new THREE.MeshStandardMaterial({ color: 0x10b981, emissive: 0x10b981, emissiveIntensity: 1.0 })
  );
  badge.position.set(0, 8.8, 0);
  badge.name = 'merchantBadge';
  group.add(badge);

  return group;
}

// ─────────────────────────────────────────────────────────────────────────────
// 🚀 MAIN 3D SIMULATION CANVAS COMPONENT
// ─────────────────────────────────────────────────────────────────────────────

export const ThreeNetworkCanvas: React.FC<ThreeNetworkCanvasProps> = ({
  currentStage,
  seedEntityId,
  incidentDetail,
  speed,
  onSelectNode,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [cameraMode, setCameraMode] = useState<'PERSPECTIVE' | 'TOP' | 'ISOMETRIC'>('PERSPECTIVE');
  const [inspectedNode, setInspectedNode] = useState<SimNode3D | null>(null);
  const [temporalScrubber, setTemporalScrubber] = useState<number>(72); // 0 to 72 hours

  useEffect(() => {
    nodesRef.current.forEach(node => {
      const nodeTime = node.hopLevel * 24; 
      const isVisible = temporalScrubber >= nodeTime;
      node.targetScale = isVisible ? 1.0 : 0.001;
    });

    edgesRef.current.forEach(edge => {
      const edgeTime = edge.hopLevel * 24;
      edge.targetProgress = temporalScrubber >= edgeTime ? 1.0 : 0.0;
    });
  }, [temporalScrubber]);

  const targetCamPosRef = useRef<THREE.Vector3>(new THREE.Vector3(0, 80, 155));
  const targetLookAtRef = useRef<THREE.Vector3>(new THREE.Vector3(0, 5, 0));

  const nodesRef = useRef<SimNode3D[]>([]);
  const edgesRef = useRef<SimEdge3D[]>([]);
  const currentStageRef = useRef<number>(currentStage);
  const speedRef = useRef<number>(speed);

  currentStageRef.current = currentStage;
  speedRef.current = speed;

  // 1. Smoothly update target edge and node states when currentStage changes
  useEffect(() => {
    nodesRef.current.forEach((node) => {
      const isVisible = currentStage >= (node.hopLevel === 0 ? 1 : (node.hopLevel === 1 ? 2 : (node.hopLevel === 2 ? 4 : 5))) || currentStage === 0 || currentStage === 8;
      node.targetScale = isVisible ? 1.0 : 0.001;
    });

    edgesRef.current.forEach((edge) => {
      const isEdgeActive = currentStage >= (edge.hopLevel === 1 ? 2 : (edge.hopLevel === 2 ? 4 : 5)) || currentStage === 8;
      edge.targetDrawProgress = isEdgeActive ? 1.0 : 0.0;
    });
  }, [currentStage]);

  // 2. Initialize WebGL Scene ONCE per seedEntityId / incidentDetail
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const width = container.clientWidth;
    const height = container.clientHeight;

    // ── 1. SCENE & CAMERA SETUP ──
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x060709);
    scene.fog = new THREE.FogExp2(0x060709, 0.0024);

    const camera = new THREE.PerspectiveCamera(38, width / height, 0.1, 1000);
    camera.position.copy(targetCamPosRef.current);
    camera.lookAt(targetLookAtRef.current);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.25;
    container.appendChild(renderer.domElement);

    // ── 2. CINEMATIC LIGHTING ──
    scene.add(new THREE.AmbientLight(0xf4f4f5, 0.85));

    const mainKeyLight = new THREE.DirectionalLight(0xffffff, 2.4);
    mainKeyLight.position.set(70, 110, 80);
    mainKeyLight.castShadow = true;
    mainKeyLight.shadow.mapSize.width = 2048;
    mainKeyLight.shadow.mapSize.height = 2048;
    scene.add(mainKeyLight);

    const fieryRimLight = new THREE.DirectionalLight(0xff5500, 2.2);
    fieryRimLight.position.set(-80, 45, -70);
    scene.add(fieryRimLight);

    const cyanFillLight = new THREE.DirectionalLight(0x38bdf8, 1.4);
    cyanFillLight.position.set(60, -25, -60);
    scene.add(cyanFillLight);

    // ── 3. MULTI-TIER OBSIDIAN RADAR DAIS ──
    const plinthGroup = new THREE.Group();

    const plinthGeo = new THREE.CylinderGeometry(92, 96, 6, 64);
    const plinthMat = new THREE.MeshStandardMaterial({
      color: 0x0a0c10,
      roughness: 0.4,
      metalness: 0.8,
    });
    const plinth = new THREE.Mesh(plinthGeo, plinthMat);
    plinth.position.y = -3.0;
    plinth.receiveShadow = true;
    plinthGroup.add(plinth);

    [
      { r1: 88.0, r2: 88.8, color: 0xff5500, opacity: 0.85 },
      { r1: 65.0, r2: 65.5, color: 0x38bdf8, opacity: 0.55 },
      { r1: 40.0, r2: 40.4, color: 0xff5500, opacity: 0.4 },
    ].forEach((ring) => {
      const ringMesh = new THREE.Mesh(
        new THREE.RingGeometry(ring.r1, ring.r2, 64),
        new THREE.MeshBasicMaterial({ color: ring.color, transparent: true, opacity: ring.opacity, side: THREE.DoubleSide })
      );
      ringMesh.rotateX(-Math.PI / 2);
      ringMesh.position.y = 0.06;
      plinthGroup.add(ringMesh);
    });

    const gridHelper = new THREE.GridHelper(150, 32, 0xff5500, 0x1b202a);
    gridHelper.position.y = 0.05;
    (gridHelper.material as THREE.Material).transparent = true;
    (gridHelper.material as THREE.Material).opacity = 0.4;
    plinthGroup.add(gridHelper);
    scene.add(plinthGroup);

    // Floating Cyber Dust Particles
    const dustGeo = new THREE.BufferGeometry();
    const dustCount = 50;
    const dustPos = new Float32Array(dustCount * 3);
    for (let i = 0; i < dustCount * 3; i += 3) {
      dustPos[i] = (Math.random() - 0.5) * 140;
      dustPos[i + 1] = Math.random() * 35;
      dustPos[i + 2] = (Math.random() - 0.5) * 140;
    }
    dustGeo.setAttribute('position', new THREE.BufferAttribute(dustPos, 3));
    const dustMat = new THREE.PointsMaterial({ color: 0xff5500, size: 1.2, transparent: true, opacity: 0.6 });
    const dustParticles = new THREE.Points(dustGeo, dustMat);
    scene.add(dustParticles);

    // ── 4. DYNAMIC SEED-ENTITY TOPOLOGY GENERATOR ──
    const tier = incidentDetail?.model_prediction.confidence_tier || 'HIGH_CONFIDENCE';
    const amount = incidentDetail?.complaint.reported_amount || 450000;
    const location = incidentDetail?.complaint.location || 'Victim Area';
    const exitTerminalId = incidentDetail?.model_prediction.top_terminal_id || 'ATM_008';
    const exitCity = incidentDetail?.model_prediction.top_terminal_city || 'Target City';
    const gnnRisk = incidentDetail?.model_prediction.graphsage_risk_probability || 0.95;

    let nodes: SimNode3D[] = [];
    let edgeDefs: { source: string; target: string; amount: number; hopLevel: number; isCashOut: boolean; isSuspicious: boolean }[] = [];

    if (tier === 'NORMAL') {
      nodes = [
        { id: seedEntityId, label: `${seedEntityId} (Origin Account)`, type: 'VICTIM', city: location, risk: gnnRisk, amount, hopLevel: 0, position: new THREE.Vector3(-40, 0, 0), color: '#F8FAFC', targetScale: 1.0, currentScale: 1.0 },
        { id: 'BANK_CLEARING', label: 'Commercial Bank Clearing', type: 'LAYERING', city: `${location} Branch`, risk: gnnRisk, amount, hopLevel: 1, position: new THREE.Vector3(0, 0, 0), color: '#F8FAFC', targetScale: 1.0, currentScale: 1.0 },
        { id: 'MERCHANT_EXIT', label: 'Verified Merchant Vendor', type: 'MERCHANT', city: 'Retail Settlement', risk: gnnRisk, amount, hopLevel: 2, position: new THREE.Vector3(40, 0, 0), color: '#10B981', targetScale: 1.0, currentScale: 1.0 },
      ];
      edgeDefs = [
        { source: seedEntityId, target: 'BANK_CLEARING', amount, hopLevel: 1, isCashOut: false, isSuspicious: false },
        { source: 'BANK_CLEARING', target: 'MERCHANT_EXIT', amount, hopLevel: 2, isCashOut: false, isSuspicious: false },
      ];
    } else if (tier === 'MEDIUM_CONFIDENCE') {
      const p1 = Math.round(amount * 0.52);
      const p2 = amount - p1;
      nodes = [
        { id: seedEntityId, label: `${seedEntityId} (Micro Origin)`, type: 'VICTIM', city: location, risk: gnnRisk, amount: p1, hopLevel: 0, position: new THREE.Vector3(-48, 0, -22), color: '#F8FAFC', targetScale: 1.0, currentScale: 1.0 },
        { id: 'SMURF_MULE_2', label: 'Mule Micro-Deposit', type: 'MULE', city: 'Intermediary Hub', risk: gnnRisk, amount: p2, hopLevel: 0, position: new THREE.Vector3(-48, 0, 22), color: '#38BDF8', targetScale: 1.0, currentScale: 1.0 },
        { id: 'AGGREGATOR', label: 'Consolidation Mule Account', type: 'LAYERING', city: 'Aggregation Branch', risk: gnnRisk, amount, hopLevel: 1, position: new THREE.Vector3(6, 0, 0), color: '#F8FAFC', targetScale: 1.0, currentScale: 1.0 },
        { id: 'ATM_EXIT', label: `${exitTerminalId} (${exitCity})`, type: 'ATM', city: exitCity, risk: gnnRisk, amount, hopLevel: 2, position: new THREE.Vector3(50, 0, 0), color: '#F97316', targetScale: 1.0, currentScale: 1.0 },
      ];
      edgeDefs = [
        { source: seedEntityId, target: 'AGGREGATOR', amount: p1, hopLevel: 1, isCashOut: false, isSuspicious: true },
        { source: 'SMURF_MULE_2', target: 'AGGREGATOR', amount: p2, hopLevel: 1, isCashOut: false, isSuspicious: true },
        { source: 'AGGREGATOR', target: 'ATM_EXIT', amount, hopLevel: 2, isCashOut: true, isSuspicious: true },
      ];
    } else {
      // HIGH_CONFIDENCE Threat
      const p1 = Math.round(amount * 0.35);
      const p2 = Math.round(amount * 0.40);
      const p3 = amount - p1 - p2;

      nodes = [
        { id: seedEntityId, label: `${seedEntityId} (Victim Safe)`, type: 'VICTIM', city: location, risk: gnnRisk, amount, hopLevel: 0, position: new THREE.Vector3(-50, 0, 0), color: '#F8FAFC', targetScale: 1.0, currentScale: 1.0 },
        { id: 'MULE_01', label: 'UPI Mule Account Alpha', type: 'MULE', city: 'Kolkata Hub', risk: 0.96, amount: p1, hopLevel: 1, position: new THREE.Vector3(-22, 0, -26), color: '#38BDF8', targetScale: 1.0, currentScale: 1.0 },
        { id: 'MULE_02', label: 'UPI Mule Account Beta', type: 'MULE', city: 'Bhubaneswar Hub', risk: 0.95, amount: p2, hopLevel: 1, position: new THREE.Vector3(-20, 0, 26), color: '#38BDF8', targetScale: 1.0, currentScale: 1.0 },
        { id: 'MULE_03', label: 'UPI Mule Account Gamma', type: 'MULE', city: 'Ranchi Hub', risk: 0.92, amount: p3, hopLevel: 1, position: new THREE.Vector3(-8, 0, 0), color: '#38BDF8', targetScale: 1.0, currentScale: 1.0 },
        { id: 'LAYER_01', label: 'Commercial Clearing Branch', type: 'LAYERING', city: 'Nagpur', risk: 0.88, amount: p1 + Math.round(p3 * 0.5), hopLevel: 2, position: new THREE.Vector3(16, 0, -18), color: '#F8FAFC', targetScale: 1.0, currentScale: 1.0 },
        { id: 'LAYER_02', label: 'Inter-Bank Routing Hub', type: 'LAYERING', city: 'Pune', risk: 0.88, amount: p2 + Math.round(p3 * 0.5), hopLevel: 2, position: new THREE.Vector3(18, 0, 18), color: '#F8FAFC', targetScale: 1.0, currentScale: 1.0 },
        { id: 'ATM_EXIT', label: `${exitTerminalId} (${exitCity})`, type: 'ATM', city: exitCity, risk: gnnRisk, amount, hopLevel: 3, position: new THREE.Vector3(54, 0, 0), color: '#F97316', targetScale: 1.0, currentScale: 1.0 },
      ];
      edgeDefs = [
        { source: seedEntityId, target: 'MULE_01', amount: p1, hopLevel: 1, isCashOut: false, isSuspicious: true },
        { source: seedEntityId, target: 'MULE_02', amount: p2, hopLevel: 1, isCashOut: false, isSuspicious: true },
        { source: seedEntityId, target: 'MULE_03', amount: p3, hopLevel: 1, isCashOut: false, isSuspicious: true },
        { source: 'MULE_01', target: 'LAYER_01', amount: p1, hopLevel: 2, isCashOut: false, isSuspicious: true },
        { source: 'MULE_02', target: 'LAYER_02', amount: p2, hopLevel: 2, isCashOut: false, isSuspicious: true },
        { source: 'MULE_03', target: 'LAYER_01', amount: Math.round(p3 * 0.5), hopLevel: 2, isCashOut: false, isSuspicious: true },
        { source: 'MULE_03', target: 'LAYER_02', amount: Math.round(p3 * 0.5), hopLevel: 2, isCashOut: false, isSuspicious: true },
        { source: 'LAYER_01', target: 'ATM_EXIT', amount: p1 + Math.round(p3 * 0.5), hopLevel: 3, isCashOut: true, isSuspicious: true },
        { source: 'LAYER_02', target: 'ATM_EXIT', amount: p2 + Math.round(p3 * 0.5), hopLevel: 3, isCashOut: true, isSuspicious: true },
      ];
    }

    // ── SPAWN 3D MODELS ──
    const shadowGeo = new THREE.CircleGeometry(8.5, 36);
    shadowGeo.rotateX(-Math.PI / 2);
    const shadowMat = new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.65 });

    nodes.forEach((node) => {
      let modelGroup: THREE.Group;

      if (node.type === 'ATM') {
        modelGroup = createEpicATMKioskModel(0xf97316, exitTerminalId);
      } else if (node.type === 'LAYERING') {
        modelGroup = createEpicBankBranchModel();
      } else if (node.type === 'VICTIM') {
        modelGroup = createEpicBankVaultModel();
      } else if (node.type === 'MERCHANT') {
        modelGroup = createEpicVerifiedMerchantModel();
      } else {
        modelGroup = createEpicMobileUPITerminalModel(node.risk, node.label);
      }

      modelGroup.position.copy(node.position);

      const shadowMesh = new THREE.Mesh(shadowGeo, shadowMat);
      shadowMesh.position.y = 0.06;
      modelGroup.add(shadowMesh);

      const stage = currentStageRef.current;
      const isVisible = stage >= (node.hopLevel === 0 ? 1 : (node.hopLevel === 1 ? 2 : (node.hopLevel === 2 ? 4 : 5))) || stage === 0 || stage === 8;
      node.targetScale = isVisible ? 1.0 : 0.001;
      node.currentScale = isVisible ? 1.0 : 0.001;
      modelGroup.scale.setScalar(node.currentScale);

      scene.add(modelGroup);
      node.mesh = modelGroup;
    });

    nodesRef.current = nodes;

    // ── DUAL-LAYER FIBER-OPTIC LASER CONDUITS ──
    const edges: SimEdge3D[] = [];

    edgeDefs.forEach((def) => {
      const src = nodes.find(n => n.id === def.source);
      const tgt = nodes.find(n => n.id === def.target);
      if (!src || !tgt) return;

      const mid = new THREE.Vector3().addVectors(src.position, tgt.position).multiplyScalar(0.5);
      mid.y += 12;

      const curve = new THREE.QuadraticBezierCurve3(src.position, mid, tgt.position);
      const stage = currentStageRef.current;
      const isTargetActive = stage >= (def.hopLevel === 1 ? 2 : (def.hopLevel === 2 ? 4 : 5)) || stage === 8;

      const colorHex = def.isCashOut ? 0xf97316 : (def.isSuspicious ? 0xff5500 : 0x10b981);

      const coreGeom = new THREE.BufferGeometry().setFromPoints([src.position, src.position]);
      const coreMat = new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.95 });
      const coreLine = new THREE.Line(coreGeom, coreMat);
      scene.add(coreLine);

      const glowGeom = new THREE.BufferGeometry().setFromPoints([src.position, src.position]);
      const glowMat = new THREE.LineBasicMaterial({ color: colorHex, transparent: true, opacity: 0.7 });
      const glowLine = new THREE.Line(glowGeom, glowMat);
      scene.add(glowLine);

      edges.push({
        source: def.source,
        target: def.target,
        amount: def.amount,
        hopLevel: def.hopLevel,
        isCashOut: def.isCashOut,
        isSuspicious: def.isSuspicious,
        curve,
        coreLine,
        glowLine,
        drawProgress: isTargetActive ? 1.0 : 0.0,
        targetDrawProgress: isTargetActive ? 1.0 : 0.0,
      });
    });

    edgesRef.current = edges;

    // ── HIGH-VELOCITY COMET PACKETS ──
    const particleCount = 45;
    const pGeom = new THREE.SphereGeometry(1.1, 16, 16);
    const pMatOrange = new THREE.MeshBasicMaterial({ color: 0xff5500 });
    const pMatAmber = new THREE.MeshBasicMaterial({ color: 0xf97316 });
    const pMatGreen = new THREE.MeshBasicMaterial({ color: 0x10b981 });

    const particles: { mesh: THREE.Mesh; edgeIdx: number; progress: number; speed: number }[] = [];

    for (let i = 0; i < particleCount; i++) {
      const edgeIdx = i % edges.length;
      const edge = edges[edgeIdx];
      const mesh = new THREE.Mesh(
        pGeom,
        edge.isCashOut ? pMatAmber : (edge.isSuspicious ? pMatOrange : pMatGreen)
      );
      mesh.visible = false;
      scene.add(mesh);

      particles.push({
        mesh,
        edgeIdx,
        progress: (i / particleCount),
        speed: 0.28 + (i % 4) * 0.06,
      });
    }

    // ── RAYCASTING INTERACTION ──
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const handlePointerDown = (event: MouseEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(scene.children, true);

      if (intersects.length > 0) {
        let hitObject: THREE.Object3D | null = intersects[0].object;
        while (hitObject && hitObject.parent && hitObject.parent !== scene) {
          hitObject = hitObject.parent;
        }

        const foundNode = nodes.find(n => n.mesh === hitObject);
        if (foundNode) {
          setInspectedNode(foundNode);
          onSelectNode?.(foundNode);
          targetCamPosRef.current.set(foundNode.position.x, foundNode.position.y + 30, foundNode.position.z + 52);
          targetLookAtRef.current.copy(foundNode.position);
        }
      }
    };

    renderer.domElement.addEventListener('pointerdown', handlePointerDown);

    // ── 60FPS CINEMATIC ANIMATION LOOP ──
    let animId: number;
    const clock = new THREE.Clock();

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const delta = Math.min(clock.getDelta(), 0.1);
      const spd = speedRef.current;

      camera.position.lerp(targetCamPosRef.current, 0.05);
      camera.lookAt(targetLookAtRef.current);

      plinthGroup.rotation.y += 0.0007 * spd;
      dustParticles.rotation.y += 0.0003 * spd;

      nodes.forEach((n) => {
        if (n.mesh) {
          n.currentScale = THREE.MathUtils.lerp(n.currentScale, n.targetScale, 0.12);
          n.mesh.scale.setScalar(Math.max(n.currentScale, 0.001));
          n.mesh.position.y = n.position.y;

          const wheel = n.mesh.getObjectByName('vaultWheel');
          if (wheel) wheel.rotation.z += 0.018 * spd;

          const orbitRing = n.mesh.getObjectByName('orbitRing');
          if (orbitRing) {
            orbitRing.rotation.y += 0.022 * spd;
            orbitRing.rotation.z += 0.015 * spd;
          }

          const shield = n.mesh.getObjectByName('floatingShield');
          if (shield) shield.rotation.y += 0.025 * spd;

          const badge = n.mesh.getObjectByName('merchantBadge');
          if (badge) badge.rotation.y += 0.02 * spd;

          const turret = n.mesh.getObjectByName('atmTurret');
          if (turret) turret.rotation.y += 0.012 * spd;
        }
      });

      edges.forEach((edge) => {
        if (Math.abs(edge.drawProgress - edge.targetDrawProgress) > 0.001) {
          edge.drawProgress = THREE.MathUtils.lerp(edge.drawProgress, edge.targetDrawProgress, 0.08);

          if (edge.curve && edge.coreLine && edge.glowLine) {
            const count = Math.max(2, Math.floor(edge.drawProgress * 40));
            const pts: THREE.Vector3[] = [];
            for (let i = 0; i <= count; i++) {
              pts.push(edge.curve.getPoint((i / 40) * edge.drawProgress));
            }
            const newGeom = new THREE.BufferGeometry().setFromPoints(pts);
            edge.coreLine.geometry.dispose();
            edge.coreLine.geometry = newGeom;
            edge.glowLine.geometry.dispose();
            edge.glowLine.geometry = newGeom.clone();
          }
        }
      });

      particles.forEach((p) => {
        const edge = edges[p.edgeIdx];
        if (!edge || !edge.curve) return;

        if (edge.drawProgress > 0.2) {
          p.mesh.visible = true;
          p.progress += delta * p.speed * 0.48 * spd;
          if (p.progress > edge.drawProgress) {
            p.progress = 0;
          }
          const pt = edge.curve.getPoint(Math.min(p.progress, 1.0));
          p.mesh.position.copy(pt);
        } else {
          p.mesh.visible = false;
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
      renderer.domElement.removeEventListener('pointerdown', handlePointerDown);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [seedEntityId, incidentDetail]);

  const handleSetCamera = (mode: 'PERSPECTIVE' | 'TOP' | 'ISOMETRIC') => {
    setCameraMode(mode);
    if (mode === 'PERSPECTIVE') {
      targetCamPosRef.current.set(0, 80, 155);
      targetLookAtRef.current.set(0, 5, 0);
    } else if (mode === 'TOP') {
      targetCamPosRef.current.set(0, 165, 0.1);
      targetLookAtRef.current.set(0, 0, 0);
    } else if (mode === 'ISOMETRIC') {
      targetCamPosRef.current.set(100, 100, 100);
      targetLookAtRef.current.set(0, 0, 0);
    }
  };

  return (
    <div className="relative w-full h-full min-h-[460px] bg-[#060709] border border-white/10 rounded-2xl overflow-hidden select-none font-mono">
      <div ref={containerRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

      {/* Top Overlay Controls Bar */}
      <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none text-xs">
        <div className="flex items-center gap-2 bg-[#0C0E12]/90 border border-white/10 px-3.5 py-1.5 rounded  pointer-events-auto shadow-industrial-sm">
          <span className="w-2 h-2 rounded-full bg-[#FF5500] animate-pulse" />
          <span className="text-white font-bold text-[11px]">
            SEED ENTITY: <span className="text-[#FF5500]">{seedEntityId}</span>
          </span>
          <span className="text-zinc-600">|</span>
          <span className="text-zinc-300 text-[10px]">
            {incidentDetail?.complaint.location ? incidentDetail.complaint.location : 'National Grid'}
          </span>
          <span className="text-zinc-600">|</span>
          <span className="text-emerald-400 font-bold text-[10px]">
            ₹{(incidentDetail?.complaint.reported_amount || 450000).toLocaleString('en-IN')}
          </span>
        </div>

        {/* Camera Perspective Selector */}
        <div className="flex items-center gap-1 bg-[#0C0E12]/90 border border-white/10 p-0.5 rounded  pointer-events-auto text-[10px] shadow-industrial-sm">
          {(['PERSPECTIVE', 'TOP', 'ISOMETRIC'] as const).map((mode) => (
            <button
              key={mode}
              onClick={() => handleSetCamera(mode)}
              className={`px-2.5 py-1 rounded font-bold transition-all ${
                cameraMode === mode
                  ? 'bg-white text-black shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              {mode}
            </button>
          ))}

          <button
            onClick={() => handleSetCamera('PERSPECTIVE')}
            className="p-1 text-zinc-400 hover:text-white transition-colors"
            title="Reset Camera"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Temporal Scrubber */}
      <div className="absolute bottom-16 left-1/2 transform -translate-x-1/2 w-96 bg-[#0C0E12]/90 border border-white/10 p-2.5 rounded  pointer-events-auto font-mono shadow-industrial-sm flex flex-col gap-1">
        <div className="flex justify-between text-[9px] font-bold text-zinc-400 uppercase">
          <span>T₀ (Trigger)</span>
          <span className="text-cyan-400">T+{temporalScrubber}H FORWARD BFS</span>
          <span>Tₘₐₓ (72H)</span>
        </div>
        <input 
          type="range" 
          min="0" 
          max="72" 
          step="1"
          value={temporalScrubber}
          onChange={(e) => setTemporalScrubber(Number(e.target.value))}
          className="w-full accent-cyan-400 h-1.5 bg-[#1A1E26] rounded-full appearance-none cursor-ew-resize"
        />
      </div>

      {/* Floating Node Inspector Modal (When clicking any 3D node) */}
      {inspectedNode && (
        <div className="absolute top-14 right-3 w-64 bg-[#0C0E12]/95 border border-[#FF5500]/40 rounded-2xl p-3  shadow-industrial-lg text-[10px] space-y-2 pointer-events-auto animate-in fade-in zoom-in-95">
          <div className="flex items-center justify-between border-b border-white/10 pb-1.5">
            <span className="text-[#FF5500] font-bold uppercase tracking-wider flex items-center gap-1">
              <Eye className="w-3 h-3" />
              <span>NODE INSPECTOR</span>
            </span>
            <button
              onClick={() => setInspectedNode(null)}
              className="text-zinc-500 hover:text-white font-bold"
            >
              ✕
            </button>
          </div>

          <div className="space-y-1 text-zinc-300">
            <div className="font-bold text-white text-xs truncate">{inspectedNode.label}</div>
            <div className="flex justify-between text-zinc-400">
              <span>Node Type:</span>
              <span className="text-white font-bold">{inspectedNode.type}</span>
            </div>
            <div className="flex justify-between text-zinc-400">
              <span>Location:</span>
              <span className="text-zinc-200">{inspectedNode.city}</span>
            </div>
            <div className="flex justify-between text-zinc-400">
              <span>Transacted Volume:</span>
              <span className="text-emerald-400 font-bold">₹{inspectedNode.amount.toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between text-zinc-400">
              <span>Hop Distance:</span>
              <span className="text-white font-bold">Hop {inspectedNode.hopLevel}</span>
            </div>
            <div className="flex justify-between text-zinc-400">
              <span>GraphSAGE Risk:</span>
              <span className="text-[#FF5500] font-bold">{(inspectedNode.risk * 100).toFixed(1)}%</span>
            </div>
          </div>
        </div>
      )}

      {/* Bottom Visual Legend */}
      <div className="absolute bottom-3 left-3 flex items-center gap-4 bg-[#0C0E12]/90 border border-white/10 px-3.5 py-1.5 rounded text-[10px] text-zinc-400  pointer-events-auto font-mono shadow-industrial-sm">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded bg-[#FF5500]" />
          <span className="text-white font-bold">Victim Safe Vault</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded bg-[#38BDF8]" />
          <span className="text-white font-bold">Mobile UPI Mules</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded bg-zinc-300" />
          <span className="text-white font-bold">Commercial Bank Clearing</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded bg-[#F97316]" />
          <span className="text-amber-400 font-bold">ATM Cash-Out Kiosk</span>
        </div>
      </div>
    </div>
  );
};
