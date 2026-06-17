# SPEC — Loop de Cristalização Noturna do Campo Akáshico

## Objetivo
Processa episódios acumulados do dia, extrai padrões, gera insights, atualiza Knowledge Graph, e alimenta Thompson Sampling priors. Tarefa pesada — executada às 2h AM na madrugada.

## Trigger
CRON: 02:00 AM (America/Sao_Paulo)

## Guardas
- MAX_ITERATIONS: 5
- BUDGET_CAP: $3.00
- DIFF_CHECK: se padrões são iguais aos últimos, halt
- MIN_EPISODES: 30
