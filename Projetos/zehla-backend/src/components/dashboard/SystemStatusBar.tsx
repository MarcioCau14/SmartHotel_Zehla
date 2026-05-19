import { Activity, Wifi, Brain, Shield, Database, Cpu } from 'lucide-react';
import { useState, useEffect } from 'react';


'use client';


interface BrainHealth {
  edge_latency: number;
  brain_queue: number;
  voice_swarm: number;
  zdr_status: string;
  cache_hit_rate: number;
  active_agents: number;
  tokens_today: number;
}

export function SystemStatusBar() : void {
  const [health, setHealth] = useState<BrainHealth | null>(null);
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const res = await fetch('/api/brain/health');
        const data = await res.json();
        if (!cancelled) setHealth(data);
      } catch {
        // silent fail
      }
    };
    load();
    const interval = setInterval(load, 5000);
    return () => { cancelled = true; clearInterval(interval); };
  }, []);

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const metrics = health
    ? [
        { icon: Activity, label: 'Edge Latency', value: `${health.edge_latency}ms`, ok: health.edge_latency < 50 },
        { icon: Brain, label: 'Brain Queue', value: String(health.brain_queue), ok: health.brain_queue < 20 },
        { icon: Wifi, label: 'Voice Swarm', value: String(health.voice_swarm), ok: true },
        { icon: Shield, label: 'ZDR Shield', value: health.zdr_status, ok: health.zdr_status === 'active' },
        { icon: Database, label: 'Cache Hit', value: `${health.cache_hit_rate}%`, ok: health.cache_hit_rate > 90 },
        { icon: Cpu, label: 'Agents', value: `${health.active_agents}/8`, ok: health.active_agents >= 6 },
      ]
    : [];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 glass-strong border-t border-[#2e2e2e]">
      <div className="max-w-full mx-auto px-4 py-1.5 flex items-center justify-between overflow-x-auto zehla-scroll-x gap-4">
        <div className="flex items-center gap-4 min-w-0">
          <span className="text-xs font-mono text-[#FF5500] whitespace-nowrap">
            ● ZEHLA OS
          </span>
          {metrics.map((m, i) => (
            <div key={i} className="flex items-center gap-1.5 whitespace-nowrap">
              <m.icon className={`w-3 h-3 ${m.ok ? 'text-[#FF5500]' : 'text-red-400'}`} />
              <span className="text-[10px] text-[#4d4d4d]">{m.label}</span>
              <span className={`text-[10px] font-mono ${m.ok ? 'text-[#b4b4b4]' : 'text-red-400'}`}>
                {m.value}
              </span>
            </div>
          ))}
        </div>
        <span className="text-[10px] font-mono text-[#363636] whitespace-nowrap">
          {now.toLocaleTimeString('pt-BR')}
        </span>
      </div>
    </div>
  );
}
