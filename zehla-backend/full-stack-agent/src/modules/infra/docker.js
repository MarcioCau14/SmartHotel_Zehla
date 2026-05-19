/**
 * FULL_STACK_AGENT — Docker Generator
 * Gera Dockerfiles otimizados para produção (Multi-stage).
 */

import { writeFile, exists } from '../../utils/fs.js';
import logger from '../../utils/logger.js';
import path from 'node:path';

export class DockerGenerator {
  async generate(projectPath, context) {
    const dockerfilePath = path.join(projectPath, 'Dockerfile');

    if (exists(dockerfilePath)) {
      return { status: 'SKIPPED', message: 'Dockerfile já existe.' };
    }

    let content = '';

    if (context.project.framework.name === 'next.js') {
      content = this.getNextJsDockerfile();
    } else {
      content = this.getGenericNodeDockerfile();
    }

    try {
      await writeFile(dockerfilePath, content);
      return { status: 'CREATED', path: 'Dockerfile' };
    } catch (err) {
      logger.error(`Falha ao gerar Dockerfile: ${err.message}`);
      return { status: 'ERROR', message: err.message };
    }
  }

  getNextJsDockerfile() {
    return `# --- STAGE 1: Dependency Base ---
FROM node:20-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci

# --- STAGE 2: Builder ---
FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NEXT_TELEMETRY_DISABLED 1
RUN npm run build

# --- STAGE 3: Runner ---
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

USER nextjs
EXPOSE 3000
CMD ["npm", "start"]
`;
  }

  getGenericNodeDockerfile() {
    return `FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 3000
CMD ["node", "src/index.js"]
`;
  }
}
