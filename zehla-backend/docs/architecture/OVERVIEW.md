# ZEHLA SmartHotel — Visão Geral da Arquitetura

## Propósito

ZEHLA é uma plataforma **SmartHotel all-in-one** que oferece gestão hoteleira inteligente para pousadas e hotéis no Brasil. A plataforma combina um **ZCC (Zehu Command Center)** para operação interna da Zehla, um **Dashboard** para clientes hoteleiros, e um ecossistema de **agentes de IA** que automatizam reservas, marketing, finanças, governança e segurança.

## Tech Stack

| Camada            | Tecnologias |
|-------------------|-------------|
| **Runtime**       | Node.js 20, Next.js 16 (App Router) |
| **Linguagem**     | TypeScript 5 |
| **ORM**           | Prisma 5 + PostgreSQL |
| **Autenticação**  | NextAuth 4 (JWT) |
| **Cache/Fila**    | Redis 7 (ioredis + BullMQ) |
| **IA/LLM**        | Hermes Brain (OpenRouter, Claude Sonnet) |
| **Pagamentos**    | Stripe, PIX (Asaas/Pagarme/MercadoPago) |
| **Email**         | Resend, Listmonk |
| **Monitoria**     | Prometheus + Grafana |
| **Container**     | Docker Compose (infra local) |
| **Deploy**        | Vercel (serverless) + Docker (workers) |
| **Testes**        | Playwright |
| **Estilização**   | Tailwind CSS 4, Radix UI, shadcn/ui |

## Padrão Arquitetural

**Modular Monolith + Clean Architecture Lite**

- **Módulos**: auth, agents, brain, blast, crm, connect, finance, security, marketing, swipes, trends, webhooks, zcc, zmg
- **Camadas**: `src/app/api/*` (rotas/controllers) → `src/lib/*` (serviços/lógica) → `src/workers/*` (background jobs) → Prisma (persistência)
- **Multi-tenancy**: Isolamento por `propertyId` injetado dinamicamente via Prisma middleware (`src/lib/prisma.ts`)
- **Arquitetura de Agentes**: Cada agente (Jony, Maria, Tedd, Zelador, etc.) expõe uma rota `/api/agents/*` e pode operar via worker BullMQ

## Decisões de Design Relevantes

1. **Next.js App Router como API Gateway** — Toda rota `/api/*` é serverless-first. Workers rodam em containers separados para jobs pesados.
2. **Prisma com 4 camadas de segurança** — Tenant isolation, WORM financeiro, canary detection, audit logging — tudo no middleware do Prisma client.
3. **Redis de 3 bancos lógicos** — DB 0 (sessões/rate-limit), DB 1 (workers/filas), DB 2 (cache de IA).
4. **Hermes Brain separado** — Serviço cognitivo em container próprio (repo `humans-zehla`), acessado via API com chave HMAC.
5. **ZDR Guardian** — Camada defensiva com rate limiting, detectores de canário, sanitizador de PII, e validador de webhook PIX.
6. **ENV Guardian** — Criptografia AES-256-GCM do `.env` em repouso, com rotação de chave mestra.
7. **Dashboard/ZCC isolados** — Rotas `/dashboard` (cliente) e `/zcc` (interno) com middlewares distintos de autenticação e autorização.

## Estrutura de Diretórios

```
zehla-backend/
├── src/
│   ├── app/api/          # Rotas Next.js (35 grupos)
│   │   ├── agents/       # 9 rotas — Agentes de IA
│   │   ├── auth/         # 3 rotas — Autenticação
│   │   ├── brain/        # 5 rotas — Hermes Engine
│   │   ├── blast/        # 3 rotas — Marketing Campaigns
│   │   ├── connect/      # 6 rotas — Link-in-Bio
│   │   ├── crm/          # 9 rotas — CRM
│   │   ├── zcc/          # 16 rotas — ZCC Interno
│   │   ├── zmg/          # 3 rotas — Zehla Magic
│   │   ├── webhooks/     # 5 rotas — Webhooks
│   │   ├── swipes/       # 7 rotas — Swipes
│   │   ├── trends/       # 6 rotas — Trends
│   │   ├── leads/        # 3 rotas — Leads
│   │   └── ...           # demais grupos
│   ├── lib/
│   │   ├── security/     # 21 módulos — ZDR Guardian
│   │   ├── agents/       # Implementação dos agentes
│   │   ├── brain/        # Cliente Hermes Brain
│   │   ├── finance/      # Motor financeiro
│   │   ├── queue/        # BullMQ workers
│   │   ├── redis.ts      # Singleton Redis (3 DBs)
│   │   └── prisma.ts     # Prisma com 4 camadas de proteção
│   ├── components/       # Componentes React (Dashboard/ZCC)
│   ├── services/         # Serviços compartilhados
│   ├── workers/          # Background jobs (9 workers)
│   └── middleware.ts     # Next.js Edge Middleware (CORS + Auth)
├── prisma/
│   └── schema.prisma     # 36 modelos, 18 enums
├── INFRA/
│   ├── docker-compose.yml
│   └── Dockerfile
├── scripts/              # Scripts de segurança, backup, seed
├── prometheus/
├── grafana/
└── docs/
    └── architecture/     # ← Você está aqui
```
