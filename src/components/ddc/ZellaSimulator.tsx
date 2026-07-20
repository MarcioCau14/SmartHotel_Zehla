'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Bot, Smartphone, Loader2, Zap, TrendingDown, X, MessageSquare, Info } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { MagicScanResult } from '@/components/ddc/MagicScanner';
import type { NicheType } from '@/contexts/NicheContext';

// ═══════════════════════════════════════════════════════════════
// ZELLA SIMULATOR — WhatsApp-Style AI Sandbox
// Permite que o cliente teste a IA antes de conectar
// ao número oficial do WhatsApp da propriedade.
// ═══════════════════════════════════════════════════════════════

// ── Types ──────────────────────────────────────────────────────

interface SimulatorMessage {
  id: string;
  role: 'guest' | 'zella';
  content: string;
  timestamp: Date;
  isBundled?: boolean;
  bundledCount?: number;
}

interface EconomyData {
  messagesCount: number;
  tariffsUsed: number;
  economyPercent: number;
  metaCostSaved: number;
  metaCostPerTariff: number;
  metaCostTotal: number;
}

interface ZellaSimulatorProps {
  niche: NicheType;
  propertyData: MagicScanResult;
}

// ── Niche Theme Config ────────────────────────────────────────

const SIM_THEME = {
  pousada: {
    guestBubble: 'bg-emerald-600/90 text-white',
    guestBubbleTail: 'border-l-emerald-600/90',
    zellaBubble: 'bg-zinc-800 text-zinc-100',
    zellaBubbleTail: 'border-r-zinc-800',
    accentColor: 'emerald' as const,
    accentBg: 'bg-emerald-500',
    accentBgLight: 'bg-emerald-500/15',
    accentBorder: 'border-emerald-500/30',
    accentText: 'text-emerald-400',
    headerGradient: 'from-emerald-600 to-teal-600',
    inputBorder: 'focus-within:border-emerald-500/40',
    phoneFrame: 'border-emerald-500/20',
    badgeVariant: 'emerald' as const,
  },
  airbnb: {
    guestBubble: 'bg-blue-600/90 text-white',
    guestBubbleTail: 'border-l-blue-600/90',
    zellaBubble: 'bg-zinc-800 text-zinc-100',
    zellaBubbleTail: 'border-r-zinc-800',
    accentColor: 'blue' as const,
    accentBg: 'bg-blue-500',
    accentBgLight: 'bg-blue-500/15',
    accentBorder: 'border-blue-500/30',
    accentText: 'text-blue-400',
    headerGradient: 'from-blue-600 to-indigo-600',
    inputBorder: 'focus-within:border-blue-500/40',
    phoneFrame: 'border-blue-500/20',
    badgeVariant: 'blue' as const,
  },
};

// ── Welcome Message ──────────────────────────────────────────

const WELCOME_MESSAGES: Record<NicheType, string> = {
  pousada:
    'Olá! 👋 Sou a **IA Zélla**, assistente virtual da sua pousada.\n\nEstou aqui no modo simulador para você testar como eu respondo aos hóspedes. Digite como se fosse um hóspede interessado!\n\n💡 **Dica:** Envie 3+ mensagens rápidas seguidas para ver o **Message Bundling** em ação!',
  airbnb:
    'Olá! 👋 Sou a **IA Zélla**, assistente virtual do seu imóvel.\n\nEstou aqui no modo simulador para você testar como eu respondo aos hóspedes. Digite como se fosse um hóspede interessado!\n\n💡 **Dica:** Envie 3+ mensagens rápidas seguidas para ver o **Message Bundling** em ação!',
};

// ── Component ─────────────────────────────────────────────────

