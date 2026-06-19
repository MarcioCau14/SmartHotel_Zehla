# ZEHLA — Arquitetura de Banco de Dados PostgreSQL

> **Versao:** 1.0.0 | **Data:** 2025-07-14
> **Projeto:** ZEHLA — Cognitive OS para Pousadas (SaaS Multi-Tenant)
> **Baseado em:** Estudo de Hiperescalabilidade do Instagram no PostgreSQL

---

## Indice

1. [Visao Geral da Arquitetura](#1-visao-geral-da-arquitetura)
2. [Decisoes Arquiteturais](#2-decisoes-arquiteturais)
3. [Schema PUBLIC (Dados Globais) — DDL Completo](#3-schema-public-dados-globais--ddl-completo)
4. [Schema por TENANT (Dados por Pousada) — DDL Completo](#4-schema-por-tenant-dados-por-pousada--ddl-completo)
5. [Funcoes PL/pgSQL](#5-funcoes-plpgsql)
6. [Configuracao PgBouncer](#6-configuracao-pgbouncer)
7. [Estrategia de Caching Redis](#7-estrategia-de-caching-redis)
8. [Indices Otimizados por Tabela](#8-indices-otimizados-por-tabela)
9. [Migracao SQLite → PostgreSQL](#9-migracao-sqlite--postgresql)
10. [Roadmap de Escalabilidade](#10-roadmap-de-escalabilidade)

---

## 1. Visao Geral da Arquitetura

### 1.1 Diagrama de Arquitetura ASCII

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        CAMADA DE APLICACAO (Next.js)                        │
│                                                                             │
│   ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────────┐  │
│   │ Prisma   │  │ API      │  │ Auth     │  │ AI/ZAOS  │  │ Background   │  │
│   │ Client   │  │ Routes   │  │ (JWT)    │  │ Router   │  │ Workers      │  │
│   └────┬─────┘  └────┬─────┘  └────┬─────┘  └────┬─────┘  └──────┬───────┘  │
│        │              │             │              │               │          │
│        └──────────────┴─────────────┴──────────────┴───────────────┘          │
│                                  │                                          │
│                          ┌───────┴───────┐                                  │
│                          │   PgBouncer   │                                  │
│                          │ (Transaction  │                                  │
│                          │  Pooling)     │                                  │
│                          └───────┬───────┘                                  │
└──────────────────────────────────┼──────────────────────────────────────────┘
                                   │
                    ┌──────────────┼──────────────────────┐
                    │              │                      │
              ┌─────┴─────┐  ┌────┴────┐  ┌──────────────┴───────────────┐
              │  PRIMARY  │  │  REDIS  │  │       READ REPLICA (async)     │
              │ PostgreSQL│  │  Cache  │  │                               │
              │  (R/W)    │  │         │  │  Relatorios, Analytics,        │
              │           │  │ Sessions│  │  Busca de hospedes,            │
              │ ┌───────┐ │  │ Rate    │  │  Dashboards                    │
              │ │ public │ │  │ Limit   │  │                               │
              │ │schema │ │  │ Booking │  │                               │
              │ ├───────┤ │  │ Counters│  │                               │
              │ │tenant │ │  │ Avail.  │  │                               │
              │ │_001   │ │  │ Cache   │  │                               │
              │ ├───────┤ │  │         │  │                               │
              │ │tenant │ │  │         │  │                               │
              │ │_002   │ │  │         │  │                               │
              │ ├───────┤ │  │         │  │                               │
              │ │ ...   │ │  │         │  │                               │
              │ ├───────┤ │  │         │  │                               │
              │ │tenant │ │  │         │  │                               │
              │ │_NNN   │ │  │         │  │                               │
              │ └───────┘ │  │         │  │                               │
              └───────────┘  └─────────┘  └───────────────────────────────┘
```

### 1.2 Separacao de Dados

| Escopo | Schema PostgreSQL | Descricao |
|--------|-------------------|-----------|
| **Global** | `public` | Usuarios, tenants, assinaturas, leads, campanhas, router de IA, auditoria |
| **Per-Pousada** | `tenant_XXX` (1 por pousada) | Propriedades, quartos, hospedes, reservas, conversas, conhecimento |

**Principio fundamental:** Cada pousada opera isoladamente dentro do seu proprio schema PostgreSQL. Isso permite:
- **Isolamento de dados:** Falha em um tenant nao afeta outros
- **Escalabilidade incremental:** Novos schemas sem mudanca de codigo
- **Backup granular:** Schema individual pode ser backup/restaurado
- **Compliance:** GDPR/LGPD por-tenant facilitado com `DROP SCHEMA`

### 1.3 Fluxo de Conexao

```
App (Next.js) → Prisma Client → PgBouncer (:6432) → PostgreSQL (:5432)

1. App define search_path = tenant_XXX antes de cada query
2. PgBouncer multiplexa 1500 conexoes de app → 50-100 conexoes reais no PG
3. Modo transaction pooling: conexao liberada ao final de cada transacao
4. Redis gerencia cache, sessions e rate limiting fora do path critico
```

---

## 2. Decisoes Arquiteturais

### 2.1 Schema-per-Tenant (Isolamento por Esquema)

**Decisao:** Cada pousada recebe seu proprio schema PostgreSQL (`tenant_001`, `tenant_002`, etc.), com DDL identico em todos.

**Justificativa (baseado no estudo do Instagram):**
- Instagram migrou 200M+ usuarios de sharding horizontal para schemas PostgreSQL
- Reduziu complexidade operacional em 10x comparado ao sharding na aplicacao
- Isolamento nativo sem VPNs ou bancos separados

**Vantagens:**

| Aspecto | Schema-per-Tenant | Row-Level Security | Banco Separado |
|---------|------------------|--------------------|--------------  |
| Isolamento real | ✅ | ⚠️ parcial | ✅ |
| Custo operacional | ✅ baixo | ✅ baixo | ❌ alto |
| Escalabilidade | ✅ alto | ❌ limitado | ✅ muito alto |
| Migracao por tenant | ✅ simples | ❌ complexo | ⚠️ medio |
| Backup individual | ✅ `pg_dump -n tenant_XXX` | ❌ nao | ✅ `pg_dump dbname` |
| Custo de infra | ✅ 1 servidor (N schemas) | ✅ 1 servidor | ❌ N servidores |

**Trade-off:** Um bug DDL afeta todos os tenants. Mitigacao com migrations versionadas e testes em schema de staging.

### 2.2 Snowflake IDs (BIGINT 64-bit)

**Decisao:** Substituir CUID/UUID por Snowflake IDs de 64 bits.

```
┌────────────────┬──────────────┬────────────┐
│   Timestamp    │   Shard ID   │  Sequence  │
│   41 bits      │   13 bits    │  10 bits   │
│  ~69 anos      │  0-8191      │  0-1023    │
│  (ms desde     │  (identifica │  (auto-     │
│   epoch custom)│   tenant/    │   incre-    │
│                │   shard)     │   mento)    │
└────────────────┴──────────────┴────────────┘
         ← 63 bits usados →    1 bit sinal (0)
```

**Propriedades:**
- **Time-ordered:** IDs crescentes = sem page splits em B-tree (diferente de UUIDs randomicos)
- **50% menores:** BIGINT (8 bytes) vs UUID (16 bytes) = indices 50% menores
- **Globalmente unicos:** Sem colisao entre tenants (shard_id diferente por tenant)
- **Extraiveis:** Timestamp, tenant e sequencia sao decodificaveis do ID

**Comparacao de tamanho de indice:**

| Tipo de ID | Tamanho | Indice (10M rows) |
|------------|--------|--------------------|
| UUID       | 16 bytes | ~320 MB           |
| CUID       | 25+ bytes (string) | ~500+ MB  |
| Snowflake  | 8 bytes  | ~160 MB           |

### 2.3 PgBouncer (Connection Pooling)

**Decisao:** Toda conexao da aplicacao passa pelo PgBouncer em modo `transaction pooling`.

```
┌─────────────────┐         ┌──────────────────┐
│  1500 conexoes   │  ──→    │  PgBouncer       │
│  de aplicacao    │         │  max_client_conn │
│  (server_nextjs) │         └────────┬─────────┘
└─────────────────┘                   │
                               ┌──────┴──────┐
                               │  50-100     │
                               │  conexoes   │
                               │  reais no PG│
                               │  pool_size  │
                               └──────┬──────┘
                                      │
                               ┌──────┴──────┐
                               │ PostgreSQL  │
                               │ max_conn    │
                               └─────────────┘
```

**Por que transaction pooling (nao session pooling):**
- Prisma usa prepared statements — session pooling quebra por nao manter estado entre conexoes diferentes
- Transaction pooling libera conexao ao COMMIT/ROLLBACK, nao ao final da session
- Compativel com `search_path` definido por transacao via `SET LOCAL search_path`

### 2.4 Partial Indexes (Indices Parciais)

**Decisao:** Indices condicionais em colunas de alta cardinalidade com filtros comuns.

| Tabela | Indice Parcial | Filtro | Reducao estimada |
|--------|---------------|--------|-----------------|
| `bookings` | `(tenant_id, check_in)` | `WHERE check_out >= CURRENT_DATE` | ~70% (reservas ativas apenas) |
| `guest_messages` | `(guest_id, timestamp)` | `WHERE created_at > NOW() - INTERVAL '90 days'` | ~80% |
| `notifications` | `(tenant_id, created_at)` | `WHERE read = false` | ~90% |
| `audit_logs` | `(tenant_id, created_at)` | `WHERE created_at > NOW() - INTERVAL '30 days'` | ~95% |

**Impacto:** Indices 5-10x menores, scans mais rapidos, menos I/O.

### 2.5 Functional Indexes (Indices Funcionais)

**Decisao:** Indices em expressoes para buscas case-insensitive e normalizadas.

```sql
-- Lookup case-insensitive de email
CREATE INDEX idx_users_email_lower ON users (lower(trim(email)));

-- Lookup normalizado de telefone (remove espacos e caracteres especiais)
CREATE INDEX idx_tenants_phone_normalized ON tenants (regexp_replace(phone, '[^0-9]', '', 'g'));

-- Busca por nome normalizado (sem acentos)
CREATE INDEX idx_guests_name_normalized ON guests (
  unaccent(lower(trim(name)))
);
```

### 2.6 Redis Caching (Cache em Memoria)

**Decisao:** Redis como camada de cache para dados quentes e rate limiting.

```
Redis
├── Sessions           →  zehla:session:{token}        TTL: 24h
├── Availability       →  zehla:avail:{tenant}:{dates}  TTL: 5min
├── Booking Counters   →  zehla:bookings:{tenant}       TTL: 1h
├── Rate Limiting      →  zehla:rl:{ip}:{endpoint}     TTL: 1min
├── Feature Flags      →  zehla:ff:{flag_name}          TTL: 10min
└── AI Router State    →  zehla:router:{provider}       TTL: 30s
```

---

## 3. Schema PUBLIC (Dados Globais) — DDL Completo

> Todas as tabelas residem no schema `public` e contem dados compartilhados entre tenants.
> IDs utilizam BIGINT gerado pela funcao `snowflake_id()`.

### 3.1 Enumeracoes (Tipos Personalizados)

```sql
-- ====================================================================
-- ENUMERACOES GLOBAIS
-- ====================================================================

CREATE TYPE user_role AS ENUM ('client', 'admin');
CREATE TYPE tenant_role AS ENUM ('owner', 'admin', 'staff');
CREATE TYPE tenant_plan AS ENUM ('trial', 'starter', 'pro', 'business');
CREATE TYPE tenant_status AS ENUM ('active', 'suspended', 'churned');
CREATE TYPE subscription_plan AS ENUM ('gratuito', 'lite', 'pro', 'max');
CREATE TYPE subscription_status AS ENUM ('pending', 'active', 'canceled', 'expired');
CREATE TYPE payment_method AS ENUM ('pix', 'cartao');
CREATE TYPE payment_status AS ENUM ('pending', 'approved', 'rejected', 'refunded');
CREATE TYPE lead_status AS ENUM ('pending', 'verified', 'contacted', 'converted', 'lost');
CREATE TYPE lead_size AS ENUM ('pequeno', 'medio', 'grande');
CREATE TYPE target_status AS ENUM ('active', 'pending', 'inactive', 'prospected');
CREATE TYPE campaign_type AS ENUM ('whatsapp', 'email', 'ads', 'multi');
CREATE TYPE campaign_status AS ENUM ('draft', 'active', 'paused', 'completed', 'cancelled');
CREATE TYPE provider_name AS ENUM ('openrouter', 'anthropic', 'ollama', 'groq', 'gemini');
CREATE TYPE provider_tier AS ENUM ('1', '2', '3');
CREATE TYPE circuit_status AS ENUM ('closed', 'half_open', 'open');
CREATE TYPE budget_level AS ENUM ('nominal', 'warning', 'critical');
CREATE TYPE alert_type AS ENUM ('injection', 'rls_violation', 'rate_limit', 'suspicious');
CREATE TYPE alert_severity AS ENUM ('low', 'medium', 'high', 'critical');
CREATE TYPE swipe_category AS ENUM ('prospeccao', 'follow-up', 'conversao', 'reativacao');
CREATE TYPE trend_direction AS ENUM ('rising', 'falling', 'stable', 'breakout');
CREATE TYPE trend_source AS ENUM ('google_trends', 'social', 'booking', 'tripadvisor');
CREATE TYPE agent_status AS ENUM ('success', 'error', 'timeout');
```

### 3.2 Tabela: `users`

```sql
-- ====================================================================
-- USERS: Autenticacao e identidade de usuarios da plataforma
-- ====================================================================
CREATE TABLE users (
    id              BIGINT       PRIMARY KEY DEFAULT snowflake_id(),
    email           VARCHAR(255) NOT NULL,
    name            VARCHAR(255) NOT NULL,
    password_hash   VARCHAR(255),
    role            user_role    NOT NULL DEFAULT 'client',
    created_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW(),

    CONSTRAINT uq_users_email UNIQUE (email)
);

-- Indice funcional para lookup case-insensitive
CREATE INDEX idx_users_email_lower ON users (lower(trim(email)));

-- Trigger para updated_at automatico
CREATE TRIGGER trg_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

COMMENT ON TABLE users IS 'Usuarios da plataforma ZEHLA (global)';
COMMENT ON COLUMN users.id IS 'Snowflake ID 64-bit (time-ordered)';
COMMENT ON COLUMN users.email IS 'Email unico, case-insensitive';
COMMENT ON COLUMN users.password_hash IS 'Hash bcrypt, NULL para auth OAuth';
COMMENT ON COLUMN users.role IS 'client = pousadeiro | admin = staff ZEHLA';
```

### 3.3 Tabela: `tenants`

```sql
-- ====================================================================
-- TENANTS: Pousadas/Hotels cadastrados na plataforma
-- ====================================================================
CREATE TABLE tenants (
    id               BIGINT       PRIMARY KEY DEFAULT snowflake_id(),
    name             VARCHAR(255) NOT NULL,
    email            VARCHAR(255) NOT NULL,
    password_hash    VARCHAR(255) NOT NULL,
    phone            VARCHAR(30),
    phone_alt        VARCHAR(30),              -- WhatsApp atendimento ao hospede
    role             tenant_role  NOT NULL DEFAULT 'owner',
    plan             tenant_plan  NOT NULL DEFAULT 'trial',
    status           tenant_status NOT NULL DEFAULT 'active',
    trial_start      TIMESTAMPTZ,
    trial_end        TIMESTAMPTZ,
    subscription_at   TIMESTAMPTZ,
    schema_name      VARCHAR(63)  NOT NULL,    -- Nome do schema PostgreSQL (tenant_XXX)
    user_id          BIGINT       UNIQUE,
    created_at       TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at       TIMESTAMPTZ  NOT NULL DEFAULT NOW(),

    CONSTRAINT uq_tenants_email UNIQUE (email),
    CONSTRAINT uq_tenants_schema_name UNIQUE (schema_name),
    CONSTRAINT fk_tenants_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX idx_tenants_status ON tenants (status);
CREATE INDEX idx_tenants_plan ON tenants (plan);
CREATE INDEX idx_tenants_phone_normalized ON tenants (regexp_replace(phone, '[^0-9]', '', 'g'));

CREATE TRIGGER trg_tenants_updated_at
    BEFORE UPDATE ON tenants
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

COMMENT ON TABLE tenants IS 'Pousadas cadastradas (global). Cada tenant tem schema proprio.';
COMMENT ON COLUMN tenants.schema_name IS 'Schema PostgreSQL correspondente (tenant_001, tenant_002...)';
```

### 3.4 Tabela: `subscriptions`

```sql
-- ====================================================================
-- SUBSCRIPTIONS: Assinaturas e planos de pagamento
-- ====================================================================
CREATE TABLE subscriptions (
    id                   BIGINT             PRIMARY KEY DEFAULT snowflake_id(),
    tenant_id            BIGINT             NOT NULL,
    plan_type            subscription_plan  NOT NULL,
    status               subscription_status NOT NULL DEFAULT 'pending',
    payment_method       payment_method    NOT NULL,
    amount               NUMERIC(10,2)      NOT NULL,
    payment_id           VARCHAR(255),      -- Mercado Pago / Stripe payment ID
    payment_status       payment_status,
    checkout_url         TEXT,
    trial_start          TIMESTAMPTZ,
    trial_end            TIMESTAMPTZ,
    current_period_start TIMESTAMPTZ,
    current_period_end   TIMESTAMPTZ,
    cancel_at_period_end BOOLEAN            NOT NULL DEFAULT FALSE,
    created_at           TIMESTAMPTZ        NOT NULL DEFAULT NOW(),
    updated_at           TIMESTAMPTZ        NOT NULL DEFAULT NOW(),

    CONSTRAINT uq_subscriptions_tenant UNIQUE (tenant_id),
    CONSTRAINT fk_subscriptions_tenant FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE
);

CREATE INDEX idx_subscriptions_status ON subscriptions (status);
CREATE INDEX idx_subscriptions_period_end ON subscriptions (current_period_end)
    WHERE status = 'active';

CREATE TRIGGER trg_subscriptions_updated_at
    BEFORE UPDATE ON subscriptions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

### 3.5 Tabela: `payment_transactions`

```sql
-- ====================================================================
-- PAYMENT_TRANSACTIONS: Historico de transacoes financeiras
-- ====================================================================
CREATE TABLE payment_transactions (
    id              BIGINT         PRIMARY KEY DEFAULT snowflake_id(),
    subscription_id BIGINT         NOT NULL,
    amount          NUMERIC(10,2)  NOT NULL,
    status          payment_status NOT NULL,
    payment_method  payment_method NOT NULL,
    external_id     VARCHAR(255),   -- ID externo (Mercado Pago / Stripe)
    metadata        JSONB          NOT NULL DEFAULT '{}',
    created_at      TIMESTAMPTZ    NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ    NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_paytrans_subscription FOREIGN KEY (subscription_id)
        REFERENCES subscriptions(id) ON DELETE CASCADE
);

CREATE INDEX idx_paytrans_status ON payment_transactions (status);
CREATE INDEX idx_paytrans_created ON payment_transactions (created_at DESC);

CREATE TRIGGER trg_payment_transactions_updated_at
    BEFORE UPDATE ON payment_transactions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

### 3.6 Tabela: `leads`

```sql
-- ====================================================================
-- LEADS: Prospecção Lessie AI — pousadas-alvo
-- ====================================================================
CREATE TABLE leads (
    id                BIGINT      PRIMARY KEY DEFAULT snowflake_id(),
    empresa           VARCHAR(255) NOT NULL,
    decisor          VARCHAR(255) NOT NULL DEFAULT '',
    cargo            VARCHAR(255) NOT NULL DEFAULT '',
    email            VARCHAR(255) NOT NULL,
    whatsapp         VARCHAR(30)  NOT NULL DEFAULT '',
    setor            VARCHAR(100) NOT NULL DEFAULT 'hospitalidade',
    social_media     JSONB        NOT NULL DEFAULT '{}',
    porte            lead_size    NOT NULL DEFAULT 'pequeno',
    status           lead_status  NOT NULL DEFAULT 'pending',
    hook             TEXT         NOT NULL DEFAULT '',      -- Script personalizado
    validation_score NUMERIC(5,2) NOT NULL DEFAULT 0,
    social_footprint JSONB        NOT NULL DEFAULT '{}',
    metadata         JSONB        NOT NULL DEFAULT '{}',
    target_id        BIGINT,

    created_at       TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at       TIMESTAMPTZ  NOT NULL DEFAULT NOW(),

    CONSTRAINT uq_leads_email UNIQUE (email),
    CONSTRAINT fk_leads_target FOREIGN KEY (target_id) REFERENCES targets(id) ON DELETE SET NULL
);

CREATE INDEX idx_leads_status ON leads (status);
CREATE INDEX idx_leads_porte ON leads (porte);
CREATE INDEX idx_leads_validation_score ON leads (validation_score DESC);

CREATE TRIGGER trg_leads_updated_at
    BEFORE UPDATE ON leads
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

### 3.7 Tabela: `targets`

```sql
-- ====================================================================
-- TARGETS: Pousadas sob mira para prospeccao
-- ====================================================================
CREATE TABLE targets (
    id         BIGINT       PRIMARY KEY DEFAULT snowflake_id(),
    name       VARCHAR(255) NOT NULL,
    domain     VARCHAR(255) NOT NULL,
    website    TEXT,
    city       VARCHAR(100) NOT NULL DEFAULT '',
    state      VARCHAR(2)   NOT NULL DEFAULT '',   -- UF (SP, RJ, etc.)
    status     target_status NOT NULL DEFAULT 'active',
    priority  SMALLINT     NOT NULL DEFAULT 5 CHECK (priority BETWEEN 1 AND 10),

    created_at TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ   NOT NULL DEFAULT NOW(),

    CONSTRAINT uq_targets_domain UNIQUE (domain)
);

CREATE INDEX idx_targets_status ON targets (status);
CREATE INDEX idx_targets_priority ON targets (priority DESC);
CREATE INDEX idx_targets_location ON targets (state, city);

CREATE TRIGGER trg_targets_updated_at
    BEFORE UPDATE ON targets
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

### 3.8 Tabela: `campaigns`

```sql
-- ====================================================================
-- CAMPAIGNS: Orquestracao multicanal de marketing
-- ====================================================================
CREATE TABLE campaigns (
    id               BIGINT          PRIMARY KEY DEFAULT snowflake_id(),
    name             VARCHAR(255)    NOT NULL,
    type             campaign_type   NOT NULL DEFAULT 'whatsapp',
    status           campaign_status NOT NULL DEFAULT 'draft',
    target_audience  VARCHAR(50)     NOT NULL DEFAULT 'all',
    message_template TEXT            NOT NULL DEFAULT '',
    scheduled_at     TIMESTAMPTZ,
    started_at       TIMESTAMPTZ,
    completed_at     TIMESTAMPTZ,
    total_sent       INTEGER         NOT NULL DEFAULT 0,
    total_delivered  INTEGER         NOT NULL DEFAULT 0,
    total_read       INTEGER         NOT NULL DEFAULT 0,
    total_replied    INTEGER         NOT NULL DEFAULT 0,
    metadata         JSONB           NOT NULL DEFAULT '{}',

    created_at       TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    updated_at       TIMESTAMPTZ     NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_campaigns_status ON campaigns (status);
CREATE INDEX idx_campaigns_scheduled ON campaigns (scheduled_at)
    WHERE status IN ('draft', 'active');
CREATE INDEX idx_campaigns_type ON campaigns (type);

CREATE TRIGGER trg_campaigns_updated_at
    BEFORE UPDATE ON campaigns
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

### 3.9 Tabela: `router_providers`

```sql
-- ====================================================================
-- ROUTER_PROVIDERS: Estado do NeuroRouter (ZAOS) — Thompson Sampling
-- ====================================================================
CREATE TABLE router_providers (
    id                BIGINT           PRIMARY KEY DEFAULT snowflake_id(),
    provider          provider_name   NOT NULL,
    model_name        VARCHAR(255)     NOT NULL,
    tier              provider_tier    NOT NULL DEFAULT '3',
    alpha             NUMERIC(8,4)    NOT NULL DEFAULT 1.0,  -- Thompson Beta posterior
    beta              NUMERIC(8,4)    NOT NULL DEFAULT 1.0,
    circuit_status    circuit_status  NOT NULL DEFAULT 'closed',
    last_failure_at   TIMESTAMPTZ,
    failure_count     INTEGER          NOT NULL DEFAULT 0,
    success_count     INTEGER          NOT NULL DEFAULT 0,
    avg_latency_ms    INTEGER          NOT NULL DEFAULT 0,
    cost_per_1k_input NUMERIC(10,4)   NOT NULL DEFAULT 0,
    cost_per_1k_output NUMERIC(10,4)  NOT NULL DEFAULT 0,
    is_active         BOOLEAN          NOT NULL DEFAULT TRUE,
    supports_json     BOOLEAN          NOT NULL DEFAULT FALSE,
    supports_tools    BOOLEAN          NOT NULL DEFAULT FALSE,
    max_context_tokens INTEGER          NOT NULL DEFAULT 8192,

    created_at        TIMESTAMPTZ      NOT NULL DEFAULT NOW(),
    updated_at        TIMESTAMPTZ      NOT NULL DEFAULT NOW(),

    CONSTRAINT uq_router_providers_provider UNIQUE (provider)
);

CREATE INDEX idx_router_active ON router_providers (is_active)
    WHERE is_active = TRUE;

CREATE TRIGGER trg_router_providers_updated_at
    BEFORE UPDATE ON router_providers
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

COMMENT ON TABLE router_providers IS 'Estado do NeuroRouter ZAOS para selecao de providers via Thompson Sampling';
COMMENT ON COLUMN router_providers.alpha IS 'Posterior Beta(α) para Thompson Sampling — alpha += 1 a cada sucesso';
COMMENT ON COLUMN router_providers.beta IS 'Posterior Beta(β) para Thompson Sampling — beta += 1 a cada falha';
```

### 3.10 Tabela: `budget_guard_state`

```sql
-- ====================================================================
-- BUDGET_GUARD_STATE: Limite diario/mensal de gastos com IA
-- ====================================================================
CREATE TABLE budget_guard_state (
    id               BIGINT       PRIMARY KEY DEFAULT snowflake_id(),
    date             DATE         NOT NULL,
    daily_spend_usd  NUMERIC(10,4) NOT NULL DEFAULT 0,
    daily_budget_usd NUMERIC(10,4) NOT NULL DEFAULT 50.0,
    monthly_spend_usd NUMERIC(12,4) NOT NULL DEFAULT 0,
    monthly_budget_usd NUMERIC(12,4) NOT NULL DEFAULT 1500.0,
    critical_level   budget_level NOT NULL DEFAULT 'nominal',

    created_at       TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at       TIMESTAMPTZ  NOT NULL DEFAULT NOW(),

    CONSTRAINT uq_budget_guard_date UNIQUE (date)
);

CREATE INDEX idx_budget_critical ON budget_guard_state (critical_level)
    WHERE critical_level != 'nominal';

CREATE TRIGGER trg_budget_guard_state_updated_at
    BEFORE UPDATE ON budget_guard_state
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

### 3.11 Tabela: `agent_logs`

```sql
-- ====================================================================
-- AGENT_LOGS: Registro de acoes dos agentes de IA
-- ====================================================================
CREATE TABLE agent_logs (
    id             BIGINT       PRIMARY KEY DEFAULT snowflake_id(),
    agent_id       VARCHAR(50)  NOT NULL DEFAULT 'lessie',
    action         VARCHAR(255) NOT NULL,
    input_tokens   INTEGER      NOT NULL DEFAULT 0,
    output_tokens  INTEGER      NOT NULL DEFAULT 0,
    latency_ms     INTEGER      NOT NULL DEFAULT 0,
    cost_usd       NUMERIC(10,6) NOT NULL DEFAULT 0,
    status         agent_status NOT NULL DEFAULT 'success',
    error_msg      TEXT         NOT NULL DEFAULT '',
    metadata       JSONB        NOT NULL DEFAULT '{}',

    created_at     TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- Indice parcial: erros recentes para monitoramento
CREATE INDEX idx_agent_logs_errors ON agent_logs (created_at DESC)
    WHERE status IN ('error', 'timeout');

-- Indice por agente para metricas por agente
CREATE INDEX idx_agent_logs_agent_time ON agent_logs (agent_id, created_at DESC);

-- Indice parcial: custo acumulado diario
CREATE INDEX idx_agent_logs_daily_cost ON agent_logs (created_at)
    WHERE cost_usd > 0;

COMMENT ON TABLE agent_logs IS 'Log de todas as chamadas aos agentes de IA (Lessie, ZAOS, etc.)';
```

### 3.12 Tabela: `security_alerts`

```sql
-- ====================================================================
-- SECURITY_ALERTS: Alertas de seguranca e deteccao de ameacas
-- ====================================================================
CREATE TABLE security_alerts (
    id           BIGINT         PRIMARY KEY DEFAULT snowflake_id(),
    type         alert_type      NOT NULL,
    severity     alert_severity  NOT NULL DEFAULT 'medium',
    description  TEXT           NOT NULL,
    source       TEXT           NOT NULL DEFAULT '',   -- IP, User-Agent, etc.
    resolved     BOOLEAN        NOT NULL DEFAULT FALSE,
    resolved_at  TIMESTAMPTZ,

    created_at   TIMESTAMPTZ     NOT NULL DEFAULT NOW()
);

-- Indice parcial: alertas nao resolvidos (query mais frequente)
CREATE INDEX idx_security_unresolved ON security_alerts (severity DESC, created_at DESC)
    WHERE resolved = FALSE;

-- Indice parcial: alertas criticos (sempre monitorados)
CREATE INDEX idx_security_critical ON security_alerts (created_at DESC)
    WHERE severity IN ('high', 'critical') AND resolved = FALSE;

COMMENT ON TABLE security_alerts IS 'Alertas de seguranca: injection, RLS violation, rate limit, suspicious';
```

### 3.13 Tabela: `swipe_templates`

```sql
-- ====================================================================
-- SWIPE_TEMPLATES: Templates de mensagens WhatsApp para prospeccao
-- ====================================================================
CREATE TABLE swipe_templates (
    id           BIGINT          PRIMARY KEY DEFAULT snowflake_id(),
    name         VARCHAR(255)    NOT NULL,
    category     swipe_category  NOT NULL DEFAULT 'prospeccao',
    content      TEXT            NOT NULL,
    variables    JSONB           NOT NULL DEFAULT '[]',
    success_rate NUMERIC(5,2)    NOT NULL DEFAULT 0,  -- % de conversao historica
    usage_count  INTEGER         NOT NULL DEFAULT 0,
    is_active    BOOLEAN         NOT NULL DEFAULT TRUE,

    created_at   TIMESTAMPTZ      NOT NULL DEFAULT NOW(),
    updated_at   TIMESTAMPTZ      NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_swipe_category ON swipe_templates (category);
CREATE INDEX idx_swipe_active ON swipe_templates (is_active, success_rate DESC)
    WHERE is_active = TRUE;

CREATE TRIGGER trg_swipe_templates_updated_at
    BEFORE UPDATE ON swipe_templates
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

### 3.14 Tabela: `trend_keywords`

```sql
-- ====================================================================
-- TREND_KEYWORDS: Palavras-chave de tendencias do setor hoteleiro
-- ====================================================================
CREATE TABLE trend_keywords (
    id         BIGINT         PRIMARY KEY DEFAULT snowflake_id(),
    keyword    VARCHAR(255)   NOT NULL,
    category   VARCHAR(100)   NOT NULL DEFAULT 'hotelaria',
    source     trend_source   NOT NULL DEFAULT 'google_trends',
    score      NUMERIC(5,2)   NOT NULL DEFAULT 0,  -- Popularidade 0-100
    trend      trend_direction NOT NULL DEFAULT 'stable',

    created_at TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ     NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_trends_keyword ON trend_keywords (keyword);
CREATE INDEX idx_trends_score ON trend_keywords (score DESC);
CREATE INDEX idx_trends_trending ON trend_keywords (score DESC)
    WHERE trend IN ('rising', 'breakout');

CREATE TRIGGER trg_trend_keywords_updated_at
    BEFORE UPDATE ON trend_keywords
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

### 3.15 Tabela: `trend_data_points`

```sql
-- ====================================================================
-- TREND_DATA_POINTS: Serie historica de pontos de tendencia
-- ====================================================================
CREATE TABLE trend_data_points (
    id         BIGINT      PRIMARY KEY DEFAULT snowflake_id(),
    keyword_id BIGINT      NOT NULL,
    date       DATE        NOT NULL,
    value      NUMERIC(8,4) NOT NULL,
    source     VARCHAR(50) NOT NULL DEFAULT '',

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_tdp_keyword FOREIGN KEY (keyword_id)
        REFERENCES trend_keywords(id) ON DELETE CASCADE,
    CONSTRAINT uq_tdp_keyword_date UNIQUE (keyword_id, date)
);

CREATE INDEX idx_tdp_date ON trend_data_points (date DESC);
```

### 3.16 Tabela: `audit_logs`

```sql
-- ====================================================================
-- AUDIT_LOGS: Registro de auditoria (global)
-- ====================================================================
CREATE TYPE audit_action AS ENUM ('create', 'read', 'update', 'delete', 'login', 'logout', 'config_change');

CREATE TABLE audit_logs (
    id         BIGINT       PRIMARY KEY DEFAULT snowflake_id(),
    tenant_id  BIGINT       NOT NULL,
    action     audit_action NOT NULL,
    details    JSONB        NOT NULL DEFAULT '{}',
    ip_address INET,
    user_agent TEXT,

    created_at TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- Indice parcial: logs dos ultimos 30 dias (query mais frequente)
CREATE INDEX idx_audit_recent ON audit_logs (tenant_id, created_at DESC)
    WHERE created_at > NOW() - INTERVAL '30 days';

-- Indice por tipo de acao
CREATE INDEX idx_audit_action ON audit_logs (action, created_at DESC);
```

### 3.17 Tabela: `system_config`

```sql
-- ====================================================================
-- SYSTEM_CONFIG: Configuracoes globais do sistema (chave-valor)
-- ====================================================================
CREATE TABLE system_config (
    id         BIGINT       PRIMARY KEY DEFAULT snowflake_id(),
    key        VARCHAR(255) NOT NULL,
    value      JSONB        NOT NULL DEFAULT '{}',
    description TEXT        NOT NULL DEFAULT '',
    is_secret  BOOLEAN      NOT NULL DEFAULT FALSE,  -- Valores sensiveis (chaves API)

    created_at TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ  NOT NULL DEFAULT NOW(),

    CONSTRAINT uq_system_config_key UNIQUE (key)
);

CREATE TRIGGER trg_system_config_updated_at
    BEFORE UPDATE ON system_config
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

---

## 4. Schema por TENANT (Dados por Pousada) — DDL Completo

> Cada pousada recebe um schema identico com prefixo `tenant_XXX`.
> Todas as tabelas abaixo sao criadas por `create_tenant_schema()`.
> **Nota:** Não há coluna `tenant_id` nestas tabelas — o schema ja isola o tenant.

### 4.1 Enumeracoes por Tenant

```sql
-- ====================================================================
-- ENUMERACOES PER-TENANT (criadas dentro de cada schema)
-- ====================================================================

CREATE TYPE room_status AS ENUM ('disponivel', 'ocupado', 'sujo', 'manutencao', 'reservado');
CREATE TYPE room_type AS ENUM ('standard', 'luxo', 'suite', 'chale');
CREATE TYPE property_type AS ENUM ('pousada', 'hotel', 'hostel', 'chale', 'resort');
CREATE TYPE pix_key_type AS ENUM ('cpf', 'email', 'phone', 'random');
CREATE TYPE bank_account_type AS ENUM ('cc', 'cp');
CREATE TYPE guest_status AS ENUM ('new', 'warm', 'hot', 'booked', 'staying', 'checked_out', 'lost', 'inactive');
CREATE TYPE guest_source AS ENUM ('whatsapp', 'instagram', 'booking', 'airbnb', 'direct', 'referral');
CREATE TYPE message_sender AS ENUM ('guest', 'ai', 'human');
CREATE TYPE message_type AS ENUM ('text', 'image', 'audio', 'document');
CREATE TYPE message_sentiment AS ENUM ('positive', 'neutral', 'negative');
CREATE TYPE booking_status AS ENUM ('pending', 'confirmed', 'checked_in', 'checked_out', 'cancelled', 'no_show');
CREATE TYPE booking_payment_status AS ENUM ('pending', 'paid', 'partial', 'overdue');
CREATE TYPE booking_source AS ENUM ('whatsapp_ai', 'whatsapp_human', 'booking', 'airbnb', 'direct');
CREATE TYPE conversation_status AS ENUM ('active', 'resolved', 'escalated', 'abandoned');
CREATE TYPE knowledge_category AS ENUM ('pricing', 'rooms', 'amenities', 'policies', 'location', 'activities', 'food', 'custom');
CREATE TYPE knowledge_priority AS ENUM ('low', 'medium', 'high', 'critical');
CREATE TYPE knowledge_audience AS ENUM ('ai', 'human', 'both');
CREATE TYPE prompt_type AS ENUM ('persona', 'response', 'escalation', 'proactive');
CREATE TYPE notification_type AS ENUM ('booking', 'payment', 'escalation', 'system', 'alert', 'achievement');
CREATE TYPE notification_priority AS ENUM ('low', 'medium', 'high', 'urgent');
CREATE TYPE quick_action_category AS ENUM ('booking', 'communication', 'analytics', 'settings', 'emergency');
```

### 4.2 Tabela: `properties`

```sql
-- ====================================================================
-- PROPERTIES: Dados cadastrais da pousada
-- ====================================================================
CREATE TABLE properties (
    id               BIGINT         PRIMARY KEY DEFAULT snowflake_id(),
    name             VARCHAR(255)   NOT NULL,
    document         VARCHAR(20),                    -- CNPJ/CPF
    street           VARCHAR(255)   NOT NULL DEFAULT '',
    number           VARCHAR(20)    NOT NULL DEFAULT '',
    neighborhood     VARCHAR(100)   NOT NULL DEFAULT '',
    city             VARCHAR(100)   NOT NULL DEFAULT '',
    state            VARCHAR(2)     NOT NULL DEFAULT '',   -- UF
    zip_code         VARCHAR(10)    NOT NULL DEFAULT '',
    type             property_type  NOT NULL DEFAULT 'pousada',
    website          TEXT,
    description      TEXT           NOT NULL DEFAULT '',
    services         JSONB          NOT NULL DEFAULT '[]',     -- Array de servicos
    payment_methods  JSONB          NOT NULL DEFAULT '[]',     -- Array de metodos de pagamento
    pix_key          VARCHAR(255),
    pix_key_type     pix_key_type   NOT NULL DEFAULT 'cpf',
    bank_name        VARCHAR(100),
    bank_agency      VARCHAR(20),
    bank_account     VARCHAR(30),
    bank_account_type bank_account_type,
    bank_cpf         VARCHAR(20),

    created_at       TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    updated_at       TIMESTAMPTZ     NOT NULL DEFAULT NOW()
);

CREATE TRIGGER trg_properties_updated_at
    BEFORE UPDATE ON properties
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

COMMENT ON TABLE properties IS 'Dados cadastrais da pousada (1 registro por tenant)';
```

### 4.3 Tabela: `rooms`

```sql
-- ====================================================================
-- ROOMS: Quartos da pousada
-- ====================================================================
CREATE TABLE rooms (
    id          BIGINT      PRIMARY KEY DEFAULT snowflake_id(),
    property_id BIGINT      NOT NULL,
    name        VARCHAR(255) NOT NULL,
    type        room_type   NOT NULL DEFAULT 'standard',
    capacity    SMALLINT    NOT NULL DEFAULT 2 CHECK (capacity > 0),
    price       NUMERIC(10,2) NOT NULL DEFAULT 150.00,
    status      room_status NOT NULL DEFAULT 'disponivel',

    created_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_rooms_property FOREIGN KEY (property_id)
        REFERENCES properties(id) ON DELETE CASCADE
);

CREATE INDEX idx_rooms_status ON rooms (status);
CREATE INDEX idx_rooms_type ON rooms (type);
CREATE INDEX idx_rooms_property ON rooms (property_id);
-- Indice parcial: quartos disponiveis (query mais frequente para disponibilidade)
CREATE INDEX idx_rooms_available ON rooms (price, capacity)
    WHERE status = 'disponivel';

CREATE TRIGGER trg_rooms_updated_at
    BEFORE UPDATE ON rooms
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

### 4.4 Tabela: `api_configs`

```sql
-- ====================================================================
-- API_CONFIGS: Chaves de API dos providers de IA (por pousada)
-- ====================================================================
CREATE TABLE api_configs (
    id            BIGINT       PRIMARY KEY DEFAULT snowflake_id(),
    provider      VARCHAR(50)  NOT NULL,   -- gemini | openai | groq | huggingface | anthropic | zai_sdk
    api_key       TEXT         NOT NULL DEFAULT '',   -- Armazenamento criptografado
    api_secret    TEXT         NOT NULL DEFAULT '',
    model         VARCHAR(255) NOT NULL DEFAULT '',
    base_url      TEXT         NOT NULL DEFAULT '',
    is_active     BOOLEAN      NOT NULL DEFAULT FALSE,
    usage_limit   INTEGER      NOT NULL DEFAULT 0,    -- 0 = ilimitado
    usage_current INTEGER      NOT NULL DEFAULT 0,
    notes         TEXT         NOT NULL DEFAULT '',

    created_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW(),

    CONSTRAINT uq_api_configs_provider UNIQUE (provider)
);

CREATE INDEX idx_api_active ON api_configs (is_active)
    WHERE is_active = TRUE;

CREATE TRIGGER trg_api_configs_updated_at
    BEFORE UPDATE ON api_configs
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

COMMENT ON TABLE api_configs IS 'Chaves de API dos providers de IA. Valores criptografados em repouso.';
```

### 4.5 Tabela: `agent_configs`

```sql
-- ====================================================================
-- AGENT_CONFIGS: Configuracao dos agentes de IA por pousada
-- ====================================================================
CREATE TABLE agent_configs (
    id                BIGINT       PRIMARY KEY DEFAULT snowflake_id(),
    agent_id          VARCHAR(20)  NOT NULL,   -- agent-1 through agent-8
    agent_name        VARCHAR(100) NOT NULL,   -- Recepcionista, Concierge, etc.
    system_prompt     TEXT         NOT NULL DEFAULT '',
    is_active         BOOLEAN      NOT NULL DEFAULT TRUE,
    temperature       NUMERIC(3,2) NOT NULL DEFAULT 0.70,
    max_tokens        INTEGER      NOT NULL DEFAULT 2048,
    custom_knowledge  JSONB        NOT NULL DEFAULT '[]',
    learned_patterns  INTEGER      NOT NULL DEFAULT 0,
    confidence_score  NUMERIC(5,2) NOT NULL DEFAULT 0,

    created_at        TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at        TIMESTAMPTZ  NOT NULL DEFAULT NOW(),

    CONSTRAINT uq_agent_configs_id UNIQUE (agent_id)
);

CREATE INDEX idx_agent_configs_active ON agent_configs (is_active)
    WHERE is_active = TRUE;

CREATE TRIGGER trg_agent_configs_updated_at
    BEFORE UPDATE ON agent_configs
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

### 4.6 Tabela: `guests`

```sql
-- ====================================================================
-- GUESTS: CRM de hospedes
-- ====================================================================
CREATE TABLE guests (
    id                 BIGINT       PRIMARY KEY DEFAULT snowflake_id(),
    name               VARCHAR(255) NOT NULL,
    phone              VARCHAR(30)  NOT NULL,
    email              VARCHAR(255),
    status             guest_status NOT NULL DEFAULT 'new',
    avatar             TEXT,
    source             guest_source NOT NULL DEFAULT 'whatsapp',
    value              NUMERIC(10,2) NOT NULL DEFAULT 0,
    last_contact       TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    check_in           TIMESTAMPTZ,
    check_out          TIMESTAMPTZ,
    room               VARCHAR(100),
    ai_score           SMALLINT     NOT NULL DEFAULT 50 CHECK (ai_score BETWEEN 0 AND 100),
    notes              TEXT,
    conversation_count INTEGER      NOT NULL DEFAULT 0,
    metadata           JSONB        NOT NULL DEFAULT '{}',

    created_at         TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at         TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_guests_status ON guests (status);
CREATE INDEX idx_guests_source ON guests (source);
CREATE INDEX idx_guests_phone ON guests (phone);
CREATE INDEX idx_guests_email ON guests (lower(trim(email)));
-- Indice funcional para busca sem acentos
CREATE INDEX idx_guests_name_normalized ON guests (unaccent(lower(trim(name))));
-- Indice parcial: hospedes quentes/quentes para CRM ativo
CREATE INDEX idx_guests_hot_leads ON guests (last_contact DESC, ai_score DESC)
    WHERE status IN ('new', 'warm', 'hot');

CREATE TRIGGER trg_guests_updated_at
    BEFORE UPDATE ON guests
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

### 4.7 Tabela: `guest_messages`

```sql
-- ====================================================================
-- GUEST_MESSAGES: Mensagens dos hospedes (WhatsApp/chat)
-- ====================================================================
CREATE TABLE guest_messages (
    id          BIGINT       PRIMARY KEY DEFAULT snowflake_id(),
    guest_id    BIGINT       NOT NULL,
    from_who    message_sender NOT NULL,   -- guest | ai | human
    content     TEXT         NOT NULL,
    timestamp   TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    type        message_type  NOT NULL DEFAULT 'text',
    sentiment   message_sentiment,
    intent      VARCHAR(50),                -- booking | pricing | amenities | complaint
    metadata    JSONB        NOT NULL DEFAULT '{}',

    created_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_gm_guest FOREIGN KEY (guest_id)
        REFERENCES guests(id) ON DELETE CASCADE
);

CREATE INDEX idx_gm_guest_time ON guest_messages (guest_id, timestamp DESC);
-- Indice parcial: mensagens dos ultimos 90 dias (query mais frequente)
CREATE INDEX idx_gm_recent ON guest_messages (timestamp DESC)
    WHERE created_at > NOW() - INTERVAL '90 days';
```

### 4.8 Tabela: `bookings`

```sql
-- ====================================================================
-- BOOKINGS: Reservas da pousada
-- ====================================================================
CREATE TABLE bookings (
    id             BIGINT              PRIMARY KEY DEFAULT snowflake_id(),
    guest_id       BIGINT              NOT NULL,
    guest_name     VARCHAR(255)        NOT NULL,
    room_name      VARCHAR(255)        NOT NULL,
    check_in       TIMESTAMPTZ         NOT NULL,
    check_out      TIMESTAMPTZ         NOT NULL,
    nights         SMALLINT            NOT NULL CHECK (nights > 0),
    guests_count   SMALLINT            NOT NULL DEFAULT 1 CHECK (guests_count > 0),
    total_value    NUMERIC(10,2)       NOT NULL,
    status         booking_status      NOT NULL DEFAULT 'pending',
    payment_method booking_source      NOT NULL,    -- pix | credit_card | debit_card | cash | bank_transfer
    payment_status booking_payment_status NOT NULL DEFAULT 'pending',
    source         booking_source      NOT NULL,
    ai_generated   BOOLEAN             NOT NULL DEFAULT FALSE,
    metadata       JSONB               NOT NULL DEFAULT '{}',

    created_at     TIMESTAMPTZ         NOT NULL DEFAULT NOW(),
    updated_at     TIMESTAMPTZ         NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_bookings_guest FOREIGN KEY (guest_id)
        REFERENCES guests(id),

    CONSTRAINT chk_bookings_dates CHECK (check_out > check_in)
);

-- Indice composto: reservas futuras por check-in (query mais frequente)
CREATE INDEX idx_bookings_upcoming ON bookings (check_in, status)
    WHERE check_out >= CURRENT_DATE AND status IN ('pending', 'confirmed');
-- Indice por status
CREATE INDEX idx_bookings_status ON bookings (status);
-- Indice por hospede
CREATE INDEX idx_bookings_guest ON bookings (guest_id);
-- Indice parcial: reservas ativas para dashboard
CREATE INDEX idx_bookings_active ON bookings (check_in, check_out, total_value)
    WHERE status NOT IN ('cancelled', 'checked_out');
-- Indice por source para metricas
CREATE INDEX idx_bookings_source ON bookings (source, status);

CREATE TRIGGER trg_bookings_updated_at
    BEFORE UPDATE ON bookings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

### 4.9 Tabela: `conversation_logs`

```sql
-- ====================================================================
-- CONVERSATION_LOGS: Conversas com acompanhamento de confianca da IA
-- ====================================================================
CREATE TABLE conversation_logs (
    id             BIGINT       PRIMARY KEY DEFAULT snowflake_id(),
    guest_id       BIGINT       NOT NULL,
    guest_name     VARCHAR(255) NOT NULL,
    guest_phone    VARCHAR(30)  NOT NULL,
    status         conversation_status NOT NULL DEFAULT 'active',
    last_update    TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    ai_confidence  NUMERIC(5,2) NOT NULL DEFAULT 0 CHECK (ai_confidence BETWEEN 0 AND 100),
    metadata       JSONB        NOT NULL DEFAULT '{}',

    created_at     TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at     TIMESTAMPTZ  NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_conv_guest FOREIGN KEY (guest_id)
        REFERENCES guests(id) ON DELETE CASCADE
);

CREATE INDEX idx_conv_status ON conversation_logs (status);
CREATE INDEX idx_conv_guest ON conversation_logs (guest_id);
-- Indice parcial: conversas ativas para monitoramento em tempo real
CREATE INDEX idx_conv_active ON conversation_logs (last_update DESC, ai_confidence)
    WHERE status = 'active';

CREATE TRIGGER trg_conversation_logs_updated_at
    BEFORE UPDATE ON conversation_logs
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

### 4.10 Tabela: `conversation_messages`

```sql
-- ====================================================================
-- CONVERSATION_MESSAGES: Mensagens dentro de cada conversa
-- ====================================================================
CREATE TABLE conversation_messages (
    id              BIGINT         PRIMARY KEY DEFAULT snowflake_id(),
    conversation_id BIGINT         NOT NULL,
    from_who        message_sender NOT NULL,
    content         TEXT           NOT NULL,
    timestamp       TIMESTAMPTZ    NOT NULL DEFAULT NOW(),
    is_read         BOOLEAN        NOT NULL DEFAULT FALSE,
    metadata        JSONB          NOT NULL DEFAULT '{}',

    created_at      TIMESTAMPTZ    NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_cm_conversation FOREIGN KEY (conversation_id)
        REFERENCES conversation_logs(id) ON DELETE CASCADE
);

CREATE INDEX idx_cm_conversation ON conversation_messages (conversation_id, timestamp DESC);
-- Indice parcial: mensagens nao lidas
CREATE INDEX idx_cm_unread ON conversation_messages (conversation_id)
    WHERE is_read = FALSE;
```

### 4.11 Tabela: `knowledge_entries`

```sql
-- ====================================================================
-- KNOWLEDGE_ENTRIES: Base de conhecimento da pousada (FAQ treinado)
-- ====================================================================
CREATE TABLE knowledge_entries (
    id             BIGINT            PRIMARY KEY DEFAULT snowflake_id(),
    category       knowledge_category NOT NULL,
    question       TEXT              NOT NULL,
    answer         TEXT              NOT NULL,
    priority       knowledge_priority NOT NULL DEFAULT 'medium',
    usage          INTEGER           NOT NULL DEFAULT 0,
    effectiveness  NUMERIC(5,2)      NOT NULL DEFAULT 0 CHECK (effectiveness BETWEEN 0 AND 100),
    created_for    knowledge_audience NOT NULL DEFAULT 'both',
    last_used      TIMESTAMPTZ,
    metadata       JSONB             NOT NULL DEFAULT '{}',

    created_at     TIMESTAMPTZ        NOT NULL DEFAULT NOW(),
    updated_at     TIMESTAMPTZ        NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_ke_category ON knowledge_entries (category);
CREATE INDEX idx_ke_priority ON knowledge_entries (priority DESC);
-- Indice funcional: busca full-text na pergunta
CREATE INDEX idx_ke_question_fts ON knowledge_entries
    USING GIN (to_tsvector('portuguese', question));
CREATE INDEX idx_ke_answer_fts ON knowledge_entries
    USING GIN (to_tsvector('portuguese', answer));

CREATE TRIGGER trg_knowledge_entries_updated_at
    BEFORE UPDATE ON knowledge_entries
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

### 4.12 Tabela: `training_prompts`

```sql
-- ====================================================================
-- TRAINING_PROMPTS: Prompts de treinamento dos agentes
-- ====================================================================
CREATE TABLE training_prompts (
    id           BIGINT        PRIMARY KEY DEFAULT snowflake_id(),
    name         VARCHAR(255)  NOT NULL,
    type         prompt_type   NOT NULL,
    content      TEXT          NOT NULL,
    variables    JSONB         NOT NULL DEFAULT '[]',
    is_active    BOOLEAN       NOT NULL DEFAULT TRUE,
    success_rate NUMERIC(5,2)  NOT NULL DEFAULT 0 CHECK (success_rate BETWEEN 0 AND 100),
    usage_count  INTEGER       NOT NULL DEFAULT 0,
    last_used    TIMESTAMPTZ,
    metadata     JSONB         NOT NULL DEFAULT '{}',

    created_at   TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
    updated_at   TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_tp_type ON training_prompts (type);
CREATE INDEX idx_tp_active ON training_prompts (is_active, success_rate DESC)
    WHERE is_active = TRUE;

CREATE TRIGGER trg_training_prompts_updated_at
    BEFORE UPDATE ON training_prompts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

### 4.13 Tabela: `notifications`

```sql
-- ====================================================================
-- NOTIFICATIONS: Notificacoes para o operador da pousada
-- ====================================================================
CREATE TABLE notifications (
    id           BIGINT               PRIMARY KEY DEFAULT snowflake_id(),
    type         notification_type     NOT NULL,
    priority     notification_priority NOT NULL DEFAULT 'medium',
    title        VARCHAR(255)          NOT NULL,
    message      TEXT                  NOT NULL,
    action_url   TEXT,
    action_label VARCHAR(100),
    is_read      BOOLEAN               NOT NULL DEFAULT FALSE,
    metadata     JSONB                 NOT NULL DEFAULT '{}',

    created_at   TIMESTAMPTZ           NOT NULL DEFAULT NOW()
);

-- Indice parcial: notificacoes nao lidas (query mais frequente)
CREATE INDEX idx_notif_unread ON notifications (priority DESC, created_at DESC)
    WHERE is_read = FALSE;
-- Indice por tipo
CREATE INDEX idx_notif_type ON notifications (type, created_at DESC);

COMMENT ON TABLE notifications IS 'Notificacoes para o operador: reservas, pagamentos, escalonamentos';
```

### 4.14 Tabela: `performance_snapshots`

```sql
-- ====================================================================
-- PERFORMANCE_SNAPSHOTS: Metricas diarias de desempenho
-- ====================================================================
CREATE TABLE performance_snapshots (
    id                 BIGINT       PRIMARY KEY DEFAULT snowflake_id(),
    date               DATE         NOT NULL,
    ai_response_time   NUMERIC(5,2),    -- avg segundos
    conversion_rate    NUMERIC(5,2),    -- porcentagem
    guest_satisfaction NUMERIC(3,1),    -- 0.0 - 5.0
    occupancy_rate     NUMERIC(5,2),    -- porcentagem
    revenue_growth     NUMERIC(5,2),    -- porcentagem
    ai_autonomy        NUMERIC(5,2),    -- porcentagem
    total_revenue      NUMERIC(12,2),
    total_bookings     INTEGER,
    ai_conversations   INTEGER,
    metadata           JSONB        NOT NULL DEFAULT '{}',

    created_at         TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at         TIMESTAMPTZ  NOT NULL DEFAULT NOW(),

    CONSTRAINT uq_perf_snap_date UNIQUE (date)
);

CREATE INDEX idx_perf_date ON performance_snapshots (date DESC);

CREATE TRIGGER trg_performance_snapshots_updated_at
    BEFORE UPDATE ON performance_snapshots
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

### 4.15 Tabela: `quick_actions`

```sql
-- ====================================================================
-- QUICK_ACTIONS: Acoes rapidas customizadas por pousada
-- ====================================================================
CREATE TABLE quick_actions (
    id                   BIGINT              PRIMARY KEY DEFAULT snowflake_id(),
    category             quick_action_category NOT NULL,
    label                VARCHAR(255)         NOT NULL,
    icon                 VARCHAR(100)         NOT NULL,
    action               TEXT                 NOT NULL,
    shortcut             VARCHAR(20),
    requires_confirmation BOOLEAN             NOT NULL DEFAULT FALSE,
    is_active            BOOLEAN              NOT NULL DEFAULT TRUE,
    display_order        INTEGER              NOT NULL DEFAULT 0,

    created_at           TIMESTAMPTZ          NOT NULL DEFAULT NOW(),
    updated_at           TIMESTAMPTZ          NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_qa_category ON quick_actions (category, display_order);
CREATE INDEX idx_qa_active ON quick_actions (is_active, display_order)
    WHERE is_active = TRUE;

CREATE TRIGGER trg_quick_actions_updated_at
    BEFORE UPDATE ON quick_actions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

---

## 5. Funcoes PL/pgSQL

### 5.1 Gerador de Snowflake IDs

```sql
-- ====================================================================
-- SNOWFLAKE ID GENERATOR
-- 64-bit ID: 41-bit timestamp | 13-bit shard_id | 10-bit sequence
-- Epoch: 2025-01-01T00:00:00Z
-- ====================================================================

-- Tabela de controle de sequencia por shard
CREATE TABLE IF NOT EXISTS public.snowflake_sequences (
    shard_id    SMALLINT PRIMARY KEY DEFAULT 0,
    last_ts     BIGINT    NOT NULL DEFAULT 0,
    sequence    INTEGER   NOT NULL DEFAULT 0
);

INSERT INTO public.snowflake_sequences (shard_id, last_ts, sequence)
VALUES (0, 0, 0) ON CONFLICT DO NOTHING;

CREATE OR REPLACE FUNCTION public.snowflake_id(
    p_shard_id SMALLINT DEFAULT 0  -- 0 para tenant public, tenant_id % 8192 para tenants
)
RETURNS BIGINT
LANGUAGE plpgsql
VOLATILE
PARALLEL SAFE
AS $$
DECLARE
    v_epoch        BIGINT       := 1735689600000;  -- 2025-01-01T00:00:00Z em milissegundos
    v_now_ms       BIGINT;
    v_timestamp    BIGINT;
    v_sequence     INTEGER;
    v_last_ts      BIGINT;
    v_result       BIGINT;
BEGIN
    -- Timestamp atual em milissegundos desde epoch
    v_now_ms := (EXTRACT(EPOCH FROM clock_timestamp()) * 1000)::BIGINT - v_epoch;

    -- Clamp: se v_now_ms < 0 (clock drift), usar 0
    IF v_now_ms < 0 THEN
        v_now_ms := 0;
    END IF;

    -- Timestamp ocupa 41 bits (max ~69 anos)
    -- Maximo: 2^41 - 1 = 2199023255551 ms ≈ 69.7 anos
    v_timestamp := v_now_ms & 2199023255551;

    -- Atualizar sequencia de forma atomica via UPDATE+RETURNING
    UPDATE public.snowflake_sequences
    SET sequence = CASE
            WHEN v_now_ms = last_ts THEN (sequence + 1) & 1023  -- 10 bits
            ELSE 0
        END,
        last_ts = v_now_ms
    WHERE shard_id = p_shard_id
    RETURNING sequence, last_ts INTO v_sequence, v_last_ts;

    -- Se nao encontrou o shard, criar (fallback)
    IF NOT FOUND THEN
        INSERT INTO public.snowflake_sequences (shard_id, last_ts, sequence)
        VALUES (p_shard_id, v_now_ms, 0)
        ON CONFLICT (shard_id) DO UPDATE
            SET last_ts = v_now_ms, sequence = 0
        RETURNING sequence INTO v_sequence;
    END IF;

    -- Composicao do Snowflake ID
    -- |0|  41 bits timestamp  |  13 bits shard_id  |  10 bits sequence  |
    --  63   62................22  21...............9  8..............0
    v_result := (v_timestamp << 23) | (p_shard_id::BIGINT << 10) | v_sequence::BIGINT;

    RETURN v_result;
END;
$$;

COMMENT ON FUNCTION public.snowflake_id IS
    'Gera IDs Snowflake 64-bit time-ordered. Epoch: 2025-01-01. Compativel com PgBouncer transaction pooling.';
```

### 5.2 Criacao de Schema Tenant

```sql
-- ====================================================================
-- CREATE_TENANT_SCHEMA: Cria schema + todas as tabelas para um novo tenant
-- Executado como superusuario ou role com CREATE SCHEMA privilege
-- ====================================================================

CREATE OR REPLACE FUNCTION public.create_tenant_schema(
    p_tenant_id BIGINT
)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_schema_name TEXT;
    v_sql         TEXT;
BEGIN
    -- Obter nome do schema
    v_schema_name := public.tenant_schema_name(p_tenant_id);

    -- Criar schema
    EXECUTE format('CREATE SCHEMA IF NOT EXISTS %I', v_schema_name);

    -- ==================================================================
    -- ENUMERACOES
    -- ==================================================================
    EXECUTE format('
        CREATE TYPE %I.room_status AS ENUM (''disponivel'', ''ocupado'', ''sujo'', ''manutencao'', ''reservado'');
        CREATE TYPE %I.room_type AS ENUM (''standard'', ''luxo'', ''suite'', ''chale'');
        CREATE TYPE %I.property_type AS ENUM (''pousada'', ''hotel'', ''hostel'', ''chale'', ''resort'');
        CREATE TYPE %I.pix_key_type AS ENUM (''cpf'', ''email'', ''phone'', ''random'');
        CREATE TYPE %I.bank_account_type AS ENUM (''cc'', ''cp'');
        CREATE TYPE %I.guest_status AS ENUM (''new'', ''warm'', ''hot'', ''booked'', ''staying'', ''checked_out'', ''lost'', ''inactive'');
        CREATE TYPE %I.guest_source AS ENUM (''whatsapp'', ''instagram'', ''booking'', ''airbnb'', ''direct'', ''referral'');
        CREATE TYPE %I.message_sender AS ENUM (''guest'', ''ai'', ''human'');
        CREATE TYPE %I.message_type AS ENUM (''text'', ''image'', ''audio'', ''document'');
        CREATE TYPE %I.message_sentiment AS ENUM (''positive'', ''neutral'', ''negative'');
        CREATE TYPE %I.booking_status AS ENUM (''pending'', ''confirmed'', ''checked_in'', ''checked_out'', ''cancelled'', ''no_show'');
        CREATE TYPE %I.booking_payment_status AS ENUM (''pending'', ''paid'', ''partial'', ''overdue'');
        CREATE TYPE %I.booking_source AS ENUM (''whatsapp_ai'', ''whatsapp_human'', ''booking'', ''airbnb'', ''direct'');
        CREATE TYPE %I.conversation_status AS ENUM (''active'', ''resolved'', ''escalated'', ''abandoned'');
        CREATE TYPE %I.knowledge_category AS ENUM (''pricing'', ''rooms'', ''amenities'', ''policies'', ''location'', ''activities'', ''food'', ''custom'');
        CREATE TYPE %I.knowledge_priority AS ENUM (''low'', ''medium'', ''high'', ''critical'');
        CREATE TYPE %I.knowledge_audience AS ENUM (''ai'', ''human'', ''both'');
        CREATE TYPE %I.prompt_type AS ENUM (''persona'', ''response'', ''escalation'', ''proactive'');
        CREATE TYPE %I.notification_type AS ENUM (''booking'', ''payment'', ''escalation'', ''system'', ''alert'', ''achievement'');
        CREATE TYPE %I.notification_priority AS ENUM (''low'', ''medium'', ''high'', ''urgent'');
        CREATE TYPE %I.quick_action_category AS ENUM (''booking'', ''communication'', ''analytics'', ''settings'', ''emergency'');
    ', v_schema_name, v_schema_name, v_schema_name, v_schema_name, v_schema_name,
       v_schema_name, v_schema_name, v_schema_name, v_schema_name, v_schema_name,
       v_schema_name, v_schema_name, v_schema_name, v_schema_name, v_schema_name,
       v_schema_name, v_schema_name, v_schema_name, v_schema_name, v_schema_name,
       v_schema_name, v_schema_name);

    -- ==================================================================
    -- TABELAS (DDL identico para todos os tenants)
    -- ==================================================================
    EXECUTE format('
        -- PROPERTIES
        CREATE TABLE %I.properties (
            id               BIGINT         PRIMARY KEY DEFAULT snowflake_id(),
            name             VARCHAR(255)   NOT NULL,
            document         VARCHAR(20),
            street           VARCHAR(255)   NOT NULL DEFAULT '''',
            number           VARCHAR(20)    NOT NULL DEFAULT '''',
            neighborhood     VARCHAR(100)   NOT NULL DEFAULT '''',
            city             VARCHAR(100)   NOT NULL DEFAULT '''',
            state            VARCHAR(2)     NOT NULL DEFAULT '''',
            zip_code         VARCHAR(10)    NOT NULL DEFAULT '''',
            type             %I.property_type NOT NULL DEFAULT ''pousada'',
            website          TEXT,
            description      TEXT           NOT NULL DEFAULT '''',
            services         JSONB          NOT NULL DEFAULT ''[]'',
            payment_methods  JSONB          NOT NULL DEFAULT ''[]'',
            pix_key          VARCHAR(255),
            pix_key_type     %I.pix_key_type NOT NULL DEFAULT ''cpf'',
            bank_name        VARCHAR(100),
            bank_agency      VARCHAR(20),
            bank_account     VARCHAR(30),
            bank_account_type %I.bank_account_type,
            bank_cpf         VARCHAR(20),
            created_at       TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
            updated_at       TIMESTAMPTZ     NOT NULL DEFAULT NOW()
        );
        CREATE TRIGGER trg_properties_updated_at BEFORE UPDATE ON %I.properties
            FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

        -- ROOMS
        CREATE TABLE %I.rooms (
            id          BIGINT       PRIMARY KEY DEFAULT snowflake_id(),
            property_id BIGINT       NOT NULL,
            name        VARCHAR(255) NOT NULL,
            type        %I.room_type NOT NULL DEFAULT ''standard'',
            capacity    SMALLINT     NOT NULL DEFAULT 2,
            price       NUMERIC(10,2) NOT NULL DEFAULT 150.00,
            status      %I.room_status NOT NULL DEFAULT ''disponivel'',
            created_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
            updated_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
            CONSTRAINT fk_rooms_property FOREIGN KEY (property_id)
                REFERENCES %I.properties(id) ON DELETE CASCADE
        );
        CREATE INDEX idx_rooms_status ON %I.rooms (status);
        CREATE INDEX idx_rooms_available ON %I.rooms (price, capacity) WHERE status = ''disponivel'';
        CREATE TRIGGER trg_rooms_updated_at BEFORE UPDATE ON %I.rooms
            FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

        -- API_CONFIGS
        CREATE TABLE %I.api_configs (
            id            BIGINT       PRIMARY KEY DEFAULT snowflake_id(),
            provider      VARCHAR(50)  NOT NULL,
            api_key       TEXT         NOT NULL DEFAULT '''',
            api_secret    TEXT         NOT NULL DEFAULT '''',
            model         VARCHAR(255) NOT NULL DEFAULT '''',
            base_url      TEXT         NOT NULL DEFAULT '''',
            is_active     BOOLEAN      NOT NULL DEFAULT FALSE,
            usage_limit   INTEGER      NOT NULL DEFAULT 0,
            usage_current INTEGER      NOT NULL DEFAULT 0,
            notes         TEXT         NOT NULL DEFAULT '''',
            created_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
            updated_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
            CONSTRAINT uq_api_configs_provider UNIQUE (provider)
        );
        CREATE INDEX idx_api_active ON %I.api_configs (is_active) WHERE is_active = TRUE;
        CREATE TRIGGER trg_api_configs_updated_at BEFORE UPDATE ON %I.api_configs
            FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

        -- AGENT_CONFIGS
        CREATE TABLE %I.agent_configs (
            id                BIGINT       PRIMARY KEY DEFAULT snowflake_id(),
            agent_id          VARCHAR(20)  NOT NULL,
            agent_name        VARCHAR(100) NOT NULL,
            system_prompt     TEXT         NOT NULL DEFAULT '''',
            is_active         BOOLEAN      NOT NULL DEFAULT TRUE,
            temperature       NUMERIC(3,2) NOT NULL DEFAULT 0.70,
            max_tokens        INTEGER      NOT NULL DEFAULT 2048,
            custom_knowledge  JSONB        NOT NULL DEFAULT ''[]'',
            learned_patterns  INTEGER      NOT NULL DEFAULT 0,
            confidence_score  NUMERIC(5,2) NOT NULL DEFAULT 0,
            created_at        TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
            updated_at        TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
            CONSTRAINT uq_agent_configs_id UNIQUE (agent_id)
        );
        CREATE INDEX idx_agent_configs_active ON %I.agent_configs (is_active) WHERE is_active = TRUE;
        CREATE TRIGGER trg_agent_configs_updated_at BEFORE UPDATE ON %I.agent_configs
            FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

        -- GUESTS
        CREATE TABLE %I.guests (
            id                 BIGINT       PRIMARY KEY DEFAULT snowflake_id(),
            name               VARCHAR(255) NOT NULL,
            phone              VARCHAR(30)  NOT NULL,
            email              VARCHAR(255),
            status             %I.guest_status NOT NULL DEFAULT ''new'',
            avatar             TEXT,
            source             %I.guest_source NOT NULL DEFAULT ''whatsapp'',
            value              NUMERIC(10,2) NOT NULL DEFAULT 0,
            last_contact       TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
            check_in           TIMESTAMPTZ,
            check_out          TIMESTAMPTZ,
            room               VARCHAR(100),
            ai_score           SMALLINT     NOT NULL DEFAULT 50,
            notes              TEXT,
            conversation_count INTEGER      NOT NULL DEFAULT 0,
            metadata           JSONB        NOT NULL DEFAULT ''{}'',
            created_at         TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
            updated_at         TIMESTAMPTZ  NOT NULL DEFAULT NOW()
        );
        CREATE INDEX idx_guests_status ON %I.guests (status);
        CREATE INDEX idx_guests_phone ON %I.guests (phone);
        CREATE INDEX idx_guests_email ON %I.guests (lower(trim(email)));
        CREATE INDEX idx_guests_hot_leads ON %I.guests (last_contact DESC, ai_score DESC)
            WHERE status IN (''new'', ''warm'', ''hot'');
        CREATE TRIGGER trg_guests_updated_at BEFORE UPDATE ON %I.guests
            FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

        -- GUEST_MESSAGES
        CREATE TABLE %I.guest_messages (
            id          BIGINT         PRIMARY KEY DEFAULT snowflake_id(),
            guest_id    BIGINT         NOT NULL,
            from_who    %I.message_sender NOT NULL,
            content     TEXT           NOT NULL,
            timestamp   TIMESTAMPTZ    NOT NULL DEFAULT NOW(),
            type        %I.message_type  NOT NULL DEFAULT ''text'',
            sentiment   %I.message_sentiment,
            intent      VARCHAR(50),
            metadata    JSONB          NOT NULL DEFAULT ''{}'',
            created_at  TIMESTAMPTZ    NOT NULL DEFAULT NOW(),
            CONSTRAINT fk_gm_guest FOREIGN KEY (guest_id)
                REFERENCES %I.guests(id) ON DELETE CASCADE
        );
        CREATE INDEX idx_gm_guest_time ON %I.guest_messages (guest_id, timestamp DESC);
        CREATE INDEX idx_gm_recent ON %I.guest_messages (timestamp DESC)
            WHERE created_at > NOW() - INTERVAL ''90 days'';'],

    v_schema_name, v_schema_name, v_schema_name, v_schema_name,
    v_schema_name, v_schema_name, v_schema_name, v_schema_name,
    v_schema_name, v_schema_name, v_schema_name, v_schema_name,
    v_schema_name, v_schema_name, v_schema_name, v_schema_name, v_schema_name,
    v_schema_name, v_schema_name, v_schema_name, v_schema_name, v_schema_name,
    v_schema_name);

    -- ==================================================================
    -- TABELAS CONTINUACAO
    -- ==================================================================
    EXECUTE format('
        -- BOOKINGS
        CREATE TABLE %I.bookings (
            id             BIGINT              PRIMARY KEY DEFAULT snowflake_id(),
            guest_id       BIGINT              NOT NULL,
            guest_name     VARCHAR(255)        NOT NULL,
            room_name      VARCHAR(255)        NOT NULL,
            check_in       TIMESTAMPTZ         NOT NULL,
            check_out      TIMESTAMPTZ         NOT NULL,
            nights         SMALLINT            NOT NULL,
            guests_count   SMALLINT            NOT NULL DEFAULT 1,
            total_value    NUMERIC(10,2)       NOT NULL,
            status         %I.booking_status      NOT NULL DEFAULT ''pending'',
            payment_method %I.booking_source      NOT NULL,
            payment_status %I.booking_payment_status NOT NULL DEFAULT ''pending'',
            source         %I.booking_source      NOT NULL,
            ai_generated   BOOLEAN             NOT NULL DEFAULT FALSE,
            metadata       JSONB               NOT NULL DEFAULT ''{}'',
            created_at     TIMESTAMPTZ         NOT NULL DEFAULT NOW(),
            updated_at     TIMESTAMPTZ         NOT NULL DEFAULT NOW(),
            CONSTRAINT fk_bookings_guest FOREIGN KEY (guest_id) REFERENCES %I.guests(id),
            CONSTRAINT chk_bookings_dates CHECK (check_out > check_in)
        );
        CREATE INDEX idx_bookings_upcoming ON %I.bookings (check_in, status)
            WHERE check_out >= CURRENT_DATE AND status IN (''pending'', ''confirmed'');
        CREATE INDEX idx_bookings_status ON %I.bookings (status);
        CREATE TRIGGER trg_bookings_updated_at BEFORE UPDATE ON %I.bookings
            FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

        -- CONVERSATION_LOGS
        CREATE TABLE %I.conversation_logs (
            id             BIGINT       PRIMARY KEY DEFAULT snowflake_id(),
            guest_id       BIGINT       NOT NULL,
            guest_name     VARCHAR(255) NOT NULL,
            guest_phone    VARCHAR(30)  NOT NULL,
            status         %I.conversation_status NOT NULL DEFAULT ''active'',
            last_update    TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
            ai_confidence  NUMERIC(5,2) NOT NULL DEFAULT 0,
            metadata       JSONB        NOT NULL DEFAULT ''{}'',
            created_at     TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
            updated_at     TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
            CONSTRAINT fk_conv_guest FOREIGN KEY (guest_id)
                REFERENCES %I.guests(id) ON DELETE CASCADE
        );
        CREATE INDEX idx_conv_active ON %I.conversation_logs (last_update DESC, ai_confidence)
            WHERE status = ''active'';
        CREATE TRIGGER trg_conversation_logs_updated_at BEFORE UPDATE ON %I.conversation_logs
            FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

        -- CONVERSATION_MESSAGES
        CREATE TABLE %I.conversation_messages (
            id              BIGINT         PRIMARY KEY DEFAULT snowflake_id(),
            conversation_id BIGINT         NOT NULL,
            from_who        %I.message_sender NOT NULL,
            content         TEXT           NOT NULL,
            timestamp       TIMESTAMPTZ    NOT NULL DEFAULT NOW(),
            is_read         BOOLEAN        NOT NULL DEFAULT FALSE,
            metadata        JSONB          NOT NULL DEFAULT ''{}'',
            created_at      TIMESTAMPTZ    NOT NULL DEFAULT NOW(),
            CONSTRAINT fk_cm_conversation FOREIGN KEY (conversation_id)
                REFERENCES %I.conversation_logs(id) ON DELETE CASCADE
        );
        CREATE INDEX idx_cm_unread ON %I.conversation_messages (conversation_id)
            WHERE is_read = FALSE;

        -- KNOWLEDGE_ENTRIES
        CREATE TABLE %I.knowledge_entries (
            id             BIGINT            PRIMARY KEY DEFAULT snowflake_id(),
            category       %I.knowledge_category NOT NULL,
            question       TEXT              NOT NULL,
            answer         TEXT              NOT NULL,
            priority       %I.knowledge_priority NOT NULL DEFAULT ''medium'',
            usage          INTEGER           NOT NULL DEFAULT 0,
            effectiveness  NUMERIC(5,2)      NOT NULL DEFAULT 0,
            created_for    %I.knowledge_audience NOT NULL DEFAULT ''both'',
            last_used      TIMESTAMPTZ,
            metadata       JSONB             NOT NULL DEFAULT ''{}'',
            created_at     TIMESTAMPTZ        NOT NULL DEFAULT NOW(),
            updated_at     TIMESTAMPTZ        NOT NULL DEFAULT NOW()
        );
        CREATE INDEX idx_ke_category ON %I.knowledge_entries (category);
        CREATE INDEX idx_ke_question_fts ON %I.knowledge_entries
            USING GIN (to_tsvector(''portuguese'', question));
        CREATE TRIGGER trg_knowledge_entries_updated_at BEFORE UPDATE ON %I.knowledge_entries
            FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

        -- TRAINING_PROMPTS
        CREATE TABLE %I.training_prompts (
            id           BIGINT        PRIMARY KEY DEFAULT snowflake_id(),
            name         VARCHAR(255)  NOT NULL,
            type         %I.prompt_type NOT NULL,
            content      TEXT          NOT NULL,
            variables    JSONB         NOT NULL DEFAULT ''[]'',
            is_active    BOOLEAN       NOT NULL DEFAULT TRUE,
            success_rate NUMERIC(5,2)  NOT NULL DEFAULT 0,
            usage_count  INTEGER       NOT NULL DEFAULT 0,
            last_used    TIMESTAMPTZ,
            metadata     JSONB         NOT NULL DEFAULT ''{}'',
            created_at   TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
            updated_at   TIMESTAMPTZ   NOT NULL DEFAULT NOW()
        );
        CREATE INDEX idx_tp_active ON %I.training_prompts (is_active, success_rate DESC)
            WHERE is_active = TRUE;
        CREATE TRIGGER trg_training_prompts_updated_at BEFORE UPDATE ON %I.training_prompts
            FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

        -- NOTIFICATIONS
        CREATE TABLE %I.notifications (
            id           BIGINT               PRIMARY KEY DEFAULT snowflake_id(),
            type         %I.notification_type     NOT NULL,
            priority     %I.notification_priority NOT NULL DEFAULT ''medium'',
            title        VARCHAR(255)          NOT NULL,
            message      TEXT                  NOT NULL,
            action_url   TEXT,
            action_label VARCHAR(100),
            is_read      BOOLEAN               NOT NULL DEFAULT FALSE,
            metadata     JSONB                 NOT NULL DEFAULT ''{}'',
            created_at   TIMESTAMPTZ           NOT NULL DEFAULT NOW()
        );
        CREATE INDEX idx_notif_unread ON %I.notifications (priority DESC, created_at DESC)
            WHERE is_read = FALSE;

        -- PERFORMANCE_SNAPSHOTS
        CREATE TABLE %I.performance_snapshots (
            id                 BIGINT       PRIMARY KEY DEFAULT snowflake_id(),
            date               DATE         NOT NULL,
            ai_response_time   NUMERIC(5,2),
            conversion_rate    NUMERIC(5,2),
            guest_satisfaction NUMERIC(3,1),
            occupancy_rate     NUMERIC(5,2),
            revenue_growth     NUMERIC(5,2),
            ai_autonomy        NUMERIC(5,2),
            total_revenue      NUMERIC(12,2),
            total_bookings     INTEGER,
            ai_conversations   INTEGER,
            metadata           JSONB        NOT NULL DEFAULT ''{}'',
            created_at         TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
            updated_at         TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
            CONSTRAINT uq_perf_snap_date UNIQUE (date)
        );
        CREATE TRIGGER trg_performance_snapshots_updated_at BEFORE UPDATE ON %I.performance_snapshots
            FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

        -- QUICK_ACTIONS
        CREATE TABLE %I.quick_actions (
            id                   BIGINT              PRIMARY KEY DEFAULT snowflake_id(),
            category             %I.quick_action_category NOT NULL,
            label                VARCHAR(255)         NOT NULL,
            icon                 VARCHAR(100)         NOT NULL,
            action               TEXT                 NOT NULL,
            shortcut             VARCHAR(20),
            requires_confirmation BOOLEAN             NOT NULL DEFAULT FALSE,
            is_active            BOOLEAN              NOT NULL DEFAULT TRUE,
            display_order        INTEGER              NOT NULL DEFAULT 0,
            created_at           TIMESTAMPTZ          NOT NULL DEFAULT NOW(),
            updated_at           TIMESTAMPTZ          NOT NULL DEFAULT NOW()
        );
        CREATE INDEX idx_qa_active ON %I.quick_actions (is_active, display_order)
            WHERE is_active = TRUE;
        CREATE TRIGGER trg_quick_actions_updated_at BEFORE UPDATE ON %I.quick_actions
            FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    ', v_schema_name,
       v_schema_name, v_schema_name, v_schema_name, v_schema_name, v_schema_name,
       v_schema_name, v_schema_name, v_schema_name, v_schema_name,
       v_schema_name, v_schema_name, v_schema_name, v_schema_name, v_schema_name,
       v_schema_name, v_schema_name, v_schema_name, v_schema_name, v_schema_name,
       v_schema_name, v_schema_name, v_schema_name, v_schema_name, v_schema_name,
       v_schema_name, v_schema_name, v_schema_name, v_schema_name);

    -- Registrar o shard_id para este tenant (usado no snowflake_id)
    INSERT INTO public.snowflake_sequences (shard_id, last_ts, sequence)
    VALUES ((p_tenant_id % 8192)::SMALLINT, 0, 0)
    ON CONFLICT (shard_id) DO NOTHING;

    -- Atualizar o tenants.schema_name
    UPDATE public.tenants
    SET schema_name = v_schema_name
    WHERE id = p_tenant_id;

    RETURN v_schema_name;
END;
$$;

COMMENT ON FUNCTION public.create_tenant_schema IS
    'Cria schema completo com todas as tabelas para um novo tenant. Segurança: SECURITY DEFINER.';
```

### 5.3 Nome do Schema Tenant

```sql
-- ====================================================================
-- TENANT_SCHEMA_NAME: Retorna o nome do schema PostgreSQL para um tenant
-- ====================================================================

CREATE OR REPLACE FUNCTION public.tenant_schema_name(
    p_tenant_id BIGINT
)
RETURNS TEXT
LANGUAGE plpgsql
IMMUTABLE
PARALLEL SAFE
AS $$
BEGIN
    -- Formato: tenant_XXX onde XXX é o ID padding com zeros
    -- Exemplo: tenant_id = 42 → tenant_042
    -- Exemplo: tenant_id = 1337 → tenant_1337
    RETURN 'tenant_' || LPAD(p_tenant_id::TEXT, 4, '0');
END;
$$;

COMMENT ON FUNCTION public.tenant_schema_name IS
    'Retorna o nome do schema PostgreSQL para um tenant. IMMUTABLE: pode ser usada em PK/FK.';
```

### 5.4 Funcao Auxiliar: Auto-update `updated_at`

```sql
-- ====================================================================
-- TRIGGER GENERICO: Atualiza updated_at automaticamente
-- ====================================================================

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;
```

---

## 6. Configuracao PgBouncer

### 6.1 `pgbouncer.ini`

```ini
;; ====================================================================
;; PgBouncer Configuration — ZEHLA SaaS
;; Transaction Pooling Mode — Compativel com Prisma Client
;; ====================================================================

[databases]
;; Database principal — conectar ao PostgreSQL real
zehla_prod = host=127.0.0.1 port=5432 dbname=zehla_prod
;zehla_read = host=127.0.0.1 port=5433 dbname=zehla_prod  ; Read replica

;; Template para desenvolvimento
zehla_dev = host=127.0.0.1 port=5432 dbname=zehla_dev

[pgbouncer]
;; -------------------------------------------------------
;; CONEXOES
;; -------------------------------------------------------
;; Maximo de conexoes de clientes (Next.js instances + workers)
max_client_conn = 1500

;; Conexao default — pool de conexoes reais para o PostgreSQL
default_pool = 80

;; Pool minimo reservado para admin e migrations
min_pool_size = 10

;; Conexao reservada para superusuario (administracao, migrations)
reserve_pool_size = 5
reserve_pool_timeout = 3.0

;; -------------------------------------------------------
;; POOLING
;; -------------------------------------------------------
;; Transaction pooling: libera conexao ao final de cada transacao
;; NECESSARIO: Prisma + PgBouncer requer este modo
pool_mode = transaction

;; -------------------------------------------------------
;; TIMEOUTS
;; -------------------------------------------------------
;; Timeout de conexao do cliente (aplicacao)
server_idle_timeout = 600
;; Idle timeout de conexao do servidor (PostgreSQL)
server_lifetime = 3600
;; Timeout de query longa (kill se exceder)
server_connect_timeout = 15
;; Query timeout — kill queries > 30s (protecao contra slow queries)
query_timeout = 30
;; Idle timeout de conexao do cliente
client_idle_timeout = 0
;; Timeout de login
client_login_timeout = 15
;; Autoclose de conexoes idle do servidor
autodb_idle_timeout = 60

;; -------------------------------------------------------
;; SEGURANCA
;; -------------------------------------------------------
;; Permite autenticacao via md5/scram-sha-256
auth_type = scram-sha-256
;; Arquivo de usuarios (gerado via md5/sha256)
auth_file = /etc/pgbouncer/userlist.txt

;; -------------------------------------------------------
;; LOGGING
;; -------------------------------------------------------
log_connections = 0
log_disconnections = 0
log_pooler_errors = 1
log_stats = 1
stats_period = 60
;; Verbose logging em desenvolvimento
;verbose = 1

;; -------------------------------------------------------
;; ADMIN
;; -------------------------------------------------------
;; Endereco de escuta do console de admin
admin_users = zehla_admin
stats_users = zehla_monitor

;; -------------------------------------------------------
;; PERFORMANCE
;; -------------------------------------------------------
;; Pacotes por transacao (reduz syscalls)
pkt_buf = 4096
;; Maximo de pacotes na fila
max_packet_size = 2147483647
;; TCP keepalive para detectar conexoes mortas
tcp_keepalive = 1
tcp_keepidle = 30
tcp_keepintvl = 10
tcp_keepcnt = 3

;; -------------------------------------------------------
;; LISTEN
;; -------------------------------------------------------
listen_addr = 127.0.0.1
listen_port = 6432
listen_backlog = 128

;; Unix socket (alternativa TCP para localhost)
;unix_socket_dir = /var/run/pgbouncer

;; PID file
pidfile = /var/run/pgbouncer/pgbouncer.pid
```

### 6.2 Configuracao Prisma para PgBouncer

```typescript
// prisma/schema.prisma
datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")  // Aponta para PgBouncer
  directUrl = env("DIRECT_DATABASE_URL")  // Aponta para PostgreSQL direto (migrations)
}

// Variaveis de ambiente:
// DATABASE_URL=postgresql://zehla_app:senha@127.0.0.1:6432/zehla_prod?pgbouncer=true&connect_timeout=15
// DIRECT_DATABASE_URL=postgresql://zehla_app:senha@127.0.0.1:5432/zehla_prod
```

### 6.3 `userlist.txt` (Exemplo)

```
;; Formato: "username" "password"
;; Senha gerada com: echo -n "senha" | md5sum
;; ou com scram-sha-256 via pg_auth
"zehla_app" "SCRAM-SHA-256$4096:hash_base64:salt_base64:server_key_base64"
"zehla_admin" "SCRAM-SHA-256$4096:hash_base64:salt_base64:server_key_base64"
"zehla_monitor" "SCRAM-SHA-256$4096:hash_base64:salt_base64:server_key_base64"
```

---

## 7. Estrategia de Caching Redis

### 7.1 Padroes de Chaves

```
zehla:{tenant_id}:{domain}:{identifier}
```

| Padrao de Chave | Tipo | TTL | Descricao |
|----------------|------|-----|-----------|
| `zehla:session:{jwt_token}` | STRING | 24h | Sessao ativa do usuario |
| `zehla:avail:{tenant_id}:{date}` | HASH | 5min | Disponibilidade de quartos por data |
| `zehla:avail:{tenant_id}:{check_in}:{check_out}` | SET | 5min | Quartos disponiveis no range |
| `zehla:bookings:{tenant_id}:count` | STRING | 1h | Contador de reservas do dia |
| `zehla:bookings:{tenant_id}:revenue` | STRING | 1h | Receita acumulada do dia |
| `zehla:guest:{tenant_id}:{guest_id}` | HASH | 30min | Cache de perfil do hospede |
| `zehla:conv:{tenant_id}:unread` | STRING | 2min | Contador de conversas nao lidas |
| `zehla:rl:{ip}:{endpoint}` | STRING | 1min | Rate limiting (sliding window) |
| `zehla:rl:{tenant_id}:{endpoint}` | STRING | 1min | Rate limiting por tenant |
| `zehla:router:{provider}` | HASH | 30s | Estado atual do NeuroRouter |
| `zehla:ff:{flag_name}` | STRING | 10min | Feature flags |
| `zehla:perf:{tenant_id}:{date}` | HASH | 6h | Dashboard de performance |
| `zehla:lock:{resource}` | STRING | 10s | Lock distribuido |

### 7.2 Politicas de TTL

```
┌──────────────────────────┬──────┬──────────────────────────────────────┐
│ Dados                    │ TTL  │ Justificativa                        │
├──────────────────────────┼──────┼──────────────────────────────────────┤
│ Sessoes de usuario       │ 24h  │ Renovacao automatica via refresh     │
│ Disponibilidade          │ 5min │ Invalidacao por nova reserva/checkin │
│ Contadores de reserva    │ 1h   │ Atualizacao por webhook/cron         │
│ Perfil do hospede        │ 30min│ Invalidacao por update               │
│ Rate limiting            │ 1min │ Janela deslizante                   │
│ Estado do Router (IA)    │ 30s  │ Ciclo Thompson Sampling rapido       │
│ Feature flags            │ 10min│ Propagacao rapida de mudancas        │
│ Dashboard de metricas   │ 6h   │ Agregacao diaria                    │
│ Locks distribuidos       │ 10s  │ Timeout de seguranca                 │
│ OTP/Codigo verificacao   │ 5min │ Expiracao de codigo                 │
└──────────────────────────┴──────┴──────────────────────────────────────┘
```

### 7.3 Regras de Invalidacao

```
EVENTO                          → INVALIDACAO
───────────────────────────────────────────────────────────────────────
Nova reserva criada             → DEL zehla:avail:{tenant}:*
Check-in realizado              → DEL zehla:avail:{tenant}:*
Check-out realizado             → DEL zehla:avail:{tenant}:*
Atualizacao de quarto           → DEL zehla:avail:{tenant}:*
Atualizacao de hospede          → DEL zehla:guest:{tenant}:{guest_id}
Nova mensagem recebida          → DEL zehla:conv:{tenant}:unread
Router provider caiu (circuit)   → DEL zehla:router:{provider}
Feature flag alterada           → DEL zehla:ff:{flag_name}
Pagina de metricas atualizada   → DEL zehla:perf:{tenant}:{date}
```

### 7.4 Exemplos de Implementacao (Node.js)

```typescript
// ============================================================
// Disponibilidade: Cache Hash com TTL
// ============================================================
async function getCachedAvailability(tenantId: string, date: string) {
  const key = `zehla:avail:${tenantId}:${date}`;

  const cached = await redis.hgetall(key);
  if (Object.keys(cached).length > 0) return cached;

  // Cache miss — buscar no PostgreSQL
  const schema = tenantSchemaName(tenantId);
  const rooms = await prisma.$queryRaw`
    SELECT id, name, price, capacity
    FROM ${Prisma.raw(`${schema}.rooms`)}
    WHERE status = 'disponivel'
  `;

  // Popular cache
  const pipeline = redis.pipeline();
  for (const room of rooms) {
    pipeline.hset(key, room.id.toString(), JSON.stringify(room));
  }
  pipeline.expire(key, 300); // 5 min
  await pipeline.exec();

  return rooms;
}

// ============================================================
// Rate Limiting: Sliding Window
// ============================================================
async function checkRateLimit(ip: string, endpoint: string, maxRequests: number) {
  const key = `zehla:rl:${ip}:${endpoint}`;
  const now = Date.now();
  const windowStart = now - 60000; // 1 min

  const results = await redis
    .multi()
    .zadd(key, now, `${now}:${Math.random()}`)
    .zremrangebyscore(key, 0, windowStart)
    .zcard(key)
    .expire(key, 120) // 2 min cleanup
    .exec();

  const count = results[2][1] as number;
  return { allowed: count <= maxRequests, remaining: maxRequests - count };
}
```

---

## 8. Indices Otimizados por Tabela

### 8.1 Schema PUBLIC

| Tabela | Indice | Tipo | Query Pattern |
|--------|--------|------|---------------|
| `users` | `idx_users_email_lower` | **Funcional** | `WHERE lower(trim(email)) = ?` |
| `users` | `uq_users_email` | **UNIQUE** | Login por email |
| `tenants` | `uq_tenants_email` | **UNIQUE** | Login por tenant email |
| `tenants` | `idx_tenants_status` | **Padrao** | Filtro por status ativo |
| `tenants` | `idx_tenants_phone_normalized` | **Funcional** | Busca por telefone normalizado |
| `tenants` | `uq_tenants_schema_name` | **UNIQUE** | Lookup de schema por tenant |
| `subscriptions` | `uq_subscriptions_tenant` | **UNIQUE** | 1 assinatura por tenant |
| `subscriptions` | `idx_subscriptions_period_end` | **Parcial** | `WHERE status = 'active'` — renovacoes |
| `subscriptions` | `idx_subscriptions_status` | **Padrao** | Dashboard de assinaturas |
| `payment_transactions` | `idx_paytrans_status` | **Padrao** | Filtro por status de pagamento |
| `payment_transactions` | `idx_paytrans_created` | **Padrao** (DESC) | Historico de transacoes |
| `leads` | `uq_leads_email` | **UNIQUE** | Deduplicacao de leads |
| `leads` | `idx_leads_status` | **Padrao** | Pipeline de prospeccao |
| `leads` | `idx_leads_validation_score` | **Padrao** (DESC) | Ranking de qualidade |
| `targets` | `uq_targets_domain` | **UNIQUE** | Deduplicacao por dominio |
| `targets` | `idx_targets_priority` | **Padrao** (DESC) | Priorizacao de prospeccao |
| `targets` | `idx_targets_location` | **Composto** | Busca por estado/cidade |
| `campaigns` | `idx_campaigns_scheduled` | **Parcial** | `WHERE status IN ('draft','active')` |
| `campaigns` | `idx_campaigns_status` | **Padrao** | Filtro por status |
| `router_providers` | `uq_router_providers_provider` | **UNIQUE** | Lookup de provider |
| `router_providers` | `idx_router_active` | **Parcial** | `WHERE is_active = TRUE` |
| `budget_guard_state` | `idx_budget_critical` | **Parcial** | `WHERE critical_level != 'nominal'` |
| `agent_logs` | `idx_agent_logs_errors` | **Parcial** | `WHERE status IN ('error','timeout')` |
| `agent_logs` | `idx_agent_logs_agent_time` | **Composto** | Metricas por agente |
| `agent_logs` | `idx_agent_logs_daily_cost` | **Parcial** | `WHERE cost_usd > 0` |
| `security_alerts` | `idx_security_unresolved` | **Parcial** | `WHERE resolved = FALSE` |
| `security_alerts` | `idx_security_critical` | **Parcial** | `WHERE severity IN ('high','critical') AND resolved = FALSE` |
| `swipe_templates` | `idx_swipe_active` | **Parcial** | `WHERE is_active = TRUE` |
| `swipe_templates` | `idx_swipe_category` | **Padrao** | Filtro por categoria |
| `trend_keywords` | `idx_trends_trending` | **Parcial** | `WHERE trend IN ('rising','breakout')` |
| `trend_data_points` | `uq_tdp_keyword_date` | **UNIQUE** | 1 ponto por keyword/dia |
| `audit_logs` | `idx_audit_recent` | **Parcial** | `WHERE created_at > NOW() - '30 days'` |
| `audit_logs` | `idx_audit_action` | **Composto** | Busca por tipo de acao |

### 8.2 Schema per TENANT

| Tabela | Indice | Tipo | Query Pattern |
|--------|--------|------|---------------|
| `rooms` | `idx_rooms_available` | **Parcial** | `WHERE status = 'disponivel'` — busca rapida |
| `rooms` | `idx_rooms_status` | **Padrao** | Dashboard de quartos |
| `guests` | `idx_guests_hot_leads` | **Parcial** | `WHERE status IN ('new','warm','hot')` — CRM ativo |
| `guests` | `idx_guests_email` | **Funcional** | `WHERE lower(trim(email)) = ?` |
| `guests` | `idx_guests_name_normalized` | **Funcional** | `WHERE unaccent(lower(trim(name)))` |
| `guests` | `idx_guests_status` | **Padrao** | Pipeline CRM |
| `guest_messages` | `idx_gm_recent` | **Parcial** | `WHERE created_at > NOW() - '90 days'` |
| `guest_messages` | `idx_gm_guest_time` | **Composto** | Historico de conversa |
| `bookings` | `idx_bookings_upcoming` | **Parcial** | `WHERE check_out >= CURRENT_DATE AND status IN (...)` |
| `bookings` | `idx_bookings_active` | **Parcial** | `WHERE status NOT IN ('cancelled','checked_out')` |
| `bookings` | `idx_bookings_status` | **Padrao** | Dashboard de reservas |
| `conversation_logs` | `idx_conv_active` | **Parcial** | `WHERE status = 'active'` — monitoramento |
| `conversation_messages` | `idx_cm_unread` | **Parcial** | `WHERE is_read = FALSE` |
| `knowledge_entries` | `idx_ke_question_fts` | **GIN FTS** | Busca full-text em portugues |
| `knowledge_entries` | `idx_ke_answer_fts` | **GIN FTS** | Busca full-text em respostas |
| `training_prompts` | `idx_tp_active` | **Parcial** | `WHERE is_active = TRUE` |
| `notifications` | `idx_notif_unread` | **Parcial** | `WHERE is_read = FALSE` — badge count |
| `api_configs` | `idx_api_active` | **Parcial** | `WHERE is_active = TRUE` |
| `agent_configs` | `idx_agent_configs_active` | **Parcial** | `WHERE is_active = TRUE` |
| `quick_actions` | `idx_qa_active` | **Parcial** | `WHERE is_active = TRUE` |

### 8.3 Estimativa de Economia de Espaco

```
Metricas estimadas (100 pousadas, 12 meses de operacao):

Sem partial indexes:
  agent_logs:         ~2.5 GB (todos os logs)
  guest_messages:     ~4.0 GB (todas as mensagens)
  notifications:      ~1.5 GB (todas as notificacoes)

Com partial indexes:
  agent_logs_errors:  ~0.1 GB (somente erros, ~4% do total)
  gm_recent:          ~0.8 GB (90 dias, ~25% do total)
  notif_unread:       ~0.015 GB (nao lidas, ~1% do total)

Economia total estimada: ~7 GB de indice
```

---

## 9. Migracao SQLite → PostgreSQL

### 9.1 Visao Geral do Processo

```
┌───────────┐    1. Dump    ┌───────────┐    2. Transform    ┌───────────┐    3. Import    ┌───────────┐
│  SQLite   │ ──────────→  │  JSON     │ ──────────────→  │  SQL      │ ────────────→  │ PostgreSQL│
│  (atual)  │    (data)     │  (data)   │   (map IDs)      │  (DDL+DML)│    (psql)       │  (novo)    │
└───────────┘               └───────────┘                  └───────────┘                 └───────────┘
```

### 9.2 Passo a Passo

#### Passo 1: Configurar Prisma para PostgreSQL

```prisma
// prisma/schema.prisma — ANTES (SQLite)
datasource db {
  provider = "sqlite"
  url      = "file:./dev.db"
}

// prisma/schema.prisma — DEPOIS (PostgreSQL via PgBouncer)
datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")         // PgBouncer: localhost:6432
  directUrl = env("DIRECT_DATABASE_URL") // PostgreSQL direto: localhost:5432 (migrations)
}
```

#### Passo 2: Mapeamento de Tipos

| Prisma (SQLite) | Prisma (PostgreSQL) | PostgreSQL Nativo | Nota |
|-----------------|---------------------|-------------------|------|
| `String @id @default(cuid())` | `BigInt @id @default(dbgenerated("snowflake_id()"))` | `BIGINT` | Snowflake ID |
| `String @unique` | `String @unique` | `VARCHAR(255)` | Com indice funcional |
| `String @default("{}")` | `Json` | `JSONB` | Operacoes JSON nativas |
| `Float` | `Decimal @db.Decimal(10,2)` | `NUMERIC(10,2)` | Precisao monetaria |
| `DateTime` | `DateTime @db.Timestamptz()` | `TIMESTAMPTZ` | Timezone-aware |
| `Int` | `Int @db.SmallInt` / `Int` | `SMALLINT` / `INTEGER` | Conforme intervalo |
| `Boolean` | `Boolean` | `BOOLEAN` | Sem mudanca |

#### Passo 3: Script de Migracao de IDs (CUID → Snowflake)

```typescript
// scripts/migrate-ids.ts
// Executar ANTES do dump final para manter consistencia

interface IdMapping {
  oldId: string;    // CUID original
  newId: bigint;    // Snowflake ID
  table: string;
}

const idMap = new Map<string, bigint>();

function generateSnowflake(): bigint {
  // Chamar snowflake_id() via SQL
  // Em migracao, usar timestamp atual + shard fixo (0)
  const now = BigInt(Date.now() - 1735689600000); // epoch 2025-01-01
  const shard = 0n;
  const seq = BigInt(Math.floor(Math.random() * 1024));
  return (now << 23n) | (shard << 10n) | seq;
}

async function migrateTable(tableName: string, records: any[]): Promise<IdMapping[]> {
  const mappings: IdMapping[] = [];

  for (const record of records) {
    const oldId = record.id;
    const newId = generateSnowflake();

    idMap.set(oldId, newId);
    mappings.push({ oldId, newId, table: tableName });

    record.id = newId;

    // Mapear foreign keys
    for (const [key, value] of Object.entries(record)) {
      if (typeof value === 'string' && value.length === 25 && idMap.has(value)) {
        (record as any)[key] = idMap.get(value);
      }
    }
  }

  return mappings;
}

// Salvar mapeamento para rollback
async function saveMapping(mappings: IdMapping[]) {
  await fs.writeFile('./migration-id-map.json', JSON.stringify(mappings, null, 2));
}
```

#### Passo 4: Dump e Transformacao

```bash
# 1. Exportar dados do SQLite
sqlite3 dev.db ".dump" > sqlite_dump.sql

# 2. Converter tipos (script Node.js)
# - CUID → BIGINT (via snowflake_id)
# - String JSON → JSONB
# - Float → NUMERIC(10,2)
# - DateTime ISO → TIMESTAMPTZ
node scripts/transform-sqlite-dump.js > pg_import.sql

# 3. Aplicar DDL no PostgreSQL
psql -h 127.0.0.1 -U zehla_admin -d zehla_prod -f migrations/001_public_schema.sql

# 4. Importar dados transformados
psql -h 127.0.0.1 -U zehla_admin -d zehla_prod -f pg_import.sql

# 5. Criar schemas de tenants
psql -h 127.0.0.1 -U zehla_admin -d zehla_prod -c "SELECT create_tenant_schema(id) FROM tenants;"
```

#### Passo 5: Validacao Pos-Migracao

```sql
-- Validacao de contagem por tabela
SELECT 'users' as tabela, count(*) as qtde FROM users
UNION ALL SELECT 'tenants', count(*) FROM tenants
UNION ALL SELECT 'subscriptions', count(*) FROM subscriptions
UNION ALL SELECT 'leads', count(*) FROM leads
UNION ALL SELECT 'campaigns', count(*) FROM campaigns;

-- Validacao de integridade referencial
SELECT 'subscriptions FK' as check_name,
    count(*) as orfaos
FROM subscriptions s
LEFT JOIN tenants t ON s.tenant_id = t.id
WHERE t.id IS NULL;

-- Validacao de uniques
SELECT 'duplicate emails' as check_name,
    count(*) > count(distinct email) as has_duplicates
FROM users;
```

#### Passo 6: Atualizar Prisma Client

```bash
# Regenerar Prisma Client com novo provider
bunx prisma generate

# Verificar se as queries funcionam
bunx prisma db execute --url $DIRECT_DATABASE_URL --file ./scripts/test-queries.sql
```

### 9.3 Checklist de Migracao

- [ ] Backup completo do SQLite (`cp dev.db dev.db.backup`)
- [ ] Configurar PostgreSQL + PgBouncer
- [ ] Executar DDL completo do schema `public`
- [ ] Instalar extensao `unaccent` (`CREATE EXTENSION unaccent`)
- [ ] Instalar funcao `snowflake_id()` + tabela de sequencias
- [ ] Instalar trigger `update_updated_at_column()`
- [ ] Transformar e importar dados com novos Snowflake IDs
- [ ] Validar contagens e integridade referencial
- [ ] Criar schemas de tenants via `create_tenant_schema()`
- [ ] Migrar dados per-tenant para schemas respectivos
- [ ] Configurar PgBouncer (`pgbouncer.ini`)
- [ ] Testar Prisma Client com PgBouncer
- [ ] Configurar Redis para caching
- [ ] Atualizar variaveis de ambiente (`DATABASE_URL`, `DIRECT_DATABASE_URL`)
- [ ] Testes end-to-end em staging
- [ ] Deploy production

---

## 10. Roadmap de Escalabilidade

### Phase 1: Inicio (0-100 pousadas)

```
┌─────────────────────────────────────────────────┐
│                  PHASE 1                         │
│               Single Server                     │
│                                                  │
│  ┌──────┐  ┌──────────┐  ┌───────────────────┐  │
│  │ App  │  │ PgBouncer│  │ PostgreSQL 16      │  │
│  │ x2   │→ │ :6432    │→ │ 4 cores, 8GB RAM  │  │
│  └──────┘  └──────────┘  │ public + N schemas │  │
│                           └───────────────────┘  │
│  ┌──────┐                                        │
│  │Redis │  Cache + Sessions                      │
│  │1 node│                                        │
│  └──────┘                                        │
│                                                  │
│  Custo estimado: ~$30-50/mes (Hetzner/DO)      │
└─────────────────────────────────────────────────┘
```

**Configuracoes:**
- 1 servidor: App + PostgreSQL + PgBouncer + Redis
- PostgreSQL: `shared_buffers = 2GB`, `work_mem = 64MB`
- PgBouncer: `default_pool = 50`, `max_client_conn = 500`
- Redis: `maxmemory 512mb`, `allkeys-lru`
- **Schema strategy:** Todos os tenants em schemas separados (ja desde o inicio)

**Milestone de upgrade:** Quando CPU > 70% ou p95 latency > 200ms por > 5 min

---

### Phase 2: Crescimento (100-500 pousadas)

```
┌─────────────────────────────────────────────────────────────┐
│                       PHASE 2                               │
│                    Read Replica                             │
│                                                              │
│  ┌──────┐  ┌──────────┐  ┌──────────────┐  ┌────────────┐  │
│  │ App  │  │ PgBouncer │  │ PRIMARY PG   │  │ READ REPLICA│  │
│  │ x2   │→ │ :6432     │→ │ 8 cores,16GB │  │ 4c, 8GB    │  │
│  └──────┘  └──────────┘  │ R/W          │  │ Read Only   │  │
│                           └──────┬───────┘  └────────────┘  │
│                                  │ Streaming Replication    │
│                           ┌──────┴───────┐                   │
│                           │  Redis       │                   │
│                           │  2GB RAM     │                   │
│                           └──────────────┘                   │
│                                                              │
│  Custo estimado: ~$80-120/mes                               │
└─────────────────────────────────────────────────────────────┘
```

**Adicoes:**
- **Read Replica:** `hot_standby = on`, `synchronous_commit = remote_apply` para dashboards
- **Connection string separada:** `DATABASE_URL_RO` para queries read-only
- **PgBouncer extra** para read replica (opcional)
- Queries de relatorio/analytics vao para replica
- **Redis:** Separado em instancia dedicada, `maxmemory 2GB`

**Routing no Prisma:**
```typescript
// Leituras pesadas → Read Replica
const analytics = await prisma.$queryRaw`
  SELECT * FROM tenant_001.bookings
  WHERE check_out >= CURRENT_DATE
  ${Prisma.raw('/* INJECT: replica */')}
`;
```

---

### Phase 3: Escala (500-2000 pousadas)

```
┌────────────────────────────────────────────────────────────────┐
│                          PHASE 3                               │
│                    Multi-Server                                │
│                                                                 │
│  ┌──────────┐  ┌──────────┐  ┌──────────────────────────────┐ │
│  │ App x4   │  │ PgBouncer│  │ PostgreSQL Primary             │ │
│  │ (LB)     │→ │ Cluster  │→ │ 16 cores, 32GB RAM           │ │
│  └──────────┘  └──────────┘  │ NVMe SSD 500GB                │ │
│                               │ ~500-800 schemas              │ │
│  ┌──────────┐  ┌──────────┐  └─────────────┬────────────────┘ │
│  │ Redis    │  │ PgBouncer│               │ streaming         │
│  │ Sentinel │  │ Replica  │  ┌─────────────┴────────────────┐ │
│  │ HA       │→ │ :6432    │→ │ PostgreSQL Read Replica x2  │ │
│  └──────────┘  └──────────┘  │ Load balanced                │ │
│                               └──────────────────────────────┘ │
│                                                                 │
│  Custo estimado: ~$200-350/mes                                  │
└────────────────────────────────────────────────────────────────┘
```

**Adicoes:**
- **App servers:** 2+ instancias com load balancer (Caddy/Cloudflare)
- **Redis Sentinel:** HA com failover automatico
- **Read Replicas x2:** Load balance para analytics
- **Patroni ou repmgr:** Failover automatico do PostgreSQL
- **Monitoring:** Grafana + Prometheus + pg_stat_statements
- **Partitioning:** Particionar `agent_logs` e `audit_logs` por mes (`RANGE partition`)

```sql
-- Exemplo: Particionamento mensal de agent_logs
CREATE TABLE agent_logs_2025_07 PARTITION OF agent_logs
    FOR VALUES FROM ('2025-07-01') TO ('2025-08-01');
CREATE TABLE agent_logs_2025_08 PARTITION OF agent_logs
    FOR VALUES FROM ('2025-08-01') TO ('2025-09-01');
```

---

### Phase 4: Hyper-Scale (2000+ pousadas)

```
┌──────────────────────────────────────────────────────────────────┐
│                            PHASE 4                                │
│                         Physical Shards                           │
│                                                                    │
│  ┌──────────┐  ┌──────────┐  ┌──────────────────────────────┐   │
│  │ App xN   │  │ PgBouncer│  │ Router de Shard              │   │
│  │ (Auto)   │→ │ Cluster  │→ │ (Citus / manual shard map)   │   │
│  └──────────┘  └──────────┘  └──────────────────────────────┘   │
│                                                                    │
│  ┌────────────────────────────────────────────────────────────┐   │
│  │                    Shard 0 (0-999)                         │   │
│  │  ┌──────────────┐  ┌────────────────────────────────────┐  │   │
│  │  │ PG Primary   │  │ PG Replica x2                      │  │   │
│  │  │ 32 cores     │→ │ Analytics / Read                    │  │   │
│  │  │ 64GB RAM     │  │                                    │  │   │
│  │  │ NVMe 1TB     │  │                                    │  │   │
│  │  └──────────────┘  └────────────────────────────────────┘  │   │
│  └────────────────────────────────────────────────────────────┘   │
│  ┌────────────────────────────────────────────────────────────┐   │
│  │                    Shard 1 (1000-1999)                    │   │
│  │  ┌──────────────┐  ┌────────────────────────────────────┐  │   │
│  │  │ PG Primary   │  │ PG Replica x2                      │  │   │
│  │  │ 32 cores     │→ │ Analytics / Read                    │  │   │
│  │  └──────────────┘  └────────────────────────────────────┘  │   │
│  └────────────────────────────────────────────────────────────┘   │
│  ┌────────────────────────────────────────────────────────────┐   │
│  │                    Shard N (...)                            │   │
│  │  (Cresce horizontalmente conforme necessario)             │   │
│  └────────────────────────────────────────────────────────────┘   │
│                                                                    │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐            │
│  │ Redis Cluster│  │ Kafka /      │  │ ClickHouse    │            │
│  │ 6 nodes      │  │ NATS Stream  │  │ Analytics OLAP│            │
│  │              │  │ Event-driven │  │              │            │
│  └──────────────┘  └──────────────┘  └──────────────┘            │
│                                                                    │
│  Custo estimado: ~$800-2000+/mes                                   │
└──────────────────────────────────────────────────────────────────┘
```

**Adicoes:**
- **Citus Extension (PostgreSQL native sharding):** Sharding horizontal sem mudar a aplicacao
- **Redis Cluster:** 6+ nodes, sharding automatico
- **Kafka/NATS:** Event streaming para operacoes assincronas (notificacoes, analytics)
- **ClickHouse:** OLAP para analytics pesados (metricas cross-tenant)
- **Object Storage (S3/MinIO):** Para imagens, documentos, backups de schema
- **Kubernetes:** Auto-scaling de app servers

**Estrategia de shard routing:**
```typescript
// Router baseado em tenant_id
function getShardForTenant(tenantId: bigint): number {
  // Shard 0: tenants 0-999
  // Shard 1: tenants 1000-1999
  return Number(tenantId / 1000n);
}

// Citus faz isso automaticamente com create_distributed_table()
```

---

## Apêndice A: Configuracoes Recomendadas do PostgreSQL

```sql
-- postgresql.conf — ZEHLA (servidor dedicado 8 cores, 16GB)
-- =================================================================

-- Memoria
shared_buffers = 4GB                    -- 25% da RAM
effective_cache_size = 12GB              -- 75% da RAM
work_mem = 64MB                         -- Para sorts, hash joins
maintenance_work_mem = 512MB             -- Para VACUUM, CREATE INDEX

-- WAL / Durabilidade
wal_level = replica                     -- Necessario para streaming replication
max_wal_size = 2GB
min_wal_size = 512MB
checkpoint_completion_target = 0.9
synchronous_commit = on                 -- Para dados financeiros

-- Conexoes
max_connections = 100                   -- PgBouncer cuida do multiplexing
superuser_reserved_connections = 3      -- Reservado para admin/migrations

-- Query Tuning
random_page_cost = 1.1                 -- SSD: mais barato que seq scan
effective_io_concurrency = 200         -- SSD: I/O paralelo alto
default_statistics_target = 200         -- Estatisticas melhores para planes

-- Logging
log_min_duration_statement = 500        -- Log queries > 500ms (slow queries)
log_checkpoints = on
log_connections = off                  -- Desligar em producao (volume alto)
log_lock_waits = on                    -- Detectar deadlocks

-- Extensions necessarias
-- CREATE EXTENSION IF NOT EXISTS unaccent;   -- Para busca sem acentos
-- CREATE EXTENSION IF NOT EXISTS pg_trgm;     -- Para fuzzy search
-- CREATE EXTENSION IF NOT EXISTS pg_stat_statements; -- Para monitoramento
```

## Apêndice B: Comandos Uteis

```bash
# Criar tenant
psql -h 127.0.0.1 -U zehla_admin -d zehla_prod \
  -c "SELECT create_tenant_schema(1);"

# Backup de um tenant especifico
pg_dump -h 127.0.0.1 -U zehla_admin -d zehla_prod \
  -n tenant_0001 -F c -f tenant_0001.backup

# Restore de um tenant
pg_restore -h 127.0.0.1 -U zehla_admin -d zehla_prod \
  --clean --if-exists -n tenant_0001 tenant_0001.backup

# Ver tamanho de todos os schemas
psql -h 127.0.0.1 -U zehla_admin -d zehla_prod -c "
SELECT nspname AS schema,
       pg_size_pretty(sum(pg_relation_size(c.oid))) AS size
FROM pg_class c
JOIN pg_namespace n ON c.relnamespace = n.oid
WHERE nspname LIKE 'tenant_%' OR nspname = 'public'
GROUP BY nspname ORDER BY sum(pg_relation_size(c.oid)) DESC;
"

# Status do PgBouncer
psql -h 127.0.0.1 -p 6432 -U zehla_admin -d pgbouncer -c "SHOW POOLS;"
psql -h 127.0.0.1 -p 6432 -U zehla_admin -d pgbouncer -c "SHOW STATS;"

# Decodificar um Snowflake ID (debug)
psql -h 127.0.0.1 -U zehla_admin -d zehla_prod -c "
SELECT
  id,
  (id >> 23) + 1735689600000 AS timestamp_ms,
  to_timestamp(((id >> 23) + 1735689600000) / 1000.0) AS created_at,
  (id >> 10) & 8191 AS shard_id,
  id & 1023 AS sequence
FROM users LIMIT 5;
"
```

---

> **Documento gerado para o projeto ZEHLA — Cognitive OS para Pousadas.**
> **Autor:** Arquiteto de Dados ZEHLA
> **Ultima atualizacao:** 2025-07-14
