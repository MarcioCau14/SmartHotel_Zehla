'use client';

import { motion } from 'framer-motion';
import { Building2, Key } from 'lucide-react';
import type { NicheType } from '@/contexts/NicheContext';

interface NicheToggleProps {
  niche: NicheType;
  onNicheChange: (niche: NicheType) => void;
}

const options: { value: NicheType; label: string; icon: typeof Building2 }[] = [
  { value: 'pousadas', label: 'Para Pousadas', icon: Building2 },
  { value: 'anfitrioes', label: 'Para Anfitriões', icon: Key },
];

export function NicheToggle({ niche, onNicheChange }: NicheToggleProps) {
  return (
    <div className="relative inline-flex items-center bg-white/[0.04] border border-white/[0.08] rounded-2xl p-1.5 gap-1">
      {/* Animated background slider */}
      {options.map((option) => (
        <motion.button
          key={option.value}
          onClick={() => onNicheChange(option.value)}
          className={`
            relative z-10 flex items-center gap-2.5 px-5 sm:px-7 py-3 sm:py-3.5
            rounded-xl font-bold text-sm sm:text-base transition-colors duration-300 cursor-pointer
            ${niche === option.value
              ? 'text-white'
              : 'text-neutral-400 hover:text-neutral-200'
            }
          `}
        >
          {/* Active background pill */}
          {niche === option.value && (
            <motion.div
              layoutId="niche-toggle-pill"
              className="absolute inset-0 rounded-xl"
              style={{
                background: option.value === 'pousadas'
                  ? 'linear-gradient(135deg, rgba(16, 185, 129, 0.25), rgba(16, 185, 129, 0.12))'
                  : 'linear-gradient(135deg, rgba(65, 105, 225, 0.25), rgba(65, 105, 225, 0.12))',
                border: option.value === 'pousadas'
                  ? '1px solid rgba(16, 185, 129, 0.3)'
                  : '1px solid rgba(65, 105, 225, 0.3)',
              }}
              transition={{
                type: 'spring',
                stiffness: 400,
                damping: 30,
              }}
            />
          )}
          <option.icon className="w-4 h-4 sm:w-5 sm:h-5 relative z-10" />
          <span className="relative z-10">{option.label}</span>
        </motion.button>
      ))}
    </div>
  );
}
