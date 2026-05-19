'use client';

import {
  Wifi,
  CheckCircle,
  Clock,
  AlertTriangle,
  Activity,
  RefreshCw,
} from 'lucide-react';
import { useState, useEffect, useCallback } from 'react';

import { Skeleton } from '@/components/ui/skeleton';
import { Switch } from '@/components/ui/switch';

import type { AgentStatusEntry } from '@/app/api/agents/status/route';

const statusConfig = {
  active: { dot: 'bg-emerald-500', glow: 'shadow-[0_0_8px_rgba(16,185,129,0.4)]', label: 'Active' },
  idle: { dot: 'bg-amber-500', glow: 'shadow-[0_0_8px_rgba(245,158,11,0.4)]', label: 'Idle' },
  error: { dot: 'bg-red-500', glow: 'shadow-[0_0_8px_rgba(239,68,68,0.4)]', label: 'Error' },
};

const codeColors: Record<string, string> = {
  REV: 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10',
  MKT: 'text-violet-400 border-violet-500/30 bg-violet-500/10',
  WPP: 'text-green-400 border-green-500/30 bg-green-500/10',
  ANA: 'text-cyan-400 border-cyan-500/30 bg-cyan-500/10',
  FIN: 'text-yellow-400 border-yellow-500/30 bg-yellow-500/10',
  RES: 'text-blue-400 border-blue-500/30 bg-blue-500/10',
  SEC: 'text-rose-400 border-rose-500/30 bg-rose-500/10',
  OPN: 'text-orange-400 border-orange-500/30 bg-orange-500/10',
  SWP: 'text-purple-400 border-purple-500/30 bg-purple-500/10',
  HRD: 'text-pink-400 border-pink-500/30 bg-pink-500/10',
};

function formatTimestamp(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

function signalBar(consumed: number): { label: string; color: string; width: string } {
  if (consumed >= 150) return { label: 'High', color: 'bg-emerald-500', width: 'w-3/4' };
  if (consumed >= 60) return { label: 'Medium', color: 'bg-amber-500', width: 'w-1/2' };
  return { label: 'Low', color: 'bg-red-500', width: 'w-1/4' };
}

export function SwarmOverview() {
  const [agents, setAgents] = useState<AgentStatusEntry[]>([]);
  const [summary, setSummary] = useState<{
    total: number;
    active: number;
    idle: number;
    error: number;
    tasksToday: number;
    signalsConsumed: number;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState<string | null>(null);

  const fetchStatus = useCallback(async () => {
    try {
      const res = await fetch('/api/agents/status');
      const data = await res.json();
      setAgents(data.agents);
      setSummary(data.summary);
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStatus();
  }, [fetchStatus]);

  const handleToggle = async (agent: AgentStatusEntry) => {
    setToggling(agent.code);
    try {
      const res = await fetch('/api/agents/status', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: agent.code, isEnabled: !agent.isEnabled }),
      });
      if (res.ok) {
        setAgents(prev =>
          prev.map(a => (a.code === agent.code ? { ...a, isEnabled: !a.isEnabled } : a))
        );
      }
    } catch {
      // silent
    } finally {
      setToggling(null);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-20 rounded-xl" />
          ))}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-44 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Bar */}
      {summary && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          <SummaryCard label="Total Agents" value={summary.total} icon={Activity} />
          <SummaryCard label="Active" value={summary.active} icon={CheckCircle} color="text-emerald-400" />
          <SummaryCard label="Idle" value={summary.idle} icon={Clock} color="text-amber-400" />
          <SummaryCard label="Error" value={summary.error} icon={AlertTriangle} color="text-red-400" />
          <SummaryCard label="Tasks Today" value={summary.tasksToday} icon={RefreshCw} />
          <SummaryCard label="Signals" value={summary.signalsConsumed} icon={Wifi} />
        </div>
      )}

      {/* Agent Grid */}
      <div>
        <h3 className="text-sm font-semibold text-[#b4b4b4] mb-4 flex items-center gap-2">
          <Activity className="w-4 h-4 text-[#F97316]" />
          Agent Swarm
          <span className="text-[10px] font-mono text-[#4d4d4d] font-normal">
            ({agents.filter(a => a.isEnabled).length}/{agents.length} enabled)
          </span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {agents.map(agent => {
            const cfg = statusConfig[agent.status];
            const signal = signalBar(agent.trendsSignalsConsumed);
            const codeColor = codeColors[agent.code] || 'text-gray-400 border-gray-500/30 bg-gray-500/10';

            return (
              <div
                key={agent.code}
                className={`relative rounded-xl border p-4 transition-all duration-200 ${
                  agent.isEnabled
                    ? 'bg-[#171717] border-[#2e2e2e] hover:border-[#3e3e3e]'
                    : 'bg-[#171717]/50 border-[#1e1e1e] opacity-60'
                }`}
              >
                {/* Top Row */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    {/* Status Dot */}
                    <div className={`w-3 h-3 rounded-full ${cfg.dot} ${cfg.glow} ${!agent.isEnabled && 'opacity-40'}`} />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-[#efefef]">{agent.name}</span>
                        <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded border ${codeColor}`}>
                          {agent.code}
                        </span>
                      </div>
                      <span className={`text-[11px] ${agent.isEnabled ? 'text-[#898989]' : 'text-[#4d4d4d]'}`}>
                        {cfg.label}
                      </span>
                    </div>
                  </div>

                  {/* Enable/Disable Toggle */}
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-[#4d4d4d]">{agent.isEnabled ? 'On' : 'Off'}</span>
                    <Switch
                      checked={agent.isEnabled}
                      disabled={toggling === agent.code}
                      onCheckedChange={() => handleToggle(agent)}
                      className="data-[state=checked]:bg-[#F97316]"
                    />
                  </div>
                </div>

                {/* Divider */}
                <div className="h-px bg-[#242424] mb-3" />

                {/* Details */}
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="text-[#4d4d4d]">Last Action</span>
                    <span className="text-[#b4b4b4] text-right max-w-[60%] truncate" title={agent.lastAction}>
                      {agent.lastAction}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#4d4d4d]">Timestamp</span>
                    <span className="text-[#898989] font-mono text-[10px]">{formatTimestamp(agent.lastActiveAt)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#4d4d4d]">Tasks Today</span>
                    <span className="text-[#efefef] font-mono font-bold">{agent.tasksCompletedToday}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[#4d4d4d]">Trends Signals</span>
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-1.5 bg-[#242424] rounded-full overflow-hidden">
                        <div className={`h-full rounded-full ${signal.color} ${signal.width}`} />
                      </div>
                      <span className={`text-[10px] font-mono ${
                        signal.label === 'High' ? 'text-emerald-400' :
                        signal.label === 'Medium' ? 'text-amber-400' : 'text-red-400'
                      }`}>
                        {signal.label}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function SummaryCard({
  label,
  value,
  icon: Icon,
  color,
}: {
  label: string;
  value: number;
  icon: React.ComponentType<{ className?: string }>;
  color?: string;
}) {
  return (
    <div className="bg-[#171717] border border-[#2e2e2e] rounded-xl p-4">
      <div className="flex items-center justify-between mb-1">
        <span className="text-[10px] text-[#4d4d4d] uppercase tracking-wider font-mono">{label}</span>
        <Icon className={`w-4 h-4 ${color || 'text-[#4d4d4d]'}`} />
      </div>
      <div className={`text-2xl font-bold font-mono ${color || 'text-[#efefef]'}`}>
        {value}
      </div>
    </div>
  );
}
