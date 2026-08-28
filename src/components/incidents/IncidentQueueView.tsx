import React, { useState } from 'react';
import {
  ShieldAlert,
  Search,
  Filter,
  ArrowUpDown,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  Sliders,
  DollarSign,
  Share2,
  Building
} from 'lucide-react';
import { IncidentSummary, ConfidenceTier } from '../../types';

interface IncidentQueueProps {
  incidents: IncidentSummary[];
  onSelectIncident: (id: string) => void;
  onViewGraph: (id: string) => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
}

export const IncidentQueueView: React.FC<IncidentQueueProps> = ({
  incidents,
  onSelectIncident,
  onViewGraph,
  searchQuery,
  onSearchChange
}) => {
  const [selectedTier, setSelectedTier] = useState<string>('ALL');
  const [minRisk, setMinRisk] = useState<number>(0.0);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const pageSize = 10;

  // Filter incidents
  const filtered = incidents.filter((item) => {
    if (selectedTier !== 'ALL' && item.confidence_tier !== selectedTier) {
      return false;
    }
    if (item.graphsage_risk_probability < minRisk) {
      return false;
    }
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchId = item.complaint_id.toLowerCase().includes(q);
      const matchAcc = item.reported_account_number?.toLowerCase().includes(q);
      const matchScam = item.scam_category?.toLowerCase().includes(q);
      const matchDist = item.district?.toLowerCase().includes(q);
      const matchState = item.state?.toLowerCase().includes(q);
      if (!matchId && !matchAcc && !matchScam && !matchDist && !matchState) {
        return false;
      }
    }
    return true;
  });

  const totalPages = Math.ceil(filtered.length / pageSize) || 1;
  const paginated = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const getTierBadge = (tier: ConfidenceTier) => {
    switch (tier) {
      case 'HIGH_CONFIDENCE':
        return (
          <span className="px-2 py-0.5 text-[10px] font-mono font-bold bg-cyber-red/20 text-cyber-red border border-cyber-red/40 rounded">
            HIGH CONFIDENCE
          </span>
        );
      case 'MEDIUM_CONFIDENCE':
        return (
          <span className="px-2 py-0.5 text-[10px] font-mono font-bold bg-amber-500/20 text-amber-400 border border-amber-500/40 rounded">
            MEDIUM CONFIDENCE
          </span>
        );
      case 'NORMAL':
        return (
          <span className="px-2 py-0.5 text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 rounded">
            NORMAL FLOW
          </span>
        );
      default:
        return (
          <span className="px-2 py-0.5 text-[10px] font-mono bg-slate-800 text-slate-400 rounded">
            {tier}
          </span>
        );
    }
  };

  return (
    <div className="space-y-4 pb-8">
      {/* Header & Description */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-cyber-700 pb-3">
        <div>
          <h2 className="text-base font-bold font-mono text-slate-100 uppercase tracking-wide flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-cyber-red" />
            Retrospective Incident Alert & Triage Queue
          </h2>
          <p className="text-xs text-slate-400">
            Holdout incident complaints ordered by inductive GraphSAGE laundering risk score and calibrated confidence tiers.
          </p>
        </div>

        <div className="text-xs font-mono text-slate-400">
          Showing <span className="text-cyber-cyan font-bold">{filtered.length}</span> matching incidents
        </div>
      </div>

      {/* Filter Control Bar */}
      <div className="cyber-card p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-center">
        {/* Tier Filter */}
        <div>
          <label className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block mb-1.5">
            Filter Confidence Tier
          </label>
          <select
            value={selectedTier}
            onChange={(e) => {
              setSelectedTier(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full px-3 py-1.5 text-xs bg-cyber-950 border border-cyber-700 rounded-lg text-slate-200 focus:border-cyber-cyan focus:outline-none font-mono"
          >
            <option value="ALL">ALL TIERS ({incidents.length})</option>
            <option value="HIGH_CONFIDENCE">HIGH CONFIDENCE (Alert)</option>
            <option value="MEDIUM_CONFIDENCE">MEDIUM CONFIDENCE (Triage)</option>
            <option value="NORMAL">NORMAL (Benign Flow)</option>
          </select>
        </div>

        {/* Risk Threshold Slider */}
        <div>
          <div className="flex justify-between text-[10px] font-mono text-slate-400 uppercase mb-1.5">
            <span>Min Risk Cutoff</span>
            <span className="text-cyber-cyan font-bold">{(minRisk * 100).toFixed(0)}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={minRisk}
            onChange={(e) => {
              setMinRisk(parseFloat(e.target.value));
              setCurrentPage(1);
            }}
            className="w-full h-1.5 bg-cyber-950 rounded-lg appearance-none cursor-pointer accent-cyber-cyan"
          />
        </div>

        {/* Search Box */}
        <div className="sm:col-span-2">
          <label className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block mb-1.5">
            Filter by Incident Reference / Account / City
          </label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                onSearchChange(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search e.g. C000047, ACC_998124501, Mumbai, Crypto..."
              className="w-full pl-9 pr-4 py-1.5 text-xs bg-cyber-950 border border-cyber-700 rounded-lg text-slate-200 focus:border-cyber-cyan focus:outline-none font-mono placeholder:text-slate-600"
            />
          </div>
        </div>
      </div>

      {/* Main Table */}
      <div className="cyber-card overflow-hidden border border-cyber-700/80">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-cyber-950/90 text-slate-400 border-b border-cyber-700 text-[11px] uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Complaint ID</th>
                <th className="py-3 px-4">Beneficiary Account</th>
                <th className="py-3 px-4">Amount</th>
                <th className="py-3 px-4">Category & Location</th>
                <th className="py-3 px-4">GNN Laundering Risk</th>
                <th className="py-3 px-4">Calibrated Tier</th>
                <th className="py-3 px-4">Exit ATM / City</th>
                <th className="py-3 px-4 text-right">Investigative Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-cyber-800 text-slate-200">
              {paginated.length > 0 ? (
                paginated.map((item) => {
                  const riskPct = item.graphsage_risk_probability * 100;
                  return (
                    <tr
                      key={item.complaint_id}
                      className="hover:bg-cyber-800/60 transition-colors group cursor-pointer"
                      onClick={() => onSelectIncident(item.complaint_id)}
                    >
                      <td className="py-3.5 px-4 font-bold text-cyber-cyan flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-cyber-cyan/80"></span>
                        {item.complaint_id}
                      </td>
                      <td className="py-3.5 px-4 text-slate-300">
                        {item.reported_account_number || 'N/A'}
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-slate-100">
                        ₹{(item.reported_amount || 0).toLocaleString()}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="text-slate-200 truncate max-w-[200px] font-sans font-medium text-xs">
                          {item.scam_category}
                        </div>
                        <div className="text-[10px] text-slate-500">
                          {item.district}, {item.state}
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2">
                          <div className="w-16 bg-cyber-950 rounded-full h-1.5 overflow-hidden">
                            <div
                              className={`h-full rounded-full ${
                                riskPct > 70 ? 'bg-cyber-red' : riskPct > 40 ? 'bg-amber-400' : 'bg-emerald-400'
                              }`}
                              style={{ width: `${riskPct}%` }}
                            ></div>
                          </div>
                          <span
                            className={`font-bold ${
                              riskPct > 70 ? 'text-cyber-red' : riskPct > 40 ? 'text-amber-400' : 'text-emerald-400'
                            }`}
                          >
                            {riskPct.toFixed(1)}%
                          </span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        {getTierBadge(item.confidence_tier)}
                      </td>
                      <td className="py-3.5 px-4">
                        {item.top_terminal_id && item.top_terminal_id !== 'NONE' ? (
                          <div className="text-amber-400 flex items-center gap-1">
                            <Building className="w-3 h-3 text-amber-400" />
                            <span>{item.top_terminal_id} ({item.top_terminal_city})</span>
                          </div>
                        ) : (
                          <span className="text-slate-500">None detected</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
                          <button
                            onClick={() => onSelectIncident(item.complaint_id)}
                            className="px-2.5 py-1 text-[11px] bg-cyber-800 hover:bg-cyber-cyan hover:text-cyber-950 text-slate-300 rounded border border-cyber-600 transition-all flex items-center gap-1"
                            title="Open Formal Case Dossier"
                          >
                            <span>Dossier</span>
                            <ExternalLink className="w-3 h-3" />
                          </button>
                          <button
                            onClick={() => onViewGraph(item.complaint_id)}
                            className="p-1 text-slate-400 hover:text-cyber-cyan hover:bg-cyber-800 rounded border border-transparent hover:border-cyber-700 transition-all"
                            title="Explore Interactive Subgraph"
                          >
                            <Share2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-500">
                    No incidents match the specified search and risk criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        <div className="px-4 py-3 bg-cyber-950/80 border-t border-cyber-700 flex items-center justify-between font-mono text-xs text-slate-400">
          <div>
            Page <span className="text-cyber-cyan font-bold">{currentPage}</span> of{' '}
            <span className="text-slate-200">{totalPages}</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              className="p-1.5 bg-cyber-900 border border-cyber-700 rounded hover:bg-cyber-800 disabled:opacity-30 disabled:cursor-not-allowed text-slate-200"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              className="p-1.5 bg-cyber-900 border border-cyber-700 rounded hover:bg-cyber-800 disabled:opacity-30 disabled:cursor-not-allowed text-slate-200"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
