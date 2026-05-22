'use client';

import { motion } from 'framer-motion';
import { UserPlus, Share2, Wallet, TrendingUp } from 'lucide-react';

const STEPS = [
  {
    step: 1,
    title: 'Crie seu perfil',
    description: 'Cadastre sua pousada em 2 minutos. Adicione fotos, WhatsApp, Instagram e valor da diária. Sem cartão de crédito.',
    icon: UserPlus,
  },
  {
    step: 2,
    title: 'Compartilhe seu link',
    description: 'Cole o link ZEHLA na bio do Instagram. Pronto — seus seguidores veem seu perfil completo e reservam direto pelo WhatsApp.',
    icon: Share2,
  },
  {
    step: 3,
    title: 'Receba reservas',
    description: 'O hóspede clica, vê sua pousada, escolhe a data e já chama no WhatsApp. Você recebe o Pix. Sem taxa, sem burocracia.',
    icon: Wallet,
  },
  {
    step: 4,
    title: 'Cresça com IA',
    description: 'Quando quiser mais, ative o plano PRO ou MAX. Precificação inteligente, recuperação de vendas e atendente IA 24h.',
    icon: TrendingUp,
  },
];

export function HowItWorks() {
  return (
    <section className="max-w-5xl mx-auto px-4 py-24">
      <div className="text-center mb-16">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/5 text-[10px] font-black tracking-[0.2em] text-neutral-400 uppercase mb-5">
          <Share2 className="w-3.5 h-3.5" />
          COMO FUNCIONA
        </div>
        <h2 className="text-3xl md:text-4xl font-bold">
          Do perfil ao lucro em <span className="text-orange-500">2 minutos</span>
        </h2>
        <p className="text-neutral-500 mt-3 text-sm max-w-lg mx-auto">
          Crie seu perfil, compartilhe o link, receba reservas. Simples assim.
        </p>
      </div>

      <div className="grid md:grid-cols-4 gap-6 relative">
        {/* Connector line */}
        <div className="hidden md:block absolute top-16 left-[12.5%] right-[12.5%] h-0.5 bg-gradient-to-r from-orange-500/40 via-amber-500/40 to-emerald-400/40" />

        {STEPS.map((step, i) => {
          const Icon = step.icon;
          return (
            <motion.div
              key={step.step}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15 }}
              className="relative text-center group"
            >
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-orange-500/20 to-amber-500/20 border border-orange-500/20 flex items-center justify-center mx-auto mb-6 relative z-10 group-hover:scale-110 transition-transform">
                <Icon className="w-7 h-7 text-orange-500" />
              </div>
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-20 h-20 bg-orange-500/5 rounded-full blur-2xl group-hover:bg-orange-500/10 transition-all" />
              <span className="text-[10px] text-orange-500 font-black tracking-[0.2em] uppercase mb-2 block">Passo {step.step}</span>
              <h3 className="font-bold text-white text-sm mb-2">{step.title}</h3>
              <p className="text-neutral-500 text-xs leading-relaxed max-w-[200px] mx-auto">{step.description}</p>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
