import React, { useState, useEffect } from 'react';
import {
  Settings,
  Building2,
  MapPin,
  Users,
  PlusCircle,
  CheckCircle2,
  RefreshCw,
  Search,
  ShieldCheck,
  ToggleLeft,
  ToggleRight,
  UserCheck,
  AlertCircle
} from 'lucide-react';
import { ApiService } from '../../services/api';
import { BankMaster, JurisdictionMaster, StaffUserMaster, UserRole } from '../../types';

export const AdminConsole: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'BANKS' | 'JURISDICTIONS' | 'STAFF'>('BANKS');
  const [banks, setBanks] = useState<BankMaster[]>([]);
  const [jurisdictions, setJurisdictions] = useState<JurisdictionMaster[]>([]);
  const [staffUsers, setStaffUsers] = useState<StaffUserMaster[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // New bank modal
  const [showAddBank, setShowAddBank] = useState(false);
  const [bankCode, setBankCode] = useState('');
  const [bankName, setBankName] = useState('');
  const [ifscPrefixes, setIfscPrefixes] = useState('');

  const loadData = async () => {
    try {
      setLoading(true);
      const [b, j, s] = await Promise.all([
        ApiService.getBanks().catch(() => []),
        ApiService.getJurisdictions().catch(() => []),
        ApiService.getStaffRoster().catch(() => []),
      ]);
      setBanks(b);
      setJurisdictions(j);
      setStaffUsers(s);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateBank = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bankCode || !bankName) return;
    try {
      const prefixes = ifscPrefixes.split(',').map((s) => s.trim().toUpperCase()).filter(Boolean);
      const newB = await ApiService.createBank({
        code: bankCode.trim().toUpperCase(),
        name: bankName.trim(),
        ifscPrefixes: prefixes,
      });
      setBanks((prev) => [...prev, newB]);
      setSuccessMessage(`Bank ${newB.name} (${newB.code}) onboarded successfully.`);
      setTimeout(() => setSuccessMessage(null), 4000);
      setShowAddBank(false);
      setBankCode('');
      setBankName('');
      setIfscPrefixes('');
    } catch (err) {
      console.error(err);
    }
  };

  const handleSyncRoster = async () => {
    try {
      setLoading(true);
      const synced = await ApiService.syncStaffRoster();
      setStaffUsers(synced);
      setSuccessMessage('Staff officer roster synchronized with State Police Directory.');
      setTimeout(() => setSuccessMessage(null), 4000);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4 font-sans text-xs">
      {/* ── SUCCESS TOAST ── */}
      {successMessage && (
        <div className="bg-emerald-50 border border-emerald-300 text-emerald-800 px-4 py-2.5 rounded-2xl flex items-center gap-2 font-medium shadow-sm animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* ── HEADER BANNER ── */}
      <div className="bg-white border border-slate-200 p-4 rounded-2xl flex flex-wrap items-center justify-between gap-3 shadow-saas-card">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-amber-50 border border-amber-200 rounded-xl text-amber-700">
            <Settings className="w-5 h-5" />
          </div>
          <div>
            <div className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <span>CENTRAL PLATFORM ADMINISTRATION CONSOLE</span>
              <span className="text-[10px] bg-amber-100 text-amber-800 font-bold px-2 py-0.5 rounded-full border border-amber-200">
                ROOT SUPERUSER
              </span>
            </div>
            <div className="text-[11px] text-slate-500">
              Manage core banking registry, jurisdiction police tree, and LEA officer credentials
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {activeTab === 'BANKS' && (
            <button
              onClick={() => setShowAddBank(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl shadow-sm transition-all"
            >
              <PlusCircle className="w-4 h-4" />
              <span>ONBOARD NEW BANK</span>
            </button>
          )}

          {activeTab === 'STAFF' && (
            <button
              onClick={handleSyncRoster}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-sm transition-all"
            >
              <RefreshCw className="w-4 h-4" />
              <span>SYNC POLICE ROSTER</span>
            </button>
          )}

          <button
            onClick={loadData}
            className="p-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-slate-600 transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* ── TABS NAVIGATION ── */}
      <div className="bg-white border border-slate-200 p-2.5 rounded-2xl flex flex-wrap items-center justify-between gap-3 shadow-saas-card">
        <div className="flex border border-slate-200 bg-slate-50 rounded-xl p-1 text-xs">
          <button
            onClick={() => setActiveTab('BANKS')}
            className={`flex items-center gap-2 px-4 py-1.5 rounded-lg font-bold transition-colors ${
              activeTab === 'BANKS'
                ? 'bg-white text-slate-900 shadow-sm border border-slate-200/60'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Building2 className="w-4 h-4" />
            <span>Bank Registry ({banks.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('JURISDICTIONS')}
            className={`flex items-center gap-2 px-4 py-1.5 rounded-lg font-bold transition-colors ${
              activeTab === 'JURISDICTIONS'
                ? 'bg-white text-slate-900 shadow-sm border border-slate-200/60'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <MapPin className="w-4 h-4" />
            <span>Jurisdictions ({jurisdictions.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('STAFF')}
            className={`flex items-center gap-2 px-4 py-1.5 rounded-lg font-bold transition-colors ${
              activeTab === 'STAFF'
                ? 'bg-white text-slate-900 shadow-sm border border-slate-200/60'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Staff Roster ({staffUsers.length})</span>
          </button>
        </div>

        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search master data..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-slate-50 border border-slate-200 pl-8 pr-3 py-1.5 text-xs text-slate-900 placeholder-slate-400 rounded-lg focus:border-amber-500 focus:outline-none w-56"
          />
        </div>
      </div>

      {/* ── TAB 1: BANKS REGISTRY ── */}
      {activeTab === 'BANKS' && (
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-saas-card">
          <table className="w-full text-left text-xs font-sans">
            <thead className="bg-slate-50 border-b border-slate-200 text-[10px] text-slate-500 font-bold uppercase tracking-wider">
              <tr>
                <th className="p-3">BANK CODE</th>
                <th className="p-3">INSTITUTION NAME</th>
                <th className="p-3">IFSC PREFIXES</th>
                <th className="p-3">INTEGRATION STATUS</th>
                <th className="p-3 text-center">ACTION</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {banks.map((b) => (
                <tr key={b.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="p-3 font-mono font-bold text-slate-900">{b.code}</td>
                  <td className="p-3 font-medium text-slate-800">{b.name}</td>
                  <td className="p-3">
                    <div className="flex flex-wrap gap-1">
                      {b.ifscPrefixes?.map((p) => (
                        <span key={p} className="font-mono text-[10px] bg-slate-100 px-1.5 py-0.5 rounded text-slate-700">
                          {p}
                        </span>
                      )) || <span className="text-slate-400 font-mono text-[10px]">ALL</span>}
                    </div>
                  </td>
                  <td className="p-3">
                    <span className="text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-0.5 rounded-full font-bold">
                      CONNECTED (CBS API)
                    </span>
                  </td>
                  <td className="p-3 text-center">
                    <button className="text-[11px] text-blue-600 font-bold hover:underline">
                      Configure Endpoints
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ── TAB 2: JURISDICTIONS ── */}
      {activeTab === 'JURISDICTIONS' && (
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-saas-card">
          <table className="w-full text-left text-xs font-sans">
            <thead className="bg-slate-50 border-b border-slate-200 text-[10px] text-slate-500 font-bold uppercase tracking-wider">
              <tr>
                <th className="p-3">JURISDICTION ID</th>
                <th className="p-3">POLICE STATION / HQ NAME</th>
                <th className="p-3">HIERARCHY LEVEL</th>
                <th className="p-3">ORGANIZATIONAL PATH</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {jurisdictions.map((j) => (
                <tr key={j.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="p-3 font-mono font-bold text-slate-900">{j.id}</td>
                  <td className="p-3 font-medium text-slate-800">{j.name}</td>
                  <td className="p-3">
                    <span className="text-[10px] px-2 py-0.5 rounded font-bold uppercase bg-slate-100 text-slate-700">
                      {j.level}
                    </span>
                  </td>
                  <td className="p-3 font-mono text-[11px] text-slate-500">{j.path}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ── TAB 3: STAFF ROSTER ── */}
      {activeTab === 'STAFF' && (
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-saas-card">
          <table className="w-full text-left text-xs font-sans">
            <thead className="bg-slate-50 border-b border-slate-200 text-[10px] text-slate-500 font-bold uppercase tracking-wider">
              <tr>
                <th className="p-3">OFFICER NAME</th>
                <th className="p-3">ROLE CLEARANCE</th>
                <th className="p-3">AFFILIATED UNIT / BANK</th>
                <th className="p-3">BADGE / EMP ID</th>
                <th className="p-3">STATUS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {staffUsers.map((s) => (
                <tr key={s.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="p-3">
                    <div className="font-bold text-slate-900">{s.name}</div>
                    <div className="text-[10px] text-slate-400">{s.email}</div>
                  </td>
                  <td className="p-3">
                    <span className="text-[10px] px-2 py-0.5 rounded-full font-bold uppercase bg-slate-100 text-slate-800">
                      {s.role}
                    </span>
                  </td>
                  <td className="p-3 font-medium text-slate-700">
                    {s.bankName || s.jurisdictionName || 'Central Cyber Cell'}
                  </td>
                  <td className="p-3 font-mono text-slate-700">{s.employeeId || 'N/A'}</td>
                  <td className="p-3">
                    <span className="text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-full font-bold">
                      {s.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ── MODAL: ONBOARD NEW BANK ── */}
      {showAddBank && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-md shadow-2xl p-5 space-y-4 font-sans animate-fadeIn">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-amber-50 text-amber-600 rounded-xl">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">Onboard Financial Institution</h3>
                  <p className="text-[10px] text-slate-500">Register bank in national AML freeze registry</p>
                </div>
              </div>
              <button
                onClick={() => setShowAddBank(false)}
                className="text-slate-400 hover:text-slate-700 font-bold text-lg"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateBank} className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-700 uppercase">Bank Code (4 Chars) *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. AXIS"
                  maxLength={6}
                  value={bankCode}
                  onChange={(e) => setBankCode(e.target.value.toUpperCase())}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-mono text-slate-900 focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-700 uppercase">Institution Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Axis Bank Limited"
                  value={bankName}
                  onChange={(e) => setBankName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-700 uppercase">IFSC Prefixes (Comma-separated)</label>
                <input
                  type="text"
                  placeholder="UTIB0001, UTIB0002"
                  value={ifscPrefixes}
                  onChange={(e) => setIfscPrefixes(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-mono text-slate-900 focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddBank(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl font-bold hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-slate-900 text-white rounded-xl font-bold shadow-sm hover:bg-slate-800"
                >
                  Register Bank
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
