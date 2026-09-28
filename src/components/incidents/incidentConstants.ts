import { ConfidenceTier } from '../../types';

export const RISK_THRESHOLDS = {
  CRITICAL: 0.70,   // >= 70% is Critical (High Risk)
  SUSPICIOUS: 0.40, // >= 40% and < 70% is Suspicious (Medium Risk)
} as const;

export type UnifiedTierLabel = 'Critical' | 'Suspicious' | 'Normal' | 'Unclassified';

export interface TierConfig {
  label: UnifiedTierLabel;
  filterKey: string;
  badgeClass: string;
  dotClass: string;
  barColor: string;
  textColor: string;
}

export const TIER_CONFIG: Record<ConfidenceTier, TierConfig> = {
  HIGH_CONFIDENCE: {
    label: 'Critical',
    filterKey: 'HIGH_CONFIDENCE',
    badgeClass: 'bg-red-50 text-red-700 border-red-200',
    dotClass: 'bg-red-500',
    barColor: 'bg-red-500',
    textColor: 'text-red-700',
  },
  MEDIUM_CONFIDENCE: {
    label: 'Suspicious',
    filterKey: 'MEDIUM_CONFIDENCE',
    badgeClass: 'bg-amber-50 text-amber-700 border-amber-200',
    dotClass: 'bg-amber-500',
    barColor: 'bg-amber-500',
    textColor: 'text-amber-700',
  },
  NORMAL: {
    label: 'Normal',
    filterKey: 'NORMAL',
    badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    dotClass: 'bg-emerald-500',
    barColor: 'bg-emerald-500',
    textColor: 'text-emerald-700',
  },
  UNCLASSIFIED: {
    label: 'Unclassified',
    filterKey: 'UNCLASSIFIED',
    badgeClass: 'bg-slate-50 text-slate-600 border-slate-200',
    dotClass: 'bg-slate-400',
    barColor: 'bg-slate-400',
    textColor: 'text-slate-600',
  },
};

/**
 * Standardize backend confidence tier to unified label
 */
export const getTierLabel = (tier?: string | ConfidenceTier | null): UnifiedTierLabel => {
  if (!tier) return 'Unclassified';
  const upper = tier.toUpperCase();
  if (upper === 'HIGH_CONFIDENCE' || upper === 'CRITICAL') return 'Critical';
  if (upper === 'MEDIUM_CONFIDENCE' || upper === 'SUSPICIOUS') return 'Suspicious';
  if (upper === 'NORMAL' || upper === 'CLEARED') return 'Normal';
  return 'Unclassified';
};

/**
 * Derives tier enum from numerical risk probability based on unified thresholds
 */
export const getTierFromScore = (probability: number): ConfidenceTier => {
  if (probability >= RISK_THRESHOLDS.CRITICAL) return 'HIGH_CONFIDENCE';
  if (probability >= RISK_THRESHOLDS.SUSPICIOUS) return 'MEDIUM_CONFIDENCE';
  return 'NORMAL';
};

/**
 * Shared risk styling based on uniform thresholds
 */
export const getRiskStyle = (probability: number) => {
  if (probability >= RISK_THRESHOLDS.CRITICAL) {
    return {
      textColor: 'text-red-600',
      barColor: 'bg-red-500',
      tier: 'HIGH_CONFIDENCE' as ConfidenceTier,
      label: 'Critical' as UnifiedTierLabel,
    };
  }
  if (probability >= RISK_THRESHOLDS.SUSPICIOUS) {
    return {
      textColor: 'text-amber-600',
      barColor: 'bg-amber-500',
      tier: 'MEDIUM_CONFIDENCE' as ConfidenceTier,
      label: 'Suspicious' as UnifiedTierLabel,
    };
  }
  return {
    textColor: 'text-emerald-600',
    barColor: 'bg-emerald-500',
    tier: 'NORMAL' as ConfidenceTier,
    label: 'Normal' as UnifiedTierLabel,
  };
};

/**
 * Standard filter tabs with unified Critical / Suspicious / Normal vocabulary
 */
export const FILTER_TABS = [
  { id: 'ALL', label: 'ALL' },
  { id: 'HIGH_CONFIDENCE', label: 'CRITICAL' },
  { id: 'MEDIUM_CONFIDENCE', label: 'SUSPICIOUS' },
  { id: 'NORMAL', label: 'NORMAL' },
] as const;
