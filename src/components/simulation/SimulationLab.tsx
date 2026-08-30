import React, { useState } from 'react';
import { Play, ShieldAlert, Network } from 'lucide-react';
import { ApiService } from '../../services/api';
import { InputValidator } from '../../utils/validation';

export const SimulationLab: React.FC = () => {
  const [seedEntityId, setSeedEntityId] = useState<string>('C000035');
  const [predictionResult, setPredictionResult] = useState<any | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [inputVal, setInputVal] = useState<string>('C000035');

  const handleRunInference = async () => {
    setLoading(true);
    setError(null);
    setPredictionResult(null);
    try {
      // Actually fetch live prediction from the backend
      const res = await ApiService.predictLiveEntity(seedEntityId, 3);
      setPredictionResult(res);
    } catch (err: any) {
      setError(err.message || 'Failed to reach backend');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-full flex flex-col gap-3 p-4 bg-slate-50 overflow-y-auto">
      <div className="bg-white border border-slate-200 rounded-2xl p-4 flex items-center justify-between shadow-sm">
        <div>
          <h2 className="text-lg font-bold font-sans text-slate-900 flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-[#FF5500]" />
            GraphSAGE Inference Runner
          </h2>
          <p className="text-sm text-slate-500">Run a single live prediction against the GraphSAGE model.</p>
        </div>
        <div className="flex items-center gap-2">
          <input 
            type="text" 
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            className="border border-slate-300 rounded-lg px-3 py-2 text-sm"
            placeholder="Seed Entity ID"
          />
          <button 
            onClick={() => {
              setSeedEntityId(inputVal);
              handleRunInference();
            }}
            disabled={loading}
            className="bg-[#FF5500] hover:bg-[#FF5500]/90 text-white font-bold py-2 px-4 rounded-lg flex items-center gap-2 disabled:opacity-50"
          >
            {loading ? 'Running...' : <><Play className="w-4 h-4" /> Run Inference</>}
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 font-bold p-4 rounded-xl text-sm">
          Error: {error}
        </div>
      )}

      {predictionResult && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm h-[500px] overflow-auto">
             <h3 className="font-bold text-sm mb-3">Model Output JSON</h3>
             <pre className="text-xs text-slate-700 font-mono bg-slate-50 p-4 rounded-lg border border-slate-100">
               {JSON.stringify(predictionResult, null, 2)}
             </pre>
          </div>
          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm h-[500px] overflow-hidden relative">
             <div className="absolute top-4 left-4 z-10 bg-white/90 px-3 py-1 rounded shadow text-xs font-bold flex items-center gap-2">
               <Network className="w-4 h-4 text-purple-500" /> Graph Visualizer
             </div>
             <div className="h-full flex flex-col items-center justify-center text-slate-400 p-8 text-center text-sm gap-2">
                <Network className="w-12 h-12 text-slate-300" />
                <p>Prediction complete.</p>
                <p>To explore the 3D topology of this incident, navigate to the <b>Network Explorer</b> tab.</p>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};
