# LOOPING ENGINEERING — Pesquisa Avançada e Completa

**Versão**: 1.0 — Deep Research
**Data**: 16 de junho de 2026
**Classificação**: CONHECIMENTO ESTRATÉGICO — Aplicável ao ZEHLA OS + Google Antigravity
**Autoria**: Agente ZEHLA OS — Pesquisa Avançada
**Fontes**: 8 artigos técnicos + 6 buscas web + análise de vídeo

---

## ÍNDICE

```
SEÇÃO 1  ── O Que É Looping Engineering (Definição Precisa)
SEÇÃO 2  ── Os 4 Pilares: Grafo, Rubrica, Prompt, LLMs
SEÇÃO 3  ── Hardness: A Dureza do Loop
SEÇÃO 4  ── A Evolução: Prompt → Context → Harness → Loop Engineering
SEÇÃO 5  ── Anatomia de um Loop Produção
SEÇÃO 6  ── A Técnica Ralph: Onde Tudo Começou
SEÇÃO 7  ── Open vs Closed Loops
SEÇÃO 8  ── Os 3 Guardas de Segurança (Stop Conditions)
SEÇÃO 9  ── Agent Graph: Guided Determinism (Salesforce)
SEÇÃO 10 ── Rubric Engineering + Reinforcement Learning
SEÇÃO 11 ── Os 3 Níveis do Agent Loop (Oracle)
SEÇÃO 12 ── Loop Engineering no ZEHLA — Aplicação Prática
SEÇÃO 13 ── MOCK: NotebookLM + Google Antigravity — Loop Engineering
SEÇÃO 14 ── Fontes e Referências Completas
```

---

## SEÇÃO 1 — O QUE É LOOPING ENGINEERING (Definição Precisa)

### A Frase Que Mudou Tudo

Em junho de 2026, **Peter Steinberger** publicou uma frase que acumulou 2.2 milhões de visualizações no Twitter/X:

> *"You shouldn't be prompting coding agents anymore. You should be designing loops that prompt your agents."*

Dois dias depois, **Boris Cherny** (líder técnico do Claude Code na Anthropic) corroborou no palco:

> *"I don't prompt Claude anymore. I have loops that are running. They're the ones that are prompting Claude and figuring out what to do. My job is to write loops."*

E **Addy Osmani** (engenheiro do Google) popularizou o termo "Loop Engineering" como a camada de abstração acima de prompt engineering e context engineering.

### Definição Operacional

**Loop Engineering** é a prática de projetar o **sistema que prompta seu agente** em vez de promptá-lo manualmente. Você escreve um pequeno programa — às vezes um shell loop, às vezes um task agendado, às vezes algumas centenas de linhas de TypeScript — e esse programa é o que conversa com o modelo. Ele:

1. **Descobre** o próximo trabalho a fazer
2. **Despacha** a tarefa para o agente LLM
3. **Avalia** (grade) o que vem de volta usando uma rubrica
4. **Loga** o resultado
5. **Decide** se deve disparar novamente ou parar

O modelo não é mais um colaborador do outro lado de um chat. É uma **função que o programa chama** em um loop controlado.

### O Loop Central: Act → Observe → Reason → Repeat

No centro de qualquer loop está o mesmo ciclo de quatro passos:

```
    ┌──────────────────────────────────┐
    │                                  │
    ▼                                  │
┌────────┐    ┌──────────┐    ┌───────────┐
│  ACT   │───►│ OBSERVE  │───►│  REASON   │
│(agente │    │(feedback │    │(rubrica   │
│executa)│    │ resultado)│    │ avalia)   │
└────────┘    └──────────┘    └─────┬─────┘
     ▲                               │
     │              ┌────────────────┘
     │              │
     │         ┌────▼────┐
     └─────────│ REPEAT  │
               │(continua│
               │ ou para)│
               └─────────┘
```

Esse ciclo **act-observe-reason-repeat** é o núcleo irreducível. Todo o resto (agenda, worktrees, sub-agentes, arquivo de estado) é andaime em volta desse ciclo.

### Prompt Engineering vs Context Engineering vs Loop Engineering

A confusão entre os três termos é o primeiro erro que todo praticante comete. Eles são **camadas empilhadas**, não sinônimos:

| Camada | O Que Você Faz | Alavanca | Autonomia | Use Quando |
|---|---|---|---|---|
| **Prompt Engineering** | Escreve um bom prompt para um turno único | Qualidade da instrução | Nenhuma — você está na cadeira | Tasks one-shot, conteúdo, queries simples |
| **Context Engineering** | Configura o que entra na janela: docs, history, tool defs, instruções | O que rodeia o modelo | Média — passos predefinidos, modelo preenche lacunas | Pipelines estruturadas com formato conhecido |
| **Harness Engineering** | Projeta o ambiente onde um agente único roda: skills, plugins, ferramentas | O harness em volta do agente | Alta — roda em schedule, mas um agente por vez | Work autônomo com formato parcialmente conhecido |
| **Loop Engineering** | Projeta o **sistema que prompta o agente** por você: triggers, sub-agentes, rubricas, verificadores | O sistema inteiro que gera e verifica prompts | Máxima — roda em schedule até stopping condition | Trabalho aberto, iterativo, onde o caminho não é totalmente conhecido |

A Mudança Fundamental: a alavanca saiu da qualidade de um único prompt e foi para o **design do sistema que gera e verifica prompts**.

---

## SEÇÃO 2 — OS 4 PILARES: GRAFO, RUBRICA, PROMPT, LLMs

O usuário identificou corretamente os 4 pilares do Looping Engineering. Cada um é uma disciplina distinta, e a interação entre os 4 é o que torna o loop poderoso.

### Pilar 1 — GRAFO (Agent Graph / Topology)

**O que é**: A estrutura topológica do loop — nós (agentes/tarefas), arestas (transições), e estados (checkpoints). O grafo define **quem fala com quem, em que ordem, e sob que condições**.

**Fonte principal**: Salesforce Agentforce — "Agent Graph: Toward Guided Determinism with Hybrid Reasoning" (Phil Mui, SVP Engineering)

**Conceitos-chave**:

1. **Hybrid Reasoning**: Combina raciocínio LLM (probabilístico) com controle determinístico (grafos/FSMs). O LLM lida com a inteligência; o grafo garante a confiabilidade.

