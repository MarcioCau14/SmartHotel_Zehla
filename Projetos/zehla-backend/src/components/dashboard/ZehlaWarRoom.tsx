import React, { useState, useEffect } from 'react';
import { 
import { motion, AnimatePresence } from 'framer-motion';

import BITelemetryView from './BITelemetryView';


'use client';

  Activity, 
  Map as MapIcon, 
  Zap, 
  Target, 
  Cpu, 
  Globe, 
  ChevronRight,
  ShieldCheck,
  MousePointer2,
  Clock,
  Radio
} from 'lucide-react';

interface Ping {
  id: string;
  x: number;
  y: number;
  label: string;
  type: 'CLICK' | 'OPEN' | 'LEAD';
}

export default function ZehlaWarRoom() {
  const [pings, setPings] = useState<Ping[]>([]);
  const [metrics, setMetrics] = useState({
    latency: '0.4ms', // Reduzido por causa do Redis
    successRate: '99.9%',
    cpu: '4%',
    memory: '1.1GB',
    activeInstances: 12
  });

  // CARREGAMENTO REAL DO RADAR (ZCC Inteligência)
  useEffect(() => {
    const fetchRadarData = async () => {
      try {
        const response = await fetch('/api/zcc/radar');
        const data = await response.json();
        if (Array.isArray(data)) {
          // Pegamos os últimos 6 eventos para manter o radar dinâmico mas leve
          setPings(data.slice(-6));
        }
      } catch (err) {
        console.error('⚠️ [RADAR] Falha ao conectar ao cérebro central.');
      }
    };

    fetchRadarData();
    const interval = setInterval(fetchRadarData, 60000); // Atualiza a cada 1 minuto
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full h-full bg-[#050505] text-[#e0e0e0] flex flex-col font-sans overflow-hidden border border-white/5 rounded-2xl shadow-2xl">
      {/* Top Header / Stats */}
      <div className="flex items-center justify-between p-6 bg-gradient-to-b from-white/5 to-transparent border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-500/10 rounded-lg">
            <Globe className="w-5 h-5 text-blue-400" />
          </div>
          <div>
            <h2 className="text-sm font-bold tracking-widest text-white uppercase">ZCC — ZEHLA Control Center</h2>
            <p className="text-[10px] text-white/40 uppercase tracking-tighter">Cérebro Central de Comando e Inteligência</p>
          </div>
        </div>

        <div className="flex items-center gap-8">
          <StatBox icon={<Radio className="w-4 h-4 text-orange-400" />} label="Status da Rede" value="LIVE" color="text-orange-400" />
          <StatBox icon={<Target className="w-4 h-4 text-blue-400" />} label="Leads Ativos" value="1.542" />
          <StatBox icon={<ShieldCheck className="w-4 h-4 text-emerald-400" />} label="Zehla Guardian" value="SECURE" color="text-emerald-400" />
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Left Panel: Real-time Feed */}
        <div className="w-80 border-r border-white/5 bg-black/20 flex flex-col p-4 gap-4 overflow-y-auto zehla-scroll">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Feed de Atividade</h3>
            <span className="flex h-2 w-2 rounded-full bg-blue-500 animate-pulse"></span>
          </div>
          
          <AnimatePresence mode="popLayout">
            {pings.map((ping, i) => (
              <motion.div 
                key={ping.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="p-3 bg-white/5 rounded-xl border border-white/5 flex flex-col gap-2 relative overflow-hidden"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-medium text-white/80">{ping.label}</span>
                  <span className="text-[9px] text-white/30"><Clock className="w-2 h-2 inline mr-1" /> agora</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className={`text-[8px] px-2 py-0.5 rounded-full ${ping.type === 'CLICK' ? 'bg-orange-500/20 text-orange-400' : 'bg-blue-500/20 text-blue-400'}`}>
                    {ping.type === 'CLICK' ? 'CLIQUE NO E-MAIL' : 'LEAD CAPTADO'}
                  </div>
                  <ChevronRight className="w-3 h-3 text-white/20" />
                </div>
                <div className={`absolute top-0 right-0 w-16 h-16 blur-2xl opacity-10 ${ping.type === 'CLICK' ? 'bg-orange-500' : 'bg-blue-500'}`}></div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Right Area: Map + Telemetry */}
        <div className="flex-1 flex flex-col overflow-y-auto zehla-scroll bg-[radial-gradient(circle_at_center,_#111_0%,_transparent_70%)]">
          {/* Map Area */}
          <div className="h-[500px] shrink-0 relative flex items-center justify-center">
            <div className="relative w-[500px] h-[550px] opacity-60">
              <svg viewBox="0 0 500 550" className="w-full h-full text-white/10 fill-current">
                <path d="M210,50 L250,60 L280,40 L350,80 L380,150 L420,200 L440,280 L420,350 L380,420 L320,480 L250,520 L180,500 L120,450 L80,380 L50,300 L60,200 L100,120 L150,70 Z" />
              </svg>

              <AnimatePresence>
                {pings.map((ping) => (
                  <motion.div
                    key={`map-${ping.id}`}
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 1.5, opacity: 0 }}
                    className="absolute pointer-events-none"
                    style={{ left: `${ping.x}%`, top: `${ping.y}%` }}
                  >
                    <div className={`w-3 h-3 rounded-full ${ping.type === 'CLICK' ? 'bg-orange-500' : 'bg-blue-500'} shadow-[0_0_15px_rgba(0,0,0,0.5)]`} />
                    <div className={`absolute inset-0 w-3 h-3 rounded-full ${ping.type === 'CLICK' ? 'bg-orange-500' : 'bg-blue-500'} animate-ping opacity-75`} />
                    <motion.div 
                      initial={{ y: 10, opacity: 0 }}
                      animate={{ y: -20, opacity: 1 }}
                      className="absolute whitespace-nowrap bg-black/80 backdrop-blur-md border border-white/10 px-2 py-1 rounded text-[9px] font-bold text-white shadow-xl"
                    >
                      {ping.label}
                    </motion.div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>

          {/* BI Telemetry Section */}
          <div className="p-8 border-t border-white/5 bg-black/20">
            <BITelemetryView />
          </div>
        </div>
      </div>

      {/* Infrastructure Telemetry Footer */}
      <div className="p-6 bg-black border-t border-white/5 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-12">
          <TelemetryItem icon={<Zap className="w-3 h-3" />} label="Latência do Cérebro" value={metrics.latency} color="text-blue-400" />
          <TelemetryItem icon={<ShieldCheck className="w-3 h-3" />} label="Taxa de Sucesso" value={metrics.successRate} color="text-emerald-400" />
          <TelemetryItem icon={<Cpu className="w-3 h-3" />} label="Carga de CPU" value={metrics.cpu} />
          <TelemetryItem icon={<Activity className="w-3 h-3" />} label="Memória" value={metrics.memory} />
        </div>

        <div className="flex items-center gap-4 text-[10px] text-white/30 font-mono tracking-widest uppercase">
          <span className="flex h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
          ZCC Intel Engine Online
        </div>
      </div>
    </div>
  );
}

function StatBox({ icon, label, value, color = "text-white" }: { icon: React.ReactNode, label: string, value: string, color?: string }) {
  try {
  return (
    <div className="flex flex-col gap-1 items-end">
      <span className="text-[9px] text-white/30 uppercase tracking-widest">{label}</span>
      <div className="flex items-center gap-2">
        {icon}
        <span className={`text-sm font-bold ${color}`}>{value}</span>
      </div>
    </div>
  );
}

function TelemetryItem({ icon, label, value, color = "text-white/60" }: { icon: React.ReactNode, label: string, value: string, color?: string }) {
  try {
  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center gap-2 text-[9px] text-white/20 uppercase tracking-widest font-medium">
        {icon}
        {label}
      </div>
      <span className={`text-xs font-mono font-bold ${color}`}>{value}</span>
    </div>
  );
}
