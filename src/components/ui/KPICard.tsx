import React from 'react';
import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';

interface KPICardProps {
  icon: LucideIcon;
  value: string | number;
  label: string;
  code?: string;
  color?: 'cyan' | 'red' | 'amber' | 'green' | 'white';
  trend?: { direction: 'up' | 'down' | 'stable'; text: string };
  onClick?: () => void;
}

const colorMap = {
  cyan: {
    border: 'border-cyan-500/40',
    iconBg: 'bg-cyan-500/10 text-neon-cyan border-cyan-500/40',
    val: 'text-neon-cyan text-glow-cyan',
    badge: 'text-neon-cyan',
  },
  red: {
    border: 'border-red-500/60 shadow-neon-red',
    iconBg: 'bg-red-500/15 text-crimson-alert border-red-500/60',
    val: 'text-crimson-alert text-glow-red',
    badge: 'text-crimson-alert',
  },
  amber: {
    border: 'border-amber-500/50',
    iconBg: 'bg-amber-500/15 text-amber-cash border-amber-500/50',
    val: 'text-amber-cash text-glow-amber',
    badge: 'text-amber-cash',
  },
  green: {
    border: 'border-green-500/40',
    iconBg: 'bg-green-500/10 text-acid-green border-green-500/40',
    val: 'text-acid-green text-glow-green',
    badge: 'text-acid-green',
  },
  white: {
    border: 'border-slate-700',
    iconBg: 'bg-slate-800 text-slate-700 border-slate-700',
    val: 'text-slate-900',
    badge: 'text-slate-500',
  },
};

export const KPICard: React.FC<KPICardProps> = ({
  icon: Icon,
  value,
  label,
  code = 'TEL-METRIC',
  color = 'cyan',
  trend,
  onClick,
}) => {
  const c = colorMap[color];

  return (
    <motion.div
      className={`bg-white border border-slate-200 rounded-2xl shadow-saas-card p-4 ${onClick ? 'cursor-pointer' : ''}`}
      whileHover={onClick ? { scale: 1.02, y: -2, boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.25), 0 4px 6px -4px rgba(0, 0, 0, 0.1)' } : { y: -1 }}
      transition={{ duration: 0.15 }}
      onClick={onClick}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-1.5">
          <div className={`p-1.5 border ${c.iconBg}`}>
            <Icon className="w-3.5 h-3.5" />
          </div>
          <span className="font-sans text-[9px] uppercase tracking-widest text-slate-500">
            {code}
          </span>
        </div>
        {trend && (
          <span className={`font-sans text-[10px] font-bold ${
            trend.direction === 'up' ? 'text-crimson-alert' :
            trend.direction === 'down' ? 'text-acid-green' : 'text-slate-500'
          }`}>
            {trend.direction === 'up' ? '▲' : trend.direction === 'down' ? '▼' : '■'} {trend.text}
          </span>
        )}
      </div>

      <div className={`text-2xl font-sans font-bold tracking-tight ${c.val}`}>
        {value}
      </div>

      <div className="mt-1 flex items-center justify-between">
        <div className="text-[11px] font-sans uppercase tracking-wider text-slate-700">
          {label}
        </div>
        <div className="w-1.5 h-1.5 rounded-full bg-current opacity-80 animate-pulse" />
      </div>
    </motion.div>
  );
};