2. **Guided Determinism**: Em vez de depender de prompts para controlar o comportamento (o que leva a "doom prompting" — loop infinito de ajustar instruções e rezar por consistência), o grafo externaliza o raciocínio em estrutura de design-time. Resultados previsíveis apesar de LLMs estocásticos.

3. **Decomposição de Workflows**: Workflows complexos são quebrados em tarefas cognitivas menores, cada uma manejada por um sub-agente focado (para chitchat detection, query rewriting, form filling, etc.).

4. **Coordenação Multi-Agente**: Dois padrões como primitivos:
   - **Handoff**: Passa contexto completo entre agentes (como um atendente transferindo para especialista)
   - **Delegation**: Um orquestrador "concierge" delega subtarefas para especialistas e sintetiza os retornos

5. **Solving "Drop-Off"**: O problema clássico onde o agente perde o objetivo principal quando o usuário faz perguntas tangenciais. O grafo resolve isso gerenciando estados persistentes e rastreando explicitamente o objetivo primário, o histórico, e a posição atual na conversa.

**Implementação prática**:
```
Grafo de Loop para ZEHLA:

[TRIGGER] ──► [DISCOVERY] ──► [PLANNING] ──► [EXECUTION]
     ▲                                       │
     │                                       ▼
[MEMORY] ◄── [VERIFICATION] ◄── [SUBMISSION]
     │
     └──► (próximo ciclo ou HALT)
```

**Lição do Salesforce**: "Most agent designers today over-emphasize prompt tweaking. That leaves out topology optimization opportunities." A topologia importa mais que o prompt.

### Pilar 2 — RUBRICA (Rubric Engineering)

**O que é**: O sistema de pontuação automatizado que mede objetivamente a qualidade da saída de um agente contra um conjunto de metas definidas. A rubrica é o **coração do loop** — sem ela, o loop não sabe quando parar.

**Fonte principal**: "Beyond Prompts: How Rubrics and Reinforcement Learning are Building Smarter AI Agents" (Mustafa Genc, TUM/Medium)

**Conceitos-chave**:

1. **Definir "Vitória"**: A rubrica operacionaliza um objetivo vago ("escreva bom código") em uma pontuação concreta e mensurável. Sem rubrica, "done" é uma alegação, não uma prova.

2. **Critérios Múltiplos**: Uma boa rubrica avalia em múltiplas dimensões:
   - **Corretude**: Os testes passam? (peso maior)
   - **Manutenibilidade**: Style check (flake8), complexidade ciclomática
   - **Eficiência**: Complexidade vs performance
   - **Aderência**: Segue as convenções do projeto?

3. **Cheat-Proof**: A rubrica deve ser resistente a "gaming" — o agente não pode maximizar a pontuação fazendo algo trivial que não atende o objetivo real.

4. **Separation of Writer and Reviewer**: O loop mais produtivo é separar quem faz do quem avalia. Um agente (ou cadeia de sub-agentes) faz a mudança; um agente **diferente**, frequentemente em um modelo mais barato, avalia contra as regras do projeto e os testes. O avaliador não precisa ser mais inteligente — só precisa ser diferente, com suas próprias instruções e sua própria rubrica.

**Implementação Python** (adaptado de Mustafa Genc):
```python
class CodeQualityRubric:
    """Rubrica automatizada para pontuar código gerado por IA."""

    def evaluate(self, generated_code: str, test_suite) -> dict:
        score = 0.0

        # Critério 1: Corretude (peso 40%)
        test_results = run_code_in_sandbox(generated_code, test_suite)
        pass_rate = test_results.passed / test_results.total
        correctness_score = pass_rate * 0.4

        # Critério 2: Estilo e Manutenibilidade (peso 25%)
        style_score = check_style_with_flake8(generated_code)  # 1.0 ou 0.0
        maintainability_score = style_score * 0.25

        # Critério 3: Eficiência (peso 20%)
        complexity = calculate_cyclomatic_complexity(generated_code)
        efficiency_score = max(0, 1.0 - (complexity / 10.0)) * 0.2

        # Critério 4: Aderência às convenções (peso 15%)
        convention_score = check_conventions(generated_code) * 0.15

        total = correctness_score + maintainability_score + efficiency_score + convention_score

        return {
            "total_score": total,
            "correctness": correctness_score,
            "maintainability": maintainability_score,
            "efficiency": efficiency_score,
            "conventions": convention_score,
            "passed": total >= 0.8,  # Threshold de aprovação
        }
```

### Pilar 3 — PROMPT (Prompt Design para Loops)

**O que é**: Dentro de um loop, o prompt não é mais uma mensagem única que você escreve. É um **template gerado pelo sistema** que varia a cada iteração com base no estado atual, no histórico de tentativas anteriores, e nos resultados da rubrica.

**Mudança fundamental**: Em prompt engineering tradicional, você escreve cada prompt. Em loop engineering, o **sistema gera os prompts**. Seu trabalho é projetar o template e os parâmetros que o sistema usa para montar cada prompt.

**O Prompt como Contrato**: No Claude Code e Codex, a comunidade convergiu para escrever stop conditions como contratos, não desejos:

```
❌ FRACO (desejo vago):
"Melhore a cobertura de testes"

✅ FORTE (contrato verificável):
"Todos os testes em test/auth/ passam (pytest sai 0)
e o coverage report confirma mínimo de 80%
Não modifique APIs públicas nem delete testes existentes
Pare após 25 turnos ou $5, o que vier primeiro"
```

### Pilar 4 — LLMs (Modelos como Funções no Loop)

**O que é**: No contexto de loop engineering, LLMs não são "colaboradores inteligentes" — são **funções callable** que o programa invoca dentro do loop. A escolha do modelo é uma decisão de custo/benefício por tarefa dentro do loop.

**Boas Práticas de Alocação de Modelos**:

| Tarefa no Loop | Modelo Recomendado | Por Quê |
|---|---|---|
| Geração/Criação (writer) | Modelo forte (Claude Opus, GPT-4o) | Precisa de raciocínio profundo |
| Verificação/Avaliação (reviewer) | Modelo médio (Claude Sonnet, GPT-4o-mini) | Só precisa ser diferente e barato |
| Classificação/Triage | Modelo leve (Claude Haiku, GPT-4o-mini) | Alta velocidade, baixo custo |
| Embeddings/Memória | Modelo de embeddings | Vectorização para busca semântica |

