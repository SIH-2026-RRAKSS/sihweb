import React, { useState, useEffect } from 'react';
import { InputValidator } from '../../utils/validation';
import { Activity, ShieldAlert, Network, Settings, FileText, Search, Play, ServerCrash, CheckCircle2 } from 'lucide-react';

const BASE_URL = ((import.meta as any).env?.VITE_API_BASE_URL as string) || '/api';

export const LiveDemoView: React.FC = () => {
  const [incidents, setIncidents] = useState<any[]>([]);
  const [selectedIncident, setSelectedIncident] = useState<any | null>(null);
  const [graphData, setGraphData] = useState<any | null>(null);
  
  // Manual trigger state
  const [seedEntity, setSeedEntity] = useState('C000854');
  const [maxHops, setMaxHops] = useState(2);
  const [manualResult, setManualResult] = useState<any | null>(null);
  const [manualError, setManualError] = useState<string | null>(null);
  
  // Policy simulator state
  const [threshold, setThreshold] = useState(0.85);
  const [dataset, setDataset] = useState('synthetic');
  const [policyResult, setPolicyResult] = useState<any | null>(null);
  
  const [serverOnline, setServerOnline] = useState(true);

  // 1. Live Alerts Feed (Polling)
  useEffect(() => {
    const fetchIncidents = async () => {
      try {
        const res = await fetch(`${BASE_URL}/incidents?page=1&page_size=50&min_risk=0.50`);
        if (res.ok) {
          const data = await res.json();
          setIncidents(data.items || (Array.isArray(data) ? data : []));
          setServerOnline(true);
        } else {
          throw new Error('Server returned error');
        }
      } catch (err) {
        setServerOnline(false);
        setIncidents([]);
      }
    };

    fetchIncidents();
    const interval = setInterval(fetchIncidents, 5000);
    return () => clearInterval(interval);
  }, []);

  // 2. Interactive Graph Fetch
  const handleSelectIncident = async (inc: any) => {
    setSelectedIncident(inc);
    const incId = inc.complaint_id || inc.incident_id;
    try {
      const res = await fetch(`${BASE_URL}/incidents/${incId}/graph`);
      if (res.ok) {
        setGraphData(await res.json());
      } else {
        throw new Error('Failed to fetch graph');
      }
    } catch (err) {
      setGraphData(null);
    }
  };

  // 3. Manual Investigation Trigger
  const handleManualTrigger = async () => {
    setManualError(null);
    setManualResult(null);

    const val = InputValidator.validateEntityId(seedEntity);
    if (!val.isValid) {
      setManualError(val.error || 'Invalid input');
      return;
    }
    try {
      const res = await fetch(`${BASE_URL}/predict/subgraph`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ seed_entity_id: seedEntity, max_hops: maxHops })
      });
      if (res.ok) {
        setManualResult(await res.json());
      } else {
        throw new Error('Failed to trigger');
      }
    } catch (err) {
      setManualError('Investigation failed — backend unreachable');
    }
  };

  // 4. Dossier Export
  const handleExportDossier = (incidentId: string) => {
    window.open(`${BASE_URL}/dossier/${incidentId}/export?format=html`, '_blank');
  };

  // 5. Policy Tune
  const handleTunePolicy = async () => {
    try {
      const res = await fetch(`${BASE_URL}/policy/tune`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ threshold, dataset: 'synthetic' })
      });
      if (res.ok) {
        setPolicyResult(await res.json());
      } else {
        throw new Error('Policy tune failed');
      }
    } catch (err) {
      setPolicyResult(null);
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-50 p-6 overflow-y-auto space-y-6">
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Backend Integration Demo</h1>
          <p className="text-sm text-slate-500 mt-1">Live staging environment testing GraphSAGE FastAPI connections.</p>
        </div>
        <div className={`px-4 py-2 rounded-full flex items-center gap-2 text-xs font-bold ${serverOnline ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
          {serverOnline ? <CheckCircle2 className="w-4 h-4" /> : <ServerCrash className="w-4 h-4" />}
          <span>{serverOnline ? 'BACKEND ONLINE' : 'BACKEND OFFLINE (USING FALLBACKS)'}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* LEFT COLUMN */}
        <div className="space-y-6">
          
          {/* Component 1: Live Feed */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
            <div className="flex items-center gap-2 mb-4 border-b border-slate-100 pb-3">
              <Activity className="w-5 h-5 text-orange-500" />
              <h2 className="text-sm font-bold text-slate-900 uppercase">1. Live Alert Feed (GET /api/incidents)</h2>
            </div>
            <div className="space-y-2">
              {incidents.map((inc) => (
                <div 
                  key={inc.incident_id} 
                  onClick={() => handleSelectIncident(inc)}
                  className={`p-3 border rounded-xl cursor-pointer transition-all flex items-center justify-between ${selectedIncident?.incident_id === inc.incident_id ? 'border-orange-500 bg-orange-50' : 'border-slate-200 hover:border-orange-300'}`}
                >
                  <div className="flex flex-col gap-1">
                    <span className="font-bold text-slate-900 text-sm">{inc.incident_id}</span>
                    <span className="text-xs text-slate-500">{new Date(inc.timestamp).toLocaleTimeString()}</span>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <span className="text-xs font-bold text-orange-600 bg-orange-100 px-2 py-0.5 rounded-full">{inc.confidence_tier}</span>
                    <span className="text-xs text-slate-600 font-mono">{(inc.risk_probability * 100).toFixed(1)}% RISK</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Component 3: Manual Investigation */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
            <div className="flex items-center gap-2 mb-4 border-b border-slate-100 pb-3">
              <Search className="w-5 h-5 text-blue-500" />
              <h2 className="text-sm font-bold text-slate-900 uppercase">3. Manual Trigger (POST /api/predict/subgraph)</h2>
            </div>
            <div className="flex items-center gap-3 mb-4">
              <div className="flex-1">
                <label className="text-xs font-bold text-slate-500 mb-1 block">Seed Entity ID</label>
                <input 
                  type="text" 
                  value={seedEntity} 
                  onChange={(e) => setSeedEntity(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 focus:outline-none focus:border-blue-500"
                />
              </div>
              <div className="w-24">
                <label className="text-xs font-bold text-slate-500 mb-1 block">Max Hops</label>
                <input 
                  type="number" 
                  value={maxHops} 
                  onChange={(e) => setMaxHops(parseInt(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 focus:outline-none focus:border-blue-500"
                />
              </div>
              <div className="pt-5">
                <button 
                  onClick={handleManualTrigger}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-bold text-sm transition-colors flex items-center gap-2"
                >
                  <Play className="w-4 h-4" />
                  Run
                </button>
              </div>
            </div>
            {manualError && (
              <div className="bg-red-50 p-3 rounded-lg border border-red-200 text-xs font-bold text-red-600">
                {manualError}
              </div>
            )}
            {manualResult && (
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 text-xs font-mono text-slate-700 overflow-x-auto">
                <pre>{JSON.stringify(manualResult, null, 2)}</pre>
              </div>
            )}
          </div>

        </div>

        {/* RIGHT COLUMN */}
        <div className="space-y-6">
          
          {/* Component 2 & 4: Interactive Graph & Dossier Export */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Network className="w-5 h-5 text-purple-500" />
                <h2 className="text-sm font-bold text-slate-900 uppercase">2. Topology Graph (GET /api/.../graph)</h2>
              </div>
              {selectedIncident && (
                <button 
                  onClick={() => handleExportDossier(selectedIncident.incident_id)}
                  className="text-xs flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-1.5 rounded-lg transition-colors font-bold uppercase"
                >
                  <FileText className="w-3.5 h-3.5" />
                  4. Export Dossier
                </button>
              )}
            </div>
            
            {!selectedIncident ? (
              <div className="h-48 flex items-center justify-center text-slate-400 text-sm border-2 border-dashed border-slate-200 rounded-xl">
                Select an incident from the feed to view graph
              </div>
            ) : (
              <div className="space-y-3">
                <div className="h-32 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-center relative overflow-hidden">
                   <Network className="w-16 h-16 text-slate-300 absolute opacity-20" />
                   <div className="text-center z-10">
                     <p className="text-sm font-bold text-slate-700">Render Graph Elements</p>
                     <p className="text-xs text-slate-500">{graphData?.num_nodes} Nodes | {graphData?.num_edges} Edges</p>
                   </div>
                </div>
                <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 text-xs font-mono text-slate-700 overflow-x-auto max-h-40">
                  <pre>{JSON.stringify(graphData, null, 2)}</pre>
                </div>
              </div>
            )}
          </div>

          {/* Component 5: Threshold Simulator */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
            <div className="flex items-center gap-2 mb-4 border-b border-slate-100 pb-3">
              <Settings className="w-5 h-5 text-emerald-500" />
              <h2 className="text-sm font-bold text-slate-900 uppercase">5. Policy Tune (POST /api/policy/tune)</h2>
            </div>
            
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-xs font-bold text-slate-600 mb-2">
                  <span>Threshold: {threshold.toFixed(2)}</span>
                  <span>Dataset: {dataset}</span>
                </div>
                <input 
                  type="range" 
                  min="0.5" 
                  max="0.99" 
                  step="0.01" 
                  value={threshold}
                  onChange={(e) => {
                    setThreshold(parseFloat(e.target.value));
                    handleTunePolicy();
                  }}
                  className="w-full"
                />
              </div>

              {policyResult && (
                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-center">
                    <p className="text-[10px] font-bold text-slate-500 uppercase">Alerts</p>
                    <p className="text-lg font-bold text-slate-900">{policyResult.alerts_generated}</p>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-center">
                    <p className="text-[10px] font-bold text-slate-500 uppercase">Precision</p>
                    <p className="text-lg font-bold text-slate-900">{policyResult.precision_percent.toFixed(1)}%</p>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-center">
                    <p className="text-[10px] font-bold text-slate-500 uppercase">Recall</p>
                    <p className="text-lg font-bold text-slate-900">{policyResult.recall_percent.toFixed(1)}%</p>
                  </div>
                </div>
              )}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
