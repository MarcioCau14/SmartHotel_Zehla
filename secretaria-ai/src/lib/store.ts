'use client';

import { create } from 'zustand';
import type { Lead } from './leads-types';

/* ============================================
   ZUSTAND STORE — SEM PERSIST
   Zero dependência de localStorage. Elimina o bug
   de serialização Date→string que crashava a app.
   ============================================ */

export interface ConsoleLog {
  id: string;
  message: string;
  type: 'info' | 'success' | 'error' | 'loading';
  timestamp: number; // epoch ms — nunca Date
}

interface AppState {
  /* Hunter */
  hunterInput: string;
  setHunterInput: (v: string) => void;
  hunterLoop: boolean;
  toggleHunterLoop: () => void;
  isHunting: boolean;
  setIsHunting: (v: boolean) => void;

  /* Console logs */
  consoleLogs: ConsoleLog[];
  addConsoleLog: (message: string, type: ConsoleLog['type']) => void;
  clearConsoleLogs: () => void;

  /* Seleção de leads */
  selectedLeads: string[];
  toggleLeadSelection: (email: string) => void;
  selectAllLeads: (emails: string[]) => void;
  clearSelectedLeads: () => void;
}

export const useAppStore = create<AppState>()((set) => ({
  /* ── Hunter ── */
  hunterInput: '',
  setHunterInput: (v) => set({ hunterInput: v }),
  hunterLoop: false,
  toggleHunterLoop: () => set((s) => ({ hunterLoop: !s.hunterLoop })),
  isHunting: false,
  setIsHunting: (v) => set({ isHunting: v }),

  /* ── Console logs ── */
  consoleLogs: [],
  addConsoleLog: (message, type) =>
    set((s) => ({
      consoleLogs: [
        ...s.consoleLogs,
        {
          id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
          message,
          type,
          timestamp: Date.now(),
        },
      ],
    })),
  clearConsoleLogs: () => set({ consoleLogs: [] }),

  /* ── Seleção de leads ── */
  selectedLeads: [],
  toggleLeadSelection: (email) =>
    set((s) => ({
      selectedLeads: s.selectedLeads.includes(email)
        ? s.selectedLeads.filter((e) => e !== email)
        : [...s.selectedLeads, email],
    })),
  selectAllLeads: (emails) =>
    set((s) => {
      const all = emails.every((e) => s.selectedLeads.includes(e));
      return { selectedLeads: all ? [] : [...emails] };
    }),
  clearSelectedLeads: () => set({ selectedLeads: [] }),
}));

export interface AIAgent {
  id: string;
  icon: string;
  status: 'active' | 'sleeping' | 'error';
  name: string;
  role: string;
  tasksCompleted: number;
  tasksFailed: number;
  successRate: number;
  avgLatencyMs: number;
  modelUsed: string;
  uptimeHours: number;
}

export interface Property {
  id: string;
  name: string;
  city: string;
  state: string;
  rooms: number;
  status: string;
  trialDaysLeft: number;
  googleRating: number;
}

export { getBrainHealth, intentStats } from './brain-health';
