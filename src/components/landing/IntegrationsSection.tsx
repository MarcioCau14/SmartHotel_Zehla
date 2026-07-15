'use client';

import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import {
  Plug,
  MessageSquare,
  CreditCard,
  Calendar,
  BarChart3,
  Globe,
  Mail,
  Smartphone,
} from 'lucide-react';

const integrations = [
  {
    icon: MessageSquare,
    name: 'WhatsApp Business API',
    description: 'Integração oficial com a API Cloud da Meta para envio e recebimento de mensagens em tempo real.',
    status: 'Ativo',
    statusColor: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  },
  {
    icon: CreditCard,
    name: 'Mercado Pago',
    description: 'Checkout PIX e cartão integrado. Confirmação automática de pagamento em tempo real.',
    status: 'Ativo',
    statusColor: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  },
  {
    icon: Calendar,
    name: 'iCal Sync',
    description: 'Exporte calendários para Booking.com e Airbnb. Importe reservas via URL iCal (em expansão).',
    status: 'Ativo',
    statusColor: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  },
  {
    icon: BarChart3,
    name: 'Analytics & Dashboards',
    description: 'Métricas em tempo real de conversão, satisfação, receita e volume de atendimento.',
    status: 'Ativo',
    statusColor: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  },
  {
    icon: Globe,
    name: 'Link-in-Bio',
    description: 'Página profissional com galeria, reservas e avaliações — pronta para Instagram.',
    status: 'Ativo',
    statusColor: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  },
  {
    icon: Mail,
    name: 'Relatórios por E-mail',
    description: 'Resumo semanal automático com métricas chave enviado direto na sua caixa de entrada.',
    status: 'Ativo',
    statusColor: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  },
  {
    icon: Smartphone,
    name: 'Multi-Provider AI',
    description: 'OpenAI, Groq, Gemini, DeepSeek — roteamento inteligente para a melhor resposta.',
    status: 'Ativo',
    statusColor: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  },
  {
    icon: Plug,
    name: 'Channel Manager',
    description: 'Distribuição em 300+ canais de reserva (em breve via SiteMinder API).',
    status: 'Em breve',
    statusColor: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  },
];

export function IntegrationsSection() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <section ref={ref} id="integracoes" className="relative py-24 sm:py-32 bg-[#060608] overflow-hidden">
      {/* Background grid */}
      <div className="absolute inset-0 bg-grid-pattern opacity-[0.03] pointer-events-none" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 mb-4">
            <Plug className="w-3.5 h-3.5 text-purple-400" />
            <span className="text-purple-400 text-xs font-medium uppercase tracking-wider">Ecossistema</span>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white mb-4">
            Tudo conectado,{' '}
            <span className="text-purple-400 font-bold">nada desconectado</span>
          </h2>
          <p className="text-neutral-400 text-lg max-w-2xl mx-auto">
            O Zélla se integra com as ferramentas que sua pousada já usa. Sem webhooks lentos, sem dados desatualizados — conexão direta em tempo real.
          </p>
        </motion.div>

        {/* Integration Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {integrations.map((integration, i) => {
            const Icon = integration.icon;
            return (
              <motion.div
                key={integration.name}
                initial={{ opacity: 0, y: 25 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, delay: i * 0.08 }}
                className="group relative rounded-xl p-5 bg-white/[0.02] border border-white/[0.06] hover:bg-white/[0.04] hover:border-white/[0.12] transition-all duration-300"
              >
                {/* Status badge */}
                <div className="absolute top-4 right-4">
                  <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold border ${integration.statusColor}`}>
                    {integration.status}
                  </span>
                </div>

                <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center mb-4 group-hover:bg-purple-500/20 transition-colors">
                  <Icon className="w-5 h-5 text-purple-400" />
                </div>

                <h3 className="text-white font-bold text-sm mb-2">{integration.name}</h3>
                <p className="text-neutral-500 text-xs leading-relaxed">{integration.description}</p>
              </motion.div>
            );
          })}
        </div>

        {/* Bottom note */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="text-center text-neutral-600 text-xs mt-10"
        >
          Diferente de soluções que dependem de webhooks com delays, o Zélla usa conexão direta ao banco de dados para respostas em tempo real.
        </motion.p>
      </div>
    </section>
  );
}