import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Layers, Info } from 'lucide-react';

interface GraphLegendProps {
  className?: string;
  defaultExpanded?: boolean;
}

export const GraphLegend: React.FC<GraphLegendProps> = ({
  className = '',
  defaultExpanded = true,
}) => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  return (
    <div
      className={`bg-slate-900/90 backdrop-blur-md border border-slate-700/70 text-slate-200 rounded-lg shadow-2xl transition-all duration-200 select-none z-20 ${className}`}
      style={{ maxWidth: '280px' }}
    >
      {/* Header with Toggle */}
      <div
        onClick={() => setIsExpanded(!isExpanded)}
        className="px-3 py-2 flex items-center justify-between cursor-pointer hover:bg-white/5 border-b border-slate-700/50"
      >
        <div className="flex items-center gap-1.5 text-[11px] font-bold tracking-wide font-sans text-slate-100">
          <Layers className="w-3.5 h-3.5 text-[#FF5500]" />
          <span>GRAPH SYMBOLOGY</span>
        </div>
        <button
          className="text-slate-400 hover:text-white p-0.5"
          title={isExpanded ? 'Collapse Legend' : 'Expand Legend'}
        >
          {isExpanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronUp className="w-3.5 h-3.5" />}
        </button>
      </div>

      {isExpanded && (
        <div className="p-3 space-y-3 text-[10px] font-sans">
          {/* Node Shapes (Roles) */}
          <div className="space-y-1.5">
            <div className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">
              Node Role (Shape)
            </div>
            <div className="grid grid-cols-1 gap-1">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-slate-300 border border-slate-400 shrink-0" />
                <span className="text-slate-300 font-medium">Sphere: Account Node</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-sm bg-amber-400 border border-amber-500 shrink-0" />
                <span className="text-slate-300 font-medium">Cube: ATM Terminal</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-3 rounded-xs bg-slate-400 border border-slate-500 shrink-0" />
                <span className="text-slate-300 font-medium">Cylinder: Bank Clearing</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-sky-400 border border-sky-300 shrink-0" />
                <span className="text-slate-300 font-medium">Sky-Blue: Victim Origin</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full border-2 border-[#FF5500] shrink-0 flex items-center justify-center">
                  <span className="w-1 h-1 rounded-full bg-[#FF5500]" />
                </span>
                <span className="text-[#FF5500] font-bold font-mono">Orange Ring: Seed Entity</span>
              </div>
            </div>
          </div>

          {/* Risk Tiers (Colors) */}
          <div className="space-y-1.5 border-t border-slate-700/50 pt-2">
            <div className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">
              Risk Tier (Color)
            </div>
            <div className="grid grid-cols-1 gap-1">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                <span className="text-slate-300 font-medium">Normal (&lt; 40%)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0" />
                <span className="text-slate-300 font-medium">Suspicious (40% - 70%)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-red-500 shrink-0" />
                <span className="text-red-400 font-bold">Critical (≥ 70%)</span>
              </div>
            </div>
          </div>

          {/* Edges & Paths */}
          <div className="space-y-1.5 border-t border-slate-700/50 pt-2">
            <div className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">
              Transactions (Edges)
            </div>
            <div className="space-y-1 text-slate-300">
              <div className="flex items-center gap-2">
                <span className="w-4 h-0.5 bg-slate-500 shrink-0" />
                <span>Directional particle flow [log(₹)]</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-4 h-1 bg-[#FF5500] rounded-full shrink-0 shadow-sm" />
                <span className="text-[#FF5500] font-bold">Predicted Terminal Exit</span>
              </div>
            </div>
          </div>

          <div className="border-t border-slate-700/40 pt-1 text-[9px] text-slate-400 flex items-center gap-1">
            <Info className="w-3 h-3 text-slate-400 shrink-0" />
            <span>Accessible: Shape & text indicate role.</span>
          </div>
        </div>
      )}
    </div>
  );
};
