# ZEHLA SMARTHOTEL — BACKEND-FRONTEND ALIGNMENT
# Documento para Chat Z.AI
# =============================================================================

## 📐 VISÃO GERAL DA ARQUITETURA

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         ARQUITETURA ZEHLA — PRODUÇÃO                          │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  FRONTEND (Chat Z.AI constrói)          BACKEND (Google Antigravity)        │
│  ─────────────────────────────          ─────────────────────────────        │
│                                                                             │
│  • Next.js 16 (App Router)              • Next.js 16 (API Routes)            │
│  • React 19 + TypeScript                • TypeScript + Prisma ORM            │
│  • Tailwind CSS 4                       • PostgreSQL 16 (Docker)             │
│  • Framer Motion                        • Redis 7 (Docker)                   │
│  • Lucide React                         • Evolution API (WhatsApp)           │
│  • Recharts                             • Agentes de IA (8)                  │
│                                                                             │
│  PORTA: 3001 (desenvolvimento)          PORTA: 3000 (API)                    │
│  PORTA: 80/443 (produção)               PORTA: 3000 (produção)               │
│                                                                             │
│  COMUNICAÇÃO: HTTP/JSON via fetch()                                         │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

## 🔌 COMO O FRONTEND SE COMUNICA COM O BACKEND

### 1. Requisições HTTP
O frontend faz requisições `fetch()` para o backend:

```typescript
// Exemplo: Buscar quartos de uma pousada
const response = await fetch('http://localhost:3000/api/rooms?propertyId=abc123')
const data = await response.json()
// data = { success: true, data: [{ id: "...", number: "101", status: "AVAILABLE" }] }
```

### 2. Autenticação JWT
```typescript
// Login
const res = await fetch('http://localhost:3000/api/auth/callback/credentials', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email, password, csrfToken: 'dummy' })
})
const { user, token } = await res.json()
localStorage.setItem('zehla_token', token)

// Requisições autenticadas
const res = await fetch('http://localhost:3000/api/agents/receptionist', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${localStorage.getItem('zehla_token')}`
  },
  body: JSON.stringify({ propertyId, message })
})
```

### 3. Fluxo de Dados
```
Usuário clica no frontend
       ↓
Componente React chama hook useApi()
       ↓
Hook chama apiClient.post('/api/agents/receptionist', data)
       ↓
fetch() envia POST para http://localhost:3000/api/agents/receptionist
       ↓
Backend recebe → valida JWT → processa com Agente Recepcionista
       ↓
Backend consulta banco (Prisma) → gera resposta com IA
       ↓
Backend retorna JSON: { success: true, response: "..." }
       ↓
Frontend recebe → atualiza estado React → re-renderiza UI
       ↓
