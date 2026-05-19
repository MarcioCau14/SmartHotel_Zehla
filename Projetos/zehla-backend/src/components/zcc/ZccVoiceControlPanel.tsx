import React from 'react';
import { Mic, CheckCircle, ShieldAlert, BarChart } from 'lucide-react';


export const ZccVoiceControlPanel = () => {
  // Mock data para o painel de controle do ZCC
  const voiceStats = {
    totalActivePrints: 14,
    totalTokensUsed: 120500,
    blockedThreats: 3,
    avgLatency: 1.8, // s
    cacheHitRate: 64, // %
    conversionLift: 22, // % (Voz vs Texto)
  };

  const activeTenants = [
    { name: 'Pousada Brisa do Mar', plan: 'MAX', status: 'ACTIVE', lastUsed: 'Há 5 min', latency: '1.2s' },
    { name: 'Chalés da Serra', plan: 'PRO', status: 'ACTIVE', lastUsed: 'Há 22 min', latency: '2.4s' },
    { name: 'Hostel Central', plan: 'LITE', status: 'LOCKED', lastUsed: 'Nunca', latency: '-' },
  ];

  return (
    <div className="space-y-6">
      {/* KPIs Gerais */}
      <div className="glass-card p-5 border border-purple-500/10 bg-purple-500/[0.02]">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-[#b4b4b4] flex items-center gap-2">
            <Mic className="w-4 h-4 text-[#F97316]" />
            Monitoramento Global de Voz (Biometria & Performance)
          </h3>
          <div className="flex gap-4">
            <div className="text-right">
              <div className="text-[9px] text-[#4d4d4d] uppercase font-bold tracking-widest">Cache Hit Rate</div>
              <div className="text-sm font-mono text-emerald-400">{voiceStats.cacheHitRate}%</div>
            </div>
            <div className="text-right">
              <div className="text-[9px] text-[#4d4d4d] uppercase font-bold tracking-widest">Conversão Lift</div>
              <div className="text-sm font-mono text-[#F97316]">+{voiceStats.conversionLift}%</div>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white/[0.02] rounded-lg p-4 border border-white/5">
            <div className="text-[10px] text-[#4d4d4d] mb-1 uppercase tracking-tighter">Voice Prints Ativas</div>
            <div className="text-2xl font-bold text-[#F97316]">{voiceStats.totalActivePrints}</div>
          </div>
          <div className="bg-white/[0.02] rounded-lg p-4 border border-white/5">
            <div className="text-[10px] text-[#4d4d4d] mb-1 uppercase tracking-tighter">Latência Média (ASR-TTS)</div>
            <div className="text-2xl font-bold font-mono text-[#efefef]">{voiceStats.avgLatency}s</div>
          </div>
          <div className="bg-white/[0.02] rounded-lg p-4 border border-white/5">
            <div className="text-[10px] text-[#4d4d4d] mb-1 uppercase tracking-tighter">Tokens Consumidos</div>
            <div className="text-2xl font-bold font-mono text-[#b4b4b4]">{voiceStats.totalTokensUsed.toLocaleString()}</div>
          </div>
          <div className="bg-white/[0.02] rounded-lg p-4 border border-white/5">
            <div className="text-[10px] text-[#4d4d4d] mb-1 uppercase tracking-tighter">Bloqueios de Spoofing</div>
            <div className="text-2xl font-bold text-red-400">{voiceStats.blockedThreats}</div>
          </div>
        </div>
      </div>

      {/* Tabela de Inquilinos */}
      <div className="glass-card p-5">
        <h3 className="text-sm font-semibold text-[#b4b4b4] mb-4 flex items-center gap-2">
          <BarChart className="w-4 h-4 text-[#F97316]" />
          Uso por Propriedade (Métricas em Tempo Real)
        </h3>
        
        <div className="w-full overflow-hidden rounded-xl border border-[#2e2e2e]">
          <table className="w-full text-left text-sm">
            <thead className="bg-[#111] text-[#898989] text-xs">
              <tr>
                <th className="px-4 py-3 font-medium uppercase tracking-tighter text-[10px]">Propriedade</th>
                <th className="px-4 py-3 font-medium uppercase tracking-tighter text-[10px]">Plano</th>
                <th className="px-4 py-3 font-medium uppercase tracking-tighter text-[10px]">Status do Modelo</th>
                <th className="px-4 py-3 font-medium uppercase tracking-tighter text-[10px]">Última Latência</th>
                <th className="px-4 py-3 font-medium text-right uppercase tracking-tighter text-[10px]">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2e2e2e] bg-[#0A0A0A]">
              {activeTenants.map((tenant, idx) => (
                <tr key={idx} className="hover:bg-white/[0.02] transition-colors">
                  <td className="px-4 py-3 text-[#efefef] font-medium">{tenant.name}</td>
                  <td className="px-4 py-3">
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono ${tenant.plan === 'LITE' ? 'bg-zinc-800 text-zinc-400' : 'bg-orange-500/20 text-orange-400'}`}>
                      {tenant.plan}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {tenant.status === 'ACTIVE' ? (
                      <span className="flex items-center gap-1 text-[10px] text-emerald-400">
                        <CheckCircle className="w-3 h-3" /> Ativo e Seguro
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-[10px] text-zinc-500">
                        <ShieldAlert className="w-3 h-3" /> Bloqueado
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-xs text-[#b4b4b4] font-mono">{tenant.latency}</td>
                  <td className="px-4 py-3 text-right">
                    <button className="text-[10px] text-[#F97316] hover:underline uppercase font-bold">Inspecionar</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
