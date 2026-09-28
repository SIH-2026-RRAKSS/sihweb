import React from 'react';
import { ConfidenceTier } from '../../types';
import { TIER_CONFIG, getTierLabel } from './incidentConstants';

interface TierBadgeProps {
  tier: ConfidenceTier | string;
  size?: 'sm' | 'md';
  className?: string;
}

export const TierBadge: React.FC<TierBadgeProps> = ({
  tier,
  size = 'md',
  className = '',
}) => {
  const normalizedTier = (
    tier === 'HIGH_CONFIDENCE' || tier === 'CRITICAL' || tier === 'Critical'
      ? 'HIGH_CONFIDENCE'
      : tier === 'MEDIUM_CONFIDENCE' || tier === 'SUSPICIOUS' || tier === 'Suspicious'
      ? 'MEDIUM_CONFIDENCE'
      : tier === 'NORMAL' || tier === 'CLEARED' || tier === 'Normal'
      ? 'NORMAL'
      : 'UNCLASSIFIED'
  ) as ConfidenceTier;

  const config = TIER_CONFIG[normalizedTier] || TIER_CONFIG.UNCLASSIFIED;
  const label = getTierLabel(tier);

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-sans font-bold border rounded-md select-none ${config.badgeClass} ${
        size === 'sm' ? 'text-[10px] px-1.5 py-0.5' : 'text-[10px] px-2 py-0.5'
      } ${className}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${config.dotClass}`} />
      <span>{label}</span>
    </span>
  );
};
