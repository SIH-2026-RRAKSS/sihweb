import React, { useEffect, useRef, useState, useMemo } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { CSS2DRenderer, CSS2DObject } from 'three/examples/jsm/renderers/CSS2DRenderer.js';
import {
  RotateCcw,
  Maximize2,
  Minimize2,
  ShieldAlert,
  Zap,
  Eye,
  EyeOff,
  Play,
  Pause,
  Copy,
  Check,
  AlertTriangle,
  Lock,
  ArrowRight,
  Share2,
} from 'lucide-react';
import { ConfidenceBadge } from '../ui/ConfidenceBadge';
import { ApiService } from '../../services/api';
import { IncidentSummary, GraphStructure, GraphNode } from '../../types';
import { useAsyncState, AsyncStatus } from '../../hooks/useAsyncState';
import { LottieLoader } from '../ui/LottieLoader';
import { EmptyState } from '../ui/EmptyState';
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
import { RISK_THRESHOLDS, getTierFromScore, getRiskStyle, getTierLabel } from '../incidents/incidentConstants';

export const NetworkExplorer: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const viewportWrapperRef = useRef<HTMLDivElement>(null);

  const [incidents, setIncidents] = useState<IncidentSummary[]>([]);
  const [selectedIncidentId, setSelectedIncidentId] = useState<string | null>(null);
  const [graphData, setGraphData] = useState<GraphStructure | null>(null);
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);
  const [isHistoricalExpanded, setIsHistoricalExpanded] = useState<boolean>(false);

  // Viewport HUD controls state
  const [showLabels, setShowLabels] = useState<boolean>(true);
  const [isAnimationActive, setIsAnimationActive] = useState<boolean>(true);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [copiedId, setCopiedId] = useState<boolean>(false);

  const { status: incidentsStatus, error: incidentsError, isOffline: isIncidentsOffline, run: runIncidents, retry: retryIncidents } = useAsyncState<void>();
  const { status: graphStatus, error: graphError, isOffline: isGraphOffline, run: runGraph, retry: retryGraph } = useAsyncState<void>();

  // Fetch Incident options
  useEffect(() => {
    runIncidents(async () => {
      const res = await ApiService.getIncidents({ page: 1, page_size: 50 });
      setIncidents(res.items || []);
      if (res.items && res.items.length > 0) {
        setSelectedIncidentId(res.items[0].complaint_id);
      }
    });
  }, []);

  // Fetch Graph data for selected incident
  useEffect(() => {
    if (!selectedIncidentId) return;
    runGraph(async () => {
      const data = await ApiService.getIncidentGraph(selectedIncidentId, isHistoricalExpanded);
      setGraphData(data);
      if (data.nodes.length > 0) {
        const seedOrFirst = data.nodes.find((n) => n.is_incident) || data.nodes[0];
        setSelectedNode(seedOrFirst);
      } else {
        setSelectedNode(null);
      }
    });
  }, [selectedIncidentId, isHistoricalExpanded]);

  // Max hops computed from nodes
  const maxHops = useMemo(() => {
    if (!graphData || graphData.nodes.length === 0) return 0;
    return Math.max(...graphData.nodes.map((n) => n.hop_distance || 0), 1);
  }, [graphData]);

  // Cap rendered nodes and edges for high-performance WebGL rendering
  const MAX_RENDER_NODES = 80;
  const MAX_RENDER_EDGES = 120;

  const { displayNodes, displayEdges, isCapped } = useMemo(() => {
    if (!graphData) return { displayNodes: [], displayEdges: [], isCapped: false };
    const nodes = graphData.nodes.slice(0, MAX_RENDER_NODES);
    const validIds = new Set(nodes.map((n) => n.id));
    const edges = graphData.edges
      .filter((e) => validIds.has(e.source) && validIds.has(e.target))
      .slice(0, MAX_RENDER_EDGES);
    const capped = graphData.nodes.length > MAX_RENDER_NODES || graphData.edges.length > MAX_RENDER_EDGES;
    return { displayNodes: nodes, displayEdges: edges, isCapped: capped };
  }, [graphData]);

  // Fullscreen Handler
  const toggleFullscreen = () => {
    const el = viewportWrapperRef.current;
    if (!el) return;
    if (!document.fullscreenElement) {
      el.requestFullscreen?.().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen?.().catch(() => {});
      setIsFullscreen(false);
    }
  };

  useEffect(() => {
    const handleFsChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFsChange);
    return () => document.removeEventListener('fullscreenchange', handleFsChange);
  }, []);

  // Reset Camera Callback reference
  const resetCameraRef = useRef<(() => void) | null>(null);

  // 3D Three.js Graph Visualization
  useEffect(() => {
    const container = containerRef.current;
    if (!container || !graphData || displayNodes.length === 0) return;

    const width = container.clientWidth || 800;
    const height = container.clientHeight || 500;

    // Respect prefers-reduced-motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // 1. Scene & Environment
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(NODE_COLORS.BACKGROUND);
    scene.fog = new THREE.FogExp2(NODE_COLORS.BACKGROUND, 0.0035);

    // 2. Camera Setup
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1500);

    // 3. WebGL Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.domElement.style.outline = 'none';
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

    // 5. OrbitControls with Damping (disabled if reduced motion)
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = !prefersReducedMotion;
    controls.dampingFactor = 0.05;
    controls.maxDistance = 600;
    controls.minDistance = 20;

    // 6. Ambient & Directional Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.85);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 0.9);
    dirLight.position.set(40, 80, 60);
    scene.add(dirLight);

    // 7. Dim Grid Floor
    const grid = new THREE.GridHelper(300, 40, NODE_COLORS.GRID_PRIMARY, NODE_COLORS.GRID_SECONDARY);
    grid.position.y = -35;
    (grid.material as THREE.Material).opacity = 0.25;
    (grid.material as THREE.Material).transparent = true;
    scene.add(grid);

    // 8. Node Placement & Mesh Construction
    const nodeObjMap = new Map<string, THREE.Group>();
    const nodePositions = new Map<string, THREE.Vector3>();
    const nodeDataMap = new Map<string, GraphNode>();
    const labelObjects: CSS2DObject[] = [];

    // Layout nodes radially by hop distance
    displayNodes.forEach((n, idx) => {
      nodeDataMap.set(n.id, n);

      let role: NodeRole = 'ACCOUNT';
      if (n.is_incident) {
        role = 'VICTIM';
      } else if (n.is_terminal || n.node_type === 'ATM') {
        role = 'ATM';
      } else if (n.node_type === 'ROOT') {
        role = 'CLEARING';
      }

      const isSeed = n.is_incident || idx === 0;
      const colorHex = getNodeColor(n.node_mule_score ?? (n.is_terminal ? 0.75 : 0.2), n.is_incident);

      const group = createNodeMesh(role, isSeed, colorHex, role === 'ATM' ? 4.5 : 3.8);

      const angle = (idx / displayNodes.length) * Math.PI * 2;
      const radius = n.is_incident ? 0 : 28 + n.hop_distance * 18;
      const x = n.is_incident ? 0 : Math.cos(angle) * radius;
      const z = n.is_incident ? 0 : Math.sin(angle) * radius;
      const y = (idx % 2 === 0 ? 6 : -6) + (n.is_terminal ? -10 : 0);

      const pos = new THREE.Vector3(x, y, z);
      group.position.copy(pos);
      nodePositions.set(n.id, pos);

      // Add CSS2D label for seed or terminal
      if (isSeed) {
        const lbl = createNodeLabel(`SEED: ${n.id}`, 'seed');
        group.add(lbl);
        labelObjects.push(lbl);
      } else if (n.is_terminal) {
        const lbl = createNodeLabel(n.city ? `EXIT: ${n.id} (${n.city})` : `EXIT: ${n.id}`, 'terminal');
        group.add(lbl);
        labelObjects.push(lbl);
      }

      scene.add(group);
      nodeObjMap.set(n.id, group);
    });

    // 9. Edges with 3D Arcs and Flow Particles
    const edgeCurves: { curve: THREE.QuadraticBezierCurve3; isPredictedPath: boolean; amount: number }[] = [];

    displayEdges.forEach((e) => {
      const srcPos = nodePositions.get(e.source);
      const tgtPos = nodePositions.get(e.target);
      if (!srcPos || !tgtPos) return;

      const mid = new THREE.Vector3().addVectors(srcPos, tgtPos).multiplyScalar(0.5);
      mid.y += Math.min(18, srcPos.distanceTo(tgtPos) * 0.25);

      const curve = new THREE.QuadraticBezierCurve3(srcPos, mid, tgtPos);
      const isPredictedPath = Boolean(e.is_cash_out);
      edgeCurves.push({ curve, isPredictedPath, amount: e.amount || 1000 });

      const pts = curve.getPoints(24);
      const geom = new THREE.BufferGeometry().setFromPoints(pts);

      const lineMat = new THREE.LineBasicMaterial({
        color: isPredictedPath ? NODE_COLORS.EDGE_PREDICTED : NODE_COLORS.EDGE_DEFAULT,
        opacity: isPredictedPath ? 0.9 : 0.45,
        transparent: true,
      });

      scene.add(new THREE.Line(geom, lineMat));
    });

    // Animated Comet Flow Particles
    const particleGeom = new THREE.SphereGeometry(0.85, 8, 8);
    const particles: { mesh: THREE.Mesh; curve: THREE.QuadraticBezierCurve3; progress: number; speed: number }[] = [];

    edgeCurves.forEach(({ curve, isPredictedPath, amount }) => {
      const pMat = new THREE.MeshBasicMaterial({
        color: isPredictedPath ? NODE_COLORS.EDGE_PREDICTED : 0x38bdf8,
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

    // 10. Camera Auto-Fit & Controls
    const nodeCoords = Array.from(nodePositions.values());
    const fitCam = () => {
      autoFitCamera(camera, nodeCoords, new THREE.Vector3(0, 0, 0), 1.4);
      controls.target.set(0, 0, 0);
      controls.update();
    };
    fitCam();
    resetCameraRef.current = fitCam;

    // 11. Raycasting for Selection & Hover
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const handlePointerMove = (ev: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      mouse.x = ((ev.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((ev.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(scene.children, true);

      let foundId: string | null = null;
      if (intersects.length > 0) {
        let curr: THREE.Object3D | null = intersects[0].object;
        while (curr && curr !== scene) {
          for (const [id, grp] of nodeObjMap.entries()) {
            if (grp === curr) {
              foundId = id;
              break;
            }
          }
          if (foundId) break;
          curr = curr.parent;
        }
      }

      setHoveredNodeId(foundId);

      // Update hover rings
      nodeObjMap.forEach((grp, id) => {
        const ring = grp.getObjectByName('hover-ring') as THREE.Mesh | undefined;
        if (ring && ring.material) {
          const mat = ring.material as THREE.MeshBasicMaterial;
          mat.opacity = id === foundId || id === selectedNode?.id ? 0.9 : 0;
        }
      });
    };

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
              const node = nodeDataMap.get(id);
              if (node) setSelectedNode(node);
              return;
            }
          }
          curr = curr.parent;
        }
      }
    };

    container.addEventListener('mousemove', handlePointerMove);
    container.addEventListener('click', handleClick);

    // 12. Render Loop with Visibility and Intersection Handling
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

      controls.update();

      // Flow Animation (if enabled and motion not reduced)
      if (isAnimationActive && !prefersReducedMotion) {
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
      }

      // Update Label visibility
      labelObjects.forEach((lbl) => {
        lbl.element.style.display = showLabels ? 'block' : 'none';
      });

      renderer.render(scene, camera);
      labelRenderer.render(scene, camera);
    };

    animate();

    // 13. Resize Handler
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

    // Cleanup
    return () => {
      cancelAnimationFrame(animId);
      document.removeEventListener('visibilitychange', onVisibilityChange);
      observer.disconnect();
      container.removeEventListener('mousemove', handlePointerMove);
      container.removeEventListener('click', handleClick);
      window.removeEventListener('resize', handleResize);

      controls.dispose();
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
  }, [displayNodes, displayEdges, showLabels, isAnimationActive, selectedNode?.id]);

  // Copy Entity ID Helper
  const handleCopyId = (id: string) => {
    navigator.clipboard.writeText(id);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2000);
  };

  return (
    <div className="space-y-3 font-sans text-xs">
      {/* ── 1. HEADER CARD ── */}
      <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-sm flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-[#FF5500]/10 border border-[#FF5500]/30 rounded-lg text-[#FF5500]">
            <Share2 className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-sm font-bold text-slate-900 tracking-wide font-sans">
                3D NETWORK EXPLORER
              </h1>
              <span className="text-[10px] font-mono bg-slate-100 text-slate-700 px-2 py-0.5 rounded border border-slate-200 font-bold">
                TOPOLOGICAL VIEW
              </span>
            </div>
            <p className="text-[11px] text-slate-500">
              Interactive WebGL Force-Directed Graph Analysis for Disputed Fund Corridors
            </p>
          </div>
        </div>

        {/* Controls on Header */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Incident Selector */}
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] font-bold text-slate-500 uppercase">Incident:</span>
            <select
              value={selectedIncidentId || ''}
              onChange={(e) => setSelectedIncidentId(e.target.value)}
              className="bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1 text-xs font-mono font-medium text-slate-800 focus:outline-none focus:border-[#FF5500]"
            >
              {incidents.map((inc) => (
                <option key={inc.complaint_id} value={inc.complaint_id}>
                  {inc.complaint_id} — {inc.scam_category || 'Fraud'} (₹{(inc.reported_amount || 0).toLocaleString('en-IN')})
                </option>
              ))}
            </select>
          </div>

          {/* Compact Stat Chips */}
          <div className="hidden sm:flex items-center gap-1.5 bg-slate-50 border border-slate-200 px-2.5 py-1 rounded-lg font-mono text-[11px] text-slate-700 font-bold">
            <span className="text-[#FF5500]">{graphData?.num_nodes || 0}</span> nodes
            <span className="text-slate-400">|</span>
            <span className="text-[#FF5500]">{graphData?.num_edges || 0}</span> edges
            <span className="text-slate-400">|</span>
            <span className="text-slate-900">{maxHops}</span> hops
          </div>

          {/* Historical Window Toggle */}
          <button
            onClick={() => setIsHistoricalExpanded(!isHistoricalExpanded)}
            className={`px-3 py-1 rounded-lg border text-xs font-bold transition-all flex items-center gap-1.5 ${
              isHistoricalExpanded
                ? 'bg-blue-50 border-blue-300 text-blue-700 shadow-sm'
                : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-50'
            }`}
          >
            {isHistoricalExpanded ? (
              <>
                <Zap className="w-3.5 h-3.5 text-blue-600" />
                <span>EXPANDED LIFETIME ({graphData?.lifetime_tx_count || 0} TXS)</span>
              </>
            ) : (
              <span>±72H SURVEILLANCE WINDOW</span>
            )}
          </button>
        </div>
      </div>

      {/* ── 2. MAIN BODY (VIEWPORT + TELEMETRY) ── */}
      <div className="flex flex-col lg:flex-row gap-3 min-h-[520px]">
        {/* Left / Center Viewport Container */}
        <div
          ref={viewportWrapperRef}
          className="flex-1 relative bg-[#040609] border border-slate-800 rounded-xl overflow-hidden shadow-inner flex flex-col min-h-[460px]"
        >
          {/* Viewport Top HUD Bar */}
          <div className="absolute top-2.5 left-2.5 right-2.5 z-20 flex items-center justify-between pointer-events-none text-xs">
            <div className="flex items-center gap-2 pointer-events-auto">
              <div className="bg-slate-950/80 backdrop-blur border border-slate-800 px-3 py-1 rounded-lg text-[10px] text-slate-300 font-mono flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>Three.js • WebGL 2.0</span>
              </div>
              {graphData && (
                <div className="bg-slate-950/80 backdrop-blur border border-slate-800 px-3 py-1 rounded-lg text-[10px] text-slate-300 font-mono">
                  Showing {displayNodes.length} of {graphData.nodes.length} nodes · {displayEdges.length} of {graphData.edges.length} edges
                  {isCapped && ' (capped)'}
                </div>
              )}
            </div>

            {/* Top-Right Viewport Action Toolbar */}
            <div className="flex items-center gap-1.5 bg-slate-950/80 backdrop-blur border border-slate-800 p-1 rounded-lg pointer-events-auto shadow-md">
              <button
                onClick={() => resetCameraRef.current?.()}
                className="px-2 py-1 rounded text-slate-300 hover:text-white hover:bg-slate-800 text-[10px] font-bold flex items-center gap-1 transition-colors"
                title="Reset Camera Position"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset</span>
              </button>

              <button
                onClick={() => setShowLabels(!showLabels)}
                className={`px-2 py-1 rounded text-[10px] font-bold flex items-center gap-1 transition-colors ${
                  showLabels ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-slate-200'
                }`}
                title="Toggle Node Labels"
              >
                {showLabels ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                <span>Labels</span>
              </button>

              <button
                onClick={() => setIsAnimationActive(!isAnimationActive)}
                className={`px-2 py-1 rounded text-[10px] font-bold flex items-center gap-1 transition-colors ${
                  isAnimationActive ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-slate-200'
                }`}
                title="Toggle Flow Animation"
              >
                {isAnimationActive ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                <span>Flow</span>
              </button>

              <button
                onClick={toggleFullscreen}
                className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                title="Fullscreen Toggle"
              >
                {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          {/* Loading Overlay */}
          {graphStatus === AsyncStatus.LOADING && (
            <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-slate-950/70 backdrop-blur-sm space-y-2">
              <LottieLoader status={graphStatus} />
              <span className="text-xs font-mono font-bold text-slate-300">Loading network topology...</span>
            </div>
          )}

          {/* Error Overlay */}
          {graphStatus === AsyncStatus.ERROR && (
            <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-slate-950/85 backdrop-blur-sm p-6 text-center space-y-3">
              <AlertTriangle className="w-8 h-8 text-red-500" />
              <div className="text-sm font-bold text-white">
                {isGraphOffline ? 'FastAPI Backend Offline' : 'Failed to Load Graph Data'}
              </div>
              <p className="text-xs text-slate-400 max-w-sm">
                {graphError || 'The network topology for this incident could not be retrieved from the backend.'}
              </p>
              <button
                onClick={retryGraph}
                className="px-3 py-1.5 bg-red-600 hover:bg-red-500 text-white rounded font-bold text-xs transition-colors"
              >
                Retry
              </button>
            </div>
          )}

          {/* Empty State Overlay */}
          {graphStatus !== AsyncStatus.LOADING && graphStatus !== AsyncStatus.ERROR && (!graphData || graphData.nodes.length === 0) && (
            <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-slate-950/80 p-6 text-center space-y-2">
              <Share2 className="w-8 h-8 text-slate-600" />
              <div className="text-sm font-bold text-slate-300">No Graph Data Available</div>
              <p className="text-xs text-slate-500 max-w-sm">Select an incident above to view its multi-hop transaction subgraph.</p>
            </div>
          )}

          {/* Low-Information / Dormant Banner */}
          {graphData && (graphData.is_dormant || graphData.nodes.length <= 1) && !graphData.is_historical_expanded && (
            <div className="absolute top-12 left-3 right-3 z-20 bg-amber-950/90 border border-amber-600/70 text-amber-200 p-3 rounded-lg backdrop-blur shadow-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 font-sans">
              <div className="flex items-center gap-2.5">
                <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />
                <div>
                  <div className="text-xs font-bold text-amber-300 uppercase tracking-wide">
                    LOW INFORMATION SUBGRAPH
                  </div>
                  <p className="text-[11px] text-amber-200/90 mt-0.5">
                    {graphData.dormant_reason || 'Insufficient edge activity recorded within the ±72-hour sliding window.'}
                  </p>
                </div>
              </div>

              {(graphData.lifetime_tx_count ?? 0) > 0 && (
                <button
                  onClick={() => setIsHistoricalExpanded(true)}
                  className="px-3 py-1 bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 border border-amber-500/50 rounded text-xs font-bold font-mono transition-all whitespace-nowrap"
                >
                  View Lifetime Footprint ({graphData.lifetime_tx_count} txs)
                </button>
              )}
            </div>
          )}

          {/* Three.js Canvas Div */}
          <div ref={containerRef} className="w-full h-full flex-1 cursor-grab active:cursor-grabbing relative" />

          {/* Bottom-Left Collapsible 3D Legend */}
          <GraphLegend className="absolute bottom-3 left-3" />
        </div>

        {/* ── 3. NODE TELEMETRY DOSSIER PANEL (320px) ── */}
        <div className="w-full lg:w-80 bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex flex-col justify-between space-y-4">
          <div className="space-y-3.5">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
              <div className="font-bold text-xs text-slate-900 tracking-wide font-sans">
                NODE TELEMETRY
              </div>
              <span className="text-[10px] font-bold font-mono bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded">
                SELECTED NODE
              </span>
            </div>

            {selectedNode ? (
              <div className="space-y-3 font-sans text-xs">
                {/* Entity ID Box */}
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                  <div className="text-[10px] text-slate-500 font-bold uppercase">Entity / Account ID</div>
                  <div className="flex items-center justify-between gap-1 mt-0.5">
                    <span className="text-sm font-mono font-bold text-[#FF5500] truncate">
                      {selectedNode.id}
                    </span>
                    <button
                      onClick={() => handleCopyId(selectedNode.id)}
                      className="p-1 hover:bg-slate-200 rounded text-slate-500 transition-colors"
                      title="Copy Entity ID"
                    >
                      {copiedId ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                  <div className="text-[10px] text-slate-500 mt-1 truncate">{selectedNode.label}</div>
                </div>

                {/* Key-Value Details Grid */}
                <div className="space-y-2 border-t border-slate-100 pt-2.5">
                  <div className="flex justify-between items-center text-slate-600">
                    <span>Role / Type:</span>
                    <span className="font-bold text-slate-900 font-mono uppercase">{selectedNode.node_type}</span>
                  </div>

                  <div className="flex justify-between items-center text-slate-600">
                    <span>Hop Distance:</span>
                    <span className="font-bold text-slate-900 font-mono">{selectedNode.hop_distance} Hop(s)</span>
                  </div>

                  <div className="flex justify-between items-center text-slate-600">
                    <span>Jurisdiction:</span>
                    <span className="font-bold text-slate-900 truncate max-w-[140px] text-right">
                      {selectedNode.city || '—'}
                    </span>
                  </div>

                  <div className="flex justify-between items-center text-slate-600">
                    <span>Degree:</span>
                    <span className="font-bold font-mono text-slate-800">
                      {selectedNode.in_degree} IN / {selectedNode.out_degree} OUT
                    </span>
                  </div>

                  <div className="flex justify-between items-center text-slate-600">
                    <span>Total Inflow:</span>
                    <span className="font-bold font-mono text-emerald-700">
                      {formatINR(selectedNode.total_incoming_amount)}
                    </span>
                  </div>

                  <div className="flex justify-between items-center text-slate-600">
                    <span>Total Outflow:</span>
                    <span className="font-bold font-mono text-slate-900">
                      {formatINR(selectedNode.total_outgoing_amount)}
                    </span>
                  </div>

                  {/* Mule Risk Meter */}
                  {selectedNode.node_mule_score !== undefined && (() => {
                    const selIncident = incidents.find((i) => i.complaint_id === selectedIncidentId);
                    const effectiveTier = selectedNode.is_incident && selIncident?.confidence_tier
                      ? selIncident.confidence_tier
                      : getTierFromScore(selectedNode.node_mule_score);
                    const riskStyle = getRiskStyle(selectedNode.node_mule_score, effectiveTier);
                    const isHighButNotCrit = selectedNode.node_mule_score >= RISK_THRESHOLDS.CRITICAL && getTierLabel(effectiveTier) !== 'Critical';

                    return (
                      <div className="border-t border-slate-100 pt-2 space-y-1">
                        <div className="flex justify-between items-center">
                          <span className="text-[11px] font-bold text-slate-700">Mule Risk (Head 2):</span>
                          <ConfidenceBadge
                            tier={effectiveTier}
                            size="sm"
                          />
                        </div>
                        <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden relative">
                          <div
                            className={`h-full rounded-full transition-all duration-300 ${riskStyle.barColor}`}
                            style={{ width: `${Math.min(100, Math.max(0, selectedNode.node_mule_score * 100))}%` }}
                          />
                        </div>
                        <div className="flex justify-between text-[9px] font-mono text-slate-500">
                          <span>0%</span>
                          <span className="text-[#FF5500] font-bold">
                            {(selectedNode.node_mule_score * 100).toFixed(1)}%
                          </span>
                          <span>100%</span>
                        </div>
                        {isHighButNotCrit && (
                          <div className="text-[10px] text-amber-600 font-mono mt-0.5">
                            High score, insufficient structure
                          </div>
                        )}
                      </div>
                    );
                  })()}
                </div>

                {/* Badges for Origin / Exit */}
                {selectedNode.is_incident && (
                  <div className="p-2 bg-sky-50 border border-sky-200 text-sky-800 rounded text-[10px] font-medium">
                    Complaint Origin / Disputed Funds Entry Point
                  </div>
                )}
                {selectedNode.is_terminal && (
                  <div className="p-2 bg-amber-50 border border-amber-200 text-amber-800 rounded text-[10px] font-medium">
                    Exit Cash-Out Terminal // Physical ATM Withdrawal
                  </div>
                )}
              </div>
            ) : (
              <div className="p-8 text-center text-slate-400 font-sans">
                Select an entity in the graph to inspect telemetry details.
              </div>
            )}
          </div>

          {/* Action Button at bottom */}
          <button
            onClick={() => {
              if (selectedIncidentId) {
                window.open(`/dossier/${selectedIncidentId}`, '_blank');
              }
            }}
            className="w-full py-2.5 bg-[#FF5500] hover:bg-[#FF5500]/90 text-white font-bold text-xs uppercase tracking-wider rounded-lg flex items-center justify-center gap-2 shadow-sm transition-all"
          >
            <Lock className="w-3.5 h-3.5" />
            <span>Section 91 CrPC Freeze Order</span>
          </button>
        </div>
      </div>
    </div>
  );
};
