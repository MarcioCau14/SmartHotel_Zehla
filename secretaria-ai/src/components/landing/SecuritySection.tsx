'use client';

import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import {
  Shield,
  Check,
  Lock,
  FileCheck,
  ShieldCheck,
  AlertCircle,
} from 'lucide-react';

const securityFeatures = [
  { icon: Lock, label: 'Criptografia', desc: 'AES-256', color: 'text-emerald-400' },
  { icon: FileCheck, label: 'LGPD', desc: 'Compliant', color: 'text-purple-400' },
  { icon: ShieldCheck, label: 'Circuit Breaker', desc: 'Ativo', color: 'text-blue-400' },
  { icon: AlertCircle, label: 'Budget Guard', desc: 'R$47/mês', color: 'text-amber-400' },
];

const statusIndicators = [
  { label: 'Criptografia de ponta a ponta', status: 'Ativo', statusColor: 'text-emerald-400' },
  { label: 'Monitoramento 24/7', status: 'Ativo', statusColor: 'text-emerald-400' },
  { label: 'Backup automático', status: 'Ativo', statusColor: 'text-emerald-400' },
  { label: 'Auditoria de segurança', status: 'OK', statusColor: 'text-emerald-400' },
];

const highlights = [
  'LGPD compliant',
  'Circuit Breaker',
  'Budget Guard',
  'SLA 99.9%',
  'Criptografia de ponta a ponta',
  'Monitoramento contínuo',
];

export function SecuritySection() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-50px' });

  return (
    <section ref={ref} className="py-20 sm:py-28 bg-[#0a0a0a]">
      <div className="max-w-7xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center"
        >
          {/* Text side */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                <Shield className="w-5 h-5 text-emerald-400" />
              </div>
              <div>
                <h3 className="text-white font-bold text-xl">Segurança & Conformidade</h3>
                <span className="text-emerald-400 text-xs font-medium">Proteção enterprise</span>
              </div>
            </div>
            <p className="text-neutral-400 text-sm leading-relaxed mb-5">
              Dados criptografados, LGPD compliant, Circuit Breaker para proteção contra falhas e Budget Guard que controla gastos com IA. Sua pousada protegida com o mesmo nível de segurança de grandes empresas.
            </p>
            <div className="flex flex-wrap gap-2">
              {highlights.map((h) => (
                <span key={h} className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-white/[0.04] border border-white/[0.06] text-neutral-300 text-[11px]">
                  <Check className="w-3 h-3 text-emerald-400" />
                  {h}
                </span>
              ))}
            </div>
          </div>

          {/* Mockup side */}
          <div>
            <div className="bg-[#111] rounded-2xl border border-white/[0.06] p-4 space-y-3">
              <div className="text-white text-xs font-medium mb-3">Segurança & Conformidade Enterprise</div>

              {/* Security icons grid */}
              <div className="grid grid-cols-2 gap-3 mb-3">
                {securityFeatures.map((item) => (
                  <div key={item.label} className="bg-white/[0.03] rounded-xl p-3 border border-white/[0.05]">
                    <item.icon className={`w-5 h-5 ${item.color} mb-2`} />
                    <div className="text-white text-[11px] font-medium">{item.label}</div>
                    <div className="text-neutral-500 text-[9px]">{item.desc}</div>
                  </div>
                ))}
              </div>

              {/* Status indicators */}
              <div className="space-y-2">
                {statusIndicators.map((item) => (
                  <div key={item.label} className="flex items-center justify-between p-2 bg-white/[0.02] rounded-lg border border-white/[0.04]">
                    <div className="text-neutral-400 text-[10px]">{item.label}</div>
                    <div className={`text-[10px] font-medium ${item.statusColor}`}>{item.status}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}