'use client';

import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  Brain,
  ArrowLeft,
  Bell,
  Building2,
  Activity,
  Settings,
  BarChart3,
  Search,
  Users,
  Zap,
  Shield,
  Command,
} from 'lucide-react';
import Link from 'next/link';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

import { DashboardCards } from '@/components/zcc/DashboardCards';
import { TargetsPanel } from '@/components/zcc/TargetsPanel';
import { HunterConsole } from '@/components/zcc/HunterConsole';
import { LeadsTable } from '@/components/zcc/LeadsTable';
import { CampaignPanel } from '@/components/zcc/CampaignPanel';
import { DispararEliteButton } from '@/components/zcc/DispararEliteButton';
import { RevenueReportElite } from '@/components/zcc/RevenueReportElite';
import { CerebroZella } from '@/components/zcc/CerebroZella';
import { ClientOverview } from '@/components/zcc/ClientOverview';
import type { Lead } from '@/lib/types';

type ZCCTab = 'overview' | 'cerebro' | 'prospection' | 'settings';

const tabs: { id: ZCCTab; label: string; icon: React.ElementType; desc: string }[] = [
  { id: 'overview', label: 'Visão Geral', icon: Building2, desc: 'Todos os clientes' },
  { id: 'cerebro', label: 'Cérebro ZÉLLA', icon: Brain, desc: 'IA em tempo real' },
  { id: 'prospection', label: 'Prospecção', icon: Search, desc: 'Hunter de Leads' },
  { id: 'settings', label: 'Configurações', icon: Settings, desc: 'Sistema' },
];

const fadeIn = {
  hidden: { opacity: 0, y: 12 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.06, duration: 0.4, ease: 'easeOut' as const },
  }),
};

