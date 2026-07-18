'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Activity, Shield, RefreshCw, AlertTriangle, CheckCircle2,
  XCircle, Clock, Container, Radio, Wifi, WifiOff,
} from 'lucide-react';

// ── Mock Infrastructure Data ──────────────────────────────────────────────────

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

interface VPSMetrics {
  cpuUsage: number;
  cpuCores: number;
  ramUsed: number;
  ramTotal: number;
  diskUsed: number;
  diskTotal: number;
  loadAvg: [number, number, number];
  uptime: string;
  networkIn: number;
  networkOut: number;
}

interface RateLimiterZone {
  zone: string;
  activeIPs: number;
  blockedIPs: number;
  requestsPerSec: number;
}

const mockContainers: ContainerStatus[] = [
  { name: 'zella-app', service: 'Next.js App', status: 'running', uptime: '14d 6h', cpu: 12, memory: 340, port: 3000, image: 'zella:latest' },
  { name: 'zella-postgres', service: 'PostgreSQL', status: 'running', uptime: '14d 6h', cpu: 4, memory: 512, port: 5432, image: 'postgres:16' },
  { name: 'zella-redis', service: 'Redis Cache', status: 'running', uptime: '14d 6h', cpu: 1, memory: 128, port: 6379, image: 'redis:7-alpine' },
  { name: 'zella-evolution', service: 'Evolution API', status: 'running', uptime: '3d 12h', cpu: 8, memory: 456, port: 8080, image: 'atticus/evolution-api:latest' },
  { name: 'zella-nginx', service: 'Nginx Reverse Proxy', status: 'running', uptime: '14d 6h', cpu: 1, memory: 64, port: 80, image: 'nginx:alpine' },
  { name: 'zella-bullmq', service: 'BullMQ Worker', status: 'running', uptime: '14d 6h', cpu: 3, memory: 96, port: 0, image: 'zella-worker:latest' },
];

const mockRateLimiterZones: RateLimiterZone[] = [
  { zone: 'api-general', activeIPs: 247, blockedIPs: 3, requestsPerSec: 142 },
  { zone: 'whatsapp-webhook', activeIPs: 18, blockedIPs: 0, requestsPerSec: 34 },
  { zone: 'auth-login', activeIPs: 12, blockedIPs: 1, requestsPerSec: 8 },
  { zone: 'brain-api', activeIPs: 15, blockedIPs: 0, requestsPerSec: 56 },
];

// Circular progress component
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

