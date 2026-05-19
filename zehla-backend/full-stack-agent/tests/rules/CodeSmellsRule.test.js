import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { CodeSmellsRule } from '../../src/modules/reviewer/rules/CodeSmellsRule.js';

function makeFile(content, path = 'src/test.ts') {
  return { content, path, relative: path };
}

describe('CodeSmellsRule', () => {
  const rule = new CodeSmellsRule();

  it('detecta arquivo longo (>500 linhas)', () => {
    const lines = Array(600).fill('// linha de codigo');
    const file = makeFile(lines.join('\n'));
    const findings = rule.evaluate(file, {});
    assert.ok(findings.some(f => f.rule === 'SMELL-001'));
  });

  it('detecta catch vazio', () => {
    const file = makeFile('try { foo() } catch(e) {}');
    const findings = rule.evaluate(file, {});
    assert.ok(findings.some(f => f.rule === 'SMELL-003'));
  });

  it('detecta switch sem default', () => {
    const file = makeFile('switch(type) { case 1: break; case 2: break; }');
    const findings = rule.evaluate(file, {});
    assert.ok(findings.some(f => f.rule === 'SMELL-004'));
  });

  it('detecta função muito longa (>80 linhas)', () => {
    const lines = [];
    lines.push('function hugeFunction() {');
    for (let i = 0; i < 90; i++) {
      lines.push(`  const x${i} = ${i};`);
    }
    lines.push('}');
    const file = makeFile(lines.join('\n'));
    const findings = rule.evaluate(file, {});
    assert.ok(findings.some(f => f.rule === 'SMELL-005'));
  });

  it('detecta parâmetros excessivos (>4)', () => {
    const file = makeFile('function overloaded(a, b, c, d, e, f) { return a; }');
    const findings = rule.evaluate(file, {});
    assert.ok(findings.some(f => f.rule === 'SMELL-006'));
  });

  it('detecta TODO/FIXME', () => {
    const file = makeFile('// TODO: implement pagination\nconst x = 1;\n// FIXME: this is broken');
    const findings = rule.evaluate(file, {});
    assert.ok(findings.some(f => f.rule === 'SMELL-008'));
  });

  it('detecta God Class (>300 linhas)', () => {
    const lines = ['class GodClass {'];
    for (let i = 0; i < 350; i++) {
      lines.push(`  method${i}() { return ${i}; }`);
    }
    lines.push('}');
    const file = makeFile(lines.join('\n'));
    const findings = rule.evaluate(file, {});
    assert.ok(findings.some(f => f.rule === 'SMELL-010'));
  });
});
