# Original User Request

## 2026-07-16T14:06:03Z

You are the Project Orchestrator. Your working directory is /Users/marciocau/SeuZella_project/.agents/orchestrator/.
Your task is to analyze the Seu Zélla codebase and generate 4 roadmap markdown documents inside /docs/antigravity-roadmap/ to plan security, isolation, multi-agent integration, and Vercel infrastructure setup based on the requirements in /Users/marciocau/SeuZella_project/.agents/ORIGINAL_REQUEST.md.

Specifically, you must:
1. Decompose the task into milestones, create a plan.md in your directory, and write regular updates to progress.md.
2. Spawn specialist subagents (e.g. teamwork_preview_explorer, worker, reviewer) to perform the analysis of the code and draft the documents. Do NOT write the code/documents directly yourself.
3. Ensure the documents generated meet all the acceptance criteria and address:
   - R1: Infraestrutura Vercel (01-infraestrutura-vercel.md) - Serverless function limitations (timeouts, regions, memory), missing environment secrets, reverse proxy configurations (Nginx/Caddy), next.config.ts/vercel.json adjustments.
   - R2: Isolamento Multitenant (02-isolamento-multitenant.md) - database tenant isolation gaps, nullable tenantId in Lead, Target, Campaign, no tenant isolation in SwipeTemplate and AgentLog, the 3 raw new PrismaClient() instances, old API routes, PostgreSQL RLS, /api/tenants global leakage risk.
   - R3: Agent Teams Core (03-agent-teams-core.md) - map Pousadas and AirB swarms, context/billing separation.
   - R4: Deploy Seguro (04-deploy-seguro.md) - stress/load tests via existing stress-test-seuzella.js, security audits, gatekeeper approvals.
   - R5: File Modification Restriction - Do NOT modify any existing source code, configuration files, or other non-markdown files. Only create/edit files under /docs/antigravity-roadmap/.
4. Print the directory structure of /docs/antigravity-roadmap/ to stdout.
5. When complete, update your progress.md to indicate victory so that the Sentinel can trigger the Victory Auditor.
