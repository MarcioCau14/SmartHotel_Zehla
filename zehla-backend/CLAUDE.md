# CLAUDE.md — Configurações e Diretrizes do Projeto ZEHLA

Este arquivo fornece comandos rápidos e diretrizes para agentes de IA que operam no repositório `zehla-backend`.

## Comandos Rápidos

- **Desenvolvimento:** `pnpm dev` ou `npm run dev`
- **Build:** `pnpm build` ou `npm run build`
- **Lint:** `pnpm lint` ou `npm run lint`
- **Testes:** `npx vitest run`
- **TypeScript:** `npx tsc --noEmit`
- **Prisma generate:** `npx prisma generate`
- **Prisma migrate:** `npx prisma migrate dev --name <nome>`

## Contexto do Projeto

- **Stack:** Next.js 16 (App Router), TypeScript 5 (strict), Prisma 5, Tailwind CSS v4 (Oxide, JIT+Rust), BullMQ, Redis 7, PostgreSQL 16.
- **Design System:** Estilo "Orange Fluorescent" inspirado no Supabase (premium, moderno, dark mode).
- **Arquitetura:** Clean Architecture + DDD estrito com Ports & Adapters. 17 Bounded Contexts. Result<T,E> monádico.
- **Resiliência:** Todo componente crítico isolado via Error Boundaries com protocolo `ZccAutoHealer`.

## Diretrizes de Código

1. **APIs do Next.js:** Server Components por padrão; "use client" só para interatividade. Siga convenções atuais do App Router.
2. **Tipagem:** TypeScript estrito. Evite `any`. Use tipos condicionais e mapeados quando apropriado.
3. **Segurança:** Prepared Statements (Prisma). Sem `--privileged` em Docker. Refresh Token Rotation.
4. **Node.js:** Evite `process.nextTick()` recursivo (pode causar starvation do Event Loop). Prefira `setImmediate()` para adiar trabalho.
5. **PostgreSQL:** Monitore autovacuum — tabelas de log (MLInteractionLog, FinancialAudit) são propensas a bloat.

## Arquitetura de Agentes

Classes de padrões usados no ZEHLA vs recomendados pela Anthropic:
- ✅ Chainagem (11 passos no agent-orchestrator)
- ✅ Roteamento (3 routers: ZehlaRouter, LLMRouter, free-llm-router)
- ✅ Paralelização (8 BullMQ queues, 7 workers)
- ✅ Orquestrador-Trabalhadores (agent-orchestrator + workers)
- ⚠️ LLM Aumentado (12 tool schemas definidos, mas **sem executor** — gap conhecido)
- ❌ Avaliador-Otimizador (Thompson Sampling só otimiza custo, não qualidade da resposta)
- ❌ Human-in-the-loop (não implementado)
- ❌ Audit trail de agente (não implementado)

## Documentos de Conhecimento (leia ao iniciar sessão)

| Arquivo | Conteúdo |
|---|---|
| `.opencode/anchor.md` | Âncora de memória — visão geral + checklist de auditoria |
| `AGENTS.md` | Subagentes (Arquiteto, Implementador, Revisor) + fluxo |
| `SKILL.md` | 10 leis imutáveis do ecossistema |
| `.agent/knowledge/ARCHITECTURAL_PRINCIPLES.md` | Princípios avançados (MVCC, Event Loop, Redis, OAuth, K8s, Go GMP) |
| `.agent/rules/akashic-cognitive-loop.md` | Ciclo cognitivo do Campo Akáshico |
| `.opencode/rules/auditoria-obrigatoria.md` | Checklist obrigatório antes de declarar "tudo ok" |
| `SPEC_GOLIVE.md` | Salvaguardas de produção |
| `.opencode/plans/ZEHLA_MASTER_DOC.md` | Documento mestre completo |

*Consulte sempre o `.opencode/anchor.md` como primeiro passo ao iniciar uma nova sessão.*

