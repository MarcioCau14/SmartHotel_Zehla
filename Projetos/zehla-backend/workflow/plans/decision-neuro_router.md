# Plano Arquitetural: decision-neuro_router.md 🧠

Este documento serve como contrato arquitetural de domínio sob `/Users/marciocau/Projetos/zehla-backend/workflow/plans/decision-neuro_router.md` para a evolução da inteligência cognitiva do **ZaosNeuroRouter CADMAS-CTX v2.0**, em conformidade total com o protocolo **AGENTS.md** e as diretrizes do **SKILL.md**.

---

## 1. Contexto Delimitado (Bounded Context) & Entidades

O domínio de **decisão cognitiva** (`src/domain/decision`) gerencia a escolha de qual provedor de inteligência artificial ou motor de decisão (Tier) executará uma determinada requisição, de forma a otimizar a experiência (qualidade) e recursos (custo e latência).

### Entidades & Agregados
*   **`ZaosNeuroRouter` (Aggregate Root):** Orquestra o pipeline neuroeconômico integrado, encapsula o mapa de posteriors contextuais, consome serviços de suporte (Pareto, stickiness, transfer) e gera decisões tipadas de forma atômica.

### Value Objects (VOs) - Imutáveis
*   **`NeuroProvider`:** Armazena custos (1M de tokens input/output), SLA de latência, nível de Tier (1 = rules, 2 = routine, 3 = premium) e capabilities estritas de raciocínio.
*   **`BetaBinomialPosterior`:** Representa a distribuição Bayesiana $\text{Beta}(\alpha, \beta)$ de probabilidade de sucesso por `(bucket, provider)`.
*   **`PosteriorKey`:** Tipo de chave composta imutável `bucketId` + `providerName`.
*   **`RoutingRequest`:** Dados de entrada para classificação e roteamento.
*   **`RoutingDecision`:** Informações finais da rota selecionada.

---

## 2. Contratos e Interfaces de Serviços (Domain Services)

Para manter o domínio completamente isolado de bibliotecas de terceiros ou frameworks, criaremos serviços puros em memória e interfaces abstratas:

### ContextDiscretizer
Classifica o texto em um dos 11 buckets específicos:
`faq_simple`, `pricing_inquiry`, `reservation_flow`, `complaint_handling`, `semantic_analysis`, `content_generation`, `review_analysis`, `multilingual_guest`, `operational_report`, `emergency_handling`, `other`.

### ParetoMultiObjectiveSelector
Filtra provedores que violam barreiras mínimas de qualidade por bucket e calcula Pareto ranking (rank 0 para não-dominados) antes da seleção de utilidade esperada.

### AdaptiveStickinessCalculator
Calcula thresholds dinâmicos contra oscilação tonal (*Context Flip*) com base em:
$$\text{threshold} = \text{baseThreshold}(\text{bucket}) \times \text{sessionDecay}(\text{turns}) \times \text{timeDecay}(\text{elapsedMs})$$

### ProviderCircuitBreaker
Gerencia os estados `CLOSED`, `OPEN`, e `HALF_OPEN` por par `(bucket, provider)` para mitigar falhas de API dos provedores.

### BudgetCircuitBreaker
Inflaciona o custo na utilidade do Thompson Sampling por $3.0x$ ao atingir 80% do budget diário do tenant, e bloqueia modelos Tier $\ge 2$ ao atingir 95% do budget (downshift automático).

### QualityProxy
Estima a qualidade da resposta do LLM sem chamadas de rede em $<1\text{ms}$ através de 6 sinais heurísticos (JSON Schema, conformidade de formato WhatsApp, adequação de sentimento, keywords, alucinação e tamanho).

---

## 3. Infraestrutura & Persistência (Ports & Adapters)

### PosteriorRepository (Port/Adapter)
*   **Interface no Domínio:** `ZaosNeuroRouter` recebe e atualiza posteriors.
*   **Adapter na Infraestrutura:** `PosteriorRepository` em `src/domain/decision/infrastructure/` encapsula persistência baseada em arquivos SQLite locais em `./zehla_data/router_state/` rodando em modo WAL (`journal_mode = WAL`).
*   **Async Buffer Writer:** updates são enfileirados em um buffer circular e persistidos assincronamente a cada 500ms para latência zero no fluxo crítico de atendimento.

---

## 4. Fluxo e Pipeline de Roteamento (Decisão Cognitiva)

1.  **Request Input:** Recebe texto e identificadores de sessão.
2.  **Discretização:** Classifica a entrada em 1 de 11 buckets.
3.  **Filtro Orçamentário:** Restringe provedores premium se o budget do tenant estiver estourado (>95%).
4.  **Filtro de Saúde:** Remove provedores com circuitos abertos (`OPEN`).
5.  **Amostragem Bayesiana:** Thompson Sampling sorteia $\theta$ para os provedores restantes com base nas posteriors Beta locais (ou transferidas hierarquicamente).
6.  **Filtro Pareto:** Remove provedores com qualidade $\theta$ abaixo do mínimo rígido do bucket.
7.  **Avaliação de Stickiness:** Se houver um provedor ativo na sessão, avalia se o ganho de utilidade do novo modelo supera o threshold de stickiness adaptativo.
8.  **Seleção:** Determina o modelo ideal.
9.  **Execução com Fallbacks:** `FallbackChainExecutor` executa chamadas com timeout individual de 5s, total de 8s (limite WhatsApp) e max 2 retries com outros modelos da lista.
10. **Feedback & Persistência:** Avalia a resposta gerada com `QualityProxy` e envia o feedback de sucesso/fracasso ao Buffer de Persistência, ao Circuit Breaker e aos logs de observabilidade (.jsonl).

---

## 5. Plano de Verificação

### Suite Avançada de Testes Estocásticos (`src/__tests__/decision/`)
*   **`ZaosNeuroRouter.test.ts`:**
    - Teste de **Cold Start** calibrado por benchmarks MMLU.
    - Teste de **Convergência Sublinear $O(\log T)$** com 500 iterações e falhas injetadas.
    - Teste de **Isolamento Bayesiano** e **Mitigação de Context Flip**.
*   **`ZaosNeuroRouter.advanced.test.ts`:**
    - Testes do **Circuit Breaker** (consecutive failures, half-open synthetic probing).
    - Testes do **Budget Enforcer** (inflação de utilidade de 3.0x a 80%, bloqueio duro a 95%).
    - Testes da **Fallback Chain** (retries automáticos sob status de erro de API, timeout total de 8s).
    - Testes do **Quality Proxy** (validação dos 6 sinais heurísticos in-memory).
    - Testes do **SQLite WAL Persistence** (concorrência e dreno assíncrono).

### Homologação
Sem imports de infraestrutura ou frameworks no domínio, tipagem 100% estrita e zero `any`.
