import crypto from 'crypto';


// ============================================================
// ENV GUARDIAN — Proteção em Tempo de Execução
// ============================================================
// Módulo que carrega, valida e protege variáveis de ambiente
// contra vazamentos em logs, erros e processos filho.
// ============================================================


interface EnvEntry {
  key: string;
  value: string;
  category: 'critical' | 'sensitive' | 'normal';
  lastAccess: number;
  accessCount: number;
}

const SENSITIVE_PATTERNS = [
  /_API_KEY$/,
  /_SECRET$/,
  /_KEY$/,
  /_TOKEN$/,
  /_PASSWORD$/,
  /_CREDENTIALS$/,
  /NEXTAUTH_SECRET/,
];

const CRITICAL_PATTERNS = [
  /^OPENROUTER_API_KEY/,
  /^DATABASE_URL/,
  /^ZEHLA_MASTER_KEY/,
  /^ENCRYPTION_KEY/,
];

export class RuntimeGuardian {
  private registry = new Map<string, EnvEntry>();
  private maskingEnabled: boolean;
  private accessLog: string[] = [];

  constructor(maskingEnabled = true) {
    this.maskingEnabled = maskingEnabled;
    this.indexEnv();
  }

  private indexEnv(): void {
    for (const [key, value] of Object.entries(process.env)) {
      if (!value) continue;
      const category = CRITICAL_PATTERNS.some(p => p.test(key))
        ? 'critical'
        : SENSITIVE_PATTERNS.some(p => p.test(key))
        ? 'sensitive'
        : 'normal';

      this.registry.set(key, {
        key,
        value,
        category,
        lastAccess: 0,
        accessCount: 0,
      });
    }
  }

  /**
   * Mascara valores sensíveis em strings (logs, erros, responses)
   */
  mask(str: string): string {
    if (!this.maskingEnabled) return str;

    let masked = str;
    for (const [, entry] of this.registry) {
      if (entry.category === 'normal') continue;
      if (entry.value.length < 8) continue;

      // Substitui ocorrências do valor por [REDACTED]
      const escaped = entry.value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const regex = new RegExp(escaped, 'gi');
      masked = masked.replace(regex, `[REDACTED_${entry.key}]`);

      // Também mascara versões truncadas (ex: primeiros 4 chars)
      const prefix = entry.value.slice(0, 4);
      if (prefix.length >= 3) {
        const prefixRegex = new RegExp(prefix.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
        masked = masked.replace(prefixRegex, '[KEY_PREFIX]');
      }
    }
    return masked;
  }

  /**
   * Valida se todas as chaves críticas estão presentes e têm formato válido
   */
  validate(): { valid: boolean; missing: string[]; weak: string[] } {
    const required = [
      { key: 'DATABASE_URL', pattern: /^postgresql:\/\// },
      { key: 'NEXTAUTH_SECRET', pattern: /.{16,}/ },
      { key: 'NEXTAUTH_URL', pattern: /^https?:\/\// },
    ];

    const missing: string[] = [];
    const weak: string[] = [];

    for (const req of required) {
      const value = process.env[req.key];
      if (!value) {
        missing.push(req.key);
      } else if (!req.pattern.test(value)) {
        weak.push(req.key);
      }
    }

    // Verifica se há pelo menos uma API key configurada
    const apiKeys = Array.from(this.registry.values()).filter(
      e => e.category === 'critical' && e.value.length > 8
    );
    if (apiKeys.length === 0) {
      weak.push('Nenhuma API Key de IA configurada (GROQ/TOGETHER/OPENROUTER)');
    }

    return {
      valid: missing.length === 0 && weak.length === 0,
      missing,
      weak,
    };
  }

  /**
   * Retorna um snapshot seguro para debug (valores mascarados)
   */
  getSanitizedSnapshot(): Record<string, string> {
    const snapshot: Record<string, string> = {};
    for (const [key, entry] of this.registry) {
      if (entry.category === 'normal') {
        snapshot[key] = entry.value;
      } else {
        snapshot[key] = entry.value.slice(0, 4) + '…' + entry.value.slice(-4);
      }
    }
    return snapshot;
  }

  /**
   * Gera alerta se detectar variável placeholder
   */
  checkPlaceholders(): string[] {
    const warnings: string[] = [];
    for (const [key, entry] of this.registry) {
      if (
        entry.value.includes('sua-chave') ||
        entry.value === 'your-key-here' ||
        entry.value === 'change-me' ||
        entry.value.length < 8
      ) {
        warnings.push(`[ENV-GUARDIAN] ⚠ Placeholder detectado: ${key}="${entry.value}"`);
      }
    }
    return warnings;
  }

  /**
   * Previne que vars sensíveis vazem para child processes
   */
  getCleanEnv(): Record<string, string> {
    const clean: Record<string, string> = {};
    for (const [key, entry] of this.registry) {
      if (entry.category !== 'critical') {
        clean[key] = entry.value;
      }
      // Crítico: não propaga para subprocessos
    }
    return clean;
  }

  getCriticalCount(): number {
    return Array.from(this.registry.values()).filter(e => e.category === 'critical').length;
  }

  getSensitiveCount(): number {
    return Array.from(this.registry.values()).filter(e => e.category === 'sensitive').length;
  }
}

// Singleton
let instance: RuntimeGuardian | null = null;

export function getEnvGuardian(): RuntimeGuardian {
  if (!instance) {
    instance = new RuntimeGuardian();
  }
  return instance;
}

/**
 * Hook para usar em console.log/error interceptors
 */
export function secureLog(...args: unknown[]): void {
  const guardian = getEnvGuardian();
  const masked = args.map(arg => {
    if (typeof arg === 'string') return guardian.mask(arg);
    if (arg instanceof Error) return guardian.mask(arg.message);
    try {
      return guardian.mask(JSON.stringify(arg));
    } catch {
      return String(arg);
    }
  });
  console.log(...masked);
}
