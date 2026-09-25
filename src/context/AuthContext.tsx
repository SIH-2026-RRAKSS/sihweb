import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserProfile, UserRole } from '../types';
import { ApiService } from '../services/api';

interface AuthContextType {
  user: UserProfile | null;
  role: UserRole | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  loginStaff: (employeeId: string, password?: string) => Promise<void>;
  loginCitizen: (provider: string, credentialToken: string) => Promise<void>;
  switchPersona: (role: UserRole) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const PERSONA_PRESETS: Record<UserRole, UserProfile> = {
  CYBER_OFFICER: {
    id: 'usr_cyber_001',
    email: 'cyber.officer@trinetra.gov.in',
    name: 'Inspector Sanjay Rao',
    role: 'CYBER_OFFICER',
    jurisdictionId: 'JUR_STATION_CYBER',
    jurisdictionName: 'Cyber Crime Police Station, Cyberabad',
    employeeId: 'POL-CYBER-8841'
  },
  POLICE: {
    id: 'usr_police_002',
    email: 'sho.gachibowli@police.gov.in',
    name: 'SHO Vikramaditya V.',
    role: 'POLICE',
    jurisdictionId: 'JUR_CYBERABAD',
    jurisdictionName: 'Gachibowli PS, Cyberabad',
    employeeId: 'POL-TEL-1049'
  },
  BANK_MANAGER: {
    id: 'usr_bank_003',
    email: 'compliance.mgr@hdfc.bank',
    name: 'Pooja Nair',
    role: 'BANK_MANAGER',
    bankId: 'BNK_HDFC',
    bankName: 'HDFC Bank Ltd. (Nodal Hub)',
    employeeId: 'HDFC-AML-4491'
  },
  BANK_EMPLOYEE: {
    id: 'usr_bank_004',
    email: 'triage.exec@hdfc.bank',
    name: 'Rohit Kulkarni',
    role: 'BANK_EMPLOYEE',
    bankId: 'BNK_HDFC',
    bankName: 'HDFC Bank Ltd.',
    employeeId: 'HDFC-OPS-7712'
  },
  COMPLAINANT: {
    id: 'usr_cit_005',
    email: 'aaditya.roy@gmail.com',
    name: 'Aaditya Roy',
    role: 'COMPLAINANT',
    phone: '+91 98765 43210'
  },
  ADMIN: {
    id: 'usr_admin_006',
    email: 'admin.director@trinetra.gov.in',
    name: 'Dr. Anand Verma (System Admin)',
    role: 'ADMIN',
    employeeId: 'ADM-TRINETRA-001'
  }
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(() => {
    const saved = localStorage.getItem('sih_user_profile');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {}
    }
    return null;
  });

  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem('sih_auth_token') || null;
  });

  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    if (user) {
      localStorage.setItem('sih_user_profile', JSON.stringify(user));
    } else {
      localStorage.removeItem('sih_user_profile');
    }
  }, [user]);

  useEffect(() => {
    if (token) {
      localStorage.setItem('sih_auth_token', token);
      ApiService.setAuthToken(token);
    } else {
      localStorage.removeItem('sih_auth_token');
      ApiService.setAuthToken(null);
    }
  }, [token]);

  const loginStaff = async (employeeId: string, password: string = 'password123') => {
    setIsLoading(true);
    try {
      const auth = await ApiService.loginStaff(employeeId, password);
      setUser(auth.user);
      setToken(auth.accessToken);
    } catch (err) {
      console.error("Staff login error:", err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const loginCitizen = async (provider: string, credentialToken: string) => {
    setIsLoading(true);
    try {
      const auth = await ApiService.loginCitizen(provider, credentialToken);
      setUser(auth.user);
      setToken(auth.accessToken);
    } catch (err) {
      console.error("Citizen login error:", err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const switchPersona = (role: UserRole) => {
    const preset = PERSONA_PRESETS[role];
    if (preset) {
      setUser(preset);
      const mockTok = `mock_token_${role.toLowerCase()}`;
      setToken(mockTok);
      ApiService.setAuthToken(mockTok);
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    ApiService.logout();
    localStorage.removeItem('sih_user_profile');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role: user?.role || null,
        token,
        isAuthenticated: !!user,
        isLoading,
        loginStaff,
        loginCitizen,
        switchPersona,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
