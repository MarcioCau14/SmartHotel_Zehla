# ZEHLA — Funil de Vendas Adaptativo

## Máquina de Estados Orientada a Eventos para Aquisição de Pousadas

> **Data:** 2026-05-21
> **Base de Leads:** 10.175 contatos únicos (consolidados)
> **Projeção MRR 90 dias:** R$ 18.000
> **Projeção MRR 12 meses:** R$ 100.000

---

## Visão Geral: O Fim do Funil "Burro"

Este não é um funil de marketing linear. É uma **Máquina de Estados Orientada a Eventos** que se retroalimenta. Cada interação (abertura de email, clique, visita à landing page, resposta no WhatsApp) é um evento que altera o estado do lead, recalcula seu score e dispara a próxima ação otimizada.

---

## As 9 Fases do Funil Adaptativo

### Fase 1 — Teste de Hipóteses (Dor Discovery)
**Objetivo:** Descobrir qual dor ressoa com cada lead
**Mecanismo:** 3 variações de email cold outreach
- **Variante A (Financeira):** "Você está perdendo 30% de receita para comissões de OTA"
- **Variante B (Operacional):** "Sua recepção gasta 4h/dia respondendo as mesmas perguntas no WhatsApp"
- **Variante C (Ocupação):** "Seus quartos vazios de terça a quinta podem gerar R$5.000/mês extras"

**Infraestrutura:**
- Provedor: Resend ou SendGrid
- Tracking: Pixel de abertura + UTM links
- Webhook: `POST /api/webhooks/marketing` → BullMQ

**Métrica de Sucesso:** Taxa de abertura > 25%, CTR > 5%

---

### Fase 2 — Captura de Sinais (Signal Harvesting)
**Objetivo:** Capturar quem abre, quem clica, quem ignora
**Mecanismo:** Webhooks do provedor de email injetam eventos no ZEHLA Brain

**Eventos capturados:**
```json
{
  "event": "email_opened",
  "leadId": "clxxx...",
  "campaignId": "dor_financeira_v1",
  "timestamp": "2026-05-21T10:30:00Z",
  "ip": "177.32.xx.xx",
  "userAgent": "Mozilla/5.0..."
}
```

**Ações do Brain:**
1. Valida evento (deduplica)
2. Enriquece com dados do lead (cidade, tier, score)
3. Classifica intenção (HOT/WARM/COLD)
4. Atualiza `funnelStage` e `cluster` no PostgreSQL
5. Dispara próximo evento na fila (BullMQ)

---

### Fase 3 — Amplificação (Paid Retarget)
**Objetivo:** Reforçar mensagem para leads que demonstraram interesse
**Mecanismo:**
- **Google Ads:** Custom Audiences baseadas em emails (Customer Match)
- **Meta Ads:** Lookalike dos leads HOT + retargeting de clicantes
- **Criativos dinâmicos:** Headline muda baseado na dor detectada

**Segmentação:**
| Cluster | Plataforma | Criativo |
|---------|-----------|----------|
| HOT (Financeira) | Google Search | "Reduza comissões OTA em 40%" |
| HOT (Operacional) | Meta/Instagram | "WhatsApp automático 24h" |
| HOT (Ocupação) | Meta/Instagram | "Lote quartos vazios com IA" |
| WARM | Meta/YouTube | Brand awareness ZEHLA |
| COLD | — | Sem investimento (nutrição orgânica) |

---

### Fase 4 — Sincronização com o Brain (Coração do Sistema)
**Objetivo:** Centralizar e processar todos os eventos
**Arquitetura:**
```
Webhook (Resend/SendGrid/Z-API)
    ↓
POST /api/webhooks/*
    ↓
BullMQ Queue (validação + enrich)
    ↓
Redis (cache de sessão do lead)
    ↓
PostgreSQL (persistência + score update)
    ↓
ZEHLA Brain (classificação + next action)
    ↓
BullMQ Queue (disparo WhatsApp/email/LP)
```

**Resiliência:**
- Retry exponencial (3 tentativas com backoff)
- Dead Letter Queue (DLQ) para reprocessamento
- Redis como fallback se PostgreSQL indisponível

**Fórmula de Disponibilidade:**
```
A = MTBF / (MTBF + MTTR)
Meta: 99.9% (8.76h downtime/ano máximo)
```

---

