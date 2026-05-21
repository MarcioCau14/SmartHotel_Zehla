'use client';

import { motion } from 'framer-motion';
import { Star } from 'lucide-react';

const testimonials = [
  {
    name: 'Marcia R.',
    property: 'Pousada do Sol',
    city: 'Imbituba, SC',
    quote: 'Antes eu ia dormir com o celular na mão respondendo orçamentos. Hoje eu acordo, tomo café com a minha família, e o ZEHLA já fechou as reservas da madrugada sozinho.',
    rating: 5,
    initials: 'MR',
  },
  {
    name: 'Gustavo P.',
    property: 'Pousada Rosa Norte',
    city: 'Praia do Rosa, SC',
    quote: 'A precificação da IA fez tudo sozinha. O sistema se pagou no primeiro mês só com o lucro extra que eu deixava na mesa.',
    rating: 5,
    initials: 'GP',
  },
  {
    name: 'Beatriz S.',
    property: 'Pousada Jardim Botânico',
    city: 'Florianópolis, SC',
    quote: 'Aposentei o caderno de papel e as planilhas confusas. O mapa de quartos é perfeito, não tenho mais overbooking e fecho vendas diretas sem pagar 15% de comissão.',
    rating: 5,
    initials: 'BS',
  },
  {
    name: 'Rodrigo F.',
    property: 'Pousada da Guarda',
    city: 'Guarda do Embaú, SC',
    quote: 'Meus hóspedes chegam elogiando a rapidez do nosso atendimento. Mal sabem eles que quem tira dúvidas em 5 segundos é o nosso zelador virtual.',
    rating: 5,
    initials: 'RF',
  },
];

export function TestimonialsSection() {
  return (
    <section id="depoimentos" className="vzap-section-white vzap-section-padding">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-14"
        >
          <h2 className="vzap-heading">
            O que os donos de pousada estão dizendo
          </h2>
          <p className="max-w-2xl mx-auto" style={{ color: '#667781', fontSize: '16px' }}>
            Histórias reais de quem já transformou sua operação com o ZEHLA.
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 gap-6">
          {testimonials.map((t, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="vzap-card p-7"
            >
              <div className="flex gap-0.5 mb-4">
                {Array.from({ length: t.rating }).map((_, j) => (
                  <Star key={j} className="w-4 h-4" style={{ color: '#ffb829', fill: '#ffb829' }} />
                ))}
              </div>

              <p style={{ color: '#667781', lineHeight: 1.8, fontSize: '14px', marginBottom: '20px' }}>
                &ldquo;{t.quote}&rdquo;
              </p>

              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold"
                  style={{ background: 'linear-gradient(135deg, #25D366, #128C7E)', color: '#fff' }}
                >
                  {t.initials}
                </div>
                <div>
                  <div style={{ fontSize: '14px', fontWeight: 500, color: '#111B21' }}>
                    {t.name}
                  </div>
                  <div style={{ fontSize: '12px', color: '#667781' }}>
                    {t.property} · {t.city}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
