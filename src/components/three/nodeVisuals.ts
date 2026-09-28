import * as THREE from 'three';
import { CSS2DObject } from 'three/examples/jsm/renderers/CSS2DRenderer.js';
import { RISK_THRESHOLDS } from '../incidents/incidentConstants';

// ── Shared 3D Color Vocabulary (Hex Literals) ──
export const NODE_COLORS = {
  CRITICAL: 0xef4444, // Red (>= 70%) - strictly alert
  SUSPICIOUS: 0xf59e0b, // Amber (40% - 70%)
  NORMAL: 0x10b981, // Emerald (< 40%)
  VICTIM: 0x38bdf8, // Sky-blue (Victim / complaint origin)
  SEED_RING: 0xff5500, // Brand Orange (ONLY for outer seed indicator ring)
  SEED: 0xff5500, // Backward-compat alias for SEED_RING
  EDGE_DEFAULT: 0x475569, // Slate default flow
  EDGE_PREDICTED: 0xff5500, // Brand Orange Exit Path
  GRID_PRIMARY: 0x334155,
  GRID_SECONDARY: 0x1e293b,
  BACKGROUND: 0x040609,
} as const;

export type NodeRole = 'ACCOUNT' | 'ATM' | 'CLEARING' | 'VICTIM';

/**
 * Returns Three.js numeric hex color based on risk score, role, and optional backend tier.
 * Brand orange is reserved for the seed ring and predicted exit path.
 * If backendTier is provided, it acts as the authoritative single source of truth.
 * Normal = Emerald, Suspicious = Amber, Critical = Red, Victim = Sky-blue.
 */
export function getNodeColor(
  risk: number,
  isVictim: boolean = false,
  backendTier?: string | null
): number {
  if (isVictim) return NODE_COLORS.VICTIM;

  // Single source of truth: backend confidence tier if provided
  if (backendTier) {
    const upper = backendTier.toUpperCase();
    if (upper === 'HIGH_CONFIDENCE' || upper === 'CRITICAL') return NODE_COLORS.CRITICAL;
    if (upper === 'MEDIUM_CONFIDENCE' || upper === 'SUSPICIOUS') return NODE_COLORS.SUSPICIOUS;
    if (upper === 'NORMAL' || upper === 'CLEARED') return NODE_COLORS.NORMAL;
  }

  if (risk >= RISK_THRESHOLDS.CRITICAL) return NODE_COLORS.CRITICAL;
  if (risk >= RISK_THRESHOLDS.SUSPICIOUS) return NODE_COLORS.SUSPICIOUS;
  return NODE_COLORS.NORMAL;
}

/**
 * Single source of truth for 3D Node Mesh generation:
 * - Sphere: Account Node
 * - Cube: ATM Terminal
 * - Cylinder: Bank Clearing Node
 * - Sky-blue Sphere: Victim / Complaint Origin
 * - Orange Ring (Torus): Seed Suspect Entity indicator
 */
