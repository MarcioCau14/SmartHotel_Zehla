'use client';

import { motion } from 'framer-motion';
import { Star, TrendingUp, Building2, Users } from 'lucide-react';

const TESTIMONIALS = [
  {
    name: 'Marina & Ricardo',
    pousada: 'Pousada Caminho do Rei',
    city: 'Paraty, RJ',
    quote: 'Em 30 dias o ZEHLA já tinha pago o ano inteiro de assinatura. As reservas diretas pelo WhatsApp quintuplicaram.',
    impact: '+420% reservas diretas',
    avatar: 'MR',
  },
  {
    name: 'Carla Santoro',
    pousada: 'Vila dos Orixás',
    city: 'Morro de São Paulo, BA',
    quote: 'Deixamos de pagar R$ 12.000/mês em comissões de OTA. O ZEHLA nos devolveu o controle do nosso negócio.',
    impact: 'R$ 12.000/mês economizados',
    avatar: 'CS',
  },
  {
    name: 'Thiago Almeida',
    pousada: 'Pousada do Bosque',
    city: 'Campos do Jordão, SP',
    quote: 'O atendente IA fecha reservas enquanto durmo. Acordo com o Pix na conta e o café passado. Parece mágica.',
    impact: '+35% reservas noturnas',
    avatar: 'TA',
  },
];

const METRICS = [
  { icon: TrendingUp, value: '94%', label: 'dos leads convertem em até 7 dias' },
  { icon: Building2, value: 'R$ 18.000+', label: 'de MRR médio por pousada ativa' },
  { icon: Users, value: '10.000+', label: 'pousadas na base ZEHLA' },
];

export function SocialProof() {
  return (
    <>
      {/* Metrics Strip */}
      <section className="max-w-6xl mx-auto px-4 mt-20">
        <div className="grid grid-cols-3 gap-8 md:gap-16 py-12 border-y border-white/5">
          {METRICS.map((m, i) => (
            <motion.div
              key={m.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="text-center"
            >
              <m.i className="w-8 h-8 text-neutral-600 mb-3 mx-auto block" />
              <div className="text-3xl md:text-4xl font-black text-white mb-1">{m.value}</div>
              <div className="text-xs text-neutral-500 uppercase tracking-widest">{m.label}</div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <section className="max-w-6xl mx-auto px-4 py-20">
        <motion.h2
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-3xl font-bold text-center mb-14"
        >
          Quem usa ZEHLA <span className="text-orange-500">não volta atrás</span>
        </motion.h2>

        <div className="grid md:grid-cols-3 gap-6">
          {TESTIMONIALS.map((t, i) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15 }}
              className="glass-strong border border-white/5 rounded-[2rem] p-8 relative group hover:border-orange-500/20 transition-colors"
            >
              <div className="absolute top-6 right-6 opacity-20 group-hover:opacity-40 transition-opacity">
                <Star className="w-8 h-8 text-orange-500" />
              </div>

              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-orange-500/20 to-amber-500/20 border border-orange-500/20 flex items-center justify-center font-bold text-orange-500 mb-6">
                {t.avatar}
              </div>

              <blockquote className="text-neutral-300 text-sm leading-relaxed mb-8">
                &ldquo;{t.quote}&rdquo;
              </blockquote>

              <div>
                <div className="font-bold text-white text-sm">{t.name}</div>
                <div className="text-xs text-neutral-500">{t.pousada} · {t.city}</div>
              </div>

              <div className="mt-4 pt-4 border-t border-white/5">
                <span className="text-orange-500 font-bold text-xs tracking-wider">
                  {t.impact}
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      </section>
    </>
  );
}
