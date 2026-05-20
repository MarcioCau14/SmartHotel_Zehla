import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { TypeSafetyRule } from '../../src/modules/reviewer/rules/TypeSafetyRule.js';

function makeFile(content, path = 'test.ts') {
  return { content, path, relative: path };
}

describe('TypeSafetyRule', () => {
  const rule = new TypeSafetyRule();

  it('detecta :any em TypeScript', () => {
    const file = makeFile('function foo(x: any): void {}');
    const findings = rule.evaluate(file, {});
    assert.ok(findings.some(f => f.rule === 'TYPE-001'));
  });

  it('detecta as any assertion', () => {
    const file = makeFile('const x = foo() as any;');
    const findings = rule.evaluate(file, {});
    assert.ok(findings.some(f => f.rule === 'TYPE-001'));
  });

  it('ignora arquivos .js', () => {
    const file = makeFile('function foo(x: any) {}', 'test.js');
    const findings = rule.evaluate(file, {});
    assert.equal(findings.length, 0);
  });

  it('detecta type assertions excessivas (3+)', () => {
    const file = makeFile(`
      const a = x as String;
      const b = y as Number;
      const c = z as Boolean;
    `);
    const findings = rule.evaluate(file, {});
    assert.ok(findings.some(f => f.rule === 'TYPE-002'));
  });

  it('detecta função exportada sem tipo de retorno', () => {
    const file = makeFile('export function calculate(x: number) { return x * 2; }');
    const findings = rule.evaluate(file, {});
    assert.ok(findings.some(f => f.rule === 'TYPE-003'));
  });

  it('detecta arrow function exportada sem tipo de retorno', () => {
    const file = makeFile('export const multiply = (a: number, b: number) => { return a * b; }');
    const findings = rule.evaluate(file, {});
    assert.ok(findings.some(f => f.rule === 'TYPE-003'));
  });

  it('detecta non-null assertions excessivas', () => {
    const file = makeFile('const a = x!.y!.z!.w!.end!;');
    const findings = rule.evaluate(file, {});
    assert.ok(findings.some(f => f.rule === 'TYPE-005'));
  });
});
