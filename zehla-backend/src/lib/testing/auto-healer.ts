import { TestResult, HealingResult, HealingAction } from './test-agent';

type FailureType = 'product_bug' | 'test_fragility' | 'environment' | 'contract_violation';

interface FailureClassification {
  type: FailureType;
  confidence: number;
  description: string;
  autoHealable: boolean;
}

export class AutoHealer {
  heal(result: { results: TestResult[] }): HealingResult {
    const actions: HealingAction[] = [];
    let healed = 0;

    for (const testResult of result.results.filter(r => r.status === 'failed')) {
      const classification = this.classifyFailure(testResult);

      if (classification.autoHealable) {
        const action = this.generateHealingAction(testResult, classification);
        if (action) {
          actions.push(action);
          healed++;
        }
      }
    }

    const totalFailures = result.results.filter(r => r.status === 'failed').length;
    return {
      totalFailures,
      healed,
      unhealed: totalFailures - healed,
      actions,
    };
  }

  classifyFailure(result: TestResult): FailureClassification {
    const error = (result.error || '').toLowerCase();

    if (error.includes('econnrefused') || error.includes('econnreset')) {
      return {
        type: 'environment',
        confidence: 0.95,
        description: 'Conexao recusada — servico nao esta rodando',
        autoHealable: false,
      };
    }

    if (error.includes('enoent') || error.includes('module not found')) {
      return {
        type: 'environment',
        confidence: 0.90,
        description: 'Arquivo ou modulo nao encontrado',
        autoHealable: false,
      };
    }

    if (error.includes('timeout') || error.includes('waiting failed')) {
      return {
        type: 'test_fragility',
        confidence: 0.85,
        description: 'Timeout — elemento ou resposta demorou demais',
        autoHealable: true,
      };
    }

    if (error.includes('selector') || error.includes('not found') ||
        error.includes('no element') || error.includes('visible')) {
      return {
        type: 'test_fragility',
        confidence: 0.90,
        description: 'Seletor nao encontrou elemento — possivel drift de UI',
        autoHealable: true,
      };
    }

    if (error.includes('received:') || error.includes('expected:')) {
      return {
        type: 'test_fragility',
        confidence: 0.70,
        description: 'Assertion falhou — possivel mudanca de comportamento',
        autoHealable: true,
      };
    }

    if (error.includes('status code') || error.includes('http')) {
      return {
        type: 'contract_violation',
        confidence: 0.80,
        description: 'Status code ou contrato HTTP divergente',
        autoHealable: true,
      };
    }

    return {
      type: 'product_bug',
      confidence: 0.60,
      description: 'Comportamento inesperado — possivel bug de produto',
      autoHealable: false,
    };
  }

  private generateHealingAction(result: TestResult, classification: FailureClassification): HealingAction | null {
    const error = (result.error || '').toLowerCase();

    if (classification.type === 'test_fragility') {
      if (error.includes('selector') || error.includes('not found')) {
        return {
          testCaseId: result.testCaseId,
          type: 'selector_fix',
          description: 'Trocar seletor CSS por seletor semantico (role/label/text)',
          original: 'CSS/XPath selector',
          fixed: 'Semantic role/label/text selector',
          autoApplied: false,
        };
      }
      if (error.includes('timeout')) {
        return {
          testCaseId: result.testCaseId,
          type: 'wait_add',
          description: 'Adicionar wait deterministico (waitForSelector/waitForLoadState)',
          original: 'No wait or fixed timeout',
          fixed: 'Deterministic waitForSelector',
          autoApplied: false,
        };
      }
      return {
        testCaseId: result.testCaseId,
        type: 'assertion_fix',
        description: 'Relaxar ou atualizar assertion',
        original: 'Current assertion',
        fixed: 'Updated assertion value',
        autoApplied: false,
      };
    }

    if (classification.type === 'contract_violation') {
      return {
        testCaseId: result.testCaseId,
        type: 'assertion_fix',
        description: 'Atualizar asserts de schema para nova resposta',
        original: 'Old schema assertion',
        fixed: 'Updated schema assertion',
        autoApplied: false,
      };
    }

    return null;
  }
}
