---
name: relatorio-diario-operacional
created: 2026-05-15
tags: [operacional, relatorio, dashboard, metricas]
category: operacional
success_count: 0
failure_count: 0
---

# Relatório Diário Operacional

## Quando usar
Todos os dias às 7h (cron job automático) ou sob demanda do hoteleiro.

## Seções do relatório

### 1. Resumo Executivo (one-liner)
"Ontem: 85% ocupação | R$8.420 receita | 12 check-ins, 8 check-outs"

### 2. Ocupação
- Ocupação atual: X%
- Ocupação vs mesma data ano passado: +/- X%
- Previsão próximos 7 dias: gráfico
- Quartos disponíveis hoje: X de Y

### 3. Receita
- Receita diária: R$X
- ADR (Average Daily Rate): R$X
- RevPAR (Revenue Per Available Room): R$X
- Receita vs meta: X%

### 4. Reservas
- Novas reservas ontem: X
- Reservas para próximos 30 dias: X
- Canal de origem: Booking X%, Direto X%, Outros X%
- Cancellations: X

### 5. Atendimento
- Mensagens WhatsApp recebidas: X
- Tempo médio de resposta: X min
- Reclamações: X
- Elogios: X
- Review mais recente: [resumo]

### 6. Alertas
- Ocupação < 50% para [DATA]: considerar promoção
- Review negativo novo: [assunto] — responder em 24h
- Reserva grande: [detalhes] — preparar
