import React from 'react';
import { formatINR } from '../../utils/formatINR';

interface AmountCellProps {
  amount: number;
  dataset?: string;
  compact?: boolean;
  className?: string;
}

export const formatIncidentAmount = (amount: number, dataset?: string, compact: boolean = false): string => {
  if (dataset === 'IBM_B') {
    if (compact) {
      if (amount >= 1000000) return `$${(amount / 1000000).toFixed(2)}M`;
      if (amount >= 1000) return `$${(amount / 1000).toFixed(2)}K`;
    }
    return `$${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }

  if (dataset === 'ELLIPTIC_C') {
    return `₿ ${amount.toFixed(4)} BTC`;
  }

  // Row-level INR amounts strictly use full formatINR grouping (no compact 4.03L)
  return formatINR(amount);
};

export const AmountCell: React.FC<AmountCellProps> = ({
  amount,
  dataset,
  compact = false,
  className = '',
}) => {
  const formatted = formatIncidentAmount(amount, dataset, compact);

  return (
    <span className={`font-mono font-bold text-slate-900 text-xs tracking-tight ${className}`}>
      {formatted}
    </span>
  );
};
