import { createHash } from 'crypto';

const INJECTION_PATTERNS = [
  /ignore\s+(?:todas?\s+)?(?:as?\s+)?(?:regras?|instruções?|diretrizes?|comandos?)/i,
  /esqueça\s+(?:todas?\s+)?(?:as?\s+)?(?:regras?|instruções?|anteriores?)/i,
  /desconsidere\s+(?:o\s+)?(?:acima|anterior|texto)/i,
  /a\s+partir\s+de\s+agora\s+você\s+(?:é|deve|vai)/i,
  /você\s+agora\s+(?:é|deve|vai)\s+(?:ser|agir|como)/i,
  /nov[ao]\s+(?:papel|função|identidade)/i,
  /modo\s+(?:desenvolvedor|admin|root|debug)/i,
  /<\s*\/\s*(?:system|user|assistant|instrução)\s*>/i,
  /<\s*(?:system|user|assistant)\s*>/i,
  /```\s*(?:system|user|assistant|json)/i,
  /\{\{.*?\}\}/,
  /repita\s+(?:depois\s+de\s+mim|as\s+palavras|isso\s+de\s+volta)/i,
  /mostre\s+(?:me\s+)?(?:o\s+)?(?:prompt|contexto|instruções?)/i,
  /imprima\s+(?:o\s+)?(?:prompt|system|contexto)/i,
  /(?:cancele|delete|exclua|remova)\s+(?:todas?\s+)?(?:as?\s+)?(?:reservas?|dados?)/i,
  /(?:dê|conceda|libere)\s+(?:hospedagem|estadia|desconto)\s+(?:de\s+)?gratuit[ao]/i,
  /ignore\s+(?:a\s+)?(?:política|regra)\s+de\s+(?:preço|cobrança|pagamento)/i,
];

const LEGITIMATE_PATTERNS = [
  /regra\s+de\s+cancelamento/i,
  /política\s+de\s+check[-\s]?in/i,
  /horário\s+de\s+silêncio/i,
];

interface InjectionScanResult {
  clean: boolean;
  score: number;
  matches: Array<{ pattern: string; severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' }>;
  sanitized: string;
}

export function scanForInjection(text: string): InjectionScanResult {
  const matches: Array<{ pattern: string; severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' }> = [];
  let score = 0;
  let sanitized = text;

  for (const legit of LEGITIMATE_PATTERNS) {
    if (legit.test(text)) score -= 10;
  }

  for (const pattern of INJECTION_PATTERNS) {
    if (pattern.test(text)) {
      const severity = pattern.source.includes('ignore|esqueça|desconsidere')
        ? 'CRITICAL'
        : pattern.source.includes('system|user|assistant|```')
        ? 'CRITICAL'
        : 'HIGH';
      matches.push({ pattern: pattern.source.slice(0, 40) + '...', severity });
      score += severity === 'CRITICAL' ? 50 : 25;
      sanitized = sanitized.replace(pattern, '[INSTRUÇÃO_REMOVIDA_POR_SEGURANÇA]');
    }
  }

  const instructionLines = (text.match(/^[\s]*(?:instrução|regra|comando|passo)\s*[:=-]/gim) || []).length;
  if (instructionLines > 5) {
    score += 15;
    matches.push({ pattern: 'excessive_instruction_lines', severity: 'MEDIUM' });
  }

  const clean = score < 70;
  return { clean, score: Math.min(score, 100), matches, sanitized };
}

export function validateLearnedPersona(raw: any): { valid: boolean; persona?: any; reason?: string } {
  const fieldsToScan = [
    raw?.tone,
    ...(raw?.commonExpressions || []),
    ...(raw?.conversationTypes || []),
    ...(raw?.rules || []),
  ].filter(Boolean);

  let totalScore = 0;
  const allMatches: any[] = [];

  for (const field of fieldsToScan) {
    const scan = scanForInjection(field);
    totalScore += scan.score;
    allMatches.push(...scan.matches);
  }

  const avgScore = totalScore / Math.max(fieldsToScan.length, 1);

  if (avgScore > 50 || totalScore > 100) {
    return {
      valid: false,
      reason: `Injection detectado em persona aprendida. Score: ${avgScore.toFixed(1)}/campo. Matches: ${allMatches.map(m => m.pattern).join(', ')}`,
    };
  }

  const sanitizedPersona = {
    tone: scanForInjection(raw.tone || '').sanitized,
    commonExpressions: (raw.commonExpressions || []).map((e: string) => scanForInjection(e).sanitized),
    conversationTypes: (raw.conversationTypes || []).map((e: string) => scanForInjection(e).sanitized),
    rules: (raw.rules || []).map((e: string) => scanForInjection(e).sanitized),
  };

  return { valid: true, persona: sanitizedPersona };
}
