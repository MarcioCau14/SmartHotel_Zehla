'use client';

import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { QueryProvider } from '@/components/providers/query-provider';
import { DashboardCards } from '@/components/secretaria/dashboard-cards';
import { HunterConsole } from '@/components/secretaria/hunter-console';
import { TargetsPanel } from '@/components/secretaria/targets-panel';
import { LeadsTable } from '@/components/secretaria/leads-table';
import { CampaignSettings } from '@/components/secretaria/campaign-settings';
import { DispararEliteButton } from '@/components/secretaria/disparar-elite-button';
import { ErrorBoundary } from '@/components/secretaria/error-boundary';
import { DashboardCardsSkeleton, LeadsTableSkeleton, TargetsPanelSkeleton } from '@/components/secretaria/skeleton-cards';
import { useLeads, useTargets } from '@/lib/api';
import type { Lead } from '@/lib/leads-types';

/* ── Animation variants ── */
const sectionV = {
  hidden: { opacity: 0, y: 16 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.15, duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] as const },
  }),
};

/* ── Connected: Targets ── */
function ConnectedTargets({ onSelect, selectedName }: { onSelect: (n: string | null) => void, selectedName: string | null }) {
  const { data: leads, isLoading: leadsLoading } = useLeads();
  const { data: targetsApi, isLoading: targetsLoading } = useTargets();

  if (leadsLoading || targetsLoading) return <TargetsPanelSkeleton />;

  // Combine unique companies from leads and explicit targets
  const uniqueFromLeads = Array.from(new Set(leads?.map(l => l.empresa) || []));
  
  const finalTargets: any[] = uniqueFromLeads.map(name => {
    const existing = targetsApi?.find(t => t.name.toLowerCase() === name.toLowerCase());
    return {
      name,
      domain: existing?.domain || `${name.toLowerCase().replace(/\s+/g, '')}.com.br`,
      status: (existing?.status as 'active' | 'pending' | 'inactive') || 'active'
    };
  });

  // Also include targets from API that don't have leads yet
  targetsApi?.forEach(t => {
    if (!finalTargets.find(ft => ft.name.toLowerCase() === t.name.toLowerCase())) {
      finalTargets.push(t);
    }
  });

  return <TargetsPanel targets={finalTargets} onSelect={onSelect} selectedName={selectedName} />;
}

/* ── Connected: Dashboard Cards ── */
function ConnectedDashboard() {
  const { data, isLoading, isError } = useLeads();
  if (isLoading || isError || !data) return <DashboardCardsSkeleton />;
  return (
    <DashboardCards
      totalLeads={data.length}
      verifiedLeads={data.filter((l: Lead) => l.status === 'verified').length}
      messagesSent={Math.floor(data.filter((l: Lead) => l.status === 'verified').length * 3.87)}
    />
  );
}

/* ── Connected: Leads Table ── */
function ConnectedLeads({
  selectedLeads,
  onToggle,
  onSelectAll,
  filterCompany,
  filterStatus,
  minScore,
}: {
  selectedLeads: string[];
  onToggle: (email: string) => void;
  onSelectAll: (emails: string[]) => void;
  filterCompany: string | null;
  filterStatus: string | null;
  minScore: number;
}) {
  const { data, isLoading, isError } = useLeads();
  if (isLoading) return <LeadsTableSkeleton />;
  if (isError || !data) return <LeadsTableSkeleton />;
  return <LeadsTable 
    leads={data} 
    selectedLeads={selectedLeads} 
    onToggle={onToggle} 
    onSelectAll={onSelectAll} 
    filterCompany={filterCompany}
    filterStatus={filterStatus}
    minScore={minScore}
  />;
}

/* ═══════════════════════════════════════════════
   MAIN PAGE
   ═══════════════════════════════════════════════ */
