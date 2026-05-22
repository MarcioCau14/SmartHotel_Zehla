'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Shield, Zap, Crown, ArrowLeft, Loader2, Check, AlertTriangle } from 'lucide-react';
import Link from 'next/link';

interface TrialStatus {
  isTrial: boolean;
  isActive: boolean;
  trialEndsAt: string | null;
  daysRemaining: number;
  isExpired: boolean;
  plan: string;
}

const PLANS = [
  {
    key: 'LITE',
    name: 'Lite',
    price: 'R$ 248/mês',
    color: '#FF5500',
    features: ['WhatsApp ZEHLA 24/7', 'Dashboard Financeiro Básico', 'Gestão de Reservas', 'Suporte via E-mail', 'Até 8 quartos'],
    icon: Shield,
    borderClass: 'border-white/5 hover:border-[#FF5500]/30 shadow-[0_0_15px_rgba(0,0,0,0.4)] hover:shadow-[0_0_20px_rgba(255,85,0,0.05)]',
    btnClass: 'bg-white/[0.03] border border-white/5 hover:border-white/20 text-neutral-300 hover:text-white',
    iconBg: 'bg-[#FF5500]/10 text-[#FF5500]',
  },
  {
    key: 'PRO',
    name: 'Pro',
    price: 'R$ 448/mês',
    color: '#FF8800',
    features: ['Tudo do Lite', 'Precificação Dinâmica IA', 'Promoções Automáticas', 'Relatórios de Performance', 'Suporte Prioritário WhatsApp', 'Até 20 quartos'],
    icon: Zap,
    popular: true,
    borderClass: 'border-[#FF5500]/35 bg-[#FF5500]/[0.02] shadow-[0_0_25px_rgba(255,85,0,0.1)] hover:border-[#FF5500]/50 hover:shadow-[0_0_30px_rgba(255,85,0,0.15)]',
    btnClass: 'bg-gradient-to-r from-[#FF5500] to-[#FF8800] text-white shadow-[0_4px_15px_rgba(255,85,0,0.25)] hover:shadow-[0_4px_20px_rgba(255,85,0,0.35)] hover:scale-[1.02]',
    iconBg: 'bg-[#FF5500]/25 text-[#FF5500] shadow-[0_0_10px_rgba(255,85,0,0.2)]',
  },
  {
    key: 'MAX',
    name: 'Max',
    price: 'R$ 798/mês',
    color: '#00FF88',
    features: ['Tudo do Pro', 'Zehla Control Center (ZCC)', 'Multi-propriedades', 'Gestor de Conta Dedicado', 'Quartos ilimitados'],
    icon: Crown,
    borderClass: 'border-white/5 hover:border-[#00FF88]/30 shadow-[0_0_15px_rgba(0,0,0,0.4)] hover:shadow-[0_0_20px_rgba(0,255,136,0.05)]',
    btnClass: 'bg-white/[0.03] border border-white/5 hover:border-white/20 text-neutral-300 hover:text-white hover:bg-[#00FF88]/5 hover:border-[#00FF88]/30',
    iconBg: 'bg-[#00FF88]/10 text-[#00FF88]',
  },
];