**Insight do Claude Code**: Boris Cherny não usa um modelo único. Ele usa modelos diferentes para diferentes papéis dentro do loop. O writer recebe um prompt rico; o reviewer recebe o diff + a rubrica + as regras do projeto. São instâncias diferentes, com instruções diferentes, avaliando de perspectivas diferentes.

---

## SEÇÃO 3 — HARDNESS: A DUREZA DO LOOP

### O Que É Hardness

**Hardness** é o conceito de **quão rigoroso** é o loop — o quão difícil é para o agente "passar" sem realmente ter feito o trabalho. Um loop "soft" aceita quase qualquer coisa; um loop "hard" exige evidência verificável.

### Os Níveis de Hardness

```
    ┌─────────────────────────────────────────┐
    │        ESPECTRO DE HARDNESS DO LOOP       │
    ├─────────────────────────────────────────┤
    │                                          │
    │  SOFT ────── MEDIUM ────── HARD          │
    │                                          │
    │  [Sem rubrica]  [Rubrica    ] [Rubrica + │
    │  [Sem verifier]  básica    ] [ Verifier  │
    │  [Stop manual]  [Stop auto ] [ Stop +    │
    │                             |  Diff Check│
    │                             |  Budget Cap│
    │                             |  Sep Writer │
    │                             |  /Reviewer │
    │                                          │
    └─────────────────────────────────────────┘
```

**SOFT (Loop Fraco)**:
- Sem rubrica definida
- O agente decide quando parar
- Sem verificador separado
- Resultado: "o agente sempre acha que terminou"

**MEDIUM (Loop Moderado)**:
- Rubrica básica com critérios claros
- Stop condition automática simples
- Um único modelo faz tudo (writer + reviewer)
- Resultado: funcional, mas propenso a auto-engano

**HARD (Loop Rígido — Produção)**:
- Rubrica multi-critério com threshold
- Verificador separado (modelo diferente do writer)
- Diff check (para se últimos passes não mudaram nada)
- Budget cap (tokens ou dólares)
- Iteration cap (teto máximo de iterações)
- Separação writer/reviewer
- Memory persistente em disco

**Por Que Hardness Importa**: Greg Brockman (OpenAI) fez o ponto mais eloquente: *"As models keep getting more capable, the bottleneck on output stops being the model and starts being the taste of the person directing it."*

Um loop sem taste (gosto/saber) atrás dele é uma máquina de gerar erros confiantes em velocidade industrial. A rubrica, as skills, e o step de verificação precisam refletir **saber real** — o que "bom" significa no seu codebase, quais edge cases importam, quando algo está realmente pronto para ship vs tecnicamente passando.

### A Regra de Ouro da Hardness

> *A loop multiplies whatever judgment you put into the rubric, the skills, and the verification step. When they reflect real taste, the loop compounds in the right direction. When they don't, you've just built a faster way to ship work that wasn't worth doing.*

---

## SEÇÃO 4 — A EVOLUÇÃO: PROMPT → CONTEXT → HARNESS → LOOP ENGINEERING

### Timeline de Evolução

```
2023 ─── PROMPT ENGINEERING
  │      "Como escrever um bom prompt"
  │      One-shot, few-shot, chain-of-thought
  │
2024 ─── CONTEXT ENGINEERING
  │      "O que colocar na janela do contexto"
  │      RAG, retrieval, system prompts estruturados
  │
2025 ─── HARNESS ENGINEERING
  │      "O ambiente onde o agente roda"
  │      Skills, plugins, worktrees, connectors
  │
2026 ─── LOOP ENGINEERING
         "O sistema que prompta o agente por você"
         Automations, sub-agentes, rubricas, verificadores
```

### Cada Camada Empilha a Anterior

Nenhuma camada substitui a anterior. Um loop é **construído de prompts** — um prompt ruim dentro de um loop só produz trabalho ruim mais rápido. Context engineering não desaparece — o loop ainda precisa colocar os arquivos certos, history e tool definitions na frente do modelo a cada turno.

O que loop engineering adiciona é a **estrutura de controle autônomo** em volta de tudo isso.

---

## SEÇÃO 5 — ANATOMIA DE UM LOOP PRODUÇÃO

### Os 5 Building Blocks + Memory

Todo loop que sobrevive ao contato com produção resolve o mesmo conjunto de problemas. Os nomes diferem entre Claude Code e OpenAI Codex, mas as responsabilidades são idênticas:

#### Block 1 — AUTOMATIONS (O Coração / Heartbeat)
O que dispara o loop sem você digitar nada.
- **Claude Code**: `/loop`, `/goal`, scheduling, hooks, GitHub Actions
- **OpenAI Codex**: Automations tab (repo, prompt, schedule, sandbox, Triage inbox)

#### Block 2 — WORKTREES (Isolamento)
Para que dois agentes rodando em paralelo não colidam nos mesmos arquivos.
- Git worktrees: cada agente recebe sua própria branch e working copy
- Sem worktrees: race condition e merge thrashing

#### Block 3 — SKILLS (Conhecimento Codificado)
Como escrever o conhecimento do projeto que o agente não precisa redescobrir a cada sessão.
- Um folder com um markdown frontmatter + instruções
- O agente carrega a skill quando a description no frontmatter match a tarefa
- Escreva a description como uma tagline, não um manifesto

#### Block 4 — CONNECTORS & PLUGINS (Integração Externa)
Como o loop alcança o resto do seu stack.
- Issue tracker, staging API, data warehouse, Slack, monitoring
- Rodam em MCP (Model Context Protocol) — compatível entre Claude Code e Codex
- Plugins = conectores + skills empacotados

#### Block 5 — SUB-AGENTS (Divisão de Trabalho)
O padrão que mais rapidamente se paga: **separar o writer do reviewer**.
- Writer: faz a mudança
- Reviewer: avalia contra rubrica + testes (modelo diferente, mais barato)
- O reviewer não precisa ser mais inteligente — só precisa ser diferente

#### Block 6 — MEMORY (Persistência)
Nenhum dos acima importa se o loop não lembra o que fez ontem.
- Formato: markdown checklist, JSON file, Linear board, SQLite
- Cada run lê no início, appenda no final
- O agente esquece. O repositório não esquece.

### Diagrama Completo

```
[TRIGGER / AUTOMATION]
         │
         ▼
[DISCOVERY & TRIAGE] ←── (skills + memory)
         │
         ▼
[WRITER SUB-AGENT] ←── (worktree isolado)
         │
         ▼
[REVIEWER SUB-AGENT] ←── (rubrica + testes)
         │
    ┌────┴────┐
    │         │
  PASS      FAIL
    │         │
    ▼         ▼
[CONNECTORS] [LOG + RETRY]
(Open PR,   (atualizar memory,
 Slack, CI)  tentar novamente)
    │         │
    ▼         └──► (voltar ao discovery)
[HALT ou PRÓXIMO CICLO]
```

