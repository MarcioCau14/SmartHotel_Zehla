# ZEHLA SmartHotel — Backend Structure
# Cognitive Hospitality Operating System v2.5
# Exported from Google Antigravity

## Project Overview
- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Database**: PostgreSQL 16 (Docker)
- **Cache**: Redis 7 (Docker)
- **ORM**: Prisma 5.22
- **Auth**: NextAuth.js (JWT strategy)
- **AI**: Ollama (local) + Kimi K2.6 (cloud fallback)
- **WhatsApp**: Evolution API (Docker)
- **Payments**: Pagarme (PIX)

## Database Schema (Prisma)

### Models (15 total)
1. **User** — Authentication (CLIENT, ADMIN, SUPER_ADMIN)
2. **Account** — OAuth accounts
3. **Session** — JWT sessions
4. **VerificationToken** — Email verification
5. **Property** — Pousada/Hotel (name, address, capacity, plan, trial)
6. **Room** — Quartos (number, type, capacity, price, status)
7. **Service** — Serviços (name, price, included)
8. **Reservation** — Reservas (guest, dates, status, payment)
9. **Payment** — Pagamentos PIX (QR code, status)
10. **PricingRule** — Regras de precificação dinâmica
11. **AgentLog** — Logs dos 8 agentes de IA
12. **Message** — Mensagens WhatsApp (inbound/outbound)
13. **SystemLog** — Logs do sistema
14. **ZeladorAction** — Ações do Agente Zelador

### Enums (11 total)
- Role: CLIENT, ADMIN, SUPER_ADMIN
- PropertyStatus: ACTIVE, SUSPENDED, CANCELLED, TRIAL_EXPIRED
- Plan: LITE, PRO, MAX
- RoomType: STANDARD, DELUXE, SUITE, MASTER, FAMILY
- RoomStatus: AVAILABLE, OCCUPIED, CLEANING, MAINTENANCE, BLOCKED
- ReservationStatus: PENDING, CONFIRMED, CHECKED_IN, CHECKED_OUT, CANCELLED, NO_SHOW
- PaymentMethod: PIX, CREDIT_CARD, DEBIT_CARD, CASH, BANK_TRANSFER
- PaymentStatus: PENDING, PAID, FAILED, REFUNDED, CANCELLED

## API Endpoints

### Authentication
- `POST /api/auth/[...nextauth]` — NextAuth.js (login/logout)
- Supports: Credentials (email/password), JWT tokens
- Roles: CLIENT (pousada owner), ADMIN, SUPER_ADMIN

### Health Check
- `GET /api/health` — Returns { status: "OK", version: "2.5.0" }

### Agent Endpoints (8 total)
All agents accept POST with `{ action, propertyId, data }`

1. **POST /api/agents/receptionist**
   - Actions: PROCESS (classifies intent, generates response)
   - Input: `{ propertyId, message, context }`
   - Output: `{ success, agent, intent, confidence, response, tokensUsed, cost }`

2. **POST /api/agents/reservations**
   - Actions: CREATE, UPDATE, CANCEL, CHECK_IN, CHECK_OUT, LIST
   - Input: `{ action, propertyId, data: { roomId, guestName, dates, etc. } }`
   - Output: `{ success, data: reservation }`

3. **POST /api/agents/housekeeping**
   - Actions: UPDATE_STATUS, GET_STATUS, SCHEDULE_CLEANING, MARK_READY
   - Input: `{ action, propertyId, data: { roomId, status } }`
   - Output: `{ success, data: room }`

4. **POST /api/agents/financial**
   - Actions: CREATE_PAYMENT, GET_STATUS, LIST_PAYMENTS, GET_REVENUE
   - Input: `{ action, propertyId, data }`
   - Output: `{ success, data: payment | revenue }`

5. **POST /api/agents/marketing**
   - Actions: CREATE_CAMPAIGN, GET_ANALYTICS, GENERATE_PROMO
   - Input: `{ action, propertyId, data }`
   - Output: `{ success, data: campaign | analytics }`

6. **POST /api/agents/guardian**
   - Actions: CHECK_RATE_LIMIT, LOG_SECURITY_EVENT, GET_THREATS, BLOCK_IP
   - Input: `{ action, data: { ip, endpoint, level, message } }`
   - Output: `{ success, data: log | threat_summary }`

7. **POST /api/agents/concierge**
   - Actions: GET_RECOMMENDATIONS, GET_WEATHER, ANSWER_QUESTION
   - Input: `{ action, data: { query, type, maxDistance } }`
   - Output: `{ success, data: attractions | weather | answer }`

8. **POST /api/agents/learner**
   - Actions: ANALYZE_PATTERNS, GET_INSIGHTS, TRAIN_FROM_FEEDBACK, GET_PERFORMANCE
   - Input: `{ action, data: { propertyId, period, agentName } }`
   - Output: `{ success, data: patterns | insights | performance }`

### Data Endpoints
- `GET /api/rooms?propertyId=xxx` — List rooms
- `POST /api/rooms` — Create room
- `GET /api/properties` — List all properties
- `GET /api/properties?id=xxx` — Get single property

### Brain Engine
- `POST /api/brain`
   - Actions: CLASSIFY_INTENT, GENERATE_RESPONSE, HEALTH_CHECK
   - Input: `{ action, data: { message, model, messages } }`
   - Output: `{ success, data: classified_intent | llm_response | health_status }`

### Webhooks
- `POST /api/webhooks/pagarme` — Pagarme PIX payment notifications
- `POST /api/webhooks/whatsapp` — Evolution API WhatsApp messages

## Core Modules

### LLM Router (`src/lib/ai/llm-router.ts`)
- Routes between Ollama (local) and Kimi K2.6 (cloud)
- Auto-fallback after 3 local failures
- Cost tracking per request

### Intent Classifier (`src/lib/brain/intent-classifier.ts`)
- 15 intents: RESERVATION_CREATE, PRICE_INQUIRY, CHECK_IN, etc.
- Uses Mistral 7B local for classification
- Returns: intent, confidence, entities

### Agent Orchestrator (`src/lib/brain/agent-orchestrator.ts`)
- Processes all agent requests
- Builds contextual prompts with property data
- Logs all interactions to database

## Environment Variables
```
DATABASE_URL=postgresql://zehla:zehla_secret_2026@localhost:5432/zehla_db
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=zehla-super-secret-key
REDIS_URL=redis://localhost:6379
KIMI_API_KEY=xxx
OPENROUTER_API_KEY=xxx
PAGARME_API_KEY=xxx
EVOLUTION_API_URL=http://localhost:8080
```

## Docker Services
- **PostgreSQL**: port 5432, user: zehla, db: zehla_db
- **Redis**: port 6379
- **Evolution API**: port 8080 (WhatsApp)

## Seed Data
- 1 Admin user (admin@zehla.com.br)
- 1 Client user (maria@pousadadosol.com.br)
- 1 Property: Pousada do Sol (8 rooms)
- 4 Reservations (various statuses)
- 4 Payments (PIX)
- 10 Agent logs
- 6 WhatsApp messages
- 4 Pricing rules
