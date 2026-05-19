import { Building, QrCode, BarChart3 } from 'lucide-react';
import { motion } from 'framer-motion';


'use client';


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
  orange: 'text-[#FF5500] bg-[#FF5500]/10 border-orange-500/20',
  purple: 'text-[#FF5500] bg-[#FF5500]/10 border-purple-500/20',
  amber: 'text-[#FF5500] bg-[#FF5500]/10 border-amber-500/20',
};

const lineColorMap: Record<string, string> = {
  orange: 'bg-orange-500',
  purple: 'bg-purple-500',
  amber: 'bg-amber-500',
};

export function HowItWorksSection() : void {
  try {
  return (
    <section className="py-24 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="text-center mb-16"
      >
        <h2 className="text-3xl sm:text-4xl font-bold text-[#fafafa] mb-4">
          Em <span className="gradient-text">3 passos simples</span>
        </h2>
        <p className="text-[#898989] text-lg max-w-2xl mx-auto">
          Do zero ao piloto automático em minutos. Sem complicação técnica.
        </p>
      </motion.div>

      <div className="relative max-w-4xl mx-auto">
        {/* Connecting line */}
        <div className="hidden md:block absolute top-16 left-[16.67%] right-[16.67%] h-0.5 bg-gradient-to-r from-orange-500/40 via-purple-500/40 to-amber-500/40" />

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

              <h3 className="text-xl font-semibold text-[#fafafa] mb-3">
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
