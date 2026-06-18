# 🧠 ZEHLA BRAIN — SUPER DOCUMENTO DE ARQUITETURA COGNITIVA & PLANO DE IMPLEMENTAÇÃO

## 1. INTRODUÇÃO E VISÃO GERAL
Este documento representa a consolidação definitiva da arquitetura cognitiva do **ZEHLA SmartHotel (ZAOS - ZEHLA Agentic Operating System)**. O objetivo é estabelecer a fundação conceitual e técnica para um cérebro agêntico autônomo, autossustentável e neuroeconomicamente otimizado, projetado para operar na infraestrutura VPS Hostinger KVM4 (16GB RAM) sob escala hiper-massiva (10.000+ pousadas simuladas).

A arquitetura transcende o paradigma tradicional de "prompting" frágil (*one-shot*), substituindo-o por loops cognitivos fechados de auto-avaliação (*Looping Engineering*) e roteamento dinâmico de modelos baseado em utilidade esperada e contenção de custos (*Headroom* + *Thompson Sampling*).

---

## 2. OS 5 PILARES DO SISTEMA COGNITIVO ZEHLA (ZAOS)

```mermaid
graph TD
    User([Hóspede / Hoteleiro]) --> ZRouter[ZaosNeuroRouter: Thompson Sampling]
    
    %% Roteamento
    ZRouter --> Tier1[Tier 1: Rules & Regex | <1ms, $0]
    ZRouter --> Tier2[Tier 2: MiniMax / Ollama | ~500ms, $0.0002]
    ZRouter --> Tier3[Tier 3: Claude 3.5 Sonnet | 2-5s, $0.003]
    
    %% Core & Microkernel
    ZRouter --> Kernel[ZAOS-Kernel: PromptBuilder Prefix Cache]
    Kernel --> Plugins[ZAOS-Plugins: Microkernel & Extension Hooks]
    
    %% Swarm & Automação
    Plugins --> Ralph[Ralph Loop: Meta Persistente /goal]
    Ralph --> Swarm[Swarm Coordinator: Enxame Hierarchical-Mesh]
    Swarm --> W1[Agent: Pricing]
    W1 -.-> Ev[Avaliador Dogmático]
    Swarm --> W2[Agent: Reviews]
    W2 -.-> Ev
    Ev -->|Completo| User
    Ev -->|Incompleto| Ralph
    
    %% Memória & Conhecimento
    Kernel --> Memory[ZAOS-Memory System]
    Memory --> L0[First-Class: Matriz Mnemônica estática]
    Memory --> L1[Vector Memory: SQLite + sqlite-vec HNSW]
    Memory --> L2[Relational: SQLite Knowledge Graph Pathfinder]
    
    %% Aprendizado Fechado
    User --> Pipeline[Pipeline HOSPI: Retrieve → Judge → Distill → Consolidate]
    Pipeline --> Memory
    Memory --> Cron[Cron Offline: Self-Evolution DSPy + GEPA]
    Cron --> PromptBuilder
```

### 2.1 Pilar 1: Neuroeconomic Router (ZaosNeuroRouter CADMAS-CTX v2.0)
Nenhuma requisição ou decisão cognitiva chama APIs diretamente. Todas as chamadas são interceptadas pelo `ZaosNeuroRouter` que implementa um algoritmo de bandido multi-armado (**Thompson Sampling**) sobre uma distribuição probabilística Beta-Binomial.

#### A Matemática do Thompson Sampling
Para cada par de **(Bucket Contextual, Provedor LLM)**, mantemos uma distribuição posterior $\text{Beta}(\alpha, \beta)$ que representa a probabilidade de sucesso.
- **Warm-up / Prior Inicial:**
  $$\alpha_0 = \text{capability} \times \text{pseudoCounts} + 1$$
  $$\beta_0 = (1 - \text{capability}) \times \text{pseudoCounts} + 1$$
- **Amostragem (Thompson Sampling):**
  Para cada provedor disponível, amostramos $\theta_p \sim \text{Beta}(\alpha_p, \beta_p)$. O provedor com a maior utilidade esperada é selecionado:
  $$U(p) = \theta_p - w \cdot \text{Cost}(p)$$
  *Onde $w$ é o fator de peso neuroeconômico configurado para a propriedade.*
- **Atualização Posterior:**
  Após a execução e validação da resposta (por latência e rubrica de qualidade):
  - **Sucesso:** $\alpha_p \leftarrow \alpha_p + 1$
  - **Falha:** $\beta_p \leftarrow \beta_p + 1$
