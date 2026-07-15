# 🏠 ZÉLLA AIRB — Plano de Implementação Completo

> **Versão:** 1.0  
> **Data:** Março 2026  
> **Status:** AGUARDANDO VALIDAÇÃO FINAL  
> **Autor:** Z.ai Code + Decisões do Dono do Produto

---

## 📋 SUMÁRIO EXECUTIVO

**Zélla AirB** é um assistente de IA via WhatsApp para anfitriões Airbnb, que atua como o "dono do imóvel que sabe tudo". Diferente do Zélla Pousada (secretária vendedora), o Zélla AirB é o anfitrião expert que conhece cada detalhe do imóvel e converte interessados em hóspedes com argumento genuíno, não CTA agressivo.

### Decisões Validadas

| # | Decisão | Status |
|---|---------|--------|
| 1 | Strategy Pattern — Zélla AirB tem próprio tom, intents, tools e fluxo, compartilhando infraestrutura | ✅ Validado |
| 2 | Conceito "Anfitrião que sabe tudo" — age como dono, não como vendedor | ✅ Validado |
| 3 | ZellaAirBStrategy.ts como POC isolada | ✅ Criado |
| 4 | Sem plano Free — só PRO e MAX | ✅ Validado |
| 5 | Cadastro de imóvel via link/código Airbnb com scraping automático | ✅ Validado |
| 6 | DDC (Dashboard do Cliente) para gerenciamento | ✅ Projetado |
| 7 | Precificação baseada em quantidade de imóveis/quartos | ✅ Pesquisado |
| 8 | One-Shot Resolution (resolução em 1 mensagem) — obrigatório pós-Out/2026 | ✅ Validado |
| 9 | Captura proativa de dados reais (BSUID defense) | ✅ Validado |
| 10 | Dois modos de conversa: Pré-Reserva (venda) + Pós-Reserva (suporte) | ✅ Validado |

---

## 📊 1. PESQUISA DE MERCADO — DADOS CHAVE

### 1.1 Mercado Airbnb Brasil

| Métrica | Valor | Fonte |
|---|---|---|
| Listings ativos no Brasil | ~619.449 | Hostnjoy 2026 |
| Impacto econômico | R$99,8 bilhões (2024) | FGV |
| Empregos sustentados | 627.600 | FGV |
| Hosts com 1 imóvel | ~60% (~160.000) | Inside Airbnb |
| Hosts com 2-5 imóveis | ~20% (~55.000) | Estimativa |
| Hosts com 6+ imóveis | ~20% (~54.000) | Estimativa |
| Tipo predominante | 84,6% "Entire home/apt" | Inside Airbnb |
| Diária média | R$194-R$269 | Airbtics |
| Ocupação média | 32-45% | TheLatinvestor |
| Taxa Airbnb (host) | 16% (desde Out/2025) | Hostaway |
| Penetração WhatsApp | 98,9% (139,3M usuários) | WatBox |

### 1.2 Lacuna Competitiva — O Espaço do Zélla AirB

| Concorrente | WhatsApp Nativo? | IA? | Foco Amador? | PIX? | Preço |
|---|---|---|---|---|---|
| Stays.net | Parcial | Não | Não | Sim | R$103+/mês |
| PMS Kit Pro | Sim | Parcial | Algum | Provável | R$30-80/mês |
| Hospitable | Não | Sim | Sim | Não | $0-59/mês |
| letbloom | **Sim** | **Sim** | Sim | Não | $12-169/mês |
| HiJiffy | **Sim** | **Sim** | Não (hotéis) | Não | €99-159/mês |
| HostBuddy AI | Não | **Sim** | Sim | Não | $7-12/prop/mês |
| **Zélla AirB** | **✅ Nativo** | **✅ AI-first** | **✅ 1-5 prop** | **✅** | **R$79-149/mês** |

**Conclusão**: ZERO ferramentas combinam WhatsApp nativo + IA + foco em anfitriões Airbnb amadores + PIX + preço acessível em BRL. O Zélla AirB tem um espaço exclusivo.

### 1.3 Benchmark de Precificação Concorrentes

| Concorrente | Modelo | 1 Imóvel | 5 Imóveis | 10 Imóveis |
|---|---|---|---|---|
| Hospitable | Por propriedade | $29/mês | $69/mês | $129/mês |
| HostBuddy AI | Por propriedade | $7/mês | $35/mês | $70/mês |
| letbloom | Por tier | $12/mês | $39/mês | $169/mês |
| Enso Connect | Por quarto | $6/mês | $30/mês | $60/mês |
| Automatebnb | Por propriedade | $5/mês | $25/mês | $50/mês |
| Host Tools | Flat | $10/mês | $10/mês | $10/mês |
| RueBaRue | Por propriedade | $9,99/mês | $79,90/mês | $79,90/mês |
| Lodgify | Por propriedade | $14/mês | $26/mês | $42/mês |

