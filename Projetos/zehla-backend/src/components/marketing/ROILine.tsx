import React from 'react';
import { 
import { motion } from 'framer-motion';


'use client';

  Instagram, 
  Brain, 
  Fingerprint, 
  Mic2, 
  CircleDollarSign,
  Clock
} from 'lucide-react';

const timelineSteps = [
  {
    time: '22:30',
    icon: Instagram,
    label: 'Pergunta no Instagram',
    detail: '"Oi, tem vaga pro feriado?"',
    color: 'text-pink-500',
    bg: 'bg-pink-500/10'
  },
  {
    time: '22:30',
    icon: Brain,
    label: 'Resposta em 3 segundos',
    detail: '"Olá! Temos a Suíte Master..."',
    color: 'text-emerald-400',
    bg: 'bg-emerald-400/10'
  },
  {
    time: '22:33',
    icon: Fingerprint,
    label: 'IA com seu jeito de falar',
    detail: 'DNA Wizard ajusta o tom ideal',
    color: 'text-orange-500',
    bg: 'bg-orange-500/10'
  },
  {
    time: '22:35',
    icon: Mic2,
    label: 'Voz Humana enviada',
    detail: 'Clonagem de voz via Voice Studio',
    color: 'text-blue-400',
    bg: 'bg-blue-400/10'
  },
  {
    time: '22:42',
    icon: CircleDollarSign,
    label: 'Reserva Confirmada',
    detail: 'R$ 1.250,00 direto no seu PIX',
    color: 'text-yellow-400',
    bg: 'bg-yellow-400/10',
    highlight: true
  }
];

export function ROILine() : void {
  try {
  return (
    <div className="relative py-20 overflow-hidden">
      {/* Background Line */}
      <div className="absolute top-1/2 left-0 w-full h-px bg-white/5 hidden lg:block" />

      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 lg:gap-4 relative z-10">
          {timelineSteps.map((step, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.2 }}
              className="relative flex flex-col items-center text-center group"
            >
              {/* Connector for Mobile */}
              {index !== timelineSteps.length - 1 && (
                <div className="absolute h-8 w-px bg-white/10 bottom-[-32px] lg:hidden" />
              )}

              {/* Time Badge */}
              <div className="flex items-center gap-1.5 mb-4 px-3 py-1 bg-white/5 rounded-full border border-white/10">
                <Clock className="w-3 h-3 text-gray-500" />
                <span className="text-[10px] font-mono text-gray-400">{step.time}</span>
              </div>

              {/* Icon Circle */}
              <div className={`w-16 h-16 rounded-2xl ${step.bg} border border-white/5 flex items-center justify-center mb-6 relative group-hover:scale-110 transition-transform duration-500`}>
                <step.icon className={`w-7 h-7 ${step.color}`} />
                {step.highlight && (
                  <motion.div 
                    animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="absolute inset-0 rounded-2xl bg-yellow-400/20 blur-xl"
                  />
                )}
              </div>

              {/* Text */}
              <h3 className={`text-xs font-bold uppercase tracking-widest mb-2 ${step.highlight ? 'text-yellow-400' : 'text-[#fafafa]'}`}>
                {step.label}
              </h3>
              <p className="text-[11px] text-[#898989] leading-relaxed max-w-[160px]">
                {step.detail}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
