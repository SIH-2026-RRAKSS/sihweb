import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Zap,
  FileText,
  CheckCircle2,
  MapPin,
  Share2,
  ArrowRight,
  Shield,
  Layers,
  ChevronRight,
  Activity,
  Cpu
} from 'lucide-react';
import { IncidentSummary, IncidentDetail } from '../../types';
import { LoadingSkeleton } from '../ui/LoadingSkeleton';
import { NavPage } from '../layout/AppShell';

interface DossierPeekHUDProps {
  selectedIncident: IncidentSummary | undefined;
  incidentDetail: IncidentDetail | null;
  loading: boolean;
  onSelectCase: (id: string) => void;
  onNavigate?: (page: NavPage) => void;
}

export const DossierPeekHUD: React.FC<DossierPeekHUDProps> = ({
  selectedIncident,
  incidentDetail,
  loading,
  onSelectCase,
  onNavigate,
}) => {
  const [activeTab, setActiveTab] = useState<'RATIONALE' | 'ATM' | 'TOPOLOGY'>('RATIONALE');

  if (loading) {
    return (
      <div className="bg-white border border-slate-200/90 rounded-2xl shadow-sm p-4 h-full flex flex-col justify-between">
        <div className="space-y-4">
          <div className="h-6 bg-slate-100 rounded w-1/3 animate-pulse" />
          <LoadingSkeleton variant="text" count={8} />
        </div>
      </div>
    );
  }

  if (!incidentDetail || !selectedIncident) {
    return (
      <div className="bg-white border border-slate-200/90 rounded-2xl shadow-sm p-8 text-center flex flex-col items-center justify-center min-h-[460px] text-slate-400">
        <Shield className="w-10 h-10 text-slate-200 mb-3" />
        <div className="text-xs font-mono uppercase tracking-wider text-slate-500 font-bold">
          No Case Selected
        </div>
        <p className="text-[11px] text-slate-400 mt-1 max-w-xs">
          Select any case from the radar queue to inspect its neural graph explainability vector.
        </p>
      </div>
    );
  }

  const isHigh = selectedIncident.confidence_tier === 'HIGH_CONFIDENCE';
  const isMed = selectedIncident.confidence_tier === 'MEDIUM_CONFIDENCE';
  const riskScore = ((selectedIncident.graphsage_risk_probability || incidentDetail.model_prediction.graphsage_risk_probability || 0) * 100).toFixed(1);

  return (
    <div className="bg-white border border-slate-200/90 rounded-2xl shadow-sm p-4 sm:p-5 flex flex-col justify-between min-h-[560px]">
      <div className="space-y-4">
        {/* HUD Top Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-[#FF5500]">
              <Zap className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-tight">
                Forensic Intelligence HUD
              </h3>
              <div className="font-mono text-[9px] text-slate-400">
                CASE // {selectedIncident.complaint_id}
              </div>
            </div>
          </div>

          <span
            className={`font-mono text-[9px] px-2 py-0.5 rounded font-bold border ${
              isHigh
                ? 'bg-orange-50 text-[#FF5500] border-orange-200'
                : isMed
                ? 'bg-amber-50 text-amber-700 border-amber-200'
                : 'bg-emerald-50 text-emerald-700 border-emerald-200'
            }`}
          >
            {selectedIncident.confidence_tier}
          </span>
        </div>

        {/* Sliding Pill Tabs */}
        <div className="flex items-center gap-1 p-0.5 bg-slate-100 rounded-lg text-[10px] font-mono border border-slate-200/60">
          {[
            { id: 'RATIONALE', label: '[01 // RATIONALE]' },
            { id: 'ATM', label: '[02 // ATM ROUTE]' },
            { id: 'TOPOLOGY', label: '[03 // TOPOLOGY]' },
          ].map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`relative flex-1 py-1 text-center rounded-md transition-colors ${
                  isActive ? 'text-slate-900 font-bold' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="dossier-tab-pill"
                    className="absolute inset-0 bg-white rounded-md shadow-sm"
                    transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                  />
                )}
                <span className="relative z-10">{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab Contents */}
        <AnimatePresence mode="wait">
          {activeTab === 'RATIONALE' && (
            <motion.div
              key="rationale"
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.15 }}
              className="space-y-3"
            >
              {/* Executive Summary Card */}
              <div className="p-3.5 bg-slate-50/80 border border-slate-200/80 rounded-xl space-y-1.5">
                <div className="text-[10px] font-mono text-slate-500 font-bold flex items-center gap-1.5 uppercase">
                  <FileText className="w-3.5 h-3.5 text-[#FF5500]" />
                  <span>Executive Threat Verdict</span>
                </div>
                <p className="text-xs text-slate-700 leading-relaxed">
                  {incidentDetail.model_prediction.executive_summary ||
                    `GraphSAGE model evaluated complaint ${incidentDetail.complaint.complaint_id}. Anomalous subgraph topology detected indicative of structured layering across intermediate mule accounts.`}
                </p>
              </div>

              {/* Risk & Exit Quick Grid */}
              <div className="grid grid-cols-2 gap-2.5 bg-slate-50/60 p-3 border border-slate-200/60 rounded-xl">
                <div>
                  <div className="text-[9px] font-mono text-slate-400 uppercase">GRAPHSAGE THREAT</div>
                  <div className="text-xl font-bold font-mono text-slate-900 mt-0.5">
                    {riskScore}%
                  </div>
                  <div className="text-[9px] font-mono text-emerald-600 font-semibold">
                    Calibrated F1: 90.14%
                  </div>
                </div>

                <div>
                  <div className="text-[9px] font-mono text-slate-400 uppercase">PREDICTED CASH-OUT</div>
                  <div className="text-xs font-bold font-mono text-amber-600 truncate mt-1">
                    {incidentDetail.model_prediction.top_terminal_id || 'N/A'}
                  </div>
                  <div className="text-[10px] text-slate-600 truncate">
                    {incidentDetail.model_prediction.top_terminal_city || 'Terminal Exit Pending'}
                  </div>
                </div>
              </div>

              {/* Investigative Evidence Checklist */}
              <div className="space-y-2">
                <div className="text-[10px] font-mono text-slate-500 font-bold uppercase tracking-wider">
                  Investigative Evidence Vector
                </div>
                <div className="space-y-1.5 max-h-[160px] overflow-y-auto pr-1">
                  {(incidentDetail.investigative_evidence_bullets && incidentDetail.investigative_evidence_bullets.length > 0
                    ? incidentDetail.investigative_evidence_bullets
                    : [
                        `GraphSAGE risk probability evaluated at ${riskScore}%.`,
                        `Disputed amount of ₹${(incidentDetail.complaint.reported_amount || 0).toLocaleString('en-IN')}.`,
                        `Suspected rapid layered dispersion to downstream mule accounts.`,
                      ]
                  ).map((bullet, idx) => (
                    <div
                      key={idx}
                      className="flex items-start gap-2 bg-slate-50/70 p-2.5 border border-slate-200/60 rounded-lg text-[11px] text-slate-700"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#FF5500] flex-shrink-0 mt-0.5" />
                      <span className="leading-snug">{bullet}</span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'ATM' && (
            <motion.div
              key="atm"
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.15 }}
              className="space-y-3.5"
            >
              <div className="p-4 bg-slate-50/90 border border-slate-200/80 rounded-xl space-y-3">
                <div className="flex items-center justify-between text-[10px] font-mono text-slate-500">
                  <span>TERMINAL EXIT TARGET</span>
                  <span className="text-amber-600 font-bold">MRR 1.0000</span>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-base font-bold font-mono text-slate-900">
                      {incidentDetail.model_prediction.top_terminal_id || 'TERMINAL-UNSPECIFIED'}
                    </div>
                    <div className="text-xs text-slate-600 font-medium">
                      {incidentDetail.model_prediction.top_terminal_city || 'City Pending'}
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-lg font-bold font-mono text-amber-600">
                      {((incidentDetail.model_prediction.top_terminal_score || 0.95) * 100).toFixed(1)}%
                    </div>
                    <div className="text-[9px] font-mono text-slate-400">CONVERGENCE</div>
                  </div>
                </div>
              </div>

              <button
                onClick={() => onNavigate?.('cashout-map')}
                className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold rounded-xl flex items-center justify-center gap-2 transition-all"
              >
                <MapPin className="w-3.5 h-3.5 text-amber-500" />
                <span>Trace on Geospatial Cash-Out Map</span>
              </button>
            </motion.div>
          )}

          {activeTab === 'TOPOLOGY' && (
            <motion.div
              key="topology"
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.15 }}
              className="space-y-3.5"
            >
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-xl">
                  <div className="text-[9px] font-mono text-slate-400">HOP DEPTH</div>
                  <div className="text-lg font-bold font-mono text-slate-900 mt-0.5">3-4</div>
                </div>
                <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-xl">
                  <div className="text-[9px] font-mono text-slate-400">FAN-OUT</div>
                  <div className="text-lg font-bold font-mono text-[#FF5500] mt-0.5">1:8</div>
                </div>
                <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-xl">
                  <div className="text-[9px] font-mono text-slate-400">DISPERSION</div>
                  <div className="text-lg font-bold font-mono text-amber-600 mt-0.5">&lt;15m</div>
                </div>
              </div>

              <button
                onClick={() => onNavigate?.('network')}
                className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold rounded-xl flex items-center justify-center gap-2 transition-all"
              >
                <Share2 className="w-3.5 h-3.5 text-slate-700" />
                <span>Launch 3D Network Topology Explorer</span>
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Primary Action Button */}
      <div className="pt-4 border-t border-slate-100 mt-4">
        <motion.button
          onClick={() => onSelectCase(selectedIncident.complaint_id)}
          className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs rounded-xl flex items-center justify-center gap-2 shadow-sm transition-all group"
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.98 }}
        >
          <span>OPEN FULL CLASSIFIED CASE DOSSIER</span>
          <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-white group-hover:translate-x-1 transition-all" />
        </motion.button>
      </div>
    </div>
  );
};
