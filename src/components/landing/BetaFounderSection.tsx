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
import { useNiche } from '@/contexts/NicheContext';

export function BetaFounderSection() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });
  const { isAirbnb } = useNiche();

  return (
    <section ref={ref} id="oferta-parceiro" className="py-24 sm:py-32 relative overflow-hidden bg-[#060608]">
      <div className="relative z-10 max-w-5xl mx-auto px-6">
        
        {/* CARD PRINCIPAL COM BORDA LIMPA */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="relative rounded-3xl overflow-hidden p-[1px] bg-white/[0.08]"
        >
          {/* Fundo do Card */}
          <div className="relative rounded-[23px] overflow-hidden bg-[#0c0c0f] p-8 sm:p-12 lg:p-16">
            
            {/* Top Badges */}
            <div className="flex flex-wrap items-center gap-3 mb-8">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30">
                <Flame className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
                <span className="text-amber-400 text-xs font-bold uppercase tracking-wider">Oferta Parceiro</span>
              </div>
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-red-500/10 border border-red-500/30">
                <Clock className="w-3.5 h-3.5 text-red-400" />
                <span className="text-red-400 text-xs font-bold">{isAirbnb ? 'Vagas Limitadas — 100 anfitriões' : 'Vagas Limitadas — 100 pousadas'}</span>
              </div>
            </div>

            {/* Title (Simplificação de jargão + Nome da marca corrigido) */}
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white mb-6 leading-[1.1] tracking-tight">
              Programa Beta:
              <br />
              <span className="text-[#6488ff] font-extrabold">Seja um Parceiro do SEU ZÉLLA</span>
            </h2>

            <p className="text-zinc-400 text-base sm:text-lg max-w-2xl mb-10 leading-relaxed">
              {isAirbnb
                ? <>Você foi escolhido para o seleto grupo de <strong className="text-white">100 anfitriões parceiros</strong> pioneiros no Brasil. Como agradecimento por nos ajudar a crescer, oferecemos uma condição única: use todas as funções do plano PRO pagando o valor do plano LITE, com preço congelado por 24 meses enquanto mantiver a assinatura ativa. Assim que preenchermos as vagas, o grupo será fechado definitivamente.</>
                : <>Você foi escolhido para o seleto grupo de <strong className="text-white">100 pousadas parceiras</strong> pioneiras no Brasil. Como agradecimento por nos ajudar a crescer, oferecemos uma condição única: use todas as funções do plano PRO pagando o valor do plano LITE, com preço congelado por 24 meses enquanto mantiver a assinatura ativa. Assim que preenchermos as vagas, o grupo será fechado definitivamente.</>
              }
            </p>

            {/* BENEFITS GRID WITH 3D HOVER AND GLOWS */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
              
              {/* Card Benefício 1 */}
              <motion.div 
                whileHover={{ scale: 1.02, y: -4 }}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                className="p-6 rounded-2xl bg-white/[0.02] border border-white/[0.06] hover:border-amber-500/30 hover:bg-white/[0.03] transition-all duration-300 group"
              >
                <div className="flex items-center gap-3.5 mb-3.5">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center group-hover:bg-amber-500/20 group-hover:scale-110 transition-all duration-300">
                    <DollarSign className="w-5 h-5 text-amber-400" />
                  </div>
                  <div>
                    <h4 className="text-white font-bold text-sm sm:text-base">Primeiro Mês GRÁTIS</h4>
                    <span className="text-amber-400 text-xs font-semibold">R$ 0,00 na fase de validação</span>
                  </div>
                </div>
                <p className="text-zinc-500 text-xs leading-relaxed group-hover:text-zinc-400 transition-colors">
                  Comece a atender seus clientes e fechar reservas sem pagar absolutamente nada no primeiro mês. Valide na prática antes do seu primeiro faturamento.
                </p>
              </motion.div>

              {/* Card Benefício 2 */}
              <motion.div 
                whileHover={{ scale: 1.02, y: -4 }}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                className="p-6 rounded-2xl bg-white/[0.02] border border-white/[0.06] hover:border-emerald-500/30 hover:bg-white/[0.03] transition-all duration-300 group"
              >
                <div className="flex items-center gap-3.5 mb-3.5">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center group-hover:bg-emerald-500/20 group-hover:scale-110 transition-all duration-300">
                    <Crown className="w-5 h-5 text-emerald-400" />
                  </div>
                  <div>
                    <h4 className="text-white font-bold text-sm sm:text-base">Preço de Fundador Congelado</h4>
                    <span className="text-emerald-400 text-xs font-semibold">R$ 247,00/mês por 24 meses</span>
                  </div>
                </div>
                <p className="text-zinc-500 text-xs leading-relaxed group-hover:text-zinc-400 transition-colors">
                  Garanta acesso às funcionalidades do plano PRO com preço especial de parceiro. Valor congelado por 24 meses enquanto sua assinatura estiver ativa.
                </p>
              </motion.div>

            </div>

            {/* Perks */}
            <div className="flex flex-wrap gap-3 mb-10">
              {[
                'Status de Fundador no sistema',
                'Acesso antecipado a novos recursos',
                'Contato direto com os desenvolvedores',
                'Treinamento e onboarding personalizado',
                'Selo exclusivo de Parceiro Fundador no Painel',
                'Suporte prioritário VIP 24h',
              ].map((perk) => (
                <div key={perk} className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/[0.03] border border-white/[0.05] hover:border-white/10 transition-all">
                  <Check className="w-3.5 h-3.5 text-amber-400" />
                  <span className="text-zinc-300 text-xs font-medium">{perk}</span>
                </div>
              ))}
            </div>

            {/* CTA BUTTON */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
              <button 
                onClick={() => {
                  const el = document.querySelector('#precos');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }}
                className="group relative overflow-hidden px-8 py-4 bg-gradient-to-r from-amber-500 to-orange-500 text-zinc-950 font-bold rounded-xl hover:from-amber-400 hover:to-orange-400 transition-all duration-300 shadow-xl shadow-amber-500/10 cursor-pointer flex items-center gap-2 text-base active:scale-[0.98] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-500"
              >
                <Sparkles className="w-5 h-5" />
                Quero ser Parceiro
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
              
              <div className="flex items-center gap-2 text-zinc-500 text-xs font-medium">
                <Users className="w-3.5 h-3.5 text-amber-500/80" />
                <span>Poucas vagas disponíveis para este grupo de fundadores.</span>
              </div>
            </div>

          </div>
        </motion.div>

      </div>
    </section>
  );
}