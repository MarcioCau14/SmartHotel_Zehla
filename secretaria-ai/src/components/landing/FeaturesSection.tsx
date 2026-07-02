'use client';

import { useRef, useState, useEffect } from 'react';
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
  const [activeView, setActiveView] = useState<'instagram' | 'linkinbio'>('instagram');

  useEffect(() => {
    if (type !== 'linkinbio') return;
    const timer = setTimeout(() => {
      setActiveView((prev) => (prev === 'instagram' ? 'linkinbio' : 'instagram'));
    }, activeView === 'instagram' ? 2000 : 5000);

    return () => clearTimeout(timer);
  }, [activeView, type]);

  if (type === 'whatsapp') {
    return (
      <div className="relative">
        {/* Ambient green glow behind the mockup */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[340px] h-[340px] rounded-full bg-emerald-500/[0.08] blur-[80px] pointer-events-none z-0" />
        
        <div className="relative w-[280px] mx-auto h-[530px] rounded-[42px] border-[6px] border-neutral-800 bg-[#070709] shadow-2xl p-2.5 overflow-hidden flex flex-col justify-between select-none z-10">
          {/* iPhone 15 Pro Dynamic Island */}
          <div className="absolute top-3 left-1/2 -translate-x-1/2 w-20 h-5 bg-black rounded-full z-20 flex items-center justify-center">
            <div className="w-2.5 h-2.5 rounded-full bg-[#111] border border-neutral-900/50 absolute right-2" />
          </div>

          {/* Screen Content Wrapper */}
          <div className="w-full h-full rounded-[32px] bg-gradient-to-b from-emerald-950/20 via-[#0b141a] to-[#0b141a] p-0 flex flex-col justify-between overflow-hidden relative">
            
            {/* Header (WhatsApp style) */}
            <div className="w-full bg-[#1f2c34] pt-7 pb-2 px-3 flex items-center justify-between border-b border-white/[0.03] z-10 shrink-0">
              <div className="flex items-center gap-2">
                {/* Profile Pic */}
                <div className="w-8 h-8 rounded-full bg-[#111] border border-emerald-500/30 overflow-hidden relative">
                  <img 
                    src="https://images.unsplash.com/photo-1566073771259-6a8506099945?w=150&auto=format&fit=crop&q=80" 
                    className="w-full h-full object-cover" 
                    alt="Pousada Serenity" 
                  />
                  {/* Active dot */}
                  <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border-2 border-[#1f2c34] rounded-full" />
                </div>
                <div>
                  <h4 className="text-white text-[11px] font-bold tracking-tight flex items-center gap-1">
                    Pousada Serenity
                    <span className="px-1 py-[1px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[7px] font-bold rounded">IA</span>
                  </h4>
                  <p className="text-emerald-400 text-[8px] font-medium leading-none mt-0.5">ZÉLLA está online</p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-neutral-400">
                <span className="text-[9px] font-medium">WhatsApp</span>
              </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 p-3 overflow-y-auto no-scrollbar scrollbar-none space-y-2.5 z-0 pb-16">
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
              
              {/* Date divider */}
              <div className="flex justify-center my-2">
                <span className="bg-[#1f2c34]/50 text-neutral-400 text-[8px] font-medium px-2 py-0.5 rounded-md">HOJE</span>
              </div>

              {[
                { from: 'guest', msg: 'Boa noite! Vocês têm disponibilidade para este fim de semana?' },
                { from: 'bot', msg: 'Olá! Seja bem-vindo à Pousada Serenity. 🌸 Tenho suítes disponíveis para este fim de semana (sexta a domingo). Qual acomodação você gostaria de conhecer?' },
                { from: 'guest', msg: 'Para 2 pessoas, queremos o chalé mais reservado!' },
                { from: 'bot', msg: 'Excelente escolha! Temos o Chalé Vista Mar disponível. O valor para 2 noites fica R$520 no PIX ou 3x de R$193. Quer que eu gere a reserva?' },
                { from: 'guest', msg: 'Quero sim, gera o PIX pra mim!' },
                { from: 'bot', msg: 'Reserva pré-confirmada! 🎉\n\nChave PIX Copia e Cola para pagamento:\n\n```00020101021226300014br.gov.bcb.pix0114serenitypix2026```\n\nToque no botão abaixo para copiar a chave. A reserva será confirmada no seu WhatsApp assim que o PIX for concluído.', isPix: true },
              ].map((chat, i) => (
                <div key={i} className={`flex gap-1.5 ${chat.from === 'guest' ? 'justify-end' : ''}`}>
                  <div className={`rounded-2xl px-3 py-2 text-[10px] leading-relaxed max-w-[85%] relative ${
                    chat.from === 'guest'
                      ? 'bg-[#005c4b] text-[#e9edef] rounded-tr-none'
                      : 'bg-[#202c33] text-[#e9edef] rounded-tl-none'
                  }`}>
                    {chat.isPix ? (
                      <div className="space-y-2">
                        <p className="whitespace-pre-line text-[#e9edef]">{chat.msg.split('```')[0]}</p>
                        <div className="bg-[#111b21] p-2 rounded-lg border border-white/[0.04] font-mono text-[8px] break-all select-all flex items-center justify-between gap-1">
                          <span className="text-neutral-300">00020101021226300014...</span>
                          <span className="text-emerald-400 text-[7px] font-bold bg-emerald-500/10 px-1 py-0.5 rounded border border-emerald-500/20 shrink-0">COPIAR</span>
                        </div>
                        <p className="text-[8px] text-neutral-400">{chat.msg.split('```')[2]}</p>
                      </div>
                    ) : (
                      <p className="whitespace-pre-line">{chat.msg}</p>
                    )}
                    {/* Message Time */}
                    <span className="text-[7px] text-neutral-400 float-right mt-1 ml-2 font-medium">
                      {chat.from === 'guest' ? '20:14' : '20:15'}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Input area */}
            <div className="absolute bottom-0 inset-x-0 bg-[#1f2c34] p-2 flex items-center gap-2 border-t border-white/[0.03] z-10 shrink-0">
              <div className="flex-1 bg-[#2a3942] rounded-full px-3 py-1.5 flex items-center justify-between border border-white/[0.02]">
                <span className="text-neutral-400 text-[10px]">Gera o PIX pra mim!</span>
              </div>
              <div className="w-7 h-7 rounded-full bg-emerald-500 flex items-center justify-center shadow-md">
                <MessageSquare className="w-3.5 h-3.5 text-white" />
              </div>
            </div>

          </div>
        </div>
      </div>
    );
  }

  if (type === 'linkinbio') {
    return (
      <div className="relative">
        {/* Ambient green glow behind the mockup */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full bg-emerald-400/[0.22] blur-[95px] pointer-events-none z-0" />
        
        <div className="relative w-[280px] mx-auto h-[530px] rounded-[42px] border-[6px] border-neutral-800 bg-[#070709] shadow-2xl p-2.5 overflow-hidden flex flex-col justify-between select-none z-10">
          {/* iPhone 15 Pro Dynamic Island */}
          <div className="absolute top-3 left-1/2 -translate-x-1/2 w-20 h-5 bg-black rounded-full z-20 flex items-center justify-center">
            <div className="w-2.5 h-2.5 rounded-full bg-[#111] border border-neutral-900/50 absolute right-2" />
          </div>

          {/* Screen Content Wrapper */}
          <div className="w-full h-full rounded-[32px] bg-black p-0 flex flex-col justify-between overflow-hidden relative">
            
            {/* View 1: Instagram Profile */}
            {activeView === 'instagram' && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="w-full h-full flex flex-col justify-between text-white p-3 pt-6 bg-black overflow-y-auto no-scrollbar"
              >
                <div>
                  {/* Top Bar */}
                  <div className="flex items-center justify-between pb-3 border-b border-neutral-900 mt-2">
                    <div className="flex items-center gap-1">
                      <span className="text-xs font-bold">pousadaserenity</span>
                      <span className="w-3 h-3 bg-blue-500 rounded-full flex items-center justify-center text-[7px] font-bold text-white shrink-0">✓</span>
                    </div>
                    <div className="flex items-center gap-3 text-neutral-300">
                      <span className="text-lg leading-none font-bold">+</span>
                      <div className="w-4 h-3 flex flex-col justify-between">
                        <div className="h-[2px] bg-white rounded" />
                        <div className="h-[2px] bg-white rounded" />
                        <div className="h-[2px] bg-white rounded" />
                      </div>
                    </div>
                  </div>

                  {/* Profile Header Row */}
                  <div className="flex items-center justify-between gap-3 mt-4">
                    {/* Story Circle */}
                    <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-yellow-500 via-pink-500 to-purple-600 p-[2px] shrink-0">
                      <div className="w-full h-full rounded-full bg-black p-[2px]">
                        <img 
                          src="https://images.unsplash.com/photo-1566073771259-6a8506099945?w=150&auto=format&fit=crop&q=80" 
                          className="w-full h-full object-cover rounded-full" 
                          alt="Pousada Serenity" 
                        />
                      </div>
                    </div>
                    {/* Stats */}
                    <div className="flex-1 flex justify-around text-center">
                      {[
                        { num: '42', label: 'posts' },
                        { num: '15.8k', label: 'seguidores' },
                        { num: '380', label: 'seguindo' },
                      ].map(s => (
                        <div key={s.label}>
                          <div className="text-xs font-bold leading-tight">{s.num}</div>
                          <div className="text-[7px] text-neutral-400 tracking-wide uppercase">{s.label}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Bio Info */}
                  <div className="mt-3 text-[9px] leading-snug">
                    <p className="font-bold">Pousada Serenity Paraty</p>
                    <p className="text-neutral-400">Pousada</p>
                    <p className="mt-1">✨ Seu refúgio paradisíaco em Paraty, RJ</p>
                    <p>🏝️ Chalés com vista mar & piscina infinita</p>
                    <p>👇 Garanta sua vaga direta sem taxas:</p>
                    {/* Clickable Link */}
                    <button 
                      onClick={() => setActiveView('linkinbio')}
                      className="text-sky-400 font-semibold mt-1 hover:underline cursor-pointer block text-left animate-pulse"
                    >
                      seuzella.com/pousadaserenity
                    </button>
                  </div>

                  {/* Action Buttons */}
                  <div className="grid grid-cols-3 gap-1.5 mt-4">
                    {['Seguir', 'Mensagem', 'Contato'].map(btn => (
                      <div key={btn} className="bg-neutral-800 text-[8px] font-bold py-1.5 rounded text-center cursor-default hover:bg-neutral-700 transition-colors">
                        {btn}
                      </div>
                    ))}
                  </div>

                  {/* Highlights */}
                  <div className="flex justify-between gap-2 mt-4 pb-4 border-b border-neutral-900">
                    {[
                      { icon: '🏡', label: 'Chalés' },
                      { icon: '🏊', label: 'Piscina' },
                      { icon: '⭐', label: 'Reviews' },
                      { icon: '🍳', label: 'Café' },
                    ].map(h => (
                      <div key={h.label} className="flex flex-col items-center gap-1 shrink-0">
                        <div className="w-10 h-10 rounded-full bg-neutral-900 border border-neutral-800 flex items-center justify-center text-sm shadow">
                          {h.icon}
                        </div>
                        <span className="text-[7px] text-neutral-400">{h.label}</span>
                      </div>
                    ))}
                  </div>

                  {/* Instagram Feed Grid */}
                  <div className="grid grid-cols-3 gap-0.5 mt-2">
                    {[
                      'https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=150&auto=format&fit=crop&q=80',
                      'https://images.unsplash.com/photo-1584132967334-10e028bd69f7?w=150&auto=format&fit=crop&q=80',
                      'https://images.unsplash.com/photo-1533089860892-a7c6f0a88666?w=150&auto=format&fit=crop&q=80',
                      'https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=150&auto=format&fit=crop&q=80',
                      'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=150&auto=format&fit=crop&q=80',
                      'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=150&auto=format&fit=crop&q=80',
                    ].map((img, idx) => (
                      <div key={idx} className="aspect-square bg-neutral-900 overflow-hidden">
                        <img src={img} className="w-full h-full object-cover" alt="Instagram Post" />
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {/* View 2: Link-in-Bio Browser View */}
            {activeView === 'linkinbio' && (
              <motion.div 
                initial={{ y: '100%' }}
                animate={{ y: 0 }}
                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                className="w-full h-full flex flex-col justify-between relative"
              >
                {/* In-app Browser Top Bar */}
                <div className="w-full bg-[#1b1b1f] pt-7 pb-2 px-3 flex items-center justify-between border-b border-white/[0.04] z-20 shrink-0">
                  <button 
                    onClick={() => setActiveView('instagram')}
                    className="text-neutral-400 text-xs font-semibold hover:text-white cursor-pointer"
                  >
                    ✕
                  </button>
                  <span className="text-neutral-400 text-[8px] font-medium tracking-tight">seuzella.com/pousadaserenity</span>
                  <span className="text-[10px] text-neutral-400 rotate-90 leading-none">...</span>
                </div>

                {/* Main Link-in-Bio Web View */}
                <div className="flex-1 w-full p-3 flex flex-col justify-between overflow-y-auto no-scrollbar relative" style={{ backgroundImage: "linear-gradient(to bottom, rgba(6, 78, 59, 0.45), rgba(0, 0, 0, 0.8), rgba(0, 0, 0, 0.95)), url('https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=400&auto=format&fit=crop&q=80')", backgroundSize: 'cover', backgroundPosition: 'center' }}>
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
                    <div className="flex flex-col items-center text-center pb-3 border-b border-white/[0.04] mt-2">
                      <div className="w-14 h-14 rounded-full bg-gradient-to-br from-emerald-500 to-cyan-500 p-0.5 mb-2 shadow-lg shadow-emerald-500/20">
                        <div className="w-full h-full rounded-full bg-[#111] flex items-center justify-center overflow-hidden">
                          <img 
                            src="https://images.unsplash.com/photo-1566073771259-6a8506099945?w=150&auto=format&fit=crop&q=80" 
                            className="w-full h-full object-cover" 
                            alt="Pousada Serenity" 
                          />
                        </div>
                      </div>
                      <h4 className="text-white text-xs font-bold tracking-tight">Pousada Serenity</h4>
                      <p className="text-neutral-400 text-[8px] mt-0.5">✨ Seu refúgio em meio à natureza</p>
                      <div className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-[7px] font-semibold mt-1.5">
                        <span>⭐ 4.9</span>
                        <span className="text-neutral-500 font-normal">| 128 avaliações</span>
                      </div>
                    </div>

                    {/* Links */}
                    <div className="space-y-1.5 mt-3.5">
                      {[
                        { label: 'Reservar Agora (PIX Automático)', highlight: true, icon: '🏡' },
                        { label: 'Galeria de Fotos do Chalé', highlight: false, icon: '📸' },
                        { label: 'Nossas Avaliações', highlight: false, icon: '⭐' },
                        { label: 'Como Chegar (Mapa)', highlight: false, icon: '📍' },
                        { label: 'Conversar no WhatsApp', highlight: false, icon: '💬' },
                      ].map((link) => (
                        <div key={link.label} className={`p-2 rounded-xl text-[9px] text-white font-semibold text-center cursor-default flex items-center justify-center gap-2 ${
                          link.highlight
                            ? 'bg-gradient-to-r from-emerald-500 to-cyan-500 border border-emerald-400/20 shadow-lg shadow-emerald-500/20'
                            : 'bg-white/[0.03] border border-white/[0.05] hover:bg-white/[0.06] transition-colors'
                        }`}>
                          <span>{link.icon}</span>
                          {link.label}
                          {link.highlight && <Check className="w-3 h-3 ml-0.5 text-white" />}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Galeria de Fotos e Rodapé */}
                  <div className="mt-3 pt-2.5 border-t border-white/[0.04] space-y-2">
                    <p className="text-left text-neutral-500 text-[7px] font-semibold uppercase tracking-wider">📸 Galeria de Fotos</p>
                    <div className="grid grid-cols-3 gap-1">
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
                    <div className="grid grid-cols-3 gap-1 pt-1.5">
                      {[
                        { label: '4.9', sub: 'Avaliação' },
                        { label: '500+', sub: 'Hóspedes' },
                        { label: '100%', sub: 'Satisfação' },
                      ].map((stat) => (
                        <div key={stat.label} className="text-center">
                          <div className="text-emerald-400 text-[9px] font-bold">{stat.label}</div>
                          <div className="text-neutral-500 text-[7px]">{stat.sub}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
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
          <h2 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-white mb-6 tracking-tight">
            Funcionalidades que <span className="bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">transformam</span>
          </h2>
          <p className="text-neutral-400 text-lg max-w-2xl mx-auto">
            O ZÉLLA vai ser seu zelador com funcionalidades inovadoras. São funções que vão te dar mais tempo para fazer sua pousada decolar.
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