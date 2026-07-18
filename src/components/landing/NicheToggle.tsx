'use client';

import { motion } from 'framer-motion';
import { Building2, Key, Crown } from 'lucide-react';
import type { NicheType } from '@/contexts/NicheContext';

interface NicheToggleProps {
  niche: NicheType;
  onNicheChange: (niche: NicheType) => void;
}

const options: { value: NicheType; label: string; icon: typeof Building2 }[] = [
  { value: 'pousadas', label: 'Para Pousadas', icon: Building2 },
  { value: 'anfitrioes', label: 'Para Anfitriões', icon: Key },
  { value: 'parceiro', label: 'Seja Parceiro Zélla', icon: Crown },
];

function getActiveStyle(value: NicheType) {
  switch (value) {
    case 'pousadas':
      return {
        background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.25), rgba(16, 185, 129, 0.12))',
        border: '1px solid rgba(16, 185, 129, 0.3)',
      };
    case 'anfitrioes':
      return {
        background: 'linear-gradient(135deg, rgba(65, 105, 225, 0.25), rgba(65, 105, 225, 0.12))',
        border: '1px solid rgba(65, 105, 225, 0.3)',
      };
    case 'parceiro':
      return {
        background: 'linear-gradient(135deg, rgba(217, 165, 32, 0.25), rgba(217, 165, 32, 0.12))',
        border: '1px solid rgba(217, 165, 32, 0.35)',
      };
  }
}

export function NicheToggle({ niche, onNicheChange }: NicheToggleProps) {
  return (
    <div className="relative inline-flex flex-col sm:flex-row items-center bg-white/[0.04] border border-white/[0.08] rounded-2xl p-2 gap-1.5 sm:gap-1">
      {options.map((option) => {
        const Icon = option.icon;
        const isActive = niche === option.value;
        return (
          <motion.button
            key={option.value}
            onClick={() => onNicheChange(option.value)}
            className={`
              relative z-10 flex items-center gap-2.5 px-5 sm:px-7 py-3.5 sm:py-4
              rounded-xl font-bold text-sm sm:text-base transition-colors duration-300 cursor-pointer
              whitespace-nowrap
              ${isActive
                ? 'text-white'
                : 'text-neutral-400 hover:text-neutral-200'
              }
            `}
          >
            {/* Active background pill */}
            {isActive && (
              <motion.div
                layoutId="niche-toggle-pill"
                className="absolute inset-0 rounded-xl"
                style={getActiveStyle(option.value)}
                transition={{
                  type: 'spring',
                  stiffness: 400,
                  damping: 30,
                }}
              />
            )}
            <Icon className={`w-4 h-4 sm:w-5 sm:h-5 relative z-10 ${option.value === 'parceiro' ? 'text-amber-400' : ''}`} />
            <span className="relative z-10">{option.label}</span>
          </motion.button>
        );
      })}
    </div>
  );
}
