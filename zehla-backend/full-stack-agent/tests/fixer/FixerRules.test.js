import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { TypeFixRule } from '../../src/modules/fixer/rules/TypeFixRule.js';
import { DeadCodeRule } from '../../src/modules/fixer/rules/DeadCodeRule.js';
import { OrganizeImportsRule } from '../../src/modules/fixer/rules/OrganizeImportsRule.js';
import { RemoveConsoleLogRule } from '../../src/modules/fixer/rules/RemoveConsoleLogRule.js';

describe('TypeFixRule', () => {
  const rule = new TypeFixRule();

  it('substitui :any por :unknown', () => {
    const result = rule.apply('function foo(x: any): void {}', '/test.ts');
    assert.ok(!result.includes(': any'));
    assert.ok(result.includes(': unknown'));
  });

  it('não modifica arquivos .js', () => {
    const input = 'function foo(x: any): void {}';
    const result = rule.apply(input, '/test.js');
    assert.equal(result, input);
  });

  it('remove non-null assertions', () => {
    const result = rule.apply('const x = foo()!.bar()!;', '/test.ts');
    assert.ok(!result.includes('.!)'));
  });
});

describe('DeadCodeRule', () => {
  const rule = new DeadCodeRule();

  it('remove console.log', () => {
    const input = 'const x = 1;\nconsole.log(x);\nreturn x;';
    const result = rule.apply(input, '/test.js');
    assert.ok(!result.includes('console.log'));
  });

  it('remove variável não usada (trivial)', () => {
    const input = 'const unused = 42;\nreturn 1;';
    const result = rule.apply(input, '/test.js');
    assert.ok(!result.includes('const unused'));
  });

  it('não remove variável usada', () => {
    const input = 'const used = 42;\nconst x = used + 1;\nreturn x;';
    const result = rule.apply(input, '/test.js');
    assert.ok(result.includes('const used'));
  });
});

describe('OrganizeImportsRule', () => {
  const rule = new OrganizeImportsRule();

  it('organiza imports em grupos', () => {
    const input = "import { z } from 'zod';\nimport path from 'node:path';\nimport { foo } from './local.js';";
    const result = rule.apply(input);
    const lines = result.split('\n').filter(l => l.startsWith('import'));
    assert.ok(lines[0].includes('node:path'));
    assert.ok(lines[2].includes('./local.js'));
  });
});

describe('RemoveConsoleLogRule', () => {
  const rule = new RemoveConsoleLogRule();

  it('remove console.log', () => {
    const result = rule.apply('console.log("test");', '/test.js');
    assert.ok(!result.includes('console.log'));
  });

  it('preserva console.error', () => {
    const input = 'console.error("error");';
    const result = rule.apply(input, '/test.js');
    assert.ok(result.includes('console.error'));
  });

  it('preserva linhas com fsa:keep', () => {
    const input = 'console.log("keep me"); // fsa:keep';
    const result = rule.apply(input, '/test.js');
    assert.ok(result.includes('console.log'));
  });
});
