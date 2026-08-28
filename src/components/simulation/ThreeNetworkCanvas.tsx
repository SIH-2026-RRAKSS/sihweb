import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { RotateCcw } from 'lucide-react';

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
  lineMesh: THREE.Line;
  drawProgress: number;
  targetDrawProgress: number;
}

interface ThreeNetworkCanvasProps {
  currentStage: number;
  scenario: string;
  seedEntityId: string;
  isAlerting?: boolean;
  speed: number;
  onSelectNode?: (node: SimNode3D | null) => void;
}

// ─────────────────────────────────────────────────────────────────────────────
// 🌟 ULTRA-PREMIUM HD 3D PROCEDURAL ASSET BUILDERS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * 🏧 ULTRA-HD INDUSTRIAL NEXT-GEN ATM CASH-OUT KIOSK
 */
function createATMKioskModel(colorHex: number = 0xf59e0b): THREE.Group {
  const group = new THREE.Group();

  // 1. Heavy Chamfered Base Pedestal (Dark Obsidian Granite)
  const baseGeo = new THREE.BoxGeometry(5.6, 0.9, 5.6);
  const baseMat = new THREE.MeshStandardMaterial({
    color: 0x0a0c12,
    roughness: 0.7,
    metalness: 0.5,
  });
  const base = new THREE.Mesh(baseGeo, baseMat);
  base.position.y = 0.45;
  base.receiveShadow = true;
  group.add(base);

  // 2. Kiosk Main Monolith Body (Matte Carbon Titanium)
  const bodyGeo = new THREE.BoxGeometry(4.6, 7.8, 4.4);
  const bodyMat = new THREE.MeshStandardMaterial({
    color: 0x11141c,
    metalness: 0.9,
    roughness: 0.22,
  });
  const body = new THREE.Mesh(bodyGeo, bodyMat);
  body.position.y = 4.8;
  body.castShadow = true;
  body.receiveShadow = true;
  group.add(body);

  // 3. Angled Ergonomic Console Bezel
  const fasciaGeo = new THREE.BoxGeometry(4.4, 4.2, 2.0);
  const fasciaMat = new THREE.MeshStandardMaterial({
    color: 0x1a202c,
    metalness: 0.92,
    roughness: 0.18,
  });
  const fascia = new THREE.Mesh(fasciaGeo, fasciaMat);
  fascia.position.set(0, 8.8, 1.5);
  fascia.rotation.x = -Math.PI / 10;
  group.add(fascia);

  // 4. Ultra-Crisp Canvas OLED Glass Screen
  const screenCanvas = document.createElement('canvas');
  screenCanvas.width = 512;
  screenCanvas.height = 320;
  const sCtx = screenCanvas.getContext('2d');
  if (sCtx) {
    sCtx.fillStyle = '#04070d';
    sCtx.fillRect(0, 0, 512, 320);

    // Glowing Neon Border
    sCtx.strokeStyle = '#f59e0b';
    sCtx.lineWidth = 6;
    sCtx.strokeRect(10, 10, 492, 300);

    // Header Badge
    sCtx.fillStyle = '#f59e0b';
    sCtx.font = 'bold 32px monospace';
    sCtx.fillText('24H ATM // CASH TERMINAL', 30, 60);

    // Live Target Withdrawal Status
    sCtx.font = '22px monospace';
    sCtx.fillStyle = '#38bdf8';
    sCtx.fillText('TARGET EXIT: VERIFIED', 30, 115);
    sCtx.fillStyle = '#e2e8f0';
    sCtx.fillText('DISPENSING: INR 8,20,000.00', 30, 160);

    // Progress Bar
    sCtx.fillStyle = '#1e293b';
    sCtx.fillRect(30, 195, 450, 24);
    sCtx.fillStyle = '#10b981';
    sCtx.fillRect(30, 195, 410, 24);

    sCtx.fillStyle = '#ffffff';
    sCtx.font = 'bold 18px monospace';
    sCtx.fillText('91.4% COMPLETE // CASH EJECT', 40, 260);
  }
  const screenTex = new THREE.CanvasTexture(screenCanvas);
  const screenMat = new THREE.MeshBasicMaterial({ map: screenTex });
  const screen = new THREE.Mesh(new THREE.PlaneGeometry(3.6, 2.3), screenMat);
  screen.position.set(0, 9.3, 2.54);
  screen.rotation.x = -Math.PI / 10;
  group.add(screen);

  // 5. Specular Chrome Keypad Console
  const keypad = new THREE.Mesh(
    new THREE.BoxGeometry(2.6, 1.3, 0.45),
    new THREE.MeshStandardMaterial({ color: 0xd4d4d8, metalness: 0.95, roughness: 0.08 })
  );
  keypad.position.set(0, 7.2, 2.45);
  keypad.rotation.x = -Math.PI / 6;
  group.add(keypad);

  // 6. Recessed Illuminated Cash Dispenser Slot & Currency Note Stack
  const tray = new THREE.Mesh(
    new THREE.BoxGeometry(3.0, 0.7, 1.4),
    new THREE.MeshStandardMaterial({ color: 0x05070a, roughness: 0.6 })
  );
  tray.position.set(0, 4.4, 2.3);
  group.add(tray);

  const notes = new THREE.Mesh(
    new THREE.BoxGeometry(2.4, 0.3, 1.0),
    new THREE.MeshStandardMaterial({
      color: 0x10b981,
      emissive: 0x10b981,
      emissiveIntensity: 0.9,
    })
  );
  notes.position.set(0, 4.4, 2.6);
  group.add(notes);

  // 7. Overhead Glowing Neon Canopy
  const canopy = new THREE.Mesh(
    new THREE.BoxGeometry(5.2, 1.8, 5.0),
    new THREE.MeshStandardMaterial({
      color: colorHex,
      emissive: colorHex,
      emissiveIntensity: 0.85,
      metalness: 0.5,
      roughness: 0.15,
    })
  );
  canopy.position.set(0, 11.6, 0);
  group.add(canopy);

  // 8. 360° Surveillance Security Camera Dome
  const camBase = new THREE.Mesh(
    new THREE.CylinderGeometry(0.9, 0.9, 0.45, 20),
    new THREE.MeshStandardMaterial({ color: 0x27272a, metalness: 0.9 })
  );
  camBase.position.set(0, 12.7, 0);
  group.add(camBase);

  const camDome = new THREE.Mesh(
    new THREE.SphereGeometry(0.65, 20, 20, 0, Math.PI * 2, 0, Math.PI / 2),
    new THREE.MeshStandardMaterial({ color: 0x18181b, metalness: 0.95, roughness: 0.08 })
  );
  camDome.position.set(0, 12.9, 0);
  group.add(camDome);

  const camEye = new THREE.Mesh(
    new THREE.SphereGeometry(0.2, 10, 10),
    new THREE.MeshBasicMaterial({ color: 0xff0000 })
  );
  camEye.position.set(0, 13.0, 0.5);
  group.add(camEye);

  // 9. Ground Glowing Laser Perimeter Target Ring
  const groundRing = new THREE.Mesh(
    new THREE.RingGeometry(7.0, 8.6, 48),
    new THREE.MeshBasicMaterial({ color: colorHex, transparent: true, opacity: 0.45, side: THREE.DoubleSide })
  );
  groundRing.rotateX(-Math.PI / 2);
  groundRing.position.y = 0.08;
  group.add(groundRing);

  return group;
}

