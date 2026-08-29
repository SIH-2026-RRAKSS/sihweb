import React, { useEffect, useRef } from 'react';

interface DynamicCyberGridCanvasProps {
  className?: string;
}

export const DynamicCyberGridCanvas: React.FC<DynamicCyberGridCanvasProps> = ({ className = '' }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef<{ x: number; y: number; active: boolean; targetX: number; targetY: number }>({
    x: -1000,
    y: -1000,
    active: false,
    targetX: -1000,
    targetY: -1000,
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current.targetX = e.clientX;
      mouseRef.current.targetY = e.clientY;
      mouseRef.current.active = true;
    };

    const handleMouseLeave = () => {
      mouseRef.current.active = false;
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseleave', handleMouseLeave);

    // Continuous Data Packets flowing along grid lines
    const PACKET_COUNT = 24;
    const packets: {
      isHoriz: boolean;
      laneIndex: number;
      pos: number;
      speed: number;
      color: string;
      size: number;
    }[] = [];

    const GRID_SIZE = 48; // Spacing of grid lines
    const colors = ['#EA580C', '#FF7A1A', '#0284C7', '#10B981'];

    for (let i = 0; i < PACKET_COUNT; i++) {
      packets.push({
        isHoriz: Math.random() > 0.5,
        laneIndex: Math.floor(Math.random() * 40),
        pos: Math.random() * 2000,
        speed: 1.5 + Math.random() * 2.5,
        color: colors[i % colors.length],
        size: 2.5 + Math.random() * 2.0,
      });
    }

    let time = 0;

    const render = () => {
      time += 0.02;

      // Smooth mouse follow
      if (mouseRef.current.active) {
        mouseRef.current.x += (mouseRef.current.targetX - mouseRef.current.x) * 0.1;
        mouseRef.current.y += (mouseRef.current.targetY - mouseRef.current.y) * 0.1;
      } else {
        // Autonomous sweeping Lissajous motion when idle
        const autoX = width / 2 + Math.sin(time * 0.5) * (width * 0.3) + Math.cos(time * 0.2) * 80;
        const autoY = height / 3 + Math.cos(time * 0.4) * (height * 0.25) + Math.sin(time * 0.7) * 60;
        mouseRef.current.x += (autoX - mouseRef.current.x) * 0.05;
        mouseRef.current.y += (autoY - mouseRef.current.y) * 0.05;
      }

      ctx.clearRect(0, 0, width, height);

      const mx = mouseRef.current.x;
      const my = mouseRef.current.y;

      // ── 1. DRAW DYNAMIC MOVING GRID LINES WITH WAVE RIPPLES ──
      const cols = Math.ceil(width / GRID_SIZE) + 2;
      const rows = Math.ceil(height / GRID_SIZE) + 2;

      // Wave offset that drifts continuously
      const driftX = (time * 12) % GRID_SIZE;
      const driftY = (time * 8) % GRID_SIZE;

      // Draw Vertical Lines
      for (let c = -1; c < cols; c++) {
        const baseX = c * GRID_SIZE + driftX;

        ctx.beginPath();
        ctx.strokeStyle = 'rgba(15, 23, 42, 0.05)';
        ctx.lineWidth = 1;

        for (let y = 0; y <= height; y += 16) {
          // Dynamic Wave Deformation
          const wave = Math.sin(baseX * 0.006 + time * 1.2 + y * 0.004) * 4;
          
          // Mouse repulsion/ripple
          const distToMouse = Math.hypot(baseX - mx, y - my);
          let mouseOffset = 0;
          if (distToMouse < 220) {
            const factor = Math.cos((distToMouse / 220) * (Math.PI / 2));
            mouseOffset = Math.sin(time * 4 - distToMouse * 0.05) * 8 * factor;
          }

          const currentX = baseX + wave + mouseOffset;

          if (y === 0) {
            ctx.moveTo(currentX, y);
          } else {
            ctx.lineTo(currentX, y);
          }
        }
        ctx.stroke();
      }

      // Draw Horizontal Lines
      for (let r = -1; r < rows; r++) {
        const baseY = r * GRID_SIZE + driftY;

        ctx.beginPath();
        ctx.strokeStyle = 'rgba(15, 23, 42, 0.05)';
        ctx.lineWidth = 1;

        for (let x = 0; x <= width; x += 16) {
          // Dynamic Wave Deformation
          const wave = Math.cos(baseY * 0.006 + time * 1.2 + x * 0.004) * 4;
          
          // Mouse repulsion/ripple
          const distToMouse = Math.hypot(x - mx, baseY - my);
          let mouseOffset = 0;
          if (distToMouse < 220) {
            const factor = Math.cos((distToMouse / 220) * (Math.PI / 2));
            mouseOffset = Math.sin(time * 4 - distToMouse * 0.05) * 8 * factor;
          }

          const currentY = baseY + wave + mouseOffset;

          if (x === 0) {
            ctx.moveTo(x, currentY);
          } else {
            ctx.lineTo(x, currentY);
          }
        }
        ctx.stroke();
      }

      // ── 2. DRAW INTERSECTION GLOW NODES ──
      for (let c = 0; c < cols; c += 2) {
        for (let r = 0; r < rows; r += 2) {
          const gx = c * GRID_SIZE + driftX;
          const gy = r * GRID_SIZE + driftY;

          const dist = Math.hypot(gx - mx, gy - my);
          if (dist < 260) {
            const alpha = Math.max(0, 1 - dist / 260);
            const pulse = 1 + Math.sin(time * 3 + c + r) * 0.4;

            ctx.fillStyle = `rgba(255, 85, 0, ${alpha * 0.65})`;
            ctx.beginPath();
            ctx.arc(gx, gy, 2.2 * pulse, 0, Math.PI * 2);
            ctx.fill();

            // Subtle glowing halo
            ctx.fillStyle = `rgba(255, 122, 26, ${alpha * 0.25})`;
            ctx.beginPath();
            ctx.arc(gx, gy, 5.5 * pulse, 0, Math.PI * 2);
            ctx.fill();
          } else {
            // Normal subtle grid dot
            ctx.fillStyle = 'rgba(15, 23, 42, 0.12)';
            ctx.beginPath();
            ctx.arc(gx, gy, 1.2, 0, Math.PI * 2);
            ctx.fill();
          }
        }
      }

      // ── 3. DRAW TRAVELING TELEMETRY DATA PACKETS ──
      packets.forEach((p) => {
        p.pos += p.speed;

        if (p.isHoriz) {
          const y = (p.laneIndex * GRID_SIZE + driftY) % height;
          const x = p.pos % (width + 100) - 50;

          // Glowing Packet
          const gradient = ctx.createRadialGradient(x, y, 0, x, y, p.size * 3);
          gradient.addColorStop(0, p.color);
          gradient.addColorStop(0.5, p.color + '88');
          gradient.addColorStop(1, 'transparent');

          ctx.fillStyle = gradient;
          ctx.beginPath();
          ctx.arc(x, y, p.size * 2.5, 0, Math.PI * 2);
          ctx.fill();

          // Core bright point
          ctx.fillStyle = '#FFFFFF';
          ctx.beginPath();
          ctx.arc(x, y, p.size * 0.7, 0, Math.PI * 2);
          ctx.fill();
        } else {
          const x = (p.laneIndex * GRID_SIZE + driftX) % width;
          const y = p.pos % (height + 100) - 50;

          // Glowing Packet
          const gradient = ctx.createRadialGradient(x, y, 0, x, y, p.size * 3);
          gradient.addColorStop(0, p.color);
          gradient.addColorStop(0.5, p.color + '88');
          gradient.addColorStop(1, 'transparent');

          ctx.fillStyle = gradient;
          ctx.beginPath();
          ctx.arc(x, y, p.size * 2.5, 0, Math.PI * 2);
          ctx.fill();

          // Core bright point
          ctx.fillStyle = '#FFFFFF';
          ctx.beginPath();
          ctx.arc(x, y, p.size * 0.7, 0, Math.PI * 2);
          ctx.fill();
        }
      });

      // ── 4. RADIAL CURSOR SPOTLIGHT AURA ──
      const auraGrad = ctx.createRadialGradient(mx, my, 0, mx, my, 350);
      auraGrad.addColorStop(0, 'rgba(255, 85, 0, 0.08)');
      auraGrad.addColorStop(0.4, 'rgba(2, 132, 199, 0.04)');
      auraGrad.addColorStop(1, 'transparent');

      ctx.fillStyle = auraGrad;
      ctx.beginPath();
      ctx.arc(mx, my, 350, 0, Math.PI * 2);
      ctx.fill();

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseleave', handleMouseLeave);
      cancelAnimationFrame(animId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className={`pointer-events-none fixed inset-0 z-0 select-none ${className}`}
    />
  );
};
