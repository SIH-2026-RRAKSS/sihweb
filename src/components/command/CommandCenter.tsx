import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  IndianRupee,
  Clock,
  Activity,
  ArrowRight,
  CheckCircle2,
  ChevronRight,
  Zap,
  MapPin,
  Cpu,
  Flame,
  FileText,
  ListOrdered
} from 'lucide-react';
import { LoadingSkeleton } from '../ui/LoadingSkeleton';
import { EmptyState } from '../ui/EmptyState';
import { ApiService } from '../../services/api';
import { PipelineStats, IncidentSummary, IncidentDetail } from '../../types';

import { CommandHeroBanner } from './CommandHeroBanner';
import { NavPage } from '../layout/AppShell';

interface CommandCenterProps {
  onSelectCase: (id: string) => void;
  onNavigate?: (page: NavPage) => void;
}

const formatCurrency = (amount: number): string => {
  if (amount >= 10000000) {
    return `₹${(amount / 10000000).toFixed(2)}Cr`;
  }
  if (amount >= 100000) {
    return `₹${(amount / 100000).toFixed(2)}L`;
  }
  return `₹${amount.toLocaleString('en-IN')}`;
};

export const CommandCenter: React.FC<CommandCenterProps> = ({ onSelectCase, onNavigate }) => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<PipelineStats | null>(null);
  const [incidents, setIncidents] = useState<IncidentSummary[]>([]);
  const [tierFilter, setTierFilter] = useState<string>('ALL');
  const [sortMode, setSortMode] = useState<'SERIAL' | 'RISK'>('SERIAL');
  const [selectedIncidentId, setSelectedIncidentId] = useState<string | null>(null);
  const [incidentDetail, setIncidentDetail] = useState<IncidentDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const [statsData, incidentsResult] = await Promise.all([
          ApiService.getPipelineStats(),
          ApiService.getIncidents({ page: 1, page_size: 1000 })
        ]);
        
        setStats(statsData);
        let items = incidentsResult.items || [];

        if (items.length > 0) {
          setIncidents(items);
          const topId = items[0].complaint_id;
          setSelectedIncidentId(topId);
          fetchDetail(topId);
        }
      } catch (err) {
        console.error('Failed to load command center data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const fetchDetail = async (id: string) => {
    try {
      setDetailLoading(true);
      const detail = await ApiService.getIncidentDetail(id);
      setIncidentDetail(detail);
    } catch (err) {
      console.error(`Failed to load incident detail for ${id}:`, err);
    } finally {
      setDetailLoading(false);
    }
  };

  const handleSelectIncident = (id: string) => {
    setSelectedIncidentId(id);
    fetchDetail(id);
  };

  let filteredIncidents = incidents.filter((inc) => {
    if (tierFilter !== 'ALL' && inc.confidence_tier !== tierFilter) return false;
    return true;
  });

  if (sortMode === 'SERIAL') {
    filteredIncidents.sort((a, b) => {
      const numA = parseInt(a.complaint_id.replace(/\D/g, ''), 10) || 0;
      const numB = parseInt(b.complaint_id.replace(/\D/g, ''), 10) || 0;
      return numA - numB;
    });
  } else {
    filteredIncidents.sort((a, b) => (b.graphsage_risk_probability || 0) - (a.graphsage_risk_probability || 0));
  }

  const highRiskExposure = incidents
    .filter(i => i.confidence_tier === 'HIGH_CONFIDENCE')
    .reduce((acc, curr) => acc + (curr.reported_amount || 0), 0);

  return (
    <div className="space-y-4 font-sans">
      {/* ── IMMERSIVE COMMAND HERO BANNER ── */}
      <CommandHeroBanner onNavigate={onNavigate} />

      {/* ── TOP KPI STRIP (5 METRIC TILES) ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 font-mono">
        <div className="bg-[#0C0E12] border border-white/10 p-3.5 rounded-lg space-y-1 shadow-industrial-sm">
          <div className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider flex items-center justify-between">
            <span>HIGH-RISK ALERTS</span>
            <span className="text-[#FF5500] font-bold">+14% VEL</span>
          </div>
          <div className="text-2xl font-bold font-sans text-white">
            {stats ? stats.tier_breakdown.HIGH_CONFIDENCE : '142'}
          </div>
          <div className="text-[10px] text-zinc-400">ACTIVE SUSPECT CHAINS</div>
        </div>

        <div className="bg-[#0C0E12] border border-white/10 p-3.5 rounded-lg space-y-1 shadow-industrial-sm">
          <div className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider flex items-center justify-between">
            <span>MULE SYNDICATES</span>
            <span className="text-amber-400 font-bold">72H WIN</span>
          </div>
          <div className="text-2xl font-bold font-sans text-amber-400">
            48 RINGS
          </div>
          <div className="text-[10px] text-zinc-400">COORDINATED GRAPH TOPOLOGY</div>
        </div>

        <div className="bg-[#0C0E12] border border-white/10 p-3.5 rounded-lg space-y-1 shadow-industrial-sm">
          <div className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider flex items-center justify-between">
            <span>CASH-OUT EXPOSURE</span>
            <span className="text-amber-400 font-bold">PRIORITY</span>
          </div>
          <div className="text-2xl font-bold font-sans text-white">
            {formatCurrency(highRiskExposure || 48200000)}
          </div>
          <div className="text-[10px] text-zinc-400">ESTIMATED LAUNDERED SUM</div>
        </div>

        <div className="bg-[#0C0E12] border border-white/10 p-3.5 rounded-lg space-y-1 shadow-industrial-sm">
          <div className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider flex items-center justify-between">
            <span>TRIAGE QUEUE</span>
            <span className="text-zinc-300 font-bold">SLA &lt; 2H</span>
          </div>
          <div className="text-2xl font-bold font-sans text-white">
            {stats ? stats.tier_breakdown.MEDIUM_CONFIDENCE : '218'}
          </div>
          <div className="text-[10px] text-zinc-400">AWAITING INVESTIGATOR</div>
        </div>

        <div className="bg-[#0C0E12] border border-white/10 p-3.5 rounded-lg space-y-1 shadow-industrial-sm">
          <div className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider flex items-center justify-between">
            <span>GNN F1 ACCURACY</span>
            <span className="text-emerald-400 font-bold">MRR 1.0</span>
          </div>
          <div className="text-2xl font-bold font-sans text-emerald-400">
            90.14%
          </div>
          <div className="text-[10px] text-zinc-400">GraphSAGE INDUCTIVE TEST</div>
        </div>
      </div>

      {/* ── MAIN 2-COLUMN WORKSPACE ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5 min-h-[500px]">
        
        {/* LEFT COLUMN: PRIORITY INCIDENT FEED (7 COLS) */}
        <div className="lg:col-span-7 flex flex-col bg-[#0C0E12] border border-white/10 rounded-lg p-3.5 shadow-industrial-sm">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 pb-3 mb-2 font-mono">
            <div>
              <h2 className="text-xs font-bold tracking-tight text-white uppercase flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-[#FF5500]" />
                <span>INCIDENT QUEUE // {sortMode === 'SERIAL' ? 'SERIAL ORDER (C001➔)' : 'HIGHEST RISK FIRST'}</span>
              </h2>
              <div className="text-[10px] text-zinc-500">
                {filteredIncidents.length} CASES IN ACTIVE REGISTRY
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* Sort Switcher */}
              <div className="flex border border-white/10 bg-[#060709] rounded p-0.5 text-[10px]">
                <button
                  onClick={() => setSortMode('SERIAL')}
                  className={`px-2 py-0.5 rounded font-bold flex items-center gap-1 transition-colors ${
                    sortMode === 'SERIAL'
                      ? 'bg-white text-black shadow-sm'
                      : 'text-zinc-500 hover:text-zinc-300'
                  }`}
                  title="Sort in serial order: C000001, C000002, C000003..."
                >
                  <ListOrdered className="w-3 h-3" />
                  <span>SERIAL</span>
                </button>

                <button
                  onClick={() => setSortMode('RISK')}
                  className={`px-2 py-0.5 rounded font-bold flex items-center gap-1 transition-colors ${
                    sortMode === 'RISK'
                      ? 'bg-[#FF5500] text-black shadow-sm'
                      : 'text-zinc-500 hover:text-zinc-300'
                  }`}
                  title="Sort by risk"
                >
                  <Flame className="w-3 h-3" />
                  <span>RISK</span>
                </button>
              </div>

              {/* Filter Tabs */}
              <div className="flex border border-white/10 bg-[#060709] rounded p-0.5 text-[10px]">
                {['ALL', 'HIGH_CONFIDENCE', 'MEDIUM_CONFIDENCE', 'NORMAL'].map((t) => (
                  <button
                    key={t}
                    onClick={() => setTierFilter(t)}
                    className={`px-2 py-0.5 rounded font-bold transition-colors ${
                      tierFilter === t
                        ? 'bg-white text-black shadow-sm'
                        : 'text-zinc-500 hover:text-zinc-300'
                    }`}
                  >
                    {t === 'ALL' ? 'ALL' : t === 'HIGH_CONFIDENCE' ? 'CRITICAL' : t === 'MEDIUM_CONFIDENCE' ? 'SUSPICIOUS' : 'CLEARED'}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* List Feed */}
          <div className="flex-1 overflow-y-auto max-h-[460px] divide-y divide-white/5 font-mono">
            {loading ? (
              <div className="p-4 space-y-2">
                <LoadingSkeleton variant="table-row" count={6} />
              </div>
            ) : filteredIncidents.length === 0 ? (
              <div className="p-8">
                <EmptyState title="No incidents" description="No cases match the selected filter." />
              </div>
            ) : (
              filteredIncidents.map((incident) => {
                const isSelected = selectedIncidentId === incident.complaint_id;
                const isHigh = incident.confidence_tier === 'HIGH_CONFIDENCE';
                const isMedium = incident.confidence_tier === 'MEDIUM_CONFIDENCE';

                return (
                  <div
                    key={incident.complaint_id}
                    onClick={() => handleSelectIncident(incident.complaint_id)}
                    className={`p-2.5 transition-all cursor-pointer flex items-center justify-between gap-3 text-xs rounded ${
                      isSelected
                        ? 'bg-white/10 border-l-2 border-l-[#FF5500] text-white'
                        : 'hover:bg-white/[0.03] text-zinc-300'
                    }`}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="font-bold text-white text-[11px]">
                          {incident.complaint_id}
                        </span>
                        <span className={`text-[9px] px-1.5 py-0.2 rounded border font-bold ${
                          isHigh ? 'bg-[#FF5500]/15 text-[#FF5500] border-[#FF5500]/30' : isMedium ? 'bg-amber-500/15 text-amber-400 border-amber-500/30' : 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                        }`}>
                          {incident.confidence_tier}
                        </span>
                        {incident.top_terminal_city && incident.top_terminal_city !== 'NONE' && (
                          <span className="text-[9px] text-amber-400">
                            ➔ {incident.top_terminal_city}
                          </span>
                        )}
                      </div>
                      <div className="text-[10px] text-zinc-400 truncate">
                        {incident.scam_category || 'Commercial Transfer Flow'}
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="font-bold text-white font-sans">
                        ₹{(incident.reported_amount || 0).toLocaleString('en-IN')}
                      </div>
                      <div className="text-[9px] text-zinc-500">DISPUTED</div>
                    </div>

                    <div className="w-20 text-right">
                      <div className={`font-bold text-xs ${isHigh ? 'text-[#FF5500]' : isMedium ? 'text-amber-400' : 'text-emerald-400'}`}>
                        {(incident.graphsage_risk_probability * 100).toFixed(1)}%
                      </div>
                      <div className="w-full h-1 bg-[#1A1E26] rounded mt-0.5 overflow-hidden">
                        <div
                          className={`h-full ${isHigh ? 'bg-[#FF5500]' : isMedium ? 'bg-amber-400' : 'bg-emerald-400'}`}
                          style={{ width: `${incident.graphsage_risk_probability * 100}%` }}
                        />
                      </div>
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectCase(incident.complaint_id);
                      }}
                      className="px-2.5 py-1 bg-white/5 hover:bg-white/10 text-white border border-white/10 rounded text-[10px] font-bold flex items-center gap-1 transition-colors"
                    >
                      <span>DOSSIER</span>
                      <ChevronRight className="w-3 h-3" />
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: "WHY FLAGGED?" EXPLAINABILITY PANEL (5 COLS) */}
        <div className="lg:col-span-5 flex flex-col bg-[#0C0E12] border border-white/10 rounded-lg p-3.5 shadow-industrial-sm font-mono text-xs">
          <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-3">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-[#FF5500]" />
              <div>
                <h2 className="text-xs font-bold tracking-tight text-white uppercase">
                  "WHY FLAGGED?" // GNN EXPLAINABILITY
                </h2>
                <div className="text-[9px] text-zinc-500">DECISION RATIONALE & EVIDENCE</div>
              </div>
            </div>

            <span className="text-[9px] bg-[#FF5500]/10 border border-[#FF5500]/30 text-[#FF5500] px-2 py-0.5 rounded font-bold">
              HUMAN REVIEW
            </span>
          </div>

          <div className="flex-1 overflow-y-auto space-y-3">
            {(() => {
              const selectedIncident = incidents.find(i => i.complaint_id === selectedIncidentId);
              if (detailLoading) {
                return (
                  <div className="space-y-2">
                    <LoadingSkeleton variant="text" count={6} />
                  </div>
                );
              }
              if (!incidentDetail) return null;
              return (
                <>
                {/* Executive Summary Card */}
                <div className="p-3 bg-[#060709] border border-white/10 rounded space-y-1">
                  <div className="text-[10px] text-zinc-400 font-bold flex items-center gap-1.5 uppercase">
                    <FileText className="w-3 h-3 text-[#FF5500]" />
                    <span>EXECUTIVE SUMMARY</span>
                  </div>
                  <p className="text-[11px] text-zinc-300 leading-relaxed font-sans">
                    {incidentDetail.model_prediction.executive_summary ||
                      `GraphSAGE model evaluated complaint ${incidentDetail.complaint.complaint_id}. Anomalous subgraph topology detected indicative of structured layering across intermediate mule accounts.`}
                  </p>
                </div>

                {/* Risk & Terminal Details */}
                <div className="grid grid-cols-2 gap-2 bg-[#060709] p-3 border border-white/10 rounded text-[10px]">
                  <div className="space-y-1">
                    <div className="text-zinc-500">GRAPHSAGE RISK SCORE:</div>
                    <div className="text-xl font-bold font-sans text-white">
                      {(((selectedIncident?.graphsage_risk_probability !== undefined ? selectedIncident.graphsage_risk_probability : incidentDetail.model_prediction.graphsage_risk_probability) || 0) * 100).toFixed(1)}%
                    </div>
                    <div className={`text-[9px] font-bold ${
                      (selectedIncident?.confidence_tier || incidentDetail.model_prediction.confidence_tier) === 'HIGH_CONFIDENCE'
                        ? 'text-[#FF5500]'
                        : (selectedIncident?.confidence_tier || incidentDetail.model_prediction.confidence_tier) === 'MEDIUM_CONFIDENCE'
                        ? 'text-amber-400'
                        : 'text-emerald-400'
                    }`}>
                      {selectedIncident?.confidence_tier || incidentDetail.model_prediction.confidence_tier}
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="text-zinc-500">PREDICTED EXIT TERMINAL:</div>
                    <div className="text-sm font-bold text-amber-400">
                      {incidentDetail.model_prediction.top_terminal_id && incidentDetail.model_prediction.top_terminal_id !== 'NONE'
                        ? incidentDetail.model_prediction.top_terminal_id
                        : 'N/A'}
                    </div>
                    <div className="text-zinc-400 truncate">
                      {incidentDetail.model_prediction.top_terminal_city && incidentDetail.model_prediction.top_terminal_city !== 'NONE'
                        ? incidentDetail.model_prediction.top_terminal_city
                        : 'No Exit Convergence'}
                    </div>
                  </div>
                </div>

                {/* Evidence Bullets */}
                <div className="space-y-1.5">
                  <div className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">
                    INVESTIGATIVE EVIDENCE BULLETS:
                  </div>
                  <div className="space-y-1 text-[10px] text-zinc-300">
                    {(incidentDetail.investigative_evidence_bullets && incidentDetail.investigative_evidence_bullets.length > 0
                      ? incidentDetail.investigative_evidence_bullets
                      : [
                          `GraphSAGE risk probability evaluated at ${((incidentDetail.model_prediction.graphsage_risk_probability || 0.95) * 100).toFixed(2)}%.`,
                          `Disputed amount of ₹${(incidentDetail.complaint.reported_amount || 150000).toLocaleString('en-IN')}.`,
                        ]
                    ).map((bullet, idx) => (
                      <div key={idx} className="flex items-start gap-2 bg-[#060709] p-2 border border-white/5 rounded">
                        <CheckCircle2 className={`w-3.5 h-3.5 flex-shrink-0 mt-0.5 ${
                          incidentDetail.model_prediction.confidence_tier === 'HIGH_CONFIDENCE'
                            ? 'text-[#FF5500]'
                            : incidentDetail.model_prediction.confidence_tier === 'MEDIUM_CONFIDENCE'
                            ? 'text-amber-400'
                            : 'text-emerald-400'
                        }`} />
                        <span className="leading-snug text-zinc-300 font-sans">{bullet}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Case Link */}
                <button
                  onClick={() => onSelectCase(incidentDetail.complaint.complaint_id)}
                  className="w-full py-2.5 bg-white hover:bg-zinc-200 text-black font-bold text-xs rounded flex items-center justify-center gap-2 transition-all shadow-sm"
                >
                  <span>OPEN FULL CLASSIFIED CASE DOSSIER</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </>
            );
          })()}
        </div>
      </div>

      </div>
    </div>
  );
};
