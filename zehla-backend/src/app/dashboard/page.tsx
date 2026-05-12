import dynamic from 'next/dynamic';
import { useState, useEffect, Suspense } from 'react';
import { OnboardingWizard } from '@/components/onboarding/OnboardingWizard';
import { motion, AnimatePresence } from 'framer-motion';

// Componente de Carregamento (Pitch-Black Skeleton)
const DashboardSkeleton = () => (
  <div className="w-full h-96 rounded-xl bg-neutral-900/50 animate-pulse border border-neutral-800 flex items-center justify-center">
    <div className="flex flex-col items-center gap-3">
      <div className="w-12 h-12 rounded-full border-2 border-orange-500/20 border-t-orange-500 animate-spin" />
      <span className="text-xs text-neutral-600 font-mono">CALIBRANDO RADAR...</span>
    </div>
  </div>
);

// CARREGAMENTO DINÂMICO DOS MÓDULOS (Custo Zero de Ingestão)
const LiveTerminal = dynamic(() => import('@/components/client/LiveTerminal').then(m => m.LiveTerminal), { ssr: false, loading: () => <DashboardSkeleton /> });
const RoomBoard = dynamic(() => import('@/components/dashboard/RoomBoard').then(m => m.RoomBoard), { ssr: false, loading: () => <DashboardSkeleton /> });
const Reservations = dynamic(() => import('@/components/dashboard/Reservations').then(m => m.Reservations), { ssr: false, loading: () => <DashboardSkeleton /> });
const Promotions = dynamic(() => import('@/components/dashboard/Promotions').then(m => m.Promotions), { ssr: false, loading: () => <DashboardSkeleton /> });
const SettingsPanel = dynamic(() => import('@/components/client/SettingsPanel').then(m => m.SettingsPanel), { ssr: false, loading: () => <DashboardSkeleton /> });
const FinancialReport = dynamic(() => import('@/components/dashboard/FinancialReport').then(m => m.FinancialReport), { ssr: false, loading: () => <DashboardSkeleton /> });
const MarketingView = dynamic(() => import('@/components/dashboard/MarketingView'), { ssr: false, loading: () => <DashboardSkeleton /> });
const ZehlaWarRoom = dynamic(() => import('@/components/dashboard/ZehlaWarRoom'), { ssr: false, loading: () => <DashboardSkeleton /> });
const VisibilityDashboard = dynamic(() => import('@/components/dashboard/VisibilityDashboard').then(m => m.VisibilityDashboard), { ssr: false, loading: () => <DashboardSkeleton /> });
const FNRHCheckinProvider = dynamic(() => import('@/components/dashboard/FNRHCheckinProvider'), { ssr: false, loading: () => <DashboardSkeleton /> });
const VoiceStudioV2 = dynamic(() => import('@/components/VoiceStudio/VoiceStudioV2').then(m => m.VoiceStudioV2), { ssr: false, loading: () => <DashboardSkeleton /> });
const BrainDashboard = dynamic(() => import('@/components/dashboard/BrainDashboard').then(m => m.BrainDashboard), { ssr: false, loading: () => <DashboardSkeleton /> });

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
  Info,
  Globe,
  Mic
} from 'lucide-react';
import { ClientTopNav } from '@/components/client/ClientTopNav';
import { KPICards } from '@/components/dashboard/KPICards';
import { ChartsSection } from '@/components/dashboard/ChartsSection';
import { PaymentPanel } from '@/components/dashboard/PaymentPanel';
import { SubscriptionSelector } from '@/components/subscription/SubscriptionSelector';

type TabKey = 'painel' | 'sala-de-guerra' | 'marketing' | 'visibilidade' | 'check-in' | 'terminal' | 'quartos' | 'reservas' | 'financeiro' | 'relatorios' | 'planilhas' | 'promocoes' | 'configuracoes' | 'voice-studio';


