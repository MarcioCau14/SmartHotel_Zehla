# ZEHLA — Rotas da API

Todas as rotas utilizam o **Next.js App Router** e estão sob `/api/*`. Autenticação via NextAuth (JWT) ou `X-Api-Key` para webhooks.

## Grupos de Rotas

### `/api/auth/*` (3 rotas)

| Rota | Descrição |
|------|-----------|
| `[...nextauth]` | Handler NextAuth (GET/POST) — login social, sessions |
| `login` | Login com email+password (bcrypt) |
| `register` | Registro de novo usuário |

### `/api/agents/*` (9 rotas)

| Rota | Descrição |
|------|-----------|
| `GET /api/agents` | Lista status de todos os agentes |
| `POST /api/agents/concierge` | Agente concierge (recomendações, serviços) |
| `POST /api/agents/financial` | Agente financeiro (Maria — análise de custos) |
| `POST /api/agents/guardian` | Agente de segurança (Zelador — monitoramento) |
| `POST /api/agents/housekeeping` | Agente de governança (limpeza, manutenção) |
| `POST /api/agents/learner` | Agente de aprendizado (MiroFish — análise de leads) |
| `POST /api/agents/marketing` | Agente de marketing (estratégias, campanhas) |
| `POST /api/agents/receptionist` | Agente recepcionista (Jony — check-in, reservas) |
| `POST /api/agents/reservations` | Gestão de reservas via IA |

### `/api/brain/*` (5 rotas)

| Rota | Descrição |
|------|-----------|
| `GET /api/brain` | Status do Hermes Brain |
| `POST /api/brain/chat` | Chat com o Hermes (LLM via OpenRouter) |
| `GET /api/brain/health` | Health check do serviço cognitivo |
| `POST /api/brain/predict` | Predições baseadas em dados históricos |
| `POST /api/brain/simulations` | Simulações (ex: sazonalidade, precificação) |

### `/api/blast/*` (3 rotas)

| Rota | Descrição |
|------|-----------|
| `GET/POST /api/blast/campaigns` | CRUD de campanhas de marketing |
| `POST /api/blast/campaigns/[id]/launch` | Disparar campanha |
| `POST /api/blast/webhook` | Webhook de eventos de entrega |

### `/api/connect/*` (6 rotas)

| Rota | Descrição |
|------|-----------|
| `GET/PUT /api/connect/profile` | Gerenciar perfil Link-in-Bio |
| `GET /api/connect/profile/[slug]` | Perfil público (sem auth) |
| `GET/POST /api/connect/links` | CRUD de links do perfil |
| `PUT/DELETE /api/connect/links/[id]` | Atualizar/remover link |
| `GET /api/connect/analytics` | Analytics consolidado |
| `POST /api/connect/analytics/track` | Rastrear view/click |

### `/api/crm/*` (9 rotas)

| Rota | Descrição |
|------|-----------|
| `GET/POST /api/crm/pipelines` | CRUD de pipelines |
| `GET/POST /api/crm/contacts` | CRUD de contatos |
| `GET/PUT/DELETE /api/crm/contacts/[id]` | Gerenciar contato individual |
| `GET/POST /api/crm/contacts/[id]/interactions` | Interações do contato |
| `GET/POST /api/crm/deals` | CRUD de negócios |
| `GET/PUT/DELETE /api/crm/deals/[id]` | Gerenciar negócio |
| `PATCH /api/crm/deals/[id]/stage` | Avançar estágio no pipeline |
| `GET/POST /api/crm/tasks` | CRUD de tarefas |
| `PUT/DELETE /api/crm/tasks/[id]` | Gerenciar tarefa |

### `/api/leads/*` (3 rotas)

| Rota | Descrição |
|------|-----------|
| `GET/POST /api/leads` | CRUD de leads |
| `POST /api/leads/batch` | Importação em lote (planilhas) |
| `GET /api/leads/analytics` | Analytics de leads (score, origem, conversão) |

### `/api/swipes/*` (7 rotas)

| Rota | Descrição |
|------|-----------|
| `GET/POST /api/swipes` | CRUD de swipes (matches lead-propriedade) |
| `GET/PUT/DELETE /api/swipes/[id]` | Gerenciar swipe individual |
| `POST /api/swipes/match` | Executar matching lead→propriedade |
| `POST /api/swipes/seed` | Semear leads no matching |
| `POST /api/swipes/send-email` | Disparar email para lead matched |
| `GET /api/swipes/stats` | Estatísticas de swipes |
| `POST /api/swipes/track` | Rastrear conversão de swipe |

