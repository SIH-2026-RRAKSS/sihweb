import React, { useEffect, useRef } from 'react';

interface RiskMeterProps {
  value: number; // 0-1
  size?: number;
  label?: string;
  showValue?: boolean;
}

export const RiskMeter: React.FC<RiskMeterProps> = ({
  value,
  size = 130,
  label = 'RISK SCORE',
  showValue = true,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animatedValue = useRef(0);
  const animFrame = useRef(0);

  const clamped = Math.max(0, Math.min(1, value));

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    ctx.scale(dpr, dpr);

    const cx = size / 2;
    const cy = size / 2;
    const radius = size / 2 - 12;
    const startAngle = Math.PI * 0.75;
    const endAngle = Math.PI * 2.25;
    const totalAngle = endAngle - startAngle;

    const animate = () => {
      animatedValue.current += (clamped - animatedValue.current) * 0.08;
      ctx.clearRect(0, 0, size, size);

      // Outer radar tick circle
      ctx.strokeStyle = 'rgba(0, 229, 255, 0.15)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(cx, cy, radius + 6, 0, Math.PI * 2);
      ctx.stroke();

      // Tick marks
      const numTicks = 24;
      for (let i = 0; i <= numTicks; i++) {
        const tickAngle = startAngle + (totalAngle * (i / numTicks));
        const x1 = cx + Math.cos(tickAngle) * (radius - 2);
        const y1 = cy + Math.sin(tickAngle) * (radius - 2);
        const x2 = cx + Math.cos(tickAngle) * (radius + 4);
        const y2 = cy + Math.sin(tickAngle) * (radius + 4);

        ctx.strokeStyle = (i / numTicks) <= animatedValue.current 
          ? (animatedValue.current > 0.7 ? '#FF3B4E' : animatedValue.current > 0.4 ? '#FFB000' : '#00FF9D')
          : 'rgba(255, 255, 255, 0.1)';
        ctx.lineWidth = i % 4 === 0 ? 2 : 1;
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
      }

      // Background Track Arc
      ctx.beginPath();
      ctx.arc(cx, cy, radius, startAngle, endAngle);
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
      ctx.lineWidth = 6;
      ctx.lineCap = 'butt';
      ctx.stroke();

      // Active Arc
      const currentAngle = startAngle + totalAngle * animatedValue.current;
      if (animatedValue.current > 0.005) {
        const strokeColor = animatedValue.current >= 0.7 
          ? '#FF3B4E' 
          : animatedValue.current >= 0.4 
          ? '#FFB000' 
          : '#00E5FF';

        ctx.save();
        ctx.shadowColor = strokeColor;
        ctx.shadowBlur = 12;
        ctx.beginPath();
        ctx.arc(cx, cy, radius, startAngle, currentAngle);
        ctx.strokeStyle = strokeColor;
        ctx.lineWidth = 6;
        ctx.lineCap = 'butt';
        ctx.stroke();
        ctx.restore();
      }

      // Digital Center Display
      if (showValue) {
        const displayVal = (animatedValue.current * 100).toFixed(1);
        const color = animatedValue.current >= 0.7 ? '#FF3B4E' : animatedValue.current >= 0.4 ? '#FFB000' : '#00E5FF';

        ctx.fillStyle = color;
        ctx.font = `bold ${Math.round(size * 0.19)}px "JetBrains Mono", monospace`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(`${displayVal}%`, cx, cy - 2);

        if (label) {
          ctx.fillStyle = '#94a3b8';
          ctx.font = `bold ${Math.round(size * 0.08)}px "JetBrains Mono", monospace`;
          ctx.fillText(label.toUpperCase(), cx, cy + size * 0.16);
        }
      }

      if (Math.abs(animatedValue.current - clamped) > 0.001) {
        animFrame.current = requestAnimationFrame(animate);
      }
    };

    animFrame.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animFrame.current);
  }, [clamped, size, label, showValue]);

  return (
    <div className="relative inline-flex items-center justify-center">
      <canvas
        ref={canvasRef}
        style={{ width: size, height: size }}
        className="block"
      />
    </div>
  );
};
