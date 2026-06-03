import { exec } from 'child_process';
import { promisify } from 'util';
import { TestExecutionResult, TestResult } from './test-agent';

const execAsync = promisify(exec);

export class Executor {
  private projectPath: string;

  constructor(projectPath: string) {
    this.projectPath = projectPath;
  }

  async executeUnit(): Promise<TestExecutionResult> {
    return this.runVitest('npx vitest run --reporter=json 2>/dev/null');
  }

  async executeAPI(): Promise<TestExecutionResult> {
    return this.runVitest('npx vitest run --config vitest.api.config.ts --reporter=json 2>/dev/null');
  }

  async executeE2E(): Promise<TestExecutionResult> {
    return this.runPlaywright();
  }

  private async runVitest(command: string): Promise<TestExecutionResult> {
    const runId = `run-${Date.now()}`;
    const startedAt = new Date().toISOString();

    try {
      const { stdout } = await execAsync(command, { cwd: this.projectPath, timeout: 300000 });
      return this.parseVitestOutput(stdout, runId, startedAt);
    } catch (error: any) {
      return this.parseVitestOutput(error.stdout || '', runId, startedAt);
    }
  }

  private async runPlaywright(): Promise<TestExecutionResult> {
    const runId = `run-${Date.now()}`;
    const startedAt = new Date().toISOString();

    try {
      const { stdout } = await execAsync(
        'npx playwright test --reporter=json 2>/dev/null',
        { cwd: this.projectPath, timeout: 300000 }
      );
      return this.parsePlaywrightOutput(stdout, runId, startedAt);
    } catch (error: any) {
      return this.parsePlaywrightOutput(error.stdout || '', runId, startedAt);
    }
  }

  private parseVitestOutput(stdout: string, runId: string, startedAt: string): TestExecutionResult {
    const jsonStart = stdout.indexOf('{');
    const jsonStr = jsonStart >= 0 ? stdout.slice(jsonStart) : '{}';

    let results: TestResult[] = [];
    try {
      const parsed = JSON.parse(jsonStr);
      results = (parsed.testResults || []).flatMap((suite: any) =>
        (suite.assertionResults || []).map((spec: any) => ({
          id: `${runId}-${spec.id || Math.random().toString(36).slice(2)}`,
          testCaseId: spec.id || spec.title,
          title: spec.title || 'Unknown test',
          status: this.mapStatus(spec.status),
          duration: spec.duration || 0,
          error: spec.failureMessages?.join('\n'),
          retryCount: spec.retryCount || 0,
        }))
      );
    } catch {
      // Parse falhou, retorna vazio
    }

    return this.buildResult(runId, startedAt, results);
  }

  private parsePlaywrightOutput(stdout: string, runId: string, startedAt: string): TestExecutionResult {
    const results: TestResult[] = [];
    try {
      const lines = stdout.split('\n').filter(l => l.trim());
      for (const line of lines) {
        try {
          const parsed = JSON.parse(line);
          if (parsed.testId || parsed.title) {
            results.push({
              id: `${runId}-${parsed.testId || Math.random().toString(36).slice(2)}`,
              testCaseId: parsed.testId || parsed.title,
              title: parsed.title || 'Unknown',
              status: parsed.expectedStatus === 'passed' ? 'passed' : 'failed',
              duration: parsed.duration || 0,
              error: parsed.error?.message,
              retryCount: parsed.retries || 0,
            });
          }
        } catch {
          // Linha nao e JSON, ignorar
        }
      }
    } catch {
      // Parse falhou
    }

    return this.buildResult(runId, startedAt, results);
  }

  private buildResult(runId: string, startedAt: string, results: TestResult[]): TestExecutionResult {
    const summary = {
      total: results.length,
      passed: results.filter(r => r.status === 'passed').length,
      failed: results.filter(r => r.status === 'failed').length,
      skipped: results.filter(r => r.status === 'skipped').length,
      flaky: results.filter(r => r.retryCount > 0).length,
      passRate: results.length > 0 ? Math.round((results.filter(r => r.status === 'passed').length / results.length) * 100) : 0,
    };

    return {
      runId,
      projectName: 'zehla-smarthotel',
      startedAt,
      completedAt: new Date().toISOString(),
      totalDuration: Date.now() - new Date(startedAt).getTime(),
      summary,
      results,
      artifacts: { screenshots: [], videos: [], traces: [] },
    };
  }

  private mapStatus(status: string): TestResult['status'] {
    const map: Record<string, TestResult['status']> = {
      passed: 'passed',
      failed: 'failed',
      skipped: 'skipped',
      pending: 'skipped',
      todo: 'skipped',
    };
    return map[status] || 'failed';
  }
}