Usuário vê a resposta na tela
```

## 📋 ENDPOINTS QUE O FRONTEND PRECISA CONSUMIR

### Autenticação
| Método | Endpoint | Body | Retorno |
|--------|----------|------|---------|
| POST | `/api/auth/callback/credentials` | `{ email, password }` | `{ user, token }` |
| POST | `/api/auth/signout` | — | `{ success: true }` |

### Dados da Pousada
| Método | Endpoint | Query/Body | Retorno |
|--------|----------|------------|---------|
| GET | `/api/properties` | `?id=xxx` | `{ success, data: Property }` |
| GET | `/api/rooms` | `?propertyId=xxx` | `{ success, data: Room[] }` |

### Agentes de IA
| Método | Endpoint | Body | Retorno |
|--------|----------|------|---------|
| POST | `/api/agents/receptionist` | `{ propertyId, message }` | `{ success, response, intent }` |
| POST | `/api/agents/reservations` | `{ action, propertyId, data }` | `{ success, data: Reservation }` |
| POST | `/api/agents/housekeeping` | `{ action, propertyId, data }` | `{ success, data: Room }` |
| POST | `/api/agents/financial` | `{ action, propertyId, data }` | `{ success, data: Payment }` |
| POST | `/api/agents/marketing` | `{ action, propertyId, data }` | `{ success, data: Campaign }` |
| POST | `/api/agents/guardian` | `{ action, data }` | `{ success, data: Log }` |
| POST | `/api/agents/concierge` | `{ action, data }` | `{ success, data: Attractions }` |
| POST | `/api/agents/learner` | `{ action, data }` | `{ success, data: Insights }` |

### Brain Engine
| Método | Endpoint | Body | Retorno |
|--------|----------|------|---------|
| POST | `/api/brain` | `{ action, data }` | `{ success, data: Intent | Response }` |

## 🎨 MAPEAMENTO PÁGINA → ENDPOINT

### Landing Page (pública)
- Não precisa de API (estática)
- Formulário de captura → POST para `/api/marketing/lead` (futuro)

### Client Dashboard (autenticado)
| Aba | Endpoint(s) | Dados Exibidos |
|-----|-------------|----------------|
| **Painel** | `GET /api/properties?id=xxx` | KPIs da pousada |
| | `POST /api/agents/learner` | Analytics |
| **Terminal** | `POST /api/agents/learner` | Logs recentes |
| **Quartos** | `GET /api/rooms?propertyId=xxx` | Grid de quartos |
| | `POST /api/agents/housekeeping` | Atualizar status |
| **Reservas** | `POST /api/agents/reservations` (LIST) | Lista de reservas |
| | `POST /api/agents/reservations` (CREATE) | Criar reserva |
| **Financeiro** | `POST /api/agents/financial` (LIST) | Pagamentos |
| | `POST /api/agents/financial` (GET_REVENUE) | Gráfico de receita |
| **Planilhas** | `POST /api/agents/learner` (GET_INSIGHTS) | Dados exportáveis |
| **Promoções** | `POST /api/agents/marketing` | Campanhas |
| **Configurações** | `GET /api/properties?id=xxx` | Dados da pousada |

### Admin Dashboard/ZCC (autenticado admin)
| Aba | Endpoint(s) | Dados Exibidos |
|-----|-------------|----------------|
| **Overview** | `GET /api/properties` (lista todas) | Métricas globais |
| **Cognitivo** | `POST /api/agents/learner` | Fleet ML |
| **Terminal** | `POST /api/agents/learner` | System logs |
| **Agentes** | `POST /api/agents/learner` (GET_PERFORMANCE) | Performance |
| **Propriedades** | `GET /api/properties` | Lista de clientes |
| **Marketing** | `POST /api/agents/marketing` (GET_ANALYTICS) | Funil |
| **Financeiro** | `POST /api/agents/financial` (GET_REVENUE) | Consolidação |
| **WhatsApp** | `POST /api/agents/guardian` | Status |
| **APIs** | `GET /api/health` | Health checks |
| **Segurança** | `POST /api/agents/guardian` (GET_THREATS) | Ameaças |
| **Zelador** | `POST /api/agents/learner` | Saúde do sistema |

## 🔧 CONFIGURAÇÃO DO FRONTEND

### .env.local do Frontend
```
NEXT_PUBLIC_API_URL=http://localhost:3000
NEXT_PUBLIC_APP_NAME=ZEHLA SmartHotel
NEXT_PUBLIC_APP_VERSION=2.5.0
```

### next.config.js
```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://localhost:3000/api/:path*'
      }
    ]
  },
  images: {
    domains: ['localhost']
  }
}
module.exports = nextConfig
```

## ⚠️ REGRAS DE INTEGRAÇÃO

1. **Sempre verifique `success`** antes de usar `data`
2. **Trate erros** com try/catch + toast notification
3. **Use loading states** em TODAS as requisições
4. **Cache dados** com React Query ou SWR (futuro)
5. **Nunca exponha API keys** no frontend (use NEXT_PUBLIC_ apenas para URLs)
6. **Valide dados** com Zod antes de enviar para API
7. **Use debounce** em inputs de busca (300ms)

## 🧪 TESTES DE INTEGRAÇÃO

Após construir o frontend, teste:

```bash
# 1. Inicie o backend
cd zehla-backend && pnpm dev

# 2. Inicie o frontend (em outro terminal)
cd zehla-frontend && pnpm dev

# 3. Teste no navegador
# http://localhost:3001 (frontend)
# http://localhost:3000 (backend API)

# 4. Verifique se o frontend consegue:
# - Fazer login
# - Carregar dashboard
# - Listar quartos
# - Criar reserva
# - Gerar PIX
```

## 🚀 DEPLOY

### Frontend → Vercel
```bash
# 1. Push para GitHub
git push origin main

# 2. Importe no Vercel
# 3. Configure variáveis de ambiente:
#    NEXT_PUBLIC_API_URL=https://api.zehla.com.br
# 4. Deploy automático
```

### Backend → Hostinger VPS
```bash
# 1. Configure VPS na Hostinger
# 2. Instale Docker + Docker Compose
# 3. Clone o repositório
# 4. docker-compose up -d
# 5. Configure Nginx reverse proxy
# 6. Aponte domínio api.zehla.com.br
```

## 📞 SUPORTE

Se o Chat Z.AI tiver dúvidas durante a construção:
1. Consulte API-SPEC.md para detalhes de endpoints
2. Consulte BACKEND-STRUCTURE.md para modelo de dados
3. Teste endpoints diretamente com curl
4. Verifique logs do backend no terminal

---

*Documento gerado em Abril 2026*
*Para uso exclusivo do Chat Z.AI*
