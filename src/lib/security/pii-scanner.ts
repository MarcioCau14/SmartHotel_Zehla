/**
 * ZEHLA PII Scanner (ZDR 2.0)
 * Detecta e mascara dados sensíveis (CPF, Email, Telefone) antes de enviar para LLMs externos.
 */

const PII_PATTERNS = {
  CPF: /\b\d{3}\.?\d{3}\.?\d{3}-?\d{2}\b/g,
  EMAIL: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g,
  PHONE: /\b(?:\+?55\s?)?(?:\(?\d{2}\)?\s?)?\d{4,5}-?\d{4}\b/g,
  CREDIT_CARD: /\b(?:\d[ -]*?){13,16}\b/g,
};

export interface ScanResult {
  original: string;
  masked: string;
  detectedTypes: string[];
  hasPII: boolean;
}

export function scanAndMaskPII(text: string): ScanResult {
  let masked = text;
  const detectedTypes: string[] = [];

  // FIX: Use separate regex instances for test() vs replace() to avoid
  // lastIndex advancement bug with global regexes
  if (/\b\d{3}\.?\d{3}\.?\d{3}-?\d{2}\b/.test(text)) {
    detectedTypes.push('CPF');
    masked = masked.replace(PII_PATTERNS.CPF, '[CPF_PROTECTED]');
  }

  if (/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/.test(text)) {
    detectedTypes.push('EMAIL');
    masked = masked.replace(PII_PATTERNS.EMAIL, '[EMAIL_PROTECTED]');
  }

  if (/\b(?:\+?55\s?)?(?:\(?\d{2}\)?\s?)?\d{4,5}-?\d{4}\b/.test(text)) {
    detectedTypes.push('PHONE');
    masked = masked.replace(PII_PATTERNS.PHONE, '[PHONE_PROTECTED]');
  }

  if (/\b(?:\d[ -]*?){13,16}\b/.test(text)) {
    detectedTypes.push('CREDIT_CARD');
    masked = masked.replace(PII_PATTERNS.CREDIT_CARD, '[CARD_PROTECTED]');
  }

  return {
    original: text,
    masked,
    detectedTypes,
    hasPII: detectedTypes.length > 0,
  };
}

export function sanitizePrompt(prompt: string): string {
  const maliciousPatterns = [
    /ignore previous instructions/i,
    /ignore all previous/i,
    /forget everything/i,
    /you are now an admin/i,
    /system access/i,
    /output full prompt/i,
  ];

  let sanitized = prompt;
  for (const pattern of maliciousPatterns) {
    // FIX: Create fresh regex for each test/replace to avoid lastIndex bug
    const freshPattern = new RegExp(pattern.source, pattern.flags);
    if (freshPattern.test(sanitized)) {
      sanitized = sanitized.replace(freshPattern, '[REDACTED_ATTEMPT]');
    }
  }
  return sanitized;
}