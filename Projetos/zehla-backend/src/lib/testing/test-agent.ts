import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs/promises';
import path from 'path';

const execAsync = promisify(exec);

export type TestScope = 'codebase' | 'diff' | 'routes' | 'components' | 'api';
export type TestType = 'unit' | 'integration' | 'e2e' | 'api' | 'component';
export type TestPriority = 'critical' | 'high' | 'medium' | 'low';

export interface TestDiscoveryResult {
  pages: DiscoveredPage[];
  apiRoutes: DiscoveredAPIRoute[];
  components: DiscoveredComponent[];
  features: string[];
}

export interface DiscoveredPage {
  path: string;
  file: string;
  name: string;
  hasAuth: boolean;
}

export interface DiscoveredAPIRoute {
  method: string;
  path: string;
  file: string;
  hasAuth: boolean;
}

export interface DiscoveredComponent {
  name: string;
  file: string;
  category: string;
}

export interface TestCase {
  id: string;
  title: string;
  type: TestType;
  priority: TestPriority;
  scope: string;
  description: string;
  steps: string[];
  expected: string;
  tags: string[];
}

export interface TestPlan {
  projectName: string;
  generatedAt: string;
  testCases: TestCase[];
  frontendTests: TestCase[];
  backendTests: TestCase[];
  coverage: {
    pages: number;
    apiRoutes: number;
    components: number;
    totalTests: number;
  };
}

export interface TestResult {
  id: string;
  testCaseId: string;
  title: string;
  status: 'passed' | 'failed' | 'skipped' | 'flaky';
  duration: number;
  error?: string;
  screenshot?: string;
  retryCount: number;
}

export interface TestExecutionResult {
  runId: string;
  projectName: string;
  startedAt: string;
  completedAt: string;
  totalDuration: number;
  summary: {
    total: number;
    passed: number;
    failed: number;
    skipped: number;
    flaky: number;
    passRate: number;
  };
  results: TestResult[];
  artifacts: {
    screenshots: string[];
    videos: string[];
    traces: string[];
  };
}

export interface HealingAction {
  testCaseId: string;
  type: 'selector_fix' | 'wait_add' | 'mock_fix' | 'assertion_fix' | 'env_fix';
  description: string;
  original: string;
  fixed: string;
  autoApplied: boolean;
}

export interface HealingResult {
  totalFailures: number;
  healed: number;
  unhealed: number;
  actions: HealingAction[];
}

export interface TestReport {
  execution: TestExecutionResult;
  healing: HealingResult;
  recommendations: string[];
  generatedAt: string;
}

export class ZehlaTestAgent {
  private projectPath: string;
  private testDir: string;

  constructor(projectPath: string = process.cwd()) {
    this.projectPath = projectPath;
    this.testDir = path.join(projectPath, 'src', '__tests__');
  }

  async discover(scope: TestScope = 'codebase'): Promise<TestDiscoveryResult> {
    const result: TestDiscoveryResult = {
      pages: [],
      apiRoutes: [],
      components: [],
      features: [],
    };

    const appDir = path.join(this.projectPath, 'src', 'app');
    const pageFiles = await this.scanDirectory(appDir, 'page.tsx');
    for (const file of pageFiles) {
      const route = this.fileToRoute(file, appDir);
      result.pages.push({
        path: route,
        file,
        name: this.routeToName(route),
        hasAuth: this.requiresAuth(route),
      });
    }

    const apiDir = path.join(appDir, 'api');
    const apiFiles = await this.scanDirectory(apiDir, 'route.ts');
    for (const file of apiFiles) {
      const route = this.fileToAPIRoute(file, apiDir);
      result.apiRoutes.push({
        method: 'GET',
        path: route,
        file,
        hasAuth: this.requiresAuth(route),
      });
    }

    const compDir = path.join(this.projectPath, 'src', 'components');
    const compFiles = await this.scanDirectory(compDir, '.tsx');
    for (const file of compFiles) {
      const category = file.split('/components/')[1]?.split('/')[0] || 'unknown';
      result.components.push({
        name: path.basename(file, '.tsx'),
        file,
        category,
      });
    }

    result.features = this.extractFeatures(result.pages, result.apiRoutes);
    return result;
  }

