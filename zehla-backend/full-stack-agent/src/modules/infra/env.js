import { writeFile, exists, readFileSync } from '../../utils/fs.js';
import logger from '../../utils/logger.js';
import path from 'node:path';

export class EnvGenerator {
  async generate(projectPath, context) {
    const results = [];

    const envExample = await this.generateEnvExample(projectPath, context);
    results.push(envExample);

    const gitignore = await this.generateGitignore(projectPath, context);
    results.push(gitignore);

    return { status: 'COMPLETED', results };
  }

  async generateEnvExample(projectPath, context) {
    const envPath = path.join(projectPath, '.env.example');

    if (exists(envPath)) {
      return { status: 'SKIPPED', message: '.env.example já existe.' };
    }

    const isNext = context.project?.framework?.name === 'next.js';
    const hasPrisma = context.project?.database?.orm === 'prisma';

    const template = [
      '# ============================================',
      '# FULL_STACK_AGENT — Environment Template',
      '# Copie para .env e preencha os valores',
      '# ============================================',
      '',
      '# --- App ---',
      'NODE_ENV=development',
      ...(isNext ? ['NEXT_PUBLIC_APP_URL=http://localhost:3000'] : ['PORT=3000']),
      '',
      '# --- Database ---',
      ...(hasPrisma
        ? ['DATABASE_URL=postgresql://user:password@localhost:5432/mydb']
        : []),
      '',
      '# --- Auth ---',
      'NEXTAUTH_SECRET=your-secret-here',
      'NEXTAUTH_URL=http://localhost:3000',
      '',
      '# --- API Keys (preencha) ---',
      '# OPENAI_API_KEY=sk-...',
      '# RESEND_API_KEY=re_...',
      '# AWS_ACCESS_KEY_ID=...',
      '# AWS_SECRET_ACCESS_KEY=...',
      '',
      ...(isNext
        ? [
            '# --- Next.js ---',
            'NEXT_TELEMETRY_DISABLED=1',
            ''
          ]
        : []),
    ].join('\n');

    try {
      await writeFile(envPath, template);
      return { status: 'CREATED', path: '.env.example' };
    } catch (err) {
      logger.error(`Falha ao gerar .env.example: ${err.message}`);
      return { status: 'ERROR', message: err.message };
    }
  }

  async generateGitignore(projectPath, context) {
    const gitignorePath = path.join(projectPath, '.gitignore');

    if (exists(gitignorePath)) {
      return { status: 'SKIPPED', message: '.gitignore já existe.' };
    }

    const template = [
      '# --- Dependencies ---',
      'node_modules/',
      '',
      '# --- Build ---',
      'dist/',
      'build/',
      '.next/',
      'out/',
      '',
      '# --- Environment ---',
      '.env',
      '.env.local',
      '.env.production',
      '.env.*.local',
      '',
      '# --- IDE ---',
      '.vscode/',
      '.idea/',
      '*.swp',
      '*.swo',
      '',
      '# --- OS ---',
      '.DS_Store',
      'Thumbs.db',
      '',
      '# --- Logs ---',
      '*.log',
      'npm-debug.log*',
      '',
      '# --- Test ---',
      'coverage/',
      '.nyc_output/',
      '',
      '# --- Cache ---',
      '.cache/',
      '.turbo/',
      '.vercel/',
      '',
      '# --- FSA ---',
      '.fsa-cache/',
      '.fsa-backups/',
      '.fsa-reports/',
      ''
    ].join('\n');

    try {
      await writeFile(gitignorePath, template);
      return { status: 'CREATED', path: '.gitignore' };
    } catch (err) {
      logger.error(`Falha ao gerar .gitignore: ${err.message}`);
      return { status: 'ERROR', message: err.message };
    }
  }
}