export function PulseCheck() {
  const [vps, setVps] = useState<VPSMetrics>({
    cpuUsage: 23, cpuCores: 4, ramUsed: 3.2, ramTotal: 8,
    diskUsed: 42, diskTotal: 100, loadAvg: [0.8, 0.6, 0.5],
    uptime: '14d 6h 32m', networkIn: 12, networkOut: 8,
  });
  const [containers, setContainers] = useState(mockContainers);
  const [rateZones, setRateZones] = useState(mockRateLimiterZones);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());
  const [evolutionAlert, setEvolutionAlert] = useState(false);

  // Simulate real-time data fluctuations
  useEffect(() => {
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
      setRateZones(prev => prev.map(z => ({
        ...z,
        requestsPerSec: Math.max(5, z.requestsPerSec + Math.round((Math.random() - 0.5) * 8)),
        activeIPs: Math.max(1, z.activeIPs + Math.round((Math.random() - 0.5) * 5)),
      })));
      setLastRefresh(new Date());
    }, 3000);
    return () => clearInterval(id);
  }, []);

  const cpuColor = vps.cpuUsage > 80 ? '#ef4444' : vps.cpuUsage > 60 ? '#f59e0b' : '#10b981';
  const ramPercent = (vps.ramUsed / vps.ramTotal) * 100;
  const ramColor = ramPercent > 85 ? '#ef4444' : ramPercent > 70 ? '#f59e0b' : '#10b981';
  const diskPercent = (vps.diskUsed / vps.diskTotal) * 100;
  const diskColor = diskPercent > 80 ? '#ef4444' : diskPercent > 60 ? '#f59e0b' : '#14b8a6';

  const allRunning = containers.every(c => c.status === 'running');
  const evolutionUp = containers.find(c => c.name === 'zella-evolution')?.status === 'running';

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
              Hostinger VPS · Docker Compose · Nginx Rate Limiter
            </p>
          </div>
          <AnimatePresence>
            {!evolutionUp && (
              <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }}
                className="flex items-center gap-1.5 px-2 py-1 rounded" style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)' }}>
                <AlertTriangle className="w-3 h-3 text-red-400" />
                <span className="text-[10px] font-mono text-red-400">EVOLUTION API DOWN</span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-mono" style={{ color: 'var(--zcc-text-muted)' }}>
            {lastRefresh.toLocaleTimeString('pt-BR')}
          </span>
          <div className={`w-2 h-2 rounded-full ${allRunning ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500 animate-pulse'}`} />
        </div>
      </div>

      {/* VPS Gauges */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="zcc-panel p-5 flex items-center gap-5">
          <CircularGauge value={vps.cpuUsage} max={100} color={cpuColor} />
          <div className="flex-1">
            <div className="zcc-eyebrow">CPU — {vps.cpuCores} Cores</div>
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
            <div className="zcc-eyebrow">RAM — DDR4</div>
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
            <div className="zcc-eyebrow">DISCO — SSD NVMe</div>
            <div className="text-xl font-bold font-mono" style={{ color: diskColor }}>{vps.diskUsed} / {vps.diskTotal} GB</div>
            <div className="text-[10px] font-mono mt-1" style={{ color: 'var(--zcc-text-muted)' }}>
              {diskPercent.toFixed(0)}% utilizado
            </div>
            <div className="zcc-progress-track mt-2">
              <div className="zcc-progress-fill-patina zcc-progress-fill" style={{ width: `${diskPercent}%`, background: diskColor }} />
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
            const isEvolution = container.name === 'zella-evolution';
            const isAlert = isEvolution && !isRunning;

            return (
              <motion.div key={container.name} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.05 * i }}
                className="zcc-panel p-3 text-center relative"
                style={isAlert ? { borderColor: 'rgba(239,68,68,0.5)', boxShadow: '0 0 20px rgba(239,68,68,0.15)' } : {}}
              >
                {/* Status indicator */}
                <div className="flex justify-center mb-2">
                  <div className={`w-3 h-3 rounded-full ${isRunning ? 'bg-emerald-500' : 'bg-red-500'} ${isRunning ? 'animate-pulse' : ''}`}
                    style={isAlert ? { boxShadow: '0 0 10px rgba(239,68,68,0.5)' } : {}} />
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
              className="flex items-center gap-4 p-3 rounded" style={{ background: 'var(--zcc-lacquer-sunken)', border: '1px solid rgba(212,168,67,0.06)' }}
            >
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

      {/* Uptime & System Info */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Uptime VPS', value: vps.uptime, icon: Clock, color: '#10b981' },
          { label: 'Containers Up', value: `${containers.filter(c=>c.status==='running').length}/${containers.length}`, icon: Container, color: 'var(--zcc-kinpaku)' },
          { label: 'Evolution API', value: evolutionUp ? 'ONLINE' : 'OFFLINE', icon: evolutionUp ? Wifi : WifiOff, color: evolutionUp ? '#10b981' : '#ef4444' },
          { label: 'Nginx', value: 'ACTIVE', icon: Shield, color: 'var(--zcc-patina)' },
        ].map((item, i) => {
          const Icon = item.icon;
          return (
            <motion.div key={item.label} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35 + i * 0.05 }}
              className="zcc-panel p-4 flex items-center gap-3"
            >
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
