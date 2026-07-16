'use client';

import { motion } from 'framer-motion';

interface ZellaLogoProps {
  /** Height of the logo image in pixels */
  size?: number;
  className?: string;
}

/**
 * ZellaLogo — animated wrapper around the existing logo PNG.
 * Uses a gentle entrance + subtle floating breath loop.
 * No SVG duplication — the PNG already contains the full logo.
 */
export function ZellaLogo({ size = 32, className = '' }: ZellaLogoProps) {
  return (
    <motion.img
      src="/logo-zella-b01.png"
      alt="Seu Zélla — Zelador Digital Inteligente"
      className={className}
      style={{ height: size, width: 'auto', objectFit: 'contain' }}
      draggable={false}
      // Entrance animation
      initial={{ opacity: 0, scale: 0.92, filter: 'blur(4px)' }}
      animate={{
        opacity: 1,
        scale: [1, 1.03, 1],
        filter: 'blur(0px)',
      }}
      transition={{
        opacity: { duration: 0.5, ease: 'easeOut' },
        filter: { duration: 0.5, ease: 'easeOut' },
        scale: {
          duration: 3.5,
          repeat: Infinity,
          repeatType: 'loop',
          ease: 'easeInOut',
          times: [0, 0.5, 1],
        },
      }}
    />
  );
}

/** Static version for the footer (no loop animation) */
export function ZellaLogoStatic({ size = 40, className = '' }: ZellaLogoProps) {
  return (
    <motion.img
      src="/logo-zella-b02.png"
      alt="Seu Zélla — Zelador Digital Inteligente"
      className={className}
      style={{ height: size, width: 'auto', objectFit: 'contain' }}
      draggable={false}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
    />
  );
}
