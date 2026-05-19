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
  try {
  let masked = text;
  const detectedTypes: string[] = [];

  // CPF
  if (PII_PATTERNS.CPF.test(text)) {
    detectedTypes.push('CPF');
    masked = masked.replace(PII_PATTERNS.CPF, '[CPF_PROTECTED]');
  }

  // Email
  if (PII_PATTERNS.EMAIL.test(text)) {
    detectedTypes.push('EMAIL');
    masked = masked.replace(PII_PATTERNS.EMAIL, '[EMAIL_PROTECTED]');
  }

  // Phone
  if (PII_PATTERNS.PHONE.test(text)) {
    detectedTypes.push('PHONE');
    masked = masked.replace(PII_PATTERNS.PHONE, '[PHONE_PROTECTED]');
  }

  // Credit Card
  if (PII_PATTERNS.CREDIT_CARD.test(text)) {
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

/**
 * Filtra instruções de System Prompt Injection
 */
export function sanitizePrompt(prompt: string): string {
  try {
  const malicousPatterns = [
    /ignore previous instructions/i,
    /ignore all previous/i,
    /forget everything/i,
    /you are now an admin/i,
    /system access/i,
    /output full prompt/i,
  ];

  let sanitized = prompt;
  for (const pattern of malicousPatterns) {
    if (pattern.test(sanitized)) {
      sanitized = sanitized.replace(pattern, '[REDACTED_ATTEMPT]');
    }
  }
  return sanitized;
}
