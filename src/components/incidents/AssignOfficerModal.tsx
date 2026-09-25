import React, { useState } from 'react';
import { ShieldCheck, User, CheckCircle2, X, AlertCircle } from 'lucide-react';
import { ApiService } from '../../services/api';

interface OfficerDef {
  id: string;
  name: string;
  rank: string;
  station: string;
}

interface AssignOfficerModalProps {
  incidentId: string;
  currentOfficerName?: string;
  onClose: () => void;
  onAssigned: (officer: OfficerDef | { id: string; name: string }) => void;
}

const OFFICERS_LIST: OfficerDef[] = [
  { id: 'OFF_001', name: 'Inspector Sanjay Rao', rank: 'Inspector (Cyber Crime Unit)', station: 'Cyberabad PS' },
  { id: 'OFF_002', name: 'Sub-Inspector Vikram Joshi', rank: 'Sub-Inspector', station: 'Gachibowli PS' },
  { id: 'OFF_003', name: 'Inspector Ananya Sharma', rank: 'Inspector (Financial Intelligence)', station: 'Telangana HQ' },
  { id: 'OFF_004', name: 'Sub-Inspector Rajesh Nayak', rank: 'Sub-Inspector', station: 'Madhapur PS' },
  { id: 'OFF_005', name: 'Inspector Hardeep Singh', rank: 'Inspector (Mule Taskforce)', station: 'Cyberabad PS' }
];

export const AssignOfficerModal: React.FC<AssignOfficerModalProps> = ({
  incidentId,
  currentOfficerName,
  onClose,
  onAssigned
}) => {
  const [selectedOfficerId, setSelectedOfficerId] = useState(OFFICERS_LIST[0].id);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAssign = async () => {
    setLoading(true);
    setError(null);
    try {
      await ApiService.assignOfficerToIncident(incidentId, selectedOfficerId);
      const chosen = OFFICERS_LIST.find(o => o.id === selectedOfficerId);
      onAssigned(chosen || { id: selectedOfficerId, name: 'Assigned Officer' });
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to assign officer');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-md overflow-hidden font-sans">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-blue-50 text-blue-600">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Assign Investigating Officer</h3>
              <p className="text-[11px] text-slate-500">Case Reference: <span className="font-mono font-bold text-[#FF5500]">{incidentId}</span></p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-4 space-y-3">
          {error && (
            <div className="p-2.5 rounded-lg bg-red-50 border border-red-200 text-red-600 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="text-xs text-slate-600">
            Currently Assigned: <span className="font-bold text-slate-800">{currentOfficerName || 'Unassigned'}</span>
          </div>

          <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
            {OFFICERS_LIST.map((officer) => (
              <label
                key={officer.id}
                className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                  selectedOfficerId === officer.id
                    ? 'border-blue-500 bg-blue-50/50 shadow-sm'
                    : 'border-slate-200 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <input
                    type="radio"
                    name="officerSelection"
                    value={officer.id}
                    checked={selectedOfficerId === officer.id}
                    onChange={() => setSelectedOfficerId(officer.id)}
                    className="text-blue-600 focus:ring-blue-500"
                  />
                  <div>
                    <div className="font-bold text-xs text-slate-900">{officer.name}</div>
                    <div className="text-[10px] text-slate-500">{officer.rank} • {officer.station}</div>
                  </div>
                </div>
              </label>
            ))}
          </div>
        </div>

        <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-end gap-2">
          <button
            onClick={onClose}
            className="px-3.5 py-1.5 rounded-lg border border-slate-200 text-xs font-medium text-slate-600 hover:bg-slate-100"
          >
            Cancel
          </button>
          <button
            onClick={handleAssign}
            disabled={loading}
            className="px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-600/20 disabled:opacity-50 flex items-center gap-1.5"
          >
            {loading ? 'Assigning...' : <><CheckCircle2 className="w-3.5 h-3.5" /> Confirm Assignment</>}
          </button>
        </div>
      </div>
    </div>
  );
};
