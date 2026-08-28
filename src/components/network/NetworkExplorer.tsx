import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import {
  Search,
  Sliders,
  Filter,
  Maximize2,
  Minimize2,
  RotateCcw,
  Zap,
  ShieldAlert,
  MapPin,
  FileText,
  DollarSign,
  ArrowRight
} from 'lucide-react';
import { GlassCard } from '../ui/GlassCard';
import { ConfidenceBadge } from '../ui/ConfidenceBadge';
import { ApiService } from '../../services/api';
import { IncidentSummary, GraphStructure, GraphNode, GraphEdge } from '../../types';

export const NetworkExplorer: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [incidents, setIncidents] = useState<IncidentSummary[]>([]);
  const [selectedIncidentId, setSelectedIncidentId] = useState<string>('C000047');
  const [graphData, setGraphData] = useState<GraphStructure | null>(null);
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);
  const [searchEntity, setSearchEntity] = useState<string>('');
  const [showLabels, setShowLabels] = useState<boolean>(true);
  const [loading, setLoading] = useState<boolean>(false);

  // Fetch Incident options
  useEffect(() => {
    const fetchIncidents = async () => {
      try {
        const res = await ApiService.getIncidents({ page: 1, page_size: 50 });
        setIncidents(res.items || []);
      } catch (err) {
        console.error(err);
      }
    };
    fetchIncidents();
  }, []);

  // Fetch Graph data for selected incident
  useEffect(() => {
    if (!selectedIncidentId) return;
    const fetchGraph = async () => {
      setLoading(true);
      try {
        const data = await ApiService.getIncidentGraph(selectedIncidentId);
        setGraphData(data);
        if (data.nodes.length > 0) {
          setSelectedNode(data.nodes[0]);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchGraph();
  }, [selectedIncidentId]);

  // 3D Three.js Graph Visualization
  useEffect(() => {
    const container = containerRef.current;
    if (!container || !graphData) return;

    const width = container.clientWidth;
    const height = container.clientHeight;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x040609);
    scene.fog = new THREE.FogExp2(0x040609, 0.003);

    const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 1000);
    camera.position.set(0, 30, 110);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    // Grid
    const grid = new THREE.GridHelper(200, 30, 0x00e5ff, 0x112233);
    grid.position.y = -25;
    (grid.material as THREE.Material).opacity = 0.2;
    (grid.material as THREE.Material).transparent = true;
    scene.add(grid);

    // Lights
    scene.add(new THREE.AmbientLight(0xffffff, 0.8));
    const pl = new THREE.PointLight(0x00e5ff, 2.5, 200);
    pl.position.set(0, 40, 50);
    scene.add(pl);

    // Position calculation in 3D
    const nodeObjMap = new Map<string, THREE.Group>();
    const nodePositions = new Map<string, THREE.Vector3>();

    graphData.nodes.forEach((n, idx) => {
      const group = new THREE.Group();
      const angle = (idx / graphData.nodes.length) * Math.PI * 2;
      const radius = n.is_incident ? 0 : 25 + n.hop_distance * 14;
      const x = n.is_incident ? 0 : Math.cos(angle) * radius;
      const z = n.is_incident ? 0 : Math.sin(angle) * radius;
      const y = (idx % 2 === 0 ? 8 : -8) + (n.is_terminal ? -10 : 0);

      const pos = new THREE.Vector3(x, y, z);
      group.position.copy(pos);
      nodePositions.set(n.id, pos);

      // Node Geometry
      if (n.is_incident) {
        const mesh = new THREE.Mesh(
          new THREE.OctahedronGeometry(5.5, 0),
          new THREE.MeshStandardMaterial({ color: 0xff3b4e, emissive: 0xff3b4e, emissiveIntensity: 0.9 })
        );
        group.add(mesh);
        const wire = new THREE.Mesh(
          new THREE.IcosahedronGeometry(7.5, 1),
          new THREE.MeshBasicMaterial({ color: 0xff3b4e, wireframe: true, opacity: 0.4, transparent: true })
        );
        group.add(wire);
      } else if (n.is_terminal || n.node_type === 'ATM') {
        const mesh = new THREE.Mesh(
          new THREE.BoxGeometry(6, 6, 6),
          new THREE.MeshStandardMaterial({ color: 0xffb000, emissive: 0xffb000, emissiveIntensity: 0.8 })
        );
        group.add(mesh);
      } else {
        const mesh = new THREE.Mesh(
          new THREE.SphereGeometry(4, 16, 16),
          new THREE.MeshStandardMaterial({ color: 0x00e5ff, emissive: 0x00e5ff, emissiveIntensity: 0.7 })
        );
        group.add(mesh);
        const ring = new THREE.Mesh(
          new THREE.TorusGeometry(5.5, 0.2, 8, 24),
          new THREE.MeshBasicMaterial({ color: 0x00e5ff, opacity: 0.6, transparent: true })
        );
        ring.rotation.x = Math.PI / 2;
        group.add(ring);
      }

      scene.add(group);
      nodeObjMap.set(n.id, group);
    });

    // Edges with 3D Arcs
    const edgeCurves: THREE.QuadraticBezierCurve3[] = [];

    graphData.edges.forEach((e) => {
      const srcPos = nodePositions.get(e.source);
      const tgtPos = nodePositions.get(e.target);
      if (!srcPos || !tgtPos) return;

      const mid = new THREE.Vector3().addVectors(srcPos, tgtPos).multiplyScalar(0.5);
      mid.y += 10;
      const curve = new THREE.QuadraticBezierCurve3(srcPos, mid, tgtPos);
      edgeCurves.push(curve);

      const pts = curve.getPoints(25);
      const geom = new THREE.BufferGeometry().setFromPoints(pts);
      const mat = new THREE.LineBasicMaterial({
        color: e.is_cash_out ? 0xffb000 : 0x00e5ff,
        opacity: 0.6,
        transparent: true,
      });
      scene.add(new THREE.Line(geom, mat));
    });

    // Animated Particles
    const particleGeom = new THREE.SphereGeometry(0.7, 8, 8);
    const particleMat = new THREE.MeshBasicMaterial({ color: 0x00ff9d });
    const particles: { mesh: THREE.Mesh; curve: THREE.QuadraticBezierCurve3; progress: number }[] = [];

    edgeCurves.forEach((curve) => {
      const mesh = new THREE.Mesh(particleGeom, particleMat);
      scene.add(mesh);
      particles.push({ mesh, curve, progress: Math.random() });
    });

    // Raycast click
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const handleClick = (ev: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      mouse.x = ((ev.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((ev.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(scene.children, true);
      if (intersects.length > 0) {
        let parent = intersects[0].object.parent;
        if (parent) {
          for (const n of graphData.nodes) {
            if (nodeObjMap.get(n.id) === parent) {
              setSelectedNode(n);
              return;
            }
          }
        }
      }
    };
    container.addEventListener('click', handleClick);

    // Animation Loop
    let animId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const time = clock.getElapsedTime();

      // Camera Slow Orbit
      camera.position.x = Math.sin(time * 0.05) * 110;
      camera.position.z = Math.cos(time * 0.05) * 110;
      camera.lookAt(0, 0, 0);

      // Node Rotation
      nodeObjMap.forEach((grp) => {
        grp.rotation.y += 0.01;
      });

      // Move Particles
      particles.forEach((p) => {
        p.progress += 0.005;
        if (p.progress >= 1) p.progress = 0;
        const pt = p.curve.getPoint(p.progress);
        p.mesh.position.copy(pt);
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
      container.removeEventListener('click', handleClick);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [graphData]);

  return (
    <div className="flex flex-col lg:flex-row h-full gap-3 font-mono text-xs overflow-hidden">
      {/* ── LEFT / MAIN: 3D THREE.JS GRAPH CANVAS ── */}
      <div className="flex-1 flex flex-col bg-cyber-900 border border-cyan-500/30 p-3 hud-bracket relative overflow-hidden">
        {/* Filter Controls Header */}
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-cyan-500/30 pb-2.5 z-20">
          <div className="flex items-center gap-2">
            <div className="p-1 border border-cyan-500 bg-cyan-500/10 text-neon-cyan">
              <Zap className="w-4 h-4" />
            </div>
            <div>
              <div className="font-mono text-xs font-black tracking-wider text-neon-cyan text-glow-cyan">
                3D MULE NETWORK EXPLORER
              </div>
              <div className="text-[9px] text-slate-500">
                TOPOLOGICAL GRAPH INVESTIGATION SANDBOX
              </div>
            </div>
          </div>

          {/* Incident Selector */}
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-slate-400">SELECT INCIDENT:</span>
            <select
              value={selectedIncidentId}
              onChange={(e) => setSelectedIncidentId(e.target.value)}
              className="bg-cyber-950 border border-cyan-500/40 text-neon-cyan px-2 py-1 text-xs font-bold focus:outline-none"
            >
              {incidents.map((inc) => (
                <option key={inc.complaint_id} value={inc.complaint_id}>
                  {inc.complaint_id} ({(inc.graphsage_risk_probability * 100).toFixed(0)}% Risk)
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* 3D Canvas Container */}
        <div className="flex-1 relative min-h-[400px]">
          <div ref={containerRef} className="w-full h-full cursor-grab" />

          {/* Top HUD Overlay */}
          <div className="absolute top-2 left-2 bg-black/80 px-2.5 py-1 border border-slate-800 text-[10px] text-slate-300 pointer-events-none">
            NODES: <span className="text-neon-cyan font-bold">{graphData?.num_nodes || 9}</span> | EDGES: <span className="text-neon-cyan font-bold">{graphData?.num_edges || 10}</span>
          </div>
        </div>
      </div>

      {/* ── RIGHT: NODE DOSSIER INSPECTOR (320px) ── */}
      <div className="w-full lg:w-80 flex flex-col">
        <GlassCard className="flex-1 flex flex-col space-y-3.5" padding="md" glow="cyan">
          <div className="flex items-center justify-between border-b border-cyan-500/30 pb-2">
            <div className="font-mono text-xs font-black text-neon-cyan text-glow-cyan">
              NODE TELEMETRY
            </div>
            <span className="text-[9px] text-amber-cash bg-amber-500/10 border border-amber-500/30 px-1.5 py-0.5">
              SELECTED
            </span>
          </div>

          {selectedNode ? (
            <div className="space-y-3 font-mono text-xs">
              <div className="p-2.5 bg-cyber-950 border border-slate-800">
                <div className="text-[10px] text-slate-500">ENTITY / ACCOUNT ID:</div>
                <div className="text-sm font-bold text-neon-cyan">{selectedNode.id}</div>
                <div className="text-[10px] text-slate-400 mt-0.5">{selectedNode.label}</div>
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between border-b border-slate-800 pb-1">
                  <span className="text-slate-400">NODE TYPE:</span>
                  <span className="text-amber-cash font-bold">{selectedNode.node_type}</span>
                </div>
                <div className="flex justify-between border-b border-slate-800 pb-1">
                  <span className="text-slate-400">HOP DISTANCE:</span>
                  <span className="text-slate-100">{selectedNode.hop_distance} HOP(S)</span>
                </div>
                <div className="flex justify-between border-b border-slate-800 pb-1">
                  <span className="text-slate-400">LOCATION:</span>
                  <span className="text-slate-100">{selectedNode.city || 'Bhubaneswar'}</span>
                </div>
                <div className="flex justify-between border-b border-slate-800 pb-1">
                  <span className="text-slate-400">IN/OUT DEGREE:</span>
                  <span className="text-neon-cyan">{selectedNode.in_degree} IN / {selectedNode.out_degree} OUT</span>
                </div>
                <div className="flex justify-between border-b border-slate-800 pb-1">
                  <span className="text-slate-400">TOTAL INFLOW:</span>
                  <span className="text-acid-green font-bold">₹{selectedNode.total_incoming_amount.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between border-b border-slate-800 pb-1">
                  <span className="text-slate-400">TOTAL OUTFLOW:</span>
                  <span className="text-crimson-alert font-bold">₹{selectedNode.total_outgoing_amount.toLocaleString('en-IN')}</span>
                </div>
              </div>

              {selectedNode.is_incident && (
                <div className="p-2 bg-red-500/10 border border-crimson-alert text-crimson-alert text-[10px]">
                  ⚠️ COMPLAINT ORIGIN SEED ACCOUNT // DISPUTED FUNDS ENTRY POINT
                </div>
              )}

              {selectedNode.is_terminal && (
                <div className="p-2 bg-amber-500/10 border border-amber-cash text-amber-cash text-[10px]">
                  ⚡ EXIT CASH-OUT TERMINAL // PHYSICAL ATM POINT
                </div>
              )}
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center text-slate-500 text-center">
              Click any node in the 3D graph to inspect details.
            </div>
          )}
        </GlassCard>
      </div>
    </div>
  );
};
