'use client';

import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import {
  MessageSquare,
  Wifi,
  Check,
} from 'lucide-react';

const features = [
  {
    icon: MessageSquare,
    title: 'WhatsApp Inteligente com IA',
    subtitle: 'Atendimento que vende 24/7',
    desc: 'Respostas automáticas em português natural que vendem, reservam e encantam. A IA do ZÉLLA entende contexto, negoceia preços e converte curiosos em hóspedes — tudo pelo WhatsApp que seu cliente já usa.',
    highlights: ['Resposta em 2 segundos', '24/7 sem pausas', 'Tom personalizado', 'Gera PIX automaticamente', 'Notificações dos seus recebimentos', 'Notificações em tempo real de Check-in e Check-out'],
    mockup: 'whatsapp',
    reverse: false,
  },
  {
    icon: Wifi,
    title: 'Link-in-Bio Profissional',
    subtitle: 'Sua vitrine digital completa',
    desc: 'Galeria, reservas, avaliações e contato — tudo num link único. Coloque na bio do Instagram e transforme seguidores em hóspedes pagantes. Um perfil profissional completo com visual premium.',
    highlights: ['Galeria integrada', 'SEO otimizado', 'Reservas diretas', 'Análise de tráfego', 'Visual profissional', 'Perfil personalizado'],
    mockup: 'linkinbio',
    reverse: true,
  },
];

function FeatureMockup({ type }: { type: string }) {
  if (type === 'whatsapp') {
    return (
      <div className="bg-[#111] rounded-2xl border border-white/[0.06] p-4 space-y-3">
        <div className="flex items-center gap-2 pb-2 border-b border-white/[0.04]">
          <div className="w-6 h-6 rounded-full bg-emerald-500/20 flex items-center justify-center">
            <MessageSquare className="w-3 h-3 text-emerald-400" />
          </div>
          <span className="text-white text-xs font-medium">Pousada Serenity — 3 conversas ativas</span>
        </div>
        {[
          { from: 'guest', msg: 'Boa noite! Vocês tem disponibilidade para o fim de semana?' },
          { from: 'bot', msg: 'Olá! Seja bem-vindo à Pousada Serenity. Tenho suítes disponíveis de 15 a 18 de junho. Qual a melhor data para você?' },
          { from: 'guest', msg: 'Para 2 pessoas, sexta e sábado' },
          { from: 'bot', msg: 'Perfeito! Temos o Chalé Vista Mar por R$520 (PIX) ou R$580 (cartão 3x). Inclui café da manhã. Deseja reservar?' },
          { from: 'guest', msg: 'Quero! Gera o PIX pra mim' },
          { from: 'bot', msg: 'PIX gerado: R$520,00. Você também pode pagar em 3x de R$193,33 no cartão. A reserva é confirmada automaticamente após o pagamento!' },
        ].map((chat, i) => (
          <div key={i} className={`flex gap-2 ${chat.from === 'guest' ? 'justify-end' : ''}`}>
            {chat.from === 'bot' && (
              <div className="w-6 h-6 rounded-full bg-emerald-500/20 flex items-center justify-center shrink-0">
                <MessageSquare className="w-3 h-3 text-emerald-400" />
              </div>
            )}
            <div className={`rounded-xl px-3 py-2 text-[11px] max-w-[85%] ${
              chat.from === 'guest'
                ? 'bg-emerald-500/10 text-emerald-300 rounded-tr-sm'
                : 'bg-white/[0.05] text-neutral-300 rounded-tl-sm'
            }`}>
              {chat.msg}
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (type === 'linkinbio') {
    return (
      <div className="bg-[#111] rounded-2xl border border-white/[0.06] p-4 space-y-3">
        {/* Profile header */}
        <div className="flex items-center gap-3 pb-3 border-b border-white/[0.04]">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center">
            <Wifi className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1">
            <div className="text-white text-sm font-bold">Pousada Serenity</div>
            <div className="text-neutral-500 text-[10px]">✨ Sua casa na natureza</div>
            <div className="text-emerald-400 text-[10px] mt-0.5">@pousadaserenity</div>
          </div>
        </div>

        {/* Links */}
        <div className="space-y-2">
          {[
            { label: 'Reservar Agora', highlight: true, icon: '🏡' },
            { label: 'Galeria de Fotos', highlight: false, icon: '📸' },
            { label: 'Avaliações', highlight: false, icon: '⭐' },
            { label: 'Como Chegar', highlight: false, icon: '📍' },
            { label: 'WhatsApp', highlight: false, icon: '💬' },
          ].map((link, i) => (
            <div key={link.label} className={`p-3 rounded-xl text-[11px] text-white font-medium text-center cursor-default flex items-center justify-center gap-2 ${
              link.highlight
                ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 border border-emerald-500/30 shadow-lg shadow-emerald-500/20'
                : 'bg-white/[0.04] border border-white/[0.06] hover:bg-white/[0.08] transition-colors'
            }`}>
              <span>{link.icon}</span>
              {link.label}
              {link.highlight && <Check className="w-3.5 h-3.5 ml-1" />}
            </div>
          ))}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-2 pt-2 border-t border-white/[0.04]">
          {[
            { label: '4.9', sub: 'Avaliação' },
            { label: '500+', sub: 'Hóspedes' },
            { label: '100%', sub: 'Satisfação' },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="text-emerald-400 text-xs font-bold">{stat.label}</div>
              <div className="text-neutral-600 text-[9px]">{stat.sub}</div>
            </div>
          ))}
        </div>
      </div>
    );
  }
}

export function FeaturesSection() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-50px' });

  return (
    <section ref={ref} id="funcionalidades" className="py-20 sm:py-28 bg-[#0a0a0a]">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-20"
        >
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-4">
            Funcionalidades que transformam
          </h2>
          <p className="text-neutral-400 text-lg max-w-2xl mx-auto">
            O ZÉLLA é cheio de funcionalidades inovadoras. Estas são as mais importantes para sua pousada decolar.
          </p>
        </motion.div>

        {/* Feature Rows — Alternating layout like mysmarthotel */}
        <div className="space-y-24">
          {features.map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: i * 0.1 }}
              className={`grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center ${
                feature.reverse ? 'lg:[direction:rtl]' : ''
              }`}
            >
              {/* Text side */}
              <div className={feature.reverse ? 'lg:[direction:ltr]' : ''}>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                    <feature.icon className="w-5 h-5 text-emerald-400" />
                  </div>
                  <div>
                    <h3 className="text-white font-bold text-xl">{feature.title}</h3>
                    <span className="text-emerald-400 text-xs font-medium">{feature.subtitle}</span>
                  </div>
                </div>
                <p className="text-neutral-400 text-sm leading-relaxed mb-5">{feature.desc}</p>
                <div className="flex flex-wrap gap-2">
                  {feature.highlights.map((h) => (
                    <span key={h} className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-white/[0.04] border border-white/[0.06] text-neutral-300 text-[11px]">
                      <Check className="w-3 h-3 text-emerald-400" />
                      {h}
                    </span>
                  ))}
                </div>
              </div>

              {/* Mockup side */}
              <div className={feature.reverse ? 'lg:[direction:ltr]' : ''}>
                <FeatureMockup type={feature.mockup} />
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}