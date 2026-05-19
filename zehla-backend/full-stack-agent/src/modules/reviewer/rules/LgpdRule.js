/**
 * FULL_STACK_AGENT — LgpdRule
 * Detecta exposição de dados sensíveis (PII).
 */

export class LgpdRule {
  evaluate(file, context) {
    const findings = [];
    const content = file.content;

    // 1. Padrões de variáveis sensíveis sem proteção aparente
    const piiPatterns = [
      { regex: /\bcpf\b/i, name: 'CPF' },
      { regex: /\bemail\b/i, name: 'E-mail' },
      { regex: /\btelefone\b/i, name: 'Telefone' },
      { regex: /\bsenha\b/i, name: 'Senha' }
    ];

    for (const pii of piiPatterns) {
      if (pii.regex.test(content)) {
        // Verifica se está sendo printado no console (erro comum)
        const consoleRegex = new RegExp(`console\\.log.*${pii.name.toLowerCase()}`, 'i');
        if (consoleRegex.test(content)) {
          findings.push({
            rule: 'LGPD-001',
            severity: 'high',
            category: 'COMPLIANCE',
            message: `Possível exposição de dado sensível (${pii.name}) em logs do console.`,
            file: file.relative
          });
        }
      }
    }

    return findings;
  }
}
