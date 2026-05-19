# ZEHLA — Arquitetura de Segurança

## ZDR Guardian System

O **ZDR Guardian** é o sistema de defesa em camadas do ZEHLA, composto por 21 módulos em `src/lib/security/`. Opera em 4 camadas:

```
Camada 1 — Prisma Middleware (src/lib/prisma.ts)
├── Tenant Isolation (propertyId injection)
├── WORM Financeiro (bloqueia update/delete em registros imutáveis)
├── Canary Detector (honeypot detection)
└── Audit Logging

Camada 2 — Edge Middleware (src/middleware.ts)
├── CORS validation
├── Route protection (/zcc/*, /dashboard/*)
└── Session token check

Camada 3 — Guardian Workers (src/lib/security/)
├── rate-limit.ts       — Redis-based rate limiter
├── pii-sanitizer.ts    — PII detection & masking
├── pii-guard.ts        — PII validation guard
├── pix-webhook-guard.ts — HMAC webhook validation
├── guardian.ts         — Circuit breaker (price anomaly, brute force)
├── guardian-alert.ts   — Alert dispatching
├── guardian-fortress.ts — Fortress protocol
├── canary-detector.ts  — Honeypot trigger
├── tenant-context.ts   — Tenant extraction (session/headers)
├── tenant-scope.ts     — Scope validation
├── encryption.ts       — Field-level encryption
├── audit.ts            — Security audit & financial hash chain
├── audit-logging.ts    — Audit trail
├── cache-signer.ts     — Signed cache keys
├── cross-reference.ts  — Cross-tenant data reference check
├── finops-breaker.ts   — Financial ops circuit breaker
├── resource-guard.ts   — Resource quota guard
├── prompt-guard.ts     — LLM prompt injection guard
├── whatsapp-shield.ts  — WhatsApp abuse protection
└── env-guardian.ts     — Runtime env masking

Camada 4 — Security Incident Response (docs/security/SECURITY_INCIDENT_PLAN.md)
├── Classificação LOW → CRITICAL
├── Protocolo 4 fases (Identificação → Contenção → Erradicação → Notificação LGPD)
└── Post-mortem obrigatório
```

## Rate Limiting

Implementado em `src/lib/security/rate-limit.ts` usando **Redis INCR + EXPIRE**.

```typescript
rateLimit(key: string, limit: number, windowSeconds: number)
```

- **Padrão aplicado**: 50 requisições/minuto por IP/ação
- **Redis DB 0** usado para contadores de rate limit
- **Graceful degradation**: se Redis falha, permite a ação (fail-open controlado)
- **Guardian class**: `checkRateLimit(ip, action)` com limite de 50/min

## CORS

Configurado em `src/middleware.ts` via variável `CORS_ORIGINS`:

```
ALLOWED_ORIGINS = env.CORS_ORIGINS || 
  'http://localhost:3000,https://smarthotelzehla.vercel.app,https://zehla.com.br'
```

- Métodos permitidos: GET, POST, PUT, PATCH, DELETE, OPTIONS
- Headers: Content-Type, Authorization, X-CSRF-Token, **X-Tenant-Id**, X-Api-Key
- Credentials: true
- Max-Age: 86400s (24h)
- **Preflight**: OPTIONS retorna 204 com headers CORS

## Sanitização de PII

`src/lib/security/pii-sanitizer.ts` detecta e remove:

| Padrão | Exemplo |
|--------|---------|
| CPF | `123.456.789-00` |
| CNPJ | `12.345.678/0001-90` |
| Cartão | 13-19 dígitos |
| Email | `user@domain.com` |
| Telefone BR | `+55 48 99999-9999` |
| Chave PIX | UUID ou 32 hex |
| Nome completo | Após saudação (Sr., Sra., Dr.) |
| Endereço | Rua/Av + número |
| Data nascimento | `dd/mm/aaaa` |

**Fluxo**: `assertSanitized(text)` → `sanitizePIIWithProof(text)` → substitui por `[TIPO_REMOVIDO]` → loga no SystemLog → retorna texto limpo. Se detectou PII mas não removeu, lança erro.

## Autenticação (NextAuth + JWT)

- **Provider**: NextAuth 4 com JWT (session strategy)
- **Hash de senha**: bcryptjs (`src/lib/auth.ts`)
- **Tokens**: JWT assinado, armazenados em cookie `next-auth.session-token`
- **Roles**: CLIENT, ADMIN, SUPER_ADMIN, TEAM
- **Permissões granulares**: Array `permissions[]` no model User para controle de acesso ZCC
- **Rotas protegidas**: `/zcc/*` e `/dashboard/*` — redirecionam para login se sem token

## Isolamento Multi-Tenant

Implementado em `src/lib/prisma.ts` com 4 técnicas combinadas:

1. **Middleware Prisma (`$extends`)** — Injeção automática de `propertyId` em toda query
2. **Tenant Context (`tenant-context.ts`)** — Extrai tenantId de session JWT ou header `X-Tenant-Id`
3. **Fail-Fast** — Se tenant não identificado, lança `UNAUTHORIZED_TENANT_ACCESS`
4. **Create isolation** — `propertyId` forçado em toda criação de registro

```typescript
// Exemplo: toda query read/write ganha where: { propertyId: tenantId }
findArgs.where = { ...findArgs.where, propertyId: tenantId }
```

## ENV Guardian

`src/lib/security/env-guardian.ts` + `scripts/secure-env.ts`

- **Seal/Unseal**: `.env` criptografado em `.env.encrypted` com AES-256-GCM
- **Chave mestra**: `ZEHLA_MASTER_KEY` (env) ou `.master-key` (arquivo, chmod 600)
- **Runtime masking**: valores sensíveis são mascarados em logs (`[REDACTED_DATABASE_URL]`)
- **Validação**: verifica DATABASE_URL, NEXTAUTH_SECRET, NEXTAUTH_URL, API keys de IA
- **Clean env**: variáveis críticas não propagadas para subprocessos
- **Comandos**: `npm run secure:seal`, `secure:unseal`, `secure:harden`, `secure:rotate`

## Webhook PIX

`src/lib/security/pix-webhook-guard.ts` — validação HMAC-SHA256 em **tempo constante** para:

- **Asaas**: header `asaas-signature`
- **Pagar.me**: header `x-hub-signature` com prefixo `sha256=`
- **MercadoPago**: header `x-signature`
- **OpenPix**: header `x-webhook-signature`

Usa `timingSafeEqual` do Node.js crypto para prevenir timing attacks.
