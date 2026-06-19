# ZEHLA — Checklist Completo de Ativacao em Producao

> **Documento de Referencia**: Este e o checklist definitivo para levar o ZEHLA do desenvolvimento para producao.
> Cada item foi mapeado a partir da analise do codigo-fonte, arquitetura comercial e arquitetura de escalabilidade.
> Marcio — imprima, abra no iPad, ou fixe na parede. Check um por um.

---

## Indice

1. [Infraestrutura de Hospedagem](#1-infraestrutura-de-hospedagem)
2. [Integracoes de Terceiros](#2-integracoes-de-terceiros)
3. [Configuracao do Projeto](#3-configuracao-do-projeto)
4. [Dados Iniciais](#4-dados-iniciais)
5. [Validacao Final](#5-validacao-final)
6. [Orcamento Mensal Estimado](#6-orcamento-mensal-estimado)
7. [Timeline de Ativacao](#7-timeline-de-ativacao)
8. [Riscos & Mitigacoes](#8-riscos--mitigacoes)
9. [Pos-Ativacao: Primeiros 30 Dias](#9-pos-ativacao-primeiros-30-dias)

---

## 1. Infraestrutura de Hospedagem

### 1.1 Servidor de Aplicacao (Next.js 16)

O projeto esta configurado com `output: "standalone"` em `next.config.ts`, pronto para deploy em qualquer plataforma.

**Opcoes de provedor (recomendadas em ordem):**

| Provedor | Pros | Contras | Custo Estimado |
|----------|------|---------|---------------|
| **Vercel** | Zero-config, Edge Functions, Preview Deployments, CDN global | Custoso em escala, limites de serverless | R$ 0-250/mes |
| **Railway** | Facil deploy, PostgreSQL/Redis integrados, preview environments | Menos controle de infra | R$ 50-200/mes |
| **Fly.io** | VPS com CDN, docker containers, custo-beneficio | Curva de aprendizado | R$ 30-150/mes |
| **VPS proprio (Hetzner/Contabo)** | Controle total, custo fixo, sem surpresas | Requer manutencao | R$ 25-80/mes |
| **Google Cloud Run** | Serverless, auto-scale, integra GCP | Complexo de configurar | R$ 40-200/mes |

- [ ] Escolher provedor de hospedagem
- [ ] Registrar/transferir dominio principal (ex: `zehla.com.br`)
- [ ] Configurar subdominios:
  - [ ] `app.zehla.com.br` → DDC Dashboard (por pousada)
  - [ ] `admin.zehla.com.br` → ZCC (admin central)
  - [ ] `zehla.com.br` → Landing Page (vendas)
  - [ ] `api.zehla.com.br` → API routes (opcional, para CORS)
- [ ] Configurar certificado SSL/HTTPS (Let's Encrypt ou nativo do provedor)
- [ ] Configurar CDN para assets estaticos (imagens, JS, CSS)
- [ ] Configurar headers de seguranca (CSP, HSTS, X-Frame-Options)
- [ ] Configurar rate limiting (API routes)
- [ ] Testar build de producao: `bun run build && bun run start`
- [ ] Configurar health check endpoint (`/api/readiness` ja existe)
- [ ] Configurar monitoramento de uptime (UptimeRobot / BetterStack)

**Custo estimado mensal: R$ 50-250/mes**

---

### 1.2 Banco de Dados PostgreSQL

> **ATENCAO**: O projeto atualmente usa SQLite (`file:/home/z/my-project/db/custom.db`).
> A migracao para PostgreSQL e OBRIGATORIA para producao.

**Provedores recomendados:**

| Provedor | Versao | PgBouncer | Backup | Custo Estimado |
|----------|--------|-----------|--------|---------------|
| **Neon** | 16+ | Incluso | Point-in-time | R$ 0-300/mes (free tier generoso) |
| **Supabase** | 15+ | Incluso | Auto + PITR | R$ 0-200/mes (free tier) |
| **Railway PostgreSQL** | 16+ | Incluso | Auto | R$ 30-150/mes |
| **AWS RDS** | 15+ | Separado | Auto snapshots | R$ 100-500/mes |
| **Render PostgreSQL** | 16+ | Incluso | Auto | R$ 30-200/mes |

**Configuracao obrigatoria:**

- [ ] Escolher provedor PostgreSQL
- [ ] Versao minima: **PostgreSQL 15+** (recomendado: 16)
- [ ] Configurar **PgBouncer** (connection pooling obrigatorio — ver arquitetura Instagram)
  - [ ] Modo: `transaction pooling`
  - [ ] Pool size: 20-50 conexoes (depende do provedor)
  - [ ] Max client connections: 200+
- [ ] Configurar **connection pooling** no Prisma:
  - [ ] Atualizar `src/lib/db.ts` com `connection_limit` e `pool_timeout`
- [ ] Estimar storage inicial: **1 GB** (cresce ~500 MB/mes com 50 tenants ativos)
- [ ] Configurar **backups automaticos** (diario, retencao de 7 dias)
- [ ] Configurar **point-in-time recovery** (PITR) se disponivel
- [ ] Habilitar **SSL** para conexoes (obrigatorio)
- [ ] Configurar firewall (aceitar apenas IPs do servidor de app)
- [ ] Testar latencia de conexao (< 50ms ideal)

**Migracao do Prisma Schema:**

- [ ] Alterar `prisma/schema.prisma`:
  ```prisma
  datasource db {
    provider = "postgresql"
    url      = env("DATABASE_URL")
  }
  ```
- [ ] Remover `provider = "sqlite"` e `url = env("DATABASE_URL")`
- [ ] Adicionar `@db.Uuid` ou `@db.Text` se necessario para tipos especificos
- [ ] Executar `npx prisma migrate dev --name init_postgres`
- [ ] Executar `npx prisma generate`
- [ ] Validar todas as 30 tabelas foram criadas corretamente
- [ ] Testar queries basicas (SELECT, INSERT, UPDATE)

**Custo estimado mensal: R$ 0-300/mes** (Neon free tier cobre inicio)

---

### 1.3 Redis (Cache + Filas + Sessoes)

Usado para: cache de respostas do ZAOS NeuroRouter, rate limiting, sessoes, filas de processamento.

**Provedores recomendados:**

| Provedor | Tipo | Latencia | Custo Estimado |
|----------|------|----------|---------------|
| **Upstash** | Serverless, REST | Baixa | R$ 0-100/mes (free tier: 10K cmds/dia) |
| **Redis Cloud** | Managed | Baixissima | R$ 0-150/mes (free tier: 30MB) |
| **Railway Redis** | Managed | Baixa | R$ 15-50/mes (incluso no plano) |

**Configuracao obrigatoria:**

- [ ] Escolher provedor Redis
- [ ] Configurar URL de conexao (REDIS_URL)
- [ ] Habilitar persistencia (RDB ou AOF)
  - [ ] Snapshot RDB a cada 60 segundos se dados criticos
- [ ] Configurar TTL automatico para cache (Semantic Cache usa Redis)
- [ ] Configurar maxmemory-policy: `allkeys-lru`
- [ ] Testar conexao e latencia
- [ ] Implementar cache de respostas do ZAOS Router no Redis
- [ ] Implementar rate limiting com Redis

**Custo estimado mensal: R$ 0-100/mes**

---

### 1.4 Armazenamento de Arquivos (Storage)

Para: imagens de pousadas (logos, fotos de quartos), documentos, backups, assets de campanhas.

**Provedores recomendados:**

| Provedor | Egress Gratuito | CDN Integrado | Custo Estimado |
|----------|----------------|---------------|---------------|
| **Cloudflare R2** | Sim | Sim (Cloudflare) | R$ 0-50/mes (10GB gratis) |
| **Vercel Blob** | Incluso | Sim (Vercel) | R$ 0-80/mes |
| **AWS S3** | Nao (pago) | CloudFront separado | R$ 10-100/mes |

- [ ] Escolher provedor de storage
- [ ] Criar bucket: `zehla-assets` (publico para imagens), `zehla-documents` (privado)
- [ ] Configurar CORS para o dominio do app
- [ ] Configurar CDN para distribuicao de imagens
- [ ] Implementar upload de logos e fotos de pousadas
- [ ] Implementar compressao automatica de imagens (sharp ja esta nas dependencias)

**Custo estimado mensal: R$ 0-50/mes**

---

### 1.5 Monitoramento & Observabilidade

- [ ] **Sentry** (error tracking):
  - [ ] Criar projeto no Sentry (Next.js)
  - [ ] Instalar `@sentry/nextjs`
  - [ ] Configurar `SENTRY_DSN`
  - [ ] Configurar source maps upload
  - [ ] Testar captura de erro
- [ ] **Uptime monitoring**:
  - [ ] Criar conta no UptimeRobot ou BetterStack
  - [ ] Monitorar `/api/readiness` (endpoint ja existe)
  - [ ] Configurar alertas por email/Slack/Discord
- [ ] **Logs centralizados** (opcional):
  - [ ] Logtail (Vercel) ou Datadog
  - [ ] Configurar forwarding de logs do deploy
- [ ] **Analytics de performance** (opcional, fase 2):
  - [ ] Vercel Analytics ou Web Vitals
  - [ ] Core Web Vitals: LCP < 2.5s, FID < 100ms, CLS < 0.1

**Custo estimado mensal: R$ 0-80/mes** (Sentry free tier disponivel)

---

## 2. Integracoes de Terceiros

### 2.1 WhatsApp Business API

Essencial para o DDC: atendimento automatizado de hospedes e integracao com Z-API/Twilio.

- [ ] Criar **Meta Business Account** (business.facebook.com)
- [ ] Criar **Meta Business Suite**
- [ ] Registrar numero de **WhatsApp Business** (pode ser um numero dedicado)
  - [ ] Verificar numero via codigo SMS
  - [ ] Configurar perfil: nome, foto, descricao, horario de atendimento
- [ ] Escolher provedor de API:
  - [ ] **Z-API** (recomendado para BR): `z-api.io`
    - [ ] Criar conta
    - [ ] Conectar instancia WhatsApp
    - [ ] Obter `Z_API_TOKEN` e `Z_API_INSTANCE`
    - [ ] Configurar webhooks (receber mensagens)
    - [ ] Testar envio de mensagem
    - [ ] Testar recebimento de mensagem
    - [ ] Custo: **R$ 159,90/mes** (plano padrao) ou **R$ 259,90/mes** (premium)
  - [ ] OU **Twilio** (alternativa global):
    - [ ] Criar conta
    - [ ] Obter numero Twilio
    - [ ] Configurar WhatsApp Sandbox
    - [ ] Custo: **~US$ 0,005/mensagem enviada + US$ 0,01/mensagem recebida**
- [ ] Configurar webhook de entrada:
  - [ ] `POST /api/whatsapp/webhook` (precisa criar esta rota)
  - [ ] Validar assinatura do webhook (HMAC verification)
  - [ ] Processar mensagens recebidas → ConversationLog
- [ ] Configurar webhook de status:
  - [ ] Entregue, lido, respondido
- [ ] Testar fluxo completo: enviar → receber → logar → responder

**Custo estimado mensal: R$ 160-260/mes (Z-API)**

---

### 2.2 Processamento de Pagamentos

O checkout ja esta implementado em `/api/checkout/create` com 4 planos:
- **Gratuito**: R$ 0 (trial 7 dias)
- **LITE**: R$ 197 (PIX) / R$ 247 (cartao)
- **PRO**: R$ 397 (PIX) / R$ 447 (cartao)
- **MAX**: R$ 697 (PIX) / R$ 797 (cartao)

**Mercado Pago (primario — PIX + Cartao BR):**

- [ ] Criar conta Mercado Pago (empresarial)
- [ ] Concluir verificacao de identidade
- [ ] Criar **Application** no Developers
- [ ] Obter `MERCADO_PAGO_ACCESS_TOKEN` (producao)
- [ ] Obter `MERCADO_PAGO_PUBLIC_KEY` (frontend)
- [ ] Configurar webhook de pagamentos:
  - [ ] URL: `https://api.zehla.com.br/api/webhooks/mercadopago`
  - [ ] Eventos: `payment`, `subscription`
  - [ ] Criar rota handler (precisa criar)
- [ ] Testar checkout PIX (gerar QR Code, aguardar pagamento)
- [ ] Testar checkout Cartao (tokenizacao, cobranca)
- [ ] Configurar notificacao de webhook para atualizar `PaymentTransaction`
- [ ] Implementar logica de ativacao de subscription apos pagamento aprovado

**Stripe (internacional + recorrência):**

- [ ] Criar conta Stripe (stripe.com)
- [ ] Concluir verificacao de negocio
- [ ] Obter `STRIPE_SECRET_KEY` e `STRIPE_PUBLISHABLE_KEY`
- [ ] Criar produtos e precos no Stripe Dashboard
- [ ] Configurar webhook (`stripe listen --forward-to localhost:3000/api/webhooks/stripe`)
- [ ] Implementar Stripe Checkout Session
- [ ] Testar fluxo de pagamento internacional
- [ ] Custo: **2.9% + US$ 0.30/transacao**

**Asaas (cobranca recorrente brasileira — opcional):**

- [ ] Criar conta Asaas (asaas.com)
- [ ] Obter API key
- [ ] Configurar cobranca recorrente mensal
- [ ] Custo: **R$ 0,99 + 3% por transacao PIX** / **R$ 2,99 + 3% boleto**

- [ ] Configurar rotas de webhook unificadas:
  - [ ] `/api/webhooks/mercadopago` — Mercado Pago events
  - [ ] `/api/webhooks/stripe` — Stripe events
  - [ ] `/api/webhooks/asaas` — Asaas events (se aplicavel)
- [ ] Implementar retry logic para webhooks (3 tentativas com backoff)
- [ ] Criar pagina de sucesso: `/checkout/success` (ja existe)
- [ ] Criar pagina de cancelamento: `/checkout/cancel` (ja existe)

**Custo estimado mensal: R$ 0 fixo (% por transacao)**

---

### 2.3 Email & Automacao de Marketing

Para: emails transacionais (bem-vindo, recuperacao de senha), email marketing (campanhas), relatorios.

- [ ] Criar conta **Resend** (resend.com) — recomendado para Next.js
  - [ ] Verificar dominio (DNS: DKIM, SPF, DMARC)
  - [ ] Obter `RESEND_API_KEY`
  - [ ] Criar dominio de envio: `mail.zehla.com.br`
  - [ ] Configurar DNS no registrador:
    - [ ] DKIM (CNAME: `resend._domainkey.mail.zehla.com.br`)
    - [ ] SPF (TXT record)
    - [ ] DMARC (TXT record)
  - [ ] Testar envio de email de teste
  - [ ] Verificar entregabilidade (mail-tester.com)
  - [ ] Custo: **R$ 0-80/mes** (free: 3K emails/mes, pro: R$ 80 para 50K)
- [ ] OU **SendGrid** (alternativa):
  - [ ] Criar conta
  - [ ] Verificar sender
  - [ ] Configurar API key
  - [ ] Custo: **R$ 0-150/mes** (free: 100 emails/dia)
- [ ] Configurar templates de email transacional:
  - [ ] Bem-vindo ao ZEHLA (trial iniciado)
  - [ ] Pagamento aprovado
  - [ ] Pagamento recusado
  - [ ] Trial expirando (3 dias antes)
  - [ ] Relatorio semanal de performance
  - [ ] Recuperacao de senha
- [ ] Configurar **ActiveCampaign** (autocao avancada):
  - [ ] Criar conta
  - [ ] Integrar com Resend (SMTP relay)
  - [ ] Criar automacao de onboarding
  - [ ] Criar sequencias de follow-up (email 1, 3, 7 dias)
  - [ ] Custo: **R$ 110-220/mes** (plano Lite: R$ 110, Plus: R$ 220)

**Custo estimado mensal: R$ 0-300/mes**

---

### 2.4 Analise, Tracking & Ads

**Google Analytics 4:**

- [ ] Criar conta Google Analytics
- [ ] Criar propriedade GA4 para `zehla.com.br`
- [ ] Obter `GA_MEASUREMENT_ID` (G-XXXXXXXXXX)
- [ ] Integrar no layout (Script do GA4)
- [ ] Configurar eventos customizados:
  - [ ] `checkout_started` (iniciou checkout)
  - [ ] `plan_selected` (selecionou plano)
  - [ ] `payment_completed` (pagamento aprovado)
  - [ ] `trial_started` (trial iniciado)
  - [ ] `signup_completed` (cadastro completo)
- [ ] Configurar conversoes no GA4

**Google Tag Manager (GTM):**

- [ ] Criar container GTM
- [ ] Integrar snippet no layout (`<Script>` no `layout.tsx`)
- [ ] Configurar tags: GA4, Meta Pixel, Hotjar (opcional)
- [ ] Publicar container

**Meta Pixel (Facebook/Instagram):**

- [ ] Criar Meta Pixel no Meta Business Manager
- [ ] Integrar via GTM ou diretamente
- [ ] Configurar eventos de conversao:
  - [ ] `Lead`, `Purchase`, `CompleteRegistration`
- [ ] Testar com Meta Pixel Helper (Chrome extension)

**Google Ads:**

- [ ] Criar conta Google Ads
- [ ] Configurar campanha de Search (keywords: "software pousada", "ia hotelaria", "automacao whatsapp hotel")
- [ ] Configurar campanha de Display (remarketing)
- [ ] Definir orcamento diario inicial: R$ 30-50/dia
- [ ] Configurar tracking de conversoes

**Meta Ads Manager:**

- [ ] Criar campanha no Meta Ads Manager
- [ ] Segmentar publico: proprietarios de pousadas, gestores hotel
- [ ] Criar 3-5 conjuntos de anuncios (lookalike, interesse, retargeting)
- [ ] Configurar orcamento diario: R$ 30-50/dia

**Custo estimado mensal: R$ 2.000-5.000/mes (ads)** — variavel

---

### 2.5 CRM & Orquestracao de Workflows

**CRM:**

- [ ] Criar conta **HubSpot CRM** (free tier) OU **Pipedrive**
  - [ ] HubSpot Free: contatos ilimitados, pipeline basico
  - [ ] Pipedrive: melhor para vendas B2B, R$ 99/mes
- [ ] Importar base de 10.000+ contatos de pousadas
- [ ] Configurar pipeline: Novo → Qualificado → Demonstracao → Negociacao → Fechado
- [ ] Configurar campos customizados (porte, cidade, estado, quartos, ADR)
- [ ] Integrar webhook: lead capturado na landing → criar contato no CRM

**Orquestracao (n8n / Make):**

- [ ] Instalar **n8n** (self-hosted) OU criar conta **Make.com**:
  - [ ] n8n self-hosted: free em VPS proprio (~R$ 25/mes em VPS barato)
  - [ ] Make.com: free tier limitado, Pro R$ 220/mes
- [ ] Configurar workflows:
  - [ ] **Lead Capture Flow**: Landing form → CRM → Email de boas-vindas
  - [ ] **Trial Activation Flow**: Pagamento aprovado → Criar tenant → Enviar onboarding
  - [ ] **Payment Alert Flow**: Falha de pagamento → Notificar Marcio + tenant
  - [ ] **Weekly Report Flow**: Toda segunda → Gerar metricas → Enviar email
  - [ ] **Churn Risk Flow**: Tenant sem login 7 dias → Alerta + reativacao

**Typebot (Triage WhatsApp):**

- [ ] Criar conta Typebot (typebot.io)
- [ ] Criar fluxo de triage: "Ola! Sou o ZEHLA. Como posso ajudar?"
  - [ ] Opcao 1: "Quero testar gratis" → Trial signup
  - [ ] Opcao 2: "Quero saber precos" → Pricing info
  - [ ] Opcao 3: "Falar com humano" → Transferir para Marcio
- [ ] Integrar Typebot com Z-API (webhook)
- [ ] Publicar fluxo e testar

**Custo estimado mensal: R$ 0-350/mes**

---

### 2.6 IA / LLM Providers (ZAOS NeuroRouter)

O ZAOS NeuroRouter implementa Thompson Sampling com 3 tiers de providers:
- **Tier 1 (Budget)**: Ollama local — custo zero
- **Tier 2 (Mid)**: Groq, Gemini Flash — custo baixo
- **Tier 3 (Premium)**: GPT-4o (OpenRouter), Claude — custo alto

**Configuracao obrigatoria:**

- [ ] **Google AI (Gemini)**:
  - [ ] Criar conta Google AI Studio (aistudio.google.com)
  - [ ] Gerar API Key
  - [ ] Ativar Gemini 2.0 Flash (Tier 2) e Gemini 1.5 Pro (Tier 3)
  - [ ] `GOOGLE_AI_API_KEY`
  - [ ] Custo: **Free tier generoso** (Gemini Flash gratuito ate 15 RPM)

- [ ] **OpenAI (GPT)**:
  - [ ] Criar conta OpenAI (platform.openai.com)
  - [ ] Adicionar credito (minimo US$ 5)
  - [ ] Gerar API Key
  - [ ] `OPENAI_API_KEY`
  - [ ] Custo: **~US$ 0,0025/1K input tokens (GPT-4o)**

- [ ] **Groq** (recomendado — ultra rapido, barato):
  - [ ] Criar conta Groq (console.groq.com)
  - [ ] Gerar API Key
  - [ ] `GROQ_API_KEY`
  - [ ] Custo: **Free tier generoso** (Llama 3.3 70B gratis ate 30 RPM)

- [ ] **Anthropic (Claude)** — opcional para Tier 3:
  - [ ] Criar conta Anthropic
  - [ ] Gerar API Key
  - [ ] `ANTHROPIC_API_KEY`
  - [ ] Custo: **US$ 0,003/1K input tokens (Claude Sonnet)**

- [ ] **OpenRouter** (gateway multi-provider):
  - [ ] Criar conta OpenRouter
  - [ ] Gerar API Key
  - [ ] `OPENROUTER_API_KEY`
  - [ ] Custo: **markup de ~20% sobre os providers**

**Budget Guard (ja implementado no codigo):**

- [ ] Configurar budget diario padrao: **US$ 50/dia**
- [ ] Configurar budget mensal padrao: **US$ 1.500/mes**
- [ ] Ajustar thresholds: WARNING em 60%, CRITICAL em 85%
- [ ] Testar limitacao de tier quando budget atinge WARNING
- [ ] Testar bloqueio total de Premium quando CRITICAL

**Custo estimado mensal: R$ 150-500/mes (variavel por uso)**

---

## 3. Configuracao do Projeto

### 3.1 Variaveis de Ambiente (LISTA EXAUSTIVA)

Todas as variaveis que precisam ser configuradas em producao:

```bash
# ============================================================
# ZEHLA — Variaveis de Ambiente de Producao
# Copie este template para .env.production no provedor
# ============================================================

# --- CORE ---
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://zehla.com.br
NEXT_PUBLIC_API_URL=https://api.zehla.com.br
PORT=3000

# --- DATABASE (PostgreSQL) ---
DATABASE_URL=postgresql://user:password@host:5432/zehla_db?sslmode=require&pgbouncer=true
DATABASE_URL_DIRECT=postgresql://user:password@host:5432/zehla_db?sslmode=require  # Para migrations (sem pgbouncer)
DATABASE_POOL_SIZE=20

# --- REDIS ---
REDIS_URL=redis://default:password@host:6379
REDIS_CACHE_TTL=3600

# --- AUTHENTICATION (NextAuth.js v4) ---
NEXTAUTH_SECRET=<gerar-32-chars-seguros-com-openssl-rand-base64-32>
NEXTAUTH_URL=https://zehla.com.br
# Se usar Clerk no futuro:
CLERK_SECRET_KEY=
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=

# --- WHATSAPP (Z-API) ---
Z_API_TOKEN=<token-z-api>
Z_API_INSTANCE=<instancia-z-api>
Z_API_PHONE=<numero-whatsapp-business>
Z_API_WEBHOOK_SECRET=<secret-para-validar-webhook>

# --- PAGAMENTOS ---
# Mercado Pago
MERCADO_PAGO_ACCESS_TOKEN=<access-token-producao>
MERCADO_PAGO_PUBLIC_KEY=<public-key-producao>
MERCADO_PAGO_WEBHOOK_SECRET=<webhook-secret>

# Stripe
STRIPE_SECRET_KEY=sk_live_...
STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Asaas (opcional)
ASAAS_API_KEY=
ASAAS_WEBHOOK_SECRET=
ASAAS_ENVIRONMENT=production

# --- EMAIL ---
RESEND_API_KEY=re_...
EMAIL_FROM=Zehla <contato@zehla.com.br>
EMAIL_FROM_NAME=Zehla

# --- IA / LLM PROVIDERS ---
# Google AI (Gemini)
GOOGLE_AI_API_KEY=...

# OpenAI
OPENAI_API_KEY=sk-...

# Groq
GROQ_API_KEY=gsk_...

# Anthropic (opcional)
ANTHROPIC_API_KEY=sk-ant-...

# OpenRouter
OPENROUTER_API_KEY=sk-or-...

# Ollama (local — se usar)
OLLAMA_BASE_URL=http://localhost:11434

# --- BUDGET GUARD (ZAOS) ---
BUDGUARD_DAILY_USD=50
BUDGUARD_MONTHLY_USD=1500
BUDGUARD_WARNING_THRESHOLD=0.60
BUDGUARD_CRITICAL_THRESHOLD=0.85

# --- ANALYTICS ---
GA_MEASUREMENT_ID=G-XXXXXXXXXX
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX

# Meta Pixel
NEXT_PUBLIC_META_PIXEL_ID=<pixel-id>

# --- MONITORING ---
SENTRY_DSN=https://key@sentry.io/project
SENTRY_ORG=zehla
SENTRY_PROJECT=zehla-prod
SENTRY_TRACE_SAMPLE_RATE=0.1

# --- STORAGE ---
# Cloudflare R2
R2_ACCOUNT_ID=
R2_ACCESS_KEY_ID=
R2_SECRET_ACCESS_KEY=
R2_BUCKET_NAME=zehla-assets
R2_PUBLIC_URL=https://assets.zehla.com.br

# OU AWS S3
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_REGION=sa-east-1
S3_BUCKET_NAME=zehla-assets

# --- CRM ---
HUBSPOT_API_KEY=
HUBSPOT_PORTAL_ID=
# OU Pipedrive
PIPEDRIVE_API_TOKEN=
PIPEDRIVE_COMPANY_DOMAIN=

# --- TYPEBOT ---
TYPEBOT_API_URL=https://typebot.io
TYPEBOT_BOT_ID=<bot-id>

# --- N8N / MAKE ---
N8N_WEBHOOK_URL=https://n8n.zehla.com.br/webhook/
MAKE_WEBHOOK_URL=https://hook.make.com/<id>

# --- SEGURANCA ---
CORS_ORIGINS=https://zehla.com.br,https://app.zehla.com.br,https://admin.zehla.com.br
RATE_LIMIT_MAX=100
RATE_LIMIT_WINDOW_MS=60000
JWT_SECRET=<gerar-secret-para-tokens>
ENCRYPTION_KEY=<chave-para-criptografar-api-keys-no-banco>
```

**Checklist de configuracao:**

- [ ] Copiar template para `.env.production`
- [ ] Preencher TODAS as variaveis obrigatorias (marcadas sem opcao)
- [ ] Gerar secrets criptograficos:
  - [ ] `NEXTAUTH_SECRET` → `openssl rand -base64 32`
  - [ ] `JWT_SECRET` → `openssl rand -hex 32`
  - [ ] `ENCRYPTION_KEY` → `openssl rand -hex 32`
- [ ] Configurar no provedor de hospedagem (Vercel Env Vars / Railway / .env.production)
- [ ] NUNCA commitar `.env` no git (verificar `.gitignore`)
- [ ] Criar `.env.example` com variaveis de exemplo (sem valores reais)

---

### 3.2 Migracao do Banco de Dados

**Passo a passo:**

- [ ] **Fase 1 — Preparacao local:**
  - [ ] Fazer backup do SQLite atual: `cp db/custom.db db/custom.db.bak`
  - [ ] Alterar `prisma/schema.prisma` para PostgreSQL
  - [ ] Remover campos SQLite-specific se houver
  - [ ] Adicionar `@default(uuid())` para IDs se necessario (atualmente usa `@default(cuid())`)
  - [ ] Validar schema: `npx prisma validate`

- [ ] **Fase 2 — Criar banco de producao:**
  - [ ] Criar database no provedor PostgreSQL
  - [ ] Configurar `DATABASE_URL` para producao
  - [ ] Executar `npx prisma migrate deploy` (producao — sem prompts)
  - [ ] Verificar todas as 30 tabelas foram criadas

- [ ] **Fase 3 — Migracao de dados:**
  - [ ] Exportar dados do SQLite (usando script customizado)
  - [ ] Transformar dados para formato PostgreSQL (timestamps, JSON fields)
  - [ ] Importar dados no PostgreSQL
  - [ ] Verificar integridade dos dados

- [ ] **Fase 4 — Seed de producao:**
  - [ ] Executar script `scripts/seed.ts` adaptado para producao
  - [ ] Verificar: 5 targets, 12 leads, 4 templates, 2 campanhas, 5 providers

- [ ] **Fase 5 — Validacao:**
  - [ ] Testar todas as queries do Prisma Client
  - [ ] Verificar indices foram criados (verificar `@@index` no schema)
  - [ ] Testar connection pooling com PgBouncer
  - [ ] Testar latencia de queries (< 100ms para queries simples)

---

### 3.3 Configuracao de Autenticacao

- [ ] Configurar NextAuth.js v4:
  - [ ] Criar `src/app/api/auth/[...nextauth]/route.ts` (se nao existe)
  - [ ] Configurar providers:
    - [ ] Credentials (email + password)
    - [ ] Google OAuth (opcional)
    - [ ] Magic Link (email) (opcional, futuro)
  - [ ] Configurar JWT strategy
  - [ ] Configurar callbacks: `jwt`, `session`
  - [ ] Configurar pages: login, error

- [ ] Implementar protecao de rotas:
  - [ ] `/dashboard/*` → requer autenticacao + tenant ativo
  - [ ] `/zcc/*` → requer autenticacao + role `admin`
  - [ ] `/api/ddc/*` → requer autenticacao + tenant_id valido

- [ ] Criar usuario admin inicial:
  - [ ] Email: `marcio@zehla.com.br`
  - [ ] Role: `admin`
  - [ ] Password: senha forte (salvar em gerenciador de senhas)
  - [ ] Inserir no banco via seed script ou SQL direto

- [ ] Criar middleware de autenticacao:
  - [ ] Verificar JWT em todas as rotas protegidas
  - [ ] Redirecionar para login se nao autenticado
  - [ ] Rate limiting em login (5 tentativas / 15 min)

- [ ] Testar fluxo completo:
  - [ ] Login com email/senha
  - [ ] Logout
  - [ ] Acesso a `/dashboard` (com tenant ativo)
  - [ ] Acesso a `/zcc` (com role admin)
  - [ ] Acesso negado para usuario nao-admin no ZCC

---

### 3.4 CI/CD Pipeline (GitHub Actions)

- [ ] Criar `.github/workflows/deploy.yml`:

```yaml
# Pipeline recomendada
on:
  push:
    branches: [main]  # Deploy producao
  pull_request:
    branches: [develop]  # Preview deploy

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: oven-sh/setup-bun@v2
      - run: bun install --frozen-lockfile
      - run: bun run lint
      - run: bun run build
      - run: bun run prisma generate
      # Deploy step (depende do provedor)
```

- [ ] Configurar secrets no GitHub:
  - [ ] `DATABASE_URL`
  - [ ] `NEXTAUTH_SECRET`
  - [ ] Todas as API keys necessarias
- [ ] Pipeline: lint → type-check → build → test → deploy
- [ ] Deploy automatico em push para `main`
- [ ] Preview deploy em push para `develop`/PR
- [ ] Notificacao de deploy no Slack/Discord (opcional)

---

### 3.5 Configuracao de DNS

- [ ] No registrador do dominio (Registro.br, Cloudflare, etc.):
  - [ ] A Record: `zehla.com.br` → IP do provedor
  - [ ] CNAME: `app.zehla.com.br` → provedor
  - [ ] CNAME: `admin.zehla.com.br` → provedor
  - [ ] CNAME: `assets.zehla.com.br` → Cloudflare R2
  - [ ] MX Records: Google Workspace ou Zoho Mail
  - [ ] TXT: SPF, DKIM, DMARC (para email)
  - [ ] TXT: Google Site Verification
  - [ ] TXT: Meta Domain Verification

---

## 4. Dados Iniciais

### 4.1 Base de Contatos (10,000+ leads)

A arquitetura comercial menciona uma base pre-existente de 10.000+ contatos de pousadas validados.

- [ ] Extrair base de contatos (CSV/Excel) da fonte original
- [ ] Mapear campos para o modelo `Lead` do Prisma:
  - [ ] `empresa` → Nome da pousada
  - [ ] `decisor` → Nome do proprietario/gerente
  - [ ] `cargo` → Cargo (Proprietario, Gerente, etc.)
  - [ ] `email` → Email de contato
  - [ ] `whatsapp` → Numero WhatsApp
  - [ ] `porte` → Pequeno (1-10 quartos), Medio (11-30), Grande (30+)
  - [ ] `status` → pending (inicial)
- [ ] Validar emails (usar Hunter.io ou NeverBounce):
  - [ ] Remover emails invalidos/bounce
  - [ ] Estimar: ~70% validos = ~7.000 emails validos
- [ ] Validar telefones (formato E.164: +55XXYYYYYYYY)
- [ ] Classificar por regiao:
  - [ ] Sudeste (SP, RJ, MG, ES) — maior concentracao
  - [ ] Nordeste (BA, CE, PE, RN)
  - [ ] Sul (PR, SC, RS)
  - [ ] Centro-Oeste (GO, MT, MS, DF)
  - [ ] Norte (AM, PA, etc.)
- [ ] Segmentar em cohorts:
  - [ ] **Tier 1**: Pousadas premium (ADR > R$ 400, >15 quartos) — ~2.000
  - [ ] **Tier 2**: Pousadas mid-range (ADR R$ 200-400, 8-15 quartos) — ~4.000
  - [ ] **Tier 3**: Pousadas budget (ADR < R$ 200, <8 quartos) — ~4.000
- [ ] Importar no banco via script bulk (Prisma `createMany` em batches de 100)
- [ ] Duplicar check: remover leads com email duplicado

---

### 4.2 Dados de Demonstracao

Para apresentacoes comerciais e testes:

- [ ] Criar tenant demo (pousada exemplo):
  - [ ] Nome: "Pousada Zehla Demo"
  - [ ] Plano: PRO
  - [ ] Cidade: Buzios, RJ
- [ ] Popular dados do tenant demo:
  - [ ] Property: nome, endereco, servicos, metodos de pagamento
  - [ ] Rooms: 8 quartos (2 standard, 3 luxo, 2 suite, 1 chale)
  - [ ] Precos: R$ 180-550/noite
  - [ ] Disponibilidade: 30 dias a frente
- [ ] Gerar conversacoes mock de WhatsApp:
  - [ ] 15 conversacoes (mix de: reserva, preco, amenidades, reclamacao)
  - [ ] Variar sentimento: positivo, neutro, negativo
  - [ ] Incluir conversas com booking concluido
- [ ] Gerar metricas de performance mock:
  - [ ] Receita mensal: R$ 45.000
  - [ ] Ocupacao: 68%
  - [ ] ADR: R$ 380
  - [ ] AI autonomy: 75%
  - [ ] Response time: 3.2s
  - [ ] Conversao: 12%
- [ ] Criar pipeline de hspedes com 20+ hspedes em varios estagios

---

### 4.3 Conteudo de Marketing

**Emails (3 variantes A/B/C):**

- [ ] **Email A — Angulo Financeiro:**
  - [ ] Assunto: "Quanto sua pousada esta perdendo por nao ter IA?"
  - [ ] Corpo: calculadora de perda de receita, case study
- [ ] **Email B — Angulo Operacional:**
  - [ ] Assunto: "Atenda 24h sem contratar mais ninguem"
  - [ ] Corpo: fluxo de WhatsApp automático, reducao de workload
- [ ] **Email C — Angulo Ocupacao:**
  - [ ] Assunto: "Pousadas em [CIDADE] aumentaram ocupacao em 8% com IA"
  - [ ] Corpo: dados regionais, social proof

**Criativos Meta Ads (3 variacoes):**

- [ ] **Ad 1 — ROI Calculator**: "Calcule quanto a ZEHLA pode gerar para sua pousada"
- [ ] **Ad 2 — Social Proof**: "X pousadas ja usam IA da ZEHLA para vender mais"
- [ ] **Ad 3 — Urgencia**: "Teste gratis por 7 dias — sem cartao de credito"

**Keywords Google Ads:**

- [ ] "software para pousada"
- [ ] "ia para hotelaria"
- [ ] "automacao whatsapp hotel"
- [ ] "sistema de reservas pousada"
- [ ] "chatbot whatsapp pousada"
- [ ] "precos dinamicos pousada"
- [ ] "sistema gestao hotelaria ia"
- [ ] "atendimento automatico hspedes"

**Landing Page:**

- [ ] Revisar copy final de todas as 15 secoes:
  - [ ] HeroSection: tagline, CTA principal
  - [ ] TrustBadges: logotipos de confianca
  - [ ] PainPoints: dores do proprietario de pousada
  - [ ] Features: features do ZEHLA
  - [ ] HowItWorks: 3 passos
  - [ ] SavingsCalculator: calculadora de economia
  - [ ] Testimonials: depoimentos de beta testers
  - [ ] Pricing: 4 planos com valores corretos
  - [ ] FAQ: perguntas frequentes
  - [ ] FinalCTA: chamada final para acao
- [ ] Revisar responsividade mobile (testar em 320px, 375px, 768px)
- [ ] Otimizar imagens (WebP, lazy loading)
- [ ] Configurar Open Graph / Twitter Cards (meta tags para compartilhamento)

---

## 5. Validacao Final

### 5.1 Testes Manuais — DDC Dashboard (`/dashboard`)

- [ ] Dashboard carrega em < 3 segundos (em conexao 4G)
- [ ] Aba "Visao Geral": metricas de receita, reservas, mensagens, ocupacao aparecem
- [ ] Aba "Mensagens": live feed de WhatsApp funciona (recebe/envia mensagens)
- [ ] Aba "Reservas": lista de reservas, filtros, criacao de nova reserva
- [ ] Aba "Analytics": graficos de performance, tendencias, comparacoes
- [ ] Aba "Configuracoes": dados da pousada, senha, logout
- [ ] Pipeline CRM de hspedes: drag-and-drop funciona (@dnd-kit instalado)
- [ ] Training Center: carrega prompts de treinamento
- [ ] Quick Actions: botoes de acao rapida funcionam
- [ ] Notifications: badge de notificacoes, marcar como lido
- [ ] Mobile responsivo: usavel em 375px (iPhone SE)
- [ ] Dark mode funciona (next-themes instalado)
- [ ] Navegacao entre abas sem perda de estado

### 5.2 Testes Manuais — ZCC (`/zcc`)

- [ ] Aba "Visao Geral":
  - [ ] Cards de KPIs (receita, tenants, leads, campaigns)
  - [ ] ClientOverview: lista dos 10 beta testers com status
  - [ ] Activity feed: atividades recentes
- [ ] Aba "Cerebro ZELLA":
  - [ ] CerebroZella: Thompson Sampling status dos 5 providers
  - [ ] Barras de alpha/beta atualizadas
  - [ ] Circuit breaker status (closed/half_open/open)
  - [ ] BudgetGuard: consumo diario/mensal, niveis (nominal/warning/critical)
  - [ ] CognitiveObservability: metricas de latencia, custo, cache hit rate
- [ ] Aba "Prospeccao":
  - [ ] HunterConsole: formulario de prospeccao, status de hunt
  - [ ] LeadsTable: tabela com filtro, ordenacao, busca
  - [ ] TargetsPanel: lista de targets com prioridade
  - [ ] CampaignPanel: criar/editar campanha
  - [ ] DispararEliteButton: envio em massa de WhatsApp
  - [ ] RevenueReportElite: diagnostico de receita
- [ ] Aba "Configuracoes":
  - [ ] ApiKeysPanel: configurar API keys dos providers
  - [ ] FintechHub: configurar pagamentos
  - [ ] TenantManagement: CRUD de tenants
  - [ ] SwarmOverview: visao dos agents ativos
  - [ ] ScaleMetrics: metricas de escala

### 5.3 Testes Manuais — Landing Page (`/`)

- [ ] HeroSection: carrega com animacoes (framer-motion), tagline visivel
- [ ] TrustBadges: logos/indicadores de confianca visiveis
- [ ] PainPoints: 3-4 dores listadas com icone
- [ ] FeaturesSection: features do ZEHLA com descricao
- [ ] HowItWorksSection: 3 passos claros
- [ ] SavingsCalculator: interativa, calcula economia
- [ ] TestimonialsSection: depoimentos dos beta testers
- [ ] PricingSection: 4 planos com valores corretos (R$0, R$197, R$397, R$697)
- [ ] PricingSection: toggle PIX/Cartao funciona
- [ ] PricingSection: botao de checkout abre formulario/checkout
- [ ] FAQSection: accordion com perguntas frequentes
- [ ] FinalCTASection: chamada final para acao
- [ ] Footer: links, copyright, redes sociais
- [ ] **Mobile responsivo** (TESTE PRINCIPAL):
  - [ ] 375px (iPhone SE): legivel, sem scroll horizontal
  - [ ] 390px (iPhone 14): layout adaptado
  - [ ] 768px (iPad): layout tablet correto
- [ ] Performance: LCP < 2.5s, CLS < 0.1
- [ ] Checkout fluxo completo:
  - [ ] Clicar "Comecar Trial" → formulario email/nome
  - [ ] Submit → `/api/checkout/create`
  - [ ] Trial: redirect para `/dashboard`
  - [ ] Pago: redirect para checkout URL
  - [ ] `/checkout/success`: confirmacao de pagamento
  - [ ] `/checkout/cancel`: pagina de cancelamento

### 5.4 Testes de Integracao End-to-End

- [ ] Lead capturado na landing → aparece como Lead no ZCC
- [ ] Checkout aprovado → Subscription criada com status `active`
- [ ] Tenant criado → DDC dashboard acessivel
- [ ] Mensagem WhatsApp recebida → aparece no live feed do DDC
- [ ] ZAOS Router classifica contexto → seleciona provider correto
- [ ] Agent Log registrado → aparece no ZCC
- [ ] Pagamento webhook (Mercado Pago) → PaymentTransaction atualizada
- [ ] Dados do DDC (metricas) → refletem no ZCC (visao global)
- [ ] Login funciona em todos os modulos (Landing → Dashboard → ZCC)
- [ ] Logout em qualquer modulo → redireciona para login
- [ ] Navegacao entre modulos sem re-login (JWT valido)

---

## 6. Orcamento Mensal Estimado

### 6.1 Custo Minimo de Operacao (MVP)

| Item | Provedor Recomendado | Custo/Mes (R$) | Tipo |
|------|---------------------|---------------|------|
| Hospedagem (Next.js) | Vercel (Hobby) ou Fly.io | R$ 0-50 | Fixo |
| PostgreSQL | Neon (Free Tier) | R$ 0 | Fixo |
| Redis | Upstash (Free Tier) | R$ 0 | Fixo |
| Storage | Cloudflare R2 | R$ 0 | Fixo |
| SSL/CDN | Incluso no provedor | R$ 0 | Fixo |
| Monitoring (Sentry) | Sentry (Free Tier) | R$ 0 | Fixo |
| WhatsApp API | Z-API (Plano Padrao) | R$ 159,90 | Fixo |
| Email (Resend) | Resend (Free Tier) | R$ 0 | Fixo |
| CRM | HubSpot (Free) | R$ 0 | Fixo |
| Orquestracao | n8n (self-hosted) | R$ 0 | Fixo |
| IA Providers | Groq (Free) + Gemini (Free) | R$ 0 | Variavel |
| **TOTAL MINIMO** | | **R$ ~160/mes** | |

### 6.2 Custo de Crescimento (10-50 tenants ativos)

| Item | Provedor Recomendado | Custo/Mes (R$) | Tipo |
|------|---------------------|---------------|------|
| Hospedagem (Next.js) | Vercel (Pro) ou Railway | R$ 50-100 | Fixo |
| PostgreSQL | Neon (Pro) ou Supabase (Pro) | R$ 100-200 | Fixo |
| Redis | Upstash (Pro) | R$ 25-50 | Fixo |
| Storage | Cloudflare R2 | R$ 10-30 | Fixo |
| Monitoring | Sentry (Team) | R$ 50 | Fixo |
| WhatsApp API | Z-API (Premium) | R$ 259,90 | Fixo |
| Email | Resend (Pro) | R$ 80 | Fixo |
| CRM | HubSpot (Starter) ou Pipedrive | R$ 99-220 | Fixo |
| Orquestracao | n8n (self-hosted) | R$ 25 | Fixo |
| Typebot | Typebot (Pro) | R$ 60 | Fixo |
| IA Providers | OpenAI + Groq + Gemini | R$ 150-300 | Variavel |
| Google Ads | AdWords | R$ 2.000-3.000 | Variavel |
| Meta Ads | Meta Ads Manager | R$ 2.000-3.000 | Variavel |
| Uptime Monitoring | BetterStack | R$ 12 | Fixo |
| **TOTAL CRESCIMENTO** | | **R$ 2.920-4.790/mes** | |

### 6.3 Custo de Escala (50+ tenants)

| Item | Provedor | Custo/Mes (R$) |
|------|---------|---------------|
| Infra completa (VPS dedicado + PG + Redis) | Hetzner + self-managed | R$ 200-400 |
| WhatsApp API | Z-API Premium | R$ 259,90 |
| Email marketing | ActiveCampaign (Plus) | R$ 220 |
| CRM | Pipedrive (Professional) | R$ 290 |
| IA Providers (uso intensivo) | Multi-provider | R$ 500-1.500 |
| Ads (escala) | Google + Meta | R$ 5.000-15.000 |
| Monitoramento | Datadog ou Sentry Business | R$ 200 |
| **TOTAL ESCALA** | | **R$ 6.670-17.870/mes** |

---

## 7. Timeline de Ativacao

### Semana 1: Fundacao de Infraestrutura

| Dia | Atividade | Responsavel | Status |
|-----|-----------|-------------|--------|
| Seg | Escolher provedor de hospedagem e criar conta | Marcio | [ ] |
| Seg | Registrar dominio e configurar DNS basico | Marcio | [ ] |
| Ter | Provisionar PostgreSQL (Neon) e testar conexao | Dev | [ ] |
| Ter | Migrar Prisma schema de SQLite para PostgreSQL | Dev | [ ] |
| Qua | Provisionar Redis (Upstash) | Dev | [ ] |
| Qua | Configurar todas as variaveis de ambiente | Dev | [ ] |
| Qui | Executar seed script e validar dados | Dev | [ ] |
| Qui | Fazer primeiro deploy (landing page) | Dev | [ ] |
| Sex | Testar landing page em producao, corrigir bugs | Dev + Marcio | [ ] |
| Sex | Configurar SSL e CDN | Dev | [ ] |

### Semana 2: Integracoes Core

| Dia | Atividade | Responsavel | Status |
|-----|-----------|-------------|--------|
| Seg | Configurar NextAuth.js (login/logout) | Dev | [ ] |
| Seg | Criar usuario admin (Marcio) | Dev | [ ] |
| Ter | Integrar Z-API WhatsApp | Dev | [ ] |
| Ter | Testar envio/recebimento WhatsApp | Dev | [ ] |
| Qua | Integrar Mercado Pago | Dev | [ ] |
| Qua | Testar checkout PIX e cartao | Dev + Marcio | [ ] |
| Qui | Configurar Resend + DNS de email | Dev | [ ] |
| Qui | Testar envio de emails transacionais | Dev | [ ] |
| Sex | Configurar Sentry error tracking | Dev | [ ] |
| Sex | Configurar CI/CD (GitHub Actions) | Dev | [ ] |

### Semana 3: Conteudo & Marketing Setup

| Dia | Atividade | Responsavel | Status |
|-----|-----------|-------------|--------|
| Seg | Configurar GA4 + GTM + Meta Pixel | Marcio | [ ] |
| Seg | Criar contas Google Ads e Meta Ads | Marcio | [ ] |
| Ter | Importar base de 10.000 leads no CRM | Marcio | [ ] |
| Ter | Segmentar leads em cohorts | Marcio | [ ] |
| Qua | Criar emails de prospeccao (3 variantes) | Marcio | [ ] |
| Qua | Configurar ActiveCampaign automacoes | Marcio | [ ] |
| Qui | Criar Typebot (triage WhatsApp) | Dev + Marcio | [ ] |
| Qui | Configurar n8n workflows basicos | Dev | [ ] |
| Sex | Criar campanhas Google Ads e Meta Ads | Marcio | [ ] |
| Sex | Configurar orçamento de ads (R$ 30/dia cada) | Marcio | [ ] |

### Semana 4: Testes, Tuning & Go-Live

| Dia | Atividade | Responsavel | Status |
|-----|-----------|-------------|--------|
| Seg | Teste completo da Landing Page (todos dispositivos) | Dev + Marcio | [ ] |
| Seg | Teste completo do DDC Dashboard | Dev + Marcio | [ ] |
| Ter | Teste completo do ZCC | Dev + Marcio | [ ] |
| Ter | Testes de integracao end-to-end | Dev | [ ] |
| Qua | Criar tenant demo com dados de demonstracao | Dev | [ ] |
| Qua | Performance audit (Lighthouse, Web Vitals) | Dev | [ ] |
| Qui | Security audit (headers, rate limiting, CORS) | Dev | [ ] |
| Qui | Deploy final em producao | Dev | [ ] |
| **Sex** | **GO-LIVE** | **Time completo** | [ ] |
| Sex | Monitorar metricas e corrigir bugs em tempo real | Dev + Marcio | [ ] |

---

## 8. Riscos & Mitigacoes

| # | Risco | Probabilidade | Impacto | Severidade | Mitigacao |
|---|-------|--------------|---------|-----------|-----------|
| 1 | **WhatsApp API bloqueada** — Z-API sofre restricao da Meta | Media | Alto | **Alto** | Ter Twilio como backup; manter contrato com ambos |
| 2 | **Custo de IA escapa do controle** — Budget Guard falha | Media | Medio | **Alto** | Implementar hard cap diario (US$ 50) no code; alertas no Slack |
| 3 | **Migracao SQLite → PostgreSQL perde dados** | Baixa | Critico | **Alto** | Backup completo antes; migracao em staging primeiro; rollback planejado |
| 4 | **PgBouncer nao suporta prepared statements** — Prisma precisa | Alta | Medio | **Medio** | Usar `pgbouncer=true` na URL; Prisma 6+ suporta nativamente |
| 5 | **Landing page lenta em mobile (3G)** | Media | Alto | **Alto** | Otimizar imagens; code splitting; testar em throttling; CDN global |
| 6 | **Checkout nao converte** — fluxo de pagamento confuso | Media | Critico | **Alto** | Testar com 5 usuarios reais; simplificar para max 3 passos |
| 7 | **Meta Ads nao gera leads** | Media | Alto | **Alto** | A/B test de criativos; ajustar targeting; segmentar por regiao |
| 8 | **Lead nao responde emails** | Alta | Medio | **Medio** | Complementar com WhatsApp (taxa de resposta 10x maior) |
| 9 | **Vercel limita serverless function execution time** | Baixa | Medio | **Medio** | Migrar para Railway/Fly.io se necessario; usar streaming responses |
| 10 | **Tenant atinge limite do plano e reclama** | Media | Baixo | **Baixo** | Upsell proativo; notificacao 80% do limite; auto-upgrade option |
| 11 | **Banco de dados atinge limite do free tier** | Media | Medio | **Medio** | Monitorar uso semanal; budget alerta em 80%; migrar para plano pago antes do limite |
| 12 | **Bug critico em producao sem rollback** | Baixa | Critico | **Alto** | CI/CD com rollback automatico; blue-green deploy; backup diario do banco |
| 13 | **Marcio nao consegue usar o ZCC** (UX confuso) | Alta | Alto | **Alto** | Testar com Marcio toda semana; documentacao interna; video walkthrough |
| 14 | **Competidor copia o produto** | Media | Medio | **Medio** | Speed de iteracao; feature lock com dados proprietarios; network effects |

---

## 9. Pos-Ativacao: Primeiros 30 Dias

### Semana 1 Pos-Launch (Dias 1-7)

- [ ] Monitorar uptime 24/7 (UptimeRobot)
- [ ] Verificar todos os webhooks estao recebendo eventos
- [ ] Revisar logs de erro no Sentry diariamente
- [ ] Responder todos os suportes em < 2 horas
- [ ] Ajustar Google Ads e Meta Ads com base nos primeiros dados
- [ ] Enviar emails de prospeccao para Tier 1 (2.000 leads)
- [ ] Coletar feedback dos primeiros usuarios (NPS)
- [ ] Corrigir bugs criticos encontrados

### Semana 2 Pos-Launch (Dias 8-14)

- [ ] Enviar emails de prospeccao para Tier 2 (4.000 leads)
- [ ] Ajustar campanhas de ads (CPA target < R$ 50 por lead)
- [ ] Implementar melhorias na Landing Page com base em heatmaps
- [ ] Atualizar Budget Guard com dados reais de custo de IA
- [ ] Configurar relatorio semanal automatico (n8n → email)
- [ ] Criar base de conhecimento interna (notas de bugs, workarounds)

### Semana 3 Pos-Launch (Dias 15-21)

- [ ] Enviar emails de prospeccao para Tier 3 (4.000 leads)
- [ ] A/B test de emails (variantes A/B/C)
- [ ] Otimizar conversao do checkout (checkout → pagamento)
- [ ] Revisar e ajustar pricing se necessario (com base em feedback)
- [ ] Configurar Typebot para triage automatica no WhatsApp
- [ ] Primeira retrospectiva: o que funcionou, o que nao funcionou

### Semana 4 Pos-Launch (Dias 22-30)

- [ ] Consolidar metricas: CAC, LTV, churn rate, MRR
- [ ] Revisar orcamento mensal vs. real gasto
- [ ] Planejar features para proximo sprint
- [ ] Documentar processos operacionais (runbook)
- [ ] Celebrar o primeiro mes no ar 🎉

---

## Anexo A: Modelos Prisma (30 tabelas)

Referencia rapida dos modelos criados no `prisma/schema.prisma`:

| # | Modelo | Funcao | Prefixo Tabela |
|---|--------|--------|---------------|
| 1 | User | Autenticacao de usuarios | `users` |
| 2 | Tenant | Pousada/Hotel cliente | `tenants` |
| 3 | Property | Dados fisicos da pousada | `properties` |
| 4 | Room | Quartos disponiveis | `rooms` |
| 5 | ApiConfig | Chaves de API dos providers de IA | `api_configs` |
| 6 | AgentConfig | Configuracao de agents por tenant | `agent_configs` |
| 7 | AuditLog | Logs de acoes (auditoria) | `audit_logs` |
| 8 | Lead | Leads de prospeccao (10.000+) | `leads` |
| 9 | Target | Pousadas-alvo para prospeccao | `targets` |
| 10 | AgentLog | Logs de acoes da IA (Lessie, Router) | `agent_logs` |
| 11 | SecurityAlert | Alertas de seguranca | `security_alerts` |
| 12 | SwipeTemplate | Templates de mensagens WhatsApp | `swipe_templates` |
| 13 | Campaign | Campanhas de marketing | `campaigns` |
| 14 | TrendKeyword | Keywords de tendencia | `trend_keywords` |
| 15 | TrendDataPoint | Dados historicos de keywords | `trend_data_points` |
| 16 | RouterProvider | Configuracao do ZAOS NeuroRouter | `router_providers` |
| 17 | BudgetGuardState | Estado do controle orcamentario IA | `budget_guard_state` |
| 18 | Subscription | Assinatura de planos | `subscriptions` |
| 19 | PaymentTransaction | Transacoes de pagamento | `payment_transactions` |
| 20 | Guest | Hospedes do CRM | `guests` |
| 21 | GuestMessage | Mensagens de hspedes | `guest_messages` |
| 22 | Booking | Reservas | `bookings` |
| 23 | AIActivityLog | Logs de atividade da IA | `ai_activity_logs` |
| 24 | ConversationLog | Conversas WhatsApp (agregadas) | `conversation_logs` |
| 25 | ConversationMessage | Mensagens individuais de conversa | `conversation_messages` |
| 26 | KnowledgeEntry | Base de conhecimento por tenant | `knowledge_entries` |
| 27 | TrainingPrompt | Prompts de treinamento da IA | `training_prompts` |
| 28 | Notification | Notificacoes no dashboard | `notifications` |
| 29 | PerformanceSnapshot | Metricas diarias de performance | `performance_snapshots` |
| 30 | QuickAction | Acoes rapidas customizadas | `quick_actions` |

---

## Anexo B: Rotas da API (18+ endpoints)

| Metodo | Rota | Modulo | Descricao |
|--------|------|--------|-----------|
| GET/POST | `/api/leads` | ZCC | Listar/Criar leads de prospeccao |
| GET/PUT/DELETE | `/api/leads/[id]` | ZCC | Detalhes/Atualizar/Deletar lead |
| GET/POST | `/api/targets` | ZCC | Listar/Criar targets |
| GET/PUT/DELETE | `/api/targets/[id]` | ZCC | Detalhes/Atualizar/Deletar target |
| GET/POST | `/api/campaigns` | ZCC | Listar/Criar campanhas |
| GET/PUT/DELETE | `/api/campaigns/[id]` | ZCC | Detalhes/Atualizar/Deletar campanha |
| POST | `/api/bulk-whatsapp` | ZCC | Envio em massa WhatsApp |
| POST | `/api/hunt` | ZCC | Prospeccao automatizada (Lessie AI) |
| GET (SSE) | `/api/hunt-stream` | ZCC | Stream de prospeccao em tempo real |
| GET/POST | `/api/swipe-templates` | ZCC | Templates de mensagens |
| POST | `/api/diagnose` | ZCC | Diagnostico de receita |
| GET | `/api/roi` | ZCC | Calculo de ROI |
| GET | `/api/agent-logs` | ZCC | Logs de agentes de IA |
| GET | `/api/readiness` | Core | Health check |
| GET | `/api/router/providers` | ZCC | Status dos providers do ZAOS |
| GET | `/api/router/budget` | ZCC | Status do Budget Guard |
| GET | `/api/brain/health` | ZCC | Saude do cerebro ZELLA |
| GET/POST | `/api/brain/intents` | ZCC | Intencoes de conversas |
| POST | `/api/checkout/create` | Landing | Criar checkout/pedido |
| GET | `/api/checkout/success` | Landing | Pagamento aprovado |
| GET | `/api/checkout/cancel` | Landing | Pagamento cancelado |
| GET/POST | `/api/ddc/guests` | DDC | Hospedes do CRM |
| GET/PUT/DELETE | `/api/ddc/guests/[id]` | DDC | Detalhes do hospede |
| GET | `/api/ddc/bookings` | DDC | Reservas |
| GET | `/api/ddc/metrics` | DDC | Metricas de performance |
| GET | `/api/ddc/live-feed` | DDC | Feed de atividades em tempo real |
| GET | `/api/ddc/conversations` | DDC | Conversas WhatsApp |
| GET/POST | `/api/ddc/training` | DDC | Prompts de treinamento |
| GET/PUT/DELETE | `/api/ddc/training/[id]` | DDC | Detalhes do prompt |
| GET | `/api/ddc/ai-status` | DDC | Status dos providers IA |
| GET/POST | `/api/ddc/notifications` | DDC | Notificacoes |
| POST | `/api/ddc/notifications/read-all` | DDC | Marcar todas como lidas |
| GET | `/api/download/[filename]` | Landing | Download de arquivos |
| GET | `/api/route` | Core | API root |

---

## Anexo C: Planos de Precos (referencia)

| Plano | Preco PIX | Preco Cartao | Trial | Hspedes/mes | Mensagens/mes |
|-------|-----------|-------------|-------|-------------|--------------|
| **Gratuito** | R$ 0 | R$ 0 | 7 dias | 5 | 100 |
| **LITE** | R$ 197/mes | R$ 247/mes | — | 50 | 500 |
| **PRO** | R$ 397/mes | R$ 447/mes | — | Ilimitado | Ilimitado |
| **MAX** | R$ 697/mes | R$ 797/mes | — | Ilimitado | Ilimitado |

---

## Anexo D: Comandos Essenciais

```bash
# Desenvolvimento
bun install                    # Instalar dependencias
bun run dev                    # Iniciar dev server (porta 3000)
bun run build                  # Build de producao
bun run start                  # Servidor de producao

# Banco de Dados
npx prisma validate            # Validar schema
npx prisma generate            # Gerar Prisma Client
npx prisma migrate dev          # Criar migration (desenvolvimento)
npx prisma migrate deploy       # Aplicar migrations (producao)
npx prisma db push             # Push direto (sem migration)
npx prisma studio              # Abrir Prisma Studio (visual)

# Seed
bun run scripts/seed.ts        # Popular banco com dados iniciais

# Deploy
chmod +x deploy.sh && ./deploy.sh --push  # Build + deploy completo

# Gerar secrets
openssl rand -base64 32        # NEXTAUTH_SECRET
openssl rand -hex 32            # JWT_SECRET
```

---

## Anexo E: Contatos & Contas para Criar

| Servico | URL para Criar Conta | Prioridade |
|---------|---------------------|-----------|
| Vercel | vercel.com/signup | Obrigatoria |
| Neon (PostgreSQL) | neon.tech/signup | Obrigatoria |
| Upstash (Redis) | upstash.com/signup | Obrigatoria |
| Z-API (WhatsApp) | z-api.io | Obrigatoria |
| Mercado Pago | mercadoPago.com.br/developers | Obrigatoria |
| Resend (Email) | resend.com/signup | Obrigatoria |
| Sentry | sentry.io/signup | Obrigatoria |
| Google AI Studio | aistudio.google.com | Obrigatoria |
| OpenAI | platform.openai.com | Obrigatoria |
| Groq | console.groq.com | Recomendada |
| Cloudflare (R2) | dash.cloudflare.com | Recomendada |
| Stripe | stripe.com | Recomendada |
| HubSpot CRM | hubspot.com/products/crm/free | Recomendada |
| n8n | n8n.io/cloud | Recomendada |
| Google Analytics | analytics.google.com | Recomendada |
| Meta Business | business.facebook.com | Recomendada |
| Google Ads | ads.google.com | Recomendada |
| UptimeRobot | uptimerobot.com | Recomendada |
| Anthropic | console.anthropic.com | Opcional |
| OpenRouter | openrouter.ai | Opcional |
| Asaas | asaas.com | Opcional |
| Typebot | typebot.io | Opcional |
| ActiveCampaign | activecampaign.com | Opcional (fase 2) |

---

> **Ultima atualizacao**: Julho 2025
> **Versao do projeto**: Next.js 16.1 + TypeScript + Prisma 6.11 + Tailwind CSS 4
> **Modelos Prisma**: 30 tabelas
> **API Routes**: 30+ endpoints
> **Componentes**: Landing (15) + DDC (12+) + ZCC (14+)

---

*Marcio — este documento e seu mapa. Imprima. Check um por um. Quando tiver 80% dos itens marcados, voce esta pronto para go-live. Boa sorte! 🚀*
