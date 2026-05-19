/**
 * FULL_STACK_AGENT — SecurityRule (OWASP Top 10)
 * Detecta vulnerabilidades críticas via Regex de alta performance.
 */

export class SecurityRule {
  evaluate(file, context) {
    const findings = [];
    const content = file.content;

    // 1. Detecção de eval() e new Function()
    if (/\beval\s*\(/.test(content) || /\bnew\s+Function\s*\(/.test(content)) {
      findings.push({
        rule: 'SEC-001',
        severity: 'critical',
        category: 'SECURITY',
        message: 'Uso de eval() ou new Function() detectado. Risco de execução de código arbitrário.',
        file: file.relative
      });
    }

    // 2. XSS em React: dangerouslySetInnerHTML
    if (/dangerouslySetInnerHTML/.test(content)) {
      findings.push({
        rule: 'SEC-002',
        severity: 'high',
        category: 'SECURITY',
        message: 'dangerouslySetInnerHTML detectado sem sanitização aparente. Risco de XSS.',
        file: file.relative
      });
    }

    // 3. SQL Injection básico (concatenação em strings de query)
    if (/(SELECT|INSERT|UPDATE|DELETE).*\$\{/.test(content)) {
      findings.push({
        rule: 'SEC-003',
        severity: 'critical',
        category: 'SECURITY',
        message: 'Possível SQL Injection: concatenação de variáveis detectada em query SQL.',
        file: file.relative
      });
    }

    // 5. [MANIFESTO #1 & #2] Desconfiança no Front e Segredos Expostos
    if (file.relative.includes('/src/app/') || file.relative.includes('/src/components/')) {
      if (content.match(/(key|secret|token|password|auth_?key)\s*[:=]\s*['"`][a-zA-Z0-9_\-]{16,}['"`]/i)) {
        findings.push({
          rule: 'SEC-005',
          severity: 'critical',
          category: 'SECURITY',
          message: 'Detectado possível segredo/chave de API exposto no front-end. (Item 1 do Manifesto)',
          file: file.relative
        });
      }
      if (content.includes('localStorage.setItem') && (content.includes('price') || content.includes('valor'))) {
        findings.push({
          rule: 'SEC-006',
          severity: 'high',
          category: 'SECURITY',
          message: 'Lógica de preço/valor detectada no Front-end. Risco de manipulação (Item 2 do Manifesto)',
          file: file.relative
        });
      }
    }

    // 6. [MANIFESTO #3] Privacidade de Dados (Máscaras)
    if ((content.includes('cpf') || content.includes('email') || content.includes('phone')) && !content.includes('mask') && !content.includes('replace')) {
      if (file.relative.includes('components')) {
        findings.push({
          rule: 'SEC-007',
          severity: 'medium',
          category: 'SECURITY',
          message: 'Campo de dado sensível sem máscara detectada. Risco à privacidade (Item 3 do Manifesto)',
          file: file.relative
        });
      }
    }

    // 7. [MANIFESTO #7 & #8] Rate Limiting e CORS
    if (file.relative.includes('route.ts') || file.relative.includes('api/')) {
      if (!content.includes('rateLimit') && !content.includes('upstash') && !content.includes('limiter')) {
        findings.push({
          rule: 'SEC-008',
          severity: 'high',
          category: 'SECURITY',
          message: 'API Route sem proteção de Rate Limiting. Risco de DoS (Item 7 do Manifesto)',
          file: file.relative
        });
      }
      if (!content.includes('Access-Control-Allow-Origin') && !content.includes('cors')) {
        findings.push({
          rule: 'SEC-009',
          severity: 'medium',
          category: 'SECURITY',
          message: 'Verificar configuração de CORS para este endpoint (Item 8 do Manifesto)',
          file: file.relative
        });
      }
    }

    // 8. [MANIFESTO #10] Gestão de Sessão
    if (content.includes('logout') && !content.includes('revoke') && !content.includes('delete')) {
      findings.push({
        rule: 'SEC-010',
        severity: 'medium',
        category: 'SECURITY',
        message: 'Lógica de logout detectada apenas no client-side. Garanta a invalidação no servidor (Item 10 do Manifesto)',
        file: file.relative
      });
    }

    // 11. Command Injection: shell exec com concatenação de strings
    if (/(exec|spawn|execSync|execFile)\([^)]*\$\{/.test(content)) {
      findings.push({
        rule: 'SEC-011',
        severity: 'critical',
        category: 'SECURITY',
        message: 'Command Injection: execução de shell com variável interpolada. Use execFile ou sanitize a entrada.',
        file: file.relative
      });
    }

    // 12. NoSQL Injection: $where, $gt em queries com input do usuário
    if (/\$\s*(where|gt|gte|lt|lte|ne|regex)\s*[:[]/.test(content) && /\$\{|\+ req\.|\+ body\./.test(content)) {
      findings.push({
        rule: 'SEC-012',
        severity: 'critical',
        category: 'SECURITY',
        message: 'Possível NoSQL Injection: operador MongoDB com variável interpolada.',
        file: file.relative
      });
    }

    // 13. Path Traversal: fs.readFile ou similar com caminho de parâmetro
    if (/(readFileSync|readFile|createReadStream|writeFileSync|writeFile|unlinkSync|unlink)\(.*\$\{|\+\s*(req\.|body\.)/.test(content)) {
      findings.push({
        rule: 'SEC-013',
        severity: 'high',
        category: 'SECURITY',
        message: 'Possível Path Traversal: operação de arquivo com caminho de parâmetro do usuário.',
        file: file.relative
      });
    }

    // 14. Senha hardcoded em variável
    if (/password\s*[:=]\s*['"`][^'"]+['"`]/i.test(content) && !content.includes('process.env')) {
      findings.push({
        rule: 'SEC-014',
        severity: 'high',
        category: 'SECURITY',
        message: 'Senha hardcoded detectada. Mova para variável de ambiente.',
        file: file.relative
      });
    }

    // 15. Debug endpoint ou info leakage
    if (/(debug|health|status|metrics)\/route\.ts/.test(file.relative)) {
      if (!content.includes('rateLimit') && !content.includes('auth') && !content.includes('verify')) {
        findings.push({
          rule: 'SEC-015',
          severity: 'medium',
          category: 'SECURITY',
          message: 'Endpoint sem proteção (rota de debug/info). Pode vazar dados internos.',
          file: file.relative
        });
      }
    }

    // 16. CSRF: rota de mutação sem proteção
    if (file.relative.includes('route.ts') && /(POST|PUT|DELETE|PATCH)/.test(content)) {
      if (!content.includes('csrf') && !content.includes('SameSite') && !content.includes('csrfToken')) {
        findings.push({
          rule: 'SEC-016',
          severity: 'medium',
          category: 'SECURITY',
          message: 'Rota de mutação sem proteção CSRF. Adicione validação de token.',
          file: file.relative
        });
      }
    }

    // 17. Cookie sem flags de segurança
    if (content.includes('res.cookie') || content.includes('response.cookie')) {
      if (!content.includes('httpOnly') || !content.includes('secure')) {
        findings.push({
          rule: 'SEC-017',
          severity: 'medium',
          category: 'SECURITY',
          message: 'Cookie setado sem flags httpOnly/secure. Risco de session hijacking.',
          file: file.relative
        });
      }
    }

    // 18. JSON.stringify automatic serialization (SSRF em schema auto-generated)
    if (/JSON\.stringify\(req\.|response\.send\(\s*\w+\)/.test(content) && !content.includes('validate') && !content.includes('sanitize')) {
      if (file.relative.includes('route.ts') || file.relative.includes('api/')) {
        findings.push({
          rule: 'SEC-018',
          severity: 'low',
          category: 'SECURITY',
          message: 'Resposta sem validação de schema. Risco de vazamento de dados não intencionais.',
          file: file.relative
        });
      }
    }

    return findings;
  }
}
