# ZEHLA SmartHotel — Anchored Summary

## Domínios Implementados (ZEHLA PRIME)

| Domínio | SB | Status | Entidades | VOs | Ports | Use Cases / Services | In-Memory | Prisma | Testes |
|---|---|---|---|---|---|---|---|---|---|
| Hospitalidade | SB1–SB2 | ✅ | 4 | 5+ | 6 | — | 6 | Sim | 1097 |
| Comercial | SB8 | ✅ | 5 | 6 | 6 | 10 | 5 | Sim | ~200 |
| Revenue | SB14 + SB15 | ✅ | 4 (Appointment, Invoice, Contract, Transaction) | — | 4 | 6 | 4 | Sim (SB15) | ~50 |
| Marketing | SB17–SB20 | ✅ | 5 (Review, Campanha, Conteudo, Post, Metrica) | 3 (Sentimento, ScoreEngajamento, CanalDistribuicao) | 5 + 3 cross-context | 6 | 5 + 5 Prisma | Gerada (SB19) | 70 unit + 19 integration + 10 unit cognitive |
| Decision Router | SB24–SB25 | ✅ | 8 (BetaBinomialPosterior, BudgetGuard, CircuitBreakerState, PosteriorKey, ProviderCapabilityProfile, RoutingContext, RoutingDecision) | — | 2 (IRouterStatePort, IRoutingEventWriter) | 15 services | Adapter InMemory | SQLite (WAL, SB25) | 94 (65 ZaosNeuroRouter + 29 legado) |

## SB14 — Revenue Domain (Analyst)
- Entidades: Appointment, Invoice, Contract, Transaction
- 6 use cases: AgendarConsultoria, RegistrarFatura, ProcessarPagamentoFatura, GerarRelatorioReceita, GerenciarContrato, AtualizarPrecoContrato
- ZeAnalyst cognitive service integrado

## SB15 — Persistência Prisma Revenue
- 4 repositórios Prisma: AppointmentPrismaRepo, InvoicePrismaRepo, ContractPrismaRepo, TransactionPrismaRepo
- Committed: `f24b7d7`

## SB16 — ZeAnalyst Cognitive Service
- Já existente dentro do SB14 (ZeAnalyst integrado ao Revenue)
- Nada adicional a implementar

## SB17 — SPEC_MARKETING.md
- `docs/SPEC_MARKETING.md` created
- Cobre: Reviews, Campanhas Remarketing, Conteúdo, Posts, Métricas
- Cross-context: Comercial (promises), Canais OTA (readonly), ZeAnalyst (análise)

## SB18 — Marketing Domain (Materialização)
- 5 entities: Review, Campanha, Conteudo, Post, Metrica
- 3 VOs: Sentimento, ScoreEngajamento, CanalDistribuicao
- 5 ports + 3 cross-context interfaces
- 6 use cases: AnalisarSentimentoReview, ResponderReviewPortal, CriarCampanhaRemarketing, AgendarPost, CalcularMetricasMarketing, ProcessarWebhookReview
- 5 in-memory repos
- 70 testes passando (20 VOs + 35 entities + 18 use cases)

## SB19 — Persistência Prisma do Marketing
- 5 modelos adicionados ao schema.prisma com prefixo `Marketing` e `pousadaId` (RLS)
- 5 Prisma repositories implementando Data Mapper (`toData` / `hydrate`)
- Fail-fast: `hydrate()` rejeita dados corrompidos via `Result.fail()`
- Integração: 19 testes de persistência (salvar/reconstruir + RLS) em `__tests__/infrastructure/persistence/marketing/`
- Committed: `a42a219`

## SB20 — Zé-Marketer (Despertar Cognitivo)
- Cognitive service do agente de Marketing integrado ao ZCP
- Handoff automático: reviews críticas → Zé-Ops, promessas financeiras → Zé-Analyst
- 10/10 testes unitários
- Committed: `337d7a0`

## SB21 — Entrypoints HTTP e Webhooks
- Endpoints HTTP com validação HMAC/JWT
- Webhooks seguros para integração com canais OTA
- Committed: `268e6fc`

