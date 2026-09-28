import React from 'react';
import { getRiskStyle } from './incidentConstants';

interface RiskBarProps {
  probability: number;
  className?: string;
  showBar?: boolean;
}

export const RiskBar: React.FC<RiskBarProps> = ({
  probability,
  className = '',
  showBar = true,
}) => {
  const percent = Math.max(0, Math.min(100, probability * 100));
  const style = getRiskStyle(probability);

  return (
    <div className={`flex flex-col gap-1 ${className}`}>
      <div className="flex items-center justify-between gap-1.5 font-mono">
        <span className={`font-bold text-xs ${style.textColor}`}>
          {percent.toFixed(1)}%
        </span>
      </div>
      {showBar && (
        <div className="w-full min-w-[48px] max-w-[64px] bg-slate-100 h-1.5 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-300 ${style.barColor}`}
            style={{ width: `${percent}%` }}
          />
        </div>
      )}
    </div>
  );
};