/**
 * 🏛️ ULTRA-HD NEOCLASSICAL BANK CLEARING HUB
 */
function createBankBranchModel(): THREE.Group {
  const group = new THREE.Group();

  // 1. 3-Tier Stepped Granite Foundation
  [
    { w: 13.0, h: 0.7, d: 11.0, y: 0.35 },
    { w: 12.0, h: 0.6, d: 10.0, y: 0.95 },
    { w: 11.2, h: 0.5, d: 9.2, y: 1.45 },
  ].forEach((tier) => {
    const mesh = new THREE.Mesh(
      new THREE.BoxGeometry(tier.w, tier.h, tier.d),
      new THREE.MeshStandardMaterial({ color: 0x181e28, metalness: 0.85, roughness: 0.25 })
    );
    mesh.position.y = tier.y;
    mesh.receiveShadow = true;
    group.add(mesh);
  });

  // 2. Central Banking Vault Chamber
  const hall = new THREE.Mesh(
    new THREE.BoxGeometry(9.2, 7.2, 7.2),
    new THREE.MeshStandardMaterial({ color: 0x0f131a, metalness: 0.9, roughness: 0.2 })
  );
  hall.position.y = 5.2;
  hall.castShadow = true;
  group.add(hall);

  // 3. 6 Fluted Neoclassical Ionic Columns
  const colMat = new THREE.MeshStandardMaterial({
    color: 0xf1f5f9,
    metalness: 0.92,
    roughness: 0.12,
  });
  [-4.0, -1.6, 1.6, 4.0].forEach((x) => {
    const col = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.55, 7.0, 24), colMat);
    col.position.set(x, 5.1, 4.0);
    col.castShadow = true;
    group.add(col);

    // Ornate Capital & Base
    const cap = new THREE.Mesh(new THREE.BoxGeometry(1.3, 0.35, 1.3), colMat);
    cap.position.set(x, 8.7, 4.0);
    group.add(cap);

    const baseCap = new THREE.Mesh(new THREE.BoxGeometry(1.3, 0.35, 1.3), colMat);
    baseCap.position.set(x, 1.8, 4.0);
    group.add(baseCap);
  });

  // 4. Heavy Entablature Architrave Beam
  const beam = new THREE.Mesh(
    new THREE.BoxGeometry(11.5, 0.9, 9.5),
    new THREE.MeshStandardMaterial({ color: 0x27303f, metalness: 0.88, roughness: 0.18 })
  );
  beam.position.y = 9.3;
  group.add(beam);

  // 5. Triangular Neoclassical Pediment Roof with Cyan Glow
  const roof = new THREE.Mesh(
    new THREE.ConeGeometry(8.0, 3.4, 4),
    new THREE.MeshStandardMaterial({
      color: 0x38bdf8,
      metalness: 0.75,
      roughness: 0.18,
      emissive: 0x0284c7,
      emissiveIntensity: 0.4,
    })
  );
  roof.rotateY(Math.PI / 4);
  roof.position.set(0, 11.4, 0);
  roof.castShadow = true;
  group.add(roof);

  // 6. Floating Holographic Cyber Seal
  const shield = new THREE.Mesh(
    new THREE.TorusGeometry(1.6, 0.18, 12, 32),
    new THREE.MeshStandardMaterial({
      color: 0x38bdf8,
      emissive: 0x38bdf8,
      emissiveIntensity: 0.95,
    })
  );
  shield.position.set(0, 14.2, 0);
  shield.name = 'floatingShield';
  group.add(shield);

  return group;
}

