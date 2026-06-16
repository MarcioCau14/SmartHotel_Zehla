# ZEHLA BACKEND — Âncora de Memória do Projeto

## Localização
`/Users/marciocau/Downloads/SmartHotel_Zehla/zehla-backend`

## Stack
- **Runtime:** Node.js (Next.js 16 App Router)
- **Linguagem:** TypeScript 5 (strict)
- **ORM:** Prisma 5 + PostgreSQL 16
- **Cache/Sessões:** Redis 7
- **Filas:** BullMQ (8 queues, 7 workers)
- **Estilização:** Tailwind CSS v4 (Oxide)
- **Testes:** Vitest (1658 testes, 134 suites) + Playwright (E2E)

## Arquitetura
- Clean Architecture + DDD (Ports & Adapters)
- 17 Bounded Contexts
- Result<T,E> monádico (sem exceções para fluxo de negócio)
- Value Objects imutáveis com autovalidação
- Domínio 100% isolado de frameworks

## Documentos Canônicos (leitura obrigatória ao iniciar sessão)

| Documento | Função |
|---|---|
| `CLAUDE.md` | Comandos rápidos, diretrizes do projeto |
| `AGENTS.md` | Subagentes (Arquiteto, Implementador, Revisor) + fluxo de trabalho |
| `SKILL.md` | 10 leis imutáveis do ecossistema ZEHLA |
| `.agent/knowledge/ARCHITECTURAL_PRINCIPLES.md` | Princípios arquiteturais avançados (MVCC, Event Loop, OAuth, Redis) |
| `.agent/knowledge/ML_BRAIN_LOGIC_SNAPSHOT.md` | Lógica do cérebro ML |
| `.agent/rules/akashic-cognitive-loop.md` | Ciclo cognitivo do Campo Akáshico |
| `.opencode/plans/ZEHLA_MASTER_DOC.md` | Documento mestre completo do projeto |
| `SPEC_GOLIVE.md` | Salvaguardas de produção (Idempotência, FinOps, WhatsApp FSM) |
| `.agent/rules/auditoria-obrigatoria.md` | Checklist de auditoria obrigatória antes de declarar "tudo ok" |

## Checklist de Auditoria Obrigatória
Sempre que solicitado a "verificar se está tudo ok":
1. `npx tsc --noEmit` — zero erros em src/ ativo
2. `grep "InMemory\|Mock\|Fake" src/app/api/` — zero mocks em produção
3. Cruzar `prisma.X` usados no código vs models no schema.prisma
4. Verificar se `middleware.ts` existe e não é `.bak`
5. `npx vitest run` — testes verdes

## Estado Atual (Junho 2026)
- **Fase:** Lançamento (Stage 3) — aguardando CNPJ para Go-Live físico
- **Maturidade de Agentes:** Level 2+ (roteamento + chainagem consolidados, tools definidas mas sem executor)
- **Gaps conhecidos:** ToolExecutor ausente, Evaluator-Optimizer de qualidade ausente, audit trail de agente ausente, human-in-the-loop ausente
