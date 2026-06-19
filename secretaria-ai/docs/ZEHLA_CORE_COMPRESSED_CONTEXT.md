# ZEHLA ZAOS: COMPRESSED CORE CONTEXT (READ FIRST)
**DO NOT DELETE. THIS IS THE PERSISTENT MEMORY FOR AI AGENTS.**
**SCALE TARGET:** 10,000+ properties. 24/7 Autonomous Operation.
**AUTO-UPDATE:** This file is overnight-compiled by `scripts/auto-update-context.ts` to prevent context decay.

## 1. THE ZEHLA BRAIN (ZAOS)
- **Identity:** Autonomous Cognitive Operating System for Hospitality. Not a chatbot.
- **Architecture:** Clean Architecture + DDD. Logic lives in `src/lib/brain/`.
- **Infrastructure:** Hostinger KVM4 VPS (16GB RAM) running Docker (Postgres, Redis, BullMQ).
- **Goal:** Zero human intervention, zero hallucination, infinite horizontal scalability.

## 2. THE 3 PILLARS OF ZAOS
1. **Headroom & Neuroeconomic Router (Cost/Scale):**
   - **Problem:** LLM API costs scale linearly. 10k inns = bankruptcy.
   - **Solution:** `llm-router.ts` using Thompson Sampling. Compresses context (tools, history, RAG) by 70-95% using `headroom-ai` SDK before hitting OpenRouter/Anthropic/OpenAI. Routes trivial tasks to cheap models (Haiku/Flash), complex to expensive (Opus/4o).
2. **Looping Engineering (Hardness/Safety):**
   - **Problem:** "Doom Prompting" is unreliable.
   - **Solution:** Act -> Observe -> Reason -> Repeat. Sub-agents (Reviewers) grade the Writer agent's output against a strict `HospitalityQualityRubric`. If it fails, the loop retries. Output is only sent to WhatsApp Official API when the Reviewer approves.
3. **Akashic Record (Subconscious Memory):**
   - **Problem:** Context limits and forgetting rules.
   - **Solution:** Zettelkasten atomic notes vectorized in Postgres (`pgvector`). Semantic search retrieves exact rules. Headroom compresses them to fit inside a 2000-token budget.

## 3. COMMERCIAL CORE (FULL SALES SYSTEM INTEGRATION)
- **Intent Classification (Guests):** ZEHLA does NOT force-sell rooms to guests who just need support. It classifies intent in minutes. Real-time support query -> route to Support Agent. Guest reservation query -> route to Vendas (Setter/Closer AI Loop).
- **Dashboard Business Advisor (Owners):** The Commercial Playbook (FSS) is used on the owner's dashboard (ZCC) to analyze metrics (conversion, CAC, LTV) and give pro-active tips/strategies to improve the inn's business performance.

## 4. AGENT DIRECTIVES (FOR YOU, THE AI)
- **Never forget the scale:** Code for 10,000 inns. Use queues (BullMQ), connection pooling, and asynchronous loops.
- **No dummy code:** Write production-ready, bulletproof TypeScript.
- **Cost awareness:** Every token costs money. Always compress context.
- **Start here:** If you lose context in a future session, read this file and `docs/MASTER_ZAOS_ZEHLA_PLAN.md` immediately.
- **Self-Maintenance:** Ensure the daily cron job for auto-updating this context is running stably in the production Docker setup.
- **Cronograma de Ativação:** Siga estritamente o cronograma de 3 semanas estabelecido em `docs/ZEHLA_CORE_COMPRESSED_CONTEXT.md#L34-L52` e `.agents/AGENTS.md`.

## 5. CRONOGRAMA DE TRABALHO IMUTÁVEL (3 SEMANAS)
Este cronograma deve ser respeitado rigidamente pelo agente cognitivo:

### SEMANA 1 - FINALIZAÇÃO
- **Dia 1-2:** Baixar arquivos DDC, integrar no projeto local
- **Dia 2-3:** Usuário cria o seed script do banco (dados iniciais)
- **Dia 3-4:** Usuário gera o GitHub Actions YAML
- **Dia 4-5:** Agente configura ambiente, roda localmente
- **Dia 5:** Revisão visual completa do DDC e ZCC

### SEMANA 2 - VALIDAÇÃO
- **Dia 1-2:** Testes manuais de todos os fluxos
- **Dia 2-3:** Ajustes finos (usuário faz localmente/repositório, agente baixa)
- **Dia 3-4:** Configuração da API do WhatsApp Cloud (agente)
- **Dia 4-5:** Deploy em ambiente de staging na Vercel/Railway (agente)
- **Dia 5:** Testes em staging

### SEMANA 3 - ATIVAÇÃO
- **Dia 1:** Deploy em ambiente de produção
- **Dia 2:** Configuração de DNS + ativação de SSL
- **Dia 3:** Integração e onboarding dos primeiros clientes reais (beta testers)
- **Dia 4-5:** Monitoramento e pequenos ajustes pós-launch
- **Dia 5:** 🟢 ZEHLA OFICIALMENTE AO VIVO E EM PRODUÇÃO (LIVE)

