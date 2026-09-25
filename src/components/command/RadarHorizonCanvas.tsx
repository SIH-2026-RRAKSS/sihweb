import React, { useEffect, useRef } from 'react';

interface RadarNode {
  x: number;
  y: number;
  radius: number;
  color: string;
  pulsePhase: number;
  label: string;
  risk: number;
}

export const RadarHorizonCanvas: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mousePos = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const animFrameId = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = (canvas.width = canvas.parentElement?.clientWidth || 400);
    let height = (canvas.height = 160);

    const handleResize = () => {
      if (!canvas || !canvas.parentElement) return;
      width = canvas.width = canvas.parentElement.clientWidth;
      height = canvas.height = 160;
    };
    window.addEventListener('resize', handleResize);

    // Generate fixed procedural radar threat nodes
    const nodes: RadarNode[] = [
      { x: 0.18, y: 0.45, radius: 4, color: '#FF5500', pulsePhase: 0, label: 'C000001', risk: 0.96 },
      { x: 0.32, y: 0.65, radius: 3, color: '#FF5500', pulsePhase: 1.2, label: 'C000003', risk: 0.94 },
      { x: 0.48, y: 0.35, radius: 3.5, color: '#F59E0B', pulsePhase: 2.4, label: 'C000012', risk: 0.78 },
      { x: 0.65, y: 0.60, radius: 3, color: '#10B981', pulsePhase: 0.8, label: 'C000028', risk: 0.22 },
      { x: 0.78, y: 0.38, radius: 4, color: '#FF5500', pulsePhase: 1.8, label: 'C000007', risk: 0.91 },
      { x: 0.88, y: 0.55, radius: 2.5, color: '#F59E0B', pulsePhase: 3.1, label: 'C000045', risk: 0.65 },
    ];

    let sweepAngle = 0;

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      const cx = width / 2;
      const cy = height + 40; // Horizon arc centered below the baseline
      const maxRadius = Math.max(width, height) * 0.9;

      // Draw Horizon Concentric Radar Arcs
      const rings = [maxRadius * 0.35, maxRadius * 0.55, maxRadius * 0.75, maxRadius * 0.95];
      rings.forEach((r, idx) => {
        ctx.beginPath();
        ctx.arc(cx, cy, r, Math.PI * 1.1, Math.PI * 1.9);
        ctx.strokeStyle = idx === rings.length - 1 ? 'rgba(15, 23, 42, 0.08)' : 'rgba(15, 23, 42, 0.04)';
        ctx.lineWidth = 1;
        if (idx % 2 === 1) {
          ctx.setLineDash([4, 6]);
        } else {
          ctx.setLineDash([]);
        }
        ctx.stroke();
        ctx.setLineDash([]);
      });

      // Sweeping Radial Beam
      sweepAngle += 0.015;
      const sweepLength = maxRadius * 0.98;
      const sweepX = cx + Math.cos(sweepAngle) * sweepLength;
      const sweepY = cy + Math.sin(sweepAngle) * sweepLength;

      if (sweepY < height) {
        const sweepGrad = ctx.createLinearGradient(cx, cy, sweepX, sweepY);
        sweepGrad.addColorStop(0, 'rgba(255, 85, 0, 0.08)');
        sweepGrad.addColorStop(1, 'rgba(255, 85, 0, 0)');

        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.arc(cx, cy, sweepLength, sweepAngle - 0.2, sweepAngle);
        ctx.closePath();
        ctx.fillStyle = sweepGrad;
        ctx.fill();
      }

      // Connecting Graph Telemetry Lines between Nodes
      ctx.beginPath();
      for (let i = 0; i < nodes.length - 1; i++) {
        const n1 = nodes[i];
        const n2 = nodes[i + 1];
        ctx.moveTo(n1.x * width, n1.y * height);
        ctx.lineTo(n2.x * width, n2.y * height);
      }
      ctx.strokeStyle = 'rgba(255, 85, 0, 0.12)';
      ctx.lineWidth = 1;
      ctx.setLineDash([2, 4]);
      ctx.stroke();
      ctx.setLineDash([]);

      // Draw Threat Nodes
      const now = performance.now() * 0.003;
      nodes.forEach((node) => {
        const nx = node.x * width;
        const ny = node.y * height;

        // Animated Pulse Ring
        const pulse = (Math.sin(now + node.pulsePhase) + 1) / 2;
        ctx.beginPath();
        ctx.arc(nx, ny, node.radius + pulse * 6, 0, Math.PI * 2);
        ctx.strokeStyle = node.color === '#FF5500' ? `rgba(255, 85, 0, ${0.4 - pulse * 0.3})` : `rgba(245, 158, 11, ${0.4 - pulse * 0.3})`;
        ctx.lineWidth = 1;
        ctx.stroke();

        // Node Solid Core
        ctx.beginPath();
        ctx.arc(nx, ny, node.radius, 0, Math.PI * 2);
        ctx.fillStyle = node.color;
        ctx.shadowColor = node.color;
        ctx.shadowBlur = 8;
        ctx.fill();
        ctx.shadowBlur = 0;

        // Node Monospace Micro-Label
        ctx.fillStyle = '#64748B';
        ctx.font = '9px "JetBrains Mono", monospace';
        ctx.textAlign = 'center';
        ctx.fillText(node.label, nx, ny - 8);
      });

      // Retro Coordinates HUD Marker
      ctx.fillStyle = '#94A3B8';
      ctx.font = '8px "JetBrains Mono", monospace';
      ctx.textAlign = 'left';
      ctx.fillText(`RADAR.HORIZON // 72H SCAN [θ: ${(sweepAngle % (Math.PI * 2)).toFixed(2)} rad]`, 12, 16);

      animFrameId.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animFrameId.current);
    };
  }, []);

  return (
    <div className="relative w-full h-[140px] sm:h-[160px] overflow-hidden rounded-xl bg-gradient-to-b from-slate-50/50 to-white/20 border border-slate-200/60">
      <canvas ref={canvasRef} className="w-full h-full block" />
      <div className="absolute top-2.5 right-3 flex items-center gap-1.5 font-mono text-[9px] text-slate-500 bg-white/80 backdrop-blur-sm px-2 py-0.5 rounded border border-slate-200/80">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
        <span>LIVE RADAR SYNCHRONIZED</span>
      </div>
    </div>
  );
};
