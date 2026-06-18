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
