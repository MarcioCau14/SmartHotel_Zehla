'use client';

import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

interface CTASectionProps {
  onNavigate?: () => void;
}

export function CTASection({ onNavigate }: CTASectionProps) {
  return (
    <section style={{ background: 'linear-gradient(135deg, #25D366 0%, #128C7E 50%, #075E54 100%)', padding: '72px 0', position: 'relative', overflow: 'hidden' }}>
      {/* Decorative circles */}
      <div className="vzap-deco-circle" style={{ width: '400px', height: '400px', top: '-100px', right: '-100px', opacity: 0.2 }} />
      <div className="vzap-deco-circle" style={{ width: '250px', height: '250px', bottom: '-50px', left: '-50px', opacity: 0.15 }} />
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="max-w-3xl mx-auto px-4 text-center relative z-10"
      >
        <h2
          className="mb-4"
          style={{ fontSize: '32px', fontWeight: 700, color: '#ffffff', lineHeight: 1.2 }}
        >
          Pronto para transformar sua pousada?
        </h2>
        <p
          className="mb-8"
          style={{ color: 'rgba(255,255,255,0.9)', fontSize: '17px', lineHeight: 1.7 }}
        >
          Comece seu teste gratuito de 7 dias. <span style={{ color: '#DCF8C6', fontWeight: 600 }}>Sem cartão</span>. <span style={{ color: '#DCF8C6', fontWeight: 600 }}>Sem compromisso</span>.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            type="button"
            onClick={onNavigate}
            className="vzap-btn-white"
            style={{ minWidth: '240px', fontSize: '16px' }}
          >
            Testar Grátis por 7 Dias
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
        <p className="mt-6" style={{ color: 'rgba(255,255,255,0.6)', fontSize: '13px' }}>
          Setup em 10 min · Sem cartão de crédito · Cancele quando quiser
        </p>
      </motion.div>
    </section>
  );
}
