import React from 'react';

export const getIntakeOriginLabel = (dataset?: string): string => {
  if (dataset === 'IBM_B') return 'MULTI-BANK';
  if (dataset === 'ELLIPTIC_C') return 'BITCOIN';
  return 'CITIZEN';
};

interface IntakeOriginChipProps {
  dataset?: string;
  label?: string;
  className?: string;
}

export const IntakeOriginChip: React.FC<IntakeOriginChipProps> = ({
  dataset,
  label,
  className = '',
}) => {
  const displayLabel = label || getIntakeOriginLabel(dataset);

  return (
    <span
      className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold border bg-slate-100 text-slate-700 border-slate-200 tracking-wider ${className}`}
    >
      {displayLabel}
    </span>
  );
};
