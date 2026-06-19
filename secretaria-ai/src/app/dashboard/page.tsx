'use client';

import { useState, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BarChart3,
  Brain,
  Bot,
  CalendarSync,
  CheckCircle2,
  Database,
  GraduationCap,
  Hotel,
  MessageSquare,
  Users,
  Star,
  Zap,
  TrendingUp,
  DollarSign,
  Percent,
  Clock,
  ArrowRight,
  Target,
  Rocket,
  Shield,
  Lightbulb,
  LineChart,
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';

/* ─── Types ─── */
interface Capabilities {
  hasPMS: boolean;
  hasChannelManager: boolean;
  hasBookingEngine: boolean;
  hasWhatsAppAutomation: boolean;
  hasReviewAutomation: boolean;
  hasConsolidatedDatabase: boolean;
  hasHistoricalData: boolean;
  teamOpenToAI: boolean;
  teamTrained: boolean;
}

interface ROISliders {
  roomsCount: number;
  adr: number;
  occupancy: number;
  staffHourlyRate: number;
}

/* ─── Constants ─── */
const CAPABILITY_CONFIG: {
  key: keyof Capabilities;
  label: string;
  points: number;
  icon: React.ElementType;
}[] = [
  { key: 'hasPMS', label: 'PMS (Sistema de Gestão)', points: 15, icon: Hotel },
  { key: 'hasChannelManager', label: 'Channel Manager', points: 15, icon: CalendarSync },
  { key: 'hasBookingEngine', label: 'Motor de Reservas Online', points: 10, icon: BarChart3 },
  { key: 'hasWhatsAppAutomation', label: 'Automação WhatsApp', points: 15, icon: MessageSquare },
  { key: 'hasReviewAutomation', label: 'Automação de Avaliações', points: 10, icon: Star },
  { key: 'hasConsolidatedDatabase', label: 'Base de Dados Consolidada', points: 10, icon: Database },
  { key: 'hasHistoricalData', label: 'Dados Históricos', points: 10, icon: LineChart },
  { key: 'teamOpenToAI', label: 'Equipe Aberta à IA', points: 10, icon: Brain },
  { key: 'teamTrained', label: 'Equipe Treinada', points: 5, icon: GraduationCap },
];

const DEFAULT_CAPABILITIES: Capabilities = {
  hasPMS: false,
  hasChannelManager: false,
  hasBookingEngine: false,
  hasWhatsAppAutomation: false,
  hasReviewAutomation: false,
  hasConsolidatedDatabase: false,
  hasHistoricalData: false,
  teamOpenToAI: false,
  teamTrained: false,
};

const DEFAULT_ROI: ROISliders = {
  roomsCount: 20,
  adr: 300,
  occupancy: 50,
  staffHourlyRate: 25,
};

/* ─── Helpers ─── */
function calcReadiness(caps: Capabilities) {
  let score = 0;
  if (caps.hasPMS) score += 15;
  if (caps.hasChannelManager) score += 15;
  if (caps.hasBookingEngine) score += 10;
  if (caps.hasWhatsAppAutomation) score += 15;
  if (caps.hasReviewAutomation) score += 10;
  if (caps.hasConsolidatedDatabase) score += 10;
  if (caps.hasHistoricalData) score += 10;
  if (caps.teamOpenToAI) score += 10;
  if (caps.teamTrained) score += 5;
  let category: string;
  if (score < 40) category = 'Co-Pilots';
  else if (score <= 75) category = 'Brains';
  else category = 'Autonomous Agents';
  return { score, category };
}

function calcROI(s: ROISliders) {
  const { roomsCount, adr, occupancy, staffHourlyRate } = s;
  let boostPercent: number;
  if (occupancy < 40) boostPercent = 12;
  else if (occupancy <= 80) boostPercent = 8;
  else boostPercent = 4;

  const revenueGain = roomsCount * 30 * (boostPercent / 100) * adr;
  const existingReservations = Math.round(roomsCount * (occupancy / 100) * 30);
  const otaSavings = existingReservations * 0.2 * adr * 0.15;
  const staffSavings = 3 * 30 * staffHourlyRate;
  const roiMonthly = revenueGain + otaSavings + staffSavings;
  const roiAnnual = roiMonthly * 12;
  const currentMonthlyRevenue = roomsCount * (occupancy / 100) * 30 * adr;
  const projectedOccupancy = Math.min(100, occupancy + boostPercent);
  const projectedMonthlyRevenue = roomsCount * (projectedOccupancy / 100) * 30 * adr;
  const zehlaCost = 997;
  const netMonthly = roiMonthly - zehlaCost;
  const paybackMonths = netMonthly > 0 ? Math.ceil(zehlaCost / (netMonthly / 12)) : null;

  return {
    boostPercent,
    revenueGain: Math.round(revenueGain * 100) / 100,
    otaSavings: Math.round(otaSavings * 100) / 100,
    staffSavings: Math.round(staffSavings * 100) / 100,
    roiMonthly: Math.round(roiMonthly * 100) / 100,
    roiAnnual: Math.round(roiAnnual * 100) / 100,
    currentMonthlyRevenue: Math.round(currentMonthlyRevenue * 100) / 100,
    projectedMonthlyRevenue: Math.round(projectedMonthlyRevenue * 100) / 100,
    projectedOccupancy,
    paybackMonths,
  };
}

function formatBRL(value: number) {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function getGaugeColor(score: number): string {
  if (score <= 30) return '#ef4444';
  if (score <= 60) return '#eab308';
  return '#10b981';
}

function getGaugeGradient(score: number): string {
  if (score <= 30) return 'from-red-500 to-red-400';
  if (score <= 60) return 'from-yellow-500 to-yellow-400';
  return 'from-emerald-500 to-emerald-400';
}

/* ─── Glass Card Wrapper ─── */
function GlassCard({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={`rounded-2xl border border-white/[0.06] bg-white/[0.03] backdrop-blur-xl ${className}`}
    >
      {children}
    </div>
  );
}

/* ─── Circular Gauge ─── */
function ReadinessGauge({ score, animated }: { score: number; animated: boolean }) {
  const radius = 90;
  const strokeWidth = 12;
  const center = 110;
  const circumference = 2 * Math.PI * radius;
  const progress = (score / 100) * circumference;
  const color = getGaugeColor(score);

  return (
    <div className="relative flex items-center justify-center">
      <svg width={center * 2} height={center * 2} className="transform -rotate-90">
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke="rgba(255,255,255,0.06)"
          strokeWidth={strokeWidth}
        />
        <motion.circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={false}
          animate={{ strokeDashoffset: circumference - progress }}
          transition={{ type: 'spring', stiffness: 60, damping: 20, duration: 0.8 }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <motion.span
          key={score}
          initial={animated ? { opacity: 0, y: 10 } : false}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="text-5xl font-bold text-white tabular-nums"
        >
          {score}
        </motion.span>
        <span className="text-sm text-zinc-400 mt-1">de 100</span>
      </div>
    </div>
  );
}

/* ─── Category Badge ─── */
function CategoryBadge({ category }: { category: string }) {
  const config = {
    'Co-Pilots': { color: 'bg-red-500/20 text-red-300 border-red-500/30', icon: Zap },
    Brains: { color: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30', icon: Brain },
    'Autonomous Agents': { color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30', icon: Bot },
  };
  const c = config[category as keyof typeof config] || config['Co-Pilots'];
  const Icon = c.icon;

  return (
    <div className={`inline-flex items-center gap-2 rounded-full border px-4 py-1.5 ${c.color}`}>
      <Icon className="h-4 w-4" />
      <span className="text-sm font-semibold">{category}</span>
    </div>
  );
}

/* ─── Recommendation Text ─── */
function RecommendationText({ category, score }: { category: string; score: number }) {
  if (category === 'Co-Pilots') {
    return (
      <div className="rounded-xl bg-red-500/10 border border-red-500/20 p-4 space-y-2">
        <div className="flex items-center gap-2 text-red-300 font-medium">
          <Lightbulb className="h-4 w-4" />
          Recomendação para sua pousada
        </div>
        <p className="text-sm text-zinc-300 leading-relaxed">
          Com pontuação de <strong className="text-white">{score}/100</strong>, sua pousada está na
          fase <strong className="text-red-300">Co-Pilots</strong>. Recomendamos começar com
          automações básicas: implemente um PMS, ative o WhatsApp Business API e configure
          respostas automáticas para avaliações. Esses passos iniciais podem elevar sua pontuação
          em até 40 pontos e preparar o terreno para orquestração de dados.
        </p>
      </div>
    );
  }
  if (category === 'Brains') {
    return (
      <div className="rounded-xl bg-yellow-500/10 border border-yellow-500/20 p-4 space-y-2">
        <div className="flex items-center gap-2 text-yellow-300 font-medium">
          <Lightbulb className="h-4 w-4" />
          Recomendação para sua pousada
        </div>
        <p className="text-sm text-zinc-300 leading-relaxed">
          Com pontuação de <strong className="text-white">{score}/100</strong>, sua pousada está na
          fase <strong className="text-yellow-300">Brains</strong>. Sua infraestrutura permite
          orquestração inteligente de dados. Ative módulos de precificação dinâmica, análise de
          sentimento de avaliações e otimização automática de distribuição de canais. Consolide seu
          banco de dados para alcançar o próximo nível.
        </p>
      </div>
    );
  }
  return (
    <div className="rounded-xl bg-emerald-500/10 border border-emerald-500/20 p-4 space-y-2">
      <div className="flex items-center gap-2 text-emerald-300 font-medium">
        <Lightbulb className="h-4 w-4" />
        Recomendação para sua pousada
      </div>
      <p className="text-sm text-zinc-300 leading-relaxed">
        Com pontuação de <strong className="text-white">{score}/100</strong>, sua pousada está na
        fase <strong className="text-emerald-300">Autonomous Agents</strong>. Sua infraestrutura
        está madura para agentes autônomos de tomada de decisão. Ative agentes de revenue
        management, concierge virtual inteligente e otimização preditiva de estoque. Sua pousada
        pode operar com eficiência de grande hotel com IA assistiva completa.
      </p>
    </div>
  );
}

/* ─── Action Plan Timeline ─── */
function getActionPlan(score: number, caps: Capabilities) {
  const actions: {
    title: string;
    description: string;
    priority: 'alta' | 'média' | 'baixa';
    impact: string;
    icon: React.ElementType;
  }[] = [];

  if (!caps.hasPMS) {
    actions.push({
      title: 'Implementar PMS',
      description: 'Adotar um Sistema de Gestão Hoteleira (PMS) para centralizar reservas, check-in/check-out e controle de quartos. Recomendamos Hospedin ou Cloudbeds para pousadas brasileiras.',
      priority: 'alta',
      impact: '+15 pts | Impacto direto na operação',
      icon: Hotel,
    });
  }

  if (!caps.hasChannelManager) {
    actions.push({
      title: 'Ativar Channel Manager',
      description: 'Conectar seu PMS a um Channel Manager para sincronizar disponibilidade e preços em tempo real entre Booking.com, Airbnb, Expedia e outros canais.',
      priority: 'alta',
      impact: '+15 pts | Reduz overbookings em 95%',
      icon: CalendarSync,
    });
  }

  if (!caps.hasWhatsAppAutomation) {
    actions.push({
      title: 'Ativar WhatsApp Business API',
      description: 'Implementar automação de WhatsApp para responder perguntas frequentes, enviar confirmações de reserva e solicitações de avaliação automaticamente.',
      priority: 'alta',
      impact: '+15 pts | Economia de 3h/dia',
      icon: MessageSquare,
    });
  }

  if (!caps.hasBookingEngine) {
    actions.push({
      title: 'Motor de Reservas Próprio',
      description: 'Criar uma página de reservas direta no seu site para reduzir dependência de OTAs e economizar até 15-20% em comissões.',
      priority: 'média',
      impact: '+10 pts | Economia de R$ 2.400+/mês',
      icon: BarChart3,
    });
  }

  if (!caps.hasReviewAutomation) {
    actions.push({
      title: 'Automação de Avaliações',
      description: 'Configurar solicitações automáticas pós-checkout para Google e TripAdvisor, com monitoramento de sentimento usando IA.',
      priority: 'média',
      impact: '+10 pts | +40% mais avaliações',
      icon: Star,
    });
  }

  if (!caps.hasConsolidatedDatabase) {
    actions.push({
      title: 'Consolidar Base de Dados',
      description: 'Unificar dados de reservas, hóspedes, receita e canais em um único banco de dados estruturado para alimentar análises de IA.',
      priority: 'média',
      impact: '+10 pts | Base para decisões inteligentes',
      icon: Database,
    });
  }

  if (!caps.hasHistoricalData) {
    actions.push({
      title: 'Coletar Dados Históricos',
      description: 'Importar pelo menos 12 meses de dados históricos de ocupação, ADR e receita para permitir modelos preditivos sazonais.',
      priority: 'média',
      impact: '+10 pts | Previsão de demanda sazonal',
      icon: LineChart,
    });
  }

  if (!caps.teamOpenToAI) {
    actions.push({
      title: 'Capacitar Equipe sobre IA',
      description: 'Realizar workshops para demonstrar como a IA pode auxiliar no dia a dia, reduzindo resistência e aumentando adoção.',
      priority: 'baixa',
      impact: '+10 pts | Adesão da equipe',
      icon: Brain,
    });
  }

  if (!caps.teamTrained) {
    actions.push({
      title: 'Treinar Equipe Operacional',
      description: 'Treinar a equipe no uso das ferramentas implementadas, criando manuais e processos padronizados com suporte de IA.',
      priority: 'baixa',
      impact: '+5 pts | Operação eficiente',
      icon: GraduationCap,
    });
  }

  // Always add strategic recommendations based on score
  if (score >= 40) {
    actions.push({
      title: 'Ativar Precificação Dinâmica',
      description: 'Implementar algoritmo de precificação baseado em demanda, sazonalidade e eventos locais para maximizar ADR e receita.',
      priority: 'média',
      impact: 'Receita +8-15%',
      icon: TrendingUp,
    });
  }

  if (score >= 60) {
    actions.push({
      title: 'Concierge Virtual Inteligente',
      description: 'Deploy de agente de IA para atendimento 24/7 via WhatsApp, com conhecimento sobre a pousada, região e serviços locais.',
      priority: 'média',
      impact: 'Satisfação +25%',
      icon: Bot,
    });
  }

  if (score >= 75) {
    actions.push({
      title: 'Revenue Management Autônomo',
      description: 'Ativar sistema de Revenue Management com IA que ajusta preços automaticamente, otimiza distribuição e gera relatórios estratégicos.',
      priority: 'alta',
      impact: 'Receita +12-20%',
      icon: Target,
    });
  }

  return actions;
}

function ActionPlanTimeline({ score, caps }: { score: number; caps: Capabilities }) {
  const actions = getActionPlan(score, caps);

  const priorityConfig = {
    alta: { label: 'Alta', className: 'bg-red-500/20 text-red-300 border-red-500/30' },
    média: { label: 'Média', className: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30' },
    baixa: { label: 'Baixa', className: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' },
  };

  return (
    <div className="relative space-y-1">
      {/* Timeline line */}
      <div className="absolute left-5 top-8 bottom-8 w-px bg-gradient-to-b from-emerald-500/50 via-emerald-500/20 to-transparent" />

      <AnimatePresence mode="popLayout">
        {actions.map((action, index) => {
          const pConfig = priorityConfig[action.priority];
          const Icon = action.icon;
          return (
            <motion.div
              key={action.title}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.06, duration: 0.4 }}
              className="relative pl-14 py-3"
            >
              {/* Timeline dot */}
              <div
                className={`absolute left-3 top-5 h-4 w-4 rounded-full border-2 ${
                  action.priority === 'alta'
                    ? 'border-red-400 bg-red-500/30'
                    : action.priority === 'média'
                      ? 'border-yellow-400 bg-yellow-500/30'
                      : 'border-emerald-400 bg-emerald-500/30'
                }`}
              />

              <GlassCard className="p-4 hover:bg-white/[0.05] transition-colors">
                <div className="flex flex-col sm:flex-row sm:items-start gap-3">
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <div className="rounded-lg bg-white/[0.05] p-2 shrink-0 mt-0.5">
                      <Icon className="h-4 w-4 text-emerald-400" />
                    </div>
                    <div className="min-w-0 space-y-1.5">
                      <h4 className="font-semibold text-white text-sm leading-tight">
                        {action.title}
                      </h4>
                      <p className="text-xs text-zinc-400 leading-relaxed">
                        {action.description}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1.5 shrink-0">
                    <Badge
                      variant="outline"
                      className={`text-[10px] px-2 py-0 ${pConfig.className}`}
                    >
                      {pConfig.label}
                    </Badge>
                    <span className="text-[10px] text-zinc-500 font-mono whitespace-nowrap">
                      {action.impact}
                    </span>
                  </div>
                </div>
              </GlassCard>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}

/* ─── Main Dashboard ─── */
export default function DashboardPage() {
  const [caps, setCaps] = useState<Capabilities>(DEFAULT_CAPABILITIES);
  const [roi, setRoi] = useState<ROISliders>(DEFAULT_ROI);
  const [hasInteracted, setHasInteracted] = useState(false);

  const readiness = useMemo(() => calcReadiness(caps), [caps]);
  const roiCalc = useMemo(() => calcROI(roi), [roi]);

  const toggleCapability = useCallback((key: keyof Capabilities) => {
    setHasInteracted(true);
    setCaps((prev) => ({ ...prev, [key]: !prev[key] }));
  }, []);

  const handleRoiChange = useCallback((key: keyof ROISliders, value: number) => {
    setRoi((prev) => ({ ...prev, [key]: value }));
  }, []);

  const chartData = useMemo(
    () => [
      {
        name: 'Receita Atual',
        valor: roiCalc.currentMonthlyRevenue,
        fill: 'rgba(255,255,255,0.15)',
      },
      {
        name: 'Receita Projetada',
        valor: roiCalc.projectedMonthlyRevenue,
        fill: '#10b981',
      },
    ],
    [roiCalc.currentMonthlyRevenue, roiCalc.projectedMonthlyRevenue]
  );

  const activeCapabilities = Object.values(caps).filter(Boolean).length;

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* ─── Header ─── */}
      <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-xl">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-500/20 border border-emerald-500/30">
              <Zap className="h-5 w-5 text-emerald-400" />
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight text-white leading-none">
                ZEHLA SmartHotel
              </h1>
              <p className="text-[11px] text-zinc-500 mt-0.5">Cognitive OS para Pousadas</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 rounded-lg bg-white/[0.04] border border-white/[0.06] px-3 py-1.5">
              <div className="h-6 w-6 rounded-full bg-emerald-500/20 flex items-center justify-center">
                <Users className="h-3.5 w-3.5 text-emerald-400" />
              </div>
              <div className="text-sm">
                <span className="text-zinc-400 text-xs">Cliente: </span>
                <span className="text-white font-medium">Pousada Serenity</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 sm:px-6 py-6 sm:py-8">
        {/* Page Title */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 sm:mb-8"
        >
          <h2 className="text-2xl sm:text-3xl font-bold text-white">Dashboard de Prontidão</h2>
          <p className="text-sm text-zinc-400 mt-1">
            Avalie a maturidade digital e simule o retorno do investimento da IA na sua pousada
          </p>
        </motion.div>

        {/* Tabs */}
        <Tabs defaultValue="prontidao" className="space-y-6">
          <TabsList className="bg-white/[0.04] border border-white/[0.06] h-11 p-1 rounded-xl">
            <TabsTrigger
              value="prontidao"
              className="data-[state=active]:bg-emerald-500/20 data-[state=active]:text-emerald-300 rounded-lg text-sm gap-2 px-4"
            >
              <Shield className="h-4 w-4" />
              <span className="hidden sm:inline">Prontidão</span>
              <span className="sm:hidden">Prontidão</span>
            </TabsTrigger>
            <TabsTrigger
              value="roi"
              className="data-[state=active]:bg-emerald-500/20 data-[state=active]:text-emerald-300 rounded-lg text-sm gap-2 px-4"
            >
              <TrendingUp className="h-4 w-4" />
              <span>Simulador ROI</span>
            </TabsTrigger>
            <TabsTrigger
              value="plano"
              className="data-[state=active]:bg-emerald-500/20 data-[state=active]:text-emerald-300 rounded-lg text-sm gap-2 px-4"
            >
              <Rocket className="h-4 w-4" />
              <span>Plano de Ação</span>
            </TabsTrigger>
          </TabsList>

          {/* ═══════════ TAB 1: PRONTIDÃO ═══════════ */}
          <TabsContent value="prontidao">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Gauge Card */}
              <GlassCard className="p-6 sm:p-8 flex flex-col items-center justify-center">
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: 'spring', stiffness: 100, damping: 20 }}
                >
                  <ReadinessGauge score={readiness.score} animated={hasInteracted} />
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="mt-6 text-center space-y-3"
                >
                  <CategoryBadge category={readiness.category} />
                  <p className="text-sm text-zinc-400">
                    {activeCapabilities} de {CAPABILITY_CONFIG.length} capacidades ativas
                  </p>
                </motion.div>

                <div className="mt-6 w-full">
                  <div className="h-2 rounded-full bg-white/[0.06] overflow-hidden">
                    <motion.div
                      className={`h-full rounded-full bg-gradient-to-r ${getGaugeGradient(readiness.score)}`}
                      initial={{ width: 0 }}
                      animate={{ width: `${readiness.score}%` }}
                      transition={{ type: 'spring', stiffness: 60, damping: 20, duration: 0.8 }}
                    />
                  </div>
                  <div className="flex justify-between mt-1.5 text-[10px] text-zinc-600">
                    <span>Co-Pilots (0)</span>
                    <span>Brains (40-75)</span>
                    <span>Agents (76+)</span>
                  </div>
                </div>
              </GlassCard>

              {/* Checklist Card */}
              <GlassCard className="p-6">
                <div className="flex items-center gap-2 mb-5">
                  <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                  <h3 className="text-base font-semibold text-white">Checklist de Capacidades</h3>
                </div>

                <div className="space-y-2.5 max-h-[420px] overflow-y-auto pr-1 custom-scrollbar">
                  {CAPABILITY_CONFIG.map((cap, index) => {
                    const Icon = cap.icon;
                    const isActive = caps[cap.key];
                    return (
                      <motion.div
                        key={cap.key}
                        initial={{ opacity: 0, x: 10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.04 }}
                        className={`flex items-center justify-between rounded-xl p-3 border transition-colors ${
                          isActive
                            ? 'bg-emerald-500/[0.06] border-emerald-500/20'
                            : 'bg-white/[0.02] border-white/[0.04] hover:bg-white/[0.04]'
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div
                            className={`rounded-lg p-2 shrink-0 ${
                              isActive ? 'bg-emerald-500/20' : 'bg-white/[0.05]'
                            }`}
                          >
                            <Icon
                              className={`h-4 w-4 ${isActive ? 'text-emerald-400' : 'text-zinc-500'}`}
                            />
                          </div>
                          <span
                            className={`text-sm truncate ${
                              isActive ? 'text-white' : 'text-zinc-400'
                            }`}
                          >
                            {cap.label}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 shrink-0 ml-2">
                          <span
                            className={`text-xs font-mono ${
                              isActive ? 'text-emerald-400' : 'text-zinc-600'
                            }`}
                          >
                            +{cap.points}
                          </span>
                          <Switch
                            checked={isActive}
                            onCheckedChange={() => toggleCapability(cap.key)}
                            className="data-[state=checked]:bg-emerald-500"
                          />
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </GlassCard>

              {/* Recommendation */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="lg:col-span-2"
              >
                <RecommendationText category={readiness.category} score={readiness.score} />
              </motion.div>
            </div>
          </TabsContent>

          {/* ═══════════ TAB 2: SIMULADOR ROI ═══════════ */}
          <TabsContent value="roi">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Sliders Column */}
              <div className="lg:col-span-1 space-y-4">
                <GlassCard className="p-5">
                  <div className="flex items-center gap-2 mb-5">
                    <SlidersHorizontal className="h-5 w-5 text-emerald-400" />
                    <h3 className="text-base font-semibold text-white">Parâmetros</h3>
                  </div>

                  {/* Rooms Count */}
                  <div className="space-y-5">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <label className="text-sm text-zinc-300 flex items-center gap-2">
                          <Hotel className="h-4 w-4 text-zinc-500" />
                          Quartos
                        </label>
                        <span className="text-sm font-mono font-semibold text-white">
                          {roi.roomsCount}
                        </span>
                      </div>
                      <Slider
                        value={[roi.roomsCount]}
                        onValueChange={([v]) => handleRoiChange('roomsCount', v)}
                        min={1}
                        max={200}
                        step={1}
                        className="[&_[data-slot=slider-range]]:bg-emerald-500 [&_[data-slot=slider-thumb]]:border-emerald-500"
                      />
                      <div className="flex justify-between text-[10px] text-zinc-600">
                        <span>1</span>
                        <span>200</span>
                      </div>
                    </div>

                    {/* ADR */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <label className="text-sm text-zinc-300 flex items-center gap-2">
                          <DollarSign className="h-4 w-4 text-zinc-500" />
                          Diária Média
                        </label>
                        <span className="text-sm font-mono font-semibold text-white">
                          {formatBRL(roi.adr)}
                        </span>
                      </div>
                      <Slider
                        value={[roi.adr]}
                        onValueChange={([v]) => handleRoiChange('adr', v)}
                        min={50}
                        max={2000}
                        step={10}
                        className="[&_[data-slot=slider-range]]:bg-emerald-500 [&_[data-slot=slider-thumb]]:border-emerald-500"
                      />
                      <div className="flex justify-between text-[10px] text-zinc-600">
                        <span>R$ 50</span>
                        <span>R$ 2.000</span>
                      </div>
                    </div>

                    {/* Occupancy */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <label className="text-sm text-zinc-300 flex items-center gap-2">
                          <Percent className="h-4 w-4 text-zinc-500" />
                          Ocupação Atual
                        </label>
                        <span className="text-sm font-mono font-semibold text-white">
                          {roi.occupancy}%
                        </span>
                      </div>
                      <Slider
                        value={[roi.occupancy]}
                        onValueChange={([v]) => handleRoiChange('occupancy', v)}
                        min={10}
                        max={100}
                        step={1}
                        className="[&_[data-slot=slider-range]]:bg-emerald-500 [&_[data-slot=slider-thumb]]:border-emerald-500"
                      />
                      <div className="flex justify-between text-[10px] text-zinc-600">
                        <span>10%</span>
                        <span>100%</span>
                      </div>
                    </div>

                    {/* Staff Hourly Rate */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <label className="text-sm text-zinc-300 flex items-center gap-2">
                          <Clock className="h-4 w-4 text-zinc-500" />
                          Custo Hora/Equipe
                        </label>
                        <span className="text-sm font-mono font-semibold text-white">
                          {formatBRL(roi.staffHourlyRate)}/h
                        </span>
                      </div>
                      <Slider
                        value={[roi.staffHourlyRate]}
                        onValueChange={([v]) => handleRoiChange('staffHourlyRate', v)}
                        min={10}
                        max={100}
                        step={1}
                        className="[&_[data-slot=slider-range]]:bg-emerald-500 [&_[data-slot=slider-thumb]]:border-emerald-500"
                      />
                      <div className="flex justify-between text-[10px] text-zinc-600">
                        <span>R$ 10/h</span>
                        <span>R$ 100/h</span>
                      </div>
                    </div>
                  </div>
                </GlassCard>

                {/* Payback Badge */}
                {roiCalc.paybackMonths && (
                  <motion.div
                    key={roiCalc.paybackMonths}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                  >
                    <GlassCard className="p-5 text-center">
                      <p className="text-xs text-zinc-500 mb-2 uppercase tracking-wider">
                        Payback estimado
                      </p>
                      <div className="text-3xl font-bold text-emerald-400">
                        {roiCalc.paybackMonths} meses
                      </div>
                      <p className="text-[11px] text-zinc-500 mt-1">para retorno do investimento</p>
                    </GlassCard>
                  </motion.div>
                )}
              </div>

              {/* Results Column */}
              <div className="lg:col-span-2 space-y-4">
                {/* Revenue Cards Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <motion.div
                    key={`occ-${roiCalc.revenueGain}`}
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <GlassCard className="p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="rounded-md bg-emerald-500/10 p-1.5">
                          <TrendingUp className="h-4 w-4 text-emerald-400" />
                        </div>
                        <span className="text-xs text-zinc-400">Ganho com Ocupação</span>
                      </div>
                      <p className="text-xl font-bold text-white">
                        {formatBRL(roiCalc.revenueGain)}
                      </p>
                      <p className="text-[10px] text-emerald-400 mt-1">
                        +{roiCalc.boostPercent}% de ocupação projetada
                      </p>
                    </GlassCard>
                  </motion.div>

                  <motion.div
                    key={`ota-${roiCalc.otaSavings}`}
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <GlassCard className="p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="rounded-md bg-emerald-500/10 p-1.5">
                          <DollarSign className="h-4 w-4 text-emerald-400" />
                        </div>
                        <span className="text-xs text-zinc-400">Economia OTA</span>
                      </div>
                      <p className="text-xl font-bold text-white">
                        {formatBRL(roiCalc.otaSavings)}
                      </p>
                      <p className="text-[10px] text-emerald-400 mt-1">Redução de comissões</p>
                    </GlassCard>
                  </motion.div>

                  <motion.div
                    key={`staff-${roiCalc.staffSavings}`}
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <GlassCard className="p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="rounded-md bg-emerald-500/10 p-1.5">
                          <Clock className="h-4 w-4 text-emerald-400" />
                        </div>
                        <span className="text-xs text-zinc-400">Economia com Equipe</span>
                      </div>
                      <p className="text-xl font-bold text-white">
                        {formatBRL(roiCalc.staffSavings)}
                      </p>
                      <p className="text-[10px] text-emerald-400 mt-1">3h/dia automatizadas</p>
                    </GlassCard>
                  </motion.div>
                </div>

                {/* Big ROI Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <motion.div
                    key={`monthly-${roiCalc.roiMonthly}`}
                    initial={{ opacity: 0, scale: 0.97 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ type: 'spring', stiffness: 120, damping: 20 }}
                  >
                    <GlassCard className="p-6 border-emerald-500/20">
                      <div className="flex items-center gap-2 mb-3">
                        <div className="rounded-lg bg-emerald-500/20 p-2">
                          <TrendingUp className="h-5 w-5 text-emerald-400" />
                        </div>
                        <div>
                          <p className="text-sm text-zinc-400">ROI Mensal Estimado</p>
                        </div>
                      </div>
                      <p className="text-3xl sm:text-4xl font-bold text-emerald-400 tabular-nums">
                        {formatBRL(roiCalc.roiMonthly)}
                      </p>
                      <p className="text-xs text-zinc-500 mt-2">
                        Ganho total mensal com ZEHLA SmartHotel
                      </p>
                    </GlassCard>
                  </motion.div>

                  <motion.div
                    key={`annual-${roiCalc.roiAnnual}`}
                    initial={{ opacity: 0, scale: 0.97 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ type: 'spring', stiffness: 120, damping: 20, delay: 0.05 }}
                  >
                    <GlassCard className="p-6 border-emerald-500/20">
                      <div className="flex items-center gap-2 mb-3">
                        <div className="rounded-lg bg-emerald-500/20 p-2">
                          <BarChart3 className="h-5 w-5 text-emerald-400" />
                        </div>
                        <div>
                          <p className="text-sm text-zinc-400">ROI Anual Estimado</p>
                        </div>
                      </div>
                      <p className="text-3xl sm:text-4xl font-bold text-emerald-400 tabular-nums">
                        {formatBRL(roiCalc.roiAnnual)}
                      </p>
                      <p className="text-xs text-zinc-500 mt-2">
                        Projeção anualizada do retorno
                      </p>
                    </GlassCard>
                  </motion.div>
                </div>

                {/* Chart */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <GlassCard className="p-5">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-sm font-semibold text-white flex items-center gap-2">
                        <LineChart className="h-4 w-4 text-emerald-400" />
                        Comparativo de Receita Mensal
                      </h4>
                      <div className="flex items-center gap-3 text-[10px]">
                        <span className="flex items-center gap-1.5">
                          <span className="h-2.5 w-2.5 rounded-sm bg-white/15" />
                          Atual
                        </span>
                        <span className="flex items-center gap-1.5">
                          <span className="h-2.5 w-2.5 rounded-sm bg-emerald-500" />
                          Projetada
                        </span>
                      </div>
                    </div>
                    <div className="h-56">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={chartData} barCategoryGap="20%">
                          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                          <XAxis
                            dataKey="name"
                            tick={{ fill: '#71717a', fontSize: 12 }}
                            axisLine={{ stroke: 'rgba(255,255,255,0.08)' }}
                            tickLine={false}
                          />
                          <YAxis
                            tick={{ fill: '#71717a', fontSize: 11 }}
                            axisLine={false}
                            tickLine={false}
                            tickFormatter={(v: number) =>
                              v >= 1000 ? `${(v / 1000).toFixed(0)}k` : String(v)
                            }
                          />
                          <Tooltip
                            contentStyle={{
                              backgroundColor: 'rgba(10,10,10,0.95)',
                              border: '1px solid rgba(255,255,255,0.1)',
                              borderRadius: '10px',
                              color: '#fff',
                              fontSize: '12px',
                            }}
                            formatter={(value: number) => [formatBRL(value), 'Receita']}
                          />
                          <Bar dataKey="valor" radius={[6, 6, 0, 0]}>
                            {chartData.map((entry, index) => (
                              <rect key={index} fill={entry.fill} />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="mt-3 flex items-center justify-between text-xs text-zinc-500">
                      <span>
                        Ocupação projetada: <strong className="text-emerald-400">{roiCalc.projectedOccupancy}%</strong>
                      </span>
                      <span>
                        Boost:{' '}
                        <strong className="text-emerald-400">+{roiCalc.boostPercent}%</strong>
                      </span>
                    </div>
                  </GlassCard>
                </motion.div>
              </div>
            </div>
          </TabsContent>

          {/* ═══════════ TAB 3: PLANO DE AÇÃO ═══════════ */}
          <TabsContent value="plano">
            <div className="space-y-6">
              {/* Summary Banner */}
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <GlassCard className="p-5 border-emerald-500/10">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="rounded-xl bg-emerald-500/10 p-2.5">
                        <Rocket className="h-5 w-5 text-emerald-400" />
                      </div>
                      <div>
                        <h3 className="text-base font-semibold text-white">
                          Plano de Ação Personalizado
                        </h3>
                        <p className="text-xs text-zinc-400 mt-0.5">
                          Baseado na sua pontuação de {readiness.score}/100 —{' '}
                          {readiness.category}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge
                        variant="outline"
                        className="border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
                      >
                        {getActionPlan(readiness.score, caps).length} ações
                      </Badge>
                      <Badge
                        variant="outline"
                        className="border-yellow-500/30 bg-yellow-500/10 text-yellow-300"
                      >
                        +{100 - readiness.score} pts disponíveis
                      </Badge>
                    </div>
                  </div>
                </GlassCard>
              </motion.div>

              {/* Priority Legend */}
              <div className="flex items-center gap-4 px-2">
                <span className="text-xs text-zinc-500">Prioridade:</span>
                <span className="flex items-center gap-1.5 text-xs text-red-300">
                  <span className="h-2 w-2 rounded-full bg-red-500" /> Alta
                </span>
                <span className="flex items-center gap-1.5 text-xs text-yellow-300">
                  <span className="h-2 w-2 rounded-full bg-yellow-500" /> Média
                </span>
                <span className="flex items-center gap-1.5 text-xs text-emerald-300">
                  <span className="h-2 w-2 rounded-full bg-emerald-500" /> Baixa
                </span>
              </div>

              {/* Timeline */}
              <ActionPlanTimeline score={readiness.score} caps={caps} />

              {/* CTA */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="pt-4"
              >
                <GlassCard className="p-6 text-center border-emerald-500/10">
                  <p className="text-sm text-zinc-400 mb-4">
                    Pronto para transformar sua pousada com inteligência artificial?
                  </p>
                  <Button className="bg-emerald-500 hover:bg-emerald-600 text-white gap-2 px-6 rounded-xl">
                    Iniciar Teste Gratuito
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </GlassCard>
              </motion.div>
            </div>
          </TabsContent>
        </Tabs>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/[0.04] mt-auto">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="text-[11px] text-zinc-600">
            © {new Date().getFullYear()} ZEHLA SmartHotel — Cognitive OS para Pousadas Brasileiras
          </p>
          <p className="text-[11px] text-zinc-600">
            Valores simulados baseados em estimativas de mercado
          </p>
        </div>
      </footer>
    </div>
  );
}

/* Need SlidersHorizontal icon — using a simple alias since it's not in lucide-react under that name */
function SlidersHorizontal(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <line x1="4" x2="4" y1="21" y2="14" />
      <line x1="4" x2="4" y1="10" y2="3" />
      <line x1="12" x2="12" y1="21" y2="12" />
      <line x1="12" x2="12" y1="8" y2="3" />
      <line x1="20" x2="20" y1="21" y2="16" />
      <line x1="20" x2="20" y1="12" y2="3" />
      <line x1="2" x2="6" y1="14" y2="14" />
      <line x1="10" x2="14" y1="8" y2="8" />
      <line x1="18" x2="22" y1="16" y2="16" />
    </svg>
  );
}