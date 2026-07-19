'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Brain, Activity, Zap, Timer, Coins, TrendingUp,
  ShieldCheck, Database, Cpu, MessageSquare, DollarSign,
  Lock, Headphones, Megaphone, CalendarCheck, CreditCard,
  Star, ChevronRight, RefreshCw, Ghost, Heart, Target,
} from 'lucide-react';
import { globalMetrics } from '@/lib/zcc-clients-data';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface ProviderData {
  id: string;
  name: string;
  tier: string;
  circuitState: string;
  alpha: number;
  beta: number;
  estimatedSuccessRate: number;
  avgLatencyMs: number;
  totalRequests: number;
  costPer1kInput: number;
  costPer1kOutput: number;
}

interface BrainHealthResponse {
  status: string;
  service: string;
  version: string;
  engine: string;
  budget: any;
  cache: any;
  circuitBreakers: Record<string, string>;
  providers: ProviderData[];
  learning?: {
    totalPatterns: number;
    verifiedPatterns: number;
    antiPatternsCount: number;
    learningVelocity: number;
    avgSentimentScore: number;
  };
}

interface FeedEntry {
  id: string;
  timestamp: string;
  type: 'price' | 'lead' | 'payment' | 'message' | 'review' | 'support';
  message: string;
}

// ---------------------------------------------------------------------------
// Seed data for feed (no real SSE in ZCC)
// ---------------------------------------------------------------------------

