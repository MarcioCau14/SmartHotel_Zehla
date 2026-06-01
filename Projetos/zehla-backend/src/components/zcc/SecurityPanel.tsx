'use client';

import { useState, useEffect, useMemo } from 'react';
import {
  Shield,
  Zap,
  Lock,
  Clock,
  Terminal,
  FileCheck
} from 'lucide-react';
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
      <div className="glass-card p-6 border border-[#FF5500]/20 bg-[#FF5500]/[0.02] shadow-[0_0_20px_rgba(255,85,0,0.06)] backdrop-blur-md">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-[#FF5500]/10 border border-[#FF5500]/20 shadow-[0_0_10px_rgba(255,85,0,0.1)]">
                <Shield className="w-6 h-6 text-[#FF5500]" />
              </div>
              <div>
                <h3 className="font-semibold text-[#efefef] flex items-center gap-2">
                  {String(guardian.name)}
                  <Badge variant="outline" className="border-[#FF5500]/30 text-[#FF5500] text-[10px] px-1.5 font-mono">
                    v{String(guardian.version)}
                  </Badge>
                </h3>
                <p className="text-xs text-[#5f5f5f] mt-0.5">Agente de segurança avançado — Proteção em tempo real e monitoramento ativo</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full animate-zehla-pulse ${guardian.status === 'active' ? 'bg-[#FF5500]' : 'bg-red-400'}`} />
              <Badge variant="outline" className={`border-0 text-[10px] ${guardian.status === 'active' ? 'bg-[#FF5500]/10 text-[#FF5500]' : 'bg-red-500/20 text-red-400'}`}>
                {guardian.status === 'active' ? 'Ativo' : 'Inativo'}
              </Badge>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
            <div className="bg-[#050505]/40 border border-white/5 rounded-lg p-3">
              <div className="text-[10px] text-[#5f5f5f]">Ameaças Bloqueadas Hoje</div>
              <div className="text-lg font-bold text-red-400 font-mono mt-0.5">{Number(guardian.threats_blocked_today || 0)}</div>
            </div>
            <div className="bg-[#050505]/40 border border-white/5 rounded-lg p-3">
              <div className="text-[10px] text-[#5f5f5f]">Ameaças Ativas</div>
              <div className="text-lg font-bold text-[#FF5500] font-mono mt-0.5">{Number(guardian.active_threats || 0)}</div>
            </div>
            <div className="bg-[#050505]/40 border border-white/5 rounded-lg p-3">
              <div className="text-[10px] text-[#5f5f5f]">Último Scan</div>
              <div className="text-xs font-mono text-[#b4b4b4] mt-1">
                {guardian.last_scan ?
              new Date(String(guardian.last_scan)).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) :
              '—'}
              </div>
            </div>
            <div className="bg-[#050505]/40 border border-white/5 rounded-lg p-3">
              <div className="text-[10px] text-[#5f5f5f]">Capacidades</div>
              <div className="text-xs font-bold text-[#efefef] font-mono mt-1">{capabilities.length}</div>
            </div>
          </div>

          <div className="text-[10px] text-[#5f5f5f] mb-2 font-medium tracking-wide">CAPACIDADES DO GUARDIÃO</div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
            {capabilities.map((cap, i) =>
          <div key={i} className="flex items-center gap-2 p-2 rounded-lg bg-[#050505]/40 border border-white/5">
                <Shield className="w-3 h-3 text-[#FF5500] flex-shrink-0" />
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
          <div className="glass-card p-5 border border-white/5 bg-[#050505]">
            <h3 className="text-sm font-semibold text-[#b4b4b4] mb-4 flex items-center gap-2">
              <Shield className="w-4 h-4 text-[#FF5500]" />
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
            <div key={i} className="bg-white/[0.01] border border-white/5 rounded-lg p-3 hover:bg-white/[0.03] transition-all duration-200">
                  <div className="text-[10px] text-[#5f5f5f]">{item.label}</div>
                  <div className={`text-sm font-mono font-bold mt-0.5 ${item.ok ? 'text-[#FF5500]' : 'text-red-400'}`}>
                    {item.value}
                  </div>
                </div>
            )}
            </div>
          </div>

          {/* HITL Pending Approvals */}
          <div className="glass-card p-5 border border-white/5 bg-[#050505]">
            <h3 className="text-sm font-semibold text-[#b4b4b4] mb-4 flex items-center gap-2">
              <Lock className="w-4 h-4 text-[#FF5500]" />
              HITL — Aprovações Pendentes ({useMemo(() => hitl.filter((h: Record<string, unknown>) => h.status as string === 'pending_review'), [hitl]).length})
            </h3>
            <div className="space-y-2">
              {hitl.map((item: Record<string, unknown>, i: number) =>
            <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-white/[0.01] border border-white/5 hover:bg-white/[0.03] transition-all duration-200">
                  <div className="flex items-center gap-3">
                    <span
                  className={`w-2 h-2 rounded-full ${
                  item.status as string === 'pending_review' ? 'bg-amber-400 animate-zehla-pulse' : 'bg-[#FF5500]'}`
                  } />
                
                    <div>
                      <div className="text-sm text-[#b4b4b4] font-medium">
                        {String(item.type).replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())}
                      </div>
                      <div className="text-[10px] text-[#5f5f5f] font-mono mt-0.5">
                        {item.guest ? String(item.guest) : '—'}
                        {item.amount ? ` — ${String(item.amount)}` : ''}
                      </div>
                    </div>
                  </div>
                  <Badge
                    className={`border-0 text-[10px] font-mono px-2 py-0.5 ${
                    item.status as string === 'pending_review' ?
                    'bg-[#FF5500]/10 text-[#FF5500]' :
                    'bg-white/5 text-[#898989]'}`}
                  >
                    {item.status as string === 'pending_review' ? 'Revisar' : 'Aprovado'}
                  </Badge>
                </div>
            )}
              {hitl.length === 0 &&
            <div className="text-center py-8 text-[#363636] text-xs font-mono">Nenhuma aprovação pendente</div>
            }
            </div>
          </div>

          {/* Circuit Breaker Status */}
          <div className="glass-card p-5 border border-white/5 bg-[#050505]">
            <h3 className="text-sm font-semibold text-[#b4b4b4] mb-4 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-[#FF5500]" />
                Circuit Breaker
              </div>
              <Badge className="border border-[#FF5500]/30 text-[10px] font-mono bg-[#FF5500]/10 text-[#FF5500] px-2 py-0.5">
                {cb?.status as string || 'closed'}
              </Badge>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {services.map((svc: Record<string, unknown>, i: number) =>
            <div key={i} className="bg-white/[0.01] border border-white/5 rounded-lg p-3 hover:bg-white/[0.03] transition-all duration-200">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] text-[#b4b4b4] font-mono font-medium">{String(svc.name)}</span>
                    <span
                  className={`w-2 h-2 rounded-full ${
                  svc.status as string === 'healthy' ? 'bg-[#FF5500]' : 'bg-amber-400'}`
                  } />
                
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-[#5f5f5f]">Latência</span>
                    <span
                  className={`text-xs font-mono ${
                  (svc.latency_ms as number) > 200 ? 'text-[#FF5500]' : 'text-[#b4b4b4]'}`
                  }>
                      {String(svc.latency_ms)}ms
                    </span>
                  </div>
                </div>
            )}
            </div>
            {!!cb?.last_trigger &&
          <div className="mt-3 text-[10px] text-[#363636] flex items-center gap-1 font-mono">
                <Clock className="w-3 h-3" />
                Último trigger:{' '}
                {new Date(String(cb.last_trigger)).toLocaleString('pt-BR')}
              </div>
          }
          </div>

          {/* Security Events List */}
          <div className="glass-card p-5 border border-white/5 bg-[#050505]">
            <h3 className="text-sm font-semibold text-[#b4b4b4] mb-4 flex items-center gap-2">
              <Terminal className="w-4 h-4 text-red-500 animate-pulse" />
              Eventos de Segurança em Tempo Real
            </h3>
            <div className="space-y-3 max-h-[400px] overflow-y-auto zehla-scroll">
              {(security?.alerts as Array<any>)?.map((alert) => {
                const isCritical = alert.severity === 'CRITICAL';
                const isHigh = alert.severity === 'HIGH';
                return (
                  <div
                    key={alert.id}
                    className={`flex flex-col p-4 rounded-xl backdrop-blur-md transition-all duration-300 border ${
                      isCritical
                        ? 'border-red-500/30 shadow-[0_0_15px_rgba(239,68,68,0.12)] bg-red-950/[0.08] hover:border-red-500/50'
                        : 'border-white/5 bg-[#050505]/60 hover:border-white/10 hover:bg-[#050505]/80'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="relative flex h-2 w-2">
                          {isCritical && (
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75"></span>
                          )}
                          <span className={`relative inline-flex rounded-full h-2 w-2 ${
                            isCritical ? 'bg-red-500 animate-pulse' : isHigh ? 'bg-[#FF5500]' : 'bg-[#FFCC00]'
                          }`} />
                        </span>
                        <span className="text-xs font-bold font-mono tracking-tight text-[#efefef]">{alert.type}</span>
                      </div>
                      <Badge
                        variant="outline"
                        className={`text-[9px] font-mono tracking-wider border-0 px-2 py-0.5 rounded ${
                          isCritical
                            ? 'bg-red-500/10 text-red-400 border border-red-500/20'
                            : isHigh
                            ? 'bg-[#FF5500]/10 text-[#FF5500] border border-[#FF5500]/20'
                            : 'bg-[#FFCC00]/10 text-[#FFCC00] border border-[#FFCC00]/20'
                        }`}
                      >
                        {alert.severity}
                      </Badge>
                    </div>

                    <div className="text-[10px] font-mono text-[#5f5f5f] flex items-center gap-2 mb-2">
                      <span className="text-[#FF5500] font-semibold">Tenant: {alert.tenant}</span>
                      <span>•</span>
                      <span>{new Date(alert.timestamp).toLocaleString('pt-BR')}</span>
                    </div>

                    <div className="bg-[#050505] border border-white/5 rounded-lg p-3 text-[10px] font-mono text-[#898989] break-all leading-normal shadow-inner whitespace-pre-wrap">
                      {JSON.stringify(alert.details, null, 2)}
                    </div>
                  </div>
                );
              })}
              {(!security?.alerts || (security?.alerts as any[]).length === 0) &&
            <div className="text-center py-12 text-[#363636]">
                  <Shield className="w-8 h-8 mx-auto mb-2 opacity-20" />
                  <p className="text-xs font-mono">Nenhuma ameaça detectada. Sistema nominal.</p>
                </div>
            }
            </div>
          </div>

          {/* Compliance Badges */}
          <div className="glass-card p-5 border border-white/5 bg-[#050505]">
            <h3 className="text-sm font-semibold text-[#b4b4b4] mb-4 flex items-center gap-2">
              <FileCheck className="w-4 h-4 text-[#FF5500]" />
              Compliance & Attestations
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {[
            { name: 'LGPD v2', date: 'Maio 2026' },
            { name: 'GDPR Baseline', date: 'Maio 2026' },
            { name: 'ISO 27001 Ready', date: 'Sim' }].
            map((item, i) =>
            <div key={i} className="flex items-center gap-2 p-2.5 rounded-lg bg-white/[0.01] border border-white/5 hover:bg-white/[0.03] transition-all duration-200">
                  <FileCheck className="w-3.5 h-3.5 text-[#FF5500]" />
                  <div>
                    <div className="text-[10px] font-medium text-[#efefef]">{item.name}</div>
                    <div className="text-[8px] font-mono text-[#5f5f5f] mt-0.5">{item.date}</div>
                  </div>
                </div>
            )}
            </div>
          </div>
        </>
      }
    </div>);
}