'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, Users, HardHat, Truck, AlertTriangle } from 'lucide-react';
import type { TerminalMessage } from '@/lib/store';

// Category configuration with colors and labels
const categoryConfig = {
  guest: {
    label: 'HÓSPEDES',
    emoji: '🟢',
    color: 'text-green-400',
    bg: 'bg-green-500/10',
    border: 'border-green-500/30',
    badgeBg: 'bg-green-500/20',
    dotBg: 'bg-green-400',
    icon: Users,
  },
  employee: {
    label: 'COLABORADORES',
    emoji: '🔵',
    color: 'text-blue-400',
    bg: 'bg-blue-500/10',
    border: 'border-blue-500/30',
    badgeBg: 'bg-blue-500/20',
    dotBg: 'bg-blue-400',
    icon: HardHat,
  },
  supplier: {
    label: 'FORNECEDORES',
    emoji: '🟡',
    color: 'text-yellow-400',
    bg: 'bg-yellow-500/10',
    border: 'border-yellow-500/30',
    badgeBg: 'bg-yellow-500/20',
    dotBg: 'bg-yellow-400',
    icon: Truck,
  },
  alert: {
    label: 'ALERTAS',
    emoji: '🔴',
    color: 'text-red-400',
    bg: 'bg-red-500/10',
    border: 'border-red-500/30',
    badgeBg: 'bg-red-500/20',
    dotBg: 'bg-red-400',
    icon: AlertTriangle,
  },
} as const;

type CategoryKey = keyof typeof categoryConfig;

