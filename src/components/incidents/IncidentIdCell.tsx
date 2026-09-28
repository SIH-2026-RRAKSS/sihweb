import React from 'react';

interface IncidentIdCellProps {
  complaintId: string;
  interceptedInFlight?: boolean;
  className?: string;
}

export const IncidentIdCell: React.FC<IncidentIdCellProps> = ({
  complaintId,
  interceptedInFlight = false,
  className = '',
}) => {
  return (
    <div className={`flex flex-col gap-0.5 ${className}`}>
      <span className="text-[#FF5500] font-mono font-bold text-xs tracking-tight">
        {complaintId}
      </span>
      {interceptedInFlight && (
        <span className="text-[10px] bg-slate-100 text-slate-700 border border-slate-200 px-1.5 py-0.2 rounded font-bold w-fit tracking-wide">
          In-Flight
        </span>
      )}
    </div>
  );
};
