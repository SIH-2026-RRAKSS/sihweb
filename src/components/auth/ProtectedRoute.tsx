import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { UserRole } from '../../types';
import { ShieldAlert, Lock, ArrowRight } from 'lucide-react';

interface ProtectedRouteProps {
  allowedRoles: UserRole[];
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ allowedRoles, children, fallback }) => {
  const { user, role, isAuthenticated, switchPersona } = useAuth();

  if (!isAuthenticated || !role || !allowedRoles.includes(role)) {
    if (fallback) return <>{fallback}</>;

    return (
      <div className="h-full flex flex-col items-center justify-center p-6 text-center space-y-4 font-sans bg-slate-50">
        <div className="p-4 bg-red-100 border border-red-200 text-red-600 rounded-2xl">
          <Lock className="w-8 h-8" />
        </div>
        <div className="space-y-1 max-w-md">
          <h2 className="text-xl font-bold text-slate-900">Restricted Operational Clearance</h2>
          <p className="text-xs text-slate-500">
            Your active role <span className="font-mono font-bold text-slate-700">({role || 'UNAUTHENTICATED'})</span> does not hold clearance for this module.
          </p>
          <div className="text-[11px] text-slate-400 font-mono mt-1">
            Required Clearance: {allowedRoles.join(', ')}
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
          {allowedRoles.map((reqRole) => (
            <button
              key={reqRole}
              onClick={() => switchPersona(reqRole)}
              className="px-3 py-1.5 bg-slate-900 hover:bg-[#FF5500] text-white text-xs font-mono font-bold rounded-lg transition-all flex items-center gap-1.5"
            >
              Switch to {reqRole} <ArrowRight className="w-3 h-3" />
            </button>
          ))}
        </div>
      </div>
    );
  }

  return <>{children}</>;
};
