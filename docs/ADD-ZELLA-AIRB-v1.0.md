# 🏗️ DOCUMENTO DE DESIGN DE ARQUITETURA (ADD)
## Zélla AirB — Módulo de Anfitriões Airbnb
### Ecossistema Seu Zélla (seuzella.com)

---

| Campo | Valor |
|-------|-------|
| **Documento** | ADD-ZELLA-AIRB-v1.0 |
| **Classificação** | Confidencial — Uso Interno |
| **Conformidade** | ISO 19650 (Gestão de Informação em Projetos de Construção) |
| **Autor** | Arquiteto de Soluções & Engenheiro Chefe de IA |
| **Data** | 2025-03-04 |
| **Status** | DRAFT — Revisão Pendente |
| **Versão** | 1.0.0 |

---

## SUMÁRIO

1. [Visão Executiva](#1-visão-executiva)
2. [Princípios Arquiteturais](#2-princípios-arquiteturais)
3. [Diagrama de Banco de Dados — Entidade-Relacionamento](#3-diagrama-de-banco-de-dados--entidade-relacionamento)
4. [Estrutura do Banco Vetorial (Vector DB)](#4-estrutura-do-banco-vetorial-vector-db)
5. [Fluxo Arquitetural — Scraping + Enriquecimento Regional](#5-fluxo-arquitetural--scraping--enriquecimento-regional)
6. [O Cérebro Zélla AirB — Sistema Multi-Agente com RAG](#6-o-cérebro-zélla-airb--sistema-multi-agente-com-rag)
7. [Pseudocódigo — Restrição de Entitlements (PRO vs MAX)](#7-pseudocódigo--restrição-de-entitlements-pro-vs-max)
8. [Esqueleto do System Prompt Base — Tom de Voz Anfitrião](#8-esqueleto-do-system-prompt-base--tom-de-voz-anfitrião)
9. [Isolamento Financeiro — AirB vs Pousadas](#9-isolamento-financeiro--airb-vs-pousadas)
10. [Plano de Migração — SQLite → PostgreSQL](#10-plano-de-migração--sqlite--postgresql)
11. [Matriz de Decisão e Rastreabilidade](#11-matriz-de-decisão-e-rastreabilidade)

---

## 1. VISÃO EXECUTIVA

O módulo **Zélla AirB** é o braço do ecossistema Seu Zélla dedicado a **anfitriões de aluguel por temporada (Airbnb)**. Diferencia-se do **Zélla Pousadas** em três eixos fundamentais:

| Dimensão | Zélla Pousadas | Zélla AirB |
|----------|---------------|------------|
| **Entidade Nuclear** | Quarto (Room) — múltiplos por propriedade | Propriedade Única (AirBProperty) — 1 anúncio = 1 propriedade |
| **Fluxo Financeiro** | Reserva → PIX → Confirmação | **Sem cobrança direta** se contexto for pós-reserva Airbnb; PIX apenas em pré-reserva direta |
| **Persona do Agente** | Recepcionista de Hotel | **Dono do Imóvel** — acolhedor, com senso de propriedade |
| **Ingestão de Dados** | Cadastro manual de quartos | **Web Scraping automático** + enriquecimento geolocalizado |
| **Memória** | Conhecimento do hotel + quartos | **Banco vetorial** com mapeamento regional (praia, padaria, farmácia) |

### 1.1 Estado Atual do Código (AS-IS)

O módulo AirB existe em estado **MVP/PoC** com as seguintes limitações:

- **Modelo Prisma:** `AirBProperty`, `AirBConversation`, `AirBMessage` já existem no schema
- **Scraping:** Retorna dados simulados (demo) — não faz scraping real
- **Isolamento:** Sem banco vetorial; sem separação real de dados entre Pousadas e AirB
- **Entitlements:** Limites PRO=4 e MAX=12 hardcoded no frontend, sem validação backend
- **Financeiro:** Sem separação contábil entre AirB e Pousadas
- **RAG:** Inexistente — sem retrieval, sem enriquecimento geolocalizado

### 1.2 Estado Alvo (TO-BE)

Arquitetura enterprise-grade com:
- **PostgreSQL** como banco relacional principal (migração do SQLite)
- **Vector DB** (Pinecone/Qdrant/pgvector) isolado por namespaces `tenant_id:property_id`
- **Microserviço de Scraping** assíncrono com fila de jobs
- **RAG Pipeline** com embeddings regionais
- **Gatekeeper de Entitlements** validado no backend
- **Isolamento financeiro total** entre módulos

---

## 2. PRINCÍPIOS ARQUITETURAIS

| ID | Princípio | Descrição |
|----|-----------|-----------|
| PA-01 | **Zero Herança Pousada-AirB** | Nenhuma classe, model ou interface de Pousadas será estendida pelo AirB. Hierarquias paralelas com contratos compartilhados apenas via interfaces abstratas. |
| PA-02 | **Namespace Isolation** | Todo dado vetorial é escopado por `tenant_id:property_id`. Queries cross-tenant são proibidas por design. |
| PA-03 | **Gatekeeper First** | Nenhum job de scraping ou ativação de webhook prossegue sem validação de entitlement no backend. |
| PA-04 | **Context-Aware Behavior** | O agente adapta seu comportamento com base no modo (`pre_booking` vs `post_booking`), nunca oferecendo PIX em contexto pós-reserva Airbnb. |
| PA-05 | **Financial Chinese Wall** | Transações AirB e Pousadas nunca se misturam. Cada módulo tem seu próprio ledger e plano de contas. |
| PA-06 | **Idempotency** | Todas as operações de scraping e webhook são idempotentes — reprocessamentos não criam duplicatas. |
| PA-07 | **Graceful Degradation** | Se o Vector DB estiver indisponível, o agente opera com conhecimento base (house rules, amenities) sem falhar. |

---

## 3. DIAGRAMA DE BANCO DE DADOS — ENTIDADE-RELACIONAMENTO

### 3.1 Diagrama ER — Módulo Zélla AirB (PostgreSQL)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        TENANT (Ecossistema Seu Zélla)                       │
│  ┌──────────────────────────────────────────────────────────────────────┐   │
│  │ id: UUID                                                             │   │
│  │ name: VARCHAR(255)                                                   │   │
│  │ email: VARCHAR(255) UNIQUE                                          │   │
│  │ phone: VARCHAR(20)                                                   │   │
│  │ plan: ENUM(trial, lite, pro, max)                                   │   │
│  │ status: ENUM(active, suspended, churned)                            │   │
│  │ createdAt: TIMESTAMP                                                 │   │
│  └──────────────┬───────────────────────────────────────────────────────┘   │
│                 │                                                            │
│                 │ 1:N                                                        │
│    ┌────────────┴──────────────────────────────────────┐                    │
│    │                                                     │                    │
│    ▼                                                     ▼                    │
│  ┌─────────────────────────┐          ┌──────────────────────────────┐      │
│  │   Property (Pousadas)   │          │    AirBProperty (AirB)       │      │
│  │  ─────────────────────  │          │  ──────────────────────────  │      │
│  │ id: UUID                │          │ id: UUID                     │      │
│  │ tenantId: UUID FK       │          │ tenantId: UUID FK            │      │
│  │ name: VARCHAR           │          │ airbnbId: VARCHAR UNIQUE     │      │
│  │ type: ENUM(pousada,     │          │ airbnbUrl: TEXT              │      │
│  │   hotel, hostel, chalé, │          │ name: VARCHAR(500)          │      │
│  │   resort)               │          │ description: TEXT            │      │
│  │ pixKey: VARCHAR         │          │ propertyType: ENUM(apt,      │      │
│  │                         │          │   house, loft, studio,       │      │
│  │ → Room[]                │          │   chalet, villa)            │      │
│  │ → Reservation[]         │          │ latitude: DECIMAL(10,7)     │      │
│  │ → Transaction[]         │          │ longitude: DECIMAL(10,7)    │      │
│  └─────────────────────────┘          │ city: VARCHAR               │      │
│                                       │ state: VARCHAR              │      │
│          NUNCA SE RELACIONAM          │ neighborhood: VARCHAR       │      │
│          ↕︎ NENHUMA FK CROSSLINK ↕︎    │ bedrooms: INT               │      │
│                                       │ bathrooms: INT              │      │
│  ┌─────────────────────────┐          │ maxGuests: INT              │      │
│  │  AirBProperty (cont.)   │          │ amenities: JSONB            │      │
│  │  ─────────────────────  │          │ houseRules: JSONB           │      │
│  │ checkinTime: TIME       │          │ checkinTime: TIME           │      │
│  │ checkoutTime: TIME      │          │ checkoutTime: TIME          │      │
│  │ wifiName: VARCHAR       │          │ wifiName: VARCHAR           │      │
│  │ wifiPassword: VARCHAR   │          │ wifiPassword: VARCHAR       │      │
│  │ lockProvider: ENUM(     │          │ lockProvider: ENUM(         │      │
│  │   none, smartlock,      │          │   none, smartlock,          │      │
│  │   lockbox, keypad,      │          │   lockbox, keypad,          │      │
│  │   physical_key)         │          │   physical_key)             │      │
│  │ lockCode: VARCHAR       │          │ lockCode: VARCHAR           │      │
│  │ hostKnowledge: JSONB    │          │ hostKnowledge: JSONB        │      │
│  │ neighborhoodTips: JSONB │          │ neighborhoodTips: JSONB     │      │
│  │ emergencyContacts:JSONB │          │ emergencyContacts: JSONB    │      │
│  │ imageUrl: TEXT          │          │ imageUrl: TEXT              │      │
│  │ pricePerNight: DECIMAL  │          │ pricePerNight: DECIMAL      │      │
│  │ status: ENUM(active,    │          │ status: ENUM(active,        │      │
│  │   inactive, suspended,  │          │   inactive, suspended,      │      │
│  │   scraping_pending,     │          │   scraping_pending,         │      │
│  │   scraping_failed)      │          │   scraping_failed)          │      │
│  │ scrapingSource: ENUM(   │          │ scrapingSource: ENUM(       │      │
│  │   api, ai_extractor,   │          │   api, ai_extractor,        │      │
│  │   manual)               │          │   manual)                   │      │
│  │ scrapedAt: TIMESTAMP    │          │ scrapedAt: TIMESTAMP        │      │
│  │ createdAt: TIMESTAMP    │          │ createdAt: TIMESTAMP        │      │
│  │ updatedAt: TIMESTAMP    │          │ updatedAt: TIMESTAMP        │      │
│  └──────────┬──────────────┘          └──────────┬───────────────────┘      │
│             │ 1:N                                 │ 1:N                      │
│             ▼                                     ▼                          │
│  ┌──────────────────────┐          ┌──────────────────────────────┐          │
│  │  AirBConversation    │          │  AirBRegionalKnowledge       │          │
│  │  ──────────────────  │          │  ──────────────────────────  │          │
│  │ id: UUID             │          │ id: UUID                     │          │
│  │ tenantId: UUID FK    │          │ tenantId: UUID FK            │          │
│  │ propertyId: UUID FK  │          │ propertyId: UUID FK          │          │
│  │ guestName: VARCHAR   │          │ category: ENUM(beach,        │          │
│  │ guestPhone: VARCHAR  │          │   bakery, pharmacy,          │          │
│  │ guestBsuid: VARCHAR  │          │   supermarket, tourism,      │          │
│  │ mode: ENUM(          │          │   restaurant, hospital,      │          │
│  │   pre_booking,       │          │   transport, atm,            │          │
│  │   post_booking)      │          │   leisure, other)            │          │
│  │ status: ENUM(active, │          │ name: VARCHAR(255)           │          │
│  │   resolved,          │          │ distance: DECIMAL(5,2) km    │          │
│  │   escalated)         │          │ walkingTimeMin: INT          │          │
│  │ lastIntent: VARCHAR  │          │ drivingTimeMin: INT          │          │
│  │ lastMessageAt: TS    │          │ address: TEXT                │          │
│  │ messageCount: INT    │          │ rating: DECIMAL(2,1)         │          │
│  │ platformContext:     │          │ googlePlaceId: VARCHAR       │          │
│  │   ENUM(airbnb_app,   │          │ description: TEXT            │          │
│  │   airbnb_web, direct,│          │ embeddingId: VARCHAR         │──┐      │
│  │   whatsapp, unknown) │          │ createdAt: TIMESTAMP         │  │      │
│  │ createdAt: TIMESTAMP │          │ updatedAt: TIMESTAMP         │  │      │
│  │ updatedAt: TIMESTAMP │          └──────────────────────────────┘  │      │
│  └──────────┬───────────┘                                            │      │
│             │ 1:N                                                    │      │
│             ▼                                          REF: Vector DB │      │
│  ┌──────────────────────┐                                            │      │
│  │   AirBMessage        │          ┌──────────────────────────────┐  │      │
│  │  ──────────────────  │          │  AirBScrapingJob             │  │      │
│  │ id: UUID             │          │  ──────────────────────────  │  │      │
│  │ conversationId:FK    │          │ id: UUID                     │  │      │
│  │ direction: ENUM(     │          │ tenantId: UUID FK            │  │      │
│  │   inbound, outbound) │          │ propertyId: UUID FK NULL     │  │      │
│  │ content: TEXT        │          │ airbnbUrl: TEXT              │  │      │
│  │ intent: VARCHAR      │          │ status: ENUM(queued,         │  │      │
│  │ isAiGenerated: BOOL  │          │   running, completed,        │  │      │
│  │ costUsd: DECIMAL     │          │   failed, cancelled)         │  │      │
│  │ platformOrigin: ENUM │          │ result: JSONB NULL           │  │      │
│  │   (airbnb, whatsapp, │          │ error: TEXT NULL             │          │
│  │   direct)            │          │ retryCount: INT DEFAULT 0    │          │
│  │ createdAt: TIMESTAMP │          │ maxRetries: INT DEFAULT 3    │          │
│  └──────────────────────┘          │ scheduledAt: TIMESTAMP       │          │
│                                    │ startedAt: TIMESTAMP NULL    │          │
│                                    │ completedAt: TIMESTAMP NULL  │          │
│                                    │ idempotencyKey: VARCHAR UNIQ │          │
│                                    │ createdAt: TIMESTAMP         │          │
│                                    └──────────────────────────────┘          │
│                                                                              │
│  ┌──────────────────────────────────────────────────────────────────────┐    │
│  │  AirBSubscription (Ledger Isolado)                                   │    │
│  │  ──────────────────────────────────────────────────────────────────  │    │
│  │ id: UUID                                                             │    │
│  │ tenantId: UUID FK                                                    │    │
│  │ planType: ENUM(airb_pro, airb_max)   ← NUNCA 'pro' ou 'max' puro   │    │
│  │ status: ENUM(active, past_due, cancelled, expired)                  │    │
│  │ propertyLimit: INT                    ← PRO=4, MAX=12               │    │
│  │ currentPropertyCount: INT             ← Denormalizado para query     │    │
│  │ amount: DECIMAL                       ← R$397 (PRO) / R$797 (MAX)  │    │
│  │ paymentMethod: ENUM(pix, cartao)                                     │    │
│  │ currentPeriodStart: TIMESTAMP                                        │    │
│  │ currentPeriodEnd: TIMESTAMP                                          │    │
│  │ cancelAtPeriodEnd: BOOLEAN                                           │    │
│  │ createdAt: TIMESTAMP                                                 │    │
│  │ updatedAt: TIMESTAMP                                                 │    │
│  └──────────────────────────────────────────────────────────────────────┘    │
│                                                                              │
│  ┌──────────────────────────────────────────────────────────────────────┐    │
│  │  AirBTransaction (Ledger Isolado)                                    │    │
│  │  ──────────────────────────────────────────────────────────────────  │    │
│  │ id: UUID                                                             │    │
│  │ tenantId: UUID FK                                                    │    │
│  │ propertyId: UUID FK NULL                                             │    │
│  │ subscriptionId: UUID FK NULL                                         │    │
│  │ type: ENUM(subscription_payment, refund, adjustment)                 │    │
│  │ amount: DECIMAL                                                      │    │
│  │ status: ENUM(pending, approved, rejected, refunded)                  │    │
│  │ externalId: VARCHAR                     ← Mercado Pago payment ID    │    │
│  │ description: TEXT                                                    │    │
│  │ createdAt: TIMESTAMP                                                 │    │
│  └──────────────────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 3.2 Notas de Design — Banco Relacional

#### 3.2.1 Separação Total AirB vs Pousadas

```
┌─────────────────────────────────────────────────────────────────────┐
│                        CONSTRAINT MATRIX                           │
├──────────────────────┬──────────────────┬──────────────────────────┤
│ Entidade             │ FK para Pousadas │ FK para AirB             │
├──────────────────────┼──────────────────┼──────────────────────────┤
│ Property             │ Self-contained   │ ❌ PROIBIDO              │
│ Room                 │ → Property       │ ❌ PROIBIDO              │
│ Reservation          │ → Room           │ ❌ NÃO EXISTE em AirB    │
│ Transaction          │ → Reservation    │ ❌ PROIBIDO              │
│ AirBProperty         │ ❌ PROIBIDO      │ Self-contained           │
│ AirBConversation     │ ❌ PROIBIDO      │ → AirBProperty           │
│ AirBMessage          │ ❌ PROIBIDO      │ → AirBConversation       │
│ AirBRegionalKnowledg │ ❌ PROIBIDO      │ → AirBProperty           │
│ AirBScrapingJob      │ ❌ PROIBIDO      │ → AirBProperty (nullable)│
│ AirBSubscription     │ ❌ PROIBIDO      │ Self-contained           │
│ AirBTransaction      │ ❌ PROIBIDO      │ → AirBProperty (nullable)│
└──────────────────────┴──────────────────┴──────────────────────────┘

REGRA DE OURO: Nenhuma FK cross-módulo. O único ponto de convergência
é o Tenant (tenantId), que é a raiz agregada do ecossistema.
```

#### 3.2.2 Índices Obrigatórios

```sql
-- Isolamento multi-tenant (todas as queries filtram por tenantId)
CREATE INDEX idx_airb_properties_tenant ON "AirBProperty"(tenantId);
CREATE INDEX idx_airb_conversations_tenant_property ON "AirBConversation"(tenantId, propertyId);
CREATE INDEX idx_airb_messages_conversation ON "AirBMessage"(conversationId, createdAt);
CREATE INDEX idx_airb_regional_tenant_property ON "AirBRegionalKnowledge"(tenantId, propertyId);
CREATE INDEX idx_airb_scraping_tenant_status ON "AirBScrapingJob"(tenantId, status);

-- Entitlement check (hot path)
CREATE INDEX idx_airb_properties_tenant_active ON "AirBProperty"(tenantId, status)
  WHERE status = 'active';

-- Idempotency
CREATE UNIQUE INDEX idx_airb_scraping_idempotency ON "AirBScrapingJob"(idempotencyKey);

-- Rate limiting de scraping
CREATE INDEX idx_airb_scraping_tenant_created ON "AirBScrapingJob"(tenantId, createdAt);
```

#### 3.2.3 Nova Enum: `platformContext` em AirBConversation

Este campo é **crítico** para a decisão de comportamento do agente. Determina se o hóspede está falando de dentro do app Airbnb (pós-reserva confirmada) ou de fora (pré-reserva / WhatsApp direto).

```
platformContext:
  airbnb_app    → Hóspede está no app Airbnb (pós-reserva). PROIBIDO oferecer PIX.
  airbnb_web    → Hóspede veio pelo site Airbnb. PROIBIDO oferecer PIX.
  direct        → Hóspede contatou diretamente. PODE oferecer PIX.
  whatsapp      → Hóspede veio pelo WhatsApp. PODE oferecer PIX.
  unknown       → Contexto incerto. Comportamento conservador (sem PIX).
```

---

## 4. ESTRUTURA DO BANCO VETORIAL (VECTOR DB)

### 4.1 Escolha Tecnológica

| Opção | Prós | Contras | Veredito |
|-------|------|---------|----------|
| **pgvector** (extensão PostgreSQL) | Sem infra adicional; mesmo banco relacional; ACID | Performance de busca vizinho-mais-próximo inferior a soluções dedicadas | ✅ **RECOMENDADO para MVP** — menor complexidade operacional |
| Pinecone | Gerenciado; ultra-rápido; filtros nativos | Custo; dependência de vendor; cold starts | Futuro (scale > 1M embeddings) |
| Qdrant | Open-source; performático; filtros riccos | Infra self-hosted ou custo gerenciado | Alternativa para scale médio |

**Decisão:** `pgvector` para MVP. Migração para Pinecone/Qdrant quando o volume de embeddings ultrapassar 500K por tenant.

### 4.2 Schema de Namespaces (Vector DB)

```
┌────────────────────────────────────────────────────────────────────────┐
│                     VECTOR DB — pgvector                               │
│                                                                        │
│  Tabela: airb_embeddings                                              │
│  ──────────────────────────────────────────────────────────────────    │
│  id: UUID (PK)                                                         │
│  tenant_id: UUID (NOT NULL) — 🔒 Obrigatório para isolamento          │
│  property_id: UUID (NOT NULL) — 🔒 Obrigatório para escopo            │
│  namespace: VARCHAR — Formato: "{tenant_id}:{property_id}"            │
│  source_type: ENUM(                                                    │
│    property_description,     ← Descrição do anúncio                   │
│    house_rules,              ← Regras da casa                          │
│    amenity,                  ← Comodidade individual                   │
│    regional_knowledge,       ← Ponto de interesse regional             │
│    host_knowledge,           ← Conhecimento pessoal do anfitrião       │
│    faq,                      ← Perguntas frequentes                    │
│    checkin_instructions,     ← Instruções de check-in                  │
│    emergency_info            ← Informações de emergência               │
│  )                                                                     │
│  source_id: UUID — FK para a entidade de origem                       │
│  content: TEXT — Conteúdo textual original (chunk)                    │
│  embedding: VECTOR(1536) — Embedding via text-embedding-3-small       │
│  metadata: JSONB — {category, distance_km, walking_min, ...}          │
│  created_at: TIMESTAMP                                                 │
│  updated_at: TIMESTAMP                                                 │
│                                                                        │
│  ══════════════════════════════════════════════════════════════════    │
│  ISOLAMENTO GARANTIDO POR:                                             │
│  ══════════════════════════════════════════════════════════════════    │
│                                                                        │
│  1. FILTER OBRIGATÓRIO em toda query:                                  │
│     WHERE tenant_id = $1 AND property_id = $2                          │
│                                                                        │
│  2. ÍNDICE PARTITION:                                                  │
│     PARTITION BY HASH (tenant_id)                                      │
│                                                                        │
│  3. RLS (Row Level Security) no PostgreSQL:                            │
│     CREATE POLICY airb_tenant_isolation ON airb_embeddings             │
│       USING (tenant_id = current_setting('app.tenant_id')::UUID);     │
│                                                                        │
│  4. APLICAÇÃO LAYER:                                                   │
│     Toda query passa por repositório que injeta tenant_id.             │
│     NUNCA se faz SELECT sem filtro de tenant.                          │
│     NUNCA se faz busca vetorial sem escopo de property.                │
└────────────────────────────────────────────────────────────────────────┘
```

### 4.3 Pipeline de Embeddings

```
[Scraping Concluído]
       │
       ▼
[Chunking Service]
  ├── Descrição → chunks de ~500 tokens
  ├── Regras da Casa → 1 chunk por regra
  ├── Comodidades → 1 chunk por comodidade
  └── Conhecimento Regional → 1 chunk por POI
       │
       ▼
[Embedding Service]
  ├── Modelo: text-embedding-3-small (OpenAI)
  ├── Dimensões: 1536
  ├── Batch: até 2048 chunks/requisição
  └── Custo: ~$0.02 / 1M tokens
       │
       ▼
[Upsert com Namespace]
  ├── INSERT com tenant_id + property_id
  ├── ON CONFLICT (source_type, source_id) DO UPDATE
  └── metadata enriquecido (category, distance, etc.)
```

### 4.4 Exemplo de Query RAG

```sql
-- Busca semântica: "Tem mercado perto?"
-- Namespace: tenant_id = 'abc-123', property_id = 'prop-456'

SELECT
  content,
  source_type,
  metadata->>'category' AS category,
  metadata->>'distance_km' AS distance_km,
  metadata->>'walking_min' AS walking_min,
  1 - (embedding <=> $1) AS similarity
FROM airb_embeddings
WHERE tenant_id = 'abc-123'
  AND property_id = 'prop-456'
  AND source_type = 'regional_knowledge'
ORDER BY embedding <=> $1
LIMIT 5;
-- Resultado esperado:
-- "Mercado Supermercado Bom Preço — 0.3 km, 4 min caminhando"
-- "Mercado Carrefour Express — 0.8 km, 10 min caminhando"
```

---

## 5. FLUXO ARQUITETURAL — SCRAPING + ENRIQUECIMENTO REGIONAL

### 5.1 Diagrama de Sequência

```
 Anfitrião        DDC Frontend      Next.js API       Scraping          Geolocation      Vector DB
   │                  │                 │             Microservice        Service            │
   │                  │                 │                 │                  │                │
   │ 1. Cola URL      │                 │                 │                  │                │
   │ do Airbnb        │                 │                 │                  │                │
   │─────────────────▶│                 │                 │                  │                │
   │                  │                 │                 │                  │                │
   │                  │ 2. POST         │                 │                  │                │
   │                  │ /api/ddc/airb/  │                 │                  │                │
   │                  │ scrape          │                 │                  │                │
   │                  │────────────────▶│                 │                  │                │
   │                  │                 │                 │                  │                │
   │                  │                 │ 3. Gatekeeper   │                  │                │
   │                  │                 │ Check:          │                  │                │
   │                  │                 │ - Tenant ativo? │                  │                │
   │                  │                 │ - Plano AirB?   │                  │                │
   │                  │                 │ - Limite props? │                  │                │
   │                  │                 │                 │                  │                │
   │                  │                 │ 4. Criar        │                  │                │
   │                  │                 │ AirBScrapingJob │                  │                │
   │                  │                 │ status=queued   │                  │                │
   │                  │                 │                 │                  │                │
   │                  │                 │ 5. Enviar job   │                  │                │
   │                  │                 │ para fila       │                  │                │
   │                  │                 │────────────────▶│                  │                │
   │                  │                 │                 │                  │                │
   │                  │ 6. Retornar     │                 │                  │                │
   │                  │ jobId + status  │                 │                  │                │
   │                  │◀────────────────│                 │                  │                │
   │                  │                 │                 │                  │                │
   │ Mostra progresso │                 │                 │ 7. Executar      │                │
   │ (polling/SSE)    │                 │                 │ scraping         │                │
   │                  │                 │                 │─────────┐        │                │
   │                  │                 │                 │         │        │                │
   │                  │                 │                 │◀────────┘        │                │
   │                  │                 │                 │                  │                │
   │                  │                 │                 │ 8. Extrair:      │                │
   │                  │                 │                 │ - Título         │                │
   │                  │                 │                 │ - Descrição      │                │
   │                  │ │                 │                 │ - Regras da Casa │                │
   │                  │                 │                 │ - Comodidades    │                │
   │                  │                 │                 │ - Preço Base     │                │
   │                  │                 │                 │ - Localização    │                │
   │                  │                 │                 │ - Fotos          │                │
   │                  │                 │                 │                  │                │
   │                  │                 │                 │ 9. Geocode       │                │
   │                  │                 │                 │ endereço         │                │
   │                  │                 │                 │─────────────────▶│                │
   │                  │                 │                 │                  │                │
   │                  │                 │                 │ 10. Lat/Lng      │                │
   │                  │                 │                 │◀─────────────────│                │
   │                  │                 │                 │                  │                │
   │                  │                 │                 │ 11. POI Search   │                │
   │                  │                 │                 │ (raio 2km)       │                │
   │                  │                 │                 │─────────────────▶│                │
   │                  │                 │                 │                  │                │
   │                  │                 │                 │ 12. Lista POIs:  │                │
   │                  │                 │                 │ - Praias         │                │
   │                  │                 │                 │ - Padarias       │                │
   │                  │                 │                 │ - Farmácias      │                │
   │                  │                 │                 │ - Mercados       │                │
   │                  │                 │                 │ - Restaurantes   │                │
   │                  │                 │                 │ - Pontos turíst. │                │
   │                  │                 │                 │◀─────────────────│                │
   │                  │                 │                 │                  │                │
   │                  │                 │                 │ 13. Salvar tudo  │                │
   │                  │                 │                 │ no PostgreSQL:   │                │
   │                  │                 │                 │ - AirBProperty   │                │
   │                  │                 │                 │ - AirBRegional   │                │
   │                  │                 │                 │   Knowledge      │                │
   │                  │                 │                 │                  │                │
   │                  │                 │                 │ 14. Gerar        │                │
   │                  │ │                 │                 │ embeddings e     │                │
   │                  │                 │                 │ indexar no       │                │
   │                  │                 │                 │ Vector DB        │                │
   │                  │                 │                 │──────────────────────────────────▶│
   │                  │                 │                 │                  │                │
   │                  │                 │                 │ 15. Atualizar    │                │
   │                  │                 │                 │ AirBScrapingJob  │                │
   │                  │                 │                 │ status=completed │                │
   │                  │                 │                 │                  │                │
   │                  │                 │ 16. Notificar   │                  │                │
   │                  │                 │ via SSE/polling │                  │                │
   │                  │◀────────────────│                 │                  │                │
   │                  │                 │                 │                  │                │
   │ 17. Formulário   │                 │                 │                  │                │
   │ pré-preenchido   │                 │                 │                  │                │
   │ com dados + POIs │                 │                 │                  │                │
   │◀─────────────────│                 │                 │                  │                │
   │                  │                 │                 │                  │                │
   │ 18. Revisa,      │                 │                 │                  │                │
   │ complementa e    │                 │                 │                  │                │
   │ salva            │                 │                 │                  │                │
   │─────────────────▶│                 │                 │                  │                │
```

### 5.2 Microserviço de Scraping — Design

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    SCRAPING MICROSERVICE (Porta Interna 3010)               │
│                                                                             │
│  Tecnologia: Bun + TypeScript (mesmo runtime do projeto principal)         │
│  Comunicação: HTTP interna (não exposta ao público)                        │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │  ENDPOINTS                                                          │    │
│  │  ─────────────────────────────────────────────────────────────────  │    │
│  │  POST /api/scrape/airbnb                                           │    │
│  │    Body: { airbnbUrl: string, tenantId: string, idempotencyKey }   │    │
│  │    Response: { jobId: string, status: "queued" }                    │    │
│  │                                                                     │    │
│  │  GET /api/scrape/job/:jobId                                        │    │
│  │    Response: { status, result?, error?, progress% }                  │    │
│  │                                                                     │    │
│  │  GET /api/scrape/health                                            │    │
│  │    Response: { status: "ok", queueSize, workersActive }             │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │  PIPELINE INTERNO                                                   │    │
│  │  ─────────────────────────────────────────────────────────────────  │    │
│  │                                                                     │    │
│  │  1. VALIDATE URL                                                    │    │
│  │     → Regex: /^https?:\/\/(www\.)?airbnb\.\w+\/rooms\/\d+/        │    │
│  │     → Extrair airbnbId (room number) da URL                        │    │
│  │                                                                     │    │
│  │  2. IDEMPOTENCY CHECK                                               │    │
│  │     → Verificar AirBScrapingJob com mesmo idempotencyKey           │    │
│  │     → Se exists + completed → retornar resultado cacheado          │    │
│  │     → Se exists + running → retornar jobId existente               │    │
│  │                                                                     │    │
│  │  3. SCRAPE (Estratégia em camadas)                                  │    │
│  │     Camada A: API Oficial Airbnb (se disponível/token)              │    │
│  │       → /api/v3/StaysDetail — dados estruturados                   │    │
│  │     Camada B: Headless Browser (Playwright/Puppeteer)              │    │
│  │       → Renderizar página, extrair JSON-LD + meta tags             │    │
│  │       → Aguardar hydration do React para dados dinâmicos           │    │
│  │     Camada C: AI Extractor (fallback)                               │    │
│  │       → Screenshot da página → VLM extrai dados                    │    │
│  │       → Custo mais alto, mas funciona contra qualquer layout       │    │
│  │                                                                     │    │
│  │  4. NORMALIZE                                                       │    │
│  │     → Mapear campos para schema AirBProperty                       │    │
│  │     → Parsear houseRules para JSONB estruturado                     │    │
│  │     → Parsear amenities para categorias padronizadas               │    │
│  │                                                                     │    │
│  │  5. GEOCODE                                                         │    │
│  │     → Google Places API: Geocode do endereço                       │    │
│  │     → Obter lat/lng + place_id                                      │    │
│  │                                                                     │    │
│  │  6. POI DISCOVERY (Raio 2km)                                        │    │
│  │     → Google Places Nearby Search                                   │    │
│  │     → Categorias: beach, bakery, pharmacy, supermarket,            │    │
│  │       restaurant, hospital, tourism, atm, transport                 │    │
│  │     → Calcular distância e tempo caminhando                        │    │
│  │     → Ordenar por relevância + distância                           │    │
│  │                                                                     │    │
│  │  7. PERSIST                                                         │    │
│  │     → UPSERT AirBProperty                                           │    │
│  │     → INSERT AirBRegionalKnowledge (batch)                          │    │
│  │     → Gerar embeddings + indexar no Vector DB                      │    │
│  │     → UPDATE AirBScrapingJob status = completed                     │    │
│  │                                                                     │    │
│  │  8. NOTIFY                                                          │    │
│  │     → Callback para app principal (webhook interno)                 │    │
│  │     → Ou SSE para o frontend do DDC                                │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │  RATE LIMITS (Proteção)                                             │    │
│  │  ─────────────────────────────────────────────────────────────────  │    │
│  │  - Max 3 scraping jobs simultâneos por tenant                      │    │
│  │  - Max 10 scraping jobs por hora por tenant                        │    │
│  │  - Cooldown de 5 min entre re-scrapes do mesmo Airbnb ID          │    │
│  │  - Retry com backoff exponencial: 30s, 60s, 120s                  │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 5.3 Fluxo de Dados do Enriquecimento Geolocalizado

```
[Endereço Extraído do Scraping]
       │
       ▼
[Google Geocoding API]
  Input: "Apartamento na Praia de Jurerê, Florianópolis - SC"
  Output: { lat: -27.4407, lng: -48.4903, placeId: "ChIJ..." }
       │
       ▼
[Google Places Nearby Search — Raio 2000m]
  │
  ├── type: "bakery"           → 8 resultados
  ├── type: "supermarket"      → 5 resultados
  ├── type: "pharmacy"         → 3 resultados
  ├── type: "beach" (keyword)  → 2 resultados
  ├── type: "restaurant"       → 15 resultados
  ├── type: "hospital"         → 2 resultados
  ├── type: "tourist_attraction" → 6 resultados
  ├── type: "atm"              → 4 resultados
  ├── type: "bus_station"      → 2 resultados
  └── type: "convenience_store" → 7 resultados
       │
       ▼
[Distance Matrix API] (batch: propriedade → cada POI)
  Output: { distance_km, walking_duration_min, driving_duration_min }
       │
       ▼
[Filtro de Qualidade]
  - Remover POIs com distância > 3km
  - Remover POIs permanentemente fechados
  - Limitar a top 5 por categoria
  - Ordenar por distância + rating
       │
       ▼
[Persistência]
  ├── AirBRegionalKnowledge (PostgreSQL) — dados estruturados
  └── airb_embeddings (pgvector) — embeddings para RAG
       │
       ▼
[Disponível para o Cérebro Zélla AirB]
  Query: "Tem mercado perto?"
  RAG → SELECT similarity search → "Mercado Bom Preço, 0.3km, 4 min caminhando"
  Agente responde: "Tem sim! O Mercado Bom Preço fica a apenas 4 minutinhos
  de caminhada daqui da propriedade. Fica na rua principal, impossível errar!"
```

---

## 6. O CÉREBRO ZÉLLA AIRB — SISTEMA MULTI-AGENTE COM RAG

### 6.1 Arquitetura de Agentes

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                     CÉREBRO ZÉLLA AIRB — ORQUESTRAÇÃO                       │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │                    AIRB CONVERSATION ORCHESTRATOR                    │    │
│  │                    (Gateway de Entrada Única)                        │    │
│  │                                                                     │    │
│  │  Input: { message, conversationId, tenantId, propertyId }          │    │
│  │                                                                     │    │
│  │  1. Classificar MODO da conversa:                                   │    │
│  │     → pre_booking  (hóspede potencial, sem reserva)                │    │
│  │     → post_booking (hóspede com reserva confirmada)                │    │
│  │                                                                     │    │
│  │  2. Detectar CONTEXTO de plataforma:                                │    │
│  │     → airbnb_app / airbnb_web → PROIBIDO oferecer PIX              │    │
│  │     → direct / whatsapp → PERMITIDO oferecer PIX                   │    │
│  │     → unknown → Conservador (sem PIX)                              │    │
│  │                                                                     │    │
│  │  3. Classificar INTENT com confiança:                               │    │
│  │     → location_info  ("Onde fica? Como chegar?")                   │    │
│  │     → house_rules    ("Posso levar pet? Pode fumar?")              │    │
│  │     → amenities      ("Tem WiFi? Piscina? Estacionamento?")        │    │
│  │     → checkin        ("Como faço check-in? Qual a senha?")         │    │
│  │     → pricing        ("Qual o valor? Tem desconto?")               │    │
│  │     → booking_intent ("Quero reservar! Como faço?")                │    │
│  │     → neighborhood   ("Tem mercado perto? Praia? Farmácia?")        │    │
│  │     → complaint      ("Ar condicionado não liga! Chuveiro frio!")  │    │
│  │     → checkout       ("Horário de checkout? O que fazer?")         │    │
│  │     → emergency      ("Perdi a chave! Vazamento! Emergência!")     │    │
│  │     → general_greet  ("Olá! Tudo bem?")                           │    │
│  │                                                                     │    │
│  │  4. ROTEAR para Agente Especializado:                               │    │
│  └─────────┬──────────┬──────────┬──────────┬──────────┬──────────────┘    │
│            │          │          │          │          │                    │
│            ▼          ▼          ▼          ▼          ▼                    │
│  ┌──────────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌────────────┐   │
│  │   AGENTE     │ │ AGENTE   │ │ AGENTE   │ │ AGENTE   │ │  AGENTE    │   │
│  │   ANFITRIÃO  │ │ CONCIERGE│ │  CHECK-IN│ │ RESOLVER │ │ RESERVAS   │   │
│  │   (Geral)    │ │(Regional)│ │(Acesso)  │ │(Problemas)│ │(Comercial) │   │
│  │              │ │          │ │          │ │          │ │            │   │
│  │ Saudação,   │ │ POIs,    │ │ WiFi,    │ │ Queixas, │ │ PIX (só se │   │
│  │ Regras,     │ │ Praias,  │ │ Senha,   │ │ Manuten. │ │ contexto   │   │
│  │ Comodidades │ │ Bares    │ │ Check-out│ │ Emergên. │ │ permitir)  │   │
│  │              │ │          │ │          │ │          │ │            │   │
│  │ RAG:        │ │ RAG:     │ │ RAG:     │ │ RAG:     │ │ Sem RAG   │   │
│  │ property_   │ │ regional │ │ checkin_ │ │ host_    │ │ (dados de  │   │
│  │ description │ │ knowledge│ │ instruct │ │ knowledge│ │ preço fixo)│   │
│  │ house_rules │ │          │ │          │ │          │ │            │   │
│  │ amenity     │ │          │ │          │ │          │ │            │   │
│  └──────────────┘ └──────────┘ └──────────┘ └──────────┘ └────────────┘   │
│                                                                             │
│  ═══════════════════════════════════════════════════════════════════════    │
│  CONSTRAINT: Todos os agentes compartilham o mesmo System Prompt base      │
│  (tom de voz Anfitrião). A especialização é apenas de CONHECIMENTO,      │
│  não de personalidade. O hóspede deve sentir que fala com a mesma pessoa. │
│  ═══════════════════════════════════════════════════════════════════════    │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 6.2 Pipeline RAG — Detalhamento

```
[Mensagem do Hóspede]: "Tem mercado perto? E farmácia?"
       │
       ▼
[1. INTENT CLASSIFICATION]
  → Intents: ["neighborhood", "neighborhood"]
  → Confidence: 0.94
  → Route to: AGENTE CONCIERGE
       │
       ▼
[2. QUERY REFORMULATION]
  → Original: "Tem mercado perto? E farmácia?"
  → Reformulated for vector search:
    - "mercado supermercado próximo propriedade"
    - "farmácia drogaria próxima propriedade"
       │
       ▼
[3. VECTOR SEARCH — pgvector]
  Namespace: tenant_id = 'abc-123', property_id = 'prop-456'
  
  Query 1: embedding("mercado supermercado próximo propriedade")
  → Top 3 results:
    1. "Supermercado Bom Preço — 0.3km, 4 min caminhando" (sim: 0.89)
    2. "Carrefour Express — 0.8km, 10 min caminhando" (sim: 0.82)
    3. "Mini Box Mercadinho — 1.2km, 15 min caminhando" (sim: 0.76)

  Query 2: embedding("farmácia drogaria próxima propriedade")
  → Top 3 results:
    1. "Drogasil — 0.5km, 6 min caminhando" (sim: 0.91)
    2. "Farmácia Popular — 1.0km, 12 min caminhando" (sim: 0.84)
       │
       ▼
[4. CONTEXT ASSEMBLY]
  Context injected into LLM:
  """
  [DADOS REGIONAIS DA PROPRIEDADE]
  - Supermercado Bom Preço: 0.3km, 4 min caminhando
  - Carrefour Express: 0.8km, 10 min caminhando
  - Drogasil: 0.5km, 6 min caminhando
  - Farmácia Popular: 1.0km, 12 min caminhando
  
  [REGRAS DE RESPOSTA]
  - Responda como o DONO DO IMÓVEL (tom acolhedor, humanizado)
  - Use diminutivos ("minutinhos", "pertinho")
  - Seja específico com nomes e distâncias
  - Não invente informações que não estejam no contexto
  """
       │
       ▼
[5. LLM GENERATION]
  Model: gpt-4o-mini / gemini-1.5-flash (via ZaosNeuroRouter)
  
  Response: "Tem sim! O Supermercado Bom Preço fica a apenas 4 
  minutinhos de caminhada daqui — é pertinho, na rua principal, 
  impossível errar! E pra farmácia, a Drogasil fica a 6 minutinhos, 
  bem ali na esquina. Qualquer coisa, posso te passar o endereço 
  certinho!"
       │
       ▼
[6. POST-PROCESSING]
  → Salvar AirBMessage (outbound)
  → Atualizar AirBConversation.lastIntent
  → Log de custo (costUsd)
  → Verificar se precisa escalar para humano
```

### 6.3 Regra Crítica: Comportamento Context-Aware (PIX Gate)

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    PIX GATE — DECISION MATRIX                          │
│                                                                         │
│  ┌─────────────────┬──────────────────┬──────────────────────────────┐ │
│  │ platformContext │  conversationMode│  Ação PIX                   │ │
│  ├─────────────────┼──────────────────┼──────────────────────────────┤ │
│  │ airbnb_app      │  pre_booking     │  ❌ PROIBIDO                │ │
│  │ airbnb_app      │  post_booking    │  ❌ PROIBIDO                │ │
│  │ airbnb_web      │  pre_booking     │  ❌ PROIBIDO                │ │
│  │ airbnb_web      │  post_booking    │  ❌ PROIBIDO                │ │
│  │ direct          │  pre_booking     │  ✅ PERMITIDO               │ │
│  │ direct          │  post_booking    │  ⚠️ NÃO NECESSÁRIO          │ │
│  │ whatsapp        │  pre_booking     │  ✅ PERMITIDO               │ │
│  │ whatsapp        │  post_booking    │  ⚠️ NÃO NECESSÁRIO          │ │
│  │ unknown         │  any             │  ❌ PROIBIDO (conservador)  │ │
│  └─────────────────┴──────────────────┴──────────────────────────────┘ │
│                                                                         │
│  RAZÃO: Quando o hóspede vem do Airbnb, a reserva é processada pela   │
│  plataforma. Oferecer pagamento direto (PIX) viola os Termos de       │
│  Serviço do Airbnb e pode resultar em suspensão da conta do anfitrião. │
│                                                                         │
│  IMPLEMENTAÇÃO: O PIX Gate é verificado em DUAS camadas:              │
│  1. System Prompt — instrui o LLM a nunca oferecer PIX em contexto    │
│     Airbnb (camada soft, pode falhar por hallucination)               │
│  2. Post-Processing Filter — regex/filtro que remove qualquer menção   │
│     a PIX, chave PIX, ou dados bancários quando platformContext é     │
│     airbnb_* (camada hard, garantia estrutural)                       │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 7. PSEUDOCÓDIGO — RESTRIÇÃO DE ENTITLEMENTS (PRO vs MAX)

### 7.1 Constantes e Tipos

```
┌─────────────────────────────────────────────────────────────────────────┐
│  TIPOS E CONSTANTES                                                    │
│  ═══════════════════════════════════════════════════════════════════    │
│                                                                         │
│  ENUM AirBPlanType:                                                    │
│    airb_pro   → R$397/mês, limite 4 propriedades                      │
│    airb_max   → R$797/mês, limite 12 propriedades                     │
│                                                                         │
│  ENUM EntitlementAction:                                               │
│    CREATE_PROPERTY        → Criar nova propriedade                     │
│    ACTIVATE_WEBHOOK       → Ativar webhook para imóvel                │
│    START_SCRAPING_JOB     → Iniciar job de scraping                   │
│    ACCESS_CONCIERGE_RAG   → Usar RAG com dados regionais              │
│    ACCESS_AI_CONVERSATIONS → Ter conversas com IA ativas              │
│                                                                         │
│  MAP PropertyLimits:                                                   │
│    airb_pro  → { maxProperties: 4,  maxConcurrentScrapes: 1 }        │
│    airb_max  → { maxProperties: 12, maxConcurrentScrapes: 3 }        │
│                                                                         │
│  MAP FeatureGates:                                                     │
│    airb_pro  → { conciergeRAG: true,  aiConversations: true,         │
│                   maxActiveConversations: 50, prioritySupport: false } │
│    airb_max  → { conciergeRAG: true,  aiConversations: true,         │
│                   maxActiveConversations: 200, prioritySupport: true } │
└─────────────────────────────────────────────────────────────────────────┘
```

### 7.2 Gatekeeper — Pseudocódigo

```typescript
// ═══════════════════════════════════════════════════════════════
// GATEKEEPER DE ENTITLEMENTS — ZÉLLA AIRB
// Validação obrigatória no backend ANTES de qualquer operação
// ═══════════════════════════════════════════════════════════════

INTERFACE EntitlementResult:
  allowed: boolean
  reason: string | null
  currentCount: number
  maxAllowed: number
  planType: AirBPlanType

FUNCTION checkEntitlement(
  tenantId: UUID,
  action: EntitlementAction
) → EntitlementResult | ERROR:

  // ── PASSO 1: Resolver assinatura ativa ──
  subscription = await db.airBSubscription.findFirst({
    where: {
      tenantId: tenantId,
      status: { IN: ['active', 'past_due'] }
    },
    orderBy: { createdAt: 'desc' }
  })

  IF subscription IS NULL:
    RETURN {
      allowed: false,
      reason: "AIRB_NO_SUBSCRIPTION",
      currentCount: 0,
      maxAllowed: 0,
      planType: null
    }

  // ── PASSO 2: Verificar se assinatura não está expirada ──
  IF subscription.currentPeriodEnd < NOW():
    subscription.status = 'expired'
    await db.airBSubscription.update(...)
    RETURN {
      allowed: false,
      reason: "AIRB_SUBSCRIPTION_EXPIRED",
      currentCount: 0,
      maxAllowed: 0,
      planType: subscription.planType
    }

  // ── PASSO 3: Resolver limites do plano ──
  limits = PropertyLimits[subscription.planType]
  features = FeatureGates[subscription.planType]

  IF limits IS UNDEFINED:
    RETURN {
      allowed: false,
      reason: "AIRB_INVALID_PLAN",
      currentCount: 0,
      maxAllowed: 0,
      planType: subscription.planType
    }

  // ── PASSO 4: Contar propriedades ativas ──
  activePropertyCount = await db.airBProperty.count({
    where: {
      tenantId: tenantId,
      status: { IN: ['active', 'scraping_pending'] }
    }
  })

  // ── PASSO 5: Avaliar ação solicitada ──
  SWITCH action:

    CASE CREATE_PROPERTY:
      IF activePropertyCount >= limits.maxProperties:
        RETURN {
          allowed: false,
          reason: "AIRB_PROPERTY_LIMIT_REACHED",
          currentCount: activePropertyCount,
          maxAllowed: limits.maxProperties,
          planType: subscription.planType
        }
      RETURN {
        allowed: true,
        reason: null,
        currentCount: activePropertyCount,
        maxAllowed: limits.maxProperties,
        planType: subscription.planType
      }

    CASE START_SCRAPING_JOB:
      // Verificar limite de propriedades (scraping = criar propriedade)
      IF activePropertyCount >= limits.maxProperties:
        // Checar se já existe propriedade com este airbnbId (re-scrape ok)
        existingProperty = await db.airBProperty.findFirst({
          where: {
            tenantId: tenantId,
            airbnbUrl: requestedUrl
          }
        })
        IF existingProperty IS NULL:
          RETURN {
            allowed: false,
            reason: "AIRB_PROPERTY_LIMIT_REACHED",
            currentCount: activePropertyCount,
            maxAllowed: limits.maxProperties,
            planType: subscription.planType
          }

      // Verificar limite de scrapes concorrentes
      runningScrapes = await db.airBScrapingJob.count({
        where: {
          tenantId: tenantId,
          status: { IN: ['queued', 'running'] }
        }
      })
      IF runningScrapes >= limits.maxConcurrentScrapes:
        RETURN {
          allowed: false,
          reason: "AIRB_CONCURRENT_SCRAPE_LIMIT",
          currentCount: runningScrapes,
          maxAllowed: limits.maxConcurrentScrapes,
          planType: subscription.planType
        }

      // Verificar rate limit (max 10/hora)
      recentScrapes = await db.airBScrapingJob.count({
        where: {
          tenantId: tenantId,
          createdAt: { gte: NOW() - INTERVAL('1 hour') }
        }
      })
      IF recentScrapes >= 10:
        RETURN {
          allowed: false,
          reason: "AIRB_SCRAPE_RATE_LIMIT",
          currentCount: recentScrapes,
          maxAllowed: 10,
          planType: subscription.planType
        }

      RETURN {
        allowed: true,
        reason: null,
        currentCount: activePropertyCount,
        maxAllowed: limits.maxProperties,
        planType: subscription.planType
      }

    CASE ACTIVATE_WEBHOOK:
      // Webhook só para propriedades ativas (já contabilizadas)
      property = await db.airBProperty.findFirst({
        where: { id: propertyId, tenantId: tenantId }
      })
      IF property IS NULL:
        RETURN {
          allowed: false,
          reason: "AIRB_PROPERTY_NOT_FOUND",
          currentCount: activePropertyCount,
          maxAllowed: limits.maxProperties,
          planType: subscription.planType
        }
      IF property.status != 'active':
        RETURN {
          allowed: false,
          reason: "AIRB_PROPERTY_NOT_ACTIVE",
          currentCount: activePropertyCount,
          maxAllowed: limits.maxProperties,
          planType: subscription.planType
        }
      RETURN {
        allowed: true,
        reason: null,
        currentCount: activePropertyCount,
        maxAllowed: limits.maxProperties,
        planType: subscription.planType
      }

    CASE ACCESS_CONCIERGE_RAG:
      IF NOT features.conciergeRAG:
        RETURN {
          allowed: false,
          reason: "AIRB_RAG_NOT_AVAILABLE",
          currentCount: 0,
          maxAllowed: 0,
          planType: subscription.planType
        }
      RETURN { allowed: true, ... }

    CASE ACCESS_AI_CONVERSATIONS:
      IF NOT features.aiConversations:
        RETURN {
          allowed: false,
          reason: "AIRB_AI_CONVERSATIONS_NOT_AVAILABLE",
          currentCount: 0,
          maxAllowed: 0,
          planType: subscription.planType
        }
      // Verificar limite de conversas ativas
      activeConversations = await db.airBConversation.count({
        where: {
          tenantId: tenantId,
          status: 'active'
        }
      })
      IF activeConversations >= features.maxActiveConversations:
        RETURN {
          allowed: false,
          reason: "AIRB_CONVERSATION_LIMIT_REACHED",
          currentCount: activeConversations,
          maxAllowed: features.maxActiveConversations,
          planType: subscription.planType
        }
      RETURN { allowed: true, ... }

// ═══════════════════════════════════════════════════════════════
// MIDDLEWARE DE APLICAÇÃO — Injeta validação em todas as rotas AirB
// ═══════════════════════════════════════════════════════════════

FUNCTION withAirBEntitlement(action: EntitlementAction, handler: Function):
  RETURN async (request, context) => {
    tenantId = await resolveTenantId(request)
    result = await checkEntitlement(tenantId, action)

    IF NOT result.allowed:
      RETURN Response.json({
        error: result.reason,
        currentCount: result.currentCount,
        maxAllowed: result.maxAllowed,
        upgradeRequired: true,
        upgradeUrl: "/checkout?module=airb&plan=" + (
          result.planType == 'airb_pro' ? 'airb_max' : 'airb_pro'
        )
      }, { status: 403 })

    RETURN handler(request, context, result)
  }

// Uso nas rotas:
// POST /api/ddc/airb/scrape → withAirBEntitlement(START_SCRAPING_JOB, handler)
// POST /api/ddc/airb/properties → withAirBEntitlement(CREATE_PROPERTY, handler)
// POST /api/ddc/airb/conversations → withAirBEntitlement(ACCESS_AI_CONVERSATIONS, handler)
```

### 7.3 Fluxo de Bloqueio Visual no DDC

```
[Anfitrião tenta cadastrar 5º imóvel no PRO]
       │
       ▼
[Frontend: ZellaAirBTab.tsx]
  → POST /api/ddc/airb/properties
  → Response: 403 { error: "AIRB_PROPERTY_LIMIT_REACHED",
                     currentCount: 4, maxAllowed: 4,
                     upgradeRequired: true }
       │
       ▼
[UI: PlanGate Component]
  ┌────────────────────────────────────────────────────────┐
  │  🔒 Limite atingido!                                   │
  │                                                         │
  │  Seu plano PRO permite até 4 imóveis.                  │
  │  Você já tem 4 imóveis cadastrados.                    │
  │                                                         │
  │  ┌──────────────────────────────────────────────────┐  │
  │  │  Plano MAX — R$797/mês                          │  │
  │  │  ✅ Até 12 imóveis                              │  │
  │  │  ✅ Até 3 scrapes simultâneos                   │  │
  │  │  ✅ 200 conversas IA ativas                     │  │
  │  │  ✅ Suporte prioritário                         │  │
  │  │                                                  │  │
  │  │  [Fazer Upgrade →]                              │  │
  │  └──────────────────────────────────────────────────┘  │
  └────────────────────────────────────────────────────────┘
```

---

## 8. ESQUELETO DO SYSTEM PROMPT BASE — TOM DE VOZ ANFITRIÃO

### 8.1 Prompt Base (Template Canônico)

```markdown
# SYSTEM PROMPT — CÉREBRO ZÉLLA AIRB
# Versão: 1.0.0 | Módulo: Zélla AirB
# IDENTIDADE E COMPORTAMENTO OBRIGATÓRIO

## IDENTIDADE PRIMÁRIA

Você é o(a) **anfitrião(a)** do imóvel "{{PROPERTY_NAME}}". Você NÃO é um
atendente de hotel, NÃO é um bot, NÃO é um assistente virtual genérico. Você
é o dono(a) da propriedade que está recebendo o hóspede com carinho e
cuidado pessoal.

Seu nome de apresentação: "{{HOST_FIRST_NAME}}" (se configurado) ou
"Anfitrião da {{PROPERTY_NAME}}".

## TOM DE VOZ (OBRIGATÓRIO)

1. **Acolhedor e Humanizado**: Fale como uma pessoa real que se importa com
   a experiência do hóspede. Use expressões naturais e calorosas.

2. **Senso de Propriedade**: Referencie o imóvel como "casa da gente",
   "aqui da propriedade", "nossa casinha", "meu apartamento". NUNCA diga
   "o estabelecimento" ou "a unidade".

3. **Diminutivos Carinhosos**: Use com moderação mas naturalmente:
   - "minutinhos" em vez de "minutos"
   - "pertinho" em vez de "perto"
   - "rapidinho" em vez de "rápido"
   - "quentinho" em vez de "quente"

4. **Proativo mas Respeitoso**: Antecipe necessidades ("Posso te mandar
   o mapa com os atalhos?"), mas não seja invasivo.

5. **Linguagem**: Português brasileiro, informal mas educado. Sem gírias
   regionais excessivas (o hóspede pode ser de qualquer lugar).

6. **Emojis**: Use com moderação para dar calor humano:
   - ✅ para confirmações
   - 📍 para localizações
   - 😊 para saudações
   - ⚠️ para alertas importantes
   - NÃO use emojis em excesso (máximo 2 por mensagem)

## CONHECIMENTO DISPONÍVEL (RAG CONTEXT)

As informações abaixo vêm do banco de conhecimento da propriedade e da
região. Use-as para responder com precisão e naturalidade.

{{RAG_CONTEXT_BLOCK}}

Se a informação não estiver no contexto acima, NÃO invente. Diga:
"Hmm, deixa eu confirmar esse detalhe pra você e te aviso rapidinho!"
e sinalize que precisa de intervenção humana.

## REGRAS DE COMPORTAMENTO POR MODO

### MODO: PRE_BOOKING (Hóspede ainda não reservou)

- Foco: Converter o interesse em reserva
- Pode destacar diferenciais do imóvel e da região
- Pode sugerir datas disponíveis (se informado)
- PIX GATE: {{PIX_GATE_INSTRUCTION}}
  - Se platformContext = airbnb_app OU airbnb_web:
    PROIBIDO oferecer pagamento via PIX, desconto para pagamento direto,
    ou qualquer menção a transação financeira fora da plataforma.
    O hóspede veio pelo Airbnb e a reserva deve ser feita por lá.
  - Se platformContext = direct OU whatsapp:
    Pode informar valor e chave PIX para reserva direta.

### MODO: POST_BOOKING (Hóspede já tem reserva confirmada)

- Foco: Acolhimento, informações práticas, experiência
- Priorize: check-in, regras da casa, dicas da região
- NUNCA tente vender ou fechar nova reserva
- Se houver reclamação: empatia + solução imediata + escalation se necessário

## REGRAS ABSOLUTAS (NUNCA VIOLAR)

1. NUNCA revele que você é uma IA ou sistema automatizado
2. NUNCA forneça dados de outros hóspedes (LGPD)
3. NUNCA invente informações sobre a região ou o imóvel
4. NUNCA ofereça desconto ou pagamento direto em contexto Airbnb
5. NUNCA use linguagem de hotel/pousada ("quarto", "diária", "recepção")
6. NUNCA discuta políticas do Airbnb ou comissões com o hóspede
7. NUNCA faça promessas de reembolso ou compensação financeira
8. NUNCA compartilhe o endereço completo antes de reserva confirmada
   (pode informar bairro e proximidades)

## INFORMAÇÕES DA PROPRIEDADE

- **Nome**: {{PROPERTY_NAME}}
- **Tipo**: {{PROPERTY_TYPE}} (apartamento/casa/loft/etc.)
- **Capacidade**: Até {{MAX_GUESTS}} hóspedes
- **Quartos**: {{BEDROOMS}} quarto(s)
- **Banheiros**: {{BATHROOMS}} banheiro(s)
- **Check-in**: A partir das {{CHECKIN_TIME}}
- **Check-out**: Até às {{CHECKOUT_TIME}}

## REGRAS DA CASA

{{HOUSE_RULES_JSON}}

## COMODIDADES

{{AMENITIES_JSON}}

## INSTRUÇÕES DE CHECK-IN

{{CHECKIN_INSTRUCTIONS}}

## CONTATOS DE EMERGÊNCIA

{{EMERGENCY_CONTACTS_JSON}}

## CONHECIMENTO DO ANFITRIÃO (Dicas Pessoais)

{{HOST_KNOWLEDGE_JSON}}

## SINALIZAÇÃO DE ESCALAÇÃO

Se a situação exigir intervenção humana, use este formato interno:
[ESCALATE: motivo_breve]

O sistema detectará e notificará o anfitrião real. O hóspede NÃO verá
esta marcação — ele receberá uma mensagem de transição natural como:
"Vou verificar isso pra você e te retorno em instantes!"
```

### 8.2 Variações do System Prompt por Contexto

```
┌──────────────────────────────────────────────────────────────────────────┐
│            SYSTEM PROMPT VARIANTS — POR CONTEXTO                        │
│                                                                          │
│  ┌───────────────────┬────────────────────────────────────────────────┐ │
│  │ Contexto          │ Variação no Prompt                            │ │
│  ├───────────────────┼────────────────────────────────────────────────┤ │
│  │ airbnb_app +      │ PIX_GATE_INSTRUCTION = bloco PROIBIDO;       │ │
│  │ pre_booking       │ Adicionar: "O hóspede está navegando no      │ │
│  │                   │ app Airbnb. Foque em destacar o imóvel e      │ │
│  │                   │ responder dúvidas. NÃO mencione pagamento."   │ │
│  ├───────────────────┼────────────────────────────────────────────────┤ │
│  │ airbnb_app +      │ PIX_GATE_INSTRUCTION = bloco PROIBIDO;       │ │
│  │ post_booking      │ Adicionar: "O hóspede já reservou pelo       │ │
│  │                   │ Airbnb. Foque 100% em acolhimento, regras     │ │
│  │                   │ da casa e check-in. NÃO mencione pagamento."  │ │
│  ├───────────────────┼────────────────────────────────────────────────┤ │
│  │ whatsapp +        │ PIX_GATE_INSTRUCTION = bloco PERMITIDO;      │ │
│  │ pre_booking       │ Adicionar: "O hóspede veio pelo WhatsApp.    │ │
│  │                   │ Pode informar valor e chave PIX se houver     │ │
│  │                   │ interesse em reserva direta."                 │ │
│  ├───────────────────┼────────────────────────────────────────────────┤ │
│  │ whatsapp +        │ PIX_GATE_INSTRUCTION = "Não ofereça PIX —    │ │
│  │ post_booking      │ hóspede já confirmou. Foque em acolhimento." │ │
│  ├───────────────────┼────────────────────────────────────────────────┤ │
│  │ direct +          │ PIX_GATE_INSTRUCTION = bloco PERMITIDO;      │ │
│  │ pre_booking       │ Adicionar: "Contato direto. Pode oferecer    │ │
│  │                   │ reserva com pagamento PIX."                   │ │
│  └───────────────────┴────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────────────────┘
```

---

## 9. ISOLAMENTO FINANCEIRO — AIRB VS POUSADAS

### 9.1 Arquitetura de Ledger Duplo

```
┌──────────────────────────────────────────────────────────────────────────┐
│                    FINANCIAL CHINESE WALL                                │
│                                                                          │
│  ┌──────────────────────────────┐  ┌──────────────────────────────────┐ │
│  │    LEDGER POUSADAS           │  │    LEDGER AIRB                   │ │
│  │    ════════════════          │  │    ══════════════                │ │
│  │                              │  │                                  │ │
│  │  Tabela: Subscription       │  │  Tabela: AirBSubscription        │ │
│  │  planType: lite/pro/max     │  │  planType: airb_pro/airb_max     │ │
│  │  amount: 197/397/797        │  │  amount: 397/797                 │ │
│  │                              │  │                                  │ │
│  │  Tabela: Transaction        │  │  Tabela: AirBTransaction         │ │
│  │  type: PAYMENT/REFUND/      │  │  type: subscription_payment/     │ │
│  │        CHARGE               │  │        refund/adjustment         │ │
│  │  method: PIX/CREDIT_CARD/   │  │  method: PIX/cartao              │ │
│  │         CASH                │  │                                  │ │
│  │  → Reservation FK           │  │  → AirBProperty FK (nullable)    │ │
│  │                              │  │  → AirBSubscription FK (nullable)│ │
│  │  Split: Pousada 85%         │  │  Split: Anfitrião 80%           │ │
│  │         ZEHLA 5%            │  │         ZEHLA 12%                │ │
│  │         Gateway 2.99%       │  │         Gateway 2.99%            │ │
│  │         IA Fee 3.01%        │  │         IA Fee 3.01%             │ │
│  │         Tributos 4%         │  │         Tributos 2%              │ │
│  │                              │  │                                  │ │
│  │  Dashboard: ZCC → FintechHub│  │  Dashboard: ZCC → FintechHub     │ │
│  │  (Aba: Pousadas)            │  │  (Aba: AirB)                     │ │
│  │                              │  │                                  │ │
│  └──────────────┬───────────────┘  └──────────────┬───────────────────┘ │
│                 │                                   │                    │
│                 │  ❌ NENHUMA FK CRUZADA ❌          │                    │
│                 │                                   │                    │
│                 └──────────┬────────────────────────┘                    │
│                            │                                             │
│                            ▼                                             │
│                 ┌──────────────────────┐                                 │
│                 │   CONSOLIDATED VIEW  │                                 │
│                 │   (ZCC — Read Only)  │                                 │
│                 │                      │                                 │
│                 │   MRR Total =        │                                 │
│                 │     Pousadas MRR     │                                 │
│                 │   + AirB MRR         │                                 │
│                 │                      │                                 │
│                 │   Relatórios sempre  │                                 │
│                 │   segregados por     │                                 │
│                 │   módulo             │                                 │
│                 └──────────────────────┘                                 │
└──────────────────────────────────────────────────────────────────────────┘
```

### 9.2 Plano de Contas Separado

```
PLANO DE CONTAS — POUSADAS
├── 1.0 Receitas
│   ├── 1.1 Reservas Diretas (PIX)
│   ├── 1.2 Reservas OTA (Booking, Expedia)
│   └── 1.3 Upsells (late checkout, early checkin)
├── 2.0 Custos
│   ├── 2.1 Comissão OTA
│   ├── 2.2 Taxa Gateway
│   ├── 2.3 Fee IA (ZEHLA)
│   └── 2.4 Tributos
└── 3.0 Métricas
    ├── 3.1 Taxa Ocupação
    ├── 3.2 RevPAR
    └── 3.3 ADR

PLANO DE CONTAS — AIRB
├── 1.0 Receitas
│   ├── 1.1 Assinatura PRO
│   ├── 1.2 Assinatura MAX
│   └── 1.3 Setup/Onboarding Fee
├── 2.0 Custos
│   ├── 2.1 Taxa Gateway (Mercado Pago)
│   ├── 2.2 Fee IA (ZEHLA — custo de conversação)
│   ├── 2.3 Custo de Scraping (compute)
│   └── 2.4 Custo de Embeddings (Vector DB)
└── 3.0 Métricas
    ├── 3.1 MRR AirB
    ├── 3.2 Churn Rate
    ├── 3.3 ARPU (R$/anfitrião)
    ├── 3.4 Propriedades Ativas / Tenant
    └── 3.5 Conversas IA / Propriedade / Mês
```

---

## 10. PLANO DE MIGRAÇÃO — SQLITE → POSTGRESQL

### 10.1 Faseamento

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    MIGRAÇÃO SQLITE → POSTGRESQL                         │
│                                                                         │
│  FASE 1: SETUP (Semana 1)                                              │
│  ═══════════════════════                                               │
│  - Provisionar PostgreSQL na Hostinger VPS                             │
│  - Adicionar pgvector extension                                        │
│  - Criar novo schema Prisma para PostgreSQL                            │
│  - Manter schema SQLite existente (dual-write NÃO, dual-schema SIM)    │
│  - Configurar DATABASE_URL_PG como variável separada                   │
│                                                                         │
│  FASE 2: SCHEMA MIGRATION (Semana 2)                                   │
│  ══════════════════════════════                                        │
│  - Executar prisma migrate deploy no PostgreSQL                        │
│  - Migrar dados existentes (Tenant, Property, User, etc.)              │
│  - Validar integridade com scripts de comparação                       │
│  - AirBProperty e AirB* tabelas já nascem no PostgreSQL               │
│                                                                         │
│  FASE 3: VECTOR DB SETUP (Semana 3)                                    │
│  ═══════════════════════════════                                       │
│  - Habilitar pgvector no PostgreSQL                                    │
│  - Criar tabela airb_embeddings                                        │
│  - Configurar índices HNSW para busca aproximada                      │
│  - Implementar pipeline de embeddings (chunking → embed → upsert)     │
│                                                                         │
│  FASE 4: CUTOVER (Semana 4)                                            │
│  ══════════════════════════                                            │
│  - Trocar DATABASE_URL para apontar para PostgreSQL                    │
│  - Manter SQLite como fallback por 48h                                 │
│  - Monitorar erros e performance                                       │
│  - Remover referências ao SQLite após validação                        │
│                                                                         │
│  CRITÉRIO DE SUCESSO:                                                  │
│  - Zero data loss                                                      │
│  - Latência de query < 50ms (P95)                                      │
│  - Vector search < 100ms (P95)                                         │
│  - Zero cross-tenant data leaks (validado por stress test)             │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 11. MATRIZ DE DECISÃO E RASTREABILIDADE

### 11.1 Registro de Decisões Arquiteturais (ADR)

| ADR | Decisão | Alternativas Consideradas | Justificativa | Rastreabilidade |
|-----|---------|---------------------------|---------------|-----------------|
| ADR-001 | pgvector como Vector DB inicial | Pinecone, Qdrant, Weaviate | Menor complexidade operacional; mesmo banco relacional; sem vendor lock-in | PA-07 (Graceful Degradation) |
| ADR-002 | Microserviço de Scraping separado | Inline no Next.js; Serverless functions | Isolamento de falhas; rate limiting independente; não bloqueia o app principal | PA-03 (Gatekeeper First) |
| ADR-003 | AirBSubscription com planType prefixado "airb_" | Reutilizar Subscription com campo module | Zero ambiguidade; queries financeiras nunca se misturam; relatórios segregados | PA-05 (Financial Chinese Wall) |
| ADR-004 | Namespace "{tenant_id}:{property_id}" no Vector DB | Namespace apenas por tenant_id | Granularidade por propriedade evita que dados de um imóvel influenciem respostas de outro | PA-02 (Namespace Isolation) |
| ADR-005 | PIX Gate em 2 camadas (soft + hard) | Apenas System Prompt; Apenas filtro de saída | System Prompt sozinho pode falhar por hallucination; filtro de saída sozinho não previne tentativas | PA-04 (Context-Aware Behavior) |
| ADR-006 | Propriedade Única como entidade nuclear (sem Room) | Adaptar Room com type=property | AirB modela imóveis individuais; herança de Room traz acoplamento e confusão conceitual | PA-01 (Zero Herança Pousada-AirB) |
| ADR-007 | Scraping em 3 camadas (API → Headless → VLM) | Apenas Headless; Apenas API oficial | Airbnb muda DOM frequentemente e restringe API; fallbacks garantem resiliência | PA-07 (Graceful Degradation) |
| ADR-008 | Google Places API para POI discovery | OpenStreetMap + Nominatim; Foursquare | Google tem cobertura superior no Brasil; dados de rating; Distance Matrix confiável | — |

### 11.2 Matriz de Rastreabilidade — Requisitos → Componentes

| Req | Descrição | Componente(s) | Validação |
|-----|-----------|---------------|-----------|
| REQ-01 | Isolamento total AirB vs Pousadas no banco | AirBProperty, AirBSubscription, AirBTransaction (zero FKs cruzadas) | Stress test multi-tenant |
| REQ-02 | Scraping automático via URL Airbnb | Scraping Microservice (3 camadas) | E2E test com URL real |
| REQ-03 | Enriquecimento geolocalizado | Geolocation Service + AirBRegionalKnowledge + airb_embeddings | RAG query test |
| REQ-04 | RAG com tom de anfitrião | System Prompt Base + Agente Concierge + pgvector | A/B test de respostas |
| REQ-05 | PIX Gate (sem PIX em contexto Airbnb) | PIX Gate Decision Matrix + Post-Processing Filter | Unit test + adversarial test |
| REQ-06 | Limite PRO=4 propriedades | Gatekeeper Entitlement + PlanGate UI | Tentar criar 5ª propriedade |
| REQ-07 | Limite MAX=12 propriedades | Gatekeeper Entitlement + PlanGate UI | Tentar criar 13ª propriedade |
| REQ-08 | Financeiro segregado | AirBSubscription + AirBTransaction + Plano de Contas | Relatório consolidado vs segregado |
| REQ-09 | Zero herança de Room/Quarto | AirBProperty (entidade independente) | Code review: zero imports de Room |
| REQ-10 | Graceful degradation se Vector DB down | Fallback para conhecimento base (house rules, amenities) | Simular queda do pgvector |

---

## HISTÓRICO DE REVISÕES

| Versão | Data | Autor | Alterações |
|--------|------|-------|------------|
| 1.0.0 | 2025-03-04 | Arquiteto de Soluções & Engenheiro Chefe de IA | Criação inicial do ADD |

---

**FIM DO DOCUMENTO — ADD-ZELLA-AIRB-v1.0**

*Este documento é a fonte canônica de verdade para a arquitetura do módulo Zélla AirB. Qualquer implementação que diverja das decisões registradas aqui deve ser precedida de uma revisão formal e atualização deste documento via processo ADR.*
