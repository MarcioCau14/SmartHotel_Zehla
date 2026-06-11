# 🪵 Logs do Servidor em Produção (Simulação E2E Fly.io)

Este documento simula a saída padrão de console (stdout/stderr) dos contêineres do **ZEHLA Prime** rodando no Fly.io durante o ciclo completo de ativação, pareamento e faturamento da **Pousada Villa Rosa**.

---

## 🚀 1. Inicialização do Contêiner (Docker Multistage)

```log
2026-06-11T17:15:01Z [INFO] [System] Starting ZEHLA Prime container (v2.0.0-production)...
2026-06-11T17:15:02Z [INFO] [System] Node.js Version: v20.12.2 | OS: Linux 6.1.0-fly
2026-06-11T17:15:02Z [INFO] [System] Loading Environment Variables...
2026-06-11T17:15:03Z [INFO] [Prisma] Connecting to PostgreSQL 16 on Supabase (Pool size: 10)...
2026-06-11T17:15:04Z [INFO] [Prisma] ✅ Connection established. Schema version: 20260611_zcc_tax_profile.
2026-06-11T17:15:04Z [INFO] [Redis-Session] Connecting to redis://default:***@fly-redis-session:6379/0...
2026-06-11T17:15:05Z [INFO] [Redis-Session] ✅ Connected. Mode: Persistence Active (DB 0).
2026-06-11T17:15:05Z [INFO] [Redis-Worker] Connecting to redis://default:***@fly-redis-worker:6379/1...
2026-06-11T17:15:05Z [INFO] [Redis-Worker] ✅ Connected. BullMQ Engine Active (DB 1).
2026-06-11T17:15:06Z [INFO] [Redis-AI] Connecting to redis://default:***@fly-redis-ai:6379/2...
2026-06-11T17:15:06Z [INFO] [Redis-AI] ✅ Connected. AI Context Cache Active (DB 2).
2026-06-11T17:15:07Z [INFO] [EvolutionAPI] Probing container on http://evolution-api:8080/health...
2026-06-11T17:15:07Z [INFO] [EvolutionAPI] ✅ Connection success. Status: 200 OK. Version: 1.8.2.
2026-06-11T17:15:08Z [INFO] [System] HTTP Server listening on port 3000 (Fly.io edge proxy).
```

---

## 🌐 2. Inicialização da FSM do WhatsApp (ZCC Panel)

```log
2026-06-11T17:16:10Z [INFO] [FSM] GET /api/zcc/evolution/instances called by propertyId: villa-rosa-tenant-01
2026-06-11T17:16:11Z [INFO] [FSM] WhatsAppSession loaded. Current state: DISCONNECTED
2026-06-11T17:16:12Z [INFO] [FSM] POST /api/zcc/evolution/instances (Action: INITIALIZE_CONNECTION)
2026-06-11T17:16:12Z [INFO] [FSM] WhatsAppSession transited: DISCONNECTED ──(inicializar)──→ AWAITING_QR
2026-06-11T17:16:13Z [INFO] [EvolutionAPI] Requesting new QR Code for instance zehla-instance-villa-rosa-tenant-01...
2026-06-11T17:16:15Z [INFO] [EvolutionAPI] QR Code received. Base64 payload stored in Session. TTL set to 40 seconds.
2026-06-11T17:16:16Z [INFO] [ZCC-Panel] Rendering QR Code visual on client screen. Status: AWAITING_QR
2026-06-11T17:16:32Z [INFO] [EvolutionAPI] Webhook triggered: status.connection = CONNECTED
2026-06-11T17:16:32Z [INFO] [FSM] WhatsAppSession transited: AWAITING_QR ──(ler_qr_com_sucesso)──→ CONNECTED
2026-06-11T17:16:33Z [INFO] [FSM] Instance zehla-instance-villa-rosa-tenant-01 connected. Webhook list initialized. ✅
```

---

## 📈 3. O Despertar do Farmer IA (Campanha Outbound & Anti-Ban)

