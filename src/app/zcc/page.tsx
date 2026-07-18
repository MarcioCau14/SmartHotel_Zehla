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
  Calendar,
  Home,
  Crown,
  Globe,
  Star,
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
import { AirbnbPanel } from '@/components/zcc/AirbnbPanel';
import { globalMetrics, tenClientFriends, airbnbHosts, parceirosZella, airbnbMetrics, parceiroMetrics } from '@/lib/zcc-clients-data';
import type { Lead } from '@/lib/types';

type ZCCTab = 'overview' | 'cerebro' | 'financeiro' | 'airbnb' | 'tokens' | 'prospection' | 'settings';

const tabs: { id: ZCCTab; label: string; icon: React.ElementType; desc: string }[] = [
  { id: 'overview', label: 'Visão Geral', icon: Building2, desc: 'Clientes e métricas' },
  { id: 'cerebro', label: 'Cérebro ZÉLLA', icon: Brain, desc: 'IA em tempo real' },
  { id: 'financeiro', label: 'Financeiro', icon: DollarSign, desc: 'Pagamentos e receitas' },
  { id: 'airbnb', label: 'Airbnb', icon: Home, desc: 'Anfitriões e imóveis' },
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

  // Computed niche stats
  const totalMRR = airbnbMetrics.proCount * 397 + airbnbMetrics.maxCount * 797 + parceiroMetrics.monthlyMRR;

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
          <div className="hidden xl:flex items-center gap-1 bg-white/[0.03] rounded-xl p-1 border border-white/[0.04]">
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
            <div className="hidden md:flex items-center gap-1.5 px-2 py-1 rounded-lg" style={{background:'rgba(212,168,67,0.06)', border:'1px solid rgba(212,168,67,0.12)'}}>
              <DollarSign className="w-3 h-3" style={{color:'var(--zcc-kinpaku)'}} />
              <span className="text-[11px] font-mono font-semibold" style={{color:'var(--zcc-kinpaku)'}}>MRR R${totalMRR.toLocaleString('pt-BR')}</span>
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
        <div className="xl:hidden flex items-center gap-1 bg-white/[0.03] rounded-xl p-1 border border-white/[0.04] mb-6 overflow-x-auto">
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
                    R$ {(totalMRR / 1000).toFixed(1)}k
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
                  <div className="text-[10px] mt-1" style={{color:'var(--zcc-text-secondary)'}}>todos os nichos</div>
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
                  <div className="text-[10px] mt-1" style={{color:'var(--zcc-text-secondary)'}}>dos {globalMetrics.totalRooms} quartos/imóveis</div>
                </div>
                <div className="zcc-panel p-4">
                  <div className="zcc-eyebrow">Ajustes de Preço</div>
                  <div className="zcc-stat-value" style={{color:'#d4a843'}}>{globalMetrics.totalPriceAdjustments}</div>
                  <div className="text-[10px] mt-1" style={{color:'var(--zcc-text-secondary)'}}>feitos hoje pelo Cérebro</div>
                </div>
              </div>
            </section>

            {/* Niche Breakdown — New Section */}
            <section>
              <div className="zcc-panel p-5" style={{borderColor:'var(--zcc-kinpaku)', borderWidth:1}}>
                <div className="flex items-center gap-2 mb-4">
                  <Globe className="w-4 h-4" style={{color:'var(--zcc-kinpaku)'}} />
                  <h3 className="text-sm font-semibold" style={{color:'var(--zcc-champagne)'}}>Visão por Nicho — Resumo Interligado</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Pousadas */}
                  <div className="zcc-panel p-4 space-y-3" style={{borderColor:'var(--zcc-kinpaku)', borderWidth:1}}>
                    <div className="flex items-center gap-2">
                      <Building2 className="w-4 h-4" style={{color:'var(--zcc-kinpaku)'}} />
                      <span className="text-xs font-bold" style={{color:'var(--zcc-kinpaku)'}}>Pousadas</span>
                      <span className="zcc-badge-gold">BETA</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <div className="zcc-eyebrow">CLIENTES</div>
                        <div className="text-lg font-bold" style={{color:'var(--zcc-champagne)'}}>{globalMetrics.pousadas.clients}</div>
                      </div>
                      <div>
                        <div className="zcc-eyebrow">RECEITA</div>
                        <div className="text-lg font-bold" style={{color:'var(--zcc-kinpaku)'}}>R$ {(globalMetrics.pousadas.revenue / 1000).toFixed(1)}k</div>
                      </div>
                    </div>
                    <div className="text-[10px] p-2 rounded" style={{background:'rgba(212,168,67,0.06)', color:'var(--zcc-text-muted)'}}>
                      Planos: TRIAL + LITE + PRO + MAX • MRR atual: R$0 (Beta gratuito)
                    </div>
                  </div>

                  {/* Airbnb */}
                  <div className="zcc-panel p-4 space-y-3" style={{borderColor:'var(--zcc-patina)', borderWidth:1}}>
                    <div className="flex items-center gap-2">
                      <Home className="w-4 h-4" style={{color:'var(--zcc-patina)'}} />
                      <span className="text-xs font-bold" style={{color:'var(--zcc-patina)'}}>Anfitriões Airbnb</span>
                      <span className="zcc-badge-patina">PRO+MAX</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <div className="zcc-eyebrow">ANFITRIÕES</div>
                        <div className="text-lg font-bold" style={{color:'var(--zcc-champagne)'}}>{globalMetrics.anfitrioes.clients}</div>
                      </div>
                      <div>
                        <div className="zcc-eyebrow">IMÓVEIS</div>
                        <div className="text-lg font-bold" style={{color:'var(--zcc-patina)'}}>{globalMetrics.anfitrioes.properties}</div>
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-1 text-center">
                      <div>
                        <div className="text-[10px]" style={{color:'var(--zcc-text-muted)'}}>Superhosts</div>
                        <div className="text-sm font-bold" style={{color:'#d4a843'}}>{airbnbMetrics.superhosts}</div>
                      </div>
                      <div>
                        <div className="text-[10px]" style={{color:'var(--zcc-text-muted)'}}>iCal Sync</div>
                        <div className="text-sm font-bold" style={{color:'var(--zcc-success)'}}>{airbnbMetrics.icalSyncEnabled}/{airbnbMetrics.icalSyncTotal}</div>
                      </div>
                      <div>
                        <div className="text-[10px]" style={{color:'var(--zcc-text-muted)'}}>Resp. IA</div>
                        <div className="text-sm font-bold" style={{color:'var(--zcc-kinpaku)'}}>{airbnbMetrics.avgAiResponseRate}%</div>
                      </div>
                    </div>
                    <div className="text-[10px] p-2 rounded" style={{background:'rgba(74,154,154,0.06)', color:'var(--zcc-text-muted)'}}>
                      Planos: SOMENTE PRO + MAX • MRR: R$ {(airbnbMetrics.proCount * 397 + airbnbMetrics.maxCount * 797).toLocaleString('pt-BR')}
                    </div>
                  </div>

                  {/* Parceiro Zélla */}
                  <div className="zcc-panel p-4 space-y-3" style={{borderColor:'#d4a843', borderWidth:1}}>
                    <div className="flex items-center gap-2">
                      <Crown className="w-4 h-4" style={{color:'#d4a843'}} />
                      <span className="text-xs font-bold" style={{color:'#d4a843'}}>Parceiro Zélla</span>
                      <span className="zcc-badge-gold">{parceiroMetrics.totalPartners}/100</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <div className="zcc-eyebrow">PARCEIROS</div>
                        <div className="text-lg font-bold" style={{color:'var(--zcc-champagne)'}}>{parceiroMetrics.totalPartners}</div>
                      </div>
                      <div>
                        <div className="zcc-eyebrow">MRR</div>
                        <div className="text-lg font-bold" style={{color:'#d4a843'}}>R$ {parceiroMetrics.monthlyMRR.toLocaleString('pt-BR')}</div>
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-1 text-center">
                      <div>
                        <div className="text-[10px]" style={{color:'var(--zcc-text-muted)' }}>Selos Ativos</div>
                        <div className="text-sm font-bold" style={{color:'#d4a843'}}>{parceiroMetrics.sealEnabled}</div>
                      </div>
                      <div>
                        <div className="text-[10px]" style={{color:'var(--zcc-text-muted)'}}>Referrals</div>
                        <div className="text-sm font-bold" style={{color:'var(--zcc-patina)'}}>{parceiroMetrics.totalReferrals}</div>
                      </div>
                      <div>
                        <div className="text-[10px]" style={{color:'var(--zcc-text-muted)'}}>Comissão</div>
                        <div className="text-sm font-bold" style={{color:'var(--zcc-kinpaku)'}}>R${parceiroMetrics.totalCommission}</div>
                      </div>
                    </div>
                    <div className="text-[10px] p-2 rounded" style={{background:'rgba(212,168,67,0.06)', color:'var(--zcc-text-muted)'}}>
                      R$247/mês × 24 meses congelados + Selo Link-in-Bio + Instagram
                    </div>
                  </div>
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
                <Link
                  href="/link-in-bio"
                  className="zcc-panel px-4 py-2.5 flex items-center gap-2 text-xs transition-all group"
                  style={{color:'var(--zcc-champagne-dim)'}}
                >
                  <Globe className="w-4 h-4 transition-colors" style={{color:'var(--zcc-text-secondary)'}} />
                  <span>Link-in-Bio</span>
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

        {/* ===== TAB: AIRBNB ===== */}
        {activeTab === 'airbnb' && (
          <div>
            <section>
              <AirbnbPanel />
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

      {/* ── LINHA 1: Infra + Segurança + IA ── */}
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
      </div>

      {/* ── LINHA 2: MATRIZ DE PREÇOS POR NICHO (Full Width) ── */}
      <div className="zcc-panel p-5" style={{borderColor:'var(--zcc-kinpaku)', borderWidth:1}}>
        <div className="flex items-center gap-2 mb-4">
          <DollarSign className="w-4 h-4" style={{color:'var(--zcc-kinpaku)'}} />
          <h3 className="text-sm font-semibold" style={{color:'var(--zcc-champagne)'}}>Matriz de Preços por Nicho — Visão Completa</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Pousadas */}
          <div className="zcc-panel p-4 space-y-3">
            <div className="flex items-center gap-2 mb-1">
              <Building2 className="w-4 h-4" style={{color:'var(--zcc-kinpaku)'}} />
              <span className="text-xs font-bold uppercase tracking-wider" style={{color:'var(--zcc-kinpaku)'}}>Pousadas</span>
            </div>
            <div className="text-[10px] mb-2" style={{color:'var(--zcc-text-muted)'}}>Planos disponíveis: TRIAL, LITE, PRO, MAX</div>
            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between"><span style={{color:'var(--zcc-text-secondary)'}}>TRIAL</span><span style={{color:'var(--zcc-champagne-dim)'}}>R$0 (7 dias)</span></div>
              <div className="flex justify-between"><span style={{color:'var(--zcc-text-secondary)'}}>LITE (PIX)</span><span className="font-medium" style={{color:'var(--zcc-patina)'}}>R$197/mês</span></div>
              <div className="flex justify-between"><span style={{color:'var(--zcc-text-secondary)'}}>LITE (Cartão)</span><span className="font-medium" style={{color:'var(--zcc-patina)'}}>R$247/mês</span></div>
              <div className="flex justify-between"><span style={{color:'var(--zcc-text-secondary)'}}>PRO</span><span className="font-medium" style={{color:'var(--zcc-kinpaku)'}}>R$397/mês</span></div>
              <div className="flex justify-between"><span style={{color:'var(--zcc-text-secondary)'}}>MAX</span><span className="font-medium" style={{color:'#d4a843'}}>R$797/mês</span></div>
              <div className="flex justify-between border-t pt-1.5 mt-1.5" style={{borderColor:'var(--zcc-hairline)'}}><span style={{color:'var(--zcc-text-secondary)'}}>Link-in-Bio Standalone</span><span style={{color:'var(--zcc-patina)'}}>R$47/mês</span></div>
            </div>
          </div>

          {/* Anfitriões Airbnb */}
          <div className="zcc-panel p-4 space-y-3">
            <div className="flex items-center gap-2 mb-1">
              <Home className="w-4 h-4" style={{color:'var(--zcc-patina)'}} />
              <span className="text-xs font-bold uppercase tracking-wider" style={{color:'var(--zcc-patina)'}}>Anfitriões Airbnb</span>
            </div>
            <div className="text-[10px] mb-2" style={{color:'var(--zcc-text-muted)'}}>Planos disponíveis: SOMENTE PRO e MAX</div>
            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between opacity-40"><span style={{color:'var(--zcc-text-secondary)'}}>TRIAL</span><span style={{color:'var(--zcc-text-muted)'}}>Não exibido</span></div>
              <div className="flex justify-between opacity-40"><span style={{color:'var(--zcc-text-secondary)'}}>LITE</span><span style={{color:'var(--zcc-text-muted)'}}>Não exibido</span></div>
              <div className="flex justify-between"><span style={{color:'var(--zcc-text-secondary)'}}>PRO</span><span className="font-bold" style={{color:'var(--zcc-kinpaku)'}}>R$397/mês</span></div>
              <div className="flex justify-between"><span style={{color:'var(--zcc-text-secondary)'}}>MAX</span><span className="font-bold" style={{color:'#d4a843'}}>R$797/mês</span></div>
              <div className="flex justify-between border-t pt-1.5 mt-1.5" style={{borderColor:'var(--zcc-hairline)'}}><span style={{color:'var(--zcc-text-muted)'}}>Regra</span><span className="font-medium" style={{color:'var(--zcc-patina)'}}>Só PRO + MAX</span></div>
            </div>
          </div>

          {/* Parceiro Zélla */}
          <div className="zcc-panel p-4 space-y-3" style={{borderColor:'#d4a843', borderWidth:1}}>
            <div className="flex items-center gap-2 mb-1">
              <Crown className="w-4 h-4" style={{color:'#d4a843'}} />
              <span className="text-xs font-bold uppercase tracking-wider" style={{color:'#d4a843'}}>Parceiro Zélla</span>
            </div>
            <div className="text-[10px] mb-2" style={{color:'var(--zcc-text-muted)'}}>Plano ÚNICO: PARCEIRO ZÉLLA</div>
            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between opacity-40"><span style={{color:'var(--zcc-text-secondary)'}}>TRIAL</span><span style={{color:'var(--zcc-text-muted)'}}>Não exibido</span></div>
              <div className="flex justify-between opacity-40"><span style={{color:'var(--zcc-text-secondary)'}}>LITE</span><span style={{color:'var(--zcc-text-muted)'}}>Não exibido</span></div>
              <div className="flex justify-between opacity-40"><span style={{color:'var(--zcc-text-secondary)'}}>PRO</span><span style={{color:'var(--zcc-text-muted)'}}>Não exibido</span></div>
              <div className="flex justify-between opacity-40"><span style={{color:'var(--zcc-text-secondary)'}}>MAX</span><span style={{color:'var(--zcc-text-muted)'}}>Não exibido</span></div>
              <div className="flex justify-between border-t pt-1.5 mt-1.5" style={{borderColor:'#d4a84340'}}><span className="font-bold" style={{color:'#d4a843'}}>PARCEIRO ZÉLLA</span><span className="font-bold" style={{color:'#d4a843'}}>R$247/mês × 24 meses</span></div>
            </div>
            <div className="mt-2 p-2 rounded-lg" style={{background:'rgba(212,168,67,0.08)', border:'1px solid rgba(212,168,67,0.15)'}}>
              <div className="text-[10px] font-semibold mb-1" style={{color:'#d4a843'}}>Benefícios inclusos:</div>
              <ul className="text-[10px] space-y-0.5" style={{color:'var(--zcc-text-secondary)'}}>
                <li>→ PRO completo por R$247/mês (economia R$150/mês)</li>
                <li>→ Preço congelado por 24 meses</li>
                <li>→ Selo de Parceiro Zélla no perfil Link-in-Bio</li>
                <li>→ Link para fixar no perfil do Instagram</li>
                <li>→ Atendimento + mensagens ilimitados</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* ── LINHA 3: Channel Manager Status + Programa Beta ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Channel Manager Status */}
        <div className="zcc-panel p-5 space-y-4">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4" style={{color:'var(--zcc-patina)'}} />
            <h3 className="text-sm font-semibold" style={{color:'var(--zcc-champagne)'}}>Channel Manager — Roadmap</h3>
          </div>
          <div className="space-y-3">
            {/* Fase 1 */}
            <div className="flex items-start gap-3 p-3 rounded-lg" style={{background:'rgba(16,185,129,0.06)', border:'1px solid rgba(16,185,129,0.12)'}}>
              <span className="zcc-badge" style={{color:'var(--zcc-kinpaku)', background:'rgba(16,185,129,0.1)'}}>DISPONÍVEL</span>
              <div>
                <div className="text-xs font-semibold" style={{color:'var(--zcc-champagne)'}}>Fase 1 — iCal Export & Import</div>
                <div className="text-[10px] mt-0.5" style={{color:'var(--zcc-text-secondary)'}}>Exportar calendário para Booking/Airbnb/Decolar. Importar reservas via URL iCal. Atualização a cada 15 min.</div>
              </div>
            </div>
            {/* Fase 2 */}
            <div className="flex items-start gap-3 p-3 rounded-lg" style={{background:'rgba(245,158,11,0.06)', border:'1px solid rgba(245,158,11,0.12)'}}>
              <span className="zcc-badge" style={{color:'#d4a843', background:'rgba(245,158,11,0.1)'}}>EM DESENVOLVIMENTO</span>
              <div>
                <div className="text-xs font-semibold" style={{color:'var(--zcc-champagne)'}}>Fase 2 — Conexão Direta com Canais</div>
                <div className="text-[10px] mt-0.5" style={{color:'var(--zcc-text-secondary)'}}>API Booking.com & Decolar/Airbnb. Sincronização de disponibilidade e preços. Será liberado quando testado e validado.</div>
              </div>
            </div>
            {/* Fase 3 */}
            <div className="flex items-start gap-3 p-3 rounded-lg" style={{background:'rgba(59,130,246,0.04)', border:'1px solid rgba(59,130,246,0.08)'}}>
              <span className="zcc-badge" style={{color:'var(--zcc-text-muted)', background:'rgba(59,130,246,0.06)'}}>NO ROADMAP</span>
              <div>
                <div className="text-xs font-semibold" style={{color:'var(--zcc-champagne)'}}>Fase 3 — Expansão de Canais</div>
                <div className="text-[10px] mt-0.5" style={{color:'var(--zcc-text-secondary)'}}>Mais canais e OTAs. Liberação gradual conforme demanda e validação. Qualidade antes de quantidade.</div>
              </div>
            </div>
          </div>
          <div className="text-[10px] flex items-center gap-1.5 pt-2 border-t" style={{color:'var(--zcc-text-muted)', borderColor:'var(--zcc-hairline)'}}>
            <Shield className="w-3 h-3" />
            Sem promessas vazias — só mostramos o que está disponível ou em desenvolvimento real
          </div>
        </div>

        {/* Programa Beta Parceiro */}
        <div className="zcc-panel p-5 space-y-4" style={{borderColor:'#d4a843', borderWidth:1}}>
          <div className="flex items-center gap-2">
            <Crown className="w-4 h-4" style={{color:'#d4a843'}} />
            <h3 className="text-sm font-semibold" style={{color:'var(--zcc-champagne)'}}>Programa Beta Parceiro — Primeiros 100</h3>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="zcc-panel p-3 space-y-2">
              <div className="zcc-eyebrow">PROGRESSO</div>
              <div className="text-lg font-bold" style={{color:'#d4a843'}}>{parceiroMetrics.totalPartners}<span className="text-sm" style={{color:'var(--zcc-text-muted)'}}>/100</span></div>
              <div className="zcc-progress-track">
                <div className="zcc-progress-fill" style={{width:`${parceiroMetrics.totalPartners}%`, backgroundColor:'#d4a843'}} />
              </div>
              <div className="text-[10px]" style={{color:'var(--zcc-text-muted)'}}>{100 - parceiroMetrics.totalPartners} vagas restantes</div>
            </div>
            <div className="zcc-panel p-3 space-y-2">
              <div className="zcc-eyebrow">COMPOSIÇÃO</div>
              <div className="space-y-1 text-xs">
                <div className="flex justify-between"><span style={{color:'#d4a843'}}>Parceiros Ativos</span><span style={{color:'var(--zcc-champagne)'}}>{parceiroMetrics.activePartners}</span></div>
                <div className="flex justify-between"><span style={{color:'var(--zcc-patina)'}}>Em Onboarding</span><span style={{color:'var(--zcc-champagne)'}}>{parceiroMetrics.onboarding}</span></div>
              </div>
            </div>
          </div>
          <div className="space-y-2 text-xs">
            <div className="flex justify-between"><span style={{color:'var(--zcc-text-secondary)'}}>Preço Pós-Beta</span><span className="font-bold" style={{color:'#d4a843'}}>R$247/mês congelado por 24 meses</span></div>
            <div className="flex justify-between"><span style={{color:'var(--zcc-text-secondary)'}}>Economia vs. PRO regular</span><span style={{color:'var(--zcc-kinpaku)'}}>R$150/mês × 24 = R$3.600</span></div>
            <div className="flex justify-between"><span style={{color:'var(--zcc-text-secondary)'}}>Fim Gratuidade</span><span style={{color:'var(--zcc-champagne)'}}>01/08/2026</span></div>
            <div className="flex justify-between"><span style={{color:'var(--zcc-text-secondary)'}}>Selo Parceiro</span><span style={{color:'var(--zcc-champagne)'}}>Link-in-Bio + fixar no Instagram</span></div>
          </div>
          <div className="text-[10px] p-2 rounded-lg" style={{background:'rgba(212,168,67,0.08)', border:'1px solid rgba(212,168,67,0.12)', color:'var(--zcc-text-secondary)'}}>
            <strong style={{color:'#d4a843'}}>Regra:</strong> O plano Parceiro Zélla dá acesso completo ao PRO (R$397) por R$247/mês. Inclui selo de parceiro no Link-in-Bio fornecido pelo Zélla (link para fixar no Instagram). Preço congelado por 24 meses — sem reajuste.
          </div>
        </div>
      </div>

      {/* ── LINHA 4: Regras de Nicho + Capacity + WhatsApp ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Regras por Nicho */}
        <div className="zcc-panel p-5 space-y-4">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4" style={{color:'var(--zcc-kinpaku)'}} />
            <h3 className="text-sm font-semibold" style={{color:'var(--zcc-champagne)'}}>Regras de Exibição por Nicho</h3>
          </div>
          <div className="space-y-3 text-xs">
            <div className="p-2 rounded-lg" style={{background:'rgba(16,185,129,0.05)', border:'1px solid rgba(16,185,129,0.1)'}}>
              <div className="font-semibold mb-1" style={{color:'var(--zcc-kinpaku)'}}>Pousadas</div>
              <div style={{color:'var(--zcc-text-secondary)'}}>Exibe: TRIAL + LITE + PRO + MAX<br/>Oculta: Parceiro Zélla<br/>Pagamento: PIX (LITE) ou Cartão (PRO/MAX)</div>
            </div>
            <div className="p-2 rounded-lg" style={{background:'rgba(74,154,154,0.05)', border:'1px solid rgba(74,154,154,0.1)'}}>
              <div className="font-semibold mb-1" style={{color:'var(--zcc-patina)'}}>Anfitriões Airbnb</div>
              <div style={{color:'var(--zcc-text-secondary)'}}>Exibe: SOMENTE PRO + MAX<br/>Oculta: TRIAL, LITE, Parceiro Zélla<br/>Pagamento: Exclusivo Cartão</div>
            </div>
            <div className="p-2 rounded-lg" style={{background:'rgba(212,168,67,0.05)', border:'1px solid rgba(212,168,67,0.1)'}}>
              <div className="font-semibold mb-1" style={{color:'#d4a843'}}>Parceiro Zélla</div>
              <div style={{color:'var(--zcc-text-secondary)'}}>Exibe: SOMENTE Parceiro Zélla (R$247/mês × 24 meses)<br/>Oculta: TRIAL, LITE, PRO, MAX<br/>Benefício: Selo parceiro no Link-in-Bio + Instagram</div>
            </div>
          </div>
        </div>

        {/* Capacity */}
        <div className="zcc-panel p-5 space-y-4">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4" style={{color:'var(--zcc-patina)'}} />
            <h3 className="text-sm font-semibold" style={{color:'var(--zcc-champagne)'}}>Capacidade</h3>
          </div>
          <div className="space-y-2 text-xs">
            <div className="flex justify-between"><span style={{color:'var(--zcc-text-secondary)'}}>Clientes Totais</span><span style={{color:'var(--zcc-champagne)'}}>{globalMetrics.totalClients}</span></div>
            <div className="flex justify-between"><span style={{color:'var(--zcc-text-secondary)'}}>→ Pousadas</span><span style={{color:'var(--zcc-kinpaku)'}}>{globalMetrics.pousadas.clients}</span></div>
            <div className="flex justify-between"><span style={{color:'var(--zcc-text-secondary)'}}>→ Anfitriões Airbnb</span><span style={{color:'var(--zcc-patina)'}}>{globalMetrics.anfitrioes.clients}</span></div>
            <div className="flex justify-between"><span style={{color:'var(--zcc-text-secondary)'}}>→ Parceiros Zélla</span><span style={{color:'#d4a843'}}>{parceiroMetrics.totalPartners}</span></div>
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
