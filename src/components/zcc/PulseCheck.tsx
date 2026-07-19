'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Activity, Shield, RefreshCw, AlertTriangle, CheckCircle2,
  XCircle, Clock, Container, Radio, Wifi, WifiOff,
  Terminal, Zap, Copy, Check, ChevronDown, ChevronUp,
  Bug, Brain, Cpu, HardDrive, Server,
} from 'lucide-react';

// ── Types ──────────────────────────────────────────────────────────────────────

interface PulseAlert {
  id: string;
  timestamp: string;
  container: string;
  severity: 'ALTA' | 'MÉDIA' | 'BAIXA';
  title: string;
  stackTrace: string;
  arquivo_linha: string;
  impacto_usuario: string;
  causa_raiz: string;
  codigo_solucao: string;
  aiAnalyzed: boolean;
  resolved: boolean;
}

interface VPSMetrics {
  cpuUsage: number;
  cpuCores: number;
  ramUsed: number;
  ramTotal: number;
  diskUsed: number;
  diskTotal: number;
  loadAvg: [number, number, number];
  networkIn: number;
  networkOut: number;
}

interface ContainerStatus {
  name: string;
  service: string;
  status: 'running' | 'stopped' | 'restarting';
  uptime: string;
  cpu: number;
  memory: number;
  port: number;
  image: string;
}

interface RateLimiterZone {
  zone: string;
  activeIPs: number;
  blockedIPs: number;
  requestsPerSec: number;
}

interface CommandResult {
  success: boolean;
  message: string;
  target: string;
  type: string;
  timestamp: string;
}

type CommandType = 'clear_cache' | 'restart_agent' | 'pause_tenant' | 'force_container_restart';

// ── Constants ──────────────────────────────────────────────────────────────────

const SOCKET_PORT = 3004;

const mockRateLimiterZones: RateLimiterZone[] = [
  { zone: 'api-general', activeIPs: 247, blockedIPs: 3, requestsPerSec: 142 },
  { zone: 'whatsapp-webhook', activeIPs: 18, blockedIPs: 0, requestsPerSec: 34 },
  { zone: 'auth-login', activeIPs: 12, blockedIPs: 1, requestsPerSec: 8 },
  { zone: 'brain-api', activeIPs: 15, blockedIPs: 0, requestsPerSec: 56 },
];

const defaultContainers: ContainerStatus[] = [
  { name: 'zella-app', service: 'Next.js App', status: 'running', uptime: '14d 6h', cpu: 12, memory: 340, port: 3000, image: 'zella:latest' },
  { name: 'zella-postgres', service: 'PostgreSQL', status: 'running', uptime: '14d 6h', cpu: 4, memory: 512, port: 5432, image: 'postgres:16' },
  { name: 'zella-redis', service: 'Redis Cache', status: 'running', uptime: '14d 6h', cpu: 1, memory: 128, port: 6379, image: 'redis:7-alpine' },
  { name: 'zella-evolution', service: 'Evolution API', status: 'running', uptime: '3d 12h', cpu: 8, memory: 456, port: 8080, image: 'atticus/evolution-api:latest' },
  { name: 'zella-nginx', service: 'Nginx Proxy', status: 'running', uptime: '14d 6h', cpu: 1, memory: 64, port: 80, image: 'nginx:alpine' },
  { name: 'zella-bullmq', service: 'BullMQ Worker', status: 'running', uptime: '14d 6h', cpu: 3, memory: 96, port: 0, image: 'zella-worker:latest' },
];

// ── Circular Gauge ─────────────────────────────────────────────────────────────

function CircularGauge({ value, max, size = 72, strokeWidth = 5, color }: {
  value: number; max: number; size?: number; strokeWidth?: number; color: string;
}) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const percent = Math.min(100, (value / max) * 100);
  const offset = circumference - (percent / 100) * circumference;

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="transform -rotate-90">
        <circle cx={size/2} cy={size/2} r={radius} fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth={strokeWidth} />
        <motion.circle
          cx={size/2} cy={size/2} r={radius} fill="none"
          stroke={color} strokeWidth={strokeWidth} strokeLinecap="round"
          strokeDasharray={circumference} strokeDashoffset={offset}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.2, ease: 'easeOut' }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-sm font-bold font-mono" style={{ color }}>{Math.round(percent)}%</span>
      </div>
    </div>
  );
}

// ── Severity Badge ─────────────────────────────────────────────────────────────

