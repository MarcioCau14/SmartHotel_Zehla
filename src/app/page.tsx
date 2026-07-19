'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Activity, AlertTriangle, CheckCircle2, XCircle, Clock, Container,
  Radio, Wifi, WifiOff, Terminal, Zap, Brain, ChevronDown, ChevronUp,
  Trash2, Send, Loader2, Command, RefreshCw, Pause, ServerCrash,
} from 'lucide-react';
import { usePulseSocket, PulseAlert, CommandPayload, ContainerStatus } from '@/lib/use-pulse-socket';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';

// ── Circular Gauge Component ────────────────────────────────────────────────────

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
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth={strokeWidth} />
        <motion.circle
          cx={size / 2} cy={size / 2} r={radius} fill="none"
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

// ── Severity Badge ──────────────────────────────────────────────────────────────

function SeverityBadge({ severity }: { severity: PulseAlert['severity'] }) {
  const config = {
    ALTA: { bg: 'rgba(239,68,68,0.15)', border: 'rgba(239,68,68,0.3)', text: '#ef4444', label: 'ALTA' },
    MÉDIA: { bg: 'rgba(245,158,11,0.15)', border: 'rgba(245,158,11,0.3)', text: '#f59e0b', label: 'MÉDIA' },
    BAIXA: { bg: 'rgba(16,185,129,0.15)', border: 'rgba(16,185,129,0.3)', text: '#10b981', label: 'BAIXA' },
  };
  const c = config[severity];
  return (
    <span className="px-2 py-0.5 rounded text-[9px] font-mono font-bold tracking-wider"
      style={{ background: c.bg, border: `1px solid ${c.border}`, color: c.text }}>
      {c.label}
    </span>
  );
}

// ── Status Dot ──────────────────────────────────────────────────────────────────

function StatusDot({ status }: { status: ContainerStatus['status'] }) {
  const color = status === 'running' ? '#10b981' : status === 'restarting' ? '#f59e0b' : '#ef4444';
  return (
    <div className="relative flex items-center justify-center">
      <div className={`w-2.5 h-2.5 rounded-full ${status === 'running' ? 'animate-pulse' : ''}`}
        style={{ background: color }} />
      {status !== 'running' && (
        <div className="absolute w-2.5 h-2.5 rounded-full animate-ping opacity-30"
          style={{ background: color }} />
      )}
    </div>
  );
}

// ── Command Panel ───────────────────────────────────────────────────────────────

