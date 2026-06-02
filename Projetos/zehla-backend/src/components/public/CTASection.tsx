'use client'

interface CTASectionProps {
  onNavigateToTrial: () => void
}

export function CTASection({ onNavigateToTrial }: CTASectionProps) {
  return (
    <section className="py-24 px-6 bg-[#000000] border-t border-white/5">
      <div className="max-w-3xl mx-auto text-center">
        <h2 className="text-3xl sm:text-5xl font-black text-white mb-6 tracking-tight leading-tight">
          Pronto para deixar o ZEHLA
          <br />
          <span className="text-[#FF5500]">cuidar da sua pousada?</span>
        </h2>

        <p className="text-lg text-neutral-400 mb-10 max-w-xl mx-auto">
          Teste grátis por 7 dias. Sem cartão de crédito. Sem compromisso.
        </p>

        <button
          onClick={onNavigateToTrial}
          className="inline-flex items-center gap-2 px-10 py-4 bg-[#FF5500] hover:bg-[#ff6611] text-white font-bold rounded-xl text-lg transition-all shadow-[0_10px_30px_rgba(255,85,0,0.3)]"
        >
          Iniciar Teste Grátis
        </button>
      </div>
    </section>
  )
}
