import React, { useState } from 'react';
import { AlertOctagon, CheckCircle2, X, AlertCircle, Building2, Clock, ShieldAlert } from 'lucide-react';
import { ApiService } from '../../services/api';
import { FreezeRequest } from '../../types';

interface QuickFreezeModalProps {
  incidentId: string;
  defaultAccountId?: string;
  defaultAccount?: string;
  defaultAmount?: number;
  onClose: () => void;
  onFreezeIssued?: () => void;
  onFreezeDispatched?: (freeze: FreezeRequest) => void;
}

const BANKS_LIST = [
  { id: 'BNK_HDFC', name: 'HDFC Bank Ltd.', code: 'HDFC' },
  { id: 'BNK_SBI', name: 'State Bank of India', code: 'SBIN' },
  { id: 'BNK_ICICI', name: 'ICICI Bank', code: 'ICIC' },
  { id: 'BNK_AXIS', name: 'Axis Bank', code: 'UTIB' },
  { id: 'BNK_PNB', name: 'Punjab National Bank', code: 'PUNB' }
];

export const QuickFreezeModal: React.FC<QuickFreezeModalProps> = ({
  incidentId,
  defaultAccountId,
  defaultAccount,
  defaultAmount,
  onClose,
  onFreezeIssued,
  onFreezeDispatched
}) => {
  const [targetAccount, setTargetAccount] = useState(defaultAccount || defaultAccountId || '189532603540');
  const [bankId, setBankId] = useState(BANKS_LIST[0].id);
  const [freezeAmount, setFreezeAmount] = useState(defaultAmount || 149500);
  const [reason, setReason] = useState('Immediate emergency freeze order: multi-hop mule siphon detected by GraphSAGE AML pipeline');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successNotice, setSuccessNotice] = useState<string | null>(null);

  const handleIssueFreeze = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const selectedBank = BANKS_LIST.find(b => b.id === bankId);
      const res = await ApiService.createFreezeRequest({
        incidentId,
        targetAccountId: targetAccount,
        bankId,
        bankName: selectedBank?.name,
        freezeAmount: Number(freezeAmount),
        reason
      });
      setSuccessNotice(`Notice ${res.id} issued successfully. SLA countdown active.`);
      setTimeout(() => {
        onFreezeDispatched?.(res);
        onFreezeIssued?.();
        onClose();
      }, 1500);
    } catch (err: any) {
      setError(err.message || 'Failed to issue freeze request');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-lg overflow-hidden font-sans">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-red-50 to-orange-50">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-red-600 text-white">
              <AlertOctagon className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Issue Emergency Bank Account Freeze</h3>
              <p className="text-[11px] text-slate-500 font-mono">Case: <span className="font-bold text-red-600">{incidentId}</span> • 60-Min Bank SLA</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1">
            <X className="w-4 h-4" />
          </button>
        </div>

        {successNotice ? (
          <div className="p-8 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h4 className="font-bold text-slate-900 text-base">Emergency Freeze Notice Dispatched</h4>
            <p className="text-xs text-slate-600">{successNotice}</p>
          </div>
        ) : (
          <form onSubmit={handleIssueFreeze} className="p-4 space-y-3.5">
            {error && (
              <div className="p-2.5 rounded-lg bg-red-50 border border-red-200 text-red-600 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-700">Target Suspect Account Number</label>
                <input
                  type="text"
                  value={targetAccount}
                  onChange={(e) => setTargetAccount(e.target.value)}
                  required
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs font-mono focus:outline-none focus:border-red-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-700">Target Nodal Bank</label>
                <select
                  value={bankId}
                  onChange={(e) => setBankId(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs font-mono focus:outline-none focus:border-red-500"
                >
                  {BANKS_LIST.map((b) => (
                    <option key={b.id} value={b.id}>{b.name} ({b.code})</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-700">Freeze Amount (INR)</label>
              <input
                type="number"
                value={freezeAmount}
                onChange={(e) => setFreezeAmount(Number(e.target.value))}
                required
                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs font-mono font-bold text-slate-900 focus:outline-none focus:border-red-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-700">LEO Justification & Evidence Summary</label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                rows={2}
                required
                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs focus:outline-none focus:border-red-500"
              />
            </div>

            <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 flex items-start gap-2.5 text-[11px] text-amber-800">
              <Clock className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <strong>Legal Precaution:</strong> Issuing this notice initiates a binding 60-minute SLA for the target bank compliance cell under Section 91 CrPC / IT Act.
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-3.5 py-1.5 rounded-lg border border-slate-200 text-xs font-medium text-slate-600 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-md shadow-red-600/20 disabled:opacity-50 flex items-center gap-1.5"
              >
                {loading ? 'Dispatched...' : <><AlertOctagon className="w-3.5 h-3.5" /> Dispatch Freeze Order</>}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
