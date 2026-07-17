# Project: Seu Zélla Roadmap Generation

## Architecture
- Input: `/Users/marciocau/SeuZella_project/.agents/ORIGINAL_REQUEST.md` (verbatim request).
- Output: 4 roadmap markdown documents in `/docs/antigravity-roadmap/`:
  1. `01-infraestrutura-vercel.md`
  2. `02-isolamento-multitenant.md`
  3. `03-agent-teams-core.md`
  4. `04-deploy-seguro.md`
- Constraints: No code modification, follow dispatch-only architecture, use subagents for analysis/writing.

## Milestones
| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| 1 | Explore & Analyze | Spawn Explorer to audit the codebase for Vercel infra, multi-tenant isolation, agent teams, and secure deployment. | None | DONE |
| 2 | Draft R1 & R2 | Spawn Worker to write `01-infraestrutura-vercel.md` and `02-isolamento-multitenant.md`. | M1 | DONE |
| 3 | Draft R3 & R4 | Spawn Worker to write `03-agent-teams-core.md` and `04-deploy-seguro.md`. | M1 | DONE |
| 4 | Review & Verify | Spawn Reviewer to check all 4 files against specifications. Print structure & finalize. | M2, M3 | DONE |

## Interface Contracts
### Explorer ↔ Worker
- Explorer must produce detailed, actionable, and file/path-specific recommendations for each requirement (R1-R4) in `analysis.md`.
- Worker must use the exact files/paths identified by Explorer and expand on them to write the markdown roadmaps.

## Code Layout
- Target directory: `/docs/antigravity-roadmap/`
- Working agent metadata directories: `.agents/`
