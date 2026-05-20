import { writeFile, exists } from '../../utils/fs.js';
import logger from '../../utils/logger.js';
import path from 'node:path';

export class LinterGenerator {
  async generate(projectPath, context) {
    const results = [];

    const eslintResult = await this.generateEslint(projectPath, context);
    results.push(eslintResult);

    const prettierResult = await this.generatePrettier(projectPath, context);
    results.push(prettierResult);

    return { status: 'COMPLETED', results };
  }

  async generateEslint(projectPath, context) {
    const eslintPath = path.join(projectPath, '.eslintrc.json');

    if (exists(eslintPath)) {
      return { status: 'SKIPPED', message: '.eslintrc.json já existe.' };
    }

    const isTs = context.project?.language === 'typescript';
    const isNext = context.project?.framework?.name === 'next.js';

    const config = {
      env: { browser: true, es2022: true, node: true },
      extends: [
        'eslint:recommended',
        ...(isTs ? ['plugin:@typescript-eslint/recommended'] : []),
        ...(isNext ? ['next/core-web-vitals'] : [])
      ],
      parser: isTs ? '@typescript-eslint/parser' : undefined,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        ...(isTs ? { project: './tsconfig.json' } : {})
      },
      plugins: [
        ...(isTs ? ['@typescript-eslint'] : [])
      ],
      rules: {
        'no-unused-vars': isTs ? 'off' : 'warn',
        ...(isTs ? {
          '@typescript-eslint/no-unused-vars': 'warn',
          '@typescript-eslint/no-explicit-any': 'warn',
          '@typescript-eslint/explicit-function-return-type': 'off'
        } : {}),
        'no-console': 'warn',
        'prefer-const': 'error',
        'no-var': 'error',
        'eqeqeq': ['error', 'always']
      }
    };

    try {
      await writeFile(eslintPath, JSON.stringify(config, null, 2) + '\n');
      return { status: 'CREATED', path: '.eslintrc.json' };
    } catch (err) {
      logger.error(`Falha ao gerar .eslintrc.json: ${err.message}`);
      return { status: 'ERROR', message: err.message };
    }
  }

  async generatePrettier(projectPath, context) {
    const prettierPath = path.join(projectPath, '.prettierrc');

    if (exists(prettierPath)) {
      return { status: 'SKIPPED', message: '.prettierrc já existe.' };
    }

    const config = {
      semi: true,
      singleQuote: true,
      tabWidth: 2,
      trailingComma: 'all',
      printWidth: 100,
      arrowParens: 'always',
      endOfLine: 'lf'
    };

    try {
      await writeFile(prettierPath, JSON.stringify(config, null, 2) + '\n');
      return { status: 'CREATED', path: '.prettierrc' };
    } catch (err) {
      logger.error(`Falha ao gerar .prettierrc: ${err.message}`);
      return { status: 'ERROR', message: err.message };
    }
  }
}
