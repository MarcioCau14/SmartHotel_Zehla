'use client';

import { motion } from 'framer-motion';
import { Brain, Zap, ChevronRight, ChevronDown, Hotel, Star, Clock } from 'lucide-react';

interface HeroSectionProps {
  onNavigate?: () => void;
  styleOption?: string;
}

export function HeroSection({ onNavigate, styleOption = '2' }: HeroSectionProps) {
  // Styles mapping
  if (styleOption === '1') {
    return (
      <section className="relative min-h-screen flex items-center justify-start bg-[#000000] overflow-hidden text-left py-32 border-b border-neutral-800">
        <div className="max-w-4xl mx-auto px-6 lg:px-12 w-full font-sans">
          <div className="text-[12px] uppercase tracking-[0.2em] font-bold text-[#FF5500] mb-8">
            ZEHLA SmartHotel — Sistema Operacional
          </div>
          <h1 className="text-5xl sm:text-7xl md:text-8xl font-bold tracking-tighter text-white mb-8 uppercase leading-none">
            Não Perca<br />
            Mais Nenhuma<br />
            Reserva.
          </h1>
          <p className="text-xl text-neutral-400 max-w-2xl mb-12 font-medium leading-relaxed">
            Atendimento instantâneo 24h por WhatsApp. O ZEHLA responde, vende e faz o check-in sozinho enquanto você foca no que importa.
          </p>
          <div className="flex gap-4">
            <button
              onClick={onNavigate}
              className="px-8 py-4 bg-[#FF5500] hover:bg-[#EA580C] text-white font-bold text-sm uppercase tracking-wider rounded-none transition-all cursor-pointer"
            >
              Começar Teste Grátis
            </button>
          </div>
        </div>
      </section>
    );
  }

  if (styleOption === '3') {
    return (
      <section className="relative min-h-screen flex items-center justify-center bg-[#F9F6F0] overflow-hidden text-center py-24">
        <div className="max-w-3xl mx-auto px-6 w-full font-serif">
          <div className="text-neutral-400 text-sm italic tracking-widest mb-6">
            Zehla — Tecnologia Silenciosa
          </div>
          <h1 className="text-4xl sm:text-6xl text-neutral-800 font-light mb-10 leading-snug">
            Atendimento rápido no WhatsApp, hóspedes felizes.
          </h1>
          <p className="text-lg text-neutral-500 max-w-xl mx-auto mb-16 font-light leading-relaxed">
            O ZEHLA responde dúvidas instantaneamente 24h por dia, garantindo que você nunca mais perca uma venda por demora no atendimento.
          </p>
          <button
            onClick={onNavigate}
            className="px-10 py-3 bg-neutral-800 hover:bg-neutral-900 text-[#F9F6F0] font-light rounded-full transition-all cursor-pointer text-base shadow-sm"
          >
            Quero testar de graça
          </button>
        </div>
      </section>
    );
  }

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-[#050505]">
      {/* Background effects */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(255,85,0,0.1),transparent_70%)] pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,rgba(0,255,136,0.03),transparent_70%)] pointer-events-none" />
      <div className="absolute top-20 left-1/4 w-80 h-80 bg-[#FF5500]/5 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-20 right-1/4 w-[450px] h-[450px] bg-[#00FF88]/2 rounded-full blur-[160px] pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-[#FF5500]/2 rounded-full blur-[180px] pointer-events-none" />

      <div className="relative z-10 max-w-5xl mx-auto px-6 sm:px-8 text-center pt-24 pb-16">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full glass-strong border border-[#FF5500]/30 bg-[#FF5500]/5 backdrop-blur-md mb-8 text-xs font-black uppercase tracking-[0.15em] text-[#FF5500] shadow-[0_0_20px_rgba(255,85,0,0.15)] hover:border-[#FF5500]/50 transition-colors duration-300">
            <Brain className="w-4 h-4 animate-pulse" />
            <span>Perfis completos no Google recebem 7x mais visitas</span>
          </div>

          {/* H1 */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7.5xl font-black tracking-tight mb-8 leading-[1.08]" style={{ textWrap: 'pretty' }}>
            <span className="text-white drop-shadow-[0_2px_10px_rgba(0,0,0,0.5)]">Recupere os 25% de comissão</span>
            <br />
            <span className="bg-gradient-to-r from-[#FF5500] via-[#ff6a1a] to-[#FF5500] bg-clip-text text-transparent drop-shadow-[0_0_25px_rgba(255,85,0,0.35)] uppercase">
              que as OTAs levam de você
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-base sm:text-lg md:text-xl text-neutral-400 max-w-3xl mx-auto mb-12 leading-relaxed" style={{ textWrap: 'pretty' }}>
            Transforme o Google na sua principal fonte de reservas diretas. O ZEHLA automatiza seu atendimento e coloca sua pousada no topo das buscas —{' '}
            <span className="text-white font-bold underline decoration-[#FF5500]/40 decoration-2 underline-offset-4">
              pare de dar seu lucro para intermediários (as OTAs, como Booking e Airbnb, que cobram de 15% a 25% por reserva).
            </span>
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-5 mb-8">
            <motion.div 
              whileHover={{ scale: 1.03 }} 
              whileTap={{ scale: 0.97 }}
              animate={{ 
                boxShadow: [
                  "0 10px 30px rgba(255,85,0,0.2)", 
                  "0 10px 45px rgba(255,85,0,0.45)", 
                  "0 10px 30px rgba(255,85,0,0.2)"
                ] 
              }}
              transition={{ 
                duration: 2.5, 
                repeat: Infinity, 
                repeatType: "reverse" 
              }}
              className="rounded-2xl"
            >
              <button
                type="button"
                onClick={onNavigate}
                className="inline-flex items-center gap-3 px-10 py-5 bg-[#FF5500] hover:bg-[#ff6611] text-white font-extrabold rounded-2xl transition-all duration-300 cursor-pointer text-lg border border-white/10"
              >
                <Zap className="w-5 h-5 text-white" />
                Começar Teste Grátis
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform" />
              </button>
            </motion.div>

            <a
              href="#funcionalidades"
              className="inline-flex items-center gap-2 px-10 py-5 glass-strong border border-white/5 hover:border-[#FF5500]/25 text-neutral-300 hover:text-white font-semibold rounded-2xl transition-all duration-300 shadow-[0_10px_25px_rgba(0,0,0,0.2)]"
            >
              Ver como funciona
              <ChevronDown className="w-4 h-4" />
            </a>
          </div>

          <p className="text-xs text-neutral-600 font-bold uppercase tracking-widest mb-16">
            7 dias grátis • Sem cartão de crédito • Setup em 10 minutos
          </p>

          {/* Social proof */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="grid grid-cols-3 gap-4 sm:gap-6 max-w-2xl mx-auto"
          >
            {[
              { icon: Hotel, value: '150+', label: 'Pousadas Ativas' },
              { icon: Star, value: '98.7%', label: 'Satisfação' },
              { icon: Clock, value: '7 dias', label: 'Teste Grátis' },
            ].map((stat, i) => (
              <div 
                key={i} 
                className="glass-strong border border-white/5 hover:border-[#FF5500]/20 rounded-2xl p-5 text-center shadow-[0_15px_30px_rgba(0,0,0,0.4)] hover:shadow-[0_15px_35px_rgba(255,85,0,0.05)] transition-all duration-300 group"
              >
                <stat.icon className="w-5 h-5 text-[#FF5500] mx-auto mb-3 shadow-[0_0_8px_rgba(255,85,0,0.2)] group-hover:scale-110 transition-transform duration-300" />
                <div className="text-xl sm:text-3xl font-black text-white tracking-tight">{stat.value}</div>
                <div className="text-xs sm:text-sm text-neutral-400 font-bold tracking-tight mt-1.5">{stat.label}</div>
              </div>
            ))}
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
