\- Implementar o Sistema Operacional Cognitivo ZAOS-Shield no backend SmartHotel ZEHLA — SB1 a SB4 completos, com 113 testes unitários in-memory, TypeScript limpo, git commit realizado.

\#\# Constraints & Preferences  
\- \*\*SKILL.md ativo:\*\* Clean Architecture, Ports & Adapters, \`Result\<T,E\>\`, proibido \`as any\`/\`@ts-ignore\`  
\- \*\*Porta no Domínio, Adaptador na Infraestrutura:\*\* \`IZaosMemoryPort\` em \`domain/\`; \`InMemoryZaosMemoryAdapter\` e \`AESGCMEncryptor\` em \`infrastructure/\`  
\- \*\*Segurança multi-tenant obrigatória (RLS):\*\* toda consulta vetorial ou de grafo deve isolar por \`tenantId\`/\`pousadaId\`  
\- \*\*Criptografia em repouso:\*\* AES-256-GCM antes dos dados tocarem o banco (PIIs: CPF, email, WhatsApp)  
\- \*\*Memória vetorial RLS:\*\* busca cosseno com filtro por \`tenantId\` no \`InMemoryZaosMemoryAdapter\`  
\- \*\*Tokenização sintética ZDR:\*\* PIIScanner substitui PII por \`\[TIPO\_TOKEN\_HASH\]\` antes de enviar à nuvem; detokeniza na resposta  
\- \*\*Sanitização anti-jailbreak:\*\* PromptSanitizer com 19 padrões de injeção (strict: bloqueia; non-strict: redacta)  
\- \*\*Thompson Sampling com Beta priors:\*\* seleção probabilística de tiers no ZehlaRouter, aprendizado contínuo alpha/beta  
\- \*\*Circuit Breaker financeiro:\*\* BudgetTracker multi-tenant com R$50/dia e R$1000/mês  
\- \*\*Honeypots no domínio puro:\*\* CanaryManager detecta acesso a nós/arestas falsas antes do banco  
\- \*\*100% testes in-memory:\*\* nenhum teste encosta em banco, rede ou sistema de arquivos  
\- \*\*Proibido \`vi.mock()\` em domínio:\*\* mocks só na borda (infrastructure adapters)

\#\# Progress  
\#\#\# Done  
\- \*\*Estudo completo dos 4 documentos ZEHLA PRIME\*\* (folder \`/Users/marciocau/Downloads/ZEHLA PRIME/\`): blueprint do cérebro, Matriz Mônica, 7 Anéis de Consciência, Swarm Lite, checklist Fase 1-7  
\- \*\*SB1 — ZAOS-Memory (11 testes):\*\*  
  \- \`IZaosMemoryPort\`: interface de domínio (\`store\`, \`search\` RLS, \`getById\`, \`deleteById\`, \`getByTenant\`)  
  \- \`AESGCMEncryptor\` (\`src/infrastructure/security/\`): AES-256-GCM nativo Node.js, IV 16 bytes, tag 16 bytes, key 32 bytes hex  
  \- \`InMemoryZaosMemoryAdapter\` (\`src/infrastructure/persistence/memory/\`): vetores em RAM, busca por similaridade cosseno, RLS por \`tenantId\`/\`pousadaId\`  
  \- Templates: \`src/core/memories/MEMORY.md\` (conhecimento global) e \`USER.md\` (perfil por pousada, PII criptografado)  
\- \*\*SB2 — ZAOS-Security (45 testes):\*\*  
  \- \`PIIScanner\` (\`src/domain/security/services/\`): regex para CPF, email, telefone, cartão de crédito; \`tokenize()\` → \`\[TIPO\_TOKEN\_HASH\]\`; \`detokenize()\` → reconstrução; \`validateNoPiiLeak()\` para varredura de output  
  \- \`PromptSanitizer\`: 19 padrões (ignore previous, system override, jailbreak, prompt extraction, code execution, blocklist words); strict mode bloqueia, non-strict redacta  
  \- \`OutputValidator\`: detecta PII leak, AI identity leak, refusal leak, capability leak  
\- \*\*SB3 — ZAOS-Router (29 testes):\*\*  
  \- \`ThompsonSampler\`: Beta(alpha, beta) via Gamma \+ Normal approximation; priors inicias Tier1=α10β2, Tier2=α5β3, Tier3=α3β5  
  \- \`BudgetTracker\`: R$50/dia, R$1000/mês por tenant; \`isCircuitBreakerOpen\` quando gasto mínimo falha  
  \- \`RequestClassifier\`: simple/rotine/complex por regex  
  \- \`ZehlaRouter\`: classifica → Thompson → check budget → decisão; fallback automático Tier 1 se budget excedido; \`reportOutcome()\` feedback loop  
\- \*\*SB4 — ZAOS-Knowledge Graph (28 testes):\*\*  
  \- \`KnowledgeGraph\` (\`src/domain/knowledge/services/\`): CRUD de nós (9 tipos) e arestas (10 tipos) com adjacência explícita  
  \- \`bfsPathfinder()\`: BFS para menor caminho até tipo alvo; retorna path \+ nós \+ arestas  
  \- \`findPathsBetween()\`: DFS multi-path entre dois nós, ordenado por peso total  
  \- \`pageRank()\`: importância com dangling rank distribution; convergência em \~15 iterações  
  \- \`CanaryManager\`: \`deployCanary()\` (nó isca com \`\_\_canary\`, \`\_\_bait\`, \`\_\_token\`), \`deployHoneyEdge()\` (aresta falsa), \`checkAccess()\`, \`checkEdgeAccess()\`, \`threatAssessment()\`, \`clearAlerts()\`  
\- \*\*Commit no GitHub:\*\* \`git add \-A && git commit \-m "feat(zaos-shield): implementar SB1-SB4 do nucleo cognitivo"\` — push para \`origin/main\` em \`https://github.com/MarcioCau14/SmartHotel\_Zehla\`  
\- \*\*TypeScript:\*\* todos os novos arquivos compilam com \`npx tsc \--noEmit\`  
\- \*\*Regressão zero:\*\* suíte total de 113 novos testes \+ suíte existente intacta

\#\#\# In Progress  
\- (none)

\#\#\# Blocked  
\- Nenhum blocker atual

\#\# Key Decisions  
\- \*\*ZAOS-Memory sem sqlite-vec:\*\* optou-se por adaptador in-memory com cosine similarity no lugar de sqlite-vec (Phase 1); a persistência via SQLite fica para um Small Batch futuro como adapter de infraestrutura  
\- \*\*Criptografia AES-256-GCM com crypto nativo Node.js:\*\* sem dependências externas; IV aleatório garante ciphertext diferente para mesmo plaintext  
\- \*\*Domínio puro para PIIScanner, PromptSanitizer, OutputValidator:\*\* classes sem I/O, apenas regex e manipulação de strings — não precisam de port/adapter, são o próprio negócio  
\- \*\*KnowledgeGraph como domínio puro:\*\* CRUD de nós/arestas, BFS, PageRank e CanaryManager são regras de negócio hoteleiro (grafos relacionais), não infraestrutura  
\- \*\*Edge ID determinística em deployHoneyEdge:\*\* \`honey-{source}-{target}\` em vez de timestamp para permitir teste sem adivinhar ID  
\- \*\*PageRank com dangling node handling:\*\* distribuição uniforme do rank perdido por nós sem arestas de saída — conserva massa total em 1.0  
\- \*\*Fallback Tier 1 no circuit breaker:\*\* se budget estourado, roteia para Rules Engine (custo zero) em vez de bloquear requisição  
\- \*\*Commit único com todos os SBs:\*\* 400 arquivos, 37.059 inserções, 3.236 deleções

\#\# Next Steps  
1\. Implementar \*\*SB5 — ZAOS-Learning & Egress\*\* (Fase 4 do checklist): DogmaticValidator (domínio puro), SelfEvolution (orquestração assíncrona via cron), EgressFirewall (adaptador de infraestrutura, whitelist porta 443\)  
2\. Verificar TypeScript e regressão geral após SB5  
3\. Implementar adaptador sqlite-vec como persistência para ZAOS-Memory (Fase 1 pendente)  
4\. Implementar adaptador SQLite para KnowledgeGraph persistente

\#\# Critical Context  
\- \*\*113 testes unitários in-memory verdes:\*\* SB1=11, SB2=45, SB3=29, SB4=28 — todos sem banco, rede ou sistema de arquivos  
\- \*\*Zero \`as any\`/\`@ts-ignore\`\*\* nos novos arquivos  
\- \*\*Result pattern\*\* usado consistentemente em todas as novas classes  
\- \*\*MapIterator fix:\*\* todas as iterações de \`Map.keys()\`/\`Map.values()\` usam \`Array.from()\` para compatibilidade com \`--target\` do projeto  
\- \`unrouteAll\` \+ \`page.waitForFunction\` resolvem \`SecurityError\` do WebKit nos E2E  
\- \*\*Thread principal:\*\* o arquiteto definiu SB5 como o próximo; o perigo central é permitir que SelfEvolution mute prompts sem validação dogmática (DogmaticValidator) e sem firewall de egresso (EgressFirewall)

\#\# Relevant Files  
\- \`src/domain/memory/IZaosMemoryPort.ts\`: Porta de memória vetorial (store/search com RLS)  
\- \`src/infrastructure/security/AESGCMEncryptor.ts\`: AES-256-GCM nativo  
\- \`src/infrastructure/persistence/memory/InMemoryZaosMemoryAdapter.ts\`: Adapter vetorial in-memory com cosine similarity  
\- \`src/core/memories/MEMORY.md\`: Template de conhecimento tático global  
\- \`src/core/memories/USER.md\`: Template dialético por pousada  
\- \`src/domain/security/services/PIIScanner.ts\`: Tokenização sintética ZDR  
\- \`src/domain/security/services/PromptSanitizer.ts\`: 19 padrões anti-jailbreak  
\- \`src/domain/security/services/OutputValidator.ts\`: Varredura de output do LLM  
\- \`src/domain/decision/services/ZehlaRouter.ts\`: ThompsonSampler, BudgetTracker, RequestClassifier, ZehlaRouter  
\- \`src/domain/knowledge/services/KnowledgeGraph.ts\`: KnowledgeGraph, BFS, PageRank, CanaryManager  
\- \`src/\_\_tests\_\_/zaos-memory/zaos-memory.test.ts\`: 11 testes  
\- \`src/\_\_tests\_\_/security/zaos-security.test.ts\`: 45 testes  
\- \`src/\_\_tests\_\_/decision/zehla-router.test.ts\`: 29 testes  
\- \`src/\_\_tests\_\_/knowledge/knowledge-graph.test.ts\`: 28 testes  
\- \`SKILL.md\`: Leis imutáveis de Clean Architecture do projeto  
\- \`/Users/marciocau/Downloads/ZEHLA PRIME/\`: 4 documentos blueprint (01-04)  
\- \`/Users/marciocau/Downloads/PLANOS DE IMPLEMENTACAO CEREBRO ZEHLA/Checklist de Tarefas- Implantação da Arquitetura ZAOS-Shield .md\`: Checklist mestre com 7 fases  
