import { Brain, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';


'use client';


interface SalesHeroProps {
  badge: string;
  title: string;
  subtitle: string;
  ctaText: string;
  onCtaClick: () => void;
}

export const SalesHero = ({ badge, title, subtitle, ctaText, onCtaClick }: SalesHeroProps) => {
  return (
    <section className="relative pt-32 pb-20 overflow-hidden bg-black">
      {/* Background Orbs */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-orange-500/10 rounded-full blur-[120px] animate-pulse" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-[120px]" />

      <div className="max-w-6xl mx-auto px-4 relative z-10 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-500 text-xs font-semibold mb-6"
        >
          <Brain className="w-3 h-3" />
          {badge}
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-4xl md:text-6xl font-bold text-white mb-6 leading-tight"
        >
          {title.split(' ').map((word, i) => (
            <span key={i} className={word.toLowerCase().includes('zehla') || word.toLowerCase().includes('lucro') ? 'text-orange-500' : ''}>
              {word}{' '}
            </span>
          ))}
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-lg text-neutral-400 max-w-2xl mx-auto mb-10 leading-relaxed"
        >
          {subtitle}
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <button
            onClick={onCtaClick}
            className="w-full sm:w-auto px-8 py-4 bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-bold transition-all transform hover:scale-105 flex items-center justify-center gap-2 shadow-lg shadow-orange-500/20"
          >
            {ctaText}
            <ArrowRight className="w-5 h-5" />
          </button>
        </motion.div>
      </div>
    </section>
  );
};
