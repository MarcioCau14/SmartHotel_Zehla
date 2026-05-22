'use client';

import { motion } from 'framer-motion';
import { UserPlus, Share2, CreditCard, TrendingUp } from 'lucide-react';

const steps = [
  {
    icon: UserPlus,
    title: 'Crie seu perfil',
    description: 'Cadastre sua pousada em 2 minutos. Adicione fotos, WhatsApp, Instagram.',
    color: 'from-orange-500 to-amber-600',
  },
  {
    icon: Share2,
    title: 'Compartilhe seu link',
    description: 'Cole o link ZEHLA na bio do Instagram. Seus seguidores veem seu perfil completo.',
    color: 'from-amber-500 to-orange-600',
  },
  {
    icon: CreditCard,
    title: 'Receba reservas',
    description: 'O hóspede clica, vê sua pousada e já chama no WhatsApp. Pix direto, sem taxa.',
    color: 'from-orange-500 to-emerald-600',
  },
  {
    icon: TrendingUp,
    title: 'Cresça com IA',
    description: 'Quando quiser mais, ative o PRO ou MAX. Precificação inteligente, recuperação de vendas.',
    color: 'from-emerald-500 to-teal-600',
  },
];

export function HowItWorks() {
  return (
    <section className="py-24 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-black text-white mb-4">
            Como funciona
          </h2>
          <p className="text-neutral-500 text-lg max-w-2xl mx-auto">
            Da criação ao faturamento em menos de 10 minutos.
          </p>
        </div>

        <div className="relative">
          <div className="hidden md:block absolute left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-orange-500/40 via-orange-500/20 to-emerald-500/40 -translate-x-1/2" />

          <div className="space-y-12 md:space-y-0 relative">
            {steps.map((step, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: i % 2 === 0 ? -30 : 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
                className={`flex flex-col md:flex-row items-center gap-8 md:gap-12 ${
                  i % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'
                } ${i > 0 ? 'md:mt-24' : ''}`}
              >
                <div className={`flex-1 ${i % 2 === 0 ? 'md:text-right' : 'md:text-left'} text-center`}>
                  <div className={`inline-flex items-center gap-3 px-4 py-2 rounded-full bg-gradient-to-r ${step.color} text-black text-[10px] font-black uppercase tracking-widest mb-4`}>
                    <span>Passo {i + 1}</span>
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-3">{step.title}</h3>
                  <p className="text-neutral-500 text-sm max-w-md leading-relaxed mx-auto md:mx-0">
                    {step.description}
                  </p>
                </div>

                <div className="relative flex-shrink-0">
                  <div className={`w-16 h-16 md:w-20 md:h-20 rounded-full bg-gradient-to-br ${step.color} flex items-center justify-center shadow-xl`}>
                    <step.icon className="w-7 h-7 md:w-8 md:h-8 text-black" />
                  </div>
                  {i < steps.length - 1 && (
                    <div className="hidden md:block absolute top-full left-1/2 -translate-x-1/2 w-px h-24 bg-gradient-to-b from-orange-500/20 to-transparent" />
                  )}
                </div>

                <div className="flex-1" />
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
