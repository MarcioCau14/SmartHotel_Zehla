'use client';

import { useState, useMemo } from 'react';
import {
  Building2,
  Users,
  DollarSign,
  Brain,
  Wifi,
  WifiOff,
  Search,
  ChevronRight,
  Star,
  TrendingUp,
  MessageSquare,
  ArrowUp,
  ArrowDown,
} from 'lucide-react';
import {
  tenClientFriends,
  globalMetrics,
  type ClientFriend,
} from '@/lib/zcc-clients-data';

// ---------------------------------------------------------------------------
// Config maps
// ---------------------------------------------------------------------------

const statusConfig: Record<
  ClientFriend['status'],
  { label: string; badgeClass: string }
> = {
  BETA_TESTER: {
    label: 'Beta Tester',
    badgeClass: 'zcc-badge-gold',
  },
  EARLY_ADOPTER: {
    label: 'Early Adopter',
    badgeClass: 'zcc-badge-patina',
  },
  ACTIVE: {
    label: 'Ativo',
    badgeClass: 'zcc-badge-success',
  },
  ONBOARDING: {
    label: 'Onboarding',
    badgeClass: 'zcc-badge-muted',
  },
};

const brainConfig: Record<
  ClientFriend['brainStatus'],
  { label: string; icon: typeof Brain; badgeClass: string; color: string }
> = {
  learning: {
    label: 'Aprendendo',
    icon: WifiOff,
    badgeClass: 'zcc-badge-gold',
    color: '#d4a843',
  },
  calibrated: {
    label: 'Calibrado',
    icon: Wifi,
    badgeClass: 'zcc-badge-patina',
    color: '#4a9a9a',
  },
  optimizing: {
    label: 'Otimizando',
    icon: Brain,
    badgeClass: 'zcc-badge-success',
    color: '#4ade80',
  },
};

const planLabels: Record<ClientFriend['plan'], string> = {
  gratuito: 'Gratuito',
  lite: 'Lite',
  pro: 'Pro',
  max: 'Max',
  parceiro: 'Parceiro Zélla',
};

const planPrices: Record<ClientFriend['plan'], string> = {
  gratuito: 'R$0',
  lite: 'R$197/mês',
  pro: 'R$397/mês',
  max: 'R$797/mês',
  parceiro: 'R$247/mês × 24m',
};

type SortKey =
  | 'name'
  | 'plan'
  | 'status'
  | 'rooms'
  | 'totalReservations'
  | 'monthlyRevenue'
  | 'conversionRate'
  | 'occupancyRate'
  | 'avgRating'
  | 'brainStatus'
  | 'lastActivity';

const filterOptions = [
  { value: 'ALL', label: 'Todos' },
  { value: 'BETA_TESTER', label: 'Beta Testers' },
  { value: 'EARLY_ADOPTER', label: 'Early Adopters' },
] as const;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function fmtCurrency(value: number): string {
  return value.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
}

function fmtNumber(value: number): string {
  return value.toLocaleString('pt-BR');
}

function fmtRelativeTime(iso: string): string {
  const now = new Date('2026-06-18T12:00:00Z');
  const then = new Date(iso);
  const diffMs = now.getTime() - then.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 60) return `${diffMin}min atrás`;
  const diffH = Math.floor(diffMin / 60);
  if (diffH < 24) return `${diffH}h atrás`;
  const diffD = Math.floor(diffH / 24);
  return `${diffD}d atrás`;
}

function brainAccuracyColor(value: number): string {
  if (value >= 90) return 'text-[#4ade80]';
  if (value >= 75) return 'text-[#d4a843]';
  return 'text-[#f87171]';
}

function brainAccuracyBarColor(value: number): string {
  if (value >= 90) return 'bg-[#4ade80]';
  if (value >= 75) return 'bg-[#d4a843]';
  return 'bg-[#f87171]';
}

function occupancyBarColor(value: number): string {
  if (value >= 85) return 'bg-[#4ade80]';
  if (value >= 70) return 'bg-[#d4a843]';
  return 'bg-[#f87171]';
}

