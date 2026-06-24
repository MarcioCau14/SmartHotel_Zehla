# ZEHLA SmartHotel — Staging Deployment Guide

## Visão Geral

O ambiente de staging usa duas plataformas:
- **Vercel** — Aplicação Next.js (frontend + API routes)
- **Railway** — Mini-serviço Socket.IO (realtime-service)

Ambos são configurados automaticamente pelo workflow `.github/workflows/deploy-staging.yml` ao fazer push na branch `develop`.

---

## 1. Vercel (App Principal)

### 1.1 Criar projeto

1. Acesse [vercel.com/new](https://vercel.com/new)
2. Importe o repositório `MarcioCau14/SmartHotel_Zehla`
3. Framework: **Next.js** (detectado automaticamente)
4. Root directory: `secretaria-ai/` (se o app estiver nesta subpasta) ou raiz
5. Build command: `bun run build`
6. Install command: `bun install --frozen-lockfile`

### 1.2 Variáveis de ambiente

Vá em **Settings → Environment Variables** e configure:

```env
# Database
DATABASE_URL="file:./db/staging.db"

# NextAuth
NEXTAUTH_URL="https://zehla-staging.vercel.app"
NEXTAUTH_SECRET="<gerar com: openssl rand -base64 32>"

# Mercado Pago (MOCK — sem token real)
MP_ACCESS_TOKEN=""
MP_WEBHOOK_URL="https://zehla-staging.vercel.app/api/checkout/webhook"

# WhatsApp Cloud API (MOCK)
WHATSAPP_VERIFY_TOKEN="zehla-staging-verify"
WHATSAPP_ACCESS_TOKEN=""
WHATSAPP_PHONE_NUMBER_ID=""

# ZAI SDK (Cérebro)
ZAI_API_KEY=""
ZAI_BASE_URL=""

# Socket.IO (conectar ao Railway)
NEXT_PUBLIC_SOCKET_URL="https://zehla-realtime.up.railway.app"

# Node
NODE_ENV="staging"
```

### 1.3 Domínio

O Vercel atribui um domínio automático (ex: zehla-staging.vercel.app). Use este URL no NEXTAUTH_URL e no NEXT_PUBLIC_SOCKET_URL.

---

## 2. Railway (Realtime Service)

### 2.1 Criar projeto

1. Acesse [railway.app](https://railway.app) → New Project
2. Selecione **Deploy from GitHub repo**
3. Escolha o repositório e configure:
   - Root directory: `mini-services/realtime-service`
   - Build command: `bun install`
   - Start command: `npx tsx index.ts`

### 2.2 Variáveis de ambiente

No Railway → Settings → Variables:

```env
PORT=3001
ALLOWED_ORIGINS=https://zehla-staging.vercel.app,http://localhost:3000
```

### 2.3 Publicar porta

O Railway detecta a porta automaticamente pela variável PORT. Certifique-se de que:

- A variável `PORT=3001` está definida
- O `mini-services/realtime-service/index.ts` usa `process.env.PORT || 3001`

### 2.4 Obter a URL pública

Após o deploy, o Railway gera uma URL como:
```
https://zehla-realtime-production.up.railway.app
```

Copie esta URL e configure no Vercel como `NEXT_PUBLIC_SOCKET_URL`.

---

## 3. WhatsApp Cloud API (Staging)

### 3.1 Configurar webhook no Meta

1. Acesse [developers.facebook.com](https://developers.facebook.com/)
2. Vá em **WhatsApp → Configuration → Webhook**
3. Callback URL: `https://zehla-staging.vercel.app/api/webhook-whatsapp`
4. Verify Token: `zehla-staging-verify` (mesmo valor da env var)
5. Subscribe to: `messages`

### 3.2 Testar

```bash
# Verificação do webhook
curl "https://zehla-staging.vercel.app/api/webhook-whatsapp?hub.mode=subscribe&hub.verify_token=zehla-staging-verify&hub.challenge=TESTE123"
# Esperado: TESTE123

# Simular mensagem
curl -X POST "https://zehla-staging.vercel.app/api/webhook-whatsapp" \
  -H "Content-Type: application/json" \
  -d '{
    "object": "whatsapp_business_account",
    "entry": [{
      "changes": [{
        "value": {
          "messages": [{
            "from": "5511999999999",
            "id": "test-msg-1",
            "text": { "body": "Olá" },
            "timestamp": "1700000000",
            "type": "text"
          }]
        }
      }]
    }]
  }'
```

---

## 4. Testar Fluxo Completo

### 4.1 Health checks

```bash
curl https://zehla-staging.vercel.app/api/health
curl -X POST https://zehla-staging.vercel.app/api/readiness
curl https://zehla-staging.vercel.app/api/brain/health
```

### 4.2 DDC Dashboard

1. Acesse `https://zehla-staging.vercel.app/login`
2. Faça login com o tenant do seed
3. Navegue para `/ddc` — deve carregar dados do seed
4. Verifique o live-feed SSE em `/api/ddc/live-feed`

### 4.3 Checkout

1. Acesse a página de pricing
2. Selecione um plano e tente o checkout PIX
3. Sem `MP_ACCESS_TOKEN`, deve cair no fallback mock

---

## 5. Troubleshooting

| Problema | Causa provável | Solução |
|----------|---------------|---------|
| 500 em DDC APIs | DB não inicializado | Rodar `npx prisma db push` + `npx prisma db seed` |
| WebSocket desconecta | CORS no Railway | Verificar `ALLOWED_ORIGINS` |
| NextAuth loop infinito | `NEXTAUTH_URL` errado | Confirmar URL exata sem barra final |
| Build falha no Vercel | Deps faltando | Verificar `bun.lock` no repo |
| Landing page branca | Componentes desligados | Confirmar `page.tsx` importa os landing components |
