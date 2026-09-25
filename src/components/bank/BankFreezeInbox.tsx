import React, { useState, useEffect } from 'react';
import {
  Building2,
  AlertOctagon,
  CheckCircle2,
  XCircle,
  Clock,
  ShieldCheck,
  Search,
  RefreshCw,
  FileCheck,
  AlertTriangle,
  Lock,
  ArrowRight
} from 'lucide-react';
import { ApiService } from '../../services/api';
import { FreezeRequest, FreezeStatus } from '../../types';
import { useAuth } from '../../context/AuthContext';

export const BankFreezeInbox: React.FC = () => {
  const { user } = useAuth();
  const [freezes, setFreezes] = useState<FreezeRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  // Freeze action modal states
  const [freezeActionModal, setFreezeActionModal] = useState<{
    freeze: FreezeRequest;
    type: 'FREEZE' | 'REJECT';
  } | null>(null);
  const [bankRefNo, setBankRefNo] = useState('');
  const [rejectReason, setRejectReason] = useState('');
  const [submittingAction, setSubmittingAction] = useState(false);
  const [currentTime, setCurrentTime] = useState(Date.now());

  const fetchBankFreezes = async () => {
    try {
      setLoading(true);
      const data = await ApiService.getFreezeRequests();
      // Filter for bank if user has bankId or show all if admin/demo
      const userBankId = user?.bankId;
      if (userBankId && userBankId !== 'BNK-HDFC-01') {
        setFreezes(data.filter((f) => f.bankId === userBankId));
      } else {
        setFreezes(data);
      }
    } catch (err) {
      console.error('Failed to load bank freeze notices', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBankFreezes();
    const interval = setInterval(fetchBankFreezes, 10000);
    return () => clearInterval(interval);
  }, [user?.bankId]);

  useEffect(() => {
    const ticker = setInterval(() => setCurrentTime(Date.now()), 1000);
    return () => clearInterval(ticker);
  }, []);

  const handleAcknowledge = async (freezeId: string) => {
    try {
      const updated = await ApiService.acknowledgeFreezeRequest(freezeId);
      setActionSuccess(`Notice #${freezeId} acknowledged. SLA clock paused.`);
      setTimeout(() => setActionSuccess(null), 4000);
      setFreezes((prev) => prev.map((f) => (f.id === freezeId ? updated : f)));
    } catch (err) {
      console.error(err);
    }
  };

  const handleExecuteFreeze = async () => {
    if (!freezeActionModal || !bankRefNo.trim()) return;
    try {
      setSubmittingAction(true);
      const updated = await ApiService.markFrozen(freezeActionModal.freeze.id, bankRefNo.trim());
      setActionSuccess(`Account ${freezeActionModal.freeze.targetAccountId} successfully FROZEN in CBS (Ref: ${bankRefNo})`);
      setTimeout(() => setActionSuccess(null), 5000);
      setFreezes((prev) => prev.map((f) => (f.id === freezeActionModal.freeze.id ? updated : f)));
      setFreezeActionModal(null);
      setBankRefNo('');
    } catch (err) {
      console.error(err);
    } finally {
      setSubmittingAction(false);
    }
  };

  const handleExecuteReject = async () => {
    if (!freezeActionModal || !rejectReason.trim()) return;
    try {
      setSubmittingAction(true);
      const updated = await ApiService.rejectFreezeRequest(freezeActionModal.freeze.id, rejectReason.trim());
      setActionSuccess(`Notice #${freezeActionModal.freeze.id} rejected.`);
      setTimeout(() => setActionSuccess(null), 4000);
      setFreezes((prev) => prev.map((f) => (f.id === freezeActionModal.freeze.id ? updated : f)));
      setFreezeActionModal(null);
      setRejectReason('');
    } catch (err) {
      console.error(err);
    } finally {
      setSubmittingAction(false);
    }
  };

  const getRemainingSeconds = (slaDeadline: string) => {
    const deadlineMs = new Date(slaDeadline).getTime();
    return Math.floor((deadlineMs - currentTime) / 1000);
  };

  const formatSla = (seconds: number) => {
    if (seconds <= 0) return '00:00 (BREACHED)';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const filtered = freezes.filter((f) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      f.id.toLowerCase().includes(q) ||
      f.targetAccountId.toLowerCase().includes(q) ||
      f.bankName.toLowerCase().includes(q) ||
      f.incidentId.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-4 font-sans text-xs">
      {/* ── ACTION SUCCESS BANNER ── */}
      {actionSuccess && (
        <div className="bg-emerald-50 border border-emerald-300 text-emerald-800 px-4 py-3 rounded-2xl flex items-center gap-2 font-medium shadow-sm animate-fadeIn">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
          <span>{actionSuccess}</span>
        </div>
      )}

      {/* ── HEADER BANNER ── */}
      <div className="bg-white border border-slate-200 p-4 rounded-2xl flex flex-wrap items-center justify-between gap-3 shadow-saas-card">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-700">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <div className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <span>BANK NODAL FREEZE ACTION INBOX</span>
              <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full border border-emerald-200">
                {user?.bankName || 'HDFC Bank Nodal Desk'}
              </span>
            </div>
            <div className="text-[11px] text-slate-500">
              Immediate statutory lien execution interface for Law Enforcement Section 91 CrPC freeze notices
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => fetchBankFreezes()}
            className="p-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-slate-600 transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* ── SEARCH & FILTER ── */}
      <div className="bg-white border border-slate-200 p-3 rounded-2xl flex items-center justify-between shadow-saas-card">
        <div className="text-[11px] text-slate-500 font-bold">
          TOTAL INBOUND NOTICES: <span className="text-slate-900 font-mono">{filtered.length}</span>
        </div>

        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search account, notice ID, case..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-slate-50 border border-slate-200 pl-8 pr-3 py-1.5 text-xs text-slate-900 placeholder-slate-400 rounded-lg focus:border-emerald-500 focus:outline-none w-64"
          />
        </div>
      </div>

      {/* ── NOTICES TABLE ── */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-saas-card">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-sans">
            <thead className="bg-slate-50 border-b border-slate-200 text-[10px] text-slate-500 font-bold uppercase tracking-wider">
              <tr>
                <th className="p-3">NOTICE ID</th>
                <th className="p-3">TARGET ACCOUNT</th>
                <th className="p-3 text-right">LIEN AMOUNT</th>
                <th className="p-3">LAW ENFORCEMENT ORIGIN</th>
                <th className="p-3">SLA TIMEOUT</th>
                <th className="p-3">STATUS</th>
                <th className="p-3 text-center">BANK ACTIONS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {loading ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-400">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-slate-400" />
                    <span>Loading inbound freeze requests...</span>
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-500">
                    No active freeze notices for this nodal portal.
                  </td>
                </tr>
              ) : (
                filtered.map((f) => {
                  const remSecs = getRemainingSeconds(f.slaDeadline);
                  const isPending = f.status === 'PENDING';
                  const isAck = f.status === 'ACKNOWLEDGED';
                  const isFrozen = f.status === 'FROZEN';
                  const isRejected = f.status === 'REJECTED';
                  const isBreached = remSecs <= 0 && (isPending || isAck);

                  return (
                    <tr key={f.id} className="hover:bg-slate-50/80 transition-colors">
                      {/* ID */}
                      <td className="p-3 font-mono font-bold text-red-600">
                        {f.id}
                        <div className="text-[10px] text-slate-400 font-mono">{f.incidentId}</div>
                      </td>

                      {/* Account */}
                      <td className="p-3">
                        <div className="font-mono font-bold text-slate-900 text-xs">{f.targetAccountId}</div>
                        <div className="text-[10px] text-slate-500">{f.bankName}</div>
                      </td>

                      {/* Amount */}
                      <td className="p-3 text-right font-mono font-bold text-slate-900 text-sm">
                        ₹{f.freezeAmount.toLocaleString('en-IN')}
                      </td>

                      {/* LEA Origin */}
                      <td className="p-3">
                        <div className="font-medium text-slate-800">{f.requestedByOfficerName || 'Cyber Crime Police'}</div>
                        <div className="text-[10px] text-slate-400 truncate max-w-[200px]" title={f.reason}>
                          {f.reason}
                        </div>
                      </td>

                      {/* SLA */}
                      <td className="p-3">
                        {isFrozen ? (
                          <div className="flex items-center gap-1 text-emerald-700 font-bold text-[10px]">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>COMPLETED</span>
                          </div>
                        ) : isRejected ? (
                          <span className="text-slate-400 font-bold text-[10px]">REJECTED</span>
                        ) : isBreached ? (
                          <span className="text-red-700 font-bold font-mono text-[10px] bg-red-100 border border-red-300 px-2 py-0.5 rounded flex items-center gap-1 w-fit animate-pulse">
                            <AlertTriangle className="w-3 h-3 text-red-600" />
                            <span>SLA BREACHED</span>
                          </span>
                        ) : (
                          <span className="text-amber-700 font-bold font-mono text-[11px] bg-amber-50 border border-amber-200 px-2 py-0.5 rounded flex items-center gap-1 w-fit">
                            <Clock className="w-3 h-3 text-amber-600" />
                            <span>{formatSla(remSecs)}</span>
                          </span>
                        )}
                      </td>

                      {/* Status */}
                      <td className="p-3">
                        <span className={`text-[9px] px-2.5 py-0.5 rounded-full font-bold uppercase border ${
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

                      {/* Bank Actions */}
                      <td className="p-3 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          {isPending && (
                            <button
                              onClick={() => handleAcknowledge(f.id)}
                              className="px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-lg text-[10px] font-bold transition-all"
                              title="Acknowledge receipt to pause SLA penalty"
                            >
                              ACK RECEIPT
                            </button>
                          )}

                          {(isPending || isAck) && (
                            <>
                              <button
                                onClick={() => {
                                  setFreezeActionModal({ freeze: f, type: 'FREEZE' });
                                  setBankRefNo(`CBS-LIEN-${Math.floor(100000 + Math.random() * 900000)}`);
                                }}
                                className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[10px] font-bold shadow-sm transition-all"
                              >
                                MARK FROZEN
                              </button>

                              <button
                                onClick={() => setFreezeActionModal({ freeze: f, type: 'REJECT' })}
                                className="px-2 py-1 bg-slate-100 hover:bg-red-50 hover:text-red-700 border border-slate-200 rounded-lg text-[10px] font-bold text-slate-600 transition-all"
                              >
                                REJECT
                              </button>
                            </>
                          )}

                          {isFrozen && f.bankReferenceNumber && (
                            <span className="font-mono text-[10px] text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded">
                              {f.bankReferenceNumber}
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── EXECUTE FREEZE / REJECT ACTION MODAL ── */}
      {freezeActionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-md shadow-2xl p-5 space-y-4 font-sans animate-fadeIn">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className={`p-2 rounded-xl ${freezeActionModal.type === 'FREEZE' ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
                  {freezeActionModal.type === 'FREEZE' ? <Lock className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
                </div>
                <div>
                  <div className="font-bold text-slate-900 text-sm">
                    {freezeActionModal.type === 'FREEZE' ? 'Confirm Core Banking Freeze' : 'Reject Freeze Directive'}
                  </div>
                  <div className="text-[10px] text-slate-500 font-mono">
                    Notice #{freezeActionModal.freeze.id}
                  </div>
                </div>
              </div>
              <button
                onClick={() => setFreezeActionModal(null)}
                className="text-slate-400 hover:text-slate-700 text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 space-y-1">
                <div className="flex justify-between">
                  <span className="text-slate-500">Target Account:</span>
                  <strong className="font-mono text-slate-900">{freezeActionModal.freeze.targetAccountId}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Lien Amount:</span>
                  <strong className="font-mono text-slate-900">₹{freezeActionModal.freeze.freezeAmount.toLocaleString('en-IN')}</strong>
                </div>
              </div>

              {freezeActionModal.type === 'FREEZE' ? (
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-700 uppercase">
                    CBS / Lien System Reference Number *
                  </label>
                  <input
                    type="text"
                    value={bankRefNo}
                    onChange={(e) => setBankRefNo(e.target.value)}
                    placeholder="e.g. CBS-LIEN-849201"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono text-slate-900 focus:border-emerald-500 focus:outline-none"
                  />
                  <span className="text-[10px] text-slate-400 block">
                    This reference will be transmitted to Law Enforcement and the Citizen timeline.
                  </span>
                </div>
              ) : (
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-700 uppercase">
                    Statutory Reason for Non-Execution *
                  </label>
                  <textarea
                    rows={3}
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                    placeholder="e.g. Account closed prior to notice / Insufficient balance / Inoperative NRE account"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:border-red-500 focus:outline-none"
                  />
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setFreezeActionModal(null)}
                className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl text-xs font-bold hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>

              {freezeActionModal.type === 'FREEZE' ? (
                <button
                  onClick={handleExecuteFreeze}
                  disabled={submittingAction || !bankRefNo.trim()}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-sm disabled:opacity-50 transition-all"
                >
                  {submittingAction ? 'Executing...' : 'Submit CBS Lien & Mark Frozen'}
                </button>
              ) : (
                <button
                  onClick={handleExecuteReject}
                  disabled={submittingAction || !rejectReason.trim()}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold shadow-sm disabled:opacity-50 transition-all"
                >
                  {submittingAction ? 'Rejecting...' : 'Reject Freeze Directive'}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
