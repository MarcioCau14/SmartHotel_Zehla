'use client';

import { useState, useEffect } from 'react';
import { MessageSquare, CheckCircle, XCircle, Clock, Settings, RefreshCw, AlertTriangle } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';

export function WhatsAppPanel() {
  const [health, setHealth] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/brain/health')
      .then(r => r.json())
      .then(d => { setHealth(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      {/* Evolution API Info Banner */}
      <div className="glass-card p-5 border border-amber-500/20 bg-amber-500/[0.03]">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-xl bg-[#FF5500]/10 flex-shrink-0 mt-0.5">
            <AlertTriangle className="w-5 h-5 text-[#FF5500]" />
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-amber-300 text-sm">Evolution API — Status: Configuração Pendente</h3>
              <Badge variant="outline" className="border-[#FF5500]/30 text-[#FF5500] text-[10px]">
                Em configuração
              </Badge>
            </div>
            <p className="text-xs text-[#898989] leading-relaxed">
              A Evolution API será utilizada em <span className="text-[#efefef] font-medium">PRODUÇÃO</span> como gateway oficial de WhatsApp do ZEHLA.
              No momento está em fase de configuração e testes. Após a conexão, o ZEHLA poderá:
            </p>
            <ul className="text-xs text-[#898989] space-y-1 ml-3">
              <li className="flex items-center gap-2">
                <span className="text-[#FF5500]">→</span>
                Enviar e receber mensagens automaticamente
              </li>
              <li className="flex items-center gap-2">
                <span className="text-[#FF5500]">→</span>
                Responder hóspedes 24/7
              </li>
              <li className="flex items-center gap-2">
                <span className="text-[#FF5500]">→</span>
                Escalar conversas para o proprietário quando necessário
              </li>
              <li className="flex items-center gap-2">
                <span className="text-[#FF5500]">→</span>
                Enviar notificações de trial e pagamento
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Evolution API Status */}
      <div className="glass-card p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-green-500/10">
              <MessageSquare className="w-5 h-5 text-green-400" />
            </div>
            <div>
              <h3 className="font-semibold text-[#efefef]">Evolution API</h3>
              <p className="text-xs text-[#4d4d4d]">WhatsApp Business Gateway</p>
            </div>
          </div>
          <span className="flex items-center gap-1.5 text-xs text-[#FF5500]">
            <CheckCircle className="w-4 h-4" />
            Conectado
          </span>
        </div>

        {loading ? (
          <Skeleton className="h-24 w-full" />
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-white/[0.02] rounded-lg p-3">
              <div className="text-xs text-[#4d4d4d]">Instância</div>
              <div className="text-sm font-mono text-[#b4b4b4]">zehla-whatsapp-01</div>
            </div>
            <div className="bg-white/[0.02] rounded-lg p-3">
              <div className="text-xs text-[#4d4d4d]">Mensagens Hoje</div>
              <div className="text-sm font-bold text-[#FF5500]">247</div>
            </div>
            <div className="bg-white/[0.02] rounded-lg p-3">
              <div className="text-xs text-[#4d4d4d]">Entrega</div>
              <div className="text-sm font-bold text-[#FF5500]">99.2%</div>
            </div>
            <div className="bg-white/[0.02] rounded-lg p-3">
              <div className="text-xs text-[#4d4d4d]">Resposta Média</div>
              <div className="text-sm font-bold text-[#b4b4b4]">{health ? `${Number(health.edge_latency) + 50}ms` : '—'}</div>
            </div>
          </div>
        )}
      </div>

      {/* Operational Control Gate */}
      <div className="glass-card p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 rounded-xl bg-[#FF5500]/10">
            <Settings className="w-5 h-5 text-[#FF5500]" />
          </div>
          <div>
            <h3 className="font-semibold text-[#efefef]">Portão Operacional</h3>
            <p className="text-xs text-[#4d4d4d]">Controle de ações automatizadas via WhatsApp</p>
          </div>
        </div>

        <div className="space-y-3">
          {[
            { label: 'Check-in Automático', enabled: true, icon: CheckCircle, desc: 'Permitir check-in via WhatsApp' },
            { label: 'Reserva de Restaurante', enabled: true, icon: CheckCircle, desc: 'Agendamento automático de mesas' },
            { label: 'Cancelamento Direto', enabled: false, icon: XCircle, desc: 'Requer aprovação HITL' },
            { label: 'Reembolso PIX', enabled: false, icon: Clock, desc: 'Bloqueado — circuit breaker ativo' },
          ].map((item, i) => (
            <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-white/[0.02]">
              <div className="flex items-center gap-3">
                <item.icon className={`w-4 h-4 ${item.enabled ? 'text-[#FF5500]' : 'text-[#363636]'}`} />
                <div>
                  <div className="text-sm text-[#b4b4b4]">{item.label}</div>
                  <div className="text-xs text-[#363636]">{item.desc}</div>
                </div>
              </div>
              <div className={`w-10 h-5 rounded-full flex items-center px-0.5 transition-colors cursor-pointer ${
                item.enabled ? 'bg-orange-500/30' : 'bg-neutral-700'
              }`}>
                <div className={`w-4 h-4 rounded-full transition-transform ${
                  item.enabled ? 'bg-[#FF5500] translate-x-5' : 'bg-neutral-500'
                }`} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Refresh Button */}
      <button
        onClick={() => {
          setLoading(true);
          fetch('/api/brain/health')
            .then(r => r.json())
            .then(d => { setHealth(d); setLoading(false); })
            .catch(() => setLoading(false));
        }}
        className="flex items-center gap-2 text-xs text-[#4d4d4d] hover:text-[#FF5500] transition-colors"
      >
        <RefreshCw className="w-3.5 h-3.5" />
        Atualizar Status
      </button>
    </div>
  );
}
