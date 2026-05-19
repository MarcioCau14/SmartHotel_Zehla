import { Brain, ChevronDown, Command } from 'lucide-react';


'use client';


interface TopNavProps {
  selectedProperty: string;
  onPropertyChange: (id: string) => void;
  onOpenZCC: () => void;
}

const properties = [
  { id: 'all', name: 'Todas Propriedades' },
  { id: 'prop-1', name: 'Pousada Maravilha — Noronha' },
  { id: 'prop-2', name: 'Pousada Vila Floripa' },
  { id: 'prop-3', name: 'Pousada do Ouro — Paraty' },
  { id: 'prop-4', name: 'Pousada Chapada dos Veadeiros' },
  { id: 'prop-5', name: 'Pousada Bela Jeri' },
  { id: 'prop-6', name: 'Pousada Serrana — Gramado' },
];

export function TopNav(: void { selectedProperty, onPropertyChange, onOpenZCC }: TopNavProps) {
  try {
  const current = properties.find(p => p.id === selectedProperty) || properties[0];

  return (
    <div className="glass-strong border-b border-[#2e2e2e] px-4 py-3 flex items-center justify-between gap-4">
      <div className="flex items-center gap-4">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <Brain className="w-6 h-6 text-[#FF5500]" />
          <span className="font-bold text-lg text-[#fafafa]">ZEHLA</span>
        </div>

        {/* Property Selector */}
        <div className="relative">
          <select
            value={selectedProperty}
            onChange={(e) => onPropertyChange(e.target.value)}
            className="bg-[#242424] border border-[#363636] rounded-lg px-3 py-1.5 text-xs text-[#b4b4b4] pr-7 appearance-none cursor-pointer hover:bg-[#2e2e2e] transition-colors max-w-[200px] sm:max-w-none"
          >
            {properties.map(p => (
              <option key={p.id} value={p.id} className="bg-neutral-900">{p.name}</option>
            ))}
          </select>
          <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-[#4d4d4d] pointer-events-none" />
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={onOpenZCC}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#FF5500]/10 border border-purple-500/20 text-[#FF5500] text-xs hover:bg-purple-500/20 transition-colors"
        >
          <Command className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">ZCC</span>
        </button>
      </div>
    </div>
  );
}
