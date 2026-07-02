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
    desc: 'Galeria, reservas, avaliações e contato — tudo num link único. Coloque na bio do Instagram e transforme seguidores em hóspedes pagantes. Um perfil profissional completo com visual premium (somente planos PRO e MAX).',
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
      <div className="relative w-[280px] mx-auto h-[530px] rounded-[42px] border-[6px] border-neutral-800 bg-[#070709] shadow-2xl p-2.5 overflow-hidden flex flex-col justify-between select-none">
        {/* iPhone 15 Pro Dynamic Island */}
        <div className="absolute top-3 left-1/2 -translate-x-1/2 w-20 h-5 bg-black rounded-full z-20 flex items-center justify-center">
          <div className="w-2.5 h-2.5 rounded-full bg-[#111] border border-neutral-900/50 absolute right-2" />
        </div>

        {/* Screen Content Wrapper */}
        <div className="w-full h-full rounded-[32px] bg-gradient-to-b from-emerald-950/20 via-black to-black p-3 pt-6 flex flex-col justify-between overflow-y-auto no-scrollbar scrollbar-none">
          <style dangerouslySetInnerHTML={{__html: `
            .no-scrollbar::-webkit-scrollbar {
              display: none !important;
              width: 0 !important;
              height: 0 !important;
              background: transparent !important;
            }
            .no-scrollbar {
              -ms-overflow-style: none !important;
              scrollbar-width: none !important;
            }
          `}} />
          <div>
            {/* Profile header */}
            <div className="flex flex-col items-center text-center pb-3 border-b border-white/[0.04] mt-3">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-emerald-500 to-cyan-500 p-0.5 mb-2 shadow-lg shadow-emerald-500/20">
                <div className="w-full h-full rounded-full bg-[#111] flex items-center justify-center overflow-hidden">
                  <img 
                    src="https://images.unsplash.com/photo-1566073771259-6a8506099945?w=150&auto=format&fit=crop&q=80" 
                    className="w-full h-full object-cover" 
                    alt="Pousada Serenity" 
                  />
                </div>
              </div>
              <h4 className="text-white text-sm font-bold tracking-tight">Pousada Serenity</h4>
              <p className="text-neutral-400 text-[9px] mt-0.5">✨ Seu refúgio em meio à natureza</p>
              <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-[8px] font-semibold mt-2">
                <span>⭐ 4.9</span>
                <span className="text-neutral-500 font-normal">| 128 avaliações</span>
              </div>
            </div>

            {/* Links */}
            <div className="space-y-2 mt-4">
              {[
                { label: 'Reservar Agora (PIX Automático)', highlight: true, icon: '🏡' },
                { label: 'Galeria de Fotos do Chalé', highlight: false, icon: '📸' },
                { label: 'Nossas Avaliações', highlight: false, icon: '⭐' },
                { label: 'Como Chegar (Mapa)', highlight: false, icon: '📍' },
                { label: 'Conversar no WhatsApp', highlight: false, icon: '💬' },
              ].map((link, i) => (
                <div key={link.label} className={`p-2.5 rounded-xl text-[10px] text-white font-semibold text-center cursor-default flex items-center justify-center gap-2 ${
                  link.highlight
                    ? 'bg-gradient-to-r from-emerald-500 to-cyan-500 border border-emerald-400/20 shadow-lg shadow-emerald-500/20 hover:scale-[1.01] transition-transform'
                    : 'bg-white/[0.03] border border-white/[0.05] hover:bg-white/[0.06] transition-colors'
                }`}>
                  <span>{link.icon}</span>
                  {link.label}
                  {link.highlight && <Check className="w-3.5 h-3.5 ml-0.5" />}
                </div>
              ))}
            </div>
          </div>

          {/* Galeria de Fotos e Rodapé */}
          <div className="mt-4 pt-3 border-t border-white/[0.04] space-y-3">
            <p className="text-left text-neutral-500 text-[8px] font-semibold uppercase tracking-wider">📸 Galeria de Fotos</p>
            <div className="grid grid-cols-3 gap-1.5">
              {/* Fotos reais integradas da pousada */}
              <div className="aspect-square rounded-lg border border-white/[0.05] overflow-hidden bg-[#111]">
                <img 
                  src="https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=150&auto=format&fit=crop&q=80" 
                  className="w-full h-full object-cover" 
                  alt="Quarto"
                />
              </div>
              <div className="aspect-square rounded-lg border border-white/[0.05] overflow-hidden bg-[#111]">
                <img 
                  src="https://images.unsplash.com/photo-1584132967334-10e028bd69f7?w=150&auto=format&fit=crop&q=80" 
                  className="w-full h-full object-cover" 
                  alt="Piscina"
                />
              </div>
              <div className="aspect-square rounded-lg border border-white/[0.05] overflow-hidden bg-[#111]">
                <img 
                  src="https://images.unsplash.com/photo-1533089860892-a7c6f0a88666?w=150&auto=format&fit=crop&q=80" 
                  className="w-full h-full object-cover" 
                  alt="Café"
                />
              </div>
            </div>
            
            {/* Stats */}
            <div className="grid grid-cols-3 gap-1 pt-2">
              {[
                { label: '4.9', sub: 'Avaliação' },
                { label: '500+', sub: 'Hóspedes' },
                { label: '100%', sub: 'Satisfação' },
              ].map((stat) => (
                <div key={stat.label} className="text-center">
                  <div className="text-emerald-400 text-[10px] font-bold">{stat.label}</div>
                  <div className="text-neutral-500 text-[8px]">{stat.sub}</div>
                </div>
              ))}
            </div>
          </div>
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