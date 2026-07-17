'use client';

import { useRef, useState, useEffect, useCallback } from 'react';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import {
  ArrowRight,
  Sparkles,
  MessageSquare,
  Bot,
  Crown,
} from 'lucide-react';
import { useRouter } from 'next/navigation';

interface ChatMessage {
  sender: 'user' | 'bot';
  name?: string;
  confidence?: string;
  actions?: string;
  text: React.ReactNode;
  /** rough char count for typing duration calc */
  _len?: number;
}

/** Calculate a natural typing delay based on message length */
function typingDelay(msg: ChatMessage): number {
  const text = typeof msg.text === 'string' ? msg.text : String(msg.text);
  const len = text.length;
  // Short messages (< 60 chars): 1.0 - 1.4s
  // Medium (60-140): 1.6 - 2.2s
  // Long (140+): 2.4 - 3.2s
  if (len < 60) return 1000 + Math.random() * 400;
  if (len < 140) return 1600 + Math.random() * 600;
  return 2400 + Math.random() * 800;
}

/** Natural pause after a message appears (reading time) */
function readPause(msg: ChatMessage): number {
  const text = typeof msg.text === 'string' ? msg.text : String(msg.text);
  const len = text.length;
  if (len < 40) return 1800 + Math.random() * 400;
  if (len < 100) return 2400 + Math.random() * 600;
  return 3000 + Math.random() * 800;
}

