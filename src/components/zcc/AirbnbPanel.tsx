'use client';

import { useState } from 'react';
import {
  Home,
  Star,
  MessageSquare,
  TrendingUp,
  Calendar,
  Shield,
  Zap,
  Clock,
  Users,
  ChevronRight,
  Brain,
  Wifi,
  WifiOff,
  BedDouble,
  CheckCircle2,
  AlertCircle,
  ArrowUp,
  ArrowDown,
  DollarSign,
} from 'lucide-react';
import {
  airbnbHosts,
  airbnbMetrics,
  type AirbnbHost,
} from '@/lib/zcc-clients-data';

// ---------------------------------------------------------------------------
// Config maps
// ---------------------------------------------------------------------------

const planConfig: Record<AirbnbHost['plan'], { label: string; badgeClass: string; color: string }> = {
  pro: { label: 'PRO', badgeClass: 'zcc-badge-patina', color: 'var(--zcc-patina)' },
  max: { label: 'MAX', badgeClass: 'zcc-badge-gold', color: '#d4a843' },
};

const statusConfig: Record<AirbnbHost['status'], { label: string; badgeClass: string }> = {
  ACTIVE: { label: 'Ativo', badgeClass: 'zcc-badge-success' },
  ONBOARDING: { label: 'Onboarding', badgeClass: 'zcc-badge-gold' },
  TRIAL: { label: 'Trial', badgeClass: 'zcc-badge-muted' },
};

const brainConfig: Record<AirbnbHost['brainStatus'], { label: string; icon: typeof Brain; badgeClass: string; color: string }> = {
  learning: { label: 'Aprendendo', icon: WifiOff, badgeClass: 'zcc-badge-gold', color: '#d4a843' },
  calibrated: { label: 'Calibrado', icon: Wifi, badgeClass: 'zcc-badge-patina', color: '#4a9a9a' },
  optimizing: { label: 'Otimizando', icon: Brain, badgeClass: 'zcc-badge-success', color: '#4ade80' },
};

