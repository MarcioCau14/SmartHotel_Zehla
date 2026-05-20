# ZEHLA — Deploy e Infraestrutura

## Docker Compose (Ambiente Local/Produção)

Definido em `INFRA/docker-compose.yml`:

| Serviço | Imagem | Porta | Função |
|---------|--------|-------|--------|
| `redis-master` | redis:7-alpine | 6379 | Cache principal, sessions, rate-limit |
| `redis-replica-1` | redis:7-alpine | — | Réplica do Redis (alta disponibilidade) |
| `redis-replica-2` | redis:7-alpine | — | Réplica do Redis (alta disponibilidade) |
| `zehla-api` | build local (Dockerfile) | 3001→3000 | Aplicação Next.js (produção) |
| `decision-worker` | build local | — | Worker BullMQ (decisões de IA) |
| `marketing-worker` | build local | — | Worker BullMQ (campanhas) |
| `delivery-worker` | build local | — | Worker BullMQ (entrega de mensagens) |
| `hermes-brain` | humans-zehla/Dockerfile | 8000 | Motor cognitivo (OpenRouter/Claude) |

**Redis Replication**: master com append-only file + 2 réplicas. Health check via `redis-cli ping`.

### Implantação local

```bash
docker compose -f INFRA/docker-compose.yml up -d
```

## Vercel (Serverless)

Configurado em `vercel.json`:

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "build",
  "functions": {
    "api/**/*.js": { "maxDuration": 30 }
  }
}
```

- **Runtime**: Node.js 20 (serverless edge functions)
- **Timeout API**: 30s máximo por função
- **Build**: Next.js build output para `/build`
- **Variáveis obrigatórias**: DATABASE_URL, NEXTAUTH_SECRET, NEXTAUTH_URL, REDIS_URL

## Pipeline CI/CD

O projeto não possui pipeline CI/CD explícita no repositório. O fluxo recomendado:

```
git push → GitHub → Vercel (autodeploy preview/production)
                      └── Docker Build (workers) → Container Registry → Production
```

**Scripts auxiliares** em `scripts/`:

| Script | Função |
|--------|--------|
| `secure-env.ts` | Seal/unseal/rotate .env |
| `harden.sh` | Permissões 600, valida placeholders, instala git hooks |
| `backup.sh` | Backup do banco PostgreSQL (pg_dump) |
| `disaster-recovery.sh` | Restauração de backup |
| `health-check-zcc.ts` | Health check do ZCC |
| `validate-zcc.ts` | Validação de integridade |

## Variáveis de Ambiente

### Críticas

| Variável | Descrição | Obrigatória |
|----------|-----------|-------------|
| `DATABASE_URL` | PostgreSQL connection string (`postgresql://...`) | Sim |
| `NEXTAUTH_SECRET` | Chave para assinar JWT (mín. 16 chars) | Sim |
| `NEXTAUTH_URL` | URL base da aplicação | Sim |
| `REDIS_URL` | Redis connection string | Sim |
| `ZEHLA_MASTER_KEY` | Chave mestra para descriptografar `.env.encrypted` | No runtime |

### API Keys

| Variável | Serviço |
|----------|---------|
| `OPENROUTER_API_KEY` | OpenRouter (LLMs — Hermes Brain) |
| `RESEND_API_KEY` | Resend (disparo de emails) |
| `STRIPE_SECRET_KEY` | Stripe (pagamentos) |
| `ASAAS_WEBHOOK_SECRET` | Asaas (PIX) |
| `PAGARME_WEBHOOK_SECRET` | Pagar.me (PIX) |
| `MP_WEBHOOK_SECRET` | MercadoPago (PIX) |
| `OPENPIX_WEBHOOK_SECRET` | OpenPix (PIX) |

### Infraestrutura

| Variável | Padrão | Descrição |
|----------|--------|-----------|
| `NODE_ENV` | `development` | Modo de execução |
| `PORT` | `3000` | Porta da aplicação |
| `REDIS_HOST` | `redis-master` | Host Redis (Docker) |
| `REDIS_PORT` | `6379` | Porta Redis |
| `CORS_ORIGINS` | `http://localhost:3000,https://smarthotelzehla.vercel.app,https://zehla.com.br` | Origens CORS permitidas |
| `HERMES_API_KEY` | `zehla-brain-secret-2026` | API Key do Hermes Brain |
| `HERMES_MODEL` | `openrouter/anthropic/claude-sonnet-4` | Modelo LLM padrão |
| `HERMES_PORT` | `8000` | Porta do Hermes |

## Monitoramento

### Prometheus

Config em `prometheus/prometheus.yml`:

- **Job**: `zehla-api` — scrape `/api/metrics` a cada 10s
- **Target**: `host.docker.internal:3000`
- **Labels**: cluster `zehla-production`
- **Métricas**: implementadas via `prom-client` (npm)

### Grafana

Dashboards em `grafana/dashboards/` com provisionamento em `grafana/provisioning/`.

## Processos de Recuperação de Desastres

### Backup de Banco

```bash
# Backup manual
bash scripts/backup.sh

# Disaster recovery
bash scripts/disaster-recovery.sh
```

O backup utiliza `pg_dump` com compressão gzip, salvando em `backups/zehla_db_<timestamp>.sql.gz`.

### RPO (Recovery Point Objective)

**1 hora** — backups frequentes para minimizar perda de dados.

### Procedimento de Falha

1. **Redis master fail**: réplicas promovidas automaticamente (Redis replication)
2. **API crash**: restart `on-failure` no Docker Compose
3. **Banco corrompido**: restaurar do último backup íntegro + verificar corrente de hash financeira
4. **Chave mestra vazada**: executar `npm run secure:rotate` e `npm run secure:seal`
5. **Incidente de segurança**: seguir o plano em `docs/security/SECURITY_INCIDENT_PLAN.md`

### Health Check

Endpoint: `GET /api/health` — verifica conectividade com PostgreSQL, Redis e Hermes Brain.