- **Decaimento Exponencial (Tratamento de Não-Estacionariedade):**
  Para permitir adaptação a oscilações de rede ou atualizações nos provedores, aplicamos decaimento semanal $\gamma \in [0.95, 0.99]$:
  $$\alpha \leftarrow 1.0 + \gamma \cdot (\alpha - 1.0)$$
  $$\beta \leftarrow 1.0 + \gamma \cdot (\beta - 1.0)$$

#### Taxonomia dos 32 Buckets Contextuais
O sistema mapeia a intenção das requisições em 32 buckets categorizados no intervalo $[0, 31]$:

| ID | Bucket Name | Categoria | Min Tier | SLA (ms) | Complexidade |
|----|------------|-----------|----------|----------|-------------|
| 00 | `faq_hours_operating` | FAQ | 1 | 500 | Baixa |
| 01 | `faq_location_access` | FAQ | 1 | 500 | Baixa |
| 02 | `faq_amenities_services` | FAQ | 1 | 500 | Baixa |
| 03 | `faq_policies_rules` | FAQ | 1 | 500 | Baixa |
| 04 | `faq_general_misc` | FAQ | 1 | 800 | Baixa |
| 05 | `pricing_simple_query` | Pricing | 2 | 1500 | Média |
| 06 | `pricing_comparison` | Pricing | 2 | 2000 | Média |
| 07 | `pricing_seasonal_promo` | Pricing | 2 | 2000 | Média |
| 08 | `pricing_negotiation` | Pricing | 3 | 3000 | Alta |
| 09 | `booking_new_request` | Booking | 2 | 2000 | Alta |
| 10 | `booking_modification` | Booking | 2 | 2000 | Alta |
| 11 | `booking_cancellation` | Booking | 2 | 1500 | Média |
| 12 | `booking_checkin_confirm` | Booking | 1 | 500 | Baixa |
| 13 | `complaint_cleanliness` | Complaint | 3 | 3000 | Alta |
| 14 | `complaint_noise` | Complaint | 3 | 3000 | Alta |
| 15 | `complaint_service_staff` | Complaint | 3 | 3000 | Alta |
| 16 | `complaint_maintenance` | Complaint | 3 | 3000 | Alta |
| 17 | `complaint_food_beverage` | Complaint | 3 | 3000 | Alta |
| 18 | `complaint_billing_charge` | Complaint | 3 | 5000 | Alta |
| 19 | `sentiment_negative_deep` | Semantic | 3 | 5000 | Alta |
| 20 | `semantic_comparison` | Semantic | 3 | 5000 | Alta |
| 21 | `semantic_recommendation` | Semantic | 2 | 3000 | Alta |
| 22 | `content_social_media` | Content | 2 | 8000 | Média |
| 23 | `content_email_marketing` | Content | 2 | 8000 | Média |
| 24 | `content_listing_desc` | Content | 2 | 8000 | Média |
| 25 | `review_google_trustpilot` | Review | 3 | 5000 | Alta |
| 26 | `review_booking_tripadvisor` | Review | 3 | 5000 | Alta |
| 27 | `multilingual_english` | I18N | 2 | 2000 | Média |
| 28 | `multilingual_spanish` | I18N | 2 | 2000 | Média |
| 29 | `multilingual_other` | I18N | 2 | 2000 | Média |
| 30 | `emergency_medical` | Emergency | 1 | 200 | Alta |
| 31 | `emergency_safety` | Emergency | 1 | 200 | Alta |

---

### 2.2 Pilar 2: Headroom (Context Compression & Semantic Cache)
Para viabilizar financeiramente a operação, integramos o **Headroom** localmente como um proxy reverso.
- **Semantic Caching:** Compara a distância vetorial da entrada com chaves cacheadas no banco Redis local. Se a similaridade cosseno for $\ge 0.96$, retorna a resposta do cache instantaneamente com custo zero de tokens.
- **Compressão Contextual:** Otimiza prompts dinâmicos eliminando stop-words, tags redundantes e agrupando históricos. Reduz de 60% a 95% do volume de tokens redundantes antes do envio para modelos caros em nuvem.

---

### 2.3 Pilar 3: Lead Intelligence & Behavioral Profiling
O Cérebro ZEHLA classifica leads em clusters (**HOT, WARM, COLD**) e perfis psicológicos comportamentais para ajustar dinamicamente a abordagem comercial da IA.

