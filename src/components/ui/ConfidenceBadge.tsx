import React from 'react';
import { ShieldAlert, AlertTriangle, CheckCircle, HelpCircle } from 'lucide-react';
import type { ConfidenceTier } from '../../types';

interface ConfidenceBadgeProps {
  tier: ConfidenceTier;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
}

const tierConfig = {
  HIGH_CONFIDENCE: {
    label: 'CRITICAL THREAT // HIGH CONFIDENCE',
    shortLabel: 'HIGH CONFIDENCE',
    icon: ShieldAlert,
    className: 'tag-label tag-red shadow-neon-red',
    dot: 'bg-crimson-alert animate-ping',
  },
  MEDIUM_CONFIDENCE: {
    label: 'SUSPICIOUS RING // MEDIUM CONFIDENCE',
    shortLabel: 'MEDIUM CONFIDENCE',
    icon: AlertTriangle,
    className: 'tag-label tag-amber shadow-neon-amber',
    dot: 'bg-amber-cash',
  },
  NORMAL: {
    label: 'CLEARED // NORMAL ACTIVITY',
    shortLabel: 'NORMAL',
    icon: CheckCircle,
    className: 'tag-label tag-green shadow-neon-green',
    dot: 'bg-acid-green',
  },
  UNCLASSIFIED: {
    label: 'UNCLASSIFIED ENTITY',
    shortLabel: 'UNCLASSIFIED',
    icon: HelpCircle,
    className: 'tag-label bg-slate-800 text-slate-400 border-slate-700',
    dot: 'bg-slate-500',
  },
};

const sizeMap = {
  sm: { text: 'text-[9px]', icon: 'w-2.5 h-2.5', px: 'px-1.5 py-0.5' },
  md: { text: 'text-[10px]', icon: 'w-3 h-3', px: 'px-2.5 py-1' },
  lg: { text: 'text-xs', icon: 'w-3.5 h-3.5', px: 'px-3 py-1.5' },
};

export const ConfidenceBadge: React.FC<ConfidenceBadgeProps> = ({
  tier,
  size = 'md',
  showIcon = true,
}) => {
  const config = tierConfig[tier] || tierConfig.UNCLASSIFIED;
  const s = sizeMap[size];
  const Icon = config.icon;

  return (
    <span className={`inline-flex items-center gap-1.5 font-mono ${config.className} ${s.text} ${s.px}`}>
      <span className={`w-1.5 h-1.5 rounded-none ${config.dot}`} />
      {showIcon && <Icon className={s.icon} />}
      <span>{size === 'sm' ? config.shortLabel : config.label}</span>
    </span>
  );
};