---

## SEÇÃO 6 — A TÉCNICA RALPH: ONDE TUDO COMEÇOU

### Origem

Antes de alguém chamar de "loop engineering", havia **Ralph**. No início de 2026, **Geoffrey Huntley** descreveu rodar um coding agent dentro de um loop shell simples:

1. Alimente o agente com o mesmo prompt contra uma spec escrita
2. Deixe-o pegar uma tarefa e implementar
3. Inicie uma instância nova e alimente o prompt idêntico novamente
4. Repita até o trabalho estar feito

Ele nomeou em homenagem a **Ralph Wiggum** (Os Simpsons) porque a técnica é "deterministicamente simples em um mundo imprevisível". Parece idiota demais para funcionar. Funciona.

### O Insight Não-Óbvio: Context Reset

Uma sessão longa de agente degrada conforme a janela enche com reasoning antigo, becos sem saída, e conteúdo de arquivos obsoleto. Ralph resolve isso: **cada iteração é um agente novo com contexto limpo** que lê o estado atual do repositório e da task list do disco, faz exatamente uma unidade de trabalho, comita, e sai.

A inteligência não vive em uma única execução heroica. Vive em especificações claras, granulares, e resultados verificáveis, aplicados repetidamente contra uma memória externa que o modelo não pode poluir.

### O Código Original do Ralph

```bash
# O loop Ralph original: mesmo prompt, contexto fresco, até terminar
while ! grep -q "ALL TASKS DONE" STATUS.md; do
  # cada pass é um agente totalmente novo com janela vazia
  claude -p "Read PLAN.md and STATUS.md. Pick the next unchecked
  task, implement it, run the tests, commit on success,
  and update STATUS.md. Then stop." \
  --dangerously-skip-permissions

  # PLAN.md e STATUS.md são a memória durável.
  # O agente esquece tudo entre passes; os arquivos lembram.
done
```

### Loop Engineering é Ralph, Productizado

Ralph é a prova de conceito de que você não precisa de um harness sofisticado — só persistência, um arquivo de estado externo, e critérios de parada verificáveis. Loop engineering é o que acontece quando essas ideias exatas se movem para dentro das ferramentas: o loop vira automação agendada, o context reset vira worktree + sub-agente, e o "ALL TASKS DONE" vira uma condition avaliada por um modelo separado.

---

## SEÇÃO 7 — OPEN VS CLOSED LOOPS

### A Distinção Mais Útil para Escolher a Forma do Loop

**Open Loops** trocam estrutura por superfície. Você entrega ao agente um alvo + guardrails e deixa ele escolher a própria rota através do problema. Ótimo para prototipação ou terreno desconhecido. A armadilha: se os padrões do projeto são vagos, a saída é principalmente ruído.

**Closed Loops** invertem o contrato. Você mapeia a rota primeiro — o que cada passo faz, como é verificado, quando o loop tem permissão de parar — e os agentes iteram dentro desse scaffolding. O custo runtime permanece previsível, e os resultados tendem a melhorar com o tempo porque cada run é avaliada contra a mesma rubrica.

### Quando Usar Cada

| Critério | Open Loop | Closed Loop |
|---|---|---|
| **Fase do projeto** | Descoberta / Exploração | Produção / Otimização |
| **Certeza do caminho** | Baixa (não sabemos o formato) | Alta (formato conhecido) |
| **Custo previsível** | Não | Sim |
| **Qualidade do resultado** | Variável | Consistente e melhorável |
| **Risco de runaway** | Alto | Baixo |
| **Melhor uso** | Side projects, prototyping, pesquisa | Produção, rotina, triagem, CI |

**Em produção, closed ganha por padrão.** Mantenha um loop em cargo do objetivo, entregue os passos para especialistas dedicados, empurre trabalho de rotina para baixo (sub-agentes), e deixe um check automatizado decidir o que passa.

---

## SEÇÃO 8 — OS 3 GUARDAS DE SEGURANÇA (Stop Conditions)

### O Risco de Runaway

A versão romântica do loop engineering é que você escreve os loops e mil agentes constroem sua empresa durante a noite. A versão de produção é que você escreve os loops, e a maior parte do seu trabalho é **garantir que eles parem**.

A primeira preocupação da maioria dos desenvolvedores não é arquitetura — é tokens. Em threads sobre o tema, os replies mais altos são sobre spend descontrolado: gente compartilhando recibos de loops que silenciosamente devoraram centenas de dólares durante a noite.

### As 3 Guardas (Sem Tudo Isso, Não É um Loop — É Uma Fatura Aberta)

#### Guarda 1 — Iteration Cap (Teto de Iterações)
```python
MAX_ITERATIONS = 25
# Um loop preso não pode continuar girando indefinidamente
```

#### Guarda 2 — Diff Check (Checagem de Convergência)
```python
# Mata o run quando os últimos passes pararam de mudar alguma coisa
if last_3_diffs_are_empty():
    halt("Convergiu — nenhuma mudança nos últimos 3 passes")
```

#### Guarda 3 — Spend Cap (Orçamento Máximo)
```python
MAX_BUDGET_USD = 5.00
# Termina o run antes que a cobrança faça
```

### Os 3 Riscos Que Pioram Conforme o Loop Melhora

1. **Token Burn**: Loop com guardas fracas = fatura aberta. Sem as 3 guardas, o que você tem não é um loop — é uma fatura.

2. **Comprehension Gap**: Quanto mais rápido o loop shipa código que você não escreveu, maior a lacuna entre o que existe no repo e o que você realmente entende. Verificação é por sua conta. "Done" é uma alegação, não uma prova.

3. **Loop Without Taste**: Um loop sem gosto/saber atrás dele. A rubrica, as skills, e o step de verificação precisam refletir **taste real** — o que "bom" significa no seu codebase. O loop deixa você estar errado em velocidade de máquina.

---

## SEÇÃO 9 — AGENT GRAPH: GUIDED DETERMINISM (Salesforce)

### O Problema Que Resolveram

Agentes corporativos sofrem de dois problemas fundamentais:

1. **Difíceis de controlar**: Estocasticidade do LLM + ambiguidade da linguagem natural + árvores de regras frágeis = experiências inconsistentes