### Fase 5 — Conversação via WhatsApp (Hermes)
**Objetivo:** Engajar lead com mensagem contextual, NÃO spam
**Mecanismo:** Z-API ou Evolution API

**Regras de Disparo:**
- Lead clicou no email de dor financeira → "Vi que se interessou em reduzir comissões. Quer ver quanto sua pousada perde por mês?"
- Lead visitou landing page → "Notei que explorou o ZEHLA. Posso mostrar como funciona em 2 minutos?"
- Lead é HOT + MAX tier → Abordagem direta: "Sua pousada tem perfil ideal para o plano MAX. Quer um Raio-X grátis?"

**Template Engine:** Swipe Templates do `secretaria-ai` com variáveis dinâmicas:
```
Olá {{nome}}! 👋

Vi que a {{pousada}} em {{cidade}} tem {{quartos}} quartos.
Sabia que pousadas similares estão economizando R${{economia}}/mês
com o ZEHLA?

Posso fazer um Raio-X gratuito da sua operação?
```

---

### Fase 6 — Landing Page Dinâmica (SSR Next.js)
**Objetivo:** Página personalizada baseada no perfil do lead
**Mecanismo:** Next.js Server-Side Rendering com detecção de cookie/UTM

**Detecção:**
```typescript
// Middleware detecta lead pelo cookie ou UTM params
const leadProfile = await brain.getLeadProfile(cookie.zeHLA_id);

// SSR entrega HTML customizado
if (leadProfile.dor === 'financeira') {
  headline = "Reduza comissões de OTA em até 40%"
  cta = "Calcular minha economia"
} else if (leadProfile.dor === 'operacional') {
  headline = "Automatize seu WhatsApp 24h sem equipe extra"
  cta = "Ver demonstração"
} else {
  headline = "Aumente sua ocupação com IA"
  cta = "Fazer Raio-X gratuito"
}
```

**Elementos da LP:**
- Headline personalizada (baseada na dor)
- Prova social (depoimentos de pousadas similares na mesma região)
- Calculadora de economia (interativa)
- CTA para Raio-X gratuito
- Pixel de tracking para Fase 2 (loop)

---

### Fase 7 — Raio-X Gratuito (Produto-Isca)
**Objetivo:** Entregar valor real antes de vender
**Mecanismo:** ZEHLA Brain analisa dados públicos da pousada

**O Raio-X inclui:**
1. **Análise de OTA:** Estimativa de comissão paga (baseada em preços e ocupação pública)
2. **Maturidade Digital:** Score de presença online (site, WhatsApp, redes sociais)
3. **Benchmark:** Comparação com pousadas similares na região
4. **Oportunidade:** Projeção de receita com ZEHLA

**Entrega:** PDF personalizado + WhatsApp com resumo

**Gatilho de Conversão:** Após entrega do Raio-X → "Quer implementar essas melhorias?"

---

### Fase 8 — Conversão (Stripe/Asaas)
**Objetivo:** Fechar o plano Pro/Max
**Mecanismo:** Checkout integrado com Stripe ou Asaas (Pix + Boleto + Cartão)

**Planos:**
| Plano | Preço/mês | Inclui | Target |
|-------|-----------|--------|--------|
| LITE | Grátis | Link-in-bio, 100 msgs WhatsApp/mês, PMS básico | Entrada |
| PRO | R$ 197 | WhatsApp ilimitado, CRM Cognitivo, Raio-X mensal | Pousadas 15-30 quartos |
| MAX | R$ 497 | Tudo + Revenue AI, Channel Manager, Concierge IA | Pousadas 30+ quartos |

**Táticas de Conversão:**
- Trial de 14 dias do PRO para leads HOT
- Desconto de 20% no primeiro mês para conversão em 48h
- Garantia de 30 dias (sem risco)
- Pagamento via Pix (imediato, sem fricção)

---

### Fase 9 — Loop de Retroalimentação (Flywheel)
**Objetivo:** Cliente vira promotor → novos leads
**Mecanismo:**
1. **Indicação:** Cliente indica outra pousada → 1 mês grátis
2. **Case de Sucesso:** Raio-X "antes/depois" vira conteúdo de marketing
3. **Social Proof:** Depoimento automatizado após 30 dias de uso
4. **Upsell:** Brain detecta oportunidade de upgrade (PRO → MAX)

**Métricas do Flywheel:**
- NPS > 50
- Taxa de indicação > 15%
- Churn < 5%/mês
- Upgrade rate > 20%

