'use client';

import { motion } from 'framer-motion';
import { Star, TrendingUp, Users, Award, Quote, Instagram } from 'lucide-react';

const metrics = [
  { icon: TrendingUp, value: '94%', label: 'dos leads convertem em até 7 dias' },
  { icon: Award, value: 'R$ 18K+', label: 'de MRR médio por pousada ativa' },
  { icon: Users, value: '10.000+', label: 'pousadas na base ZEHLA' },
  { icon: Star, value: '4.9/5', label: 'de satisfação dos clientes' },
];

const testimonials = [
  {
    name: 'Marina & Ricardo',
    pousada: 'Pousada Caminho do Rei',
    city: 'Paraty, RJ',
    text: 'O ZEHLA transformou nossa prospecção. Em três meses, passamos de reféns das plataformas para donos do nosso funil de vendas. As reservas diretas cresceram 420% — e o melhor, sem pagar um centavo de comissão.',
    impact: '+420% reservas diretas',
    instagram: '@pousadacaminhodorei',
    color: 'from-orange-500 to-amber-600',
  },
  {
    name: 'Carla Santoro',
    pousada: 'Vila dos Orixás',
    city: 'Morro de São Paulo, BA',
    text: 'Economizamos mais de R$ 12.000 por mês que antes iam para comissões de OTAs. O perfil da pousada no link do Instagram virou nossa principal vitrine. Hóspede vê, se encanta e já reserva direto no WhatsApp.',
    impact: 'R$ 12.000/mês economizados',
    instagram: '@viladosorixas',
    color: 'from-emerald-500 to-teal-600',
  },
  {
    name: 'Thiago Almeida',
    pousada: 'Pousada do Bosque',
    city: 'Campos do Jordão, SP',
    text: 'O sistema de preços inteligentes do PRO nos pegou de surpresa. Subimos a diária em 35% nos feriados sem perder ocupação. A IA busca hóspedes que desistiram e recupera vendas que achávamos perdidas.',
    impact: '+35% reservas noturnas',
    instagram: '@pousadadobosque',
    color: 'from-orange-500 to-amber-600',
  },
  {
    name: 'Ana Paula Macedo',
    pousada: 'Pousada Recanto das Águas',
    city: 'Caldas Novas, GO',
    text: 'Meu perfil no ZEHLA já teve mais de 5.000 visitas em dois meses. O melhor: cada visita é um potencial hóspede que me chamou direto no WhatsApp. Sem taxa, sem intermediário, sem dor de cabeça.',
    impact: '5.000+ visitas no perfil',
    instagram: '@recantodasaguas',
    color: 'from-emerald-500 to-teal-600',
  },
  {
    name: 'Fernando Luz',
    pousada: 'Pousada Serra Verde',
    city: 'Monte Verde, MG',
    text: 'Eu usava três ferramentas diferentes para fazer o que o ZEHLA faz em uma só. Atendimento, agenda, linktree e relatórios. Minha equipe aprendeu em um dia. Economia de tempo e dinheiro que mudou o jogo.',
    impact: '3 ferramentas em 1',
    instagram: '@serraverde_pousada',
    color: 'from-orange-500 to-amber-600',
  },
];

function getInitials(name: string) {
  return name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
}

export function SocialProof() {
  return (
    <section className="py-24 px-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-orange-500/[0.02] via-transparent to-emerald-500/[0.02] pointer-events-none" />

      <div className="max-w-7xl mx-auto relative">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-black text-white mb-4">
            Quem já usa <span className="text-orange-500">recomenda</span>
          </h2>
          <p className="text-neutral-500 text-lg max-w-2xl mx-auto">
            Pousadas de todo o Brasil já estão faturando mais com o ZEHLA.
          </p>
        </div>

        <div className="grid md:grid-cols-4 gap-6 mb-20">
          {metrics.map((metric, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="glass-strong border border-white/5 rounded-2xl p-6 text-center hover:border-orange-500/20 transition-all"
            >
              <metric.icon className="w-6 h-6 text-orange-500 mx-auto mb-3" />
              <div className="text-3xl font-black text-white mb-1">{metric.value}</div>
              <div className="text-xs text-neutral-500">{metric.label}</div>
            </motion.div>
          ))}
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {testimonials.map((t, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className={`glass-strong border border-white/5 rounded-3xl p-8 hover:border-orange-500/20 transition-all relative overflow-hidden ${i === 0 ? 'lg:col-span-2 lg:row-span-1' : ''}`}
            >
              <Quote className="absolute top-4 right-4 w-8 h-8 text-white/5" />

              <div className="flex items-center gap-4 mb-5">
                <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${t.color} flex items-center justify-center text-black font-bold text-sm`}>
                  {getInitials(t.name)}
                </div>
                <div>
                  <div className="font-bold text-white text-sm">{t.name}</div>
                  <div className="text-xs text-neutral-500">{t.pousada}</div>
                  <div className="text-[10px] text-neutral-600">{t.city}</div>
                </div>
              </div>

              <p className="text-neutral-400 text-sm leading-relaxed mb-5 italic">
                &ldquo;{t.text}&rdquo;
              </p>

              <div className="flex items-center justify-between">
                <span className={`text-xs font-bold bg-gradient-to-r ${t.color} bg-clip-text text-transparent`}>
                  {t.impact}
                </span>
                <a
                  href={`https://instagram.com/${t.instagram.replace('@', '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-[10px] text-neutral-600 hover:text-neutral-400 transition-colors"
                >
                  <Instagram className="w-3 h-3" />
                  {t.instagram}
                </a>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
