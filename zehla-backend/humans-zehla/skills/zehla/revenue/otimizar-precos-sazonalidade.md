---
name: otimizar-precos-sazonalidade
created: 2026-05-15
tags: [revenue, pricing, sazonalidade, feriados]
category: revenue
success_count: 0
failure_count: 0
---

# Otimização de Preços por Sazonalidade

## Quando usar
Quando o hoteleiro pede ajuda com preços para um período específico, feriado, ou temporada.

## Dados necessários
- Preços atuais por tipo de quarto
- Ocupação atual e histórico
- Período a ser precificado
- Eventos locais relevantes
- Preços de concorrentes (se disponível)

## Abordagem passo-a-passo

### 1. Coletar dados de contexto
- Verificar calendário de feriados nacionais (Carnaval, Semana Santa, Corpus Christi, Independência, Finados, Natal, Réveillon)
- Verificar feriados estaduais e municipais relevantes
- Buscar eventos na região (festivais, shows, congressos, jogos)
- Verificar data da Páscoa (variável)

### 2. Classificar a temporada
```
ALTA ESTAÇÃO: +30-50% sobre preço base
- Carnaval (4 dias): maior demanda do ano
- Réveillon (5 dias): segunda maior demanda
- Semana Santa: demanda forte, família
- Julho (férias escolares): demanda moderada-alta

MÉDIA ESTAÇÃO: +10-20% sobre preço base
- Feriados prolongados (3+ dias)
- Finais de semana de primavera/verão
- Eventos regionais relevantes

BAIXA ESTAÇÃO: -10-20% sobre preço base
- Março-abril (pós-Carnaval)
- Maio-junho (entre feriados)
- Outubro-novembro (pré-summer)
- Dias úteis fora de eventos

TEMPORADA REGULAR: preço base
- Finais de semana normais
- Períodos sem eventos especiais
```

### 3. Calcular preço por tipo de quarto
```
Standard:    base × multiplicador
Superior:    base × 1.3 × multiplicador
Deluxe:      base × 1.6 × multiplicador
Suite:       base × 2.0 × multiplicador
Suite Luxo:  base × 2.5 × multiplicador
```

### 4. Ajustar por ocupação
- Se ocupação > 80%: +15% adicional
- Se ocupação 60-80%: manter
- Se ocupação 40-60%: -10%
- Se ocupação < 40%: -20% + promoção

### 5. Verificar concorrência
- Buscar preços em Booking.com, Airbnb para a região
- Posicionar entre o mínimo e o máximo do mercado
- Justificar preço superior com diferenciais

### 6. Gerar recomendação
- Preço sugerido por quarto por noite
- Faixa de preço (mín/máx)
- Justificativa baseada em dados
- Comparação com concorrência
- Projeto de receita estimada
