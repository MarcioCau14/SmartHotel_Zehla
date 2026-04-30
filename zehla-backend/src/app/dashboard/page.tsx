'use client';

import { useState, useEffect } from 'react';
import { OnboardingWizard } from '@/components/onboarding/OnboardingWizard';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  Terminal,
  BedDouble,
  CalendarDays,
  Wallet,
  Tag,
  Settings,
  Users,
  DollarSign,
  Clock,
  TicketCheck,
  Percent,
  TrendingUp,
  AlertTriangle,
  CreditCard,
  Sparkles,
  Inbox,
  MessageSquare,
  Table,
  FileSpreadsheet,
  Plus,
  ChevronRight,
  Check,
  Zap,
  Info
} from 'lucide-react';
import { ClientTopNav } from '@/components/client/ClientTopNav';
import { LiveTerminal } from '@/components/client/LiveTerminal';
import { KPICards } from '@/components/dashboard/KPICards';
import { ChartsSection } from '@/components/dashboard/ChartsSection';
import { RoomBoard } from '@/components/dashboard/RoomBoard';
import { Reservations } from '@/components/dashboard/Reservations';
import { PaymentPanel } from '@/components/dashboard/PaymentPanel';
import { Promotions } from '@/components/dashboard/Promotions';
import { SettingsPanel } from '@/components/client/SettingsPanel';
import { FinancialReport } from '@/components/dashboard/FinancialReport';
import { SubscriptionSelector } from '@/components/subscription/SubscriptionSelector';

type TabKey = 'painel' | 'terminal' | 'quartos' | 'reservas' | 'financeiro' | 'relatorios' | 'planilhas' | 'promocoes' | 'configuracoes';

const tabs: { key: TabKey; label: string; icon: typeof LayoutDashboard }[] = [
  { key: 'painel', label: 'Painel', icon: LayoutDashboard },
  { key: 'terminal', label: 'Terminal', icon: Terminal },
  { key: 'quartos', label: 'Quartos', icon: BedDouble },
  { key: 'reservas', label: 'Reservas', icon: CalendarDays },
  { key: 'financeiro', label: 'Financeiro', icon: Wallet },
  { key: 'relatorios', label: 'Relatórios', icon: FileSpreadsheet },
  { key: 'planilhas', label: 'Planilhas', icon: Table },
  { key: 'promocoes', label: 'Promoções', icon: Tag },
  { key: 'configuracoes', label: 'Configurações', icon: Settings },
];

// Category colors for messages
const categoryBadgeColors: Record<string, string> = {
  guest: 'bg-orange-500/20 text-orange-400',
  employee: 'bg-blue-500/20 text-blue-400',
  supplier: 'bg-amber-500/20 text-amber-400',
  alert: 'bg-red-500/20 text-red-400',
};

const categoryLabels: Record<string, string> = {
  guest: 'Hóspede',
  employee: 'Colaborador',
  supplier: 'Fornecedor',
  alert: 'Alerta',
};

const tabVariants = {
  enter: { opacity: 0, y: 12 },
  center: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -12 },
};

// Zero-state KPI config
const zeroKpiConfig = [
  { label: 'Hóspedes Ativos', value: '1', icon: Users, color: 'text-orange-400', bg: 'bg-orange-500/10' },
  { label: 'Receita Hoje', value: 'R$ 448', icon: DollarSign, color: 'text-green-400', bg: 'bg-green-500/10' },
  { label: 'Check-ins Pendentes', value: '1', icon: Clock, color: 'text-amber-400', bg: 'bg-amber-500/10' },
  { label: 'Automação ZEHLA (ROI)', value: '12', icon: TicketCheck, color: 'text-purple-400', bg: 'bg-purple-500/10' },
  { label: 'Taxa Ocupação', value: '12%', icon: Percent, color: 'text-cyan-400', bg: 'bg-cyan-500/10' },
  { label: 'ADR Médio', value: 'R$ 448', icon: TrendingUp, color: 'text-rose-400', bg: 'bg-rose-500/10' },
];

