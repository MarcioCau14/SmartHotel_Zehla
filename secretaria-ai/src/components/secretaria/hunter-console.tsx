'use client';

import { useRef, useEffect, useCallback, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Crosshair, RotateCcw } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

/* ============================================
   TIPOS
   ============================================ */
interface LogEntry {
  id: string;
  message: string;
  type: 'info' | 'success' | 'error' | 'loading';
  ts: number;
}

const LOG_COLORS: Record<LogEntry['type'], string> = {
  info: '#4169E1',
  success: '#10b981',
  error: '#ef4444',
  loading: '#f59e0b',
};

const LOG_LABELS: Record<LogEntry['type'], string> = {
  info: 'INFO',
  success: 'OK',
  error: 'ERR',
  loading: '...',
};

function fmtTime(ms: number): string {
  try {
    const d = new Date(ms);
    if (isNaN(d.getTime())) return '--:--:--';
    return d.toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  } catch {
    return '--:--:--';
  }
}

/* ============================================
   COMPONENTE
   ============================================ */
export function HunterConsole({ 
  onFilterStatus, 
  onFilterScore, 
  currentStatus, 
  currentScore 
}: { 
  onFilterStatus?: (s: string | null) => void, 
  onFilterScore?: (n: number) => void,
  currentStatus?: string | null,
  currentScore?: number
}) {
  const [input, setInput] = useState('');
  const [loop, setLoop] = useState(false);
  const [isHunting, setIsHunting] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [logs, setLogs] = useState<LogEntry[]>([]);

  const queryClient = useQueryClient();
  const abortRef = useRef<AbortController | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const addLog = useCallback((message: string, type: LogEntry['type']) => {
    setLogs((prev) => [
      ...prev,
      {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
        message,
        type,
        ts: Date.now(),
      },
    ]);
  }, []);

  /* Auto-scroll */
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs]);

  /* Cleanup */
  useEffect(() => {
    return () => {
      abortRef.current?.abort();
    };
  }, []);

  /* ═══════════════════════════════════════════════
     SSE HUNT — Pesquisa web real + IA (sem backend externo)
     Usa /api/hunt com z-ai-web-dev-sdk nativo.
     ═══════════════════════════════════════════════ */
  const hunt = useCallback(
    async (company: string) => {
      setIsHunting(true);
      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      addLog(`Iniciando caçada: ${company}...`, 'loading');

      try {
        const res = await fetch('/api/proxy/hunt', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            company_name: company,
            domains: [], // Optional in backend now
            titles: ["Marketing Director", "CMO", "Head of Marketing", "Gerente de Marketing"]
          }),
          signal: controller.signal,
        });

        if (!res.ok) {
          const txt = await res.text().catch(() => '');
          throw new Error(txt || `Erro HTTP ${res.status}`);
        }

        const reader = res.body?.getReader();
        if (!reader) throw new Error('Stream indisponível');

        const decoder = new TextDecoder();
        let buf = '';

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          buf += decoder.decode(value, { stream: true });

          const lines = buf.split('\n');
          buf = lines.pop() || '';

          for (const line of lines) {
            const trimmed = line.trim();
            if (trimmed.startsWith('data: ')) {
              try {
                const ev = JSON.parse(trimmed.slice(6));
                if (ev.message && ev.type) {
                  addLog(ev.message, ev.type);
                }
              } catch {
                /* malformed SSE — ignore */
              }
            }
          }
        }

        /* Stream completo — invalida queries */
        queryClient.invalidateQueries({ queryKey: ['leads'] });
        queryClient.invalidateQueries({ queryKey: ['targets'] });
        toast.success(`Caçada de ${company} finalizada`, { duration: 3000 });
      } catch (err: unknown) {
        if (err instanceof DOMException && err.name === 'AbortError') return;

        let msg = 'Erro desconhecido';
        if (err instanceof Error) {
          const raw = err.message;
          try {
            const p = JSON.parse(raw);
            if (p.error?.includes('8000') || p.error?.includes('502')) {
              msg = 'Erro de conexão. Tente novamente.';
            } else {
              msg = p.error || raw;
            }
          } catch {
            msg = raw;
          }
        }
        addLog(msg, 'error');
        toast.error('Falha na caçada', { description: msg, duration: 6000 });
      } finally {
        setIsHunting(false);
        abortRef.current = null;
      }
    },
    [addLog, queryClient]
  );

  const handleSubmit = useCallback(() => {
    const company = input.trim();
    if (!company) {
      toast.error('Insira o nome da empresa');
      return;
    }
    if (isHunting) return;
    hunt(company);
  }, [input, isHunting, hunt]);

  const handleKey = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' && !isHunting) handleSubmit();
    },
    [handleSubmit, isHunting]
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3, duration: 0.5 }}
      className="glass-card p-5 lg:p-6"
    >
      {/* Header */}
      <div className="flex items-center gap-3 mb-5">
        <div className="p-2 rounded-xl bg-[#4169E110] border border-[#4169E120]">
          <Crosshair size={18} className="text-[#4169E1]" />
        </div>
        <div>
          <h2 className="text-lg font-bold tracking-tight text-[#f1f5f9]">
            Hunter Console
          </h2>
          <p className="text-xs text-[#64748b]">
            Caçada automatizada de decisores
          </p>
        </div>
      </div>

      {/* Input */}
      <div className="flex gap-3 mb-4">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#64748b]" />
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKey}
            placeholder="Caçar Nova Empresa..."
            className="glass-input w-full h-11 pl-10 pr-4 text-sm text-[#f1f5f9] placeholder:text-[#64748b]"
          />
        </div>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleSubmit}
          disabled={isHunting || !input.trim()}
          className="h-11 px-5 rounded-xl bg-[#4169E1] text-white text-sm font-semibold
            flex items-center gap-2 transition-all duration-200
            disabled:opacity-40 disabled:cursor-not-allowed
            hover:bg-[#4169E1dd] hover:shadow-[0_0_20px_rgba(65,105,225,0.3)]"
        >
          {isHunting ? (
            <>
              <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}>
                <Crosshair size={16} />
              </motion.div>
              Caçando...
            </>
          ) : (
            <>
              <Crosshair size={16} />
              Iniciar Caçada
            </>
          )}
        </motion.button>
      </div>

      {/* Advanced Filters Toggle */}
      <div className="flex flex-col gap-3 mb-5">
        <button 
          onClick={() => setShowFilters(!showFilters)}
          className="text-[10px] font-bold text-[#4169E1] uppercase tracking-widest flex items-center gap-2 hover:opacity-80 transition-opacity"
        >
          {showFilters ? 'Esconder Filtros Avançados' : 'Mostrar Filtros Avançados'}
          <div className="h-px flex-1 bg-[rgba(65,105,225,0.1)]" />
        </button>
        
        <AnimatePresence>
          {showFilters && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="grid grid-cols-2 gap-4 pt-1 pb-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-medium text-[#64748b] uppercase tracking-wider">Status do Lead</label>
                  <div className="flex gap-1.5">
                    {['all', 'verified', 'pending', 'invalid'].map((s) => (
                      <button
                        key={s}
                        onClick={() => onFilterStatus?.(s === 'all' ? null : s)}
                        className={`px-2.5 py-1 rounded-lg text-[10px] font-semibold border transition-all duration-200 ${
                          (currentStatus === s || (s === 'all' && !currentStatus))
                            ? 'bg-[#4169E1] text-white border-[#4169E1]'
                            : 'bg-[rgba(255,255,255,0.02)] text-[#64748b] border-[rgba(255,255,255,0.05)] hover:border-[rgba(255,255,255,0.1)]'
                        }`}
                      >
                        {s.toUpperCase()}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-medium text-[#64748b] uppercase tracking-wider">Min OSINT Score: {currentScore}%</label>
                  <input 
                    type="range" 
                    min="0" 
                    max="100" 
                    value={currentScore} 
                    onChange={(e) => onFilterScore?.(parseInt(e.target.value))}
                    className="w-full h-1.5 bg-[rgba(255,255,255,0.05)] rounded-lg appearance-none cursor-pointer accent-[#4169E1]"
                  />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Hunter Loop Toggle */}
      <div className="flex items-center justify-between mb-5 p-3 rounded-xl bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.05)]">
        <div className="flex items-center gap-3">
          <motion.div
            animate={loop ? { rotate: 360 } : { rotate: 0 }}
            transition={loop ? { duration: 3, repeat: Infinity, ease: 'linear' } : { duration: 0 }}
          >
            <RotateCcw size={15} className="text-[#94a3b8]" />
          </motion.div>
          <div>
            <span className="text-sm font-medium text-[#f1f5f9]">Hunter Loop</span>
            <span className="text-xs text-[#64748b] ml-2">Modo contínuo</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span
            className="text-xs font-semibold px-2.5 py-0.5 rounded-full"
            style={{
              color: loop ? '#14b8a6' : '#64748b',
              backgroundColor: loop ? 'rgba(20,184,166,0.1)' : 'rgba(100,116,139,0.1)',
              border: `1px solid ${loop ? 'rgba(20,184,166,0.25)' : 'rgba(100,116,139,0.15)'}`,
            }}
          >
            {loop ? 'ON' : 'OFF'}
          </span>
          <Switch checked={loop} onCheckedChange={setLoop} className="data-[state=checked]:bg-[#14b8a6]" />
        </div>
      </div>

      {/* Console Output */}
      <div className="relative">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-[#64748b] uppercase tracking-wider">
              Console Output
            </span>
            {isHunting && (
              <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-1 text-[10px] font-semibold text-[#10b981]">
                <span className="w-1.5 h-1.5 rounded-full bg-[#10b981] animate-ping" />
                LIVE
              </motion.span>
            )}
          </div>
          {logs.length > 0 && (
            <button onClick={() => setLogs([])} className="text-xs text-[#64748b] hover:text-[#94a3b8] transition-colors">
              Limpar
            </button>
          )}
        </div>
        <div
          ref={scrollRef}
          className="max-h-48 overflow-y-auto rounded-xl bg-[rgba(0,0,0,0.3)] border border-[rgba(255,255,255,0.05)] p-3 font-mono text-xs space-y-1.5"
        >
          {logs.length === 0 ? (
            <div className="text-[#64748b] py-4 text-center">
              <span className="opacity-50">Aguardando caçada...</span>
            </div>
          ) : (
            <AnimatePresence mode="popLayout">
              {logs.map((log) => (
                <motion.div
                  key={log.id}
                  initial={{ opacity: 0, x: 12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.25 }}
                  className="flex items-start gap-2 leading-relaxed"
                >
                  <span className="text-[#64748b] shrink-0">{fmtTime(log.ts)}</span>
                  <span className="w-1.5 h-1.5 rounded-full shrink-0 mt-1.5" style={{ backgroundColor: LOG_COLORS[log.type] }} />
                  <span className="shrink-0 w-7 font-bold" style={{ color: LOG_COLORS[log.type] }}>
                    {LOG_LABELS[log.type]}
                  </span>
                  <span className="text-[#94a3b8]">{log.message}</span>
                </motion.div>
              ))}
            </AnimatePresence>
          )}
        </div>
      </div>
    </motion.div>
  );
}
