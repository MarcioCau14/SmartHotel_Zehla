'use client';

import { useState, useEffect, useRef } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { ChevronUp, ChevronDown, X } from 'lucide-react';
import type { TerminalMessage } from '@/lib/store';

const categoryFilters = [
  { key: 'all', label: 'Todos', color: 'bg-neutral-500/20 text-[#b4b4b4] border-neutral-500/30' },
  { key: 'guest', label: 'Hóspedes', color: 'bg-[#FF5500]/10 text-[#FF5500] border-[#FF5500]/30' },
  { key: 'employee', label: 'Colaboradores', color: 'bg-blue-500/20 text-blue-400 border-blue-500/30' },
  { key: 'supplier', label: 'Fornecedores', color: 'bg-[#FF5500]/10 text-[#FF5500] border-[#FF5500]/30' },
  { key: 'alert', label: 'Alertas', color: 'bg-red-500/20 text-red-400 border-red-500/30' },
] as const;

type CategoryFilter = (typeof categoryFilters)[number]['key'];

export function TerminalPanel() {
  const [messages, setMessages] = useState<TerminalMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(false);
  const [activeFilter, setActiveFilter] = useState<CategoryFilter>('all');
  const scrollRef = useRef<HTMLDivElement>(null);
  const expandedScrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const res = await fetch('/api/terminal');
        const data = await res.json();
        setMessages(data);
      } catch {
        // silent
      } finally {
        setLoading(false);
      }
    };
    fetchMessages();
    const interval = setInterval(fetchMessages, 10000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (expanded && expandedScrollRef.current) {
      expandedScrollRef.current.scrollTop = expandedScrollRef.current.scrollHeight;
    }
  }, [messages, expanded]);

  const filteredMessages = activeFilter === 'all'
    ? messages
    : messages.filter(m => m.category === activeFilter);

  const latestThree = filteredMessages.slice(-3);

  const colorMap: Record<string, string> = {
    green: 'text-[#FF5500]',
    purple: 'text-[#FF5500]',
    yellow: 'text-[#FF5500]',
    red: 'text-red-400',
  };

  const sourceMap: Record<string, string> = {
    ZEHLA_BRAIN: 'text-orange-500',
    GUARDIAN: 'text-purple-500',
    FLEET: 'text-amber-500',
    ZDR: 'text-red-500',
  };

  const renderMessage = (msg: TerminalMessage) => (
    <div key={msg.id} className="flex gap-2 mb-1">
      <span className="text-[#363636] text-[10px] whitespace-nowrap pt-0.5">
        {new Date(msg.timestamp).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
      </span>
      <span className={`text-[10px] font-semibold whitespace-nowrap ${sourceMap[msg.source]}`}>
        [{msg.source}]
      </span>
      <span className={`text-[10px] leading-relaxed ${colorMap[msg.color]} break-all`}>
        {msg.content}
      </span>
    </div>
  );

  return (
    <div className="space-y-3">
      {/* Compact Bar (default view) */}
      {!expanded && (
        <div
          className="glass-strong rounded-xl overflow-hidden cursor-pointer"
          onClick={() => setExpanded(true)}
        >
          <div className="flex items-center gap-2 px-4 py-2 border-b border-[#2e2e2e]">
            <div className="flex gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-red-500/70" />
              <div className="w-2.5 h-2.5 rounded-full bg-amber-500/70" />
              <div className="w-2.5 h-2.5 rounded-full bg-orange-500/70" />
            </div>
            <span className="text-[10px] font-mono text-[#4d4d4d] ml-1">zehla-terminal — live</span>
            <span className="ml-auto text-[10px] font-mono text-[#FF5500] animate-zehla-pulse">● LIVE</span>
          </div>
          <div className="p-3 terminal-text">
            {loading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-3 w-full mb-1" />
              ))
            ) : (
              latestThree.map(renderMessage)
            )}
          </div>
          <div className="flex items-center justify-center py-1.5 border-t border-[#2e2e2e] hover:bg-white/[0.02] transition-colors">
            <ChevronUp className="w-3.5 h-3.5 text-[#4d4d4d]" />
            <span className="text-[10px] text-[#4d4d4d] ml-1">Expandir terminal</span>
          </div>
        </div>
      )}

      {/* Expanded Panel */}
      {expanded && (
        <div className="glass-strong rounded-xl overflow-hidden">
          {/* Terminal header */}
          <div className="flex items-center gap-2 px-4 py-3 border-b border-[#2e2e2e]">
            <div className="flex gap-1.5">
              <div className="w-3 h-3 rounded-full bg-red-500/70" />
              <div className="w-3 h-3 rounded-full bg-amber-500/70" />
              <div className="w-3 h-3 rounded-full bg-orange-500/70" />
            </div>
            <span className="text-xs font-mono text-[#4d4d4d] ml-2">zehla-terminal — live stream</span>
            <span className="ml-auto text-xs font-mono text-[#FF5500] animate-zehla-pulse">● LIVE</span>
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center gap-2 px-4 py-2 border-b border-[#2e2e2e] overflow-x-auto zehla-scroll-x shrink-0">
            {categoryFilters.map((filter) => (
              <button
                key={filter.key}
                onClick={() => setActiveFilter(filter.key)}
                className={`text-[10px] px-2.5 py-1 rounded-full border whitespace-nowrap transition-all font-medium ${
                  activeFilter === filter.key
                    ? filter.color
                    : 'bg-transparent text-[#363636] border-[#2e2e2e] hover:border-white/20 hover:text-[#898989]'
                }`}
              >
                {filter.label}
                {activeFilter !== filter.key && filter.key !== 'all' && (
                  <X className="w-2.5 h-2.5 ml-1 inline opacity-50" />
                )}
              </button>
            ))}
            <span className="ml-auto text-[10px] text-[#363636] font-mono">
              {filteredMessages.length} mensagens
            </span>
          </div>

          {/* Terminal body - expanded */}
          <div ref={expandedScrollRef} className="p-4 max-h-[50vh] overflow-y-auto zehla-scroll terminal-text">
            {loading ? (
              Array.from({ length: 15 }).map((_, i) => (
                <Skeleton key={i} className="h-4 w-full mb-2" />
              ))
            ) : (
              filteredMessages.map(renderMessage)
            )}
            <span className="animate-terminal-blink text-[#FF5500] text-sm">█</span>
          </div>

          {/* Collapse button */}
          <div
            className="flex items-center justify-center py-2 border-t border-[#2e2e2e] hover:bg-white/[0.02] transition-colors cursor-pointer"
            onClick={() => setExpanded(false)}
          >
            <ChevronDown className="w-3.5 h-3.5 text-[#4d4d4d]" />
            <span className="text-[10px] text-[#4d4d4d] ml-1">Recolher terminal</span>
          </div>
        </div>
      )}
    </div>
  );
}