interface TenantData {
  nome: string;
  email: string;
  whatsappProprietario: string;
  whatsappAtendimento: string;
  property: {
    nome: string;
    documento: string;
    rua: string;
    numero: string;
    bairro: string;
    cidade: string;
    estado: string;
    cep: string;
    tipo: string;
    site: string;
    descricao: string;
  };
  rooms: Array<{
    id: string;
    nome: string;
    tipo: string;
    capacidade: number;
    preco: number;
  }>;
  services: { selected: string[] };
  payment: {
    methods: string[];
    pixKey: string;
    pixKeyType: string;
    bankName: string;
    bankAgency: string;
    bankAccount: string;
    bankAccountType: string;
    bankCpf: string;
  };
}

function getTenantData(): TenantData | null {
  try {
    const raw = localStorage.getItem('zehla-tenant-data');
    if (!raw) return null;
    return JSON.parse(raw) as TenantData;
  } catch {
    return null;
  }
}

function getTrialInfo(): { daysLeft: number; isExpired: boolean; isWarning: boolean } {
  try {
    const startStr = localStorage.getItem('zehla-trial-start');
    if (!startStr) return { daysLeft: 7, isExpired: false, isWarning: false };
    const start = new Date(startStr);
    const now = new Date();
    const elapsedMs = now.getTime() - start.getTime();
    const elapsedDays = Math.floor(elapsedMs / (24 * 60 * 60 * 1000));
    const daysLeft = Math.max(0, 7 - elapsedDays);
    return {
      daysLeft,
      isExpired: daysLeft <= 0,
      isWarning: daysLeft <= 2 && daysLeft > 0, // Warn on day 6 and day 7 (2 or 1 day left)
    };
  } catch {
    return { daysLeft: 7, isExpired: false, isWarning: false };
  }
}

