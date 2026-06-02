'use client'

import { Brain } from 'lucide-react'

interface HeroSectionProps {
  onNavigateToTrial: () => void
}

export function HeroSection({ onNavigateToTrial }: HeroSectionProps) {
  return (
    <section className="relative min-h-screen flex items-center justify-center bg-[#000000] overflow-hidden">
      <div className="max-w-5xl mx-auto px-6 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 mb-8">
          <Brain className="w-4 h-4 text-[#FF5500]" />
          <span className="text-xs text-slate-400 font-mono">ZEHLA SmartHotel</span>
        </div>

        <h1 className="text-5xl sm:text-7xl font-black tracking-tight text-white mb-6 leading-none">
          O Cérebro Cognitivo
          <br />
          <span className="text-[#FF5500]">da Sua Pousada</span>
        </h1>

        <p className="text-lg text-neutral-400 max-w-2xl mx-auto mb-10 leading-relaxed">
          Automacão inteligente para pousadas brasileiras. Deixe o ZEHLA cuidar do
          atendimento, das reservas e da operação enquanto você foca no que importa.
        </p>

        <button
          onClick={onNavigateToTrial}
          className="inline-flex items-center gap-2 px-8 py-4 bg-[#FF5500] hover:bg-[#ff6611] text-white font-bold rounded-xl text-lg transition-all shadow-[0_10px_30px_rgba(255,85,0,0.3)] hover:shadow-[0_14px_40px_rgba(255,85,0,0.5)]"
        >
          Testar Grátis por 7 Dias
        </button>
      </div>
    </section>
  )
}