```log
2026-06-11T17:18:00Z [INFO] [CampaignOrchestrator] Campaign Outbound triggered for Pousada Villa Rosa.
2026-06-11T17:18:01Z [INFO] [CampaignOrchestrator] Target: 22.000 messages. Segment: Inactive Guests (2024/2025).
2026-06-11T17:18:01Z [INFO] [CampaignOrchestrator] Enqueuing jobs to BullMQ CampaignOutboundWorker...
2026-06-11T17:18:05Z [INFO] [CampaignOutboundWorker] Worker started. Concurrency: 1 (Safeguard mode).
2026-06-11T17:18:06Z [INFO] [CampaignOutboundWorker] Job #1: Send message to +5548999991111 (Juliana Mendes)
2026-06-11T17:18:07Z [INFO] [CampaignOutboundWorker] Applying Gaussian Delay (Box-Muller)...
2026-06-11T17:18:07Z [INFO] [CampaignOutboundWorker] Jitter calculated: 14.8 seconds (Bounds: 5 - 45s). Sleeping...
2026-06-11T17:18:22Z [INFO] [EvolutionAPI] POST /message/sendText - Recipient: +5548999991111 | Status: 200 OK.
2026-06-11T17:18:23Z [INFO] [CampaignOutboundWorker] Job #1 completed.
2026-06-11T17:18:23Z [INFO] [CampaignOutboundWorker] Job #2: Send message to +5548999992222 (Roberto Alencar)
2026-06-11T17:18:24Z [INFO] [CampaignOutboundWorker] Jitter calculated: 32.1 seconds (Bounds: 5 - 45s). Sleeping...
```

---

## 💵 4. O Estouro do Funil (Conversão Real & Idempotência)

```log
2026-06-11T17:21:40Z [INFO] [ZMG] Incoming message from +5548999991111: "Eu quero a oferta de retorno!"
2026-06-11T17:21:40Z [INFO] [ZMG:ROUTER] Classifying message. Complexity: complex (Matches "quero a oferta")
2026-06-11T17:21:41Z [INFO] [ZMG:ROUTER] Querying FinOps budget for villa-rosa-tenant-01. Spent today: R$ 12.40 / Limit: R$ 50.00
2026-06-11T17:21:41Z [INFO] [ZMG:ROUTER] Budget check passed. Routing to Tier 3 (Claude 3.5 Reasoning AI).
2026-06-11T17:21:44Z [INFO] [ZMG:ROUTER] LLM Response generated. Cost: R$ 0.10. Debiting budget.
2026-06-11T17:21:45Z [INFO] [EvolutionAPI] Geração de Link de Pagamento Mercado Pago. Valor: R$ 450,00 (Sinal)
2026-06-11T17:21:46Z [INFO] [EvolutionAPI] POST /message/sendText with PIX payload to +5548999991111: "Perfeito, Juliana! Aqui está o seu código PIX..."
2026-06-11T17:22:10Z [INFO] [MercadoPago Webhook] Received notification POST /api/webhooks/mercadopago (ID: mp_evt_998877)
2026-06-11T17:22:10Z [INFO] [MercadoPago Webhook] Validating signature: x-signature = ts=1778644930,v1=abc123hex...
2026-06-11T17:22:11Z [INFO] [MercadoPago Webhook] Signature is VALID.
2026-06-11T17:22:11Z [INFO] [IdempotencyBarrier] Attempting to lock key: mp:webhook:mp_evt_998877 with TTL 24h
2026-06-11T17:22:12Z [INFO] [IdempotencyBarrier] Lock acquired. First execution.
2026-06-11T17:22:12Z [INFO] [ConfirmarPagamentoUseCase] Processing payment of R$ 450,00 for Pousada Villa Rosa.
2026-06-11T17:22:13Z [INFO] [ConfirmarPagamentoUseCase] Matching transaction ID in database... found.
2026-06-11T17:22:14Z [INFO] [Prisma] Updating reservation status. ID: res_villarosa_5543.
2026-06-11T17:22:14Z [INFO] [Prisma] Reservation status transited: PENDING ──→ CONFIRMED.
2026-06-11T17:22:15Z [INFO] [System] Dispatched ReservationConfirmedEvent.
2026-06-11T17:22:15Z [INFO] [MercadoPago Webhook] Returning HTTP 200 OK. Status: success.
2026-06-11T17:22:15Z [SUCCESS] 💰 PIX de R$ 450,00 compensado com sucesso no ecossistema ZEHLA para a Pousada Villa Rosa!
```
