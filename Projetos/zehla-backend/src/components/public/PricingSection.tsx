'use client'

interface PricingSectionProps {
  onNavigateToTrial: () => void
}

const tiers = [
  {
    name: 'Teste Grátis',
    price: 'Grátis',
    period: '7 dias',
    desc: 'Conheça o ZEHLA sem compromisso.',
    features: [
      'Concierge IA ilimitado',
      'Até 5 quartos',
      'WhatsApp integrado',
      'Painel ZCC básico',
    ],
    cta: 'Testar Grátis',
    featured: false,
  },
  {
    name: 'SmartHotel',
    price: 'R$ 97',
    period: '/mês',
    desc: 'Para pousadas que querem crescer.',
    features: [
      'Tudo do Teste Grátis',
      'Yield neuroeconômico',
      'CRM comercial completo',
      'Quartos ilimitados',
      'Suporte prioritário',
    ],
    cta: 'Assinar Agora',
    featured: true,
  },
  {
    name: 'Premium',
    price: 'R$ 197',
    period: '/mês',
    desc: 'Para redes e operações multi-unidade.',
    features: [
      'Tudo do SmartHotel',
      'Múltiplas propriedades',
      'API dedicada',
      'Onboarding personalizado',
      'SLA 99.9%',
    ],
    cta: 'Falar com Vendas',
    featured: false,
  },
]

export function PricingSection({ onNavigateToTrial }: PricingSectionProps) {
  return (
    <section id="precos" className="py-24 px-6 bg-[#000000] border-t border-white/5">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-5xl font-black text-white mb-4 tracking-tight">
            Preços Transparentes
          </h2>
          <p className="text-neutral-400 max-w-xl mx-auto">
            Sem taxas escondidas. Sem surpresas. O ZEHLA absorve todos os custos de IA.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {tiers.map((tier) => (
            <div
              key={tier.name}
              className={`rounded-2xl p-6 flex flex-col ${
                tier.featured
                  ? 'bg-white/10 border-2 border-[#FF5500] shadow-[0_0_30px_rgba(255,85,0,0.15)]'
                  : 'bg-white/5 border border-white/10'
              }`}
            >
              <h3 className="text-lg font-bold text-white mb-1">{tier.name}</h3>
              <p className="text-sm text-neutral-400 mb-4">{tier.desc}</p>

              <div className="mb-6">
                <span className="text-3xl font-black text-white">{tier.price}</span>
                <span className="text-sm text-neutral-500 ml-1">{tier.period}</span>
              </div>

              <ul className="space-y-3 mb-8 flex-1">
                {tier.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm text-neutral-300">
                    <span className="text-[#FF5500] mt-0.5">&#10003;</span>
                    {f}
                  </li>
                ))}
              </ul>

              <button
                onClick={onNavigateToTrial}
                className={`w-full py-3 rounded-xl font-bold text-sm transition-all ${
                  tier.featured
                    ? 'bg-[#FF5500] hover:bg-[#ff6611] text-white shadow-[0_10px_20px_rgba(255,85,0,0.25)]'
                    : 'bg-white/10 hover:bg-white/20 text-white border border-white/10'
                }`}
              >
                {tier.cta}
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
