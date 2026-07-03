'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { DDCHeader } from '@/components/ddc/DDCHeader';
import { RevenueMetrics } from '@/components/ddc/RevenueMetrics';
import { AILiveFeed } from '@/components/ddc/AILiveFeed';

import { TrainingCenter } from '@/components/ddc/TrainingCenter';
import { QuickActionsBar } from '@/components/ddc/QuickActionsBar';
import { useDDCMetrics } from '@/lib/ddc/use-ddc-metrics';
import { useAILiveFeed } from '@/lib/ddc/use-ai-live-feed';
import { useGuestPipeline } from '@/lib/ddc/use-guest-pipeline';
import { useDDCNotifications } from '@/lib/ddc/use-ddc-notifications';
import { mockRevenueMetrics, mockPropertySettings } from '@/lib/ddc/mock-data';
import { adaptRevenueMetrics } from '@/lib/ddc/ddc-mapper';
import type { AIStatus } from '@/types/ddc';
import { ZelladorChat } from '@/components/ddc/ZelladorChat';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Toaster, toast } from 'sonner';
import {
  Settings,
  MessageSquare,
  Building2,
  Smartphone,
  CreditCard,
  Sliders,
  Sparkles,
  Lock,
  CheckCircle2,
  Activity,
  ChevronRight,
  ShieldCheck,
  Save,
  Loader2,
  Info,
  X,
  Zap,
  Phone,
  Compass,
  MessageCircle,
  Users,
  Calendar,
  TrendingUp,
  Bell,
  GraduationCap,
  Search,
  Filter,
  ChevronDown,
  Clock,
  Star,
  Eye,
  CheckCheck,
  Download,
  Plus,
  BarChart2,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  MapPin,
  PhoneCall,
  AlertCircle,
  UserCheck,
  BookOpen,
  MoreHorizontal,
  RefreshCw,
  BellOff,
} from 'lucide-react';

