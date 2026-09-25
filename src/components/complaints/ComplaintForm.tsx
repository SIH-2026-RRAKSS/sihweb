import React, { useState } from 'react';
import {
  ShieldAlert,
  IndianRupee,
  Building2,
  FileText,
  User,
  Phone,
  Calendar,
  CreditCard,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  AlertCircle,
  HelpCircle,
  Sparkles
} from 'lucide-react';
import { ApiService } from '../../services/api';
import { ComplaintCreatePayload, CitizenComplaint } from '../../types';
import { EvidenceDropzone, UploadedFileItem } from './EvidenceDropzone';
import { useAuth } from '../../context/AuthContext';

interface ComplaintFormProps {
  onSuccess: (complaint: CitizenComplaint) => void;
  onCancel?: () => void;
}

export const ComplaintForm: React.FC<ComplaintFormProps> = ({ onSuccess, onCancel }) => {
  const { user } = useAuth();
  const [step, setStep] = useState<number>(1);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Form fields
  const [formData, setFormData] = useState<ComplaintCreatePayload>({
    complainantName: user?.name || '',
    phone: user?.phone || '',
    victimAccount: '',
    victimIfsc: '',
    suspectAccount: '',
    suspectIfsc: '',
    amount: 0,
    transactionUtr: '',
    transactionTimestamp: new Date().toISOString().slice(0, 16),
    category: 'UPI_FRAUD',
    incidentNarrative: '',
    jurisdictionId: 'JUR-DEL-01',
  });

  const [evidenceFiles, setEvidenceFiles] = useState<UploadedFileItem[]>([]);

  const SCAM_CATEGORIES = [
    { id: 'UPI_FRAUD', label: 'UPI / QR Code Fraud', desc: 'Money deducted during payment or scan' },
    { id: 'TASK_FRAUD', label: 'Part-Time Job / Telegram Task Scam', desc: 'Like/Subscribe rating schemes' },
    { id: 'INVESTMENT_SCAM', label: 'Fake Stock / Crypto Trading App', desc: 'High return investment deception' },
    { id: 'APK_MALWARE', label: 'Electricity / KYC APK Fraud', desc: 'Malicious app installed on device' },
    { id: 'LOAN_HARASSMENT', label: 'Instant Loan App Blackmail', desc: 'Unauthorized loan deduction' },
    { id: 'IMPERSONATION_POLICE', label: 'Digital Arrest / Police Impersonation', desc: 'Fake CBI/Customs/Police video call' },
    { id: 'OTHER_CYBER_FRAUD', label: 'Other Cyber Financial Fraud', desc: 'Any other illicit bank transfer' },
  ];

  const updateField = (field: keyof ComplaintCreatePayload, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setErrorMessage(null);
  };

  const validateStep1 = () => {
    if (!formData.complainantName.trim()) {
      setErrorMessage('Please provide your full legal name.');
      return false;
    }
    if (!formData.phone || formData.phone.trim().length < 10) {
      setErrorMessage('Please provide a valid 10-digit mobile phone number.');
      return false;
    }
    return true;
  };

  const validateStep2 = () => {
    if (!formData.victimAccount.trim()) {
      setErrorMessage('Please provide your debited Bank Account number.');
      return false;
    }
    if (!formData.victimIfsc.trim() || formData.victimIfsc.length < 5) {
      setErrorMessage('Please enter your Bank Branch IFSC code.');
      return false;
    }
    if (!formData.amount || formData.amount <= 0) {
      setErrorMessage('Please enter a valid disputed fraud amount in INR (₹).');
      return false;
    }
    if (!formData.transactionUtr.trim() || formData.transactionUtr.length < 8) {
      setErrorMessage('Please enter the 12-digit UPI Reference / Bank UTR Number.');
      return false;
    }
    return true;
  };

  const validateStep3 = () => {
    if (!formData.suspectAccount.trim()) {
      setErrorMessage('Please specify the recipient / suspect Account Number or UPI ID.');
      return false;
    }
    return true;
  };

  const handleNext = () => {
    if (step === 1 && !validateStep1()) return;
    if (step === 2 && !validateStep2()) return;
    if (step === 3 && !validateStep3()) return;
    setErrorMessage(null);
    setStep((prev) => Math.min(4, prev + 1));
  };

  const handleBack = () => {
    setErrorMessage(null);
    setStep((prev) => Math.max(1, prev - 1));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateStep1() || !validateStep2() || !validateStep3()) return;

    try {
      setSubmitting(true);
      setErrorMessage(null);
      const createdComplaint = await ApiService.createCitizenComplaint(formData);
      onSuccess(createdComplaint);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to submit complaint to cyber portal.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto bg-white border border-slate-200 rounded-3xl shadow-saas-card overflow-hidden font-sans text-xs animate-fadeIn">
      {/* ── HEADER BANNER ── */}
      <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-[#FF5500] text-white rounded-2xl shadow-lg">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-base font-bold font-sans">NATIONAL CYBERCRIME REPORTING PORTAL</h1>
              <p className="text-[11px] text-slate-300">
                Immediate Inter-Bank Layer Freezing & AI Graph Ring Investigation Intake
              </p>
            </div>
          </div>

          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 bg-white/10 rounded-full border border-white/20 text-[10px] font-bold">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>AI Automated Triage Active</span>
          </div>
        </div>

        {/* Stepper Dots */}
        <div className="flex items-center justify-between mt-6 max-w-xl mx-auto">
          {[
            { num: 1, label: 'Complainant' },
            { num: 2, label: 'Transaction' },
            { num: 3, label: 'Suspect Account' },
            { num: 4, label: 'Evidence & Submit' },
          ].map((s, idx) => (
            <React.Fragment key={s.num}>
              <div className="flex flex-col items-center gap-1">
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs transition-all ${
                    step === s.num
                      ? 'bg-[#FF5500] text-white ring-4 ring-orange-500/30 font-mono'
                      : step > s.num
                      ? 'bg-emerald-500 text-white font-mono'
                      : 'bg-slate-700 text-slate-400'
                  }`}
                >
                  {step > s.num ? '✓' : s.num}
                </div>
                <span className={`text-[10px] ${step === s.num ? 'text-white font-bold' : 'text-slate-400'}`}>
                  {s.label}
                </span>
              </div>
              {idx < 3 && (
                <div
                  className={`flex-1 h-0.5 mx-2 rounded ${
                    step > s.num ? 'bg-emerald-500' : 'bg-slate-700'
                  }`}
                />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* ── FORM CONTENT ── */}
      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        {errorMessage && (
          <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-2xl flex items-center gap-2 text-xs animate-fadeIn">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span className="font-bold">{errorMessage}</span>
          </div>
        )}

        {/* STEP 1: COMPLAINANT DETAILS */}
        {step === 1 && (
          <div className="space-y-4 animate-fadeIn">
            <div className="border-b border-slate-100 pb-2">
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <User className="w-4 h-4 text-[#FF5500]" />
                <span>Complainant Identification</span>
              </h2>
              <p className="text-[11px] text-slate-500">
                Please provide your contact details for official SMS alerts and IO police communication.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-700 uppercase">
                  Full Legal Name *
                </label>
                <div className="relative">
                  <User className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. Ramesh Kumar Verma"
                    value={formData.complainantName}
                    onChange={(e) => updateField('complainantName', e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-900 focus:border-[#FF5500] focus:outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-700 uppercase">
                  Active Mobile Phone (for OTP & 1930 Updates) *
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="tel"
                    required
                    placeholder="10-digit mobile number"
                    maxLength={10}
                    value={formData.phone}
                    onChange={(e) => updateField('phone', e.target.value.replace(/\D/g, ''))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-900 focus:border-[#FF5500] focus:outline-none font-mono"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-700 uppercase">
                Jurisdiction / Cyber Police Station
              </label>
              <select
                value={formData.jurisdictionId}
                onChange={(e) => updateField('jurisdictionId', e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:border-[#FF5500] focus:outline-none font-medium"
              >
                <option value="JUR-DEL-01">Delhi State Cyber Crime Cell (HQ New Delhi)</option>
                <option value="JUR-MUM-01">Maharashtra Cyber Crime HQ (Mumbai Bandra)</option>
                <option value="JUR-BLR-01">Karnataka Cyber Police Station (Bengaluru City)</option>
                <option value="JUR-HYD-01">Telangana Cyber Security Bureau (Hyderabad)</option>
                <option value="JUR-NOI-01">UP Cyber Police Station (Noida Sector 36)</option>
              </select>
            </div>
          </div>
        )}

        {/* STEP 2: TRANSACTION & VICTIM ACCOUNT */}
        {step === 2 && (
          <div className="space-y-4 animate-fadeIn">
            <div className="border-b border-slate-100 pb-2">
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-[#FF5500]" />
                <span>Victim Account & Fraudulent Transaction Details</span>
              </h2>
              <p className="text-[11px] text-slate-500">
                Specify the exact debited bank account and UPI Reference / UTR Number for automated freeze triggering.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-700 uppercase">
                  Your Debited Account Number *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 50100492819201"
                  value={formData.victimAccount}
                  onChange={(e) => updateField('victimAccount', e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:border-[#FF5500] focus:outline-none font-mono"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-700 uppercase">
                  Your Bank Branch IFSC *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. HDFC0001234"
                  maxLength={11}
                  value={formData.victimIfsc}
                  onChange={(e) => updateField('victimIfsc', e.target.value.toUpperCase())}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:border-[#FF5500] focus:outline-none font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-700 uppercase">
                  Total Disputed Amount Lost (₹) *
                </label>
                <div className="relative">
                  <IndianRupee className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="number"
                    required
                    min={1}
                    placeholder="e.g. 150000"
                    value={formData.amount || ''}
                    onChange={(e) => updateField('amount', parseFloat(e.target.value) || 0)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-900 focus:border-[#FF5500] focus:outline-none font-mono text-sm font-bold"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-700 uppercase">
                  12-Digit UPI UTR / Bank Reference No *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 426819284729"
                  value={formData.transactionUtr}
                  onChange={(e) => updateField('transactionUtr', e.target.value.trim())}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:border-[#FF5500] focus:outline-none font-mono font-bold"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-700 uppercase">
                Transaction Date & Time
              </label>
              <input
                type="datetime-local"
                value={formData.transactionTimestamp}
                onChange={(e) => updateField('transactionTimestamp', e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:border-[#FF5500] focus:outline-none"
              />
            </div>
          </div>
        )}

        {/* STEP 3: SUSPECT DETAILS & SCAM TYPE */}
        {step === 3 && (
          <div className="space-y-4 animate-fadeIn">
            <div className="border-b border-slate-100 pb-2">
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Building2 className="w-4 h-4 text-[#FF5500]" />
                <span>Suspect / Recipient Beneficiary Information</span>
              </h2>
              <p className="text-[11px] text-slate-500">
                Where did the stolen funds go? This account will be immediately queued for graph trace & freeze notice.
              </p>
            </div>

            <div className="space-y-2">
              <label className="text-[11px] font-bold text-slate-700 uppercase">
                Select Fraud Modus Operandi / Category *
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                {SCAM_CATEGORIES.map((cat) => (
                  <div
                    key={cat.id}
                    onClick={() => updateField('category', cat.id)}
                    className={`p-3 rounded-2xl border cursor-pointer transition-all ${
                      formData.category === cat.id
                        ? 'border-[#FF5500] bg-orange-50/50 shadow-sm'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <div className="font-bold text-slate-900 text-xs">{cat.label}</div>
                    <div className="text-[10px] text-slate-500">{cat.desc}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-700 uppercase">
                  Suspect Account No / UPI ID (VPA) *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. fraudster99@okhdfcbank or 9920192840"
                  value={formData.suspectAccount}
                  onChange={(e) => updateField('suspectAccount', e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:border-[#FF5500] focus:outline-none font-mono"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-700 uppercase">
                  Suspect Bank IFSC (if known)
                </label>
                <input
                  type="text"
                  placeholder="e.g. SBIN0004928"
                  maxLength={11}
                  value={formData.suspectIfsc}
                  onChange={(e) => updateField('suspectIfsc', e.target.value.toUpperCase())}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:border-[#FF5500] focus:outline-none font-mono"
                />
              </div>
            </div>
          </div>
        )}

        {/* STEP 4: EVIDENCE & NARRATIVE */}
        {step === 4 && (
          <div className="space-y-4 animate-fadeIn">
            <div className="border-b border-slate-100 pb-2">
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <FileText className="w-4 h-4 text-[#FF5500]" />
                <span>Incident Narrative & Evidence Attachments</span>
              </h2>
              <p className="text-[11px] text-slate-500">
                Briefly describe how the fraud took place and attach relevant screenshots or SMS alerts.
              </p>
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-700 uppercase">
                Incident Description & Narrative
              </label>
              <textarea
                rows={4}
                value={formData.incidentNarrative}
                onChange={(e) => updateField('incidentNarrative', e.target.value)}
                placeholder="Explain the sequence of events (e.g., received a Telegram message offering part-time review work, asked to deposit ₹50,000 for VIP task...)"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-900 focus:border-[#FF5500] focus:outline-none leading-relaxed"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-700 uppercase">
                Attach Supporting Evidence
              </label>
              <EvidenceDropzone
                files={evidenceFiles}
                onFilesChange={setEvidenceFiles}
                maxFiles={5}
              />
            </div>

            {/* Summary preview box */}
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2">
              <div className="font-bold text-slate-800 text-xs">Filing Summary Review</div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-[11px]">
                <div>
                  <span className="text-slate-400 block text-[9px] uppercase font-bold">Victim</span>
                  <span className="font-medium text-slate-900">{formData.complainantName}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[9px] uppercase font-bold">Amount Lost</span>
                  <span className="font-bold text-red-600 font-mono">₹{formData.amount.toLocaleString('en-IN')}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[9px] uppercase font-bold">UTR</span>
                  <span className="font-mono text-slate-900">{formData.transactionUtr}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[9px] uppercase font-bold">Suspect Account</span>
                  <span className="font-mono text-slate-900">{formData.suspectAccount}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── ACTION BUTTONS ── */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-100">
          {step > 1 ? (
            <button
              type="button"
              onClick={handleBack}
              className="flex items-center gap-1.5 px-4 py-2 border border-slate-200 text-slate-700 font-bold rounded-xl hover:bg-slate-50 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back</span>
            </button>
          ) : onCancel ? (
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 text-slate-500 hover:text-slate-800 font-bold"
            >
              Cancel
            </button>
          ) : <div />}

          {step < 4 ? (
            <button
              type="button"
              onClick={handleNext}
              className="flex items-center gap-1.5 px-5 py-2.5 bg-[#FF5500] hover:bg-orange-600 text-white font-bold rounded-xl shadow-md transition-all font-sans"
            >
              <span>Continue</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="submit"
              disabled={submitting}
              className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-[#FF5500] to-red-600 hover:from-orange-600 hover:to-red-700 text-white font-bold rounded-xl shadow-lg transition-all disabled:opacity-50 font-sans"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{submitting ? 'Submitting to Portal...' : 'File Official Cyber Complaint'}</span>
            </button>
          )}
        </div>
      </form>
    </div>
  );
};
