import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate, Outlet } from 'react-router-dom';
import { AppShell } from './components/layout/AppShell';
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
import { SessionExpiredModal } from './components/auth/SessionExpiredModal';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ConnectivityProvider, useConnectivity } from './context/ConnectivityContext';
import { NotFound } from './components/layout/NotFound';

const SplashGate = () => {
  const navigate = useNavigate();
  const { isAuthenticated, role } = useAuth();
  
  useEffect(() => {
    const splashSeen = sessionStorage.getItem('splashSeen');
    if (splashSeen || isAuthenticated) {
      if (role === 'COMPLAINANT') navigate('/citizen-portal', { replace: true });
      else if (role === 'BANK_MANAGER' || role === 'BANK_EMPLOYEE') navigate('/bank-freeze', { replace: true });
      else if (role === 'ADMIN') navigate('/admin-console', { replace: true });
      else navigate('/command', { replace: true });
    }
  }, [navigate, isAuthenticated, role]);

  if (sessionStorage.getItem('splashSeen') || isAuthenticated) return null;

  return (
    <LandingSplash
      onEnterApp={(targetTab) => {
        sessionStorage.setItem('splashSeen', 'true');
        if (targetTab === 'simulation') navigate('/simulation');
        else if (targetTab === 'cashout-map') navigate('/cashout-map');
        else if (targetTab === 'incidents') navigate('/incidents');
        else if (targetTab === 'policy') navigate('/policy');
        else navigate('/command');
      }}
    />
  );
};

const SplashPage = () => {
  const navigate = useNavigate();
  return (
    <LandingSplash
      onEnterApp={(targetTab) => {
        sessionStorage.setItem('splashSeen', 'true');
        if (targetTab === 'simulation') navigate('/simulation');
        else if (targetTab === 'cashout-map') navigate('/cashout-map');
        else if (targetTab === 'incidents') navigate('/incidents');
        else if (targetTab === 'policy') navigate('/policy');
        else navigate('/command');
      }}
    />
  );
};

const LoginGate = () => {
  const { role, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated && role) {
      if (role === 'COMPLAINANT') navigate('/citizen-portal');
      else if (role === 'BANK_MANAGER' || role === 'BANK_EMPLOYEE') navigate('/bank-freeze');
      else if (role === 'ADMIN') navigate('/admin-console');
      else navigate('/command');
    }
  }, [isAuthenticated, role, navigate]);

  if (isAuthenticated) return null;

  return <LoginPage onCancel={() => navigate('/splash')} />;
};

const AppShellLayout = ({ activeDataset, setActiveDataset }: { activeDataset: 'SYNTHETIC_A' | 'IBM_B' | 'ELLIPTIC_C', setActiveDataset: (d: any) => void }) => {
  const { isOnline: backendOnline } = useConnectivity();
  return (
    <AppShell
      backendOnline={backendOnline}
      activeDataset={activeDataset}
      onToggleDataset={setActiveDataset}
    >
      <Outlet />
    </AppShell>
  );
};

const AppContent: React.FC = () => {
  const [activeDataset, setActiveDataset] = useState<'SYNTHETIC_A' | 'IBM_B' | 'ELLIPTIC_C'>('SYNTHETIC_A');

  return (
    <Routes>
      <Route path="/" element={<SplashGate />} />
      <Route path="/splash" element={<SplashPage />} />
      <Route path="/login" element={<LoginGate />} />

      <Route element={<AppShellLayout activeDataset={activeDataset} setActiveDataset={setActiveDataset} />}>
        <Route path="/command" element={<ProtectedRoute allowedRoles={['CYBER_OFFICER', 'ADMIN']}><CommandCenter activeDataset={activeDataset} /></ProtectedRoute>} />
        <Route path="/incidents" element={<ProtectedRoute allowedRoles={['CYBER_OFFICER', 'POLICE', 'ADMIN']}><IncidentQueue activeDataset={activeDataset} /></ProtectedRoute>} />
        <Route path="/freeze-leo" element={<ProtectedRoute allowedRoles={['CYBER_OFFICER', 'POLICE', 'ADMIN']}><FreezeRequestManager /></ProtectedRoute>} />
        <Route path="/network" element={<ProtectedRoute allowedRoles={['CYBER_OFFICER', 'POLICE', 'ADMIN']}><NetworkExplorer /></ProtectedRoute>} />
        <Route path="/cashout-map" element={<ProtectedRoute allowedRoles={['CYBER_OFFICER', 'POLICE', 'ADMIN']}><CashOutMap activeDataset={activeDataset} /></ProtectedRoute>} />
        <Route path="/dossier/:caseId" element={<ProtectedRoute allowedRoles={['CYBER_OFFICER', 'POLICE', 'ADMIN']}><CaseDossier /></ProtectedRoute>} />
        <Route path="/dossier" element={<Navigate to="/incidents" replace />} />
        <Route path="/simulation" element={<ProtectedRoute allowedRoles={['CYBER_OFFICER', 'ADMIN']}><SimulationLab /></ProtectedRoute>} />
        <Route path="/policy" element={<ProtectedRoute allowedRoles={['CYBER_OFFICER', 'ADMIN']}><PolicyBenchmark activeDataset={activeDataset} /></ProtectedRoute>} />
        <Route path="/bank-freeze" element={<ProtectedRoute allowedRoles={['BANK_MANAGER', 'BANK_EMPLOYEE', 'ADMIN']}><BankFreezeInbox /></ProtectedRoute>} />
        <Route path="/bank-uploads" element={<ProtectedRoute allowedRoles={['BANK_MANAGER', 'BANK_EMPLOYEE', 'ADMIN']}><BankUploadPortal /></ProtectedRoute>} />
        <Route path="/citizen-portal" element={<ProtectedRoute allowedRoles={['COMPLAINANT']}><CitizenPortal initialView="home" /></ProtectedRoute>} />
        <Route path="/new-complaint" element={<ProtectedRoute allowedRoles={['COMPLAINANT']}><CitizenPortal initialView="new-complaint" /></ProtectedRoute>} />
        <Route path="/my-complaints" element={<ProtectedRoute allowedRoles={['COMPLAINANT']}><CitizenPortal initialView="my-complaints" /></ProtectedRoute>} />
        <Route path="/admin-console" element={<ProtectedRoute allowedRoles={['ADMIN']}><AdminConsole /></ProtectedRoute>} />
        <Route path="/mlops-dashboard" element={<ProtectedRoute allowedRoles={['ADMIN', 'CYBER_OFFICER']}><MlOpsDashboard /></ProtectedRoute>} />
        <Route path="/health" element={<ProtectedRoute allowedRoles={['CYBER_OFFICER', 'POLICE', 'BANK_MANAGER', 'BANK_EMPLOYEE', 'ADMIN']}><SystemHealth /></ProtectedRoute>} />
        <Route path="/live-demo" element={<ProtectedRoute allowedRoles={['CYBER_OFFICER', 'ADMIN']}><StreamingMonitorView /></ProtectedRoute>} />
      </Route>

      <Route element={<AppShellLayout activeDataset={activeDataset} setActiveDataset={setActiveDataset} />}>
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
};

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <ConnectivityProvider>
        <SessionExpiredModal />
        <AppContent />
      </ConnectivityProvider>
    </AuthProvider>
  );
};

export default App;