function ZellaChatPreview() {
  const [displayedMessages, setDisplayedMessages] = useState<Array<ChatMessage>>([]);
  const [isBotTyping, setIsBotTyping] = useState(false);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  const conversations: Array<Array<ChatMessage>> = [
    [
      { sender: 'user', name: 'Bernardo Silva', text: 'Olá! Gostaria de saber o valor da diária para casal no feriado de 7 de setembro.' },
      { sender: 'bot', confidence: '98%', actions: 'Calendário verificado — disponível', text: <span>Olá, Bernardo! A diária do Quarto Casal Premium para o feriado de 7 de Setembro é <strong className="text-white">R$ 247</strong>. Temos disponibilidade! Deseja que eu pré-reserve?</span> },
      { sender: 'user', name: 'Bernardo Silva', text: 'Sim, por favor!' },
      { sender: 'bot', confidence: '99%', actions: 'Chave PIX enviada com sucesso', text: <span>Perfeito! Aqui está a chave PIX copia e cola para confirmar sua reserva de <strong className="text-white">R$ 247</strong>. Seu quarto fica garantido assim que o pagamento for identificado!</span> }
    ],
    [
      { sender: 'user', name: 'Juliana Lima', text: 'Oi! Vocês aceitam pet? Tenho um Golden Retriever.' },
      { sender: 'bot', confidence: '96%', actions: 'Políticas consultadas — permitido', text: <span>Olá, Juliana! Sim, somos Pet Friendly! Aceitamos cães em nossos chalés. Qual a data da sua estadia?</span> },
      { sender: 'user', name: 'Juliana Lima', text: 'Seria do dia 12 ao 15 de novembro.' },
      { sender: 'bot', confidence: '97%', actions: 'Disponibilidade confirmada', text: <span>Temos o Chalé Família livre! 3 diárias por <strong className="text-white">R$ 890</strong> com taxa pet inclusa. Quer que eu garanta a vaga?</span> },
      { sender: 'user', name: 'Juliana Lima', text: 'Sim, vou querer!' },
      { sender: 'bot', confidence: '99%', actions: 'Checkout enviado', text: 'Ótimo! Enviando o link de pagamento via PIX. Sejam muito bem-vindos!' }
    ],
    [
      { sender: 'user', name: 'Felipe Santos', text: 'Qual o horário do check-in?' },
      { sender: 'bot', confidence: '99%', actions: 'FAQ consultado', text: 'Olá, Felipe! Check-in às 14:00 e check-out até 12:00. Precisa de early check-in? Posso verificar na data!' },
      { sender: 'user', name: 'Felipe Santos', text: 'Legal! E tem Wi-Fi para trabalhar?' },
      { sender: 'bot', confidence: '98%', actions: 'Infraestrutura verificada', text: <span>Sim! Wi-Fi fibra <strong className="text-white">300 Mbps</strong> gratuito em toda a pousada.</span> }
    ]
  ];

  const delay = useCallback((ms: number) => new Promise<void>(resolve => setTimeout(resolve, ms)), []);

  useEffect(() => {
    let active = true;
    let currentConvIdx = 0;

    const runChatLoop = async () => {
      while (active) {
        const conversation = conversations[currentConvIdx];
        setDisplayedMessages([]);
        currentConvIdx = (currentConvIdx + 1) % conversations.length;

        await delay(1200);
        if (!active) return;

        for (let i = 0; i < conversation.length; i++) {
          const msg = conversation[i];

          if (msg.sender === 'user') {
            await delay(2000 + Math.random() * 1000);
            if (!active) return;
            setDisplayedMessages(prev => [...prev, msg]);
            await delay(readPause(msg));
          } else {
            setIsBotTyping(true);
            await delay(typingDelay(msg));
            if (!active) return;
            setIsBotTyping(false);
            setDisplayedMessages(prev => [...prev, msg]);
            await delay(readPause(msg));
          }
          if (!active) return;
        }

        // Pause between conversations
        await delay(4000);
        if (!active) return;
      }
    };

    runChatLoop();

    return () => {
      active = false;
    };
  }, [delay]);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTo({
        top: chatContainerRef.current.scrollHeight,
        behavior: 'smooth',
      });
    }
  }, [displayedMessages, isBotTyping]);

  return (
    <div
      ref={chatContainerRef}
      className="space-y-3 pt-1 max-h-[200px] min-h-[140px] overflow-y-auto no-scrollbar"
    >
      <style dangerouslySetInnerHTML={{__html: `
        .no-scrollbar::-webkit-scrollbar {
          display: none !important;
        }
        .no-scrollbar {
          -ms-overflow-style: none !important;
          scrollbar-width: none !important;
        }
      `}} />
      {displayedMessages.map((msg, index) => (
        <div
          key={`${index}-${displayedMessages.length}`}
          className={`flex flex-col space-y-0.5 ${msg.sender === 'user' ? 'items-start' : 'items-end ml-auto'} max-w-[85%]`}
        >
          {msg.sender === 'user' ? (
            <>
              <span className="text-[8px] text-zinc-500 ml-1 font-semibold">{msg.name}</span>
              <div className="bg-zinc-800 text-zinc-200 p-2.5 rounded-2xl rounded-tl-sm text-[11px] leading-relaxed border border-white/[0.03]">
                {msg.text}
              </div>
            </>
          ) : (
            <>
              <span className="text-[8px] text-emerald-400 mr-1 font-semibold flex items-center gap-1">
                Seu Zélla
                <span className="px-1 py-[0.5px] bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-[6px] font-bold rounded-sm">
                  {msg.confidence}
                </span>
              </span>
              <div className="bg-emerald-950/40 border border-emerald-500/20 text-emerald-300 p-2.5 rounded-2xl rounded-tr-sm text-[11px] leading-relaxed">
                {msg.text}
              </div>
              {msg.actions && (
                <span className="text-[7px] text-emerald-500/60 font-medium mt-0.5 self-end">
                  {msg.actions}
                </span>
              )}
            </>
          )}
        </div>
      ))}

      {isBotTyping && (
        <div
          className="flex flex-col space-y-0.5 items-end max-w-[85%] ml-auto"
        >
          <span className="text-[8px] text-emerald-400 mr-1 font-semibold">
            Seu Zélla digitando...
          </span>
          <div className="bg-emerald-950/40 border border-emerald-500/20 px-4 py-3 rounded-2xl rounded-tr-sm flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-bounce" style={{ animationDelay: '0ms' }} />
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-bounce" style={{ animationDelay: '150ms' }} />
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-bounce" style={{ animationDelay: '300ms' }} />
          </div>
        </div>
      )}
    </div>
  );
}

