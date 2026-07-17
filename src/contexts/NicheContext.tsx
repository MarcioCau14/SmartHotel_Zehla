'use client';

import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';

export type NicheType = 'pousadas' | 'anfitrioes';

interface NicheContextValue {
  niche: NicheType;
  setNiche: (n: NicheType) => void;
  toggleNiche: () => void;
  isPousadas: boolean;
  isAnfitrioes: boolean;
}

const NicheContext = createContext<NicheContextValue | null>(null);

const STORAGE_KEY = 'zella-niche';

function getInitialNiche(): NicheType {
  if (typeof window === 'undefined') return 'pousadas';
  try {
    // Check URL params first (campaign links)
    const params = new URLSearchParams(window.location.search);
    const urlNiche = params.get('niche');
    if (urlNiche === 'pousadas' || urlNiche === 'anfitrioes') {
      localStorage.setItem(STORAGE_KEY, urlNiche);
      return urlNiche;
    }
    // Then check localStorage
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === 'pousadas' || stored === 'anfitrioes') return stored;
  } catch {
    // Ignore SSR or storage errors
  }
  return 'pousadas';
}

export function NicheProvider({ children }: { children: ReactNode }) {
  const [niche, setNicheState] = useState<NicheType>(getInitialNiche);

  const setNiche = useCallback((n: NicheType) => {
    setNicheState(n);
    try {
      localStorage.setItem(STORAGE_KEY, n);
    } catch {
      // Ignore storage errors
    }
    // Dispatch custom event for analytics
    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('zella:niche-switched', {
          detail: { niche: n, timestamp: Date.now() },
        })
      );
    }
  }, []);

  const toggleNiche = useCallback(() => {
    setNiche(niche === 'pousadas' ? 'anfitrioes' : 'pousadas');
  }, [niche, setNiche]);

  const isPousadas = niche === 'pousadas';
  const isAnfitrioes = niche === 'anfitrioes';

  return (
    <NicheContext.Provider value={{ niche, setNiche, toggleNiche, isPousadas, isAnfitrioes }}>
      {children}
    </NicheContext.Provider>
  );
}

export function useNiche(): NicheContextValue {
  const ctx = useContext(NicheContext);
  if (!ctx) {
    throw new Error('useNiche must be used within a NicheProvider');
  }
  return ctx;
}
