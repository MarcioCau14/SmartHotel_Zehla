# Walkthrough — ZEHLA PRIME Financeiro & Comunicação

Este documento detalha o que foi implementado e validado nas entregas de integração do gateway de pagamento Mercado Pago e adaptadores de comunicação (Resend e Evolution API).

---

## Alterações Realizadas

### 1. Domínio Financeiro (`src/domain/financeiro`)
*   **[Subscription.ts](file:///Users/marciocau/zehla-backend/src/domain/financeiro/entities/Subscription.ts):** Entidade rica de domínio imutável congelada com `Object.freeze()` para gerenciamento de assinaturas (LITE/PRO/MAX), com transições de estado retornando mônadas `Result`.
*   **[SubscriptionStatus.ts](file:///Users/marciocau/zehla-backend/src/domain/financeiro/enums/SubscriptionStatus.ts):** Enum contendo os estados possíveis de uma assinatura (`PENDING`, `ACTIVE`, `PAUSED`, `CANCELLED`, `PAST_DUE`).
*   **[PaymentMethodType.ts](file:///Users/marciocau/zehla-backend/src/domain/financeiro/enums/PaymentMethodType.ts):** Enum com métodos de pagamento aceitos.
*   **[PixCode.ts](file:///Users/marciocau/zehla-backend/src/domain/financeiro/value-objects/PixCode.ts):** Value Object contendo os dados de QR Code e código copia e cola para o PIX.
*   **[IPaymentGateway.ts](file:///Users/marciocau/zehla-backend/src/domain/financeiro/gateways/IPaymentGateway.ts):** Abstração/Porta principal do gateway financeiro.

### 2. Infraestrutura e Casos de Uso do Mercado Pago
*   **[ISubscriptionRepository.ts](file:///Users/marciocau/zehla-backend/src/application/financeiro/ports/ISubscriptionRepository.ts):** Porta para persistência de assinaturas.
*   **[InMemorySubscriptionRepository.ts](file:///Users/marciocau/zehla-backend/src/infrastructure/persistence/financeiro/InMemorySubscriptionRepository.ts):** Implementação na memória do repositório de assinaturas.
*   **[MercadoPagoGateway.ts](file:///Users/marciocau/zehla-backend/src/infrastructure/finance/gateways/MercadoPagoGateway.ts):** Integração física com o SDK oficial do Mercado Pago, cobrindo PIX, Cartão, Boleto e APIs de assinatura (*preapproval*).
*   **[MercadoPagoMapper.ts](file:///Users/marciocau/zehla-backend/src/infrastructure/finance/mappers/MercadoPagoMapper.ts):** Data Mapper para isolar as respostas do SDK.
*   **[CriarAssinaturaUseCase.ts](file:///Users/marciocau/zehla-backend/src/application/financeiro/use-cases/CriarAssinaturaUseCase.ts):** Fluxo de criação de assinaturas.
*   **[ProcessarWebhookMercadoPagoUseCase.ts](file:///Users/marciocau/zehla-backend/src/application/financeiro/use-cases/ProcessarWebhookMercadoPagoUseCase.ts):** Orquestração de eventos e conciliação do webhook.
*   **[route.ts (Mercado Pago)](file:///Users/marciocau/zehla-backend/src/app/api/webhooks/mercado-pago/route.ts):** Rota do webhook com verificação de assinatura HMAC e higienização de PII nos logs.

### 3. Canal de Comunicação Outbound (Resend & Evolution API)
*   **[IEmailGateway.ts](file:///Users/marciocau/zehla-backend/src/application/communication/ports/IEmailGateway.ts):** Abstração de porta para envio de e-mails de saída.
*   **[ResendEmailGateway.ts](file:///Users/marciocau/zehla-backend/src/infrastructure/email/ResendEmailGateway.ts):** Implementação do gateway de e-mail integrado ao Resend SDK com barreira de controle de limites diários via `RateLimiterRedis`.
*   **[EvolutionWhatsAppGateway.ts](file:///Users/marciocau/zehla-backend/src/infrastructure/messaging/EvolutionWhatsAppGateway.ts):** Implementação com a Evolution API. Injeta delays calculados com Box-Muller Gaussian (média de 2s, desvio padrão de 0.5s) antes dos disparos de WhatsApp para proteção anti-ban.
*   **[route.ts (WhatsApp Webhook)](file:///Users/marciocau/zehla-backend/src/app/api/webhooks/whatsapp/route.ts):** Repassa mensagens de entrada diretamente ao `AgentOrchestrator` central da ZEHLA para respostas e tratamentos dinâmicos, e salva as conversas no banco de dados.

---

## Verificação e Testes Executados

Executamos testes unitários automatizados cobrindo os gateways e fluxos de domínio:

1.  **Testes do Mercado Pago Gateway:**
    *   [MercadoPagoGateway.test.ts](file:///Users/marciocau/zehla-backend/__tests__/infrastructure/finance/gateways/MercadoPagoGateway.test.ts)
    *   **Resultado:** `✓ Passed (5 tests)`
2.  **Testes do Resend Email Gateway:**
    *   [ResendEmailGateway.test.ts](file:///Users/marciocau/zehla-backend/__tests__/infrastructure/email/ResendEmailGateway.test.ts)
    *   **Resultado:** `✓ Passed (3 tests)`
3.  **Testes do Evolution WhatsApp Gateway:**
    *   [EvolutionWhatsAppGateway.test.ts](file:///Users/marciocau/zehla-backend/__tests__/infrastructure/messaging/EvolutionWhatsAppGateway.test.ts)
    *   **Resultado:** `✓ Passed (3 tests)`

```bash
# Comando usado para executar os testes
npx vitest run __tests__/infrastructure/finance/gateways/MercadoPagoGateway.test.ts
npx vitest run __tests__/infrastructure/email/ResendEmailGateway.test.ts
npx vitest run __tests__/infrastructure/messaging/EvolutionWhatsAppGateway.test.ts
```

> [!NOTE]
> Todos os testes executados mockam as APIs externas reais correspondentes, garantindo determinismo total nas validações locais de CI/CD.
