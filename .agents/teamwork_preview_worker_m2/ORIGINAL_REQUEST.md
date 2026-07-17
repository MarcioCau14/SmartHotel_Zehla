## 2026-07-16T14:28:27Z
Objective: Generate 4 roadmap markdown documents inside `/docs/antigravity-roadmap/` to plan the security, isolation, multi-agent integration, and Vercel infrastructure setup for the Seu Zélla project, based on the findings from the codebase analysis report.

Scope Boundaries:
- Do NOT modify any existing source code, configuration files, or other non-markdown files. Only create/edit markdown files under `/docs/antigravity-roadmap/`.
- All written documents must be structured, technical, and highly actionable, written in Portuguese to match the roadmap theme.

Input Information:
- Workspace root: /Users/marciocau/SeuZella_project
- Explorer analysis report: /Users/marciocau/SeuZella_project/.agents/teamwork_preview_explorer_m1/analysis.md
- Verbatim request: /Users/marciocau/SeuZella_project/.agents/orchestrator/ORIGINAL_REQUEST.md

Output Files & Content Requirements:
1. `/docs/antigravity-roadmap/01-infraestrutura-vercel.md`
   - Serverless timeouts, memory, and region configuration (`gru1` Hardcoded in Vercel config).
   - Analysis of proxy security flaws: describe the severe vulnerability in `Caddyfile` allowing query-based proxying (`XTransformPort`).
   - Nginx configuration: describe the 60s proxy timeouts and rate limits (global, auth, webhook, api zones).
   - next.config.ts standalone output and external package packaging.
   - Identifying missing environment secrets.
2. `/docs/antigravity-roadmap/02-isolamento-multitenant.md`
   - Database schema gaps: nullable `tenantId` in `Lead`, `Target`, `Campaign`. Lack of `tenantId` in `SwipeTemplate` and `AgentLog`.
   - The 3 raw `new PrismaClient()` instances in classifier, event-processor, and scorer bypassing the encryption middleware.
   - Legacy routes importing raw client: metrics and reservations route files.
   - Dynamic tenant proxy gaps (`withTenant` in `src/lib/tenant-extension.ts` bypassing `findUnique`, `update`, `delete`, `upsert` and omitting Airbnb/Lead/Target/Campaign models).
   - Public global leakage risk at `/api/tenants` lacking authentication checks.
   - Actionable roadmap to refactor these client instances, migrate the schema, and map out a future migration path from SQLite to PostgreSQL Row Level Security (RLS).
3. `/docs/antigravity-roadmap/03-agent-teams-core.md`
   - Map out Pousada swarms: intent-driven chain of handlers (Security, IntentClassifier, TrialValidator, Receipt, PromptBuilder, ToolCalling, SemanticCache, LLMExecution, Logging, Voice) and roles (Receptionist, Reservations, Housekeeping, Concierge, Financial, System), including the finance sub-agents (Jony, Maria, Tedd).
   - Map out Airbnb swarms (Concierge, Check-In, Resolver, Reservas, Anfitrião) and describe the PIX filter gate check (`gatekeeper.ts#filterPixFromResponse`) preventing payment leaks.
   - Document how context and billing are separated (AirB prefixed tables for data isolation, Subscription vs AirBSubscription/AirBTransaction, plans like airb_pro/airb_max).
4. `/docs/antigravity-roadmap/04-deploy-seguro.md`
   - Explain the execution phases of `stress-test-seuzella.js` (Auth, Leak Verification, Webhook Stress, DDC API Stress, Brute Force Protection).
   - Detail how to automate it in CI/CD pipeline (e.g. GitHub Actions) to run tests against local server instance and fail the deployment if any leak or issue is found.
   - Detail gatekeeper approval protocols (code review requirements, security audit checklists).

Completion Criteria:
- The `/docs/antigravity-roadmap/` directory is created.
- All 4 files are generated with full, detailed, professional Portuguese markdown contents.
- Send a completion message back to parent (conversation ID: d252234e-13c7-49b1-a9f6-7c7cfd22f849) reporting the absolute paths of the created files.
