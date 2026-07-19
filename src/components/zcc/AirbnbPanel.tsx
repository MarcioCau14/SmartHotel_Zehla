'use client';

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
  ChevronDown,
  Brain,
  Wifi,
  WifiOff,
  BedDouble,
  CheckCircle2,
  AlertCircle,
  ArrowUp,
  ArrowDown,
  DollarSign,
  Link2,
  Loader2,
  Phone,
  Database,
  Lock,
  Eye,
  Webhook,
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
// Types for mock features
// ---------------------------------------------------------------------------

interface OAuthResult {
  accessToken: string;
  expiresIn: number;
  importedCount: number;
  expiresAt: string;
}

interface WebhookResult {
  id: string;
  eventType: string;
  createdAt: string;
}

interface ConsentRecord {
  id: string;
  guestPhone: string;
  consentType: string;
  status: string;
  source: string;
  createdAt: string;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function AirbnbPanel() {
  const [sortKey, setSortKey] = useState<SortKey>('revenue');
  const [sortAsc, setSortAsc] = useState(false);
  const [selectedHost, setSelectedHost] = useState<AirbnbHost | null>(null);

  // ── Mock Mode State ──────────────────────────────────────────────────
  const [oauthLoading, setOauthLoading] = useState(false);
  const [oauthResult, setOauthResult] = useState<OAuthResult | null>(null);
  const [oauthError, setOauthError] = useState<string | null>(null);
  const [oauthNotification, setOauthNotification] = useState<string | null>(null);

  const [webhookLoading, setWebhookLoading] = useState(false);
  const [webhookResult, setWebhookResult] = useState<WebhookResult | null>(null);
  const [webhookError, setWebhookError] = useState<string | null>(null);
  const [webhookNotification, setWebhookNotification] = useState<string | null>(null);
  const [devToolsOpen, setDevToolsOpen] = useState(false);

  // ── Consent State ────────────────────────────────────────────────────
  const [consentRecords, setConsentRecords] = useState<ConsentRecord[]>([]);
  const [consentLoading, setConsentLoading] = useState(false);
  const [consentError, setConsentError] = useState<string | null>(null);
  const [consentRegisterLoading, setConsentRegisterLoading] = useState(false);
  const [consentRegisterError, setConsentRegisterError] = useState<string | null>(null);
  const [consentRegisterSuccess, setConsentRegisterSuccess] = useState<string | null>(null);
  const [consentFormPhone, setConsentFormPhone] = useState('');
  const [consentFormType, setConsentFormType] = useState<'whatsapp_communication' | 'data_processing' | 'marketing'>('whatsapp_communication');
  const [consentPanelOpen, setConsentPanelOpen] = useState(false);

  const MOCK_TENANT_ID = 'demo-tenant-id';

  // ── Auto-dismiss notifications ───────────────────────────────────────
  const dismissAfter = useCallback((setter: (v: string | null) => void, ms = 4000) => {
    setTimeout(() => setter(null), ms);
  }, []);

  // ── OAuth Handler ────────────────────────────────────────────────────
  const handleOAuth = async () => {
    setOauthLoading(true);
    setOauthError(null);
    setOauthNotification(null);
    try {
      const res = await fetch('/api/zcc/airbnb/oauth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tenantId: MOCK_TENANT_ID }),
      });
      const data = await res.json();
      if (!data.success) {
        setOauthError(data.error || 'Erro na conexão OAuth');
        return;
      }
      setOauthResult({
        accessToken: data.data.oauthToken.accessToken,
        expiresIn: data.data.oauthToken.expiresIn,
        importedCount: data.data.importedCount,
        expiresAt: data.data.oauthToken.expiresAt,
      });
      setOauthNotification('OAuth conectado! ' + data.data.importedCount + ' propriedades importadas');
      dismissAfter(setOauthNotification);
    } catch {
      setOauthError('Falha na conexão com o servidor');
    } finally {
      setOauthLoading(false);
    }
  };

