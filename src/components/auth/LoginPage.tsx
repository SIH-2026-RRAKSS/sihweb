import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  ShieldAlert,
  ShieldCheck,
  Building2,
  UserCheck,
  Settings,
  Lock,
  Mail,
  Phone,
  KeyRound,
  ArrowRight,
  Eye,
  EyeOff,
  Zap,
  Activity,
  ArrowLeft,
  CheckCircle2,
  Shield
} from 'lucide-react';
import { useAuth, PERSONA_PRESETS } from '../../context/AuthContext';
import { UserRole } from '../../types';
import { TrinetraLogo } from '../ui/TrinetraLogo';

export const LoginPage: React.FC<{
  onLoginSuccess?: () => void;
  onSuccess?: () => void;
  onCancel?: () => void;
}> = ({ onLoginSuccess, onSuccess, onCancel }) => {
  const { loginStaff, loginCitizen, isLoading } = useAuth();
  const [mode, setMode] = useState<'STAFF' | 'CITIZEN'>('STAFF');
  const [employeeId, setEmployeeId] = useState('CYBER001');
  const [password, setPassword] = useState('OfficerPassword123!');
  const [phone, setPhone] = useState('+91 98765 43210');
  const [otp, setOtp] = useState('123456');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const notifySuccess = () => {
    setErrorMsg(null);
    onSuccess?.();
    onLoginSuccess?.();
  };

  const handleStaffSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    try {
      await loginStaff(employeeId, password);
      notifySuccess();
    } catch (err) {
      setErrorMsg("Invalid Employee ID or Password. Please try again.");
    }
  };

  const handleCitizenSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    try {
      const token = `mock:citizen_01:Demo Citizen:citizen@test.com:${phone}`;
      await loginCitizen('MOCK', token);
      notifySuccess();
    } catch (err) {
      setErrorMsg("Failed to verify OTP. Please try again.");
    }
  };

  const handlePersonaSelect = async (role: UserRole) => {
    setErrorMsg(null);
    try {
      if (role === 'CYBER_OFFICER') {
        await loginStaff('CYBER001', 'OfficerPassword123!');
      } else if (role === 'POLICE') {
        await loginStaff('POLICE001', 'PolicePassword123!');
      } else if (role === 'BANK_MANAGER') {
        await loginStaff('BANK001', 'BankPassword123!');
      } else if (role === 'ADMIN') {
        await loginStaff('ADMIN001', 'AdminPassword123!');
      } else if (role === 'COMPLAINANT') {
        await loginCitizen('MOCK', 'mock:citizen_01:Demo Citizen:citizen@test.com:+919876543210');
      }
      notifySuccess();
    } catch (err) {
      setErrorMsg("Authentication failed. Ensure backend is running and credentials are valid.");
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 flex flex-col justify-between items-center p-4 sm:p-6 relative overflow-y-auto font-sans select-none">
      {/* Background Soft Pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#e2e8f080_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f080_1px,transparent_1px)] bg-[size:3.5rem_3.5rem] [mask-image:radial-gradient(ellipse_70%_60%_at_50%_10%,#000_60%,transparent_100%)] pointer-events-none" />

      {/* Top Navbar Bar */}
      <header className="w-full max-w-5xl flex items-center justify-between z-10 py-2">
        <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>I4C NATIONAL NETWORK ONLINE</span>
        </div>

        {onCancel && (
          <button
            onClick={onCancel}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold shadow-sm transition-all"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to Splash</span>
          </button>
        )}
      </header>

      {/* Central Content Area */}
      <main className="w-full max-w-4xl z-10 my-auto py-6 space-y-6">
        {/* Header Branding */}
        <div className="text-center space-y-2.5">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-50 border border-orange-200 text-[#FF5500] text-[11px] font-bold">
            <Activity className="w-3.5 h-3.5 text-[#FF5500]" />
            <span>AML DEFCON-2 // LAW ENFORCEMENT & INTER-BANK CLEARANCE</span>
          </div>

          <div className="flex items-center justify-center pt-1">
            <TrinetraLogo size="md" showLangBadge={true} intervalMs={2600} theme="light" />
          </div>

          <p className="text-xs text-slate-500 max-w-lg mx-auto leading-relaxed">
            Multi-Hop Mule Detection, Inductive GraphSAGE Intelligence & Section 91 CrPC Emergency Inter-Bank Freezes
          </p>
        </div>

        {/* 1-Click Fast Persona Switcher Bar */}
        <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-saas-card space-y-3.5">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <div className="flex items-center gap-1.5 text-slate-900 font-bold">
              <Zap className="w-4 h-4 text-[#FF5500]" />
              <span>1-CLICK FAST DEMO ACCESS</span>
            </div>
            <span className="text-[10px] uppercase font-bold text-slate-400">SELECT OPERATIONAL CLEARANCE</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {/* Cyber Officer */}
            <button
              onClick={() => handlePersonaSelect('CYBER_OFFICER')}
              className="group p-3.5 rounded-2xl bg-slate-50/80 hover:bg-orange-50/60 border border-slate-200/80 hover:border-orange-300 transition-all text-left flex flex-col justify-between space-y-3 shadow-sm hover:shadow"
            >
              <div className="p-2 rounded-xl bg-orange-100/80 text-[#FF5500] w-fit group-hover:scale-105 transition-transform">
                <ShieldAlert className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-bold text-slate-900 group-hover:text-[#FF5500] transition-colors">
                  Cyber Officer
                </div>
                <div className="text-[10px] text-slate-500 font-medium">GNN & Macro Rings</div>
              </div>
            </button>

            {/* Police Station */}
            <button
              onClick={() => handlePersonaSelect('POLICE')}
              className="group p-3.5 rounded-2xl bg-slate-50/80 hover:bg-blue-50/60 border border-slate-200/80 hover:border-blue-300 transition-all text-left flex flex-col justify-between space-y-3 shadow-sm hover:shadow"
            >
              <div className="p-2 rounded-xl bg-blue-100/80 text-blue-700 w-fit group-hover:scale-105 transition-transform">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-bold text-slate-900 group-hover:text-blue-700 transition-colors">
                  Police SHO
                </div>
                <div className="text-[10px] text-slate-500 font-medium">Station Queue & FIR</div>
              </div>
            </button>

            {/* Bank Nodal Desk */}
            <button
              onClick={() => handlePersonaSelect('BANK_MANAGER')}
              className="group p-3.5 rounded-2xl bg-slate-50/80 hover:bg-emerald-50/60 border border-slate-200/80 hover:border-emerald-300 transition-all text-left flex flex-col justify-between space-y-3 shadow-sm hover:shadow"
            >
              <div className="p-2 rounded-xl bg-emerald-100/80 text-emerald-700 w-fit group-hover:scale-105 transition-transform">
                <Building2 className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-bold text-slate-900 group-hover:text-emerald-700 transition-colors">
                  Bank Nodal Mgr
                </div>
                <div className="text-[10px] text-slate-500 font-medium">Freeze Inbox & SLA</div>
              </div>
            </button>

            {/* Citizen Complainant */}
            <button
              onClick={() => handlePersonaSelect('COMPLAINANT')}
              className="group p-3.5 rounded-2xl bg-slate-50/80 hover:bg-purple-50/60 border border-slate-200/80 hover:border-purple-300 transition-all text-left flex flex-col justify-between space-y-3 shadow-sm hover:shadow"
            >
              <div className="p-2 rounded-xl bg-purple-100/80 text-purple-700 w-fit group-hover:scale-105 transition-transform">
                <UserCheck className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-bold text-slate-900 group-hover:text-purple-700 transition-colors">
                  Citizen Portal
                </div>
                <div className="text-[10px] text-slate-500 font-medium">File & Track Fraud</div>
              </div>
            </button>

            {/* Admin */}
            <button
              onClick={() => handlePersonaSelect('ADMIN')}
              className="group p-3.5 rounded-2xl bg-slate-50/80 hover:bg-amber-50/60 border border-slate-200/80 hover:border-amber-300 transition-all text-left flex flex-col justify-between space-y-3 shadow-sm hover:shadow"
            >
              <div className="p-2 rounded-xl bg-amber-100/80 text-amber-700 w-fit group-hover:scale-105 transition-transform">
                <Settings className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-bold text-slate-900 group-hover:text-amber-700 transition-colors">
                  System Admin
                </div>
                <div className="text-[10px] text-slate-500 font-medium">Registry & MLOps</div>
              </div>
            </button>
          </div>
        </div>

        {/* Credentials Form Box */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-saas-card max-w-md mx-auto space-y-5">
          {/* Tab Switcher */}
          <div className="grid grid-cols-2 p-1 bg-slate-100/90 rounded-2xl border border-slate-200 text-xs font-medium">
            <button
              type="button"
              onClick={() => setMode('STAFF')}
              className={`py-2 rounded-xl font-bold transition-all ${
                mode === 'STAFF'
                  ? 'bg-white text-slate-900 shadow-sm border border-slate-200/60'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              OFFICIAL / LEA LOGIN
            </button>
            <button
              type="button"
              onClick={() => setMode('CITIZEN')}
              className={`py-2 rounded-xl font-bold transition-all ${
                mode === 'CITIZEN'
                  ? 'bg-purple-600 text-white shadow-sm'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              CITIZEN (OTP)
            </button>
          </div>

          {mode === 'STAFF' ? (
            <form onSubmit={handleStaffSubmit} className="space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-700 uppercase flex items-center gap-1.5">
                  <UserCheck className="w-3.5 h-3.5 text-slate-400" /> Official Employee ID
                </label>
                <input
                  type="text"
                  value={employeeId}
                  onChange={(e) => setEmployeeId(e.target.value)}
                  required
                  placeholder="CYBER001"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs font-mono focus:border-[#FF5500] focus:bg-white focus:outline-none transition-all placeholder-slate-400"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-700 uppercase flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-slate-400" /> Secure Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    placeholder="••••••••"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs font-mono focus:border-[#FF5500] focus:bg-white focus:outline-none transition-all pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-[#FF7A1A] to-[#EA580C] hover:from-orange-500 hover:to-orange-600 text-white font-bold text-xs tracking-wide shadow-md shadow-orange-500/20 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
              >
                {isLoading ? 'Authenticating...' : <>Authenticate Securely <ArrowRight className="w-4 h-4" /></>}
              </button>
            </form>
          ) : (
            <form onSubmit={handleCitizenSubmit} className="space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-700 uppercase flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-slate-400" /> Mobile Phone Number
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                  placeholder="+91 98765 43210"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs font-mono focus:border-purple-500 focus:bg-white focus:outline-none transition-all placeholder-slate-400"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-700 uppercase flex items-center gap-1.5">
                  <KeyRound className="w-3.5 h-3.5 text-slate-400" /> 6-Digit OTP Code
                </label>
                <input
                  type="text"
                  maxLength={6}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  required
                  placeholder="123456"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs font-mono focus:border-purple-500 focus:bg-white focus:outline-none transition-all tracking-widest text-center font-bold"
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs tracking-wide shadow-md shadow-purple-600/20 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
              >
                {isLoading ? 'Verifying OTP...' : <>Verify & Access Portal <ArrowRight className="w-4 h-4" /></>}
              </button>
            </form>
          )}
        </div>
      </main>

      {/* Security Footer Notice */}
      <footer className="w-full max-w-4xl text-center text-xs text-slate-400 font-sans space-y-1 pt-4 pb-2 z-10">
        <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-500 font-medium">
          <Shield className="w-3.5 h-3.5 text-slate-400" />
          <span>Authorized Access Only • National Cyber Crime Reporting Portal (1930)</span>
        </div>
        <div className="text-[10px] text-slate-400">
          All sessions logged with SHA-256 HMAC cryptographic audit verification under IT Act 2000
        </div>
      </footer>
    </div>
  );
};