## SB23 — Presentational Dumb Components e Custom UI Hooks
- Componentes de apresentação puros (dumb components)
- Custom hooks de UI: useReservations, etc.
- Committed: `f425caf`

## SB24 — ZRouter (Cognitive Capabilities & Feature Map)
- Mapa de capacidades cognitivas do ZRouter
- Resolução de tipos TypeScript para Plan FREE
- Pricing Table, Commission, Entitlements, Lead-Scoring
- Correção de `any` types e compilação TypeScript
- Committed: `2eb355c`, `1f83f7f`, `bb424c1`, `910d194`, `4e0e362`

## SB25 — ZaosNeuroRouter CADMAS-CTX v2.0 (Lotes 1 a 6)
Bounded context de decisão neuroeconômica implementado em `src/domain/decision/`.

### Lote 1 — Modelos de Domínio Puro e VOs de Resiliência
- 8 modelos: BetaBinomialPosterior, BudgetGuard, CircuitBreakerState, PosteriorKey, ProviderCapabilityProfile, RoutingContext, RoutingDecision
- Amostragem Thompson, isolamento bayesiano, decaimento temporal
- Committed: `bc24b1e`, `69e9d6d`, `1adde4f`
- 32 testes unitários

### Lote 2 — Serviços de Domínio (A Engrenagem Analítica)
- ContextDiscretizer: classificação em 32 buckets (Fast Path regex + Feature Path Jaccard)
- MultiObjectiveReward: binarização de feedback (Qualidade >= 0.6 e Latência <= 2× SLA)
- AdaptiveStickiness: retenção dinâmica com sessionDecay e decaimento exponencial
- ParetoMultiObjectiveSelector: fronteira de Pareto eliminando soma linear
- ProviderCircuitBreaker: bloqueio granular por provedor + IRouterStatePort
- BudgetCircuitBreaker: inflação 3x ao atingir 80%, isolamento Tier 1 aos 95%
- Committed: `fe95b1f`
- 11 testes

### Lote 3 — Aggregate Root (ZaosNeuroRouter)
- Orquestrador completo do roteador neuroeconômico
- Prova de convergência dos subsistemas
- Committed: `f6cfab9`
- 2 testes

### Lote 4 — Infraestrutura de Persistência e Rede
- PosteriorRepository: SQLite real com better-sqlite3 (WAL, synchronous=NORMAL, busy_timeout=5000)
- PosteriorWriteBuffer: buffer circular com drenagem atômica a cada 500ms + shutdown hooks (SIGTERM/SIGINT)
- Snapshots diários em `./zehla_data/router_state/snapshots/`
- FallbackChainExecutor: timeout 5s por tentativa, teto global 8s, max 2 retries
- ProviderHealthMonitor: synthetic probes a cada 60s, abre CB após 2 falhas
- ShadowModeManager: rollout invisível não-bloqueante em background
- Committed: `7b82842`
- 8 testes de integração (incluindo timeouts reais de 5s e 8s)

### Lote 5 — Serviços Avançados
- HierarchicalTransfer: transferência hierárquica entre buckets
- QualityProxy: proxy de qualidade para provedores
- Committed: `7b82842`
- 7 testes

### Lote 6 — Observabilidade (Ports & Adapters)
- RouterMetricsCollector: métricas do roteador cognitivo
- Refatorado para arquitetura Ports & Adapters pura
- Committed: `e94b243`
- 5 testes

## Testes

- **Decision (ZaosNeuroRouter):** 94 testes (65 Lotes 1-6 + 29 zehla-router legado)
- **Total geral (apenas decision):** 94 testes, 7 suites, 100% verde
- **Total domínios ZEHLA PRIME (com decision):** 1540+ testes
- **Stack:** Vitest, in-memory + SQLite (Lote 4)

## Pendências Imediatas
- [ ] Sincronizar cópia Downloads com a fonte única de verdade (Projetos)
- [ ] Próximo avanço: definir roteiro para SB26+
