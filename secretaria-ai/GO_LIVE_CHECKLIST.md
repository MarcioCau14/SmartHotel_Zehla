# ==============================================================================

# ZEHLA SmartHotel — Go-Live Checklist & Operações (Semana 3)

# ==============================================================================

STATUS: PENDENTE — APROVACAO DA SEMANA 2 NECESSARIA  
---

## Cronograma Semana 3

| Dia | Atividade | Detalhes |
| :---- | :---- | :---- |
| DIA 1 | Deploy em Producao | Vercel + Railway (prod) |
| DIA 2 | DNS & SSL | Dominio zehla.com.br |
| DIA 3 | Beta Onboarding | Primeiros clientes reais |
| DIA 4 | Monitoramento | Metricas reais Thompson Sampling |
| DIA 5 | ZEHLA NO AR | Lancamento oficial |

---

## DIA 1 — Deploy em Producao

### 1.1 Preparar GitHub Secrets

| Secret | Fonte |
| :---- | :---- |
| VERCEL_TOKEN | vercel.com/account/tokens |
| VERCEL_ORG_ID | .vercel/project.json |
| VERCEL_PROJECT_ID_STAGING | .vercel/project.json |
| VERCEL_PROJECT_ID_PRODUCTION | .vercel/project.json |
| RAILWAY_TOKEN | railway.app/account/tokens |
| RAILWAY_SERVICE_ID_REALTIME | Dashboard Railway |
| RAILWAY_SERVICE_ID_REALTIME_PROD | Dashboard Railway |
| CRON_SECRET | Gerar com openssl rand -base64 32 |

### 1.2 Criar Environments no GitHub

1. staging — Sem approval rules  
2. production — Com approval rules (1 reviewer)

### 1.3 Configurar Vercel Production

1. Importar repositorio: MarcioCau14/SmartHotel_Zehla  
2. Branch producao: main  
3. Framework: Next.js  
4. Build: bun run build  
5. Install: bun install --frozen-lockfile

### 1.4 Executar Deploy Production

# Automatico (tag)git tag v1.0.0git push origin main --tags# Manual (GitHub Actions)# Actions → Deploy Production → Run workflow → type "DEPLOY"  
---

## DIA 2 — DNS & SSL

text  
TYPE    NAME    VALUE                    PROXY  
CNAME   @       cname.vercel-dns.com     ON  
CNAME   www     cname.vercel-dns.com     ON  
Na Vercel: Settings → Domains → Add: zehla.com.br, www.zehla.com.br  
---

## DIA 3 — Beta Onboarding

| Email | Senha | Funcao |
| :---- | :---- | :---- |
| admin@zehla.com.br | Admin@123 | Admin |
| demo@pousada.com.br | Demo@123 | Demo |

---

## DIA 4 — Monitoramento

* Vercel Analytics (Web Vitals)  
* Railway Metrics (CPU, Memory, Uptime)  
* Thompson Sampling (NeuroRouter)  
* Alertas: Error rate > 1%, Response time > 3s

---

## DIA 5 — ZEHLA no Ar

### Checklist Final:

* CI Pipeline verde  
* Staging validado  
* Producao health check 200 OK  
* DNS + SSL ativo  
* WhatsApp webhook verificado  
* Socket.IO conectando  
* Pagamentos PIX testados  
* Monitoramento ativo

---

## Estrutura de Branches

text  
main ─────── PRODUCAO  
 └─ develop ── STAGING  
      └─ feature/* ── DESENVOLVIMENTO  
---

## Comandos Rapidos

bash  
# Setup  
git clone https://github.com/MarcioCau14/SmartHotel_Zehla.git  
cd SmartHotel_Zehla && bun install && bun run db:push

# Deploy Staging  
git checkout develop && git push origin develop

# Deploy Prod  
git checkout main && git merge develop && git tag v1.0.0 && git push origin main --tags  