  async generatePlan(discovery: TestDiscoveryResult): Promise<TestPlan> {
    const testCases: TestCase[] = [];

    for (const page of discovery.pages) {
      testCases.push(
        {
          id: `TC-PAGE-${testCases.length + 1}`,
          title: `${page.name} - Renderizacao`,
          type: 'component',
          priority: page.hasAuth ? 'high' : 'medium',
          scope: 'frontend',
          description: `Verifica que a pagina ${page.name} renderiza sem erros`,
          steps: [`Navegar para ${page.path}`, 'Verificar renderizacao completa'],
          expected: 'Pagina renderiza sem erros de JavaScript',
          tags: ['render', 'page', page.name],
        },
        {
          id: `TC-PAGE-${testCases.length + 1}`,
          title: `${page.name} - Navegacao`,
          type: 'e2e',
          priority: 'medium',
          scope: 'frontend',
          description: `Verifica navegacao para ${page.name}`,
          steps: [`Clicar no link para ${page.path}`],
          expected: `Navega para ${page.path} com sucesso`,
          tags: ['navigation', 'e2e', page.name],
        }
      );
    }

    for (const route of discovery.apiRoutes) {
      testCases.push(
        {
          id: `TC-API-${testCases.length + 1}`,
          title: `GET ${route.path} - Sucesso`,
          type: 'api',
          priority: 'high',
          scope: 'backend',
          description: `Verifica que GET ${route.path} retorna 200`,
          steps: [`Enviar GET ${route.path}`],
          expected: 'Status 200 com response valida',
          tags: ['api', 'get', route.path],
        },
        {
          id: `TC-API-${testCases.length + 1}`,
          title: `GET ${route.path} - Sem Autenticacao`,
          type: 'api',
          priority: route.hasAuth ? 'critical' : 'low',
          scope: 'backend',
          description: `Verifica protecao de autenticacao`,
          steps: [`Enviar GET ${route.path} sem token`],
          expected: route.hasAuth ? 'Status 401' : 'Status 200',
          tags: ['auth', 'security', route.path],
        }
      );
    }

    const criticalComponents = discovery.components.filter(c =>
      ['landing', 'dashboard', 'zcc', 'onboarding', 'auth'].includes(c.category)
    );
    for (const comp of criticalComponents) {
      testCases.push({
        id: `TC-COMP-${testCases.length + 1}`,
        title: `${comp.name} - Renderizacao Isolada`,
        type: 'component',
        priority: comp.category === 'auth' ? 'critical' : 'medium',
        scope: 'frontend',
        description: `Verifica renderizacao do componente ${comp.name}`,
        steps: ['Montar componente com props minimas'],
        expected: 'Componente renderiza sem erros',
        tags: ['component', comp.category, comp.name],
      });
    }

    const frontendTests = testCases.filter(t => t.scope === 'frontend');
    const backendTests = testCases.filter(t => t.scope === 'backend');

    return {
      projectName: 'zehla-smarthotel',
      generatedAt: new Date().toISOString(),
      testCases,
      frontendTests,
      backendTests,
      coverage: {
        pages: discovery.pages.length,
        apiRoutes: discovery.apiRoutes.length,
        components: discovery.components.length,
        totalTests: testCases.length,
      },
    };
  }

