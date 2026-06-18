'use client';

import { useState, useMemo } from 'react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
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
  { label: string; className: string }
> = {
  BETA_TESTER: {
    label: 'Beta Tester',
    className:
      'bg-amber-500/15 text-amber-400 border border-amber-500/25',
  },
  EARLY_ADOPTER: {
    label: 'Early Adopter',
    className:
      'bg-blue-500/15 text-blue-400 border border-blue-500/25',
  },
  ACTIVE: {
    label: 'Ativo',
    className:
      'bg-emerald-500/15 text-emerald-400 border border-emerald-500/25',
  },
  ONBOARDING: {
    label: 'Onboarding',
    className:
      'bg-zinc-500/15 text-zinc-400 border border-zinc-500/25',
  },
};

const brainConfig: Record<
  ClientFriend['brainStatus'],
  { label: string; icon: typeof Brain; className: string }
> = {
  learning: {
    label: 'Aprendendo',
    icon: WifiOff,
    className:
      'bg-yellow-500/15 text-yellow-400 border border-yellow-500/25',
  },
  calibrated: {
    label: 'Calibrado',
    icon: Wifi,
    className:
      'bg-blue-500/15 text-blue-400 border border-blue-500/25',
  },
  optimizing: {
    label: 'Otimizando',
    icon: Brain,
    className:
      'bg-emerald-500/15 text-emerald-400 border border-emerald-500/25',
  },
};

const planLabels: Record<ClientFriend['plan'], string> = {
  fundador: 'Fundador',
  lite: 'Lite',
  pro: 'Pro',
  max: 'Max',
};

const planPrices: Record<ClientFriend['plan'], string> = {
  fundador: 'R$0 (Beta)',
  lite: 'R$97/mês',
  pro: 'R$197/mês',
  max: 'R$397/mês',
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
  if (value >= 90) return 'text-emerald-400';
  if (value >= 75) return 'text-yellow-400';
  return 'text-red-400';
}

