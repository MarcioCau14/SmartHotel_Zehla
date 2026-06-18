'use client';

import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import {
  Crown,
  Clock,
  DollarSign,
  Check,
  ArrowRight,
  Users,
  Sparkles,
  Flame,
} from 'lucide-react';

export function BetaFounderSection() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <section ref={ref} id="oferta-parceiro" className="py-24 sm:py-32 relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute inset-0 bg-gradient-to-b from-amber-500/[0.03] via-amber-500/[0.06] to-transparent" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full opacity-10 blur-[100px] bg-gradient-to-br from-amber-500 to-orange-600" />

      <div className="relative z-10 max-w-5xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7 }}
          className="relative rounded-3xl overflow-hidden border border-amber-500/20"
        >
          {/* Card Background */}
          <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-orange-600/5" />
          <div className="absolute inset-0 bg-[#0a0a0a]/80 backdrop-blur-sm" />

          <div className="relative p-8 sm:p-12 lg:p-16">
            {/* Top Badge */}
            <div className="flex flex-wrap items-center gap-3 mb-8">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-500/20 border border-amber-500/30">
                <Flame className="w-3.5 h-3.5 text-amber-400" />
                <span className="text-amber-300 text-xs font-bold uppercase tracking-wider">Oferta Parceiro</span>
              </div>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-red-500/20 border border-red-500/30">
                <Clock className="w-3.5 h-3.5 text-red-400" />
                <span className="text-red-300 text-xs font-bold">Vagas Limitadas — 100 pousadas</span>
              </div>
            </div>

            {/* Title */}
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white mb-4 leading-tight">
              Programa Beta:
              <br />
              <span className="text-amber-400">Seja um Parceiro do ZÉLLA</span>
            </h2>

            <p className="text-neutral-400 text-lg max-w-2xl mb-10 leading-relaxed">
              Você foi escolhido para o seleto grupo exclusivo de <strong className="text-white">100 pousadas parceiras</strong> em todo o Brasil. Como agradecimento, oferecemos condições que nunca mais serão repetidas. Esta é a sua chance de entrar no nível PRO pagando o mínimo possível — e manter esse preço para sempre com o pacote PRO. Assim que completarmos 100 parceiros vamos fechar esse grupo seleto!
            </p>

            {/* Benefits Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-10">
              <div className="p-6 rounded-2xl bg-white/[0.03] border border-white/[0.06]">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500/20 to-amber-900/10 flex items-center justify-center">
                    <DollarSign className="w-5 h-5 text-amber-400" />
                  </div>
                  <div>
                    <h4 className="text-white font-bold text-sm">Primeiro Mês GRÁTIS</h4>
                    <span className="text-amber-400 text-xs font-medium">R$0,00 durante o período de validação</span>
                  </div>
                </div>
                <p className="text-neutral-500 text-xs leading-relaxed">
                  Comece a usar o ZÉLLA sem pagar nada no primeiro mês. Aproveite para configurar tudo, testar a IA e ver resultados reais antes de qualquer cobrança.
                </p>
              </div>

              <div className="p-6 rounded-2xl bg-white/[0.03] border border-white/[0.06]">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500/20 to-emerald-900/10 flex items-center justify-center">
                    <Crown className="w-5 h-5 text-emerald-400" />
                  </div>
                  <div>
                    <h4 className="text-white font-bold text-sm">Preço Vitalício</h4>
                    <span className="text-emerald-400 text-xs font-medium">R$197,00/mês — para sempre</span>
                  </div>
                </div>
                <p className="text-neutral-500 text-xs leading-relaxed">
                  Após o período de validação, sua mensalidade congela em R$197/mês (equivalente ao plano LITE) mas com acesso a funcionalidades do PRO. Para sempre, sem reajuste.
                </p>
              </div>
            </div>

            {/* Extra perks */}
            <div className="flex flex-wrap gap-3 mb-10">
              {[
                'Status PARCEIRO no sistema',
                'Acesso antecipado a todos os recursos',
                'Feedback direto com o fundador',
                'Onboarding personalizado',
                'Badge exclusivo de Parceiro',
                'Suporte VIP desde o dia 1',
              ].map((perk) => (
                <div key={perk} className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/[0.04] border border-white/[0.06]">
                  <Check className="w-3.5 h-3.5 text-amber-400" />
                  <span className="text-neutral-300 text-xs font-medium">{perk}</span>
                </div>
              ))}
            </div>

            {/* CTA */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <button className="group flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold rounded-xl hover:from-amber-400 hover:to-orange-400 transition-all duration-300 shadow-lg shadow-amber-500/25 hover:shadow-amber-500/40 cursor-pointer">
                <Sparkles className="w-5 h-5" />
                Quero ser Parceiro
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
              <p className="text-neutral-600 text-xs">
                <Users className="w-3 h-3 inline mr-1" />
                Restam poucas vagas. Aproveite antes que esgote.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}