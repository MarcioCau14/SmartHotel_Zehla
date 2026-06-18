'use client';

import { useState, useEffect } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Wifi, CheckCircle, Clock, XCircle } from 'lucide-react';
import type { AIAgent } from '@/lib/store';

interface SwarmOverviewProps {
  brainHealth: Record<string, unknown>;
}

interface LLMProvider {
  name: string;
  status: 'active' | 'pending' | 'error';
  modelName?: string;
  type: 'gratuita' | 'paga';
  icon: string;
}

const llmProviders: LLMProvider[] = [
  { name: 'z-ai-web-dev-sdk', status: 'active', modelName: 'ZAI Default', type: 'gratuita', icon: '🧠' },
  { name: 'OpenAI', status: 'pending', type: 'paga', icon: '🤖' },
  { name: 'Anthropic', status: 'pending', type: 'paga', icon: '🧪' },
  { name: 'Google Gemini', status: 'pending', type: 'gratuita', icon: '💎' },
  { name: 'Gemma (Soberano)', status: 'pending', type: 'gratuita', icon: '🏛️' },
];

const llmStatusConfig = {
  active: { color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30', label: 'Ativa', icon: CheckCircle },
  pending: { color: 'bg-amber-500/20 text-amber-400 border-amber-500/30', label: 'Configuração Pendente', icon: Clock },
  error: { color: 'bg-red-500/20 text-red-400 border-red-500/30', label: 'Erro', icon: XCircle },
};

const typeConfig = {
  gratuita: { color: 'bg-emerald-500/10 text-emerald-400', label: 'Gratuita' },
  paga: { color: 'bg-purple-500/10 text-purple-400', label: 'Paga' },
};

export function SwarmOverview({ brainHealth }: SwarmOverviewProps) {
  const [agents, setAgents] = useState<AIAgent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/agents')
      .then(r => r.json())
      .then(d => { setAgents(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      {/* Brain Health */}
      <div className="glass-card p-5">
        <h3 className="text-sm font-semibold text-neutral-300 mb-4">Saúde do Brain</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {[
            { label: 'Edge Latency', value: `${brainHealth.edge_latency}ms`, ok: Number(brainHealth.edge_latency) < 50 },
            { label: 'Brain Queue', value: String(brainHealth.brain_queue), ok: Number(brainHealth.brain_queue) < 20 },
            { label: 'Voice Swarm', value: String(brainHealth.voice_swarm), ok: true },
            { label: 'Cache Hit', value: `${Number(brainHealth.cache_hit_rate).toFixed(1)}%`, ok: Number(brainHealth.cache_hit_rate) > 90 },
            { label: 'Tokens Hoje', value: Number(brainHealth.tokens_today).toLocaleString('pt-BR'), ok: true },
            { label: 'BullMQ', value: String(brainHealth.bullmq_pending), ok: Number(brainHealth.bullmq_pending) < 30 },
          ].map((item, i) => (
            <div key={i} className="bg-white/[0.02] rounded-lg p-3">
              <div className="text-[10px] text-neutral-500">{item.label}</div>
              <div className={`text-sm font-mono font-bold ${item.ok ? 'text-emerald-400' : 'text-amber-400'}`}>
                {item.value}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* LLMs Conectadas */}
      <div className="glass-card p-5">
        <h3 className="text-sm font-semibold text-neutral-300 mb-4 flex items-center gap-2">
          <Wifi className="w-4 h-4 text-emerald-400" />
          LLMs Conectadas
        </h3>
        <div className="space-y-2">
          {llmProviders.map((provider) => {
            const statusCfg = llmStatusConfig[provider.status];
            const typeCfg = typeConfig[provider.type];
            const StatusIcon = statusCfg.icon;
            return (
              <div
                key={provider.name}
                className="flex items-center justify-between p-3 rounded-lg bg-white/[0.02] hover:bg-white/[0.04] transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span className="text-lg">{provider.icon}</span>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-neutral-200">{provider.name}</span>
                      {provider.status === 'active' && (
                        <span className="text-[10px] text-neutral-500">(Modelo atual)</span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-0.5">
                      {provider.modelName && (
                        <span className="text-[10px] font-mono text-neutral-400">{provider.modelName}</span>
                      )}
                      <span className={`text-[10px] px-1.5 py-0.5 rounded ${typeCfg.color}`}>
                        {provider.type === 'gratuita' ? 'Incluída no plano' : typeCfg.label}
                      </span>
                    </div>
                  </div>
                </div>
                <Badge variant="outline" className={`border-0 text-[10px] flex items-center gap-1 ${statusCfg.color}`}>
                  <StatusIcon className="w-3 h-3" />
                  {statusCfg.label}
                </Badge>
              </div>
            );
          })}
        </div>
        <div className="mt-3 text-[10px] text-neutral-600 flex items-center gap-1">
          <Wifi className="w-3 h-3" />
          {llmProviders.filter(p => p.status === 'active').length} de {llmProviders.length} LLMs ativas. Conecte mais para escalar capacidade.
        </div>
      </div>

      {/* Agent Swarm Grid */}
      <div>
        <h3 className="text-sm font-semibold text-neutral-300 mb-4">Swarm de Agentes — Status Completo</h3>
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className="h-40 rounded-xl" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {agents.map((agent) => (
              <div key={agent.id} className="glass-card p-4 hover:bg-white/5 transition-all">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-2xl">{agent.icon}</span>
                  <div className="flex items-center gap-1.5">
                    <span className={`status-dot ${agent.status}`} />
                    <span className="text-[10px] text-neutral-500">{agent.status}</span>
                  </div>
                </div>
                <div className="font-semibold text-neutral-200 mb-0.5">{agent.name}</div>
                <div className="text-[10px] text-neutral-500 mb-3">{agent.role}</div>
                <div className="h-px bg-white/5 mb-3" />
                <div className="space-y-1 text-xs">
                  <div className="flex justify-between">
                    <span className="text-neutral-600">Tarefas</span>
                    <span className="text-neutral-300">{agent.tasksCompleted.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-600">Falhas</span>
                    <span className="text-neutral-300">{agent.tasksFailed}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-600">Sucesso</span>
                    <span className={`font-semibold ${agent.successRate >= 99 ? 'text-emerald-400' : 'text-amber-400'}`}>{agent.successRate}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-600">Latência</span>
                    <span className="text-neutral-300 font-mono">{agent.avgLatencyMs}ms</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-600">Modelo</span>
                    <span className="text-neutral-300 font-mono text-[10px]">{agent.modelUsed}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-600">Uptime</span>
                    <span className="text-neutral-300">{(agent.uptimeHours / 24).toFixed(0)} dias</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