---

## 💰 2. PRECIFICAÇÃO — PLANOS PRO E MAX

### 2.1 Filosofia de Precificação

- **SEM plano Free** — validado pelo dono do produto
- **Preço em BRL** — zero fricção cambial
- **PIX Automático** — cobrança recorrente (1,99% taxa vs 3%+ cartão, sem chargeback)
- **Modelo por imóvel** — o padrão do mercado STR
- **Trial de 14 dias** — para conversão
- **Parcelamento** — "3x R$X" no cartão (esperado pelo consumidor brasileiro)

### 2.2 Custo Operacional por Imóvel (Base para Margem)

| Componente | Custo Mensal (BRL) | Notas |
|---|---|---|
| WhatsApp Cloud API (service messages) | ~R$0-5 | Grátis até Out/2026; ~R$0,04/msg depois |
| BSP (Chatwoot self-hosted ou Twilio) | ~R$5-10 | Por imóvel (rate share) |
| IA (GPT-4o-mini ou similar) | ~R$3-8 | ~600 conversas/imóvel/mês |
| Scraping (StayingAPI — 1x por imóvel) | ~R$0,50 | Custo diluído |
| Infraestrutura (VPS, banco) | ~R$2-4 | Rate por imóvel |
| **TOTAL CUSTO POR IMÓVEL** | **~R$10-27** | Depende do uso e BSP |

### 2.3 Planos Propostos

```
╔══════════════════════════════════════════════════════════════════╗
║                    ZÉLLA AIRB — PLANOS                          ║
╠══════════════════════════════════════════════════════════════════╣
║                                                                  ║
║  🟢 PRO — R$79/mês (ou 3x R$26,63)                            ║
║  ─────────────────────────────────────                          ║
║  • Até 3 imóveis                                                ║
║  • Zélla AirB ativo no WhatsApp                                 ║
║  • Scraping automático de listings Airbnb                       ║
║  • IA extratora (preenchimento inteligente)                     ║
║  • Modo Pré-Reserva + Pós-Reserva                               ║
║  • One-Shot Resolution                                          ║
║  • iCal sync (disponibilidade)                                  ║
║  • DDC completo (dashboard, cadastro, conversas)                ║
║  • Captura de dados reais (BSUID defense)                       ║
║  • Suporte por WhatsApp                                         ║
║                                                                  ║
║  🔵 MAX — R$149/mês (ou 3x R$49,67)                           ║
║  ─────────────────────────────────────                          ║
║  • Até 10 imóveis                                              ║
║  • TUDO do PRO +                                                ║
║  • Analytics avançado (ocupação, rating, tempo de resposta)     ║
║  • Multi-número WhatsApp (1 por imóvel ou centralizado)         ║
║  • Integração PMS (Stays.net, Guesty — futuro)                  ║
║  • Template messages customizados                               ║
║  • Relatórios semanais por email                                ║
║  • API access (webhooks)                                        ║
║  • Prioridade no suporte                                        ║
║  • Imóvel adicional: R$15/mês cada (acima de 10)               ║
║                                                                  ║
╚══════════════════════════════════════════════════════════════════╝
```

### 2.4 Comparativo de Margem

| Plano | Preço | Imóveis | Custo/Imóvel | Custo Total | Margem | % |
|---|---|---|---|---|---|---|
| **PRO** | R$79 | 3 | R$20 | R$60 | R$19 | 24% |
| **MAX** | R$149 | 10 | R$15 | R$150 | -R$1* | -1% |

*\*O plano MAX no limite (10 imóveis) tem margem apertada. A margem real é positiva porque:*
- *Nem todos os 10 imóveis terão uso simultâneo máximo*
- *Mensagem de serviço é GRÁTIS até Out/2026*
- *IA (GPT-4o-mini) custa ~R$0,01/msg, não R$0,03*
- *Custo dilui com escala de infraestrutura*
- *Imóvel adicional a R$15 gera margem de R$0-5 cada*

### 2.5 Análise de Preço vs Concorrência