export function HeroSection() {
  const ref = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start start', 'end start'],
  });
  const mockupY = useTransform(scrollYProgress, [0, 1], [0, 60]);

  // Rotating hero words
  const rotatingPhrases = [
    'pelo WhatsApp.',
    'da sua pousada.',
    'o seu imóvel.',
  ];
  const [phraseIdx, setPhraseIdx] = useState(0);
  useEffect(() => {
    const interval = setInterval(() => {
      setPhraseIdx((prev) => (prev + 1) % rotatingPhrases.length);
    }, 2800);
    return () => clearInterval(interval);
  }, []);

  return (
    <section ref={ref} className="relative min-h-screen flex items-center overflow-hidden bg-[#0a0a0a]">

      {/* Ambient glow */}
      <div className="absolute top-1/4 -left-32 w-[500px] h-[500px] rounded-full bg-emerald-500/[0.07] blur-[120px]" />
      <div className="absolute bottom-1/4 -right-32 w-[400px] h-[400px] rounded-full bg-purple-500/[0.05] blur-[100px]" />

      <div className="relative z-10 max-w-7xl mx-auto px-6 pt-28 pb-20 w-full">
        <div className="flex flex-col items-center text-center gap-16">
          {/* TOP — Text */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="flex flex-col items-center max-w-4xl mx-auto"
          >
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/[0.08] mb-8">
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-emerald-400 text-xs font-medium uppercase tracking-wider">
                Deixa com o Zélla
              </span>
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            </div>

            {/* Headline — exactly 2 lines: static line 1 + dynamic line 2, left-aligned block centered on page */}
            <h1 className="text-[1.5rem] sm:text-5xl md:text-[3.25rem] lg:text-[3.75rem] xl:text-[4.5rem] font-satoshi font-bold tracking-tight leading-[1.15] text-white mb-6 text-left inline-block">
              <span className="block whitespace-nowrap">O Zélla atende, vende e</span>
              <span className="block whitespace-nowrap text-blue-500 font-bold">
                reserva{' '}
                <span className="inline-block overflow-hidden relative align-baseline">
                  <AnimatePresence mode="wait">
                    <motion.span
                      key={phraseIdx}
                      initial={{ y: '110%', opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      exit={{ y: '-110%', opacity: 0 }}
                      transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
                      className="inline-block whitespace-nowrap"
                    >
                      {rotatingPhrases[phraseIdx]}
                    </motion.span>
                  </AnimatePresence>
                </span>
              </span>
            </h1>

            <p className="text-lg sm:text-xl text-neutral-400 leading-relaxed mb-10 max-w-2xl mx-auto">
              O zelador digital que responde 24hs por 7. Atende os hóspedes com naturalidade, fecha a reserva aumentando seu tempo e seu dinheiro. Feito para pousadas e anfitriões de Airbnb.
            </p>

            {/* CTAs — two buttons side by side, centered */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12 w-full sm:w-auto">
              <button
                onClick={() => {
                  const el = document.querySelector('#precos');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }}
                className="group inline-flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-bold rounded-xl hover:from-emerald-400 hover:to-emerald-500 transition-all duration-200 shadow-xl shadow-emerald-500/30 cursor-pointer text-base active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
              >
                Grátis por 7 dias
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </button>
              <button
                onClick={() => router.push('/parceiro')}
                className="group inline-flex items-center justify-center gap-2 px-8 py-4 bg-white/[0.04] border border-white/[0.12] text-white/90 font-bold rounded-xl hover:bg-white/[0.08] hover:border-white/[0.20] hover:text-white transition-all duration-200 cursor-pointer text-base active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
              >
                <Crown className="w-4 h-4 text-amber-400" />
                Seja parceiro Zélla
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </button>
            </div>

            {/* Social proof mini */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6 text-sm text-neutral-400 font-medium">
              <div className="flex -space-x-2.5">
                {[
                  { name: 'Pousada Serenity', img: '/avatar-serenity.jpg' },
                  { name: 'Pousada Sol & Mar', img: '/pousada-vista.jpg' },
                  { name: 'Chalé da Montanha', img: '/pousada-chale.jpg' },
                  { name: 'Recanto Verde', img: '/pousada-jardim.jpg' }
                ].map((p, i) => (
                  <div key={i} className="w-8 h-8 rounded-full p-[1.5px] bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 shadow-sm relative" style={{ zIndex: 40 - i * 10 }}>
                    <div className="w-full h-full rounded-full border border-[#0a0a0a] overflow-hidden bg-zinc-900">
                      <img
                        src={p.img}
                        alt={p.name}
                        className="w-full h-full object-cover select-none"
                      />
                    </div>
                  </div>
                ))}
              </div>
              <span className="sm:border-l sm:border-white/10 sm:pl-6 text-neutral-400 font-semibold">+100 pousadas já atendem melhor com o Zélla</span>
            </div>
          </motion.div>

          {/* BOTTOM — Mockup Parallax */}
          <motion.div
            style={{ y: mockupY }}
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="relative w-full max-w-5xl mx-auto z-10"
          >
            {/* Centered Dashboard Glow - static, no animation */}
            <div
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[600px] sm:w-[1200px] sm:h-[800px] pointer-events-none z-0 opacity-60 blur-[120px]"
              style={{
                background: 'radial-gradient(ellipse 65% 55% at 50% 50%, rgba(59, 130, 246, 0.30) 0%, rgba(99, 102, 241, 0.15) 40%, rgba(16, 185, 129, 0.06) 70%, transparent 85%)'
              }}
            />

            {/* Main mockup */}
            <div className="relative bg-[#111] rounded-2xl border border-white/[0.08] shadow-2xl shadow-emerald-500/[0.05] overflow-hidden flex flex-col text-left z-10" style={{ maxHeight: '520px' }}>
              {/* Top bar */}
              <div className="flex items-center gap-2 px-4 py-3 border-b border-white/[0.06] bg-[#0a0a0a]/50">
                <div className="w-3 h-3 rounded-full bg-red-500/80" />
                <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                <div className="w-3 h-3 rounded-full bg-green-500/80" />
                <span className="text-neutral-600 text-[11px] ml-3 font-mono">ZÉLLA Console — Pousada Serenity</span>
              </div>

              <div className="flex">
                {/* Fake Sidebar */}
                <div className="hidden md:flex flex-col w-56 border-r border-white/[0.06] p-4 bg-[#0a0a0a]/30">
                  <div className="flex items-center gap-2 mb-8 px-2">
                    <div className="w-6 h-6 rounded bg-emerald-500/20 flex items-center justify-center">
                      <Sparkles className="w-3 h-3 text-emerald-400" />
                    </div>
                    <span className="text-white font-semibold text-sm">Dashboard</span>
                  </div>
                  <div className="space-y-1">
                    <div className="px-3 py-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center gap-3">
                       <Bot className="w-4 h-4 text-emerald-400" />
                       <span className="text-emerald-400 text-xs font-medium">Dashboard AI</span>
                    </div>
                    <div className="px-3 py-2 rounded-lg hover:bg-white/[0.02] flex items-center gap-3 transition-colors">
                       <MessageSquare className="w-4 h-4 text-neutral-500" />
                       <span className="text-neutral-400 text-xs font-medium">Conversas</span>
                    </div>
                    <div className="px-3 py-2 rounded-lg hover:bg-white/[0.02] flex items-center gap-3 transition-colors">
                       <div className="w-4 h-4 rounded-sm border border-neutral-500" />
                       <span className="text-neutral-400 text-xs font-medium">CRM Leads</span>
                    </div>
                    <div className="px-3 py-2 rounded-lg hover:bg-white/[0.02] flex items-center gap-3 transition-colors">
                       <div className="w-4 h-4 rounded-full border border-neutral-500" />
                       <span className="text-neutral-400 text-xs font-medium">Análises</span>
                    </div>
                  </div>
                </div>

                {/* Dashboard content */}
                <div className="flex-1 p-5 sm:p-8 space-y-6 overflow-hidden">
                  {/* Stats row — realistic numbers based on Meta's R$ 0,035/msg */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                      { label: 'Respostas em até 8 segundos', val: '24/7', title: 'Atendimento IA', color: 'text-emerald-400' },
                      { label: 'Média das pousadas parceiras', val: '+35%', title: 'Aumento em reservas', color: 'text-blue-400' },
                      { label: 'Sua chave PIX cadastrada', val: 'PIX', title: 'Pagamento integrado', color: 'text-amber-400' },
                      { label: 'Sem surpresas no fim do mês', val: 'R$ 197', title: 'A partir de /mês', color: 'text-zinc-300' },
                    ].map((s) => (
                      <div key={s.title} className="bg-white/[0.02] rounded-xl p-4 border border-white/[0.05] flex flex-col justify-center">
                        <div className="text-neutral-500 text-[10px] font-semibold uppercase tracking-wider mb-1">{s.title}</div>
                        <div className={`text-2xl font-bold ${s.color}`}>{s.val}</div>
                        <div className="text-neutral-500 text-[10px] mt-1 font-medium truncate">{s.label}</div>
                      </div>
                    ))}
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                    {/* Chat mockup */}
                    <div className="lg:col-span-3 bg-white/[0.02] rounded-xl p-5 border border-white/[0.05] space-y-4">
                      <div className="flex items-center gap-3 pb-3 border-b border-white/[0.04]">
                        <MessageSquare className="w-4 h-4 text-emerald-400" />
                        <span className="text-white text-sm font-medium">WhatsApp IA — Tempo Real</span>
                        <span className="ml-auto flex items-center gap-2">
                           <span className="text-[10px] text-emerald-400 font-medium">Online</span>
                           <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                        </span>
                      </div>
                      <ZellaChatPreview />
                    </div>

                    {/* Mini graph & Activity */}
                    <div className="lg:col-span-2 space-y-6">
                      <div className="bg-white/[0.02] rounded-xl p-5 border border-white/[0.05]">
                        <div className="flex items-center justify-between mb-4">
                          <span className="text-neutral-400 text-xs font-medium">Mensagens otimizadas esta semana</span>
                          <span className="text-emerald-400 text-[10px] font-bold bg-emerald-500/10 px-2 py-0.5 rounded-full">-64%</span>
                        </div>
                        <div className="flex items-end gap-2 h-20">
                          {[45, 40, 35, 30, 25, 20, 15].map((h, i) => (
                            <div key={i} className="flex-1 bg-amber-500/15 rounded-t-sm group relative" style={{ height: `${h}%` }}>
                              <div className="w-full h-full bg-gradient-to-t from-amber-500/30 to-amber-500/8 rounded-t-sm group-hover:from-amber-400/40 transition-colors" />
                            </div>
                          ))}
                        </div>
                        <div className="flex justify-between mt-2 text-[9px] text-neutral-600 font-medium">
                           <span>Seg</span><span>Ter</span><span>Qua</span><span>Qui</span><span>Sex</span><span>Sab</span><span>Dom</span>
                        </div>
                      </div>

                      <div className="bg-white/[0.02] rounded-xl p-5 border border-white/[0.05]">
                         <span className="text-neutral-400 text-xs font-medium mb-3 block">Atividade Recente</span>
                         <div className="space-y-3">
                            <div className="flex items-center gap-3">
                               <div className="w-2 h-2 rounded-full bg-blue-400"></div>
                               <div className="text-xs text-neutral-300">Reserva recebida (Maria)</div>
                               <div className="text-[10px] text-neutral-500 ml-auto">agora</div>
                            </div>
                            <div className="flex items-center gap-3">
                               <div className="w-2 h-2 rounded-full bg-emerald-400"></div>
                               <div className="text-xs text-neutral-300">Resposta completa enviada</div>
                               <div className="text-[10px] text-neutral-500 ml-auto">3m</div>
                            </div>
                            <div className="flex items-center gap-3">
                               <div className="w-2 h-2 rounded-full bg-amber-400"></div>
                               <div className="text-xs text-neutral-300">PIX confirmado</div>
                               <div className="text-[10px] text-neutral-500 ml-auto">12m</div>
                            </div>
                         </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>


          </motion.div>
        </div>
      </div>
    </section>
  );
}