const tabs: { key: TabKey; label: string; icon: typeof LayoutDashboard }[] = [
  { key: 'painel', label: 'Painel', icon: LayoutDashboard },
  { key: 'voice-studio', label: 'Voice Studio', icon: Mic },
  { key: 'check-in', label: 'Check-in', icon: TicketCheck },
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
  { label: 'Economia Comissões (20%)', value: 'R$ 89,60', icon: DollarSign, color: 'text-green-500', bg: 'bg-green-500/20' },
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

// Removidos helpers de localStorage (Migrado para Database/Prisma)

// Zero-state rooms display from database data
function ZeroStateRooms({ rooms }: { rooms: any[] }) {
  const tipoLabels: Record<string, string> = {
    STANDARD: 'Standard',
    LUXO: 'Luxo',
    SUITE: 'Suíte',
    CHALE: 'Chalé',
  };

  return (
    <div className="glass-card p-4">
      <div className="flex items-center gap-2 mb-4">
        <BedDouble className="w-4 h-4 text-orange-400" />
        <h3 className="text-sm font-semibold text-neutral-300">Seus Quartos ({rooms?.length || 0})</h3>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {rooms?.map((room, i) => (
          <div key={room.id} className="p-3 rounded-xl border border-orange-500/20 bg-white/[0.02] text-left">
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm font-bold text-neutral-200">{room.number || room.name}</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-orange-500/20 text-orange-400">
                {room.status === 'AVAILABLE' ? 'Disponível' : room.status}
              </span>
            </div>
            <div className="text-xs text-neutral-500">
              {tipoLabels[room.type] || room.type} • 👥 {room.capacity}
            </div>
            <div className="text-xs text-orange-400 font-semibold mt-1">
              R$ {room.basePrice}
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
    STANDARD: 'Standard',
    LUXO: 'Luxo',
    SUITE: 'Suíte',
    CHALE: 'Chalé',
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
                    {roomsData.map((room: any, i: number) => (
                      <tr
                        key={room.id}
                        className={`border-b border-white/5 last:border-b-0 ${
                          i % 2 === 0 ? 'bg-white/[0.02]' : 'bg-transparent'
                        } hover:bg-white/[0.04] transition-colors`}
                      >
                        <td className="px-4 py-3 text-sm font-medium text-neutral-200 font-mono whitespace-nowrap">
                          {room.number || room.name}
                        </td>
                        <td className="px-4 py-3 text-xs text-neutral-400 font-mono whitespace-nowrap">
                          {tipoLabels[room.type] || room.type}
                        </td>
                        <td className="px-4 py-3 text-xs text-neutral-400 font-mono whitespace-nowrap">
                          👥 {room.capacity} {room.capacity === 1 ? 'pessoa' : 'pessoas'}
                        </td>
                        <td className="px-4 py-3 text-xs font-mono whitespace-nowrap">
                          <span className="text-orange-400 font-semibold">
                            R$ {(room.basePrice || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </span>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 text-[10px] font-semibold rounded-full border ${
                              statusLabels.disponivel.className
                            }`}
                          >
                            <span className="w-1.5 h-1.5 rounded-full bg-orange-400 mr-1.5" />
                            {room.status || 'Disponível'}
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
  const { data: session, status: authStatus } = useSession();
  const [activeTab, setActiveTab] = useState<TabKey>('painel');
  const [tenantData, setTenantData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [trialInfo, setTrialInfo] = useState({ daysLeft: 7, isExpired: false, isWarning: false });

  useEffect(() => {
    if (authStatus === 'authenticated') {
      fetch('/api/properties/me')
        .then(res => res.json())
        .then(data => {
          if (!data.error) {
            setTenantData(data);
            
            if (data.trialEndsAt) {
              const ends = new Date(data.trialEndsAt);
              const now = new Date();
              const diff = ends.getTime() - now.getTime();
              const daysLeft = Math.ceil(diff / (1000 * 60 * 60 * 24));
              setTrialInfo({
                daysLeft: Math.max(0, daysLeft),
                isExpired: daysLeft <= 0,
                isWarning: daysLeft <= 2 && daysLeft > 0
              });
            }
          } else {
            // Redirect to onboarding if no property exists
            window.location.href = '/teste-gratis';
          }
          setLoading(false);
        })
        .catch(err => {
          console.error("Erro ao buscar dados do tenant:", err);
          setLoading(false);
        });
    } else if (authStatus === 'unauthenticated') {
      setLoading(false);
    }
  }, [authStatus]);

  if (loading || authStatus === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="flex flex-col items-center gap-4">
          <Brain className="w-10 h-10 text-orange-500 animate-pulse" />
          <p className="text-sm text-neutral-500 font-mono tracking-widest">SINCRONIZANDO CÉREBRO...</p>
        </div>
      </div>
    );
  }

  const topNavTenantData = tenantData
    ? {
        nome: session?.user?.name || 'Proprietário',
        email: session?.user?.email || '',
        whatsappProprietario: tenantData.whatsapp || '',
        whatsappAtendimento: tenantData.whatsapp || '',
        property: {
          nome: tenantData.name,
          tipo: tenantData.category,
        },
        trialDaysLeft: trialInfo.daysLeft,
        isExpired: trialInfo.isExpired,
        isWarning: trialInfo.isWarning,
      }
    : null;

  // EXPIRED state — full block
  if (trialInfo.isExpired) {
    return (
      <div className="min-h-screen flex flex-col bg-[#0a0a0a]">
        <ClientTopNav 
          tenantData={topNavTenantData} 
          onOpenZCC={() => setActiveTab('sala-de-guerra')}
        />
        <div className="flex-1 flex items-center justify-center p-4">
          <SubscriptionSelector />
        </div>
      </div>
    );
  }

  const isNewAccount = tenantData && (tenantData._count?.reservations === 0);

  return (
    <div className="flex flex-col h-screen bg-[#0a0a0a] text-[#fafafa] overflow-hidden">
      {/* Top Navigation (A Bancada de Inox) */}
      <ClientTopNav 
        tenantData={tenantData} 
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

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

      {/* Main workspace */}
      <main className="flex-1 overflow-y-auto zehla-scroll p-4 lg:p-6">
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
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                <div>
                  <h1 className="text-3xl font-bold text-[#fafafa] flex items-center gap-3">
                    Sistema Operacional Cognitivo
                  </h1>
                  <p className="text-[#898989] mt-2">
                    Bem-vindo ao centro de comando da sua pousada. A IA está processando dados regionais e de mercado.
                  </p>
                </div>

                <BrainDashboard />
              </div>
            )}

            {/* ===== TAB: SALA DE GUERRA (WAR ROOM) ===== */}
            {activeTab === 'sala-de-guerra' && (
              <div className="h-[calc(100vh-180px)]">
                <ZehlaWarRoom />
              </div>
            )}

            {/* ===== TAB: MARKETING ===== */}
            {activeTab === 'marketing' && (
              <MarketingView />
            )}

            {/* ===== TAB: VISIBILIDADE ===== */}
            {activeTab === 'visibilidade' && (
              <div className="max-w-4xl mx-auto space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h1 className="text-2xl font-bold text-[#fafafa] flex items-center gap-2">
                      <Globe className="w-6 h-6 text-orange-500" />
                      Visibilidade Orgânica
                    </h1>
                    <p className="text-sm text-neutral-500 mt-1">Sua presença no Google e SEO Local (Agente 09)</p>
                  </div>
                </div>
                <VisibilityDashboard />
              </div>
            )}

            {/* ===== TAB: CHECK-IN (FNRH) ===== */}
            {activeTab === 'check-in' && (
              <div className="space-y-6">
                <div>
                  <h1 className="text-xl font-bold text-neutral-100 flex items-center gap-2">
                    <TicketCheck className="w-6 h-6 text-orange-500" />
                    Check-in Digital & FNRH
                  </h1>
                  <p className="text-sm text-neutral-500 mt-1">Conformidade com o Ministério do Turismo (Portaria 28/2025)</p>
                </div>
                <FNRHCheckinProvider />
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

            {/* ===== TAB: VOICE STUDIO ===== */}
            {activeTab === 'voice-studio' && (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                <div>
                  <h1 className="text-3xl font-bold text-[#fafafa] flex items-center gap-3">
                    Voice Studio V2
                  </h1>
                  <p className="text-[#898989] mt-2">
                    Engenharia Vocal e Clonagem DNA. Treine sua voz e deixe a IA falar como você.
                  </p>
                </div>

                <VoiceStudioV2 />
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}

export default function DashboardPage() {
  return <DashboardContent />;
}
