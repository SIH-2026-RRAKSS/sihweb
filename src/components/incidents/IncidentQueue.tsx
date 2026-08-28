import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  Search,
  ChevronLeft,
  ChevronRight,
  ArrowRight,
  ArrowUpDown,
  ListOrdered,
  Flame,
  IndianRupee
} from 'lucide-react';
import { LoadingSkeleton } from '../ui/LoadingSkeleton';
import { EmptyState } from '../ui/EmptyState';
import { ApiService } from '../../services/api';
import { IncidentSummary } from '../../types';

interface IncidentQueueProps {
  onSelectCase: (id: string) => void;
}

export type SortMode = 'SERIAL' | 'RISK' | 'AMOUNT';

export const IncidentQueue: React.FC<IncidentQueueProps> = ({ onSelectCase }) => {
  const [incidents, setIncidents] = useState<IncidentSummary[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [page, setPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(15);
  const [tierFilter, setTierFilter] = useState<string>('ALL');
  const [search, setSearch] = useState<string>('');
  const [sortMode, setSortMode] = useState<SortMode>('SERIAL');

  useEffect(() => {
    const fetchIncidents = async () => {
      try {
        setLoading(true);
        const result = await ApiService.getIncidents({
          page: 1,
          page_size: 1000, // Fetch all to allow client-side flexible sorting across all 1000 records
          tier: tierFilter,
          search: search || undefined
        });

        let items = result.items || [];

        // Apply selected Sort Mode
        if (sortMode === 'SERIAL') {
          items.sort((a, b) => {
            const numA = parseInt(a.complaint_id.replace(/\D/g, ''), 10) || 0;
            const numB = parseInt(b.complaint_id.replace(/\D/g, ''), 10) || 0;
            return numA - numB;
          });
        } else if (sortMode === 'RISK') {
          items.sort((a, b) => (b.graphsage_risk_probability || 0) - (a.graphsage_risk_probability || 0));
        } else if (sortMode === 'AMOUNT') {
          items.sort((a, b) => (b.reported_amount || 0) - (a.reported_amount || 0));
        }

        setTotalCount(items.length);
        const start = (page - 1) * pageSize;
        setIncidents(items.slice(start, start + pageSize));
      } catch (err) {
        console.error('Failed to load incidents:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchIncidents();
  }, [page, pageSize, tierFilter, search, sortMode]);

  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));

  return (
    <div className="space-y-4 font-mono text-xs">
      {/* ── SEARCH, FILTER & SORTING HEADER ── */}
      <div className="bg-[#0C0E12] border border-white/10 p-3.5 rounded-lg flex flex-wrap items-center justify-between gap-3 shadow-industrial-sm">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 bg-[#FF5500]/10 border border-[#FF5500]/30 rounded text-[#FF5500]">
            <ShieldAlert className="w-4 h-4" />
          </div>
          <div>
            <div className="font-bold text-white tracking-tight text-xs font-sans">
              INCIDENT INVESTIGATION QUEUE
            </div>
            <div className="text-[10px] text-zinc-500">
              {totalCount} CASES REGISTERED · {sortMode === 'SERIAL' ? 'ORDERED BY SERIAL NUMBER' : sortMode === 'RISK' ? 'HIGHEST RISK FIRST' : 'HIGHEST AMOUNT FIRST'}
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Search Box */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-zinc-500" />
            <input
              type="text"
              placeholder="SEARCH C000001 / ACCT / CITY..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="bg-[#060709] border border-white/10 pl-8 pr-3 py-1.5 text-xs text-white placeholder-zinc-600 rounded focus:border-[#FF5500] focus:outline-none w-52"
            />
          </div>

          {/* Sort Selector */}
          <div className="flex border border-white/10 bg-[#060709] rounded p-0.5 text-[10px]">
            <button
              onClick={() => { setSortMode('SERIAL'); setPage(1); }}
              className={`px-2 py-1 rounded font-bold flex items-center gap-1 transition-colors ${
                sortMode === 'SERIAL'
                  ? 'bg-white text-black shadow-sm'
                  : 'text-zinc-500 hover:text-zinc-300'
              }`}
              title="Sort in serial order (C000001, C000002, C000003...)"
            >
              <ListOrdered className="w-3 h-3" />
              <span>SERIAL (C001➔)</span>
            </button>

            <button
              onClick={() => { setSortMode('RISK'); setPage(1); }}
              className={`px-2 py-1 rounded font-bold flex items-center gap-1 transition-colors ${
                sortMode === 'RISK'
                  ? 'bg-[#FF5500] text-black shadow-sm'
                  : 'text-zinc-500 hover:text-zinc-300'
              }`}
              title="Sort by highest risk score first"
            >
              <Flame className="w-3 h-3" />
              <span>RISK</span>
            </button>

            <button
              onClick={() => { setSortMode('AMOUNT'); setPage(1); }}
              className={`px-2 py-1 rounded font-bold flex items-center gap-1 transition-colors ${
                sortMode === 'AMOUNT'
                  ? 'bg-amber-400 text-black shadow-sm'
                  : 'text-zinc-500 hover:text-zinc-300'
              }`}
              title="Sort by highest disputed amount"
            >
              <IndianRupee className="w-3 h-3" />
              <span>AMOUNT</span>
            </button>
          </div>

          {/* Tier Filter Tabs */}
          <div className="flex border border-white/10 bg-[#060709] rounded p-0.5 text-[10px]">
            {[
              { id: 'ALL', label: 'ALL TIERS' },
              { id: 'HIGH_CONFIDENCE', label: 'CRITICAL' },
              { id: 'MEDIUM_CONFIDENCE', label: 'SUSPICIOUS' },
              { id: 'NORMAL', label: 'CLEARED' },
            ].map((t) => (
              <button
                key={t.id}
                onClick={() => {
                  setTierFilter(t.id);
                  setPage(1);
                }}
                className={`px-2.5 py-1 rounded font-bold transition-colors ${
                  tierFilter === t.id
                    ? 'bg-white text-black shadow-sm'
                    : 'text-zinc-500 hover:text-zinc-300'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── INCIDENTS TABLE ── */}
      <div className="bg-[#0C0E12] border border-white/10 rounded-lg overflow-hidden shadow-industrial-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-[#060709] border-b border-white/10 text-[10px] text-zinc-400">
              <tr>
                <th className="p-3">COMPLAINT ID</th>
                <th className="p-3">SCAM CATEGORY</th>
                <th className="p-3 text-right">DISPUTED AMOUNT</th>
                <th className="p-3">JURISDICTION</th>
                <th className="p-3">GRAPHSAGE RISK</th>
                <th className="p-3">OPERATIONAL TIER</th>
                <th className="p-3">EXIT ATM TARGET</th>
                <th className="p-3 text-center">DOSSIER ACTION</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 bg-[#0C0E12]">
              {loading ? (
                <tr>
                  <td colSpan={8} className="p-6">
                    <LoadingSkeleton variant="table-row" count={8} />
                  </td>
                </tr>
              ) : incidents.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center">
                    <EmptyState
                      title="No incidents found"
                      description="No records match your selected tier or search criteria."
                    />
                  </td>
                </tr>
              ) : (
                incidents.map((incident) => {
                  const isHigh = incident.confidence_tier === 'HIGH_CONFIDENCE';
                  const isMedium = incident.confidence_tier === 'MEDIUM_CONFIDENCE';

                  return (
                    <tr
                      key={incident.complaint_id}
                      onClick={() => onSelectCase(incident.complaint_id)}
                      className="hover:bg-white/[0.03] transition-colors cursor-pointer"
                    >
                      <td className="p-3 font-bold text-white">
                        {incident.complaint_id}
                      </td>
                      <td className="p-3 text-zinc-300 max-w-[200px] truncate">
                        {incident.scam_category || 'Commercial Transfer Flow'}
                      </td>
                      <td className="p-3 text-right font-bold text-white font-sans">
                        ₹{(incident.reported_amount || 0).toLocaleString('en-IN')}
                      </td>
                      <td className="p-3 text-zinc-400">
                        {incident.district}, {incident.state}
                      </td>
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          <span className={`font-bold ${isHigh ? 'text-[#FF5500]' : isMedium ? 'text-amber-400' : 'text-emerald-400'}`}>
                            {(incident.graphsage_risk_probability * 100).toFixed(1)}%
                          </span>
                          <div className="w-12 bg-[#1A1E26] h-1 rounded overflow-hidden">
                            <div
                              className={`h-full ${isHigh ? 'bg-[#FF5500]' : isMedium ? 'bg-amber-400' : 'bg-emerald-400'}`}
                              style={{ width: `${incident.graphsage_risk_probability * 100}%` }}
                            />
                          </div>
                        </div>
                      </td>
                      <td className="p-3">
                        <span className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase ${
                          isHigh ? 'bg-[#FF5500]/15 text-[#FF5500] border border-[#FF5500]/30' : isMedium ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30' : 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                        }`}>
                          {incident.confidence_tier}
                        </span>
                      </td>
                      <td className="p-3">
                        {incident.top_terminal_id && incident.top_terminal_id !== 'NONE' ? (
                          <div className="text-amber-400 text-[11px] font-bold">
                            {incident.top_terminal_id} <span className="text-zinc-500 font-normal">({incident.top_terminal_city || 'City'})</span>
                          </div>
                        ) : (
                          <span className="text-zinc-600">N/A</span>
                        )}
                      </td>
                      <td className="p-3 text-center">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectCase(incident.complaint_id);
                          }}
                          className="px-2.5 py-1 bg-white/5 hover:bg-white/10 text-white border border-white/10 rounded text-[10px] font-bold inline-flex items-center gap-1 transition-all"
                        >
                          <span>OPEN</span>
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="p-3 border-t border-white/10 flex items-center justify-between bg-[#060709] text-[11px] text-zinc-400">
          <div>
            Showing Page <strong className="text-white">{page}</strong> of <strong className="text-white">{totalPages}</strong> ({totalCount} total cases)
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setPage(Math.max(1, page - 1))}
              disabled={page <= 1}
              className="p-1 rounded bg-[#12151B] border border-white/10 text-zinc-300 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-white/10"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <button
              onClick={() => setPage(Math.min(totalPages, page + 1))}
              disabled={page >= totalPages}
              className="p-1 rounded bg-[#12151B] border border-white/10 text-zinc-300 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-white/10"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
