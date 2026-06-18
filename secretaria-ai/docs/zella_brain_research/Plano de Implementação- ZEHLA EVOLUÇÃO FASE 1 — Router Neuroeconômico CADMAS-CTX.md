# Plano de Implementação: ZEHLA EVOLUÇÃO FASE 1 — Router Neuroeconômico CADMAS-CTX 🧠

Este plano detalha a arquitetura de domínio, os fundamentos matemáticos e o design de software para a implementação da **Fase 1 — ZaosNeuroRouter** com o algoritmo **CADMAS-CTX** (Contextual Capability Calibration for Multi-Agent Delegation — Context-Extended) e **Amostragem de Thompson (Beta-Binomial)**. 

A implementação visa extirpar o roteamento legado 3-Tier baseado em regras estáticas (que acumula arrependimento linear $O(T)$) por uma inteligência neuroeconômica puramente testável em memória que opera com arrependimento logarítmico sublinear $O(\log T)$, mitigação adaptativa de *Context Flip* e inicialização acelerada via priors de benchmarks (*Cold Start*).

---

## User Review Required

> [!IMPORTANT]
> **Imutabilidade Matemática de Value Objects (VOs):**
> Em estrita conformidade com a **Lei 2 (Modelagem Rica)** do `SKILL.md`, todas as entidades e Value Objects (VOs) serão imutáveis.
> - O `BetaBinomialPosterior` gerenciará parâmetros $\alpha$ (pseudo-sucessos) e $\beta$ (pseudo-fracassos) de forma puramente funcional, com métodos mutadores como `.update()` e `.decay()` retornando uma nova instância imutável do VO.
> - A amostragem estocástica será isolada e reprodutível, aceitando opcionalmente um gerador de números pseudo-aleatórios (PRNG) no domínio do teste para isolar efeitos estocásticos.
>
> **Zero Tipos Anêmicos e `any`:**
> A tipagem do domínio será 100% explícita. Não utilizaremos `any` ou typecasts perigosos para lidar com as matrizes de capabilities, históricos de sessão ou mapas de posteriors de buckets contextuais.
> 
> **Mapeamento de Tiers e Provedores:**
> Os provedores LLM serão modelados de forma rica (`rules_engine`, `gpt-4o-mini`, `claude-3.5-sonnet`, `gpt-4o`, `claude-3-opus`), mapeando custos, latências e capacidades específicas por provedor.

---

## Proposed Changes

Abaixo estão descritas as alterações agrupadas pelo Bounded Context de decisão cognitiva, ordenadas de forma lógica (estruturas fundamentais de domínio primeiro, seguidas de serviços operacionais, e por fim o Aggregate Root).

```
src/domain/decision/
├── services/
│   ├── ZaosNeuroRouter.ts         ← [MODIFICAR] Substitui o ZehlaRouter simplista e regras estáticas
│   ├── ContextDiscretizer.ts      ← [NEW] Serviço de classificação em 11 buckets semânticos (<5ms)
│   ├── ContextFlipMitigator.ts    ← [NEW] Controle adaptativo de stickiness de sessão
│   └── MultiObjectiveReward.ts    ← [NEW] Motor neuroeconômico qualidade x custo x latência
```

---

### 1. ⚙️ Componente de Decisão do Domínio (`src/domain/decision`)

#### [NEW] [ContextDiscretizer.ts](file:///Users/marciocau/Projetos/zehla-backend/src/domain/decision/services/ContextDiscretizer.ts)
*   Implementará o serviço de classificação rápida e semântica de requisições de entrada em **11 buckets contextuais** específicos de hospitalidade:
    1.  `faq_simple` (perguntas diretas sobre amenidades, café da manhã, regras).
    2.  `pricing_inquiry` (consultas sobre preço de diárias ou pacotes).
    3.  `reservation_flow` (fluxos estruturados e complexos de reserva/cancelamento).
    4.  `complaint_handling` (reclamações de hóspedes, ruídos, problemas de serviço).
    5.  `semantic_analysis` (comparações profundas de quartos ou análises complexas).
    6.  `content_generation` (escrita criativa, posts de mídias, copys de e-mail).
    7.  `review_analysis` (análise NPS, reviews do Google/Booking).
    8.  `multilingual_guest` (atendimento a hóspedes estrangeiros em outros idiomas).
    9.  `operational_report` (geração de dashboards operacionais, RevPAR, ocupação).
    10. `emergency_handling` (urgências médicas, segurança, incidentes críticos).
    11. `other` (fallback para inputs não categorizados).
