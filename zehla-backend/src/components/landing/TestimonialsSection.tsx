'use client';

import { motion } from 'framer-motion';
import { Star, Quote } from 'lucide-react';
import Image from 'next/image';

const testimonials = [
  {
    name: 'Marcia R.',
    property: 'Pousada do Sol',
    city: 'Imbituba, SC',
    quote:
      'Antes eu ia dormir com o celular na mão respondendo orçamentos com medo de perder o cliente. Hoje eu acordo, tomo café com a minha família, e o ZEHLA já fechou as reservas da madrugada sozinho.',
    rating: 5,
    image: '/images/testimonials/owner_lite.png',
  },
  {
    name: 'Gustavo P.',
    property: 'Pousada Rosa Norte',
    city: 'Praia do Rosa, SC',
    quote:
      'Sempre tive receio de cobrar barato demais ou caro demais nos feriados. A precificação da IA fez tudo sozinha. O sistema se pagou no primeiro mês só com o lucro extra que eu deixava na mesa.',
    rating: 5,
    image: '/images/testimonials/owner_pro.png',
  },
  {
    name: 'Beatriz S.',
    property: 'Pousada Jardim Botânico',
    city: 'Florianópolis, SC',
    quote:
      'Aposentei o caderno de papel e as planilhas confusas. O mapa de quartos é perfeito, não tenho mais overbooking e, o melhor: fecho vendas diretas no WhatsApp sem pagar 15% de comissão para outros sites.',
    rating: 5,
    image: '/images/testimonials/owner_max.png',
  },
  {
    name: 'Rodrigo F.',
    property: 'Pousada da Guarda',
    city: 'Guarda do Embaú, SC',
    quote:
      'Meus hóspedes chegam elogiando a rapidez do nosso atendimento. Mal sabem eles que quem tira dúvidas em 5 segundos, envia fotos e negocia é o nosso zelador virtual. Mudou a cara da pousada.',
    rating: 5,
    image: '/images/testimonials/owner_experience.png',
  },
];

export function TestimonialsSection() {
  return (
    <section id="depoimentos" className="relative py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto z-10">
      {/* Subtle Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-[#FF5500]/3 rounded-full blur-[120px] pointer-events-none -z-10" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="text-center mb-16"
      >
        <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mb-4">
          O "Efeito Reverso": Deixando o{' '}
          <span className="text-[#FF5500]">caos para trás</span>
        </h2>
        <p className="text-[#898989] text-base max-w-2xl mx-auto">
          Histórias reais de donos de pousadas que recuperaram sua liberdade e lucratividade.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
        {testimonials.map((t, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: i * 0.1 }}
            className="bg-[#090909]/40 border border-white/5 backdrop-blur-xl rounded-3xl p-8 hover:border-white/10 hover:shadow-[0_0_30px_rgba(255,85,0,0.02)] transition-all duration-300 relative group"
          >
            {/* Quote icon */}
            <Quote className="absolute top-8 right-8 w-12 h-12 text-[#FF5500]/5 group-hover:text-[#FF5500]/10 transition-colors" />

            {/* Stars */}
            <div className="flex gap-1 mb-6">
              {Array.from({ length: t.rating }).map((_, j) => (
                <Star
                  key={j}
                  className="w-4 h-4 text-[#FF5500] fill-[#FF5500]"
                />
              ))}
            </div>

            {/* Quote text */}
            <p className="text-[#b4b4b4] italic leading-relaxed mb-8 text-base">
              &ldquo;{t.quote}&rdquo;
            </p>

            {/* Author */}
            <div className="flex items-center gap-4">
              <div className="relative w-14 h-14 rounded-full overflow-hidden border border-white/10 group-hover:border-[#FF5500]/30 transition-colors bg-white/5">
                <Image
                  src={t.image}
                  alt={t.name}
                  fill
                  className="object-cover"
                />
              </div>
              <div>
                <div className="text-base font-bold text-white tracking-tight">
                  {t.name}
                </div>
                <div className="text-xs text-[#898989] font-medium mt-0.5">
                  {t.property} • {t.city}
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
