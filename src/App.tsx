import React, { useState, useEffect, useCallback } from 'react';
import { AppShell, NavPage } from './components/layout/AppShell';
import { LandingSplash } from './components/splash/LandingSplash';
import { CommandCenter } from './components/command/CommandCenter';
import { SimulationLab } from './components/simulation/SimulationLab';
import { IncidentQueue } from './components/incidents/IncidentQueue';
import { NetworkExplorer } from './components/network/NetworkExplorer';
import { CashOutMap } from './components/geo/CashOutMap';
import { PolicyBenchmark } from './components/policy/PolicyBenchmark';
import { CaseDossier } from './components/dossier/CaseDossier';
import { SystemHealth } from './components/health/SystemHealth';
import { ApiService } from './services/api';

const App: React.FC = () => {
  const [activePage, setActivePage] = useState<NavPage | 'splash'>('splash');
  const [backendOnline, setBackendOnline] = useState(false);
  const [selectedCaseId, setSelectedCaseId] = useState<string | null>(null);
  const [selectedMapTarget, setSelectedMapTarget] = useState<string | null>(null);
  const [activeDataset, setActiveDataset] = useState<'SYNTHETIC_A' | 'IBM_B' | 'ELLIPTIC_C'>('SYNTHETIC_A');

  // Health check polling
  useEffect(() => {
    const check = async () => {
      await ApiService.checkHealth();
      setBackendOnline(ApiService.getBackendStatus());
    };
    check();
    const interval = setInterval(check, 10000);
    return () => clearInterval(interval);
  }, []);

  // Navigate to case dossier when a case is selected
  const handleSelectCase = useCallback((id: string) => {
    setSelectedCaseId(id);
    setActivePage('dossier');
  }, []);

  // Navigate to cash-out map with a target entity/ATM
  const handleNavigateToMap = useCallback((entityOrAtmId: string) => {
    setSelectedMapTarget(entityOrAtmId);
    setActivePage('cashout-map');
  }, []);

  // Handle navigation
  const handleNavigate = useCallback((page: NavPage) => {
    setActivePage(page);
  }, []);

  // Handle back from dossier
  const handleBackFromDossier = useCallback(() => {
    setActivePage('incidents');
  }, []);

  if (activePage === 'splash') {
    return <LandingSplash onEnterApp={(page) => setActivePage(page || 'command')} />;
  }

  const renderPage = () => {
    switch (activePage) {
      case 'command':
        return <CommandCenter onSelectCase={handleSelectCase} onNavigate={handleNavigate} />;
      case 'simulation':
        return <SimulationLab />;
      case 'incidents':
        return <IncidentQueue onSelectCase={handleSelectCase} />;
      case 'network':
        return <NetworkExplorer />;
      case 'cashout-map':
        return <CashOutMap targetEntityId={selectedMapTarget} onNavigateToCase={handleSelectCase} />;
      case 'policy':
        return <PolicyBenchmark />;
      case 'dossier':
        return <CaseDossier caseId={selectedCaseId} onBack={handleBackFromDossier} />;
      case 'health':
        return <SystemHealth />;
      default:
        return <CommandCenter onSelectCase={handleSelectCase} onNavigate={handleNavigate} />;
    }
  };

  return (
    <AppShell
      activePage={activePage}
      onNavigate={handleNavigate}
      backendOnline={backendOnline}
      activeDataset={activeDataset}
      onToggleDataset={setActiveDataset}
    >
      {renderPage()}
    </AppShell>
  );
};

export default App;
