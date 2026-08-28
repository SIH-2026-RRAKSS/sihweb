import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, RotateCcw, Sliders, Zap, Search, Shield, ChevronDown, CheckCircle2, MapPin, ArrowRight, Sparkles } from 'lucide-react';
import { ThreeNetworkCanvas } from './ThreeNetworkCanvas';
import { PipelineStageRail } from './PipelineStageRail';
import { SimulationOutputs } from './SimulationOutputs';
import { ApiService } from '../../services/api';
import { ConfidenceTier, IncidentDetail, IncidentSummary } from '../../types';

export interface SimulationResults {
  xgboostScore: number;
  graphsageScore: number;
  confidenceTier: ConfidenceTier;
  terminalPrediction: { id: string; city: string; score: number };
  evidence: string[];
  action: string;
  briefing: string;
}

const TACTICAL_PRESET_SEEDS = [
  { id: 'C000035', label: 'C000035', city: 'Bengaluru (Indiranagar)', terminal: 'ATM_008', amount: 450000, tier: 'HIGH_CONFIDENCE', color: 'text-[#FF5500]' },
  { id: 'C000056', label: 'C000056', city: 'Bhopal (MP Nagar)', terminal: 'ATM_023', amount: 820000, tier: 'HIGH_CONFIDENCE', color: 'text-[#FF5500]' },
  { id: 'C000047', label: 'C000047', city: 'Mumbai (Nariman Point)', terminal: 'ATM_029', amount: 450000, tier: 'HIGH_CONFIDENCE', color: 'text-[#FF5500]' },
  { id: 'C000122', label: 'C000122', city: 'Consolidation Hub', terminal: 'ATM_015', amount: 71500, tier: 'MEDIUM_CONFIDENCE', color: 'text-amber-400' },
  { id: 'C000001', label: 'C000001', city: 'Kochi (Merchant Settlement)', terminal: 'NONE', amount: 25000, tier: 'NORMAL', color: 'text-emerald-400' },
];

