/**
 * FULL_STACK_AGENT — PerformanceRule
 * Detecta gargalos de performance comuns.
 */

export class PerformanceRule {
  evaluate(file, context) {
    const findings = [];
    const content = file.content;

    // 1. N+1 Queries em loops (Heurística: find/query dentro de for/map)
    if (/(for|map|forEach).*\{(.*\n)*?.*(find|query|select|prisma)/i.test(content)) {
      findings.push({
        rule: 'PERF-001',
        severity: 'high',
        category: 'PERFORMANCE',
        message: 'Possível N+1 Query detectada: operação de banco de dados dentro de um loop.',
        file: file.relative
      });
    }

    // 2. Memory Leak em useEffect (React)
    if (/useEffect\(.*\n(.*\n)*?.*addEventListener/i.test(content) && !/removeEventListener/.test(content)) {
      findings.push({
        rule: 'PERF-002',
        severity: 'medium',
        category: 'PERFORMANCE',
        message: 'EventListener adicionado no useEffect sem remoção correspondente (Memory Leak).',
        file: file.relative
      });
    }

    // 3. RegEx sem limites (ReDoS risk)
    if (/\/\.\*\/|\/\.\+\//.test(content)) {
      findings.push({
        rule: 'PERF-003',
        severity: 'low',
        category: 'PERFORMANCE',
        message: 'Regex genérico (.* ou .+) detectado. Pode causar ReDoS em entradas grandes.',
        file: file.relative
      });
    }

    return findings;
  }
}
