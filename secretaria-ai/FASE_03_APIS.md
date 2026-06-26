# Fase 3 — APIs
**Status:** ✅ Concluída

## Escopo
52+ rotas de API REST para todas as funcionalidades do Seu Zélla (excluindo brain, DDC, checkout e auth que estão em fases específicas).

## Rotas Implementadas

### Health & Readiness
- `GET /api/health` — Health check
- `GET /api/readiness` — Readiness probe

### Agentes
- `GET /api/agents` — Listar agentes
- `GET /api/agent-logs` — Logs dos agentes

### Leads
- `GET /api/leads` — Listar leads
- `POST /api/leads` — Criar lead
- `GET /api/leads/[id]` — Detalhe do lead
- `PATCH /api/leads/[id]` — Atualizar lead
- `DELETE /api/leads/[id]` — Remover lead

### Campanhas
- `GET /api/campaigns` — Listar campanhas
- `POST /api/campaigns` — Criar campanha
- `GET /api/campaigns/[id]` — Detalhe da campanha
- `PATCH /api/campaigns/[id]` — Atualizar campanha

### Targets
- `GET /api/targets` — Listar targets
- `POST /api/targets` — Criar target
- `GET /api/targets/[id]` — Detalhe do target
- `PATCH /api/targets/[id]` — Atualizar target

### Hunt (Prospecção)
- `GET /api/hunt` — Iniciar caça
- `GET /api/hunt-stream` — Stream de prospecção

### Dashboard
- `GET /api/dashboard/overview` — Visão geral
- `GET /api/dashboard/bookings` — Reservas

### ZCC
- `GET /api/zcc/dashboard-stats` — Estatísticas do ZCC

### V1 (Legado)
- `GET /api/v1/metrics` — Métricas
- `GET /api/v1/reservations` — Reservas
- `GET /api/v1/loops` — Loops

### Config
- `GET /api/config/keys` — Chaves de configuração

### Segurança
- `GET /api/security` — Status de segurança

### Webhooks
- `POST /api/webhook-whatsapp` — Webhook WhatsApp (mock)

### Proxy
- `GET /api/proxy/[...path]` — Proxy genérico

### Cron Jobs
- `POST /api/cron/budget-reset` — Reset de orçamento (diário)
- `POST /api/cron/metrics-snapshot` — Snapshot de métricas

### Utilitários
- `GET /api/roi` — Cálculo de ROI
- `GET /api/monitoring` — Monitoramento
- `GET /api/export/leads` — Exportar leads
- `GET /api/bulk-whatsapp` — WhatsApp em lote
- `GET /api/swipe-templates` — Templates de swipe
- `GET /api/tenants` — Gerenciar tenants

### Diagnóstico
- `GET /api/diagnose` — Diagnóstico do sistema
- `POST /api/debug-agent` — Debug de agente
- `POST /api/debug-agent/github` — Debug GitHub
- `POST /api/debug-agent/knowledge` — Debug knowledge

### Root
- `GET /api` — API root
