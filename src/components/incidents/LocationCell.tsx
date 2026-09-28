import React from 'react';
import { MapPin, ArrowUpRight } from 'lucide-react';

interface LocationCellProps {
  district?: string;
  state?: string;
  predictedExitCity?: string;
  predictedExitTerminalId?: string;
  showPredictedExit?: boolean;
  className?: string;
}

export const LocationCell: React.FC<LocationCellProps> = ({
  district,
  state,
  predictedExitCity,
  predictedExitTerminalId,
  showPredictedExit = true,
  className = '',
}) => {
  const hasJurisdiction = !!(district || state);
  const jurisdictionText = [district, state].filter(Boolean).join(', ');

  const hasPredictedExit =
    showPredictedExit &&
    predictedExitCity &&
    predictedExitCity !== 'NONE' &&
    predictedExitCity !== 'No Exit Convergence';

  return (
    <div className={`flex flex-col gap-0.5 text-[10px] leading-tight ${className}`}>
      {hasJurisdiction && (
        <div className="flex items-center gap-1 text-slate-600">
          <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
          <span className="text-slate-400 font-medium">Jurisdiction:</span>
          <span className="font-semibold text-slate-700 truncate">{jurisdictionText}</span>
        </div>
      )}

      {hasPredictedExit && (
        <div className="flex items-center gap-1 text-slate-500 font-mono">
          <ArrowUpRight className="w-3 h-3 text-slate-400 shrink-0" />
          <span className="text-slate-400 font-sans">Predicted Exit:</span>
          <span className="text-slate-700 font-semibold truncate">
            {predictedExitCity}
            {predictedExitTerminalId && predictedExitTerminalId !== 'NONE' && (
              <span className="text-slate-400 font-normal ml-1">({predictedExitTerminalId})</span>
            )}
          </span>
        </div>
      )}
    </div>
  );
};
