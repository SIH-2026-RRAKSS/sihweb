import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  PlusCircle,
  FolderClock,
  Search,
  PhoneCall,
  CheckCircle2,
  Lock,
  ArrowRight,
  IndianRupee,
  AlertTriangle,
  FileCheck,
  ShieldCheck,
  ExternalLink,
  Sparkles
} from 'lucide-react';
import { ApiService } from '../../services/api';
import { CitizenComplaint } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { ComplaintForm } from './ComplaintForm';
import { ComplaintTimeline } from './ComplaintTimeline';
import { MyComplaintsList } from './MyComplaintsList';

interface CitizenPortalProps {
  initialView?: 'home' | 'new-complaint' | 'my-complaints';
}

export const CitizenPortal: React.FC<CitizenPortalProps> = ({ initialView = 'home' }) => {
  const { user } = useAuth();
  const [view, setView] = useState<'home' | 'new' | 'list' | 'timeline'>(
    initialView === 'new-complaint' ? 'new' : initialView === 'my-complaints' ? 'list' : 'home'
  );
  const [complaints, setComplaints] = useState<CitizenComplaint[]>([]);
  const [selectedComplaintId, setSelectedComplaintId] = useState<string | null>(null);
  const [quickTrackUtr, setQuickTrackUtr] = useState('');
  const [trackError, setTrackError] = useState<string | null>(null);

  const fetchSummary = async () => {
    try {
      const data = await ApiService.getCitizenComplaints(user?.id);
      setComplaints(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchSummary();
  }, [user?.id]);

  const handleQuickTrack = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickTrackUtr.trim()) return;
    const match = complaints.find(
      (c) =>
        c.referenceNumber.toLowerCase() === quickTrackUtr.trim().toLowerCase() ||
        c.transactionUtr.toLowerCase() === quickTrackUtr.trim().toLowerCase()
    );

    if (match) {
      setSelectedComplaintId(match.id);
      setView('timeline');
      setTrackError(null);
    } else {
      setTrackError('No active complaint found matching this Reference Number or UTR.');
    }
  };

  const handleComplaintCreated = (newComplaint: CitizenComplaint) => {
    setComplaints((prev) => [newComplaint, ...prev]);
    setSelectedComplaintId(newComplaint.id);
    setView('timeline');
  };

  // Sub-views
  if (view === 'new') {
    return (
      <ComplaintForm
        onSuccess={handleComplaintCreated}
        onCancel={() => setView('home')}
      />
    );
  }

  if (view === 'timeline' && selectedComplaintId) {
    return (
      <ComplaintTimeline
        complaintId={selectedComplaintId}
        onBack={() => setView('home')}
      />
    );
  }

  if (view === 'list') {
    return (
      <MyComplaintsList
        onSelectComplaint={(id) => {
          setSelectedComplaintId(id);
          setView('timeline');
        }}
        onNewComplaint={() => setView('new')}
      />
    );
  }

  const totalLost = complaints.reduce((sum, c) => sum + (c.amount || 0), 0);
  const totalFrozen = complaints
    .filter((c) => c.status === 'FUNDS_FROZEN' || c.status === 'RESOLVED')
    .reduce((sum, c) => sum + (c.amount || 0), 0);

  return (
    <div className="space-y-5 font-sans text-xs animate-fadeIn">
      {/* ── 1. WELCOME & 1930 HELPLINE HERO ── */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white rounded-3xl p-6 shadow-saas-card relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-96 bg-gradient-to-l from-[#FF5500]/10 to-transparent pointer-events-none" />

        <div className="flex flex-wrap items-center justify-between gap-4 relative z-10">
          <div className="space-y-1.5 max-w-xl">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-[#FF5500] text-white">
                OFFICIAL CITIZEN PORTAL
              </span>
              <span className="text-slate-400 text-[11px]">Govt. of India · I4C Integrated</span>
            </div>
            <h1 className="text-xl font-bold text-white font-sans">
              Welcome back, {user?.name || 'Citizen'}
            </h1>
            <p className="text-xs text-slate-300 leading-relaxed">
              Report financial cyber fraud immediately to trigger the automated 30-minute bank account freeze mandate under Section 91 CrPC.
            </p>
          </div>

          {/* National 1930 Helpline Badge */}
          <div className="bg-white/10 backdrop-blur-md border border-white/20 p-4 rounded-2xl flex items-center gap-3.5 shadow-lg">
            <div className="p-3 bg-red-600 text-white rounded-xl animate-pulse">
              <PhoneCall className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[10px] font-bold text-slate-300 uppercase">National Cyber Helpline</div>
              <div className="text-lg font-bold font-mono text-white tracking-wider">DIAL 1930</div>
              <div className="text-[9px] text-emerald-400 font-bold">24x7 Toll Free Support</div>
            </div>
          </div>
        </div>
      </div>

      {/* ── 2. QUICK ACTIONS BENTO GRID ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Action 1: File Complaint */}
        <div
          onClick={() => setView('new')}
          className="bg-white border border-slate-200 hover:border-orange-300 rounded-3xl p-5 shadow-saas-card hover:shadow-lg transition-all cursor-pointer group space-y-3"
        >
          <div className="p-3 bg-orange-50 text-[#FF5500] rounded-2xl w-fit group-hover:scale-105 transition-transform">
            <PlusCircle className="w-6 h-6" />
          </div>
          <div>
            <h2 className="font-bold text-slate-900 text-sm">File New Cyber Fraud Report</h2>
            <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
              Report unauthorized UPI debits, fake trading apps, or APK malware. Immediate AI triage enabled.
            </p>
          </div>
          <div className="flex items-center gap-1.5 text-[#FF5500] font-bold text-xs pt-2">
            <span>Launch Filing Wizard</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>

        {/* Action 2: View My Complaints */}
        <div
          onClick={() => setView('list')}
          className="bg-white border border-slate-200 hover:border-blue-300 rounded-3xl p-5 shadow-saas-card hover:shadow-lg transition-all cursor-pointer group space-y-3"
        >
          <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl w-fit group-hover:scale-105 transition-transform">
            <FolderClock className="w-6 h-6" />
          </div>
          <div>
            <h2 className="font-bold text-slate-900 text-sm">My Reported Complaints ({complaints.length})</h2>
            <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
              Check investigating officer notes, police station communications, and court restitution status.
            </p>
          </div>
          <div className="flex items-center gap-1.5 text-blue-600 font-bold text-xs pt-2">
            <span>View All Cases</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>

        {/* Action 3: Quick UTR Tracker Form */}
        <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-saas-card space-y-3">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl w-fit">
            <Lock className="w-6 h-6" />
          </div>
          <div>
            <h2 className="font-bold text-slate-900 text-sm">Track Freeze by UTR / Ref ID</h2>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Enter 12-digit transaction UTR or CYB Reference ID
            </p>
          </div>

          <form onSubmit={handleQuickTrack} className="space-y-2 pt-1">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="e.g. CYB-2026-84920 or 4268192..."
                value={quickTrackUtr}
                onChange={(e) => {
                  setQuickTrackUtr(e.target.value);
                  setTrackError(null);
                }}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-8 pr-3 py-1.5 text-xs text-slate-900 focus:border-emerald-500 focus:outline-none font-mono"
              />
            </div>
            {trackError && <div className="text-[10px] text-red-600 font-bold">{trackError}</div>}
            <button
              type="submit"
              className="w-full py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold text-xs transition-colors"
            >
              Track Case
            </button>
          </form>
        </div>
      </div>

      {/* ── 3. METRICS OVERVIEW STRIP ── */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-saas-card">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Reported Lost</div>
          <div className="text-xl font-bold text-red-600 font-mono mt-0.5">
            ₹{totalLost.toLocaleString('en-IN')}
          </div>
        </div>

        <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-saas-card">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Funds Intercepted & Frozen</div>
          <div className="text-xl font-bold text-emerald-600 font-mono mt-0.5">
            ₹{totalFrozen.toLocaleString('en-IN')}
          </div>
        </div>

        <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-saas-card col-span-2 md:col-span-1">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Active Investigations</div>
          <div className="text-xl font-bold text-blue-600 font-mono mt-0.5">
            {complaints.length} Cases
          </div>
        </div>
      </div>

      {/* ── 4. RECENT ACTIVITY & FRAUD ALERTS ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Recent Cases */}
        <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-saas-card space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h2 className="font-bold text-slate-900 text-xs flex items-center gap-2">
              <FolderClock className="w-4 h-4 text-slate-500" />
              <span>Recent Complaint Filings</span>
            </h2>
            <button
              onClick={() => setView('list')}
              className="text-[#FF5500] font-bold text-[11px] hover:underline"
            >
              View All
            </button>
          </div>

          {complaints.length === 0 ? (
            <div className="py-6 text-center text-slate-400">
              No cyber fraud reports filed yet.
            </div>
          ) : (
            <div className="space-y-2">
              {complaints.slice(0, 3).map((c) => (
                <div
                  key={c.id}
                  onClick={() => {
                    setSelectedComplaintId(c.id);
                    setView('timeline');
                  }}
                  className="p-3 bg-slate-50 hover:bg-slate-100 rounded-2xl border border-slate-200/70 flex items-center justify-between cursor-pointer transition-colors"
                >
                  <div>
                    <div className="font-mono font-bold text-[#FF5500] text-[11px]">{c.referenceNumber}</div>
                    <div className="text-[11px] text-slate-700 font-medium">{c.category.replace(/_/g, ' ')}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-mono font-bold text-slate-900">₹{c.amount.toLocaleString('en-IN')}</div>
                    <div className="text-[9px] text-emerald-600 font-bold uppercase">{c.status.replace(/_/g, ' ')}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Cyber Safety Warning Bulletin */}
        <div className="bg-amber-50/60 border border-amber-200 rounded-3xl p-5 space-y-3">
          <div className="flex items-center gap-2 text-amber-800 font-bold text-xs">
            <AlertTriangle className="w-4 h-4 text-amber-600" />
            <span>Cybercrime Advisory & Red Flags</span>
          </div>

          <ul className="space-y-2 text-[11px] text-slate-700 leading-relaxed">
            <li className="flex items-start gap-2">
              <span className="text-amber-600 font-bold">•</span>
              <span><strong>Never install APK files</strong> received via WhatsApp or SMS claiming to update electricity bills or bank KYC.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-amber-600 font-bold">•</span>
              <span><strong>Police & CBI never "digitally arrest"</strong> citizens over Skype/WhatsApp video calls. Hang up and dial 1930.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-amber-600 font-bold">•</span>
              <span><strong>UPI PIN is only for sending money</strong>, never for receiving rewards or cashback.</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};
