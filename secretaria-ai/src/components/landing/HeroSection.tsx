'use client';

import { useRef, useState, useEffect } from 'react';
import { motion, useScroll, useTransform, useInView } from 'framer-motion';
import {
  Brain,
  ArrowRight,
  Play,
  Sparkles,
  MessageSquare,
  Bot,
} from 'lucide-react';

export function HeroSection() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start start', 'end start'],
  });
  const mockupY = useTransform(scrollYProgress, [0, 1], [0, 80]);
  const mockupOpacity = useTransform(scrollYProgress, [0, 0.6], [1, 0]);

  return (
    <section ref={ref} className="relative min-h-screen flex items-center overflow-hidden bg-[#0a0a0a]">
      {/* Subtle grid */}
      <div className="absolute inset-0 opacity-[0.03]" style={{
        backgroundImage: 'linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)',
        backgroundSize: '80px 80px',
      }} />

      {/* Ambient glow */}
      <div className="absolute top-1/4 -left-32 w-[500px] h-[500px] rounded-full bg-emerald-500/[0.07] blur-[120px]" />
      <div className="absolute bottom-1/4 -right-32 w-[400px] h-[400px] rounded-full bg-purple-500/[0.05] blur-[100px]" />

      <div className="relative z-10 max-w-7xl mx-auto px-6 pt-28 pb-20 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* LEFT — Text */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/[0.06] mb-6">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-emerald-400 text-xs font-medium">
                Cérebro ZÉLLA com IA Generativa v2.0
              </span>
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            </div>

            {/* Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-[3.5rem] font-extrabold leading-[1.08] text-white mb-6">
              O zelador da sua <span className="bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">pousada 24/7</span>.
            </h1>

            {/* Sub */}
            <p className="text-lg text-neutral-400 leading-relaxed mb-8 max-w-xl">
              O ZÉLLA é um <span className="text-white font-semibold">Sistema Operacional Cognitivo inteligente</span>, capaz de cuidar do seus maiores ativos, seu tempo e seu negócio. Responde suas mensagens no WhatsApp, conquista reservas, ajusta preços e faz seu negócio crescer enquanto você descansa ou curte a família. Comece grátis por 7 dias. Ganhe tempo!
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-4 mb-10">
              <button
                onClick={() => {
                  const el = document.querySelector('#precos');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }}
                className="group inline-flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-bold rounded-xl hover:from-emerald-400 hover:to-emerald-500 transition-all duration-200 shadow-xl shadow-emerald-500/30 cursor-pointer text-base"
              >
                Começar Grátis — 7 dias
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </button>
              <button
                onClick={() => {
                  const el = document.querySelector('#como-funciona');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }}
                className="group inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl border border-white/10 bg-white/[0.03] text-neutral-300 font-medium hover:bg-white/[0.06] hover:border-white/20 transition-all duration-200 cursor-pointer text-base"
              >
                <Play className="w-4 h-4 text-emerald-400" />
                Ver como funciona
              </button>
            </div>

            {/* Social proof mini */}
            <div className="flex items-center gap-6 text-sm text-neutral-500">
              <div className="flex -space-x-2">
                {['bg-emerald-500', 'bg-blue-500', 'bg-purple-500', 'bg-amber-500'].map((c, i) => (
                  <div key={i} className={`w-8 h-8 rounded-full ${c} border-2 border-[#0a0a0a] flex items-center justify-center text-[10px] font-bold text-white`}>
                    {['AC', 'RS', 'FL', 'CM'][i]}
                  </div>
                ))}
              </div>
              <span className="border-l border-white/10 pl-6">+500 pousadas já usam</span>
            </div>
          </motion.div>

          {/* RIGHT — Mockup Parallax */}
          <motion.div
            style={{ y: mockupY, opacity: mockupOpacity }}
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="relative"
          >
            {/* Main mockup */}
            <div className="relative bg-[#111] rounded-2xl border border-white/[0.08] shadow-2xl shadow-emerald-500/[0.05] overflow-hidden">
              {/* Top bar */}
              <div className="flex items-center gap-2 px-4 py-3 border-b border-white/[0.06]">
                <div className="w-3 h-3 rounded-full bg-red-500/80" />
                <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                <div className="w-3 h-3 rounded-full bg-green-500/80" />
                <span className="text-neutral-600 text-[11px] ml-3 font-mono">ZÉLLA Console — Pousada Serenity</span>
              </div>

              {/* Dashboard content */}
              <div className="p-5 space-y-4">
                {/* Stats row */}
                <div className="grid grid-cols-4 gap-3">
                  {[
                    { label: 'Leads Ativos', val: '47', color: 'text-emerald-400' },
                    { label: 'Reservas Hoje', val: '12', color: 'text-blue-400' },
                    { label: 'Conversão', val: '34%', color: 'text-purple-400' },
                    { label: 'Receita Mês', val: 'R$18.4k', color: 'text-amber-400' },
                  ].map((s) => (
                    <div key={s.label} className="bg-white/[0.03] rounded-xl p-3 border border-white/[0.05]">
                      <div className={`text-lg font-bold ${s.color}`}>{s.val}</div>
                      <div className="text-neutral-600 text-[10px] mt-0.5">{s.label}</div>
                    </div>
                  ))}
                </div>

                {/* Chat mockup */}
                <div className="bg-white/[0.02] rounded-xl p-4 border border-white/[0.05] space-y-3">
                  <div className="flex items-center gap-2 pb-2 border-b border-white/[0.04]">
                    <MessageSquare className="w-4 h-4 text-emerald-400" />
                    <span className="text-white text-xs font-medium">WhatsApp IA — Atendimento em Tempo Real</span>
                    <span className="ml-auto w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  </div>
                  <div className="flex gap-2.5 justify-end">
                    <div className="bg-emerald-500/10 rounded-xl rounded-tr-sm px-3 py-2 text-xs text-emerald-300 max-w-[80%]">
                      Boa noite! Vocês tem disponibilidade para o fim de semana?
                    </div>
                  </div>
                  <div className="flex gap-2.5">
                    <div className="w-7 h-7 rounded-full bg-emerald-500/20 flex items-center justify-center shrink-0">
                      <Bot className="w-3.5 h-3.5 text-emerald-400" />
                    </div>
                    <div className="bg-white/[0.05] rounded-xl rounded-tl-sm px-3 py-2 text-xs text-neutral-300 max-w-[80%]">
                      Olá! Seja bem-vindo à Pousada Serenity. Tenho suítes disponíveis de 15 a 18 de junho. Qual a melhor data para você?
                    </div>
                  </div>
                  <div className="flex gap-2.5 justify-end">
                    <div className="bg-emerald-500/10 rounded-xl rounded-tr-sm px-3 py-2 text-xs text-emerald-300 max-w-[80%]">
                      Perfeito! Quero reservar o chalé de 16 a 18. Tem como ver preços?
                    </div>
                  </div>
                  <div className="flex gap-2.5">
                    <div className="w-7 h-7 rounded-full bg-emerald-500/20 flex items-center justify-center shrink-0">
                      <Bot className="w-3.5 h-3.5 text-emerald-400" />
                    </div>
                    <div className="bg-white/[0.05] rounded-xl rounded-tl-sm px-3 py-2 text-xs text-neutral-300 max-w-[80%]">
                      Claro! O Chalé Premium para 2 noites: <strong className="text-white">R$480</strong> via PIX ou 3x de R$170. Posso gerar o PIX agora?
                    </div>
                  </div>
                </div>

                {/* Mini graph */}
                <div className="bg-white/[0.02] rounded-xl p-3 border border-white/[0.05]">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-neutral-400 text-[10px]">Receita Semanal</span>
                    <span className="text-emerald-400 text-[10px] font-medium">+35% vs semana anterior</span>
                  </div>
                  <div className="flex items-end gap-1.5 h-12">
                    {[40, 55, 35, 65, 80, 60, 90].map((h, i) => (
                      <div key={i} className="flex-1 bg-emerald-500/20 rounded-t-sm" style={{ height: `${h}%` }}>
                        <div className="w-full h-full bg-gradient-to-t from-emerald-500/40 to-emerald-500/10 rounded-t-sm" />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Floating notification */}
            <motion.div
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' as const }}
              className="absolute -right-4 top-16 bg-[#111] border border-white/[0.08] rounded-xl px-4 py-3 shadow-xl"
            >
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                  <Brain className="w-4 h-4 text-emerald-400" />
                </div>
                <div>
                  <div className="text-white text-[11px] font-medium">Cérebro ZÉLLA</div>
                  <div className="text-neutral-500 text-[9px]">Preço ajustado +12% demanda</div>
                </div>
              </div>
            </motion.div>

            {/* Floating PIX */}
            <motion.div
              animate={{ y: [0, 8, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' as const, delay: 1 }}
              className="absolute -left-4 bottom-20 bg-[#111] border border-white/[0.08] rounded-xl px-4 py-3 shadow-xl"
            >
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-amber-500/20 flex items-center justify-center">
                  <span className="text-amber-400 text-[10px] font-bold">PIX</span>
                </div>
                <div>
                  <div className="text-white text-[11px] font-medium">Pagamento recebido</div>
                  <div className="text-emerald-400 text-[9px] font-medium">R$480,00 confirmado</div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}