type SortKey = 'name' | 'plan' | 'properties' | 'bookings' | 'revenue' | 'responseRate' | 'conversion' | 'brainAccuracy';

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function AirbnbPanel() {
  const [sortKey, setSortKey] = useState<SortKey>('revenue');
  const [sortAsc, setSortAsc] = useState(false);
  const [selectedHost, setSelectedHost] = useState<AirbnbHost | null>(null);

  const handleSort = (key: SortKey) => {
    if (sortKey === key) setSortAsc(!sortAsc);
    else { setSortKey(key); setSortAsc(false); }
  };

  const sorted = [...airbnbHosts].sort((a, b) => {
    let va: number | string, vb: number | string;
    switch (sortKey) {
      case 'name': va = a.name; vb = b.name; break;
      case 'plan': va = a.plan; vb = b.plan; break;
      case 'properties': va = a.properties.length; vb = b.properties.length; break;
      case 'bookings': va = a.totalBookings; vb = b.totalBookings; break;
      case 'revenue': va = a.monthlyRevenue; vb = b.monthlyRevenue; break;
      case 'responseRate': va = a.aiResponseRate; vb = b.aiResponseRate; break;
      case 'conversion': va = a.conversionRate; vb = b.conversionRate; break;
      case 'brainAccuracy': va = a.brainAccuracy; vb = b.brainAccuracy; break;
      default: va = 0; vb = 0;
    }
    if (typeof va === 'string') return sortAsc ? va.localeCompare(vb as string) : (vb as string).localeCompare(va);
    return sortAsc ? (va as number) - (vb as number) : (vb as number) - (va as number);
  });

  return (
    <div className="space-y-6">
      {/* ── Header ── */}
      <div className="flex items-center gap-2 mb-2">
        <Home className="w-5 h-5" style={{ color: 'var(--zcc-patina)' }} />
        <h2 className="text-lg font-bold" style={{ color: 'var(--zcc-champagne)' }}>Zélla AirB — Anfitriões Airbnb</h2>
        <span className="zcc-badge-patina">SOMENTE PRO + MAX</span>
      </div>

      {/* ── KPI Cards ── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="zcc-panel p-4">
          <Users className="w-4 h-4 mb-2" style={{ color: 'var(--zcc-kinpaku)' }} />
          <div className="zcc-stat-value">{airbnbMetrics.totalHosts}</div>
          <div className="zcc-eyebrow mt-1">ANFITRIÕES</div>
        </div>
        <div className="zcc-panel p-4">
          <Home className="w-4 h-4 mb-2" style={{ color: 'var(--zcc-patina)' }} />
          <div className="zcc-stat-value">{airbnbMetrics.totalProperties}</div>
          <div className="zcc-eyebrow mt-1">IMÓVEIS</div>
        </div>
        <div className="zcc-panel p-4">
          <Star className="w-4 h-4 mb-2" style={{ color: '#d4a843' }} />
          <div className="zcc-stat-value" style={{ color: '#d4a843' }}>{airbnbMetrics.superhosts}</div>
          <div className="zcc-eyebrow mt-1">SUPERHOSTS</div>
        </div>
        <div className="zcc-panel p-4">
          <MessageSquare className="w-4 h-4 mb-2" style={{ color: 'var(--zcc-kinpaku)' }} />
          <div className="zcc-stat-value" style={{ color: 'var(--zcc-kinpaku)' }}>{airbnbMetrics.avgAiResponseRate}%</div>
          <div className="zcc-eyebrow mt-1">RESPOSTA IA</div>
        </div>
        <div className="zcc-panel p-4">
          <TrendingUp className="w-4 h-4 mb-2" style={{ color: 'var(--zcc-patina)' }} />
          <div className="zcc-stat-value" style={{ color: 'var(--zcc-patina)' }}>{airbnbMetrics.avgConversionRate}%</div>
          <div className="zcc-eyebrow mt-1">CONVERSÃO</div>
        </div>
        <div className="zcc-panel p-4">
          <Calendar className="w-4 h-4 mb-2" style={{ color: 'var(--zcc-kinpaku)' }} />
          <div className="zcc-stat-value" style={{ color: 'var(--zcc-kinpaku)' }}>{airbnbMetrics.icalSyncEnabled}/{airbnbMetrics.icalSyncTotal}</div>
          <div className="zcc-eyebrow mt-1">ICAL SYNC</div>
        </div>
      </div>

      {/* ── Pricing Rules for Anfitriões ── */}
      <div className="zcc-panel p-5" style={{ borderColor: 'var(--zcc-patina)', borderWidth: 1 }}>
        <div className="flex items-center gap-2 mb-3">
          <Shield className="w-4 h-4" style={{ color: 'var(--zcc-patina)' }} />
          <h3 className="text-sm font-semibold" style={{ color: 'var(--zcc-champagne)' }}>Regras de Pricing — Anfitriões Airbnb</h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="zcc-panel p-3 space-y-2">
            <div className="zcc-eyebrow">PLANOS EXIBIDOS</div>
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <span className="zcc-badge-patina">PRO</span>
                <span className="text-xs" style={{ color: 'var(--zcc-champagne)' }}>R$397/mês</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="zcc-badge-gold">MAX</span>
                <span className="text-xs" style={{ color: 'var(--zcc-champagne)' }}>R$797/mês</span>
              </div>
            </div>
          </div>
          <div className="zcc-panel p-3 space-y-2">
            <div className="zcc-eyebrow">PLANOS OCULTOS</div>
            <div className="space-y-1.5 text-xs" style={{ color: 'var(--zcc-text-muted)' }}>
              <div className="flex items-center gap-2">
                <span className="zcc-badge-muted">TRIAL</span>
                <span>Não exibido para anfitriões</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="zcc-badge-muted">LITE</span>
                <span>Não exibido para anfitriões</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="zcc-badge-muted">PARCEIRO</span>
                <span>Não exibido para anfitriões</span>
              </div>
            </div>
          </div>
          <div className="zcc-panel p-3 space-y-2">
            <div className="zcc-eyebrow">PAGAMENTO</div>
            <div className="text-xs" style={{ color: 'var(--zcc-text-secondary)' }}>
              <div className="flex items-center gap-1.5 mb-1">
                <DollarSign className="w-3 h-3" style={{ color: 'var(--zcc-kinpaku)' }} />
                <span>Exclusivo Cartão de Crédito</span>
              </div>
              <div className="p-1.5 rounded mt-1" style={{ background: 'rgba(74,154,154,0.08)', border: '1px solid rgba(74,154,154,0.15)' }}>
                <span style={{ color: 'var(--zcc-patina)' }}>Anfitriões Airbnb têm perfil premium — só PRO e MAX fazem sentido para multi-propriedade e gestão profissional.</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── MRR Projetado Airbnb ── */}
      <div className="zcc-panel p-5">
        <div className="flex items-center gap-2 mb-3">
          <DollarSign className="w-4 h-4" style={{ color: 'var(--zcc-kinpaku)' }} />
          <h3 className="text-sm font-semibold" style={{ color: 'var(--zcc-champagne)' }}>MRR Airbnb — Projeção</h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="zcc-panel p-3">
            <div className="zcc-eyebrow">MRR ATUAL</div>
            <div className="text-lg font-bold" style={{ color: 'var(--zcc-kinpaku)' }}>
              R$ {(airbnbMetrics.proCount * 397 + airbnbMetrics.maxCount * 797).toLocaleString('pt-BR')}
            </div>
            <div className="text-[10px] mt-1" style={{ color: 'var(--zcc-text-muted)' }}>
              {airbnbMetrics.proCount} PRO × R$397 + {airbnbMetrics.maxCount} MAX × R$797
            </div>
          </div>
          <div className="zcc-panel p-3">
            <div className="zcc-eyebrow">PROJEÇÃO 20 ANFITRIÕES</div>
            <div className="text-lg font-bold" style={{ color: 'var(--zcc-patina)' }}>
              R$ {(10 * 397 + 10 * 797).toLocaleString('pt-BR')}
            </div>
            <div className="text-[10px] mt-1" style={{ color: 'var(--zcc-text-muted)' }}>10 PRO + 10 MAX (meta Q3)</div>
          </div>
          <div className="zcc-panel p-3">
            <div className="zcc-eyebrow">PROJEÇÃO 50 ANFITRIÕES</div>
            <div className="text-lg font-bold" style={{ color: '#d4a843' }}>
              R$ {(25 * 397 + 25 * 797).toLocaleString('pt-BR')}
            </div>
            <div className="text-[10px] mt-1" style={{ color: 'var(--zcc-text-muted)' }}>25 PRO + 25 MAX (meta Q4)</div>
          </div>
        </div>
      </div>

      {/* ── Hosts Table ── */}
      <div className="zcc-panel p-5">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold" style={{ color: 'var(--zcc-champagne)' }}>
            Anfitriões Airbnb — Detalhamento
          </h3>
          <div className="flex items-center gap-2 text-xs" style={{ color: 'var(--zcc-text-muted)' }}>
            <span>{airbnbMetrics.totalHosts} anfitriões</span>
            <span>•</span>
            <span>{airbnbMetrics.totalProperties} imóveis</span>
          </div>
        </div>
        <div className="overflow-x-auto zcc-scroll">
          <table className="zcc-table w-full text-xs">
            <thead>
              <tr>
                <th className="text-left px-3 py-2 cursor-pointer" onClick={() => handleSort('name')}>Anfitrião{sortKey === 'name' && <span className="inline-flex ml-1 opacity-50">{sortAsc ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />}</span>}</th>
                <th className="text-left px-3 py-2">Plano</th>
                <th className="text-left px-3 py-2">Status</th>
                <th className="text-left px-3 py-2 cursor-pointer" onClick={() => handleSort('properties')}>Imóveis{sortKey === 'properties' && <span className="inline-flex ml-1 opacity-50">{sortAsc ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />}</span>}</th>
                <th className="text-right px-3 py-2 cursor-pointer" onClick={() => handleSort('bookings')}>Reservas{sortKey === 'bookings' && <span className="inline-flex ml-1 opacity-50">{sortAsc ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />}</span>}</th>
                <th className="text-right px-3 py-2 cursor-pointer" onClick={() => handleSort('revenue')}>Receita/mês{sortKey === 'revenue' && <span className="inline-flex ml-1 opacity-50">{sortAsc ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />}</span>}</th>
                <th className="text-right px-3 py-2 cursor-pointer" onClick={() => handleSort('responseRate')}>Resp. IA{sortKey === 'responseRate' && <span className="inline-flex ml-1 opacity-50">{sortAsc ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />}</span>}</th>
                <th className="text-right px-3 py-2 cursor-pointer" onClick={() => handleSort('conversion')}>Conv.{sortKey === 'conversion' && <span className="inline-flex ml-1 opacity-50">{sortAsc ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />}</span>}</th>
                <th className="text-right px-3 py-2 cursor-pointer" onClick={() => handleSort('brainAccuracy')}>Cérebro{sortKey === 'brainAccuracy' && <span className="inline-flex ml-1 opacity-50">{sortAsc ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />}</span>}</th>
                <th className="text-center px-3 py-2">iCal</th>
                <th className="text-center px-3 py-2"></th>
              </tr>
            </thead>
            <tbody>
              {sorted.map((host) => {
                const plan = planConfig[host.plan];
                const status = statusConfig[host.status];
                const brain = brainConfig[host.brainStatus];
                const BrainIcon = brain.icon;

                return (
                  <tr key={host.id} className="cursor-pointer" onClick={() => setSelectedHost(selectedHost?.id === host.id ? null : host)}>
                    <td className="px-3 py-2.5">
                      <div className="flex items-center gap-2.5">
                        <div className={`w-7 h-7 rounded-md bg-gradient-to-br ${host.color} flex items-center justify-center text-[10px] font-bold text-white`}>
                          {host.avatar}
                        </div>
                        <div>
                          <div className="font-medium" style={{ color: 'var(--zcc-champagne)' }}>{host.name}</div>
                          <div className="text-[10px]" style={{ color: 'var(--zcc-text-muted)' }}>{host.owner} • {host.city}/{host.state}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-2.5"><span className={plan.badgeClass}>{plan.label}</span></td>
                    <td className="px-3 py-2.5"><span className={status.badgeClass}>{status.label}</span></td>
                    <td className="px-3 py-2.5 text-center" style={{ color: 'var(--zcc-champagne)' }}>{host.properties.length}</td>
                    <td className="px-3 py-2.5 text-right font-mono" style={{ color: 'var(--zcc-champagne)' }}>{host.totalBookings}</td>
                    <td className="px-3 py-2.5 text-right font-mono font-semibold" style={{ color: 'var(--zcc-kinpaku)' }}>R$ {host.monthlyRevenue.toLocaleString('pt-BR')}</td>
                    <td className="px-3 py-2.5 text-right font-mono" style={{ color: host.aiResponseRate >= 90 ? 'var(--zcc-success)' : host.aiResponseRate >= 70 ? '#d4a843' : 'var(--zcc-danger)' }}>
                      {host.aiResponseRate}%
                    </td>
                    <td className="px-3 py-2.5 text-right font-mono" style={{ color: 'var(--zcc-patina)' }}>{host.conversionRate}%</td>
                    <td className="px-3 py-2.5 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <BrainIcon className="w-3 h-3" style={{ color: brain.color }} />
                        <span className="font-mono" style={{ color: brain.color }}>{host.brainAccuracy}%</span>
                      </div>
                    </td>
                    <td className="px-3 py-2.5 text-center">
                      {host.properties.some(p => p.icalSyncEnabled) ? (
                        <CheckCircle2 className="w-3.5 h-3.5 inline" style={{ color: 'var(--zcc-success)' }} />
                      ) : (
                        <AlertCircle className="w-3.5 h-3.5 inline" style={{ color: '#d4a843' }} />
                      )}
                    </td>
                    <td className="px-3 py-2.5">
                      <ChevronRight className="w-3.5 h-3.5" style={{ color: 'var(--zcc-text-muted)' }} />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Selected Host Detail ── */}
      {selectedHost && (
        <div className="zcc-panel p-5" style={{ borderColor: 'var(--zcc-patina)', borderWidth: 1 }}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${selectedHost.color} flex items-center justify-center text-xs font-bold text-white`}>
                {selectedHost.avatar}
              </div>
              <div>
                <h3 className="text-sm font-semibold" style={{ color: 'var(--zcc-champagne)' }}>{selectedHost.name}</h3>
                <div className="text-[10px]" style={{ color: 'var(--zcc-text-muted)' }}>{selectedHost.owner} • {selectedHost.city}/{selectedHost.state}</div>
              </div>
              <span className={planConfig[selectedHost.plan].badgeClass}>{planConfig[selectedHost.plan].label}</span>
              {selectedHost.superhost && <span className="zcc-badge-gold">SUPERHOST</span>}
            </div>
            <button onClick={() => setSelectedHost(null)} className="text-xs zcc-btn-ghost px-2 py-1 rounded">Fechar</button>
          </div>

          {/* Host Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3 mb-4">
            <div className="zcc-panel p-3">
              <div className="zcc-eyebrow">RESERVAS</div>
              <div className="text-sm font-bold" style={{ color: 'var(--zcc-champagne)' }}>{selectedHost.totalBookings}</div>
            </div>
            <div className="zcc-panel p-3">
              <div className="zcc-eyebrow">RECEITA/MÊS</div>
              <div className="text-sm font-bold" style={{ color: 'var(--zcc-kinpaku)' }}>R$ {selectedHost.monthlyRevenue.toLocaleString('pt-BR')}</div>
            </div>
            <div className="zcc-panel p-3">
              <div className="zcc-eyebrow">RESPOSTA IA</div>
              <div className="text-sm font-bold" style={{ color: 'var(--zcc-patina)' }}>{selectedHost.aiResponseRate}%</div>
            </div>
            <div className="zcc-panel p-3">
              <div className="zcc-eyebrow">CONVERSÃO</div>
              <div className="text-sm font-bold" style={{ color: 'var(--zcc-patina)' }}>{selectedHost.conversionRate}%</div>
            </div>
            <div className="zcc-panel p-3">
              <div className="zcc-eyebrow">CANCELAMENTO</div>
              <div className="text-sm font-bold" style={{ color: selectedHost.cancelationRate < 5 ? 'var(--zcc-success)' : '#d4a843' }}>{selectedHost.cancelationRate}%</div>
            </div>
            <div className="zcc-panel p-3">
              <div className="zcc-eyebrow">CÉREBRO</div>
              <div className="text-sm font-bold" style={{ color: brainConfig[selectedHost.brainStatus].color }}>{selectedHost.brainAccuracy}%</div>
            </div>
          </div>

          {/* Properties List */}
          <div className="mb-2">
            <h4 className="text-xs font-semibold mb-2" style={{ color: 'var(--zcc-champagne)' }}>
              <Home className="w-3.5 h-3.5 inline mr-1" style={{ color: 'var(--zcc-patina)' }} />
              Imóveis ({selectedHost.properties.length})
            </h4>
          </div>
          <div className="space-y-2">
            {selectedHost.properties.map((prop) => (
              <div key={prop.id} className="zcc-panel p-3">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <BedDouble className="w-3.5 h-3.5" style={{ color: 'var(--zcc-patina)' }} />
                    <span className="text-xs font-semibold" style={{ color: 'var(--zcc-champagne)' }}>{prop.name}</span>
                    <span className="zcc-badge-muted">{prop.propertyType}</span>
                    {prop.airbnbId && (
                      <span className="text-[10px] font-mono" style={{ color: 'var(--zcc-text-muted)' }}>ID: {prop.airbnbId}</span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px]" style={{ color: 'var(--zcc-text-muted)' }}>iCal</span>
                    {prop.icalSyncEnabled ? (
                      <CheckCircle2 className="w-3.5 h-3.5" style={{ color: 'var(--zcc-success)' }} />
                    ) : (
                      <AlertCircle className="w-3.5 h-3.5" style={{ color: '#d4a843' }} />
                    )}
                  </div>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2 text-[10px]">
                  <div>
                    <span style={{ color: 'var(--zcc-text-muted)' }}>Quartos</span>
                    <div className="font-mono" style={{ color: 'var(--zcc-champagne)' }}>{prop.bedrooms}</div>
                  </div>
                  <div>
                    <span style={{ color: 'var(--zcc-text-muted)' }}>Banheiros</span>
                    <div className="font-mono" style={{ color: 'var(--zcc-champagne)' }}>{prop.bathrooms}</div>
                  </div>
                  <div>
                    <span style={{ color: 'var(--zcc-text-muted)' }}>Hóspedes</span>
                    <div className="font-mono" style={{ color: 'var(--zcc-champagne)' }}>{prop.maxGuests}</div>
                  </div>
                  <div>
                    <span style={{ color: 'var(--zcc-text-muted)' }}>Diária Média</span>
                    <div className="font-mono font-semibold" style={{ color: 'var(--zcc-kinpaku)' }}>R$ {prop.avgNightlyRate}</div>
                  </div>
                  <div>
                    <span style={{ color: 'var(--zcc-text-muted)' }}>Ocupação</span>
                    <div className="font-mono" style={{ color: 'var(--zcc-patina)' }}>{prop.occupancyRate}%</div>
                  </div>
                  <div>
                    <span style={{ color: 'var(--zcc-text-muted)' }}>Avaliação</span>
                    <div className="font-mono flex items-center gap-0.5">
                      <Star className="w-2.5 h-2.5" style={{ color: '#d4a843' }} />
                      <span style={{ color: '#d4a843' }}>{prop.avgRating}</span>
                    </div>
                  </div>
                  <div>
                    <span style={{ color: 'var(--zcc-text-muted)' }}>Resposta</span>
                    <div className="font-mono" style={{ color: prop.responseRate >= 95 ? 'var(--zcc-success)' : '#d4a843' }}>{prop.responseRate}%</div>
                  </div>
                </div>
                {prop.icalSyncEnabled && prop.lastIcalSync && (
                  <div className="text-[10px] mt-2 pt-1.5 border-t" style={{ borderColor: 'var(--zcc-hairline)', color: 'var(--zcc-text-muted)' }}>
                    <Clock className="w-3 h-3 inline mr-1" />
                    Última sincronização iCal: {new Date(prop.lastIcalSync).toLocaleString('pt-BR')}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Channel Manager para Airbnb ── */}
      <div className="zcc-panel p-5">
        <div className="flex items-center gap-2 mb-3">
          <Calendar className="w-4 h-4" style={{ color: 'var(--zcc-patina)' }} />
          <h3 className="text-sm font-semibold" style={{ color: 'var(--zcc-champagne)' }}>Channel Manager — Status Airbnb</h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-3 rounded-lg" style={{ background: 'rgba(16,185,129,0.06)', border: '1px solid rgba(16,185,129,0.12)' }}>
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle2 className="w-4 h-4" style={{ color: 'var(--zcc-success)' }} />
              <span className="text-xs font-semibold" style={{ color: 'var(--zcc-champagne)' }}>iCal Export & Import — Ativo</span>
            </div>
            <div className="text-[10px] space-y-1" style={{ color: 'var(--zcc-text-secondary)' }}>
              <div>→ Exportar calendário para Airbnb via URL iCal</div>
              <div>→ Importar reservas Airbnb automaticamente</div>
              <div>→ Atualização a cada 15 minutos</div>
              <div>→ {airbnbMetrics.icalSyncEnabled} de {airbnbMetrics.totalProperties} imóveis com sync ativo</div>
            </div>
          </div>
          <div className="p-3 rounded-lg" style={{ background: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.12)' }}>
            <div className="flex items-center gap-2 mb-2">
              <Zap className="w-4 h-4" style={{ color: '#d4a843' }} />
              <span className="text-xs font-semibold" style={{ color: 'var(--zcc-champagne)' }}>API Direta Airbnb — Em Desenvolvimento</span>
            </div>
            <div className="text-[10px] space-y-1" style={{ color: 'var(--zcc-text-secondary)' }}>
              <div>→ Conexão direta via API do Airbnb</div>
              <div>→ Sincronização de preços e disponibilidade em tempo real</div>
              <div>→ Será liberado quando testado e validado</div>
              <div>→ Qualidade e estabilidade antes de quantidade</div>
            </div>
          </div>
        </div>
        <div className="text-[10px] flex items-center gap-1.5 mt-3 pt-2 border-t" style={{ color: 'var(--zcc-text-muted)', borderColor: 'var(--zcc-hairline)' }}>
          <Shield className="w-3 h-3" />
          Sem promessas vazias — só mostramos o que está disponível ou em desenvolvimento real
        </div>
      </div>
    </div>
  );
}