export const SimulationLab: React.FC = () => {
  const [simulationState, setSimulationState] = useState<'idle' | 'running' | 'paused' | 'complete'>('idle');
  const [currentStage, setCurrentStage] = useState<number>(0);
  const [speed, setSpeed] = useState<number>(1);
  const [seedEntityId, setSeedEntityId] = useState<string>('C000035');
  const [incidentDetail, setIncidentDetail] = useState<IncidentDetail | null>(null);
  const [results, setResults] = useState<SimulationResults | null>(null);
  const [stageTimings, setStageTimings] = useState<number[]>(new Array(8).fill(0));

  const [allIncidents, setAllIncidents] = useState<IncidentSummary[]>([]);
  const [showCaseSelector, setShowCaseSelector] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [tierFilter, setTierFilter] = useState<string>('ALL');

  const timerRef = useRef<any>(null);

  // 1. Fetch full incident roster on mount
  useEffect(() => {
    const loadRoster = async () => {
      try {
        const res = await ApiService.getIncidents({ page: 1, page_size: 1000 });
        if (res.items && res.items.length > 0) {
          const sorted = [...res.items].sort((a, b) => {
            const numA = parseInt(a.complaint_id.replace(/\D/g, ''), 10) || 0;
            const numB = parseInt(b.complaint_id.replace(/\D/g, ''), 10) || 0;
            return numA - numB;
          });
          setAllIncidents(sorted);
        }
      } catch (err) {
        console.error('Failed to load incident roster:', err);
      }
    };
    loadRoster();
  }, []);

  // 2. Fetch specific incident detail when seedEntityId changes
  useEffect(() => {
    const fetchDetail = async () => {
      try {
        const detail = await ApiService.getIncidentDetail(seedEntityId);
        setIncidentDetail(detail);

        const isHigh = detail.model_prediction.confidence_tier === 'HIGH_CONFIDENCE';
        const isMedium = detail.model_prediction.confidence_tier === 'MEDIUM_CONFIDENCE';
        const isNormal = detail.model_prediction.confidence_tier === 'NORMAL';

        const gnnScore = detail.model_prediction.graphsage_risk_probability;
        const xgbScore = isHigh ? 0.8889 : (isMedium ? 0.7393 : 0.0910);
        const terminalId = detail.model_prediction.top_terminal_id || (isNormal ? 'NONE' : 'ATM_008');
        const terminalCity = detail.model_prediction.top_terminal_city || (isNormal ? 'Legitimate Settlement' : 'Indiranagar (Bengaluru)');

        const evidence = detail.investigative_evidence_bullets && detail.investigative_evidence_bullets.length > 0
          ? detail.investigative_evidence_bullets
          : (isHigh ? [
              `GraphSAGE risk probability ${(gnnScore * 100).toFixed(2)}% exceeds threshold τ = 0.50.`,
              `Disputed funds ₹${(detail.complaint.reported_amount || 450000).toLocaleString('en-IN')} routed across multi-hop UPI conduits.`,
              `Downstream exit path converges at physical ATM terminal ${terminalId} in ${terminalCity}.`,
            ] : (isMedium ? [
              'Fan-in structuring: micro-deposits consolidated into intermediate account.',
              'Elevated topological risk requiring investigator verification.',
            ] : [
              'Standard commercial transaction flow: no multi-hop structuring detected.',
              'Normal risk probability: cleared for standard settlement.',
            ]));

        setResults({
          xgboostScore: xgbScore,
          graphsageScore: gnnScore,
          confidenceTier: detail.model_prediction.confidence_tier,
          terminalPrediction: {
            id: terminalId,
            city: terminalCity,
            score: detail.model_prediction.top_terminal_score || (isHigh ? 0.95 : 0.42),
          },
          evidence,
          action: isHigh ? 'ESCALATE // REQUEST IMMEDIATE FREEZE' : (isMedium ? 'FLAG FOR TRIAGE // ENHANCED MONITORING' : 'DISMISS ALERT // VALIDATED NORMAL'),
          briefing: detail.model_prediction.executive_summary || `Investigation briefing generated for complaint ${seedEntityId}.`,
        });
      } catch (err) {
        console.error('Failed to load incident detail for seed:', err);
      }
    };
    fetchDetail();
    handleReset();
  }, [seedEntityId]);

  // 3. 8-Stage Execution Timer
  useEffect(() => {
    if (simulationState === 'running') {
      const stageInterval = Math.max(80, Math.floor(680 / speed));

      timerRef.current = setInterval(() => {
        setCurrentStage((prev) => {
          if (prev < 8) {
            return prev + 1;
          } else {
            setSimulationState('complete');
            clearInterval(timerRef.current);
            return 8;
          }
        });
      }, stageInterval);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [simulationState, speed]);

  const handlePlay = () => {
    if (simulationState === 'complete' || currentStage === 8) {
      setCurrentStage(0);
    }
    setSimulationState('running');
  };

  const handlePause = () => {
    setSimulationState('paused');
  };

  const handleReset = () => {
    setSimulationState('idle');
    setCurrentStage(0);
  };

  const handleSelectCase = (chosenId: string) => {
    setSeedEntityId(chosenId);
    setShowCaseSelector(false);
  };

  const filteredCases = allIncidents.filter((inc) => {
    if (tierFilter !== 'ALL' && inc.confidence_tier !== tierFilter) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        inc.complaint_id.toLowerCase().includes(q) ||
        (inc.scam_category && inc.scam_category.toLowerCase().includes(q)) ||
        (inc.district && inc.district.toLowerCase().includes(q)) ||
        (inc.state && inc.state.toLowerCase().includes(q))
      );
    }
    return true;
  });

  return (
    <div className="h-full flex flex-col gap-3 overflow-hidden font-mono text-xs select-none">
      {/* ── TOP TACTICAL BAR: SEED ENTITY SWITCHER & QUICK PRESETS ── */}
      <div className="bg-[#0C0E12] border border-white/10 rounded-lg p-3 flex flex-wrap items-center justify-between gap-3 shadow-industrial-sm flex-shrink-0">
        
        {/* Left: Active Seed Entity Pill */}
        <div className="flex items-center gap-2.5">
          <div className="flex items-center gap-1.5 px-3 py-1 bg-[#141822] border border-white/15 rounded text-white font-bold">
            <span className="w-2 h-2 rounded-full bg-[#FF5500] animate-pulse" />
            <span>ACTIVE SEED:</span>
            <span className="text-[#FF5500]">{seedEntityId}</span>
          </div>

          <div className="hidden sm:flex items-center gap-2 text-[11px] text-zinc-400">
            <span>{incidentDetail?.complaint.location ? incidentDetail.complaint.location : 'Locating...'}</span>
            <span className="text-zinc-600">|</span>
            <span className="text-white font-bold">₹{(incidentDetail?.complaint.reported_amount || 450000).toLocaleString('en-IN')}</span>
            <span className="text-zinc-600">|</span>
            <span className={`font-bold px-1.5 py-0.2 rounded text-[10px] ${
              incidentDetail?.model_prediction.confidence_tier === 'HIGH_CONFIDENCE'
                ? 'bg-[#FF5500]/15 text-[#FF5500] border border-[#FF5500]/30'
                : (incidentDetail?.model_prediction.confidence_tier === 'MEDIUM_CONFIDENCE' ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30' : 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30')
            }`}>
              {incidentDetail?.model_prediction.confidence_tier || 'HIGH_CONFIDENCE'}
            </span>
          </div>
        </div>

        {/* Center/Right: Quick Preset Threat Seeds with Motion.dev LayoutId */}
        <div className="flex items-center gap-1.5 overflow-x-auto">
          {TACTICAL_PRESET_SEEDS.map((preset) => {
            const isSelected = seedEntityId === preset.id;
            return (
              <motion.button
                key={preset.id}
                onClick={() => handleSelectCase(preset.id)}
                className={`relative px-3 py-1.5 rounded text-[10px] font-bold transition-colors whitespace-nowrap z-10 ${
                  isSelected
                    ? 'text-white'
                    : 'text-zinc-400 hover:text-zinc-200 bg-[#141822]/60 border border-white/5'
                }`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {isSelected && (
                  <motion.div
                    layoutId="activeThreatPill"
                    className="absolute inset-0 bg-[#FF5500]/20 border border-[#FF5500] rounded shadow-signal-glow z-[-1]"
                    transition={{ type: 'spring', stiffness: 380, damping: 28 }}
                  />
                )}
                <span>{preset.label}</span>
                <span className="text-zinc-500 ml-1">({preset.terminal})</span>
              </motion.button>
            );
          })}

          {/* Search Dropdown Trigger */}
          <div className="relative">
            <motion.button
              onClick={() => setShowCaseSelector(!showCaseSelector)}
              className="px-3 py-1.5 bg-[#1A202C] hover:bg-[#252D3D] border border-white/20 text-white font-bold rounded flex items-center gap-1.5 text-[10px] transition-all"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Search className="w-3 h-3 text-[#FF5500]" />
              <span>SEARCH ALL (1,000 CASES)</span>
              <ChevronDown className="w-3 h-3 text-zinc-400" />
            </motion.button>

            {/* Dropdown Modal with Motion.dev AnimatePresence */}
            <AnimatePresence>
              {showCaseSelector && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: -10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: -10 }}
                  transition={{ type: 'spring', stiffness: 350, damping: 25 }}
                  className="absolute right-0 top-full mt-2 w-96 max-h-96 bg-[#0C0E12]/98 border border-white/20 rounded-lg shadow-industrial-lg z-50 p-3.5 flex flex-col space-y-2.5 backdrop-blur-xl"
                >
                  <div className="flex items-center justify-between border-b border-white/10 pb-2">
                    <span className="font-bold text-white text-xs">SELECT COMPLAINT SEED ENTITY</span>
                    <button onClick={() => setShowCaseSelector(false)} className="text-zinc-400 hover:text-white text-xs font-bold">✕</button>
                  </div>

                  <div className="space-y-1.5">
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search by ID, State, District, Scam..."
                      className="w-full bg-[#060709] border border-white/10 rounded px-2.5 py-1.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-[#FF5500]"
                    />
                    <div className="flex items-center gap-1 text-[9px]">
                      {(['ALL', 'HIGH_CONFIDENCE', 'MEDIUM_CONFIDENCE', 'NORMAL'] as const).map((tier) => (
                        <button
                          key={tier}
                          onClick={() => setTierFilter(tier)}
                          className={`px-2 py-0.5 rounded font-bold ${
                            tierFilter === tier ? 'bg-[#FF5500] text-black' : 'bg-white/5 text-zinc-400 hover:text-white'
                          }`}
                        >
                          {tier === 'HIGH_CONFIDENCE' ? 'HIGH' : (tier === 'MEDIUM_CONFIDENCE' ? 'MED' : tier)}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex-1 overflow-y-auto max-h-60 space-y-1 pr-1">
                    {filteredCases.slice(0, 40).map((inc) => (
                      <div
                        key={inc.complaint_id}
                        onClick={() => handleSelectCase(inc.complaint_id)}
                        className={`p-2 rounded border cursor-pointer flex items-center justify-between text-[10px] transition-all ${
                          seedEntityId === inc.complaint_id
                            ? 'bg-[#FF5500]/15 border-[#FF5500] text-white'
                            : 'bg-[#060709] border-white/5 text-zinc-300 hover:border-white/20'
                        }`}
                      >
                        <div>
                          <div className="font-bold text-white">{inc.complaint_id} · <span className="text-zinc-400">{inc.district}, {inc.state}</span></div>
                          <div className="text-[9px] text-zinc-500">{inc.scam_category} {inc.top_terminal_id ? `➔ ${inc.top_terminal_id}` : ''}</div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-emerald-400">₹{(inc.reported_amount || 0).toLocaleString('en-IN')}</div>
                          <div className="text-[8px] text-zinc-500">{inc.confidence_tier}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

      </div>

      {/* ── TOP PIPELINE STAGE RAIL ── */}
      <PipelineStageRail
        currentStage={currentStage}
        stageTimings={stageTimings}
        state={simulationState}
        onSelectStage={setCurrentStage}
      />

      {/* ── MAIN WORKSPACE (2-COLUMN HIGH-TECH LAYOUT) ── */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-3 min-h-0 overflow-hidden">
        
        {/* LEFT/CENTER: EXPANSIVE 3D SIMULATION CANVAS (8 COLS) */}
        <div className="lg:col-span-8 h-full flex flex-col min-h-[460px] relative">
          <ThreeNetworkCanvas
            currentStage={currentStage}
            seedEntityId={seedEntityId}
            incidentDetail={incidentDetail}
            speed={speed}
          />
        </div>

        {/* RIGHT: TACTICAL CONTROL & TELEMETRY DECK (4 COLS) */}
        <div className="lg:col-span-4 h-full flex flex-col gap-3 overflow-hidden">
          
          {/* Execution Control Deck */}
          <div className="bg-[#0C0E12] border border-white/10 rounded-lg p-3.5 space-y-3 shadow-industrial-sm flex-shrink-0">
            <div className="flex items-center justify-between border-b border-white/10 pb-2">
              <span className="font-bold text-white text-xs flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-[#FF5500]" />
                <span>PIPELINE EXECUTION CONSOLE</span>
              </span>
              <span className="text-[9px] text-zinc-500">STAGE 0-8 INFERENCE</span>
            </div>

            {/* Primary Action Button with Motion Spring & Glow */}
            <div className="flex items-center gap-2">
              {simulationState === 'running' ? (
                <motion.button
                  onClick={handlePause}
                  className="flex-1 py-3 bg-amber-500 hover:bg-amber-400 text-black font-bold rounded flex items-center justify-center gap-2 transition-all shadow-md"
                  whileHover={{ scale: 1.015 }}
                  whileTap={{ scale: 0.985 }}
                >
                  <Pause className="w-4 h-4 fill-current" />
                  <span>PAUSE INFERENCE</span>
                </motion.button>
              ) : (
                <motion.button
                  onClick={handlePlay}
                  className="flex-1 py-3 bg-[#FF5500] hover:bg-[#FF5500]/90 text-black font-bold rounded flex items-center justify-center gap-2 transition-all shadow-signal-glow font-bold text-xs"
                  whileHover={{ scale: 1.015, boxShadow: '0 0 25px rgba(255, 85, 0, 0.4)' }}
                  whileTap={{ scale: 0.985 }}
                >
                  <Play className="w-4 h-4 fill-current" />
                  <span>{currentStage === 8 ? 'RE-EXECUTE PIPELINE' : 'EXECUTE PIPELINE (STAGE 0-8)'}</span>
                </motion.button>
              )}

              <motion.button
                onClick={handleReset}
                className="p-3 bg-[#1A202C] hover:bg-[#252D3D] border border-white/10 text-zinc-300 hover:text-white rounded transition-colors"
                title="Reset Simulation"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <RotateCcw className="w-4 h-4" />
              </motion.button>
            </div>

            {/* Execution Velocity Selector with Motion.dev LayoutId */}
            <div className="flex items-center justify-between text-[10px] pt-1">
              <span className="text-zinc-400">Execution Velocity:</span>
              <div className="flex items-center gap-1 bg-[#060709] p-0.5 rounded border border-white/10">
                {([1, 2, 4] as const).map((s) => {
                  const isCur = speed === s;
                  return (
                    <motion.button
                      key={s}
                      onClick={() => setSpeed(s)}
                      className={`relative px-3 py-0.5 rounded font-bold transition-colors z-10 ${
                        isCur ? 'text-black' : 'text-zinc-400 hover:text-white'
                      }`}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      {isCur && (
                        <motion.div
                          layoutId="activeSpeedPill"
                          className="absolute inset-0 bg-white rounded z-[-1]"
                          transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                        />
                      )}
                      <span>{s}x</span>
                    </motion.button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Intelligence Telemetry & Evidence Deck */}
          <div className="flex-1 overflow-hidden">
            <SimulationOutputs
              currentStage={currentStage}
              results={results}
              incidentDetail={incidentDetail}
              state={simulationState}
            />
          </div>

        </div>

      </div>

    </div>
  );
};
