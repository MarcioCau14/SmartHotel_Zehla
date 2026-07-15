'use client';

import { useState, useCallback } from 'react';
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
  DollarSign,
  Key,
  TrendingUp,
  ExternalLink,
} from 'lucide-react';
import Link from 'next/link';

import { DashboardCards } from '@/components/zcc/DashboardCards';
import { TargetsPanel } from '@/components/zcc/TargetsPanel';
import { HunterConsole } from '@/components/zcc/HunterConsole';
import { LeadsTable } from '@/components/zcc/LeadsTable';
import { CampaignPanel } from '@/components/zcc/CampaignPanel';
import { DispararEliteButton } from '@/components/zcc/DispararEliteButton';
import { RevenueReportElite } from '@/components/zcc/RevenueReportElite';
import { CerebroZella } from '@/components/zcc/CerebroZella';
import { ClientOverview } from '@/components/zcc/ClientOverview';
import { FintechHub } from '@/components/zcc/FintechHub';
import { ApiKeysPanel } from '@/components/zcc/ApiKeysPanel';
import { CognitiveObservability } from '@/components/zcc/CognitiveObservability';
import { SwarmOverview } from '@/components/zcc/SwarmOverview';
import { globalMetrics, tenClientFriends } from '@/lib/zcc-clients-data';
import type { Lead } from '@/lib/types';

type ZCCTab = 'overview' | 'cerebro' | 'financeiro' | 'tokens' | 'prospection' | 'settings';