function occupancyTextColor(value: number): string {
  if (value >= 85) return 'text-[#4ade80]';
  if (value >= 70) return 'text-[#d4a843]';
  return 'text-[#f87171]';
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function ClientOverview() {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<string>('ALL');
  const [selected, setSelected] = useState<ClientFriend | null>(null);
  const [sortKey, setSortKey] = useState<SortKey>('name');
  const [sortAsc, setSortAsc] = useState(true);

  // ---------- filtering & sorting ----------
  const filtered = useMemo(() => {
    let list = [...tenClientFriends];

    if (filter !== 'ALL') {
      list = list.filter((c) => c.status === filter);
    }

    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.owner?.toLowerCase().includes(q) ||
          c.city.toLowerCase().includes(q)
      );
    }

    list.sort((a, b) => {
      let av: string | number;
      let bv: string | number;
      switch (sortKey) {
        case 'name':
          av = a.name;
          bv = b.name;
          break;
        case 'plan':
          av = a.plan;
          bv = b.plan;
          break;
        case 'status':
          av = a.status;
          bv = b.status;
          break;
        case 'rooms':
          av = a.rooms;
          bv = b.rooms;
          break;
        case 'totalReservations':
          av = a.totalReservations;
          bv = b.totalReservations;
          break;
        case 'monthlyRevenue':
          av = a.monthlyRevenue;
          bv = b.monthlyRevenue;
          break;
        case 'conversionRate':
          av = a.conversionRate;
          bv = b.conversionRate;
          break;
        case 'occupancyRate':
          av = a.occupancyRate;
          bv = b.occupancyRate;
          break;
        case 'avgRating':
          av = a.avgRating;
          bv = b.avgRating;
          break;
        case 'brainStatus':
          av = a.brainStatus;
          bv = b.brainStatus;
          break;
        case 'lastActivity':
          av = a.lastActivity;
          bv = b.lastActivity;
          break;
        default:
          return 0;
      }
      if (av < bv) return sortAsc ? -1 : 1;
      if (av > bv) return sortAsc ? 1 : -1;
      return 0;
    });

    return list;
  }, [search, filter, sortKey, sortAsc]);

  function handleSort(key: SortKey) {
    if (sortKey === key) {
      setSortAsc(!sortAsc);
    } else {
      setSortKey(key);
      setSortAsc(true);
    }
  }

  // ---------- render ----------
  return (
    <div className="min-h-screen text-[var(--zcc-champagne)] font-sans">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* ─── Page Header ─── */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-[var(--zcc-champagne)] flex items-center gap-2">
              <Building2 className="w-6 h-6 text-[#d4a843]" />
              Visão Geral de Clientes
            </h1>
            <p className="text-sm text-[var(--zcc-text-muted)] mt-1">
              Monitoramento multi-tenant · {globalMetrics.totalClients} clientes ativos · Beta ZEHLA
            </p>
          </div>
          <span className="zcc-badge-success inline-flex items-center gap-1.5 self-start">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#4ade80] animate-pulse" />
            Tempo real
          </span>
        </div>

        {/* ─── Global Summary Bar ─── */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <SummaryCard
            icon={<Building2 className="w-4 h-4" />}
            label="Total Clientes"
            value={String(globalMetrics.totalClients)}
          />
          <SummaryCard
            icon={<Users className="w-4 h-4" />}
            label="Quartos Totais"
            value={fmtNumber(globalMetrics.totalRooms)}
          />
          <SummaryCard
            icon={<MessageSquare className="w-4 h-4" />}
            label="Reservas Mês"
            value={fmtNumber(globalMetrics.totalReservations)}
          />
          <SummaryCard
            icon={<DollarSign className="w-4 h-4" />}
            label="Receita Mensal"
            value={`R$${fmtNumber(globalMetrics.totalRevenue / 1000)}k`}
          />
          <SummaryCard
            icon={<Brain className="w-4 h-4" />}
            label="Msgs IA"
            value={fmtNumber(globalMetrics.totalMessagesProcessed)}
          />
          <SummaryCard
            icon={<TrendingUp className="w-4 h-4" />}
            label="Crescimento"
            value={`+${globalMetrics.monthlyGrowth}%`}
          />
        </div>

        {/* ─── Search & Filter Bar ─── */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
          <div className="relative flex-1 w-full sm:max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--zcc-text-muted)]" />
            <input
              type="text"
              placeholder="Buscar por nome, proprietário ou cidade…"
              className="zcc-input pl-9 w-full text-sm"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-1.5 flex-wrap">
            {filterOptions.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setFilter(opt.value)}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                  filter === opt.value
                    ? 'bg-[#d4a843]/15 text-[#d4a843] border border-[#d4a843]/30'
                    : 'text-[var(--zcc-text-muted)] border border-[var(--zcc-hairline)] hover:text-[var(--zcc-champagne)] hover:border-[var(--zcc-champagne)]/20'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
          <div className="ml-auto text-xs text-[var(--zcc-text-muted)]">
            {filtered.length} de {tenClientFriends.length} clientes
          </div>
        </div>

        {/* ─── Client Table ─── */}
        <div className="zcc-panel overflow-hidden">
          <div className="zcc-scroll overflow-x-auto">
            <table className="zcc-table w-full text-sm">
              <thead>
                <tr className="text-left">
                  <SortableTh
                    label="Cliente"
                    active={sortKey === 'name'}
                    asc={sortAsc}
                    onClick={() => handleSort('name')}
                    className="pl-4"
                  />
                  <SortableTh
                    label="Plano"
                    active={sortKey === 'plan'}
                    asc={sortAsc}
                    onClick={() => handleSort('plan')}
                  />
                  <SortableTh
                    label="Status"
                    active={sortKey === 'status'}
                    asc={sortAsc}
                    onClick={() => handleSort('status')}
                  />
                  <SortableTh
                    label="Quartos"
                    active={sortKey === 'rooms'}
                    asc={sortAsc}
                    onClick={() => handleSort('rooms')}
                    numeric
                  />
                  <SortableTh
                    label="Reservas"
                    active={sortKey === 'totalReservations'}
                    asc={sortAsc}
                    onClick={() => handleSort('totalReservations')}
                    numeric
                  />
                  <SortableTh
                    label="Receita"
                    active={sortKey === 'monthlyRevenue'}
                    asc={sortAsc}
                    onClick={() => handleSort('monthlyRevenue')}
                    numeric
                  />
                  <SortableTh
                    label="Conversão"
                    active={sortKey === 'conversionRate'}
                    asc={sortAsc}
                    onClick={() => handleSort('conversionRate')}
                    numeric
                  />
                  <SortableTh
                    label="Ocupação"
                    active={sortKey === 'occupancyRate'}
                    asc={sortAsc}
                    onClick={() => handleSort('occupancyRate')}
                    numeric
                  />
                  <SortableTh
                    label="Rating"
                    active={sortKey === 'avgRating'}
                    asc={sortAsc}
                    onClick={() => handleSort('avgRating')}
                    numeric
                  />
                  <SortableTh
                    label="Cérebro"
                    active={sortKey === 'brainStatus'}
                    asc={sortAsc}
                    onClick={() => handleSort('brainStatus')}
                  />
                  <SortableTh
                    label="Última Atividade"
                    active={sortKey === 'lastActivity'}
                    asc={sortAsc}
                    onClick={() => handleSort('lastActivity')}
                    className="pr-4"
                  />
                  <th className="px-2 py-3 w-8" />
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 && (
                  <tr>
                    <td
                      colSpan={12}
                      className="text-center py-12 text-[var(--zcc-text-muted)] text-sm"
                    >
                      Nenhum cliente encontrado.
                    </td>
                  </tr>
                )}
                {filtered.map((client) => {
                  const isSelected = selected?.id === client.id;
                  const sCfg = statusConfig[client.status];
                  const bCfg = brainConfig[client.brainStatus];
                  const BrainIcon = bCfg.icon;
                  return (
                    <tr
                      key={client.id}
                      onClick={() =>
                        setSelected(isSelected ? null : client)
                      }
                      className={`border-b border-[var(--zcc-hairline)] transition-colors cursor-pointer ${
                        isSelected
                          ? 'bg-[#d4a843]/[0.07]'
                          : 'hover:bg-[var(--zcc-lacquer-raised)]'
                      }`}
                    >
                      {/* Avatar + Name */}
                      <td className="pl-4 py-3">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-8 h-8 rounded-lg bg-gradient-to-br ${client.color} flex items-center justify-center text-xs font-bold text-white shrink-0`}
                          >
                            {client.avatar}
                          </div>
                          <div className="min-w-0">
                            <p className="font-medium text-[var(--zcc-champagne)] truncate">
                              {client.name}
                            </p>
                            <p className="text-xs text-[var(--zcc-text-muted)] truncate">
                              {client.city}/{client.state}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Plan */}
                      <td className="py-3 px-3">
                        <span className="text-xs font-medium text-[var(--zcc-text-secondary)] capitalize">
                          {planLabels[client.plan]}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="py-3 px-3">
                        <span className={`zcc-badge ${sCfg.badgeClass}`}>
                          {sCfg.label}
                        </span>
                      </td>

                      {/* Rooms */}
                      <td className="py-3 px-3 text-right tabular-nums text-[var(--zcc-text-secondary)]">
                        {client.rooms}
                      </td>

                      {/* Reservations */}
                      <td className="py-3 px-3 text-right tabular-nums text-[var(--zcc-text-secondary)]">
                        {fmtNumber(client.totalReservations)}
                      </td>

                      {/* Revenue */}
                      <td className="py-3 px-3 text-right tabular-nums text-[#d4a843] font-medium">
                        {fmtCurrency(client.monthlyRevenue)}
                      </td>

                      {/* Conversion */}
                      <td className="py-3 px-3 text-right tabular-nums text-[var(--zcc-text-secondary)]">
                        {client.conversionRate}%
                      </td>

                      {/* Occupancy */}
                      <td className="py-3 px-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <div className="zcc-progress-track w-12 h-1.5">
                            <div
                              className={`zcc-progress-fill h-full ${occupancyBarColor(client.occupancyRate)}`}
                              style={{ width: `${client.occupancyRate}%` }}
                            />
                          </div>
                          <span className="tabular-nums text-xs text-[var(--zcc-text-muted)] w-7 text-right">
                            {client.occupancyRate}%
                          </span>
                        </div>
                      </td>

                      {/* Rating */}
                      <td className="py-3 px-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Star className="w-3 h-3 text-[#d4a843] fill-[#d4a843]" />
                          <span className="tabular-nums text-[var(--zcc-text-secondary)]">
                            {client.avgRating}
                          </span>
                        </div>
                      </td>

                      {/* Brain status */}
                      <td className="py-3 px-3">
                        <span className={`zcc-badge ${bCfg.badgeClass} inline-flex items-center gap-1`}>
                          <BrainIcon className="w-3 h-3" />
                          {bCfg.label}
                        </span>
                      </td>

                      {/* Last activity */}
                      <td className="py-3 px-3 pr-4 text-xs text-[var(--zcc-text-muted)] whitespace-nowrap">
                        {fmtRelativeTime(client.lastActivity)}
                      </td>

                      {/* Chevron */}
                      <td className="py-3 px-2">
                        <ChevronRight
                          className={`w-4 h-4 transition-transform ${
                            isSelected
                              ? 'rotate-90 text-[#d4a843]'
                              : 'text-[var(--zcc-text-muted)]'
                          }`}
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* ─── Selected Client Detail Panel ─── */}
        {selected && <ClientDetailPanel client={selected} onClose={() => setSelected(null)} />}
      </div>
    </div>
  );
}

// ===========================================================================
// Sub-components
// ===========================================================================

function SummaryCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="zcc-panel px-4 py-3 flex flex-col gap-1">
      <div className="flex items-center gap-2">
        <span className="text-[#d4a843]">{icon}</span>
        <span className="zcc-eyebrow">{label}</span>
      </div>
      <p className="zcc-stat-value">
        {value}
      </p>
    </div>
  );
}

function SortableTh({
  label,
  active,
  asc,
  onClick,
  numeric,
  className = '',
}: {
  label: string;
  active: boolean;
  asc: boolean;
  onClick: () => void;
  numeric?: boolean;
  className?: string;
}) {
  return (
    <th
      className={`px-3 py-3 zcc-eyebrow cursor-pointer select-none hover:text-[var(--zcc-champagne)] transition-colors whitespace-nowrap ${className}`}
      onClick={onClick}
    >
      <div
        className={`flex items-center gap-1 ${numeric ? 'justify-end' : ''}`}
      >
        {label}
        {active && (
          <span className="text-[#d4a843]">
            {asc
              ? <ArrowUp className="w-3 h-3" />
              : <ArrowDown className="w-3 h-3" />
            }
          </span>
        )}
      </div>
    </th>
  );
}

function ClientDetailPanel({
  client,
  onClose,
}: {
  client: ClientFriend;
  onClose: () => void;
}) {
  const sCfg = statusConfig[client.status];
  const bCfg = brainConfig[client.brainStatus];
  const BrainIcon = bCfg.icon;

  const miniMetrics = [
    {
      label: 'Reservas IA',
      value: fmtNumber(client.totalReservations),
      icon: <MessageSquare className="w-4 h-4 text-[#4a9a9a]" />,
    },
    {
      label: 'Msgs processadas',
      value: fmtNumber(client.aiMessagesProcessed),
      icon: <Brain className="w-4 h-4 text-[#d4a843]" />,
    },
    {
      label: 'Ajustes de preço hoje',
      value: String(client.priceAdjustmentsToday),
      icon: <DollarSign className="w-4 h-4 text-[#d4a843]" />,
    },
    {
      label: 'Respostas automáticas 24h',
      value: String(client.automatedReplies24h),
      icon: <Wifi className="w-4 h-4 text-[#4a9a9a]" />,
    },
  ];

  return (
    <div className="zcc-panel overflow-hidden border-[#d4a843]/20 animate-in slide-in-from-top-2 duration-200">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--zcc-hairline)]">
        <div className="flex items-center gap-3">
          <div
            className={`w-10 h-10 rounded-xl bg-gradient-to-br ${client.color} flex items-center justify-center text-sm font-bold text-white shrink-0`}
          >
            {client.avatar}
          </div>
          <div>
            <h2 className="text-base font-semibold text-[var(--zcc-champagne)]">
              {client.name}
            </h2>
            <p className="text-xs text-[var(--zcc-text-muted)]">
              {client.city}, {client.state}{client.owner ? ` · ${client.owner}` : ''}
            </p>
          </div>
          <span className={`zcc-badge ${sCfg.badgeClass} ml-2`}>
            {sCfg.label}
          </span>
        </div>
        <button
          onClick={onClose}
          className="text-xs text-[var(--zcc-text-muted)] hover:text-[var(--zcc-champagne)] transition-colors px-2 py-1 rounded hover:bg-[var(--zcc-lacquer-raised)]"
        >
          ✕ Fechar
        </button>
      </div>

      <div className="p-5 grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ── Left: Client info + Plan ── */}
        <div className="space-y-4">
          <div>
            <h3 className="zcc-eyebrow mb-3">
              Informações do Cliente
            </h3>
            <div className="space-y-2 text-sm">
              <InfoRow label="CNPJ" value={client.cnpj} />
              <InfoRow label="WhatsApp" value={client.whatsapp ?? '—'} />
              <InfoRow label="Email" value={client.email ?? '—'} />
              <InfoRow label="Proprietário" value={client.owner ?? '—'} />
              <InfoRow
                label="Ativado em"
                value={new Date(client.activatedAt).toLocaleDateString('pt-BR')}
              />
            </div>
          </div>

          <div>
            <h3 className="zcc-eyebrow mb-3">
              Plano Atual
            </h3>
            <div className="rounded-lg border border-[var(--zcc-hairline)] bg-[var(--zcc-lacquer-sunken)] p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-[var(--zcc-champagne)] capitalize">
                    {planLabels[client.plan]}
                  </p>
                  <p className="text-xs text-[var(--zcc-text-muted)] mt-0.5">
                    {planPrices[client.plan]}
                  </p>
                </div>
                <span className="zcc-badge-success">Vigente</span>
              </div>
            </div>
          </div>

          <a
            href="/dashboard"
            className="block w-full text-center py-2.5 rounded-lg bg-[#d4a843] hover:bg-[#d4a843]/80 text-[#0a0a0c] text-sm font-medium transition-colors"
          >
            Ver Dashboard do Cliente
          </a>
        </div>

        {/* ── Center: Mini metrics ── */}
        <div>
          <h3 className="zcc-eyebrow mb-3">
            Métricas Operacionais
          </h3>
          <div className="grid grid-cols-2 gap-3">
            {miniMetrics.map((m) => (
              <div
                key={m.label}
                className="rounded-lg border border-[var(--zcc-hairline)] bg-[var(--zcc-lacquer-sunken)] p-3 flex flex-col gap-1.5"
              >
                <div className="flex items-center gap-1.5">
                  {m.icon}
                  <span className="zcc-eyebrow normal-case">{m.label}</span>
                </div>
                <p className="zcc-stat-value">
                  {m.value}
                </p>
              </div>
            ))}
          </div>

          {/* Extra performance numbers */}
          <div className="mt-4 grid grid-cols-2 gap-3">
            <div className="rounded-lg border border-[var(--zcc-hairline)] bg-[var(--zcc-lacquer-sunken)] p-3">
              <span className="zcc-eyebrow normal-case">Conversão</span>
              <p className="zcc-stat-value text-[#4a9a9a]">
                {client.conversionRate}%
              </p>
            </div>
            <div className="rounded-lg border border-[var(--zcc-hairline)] bg-[var(--zcc-lacquer-sunken)] p-3">
              <span className="zcc-eyebrow normal-case">Ocupação</span>
              <p className="zcc-stat-value">
                {client.occupancyRate}%
              </p>
            </div>
            <div className="rounded-lg border border-[var(--zcc-hairline)] bg-[var(--zcc-lacquer-sunken)] p-3">
              <span className="zcc-eyebrow normal-case">Receita Mensal</span>
              <p className="zcc-stat-value text-[#d4a843]">
                {fmtCurrency(client.monthlyRevenue)}
              </p>
            </div>
            <div className="rounded-lg border border-[var(--zcc-hairline)] bg-[var(--zcc-lacquer-sunken)] p-3">
              <span className="zcc-eyebrow normal-case">Rating Médio</span>
              <div className="flex items-center gap-1 mt-1">
                <Star className="w-4 h-4 text-[#d4a843] fill-[#d4a843]" />
                <span className="zcc-stat-value">
                  {client.avgRating}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* ── Right: AI Brain ── */}
        <div className="space-y-4">
          <div>
            <h3 className="zcc-eyebrow mb-3">
              Cérebro ZÉLLA
            </h3>
            <div className="rounded-lg border border-[var(--zcc-hairline)] bg-[var(--zcc-lacquer-sunken)] p-4 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <BrainIcon className="w-5 h-5" style={{ color: bCfg.color }} />
                  <span className="text-sm font-medium text-[var(--zcc-champagne)]">
                    {bCfg.label}
                  </span>
                </div>
                <span className={`zcc-badge ${bCfg.badgeClass}`}>
                  Ativo
                </span>
              </div>

              {/* Brain Accuracy */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs text-[var(--zcc-text-muted)]">
                    Precisão do modelo
                  </span>
                  <span className={`text-sm font-bold tabular-nums ${brainAccuracyColor(client.brainAccuracy)}`}>
                    {client.brainAccuracy}%
                  </span>
                </div>
                <div className="zcc-progress-track h-2">
                  <div
                    className={`zcc-progress-fill h-full ${brainAccuracyBarColor(client.brainAccuracy)}`}
                    style={{ width: `${client.brainAccuracy}%` }}
                  />
                </div>
              </div>

              {/* Occupancy */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs text-[var(--zcc-text-muted)]">
                    Taxa de ocupação
                  </span>
                  <span className={`text-sm font-bold tabular-nums ${occupancyTextColor(client.occupancyRate)}`}>
                    {client.occupancyRate}%
                  </span>
                </div>
                <div className="zcc-progress-track h-2">
                  <div
                    className={`zcc-progress-fill h-full ${occupancyBarColor(client.occupancyRate)}`}
                    style={{ width: `${client.occupancyRate}%` }}
                  />
                </div>
              </div>

              {/* Conversion */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs text-[var(--zcc-text-muted)]">
                    Taxa de conversão
                  </span>
                  <span className="text-sm font-bold tabular-nums text-[#4a9a9a]">
                    {client.conversionRate}%
                  </span>
                </div>
                <div className="zcc-progress-track h-2">
                  <div
                    className="zcc-progress-fill h-full bg-[#4a9a9a]"
                    style={{ width: `${client.conversionRate}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Recent Activity Summary */}
          <div>
            <h3 className="zcc-eyebrow mb-3">
              Atividade Recente
            </h3>
            <div className="rounded-lg border border-[var(--zcc-hairline)] bg-[var(--zcc-lacquer-sunken)] p-4 space-y-3">
              <ActivityLine
                label="Última interação IA"
                value={fmtRelativeTime(client.lastActivity)}
                color="#4a9a9a"
              />
              <ActivityLine
                label="Ajustes de preço hoje"
                value={`${client.priceAdjustmentsToday} ajustes`}
                color="#d4a843"
              />
              <ActivityLine
                label="Respostas automáticas (24h)"
                value={`${client.automatedReplies24h} msgs`}
                color="#4a9a9a"
              />
              <ActivityLine
                label="Quartos monitorados"
                value={`${client.rooms} quartos`}
                color="var(--zcc-text-muted)"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-4">
      <span className="text-[var(--zcc-text-muted)] text-xs shrink-0">{label}</span>
      <span className="text-[var(--zcc-text-secondary)] text-xs text-right truncate">{value}</span>
    </div>
  );
}

function ActivityLine({
  label,
  value,
  color,
}: {
  label: string;
  value: string;
  color: string;
}) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <span
          className="w-1.5 h-1.5 rounded-full shrink-0"
          style={{ backgroundColor: color }}
        />
        <span className="text-xs text-[var(--zcc-text-muted)]">{label}</span>
      </div>
      <span className="text-xs text-[var(--zcc-text-secondary)] font-medium tabular-nums">
        {value}
      </span>
    </div>
  );
}