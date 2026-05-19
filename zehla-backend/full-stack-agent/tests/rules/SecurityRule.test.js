import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { SecurityRule } from '../../src/modules/reviewer/rules/SecurityRule.js';

function makeFile(content, path = 'src/app/route.ts') {
  return { content, path, relative: path };
}

describe('SecurityRule', () => {
  const rule = new SecurityRule();

  it('detecta eval()', () => {
    const file = makeFile('eval(userInput)');
    const findings = rule.evaluate(file, {});
    assert.ok(findings.some(f => f.rule === 'SEC-001'));
  });

  it('detecta dangerouslySetInnerHTML', () => {
    const file = makeFile('<div dangerouslySetInnerHTML={{ __html: content }} />');
    const findings = rule.evaluate(file, {});
    assert.ok(findings.some(f => f.rule === 'SEC-002'));
  });

  it('detecta SQL injection com template string', () => {
    const file = makeFile('const query = `SELECT * FROM users WHERE id = ${userId}`');
    const findings = rule.evaluate(file, {});
    assert.ok(findings.some(f => f.rule === 'SEC-003'));
  });

  it('detecta segredo exposto no front-end', () => {
    const file = makeFile('const API_KEY = "sk-abc123def456ghi789jkl012"', '/src/app/page.tsx');
    const findings = rule.evaluate(file, {});
    assert.ok(findings.some(f => f.rule === 'SEC-005'));
  });

  it('detecta command injection', () => {
    const file = makeFile('exec("rm -rf ${userInput}")');
    const findings = rule.evaluate(file, {});
    assert.ok(findings.some(f => f.rule === 'SEC-011'));
  });

  it('detecta senha hardcoded', () => {
    const file = makeFile('const password = "supersecret123"');
    const findings = rule.evaluate(file, {});
    assert.ok(findings.some(f => f.rule === 'SEC-014'));
  });

  it('detecta NoSQL injection', () => {
    const file = makeFile('db.collection.find({ $where: "this.field == " + body.input })');
    const findings = rule.evaluate(file, {});
    assert.ok(findings.some(f => f.rule === 'SEC-012'));
  });

  it('detecta path traversal', () => {
    const file = makeFile('fs.readFileSync("/data/" + req.params.file)');
    const findings = rule.evaluate(file, {});
    assert.ok(findings.some(f => f.rule === 'SEC-013'));
  });

  it('detecta falta de rate limiting em route', () => {
    const file = makeFile('export async function POST(req) { return Response.json({}); }', 'src/app/api/data/route.ts');
    const findings = rule.evaluate(file, {});
    assert.ok(findings.some(f => f.rule === 'SEC-008'));
  });

  it('detecta rota mutação sem CSRF', () => {
    const file = makeFile('export async function POST(req) { }', 'src/app/api/create/route.ts');
    const findings = rule.evaluate(file, {});
    assert.ok(findings.some(f => f.rule === 'SEC-016'));
  });
});
