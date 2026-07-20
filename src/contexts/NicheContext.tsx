'use client';

import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';

// ═══════════════════════════════════════════════════════════════
// FONTE DA VERDADE — NICHE TYPES
// Apenas 2 valores: POUSADA e AIRBNB
// Espelhado em: middleware.ts, auth.ts, prisma/schema.prisma
// ═══════════════════════════════════════════════════════════════

export type NicheType = 'pousada' | 'airbnb';

/** Display labels para cada nicho — usado em UI */
export const NICHE_LABELS: Record<NicheType, string> = {
  pousada: 'Pousadas',
  airbnb: 'Anfitriões Airbnb',
};

/** Rota DDC correspondente a cada nicho */
export const NICHE_DDC_ROUTE: Record<NicheType, string> = {
  pousada: '/ddc/pousada',
  airbnb: '/ddc/airbnb',
};

interface NicheContextValue {
  niche: NicheType;
  setNiche: (n: NicheType) => void;
  toggleNiche: () => void;
  isPousada: boolean;
  isAirbnb: boolean;
  label: string;
  ddcRoute: string;
}

const NicheContext = createContext<NicheContextValue | null>(null);

const STORAGE_KEY = 'zella-niche';

function getInitialNiche(): NicheType {
  if (typeof window === 'undefined') return 'pousada';
  try {
    // Check URL params first (campaign links)
    const params = new URLSearchParams(window.location.search);
    const urlNiche = params.get('niche');
    if (urlNiche === 'pousada' || urlNiche === 'airbnb') {
      localStorage.setItem(STORAGE_KEY, urlNiche);
      return urlNiche;
    }
    // Legacy: migrar valores antigos do localStorage
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === 'pousada' || stored === 'airbnb') return stored;
    // Migrar valores legados (pousadas → pousada, anfitrioes → airbnb)
    if (stored === 'pousadas') {
      localStorage.setItem(STORAGE_KEY, 'pousada');
      return 'pousada';
    }
    if (stored === 'anfitrioes') {
      localStorage.setItem(STORAGE_KEY, 'airbnb');
      return 'airbnb';
    }
  } catch {
    // Ignore SSR or storage errors
  }
  return 'pousada';
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
    setNiche(niche === 'pousada' ? 'airbnb' : 'pousada');
  }, [niche, setNiche]);

  const isPousada = niche === 'pousada';
  const isAirbnb = niche === 'airbnb';
  const label = NICHE_LABELS[niche];
  const ddcRoute = NICHE_DDC_ROUTE[niche];

  return (
    <NicheContext.Provider value={{ niche, setNiche, toggleNiche, isPousada, isAirbnb, label, ddcRoute }}>
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