2. **Design monolítico "um-agente-por-tópico"**: Não escala

### A Solução: Hybrid Reasoning via Agent Graph

1. **Decomposição**: Workflows complexos em tarefas cognitivas menores, cada uma com um sub-agente focado
2. **FSMs (Finite State Machines)**: Gerenciam transições de estado enquanto preservam a compreensão em linguagem natural do LLM
3. **Graph Runtime**: Baixo nível, scriptável via "Agent Script" — linguagem acessível para usuários de negócio
4. **Handoff + Delegation**: Padrões de coordinação first-class

### O Graph resolve "Drop-Off"

O problema de "goal drift" onde o agente perde o objetivo quando o usuário faz perguntas tangenciais. O graph resolve gerenciando estados persistentes e rastreando explicitamente o objetivo primário + histórico + posição atual na conversa.

### Lição para Loop Engineering

> *"Reasoning + acting with tools, self-reflection, memory, and deterministic control planes (workflows with checkpoints) deliver more robust outcomes than prompt-only tuning."*

A topologia importa mais que o prompt. A arquitetura importa mais que a engenharia de prompt individual.

---

## SEÇÃO 10 — RUBRIC ENGINEERING + REINFORCEMENT LEARNING

### A Mudança de Paradigma

De "programar lógica" para "cultivar aprendizado". Agentes que não são pipelines fixos, mas **sistemas que aprendem**:

1. **Agem dentro de um environment** onde suas decisões têm consequências reais
2. **Otimizam em direção a um goal** experimentando e descobrindo o que funciona
3. **Melhoram continuamente** baseado em feedback de performance

### O Loop de Aprendizado (RL + Rubrica)

```
Para cada tarefa:
  1. Agente tenta abordagens diferentes (ex: N versões de uma função)
  2. Rubrica automatizada pontua cada tentativa
  3. Agente analisa resultados — ajusta estratégia interna
  4. Repete "Generate → Evaluate → Update" milhares de vezes
  5. A cada ciclo, fica mais inteligente
```

### As 3 Novas Skills do AI Engineer

| Skill Antiga | Nova Skill |
|---|---|
| Escrever o prompt perfeito | **Environment Design**: criar sandboxes onde o agente pode praticar |
| Ajustar hyperparâmetros | **Rubric Engineering**: traduzir objetivo complexo em scoring system cheat-proof |
| Otimizar pipeline | **Managing the Training Loop**: configurar e monitorar o processo de aprendizado |

---

## SEÇÃO 11 — OS 3 NÍVEIS DO AGENT LOOP (Oracle)

### Level 1 — LLM + Tools + Response (Loop Mínimo)

O agente é um LLM que chama tools e retorna uma resposta. Sem memória persistente, sem estado externo, sem scaffolding além do loop em si.

```python
# Loop nível 1: ferramenta chama, resultado alimenta de volta
messages = [system_prompt, user_message]
response = llm.chat(messages, tools=available_tools)
if response.tool_calls:
    for call in response.tool_calls:
        result = execute_tool(call.name, call.args)
        messages.append(tool_result(result))
return response.content
```

**Limitação**: Sem recordação. Cada run começa do zero. Em tarefas multi-turno, repete trabalho, perde decisões, contradiz respostas próprias.

### Level 2 — Lifecycle Inside the Loop (Memória + Estado)

Operações de memória aparecem dentro do loop: lê antes de chamar o LLM, escreve depois que o agente age. O loop tem um lifecycle — não é mais transporte de tool calls, é um **motor de raciocínio com estado**.

**Memory-Augmented vs Memory-Aware**:
- **Memory-Augmented**: Recupera e injeta info no contexto (lê da memória, não gerencia ativamente)
- **Memory-Aware**: Trata memória como first-class concern — encode, store, retrieve, inject, forget

**Failure Modes no Level 2**:
- **False Positives de Retrieval**: Docs semanticamente similares mas irrelevantes
- **Data Staleness**: Cache de fatos que não são mais precisos
- **Context Bloat**: Muitas tool definitions degradam seleção de tools

### Level 3 — System in Its Own Right

Operações dentro e fora do loop. O harness se torna um sistema próprio. Memory, tooling, orchestration, monitoring — tudo first-class.

**Para onde ir**: A maioria das falhas de produção (agentes que repetem, perdem contexto, produzem resultados inconsistentes) volta a um **mismatch entre a complexidade da tarefa e o nível do agente**.

---

## SEÇÃO 12 — LOOP ENGINEERING NO ZEHLA — APLICAÇÃO PRÁTICA

### Mapeamento para o Ecossistema ZEHLA

| Conceito de Loop Engineering | Componente ZEHLA Correspondente |
|---|---|
| Agent Graph | CADMAS-CTX (32 context buckets + Thompson sampling) |
| Rubric | ZCC Evaluation Engine + Auditoria Obrigatória |
| Prompt Templates | Skills em `.agent/skills/` + Anchor `.opencode/anchor.md` |
| LLMs | Claude Fable 5 (Mythos-class, raciocínio) + Claude Sonnet (volume) |
| Sub-Agents (Writer/Reviewer) | Separação ZCC Decision Maker vs ZCC Validator |
| Memory | Campo Akáshico (ChromaDB + Redis) |
| Worktrees | Isolamento por pousada (multi-tenant) |
| Connectors | Webhooks (Mercado Pago, WhatsApp, Instagram) |
| Automations | CRON jobs + Redis Streams pipeline |
| Stop Conditions | BudgetGuard + CircuitBreaker (CADMAS-CTX) |
| Verification | Auditoria Obrigatória (5 passos) |

### Loop ZEHLA Proposto: Auto-Optimization de Precificação

```
[TRIGGER: CRON diário 6h da manhã]
         │
         ▼
[DISCOVERY: Claude Fable 5 analisa]
  - Preços dos concorrentes (web scraping)
  - Sazonalidade histórica (Akáshico)
  - Ocupação atual (SQLite)
         │
         ▼
[PLANNING: Claude Sonnet]
  - Calcula preços ótimos para cada quarto
  - Gera plano de ajuste
         │
         ▼
[EXECUTION: Claude Fable 5]
  - Implementa ajustes via API
  - Atualiza display no dashboard
         │
         ▼
[VERIFICATION: Claude Haiku (reviewer)]
  - Verifica se preços foram aplicados
  - Confere se estão dentro dos guardrails
  - Rubrica: mínimo de ocupação vs máximo de receita
         │
    ┌────┴────┐
  PASS      FAIL
    │         │
    ▼         ▼
[REGISTRO] [ROLLBACK + LOG]
[Akáshico]  [tentar novamente com
            parâmetros ajustados]
```

