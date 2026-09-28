import React, { useEffect, useRef, useState, useMemo } from 'react';
import * as THREE from 'three';
import { CSS2DRenderer } from 'three/examples/jsm/renderers/CSS2DRenderer.js';
import {
  RotateCcw,
  Maximize2,
  Minimize2,
  Play,
  Pause,
  AlertTriangle,
  Eye,
  Info,
  Clock,
} from 'lucide-react';
import { IncidentDetail, LivePredictResponse } from '../../types';
import { GraphLegend } from '../three/GraphLegend';
import {
  NODE_COLORS,
  createNodeMesh,
  createNodeLabel,
  autoFitCamera,
  disposeScene,
  getNodeColor,
  NodeRole,
} from '../three/nodeVisuals';
import { formatINR } from '../../utils/formatINR';
import { RISK_THRESHOLDS } from '../incidents/incidentConstants';
import { ConfidenceBadge } from '../ui/ConfidenceBadge';

export interface SimNode3D {
  id: string;
  label: string;
  role: NodeRole;
  city: string;
  risk: number;
  amount: number;
  hopLevel: number;
  position: THREE.Vector3;
  colorHex: number;
  isSeed: boolean;
  isTerminal: boolean;
}

export interface SimEdge3D {
  source: string;
  target: string;
  amount: number;
  hopLevel: number;
  isTerminalPath: boolean;
  timestamp?: string | null;
  curve: THREE.QuadraticBezierCurve3;
  line: THREE.Line;
}

interface ThreeNetworkCanvasProps {
  currentStage?: number;
  seedEntityId: string;
  incidentDetail?: IncidentDetail | null;
  speed?: number;
  predictionResult?: LivePredictResponse | null;
  onSelectNode?: (node: SimNode3D | null) => void;
}

