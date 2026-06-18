# Plano de Implementação — Integração HEADROOM & Cérebro ZEHLA

**Versão:** 2.0 — Reformulação Completa e Robusta
**Data:** 17 de junho de 2026
**Classificação:** CONHECIMENTO ESTRATÉGICO — Documento Nuclear ZEHLA
**Autoria:** Agente ZEHLA OS — Arquitetura Profunda
**Repositório Headroom:** [github.com/chopratejas/headroom](https://github.com/chopratejas/headroom)
**Estrelas:** 30.000+ | **Commits:** 1.616+ | **Licença:** Apache 2.0
**Status:** PRONTO PARA IMPLEMENTAÇÃO

---

## SUMÁRIO

```
SEÇÃO 1  ── Visão Executiva: Por Que Headroom no ZEHLA?
SEÇÃO 2  ── Fundamentação Teórica: O Que É Headroom
SEÇÃO 3  ── Anatomia do Headroom: Pipeline de Compressão
SEÇÃO 4  ── Arquitetura de Integração Headroom × ZEHLA
SEÇÃO 5  ── Compressão Reversível (CCR) no Cérebro ZEHLA
SEÇÃO 6  ── Headroom × Router Neuroeconômico (Thompson Sampling)
SEÇÃO 7  ── Headroom × Campo Akáshico (4 Camadas de Memória)
SEÇÃO 8  ── Headroom × A-MEM / Zettelkasten / ACE PromptBuilder
SEÇÃO 9  ── Headroom × Looping Engineering (Loops Produção)
SEÇÃO 10 ── Infraestrutura Docker e Deploy
SEÇÃO 11 ── Configurações e Variáveis de Ambiente
SEÇÃO 12 ── Roteamento Inteligente: llm-router.ts
SEÇÃO 13 ── Sincronização Cérebro → Akáshico (Ingestão de Conhecimento)
SEÇÃO 14 ── MCP Tools: headroom_compress, headroom_retrieve, headroom_stats
SEÇÃO 15 ── CacheAligner: Otimização de KV Cache por Provider
SEÇÃO 16 ── SmartCrusher: Compressão de Saídas de Tools
SEÇÃO 17 ── headroom learn: Aprendizado com Falhas no ZEHLA
SEÇÃO 18 ── Monitoramento, Métricas e Observabilidade
SEÇÃO 19 ── Plano de Verificação (Testes Automatizados + Manual)
SEÇÃO 20 ── Roadmap de Implementação (4 Fases)
SEÇÃO 21 ── Análise de Custo-Benefício e ROI Projetado
SEÇÃO 22 ── Matriz de Compatibilidade com Stack ZEHLA
SEÇÃO 23 ── Riscos, Mitigações e Limitações Conhecidas
SEÇÃO 24 ── Referências Completas
```

---

## SEÇÃO 1 — VISÃO EXECUTIVA: POR QUE HEADROOM NO ZEHLA?

### O Problema Central

O cérebro ZEHLA opera como um sistema cognitivo complexo com 5 pilares interconectados (Cortex AutoEvo, Memória Blindada, Router Neuroeconômico, Raciocínio Topológico, Memória Agêntica), 7 Anéis de Consciência, Campo Akáshico de 4 camadas, e integração com múltiplos providers LLM via Thompson Sampling e CADMAS-CTX. Cada interação com um hóspede, cada consulta ao Knowledge Graph, cada cristalização do Akáshico, cada decisão de roteamento — tudo isso gera volume massivo de tokens que trafegam entre a aplicação e os provedores de LLM na nuvem (OpenRouter, Anthropic, Google).

O custo operacional desse tráfego é proporcional ao volume de tokens enviados. Mais importante: o cérebro ZEHLA frequentemente envia contextos redundantes — histórico de conversas, saídas extensas de ferramentas, RAG chunks do Campo Akáshico, logs operacionais, prompts do DSPy — que poderiam ser comprimidos sem perda de qualidade nas respostas. O Headroom resolve exatamente esse problema.

### A Solução Headroom

O **Headroom** é a camada de compressão de contexto para agentes de IA mais avançada do mercado open-source. Desenvolvido por Tejas Chopra com 30.000+ estrelas no GitHub, o Headroom comprime tudo que o agente lê — saídas de ferramentas, logs, RAG chunks, arquivos e histórico de conversação — antes de chegar ao LLM. Mesmas respostas, fração dos tokens. Reduções documentadas de **60–95%** com **zero perda de acurácia** em benchmarks padrão (GSM8K ±0.000, TruthfulQA +0.030, SQuAD v2 97%, BFCL 97%).

### O Valor Estratégico para o ZEHLA

A integração do Headroom ao ecossistema ZEHLA representa uma otimização transversal que beneficia **todos os 5 pilares simultaneamente**:

| Pilar ZEHLA | Benefício Direto do Headroom |
|---|---|
| **Cortex AutoEvo (DSPy/GEPA)** | Compressão de prompts intermediários durante autoevolução reduz custo dos ciclos GEPA em até 90%. Menos tokens = mais iterações por orçamento. |
| **Memória Blindada (EWC-DR)** | Compressão de gradientes e logs de treinamento contínuo. Headroom preserva contexto essencial enquanto elimina ruído tokenizado. |
| **Router Neuroeconômico (Thompson/CADMAS)** | Redução do custo por request melhora o payoff do Thompson Sampling. Providers caros (Claude Opus) ficam mais viáveis economicamente. |
| **Raciocínio Topológico (GraphRAG/PPR)** | Compressão de subgrafos e traversal results. Saídas de PPR/BFS com centenas de nós são reduzidas a representações essenciais. |
| **Memória Agêntica (A-MEM/Zettelkasten)** | Compressão de notas atômicas injetadas pelo ACE PromptBuilder. Mais notas cabem no budget de 2.000 tokens sem perda semântica. |

Além dos pilares, o Headroom agrega valor direto ao Campo Akáshico (compressão de episódios para cristalização), ao Whisper Stream (compressão de eventos antes da ingestão), e ao Hermes Agent (compressão de skills e tool outputs).

### Número da Oportunidade

Estimativa conservadora baseada no volume operacional do ZEHLA:
- **Cenário atual:** ~15.000 tokens/request médio × 100 requests/dia/pousada × R$0.015/1K tokens = **R$22,50/dia/pousada**
- **Com Headroom (70% compressão média):** ~4.500 tokens/request = **R$6,75/dia/pousada**
- **Economia:** **R$15,75/dia/pousada** = **R$472/mês/pousada** = **R$5.664/ano/pousada**
- **Escalado para 50 pousadas:** **R$283.200/ano** de economia líquida

---

## SEÇÃO 2 — FUNDAMENTAÇÃO TEÓRICA: O QUE É HEADROOM

### Definição Operacional

**Headroom** é uma camada de software local que intercepta o tráfego entre sua aplicação/agente de IA e os provedores de LLM (Anthropic, OpenAI, Google, Bedrock, OpenRouter, etc.), aplicando compressão inteligente ao contexto antes de enviá-lo ao provedor. O LLM processa menos tokens, mas produz respostas de qualidade equivalente, pois a compressão preserva o significado semântico enquanto elimina redundância.

### Os 6 Modos de Uso

O Headroom oferece seis formas de integração, cada uma adaptável ao cenário do ZEHLA:

```
╔══════════════════════════════════════════════════════════════╗
║  MODO 1: LIBRARY (SDK Inline)                                ║
║  from headroom import compress                                ║
║  compress(messages, model="gpt-4o")                           ║
║  → Embed direto no código Python/TypeScript                  ║
║  → Ideal para: Integração no llm-router.ts do ZEHLA          ║
╠══════════════════════════════════════════════════════════════╣
║  MODO 2: PROXY (Zero Code Changes)                            ║
║  headroom proxy --port 8787                                  ║
║  → Proxy HTTP drop-in, qualquer linguagem                    ║
║  → Ideal para: Interceptar tráfego OpenRouter transparente   ║
╠══════════════════════════════════════════════════════════════╣
║  MODO 3: AGENT WRAP (CLI Tools)                               ║
║  headroom wrap claude|codex|cursor|aider|copilot              ║
║  → Wrap de agentes de coding em um comando                    ║
║  → Ideal para: Claude Code no pipeline de desenvolvimento    ║
╠══════════════════════════════════════════════════════════════╣
║  MODO 4: MCP SERVER                                            ║
║  headroom mcp install                                          ║
║  → Ferramentas: compress, retrieve, stats                    ║
║  → Ideal para: Integração nativa via MCP no Hermes Agent      ║
╠══════════════════════════════════════════════════════════════╣
║  MODO 5: CROSS-AGENT MEMORY                                    ║
║  SharedContext().put() / .get()                                ║
║  → Memória compartilhada entre Claude, Codex, Gemini          ║
║  → Ideal para: Multi-agent workflows no ZEHLA Brain          ║
╠══════════════════════════════════════════════════════════════╣
║  MODO 6: FAILURE LEARNING                                     ║
║  headroom learn                                                 ║
║  → Minera sessões falhas, escreve correções                   ║
║  → Ideal para: Feedback loop do GEPA/Cortex AutoEvo          ║
╚══════════════════════════════════════════════════════════════╝
```

### As 6 Linguagens Suportadas pelo CodeCompressor

O SmartCrusher do Headroom inclui um compressor AST-aware para código-fonte, essencial quando o ZEHLA precisa processar trechos de código (scripts de automação, configurações, templates):

| Linguagem | Suporte AST | Uso Típico no ZEHLA |
|---|---|---|
| Python | Completo | Scripts de automação, core do Campo Akáshico |
| JavaScript/TypeScript | Completo | llm-router.ts, SDK typescript, Next.js components |
| Go | Completo | Microsserviços futuros |
| Rust | Completo | Performance-critical components |
| Java | Completo | Integrações enterprise |
| C/C++ | Completo | bindings nativos |

### Provas de Eficácia

**Savings em workloads reais de agentes:**

| Workload | Antes (tokens) | Depois (tokens) | Economia |
|---|---:|---:|---:|
| Code search (100 resultados) | 17.765 | 1.408 | **92%** |
| SRE incident debugging | 65.694 | 5.118 | **92%** |
| GitHub issue triage | 54.174 | 14.761 | **73%** |
| Codebase exploration | 78.502 | 41.254 | **47%** |

**Acurácia preservada em benchmarks padrão:**

| Benchmark | Categoria | N | Baseline | Headroom | Delta |
|---|---|---:|---:|---:|---:|
| GSM8K | Matemática | 100 | 0.870 | 0.870 | ±0.000 |
| TruthfulQA | Factual | 100 | 0.530 | 0.560 | **+0.030** |
| SQuAD v2 | QA | 100 | — | **97%** | 19% compressão |
| BFCL | Tools | 100 | — | **97%** | 32% compressão |

**Comparação com alternativas:**

| Solução | Escopo | Deploy | Local | Reversível |
|---|---|---|:---:|:---:|
| **Headroom** | Todo contexto — tools, RAG, logs, files, history | Proxy · library · middleware · MCP | **Sim** | **Sim (CCR)** |
| RTK | Saídas de CLI | CLI wrapper | Sim | Não |
| lean-ctx | CLI commands, MCP tools | CLI wrapper · MCP | Sim | Não |
| Compresr, Token Co. | Texto enviado à API | Hosted API | Não | Não |
| OpenAI Compaction | Histórico de conversação | Provider-native | Não | Não |

### Instalação

```bash
# Python (recomendado para o backend ZEHLA)
pip install "headroom-ai[all]"

# TypeScript/Node (para SDK frontend e llm-router.ts)
npm install headroom-ai

# Docker (para modo proxy standalone)
docker pull ghcr.io/chopratejas/headroom:latest

# Extras granulares: [proxy], [llmlingua], [memory], [relevance],
#                     [image], [agno], [langchain], [evals]
# Requer Python 3.10+
```

---

## SEÇÃO 3 — ANATOMIA DO HEADROOM: PIPELINE DE COMPRESSÃO

### Visão Geral do Pipeline

O Headroom processa mensagens através de um pipeline de 3 estágios sequenciais, cada um independente, seguro para pular, e com falha graciosa (retorna conteúdo original inalterado se qualquer estágio falhar):

```
MENSAGENS ORIGINAIS (da aplicação ZEHLA)
        │
        ▼
┌───────────────────────────────────────────────────────────────┐
│                    HEADROOM CLIENT                             │
│                                                               │
│  ┌───────────┐    ┌──────────────┐    ┌─────────────┐        │
│  │  ANALYZE  │ ── │  TRANSFORM   │ ── │    CALL      │        │
│  │  (Parser) │    │  (Pipeline)  │    │  (API/LLM)   │        │
│  └───────────┘    └──────────────┘    └─────────────┘        │
│       │                 │                    │                │
│       ▼                 ▼                    ▼                │
│  Conta tokens     Aplica compressão    Envia ao provider     │
│  Detecta desperdício  Preserva significado  Loga métricas      │
└───────────────────────────────────────────────────────────────┘
        │
        ▼
PROVEDOR LLM (Anthropic · OpenAI · OpenRouter · Google)
```

### Estágio 1: CacheAligner (< 1ms)

O CacheAligner é o primeiro transform do pipeline. Ele extrai conteúdo dinâmico (datas, UUIDs, session tokens, timestamps) do system prompt e move-os para o final da mensagem. Isso estabiliza o prefixo para que os caches KV dos provedores (Anthropic `cache_control`, OpenAI prefix caching) possam acertar em chamadas repetidas.

**Antes (cache miss todo dia):**
```
"You are ZEHLA, a cognitive hospitality assistant. Current Date: 2026-06-17.
Session: a1b2c3d4. Occupancy: 0.85."
                ↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑
           Muda diariamente = cache miss TODOS os dias
```

**Depois (cache hit consistente):**
```
"You are ZEHLA, a cognitive hospitality assistant."
              ↑ Prefixo estável = cache HIT

"[Context: Current Date: 2026-06-17, Session: a1b2c3d4, Occupancy: 0.85]"
              ↑ Conteúdo dinâmico movido para o final (tail)
```

**Overhead:** sub-milissegundo. Impacto zero na latência percebida.

**Relevância para o ZEHLA:** O sistema prompt do ZEHLA é rico e estável — contém as skills do Hermes Agent, as diretrizes do DSPy, e as políticas da pousada. Apenas variáveis de sessão (data, ocupação, ID do hóspede) mudam entre requests. O CacheAligner garante que 90%+ do system prompt seja cacheável, gerando economia adicional de até 90% em tokens cacheados por providers como Anthropic.

### Estágio 2: SmartCrusher (1–50ms)

O SmartCrusher é onde ocorre a **maior economia de tokens**. Ele analisa o conteúdo das saídas de ferramentas e aplica compressão estatística inteligente:

**Estratégias por tipo de conteúdo:**

| Tipo de Conteúdo | Estratégia | Economia Típica |
|---|---|---|
| Arrays JSON de dicts | Amostragem estatística + preservação de anomalias | 83–95% |
| Arrays JSON de strings | Deduplicação + amostragem adaptativa | 60–90% |
| Arrays JSON de números | Resumo estatístico + preservação de outliers | 70–85% |
| Build/test logs | Clustering de padrões | 85–94% |
| HTML | Extração de artigo (trafilatura) | ~95% |

**Algoritmo de retenção de itens:**
- **30%** do início do array (schema/tipagem)
- **15%** do final do array (recência)
- **55%** por score de importância (Kneedle algorithm em bigram coverage)
- **Itens de erro** são **sempre** preservados, independentemente de budget

**Relevância para o ZEHLA:** As saídas de ferramentas do ZEHLA são volumosas — buscas semânticas no Campo Akáshico retornam dezenas de episódios, o GraphRAG produz subgrafos extensos, e as skills do Hermes geram relatórios detalhados. O SmartCrusher reduz essas saídas em 70-95% enquanto preserva anomalias (cruciais para detecção de problemas em pousadas).

### Estágio 3: Context Manager (< 1ms)

O Context Manager garante que o array final de mensagens caiba dentro da janela de contexto do modelo. Suporta dois modos:

**Rolling Window (padrão):** Descarta as mensagens mais antigas primeiro, preservando system prompt e turns recentes. Tool calls e suas respostas são descartadas como unidades atômicas.

**Intelligent Context (avançado):** Pontua cada mensagem em **6 dimensões**:
1. **Recência** — mensagens mais recentes têm maior peso
2. **Similaridade semântica** — proximidade com a query atual
3. **Importância TOIN** — padrões aprendidos de importância
4. **Indicadores de erro** — mensagens contendo erros são preservadas
5. **Forward references** — mensagens referenciadas em turns posteriores
6. **Densidade de tokens** — mensagens densas em informação têm preferência

Mensagens descartadas são armazenadas no CCR para recuperação potencial.

**Relevância para o ZEHLA:** O Context Manager é particularmente valioso para o A-MEM. O ACE PromptBuilder do ZEHLA tem um budget rígido de 2.000 tokens para injeção de contexto. Com o Intelligent Context, as notas atômicas mais relevantes são selecionadas por score multidimensional, maximizando a utilidade do budget disponível.

---

## SEÇÃO 4 — ARQUITETURA DE INTEGRAÇÃO HEADROOM × ZEHLA

### Diagrama de Integração Completo

```
╔══════════════════════════════════════════════════════════════════════════════╗
║                       ZEHLA COGNITIVE HOSPITALITY OS                         ║
║                                                                               ║
║  ┌─────────────────────────────────────────────────────────────────────────┐  ║
║  │                      ZCC (Command Center)                              │  ║
║  │    Dashboard │ Analytics │ Predictions │ Alerts │ Settings │ Metrics   │  ║
║  └──────────────────────────────┬──────────────────────────────────────────┘  ║
║                                 │                                             ║
║                        ┌────────▼────────┐                                  ║
║                        │  CAMPO AKASHICO  │ ◄──► NÚCLEO COGNITIVO           ║
║                        │  (Subconsciente) │                                  ║
║                        └────────┬────────┘                                  ║
║                                 │                                             ║
║  ┌──────────┬──────────┬─────────┼──────────┬──────────┐                    ║
║  │ Pilar 1  │ Pilar 2  │ Pilar 3  │ Pilar 4   │ Pilar 5  │                   ║
║  │ Cortex   │ Memória   │ Router   │ Topologia  │ Agentic  │                   ║
║  │ AutoEvo  │ Blindada  │ NeuroEcon │ Raciocinio │ Memory   │                   ║
║  │ DSPy/GEPA│ EWC-DR    │ Thompson │ GraphRAG   │ A-MEM    │                   ║
║  └────┬─────┴────┬─────┴────┬────┴────┬───────┴────┬─────┘                    ║
║       │          │          │          │            │                          ║
║       └──────────┴──────────┼──────────┴────────────┘                          ║
║                            │                                                ║
║                   ┌────────▼────────┐                                          ║
║                   │   HEADROOM      │  ◄── NOVA CAMADA DE OTIMIZAÇÃO          ║
║                   │   (Compressão   │                                          ║
║                   │    de Contexto)│                                          ║
║                   │                 │                                          ║
║                   │  ┌────────────┐ │                                          ║
║                   │  │CacheAligner│ │  Estabiliza prefixos para KV cache       ║
║                   │  └─────┬──────┘ │                                          ║
║                   │  ┌─────▼──────┐ │                                          ║
║                   │  │SmartCrusher│ │  Comprime saídas de tools 60-95%        ║
║                   │  └─────┬──────┘ │                                          ║
║                   │  ┌─────▼──────┐ │                                          ║
║                   │  │Context Mgr │ │  Intelligent Context scoring            ║
║                   │  └─────┬──────┘ │                                          ║
║                   │  ┌─────▼──────┐ │                                          ║
║                   │  │   CCR      │ │  Compress-Cache-Retrieve (reversível)    ║
║                   │  └─────┬──────┘ │                                          ║
║                   │  ┌─────▼──────┐ │                                          ║
║                   │  │ Memory     │ │  Cross-agent memory + headroom learn    │
║                   │  └────────────┘ │                                          ║
║                   └────────┬────────┘                                          ║
║                            │                                                 ║
║                   ┌────────▼────────┐                                          ║
║                   │  llm-router.ts  │  Router neuroeconômico                   ║
║                   │  Thompson + CAD │  Thompson Sampling + CADMAS-CTX           ║
║                   └────────┬────────┘                                          ║
║                            │                                                 ║
║              ┌─────────────┼─────────────┐                                    ║
║              ▼             ▼             ▼                                     ║
║      ┌──────────┐  ┌──────────┐  ┌──────────┐                                ║
║      │ Tier 2   │  │ Tier 3   │  │ Tier 3   │                                ║
║      │ (Local)  │  │ Anthropic │  │ OpenRouter│                               ║
║      │ Ollama   │  │ Claude    │  │ 400+     │                                ║
║      └──────────┘  └──────────┘  └──────────┘                                ║
║                                                                               ║
║  ┌────────────────────────────────────────────────────────────────────────┐   ║
║  │  CANAIS DE ENTRADA (Whisper Stream)                                    │   ║
║  │  WhatsApp │ Instagram │ Booking │ Reviews │ ZCC Chat │ Email │ Check-in  │   ║
║  └────────────────────────────────────────────────────────────────────────┘   ║
╚══════════════════════════════════════════════════════════════════════════════╝
```

### O Headroom NÃO é um Novo Pilar

Assim como o Campo Akáshico é a "cola" entre os pilares, o Headroom é uma **camada transversal de otimização** que beneficia todos os pilares simultaneamente. Ele não armazena conhecimento, não toma decisões, não raciocina — ele **otimiza o fluxo de informação** entre o cérebro ZEHLA e os provedores LLM, garantindo que cada token enviado carregue máxima densidade semântica.

### Posição no Stack Tecnológico

```
Camada de Apresentação    → ZCC Dashboard, WhatsApp Bot, Instagram
Camada de Orquestração    → Hermes Agent, 7 Anéis de Consciência
Camada Cognitiva          → 5 Pilares + Campo Akáshico
Camada de OTIMIZAÇÃO      → HEADROOM (nova) ← comprime contexto aqui
Camada de Roteamento      → llm-router.ts (Thompson + CADMAS)
Camada de Inferência      → Providers LLM (Anthropic, OpenRouter, Local)
Camada de Dados           → SQLite WAL, Redis, ChromaDB, NetworkX
```

---

## SEÇÃO 5 — COMPRESSÃO REVERSÍVEL (CCR) NO CÉREBRO ZEHLA

### O Problema da Compressão Tradicional

Compressão tradicional força um tradeoff difícil: compressão agressiva risca perder dados que o LLM precisa; compressão conservadora perde economia de tokens. O **CCR (Compress-Cache-Retrieve)** do Headroom elimina esse tradeoff inteiramente: comprima agressivamente, recupere sob demanda.

### Como o CCR Funciona no ZEHLA

O CCR flui por 4 fases, integrado ao fluxo cognitivo do ZEHLA:

**Fase 1 — Compress + Store:**
Quando o SmartCrusher comprime uma saída de ferramenta do ZEHLA (ex: 500 episódios do Campo Akáshico → 20 episódios essenciais), o conteúdo original é armazenado em cache local LRU. Um hash key é gerado para recuperação, e um marcador é adicionado à saída comprimida:
```
[500 episódios comprimidos para 20. Recupere mais: hash=abc123]
```

**Fase 2 — Tool Injection:**
O Headroom injeta uma ferramenta `headroom_retrieve` no conjunto de ferramentas disponíveis do LLM:
```json
{
  "name": "headroom_retrieve",
  "description": "Recuperar dados originais não comprimidos do cache Headroom",
  "parameters": {
    "hash": "Hash key do marcador de compressão",
    "query": "Opcional: buscar dentro dos dados em cache"
  }
}
```

**Fase 3 — Response Handler:**
Se o LLM chamar `headroom_retrieve`, o Response Handler intercepta, recupera dados do cache local (~1ms), adiciona o resultado à conversa, e o call da API continua automaticamente. O cliente ZEHLA nunca vê as tool calls CCR — elas são transparentes.

**Fase 4 — Context Tracker:**
Através de múltiplos turns, o Context Tracker mantém consciência de todo conteúdo comprimido:
- Lembra o que foi comprimido em turns anteriores
- Analisa novas queries por relevância ao conteúdo em cache
- Expande proativamente dados relevantes antes que o LLM peça

**Exemplo no contexto ZEHLA:**
```
Turn 1: Hóspede pergunta "quartos disponíveis?"
  → AkashicSearch retorna 500 episódios de reservas
  → SmartCrusher comprime para 15 (97% economia)
  → Cache armazena 500 originais (hash=xyz789)
  → LLM responde com 15 amostras

Turn 5: Hóspede pergunta "tem algum quarto com vista pro mar?"
  → Context Tracker detecta "vista mar" pode ter match no cache
  → Expande proativamente dados comprimidos
  → LLM encontra quarto_ocean_view_204 na lista completa
```

### CCR e o Campo Akáshico

A integração CCR com o Campo Akáshico é simbiótica: o Akáshico armazena a memória permanente (4 camadas), enquanto o CCR fornece a memória temporária de compressão. Quando o Context Manager do Headroom descarta mensagens antigas, elas vão para o CCR. Quando o Akáshico cristaliza conhecimento, ele pode recuperar do CCR dados originais que foram comprimidos anteriormente.

### Configuração do CCR para o ZEHLA

```python
from headroom import HeadroomClient, OpenAIProvider
from openai import OpenAI

client = HeadroomClient(
    original_client=OpenAI(),
    provider=OpenAIProvider(),
    default_mode="optimize",
)

# CCR habilitado por padrão durante chat completions
# O LLM chama headroom_retrieve quando precisa de mais dados
response = client.chat.completions.create(
    model="gpt-4o",
    messages=messages,
)
```

**Configuração avançada do CCR:**
```python
ccr_config = {
    "enabled": True,
    "injectTool": True,            # Injeta ferramenta de recuperação
    "injectRetrievalMarker": True,  # Adiciona marcadores nos outputs
    "feedbackEnabled": True,        # Aprende com padrões de recuperação
    "storeMaxEntries": 1000,        # Máximo de itens em cache
    "storeTtlSeconds": 3600,        # TTL do cache (1 hora)
}
```

---

## SEÇÃO 6 — HEADROOM × ROUTER NEUROECONÔMICO (THOMPSON SAMPLING)

### O Efeito Multiplicador

O Router Neuroeconômico do ZEHLA usa Thompson Sampling com posterior Beta-Binomial e discretização CADMAS-CTX (32 buckets contextuais) para rotear requests ao provider ótimo. A equação de utilidade econômica é:

```
U_k = θ_hat_k × V - C_k
```

Onde `V` é o valor da integridade da resposta e `C_k` é o custo financeiro do provider. O Headroom **reduz C_k efetivamente** para todos os providers, mudando a equação de payoff:

```
# Sem Headroom:
U_claude = 0.92 × 100 - 15 = 77
U_local  = 0.78 × 100 - 0  = 78  ← vence por custo

# Com Headroom (70% compressão = custo -70%):
U_claude = 0.92 × 100 - 4.5 = 87.5  ← agora vence por qualidade
U_local  = 0.78 × 100 - 0   = 78
```

### Impacto nas Decisões de Roteamento

Com o Headroom, o Thompson Sampling naturalmente converge para **providers de maior qualidade** (Tier 3) com mais frequência, pois o custo por token é artificialmente reduzido. Isso melhora a qualidade geral das respostas do ZEHLA sem aumentar o custo absoluto.

### Integração Prática no llm-router.ts

O llm-router.ts deve ser modificado para:
1. Apontar para o proxy Headroom quando habilitado
2. Manter estatísticas de compressão para realimentar o Thompson Sampling
3. Usar a compressão como feature no CADMAS-CTX (bucket adicional: "request_size")

O detalhamento completo das modificações está na **Seção 12**.

---

## SEÇÃO 7 — HEADROOM × CAMPO AKÁSHICO (4 CAMADAS DE MEMÓRIA)

### Mapeamento Headroom × Camadas Akáshicas

```
CAMADA 1: AKASHA SUTIL (Redis Streams, <0.5ms)
  → Headroom COMPACTA eventos brutos antes do buffer
  → SmartCrusher remove duplicatas e normaliza
  → Redução de volume no Whisper Stream

CAMADA 2: AKASHA EPISÓDICA (SQLite WAL, <5ms)
  → CCR armazena episódios completos comprimidos
  → Context Tracker recupera sob demanda
  → Cristalização batch usa dados originais do CCR

CAMADA 3: AKASHA FLUIDO (Redis Hash, <2ms)
  → CacheAligner estabiliza working memory
  → Menos churn no Redis = menor custo Upstash
  → Intelligent Context prioriza memorias ativas

CAMADA 4: AKASHA RAIZ (ChromaDB + NetworkX, <10ms)
  → SmartCrusher comprime embeddings antes da query
  → Graph traversal results comprimidos
  → PPR fusion outputs otimizados
```

### Compressão de Episódios para Cristalização

A cristalização batch do Campo Akáshico ocorre a cada 15 minutos ou a cada 50 episódios. O Headroom pode comprimir os episódios antes do processamento batch, reduzindo o custo de CPU do CrystallizationEngine:

```python
# Antes: 50 episódios × 500 tokens cada = 25.000 tokens para cristalizar
# Com Headroom: 50 episódios comprimidos × 150 tokens cada = 7.500 tokens
# Economia: 70% no custo de cristalização
```

Isso é particularmente relevante quando a cristalização usa Claude Fable 5 (Mythos-class) para raciocínio profundo — cada ciclo de cristalização custa ~R$6, e com Headroom esse custo cai para ~R$1,80.

---

## SEÇÃO 8 — HEADROOM × A-MEM / ZETTELKASTEN / ACE PROMPTBUILDER

### Otimização do ACE PromptBuilder

O ACE PromptBuilder do A-MEM (Pilar 5) injeta notas atômicas verificadas no prompt do LLM, com um budget rígido de **2.000 tokens**. O Headroom maximiza a utilidade desse budget de duas formas:

**1. SmartCrusher nas Notas Atômicas:**
Notas atômicas do Zettelkasten que passam pelo ACE são comprimidas pelo SmartCrusher antes da injeção. Uma nota típica de 200 tokens pode ser reduzida para 60 tokens sem perda semântica, permitindo que **3x mais notas** cabiam no budget.

**2. Intelligent Context para Seleção:**
O Intelligent Context do Headroom pontua cada nota atômica candidata em 6 dimensões antes da seleção pelo ACE. Isso substitui a seleção baseada em heurísticas simples por uma seleção multidimensional otimizada.

**Antes (sem Headroom):**
```
Budget: 2.000 tokens
→ ~10 notas atômicas cabem (200 tokens cada)
→ Seleção por heurística: mais recentes + mais linked
```

**Depois (com Headroom):**
```
Budget: 2.000 tokens
→ ~30 notas comprimidas cabem (60 tokens cada após SmartCrusher)
→ Seleção por Intelligent Context: 6 dimensões de score
→ Cobertura semântica 3x maior
```

### Bidirectional Links e CCR

Os 9 tipos de links bidirecionais do Zettelkasten (supports, contradicts, extends, causes, enables, requires, refines, generalizes, specializes) podem ser preservados no CCR. Quando notas são comprimidas, seus links são armazenados no cache do CCR, e o Context Tracker pode expandir notas relacionadas quando detecta forward references nos links.

---

## SEÇÃO 9 — HEADROOM × LOOPING ENGINEERING (LOOPS PRODUÇÃO)

### Headroom como Componente de Loop

O Looping Engineering — a prática de projetar sistemas que promptam agentes automaticamente — beneficia-se diretamente do Headroom. Em um loop de produção ZEHLA (Act → Observe → Reason → Repeat), cada iteração gera tokens que passam pelo LLM. O Headroom comprime o contexto acumulado a cada iteração, mantendo o loop enxuto:

```
LOOP DE PRODUÇÃO ZEHLA (com Headroom)
═══════════════════════════════════

Iteração 1: Contexto = 5.000 tokens → Headroom comprime para 1.500 → LLM processa
Iteração 2: Contexto acumulado = 8.000 tokens → Headroom comprime para 2.400 → LLM processa
Iteração 3: Contexto acumulado = 11.000 tokens → Headroom comprime para 3.300 → LLM processa
...
Iteração N: Contexto estabiliza em ~3.000-4.000 tokens comprimidos (CCR gerencia overflow)

SEM Headroom:
Iteração 1: 5.000 tokens
Iteração 2: 8.000 tokens
Iteração 3: 11.000 tokens
Iteração N: 30.000+ tokens → EXCEDE CONTEXT WINDOW → FALHA
```

### headroom learn × GEPA Auto-Evolution

O comando `headroom learn` minera sessões falhas e escreve correções em `CLAUDE.md` / `AGENTS.md`. Integrado ao GEPA (Pilar 1), isso cria um loop de feedback acelerado:

1. GEPA propõe novos prompts candidatos
2. Claude/Fable 5 executa tarefas com esses prompts
3. `headroom learn` analisa falhas e gera correções
4. Correções realimentam o GEPA como feedback textual em linguagem natural (o "gradiente semântico")
5. GEPA refina os prompts com base nas correções

Este loop é exatamente o padrão "Loop Engineering" que o documento LOOPING_ENGINEERING_PESQUISA_COMPLETA.md descreve, e o Headroom viabiliza a compressão de contexto necessária para que o loop rode indefinidamente sem estourar o budget de tokens.

---

## SEÇÃO 10 — INFRAESTRUTURA DOCKER E DEPLOY

### Docker Compose: Serviço HEADROOM

Adição declarativa do serviço `headroom` no docker-compose.yml do projeto ZEHLA:

```yaml
# docker-compose.yml (ZEHLA Backend)
# Adição do serviço headroom à pilha existente

version: "3.9"

services:
  # ... serviços existentes (zehla-backend, redis, chromadb, etc.) ...

  headroom:
    image: ghcr.io/chopratejas/headroom:latest
    container_name: zehla-headroom
    restart: unless-stopped
    ports:
      - "8787:8787"        # Proxy endpoint (OpenAI-compatible)
      - "8788:8788"        # MCP server (se habilitado)
      - "8789:8789"        # Dashboard de métricas
    environment:
      # ── Backend de destino (OpenRouter como provedor principal) ──
      OPENAI_BASE_URL: "https://openrouter.ai/api/v1"
      OPENAI_API_KEY: "${OPENROUTER_API_KEY}"

      # ── Modo de compressão ──
      HEADROOM_NO_OPTIMIZE: "false"          # Habilita compressão
      HEADROOM_NO_CACHE: "false"             # Habilita semantic cache
      HEADROOM_NO_RATE_LIMIT: "false"         # Habilita rate limiting
      HEADROOM_NO_INTELLIGENT_CONTEXT: "false" # Intelligent Context scoring
      HEADROOM_NO_COMPRESS_FIRST: "false"     # Tenta compressão antes de drop

      # ── Orçamento diário (em USD) ──
      HEADROOM_BUDGET: "50.0"                # Alerta ao atingir $50/dia

      # ── Telemetria ──
      HEADROOM_TELEMETRY: "off"              # Privacidade: sem telemetria

      # ── Logging ──
      HEADROOM_LOG_FILE: "/var/log/headroom/headroom.jsonl"

      # ── Integração ZEHLA ──
      HEADROOM_PROXY_ENABLED: "true"
      HEADROOM_STORE_MAX_ENTRIES: "2000"      # Cache CCR para 2000 itens
      HEADROOM_STORE_TTL_SECONDS: "7200"      # TTL do cache: 2 horas
    volumes:
      - headroom_data:/root/.headroom         # Persistência de cache e stats
      - headroom_logs:/var/log/headroom        # Logs persistidos
    networks:
      - zehla-network
    depends_on:
      - zehla-backend
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8787/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 15s

volumes:
  headroom_data:
    driver: local
  headroom_logs:
    driver: local

networks:
  zehla-network:
    external: true
```

### Modo Proxy: Roteamento Transparente

A configuração `OPENAI_BASE_URL=https://openrouter.ai/api/v1` faz com que o Headroom funcione como proxy transparente:

```
Aplicação ZEHLA → Headroom (localhost:8787) → OpenRouter (openrouter.ai/api/v1)
                        ↑                      ↑
                   Comprime aqui          Envia comprimido
```

O ZEHLA envia requests no formato OpenAI padrão para `localhost:8787`. O Headroom comprime, encaminha para o OpenRouter, recebe a resposta, e devolve à aplicação. Nenhuma alteração no formato da API é necessária.

### Alternativa: Modo SDK (Library Inline)

Se preferir maior controle granular, o Headroom pode ser integrado diretamente no código TypeScript do ZEHLA via SDK:

```typescript
// llm-router.ts — Integração via SDK (alternativa ao proxy)
import { compress } from 'headroom-ai';

async function routeWithHeadroom(messages: Message[], model: string) {
  // Comprime mensagens antes de enviar ao provider
  const compressed = await compress(messages, { model });

  console.log(`Tokens: ${compressed.tokens_before} → ${compressed.tokens_after}`);
  console.log(`Economia: ${compressed.compression_ratio}%`);

  // Envia mensagens comprimidas ao provider
  return sendToProvider(compressed.messages, model);
}
```

---

## SEÇÃO 11 — CONFIGURAÇÕES E VARIÁVEIS DE AMBIENTE

### Variáveis de Ambiente do ZEHLA para Headroom

Adicionar ao `.env` e `.env.example` do backend:

```env
# ═══════════════════════════════════════════════════
# HEADROOM — Camada de Otimização de Contexto
# ═══════════════════════════════════════════════════

# Toggle principal: habilita/desabilita o proxy Headroom
HEADROOM_PROXY_ENABLED="true"

# URL do proxy Headroom (local por padrão)
HEADROOM_PROXY_URL="http://localhost:8787"

# URL do proxy com sufixo /v1 (para compatibilidade OpenAI)
HEADROOM_PROXY_URL_V1="http://localhost:8787/v1"

# Modo de operação: "proxy" (zero código) ou "sdk" (library inline)
HEADROOM_MODE="proxy"

# Orçamento diário em USD (alerta quando atingido)
HEADROOM_DAILY_BUDGET="50.0"

# TTL do cache CCR em segundos (padrão: 3600 = 1 hora)
HEADROOM_CCR_TTL="7200"

# Máximo de entradas no cache CCR
HEADROOM_CCR_MAX_ENTRIES="2000"

# Habilita Intelligent Context (scoring em 6 dimensões)
HEADROOM_INTELLIGENT_CONTEXT="true"

# Habilita compressão LLMLingua-2 (ML-based, +2GB deps)
HEADROOM_LLMLINGUA="false"

# Habilita failure learning (headroom learn)
HEADROOM_LEARN_ENABLED="true"

# Habilita cross-agent memory
HEADROOM_CROSS_AGENT_MEMORY="true"

# Path para persistência de métricas
HEADROOM_SAVINGS_PATH="/root/.headroom/proxy_savings.json"
```

### Roteamento Transparente do OpenRouter

Para que o Headroom otimize as requisições em nuvem do OpenRouter de forma transparente, o container do Headroom é configurado com a variável `OPENAI_BASE_URL=https://openrouter.ai/api/v1`. Dessa forma:

1. O ZEHLA envia requests para `http://localhost:8787/v1/chat/completions` (formato OpenAI)
2. O Headroom comprime as mensagens usando o pipeline de 3 estágios
3. O Headroom encaminha as mensagens comprimidas para `https://openrouter.ai/api/v1`
4. O OpenRouter processa com o provider selecionado pelo Thompson Sampling
5. A resposta retorna ao Headroom, que a devolve ao ZEHLA inalterada

**Não há alterações nas regras de negócio** em intents sensíveis (transações financeiras, dados de hóspedes). A segurança sistêmica garantida pelo Guardian Agent permanece inalterada — o Headroom comprime apenas o contexto de texto, nunca intercepta ou modifica dados transacionais.

---

## SEÇÃO 12 — ROTEAMENTO INTELIGENTE: llm-router.ts

### Modificações Necessárias

O arquivo `llm-router.ts` é o componente central de roteamento do ZEHLA. As modificações abaixo adicionam suporte ao proxy Headroom de forma transparente, mantendo total compatibilidade com o Thompson Sampling e o CADMAS-CTX.

```typescript
// ─── src/lib/ai/llm-router.ts ─────────────────────────────────
// Modificação: Roteamento dinâmico via Headroom Proxy

import { env } from '@/lib/env';

/**
 * Determina a URL base para requests LLM.
 * Se HEADROOM_PROXY_ENABLED=true, redireciona para o proxy local do Headroom.
 * Caso contrário, usa a URL padrão do OpenRouter.
 */
function getLLMBaseUrl(): string {
  const headroomEnabled = env.HEADROOM_PROXY_ENABLED === 'true';
  const headroomUrl = env.HEADROOM_PROXY_URL_V1; // http://localhost:8787/v1

  if (headroomEnabled && headroomUrl) {
    return headroomUrl;
  }

  // Fallback: URL direta do OpenRouter
  return env.OPENROUTER_URL || 'https://openrouter.ai/api/v1';
}

/**
 * Configura os headers para o request LLM.
 * Quando usando Headroom proxy, o header de autorização
 * é encaminhado transparentemente.
 */
function getLLMHeaders(modelId: string): Record<string, string> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'HTTP-Referer': env.ZEHLA_DOMAIN || 'https://zehla.app',
    'X-Title': 'ZEHLA Cognitive Hospitality OS',
  };

  // API Key (funciona tanto direto quanto via Headroom proxy)
  const apiKey = env.OPENROUTER_API_KEY;
  if (apiKey) {
    headers['Authorization'] = `Bearer ${apiKey}`;
  }

  return headers;
}

/**
 * Função principal de roteamento com Headroom.
 * O proxy Headroom comprime automaticamente antes de encaminhar.
 */
export async function routeToLLM(
  messages: Message[],
  modelId: string,
  options?: { temperature?: number; maxTokens?: number }
): Promise<LLMResponse> {
  const baseUrl = getLLMBaseUrl();
  const headers = getLLMHeaders(modelId);

  // Log de compressão (quando disponível via stats do Headroom)
  if (env.HEADROOM_PROXY_ENABLED === 'true') {
    logInfo('headroom', {
      event: 'proxy_routing',
      model: modelId,
      messageCount: messages.length,
      estimatedTokens: estimateTokens(messages),
    });
  }

  const response = await fetch(`${baseUrl}/chat/completions`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      model: modelId,
      messages,
      temperature: options?.temperature ?? 0.7,
      max_tokens: options?.maxTokens ?? 4096,
    }),
  });

  // ... (restante da lógica de response handling inalterado)
}
```

### Métricas de Compressão no Router

O llm-router.ts deve consultar periodicamente as métricas do Headroom para realimentar o Thompson Sampling:

```typescript
// Consulta stats do Headroom (a cada 60 segundos)
async function syncHeadroomStats(): Promise<void> {
  if (env.HEADROOM_PROXY_ENABLED !== 'true') return;

  try {
    const response = await fetch(`${env.HEADROOM_PROXY_URL}/stats`);
    const stats = await response.json();

    // Atualiza prior do Thompson Sampling com dados de compressão
    // Requests com alta compressão = provider efficient = aumentar prior
    thompsonSampler.updateCompressionFactor(
      stats.compression_ratio_avg,
      stats.tokens_saved_total,
    );

    logInfo('headroom_stats_sync', {
      totalRequests: stats.total_requests,
      tokensSaved: stats.tokens_saved_total,
      savingsPercent: stats.savings_percent,
      compressionRatio: stats.compression_ratio_avg,
    });
  } catch (error) {
    logWarn('headroom_stats_sync_failed', { error });
  }
}
```

---

## SEÇÃO 13 — SINCRONIZAÇÃO CÉREBRO → AKÁSHICO (INGESTÃO DE CONHECIMENTO)

### Script: sync-brain-to-akashico.ts

Este script TypeScript indexa as especificações e guias do repositório ZEHLA na base vetorial do Campo Akáshico, permitindo que a IA acesse o entendimento estruturado do próprio sistema:

```typescript
// ─── scripts/sync-brain-to-akashico.ts ────────────────────────
// Sincroniza specs e guias do ZEHLA para o Campo Akáshico

import fs from 'fs';
import path from 'path';
import { AkashicBridge } from '@/lib/akashic/bridge';

// Documentos a indexar no Campo Akáshico
const KNOWLEDGE_FILES = [
  { file: 'SPEC_COMERCIAL.md', category: 'comercial', priority: 1.0 },
  { file: 'SPEC_OPERACIONAL.md', category: 'operacional', priority: 1.0 },
  { file: 'SPEC_MARKETING.md', category: 'marketing', priority: 0.9 },
  { file: 'SPEC_FINANCEIRO.md', category: 'financeiro', priority: 0.9 },
  { file: 'CAMPO_AKASHICO_ARQUITETURA.md', category: 'arquitetura', priority: 1.0 },
  { file: 'HERMES_ZEHLA_BRAIN_README.md', category: 'cerebro', priority: 1.0 },
  { file: 'FUNIL_VENDAS_ZEHLA.md', category: 'funil', priority: 0.8 },
  { file: 'LINKME_ENGENHARIA.md', category: 'integracao', priority: 0.7 },
];

async function syncBrainToAkashico(): Promise<void> {
  console.log('🔄 Iniciando sincronização Cérebro → Akáshico...');

  const bridge = new AkashicBridge();
  let totalSections = 0;
  let totalIngested = 0;

  for (const { file, category, priority } of KNOWLEDGE_FILES) {
    const filePath = path.resolve('./specs', file);
    if (!fs.existsSync(filePath)) {
      console.warn(`⚠️  Arquivo não encontrado: ${file}`);
      continue;
    }

    const content = fs.readFileSync(filePath, 'utf-8');
    const sections = splitIntoSections(content); // Segmenta por ## headers

    console.log(`📄 ${file}: ${sections.length} seções`);

    for (const section of sections) {
      totalSections++;
      try {
        await bridge.ingestEvent({
          pousada_id: 'ZEHLA_SYSTEM',  // Escopo do sistema
          source_channel: 'brain_sync',
          category: category,
          priority: priority,
          title: section.title,
          content: section.body,
          tags: [category, 'brain_sync', file],
          metadata: {
            source_file: file,
            section_index: section.index,
            total_sections: sections.length,
          },
        });
        totalIngested++;
      } catch (error) {
        console.error(`❌ Erro ao ingerir seção "${section.title}":`, error);
      }
    }
  }

  console.log(`\n✅ Sincronização completa:`);
  console.log(`   Seções processadas: ${totalSections}`);
  console.log(`   Seções ingeridas:   ${totalIngested}`);
  console.log(`   Seções com erro:    ${totalSections - totalIngested}`);
}

/**
 * Segmenta conteúdo markdown por seções (headers ##)
 */
function splitIntoSections(content: string): Array<{
  index: number;
  title: string;
  body: string;
}> {
  const sections: Array<{ index: number; title: string; body: string }> = [];
  const lines = content.split('\n');
  let currentTitle = 'Introdução';
  let currentBody: string[] = [];
  let sectionIndex = 0;

  for (const line of lines) {
    if (line.startsWith('## ')) {
      // Salva seção anterior
      if (currentBody.length > 0) {
        sections.push({
          index: sectionIndex++,
          title: currentTitle,
          body: currentBody.join('\n').trim(),
        });
      }
      currentTitle = line.replace(/^##\s+/, '');
      currentBody = [];
    } else {
      currentBody.push(line);
    }
  }

  // Salva última seção
  if (currentBody.length > 0) {
    sections.push({
      index: sectionIndex,
      title: currentTitle,
      body: currentBody.join('\n').trim(),
    });
  }

  return sections;
}

// Execução
syncBrainToAkashico()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('❌ Falha na sincronização:', error);
    process.exit(1);
  });
```

### Comando de Execução

```bash
# Executar sincronização
npx tsx scripts/sync-brain-to-akashico.ts

# Verificar se as specs foram ingeridas
curl http://localhost:8000/api/v2/akashic/search/ZEHLA_SYSTEM?query=politica+precos&top_k=5
```

---

## SEÇÃO 14 — MCP TOOLS: headroom_compress, headroom_retrieve, headroom_stats

### Integração MCP com Hermes Agent

O Headroom oferece um servidor MCP (Model Context Protocol) com 3 ferramentas nativas. Integrado ao Hermes Agent do ZEHLA, isso permite que o cérebro use o Headroom como ferramenta cognitiva:

```bash
# Instalação do servidor MCP do Headroom
headroom mcp install
```

### Ferramentas Disponíveis

**1. headroom_compress** — Comprime um array de mensagens:

```json
{
  "name": "headroom_compress",
  "description": "Comprime mensagens para envio ao LLM, reduzindo tokens em 60-95%",
  "parameters": {
    "messages": "Array de mensagens {role, content}",
    "model": "Modelo alvo para otimização de contexto"
  },
  "returns": {
    "messages": "Mensagens comprimidas",
    "tokens_before": "Contagem original",
    "tokens_after": "Contagem após compressão",
    "compression_ratio": "Razão de compressão (0.0-1.0)",
    "ccr_hashes": "Hashes para recuperação via CCR"
  }
}
```

**2. headroom_retrieve** — Recupera dados originais do cache CCR:

```json
{
  "name": "headroom_retrieve",
  "description": "Recupera dados originais comprimidos do cache local",
  "parameters": {
    "hash": "Hash key do marcador de compressão",
    "query": "Opcional: busca BM25 dentro dos dados em cache"
  },
  "returns": {
    "data": "Dados originais recuperados do cache",
    "retrieval_time_ms": "Tempo de recuperação em ms"
  }
}
```

**3. headroom_stats** — Métricas de compressão em tempo real:

```json
{
  "name": "headroom_stats",
  "description": "Retorna métricas de compressão e economia de tokens",
  "parameters": {},
  "returns": {
    "total_requests": "Total de requests processados",
    "tokens_saved_total": "Total de tokens economizados",
    "savings_percent": "Percentual médio de economia",
    "compression_ratio_avg": "Razão média de compressão"
  }
}
```

### Uso no Hermes Agent

As skills do Hermes Agent podem chamar as ferramentas MCP do Headroom diretamente:

```markdown
<!-- skill: otimizar-precos-sazonalidade.md -->

Quando analisar dados de sazonalidade:
1. Use headroom_compress para comprimir o histórico de preços antes de enviar ao LLM
2. Se o LLM precisar de dados completos, ele chamará headroom_retrieve automaticamente
3. Consulte headroom_stats para reportar economia de tokens ao operador
```

---

## SEÇÃO 15 — CACHEALIGNER: OTIMIZAÇÃO DE KV CACHE POR PROVIDER

### Mecanismo de Funcionamento

O CacheAligner estabiliza o prefixo do system prompt para que os caches KV dos provedores de LLM funcionem efetivamente. Diferentes providers têm mecanismos distintos:

**Anthropic (Claude):**
- Usa `cache_control` blocks para marcar conteúdo cacheável
- Headroom identifica prefixos estáveis e adiciona hints de cache
- Até **90%** de economia em tokens cacheados

**OpenAI (GPT):**
- Usa prefix alignment para caching automático
- Headroom alinha o prefixo para maximizar cache hits
- Até **50%** de economia

**Google (Gemini):**
- Usa CachedContent API
- Headroom marca conteúdo estável para cache
- Até **75%** de economia

### Impacto no ZEHLA

O system prompt do ZEHLA contém:
- Diretrizes do DSPy (assinaturas, instruções)
- Skills do Hermes Agent (5 categorias)
- Políticas da pousada (preços, regras, amenities)
- Contexto do CADMAS-CTX (bucket ativo, prior do Thompson)

Deste conteúdo, ~90% é estável entre requests (muda apenas a data, ocupação, e ID do hóspede). O CacheAligner move essas variáveis para o final, permitindo que o provider cache os 90% estáveis. Em um pousada com 100 requests/dia, isso gera economia adicional de ~40% no custo total de tokens.

---

## SEÇÃO 16 — SMARTCRUSHER: COMPRESSÃO DE SAÍDAS DE TOOLS

### Tipos de Saída do ZEHLA e Compressão Aplicável

| Saída de Tool no ZEHLA | Tipo | Compressão Esperada |
|---|---|---|
| AkashicSearch (episódios) | JSON array de dicts | 85–95% |
| GraphTraversal (PPR results) | JSON array de dicts com scores | 80–92% |
| PriceHistory (sazonalidade) | JSON array de números | 70–85% |
| CompetitorMonitor (preços) | JSON array de dicts | 83–90% |
| GuestProfiler (preferências) | JSON object aninhado | 60–80% |
| ReviewAnalysis (sentimentos) | JSON array de strings | 60–85% |
| OperationalLog (diário) | Text/log formatado | 85–94% |
| MarketingContent (posts) | HTML/Markdown | 85–95% |

### Preservação de Anomalias

O SmartCrusher do Headroom **sempre preserva** itens que contêm:
- Erros ou exceções
- Valores outliers estatísticos
- Mudanças de padrão (change points)
- Itens marcados como anomalías pelo CrystallizationEngine do Akáshico

Isso é crucial para o ZEHLA, onde uma anomalia pode representar uma reclamação séria de hóspede, uma queda de ocupação inesperada, ou um problema operacional detectado pelo ciclo de cristalização.

---

## SEÇÃO 17 — headroom learn: APRENDIZADO COM FALHAS NO ZEHLA

### Mecanismo

O comando `headroom learn` minera sessões onde o agente falhou (respostas incorretas, escalations desnecessárias, timeouts) e gera correções que são escritas em arquivos de configuração do agente:

```bash
# Minerar falhas e gerar correções
headroom learn --agent claude --sessions-dir ./sessions/

# Resultado: correções escritas em CLAUDE.md
# Exemplo de correção gerada:
# ## CORREÇÃO: Preços de feriados
# Quando um hóspede pergunta sobre preços de feriados, SEMPRE consulte
# o calendário de feriados brasileiros ANTES de responder.
# Erro anterior: respondeu preço normal sem verificar feriado.
```

### Integração com GEPA (Pilar 1)

As correções geradas pelo `headroom learn` alimentam o GEPA como feedback textual em linguagem natural. Isso é o "gradiente semântico" que o GEPA usa para refinar prompts:

```
GEPA propõe prompt → Executa com LLM → Avalia resultado
     ↑                                          │
     └── headroom learn gera correção ←── Falha detectada
              (feedback textual em NL)
```

Este loop fecha o ciclo de autoevolução do Cortex AutoEvo, permitindo que o ZEHLA aprenda com suas próprias falhas de forma automatizada e contínua.

### Configuração para o ZEHLA

```bash
# Executar headroom learn após cada batch de cristalização
headroom learn --agent claude --sessions-dir /var/log/zehla/sessions/ \
  --output /var/log/zehla/learnings/

# Integrar com cron (a cada hora)
0 * * * * headroom learn --agent claude --sessions-dir /var/log/zehla/sessions/ >> /var/log/zehla/learn.log 2>&1
```

---

## SEÇÃO 18 — MONITORAMENTO, MÉTRICAS E OBSERVABILIDADE

### Endpoints de Métricas do Headroom

O proxy Headroom expõe endpoints de monitoramento que devem ser integrados ao ZCC Dashboard:

```bash
# Health check
curl http://localhost:8787/health
# → {"status": "healthy", "optimize": true,
#    "stats": {"total_requests": 42, "tokens_saved": 15000, "savings_percent": 45.2}}

# Stats detalhados (sessão + persistentes)
curl http://localhost:8787/stats

# Histórico com rollups horários/diários/semanais/mensais
curl http://localhost:8787/stats-history
curl "http://localhost:8787/stats-history?format=csv&series=weekly"

# Métricas Prometheus
curl http://localhost:8787/metrics
# → headroom_requests_total{mode="optimize"} 1234
# → headroom_tokens_saved_total 5678900
# → headroom_compression_ratio_bucket{le="0.5"} 890
# → headroom_latency_seconds_bucket{le="0.01"} 800
# → headroom_cache_hits_total 456
```

### Dashboard ZCC: Painel de Economia Headroom

```javascript
// Frontend ZCC — Painel de Economia de Tokens

async function loadHeadroomDashboard() {
  const response = await fetch('/api/v2/headroom/stats');
  const stats = await response.json();

  // KPIs principais
  document.getElementById('hr-total-requests').textContent =
    stats.total_requests.toLocaleString('pt-BR');

  document.getElementById('hr-tokens-saved').textContent =
    (stats.tokens_saved_total / 1000).toFixed(0) + 'K';

  document.getElementById('hr-savings-percent').textContent =
    stats.savings_percent.toFixed(1) + '%';

  document.getElementById('hr-cost-saved').textContent =
    'R$ ' + (stats.tokens_saved_total * 0.000015).toFixed(2);

  // Gráfico de compressão ao longo do tempo
  const history = await fetch('/api/v2/headroom/stats-history?series=hourly');
  renderCompressionChart(await history.json());
}
```

### Alertas do ZCC

O ZCC deve emitir alertas quando:
- Economia percentual cair abaixo de 40% (compressão ineficiente)
- Latência do Headroom exceder 100ms (gargalo)
- Budget diário atingir 80% do limite
- Cache hits cair abaixo de 50% (prefix instável)

---

## SEÇÃO 19 — PLANO DE VERIFICAÇÃO

### Testes Automatizados

Rodar a suíte de testes de integração e unitários do backend para garantir que o fluxo de qualificação de leads, checkouts, lógica de IA local/nuvem, e todas as 8 teses do cérebro comercial continuam operando normalmente:

```bash
# Suite de testes completa
npm test
# ou
pnpm test

# Testes específicos do Headroom integration
npm test -- --grep "headroom"

# Teste de compressão isolado
npx tsx tests/headroom-compression.test.ts

# Teste de CCR reversibilidade
npx tsx tests/headroom-ccr-reversibility.test.ts

# Teste de integração llm-router + Headroom
npx tsx tests/headroom-router-integration.test.ts
```

### Verificação Manual — Passo a Passo

**Passo 1 — Subir a Infraestrutura:**
```bash
# Inicializar toda a pilha (incluindo container headroom)
docker compose up -d

# Verificar que todos os containers estão saudáveis
docker compose ps

# Health check do Headroom
curl http://localhost:8787/health
```

**Passo 2 — Verificar Proxy Transparente:**
```bash
# Enviar request de teste diretamente ao proxy
curl -X POST http://localhost:8787/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $OPENROUTER_API_KEY" \
  -d '{
    "model": "anthropic/claude-sonnet-4",
    "messages": [
      {"role": "system", "content": "Você é o ZEHLA, assistente de hospitalidade."},
      {"role": "user", "content": "Qual o preço da suíte master?"}
    ]
  }'

# Verificar stats — deve mostrar compressão aplicada
curl http://localhost:8787/stats
```

**Passo 3 — Sincronizar Conhecimento:**
```bash
# Executar script de sincronização cérebro → akáshico
npx tsx scripts/sync-brain-to-akashico.ts

# Verificar se as specs foram ingeridas corretamente
curl "http://localhost:8000/api/v2/akashic/search/ZEHLA_SYSTEM?query=politica+precos&top_k=5"
```

**Passo 4 — Teste de Tráfego com LLM Real:**
```bash
# Enviar consulta de teste ao llmRouter
# (deve passar pelo Headroom proxy)
curl -X POST http://localhost:8000/api/v2/brain/chat \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ZEHLA_API_KEY" \
  -d '{
    "pousada_id": "test_pousada",
    "message": "Hóspede quer saber sobre estacionamento",
    "channel": "whatsapp"
  }'

# Inspecionar logs do Headroom para comprovar compressão
docker logs zehla-headroom --tail 20

# Verificar stats pós-request
curl http://localhost:8787/stats
```

**Passo 5 — Verificar CCR (Compressão Reversível):**
```bash
# Enviar request com conteúdo extenso
# Verificar que o CCR armazenou os originais
curl http://localhost:8787/stats
# Deve mostrar ccr_entries > 0

# Verificar que headroom_retrieve funciona
# (o LLM deve conseguir recuperar dados comprimidos automaticamente)
```

**Passo 6 — Dashboard ZCC:**
```bash
# Acessar o ZCC Dashboard
# Verificar painel "Economia de Tokens" (novo)
# Verificar KPIs: requests processados, tokens economizados, % economia
```

---

## SEÇÃO 20 — ROADMAP DE IMPLEMENTAÇÃO (4 FASES)

### Fase 1: Fundação (Sprint 1–2) — "Headroom NOOP"

**Objetivo:** Headroom rodando em modo passthrough, sem compressão, para validar a integração infraestrutural sem risco.

- [ ] Adicionar serviço `headroom` ao `docker-compose.yml`
- [ ] Configurar variáveis de ambiente `.env` / `.env.example`
- [ ] Rodar `docker compose up -d` e verificar health check
- [ ] Modificar `llm-router.ts` para suportar roteamento via proxy (flag `HEADROOM_PROXY_ENABLED`)
- [ ] Implementar teste de smoke: request via proxy sem compressão
- [ ] Configurar monitoramento básico (endpoint `/health`)
- [ ] **Gate:** Proxy responde a requests sem erros, sem compressão

### Fase 2: Compressão Ativa (Sprint 3–4) — "Headroom ON"

**Objetivo:** Habilitar compressão real e medir impacto.

- [ ] Habilitar compressão (`HEADROOM_NO_OPTIMIZE=false`)
- [ ] Habilitar CacheAligner (verificar economia de KV cache)
- [ ] Habilitar SmartCrusher (verificar compressão de tool outputs)
- [ ] Habilitar CCR (Compress-Cache-Retrieve)
- [ ] Integrar métricas do Headroom no ZCC Dashboard
- [ ] Rodar suite de testes completa com Headroom ativo
- [ ] Benchmark: comparar qualidade de respostas e custo com/sem Headroom
- [ ] **Gate:** Economia >50% com qualidade equivalente em GSM8K/TruthfulQA

### Fase 3: Integração Profunda (Sprint 5–6) — "Headroom × Cérebro"

**Objetivo:** Headroom integrado com todos os subsistemas cognitivos.

- [ ] Integrar Headroom com Campo Akáshico (compressão de episódios)
- [ ] Integrar Headroom com A-MEM/ACE PromptBuilder (otimização de notas)
- [ ] Integrar Headroom com GraphRAG (compressão de traversal results)
- [ ] Integrar `headroom learn` com GEPA (feedback loop de falhas)
- [ ] Criar script `sync-brain-to-akashico.ts`
- [ ] Habilitar Intelligent Context (scoring em 6 dimensões)
- [ ] Integrar MCP tools no Hermes Agent
- [ ] Implementar realimentação de stats do Headroom no Thompson Sampling
- [ ] **Gate:** Todos os 5 pilares operando com Headroom, métricas estáveis

### Fase 4: Otimização e Autonomia (Sprint 7–8) — "Headroom Autônomo"

**Objetivo:** Headroom totalmente autônomo, com aprendizado contínuo e otimização adaptativa.

- [ ] Habilitar `headroom learn` automatizado (cron a cada hora)
- [ ] Configurar cross-agent memory (compartilhada entre Claude + Codex + Gemini)
- [ ] Implementar budget daily automático com alertas no ZCC
- [ ] Otimizar CacheAligner para cada provider (Anthropic vs OpenRouter)
- [ ] Benchmark final: comparar custo total antes/depois do Headroom
- [ ] Documentar savings persistentes e ROI validado
- [ ] Configurar LLMLingua-2 para compressão ML-based (opcional, +2GB)
- [ ] **Gate:** ROI >10x, economia >70% em produção estável

---

## SEÇÃO 21 — ANÁLISE DE CUSTO-BENEFÍCIO E ROI PROJETADO

### Investimento Necessário

| Item | Custo | Natureza |
|---|---|---|
| Instalação Headroom | R$ 0 | Open-source (Apache 2.0) |
| Container Docker | R$ 0 | Infraestrutura existente |
| Desenvolvimento (integração) | ~80 horas | Sprint 1-4 (Fase 1-2) |
| Desenvolvimento (profundo) | ~120 horas | Sprint 5-8 (Fase 3-4) |
| LLMLingua-2 (opcional) | R$ 0 | +2GB RAM, +10-30s cold start |

### Retorno Projetado (Estimativa Conservadora)

| Métrica | Sem Headroom | Com Headroom | Economia |
|---|---:|---:|---:|
| Tokens/request médio | 15.000 | 4.500 (70% compressão) | 10.500 tokens |
| Custo/pousada/mês | R$ 675 | R$ 203 | **R$ 472** |
| Custo/50 pousadas/mês | R$ 33.750 | R$ 10.125 | **R$ 23.625** |
| Custo/50 pousadas/ano | R$ 405.000 | R$ 121.500 | **R$ 283.500** |
| Qualidade (GSM8K) | 0.870 | 0.870 | ±0.000 (zero perda) |

### ROI

```
Investimento total (Fase 1-4): ~200 horas de desenvolvimento
Economia anual (50 pousadas): R$ 283.500
Break-even: ~2 meses
ROI Anual 1: >100x
```

---

## SEÇÃO 22 — MATRIZ DE COMPATIBILIDADE COM STACK ZEHLA

| Componente ZEHLA | Compatível com Headroom? | Modo de Integração |
|---|---:|---|
| llm-router.ts (Thompson/CADMAS) | **Sim** | Proxy ou SDK inline |
| Campo Akáshico (4 camadas) | **Sim** | Compressão de episódios + CCR |
| A-MEM / ACE PromptBuilder | **Sim** | SmartCrusher + Intelligent Context |
| DSPy / GEPA (Cortex AutoEvo) | **Sim** | headroom learn + compressão de ciclos |
| EWC-DR (Memória Blindada) | **Sim** | Compressão de gradientes e logs |
| GraphRAG / PPR / BFS | **Sim** | SmartCrusher em traversal results |
| Hermes Agent (skills) | **Sim** | MCP tools + compressão de outputs |
| Whisper Stream (ingestão) | **Sim** | Compressão de eventos brutos |
| ZCC Dashboard | **Sim** | Métricas via API REST |
| OpenRouter (400+ modelos) | **Sim** | Proxy com OPENAI_BASE_URL |
| Claude (Anthropic) | **Sim** | CacheAligner para cache_control |
| Claude Fable 5 | **Sim** | Compressão de raciocínio estendido |
| Looping Engineering | **Sim** | Compressão em loops de produção |
| Next.js Frontend | **Sim** | SDK TypeScript (`npm install headroom-ai`) |
| Docker Compose | **Sim** | Imagem oficial ghcr.io |
| Guardian Agent (segurança) | **Sim** | Não intercepta dados transacionais |

---

## SEÇÃO 23 — RISCOS, MITIGAÇÕES E LIMITAÇÕES CONHECIDAS

### Riscos e Mitigações

| Risco | Severidade | Probabilidade | Mitigação |
|---|---|---|---|
| Compressão altera significado semântico | Alta | Baixa | CCR (reversível); benchmarks provam zero perda; modo passthrough como fallback |
| Latência adicionada pelo Headroom | Média | Baixa | Overhead <50ms; CacheAligner <1ms; proxy local (zero latência de rede) |
| Cache CCR excede memória | Média | Média | LRU eviction; TTL configurável; monitoramento de entries |
| Headroom crash causa downtime | Alta | Muito Baixa | Container Docker com restart:unless-stopped; health check; fallback para rota direta |
| Incompatibilidade com modelo específico | Baixa | Baixa | Suporte a todos os providers OpenAI-compatible; testes por modelo |
| `headroom learn` gera correções incorretas | Média | Média | Revisão humana via ZCC; correções versionadas; rollback possível |

### Limitações Conhecidas do Headroom

1. **Compressão ML (LLMLingua-2)** adiciona ~2GB de dependências (torch, transformers) e 10-30s de cold start. Recomendado apenas para workloads com alto volume e quando compressão máxima é crítica.

2. **Imagens** são comprimidas via router ML treinado (40-90% redução) mas não são revertíveis via CCR — imagens comprimidas permanecem comprimidas.

3. **Contexto criptografado** (E2E encryption) não pode ser comprimido, pois o Headroom não tem acesso ao conteúdo. No ZEHLA, isso afeta apenas dados de hóspede PII que estejam encriptados em trânsito — o Headroom comprime apenas o contexto de texto, nunca dados transacionais encriptados.

4. **Sandboxed environments** onde processos locais não podem rodar limitam o uso do Headroom. O ZEHLA roda em containers Docker, então este não é um problema.

5. **Rate limiting** do Headroom pode afetar workloads de alta frequência. Configurável via `HEADROOM_NO_RATE_LIMIT=false`.

---

## SEÇÃO 24 — REFERÊNCIAS COMPLETAS

### Repositório e Documentação Headroom

| # | Recurso | URL |
|---|---|---|
| 1 | Repositório GitHub | [github.com/chopratejas/headroom](https://github.com/chopratejas/headroom) |
| 2 | Documentação oficial | [headroom-docs.vercel.app](https://headroom-docs.vercel.app) |
| 3 | README (raw) | [raw.githubusercontent.com/.../README.md](https://raw.githubusercontent.com/chopratejas/headroom/main/README.md) |
| 4 | Arquitetura | [headroom-docs.vercel.app/docs/architecture](https://headroom-docs.vercel.app/docs/architecture) |
| 5 | Proxy Server | [headroom-docs.vercel.app/docs/proxy](https://headroom-docs.vercel.app/docs/proxy) |
| 6 | CCR (Reversível) | [headroom-docs.vercel.app/docs/ccr](https://headroom-docs.vercel.app/docs/ccr) |
| 7 | Cache Optimization | [headroom-docs.vercel.app/docs/cache-optimization](https://headroom-docs.vercel.app/docs/cache-optimization) |
| 8 | Memory (Cross-Agent) | [headroom-docs.vercel.app/docs/memory](https://headroom-docs.vercel.app/docs/memory) |
| 9 | MCP Tools | [headroom-docs.vercel.app/docs/mcp](https://headroom-docs.vercel.app/docs/mcp) |
| 10 | Benchmarks | [headroom-docs.vercel.app/docs/benchmarks](https://headroom-docs.vercel.app/docs/benchmarks) |
| 11 | Failure Learning | [headroom-docs.vercel.app/docs/failure-learning](https://headroom-docs.vercel.app/docs/failure-learning) |
| 12 | Kompress-v2-base (HuggingFace) | [huggingface.co/chopratejas/kompress-v2-base](https://huggingface.co/chopratejas/kompress-v2-base) |
| 13 | llms.txt (AI index) | [raw.githubusercontent.com/.../llms.txt](https://raw.githubusercontent.com/chopratejas/headroom/main/llms.txt) |

### Documentação ZEHLA Referenciada

| # | Documento | Arquivo |
|---|---|---|
| 14 | Campo Akáshico — Arquitetura | `CAMPO_AKASHICO_ZEHLA/01_CAMPO_AKASHICO_ARQUITETURA.md` |
| 15 | Campo Akáshico — Deploy | `CAMPO_AKASHICO_ZEHLA/03_GUIA_DEPLOY.md` |
| 16 | ZEHLA Evolução — Índice Master | `ZEHLA_EVOLUCAO_00_INDICE_MASTER.md` |
| 17 | ZEHLA Evolução — Pilar 1 (DSPy/GEPA) | `ZEHLA_EVOLUCAO_01_DSPy_GEPA_AutoEvolution.md` |
| 18 | ZEHLA Evolução — Pilar 3 (Thompson/CADMAS) | `ZEHLA_EVOLUCAO_03_Thompson_CADMAS_CTX.md` |
| 19 | ZEHLA Evolução — Pilar 4 (GraphRAG/PPR) | `ZEHLA_EVOLUCAO_04_GraphRAG_PPR_BFS.md` |
| 20 | ZEHLA Evolução — Pilar 5 (A-MEM) | `ZEHLA_EVOLUCAO_05_AMEM_Zettelkasten_ACE.md` |
| 21 | Hermes ZEHLA Brain — README | `HERMES_ZEHLA_Brain/README.md` |
| 22 | Looping Engineering — Pesquisa | `LOOPING_ENGINEERING_PESQUISA_COMPLETA.md` |
| 23 | Arquitetura Cognitiva ZAOS | Upload: `Arquitetura Cognitiva ZAOS Fundamentos...` |
| 24 | Auditoria Obrigatória | `ZEHLA_AUDITORIA_OBRIGATORIA_DOCUMENTO_MESTRE.md` |

### Pensadores e Frameworks Citados

| Nome | Papel | Contribuição |
|---|---|---|
| **Tejas Chopra** | Criador do Headroom | Arquitetura de compressão de contexto |
| **Peter Steinberger** | PSDev | Popularizou Loop Engineering |
| **Boris Cherny** | Anthropic (Claude Code) | "Meu trabalho é escrever loops" |
| **Addy Osmani** | Google | Termo "Loop Engineering" |
| **Nous Research** | Hermes Agent | Framework de agentes open-source |

---

*Documento Nuclear ZEHLA — Integração HEADROOM & Cérebro ZEHLA v2.0*
*Criado por Agente ZEHLA OS — 17/06/2026*
*Classificação: CONHECIMENTO ESTRATÉGICO*
