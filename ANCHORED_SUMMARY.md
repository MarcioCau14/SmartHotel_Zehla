# ZEHLA SmartHotel — Anchored Summary

## Domínios Implementados (ZEHLA PRIME)

| Domínio | SB | Status | Entidades | VOs | Ports | Use Cases | In-Memory | Prisma | Testes |
|---|---|---|---|---|---|---|---|---|---|
| Hospitalidade | SB1–SB2 | ✅ | 4 | 5+ | 6 | — | 6 | Sim | 1097 |
| Comercial | SB8 | ✅ | 5 | 6 | 6 | 10 | 5 | Sim | ~200 |
| Revenue | SB14 + SB15 | ✅ | 4 (Appointment, Invoice, Contract, Transaction) | — | 4 | 6 | 4 | Sim (SB15) | ~50 |
| Marketing | SB17–SB19 | ✅ | 5 (Review, Campanha, Conteudo, Post, Metrica) | 3 (Sentimento, ScoreEngajamento, CanalDistribuicao) | 5 + 3 cross-context | 6 | 5 + 5 Prisma | Não gerada | 70 unit + 19 integration |

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
- Não committed ainda

## Testes
- Total: 1559 testes passando (125 suites)
- Próximo passo: Prisma repos para Marketing + testes de integração

## Pendências Imediatas
- [ ] Rodar `npx prisma migrate dev --name sb19_marketing_persistence` com banco local ativo
- [ ] SB20: Zé-Marketer — despertar cognitivo do agente de Marketing

## SB19 — Persistência Prisma do Marketing
- 5 modelos adicionados ao schema.prisma com prefixo `Marketing` e `pousadaId` (RLS)
- 5 Prisma repositories implementando Data Mapper (`toData` / `hydrate`)
- Fail-fast: `hydrate()` rejeita dados corrompidos via `Result.fail()`
- Integração: 19 testes de persistência (salvar/reconstruir + RLS) em `__tests__/infrastructure/persistence/marketing/`
- Committed: a42a219
