Implementar o Sistema Operacional Cognitivo ZAOS-Shield no backend SmartHotel ZEHLA — SB1 a SB6 completos, com 948+ testes unitários in-memory, TypeScript limpo, git commit \+ push.

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
\- \*\*Teste vermelho \= fundação rachada:\*\* não se comita com falhas, mesmo em domínios não relacionados  
\- \*\*Small Batches guiados por arquiteto:\*\* dividir fases complexas para evitar estouro de contexto (SB5, SB6)

\#\# Progress  
\#\#\# Done  
\- \*\*Estudo completo dos documentos blueprint\*\* (folder ZEHLA PRIME, ZEHLA\_BRAIN\_implementation\_plan.md, checklist Fase 1-7)  
\- \*\*SB1 — ZAOS-Memory (11 testes):\*\* \`IZaosMemoryPort\`, \`AESGCMEncryptor\`, \`InMemoryZaosMemoryAdapter\`, templates MEMORY.md/USER.md  
\- \*\*SB2 — ZAOS-Security (45 testes):\*\* \`PIIScanner\`, \`PromptSanitizer\` (19 padrões), \`OutputValidator\`  
\- \*\*SB3 — ZAOS-Router (29 testes):\*\* \`ThompsonSampler\`, \`BudgetTracker\`, \`RequestClassifier\`, \`ZehlaRouter\` com fallback Tier 1  
\- \*\*SB4 — ZAOS-Knowledge Graph (28 testes):\*\* \`KnowledgeGraph\` (CRUD nós/arestas, BFS, DFS, PageRank), \`CanaryManager\` (honeypots)  
\- \*\*SB5 — ZAOS-Learning & Egress (36 testes):\*\*  
  \- \`DogmaticValidator\` (\`src/domain/evolution/services/\`): 7 regras dogmáticas (PII, sanitização, system prompt, tenant escalation, code execution, coerência semântica)  
  \- \`SelfEvolution\` (\`src/domain/evolution/services/\`): motor genético DSPy-style com Pareto goals, crossover, mutação, validação dogmática obrigatória  
  \- \`EgressFirewall\` (\`src/infrastructure/network/\`): firewall whitelist porta 443, bloqueio portas de shell reverso (22, 80, 445, 3389...), enable/disable toggle, registro violações  
\- \*\*SB6 — ZAOS-Swarms (38 testes):\*\*  
  \- \`SubagentProfile\` (\`src/domain/swarm/entities/\`): catálogo com 4 perfis (Zé-Pricing, Zé-Reviews, Zé-Concierge, Zé-Analyst), criação por role ou custom, verificação de capacidades  
  \- \`Subagent\` (\`src/domain/swarm/entities/\`): ciclo de vida idle → working → done/failed, auto-validação de transições de estado  
  \- \`ConsensusEngine\` (\`src/domain/swarm/services/\`): consenso por maioria simples, suporte a yes/no/abstain, cálculo de agreement %  
  \- \`DogmaticEvaluator\` (\`src/domain/swarm/services/\`): avaliador Tier 2 que recusa conclusão sem evidências factuais \+ consenso  
  \- \`RalphLoop\` (\`src/domain/swarm/services/\`): ciclo OODA (/goal → observe → plan → act → learn), subdivisão automática de metas em subgoals, retry até maxAttempts com fallback para analyst  
  \- \`SwarmCoordinator\` (\`src/domain/swarm/services/\`): Queen com topologia hierarchical-mesh, spawn/assign/fail/clear, métricas de enxame  
\- \*\*Correção de bugs no domínio financeiro:\*\* MockPixGateway.gatewayTransactionId adicionado, asserções de status corrigidas de PROCESSING para CONFIRMED (reflete fluxo real do use case)  
\- \*\*Correção ZehlaRouter:\*\* lógica \`Math.max(tier, preferredTier)\` → \`Math.min(Math.max(tier, min), max)\` por complexidade; simple=capa Tier1, routine=min Tier2, complex=força Tier3  
\- \*\*Commit \+ Push no GitHub (\`4d6df91\`):\*\* \`feat(zaos-shield): implementar SB5 e corrigir falhas no dominio financeiro e router\` — push para \`origin/main\` em \`https://github.com/MarcioCau14/SmartHotel\_Zehla\`  
\- \*\*Regressão zero:\*\* suíte total de 948+ testes passa 100% (92 arquivos)

\#\#\# In Progress  
\- (none)

\#\#\# Blocked  
\- Nenhum blocker atual

\#\# Key Decisions  
\- \*\*ZAOS-Memory sem sqlite-vec:\*\* adaptador in-memory com cosine similarity; persistência via SQLite fica para Small Batch futuro como adapter de infraestrutura  
\- \*\*Criptografia AES-256-GCM com crypto nativo Node.js:\*\* sem dependências externas; IV aleatório  
\- \*\*Domínio puro para PIIScanner, PromptSanitizer, OutputValidator:\*\* classes sem I/O, apenas regex e manipulação de strings  
\- \*\*KnowledgeGraph como domínio puro:\*\* CRUD de nós/arestas, BFS, PageRank e CanaryManager são regras de negócio hoteleiro, não infraestrutura  
\- \*\*Edge ID determinística em deployHoneyEdge:\*\* \`honey-{source}-{target}\` em vez de timestamp  
\- \*\*PageRank com dangling node handling:\*\* distribuição uniforme do rank perdido — conserva massa total em 1.0  
\- \*\*Fallback Tier 1 no circuit breaker:\*\* se budget estourado, roteia para Rules Engine (custo zero) em vez de bloquear  
\- \*\*Router corrigido com min/max por complexity:\*\* simple=max 1, routine=min 2, complex=min 3 (não mais \`Math.max(tier, preferredTier)\`)  
\- \*\*Mock PIX exige gatewayTransactionId:\*\* PixQrCodeData na interface IPixGatewayPort exige campo; MockPixGateway deve retornar  
\- \*\*RalphLoop com subdivisão por palavra-chave:\*\* meta com "preço" → subgoals pricing+analyst; "avaliação" → reviews+analyst; genérico → analyst  
\- \*\*ConsensusEngine ignora abstenções:\*\* maioria calculada sobre votos não-abstidos (\>50% dos não-abstidos)  
\- \*\*DogmaticEvaluator com score composto:\*\* evidência \+ consenso \+ completude / 3; recusa se \< minEvidenceLength  
\- \*\*Teste vermelho \= blocker de commit:\*\* falhas no PIX e Router foram corrigidas antes do commit SB5

\#\# Next Steps  
1\. Implementar \*\*SB7 — Scraping Gaussiano & Proxy Chains\*\* (Fase 5, segunda metade): ofuscação de scraping com perfil de delay gaussiano (5s–45s), integração com SwarmCoordinator, proxy chains rotativos  
2\. Implementar \*\*Fase 6 — Integração FastAPI & Hardening\*\* (middleware imutável JWT, rate limiting)  
3\. Implementar adaptador sqlite-vec como persistência para ZAOS-Memory (Fase 1 pendente)  
4\. Implementar adaptador SQLite para KnowledgeGraph persistente

\#\# Critical Context  
\- \*\*948+ testes unitários in-memory verdes:\*\* SB1=11, SB2=45, SB3=29, SB4=28, SB5=36, SB6=38 \+ suíte pré-existente (\~800) — 92 arquivos, zero falhas  
\- \*\*Zero \`as any\`/\`@ts-ignore\`\*\* nos novos arquivos  
\- \*\*Result pattern\*\* usado consistentemente em todas as novas classes  
\- \*\*MapIterator fix:\*\* todas as iterações de \`Map.keys()\`/\`Map.values()\` usam \`Array.from()\` para compatibilidade com \`--target\`  
\- \*\*RalphLoop depende de DogmaticEvaluator no learn():\*\* se avaliação falha, loop retorna a planning (retry) até maxAttempts  
\- \*\*SwarmCoordinator não persiste:\*\* subagentes vivem apenas em memória durante o ciclo do loop  
\- \*\*SelfEvolution usa Math.random:\*\* mutações e crossover são estocásticos; testes mockam com \`vi.spyOn\` ou usam configuração determinística (mutationRate=0)  
\- \*\*EgressFirewall com whitelist estática:\*\* api.groq.com, api.openai.com, api.anthropic.com, api.nvidia.com todas na porta 443; permitido adicionar/remover regras dinamicamente  
\- \*\*DogmaticValidator com 7 regras:\*\* valida prompts antes da evolução e antes da execução; qualquer violação bloqueia o prompt

\#\# Relevant Files  
\- \`src/domain/memory/IZaosMemoryPort.ts\`: Porta de memória vetorial (store/search com RLS)  
\- \`src/infrastructure/security/AESGCMEncryptor.ts\`: AES-256-GCM nativo  
\- \`src/infrastructure/persistence/memory/InMemoryZaosMemoryAdapter.ts\`: Adapter vetorial in-memory com cosine similarity  
\- \`src/core/memories/MEMORY.md\`: Template de conhecimento tático global  
\- \`src/core/memories/USER.md\`: Template dialético por pousada  
\- \`src/domain/security/services/PIIScanner.ts\`: Tokenização sintética ZDR  
\- \`src/domain/security/services/PromptSanitizer.ts\`: 19 padrões anti-jailbreak  
\- \`src/domain/security/services/OutputValidator.ts\`: Varredura de output do LLM  
\- \`src/domain/decision/services/ZehlaRouter.ts\`: ThompsonSampler, BudgetTracker, RequestClassifier, ZehlaRouter (corrigido min/max)  
\- \`src/domain/knowledge/services/KnowledgeGraph.ts\`: KnowledgeGraph, BFS, PageRank, CanaryManager  
\- \`src/domain/evolution/services/DogmaticValidator.ts\`: 7 regras dogmáticas de segurança de prompt  
\- \`src/domain/evolution/services/SelfEvolution.ts\`: Motor genético DSPy-style com Pareto goals  
\- \`src/infrastructure/network/EgressFirewall.ts\`: Firewall de egresso whitelist porta 443  
\- \`src/domain/swarm/entities/SubagentProfile.ts\`: Catálogo com 4 perfis de subagentes  
\- \`src/domain/swarm/entities/Subagent.ts\`: Ciclo de vida do subagente  
\- \`src/domain/swarm/services/ConsensusEngine.ts\`: Consenso por maioria simples  
\- \`src/domain/swarm/services/DogmaticEvaluator.ts\`: Avaliador Tier 2  
\- \`src/domain/swarm/services/RalphLoop.ts\`: Ciclo /goal OODA (Observe→Plan→Act→Learn)  
\- \`src/domain/swarm/services/SwarmCoordinator.ts\`: Queen orquestradora hierarchical-mesh  
\- \`src/\_\_tests\_\_/zaos-memory/zaos-memory.test.ts\`: 11 testes SB1  
\- \`src/\_\_tests\_\_/security/zaos-security.test.ts\`: 45 testes SB2  
\- \`src/\_\_tests\_\_/decision/zehla-router.test.ts\`: 29 testes SB3  
\- \`src/\_\_tests\_\_/knowledge/knowledge-graph.test.ts\`: 28 testes SB4  
\- \`src/\_\_tests\_\_/evolution/zaos-learning.test.ts\`: 36 testes SB5  
\- \`src/\_\_tests\_\_/swarm/zaos-swarms.test.ts\`: 38 testes SB6  
\- \`SKILL.md\`: Leis imutáveis de Clean Architecture do projeto  
\- \`/Users/marciocau/Downloads/PLANOS DE IMPLEMENTACAO CEREBRO ZEHLA/Checklist de Tarefas- Implantação da Arquitetura ZAOS-Shield .md\`: Checklist mestre com 7 fases  
\- \`/Users/marciocau/Downloads/PLANOS DE IMPLEMENTACAO CEREBRO ZEHLA/ZEHLA\_BRAIN\_implementation\_plan.md\`: Plano de implementação com especificações Ralph Loop e Swarm  
