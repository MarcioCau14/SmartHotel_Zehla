---
name: monitorar-precos-concorrentes
created: 2026-05-15
tags: [competitivo, pricing, concorrencia, benchmark]
category: competitivo
success_count: 0
failure_count: 0
---

# Monitoramento de Preços de Concorrentes

## Quando usar
Diariamente (cron job 6h) ou quando o hoteleiro solicitar análise competitiva.

## Fontes de dados
1. Booking.com — scrape de preços públicos por região
2. Airbnb — scraping de listings na área
3. Google Hotels — comparação de preços
4. Sites das pousadas concorrentes — preços diretos

## Métricas-chave
- Preço médio da região por tipo de acomodação
- Preço mínimo e máximo
- Posicionamento da pousada vs mercado (percentil)
- Variação semanal de preços
- Ocupação estimada (via calendários de disponibilidade)

## Fórmula de posicionamento
```
POSICIONAMENTO = (PRECO_POUSADA - PRECO_MINIMO) / (PRECO_MAXIMO - PRECO_MINIMO) × 100

0-25%: Budget (preço abaixo do mercado)
25-50%: Value (preço competitivo)
50-75%: Premium (preço acima da média)
75-100%: Luxury (preço premium)
```

## Output esperado
- Relatório com 5-10 concorrentes mapeados
- Tabela comparativa de preços
- Recomendação de ajuste
- Oportunidades identificadas (ex: concorrente esgotado)
