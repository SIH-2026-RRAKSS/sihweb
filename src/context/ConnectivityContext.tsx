import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { ApiService } from '../services/api';
import { HealthResponse } from '../types';

interface ConnectivityContextType {
  isOnline: boolean;
  lastChecked: Date | null;
  health: HealthResponse | null;
  fastApiStatus: string;
  restStatus: string;
  refetchHealth: () => Promise<void>;
}

const ConnectivityContext = createContext<ConnectivityContextType | undefined>(undefined);

export const ConnectivityProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isOnline, setIsOnline] = useState<boolean>(true);
  const [lastChecked, setLastChecked] = useState<Date | null>(null);
  const [health, setHealth] = useState<HealthResponse | null>(null);
  const [fastApiStatus, setFastApiStatus] = useState<string>('PINGING...');
  const [restStatus, setRestStatus] = useState<string>('PINGING...');

  const pollHealth = useCallback(async () => {
    try {
      const h = await ApiService.checkHealth();
      setHealth(h);
      const online = Boolean(h.status && h.status.toUpperCase() !== 'OFFLINE');
      setIsOnline(online);
      setFastApiStatus(online ? '200 OK' : 'OFFLINE');
      setRestStatus(h.spring_db_connected ? '200 OK' : 'OFFLINE');
    } catch {
      setIsOnline(false);
      setFastApiStatus('OFFLINE');
      setRestStatus('OFFLINE');
    } finally {
      setLastChecked(new Date());
    }
  }, []);

  useEffect(() => {
    pollHealth();
    const interval = setInterval(pollHealth, 15000);
    return () => clearInterval(interval);
  }, [pollHealth]);

  return (
    <ConnectivityContext.Provider
      value={{
        isOnline,
        lastChecked,
        health,
        fastApiStatus,
        restStatus,
        refetchHealth: pollHealth,
      }}
    >
      {children}
    </ConnectivityContext.Provider>
  );
};

export const useConnectivity = (): ConnectivityContextType => {
  const context = useContext(ConnectivityContext);
  if (!context) {
    throw new Error('useConnectivity must be used within a ConnectivityProvider');
  }
  return context;
};
