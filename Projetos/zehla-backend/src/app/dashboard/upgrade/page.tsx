'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Shield, Zap, Crown, ArrowLeft, Loader2, Check, AlertTriangle } from 'lucide-react';

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
    price: 'R$ 49,90/mês',
    color: '#25D366',
    features: ['Até 8 quartos', 'WhatsApp Bot básico', 'Connect page', 'Dashboard completo', '100 msgs IA/mês'],
    icon: Shield,
  },
  {
    key: 'PRO',
    name: 'Pro',
    price: 'R$ 99,90/mês',
    color: '#F97316',
    features: ['Até 20 quartos', 'WhatsApp Bot IA', 'Connect page + temas', 'Revenue Management', 'CRM básico', '1.000 msgs IA/mês'],
    icon: Zap,
    popular: true,
  },
  {
    key: 'MAX',
    name: 'Max',
    price: 'R$ 199,90/mês',
    color: '#8B5CF6',
    features: ['Quartos ilimitados', 'WhatsApp Bot IA avançado', 'Connect page + afiliados', 'Revenue Management + IA', 'CRM completo', 'Channel Manager', 'IA ilimitada'],
    icon: Crown,
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
      <div className="min-h-screen flex items-center justify-center bg-[#0f0f0f]">
        <Loader2 className="w-8 h-8 text-[#F97316] animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0f0f0f] text-[#b4b4b4]">
      {/* Header */}
      <header className="border-b border-[#2e2e2e] px-4 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <button onClick={() => router.push('/dashboard')} className="flex items-center gap-2 text-[#898989] hover:text-[#efefef] transition-colors text-sm">
            <ArrowLeft className="w-4 h-4" />
            Voltar ao painel
          </button>
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-[#F97316]" />
            <span className="font-bold text-sm text-[#fafafa]">ZEHLA</span>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-12">
        {/* Trial Status Banner */}
        {trialStatus?.isExpired && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 p-4 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center gap-3"
          >
            <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-red-400">Seu trial de 7 dias expirou</p>
              <p className="text-xs text-[#898989] mt-1">Escolha um plano abaixo para continuar usando o ZEHLA com todas as funcionalidades.</p>
            </div>
          </motion.div>
        )}

        {trialStatus?.isTrial && !trialStatus.isExpired && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 p-4 rounded-2xl bg-[#F97316]/10 border border-[#F97316]/20 flex items-center gap-3"
          >
            <Zap className="w-5 h-5 text-[#F97316] flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-[#F97316]">
                {trialStatus.daysRemaining} dias restantes no trial
              </p>
              <p className="text-xs text-[#898989] mt-1">Aproveite para explorar o ZEHLA. Faça upgrade quando estiver pronto.</p>
            </div>
          </motion.div>
        )}

        {/* Title */}
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-[#fafafa] mb-3">Escolha seu plano</h1>
          <p className="text-[#898989]">Desbloqueie o poder total do cérebro ZEHLA para sua pousada</p>
        </div>

        {/* Plans Grid */}
        <div className="grid md:grid-cols-3 gap-6">
          {PLANS.map((plan) => {
            const Icon = plan.icon;
            return (
              <motion.div
                key={plan.key}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: PLANS.indexOf(plan) * 0.1 }}
                className={`relative rounded-2xl border p-6 transition-all ${
                  plan.popular
                    ? 'border-[#F97316]/40 bg-[#F97316]/5 shadow-lg shadow-[#F97316]/10'
                    : 'border-[#2e2e2e] bg-[#0f0f0f]/60 hover:border-[#363636]'
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-[#F97316] text-white text-[10px] font-bold uppercase tracking-wider">
                    Mais Popular
                  </div>
                )}

                <div className="flex items-center gap-3 mb-4">
                  <div className={`p-2.5 rounded-xl ${plan.popular ? 'bg-[#F97316]/20' : 'bg-[#242424]'}`}>
                    <Icon className={`w-5 h-5 ${plan.popular ? 'text-[#F97316]' : 'text-[#898989]'}`} />
                  </div>
                  <div>
                    <h3 className="font-bold text-[#fafafa]">{plan.name}</h3>
                    <p className="text-lg font-bold" style={{ color: plan.color }}>{plan.price}</p>
                  </div>
                </div>

                <ul className="space-y-2.5 mb-6">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-2 text-xs text-[#b4b4b4]">
                      <Check className="w-3.5 h-3.5 text-[#25D366] flex-shrink-0 mt-0.5" />
                      {feature}
                    </li>
                  ))}
                </ul>

                <button
                  onClick={() => handleUpgrade(plan.key)}
                  disabled={processingPlan === plan.key}
                  className={`w-full py-3 rounded-xl text-sm font-semibold transition-all ${
                    plan.popular
                      ? 'bg-[#F97316] hover:bg-[#F97316]/90 text-white'
                      : 'bg-[#242424] hover:bg-[#2e2e2e] text-[#efefef] border border-[#2e2e2e]'
                  } disabled:opacity-50 disabled:cursor-not-allowed`}>
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
        <p className="text-center text-xs text-[#363636] mt-12">
          Todos os planos incluem 7 dias de garantia. Cancele quando quiser.
        </p>
      </main>
    </div>
  );
}
