'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, Terminal, X, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface HuntMessage {
  id: number;
  text: string;
  type: 'system' | 'info' | 'success' | 'warning' | 'error';
  timestamp: string;
}

const MOCK_MESSAGES: Omit<HuntMessage, 'id' | 'timestamp'>[] = [
  { text: '[$SYSTEM] Inicializando caçada...', type: 'system' },
  { text: '[$SCOUT] Conectando ao radar de prospecção...', type: 'info' },
  { text: '[$SCOUT] Buscando domínios e registros CNPJ...', type: 'info' },
  { text: '[$AI] Analisando perfil do alvo com modelo de IA...', type: 'info' },
  { text: '[$HUNTER] 14 contatos encontrados no domínio', type: 'success' },
  { text: '[$AI] Filtrando decisores por cargo e senioridade...', type: 'info' },
  { text: '[$AI] 6 decisores identificados (CEO, Diretor, Gerente)', type: 'success' },
  { text: '[$SCOUT] Validando e-mails com verificação SMTP...', type: 'info' },
  { text: '[$SCOUT] 5 e-mails válidos confirmados', type: 'success' },
  { text: '[$AI] Enriquecendo perfis com dados de LinkedIn...', type: 'info' },
  { text: '[$AI] Score IDP calculado: 78/100', type: 'success' },
  { text: '[$AI] Gap de receita estimado: 34%', type: 'warning' },
  { text: '[$SYSTEM] Caçada concluída — 5 leads qualificados adicionados', type: 'success' },
];

function getTimestamp(): string {
  return new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
}

function getMessageColor(type: HuntMessage['type']): string {
  switch (type) {
    case 'system': return 'text-white/40';
    case 'info': return 'text-cyan-400/80';
    case 'success': return 'text-emerald-400';
    case 'warning': return 'text-amber-400';
    case 'error': return 'text-red-400';
  }
}

