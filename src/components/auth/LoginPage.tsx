import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams, useLocation } from 'react-router-dom';
import { motion, useMotionValue, useSpring, useMotionTemplate } from 'framer-motion';
import {
  ShieldAlert,
  ShieldCheck,
  Building2,
  UserCheck,
  Settings,
  Lock,
  Phone,
  KeyRound,
  ArrowRight,
  Eye,
  EyeOff,
  Zap,
  Activity,
  ArrowLeft,
  Shield
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { UserRole } from '../../types';
import { useAsyncState, AsyncStatus } from '../../hooks/useAsyncState';

export const LoginPage: React.FC<{
  onLoginSuccess?: () => void;
  onSuccess?: () => void;
  onCancel?: () => void;
}> = ({ onLoginSuccess, onSuccess, onCancel }) => {

  const [searchParams] = useSearchParams();
  const location = useLocation();
  const [isSessionExpired, setIsSessionExpired] = useState<boolean>(() => {
    return searchParams.get('expired') === 'true' || 
           sessionStorage.getItem('sih_session_expired') === 'true' ||
           (location.state as any)?.sessionExpired === true;
  });

  const { loginStaff, loginCitizen, isLoading } = useAuth();
  const { status: authStatus, error: asyncAuthError, isOffline, run: runAuth, setError: setAuthError } = useAsyncState<void>();
  const [mode, setMode] = useState<'STAFF' | 'CITIZEN'>('STAFF');

  // Gated behind dev-only flag: starts empty by default unless VITE_ENABLE_DEV_CREDS is explicitly enabled in dev
  const isDevPrefill = Boolean(
    (import.meta as any).env?.DEV &&
    (import.meta as any).env?.VITE_ENABLE_DEV_CREDS === 'true'
  );

  const [employeeId, setEmployeeId] = useState(isDevPrefill ? 'CYBER001' : '');
  const [password, setPassword] = useState(isDevPrefill ? 'OfficerPassword123!' : '');
  const [phone, setPhone] = useState(isDevPrefill ? '+91 98765 43210' : '');
  const [otp, setOtp] = useState(isDevPrefill ? '123456' : '');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const isSubmitting = isLoading || authStatus === AsyncStatus.LOADING;

  const notifySuccess = () => {
    setErrorMsg(null);
    setAuthError(null);
    setIsSessionExpired(false);
    sessionStorage.removeItem('sih_session_expired');
    sessionStorage.removeItem('sih_session_expired_msg');
    onSuccess?.();
    onLoginSuccess?.();
  };

  const handleStaffSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    try {
      await runAuth(async () => {
        await loginStaff(employeeId, password);
      });
      notifySuccess();
    } catch (err: any) {
      setErrorMsg(isOffline ? "Backend server is unreachable. Please verify network connectivity." : (err?.message || "Invalid Employee ID or Password. Please try again."));
    }
  };

  const handleCitizenSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    try {
      await runAuth(async () => {
        const token = `mock:citizen_01:Demo Citizen:citizen@test.com:${phone}`;
        await loginCitizen('MOCK', token);
      });
      notifySuccess();
    } catch (err: any) {
      setErrorMsg(isOffline ? "Backend server is unreachable. Please verify network connectivity." : (err?.message || "Failed to verify OTP. Please try again."));
    }
  };

  const handlePersonaSelect = async (role: UserRole) => {
    setErrorMsg(null);
    try {
      await runAuth(async () => {
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
      });
      notifySuccess();
    } catch (err: any) {
      setErrorMsg(isOffline ? "Backend server is unreachable. Please verify network connectivity." : "Authentication failed. Ensure backend is running and credentials are valid.");
    }
  };

  // -- Dynamic Spring-Driven Mouse & Autonomous Idle Motion --
  const mouseX = useMotionValue(typeof window !== 'undefined' ? window.innerWidth / 3 : 400);
  const mouseY = useMotionValue(typeof window !== 'undefined' ? window.innerHeight / 2 : 350);
  const springX = useSpring(mouseX, { stiffness: 60, damping: 20 });
  const springY = useSpring(mouseY, { stiffness: 60, damping: 20 });

  const lastMouseMoveTime = useRef<number>(Date.now());
  const isUserMoving = useRef<boolean>(false);

  // Autonomous Lissajous Drift when mouse is idle
  useEffect(() => {
    let animId: number;
    let startTime = Date.now();
    const width = typeof window !== 'undefined' ? window.innerWidth : 1200;
    const height = typeof window !== 'undefined' ? window.innerHeight : 800;

    const animateIdleMotion = () => {
      const now = Date.now();
      if (now - lastMouseMoveTime.current > 2000) {
        isUserMoving.current = false;
      }

      if (!isUserMoving.current) {
        const elapsed = (now - startTime) / 1000;
        const autoX = (width * 0.28) + Math.sin(elapsed * 0.4) * (width * 0.15) + Math.cos(elapsed * 0.2) * 60;
        const autoY = height / 2.5 + Math.cos(elapsed * 0.3) * (height * 0.18) + Math.sin(elapsed * 0.5) * 40;

        mouseX.set(autoX);
        mouseY.set(autoY);
      }

      animId = requestAnimationFrame(animateIdleMotion);
    };

    animId = requestAnimationFrame(animateIdleMotion);
    return () => cancelAnimationFrame(animId);
  }, [mouseX, mouseY]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const { clientX, clientY } = e;
    lastMouseMoveTime.current = Date.now();
    isUserMoving.current = true;
    mouseX.set(clientX);
    mouseY.set(clientY);
  };

  return (
    <div 
      onMouseMove={handleMouseMove}
      className="min-h-screen xl:h-screen w-full bg-[#F8FAFC] text-slate-900 font-sans selection:bg-orange-500/20 selection:text-orange-600 relative overflow-x-hidden grid grid-cols-1 md:grid-cols-[45fr_55fr] xl:grid-cols-[55fr_45fr] select-none"
    >
      {/* ─────────────────────────────────────────────────────────────
          1. LEFT BRAND PANEL (55fr Desktop / 45% Tablet / Header Mobile)
          Non-interactive for keyboard navigation so focus starts in auth panel
      ───────────────────────────────────────────────────────────── */}
      <section 
        aria-hidden="true"
        tabIndex={-1}
        className="relative flex flex-col justify-center px-6 py-10 sm:px-10 md:px-8 lg:px-12 xl:pl-16 xl:pr-12 overflow-hidden border-b md:border-b-0 md:border-r border-slate-200/80 bg-gradient-to-br from-orange-50/40 via-slate-50 to-orange-100/30"
      >
        {/* Base Precision Cyber Grid Lines */}
        <div 
          className="pointer-events-none absolute inset-0 z-0 opacity-45"
          style={{
            backgroundImage: `
              linear-gradient(to right, rgba(15, 23, 42, 0.08) 1px, transparent 1px),
              linear-gradient(to bottom, rgba(15, 23, 42, 0.08) 1px, transparent 1px)
            `,
            backgroundSize: '40px 40px',
          }}
        />

        {/* Micro Dot Matrix Intersections */}
        <div 
          className="pointer-events-none absolute inset-0 z-0 opacity-35"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, rgba(15, 23, 42, 0.16) 1.2px, transparent 0)`,
            backgroundSize: '40px 40px',
          }}
        />

        {/* Dynamic Mouse-Illuminated Grid Beam */}
        <motion.div
          className="pointer-events-none absolute inset-0 z-0"
          style={{
            backgroundImage: `
              linear-gradient(to right, rgba(255, 85, 0, 0.45) 1.5px, transparent 1.5px),
              linear-gradient(to bottom, rgba(255, 85, 0, 0.45) 1.5px, transparent 1.5px)
            `,
            backgroundSize: '40px 40px',
            WebkitMaskImage: useMotionTemplate`radial-gradient(320px circle at ${springX}px ${springY}px, black 20%, transparent 80%)`,
            maskImage: useMotionTemplate`radial-gradient(320px circle at ${springX}px ${springY}px, black 20%, transparent 80%)`,
          }}
        />

        {/* Soft Moving Caustic Spotlight Beam */}
        <motion.div
          className="pointer-events-none absolute inset-0 z-0 transition-opacity duration-300"
          style={{
            background: useMotionTemplate`radial-gradient(650px circle at ${springX}px ${springY}px, rgba(255, 85, 0, 0.12), rgba(56, 189, 248, 0.06) 45%, transparent 75%)`
          }}
        />

        {/* Brand Inset Content Container */}
        <div className="relative z-10 max-w-[500px]">
          
          {/* AML DEFCON-2 & I4C Indicators Stacked Above Logo Block */}
          <div className="flex flex-col items-start gap-2.5 mb-8">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-[13px] font-bold shadow-xs">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>I4C NATIONAL NETWORK ONLINE</span>
            </div>
            
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-orange-50 border border-orange-200 text-[#FF5500] text-[13px] font-bold shadow-xs">
              <Activity className="w-4 h-4 text-[#FF5500]" />
              <span>AML DEFCON-2 // LAW ENFORCEMENT &amp; INTER-BANK CLEARANCE</span>
            </div>
          </div>

          {/* Logo at ~96px Box (Emblem at 80px) */}
          <div className="w-24 h-24 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-center justify-center p-3 mb-5 hover:border-orange-500/50 transition-colors">
            <img
              src="/trinetra_logo.png"
              alt="Team Trinetra Emblem"
              className="w-20 h-20 max-w-full max-h-full object-contain drop-shadow-sm"
              style={{ width: '80px', height: '80px' }}
            />
          </div>

          {/* "ত্রিNETRAA" Wordmark at 56px with Malayalam Badge Beneath */}
          <div className="space-y-2 mb-6">
            <h1 className="text-[40px] sm:text-[48px] xl:text-[56px] font-black tracking-tight text-slate-900 leading-[1.05]">
              <span className="text-[#FF5500]">ত্রি</span>NETRAA
            </h1>
            <div>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-100/70 border border-orange-200/80 text-orange-700 font-sans text-[13px] font-semibold">
                Script: Malayalam (ML) · ത്രിNETRAA
              </span>
            </div>
          </div>

          {/* Tagline at 18px (max-width 460px) */}
          <p className="text-[16px] sm:text-[18px] text-slate-600 font-medium leading-relaxed max-w-[460px]">
            Multi-Hop Mule Detection, Inductive GraphSAGE Intelligence &amp; Section 91 CrPC Emergency Inter-Bank Freezes
          </p>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          2. RIGHT AUTH PANEL (45fr Desktop / 55% Tablet / Main Mobile)
          Centered Content Column (max 420px), Return Button Top-Right
      ───────────────────────────────────────────────────────────── */}
      <main className="relative flex flex-col justify-between p-6 sm:p-8 md:p-8 lg:p-10 xl:p-12 bg-white shadow-[-8px_0_24px_rgba(15,23,42,0.02)] overflow-y-auto">
        
        {/* Top-Right "Return to Splash" Button */}
        <div className="flex justify-end w-full mb-4 sm:mb-6 shrink-0">
          {onCancel && (
            <button
              onClick={onCancel}
              className="flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-[13px] font-bold shadow-sm transition-all focus-visible:ring-2 focus-visible:ring-[#FF5500] focus-visible:ring-offset-2 outline-none cursor-pointer"
              title="Return to Splash Overview"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Return to Splash</span>
            </button>
          )}
        </div>

        {/* Centered Auth Column (Max-Width 420px) */}
        <div className="w-full max-w-[420px] mx-auto my-auto space-y-5">
          
          {/* Heading Block */}
          <div className="space-y-1">
            <h2 className="text-[28px] font-bold text-slate-900 tracking-tight">
              Secure Access
            </h2>
            <p className="text-[14px] text-slate-600 font-medium leading-normal">
              Select an operational clearance or enter official credentials.
            </p>
          </div>

          {/* Session Expired Alert Banner */}
          {isSessionExpired && (
            <div className="bg-amber-50 border border-amber-300 rounded-2xl p-4 text-[13px] text-amber-900 flex items-start gap-3 shadow-sm animate-in fade-in slide-in-from-top-2 duration-300">
              <div className="p-2 bg-amber-100 rounded-xl text-amber-700 flex-shrink-0 mt-0.5">
                <ShieldAlert className="w-5 h-5 text-amber-700" />
              </div>
              <div className="flex-1">
                <div className="font-bold text-[14px] text-amber-950">Security Session Expired</div>
                <p className="text-[13px] text-amber-800 mt-1 leading-relaxed">
                  Your session expired due to inactivity. Please sign in again or choose an operational clearance.
                </p>
              </div>
              <button
                onClick={() => {
                  setIsSessionExpired(false);
                  sessionStorage.removeItem('sih_session_expired');
                  sessionStorage.removeItem('sih_session_expired_msg');
                }}
                className="text-amber-800 hover:text-amber-950 font-bold text-[13px] px-2.5 py-1 bg-amber-200/60 hover:bg-amber-200 rounded-lg transition-colors cursor-pointer"
              >
                Dismiss
              </button>
            </div>
          )}

          {/* Authentication Error Alert Banner */}
          {(errorMsg || asyncAuthError) && (
            <div className="bg-red-50 border border-red-300 rounded-2xl p-4 text-[13px] text-red-900 flex items-start gap-3 shadow-sm animate-in fade-in slide-in-from-top-2 duration-300">
              <div className="p-2 bg-red-100 rounded-xl text-red-700 flex-shrink-0 mt-0.5">
                <ShieldAlert className="w-5 h-5 text-red-700" />
              </div>
              <div className="flex-1">
                <div className="font-bold text-[14px] text-red-950">Authentication Error</div>
                <p className="text-[13px] text-red-800 mt-1 leading-relaxed">
                  {errorMsg || asyncAuthError}
                </p>
              </div>
              <button
                onClick={() => {
                  setErrorMsg(null);
                  setAuthError(null);
                }}
                className="text-red-800 hover:text-red-950 font-bold text-[13px] px-2.5 py-1 bg-red-200/60 hover:bg-red-200 rounded-lg transition-colors cursor-pointer"
              >
                Dismiss
              </button>
            </div>
          )}

          {/* Quick-Access Clearance Cards (2-Column Grid with Equal Height, Admin Spans Full Width) */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between text-[13px] text-slate-600">
              <div className="flex items-center gap-1.5 text-slate-900 font-bold">
                <Zap className="w-4 h-4 text-[#FF5500]" />
                <span>1-CLICK FAST DEMO ACCESS</span>
              </div>
              <span className="text-[12px] uppercase font-bold text-slate-500">CLEARANCE</span>
            </div>

            <div className="grid grid-cols-2 gap-2.5 auto-rows-fr">
              {/* Cyber Officer */}
              <button
                type="button"
                onClick={() => handlePersonaSelect('CYBER_OFFICER')}
                className="group p-3 rounded-2xl bg-slate-50/90 hover:bg-orange-50/60 border border-slate-200/90 hover:border-orange-300 transition-all text-left flex items-center gap-3 shadow-xs hover:shadow-sm cursor-pointer h-full focus-visible:ring-2 focus-visible:ring-[#FF5500] outline-none"
              >
                <div className="p-2.5 rounded-xl bg-orange-100/80 text-[#FF5500] flex-shrink-0 group-hover:scale-105 transition-transform">
                  <ShieldAlert className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <div className="text-[14px] font-bold text-slate-900 group-hover:text-[#FF5500] transition-colors truncate">
                    Cyber Officer
                  </div>
                  <div className="text-[13px] text-slate-600 font-medium truncate">GNN &amp; Rings</div>
                </div>
              </button>

              {/* Police Station */}
              <button
                type="button"
                onClick={() => handlePersonaSelect('POLICE')}
                className="group p-3 rounded-2xl bg-slate-50/90 hover:bg-blue-50/60 border border-slate-200/90 hover:border-blue-300 transition-all text-left flex items-center gap-3 shadow-xs hover:shadow-sm cursor-pointer h-full focus-visible:ring-2 focus-visible:ring-blue-500 outline-none"
              >
                <div className="p-2.5 rounded-xl bg-blue-100/80 text-blue-700 flex-shrink-0 group-hover:scale-105 transition-transform">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <div className="text-[14px] font-bold text-slate-900 group-hover:text-blue-700 transition-colors truncate">
                    Police SHO
                  </div>
                  <div className="text-[13px] text-slate-600 font-medium truncate">Queue &amp; FIR</div>
                </div>
              </button>

              {/* Bank Nodal Desk */}
              <button
                type="button"
                onClick={() => handlePersonaSelect('BANK_MANAGER')}
                className="group p-3 rounded-2xl bg-slate-50/90 hover:bg-emerald-50/60 border border-slate-200/90 hover:border-emerald-300 transition-all text-left flex items-center gap-3 shadow-xs hover:shadow-sm cursor-pointer h-full focus-visible:ring-2 focus-visible:ring-emerald-500 outline-none"
              >
                <div className="p-2.5 rounded-xl bg-emerald-100/80 text-emerald-700 flex-shrink-0 group-hover:scale-105 transition-transform">
                  <Building2 className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <div className="text-[14px] font-bold text-slate-900 group-hover:text-emerald-700 transition-colors truncate">
                    Bank Nodal Mgr
                  </div>
                  <div className="text-[13px] text-slate-600 font-medium truncate">Freeze Inbox</div>
                </div>
              </button>

              {/* Citizen Complainant */}
              <button
                type="button"
                onClick={() => handlePersonaSelect('COMPLAINANT')}
                className="group p-3 rounded-2xl bg-slate-50/90 hover:bg-purple-50/60 border border-slate-200/90 hover:border-purple-300 transition-all text-left flex items-center gap-3 shadow-xs hover:shadow-sm cursor-pointer h-full focus-visible:ring-2 focus-visible:ring-purple-500 outline-none"
              >
                <div className="p-2.5 rounded-xl bg-purple-100/80 text-purple-700 flex-shrink-0 group-hover:scale-105 transition-transform">
                  <UserCheck className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <div className="text-[14px] font-bold text-slate-900 group-hover:text-purple-700 transition-colors truncate">
                    Citizen Portal
                  </div>
                  <div className="text-[13px] text-slate-600 font-medium truncate">File &amp; Track</div>
                </div>
              </button>

              {/* Admin (Spans Full Width 2 Columns) */}
              <button
                type="button"
                onClick={() => handlePersonaSelect('ADMIN')}
                className="group p-3 rounded-2xl bg-slate-50/90 hover:bg-amber-50/60 border border-slate-200/90 hover:border-amber-300 transition-all text-left flex items-center gap-3 shadow-xs hover:shadow-sm col-span-2 cursor-pointer h-full focus-visible:ring-2 focus-visible:ring-amber-500 outline-none"
              >
                <div className="p-2.5 rounded-xl bg-amber-100/80 text-amber-700 flex-shrink-0 group-hover:scale-105 transition-transform">
                  <Settings className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <div className="text-[14px] font-bold text-slate-900 group-hover:text-amber-700 transition-colors truncate">
                    System Admin
                  </div>
                  <div className="text-[13px] text-slate-600 font-medium truncate">Registry &amp; MLOps Governance</div>
                </div>
              </button>
            </div>
          </div>

          {/* Section Divider */}
          <div className="relative flex items-center justify-center py-1">
            <div className="border-t border-slate-200 w-full" />
            <span className="bg-white px-3 text-[13px] text-slate-500 font-semibold uppercase tracking-wider absolute">
              or sign in
            </span>
          </div>

          {/* Authentication Form Card */}
          <div className="bg-slate-50/70 border border-slate-200 rounded-3xl p-5 sm:p-6 shadow-saas-card space-y-4">
            
            {/* Tab Switcher */}
            <div className="grid grid-cols-2 p-1 bg-slate-200/60 rounded-2xl border border-slate-200 text-[13px] font-medium">
              <button
                type="button"
                onClick={() => setMode('STAFF')}
                className={`py-2 rounded-xl font-bold transition-all cursor-pointer ${
                  mode === 'STAFF'
                    ? 'bg-white text-slate-900 shadow-sm border border-slate-200/60'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                OFFICIAL / LEA LOGIN
              </button>
              <button
                type="button"
                onClick={() => setMode('CITIZEN')}
                className={`py-2 rounded-xl font-bold transition-all cursor-pointer ${
                  mode === 'CITIZEN'
                    ? 'bg-purple-600 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                CITIZEN (OTP)
              </button>
            </div>

            {mode === 'STAFF' ? (
              <form onSubmit={handleStaffSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[14px] font-bold text-slate-700 uppercase flex items-center gap-1.5">
                    <UserCheck className="w-4 h-4 text-slate-500" /> Official Employee ID
                  </label>
                  <input
                    type="text"
                    value={employeeId}
                    onChange={(e) => setEmployeeId(e.target.value)}
                    required
                    placeholder="CYBER001"
                    className="w-full h-12 px-4 rounded-xl bg-white border border-slate-200 text-slate-900 text-[14px] font-mono focus:border-[#FF5500] focus:ring-1 focus:ring-[#FF5500] focus:outline-none transition-all placeholder:text-[13px] placeholder:text-slate-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[14px] font-bold text-slate-700 uppercase flex items-center gap-1.5">
                    <Lock className="w-4 h-4 text-slate-500" /> Secure Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      placeholder="••••••••"
                      className="w-full h-12 px-4 rounded-xl bg-white border border-slate-200 text-slate-900 text-[14px] font-mono focus:border-[#FF5500] focus:ring-1 focus:ring-[#FF5500] focus:outline-none transition-all pr-12 placeholder:text-[13px] placeholder:text-slate-500"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                      title={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* 52px Primary Action Button */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full h-[52px] rounded-xl bg-gradient-to-r from-[#FF7A1A] to-[#EA580C] hover:from-orange-500 hover:to-orange-600 text-white font-bold text-[15px] sm:text-base tracking-wide shadow-md shadow-orange-500/20 flex items-center justify-center gap-2 transition-all disabled:opacity-50 cursor-pointer focus-visible:ring-2 focus-visible:ring-[#FF5500] focus-visible:ring-offset-2 outline-none"
                >
                  {isSubmitting ? 'Authenticating...' : <>Authenticate Securely <ArrowRight className="w-4 h-4" /></>}
                </button>
              </form>
            ) : (
              <form onSubmit={handleCitizenSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[14px] font-bold text-slate-700 uppercase flex items-center gap-1.5">
                    <Phone className="w-4 h-4 text-slate-500" /> Mobile Phone Number
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                    placeholder="+91 98765 43210"
                    className="w-full h-12 px-4 rounded-xl bg-white border border-slate-200 text-slate-900 text-[14px] font-mono focus:border-purple-500 focus:ring-1 focus:ring-purple-500 focus:outline-none transition-all placeholder:text-[13px] placeholder:text-slate-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[14px] font-bold text-slate-700 uppercase flex items-center gap-1.5">
                    <KeyRound className="w-4 h-4 text-slate-500" /> 6-Digit OTP Code
                  </label>
                  <input
                    type="text"
                    maxLength={6}
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    required
                    placeholder="123456"
                    className="w-full h-12 px-4 rounded-xl bg-white border border-slate-200 text-slate-900 text-[14px] font-mono focus:border-purple-500 focus:ring-1 focus:ring-purple-500 focus:outline-none transition-all tracking-widest text-center font-bold placeholder:text-[13px] placeholder:text-slate-500"
                  />
                </div>

                {/* 52px Primary Action Button */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full h-[52px] rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-[15px] sm:text-base tracking-wide shadow-md shadow-purple-600/20 flex items-center justify-center gap-2 transition-all disabled:opacity-50 cursor-pointer focus-visible:ring-2 focus-visible:ring-purple-500 focus-visible:ring-offset-2 outline-none"
                >
                  {isSubmitting ? 'Verifying OTP...' : <>Verify &amp; Access Portal <ArrowRight className="w-4 h-4" /></>}
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Security Compliance Footer (At least 13px text) */}
        <footer className="w-full max-w-[420px] mx-auto text-center space-y-1 pt-6 pb-2 shrink-0">
          <div className="flex items-center justify-center gap-2 text-[13px] text-slate-700 font-semibold">
            <Shield className="w-4 h-4 text-slate-500 shrink-0" />
            <span>Authorized Access Only · National Cyber Crime Reporting Portal (1930)</span>
          </div>
          <div className="text-[13px] text-slate-500 font-medium">
            All sessions logged with SHA-256 HMAC cryptographic audit verification under IT Act 2000
          </div>
        </footer>

      </main>
    </div>
  );
};