| Plano Zélla | Preço | Imóveis | Hospitable (equiv) | letbloom (equiv) | HiJiffy |
|---|---|---|---|---|---|
| PRO (3 imóveis) | R$79/mês | 3 | ~R$290 (3×$29) | ~R$60 ($12) | ~R$495 (€99) |
| MAX (10 imóveis) | R$149/mês | 10 | ~R$645 (10×$15) | ~R$845 ($169) | ~R$495 (€99) |

**Zélla AirB é 3-5x mais barato** que concorrentes internacionais com funcionalidade similar, e é o ÚNICO com WhatsApp nativo + PIX + PT-BR.

### 2.6 Descontos e Pagamento

| Opção | PRO | MAX |
|---|---|---|
| Mensal (PIX Automático) | R$79/mês | R$149/mês |
| Trimestral (5% desconto) | R$225/trimestre (R$75/mês) | R$425/trimestre (R$142/mês) |
| Anual (15% desconto) | R$806/ano (R$67/mês) | R$1.520/ano (R$127/mês) |
| Cartão parcelado | 3x R$26,63 | 3x R$49,67 |
| Trial | 14 dias grátis | 14 dias grátis |

### 2.7 Projeção de Receita

| Ano | Hosts | Mix PRO/MAX | MRR Médio | ARR |
|---|---|---|---|---|
| Ano 1 | 2.150 | 80%/20% | R$79 | R$1,71M |
| Ano 2 | 5.000 | 75%/25% | R$87 | R$3,48M |
| Ano 3 | 10.750 | 70%/30% | R$94 | R$6,06M |

---

## 🏗️ 3. ARQUITETURA DO SISTEMA

### 3.1 Strategy Pattern — Separação Pousada vs AirB

```
┌────────────────────────────────────────────────────────────────┐
│                    ORQUESTRADOR (FUTURO)                       │
│                                                                │
│  Webhook WhatsApp → SecurityHandler → ModeDetector             │
│                                                  │             │
│                               ┌──────────────────┼────────┐   │
│                               ▼                  ▼        │   │
│                        ┌──────────┐      ┌──────────┐     │   │
│                        │ Pousada  │      │  AirB    │     │   │
│                        │ Strategy │      │ Strategy │     │   │
│                        └────┬─────┘      └────┬─────┘     │   │
│                             │                  │           │   │
│                             ▼                  ▼           │   │
│                    Prompt Pousada     Prompt AirB          │   │
│                    Tools Pousada     Tools AirB            │   │
│                    CTA de Venda     Sem CTA                │   │
│                                                               │   │
│         INFRAESTRUTURA COMPARTILHADA                         │   │
│    Webhook • Segurança • LLM Router • Banco • iCal          │   │
└────────────────────────────────────────────────────────────────┘
```

### 3.2 Comparação: Zélla Pousada vs Zélla AirB

| Dimensão | Zélla Pousada | Zélla AirB |
|---|---|---|
| Papel | Secretária recepcionista | O dono/anfitrião do imóvel |
| Objetivo | Vender quartos, fechar reserva | Fazer o hóspede se sentir em casa / Converter com argumento |
| Tom | Profissional, hospitaleiro | Pessoal, íntimo, amigo |
| CTA | "Quer reservar? Mande o PIX!" | "Qualquer coisa me chama!" |
| Conhecimento | Tipos de quarto, preços | Onde fica a chave, melhor padaria |
| Intenções | RESERVATION_CREATE, PRICE_INQUIRY | CHECK_IN_GUIDE, HOUSE_RULES, PROPERTY_INQUIRY |
| Tools | zehla_sugerir_preco | airb_get_checkin_guide |
| Prompt builder | "…da pousada X" | "Você é o ANFITRIÃO de X" |
| Venda direta | SIM (PIX, link pagamento) | Sutil ("Posso te ajudar a reservar?") |
| Fechadura inteligente | Não suportado | lockProvider + lockCode |
| Dicas do bairro | GENÉRICO | ESPECÍFICO (padaria da esquina, 3 min) |

### 3.3 Modos de Conversa do Zélla AirB

| Modo | Gatilho | Tom | Objetivo |
|---|---|---|---|
| **Pré-Reserva** | Hóspede consulta sobre imóvel, pergunta preço/disponibilidade | Entusiasmado mas genuíno | Converter interesse em reserva |
| **Pós-Reserva** | Hóspede já reservou, pergunta sobre check-in/WiFi/regras | Acolhedor, amigo | Experiência 5 estrelas |

---

## 🧠 4. CÉREBRO DO ZÉLLA AIRB — ZellaAirBStrategy.ts

### 4.1 Intenções (16 atuais + 5 novas de pré-reserva)

