import React, { useState, useEffect, useRef } from 'react';
import { ThreeNetworkCanvas } from './ThreeNetworkCanvas';
import { PipelineStageRail } from './PipelineStageRail';
import { SimulationControls, SimulationParams } from './SimulationControls';
import { SimulationOutputs } from './SimulationOutputs';
import { ConfidenceTier } from '../../types';

export interface SimulationResults {
  xgboostScore: number;
  graphsageScore: number;
  confidenceTier: ConfidenceTier;
  terminalPrediction: { id: string; city: string; score: number };
  evidence: string[];
  action: string;
  briefing: string;
}

export const SimulationLab: React.FC = () => {
  const [simulationState, setSimulationState] = useState<'idle' | 'running' | 'paused' | 'complete'>('idle');
  const [currentStage, setCurrentStage] = useState<number>(0);
  const [speed, setSpeed] = useState<number>(1);
  const [selectedScenario, setSelectedScenario] = useState<string>('fan-out');
  const [seedEntityId, setSeedEntityId] = useState<string>('C000047');
  const [params, setParams] = useState<SimulationParams>({
    amount: 450000,
    hopCount: 3,
    muleCount: 4,
    anomalyIntensity: 'High',
    threshold: 0.50,
  });
  const [results, setResults] = useState<SimulationResults | null>(null);
  const [stageTimings, setStageTimings] = useState<number[]>(new Array(8).fill(0));
  const [isAlerting, setIsAlerting] = useState<boolean>(false);

  const timerRef = useRef<any>(null);

  // Generate tactical results based on scenario & seed entity
  const generateResults = (scen: string, entityId: string): SimulationResults => {
    const isHighRisk = ['fan-out', 'multi-hop', 'atm-blitz', 'novel-ring'].includes(scen);
    const isMedium = scen === 'fan-in';

    const isBhopal = entityId.includes('56');
    const isBengaluru = entityId.includes('35');
    const isDelhi = entityId.includes('48');

    const terminalId = isBhopal ? 'ATM_023' : isBengaluru ? 'ATM_008' : isDelhi ? 'ATM_002' : 'ATM_029';
    const terminalCity = isBhopal ? 'Bhopal (MP Nagar)' : isBengaluru ? 'Bengaluru (Indiranagar)' : isDelhi ? 'Delhi (Connaught Place)' : 'Mumbai (Nariman Point)';

    const graphsageScore = isHighRisk 
      ? (scen === 'atm-blitz' ? 0.9988 : 0.9650) 
      : (isMedium ? 0.8415 : 0.0820);
    const xgboostScore = isHighRisk ? 0.8889 : (isMedium ? 0.7393 : 0.0910);
    const tier: ConfidenceTier = isHighRisk ? 'HIGH_CONFIDENCE' : (isMedium ? 'MEDIUM_CONFIDENCE' : 'NORMAL');

    return {
      xgboostScore,
      graphsageScore,
      confidenceTier: tier,
      terminalPrediction: {
        id: terminalId,
        city: terminalCity,
        score: isHighRisk ? 0.95 : 0.42,
      },
      evidence: isHighRisk ? [
        `GraphSAGE risk probability is ${(graphsageScore * 100).toFixed(2)}%, exceeding threshold τ = ${params.threshold.toFixed(2)}.`,
        `High-velocity structuring: 92.4% of ₹${(params.amount).toLocaleString('en-IN')} routed across ${params.hopCount} hops in 45 minutes.`,
        `Downstream exit path converges at physical terminal ${terminalId} in ${terminalCity}.`,
        'Syndicate graph signature matches known ring pattern #MR-2026-09.',
      ] : (isMedium ? [
        'Fan-in structuring: micro-transfers consolidated into single intermediate entity.',
        'Medium confidence tier: manual verification recommended before account freeze.',
      ] : [
        'Normal transaction pattern: no multi-hop structuring detected.',
        'Low risk probability (0.0820): cleared for standard processing.',
      ]),
      action: isHighRisk 
        ? 'ESCALATE // REQUEST IMMEDIATE FREEZE' 
        : (isMedium ? 'FLAG FOR TRIAGE // ENHANCED MONITORING' : 'DISMISS ALERT // VALIDATED NORMAL'),
      briefing: isHighRisk
        ? `Coordinated cash-out syndicate identified for complaint ${entityId}. ₹${(params.amount).toLocaleString('en-IN')} routed through ${params.muleCount} intermediate mule accounts within 72 hours, targeting cash-out at ${terminalCity}.`
        : (isMedium ? 'Unusual consolidation pattern detected. Intermediate account activity requires human AML investigator review.' : 'Standard commercial funds flow. No laundering topology identified.'),
    };
  };

  // Run the 8-stage pipeline simulation
  useEffect(() => {
    if (simulationState === 'running') {
      const stageInterval = Math.max(70, Math.floor(650 / speed));

      timerRef.current = setInterval(() => {
        setCurrentStage((prev) => {
          if (prev < 8) {
            const next = prev + 1;
            if (next === 4) {
              setIsAlerting(true);
            }
            return next;
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
      setIsAlerting(false);
    }
    setResults(generateResults(selectedScenario, seedEntityId));
    setSimulationState('running');
  };

  const handlePause = () => {
    setSimulationState('paused');
  };

  const handleReset = () => {
    setSimulationState('idle');
    setCurrentStage(0);
    setIsAlerting(false);
    setResults(null);
  };

  const handleInject = () => {
    handleReset();
    setSelectedScenario('atm-blitz');
    setParams({ ...params, amount: 820000, hopCount: 4, muleCount: 6, anomalyIntensity: 'High' });
    setTimeout(() => {
      setResults(generateResults('atm-blitz', seedEntityId));
      setSimulationState('running');
    }, 150);
  };

  return (
    <div className="h-full flex flex-col gap-2.5 overflow-hidden">
      {/* ── TOP: HORIZONTAL 8-STAGE PIPELINE RAIL ── */}
      <PipelineStageRail
        currentStage={currentStage}
        stageTimings={stageTimings}
        state={simulationState}
        onSelectStage={setCurrentStage}
      />

      {/* ── SPACIOUS 3-ZONE MAIN WORKSPACE ── */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-2.5 min-h-0 overflow-hidden">
        {/* LEFT COLUMN: Controls Panel with Entity Selector (3 cols / ~290px) */}
        <div className="lg:col-span-3 h-full overflow-hidden flex flex-col">
          <SimulationControls
            state={simulationState}
            speed={speed}
            scenario={selectedScenario}
            seedEntityId={seedEntityId}
            params={params}
            onPlay={handlePlay}
            onPause={handlePause}
            onReset={handleReset}
            onSpeedChange={setSpeed}
            onScenarioChange={(scen) => {
              setSelectedScenario(scen);
              handleReset();
            }}
            onSeedEntityChange={(id) => {
              setSeedEntityId(id);
              handleReset();
            }}
            onParamsChange={setParams}
            onInject={handleInject}
          />
        </div>

        {/* CENTER COLUMN: EXPANSIVE 3D THREE.JS CANVAS (6 cols / spacious centerpiece) */}
        <div className="lg:col-span-6 h-full flex flex-col min-h-[420px]">
          <ThreeNetworkCanvas
            currentStage={currentStage}
            scenario={selectedScenario}
            seedEntityId={seedEntityId}
            isAlerting={isAlerting}
            speed={speed}
          />
        </div>

        {/* RIGHT COLUMN: Intelligence Telemetry Outputs (3 cols / ~300px) */}
        <div className="lg:col-span-3 h-full overflow-hidden flex flex-col">
          <SimulationOutputs
            currentStage={currentStage}
            results={results}
            state={simulationState}
          />
        </div>
      </div>
    </div>
  );
};