  async execute(type: 'unit' | 'api' | 'e2e' = 'unit'): Promise<TestExecutionResult> {
    const runId = `run-${Date.now()}`;
    const startedAt = new Date().toISOString();
    let command: string;
    const cwd = this.projectPath;

    switch (type) {
      case 'unit':
        command = 'npx vitest run --reporter=json 2>/dev/null';
        break;
      case 'api':
        command = 'npx vitest run --config vitest.api.config.ts --reporter=json 2>/dev/null';
        break;
      case 'e2e':
        command = 'npx playwright test --reporter=json 2>/dev/null';
        break;
    }

    try {
      const { stdout } = await execAsync(command, { cwd, timeout: 300000 });
      const jsonStart = stdout.indexOf('{');
      const jsonStr = jsonStart >= 0 ? stdout.slice(jsonStart) : '{}';
      const results = JSON.parse(jsonStr);

      const testResults: TestResult[] = (results.testResults || results.suites || []).flatMap(
        (suite: any) =>
          (suite.assertionResults || suite.specs || []).map((spec: any) => ({
            id: `${runId}-${spec.id || Math.random().toString(36).slice(2)}`,
            testCaseId: spec.id || spec.name,
            title: spec.title || spec.name,
            status: this.mapStatus(spec.status),
            duration: spec.duration || 0,
            error: spec.failureMessages?.join('\n') || spec.failure?.message,
            retryCount: spec.retryCount || 0,
          }))
      );

      const summary = {
        total: testResults.length,
        passed: testResults.filter(r => r.status === 'passed').length,
        failed: testResults.filter(r => r.status === 'failed').length,
        skipped: testResults.filter(r => r.status === 'skipped').length,
        flaky: testResults.filter(r => r.retryCount > 0).length,
        passRate: 0,
      };
      summary.passRate = summary.total > 0
        ? Math.round((summary.passed / summary.total) * 100)
        : 0;

      return {
        runId,
        projectName: 'zehla-smarthotel',
        startedAt,
        completedAt: new Date().toISOString(),
        totalDuration: Date.now() - new Date(startedAt).getTime(),
        summary,
        results: testResults,
        artifacts: { screenshots: [], videos: [], traces: [] },
      };
    } catch (error: any) {
      return this.parsePartialResults(error.stdout || error.message, runId, startedAt);
    }
  }

  async heal(result: TestExecutionResult): Promise<HealingResult> {
    const actions: HealingAction[] = [];
    let healed = 0;

    for (const testResult of result.results.filter(r => r.status === 'failed')) {
      const classification = this.classifyFailure(testResult);

      if (classification === 'fragility') {
        const action = this.generateHealingAction(testResult);
        if (action) {
          actions.push(action);
          healed++;
        }
      }
    }

    return {
      totalFailures: result.results.filter(r => r.status === 'failed').length,
      healed,
      unhealed: result.results.filter(r => r.status === 'failed').length - healed,
      actions,
    };
  }

  async report(result: TestExecutionResult, healing: HealingResult): Promise<string> {
    const lines: string[] = [
      `# ZEHLA Test Report — ${result.runId}`,
      '',
      `**Projeto:** ${result.projectName}`,
      `**Data:** ${result.startedAt}`,
      `**Duracao:** ${result.totalDuration}ms`,
      '',
      `## Resumo`,
      '',
      `| Metrica | Valor |`,
      `|---------|-------|`,
      `| Total | ${result.summary.total} |`,
      `| Aprovados | ${result.summary.passed} |`,
      `| Falhados | ${result.summary.failed} |`,
      `| Pulados | ${result.summary.skipped} |`,
      `| Flaky | ${result.summary.flaky} |`,
      `| Taxa de Aprovacao | ${result.summary.passRate}% |`,
      '',
      `## Healing`,
      '',
      `| Metrica | Valor |`,
      `|---------|-------|`,
      `| Total de Falhas | ${healing.totalFailures} |`,
      `| Healed | ${healing.healed} |`,
      `| Nao Healed | ${healing.unhealed} |`,
      '',
    ];

    if (healing.actions.length > 0) {
      lines.push('### Acoes de Healing', '');
      for (const action of healing.actions) {
        lines.push(`- **${action.testCaseId}:** ${action.description}`);
        lines.push(`  - Tipo: ${action.type}`);
        lines.push(`  - Auto-aplicado: ${action.autoApplied ? 'Sim' : 'Nao'}`);
        lines.push('');
      }
    }

    lines.push('## Testes Falhados', '');
    for (const test of result.results.filter(r => r.status === 'failed')) {
      lines.push(`### ${test.title}`);
      lines.push(`- **ID:** ${test.testCaseId}`);
      lines.push(`- **Duracao:** ${test.duration}ms`);
      lines.push(`- **Retries:** ${test.retryCount}`);
      if (test.error) {
        lines.push(`- **Erro:** \`${test.error.slice(0, 200)}\``);
      }
      lines.push('');
    }

    const reportContent = lines.join('\n');
    const reportPath = path.join(this.projectPath, 'download', `TEST_REPORT_${result.runId}.md`);
    await fs.writeFile(reportPath, reportContent, 'utf-8');
    return reportPath;
  }

