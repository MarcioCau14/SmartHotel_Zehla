'use client';

import { motion } from 'framer-motion';

// ═══════════════════════════════════════════════════════════════
// ANIMATED LOGO — SVG Line Drawing Effect
// ───────────────────────────────────────────────────────────
// Efeito de entrada do logotipo desenhando na tela via
// stroke-dashoffset / pathLength animation.
//
// ⚠️ INSTRUÇÕES PARA O DESIGNER:
// Para substituir o placeholder, cole os paths do Illustrator
// nos arrays LOGO_PATHS e LOGO_FILLS abaixo.
//
// Preparação no Illustrator:
// 1. Limpe o vetor: SEM fills sólidos, apenas strokes
// 2. Unifique as linhas (Object > Path > Outline Stroke)
// 3. Exporte como SVG (Styling: Inline Style, NÃO minificar)
// 4. Copie o atributo `d="..."` de cada <path> para LOGO_PATHS
// 5. Para elementos com fill (ex: bolinha do "i"), adicione em LOGO_FILLS
// ═══════════════════════════════════════════════════════════════

interface AnimatedLogoProps {
  /** Largura do SVG (altura é proporcional via viewBox) */
  width?: number;
  className?: string;
  /** Delay antes de iniciar a animação (segundos) */
  delay?: number;
}

// ── PLACEHOLDER: Substitua pelos paths reais do Illustrator ──
// Cada string é o valor do atributo `d` de um <path> no SVG exportado.
// O logotipo será desenhado stroke-first, depois os fills aparecem.

const LOGO_PATHS: { d: string; strokeWidth?: number; duration?: number; delay?: number }[] = [
  // ── Placeholder: Letra "Z" estilizada ──
  {
    d: 'M8 8 L32 8 L8 32 L32 32',
    strokeWidth: 2.5,
    duration: 0.8,
    delay: 0,
  },
  // ── Placeholder: Arco decorativo superior ──
  {
    d: 'M4 20 Q20 4 36 20',
    strokeWidth: 1.5,
    duration: 0.6,
    delay: 0.3,
  },
  // ── Placeholder: Linha horizontal base ──
  {
    d: 'M6 36 L34 36',
    strokeWidth: 2,
    duration: 0.4,
    delay: 0.6,
  },
];

// ── PLACEHOLDER: Elementos com fill (bolinhas, detalhes) ──
// Estes aparecem com fade-in após o stroke drawing completar.

const LOGO_FILLS: { d: string; duration?: number; delay?: number }[] = [
  // ── Placeholder: Ponto decorativo ──
  {
    d: 'M20 14 C22 14 23 15 23 17 C23 19 22 20 20 20 C18 20 17 19 17 17 C17 15 18 14 20 14 Z',
    duration: 0.4,
    delay: 1.2,
  },
];

export function AnimatedLogo({ width = 120, className = '', delay = 0 }: AnimatedLogoProps) {
  const aspectRatio = 40 / 44; // viewBox width / height
  const height = width / aspectRatio;

  return (
    <motion.div
      className={className}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3, delay }}
    >
      <svg
        width={width}
        height={height}
        viewBox="0 0 40 44"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-label="Seu Zélla — Zelador Digital Inteligente"
        role="img"
      >
        {/* ── Stroke Paths (Line Drawing Animation) ── */}
        {LOGO_PATHS.map((path, i) => (
          <motion.path
            key={`stroke-${i}`}
            d={path.d}
            stroke="white"
            strokeWidth={path.strokeWidth || 2}
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{
              pathLength: {
                duration: path.duration || 0.8,
                delay: delay + (path.delay || 0),
                ease: [0.25, 0.46, 0.45, 0.94], // custom cubic-bezier
              },
            }}
          />
        ))}

        {/* ── Fill Paths (Fade-in after stroke) ── */}
        {LOGO_FILLS.map((path, i) => (
          <motion.path
            key={`fill-${i}`}
            d={path.d}
            fill="white"
            initial={{ fillOpacity: 0, pathLength: 0 }}
            animate={{ fillOpacity: 1, pathLength: 1 }}
            transition={{
              fillOpacity: {
                duration: path.duration || 0.4,
                delay: delay + (path.delay || 1.2),
                ease: 'easeOut',
              },
              pathLength: {
                duration: (path.duration || 0.4) * 0.8,
                delay: delay + (path.delay || 1.2) - 0.2,
                ease: [0.25, 0.46, 0.45, 0.94],
              },
            }}
          />
        ))}
      </svg>
    </motion.div>
  );
}

// ═══════════════════════════════════════════════════════════════
// VARIANT: Full-width Hero Logo (larger, more dramatic)
// ═══════════════════════════════════════════════════════════════

export function AnimatedLogoHero({ className = '' }: { className?: string }) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
    >
      <AnimatedLogo width={80} delay={0.2} />
    </motion.div>
  );
}