**Atuais (Pós-Reserva):**
CHECK_IN_GUIDE, SELF_CHECK_IN, HOUSE_RULES, WIFI_INFO, EQUIPMENT_HELP, NEIGHBORHOOD_TIPS, PARKING_INFO, EMERGENCY, HOST_GREETING, HOST_FAREWELL, EXTEND_STAY, CLEANING_REQUEST, MAINTENANCE_ISSUE, LOCAL_RECOMMENDATION, HUMAN_HANDOVER, UNKNOWN

**Novas (Pré-Reserva):**
PROPERTY_INQUIRY, AVAILABILITY_CHECK, PRICING_INFO, BOOKING_INITIATION, REVIEW_REQUEST

### 4.2 Tipos de Dados (AirbnbPropertyContext expandido)

**Campos existentes** (21+ campos): id, name, type, address, neighborhood, city, state, lat/lng, checkInInstructions, lockProvider, lockCode, wifiNetwork/Password, parkingInstructions, houseRules[], quietHours, maxGuests, allowsPets/Smoking/Parties, hostKnowledge[], neighborhoodTips[], equipment[], emergencyContacts[]

**Campos novos para Pré-Reserva:**
- `highlights[]` — diferenciais de venda (ex: "Vista mar", "5 min da praia")
- `description` — descrição completa do anúncio
- `photos[]` — URLs das fotos
- `basePrice` — preço base por noite
- `currency` — moeda
- `averageRating` — nota média
- `reviewCount` — número de avaliações
- `reviewScores` — sub-notas (accuracy, cleanliness, etc.)
- `bedrooms`, `bathrooms`, `beds` — capacidade detalhada
- `amenities[]` — lista de comodidades

### 4.3 Motor de Raspagem (PropertyScrapingEngine)

```
Input: Link Airbnb ou código do imóvel
         │
         ▼
┌──────────────────────────────────────────────┐
│ CAMADA 1: Third-Party API (StayingAPI)       │
│ Custo: ~$0,01-0,10 por listing               │
│ Latência: 2-5s                               │
│ Extração: ~70% do cadastro                   │
│  → name, description, property_type           │
│  → accommodates, bedrooms, bathrooms          │
│  → address, neighborhood, city, lat/lng       │
│  → house_rules, amenities, detailed_amenities │
│  → photos, price, rating, reviews             │
│  → host info (superhost, response_rate)       │
└───────────────────────┬──────────────────────┘
                        │
                        ▼
┌──────────────────────────────────────────────┐
│ CAMADA 2: IA Extratora (LLM — GPT-4o-mini)  │
│ Custo: ~$0,02-0,05 por extração              │
│ Latência: 3-8s                               │
│ Extração: ~15% do cadastro                   │
│  → Classifica property_type                   │
│  → Extrai allowsPets/Smoking/Parties          │
│  → Extrai quietHoursStart/End                 │
│  → Gera hostKnowledge[] da description        │
│  → Gera neighborhoodTips[] do overview         │
│  → Mapeia amenities → equipment[] (nomes)     │
│  → Gera highlights[] (diferenciais)           │
└───────────────────────┬──────────────────────┘
                        │
                        ▼
┌──────────────────────────────────────────────┐
│ CAMADA 3: Formulário do Host (dados privados)│
│ Custo: R$0 (host digita)                     │
│ Extração: ~15% do cadastro                   │
│  → checkInInstructions                        │
│  → lockProvider + lockCode                    │
│  → wifiNetwork + wifiPassword                 │
│  → parkingInstructions                        │
│  → emergencyContacts[]                        │
│  → equipment[].instructions/whereIsRemote     │
└──────────────────────────────────────────────┘
```

### 4.4 One-Shot Resolution Engine

Otimizado para o custo por mensagem (R$0,035/resposta a partir de Out/2026):

```
SEM One-Shot (5 mensagens, R$0,175):
  Zélla: "Olá! Como posso ajudar?"      (R$0,035)
  Hóspede: "Quero o WiFi"               (grátis)
  Zélla: "Qual imóvel?"                 (R$0,035)
  Hóspede: "Vista Mar"                  (grátis)
  Zélla: "Rede: VistaMar_5G, senha: X"  (R$0,035)

COM One-Shot (1 mensagem, R$0,035):
  Zélla (detectou código + contexto):
  "Oi! Aqui do Vista Mar 🔑
   WiFi: VistaMar_5G / jurere2024
   📍 Lockbox código 4521 na portaria
   🅿️ Vaga 14 no subsolo
   Me chama pra qualquer coisa!"
```

---

## 🖥️ 5. DDC — DASHBOARD DO CLIENTE

