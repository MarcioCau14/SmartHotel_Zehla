## Testes Manuais — ZEHLA SmartHotel

### Como usar
1. Siga cada checklist por fase
2. Marque [x] quando passar, [ ] quando falhar
3. Ao falhar, anote o erro em "Falhas encontradas"

---

### Fase 1 — Schema & Auth
- [ ] `bun run db:push` executa sem erros
- [ ] `bunx prisma generate` gera cliente Prisma
- [ ] GET /api/auth/session retorna 401 sem cookie
- [ ] POST /api/auth/register cria tenant com sucesso
- [ ] POST /api/auth/register retorna 400 se email duplicado

### Fase 2 — Brain (Secretaria Components)
- [ ] GET /api/brain/health retorna 200
- [ ] POST /api/agent/disparar-elite-button funciona
- [ ] POST /api/agent/api-hooks funciona
- [ ] Componentes Secretaria retornam 401 sem auth
- [ ] Testes: `bun run test` passa sem falhas

### Fase 3 — Download & Debug-Agent
- [ ] GET /api/download/test.pdf retorna arquivo
- [ ] GET /api/download/../../../etc/passwd retorna 400 (path traversal)
- [ ] POST /api/debug-agent retorna logs do agente
- [ ] POST /api/debug-agent/github retorna dados do repo
- [ ] POST /api/debug-agent/knowledge retorna entries rankeadas

### Fase 4 — Guards (JWT + Rate-Limit + sendError)
- [ ] Rota DDC sem auth retorna 401
- [ ] Rota DDC com rate-limit excedido retorna 429
- [ ] Rota Checkout sem session retorna 401
- [ ] Checkout pix-status verifica ownership da transação
- [ ] Erros usam formato `{ success, error: { code, message } }`

### Fase 5 — Infraestrutura
- [ ] CI passa no GitHub Actions (lint + test + typecheck)
- [ ] CD pipeline deploya staging/main
- [ ] `bun run typecheck` retorna 0 erros
- [ ] `bun run lint` retorna 0 erros
- [ ] `bun run test` retorna 141+ testes passando
- [ ] Workflows: ci.yml, cd.yml, browser-executor.yml, deploy-*.yml existem

### Fase 6 — (planejada)
- [ ] (placeholder)

---

### Rollback Procedure
1. `git log --oneline -5` para ver últimos commits
2. `git revert HEAD --no-edit` para reverter última alteração
3. `git push origin develop` para atualizar remoto
4. Verificar se CI passa após o revert

### Falhas encontradas
| Data | Fase | Teste | Erro |
|------|------|-------|------|
| | | | |
