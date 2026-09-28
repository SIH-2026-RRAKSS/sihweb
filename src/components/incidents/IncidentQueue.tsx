import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  Search,
  ChevronLeft,
  ChevronRight,
  ArrowRight,
  ListOrdered,
  Flame,
  IndianRupee,
  UserPlus,
  AlertOctagon,
  CheckCircle2,
  Clock,
  Filter
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { LoadingSkeleton } from '../ui/LoadingSkeleton';
import { EmptyState } from '../ui/EmptyState';
import { ApiService } from '../../services/api';
import { InputValidator } from '../../utils/validation';
import { IncidentSummary } from '../../types';
import { AssignOfficerModal } from './AssignOfficerModal';
import { QuickFreezeModal } from '../freeze/QuickFreezeModal';
import { useAsyncState, AsyncStatus } from '../../hooks/useAsyncState';
import { LottieLoader } from '../ui/LottieLoader';
import {
  IncidentIdCell,
  TierBadge,
  RiskBar,
  AmountCell,
  LocationCell,
  IntakeOriginChip,
  FILTER_TABS,
  getIntakeOriginLabel,
} from './index';

interface IncidentQueueProps {
  activeDataset?: string;
}

export type SortMode = 'SERIAL' | 'RISK' | 'AMOUNT';

