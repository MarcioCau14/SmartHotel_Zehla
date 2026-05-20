'use client';

import { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Bot, User, Send, Loader2 } from "lucide-react";

interface Message {
  role: 'assistant' | 'user';
  content: string;
}

/**
 * FinanceChat: Interface conversacional para interagir com Jony, Maria ou Tedd.
 */
export function FinanceChat() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: 'Olá! Sou o Jony. Posso te ajudar com o faturamento de hoje, tendências identificadas pela Maria ou as previsões do Tedd. O que você gostaria de saber?'
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    if (!input.trim() || loading) return;
    
    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setLoading(true);

    try {
      // Aqui integraria com a rota de chat da IA
      const res = await fetch('/api/zcc/finance/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMessage }),
      });
      
      const data = await res.json();
      setMessages(prev => [...prev, { role: 'assistant', content: data.reply || 'Entendido. Estou processando sua solicitação.' }]);
    } catch {
      // Mock para demonstração se a API não estiver pronta
      setTimeout(() => {
        setMessages(prev => [...prev, { role: 'assistant', content: `Sou o Jony. Recebi sua mensagem: "${userMessage}". Estou consultando a Maria para uma análise profunda.` }]);
        setLoading(false);
      }, 1000);
      return;
    }
    setLoading(false);
  };

  return (
    <Card className="h-[500px] flex flex-col shadow-lg border-2 border-blue-500/10">
      <CardContent className="p-4 border-b bg-blue-500/5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Bot className="w-5 h-5 text-blue-500" />
          <span className="font-bold text-sm tracking-tight">CHAT FINANCEIRO (JONY/MARIA/TEDD)</span>
        </div>
        <div className="flex items-center gap-1">
           <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
           <span className="text-[10px] font-medium text-muted-foreground">AGENTE ATIVO</span>
        </div>
      </CardContent>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin">
        {messages.map((msg, i) => (
          <div key={i} className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            {msg.role === 'assistant' && (
              <div className="w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center shrink-0">
                <Bot className="w-4 h-4 text-blue-500" />
              </div>
            )}
            <div className={`rounded-2xl px-4 py-2.5 max-w-[85%] text-sm shadow-sm ${
              msg.role === 'user' 
                ? 'bg-blue-600 text-white rounded-tr-none' 
                : 'bg-muted text-foreground rounded-tl-none border border-border/50'
            }`}>
              {msg.content}
            </div>
            {msg.role === 'user' && (
              <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center shrink-0">
                <User className="w-4 h-4 text-slate-600" />
              </div>
            )}
          </div>
        ))}
        {loading && (
          <div className="flex gap-2 items-center text-muted-foreground animate-pulse">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span className="text-xs italic">Maria está analisando...</span>
          </div>
        )}
      </div>

      <div className="p-4 border-t bg-slate-50/50">
        <div className="flex gap-2">
          <Input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSend()}
            placeholder="Pergunte ao Jony sobre seu faturamento..."
            disabled={loading}
            className="bg-white"
          />
          <Button onClick={handleSend} disabled={loading || !input.trim()} size="icon" className="shrink-0">
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </Card>
  );
}