/**
 * 📱 ULTRA-HD CYBER SMARTPHONE / MOBILE UPI MULE TERMINAL
 */
function createMobileUPITerminalModel(isHighRisk: boolean): THREE.Group {
  const group = new THREE.Group();
  const accentColor = isHighRisk ? 0xff5500 : 0x38bdf8;

  // 1. Matte Titanium Chassis with Chamfered Rails
  const bodyGeo = new THREE.BoxGeometry(3.8, 7.8, 0.65);
  const bodyMat = new THREE.MeshStandardMaterial({
    color: 0x0f1117,
    metalness: 0.96,
    roughness: 0.12,
  });
  const body = new THREE.Mesh(bodyGeo, bodyMat);
  body.position.y = 4.6;
  body.rotation.x = -Math.PI / 14;
  body.castShadow = true;
  group.add(body);

  // 2. High-Gloss OLED Screen with Dynamic Canvas Graphic
  const qrCanvas = document.createElement('canvas');
  qrCanvas.width = 380;
  qrCanvas.height = 540;
  const qCtx = qrCanvas.getContext('2d');
  if (qCtx) {
    qCtx.fillStyle = '#06080e';
    qCtx.fillRect(0, 0, 380, 540);

    // UPI App Header
    qCtx.fillStyle = isHighRisk ? '#ff5500' : '#38bdf8';
    qCtx.fillRect(0, 0, 380, 65);
    qCtx.fillStyle = '#000000';
    qCtx.font = 'bold 22px sans-serif';
    qCtx.fillText('UPI FAST-PAY // MULE', 25, 42);

    // QR Matrix Block
    qCtx.fillStyle = '#ffffff';
    qCtx.fillRect(55, 100, 270, 270);
    qCtx.fillStyle = '#000000';
    qCtx.fillRect(75, 120, 65, 65);
    qCtx.fillRect(235, 120, 65, 65);
    qCtx.fillRect(75, 280, 65, 65);
    qCtx.fillStyle = isHighRisk ? '#ff5500' : '#38bdf8';
    qCtx.fillRect(170, 215, 40, 40);

    // Amount & Layering Flow
    qCtx.fillStyle = '#ffffff';
    qCtx.font = 'bold 26px sans-serif';
    qCtx.fillText('INR 1,50,000.00', 70, 425);
    qCtx.fillStyle = isHighRisk ? '#ff5500' : '#10b981';
    qCtx.font = '18px monospace';
    qCtx.fillText('STATUS: HOP-1 FAN-OUT', 55, 475);
  }
  const qrTex = new THREE.CanvasTexture(qrCanvas);
  const screenMat = new THREE.MeshBasicMaterial({ map: qrTex, side: THREE.DoubleSide });
  const screen = new THREE.Mesh(new THREE.PlaneGeometry(3.4, 7.2), screenMat);
  screen.position.set(0, 4.6, 0.38);
  screen.rotation.x = -Math.PI / 14;
  group.add(screen);

  // 3. Glowing Radar Orbit Ring
  const ring = new THREE.Mesh(
    new THREE.TorusGeometry(4.0, 0.16, 14, 40),
    new THREE.MeshBasicMaterial({ color: accentColor, transparent: true, opacity: 0.75 })
  );
  ring.position.y = 4.6;
  ring.rotation.x = Math.PI / 2.8;
  ring.name = 'orbitRing';
  group.add(ring);

  return group;
}

/**
 * 🏦 ULTRA-HD HEAVY TITANIUM BANK SAFE VAULT (VICTIM ORIGIN)
 */
