'use client';

import { motion } from 'framer-motion';
import { Check, Star } from 'lucide-react';

interface PricingSectionProps {
  onNavigate?: () => void;
}

const plans = [
  {
    name: 'Lite',
    price: '248',
    description: 'Ideal para quem está começando a automatizar com alta performance.',
    features: [
      'WhatsApp ZEHLA 24/7',
      'Dashboard Financeiro Básico',
      'Gestão de Reservas integrada',
      'Suporte via Email de alta velocidade',
    ],
    popular: false,
  },
  {
    name: 'Pro',
    price: '448',
    description: 'O equilíbrio perfeito de automação inteligente e performance premium.',
    features: [
      'Tudo do Lite incluso',
      'Precificação Dinâmica por IA',
      'Campanhas e Promoções Automáticas',
      'Relatórios Avançados de Performance',
      'Suporte Prioritário via WhatsApp 24/7',
    ],
    popular: true,
  },
  {
    name: 'Max',
    price: '798',
    description: 'Centralização completa e inteligência máxima para o seu negócio.',
    features: [
      'Tudo do Pro incluso',
      'Zehla Control Center (ZCC) completo',
      'Gestão Inteligente Multi-propriedades',
      'Integrações Personalizadas ilimitadas',
      'Gestor de Conta e Suporte Dedicado',
    ],
    popular: false,
  },
];

export function PricingSection({ onNavigate }: PricingSectionProps) {
  return (
    <section id="precos" className="relative py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto overflow-hidden">
      {/* Decorative blurred glow background elements */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[#FF5500]/5 rounded-full blur-[120px] pointer-events-none" />
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="relative text-center mb-16 z-10"
      >
        <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight mb-4">
          Escolha o seu plano <span className="text-[#FF5500]">ZEHLA</span>
        </h2>
        <p className="text-[#898989] text-lg max-w-2xl mx-auto">
          Sem comissões ocultas. Cresça sem limites com o período de teste de 7 dias no plano <span className="text-[#FF5500] font-bold">PRO</span>.
        </p>
      </motion.div>

      <div className="relative grid grid-cols-1 md:grid-cols-3 gap-8 z-10">
        {plans.map((plan, i) => (
          <motion.div
            key={plan.name}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: i * 0.1 }}
            className={`relative rounded-3xl p-8 flex flex-col h-full border ${
              plan.popular 
                ? 'bg-[#090909]/80 border-[#FF5500] shadow-[0_0_50px_rgba(255,85,0,0.15)] ring-1 ring-[#FF5500]/20' 
                : 'bg-[#090909]/40 border-white/5'
            } backdrop-blur-xl transition-all duration-300 hover:border-white/10 hover:shadow-[0_0_30px_rgba(255,85,0,0.05)]`}
          >
            {plan.popular && (
              <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                <span className="bg-[#FF5500] text-white text-[10px] font-bold px-3 py-1 rounded-full flex items-center gap-1 shadow-lg shadow-[#FF5500]/25 tracking-widest uppercase">
                  <Star className="w-3.5 h-3.5 fill-current" /> MAIS ESCOLHIDO
                </span>
              </div>
            )}

            <div className="mb-8">
              <h3 className="text-2xl font-bold text-white tracking-tight mb-2">
                {plan.name}
              </h3>
              
              <div className="flex items-baseline gap-1 mt-4">
                <span className="text-sm text-[#898989] font-medium">R$</span>
                <span className="text-5xl font-extrabold text-white tracking-tight">{plan.price}</span>
                <span className="text-[#898989] text-sm font-medium">/mês</span>
              </div>
              
              <div className="mt-3">
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-[11px] font-bold bg-[#FF5500]/10 text-[#FF5500] border border-[#FF5500]/20 tracking-wide">
                  Assinatura 100% Fixa — Taxa Zero
                </span>
              </div>
              
              <p className="text-[#898989] text-sm mt-4 leading-relaxed">
                {plan.description}
              </p>
            </div>

            <div className="flex-1 space-y-4 mb-8">
              {plan.features.map((feat) => (
                <div key={feat} className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-[#FF5500]/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Check className="w-3.5 h-3.5 text-[#FF5500]" />
                  </div>
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
                  ? 'bg-[#FF5500] hover:bg-[#ff6a1a] text-white shadow-lg shadow-[#FF5500]/20 hover:shadow-[#FF5500]/30'
                  : 'bg-[#1a1a1a] hover:bg-[#242424] text-[#efefef] border border-white/5 hover:border-white/10'
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
        className="mt-16 text-center"
      >
        <p className="text-[#555555] text-xs flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
          <span className="flex items-center gap-1.5">✓ 7 Dias de Teste Grátis</span>
          <span className="flex items-center gap-1.5">✓ Sem Fidelidade ou Multa</span>
          <span className="flex items-center gap-1.5">✓ Migração e Upgrade a qualquer momento</span>
        </p>
      </motion.div>
    </section>
  );
}