---

## SEÇÃO 13 — MOCK: NOTEBOOKLM + GOOGLE ANTIGRAVITY

### Instruções para Uso

Este mock foi projetado para ser carregado no **Google NotebookLM** ou **Google Antigravity** como fonte de conhecimento. Ele contém:

1. **System Prompt** para o agente em Antigravity
2. **Spec (Especificação)** do loop
3. **Rubrica** de avaliação
4. **Test Harness** para verificação
5. **Knowledge Sources** para upload

---

### ARQUIVO 1 — System Prompt para Google Antigravity

```markdown
# SYSTEM PROMPT — Loop Engineering Agent para ZEHLA

Você é um engenheiro de loops especializado em Loop Engineering para o
ecossistema ZEHLA OS (Cognitive Hospitality Operating System).

## SUA MISSÃO
Projetar, implementar e manter loops de engenharia que automatizam
tarefas complexas no sistema ZEHLA — substituindo interação manual
por sistemas autônomos que promptam agentes LLM.

## SEUS 4 PILARES
1. GRAFO (Agent Graph): Topologia do loop — nós, transições, estados
2. RUBRICA (Rubric Engineering): Sistema de pontuação automatizado
3. PROMPT (Template Design): Templates gerados pelo sistema, não por humanos
4. LLMs (Model Allocation): Claude Fable 5 (raciocínio), Sonnet (volume), Haiku (revisão)

## PRINCÍPIOS
- Sempre use CLOSED LOOPS em produção (rota mapeada + rubrica fixa)
- Sempre separe WRITER de REVIEWER (modelos diferentes)
- Sempre inclua 3 GUARDAS: iteration cap, diff check, budget cap
- Sempre registre tudo no Campo Akáshico (memória persistente)
- Nunca confie em "done" sem evidência verificável
- Nunca construa feature sobre base quebrada (auditoria prévia obrigatória)

## TÉCNICA RALPH
Cada iteração do loop é um agente novo com contexto limpo.
A inteligência vive nas specs granulares e nos outcomes verificáveis,
aplicados repetidamente contra memória externa. O agente esquece.
O repositório não esquece.

## HARDNESS
O loop deve ser HARD (rígido): rubrica multi-critério, verificador separado,
diff check, budget cap, iteration cap, separação writer/reviewer.

## STACK TÉCNICO
- Claude Fable 5 / Sonnet / Haiku (Anthropic)
- Next.js 16 + TypeScript + Prisma + SQLite WAL
- Python FastAPI + ChromaDB + Redis Streams
- Claude Code / OpenAI Codex (harness)
- Google Antigravity (orchestration)
```

---

### ARQUIVO 2 — Spec (Especificação do Loop)

```markdown
# SPEC — Loop de Otimização de Precificação ZEHLA

## Objetivo
Loop autônomo que analisa dados de mercado, ocupação e sazonalidade
para ajustar preços de diárias de pousadas automaticamente.

## Trigger
CRON: todo dia às 6:00 AM (America/Sao_Paulo)

## Topologia (Agent Graph)

Nó 1: DISCOVERY_AGENT (Claude Sonnet)
  - Scraping de preços de concorrentes (Firecrawl API)
  - Leitura de ocupação atual (Prisma → SQLite)
  - Recuperação de padrões sazonais (Campo Akáshico → ChromaDB)
  - Saída: relatório de mercado em JSON

Nó 2: PRICING_AGENT (Claude Fable 5)
  - Input: relatório de mercado + rubrica de precificação
  - Calcula preços ótimos usando estratégia neuroeconômica
  - Respeita guardrails: preço mínimo (R$80), máximo (R$1500)
  - Saída: plano de preços em JSON

Nó 3: EXECUTION_AGENT (Claude Sonnet)
  - Input: plano de preços aprovado pelo reviewer
  - Atualiza preços via API do ZEHLA
  - Saída: confirmation ou error

Nó 4: REVIEWER_AGENT (Claude Haiku)
  - Input: diff de preços (antes/depois) + rubrica
  - Avalia: preços dentro dos guardrails?
  - Avalia: mudança > 5% tem justificativa?
  - Saída: PASS/FAIL com score

## Memória (Durable)
- STATUS.md: checklist de tarefas ( Ralph pattern)
- pricing_log.jsonl: histórico de todos os ajustes
- Campo Akáshico: registro semântico de decisões e resultados

## Guardas (Hardness)
- MAX_ITERATIONS: 3 (3 tentativas por dia)
- BUDGET_CAP: $2.00/day em tokens
- DIFF_CHECK: se última iteração não mudou nada, halt
- PRICE_GUARD: nenhum preço fora de [R$80, R$1500]

## Rubrica
Critério 1 — Ocupação-Alvo (peso 40%):
  Score = min(1.0, ocupacao_real / ocupacao_alvo)

Critério 2 — Receita Maximizada (peso 30%):
  Score = receita_atual / receita_maxima_historica

Critério 3 — Competitividade (peso 20%):
  Score = 1.0 - abs(preco_medio_zehla - preco_medio_mercado) / preco_medio_mercado

Critério 4 — Estabilidade (peso 10%):
  Score = 1.0 - (variacao_percentual / 20.0)
  Penaliza variações > 20% em um dia

THRESHOLD: score >= 0.7 = PASS
```

---

### ARQUIVO 3 — Rubrica Completa

