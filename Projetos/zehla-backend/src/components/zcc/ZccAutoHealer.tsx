'use client';

import {
  Activity,
  AlertTriangle,
  CheckCircle,
  Clock,
  Cpu,
  Database,
  RefreshCw,
  Server,
  Shield,
  XCircle,
  Zap,
} from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

import { Badge } from '@/components/ui/badge';

// ─── Types ───────────────────────────────────────────

interface SystemHealth {
  status: 'healthy' | 'degraded' | 'error';
  timestamp: string;
  uptime: number;
  responseTime: number;
  redis: { session: string; worker: string; ai: string };
  database: string;
  queues: Record<string, { waiting: number; active: number; failed: number }>;
  errorRate5m: number;
  securityAlerts24h: number;
}

interface HealAction {
  id: string;
  level: string;
  component: string;
  message: string;
  metadata: Record<string, unknown> | null;
  createdAt: string;
}

interface HealResponse {
  actions: HealAction[];
  availableActions: { id: string; label: string; description: string }[];
}

interface ErrorBucket {
  hour: string;
  errors: number;
}

// ─── Helpers ─────────────────────────────────────────

function statusColor(s: string) {
  if (s === 'OK' || s === 'healthy') return 'text-emerald-400';
  if (s === 'degraded') return 'text-amber-400';
  return 'text-rose-400';
}

function statusIcon(s: string) {
  if (s === 'OK' || s === 'healthy') return <CheckCircle className="w-4 h-4 text-emerald-400" />;
  if (s === 'degraded') return <AlertTriangle className="w-4 h-4 text-amber-400" />;
  return <XCircle className="w-4 h-4 text-rose-400" />;
}

function queueWarnings(q: { waiting: number; active: number; failed: number }) {
  const w = q.waiting > 100 ? 'text-rose-400' : q.waiting > 30 ? 'text-amber-400' : 'text-emerald-400';
  const f = q.failed > 10 ? 'text-rose-400' : q.failed > 0 ? 'text-amber-400' : 'text-emerald-400';
  return { waitingColor: w, failedColor: f };
}

function fmtUptime(s: number) {
  const d = Math.floor(s / 86400);
  const h = Math.floor((s % 86400) / 3600);
  const m = Math.floor((s % 3600) / 60);
  return `${d}d ${h}h ${m}m`;
}

// ─── Component ───────────────────────────────────────

