'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users, Power, PowerOff, Eye, Search,
  Brain, TrendingUp, TrendingDown, DollarSign, MessageSquare,
  CheckCircle2, XCircle, AlertTriangle, Clock,
  ChevronRight, ExternalLink, Key, Crown, Star, Home,
} from 'lucide-react';
import { tenClientFriends, airbnbHosts, parceirosZella, globalMetrics as _globalMetrics } from '@/lib/zcc-clients-data';

// ── Unified Tenant Type ────────────────────────────────────────────────────────

interface UnifiedTenant {
  id: string;
  name: string;
  niche: 'pousadas' | 'anfitrioes' | 'parceiro';
  plan: string;
  planPrice: number;
  status: 'ACTIVE' | 'ONBOARDING' | 'TRIAL' | 'BETA_TESTER' | 'EARLY_ADOPTER';
  city: string;
  state: string;
  owner: string;
  whatsapp: string;
  // Metrics
  revenue: number;
  aiMessagesProcessed: number;
  conversionRate: number;
  brainAccuracy: number;
  brainStatus: 'learning' | 'calibrated' | 'optimizing';
  // Kill Switch
  killSwitchActive: boolean;
  killSwitchReason?: string;
  killSwitchAt?: string;
  // Extra
  superhost?: boolean;
  referralCount?: number;
}

// ── Generate static fallback tenants ──────────────────────────────────────────

const staticTenants: UnifiedTenant[] = [
  ...tenClientFriends.map(c => ({
    id: c.id,
    name: c.name,
    niche: 'pousadas' as const,
    plan: c.plan === 'fundador' ? 'FUNDADOR' : c.plan.toUpperCase(),
    planPrice: c.plan === 'fundador' ? 297 : c.plan === 'pro' ? 397 : 797,
    status: c.status as UnifiedTenant['status'],
    city: c.city,
    state: c.state,
    owner: c.owner,
    whatsapp: c.whatsapp,
    revenue: c.monthlyRevenue,
    aiMessagesProcessed: c.aiMessagesProcessed,
    conversionRate: c.conversionRate,
    brainAccuracy: c.brainAccuracy,
    brainStatus: c.brainStatus,
    killSwitchActive: false,
  })),
  ...airbnbHosts.map(h => ({
    id: h.id,
    name: h.name,
    niche: 'anfitrioes' as const,
    plan: h.plan.toUpperCase(),
    planPrice: h.plan === 'pro' ? 397 : 797,
    status: h.status as UnifiedTenant['status'],
    city: h.city,
    state: h.state,
    owner: h.owner,
    whatsapp: h.whatsapp,
    revenue: h.monthlyRevenue,
    aiMessagesProcessed: h.aiMessagesProcessed,
    conversionRate: h.conversionRate,
    brainAccuracy: h.brainAccuracy,
    brainStatus: h.brainStatus,
    killSwitchActive: false,
    superhost: h.superhost,
  })),
  ...parceirosZella.map(p => ({
    id: p.id,
    name: p.name,
    niche: 'parceiro' as const,
    plan: 'PARCEIRO',
    planPrice: p.planPrice,
    status: p.status as UnifiedTenant['status'],
    city: p.city,
    state: p.state,
    owner: p.owner,
    whatsapp: p.whatsapp,
    revenue: p.commissionEarned,
    aiMessagesProcessed: 0,
    conversionRate: 0,
    brainAccuracy: 0,
    brainStatus: 'learning' as const,
    killSwitchActive: false,
    referralCount: p.referrals,
  })),
];

// ── Agent Swarm Stats ─────────────────────────────────────────────────────────

const swarmStats = {
  pousadasSwarm: { agents: 0, successRate: 0, avgLatency: 0, intentsResolved: 0, stuck: 0 },
  airbnbSwarm: { agents: 0, successRate: 0, avgLatency: 0, intentsResolved: 0, stuck: 0 },
  financeSwarm: { agents: 0, successRate: 0, avgLatency: 0, intentsResolved: 0, stuck: 0 },
};

// ── Component ─────────────────────────────────────────────────────────────────

