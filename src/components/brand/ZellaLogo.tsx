'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

type Phase =
  | 'hidden'
  | 'balloons'
  | 'typing'
  | 'zform'
  | 'static'
  | 'fadeout';

interface ZellaLogoProps {
  /** Height of the icon in pixels (wordmark scales proportionally) */
  size?: number;
  /** Show the wordmark next to the icon */
  showWordmark?: boolean;
  /** If true, skip intro animation and hold final state */
  staticOnly?: boolean;
  className?: string;
}

const CYCLE_MS = {
  hidden: 400,
  balloons: 900,
  typing: 900,
  zform: 700,
  static: 3200,
  fadeout: 600,
};

const PHASES: Phase[] = [
  'hidden',
  'balloons',
  'typing',
  'zform',
  'static',
  'fadeout',
];

function useAnimationPhase(enabled: boolean) {
  const [phase, setPhase] = useState<Phase>('hidden');

  useEffect(() => {
    if (!enabled) {
      setPhase('static');
      return;
    }

    let timeout: NodeJS.Timeout;
    let phaseIdx = 0;

    function advance() {
      phaseIdx = (phaseIdx + 1) % PHASES.length;
      const next = PHASES[phaseIdx];
      setPhase(next);
      timeout = setTimeout(advance, CYCLE_MS[next]);
    }

    timeout = setTimeout(advance, CYCLE_MS['hidden']);

    return () => clearTimeout(timeout);
  }, [enabled]);

  return phase;
}

/** Tiny animated dots that simulate "typing" inside a balloon */
function TypingDots({ delay = 0 }: { delay?: number }) {
  return (
    <g>
      {[0, 1, 2].map((i) => (
        <motion.circle
          key={i}
          cx={4 + i * 3.5}
          cy={0}
          r={1.1}
          fill="white"
          initial={{ opacity: 0, y: 1 }}
          animate={{ opacity: [0, 0.85, 0], y: [1, -1, 1] }}
          transition={{
            duration: 0.75,
            delay: delay + i * 0.12,
            repeat: 2,
            ease: 'easeInOut',
          }}
        />
      ))}
    </g>
  );
}

export function ZellaLogo({
  size = 32,
  showWordmark = true,
  staticOnly = false,
  className = '',
}: ZellaLogoProps) {
  const phase = useAnimationPhase(!staticOnly);

  const visible = phase !== 'hidden';
  const showTyping = phase === 'typing' || phase === 'zform';
  const showZ = phase === 'zform' || phase === 'static' || phase === 'fadeout';
  const fullyVisible = phase === 'static';
  const fadingOut = phase === 'fadeout';

  // The icon's viewBox is 0 0 30 30
  const iconH = size;
  const iconW = size;

  return (
    <div
      className={`flex items-center gap-2 select-none ${className}`}
      style={{ height: iconH }}
    >
      {/* ── SVG Icon ── */}
      <motion.svg
        width={iconW}
        height={iconH}
        viewBox="0 0 30 30"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        animate={{ opacity: fadingOut ? 0 : 1 }}
        transition={{ duration: 0.5 }}
        aria-hidden="true"
      >
        {/* Background rounded rect */}
        <AnimatePresence>
          {visible && (
            <motion.rect
              x="1.49"
              y="1.49"
              width="27.02"
              height="27.02"
              rx="5.5"
              fill="#2D2D2D"
              stroke="white"
              strokeWidth="0.63"
              initial={{ scale: 0.3, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.3, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 320, damping: 22 }}
              style={{ originX: '50%', originY: '50%' }}
            />
          )}
        </AnimatePresence>

        {/* Top-left balloon (upper arm of Z) */}
        <AnimatePresence>
          {visible && (
            <motion.path
              d="M15.47,7.1l-1.3,1.85c-0.2,0.29-0.54,0.47-0.9,0.47h-7.1V7.09C6.16,7.1,15.47,7.1,15.47,7.1z"
              fill="white"
              initial={{ scaleX: 0, originX: 'left', opacity: 0 }}
              animate={{ scaleX: 1, opacity: 1 }}
              exit={{ scaleX: 0, opacity: 0 }}
              transition={{
                type: 'spring',
                stiffness: 260,
                damping: 18,
                delay: 0.05,
              }}
            />
          )}
        </AnimatePresence>

        {/* Bottom-right balloon (lower arm of Z) */}
        <AnimatePresence>
          {visible && (
            <motion.path
              d="M14.53,22.91l1.31-1.86c0.2-0.29,0.54-0.47,0.9-0.47h7.09v2.33H14.53z"
              fill="white"
              initial={{ scaleX: 0, originX: 'right', opacity: 0 }}
              animate={{ scaleX: 1, opacity: 1 }}
              exit={{ scaleX: 0, opacity: 0 }}
              transition={{
                type: 'spring',
                stiffness: 260,
                damping: 18,
                delay: 0.15,
              }}
            />
          )}
        </AnimatePresence>

        {/* Typing dots inside top balloon */}
        <AnimatePresence>
          {showTyping && (
            <motion.g
              transform="translate(6, 8)"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <TypingDots delay={0} />
            </motion.g>
          )}
        </AnimatePresence>

        {/* Typing dots inside bottom balloon */}
        <AnimatePresence>
          {showTyping && (
            <motion.g
              transform="translate(15, 21.5)"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <TypingDots delay={0.2} />
            </motion.g>
          )}
        </AnimatePresence>

        {/* Diagonal Z stroke */}
        <AnimatePresence>
          {showZ && (
            <motion.polygon
              points="24.3,7.1 13.14,22.91 5.7,22.91 16.86,7.1"
              fill="white"
              initial={{ opacity: 0, pathLength: 0 }}
              animate={{ opacity: 1, pathLength: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.45, ease: 'easeOut' }}
            />
          )}
        </AnimatePresence>
      </motion.svg>

      {/* ── Wordmark ── */}
      {showWordmark && (
        <AnimatePresence>
          {(fullyVisible || fadingOut || staticOnly) && (
            <motion.img
              src="/zella-wordmark.png"
              alt="Seu Zélla"
              initial={{ opacity: 0, x: -6 }}
              animate={{ opacity: fadingOut ? 0 : 1, x: 0 }}
              exit={{ opacity: 0, x: -4 }}
              transition={{ duration: 0.4, ease: 'easeOut' }}
              style={{ height: iconH * 0.7, width: 'auto', objectFit: 'contain' }}
              draggable={false}
            />
          )}
        </AnimatePresence>
      )}
    </div>
  );
}
