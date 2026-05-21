'use client';

import { motion } from 'framer-motion';

const partners = [
  { name: 'WhatsApp', color: '#25D366' },
  { name: 'Booking.com', color: '#0047AB' },
  { name: 'Airbnb', color: '#FF5A5F' },
  { name: 'PIX', color: '#00BDAE' },
  { name: 'Instagram', color: '#E4405F' },
  { name: 'Google', color: '#4285F4' },
  { name: 'Stripe', color: '#635BFF' },
  { name: 'Evolution API', color: '#1c66de' },
];

export function PartnersStrip() {
  return (
    <section className="vzap-section-white" style={{ padding: '40px 0', borderTop: '1px solid #ebebeb', borderBottom: '1px solid #ebebeb' }}>
      <div className="max-w-6xl mx-auto px-4">
        <p
          className="text-center text-xs mb-8 uppercase tracking-wider"
          style={{ color: '#b7b7b7', fontFamily: "'Archivo', sans-serif" }}
        >
          Integrado com as plataformas que você já usa
        </p>
        <div className="flex flex-wrap items-center justify-center gap-8 md:gap-12">
          {partners.map((partner, i) => (
            <motion.div
              key={partner.name}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.08 }}
              className="flex items-center gap-2 cursor-default"
            >
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: partner.color }}
              />
              <span
                className="text-sm font-medium partner-logo"
                style={{ color: '#303030', fontFamily: "'Archivo', sans-serif" }}
              >
                {partner.name}
              </span>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