export function TenantXRay() {
  const [tenants, setTenants] = useState<UnifiedTenant[]>(staticTenants);
  const [tenantsLoading, setTenantsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterNiche, setFilterNiche] = useState<'all' | 'pousadas' | 'anfitrioes' | 'parceiro'>('all');
  const [filterPlan, setFilterPlan] = useState<string>('all');
  const [selectedTenant, setSelectedTenant] = useState<UnifiedTenant | null>(null);
  const [confirmKillId, setConfirmKillId] = useState<string | null>(null);

  // Fetch tenants from API on mount, merge with static fallback
  useEffect(() => {
    async function fetchTenants() {
      try {
        const res = await fetch('/api/zcc/tenants');
        if (res.ok) {
          const json = await res.json();
          if (json.data && Array.isArray(json.data) && json.data.length > 0) {
            // Map API tenants to UnifiedTenant format and merge with static
            const apiTenants: UnifiedTenant[] = json.data.map((t: any) => ({
              id: t.id,
              name: t.name,
              niche: t.niche || 'pousadas',
              plan: (t.plan || 'trial').toUpperCase(),
              planPrice: t.planPrice ?? 0,
              status: (t.status || 'ACTIVE').toUpperCase() as UnifiedTenant['status'],
              city: t.city || '',
              state: t.state || '',
              owner: t.owner || '',
              whatsapp: t.whatsapp || '',
              revenue: t.revenue ?? 0,
              aiMessagesProcessed: t.aiMessagesProcessed ?? 0,
              conversionRate: t.conversionRate ?? 0,
              brainAccuracy: t.brainAccuracy ?? 0,
              brainStatus: t.brainStatus ?? 'learning',
              killSwitchActive: t.killSwitchActive ?? false,
            }));
            setTenants(apiTenants);
          }
        }
      } catch {
        /* keep static fallback — tenants already initialized with staticTenants */
      } finally {
        setTenantsLoading(false);
      }
    }
    fetchTenants();
  }, []);

  const toggleKillSwitch = useCallback((id: string, reason?: string) => {
    setTenants(prev => prev.map(t => {
      if (t.id !== id) return t;
      const activating = !t.killSwitchActive;
      return {
        ...t,
        killSwitchActive: activating,
        killSwitchReason: activating ? (reason || 'Manual admin override') : undefined,
        killSwitchAt: activating ? new Date().toISOString() : undefined,
      };
    }));
    setConfirmKillId(null);
  }, []);

  const filtered = tenants.filter(t => {
    if (search && !t.name.toLowerCase().includes(search.toLowerCase()) && !t.owner.toLowerCase().includes(search.toLowerCase())) return false;
    if (filterNiche !== 'all' && t.niche !== filterNiche) return false;
    if (filterPlan !== 'all' && t.plan !== filterPlan) return false;
    return true;
  });

  // Churn stats
  const activeCount = tenants.filter(t => !t.killSwitchActive).length;
  const frozenCount = tenants.filter(t => t.killSwitchActive).length;
  const churnRate = tenants.length > 0 ? ((frozenCount / tenants.length) * 100).toFixed(1) : '0.0';

  const nicheConfig = {
    pousadas: { color: 'var(--zcc-kinpaku)', label: 'Pousadas', badge: 'zcc-badge-gold' },
    anfitrioes: { color: 'var(--zcc-patina)', label: 'Airbnb', badge: 'zcc-badge-patina' },
    parceiro: { color: '#c45454', label: 'Parceiro', badge: 'zcc-badge-danger' },
  };

  const brainConfig = {
    learning: { label: 'Aprendendo', color: '#f59e0b', badge: 'zcc-badge-gold' },
    calibrated: { label: 'Calibrado', color: 'var(--zcc-patina)', badge: 'zcc-badge-patina' },
    optimizing: { label: 'Otimizando', color: '#10b981', badge: 'zcc-badge-success' },
  };

  return (
    <div className="space-y-5">
      {/* Loading indicator */}
      {tenantsLoading && (
        <div className="flex items-center gap-2 px-3 py-2 rounded" style={{ background: 'rgba(212,168,67,0.06)', border: '1px solid rgba(212,168,67,0.12)' }}>
          <div className="w-3 h-3 border-2 border-amber-400/40 border-t-amber-400 rounded-full animate-spin" />
          <span className="text-[10px] font-mono" style={{ color: 'var(--zcc-kinpaku)' }}>Carregando dados...</span>
        </div>
      )}
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Users className="w-5 h-5" style={{ color: 'var(--zcc-kinpaku)' }} />
          <div>
            <h2 className="text-lg font-bold" style={{ color: 'var(--zcc-champagne)' }}>Raio-X de Tenants & Swarms</h2>
            <p className="text-[10px] font-mono" style={{ color: 'var(--zcc-text-muted)' }}>
              Gestão de planos · Monitoramento de agentes · Kill Switch de emergência
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-2 py-1 rounded" style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.15)' }}>
            <div className="w-2 h-2 rounded-full bg-emerald-500" />
            <span className="text-[10px] font-mono text-emerald-400">{activeCount} ATIVOS</span>
          </div>
          {frozenCount > 0 && (
            <div className="flex items-center gap-1.5 px-2 py-1 rounded" style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.15)' }}>
              <PowerOff className="w-2.5 h-2.5 text-red-400" />
              <span className="text-[10px] font-mono text-red-400">{frozenCount} CONGELADOS</span>
            </div>
          )}
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {[
          { label: 'TOTAL TENANTS', value: tenants.length, color: 'var(--zcc-champagne)' },
          { label: 'CHURN RATE', value: `${churnRate}%`, color: parseFloat(churnRate) > 10 ? '#ef4444' : '#10b981' },
          { label: 'MRR TOTAL', value: `R$ ${tenants.reduce((s,t) => s + t.planPrice, 0).toLocaleString('pt-BR')}`, color: 'var(--zcc-kinpaku)' },
          { label: 'BRAIN AVG', value: tenants.filter(t=>t.brainAccuracy > 0).length > 0 ? `${(tenants.filter(t=>t.brainAccuracy > 0).reduce((s,t) => s + t.brainAccuracy, 0) / tenants.filter(t=>t.brainAccuracy > 0).length).toFixed(1)}%` : '—', color: 'var(--zcc-patina)' },
          { label: 'CONGELADOS', value: frozenCount, color: frozenCount > 0 ? '#ef4444' : 'var(--zcc-text-muted)' },
        ].map((stat, i) => (
          <motion.div key={stat.label} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }} className="zcc-panel p-3">
            <div className="zcc-eyebrow">{stat.label}</div>
            <div className="text-lg font-bold font-mono" style={{ color: stat.color }}>{stat.value}</div>
          </motion.div>
        ))}
      </div>

      {/* Swarm Overview */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
        className="zcc-panel p-5">
        <div className="flex items-center gap-2 mb-4">
          <Brain className="w-4 h-4" style={{ color: 'var(--zcc-patina)' }} />
          <h3 className="text-sm font-semibold" style={{ color: 'var(--zcc-champagne)' }}>Monitoramento Global de Agentes (Swarms)</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {Object.entries(swarmStats).map(([key, swarm], i) => {
            const nameMap: Record<string, string> = {
              pousadasSwarm: 'Pousadas Swarm',
              airbnbSwarm: 'Airbnb Swarm',
              financeSwarm: 'Finance Swarm',
            };
            const iconMap: Record<string, string> = {
              pousadasSwarm: '🏠',
              airbnbSwarm: '🏠',
              financeSwarm: '💰',
            };
            const successColor = swarm.successRate >= 97 ? '#10b981' : swarm.successRate >= 93 ? '#f59e0b' : '#ef4444';

            return (
              <motion.div key={key} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + i * 0.05 }}
                className="p-4 rounded" style={{ background: 'var(--zcc-lacquer-sunken)', border: '1px solid rgba(212,168,67,0.08)' }}>
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-base">{iconMap[key]}</span>
                  <span className="text-xs font-bold" style={{ color: 'var(--zcc-champagne)' }}>{nameMap[key]}</span>
                  <span className="zcc-badge-muted">{swarm.agents} agentes</span>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-[10px] font-mono">
                    <span style={{ color: 'var(--zcc-text-muted)' }}>Success Rate</span>
                    <span style={{ color: successColor }} className="font-bold">{swarm.successRate}%</span>
                  </div>
                  <div className="zcc-progress-track">
                    <div className="zcc-progress-fill" style={{ width: `${swarm.successRate}%`, background: successColor }} />
                  </div>
                  <div className="flex justify-between text-[10px] font-mono">
                    <span style={{ color: 'var(--zcc-text-muted)' }}>Latência</span>
                    <span style={{ color: 'var(--zcc-champagne)' }}>{swarm.avgLatency}ms</span>
                  </div>
                  <div className="flex justify-between text-[10px] font-mono">
                    <span style={{ color: 'var(--zcc-text-muted)' }}>Intenções Resolvidas</span>
                    <span style={{ color: 'var(--zcc-patina)' }}>{swarm.intentsResolved.toLocaleString('pt-BR')}</span>
                  </div>
                  {swarm.stuck > 0 && (
                    <div className="flex items-center gap-1 text-[10px] font-mono text-amber-400">
                      <AlertTriangle className="w-3 h-3" />
                      {swarm.stuck} agente(s) engasgando
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      </motion.div>

      {/* Filters & Search */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5" style={{ color: 'var(--zcc-text-muted)' }} />
          <input type="text" value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Buscar tenant por nome ou proprietário..."
            className="zcc-input pl-9"
          />
        </div>
        <div className="flex gap-1.5">
          {(['all', 'pousadas', 'anfitrioes', 'parceiro'] as const).map(n => (
            <button key={n} onClick={() => setFilterNiche(n)}
              className={`zcc-tab ${filterNiche === n ? 'zcc-tab-active' : ''}`}>
              {n === 'all' ? 'Todos' : nicheConfig[n].label}
            </button>
          ))}
        </div>
      </div>

      {/* Tenant Table */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
        className="zcc-panel p-5">
        <div className="overflow-x-auto zcc-scroll">
          <table className="zcc-table w-full">
            <thead>
              <tr>
                <th>Tenant</th>
                <th>Nicho</th>
                <th>Plano</th>
                <th>Status</th>
                <th>Receita</th>
                <th>Cérebro</th>
                <th>Kill Switch</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              <AnimatePresence>
                {filtered.map(tenant => {
                  const niche = nicheConfig[tenant.niche];
                  const brain = brainConfig[tenant.brainStatus];

                  return (
                    <motion.tr key={tenant.id}
                      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                      onClick={() => setSelectedTenant(selectedTenant?.id === tenant.id ? null : tenant)}
                      className="cursor-pointer"
                      style={tenant.killSwitchActive ? { background: 'rgba(239,68,68,0.04)' } : {}}
                    >
                      <td className="px-3 py-2.5">
                        <div>
                          <div className="text-[11px] font-mono font-bold" style={{ color: tenant.killSwitchActive ? 'var(--zcc-text-muted)' : 'var(--zcc-champagne)' }}>
                            {tenant.name}
                          </div>
                          <div className="text-[9px] font-mono" style={{ color: 'var(--zcc-text-muted)' }}>
                            {tenant.owner} · {tenant.city}/{tenant.state}
                          </div>
                        </div>
                      </td>
                      <td className="px-3 py-2.5"><span className={niche.badge}>{niche.label}</span></td>
                      <td className="px-3 py-2.5"><span className="zcc-badge-muted">{tenant.plan}</span></td>
                      <td className="px-3 py-2.5">
                        {tenant.killSwitchActive ? (
                          <span className="zcc-badge-danger">CONGELADO</span>
                        ) : (
                          <span className="zcc-badge-success">{tenant.status}</span>
                        )}
                      </td>
                      <td className="px-3 py-2.5 text-right font-mono" style={{ color: 'var(--zcc-kinpaku)' }}>
                        R$ {tenant.revenue.toLocaleString('pt-BR')}
                      </td>
                      <td className="px-3 py-2.5">
                        {tenant.brainAccuracy > 0 ? (
                          <div className="flex items-center gap-1">
                            <span className="text-[10px] font-mono" style={{ color: brain.color }}>
                              {tenant.brainAccuracy}%
                            </span>
                            <span className={brain.badge} style={{ fontSize: '8px' }}>{brain.label.slice(0, 4)}</span>
                          </div>
                        ) : (
                          <span className="text-[9px] font-mono" style={{ color: 'var(--zcc-text-muted)' }}>N/A</span>
                        )}
                      </td>
                      <td className="px-3 py-2.5">
                        <div className="flex items-center gap-2">
                          {confirmKillId === tenant.id ? (
                            <div className="flex items-center gap-1">
                              <button onClick={(e) => { e.stopPropagation(); toggleKillSwitch(tenant.id, 'Admin override'); }}
                                className="zcc-btn-gold zcc-btn text-[8px] px-2 py-1">
                                Confirmar
                              </button>
                              <button onClick={(e) => { e.stopPropagation(); setConfirmKillId(null); }}
                                className="zcc-btn-ghost zcc-btn text-[8px] px-2 py-1">
                                Cancelar
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                if (tenant.killSwitchActive) {
                                  toggleKillSwitch(tenant.id);
                                } else {
                                  setConfirmKillId(tenant.id);
                                }
                              }}
                              className={`p-1.5 rounded transition-all ${
                                tenant.killSwitchActive
                                  ? 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20'
                                  : 'bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20'
                              }`}
                              title={tenant.killSwitchActive ? 'Reativar tenant' : 'Ativar Kill Switch'}
                            >
                              {tenant.killSwitchActive ? <Power className="w-3 h-3" /> : <PowerOff className="w-3 h-3" />}
                            </button>
                          )}
                        </div>
                      </td>
                      <td className="px-3 py-2.5">
                        <ChevronRight className="w-3 h-3" style={{ color: 'var(--zcc-text-muted)' }} />
                      </td>
                    </motion.tr>
                  );
                })}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && (
          <div className="text-center py-8">
            <Users className="w-6 h-6 mx-auto mb-2" style={{ color: 'var(--zcc-text-muted)' }} />
            <p className="text-xs font-mono" style={{ color: 'var(--zcc-text-muted)' }}>Nenhum tenant encontrado</p>
          </div>
        )}
      </motion.div>

      {/* Selected Tenant Detail */}
      <AnimatePresence>
        {selectedTenant && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }}
            className="zcc-panel p-5" style={{ borderColor: selectedTenant.killSwitchActive ? 'rgba(239,68,68,0.3)' : 'var(--zcc-kinpaku)', borderWidth: 1 }}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="text-lg font-bold" style={{ color: 'var(--zcc-champagne)' }}>{selectedTenant.name}</div>
                <span className={nicheConfig[selectedTenant.niche].badge}>{nicheConfig[selectedTenant.niche].label}</span>
                <span className="zcc-badge-muted">{selectedTenant.plan}</span>
                {selectedTenant.killSwitchActive && <span className="zcc-badge-danger">CONGELADO</span>}
              </div>
              <button onClick={() => setSelectedTenant(null)} className="zcc-btn zcc-btn-ghost text-[10px]">Fechar</button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-4">
              <div className="zcc-panel p-3">
                <div className="zcc-eyebrow">RECEITA</div>
                <div className="text-sm font-bold font-mono" style={{ color: 'var(--zcc-kinpaku)' }}>R$ {selectedTenant.revenue.toLocaleString('pt-BR')}</div>
              </div>
              <div className="zcc-panel p-3">
                <div className="zcc-eyebrow">PLANO</div>
                <div className="text-sm font-bold font-mono" style={{ color: 'var(--zcc-champagne)' }}>R$ {selectedTenant.planPrice}/mês</div>
              </div>
              <div className="zcc-panel p-3">
                <div className="zcc-eyebrow">CÉREBRO</div>
                <div className="text-sm font-bold font-mono" style={{ color: brainConfig[selectedTenant.brainStatus].color }}>
                  {selectedTenant.brainAccuracy > 0 ? `${selectedTenant.brainAccuracy}%` : 'N/A'}
                </div>
              </div>
              <div className="zcc-panel p-3">
                <div className="zcc-eyebrow">CONVERSÃO</div>
                <div className="text-sm font-bold font-mono" style={{ color: 'var(--zcc-patina)' }}>
                  {selectedTenant.conversionRate > 0 ? `${selectedTenant.conversionRate}%` : 'N/A'}
                </div>
              </div>
              <div className="zcc-panel p-3">
                <div className="zcc-eyebrow">WHATSAPP</div>
                <div className="text-sm font-bold font-mono" style={{ color: 'var(--zcc-champagne)' }}>{selectedTenant.whatsapp}</div>
              </div>
            </div>

            {selectedTenant.killSwitchActive && selectedTenant.killSwitchReason && (
              <div className="p-3 rounded mb-4" style={{ background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.15)' }}>
                <div className="text-[10px] font-mono text-red-400 mb-1">⚠️ KILL SWITCH ATIVO</div>
                <div className="text-[10px] font-mono" style={{ color: 'var(--zcc-text-secondary)' }}>
                  Motivo: {selectedTenant.killSwitchReason} · Ativado em: {selectedTenant.killSwitchAt ? new Date(selectedTenant.killSwitchAt).toLocaleString('pt-BR') : '—'}
                </div>
                <div className="text-[9px] font-mono mt-1" style={{ color: 'var(--zcc-text-muted)' }}>
                  Automações de IA estão pausadas. Dados do tenant preservados no banco.
                </div>
              </div>
            )}

            {/* Impersonation Options */}
            <div className="p-3 rounded" style={{ background: 'rgba(74,154,154,0.06)', border: '1px solid rgba(74,154,154,0.12)' }}>
              <div className="text-[10px] font-mono mb-2" style={{ color: 'var(--zcc-patina)' }}>
                <Eye className="w-3 h-3 inline mr-1" />SUPORTE — Impersonation
              </div>
              <div className="flex gap-2">
                <button className="zcc-btn zcc-btn-ghost text-[9px] flex items-center gap-1">
                  <Key className="w-3 h-3" /> Gerar Magic Link
                </button>
                <button className="zcc-btn zcc-btn-ghost text-[9px] flex items-center gap-1">
                  <Eye className="w-3 h-3" /> Shadow Mode
                </button>
              </div>
              <div className="text-[8px] font-mono mt-2" style={{ color: 'var(--zcc-text-muted)' }}>
                Magic Link = acesso temporário ao DDC do cliente · Shadow Mode = visualização espelhada sem interação
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
