# Original User Request

## Initial Request — 2026-07-16T14:05:51Z

Generate 4 roadmap markdown documents inside `/docs/antigravity-roadmap/` to plan the security, isolation, multi-agent integration, and Vercel infrastructure setup for the Seu Zélla project, based on the findings from the initial code audit.

Working directory: /Users/marciocau/SeuZella_project
Integrity mode: development

## Requirements

### R1. Infraestrutura Vercel (`01-infraestrutura-vercel.md`)
Analyze and document Serverless function limitations (timeouts, regions, memory), missing environment secrets, reverse proxy configurations (Nginx/Caddy), and necessary next.config.ts/vercel.json adjustments.

### R2. Isolamento Multitenant (`02-isolamento-multitenant.md`)
Analyze database tenant isolation gaps, including: nullable `tenantId` in critical models (Lead, Target, Campaign), models with no tenant isolation (SwipeTemplate, AgentLog), the 3 raw `new PrismaClient()` instances bypassing encryption, old API routes importing the wrong client, lack of RLS/PostgreSQL, and the `/api/tenants` global leakage risk.

### R3. Agent Teams Core (`03-agent-teams-core.md`)
Map the sub-agent swarms for Pousadas (focused on PIX checkout/reconciliation, calendar sync) and AirB (focused on RAG, scraping jobs, regional knowledge, host persona), ensuring strict separation of contexts and billing.

### R4. Deploy Seguro (`04-deploy-seguro.md`)
Define the verification plan including automated stress/load tests (utilizing the existing `stress-test-seuzella.js` configuration), security audits, and gatekeeper approval protocols.

### R5. File Modification Restriction
Do NOT modify any existing source code, configuration files, or other non-markdown files in the workspace. Only create/edit files under `/docs/antigravity-roadmap/`.

## Acceptance Criteria

### Document Structure & Quality
- [ ] Create `/docs/antigravity-roadmap/` directory.
- [ ] Four distinct markdown files generated: `01-infraestrutura-vercel.md`, `02-isolamento-multitenant.md`, `03-agent-teams-core.md`, and `04-deploy-seguro.md`.
- [ ] Each document contains actionable, technical explanations referencing specific files and paths in the workspace.
- [ ] Directory structure of `/docs/antigravity-roadmap/` is printed to stdout.