export function HunterConsole() {
  const [target, setTarget] = useState('');
  const [messages, setMessages] = useState<HuntMessage[]>([]);
  const [isHunting, setIsHunting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isConnected, setIsConnected] = useState(false);
  const terminalRef = useRef<HTMLDivElement>(null);
  const eventSourceRef = useRef<EventSource | null>(null);
  const msgIdRef = useRef(0);

  const scrollToBottom = useCallback(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  const addMessage = useCallback((text: string, type: HuntMessage['type']) => {
    msgIdRef.current += 1;
    setMessages(prev => [...prev, { id: msgIdRef.current, text, type, timestamp: getTimestamp() }]);
  }, []);

  const startHunt = useCallback(async () => {
    if (!target.trim() || isHunting) return;

    const companyName = target.trim();
    setMessages([]);
    setProgress(0);
    setIsHunting(true);

    addMessage(`[$SYSTEM] Caçada iniciada para: ${companyName}`, 'system');

    const isMockRun = companyName.toLowerCase().includes('demo') || companyName.toLowerCase().includes('teste');

    if (isMockRun) {
      const totalSteps = MOCK_MESSAGES.length;
      for (let i = 0; i < totalSteps; i++) {
        await new Promise(resolve => setTimeout(resolve, 600 + Math.random() * 800));
        const msg = MOCK_MESSAGES[i];
        addMessage(msg.text, msg.type);
        setProgress(Math.round(((i + 1) / totalSteps) * 100));
      }
      setIsHunting(false);
      return;
    }

    try {
      const response = await fetch('/api/hunt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ target: companyName }),
      });

      if (!response.ok) {
        addMessage('[$ERROR] Falha ao iniciar caçada no servidor', 'error');
        setIsHunting(false);
        return;
      }

      const huntId = await response.json();

      if (typeof huntId === 'object' && huntId.id) {
        const sseUrl = `/api/hunt-stream?huntId=${huntId.id}`;

        try {
          const es = new EventSource(sseUrl);
          eventSourceRef.current = es;
          setIsConnected(true);
          addMessage('[$SSE] Conectado ao stream de eventos', 'info');

          es.addEventListener('message', (event) => {
            try {
              const data = JSON.parse(event.data);
              if (data.progress !== undefined) {
                setProgress(Math.min(100, Math.round(data.progress)));
              }
              if (data.message) {
                const msgType: HuntMessage['type'] = data.type || 'info';
                addMessage(data.message, msgType);
              }
              if (data.done) {
                es.close();
                eventSourceRef.current = null;
                setIsConnected(false);
                setIsHunting(false);
                setProgress(100);
              }
            } catch {
              addMessage(event.data, 'info');
            }
          });

          es.onerror = () => {
            es.close();
            eventSourceRef.current = null;
            setIsConnected(false);
            setIsHunting(false);
            addMessage('[$WARN] Stream desconectado — simulando resultado local', 'warning');

            const totalSteps = MOCK_MESSAGES.length;
            for (let i = 0; i < totalSteps; i++) {
              setTimeout(() => {
                const msg = MOCK_MESSAGES[i];
                addMessage(msg.text.replace(/Pousada Mar e Sol/g, companyName), msg.type);
                setProgress(Math.round(((i + 1) / totalSteps) * 100));
                if (i === totalSteps - 1) setIsHunting(false);
              }, i * 700);
            }
          };
        } catch {
          addMessage('[$ERROR] SSE não disponível — executando modo local', 'warning');
          const totalSteps = MOCK_MESSAGES.length;
          for (let i = 0; i < totalSteps; i++) {
            setTimeout(() => {
              const msg = MOCK_MESSAGES[i];
              addMessage(msg.text.replace(/Pousada Mar e Sol/g, companyName), msg.type);
              setProgress(Math.round(((i + 1) / totalSteps) * 100));
              if (i === totalSteps - 1) setIsHunting(false);
            }, i * 700);
          }
        }
      } else {
        addMessage('[$WARN] Modo demo ativado — API não disponível', 'warning');
        const totalSteps = MOCK_MESSAGES.length;
        for (let i = 0; i < totalSteps; i++) {
          setTimeout(() => {
            const msg = MOCK_MESSAGES[i];
            addMessage(msg.text.replace(/Pousada Mar e Sol/g, companyName), msg.type);
            setProgress(Math.round(((i + 1) / totalSteps) * 100));
            if (i === totalSteps - 1) setIsHunting(false);
          }, i * 700);
        }
      }
    } catch {
      addMessage('[$ERROR] Erro de conexão — executando em modo local', 'error');
      const totalSteps = MOCK_MESSAGES.length;
      for (let i = 0; i < totalSteps; i++) {
        setTimeout(() => {
          const msg = MOCK_MESSAGES[i];
          addMessage(msg.text.replace(/Pousada Mar e Sol/g, companyName), msg.type);
          setProgress(Math.round(((i + 1) / totalSteps) * 100));
          if (i === totalSteps - 1) setIsHunting(false);
        }, i * 700);
      }
    }
  }, [target, isHunting, addMessage]);

  const stopHunt = useCallback(() => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
      setIsConnected(false);
    }
    setIsHunting(false);
    addMessage('[$SYSTEM] Caçada interrompida pelo operador', 'warning');
  }, [addMessage]);

  const clearTerminal = useCallback(() => {
    setMessages([]);
    setProgress(0);
  }, []);

  return (
    <div className="bg-white/5 backdrop-blur border border-white/10 rounded-xl overflow-hidden flex flex-col h-full">
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
        <div className="flex items-center gap-2">
          <Terminal className="w-4 h-4 text-emerald-400" />
          <span className="text-sm font-semibold text-white/90">Hunter Console</span>
          {isConnected && (
            <span className="text-[10px] font-mono text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded-full animate-zehla-pulse">
              SSE LIVE
            </span>
          )}
        </div>
        {messages.length > 0 && (
          <button
            onClick={clearTerminal}
            className="text-white/30 hover:text-white/60 transition-colors"
            aria-label="Limpar terminal"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      <div
        ref={terminalRef}
        className="flex-1 max-h-80 overflow-y-auto p-4 space-y-1 zehla-scroll bg-black/30"
        style={{ fontFamily: 'var(--font-geist-mono), "Fira Code", monospace', fontSize: '0.75rem', lineHeight: '1.7' }}
      >
        {messages.length === 0 && (
          <div className="text-white/20 text-center py-8">
            <Zap className="w-6 h-6 mx-auto mb-2 opacity-40" />
            <p>Digite o nome da empresa e inicie a caçada</p>
            <p className="text-[10px] mt-1 text-white/10">Use &quot;demo&quot; para simulação local</p>
          </div>
        )}
        <AnimatePresence initial={false}>
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.2 }}
              className={`flex gap-2 ${getMessageColor(msg.type)}`}
            >
              <span className="text-white/15 shrink-0">{msg.timestamp}</span>
              <span className="break-all">{msg.text}</span>
            </motion.div>
          ))}
        </AnimatePresence>
        {isHunting && messages.length > 0 && (
          <span className="inline-block w-2 h-4 bg-emerald-400/60 animate-terminal-blink ml-1" />
        )}
      </div>

      {isHunting && (
        <div className="px-4 py-2 border-t border-white/10">
          <div className="flex items-center gap-3">
            <div className="flex-1 h-1.5 bg-white/5 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-emerald-500 to-cyan-400 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.4, ease: 'easeOut' }}
              />
            </div>
            <span className="text-[11px] font-mono text-white/50 w-10 text-right">{progress}%</span>
          </div>
        </div>
      )}

      <div className="flex items-center gap-2 p-3 border-t border-white/10">
        <div className="relative flex-1">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-emerald-400/60 text-xs font-mono">{'>'}</span>
          <Input
            value={target}
            onChange={(e) => setTarget(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter' && !isHunting) startHunt(); }}
            placeholder="Nome da empresa alvo..."
            className="pl-7 h-9 bg-white/5 border-white/10 text-sm font-mono text-white placeholder:text-white/25 focus:border-emerald-500/50 focus:ring-emerald-500/20"
            disabled={isHunting}
          />
        </div>
        {isHunting ? (
          <Button
            size="sm"
            variant="ghost"
            onClick={stopHunt}
            className="h-9 px-3 text-red-400 hover:text-red-300 hover:bg-red-400/10"
          >
            <Loader2 className="w-4 h-4 mr-1.5 animate-spin" />
            Parar
          </Button>
        ) : (
          <Button
            size="sm"
            onClick={startHunt}
            disabled={!target.trim()}
            className="h-9 px-4 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-white font-semibold shadow-lg shadow-emerald-500/20"
          >
            <Zap className="w-3.5 h-3.5 mr-1.5" />
            Iniciar Caçada
          </Button>
        )}
      </div>
    </div>
  );
}