---

## Projeções de Conversão

### Funnel Metrics (Base: 10.175 leads)
| Etapa | Taxa | Leads |
|-------|------|-------|
| Emails enviados | 100% | 10.175 |
| Abertura | 30% | 3.053 |
| Clique | 8% | 814 |
| Visita LP | 5% | 509 |
| Raio-X solicitado | 3% | 305 |
| Trial iniciado | 2% | 203 |
| Conversão PRO | 1% | 102 |
| Conversão MAX | 0.3% | 31 |

### Projeção MRR
| Período | PRO (R$197) | MAX (R$497) | MRR Total |
|---------|-------------|-------------|-----------|
| 30 dias | 30 | 8 | R$ 9.886 |
| 90 dias | 60 | 18 | R$ 20.766 |
| 180 dias | 120 | 40 | R$ 43.520 |
| 12 meses | 300 | 100 | R$ 108.900 |

---

## Infraestrutura Técnica

### Stack
| Componente | Tecnologia | Função |
|------------|-----------|--------|
| Frontend | Next.js 15 + SSR | Landing pages dinâmicas |
| Backend | Next.js API Routes | Webhooks, classificação |
| Filas | BullMQ + Redis | Processamento assíncrono |
| Banco | PostgreSQL (Prisma) | Persistência de leads e eventos |
| Email | Resend/SendGrid | Cold outreach + tracking |
| WhatsApp | Z-API / Evolution API | Mensagens automatizadas |
| Pagamento | Stripe / Asaas | Checkout + subscrições |
| Ads | Google Ads + Meta Ads | Retargeting |
| IA | Ollama (Qwen/DeepSeek) | Classificação + geração |

### Endpoints Críticos
```
POST /api/webhooks/email       # Abertura/clique de email
POST /api/webhooks/whatsapp    # Respostas do WhatsApp
POST /api/webhooks/ads         # Conversões de ads
GET  /api/funnel/:leadId       # Estado atual do lead
POST /api/funnel/:leadId/next  # Dispara próxima ação
POST /api/funnel/batch         # Processamento em lote
GET  /api/funnel/stats         # Métricas do funil
```

---

## Checklist de Implementação (3 Sprints / 12 Semanas)

### Sprint 1 — Ingestão de Dados (Semanas 1-4)
- [ ] Configurar Resend/SendGrid com webhooks
- [ ] Criar `POST /api/webhooks/marketing`
- [ ] Implementar BullMQ para processamento assíncrono
- [ ] Criar modelos Prisma: `FunnelEvent`, `Campaign`, `WebhookLog`
- [ ] Importar 10.175 leads consolidados
- [ ] Criar templates de email (3 variantes de dor)
- [ ] Configurar tracking de abertura/clique

### Sprint 2 — Motor de Classificação (Semanas 5-8)
- [ ] Refinar ZEHLA Brain para classificação HOT/WARM/COLD
- [ ] Implementar scoring dinâmico baseado em eventos
- [ ] Criar sistema de clusterização (Financeira/Operacional/Ocupação)
- [ ] Configurar retargeting com Google/Meta Ads APIs
- [ ] Implementar Dead Letter Queue + retry exponencial
- [ ] Criar dashboard de métricas do funil

### Sprint 3 — Conversão e Loop (Semanas 9-12)
- [ ] Integrar Z-API/Evolution API para WhatsApp
- [ ] Criar automação de conversação (Fase 5)
- [ ] Desenvolver Landing Pages dinâmicas com SSR
- [ ] Implementar Raio-X automatizado (Fase 7)
- [ ] Integrar Stripe/Asaas para checkout (Fase 8)
- [ ] Criar sistema de indicação (Fase 9)
- [ ] Setup do flywheel de retroalimentação

---

## Regras de Ouro do Funil

1. **Nunca envie a mesma mensagem duas vezes** — Personalização extrema
2. **WhatsApp é para conversar, não para spam** — Mensagens orientadas a dados
3. **Cada evento muda o estado** — Lead nunca fica estático
4. **Raio-X é produto, não isca** — Entregue valor real antes de vender
5. **O funil nunca para** — Loop contínuo de retroalimentação
6. **Disponibilidade > Consistência** (CAP Theorem) — Mensagem deve chegar sempre
7. **3 cliques para resolver** — Simplicidade como arma competitiva
