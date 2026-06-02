'use client'

import { Bot, BarChart3, MessageCircle, Building2 } from 'lucide-react'

const features = [
  {
    icon: Bot,
    title: 'IA Cognitiva 24/7',
    desc: 'Ze, o concierge inteligente que atende hóspedes, resolve problemas e aprende com cada interação.',
  },
  {
    icon: BarChart3,
    title: 'Yield Neuroeconômico',
    desc: 'Precificação dinâmica baseada em ocupação, sazonalidade e eventos da região.',
  },
  {
    icon: MessageCircle,
    title: 'WhatsApp Integrado',
    desc: 'Atenda, confirme e venda pelo WhatsApp sem abrir outro aplicativo.',
  },
  {
    icon: Building2,
    title: 'Gestão Completa',
    desc: 'Check-in, limpeza, manutenção e CRM comercial em um só painel.',
  },
]

interface FeaturesSectionProps {
  onNavigateToTrial: () => void
}

export function FeaturesSection({ onNavigateToTrial }: FeaturesSectionProps) {
  return (
    <section id="funcionalidades" className="py-24 px-6 bg-[#000000] border-t border-white/5">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-5xl font-black text-white mb-4 tracking-tight">
            Tudo que sua pousada precisa
          </h2>
          <p className="text-neutral-400 max-w-xl mx-auto">
            Do primeiro contato ao check-out, o ZEHLA automatiza cada etapa da jornada do hóspede.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((f) => (
            <div
              key={f.title}
              className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:border-[#FF5500]/30 transition-all group"
            >
              <div className="w-10 h-10 rounded-xl bg-[#FF5500]/10 border border-[#FF5500]/20 flex items-center justify-center mb-4 group-hover:bg-[#FF5500]/20 transition-all">
                <f.icon className="w-5 h-5 text-[#FF5500]" />
              </div>
              <h3 className="text-white font-bold mb-2">{f.title}</h3>
              <p className="text-sm text-neutral-400 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>

        <div className="text-center mt-12">
          <button
            onClick={onNavigateToTrial}
            className="inline-flex items-center gap-2 px-6 py-3 bg-[#FF5500] hover:bg-[#ff6611] text-white font-bold rounded-xl transition-all"
          >
            Quero Automatizar Minha Pousada
          </button>
        </div>
      </div>
    </section>
  )
}