const tabs: { id: ZCCTab; label: string; icon: React.ElementType; desc: string }[] = [
  { id: 'overview', label: 'Visão Geral', icon: Building2, desc: 'Clientes e métricas' },
  { id: 'cerebro', label: 'Cérebro ZÉLLA', icon: Brain, desc: 'IA em tempo real' },
  { id: 'financeiro', label: 'Financeiro', icon: DollarSign, desc: 'Pagamentos e receitas' },
  { id: 'tokens', label: 'Tokens & IA', icon: Key, desc: 'LLMs e API Keys' },
  { id: 'prospection', label: 'Prospecção', icon: Search, desc: 'Hunter de Leads' },
  { id: 'settings', label: 'Configurações', icon: Settings, desc: 'Sistema' },
];

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
    <div className="min-h-screen bg-[#0e0e10]">
      {/* ===== TOP HEADER BAR ===== */}
      <header className="zcc-header">
        <div className="flex items-center justify-between px-4 py-3 max-w-[1920px] mx-auto">
          {/* Left: Back + Logo */}
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="text-[var(--zcc-text-muted)] hover:text-[var(--zcc-champagne-dim)] transition-colors p-1.5 rounded-lg hover:bg-white/[0.04]"
              aria-label="Voltar ao início"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div className="flex items-center gap-3">
              <img src="/zella-wordmark.png" alt="Zélla" width={120} height={28} className="brightness-90" />
              <span style={{fontFamily:'var(--font-geist-mono),monospace',fontSize:'0.625rem',letterSpacing:'0.15em',textTransform:'uppercase',color:'var(--zcc-text-muted)'}}>ZCC Console</span>
            </div>
          </div>

          {/* Center: Tabs */}
          <div className="hidden lg:flex items-center gap-1 bg-white/[0.03] rounded-xl p-1 border border-white/[0.04]">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 cursor-pointer ${
                    activeTab === tab.id ? 'zcc-tab-active' : 'zcc-tab'
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
              <span className="w-2 h-2 rounded-full bg-[#d4a843] animate-pulse" />
              <span className="text-[11px]" style={{color:'var(--zcc-champagne-dim)'}}>{globalMetrics.totalClients} clientes ativos</span>
            </div>
            <button className="relative p-1.5 rounded-lg hover:bg-white/[0.04] transition-all" style={{color:'var(--zcc-text-muted)'}}>
              <Bell className="w-4 h-4" />
              <span className="absolute top-0.5 right-0.5 w-2 h-2 bg-[#d4a843] rounded-full" />
            </button>
            <img src="/zella-mark.png" alt="" width={28} height={28} style={{borderRadius:'2px',border:'1px solid var(--zcc-hairline)'}} />
          </div>
        </div>
      </header>

      {/* ===== MAIN CONTENT ===== */}
      <main className="max-w-[1920px] mx-auto p-4 md:p-6">
        {/* Mobile Tab Selector */}
        <div className="lg:hidden flex items-center gap-1 bg-white/[0.03] rounded-xl p-1 border border-white/[0.04] mb-6 overflow-x-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-all duration-200 cursor-pointer whitespace-nowrap ${
                  activeTab === tab.id ? 'zcc-tab-active' : 'zcc-tab'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* ===== TAB: VISÃO GERAL ===== */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Global Command Center Metrics */}
            <section>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                <div className="zcc-panel p-4">
                  <div className="zcc-eyebrow">MRR Total</div>
                  <div className="zcc-stat-value" style={{color:'var(--zcc-kinpaku)'}}>
                    R$ {(globalMetrics.totalRevenue / 1000).toFixed(1)}k
                  </div>
                  <div className="text-[10px] flex items-center gap-1 mt-1" style={{color:'var(--zcc-kinpaku)',opacity:0.6}}>
                    <TrendingUp className="w-3 h-3" />
                    +{globalMetrics.monthlyGrowth}%/mês
                  </div>
                </div>
                <div className="zcc-panel p-4">
                  <div className="zcc-eyebrow">Reservas Totais</div>
                  <div className="zcc-stat-value">
                    {globalMetrics.totalReservations.toLocaleString('pt-BR')}
                  </div>
                  <div className="text-[10px] mt-1" style={{color:'var(--zcc-text-secondary)'}}>desde mai/2026</div>
                </div>
                <div className="zcc-panel p-4">
                  <div className="zcc-eyebrow">Msgs IA Processadas</div>
                  <div className="zcc-stat-value" style={{color:'var(--zcc-patina)'}}>
                    {(globalMetrics.totalMessagesProcessed / 1000).toFixed(1)}k
                  </div>
                  <div className="text-[10px] mt-1" style={{color:'var(--zcc-text-secondary)'}}>automatizadas</div>
                </div>
                <div className="zcc-panel p-4">
                  <div className="zcc-eyebrow">Ocupação Média</div>
                  <div className="zcc-stat-value" style={{color:'var(--zcc-patina)'}}>{globalMetrics.avgOccupancy}%</div>
                  <div className="text-[10px] mt-1" style={{color:'var(--zcc-text-secondary)'}}>dos {globalMetrics.totalRooms} quartos</div>
                </div>
                <div className="zcc-panel p-4">
                  <div className="zcc-eyebrow">Ajustes de Preço</div>
                  <div className="zcc-stat-value" style={{color:'#d4a843'}}>{globalMetrics.totalPriceAdjustments}</div>
                  <div className="text-[10px] mt-1" style={{color:'var(--zcc-text-secondary)'}}>feitos hoje pelo Cérebro</div>
                </div>
              </div>
            </section>

            {/* Quick Links to DDC & LP */}
            <section>
              <div className="flex flex-wrap gap-3">
                <Link
                  href="/ddc"
                  className="zcc-panel px-4 py-2.5 flex items-center gap-2 text-xs transition-all group"
                  style={{color:'var(--zcc-champagne-dim)'}}
                >
                  <Building2 className="w-4 h-4 transition-colors" style={{color:'var(--zcc-text-secondary)'}} />
                  <span>Dashboard do Cliente (DDC)</span>
                  <ExternalLink className="w-3 h-3 transition-colors" style={{color:'var(--zcc-text-secondary)'}} />
                </Link>
                <Link
                  href="/"
                  className="zcc-panel px-4 py-2.5 flex items-center gap-2 text-xs transition-all group"
                  style={{color:'var(--zcc-champagne-dim)'}}
                >
                  <Activity className="w-4 h-4 transition-colors" style={{color:'var(--zcc-text-secondary)'}} />
                  <span>Landing Page</span>
                  <ExternalLink className="w-3 h-3 transition-colors" style={{color:'var(--zcc-text-secondary)'}} />
                </Link>
              </div>
            </section>

            <section>
              <DashboardCards />
            </section>
            <section>
              <ClientOverview />
            </section>
          </div>
        )}

        {/* ===== TAB: CÉREBRO ZÉLLA ===== */}
        {activeTab === 'cerebro' && (
          <div className="space-y-6">
            <section>
              <CerebroZella />
            </section>
            <section>
              <CognitiveObservability />
            </section>
          </div>
        )}

        {/* ===== TAB: FINANCEIRO ===== */}
        {activeTab === 'financeiro' && (
          <div>
            <section>
              <FintechHub />
            </section>
          </div>
        )}

        {/* ===== TAB: TOKENS & IA ===== */}
        {activeTab === 'tokens' && (
          <div className="space-y-6">
            <section>
              <ApiKeysPanel />
            </section>
            <section>
              <SwarmOverview brainHealth={{
                edge_latency: 23,
                brain_queue: 4,
                voice_swarm: 2,
                cache_hit_rate: 87.3,
                tokens_today: globalMetrics.totalMessagesProcessed,
                bullmq_pending: 3,
              }} />
            </section>
          </div>
        )}

        {/* ===== TAB: PROSPECÇÃO ===== */}
        {activeTab === 'prospection' && (
          <div className="space-y-6">
            <section>
              <DashboardCards />
            </section>
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <section className="lg:col-span-3">
                <TargetsPanel
                  selectedTargetId={selectedTargetId}
                  onSelectTarget={setSelectedTargetId}
                />
              </section>
              <section className="lg:col-span-5">
                <HunterConsole />
              </section>
              <section className="lg:col-span-4">
                <CampaignPanel />
              </section>
            </div>
            <section>
              <LeadsTable
                filterTargetId={selectedTargetId}
                selectedLeadIds={selectedLeadIds}
                onSelectionChange={handleSelectionChange}
                onDiagnoseLead={handleDiagnoseLead as any}
              />
            </section>
          </div>
        )}

        {/* ===== TAB: CONFIGURAÇÕES ===== */}
        {activeTab === 'settings' && (
          <div>
            <SettingsPanel />
          </div>
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
        lead={diagnosisLead as any}
        open={diagnosisOpen}
        onClose={handleCloseDiagnosis}
      />
    </div>
  );
}

