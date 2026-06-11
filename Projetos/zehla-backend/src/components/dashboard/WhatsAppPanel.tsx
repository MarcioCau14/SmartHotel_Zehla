'use client';

import { useState, useEffect } from 'react';
import { MessageSquare, CheckCircle, XCircle, Clock, Settings, RefreshCw, AlertTriangle, Loader2 } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';

export function WhatsAppPanel() {
  const [session, setSession] = useState<{ state: string; qrCode?: string; instanceName?: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchSessionStatus = async () => {
    try {
      const token = localStorage.getItem('zehla-token');
      const res = await fetch('/api/zcc/evolution/instances', {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      const data = await res.json();
      if (res.ok) {
        setSession(data);
      }
    } catch (e) {
      console.error('Error fetching WhatsApp status:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleConnect = async () => {
    setActionLoading(true);
    try {
      const token = localStorage.getItem('zehla-token');
      const res = await fetch('/api/zcc/evolution/instances', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
      const data = await res.json();
      if (res.ok) {
        setSession(data);
      }
    } catch (e) {
      console.error('Error starting connection:', e);
    } finally {
      setActionLoading(false);
    }
  };

  useEffect(() => {
    fetchSessionStatus();
  }, []);

  const getStatusBadge = (state: string) => {
    switch (state) {
      case 'CONNECTED':
        return <Badge variant="outline" className="border-green-500/30 text-green-400 bg-green-500/5 text-[10px]">CONNECTED</Badge>;
      case 'AWAITING_QR':
        return <Badge variant="outline" className="border-amber-500/30 text-amber-400 bg-amber-500/5 text-[10px]">AWAITING QR CODE</Badge>;
      case 'FAILED':
        return <Badge variant="outline" className="border-red-500/30 text-red-400 bg-red-500/5 text-[10px]">FAILED</Badge>;
      default:
        return <Badge variant="outline" className="border-neutral-500/30 text-neutral-400 bg-neutral-500/5 text-[10px]">DISCONNECTED</Badge>;
    }
  };

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
              <h3 className="font-semibold text-amber-300 text-sm">Integração WhatsApp — FSM Operacional</h3>
              {session && getStatusBadge(session.state)}
            </div>
            <p className="text-xs text-[#898989] leading-relaxed">
              O ZEHLA opera integrado ao gateway da Evolution API seguindo uma FSM de estados rígidos para evitar vazamentos e falhas de conexões:
            </p>
            <ul className="text-xs text-[#898989] space-y-1 ml-3">
              <li className="flex items-center gap-2">
                <span className="text-[#FF5500]">→</span>
                <strong className="text-[#b4b4b4]">DISCONNECTED:</strong> Instância offline, sem sessão ativa.
              </li>
              <li className="flex items-center gap-2">
                <span className="text-[#FF5500]">→</span>
                <strong className="text-[#b4b4b4]">AWAITING_QR:</strong> QR Code aguardando leitura.
              </li>
              <li className="flex items-center gap-2">
                <span className="text-[#FF5500]">→</span>
                <strong className="text-[#b4b4b4]">CONNECTED:</strong> Sessão ativa rodando 24/7 com inteligência e clones de voz.
              </li>
              <li className="flex items-center gap-2">
                <span className="text-[#FF5500]">→</span>
                <strong className="text-[#b4b4b4]">FAILED:</strong> Falha de token ou expiração de login.
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Evolution API Status */}
      <div className="glass-card p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-[#FF5500]/10">
              <MessageSquare className="w-5 h-5 text-[#FF5500]" />
            </div>
            <div>
              <h3 className="font-semibold text-[#efefef]">Evolution API</h3>
              <p className="text-xs text-[#4d4d4d]">WhatsApp Business Gateway</p>
            </div>
          </div>
          <span className={`flex items-center gap-1.5 text-xs ${session?.state === 'CONNECTED' ? 'text-green-400' : 'text-[#FF5500]'}`}>
            {session?.state === 'CONNECTED' ? (
              <>
                <CheckCircle className="w-4 h-4 text-green-400" />
                Conectado
              </>
            ) : (
              <>
                <XCircle className="w-4 h-4 text-[#FF5500]" />
                Inativo
              </>
            )}
          </span>
        </div>

        {loading ? (
          <Skeleton className="h-24 w-full" />
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="bg-white/[0.02] rounded-lg p-3">
                <div className="text-xs text-[#4d4d4d]">Instância</div>
                <div className="text-sm font-mono text-[#b4b4b4] truncate">{session?.instanceName || '—'}</div>
              </div>
              <div className="bg-white/[0.02] rounded-lg p-3">
                <div className="text-xs text-[#4d4d4d]">FSM Estado</div>
                <div className="text-sm font-bold text-[#b4b4b4]">{session?.state || 'DISCONNECTED'}</div>
              </div>
              <div className="bg-white/[0.02] rounded-lg p-3">
                <div className="text-xs text-[#4d4d4d]">Status de Entrega</div>
                <div className="text-sm font-bold text-[#FF5500]">{session?.state === 'CONNECTED' ? '99.2%' : '0.0%'}</div>
              </div>
              <div className="bg-white/[0.02] rounded-lg p-3">
                <div className="text-xs text-[#4d4d4d]">Resposta Média</div>
                <div className="text-sm font-bold text-[#b4b4b4]">{session?.state === 'CONNECTED' ? '120ms' : '—'}</div>
              </div>
            </div>

            {session?.state === 'AWAITING_QR' && session?.qrCode && (
              <div className="flex flex-col items-center justify-center p-6 bg-white/[0.02] border border-[#2e2e2e] rounded-xl gap-4">
                <div className="text-sm text-[#b4b4b4] font-medium">Escaneie o QR Code abaixo para conectar:</div>
                <div className="p-3 bg-white rounded-lg">
                  <img src={session.qrCode} alt="WhatsApp QR Code" className="w-48 h-48" />
                </div>
                <div className="text-xs text-[#4d4d4d]">O QR Code atualiza automaticamente se expirar.</div>
              </div>
            )}

            {session?.state !== 'CONNECTED' && session?.state !== 'AWAITING_QR' && (
              <div className="flex justify-end mt-4">
                <button
                  onClick={handleConnect}
                  disabled={actionLoading}
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-[#FF5500] hover:bg-[#E04400] text-white text-xs font-semibold rounded-lg transition-all disabled:opacity-50"
                >
                  {actionLoading ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <RefreshCw className="w-3.5 h-3.5" />
                  )}
                  Conectar Instância
                </button>
              </div>
            )}
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
          fetchSessionStatus();
        }}
        className="flex items-center gap-2 text-xs text-[#4d4d4d] hover:text-[#FF5500] transition-colors"
      >
        <RefreshCw className="w-3.5 h-3.5" />
        Atualizar Status
      </button>
    </div>
  );
}
