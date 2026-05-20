# CLAUDE.md — Configurações e Diretrizes do Projeto ZEHLA

Este arquivo fornece comandos rápidos e diretrizes para agentes de IA que operam no repositório `zehla-backend`.

## Comandos Rápidos

- **Desenvolvimento:** `pnpm dev` ou `npm run dev`
- **Build:** `pnpm build` ou `npm run build`
- **Lint:** `pnpm lint` ou `npm run lint`

## Contexto do Projeto

- **Stack:** Next.js (App Router), TypeScript, Prisma (ORM), Tailwind CSS (v4), BullMQ (Filas).
- **Design System:** Estilo "Orange Fluorescent" inspirado no Supabase (premium, moderno, dark mode).
- **Arquitetura de Resiliência:** Todo componente crítico deve ser isolado via *Error Boundaries* utilizando o protocolo `ZccAutoHealer`.

## Diretrizes de Código

1. **APIs do Next.js:** Atenção às APIs obsoletas. Siga estritamente as convenções do Next.js atual (veja `AGENTS.md`).
2. **Tipagem:** TypeScript estrito. Evite o uso de `any`.
3. **Segurança:** Nunca exponha chaves de API no código. Use variáveis de ambiente (`.env.local`).

## Manifesto do Cérebro (ZCC)

As regras de orquestração do ecossistema, princípios de auto-regeneração e detalhes sobre o Swarm de Agentes estão centralizados em:
👉 **[AGENTS.md](file:///Users/marciocau/zehla-backend/AGENTS.md)**

*Consulte sempre o AGENTS.md antes de realizar alterações arquiteturais.*

