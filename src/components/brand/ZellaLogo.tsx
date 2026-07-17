'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';

interface ZellaLogoProps {
  /** Height of the logo image in pixels */
  size?: number;
  className?: string;
}

/**
 * ZellaLogo — animated wrapper around the header logo PNG.
 * Uses a gentle entrance + subtle floating breath loop.
 */
export function ZellaLogo({ size = 36, className = '' }: ZellaLogoProps) {
  return (
    <motion.div
      className={className}
      style={{ height: size, width: 'auto' }}
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
    >
      <Image
        src="/SeuZella_site_Logo_01.png"
        alt="Seu Zélla — Zelador Digital Inteligente"
        width={0}
        height={0}
        sizes="(max-width: 768px) 120px, 170px"
        style={{ height: '100%', width: 'auto', objectFit: 'contain' }}
        draggable={false}
        priority
      />
    </motion.div>
  );
}

/** Static version for the footer (no loop animation) */
export function ZellaLogoStatic({ size = 56, className = '' }: ZellaLogoProps) {
  return (
    <motion.div
      className={className}
      style={{ height: size, width: 'auto' }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
    >
      <Image
        src="/SeuZella_site_Logo_02.png"
        alt="Seu Zélla — Zelador Digital Inteligente"
        width={0}
        height={0}
        sizes="56px"
        style={{ height: '100%', width: 'auto', objectFit: 'contain' }}
        draggable={false}
      />
    </motion.div>
  );
}
