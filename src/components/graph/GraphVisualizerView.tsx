import React, { useState, useEffect, useRef } from 'react';
import {
  Share2,
  ZoomIn,
  ZoomOut,
  Maximize2,
  RotateCcw,
  Layers,
  Building,
  Info,
  DollarSign,
  ArrowRight,
  ShieldAlert,
  Play,
  Pause
} from 'lucide-react';
import { GraphStructure, GraphNode, GraphEdge } from '../../types';
import { ApiService } from '../../services/api';

interface GraphVisualizerProps {
  initialIncidentId?: string;
  onOpenDossier: (id: string) => void;
}

export const GraphVisualizerView: React.FC<GraphVisualizerProps> = ({
  initialIncidentId = 'C000047',
  onOpenDossier
}) => {
  const [selectedIncident, setSelectedIncident] = useState<string>(initialIncidentId);
  const [graphData, setGraphData] = useState<GraphStructure | null>(null);
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);
  const [isPhysicsRunning, setIsPhysicsRunning] = useState<boolean>(true);
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [panOffset, setPanOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDraggingCanvas, setIsDraggingCanvas] = useState<boolean>(false);
  const [draggedNodeId, setDraggedNodeId] = useState<string | null>(null);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const nodesRef = useRef<(GraphNode & { x: number; y: number; vx: number; vy: number })[]>([]);
  const edgesRef = useRef<GraphEdge[]>([]);
  const dragStartRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  // Available incident graphs
  const availableIncidents = ['C000047', 'C000056', 'C000035', 'C000048', 'C000004', 'C000003'];

  // Load Graph Data
  useEffect(() => {
    ApiService.getIncidentGraph(selectedIncident).then((data) => {
      setGraphData(data);
      // Initialize node positions in a radial / layered layout
      const width = 800;
      const height = 500;
      const centerX = width / 2;
      const centerY = height / 2;

      const nodes = data.nodes.map((n, idx) => {
        let x = centerX;
        let y = centerY;

        if (n.is_incident) {
          x = centerX - 180;
          y = centerY;
        } else if (n.is_terminal) {
          x = centerX + 220 + (idx % 2 === 0 ? 30 : -30);
          y = centerY + (idx % 2 === 0 ? 80 : -80);
        } else {
          const angle = (idx / data.nodes.length) * Math.PI * 2;
          const radius = 80 + n.hop_distance * 70;
          x = centerX + Math.cos(angle) * radius;
          y = centerY + Math.sin(angle) * radius;
        }

        return {
          ...n,
          x,
          y,
          vx: 0,
          vy: 0
        };
      });

      nodesRef.current = nodes;
      edgesRef.current = data.edges;
      setSelectedNode(nodes.find(n => n.is_incident) || nodes[0] || null);
    });
  }, [selectedIncident]);

  // Force simulation loop
  useEffect(() => {
    let animId: number;

    const simulate = () => {
      if (isPhysicsRunning && nodesRef.current.length > 0) {
        const nodes = nodesRef.current;
        const edges = edgesRef.current;
        const width = 800;
        const height = 500;
        const cx = width / 2;
        const cy = height / 2;

        // Node repulsion
        for (let i = 0; i < nodes.length; i++) {
          for (let j = i + 1; j < nodes.length; j++) {
            const dx = nodes[j].x - nodes[i].x;
            const dy = nodes[j].y - nodes[i].y;
            const dist = Math.sqrt(dx * dx + dy * dy) || 1;
            if (dist < 220) {
              const force = (220 - dist) / dist * 0.08;
              if (nodes[i].id !== draggedNodeId) {
                nodes[i].vx -= dx * force;
                nodes[i].vy -= dy * force;
              }
              if (nodes[j].id !== draggedNodeId) {
                nodes[j].vx += dx * force;
                nodes[j].vy += dy * force;
              }
            }
          }
        }

        // Edge attraction
        edges.forEach((edge) => {
          const src = nodes.find(n => n.id === edge.source);
          const tgt = nodes.find(n => n.id === edge.target);
          if (src && tgt) {
            const dx = tgt.x - src.x;
            const dy = tgt.y - src.y;
            const dist = Math.sqrt(dx * dx + dy * dy) || 1;
            const desiredDist = 120;
            const force = (dist - desiredDist) * 0.015;
            if (src.id !== draggedNodeId) {
              src.vx += dx * force;
              src.vy += dy * force;
            }
            if (tgt.id !== draggedNodeId) {
              tgt.vx -= dx * force;
              tgt.vy -= dy * force;
            }
          }
        });

        // Center gravity & velocity dampening
        nodes.forEach((n) => {
          if (n.id !== draggedNodeId) {
            n.vx += (cx - n.x) * 0.002;
            n.vy += (cy - n.y) * 0.002;
            n.vx *= 0.85;
            n.vy *= 0.85;
            n.x += n.vx;
            n.y += n.vy;
          }
        });
      }

      // Render Canvas
      drawCanvas();
      animId = requestAnimationFrame(simulate);
    };

    animId = requestAnimationFrame(simulate);
    return () => cancelAnimationFrame(animId);
  }, [isPhysicsRunning, draggedNodeId, zoomLevel, panOffset, selectedNode]);

  const drawCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.save();

    // Pan & Zoom
    ctx.translate(canvas.width / 2 + panOffset.x, canvas.height / 2 + panOffset.y);
    ctx.scale(zoomLevel, zoomLevel);
    ctx.translate(-canvas.width / 2, -canvas.height / 2);

    const nodes = nodesRef.current;
    const edges = edgesRef.current;

    // Draw Edges
    edges.forEach((edge) => {
      const src = nodes.find(n => n.id === edge.source);
      const tgt = nodes.find(n => n.id === edge.target);
      if (!src || !tgt) return;

      const isHighAmt = edge.amount > 100000;
      ctx.beginPath();
      ctx.moveTo(src.x, src.y);
      ctx.lineTo(tgt.x, tgt.y);
      ctx.strokeStyle = edge.is_cash_out ? 'rgba(245, 158, 11, 0.7)' : 'rgba(56, 189, 248, 0.4)';
      ctx.lineWidth = edge.is_cash_out ? 2.5 : isHighAmt ? 2 : 1.2;
      ctx.stroke();

      // Draw transfer direction arrow
      const angle = Math.atan2(tgt.y - src.y, tgt.x - src.x);
      const midX = (src.x + tgt.x) / 2;
      const midY = (src.y + tgt.y) / 2;
      const arrowSize = 6;

      ctx.beginPath();
      ctx.moveTo(midX, midY);
      ctx.lineTo(
        midX - arrowSize * Math.cos(angle - Math.PI / 6),
        midY - arrowSize * Math.sin(angle - Math.PI / 6)
      );
      ctx.lineTo(
        midX - arrowSize * Math.cos(angle + Math.PI / 6),
        midY - arrowSize * Math.sin(angle + Math.PI / 6)
      );
      ctx.fillStyle = edge.is_cash_out ? '#F59E0B' : '#38BDF8';
      ctx.fill();

      // Label Amount
      ctx.font = '9px "JetBrains Mono", monospace';
      ctx.fillStyle = edge.is_cash_out ? '#FCD34D' : '#94A3B8';
      ctx.textAlign = 'center';
      ctx.fillText(`₹${(edge.amount / 1000).toFixed(0)}k (${edge.channel || 'TX'})`, midX, midY - 6);
    });

    // Draw Nodes
    nodes.forEach((node) => {
      const isSelected = selectedNode?.id === node.id;
      const radius = node.is_incident ? 18 : node.is_terminal ? 16 : 14;

      // Glow on selected
      if (isSelected) {
        ctx.beginPath();
        ctx.arc(node.x, node.y, radius + 6, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(0, 240, 255, 0.3)';
        ctx.fill();
      }

      ctx.beginPath();
      if (node.is_terminal) {
        // Square for ATM
        ctx.rect(node.x - radius, node.y - radius, radius * 2, radius * 2);
      } else {
        // Circle for Account
        ctx.arc(node.x, node.y, radius, 0, Math.PI * 2);
      }
      ctx.fillStyle = node.color || '#3B82F6';
      ctx.fill();
      ctx.lineWidth = isSelected ? 2.5 : 1.5;
      ctx.strokeStyle = isSelected ? '#FFFFFF' : '#0B0F17';
      ctx.stroke();

      // Node label
      ctx.font = 'bold 10px "JetBrains Mono", monospace';
      ctx.fillStyle = '#F1F5F9';
      ctx.textAlign = 'center';
      ctx.fillText(node.id, node.x, node.y + radius + 12);
    });

    ctx.restore();
  };

  // Canvas Mouse Interactions
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    // Convert mouse to world coordinates
    const worldX = (mouseX - (canvas.width / 2 + panOffset.x)) / zoomLevel + canvas.width / 2;
    const worldY = (mouseY - (canvas.height / 2 + panOffset.y)) / zoomLevel + canvas.height / 2;

    // Check if clicked a node
    const clickedNode = nodesRef.current.find((n) => {
      const dist = Math.sqrt((n.x - worldX) ** 2 + (n.y - worldY) ** 2);
      return dist <= 22;
    });

    if (clickedNode) {
      setSelectedNode(clickedNode);
      setDraggedNodeId(clickedNode.id);
    } else {
      setIsDraggingCanvas(true);
      dragStartRef.current = { x: e.clientX - panOffset.x, y: e.clientY - panOffset.y };
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    if (draggedNodeId) {
      const rect = canvas.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;
      const worldX = (mouseX - (canvas.width / 2 + panOffset.x)) / zoomLevel + canvas.width / 2;
      const worldY = (mouseY - (canvas.height / 2 + panOffset.y)) / zoomLevel + canvas.height / 2;

      const node = nodesRef.current.find(n => n.id === draggedNodeId);
      if (node) {
        node.x = worldX;
        node.y = worldY;
        node.vx = 0;
        node.vy = 0;
      }
    } else if (isDraggingCanvas) {
      setPanOffset({
        x: e.clientX - dragStartRef.current.x,
        y: e.clientY - dragStartRef.current.y
      });
    }
  };

  const handleMouseUp = () => {
    setDraggedNodeId(null);
    setIsDraggingCanvas(false);
  };

  const handleResetCamera = () => {
    setZoomLevel(1);
    setPanOffset({ x: 0, y: 0 });
  };

  return (
    <div className="space-y-4 pb-8">
      {/* Header & Controls Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-cyber-700 pb-3">
        <div>
          <h2 className="text-base font-bold font-mono text-slate-100 uppercase tracking-wide flex items-center gap-2">
            <Share2 className="w-5 h-5 text-cyber-cyan" />
            Topological Incident Subgraph Visualizer
          </h2>
          <p className="text-xs text-slate-400">
            Interactive multi-hop laundering network with flow velocities, transfer amounts, and terminal exit nodes.
          </p>
        </div>

        {/* Incident Switcher */}
        <div className="flex items-center gap-2">
          <label className="text-xs font-mono text-slate-400">Select Subgraph:</label>
          <select
            value={selectedIncident}
            onChange={(e) => setSelectedIncident(e.target.value)}
            className="px-3 py-1.5 text-xs font-mono bg-cyber-950 border border-cyber-700 rounded-lg text-cyber-cyan focus:border-cyber-cyan focus:outline-none"
          >
            {availableIncidents.map(id => (
              <option key={id} value={id}>{id} (Sub-network)</option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Visualizer Area */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* Left 3 Cols: Interactive Canvas Container */}
        <div className="lg:col-span-3 cyber-card relative overflow-hidden flex flex-col items-center justify-center min-h-[540px]">
          {/* Top Controls Overlay */}
          <div className="absolute top-3 left-3 z-10 flex items-center gap-1.5 bg-cyber-950/90 border border-cyber-700/80 p-1 rounded-lg backdrop-blur-md">
            <button
              onClick={() => setZoomLevel(z => Math.min(2.5, z + 0.15))}
              className="p-1.5 hover:bg-cyber-800 text-slate-300 rounded"
              title="Zoom In"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            <button
              onClick={() => setZoomLevel(z => Math.max(0.4, z - 0.15))}
              className="p-1.5 hover:bg-cyber-800 text-slate-300 rounded"
              title="Zoom Out"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <button
              onClick={handleResetCamera}
              className="p-1.5 hover:bg-cyber-800 text-slate-300 rounded"
              title="Reset Camera View"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
            <div className="w-[1px] h-4 bg-cyber-700 mx-1"></div>
            <button
              onClick={() => setIsPhysicsRunning(r => !r)}
              className={`p-1.5 rounded flex items-center gap-1 text-[11px] font-mono ${
                isPhysicsRunning ? 'bg-cyber-cyan/20 text-cyber-cyan' : 'text-slate-400 hover:bg-cyber-800'
              }`}
              title="Toggle Force Physics Simulation"
            >
              {isPhysicsRunning ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
              <span className="hidden sm:inline">{isPhysicsRunning ? 'Physics On' : 'Frozen'}</span>
            </button>
          </div>

          {/* Top Right Legend Overlay */}
          <div className="absolute top-3 right-3 z-10 bg-cyber-950/90 border border-cyber-700/80 p-2.5 rounded-lg backdrop-blur-md font-mono text-[10px] space-y-1 hidden sm:block">
            <div className="font-bold text-slate-400 uppercase tracking-wider mb-1">Entity Roles</div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-cyber-red"></span>
              <span className="text-slate-200">Incident Seed / Victim</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-cyber-blue"></span>
              <span className="text-slate-200">1-Hop Mule Account</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-400"></span>
              <span className="text-slate-200">2+ Hop Layering Node</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 bg-amber-500 rounded-sm"></span>
              <span className="text-amber-400 font-bold">ATM Cash-Out Exit</span>
            </div>
          </div>

          {/* Canvas Element */}
          <canvas
            ref={canvasRef}
            width={820}
            height={520}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            className="w-full h-[520px] cursor-grab active:cursor-grabbing bg-cyber-950/80 rounded-xl"
          />

          <div className="absolute bottom-3 left-3 text-[10px] font-mono text-slate-500 bg-cyber-950/80 px-2 py-1 rounded border border-cyber-800">
            Drag nodes to rearrange • Click node to inspect details • Drag background to pan
          </div>
        </div>

        {/* Right 1 Col: Node Inspector Panel */}
        <div className="cyber-card p-5 space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-cyber-700 pb-3">
              <div className="flex items-center gap-2 text-slate-200 font-mono font-bold text-xs">
                <Info className="w-4 h-4 text-cyber-cyan" />
                Entity Inspector
              </div>
              <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/30">
                Resolved
              </span>
            </div>

            {selectedNode ? (
              <div className="space-y-3.5 mt-3 text-xs font-mono">
                <div>
                  <div className="text-[10px] text-slate-500 uppercase">Entity Master ID</div>
                  <div className="text-sm font-bold text-cyber-cyan">{selectedNode.id}</div>
                  <div className="text-[11px] text-slate-300 font-sans mt-0.5">{selectedNode.label}</div>
                </div>

                <div className="p-2.5 bg-cyber-950 rounded-lg border border-cyber-800 space-y-1.5">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Node Type:</span>
                    <span className="font-bold text-slate-200">{selectedNode.node_type}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Hop Distance:</span>
                    <span className="text-slate-200">{selectedNode.hop_distance} hops</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">City / Region:</span>
                    <span className="text-amber-400 font-semibold">{selectedNode.city || 'Mumbai'}</span>
                  </div>
                </div>

                <div className="p-2.5 bg-cyber-950 rounded-lg border border-cyber-800 space-y-1.5">
                  <div className="flex justify-between">
                    <span className="text-slate-500">In-Degree / Incoming:</span>
                    <span className="text-emerald-400 font-bold">{selectedNode.in_degree} (₹{selectedNode.total_incoming_amount.toLocaleString()})</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Out-Degree / Outgoing:</span>
                    <span className="text-cyber-red font-bold">{selectedNode.out_degree} (₹{selectedNode.total_outgoing_amount.toLocaleString()})</span>
                  </div>
                </div>

                {selectedNode.is_terminal && (
                  <div className="p-2.5 bg-amber-500/10 border border-amber-500/30 rounded-lg text-amber-300 text-[11px]">
                    <div className="font-bold flex items-center gap-1 mb-1">
                      <Building className="w-3.5 h-3.5" />
                      Terminal Withdrawal Point
                    </div>
                    Identified downstream cash-out sink terminating electronic transfer hops.
                  </div>
                )}
              </div>
            ) : (
              <div className="py-12 text-center text-slate-500 font-mono text-xs">
                Click any node in the graph to inspect structural and transaction flow metrics.
              </div>
            )}
          </div>

          <div className="space-y-2 pt-4 border-t border-cyber-700">
            <button
              onClick={() => onOpenDossier(selectedIncident)}
              className="w-full py-2 bg-cyber-cyan text-cyber-950 font-mono font-bold text-xs rounded-lg hover:bg-cyber-cyan/90 transition-all flex items-center justify-center gap-2"
            >
              <ShieldAlert className="w-4 h-4" />
              Open Full Case Dossier
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