export default function ZccAutoHealer() {
  const [health, setHealth] = useState<SystemHealth | null>(null);
  const [healData, setHealData] = useState<HealResponse | null>(null);
  const [errorHistory, setErrorHistory] = useState<ErrorBucket[]>([]);
  const [loading, setLoading] = useState(true);
  const [executing, setExecuting] = useState<string | null>(null);
  const [execResult, setExecResult] = useState<string | null>(null);

  const fetchAll = useCallback(async () => {
    try {
  const [hRes, healRes, errRes] = await Promise.all([
        fetch('/api/system/health'),
        fetch('/api/system/heal'),
        fetch('/api/telemetry/events'),
      ]);

      if (hRes.ok) setHealth(await hRes.json());
      if (healRes.ok) setHealData(await healRes.json());

      if (errRes.ok) {
        const events: { type: string; serverTimestamp: string }[] = await errRes.json();
        const buckets: Record<string, number> = {};
        for (const e of events) {
          if (e.type === 'ERROR' || e.type === 'error') {
            const h = e.serverTimestamp?.slice(0, 13) || 'unknown';
            buckets[h] = (buckets[h] || 0) + 1;
          }
        }
        const sorted = Object.entries(buckets).sort(([a], [b]) => a.localeCompare(b));
        setErrorHistory(sorted.slice(-24).map(([hour, errors]) => ({ hour: hour.slice(11), errors })));
      }
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAll();
    const interval = setInterval(fetchAll, 30000);
    return () => clearInterval(interval);
  }, [fetchAll]);

  const triggerHeal = async (actionId: string) => {
    try {
    setExecuting(actionId);
    setExecResult(null);
  const res = await fetch('/api/system/heal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: actionId }),
      });
      const data = await res.json();
      setExecResult(data.result || data.error || 'Concluído');
      fetchAll();
    } catch {
      setExecResult('Falha ao executar ação');
    } finally {
      setExecuting(null);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="glass-card p-6">
          <div className="flex items-center gap-3">
            <RefreshCw className="w-5 h-5 text-[#F97316] animate-spin" />
            <span className="text-sm text-[#4d4d4d]">Inicializando Auto-Healer...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Zap className="w-5 h-5 text-[#F97316]" />
          <h2 className="text-sm font-semibold text-[#efefef]">Auto-Healer & Telemetria</h2>
          {health && (
            <Badge variant="outline" className={`border-0 text-[10px] ${statusColor(health.status)} bg-current/5`}>
              {health.status === 'healthy' ? 'Saudável' : health.status === 'degraded' ? 'Degradado' : 'Crítico'}
            </Badge>
          )}
        </div>
        <button
          onClick={fetchAll}
          className="flex items-center gap-1.5 text-[10px] text-[#898989] hover:text-[#efefef] px-2.5 py-1.5 rounded-lg hover:bg-[#242424] transition-colors"
        >
          <RefreshCw className="w-3 h-3" />
          Atualizar
        </button>
      </div>

      {execResult && (
        <div className="glass-card p-3 border border-emerald-500/20 bg-emerald-500/5">
          <p className="text-xs text-emerald-300 font-mono">{execResult}</p>
        </div>
      )}

      {/* Row 1: System Status Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="glass-card p-4">
          <div className="flex items-center gap-2 mb-3">
            <Server className="w-4 h-4 text-[#F97316]" />
            <span className="text-[10px] text-[#4d4d4d] uppercase tracking-wider">Redis</span>
          </div>
          <div className="space-y-2">
            {(['session', 'worker', 'ai'] as const).map((db) => (
              <div key={db} className="flex items-center justify-between">
                <span className="text-[11px] text-[#898989] font-mono">{db}</span>
                <div className="flex items-center gap-1.5">
                  {statusIcon(health?.redis[db] || 'ERROR')}
                  <span className={`text-[11px] font-mono ${statusColor(health?.redis[db] || 'ERROR')}`}>
                    {health?.redis[db] || 'ERROR'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="glass-card p-4">
          <div className="flex items-center gap-2 mb-3">
            <Database className="w-4 h-4 text-[#F97316]" />
            <span className="text-[10px] text-[#4d4d4d] uppercase tracking-wider">Database</span>
          </div>
          <div className="flex items-center gap-2">
            {statusIcon(health?.database || 'ERROR')}
            <span className={`text-sm font-mono font-bold ${statusColor(health?.database || 'ERROR')}`}>
              {health?.database || 'ERROR'}
            </span>
          </div>
          <div className="mt-3 text-[10px] text-[#4d4d4d]">
            Response: {health?.responseTime || '-'}ms
          </div>
        </div>

        <div className="glass-card p-4">
          <div className="flex items-center gap-2 mb-3">
            <Activity className="w-4 h-4 text-[#F97316]" />
            <span className="text-[10px] text-[#4d4d4d] uppercase tracking-wider">Erros (5min)</span>
          </div>
          <div className={`text-2xl font-mono font-bold ${(health?.errorRate5m || 0) > 10 ? 'text-rose-400' : 'text-emerald-400'}`}>
            {health?.errorRate5m ?? '-'}
          </div>
          <div className="text-[10px] text-[#4d4d4d]">ocorrências</div>
        </div>

        <div className="glass-card p-4">
          <div className="flex items-center gap-2 mb-3">
            <Shield className="w-4 h-4 text-[#F97316]" />
            <span className="text-[10px] text-[#4d4d4d] uppercase tracking-wider">Segurança</span>
          </div>
          <div className={`text-2xl font-mono font-bold ${(health?.securityAlerts24h || 0) > 5 ? 'text-rose-400' : 'text-emerald-400'}`}>
            {health?.securityAlerts24h ?? '-'}
          </div>
          <div className="text-[10px] text-[#4d4d4d]">alertas / 24h</div>
        </div>
      </div>

      {/* Row 2: Uptime + Queue Depths */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="glass-card p-4">
          <div className="flex items-center gap-2 mb-3">
            <Clock className="w-4 h-4 text-[#F97316]" />
            <span className="text-[10px] text-[#4d4d4d] uppercase tracking-wider">Uptime</span>
          </div>
          <div className="text-xl font-mono font-bold text-[#efefef]">
            {health ? fmtUptime(health.uptime) : '-'}
          </div>
        </div>

        <div className="glass-card p-4 md:col-span-2">
          <div className="flex items-center gap-2 mb-3">
            <Cpu className="w-4 h-4 text-[#F97316]" />
            <span className="text-[10px] text-[#4d4d4d] uppercase tracking-wider">Filas BullMQ</span>
          </div>
          <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
            {health?.queues && Object.entries(health.queues).map(([name, q]) => {
              const w = queueWarnings(q);
              return (
                <div key={name} className="bg-white/[0.02] rounded-lg p-2 text-center">
                  <div className="text-[9px] text-[#4d4d4d] font-mono truncate">{name}</div>
                  <div className={`text-xs font-mono ${w.waitingColor}`}>{q.waiting}</div>
                  <div className="text-[9px] text-[#363636]">espera</div>
                  <div className={`text-[9px] font-mono ${w.failedColor}`}>{q.failed}</div>
                  <div className="text-[8px] text-[#363636]">falhas</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Row 3: Error Bar Chart + Healing Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="glass-card p-4">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className="w-4 h-4 text-rose-400" />
            <span className="text-[10px] text-[#4d4d4d] uppercase tracking-wider">Erros (últimas horas)</span>
          </div>
          {errorHistory.length > 0 ? (
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={errorHistory}>
                  <XAxis dataKey="hour" tick={{ fontSize: 10, fill: '#4d4d4d' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: '#4d4d4d' }} axisLine={false} tickLine={false} allowDecimals={false} />
                  <Tooltip
                    contentStyle={{
                      background: '#1a1a1a',
                      border: '1px solid #2e2e2e',
                      borderRadius: '8px',
                      fontSize: '12px',
                    }}
                    labelStyle={{ color: '#b4b4b4' }}
                  />
                  <Bar dataKey="errors" fill="#F97316" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-48 flex items-center justify-center text-xs text-[#4d4d4d]">
              Nenhum erro registrado nas últimas horas
            </div>
          )}
        </div>

        <div className="glass-card p-4">
          <div className="flex items-center gap-2 mb-3">
            <Zap className="w-4 h-4 text-amber-400" />
            <span className="text-[10px] text-[#4d4d4d] uppercase tracking-wider">Ações de Auto-Healing</span>
          </div>

          <div className="flex flex-wrap gap-2 mb-4">
            {healData?.availableActions.map((a) => (
              <button
                key={a.id}
                onClick={() => triggerHeal(a.id)}
                disabled={executing === a.id}
                className="flex items-center gap-1.5 text-[10px] bg-[#242424] hover:bg-[#2e2e2e] text-[#b4b4b4] px-2.5 py-1.5 rounded-lg transition-colors disabled:opacity-50"
              >
                {executing === a.id ? <RefreshCw className="w-3 h-3 animate-spin" /> : <Zap className="w-3 h-3" />}
                {a.label}
              </button>
            ))}
          </div>

          <div className="space-y-1.5 max-h-64 overflow-y-auto zehla-scroll-y">
            {healData?.actions.length === 0 && (
              <p className="text-xs text-[#4d4d4d] py-4 text-center">Nenhuma ação registrada</p>
            )}
            {healData?.actions.map((a) => (
              <div key={a.id} className="flex items-start gap-2 p-2 rounded-lg bg-white/[0.02]">
                <div className="mt-0.5">
                  {a.level === 'success' ? (
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                  ) : a.level === 'warn' ? (
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                  ) : (
                    <Activity className="w-3.5 h-3.5 text-[#F97316]" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono text-[#4d4d4d]">
                      {new Date(a.createdAt).toLocaleTimeString('pt-BR')}
                    </span>
                    <span className="text-[10px] font-medium text-[#898989]">{a.component}</span>
                  </div>
                  <p className="text-[11px] text-[#b4b4b4] truncate">{a.message}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