export function createNodeMesh(
  role: NodeRole,
  isSeed: boolean,
  colorHex: number,
  size: number = 4
): THREE.Group {
  const group = new THREE.Group();

  let geometry: THREE.BufferGeometry;
  if (role === 'ATM') {
    // Cube: ATM Terminal
    geometry = new THREE.BoxGeometry(size * 1.4, size * 1.4, size * 1.4);
  } else if (role === 'CLEARING') {
    // Cylinder: Bank Clearing Node
    geometry = new THREE.CylinderGeometry(size * 0.9, size * 0.9, size * 1.8, 16);
  } else {
    // Sphere: Account Node or Victim Node
    geometry = new THREE.SphereGeometry(size, 20, 20);
  }

  const material = new THREE.MeshStandardMaterial({
    color: colorHex,
    roughness: 0.35,
    metalness: 0.4,
    emissive: colorHex,
    emissiveIntensity: 0.25,
  });

  const mainMesh = new THREE.Mesh(geometry, material);
  mainMesh.name = 'node-body';
  group.add(mainMesh);

  // If Seed Entity: Add brand-orange outer ring (brand orange ONLY for ring)
  if (isSeed) {
    const ringGeo = new THREE.TorusGeometry(size * 1.65, size * 0.12, 8, 32);
    const ringMat = new THREE.MeshBasicMaterial({
      color: NODE_COLORS.SEED_RING,
      transparent: true,
      opacity: 0.85,
    });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.rotation.x = Math.PI / 2;
    ring.name = 'seed-ring';
    group.add(ring);
  }

  // Hover indicator ring (initially invisible)
  const hoverGeo = new THREE.TorusGeometry(size * 1.45, size * 0.08, 8, 24);
  const hoverMat = new THREE.MeshBasicMaterial({
    color: 0xffffff,
    transparent: true,
    opacity: 0,
  });
  const hoverRing = new THREE.Mesh(hoverGeo, hoverMat);
  hoverRing.rotation.x = Math.PI / 2;
  hoverRing.name = 'hover-ring';
  group.add(hoverRing);

  return group;
}

/**
 * Creates CSS2D DOM label for Seed, Terminal, or Selected/Hovered node.
 */
export function createNodeLabel(
  label: string,
  variant: 'seed' | 'terminal' | 'hover' | 'selected' = 'hover'
): CSS2DObject {
  const div = document.createElement('div');
  div.className = `px-2 py-0.5 rounded text-[10px] font-mono font-bold select-none pointer-events-none transition-opacity ${
    variant === 'seed'
      ? 'bg-[#FF5500] text-white border border-white/20 shadow-md'
      : variant === 'terminal'
      ? 'bg-amber-500 text-slate-950 border border-amber-300 shadow-md'
      : variant === 'selected'
      ? 'bg-white text-slate-900 border border-slate-300 shadow-md'
      : 'bg-slate-900/90 text-slate-200 border border-slate-700'
  }`;
  div.textContent = label;
  div.style.marginTop = '-26px';

  const obj = new CSS2DObject(div);
  obj.name = 'css2d-label';
  return obj;
}

/**
 * Computes graph bounding box and auto-fits camera so no node is cut off.
 */
export function autoFitCamera(
  camera: THREE.PerspectiveCamera,
  nodes: { x: number; y: number; z?: number }[],
  target: THREE.Vector3 = new THREE.Vector3(0, 0, 0),
  paddingFactor: number = 1.35
): void {
  if (nodes.length === 0) return;

  const box = new THREE.Box3();
  nodes.forEach((n) => {
    box.expandByPoint(new THREE.Vector3(n.x, n.y, n.z || 0));
  });

  const size = new THREE.Vector3();
  box.getSize(size);
  const center = new THREE.Vector3();
  box.getCenter(center);

  const fovY = camera.fov * (Math.PI / 180);
  const fovX = 2 * Math.atan(Math.tan(fovY / 2) * camera.aspect);
  const distY = (size.y / 2) / Math.tan(fovY / 2);
  const distX = (size.x / 2) / Math.tan(fovX / 2);
  const distZ = (size.z / 2) / Math.tan(fovY / 2);
  let cameraDistance = Math.max(distY, distX, distZ, 40) * paddingFactor;
  cameraDistance = Math.max(cameraDistance, 60);

  camera.position.set(center.x, center.y + cameraDistance * 0.35, center.z + cameraDistance);
  camera.lookAt(target.copy(center));
  camera.updateProjectionMatrix();
}

/**
 * Disposes geometries, materials, and textures recursively.
 */
export function disposeScene(scene: THREE.Scene): void {
  scene.traverse((obj) => {
    if (obj instanceof THREE.Mesh || obj instanceof THREE.Line) {
      if (obj.geometry) {
        obj.geometry.dispose();
      }
      if (obj.material) {
        if (Array.isArray(obj.material)) {
          obj.material.forEach((m) => m.dispose());
        } else {
          obj.material.dispose();
        }
      }
    }
  });
}
