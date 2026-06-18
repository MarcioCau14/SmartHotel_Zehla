'use client';

import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { Star, Quote, MessageSquare } from 'lucide-react';

const testimonials = [
  {
    name: 'Ana Claudia M.',
    role: 'Pousada Serenity — Búzios, RJ',
    text: 'Em 3 semanas o ZÉLLA já tinha gerado 47 reservas que eu teria perdido. A IA responde no WhatsApp mais rápido que eu e nunca erra o preço. Meu faturamento subiu 35% no primeiro mês.',
    rating: 5,
    color: 'emerald',
  },
  {
    name: 'Roberto S.',
    role: 'Chalés da Montanha — Campos do Jordão, SP',
    text: 'Eu gastava 6 horas por dia respondendo WhatsApp. Agora a IA faz 90% do trabalho e eu só intervenho quando é algo realmente complexo. Consigo focar na experiência do hóspede, não no celular.',
    rating: 5,
    color: 'blue',
  },
  {
    name: 'Fernanda L.',
    role: 'Pousada dos Coqueiros — Noronha, PE',
    text: 'O preço dinâmico é mágico. Num feriado lotado o sistema ajustou automaticamente e eu ganhei R$3.200 a mais em 3 dias. Antes eu deixava esse dinheiro na mesa sem saber.',
    rating: 5,
    color: 'purple',
  },
  {
    name: 'Carlos A.',
    role: 'Pousada Terra Mater — Ouro Preto, MG',
    text: 'O link-in-bio transformou meu Instagram numa máquina de reservas. Antes era só fotos bonitas sem conversão. Agora cada post gera pelo menos 2 reservas diretas. ROI absurdo.',
    rating: 5,
    color: 'amber',
  },
  {
    name: 'Patrícia R.',
    role: 'Villa Mar e Sol — Porto Seguro, BA',
    text: 'Comecei com o plano gratuito e em 5 dias já assinei o LITE. O trial me convenceu sozinho. A IA é tão natural que os hóspedes acham que sou eu respondendo às 3 da manhã.',
    rating: 5,
    color: 'emerald',
  },
  {
    name: 'Lucas M.',
    role: 'Eco Lodge Araçá — Tiradentes, MG',
    text: 'Como fundador do programa beta, pague R$0 no primeiro mês e agora tenho preço vitalício de R$197. O suporte VIP faz diferença — problemas são resolvidos em minutos, não dias.',
    rating: 5,
    color: 'blue',
  },
];

const colorMap: Record<string, { border: string; bg: string; star: string }> = {
  emerald: { border: 'border-emerald-500/15', bg: 'from-emerald-500/10 to-emerald-900/5', star: 'text-emerald-400' },
  blue: { border: 'border-blue-500/15', bg: 'from-blue-500/10 to-blue-900/5', star: 'text-blue-400' },
  purple: { border: 'border-purple-500/15', bg: 'from-purple-500/10 to-purple-900/5', star: 'text-purple-400' },
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
            <span className="text-amber-400">estão dizendo</span>
          </h2>
          <p className="text-neutral-400 text-lg max-w-xl mx-auto">
            Histórias reais de pousadeiros que transformaram seus negócios com o ZÉLLA. Resultados que falam mais alto que qualquer copy.
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
                    <div className="text-neutral-500 text-[11px]">{t.role}</div>
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
