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
    <section ref={ref} id="oferta-parceiro" className="py-24 sm:py-32 relative overflow-hidden bg-[#060608]">
      {/* OVERDRIVE: Orbes e Vetores de Luz Pulsantes de Fundo */}
      <motion.div 
        animate={{ 
          y: [0, -30, 0], 
          scale: [1, 1.15, 1],
          opacity: [0.08, 0.14, 0.08]
        }}
        transition={{ 
          duration: 8, 
          repeat: Infinity, 
          ease: "easeInOut" 
        }}
        className="absolute top-10 left-10 w-[500px] h-[500px] rounded-full pointer-events-none blur-[130px] bg-gradient-to-br from-amber-500 to-amber-700" 
      />
      <motion.div 
        animate={{ 
          y: [-20, 20, -20], 
          scale: [1.1, 0.95, 1.1],
          opacity: [0.06, 0.12, 0.06]
        }}
        transition={{ 
          duration: 10, 
          repeat: Infinity, 
          ease: "easeInOut" 
        }}
        className="absolute bottom-10 right-10 w-[450px] h-[450px] rounded-full pointer-events-none blur-[120px] bg-gradient-to-br from-orange-600 to-amber-900" 
      />

      <div className="relative z-10 max-w-5xl mx-auto px-6">
        
        {/* CARD PRINCIPAL COM BORDA GRADIENTE GIRATÓRIA */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="relative rounded-3xl overflow-hidden p-[1px] bg-white/[0.04]"
        >
          {/* Efeito Overdrive: Raio de luz rotativo na borda */}
          {isInView && (
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 6, repeat: Infinity, ease: 'linear' }}
              className="absolute inset-[-200%] bg-[conic-gradient(from_0deg,transparent_40%,#f59e0b_50%,transparent_60%)] opacity-70 pointer-events-none"
              style={{ originX: '50%', originY: '50%' }}
            />
          )}

          {/* Fundo do Card */}
          <div className="relative rounded-[23px] overflow-hidden bg-[#0c0c0f]/95 backdrop-blur-xl p-8 sm:p-12 lg:p-16">
            
            {/* Top Badges */}
            <div className="flex flex-wrap items-center gap-3 mb-8">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30">
                <Flame className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
                <span className="text-amber-400 text-xs font-bold uppercase tracking-wider">Oferta Parceiro</span>
              </div>
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-red-500/10 border border-red-500/30">
                <Clock className="w-3.5 h-3.5 text-red-400" />
                <span className="text-red-400 text-xs font-bold">Vagas Limitadas — 100 pousadas</span>
              </div>
            </div>

            {/* Title (Simplificação de jargão + Nome da marca corrigido) */}
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white mb-6 leading-[1.1] tracking-tight">
              Programa Beta:
              <br />
              <span className="gradient-text-royal font-extrabold">Seja um Parceiro do SEU ZÉLLA</span>
            </h2>

            <p className="text-zinc-400 text-base sm:text-lg max-w-2xl mb-10 leading-relaxed">
              Você foi escolhido para o seleto grupo de <strong className="text-white">100 pousadas parceiras</strong> pioneiras no Brasil. Como agradecimento por nos ajudar a crescer, oferecemos uma condição única: use todas as funções do plano PRO pagando o valor do plano LITE, com preço congelado para sempre. Assim que preenchermos as vagas, o grupo será fechado definitivamente.
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
                    <h4 className="text-white font-bold text-sm sm:text-base">Preço Vitalício Congelado</h4>
                    <span className="text-emerald-400 text-xs font-semibold">R$ 197,00/mês para sempre</span>
                  </div>
                </div>
                <p className="text-zinc-500 text-xs leading-relaxed group-hover:text-zinc-400 transition-colors">
                  Garanta acesso às funcionalidades exclusivas do plano PRO pelo preço fixo do plano LITE. Sem letras miúdas, sem reajustes futuros por inflação.
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
                'Selo exclusivo de Parceiro no DDC',
                'Suporte prioritário VIP 24h',
              ].map((perk) => (
                <div key={perk} className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/[0.03] border border-white/[0.05] hover:border-white/10 transition-all">
                  <Check className="w-3.5 h-3.5 text-amber-400" />
                  <span className="text-zinc-300 text-xs font-medium">{perk}</span>
                </div>
              ))}
            </div>

            {/* CTA BUTTON WITH METALLIC SHINE EFFECT */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
              <button 
                onClick={() => {
                  const el = document.querySelector('#precos');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }}
                className="group relative overflow-hidden px-8 py-4 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold rounded-xl hover:from-amber-400 hover:to-orange-400 transition-all duration-300 shadow-xl shadow-amber-500/20 hover:shadow-amber-500/35 cursor-pointer flex items-center gap-2 text-base active:scale-95"
              >
                {/* Linha de brilho metálico rotativa/passando */}
                <motion.div 
                  initial={{ x: '-100%' }}
                  animate={{ x: '100%' }}
                  transition={{ 
                    repeat: Infinity, 
                    repeatDelay: 3, 
                    duration: 1.2, 
                    ease: 'linear' 
                  }}
                  className="absolute inset-0 w-1/2 h-full bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12 pointer-events-none"
                />

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