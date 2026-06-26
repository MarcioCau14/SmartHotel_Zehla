'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Brain,
  Activity,
  Zap,
  Timer,
  Coins,
  TrendingUp,
  ShieldCheck,
  Database,
  Cpu,
  MessageSquare,
  DollarSign,
  Lock,
  Headphones,
  Megaphone,
  CalendarCheck,
  CreditCard,
  Star,
  ChevronRight,
} from 'lucide-react';
import { globalMetrics } from '@/lib/zcc-clients-data';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface ThompsonProvider {
  name: string;
  alpha: number;
  beta: number;
  successRate: number;
  circuitBreaker: 'CLOSED' | 'HALF_OPEN' | 'OPEN';
}

interface FeedEntry {
  id: string;
  timestamp: string;
  type: 'price' | 'lead' | 'payment' | 'message' | 'review' | 'support';
  message: string;
}

interface ContextBucket {
  label: string;
  icon: React.ReactNode;
  level: number; // 0-100
}

// ---------------------------------------------------------------------------
// Static / seed data
// ---------------------------------------------------------------------------

const thompsonProvidersSeed: ThompsonProvider[] = [
  { name: 'Claude', alpha: 47.2, beta: 5.3, successRate: 89.9, circuitBreaker: 'CLOSED' },
  { name: 'GPT-4o', alpha: 39.8, beta: 7.1, successRate: 84.8, circuitBreaker: 'CLOSED' },
  { name: 'Gemini', alpha: 28.4, beta: 9.6, successRate: 74.7, circuitBreaker: 'HALF_OPEN' },
  { name: 'Llama', alpha: 15.1, beta: 12.3, successRate: 55.1, circuitBreaker: 'OPEN' },
];

const feedMessages: Omit<FeedEntry, 'id' | 'timestamp'>[] = [
  { type: 'price', message: 'Preço ajustado +12% → Pousada Serenity' },
  { type: 'lead', message: 'Lead qualificado → Chalés da Montanha' },
  { type: 'payment', message: 'PIX confirmado R$480 → Refúgio das Nuvens' },
  { type: 'message', message: 'WhatsApp auto-reply enviado → Casa da Serra' },
  { type: 'review', message: 'Review 5★ respondida → Pousada Horizonte' },
  { type: 'price', message: 'Preço ajustado -5% → Villa das Flores' },
  { type: 'lead', message: 'Lead convertido em reserva → Eco Lodge' },
  { type: 'payment', message: 'PIX confirmado R$1.280 → Fazenda Vista Bela' },
  { type: 'support', message: 'Ticket resolvido automaticamente #4821' },
  { type: 'message', message: 'Check-in reminder enviado → 14 hóspedes' },
  { type: 'price', message: 'Preço ajustado +8% → Serra Verde Inn' },
  { type: 'lead', message: 'Lead score 94% → Pousada Bela Vista' },
  { type: 'payment', message: 'PIX confirmado R$750 → Chalés das Nuvens' },
  { type: 'review', message: 'Sentimento negativo detectado → #review-772' },
  { type: 'support', message: 'Disparo WhatsApp em lote → 23 contatos' },
  { type: 'message', message: 'Upsell suíte premium sugerido → Guest #1089' },
  { type: 'price', message: 'Dynamic pricing ativado feriado → 7 pousadas' },
  { type: 'lead', message: 'Lead recapturado após 48h → Eco Lodge' },
];