// Zero-state rooms display from onboarding data
function ZeroStateRooms({ rooms }: { rooms: TenantData['rooms'] }) {
  const tipoLabels: Record<string, string> = {
    standard: 'Standard',
    luxo: 'Luxo',
    suite: 'Suíte',
    chale: 'Chalé',
  };

  return (
    <div className="glass-card p-4">
      <div className="flex items-center gap-2 mb-4">
        <BedDouble className="w-4 h-4 text-orange-400" />
        <h3 className="text-sm font-semibold text-neutral-300">Seus Quartos ({rooms.length})</h3>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {rooms.map((room, i) => (
          <div key={room.id} className="p-3 rounded-xl border border-orange-500/20 bg-white/[0.02] text-left">
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm font-bold text-neutral-200">{room.nome}</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-orange-500/20 text-orange-400">
                Disponível
              </span>
            </div>
            <div className="text-xs text-neutral-500">
              {tipoLabels[room.tipo] || 'Standard'} • 👥 {room.capacidade}
            </div>
            <div className="text-xs text-orange-400 font-semibold mt-1">
              R$ {room.preco}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Spreadsheet view for organized data management
function SpreadsheetView({ tenantData }: { tenantData: TenantData | null }) {
  const [activeSheet, setActiveSheet] = useState<'quartos' | 'reservas' | 'financeiro'>('quartos');

  const sheets = [
    { key: 'quartos' as const, label: 'Quartos', icon: BedDouble },
    { key: 'reservas' as const, label: 'Reservas', icon: CalendarDays },
    { key: 'financeiro' as const, label: 'Financeiro', icon: DollarSign },
  ];

  const tipoLabels: Record<string, string> = {
    standard: 'Standard',
    luxo: 'Luxo',
    suite: 'Suíte',
    chale: 'Chalé',
  };

  const statusLabels: Record<string, { label: string; className: string }> = {
    disponivel: { label: 'Disponível', className: 'bg-orange-500/15 text-orange-400 border-orange-500/20' },
    ocupado: { label: 'Ocupado', className: 'bg-red-500/15 text-red-400 border-red-500/20' },
    sujo: { label: 'Sujo', className: 'bg-amber-500/15 text-amber-400 border-amber-500/20' },
    manutencao: { label: 'Manutenção', className: 'bg-blue-500/15 text-blue-400 border-blue-500/20' },
  };

  const roomHeaders = ['Quarto', 'Tipo', 'Capacidade', 'Preço/Noite', 'Status'];
  const reservationHeaders = ['Hóspede', 'Quarto', 'Check-in', 'Check-out', 'Valor', 'Status'];
  const financialHeaders = ['Data', 'Descrição', 'Tipo', 'Valor', 'Status'];

  const roomsData = tenantData?.rooms || [];

  return (
    <div className="space-y-4">
      {/* Page title */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-neutral-100 flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-orange-400" />
            Planilhas
          </h1>
          <p className="text-sm text-neutral-500 mt-1">Controle organizado de quartos, reservas e financeiro</p>
        </div>
        <span className="text-[10px] text-neutral-600 bg-white/5 px-2 py-1 rounded border border-white/10">
          {roomsData.length} quartos cadastrados
        </span>
      </div>

      {/* Sheet tabs */}
      <div className="flex items-center gap-2">
        {sheets.map(sheet => {
          const Icon = sheet.icon;
          const isActive = activeSheet === sheet.key;
          return (
            <button
              key={sheet.key}
              onClick={() => setActiveSheet(sheet.key)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-medium transition-all ${
                isActive
                  ? 'bg-orange-500/10 text-orange-400 border border-orange-500/20'
                  : 'bg-white/5 text-neutral-400 hover:text-neutral-200 border border-white/10'
              }`}
            >
              <Icon className="w-4 h-4" />
              {sheet.label}
            </button>
          );
        })}
      </div>

      {/* Spreadsheet table */}
      <div className="glass-card overflow-hidden">
        {activeSheet === 'quartos' && (
          <>
            {roomsData.length > 0 ? (
              <div className="overflow-x-auto zehla-scroll-x">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-white/10">
                      {roomHeaders.map(h => (
                        <th
                          key={h}
                          className="px-4 py-3 text-[10px] font-semibold text-neutral-500 uppercase tracking-wider whitespace-nowrap"
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {roomsData.map((room, i) => (
                      <tr
                        key={room.id}
                        className={`border-b border-white/5 last:border-b-0 ${
                          i % 2 === 0 ? 'bg-white/[0.02]' : 'bg-transparent'
                        } hover:bg-white/[0.04] transition-colors`}
                      >
                        <td className="px-4 py-3 text-sm font-medium text-neutral-200 font-mono whitespace-nowrap">
                          {room.nome}
                        </td>
                        <td className="px-4 py-3 text-xs text-neutral-400 font-mono whitespace-nowrap">
                          {tipoLabels[room.tipo] || room.tipo}
                        </td>
                        <td className="px-4 py-3 text-xs text-neutral-400 font-mono whitespace-nowrap">
                          👥 {room.capacidade} {room.capacidade === 1 ? 'pessoa' : 'pessoas'}
                        </td>
                        <td className="px-4 py-3 text-xs font-mono whitespace-nowrap">
                          <span className="text-orange-400 font-semibold">
                            R$ {room.preco.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </span>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 text-[10px] font-semibold rounded-full border ${
                              statusLabels.disponivel.className
                            }`}
                          >
                            <span className="w-1.5 h-1.5 rounded-full bg-orange-400 mr-1.5" />
                            {statusLabels.disponivel.label}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <EmptySpreadsheet />
            )}
          </>
        )}

        {activeSheet === 'reservas' && (
          <div className="overflow-x-auto zehla-scroll-x">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-white/10">
                  {reservationHeaders.map(h => (
                    <th
                      key={h}
                      className="px-4 py-3 text-[10px] font-semibold text-neutral-500 uppercase tracking-wider whitespace-nowrap"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td colSpan={6}>
                    <EmptySpreadsheet />
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        )}

        {activeSheet === 'financeiro' && (
          <div className="overflow-x-auto zehla-scroll-x">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-white/10">
                  {financialHeaders.map(h => (
                    <th
                      key={h}
                      className="px-4 py-3 text-[10px] font-semibold text-neutral-500 uppercase tracking-wider whitespace-nowrap"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td colSpan={5}>
                    <EmptySpreadsheet />
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

function EmptySpreadsheet() {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-4">
        <Table className="w-7 h-7 text-neutral-700" />
      </div>
      <h3 className="text-sm font-semibold text-neutral-400 mb-1">Nenhum dado ainda</h3>
      <p className="text-xs text-neutral-600 max-w-sm">
        Os dados aparecerão aqui conforme sua pousada operar.
      </p>
    </div>
  );
}

function DashboardContent() {
  const [activeTab, setActiveTab] = useState<TabKey>('painel');
  const [tenantData, setTenantData] = useState<TenantData | null>(null);
  const [trialInfo, setTrialInfo] = useState({ daysLeft: 7, isExpired: false, isWarning: false });
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- reading from localStorage on mount (SSR-safe)
    setIsClient(true);
    setTenantData(getTenantData());
    setTrialInfo(getTrialInfo());
  }, []);

  const isNewAccount = isClient && !!tenantData;

  const topNavTenantData = tenantData
    ? {
        nome: tenantData.nome,
        email: tenantData.email,
        whatsappProprietario: tenantData.whatsappProprietario,
        whatsappAtendimento: tenantData.whatsappAtendimento,
        property: {
          nome: tenantData.property.nome,
          tipo: tenantData.property.tipo,
        },
        trialDaysLeft: trialInfo.daysLeft,
        isExpired: trialInfo.isExpired,
        isWarning: trialInfo.isWarning,
      }
    : null;

  // EXPIRED state — full block
  if (isClient && trialInfo.isExpired) {
    return (
      <div className="min-h-screen flex flex-col bg-[#0a0a0a]">
        <ClientTopNav tenantData={topNavTenantData} />
        <div className="flex-1 flex items-center justify-center p-4">
          <SubscriptionSelector />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Client Top Nav */}
      <ClientTopNav tenantData={topNavTenantData} />

      {/* Trial warning banner (day 6) */}
      {trialInfo.isWarning && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-500/10 border-b border-red-500/20 px-4 py-3"
        >
          <div className="max-w-7xl mx-auto flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-red-400 shrink-0" />
            <p className="text-sm text-red-400 font-medium">
              {trialInfo.daysLeft === 1
                ? 'Seu trial expira amanhã! Efetue o pagamento para continuar usando o ZEHLA.'
                : `Seu trial expira em ${trialInfo.daysLeft} dias! Adicione seu cartão de crédito para não perder acesso.`}
            </p>
            <span className="text-xs text-red-400/70 shrink-0 hidden sm:inline">
              R$ 297,00/mês via PIX
            </span>
          </div>
        </motion.div>
      )}

      {/* Tab navigation */}
      <nav className="glass-strong border-b border-white/5 px-4 overflow-x-auto zehla-scroll-x shrink-0">
        <div className="flex items-center gap-1 min-w-max">
          {tabs.map(tab => {
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`relative flex items-center gap-2 px-4 py-3 text-xs font-medium transition-all whitespace-nowrap ${
                  isActive
                    ? 'text-orange-400'
                    : 'text-neutral-500 hover:text-neutral-300'
                }`}
              >
                <tab.icon className={`w-4 h-4 transition-colors ${isActive ? 'text-orange-400' : ''}`} />
                {tab.label}
                {/* Active indicator */}
                {isActive && (
                  <motion.div
                    layoutId="tab-indicator"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-orange-400 rounded-full"
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  />
                )}
                {/* Terminal pulse badge */}
                {tab.key === 'terminal' && (
                  <span className="flex items-center gap-1">
                    <span className="relative flex h-1.5 w-1.5">
                      <span className="animate-zehla-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75" />
                      <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-orange-400" />
                    </span>
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </nav>

      {/* Main content */}
      <main className="flex-1 p-4 lg:p-6 overflow-y-auto zehla-scroll">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            variants={tabVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.2, ease: 'easeInOut' }}
          >
            {/* ===== TAB: PAINEL (COMMAND CENTER) ===== */}
            {activeTab === 'painel' && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
                
                {/* Header: Status da Operação */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-orange-500/10 via-transparent to-transparent p-6 rounded-3xl border border-orange-500/10 glass-card">
                  <div>
                    <h1 className="text-2xl font-bold text-[#fafafa] flex items-center gap-3">
                      DASHBOARD do Cliente
                      <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-green-500/10 border border-green-500/20 text-[10px] font-bold text-green-400 uppercase tracking-widest">
                        <span className="relative flex h-2 w-2">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                        </span>
                        Sistema Online
                      </div>
                    </h1>
                    <p className="text-sm text-neutral-500 mt-1">
                      Visão consolidada da <span className="text-orange-400 font-medium">{tenantData?.property.nome || 'sua propriedade'}</span>
                      <span className="ml-3 px-2 py-0.5 rounded bg-white/5 border border-white/10 text-[9px] font-mono text-neutral-400">
                        REG: {tenantData?.property.registrationNumber || '0001/PRO/SC'}
                      </span>
                    </p>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#242424] border border-[#363636] text-xs font-medium text-neutral-300 hover:border-orange-500/30 transition-all">
                      <CalendarDays className="w-4 h-4 text-orange-400" />
                      Hoje, 30 Abr
                    </button>
                  </div>
                </div>

                {/* Main Bento Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
                  
                  {/* Left Column: Big Metrics & AI Feed (8/12) */}
                  <div className="lg:col-span-8 space-y-6 flex flex-col">
                    
                    {/* Top Stats Row */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      {/* Receita Card */}
                      <div className="glass-card p-6 border-l-4 border-l-green-500/50 hover:bg-white/[0.03] transition-all group relative">
                        <div className="absolute top-4 right-4 group/tooltip">
                          <Info className="w-3.5 h-3.5 text-neutral-600 hover:text-green-400 transition-colors cursor-help" />
                          <div className="absolute right-0 top-6 w-48 p-2 bg-neutral-900 border border-white/10 rounded-lg text-[9px] text-neutral-400 opacity-0 group-hover/tooltip:opacity-100 transition-opacity z-50 pointer-events-none shadow-2xl">
                            Total de pagamentos validados via PIX ou Cartão nas últimas 24h. Dinheiro que já está na sua conta ou garantido pela plataforma.
                          </div>
                        </div>
                        <div className="flex items-center justify-between mb-4">
                          <div className="p-2 rounded-xl bg-green-500/10 text-green-400 group-hover:scale-110 transition-transform">
                            <DollarSign className="w-5 h-5" />
                          </div>
                          <span className="text-[10px] font-bold text-green-500/70">+12% vs ontem</span>
                        </div>
                        <div className="text-xs text-neutral-500 mb-1">Receita Confirmada</div>
                        <div className="text-2xl font-bold text-[#fafafa]">R$ 448,00</div>
                      </div>

                      {/* Ocupação Card */}
                      <div className="glass-card p-6 border-l-4 border-l-blue-500/50 hover:bg-white/[0.03] transition-all group relative">
                        <div className="absolute top-4 right-4 group/tooltip">
                          <Info className="w-3.5 h-3.5 text-neutral-600 hover:text-blue-400 transition-colors cursor-help" />
                          <div className="absolute right-0 top-6 w-48 p-2 bg-neutral-900 border border-white/10 rounded-lg text-[9px] text-neutral-400 opacity-0 group-hover/tooltip:opacity-100 transition-opacity z-50 pointer-events-none shadow-2xl">
                            Percentual de quartos reservados hoje em relação ao total da sua propriedade. Ajuda a definir se você precisa de promoções de última hora.
                          </div>
                        </div>
                        <div className="flex items-center justify-between mb-4">
                          <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400 group-hover:scale-110 transition-transform">
                            <Users className="w-5 h-5" />
                          </div>
                          <span className="text-[10px] font-bold text-blue-500/70">8/12 Quartos</span>
                        </div>
                        <div className="text-xs text-neutral-500 mb-1">Taxa de Ocupação</div>
                        <div className="text-2xl font-bold text-[#fafafa]">66.7%</div>
                      </div>

                      {/* ROI IA Card */}
                      <div className="glass-card p-6 border-l-4 border-l-purple-500/50 hover:bg-white/[0.03] transition-all group relative">
                        <div className="absolute top-4 right-4 group/tooltip">
                          <Info className="w-3.5 h-3.5 text-neutral-600 hover:text-purple-400 transition-colors cursor-help" />
                          <div className="absolute right-0 top-6 w-48 p-2 bg-neutral-900 border border-white/10 rounded-lg text-[9px] text-neutral-400 opacity-0 group-hover/tooltip:opacity-100 transition-opacity z-50 pointer-events-none shadow-2xl">
                            Quantidade de atendimentos feitos 100% pela IA. A "Economia" é o tempo que você ganharia se tivesse que responder cada um manualmente.
                          </div>
                        </div>
                        <div className="flex items-center justify-between mb-4">
                          <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400 group-hover:scale-110 transition-transform">
                            <Sparkles className="w-5 h-5" />
                          </div>
                          <span className="text-[10px] font-bold text-purple-500/70">Economia: 4h</span>
                        </div>
                        <div className="text-xs text-neutral-500 mb-1">Automação ZEHLA</div>
                        <div className="text-2xl font-bold text-[#fafafa]">12 Atend.</div>
                      </div>
                    </div>

                    {/* Guest Activity Feed (Business Focused) */}
                    <div className="glass-card overflow-hidden border border-white/5 relative group/card flex-1 flex flex-col">
                      <div className="absolute top-5 right-24 group/tooltip">
                        <Info className="w-3.5 h-3.5 text-neutral-600 hover:text-orange-400 transition-colors cursor-help" />
                        <div className="absolute right-0 top-6 w-56 p-3 bg-neutral-900 border border-white/10 rounded-xl text-[9px] text-neutral-400 opacity-0 group-hover/tooltip:opacity-100 transition-opacity z-50 pointer-events-none shadow-2xl">
                          <p className="font-bold text-orange-400 mb-1">CENTRO DE ATIVIDADE</p>
                          Acompanhe em tempo real as solicitações dos seus hóspedes e o status de cada atendimento realizado pelo ZEHLA.
                        </div>
                      </div>
                      <div className="p-5 border-b border-white/5 flex items-center justify-between bg-white/[0.01]">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-orange-500/10 flex items-center justify-center">
                            <Users className="w-5 h-5 text-orange-400" />
                          </div>
                          <div>
                            <h3 className="text-sm font-bold text-neutral-200">Atividade de Hóspedes</h3>
                            <p className="text-[10px] text-neutral-500">Últimas interações e solicitações</p>
                          </div>
                        </div>
                        <button onClick={() => setActiveTab('terminal')} className="text-[10px] font-bold text-orange-400 hover:underline">VER TODAS</button>
                      </div>

                      <div className="p-0">
                        {/* Guest Item */}
                        <div className="p-5 hover:bg-white/[0.02] transition-all border-b border-white/5 group">
                          <div className="flex items-start gap-4">
                            <div className="relative">
                              <div className="w-10 h-10 rounded-full bg-neutral-800 flex items-center justify-center text-xs font-bold text-white shadow-lg">MC</div>
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between mb-1">
                                <h4 className="text-sm font-bold text-neutral-100">Marcio Cau</h4>
                                <span className="text-[10px] text-neutral-600 tracking-tighter">Há 5min</span>
                              </div>
                              <p className="text-xs text-neutral-400 leading-relaxed italic border-l-2 border-white/10 pl-3 mb-3">
                                "Gostaria de saber o valor para o feriado de 1 de maio para 2 pessoas."
                              </p>
                              <div className="flex flex-wrap gap-2">
                                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-lg bg-green-500/10 border border-green-500/20 text-[9px] font-bold text-green-400">
                                  PIX VALIDADO R$ 448
                                </span>
                                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-lg bg-orange-500/10 border border-orange-500/20 text-[9px] font-bold text-orange-400">
                                  RESERVA CONFIRMADA
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* More fake items to show depth */}
                        <div className="p-5 opacity-40 hover:opacity-100 transition-all border-b border-white/5">
                          <div className="flex items-start gap-4">
                            <div className="w-10 h-10 rounded-full bg-neutral-800 flex items-center justify-center text-xs font-bold text-neutral-500">JR</div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between mb-1">
                                <h4 className="text-sm font-bold text-neutral-400">Juliana Ribeiro</h4>
                                <span className="text-[10px] text-neutral-700">Há 20min</span>
                              </div>
                              <p className="text-xs text-neutral-600 truncate">"Vocês aceitam pet? Tenho um Golden."</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Health & Operations (4/12) */}
                  <div className="lg:col-span-4 space-y-6 flex flex-col">
                    
                    {/* Usage & Health Dashboard */}
                    <div className="glass-card p-6 bg-gradient-to-b from-white/[0.02] to-transparent relative group/card">
                      <div className="absolute top-6 right-6 group/tooltip">
                        <Info className="w-3.5 h-3.5 text-neutral-600 hover:text-orange-400 transition-colors cursor-help" />
                        <div className="absolute right-0 top-6 w-48 p-2 bg-neutral-900 border border-white/10 rounded-lg text-[9px] text-neutral-400 opacity-0 group-hover/tooltip:opacity-100 transition-opacity z-50 pointer-events-none shadow-2xl">
                          Status do seu plano mensal. O medidor mostra quantas mensagens a IA ainda pode enviar antes da próxima renovação.
                        </div>
                      </div>
                      <h3 className="text-sm font-bold text-[#fafafa] mb-6 flex items-center gap-2">
                        <Zap className="w-4 h-4 text-orange-400" />
                        Saúde da Operação
                      </h3>
                      
                      <div className="space-y-6">
                        {/* Message Usage Meter */}
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-[11px] font-medium text-neutral-400">Mensagens IA do Plano (PRO)</span>
                            <span className="text-[11px] font-bold text-orange-400">12 / 2.000</span>
                          </div>
                          <div className="h-2 w-full bg-[#1a1a1a] rounded-full overflow-hidden border border-white/5 shadow-inner">
                            <motion.div 
                              initial={{ width: 0 }}
                              animate={{ width: '0.6%' }}
                              className="h-full bg-gradient-to-r from-orange-600 to-orange-400 rounded-full shadow-[0_0_10px_rgba(249,115,22,0.4)]"
                            />
                          </div>
                          <p className="text-[9px] text-neutral-600 mt-2">Próxima renovação: <span className="text-neutral-400">30 de Maio</span></p>
                        </div>

                        {/* Quick Refill Button */}
                        <motion.button 
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          className="w-full py-3.5 rounded-2xl bg-orange-500/10 border border-orange-500/20 text-[11px] font-bold text-orange-400 flex items-center justify-center gap-2 group transition-all"
                        >
                          <Plus className="w-4 h-4 group-hover:rotate-90 transition-transform" />
                          Comprar +500 mensagens por R$ 19,90
                        </motion.button>

                        <div className="h-px bg-white/5 w-full" />

                        {/* System Health Indicators */}
                        <div className="space-y-3">
                          <div className="flex items-center justify-between text-[10px]">
                            <span className="text-neutral-500">API OpenAI/Gemini</span>
                            <span className="text-green-500 font-bold">100% Estável</span>
                          </div>
                          <div className="flex items-center justify-between text-[10px]">
                            <span className="text-neutral-500">Integração WhatsApp</span>
                            <span className="text-green-500 font-bold">Conectado</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Quick Management Box */}
                    <div className="glass-card p-6 border-t-2 border-orange-500/20">
                      <h3 className="text-sm font-bold text-neutral-200 mb-4">Próximos Check-ins</h3>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between p-3 rounded-xl bg-white/[0.01] border border-white/5 group hover:border-orange-500/20 transition-all cursor-pointer">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-orange-500/10 flex items-center justify-center text-[10px] font-bold text-orange-400">HOJE</div>
                            <div>
                              <p className="text-[11px] font-bold text-neutral-300">Marcio Cau</p>
                              <p className="text-[9px] text-neutral-500">Quarto 04 - Luxo</p>
                            </div>
                          </div>
                          <ChevronRight className="w-4 h-4 text-neutral-700 group-hover:text-orange-500 transition-colors" />
                        </div>
                        <div className="flex items-center justify-center p-3 rounded-xl border border-dashed border-white/5 text-[10px] text-neutral-600">
                          Sem outros check-ins hoje
                        </div>
                      </div>
                    </div>

                  </div>
                </div>


              </div>
            )}

            {/* ===== TAB: TERMINAL ===== */}
            {activeTab === 'terminal' && (
              <div className="space-y-4">
                <div>
                  <h1 className="text-xl font-bold text-neutral-100">Terminal de Operações</h1>
                  <p className="text-sm text-neutral-500 mt-1">
                    Monitoramento em tempo real de todas as atividades da sua pousada
                  </p>
                </div>
                <LiveTerminal />
              </div>
            )}

            {/* ===== TAB: QUARTOS ===== */}
            {activeTab === 'quartos' && (
              <div className="space-y-4">
                <div>
                  <h1 className="text-xl font-bold text-neutral-100">Mapa de Quartos</h1>
                  <p className="text-sm text-neutral-500 mt-1">Status e ocupação de todos os quartos</p>
                </div>
                {isNewAccount && tenantData ? (
                  <ZeroStateRooms rooms={tenantData.rooms} />
                ) : (
                  <RoomBoard />
                )}
              </div>
            )}

            {/* ===== TAB: RESERVAS ===== */}
            {activeTab === 'reservas' && (
              <div className="space-y-4">
                <div>
                  <h1 className="text-xl font-bold text-neutral-100">Reservas</h1>
                  <p className="text-sm text-neutral-500 mt-1">Gerencie suas reservas e check-ins</p>
                </div>
                {isNewAccount ? (
                  <div className="glass-card p-12 flex flex-col items-center justify-center text-center">
                    <CalendarDays className="w-12 h-12 text-neutral-700 mb-4" />
                    <h3 className="text-sm font-semibold text-neutral-400 mb-1">Nenhuma reserva ainda</h3>
                    <p className="text-xs text-neutral-600 max-w-sm">
                      As reservas aparecerão aqui assim que seus hóspedes começarem a reservar através do ZEHLA.
                    </p>
                  </div>
                ) : (
                  <Reservations />
                )}
              </div>
            )}

            {/* ===== TAB: FINANCEIRO ===== */}
            {activeTab === 'financeiro' && (
              <div className="space-y-4">
                <div>
                  <h1 className="text-xl font-bold text-neutral-100">Financeiro</h1>
                  <p className="text-sm text-neutral-500 mt-1">Receitas, pagamentos e transações</p>
                </div>
                {isNewAccount ? (
                  <FinancialReport />
                ) : (
                  <FinancialReport />
                )}
              </div>
            )}

            {/* ===== TAB: RELATÓRIOS ===== */}
            {activeTab === 'relatorios' && (
              <div className="space-y-4">
                <div>
                  <h1 className="text-xl font-bold text-neutral-100">Relatórios Mensais</h1>
                  <p className="text-sm text-neutral-500 mt-1">Extratos detalhados, taxas da plataforma e performance</p>
                </div>
                <FinancialReport />
              </div>
            )}

            {/* ===== TAB: PLANILHAS ===== */}
            {activeTab === 'planilhas' && (
              <SpreadsheetView tenantData={tenantData} />
            )}

            {/* ===== TAB: PROMOÇÕES ===== */}
            {activeTab === 'promocoes' && (
              <div className="space-y-4">
                <div>
                  <h1 className="text-xl font-bold text-neutral-100">Promoções</h1>
                  <p className="text-sm text-neutral-500 mt-1">Crie e gerencie promoções para atrair mais hóspedes</p>
                </div>
                <Promotions />
              </div>
            )}

            {/* ===== TAB: CONFIGURAÇÕES ===== */}
            {activeTab === 'configuracoes' && (
              <SettingsPanel />
            )}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}

export default function DashboardPage() {
  const [isOnboardingComplete, setIsOnboardingComplete] = useState<boolean | null>(null);

  useEffect(() => {
    try {
      const complete = localStorage.getItem('zehla-onboarding-complete');
      // eslint-disable-next-line react-hooks/set-state-in-effect -- reading from localStorage on mount (SSR-safe)
      setIsOnboardingComplete(complete === 'true');
    } catch {
      setIsOnboardingComplete(false);
    }
  }, []);

  const handleOnboardingComplete = () => {
    setIsOnboardingComplete(true);
  };

  // Loading state while checking localStorage
  if (isOnboardingComplete === null) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-orange-500/30 border-t-orange-500 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-sm text-neutral-500">Carregando...</p>
        </div>
      </div>
    );
  }

  // Redirect to registration if not onboarded
  if (!isOnboardingComplete) {
    // Redirect to /teste-gratis instead of showing inline wizard
    if (typeof window !== 'undefined') {
      window.location.href = '/teste-gratis';
    }
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-orange-500/30 border-t-orange-500 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-sm text-neutral-500">Redirecionando para cadastro...</p>
        </div>
      </div>
    );
  }

  // Show dashboard
  return <DashboardContent />;
}