### `/api/trends/*` (6 rotas)

| Rota | Descrição |
|------|-----------|
| `GET /api/trends/dashboard` | Dashboard de tendências de mercado |
| `GET /api/trends/forecast` | Previsões de ocupação/demanda |
| `GET /api/trends/keywords` | Palavras-chave em alta |
| `GET /api/trends/signals` | Sinais de mercado (eventos, sazonalidade) |
| `POST /api/trends/sync` | Sincronizar dados de tendências |
| `POST /api/trends/alerts` | Configurar alertas de tendência |

### `/api/webhooks/*` (5 rotas)

| Rota | Descrição |
|------|-----------|
| `POST /api/webhooks/whatsapp` | Webhook WhatsApp (Evolution API) |
| `POST /api/webhooks/stripe` | Webhook Stripe (pagamentos) |
| `POST /api/webhooks/pix` | Webhook PIX (Asaas/Pagarme/OpenPix) |
| `POST /api/webhooks/pagarme` | Webhook Pagar.me |
| `POST /api/webhooks/delivery-events` | Eventos de entrega (Blast) |

### `/api/zcc/*` (16 rotas)

| Rota | Descrição |
|------|-----------|
| `GET /api/zcc/overview` | Overview do ZCC (KPIs gerais) |
| `GET /api/zcc/properties` | Lista de propriedades |
| `GET /api/zcc/leads` | Gestão de leads (ZCC) |
| `GET /api/zcc/agents` | Status dos agentes |
| `GET/PUT /api/zcc/dna` | DNA da propriedade (config) |
| `POST /api/zcc/dna/clone` | Clonar DNA entre propriedades |
| `GET /api/zcc/radar` | Radar de oportunidades |
| `GET /api/zcc/team` | Gestão de equipe |
| `GET /api/zcc/terminal` | Terminal administrativo |
| `POST /api/zcc/telemetry` | Telemetria de uso |
| `GET /api/zcc/finance/dashboard` | Dashboard financeiro ZCC |
| `GET /api/zcc/financeiro` | Financeiro (detalhado) |
| `POST /api/zcc/financeiro/spreadsheet` | Importar planilha financeira |
| `POST /api/zcc/whatsapp/extract` | Extrair dados de conversas WhatsApp |
| `GET /api/zcc/swipes/match` | Swipe match (ZCC) |
| `GET/POST /api/zcc/security/alerts` | Alertas de segurança |

### `/api/zmg/*` (3 rotas)

| Rota | Descrição |
|------|-----------|
| `GET /api/zmg` | Status Zehla Magic |
| `POST /api/zmg/messages` | Enviar mensagem mágica |
| `GET /api/zmg/stats` | Estatísticas de uso |

### Outras Rotas

| Rota | Descrição |
|------|-----------|
| `GET /api/health` | Health check da API |
| `GET /api/metrics` | Métricas Prometheus |
| `POST /api/security` | Reportar/consultar incidentes |
| `POST /api/checkout` | Checkout de planos (Stripe) |
| `GET/POST /api/config/keys` | Gerenciar chaves de API |
| `POST /api/trial` | Iniciar trial |
| `POST /api/terminal` | Terminal de comandos |
| `GET /api/tenant` | Informações do tenant atual |
| `POST /api/onboarding` | Onboarding de propriedade |
| `GET/POST /api/properties` | CRUD de propriedades (dashboard) |
| `GET/POST /api/reservations` | Reservas (dashboard) |
| `GET/POST /api/rooms` | Quartos (dashboard) |
| `GET /api/revenue/kpis` | KPIs de receita |
| `POST /api/telemetry/events` | Eventos de telemetria |
| `GET /api/track/click/[leadId]` | Tracking de clique (pixel) |
| `GET /api/track/pixel/[leadId]` | Pixel de rastreamento |
| `POST /api/mkt/track` | Tracking de marketing |
| `POST /api/exclusive/waitlist` | Waitlist de funcionalidades |
| `POST /api/help/chat` | Chat de ajuda/suporte |
| `GET/POST /api/marketing/*` | Marketing (lead magnet, email) |
| `GET /api/events/*` | Eventos (track, stats, webhook) |
| `GET /api/fish/*` | MiroFish (enrich, report, upload) |
| `GET /api/visibility/*` | Visibilidade online (reviews, raiox, post-syncer) |
