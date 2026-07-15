'use client';

import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { Star, Quote, MessageSquare } from 'lucide-react';

const testimonials = [
  {
    name: 'Ana Claudia M.',
    role: 'Pousada Serenity — Búzios, RJ',
    text: 'Minha pousada recebe 60 conversas por dia no WhatsApp. Antes eu tinha medo da conta estourar com as novas regras da API. Com o Zélla, o custo mensal caiu muito porque ele otimiza cada resposta. São R$ 167 que vão direto pro lucro, todo mês.',
    rating: 5,
    color: 'emerald',
  },
  {
    name: 'Roberto S.',
    role: 'Chalés da Montanha — Campos do Jordão, SP',
    text: 'Eu tinha medo de ligar a IA no WhatsApp com medo de errar algum preço. O Zélla segue minha tabela à risca e o controle de custo me dá tranquilidade — sei exatamente quanto vou gastar antes de gastar.',
    rating: 5,
    color: 'blue',
  },
  {
    name: 'Fernanda L.',
    role: 'Pousada dos Coqueiros — Noronha, PE',
    text: 'O agrupamento inteligente do Zélla é incrível. Meu hóspede manda "Oi", "Tem vaga?", "Preço?" em sequência. O Zélla responde TUDO em uma mensagem só, super profissional. No fim do mês, a diferença no custo é enorme.',
    rating: 5,
    color: 'royal',
  },
  {
    name: 'Carlos A.',
    role: 'Pousada Terra Mater — Ouro Preto, MG',
    text: 'Antes eu nem sabia que a API do WhatsApp ia ter custo por mensagem. Testei o Zélla, vi a diferença no dashboard e assinei na hora. Em 30 dias já tinha reduzido bastante os custos e ainda gerei reservas que eu teria perdido.',
    rating: 5,
    color: 'amber',
  },
  {
    name: 'Patrícia R.',
    role: 'Villa Mar e Sol — Porto Seguro, BA',
    text: 'Comecei com o teste grátis e em 5 dias já vi a diferença no dashboard. A IA responde com o tom da minha pousada e os hóspedes nem percebem que é automatizado. O plano LITE se paga sozinho com as reservas que a IA gera.',
    rating: 5,
    color: 'emerald',
  },
  {
    name: 'Lucas M.',
    role: 'Eco Lodge Araçá — Tiradentes, MG',
    text: 'Entrei no Programa Beta e paguei R$ 0 no primeiro mês. Agora sou PRO e recebo reservas que antes eu perdia por não responder rápido o suficiente. O retorno do plano se paga pelas reservas extras — e ainda reduzo custos por cima.',
    rating: 5,
    color: 'blue',
  },
];

const colorMap: Record<string, { border: string; bg: string; star: string }> = {
  emerald: { border: 'border-emerald-500/15', bg: 'from-emerald-500/10 to-emerald-900/5', star: 'text-emerald-400' },
  blue: { border: 'border-blue-500/15', bg: 'from-blue-500/10 to-blue-900/5', star: 'text-blue-400' },
  royal: { border: 'border-blue-500/15', bg: 'from-blue-500/10 to-blue-900/5', star: 'text-blue-400' },
  amber: { border: 'border-amber-500/15', bg: 'from-amber-500/10 to-amber-900/5', star: 'text-amber-400' },
};

export function TestimonialsSection() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <section ref={ref} id="depoimentos" className="parallax-section parallax-grid py-24 sm:py-32">
      <div className="relative z-10 max-w-6xl mx-auto px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 mb-4">
            <MessageSquare className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-amber-400 text-xs font-medium">Depoimentos Reais</span>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white mb-4">
            O que os donos de pousada
            <br />
            <span className="text-amber-400">estão dizendo sobre o Zélla</span>
          </h2>
          <p className="text-neutral-400 text-lg max-w-xl mx-auto">
            Pousadeiros que já usam o Zélla para vender mais e atender melhor pelo WhatsApp.
          </p>
        </motion.div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {testimonials.map((t, i) => {
            const c = colorMap[t.color];
            return (
              <motion.div
                key={t.name}
                initial={{ opacity: 0, y: 30 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6, delay: i * 0.1 }}
                className={`relative p-6 rounded-2xl bg-white/[0.02] border ${c.border} hover:bg-white/[0.04] transition-all duration-300`}
              >
                {/* Quote icon */}
                <Quote className={`w-8 h-8 ${c.star} opacity-20 mb-3`} />

                {/* Stars */}
                <div className="flex items-center gap-0.5 mb-4">
                  {Array.from({ length: t.rating }).map((_, j) => (
                    <Star key={j} className={`w-3.5 h-3.5 ${c.star} fill-current`} />
                  ))}
                </div>

                {/* Text */}
                <p className="text-neutral-300 text-sm leading-relaxed mb-5">&ldquo;{t.text}&rdquo;</p>

                {/* Author */}
                <div className="flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-full bg-gradient-to-br ${c.bg} flex items-center justify-center text-xs font-bold text-white`}>
                    {t.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div>
                    <div className="text-white text-sm font-semibold">{t.name}</div>
                    <div className="text-neutral-400 text-[11px]">{t.role}</div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}