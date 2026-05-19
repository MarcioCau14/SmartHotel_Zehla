/**
 * FULL_STACK_AGENT — GenerateDockerUseCase
 * Gera Dockerfiles otimizados e multi-stage por framework.
 */

import { exists, writeFile } from '../../../utils/fs.js';
import logger from '../../../utils/logger.js';

export class GenerateDockerUseCase {
  /**
   * Executa a geração do Dockerfile
   * @param {object} context - ProjectContext
   * @param {object} options - CLI options
   */
  async execute(context, options) {
    const projectPath = context.project.root;
    const dockerfilePath = `${projectPath}/Dockerfile`;
    
    if (exists(dockerfilePath) && !options.force) {
      return { status: 'SKIPPED', message: 'Dockerfile já existe. Use --force para sobrescrever.' };
    }

    let content = '';
    const framework = context.project.framework.name;

    if (framework === 'Next.js') {
      content = this.getNextJsTemplate();
    } else if (framework === 'Express' || framework === 'Fastify') {
      content = this.getNodeTemplate();
    } else {
      return { status: 'INFO', message: `Geração automática de Dockerfile para ${framework} ainda não suportada.` };
    }

    if (!options.dryRun) {
      await writeFile(dockerfilePath, content.trim());
      // Também gera o .dockerignore
      await writeFile(`${projectPath}/.dockerignore`, 'node_modules\n.next\n.git\n.fsa-reports\n.fsa-backups\n.env');
    }

    return { status: 'CREATED', message: `Dockerfile para ${framework} gerado com sucesso.` };
  }

  getNextJsTemplate() {
    return `
# Estágio 1: Instalação de Dependências
FROM node:20-alpine AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app
COPY package.json package-lock.json* yarn.lock* pnpm-lock.yaml* bun.lockb* ./
RUN \
  if [ -f pnpm-lock.yaml ]; then corepack enable pnpm && pnpm i --frozen-lockfile; \
  elif [ -f bun.lockb ]; then corepack enable bun && bun install --frozen-lockfile; \
  else npm ci; \
  fi

# Estágio 2: Build
FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NEXT_TELEMETRY_DISABLED 1
RUN npm run build

# Estágio 3: Runner
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs
EXPOSE 3000
ENV PORT 3000
CMD ["node", "server.js"]
    `;
  }

  getNodeTemplate() {
    return `
FROM node:20-alpine
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci --only=production
COPY . .
USER node
EXPOSE 3000
CMD ["node", "src/index.js"]
    `;
  }
}