export default function ZCCPage() {
  const [activeTab, setActiveTab] = useState<ZCCTab>('overview');
  const [selectedTargetId, setSelectedTargetId] = useState<string | null>(null);
  const [selectedLeadIds, setSelectedLeadIds] = useState<Set<string>>(new Set());
  const [diagnosisLead, setDiagnosisLead] = useState<Lead | null>(null);
  const [diagnosisOpen, setDiagnosisOpen] = useState(false);

  const handleSelectionChange = useCallback((ids: Set<string>) => {
    setSelectedLeadIds(ids);
  }, []);

  const handleDiagnoseLead = useCallback((lead: Lead) => {
    setDiagnosisLead(lead);
    setDiagnosisOpen(true);
  }, []);

  const handleCloseDiagnosis = useCallback(() => {
    setDiagnosisOpen(false);
    setTimeout(() => setDiagnosisLead(null), 200);
  }, []);

  const handleClearSelection = useCallback(() => {
    setSelectedLeadIds(new Set());
  }, []);

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      {/* ===== TOP HEADER BAR ===== */}
      <header className="sticky top-0 z-50 bg-[#0a0a0a]/95 backdrop-blur-xl border-b border-white/[0.05]">
        <div className="flex items-center justify-between px-4 py-3 max-w-[1920px] mx-auto">
          {/* Left: Back + Logo */}
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="text-white/30 hover:text-white/60 transition-colors p-1.5 rounded-lg hover:bg-white/[0.04]"
              aria-label="Voltar ao início"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-500/20">
                <Command className="w-4 h-4 text-white" />
              </div>
              <div>
                <h1 className="text-sm font-bold text-white tracking-tight leading-none">ZCC Console</h1>
                <p className="text-[9px] text-white/30 font-mono mt-0.5">ZEHLA Central Control · v2.0</p>
              </div>
            </div>
          </div>

          {/* Center: Tabs */}
          <div className="hidden md:flex items-center gap-1 bg-white/[0.03] rounded-xl p-1 border border-white/[0.04]">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 cursor-pointer ${
                    activeTab === tab.id
                      ? 'bg-emerald-500/15 text-emerald-400 shadow-sm shadow-emerald-500/10'
                      : 'text-neutral-500 hover:text-neutral-300 hover:bg-white/[0.04]'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Right: Status + User */}
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/[0.03] border border-white/[0.04]">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[11px] text-neutral-400">10 clientes ativos</span>
            </div>
            <button className="relative p-1.5 rounded-lg text-white/40 hover:text-white/70 hover:bg-white/[0.04] transition-all">
              <Bell className="w-4 h-4" />
              <span className="absolute top-0.5 right-0.5 w-2 h-2 bg-emerald-500 rounded-full" />
            </button>
            <Avatar className="w-8 h-8">
              <AvatarFallback className="bg-emerald-500/15 text-emerald-400 text-xs font-bold">
                ZE
              </AvatarFallback>
            </Avatar>
          </div>
        </div>
      </header>

      {/* ===== MAIN CONTENT ===== */}
      <main className="max-w-[1920px] mx-auto p-4 md:p-6">
        {/* Mobile Tab Selector */}
        <div className="md:hidden flex items-center gap-1 bg-white/[0.03] rounded-xl p-1 border border-white/[0.04] mb-6 overflow-x-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-all duration-200 cursor-pointer whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'bg-emerald-500/15 text-emerald-400'
                    : 'text-neutral-500 hover:text-neutral-300'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {activeTab === 'overview' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
            {/* KPI Cards Row */}
            <motion.section custom={0} variants={fadeIn} initial="hidden" animate="visible" className="mb-6">
              <DashboardCards />
            </motion.section>

            {/* Client Overview — All Beta Testers */}
            <motion.section custom={1} variants={fadeIn} initial="hidden" animate="visible" className="mb-6">
              <ClientOverview />
            </motion.section>
          </motion.div>
        )}

        {activeTab === 'cerebro' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
            <CerebroZella />
          </motion.div>
        )}

        {activeTab === 'prospection' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }} className="space-y-6">
            {/* KPI Cards */}
            <motion.section custom={0} variants={fadeIn} initial="hidden" animate="visible">
              <DashboardCards />
            </motion.section>

            {/* Sidebar + Hunter + Campaigns */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <motion.section custom={1} variants={fadeIn} initial="hidden" animate="visible" className="lg:col-span-3">
                <TargetsPanel
                  selectedTargetId={selectedTargetId}
                  onSelectTarget={setSelectedTargetId}
                />
              </motion.section>
              <motion.section custom={2} variants={fadeIn} initial="hidden" animate="visible" className="lg:col-span-5">
                <HunterConsole />
              </motion.section>
              <motion.section custom={3} variants={fadeIn} initial="hidden" animate="visible" className="lg:col-span-4">
                <CampaignPanel />
              </motion.section>
            </div>

            {/* Leads Table */}
            <motion.section custom={4} variants={fadeIn} initial="hidden" animate="visible">
              <LeadsTable
                filterTargetId={selectedTargetId}
                selectedLeadIds={selectedLeadIds}
                onSelectionChange={handleSelectionChange}
                onDiagnoseLead={handleDiagnoseLead}
              />
            </motion.section>
          </motion.div>
        )}

        {activeTab === 'settings' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
            <SettingsPanel />
          </motion.div>
        )}
      </main>

      {/* Floating Disparar (only in prospection tab) */}
      {activeTab === 'prospection' && (
        <DispararEliteButton
          selectedCount={selectedLeadIds.size}
          selectedLeadIds={selectedLeadIds}
          onClearSelection={handleClearSelection}
        />
      )}

      {/* Revenue Diagnosis Modal */}
      <RevenueReportElite
        lead={diagnosisLead}
        open={diagnosisOpen}
        onClose={handleCloseDiagnosis}
      />
    </div>
  );
}

