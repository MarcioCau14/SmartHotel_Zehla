'use client';

import { useState, useRef, useEffect } from 'react';
import { Bot, User, Send, Loader2 } from 'lucide-react';

export interface FinanceChatProps {
  propertyId: string;
}

interface Message {
  role: 'assistant' | 'user';
  content: string;
}

export function FinanceChat({ propertyId }: FinanceChatProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: 'Olá! Sou a inteligência ZEHLA Finance. Posso te ajudar a analisar o faturamento por canal, identificar anomalias nos custos e simular projeções para os próximos dias. O que deseja saber?',
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;
    const userMessage = input.trim();
    setInput('');
    setMessages((prev) => [...prev, { role: 'user', content: userMessage }]);
    setLoading(true);

    try {
      const res = await fetch('/api/zcc/finance/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ propertyId, message: userMessage }),
      });
      const data = await res.json();
      if (data.success) {
        setMessages((prev) => [...prev, { role: 'assistant', content: data.reply }]);
      } else {
        setMessages((prev) => [
          ...prev,
          { role: 'assistant', content: data.error || 'Desculpe, ocorreu um erro ao obter os dados.' },
        ]);
      }
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: 'Desculpe, houve uma falha de conexão com os agentes.' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="border border-neutral-800 bg-[#0c0c0c] rounded-2xl flex flex-col h-[480px] shadow-xl overflow-hidden">
      {/* Header */}
      <div className="px-5 py-4 border-b border-white/5 flex items-center gap-2.5 bg-white/[0.01]">
        <Bot className="w-5 h-5 text-orange-500" />
        <div>
          <h4 className="text-xs font-mono font-bold text-neutral-200 uppercase tracking-wider">Chat Financeiro Conversacional</h4>
          <span className="text-[9px] font-mono text-neutral-500 uppercase">Jony, Maria & Tedd Online</span>
        </div>
      </div>

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto p-5 space-y-4 zehla-scroll">
        {messages.map((msg, i) => (
          <div key={i} className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : ''}`}>
            {msg.role === 'assistant' && (
              <div className="w-7 h-7 rounded-lg bg-orange-500/10 border border-orange-500/20 flex items-center justify-center shrink-0">
                <Bot className="w-4 h-4 text-orange-500" />
              </div>
            )}
            <div
              className={`rounded-2xl px-4 py-3 max-w-[80%] text-sm leading-relaxed tracking-wide ${
                msg.role === 'user'
                  ? 'bg-neutral-800 text-[#f3f3f3] border border-neutral-700/50 rounded-tr-none'
                  : 'bg-white/[0.02] text-neutral-300 border border-white/5 rounded-tl-none font-sans'
              }`}
            >
              {msg.content}
            </div>
            {msg.role === 'user' && (
              <div className="w-7 h-7 rounded-lg bg-neutral-800 border border-neutral-700 flex items-center justify-center shrink-0">
                <User className="w-4 h-4 text-neutral-300" />
              </div>
            )}
          </div>
        ))}
        {loading && (
          <div className="flex gap-3">
            <div className="w-7 h-7 rounded-lg bg-orange-500/10 border border-orange-500/20 flex items-center justify-center shrink-0 animate-spin">
              <Loader2 className="w-4 h-4 text-orange-500" />
            </div>
            <div className="rounded-2xl px-4 py-3 bg-white/[0.02] text-neutral-500 border border-white/5 rounded-tl-none text-xs font-mono tracking-widest uppercase">
              Auditando registros de caixa...
            </div>
          </div>
        )}
        <div ref={scrollRef} />
      </div>

      {/* Input area */}
      <div className="p-4 border-t border-white/5 bg-white/[0.005] flex gap-3">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          placeholder="Pergunte ex: 'Qual a margem dos últimos 30 dias?' ou 'Como está a ocupação?'"
          disabled={loading}
          className="flex-1 bg-[#121212] border border-neutral-800/80 rounded-xl px-4 py-2 text-sm text-[#fafafa] placeholder-neutral-600 focus:outline-none focus:border-orange-500/50 focus:ring-1 focus:ring-orange-500/20 transition-all"
        />
        <button
          onClick={handleSend}
          disabled={loading || !input.trim()}
          className="bg-orange-500 hover:bg-orange-600 disabled:bg-neutral-800 disabled:text-neutral-600 text-black font-bold px-4 py-2 rounded-xl flex items-center justify-center shrink-0 transition-colors shadow-lg shadow-orange-500/10 disabled:shadow-none"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