export default function Home() {
  /* ── Selection state (local, sem persist) ── */
  const [selectedLeads, setSelectedLeads] = useState<string[]>([]);
  const [filterCompany, setFilterCompany] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<string | null>(null);
  const [minScore, setMinScore] = useState<number>(0);

  const toggleLead = useCallback((email: string) => {
    setSelectedLeads((prev) =>
      prev.includes(email) ? prev.filter((e) => e !== email) : [...prev, email]
    );
  }, []);

  const selectAllLeads = useCallback((emails: string[]) => {
    setSelectedLeads((prev) => {
      const all = emails.length > 0 && emails.every((e) => prev.includes(e));
      return all ? [] : [...emails];
    });
  }, []);

  const clearSelection = useCallback(() => setSelectedLeads([]), []);

  return (
    <QueryProvider>
      <div className="min-h-screen bg-[#0a0e1a] noise-overlay bg-grid-pattern">
        {/* Ambient glow */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
          <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] rounded-full blur-[120px] opacity-[0.07]"
            style={{ background: 'radial-gradient(circle, #4169E1, transparent)' }} />
          <div className="absolute -bottom-[20%] -right-[10%] w-[40%] h-[40%] rounded-full blur-[120px] opacity-[0.05]"
            style={{ background: 'radial-gradient(circle, #14b8a6, transparent)' }} />
        </div>

        <div className="relative z-10">
          {/* ── HEADER ── */}
          <motion.header initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
            className="sticky top-0 z-40 border-b border-[rgba(255,255,255,0.06)] bg-[#0a0e1a]/80 backdrop-blur-xl"
          >
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="flex items-center justify-between h-16">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#4169E1] to-[#14b8a6] flex items-center justify-center">
                      <span className="text-white font-bold text-sm">S</span>
                    </div>
                    <h1 className="text-lg font-bold tracking-tight gradient-text-royal">Secretaria.ai</h1>
                  </div>
                  <div className="hidden sm:block h-5 w-px bg-[rgba(255,255,255,0.08)] mx-1" />
                  <span className="hidden sm:inline text-xs font-medium text-[#64748b] tracking-wide uppercase">Relationship OS</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.06)]">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#10b981]" />
                    <span className="text-xs text-[#94a3b8]">Sistema Online</span>
                  </div>
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#4169E1] to-[#14b8a6] flex items-center justify-center cursor-pointer hover:opacity-90 transition-opacity">
                    <span className="text-white text-xs font-bold">AR</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.header>

          {/* ── MAIN CONTENT ── */}
          <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6 lg:py-8 space-y-6">

            {/* 1. Dashboard Cards */}
            <motion.section custom={0} initial="hidden" animate="visible" variants={sectionV}>
              <ErrorBoundary name="Dashboard">
                <ConnectedDashboard />
              </ErrorBoundary>
            </motion.section>

            {/* 2. Hunter Console */}
            <motion.section custom={1} initial="hidden" animate="visible" variants={sectionV}>
              <ErrorBoundary name="HunterConsole">
                <HunterConsole 
                  onFilterStatus={setFilterStatus} 
                  onFilterScore={setMinScore} 
                  currentStatus={filterStatus}
                  currentScore={minScore}
                />
              </ErrorBoundary>
            </motion.section>

            {/* 3. Grid: Targets + Settings */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6">
              <motion.section custom={2} initial="hidden" animate="visible" variants={sectionV}>
                <ErrorBoundary name="Targets">
                  <ConnectedTargets onSelect={setFilterCompany} selectedName={filterCompany} />
                </ErrorBoundary>
              </motion.section>
              <motion.section custom={3} initial="hidden" animate="visible" variants={sectionV}>
                <ErrorBoundary name="CampaignSettings">
                  <CampaignSettings />
                </ErrorBoundary>
              </motion.section>
            </div>

            {/* 4. Leads Table (Full Width) */}
            <motion.section custom={4} initial="hidden" animate="visible" variants={sectionV}>
              <ErrorBoundary name="LeadsTable">
                <ConnectedLeads
                  selectedLeads={selectedLeads}
                  onToggle={toggleLead}
                  onSelectAll={selectAllLeads}
                  filterCompany={filterCompany}
                  filterStatus={filterStatus}
                  minScore={minScore}
                />
              </ErrorBoundary>
            </motion.section>

            <div className="h-20" />
          </main>
        </div>

        {/* ── FLOATING BUTTON ── */}
        <ErrorBoundary name="DispararElite">
          <DispararEliteButton 
            selectedCount={selectedLeads.length} 
            selectedEmails={selectedLeads}
            onClear={clearSelection} 
          />
        </ErrorBoundary>
      </div>
    </QueryProvider>
  );
}
