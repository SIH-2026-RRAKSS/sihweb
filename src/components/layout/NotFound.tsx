import React from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle, ArrowLeft } from 'lucide-react';

export const NotFound: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] bg-white border border-slate-200 rounded-2xl shadow-sm m-4 font-sans p-4 text-center">
      <AlertTriangle className="w-16 h-16 text-amber-500 mb-4" />
      <h1 className="text-3xl font-bold text-slate-900 mb-2 uppercase tracking-tight">404 // Sector Not Found</h1>
      <p className="text-slate-500 mb-6 max-w-md">
        The requested intelligence zone doesn't exist or you have veered off the operational grid.
      </p>
      <button
        onClick={() => navigate('/', { replace: true })}
        className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors font-bold text-sm shadow-sm"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Return to Grid</span>
      </button>
    </div>
  );
};