```python
# pricing_rubric.py — Rubrica de Avaliação do Loop de Precificação

class PricingRubric:
    """
    Rubrica automatizada para avaliar ajustes de preço
    no loop de otimização do ZEHLA.
    """

    MIN_PRICE = 80.0    # R$ — preço mínimo absoluto
    MAX_PRICE = 1500.0  # R$ — preço máximo absoluto
    MAX_DAILY_CHANGE = 0.20  # 20% — variação máxima por dia
    THRESHOLD = 0.70    # score mínimo para PASS

    def evaluate(self, before: dict, after: dict, market_data: dict) -> dict:
        """
        Avalia um ajuste de preços.

        Args:
            before: preços antes do ajusto {quarto_id: preco}
            after: preços depois do ajusto {quarto_id: preco}
            market_data: dados de mercado {
                avg_competitor_price: float,
                target_occupancy: float,
                current_occupancy: float,
                max_historical_revenue: float,
                current_revenue: float
            }

        Returns:
            dict com score por critério e veredito final
        """
        scores = {}
        violations = []

        # Critério 1: Ocupação-Alvo (peso 40%)
        if market_data['target_occupancy'] > 0:
            scores['occupancy'] = min(
                1.0,
                market_data['current_occupancy'] / market_data['target_occupancy']
            ) * 0.4
        else:
            scores['occupancy'] = 0.0

        # Critério 2: Receita Maximizada (peso 30%)
        if market_data['max_historical_revenue'] > 0:
            scores['revenue'] = min(
                1.0,
                market_data['current_revenue'] / market_data['max_historical_revenue']
            ) * 0.3
        else:
            scores['revenue'] = 0.0

        # Critério 3: Competitividade (peso 20%)
        avg_zehla = sum(after.values()) / len(after) if after else 0
        avg_market = market_data['avg_competitor_price']
        if avg_market > 0:
            deviation = abs(avg_zehla - avg_market) / avg_market
            scores['competitiveness'] = (1.0 - min(1.0, deviation)) * 0.2
        else:
            scores['competitiveness'] = 0.0

        # Critério 4: Estabilidade (peso 10%)
        max_change = 0.0
        for room_id in after:
            if room_id in before and before[room_id] > 0:
                change = abs(after[room_id] - before[room_id]) / before[room_id]
                max_change = max(max_change, change)
        scores['stability'] = (1.0 - min(1.0, max_change / self.MAX_DAILY_CHANGE)) * 0.1

        # Guardrails absolutos (violações)
        for room_id, price in after.items():
            if price < self.MIN_PRICE:
                violations.append(f"Preço abaixo do mínimo: {room_id} = R${price}")
            if price > self.MAX_PRICE:
                violations.append(f"Preço acima do máximo: {room_id} = R${price}")

        if max_change > self.MAX_DAILY_CHANGE:
            violations.append(f"Variação excede {self.MAX_DAILY_CHANGE*100}%: {max_change*100:.1f}%")

        # Score total
        total_score = sum(scores.values())
        if violations:
            total_score *= 0.5  # Penalidade severa por violações

        return {
            "total_score": total_score,
            "scores": scores,
            "violations": violations,
            "passed": total_score >= self.THRESHOLD and len(violations) == 0,
            "threshold": self.THRESHOLD,
        }
```

---

### ARQUIVO 4 — Test Harness

```python
# test_pricing_loop.py — Test Harness para o Loop de Precificação

import json
from pricing_rubric import PricingRubric

def test_rubric_perfect_scenario():
    """Cenário ideal: preços perfeitamente ajustados."""
    rubric = PricingRubric()
    result = rubric.evaluate(
        before={"room1": 200, "room2": 300},
        after={"room1": 250, "room2": 350},
        market_data={
            "avg_competitor_price": 300,
            "target_occupancy": 0.85,
            "current_occupancy": 0.82,
            "max_historical_revenue": 5000,
            "current_revenue": 4800,
        }
    )
    assert result["passed"] is True
    assert result["total_score"] >= 0.70
    assert len(result["violations"]) == 0
    print("PASS: test_rubric_perfect_scenario")

def test_rubric_guardrail_violation():
    """Cenário de violação: preço abaixo do mínimo."""
    rubric = PricingRubric()
    result = rubric.evaluate(
        before={"room1": 200},
        after={"room1": 50},  # Abaixo de R$80
        market_data={
            "avg_competitor_price": 300,
            "target_occupancy": 0.85,
            "current_occupancy": 0.85,
            "max_historical_revenue": 5000,
            "current_revenue": 5000,
        }
    )
    assert result["passed"] is False
    assert any("mínimo" in v for v in result["violations"])
    print("PASS: test_rubric_guardrail_violation")

def test_rubric_excessive_change():
    """Cenário de violação: variação > 20%."""
    rubric = PricingRubric()
    result = rubric.evaluate(
        before={"room1": 100},
        after={"room1": 150},  # +50% = acima de 20%
        market_data={
            "avg_competitor_price": 200,
            "target_occupancy": 0.85,
            "current_occupancy": 0.85,
            "max_historical_revenue": 5000,
            "current_revenue": 5000,
        }
    )
    assert result["passed"] is False
    assert any("excede" in v for v in result["violations"])
    print("PASS: test_rubric_excessive_change")

def test_rubric_low_score():
    """Cenário: score baixo sem violação de guardrail."""
    rubric = PricingRubric()
    result = rubric.evaluate(
        before={"room1": 200},
        after={"room1": 220},
        market_data={
            "avg_competitor_price": 150,  # ZEHLA muito acima do mercado
            "target_occupancy": 0.90,
            "current_occupancy": 0.50,   # Ocupação muito baixa
            "max_historical_revenue": 10000,
            "current_revenue": 2000,      # Receita baixa
        }
    )
    assert result["passed"] is False  # Score < 0.70
    print("PASS: test_rubric_low_score")

if __name__ == "__main__":
    test_rubric_perfect_scenario()
    test_rubric_guardrail_violation()
    test_rubric_excessive_change()
    test_rubric_low_score()
    print("\n=== TODOS OS TESTES PASSARAM ===")
```

---

### ARQUIVO 5 — Prompt Template para Claude Code

```markdown
# PROMPT TEMPLATE — Loop de Precificação (Claude Code)

# /goal "Todos os preços foram ajustados, rubrica >= 0.70, zero violações de guardrails"

## Contexto
Você é o agente de otimização de precificação do ZEHLA.
Este loop roda diariamente às 6h AM via automação.

## Estado Atual
- Leia STATUS.md para ver o que já foi feito
- Leia pricing_log.jsonl para histórico de ajustes anteriores
- Consulte o Campo Akáshico para padrões sazonais

## Tarefa
1. Execute scraping de preços dos 5 concorrentes principais
2. Compare com preços atuais do ZEHLA
3. Calcule preços ótimos usando a estratégia neuroeconômica (CADMAS-CTX)
4. Respeite guardrails: preço entre R$80 e R$1500, variação máxima 20%/dia
5. Aplique ajustes via API
6. Execute rubrica de avaliação

## Rubrica de Avaliação (THRESHOLD: 0.70)
- Ocupação-Alvo (40%): ocupacao_real / ocupacao_alvo
- Receita Maximizada (30%): receita_atual / receita_max_historica
- Competitividade (20%): 1 - desvio_preco_mercado
- Estabilidade (10%): 1 - variacao / 20%

## Guardas
- MAX_ITERATIONS: 3
- BUDGET_CAP: $2.00
- DIFF_CHECK: se sem mudanças, halt
- PRICE_GUARD: [R$80, R$1500]

## Após Concluir
1. Atualize STATUS.md
2. Append em pricing_log.jsonl
3. Registre decisão no Campo Akáshico
```