  // ── Webhook Handler ──────────────────────────────────────────────────
  const handleWebhook = async () => {
    setWebhookLoading(true);
    setWebhookError(null);
    setWebhookNotification(null);
    try {
      const res = await fetch('/api/zcc/airbnb/webhook', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tenantId: MOCK_TENANT_ID,
          eventType: 'reservation.created',
          payload: { mockReservation: true, guestName: 'Hóspede Teste', checkIn: '2026-10-15' },
        }),
      });
      const data = await res.json();
      if (!data.success) {
        setWebhookError(data.error || 'Erro no webhook');
        return;
      }
      setWebhookResult({
        id: data.data.id,
        eventType: data.data.eventType,
        createdAt: data.data.createdAt,
      });
      setWebhookNotification('Webhook recebido! Reserva simulada criada');
      dismissAfter(setWebhookNotification);
    } catch {
      setWebhookError('Falha na conexão com o servidor');
    } finally {
      setWebhookLoading(false);
    }
  };

  // ── Consent Handlers ─────────────────────────────────────────────────
  const fetchConsentRecords = async () => {
    setConsentLoading(true);
    setConsentError(null);
    try {
      const res = await fetch(`/api/zcc/consent?tenantId=${MOCK_TENANT_ID}`);
      const data = await res.json();
      if (!data.success) {
        setConsentError(data.error || 'Erro ao buscar consentimentos');
        return;
      }
      setConsentRecords(data.data.consentRecords || []);
    } catch {
      setConsentError('Falha na conexão com o servidor');
    } finally {
      setConsentLoading(false);
    }
  };

  const handleRegisterConsent = async () => {
    if (!consentFormPhone.trim()) {
      setConsentRegisterError('Número de telefone é obrigatório');
      return;
    }
    setConsentRegisterLoading(true);
    setConsentRegisterError(null);
    setConsentRegisterSuccess(null);
    try {
      const res = await fetch('/api/zcc/consent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tenantId: MOCK_TENANT_ID,
          guestPhone: consentFormPhone,
          consentType: consentFormType,
          status: 'granted',
          source: 'zcc_panel',
        }),
      });
      const data = await res.json();
      if (!data.success) {
        setConsentRegisterError(data.error || 'Erro ao registrar consentimento');
        return;
      }
      setConsentRegisterSuccess('Consentimento registrado com sucesso!');
      setConsentFormPhone('');
      dismissAfter(setConsentRegisterSuccess);
      // Refresh consent records
      fetchConsentRecords();
    } catch {
      setConsentRegisterError('Falha na conexão com o servidor');
    } finally {
      setConsentRegisterLoading(false);
    }
  };

  const toggleConsentPanel = () => {
    if (!consentPanelOpen) {
      fetchConsentRecords();
    }
    setConsentPanelOpen(!consentPanelOpen);
  };

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

  const consentStatusBadge = (status: string) => {
    switch (status) {
      case 'granted': return <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-mono font-bold" style={{ background: 'rgba(16,185,129,0.15)', color: '#4ade80' }}><CheckCircle2 className="w-2.5 h-2.5" /> GRANTED</span>;
      case 'denied': return <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-mono font-bold" style={{ background: 'rgba(239,68,68,0.15)', color: '#f87171' }}><AlertCircle className="w-2.5 h-2.5" /> DENIED</span>;
      case 'pending': return <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-mono font-bold" style={{ background: 'rgba(245,158,11,0.15)', color: '#fbbf24' }}><Clock className="w-2.5 h-2.5" /> PENDING</span>;
      case 'withdrawn': return <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-mono font-bold" style={{ background: 'rgba(107,114,128,0.15)', color: '#9ca3af' }}><Lock className="w-2.5 h-2.5" /> WITHDRAWN</span>;
      default: return <span className="zcc-badge-muted">{status}</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* ── Header ── */}
      <div className="flex items-center gap-2 mb-2">
        <Home className="w-5 h-5" style={{ color: 'var(--zcc-patina)' }} />
        <h2 className="text-lg font-bold" style={{ color: 'var(--zcc-champagne)' }}>Zélla AirB — Anfitriões Airbnb</h2>
        <span className="zcc-badge-patina">SOMENTE PRO + MAX</span>
      </div>

      {/* ── Conectar com Airbnb (Mock OAuth) ── */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="zcc-panel p-5" style={{ borderColor: 'var(--zcc-patina)', borderWidth: 1 }}>
        <div className="flex items-center gap-2 mb-3">
          <Link2 className="w-4 h-4" style={{ color: 'var(--zcc-patina)' }} />
          <h3 className="text-sm font-semibold" style={{ color: 'var(--zcc-champagne)' }}>Conexão Airbnb — Modo Mock</h3>
          <span className="zcc-badge-patina">MOCK</span>
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <button
            onClick={handleOAuth}
            disabled={oauthLoading}
            className="zcc-btn flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition-all"
            style={{
              background: 'linear-gradient(135deg, #4a9a9a, #3a7a7a)',
              color: '#fff',
              border: '1px solid rgba(74,154,154,0.3)',
              opacity: oauthLoading ? 0.7 : 1,
            }}
          >
            {oauthLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Link2 className="w-4 h-4" />
            )}
            Conectar com Airbnb
          </button>

          {oauthResult && (
            <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-3 w-full">
              <div className="p-2.5 rounded" style={{ background: 'rgba(74,154,154,0.06)', border: '1px solid rgba(74,154,154,0.12)' }}>
                <div className="zcc-eyebrow">ACCESS TOKEN</div>
                <div className="text-[10px] font-mono truncate" style={{ color: 'var(--zcc-patina)', maxWidth: '180px' }}>
                  {oauthResult.accessToken}
                </div>
              </div>
              <div className="p-2.5 rounded" style={{ background: 'rgba(212,168,67,0.06)', border: '1px solid rgba(212,168,67,0.12)' }}>
                <div className="zcc-eyebrow">PROPRIEDADES IMPORTADAS</div>
                <div className="text-sm font-mono font-bold" style={{ color: '#d4a843' }}>{oauthResult.importedCount}</div>
              </div>
              <div className="p-2.5 rounded" style={{ background: 'rgba(74,154,154,0.06)', border: '1px solid rgba(74,154,154,0.12)' }}>
                <div className="zcc-eyebrow">EXPIRA EM</div>
                <div className="text-[10px] font-mono" style={{ color: 'var(--zcc-champagne)' }}>
                  {oauthResult.expiresIn ? `${Math.round(oauthResult.expiresIn / 86400)} dias` : new Date(oauthResult.expiresAt).toLocaleDateString('pt-BR')}
                </div>
              </div>
            </motion.div>
          )}
        </div>

        {/* OAuth notifications */}
        <AnimatePresence>
          {oauthNotification && (
            <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }}
              className="mt-3 p-2.5 rounded flex items-center gap-2"
              style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)' }}>
              <CheckCircle2 className="w-3.5 h-3.5" style={{ color: '#4ade80' }} />
              <span className="text-xs font-mono" style={{ color: '#4ade80' }}>{oauthNotification}</span>
            </motion.div>
          )}
          {oauthError && (
            <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }}
              className="mt-3 p-2.5 rounded flex items-center gap-2"
              style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)' }}>
              <AlertCircle className="w-3.5 h-3.5" style={{ color: '#f87171' }} />
              <span className="text-xs font-mono" style={{ color: '#f87171' }}>{oauthError}</span>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* ── Anti-Overbooking Notice ── */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
        className="p-3.5 rounded-lg" style={{ border: '1px solid rgba(74,154,154,0.25)', background: 'rgba(74,154,154,0.04)' }}>
        <div className="flex items-start gap-2.5">
          <Shield className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color: 'var(--zcc-patina)' }} />
          <div>
            <div className="text-xs font-semibold mb-1" style={{ color: 'var(--zcc-patina)' }}>Anti-Overbooking por Design</div>
            <div className="text-[10px] leading-relaxed" style={{ color: 'var(--zcc-text-secondary)' }}>
              O Zélla verifica disponibilidade no banco local antes de confirmar reservas pelo WhatsApp. Overbooking é bloqueado por design.
            </div>
          </div>
        </div>
      </motion.div>

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

      {/* ── DEV TOOLS — Webhook Simulator ── */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
        className="zcc-panel p-4" style={{ borderColor: 'rgba(212,168,67,0.25)', borderWidth: 1 }}>
        <button
          onClick={() => setDevToolsOpen(!devToolsOpen)}
          className="w-full flex items-center justify-between"
        >
          <div className="flex items-center gap-2">
            <Webhook className="w-4 h-4" style={{ color: '#d4a843' }} />
            <h3 className="text-xs font-semibold" style={{ color: '#d4a843' }}>DEV TOOLS</h3>
            <span className="zcc-badge-gold">SIMULAÇÃO</span>
          </div>
          <ChevronDown className={`w-4 h-4 transition-transform ${devToolsOpen ? 'rotate-180' : ''}`} style={{ color: '#d4a843' }} />
        </button>

        <AnimatePresence>
          {devToolsOpen && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden">
              <div className="mt-4 space-y-3">
                {/* Webhook Button */}
                <div className="flex items-center gap-3">
                  <button
                    onClick={handleWebhook}
                    disabled={webhookLoading}
                    className="zcc-btn flex items-center gap-2 px-4 py-2 rounded text-xs font-semibold"
                    style={{
                      background: 'rgba(212,168,67,0.12)',
                      color: '#d4a843',
                      border: '1px solid rgba(212,168,67,0.25)',
                      opacity: webhookLoading ? 0.7 : 1,
                    }}
                  >
                    {webhookLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Zap className="w-3.5 h-3.5" />}
                    Disparar Nova Reserva
                  </button>
                  <span className="text-[9px] font-mono" style={{ color: 'var(--zcc-text-muted)' }}>
                    POST /api/zcc/airbnb/webhook — eventType: reservation.created
                  </span>
                </div>

                {/* Webhook Result */}
                {webhookResult && (
                  <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}
                    className="p-2.5 rounded" style={{ background: 'rgba(212,168,67,0.06)', border: '1px solid rgba(212,168,67,0.12)' }}>
                    <div className="grid grid-cols-3 gap-3 text-[10px] font-mono">
                      <div>
                        <span style={{ color: 'var(--zcc-text-muted)' }}>EVENT ID</span>
                        <div className="truncate" style={{ color: 'var(--zcc-champagne)' }}>{webhookResult.id}</div>
                      </div>
                      <div>
                        <span style={{ color: 'var(--zcc-text-muted)' }}>EVENT TYPE</span>
                        <div style={{ color: '#d4a843' }}>{webhookResult.eventType}</div>
                      </div>
                      <div>
                        <span style={{ color: 'var(--zcc-text-muted)' }}>CREATED</span>
                        <div style={{ color: 'var(--zcc-champagne)' }}>{new Date(webhookResult.createdAt).toLocaleString('pt-BR')}</div>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Webhook Notifications */}
                {webhookNotification && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    className="p-2.5 rounded flex items-center gap-2"
                    style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)' }}>
                    <CheckCircle2 className="w-3.5 h-3.5" style={{ color: '#4ade80' }} />
                    <span className="text-xs font-mono" style={{ color: '#4ade80' }}>{webhookNotification}</span>
                  </motion.div>
                )}
                {webhookError && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    className="p-2.5 rounded flex items-center gap-2"
                    style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)' }}>
                    <AlertCircle className="w-3.5 h-3.5" style={{ color: '#f87171' }} />
                    <span className="text-xs font-mono" style={{ color: '#f87171' }}>{webhookError}</span>
                  </motion.div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

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

      {/* ── LGPD Consent Management ── */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
        className="zcc-panel p-5" style={{ borderColor: 'rgba(74,154,154,0.2)', borderWidth: 1 }}>
        <button
          onClick={toggleConsentPanel}
          className="w-full flex items-center justify-between"
        >
          <div className="flex items-center gap-2">
            <Eye className="w-4 h-4" style={{ color: 'var(--zcc-patina)' }} />
            <h3 className="text-sm font-semibold" style={{ color: 'var(--zcc-champagne)' }}>Gestão de Consentimento — LGPD</h3>
            <span className="zcc-badge-patina">LGPD</span>
          </div>
          <ChevronDown className={`w-4 h-4 transition-transform ${consentPanelOpen ? 'rotate-180' : ''}`} style={{ color: 'var(--zcc-patina)' }} />
        </button>

        <AnimatePresence>
          {consentPanelOpen && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden">
              <div className="mt-4 space-y-4">
                {/* Register Consent Form */}
                <div className="p-3 rounded-lg" style={{ background: 'var(--zcc-lacquer-sunken)', border: '1px solid rgba(74,154,154,0.12)' }}>
                  <div className="text-xs font-semibold mb-3" style={{ color: 'var(--zcc-champagne)' }}>Registrar Consentimento</div>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <div className="flex-1">
                      <label className="text-[9px] font-mono" style={{ color: 'var(--zcc-text-muted)' }}>TELEFONE HÓSPEDE</label>
                      <div className="flex items-center gap-1.5 mt-1">
                        <Phone className="w-3.5 h-3.5 flex-shrink-0" style={{ color: 'var(--zcc-patina)' }} />
                        <input
                          type="text"
                          value={consentFormPhone}
                          onChange={(e) => setConsentFormPhone(e.target.value)}
                          placeholder="+55 11 99999-0000"
                          className="flex-1 px-2 py-1.5 rounded text-xs font-mono"
                          style={{
                            background: 'var(--zcc-lacquer)',
                            border: '1px solid rgba(74,154,154,0.2)',
                            color: 'var(--zcc-champagne)',
                            outline: 'none',
                          }}
                        />
                      </div>
                    </div>
                    <div>
                      <label className="text-[9px] font-mono" style={{ color: 'var(--zcc-text-muted)' }}>TIPO CONSENTIMENTO</label>
                      <select
                        value={consentFormType}
                        onChange={(e) => setConsentFormType(e.target.value as typeof consentFormType)}
                        className="w-full px-2 py-1.5 rounded text-xs font-mono mt-1"
                        style={{
                          background: 'var(--zcc-lacquer)',
                          border: '1px solid rgba(74,154,154,0.2)',
                          color: 'var(--zcc-champagne)',
                          outline: 'none',
                        }}
                      >
                        <option value="whatsapp_communication">WhatsApp Comunicação</option>
                        <option value="data_processing">Processamento de Dados</option>
                        <option value="marketing">Marketing</option>
                      </select>
                    </div>
                    <div className="flex items-end">
                      <button
                        onClick={handleRegisterConsent}
                        disabled={consentRegisterLoading}
                        className="zcc-btn px-4 py-1.5 rounded text-xs font-semibold flex items-center gap-2"
                        style={{
                          background: 'rgba(74,154,154,0.15)',
                          color: 'var(--zcc-patina)',
                          border: '1px solid rgba(74,154,154,0.3)',
                          opacity: consentRegisterLoading ? 0.7 : 1,
                        }}
                      >
                        {consentRegisterLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Database className="w-3.5 h-3.5" />}
                        Registrar
                      </button>
                    </div>
                  </div>

                  {/* Consent register notifications */}
                  {consentRegisterSuccess && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                      className="mt-2 p-2 rounded flex items-center gap-2"
                      style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)' }}>
                      <CheckCircle2 className="w-3 h-3" style={{ color: '#4ade80' }} />
                      <span className="text-[10px] font-mono" style={{ color: '#4ade80' }}>{consentRegisterSuccess}</span>
                    </motion.div>
                  )}
                  {consentRegisterError && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                      className="mt-2 p-2 rounded flex items-center gap-2"
                      style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)' }}>
                      <AlertCircle className="w-3 h-3" style={{ color: '#f87171' }} />
                      <span className="text-[10px] font-mono" style={{ color: '#f87171' }}>{consentRegisterError}</span>
                    </motion.div>
                  )}
                </div>

                {/* Consent Records Table */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-xs font-semibold" style={{ color: 'var(--zcc-champagne)' }}>
                      Registros de Consentimento
                    </div>
                    <button onClick={fetchConsentRecords} disabled={consentLoading}
                      className="text-[10px] font-mono px-2 py-1 rounded"
                      style={{ color: 'var(--zcc-patina)', background: 'rgba(74,154,154,0.08)', border: '1px solid rgba(74,154,154,0.15)' }}>
                      {consentLoading ? 'Carregando...' : 'Atualizar'}
                    </button>
                  </div>

                  {consentError && (
                    <div className="p-2 rounded flex items-center gap-2 mb-2"
                      style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)' }}>
                      <AlertCircle className="w-3 h-3" style={{ color: '#f87171' }} />
                      <span className="text-[10px] font-mono" style={{ color: '#f87171' }}>{consentError}</span>
                    </div>
                  )}

                  {consentRecords.length === 0 && !consentLoading ? (
                    <div className="p-4 rounded text-center" style={{ background: 'var(--zcc-lacquer-sunken)', border: '1px solid rgba(74,154,154,0.08)' }}>
                      <Database className="w-5 h-5 mx-auto mb-2" style={{ color: 'var(--zcc-text-muted)' }} />
                      <div className="text-[10px] font-mono" style={{ color: 'var(--zcc-text-muted)' }}>
                        Nenhum registro encontrado. Registre o primeiro consentimento acima.
                      </div>
                    </div>
                  ) : (
                    <div className="overflow-x-auto zcc-scroll max-h-64">
                      <table className="zcc-table w-full text-[10px]">
                        <thead>
                          <tr>
                            <th className="text-left px-2 py-1.5">Telefone</th>
                            <th className="text-left px-2 py-1.5">Tipo</th>
                            <th className="text-left px-2 py-1.5">Status</th>
                            <th className="text-left px-2 py-1.5">Fonte</th>
                            <th className="text-left px-2 py-1.5">Data</th>
                          </tr>
                        </thead>
                        <tbody>
                          {consentRecords.map((record) => (
                            <tr key={record.id}>
                              <td className="px-2 py-1.5 font-mono" style={{ color: 'var(--zcc-champagne)' }}>{record.guestPhone}</td>
                              <td className="px-2 py-1.5 font-mono" style={{ color: 'var(--zcc-patina)' }}>{record.consentType}</td>
                              <td className="px-2 py-1.5">{consentStatusBadge(record.status)}</td>
                              <td className="px-2 py-1.5 font-mono" style={{ color: 'var(--zcc-text-muted)' }}>{record.source}</td>
                              <td className="px-2 py-1.5 font-mono" style={{ color: 'var(--zcc-text-muted)' }}>
                                {new Date(record.createdAt).toLocaleString('pt-BR')}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
