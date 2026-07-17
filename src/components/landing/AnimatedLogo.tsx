'use client';

import { motion } from 'framer-motion';

interface AnimatedLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
  animate?: boolean;
}

const SIZE_MAP = {
  sm: { mark: 28, text: 15, gap: 6 },
  md: { mark: 36, text: 19, gap: 8 },
  lg: { mark: 44, text: 24, gap: 10 },
};

export function AnimatedLogo({
  className,
  size = 'md',
  showText = true,
  animate = true,
}: AnimatedLogoProps) {
  const s = SIZE_MAP[size];

  // Static version for when animate=false
  if (!animate) {
    return (
      <div className={`inline-flex items-center ${className ?? ''}`} style={{ gap: s.gap }}>
        <svg
          width={s.mark}
          height={s.mark}
          viewBox="0 0 30 30"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <path d="M6.16 7.1h9.31l-1.3 1.85c-.2.29-.54.47-.9.47H6.16V7.1Z" fill="white" />
          <polygon points="24.3,7.1 13.14,22.91 5.7,22.91 16.86,7.1" fill="white" />
          <path d="M14.53 22.91h9.29v2.33h-9.29l1.31-1.86c.2-.29.54-.47.9-.47h-7.09v2.33h-2Z" fill="white" />
        </svg>
        {showText && (
          <span className="text-white font-semibold tracking-tight" style={{ fontSize: s.text }}>
            Seu Zélla
          </span>
        )}
      </div>
    );
  }

  // Animated version — sequence: bubble springs → typing dots → diagonal draws → text fades → 3s hold → loop
  return (
    <div className={`inline-flex items-center ${className ?? ''}`} style={{ gap: s.gap }}>
      <motion.svg
        width={s.mark}
        height={s.mark}
        viewBox="0 0 30 30"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        {/* ── Top-left chat bubble ── */}
        <motion.path
          d="M6.16 7.1h9.31l-1.3 1.85c-.2.29-.54.47-.9.47H6.16V7.1Z"
          fill="white"
          initial={{ scale: 0, opacity: 0 }}
          animate={{
            scale: [0, 1.18, 0.94, 1.02, 1],
            opacity: [0, 1, 1, 1, 1],
          }}
          transition={{
            duration: 0.8,
            ease: [0.34, 1.56, 0.64, 1],
            times: [0, 0.4, 0.65, 0.85, 1],
          }}
          style={{ originX: '7px', originY: '8px' }}
        />

        {/* ── Bottom-right chat bubble (slight delay) ── */}
        <motion.path
          d="M14.53 22.91h9.29v2.33h-9.29l1.31-1.86c.2-.29.54-.47.9-.47h-7.09v2.33h-2Z"
          fill="white"
          initial={{ scale: 0, opacity: 0 }}
          animate={{
            scale: [0, 1.18, 0.94, 1.02, 1],
            opacity: [0, 1, 1, 1, 1],
          }}
          transition={{
            duration: 0.8,
            delay: 0.15,
            ease: [0.34, 1.56, 0.64, 1],
            times: [0, 0.4, 0.65, 0.85, 1],
          }}
          style={{ originX: '23px', originY: '24px' }}
        />

        {/* ── Typing dots — top bubble ── */}
        {[0, 1, 2].map((i) => (
          <motion.circle
            key={`td${i}`}
            cx={8.5 + i * 2}
            cy={8.2}
            r={0.55}
            fill="white"
            initial={{ opacity: 0, scale: 0 }}
            animate={{
              opacity: [0, 0, 1, 1, 0],
              scale: [0, 0, 1, 1, 0],
            }}
            transition={{
              duration: 0.7,
              delay: 0.8 + i * 0.12,
              ease: 'easeInOut',
              times: [0, 0.1, 0.3, 0.7, 1],
            }}
          />
        ))}

        {/* ── Typing dots — bottom bubble ── */}
        {[0, 1, 2].map((i) => (
          <motion.circle
            key={`bd${i}`}
            cx={18.5 + i * 2}
            cy={23.8}
            r={0.55}
            fill="white"
            initial={{ opacity: 0, scale: 0 }}
            animate={{
              opacity: [0, 0, 1, 1, 0],
              scale: [0, 0, 1, 1, 0],
            }}
            transition={{
              duration: 0.7,
              delay: 0.9 + i * 0.12,
              ease: 'easeInOut',
              times: [0, 0.1, 0.3, 0.7, 1],
            }}
          />
        ))}

        {/* ── Diagonal stroke (Z center) — draws itself ── */}
        <motion.polygon
          points="24.3,7.1 13.14,22.91 5.7,22.91 16.86,7.1"
          fill="white"
          initial={{ opacity: 0, pathLength: 0 }}
          animate={{
            opacity: [0, 0, 1],
            pathLength: [0, 0, 1],
          }}
          transition={{
            duration: 1.2,
            delay: 1.3,
            ease: [0.25, 0.46, 0.45, 0.94],
            times: [0, 0.1, 1],
            pathLength: {
              duration: 0.7,
              delay: 1.5,
              ease: [0.25, 0.46, 0.45, 0.94],
            },
          }}
        />
      </motion.svg>

      {/* ── Text "Seu Zélla" — fade + slide ── */}
      {showText && (
        <motion.span
          className="text-white font-semibold tracking-tight"
          style={{ fontSize: s.text }}
          initial={{ opacity: 0, x: -6 }}
          animate={{
            opacity: [0, 0, 1],
            x: [-6, -6, 0],
          }}
          transition={{
            duration: 0.8,
            delay: 2.2,
            ease: [0.25, 0.46, 0.45, 0.94],
            times: [0, 0.2, 1],
          }}
        >
          Seu Zélla
        </motion.span>
      )}
    </div>
  );
}
