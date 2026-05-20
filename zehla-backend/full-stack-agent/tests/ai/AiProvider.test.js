import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { AiProvider } from '../../src/modules/ai/index.js';

describe('AiProvider', () => {
  const ai = new AiProvider({ verbose: false });

  it('inicializa com modo resolvido (fallback se OPENCODE não disponível)', () => {
    const ai = new AiProvider({ verbose: false });
    // fallbackMode é true apenas se opencode CLI não estiver no PATH
    assert.ok(typeof ai.fallbackMode === 'boolean');
  });

  it('buildFixPrompt retorna prompt estruturado', () => {
    const finding = { rule: 'SEC-001', severity: 'critical', message: 'Uso de eval()' };
    const prompt = ai.buildFixPrompt('/test.ts', 'eval(x)', finding);
    assert.equal(prompt._type, 'fix-suggestion');
    assert.ok(prompt.finding.includes('SEC-001'));
    assert.ok(prompt.code.includes('eval(x)'));
  });

  it('buildExplainPrompt retorna prompt de explicação', () => {
    const finding = { rule: 'TYPE-001', severity: 'medium', message: 'Uso de any' };
    const prompt = ai.buildExplainPrompt(finding);
    assert.equal(prompt._type, 'explain');
    assert.equal(prompt.rule, 'TYPE-001');
  });

  it('fallbackResponse retorna resposta template', () => {
    const prompt = { _type: 'fix-suggestion' };
    const result = ai.fallbackResponse(prompt);
    assert.ok(result.success);
    assert.ok(result.mode === 'fallback');
    assert.ok(result.response.includes('[AI-OFFLINE]'));
  });

  it('invoke retorna fallback quando não há OPENCODE', () => {
    const prompt = { _type: 'review' };
    const result = ai.invoke(prompt);
    assert.ok(result.success);
  });
});
