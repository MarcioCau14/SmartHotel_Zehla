'use client';

import { motion } from 'framer-motion';
import { Star, TrendingUp, Building2, Users, Instagram } from 'lucide-react';

const TESTIMONIALS = [
  {
    name: 'Marina & Ricardo',
    pousada: 'Pousada Caminho do Rei',
    city: 'Paraty, RJ',
    quote: 'Em 30 dias o ZEHLA já tinha pago o ano inteiro de assinatura. As reservas diretas pelo WhatsApp quintuplicaram.',
    impact: '+420% reservas diretas',
    avatar: 'MR',
    instagram: '@pousadacaminhodorei',
  },
  {
    name: 'Carla Santoro',
    pousada: 'Vila dos Orixás',
    city: 'Morro de São Paulo, BA',
    quote: 'Deixamos de pagar R$ 12.000/mês em comissões de OTA. O ZEHLA nos devolveu o controle do nosso negócio.',
    impact: 'R$ 12.000/mês economizados',
    avatar: 'CS',
    instagram: '@viladosorixas',
  },
  {
    name: 'Thiago Almeida',
    pousada: 'Pousada do Bosque',
    city: 'Campos do Jordão, SP',
    quote: 'O atendente IA fecha reservas enquanto durmo. Acordo com o Pix na conta e o café passado. Parece mágica.',
    impact: '+35% reservas noturnas',
    avatar: 'TA',
    instagram: '@pousadadobosque',
  },
  {
    name: 'Ana Paula Macedo',
    pousada: 'Pousada Recanto das Águas',
    city: 'Caldas Novas, GO',
    quote: 'Meu perfil no ZEHLA virou meu principal canal de vendas. Todo mundo que chega no Instagram já reserva direto pelo link.',
    impact: 'Perfil com 5.000+ visitas',
    avatar: 'AP',
    instagram: '@recantodasaguas',
  },
  {
    name: 'Fernando Luz',
    pousada: 'Pousada Serra Verde',
    city: 'Monte Verde, MG',
    quote: 'O linktree do ZEHLA substituiu 3 ferramentas que eu pagava. Agora é um link só: WhatsApp, Instagram, reservas, tudo organizado.',
    impact: '1 ferramenta = 3 substituídas',
    avatar: 'FL',
    instagram: '@serraverde_pousada',
  },
];

const METRICS = [
  { icon: TrendingUp, value: '94%', label: 'dos leads convertem em até 7 dias' },
  { icon: Building2, value: 'R$ 18.000+', label: 'de MRR médio por pousada ativa' },
  { icon: Users, value: '10.000+', label: 'pousadas na base ZEHLA' },
  { icon: Star, value: '4.9/5', label: 'de satisfação dos clientes' },
];

export function SocialProof() {
  return (
    <>
      {/* Metrics Strip */}
      <section className="max-w-7xl mx-auto px-4 mt-20">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-16 py-12 border-y border-white/5">
          {METRICS.map((m, i) => (
            <motion.div
              key={m.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="text-center"
            >
              <div className="text-2xl md:text-3xl font-black text-white mb-1">{m.value}</div>
              <div className="text-[10px] text-neutral-500 uppercase tracking-widest">{m.label}</div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <section className="max-w-7xl mx-auto px-4 py-20">
        <motion.h2
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-3xl font-bold text-center mb-14"
        >
          Quem usa ZEHLA <span className="text-orange-500">não volta atrás</span>
        </motion.h2>

        <div className="grid md:grid-cols-3 lg:grid-cols-5 gap-4">
          {TESTIMONIALS.map((t, i) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className="glass-strong border border-white/5 rounded-[1.5rem] p-6 relative group hover:border-orange-500/20 transition-colors"
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500/20 to-amber-500/20 border border-orange-500/20 flex items-center justify-center font-bold text-orange-500 text-sm mb-4">
                {t.avatar}
              </div>

              <blockquote className="text-neutral-400 text-xs leading-relaxed mb-5">
                &ldquo;{t.quote}&rdquo;
              </blockquote>

              <div className="mb-3">
                <div className="font-bold text-white text-xs">{t.name}</div>
                <div className="text-[10px] text-neutral-500">{t.pousada} · {t.city}</div>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-white/5">
                <span className="text-orange-500 font-bold text-[10px] tracking-wider">{t.impact}</span>
                <span className="text-[10px] text-neutral-600 flex items-center gap-1">
                  <Instagram className="w-3 h-3" /> {t.instagram}
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      </section>
    </>
  );
}