const feedMessages: Omit<FeedEntry, 'id' | 'timestamp'>[] = [
  // Feed zerado — sem clientes ativos ainda
  // Quando as Zélla Pousadas/Airbnb Testes forem criadas, o feed será alimentado em tempo real
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
  // ---- Real brain data from /api/brain ----
  const [brainData, setBrainData] = useState<BrainHealthResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [lastFetch, setLastFetch] = useState<Date | null>(null);

  const fetchBrainHealth = useCallback(async () => {
    try {
      const res = await fetch('/api/brain');
      if (res.ok) {
        const data = await res.json();
        setBrainData(data);
        setLastFetch(new Date());
      }
    } catch (err) {
      console.error('[CerebroZella] Failed to fetch brain health:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Initial fetch + refresh every 5s
  useEffect(() => {
    fetchBrainHealth();
    const id = setInterval(fetchBrainHealth, 5000);
    return () => clearInterval(id);
  }, [fetchBrainHealth]);

  // ---- Feed state ----
  const [feed, setFeed] = useState<FeedEntry[]>(() => {
    if (feedMessages.length === 0) return []; // No clients yet — empty feed
    const baseTime = Date.now();
    return Array.from({ length: 6 }, (_, i) => {
      const msg = feedMessages[i % feedMessages.length];
      const d = new Date(baseTime - (6 - i) * 2500);
      return { id: `seed-${i}`, timestamp: formatTime(d), type: msg.type, message: msg.message };
    });
  });
  const feedIndexRef = useRef(6);
  const feedEndRef = useRef<HTMLDivElement>(null);

  const addFeedEntry = useCallback(() => {
    if (feedMessages.length === 0) return; // No clients — no feed entries
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

  useEffect(() => {
    feedEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [feed]);

  // ---- Derive provider display data from real brain data ----
  const providers = brainData?.providers || [];

  // ---- Derive cache stats from real brain data ----
  const cacheData = brainData?.cache;
  const cacheHitRate = cacheData?.hitRate ?? 0;
  const cacheEntries = cacheData?.totalEntries ?? 0;
  const cacheTtl = cacheData?.avgTtlMinutes ?? 0;

  // ---- Budget from real brain data ----
  const budgetData = brainData?.budget;

  // Status derived from real data
  const allClosed = providers.length > 0 && providers.every(p => p.circuitState === 'CLOSED');
  const status = isLoading ? 'Carregando...' : allClosed ? 'Ativo' : 'Degradado';

  // Total requests and avg latency from real providers
  const totalRequests = providers.reduce((s, p) => s + (p.totalRequests || 0), 0);
  const avgLatency = providers.length > 0
    ? Math.round(providers.reduce((s, p) => s + (p.avgLatencyMs || 0), 0) / providers.length)
    : 0;

  // -----------------------------------------------------------------------
  // Render
  // -----------------------------------------------------------------------

  return (
    <div className="space-y-5">
      {/* HEADER */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <motion.div animate={{ scale: [1, 1.08, 1] }} transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' as const }}>
            <Brain className="w-6 h-6 text-emerald-400" />
          </motion.div>
          <div>
            <h2 className="text-lg font-bold text-neutral-100 tracking-tight">Cerebro ZELLA</h2>
            <p className="text-[9px] text-neutral-600 font-mono">
              {brainData?.service || 'ZaosNeuroRouter'} · v{brainData?.version || '—'} · <span className="text-emerald-500/60">Self-Learning v2.0</span>
            </p>
          </div>
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-60" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
          </span>
        </div>

        <div className="flex items-center gap-3">
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
          <button onClick={fetchBrainHealth} className="p-1.5 rounded-lg hover:bg-white/[0.04] transition-colors" title="Atualizar">
            <RefreshCw className={`w-3.5 h-3.5 text-neutral-500 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
          {lastFetch && (
            <span className="text-[9px] text-neutral-700 font-mono hidden sm:block">
              {lastFetch.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
            </span>
          )}
        </div>
      </div>

      {/* THOMPSON SAMPLING — Real provider data */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }}
        className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-5"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-neutral-300 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            Thompson Sampling — Routing Inteligente
          </h3>
          <span className="text-[10px] text-neutral-600 font-mono">dados reais a cada 5s</span>
        </div>

        {isLoading ? (
          <div className="text-center py-8 text-xs text-neutral-600">Conectando ao cerebro...</div>
        ) : providers.length === 0 ? (
          <div className="text-center py-8 text-xs text-neutral-600">
            Nenhum provider registrado. Verifique as API keys.
          </div>
        ) : (
          <div className="space-y-3">
            {providers.map((p, i) => {
              const successRate = Math.round((p.alpha / (p.alpha + p.beta)) * 10000) / 100;
              return (
                <motion.div key={p.id} initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.08 }} className="flex items-center gap-3"
                >
                  <span className="w-20 text-xs font-semibold text-neutral-300 shrink-0 truncate">{p.name}</span>
                  <div className="flex-1 h-5 bg-white/[0.04] rounded-md overflow-hidden relative">
                    <motion.div className="h-full rounded-md"
                      style={{
                        background: p.circuitState === 'CLOSED'
                          ? 'linear-gradient(90deg, rgba(52,211,153,0.35), rgba(52,211,153,0.55))'
                          : p.circuitState === 'HALF_OPEN'
                          ? 'linear-gradient(90deg, rgba(251,191,36,0.3), rgba(251,191,36,0.5))'
                          : 'linear-gradient(90deg, rgba(248,113,113,0.25), rgba(248,113,113,0.4))',
                      }}
                      animate={{ width: `${Math.min(100, successRate)}%` }}
                      transition={{ duration: 1.2, ease: 'easeInOut' as const }}
                    />
                    <span className="absolute inset-0 flex items-center justify-center text-[10px] font-mono font-bold text-white/80">
                      {successRate.toFixed(1)}%
                    </span>
                  </div>
                  <span className="text-[10px] text-neutral-500 font-mono w-20 text-right shrink-0 hidden sm:inline-block">
                    a {p.alpha.toFixed(1)} / b {p.beta.toFixed(1)}
                  </span>
                  <span className={`text-[9px] font-bold px-2 py-0.5 rounded-md border shrink-0 ${circuitColor(p.circuitState)}`}>
                    {p.circuitState}
                  </span>
                </motion.div>
              );
            })}
          </div>
        )}
      </motion.div>

      {/* BRAIN METRICS — 6 mini cards with real data + v2.0 learning metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
        {[
          {
            label: 'Requests Hoje',
            value: totalRequests > 1000 ? `${(totalRequests / 1000).toFixed(1)}k` : String(totalRequests),
            icon: <Zap className="w-4 h-4 text-emerald-400" />,
            color: 'text-emerald-400',
          },
          {
            label: 'Latencia Media',
            value: `${avgLatency}ms`,
            icon: <Timer className="w-4 h-4 text-cyan-400" />,
            color: 'text-cyan-400',
          },
          {
            label: 'Cache Hit Rate',
            value: `${cacheHitRate.toFixed(1)}%`,
            icon: <Cpu className="w-4 h-4 text-violet-400" />,
            color: 'text-violet-400',
          },
          {
            label: 'Padroes Aprendidos',
            value: String(brainData?.learning?.totalPatterns || 0),
            icon: <Brain className="w-4 h-4 text-emerald-400" />,
            color: 'text-emerald-400',
            sub: `${brainData?.learning?.verifiedPatterns || 0} verificados`,
          },
          {
            label: 'Anti-padroes',
            value: String(brainData?.learning?.antiPatternsCount || 0),
            icon: <Ghost className="w-4 h-4 text-red-400" />,
            color: 'text-red-400',
            sub: 'erros capturados',
          },
          {
            label: 'Sentimento Medio',
            value: brainData?.learning?.avgSentimentScore
              ? `${(brainData.learning.avgSentimentScore > 0 ? '+' : '')}${brainData.learning.avgSentimentScore.toFixed(2)}`
              : '—',
            icon: <Heart className="w-4 h-4 text-pink-400" />,
            color: brainData?.learning?.avgSentimentScore
              ? brainData.learning.avgSentimentScore > 0 ? 'text-emerald-400' : brainData.learning.avgSentimentScore < 0 ? 'text-red-400' : 'text-neutral-400'
              : 'text-neutral-400',
            sub: brainData?.learning?.learningVelocity
              ? `${brainData.learning.learningVelocity}/sem aprend.`
              : undefined,
          },
        ].map((m, i) => (
          <motion.div key={m.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 + i * 0.07 }}
            className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-4 flex items-start gap-3"
          >
            <div className="mt-0.5">{m.icon}</div>
            <div>
              <div className="text-[10px] text-neutral-500 uppercase tracking-wider">{m.label}</div>
              <div className={`text-lg font-bold font-mono ${m.color}`}>{m.value}</div>
              {m.sub && <div className="text-[9px] text-neutral-600 mt-0.5">{m.sub}</div>}
            </div>
          </motion.div>
        ))}
      </div>

      {/* REAL-TIME FEED + BUDGET INFO — side by side */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        {/* Real-time Feed (3 cols) */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
          className="lg:col-span-3 bg-white/[0.03] border border-white/[0.06] rounded-xl p-5 flex flex-col"
        >
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-neutral-300 flex items-center gap-2">
              <Activity className="w-4 h-4 text-emerald-400" />
              Feed de Decisoes em Tempo Real
            </h3>
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-50" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
          </div>
          <div className="flex-1 max-h-72 overflow-y-auto space-y-1 pr-1 custom-scrollbar">
            <AnimatePresence initial={false}>
              {feed.length === 0 && (
                <div className="text-center py-8">
                  <Activity className="w-5 h-5 mx-auto mb-2 text-neutral-600" />
                  <p className="text-xs text-neutral-600 font-mono">Nenhum cliente ativo — feed vazio</p>
                  <p className="text-[9px] text-neutral-700 font-mono mt-1">Conecte Zélla Pousadas/Airbnb Testes para ver decisões em tempo real</p>
                </div>
              )}
              {feed.map((entry) => (
                <motion.div key={entry.id} initial={{ opacity: 0, x: -16, height: 0 }} animate={{ opacity: 1, x: 0, height: 'auto' }}
                  exit={{ opacity: 0, x: 16 }} transition={{ duration: 0.35 }}
                  className="flex items-center gap-2.5 py-1.5 px-2 rounded-lg hover:bg-white/[0.02] transition-colors"
                >
                  <span className="text-[10px] text-neutral-600 font-mono w-16 shrink-0">{entry.timestamp}</span>
                  <span className="shrink-0">{feedIcon(entry.type)}</span>
                  <span className="text-xs text-neutral-300 truncate">{entry.message}</span>
                  <ChevronRight className="w-3 h-3 text-neutral-700 shrink-0 ml-auto" />
                </motion.div>
              ))}
            </AnimatePresence>
            <div ref={feedEndRef} />
          </div>
        </motion.div>

        {/* Budget & Engine Info (2 cols) */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.32 }}
          className="lg:col-span-2 bg-white/[0.03] border border-white/[0.06] rounded-xl p-5"
        >
          <h3 className="text-sm font-semibold text-neutral-300 flex items-center gap-2 mb-4">
            <Database className="w-4 h-4 text-emerald-400" />
            Motor Cognitivo
          </h3>
          <div className="space-y-3">
            {[
              { label: 'Algoritmo', value: 'Thompson Sampling + Pareto' },
              { label: 'Circuit Breakers', value: `${providers.filter(p => p.circuitState === 'CLOSED').length}/${providers.length} CLOSED` },
              { label: 'Semantic Cache', value: `${cacheHitRate.toFixed(1)}% hit · ${cacheEntries} entries` },
              { label: 'Budget Guard', value: budgetData ? `US$ ${budgetData.spentToday?.toFixed(2) || '0.00'} hoje` : 'NOMINAL' },
              { label: 'Providers', value: `${providers.length} registrados (${[...new Set(providers.map(p => p.tier))].length} tiers)` },
              { label: 'Anti-Padroes', value: `${brainData?.learning?.antiPatternsCount || 0} capturados` },
              { label: 'Confidence Decay', value: 'ativo (30d threshold)' },
              { label: 'Adaptive RAG', value: 'threshold auto-ajustavel' },
              { label: 'Engine', value: brainData?.engine?.split('+')[0]?.trim() || '—' },
            ].map((item, i) => (
              <div key={item.label} className="flex items-center justify-between py-1">
                <span className="text-[11px] text-neutral-500">{item.label}</span>
                <span className="text-[11px] text-neutral-300 font-mono">{item.value}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* SEMANTIC CACHE — real data */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
        className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-5"
      >
        <h3 className="text-sm font-semibold text-neutral-300 flex items-center gap-2 mb-4">
          <Lock className="w-4 h-4 text-emerald-400" />
          Semantic Cache
        </h3>
        <div className="grid grid-cols-3 gap-4 mb-4">
          {[
            { label: 'Hit Rate', value: `${cacheHitRate.toFixed(1)}%`, color: 'text-emerald-400' },
            { label: 'Entries', value: String(cacheEntries), color: 'text-cyan-400' },
            { label: 'Avg TTL', value: cacheTtl > 0 ? `${cacheTtl.toFixed(1)}min` : '—', color: 'text-violet-400' },
          ].map((s) => (
            <div key={s.label} className="bg-white/[0.02] rounded-lg p-3">
              <div className="text-[10px] text-neutral-500 mb-0.5">{s.label}</div>
              <div className={`text-base font-bold font-mono ${s.color}`}>{s.value}</div>
            </div>
          ))}
        </div>
        {cacheEntries > 0 && (
          <div className="flex items-center gap-3">
            <span className="text-[10px] text-neutral-500 w-12 shrink-0">Capacidade</span>
            <div className="flex-1 h-2 bg-white/[0.04] rounded-full overflow-hidden">
              <motion.div className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-400"
                animate={{ width: `${Math.min(100, (cacheEntries / 1000) * 100)}%` }}
                transition={{ duration: 1.5, ease: 'easeInOut' as const }}
              />
            </div>
            <span className="text-[10px] font-mono text-neutral-500 w-10 text-right">{Math.min(100, Math.round((cacheEntries / 1000) * 100))}%</span>
          </div>
        )}
      </motion.div>

      {/* Inline style for custom scrollbar */}
      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.08); border-radius: 999px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.15); }
      `}</style>
    </div>
  );
}