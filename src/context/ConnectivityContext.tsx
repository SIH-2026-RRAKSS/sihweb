import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { ApiService } from '../services/api';

interface ConnectivityContextType {
  isOnline: boolean;
  lastChecked: Date | null;
}

const ConnectivityContext = createContext<ConnectivityContextType | undefined>(undefined);

export const ConnectivityProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isOnline, setIsOnline] = useState<boolean>(true);
  const [lastChecked, setLastChecked] = useState<Date | null>(null);

  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout>;

    const pollHealth = async () => {
      try {
        await ApiService.checkHealth();
        setIsOnline(true);
      } catch (err) {
        setIsOnline(false);
      } finally {
        setLastChecked(new Date());
        timeoutId = setTimeout(pollHealth, 15000);
      }
    };

    pollHealth();

    return () => {
      clearTimeout(timeoutId);
    };
  }, []);

  return (
    <ConnectivityContext.Provider value={{ isOnline, lastChecked }}>
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
