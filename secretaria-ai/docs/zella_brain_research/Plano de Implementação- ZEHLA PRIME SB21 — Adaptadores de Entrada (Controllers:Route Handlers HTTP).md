# Plano de Implementação: ZEHLA PRIME SB21 — Adaptadores de Entrada (Controllers/Route Handlers HTTP)

Este plano descreve o design, a segurança e a implementação das portas de entrada expostas via HTTP para o ecossistema ZEHLA SmartHotel, abrangendo os 5 Bounded Contexts e seus Córtices Cognitivos.

---

## User Review Required

> [!IMPORTANT]
> **JWT Guard e Row-Level Security (RLS):**
> Todas as rotas autenticadas da aplicação passarão pelo `JwtGuard` para validação de assinatura e extração do `pousadaId` (tenantId). Esse ID é injetado silenciosamente no escopo de todas as operações de banco e nos inputs dos Serviços Cognitivos, garantindo isolamento absoluto de dados entre hotéis.
>
> **Webhooks Externos com Zero-Trust HMAC:**
> Os webhooks do WhatsApp e de Pagamentos serão expostos publicamente, mas blindados com verificação de assinatura HMAC criptográfica (`crypto.timingSafeEqual`) contra ataques de spoofing e falsificação de requisições.

---

## Proposed Changes

### 1. 🛡️ Camada de Segurança e Utilitários HTTP
Criaremos os utilitários de tratamento de autenticação e validação de HMAC para facilitar a vida dos controllers anêmicos:
- **[NEW] [auth.ts](file:///Users/marciocau/Downloads/SmartHotel_Zehla/zehla-backend/src/infrastructure/http/auth/jwtAuth.ts)**: Helper para ler cabeçalho `Authorization: Bearer <token>`, instanciar `JwtGuard`, validar o token e retornar a sessão do tenant ou um erro.
- **[NEW] [hmac.ts](file:///Users/marciocau/Downloads/SmartHotel_Zehla/zehla-backend/src/infrastructure/http/auth/hmacAuth.ts)**: Helper para validar assinaturas HMAC SHA256 usando `crypto.timingSafeEqual` sobre o raw body recebido.

---

### 2. 🔌 Route Handlers HTTP (Next.js App Router)
Implementação dos controllers anêmicos (Route Handlers) para expor as APIs de Borda dos 5 Bounded Contexts. Eles apenas validam o token/HMAC, parseiam o input, injetam as dependências manuais e repassam para o respectivo Serviço Cognitivo:

#### Domínio de Hospitalidade
- **[NEW] [route.ts](file:///Users/marciocau/Downloads/SmartHotel_Zehla/zehla-backend/src/app/api/hospitalidade/concierge/route.ts)**: Rota protegida com JWT. Recebe `intent` de concierge (ex: `CONSULTAR_DISPONIBILIDADE`, `CRIAR_RESERVA`) e invoca `ZeConcierge.processIntent()`.

#### Domínio Comercial
- **[NEW] [route.ts](file:///Users/marciocau/Downloads/SmartHotel_Zehla/zehla-backend/src/app/api/comercial/leads/route.ts)**: Rota protegida com JWT. Invoca as intenções de leads comercial via `ZeSalesCognitiveService.processIntent()`.
- **[NEW] [route.ts](file:///Users/marciocau/Downloads/SmartHotel_Zehla/zehla-backend/src/app/api/comercial/propostas/route.ts)**: Rota protegida com JWT. Invoca intenções de propostas via `ZeSalesCognitiveService.processIntent()`.

#### Domínio Operacional
- **[NEW] [route.ts](file:///Users/marciocau/Downloads/SmartHotel_Zehla/zehla-backend/src/app/api/operacional/tarefas/route.ts)**: Rota protegida com JWT. Invoca as intenções de tarefas/manutenção via `ZeOpsCognitiveService.processIntent()`.

#### Domínio de Revenue & Analytics
- **[NEW] [route.ts](file:///Users/marciocau/Downloads/SmartHotel_Zehla/zehla-backend/src/app/api/revenue/tarifas/route.ts)**: Rota protegida com JWT. Invoca as intenções de yield rate/break-even via `ZeAnalystCognitiveService.processIntent()`.

#### Domínio de Marketing
- **[NEW] [route.ts](file:///Users/marciocau/Downloads/SmartHotel_Zehla/zehla-backend/src/app/api/marketing/reviews/route.ts)**: Rota protegida com JWT. Invoca `ZeMarketerCognitiveService.processarIntencao()` com intents de análise de sentimentos e resposta de reviews.
- **[NEW] [route.ts](file:///Users/marciocau/Downloads/SmartHotel_Zehla/zehla-backend/src/app/api/marketing/campanhas/route.ts)**: Rota protegida com JWT. Invoca `ZeMarketerCognitiveService.processarIntencao()` com intents de criação de campanhas e remarketing.

#### Webhooks Externos
- **[NEW] [route.ts](file:///Users/marciocau/Downloads/SmartHotel_Zehla/zehla-backend/src/app/api/webhooks/whatsapp/route.ts)**: Rota pública de webhook do WhatsApp, blindada com HMAC. Roteia inbound messages de reviews ou leads para o domínio.
- **[NEW] [route.ts](file:///Users/marciocau/Downloads/SmartHotel_Zehla/zehla-backend/src/app/api/webhooks/pagamento/route.ts)**: Rota pública de webhook de pagamento (confirmar pagamento/conversão), blindada com HMAC.

---

### 3. 🧪 Suíte de Testes de Integração HTTP
Criação de testes batendo diretamente contra os Route Handlers importados, simulando chamadas HTTP completas com `buildPost` e validando o comportamento fim-a-fim com banco de dados real:
- **[NEW] [sb21_integration.test.ts](file:///Users/marciocau/Downloads/SmartHotel_Zehla/zehla-backend/__tests__/api/sb21_integration.test.ts)**: Testa todos os novos controllers garantindo:
  - 401 Unauthorized em chamadas sem token
  - 401 Unauthorized em chamadas com token inválido
  - 200 OK com payload processado em chamadas legítimas
  - Validação HMAC correta e rejeição de assinaturas falsas nos webhooks.

---

## Verification Plan

### Automated Tests
1. Executar os testes de integração reais via Vitest:
   ```bash
   npx vitest run __tests__/api/sb21_integration.test.ts
   ```
2. Executar toda a suíte de testes do projeto para garantir zero regressões:
   ```bash
   npx vitest run
   ```
