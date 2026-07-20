'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNiche } from '@/contexts/NicheContext';

interface DynamicHeroTextProps {
  className?: string;
}

export function DynamicHeroText({ className }: DynamicHeroTextProps) {
  const { niche, isPousada, isAirbnb } = useNiche();

  // Niche-specific rotating phrases to avoid cross-contamination
  const phrases = isPousada
    ? ['pelo WhatsApp.', 'a sua pousada.']
    : isAirbnb
    ? ['pelo WhatsApp.', 'o seu imóvel.']
    : ['pelo WhatsApp.', 'seu negócio.'];

  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    setCurrentIndex(0);
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % phrases.length);
    }, 2500);

    return () => clearInterval(interval);
  }, [phrases.length, niche]);

  return (
    <h1
      className={`text-5xl sm:text-6xl lg:text-7xl font-satoshi font-bold tracking-tight leading-[1.1] text-white mb-6 ${
        className ?? ''
      }`}
    >
      <span className="whitespace-nowrap">O Zélla atende, vende e</span>
      <br />
      <span className="whitespace-nowrap inline-flex items-baseline">
        <span>reserva </span>
        <span className="inline-block overflow-hidden relative" style={{ verticalAlign: 'baseline' }}>
          <AnimatePresence mode="wait">
            <motion.span
              key={phrases[currentIndex]}
              className="text-blue-500 font-bold inline-block whitespace-nowrap"
              initial={{ y: '110%', opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: '-110%', opacity: 0 }}
              transition={{
                duration: 0.5,
                ease: [0.25, 0.46, 0.45, 0.94],
              }}
            >
              {phrases[currentIndex]}
            </motion.span>
          </AnimatePresence>
        </span>
      </span>
    </h1>
  );
}