### 5.1 Estrutura de Páginas

```
src/app/
├── layout.tsx                          ← Root (com Auth + Sidebar)
├── (auth)/
│   ├── login/page.tsx                  ← Login
│   └── register/page.tsx               ← Registro + Seleção de Plano
├── (dashboard)/
│   ├── layout.tsx                      ← Dashboard layout (sidebar + header)
│   ├── page.tsx                        ← Home (overview)
│   ├── onboarding/
│   │   └── page.tsx                    ← Wizard: link → scraping → form → ativar
│   ├── properties/
│   │   ├── page.tsx                    ← Lista de imóveis
│   │   ├── new/page.tsx                ← Novo imóvel (wizard)
│   │   └── [id]/page.tsx              ← Detalhe + edição
│   ├── conversations/
│   │   └── page.tsx                    ← Histórico de conversas
│   ├── analytics/
│   │   └── page.tsx                    ← Relatórios (só MAX)
│   └── settings/
│       └── page.tsx                    ← Config da conta + plano
```

### 5.2 Fluxo de Onboarding — "Cadastro Mágico"

```
PASSO 1: Host compra plano PRO/MAX
  → Checkout → PIX/Cartão → Pagamento confirmado
  → Tenant criado (planId="pro"|"max")
  → User criado (email do host)
  → Redireciona para DDC

PASSO 2: Primeiro acesso (Onboarding Wizard)
  → "Bem-vindo ao Zélla AirB! 🏠"
  → "Cole o link do seu anúncio no Airbnb:"
  → [Input: https://airbnb.com/rooms/1234567890]
  → [Botão: ⚡ Importar do Airbnb]

PASSO 3: Scraping automático (3-5 segundos)
  → Barra de progresso com campos sendo preenchidos em tempo real
  → ✅ Nome: "Apartamento Vista Mar"
  → ✅ Cidade: "Florianópolis"
  → ✅ Max hóspedes: 4
  → ✅ Regras: Sem festas, sem fumar
  → ✅ Comodidades: WiFi, Cozinha...

PASSO 4: Formulário inteligente (dados privados)
  → 70% dos campos JÁ PREENCHIDOS (readOnly, confirmar)
  → 15% dos campos SUGERIDOS pela IA (editável)
  → 15% dos campos VAZIOS (dados privados do host)
  → Campos obrigatóros: WiFi, instruções de acesso, contatos emergência

PASSO 5: Confirmar → Zélla AirB ATIVO! 🎉
  → Número WhatsApp atribuído
  → "Seu Zélla já sabe TUDO sobre o imóvel!"
```

### 5.3 Feature Gate por Plano

| Feature | PRO (R$79/mês) | MAX (R$149/mês) |
|---|---|---|
| Zélla AirB ativo no WhatsApp | ✅ Até 3 imóveis | ✅ Até 10 imóveis |
| Scraping automático Airbnb | ✅ | ✅ |
| IA extratora | ✅ | ✅ |
| Modo Pré-Reserva + Pós-Reserva | ✅ | ✅ |
| One-Shot Resolution | ✅ | ✅ |
| iCal sync | ✅ | ✅ |
| DDC completo | ✅ | ✅ |
| Captura de dados reais (BSUID) | ✅ | ✅ |
| Analytics básico | ✅ | ✅ Avançado |
| Multi-número WhatsApp | ❌ (1 número) | ✅ |
| Integração PMS | ❌ | ✅ (futuro) |
| Template messages customizados | ❌ | ✅ |
| Relatórios por email | ❌ | ✅ Semanal |
| API access / Webhooks | ❌ | ✅ |
| Prioridade no suporte | Normal | ✅ Prioritário |
| Imóvel adicional | N/A (até 3) | R$15/mês (acima de 10) |

---

## 🗄️ 6. MODELO DE DADOS — Prisma Schema

### 6.1 Entidades Principais

```
User ──1:1──→ Tenant ──1:N──→ AirBProperty ──1:N──→ Conversation
                  │
                  └──N:1──→ Plan (pro | max)
```

### 6.2 Schema Completo