function SeverityBadge({ severity }: { severity: 'ALTA' | 'MÉDIA' | 'BAIXA' }) {
  const config = {
    ALTA: { bg: 'rgba(239,68,68,0.12)', border: 'rgba(239,68,68,0.35)', text: '#ef4444', glow: '0 0 12px rgba(239,68,68,0.25)' },
    MÉDIA: { bg: 'rgba(245,158,11,0.12)', border: 'rgba(245,158,11,0.35)', text: '#f59e0b', glow: 'none' },
    BAIXA: { bg: 'rgba(16,185,129,0.10)', border: 'rgba(16,185,129,0.25)', text: '#10b981', glow: 'none' },
  };
  const c = config[severity];
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[9px] font-mono font-bold"
      style={{ background: c.bg, border: `1px solid ${c.border}`, color: c.text, boxShadow: c.glow }}>
      {severity === 'ALTA' && <AlertTriangle className="w-2.5 h-2.5" />}
      {severity === 'MÉDIA' && <Zap className="w-2.5 h-2.5" />}
      {severity === 'BAIXA' && <CheckCircle2 className="w-2.5 h-2.5" />}
      {severity}
    </span>
  );
}

// ── Alert Card ─────────────────────────────────────────────────────────────────

function AlertCard({ alert, onResolve, onCommand }: {
  alert: PulseAlert;
  onResolve: (id: string) => void;
  onCommand: (type: CommandType, target: string) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const [copiedSolution, setCopiedSolution] = useState(false);
  const [executing, setExecuting] = useState(false);

  const handleCopySolution = () => {
    navigator.clipboard.writeText(alert.codigo_solucao);
    setCopiedSolution(true);
    setTimeout(() => setCopiedSolution(false), 2000);
  };

  const handleApplySolution = () => {
    setExecuting(true);
    // Determine command type based on container
    const cmdType: CommandType = alert.container === 'zella-redis' ? 'clear_cache'
      : alert.container === 'zella-evolution' ? 'restart_agent'
      : 'restart_agent';
    onCommand(cmdType, alert.container);
    setTimeout(() => setExecuting(false), 3000);
  };

  const isHigh = alert.severity === 'ALTA';

  return (
    <motion.div
      initial={{ opacity: 0, x: -20, scale: 0.97 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 20, scale: 0.95 }}
      className="zcc-panel overflow-hidden"
      style={{
        borderColor: isHigh ? 'rgba(239,68,68,0.4)' : 'var(--zcc-hairline)',
        borderWidth: 1,
        boxShadow: isHigh ? '0 0 30px rgba(239,68,68,0.12), inset 0 0 30px rgba(239,68,68,0.03)' : 'none',
      }}
    >
      {/* Header */}
      <div className="p-4 flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
            <SeverityBadge severity={alert.severity} />
            <span className="text-[9px] font-mono" style={{ color: 'var(--zcc-text-muted)' }}>
              {alert.container}
            </span>
            <span className="text-[9px] font-mono" style={{ color: 'var(--zcc-text-muted)' }}>
              {new Date(alert.timestamp).toLocaleTimeString('pt-BR')}
            </span>
            {alert.aiAnalyzed && (
              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[8px] font-mono"
                style={{ background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.2)', color: '#818cf8' }}>
                <Brain className="w-2 h-2" /> IA
              </span>
            )}
          </div>
          <h4 className="text-xs font-semibold leading-tight" style={{ color: alert.resolved ? 'var(--zcc-text-muted)' : 'var(--zcc-champagne)' }}>
            {alert.title}
          </h4>
          <div className="text-[10px] font-mono mt-1" style={{ color: 'var(--zcc-text-secondary)' }}>
            📍 {alert.arquivo_linha}
          </div>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          {alert.resolved ? (
            <span className="text-[9px] font-mono font-bold text-emerald-400 flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" /> RESOLVIDO
            </span>
          ) : (
            <button onClick={() => setExpanded(!expanded)}
              className="p-1.5 rounded transition-colors hover:bg-white/[0.04] cursor-pointer"
              style={{ color: 'var(--zcc-text-muted)' }}>
              {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
          )}
        </div>
      </div>

      {/* Expanded Content */}
      <AnimatePresence>
        {expanded && !alert.resolved && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 space-y-3 border-t" style={{ borderColor: 'var(--zcc-hairline)' }}>

              {/* Impact on User */}
              <div className="mt-3">
                <div className="zcc-eyebrow">IMPACTO NO USUÁRIO</div>
                <div className="text-[10px] font-mono mt-1" style={{ color: '#f87171' }}>
                  👤 {alert.impacto_usuario}
                </div>
              </div>

              {/* Root Cause */}
              <div>
                <div className="zcc-eyebrow">CAUSA RAIZ</div>
                <div className="text-[10px] font-mono mt-1" style={{ color: 'var(--zcc-patina)' }}>
                  🔍 {alert.causa_raiz}
                </div>
              </div>

              {/* Stack Trace */}
              <div>
                <div className="zcc-eyebrow">STACK TRACE</div>
                <pre className="mt-1 p-3 rounded text-[9px] font-mono leading-relaxed overflow-x-auto max-h-32"
                  style={{ background: 'rgba(0,0,0,0.3)', color: 'var(--zcc-text-secondary)', border: '1px solid var(--zcc-hairline)' }}>
                  {alert.stackTrace}
                </pre>
              </div>

              {/* AI Solution */}
              <div>
                <div className="zcc-eyebrow flex items-center gap-1.5">
                  <Brain className="w-2.5 h-2.5" style={{ color: '#818cf8' }} />
                  SOLUÇÃO PROPOSTA PELA IA
                </div>
                <pre className="mt-1 p-3 rounded text-[9px] font-mono leading-relaxed overflow-x-auto max-h-40"
                  style={{ background: 'rgba(99,102,241,0.04)', color: '#a5b4fc', border: '1px solid rgba(99,102,241,0.12)' }}>
                  {alert.codigo_solucao}
                </pre>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 pt-2">
                <button onClick={handleCopySolution}
                  className="flex items-center gap-1.5 px-3 py-2 rounded text-[10px] font-mono font-medium transition-all cursor-pointer hover:opacity-90"
                  style={{ background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.25)', color: '#818cf8' }}>
                  {copiedSolution ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                  {copiedSolution ? 'COPIADO!' : 'COPIAR SOLUÇÃO'}
                </button>

                <button onClick={handleApplySolution} disabled={executing}
                  className="flex items-center gap-1.5 px-3 py-2 rounded text-[10px] font-mono font-bold transition-all cursor-pointer disabled:opacity-50"
                  style={{ background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.35)', color: '#10b981' }}>
                  {executing ? <RefreshCw className="w-3 h-3 animate-spin" /> : <Zap className="w-3 h-3" />}
                  {executing ? 'EXECUTANDO...' : 'APLICAR SOLUÇÃO'}
                </button>

                <button onClick={() => onResolve(alert.id)}
                  className="ml-auto flex items-center gap-1.5 px-3 py-2 rounded text-[10px] font-mono transition-all cursor-pointer hover:opacity-90"
                  style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--zcc-hairline)', color: 'var(--zcc-text-muted)' }}>
                  <CheckCircle2 className="w-3 h-3" /> RESOLVER
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ── Command Panel ──────────────────────────────────────────────────────────────

function CommandPanel({ onCommand, lastResult }: {
  onCommand: (type: CommandType, target: string, confirmToken?: string) => void;
  lastResult: CommandResult | null;
}) {
  const [target, setTarget] = useState('zella-redis');
  const [cmdType, setCmdType] = useState<CommandType>('clear_cache');
  const [nuclearToken, setNuclearToken] = useState('');
  const [showNuclear, setShowNuclear] = useState(false);

  const commands: { type: CommandType; label: string; desc: string; icon: React.ElementType; color: string; danger?: boolean }[] = [
    { type: 'clear_cache', label: 'Limpar Cache', desc: 'Redis FLUSHDB pattern', icon: RefreshCw, color: '#10b981' },
    { type: 'restart_agent', label: 'Reiniciar Agente', desc: 'Restart AI agent thread', icon: Bug, color: '#818cf8' },
    { type: 'pause_tenant', label: 'Kill Switch', desc: 'Pausar tenant problemático', icon: Shield, color: '#f59e0b' },
    { type: 'force_container_restart', label: '🚨 Nuclear Restart', desc: 'Docker restart — REQUER TOKEN', icon: Terminal, color: '#ef4444', danger: true },
  ];

  return (
    <div className="zcc-panel p-5">
      <div className="flex items-center gap-2 mb-4">
        <Terminal className="w-4 h-4" style={{ color: 'var(--zcc-kinpaku)' }} />
        <h3 className="text-sm font-semibold" style={{ color: 'var(--zcc-champagne)' }}>Terminal de Comando Ativo</h3>
        <span className="text-[9px] font-mono px-1.5 py-0.5 rounded" style={{ background: 'rgba(16,185,129,0.08)', color: '#10b981', border: '1px solid rgba(16,185,129,0.15)' }}>
          BIDIRECIONAL
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Command Selection */}
        <div className="space-y-3">
          <div>
            <div className="zcc-eyebrow mb-2">TIPO DE COMANDO</div>
            <div className="grid grid-cols-2 gap-2">
              {commands.map(cmd => {
                const Icon = cmd.icon;
                return (
                  <button key={cmd.type} onClick={() => { setCmdType(cmd.type); setShowNuclear(cmd.danger || false); }}
                    className={`p-2.5 rounded text-left transition-all cursor-pointer ${
                      cmdType === cmd.type ? 'ring-1' : 'hover:bg-white/[0.02]'
                    }`}
                    style={{
                      background: cmdType === cmd.type ? `${cmd.color}10` : 'var(--zcc-lacquer-sunken)',
                      border: `1px solid ${cmdType === cmd.type ? `${cmd.color}40` : 'var(--zcc-hairline)'}`,
                    }}>
                    <div className="flex items-center gap-1.5 mb-1">
                      <Icon className="w-3 h-3" style={{ color: cmd.color }} />
                      <span className="text-[10px] font-mono font-bold" style={{ color: cmd.color }}>{cmd.label}</span>
                    </div>
                    <div className="text-[8px] font-mono" style={{ color: 'var(--zcc-text-muted)' }}>{cmd.desc}</div>
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <div className="zcc-eyebrow mb-1.5">TARGET</div>
            <select value={target} onChange={e => setTarget(e.target.value)}
              className="w-full p-2 rounded text-[10px] font-mono cursor-pointer"
              style={{ background: 'var(--zcc-lacquer-sunken)', border: '1px solid var(--zcc-hairline)', color: 'var(--zcc-champagne)' }}>
              <option value="zella-app">zella-app (Next.js)</option>
              <option value="zella-postgres">zella-postgres (PostgreSQL)</option>
              <option value="zella-redis">zella-redis (Redis)</option>
              <option value="zella-evolution">zella-evolution (Evolution API)</option>
              <option value="zella-nginx">zella-nginx (Nginx)</option>
              <option value="zella-bullmq">zella-bullmq (BullMQ Worker)</option>
            </select>
          </div>

          {showNuclear && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}>
              <div className="p-3 rounded" style={{ background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.2)' }}>
                <div className="flex items-center gap-1.5 mb-2">
                  <AlertTriangle className="w-3 h-3 text-red-400" />
                  <span className="text-[9px] font-mono font-bold text-red-400">OPERAÇÃO NUCLEAR — CONFIRMAÇÃO OBRIGATÓRIA</span>
                </div>
                <input type="password" value={nuclearToken} onChange={e => setNuclearToken(e.target.value)}
                  placeholder="Token de confirmação nuclear"
                  className="w-full p-2 rounded text-[10px] font-mono"
                  style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(239,68,68,0.25)', color: 'var(--zcc-champagne)' }} />
              </div>
            </motion.div>
          )}

          <button onClick={() => onCommand(cmdType, target, showNuclear ? nuclearToken : undefined)}
            className="w-full p-2.5 rounded text-[10px] font-mono font-bold transition-all cursor-pointer active:scale-[0.98]"
            style={{
              background: cmdType === 'force_container_restart' ? 'rgba(239,68,68,0.15)' : 'rgba(212,168,67,0.1)',
              border: `1px solid ${cmdType === 'force_container_restart' ? 'rgba(239,68,68,0.35)' : 'rgba(212,168,67,0.25)'}`,
              color: cmdType === 'force_container_restart' ? '#ef4444' : 'var(--zcc-kinpaku)',
            }}>
            EXECUTAR: {commands.find(c => c.type === cmdType)?.label.toUpperCase()} → {target}
          </button>
        </div>

        {/* Command Results */}
        <div>
          <div className="zcc-eyebrow mb-2">RESULTADO DO ÚLTIMO COMANDO</div>
          {lastResult ? (
            <div className="p-3 rounded space-y-2" style={{
              background: lastResult.success ? 'rgba(16,185,129,0.04)' : 'rgba(239,68,68,0.04)',
              border: `1px solid ${lastResult.success ? 'rgba(16,185,129,0.2)' : 'rgba(239,68,68,0.2)'}`,
            }}>
              <div className="flex items-center gap-2">
                {lastResult.success ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <XCircle className="w-4 h-4 text-red-400" />}
                <span className="text-[10px] font-mono font-bold" style={{ color: lastResult.success ? '#10b981' : '#ef4444' }}>
                  {lastResult.success ? 'SUCESSO' : 'FALHOU'}
                </span>
              </div>
              <div className="text-[10px] font-mono" style={{ color: 'var(--zcc-text-secondary)' }}>
                {lastResult.message}
              </div>
              <div className="text-[8px] font-mono" style={{ color: 'var(--zcc-text-muted)' }}>
                {lastResult.type} → {lastResult.target} · {new Date(lastResult.timestamp).toLocaleTimeString('pt-BR')}
              </div>
            </div>
          ) : (
            <div className="p-4 rounded text-center" style={{ background: 'var(--zcc-lacquer-sunken)', border: '1px solid var(--zcc-hairline)' }}>
              <Terminal className="w-6 h-6 mx-auto mb-2" style={{ color: 'var(--zcc-text-muted)' }} />
              <div className="text-[10px] font-mono" style={{ color: 'var(--zcc-text-muted)' }}>
                Nenhum comando executado ainda
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────────

export function PulseCheck() {
  const socketRef = useRef<Socket | null>(null);
  const [connected, setConnected] = useState(false);

  const [vps, setVps] = useState<VPSMetrics>({
    cpuUsage: 23, cpuCores: 4, ramUsed: 3.2, ramTotal: 8,
    diskUsed: 42, diskTotal: 100, loadAvg: [0.8, 0.6, 0.5],
    networkIn: 12, networkOut: 8,
  });
  const [containers, setContainers] = useState<ContainerStatus[]>(defaultContainers);
  const [rateZones] = useState(mockRateLimiterZones);
  const [alerts, setAlerts] = useState<PulseAlert[]>([]);
  const [lastResult, setLastResult] = useState<CommandResult | null>(null);
  const [showAlerts, setShowAlerts] = useState(true);

  // ── Socket.io Connection ──
  useEffect(() => {
    const socket = io("/?XTransformPort=" + SOCKET_PORT, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 2000,
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('[PulseCheck] Connected to Pulse Service');
      setConnected(true);
      socket.emit('zcc:subscribe');
    });

    socket.on('disconnect', () => {
      console.log('[PulseCheck] Disconnected from Pulse Service');
      setConnected(false);
    });

    // Real-time metrics
    socket.on('pulse:metrics', (data: { vps: VPSMetrics; containers: ContainerStatus[] }) => {
      if (data.vps) setVps(data.vps);
      if (data.containers) setContainers(data.containers);
    });

    // Real-time alerts
    socket.on('pulse:alert', (alert: PulseAlert) => {
      console.log('[PulseCheck] Alert received:', alert.title);
      setAlerts(prev => [alert, ...prev].slice(0, 50));
    });

    // Command results
    socket.on('command:result', (result: CommandResult) => {
      console.log('[PulseCheck] Command result:', result.message);
      setLastResult(result);
      if (result.success && result.type !== 'force_container_restart') {
        // Auto-resolve related alerts
        setAlerts(prev => prev.map(a =>
          a.container === result.target && !a.resolved
            ? { ...a, resolved: true }
            : a
        ));
      }
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  // ── Fallback: simulated data if Socket.io not connected ──
  useEffect(() => {
    if (connected) return;

    const id = setInterval(() => {
      setVps(prev => ({
        ...prev,
        cpuUsage: Math.max(5, Math.min(95, prev.cpuUsage + (Math.random() - 0.5) * 6)),
        ramUsed: Math.max(2, Math.min(7, prev.ramUsed + (Math.random() - 0.5) * 0.2)),
        networkIn: Math.max(5, prev.networkIn + (Math.random() - 0.5) * 4),
        networkOut: Math.max(3, prev.networkOut + (Math.random() - 0.5) * 3),
      }));
      setContainers(prev => prev.map(c => ({
        ...c,
        cpu: Math.max(0, Math.min(100, c.cpu + Math.round((Math.random() - 0.5) * 4))),
        memory: Math.max(32, c.memory + Math.round((Math.random() - 0.5) * 20)),
      })));
    }, 3000);
    return () => clearInterval(id);
  }, [connected]);

  // ── Command Handler ──
  const executeCommand = useCallback((type: CommandType, target: string, confirmToken?: string) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit('zcc:command', { type, target, confirmToken });
    } else {
      // Fallback: simulate command locally
      setLastResult({
        success: true,
        message: `${type} executado em ${target} (modo offline — sem conexão com Pulse Service)`,
        target,
        type,
        timestamp: new Date().toISOString(),
      });
    }
  }, []);

  const resolveAlert = useCallback((id: string) => {
    setAlerts(prev => prev.map(a => a.id === id ? { ...a, resolved: true } : a));
  }, []);

  // ── Computed Values ──
  const cpuColor = vps.cpuUsage > 80 ? '#ef4444' : vps.cpuUsage > 60 ? '#f59e0b' : '#10b981';
  const ramPercent = (vps.ramUsed / vps.ramTotal) * 100;
  const ramColor = ramPercent > 85 ? '#ef4444' : ramPercent > 70 ? '#f59e0b' : '#10b981';
  const diskPercent = (vps.diskUsed / vps.diskTotal) * 100;
  const diskColor = diskPercent > 80 ? '#ef4444' : diskPercent > 60 ? '#f59e0b' : '#14b8a6';
  const allRunning = containers.every(c => c.status === 'running');
  const evolutionUp = containers.find(c => c.name === 'zella-evolution')?.status === 'running';
  const activeAlerts = alerts.filter(a => !a.resolved);
  const altaCount = activeAlerts.filter(a => a.severity === 'ALTA').length;

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <motion.div animate={{ scale: [1, 1.05, 1] }} transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}>
            <Activity className="w-5 h-5" style={{ color: allRunning ? '#10b981' : '#f59e0b' }} />
          </motion.div>
          <div>
            <h2 className="text-lg font-bold" style={{ color: 'var(--zcc-champagne)' }}>Pulse Check — Telemetria & Infraestrutura</h2>
            <p className="text-[10px] font-mono" style={{ color: 'var(--zcc-text-muted)' }}>
              Hostinger VPS · Docker Compose · Nginx Rate Limiter · Socket.io Real-Time
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {/* Connection Status */}
          <div className="flex items-center gap-1.5 px-2 py-1 rounded" style={{
            background: connected ? 'rgba(16,185,129,0.08)' : 'rgba(239,68,68,0.08)',
            border: `1px solid ${connected ? 'rgba(16,185,129,0.2)' : 'rgba(239,68,68,0.2)'}`,
          }}>
            <div className={`w-1.5 h-1.5 rounded-full ${connected ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`} />
            <span className="text-[9px] font-mono font-bold" style={{ color: connected ? '#10b981' : '#ef4444' }}>
              {connected ? 'LIVE' : 'OFFLINE'}
            </span>
          </div>

          {/* Alert Count */}
          {activeAlerts.length > 0 && (
            <motion.button onClick={() => setShowAlerts(!showAlerts)}
              animate={{ scale: altaCount > 0 ? [1, 1.05, 1] : 1 }}
              transition={{ duration: 1.5, repeat: altaCount > 0 ? Infinity : 0 }}
              className="flex items-center gap-1.5 px-2 py-1 rounded cursor-pointer"
              style={{ background: altaCount > 0 ? 'rgba(239,68,68,0.1)' : 'rgba(245,158,11,0.08)', border: `1px solid ${altaCount > 0 ? 'rgba(239,68,68,0.25)' : 'rgba(245,158,11,0.2)'}` }}>
              <AlertTriangle className="w-3 h-3" style={{ color: altaCount > 0 ? '#ef4444' : '#f59e0b' }} />
              <span className="text-[9px] font-mono font-bold" style={{ color: altaCount > 0 ? '#ef4444' : '#f59e0b' }}>
                {activeAlerts.length} ALERT{activeAlerts.length !== 1 ? 'S' : ''}
              </span>
            </motion.button>
          )}

          {!evolutionUp && (
            <div className="flex items-center gap-1.5 px-2 py-1 rounded" style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)' }}>
              <AlertTriangle className="w-3 h-3 text-red-400" />
              <span className="text-[10px] font-mono text-red-400">EVOLUTION DOWN</span>
            </div>
          )}
        </div>
      </div>

      {/* VPS Gauges */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="zcc-panel p-5 flex items-center gap-5">
          <CircularGauge value={vps.cpuUsage} max={100} color={cpuColor} />
          <div className="flex-1">
            <div className="zcc-eyebrow flex items-center gap-1.5"><Cpu className="w-3 h-3" /> CPU — {vps.cpuCores} Cores</div>
            <div className="text-xl font-bold font-mono" style={{ color: cpuColor }}>{vps.cpuUsage.toFixed(1)}%</div>
            <div className="text-[10px] font-mono mt-1" style={{ color: 'var(--zcc-text-muted)' }}>
              Load: {vps.loadAvg.map(l => l.toFixed(2)).join(' / ')}
            </div>
            <div className="text-[10px] font-mono" style={{ color: 'var(--zcc-text-muted)' }}>
              ↑{vps.networkIn.toFixed(1)} MB/s ↓{vps.networkOut.toFixed(1)} MB/s
            </div>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }} className="zcc-panel p-5 flex items-center gap-5">
          <CircularGauge value={ramPercent} max={100} color={ramColor} />
          <div className="flex-1">
            <div className="zcc-eyebrow flex items-center gap-1.5"><HardDrive className="w-3 h-3" /> RAM — DDR4</div>
            <div className="text-xl font-bold font-mono" style={{ color: ramColor }}>{vps.ramUsed.toFixed(1)} / {vps.ramTotal} GB</div>
            <div className="text-[10px] font-mono mt-1" style={{ color: 'var(--zcc-text-muted)' }}>
              {ramPercent.toFixed(1)}% utilizado
            </div>
            <div className="zcc-progress-track mt-2">
              <div className="zcc-progress-fill" style={{ width: `${ramPercent}%`, background: ramColor }} />
            </div>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.16 }} className="zcc-panel p-5 flex items-center gap-5">
          <CircularGauge value={diskPercent} max={100} color={diskColor} />
          <div className="flex-1">
            <div className="zcc-eyebrow flex items-center gap-1.5"><Server className="w-3 h-3" /> DISCO — SSD NVMe</div>
            <div className="text-xl font-bold font-mono" style={{ color: diskColor }}>{vps.diskUsed} / {vps.diskTotal} GB</div>
            <div className="text-[10px] font-mono mt-1" style={{ color: 'var(--zcc-text-muted)' }}>
              {diskPercent.toFixed(0)}% utilizado
            </div>
            <div className="zcc-progress-track mt-2">
              <div className="zcc-progress-fill" style={{ width: `${diskPercent}%`, background: diskColor }} />
            </div>
          </div>
        </motion.div>
      </div>

      {/* Container Matrix */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
        className="zcc-panel p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Container className="w-4 h-4" style={{ color: 'var(--zcc-kinpaku)' }} />
            <h3 className="text-sm font-semibold" style={{ color: 'var(--zcc-champagne)' }}>Docker Containers — Status Matrix</h3>
          </div>
          <span className="zcc-badge-success">
            {containers.filter(c => c.status === 'running').length}/{containers.length} RUNNING
          </span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {containers.map((container, i) => {
            const isRunning = container.status === 'running';
            return (
              <motion.div key={container.name} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.05 * i }}
                className="zcc-panel p-3 text-center relative">
                <div className="flex justify-center mb-2">
                  <div className={`w-3 h-3 rounded-full ${isRunning ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`} />
                </div>
                <div className="text-[10px] font-mono font-bold truncate" style={{ color: isRunning ? 'var(--zcc-champagne)' : '#ef4444' }}>
                  {container.name.replace('zella-', '')}
                </div>
                <div className="text-[9px] font-mono mt-0.5" style={{ color: 'var(--zcc-text-muted)' }}>
                  {container.service}
                </div>
                <div className="flex justify-center gap-2 mt-2 text-[9px] font-mono" style={{ color: 'var(--zcc-text-secondary)' }}>
                  <span>CPU {container.cpu}%</span>
                  <span>MEM {container.memory}MB</span>
                </div>
                {container.port > 0 && (
                  <div className="text-[8px] font-mono mt-1" style={{ color: 'var(--zcc-text-muted)' }}>:{container.port}</div>
                )}
                <div className="text-[8px] font-mono mt-1" style={{ color: 'var(--zcc-text-muted)' }}>
                  <Clock className="w-2.5 h-2.5 inline mr-0.5" />{container.uptime}
                </div>
              </motion.div>
            );
          })}
        </div>
      </motion.div>

      {/* Nginx Rate Limiter */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
        className="zcc-panel p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4" style={{ color: 'var(--zcc-patina)' }} />
            <h3 className="text-sm font-semibold" style={{ color: 'var(--zcc-champagne)' }}>Nginx Rate Limiter — Zonas Ativas</h3>
          </div>
          <div className="flex items-center gap-1.5">
            <Radio className="w-3 h-3" style={{ color: 'var(--zcc-patina)' }} />
            <span className="text-[10px] font-mono" style={{ color: 'var(--zcc-patina)' }}>
              {rateZones.reduce((s, z) => s + z.requestsPerSec, 0)} req/s total
            </span>
          </div>
        </div>
        <div className="space-y-2">
          {rateZones.map((zone, i) => (
            <motion.div key={zone.zone} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.05 * i }}
              className="flex items-center gap-4 p-3 rounded" style={{ background: 'var(--zcc-lacquer-sunken)', border: '1px solid rgba(212,168,67,0.06)' }}>
              <div className="w-36 shrink-0">
                <div className="text-[10px] font-mono font-bold" style={{ color: 'var(--zcc-champagne)' }}>{zone.zone}</div>
              </div>
              <div className="flex-1">
                <div className="zcc-progress-track">
                  <motion.div className="zcc-progress-fill" style={{ background: 'var(--zcc-patina)' }}
                    animate={{ width: `${Math.min(100, (zone.requestsPerSec / 200) * 100)}%` }}
                    transition={{ duration: 0.8 }} />
                </div>
              </div>
              <div className="flex items-center gap-4 text-[10px] font-mono shrink-0">
                <span style={{ color: 'var(--zcc-text-secondary)' }}>{zone.requestsPerSec} req/s</span>
                <span style={{ color: 'var(--zcc-patina)' }}>{zone.activeIPs} IPs</span>
                <span className={zone.blockedIPs > 0 ? 'text-red-400' : ''} style={zone.blockedIPs === 0 ? { color: 'var(--zcc-text-muted)' } : {}}>
                  {zone.blockedIPs} blocked
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* ═══════════════════════════════════════════════════════════════════════ */}
      {/* REAL-TIME ALERTS — AI-Powered Error Diagnostics                           */}
      {/* ═══════════════════════════════════════════════════════════════════════ */}

      <div className="zcc-panel p-5" style={{ borderColor: altaCount > 0 ? 'rgba(239,68,68,0.3)' : 'var(--zcc-hairline)', borderWidth: 1 }}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Bug className="w-4 h-4" style={{ color: altaCount > 0 ? '#ef4444' : 'var(--zcc-kinpaku)' }} />
            <h3 className="text-sm font-semibold" style={{ color: 'var(--zcc-champagne)' }}>
              Interceptador de Erros — Diagnóstico por IA em Tempo Real
            </h3>
          </div>
          <div className="flex items-center gap-3">
            {activeAlerts.length > 0 && (
              <div className="flex items-center gap-2">
                <span className="text-[9px] font-mono" style={{ color: '#ef4444' }}>{altaCount} ALTA</span>
                <span className="text-[9px] font-mono" style={{ color: '#f59e0b' }}>{activeAlerts.filter(a => a.severity === 'MÉDIA').length} MÉDIA</span>
                <span className="text-[9px] font-mono" style={{ color: '#10b981' }}>{activeAlerts.filter(a => a.severity === 'BAIXA').length} BAIXA</span>
              </div>
            )}
            <button onClick={() => setShowAlerts(!showAlerts)}
              className="text-[9px] font-mono cursor-pointer hover:underline" style={{ color: 'var(--zcc-kinpaku)' }}>
              {showAlerts ? 'ocultar' : `mostrar (${alerts.length})`}
            </button>
          </div>
        </div>

        <AnimatePresence>
          {showAlerts && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}>
              <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1" style={{ scrollbarWidth: 'thin' }}>
                <AnimatePresence>
                  {alerts.length === 0 ? (
                    <div className="p-6 text-center">
                      <CheckCircle2 className="w-8 h-8 mx-auto mb-2" style={{ color: '#10b981' }} />
                      <div className="text-xs font-mono" style={{ color: 'var(--zcc-text-muted)' }}>
                        Nenhum erro interceptado — Sistema operando normalmente
                      </div>
                      <div className="text-[9px] font-mono mt-1" style={{ color: 'var(--zcc-text-muted)' }}>
                        Aguardando dados do Pulse Service (Socket.io)...
                      </div>
                    </div>
                  ) : (
                    alerts.map(alert => (
                      <AlertCard key={alert.id} alert={alert} onResolve={resolveAlert} onCommand={executeCommand} />
                    ))
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ═══════════════════════════════════════════════════════════════════════ */}
      {/* COMMAND TERMINAL — Bidirectional Socket.io Interface                      */}
      {/* ═══════════════════════════════════════════════════════════════════════ */}

      <CommandPanel onCommand={executeCommand} lastResult={lastResult} />

      {/* System Info Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Socket.io', value: connected ? 'CONNECTED' : 'OFFLINE', icon: connected ? Wifi : WifiOff, color: connected ? '#10b981' : '#ef4444' },
          { label: 'Containers Up', value: `${containers.filter(c=>c.status==='running').length}/${containers.length}`, icon: Container, color: 'var(--zcc-kinpaku)' },
          { label: 'Evolution API', value: evolutionUp ? 'ONLINE' : 'OFFLINE', icon: evolutionUp ? Wifi : WifiOff, color: evolutionUp ? '#10b981' : '#ef4444' },
          { label: 'Alertas Ativos', value: String(activeAlerts.length), icon: Bug, color: altaCount > 0 ? '#ef4444' : '#10b981' },
        ].map((item, i) => {
          const Icon = item.icon;
          return (
            <motion.div key={item.label} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35 + i * 0.05 }}
              className="zcc-panel p-4 flex items-center gap-3">
              <Icon className="w-4 h-4" style={{ color: item.color }} />
              <div>
                <div className="zcc-eyebrow">{item.label}</div>
                <div className="text-sm font-bold font-mono" style={{ color: item.color }}>{item.value}</div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