#### Algoritmo de Lead Score
$$Score = (\text{email\_open} \times 1) + (\text{click} \times 3) + (\text{whatsapp\_response} \times 5) + (\text{trial\_start} \times 10) + (\text{conversion} \times 20)$$
* Leads com $Score \ge 60$ são marcados como **HOT**.
* Leads com $Score \ge 30$ são marcados como **WARM**.
* Leads abaixo de 30 são classificados como **COLD**.

#### Perfis Psicológicos de Abordagem
- **Curioso:** Busca informações gerais, interage muito com botões. Abordagem: Leve, exploratória.
- **Analítico:** Pergunta sobre custos, ROI, integrações, regras. Abordagem: Baseada em dados, números claros.
- **Urgente:** Responde rápido e exige ações inmediatas. Abordagem: Direta, pragmática, CTA imediato.
- **Resistente:** Apresenta objeções frequentes ou silencia no trial. Abordagem: Suave, focada em resolver atritos, sem pressão comercial.

---

### 2.4 Pilar 4: Memory System & Closed-Loop Learning
A memória agêntica não é volátil. Ela opera em 3 níveis integrados:
1. **Nível 0 (L0 - Prompt Cache):** Matriz Mnemônica compactada injetada na API (regras imutáveis da pousada, FAQ estático).
2. **Nível 1 (L1 - Vector Memory):** Armazenamento de episódios locais de forma vetorizada via banco SQLite com extensão `sqlite-vec` (vetores de 384 dimensões usando `all-MiniLM-L6-v2`).
3. **Nível 2 (L2 - Relational Knowledge Graph):** Grafo de conhecimento em SQLite (`kg_nodes`, `kg_edges`) executando Pathfinder BFS (Breadth-First Search) para deduzir relações multi-hop (ex: vincular preferências do hóspede a itens específicos da pousada).

#### Elastic Weight Consolidation (EWC++)
Para evitar o esquecimento catastrófico ao consolidar aprendizados de comportamento no modelo local, aplicamos uma penalidade quadrática baseada na matriz de informação de Fisher $F_i$:
$$L(\theta) = L_B(\theta) + \sum_{i} \frac{\lambda}{2} F_i (\theta_i - \theta_{A,i}^*)^2$$

---

### 2.5 Pilar 5: Looping Engineering (Hardness Loops)
Elimina respostas univalidadas instáveis do LLM. O motor comercial (`closing-loop.ts`) funciona em ciclos estruturados:

```
[Entrada WhatsApp] ──> (ACT: Agente Closer) 
                           │
                           ▼
                    (OBSERVE: Grafo de Decisão)
                           │
                           ▼
                    (REASON: Agente Verificador) <── [HospitalityQualityRubric]
                           │
             ┌─────────────┴─────────────┐
             ▼                           ▼
        [Reprovado]                 [Aprovado]
     (Volta para ACT)                    │
                                         ▼
                             [Envio via WhatsApp API]
```

A **HospitalityQualityRubric** audita 6 sinais:
1. **Schema Check:** Retorno no formato JSON ou texto esperado.
2. **Tone Check:** Nenhuma presença de termos gerativos artificiais ("Olá, sou um assistente virtual", "Como posso ajudar?").
3. **Accuracy Check:** Dados de preços e datas batem 100% com o banco de dados/PMS.
4. **Context Check:** A resposta atende à intenção (se suporte, não tenta vender).
5. **Length Check:** Respostas curtas, fáceis de ler no celular.
6. **Safety Check:** Zero vazamento de dados de outros hóspedes ou chaves PII.

---

## 3. AUDITORIA E CRUZAMENTO DE DADOS COM O REPOSITÓRIO ATUAL

Cruzando as especificações ideais com o repositório `/Users/marciocau/secretaria-ai`:

| Componente Ideal | Estado Atual no Repositório | Ação Corretiva Necessária |
|------------------|-----------------------------|---------------------------|
| **Postgres Data Layer** | Implementado. Modelos existem no Prisma. | Validar RLS por `propertyId` e suporte a embeddings. |
| **Circuit Breakers** | Ausente no domínio de decisão. | Criar `CircuitBreakerState.ts` imutável. |
| **Thompson Sampling** | Implementação básica em `llm-router.ts`. | Refatorar para utilizar a posterior Beta-Binomial com PRNG determinístico e 32 buckets contextuais. |
| **Budget Guard** | Ausente. | Criar `BudgetGuard.ts` para contenção financeira por pousada. |
| **Headroom Integration** | Apenas menção de envs. | Configurar o proxy local no `docker-compose.yml` e no `llm-router.ts`. |
| **Event Tracking & Score** | Estrutura básica. | Implementar o pipeline assíncrono de atualização no banco e cálculo de score. |

