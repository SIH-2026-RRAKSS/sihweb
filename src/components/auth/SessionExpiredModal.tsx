import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldAlert, LogIn, Clock } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const SessionExpiredModal: React.FC = () => {
  const { isSessionExpired, sessionExpiredMessage, dismissSessionExpired } = useAuth();
  const navigate = useNavigate();
  const [countdown, setCountdown] = useState<number>(5);

  useEffect(() => {
    if (!isSessionExpired) {
      setCountdown(5);
      return;
    }

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleRedirectToLogin();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isSessionExpired]);

  const handleRedirectToLogin = () => {
    dismissSessionExpired();
    navigate('/login?expired=true', { replace: true });
  };

  if (!isSessionExpired) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-white border border-slate-200 rounded-2xl shadow-2xl p-6 space-y-5 text-slate-900 font-sans">
        
        {/* Header Icon + Title */}
        <div className="flex items-center gap-3">
          <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl text-amber-600 flex-shrink-0">
            <ShieldAlert className="w-6 h-6 text-amber-600" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 tracking-tight">
              Authentication Session Expired
            </h3>
            <p className="text-xs text-slate-500">
              National Cyber Crime AML Security Protocol
            </p>
          </div>
        </div>

        {/* Informative Description */}
        <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-600 leading-relaxed">
          {sessionExpiredMessage || "Your security credentials have expired. For regulatory compliance and data protection, please sign in again to continue your active investigation."}
        </div>

        {/* Redirect timer & Button */}
        <div className="space-y-3 pt-1">
          <div className="flex items-center justify-between text-[11px] text-slate-500 font-mono">
            <span className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              Auto-redirecting in:
            </span>
            <span className="font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
              {countdown}s
            </span>
          </div>

          <button
            onClick={handleRedirectToLogin}
            className="w-full py-2.5 px-4 bg-[#FF5500] hover:bg-[#E04B00] text-white text-xs font-bold rounded-xl shadow-md shadow-orange-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <LogIn className="w-4 h-4" />
            <span>Sign In Again Now</span>
          </button>
        </div>
      </div>
    </div>
  );
};