---

### ARQUIVO 6 — Como Usar no Google Antigravity

```markdown
# INSTRUÇÕES — Google Antigravity + NotebookLM

## Passo 1: Carregar Fontes no NotebookLM
Faça upload dos seguintes arquivos como "Sources":

1. Este documento completo (LOOPING_ENGINEERING_PESQUISA_COMPLETA.md)
2. O System Prompt (Arquivo 1 acima)
3. A Spec do Loop (Arquivo 2 acima)
4. A Rubrica em Python (Arquivo 3 acima)
5. O Test Harness (Arquivo 4 acima)

## Passo 2: Configurar o NotebookLM
- Ative "Custom Instructions" com o System Prompt
- Configure "Audio Overview" se quiser podcast do conhecimento
- Use "Source Guide" para navegação por seção

## Passo 3: No Google Antigravity
1. Abra antigravity.google.com
2. Use PLAN MODE primeiro (veja o agente pensando antes de executar)
3. Dê exemplos CONCRETOS nos seus prompts
4. Descreva resultados específicos que espera

## Passo 4: Prompt Inicial para o Agente

"Use o conhecimento do NotebookLM sobre Loop Engineering
para projetar um loop de automação de triagem de issues
para o repositório ZEHLA. O loop deve:
- Rodar às 9h de segunda a sexta
- Ler issues abertos no GitHub
- Classificar por criticidade (crítico/alto/médio/baixo)
- Draftar fixes para issues marcadas como quick-win
- Usar Claude Haiku para classificar e Claude Sonnet para fixar
- Executar auditoria obrigatória antes de qualquer fix
- Atualizar STATUS.md e o Campo Akáshico a cada run
- Parar após 10 iterações ou $3 de budget
- A rubrica de classificação deve usar os 4 critérios da auditoria ZEHLA"
```

---

## SEÇÃO 14 — FONTES E REFERÊNCIAS COMPLETAS

### Artigos de Pesquisa (Lidos Integralmente)

| # | Fonte | URL | Conteúdo Extraído |
|---|---|---|---|
| 1 | Firecrawl Blog | firecrawl.dev/blog/loop-engineering | Definição completa, anatomia, open vs closed, 3 guardas, hardness |
| 2 | Lushbinary | lushbinary.com/blog/loop-engineering-ai-coding-agents-guide | 5 building blocks, técnica Ralph, Claude Code vs Codex, maturity ladder |
| 3 | Oracle Developers | blogs.oracle.com/developers/the-agent-loop-decoded | 3 níveis do agent loop, memória, failure modes, código Python |
| 4 | AppScale Blog | appscale.blog/en/blog/agent-looping-2026 | Prompts → Loops → Orchestrated Teams, 3 estágios de maturidade |
| 5 | Data Science Dojo | datasciencedojo.com/blog/agentic-loops-explained | ReAct to Loop Engineering, definição de agentic loop |
| 6 | Mustafa Genc (Medium) | medium.com/@mustafa.gencc94/beyond-prompts | Rubric Engineering + RL, CodeQualityRubric, learning loop |
| 7 | Salesforce Engineering | engineering.salesforce.com/agentforces-agent-graph | Agent Graph, hybrid reasoning, guided determinism, drop-off |
| 8 | Google Cloud (Medium) | medium.com/google-cloud/integrate-notebooklm | NotebookLM + Antigravity + MCP integration |

### Buscas Web Realizadas

| # | Query | Resultados |
|---|---|---|
| 1 | "Looping Engineering agent graph rubric prompt LLM hardness" | 10 resultados (Medium, Reddit, YouTube, GitHub) |
| 2 | "looping engineering agentic loops LLM graph rubric iterative" | 10 resultados (AppScale, IBM, Meta, FutureAGI) |
| 3 | "agent loop engineering graph-based rubric-guided prompt hardness" | 10 resultados (GitHub, Medium, YouTube, Arize AI) |
| 4 | "looping engineering notebookLM google antigravity agent design" | 10 resultados (LinkedIn, YouTube, Medium, XDA, Reddit) |
| 5 | "harness engineering agent Claude Code Codex rubric spec test loop" | 10 resultados (GitHub, Reddit, YouTube, Patronus AI) |
| 6 | "Agent Looping 2026 prompts loops orchestrated teams" | 10 resultados (AppScale, DataScienceDojo, IBM, Pasquale) |

### Pensadores e Praticantes Citados

| Nome | Papel | Contribuição |
|---|---|---|
| **Peter Steinberger** | PSDev | Popularizou a frase sobre designing loops |
| **Boris Cherny** | Anthropic (Claude Code) | "Meu trabalho é escrever loops" |
| **Addy Osmani** | Google | Popularizou o termo "Loop Engineering" |
| **Geoffrey Huntley** | Dev | Criou a técnica Ralph |
| **Phil Mui** | Salesforce (SVP) | Agent Graph + Hybrid Reasoning |
| **Greg Brockman** | OpenAI | "Bottleneck é o taste da pessoa" |
| **Mustafa Genc** | TUM | Rubric Engineering + RL |
| **Claude Code Team** | Anthropic | /goal, /loop, 3 hábitos de loop confiável |

### Frameworks e Ferramentas Mencionados

- **Claude Code** (Anthropic): /loop, /goal, hooks, sub-agentes, worktrees
- **OpenAI Codex**: Automations tab, Triage inbox, sub-agentes
- **LangChain/LangGraph**: ReAct agent, graph-based workflows
- **Firecrawl**: /scrape, /map, /search, /monitor (web data no loop)
- **Salesforce Agentforce**: Agent Graph, Agent Script, hybrid reasoning
- **Google Antigravity**: AI coding agent platform com plan mode
- **Google NotebookLM**: Fonte de conhecimento com custom instructions
- **MCP (Model Context Protocol):** Conectores universais entre harnesses

---

*Fim do Documento — Looping Engineering: Pesquisa Avançada e Completa v1.0*
