'use client';

import { useState, useEffect, useMemo } from 'react';
import {
  Shield,
  Zap,
  Lock,
  Clock,
  Terminal,
  FileCheck } from
'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';

export function SecurityPanel() {
  const [security, setSecurity] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/security').
    then((r) => r.json()).
    then((d) => {
      setSecurity(d);
      setLoading(false);
    }).
    catch(() => setLoading(false));
  }, []);

  const cb = security?.circuit_breaker as Record<string, unknown> | undefined;
  const services = cb?.services as Array<Record<string, unknown>> || [];
  const hitl = security?.hitl_pending as Array<Record<string, unknown>> || [];
  const verdicts = security?.guardian_verdicts as Record<string, number> || {};
  const guardian = security?.guardian_agent as Record<string, unknown> | undefined;
  const capabilities = guardian?.capabilities as string[] || [];

  return (
    <div className="space-y-6">
      {/* Guardian Anti-Hacker Agent */}
      {loading ?
      <Skeleton className="h-64 w-full rounded-xl" /> :
      guardian &&
      <div className="glass-card p-6 border border-[#F97316]/20 bg-[#F97316]/[0.02]">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-[#F97316]/10">
                <Shield className="w-6 h-6 text-[#F97316]" />
              </div>
              <div>
                <h3 className="font-semibold text-[#efefef] flex items-center gap-2">
                  {String(guardian.name)}
                  <Badge variant="outline" className="border-[#F97316]/30 text-[#F97316] text-[10px]">
                    v{String(guardian.version)}
                  </Badge>
                </h3>
                <p className="text-xs text-[#4d4d4d] mt-0.5">Agente de segurança avançado — Proteção em tempo real</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full animate-zehla-pulse ${guardian.status === 'active' ? 'bg-[#F97316]' : 'bg-red-400'}`} />
              <Badge variant="outline" className={`border-0 text-[10px] ${guardian.status === 'active' ? 'bg-[#F97316]/10 text-[#F97316]' : 'bg-red-500/20 text-red-400'}`}>
                {guardian.status === 'active' ? 'Ativo' : 'Inativo'}
              </Badge>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
            <div className="bg-white/[0.02] rounded-lg p-3">
              <div className="text-[10px] text-[#4d4d4d]">Ameaças Bloqueadas Hoje</div>
              <div className="text-lg font-bold text-red-400">{Number(guardian.threats_blocked_today || 0)}</div>
            </div>
            <div className="bg-white/[0.02] rounded-lg p-3">
              <div className="text-[10px] text-[#4d4d4d]">Ameaças Ativas</div>
              <div className="text-lg font-bold text-[#F97316]">{Number(guardian.active_threats || 0)}</div>
            </div>
            <div className="bg-white/[0.02] rounded-lg p-3">
              <div className="text-[10px] text-[#4d4d4d]">Último Scan</div>
              <div className="text-xs font-mono text-[#b4b4b4]">
                {guardian.last_scan ?
              new Date(String(guardian.last_scan)).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) :
              '—'}
              </div>
            </div>
            <div className="bg-white/[0.02] rounded-lg p-3">
              <div className="text-[10px] text-[#4d4d4d]">Capacidades</div>
              <div className="text-xs font-bold text-[#efefef]">{capabilities.length}</div>
            </div>
          </div>

          <div className="text-[10px] text-[#4d4d4d] mb-2 font-medium">Capacidades do Guardião</div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
            {capabilities.map((cap, i) =>
          <div key={i} className="flex items-center gap-2 p-2 rounded-lg bg-white/[0.02]">
                <Shield className="w-3 h-3 text-[#F97316] flex-shrink-0" />
                <span className="text-[10px] text-[#898989]">{cap}</span>
              </div>
          )}
          </div>
        </div>
      }

      {/* ZDR Shield */}
      {loading ?
      <Skeleton className="h-48 w-full rounded-xl" /> :

      <>
          <div className="glass-card p-5">
            <h3 className="text-sm font-semibold text-[#b4b4b4] mb-4 flex items-center gap-2">
              <Shield className="w-4 h-4 text-[#F97316]" />
              ZDR Shield Status
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
            {
              label: 'ZDR Status',
              value: String(security?.zdr_status || 'unknown'),
              ok: security?.zdr_status === 'active'
            },
            {
              label: 'ZDR Uptime',
              value: String(security?.zdr_uptime as string || '—'),
              ok: true
            },
            {
              label: 'LGPD Compliant',
              value: security?.lgpd_compliant ? 'Sim' : 'Não',
              ok: Boolean(security?.lgpd_compliant)
            },
            {
              label: 'PCI DSS Compliant',
              value: security?.pci_compliant ? 'Sim' : 'Não',
              ok: Boolean(security?.pci_compliant)
            },
            {
              label: 'Veredictos Safe',
              value: String(verdicts.safe || 0),
              ok: true
            },
            {
              label: 'Veredictos Review',
              value: String(verdicts.review || 0),
              ok: (verdicts.review || 0) < 50
            },
            {
              label: 'Veredictos Blocked',
              value: String(verdicts.blocked || 0),
              ok: (verdicts.blocked || 0) < 20
            },
            {
              label: 'Último Audit LGPD',
              value: security?.lgpd_last_audit ?
              new Date(String(security.lgpd_last_audit)).toLocaleDateString('pt-BR') :
              '—',
              ok: true
            }].
            map((item, i) =>
            <div key={i} className="bg-white/[0.02] rounded-lg p-3">
                  <div className="text-[10px] text-[#4d4d4d]">{item.label}</div>
                  <div className={`text-sm font-mono font-bold ${item.ok ? 'text-[#F97316]' : 'text-red-400'}`}>
                    {item.value}
                  </div>
                </div>
            )}
            </div>
          </div>

          {/* HITL Pending Approvals */}
          <div className="glass-card p-5">
            <h3 className="text-sm font-semibold text-[#b4b4b4] mb-4 flex items-center gap-2">
              <Lock className="w-4 h-4 text-[#F97316]" />
              HITL — Aprovações Pendentes ({useMemo(() => hitl.filter((h: Record<string, unknown>) => h.status as string === 'pending_review'), [Record]).length})
            </h3>
            <div className="space-y-2">
              {hitl.map((item: Record<string, unknown>, i: number) =>
            <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-white/[0.02] hover:bg-white/[0.04] transition-colors">
                  <div className="flex items-center gap-3">
                    <span
                  className={`w-2 h-2 rounded-full ${
                  item.status as string === 'pending_review' ? 'bg-amber-400 animate-zehla-pulse' : 'bg-[#F97316]'}`
                  } />
                
                    <div>
                      <div className="text-sm text-[#b4b4b4]">
                        {String(item.type).replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())}
                      </div>
                      <div className="text-[10px] text-[#4d4d4d]">
                        {item.guest ? String(item.guest) : '—'}
                        {item.amount ? ` — ${String(item.amount)}` : ''}
                      </div>
                    </div>
                  </div>
                  <Badge
                className={`border-0 text-[10px] ${
                item.status as string === 'pending_review' ?
                'bg-[#F97316]/10 text-[#F97316]' :
                'bg-[#F97316]/10 text-[#F97316]'}`
                }>
                
                    {item.status as string === 'pending_review' ? 'Revisar' : 'Aprovado'}
                  </Badge>
                </div>
            )}
              {hitl.length === 0 &&
            <div className="text-center py-8 text-[#363636] text-xs">Nenhuma aprovação pendente</div>
            }
            </div>
          </div>

          {/* Circuit Breaker Status */}
          <div className="glass-card p-5">
            <h3 className="text-sm font-semibold text-[#b4b4b4] mb-4 flex items-center gap-2">
              <Zap className="w-4 h-4 text-[#F97316]" />
              Circuit Breaker
              <Badge className="border-0 text-[10px] bg-[#F97316]/10 text-[#F97316] ml-auto">
                {cb?.status as string || 'closed'}
              </Badge>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {services.map((svc: Record<string, unknown>, i: number) =>
            <div key={i} className="bg-white/[0.02] rounded-lg p-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] text-[#4d4d4d] font-mono">{String(svc.name)}</span>
                    <span
                  className={`w-2 h-2 rounded-full ${
                  svc.status as string === 'healthy' ? 'bg-[#F97316]' : 'bg-amber-400'}`
                  } />
                
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-[#363636]">Latência</span>
                    <span
                  className={`text-xs font-mono ${
                  svc.latency_ms as number > 200 ? 'text-[#F97316]' : 'text-[#b4b4b4]'}`
                  }>
                  
                      {String(svc.latency_ms)}ms
                    </span>
                  </div>
                </div>
            )}
            </div>
            {!!cb?.last_trigger &&
          <div className="mt-3 text-[10px] text-[#363636] flex items-center gap-1">
                <Clock className="w-3 h-3" />
                Último trigger:{' '}
                {new Date(String(cb.last_trigger)).toLocaleString('pt-BR')}
              </div>
          }
          </div>

          {/* Security Events List */}
          <div className="glass-card p-5">
            <h3 className="text-sm font-semibold text-[#b4b4b4] mb-4 flex items-center gap-2">
              <Terminal className="w-4 h-4 text-red-400" />
              Eventos de Segurança em Tempo Real
            </h3>
            <div className="space-y-2 max-h-[400px] overflow-y-auto zehla-scroll">
              {(security?.alerts as Array<any>)?.map((alert) =>
            <div key={alert.id} className="flex flex-col p-3 rounded-lg bg-white/[0.02] border border-[#2e2e2e] hover:bg-white/[0.04] transition-colors">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${
                  alert.severity === 'CRITICAL' ? 'bg-red-500 animate-pulse' :
                  alert.severity === 'HIGH' ? 'bg-orange-500' :
                  'bg-amber-400'}`
                  } />
                      <span className="text-xs font-bold text-[#efefef]">{alert.type}</span>
                    </div>
                    <Badge variant="outline" className={`text-[9px] border-0 ${
                alert.severity === 'CRITICAL' ? 'bg-red-500/20 text-red-400' :
                'bg-neutral-500/20 text-[#898989]'}`
                }>
                      {alert.severity}
                    </Badge>
                  </div>
                  <div className="text-[10px] text-[#4d4d4d] flex items-center gap-2 mb-2">
                    <span className="font-mono text-[#F97316]">Tenant: {alert.tenant}</span>
                    <span>•</span>
                    <span>{new Date(alert.timestamp).toLocaleString('pt-BR')}</span>
                  </div>
                  <div className="bg-black/20 rounded p-2 text-[9px] font-mono text-[#898989] break-all">
                    {JSON.stringify(alert.details)}
                  </div>
                </div>
            )}
              {(!security?.alerts || (security?.alerts as any[]).length === 0) &&
            <div className="text-center py-12 text-[#363636]">
                  <Shield className="w-8 h-8 mx-auto mb-2 opacity-20" />
                  <p className="text-xs">Nenhuma ameaça detectada. Sistema nominal.</p>
                </div>
            }
            </div>
          </div>

          {/* Compliance Badges */}
          <div className="glass-card p-5">
            <h3 className="text-sm font-semibold text-[#b4b4b4] mb-4 flex items-center gap-2">
              <FileCheck className="w-4 h-4 text-[#F97316]" />
              Compliance & Attestations
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {[
            { name: 'LGPD v2', date: 'Maio 2026' },
            { name: 'GDPR Baseline', date: 'Maio 2026' },
            { name: 'ISO 27001 Ready', date: 'Sim' }].
            map((item, i) =>
            <div key={i} className="flex items-center gap-2 p-2 rounded-lg bg-white/[0.02] border border-white/5">
                  <FileCheck className="w-3 h-3 text-[#F97316]" />
                  <div>
                    <div className="text-[10px] text-[#efefef]">{item.name}</div>
                    <div className="text-[8px] text-[#4d4d4d]">{item.date}</div>
                  </div>
                </div>
            )}
            </div>
          </div>
        </>
      }
    </div>);

}