---

## 4. ESTRATÉGIA DE INFRAESTRUTURA E DEPLOY (VPS HOSTINGER)

Para rodar 24/7 na Hostinger KVM4 de forma estável, o deploy usará Docker Compose para orquestrar:
1. **App Node.js (Next.js):** Executa o backend `secretaria-ai` com suporte a Webhooks rápidos e controllers leves.
2. **PostgreSQL 16:** Persistência relacional com pools otimizados de conexão (via PgBouncer) para lidar com concorrência massiva.
3. **Redis 7:** Fila de jobs assíncronos (BullMQ) e cache semântico temporário.
4. **Headroom Proxy:** Container local interceptando chamadas HTTP para o OpenRouter.

### Script de Automação de Contexto (`auto-update-context.ts`)
Toda noite, às 03:00 AM, um cron job roda `scripts/auto-update-context.ts` para:
- Ler os últimos commits e logs de auditoria.
- Analisar a taxa de erro de chamadas de IA do dia anterior.
- Atualizar o arquivo `/docs/ZEHLA_CORE_COMPRESSED_CONTEXT.md` com as novas regras extraídas, combatendo a amnésia de contexto.

---

## 5. PLANO DE IMPLEMENTAÇÃO DETALHADO (SMALL BATCH WORKFLOW)

### FASE 1: Núcleo de Domínio de Decisão (ZanosNeuroRouter - Lote 1)
Foco exclusivo na criação dos modelos de domínio puro, portas e mocks em memória, com testes matemáticos de convergência sem dependências de infraestrutura.

#### [NEW] [PosteriorKey.ts](file:///Users/marciocau/secretaria-ai/src/domain/decision/models/PosteriorKey.ts)
* VO imutável representando a chave composta para busca de distribuições posteriores por `bucketId` (0 a 31) e `providerName`.

#### [NEW] [ProviderCapabilityProfile.ts](file:///Users/marciocau/secretaria-ai/src/domain/decision/models/ProviderCapabilityProfile.ts)
* VO imutável contendo custos (por 1M de tokens input/output), latência esperada (SLA), tier de qualidade e capabilities de IA.

#### [NEW] [BetaBinomialPosterior.ts](file:///Users/marciocau/secretaria-ai/src/domain/decision/models/BetaBinomialPosterior.ts)
* VO imutável contendo parâmetros $\alpha$ e $\beta$, contagem de observações e timestamp.
* Implementação do algoritmo **Marsaglia e Tsang (2000)** para amostragem determinística da distribuição Beta com suporte a PRNG (gerador pseudo-aleatório injetável para testes).

#### [NEW] [RoutingContext.ts](file:///Users/marciocau/secretaria-ai/src/domain/decision/models/RoutingContext.ts)
* VO contendo os dados de entrada da requisição: texto bruto, sessionId, tenantId, contagem de turnos e canal.

#### [NEW] [RoutingDecision.ts](file:///Users/marciocau/secretaria-ai/src/domain/decision/models/RoutingDecision.ts)
* VO de saída contendo o provedor selecionado, se aplicou stickiness, utilidade esperada calculada e se foi fallback de emergência.

#### [NEW] [CircuitBreakerState.ts](file:///Users/marciocau/secretaria-ai/src/domain/decision/models/CircuitBreakerState.ts)
* VO imutável para a máquina de estados finitos do Circuit Breaker por provedor (`CLOSED` ↔ `OPEN` ↔ `HALF_OPEN`).

#### [NEW] [BudgetGuard.ts](file:///Users/marciocau/secretaria-ai/src/domain/decision/models/BudgetGuard.ts)
* VO imutável para contenção financeira: limita modelos premium (Tier 3) caso o orçamento diário/mensal atinja 80% (WARNING - inflaciona custo artificialmente) ou 95% (CRITICAL - bloqueia Tier 2 e 3, forçando Tier 1 de custo zero).

#### [NEW] [IRouterStatePort.ts](file:///Users/marciocau/secretaria-ai/src/domain/decision/ports/IRouterStatePort.ts)
* Interface pura de persistência (Inversão de Dependência) para carregar e salvar posteriors e estados do Circuit Breaker.

#### [NEW] [InMemoryRouterStateAdapter.ts](file:///Users/marciocau/secretaria-ai/src/domain/decision/adapters/InMemoryRouterStateAdapter.ts)
* Adapter in-memory implementando `IRouterStatePort` para viabilizar testes matemáticos sem conexões I/O de infraestrutura.