export function LiveTerminal() {
  const [messages, setMessages] = useState<TerminalMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategories, setActiveCategories] = useState<Set<CategoryKey>>(
    new Set(['guest', 'employee', 'supplier', 'alert'])
  );
  const [messageCount, setMessageCount] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);
  const prevCountRef = useRef(0);

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const res = await fetch('/api/terminal');
        const data: TerminalMessage[] = await res.json();
        setMessages(data);
        setMessageCount(data.length);
        setLoading(false);
      } catch {
        setLoading(false);
      }
    };
    fetchMessages();
    const interval = setInterval(fetchMessages, 8000);
    return () => clearInterval(interval);
  }, []);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (scrollRef.current && messages.length > 0) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages.length]);

  const filteredMessages = useMemo(() => {
    return messages.filter(m => activeCategories.has(m.category as CategoryKey));
  }, [messages, activeCategories]);

  const categoryCounts = useMemo(() => {
    const counts: Record<CategoryKey, number> = { guest: 0, employee: 0, supplier: 0, alert: 0 };
    messages.forEach(m => {
      if (m.category in counts) {
        counts[m.category as CategoryKey]++;
      }
    });
    return counts;
  }, [messages]);

  const toggleCategory = (cat: CategoryKey) => {
    setActiveCategories(prev => {
      const next = new Set(prev);
      if (next.has(cat)) {
        if (next.size > 1) next.delete(cat);
      } else {
        next.add(cat);
      }
      return next;
    });
  };

  const formatTimestamp = (ts: string) => {
    return new Date(ts).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };

  return (
    <div className="glass-strong rounded-xl overflow-hidden flex flex-col h-full min-h-[500px]">
      {/* Terminal header chrome */}
      <div className="flex items-center gap-2 px-4 py-3 border-b border-[#2e2e2e] shrink-0">
        {/* macOS window dots */}
        <div className="flex gap-1.5">
          <div className="w-3 h-3 rounded-full bg-red-500/70 hover:bg-red-500 transition-colors" />
          <div className="w-3 h-3 rounded-full bg-amber-500/70 hover:bg-amber-500 transition-colors" />
          <div className="w-3 h-3 rounded-full bg-orange-500/70 hover:bg-orange-500 transition-colors" />
        </div>

        {/* Terminal title */}
        <span className="text-xs font-mono text-[#4d4d4d] ml-2 hidden sm:inline">
          zehla-ops [REG: 0001/PRO/SC] — terminal de operações
        </span>

        {/* LIVE indicator */}
        <div className="ml-auto flex items-center gap-2">
          <span className="text-[10px] font-mono text-[#363636] hidden sm:inline">{filteredMessages.length} mensagens</span>
          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-[#FF5500]/10 border border-orange-500/20">
            <span className="relative flex h-2 w-2">
              <span className="animate-zehla-ping absolute inline-flex h-full w-full rounded-full bg-[#FF5500] opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#FF5500]" />
            </span>
            <span className="text-[10px] font-bold text-[#FF5500] tracking-wider">AO VIVO</span>
          </div>
        </div>
      </div>

      {/* Category filter bar */}
      <div className="flex items-center gap-2 px-4 py-2 border-b border-[#2e2e2e] overflow-x-auto zehla-scroll-x shrink-0">
        <MessageSquare className="w-3.5 h-3.5 text-[#363636] shrink-0" />
        {(Object.keys(categoryConfig) as CategoryKey[]).map(cat => {
          const cfg = categoryConfig[cat];
          const isActive = activeCategories.has(cat);
          const count = categoryCounts[cat];
          return (
            <button
              key={cat}
              onClick={() => toggleCategory(cat)}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-medium transition-all whitespace-nowrap border shrink-0 ${
                isActive
                  ? `${cfg.bg} ${cfg.color} ${cfg.border}`
                  : 'bg-transparent text-[#363636] border-transparent hover:text-[#898989]'
              }`}
            >
              <span className="text-xs">{cfg.emoji}</span>
              <span className="hidden sm:inline">{cfg.label}</span>
              <span className={`px-1.5 py-0.5 rounded-md text-[9px] font-bold ${
                isActive ? cfg.badgeBg : 'bg-[#242424]'
              }`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Terminal body — message stream */}
      <div
        ref={scrollRef}
        className="flex-1 p-4 overflow-y-auto zehla-scroll terminal-text min-h-0"
      >
        {loading ? (
          <div className="space-y-2">
            {Array.from({ length: 12 }).map((_, i) => (
              <Skeleton key={i} className="h-4 w-full" />
            ))}
          </div>
        ) : filteredMessages.length === 0 ? (
          <div className="flex items-center justify-center h-full text-[#363636] text-sm">
            Nenhuma mensagem nesta categoria
          </div>
        ) : (
          <AnimatePresence mode="popLayout">
            {filteredMessages.map((msg) => {
              const cfg = categoryConfig[msg.category as CategoryKey];
              return (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 8, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ duration: 0.25, ease: 'easeOut' }}
                  className="flex gap-3 mb-2.5 group hover:bg-white/[0.02] rounded-lg px-2 py-1 -mx-2 transition-colors"
                >
                  {/* Timestamp */}
                  <span className="text-[#363636] text-xs whitespace-nowrap pt-0.5 font-mono">
                    {formatTimestamp(msg.timestamp)}
                  </span>

                  {/* Category badge */}
                  <span className={`flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[9px] font-bold whitespace-nowrap shrink-0 ${cfg.badgeBg} ${cfg.color}`}>
                    <span className="text-[8px]">{cfg.emoji}</span>
                    <span className="hidden md:inline">{cfg.label}</span>
                  </span>

                  {/* Message content */}
                  <span className={`text-xs leading-relaxed ${cfg.color} break-all`}>
                    {msg.content}
                  </span>
                </motion.div>
              );
            })}
          </AnimatePresence>
        )}

        {/* Blinking cursor */}
        {!loading && filteredMessages.length > 0 && (
          <div className="flex items-center gap-2 mt-1">
            <span className="text-[#363636] text-xs font-mono">{'>'}</span>
            <span className="animate-terminal-blink text-[#FF5500] text-sm">█</span>
          </div>
        )}
      </div>

      {/* Terminal footer — status bar */}
      <div className="flex items-center justify-between px-4 py-2 border-t border-[#2e2e2e] text-[10px] text-[#363636] font-mono shrink-0">
        <div className="flex items-center gap-3">
          <span>{categoryCounts.guest + categoryCounts.employee} mensagens hoje</span>
          <span>•</span>
          <span>{categoryCounts.alert} alerta{categoryCounts.alert !== 1 ? 's' : ''}</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-orange-500/50">polling: 8s</span>
          <span>•</span>
          <span>ZEHLA Brain v3.2</span>
        </div>
      </div>
    </div>
  );
}