export default function UpgradePage() {
  const router = useRouter();
  const [trialStatus, setTrialStatus] = useState<TrialStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [processingPlan, setProcessingPlan] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/billing/subscription')
      .then(r => r.json())
      .then(data => {
        setTrialStatus(data.subscription);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const handleUpgrade = async (planKey: string) => {
    setProcessingPlan(planKey);
    try {
      const res = await fetch('/api/billing/subscription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'create_checkout', planKey }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      }
    } catch {
      setProcessingPlan(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#050505]">
        <Loader2 className="w-8 h-8 text-[#FF5500] animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050505] text-[#b4b4b4] relative overflow-hidden flex flex-col">
      {/* Background glowing aura */}
      <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-[#FF5500]/[0.03] via-transparent to-transparent pointer-events-none z-0" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-[radial-gradient(circle_at_bottom_left,_var(--tw-gradient-stops))] from-[#00FF88]/[0.02] via-transparent to-transparent pointer-events-none z-0" />

      {/* Header */}
      <header className="border-b border-white/5 px-4 py-4 backdrop-blur-md z-10 shrink-0">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <button onClick={() => router.push('/cliente/painel')} className="flex items-center gap-2 text-neutral-500 hover:text-neutral-200 transition-colors text-sm font-medium">
            <ArrowLeft className="w-4 h-4" />
            Voltar ao painel
          </button>
          <div className="flex items-center gap-2 group">
            <Shield className="w-5 h-5 text-[#FF5500] group-hover:rotate-[5deg] transition-transform" />
            <span className="font-bold text-sm text-[#fafafa] tracking-wider">ZEHLA</span>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-12 z-10 flex-1 overflow-y-auto">
        {/* Trial Status Banner */}
        {trialStatus?.isExpired && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 p-4 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center gap-3 shadow-[0_0_15px_rgba(239,68,68,0.05)]"
          >
            <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0" />
            <div>
              <p className="text-sm font-bold text-red-400">Seu trial de 7 dias expirou</p>
              <p className="text-xs text-neutral-400 mt-1">Escolha um plano abaixo para continuar usando o ZEHLA com todas as funcionalidades.</p>
            </div>
          </motion.div>
        )}

        {trialStatus?.isTrial && !trialStatus.isExpired && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 p-4 rounded-2xl bg-[#FF5500]/10 border border-[#FF5500]/25 flex items-center gap-3 shadow-[0_0_15px_rgba(255,85,0,0.05)]"
          >
            <Zap className="w-5 h-5 text-[#FF5500] flex-shrink-0 animate-pulse" />
            <div>
              <p className="text-sm font-bold text-[#FF5500]">
                {trialStatus.daysRemaining} {trialStatus.daysRemaining === 1 ? 'dia restante' : 'dias restantes'} no trial
              </p>
              <p className="text-xs text-neutral-400 mt-1">Aproveite para explorar o ZEHLA. Faça upgrade quando estiver pronto.</p>
            </div>
          </motion.div>
        )}

        {/* Title */}
        <div className="text-center mb-16">
          <h1 className="text-3xl font-black text-white mb-3 tracking-tight">Escolha seu plano</h1>
          <p className="text-neutral-500 text-sm">Desbloqueie o poder total do cérebro ZEHLA para sua pousada</p>
        </div>

        {/* Plans Grid */}
        <div className="grid md:grid-cols-3 gap-6 items-stretch">
          {PLANS.map((plan) => {
            const Icon = plan.icon;
            return (
              <motion.div
                key={plan.key}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: PLANS.findIndex(p => p.key === plan.key) * 0.1, duration: 0.4 }}
                className={`relative rounded-2xl border p-6 flex flex-col bg-[#0a0a0c]/60 backdrop-blur-md transition-all duration-300 ${plan.borderClass}`}
              >
                {plan.popular && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-gradient-to-r from-[#FF5500] to-[#FF8800] text-white text-[10px] font-black uppercase tracking-wider shadow-[0_0_10px_rgba(255,85,0,0.3)]">
                    Mais Escolhido
                  </div>
                )}

                <div className="flex items-center gap-3 mb-6 shrink-0">
                  <div className={`p-2.5 rounded-xl transition-all duration-300 shrink-0 ${plan.iconBg}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-white text-base tracking-wide">{plan.name}</h3>
                    <p className="text-lg font-black mt-0.5 tracking-tight" style={{ color: plan.color }}>{plan.price}</p>
                  </div>
                </div>

                <ul className="space-y-3.5 mb-8 flex-1">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-2.5 text-xs text-neutral-400 leading-normal">
                      <Check className="w-4 h-4 text-[#00FF88] flex-shrink-0 mt-0.5" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                <button
                  onClick={() => handleUpgrade(plan.key)}
                  disabled={processingPlan === plan.key}
                  className={`w-full py-3 rounded-xl text-xs font-bold tracking-wide uppercase transition-all duration-300 shrink-0 ${plan.btnClass} disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  {processingPlan === plan.key ? (
                    <span className="flex items-center justify-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Redirecionando...
                    </span>
                  ) : (
                    'Começar agora'
                  )}
                </button>
              </motion.div>
            );
          })}
        </div>

        {/* Footer note */}
        <p className="text-center text-xs text-neutral-600 mt-16 font-medium">
          Assinatura 100% Fixa — Taxa Zero / Sem Comissões. Cancele quando quiser.
        </p>
      </main>
    </div>
  );
}
