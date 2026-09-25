import React, { useState, useEffect } from 'react';
import {
  FolderClock,
  Search,
  PlusCircle,
  Clock,
  CheckCircle2,
  AlertOctagon,
  ArrowRight,
  IndianRupee,
  ShieldAlert,
  RefreshCw
} from 'lucide-react';
import { ApiService } from '../../services/api';
import { CitizenComplaint } from '../../types';
import { useAuth } from '../../context/AuthContext';

interface MyComplaintsListProps {
  onSelectComplaint: (id: string) => void;
  onNewComplaint: () => void;
}

export const MyComplaintsList: React.FC<MyComplaintsListProps> = ({
  onSelectComplaint,
  onNewComplaint,
}) => {
  const { user } = useAuth();
  const [complaints, setComplaints] = useState<CitizenComplaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  const fetchComplaints = async () => {
    try {
      setLoading(true);
      const data = await ApiService.getCitizenComplaints(user?.id);
      setComplaints(data);
    } catch (err) {
      console.error('Failed to load complaints', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaints();
  }, [user?.id]);

  const filtered = complaints.filter((c) => {
    if (statusFilter !== 'ALL' && c.status !== statusFilter) return false;
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      c.referenceNumber.toLowerCase().includes(q) ||
      c.transactionUtr.toLowerCase().includes(q) ||
      c.suspectAccount.toLowerCase().includes(q) ||
      c.category.toLowerCase().includes(q)
    );
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'FUNDS_FROZEN':
        return { label: 'FUNDS SECURED / FROZEN', bg: 'bg-emerald-50 text-emerald-700 border-emerald-200' };
      case 'FREEZE_INITIATED':
        return { label: 'FREEZE DIRECTIVE SENT', bg: 'bg-amber-50 text-amber-700 border-amber-200' };
      case 'UNDER_INVESTIGATION':
        return { label: 'UNDER INVESTIGATION', bg: 'bg-blue-50 text-blue-700 border-blue-200' };
      case 'UNDER_TRIAGE':
        return { label: 'AI GRAPH TRIAGE', bg: 'bg-orange-50 text-orange-700 border-orange-200' };
      case 'RESOLVED':
        return { label: 'RESOLVED', bg: 'bg-slate-100 text-slate-800 border-slate-300' };
      default:
        return { label: status, bg: 'bg-slate-50 text-slate-600 border-slate-200' };
    }
  };

  return (
    <div className="space-y-4 font-sans text-xs">
      {/* ── HEADER BANNER ── */}
      <div className="bg-white border border-slate-200 p-4 rounded-2xl flex flex-wrap items-center justify-between gap-3 shadow-saas-card">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-orange-50 border border-orange-200 rounded-xl text-[#FF5500]">
            <FolderClock className="w-5 h-5" />
          </div>
          <div>
            <div className="font-bold text-slate-900 text-sm">
              MY CYBERCRIME COMPLAINTS & FRAUD REPORTS
            </div>
            <div className="text-[11px] text-slate-500">
              Track investigative progress, assigned police officers, and bank account freeze execution status
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => fetchComplaints()}
            className="p-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-slate-600 transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>

          <button
            onClick={onNewComplaint}
            className="flex items-center gap-1.5 px-4 py-2 bg-[#FF5500] hover:bg-orange-600 text-white font-bold rounded-xl shadow-sm transition-all text-xs"
          >
            <PlusCircle className="w-4 h-4" />
            <span>FILE NEW COMPLAINT</span>
          </button>
        </div>
      </div>

      {/* ── FILTER & SEARCH ── */}
      <div className="bg-white border border-slate-200 p-3 rounded-2xl flex flex-wrap items-center justify-between gap-3 shadow-saas-card">
        <div className="flex border border-slate-200 bg-slate-50 rounded-lg p-0.5 text-[10px]">
          {[
            { id: 'ALL', label: 'ALL REPORTS' },
            { id: 'UNDER_INVESTIGATION', label: 'IN PROGRESS' },
            { id: 'FUNDS_FROZEN', label: 'FUNDS FROZEN' },
            { id: 'RESOLVED', label: 'RESOLVED' },
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
            placeholder="Search Reference ID / UTR / Suspect..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-slate-50 border border-slate-200 pl-8 pr-3 py-1.5 text-xs text-slate-900 placeholder-slate-400 rounded-lg focus:border-[#FF5500] focus:outline-none w-64"
          />
        </div>
      </div>

      {/* ── COMPLAINT CARDS ── */}
      {loading ? (
        <div className="p-12 text-center text-slate-400">
          <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-[#FF5500]" />
          <span>Loading your complaints...</span>
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center space-y-3 shadow-saas-card">
          <ShieldAlert className="w-10 h-10 text-slate-300 mx-auto" />
          <h3 className="font-bold text-slate-800 text-sm">No complaints found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            You have not reported any cyber fraud incidents matching this filter.
          </p>
          <button
            onClick={onNewComplaint}
            className="px-4 py-2 bg-[#FF5500] text-white rounded-xl text-xs font-bold shadow-sm"
          >
            File First Complaint
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((c) => {
            const badge = getStatusBadge(c.status);

            return (
              <div
                key={c.id}
                onClick={() => onSelectComplaint(c.id)}
                className="bg-white border border-slate-200 hover:border-slate-300 rounded-2xl p-4 shadow-saas-card hover:shadow-md transition-all cursor-pointer space-y-3 group"
              >
                <div className="flex items-start justify-between">
                  <div className="space-y-0.5">
                    <span className="text-[10px] font-mono font-bold text-[#FF5500]">
                      {c.referenceNumber}
                    </span>
                    <h3 className="font-bold text-slate-900 text-xs">
                      {c.category.replace(/_/g, ' ')}
                    </h3>
                  </div>

                  <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold border uppercase ${badge.bg}`}>
                    {badge.label}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                  <div>
                    <span className="text-[9px] uppercase font-bold text-slate-400 block">Lost Amount</span>
                    <span className="font-mono font-bold text-red-600">₹{c.amount.toLocaleString('en-IN')}</span>
                  </div>
                  <div>
                    <span className="text-[9px] uppercase font-bold text-slate-400 block">Bank UTR</span>
                    <span className="font-mono font-medium text-slate-800 truncate block">{c.transactionUtr}</span>
                  </div>
                  <div>
                    <span className="text-[9px] uppercase font-bold text-slate-400 block">Suspect Account</span>
                    <span className="font-mono text-slate-800">{c.suspectAccount}</span>
                  </div>
                  <div>
                    <span className="text-[9px] uppercase font-bold text-slate-400 block">Filed On</span>
                    <span className="text-slate-600">{new Date(c.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1 text-[11px] text-slate-500">
                  <div className="flex items-center gap-1 text-slate-600">
                    <span>Officer:</span>
                    <strong className="text-slate-800">{c.assignedOfficerName || 'Under Triage'}</strong>
                  </div>

                  <div className="flex items-center gap-1 text-[#FF5500] font-bold group-hover:translate-x-0.5 transition-transform">
                    <span>Track Case</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