function createBankVaultModel(): THREE.Group {
  const group = new THREE.Group();

  // 1. Reinforced Steel Cube Vault Body
  const vaultGeo = new THREE.BoxGeometry(7.0, 7.0, 7.0);
  const vaultMat = new THREE.MeshStandardMaterial({
    color: 0x1b202a,
    metalness: 0.96,
    roughness: 0.18,
  });
  const vault = new THREE.Mesh(vaultGeo, vaultMat);
  vault.position.y = 3.5;
  vault.castShadow = true;
  vault.receiveShadow = true;
  group.add(vault);

  // 2. Heavy Vault Beveled Frame Trim
  const frame = new THREE.Mesh(
    new THREE.CylinderGeometry(3.0, 3.0, 0.9, 36),
    new THREE.MeshStandardMaterial({ color: 0xff5500, metalness: 0.9, roughness: 0.2 })
  );
  frame.rotateX(Math.PI / 2);
  frame.position.set(0, 3.5, 3.6);
  group.add(frame);

  // 3. 8-Spoke Heavy Brass Combination Wheel
  const wheelGroup = new THREE.Group();
  wheelGroup.position.set(0, 3.5, 4.1);
  wheelGroup.name = 'vaultWheel';

  const rim = new THREE.Mesh(
    new THREE.TorusGeometry(2.0, 0.25, 14, 36),
    new THREE.MeshStandardMaterial({ color: 0xf4f4f5, metalness: 0.98, roughness: 0.08 })
  );
  wheelGroup.add(rim);

  const hub = new THREE.Mesh(
    new THREE.CylinderGeometry(0.7, 0.7, 0.45, 20),
    new THREE.MeshStandardMaterial({ color: 0xff5500, metalness: 0.95 })
  );
  hub.rotateX(Math.PI / 2);
  wheelGroup.add(hub);

  for (let i = 0; i < 4; i++) {
    const spoke = new THREE.Mesh(
      new THREE.CylinderGeometry(0.14, 0.14, 4.0, 10),
      new THREE.MeshStandardMaterial({ color: 0xd4d4d8, metalness: 0.95 })
    );
    spoke.rotateZ((i * Math.PI) / 4);
    wheelGroup.add(spoke);
  }
  group.add(wheelGroup);

  // 4. Glowing Perimeter Laser Warning Ring
  const warningRing = new THREE.Mesh(
    new THREE.RingGeometry(5.6, 7.0, 48),
    new THREE.MeshBasicMaterial({ color: 0xff5500, transparent: true, opacity: 0.5, side: THREE.DoubleSide })
  );
  warningRing.rotateX(-Math.PI / 2);
  warningRing.position.y = 0.08;
  group.add(warningRing);

  return group;
}

/**
 * 🏪 VERIFIED MERCHANT STOREFRONT MODEL
 */
function createVerifiedMerchantModel(): THREE.Group {
  const group = new THREE.Group();

  const base = new THREE.Mesh(
    new THREE.BoxGeometry(8.8, 5.0, 7.8),
    new THREE.MeshStandardMaterial({ color: 0x12241b, metalness: 0.85, roughness: 0.18 })
  );
  base.position.y = 2.5;
  group.add(base);

  const canopy = new THREE.Mesh(
    new THREE.BoxGeometry(9.4, 1.6, 8.4),
    new THREE.MeshStandardMaterial({ color: 0x10b981, emissive: 0x10b981, emissiveIntensity: 0.65 })
  );
  canopy.position.set(0, 5.8, 0);
  group.add(canopy);

  const badge = new THREE.Mesh(
    new THREE.TorusGeometry(1.6, 0.2, 10, 28),
    new THREE.MeshStandardMaterial({ color: 0x10b981, emissive: 0x10b981, emissiveIntensity: 0.95 })
  );
  badge.position.set(0, 8.0, 0);
  badge.name = 'merchantBadge';
  group.add(badge);

  return group;
}

// ─────────────────────────────────────────────────────────────────────────────
// 🚀 MAIN 3D SIMULATION CANVAS COMPONENT
// ─────────────────────────────────────────────────────────────────────────────