export const ThreeNetworkCanvas: React.FC<ThreeNetworkCanvasProps> = ({
  seedEntityId,
  incidentDetail,
  predictionResult,
  onSelectNode,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  // Camera & view mode
  const [cameraMode, setCameraMode] = useState<'PERSPECTIVE' | 'TOP' | 'ISOMETRIC'>('PERSPECTIVE');
  const [inspectedNode, setInspectedNode] = useState<SimNode3D | null>(null);

  // Temporal Scrubber state
  const [temporalScrubber, setTemporalScrubber] = useState<number>(72); // 0 to 72 hours
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [playSpeed, setPlaySpeed] = useState<number>(1);

  // Camera positioning refs
  const targetCamPosRef = useRef<THREE.Vector3>(new THREE.Vector3(0, 75, 140));
  const targetLookAtRef = useRef<THREE.Vector3>(new THREE.Vector3(0, 0, 0));
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);


  // Handle camera perspective changes
  const handleSetCamera = (mode: 'PERSPECTIVE' | 'TOP' | 'ISOMETRIC') => {
    setCameraMode(mode);
    if (mode === 'PERSPECTIVE') {
      targetCamPosRef.current.set(0, 75, 140);
      targetLookAtRef.current.set(0, 0, 0);
    } else if (mode === 'TOP') {
      targetCamPosRef.current.set(0, 160, 0.1);
      targetLookAtRef.current.set(0, 0, 0);
    } else if (mode === 'ISOMETRIC') {
      targetCamPosRef.current.set(95, 95, 95);
      targetLookAtRef.current.set(0, 0, 0);
    }
  };

  // Build Topology from Prediction / Incident Details
  const topologyData = useMemo(() => {
    const rawNodes = predictionResult?.subgraph_nodes;
    const rawEdges = predictionResult?.subgraph_edges;
    const hasRealSubgraph = Boolean(rawNodes && rawNodes.length > 0);

    if (hasRealSubgraph && rawNodes) {
      // 1. Calculate node volume from incident edges
      const nodeAmountMap = new Map<string, number>();
      (rawEdges || []).forEach((e) => {
        nodeAmountMap.set(e.source, (nodeAmountMap.get(e.source) || 0) + (e.amount || 0));
        nodeAmountMap.set(e.target, (nodeAmountMap.get(e.target) || 0) + (e.amount || 0));
      });

      // 2. Build SimNode3D array with radial layout by hop distance
      const nodes: SimNode3D[] = rawNodes.map((n, idx) => {
        const isSeed = Boolean(n.is_seed || n.id === seedEntityId);
        const isTerminal = Boolean(n.is_terminal || n.role === 'ATM');
        const role = (n.role as NodeRole) || (isTerminal ? 'ATM' : isSeed ? 'ACCOUNT' : 'ACCOUNT');
        const risk = typeof n.risk === 'number' ? n.risk : 0.2;
        const colorHex = getNodeColor(risk, role === 'VICTIM', isSeed ? predictionResult?.confidence_tier : undefined);

        const angle = (idx / rawNodes.length) * Math.PI * 2;
        const hop = n.hop_distance ?? (isSeed ? 0 : 1);
        const radius = isSeed ? 0 : 26 + hop * 20;
        const x = isSeed ? 0 : Math.cos(angle) * radius;
        const z = isSeed ? 0 : Math.sin(angle) * radius;
        const y = (idx % 2 === 0 ? 5 : -5) + (isTerminal ? -10 : 0);

        return {
          id: n.id,
          label: isSeed ? `SEED: ${n.id}` : isTerminal ? `EXIT: ${n.id} (${n.city || 'ATM'})` : `${n.id} (${role})`,
          role,
          city: n.city || 'Unknown',
          risk,
          amount: nodeAmountMap.get(n.id) || 0,
          hopLevel: hop,
          position: new THREE.Vector3(x, y, z),
          colorHex,
          isSeed,
          isTerminal,
        };
      });

      // 3. Build edge definitions
      const edgeDefs = (rawEdges || []).map((e) => ({
        source: e.source,
        target: e.target,
        amount: e.amount || 0,
        hopLevel: e.hop_level ?? 1,
        isTerminalPath: Boolean(e.is_cash_out || (e as any).is_terminal_path),
        timestamp: e.timestamp,
      }));

      // 4. Timing analysis
      const validTimestamps = edgeDefs
        .map((e) => (e.timestamp ? new Date(e.timestamp).getTime() : NaN))
        .filter((t) => !isNaN(t) && t > 0);
      const hasTimingData = validTimestamps.length > 0;
      const minTimestamp = hasTimingData ? Math.min(...validTimestamps) : 0;
      const maxTimestamp = hasTimingData ? Math.max(...validTimestamps) : 0;
      const totalHours = hasTimingData && maxTimestamp > minTimestamp
        ? Math.max(1, Math.ceil((maxTimestamp - minTimestamp) / 3600000))
        : 72;

      return {
        nodes,
        edgeDefs,
        isRealSubgraph: true,
        hasTimingData,
        minTimestamp,
        maxTimestamp,
        totalHours,
      };
    }

    // Fallback: Schematic topology
    const topTerminal = predictionResult?.terminals && predictionResult.terminals.length > 0 ? predictionResult.terminals[0] : null;
    const hasValidTerminal = Boolean(topTerminal && topTerminal.terminal_id && topTerminal.terminal_id !== 'NONE');
    const risk = predictionResult?.risk_probability ?? 0.0;
    const city = topTerminal?.city || 'Exit Terminal';
    const termId = topTerminal?.terminal_id || '';

    const nodes: SimNode3D[] = [
      {
        id: seedEntityId,
        label: `SEED: ${seedEntityId}`,
        role: 'ACCOUNT',
        city: 'Incident Origin',
        risk: risk,
        amount: 491668,
        hopLevel: 0,
        position: new THREE.Vector3(-45, 0, 0),
        colorHex: getNodeColor(risk, false, predictionResult?.confidence_tier),
        isSeed: true,
        isTerminal: false,
      },
      {
        id: 'CLEARING_HUB_01',
        label: 'Commercial Bank Clearing',
        role: 'CLEARING',
        city: 'Inter-Bank Core',
        risk: 0.35,
        amount: 491668,
        hopLevel: 1,
        position: new THREE.Vector3(-15, 6, -15),
        colorHex: getNodeColor(0.35, false),
        isSeed: false,
        isTerminal: false,
      },
      {
        id: 'MULE_LAYER_01',
        label: 'Transit Mule Account',
        role: 'ACCOUNT',
        city: 'Hub Layer',
        risk: risk * 0.95,
        amount: 320000,
        hopLevel: 2,
        position: new THREE.Vector3(15, -4, 10),
        colorHex: getNodeColor(risk * 0.95, false),
        isSeed: false,
        isTerminal: false,
      },
      {
        id: 'MULE_LAYER_02',
        label: 'Smurf Account Secondary',
        role: 'ACCOUNT',
        city: 'Transit Point',
        risk: risk * 0.75,
        amount: 171668,
        hopLevel: 2,
        position: new THREE.Vector3(12, 10, -22),
        colorHex: getNodeColor(risk * 0.75, false),
        isSeed: false,
        isTerminal: false,
      },
    ];

    const edgeDefs: { source: string; target: string; amount: number; hopLevel: number; isTerminalPath: boolean; timestamp?: string }[] = [
      { source: seedEntityId, target: 'CLEARING_HUB_01', amount: 491668, hopLevel: 1, isTerminalPath: true },
      { source: 'CLEARING_HUB_01', target: 'MULE_LAYER_01', amount: 320000, hopLevel: 2, isTerminalPath: true },
      { source: 'CLEARING_HUB_01', target: 'MULE_LAYER_02', amount: 171668, hopLevel: 2, isTerminalPath: false },
    ];

    if (hasValidTerminal && topTerminal) {
      nodes.push({
        id: termId,
        label: `EXIT: ${termId} (${city})`,
        role: 'ATM',
        city: city,
        risk: topTerminal.score ?? 0.85,
        amount: 300000,
        hopLevel: 3,
        position: new THREE.Vector3(50, 0, 0),
        colorHex: getNodeColor(topTerminal.score ?? 0.85, false),
        isSeed: false,
        isTerminal: true,
      });

      edgeDefs.push({
        source: 'MULE_LAYER_01',
        target: termId,
        amount: 300000,
        hopLevel: 3,
        isTerminalPath: true,
      });
    }

    return {
      nodes,
      edgeDefs,
      isRealSubgraph: false,
      hasTimingData: false,
      minTimestamp: 0,
      maxTimestamp: 0,
      totalHours: 72,
    };
  }, [seedEntityId, predictionResult]);
 
  // Playback timer with dynamic horizon
  useEffect(() => {
    if (!isPlaying) return;
    const maxH = topologyData.totalHours || 72;
    const interval = setInterval(() => {
      setTemporalScrubber((prev) => {
        if (prev >= maxH) return 0;
        return Math.min(maxH, prev + 2 * playSpeed);
      });
    }, 200);
    return () => clearInterval(interval);
  }, [isPlaying, playSpeed, topologyData.totalHours]);

  // 3D Three.js Graph Visualization
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const width = container.clientWidth || 800;
    const height = container.clientHeight || 460;
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // 1. Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(NODE_COLORS.BACKGROUND);
    scene.fog = new THREE.FogExp2(NODE_COLORS.BACKGROUND, 0.003);

    // 2. Camera
    const camera = new THREE.PerspectiveCamera(42, width / height, 0.1, 1500);
    camera.position.copy(targetCamPosRef.current);
    camera.lookAt(targetLookAtRef.current);
    cameraRef.current = camera;

    // 3. WebGL Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    container.appendChild(renderer.domElement);

    // 4. CSS2D Renderer for HTML Labels
    const labelRenderer = new CSS2DRenderer();
    labelRenderer.setSize(width, height);
    labelRenderer.domElement.style.position = 'absolute';
    labelRenderer.domElement.style.top = '0px';
    labelRenderer.domElement.style.left = '0px';
    labelRenderer.domElement.style.pointerEvents = 'none';
    labelRenderer.domElement.style.zIndex = '5';
    container.appendChild(labelRenderer.domElement);

    // 5. Lighting & Grid
    scene.add(new THREE.AmbientLight(0xffffff, 0.85));
    const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
    dirLight.position.set(30, 80, 50);
    scene.add(dirLight);

    const grid = new THREE.GridHelper(260, 36, NODE_COLORS.GRID_PRIMARY, NODE_COLORS.GRID_SECONDARY);
    grid.position.y = -30;
    (grid.material as THREE.Material).opacity = 0.25;
    (grid.material as THREE.Material).transparent = true;
    scene.add(grid);

    // 6. Node Mesh Placement
    const nodeObjMap = new Map<string, THREE.Group>();
    const nodeMap = new Map<string, SimNode3D>();

    topologyData.nodes.forEach((n) => {
      nodeMap.set(n.id, n);
      const group = createNodeMesh(n.role, n.isSeed, n.colorHex, n.role === 'ATM' ? 4.5 : 3.8);
      group.position.copy(n.position);

      if (n.isSeed) {
        const lbl = createNodeLabel(n.label, 'seed');
        group.add(lbl);
      } else if (n.isTerminal) {
        const lbl = createNodeLabel(n.label, 'terminal');
        group.add(lbl);
      }

      scene.add(group);
      nodeObjMap.set(n.id, group);
    });

    // 7. Edges & Curves
    const simEdges: SimEdge3D[] = [];
    const edgeCurves: { curve: THREE.QuadraticBezierCurve3; isTerminalPath: boolean; amount: number }[] = [];

    topologyData.edgeDefs.forEach((def) => {
      const srcNode = nodeMap.get(def.source);
      const tgtNode = nodeMap.get(def.target);
      if (!srcNode || !tgtNode) return;

      const mid = new THREE.Vector3().addVectors(srcNode.position, tgtNode.position).multiplyScalar(0.5);
      mid.y += Math.min(16, srcNode.position.distanceTo(tgtNode.position) * 0.22);

      const curve = new THREE.QuadraticBezierCurve3(srcNode.position, mid, tgtNode.position);
      const pts = curve.getPoints(24);
      const geom = new THREE.BufferGeometry().setFromPoints(pts);

      const lineMat = new THREE.LineBasicMaterial({
        color: def.isTerminalPath ? NODE_COLORS.EDGE_PREDICTED : NODE_COLORS.EDGE_DEFAULT,
        opacity: def.isTerminalPath ? 0.9 : 0.45,
        transparent: true,
      });

      const line = new THREE.Line(geom, lineMat);
      scene.add(line);

      simEdges.push({
        source: def.source,
        target: def.target,
        amount: def.amount,
        hopLevel: def.hopLevel,
        isTerminalPath: def.isTerminalPath,
        timestamp: def.timestamp,
        curve,
        line,
      });

      edgeCurves.push({ curve, isTerminalPath: def.isTerminalPath, amount: def.amount });
    });

    // Animated Comet Flow Particles
    const particleGeom = new THREE.SphereGeometry(0.8, 8, 8);
    const particles: { mesh: THREE.Mesh; curve: THREE.QuadraticBezierCurve3; progress: number; speed: number }[] = [];

    edgeCurves.forEach(({ curve, isTerminalPath, amount }) => {
      const pMat = new THREE.MeshBasicMaterial({
        color: isTerminalPath ? NODE_COLORS.EDGE_PREDICTED : 0x38bdf8,
      });
      const mesh = new THREE.Mesh(particleGeom, pMat);
      scene.add(mesh);
      particles.push({
        mesh,
        curve,
        progress: Math.random(),
        speed: 0.003 + Math.min(0.006, Math.log10(amount || 1000) * 0.001),
      });
    });

    // 8. Auto-fit Camera
    autoFitCamera(camera, topologyData.nodes.map((n) => n.position), new THREE.Vector3(0, 0, 0), 1.35);

    // 9. Raycasting for Clicking Nodes
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const handleClick = (ev: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      mouse.x = ((ev.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((ev.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(scene.children, true);

      if (intersects.length > 0) {
        let curr: THREE.Object3D | null = intersects[0].object;
        while (curr && curr !== scene) {
          for (const [id, grp] of nodeObjMap.entries()) {
            if (grp === curr) {
              const node = nodeMap.get(id);
              if (node) {
                setInspectedNode(node);
                onSelectNode?.(node);
              }
              return;
            }
          }
          curr = curr.parent;
        }
      }
    };
    container.addEventListener('click', handleClick);

    // 10. Temporal Visibility & Edge Scrubbing
    const updateTemporalFilter = (scrubHours: number) => {
      if (topologyData.hasTimingData && topologyData.maxTimestamp > topologyData.minTimestamp) {
        const span = topologyData.maxTimestamp - topologyData.minTimestamp;
        const cutoffTime = topologyData.minTimestamp + (scrubHours / (topologyData.totalHours || 72)) * span;
        const activeNodeIds = new Set<string>();

        simEdges.forEach((e) => {
          const edgeTime = e.timestamp ? new Date(e.timestamp).getTime() : NaN;
          const isVisible = isNaN(edgeTime) || edgeTime <= cutoffTime;
          e.line.visible = isVisible;
          if (isVisible) {
            activeNodeIds.add(e.source);
            activeNodeIds.add(e.target);
          }
        });

        topologyData.nodes.forEach((n) => {
          const grp = nodeObjMap.get(n.id);
          if (grp) {
            grp.visible = n.isSeed || activeNodeIds.has(n.id);
          }
        });
      } else {
        topologyData.nodes.forEach((n) => {
          const grp = nodeObjMap.get(n.id);
          if (grp) {
            const isVisible = scrubHours >= n.hopLevel * 24;
            grp.visible = isVisible;
          }
        });

        simEdges.forEach((e) => {
          const isVisible = scrubHours >= e.hopLevel * 24;
          e.line.visible = isVisible;
        });
      }
    };
    updateTemporalFilter(temporalScrubber);

    // 11. Animation Loop with Visibility and Intersection Handling
    let animId: number;
    let clock = new THREE.Clock();
    let isPaused = false;
    let isIntersecting = true;

    const onVisibilityChange = () => {
      isPaused = document.visibilityState === 'hidden';
    };
    document.addEventListener('visibilitychange', onVisibilityChange);

    const observer = new IntersectionObserver(([entry]) => {
      isIntersecting = entry.isIntersecting;
    });
    observer.observe(container);

    const animate = () => {
      animId = requestAnimationFrame(animate);
      if (isPaused || !isIntersecting) return;

      if (!prefersReducedMotion) {
        // Smooth camera lerp
        camera.position.lerp(targetCamPosRef.current, 0.06);
        camera.lookAt(targetLookAtRef.current);

        // Flow particle animation
        particles.forEach((p) => {
          p.progress += p.speed;
          if (p.progress >= 1) p.progress = 0;
          const pt = p.curve.getPoint(p.progress);
          p.mesh.position.copy(pt);
        });

        // Gentle node rotation
        nodeObjMap.forEach((grp) => {
          grp.rotation.y += 0.008;
        });
      } else {
        // Reduced motion: instant camera positioning, no particle flow, no rotation
        camera.position.copy(targetCamPosRef.current);
        camera.lookAt(targetLookAtRef.current);
      }

      renderer.render(scene, camera);
      labelRenderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
      labelRenderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animId);
      document.removeEventListener('visibilitychange', onVisibilityChange);
      observer.disconnect();
      container.removeEventListener('click', handleClick);
      window.removeEventListener('resize', handleResize);

      disposeScene(scene);
      try {
        renderer.forceContextLoss();
      } catch {}
      renderer.dispose();

      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      if (container.contains(labelRenderer.domElement)) {
        container.removeChild(labelRenderer.domElement);
      }
    };
  }, [topologyData, temporalScrubber]);

  return (
    <div className="relative w-full h-full min-h-[460px] bg-[#040609] border border-slate-800 rounded-xl overflow-hidden select-none font-sans">
      <div ref={containerRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

      {/* Top Overlay Controls Bar */}
      <div className="absolute top-2.5 left-2.5 right-2.5 z-20 flex items-center justify-between pointer-events-none text-xs">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 bg-slate-950/80 backdrop-blur border border-slate-800 px-3 py-1.5 rounded-lg pointer-events-auto shadow-md">
            <span className="w-2 h-2 rounded-full bg-[#FF5500] animate-pulse" />
            <span className="text-slate-200 font-bold text-[11px] font-mono">
              SEED: <span className="text-[#FF5500]">{seedEntityId}</span>
            </span>
          </div>

          {topologyData.isRealSubgraph ? (
            <span className="px-2.5 py-1.5 rounded-lg bg-slate-950/80 backdrop-blur border border-slate-800 text-slate-300 font-mono text-[11px] pointer-events-auto shadow-md">
              Showing {topologyData.nodes.length} nodes · {topologyData.edgeDefs.length} edges (Real Subgraph)
            </span>
          ) : (
            <span className="px-2.5 py-1.5 rounded-lg bg-amber-950/80 backdrop-blur border border-amber-600/70 text-amber-300 font-mono text-[11px] pointer-events-auto shadow-md flex items-center gap-1.5">
              <AlertTriangle className="w-3 h-3 text-amber-400" />
              Schematic view — not the actual subgraph
            </span>
          )}
        </div>

        {/* Camera Perspective Segmented Control */}
        <div className="flex items-center gap-1.5 bg-slate-950/80 backdrop-blur border border-slate-800 p-1 rounded-lg pointer-events-auto text-[10px] shadow-md">
          {(['PERSPECTIVE', 'TOP', 'ISOMETRIC'] as const).map((mode) => (
            <button
              key={mode}
              onClick={() => handleSetCamera(mode)}
              className={`px-2.5 py-1 rounded font-bold transition-all ${
                cameraMode === mode
                  ? 'bg-[#FF5500] text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {mode}
            </button>
          ))}

          <button
            onClick={() => handleSetCamera('PERSPECTIVE')}
            className="p-1 text-slate-400 hover:text-white transition-colors"
            title="Reset Camera"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Low Information State Overlay */}
      {(predictionResult?.low_information || predictionResult?.subgraph_empty) && (
        <div className="absolute top-14 left-3 right-3 z-30 bg-amber-950/90 border border-amber-600/70 text-amber-200 p-3 rounded-lg backdrop-blur shadow-xl flex items-start gap-2.5 font-sans">
          <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <div className="text-xs font-bold text-amber-300 uppercase tracking-wide">
              LOW INFORMATION ENTITY SUBGRAPH
            </div>
            <p className="text-[11px] text-amber-200/90">
              {predictionResult?.status_reason || 'Insufficient edge data in surveillance window.'}
            </p>
          </div>
        </div>
      )}

      {/* Floating Temporal Scrubber */}
      <div className="absolute bottom-3 left-1/2 transform -translate-x-1/2 w-[480px] max-w-[92%] bg-slate-950/90 backdrop-blur-md border border-slate-800 p-3 rounded-xl pointer-events-auto font-sans shadow-2xl flex flex-col gap-2 z-20">
        <div className="flex items-center justify-between text-[10px] font-bold text-slate-400">
          <div className="flex items-center gap-2">
            <button
              disabled={!topologyData.hasTimingData}
              onClick={() => setIsPlaying(!isPlaying)}
              className="p-1.5 bg-[#FF5500] disabled:bg-slate-800 disabled:text-slate-600 hover:bg-[#FF5500]/90 text-white rounded-lg transition-colors flex items-center justify-center disabled:cursor-not-allowed"
              title={
                topologyData.hasTimingData
                  ? (isPlaying ? 'Pause Simulation' : 'Play Forward Simulation')
                  : 'No timing data available'
              }
            >
              {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            </button>
            <span className="text-slate-200 font-mono">
              {topologyData.hasTimingData
                ? `T+${temporalScrubber}h FORWARD PROPAGATION`
                : 'NO TIMING DATA AVAILABLE'}
            </span>
          </div>

          {/* Speed Presets */}
          <div className="flex items-center gap-1 font-mono">
            {([1, 2, 5] as const).map((spd) => (
              <button
                key={spd}
                disabled={!topologyData.hasTimingData}
                onClick={() => setPlaySpeed(spd)}
                className={`px-1.5 py-0.5 rounded text-[9px] font-bold transition-colors disabled:opacity-30 disabled:cursor-not-allowed ${
                  playSpeed === spd ? 'bg-[#FF5500] text-white' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {spd}x
              </button>
            ))}
          </div>
        </div>

        {/* Scrubber Range Slider */}
        <input
          type="range"
          min="0"
          max={topologyData.totalHours || 72}
          step="1"
          disabled={!topologyData.hasTimingData}
          value={topologyData.hasTimingData ? temporalScrubber : 0}
          onChange={(e) => {
            setIsPlaying(false);
            setTemporalScrubber(Number(e.target.value));
          }}
          className="w-full accent-[#FF5500] h-1.5 bg-slate-800 rounded-full appearance-none disabled:opacity-40 disabled:cursor-not-allowed cursor-ew-resize"
        />

        {topologyData.hasTimingData ? (
          <div className="flex justify-between text-[9px] font-mono text-slate-500">
            <span>T0: Incident Window Start</span>
            <span>T+{Math.round((topologyData.totalHours || 72) / 2)}h</span>
            <span>T+{topologyData.totalHours || 72}h: Window End</span>
          </div>
        ) : (
          <div className="text-[9px] font-mono text-amber-400">
            Live inference endpoint returns topological summary without per-edge timestamps. Temporal scrubber disabled.
          </div>
        )}
      </div>

      {/* Floating Node Inspector Modal */}
      {inspectedNode && (
        <div className="absolute top-14 right-3 w-64 bg-slate-900/95 border border-slate-700 rounded-xl p-3 shadow-2xl text-[10px] space-y-2 pointer-events-auto z-30 animate-in fade-in">
          <div className="flex items-center justify-between border-b border-slate-700 pb-1.5">
            <span className="text-[#FF5500] font-bold uppercase tracking-wider flex items-center gap-1">
              <Eye className="w-3 h-3" />
              <span>NODE INSPECTOR</span>
            </span>
            <button
              onClick={() => setInspectedNode(null)}
              className="text-slate-400 hover:text-white font-bold p-0.5"
            >
              ✕
            </button>
          </div>

          <div className="space-y-1 text-slate-300">
            <div className="font-bold text-white text-xs truncate font-mono">{inspectedNode.id}</div>
            <div className="flex justify-between text-slate-400">
              <span>Role:</span>
              <span className="text-slate-200 font-bold">{inspectedNode.role}</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Location:</span>
              <span className="text-slate-200">{inspectedNode.city}</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Transacted Volume:</span>
              <span className="text-emerald-400 font-bold font-mono">{formatINR(inspectedNode.amount)}</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Hop Distance:</span>
              <span className="text-slate-200 font-bold font-mono">Hop {inspectedNode.hopLevel}</span>
            </div>
            <div className="flex justify-between items-center text-slate-400 pt-1 border-t border-slate-800">
              <span>Risk Tier:</span>
              <ConfidenceBadge
                tier={
                  inspectedNode.risk >= RISK_THRESHOLDS.CRITICAL
                    ? 'HIGH_CONFIDENCE'
                    : inspectedNode.risk >= RISK_THRESHOLDS.SUSPICIOUS
                    ? 'MEDIUM_CONFIDENCE'
                    : 'NORMAL'
                }
                size="sm"
              />
            </div>
          </div>
        </div>
      )}

      {/* Bottom-Left Persistent Collapsible Legend */}
      <GraphLegend className="absolute bottom-3 left-3" />
    </div>
  );
};