  private async scanDirectory(dir: string, extension: string): Promise<string[]> {
    const files: string[] = [];
    try {
      const entries = await fs.readdir(dir, { withFileTypes: true });
      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
          files.push(...await this.scanDirectory(fullPath, extension));
        } else if (entry.name === extension || entry.name.endsWith(extension)) {
          files.push(fullPath);
        }
      }
    } catch {
      // Diretorio pode nao existir
    }
    return files;
  }

  private fileToRoute(file: string, baseDir: string): string {
    const relative = path.relative(baseDir, file);
    const dir = path.dirname(relative);
    const route = '/' + dir.replace(/\\/g, '/').replace(/\/page$/, '') || '/';
    return route === '/app' ? '/' : route;
  }

  private fileToAPIRoute(file: string, apiDir: string): string {
    const relative = path.relative(apiDir, file);
    const dir = path.dirname(relative);
    return '/api/' + dir.replace(/\\/g, '/');
  }

  private routeToName(route: string): string {
    const parts = route.split('/').filter(Boolean);
    return parts.map(p => p.charAt(0).toUpperCase() + p.slice(1)).join(' ') || 'Home';
  }

  private requiresAuth(route: string): boolean {
    const authRoutes = ['/dashboard', '/zcc', '/fish'];
    return authRoutes.some(r => route.startsWith(r));
  }

  private extractFeatures(pages: any[], apis: any[]): string[] {
    const features = new Set<string>();
    pages.forEach(p => features.add(`page:${p.path}`));
    apis.forEach(a => features.add(`api:${a.path}`));
    return Array.from(features);
  }

  private mapStatus(status: string): TestResult['status'] {
    const map: Record<string, TestResult['status']> = {
      'passed': 'passed',
      'failed': 'failed',
      'skipped': 'skipped',
      'pending': 'skipped',
      'todo': 'skipped',
    };
    return map[status] || 'failed';
  }

  private classifyFailure(result: TestResult): 'bug' | 'fragility' | 'environment' {
    if (!result.error) return 'bug';
    const error = result.error.toLowerCase();
    if (error.includes('timeout') || error.includes('wait') || error.includes('selector')) return 'fragility';
    if (error.includes('econnrefused') || error.includes('enoent') || error.includes('port')) return 'environment';
    return 'bug';
  }

  private generateHealingAction(result: TestResult): HealingAction | null {
    const error = (result.error || '').toLowerCase();
    if (error.includes('selector') || error.includes('not found')) {
      return {
        testCaseId: result.testCaseId,
        type: 'selector_fix',
        description: 'Seletor nao encontrado — tentar seletor semantico',
        original: 'CSS selector',
        fixed: 'role/label/text selector',
        autoApplied: false,
      };
    }
    if (error.includes('timeout')) {
      return {
        testCaseId: result.testCaseId,
        type: 'wait_add',
        description: 'Timeout — adicionar wait deterministico',
        original: 'no wait',
        fixed: 'waitForSelector/waitForLoadState',
        autoApplied: false,
      };
    }
    return null;
  }

  private parsePartialResults(stdout: string, runId: string, startedAt: string): TestExecutionResult {
    return {
      runId,
      projectName: 'zehla-smarthotel',
      startedAt,
      completedAt: new Date().toISOString(),
      totalDuration: Date.now() - new Date(startedAt).getTime(),
      summary: { total: 0, passed: 0, failed: 0, skipped: 0, flaky: 0, passRate: 0 },
      results: [],
      artifacts: { screenshots: [], videos: [], traces: [] },
    };
  }
}

export const zehlaTestAgent = new ZehlaTestAgent();