export const IncidentQueue: React.FC<IncidentQueueProps> = ({ activeDataset }) => {
  const navigate = useNavigate();
  const [allIncidents, setAllIncidents] = useState<IncidentSummary[]>([]);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [page, setPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(15);
  const [tierFilter, setTierFilter] = useState<string>('ALL');
  const [search, setSearch] = useState<string>('');
  const [sortMode, setSortMode] = useState<SortMode>('SERIAL');

  const { status: fetchStatus, error: fetchError, run: runFetch } = useAsyncState<void>();
  const { status: actionStatus, error: actionError, run: runAction } = useAsyncState<void>();

  // Modals state
  const [assignModalIncident, setAssignModalIncident] = useState<IncidentSummary | null>(null);
  const [freezeModalIncident, setFreezeModalIncident] = useState<IncidentSummary | null>(null);

  const fetchIncidents = async () => {
    if (search) {
      const val = InputValidator.validateSearchQuery(search);
      if (!val.isValid) {
        throw new Error(val.error || 'Invalid search query');
      }
    }

    const { items } = await ApiService.getIncidents({
      page: 1,
      page_size: 1000,
      tier: tierFilter,
      search: search || undefined,
      dataset: activeDataset
    });

    let itemList = [...(items || [])];

    // Local sort
    if (sortMode === 'SERIAL') {
      itemList.sort((a, b) => a.complaint_id.localeCompare(b.complaint_id));
    } else if (sortMode === 'RISK') {
      itemList.sort((a, b) => (b.graphsage_risk_probability || 0) - (a.graphsage_risk_probability || 0));
    } else if (sortMode === 'AMOUNT') {
      itemList.sort((a, b) => (b.reported_amount || 0) - (a.reported_amount || 0));
    }

    setTotalCount(itemList.length);
    setAllIncidents(itemList);
  };

  useEffect(() => {
    runFetch(fetchIncidents);
    const intervalId = setInterval(() => {
      fetchIncidents().catch(() => {});
    }, 12000);
    return () => clearInterval(intervalId);
  }, [tierFilter, search, sortMode, activeDataset]);

  const handleStatusChange = async (incidentId: string, newStatus: string, e: React.MouseEvent) => {
    e.stopPropagation();
    runAction(async () => {
      await ApiService.updateIncidentStatus(incidentId, newStatus);
      setAllIncidents(prev =>
        prev.map(inc => inc.complaint_id === incidentId ? { ...inc, status: newStatus } : inc)
      );
    });
  };

  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
  const start = (page - 1) * pageSize;
  const incidents = allIncidents.slice(start, start + pageSize);

  const formatAmount = (amount: number) => {
    if (activeDataset === 'IBM_B') {
      return `$${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    }
    if (activeDataset === 'ELLIPTIC_C') {
      return `₿ ${amount.toFixed(4)} BTC`;
    }
    return `₹${amount.toLocaleString('en-IN')}`;
  };

  const getOriginBadge = () => {
    if (activeDataset === 'IBM_B') return 'MULTI-BANK LEDGER';
    if (activeDataset === 'ELLIPTIC_C') return 'BITCOIN UTXO';
    return 'CITIZEN COMPLAINT';
  };

  return (
    <div className="space-y-4 font-sans text-xs">
      {/* ── ACTION LOADER ── */}
      {(actionStatus === AsyncStatus.LOADING || actionStatus === AsyncStatus.SUCCESS || actionStatus === AsyncStatus.ERROR) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <LottieLoader status={actionStatus} error={actionError} autoHideMs={1200} />
        </div>
      )}

      {/* ── SEARCH, FILTER & SORTING HEADER ── */}
      <div className="bg-white border border-slate-200 p-3.5 rounded-2xl flex flex-wrap items-center justify-between gap-3 shadow-saas-card">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-[#FF5500]/10 border border-[#FF5500]/30 rounded-xl text-[#FF5500]">
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
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="SEARCH C000001 / ACCT / CITY..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="bg-slate-50 border border-slate-200 pl-8 pr-3 py-1.5 text-xs text-slate-900 placeholder-slate-400 rounded-lg focus:border-[#FF5500] focus:ring-1 focus:ring-[#FF5500] focus:outline-none w-56 font-medium"
            />
          </div>

          {/* Sort Selector */}
          <div className="flex border border-slate-200 bg-slate-50 rounded-lg p-0.5 text-[10px]">
            <button
              onClick={() => { setSortMode('SERIAL'); setPage(1); }}
              className={`px-2 py-1 rounded-md font-bold flex items-center gap-1 transition-colors ${
                sortMode === 'SERIAL'
                  ? 'bg-white text-slate-900 shadow-sm border border-slate-200/60'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
              title="Sort in serial order"
            >
              <ListOrdered className="w-3 h-3" />
              <span>SERIAL</span>
            </button>

            <button
              onClick={() => { setSortMode('RISK'); setPage(1); }}
              className={`px-2 py-1 rounded-md font-bold flex items-center gap-1 transition-colors ${
                sortMode === 'RISK'
                  ? 'bg-[#FF5500] text-white shadow-sm'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
              title="Sort by highest risk score first"
            >
              <Flame className="w-3 h-3" />
              <span>RISK</span>
            </button>

            <button
              onClick={() => { setSortMode('AMOUNT'); setPage(1); }}
              className={`px-2 py-1 rounded-md font-bold flex items-center gap-1 transition-colors ${
                sortMode === 'AMOUNT'
                  ? 'bg-amber-400 text-slate-950 shadow-sm'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
              title="Sort by highest disputed amount"
            >
              <IndianRupee className="w-3 h-3" />
              <span>AMOUNT</span>
            </button>
          </div>

          {/* Tier Filter Tabs */}
          <div className="flex border border-slate-200 bg-slate-50 rounded-lg p-0.5 text-[10px]">
            {FILTER_TABS.map((t) => (
              <button
                key={t.id}
                onClick={() => {
                  setTierFilter(t.id);
                  setPage(1);
                }}
                className={`px-2.5 py-1 rounded-md font-bold transition-colors text-[10px] ${
                  tierFilter === t.id
                    ? 'bg-white text-slate-900 shadow-sm border border-slate-200/60'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {fetchStatus === AsyncStatus.ERROR && (
        <div className="bg-red-50 border border-red-200 p-4 rounded-xl flex items-center gap-3 text-red-600">
          <ShieldAlert className="w-5 h-5 text-red-500" />
          <span className="font-bold text-sm">{fetchError || 'Error fetching data'}</span>
        </div>
      )}

      {/* ── INCIDENTS TABLE ── */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-saas-card">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-sans">
            <thead className="bg-slate-50/80 border-b border-slate-200 text-[10px] text-slate-500 font-bold uppercase tracking-wider">
              <tr>
                <th className="p-3">COMPLAINT ID</th>
                <th className="p-3">SCAM CATEGORY</th>
                <th className="p-3 text-right">
                  {activeDataset === 'IBM_B' ? 'FLOW AMOUNT ($)' : activeDataset === 'ELLIPTIC_C' ? 'TX AMOUNT (BTC)' : 'DISPUTED AMOUNT (₹)'}
                </th>
                <th className="p-3">JURISDICTION</th>
                <th className="p-3">GRAPHSAGE RISK</th>
                <th className="p-3">OPERATIONAL TIER</th>
                <th className="p-3">OFFICER / STATUS</th>
                <th className="p-3 text-center">ACTIONS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {fetchStatus === AsyncStatus.LOADING ? (
                <tr>
                  <td colSpan={8} className="p-6 text-center">
                    <LottieLoader status={fetchStatus} error={fetchError} />
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
                (() => {
                  const uniqueOrigins = new Set(incidents.map(() => getIntakeOriginLabel(activeDataset)));
                  const showOriginChip = uniqueOrigins.size > 1;

                  return incidents.map((incident) => {
                    const status = incident.status || 'UNDER_INVESTIGATION';

                    return (
                      <tr
                        key={incident.complaint_id}
                        onClick={() => navigate(`/dossier/${incident.complaint_id}`)}
                        className="hover:bg-slate-50/80 transition-colors cursor-pointer group"
                      >
                        {/* ID */}
                        <td className="p-3 font-bold text-slate-900 relative">
                          <IncidentIdCell
                            complaintId={incident.complaint_id}
                            interceptedInFlight={incident.intercepted_in_flight}
                          />
                        </td>



                        {/* Scam Category */}
                        <td className="p-3 text-slate-700 max-w-[180px] truncate font-medium text-[11px]">
                          {incident.scam_category || 'Commercial Transfer Flow'}
                        </td>

                        {/* Disputed Amount */}
                        <td className="p-3 text-right">
                          <AmountCell
                            amount={incident.reported_amount || 0}
                            dataset={activeDataset}
                          />
                        </td>

                        {/* Jurisdiction */}
                        <td className="p-3">
                          <LocationCell
                            district={incident.district}
                            state={incident.state}
                            predictedExitCity={incident.top_terminal_city}
                            showPredictedExit={false}
                          />
                        </td>

                        {/* Risk Score */}
                        <td className="p-3">
                          <RiskBar probability={incident.graphsage_risk_probability} tier={incident.confidence_tier} />
                        </td>

                        {/* Operational Tier */}
                        <td className="p-3">
                          <TierBadge tier={incident.confidence_tier} />
                        </td>

                        {/* Officer & Status */}
                        <td className="p-3" onClick={(e) => e.stopPropagation()}>
                          <div className="flex flex-col gap-1">
                            <div className="text-[10px] text-slate-700 font-medium truncate max-w-[120px]">
                              {incident.assignedOfficerName ? (
                                <span className="text-slate-900 font-bold">👮 {incident.assignedOfficerName}</span>
                              ) : (
                                <span className="text-slate-400 italic">Unassigned</span>
                              )}
                            </div>
                            
                            <select
                              value={status}
                              onChange={(e) => handleStatusChange(incident.complaint_id, e.target.value, e as any)}
                              className="text-[10px] bg-slate-50 border border-slate-200 rounded px-1.5 py-0.5 text-slate-700 font-bold focus:outline-none focus:border-[#FF5500]"
                            >
                              <option value="UNDER_TRIAGE">TRIAGE</option>
                              <option value="UNDER_INVESTIGATION">INVESTIGATING</option>
                              <option value="FREEZE_INITIATED">FREEZE SENT</option>
                              <option value="FUNDS_FROZEN">FROZEN</option>
                              <option value="RESOLVED">RESOLVED</option>
                            </select>
                          </div>
                        </td>

                        {/* Actions */}
                        <td className="p-3 text-center" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center justify-center gap-1.5">
                            {/* Quick Freeze Action */}
                            <button
                              onClick={() => setFreezeModalIncident(incident)}
                              className="p-1.5 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 rounded-lg text-[10px] font-bold transition-all"
                              title="Issue Immediate Bank Freeze Notice"
                            >
                              <AlertOctagon className="w-3.5 h-3.5" />
                            </button>

                            {/* Assign Officer Action */}
                            <button
                              onClick={() => setAssignModalIncident(incident)}
                              className="p-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-lg text-[10px] font-bold transition-all"
                              title="Assign Case Officer"
                            >
                              <UserPlus className="w-3.5 h-3.5" />
                            </button>

                            {/* Open Dossier */}
                            <button
                              onClick={() => navigate(`/dossier/${incident.complaint_id}`)}
                              className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200 rounded-lg text-[10px] font-bold inline-flex items-center gap-1 transition-all"
                              title="Open Full Case Dossier"
                            >
                              <span>OPEN</span>
                              <ArrowRight className="w-3 h-3" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  });
                })()
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="p-3 border-t border-slate-200 flex items-center justify-between bg-slate-50 text-[11px] text-slate-500 font-medium">
          <div>
            Showing Page <strong className="text-slate-900">{page}</strong> of <strong className="text-slate-900">{totalPages}</strong> ({totalCount} total cases)
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setPage(Math.max(1, page - 1))}
              disabled={page <= 1}
              className="p-1 rounded-lg bg-white border border-slate-200 text-slate-700 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-100 shadow-sm transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <button
              onClick={() => setPage(Math.min(totalPages, page + 1))}
              disabled={page >= totalPages}
              className="p-1 rounded-lg bg-white border border-slate-200 text-slate-700 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-100 shadow-sm transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* ── ASSIGN OFFICER MODAL ── */}
      {assignModalIncident && (
        <AssignOfficerModal
          incidentId={assignModalIncident.complaint_id}
          currentOfficerName={assignModalIncident.assignedOfficerName}
          onClose={() => setAssignModalIncident(null)}
          onAssigned={(officer) => {
            setAllIncidents(prev =>
              prev.map(inc =>
                inc.complaint_id === assignModalIncident.complaint_id
                  ? { ...inc, assignedOfficerName: officer.name }
                  : inc
              )
            );
            setAssignModalIncident(null);
          }}
        />
      )}

      {/* ── QUICK FREEZE MODAL ── */}
      {freezeModalIncident && (
        <QuickFreezeModal
          incidentId={freezeModalIncident.complaint_id}
          defaultAccount={freezeModalIncident.reported_account_number || 'ACCT-SUSPECT-9901'}
          defaultAmount={freezeModalIncident.reported_amount || 50000}
          onClose={() => setFreezeModalIncident(null)}
          onFreezeDispatched={(freeze) => {
            setFreezeModalIncident(null);
          }}
        />
      )}
    </div>
  );
};