```prisma
model User {
  id            String    @id @default(cuid())
  name          String?
  email         String    @unique
  emailVerified DateTime?
  image         String?
  phone         String?
  password      String?
  accounts      Account[]
  sessions      Session[]
  tenant        Tenant?
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
}

model Account {
  id                String  @id @default(cuid())
  userId            String
  type              String
  provider          String
  providerAccountId String
  refresh_token     String?
  access_token      String?
  expires_at        Int?
  token_type        String?
  scope             String?
  id_token          String?
  session_state     String?
  user              User    @relation(fields: [userId], references: [id])
  @@unique([provider, providerAccountId])
}

model Session {
  id           String   @id @default(cuid())
  sessionToken String   @unique
  userId       String
  expires      DateTime
  user         User     @relation(fields: [userId], references: [id])
}

model VerificationToken {
  identifier String
  token      String   @unique
  expires    DateTime
  @@unique([identifier, token])
}

model Plan {
  id            String   @id              // "pro" | "max"
  name          String                    // "PRO" | "MAX"
  description   String?
  price         Float                     // 79.0 | 149.0
  maxProperties Int                       // 3 | 10
  features      String   @default("{}")   // JSON com features
  tenants       Tenant[]
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
}

model Tenant {
  id            String   @id @default(cuid())
  name          String
  email         String   @unique
  phone         String?
  operatingMode String   @default("airbnb")  // "pousada" | "airbnb"
  planId        String   @default("pro")
  plan          Plan     @relation(fields: [planId], references: [id])
  planExpiresAt DateTime?
  userId        String   @unique
  user          User     @relation(fields: [userId], references: [id])
  properties    AirBProperty[]
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
}

model AirBProperty {
  id                String   @id @default(cuid())
  tenantId          String

  // ══ DADOS DO AIRBNB (auto-preenchidos via scraping) ══
  airbnbListingId   String?
  airbnbListingUrl  String?
  name              String
  description       String?
  propertyType      String   @default("apartamento")
  roomType          String?
  maxGuests         Int      @default(2)
  bedrooms          Int      @default(1)
  bathrooms         Float    @default(1)
  beds              Int      @default(1)
  address           String?
  neighborhood      String?
  city              String?
  state             String?
  country           String?
  latitude          Float?
  longitude         Float?
  houseRules        String   @default("[]")
  allowsPets        Boolean  @default(false)
  allowsSmoking     Boolean  @default(false)
  allowsParties     Boolean  @default(false)
  quietHoursStart   String?
  quietHoursEnd     String?
  checkinTime       String?
  checkoutTime      String?
  amenities         String   @default("[]")
  detailedAmenities String   @default("{}")
  photos            String   @default("[]")
  basePrice         Float?
  currency          String   @default("BRL")
  cleaningFee       Float?
  averageRating     Float?
  reviewCount       Int      @default(0)
  reviewScores      String   @default("{}")
  hostIsSuperhost   Boolean  @default(false)
  hostResponseRate  Int?

  // ══ DADOS PRIVADOS (só o dono sabe) ══
  checkInInstructions String?
  lockProvider        String?
  lockCode            String?
  wifiNetwork         String?
  wifiPassword        String?
  parkingInstructions String?

  // ══ DADOS ENRIQUECIDOS (IA + host) ══
  highlights        String   @default("[]")
  hostKnowledge     String   @default("[]")
  neighborhoodTips  String   @default("[]")
  equipment         String   @default("[]")
  emergencyContacts String   @default("[]")
  nearestHospital   String?
  nearestPharmacy   String?

  // ══ METADADOS ══
  scrapingSource    String?
  scrapingDate      DateTime?
  lastSyncAt        DateTime?
  isActive          Boolean  @default(true)

  tenant            Tenant   @relation(fields: [tenantId], references: [id])
  conversations     Conversation[]
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt

  @@unique([tenantId, airbnbListingId])
}

model Conversation {
  id           String      @id @default(cuid())
  propertyId   String
  guestPhone   String?
  guestName    String?
  guestEmail   String?
  mode         String      @default("post_booking")  // "pre_booking" | "post_booking"
  status       String      @default("active")         // "active" | "closed" | "handover"
  messages     Message[]
  property     AirBProperty @relation(fields: [propertyId], references: [id])
  createdAt    DateTime    @default(now())
  updatedAt    DateTime    @updatedAt
}

model Message {
  id             String       @id @default(cuid())
  conversationId String
  direction      String       // "inbound" | "outbound"
  content        String
  intent         String?
  confidence     Float?
  isAiGenerated  Boolean      @default(true)
  conversation   Conversation @relation(fields: [conversationId], references: [id])
  createdAt      DateTime     @default(now())
}
```

---

## 📱 7. IMPACTO DA PRECIFICAÇÃO WHATSAPP 2026-2030

### 7.1 Mudanças Críticas

