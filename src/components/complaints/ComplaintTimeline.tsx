import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  Clock,
  CheckCircle2,
  AlertOctagon,
  ArrowLeft,
  Building2,
  User,
  Phone,
  FileText,
  Lock,
  Sparkles,
  Download,
  AlertTriangle,
  RefreshCw
} from 'lucide-react';
import { ApiService } from '../../services/api';
import { CitizenComplaint, ComplaintLifecycleStatus } from '../../types';

interface ComplaintTimelineProps {
  complaintId: string;
  onBack: () => void;
}

interface TimelineStep {
  statusKey: ComplaintLifecycleStatus;
  title: string;
  desc: string;
  timestamp?: string;
  icon: any;
  color: string;
}

export const ComplaintTimeline: React.FC<ComplaintTimelineProps> = ({
  complaintId,
  onBack,
}) => {
  const [complaint, setComplaint] = useState<CitizenComplaint | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDetail = async () => {
    try {
      setLoading(true);
      const data = await ApiService.getComplaintTimeline(complaintId);
      setComplaint(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load complaint timeline.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetail();
  }, [complaintId]);

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto p-12 text-center text-slate-400">
        <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-3 text-[#FF5500]" />
        <p className="font-bold text-xs">Loading Live Case Timeline...</p>
      </div>
    );
  }

  if (error || !complaint) {
    return (
      <div className="max-w-3xl mx-auto p-8 bg-white border border-slate-200 rounded-3xl shadow-saas-card text-center space-y-3">
        <AlertTriangle className="w-8 h-8 text-red-500 mx-auto" />
        <h3 className="font-bold text-slate-900">Complaint Not Found</h3>
        <p className="text-xs text-slate-500">{error || 'Unable to retrieve case information.'}</p>
        <button
          onClick={onBack}
          className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold"
        >
          Return to Complaints
        </button>
      </div>
    );
  }

  const ORDERED_STEPS: TimelineStep[] = [
    {
      statusKey: 'SUBMITTED',
      title: '1. Incident Complaint Intake & Registration',
      desc: 'Complaint officially registered on National Cybercrime Portal. Reference ID generated.',
      icon: FileText,
      color: 'text-blue-600 bg-blue-50 border-blue-200',
    },
    {
      statusKey: 'UNDER_TRIAGE',
      title: '2. AI GraphSAGE Triage & Mule Ring Analysis',
      desc: `Automated graph inference evaluated suspect node risk. High-confidence fraud pattern classified.`,
      icon: Sparkles,
      color: 'text-orange-600 bg-orange-50 border-orange-200',
    },
    {
      statusKey: 'UNDER_INVESTIGATION',
      title: '3. Investigating Officer Assigned',
      desc: `Assigned to ${complaint.assignedOfficerName || 'Cyber Crime Police Station'} for formal inquiry.`,
      icon: User,
      color: 'text-purple-600 bg-purple-50 border-purple-200',
    },
    {
      statusKey: 'FREEZE_INITIATED',
      title: '4. Statutory Emergency Freeze Directive Dispatched',
      desc: 'Section 91 CrPC notice transmitted to destination bank nodal compliance desk with 30-min SLA.',
      icon: AlertOctagon,
      color: 'text-amber-600 bg-amber-50 border-amber-200',
    },
    {
      statusKey: 'FUNDS_FROZEN',
      title: '5. Bank Core Banking Lien Executed',
      desc: 'Destination bank confirmed account freeze. Disputed funds locked from cash-out or ATM siphon.',
      icon: Lock,
      color: 'text-emerald-600 bg-emerald-50 border-emerald-200',
    },
    {
      statusKey: 'RESOLVED',
      title: '6. Case Closure & Restitution Initiation',
      desc: 'Court de-freeze & refund processing initiated under Magistrate supervision.',
      icon: CheckCircle2,
      color: 'text-slate-900 bg-slate-100 border-slate-300',
    },
  ];

  const getStepStatus = (stepKey: ComplaintLifecycleStatus) => {
    const stageOrder: ComplaintLifecycleStatus[] = [
      'SUBMITTED',
      'UNDER_TRIAGE',
      'UNDER_INVESTIGATION',
      'FREEZE_INITIATED',
      'FUNDS_FROZEN',
      'RESOLVED',
    ];

    const currentIndex = stageOrder.indexOf(complaint.status);
    const stepIndex = stageOrder.indexOf(stepKey);

    if (stepIndex < currentIndex) return 'COMPLETED';
    if (stepIndex === currentIndex) return 'CURRENT';
    return 'UPCOMING';
  };

  return (
    <div className="max-w-4xl mx-auto space-y-4 font-sans text-xs animate-fadeIn">
      {/* ── TOP NAVIGATION ── */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold rounded-xl shadow-sm transition-colors text-xs"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to All Complaints</span>
        </button>

        <span className="text-[11px] text-slate-500">
          Last Synchronized: <strong>{new Date().toLocaleTimeString()}</strong>
        </span>
      </div>

      {/* ── CASE SUMMARY HERO CARD ── */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-saas-card space-y-5">
        <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-100 pb-5">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#FF5500]/10 text-[#FF5500] border border-[#FF5500]/30 font-mono">
                {complaint.referenceNumber}
              </span>
              <span className="text-[10px] font-bold text-slate-500 uppercase">
                {complaint.category.replace('_', ' ')}
              </span>
            </div>
            <h1 className="text-base font-bold text-slate-900 font-sans">
              Cybercrime Complaint Case Tracking
            </h1>
            <p className="text-[11px] text-slate-500">
              Filed by <strong>{complaint.complainantName}</strong> on{' '}
              {new Date(complaint.createdAt).toLocaleDateString()}
            </p>
          </div>

          <div className="text-right">
            <div className="text-[10px] text-slate-400 uppercase font-bold">Disputed Amount</div>
            <div className="text-xl font-bold text-red-600 font-mono">
              ₹{complaint.amount.toLocaleString('en-IN')}
            </div>
            <div className="text-[10px] text-slate-500 font-mono">UTR: {complaint.transactionUtr}</div>
          </div>
        </div>

        {/* Quick Info Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
          <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100">
            <span className="text-[9px] uppercase font-bold text-slate-400 block">Victim Account</span>
            <span className="font-mono font-bold text-slate-800">{complaint.victimAccount}</span>
            <span className="text-[10px] text-slate-400 block">IFSC: {complaint.victimIfsc}</span>
          </div>

          <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100">
            <span className="text-[9px] uppercase font-bold text-slate-400 block">Suspect Account</span>
            <span className="font-mono font-bold text-slate-800">{complaint.suspectAccount}</span>
            {complaint.suspectIfsc && (
              <span className="text-[10px] text-slate-400 block">IFSC: {complaint.suspectIfsc}</span>
            )}
          </div>

          <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100">
            <span className="text-[9px] uppercase font-bold text-slate-400 block">AI Risk Tier</span>
            <span className="font-bold text-[#FF5500]">{complaint.confidenceTier || 'HIGH_CONFIDENCE'}</span>
            <span className="text-[10px] text-slate-400 block font-mono">Score: {((complaint.riskScore || 0.94) * 100).toFixed(1)}%</span>
          </div>

          <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100">
            <span className="text-[9px] uppercase font-bold text-slate-400 block">Assigned Officer</span>
            <span className="font-bold text-slate-800">{complaint.assignedOfficerName || 'Cyber Police Desk'}</span>
            <span className="text-[10px] text-slate-400 block">{complaint.jurisdictionName || 'State Cyber Cell'}</span>
          </div>
        </div>
      </div>

      {/* ── INTERACTIVE TIMELINE ── */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-saas-card space-y-6">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="font-bold text-slate-900 text-sm flex items-center gap-2">
            <Clock className="w-4 h-4 text-[#FF5500]" />
            <span>Real-Time Case Progress & Inter-Bank Lien Lifecycle</span>
          </div>
          <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
            Active Multi-Agency Sync
          </span>
        </div>

        <div className="relative pl-6 space-y-8 before:absolute before:left-3 before:top-3 before:bottom-3 before:w-0.5 before:bg-slate-200">
          {ORDERED_STEPS.map((st) => {
            const stepState = getStepStatus(st.statusKey);
            const Icon = st.icon;

            return (
              <div key={st.statusKey} className="relative flex items-start gap-4">
                {/* Dot */}
                <div
                  className={`absolute -left-6 top-0 w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs border-2 transition-all ${
                    stepState === 'COMPLETED'
                      ? 'bg-emerald-500 text-white border-emerald-500 shadow-md shadow-emerald-500/30'
                      : stepState === 'CURRENT'
                      ? 'bg-[#FF5500] text-white border-[#FF5500] ring-4 ring-orange-500/20 shadow-md'
                      : 'bg-white text-slate-400 border-slate-300'
                  }`}
                >
                  {stepState === 'COMPLETED' ? (
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  ) : (
                    <Icon className="w-3 h-3" />
                  )}
                </div>

                {/* Content */}
                <div
                  className={`flex-1 p-4 rounded-2xl border transition-all ${
                    stepState === 'CURRENT'
                      ? 'bg-orange-50/40 border-orange-200 shadow-sm'
                      : stepState === 'COMPLETED'
                      ? 'bg-white border-slate-200'
                      : 'bg-slate-50/50 border-slate-100 opacity-60'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <h3 className={`font-bold text-xs ${stepState === 'CURRENT' ? 'text-[#FF5500]' : 'text-slate-900'}`}>
                      {st.title}
                    </h3>
                    <span
                      className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase ${
                        stepState === 'COMPLETED'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : stepState === 'CURRENT'
                          ? 'bg-orange-100 text-[#FF5500] font-bold animate-pulse'
                          : 'bg-slate-100 text-slate-400'
                      }`}
                    >
                      {stepState}
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-600 mt-1 leading-relaxed">{st.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