export default function DDCDashboardPage() {
  // Custom hooks
  const { metrics, aiStatus, isLoading } = useDDCMetrics('today', true);
  const { conversations, selectedConversation, selectConversation, sendMessage, escalateConversation } = useAILiveFeed();
  const { allGuests } = useGuestPipeline();
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useDDCNotifications(true);

  // Local state — navigation
  const [activeTab, setActiveTab] = useState('overview');
  const [propertyName, setPropertyName] = useState('Minha Pousada');
  const [currentPlan, setCurrentPlan] = useState<string>('trial');
  const [showOnboarding, setShowOnboarding] = useState(true);

  // Settings states
  const [subTab, setSubTab] = useState('geral');
  const [showRecargaMock, setShowRecargaMock] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editPropertyName, setEditPropertyName] = useState('');
  const [aiVoiceTone, setAiVoiceTone] = useState('friendly');

  // Bookings state
  const [bookings, setBookings] = useState<any[]>([]);
  const [bookingsLoading, setBookingsLoading] = useState(false);
  const [bookingsFilter, setBookingsFilter] = useState('all');

  // Analytics state — raw API data (avoids RevenueMetrics type mismatch)
  const [analyticsData, setAnalyticsData] = useState<Record<string, any>>({
    today: {}, week: {}, month: {}
  });
  const [analyticsPeriod, setAnalyticsPeriod] = useState<'today' | 'week' | 'month'>('today');
  const [analyticsLoading, setAnalyticsLoading] = useState(false);

  // Fetch raw analytics data when analytics tab is active
  useEffect(() => {
    if (activeTab !== 'analytics') return;
    setAnalyticsLoading(true);
    Promise.all([
      fetch('/api/ddc/metrics?period=today').then(r => r.json()),
      fetch('/api/ddc/metrics?period=week').then(r => r.json()),
      fetch('/api/ddc/metrics?period=month').then(r => r.json()),
    ]).then(([todayRes, weekRes, monthRes]) => {
      setAnalyticsData({
        today: todayRes?.data || {},
        week: weekRes?.data || {},
        month: monthRes?.data || {},
      });
    }).catch(() => {}).finally(() => setAnalyticsLoading(false));
  }, [activeTab]);

  // Guests state
  const [guestSearch, setGuestSearch] = useState('');
  const [guestStatusFilter, setGuestStatusFilter] = useState('all');

  // Messages state
  const [msgSearch, setMsgSearch] = useState('');
  const [msgStatusFilter, setMsgStatusFilter] = useState('all');

  const router = useRouter();

  useEffect(() => {
    fetch('/api/ddc/property-name')
      .then(r => r.json())
      .then(d => {
        const name = d.name || 'Minha Pousada';
        setPropertyName(name);
        setEditPropertyName(name);
        setCurrentPlan(d.plan || 'trial');
      })
      .catch(() => {
        setPropertyName('Minha Pousada');
        setEditPropertyName('Minha Pousada');
        setCurrentPlan('trial');
      });
  }, []);

  // Fetch bookings when tab is active
  useEffect(() => {
    if (activeTab !== 'bookings') return;
    setBookingsLoading(true);
    const params = bookingsFilter !== 'all' ? `?status=${bookingsFilter}` : '';
    fetch(`/api/ddc/bookings${params}`)
      .then(r => r.json())
      .then(d => setBookings(d?.data?.items || []))
      .catch(() => setBookings([]))
      .finally(() => setBookingsLoading(false));
  }, [activeTab, bookingsFilter]);

  const aiStatusLocal: AIStatus = aiStatus?.status || 'online';

  const handleActionClick = (action: string) => {
    setActiveTab(action);
  };

  const handleNotificationClick = () => {
    setActiveTab('notifications');
  };

  async function handleSaveGeral(e: React.FormEvent) {
    e.preventDefault();
    setIsSaving(true);
    try {
      const response = await fetch('/api/ddc/property-name', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: editPropertyName }),
      });
      if (response.ok) {
        setPropertyName(editPropertyName);
        toast.success('Configurações da pousada salvas com sucesso!');
      } else {
        toast.error('Erro ao salvar configurações.');
      }
    } catch {
      toast.error('Erro de conexão ao salvar configurações.');
    } finally {
      setIsSaving(false);
    }
  }

  const fadeIn = {
    hidden: { opacity: 0, y: 8 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.3, ease: 'easeOut' as const }
    }
  } as const;

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.07 }
    }
  };

  // ─── Helpers ────────────────────────────────────────────────
  const getStatusBadge = (status: string) => {
    const map: Record<string, { label: string; cls: string }> = {
      active: { label: 'Ativo', cls: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' },
      escalated: { label: 'Escalado', cls: 'bg-red-500/10 text-red-400 border-red-500/20' },
      resolved: { label: 'Resolvido', cls: 'bg-zinc-700/50 text-zinc-400 border-zinc-700' },
      pending: { label: 'Pendente', cls: 'bg-amber-500/10 text-amber-400 border-amber-500/20' },
      confirmed: { label: 'Confirmada', cls: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' },
      checked_in: { label: 'Check-in', cls: 'bg-blue-500/10 text-blue-400 border-blue-500/20' },
      checked_out: { label: 'Check-out', cls: 'bg-zinc-700/50 text-zinc-400 border-zinc-700' },
      cancelled: { label: 'Cancelada', cls: 'bg-red-500/10 text-red-400 border-red-500/20' },
      new: { label: 'Novo', cls: 'bg-blue-500/10 text-blue-400 border-blue-500/20' },
    };
    const cfg = map[status] || { label: status, cls: 'bg-zinc-800 text-zinc-400 border-zinc-700' };
    return (
      <span className={`text-[9px] font-bold px-2 py-0.5 rounded border ${cfg.cls}`}>
        {cfg.label}
      </span>
    );
  };

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

  const formatDate = (d: string | Date) => {
    const date = new Date(d);
    return date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: '2-digit' });
  };

  // ─── Section Header Component (inline) ─────────────────────
  const SectionHeader = ({
    icon: Icon,
    title,
    subtitle,
    actions,
  }: {
    icon: React.ElementType;
    title: string;
    subtitle?: string;
    actions?: React.ReactNode;
  }) => (
    <div className="flex items-start justify-between gap-4 mb-6">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/15 flex items-center justify-center shrink-0">
          <Icon className="w-4.5 h-4.5 text-emerald-400" />
        </div>
        <div>
          <h2 className="text-sm font-extrabold text-white">{title}</h2>
          {subtitle && <p className="text-[11px] text-zinc-500 mt-0.5">{subtitle}</p>}
        </div>
      </div>
      {actions && <div className="flex items-center gap-2 flex-wrap">{actions}</div>}
    </div>
  );

  // ─── VIEW RENDERER ──────────────────────────────────────────
  const renderActiveTab = () => {
    // ── OVERVIEW (Dashboard) ──────────────────────────────────
    if (activeTab === 'overview') {
      return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* LEFT PANEL — 2/3 width */}
          <div className="lg:col-span-2 space-y-5">
            <motion.div variants={fadeIn} initial="hidden" animate="visible">
              <RevenueMetrics metrics={adaptRevenueMetrics(metrics) || mockRevenueMetrics} />
            </motion.div>
            <motion.div variants={fadeIn} initial="hidden" animate="visible">
              <AILiveFeed
                conversations={conversations}
                isConnected={true}
                onReply={(cId, msg) => sendMessage(cId, msg)}
                onEscalate={(cId) => escalateConversation(cId)}
                onViewDetails={(cId) => selectConversation(cId)}
              />
            </motion.div>
          </div>

          {/* RIGHT PANEL — 1/3 width */}
          <div className="space-y-4">
            <AnimatePresence>
              {showOnboarding && (
                <motion.div
                  initial={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.25, ease: 'easeOut' }}
                  className="bg-[#121216] border border-white/[0.05] rounded-xl overflow-hidden"
                >
                  <div className="flex items-center justify-between gap-2 px-4 pt-4 pb-3 border-b border-white/[0.04]">
                    <div className="flex items-center gap-2">
                      <span>🚀</span>
                      <span className="text-xs font-bold text-white">Primeiros passos</span>
                    </div>
                    <button
                      onClick={() => { setShowOnboarding(false); toast.info('Guia ocultado.'); }}
                      className="p-1 rounded hover:bg-white/[0.06] text-zinc-500 hover:text-zinc-300 transition-colors"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <div className="p-4 space-y-2">
                    <div className="flex items-center gap-2.5 py-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      <div>
                        <p className="text-xs font-semibold text-white">FAQ da pousada indexado</p>
                        <p className="text-zinc-500 text-[10px] mt-0.5">Regras e respostas prontas para a IA.</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2.5 py-2 border-t border-white/[0.03]">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      <div>
                        <p className="text-xs font-semibold text-white">WhatsApp conectado</p>
                        <p className="text-zinc-500 text-[10px] mt-0.5">Fluxo de mensagens ativo.</p>
                      </div>
                    </div>
                    <button
                      onClick={() => { setActiveTab('settings'); setSubTab('linkinbio'); }}
                      className="w-full border-t border-white/[0.03] flex items-center justify-between gap-2 pt-3 text-left group cursor-pointer"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="w-4 h-4 rounded-full border border-zinc-700 flex items-center justify-center text-zinc-500 group-hover:border-emerald-500/40 group-hover:text-emerald-400 transition-colors shrink-0">
                          <span className="text-[8px] font-bold">3</span>
                        </div>
                        <p className="text-xs font-semibold text-zinc-400 group-hover:text-emerald-400 transition-colors">Customizar Link-in-Bio</p>
                      </div>
                      <ChevronRight className="w-3.5 h-3.5 text-zinc-700 group-hover:text-emerald-400 transition-colors shrink-0" />
                    </button>

                    <div className="pt-3 border-t border-white/[0.03]">
                      <p className="text-[11px] font-semibold text-emerald-400 mb-2">Teste ao vivo</p>
                      <select
                        id="simulation-msg"
                        className="w-full bg-[#0a0a0f] border border-white/[0.07] rounded-lg p-1.5 text-[10px] text-zinc-300 focus:outline-none focus:border-emerald-500/30 mb-2"
                        defaultValue="casal"
                      >
                        <option value="casal">Reservas: quarto de casal para amanhã?</option>
                        <option value="pets">Pets: vocês aceitam animais?</option>
                        <option value="rules">Check-in: horários e Wi-Fi?</option>
                        <option value="pool">Lazer: piscina e estacionamento?</option>
                      </select>
                      <Button
                        onClick={async () => {
                          const selectEl = document.getElementById('simulation-msg') as HTMLSelectElement;
                          const value = selectEl?.value;
                          let message = 'Olá, tem quarto de casal disponível para amanhã? Qual o valor?';
                          if (value === 'pets') message = 'Olá! Vocês aceitam animais de estimação (pets)?';
                          else if (value === 'rules') message = 'Qual o horário do check-in e check-out de vocês? Tem Wi-Fi?';
                          else if (value === 'pool') message = 'Boa tarde, queria saber se tem estacionamento incluso e piscina.';
                          toast.promise(
                            fetch('/api/ddc/simulate-message', {
                              method: 'POST',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({ message }),
                            }).then(async r => { if (!r.ok) throw new Error(); return r.json(); }),
                            { loading: 'Enviando...', success: 'Mensagem simulada com sucesso!', error: 'Falha ao simular.' }
                          );
                        }}
                        className="w-full py-2 h-auto bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px] rounded-lg flex items-center justify-center gap-1.5 cursor-pointer transition-colors active:scale-[0.98]"
                      >
                        <Zap className="w-3 h-3" /> Simular Hóspede
                      </Button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Status do Agente + Notificações — single unified card */}
            <div className="bg-[#121216] border border-white/[0.05] rounded-xl overflow-hidden">
              {/* Agent status row */}
              <div className="px-4 pt-4 pb-3 border-b border-white/[0.04]">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold text-white">Agente IA</span>
                  <div className="flex items-center gap-1.5">
                    <div className={`w-1.5 h-1.5 rounded-full ${aiStatusLocal === 'online' ? 'bg-emerald-500 animate-pulse' : aiStatusLocal === 'processing' ? 'bg-violet-500 animate-pulse' : aiStatusLocal === 'error' ? 'bg-red-500' : 'bg-zinc-600'}`} />
                    <span className="text-[10px] text-zinc-400 capitalize">{aiStatusLocal}</span>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <div className="text-center">
                    <div className="text-base font-extrabold text-white font-mono">{aiStatus?.activeConversations ?? 12}</div>
                    <div className="text-[9px] text-zinc-600 mt-0.5">Ativas</div>
                  </div>
                  <div className="text-center border-x border-white/[0.04]">
                    <div className="text-base font-extrabold text-white font-mono">{metrics?.today?.aiAttended ?? 45}</div>
                    <div className="text-[9px] text-zinc-600 mt-0.5">Hoje</div>
                  </div>
                  <div className="text-center">
                    <div className="text-base font-extrabold text-white font-mono">{aiStatus?.averageResponseTime ?? 2.3}s</div>
                    <div className="text-[9px] text-zinc-600 mt-0.5">Resposta</div>
                  </div>
                </div>
              </div>

              {/* Notifications section */}
              <div className="px-4 py-3">
                <div className="flex items-center justify-between mb-2.5">
                  <span className="text-xs font-bold text-white">Notificações</span>
                  {unreadCount > 0 && (
                    <span className="text-[9px] font-bold px-1.5 py-0.5 bg-red-500/10 text-red-400 border border-red-500/20 rounded">{unreadCount} novas</span>
                  )}
                </div>
                <div className="space-y-1.5">
                  {notifications.slice(0, 3).map(notif => (
                    <div
                      key={notif.id}
                      className={`flex items-start gap-2 p-2 rounded-lg cursor-pointer transition-all hover:bg-white/[0.02] ${notif.status === 'unread' ? 'bg-emerald-500/[0.03]' : ''}`}
                      onClick={() => { markAsRead(notif.id); toast.info(notif.title); }}
                    >
                      <div className={`w-1.5 h-1.5 rounded-full shrink-0 mt-1.5 ${notif.priority === 'urgent' ? 'bg-red-500 animate-pulse' : notif.priority === 'high' ? 'bg-amber-500' : 'bg-blue-500'}`} />
                      <div className="min-w-0">
                        <div className="text-[11px] font-semibold text-white truncate">{notif.title}</div>
                        <div className="text-[10px] text-zinc-600 truncate">{notif.message}</div>
                      </div>
                    </div>
                  ))}
                  {notifications.length === 0 && (
                    <p className="text-[10px] text-zinc-600 text-center py-3">Sem notificações.</p>
                  )}
                  <button
                    onClick={() => setActiveTab('notifications')}
                    className="w-full text-center text-[10px] text-emerald-400 hover:text-emerald-300 font-semibold pt-1.5 transition-colors"
                  >
                    Ver todas →
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }

    // ── MESSAGES (Mensagens) ──────────────────────────────────
    if (activeTab === 'messages') {
      const filtered = conversations.filter(c => {
        const matchSearch = !msgSearch || c.guestName?.toLowerCase().includes(msgSearch.toLowerCase()) || c.guestPhone?.includes(msgSearch);
        const matchStatus = msgStatusFilter === 'all' || c.status === msgStatusFilter;
        return matchSearch && matchStatus;
      });

      return (
        <motion.div variants={fadeIn} initial="hidden" animate="visible" className="space-y-4">
          <SectionHeader
            icon={MessageCircle}
            title="Mensagens"
            subtitle={`${conversations.length} conversa${conversations.length !== 1 ? 's' : ''} ativa${conversations.length !== 1 ? 's' : ''} — atualiza em tempo real via IA`}
            actions={
              <>
                <div className="relative">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-500" />
                  <input
                    value={msgSearch}
                    onChange={e => setMsgSearch(e.target.value)}
                    placeholder="Buscar por nome ou telefone..."
                    className="pl-8 pr-3 py-1.5 bg-[#121216] border border-white/[0.06] rounded-lg text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:border-emerald-500/30 w-52"
                  />
                </div>
                <select
                  value={msgStatusFilter}
                  onChange={e => setMsgStatusFilter(e.target.value)}
                  className="bg-[#121216] border border-white/[0.06] rounded-lg px-2.5 py-1.5 text-xs text-zinc-300 focus:outline-none focus:border-emerald-500/30"
                >
                  <option value="all">Todos os status</option>
                  <option value="active">Ativo</option>
                  <option value="escalated">Escalado</option>
                  <option value="resolved">Resolvido</option>
                </select>
                <button
                  onClick={() => toast.promise(fetch('/api/ddc/simulate-message', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ message: 'Olá, gostaria de informações sobre reserva.' }) }).then(r => r.json()), { loading: 'Simulando...', success: 'Mensagem simulada!', error: 'Erro' })}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 text-emerald-400 text-xs font-bold rounded-lg transition-all cursor-pointer"
                >
                  <Zap className="w-3.5 h-3.5" /> Simular
                </button>
              </>
            }
          />

          {/* Full-width AILiveFeed + detail panel */}
          <div className="grid grid-cols-1 xl:grid-cols-5 gap-4">
            {/* Lista */}
            <div className="xl:col-span-2 bg-[#121216] border border-white/[0.04] rounded-xl overflow-hidden">
              <div className="p-3 border-b border-white/[0.04] flex items-center justify-between">
                <span className="text-[10px] font-extrabold text-white uppercase tracking-wider">Conversas ({filtered.length})</span>
                <div className="flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                  <span className="text-[9px] text-emerald-400 font-mono">LIVE</span>
                </div>
              </div>
              <div className="divide-y divide-white/[0.02] max-h-[600px] overflow-y-auto">
                {filtered.length === 0 && (
                  <div className="flex flex-col items-center justify-center py-12 gap-3">
                    <MessageCircle className="w-8 h-8 text-zinc-700" />
                    <p className="text-xs text-zinc-500">Nenhuma conversa encontrada</p>
                  </div>
                )}
                {filtered.map(c => (
                  <button
                    key={c.id}
                    onClick={() => selectConversation(c.id)}
                    className={`w-full text-left p-3 hover:bg-white/[0.02] transition-all group ${selectedConversation?.id === c.id ? 'bg-emerald-500/5 border-l-2 border-emerald-500/50' : ''}`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 border border-emerald-500/15 flex items-center justify-center shrink-0 text-xs font-bold text-emerald-400">
                        {(c.guestName || 'H')[0].toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1 mb-0.5">
                          <span className="text-xs font-bold text-white truncate">{c.guestName || 'Hóspede'}</span>
                          {getStatusBadge(c.status)}
                        </div>
                        <p className="text-[10px] text-zinc-500 truncate">{c.lastMessage || 'Nenhuma mensagem'}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Clock className="w-2.5 h-2.5 text-zinc-600" />
                          <span className="text-[9px] text-zinc-600">{c.guestPhone || '—'}</span>
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Chat / Detail */}
            <div className="xl:col-span-3">
              <AILiveFeed
                conversations={conversations}
                isConnected={true}
                onReply={(cId, msg) => sendMessage(cId, msg)}
                onEscalate={(cId) => escalateConversation(cId)}
                onViewDetails={(cId) => selectConversation(cId)}
              />
            </div>
          </div>
        </motion.div>
      );
    }

    // ── GUESTS (Hóspedes) ─────────────────────────────────────
    if (activeTab === 'guests') {
      const filteredGuests = allGuests.filter(g => {
        const matchSearch = !guestSearch || g.name?.toLowerCase().includes(guestSearch.toLowerCase()) || g.phone?.includes(guestSearch);
        const matchStatus = guestStatusFilter === 'all' || g.status === guestStatusFilter;
        return matchSearch && matchStatus;
      });

      const statusCounts = allGuests.reduce((acc: Record<string, number>, g) => {
        acc[g.status] = (acc[g.status] || 0) + 1;
        return acc;
      }, {});

      return (
        <motion.div variants={fadeIn} initial="hidden" animate="visible" className="space-y-4">
          <SectionHeader
            icon={Users}
            title="Hóspedes"
            subtitle={`${allGuests.length} hóspede${allGuests.length !== 1 ? 's' : ''} no banco de dados`}
            actions={
              <>
                <div className="relative">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-500" />
                  <input
                    value={guestSearch}
                    onChange={e => setGuestSearch(e.target.value)}
                    placeholder="Buscar por nome ou telefone..."
                    className="pl-8 pr-3 py-1.5 bg-[#121216] border border-white/[0.06] rounded-lg text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:border-emerald-500/30 w-52"
                  />
                </div>
                <select
                  value={guestStatusFilter}
                  onChange={e => setGuestStatusFilter(e.target.value)}
                  className="bg-[#121216] border border-white/[0.06] rounded-lg px-2.5 py-1.5 text-xs text-zinc-300 focus:outline-none focus:border-emerald-500/30"
                >
                  <option value="all">Todos</option>
                  <option value="new">Novos</option>
                  <option value="active">Ativos</option>
                  <option value="confirmed">Confirmados</option>
                  <option value="checked_in">Check-in</option>
                  <option value="checked_out">Check-out</option>
                </select>
              </>
            }
          />

          {/* KPI pills */}
          <div className="flex items-center gap-2 flex-wrap">
            {Object.entries(statusCounts).map(([status, count]) => (
              <button
                key={status}
                onClick={() => setGuestStatusFilter(guestStatusFilter === status ? 'all' : status)}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold border transition-all cursor-pointer ${guestStatusFilter === status ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/25' : 'bg-[#121216] text-zinc-500 border-white/[0.04] hover:border-white/[0.08]'}`}
              >
                <span>{count}</span>
                <span className="capitalize">{status === 'new' ? 'Novos' : status === 'active' ? 'Ativos' : status === 'confirmed' ? 'Confirmados' : status === 'checked_in' ? 'Check-in' : status === 'checked_out' ? 'Check-out' : status}</span>
              </button>
            ))}
          </div>

          {/* Guests table */}
          <div className="bg-[#121216] border border-white/[0.04] rounded-xl overflow-hidden">
            <div className="grid grid-cols-12 px-4 py-2.5 border-b border-white/[0.04] text-[9px] font-extrabold text-zinc-600 uppercase tracking-wider">
              <div className="col-span-4">Hóspede</div>
              <div className="col-span-2">Telefone</div>
              <div className="col-span-2">Status</div>
              <div className="col-span-2">Conversas</div>
              <div className="col-span-2 text-right">Ações</div>
            </div>
            <div className="divide-y divide-white/[0.02] max-h-[500px] overflow-y-auto">
              {filteredGuests.length === 0 && (
                <div className="flex flex-col items-center justify-center py-16 gap-3">
                  <Users className="w-10 h-10 text-zinc-700" />
                  <p className="text-xs text-zinc-500">Nenhum hóspede encontrado</p>
                  <p className="text-[10px] text-zinc-600">Simule uma mensagem no Dashboard para criar o primeiro hóspede</p>
                </div>
              )}
              {filteredGuests.map(guest => (
                <div key={guest.id} className="grid grid-cols-12 px-4 py-3 items-center hover:bg-white/[0.01] transition-all group">
                  <div className="col-span-4 flex items-center gap-3">
                    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 border border-emerald-500/15 flex items-center justify-center text-xs font-bold text-emerald-400 shrink-0">
                      {(guest.name || 'H')[0].toUpperCase()}
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white">{guest.name || 'Hóspede'}</div>
                      {guest.email && <div className="text-[9px] text-zinc-600 truncate max-w-[140px]">{guest.email}</div>}
                    </div>
                  </div>
                  <div className="col-span-2 text-[10px] text-zinc-400 font-mono">{guest.phone || '—'}</div>
                  <div className="col-span-2">{getStatusBadge(guest.status || 'new')}</div>
                  <div className="col-span-2 text-xs font-mono text-zinc-400">{guest.conversations || 0}</div>
                  <div className="col-span-2 flex items-center justify-end gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => { setActiveTab('messages'); }}
                      className="p-1.5 rounded-lg bg-white/[0.03] hover:bg-white/[0.06] text-zinc-400 hover:text-white transition-all"
                      title="Ver mensagens"
                    >
                      <MessageCircle className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => { setActiveTab('bookings'); }}
                      className="p-1.5 rounded-lg bg-white/[0.03] hover:bg-white/[0.06] text-zinc-400 hover:text-white transition-all"
                      title="Ver reservas"
                    >
                      <Calendar className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
            {filteredGuests.length > 0 && (
              <div className="px-4 py-2.5 border-t border-white/[0.04] flex items-center justify-between">
                <span className="text-[10px] text-zinc-600">{filteredGuests.length} hóspede{filteredGuests.length !== 1 ? 's' : ''}</span>
                <button
                  onClick={() => toast.info('Exportação de hóspedes em desenvolvimento.')}
                  className="flex items-center gap-1.5 text-[10px] text-zinc-500 hover:text-zinc-300 transition-colors cursor-pointer"
                >
                  <Download className="w-3 h-3" /> Exportar CSV
                </button>
              </div>
            )}
          </div>

        </motion.div>
      );
    }

    // ── TRAINING (Treinamento) ────────────────────────────────
    if (activeTab === 'training') {
      return (
        <motion.div variants={fadeIn} initial="hidden" animate="visible" className="space-y-4">
          <SectionHeader
            icon={GraduationCap}
            title="Treinamento da IA"
            subtitle="Gerencie a base de conhecimento e treino do assistente cognitivo"
            actions={
              <button
                onClick={() => toast.info('Nova entrada de treinamento em desenvolvimento.')}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 text-emerald-400 text-xs font-bold rounded-lg transition-all cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" /> Nova Entrada
              </button>
            }
          />
          <TrainingCenter />
        </motion.div>
      );
    }

    // ── BOOKINGS (Reservas) ───────────────────────────────────
    if (activeTab === 'bookings') {
      const filterOptions = [
        { val: 'all', label: 'Todas' },
        { val: 'pending', label: 'Pendentes' },
        { val: 'confirmed', label: 'Confirmadas' },
        { val: 'checked_in', label: 'Check-in' },
        { val: 'checked_out', label: 'Check-out' },
        { val: 'cancelled', label: 'Canceladas' },
      ];

      const totalRevenue = bookings.reduce((s, b) => s + (b.totalValue || b.total || 0), 0);
      const confirmedCount = bookings.filter(b => ['confirmed', 'checked_in'].includes(b.status)).length;

      return (
        <motion.div variants={fadeIn} initial="hidden" animate="visible" className="space-y-4">
          <SectionHeader
            icon={Calendar}
            title="Reservas"
            subtitle="Gerencie e acompanhe todas as reservas da pousada"
            actions={
              <>
                <button
                  onClick={() => { setBookingsLoading(true); fetch(`/api/ddc/bookings${bookingsFilter !== 'all' ? `?status=${bookingsFilter}` : ''}`).then(r => r.json()).then(d => setBookings(d?.data?.items || [])).catch(() => setBookings([])).finally(() => setBookingsLoading(false)); toast.success('Reservas atualizadas.'); }}
                  className="p-1.5 rounded-lg bg-[#121216] border border-white/[0.06] text-zinc-400 hover:text-zinc-200 transition-all cursor-pointer"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${bookingsLoading ? 'animate-spin' : ''}`} />
                </button>
                <button
                  onClick={() => toast.info('Criação de reserva manual em desenvolvimento.')}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 text-emerald-400 text-xs font-bold rounded-lg transition-all cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" /> Nova Reserva
                </button>
              </>
            }
          />

          {/* KPI row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: 'Total de Reservas', value: bookings.length, icon: Calendar, color: 'text-blue-400' },
              { label: 'Confirmadas', value: confirmedCount, icon: CheckCircle2, color: 'text-emerald-400' },
              { label: 'Receita Total', value: formatCurrency(totalRevenue), icon: TrendingUp, color: 'text-amber-400' },
              { label: 'Cancelamentos', value: bookings.filter(b => b.status === 'cancelled').length, icon: X, color: 'text-red-400' },
            ].map(kpi => (
              <div key={kpi.label} className="bg-[#121216] border border-white/[0.04] rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <kpi.icon className={`w-3.5 h-3.5 ${kpi.color}`} />
                  <span className="text-[9px] text-zinc-600 uppercase font-bold tracking-wider">{kpi.label}</span>
                </div>
                <div className="text-lg font-extrabold text-white font-mono">{kpi.value}</div>
              </div>
            ))}
          </div>

          {/* Filter tabs */}
          <div className="flex items-center gap-1 overflow-x-auto pb-1 scrollbar-none">
            {filterOptions.map(opt => (
              <button
                key={opt.val}
                onClick={() => setBookingsFilter(opt.val)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all cursor-pointer shrink-0 ${bookingsFilter === opt.val ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'text-zinc-500 border-transparent hover:text-zinc-300 hover:bg-white/[0.02]'}`}
              >
                {opt.label}
              </button>
            ))}
          </div>

          {/* Bookings table */}
          <div className="bg-[#121216] border border-white/[0.04] rounded-xl overflow-hidden">
            <div className="grid grid-cols-12 px-4 py-2.5 border-b border-white/[0.04] text-[9px] font-extrabold text-zinc-600 uppercase tracking-wider">
              <div className="col-span-3">Hóspede</div>
              <div className="col-span-2">Check-in</div>
              <div className="col-span-2">Check-out</div>
              <div className="col-span-1">Noites</div>
              <div className="col-span-2">Valor</div>
              <div className="col-span-2 text-right">Status</div>
            </div>
            <div className="divide-y divide-white/[0.02] max-h-[480px] overflow-y-auto">
              {bookingsLoading && (
                <div className="flex items-center justify-center py-12 gap-3">
                  <Loader2 className="w-5 h-5 text-zinc-600 animate-spin" />
                  <span className="text-xs text-zinc-500">Carregando reservas...</span>
                </div>
              )}
              {!bookingsLoading && bookings.length === 0 && (
                <div className="flex flex-col items-center justify-center py-16 gap-3">
                  <Calendar className="w-10 h-10 text-zinc-700" />
                  <p className="text-xs text-zinc-500">Nenhuma reserva encontrada</p>
                  <p className="text-[10px] text-zinc-600">As reservas feitas via WhatsApp pelo Seu Zélla aparecerão aqui</p>
                </div>
              )}
              {!bookingsLoading && bookings.map(booking => (
                <div key={booking.id} className="grid grid-cols-12 px-4 py-3 items-center hover:bg-white/[0.01] transition-all group">
                  <div className="col-span-3">
                    <div className="text-xs font-bold text-white">{booking.guestName || booking.guest?.name || 'Hóspede'}</div>
                    <div className="text-[9px] text-zinc-600">{booking.roomName || booking.room || '—'}</div>
                  </div>
                  <div className="col-span-2 text-[10px] text-zinc-400">{booking.checkIn ? formatDate(booking.checkIn) : '—'}</div>
                  <div className="col-span-2 text-[10px] text-zinc-400">{booking.checkOut ? formatDate(booking.checkOut) : '—'}</div>
                  <div className="col-span-1 text-[10px] font-mono text-zinc-400">{booking.nights || '—'}</div>
                  <div className="col-span-2 text-xs font-bold text-white font-mono">{booking.totalValue !== undefined ? formatCurrency(booking.totalValue) : '—'}</div>
                  <div className="col-span-2 flex justify-end">{getStatusBadge(booking.status)}</div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      );
    }

    // ── ANALYTICS ────────────────────────────────────────────
    if (activeTab === 'analytics') {
      const pd = analyticsData[analyticsPeriod] || {};
      const kpis = [
        { label: 'Atendimentos', value: pd.attendedToday ?? metrics?.today?.aiAttended ?? 0, unit: '', delta: pd.attendedChange ?? 0, icon: Activity, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
        { label: 'Reservas Fechadas', value: pd.bookingsClosed ?? 0, unit: '', delta: pd.bookingsChange ?? 0, icon: Calendar, color: 'text-blue-400', bg: 'bg-blue-500/10' },
        { label: 'Receita', value: formatCurrency(pd.revenue ?? 0), unit: '', delta: pd.revenueChange ?? 0, icon: TrendingUp, color: 'text-amber-400', bg: 'bg-amber-500/10' },
        { label: 'Taxa de Conversão', value: `${pd.conversion ?? 0}%`, unit: '', delta: pd.conversionChange ?? 0, icon: BarChart2, color: 'text-violet-400', bg: 'bg-violet-500/10' },
        { label: 'Ocupação', value: `${pd.occupancy ?? 0}%`, unit: '', delta: pd.occupancyChange ?? 0, icon: UserCheck, color: 'text-cyan-400', bg: 'bg-cyan-500/10' },
        { label: 'Score IA', value: `${pd.aiScore ?? 92}`, unit: '%', delta: pd.aiScoreChange ?? 0, icon: Star, color: 'text-rose-400', bg: 'bg-rose-500/10' },
      ];

      const DeltaIcon = ({ delta }: { delta: number }) => {
        if (delta > 0) return <ArrowUpRight className="w-3 h-3 text-emerald-400" />;
        if (delta < 0) return <ArrowDownRight className="w-3 h-3 text-red-400" />;
        return <Minus className="w-3 h-3 text-zinc-500" />;
      };

      return (
        <motion.div variants={fadeIn} initial="hidden" animate="visible" className="space-y-4">
          <SectionHeader
            icon={BarChart2}
            title="Analytics"
            subtitle="Métricas de desempenho do atendimento e conversão da pousada"
            actions={
              <div className="flex items-center gap-1 bg-[#121216] border border-white/[0.06] rounded-lg p-0.5">
                {(['today', 'week', 'month'] as const).map(p => (
                  <button
                    key={p}
                    onClick={() => setAnalyticsPeriod(p)}
                    className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all cursor-pointer ${analyticsPeriod === p ? 'bg-emerald-500/10 text-emerald-400' : 'text-zinc-500 hover:text-zinc-300'}`}
                  >
                    {p === 'today' ? 'Hoje' : p === 'week' ? '7 dias' : '30 dias'}
                  </button>
                ))}
              </div>
            }
          />

          {analyticsLoading && (
            <div className="flex items-center justify-center py-8 gap-3">
              <Loader2 className="w-5 h-5 text-zinc-600 animate-spin" />
              <span className="text-xs text-zinc-500">Carregando métricas...</span>
            </div>
          )}

          {/* KPI Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {kpis.map(kpi => (
              <div key={kpi.label} className="bg-[#121216] border border-white/[0.04] rounded-xl p-4 group hover:border-white/[0.08] transition-all">
                <div className="flex items-center justify-between mb-3">
                  <div className={`w-8 h-8 rounded-lg ${kpi.bg} flex items-center justify-center`}>
                    <kpi.icon className={`w-4 h-4 ${kpi.color}`} />
                  </div>
                  <div className="flex items-center gap-1">
                    <DeltaIcon delta={kpi.delta} />
                    <span className={`text-[10px] font-bold ${kpi.delta > 0 ? 'text-emerald-400' : kpi.delta < 0 ? 'text-red-400' : 'text-zinc-500'}`}>
                      {kpi.delta !== 0 ? `${Math.abs(kpi.delta)}%` : '—'}
                    </span>
                  </div>
                </div>
                <div className="text-xl font-extrabold text-white font-mono">{kpi.value}{kpi.unit}</div>
                <div className="text-[10px] text-zinc-500 mt-1">{kpi.label}</div>
              </div>
            ))}
          </div>

          {/* Trend bars */}
          <div className="bg-[#121216] border border-white/[0.04] rounded-xl p-5">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-extrabold text-white uppercase tracking-wider">Atendimentos por Hora — Hoje</span>
              <span className="text-[10px] text-zinc-500">Simulação de atividade</span>
            </div>
            <div className="flex items-end gap-1 h-24">
              {Array.from({ length: 24 }, (_, h) => {
                const activity = [2, 1, 0, 0, 0, 1, 3, 8, 12, 15, 18, 14, 10, 16, 20, 18, 22, 19, 15, 12, 8, 6, 4, 3];
                const val = activity[h];
                const max = Math.max(...activity);
                const height = max > 0 ? (val / max) * 100 : 0;
                const isActive = new Date().getHours() === h;
                return (
                  <div key={h} className="flex-1 flex flex-col items-center gap-1">
                    <div
                      className={`w-full rounded-sm transition-all ${isActive ? 'bg-emerald-400' : val > 15 ? 'bg-emerald-500/60' : val > 8 ? 'bg-emerald-500/30' : 'bg-white/[0.04]'}`}
                      style={{ height: `${Math.max(height, 4)}%` }}
                      title={`${h}h: ${val} atendimentos`}
                    />
                  </div>
                );
              })}
            </div>
            <div className="flex justify-between mt-2">
              <span className="text-[9px] text-zinc-700">00h</span>
              <span className="text-[9px] text-zinc-700">12h</span>
              <span className="text-[9px] text-zinc-700">23h</span>
            </div>
          </div>

          {/* Summary table */}
          <div className="bg-[#121216] border border-white/[0.04] rounded-xl overflow-hidden">
            <div className="px-4 py-3 border-b border-white/[0.04]">
              <span className="text-[10px] font-extrabold text-white uppercase tracking-wider">Resumo do Período</span>
            </div>
            <div className="divide-y divide-white/[0.02]">
              {[
                { metric: 'Total de Atendimentos', value: pd.attendedToday ?? metrics?.today?.aiAttended ?? 0, note: 'Conversas iniciadas pela IA' },
                { metric: 'Reservas Confirmadas', value: pd.bookingsClosed ?? 0, note: 'Conversões de atendimento em reserva' },
                { metric: 'Taxa de Escalamento', value: `${conversations.length > 0 ? ((conversations.filter(c => c.status === 'escalated').length / conversations.length) * 100).toFixed(1) : 0}%`, note: 'Chats que precisaram de atenção manual' },
                { metric: 'Tempo Médio de Resposta', value: `${aiStatus?.averageResponseTime ?? 2.3}s`, note: 'Velocidade média de resposta da IA' },
                { metric: 'Hóspedes no CRM', value: allGuests.length, note: 'Total de hóspedes cadastrados via WhatsApp' },
                { metric: 'Score Cognitivo da IA', value: `${pd.aiScore ?? 92}%`, note: 'Índice de confiança médio das respostas' },
              ].map(row => (
                <div key={row.metric} className="grid grid-cols-3 px-4 py-3 items-center hover:bg-white/[0.01] transition-all">
                  <div className="col-span-2">
                    <div className="text-xs font-semibold text-white">{row.metric}</div>
                    <div className="text-[10px] text-zinc-600 mt-0.5">{row.note}</div>
                  </div>
                  <div className="text-right text-sm font-extrabold text-white font-mono">{row.value}</div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      );
    }

    // ── NOTIFICATIONS (Notificações) ─────────────────────────

    if (activeTab === 'notifications') {
      const unread = notifications.filter(n => n.status === 'unread');
      const read = notifications.filter(n => n.status !== 'unread');

      const priorityIcon = (p: string) => {
        if (p === 'urgent') return <AlertCircle className="w-4 h-4 text-red-400" />;
        if (p === 'high') return <Bell className="w-4 h-4 text-amber-400" />;
        return <Info className="w-4 h-4 text-blue-400" />;
      };

      return (
        <motion.div variants={fadeIn} initial="hidden" animate="visible" className="space-y-4">
          <SectionHeader
            icon={Bell}
            title="Notificações"
            subtitle={`${unread.length} não lida${unread.length !== 1 ? 's' : ''} — ${notifications.length} total`}
            actions={
              <>
                {unread.length > 0 && (
                  <button
                    onClick={() => { markAllAsRead(); toast.success('Todas as notificações marcadas como lidas.'); }}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-[#121216] hover:bg-white/[0.04] border border-white/[0.06] text-zinc-400 hover:text-zinc-200 text-xs font-bold rounded-lg transition-all cursor-pointer"
                  >
                    <CheckCheck className="w-3.5 h-3.5" /> Marcar todas como lidas
                  </button>
                )}
              </>
            }
          />

          {notifications.length === 0 && (
            <div className="bg-[#121216] border border-white/[0.04] rounded-xl flex flex-col items-center justify-center py-20 gap-4">
              <BellOff className="w-12 h-12 text-zinc-700" />
              <p className="text-sm text-zinc-500">Nenhuma notificação ainda</p>
              <p className="text-xs text-zinc-600">As notificações da IA e do sistema aparecerão aqui</p>
            </div>
          )}

          {/* Unread section */}
          {unread.length > 0 && (
            <div className="space-y-2">
              <div className="text-[10px] font-extrabold text-zinc-500 uppercase tracking-wider px-1">Não Lidas ({unread.length})</div>
              {unread.map(notif => (
                <motion.div
                  key={notif.id}
                  layout
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="bg-[#121216] border border-emerald-500/10 rounded-xl p-4 cursor-pointer hover:border-emerald-500/20 transition-all group"
                  onClick={() => { markAsRead(notif.id); toast.success('Notificação marcada como lida.'); }}
                >
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-[#0a0a0f] border border-white/[0.06] flex items-center justify-center shrink-0">
                      {priorityIcon(notif.priority)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="text-sm font-bold text-white">{notif.title}</div>
                          <div className="text-xs text-zinc-400 mt-0.5 leading-relaxed">{notif.message}</div>
                        </div>
                        <div className="flex flex-col items-end gap-1.5 shrink-0">
                          <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                          <span className="text-[9px] text-zinc-600 font-mono whitespace-nowrap">
                            {notif.timestamp ? formatDate(notif.timestamp) : 'Agora'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="mt-3 flex items-center justify-between">
                    <span className={`text-[9px] font-bold px-2 py-0.5 rounded border ${notif.priority === 'urgent' ? 'bg-red-500/10 text-red-400 border-red-500/20' : notif.priority === 'high' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' : 'bg-blue-500/10 text-blue-400 border-blue-500/20'}`}>
                      {notif.priority === 'urgent' ? 'URGENTE' : notif.priority === 'high' ? 'ALTA' : 'NORMAL'}
                    </span>
                    <span className="text-[10px] text-emerald-400 group-hover:text-emerald-300 transition-colors">Marcar como lida →</span>
                  </div>
                </motion.div>
              ))}
            </div>
          )}

          {/* Read section */}
          {read.length > 0 && (
            <div className="space-y-2">
              <div className="text-[10px] font-extrabold text-zinc-500 uppercase tracking-wider px-1">Lidas ({read.length})</div>
              <div className="bg-[#121216] border border-white/[0.04] rounded-xl divide-y divide-white/[0.02]">
                {read.map(notif => (
                  <div key={notif.id} className="flex items-start gap-3 p-4 opacity-60 hover:opacity-80 transition-opacity">
                    <div className="w-7 h-7 rounded-lg bg-[#0a0a0f] border border-white/[0.04] flex items-center justify-center shrink-0">
                      {priorityIcon(notif.priority)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-bold text-white">{notif.title}</div>
                      <div className="text-[10px] text-zinc-500 mt-0.5 truncate">{notif.message}</div>
                    </div>
                    <span className="text-[9px] text-zinc-700 font-mono shrink-0 whitespace-nowrap">
                      {notif.timestamp ? formatDate(notif.timestamp) : '—'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      );
    }

    // ── SETTINGS (Configurações) ──────────────────────────────
    if (activeTab === 'settings') {
      return (
        <motion.div variants={fadeIn} initial="hidden" animate="visible" className="bg-[#121216] border border-white/[0.04] rounded-xl p-6 sm:p-8">
          <SectionHeader
            icon={Settings}
            title="Configurações da Pousada"
            subtitle="Personalize o comportamento do Seu Zélla para a sua propriedade"
          />
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {/* Sub-abas laterais */}
            <div className="md:col-span-1 flex flex-col gap-1.5 select-none">
              <button
                onClick={() => setSubTab('geral')}
                className={`px-4 py-2.5 rounded-lg text-left text-xs font-bold transition-all cursor-pointer flex items-center gap-2.5 border ${subTab === 'geral' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 shadow-sm' : 'text-zinc-400 border-transparent hover:bg-white/[0.02] hover:text-zinc-200'}`}
              >
                <Sliders className="w-4 h-4" /> Geral &amp; IA
              </button>
              <button
                onClick={() => setSubTab('linkinbio')}
                className={`px-4 py-2.5 rounded-lg text-left text-xs font-bold transition-all cursor-pointer flex items-center gap-2.5 border ${subTab === 'linkinbio' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 shadow-sm' : 'text-zinc-400 border-transparent hover:bg-white/[0.02] hover:text-zinc-200'}`}
              >
                <Smartphone className="w-4 h-4" /> Link-in-Bio Profissional
              </button>
              <button
                onClick={() => setSubTab('faturamento')}
                className={`px-4 py-2.5 rounded-lg text-left text-xs font-bold transition-all cursor-pointer flex items-center gap-2.5 border ${subTab === 'faturamento' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 shadow-sm' : 'text-zinc-400 border-transparent hover:bg-white/[0.02] hover:text-zinc-200'}`}
              >
                <CreditCard className="w-4 h-4" /> Faturamento &amp; Consumo
              </button>
            </div>

            {/* Conteúdo da sub-aba */}
            <div className="md:col-span-3 bg-[#0a0a0f]/40 border border-white/[0.04] rounded-lg p-6">
              {subTab === 'geral' && (
                <form onSubmit={handleSaveGeral} className="space-y-4">
                  <div>
                    <h3 className="text-sm font-extrabold text-white">Configurações Gerais</h3>
                    <p className="text-zinc-400 text-xs mt-1">Ajuste o tom de voz do seu assistente cognitivo e as informações básicas da sua pousada.</p>
                  </div>
                  <div className="space-y-4 pt-2">
                    <div className="space-y-1.5">
                      <Label htmlFor="prop-name" className="text-zinc-300 text-xs font-semibold">Nome da Pousada</Label>
                      <Input id="prop-name" type="text" value={editPropertyName} onChange={e => setEditPropertyName(e.target.value)} className="bg-[#121216] border-white/[0.08] rounded-lg text-xs text-white" required />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="ai-tone" className="text-zinc-300 text-xs font-semibold">Tom de Voz da IA</Label>
                      <select id="ai-tone" value={aiVoiceTone} onChange={e => setAiVoiceTone(e.target.value)} className="w-full bg-[#121216] border border-white/[0.08] rounded-lg p-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-emerald-500/30">
                        <option value="friendly">Receptivo &amp; Amigável (Padrão)</option>
                        <option value="sophisticated">Formal &amp; Sofisticado</option>
                      </select>
                    </div>
                  </div>
                  <div className="pt-2">
                    <Button type="submit" disabled={isSaving} className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-zinc-950 font-bold text-xs rounded-lg flex items-center gap-2 cursor-pointer transition-colors active:scale-[0.98]">
                      {isSaving ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Salvando...</> : <><Save className="w-3.5 h-3.5" /> Salvar Alterações</>}
                    </Button>
                  </div>
                </form>
              )}

              {subTab === 'linkinbio' && (
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <h3 className="text-sm font-extrabold text-white">Configuração do Link-in-Bio</h3>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 w-fit">
                      Ativo (seuzella.com/pousada)
                    </span>
                  </div>
                  {currentPlan === 'lite' ? (
                    <div className="bg-[#121216] border border-white/[0.04] rounded-lg p-6 space-y-5">
                      <div className="flex items-start gap-4">
                        <div className="w-10 h-10 rounded-lg bg-zinc-800 border border-white/[0.06] flex items-center justify-center text-zinc-400 shrink-0">
                          <Lock className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="text-xs font-bold text-white">Link-in-Bio Profissional</h4>
                            <Badge className="bg-emerald-500/20 text-emerald-400 text-[8px] font-bold border-0">PREMIUM</Badge>
                          </div>
                          <p className="text-zinc-400 text-[11px] leading-relaxed mt-1">O Link-in-Bio profissional centraliza seus canais de atendimento, integra feeds dinâmicos e converte acessos do Instagram em reservas diretas sem comissão.</p>
                        </div>
                      </div>
                      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2 border-t border-white/[0.04]">
                        <p className="text-[10px] text-zinc-500 leading-normal max-w-sm">Esta ferramenta não está liberada no seu pacote LITE. Faça upgrade para o plano PRO ou MAX.</p>
                        <Button onClick={() => setSubTab('faturamento')} className="w-full sm:w-auto px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-zinc-950 font-bold text-xs rounded-lg flex items-center justify-center gap-1.5 cursor-pointer active:scale-[0.98] transition-all">
                          <Sparkles className="w-3.5 h-3.5" /> Fazer Upgrade
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <p className="text-zinc-400 text-xs">Customize os links, fotos e cores do seu perfil in-app do Instagram.</p>
                      <div className="space-y-3 pt-2">
                        <div className="space-y-1.5">
                          <label className="block text-xs font-semibold text-zinc-300">Título do Perfil</label>
                          <input type="text" defaultValue={propertyName} className="w-full bg-[#121216] border border-white/[0.08] rounded-lg p-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-emerald-500/30" />
                        </div>
                        <div className="space-y-1.5">
                          <label className="block text-xs font-semibold text-zinc-300">Subtítulo / Descrição</label>
                          <input type="text" defaultValue="✨ Seu refúgio em meio à natureza" className="w-full bg-[#121216] border border-white/[0.08] rounded-lg p-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-emerald-500/30" />
                        </div>
                        <div className="pt-2">
                          <button
                            type="button"
                            onClick={() => toast.success('Configurações do Link-in-Bio salvas com sucesso!')}
                            className="px-4 py-2 bg-emerald-500 text-zinc-950 font-bold text-xs rounded-lg hover:bg-emerald-600 transition-colors cursor-pointer"
                          >
                            Salvar Alterações
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {subTab === 'faturamento' && (
                <div className="space-y-5">
                  <div>
                    <h3 className="text-sm font-extrabold text-white">Faturamento &amp; Consumo</h3>
                    <p className="text-zinc-400 text-xs mt-1">Gerencie a assinatura e acompanhe as cotas de mensagens mensais.</p>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="bg-[#121216] border border-white/[0.06] rounded-lg p-4">
                      <div className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">Plano Ativo</div>
                      <div className="text-base font-extrabold text-white mt-1.5 uppercase font-mono">{currentPlan}</div>
                    </div>
                    <div className="bg-[#121216] border border-white/[0.06] rounded-lg p-4">
                      <div className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">Mensagens Consumidas</div>
                      <div className="text-base font-extrabold text-white mt-1.5 font-mono">
                        {currentPlan === 'lite' ? '512 / 500' : '924 / Ilimitado'}
                      </div>
                    </div>
                  </div>
                  {currentPlan === 'lite' && (
                    <div className="bg-[#1c1214] border border-red-500/10 rounded-lg p-4 space-y-3">
                      <div className="flex gap-3">
                        <div className="w-7 h-7 rounded bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400 shrink-0">
                          <Info className="w-4 h-4" />
                        </div>
                        <div>
                          <h4 className="text-xs font-bold text-white">Mensagens Excedidas</h4>
                          <p className="text-[10px] text-zinc-400 leading-relaxed mt-0.5">Você atingiu 512 mensagens neste ciclo (limite de 500). Adquira créditos adicionais para que o assistente do Seu Zélla continue atendendo no WhatsApp.</p>
                        </div>
                      </div>
                      <div className="pt-3 border-t border-white/[0.04] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="text-[11px] text-zinc-300">
                          Adicionar pacote de <strong>250 mensagens extras</strong> por <strong className="text-emerald-400">R$ 97,00</strong>
                        </div>
                        <button
                          onClick={() => { setShowRecargaMock(true); toast.success('QR Code do PIX gerado com sucesso!'); }}
                          className="w-full sm:w-auto px-3.5 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-zinc-950 text-[10px] font-bold rounded-lg transition-colors cursor-pointer"
                        >
                          Comprar via PIX
                        </button>
                      </div>
                    </div>
                  )}
                  {showRecargaMock && (
                    <div className="bg-[#121216] border border-white/[0.04] rounded-lg p-4 text-center space-y-4">
                      <p className="text-xs text-white font-bold">Pagamento da Recarga de Créditos (PIX)</p>
                      <div className="w-32 h-32 bg-white p-2 mx-auto rounded-lg flex items-center justify-center border border-white/[0.08]">
                        <span className="text-black font-mono text-[8px] break-all select-all font-bold">ZELLAPAY-RECARGA-PIX-MOCK-2026</span>
                      </div>
                      <div className="flex gap-2 justify-center">
                        <button onClick={() => { toast.success('Pagamento PIX confirmado! 250 mensagens adicionadas.'); setShowRecargaMock(false); }} className="px-4 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-zinc-950 text-[10px] font-bold rounded-lg cursor-pointer transition-colors">Confirmar Pagamento</button>
                        <button onClick={() => setShowRecargaMock(false)} className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-400 text-[10px] font-bold rounded-lg cursor-pointer transition-colors">Cancelar</button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </motion.div>
      );
    }

    // ── ZELLADOR (Suporte) ────────────────────────────────────
    if (activeTab === 'zellador') {
      return (
        <motion.div variants={fadeIn} initial="hidden" animate="visible" className="max-w-3xl mx-auto">
          <ZelladorChat userPlan={currentPlan} />
        </motion.div>
      );
    }

    return null;
  };

  // ─── RENDER ──────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white antialiased font-sans">
      <Toaster position="top-center" richColors />

      {/* Header */}
      <DDCHeader
        propertyName={propertyName}
        aiStatus={aiStatusLocal}
        notificationCount={unreadCount}
        onOpenNotifications={handleNotificationClick}
      />

      {/* Trial Banner */}
      {currentPlan === 'trial' && (
        <div className="bg-gradient-to-r from-emerald-950/40 via-zinc-900 to-[#0a0a0f] border-b border-emerald-500/10 px-6 py-2.5 flex items-center justify-between gap-4 flex-wrap select-none">
          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 relative shrink-0">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
            <p className="text-[11px] text-zinc-300">
              Você está no <strong>Período de Teste Grátis de 7 Dias</strong>. Teste a inteligência artificial do Seu Zélla enviando uma mensagem simulada!
            </p>
          </div>
          <button
            onClick={() => {
              setActiveTab('overview');
              setTimeout(() => {
                const el = document.getElementById('simulation-msg');
                el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
              }, 100);
            }}
            className="px-3 py-1 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 rounded-md text-[10px] font-bold cursor-pointer transition-colors active:scale-95"
          >
            Simular Hóspede Agora ⚡
          </button>
        </div>
      )}

      {/* Navigation Tabs (Zellador + Dashboard Geral) */}
      <div className="flex items-center gap-1.5 px-6 pt-4 max-w-[1920px] mx-auto select-none border-b border-white/[0.02] pb-2">
        <button
          onClick={() => setActiveTab('overview')}
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-md text-xs font-bold transition-all cursor-pointer ${activeTab !== 'zellador' ? 'bg-white/[0.04] text-white' : 'text-zinc-500 hover:text-zinc-300'}`}
        >
          <Compass className="w-3.5 h-3.5" />
          Dashboard Geral
        </button>
        <button
          onClick={() => setActiveTab('zellador')}
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-md text-xs font-bold transition-all cursor-pointer ${activeTab === 'zellador' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'text-zinc-500 hover:text-zinc-300'}`}
        >
          <MessageSquare className="w-3.5 h-3.5" />
          Fale com seu Zelador (Suporte)
        </button>
      </div>

      {/* Main Content */}
      <div className="p-6 max-w-[1920px] mx-auto space-y-6">
        {/* QuickActionsBar — always visible (except Zellador tab) */}
        {activeTab !== 'zellador' && (
          <motion.div variants={fadeIn} initial="hidden" animate="visible">
            <QuickActionsBar onActionClick={handleActionClick} activeAction={activeTab} />
          </motion.div>
        )}

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          <motion.div key={activeTab} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
            {renderActiveTab()}
          </motion.div>
        </AnimatePresence>

        {/* Bottom Status Bar — always visible except zellador */}
        {activeTab !== 'zellador' && (
          <motion.div variants={fadeIn} initial="hidden" animate="visible" className="bg-[#121216] border border-white/[0.04] rounded-xl p-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4 flex-wrap">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                  <span className="text-[10px] text-zinc-500 font-mono">ZELLA COGNITIVE OS v2.4.1</span>
                </div>
                <div className="hidden sm:block h-4 w-px bg-white/[0.06]" />
                <span className="text-[10px] text-zinc-500 font-mono">Propriedade: {propertyName}</span>
                <div className="hidden sm:block h-4 w-px bg-white/[0.06]" />
                <span className="text-[10px] text-zinc-500 font-mono">
                  {allGuests.length} hóspedes • {conversations.length} conversas ativas
                </span>
              </div>
              <span className="text-[9px] text-emerald-400 font-semibold font-mono uppercase tracking-wider">
                Sistemas operacionais 100% ativos
              </span>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
