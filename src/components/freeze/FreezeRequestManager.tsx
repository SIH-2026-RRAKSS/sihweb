import React, { useState, useEffect } from 'react';
import {
  AlertOctagon,
  Search,
  Clock,
  CheckCircle2,
  XCircle,
  ShieldAlert,
  Building2,
  RefreshCw,
  PlusCircle,
  FileCheck,
  AlertTriangle,
  ChevronRight
} from 'lucide-react';
import { ApiService } from '../../services/api';
import { FreezeRequest, FreezeStatus } from '../../types';
import { QuickFreezeModal } from './QuickFreezeModal';

export const FreezeRequestManager: React.FC = () => {
  const [freezes, setFreezes] = useState<FreezeRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [search, setSearch] = useState('');
  const [showNewModal, setShowNewModal] = useState(false);
  const [selectedFreeze, setSelectedFreeze] = useState<FreezeRequest | null>(null);
  const [currentTime, setCurrentTime] = useState<number>(Date.now());

  const fetchFreezes = async () => {
    try {
      setLoading(true);
      const data = await ApiService.getFreezeRequests(
        statusFilter === 'ALL' ? undefined : (statusFilter as FreezeStatus)
      );
      setFreezes(data);
    } catch (err) {
      console.error('Failed to fetch freeze notices', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFreezes();
    const interval = setInterval(fetchFreezes, 10000);
    return () => clearInterval(interval);
  }, [statusFilter]);

  // SLA ticker every 1 second
  useEffect(() => {
    const ticker = setInterval(() => setCurrentTime(Date.now()), 1000);
    return () => clearInterval(ticker);
  }, []);

  const getRemainingSeconds = (slaDeadline: string) => {
    const deadlineMs = new Date(slaDeadline).getTime();
    const diff = Math.floor((deadlineMs - currentTime) / 1000);
    return diff;
  };

  const formatSlaCountdown = (seconds: number) => {
    if (seconds <= 0) return '00:00 (BREACHED)';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const filteredFreezes = freezes.filter((f) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      f.id.toLowerCase().includes(q) ||
      f.incidentId.toLowerCase().includes(q) ||
      f.targetAccountId.toLowerCase().includes(q) ||
      f.bankName.toLowerCase().includes(q)
    );
  });

  const counts = {
    all: freezes.length,
    pending: freezes.filter((f) => f.status === 'PENDING').length,
    acknowledged: freezes.filter((f) => f.status === 'ACKNOWLEDGED').length,
    frozen: freezes.filter((f) => f.status === 'FROZEN').length,
    rejected: freezes.filter((f) => f.status === 'REJECTED').length,
  };

  return (
    <div className="space-y-4 font-sans text-xs">
      {/* ── TOP BANNER & ACTION BAR ── */}
      <div className="bg-white border border-slate-200 p-4 rounded-2xl flex flex-wrap items-center justify-between gap-3 shadow-saas-card">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-red-50 border border-red-200 rounded-xl text-red-600">
            <AlertOctagon className="w-5 h-5" />
          </div>
          <div>
            <div className="font-bold text-slate-900 text-sm font-sans flex items-center gap-2">
              <span>EMERGENCY FREEZE REQUEST DISPATCH & SLA TRACKER</span>
              <span className="text-[10px] bg-red-100 text-red-700 font-bold px-2 py-0.5 rounded-full border border-red-200">
                30-MIN MANDATE
              </span>
            </div>
            <div className="text-[11px] text-slate-500">
              Inter-bank swift account freezing pipeline under Section 91 CrPC / I4C emergency cyber directives
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => fetchFreezes()}
            className="p-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-slate-600 transition-colors"
            title="Refresh list"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>

          <button
            onClick={() => setShowNewModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-bold rounded-xl shadow-sm transition-all"
          >
            <PlusCircle className="w-4 h-4" />
            <span>DISPATCH NEW FREEZE</span>
          </button>
        </div>
      </div>

      {/* ── KPI METRICS STRIP ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-white border border-slate-200 p-3.5 rounded-2xl shadow-saas-card flex items-center justify-between">
          <div>
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Active Pending</div>
            <div className="text-xl font-bold text-amber-600 font-mono mt-0.5">{counts.pending}</div>
          </div>
          <div className="p-2 bg-amber-50 rounded-xl text-amber-600">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white border border-slate-200 p-3.5 rounded-2xl shadow-saas-card flex items-center justify-between">
          <div>
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Bank Acknowledged</div>
            <div className="text-xl font-bold text-blue-600 font-mono mt-0.5">{counts.acknowledged}</div>
          </div>
          <div className="p-2 bg-blue-50 rounded-xl text-blue-600">
            <FileCheck className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white border border-slate-200 p-3.5 rounded-2xl shadow-saas-card flex items-center justify-between">
          <div>
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Funds Frozen</div>
            <div className="text-xl font-bold text-emerald-600 font-mono mt-0.5">{counts.frozen}</div>
          </div>
          <div className="p-2 bg-emerald-50 rounded-xl text-emerald-600">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white border border-slate-200 p-3.5 rounded-2xl shadow-saas-card flex items-center justify-between">
          <div>
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Rejected / Closed</div>
            <div className="text-xl font-bold text-slate-700 font-mono mt-0.5">{counts.rejected}</div>
          </div>
          <div className="p-2 bg-slate-100 rounded-xl text-slate-600">
            <XCircle className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* ── FILTER & SEARCH TABS ── */}
      <div className="bg-white border border-slate-200 p-3 rounded-2xl flex flex-wrap items-center justify-between gap-3 shadow-saas-card">
        <div className="flex border border-slate-200 bg-slate-50 rounded-lg p-0.5 text-[10px]">
          {[
            { id: 'ALL', label: 'ALL NOTICES' },
            { id: 'PENDING', label: 'PENDING' },
            { id: 'ACKNOWLEDGED', label: 'ACKNOWLEDGED' },
            { id: 'FROZEN', label: 'FROZEN' },
            { id: 'REJECTED', label: 'REJECTED' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id)}
              className={`px-3 py-1 rounded-md font-bold transition-colors ${
                statusFilter === tab.id
                  ? 'bg-white text-slate-900 shadow-sm border border-slate-200/60'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search Account / Bank / Notice ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-slate-50 border border-slate-200 pl-8 pr-3 py-1.5 text-xs text-slate-900 placeholder-slate-400 rounded-lg focus:border-red-500 focus:outline-none w-64"
          />
        </div>
      </div>

      {/* ── FREEZE NOTICES TABLE ── */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-saas-card">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-sans">
            <thead className="bg-slate-50 border-b border-slate-200 text-[10px] text-slate-500 font-bold uppercase tracking-wider">
              <tr>
                <th className="p-3">NOTICE ID</th>
                <th className="p-3">INCIDENT REF</th>
                <th className="p-3">TARGET ACCOUNT</th>
                <th className="p-3">DESTINATION BANK</th>
                <th className="p-3 text-right">FREEZE AMOUNT</th>
                <th className="p-3">SLA COUNTDOWN</th>
                <th className="p-3">STATUS</th>
                <th className="p-3">DISPATCHED BY</th>
                <th className="p-3 text-center">DETAILS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {loading ? (
                <tr>
                  <td colSpan={9} className="p-8 text-center text-slate-400">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-slate-400" />
                    <span>Loading freeze records...</span>
                  </td>
                </tr>
              ) : filteredFreezes.length === 0 ? (
                <tr>
                  <td colSpan={9} className="p-8 text-center text-slate-500">
                    No freeze requests match your current filters.
                  </td>
                </tr>
              ) : (
                filteredFreezes.map((f) => {
                  const remSecs = getRemainingSeconds(f.slaDeadline);
                  const isPending = f.status === 'PENDING';
                  const isAck = f.status === 'ACKNOWLEDGED';
                  const isFrozen = f.status === 'FROZEN';
                  const isRejected = f.status === 'REJECTED';
                  const isBreached = remSecs <= 0 && (isPending || isAck);

                  return (
                    <tr
                      key={f.id}
                      onClick={() => setSelectedFreeze(f)}
                      className="hover:bg-slate-50/80 cursor-pointer transition-colors"
                    >
                      {/* Notice ID */}
                      <td className="p-3 font-mono font-bold text-red-600">
                        {f.id}
                      </td>

                      {/* Incident Ref */}
                      <td className="p-3 font-mono text-slate-800 font-medium">
                        {f.incidentId}
                      </td>

                      {/* Target Account */}
                      <td className="p-3">
                        <div className="font-mono font-bold text-slate-900">{f.targetAccountId}</div>
                        {f.targetAccountName && (
                          <div className="text-[10px] text-slate-400">{f.targetAccountName}</div>
                        )}
                      </td>

                      {/* Destination Bank */}
                      <td className="p-3 font-medium text-slate-700">
                        <div className="flex items-center gap-1.5">
                          <Building2 className="w-3.5 h-3.5 text-slate-400" />
                          <span>{f.bankName}</span>
                        </div>
                      </td>

                      {/* Freeze Amount */}
                      <td className="p-3 text-right font-mono font-bold text-slate-900">
                        ₹{f.freezeAmount.toLocaleString('en-IN')}
                      </td>

                      {/* SLA Timer */}
                      <td className="p-3">
                        {isFrozen ? (
                          <span className="text-emerald-700 font-bold text-[10px] bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded">
                            EXECUTED IN SLA
                          </span>
                        ) : isRejected ? (
                          <span className="text-slate-400 font-bold text-[10px]">
                            CLOSED
                          </span>
                        ) : isBreached ? (
                          <span className="text-red-700 font-bold font-mono text-[10px] bg-red-100 border border-red-300 px-2 py-0.5 rounded flex items-center gap-1 w-fit animate-pulse">
                            <AlertTriangle className="w-3 h-3 text-red-600" />
                            <span>BREACHED</span>
                          </span>
                        ) : (
                          <span className="text-amber-700 font-bold font-mono text-[11px] bg-amber-50 border border-amber-200 px-2 py-0.5 rounded flex items-center gap-1 w-fit">
                            <Clock className="w-3 h-3 text-amber-600" />
                            <span>{formatSlaCountdown(remSecs)}</span>
                          </span>
                        )}
                      </td>

                      {/* Status */}
                      <td className="p-3">
                        <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold uppercase border ${
                          isFrozen
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : isAck
                            ? 'bg-blue-50 text-blue-700 border-blue-200'
                            : isPending
                            ? 'bg-amber-50 text-amber-700 border-amber-200'
                            : 'bg-slate-100 text-slate-700 border-slate-200'
                        }`}>
                          {f.status}
                        </span>
                      </td>

                      {/* Requested By */}
                      <td className="p-3 text-slate-600 text-[11px]">
                        {f.requestedByOfficerName || 'Cyber Officer'}
                      </td>

                      {/* Action */}
                      <td className="p-3 text-center">
                        <button className="p-1 hover:bg-slate-100 rounded text-slate-400 hover:text-slate-700">
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── DETAIL MODAL ── */}
      {selectedFreeze && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-lg shadow-2xl p-5 space-y-4 font-sans animate-fadeIn">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-red-50 text-red-600 rounded-lg">
                  <AlertOctagon className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-bold text-slate-900 text-sm">Freeze Notice Audit Detail</div>
                  <div className="text-[10px] text-slate-500 font-mono">{selectedFreeze.id}</div>
                </div>
              </div>
              <button
                onClick={() => setSelectedFreeze(null)}
                className="text-slate-400 hover:text-slate-700 text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                <span className="text-[10px] text-slate-400 font-bold block uppercase">Incident ID</span>
                <span className="font-mono font-bold text-slate-800">{selectedFreeze.incidentId}</span>
              </div>
              <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                <span className="text-[10px] text-slate-400 font-bold block uppercase">Amount to Freeze</span>
                <span className="font-mono font-bold text-slate-900 text-sm">₹{selectedFreeze.freezeAmount.toLocaleString('en-IN')}</span>
              </div>
              <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                <span className="text-[10px] text-slate-400 font-bold block uppercase">Target Account</span>
                <span className="font-mono font-bold text-slate-800">{selectedFreeze.targetAccountId}</span>
              </div>
              <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                <span className="text-[10px] text-slate-400 font-bold block uppercase">Target Bank</span>
                <span className="font-bold text-slate-800">{selectedFreeze.bankName}</span>
              </div>
            </div>

            <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 space-y-1">
              <span className="text-[10px] text-slate-400 font-bold uppercase block">Statutory Reason / Memo</span>
              <p className="text-slate-700 text-xs leading-relaxed">{selectedFreeze.reason}</p>
            </div>

            {selectedFreeze.bankReferenceNumber && (
              <div className="bg-emerald-50 border border-emerald-200 p-2.5 rounded-xl text-emerald-800 text-xs flex items-center justify-between">
                <span>Bank Execution Ref:</span>
                <strong className="font-mono">{selectedFreeze.bankReferenceNumber}</strong>
              </div>
            )}

            {selectedFreeze.rejectionReason && (
              <div className="bg-red-50 border border-red-200 p-2.5 rounded-xl text-red-800 text-xs">
                <span className="font-bold block">Rejection Justification:</span>
                <span>{selectedFreeze.rejectionReason}</span>
              </div>
            )}

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setSelectedFreeze(null)}
                className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 transition-colors"
              >
                Close Audit View
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── NEW FREEZE MODAL ── */}
      {showNewModal && (
        <QuickFreezeModal
          incidentId="C-EMERGENCY-DISPATCH"
          defaultAccount=""
          defaultAmount={100000}
          onClose={() => setShowNewModal(false)}
          onFreezeDispatched={() => {
            setShowNewModal(false);
            fetchFreezes();
          }}
        />
      )}
    </div>
  );
};
