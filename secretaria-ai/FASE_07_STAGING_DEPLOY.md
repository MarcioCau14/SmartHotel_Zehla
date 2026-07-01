# Fase 7 — Staging & Deploy Hostinger
**Status:** ⏸️ Config criada, aguardando VPS real (FASE_06)

## Configurações criadas (prontas para uso)

| Arquivo | O que faz |
|---------|-----------|
| `ecosystem.config.js` | PM2: 2 instâncias cluster, log rotation, restart automático |
| `deploy/nginx.conf` | Nginx: SSL, proxy reverso, WebSocket, cache, rate-limit, security headers |
| `deploy/setup-vps.sh` | Script completo: Node.js → clone → build → PM2 → Nginx → SSL → UFW → backup |

## Tarefas
- [x] 7.4 Configurar PM2 (ecosystem.config.js) — ✅ criado
- [x] 7.2 Configurar Nginx reverse proxy — ✅ nginx.conf criado
- [x] 7.12 Configurar firewall (UFW) — ✅ incluso no setup-vps.sh
- [x] 7.13 Configurar backup automático — ✅ cron incluso no setup-vps.sh
- [x] 7.15 CI/CD — ✅ cd.yml existente + script

- [ ] 7.1 Instalar dependências no VPS — 🔲 exec `bash deploy/setup-vps.sh` no VPS
- [ ] 7.3 Build de produção — 🔲 `bun run build` no VPS
- [ ] 7.5 Deploy da aplicação principal — 🔲
- [ ] 7.6 Deploy do mini-serviço realtime — 🔲 (Socket.IO não implementado, SSE via Next.js)
- [ ] 7.7 Configurar variáveis de ambiente — 🔲 criar .env no VPS
- [ ] 7.8-7.14 Testar rotas — 🔲 após deploy real
- [ ] 7.14 DNS apontando para produção — 🔲 após domínio registrado

## Dependências
- Fase 6 (domínio `seuzella.com`, VPS contratado) — 🔲 pendente
