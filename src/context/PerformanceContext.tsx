import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  PerformanceTier,
  PerformanceSettings,
  getCurrentTier,
  getCurrentSettings,
  setPerformanceTier as updateTier,
  subscribePerformance,
} from '../lib/performanceManager';

interface PerformanceContextType {
  tier: PerformanceTier;
  settings: PerformanceSettings;
  setTier: (tier: PerformanceTier) => void;
}

const PerformanceContext = createContext<PerformanceContextType | undefined>(undefined);

export const PerformanceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [tier, setTierState] = useState<PerformanceTier>(getCurrentTier());
  const [settings, setSettingsState] = useState<PerformanceSettings>(getCurrentSettings());

  useEffect(() => {
    const unsub = subscribePerformance((newTier, newSettings) => {
      setTierState(newTier);
      setSettingsState(newSettings);
    });
    return unsub;
  }, []);

  const setTier = (newTier: PerformanceTier) => {
    updateTier(newTier);
  };

  return (
    <PerformanceContext.Provider value={{ tier, settings, setTier }}>
      {children}
    </PerformanceContext.Provider>
  );
};

export const usePerformance = (): PerformanceContextType => {
  const context = useContext(PerformanceContext);
  if (!context) {
    throw new Error('usePerformance must be used within a PerformanceProvider');
  }
  return context;
};