export const ThreeNetworkCanvas: React.FC<ThreeNetworkCanvasProps> = ({
  currentStage,
  scenario,
  seedEntityId,
  speed,
  onSelectNode,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [cameraMode, setCameraMode] = useState<'PERSPECTIVE' | 'TOP' | 'ISOMETRIC'>('PERSPECTIVE');

  const targetCamPosRef = useRef<THREE.Vector3>(new THREE.Vector3(0, 75, 145));
  const targetLookAtRef = useRef<THREE.Vector3>(new THREE.Vector3(0, 5, 0));

  // Persistent references so the WebGL scene is NOT rebuilt on stage changes!
  const nodesRef = useRef<SimNode3D[]>([]);
  const edgesRef = useRef<SimEdge3D[]>([]);
  const currentStageRef = useRef<number>(currentStage);
  const speedRef = useRef<number>(speed);

  currentStageRef.current = currentStage;
  speedRef.current = speed;

  // 1. Smoothly update target edge and node states when currentStage changes
  useEffect(() => {
    // Update node targets
    nodesRef.current.forEach((node) => {
      const isVisible = currentStage >= (node.hopLevel === 0 ? 1 : (node.hopLevel === 1 ? 2 : (node.hopLevel === 2 ? 4 : 5))) || currentStage === 0 || currentStage === 8;
      node.targetScale = isVisible ? 1.0 : 0.001;
    });

    // Update edge line targets
    edgesRef.current.forEach((edge) => {
      const isEdgeActive = currentStage >= (edge.hopLevel === 1 ? 2 : (edge.hopLevel === 2 ? 4 : 5)) || currentStage === 8;
      edge.targetDrawProgress = isEdgeActive ? 1.0 : 0.0;
    });
  }, [currentStage]);

  // 2. Initialize WebGL Scene ONCE per scenario / seed change
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const width = container.clientWidth;
    const height = container.clientHeight;

    // ── SCENE & CAMERA SETUP ──
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x060709);
    scene.fog = new THREE.FogExp2(0x060709, 0.0028);

    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 1000);
    camera.position.copy(targetCamPosRef.current);
    camera.lookAt(targetLookAtRef.current);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    container.appendChild(renderer.domElement);

    // ── LIGHTING RIG ──
    scene.add(new THREE.AmbientLight(0xf4f4f5, 0.95));

    const keyLight = new THREE.DirectionalLight(0xffffff, 2.2);
    keyLight.position.set(60, 100, 70);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.width = 1024;
    keyLight.shadow.mapSize.height = 1024;
    scene.add(keyLight);

    const orangeRimLight = new THREE.DirectionalLight(0xff5500, 1.6);
    orangeRimLight.position.set(-70, 35, -60);
    scene.add(orangeRimLight);

    const cyanFillLight = new THREE.DirectionalLight(0x38bdf8, 0.9);
    cyanFillLight.position.set(50, -20, -50);
    scene.add(cyanFillLight);

    // ── OBSIDIAN RADAR PLINTH BASE ──
    const plinthGroup = new THREE.Group();
    const plinthGeo = new THREE.CylinderGeometry(88, 92, 5, 64);
    const plinthMat = new THREE.MeshStandardMaterial({ color: 0x0c0e12, roughness: 0.5, metalness: 0.6 });
    const plinth = new THREE.Mesh(plinthGeo, plinthMat);
    plinth.position.y = -2.5;
    plinth.receiveShadow = true;
    plinthGroup.add(plinth);

    const gridHelper = new THREE.GridHelper(145, 30, 0xff5500, 0x1f242e);
    gridHelper.position.y = 0.05;
    (gridHelper.material as THREE.Material).transparent = true;
    (gridHelper.material as THREE.Material).opacity = 0.35;
    plinthGroup.add(gridHelper);
    scene.add(plinthGroup);

    // ── TOPOLOGY NODES & EDGES SPECIFICATION ──
    const isNormal = seedEntityId === 'C000001' || seedEntityId === 'C000002' || seedEntityId === 'C000003' || seedEntityId === 'C000005' || scenario === 'normal-tx';
    const isBhopalChain = seedEntityId === 'C000056' || scenario === 'multi-hop';
    const isSmurf = seedEntityId === 'C000004' || seedEntityId === 'C000080' || scenario === 'fan-in';

    let nodes: SimNode3D[] = [];
    let edgeDefs: { source: string; target: string; amount: number; hopLevel: number; isCashOut: boolean; isSuspicious: boolean }[] = [];

    if (isNormal) {
      nodes = [
        { id: seedEntityId, label: `${seedEntityId} (Origin Account)`, type: 'VICTIM', city: 'Kochi (KL)', risk: 0.01, amount: 25000, hopLevel: 0, position: new THREE.Vector3(-38, 0, 0), color: '#10B981', targetScale: 1.0, currentScale: 1.0 },
        { id: 'BANK_CLEARING', label: 'Commercial Bank Clearing', type: 'LAYERING', city: 'Ernakulam Branch', risk: 0.01, amount: 25000, hopLevel: 1, position: new THREE.Vector3(0, 0, 0), color: '#E2E8F0', targetScale: 1.0, currentScale: 1.0 },
        { id: 'MERCHANT_EXIT', label: 'Verified Merchant Vendor', type: 'MERCHANT', city: 'Retail Settlement', risk: 0.01, amount: 25000, hopLevel: 2, position: new THREE.Vector3(38, 0, 0), color: '#10B981', targetScale: 1.0, currentScale: 1.0 },
      ];
      edgeDefs = [
        { source: seedEntityId, target: 'BANK_CLEARING', amount: 25000, hopLevel: 1, isCashOut: false, isSuspicious: false },
        { source: 'BANK_CLEARING', target: 'MERCHANT_EXIT', amount: 25000, hopLevel: 2, isCashOut: false, isSuspicious: false },
      ];
    } else if (isBhopalChain) {
      nodes = [
        { id: seedEntityId, label: `${seedEntityId} (Victim Safe)`, type: 'VICTIM', city: 'Bhopal', risk: 0.99, amount: 820000, hopLevel: 0, position: new THREE.Vector3(-52, 0, 0), color: '#FF5500', targetScale: 1.0, currentScale: 1.0 },
        { id: 'HOP_1', label: 'Hop-1 Intermediate Mule', type: 'MULE', city: 'Indore', risk: 0.98, amount: 820000, hopLevel: 1, position: new THREE.Vector3(-26, 0, 18), color: '#38BDF8', targetScale: 1.0, currentScale: 1.0 },
        { id: 'HOP_2', label: 'Hop-2 Synthetic Layering', type: 'MULE', city: 'Ujjain', risk: 0.96, amount: 820000, hopLevel: 2, position: new THREE.Vector3(0, 0, -18), color: '#38BDF8', targetScale: 1.0, currentScale: 1.0 },
        { id: 'HOP_3', label: 'Hop-3 Conduit Ring', type: 'LAYERING', city: 'Bhopal West', risk: 0.94, amount: 820000, hopLevel: 3, position: new THREE.Vector3(26, 0, 18), color: '#E2E8F0', targetScale: 1.0, currentScale: 1.0 },
        { id: 'ATM_EXIT', label: 'ATM_023 (Bhopal MP Nagar)', type: 'ATM', city: 'Bhopal', risk: 0.92, amount: 820000, hopLevel: 4, position: new THREE.Vector3(52, 0, 0), color: '#F59E0B', targetScale: 1.0, currentScale: 1.0 },
      ];
      edgeDefs = [
        { source: seedEntityId, target: 'HOP_1', amount: 820000, hopLevel: 1, isCashOut: false, isSuspicious: true },
        { source: 'HOP_1', target: 'HOP_2', amount: 820000, hopLevel: 2, isCashOut: false, isSuspicious: true },
        { source: 'HOP_2', target: 'HOP_3', amount: 820000, hopLevel: 3, isCashOut: false, isSuspicious: true },
        { source: 'HOP_3', target: 'ATM_EXIT', amount: 820000, hopLevel: 4, isCashOut: true, isSuspicious: true },
      ];
    } else if (isSmurf) {
      nodes = [
        { id: seedEntityId, label: `${seedEntityId} (Micro Deposit 1)`, type: 'VICTIM', city: 'Jaipur', risk: 0.85, amount: 48000, hopLevel: 0, position: new THREE.Vector3(-46, 0, -24), color: '#FF5500', targetScale: 1.0, currentScale: 1.0 },
        { id: 'SMURF_2', label: 'Micro Deposit 2', type: 'MULE', city: 'Ajmer', risk: 0.82, amount: 49000, hopLevel: 0, position: new THREE.Vector3(-46, 0, 0), color: '#38BDF8', targetScale: 1.0, currentScale: 1.0 },
        { id: 'SMURF_3', label: 'Micro Deposit 3', type: 'MULE', city: 'Kota', risk: 0.84, amount: 47500, hopLevel: 0, position: new THREE.Vector3(-46, 0, 24), color: '#38BDF8', targetScale: 1.0, currentScale: 1.0 },
        { id: 'AGGREGATOR', label: 'Consolidation Mule Account', type: 'LAYERING', city: 'Jaipur Hub', risk: 0.88, amount: 144500, hopLevel: 1, position: new THREE.Vector3(6, 0, 0), color: '#E2E8F0', targetScale: 1.0, currentScale: 1.0 },
        { id: 'ATM_EXIT', label: 'ATM_015 (Jaipur MI Road)', type: 'ATM', city: 'Jaipur', risk: 0.85, amount: 144500, hopLevel: 2, position: new THREE.Vector3(48, 0, 0), color: '#F59E0B', targetScale: 1.0, currentScale: 1.0 },
      ];
      edgeDefs = [
        { source: seedEntityId, target: 'AGGREGATOR', amount: 48000, hopLevel: 1, isCashOut: false, isSuspicious: true },
        { source: 'SMURF_2', target: 'AGGREGATOR', amount: 49000, hopLevel: 1, isCashOut: false, isSuspicious: true },
        { source: 'SMURF_3', target: 'AGGREGATOR', amount: 47500, hopLevel: 1, isCashOut: false, isSuspicious: true },
        { source: 'AGGREGATOR', target: 'ATM_EXIT', amount: 144500, hopLevel: 2, isCashOut: true, isSuspicious: true },
      ];
    } else {
      const isBangalore = seedEntityId === 'C000035';
      const exitATM = isBangalore ? 'ATM_008 (Bengaluru Indiranagar)' : 'ATM_029 (Mumbai Nariman Point)';

      nodes = [
        { id: seedEntityId, label: `${seedEntityId} (Victim Safe)`, type: 'VICTIM', city: isBangalore ? 'Varanasi' : 'South Delhi', risk: 0.99, amount: 450000, hopLevel: 0, position: new THREE.Vector3(-48, 0, 0), color: '#FF5500', targetScale: 1.0, currentScale: 1.0 },
        { id: 'MULE_01', label: 'Mobile UPI Mule A', type: 'MULE', city: 'Kolkata', risk: 0.95, amount: 150000, hopLevel: 1, position: new THREE.Vector3(-20, 0, -26), color: '#38BDF8', targetScale: 1.0, currentScale: 1.0 },
        { id: 'MULE_02', label: 'Mobile UPI Mule B', type: 'MULE', city: 'Bhubaneswar', risk: 0.95, amount: 180000, hopLevel: 1, position: new THREE.Vector3(-18, 0, 26), color: '#38BDF8', targetScale: 1.0, currentScale: 1.0 },
        { id: 'MULE_03', label: 'Mobile UPI Mule C', type: 'MULE', city: 'Ranchi', risk: 0.92, amount: 120000, hopLevel: 1, position: new THREE.Vector3(-6, 0, 0), color: '#38BDF8', targetScale: 1.0, currentScale: 1.0 },
        { id: 'LAYER_01', label: 'Bank Branch Clearing Hub', type: 'LAYERING', city: 'Nagpur', risk: 0.88, amount: 250000, hopLevel: 2, position: new THREE.Vector3(16, 0, -18), color: '#E2E8F0', targetScale: 1.0, currentScale: 1.0 },
        { id: 'LAYER_02', label: 'Commercial Intermediary Hub', type: 'LAYERING', city: 'Pune', risk: 0.88, amount: 200000, hopLevel: 2, position: new THREE.Vector3(18, 0, 18), color: '#E2E8F0', targetScale: 1.0, currentScale: 1.0 },
        { id: 'ATM_EXIT', label: exitATM, type: 'ATM', city: 'Mumbai', risk: 0.98, amount: 450000, hopLevel: 3, position: new THREE.Vector3(52, 0, 0), color: '#F59E0B', targetScale: 1.0, currentScale: 1.0 },
      ];
      edgeDefs = [
        { source: seedEntityId, target: 'MULE_01', amount: 150000, hopLevel: 1, isCashOut: false, isSuspicious: true },
        { source: seedEntityId, target: 'MULE_02', amount: 180000, hopLevel: 1, isCashOut: false, isSuspicious: true },
        { source: seedEntityId, target: 'MULE_03', amount: 120000, hopLevel: 1, isCashOut: false, isSuspicious: true },
        { source: 'MULE_01', target: 'LAYER_01', amount: 150000, hopLevel: 2, isCashOut: false, isSuspicious: true },
        { source: 'MULE_02', target: 'LAYER_02', amount: 180000, hopLevel: 2, isCashOut: false, isSuspicious: true },
        { source: 'MULE_03', target: 'LAYER_01', amount: 60000, hopLevel: 2, isCashOut: false, isSuspicious: true },
        { source: 'MULE_03', target: 'LAYER_02', amount: 60000, hopLevel: 2, isCashOut: false, isSuspicious: true },
        { source: 'LAYER_01', target: 'ATM_EXIT', amount: 250000, hopLevel: 3, isCashOut: true, isSuspicious: true },
        { source: 'LAYER_02', target: 'ATM_EXIT', amount: 200000, hopLevel: 3, isCashOut: true, isSuspicious: true },
      ];
    }

    // ── SPAWN 3D MODELS ROCK-SOLID ON PLINTH ──
    const shadowGeo = new THREE.CircleGeometry(7.5, 32);
    shadowGeo.rotateX(-Math.PI / 2);
    const shadowMat = new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.6 });

    nodes.forEach((node) => {
      let modelGroup: THREE.Group;

      if (node.type === 'ATM') {
        modelGroup = createATMKioskModel(0xf59e0b);
      } else if (node.type === 'LAYERING') {
        modelGroup = createBankBranchModel();
      } else if (node.type === 'VICTIM') {
        modelGroup = createBankVaultModel();
      } else if (node.type === 'MERCHANT') {
        modelGroup = createVerifiedMerchantModel();
      } else {
        modelGroup = createMobileUPITerminalModel(node.risk > 0.5);
      }

      modelGroup.position.copy(node.position);

      const shadowMesh = new THREE.Mesh(shadowGeo, shadowMat);
      shadowMesh.position.y = 0.06;
      modelGroup.add(shadowMesh);

      // Initial visibility state based on currentStageRef
      const stage = currentStageRef.current;
      const isVisible = stage >= (node.hopLevel === 0 ? 1 : (node.hopLevel === 1 ? 2 : (node.hopLevel === 2 ? 4 : 5))) || stage === 0 || stage === 8;
      node.targetScale = isVisible ? 1.0 : 0.001;
      node.currentScale = isVisible ? 1.0 : 0.001;
      modelGroup.scale.setScalar(node.currentScale);

      scene.add(modelGroup);
      node.mesh = modelGroup;
    });

    nodesRef.current = nodes;

    // ── CREATE CONTINUOUS LASER BEZIER ARCS ──
    const edges: SimEdge3D[] = [];

    edgeDefs.forEach((def) => {
      const src = nodes.find(n => n.id === def.source);
      const tgt = nodes.find(n => n.id === def.target);
      if (!src || !tgt) return;

      const mid = new THREE.Vector3().addVectors(src.position, tgt.position).multiplyScalar(0.5);
      mid.y += 11;

      const curve = new THREE.QuadraticBezierCurve3(src.position, mid, tgt.position);
      const stage = currentStageRef.current;
      const isTargetActive = stage >= (def.hopLevel === 1 ? 2 : (def.hopLevel === 2 ? 4 : 5)) || stage === 8;

      const geom = new THREE.BufferGeometry().setFromPoints([src.position, src.position]);
      const color = def.isCashOut ? 0xf59e0b : (def.isSuspicious ? 0xff5500 : 0x10b981);
      const mat = new THREE.LineBasicMaterial({
        color,
        transparent: true,
        opacity: def.isSuspicious ? 0.9 : 0.5,
      });
      const lineMesh = new THREE.Line(geom, mat);
      scene.add(lineMesh);

      edges.push({
        source: def.source,
        target: def.target,
        amount: def.amount,
        hopLevel: def.hopLevel,
        isCashOut: def.isCashOut,
        isSuspicious: def.isSuspicious,
        curve,
        lineMesh,
        drawProgress: isTargetActive ? 1.0 : 0.0,
        targetDrawProgress: isTargetActive ? 1.0 : 0.0,
      });
    });

    edgesRef.current = edges;

    // ── GLOWING ENERGY PACKETS POOL ──
    const particleCount = 40;
    const pGeom = new THREE.SphereGeometry(0.9, 12, 12);
    const pMatOrange = new THREE.MeshBasicMaterial({ color: 0xff5500 });
    const pMatAmber = new THREE.MeshBasicMaterial({ color: 0xf59e0b });
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
        speed: 0.24 + (i % 3) * 0.06,
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
          onSelectNode?.(foundNode);
          targetCamPosRef.current.set(foundNode.position.x, foundNode.position.y + 28, foundNode.position.z + 48);
          targetLookAtRef.current.copy(foundNode.position);
        }
      }
    };

    renderer.domElement.addEventListener('pointerdown', handlePointerDown);

    // ── SMOOTH 60FPS ANIMATION LOOP (SOLID & GROUNDED) ──
    let animId: number;
    const clock = new THREE.Clock();

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const delta = Math.min(clock.getDelta(), 0.1);
      const spd = speedRef.current;

      // Smooth Camera Lerp
      camera.position.lerp(targetCamPosRef.current, 0.05);
      camera.lookAt(targetLookAtRef.current);

      // Ambient Base Rotation
      plinthGroup.rotation.y += 0.0008 * spd;

      // Solid Node Scaling (No Bouncing / No Vertical Bobbing)
      nodes.forEach((n) => {
        if (n.mesh) {
          n.currentScale = THREE.MathUtils.lerp(n.currentScale, n.targetScale, 0.12);
          n.mesh.scale.setScalar(Math.max(n.currentScale, 0.001));
          n.mesh.position.y = n.position.y; // Firmly grounded

          // Internal mechanical rotations
          const wheel = n.mesh.getObjectByName('vaultWheel');
          if (wheel) wheel.rotation.z += 0.015 * spd;

          const orbitRing = n.mesh.getObjectByName('orbitRing');
          if (orbitRing) orbitRing.rotation.z += 0.02 * spd;

          const shield = n.mesh.getObjectByName('floatingShield');
          if (shield) shield.rotation.y += 0.025 * spd;

          const badge = n.mesh.getObjectByName('merchantBadge');
          if (badge) badge.rotation.y += 0.02 * spd;
        }
      });

      // Smooth Continuous Laser Tracing
      edges.forEach((edge) => {
        if (Math.abs(edge.drawProgress - edge.targetDrawProgress) > 0.001) {
          edge.drawProgress = THREE.MathUtils.lerp(edge.drawProgress, edge.targetDrawProgress, 0.08);

          if (edge.curve && edge.lineMesh) {
            const count = Math.max(2, Math.floor(edge.drawProgress * 40));
            const pts: THREE.Vector3[] = [];
            for (let i = 0; i <= count; i++) {
              pts.push(edge.curve.getPoint((i / 40) * edge.drawProgress));
            }
            edge.lineMesh.geometry.dispose();
            edge.lineMesh.geometry = new THREE.BufferGeometry().setFromPoints(pts);
          }
        }
      });

      // Continuous Fluid Energy Stream
      particles.forEach((p) => {
        const edge = edges[p.edgeIdx];
        if (!edge || !edge.curve) return;

        if (edge.drawProgress > 0.2) {
          p.mesh.visible = true;
          p.progress += delta * p.speed * 0.45 * spd;
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
  }, [scenario, seedEntityId]);

  const handleSetCamera = (mode: 'PERSPECTIVE' | 'TOP' | 'ISOMETRIC') => {
    setCameraMode(mode);
    if (mode === 'PERSPECTIVE') {
      targetCamPosRef.current.set(0, 75, 145);
      targetLookAtRef.current.set(0, 5, 0);
    } else if (mode === 'TOP') {
      targetCamPosRef.current.set(0, 160, 0.1);
      targetLookAtRef.current.set(0, 0, 0);
    } else if (mode === 'ISOMETRIC') {
      targetCamPosRef.current.set(95, 95, 95);
      targetLookAtRef.current.set(0, 0, 0);
    }
  };

  return (
    <div className="relative w-full h-full min-h-[420px] bg-[#060709] border border-white/10 rounded-lg overflow-hidden select-none font-mono">
      <div ref={containerRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

      {/* Top Overlay Controls Bar */}
      <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none text-xs">
        <div className="flex items-center gap-2 bg-[#0C0E12]/90 border border-white/10 px-3 py-1.5 rounded backdrop-blur-md pointer-events-auto">
          <span className="w-2 h-2 rounded-full bg-[#FF5500] animate-pulse" />
          <span className="text-white font-bold text-[11px]">
            SEED: <span className="text-[#FF5500]">{seedEntityId}</span>
          </span>
          <span className="text-zinc-600">|</span>
          <span className="text-zinc-400 text-[10px]">
            {currentStage === 0 ? 'STANDBY (CLICK EXECUTE)' : `STAGE ${currentStage}/8 INFERENCE`}
          </span>
        </div>

        {/* Camera Perspective Selector */}
        <div className="flex items-center gap-1 bg-[#0C0E12]/90 border border-white/10 p-0.5 rounded backdrop-blur-md pointer-events-auto text-[10px]">
          {(['PERSPECTIVE', 'TOP', 'ISOMETRIC'] as const).map((mode) => (
            <button
              key={mode}
              onClick={() => handleSetCamera(mode)}
              className={`px-2 py-1 rounded font-bold transition-all ${
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

      {/* Bottom Visual Legend */}
      <div className="absolute bottom-3 left-3 flex items-center gap-4 bg-[#0C0E12]/90 border border-white/10 px-3.5 py-1.5 rounded text-[10px] text-zinc-400 backdrop-blur-md pointer-events-auto font-mono">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded bg-[#FF5500]" />
          <span className="text-white font-bold">Bank Safe Vault</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded bg-[#38BDF8]" />
          <span className="text-white font-bold">Mobile UPI Mules</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded bg-zinc-300" />
          <span className="text-white font-bold">Bank Branch Counter</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded bg-[#F59E0B]" />
          <span className="text-amber-400 font-bold">ATM Cash-Out Kiosk</span>
        </div>
      </div>
    </div>
  );
};
