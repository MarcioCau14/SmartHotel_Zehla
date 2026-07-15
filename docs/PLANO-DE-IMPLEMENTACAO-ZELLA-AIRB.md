# 🏠 Plano de Implementação — Zélla AirB

> **Versão:** 1.0  
> **Data:** 15 de Julho de 2026  
> **Status:** ✅ Validado — Aguardando Codificação  
> **Produto:** Zélla AirB — Zelador Digital para Anfitriões Airbnb  
> **Repo:** Mesmo repositório do Zélla Pousadas (infraestrutura compartilhada, cérebro separado)

---

## Índice

1. [Visão Geral do Produto](#1-visão-geral-do-produto)
2. [Pacotes e Precificação](#2-pacotes-e-precificação)
3. [Arquitetura — Strategy Pattern](#3-arquitetura--strategy-pattern)
4. [Cérebro Zélla AirB — Intenções e Fluxos](#4-cérebro-zélla-airb--intenções-e-fluxos)
5. [Motor de Raspagem de Imóveis (3 Camadas)](#5-motor-de-raspagem-de-imóveis-3-camadas)
6. [Impactos WhatsApp 2026-2030](#6-impactos-whatsapp-2026-2030)
7. [DDC — Dashboard do Cliente](#7-ddc--dashboard-do-cliente)
8. [Magic Onboarding — Cadastro Inteligente](#8-magic-onboarding--cadastro-inteligente)
9. [Schema do Banco de Dados (Prisma)](#9-schema-do-banco-de-dados-prisma)
10. [Feature Gates por Pacote](#10-feature-gates-por-pacote)
11. [Roadmap de Implementação](#11-roadmap-de-implementação)
12. [Riscos e Mitigações](#12-riscos-e-mitigações)

---

## 1. Visão Geral do Produto

### O que é o Zélla AirB?

O **Zélla AirB** é o "Zelador Digital para Anfitriões Airbnb" — um assistente de IA que atende no WhatsApp do anfitrião como se fosse o **próprio dono do imóvel**. Diferente do Zélla Pousadas (que é uma "secretária vendedora" hospitaleira), o Zélla AirB é o **anfitrião expert** que já conhece cada detalhe do imóvel e pode tanto **vender** (pré-reserva) quanto **receber** (pós-reserva).

### Diferencial Central

**Quando o hóspede liga/escreve no WhatsApp do anfitrião, o Zélla AirB JÁ SABE tudo sobre o imóvel** — porque raspou os dados do anúncio Airbnb previamente. Não precisa perguntar "qual imóvel?" — o sistema detecta automaticamente pelo código do imóvel na mensagem/contexto da chamada.

### Dois Modos de Conversa

| Modo | Momento | Objetivo | Tom |
|------|---------|----------|-----|
| **Pré-reserva (Vendas)** | Hóspede interessado ainda não reservou | Argumentar, convencer, fechar reserva | Vendedor persuasivo que conhece cada atrativo |
| **Pós-reserva (Hospedagem)** | Hóspede já reservou | Apoiar, orientar, resolver problemas | Anfitrião atencioso que faz o hóspede se sentir em casa |

### Comparação: Zélla Pousada vs Zélla AirB

| Aspecto | Zélla Pousada | Zélla AirB |
|---------|---------------|------------|
| **Persona** | Secretária hospitaleira | Anfitrião expert do imóvel |
| **Conhece o imóvel?** | Dados cadastrados manualmente | Dados raspados automaticamente do Airbnb |
| **Modo de venda** | Sugerir acomodações | Argumentar com highlights do anúncio |
| **Modo suporte** | Sanar dúvidas gerais | Orientar como dono que mora ali |
| **Tom** | Ultra-atenciosa, hospitaleira | Prático, conhecedor, local |
| **Custo por imóvel** | Médio (pousada inteira) | Baixo (imóvel individual) |
| **Volume** | 1 pousada = 1 tenant | 1 host = até 12 imóveis |

---

## 2. Pacotes e Precificação

### Estrutura Unificada Zélla (Pousadas + AirB)

O Zélla AirB compartilha a **mesma tabela de preços** do Zélla Pousadas. A diferença está no **tipo de operação** escolhido no momento do cadastro.

| Plano | Preço | Imóveis/Pousadas | Imóvel Extra | Canais WhatsApp |
|-------|-------|-------------------|--------------|-----------------|
| **PRO** | R$ 397/mês | Até 4 imóveis | — | 1 número WhatsApp |
| **MAX** | R$ 797/mês | Até 12 imóveis | Acima de 12: entrar em contato | Até 3 números WhatsApp |

> ⚠️ **NÃO existe plano Free para Zélla AirB.** Apenas PRO e MAX.

### Decisão no Cadastro — Pousada ou Airbnb?

No momento da compra/contratação, **antes mesmo de criar login e senha**, o cliente escolhe:

```
┌─────────────────────────────────────────────────┐
│                                                 │
│    🏨 POUSADAS        🏠 IMÓVEIS AIRBNB         │
│                                                 │
│    Zélla Pousada      Zélla AirB                │
│    Secretária         Anfitrião Digital         │
│    hospitaleira       que conhece o imóvel      │
│                                                 │
└─────────────────────────────────────────────────┘
```

Essa escolha define:
- Qual **Strategy** será usada no cérebro da IA
- Qual **fluxo de onboarding** será apresentado no DDC
- Qual **tipo de cadastro de propriedade** será exigido
- Qual **conjunto de features** será desbloqueado

### O que cada pacote inclui (Zélla AirB)

#### PRO — R$ 397/mês (Até 4 imóveis)

- ✅ Atendimento WhatsApp 24/7 com IA (modo pré-reserva + pós-reserva)
- ✅ Raspagem automática de dados do anúncio Airbnb (3 camadas)
- ✅ Detecção automática de imóvel por código/contexto
- ✅ Painel DDC com dashboard, conversas e propriedades
- ✅ Magic Onboarding (colar link → pré-preenchimento automático)
- ✅ Até 4 imóveis cadastrados
- ✅ 1 número WhatsApp conectado
- ✅ Histórico de conversas por imóvel
- ✅ Respostas no padrão One-Shot Resolution (minimiza custo WhatsApp)
- ❌ Analytics avançado (apenas MAX)
- ❌ Multi-número WhatsApp (apenas MAX)
- ❌ API pública para integração (apenas MAX)
- ❌ Suporte prioritário (apenas MAX)

#### MAX — R$ 797/mês (Até 12 imóveis)

- ✅ Tudo do PRO, mais:
- ✅ Até 12 imóveis cadastrados
- ✅ Até 3 números WhatsApp conectados
- ✅ Analytics avançado (taxa de conversão pré→reserva, tempo médio de resposta, satisfação)
- ✅ Relatórios semanais por e-mail
- ✅ API pública para integração com PMS/CRMs
- ✅ Suporte prioritário (SLA 4h)
- ✅ A/B testing de mensagens de vendas
- ✅ Exportação de dados de conversas
- ✅ Webhooks customizados
- ✅ Acima de 12 imóveis: plano Enterprise sob consulta

---

## 3. Arquitetura — Strategy Pattern

### Princípio Fundamental

```
┌─────────────────────────────────────────────────────┐
│              ORQUESTRADOR (Brain Router)             │
│                                                     │
│   Webhook → Security → Tenant Lookup → Strategy     │
│                                                     │
│   if (tenant.mode === "pousada")                    │
│     → ZellaPousadaStrategy                          │
│   if (tenant.mode === "airbnb")                     │
│     → ZellaAirBStrategy                             │
│                                                     │
│   Infra COMPARTILHADA:                              │
│   ✓ Webhook handler                                 │
│   ✓ Segurança / Rate limit                          │
│   ✓ LLM Router (GPT-4o / Claude)                   │
│   ✓ Banco de dados (Prisma)                         │
│   ✓ WhatsApp API client                             │
│   ✓ Plan / Feature gates                            │
│   ✓ DDC (Dashboard)                                 │
└─────────────────────────────────────────────────────┘
```

### Arquivos Envolvidos

| Arquivo | Responsabilidade | Status |
|---------|-----------------|--------|
| `src/lib/strategies/ZellaPousadaStrategy.ts` | Cérebro Pousada (existente) | ✅ Já existe |
| `src/lib/strategies/ZellaAirBStrategy.ts` | Cérebro Airbnb (PoC) | 🔄 PoC validada |
| `src/lib/strategies/types.ts` | Interface IZellaStrategy | 🆕 Criar |
| `src/lib/orchestrator.ts` | Router de strategies | 🆕 Criar |
| `src/lib/scraping/PropertyScrapingEngine.ts` | Motor de raspagem | 🆕 Criar |

### Interface IZellaStrategy (Contrato Comum)

```typescript
interface IZellaStrategy {
  mode: 'pousada' | 'airbnb';
  
  // Classifica a intenção da mensagem do hóspede
  classifyIntent(message: string, context: ConversationContext): Promise<Intent>;
  
  // Gera a resposta usando LLM + tools
  generateResponse(intent: Intent, context: ConversationContext): Promise<OneShotResponse>;
  
  // Retorna o system prompt adequado
  getSystemPrompt(tenant: Tenant, property?: Property): string;
  
  // Lista de tools disponíveis para esta strategy
  getAvailableTools(tenant: Tenant): Tool[];
  
  // Detecta modo de conversa (pré/pós reserva)
  detectConversationMode(context: ConversationContext): 'pre_booking' | 'post_booking';
}
```

---

## 4. Cérebro Zélla AirB — Intenções e Fluxos

### Intenções do Zélla AirB (21 intents)

#### Intenções de Vendas (Pré-Reserva) — 5 novas

| # | Intent | Descrição | Exemplo de Gatilho |
|---|--------|-----------|-------------------|
| 1 | `PROPERTY_INQUIRY` | Interesse geral no imóvel | "Vi seu apartamento, me conta mais" |
| 2 | `AVAILABILITY_CHECK` | Consulta de disponibilidade | "Tem vaga em janeiro?" |
| 3 | `PRICING_INFO` | Pergunta sobre preço | "Qual o valor da diária?" |
| 4 | `BOOKING_INITIATION` | Quer reservar | "Quero fechar, como faço?" |
| 5 | `REVIEW_REQUEST` | Quer ver avaliações | "O que os hóspedes falam?" |

#### Intenções de Hospedagem (Pós-Reserva) — 16 existentes (adaptadas)

| # | Intent | Descrição |
|---|--------|-----------|
| 6 | `CHECK_IN` | Instruções de chegada, chave, lockbox |
| 7 | `CHECK_OUT` | Horário, procedimentos de saída |
| 8 | `HOUSE_RULES` | Regras da casa (silêncio, fumar, pets) |
| 9 | `AMENITY_INFO` | WiFi, ar-condicionado, piscina, cozinha |
| 10 | `DIRECTIONS` | Como chegar, endereço, estacionamento |
| 11 | `LOCAL_TIPS` | Restaurantes, praias, mercados próximos |
| 12 | `MAINTENANCE` | Problemas: vazamento, luz, internet |
| 13 | `EMERGENCY` | Situação urgente |
| 14 | `EXTEND_STAY` | Quero ficar mais dias |
| 15 | `EARLY_CHECKIN` | Posso chegar mais cedo? |
| 16 | `LATE_CHECKOUT` | Posso sair mais tarde? |
| 17 | `EXTRA_GUEST` | Quero trazer mais alguém |
| 18 | `EXTRA_AMENITY` | Preciso de toalha extra, berço etc. |
| 19 | `NOISE_COMPLAINT` | Vizinhos barulhentos |
| 20 | `WIFI_HELP` | Internet não funciona |
| 21 | `GENERAL_QUESTION` | Qualquer outra dúvida |

### Detecção de Modo de Conversa

```typescript
function detectConversationMode(context: ConversationContext): 'pre_booking' | 'post_booking' {
  // 1. Verificar se o contato está na lista de hóspedes confirmados
  if (context.guest?.reservationStatus === 'confirmed') return 'post_booking';
  
  // 2. Verificar menções a reserva/booking no histórico
  if (context.messageHistory?.some(m => /reserv|book|confirmado|check-in/i.test(m.content))) {
    return 'post_booking';
  }
  
  // 3. Default: pré-reserva (vendas)
  return 'pre_booking';
}
```

### System Prompt — Modo Pré-Reserva (Vendas)

```
Você é o anfitrião do {propertyName}. Sabe cada detalhe — a vista da varanda,
o cafezinho da padaria na esquina, o porquê desse bairro ser perfeito.

UM HÓSPEDE INTERESSADO ESTÁ PERGUNTANDO SOBRE O IMÓVEL. Seu objetivo é 
CONVENCER com argumentos reais, nunca genéricos.

DADOS DO IMÓVEL QUE VOCÊ JÁ CONHECE:
- Nome: {name}
- Tipo: {propertyType}
- Capacidade: {accommodates} hóspedes, {bedrooms} quartos, {beds} camas
- Avaliação: {rating}⭐ ({reviewCount} avaliações)
- Destaques: {highlights}
- Preço base: {basePrice}/noite
- Fotos disponíveis: {photoCount}

REGRAS DE VENDA:
1. Use os HIGHLIGHTS como munição — cite especificidades, nunca "é muito bom"
2. Mencione a avaliação e número de reviews como prova social
3. Se perguntarem preço, cite o valor base e incentive a reserva pelo app
4. Se perguntarem disponibilidade, oriente a verificar no Airbnb
5. NUNCA invente informação — se não sabe, diga que vai verificar com o anfitrião
6. Uma única mensagem densa (One-Shot Resolution) — não faça 3 mensagens

TOM: Prático, confiante, como um amigo que adora o lugar.
```

### System Prompt — Modo Pós-Reserva (Hospedagem)

```
Você é o anfitrião do {propertyName}. O hóspede JÁ RESERVOU e precisa de 
suporte. Você conhece cada detalhe — onde fica a chave, como funciona o ar,
qual a melhor padaria da rua.

INFORMAÇÕES DO IMÓVEL:
- Nome: {name}
- WiFi: {wifiName} / Senha: {wifiPassword}
- Instruções de chegada: {checkInInstructions}
- Lockbox/Cofre: {lockboxCode}
- Regras: {houseRules}
- Contato emergência: {emergencyContact}
- Dicas locais: {localTips}

REGRAS DE SUPORTE:
1. Resolva na PRIMEIRA mensagem — One-Shot Resolution
2. Se não tiver a informação, diga que vai encaminhar ao anfitrião humano
3. Nunca invente código de lockbox ou senha WiFi
4. Para emergências, forneça o contato de emergência imediatamente
5. Seja prático e caloroso — o hóspede precisa de solução, não de enrolação

TOM: Atencioso, prático, como um bom anfitrião que se importa.
```

---

## 5. Motor de Raspagem de Imóveis (3 Camadas)

### Visão Geral

```
┌──────────────────────────────────────────────────────────────┐
│                   PROPERTY SCRAPING ENGINE                    │
│                                                              │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐ │
│  │  CAMADA 1   │  │  CAMADA 2   │  │     CAMADA 3        │ │
│  │  API/Scraper│  │  AI Extract │  │  Dados Privados     │ │
│  │  (Público)  │  │  (LLM)      │  │  (Manual Host)      │ │
│  │             │  │             │  │                     │ │
│  │ ~70% campos │  │ ~15% campos │  │ ~15% campos        │ │
│  │ Automático  │  │ Enriquecido  │  │ Sensível/Exclusivo  │ │
│  └─────────────┘  └─────────────┘  └─────────────────────┘ │
│                                                              │
│  Fontes: StayingAPI,  LLM extrai     Host preenche:        │
│  AirROI, Apify,     highlights,      WiFi, lockbox,        │
│  BrightData         resumo           regras extras,         │
│  ~$0.01-0.10/req    ~$0.02-0.05/req  contatos emergência   │
└──────────────────────────────────────────────────────────────┘
```

### Camada 1 — API/Scraper de Dados Públicos (~70% dos campos)

**Fontes priorizadas:**

| Provedor | Custo/req | Qualidade | Rate Limit | Recomendação |
|----------|-----------|-----------|------------|--------------|
| StayingAPI | ~$0.01 | ⭐⭐⭐⭐ | 100/min | 🥇 Primário |
| AirROI | ~$0.05 | ⭐⭐⭐⭐⭐ | 50/min | 🥈 Backup/Premium |
| Apify Airbnb Scraper | ~$0.10 | ⭐⭐⭐ | 30/min | 🥉 Fallback |
| BrightData | ~$0.08 | ⭐⭐⭐⭐ | Custom | Para volume alto |

**Campos obtidos automaticamente:**

```typescript
interface ScrapedPublicData {
  // Identificação
  propertyId: string;          // Airbnb listing ID
  listingUrl: string;          // URL completa
  name: string;                // Título do anúncio
  description: string;         // Descrição completa
  
  // Capacidade
  propertyType: string;        // entire_home, private_room, etc.
  accommodates: number;        // Máx. hóspedes
  bedrooms: number;            // Quartos
  beds: number;                // Camas
  bathrooms: number;           // Banheiros
  
  // Localização
  latitude: number;
  longitude: number;
  neighborhood: string;        // Bairro
  city: string;                // Cidade
  state: string;               // Estado
  country: string;             // País
  
  // Avaliação
  rating: number;              // Nota geral (4.87)
  reviewCount: number;         // Número de avaliações
  reviewScores: {              // Scores por categoria
    accuracy: number;
    cleanliness: number;
    checkin: number;
    communication: number;
    location: number;
    value: number;
  };
  
  // Preço
  basePrice: number;           // Preço/noite base
  currency: string;            // BRL
  
  // Amenidades
  amenities: string[];         // ["WiFi", "Air conditioning", "Pool"...]
  
  // Mídia
  photos: { url: string; caption?: string }[];
  
  // Regras
  houseRules: string;          // Texto das regras
  checkInTime: string;         // "15:00"
  checkOutTime: string;        // "11:00"
  
  // Host
  hostName: string;
  hostSince: string;
  hostResponseRate: number;
  hostResponseTime: string;
  hostIsSuperhost: boolean;
}
```

### Camada 2 — AI Extractor / Enriquecimento (~15% dos campos)

Após obter os dados da Camada 1, um LLM processa e enriquece:

```typescript
interface AIEnrichedData {
  // Resumo executivo (para contexto do LLM)
  summary: string;              // 2-3 frases descrevendo o imóvel
  
  // Highlights extraídos da descrição + amenities + reviews
  highlights: string[];         // ["Vista mar panorâmica", "Piscina aquecida", ...]
  
  // Classificação de público-alvo
  targetAudience: string[];     // ["famílias", "casais", "trabalho remoto"]
  
  // Pontos fortes para argumentação de venda
  sellingPoints: string[];      // Extraídos de reviews positivos
  
  // Dicas locais extraídas de reviews
  localTipsFromReviews: string[]; // "Padaria do Zé a 2 quadras"
  
  // Sentimento geral das reviews
  reviewSentiment: 'excellent' | 'good' | 'average';
  
  // Palavras-chave para SEO/intenção
  keywords: string[];           // ["praia", "vista", "piscina", "família"]
}
```

**Custo estimado:** ~$0.02-0.05 por imóvel (uma única chamada GPT-4o-mini)

### Camada 3 — Dados Privados do Host (~15% dos campos)

Dados que SÓ o anfitrião conhece e preenche manualmente (ou via Magic Onboarding):

```typescript
interface HostPrivateData {
  // Acesso
  wifiName: string;
  wifiPassword: string;
  lockboxCode: string;
  lockboxLocation: string;      // "No portão azul à direita"
  accessInstructions: string;   // Instruções detalhadas de chegada
  
  // Contatos
  emergencyContact: string;
  maintenanceContact: string;   // Zelador / Faxineira
  
  // Informações sensíveis
  alarmCode: string;
  gateCode: string;
  parkingSpot: string;          // "Vaga 12 no subsolo"
  
  // Dicas exclusivas do anfitrião
  personalLocalTips: string;    // "Não perca o pôr do sol no mirante"
  favoriteRestaurants: string[];
  supermarketLocation: string;
  
  // Regras adicionais não no anúncio
  additionalRules: string;      // "Por favor não fume na varanda"
  quietHoursStart: string;      // "22:00"
  quietHoursEnd: string;        // "08:00"
  
  // Check-in/out customizado
  customCheckInInstructions: string;
  customCheckOutInstructions: string;
  
  // Notas internas (não visíveis ao hóspede)
  internalNotes: string;        // "Hóspede do apt 201 reclama de barulho"
}
```

### Fluxo Completo de Raspagem

```
Host cola link do Airbnb
        │
        ▼
┌─────────────────────┐
│ Extrair property_id │  ← Regex na URL: /rooms/(\d+)
└─────────┬───────────┘
          │
          ▼
┌─────────────────────┐
│ Verificar cache     │  ← Já raspamos esse imóvel?
│ (Redis / SQLite)    │
└─────────┬───────────┘
          │
     Cache MISS?
          │
          ▼
┌─────────────────────┐
│ CAMADA 1: API Call  │  ← StayingAPI / AirROI
│ Dados públicos      │     ~$0.01-0.10
└─────────┬───────────┘
          │
          ▼
┌─────────────────────┐
│ CAMADA 2: AI Extract│  ← GPT-4o-mini
│ Highlights, resumo  │     ~$0.02-0.05
└─────────┬───────────┘
          │
          ▼
┌─────────────────────┐
│ Salvar no banco     │  ← Prisma: AirBProperty
│ + Cache (7 dias)    │
└─────────┬───────────┘
          │
          ▼
┌─────────────────────┐
│ CAMADA 3: Host fill │  ← Formulário no DDC
│ Dados privados      │     Pode ser parcial
└─────────┬───────────┘
          │
          ▼
┌─────────────────────┐
│ Pronto para         │
│ atendimento IA!     │
└─────────────────────┘
```

---

## 6. Impactos WhatsApp 2026-2030

### Resumo do Relatório Anexado

O relatório **"Relatório Avançado sobre o Futuro da Mensageria Corporativa (2026-2030)"** define mudanças críticas que impactam diretamente o Zélla AirB.

### Mudanças Principais

| Data | Mudança | Impacto no Zélla AirB |
|------|---------|----------------------|
| **Ago 2026** | Meta Business Agent (MBA) | Novo tipo de conta para agentes de IA |
| **Out 2026** | Fim das mensagens de serviço gratuitas | R$0,035 por cada mensagem de serviço |
| **2027** | BSUID / Usernames | Números de telefone ocultos, identificação por username |
| **2027** | Phone Number Request CTA | Botão para solicitar número do cliente (data capture) |
| **2028** | Precificação por tipo de conteúdo | Mensagens com mídia podem custar mais |

### Estratégia Zélla AirB: One-Shot Resolution

**Problema:** Com R$0,035 por mensagem, cada troca de 5 mensagens custa R$0,175 por conversa. Para 100 conversas/dia = R$525/mês apenas em mensagens.

**Solução:** Responder TUDO em uma única mensagem densa e completa.

```
❌ ANTES (5 mensagens, R$0,175):
  Zélla: "Olá! Como posso ajudar?"
  Guest: "Qual o WiFi?"
  Zélla: "É 'CasaNova_5G', senha 'bemvindo2026'"
  Guest: "E a chave?"
  Zélla: "O lockbox fica no portão, código 4829"

✅ DEPOIS (1 mensagem, R$0,035):
  Zélla: "Olá! Bem-vindo ao Apt Vista Mar! 🏠
  
  Aqui estão as informações que você vai precisar:
  📶 WiFi: CasaNova_5G / Senha: bemvindo2026
  🔑 Lockbox: Portão azul à direita, código 4829
  📍 Endereço: Rua das Palmeiras, 123
  ⏰ Check-in: 15h | Check-out: 11h
  
  Precisa de mais alguma coisa?"
```

**Economia estimada:** 70-80% de redução no custo de mensagens.

### Preparação para BSUID (2027)

- Adaptar cadastro de imóveis para usar **username** em vez de número de telefone
- Implementar **Phone Number Request CTA** para capturar dados do hóspede
- Manter compatibilidade com número de telefone durante transição

### Preparação para Meta Business Agent (Ago 2026)

- Migrar de WhatsApp Business API para **Meta Business Agent** quando disponível
- MBA oferece vantagens: melhor integração com IA, possíveis custos reduzidos
- Planejar migração para Q3 2026

### Custo Operacional Estimado por Imóvel

| Componente | Custo/mês | Observação |
|------------|-----------|------------|
| Mensagens WhatsApp | ~R$ 50-80 | 30 conversas/mês, One-Shot Resolution |
| LLM (GPT-4o-mini) | ~R$ 15-25 | ~500 chamadas/mês |
| Raspagem (inicial) | ~R$ 2-5 | Uma vez por imóvel |
| Raspagem (atualização) | ~R$ 5-10 | Mensal, dados atualizados |
| **Total por imóvel** | **~R$ 72-120** | |

> Com PRO a R$397 para 4 imóveis, margem de ~R$277-425/mês por cliente.  
> Com MAX a R$797 para 12 imóveis, margem de ~R$357-961/mês por cliente.

---

## 7. DDC — Dashboard do Cliente

### Visão Geral

O DDC (Dashboard do Cliente) é o painel de controle onde o anfitrião gerencia seus imóveis, conversas e configurações. **Atualmente não existe** — precisa ser construído do zero.

### Tela Inicial — Escolha de Operação

**Esta é a PRIMEIRA tela que o cliente vê**, antes mesmo de criar login:

```
┌──────────────────────────────────────────────────────────────────────┐
│                                                                      │
│                     🏠 ZÉLLA — Zelador Digital                       │
│                                                                      │
│            Como você quer usar o Zélla?                              │
│                                                                      │
│   ┌────────────────────────┐   ┌────────────────────────┐           │
│   │                        │   │                        │           │
│   │    🏨 POUSADAS         │   │   🏠 IMÓVEIS AIRBNB    │           │
│   │                        │   │                        │           │
│   │  Para hotéis, pousadas,│   │  Para anfitriões que   │           │
│   │  chalés, resorts e     │   │  gerenciam imóveis no  │           │
│   │  hospedagens tradicionais│  │  Airbnb               │           │
│   │                        │   │                        │           │
│   │  • Secretaria virtual  │   │  • Anfitrião digital   │           │
│   │  • Foco em vendas      │   │  • Vendas + suporte    │           │
│   │  • Atendimento hóspede │   │  • Raspagem automática │           │
│   │                        │   │                        │           │
│   └────────────────────────┘   └────────────────────────┘           │
│                                                                      │
│              Depois você não poderá mudar esta escolha.              │
│                                                                      │
└──────────────────────────────────────────────────────────────────────┘
```

> ⚠️ **Após escolher, o cliente não pode mudar** de Pousada para AirB ou vice-versa. Cada tenant tem um `mode` fixo.

### Estrutura de Páginas do DDC

```
src/app/(dashboard)/
├── layout.tsx                    # Layout com sidebar
├── page.tsx                      # Redirect → /dashboard
├── onboarding/
│   └── page.tsx                  # Wizard de onboarding (escolha + cadastro)
├── dashboard/
│   └── page.tsx                  # Home do dashboard (visão geral)
├── properties/
│   ├── page.tsx                  # Lista de imóveis/pousadas
│   ├── new/
│   │   └── page.tsx              # Magic Onboarding (colar link Airbnb)
│   └── [id]/
│       └── page.tsx              # Detalhe/edição do imóvel
├── conversations/
│   ├── page.tsx                  # Lista de conversas
│   └── [id]/
│       └── page.tsx              # Detalhe da conversa
├── analytics/
│   └── page.tsx                  # Analytics (MAX only)
├── settings/
│   ├── page.tsx                  # Configurações gerais
│   ├── whatsapp/
│   │   └── page.tsx              # Configurar número WhatsApp
│   └── billing/
│       └── page.tsx              # Plano e faturamento
└── api/
    ├── properties/
    │   ├── route.ts              # CRUD propriedades
    │   └── [id]/
    │       └── route.ts          # Detalhe propriedade
    ├── conversations/
    │   └── route.ts              # Listar conversas
    ├── scraping/
    │   └── route.ts              # Endpoint de raspagem
    └── onboarding/
        └── route.ts              # Completar onboarding
```

### Sidebar do DDC

```
┌─────────────────────────┐
│ 🏠 Zélla AirB           │
│                         │
│ 📊 Dashboard            │
│ 🏠 Imóveis              │
│ 💬 Conversas            │
│ 📈 Analytics (MAX)      │
│ ⚙️  Configurações       │
│                         │
│ ─────────────────────── │
│ Plano PRO • 3/4 imóveis │
│ [Upgrade MAX]           │
└─────────────────────────┘
```

### Componentes do DDC (usar shadcn/ui existente)

- `Card` — Cards de métricas e propriedades
- `Button` — Ações principais
- `Dialog` — Modais de confirmação
- `Form` — Formulários de cadastro
- `Table` — Listas de conversas/propriedades
- `Tabs` — Alternância entre modos
- `Badge` — Status de conversas
- `Avatar` — Fotos de perfil
- `Sheet` — Sidebar mobile
- `Skeleton` — Loading states
- `Toast` — Notificações
- `Tooltip` — Ajuda contextual

---

## 8. Magic Onboarding — Cadastro Inteligente

### O Problema

Cadastro de imóvel é chato e longo. Anfitriões Airbnb desistem se tiver que preencher 30+ campos manualmente.

### A Solução

**O anfitrião cola o link do Airbnb e o sistema faz tudo automaticamente.**

### Fluxo do Magic Onboarding

```
┌──────────────────────────────────────────────────────────────┐
│                                                              │
│   🪄 Cadastro de Imóvel — Zélla AirB                        │
│                                                              │
│   Cole o link do seu anúncio no Airbnb:                     │
│                                                              │
│   ┌─────────────────────────────────────────────────────┐   │
│   │ https://www.airbnb.com/rooms/18584298               │   │
│   └─────────────────────────────────────────────────────┘   │
│                                                              │
│                    [✨ Rastrear Imóvel]                       │
│                                                              │
└──────────────────────────────────────────────────────────────┘

                          │
                          ▼ (raspagem em ~3-5 segundos)

┌──────────────────────────────────────────────────────────────┐
│                                                              │
│   ✅ Imóvel encontrado!                                      │
│                                                              │
│   📋 Dados pré-preenchidos automaticamente (28 campos):     │
│                                                              │
│   Nome: [Oceanfront Black Otter Cove w/hot tub]             │
│   Tipo: [Casa inteira ▼]                                    │
│   Capacidade: [8] hóspedes                                   │
│   Quartos: [4]  Camas: [5]  Banheiros: [3]                 │
│   Bairro: [Florianópolis - Lagoa da Conceição]              │
│   Avaliação: [4.95] ⭐ (237 reviews)                        │
│   Preço base: [R$ 450]/noite                                 │
│   Amenidades: [WiFi, Piscina, Estacionamento, ...]          │
│   Destaques (AI): [Vista mar, Hidro, Churrasqueira]         │
│                                                              │
│   🔒 Dados que só você conhece (preencha depois):           │
│                                                              │
│   WiFi: [___________]  Senha: [___________]                 │
│   Lockbox: [_________]  Local: [___________]                │
│   Regras extras: [_________________________]                │
│                                                              │
│   [Salvar e Continuar]  [Preencher depois]                  │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

### Taxa de Preenchimento Automático

| Categoria | Campos | Auto-preenchidos | Manual |
|-----------|--------|-----------------|--------|
| Identificação | 5 | 5 (100%) | 0 |
| Capacidade | 5 | 5 (100%) | 0 |
| Localização | 6 | 6 (100%) | 0 |
| Avaliação | 8 | 8 (100%) | 0 |
| Preço | 2 | 2 (100%) | 0 |
| Amenidades | 1 | 1 (100%) | 0 |
| Fotos | 1 | 1 (100%) | 0 |
| Regras | 3 | 3 (100%) | 0 |
| **AI Enriquecimento** | 5 | 5 (100%) | 0 |
| **Dados Privados** | 10 | 0 (0%) | 10 |
| **TOTAL** | **46** | **36 (~78%)** | **10 (~22%)** |

> ~78% dos campos são preenchidos automaticamente. Os 10 campos privados são **opcionais no momento do cadastro** — o anfitrião pode preencher depois.

### Validação de Código de Imóvel

```typescript
function extractPropertyCode(input: string): string | null {
  // Padrão 1: URL completa
  const urlMatch = input.match(/airbnb\.(com|com\.br)\/rooms\/(\d+)/);
  if (urlMatch) return urlMatch[2];
  
  // Padrão 2: Apenas o código numérico
  const codeMatch = input.match(/^(\d{5,20})$/);
  if (codeMatch) return codeMatch[1];
  
  // Padrão 3: "Código: 18584298"
  const labelMatch = input.match(/c[oó]digo[:\s]+(\d{5,20})/i);
  if (labelMatch) return labelMatch[1];
  
  return null;
}
```

---

## 9. Schema do Banco de Dados (Prisma)

### Diagrama de Entidades

```
User ──< Account
User ──< Session
User ──> Tenant
Tenant ──> Plan
Tenant ──< AirBProperty
Tenant ──< Conversation
Conversation ──< Message
AirBProperty ──< Conversation
```

### Schema Completo

```prisma
// prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "sqlite"
  url      = env("DATABASE_URL")
}

// ── AUTH (NextAuth.js v4) ───────────────────────────────

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
  user              User    @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([provider, providerAccountId])
}

model Session {
  id           String   @id @default(cuid())
  sessionToken String   @unique
  userId       String
  expires      DateTime
  user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)
}

model User {
  id            String    @id @default(cuid())
  email         String    @unique
  name          String?
  emailVerified DateTime?
  image         String?
  accounts      Account[]
  sessions      Session[]
  tenant        Tenant?
}

// ── TENANT & PLANOS ─────────────────────────────────────

model Tenant {
  id              String   @id @default(cuid())
  name            String                       // Nome do negócio
  mode            String                       // "pousada" | "airbnb"
  planSlug        String                       // "pro" | "max"
  whatsappNumber  String?                      // Número conectado
  isActive        Boolean  @default(true)
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  // Relations
  user         User           @relation(fields: [userId], references: [id])
  userId       String
  plan         Plan           @relation(fields: [planSlug], references: [slug])
  properties   AirBProperty[]
  conversations Conversation[]
}

model Plan {
  id          String @id @default(cuid())
  slug        String @unique                  // "pro" | "max"
  name        String                          // "PRO" | "MAX"
  priceCents  Int                             // 39700 | 79700 (em centavos)
  maxProperties Int                           // 4 | 12
  maxWhatsappNumbers Int @default(1)          // 1 | 3
  hasAnalytics  Boolean @default(false)       // false | true
  hasApi        Boolean @default(false)       // false | true
  hasPrioritySupport Boolean @default(false)  // false | true
  hasAbTesting  Boolean @default(false)       // false | true
  hasCustomWebhooks Boolean @default(false)   // false | true
  hasWeeklyReports  Boolean @default(false)   // false | true
  
  tenants Tenant[]
}

// ── IMÓVEL AIRBNB ───────────────────────────────────────

model AirBProperty {
  id        String   @id @default(cuid())
  tenantId  String
  tenant    Tenant   @relation(fields: [tenantId], references: [id], onDelete: Cascade)
  
  // ── Identificação (Camada 1 - Auto)
  airbnbId        String   @unique               // Código do anúncio Airbnb
  listingUrl      String                          // URL completa
  name            String                          // Título do anúncio
  description     String?                         // Descrição completa
  propertyType    String?                         // entire_home, private_room, etc.
  
  // ── Capacidade (Camada 1 - Auto)
  accommodates    Int?
  bedrooms        Int?
  beds            Int?
  bathrooms       Float?
  
  // ── Localização (Camada 1 - Auto)
  latitude        Float?
  longitude       Float?
  neighborhood    String?
  city            String?
  state           String?
  country         String?
  fullAddress     String?
  
  // ── Avaliação (Camada 1 - Auto)
  rating          Float?
  reviewCount     Int?
  reviewAccuracy  Float?
  reviewCleanliness Float?
  reviewCheckin   Float?
  reviewCommunication Float?
  reviewLocation  Float?
  reviewValue     Float?
  
  // ── Preço (Camada 1 - Auto)
  basePrice       Float?
  currency        String  @default("BRL")
  
  // ── Amenidades (Camada 1 - Auto)
  amenities       String?                         // JSON array string
  
  // ── Mídia (Camada 1 - Auto)
  photos          String?                         // JSON array: [{url, caption}]
  photoCount      Int?                            // Número de fotos
  
  // ── Regras (Camada 1 - Auto)
  houseRules      String?
  checkInTime     String?
  checkOutTime    String?
  
  // ── Host info (Camada 1 - Auto)
  hostName        String?
  hostIsSuperhost Boolean @default(false)
  hostResponseRate Float?
  hostResponseTime String?
  
  // ── AI Enriquecimento (Camada 2 - AI Extract)
  aiSummary       String?                         // Resumo executivo
  highlights      String?                         // JSON array: ["Vista mar", "Piscina"]
  targetAudience  String?                         // JSON array: ["famílias", "casais"]
  sellingPoints   String?                         // JSON array: pontos de venda
  localTipsFromReviews String?                    // JSON array: dicas de reviews
  reviewSentiment String?                         // "excellent" | "good" | "average"
  keywords        String?                         // JSON array: palavras-chave
  
  // ── Dados Privados (Camada 3 - Manual Host)
  wifiName        String?
  wifiPassword    String?
  lockboxCode     String?
  lockboxLocation String?
  accessInstructions String?
  emergencyContact String?
  maintenanceContact String?
  alarmCode       String?
  gateCode        String?
  parkingSpot     String?
  personalLocalTips String?
  favoriteRestaurants String?
  supermarketLocation String?
  additionalRules  String?
  quietHoursStart  String?
  quietHoursEnd    String?
  customCheckInInstructions String?
  customCheckOutInstructions String?
  internalNotes    String?
  
  // ── Metadados
  scrapingStatus  String   @default("pending")    // "pending" | "scraping" | "enriched" | "complete"
  lastScrapedAt   DateTime?
  isActive        Boolean  @default(true)
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
  
  // Relations
  conversations Conversation[]
}

// ── CONVERSAS ───────────────────────────────────────────

model Conversation {
  id          String   @id @default(cuid())
  tenantId    String
  propertyId  String?
  tenant      Tenant       @relation(fields: [tenantId], references: [id], onDelete: Cascade)
  property    AirBProperty? @relation(fields: [propertyId], references: [id], onDelete: SetNull)
  
  guestPhone    String?                        // Telefone do hóspede
  guestName     String?                        // Nome do hóspede (se identificado)
  conversationMode String @default("pre_booking") // "pre_booking" | "post_booking"
  status        String   @default("active")    // "active" | "resolved" | "escalated"
  
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  messages    Message[]
}

model Message {
  id             String   @id @default(cuid())
  conversationId String
  conversation   Conversation @relation(fields: [conversationId], references: [id], onDelete: Cascade)
  
  direction      String                       // "inbound" | "outbound"
  content        String                       // Conteúdo da mensagem
  intent         String?                      // Intent classificado
  isAiGenerated  Boolean  @default(false)     // Gerada por IA?
  tokensUsed     Int?                         // Tokens consumidos
  costCents      Int?                         // Custo em centavos
  
  createdAt      DateTime @default(now())
}
```

### Seed — Planos

```typescript
// prisma/seed.ts
await db.plan.createMany({
  data: [
    {
      slug: 'pro',
      name: 'PRO',
      priceCents: 39700,       // R$ 397,00
      maxProperties: 4,
      maxWhatsappNumbers: 1,
      hasAnalytics: false,
      hasApi: false,
      hasPrioritySupport: false,
      hasAbTesting: false,
      hasCustomWebhooks: false,
      hasWeeklyReports: false,
    },
    {
      slug: 'max',
      name: 'MAX',
      priceCents: 79700,       // R$ 797,00
      maxProperties: 12,
      maxWhatsappNumbers: 3,
      hasAnalytics: true,
      hasApi: true,
      hasPrioritySupport: true,
      hasAbTesting: true,
      hasCustomWebhooks: true,
      hasWeeklyReports: true,
    },
  ],
});
```

---

## 10. Feature Gates por Pacote

### Matriz de Features

| Feature | PRO (R$397) | MAX (R$797) |
|---------|:-----------:|:-----------:|
| Atendimento IA 24/7 | ✅ | ✅ |
| Modo pré-reserva (vendas) | ✅ | ✅ |
| Modo pós-reserva (suporte) | ✅ | ✅ |
| Raspagem automática Airbnb | ✅ | ✅ |
| Detecção automática de imóvel | ✅ | ✅ |
| Magic Onboarding | ✅ | ✅ |
| One-Shot Resolution | ✅ | ✅ |
| Painel DDC | ✅ | ✅ |
| Histórico de conversas | ✅ | ✅ |
| **Imóveis** | **Até 4** | **Até 12** |
| **Números WhatsApp** | **1** | **Até 3** |
| Analytics avançado | ❌ | ✅ |
| Relatórios semanais | ❌ | ✅ |
| API pública | ❌ | ✅ |
| A/B testing mensagens | ❌ | ✅ |
| Webhooks customizados | ❌ | ✅ |
| Exportação de dados | ❌ | ✅ |
| Suporte prioritário (SLA 4h) | ❌ | ✅ |
| Acima do limite de imóveis | ❌ | Enterprise sob consulta |

### Implementação do Feature Gate

```typescript
// src/lib/features.ts

const PLAN_FEATURES = {
  pro: {
    maxProperties: 4,
    maxWhatsappNumbers: 1,
    analytics: false,
    api: false,
    prioritySupport: false,
    abTesting: false,
    customWebhooks: false,
    weeklyReports: false,
  },
  max: {
    maxProperties: 12,
    maxWhatsappNumbers: 3,
    analytics: true,
    api: true,
    prioritySupport: true,
    abTesting: true,
    customWebhooks: true,
    weeklyReports: true,
  },
} as const;

function canUseFeature(tenant: Tenant, feature: keyof typeof PLAN_FEATURES.max): boolean {
  const plan = tenant.planSlug as 'pro' | 'max';
  return PLAN_FEATURES[plan]?.[feature] === true;
}

function canAddProperty(tenant: Tenant, currentCount: number): boolean {
  const plan = tenant.planSlug as 'pro' | 'max';
  return currentCount < PLAN_FEATURES[plan].maxProperties;
}
```

---

## 11. Roadmap de Implementação

### Fase 1 — Fundação (Semana 1-2)

| # | Tarefa | Prioridade | Estimativa |
|---|--------|:----------:|:----------:|
| 1.1 | Schema Prisma completo (User, Tenant, Plan, AirBProperty, Conversation, Message) | 🔴 | 2h |
| 1.2 | Seed dos planos (PRO, MAX) | 🔴 | 0.5h |
| 1.3 | Interface IZellaStrategy + types compartilhados | 🔴 | 2h |
| 1.4 | Orchestrator (router de strategies) | 🔴 | 3h |
| 1.5 | Atualizar ZellaAirBStrategy.ts com 5 intents de pré-reserva | 🔴 | 4h |
| 1.6 | Detecção de modo de conversa (pre_booking / post_booking) | 🔴 | 2h |

### Fase 2 — Motor de Raspagem (Semana 2-3)

| # | Tarefa | Prioridade | Estimativa |
|---|--------|:----------:|:----------:|
| 2.1 | Integração StayingAPI (Camada 1 - primário) | 🔴 | 4h |
| 2.2 | Fallback Apify (Camada 1 - backup) | 🟡 | 3h |
| 2.3 | AI Extractor (Camada 2 - GPT-4o-mini) | 🔴 | 3h |
| 2.4 | Cache de raspagem (SQLite + TTL 7 dias) | 🟡 | 2h |
| 2.5 | API endpoint /api/scraping | 🔴 | 2h |
| 2.6 | Extração de código de imóvel (URL/código/texto) | 🔴 | 1h |

### Fase 3 — DDC Frontend (Semana 3-5)

| # | Tarefa | Prioridade | Estimativa |
|---|--------|:----------:|:----------:|
| 3.1 | Layout do DDC com sidebar (shadcn/ui) | 🔴 | 3h |
| 3.2 | Tela de escolha: Pousadas vs Imóveis Airbnb | 🔴 | 2h |
| 3.3 | Wizard de Onboarding (dados do host + primeiro imóvel) | 🔴 | 4h |
| 3.4 | Magic Onboarding — tela de colar link + preview | 🔴 | 4h |
| 3.5 | Lista de propriedades (CRUD) | 🔴 | 3h |
| 3.6 | Detalhe/edição de propriedade (3 camadas visuais) | 🔴 | 4h |
| 3.7 | Lista de conversas | 🟡 | 3h |
| 3.8 | Detalhe de conversa (thread de mensagens) | 🟡 | 3h |
| 3.9 | Dashboard home (métricas resumidas) | 🟡 | 3h |
| 3.10 | Analytics (MAX only) | 🟢 | 4h |
| 3.11 | Settings (WhatsApp, billing) | 🟡 | 3h |

### Fase 4 — DDC Backend (Semana 4-5)

| # | Tarefa | Prioridade | Estimativa |
|---|--------|:----------:|:----------:|
| 4.1 | API CRUD propriedades (/api/properties) | 🔴 | 3h |
| 4.2 | API conversas (/api/conversations) | 🔴 | 2h |
| 4.3 | API onboarding (/api/onboarding) | 🔴 | 2h |
| 4.4 | Feature gate middleware | 🔴 | 2h |
| 4.5 | Auth (NextAuth.js v4) | 🔴 | 4h |
| 4.6 | Proteção de rotas por tenant | 🔴 | 2h |

### Fase 5 — Integração WhatsApp (Semana 5-6)

| # | Tarefa | Prioridade | Estimativa |
|---|--------|:----------:|:----------:|
| 5.1 | Webhook handler unificado (Pousada + AirB) | 🔴 | 3h |
| 5.2 | Detecção automática de imóvel no contexto da mensagem | 🔴 | 3h |
| 5.3 | One-Shot Resolution no gerador de respostas | 🔴 | 2h |
| 5.4 | Classificação de intent + roteamento | 🔴 | 3h |
| 5.5 | Tracking de custo por mensagem (R$0,035) | 🟡 | 2h |
| 5.6 | Phone Number Request CTA (preparação) | 🟢 | 2h |

### Fase 6 — Testes e Polimento (Semana 6-7)

| # | Tarefa | Prioridade | Estimativa |
|---|--------|:----------:|:----------:|
| 6.1 | Teste E2E do fluxo completo (Magic Onboarding → Atendimento) | 🔴 | 4h |
| 6.2 | Teste de raspagem com imóveis reais | 🔴 | 3h |
| 6.3 | Teste de feature gates (PRO vs MAX) | 🔴 | 2h |
| 6.4 | Teste de conversas (pré e pós reserva) | 🔴 | 3h |
| 6.5 | Responsividade mobile do DDC | 🟡 | 2h |
| 6.6 | Performance e otimização | 🟢 | 3h |

### Estimativa Total: ~6-7 semanas, ~110 horas

---

## 12. Riscos e Mitigações

| Risco | Probabilidade | Impacto | Mitigação |
|-------|:------------:|:-------:|-----------|
| API de raspagem muda/falha | 🟡 Média | 🔴 Alto | 3 provedores (StayingAPI + AirROI + Apify) como fallback |
| Airbnb bloqueia scraping | 🟡 Média | 🔴 Alto | Usar APIs oficiais/proxies; Camada 2 (AI) como backup parcial |
| Custo WhatsApp maior que esperado | 🟡 Média | 🟡 Médio | One-Shot Resolution; Monitorar custo por conversa |
| LLM alucina dados do imóvel | 🔴 Alta | 🔴 Alto | Nunca inventar dados privados; Flag de confiança por campo |
| BSUID quebra identificação por telefone | 🟢 Baixa | 🟡 Médio | Preparar migração para usernames; Manter compatibilidade |
| Anfitrião não preenche dados privados | 🔴 Alta | 🟡 Médio | Lembrete no DDC; Funciona sem dados privados (modo limitado) |
| Concorrência (Hospitable, Guesty) | 🟡 Média | 🟡 Médio | Diferencial: raspagem automática + anfitrião expert + preço BR |
| Taxa de conversão baixa no onboarding | 🟡 Média | 🟡 Médio | Magic Onboarding reduz atrito; Testar com usuários reais |

---

## Apêndice A — Mapeamento de Campos Airbnb → Zélla AirB

| Campo Airbnb | Campo Zélla AirB | Camada | Auto? |
|-------------|-------------------|--------|:-----:|
| `property_id` | `airbnbId` | 1 | ✅ |
| `listing_url` | `listingUrl` | 1 | ✅ |
| `name` | `name` | 1 | ✅ |
| `description` | `description` | 1 | ✅ |
| `property_type` | `propertyType` | 1 | ✅ |
| `accommodates` | `accommodates` | 1 | ✅ |
| `bedrooms` | `bedrooms` | 1 | ✅ |
| `beds` | `beds` | 1 | ✅ |
| `bathrooms` | `bathrooms` | 1 | ✅ |
| `latitude` | `latitude` | 1 | ✅ |
| `longitude` | `longitude` | 1 | ✅ |
| `neighborhood` | `neighborhood` | 1 | ✅ |
| `city` | `city` | 1 | ✅ |
| `review_scores_rating` | `rating` | 1 | ✅ |
| `number_of_reviews` | `reviewCount` | 1 | ✅ |
| `price` | `basePrice` | 1 | ✅ |
| `amenities` | `amenities` | 1 | ✅ |
| `photos` | `photos` | 1 | ✅ |
| `house_rules` | `houseRules` | 1 | ✅ |
| — | `highlights` | 2 | ✅ AI |
| — | `aiSummary` | 2 | ✅ AI |
| — | `sellingPoints` | 2 | ✅ AI |
| — | `targetAudience` | 2 | ✅ AI |
| — | `keywords` | 2 | ✅ AI |
| — | `wifiName` | 3 | ❌ Manual |
| — | `wifiPassword` | 3 | ❌ Manual |
| — | `lockboxCode` | 3 | ❌ Manual |
| — | `lockboxLocation` | 3 | ❌ Manual |
| — | `accessInstructions` | 3 | ❌ Manual |
| — | `emergencyContact` | 3 | ❌ Manual |
| — | `personalLocalTips` | 3 | ❌ Manual |
| — | `additionalRules` | 3 | ❌ Manual |
| — | `quietHoursStart` | 3 | ❌ Manual |
| — | `quietHoursEnd` | 3 | ❌ Manual |

---

## Apêndice B — Competidores e Posicionamento

| Produto | Preço | Foco | Diferencial vs Zélla AirB |
|---------|-------|------|--------------------------|
| **Hospitable** | US$49-349/mês | Mensagens auto | Não raspa dados do anúncio; Não é "o dono" |
| **Guesty** | US$200+/mês | PMS completo | Muito caro; Foco gestão, não atendimento IA |
| **Hostaway** | US$50+/mês | PMS + Channel | Sem IA conversacional |
| **Superhog** | US$15-70/mês | Screening | Apenas verificação de hóspedes |
| **Uplisting** | US$40-200/mês | Channel manager | Sem atendimento WhatsApp |
| **Zélla AirB** | R$397-797/mês | Atendimento IA WhatsApp | Raspagem auto + Anfitrião expert + Preço BR |

**Vantagem competitiva do Zélla AirB:**
1. 🇧🇷 **Feito para o Brasil** — Preço em Real, suporte em PT-BR, WhatsApp nativo
2. 🪄 **Raspagem automática** — Nenhum concorrente raspa o anúncio e preenche o cadastro
3. 🧠 **Anfitrião Expert** — IA que realmente "conhece" o imóvel, não apenas responde FAQ
4. 💬 **One-Shot Resolution** — Otimizado para o novo custo por mensagem do WhatsApp
5. 🏠 **Vendas + Suporte** — Pré e pós reserva no mesmo assistente

---

## Apêndice C — Glossário

| Termo | Definição |
|-------|-----------|
| **DDC** | Dashboard do Cliente — Painel de controle do anfitrião |
| **One-Shot Resolution** | Responder tudo em uma única mensagem para minimizar custo |
| **BSUID** | Business Sender User ID — Novo identificador WhatsApp (substitui número) |
| **Tenant** | Conta do cliente (pousada ou anfitrião Airbnb) |
| **Strategy** | Padrão de projeto que define qual "cérebro" a IA usa |
| **Camada 1** | Dados públicos do anúncio (raspagem automática via API) |
| **Camada 2** | Dados enriquecidos por IA (highlights, resumo, selling points) |
| **Camada 3** | Dados privados do anfitrião (WiFi, lockbox, regras extras) |
| **Magic Onboarding** | Cadastro inteligente onde o anfitrião cola o link e o sistema preenche tudo |
| **Feature Gate** | Controle de acesso a funcionalidades baseado no plano contratado |
| **MBA** | Meta Business Agent — Novo tipo de conta WhatsApp para agentes IA (Ago 2026) |
| **Intent** | Intenção classificada da mensagem do hóspede (ex: CHECK_IN, PRICING_INFO) |

---

> **Documento gerado em:** 15 de Julho de 2026  
> **Autor:** Agente Z.ai  
> **Status:** ✅ Validado — Aguardando confirmação do usuário para iniciar codificação  
> **Próximo passo:** Revisão do usuário → Ajustes → Início da Fase 1
