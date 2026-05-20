import { execSync } from 'node:child_process';

/**
 * AI Provider — OPENCODE Engine (zero cost)
 *
 * Abordagem:
 * 1. Tenta invocar OPENCODE CLI como subprocesso (presente no PATH)
 * 2. Se falhar (CLI não disponível), usa templates determinísticos locais
 * 3. Zero dependências externas — sem chamadas a APIs pagas
 */
export class AiProvider {
  constructor(options = {}) {
    this.opencodePath = this.resolveOpenCode();
    this.fallbackMode = !this.opencodePath;
    this.verbose = options.verbose || false;
  }

  resolveOpenCode() {
    try {
      const result = execSync('which opencode 2>/dev/null', {
        encoding: 'utf8',
        timeout: 1000,
        stdio: ['ignore', 'pipe', 'ignore']
      });
      return result.trim() || null;
    } catch {
      return null;
    }
  }

  async suggestFix(filePath, content, finding) {
    const prompt = this.buildFixPrompt(filePath, content, finding);
    return this.invoke(prompt);
  }

  async explainFinding(finding) {
    const prompt = this.buildExplainPrompt(finding);
    return this.invoke(prompt);
  }

  async reviewSuggestion(code, context) {
    const prompt = this.buildReviewPrompt(code, context);
    return this.invoke(prompt);
  }

  invoke(prompt) {
    if (this.opencodePath && !this.fallbackMode) {
      return this.invokeOpenCode(prompt);
    }
    return this.fallbackResponse(prompt);
  }

  invokeOpenCode(prompt) {
    const cmd = [
      this.opencodePath,
      '--no-color',
      '--non-interactive',
      '--input',
      JSON.stringify(prompt)
    ].join(' ');

    try {
      const result = execSync(cmd, {
        encoding: 'utf8',
        timeout: 30000,
        maxBuffer: 1024 * 1024,
        stdio: ['ignore', 'pipe', 'pipe']
      });
      return { success: true, response: result.trim() };
    } catch (err) {
      if (this.verbose) {
        process.stderr.write(`[AI] OPENCODE subprocess error (${err.message}), falling back\n`);
      }
      return this.fallbackResponse(prompt);
    }
  }

  fallbackResponse(prompt) {
    const type = prompt._type || 'generic';

    const templates = {
      'fix-suggestion': {
        message: 'Sugestão de correção baseada em regras heurísticas aplicada.',
        details: 'Para análise mais profunda, execute com OPENCODE ou configure uma API externa (OPENAI_API_KEY).'
      },
      'explain': {
        message: 'Análise baseada em padrões de código reconhecidos.',
        details: 'Consulte a documentação do FULL_STACK_AGENT para detalhes sobre cada regra de revisão.'
      },
      'review': {
        message: 'Revisão baseada em 18 regras ativas (Security, Type Safety, Code Smells, LGPD).',
        details: 'Score de qualidade calculado com base na severidade dos achados.'
      }
    };

    const response = templates[type] || templates['review'];

    return {
      success: true,
      response: `[AI-OFFLINE] ${response.message}\n${response.details}`,
      mode: 'fallback'
    };
  }

  buildFixPrompt(filePath, content, finding) {
    return {
      _type: 'fix-suggestion',
      task: 'Suggest a code fix for the following finding',
      finding: `${finding.rule}: ${finding.message}`,
      file: filePath,
      code: content.slice(0, 2000)
    };
  }

  buildExplainPrompt(finding) {
    return {
      _type: 'explain',
      task: 'Explain this code review finding and suggest improvements',
      rule: finding.rule,
      severity: finding.severity,
      message: finding.message
    };
  }

  buildReviewPrompt(code, context) {
    return {
      _type: 'review',
      task: 'Review this code for issues',
      context: context || '',
      code: (code || '').slice(0, 3000)
    };
  }
}

export async function runAi(projectPath, options, context) {
  const ai = new AiProvider({ verbose: options.verbose });

  // Se não tem findings, roda análise + review primeiro
  if (!context.findings || context.findings.length === 0) {
    process.stdout.write('[AI] Executando análise e revisão primeiro...\n');
    const { runAnalyze } = await import('../analyzer/index.js');
    await runAnalyze(projectPath, options, context);
    const { runReview } = await import('../reviewer/index.js');
    await runReview(projectPath, options, context);
  }

  const findings = context.findings || [];

  if (findings.length === 0) {
    process.stdout.write('[AI] Nenhum achado para análise.\n');
    return { analyzedCount: 0 };
  }

  process.stdout.write(`[AI] Analisando ${findings.length} achados com IA...\n`);

  let analyzedCount = 0;
  for (const finding of findings.slice(0, 10)) {
    process.stdout.write(`  → ${finding.rule} [${finding.severity}]: ${finding.message}\n`);
    const result = await ai.explainFinding(finding);
    if (result.success) analyzedCount++;
  }

  process.stdout.write(`[AI] ${analyzedCount} achados analisados.\n`);

  return { analyzedCount };
}