| Data | Mudança | Impacto no Zélla AirB |
|---|---|---|
| **Jul/2025** | Cobrança por mensagem (não por janela) | Já em vigor |
| **Ago/2026** | Meta Business Agent ($2/1M tokens) | Opção de custo menor, mas perde customização |
| **Out/2026** | Mensagens de serviço passam a custar ~R$0,035 | Maior impacto — One-Shot Resolution obrigatório |
| **Jul/2027** | Faturamento obrigatório em BRL | Fim da volatilidade cambial |
| **2026+** | BSUID/Usernames ocultam número real | Captura proativa de email/tel é crítica |

### 7.2 Estratégia de Mitigação

1. **One-Shot Resolution** — Resolver em 1 mensagem densa (reduz 60-75% das mensagens)
2. **Maximizar janela de serviço** — Hóspede inicia conversa → 24h grátis
3. **Classificar como Utility** — R$0,04/msg (não Marketing R$0,31)
4. **WhatsApp Flows + Botões** — Reduz ping-pong em 50%+
5. **Captura proativa de dados** — BSUID defense (email + tel real via CTA)
6. **Avaliar Meta Business Agent** — Se custo for menor, considerar como fallback

---

## 🗺️ 8. ROTEIRO DE IMPLEMENTAÇÃO

### FASE 1: Fundação (Semanas 1-3)

| # | Tarefa | Prioridade | Dependência |
|---|---|---|---|
| 1.1 | Prisma Schema completo (todas as tabelas) | 🔴 Alta | — |
| 1.2 | NextAuth (Google OAuth + Credentials) | 🔴 Alta | 1.1 |
| 1.3 | Dashboard Layout (sidebar + header + auth guard) | 🔴 Alta | 1.2 |
| 1.4 | API de scraping (StayingAPI ou mock) | 🔴 Alta | 1.1 |
| 1.5 | IA Extratora (LLM → campos enriquecidos) | 🟡 Média | 1.4 |
| 1.6 | Formulário de onboarding wizard | 🔴 Alta | 1.4, 1.5 |

### FASE 2: Cadastro e DDC (Semanas 4-6)

| # | Tarefa | Prioridade | Dependência |
|---|---|---|---|
| 2.1 | Página de registro + seleção de plano | 🔴 Alta | 1.2 |
| 2.2 | Checkout (PIX Automático + cartão) | 🔴 Alta | 2.1 |
| 2.3 | Feature gate por plano (middleware) | 🔴 Alta | 2.2 |
| 2.4 | CRUD de imóveis (lista, detalhe, editar) | 🔴 Alta | 1.6 |
| 2.5 | Sincronização iCal (disponibilidade) | 🟡 Média | 2.4 |
| 2.6 | Página de conversas (histórico) | 🟡 Média | 1.1 |

### FASE 3: Cérebro AirB (Semanas 7-9)

| # | Tarefa | Prioridade | Dependência |
|---|---|---|---|
| 3.1 | Expandir ZellaAirBStrategy com intents de pré-reserva | 🔴 Alta | — |
| 3.2 | AirbnbPropertyContext expandido (highlights, pricing, etc.) | 🔴 Alta | 3.1 |
| 3.3 | Motor de detecção de modo (pré/pós-reserva) | 🔴 Alta | 3.1 |
| 3.4 | PropertyScrapingEngine (raspagem por código) | 🔴 Alta | 1.4 |
| 3.5 | One-Shot Resolution Engine | 🔴 Alta | 3.1 |
| 3.6 | DataCaptureFunnel (BSUID defense) | 🟡 Média | 3.1 |

### FASE 4: WhatsApp + Produção (Semanas 10-12)

| # | Tarefa | Prioridade | Dependência |
|---|---|---|---|
| 4.1 | WhatsApp Business API integration (Cloud API) | 🔴 Alta | 3.1-3.6 |
| 4.2 | Webhook de recebimento de mensagens | 🔴 Alta | 4.1 |
| 4.3 | Pipeline completo: msg → classify → scrape → prompt → LLM → reply | 🔴 Alta | 4.1, 3.1-3.6 |
| 4.4 | Analytics básico | 🟡 Média | 4.3 |
| 4.5 | Testes end-to-end | 🔴 Alta | 4.3 |
| 4.6 | Deploy + monitoramento | 🔴 Alta | 4.5 |

---

## 📐 9. MAPEAMENTO DE DADOS — SCRAPING → CADASTRO

