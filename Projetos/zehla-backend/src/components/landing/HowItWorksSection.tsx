'use client';

import { motion } from 'framer-motion';
import { Building, QrCode, BarChart3 } from 'lucide-react';

const steps = [
  {
    step: 1,
    icon: Building,
    title: 'Cadastre sua pousada',
    description:
      'Preencha seus dados, configure seus quartos e tipos de acomodação. Tudo pronto em menos de 10 minutos.',
    color: 'orange',
  },
  {
    step: 2,
    icon: QrCode,
    title: 'Conecte seu WhatsApp',
    description:
      'Escaneie o QR Code e pronto. O cérebro ZEHLA passa a atender seus hóspedes 24h. Sem instalação, sem complicação.',
    color: 'purple',
  },
  {
    step: 3,
    icon: BarChart3,
    title: 'Acompanhe tudo em tempo real',
    description:
      'Dashboard vivo com todas as informações da sua pousada. O cérebro ZEHLA cuida de quartos, reservas, receita e mensagens — tudo num clique.',
    color: 'amber',
  },
];

const colorMap: Record<string, string> = {
  orange: 'text-[#FF5500] bg-[#FF5500]/10 border-[#FF5500]/20 shadow-[0_0_15px_rgba(255,85,0,0.1)]',
  purple: 'text-[#FF5500] bg-[#FF5500]/10 border-[#FF5500]/20 shadow-[0_0_15px_rgba(255,85,0,0.1)]',
  amber: 'text-[#FF5500] bg-[#FF5500]/10 border-[#FF5500]/20 shadow-[0_0_15px_rgba(255,85,0,0.1)]',
};

const lineColorMap: Record<string, string> = {
  orange: 'bg-[#FF5500] shadow-md shadow-[#FF5500]/20',
  purple: 'bg-[#FF5500] shadow-md shadow-[#FF5500]/20',
  amber: 'bg-[#FF5500] shadow-md shadow-[#FF5500]/20',
};

export function HowItWorksSection() {
  return (
    <section className="relative py-24 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto z-10">
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
          Em <span className="text-[#FF5500]">3 passos simples</span>
        </h2>
        <p className="text-[#898989] text-base max-w-2xl mx-auto">
          Do zero ao piloto automático em minutos. Sem complicação técnica e pronto para faturar.
        </p>
      </motion.div>

      <div className="relative max-w-4xl mx-auto">
        {/* Connecting line */}
        <div className="hidden md:block absolute top-16 left-[16.67%] right-[16.67%] h-px bg-gradient-to-r from-[#FF5500]/20 via-[#FF5500]/60 to-[#FF5500]/20" />

        <div className="grid md:grid-cols-3 gap-8 md:gap-12">
          {steps.map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.15 }}
              className="relative text-center"
            >
              {/* Step number + icon */}
              <div className="relative inline-flex flex-col items-center mb-6">
                <div
                  className={`w-14 h-14 rounded-2xl border ${colorMap[item.color]} flex items-center justify-center relative z-10`}
                >
                  <item.icon className="w-7 h-7" />
                </div>
                <div
                  className={`absolute -top-2 -right-2 w-6 h-6 rounded-full ${lineColorMap[item.color]} text-white text-xs font-bold flex items-center justify-center z-20`}
                >
                  {item.step}
                </div>
              </div>

              <h3 className="text-xl font-bold text-white tracking-tight mb-3">
                {item.title}
              </h3>
              <p className="text-sm text-[#898989] leading-relaxed max-w-xs mx-auto">
                {item.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
