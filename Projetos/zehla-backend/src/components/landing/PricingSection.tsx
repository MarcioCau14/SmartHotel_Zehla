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
    fee: '5%',
    description: 'Ideal para quem está começando a automatizar.',
    features: [
      'WhatsApp ZEHLA 24/7',
      'Dashboard Financeiro Básico',
      'Gestão de Reservas',
      'Suporte via Email',
    ],
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
    popular: false,
  },
];

export function PricingSection({ onNavigate }: PricingSectionProps) {
  return (
    <section id="precos" className="vzap-section-gray vzap-section-padding">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-14"
        >
          <h2 className="vzap-heading">
            Escolha o seu plano ZEHLA
          </h2>
          <p className="max-w-2xl mx-auto" style={{ color: '#667781', fontSize: '16px' }}>
            Cresça sem limites com o período de teste de 7 dias no plano <span style={{ color: '#25D366', fontWeight: 700 }}>PRO</span>.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
          {plans.map((plan, i) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className={`vzap-card overflow-hidden ${plan.popular ? 'ring-2 ring-[#25D366] relative' : ''}`}
              style={{ padding: '32px 28px' }}
            >
              {plan.popular && (
                <div className="flex justify-center mb-5">
                  <span
                    className="inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-bold uppercase tracking-wide"
                    style={{ background: 'linear-gradient(135deg, #25D366, #128C7E)', color: '#fff', borderRadius: '20px' }}
                  >
                    <Star className="w-3.5 h-3.5 fill-current" />
                    Mais Escolhido
                  </span>
                </div>
              )}

              <div className="text-center mb-7">
                <h3 style={{ fontSize: '20px', fontWeight: 500, color: '#111B21', marginBottom: '4px' }}>
                  {plan.name}
                </h3>
                <div className="flex items-baseline justify-center gap-1">
                  <span style={{ fontSize: '16px', color: '#667781' }}>R$</span>
                  <span style={{ fontSize: '48px', fontWeight: 700, color: '#25D366', lineHeight: 1 }}>
                    {plan.price}
                  </span>
                  <span style={{ color: '#667781', fontSize: '14px' }}>/mês</span>
                </div>
                <div className="mt-2 text-sm">
                  <span style={{ fontWeight: 500, color: plan.fee === '0%' ? '#25D366' : '#667781' }}>
                    + {plan.fee}
                  </span>
                  <span style={{ color: '#667781', marginLeft: '4px' }}>por reserva</span>
                </div>
                <p className="mt-3" style={{ color: '#667781', fontSize: '13px', lineHeight: 1.6 }}>
                  {plan.description}
                </p>
              </div>

              <div className="space-y-3 mb-7">
                {plan.features.map((feat) => (
                  <div key={feat} className="flex items-start gap-3" style={{ color: '#667781', fontSize: '13px' }}>
                    <Check className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: '#25D366' }} />
                    <span>{feat}</span>
                  </div>
                ))}
              </div>

              <button
                type="button"
                onClick={onNavigate}
                className={`w-full font-medium transition-all duration-300 ${
                  plan.popular
                    ? 'vzap-btn'
                    : 'bg-[#F0F2F5] hover:bg-[#25D366] hover:text-white text-[#25D366]'
                }`}
                style={{ height: '48px', borderRadius: '24px', fontSize: '14px', fontWeight: 500, cursor: 'pointer' }}
              >
                Começar com {plan.name}
              </button>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="mt-10 text-center flex flex-wrap items-center justify-center gap-6"
          style={{ color: '#667781', fontSize: '13px' }}
        >
          <span>7 Dias de Teste Grátis</span>
          <span>·</span>
          <span>Sem Fidelidade</span>
          <span>·</span>
          <span>Upgrade/Downgrade a qualquer momento</span>
        </motion.div>
      </div>
    </section>
  );
}