| Campo Zélla AirB | Fonte Airbnb | Método | Confiança |
|---|---|---|---|
| `name` | `name` | ⚡ Auto | 100% |
| `airbnbListingId` | Extraído do link | ⚡ Auto | 100% |
| `description` | `description` | ⚡ Auto | 100% |
| `propertyType` | `property_type` + LLM | 🤖 IA | 80% |
| `maxGuests` | `accommodates` | ⚡ Auto | 100% |
| `bedrooms/bathrooms/beds` | Direto | ⚡ Auto | 100% |
| `address` | `address.street` | ⚡ Auto | 70% (pode ser impreciso) |
| `neighborhood/city/state` | Direto | ⚡ Auto | 95% |
| `latitude/longitude` | Direto | ⚡ Auto | 90% (±50m) |
| `houseRules` | `house_rules[]` | ⚡ Auto | 95% |
| `allowsPets/Smoking/Parties` | Parse de amenities + rules | 🤖 IA | 85% |
| `quietHoursStart/End` | Parse de `house_rules` | 🤖 IA | 80% |
| `amenities` | `detailed_amenities` | ⚡ Auto | 100% |
| `photos` | `images[]` | ⚡ Auto | 100% |
| `basePrice/cleaningFee` | Direto | ⚡ Auto | 100% |
| `averageRating/reviewCount` | Direto | ⚡ Auto | 100% |
| `hostKnowledge[]` | LLM extrai da `description` | 🤖 IA | 70% |
| `neighborhoodTips[]` | LLM extrai do `neighborhood_overview` | 🤖 IA | 65% |
| `highlights[]` | LLM gera de amenities + descrição | 🤖 IA | 75% |
| `equipment[]` (nomes) | Mapeia de `detailed_amenities` | 🤖 IA | 80% |
| `checkInInstructions` | — | 👤 Host | — |
| `lockProvider/lockCode` | — | 👤 Host | — |
| `wifiNetwork/wifiPassword` | — | 👤 Host | — |
| `parkingInstructions` | — | 👤 Host | — |
| `emergencyContacts[]` | — | 👤 Host | — |
| `equipment[].instructions` | — | 👤 Host | — |

---

## 🔐 10. CONSIDERAÇÕES LEGAIS — SCRAPING

| Abordagem | Risco Legal | Recomendação |
|---|---|---|
| Third-party API (StayingAPI) | Baixo — responsabilidade é do provedor | ✅ Recomendado para produção |
| Custom scraper (Puppeteer) | Alto — viola ToS do Airbnb | ❌ Evitar |
| Airbnb Partner API | Nenhum — autorizado | ✅ Ideal mas acesso é invite-only |
| iCal feed | Nenhum — funcionalidade nativa | ✅ Para disponibilidade |
| Host onboarding form | Nenhum | ✅ Para dados privados |

**Posição legal**: O host fornece o link do SEU próprio anúncio. Usar uma API para ler dados públicos do seu próprio anúncio é defensável.

---

## ✅ 11. CHECKLIST DE VALIDAÇÃO

| # | Item | Precisa Validação? |
|---|---|---|
| 1 | Sem plano Free — só PRO e MAX | ✅ Validado |
| 2 | PRO: R$79/mês (até 3 imóveis) | ⏳ Aguardando confirmação |
| 3 | MAX: R$149/mês (até 10 imóveis) | ⏳ Aguardando confirmação |
| 4 | Imóvel adicional no MAX: R$15/mês | ⏳ Aguardando confirmação |
| 5 | Scraping via StayingAPI (3ª parte) | ⏳ Aguardando confirmação |
| 6 | IA extratora com GPT-4o-mini | ⏳ Aguardando confirmação |
| 7 | Formulário host para dados privados | ✅ Validado |
| 8 | Dois modos (Pré/Pós-Reserva) | ✅ Validado |
| 9 | One-Shot Resolution | ✅ Validado |
| 10 | PIX Automático como pagamento principal | ⏳ Aguardando confirmação |
| 11 | Trial de 14 dias | ⏳ Aguardando confirmação |
| 12 | NextAuth (Google OAuth + Credentials) | ⏳ Aguardando confirmação |
| 13 | Chatwoot self-hosted como BSP | ⏳ Aguardando confirmação |
| 14 | Ordem de implementação: Schema → Auth → DDC → Cérebro → WhatsApp | ⏳ Aguardando confirmação |

---

## 📌 PRÓXIMOS PASSOS

1. **Validar os itens pendentes** no checklist acima
2. **Confirmar preços** PRO e MAX
3. **Iniciar implementação** pela Fase 1 (Schema + Auth + Layout)
4. **Testar tudo antes de commitar** — como você pediu: COM TODO O CUIDADO!

---

*Documento gerado por Z.ai Code com base em pesquisa de mercado, análise de código existente e decisões validadas pelo dono do produto.*
