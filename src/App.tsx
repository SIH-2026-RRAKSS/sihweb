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
import { StreamingMonitorView } from './components/streaming/StreamingMonitorView';
import { FreezeRequestManager } from './components/freeze/FreezeRequestManager';
import { BankFreezeInbox } from './components/bank/BankFreezeInbox';
import { BankUploadPortal } from './components/bank/BankUploadPortal';
import { CitizenPortal } from './components/complaints/CitizenPortal';
import { AdminConsole } from './components/admin/AdminConsole';
import { MlOpsDashboard } from './components/mlops/MlOpsDashboard';
import { LoginPage } from './components/auth/LoginPage';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ApiService } from './services/api';

const AppContent: React.FC = () => {
  const { user, role, isAuthenticated } = useAuth();
  const [activePage, setActivePage] = useState<NavPage | 'splash' | 'login'>(() => {
    if (!isAuthenticated) return 'splash';
    if (role === 'COMPLAINANT') return 'citizen-portal';
    if (role === 'BANK_MANAGER' || role === 'BANK_EMPLOYEE') return 'bank-freeze';
    if (role === 'ADMIN') return 'admin-console';
    return 'command';
  });
  const [backendOnline, setBackendOnline] = useState(false);
  const [selectedCaseId, setSelectedCaseId] = useState<string | null>(null);
  const [selectedMapTarget, setSelectedMapTarget] = useState<string | null>(null);
  const [activeDataset, setActiveDataset] = useState<'SYNTHETIC_A' | 'IBM_B' | 'ELLIPTIC_C'>('SYNTHETIC_A');

  // Health check polling
  useEffect(() => {
    const check = async () => {
      try {
        await ApiService.checkHealth();
        setBackendOnline(ApiService.getBackendStatus());
      } catch {
        setBackendOnline(false);
      }
    };
    check();
    const interval = setInterval(check, 10000);
    return () => clearInterval(interval);
  }, []);

  // Set initial landing page based on role when user authenticates
  const handleLoginSuccess = useCallback(() => {
    if (role === 'COMPLAINANT') setActivePage('citizen-portal');
    else if (role === 'BANK_MANAGER' || role === 'BANK_EMPLOYEE') setActivePage('bank-freeze');
    else if (role === 'ADMIN') setActivePage('admin-console');
    else setActivePage('command');
  }, [role]);

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
    return (
      <LandingSplash
        onEnterApp={(targetPage) => {
          if (!isAuthenticated) {
            setActivePage('login');
          } else {
            setActivePage((targetPage as NavPage) || 'command');
          }
        }}
      />
    );
  }

  if (activePage === 'login') {
    return (
      <LoginPage
        onSuccess={handleLoginSuccess}
        onCancel={() => setActivePage('splash')}
      />
    );
  }

  const renderPage = () => {
    switch (activePage) {
      // ── LEO COMMAND VIEWS ──
      case 'command':
        return (
          <ProtectedRoute allowedRoles={['CYBER_OFFICER', 'ADMIN']}>
            <CommandCenter
              onSelectCase={handleSelectCase}
              onNavigate={handleNavigate}
              activeDataset={activeDataset}
            />
          </ProtectedRoute>
        );

      case 'incidents':
        return (
          <ProtectedRoute allowedRoles={['CYBER_OFFICER', 'POLICE', 'ADMIN']}>
            <IncidentQueue
              onSelectCase={handleSelectCase}
              activeDataset={activeDataset}
            />
          </ProtectedRoute>
        );

      case 'freeze-leo':
        return (
          <ProtectedRoute allowedRoles={['CYBER_OFFICER', 'POLICE', 'ADMIN']}>
            <FreezeRequestManager />
          </ProtectedRoute>
        );

      case 'network':
        return (
          <ProtectedRoute allowedRoles={['CYBER_OFFICER', 'POLICE', 'ADMIN']}>
            <NetworkExplorer />
          </ProtectedRoute>
        );

      case 'cashout-map':
        return (
          <ProtectedRoute allowedRoles={['CYBER_OFFICER', 'POLICE', 'ADMIN']}>
            <CashOutMap
              targetEntityId={selectedMapTarget}
              onNavigateToCase={handleSelectCase}
              activeDataset={activeDataset}
            />
          </ProtectedRoute>
        );

      case 'dossier':
        return (
          <ProtectedRoute allowedRoles={['CYBER_OFFICER', 'POLICE', 'ADMIN']}>
            <CaseDossier caseId={selectedCaseId} onBack={handleBackFromDossier} />
          </ProtectedRoute>
        );

      case 'simulation':
        return (
          <ProtectedRoute allowedRoles={['CYBER_OFFICER', 'ADMIN']}>
            <SimulationLab />
          </ProtectedRoute>
        );

      case 'policy':
        return (
          <ProtectedRoute allowedRoles={['CYBER_OFFICER', 'ADMIN']}>
            <PolicyBenchmark activeDataset={activeDataset} />
          </ProtectedRoute>
        );

      // ── BANK OPERATIONS ──
      case 'bank-freeze':
        return (
          <ProtectedRoute allowedRoles={['BANK_MANAGER', 'BANK_EMPLOYEE', 'ADMIN']}>
            <BankFreezeInbox />
          </ProtectedRoute>
        );

      case 'bank-uploads':
        return (
          <ProtectedRoute allowedRoles={['BANK_MANAGER', 'BANK_EMPLOYEE', 'ADMIN']}>
            <BankUploadPortal />
          </ProtectedRoute>
        );

      // ── CITIZEN COMPLAINT PORTAL ──
      case 'citizen-portal':
        return (
          <ProtectedRoute allowedRoles={['COMPLAINANT']}>
            <CitizenPortal initialView="home" />
          </ProtectedRoute>
        );

      case 'new-complaint':
        return (
          <ProtectedRoute allowedRoles={['COMPLAINANT']}>
            <CitizenPortal initialView="new-complaint" />
          </ProtectedRoute>
        );

      case 'my-complaints':
        return (
          <ProtectedRoute allowedRoles={['COMPLAINANT']}>
            <CitizenPortal initialView="my-complaints" />
          </ProtectedRoute>
        );

      // ── ADMIN & MLOPS ──
      case 'admin-console':
        return (
          <ProtectedRoute allowedRoles={['ADMIN']}>
            <AdminConsole />
          </ProtectedRoute>
        );

      case 'mlops-dashboard':
        return (
          <ProtectedRoute allowedRoles={['ADMIN', 'CYBER_OFFICER']}>
            <MlOpsDashboard />
          </ProtectedRoute>
        );

      // ── TELEMETRY & LIVE DEMO ──
      case 'health':
        return <SystemHealth />;

      case 'live-demo':
        return (
          <ProtectedRoute allowedRoles={['CYBER_OFFICER', 'ADMIN']}>
            <StreamingMonitorView />
          </ProtectedRoute>
        );

      default:
        return (
          <CommandCenter
            onSelectCase={handleSelectCase}
            onNavigate={handleNavigate}
            activeDataset={activeDataset}
          />
        );
    }
  };

  return (
    <AppShell
      activePage={activePage as NavPage}
      onNavigate={handleNavigate}
      backendOnline={backendOnline}
      activeDataset={activeDataset}
      onToggleDataset={setActiveDataset}
    >
      {renderPage()}
    </AppShell>
  );
};

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
};

export default App;
