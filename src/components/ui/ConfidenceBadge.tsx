import React from 'react';
import { ShieldAlert, AlertTriangle, CheckCircle, HelpCircle } from 'lucide-react';
import type { ConfidenceTier } from '../../types';
import { TIER_CONFIG, getTierLabel } from '../incidents/incidentConstants';

interface ConfidenceBadgeProps {
  tier: ConfidenceTier | string;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
}

export const ConfidenceBadge: React.FC<ConfidenceBadgeProps> = ({
  tier,
  size = 'md',
  showIcon = true,
}) => {
  const normalizedTier = (
    tier === 'HIGH_CONFIDENCE' || tier === 'CRITICAL'
      ? 'HIGH_CONFIDENCE'
      : tier === 'MEDIUM_CONFIDENCE' || tier === 'SUSPICIOUS'
      ? 'MEDIUM_CONFIDENCE'
      : tier === 'NORMAL' || tier === 'CLEARED'
      ? 'NORMAL'
      : 'UNCLASSIFIED'
  ) as ConfidenceTier;

  const config = TIER_CONFIG[normalizedTier] || TIER_CONFIG.UNCLASSIFIED;
  const label = getTierLabel(tier);

  const Icon =
    normalizedTier === 'HIGH_CONFIDENCE'
      ? ShieldAlert
      : normalizedTier === 'MEDIUM_CONFIDENCE'
      ? AlertTriangle
      : normalizedTier === 'NORMAL'
      ? CheckCircle
      : HelpCircle;

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-sans font-bold border rounded-md select-none ${config.badgeClass} ${
        size === 'lg' ? 'text-xs px-2.5 py-1' : 'text-[10px] px-2 py-0.5'
      }`}
    >
      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${config.dotClass}`} />
      {showIcon && <Icon className="w-3 h-3 shrink-0" />}
      <span>{label}</span>
    </span>
  );
};