// ============================================================================
// Settings Panel — Configuration & System Info
// ============================================================================
function SettingsPanel() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-2">
        <Settings className="w-5 h-5 text-neutral-400" />
        <h2 className="text-lg font-bold text-white">Configurações do Sistema</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Gateway */}
        <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-5 space-y-4">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-emerald-400" />
            <h3 className="text-sm font-semibold text-white">Gateway de Pagamento</h3>
          </div>
          <div className="space-y-2 text-xs">
            <div className="flex justify-between"><span className="text-neutral-500">Primário</span><span className="text-emerald-400 font-medium">Mercado Pago</span></div>
            <div className="flex justify-between"><span className="text-neutral-500">Taxa PIX</span><span className="text-white">0,99%</span></div>
            <div className="flex justify-between"><span className="text-neutral-500">Taxa Cartão</span><span className="text-white">3,49%</span></div>
            <div className="flex justify-between"><span className="text-neutral-500">Fallback</span><span className="text-neutral-400">Stripe (internacional)</span></div>
            <div className="flex justify-between"><span className="text-neutral-500">Split</span><span className="text-emerald-400">Ativo</span></div>
          </div>
        </div>

        {/* AI Router */}
        <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-5 space-y-4">
          <div className="flex items-center gap-2">
            <Brain className="w-4 h-4 text-purple-400" />
            <h3 className="text-sm font-semibold text-white">ZaosNeuroRouter</h3>
          </div>
          <div className="space-y-2 text-xs">
            <div className="flex justify-between"><span className="text-neutral-500">Algoritmo</span><span className="text-white">Thompson Sampling</span></div>
            <div className="flex justify-between"><span className="text-neutral-500">Circuit Breaker</span><span className="text-emerald-400">CLOSED</span></div>
            <div className="flex justify-between"><span className="text-neutral-500">Budget Guard</span><span className="text-emerald-400">NOMINAL</span></div>
            <div className="flex justify-between"><span className="text-neutral-500">Providers Ativos</span><span className="text-white">4</span></div>
            <div className="flex justify-between"><span className="text-neutral-500">Cache Hit Rate</span><span className="text-white">87.3%</span></div>
          </div>
        </div>

        {/* Security */}
        <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-5 space-y-4">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-blue-400" />
            <h3 className="text-sm font-semibold text-white">Segurança</h3>
          </div>
          <div className="space-y-2 text-xs">
            <div className="flex justify-between"><span className="text-neutral-500">LGPD</span><span className="text-emerald-400">Compliant</span></div>
            <div className="flex justify-between"><span className="text-neutral-500">Criptografia</span><span className="text-white">AES-256-GCM</span></div>
            <div className="flex justify-between"><span className="text-neutral-500">TLS</span><span className="text-white">1.3</span></div>
            <div className="flex justify-between"><span className="text-neutral-500">Uptime</span><span className="text-white">99.97%</span></div>
            <div className="flex justify-between"><span className="text-neutral-500">SOC 2</span><span className="text-amber-400">Em progresso</span></div>
          </div>
        </div>

        {/* Beta Program */}
        <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-5 space-y-4">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-amber-400" />
            <h3 className="text-sm font-semibold text-white">Programa Beta</h3>
          </div>
          <div className="space-y-2 text-xs">
            <div className="flex justify-between"><span className="text-neutral-500">Beta Testers</span><span className="text-amber-400 font-medium">8 ativos</span></div>
            <div className="flex justify-between"><span className="text-neutral-500">Early Adopters</span><span className="text-blue-400 font-medium">2 ativos</span></div>
            <div className="flex justify-between"><span className="text-neutral-500">Vagas Restantes</span><span className="text-neutral-400">0 (lotado)</span></div>
            <div className="flex justify-between"><span className="text-neutral-500">Preço Fundador</span><span className="text-white">R$0 → R$197/mês</span></div>
            <div className="flex justify-between"><span className="text-neutral-500">Início</span><span className="text-white">01/05/2026</span></div>
          </div>
        </div>

        {/* Capacity */}
        <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-5 space-y-4">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-teal-400" />
            <h3 className="text-sm font-semibold text-white">Capacidade</h3>
          </div>
          <div className="space-y-2 text-xs">
            <div className="flex justify-between"><span className="text-neutral-500">Clientes Atuais</span><span className="text-white">10</span></div>
            <div className="flex justify-between"><span className="text-neutral-500">Capacidade Máx.</span><span className="text-white">10.000+</span></div>
            <div className="flex justify-between"><span className="text-neutral-500">Uso CPU</span><span className="text-emerald-400">12%</span></div>
            <div className="flex justify-between"><span className="text-neutral-500">Memória</span><span className="text-emerald-400">24%</span></div>
            <div className="flex justify-between"><span className="text-neutral-500">Requests/s</span><span className="text-white">847</span></div>
          </div>
        </div>

        {/* WhatsApp API */}
        <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-5 space-y-4">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-emerald-400" />
            <h3 className="text-sm font-semibold text-white">WhatsApp Business API</h3>
          </div>
          <div className="space-y-2 text-xs">
            <div className="flex justify-between"><span className="text-neutral-500">Status</span><span className="text-emerald-400">Conectado</span></div>
            <div className="flex justify-between"><span className="text-neutral-500">Número</span><span className="text-white">+55 XX XXXXX-XXXX</span></div>
            <div className="flex justify-between"><span className="text-neutral-500">Templates</span><span className="text-white">12 aprovados</span></div>
            <div className="flex justify-between"><span className="text-neutral-500">Msgs Hoje</span><span className="text-white">924</span></div>
            <div className="flex justify-between"><span className="text-neutral-500">Limite/Mês</span><span className="text-white">Ilimitado</span></div>
          </div>
        </div>
      </div>
    </div>
  );
}
