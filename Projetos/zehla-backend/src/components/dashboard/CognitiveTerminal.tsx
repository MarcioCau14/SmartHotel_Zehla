'use client';

import { useState, useRef, useEffect } from 'react';
import { Search, Command, ArrowRight, Brain } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';

interface Suggestion {
  label: string;
  description: string;
  href?: string;
  action?: string;
  icon?: string;
}

const suggestions: Suggestion[] = [
  { label: 'Ir para Painel', description: 'Visão geral da operação', href: '/dashboard/painel', icon: 'dashboard' },
  { label: 'Nova Reserva', description: 'Registrar uma nova reserva manualmente', href: '/dashboard/reservas', icon: 'calendar' },
  { label: 'Mapa de Quartos', description: 'Ver status de ocupação', href: '/dashboard/quartos', icon: 'bed' },
  { label: 'Relatório Financeiro', description: 'Receitas, despesas e métricas', href: '/dashboard/financeiro', icon: 'wallet' },
  { label: 'Criar Promoção', description: 'Disparar campanha para hóspedes', href: '/dashboard/promocoes', icon: 'tag' },
  { label: 'Configurar IA', description: 'Ajustar comportamento dos agentes', href: '/dashboard/configuracoes', icon: 'settings' },
  { label: 'Fazer Upgrade', description: 'Conhecer planos PRO e MAX', href: '/dashboard/upgrade', icon: 'upgrade' },
];

const iconMap: Record<string, React.ReactNode> = {
  dashboard: <Brain className="w-4 h-4" />,
  calendar: <ArrowRight className="w-4 h-4" />,
  bed: <ArrowRight className="w-4 h-4" />,
  wallet: <ArrowRight className="w-4 h-4" />,
  tag: <ArrowRight className="w-4 h-4" />,
  settings: <ArrowRight className="w-4 h-4" />,
  upgrade: <ArrowRight className="w-4 h-4" />,
};

export function CognitiveTerminal({ placeholder = "Ex: Mude o preço dos quartos Deluxe para R$ 300" }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const filtered = query.trim()
    ? suggestions.filter(
        (s) =>
          s.label.toLowerCase().includes(query.toLowerCase()) ||
          s.description.toLowerCase().includes(query.toLowerCase())
      )
    : suggestions;

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 50);
      setSelectedIndex(0);
    }
  }, [open]);

  const handleSelect = (suggestion: Suggestion) => {
    setOpen(false);
    setQuery('');
    if (suggestion.href) {
      router.push(suggestion.href);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev < filtered.length - 1 ? prev + 1 : 0));
    }
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : filtered.length - 1));
    }
    if (e.key === 'Enter' && filtered[selectedIndex]) {
      handleSelect(filtered[selectedIndex]);
    }
  };

  return (
    <>
      {/* Trigger button */}
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all text-sm text-neutral-500 w-full max-w-md group"
      >
        <Search className="w-4 h-4 text-neutral-600 group-hover:text-neutral-400" />
        <span className="flex-1 text-left text-xs text-neutral-600">{placeholder}</span>
        <kbd className="hidden md:inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-white/5 border border-white/10 text-[10px] text-neutral-600 font-mono">
          <Command className="w-2.5 h-2.5" />K
        </kbd>
      </button>

      {/* Modal */}
      {open && (
        <div
          className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh]"
          onClick={() => setOpen(false)}
        >
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />
          <div
            className="relative w-full max-w-lg mx-4 bg-neutral-900 border border-white/10 rounded-2xl shadow-2xl shadow-black/50 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Input */}
            <div className="flex items-center gap-3 px-4 py-3 border-b border-white/5">
              <Search className="w-4 h-4 text-neutral-500 shrink-0" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={placeholder}
                className="flex-1 bg-transparent text-sm text-neutral-200 placeholder-neutral-600 outline-none"
              />
              <kbd className="hidden md:inline-flex items-center px-1.5 py-0.5 rounded-md bg-white/5 border border-white/10 text-[10px] text-neutral-600 font-mono">
                ESC
              </kbd>
            </div>

            {/* Results */}
            <div className="max-h-80 overflow-y-auto py-2">
              {filtered.length === 0 ? (
                <div className="px-4 py-8 text-center text-sm text-neutral-600">
                  Nenhum resultado para <span className="text-neutral-400 font-mono">&quot;{query}&quot;</span>
                </div>
              ) : (
                filtered.map((suggestion, index) => (
                  <button
                    key={suggestion.label}
                    onClick={() => handleSelect(suggestion)}
                    className={cn(
                      'flex items-center gap-3 w-full px-4 py-2.5 text-left transition-colors',
                      index === selectedIndex
                        ? 'bg-orange-500/10 text-orange-400'
                        : 'text-neutral-400 hover:bg-white/5'
                    )}
                  >
                    <div className={cn(
                      'w-7 h-7 rounded-lg flex items-center justify-center shrink-0',
                      index === selectedIndex ? 'bg-orange-500/20' : 'bg-white/5'
                    )}>
                      {iconMap[suggestion.icon || ''] || <ArrowRight className="w-3.5 h-3.5" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{suggestion.label}</p>
                      <p className="text-[10px] text-neutral-600 truncate">{suggestion.description}</p>
                    </div>
                    <ArrowRight className={cn(
                      'w-4 h-4 shrink-0',
                      index === selectedIndex ? 'text-orange-500' : 'text-neutral-700'
                    )} />
                  </button>
                ))
              )}
            </div>

            {/* Footer hint */}
            <div className="px-4 py-2 border-t border-white/5 flex items-center gap-4 text-[10px] text-neutral-700">
              <span>↑↓ Navegar</span>
              <span>↵ Selecionar</span>
              <span className="ml-auto">ESC Fechar</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
