import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import fs from 'node:fs/promises';
import os from 'node:os';
import { DockerGenerator } from '../../src/modules/infra/docker.js';
import { VercelGenerator } from '../../src/modules/infra/vercel.js';
import { EnvGenerator } from '../../src/modules/infra/env.js';

function createTestContext(framework = 'next.js') {
  return {
    project: {
      framework: { name: framework },
      language: 'typescript',
      database: { orm: 'prisma' }
    }
  };
}

async function withTempDir(fn) {
  const tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), 'fsa-test-'));
  try {
    await fn(tmpDir);
  } finally {
    await fs.rm(tmpDir, { recursive: true, force: true });
  }
}

describe('DockerGenerator', () => {
  const gen = new DockerGenerator();

  it('gera Dockerfile para Next.js', async () => {
    await withTempDir(async (dir) => {
      const result = await gen.generate(dir, createTestContext('next.js'));
      assert.equal(result.status, 'CREATED');
      const content = await fs.readFile(path.join(dir, 'Dockerfile'), 'utf8');
      assert.ok(content.includes('node:20-alpine'));
      assert.ok(content.includes('npm run build'));
    });
  });

  it('retorna SKIPPED se Dockerfile existe', async () => {
    await withTempDir(async (dir) => {
      await fs.writeFile(path.join(dir, 'Dockerfile'), 'existing');
      const result = await gen.generate(dir, createTestContext());
      assert.equal(result.status, 'SKIPPED');
    });
  });
});

describe('VercelGenerator', () => {
  const gen = new VercelGenerator();

  it('gera vercel.json para Next.js', async () => {
    await withTempDir(async (dir) => {
      const result = await gen.generate(dir, createTestContext('next.js'));
      assert.equal(result.status, 'CREATED');
      const content = await fs.readFile(path.join(dir, 'vercel.json'), 'utf8');
      const config = JSON.parse(content);
      assert.equal(config.framework, 'nextjs');
    });
  });
});

describe('EnvGenerator', () => {
  const gen = new EnvGenerator();

  it('gera .env.example com DATABASE_URL (prisma)', async () => {
    await withTempDir(async (dir) => {
      const result = await gen.generate(dir, createTestContext());
      const envPath = path.join(dir, '.env.example');
      const content = await fs.readFile(envPath, 'utf8');
      assert.ok(content.includes('DATABASE_URL'));
    });
  });

  it('gera .gitignore', async () => {
    await withTempDir(async (dir) => {
      const result = await gen.generate(dir, createTestContext());
      const gitignorePath = path.join(dir, '.gitignore');
      const content = await fs.readFile(gitignorePath, 'utf8');
      assert.ok(content.includes('node_modules/'));
    });
  });
});
