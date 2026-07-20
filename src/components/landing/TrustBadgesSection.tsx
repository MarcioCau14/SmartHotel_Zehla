'use client';

import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { useNiche } from '@/contexts/NicheContext';

const allLogos = [
  'Booking.com',
  'Airbnb',
  'Trivago',
  'Decolar',
  'Expedia',
  'TripAdvisor',
  'Google Hotels',
  'Mercado Pago',
];

export function TrustBadgesSection() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-50px' });
  const { isAirbnb } = useNiche();

  // Parceiro niche: filter out Airbnb-specific platforms, use generic terms
  const logos = isAirbnb
    ? allLogos
    : allLogos;

  const subtitle = 'Integrado com as maiores plataformas de hospedagem do Brasil';

  return (
    <section ref={ref} className="py-14 bg-[#0a0a0a] border-y border-white/[0.04]">
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.6 }}
        className="max-w-6xl mx-auto px-6"
      >
        <p className="text-center text-neutral-400 text-sm mb-8">
          {subtitle}
        </p>
        <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-5">
          {logos.map((logo, i) => (
            <motion.span
              key={logo}
              initial={{ opacity: 0 }}
              animate={isInView ? { opacity: 1 } : {}}
              transition={{ duration: 0.4, delay: i * 0.07 }}
              className="text-neutral-500 text-sm font-semibold tracking-wide whitespace-nowrap hover:text-neutral-300 transition-colors duration-200"
            >
              {logo}
            </motion.span>
          ))}
        </div>
      </motion.div>
    </section>
  );
}
