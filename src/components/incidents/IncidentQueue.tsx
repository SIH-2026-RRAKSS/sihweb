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
import { InputValidator } from '../../utils/validation';
import { IncidentSummary } from '../../types';

interface IncidentQueueProps {
  onSelectCase: (id: string) => void;
}

export type SortMode = 'SERIAL' | 'RISK' | 'AMOUNT';

export const IncidentQueue: React.FC<IncidentQueueProps> = ({ onSelectCase }) => {
  const [incidents, setIncidents] = useState<IncidentSummary[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [page, setPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(15);
  const [tierFilter, setTierFilter] = useState<string>('ALL');
  const [search, setSearch] = useState<string>('');
  const [sortMode, setSortMode] = useState<SortMode>('SERIAL');

  useEffect(() => {
    let intervalId: ReturnType<typeof setInterval>;
    let isInitial = true;

    const fetchIncidents = async () => {
      try {
        if (isInitial) {
          setLoading(true);
        }
        
        if (search) {
          const val = InputValidator.validateSearchQuery(search);
          if (!val.isValid) {
            setError(val.error || 'Invalid search query');
            setLoading(false);
            return;
          }
          setError(null);
        }

        const result = await ApiService.getIncidents({
          page: 1,
          page_size: 1000,
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
        setError('Investigation data unavailable - backend unreachable');
        console.error(err);
      } finally {
        if (isInitial) {
          setLoading(false);
          isInitial = false;
        }
      }
    };

    fetchIncidents();
    intervalId = setInterval(fetchIncidents, 10000);

    return () => clearInterval(intervalId);
  }, [page, pageSize, tierFilter, search, sortMode]);

  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));

  return (
    <div className="space-y-4 font-sans text-xs">
      {/* ── SEARCH, FILTER & SORTING HEADER ── */}
      <div className="bg-white border border-slate-200 p-3.5 rounded-2xl flex flex-wrap items-center justify-between gap-3 shadow-saas-card">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 bg-[#FF5500]/10 border border-[#FF5500]/30 rounded text-[#FF5500]">
            <ShieldAlert className="w-4 h-4" />
          </div>
          <div>
            <div className="font-bold text-slate-900 tracking-tight text-xs font-sans">
              INCIDENT INVESTIGATION QUEUE
            </div>
            <div className="text-[10px] text-slate-500">
              {totalCount} CASES REGISTERED · {sortMode === 'SERIAL' ? 'ORDERED BY SERIAL NUMBER' : sortMode === 'RISK' ? 'HIGHEST RISK FIRST' : 'HIGHEST AMOUNT FIRST'}
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Search Box */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              placeholder="SEARCH C000001 / ACCT / CITY..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="bg-slate-50 border border-slate-200 pl-8 pr-3 py-1.5 text-xs text-slate-900 placeholder-zinc-600 rounded focus:border-[#FF5500] focus:outline-none w-52"
            />
          </div>

          {/* Sort Selector */}
          <div className="flex border border-slate-200 bg-slate-50 rounded p-0.5 text-[10px]">
            <button
              onClick={() => { setSortMode('SERIAL'); setPage(1); }}
              className={`px-2 py-1 rounded font-bold flex items-center gap-1 transition-colors ${
                sortMode === 'SERIAL'
                  ? 'bg-white text-black shadow-sm'
                  : 'text-slate-500 hover:text-slate-700'
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
                  : 'text-slate-500 hover:text-slate-700'
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
                  : 'text-slate-500 hover:text-slate-700'
              }`}
              title="Sort by highest disputed amount"
            >
              <IndianRupee className="w-3 h-3" />
              <span>AMOUNT</span>
            </button>
          </div>

          {/* Tier Filter Tabs */}
          <div className="flex border border-slate-200 bg-slate-50 rounded p-0.5 text-[10px]">
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
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── INCIDENTS TABLE ── */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-saas-card">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-sans">
            <thead className="bg-slate-50 border-b border-slate-200 text-[10px] text-slate-500">
              <tr>
                <th className="p-3">COMPLAINT ID</th>
                <th className="p-3">INTAKE ORIGIN</th>
                <th className="p-3">SCAM CATEGORY</th>
                <th className="p-3 text-right">DISPUTED AMOUNT</th>
                <th className="p-3">JURISDICTION</th>
                <th className="p-3">GRAPHSAGE RISK</th>
                <th className="p-3">OPERATIONAL TIER</th>
                <th className="p-3">EXIT ATM TARGET</th>
                <th className="p-3 text-center">DOSSIER ACTION</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 bg-white">
              {loading ? (
                <tr>
                  <td colSpan={9} className="p-6">
                    <LoadingSkeleton variant="table-row" count={8} />
                  </td>
                </tr>
              ) : incidents.length === 0 ? (
                <tr>
                  <td colSpan={9} className="p-8 text-center">
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
                  const isAuto = incident.trigger_source === 'DYNAMIC_ANOMALY';

                  return (
                    <tr
                      key={incident.complaint_id}
                      onClick={() => onSelectCase(incident.complaint_id)}
                      className="hover:bg-white/[0.03] transition-colors cursor-pointer"
                    >
                      <td className="p-3 font-bold text-slate-900 relative">
                        {incident.complaint_id}
                        {incident.intercepted_in_flight && (
                          <div className="absolute -top-1 -right-2 text-[8px] bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 px-1 py-0.5 rounded shadow whitespace-nowrap">
                            Intercepted In-Flight
                          </div>
                        )}
                      </td>
                      <td className="p-3">
                        <div className="flex flex-col gap-1">
                          <span className={`text-[9px] px-1.5 py-0.5 w-fit rounded font-bold border ${isAuto ? 'bg-amber-500/10 text-amber-500 border-amber-500/30' : 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30'}`}>
                            {isAuto ? '[AUTO-SPAWNED ANOMALY]' : '[CITIZEN COMPLAINT]'}
                          </span>
                          {isAuto && incident.anomaly_reason && (
                            <span className="text-[9px] text-slate-500 leading-tight">
                              {incident.anomaly_reason}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="p-3 text-slate-700 max-w-[200px] truncate">
                        {incident.scam_category || 'Commercial Transfer Flow'}
                      </td>
                      <td className="p-3 text-right font-bold text-slate-900 font-sans">
                        ₹{(incident.reported_amount || 0).toLocaleString('en-IN')}
                      </td>
                      <td className="p-3 text-slate-500">
                        {incident.district}, {incident.state}
                      </td>
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          <span className={`font-bold ${isHigh ? 'text-[#FF5500]' : isMedium ? 'text-amber-400' : 'text-emerald-400'}`}>
                            {(incident.graphsage_risk_probability * 100).toFixed(1)}%
                          </span>
                          <div className="w-12 bg-slate-100 h-1 rounded overflow-hidden">
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
                            {incident.top_terminal_id} <span className="text-slate-500 font-normal">({incident.top_terminal_city || 'City'})</span>
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
                          className="px-2.5 py-1 bg-slate-100 hover:bg-slate-100 text-slate-900 border border-slate-200 rounded text-[10px] font-bold inline-flex items-center gap-1 transition-all"
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
        <div className="p-3 border-t border-slate-200 flex items-center justify-between bg-slate-50 text-[11px] text-slate-500">
          <div>
            Showing Page <strong className="text-slate-900">{page}</strong> of <strong className="text-slate-900">{totalPages}</strong> ({totalCount} total cases)
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setPage(Math.max(1, page - 1))}
              disabled={page <= 1}
              className="p-1 rounded bg-white border border-slate-200 text-slate-700 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-100"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <button
              onClick={() => setPage(Math.min(totalPages, page + 1))}
              disabled={page >= totalPages}
              className="p-1 rounded bg-white border border-slate-200 text-slate-700 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-100"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
