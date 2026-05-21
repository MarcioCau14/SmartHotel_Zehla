'use client';

import { motion } from 'framer-motion';
import {
  MessageSquare,
  Terminal,
  BarChart3,
  CalendarCheck,
  Megaphone,
  CreditCard,
} from 'lucide-react';

const features = [
  {
    icon: MessageSquare,
    title: 'WhatsApp Inteligente',
    description: 'Atendimento automático 24/7. O hóspede pergunta sobre Wi-Fi, piscina, horários e o ZEHLA responde instantaneamente.',
  },
  {
    icon: Terminal,
    title: 'Terminal de Mensagens',
    description: 'Todas as mensagens de hóspedes, colaboradores e fornecedores em um só lugar, organizadas em tempo real.',
  },
  {
    icon: BarChart3,
    title: 'Financeiro na Tela',
    description: 'Receita diária, ADR, RevPAR, ocupação. Gráficos que te mostram exatamente onde está seu dinheiro.',
  },
  {
    icon: CalendarCheck,
    title: 'Gestão de Reservas',
    description: 'Confirme, faça check-in ou cancele reservas com um clique. Sem erro, sem confusão.',
  },
  {
    icon: Megaphone,
    title: 'Promoções Automáticas',
    description: 'Crie promoções e o ZEHLA distribui automaticamente por WhatsApp, Instagram e canais de venda.',
  },
  {
    icon: CreditCard,
    title: 'PIX & Pagamentos',
    description: 'Receba PIX e cartão integrado. Split automático. Sem dor de cabeça com financeiro.',
  },
];

export function FeaturesSection() {
  return (
    <section id="funcionalidades" className="vzap-section-white vzap-section-padding">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-14"
        >
          <h2 className="vzap-heading">
            Tudo que sua pousada precisa em um só lugar
          </h2>
          <p className="max-w-2xl mx-auto" style={{ color: '#667781', fontSize: '16px' }}>
            O cérebro ZEHLA resolve os maiores problemas da sua operação diária — automaticamente.
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
              className="vzap-card p-7 flex items-start gap-5 group"
            >
              <div
                className="flex-shrink-0 flex items-center justify-center"
                style={{ width: '52px', height: '52px', backgroundColor: 'rgba(37, 211, 102, 0.08)', borderRadius: '12px' }}
              >
                <feature.icon className="w-5 h-5" style={{ color: '#25D366' }} />
              </div>
              <div>
                <h3
                  className="mb-2 transition-colors duration-300 group-hover:text-[#25D366]"
                  style={{ fontSize: '17px', fontWeight: 500, color: '#111B21', lineHeight: 1.3 }}
                >
                  {feature.title}
                </h3>
                <p style={{ fontSize: '14px', lineHeight: 1.7, color: '#667781' }}>
                  {feature.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