const contextBucketsSeed: ContextBucket[] = [
  { label: 'Reserva', icon: <CalendarCheck className="w-3.5 h-3.5" />, level: 82 },
  { label: 'Check-in', icon: <CreditCard className="w-3.5 h-3.5" />, level: 45 },
  { label: 'Preço', icon: <TrendingUp className="w-3.5 h-3.5" />, level: 91 },
  { label: 'WhatsApp', icon: <MessageSquare className="w-3.5 h-3.5" />, level: 76 },
  { label: 'Review', icon: <Star className="w-3.5 h-3.5" />, level: 38 },
  { label: 'Pagamento', icon: <DollarSign className="w-3.5 h-3.5" />, level: 64 },
  { label: 'Suporte', icon: <Headphones className="w-3.5 h-3.5" />, level: 29 },
  { label: 'Promoção', icon: <Megaphone className="w-3.5 h-3.5" />, level: 57 },
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatTime(d: Date): string {
  return d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
}

function feedIcon(type: FeedEntry['type']) {
  switch (type) {
    case 'price': return <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />;
    case 'lead': return <Activity className="w-3.5 h-3.5 text-cyan-400" />;
    case 'payment': return <DollarSign className="w-3.5 h-3.5 text-amber-400" />;
    case 'message': return <MessageSquare className="w-3.5 h-3.5 text-violet-400" />;
    case 'review': return <Star className="w-3.5 h-3.5 text-yellow-400" />;
    case 'support': return <Headphones className="w-3.5 h-3.5 text-orange-400" />;
  }
}

function circuitColor(cb: string) {
  if (cb === 'CLOSED') return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
  if (cb === 'HALF_OPEN') return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
  return 'bg-red-500/20 text-red-400 border-red-500/30';
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function CerebroZella() {
  // ---- Thompson Sampling state ----
  const [providers, setProviders] = useState<ThompsonProvider[]>(thompsonProvidersSeed);
  const [status, setStatus] = useState<'Ativo' | 'Aprendendo'>('Ativo');

  // ---- Real-time feed state ----
  const seedFeed: FeedEntry[] = Array.from({ length: 6 }, (_, i) => {
    const msg = feedMessages[i % feedMessages.length];
    const d = new Date(Date.now() - (6 - i) * 2500);
    return { id: `seed-${i}`, timestamp: formatTime(d), type: msg.type, message: msg.message };
  });
  const [feed, setFeed] = useState<FeedEntry[]>(seedFeed);
  const feedIndexRef = useRef(6);
  const feedEndRef = useRef<HTMLDivElement>(null);

  // ---- Context buckets state ----
  const [buckets, setBuckets] = useState<ContextBucket[]>(contextBucketsSeed);

  // ---- Semantic cache state ----
  const [cacheHitRate, setCacheHitRate] = useState(87.3);
  const [cacheEntries, setCacheEntries] = useState(847);
  const [cacheTtl, setCacheTtl] = useState(4.2);

  // -----------------------------------------------------------------------
  // Thompson Sampling — animate every 3s
  // -----------------------------------------------------------------------
  useEffect(() => {
    const id = setInterval(() => {
      setProviders((prev) =>
        prev.map((p) => {
          const jitter = (Math.random() - 0.5) * 2.4;
          const newRate = Math.min(99.9, Math.max(40, p.successRate + jitter));
          const newAlpha = +(p.alpha + (Math.random() - 0.3) * 0.8).toFixed(1);
          const newBeta = +(p.beta + (Math.random() - 0.5) * 0.4).toFixed(1);
          return { ...p, successRate: +newRate.toFixed(1), alpha: newAlpha, beta: newBeta };
        })
      );
      // Occasionally toggle status
      setStatus((prev) => (Math.random() > 0.85 ? (prev === 'Ativo' ? 'Aprendendo' : 'Ativo') : prev));
    }, 3000);
    return () => clearInterval(id);
  }, []);

  // -----------------------------------------------------------------------
  // Real-time feed — new entry every 2.5s
  // -----------------------------------------------------------------------
  const addFeedEntry = useCallback(() => {
    const msg = feedMessages[feedIndexRef.current % feedMessages.length];
    feedIndexRef.current += 1;
    const entry: FeedEntry = {
      id: `feed-${Date.now()}`,
      timestamp: formatTime(new Date()),
      type: msg.type,
      message: msg.message,
    };
    setFeed((prev) => {
      const next = [...prev, entry];
      return next.length > 40 ? next.slice(-40) : next;
    });
  }, []);

  useEffect(() => {
    const id = setInterval(addFeedEntry, 2500);
    return () => clearInterval(id);
  }, [addFeedEntry]);

  // Auto-scroll
  useEffect(() => {
    feedEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [feed]);

  // -----------------------------------------------------------------------
  // Context buckets — subtle animation every 4s
  // -----------------------------------------------------------------------
  useEffect(() => {
    const id = setInterval(() => {
      setBuckets((prev) =>
        prev.map((b) => ({
          ...b,
          level: Math.min(100, Math.max(10, b.level + (Math.random() - 0.5) * 8)),
        }))
      );
    }, 4000);
    return () => clearInterval(id);
  }, []);

  // -----------------------------------------------------------------------
  // Semantic cache — subtle animation every 5s
  // -----------------------------------------------------------------------
  useEffect(() => {
    const id = setInterval(() => {
      setCacheHitRate((prev) => Math.min(99, Math.max(78, prev + (Math.random() - 0.4) * 1.2)));
      setCacheEntries((prev) => Math.min(1000, Math.max(700, Math.round(prev + (Math.random() - 0.4) * 12))));
      setCacheTtl((prev) => Math.min(8, Math.max(2, +(prev + (Math.random() - 0.5) * 0.3).toFixed(1))));
    }, 5000);
    return () => clearInterval(id);
  }, []);

  // -----------------------------------------------------------------------
  // Render
  // -----------------------------------------------------------------------

  return (
    <div className="space-y-5">
      {/* ================================================================
          HEADER
      ================================================================= */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <motion.div
            animate={{ scale: [1, 1.08, 1] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' as const }}
          >
            <Brain className="w-6 h-6 text-emerald-400" />
          </motion.div>
          <h2 className="text-lg font-bold text-neutral-100 tracking-tight">Cérebro ZÉLLA</h2>
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-60" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
          </span>
        </div>

        <motion.span
          key={status}
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          className={`inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-full border ${
            status === 'Ativo'
              ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/25'
              : 'bg-amber-500/15 text-amber-400 border-amber-500/25'
          }`}
        >
          <Cpu className="w-3 h-3" />
          {status}
        </motion.span>
      </div>

      {/* ================================================================
          THOMPSON SAMPLING
      ================================================================= */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
        className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-5"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-neutral-300 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            Thompson Sampling — Routing Inteligente
          </h3>
          <span className="text-[10px] text-neutral-600 font-mono">α/β atualização a cada 3s</span>
        </div>

        <div className="space-y-3">
          {providers.map((p, i) => (
            <motion.div
              key={p.name}
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.08 }}
              className="flex items-center gap-3"
            >
              {/* Name */}
              <span className="w-16 text-xs font-semibold text-neutral-300 shrink-0">{p.name}</span>

              {/* Bar */}
              <div className="flex-1 h-5 bg-white/[0.04] rounded-md overflow-hidden relative">
                <motion.div
                  className="h-full rounded-md"
                  style={{
                    background: p.circuitBreaker === 'CLOSED'
                      ? 'linear-gradient(90deg, rgba(52,211,153,0.35), rgba(52,211,153,0.55))'
                      : p.circuitBreaker === 'HALF_OPEN'
                      ? 'linear-gradient(90deg, rgba(251,191,36,0.3), rgba(251,191,36,0.5))'
                      : 'linear-gradient(90deg, rgba(248,113,113,0.25), rgba(248,113,113,0.4))',
                  }}
                  animate={{ width: `${p.successRate}%` }}
                  transition={{ duration: 1.2, ease: 'easeInOut' as const }}
                />
                <span className="absolute inset-0 flex items-center justify-center text-[10px] font-mono font-bold text-white/80">
                  {p.successRate.toFixed(1)}%
                </span>
              </div>

              {/* Alpha/Beta */}
              <span className="text-[10px] text-neutral-500 font-mono w-20 text-right shrink-0 hidden sm:inline-block">
                α {p.alpha.toFixed(1)} / β {p.beta.toFixed(1)}
              </span>

              {/* Circuit breaker */}
              <span
                className={`text-[9px] font-bold px-2 py-0.5 rounded-md border shrink-0 ${circuitColor(p.circuitBreaker)}`}
              >
                {p.circuitBreaker}
              </span>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* ================================================================
          BRAIN METRICS — 4 mini cards
      ================================================================= */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          {
            label: 'Acurácia',
            value: `${globalMetrics.avgBrainAccuracy}%`,
            icon: <Zap className="w-4 h-4 text-emerald-400" />,
            color: 'text-emerald-400',
          },
          {
            label: 'Latência Média',
            value: '23ms',
            icon: <Timer className="w-4 h-4 text-cyan-400" />,
            color: 'text-cyan-400',
          },
          {
            label: 'Tokens Hoje',
            value: '45.2K',
            icon: <Cpu className="w-4 h-4 text-violet-400" />,
            color: 'text-violet-400',
          },
          {
            label: 'Economia Gerada',
            value: `R$${(globalMetrics.totalRevenue / 1000).toFixed(1)}k`,
            icon: <Coins className="w-4 h-4 text-amber-400" />,
            color: 'text-amber-400',
          },
        ].map((m, i) => (
          <motion.div
            key={m.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 + i * 0.07 }}
            className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-4 flex items-start gap-3"
          >
            <div className="mt-0.5">{m.icon}</div>
            <div>
              <div className="text-[10px] text-neutral-500 uppercase tracking-wider">{m.label}</div>
              <div className={`text-lg font-bold font-mono ${m.color}`}>{m.value}</div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* ================================================================
          REAL-TIME FEED + CONTEXT DISCRETIZER — side by side on desktop
      ================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        {/* --- Real-time Feed (3 cols) --- */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="lg:col-span-3 bg-white/[0.03] border border-white/[0.06] rounded-xl p-5 flex flex-col"
        >
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-neutral-300 flex items-center gap-2">
              <Activity className="w-4 h-4 text-emerald-400" />
              Feed de Decisões em Tempo Real
            </h3>
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-50" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
          </div>

          <div className="flex-1 max-h-72 overflow-y-auto space-y-1 pr-1 custom-scrollbar">
            <AnimatePresence initial={false}>
              {feed.map((entry) => (
                <motion.div
                  key={entry.id}
                  initial={{ opacity: 0, x: -16, height: 0 }}
                  animate={{ opacity: 1, x: 0, height: 'auto' }}
                  exit={{ opacity: 0, x: 16 }}
                  transition={{ duration: 0.35 }}
                  className="flex items-center gap-2.5 py-1.5 px-2 rounded-lg hover:bg-white/[0.02] transition-colors"
                >
                  <span className="text-[10px] text-neutral-600 font-mono w-16 shrink-0">
                    {entry.timestamp}
                  </span>
                  <span className="shrink-0">{feedIcon(entry.type)}</span>
                  <span className="text-xs text-neutral-300 truncate">{entry.message}</span>
                  <ChevronRight className="w-3 h-3 text-neutral-700 shrink-0 ml-auto" />
                </motion.div>
              ))}
            </AnimatePresence>
            <div ref={feedEndRef} />
          </div>
        </motion.div>

        {/* --- Context Discretizer (2 cols) --- */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.32 }}
          className="lg:col-span-2 bg-white/[0.03] border border-white/[0.06] rounded-xl p-5"
        >
          <h3 className="text-sm font-semibold text-neutral-300 flex items-center gap-2 mb-4">
            <Database className="w-4 h-4 text-emerald-400" />
            Context Discretizer — Segmentos
          </h3>

          <div className="space-y-2.5">
            {buckets.map((b, i) => (
              <motion.div
                key={b.label}
                initial={{ opacity: 0, x: 12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.35 + i * 0.04 }}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="flex items-center gap-1.5 text-[11px] text-neutral-400">
                    <span className="text-emerald-500/70">{b.icon}</span>
                    {b.label}
                  </span>
                  <span className="text-[10px] font-mono text-neutral-600">{Math.round(b.level)}%</span>
                </div>
                <div className="h-1.5 bg-white/[0.04] rounded-full overflow-hidden">
                  <motion.div
                    className="h-full rounded-full"
                    style={{
                      background:
                        b.level > 75
                          ? 'linear-gradient(90deg, #34d399, #10b981)'
                          : b.level > 50
                          ? 'linear-gradient(90deg, #2dd4bf, #14b8a6)'
                          : 'linear-gradient(90deg, #6b7280, #4b5563)',
                    }}
                    animate={{ width: `${b.level}%` }}
                    transition={{ duration: 1.5, ease: 'easeInOut' as const }}
                  />
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* ================================================================
          SEMANTIC CACHE
      ================================================================= */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-5"
      >
        <h3 className="text-sm font-semibold text-neutral-300 flex items-center gap-2 mb-4">
          <Lock className="w-4 h-4 text-emerald-400" />
          Semantic Cache
        </h3>

        <div className="grid grid-cols-3 gap-4 mb-4">
          {[
            { label: 'Hit Rate', value: `${cacheHitRate.toFixed(1)}%`, color: 'text-emerald-400' },
            { label: 'Entries', value: `${cacheEntries}/1000`, color: 'text-cyan-400' },
            { label: 'Avg TTL', value: `${cacheTtl.toFixed(1)}min`, color: 'text-violet-400' },
          ].map((s) => (
            <div key={s.label} className="bg-white/[0.02] rounded-lg p-3">
              <div className="text-[10px] text-neutral-500 mb-0.5">{s.label}</div>
              <div className={`text-base font-bold font-mono ${s.color}`}>{s.value}</div>
            </div>
          ))}
        </div>

        {/* Fill bar */}
        <div className="flex items-center gap-3">
          <span className="text-[10px] text-neutral-500 w-12 shrink-0">Fill</span>
          <div className="flex-1 h-2 bg-white/[0.04] rounded-full overflow-hidden">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-400"
              animate={{ width: `${(cacheEntries / 1000) * 100}%` }}
              transition={{ duration: 1.5, ease: 'easeInOut' as const }}
            />
          </div>
          <span className="text-[10px] font-mono text-neutral-500 w-10 text-right">
            {((cacheEntries / 1000) * 100).toFixed(0)}%
          </span>
        </div>
      </motion.div>

      {/* ================================================================
          Inline style for custom scrollbar
      ================================================================= */}
      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.08);
          border-radius: 999px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.15);
        }
      `}</style>
    </div>
  );
}