\- Implementar todo o ZAOS-Shield (SB1–SB9), totalizando 96 suites e 1070 testes, e iniciar o ZEHLA PRIME com a especificação do Domínio de Hospitalidade (SPEC.md \+ entidades \+ use cases \+ testes).

\#\# Constraints & Preferences  
\- \*\*SKILL.md ativo:\*\* Clean Architecture, Ports & Adapters, \`Result\<T,E\>\`, proibido \`as any\`/\`@ts-ignore\`  
\- \*\*Domínio puro:\*\* entidades, VOs, máquina de estados e casos de uso sem dependência de framework/banco  
\- \*\*Zero infraestrutura no domínio:\*\* Nada de Prisma, Next.js, Express, banco nas entidades  
\- \*\*Portas segregadas por agregado (SOLID I):\*\* \`IHospedePort\`, \`IReservaPort\`, \`IQuartoPort\`, \`IServicoPort\`, \`IFeedbackPort\` — nunca uma God Interface  
\- \*\*RLS multi-tenant obrigatório:\*\* toda consulta vetorial, de grafo ou de repositório isola por \`tenantId\`/\`pousadaId\`  
\- \*\*ZDR (Zehla Data Registry):\*\* PIIScanner tokeniza PII antes do LLM; OutputValidator varre resposta  
\- \*\*Sanitização anti-jailbreak:\*\* PromptSanitizer com 19 padrões (strict bloqueia, non-strict redige)  
\- \*\*Thompson Sampling com Beta priors:\*\* seleção probabilística de tiers; BudgetTracker multi-tenant com R$50/dia e R$1000/mês  
\- \*\*Circuit Breaker financeiro:\*\* fallback Tier 1 (Rules Engine) se budget estourado  
\- \*\*Honeypots no domínio puro:\*\* CanaryManager com nós/arestas falsas antes do banco  
\- \*\*100% testes in-memory:\*\* sem banco, rede ou sistema de arquivos  
\- \*\*Proibido \`vi.mock()\` em domínio:\*\* mocks só em adaptadores de infraestrutura  
\- \*\*Teste vermelho \= blocker de commit:\*\* zero falhas toleradas em regressão  
\- \*\*Small Batches guiados por arquiteto:\*\* divisão em SBs para evitar estouro de contexto  
\- \*\*Aversão ao vibe coding:\*\* spec primeiro, código depois; SPEC.md define intenção, contratos e invariantes  
\- \*\*Segurança Zero-Trust:\*\* JWT rejeita \`alg: none\`, HMAC com \`crypto.timingSafeEqual\`, idempotência em webhooks Pix  
\- \*\*Ofuscação de scraping:\*\* Box-Muller gaussiano (μ=25s, σ=7s, clamp \[5s,45s\]), proxy chains round-robin

\#\# Progress  
\#\#\# Done  
\- \*\*SPEC.md criado e revisado:\*\* 351 linhas, zero código — 5 entidades mapeadas, máquina de estados da Reserva, 5 portas segregadas, fronteira do Zé-Concierge, 17 erros de negócio documentados  
\- \*\*SB1 — ZAOS-Memory (11 testes):\*\* \`IZaosMemoryPort\`, \`AESGCMEncryptor\`, \`InMemoryZaosMemoryAdapter\`  
\- \*\*SB2 — ZAOS-Security (45 testes):\*\* \`PIIScanner\`, \`PromptSanitizer\` (19 padrões), \`OutputValidator\`  
\- \*\*SB3 — ZAOS-Router (29 testes):\*\* \`ThompsonSampler\`, \`BudgetTracker\`, \`RequestClassifier\`, \`ZehlaRouter\` com fallback Tier 1  
\- \*\*SB4 — ZAOS-Knowledge Graph (28 testes):\*\* \`KnowledgeGraph\` (CRUD nós/arestas, BFS, DFS, PageRank), \`CanaryManager\`  
\- \*\*SB5 — ZAOS-Learning & Egress (36 testes):\*\* \`DogmaticValidator\`, \`SelfEvolution\`, \`EgressFirewall\`  
\- \*\*SB6 — ZAOS-Swarms (38 testes):\*\* \`SubagentProfile\`, \`Subagent\`, \`ConsensusEngine\`, \`DogmaticEvaluator\`, \`RalphLoop\` (ciclo OODA), \`SwarmCoordinator\`  
\- \*\*SB7 — Ofuscação Gaussiana & Proxy Chains (21 testes):\*\*  
  \- \`GaussianDelayCalculator\` (\`infrastructure/scraping/\`): Box-Muller, μ=25s, σ=7s, clamp \[5s,45s\], prova de concentração na curva do sino  
  \- \`ProxyChainManager\` (\`infrastructure/scraping/\`): round-robin, \`markFailed\`, \`recover\`, \`resetAll\`  
  \- \`IScrapingPort\` (\`application/scraping/ports/\`): contrato de scraping  
\- \*\*SB8 — Hardening HTTP (34 testes):\*\*  
  \- \`TenantSession\` (\`domain/hardening/value-objects/\`): VO com pousadaId, role, permissões, auto-validação  
  \- \`JwtGuard\` (\`infrastructure/hardening/\`): rejeita \`alg: none\` no parsing manual antes do \`jose\`, whitelist HS256, extrai tenantId exclusivamente do token  
  \- \`HMACValidator\` (\`infrastructure/hardening/\`): \`crypto.timingSafeEqual\`, prova empírica de tempo constante (5000 iterações, ratio \<2.5x)  
  \- \`IdempotencyBarrier\` (\`infrastructure/hardening/\`): barreira in-memory com TTL, \`checkAndMark\` atômico  
\- \*\*SB9 — Pentest Final (29 testes):\*\*  
  \- \*\*LGPD:\*\* CPF/cartão tokenizados com ZDR, \`validateNoPiiLeak\` detecta dados crus, aceita tokenizados  
  \- \*\*Contra-Inteligência:\*\* Path Traversal em nó canary → \`checkAccess\` dispara, \`threatAssessment()\` confirma ameaça  
  \- \*\*RCE:\*\* porta 4444/22/445 bloqueadas, 443 permitida só para whitelist, violações registradas  
  \- \*\*Jailbreak:\*\* \`ignore all previous instructions\` bloqueado, \`forget previous context\` redigido, \`reveal system prompt\` bloqueado  
  \- \*\*Performance:\*\* bfsPathfinder \<5ms, busca vetorial (cosine similarity) \<10ms, RLS funcional no memory adapter  
\- \*\*SB1 — Hospitalidade Context (27 testes):\*\*  
  \- Entidades: \`Hospede\`, \`Quarto\`, \`Reserva\` (com máquina de estados \`pendente→confirmada→checkin→checkout→finalizada\` \+ 6 regras de transição), \`Servico\`, \`Feedback\` \+ enums \`StatusReserva\`, \`TipoQuarto\`, \`StatusQuarto\`, \`CategoriaServico\`  
  \- VOs: \`Documento\` (CPF/passaporte), \`Money\` (centavos), \`DateRange\`, \`Email\`  
  \- 5 portas segregadas: \`IHospedePort\`, \`IReservaPort\`, \`IQuartoPort\`, \`IServicoPort\`, \`IFeedbackPort\`  
  \- 5 use cases: \`CreateReservaUseCase\`, \`ConfirmarReservaUseCase\`, \`CancelarReservaUseCase\`, \`RealizarCheckInUseCase\`, \`RealizarCheckOutUseCase\`  
  \- \`InMemoryReservaRepository\` (infra) com \`isRoomAvailable\`, \`listUpcomingCheckins\`, \`listUpcomingCheckouts\`  
\- \*\*Correção de bugs no domínio financeiro:\*\* MockPixGateway.gatewayTransactionId adicionado, asserções de status corrigidas  
\- \*\*Correção ZehlaRouter:\*\* lógica corrigida para \`Math.min(Math.max(tier, min), max)\` por complexity  
\- \*\*Commit \+ Push no GitHub:\*\* 4 commits em \`main\` — \`584bf0e\` (SB6), \`50efa31\` (SB7), \`6975884\` (SB8), \`f3c62e2\` (SB9+SB1 Hospitalidade)  
\- \*\*Regressão zero:\*\* suíte total de 1070 testes passa 100% em 96 arquivos

\#\#\# In Progress  
\- (none)

\#\#\# Blocked  
\- Nenhum blocker atual

\#\# Key Decisions  
\- \*\*God Interface rejeitada:\*\* \`IHospitalityContextPort\` quebrada em 5 portas segregadas (SOLID I)  
\- \*\*Máquina de estados dentro da entidade Reserva:\*\* transições (\`confirmar\`, \`realizarCheckIn\`, \`realizarCheckOut\`, \`finalizar\`, \`cancelar\`) validam-se dentro da própria entidade, não no use case — DDD puro  
\- \*\*Reserva permite dados mínimos:\*\* guestId obrigatório, mas hóspede pode ser criado com dados parciais (nome+contato) no ato da reserva  
\- \*\*Feedback imutável:\*\* uma vez criado, não pode ser editado; novo feedback ar-quiva o antigo  
\- \*\*JwtGuard rejeita \`alg: none\` manualmente:\*\* parsing base64 do header ANTES de chamar \`jose.jwtVerify\`  
\- \*\*HMAC com \`crypto.timingSafeEqual\`:\*\* prova empírica com 5000 iterações que assinatura correta vs errada têm tempo de execução equivalente (ratio \<2.5x)  
\- \*\*SelfEvolution usa \`Math.random\`:\*\* mutações e crossover estocásticos; testes mockam com \`vi.spyOn\` ou configuram determinístico (mutationRate=0)  
\- \*\*EgressFirewall com whitelist estática:\*\* portas 443 para 4 APIs (Groq, OpenAI, Anthropic, NVIDIA)  
\- \*\*CanaryManager com edge ID determinística:\*\* \`honey-{source}-{target}\` em vez de timestamp  
\- \*\*PageRank com dangling node handling:\*\* distribuição uniforme do rank perdido — conserva massa total em 1.0  
\- \*\*RalphLoop com subdivisão por palavra-chave:\*\* "preço" → pricing+analyst; "avaliação" → reviews+analyst; genérico → analyst  
\- \*\*ConsensusEngine ignora abstenções:\*\* maioria calculada sobre votos não-abstidos (\>50%)  
\- \*\*ZCP Protocolo M2M:\*\* comandos entre agentes exigem assinatura HMAC SHA-256 (previne movimentação lateral por Prompt Injection)  
\- \*\*BFs \<5ms e busca HNSW \<10ms:\*\* warmup JIT para evitar falso positivo no primeiro teste de performance

\#\# Next Steps  
1\. Aguardar revisão arquitetural da SPEC.md e dos 27 testes do Domínio de Hospitalidade  
2\. Implementar adaptador sqlite-vec como persistência para ZAOS-Memory (pendente da Fase 1\)  
3\. Implementar adaptador SQLite para KnowledgeGraph persistente  
4\. Implementar \`PrismaReservaRepository\`, \`PrismaHospedeRepository\` etc. na infraestrutura  
5\. Conectar Zé-Concierge como consumidor das portas segregadas

\#\# Critical Context  
\- \*\*1070 testes in-memory verdes:\*\* 96 arquivos, zero falhas, zero \`as any\`, zero \`@ts-ignore\`  
\- \*\*SPEC.md em \`zehla-backend/SPEC.md\`:\*\* 5 entidades (Hospede, Quarto, Reserva, Servico, Feedback), 5 portas segregadas, máquina de estados da Reserva com 6 regras de transição  
\- \*\*SPEC.md revisada:\*\* God Interface \`IHospitalityContextPort\` quebrada em 5 portas por agregado  
\- \*\*Result pattern em TODO o domínio:\*\* nenhum try/catch genérico no núcleo amarelo  
\- \*\*Testes de performance com warmup:\*\* primeira chamada descartada para evitar JIT false positive  
\- \*\*MapIterator fix:\*\* todas as iterações de \`Map.keys()\`/\`Map.values()\` usam \`Array.from()\`  
\- \*\*BH (Business Errors) mapeados:\*\* 17 códigos de erro de negócio do Domínio de Hospitalidade  
\- \*\*Diretriz futura:\*\* código é artefato descartável; SPEC.md \+ testes são os ativos corporativos blindados

\#\# Relevant Files  
\- \`SPEC.md\`: Especificação definitiva do Domínio de Hospitalidade (351 linhas, zero código)  
\- \`src/domain/hospitalidade/entities/Reserva.ts\`: Máquina de estados completa com validação interna  
\- \`src/domain/hospitalidade/entities/Hospede.ts\`: Entidade Hóspede com auto-validação  
\- \`src/domain/hospitalidade/entities/Quarto.ts\`: Entidade Quarto com status e diária  
\- \`src/domain/hospitalidade/entities/Servico.ts\`: Entidade Serviço com disponibilidade  
\- \`src/domain/hospitalidade/entities/Feedback.ts\`: Entidade Feedback imutável  
\- \`src/domain/hospitalidade/entities/StatusReserva.ts\`: Enum \+ tabela de transições válidas  
\- \`src/domain/hospitalidade/value-objects/Documento.ts\`: CPF ou passaporte  
\- \`src/domain/hospitalidade/value-objects/Money.ts\`: Valor em centavos (BRL)  
\- \`src/domain/hospitalidade/value-objects/DateRange.ts\`: Período com validação de sobreposição  
\- \`src/domain/hospitalidade/value-objects/Email.ts\`: Email validado  
\- \`src/application/hospitalidade/ports/IReservaPort.ts\`: Porta do agregado Reserva  
\- \`src/application/hospitalidade/ports/IHospedePort.ts\`: Porta do agregado Hóspede  
\- \`src/application/hospitalidade/ports/IQuartoPort.ts\`: Porta do agregado Quarto  
\- \`src/application/hospitalidade/ports/IServicoPort.ts\`: Porta do agregado Serviço  
\- \`src/application/hospitalidade/ports/IFeedbackPort.ts\`: Porta do agregado Feedback  
\- \`src/application/hospitalidade/use-cases/CreateReservaUseCase.ts\`: Cria reserva com validação de disponibilidade  
\- \`src/application/hospitalidade/use-cases/ConfirmarReservaUseCase.ts\`: Confirma e persiste  
\- \`src/application/hospitalidade/use-cases/CancelarReservaUseCase.ts\`: Cancela com motivo  
\- \`src/application/hospitalidade/use-cases/RealizarCheckInUseCase.ts\`: Check-in com tolerância de 2h  
\- \`src/application/hospitalidade/use-cases/RealizarCheckOutUseCase.ts\`: Check-out com aviso de 12h  
\- \`src/infrastructure/persistence/hospitalidade/InMemoryReservaRepository.ts\`: Repositório in-memory para testes  
\- \`src/\_\_tests\_\_/hospitalidade/reserva.test.ts\`: 27 testes — máquina de estados, multa, serviços, use cases, transições válidas  
\- \`src/infrastructure/scraping/GaussianDelayCalculator.ts\`: Box-Muller gaussiano (SB7)  
\- \`src/infrastructure/scraping/ProxyChainManager.ts\`: Proxy round-robin (SB7)  
\- \`src/application/scraping/ports/IScrapingPort.ts\`: Contrato de scraping (SB7)  
\- \`src/infrastructure/hardening/JwtGuard.ts\`: Zero-Trust JWT (SB8)  
\- \`src/infrastructure/hardening/HMACValidator.ts\`: Tempo constante (SB8)  
\- \`src/infrastructure/hardening/IdempotencyBarrier.ts\`: Barreira in-memory (SB8)  
\- \`src/domain/hardening/value-objects/TenantSession.ts\`: VO de sessão (SB8)  
\- \`src/\_\_tests\_\_/scraping/zaos-scraping.test.ts\`: 21 testes SB7  
\- \`src/\_\_tests\_\_/hardening/zaos-hardening.test.ts\`: 34 testes SB8  
\- \`src/\_\_tests\_\_/pentest/zaos-pentest-final.test.ts\`: 29 testes SB9 — LGPD, Canary, RCE, Jailbreak, Performance  
\- \`src/domain/shared/Result.ts\`: Tipo Result utilizado em todo o domínio  
\- \`SKILL.md\`: Leis imutáveis de Clean Architecture  
