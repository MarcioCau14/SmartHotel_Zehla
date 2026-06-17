# SPEC — Loop de Otimização de Precificação ZEHLA

## Objetivo
Loop autônomo que analisa dados de mercado, ocupação e sazonalidade para ajustar preços de diárias de pousadas automaticamente. Todo tráfego LLM passa pelo Headroom proxy (compressão ~70%).

## Trigger
CRON: 04:00 AM (America/Sao_Paulo) — Madrugada, off-peak

## Topologia (Agent Graph)
[DISCOVERY: Claude Sonnet] → [PLANNING: Claude Sonnet] → [EXECUTION: Claude Sonnet] → [VERIFICATION: Claude Haiku]

## Guardas
- MAX_ITERATIONS: 3
- BUDGET_CAP: $2.00
- DIFF_CHECK: se última não mudou, halt
- PRICE_GUARD: R$80–R$1500