export function ZellaSimulator({ niche, propertyData }: ZellaSimulatorProps) {
  const theme = SIM_THEME[niche];

  // Chat state
  const [messages, setMessages] = useState<SimulatorMessage[]>([
    {
      id: 'welcome',
      role: 'zella',
      content: WELCOME_MESSAGES[niche],
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isBundling, setIsBundling] = useState(false);
  const [economyBadge, setEconomyBadge] = useState<EconomyData | null>(null);

  // Bundling logic: track rapid messages
  const pendingMessagesRef = useRef<string[]>([]);
  const bundlingTimerRef = useRef<NodeJS.Timeout | null>(null);
  const BUNDLING_WINDOW_MS = 3000; // 3 seconds to group rapid messages
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isBundling]);

  // Fire-and-forget telemetry to ZCC burn-rate
  const fireTelemetry = useCallback(async (bundlingData: EconomyData) => {
    try {
      await fetch('/api/zcc/burn-rate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event: 'simulator_bundling',
          messagesCount: bundlingData.messagesCount,
          tariffsUsed: bundlingData.tariffsUsed,
          tariffsSaved: bundlingData.messagesCount - bundlingData.tariffsUsed,
          metaCostSpent: bundlingData.metaCostTotal,
          metaCostSaved: bundlingData.metaCostSaved,
          economyPercent: bundlingData.economyPercent,
          niche,
        }),
      });
    } catch {
      // Silent fail — telemetry must not block UX
    }
  }, [niche]);

  // Process bundled messages via API
  const processMessages = useCallback(async (messagesToSend: string[]) => {
    if (messagesToSend.length === 0) return;

    setIsProcessing(true);

    try {
      const res = await fetch('/api/zella/simulate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: messagesToSend,
          propertyData: {
            propertyName: propertyData.propertyName,
            location: propertyData.location,
            priceRange: propertyData.priceRange,
            amenities: propertyData.amenities,
            aiVoiceTone: propertyData.aiVoiceTone,
            checkInTime: propertyData.checkInTime,
            checkOutTime: propertyData.checkOutTime,
            policies: propertyData.policies,
            description: propertyData.description,
            highlights: propertyData.highlights,
          },
          niche,
        }),
      });

      const json = await res.json();

      if (json.success && json.data) {
        const zellaMsg: SimulatorMessage = {
          id: `zella-${Date.now()}`,
          role: 'zella',
          content: json.data.response,
          timestamp: new Date(),
          isBundled: json.data.bundling.isBundled,
          bundledCount: json.data.bundling.bundledCount,
        };

        setMessages(prev => [...prev, zellaMsg]);

        // Show economy badge if bundled
        if (json.data.bundling.isBundled && json.data.bundling.bundledCount >= 2) {
          const economy: EconomyData = {
            messagesCount: json.data.bundling.bundledCount,
            tariffsUsed: json.data.bundling.tariffsUsed,
            economyPercent: json.data.bundling.economyPercent,
            metaCostSaved: json.data.bundling.metaCostSaved,
            metaCostPerTariff: json.data.bundling.metaCostPerTariff,
            metaCostTotal: json.data.bundling.metaCostTotal,
          };
          setEconomyBadge(economy);

          // Fire telemetry silently
          fireTelemetry(economy);

          // Auto-hide badge after 8 seconds
          setTimeout(() => setEconomyBadge(null), 8000);
        }
      }
    } catch {
      // Add error message as Zélla response
      setMessages(prev => [
        ...prev,
        {
          id: `error-${Date.now()}`,
          role: 'zella',
          content: '⚠️ Erro de conexão. Tente novamente.',
          timestamp: new Date(),
        },
      ]);
    } finally {
      setIsProcessing(false);
      setIsBundling(false);
      inputRef.current?.focus();
    }
  }, [propertyData, niche, fireTelemetry]);

  // Handle message send with bundling logic
  const handleSend = useCallback(() => {
    const trimmed = input.trim();
    if (!trimmed || isProcessing) return;

    // Add guest message immediately
    const guestMsg: SimulatorMessage = {
      id: `guest-${Date.now()}`,
      role: 'guest',
      content: trimmed,
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, guestMsg]);
    setInput('');

    // Add to pending messages for bundling
    pendingMessagesRef.current.push(trimmed);

    // If this is the first pending message, show bundling indicator
    if (pendingMessagesRef.current.length >= 2 && !isBundling) {
      setIsBundling(true);
    }

    // Clear existing timer
    if (bundlingTimerRef.current) {
      clearTimeout(bundlingTimerRef.current);
    }

    // Set bundling window timer
    // After BUNDLING_WINDOW_MS of inactivity, process all pending messages
    bundlingTimerRef.current = setTimeout(() => {
      const toProcess = [...pendingMessagesRef.current];
      pendingMessagesRef.current = [];

      if (toProcess.length >= 2) {
        // Show bundling indicator for a moment, then process
        setIsBundling(true);
        setTimeout(() => {
          processMessages(toProcess);
        }, 1000); // Brief visual indicator before API call
      } else {
        // Single message — process immediately
        processMessages(toProcess);
      }
    }, BUNDLING_WINDOW_MS);
  }, [input, isProcessing, isBundling, processMessages]);

  // Handle Enter key
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSend();
    }
  };

  // Simple markdown-like rendering
  const renderContent = (content: string) => {
    return content.split('\n').map((line, i) => {
      // Bold: **text**
      const rendered = line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
      return (
        <span key={i}>
          {i > 0 && <br />}
          <span dangerouslySetInnerHTML={{ __html: rendered }} />
        </span>
      );
    });
  };

  return (
    <div className="flex flex-col gap-4">
      {/* ── Header Card ─────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative"
      >
        <Card className="bg-black/40 border-white/[0.06] overflow-hidden">
          <div className={`h-1 bg-gradient-to-r ${theme.headerGradient}`} />
          <div className="p-4 md:p-6">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${theme.headerGradient} flex items-center justify-center flex-shrink-0`}>
                  <Bot className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">
                    Simulador Zélla
                  </h3>
                  <p className="text-xs text-white/50 mt-0.5">
                    Teste a IA antes de conectar ao WhatsApp oficial
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <Badge variant="outline" className={`${theme.accentBorder} ${theme.accentText} text-[10px]`}>
                  <Smartphone className="w-3 h-3 mr-1" />
                  Sandbox
                </Badge>
                <Badge variant="outline" className="border-amber-500/30 text-amber-400 text-[10px]">
                  Mock Mode
                </Badge>
              </div>
            </div>

            {/* How it works */}
            <div className="mt-4 p-3 rounded-lg bg-white/[0.03] border border-white/[0.06]">
              <div className="flex items-start gap-2">
                <Info className="w-4 h-4 text-white/40 mt-0.5 flex-shrink-0" />
                <div className="text-[11px] text-white/50 leading-relaxed">
                  <strong className="text-white/70">Como funciona:</strong> Digite mensagens como se fosse um hóspede.
                  A IA responde com base nos dados da sua propriedade.
                  Envie <strong className="text-white/70">2+ mensagens rápidas</strong> para ativar o{' '}
                  <span className={`${theme.accentText}`}>Message Bundling</span> —
                  a IA agrupa tudo e responde em uma única tarifa Meta, economizando dinheiro.
                </div>
              </div>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* ── Phone Simulator ─────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="flex justify-center"
      >
        <div className={`w-full max-w-md bg-[#0d0d14] rounded-2xl border-2 ${theme.phoneFrame} overflow-hidden shadow-2xl`}>
          {/* Phone notch */}
          <div className="flex justify-center pt-2 pb-1">
            <div className="w-20 h-1 bg-white/10 rounded-full" />
          </div>

          {/* Chat header */}
          <div className={`flex items-center gap-3 px-4 py-3 bg-gradient-to-r ${theme.headerGradient}`}>
            <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
              <Bot className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-bold text-white">
                IA Zélla
              </h4>
              <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-white/80 animate-pulse" />
                <span className="text-[10px] text-white/70">Online · {propertyData.propertyName || 'Sandbox'}</span>
              </div>
            </div>
            <Badge className="bg-white/20 text-white text-[9px] border-0 px-1.5 py-0">
              SIMULADOR
            </Badge>
          </div>

          {/* Chat messages area */}
          <div className="h-[420px] overflow-y-auto p-3 space-y-2 bg-[#0a0a0f]/80 scrollbar-thin">
            <AnimatePresence mode="popLayout">
              {messages.map((msg) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 8, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className={`flex ${msg.role === 'guest' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[85%] rounded-xl px-3 py-2 text-[13px] leading-relaxed ${
                      msg.role === 'guest'
                        ? `${theme.guestBubble} rounded-br-sm`
                        : `${theme.zellaBubble} rounded-bl-sm`
                    }`}
                  >
                    {/* Bundled indicator for Zélla responses */}
                    {msg.role === 'zella' && msg.isBundled && msg.bundledCount && msg.bundledCount >= 2 && (
                      <div className={`inline-flex items-center gap-1 ${theme.accentBgLight} ${theme.accentBorder} border rounded-md px-1.5 py-0.5 mb-1.5`}>
                        <Zap className={`w-2.5 h-2.5 ${theme.accentText}`} />
                        <span className={`text-[9px] font-mono ${theme.accentText}`}>
                          {msg.bundledCount} msgs → 1 resposta
                        </span>
                      </div>
                    )}
                    <div className="whitespace-pre-wrap break-words">
                      {renderContent(msg.content)}
                    </div>
                    <div className={`text-[9px] mt-1 ${msg.role === 'guest' ? 'text-white/50 text-right' : 'text-white/30'}`}>
                      {msg.timestamp.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {/* Bundling indicator */}
            <AnimatePresence>
              {isBundling && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  className="flex justify-start"
                >
                  <div className="bg-zinc-800/80 rounded-xl rounded-bl-sm px-3 py-2.5 flex items-center gap-2 border border-white/[0.06]">
                    <div className="flex gap-1">
                      <motion.div
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ repeat: Infinity, duration: 0.8, delay: 0 }}
                        className={`w-1.5 h-1.5 rounded-full ${theme.accentBg}`}
                      />
                      <motion.div
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ repeat: Infinity, duration: 0.8, delay: 0.2 }}
                        className={`w-1.5 h-1.5 rounded-full ${theme.accentBg}`}
                      />
                      <motion.div
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ repeat: Infinity, duration: 0.8, delay: 0.4 }}
                        className={`w-1.5 h-1.5 rounded-full ${theme.accentBg}`}
                      />
                    </div>
                    <span className="text-[11px] text-white/60">
                      Zélla está agrupando o contexto...
                    </span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Processing indicator (when not bundling) */}
            <AnimatePresence>
              {isProcessing && !isBundling && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="flex justify-start"
                >
                  <div className="bg-zinc-800/80 rounded-xl rounded-bl-sm px-3 py-2.5 flex items-center gap-2">
                    <Loader2 className={`w-3.5 h-3.5 ${theme.accentText} animate-spin`} />
                    <span className="text-[11px] text-white/60">Zélla está digitando...</span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div ref={messagesEndRef} />
          </div>

          {/* Economy Badge (floating) */}
          <AnimatePresence>
            {economyBadge && (
              <motion.div
                initial={{ opacity: 0, y: 20, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 20, scale: 0.9 }}
                transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                className="mx-3 mb-2"
              >
                <div className={`relative bg-gradient-to-r ${theme.headerGradient} rounded-xl px-4 py-3 shadow-lg`}>
                  <button
                    onClick={() => setEconomyBadge(null)}
                    className="absolute top-2 right-2 text-white/60 hover:text-white transition-colors"
                    aria-label="Fechar alerta de economia"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center flex-shrink-0">
                      <Zap className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-white">
                        Economia de Tráfego
                      </p>
                      <p className="text-[11px] text-white/80 mt-0.5">
                        O hóspede enviou <strong>{economyBadge.messagesCount}</strong> mensagens.
                        O Zélla agrupou e utilizou apenas{' '}
                        <strong>{economyBadge.tariffsUsed}</strong> tarifa Meta
                        (US$ {economyBadge.metaCostPerTariff.toFixed(4)}).
                      </p>
                      <div className="flex items-center gap-2 mt-1.5">
                        <Badge className="bg-white/20 text-white text-[9px] border-0 px-1.5 py-0.5">
                          <TrendingDown className="w-2.5 h-2.5 mr-0.5" />
                          Economia de {economyBadge.economyPercent}%
                        </Badge>
                        <span className="text-[9px] text-white/60">
                          US$ {economyBadge.metaCostSaved.toFixed(4)} economizado
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Input area */}
          <div className={`border-t border-white/[0.06] p-3 bg-[#0d0d14]`}>
            <div className={`flex items-center gap-2 rounded-xl bg-white/[0.04] border border-white/[0.08] ${theme.inputBorder} px-3 py-2 transition-colors`}>
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value.slice(0, 500))}
                onKeyDown={handleKeyDown}
                placeholder="Digite como um hóspede..."
                disabled={isProcessing}
                className="flex-1 bg-transparent text-white text-sm placeholder:text-white/30 outline-none disabled:opacity-50"
              />
              <Button
                onClick={handleSend}
                disabled={!input.trim() || isProcessing}
                className={`h-8 w-8 p-0 ${theme.accentBg} hover:opacity-90 text-white rounded-lg flex-shrink-0`}
              >
                {isProcessing ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Send className="w-3.5 h-3.5" />
                )}
              </Button>
            </div>
            <div className="flex justify-between mt-1.5 px-1">
              <span className="text-[9px] text-white/30">
                Enter para enviar
              </span>
              <span className="text-[9px] text-white/30">
                {input.length}/500
              </span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* ── Economy Stats Footer ────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card className="bg-black/40 border-white/[0.06]">
          <div className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <MessageSquare className={`w-4 h-4 ${theme.accentText}`} />
              <h4 className="text-sm font-semibold text-white">
                Como o Message Bundling funciona
              </h4>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="bg-white/[0.03] border border-white/[0.06] rounded-lg p-3">
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-6 h-6 rounded-md bg-white/10 flex items-center justify-center">
                    <span className="text-[10px] font-mono text-white/60">1</span>
                  </div>
                  <span className="text-[11px] font-medium text-white/70">Hóspede envia</span>
                </div>
                <p className="text-[10px] text-white/40 leading-relaxed">
                  Múltiplas mensagens em sequência rápida ("Oi", "Qual o valor?", "Tem vaga?")
                </p>
              </div>
              <div className="bg-white/[0.03] border border-white/[0.06] rounded-lg p-3">
                <div className="flex items-center gap-2 mb-1">
                  <div className={`w-6 h-6 rounded-md ${theme.accentBgLight} flex items-center justify-center`}>
                    <Zap className={`w-3 h-3 ${theme.accentText}`} />
                  </div>
                  <span className="text-[11px] font-medium text-white/70">Zélla agrupa</span>
                </div>
                <p className="text-[10px] text-white/40 leading-relaxed">
                  IA detecta o contexto completo e consolida em uma única análise
                </p>
              </div>
              <div className="bg-white/[0.03] border border-white/[0.06] rounded-lg p-3">
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-6 h-6 rounded-md bg-emerald-500/15 flex items-center justify-center">
                    <TrendingDown className="w-3 h-3 text-emerald-400" />
                  </div>
                  <span className="text-[11px] font-medium text-white/70">1 tarifa Meta</span>
                </div>
                <p className="text-[10px] text-white/40 leading-relaxed">
                  Resposta única = 1 cobrança Meta. Sem bundling = N cobranças separadas
                </p>
              </div>
            </div>
          </div>
        </Card>
      </motion.div>
    </div>
  );
}


