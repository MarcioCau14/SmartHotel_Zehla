'use client';

import { motion } from 'framer-motion';
import { Building, QrCode, BarChart3 } from 'lucide-react';

const steps = [
  {
    step: 1,
    icon: Building,
    title: 'Cadastre sua pousada',
    description: 'Preencha seus dados, configure seus quartos e tipos de acomodação. Tudo pronto em menos de 10 minutos.',
  },
  {
    step: 2,
    icon: QrCode,
    title: 'Conecte seu WhatsApp',
    description: 'Escaneie o QR Code e pronto. O cérebro ZEHLA passa a atender seus hóspedes 24h. Sem instalação.',
  },
  {
    step: 3,
    icon: BarChart3,
    title: 'Acompanhe tudo em tempo real',
    description: 'Dashboard vivo com todas as informações da sua pousada. Quartos, reservas, receita e mensagens — tudo num clique.',
  },
];

export function HowItWorksSection() {
  return (
    <section className="vzap-section-gray vzap-section-padding">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-14"
        >
          <h2 className="vzap-heading">
            Em 3 passos simples
          </h2>
          <p className="max-w-2xl mx-auto" style={{ color: '#667781', fontSize: '16px' }}>
            Do zero ao piloto automático em minutos. Sem complicação técnica.
          </p>
        </motion.div>

        <div className="relative max-w-4xl mx-auto">
          <div
            className="hidden md:block absolute top-7"
            style={{ left: '16.67%', right: '16.67%', height: '2px', backgroundColor: '#25D366', opacity: 0.2 }}
          />

          <div className="grid md:grid-cols-3 gap-10 md:gap-12">
            {steps.map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.15 }}
                className="relative text-center"
              >
                <div className="relative inline-flex flex-col items-center mb-6">
                  <div
                    className="w-14 h-14 rounded-xl flex items-center justify-center relative z-10"
                    style={{ background: 'linear-gradient(135deg, #25D366, #128C7E)' }}
                  >
                    <item.icon className="w-6 h-6 text-white" />
                  </div>
                  <div
                    className="absolute -top-1.5 -right-1.5 w-6 h-6 rounded-full text-white text-xs font-bold flex items-center justify-center z-20"
                    style={{ backgroundColor: '#075E54' }}
                  >
                    {item.step}
                  </div>
                </div>

                <h3 style={{ fontSize: '18px', fontWeight: 500, color: '#111B21', marginBottom: '8px' }}>
                  {item.title}
                </h3>
                <p className="max-w-xs mx-auto" style={{ fontSize: '14px', lineHeight: 1.7, color: '#667781' }}>
                  {item.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