---

### FASE 2: Testes Matemáticos e de Convergência (Lote 1)
Desenvolvimento de suítes de teste usando Vitest para provar os contratos, o isolamento bayesiano e a convergência matemática.

#### [NEW] [DomainModels.test.ts](file:///Users/marciocau/secretaria-ai/src/__tests__/decision/DomainModels.test.ts)
* Valida todas as transições de estado do `CircuitBreakerState` e regras de imutabilidade.
* Valida cálculos de custo estimado de `ProviderCapabilityProfile`.
* Valida restrições financeiras e inflação artificial do `BudgetGuard`.

#### [NEW] [ConvergenceProof.test.ts](file:///Users/marciocau/secretaria-ai/src/__tests__/decision/ConvergenceProof.test.ts)
* Simula 500 rodadas de Thompson Sampling e prova matematicamente a migração do fluxo para o modelo com maior probabilidade de sucesso em menos de 150 iterações (prova de arrependimento sublinear).
* Prova o isolamento Bayesiano entre diferentes buckets contextuais (erros no bucket de pricing não degradam o bucket de FAQ).

---

### FASE 3: Implementação dos Componentes do Router e Filtros (Lote 2 & 3)
Criação dos serviços cognitivos, integrando os Value Objects da Fase 1 e ativando a inteligência decisória.

#### [NEW] [ContextDiscretizer.ts](file:///Users/marciocau/secretaria-ai/src/domain/decision/services/ContextDiscretizer.ts)
* Classificador regex/semântico ultra-rápido que mapeia a entrada do usuário em um dos 32 buckets contextuais em menos de 5ms.

#### [NEW] [ZaosNeuroRouter.ts](file:///Users/marciocau/secretaria-ai/src/domain/decision/services/ZaosNeuroRouter.ts)
* O Aggregate Root central da decisão cognitiva, encadeando a pipeline decisória:
  1. Identificação do Contexto (32 buckets).
  2. Validação financeira (BudgetGuard).
  3. Verificação de Circuit Breakers de provedores.
  4. Thompson Sampling para amostragem $\theta_p$.
  5. Seleção de Pareto (filtragem por SLA e restrições de qualidade).
  6. Stickiness adaptativa (preservar o modelo na mesma sessão para manter a linha lógica).
  7. Gravação de logs e transições via `IRouterStatePort`.

---

### FASE 4: Integração Física de Infraestrutura e Headroom Proxy (Lotes 4, 5 & 6)
Plugagem dos proxies, buffers circulares de banco de dados e observabilidade.

#### [MODIFY] [docker-compose.yml](file:///Users/marciocau/secretaria-ai/docker-compose.yml)
* Adição declarativa do proxy Headroom rodando localmente na porta 8787.

#### [MODIFY] [llm-router.ts](file:///Users/marciocau/secretaria-ai/src/lib/ai/llm-router.ts)
* Redireciona de forma transparente as chamadas de nuvem (OpenRouter) para o proxy do Headroom quando ativo.

#### [NEW] [auto-update-context.ts](file:///Users/marciocau/secretaria-ai/scripts/auto-update-context.ts)
* Script de cron noturno para consolidar o estado de logs operacionais e regenerar o arquivo central de contexto.

---

## 6. PLANO DE VERIFICAÇÃO INTEGRAL

### 6.1 Testes Automatizados (Vitest)
Execução local das suítes de teste de domínio e convergência matemática:
```bash
npx vitest run src/__tests__/decision/DomainModels.test.ts
npx vitest run src/__tests__/decision/ConvergenceProof.test.ts
```

### 6.2 Verificação de Compilação Estrita
Validação de integridade do TypeScript em todo o projeto:
```bash
npx tsc --noEmit
```

### 6.3 Verificação Manual
1. **Simulação de Custo Limite (BudgetGuard):** Forçar o orçamento simulado a 96% e validar no terminal se a IA redireciona todas as chamadas para a regra de negócio local (Tier 1).
2. **Dry-run do Cron:** Rodar manualmente o script de auto-atualização de contexto e inspecionar a formatação markdown do arquivo gerado `/docs/ZEHLA_CORE_COMPRESSED_CONTEXT.md`.
3. **Inspeção de Logs de Thompson Sampling:** Validar se os updates de sucesso/falha do roteador estão incrementando corretamente os parâmetros $\alpha$ e $\beta$ na base de dados SQLite/Postgres.
