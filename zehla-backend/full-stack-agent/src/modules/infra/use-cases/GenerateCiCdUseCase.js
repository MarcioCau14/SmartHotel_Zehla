/**
 * FULL_STACK_AGENT — GenerateCiCdUseCase
 * Gera workflows de GitHub Actions para CI/CD e Quality Gates.
 */

import { writeFile, mkdirp, exists } from '../../../utils/fs.js';
import path from 'node:path';

export class GenerateCiCdUseCase {
  async execute(context, options) {
    const projectPath = context.project.root;
    const workflowDir = path.join(projectPath, '.github', 'workflows');
    
    if (!options.dryRun) {
      await mkdirp(workflowDir);
    }

    // 1. CI Workflow (Lint, Test, Build)
    const ciContent = this.getCiWorkflow();
    const ciPath = path.join(workflowDir, 'ci.yml');
    
    // 2. FSA Quality Gate Workflow
    const fsaContent = this.getFsaWorkflow();
    const fsaPath = path.join(workflowDir, 'fsa-review.yml');

    if (!options.dryRun) {
      if (!exists(ciPath) || options.force) await writeFile(ciPath, ciContent.trim());
      if (!exists(fsaPath) || options.force) await writeFile(fsaPath, fsaContent.trim());
    }

    return { status: 'CREATED', message: 'GitHub Actions Workflows gerados (.github/workflows/)' };
  }

  getCiWorkflow() {
    return `
name: CI
on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      - run: npm ci
      - run: npm run lint
      - run: npm test
      - run: npm run build
    `;
  }

  getFsaWorkflow() {
    return `
name: FSA Quality Gate
on:
  pull_request:
    branches: [main]

jobs:
  fsa-review:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Run Full Stack Agent
        run: |
          # Aqui assumimos que o FSA está instalado ou disponível como ferramenta
          node /path/to/fsa/src/index.js review . --ci --deep
    `;
  }
}