function CommandPanel({ onCommand, isLoading }: {
  onCommand: (payload: CommandPayload) => void;
  isLoading: boolean;
}) {
  const [commandType, setCommandType] = useState<CommandPayload['type']>('clear_cache');
  const [target, setTarget] = useState('');
  const [confirmToken, setConfirmToken] = useState('');
  const [showNuclear, setShowNuclear] = useState(false);

  const handleSubmit = () => {
    if (!target.trim()) return;
    const payload: CommandPayload = { type: commandType, target: target.trim() };
    if (commandType === 'force_container_restart') {
      payload.confirmToken = confirmToken;
    }
    onCommand(payload);
    setTarget('');
    setConfirmToken('');
  };

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {([
          { type: 'clear_cache' as const, icon: Trash2, label: 'Clear Cache', desc: 'Redis FLUSHDB' },
          { type: 'restart_agent' as const, icon: RefreshCw, label: 'Restart Agent', desc: 'PID restart' },
          { type: 'pause_tenant' as const, icon: Pause, label: 'Kill Switch', desc: 'Pause tenant' },
          { type: 'force_container_restart' as const, icon: ServerCrash, label: 'Nuclear Restart', desc: 'Docker restart' },
        ]).map(cmd => {
          const Icon = cmd.icon;
          const isNuclear = cmd.type === 'force_container_restart';
          const isActive = commandType === cmd.type;
          return (
            <button key={cmd.type} onClick={() => { setCommandType(cmd.type); setShowNuclear(isNuclear); }}
              className={`p-3 rounded-lg border text-left transition-all cursor-pointer ${
                isActive
                  ? isNuclear
                    ? 'border-red-500/50 bg-red-500/10'
                    : 'border-emerald-500/50 bg-emerald-500/10'
                  : 'border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.04] hover:border-white/10'
              }`}>
              <div className="flex items-center gap-2 mb-1">
                <Icon className={`w-3.5 h-3.5 ${isNuclear ? 'text-red-400' : isActive ? 'text-emerald-400' : 'text-slate-400'}`} />
                <span className={`text-[10px] font-mono font-bold ${isNuclear ? 'text-red-400' : isActive ? 'text-emerald-400' : 'text-slate-300'}`}>
                  {cmd.label}
                </span>
              </div>
              <span className="text-[9px] font-mono text-slate-500">{cmd.desc}</span>
            </button>
          );
        })}
      </div>

      <div className="flex gap-2">
        <input
          type="text"
          value={target}
          onChange={e => setTarget(e.target.value)}
          placeholder={commandType === 'clear_cache' ? 'Cache pattern (ex: tenant:123:*)' : commandType === 'pause_tenant' ? 'Tenant ID (ex: pousada-sol-mar)' : 'Container name (ex: zella-evolution)'}
          className="flex-1 px-3 py-2 rounded-lg bg-white/[0.04] border border-white/[0.08] text-xs font-mono text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-emerald-500/40 focus:ring-1 focus:ring-emerald-500/20"
          onKeyDown={e => e.key === 'Enter' && handleSubmit()}
        />
        <Button
          onClick={handleSubmit}
          disabled={isLoading || !target.trim()}
          size="sm"
          className="gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-mono text-[10px] px-4"
        >
          {isLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Send className="w-3 h-3" />}
          EXEC
        </Button>
      </div>

      <AnimatePresence>
        {showNuclear && commandType === 'force_container_restart' && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}>
            <div className="p-3 rounded-lg border border-red-500/30 bg-red-500/5">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="w-3.5 h-3.5 text-red-400" />
                <span className="text-[10px] font-mono font-bold text-red-400">OPERAÇÃO NUCLEAR — Requer token de confirmação</span>
              </div>
              <input
                type="password"
                value={confirmToken}
                onChange={e => setConfirmToken(e.target.value)}
                placeholder="Confirm token..."
                className="w-full px-3 py-2 rounded bg-red-500/10 border border-red-500/20 text-xs font-mono text-red-300 placeholder:text-red-500/40 focus:outline-none focus:border-red-500/50"
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Main Page ────────────────────────────────────────────────────────────────────

export default function ZCCPulsePage() {
  const {
    isConnected, metrics, containers, alerts, commandResults, analysisResults,
    sendCommand, requestAnalysis, clearAlerts, clearCommandResults,
  } = usePulseSocket();

  const [expandedAlert, setExpandedAlert] = useState<string | null>(null);
  const [commandLoading, setCommandLoading] = useState(false);

  const handleCommand = (payload: CommandPayload) => {
    setCommandLoading(true);
    sendCommand(payload);
    // Reset loading after max expected delay
    setTimeout(() => setCommandLoading(false), 4000);
  };

  // ── Metric color helpers ──────────────────────────────────────────────────────
  const cpuColor = !metrics ? '#64748b' : metrics.cpuUsage > 80 ? '#ef4444' : metrics.cpuUsage > 60 ? '#f59e0b' : '#10b981';
  const ramPercent = metrics ? (metrics.ramUsed / metrics.ramTotal) * 100 : 0;
  const ramColor = ramPercent > 85 ? '#ef4444' : ramPercent > 70 ? '#f59e0b' : '#10b981';
  const diskPercent = metrics ? (metrics.diskUsed / metrics.diskTotal) * 100 : 0;
  const diskColor = diskPercent > 80 ? '#ef4444' : diskPercent > 60 ? '#f59e0b' : '#14b8a6';

  const allRunning = containers.length > 0 && containers.every(c => c.status === 'running');

  return (
    <div className="min-h-screen flex flex-col" style={{ background: '#0A0F1C' }}>
      {/* ===== HEADER ===== */}
      <header className="sticky top-0 z-50 border-b px-4 py-3" style={{ background: 'rgba(10,15,28,0.95)', backdropFilter: 'blur(12px)', borderColor: 'rgba(212,168,67,0.1)' }}>
        <div className="max-w-[1920px] mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Command className="w-5 h-5" style={{ color: '#d4a843' }} />
            <span className="text-sm font-bold tracking-tight" style={{ color: '#e8dcc8' }}>ZÉLLA</span>
            <div className="h-4 w-px" style={{ background: 'rgba(212,168,67,0.2)' }} />
            <span className="font-mono text-[9px] font-bold tracking-[0.2em] uppercase" style={{ color: '#d4a843' }}>
              Pulse Service — Central Control
            </span>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded" style={{
              background: isConnected ? 'rgba(16,185,129,0.08)' : 'rgba(239,68,68,0.08)',
              border: `1px solid ${isConnected ? 'rgba(16,185,129,0.2)' : 'rgba(239,68,68,0.2)'}`,
            }}>
              {isConnected ? <Wifi className="w-3 h-3 text-emerald-400" /> : <WifiOff className="w-3 h-3 text-red-400" />}
              <span className={`text-[10px] font-mono font-bold ${isConnected ? 'text-emerald-400' : 'text-red-400'}`}>
                {isConnected ? 'PULSE LIVE' : 'OFFLINE'}
              </span>
              <div className={`w-1.5 h-1.5 rounded-full ${isConnected ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`} />
            </div>
            {metrics && (
              <span className="hidden sm:inline text-[9px] font-mono text-slate-500">
                {new Date(metrics.timestamp).toLocaleTimeString('pt-BR')}
              </span>
            )}
          </div>
        </div>
      </header>

      {/* ===== MAIN CONTENT ===== */}
      <main className="flex-1 max-w-[1920px] w-full mx-auto p-4 md:p-6">
        <Tabs defaultValue="pulse" className="space-y-5">
          <TabsList className="bg-white/[0.03] border border-white/[0.06] p-0.5 h-8">
            <TabsTrigger value="pulse" className="text-[10px] font-mono font-bold px-3 h-7 data-[state=active]:bg-emerald-600/20 data-[state=active]:text-emerald-400">
              <Activity className="w-3 h-3 mr-1.5" />Pulse Check
            </TabsTrigger>
            <TabsTrigger value="alerts" className="text-[10px] font-mono font-bold px-3 h-7 data-[state=active]:bg-amber-600/20 data-[state=active]:text-amber-400 relative">
              <AlertTriangle className="w-3 h-3 mr-1.5" />Alerts
              {alerts.length > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-500 text-[8px] font-bold text-white flex items-center justify-center">
                  {alerts.length > 9 ? '9+' : alerts.length}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="command" className="text-[10px] font-mono font-bold px-3 h-7 data-[state=active]:bg-teal-600/20 data-[state=active]:text-teal-400">
              <Terminal className="w-3 h-3 mr-1.5" />Command
            </TabsTrigger>
            <TabsTrigger value="analysis" className="text-[10px] font-mono font-bold px-3 h-7 data-[state=active]:bg-violet-600/20 data-[state=active]:text-violet-400">
              <Brain className="w-3 h-3 mr-1.5" />AI Analysis
            </TabsTrigger>
          </TabsList>

          {/* ===== TAB: PULSE CHECK ===== */}
          <TabsContent value="pulse" className="space-y-5">
            {/* Connection Warning */}
            {!isConnected && (
              <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
                className="p-4 rounded-lg border border-amber-500/30 bg-amber-500/5 flex items-center gap-3">
                <Loader2 className="w-4 h-4 text-amber-400 animate-spin" />
                <span className="text-xs font-mono text-amber-300">Conectando ao Pulse Service na porta 3003...</span>
              </motion.div>
            )}

            {/* VPS Gauges */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="bg-white/[0.02] border-white/[0.06]">
                <CardContent className="p-5 flex items-center gap-5">
                  <CircularGauge value={metrics?.cpuUsage ?? 0} max={100} color={cpuColor} />
                  <div className="flex-1">
                    <div className="text-[9px] font-mono font-bold tracking-widest text-slate-500 mb-1">CPU — {metrics?.cpuCores ?? 4} CORES</div>
                    <div className="text-xl font-bold font-mono" style={{ color: cpuColor }}>
                      {metrics ? `${metrics.cpuUsage.toFixed(1)}%` : '—'}
                    </div>
                    <div className="text-[10px] font-mono mt-1 text-slate-500">
                      Load: {metrics ? metrics.loadAvg.map(l => l.toFixed(2)).join(' / ') : '—'}
                    </div>
                    <div className="text-[10px] font-mono text-slate-500">
                      ↑{metrics?.networkIn.toFixed(1) ?? '—'} MB/s ↓{metrics?.networkOut.toFixed(1) ?? '—'} MB/s
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/[0.02] border-white/[0.06]">
                <CardContent className="p-5 flex items-center gap-5">
                  <CircularGauge value={ramPercent} max={100} color={ramColor} />
                  <div className="flex-1">
                    <div className="text-[9px] font-mono font-bold tracking-widest text-slate-500 mb-1">RAM — DDR4</div>
                    <div className="text-xl font-bold font-mono" style={{ color: ramColor }}>
                      {metrics ? `${metrics.ramUsed.toFixed(1)} / ${metrics.ramTotal} GB` : '—'}
                    </div>
                    <div className="text-[10px] font-mono mt-1 text-slate-500">{ramPercent.toFixed(1)}% utilizado</div>
                    <div className="mt-2 h-1.5 rounded-full bg-white/[0.05] overflow-hidden">
                      <motion.div className="h-full rounded-full" style={{ background: ramColor }}
                        animate={{ width: `${ramPercent}%` }} transition={{ duration: 0.8 }} />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/[0.02] border-white/[0.06]">
                <CardContent className="p-5 flex items-center gap-5">
                  <CircularGauge value={diskPercent} max={100} color={diskColor} />
                  <div className="flex-1">
                    <div className="text-[9px] font-mono font-bold tracking-widest text-slate-500 mb-1">DISCO — SSD NVMe</div>
                    <div className="text-xl font-bold font-mono" style={{ color: diskColor }}>
                      {metrics ? `${metrics.diskUsed} / ${metrics.diskTotal} GB` : '—'}
                    </div>
                    <div className="text-[10px] font-mono mt-1 text-slate-500">{diskPercent.toFixed(0)}% utilizado</div>
                    <div className="mt-2 h-1.5 rounded-full bg-white/[0.05] overflow-hidden">
                      <motion.div className="h-full rounded-full" style={{ background: diskColor }}
                        animate={{ width: `${diskPercent}%` }} transition={{ duration: 0.8 }} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Container Matrix */}
            <Card className="bg-white/[0.02] border-white/[0.06]">
              <CardHeader className="pb-3 px-5 pt-5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Container className="w-4 h-4 text-teal-400" />
                    <CardTitle className="text-sm font-semibold text-slate-200">Docker Containers — Status Matrix</CardTitle>
                  </div>
                  <Badge variant="outline" className={`text-[9px] font-mono font-bold ${
                    allRunning ? 'border-emerald-500/30 text-emerald-400 bg-emerald-500/10' : 'border-amber-500/30 text-amber-400 bg-amber-500/10'
                  }`}>
                    {containers.filter(c => c.status === 'running').length}/{containers.length} RUNNING
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="px-5 pb-5">
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-3">
                  {containers.map((container, i) => {
                    const isRunning = container.status === 'running';
                    const isRestarting = container.status === 'restarting';
                    return (
                      <motion.div key={container.name}
                        initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.05 * i }}
                        className={`p-3 rounded-lg text-center border ${
                          isRunning ? 'bg-white/[0.02] border-white/[0.06]' :
                          isRestarting ? 'bg-amber-500/5 border-amber-500/20' :
                          'bg-red-500/5 border-red-500/20'
                        }`}>
                        <div className="flex justify-center mb-2">
                          <StatusDot status={container.status} />
                        </div>
                        <div className={`text-[10px] font-mono font-bold truncate ${isRunning ? 'text-slate-200' : isRestarting ? 'text-amber-400' : 'text-red-400'}`}>
                          {container.name.replace('zella-', '')}
                        </div>
                        <div className="text-[9px] font-mono mt-0.5 text-slate-500">{container.service}</div>
                        <div className="flex justify-center gap-2 mt-2 text-[9px] font-mono text-slate-400">
                          <span>CPU {container.cpu}%</span>
                          <span>MEM {container.memory}MB</span>
                        </div>
                        {container.port > 0 && (
                          <div className="text-[8px] font-mono mt-1 text-slate-600">:{container.port}</div>
                        )}
                        <div className="text-[8px] font-mono mt-1 text-slate-600 flex items-center justify-center gap-0.5">
                          <Clock className="w-2.5 h-2.5" />{container.uptime}
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* System Status Strip */}
            <Card className="bg-white/[0.02] border-white/[0.06]">
              <CardContent className="p-3">
                <div className="flex items-center gap-4 flex-wrap">
                  <span className="text-[9px] font-mono font-bold tracking-[0.15em] text-slate-500">SYSTEM STATUS</span>
                  {containers.map(c => (
                    <div key={c.name} className="flex items-center gap-1.5">
                      <div className={`w-1.5 h-1.5 rounded-full ${c.status === 'running' ? 'bg-emerald-500 animate-pulse' : c.status === 'restarting' ? 'bg-amber-500' : 'bg-red-500'}`} />
                      <span className="text-[9px] font-mono text-slate-400">{c.name.replace('zella-', '')}</span>
                    </div>
                  ))}
                  <span className="text-[9px] font-mono ml-auto text-slate-500">
                    {containers.filter(c => c.status === 'running').length}/{containers.length} running · VPS uptime: {metrics?.uptime ?? '—'}
                  </span>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ===== TAB: ALERTS ===== */}
          <TabsContent value="alerts" className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Radio className="w-4 h-4 text-amber-400 animate-pulse" />
                <span className="text-sm font-bold text-slate-200">Real-Time Error Alerts</span>
                <Badge variant="outline" className="text-[9px] font-mono border-amber-500/30 text-amber-400 bg-amber-500/10">
                  {alerts.length} ALERTAS
                </Badge>
              </div>
              <Button variant="ghost" size="sm" onClick={clearAlerts} className="text-[10px] font-mono text-slate-500 hover:text-slate-300">
                <Trash2 className="w-3 h-3 mr-1" />Limpar
              </Button>
            </div>

            {alerts.length === 0 ? (
              <Card className="bg-white/[0.02] border-white/[0.06]">
                <CardContent className="p-12 text-center">
                  <CheckCircle2 className="w-8 h-8 text-emerald-500/50 mx-auto mb-3" />
                  <p className="text-sm font-mono text-slate-500">Nenhum alerta ativo — Sistema operando normalmente</p>
                  <p className="text-[10px] font-mono text-slate-600 mt-1">Novos alertas aparecerão automaticamente a cada 15-25 segundos</p>
                </CardContent>
              </Card>
            ) : (
              <ScrollArea className="max-h-[70vh]">
                <div className="space-y-3 pr-4">
                  <AnimatePresence>
                    {alerts.map((alert) => (
                      <motion.div key={alert.id}
                        initial={{ opacity: 0, x: -20, scale: 0.98 }}
                        animate={{ opacity: 1, x: 0, scale: 1 }}
                        exit={{ opacity: 0, x: 20, scale: 0.98 }}
                        transition={{ duration: 0.3 }}>
                        <Card className={`bg-white/[0.02] border overflow-hidden ${
                          alert.severity === 'ALTA' ? 'border-red-500/20' :
                          alert.severity === 'MÉDIA' ? 'border-amber-500/15' : 'border-white/[0.06]'
                        }`}>
                          <CardContent className="p-4">
                            <div className="flex items-start gap-3">
                              <div className="mt-0.5">
                                {alert.severity === 'ALTA' ? <XCircle className="w-4 h-4 text-red-400" /> :
                                 alert.severity === 'MÉDIA' ? <AlertTriangle className="w-4 h-4 text-amber-400" /> :
                                 <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1 flex-wrap">
                                  <SeverityBadge severity={alert.severity} />
                                  <span className="text-[9px] font-mono text-slate-500">{alert.container}</span>
                                  <span className="text-[9px] font-mono text-slate-600">•</span>
                                  <span className="text-[9px] font-mono text-slate-500">
                                    {new Date(alert.timestamp).toLocaleTimeString('pt-BR')}
                                  </span>
                                  <span className="text-[8px] font-mono text-slate-600">{alert.id}</span>
                                </div>
                                <p className="text-xs font-medium text-slate-200 mb-1">{alert.title}</p>

                                <button onClick={() => setExpandedAlert(expandedAlert === alert.id ? null : alert.id)}
                                  className="text-[9px] font-mono text-teal-400 hover:text-teal-300 transition-colors flex items-center gap-1 cursor-pointer">
                                  {expandedAlert === alert.id ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                                  {expandedAlert === alert.id ? 'Ocultar detalhes' : 'Ver detalhes'}
                                </button>

                                <AnimatePresence>
                                  {expandedAlert === alert.id && (
                                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
                                      exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.2 }} className="overflow-hidden">
                                      <div className="mt-3 space-y-3">
                                        <div className="p-3 rounded bg-black/30 border border-white/[0.04]">
                                          <div className="text-[9px] font-mono font-bold text-slate-400 mb-1">STACK TRACE</div>
                                          <pre className="text-[9px] font-mono text-red-300/80 whitespace-pre-wrap leading-relaxed">{alert.stackTrace}</pre>
                                        </div>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                          <div>
                                            <div className="text-[9px] font-mono font-bold text-slate-400 mb-1">ARQUIVO:LINHA</div>
                                            <code className="text-[10px] font-mono text-teal-300">{alert.arquivo_linha}</code>
                                          </div>
                                          <div>
                                            <div className="text-[9px] font-mono font-bold text-slate-400 mb-1">IMPACTO USUÁRIO</div>
                                            <p className="text-[10px] font-mono text-slate-300">{alert.impacto_usuario}</p>
                                          </div>
                                          <div>
                                            <div className="text-[9px] font-mono font-bold text-slate-400 mb-1">CAUSA RAÍZ</div>
                                            <p className="text-[10px] font-mono text-slate-300">{alert.causa_raiz}</p>
                                          </div>
                                          <div>
                                            <div className="text-[9px] font-mono font-bold text-slate-400 mb-1">CÓDIGO SOLUÇÃO</div>
                                            <code className="text-[10px] font-mono text-emerald-300">{alert.codigo_solucao}</code>
                                          </div>
                                        </div>
                                        <Button
                                          variant="outline"
                                          size="sm"
                                          onClick={() => requestAnalysis(alert.id, alert.container, alert.title)}
                                          className="text-[10px] font-mono border-violet-500/30 text-violet-400 hover:bg-violet-500/10 hover:text-violet-300"
                                        >
                                          <Brain className="w-3 h-3 mr-1" />Solicitar Análise IA
                                        </Button>
                                      </div>
                                    </motion.div>
                                  )}
                                </AnimatePresence>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </ScrollArea>
            )}
          </TabsContent>

          {/* ===== TAB: COMMAND ===== */}
          <TabsContent value="command" className="space-y-5">
            <Card className="bg-white/[0.02] border-white/[0.06]">
              <CardHeader className="pb-3 px-5 pt-5">
                <div className="flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-teal-400" />
                  <CardTitle className="text-sm font-semibold text-slate-200">Command Center — Executar Operações</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="px-5 pb-5">
                <CommandPanel onCommand={handleCommand} isLoading={commandLoading} />
              </CardContent>
            </Card>

            {/* Command Results */}
            {commandResults.length > 0 && (
              <Card className="bg-white/[0.02] border-white/[0.06]">
                <CardHeader className="pb-3 px-5 pt-5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Zap className="w-4 h-4 text-amber-400" />
                      <CardTitle className="text-sm font-semibold text-slate-200">Resultados de Comandos</CardTitle>
                    </div>
                    <Button variant="ghost" size="sm" onClick={clearCommandResults} className="text-[10px] font-mono text-slate-500 hover:text-slate-300">
                      <Trash2 className="w-3 h-3 mr-1" />Limpar
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="px-5 pb-5">
                  <ScrollArea className="max-h-64">
                    <div className="space-y-2 pr-4">
                      <AnimatePresence>
                        {commandResults.map((result, i) => (
                          <motion.div key={`${result.type}-${result.target}-${i}`}
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                            className={`p-3 rounded-lg border flex items-start gap-3 ${
                              result.success
                                ? 'bg-emerald-500/5 border-emerald-500/15'
                                : 'bg-red-500/5 border-red-500/15'
                            }`}>
                            {result.success ? <CheckCircle2 className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" /> : <XCircle className="w-4 h-4 text-red-400 mt-0.5 shrink-0" />}
                            <div className="min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <Badge variant="outline" className={`text-[8px] font-mono ${
                                  result.success ? 'border-emerald-500/30 text-emerald-400' : 'border-red-500/30 text-red-400'
                                }`}>
                                  {result.type}
                                </Badge>
                                <code className="text-[9px] font-mono text-slate-400">→ {result.target}</code>
                              </div>
                              <p className={`text-[10px] font-mono ${result.success ? 'text-slate-300' : 'text-red-300'}`}>
                                {result.message}
                              </p>
                            </div>
                          </motion.div>
                        ))}
                      </AnimatePresence>
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* ===== TAB: AI ANALYSIS ===== */}
          <TabsContent value="analysis" className="space-y-4">
            <div className="flex items-center gap-2">
              <Brain className="w-4 h-4 text-violet-400" />
              <span className="text-sm font-bold text-slate-200">AI Analysis Results</span>
              <Badge variant="outline" className="text-[9px] font-mono border-violet-500/30 text-violet-400 bg-violet-500/10">
                {analysisResults.length} ANÁLISES
              </Badge>
            </div>

            {analysisResults.length === 0 ? (
              <Card className="bg-white/[0.02] border-white/[0.06]">
                <CardContent className="p-12 text-center">
                  <Brain className="w-8 h-8 text-violet-500/50 mx-auto mb-3" />
                  <p className="text-sm font-mono text-slate-500">Nenhuma análise IA disponível</p>
                  <p className="text-[10px] font-mono text-slate-600 mt-1">Clique em &quot;Solicitar Análise IA&quot; em um alerta para gerar uma análise</p>
                </CardContent>
              </Card>
            ) : (
              <ScrollArea className="max-h-[70vh]">
                <div className="space-y-4 pr-4">
                  <AnimatePresence>
                    {analysisResults.map((analysis, i) => (
                      <motion.div key={`${analysis.alertId}-${i}`}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}>
                        <Card className="bg-white/[0.02] border-violet-500/15 overflow-hidden">
                          <CardContent className="p-5">
                            <div className="flex items-center gap-2 mb-3">
                              <Brain className="w-4 h-4 text-violet-400" />
                              <span className="text-xs font-bold text-violet-300">{analysis.title}</span>
                              <Badge variant="outline" className="text-[8px] font-mono border-violet-500/30 text-violet-400">
                                {analysis.container}
                              </Badge>
                              <span className="text-[9px] font-mono text-slate-600 ml-auto">
                                {new Date(analysis.timestamp).toLocaleTimeString('pt-BR')}
                              </span>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                              <div>
                                <div className="text-[9px] font-mono font-bold text-slate-400 mb-1">DIAGNÓSTICO</div>
                                <p className="text-[10px] font-mono text-slate-300 leading-relaxed">{analysis.analysis.diagnostico}</p>
                              </div>
                              <div>
                                <div className="text-[9px] font-mono font-bold text-slate-400 mb-1">IMPACTO</div>
                                <p className="text-[10px] font-mono text-slate-300 leading-relaxed">{analysis.analysis.impacto}</p>
                              </div>
                              <div className="sm:col-span-2">
                                <div className="text-[9px] font-mono font-bold text-slate-400 mb-1">AÇÃO RECOMENDADA</div>
                                <pre className="text-[10px] font-mono text-emerald-300 whitespace-pre-wrap leading-relaxed">{analysis.analysis.acao_recomendada}</pre>
                              </div>
                              <div>
                                <div className="text-[9px] font-mono font-bold text-slate-400 mb-1">SEVERIDADE ESTIMADA</div>
                                <Badge variant="outline" className={`text-[9px] font-mono ${
                                  analysis.analysis.severidade_estimada === 'CRÍTICA'
                                    ? 'border-red-500/30 text-red-400 bg-red-500/10'
                                    : 'border-amber-500/30 text-amber-400 bg-amber-500/10'
                                }`}>
                                  {analysis.analysis.severidade_estimada}
                                </Badge>
                              </div>
                              <div>
                                <div className="text-[9px] font-mono font-bold text-slate-400 mb-1">TEMPO ESTIMADO</div>
                                <span className="text-[10px] font-mono text-slate-300">{analysis.analysis.tempo_estimado_resolucao}</span>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </ScrollArea>
            )}
          </TabsContent>
        </Tabs>
      </main>

      {/* ===== FOOTER ===== */}
      <footer className="mt-auto border-t py-3 px-4" style={{ borderColor: 'rgba(212,168,67,0.1)', background: 'rgba(10,15,28,0.9)' }}>
        <div className="max-w-[1920px] mx-auto flex items-center justify-between">
          <span className="text-[9px] font-mono text-slate-600">
            ZÉLLA Pulse Service v1.0 · Socket.io on :3003 · {isConnected ? '🟢' : '🔴'}
          </span>
          <span className="text-[9px] font-mono text-slate-600">
            MODO DEUS · Acesso restrito
          </span>
        </div>
      </footer>
    </div>
  );
}