*   **Fast Path:** Pattern matching pré-compilado de expressões regulares para prioridades de emergência e consultas clássicas (latência $<1\text{ms}$).
*   **Feature Path:** Extração de flags de features (como comprimento do input, presença de números ou datas, sentimento implícito e detecção de idioma) para calcular o *overlap* semântico com os requisitos do bucket (latência total $<5\text{ms}$).
*   Retornará um tipo discriminado ou ID numérico mapeado no intervalo $[0, 31]$ para compatibilidade com o CADMAS-CTX de 32 buckets.

#### [NEW] [ContextFlipMitigator.ts](file:///Users/marciocau/Projetos/zehla-backend/src/domain/decision/services/ContextFlipMitigator.ts)
*   Manterá a consistência estilística e de tom de voz da pousada dentro de conversas ativas no WhatsApp, prevenindo a oscilação desnecessária de modelos (fenômeno do *Context Flip*).
*   **Lógica de Mitigação:**
    - Se a mesma sessão (`session_id`) realizar uma requisição que caia no mesmo bucket semântico, o mitigator imporá uma **penalidade de stickiness**.
    - O modelo anteriormente designado àquele bucket na mesma sessão será mantido, a menos que o novo candidato amostrado pelo Thompson Sampling apresente uma melhoria de utilidade superior ao limiar de stickiness de $0.3$.
    - Sessões inativas há mais de 1 hora ($3600\text{s}$) serão purgadas automaticamente.

#### [NEW] [MultiObjectiveReward.ts](file:///Users/marciocau/Projetos/zehla-backend/src/domain/decision/services/MultiObjectiveReward.ts)
*   Calibrará o feedback compostável de sucesso/fracasso das execuções baseando-se no trilema de alocação de recursos:
    - **Qualidade ($Q_{\text{norm}}$):** Avaliada na escala $[0, 1]$ baseada na precisão e tom da resposta.
    - **Custo ($C_{\text{norm}}$):** Custo de inferência real normalizado contra o teto de $\$0.05$ por requisição:
      $$C_{\text{norm}} = 1 - \min\left(\frac{C_{\text{real}}}{\text{ceiling}}, 1.0\right)$$
    - **Latência ($L_{\text{norm}}$):** Latência de resposta normalizada contra o SLA do bucket correspondente (ex: $500\text{ms}$ para FAQ simple, $3000\text{ms}$ para complaints):
      $$L_{\text{norm}} = 1 - \min\left(\frac{L_{\text{real}}}{\text{SLA}}, 1.0\right)$$
*   **Função de Recompensa Composta ($U$):**
    $$U = w_q \cdot Q_{\text{norm}} + w_c \cdot C_{\text{norm}} + w_l \cdot L_{\text{norm}}$$
    Com os pesos de negócio do hotel configurados em $w_q = 0.5$, $w_c = 0.3$ e $w_l = 0.2$.
*   **Binarização Bayesiana:** Retornará um booleano de `success` indicando se a resposta foi aceitável ($Q \ge 0.6$ e sem estourar o limite rígido de $2 \times \text{SLA}$).

#### [MODIFY] [ZaosNeuroRouter.ts](file:///Users/marciocau/Projetos/zehla-backend/src/domain/decision/services/ZaosNeuroRouter.ts)
*   Substituirá a estrutura simplista e redundante do `ZehlaRouter.ts` legando uma suíte pura, matematicamente blindada e tipada de forma estrita.
*   **`NeuroProvider` (VO):** Objeto imutável contendo nome, tier ($1$ a $3$), custos de tokens (input/output), latência média, e o mapa estrito de capabilities base:
    ```typescript
    export interface INeuroCapabilities {
      readonly reasoning: number;
      readonly conversation: number;
      readonly code: number;
      readonly json: number;
      readonly creative: number;
      readonly multilingual: number;
      readonly safety: number;
    }
    ```
