import {
import { motion } from 'framer-motion';


'use client';

  Zap,
  Check,
  MessageSquare,
  BarChart3,
  CalendarCheck,
  Megaphone,
  CreditCard,
  Shield,
  Star,
} from 'lucide-react';

interface PricingSectionProps {
  onNavigate?: () => void;
}

const plans = [
  {
    name: 'Lite',
    price: '248',
    fee: '5%',
    description: 'Ideal para quem está começando a automatizar.',
    features: [
      'WhatsApp ZEHLA 24/7',
      'Dashboard Financeiro Básico',
      'Gestão de Reservas',
      'Suporte via Email',
    ],
    color: 'orange',
    popular: false,
  },
  {
    name: 'Pro',
    price: '448',
    fee: '2%',
    description: 'O equilíbrio perfeito entre custo e performance.',
    features: [
      'Tudo do Lite',
      'Precificação Dinâmica IA',
      'Promoções Automáticas',
      'Relatórios de Performance',
      'Suporte Prioritário WhatsApp',
    ],
    color: 'purple',
    popular: true,
  },
  {
    name: 'Max',
    price: '798',
    fee: '0%',
    description: 'Taxa Zero. Para quem quer escala máxima.',
    features: [
      'Tudo do Pro',
      'TAXA ZERO por reserva',
      'Zehla Control Center (ZCC)',
      'Multi-propriedades',
      'Gestor de Conta Dedicado',
    ],
    color: 'amber',
    popular: false,
  },
];

export function PricingSection(: void { onNavigate }: PricingSectionProps) {
  try {
  return (
    <section id="precos" className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="text-center mb-16"
      >
        <h2 className="text-3xl sm:text-5xl font-bold text-[#fafafa] mb-4">
          Escolha o seu plano <span className="gradient-text">ZEHLA</span>
        </h2>
        <p className="text-[#898989] text-lg max-w-2xl mx-auto">
          Cresça sem limites com o período de teste de 7 dias no plano <span className="text-[#FF5500] font-bold">PRO</span>.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {plans.map((plan, i) => (
          <motion.div
            key={plan.name}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: i * 0.1 }}
            className={`relative rounded-3xl p-8 flex flex-col h-full border ${
              plan.popular 
                ? 'bg-neutral-900/60 border-[#F97316] shadow-[0_0_40px_rgba(249,115,22,0.2)] ring-1 ring-[#F97316]/30' 
                : 'bg-neutral-900/30 border-[#2e2e2e]'
            } glass-strong transition-all duration-300 hover:border-white/20`}
          >
            {plan.popular && (
              <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                <span className="bg-purple-500 text-white text-[10px] font-bold px-3 py-1 rounded-full flex items-center gap-1 shadow-lg shadow-purple-500/20">
                  <Star className="w-3 h-3 fill-current" /> MAIS ESCOLHIDO
                </span>
              </div>
            )}

            <div className="mb-8">
              <h3 className={`text-xl font-bold mb-2 ${
                plan.color === 'orange' ? 'text-[#FF5500]' : 
                plan.color === 'purple' ? 'text-[#FF5500]' : 'text-[#FF5500]'
              }`}>
                {plan.name}
              </h3>
              <div className="flex items-baseline gap-1">
                <span className="text-sm text-[#4d4d4d]">R$</span>
                <span className="text-4xl font-bold text-[#fafafa]">{plan.price}</span>
                <span className="text-[#4d4d4d] text-sm">/mês</span>
              </div>
              <div className="mt-2 text-sm">
                <span className={`font-bold ${plan.fee === '0%' ? 'text-[#FF5500]' : 'text-[#b4b4b4]'}`}>
                  + {plan.fee}
                </span>
                <span className="text-[#4d4d4d] ml-1">por reserva fechada</span>
              </div>
              <p className="text-[#4d4d4d] text-xs mt-4">
                {plan.description}
              </p>
            </div>

            <div className="flex-1 space-y-4 mb-8">
              {plan.features.map((feat) => (
                <div key={feat} className="flex items-start gap-3">
                  <Check className={`w-4 h-4 mt-0.5 flex-shrink-0 ${
                    plan.color === 'orange' ? 'text-[#FF5500]' : 
                    plan.color === 'purple' ? 'text-[#FF5500]' : 'text-[#FF5500]'
                  }`} />
                  <span className="text-sm text-[#b4b4b4] leading-tight">{feat}</span>
                </div>
              ))}
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onNavigate}
              className={`w-full py-4 rounded-xl font-bold text-sm transition-all duration-200 ${
                plan.popular
                  ? 'bg-[#F97316] hover:bg-[#EA580C] text-white shadow-lg shadow-[#F97316]/30'
                  : 'bg-[#242424] hover:bg-[#2e2e2e] text-[#efefef]'
              }`}
            >
              Começar com {plan.name}
            </motion.button>
          </motion.div>
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 1, delay: 0.5 }}
        className="mt-12 text-center"
      >
        <p className="text-[#363636] text-xs flex items-center justify-center gap-4">
          <span>✓ 7 Dias de Teste Grátis</span>
          <span>✓ Sem Fidelidade</span>
          <span>✓ Upgrade/Downgrade a qualquer momento</span>
        </p>
      </motion.div>
    </section>
  );
}