function brainAccuracyBarColor(value: number): string {
  if (value >= 90) return '[&>div]:bg-emerald-500';
  if (value >= 75) return '[&>div]:bg-yellow-500';
  return '[&>div]:bg-red-500';
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

    // status filter
    if (filter !== 'ALL') {
      list = list.filter((c) => c.status === filter);
    }

    // search
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.owner.toLowerCase().includes(q) ||
          c.city.toLowerCase().includes(q)
      );
    }

    // sort
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

  // ---------- sort handler ----------
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
    <div className="min-h-screen bg-[#0a0a0a] text-zinc-100 font-sans">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* ─── Page Header ─── */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
              <Building2 className="w-6 h-6 text-emerald-400" />
              Visão Geral de Clientes
            </h1>
            <p className="text-sm text-zinc-500 mt-1">
              Monitoramento multi-tenant · {globalMetrics.totalClients} clientes ativos · Beta ZEHLA
            </p>
          </div>
          <Badge
            className="bg-emerald-500/15 text-emerald-400 border border-emerald-500/25 px-3 py-1 text-xs font-medium self-start"
          >
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400 mr-1.5 animate-pulse" />
            Tempo real
          </Badge>
        </div>

        {/* ─── Global Summary Bar ─── */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <SummaryCard
            icon={<Building2 className="w-4 h-4" />}
            label="Total Clientes"
            value={String(globalMetrics.totalClients)}
            accent="emerald"
          />
          <SummaryCard
            icon={<Users className="w-4 h-4" />}
            label="Quartos Totais"
            value={fmtNumber(globalMetrics.totalRooms)}
            accent="emerald"
          />
          <SummaryCard
            icon={<MessageSquare className="w-4 h-4" />}
            label="Reservas Mês"
            value={fmtNumber(globalMetrics.totalReservations)}
            accent="emerald"
          />
          <SummaryCard
            icon={<DollarSign className="w-4 h-4" />}
            label="Receita Mensal"
            value={`R$${fmtNumber(globalMetrics.totalRevenue / 1000)}k`}
            accent="emerald"
          />
          <SummaryCard
            icon={<Brain className="w-4 h-4" />}
            label="Msgs IA"
            value={fmtNumber(globalMetrics.totalMessagesProcessed)}
            accent="emerald"
          />
          <SummaryCard
            icon={<TrendingUp className="w-4 h-4" />}
            label="Crescimento"
            value={`+${globalMetrics.monthlyGrowth}%`}
            accent="green"
          />
        </div>

        {/* ─── Search & Filter Bar ─── */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
          <div className="relative flex-1 w-full sm:max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
            <Input
              placeholder="Buscar por nome, proprietário ou cidade…"
              className="pl-9 bg-[#111111] border-zinc-800 text-sm text-zinc-200 placeholder:text-zinc-600 focus-visible:ring-emerald-500/40 focus-visible:border-emerald-500/40"
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
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    : 'bg-zinc-900/60 text-zinc-500 border border-zinc-800 hover:text-zinc-300 hover:border-zinc-700'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
          <div className="ml-auto text-xs text-zinc-600">
            {filtered.length} de {tenClientFriends.length} clientes
          </div>
        </div>

        {/* ─── Client Table ─── */}
        <div className="rounded-xl border border-zinc-800/70 overflow-hidden bg-[#0e0e0e]">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-800/70 text-left">
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
                      className="text-center py-12 text-zinc-600 text-sm"
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
                      className={`border-b border-zinc-800/40 transition-colors cursor-pointer ${
                        isSelected
                          ? 'bg-emerald-500/[0.07]'
                          : 'hover:bg-zinc-800/30'
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
                            <p className="font-medium text-zinc-100 truncate">
                              {client.name}
                            </p>
                            <p className="text-xs text-zinc-500 truncate">
                              {client.city}/{client.state}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Plan */}
                      <td className="py-3 px-3">
                        <span className="text-xs font-medium text-zinc-400 capitalize">
                          {planLabels[client.plan]}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="py-3 px-3">
                        <Badge className={`${sCfg.className} text-[11px] px-2 py-0 rounded-md font-medium`}>
                          {sCfg.label}
                        </Badge>
                      </td>

                      {/* Rooms */}
                      <td className="py-3 px-3 text-right tabular-nums text-zinc-300">
                        {client.rooms}
                      </td>

                      {/* Reservations */}
                      <td className="py-3 px-3 text-right tabular-nums text-zinc-300">
                        {fmtNumber(client.totalReservations)}
                      </td>

                      {/* Revenue */}
                      <td className="py-3 px-3 text-right tabular-nums text-emerald-400 font-medium">
                        {fmtCurrency(client.monthlyRevenue)}
                      </td>

                      {/* Conversion */}
                      <td className="py-3 px-3 text-right tabular-nums text-zinc-300">
                        {client.conversionRate}%
                      </td>

                      {/* Occupancy */}
                      <td className="py-3 px-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <div className="w-12 h-1.5 rounded-full bg-zinc-800 overflow-hidden">
                            <div
                              className={`h-full rounded-full ${
                                client.occupancyRate >= 85
                                  ? 'bg-emerald-500'
                                  : client.occupancyRate >= 70
                                    ? 'bg-yellow-500'
                                    : 'bg-red-500'
                              }`}
                              style={{
                                width: `${client.occupancyRate}%`,
                              }}
                            />
                          </div>
                          <span className="tabular-nums text-xs text-zinc-400 w-7 text-right">
                            {client.occupancyRate}%
                          </span>
                        </div>
                      </td>

                      {/* Rating */}
                      <td className="py-3 px-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                          <span className="tabular-nums text-zinc-300">
                            {client.avgRating}
                          </span>
                        </div>
                      </td>

                      {/* Brain status */}
                      <td className="py-3 px-3">
                        <Badge className={`${bCfg.className} text-[11px] px-2 py-0 rounded-md font-medium gap-1`}>
                          <BrainIcon className="w-3 h-3" />
                          {bCfg.label}
                        </Badge>
                      </td>

                      {/* Last activity */}
                      <td className="py-3 px-3 pr-4 text-xs text-zinc-500 whitespace-nowrap">
                        {fmtRelativeTime(client.lastActivity)}
                      </td>

                      {/* Chevron */}
                      <td className="py-3 px-2">
                        <ChevronRight
                          className={`w-4 h-4 transition-transform ${
                            isSelected
                              ? 'rotate-90 text-emerald-400'
                              : 'text-zinc-700'
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
  accent,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  accent: 'emerald' | 'green';
}) {
  const colorClass =
    accent === 'emerald' ? 'text-emerald-400' : 'text-green-400';
  return (
    <div className="bg-[#111111] border border-zinc-800/70 rounded-xl px-4 py-3 flex flex-col gap-1">
      <div className="flex items-center gap-2">
        <span className={colorClass}>{icon}</span>
        <span className="text-[11px] font-medium text-zinc-500 uppercase tracking-wider">
          {label}
        </span>
      </div>
      <p className={`text-lg font-bold tabular-nums ${colorClass}`}>
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
      className={`px-3 py-3 text-[11px] font-medium uppercase tracking-wider text-zinc-500 cursor-pointer select-none hover:text-zinc-300 transition-colors whitespace-nowrap ${className}`}
      onClick={onClick}
    >
      <div
        className={`flex items-center gap-1 ${numeric ? 'justify-end' : ''}`}
      >
        {label}
        {active && (
          <span className="text-emerald-400 text-[10px]">
            {asc ? '↑' : '↓'}
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
      icon: <MessageSquare className="w-4 h-4 text-emerald-400" />,
    },
    {
      label: 'Msgs processadas',
      value: fmtNumber(client.aiMessagesProcessed),
      icon: <Brain className="w-4 h-4 text-blue-400" />,
    },
    {
      label: 'Ajustes de preço hoje',
      value: String(client.priceAdjustmentsToday),
      icon: <DollarSign className="w-4 h-4 text-yellow-400" />,
    },
    {
      label: 'Respostas automáticas 24h',
      value: String(client.automatedReplies24h),
      icon: <Wifi className="w-4 h-4 text-emerald-400" />,
    },
  ];

  return (
    <div className="rounded-xl border border-emerald-500/20 bg-[#111111] overflow-hidden animate-in slide-in-from-top-2 duration-200">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-800/70">
        <div className="flex items-center gap-3">
          <div
            className={`w-10 h-10 rounded-xl bg-gradient-to-br ${client.color} flex items-center justify-center text-sm font-bold text-white shrink-0`}
          >
            {client.avatar}
          </div>
          <div>
            <h2 className="text-base font-semibold text-white">
              {client.name}
            </h2>
            <p className="text-xs text-zinc-500">
              {client.city}, {client.state} ·{' '}
              {client.owner}
            </p>
          </div>
          <Badge className={`${sCfg.className} text-[11px] px-2 py-0 rounded-md font-medium ml-2`}>
            {sCfg.label}
          </Badge>
        </div>
        <button
          onClick={onClose}
          className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors px-2 py-1 rounded hover:bg-zinc-800"
        >
          ✕ Fechar
        </button>
      </div>

      <div className="p-5 grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ── Left: Client info + Plan ── */}
        <div className="space-y-4">
          <div>
            <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-3">
              Informações do Cliente
            </h3>
            <div className="space-y-2 text-sm">
              <InfoRow label="CNPJ" value={client.cnpj} />
              <InfoRow label="WhatsApp" value={client.whatsapp} />
              <InfoRow label="Email" value={client.email} />
              <InfoRow label="Proprietário" value={client.owner} />
              <InfoRow label="Ativado em" value={new Date(client.activatedAt).toLocaleDateString('pt-BR')} />
            </div>
          </div>

          <div>
            <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-3">
              Plano Atual
            </h3>
            <div className="bg-[#0a0a0a] border border-zinc-800/70 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-white capitalize">
                    {planLabels[client.plan]}
                  </p>
                  <p className="text-xs text-zinc-500 mt-0.5">
                    {planPrices[client.plan]}
                  </p>
                </div>
                <Badge className="bg-emerald-500/15 text-emerald-400 border border-emerald-500/25 text-[11px] px-2 py-0 rounded-md font-medium">
                  Vigente
                </Badge>
              </div>
            </div>
          </div>

          <a
            href="/dashboard"
            className="block w-full text-center py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-medium transition-colors"
          >
            Ver Dashboard do Cliente
          </a>
        </div>

        {/* ── Center: Mini metrics ── */}
        <div>
          <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-3">
            Métricas Operacionais
          </h3>
          <div className="grid grid-cols-2 gap-3">
            {miniMetrics.map((m) => (
              <div
                key={m.label}
                className="bg-[#0a0a0a] border border-zinc-800/70 rounded-lg p-3 flex flex-col gap-1.5"
              >
                <div className="flex items-center gap-1.5">
                  {m.icon}
                  <span className="text-[11px] text-zinc-500">{m.label}</span>
                </div>
                <p className="text-lg font-bold text-white tabular-nums">
                  {m.value}
                </p>
              </div>
            ))}
          </div>

          {/* Extra performance numbers */}
          <div className="mt-4 grid grid-cols-2 gap-3">
            <div className="bg-[#0a0a0a] border border-zinc-800/70 rounded-lg p-3">
              <span className="text-[11px] text-zinc-500">Conversão</span>
              <p className="text-lg font-bold text-emerald-400 tabular-nums mt-0.5">
                {client.conversionRate}%
              </p>
            </div>
            <div className="bg-[#0a0a0a] border border-zinc-800/70 rounded-lg p-3">
              <span className="text-[11px] text-zinc-500">Ocupação</span>
              <p className="text-lg font-bold text-white tabular-nums mt-0.5">
                {client.occupancyRate}%
              </p>
            </div>
            <div className="bg-[#0a0a0a] border border-zinc-800/70 rounded-lg p-3">
              <span className="text-[11px] text-zinc-500">Receita Mensal</span>
              <p className="text-lg font-bold text-emerald-400 tabular-nums mt-0.5">
                {fmtCurrency(client.monthlyRevenue)}
              </p>
            </div>
            <div className="bg-[#0a0a0a] border border-zinc-800/70 rounded-lg p-3">
              <span className="text-[11px] text-zinc-500">Rating Médio</span>
              <div className="flex items-center gap-1 mt-1">
                <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                <span className="text-lg font-bold text-white tabular-nums">
                  {client.avgRating}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* ── Right: AI Brain ── */}
        <div className="space-y-4">
          <div>
            <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-3">
              Cérebro ZÉLLA
            </h3>
            <div className="bg-[#0a0a0a] border border-zinc-800/70 rounded-lg p-4 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <BrainIcon className="w-5 h-5" style={{ color: bCfg.className.includes('emerald') ? '#34d399' : bCfg.className.includes('blue') ? '#60a5fa' : '#facc15' }} />
                  <span className="text-sm font-medium text-white">
                    {bCfg.label}
                  </span>
                </div>
                <Badge className={`${bCfg.className} text-[11px] px-2 py-0 rounded-md font-medium`}>
                  Ativo
                </Badge>
              </div>

              {/* Accuracy */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs text-zinc-500">
                    Precisão do modelo
                  </span>
                  <span className={`text-sm font-bold tabular-nums ${brainAccuracyColor(client.brainAccuracy)}`}>
                    {client.brainAccuracy}%
                  </span>
                </div>
                <Progress
                  value={client.brainAccuracy}
                  className={`h-2 ${brainAccuracyBarColor(client.brainAccuracy)}`}
                />
              </div>

              {/* Occupancy */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs text-zinc-500">
                    Taxa de ocupação
                  </span>
                  <span className={`text-sm font-bold tabular-nums ${client.occupancyRate >= 85 ? 'text-emerald-400' : client.occupancyRate >= 70 ? 'text-yellow-400' : 'text-red-400'}`}>
                    {client.occupancyRate}%
                  </span>
                </div>
                <div className="w-full h-2 rounded-full bg-zinc-800 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${
                      client.occupancyRate >= 85
                        ? 'bg-emerald-500'
                        : client.occupancyRate >= 70
                          ? 'bg-yellow-500'
                          : 'bg-red-500'
                    }`}
                    style={{ width: `${client.occupancyRate}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Recent Activity Summary */}
          <div>
            <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-3">
              Atividade Recente
            </h3>
            <div className="bg-[#0a0a0a] border border-zinc-800/70 rounded-lg p-4 space-y-3">
              <ActivityLine
                label="Última interação IA"
                value={fmtRelativeTime(client.lastActivity)}
                color="emerald"
              />
              <ActivityLine
                label="Ajustes de preço hoje"
                value={`${client.priceAdjustmentsToday} ajustes`}
                color="yellow"
              />
              <ActivityLine
                label="Respostas automáticas (24h)"
                value={`${client.automatedReplies24h} msgs`}
                color="blue"
              />
              <ActivityLine
                label="Quartos monitorados"
                value={`${client.rooms} quartos`}
                color="zinc"
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
      <span className="text-zinc-500 text-xs shrink-0">{label}</span>
      <span className="text-zinc-300 text-xs text-right truncate">{value}</span>
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
  color: 'emerald' | 'yellow' | 'blue' | 'zinc';
}) {
  const dotColor = {
    emerald: 'bg-emerald-500',
    yellow: 'bg-yellow-500',
    blue: 'bg-blue-500',
    zinc: 'bg-zinc-500',
  }[color];

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <span className={`w-1.5 h-1.5 rounded-full ${dotColor}`} />
        <span className="text-xs text-zinc-500">{label}</span>
      </div>
      <span className="text-xs text-zinc-300 font-medium tabular-nums">{value}</span>
    </div>
  );
}
