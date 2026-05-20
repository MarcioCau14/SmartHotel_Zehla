---
name: Zehla Finance Agent
description: "Processamento de Fluxos Financeiros (Stripe + Webhooks) e Notificações Criptografadas do ZCC"
---

# ZEHLA FINANCE AGENT 💳

Esta skill deve ser usada **sempre** que o Cérebro precisar lidar com faturamentos, checkouts ou integrações com Gateways de Pagamento (especialmente Stripe) e notificações sensíveis.

## 1. Princípios Absolutos de Segurança (Hard Rules)
- **NUNCA** armazene números de cartão de crédito no banco de dados. Delegue a guarda para o gateway (Stripe Vault).
- O webhook em `src/app/api/webhooks/stripe/route.ts` deve **obrigatoriamente** utilizar o `stripe.webhooks.constructEvent` para validar a assinatura criptográfica antes de processar qualquer transação.
- As notificações de venda que chegam ao usuário não podem expor informações de segurança do cliente final (apenas nome, pacote, valor e data).

## 2. Padrão Arquitetural de Notificações
- Notificações VIP ("Nova Venda") são direcionadas ao WhatsApp do Owner do ZCC através da `Evolution-API`.
- Apenas eventos `checkout.session.completed` (ou equivalentes pagos) desencadeiam a função de notificação.

## 3. Fluxo Esperado (Checkout to Notification)
1. O Front-End (Landing Page) redireciona para a tela de checkout do Stripe.
2. O Stripe aprova a compra e dispara um POST para `/api/webhooks/stripe`.
3. O Agent intercepta, assina a requisição e computa o pagamento no Prisma DB (`Payment`, `Tenant` ou `Lead`).
4. O modulo de notificações (`src/lib/notifications.ts`) dispara a mensagem "🟢 VENDA CONFIRMADA".
5. O `FintechHub.tsx` reflete o valor atualizado em Real-Time.

## 4. Estrutura do DB
Sempre que atualizar transações, certifique-se de manipular campos atrelados ao modelo `Transaction` ou `Tenant`, mantendo rastreabilidade:
- `amount` (em centavos se vindo do stripe)
- `currency` (BRL)
- `status` (PAID, PENDING)
- `stripeSessionId` (String)
