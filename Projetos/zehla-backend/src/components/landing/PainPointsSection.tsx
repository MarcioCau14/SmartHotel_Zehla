'use client';

import { motion } from 'framer-motion';
import {
  MessageCircleOff,
  DollarSign,
  Clock,
  Table,
  HelpCircle,
  AlertTriangle,
} from 'lucide-react';

const painPoints = [
  {
    icon: MessageCircleOff,
    title: 'Perco reservas no WhatsApp',
    description: 'Não consigo responder rápido o suficiente e os hóspedes acabam procurando outro lugar.',
  },
  {
    icon: DollarSign,
    title: 'Taxas abusivas das OTAs',
    description: 'Deixar 15% a 20% do faturamento com Booking e Airbnb pesa demais no final do mês.',
  },
  {
    icon: Clock,
    title: 'Sem tempo para a família',
    description: 'Trabalho 16h por dia cuidando de tudo na pousada. Falta tempo para lazer e descanso.',
  },
  {
    icon: Table,
    title: 'Planilhas para tudo',
    description: 'Uso planilhas para controlar quartos, reservas, financeiro... e nada fica organizado.',
  },
  {
    icon: HelpCircle,
    title: 'Não sei quanto estou faturando',
    description: 'Não tenho controle claro de receita diária, ocupação real ou custo por hóspede.',
  },
  {
    icon: AlertTriangle,
    title: 'Check-in manual e demorado',
    description: 'Meu check-in é todo manual e offline. O hóspede chega e eu corro para arrumar tudo.',
  },
];

export function PainPointsSection() {
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
          <div className="vzap-badge vzap-badge-green mb-6">
            <AlertTriangle className="w-4 h-4" />
            <span>Seja honesto...</span>
          </div>
          <h2 className="vzap-heading">
            Você se identifica com alguma dessas situações?
          </h2>
          <p className="max-w-2xl mx-auto" style={{ color: '#667781', fontSize: '16px' }}>
            Se você disse sim para pelo menos uma, o cérebro ZEHLA foi feito para resolver isso.
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {painPoints.map((point, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
              className="vzap-card p-7"
            >
              <div
                className="inline-flex items-center justify-center mb-5"
                style={{ width: '52px', height: '52px', backgroundColor: 'rgba(37, 211, 102, 0.08)', borderRadius: '12px' }}
              >
                <point.icon className="w-5 h-5" style={{ color: '#25D366' }} />
              </div>
              <h3 style={{ fontSize: '17px', fontWeight: 500, color: '#111B21', marginBottom: '8px' }}>
                {point.title}
              </h3>
              <p style={{ fontSize: '14px', lineHeight: 1.7, color: '#667781' }}>
                {point.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