// ============================================================================
// Settings Panel — Configuration & System Info (Neo Kinpaku)
// ============================================================================
function SettingsPanel() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-2">
        <Settings className="w-5 h-5" style={{color:'var(--zcc-champagne-dim)'}} />
        <h2 className="text-lg font-bold" style={{color:'var(--zcc-champagne)'}}>Configurações do Sistema</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Gateway */}
        <div className="zcc-panel p-5 space-y-4">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4" style={{color:'var(--zcc-kinpaku)'}} />
            <h3 className="text-sm font-semibold" style={{color:'var(--zcc-champagne)'}}>Gateway de Pagamento</h3>
          </div>
          <div className="space-y-2 text-xs">
            <div className="flex justify-between"><span style={{color:'var(--zcc-text-secondary)'}}>Primário</span><span className="font-medium" style={{color:'var(--zcc-kinpaku)'}}>Mercado Pago</span></div>
            <div className="flex justify-between"><span style={{color:'var(--zcc-text-secondary)'}}>Taxa PIX</span><span style={{color:'var(--zcc-champagne)'}}>0,99%</span></div>
            <div className="flex justify-between"><span style={{color:'var(--zcc-text-secondary)'}}>Taxa Cartão</span><span style={{color:'var(--zcc-champagne)'}}>3,49%</span></div>
            <div className="flex justify-between"><span style={{color:'var(--zcc-text-secondary)'}}>Fallback</span><span style={{color:'var(--zcc-champagne-dim)'}}>Stripe (internacional)</span></div>
            <div className="flex justify-between"><span style={{color:'var(--zcc-text-secondary)'}}>Split</span><span className="zcc-badge" style={{color:'var(--zcc-kinpaku)'}}>Ativo</span></div>
          </div>
        </div>

        {/* AI Router */}
        <div className="zcc-panel p-5 space-y-4">
          <div className="flex items-center gap-2">
            <Brain className="w-4 h-4" style={{color:'var(--zcc-patina)'}} />
            <h3 className="text-sm font-semibold" style={{color:'var(--zcc-champagne)'}}>ZaosNeuroRouter</h3>
          </div>
          <div className="space-y-2 text-xs">
            <div className="flex justify-between"><span style={{color:'var(--zcc-text-secondary)'}}>Algoritmo</span><span style={{color:'var(--zcc-champagne)'}}>Thompson Sampling</span></div>
            <div className="flex justify-between"><span style={{color:'var(--zcc-text-secondary)'}}>Circuit Breaker</span><span className="zcc-badge" style={{color:'var(--zcc-kinpaku)'}}>CLOSED</span></div>
            <div className="flex justify-between"><span style={{color:'var(--zcc-text-secondary)'}}>Budget Guard</span><span className="zcc-badge" style={{color:'var(--zcc-kinpaku)'}}>NOMINAL</span></div>
            <div className="flex justify-between"><span style={{color:'var(--zcc-text-secondary)'}}>Providers Ativos</span><span style={{color:'var(--zcc-champagne)'}}>4</span></div>
            <div className="flex justify-between"><span style={{color:'var(--zcc-text-secondary)'}}>Cache Hit Rate</span><span style={{color:'var(--zcc-champagne)'}}>87.3%</span></div>
          </div>
        </div>

        {/* Security */}
        <div className="zcc-panel p-5 space-y-4">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4" style={{color:'var(--zcc-patina)'}} />
            <h3 className="text-sm font-semibold" style={{color:'var(--zcc-champagne)'}}>Segurança</h3>
          </div>
          <div className="space-y-2 text-xs">
            <div className="flex justify-between"><span style={{color:'var(--zcc-text-secondary)'}}>LGPD</span><span className="zcc-badge" style={{color:'var(--zcc-kinpaku)'}}>Compliant</span></div>
            <div className="flex justify-between"><span style={{color:'var(--zcc-text-secondary)'}}>Criptografia</span><span style={{color:'var(--zcc-champagne)'}}>AES-256-GCM</span></div>
            <div className="flex justify-between"><span style={{color:'var(--zcc-text-secondary)'}}>TLS</span><span style={{color:'var(--zcc-champagne)'}}>1.3</span></div>
            <div className="flex justify-between"><span style={{color:'var(--zcc-text-secondary)'}}>Uptime</span><span style={{color:'var(--zcc-champagne)'}}>99.97%</span></div>
            <div className="flex justify-between"><span style={{color:'var(--zcc-text-secondary)'}}>SOC 2</span><span className="zcc-badge" style={{color:'#d4a843'}}>Em progresso</span></div>
          </div>
        </div>

        {/* Beta Program */}
        <div className="zcc-panel p-5 space-y-4">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4" style={{color:'#d4a843'}} />
            <h3 className="text-sm font-semibold" style={{color:'var(--zcc-champagne)'}}>Programa Beta</h3>
          </div>
          <div className="space-y-2 text-xs">
            <div className="flex justify-between"><span style={{color:'var(--zcc-text-secondary)'}}>Beta Testers</span><span className="font-medium" style={{color:'#d4a843'}}>8 ativos</span></div>
            <div className="flex justify-between"><span style={{color:'var(--zcc-text-secondary)'}}>Early Adopters</span><span className="font-medium" style={{color:'var(--zcc-patina)'}}>2 ativos</span></div>
            <div className="flex justify-between"><span style={{color:'var(--zcc-text-secondary)'}}>Total Parceiros</span><span className="font-medium" style={{color:'var(--zcc-champagne)'}}>10 de 100</span></div>
            <div className="flex justify-between"><span style={{color:'var(--zcc-text-secondary)'}}>Vagas Restantes</span><span className="font-medium" style={{color:'var(--zcc-kinpaku)'}}>90 disponíveis</span></div>
            <div className="flex justify-between"><span style={{color:'var(--zcc-text-secondary)'}}>Preço Pós-Beta</span><span style={{color:'var(--zcc-champagne)'}}>R$0 → R$297/mês (congelado 24 meses)</span></div>
            <div className="flex justify-between"><span style={{color:'var(--zcc-text-secondary)'}}>Fim Gratuidade</span><span style={{color:'var(--zcc-champagne)'}}>01/08/2026</span></div>
          </div>
        </div>

        {/* Pricing Matrix */}
        <div className="zcc-panel p-5 space-y-4">
          <div className="flex items-center gap-2">
            <DollarSign className="w-4 h-4" style={{color:'var(--zcc-kinpaku)'}} />
            <h3 className="text-sm font-semibold" style={{color:'var(--zcc-champagne)'}}>Matriz de Preços</h3>
          </div>
          <div className="space-y-2 text-xs">
            <div className="flex justify-between"><span style={{color:'var(--zcc-text-secondary)'}}>TRIAL</span><span style={{color:'var(--zcc-champagne-dim)'}}>R$0 (7 dias)</span></div>
            <div className="flex justify-between"><span style={{color:'var(--zcc-text-secondary)'}}>LITE (PIX)</span><span className="font-medium" style={{color:'var(--zcc-patina)'}}>R$197/mês</span></div>
            <div className="flex justify-between"><span style={{color:'var(--zcc-text-secondary)'}}>LITE (Cartão)</span><span className="font-medium" style={{color:'var(--zcc-patina)'}}>R$247/mês</span></div>
            <div className="flex justify-between"><span style={{color:'var(--zcc-text-secondary)'}}>PRO</span><span className="font-medium" style={{color:'var(--zcc-kinpaku)'}}>R$397/mês</span></div>
            <div className="flex justify-between"><span style={{color:'var(--zcc-text-secondary)'}}>MAX</span><span className="font-medium" style={{color:'#d4a843'}}>R$797/mês</span></div>
            <div className="flex justify-between border-t pt-2 mt-2" style={{borderColor:'var(--zcc-hairline)'}}><span style={{color:'var(--zcc-text-secondary)'}}>Beta Parceiro</span><span style={{color:'#d4a843'}}>R$297/mês</span></div>
            <div className="flex justify-between"><span style={{color:'var(--zcc-text-secondary)'}}>Link-in-Bio Standalone</span><span className="font-medium" style={{color:'var(--zcc-patina)'}}>R$47/mês</span></div>
          </div>
        </div>

        {/* Capacity */}
        <div className="zcc-panel p-5 space-y-4">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4" style={{color:'var(--zcc-patina)'}} />
            <h3 className="text-sm font-semibold" style={{color:'var(--zcc-champagne)'}}>Capacidade</h3>
          </div>
          <div className="space-y-2 text-xs">
            <div className="flex justify-between"><span style={{color:'var(--zcc-text-secondary)'}}>Clientes Atuais</span><span style={{color:'var(--zcc-champagne)'}}>10</span></div>
            <div className="flex justify-between"><span style={{color:'var(--zcc-text-secondary)'}}>Capacidade Máx.</span><span style={{color:'var(--zcc-champagne)'}}>10.000+</span></div>
            <div className="flex justify-between"><span style={{color:'var(--zcc-text-secondary)'}}>Uso CPU</span><span style={{color:'var(--zcc-kinpaku)'}}>12%</span></div>
            <div className="flex justify-between"><span style={{color:'var(--zcc-text-secondary)'}}>Memória</span><span style={{color:'var(--zcc-kinpaku)'}}>24%</span></div>
            <div className="flex justify-between"><span style={{color:'var(--zcc-text-secondary)'}}>Requests/s</span><span style={{color:'var(--zcc-champagne)'}}>847</span></div>
          </div>
        </div>

        {/* WhatsApp API */}
        <div className="zcc-panel p-5 space-y-4">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4" style={{color:'var(--zcc-kinpaku)'}} />
            <h3 className="text-sm font-semibold" style={{color:'var(--zcc-champagne)'}}>WhatsApp Business API</h3>
          </div>
          <div className="space-y-2 text-xs">
            <div className="flex justify-between"><span style={{color:'var(--zcc-text-secondary)'}}>Status</span><span className="zcc-badge" style={{color:'var(--zcc-kinpaku)'}}>Conectado</span></div>
            <div className="flex justify-between"><span style={{color:'var(--zcc-text-secondary)'}}>Número</span><span style={{color:'var(--zcc-champagne)'}}>+55 XX XXXXX-XXXX</span></div>
            <div className="flex justify-between"><span style={{color:'var(--zcc-text-secondary)'}}>Templates</span><span style={{color:'var(--zcc-champagne)'}}>12 aprovados</span></div>
            <div className="flex justify-between"><span style={{color:'var(--zcc-text-secondary)'}}>Msgs Hoje</span><span style={{color:'var(--zcc-champagne)'}}>924</span></div>
            <div className="flex justify-between"><span style={{color:'var(--zcc-text-secondary)'}}>Limite/Mês</span><span style={{color:'var(--zcc-champagne)'}}>Ilimitado</span></div>
          </div>
        </div>
      </div>
    </div>
  );
}