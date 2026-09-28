import React from 'react';

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

  // Default Indian Rupee (INR)
  if (compact) {
    if (amount >= 10000000) return `₹${(amount / 10000000).toFixed(2)}Cr`;
    if (amount >= 100000) return `₹${(amount / 100000).toFixed(2)}L`;
  }
  return `₹${amount.toLocaleString('en-IN')}`;
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