*   **`BetaBinomialPosterior` (VO):** Gerencia a distribuição de probabilidade. Implementa a amostragem Bayesiana utilizando o algoritmo Box-Muller para normal sampling e o algoritmo adaptativo Marsaglia/Tsang para amostragem estocástica da distribuição Beta em tempo linear de forma determinística e testável.
*   **`ZaosNeuroRouter` (Aggregate Root):**
    - Armazena a matriz de posteriors em uma estrutura mapeada `Map<string, BetaBinomialPosterior>` utilizando chaves compostas `${bucketId}_${providerName}`.
    - **Benchmark Cold Start:** Inicializa as posteriors utilizando priors informados com base nos scores de benchmark MMLU e MMLU-Pro do domínio correspondente:
      $$\alpha = \text{capability} \cdot n_{\text{pseudo}} + 1$$
      $$\beta = (1 - \text{capability}) \cdot n_{\text{pseudo}} + 1$$
      (utilizando $n_{\text{pseudo}} = 10$).
    - **Decaimento Não-Estacionário:** Suporta decaimento temporal exponencial multiplicando os counts de sucessos/fracassos pelo fator de decaimento $\gamma = 0.999$ a cada 100 interações, forçando a reciclagem suave de aprendizados legados.
    - **Clean Architecture Check:** Totalmente em memória, sem acesso direto a banco de dados ou Next.js APIs. Receberá as entradas via inputs puros e retornará `Result<RoutingDecision, Error>`.

---

## Verification Plan

### Automated Tests

Escreveremos uma suíte de testes de simulação estocástica em memória sob a pasta `src/__tests__/decision/` para garantir a robustez e integridade matemática do ZaosNeuroRouter, sem necessidade de levantar banco de dados, mocks complexos de HTTP ou frameworks:

#### 1. 🧪 Teste de Cold Start Inteligente (`ZaosNeuroRouter.test.ts`)
*   **Objetivo:** Validar que, em estado inicial de warm-up, o router não joga tráfego de forma puramente uniforme.
*   **Validação:** Confirmar que no bucket de `emergency_handling` o router prioriza o `rules_engine` (capacidade de segurança 1.0 e latência 15ms) e no bucket de `complaint_handling` prioriza o modelo premium (`gpt-4o` ou `claude-3.5-sonnet`) devido aos priors informados pelo benchmark MMLU.

#### 2. 🧪 Teste de Convergência Sublinear $O(\log T)$ (`ZaosNeuroRouter.test.ts`)
*   **Objetivo:** Simular 1.000 iterações estocásticas do router em loop fechado em memória e registrar a taxa de sucesso.
*   **Cenário de Falha do Tier 2:** Simular que o `gpt-4o-mini` (routine tier) falha consecutivamente (50% de sucesso real injetado) em análises semânticas profundas de reviews complexos, enquanto o `gpt-4o` (premium tier) performa com 95% de sucesso real.
*   **Validação:** Provar que os pseudo-counts Beta do modelo routine colapsam rumo a zero e o router migra organicamente o tráfego para o modelo premium em menos de 200 iterações, estabilizando a taxa de sucesso global acima de 90%.

#### 3. 🧪 Teste de Isolamento Bayesiano (`ZaosNeuroRouter.test.ts`)
*   **Objetivo:** Garantir que atualizações e aprendizados em um bucket contextual não vazem ou contaminem a distribuição de outros buckets.
*   **Validação:** Simular 500 falhas no bucket `pricing_inquiry` com `gpt-4o-mini`. Verificar que a posterior de `gpt-4o-mini` no bucket `faq_simple` se mantém intocável e altamente preferencial.

#### 4. 🧪 Teste de Mitigação de Context Flip (`ZaosNeuroRouter.test.ts`)
*   **Objetivo:** Validar o controle de consistência estilística em sessões do WhatsApp.
*   **Validação:** Simular duas requisições consecutivas no mesmo bucket `faq_simple` dentro do mesmo `session_id`. Introduzir um leve desvio estocástico de utilidade a favor do modelo alternativo. Confirmar que o mitigator mantém o modelo anterior estável (bloqueia o flip) por estar abaixo do gap de $0.3$.

#### Comando de Execução:
```bash
npx vitest run src/__tests__/decision/ZaosNeuroRouter.test.ts
```

### Manual Verification
*   **Validação Estática:** Garantir compilação limpa do projeto sem nenhum erro de tipagem:
    ```bash
    npm run build
    # ou tsc --noEmit
    ```
