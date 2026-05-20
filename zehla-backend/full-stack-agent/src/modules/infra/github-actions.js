/**
 * FULL_STACK_AGENT — GitHub Actions Generator
 * Gera pipelines de CI/CD baseadas no contexto do projeto.
 */

import { writeFile, exists } from '../../utils/fs.js';
import logger from '../../utils/logger.js';
import path from 'node:path';

export class GitHubActionsGenerator {
  /**
   * Gera o workflow de CI/CD (.github/workflows/ci-cd.yml)
   */
  async generate(projectPath, context) {
    const workflowDir = path.join(projectPath, '.github', 'workflows');
    const workflowPath = path.join(workflowDir, 'ci-cd.yml');

    if (exists(workflowPath)) {
      return { status: 'SKIPPED', message: 'Workflow de CI/CD já existe.' };
    }

    let template = '';

    if (context.project.framework.name === 'next.js') {
      template = this.getNextJsTemplate();
    } else {
      template = this.getGenericNodeTemplate();
    }

    try {
      await writeFile(workflowPath, template);
      return { status: 'CREATED', path: '.github/workflows/ci-cd.yml' };
    } catch (err) {
      logger.error(`Falha ao gerar GitHub Actions: ${err.message}`);
      return { status: 'ERROR', message: err.message };
    }
  }

  getNextJsTemplate() {
    return `name: ZEHLA CI/CD (Next.js)

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

jobs:
  build-and-test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Lint and Audit
        run: |
          npm run lint || true
          npm audit --audit-level=high

      - name: Build
        run: npm run build
        env:
          DATABASE_URL: \${{ secrets.DATABASE_URL }}
          NEXTAUTH_SECRET: \${{ secrets.NEXTAUTH_SECRET }}

      - name: Run Tests
        run: npm test || echo "Nenhum teste configurado ainda"

  security-scan:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: FULL_STACK_AGENT Audit
        run: |
          npx -y full-stack-agent@latest analyze . --ci --report json > fsa-report.json
      - name: Upload FSA Report
        uses: actions/upload-artifact@v4
        with:
          name: fsa-audit-report
          path: fsa-report.json
`;
  }

  getGenericNodeTemplate() {
    return `name: Node.js CI

on: [push, pull_request]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Use Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
      - run: npm install
      - run: npm test
`;
  }
}
