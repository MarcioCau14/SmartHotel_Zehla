# ZEHLA — Arquitetura Comercial Completa
## Sistema Híbrido PLG/SLG para Hotelaria

> **Documento Estratégico — Confidencial**
> Versão 1.0 | Última atualização: 2025
> Responsável: Equipe Comercial & Produto ZEHLA

---

## Sumário Executivo

Este documento define a arquitetura comercial completa do ZEHLA — um Sistema Operacional Cognitivo (Cognitive OS) voltado para pousadas e pequenas propriedades hoteleiras brasileiras. O modelo combina duas estratégias de crescimento complementares: **Product-Led Growth (PLG)**, onde o produto se vende por meio de trial gratuito e onboarding guiado, e **Sales-Led Growth (SLG)**, onde uma equipe de SDRs e Closers atua proativamente sobre leads qualificados.

A premissa fundamental é que pousadas são negócios de 1-3 pessoas (donos + receptionistas), com tempo limitado, pouca fluência tecnológica e decisões de compra emocionais e pragmáticas. O ZEHLA resolve dores reais — receitas despencando, diárias vazias, check-ins caóticos — com uma plataforma que fala a língua do hoteleiro brasileiro.

**Economia Unitária Alvo:**
| Métrica | Valor |
|---|---|
| CAC (Custo de Aquisição de Cliente) | R$ 200 |
| LTV (Lifetime Value — 24 meses) | R$ 6.000 |
| LTV:CAC | 30:1 |
| Payback | 15 dias |
| MRR alvo (Mês 12) | R$ 150.000 |
| Clientes alvo (Mês 12) | 300 |

---

## 1. Visão Geral do Modelo Comercial

### 1.1 Filosofia: Híbrido PLG/SLG

O modelo comercial do ZEHLA opera em duas frentes simultâneas que se reforçam mutuamente:

**PLG (Product-Led Growth) — 40% da aquisição:**
O produto é a principal vitrine. Um trial de 7 dias sem necessidade de cartão de crédito permite que o pousadeiro "sinta" o valor antes de pagar. O onboarding é guiado dia-a-dia, com automação que antecipa objeções e demonstra resultados concretos (ex.: "Veja quantas reservas estão sendo perdidas com sua tabela de preços atual"). A conversão de trial para pago é impulsionada por gatilhos de engajamento dentro da plataforma.

**SLG (Sales-Led Growth) — 60% da aquisição:**
Equipe comercial proativa que atua sobre leads nutridos por marketing. SDRs contatam via WhatsApp (canal nativo do hoteleiro), qualificam utilizando framework SBI (Situação-Behavior-Impacto), e passam para Closers que conduzem demonstrações personalizadas e fecham. O SLG é indispensável porque pousadeiros raramente convertem sozinhos — precisam do empurrão humano.

### 1.2 Fluxo de Valor

```
Conhecimento → Interesse → Avaliação → Ativação → Receita → Expansão → Advocacia
     ↑              ↑            ↑           ↑          ↑           ↑           ↑
  Email/Ads   Conteúdo    Trial/     Primeira     MRR      Upgrade    Indicação
  Retargeting  RICO        Demo      Reserva     Recorrente  de Plano  para outros
```

### 1.3 Economia Unitária Detalhada

**CAC de R$ 200 — Composição:**
| Canal | Custo por Lead | Taxa de Conversão Lead→Cliente | Custo por Cliente |
|---|---|---|---|
| Email Marketing (proprietário) | R$ 2 | 1,5% | R$ 133 |
| Google Ads (retargeting) | R$ 8 | 3,0% | R$ 267 |
| Meta Ads (AIC) | R$ 5 | 2,5% | R$ 200 |
| WhatsApp Inbound | R$ 3 | 4,0% | R$ 75 |
| Indicação (referral) | R$ 1 | 5,0% | R$ 20 |
| **Média Ponderada** | **R$ 4** | **2,0%** | **R$ 200** |

**LTV de R$ 6.000 — Premissas:**
- ARPU (Receita Média por Usuário): R$ 450/month (média entre R$ 397 e R$ 697)
- Churn mensal alvo: 1,5% (produto sticky + switching costs)
- Lifetime médio: ~24 meses
- Upsell esperado: 30% dos clientes migram do Starter para Professional em 6 meses
- LTV = ARPU × (1 / churn) = R$ 450 × 66,7 = R$ 30.000 (teórico, descontado para R$ 6.000 considerando churn real brasileiro de 7,5% a.a.)

**Payback de 15 dias:**
- CAC: R$ 200
- MRR por cliente: R$ 450
- Payback = R$ 200 / (R$ 450 / 30) = 13,3 dias ≈ 15 dias

### 1.4 Segmentação de Mercado

| Segmento | Quartos | Preço ZEHLA | TAM no Brasil | Prioridade |
|---|---|---|---|---|
| Micro Pousada | 1-5 | Free / Starter | ~80.000 | 🔴 Alta (entrada) |
| Pousada Média | 6-15 | Professional R$397 | ~35.000 | 🔴 Alta (core) |
| Hotel Boutique | 16-30 | Enterprise R$697 | ~8.000 | 🟡 Média |
| Rede/Grupo | 30+ | Custom | ~2.000 | 🟢 Baixa (fase 2) |

**ICP (Ideal Customer Profile):**
- Pousada com 6-15 quartos (Professional R$397/mês)
- Faturamento mensal R$ 30.000 - R$ 80.000
- Proprietário-gestor (não corporativo)
- Usa WhatsApp para reservas (60%+ do mercado)
- Localizada em destino turístico (litoral, serra, histórico)
- Tem presença no Booking.com mas reclama de comissões
- **Dor principal**: "Perco reservas porque não consigo gerenciar tudo"

### 1.5 Posicionamento Competitivo

| Critério | ZEHLA | Little Hotelier | Cloudbeds | Planilhas/WhatsApp |
|---|---|---|---|---|
| Preço | R$ 397/mês | R$ 550+/mês | R$ 800+/mês | "Grátis" (custo oculto) |
| Público | Pousadas BR | Hotéis globais | Hotéis/cadeias | Todos |
| Idioma | Português nativo | Inglês/Espanhol | Inglês | — |
| Canal principal | WhatsApp | Multi-channel | Multi-channel | WhatsApp |
| IA/Cognitivo | ✅ Sim | ❌ Não | Parcial | ❌ Não |
| Setup | 24 horas | 1-2 semanas | 2-4 semanas | N/A |
| Suporte | WhatsApp + humano | Ticket/Email | Ticket | N/A |

---

## 2. Funil de 9 Fases

O funil comercial do ZEHLA é composto por 9 fases sequenciais, cada uma com objetivo claro, gatilhos de transição, ferramentas, KPIs e nível de automação definidos.

### Fase 1 — Geração de Cohorts via Email Marketing

**Objetivo:** Gerar tráfego qualificado para landing pages segmentadas a partir de uma base de 10.000 contatos, enviando 1.000-1.500 emails por semana em cohorts de 3 variantes (Financial, Operational, Occupancy).

**Gatilho de Entrada:** Lead entra na base via scraping ético de portais de pousadas, indicações, formulários de conteúdo.

**Ferramentas:** Resend (envio), PostgreSQL (lista), n8n (orquestração), Fathom Analytics (tracking).

**Frequência:** 3 emails/semana (terça, quinta, sábado — horários 8h e 18h BRT, janela do hoteleiro).

**Estratégia de Cohorts:**

```
Base 10.000 contatos
├── Cohort A: "Financial Pain" (3.333 contatos)
│   ├── Variant A1: Assunto financeiro direto
│   ├── Variant A2: Storytelling de caso
│   └── Variant A3: Dado/chamativo
├── Cohort B: "Operational Pain" (3.333 contatos)
│   ├── Variant B1: Assunto operacional direto
│   ├── Variant B2: História de caos check-in
│   └── Variant B3: Comparativo antes/depois
└── Cohort C: "Occupancy Pain" (3.334 contatos)
    ├── Variant C1: Assunto ocupação direto
    ├── Variant C2: Dado de sazonalidade
    └── Variant C3: FOMO de concorrente
```

**Emails de Exemplo (3 Variantes):**

**VARIANTE FINANCEIRA — Email 1 (Topo de Funil):**
```
Assunto: Sua pousada está perdendo R$ 4.200 por mês (e você talvez não saiba)

Olá [NOME],

Eu sei que essa frase pode parecer exagerada. Mas fizemos as contas com dados
reais de 340 pousadas brasileiras e o número é esse.

O que acontece:

1. Você paga 15-20% de comissão no Booking.com por cada reserva
2. Você não reajusta diárias dinamicamente — então vende alta temporada
   pelo mesmo preço de baixa
3. Sobreposições de reservas causam perda de clientes que não voltam

Somando tudo, a pousada média perde R$ 4.200/mês em receita deixada na mesa.

Nós criamos o ZEHLA exatamente para resolver isso.

ZEHLA é um sistema que:
✅ Sugere preços dinâmicos baseados na sua demanda real
✅ Automatiza reservas pelo WhatsApp (zero comissão)
✅ Evita overbooking com calendário inteligente

Custo: a partir de R$ 397/mês. Retorno médio: +R$ 3.800/mês em 60 dias.

Quer ver como funciona na sua pousada? Sem compromisso:
→ https://zehla.com.br/financeiro?email=[EMAIL]

Abraços,
Equipe ZEHLA
```

**VARIANTE OPERACIONAL — Email 1 (Topo de Funil):**
```
Assunto: "A receptionist chorou no final do feriado" (história real)

Olá [NOME],

Isso aconteceu na Pousada Sol e Mar em Ubatuba.

Feriado de 7 dias. 100% de ocupação. Parecia o cenário perfeito.

Mas o que realmente aconteceu:

-> 4 reservas dupladas no mesmo quarto (planilha com filtro quebrado)
-> 12 check-ins manuais, cada um levando 25 minutos (hóspedes irritados)
-> 3 hóspedes que reservaram pelo Booking e não constavam no controle
-> A receptionist, sozinha, trabalhou 18h por dia e pediu demissão na terça

Depois que implantaram o ZEHLA:
-> Check-in digital: hóspede recebe QR code pelo WhatsApp
-> Calendário unificado: Booking, WhatsApp, Airbnb em uma tela
-> Zero overbooking: o sistema bloqueia automaticamente

A receptionist voltou. Os hóspedes deixaram 4.8★ no Google.

Sua pousada merece isso também:
→ https://zehla.com.br/operacional?email=[EMAIL]

Um abraço,
Equipe ZEHLA
```

**VARIANTE OCUPAÇÃO — Email 1 (Topo de Funil):**
```
Assunto: Por que sua pousada tem 40% de ocupação na baixa temporada

Olá [NOME],

A média nacional de ocupação de pousadas na baixa temporada é 38%.
Mas as pousadas que usam estratégia de preços dinâmicos alcançam 58%.

Sabe a diferença? R$ 12.000 a mais por mês.

Como funciona na prática:

📅 Terça-feira: 3 quartos ocupados → ZEHLA sugere diária -25%
   Resultado: +2 reservas recebidas pelo WhatsApp até as 17h

📅 Sexta-feira: 8 quartos ocupados → ZEHLA sugere diária +15%
   Resultado: maximização de receita na janela de alta demanda

📅 Domingo: 10 quartos disponíveis, semana seguinte vazia
   → ZEHLA dispara campanha automática para hóspedes anteriores

Não é magia. É inteligência aplicada à hotelaria.

Teste grátis por 7 dias — veja na sua própria pousada:
→ https://zehla.com.br/ocupacao?email=[EMAIL]

Até logo,
Equipe ZEHLA
```

**KPIs da Fase 1:**

| Métrica | Meta | Amarelo | Vermelho |
|---|---|---|---|
| Taxa de entrega | ≥98% | 95-97% | <95% |
| Open Rate (abertura) | ≥35% | 25-34% | <25% |
| Click Rate (clique) | ≥4% | 2,5-3,9% | <2,5% |
| Unsubscribe Rate | ≤0,3% | 0,3-0,5% | >0,5% |
| Bounce Rate | ≤1% | 1-2% | >2% |
| CTOR (Click-to-Open) | ≥11% | 8-10% | <8% |

**Nível de Automação:** 85% — Emails são enviados automaticamente via n8n/Resend. Apenas a criação de copy e análise de resultados é manual.

**Tabelas do Banco de Dados:**
```sql
email_campaigns          -- Campanhas e cohorts
email_variants           -- Variantes A/B/C
email_sends              -- Log de cada envio individual
email_events             -- Opens, clicks, bounces, unsubscribes
contacts                 -- Base master de 10.000 contatos
contact_cohort_assignments -- Atribuição de contato a cohort
```

---

### Fase 2 — Lead Scoring e Classificação

**Objetivo:** Pontuar cada lead em 18 dimensões para classificá-los em clusters RED (compra em 0-7 dias), ORANGE (7-30 dias), BLUE (30+ dias ou necessidade de re-engajamento).

**Gatilho de Entrada:** Lead acumulou pelo menos 1 evento digital (abriu email, visitou LP, clicou link).

**Ferramentas:** PostgreSQL (scoring engine), n8n (pipeline de eventos), HubSpot Free (CRM), Google Sheets (relatório gerencial).

**Modelo de Scoring (18 Dimensões):**

| # | Dimensão | Peso | Eventos que Incrementam |
|---|---|---|---|
| 1 | Frequência de Abertura | 5pts/evento | Cada email aberto (+5) |
| 2 | Recência de Abertura | Multiplicador | Abertura <48h (1.5x), <7d (1.2x), >30d (0.5x) |
| 3 | Click em Email | 15pts/evento | Cada link clicado (+15) |
| 4 | Click em Conteúdo Específico | 10pts/evento | Clique em "preços" (+20), "case" (+15), "blog" (+5) |
| 5 | Visualização de Vídeo | 10pts/evento | ≥50% do vídeo assistido (+10), ≥90% (+15) |
| 6 | Tempo na Landing Page | 5pts/evento | >60s (+5), >180s (+10), >300s (+15) |
| 7 | Visitas Repetidas à LP | 8pts/evento | 2 visitas (+8), 3+ visitas (+15) |
| 8 | Download de Material | 20pts/evento | PDF/e-book baixado (+20) |
| 9 | Interação WhatsApp | 30pts/evento | Mensagem enviada (+30), áudio recebido (+10) |
| 10 | Início de Trial | 50pts | Trial iniciado (+50) |
| 11 | Engajamento no Trial | 5pts/evento | Cada dia ativo no trial (+5), cada feature usada (+3) |
| 12 | Tamanho da Pousada | Pontuação Base | 6-15 quartos (+20), 16-30 (+15), 1-5 (+5), >30 (+10) |
| 13 | Localização | Pontuação Base | Destino turístico A (+15), B (+10), C (+5) |
| 14 | Presença no Booking | Pontuação Base | Sim (+15), Não (+5) |
| 15 | Reclamações Detectadas | 15pts/evento | Reclame Aqui, Google Reviews negativos (+15) |
| 16 | Sazonalidade da Dores | 10pts/evento | Entrando em alta temporada (+10) |
| 17 | Concorrência na Região | 10pts/evento | +5 pousadas com tech no raio de 10km (+10) |
| 18 | Indicação Recebida | 25pts | Indicado por cliente ZEHLA (+25) |

**Sistema de Clusters:**

```
PONTUAÇÃO TOTAL → CLASSIFICAÇÃO

≥ 120 pontos → 🔴 RED (Compra Iminente)
  - Probabilidade de conversão: 35-45%
  - Ação: SDR contacta em <2h via WhatsApp
  - SLA de resposta: 30 minutos (horário comercial)

60-119 pontos → 🟠 ORANGE (Qualificado Morno)
  - Probabilidade de conversão: 15-25%
  - Ação: Nutrição automatizada + retargeting
  - Reavaliação: a cada 7 dias, pode subir para RED

20-59 pontos → 🔵 BLUE (Educação Necessária)
  - Probabilidade de conversão: 3-8%
  - Ação: Conteúdo educativo, re-engajamento em 30 dias
  - Pode precisar de re-entrada no topo do funil

< 20 pontos → ⚫ INATIVO
  - Ação: Pausa de 60 dias, reengajamento com oferta especial
```

**Exemplo Prático de Scoring:**

| Lead: Pousada Mar Azul, Paraty, 10 quartos |
|---|
| Abriu 4 emails: 4 × 5 = 20pts |
| Clicou em "preços": +20pts |
| Clicou em "case": +15pts |
| Visitou LP 3 vezes: +15pts |
| Tempo >180s na LP: +10pts |
| Enviou mensagem WhatsApp: +30pts |
| Tamanho (6-15 quartos): +20pts |
| Localização turística A: +15pts |
| Booking.com ativo: +15pts |
| **TOTAL: 160pts → 🔴 RED** |

**KPIs da Fase 2:**

| Métrica | Meta | Amarelo | Vermelho |
|---|---|---|---|
| % Leads Pontuados | ≥90% | 80-89% | <80% |
| % RED sobre total | ≥10% | 7-9% | <7% |
| Taxa RED → Trial | ≥25% | 18-24% | <18% |
| Tempo Médio Topo → RED | ≤14 dias | 15-21 dias | >21 dias |
| Falsos Positivos RED | ≤15% | 16-25% | >25% |

**Nível de Automação:** 70% — Scoring é automático, classificação de cluster é automática, mas ajuste de pesos e análise de qualidade é manual semanal.

**Tabelas do Banco de Dados:**
```sql
lead_scores               -- Pontuação total por lead e data
lead_score_dimensions     -- Detalhamento por dimensão
lead_clusters             -- Classificação RED/ORANGE/BLUE por lead
scoring_config            -- Pesos e multiplicadores configuráveis
cluster_transitions       -- Histórico de mudanças de cluster
```

---

### Fase 3 — Retargeting (Google + Meta)

**Objetivo:** Impactar leads que não converteram na primeira interação, utilizando retargeting pagos no Google e Meta para aumentar frequência de exposição e criar urgência.

**Gatilho de Entrada:** Lead visitou landing page OU abriu pelo menos 2 emails, mas não iniciou trial.

**Ferramentas:** Google Ads (Search + Display), Meta Ads Manager, Google Tag Manager, GA4, Customer Match, Conversions API.

#### 3.1 Google Ads — Estratégia Detalhada

**Orçamento:** R$ 30-50/dia (R$ 900-1.500/mês)

**Segmentação:**
- Remarketing Lists for Search Ads (RLSA): leads com scoring ≥40
- Display Network: leads que visitaram LP mas não clicaram CTA
- YouTube In-Stream: leads ORANGE com engajamento alto em vídeo

**Lista de Palavras-Chave (Negative + Positive):**

```
✅ POSITIVAS (Search + RLSA):
  - "sistema para pousada"
  - "software gestão pousada"
  - "software para hotelaria pequena"
  - "automatizar reservas pousada"
  - "checkin digital pousada"
  - "sistema reserva online pousada"
  - "gestão hoteleira software"
  - "pousada preco dinamico"
  - "canal de vendas direta pousada"
  - "substituir booking.com pousada"
  - "diária dinâmica hotel pousada"
  - "pousada gestão whatsapp"
  - "software pousada brasil"
  - "booking engine pousada"
  - "calendário reservas online pousada"
  - "receita pousada baixa temporada"
  - "channel manager pousada"
  - "sistema hoteleiro economico"
  - "pousada reservas whatsapp"
  - "melhor sistema para pousadas"

❌ NEGATIVAS:
  - "grátis" (não queremos freeloader mindset)
  - "excel" "planilha" (não são nosso público)
  - "hotel corporativo" "rede hoteleira"
  - "airbnb host" "alojamento airbnb"
  - "curso" "treinamento" (educação, não software)
  - "vaga" "emprego" "contratação"
  - "gratuito" "freeware" "open source"
```

**Copy Framework para Google Ads:**

```
Headline 1: "Sistema para Pousadas — R$397/mês"
Headline 2: "Check-in Digital + WhatsApp Reservas"
Headline 3: "Trial Grátis 7 Dias — Sem Cartão"
Description 1: "Automatize reservas, check-in e preços dinâmicos. Feito para pousadas brasileiras. Suporte em português via WhatsApp."
Description 2: "Substitua planilhas e perca menos reservas. +340 pousadas já usam. Veja cases reais."
```

#### 3.2 Meta Ads — Estratégia com AIC (Audience Insights)

**Orçamento:** R$ 25-40/dia (R$ 750-1.200/mês)

**Custom Audiences:**
1. **CA-Web Visitors:** Leads que visitaram zehla.com.br (lookalike 1-3%)
2. **CA-Email Openers:** Leads que abriram email nos últimos 30 dias
3. **CA-Engaged:** Leads com scoring ≥30 (ORANGE/RED)
4. **CA-Customers:** Clientes ativos (lookalike para prospecção)

**Framework Criativo para Meta Ads:**

```
┌─────────────────────────────────────────────────┐
│ FORMATO 1: Carrossel de Dores → Solução         │
├─────────────────────────────────────────────────┤
│ Card 1: "40% de ocupação na baixa?"              │
│   → Copy: "A média é 38%. Com ZEHLA chega a 58%"│
│ Card 2: "Overbookig no feriado?"                │
│   → Copy: "Zero sobreposições com calendário     │
│         inteligente unificado"                   │
│ Card 3: "R$ 4.200/mês em comissão?"              │
│   → Copy: "Canal direto pelo WhatsApp = +30%     │
│         reservas sem comissão"                    │
│ Card 4: CTA → "Teste Grátis 7 Dias"             │
└─────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────┐
│ FORMATO 2: Vídeo Testimonial (30-45s)           │
├─────────────────────────────────────────────────┤
│ Hook (0-5s):                                    │
│   "Eu perdia 5 reservas por semana até descobrir│
│    o ZEHLA"                                      │
│                                                  │
│ Problema (5-15s):                                │
│   "Tinha reserva no Booking que não constava     │
│    na minha planilha. Hóspede chegava e eu não   │
│    tinha o quarto. Vergonha pura."               │
│                                                  │
│ Solução (15-30s):                                │
│   "Com o ZEHLA, tudo vai pro calendário          │
│    automaticamente. Booking, WhatsApp, tudo      │
│    numa tela só."                                │
│                                                  │
│ Resultado (30-40s):                              │
│   "Em 2 meses: +35% de ocupação. Zero erros."    │
│                                                  │
│ CTA (40-45s):                                    │
│   "Teste grátis 7 dias → zehla.com.br"          │
└─────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────┐
│ FORMATO 3: Single Image + Copy Longo             │
├─────────────────────────────────────────────────┤
│ Imagem: Dashboard ZEHLA com dados reais          │
│ (ocupação, reservas, receita)                    │
│                                                  │
│ Copy:                                             │
│ "Sua pousada tem uma 'receita escondida' de       │
│ R$ 3.800/mês que você não está capturando.       │
│                                                  │
│ Vamos mostrar onde está esse dinheiro:           │
│ 1. Reservas que chegam pelo WhatsApp e você      │
│    perde porque demora para responder            │
│ 2. Diárias que poderiam custar 30% mais na       │
│    alta temporada (e seus hóspedes pagariam)     │
│ 3. Hóspedes que ficaram felizes mas nunca        │
│    voltaram porque não houve follow-up           │
│                                                  │
│ O ZEHLA resolve tudo isso em uma única tela.     │
│ Feito por brasileiros para brasileiros.           │
│ R$ 397/mês. Retorno em 15 dias.                  │
│                                                  │
│ 👉 Teste grátis por 7 dias: [link]"              │
└─────────────────────────────────────────────────┘
```

**Customer Match + Conversions API:**
- Upload semanal de emails pontuados ≥60 (ORANGE+RED) para Google Customer Match e Meta Custom Audience
- Conversions API do Meta disparado quando lead inicia trial, para otimizar por conversão real (não clique)
- Offline conversions no Google para leads que converteram via WhatsApp (tracking manual)

**KPIs da Fase 3:**

| Métrica | Google Ads | Meta Ads |
|---|---|---|
| CPM | ≤R$ 25 | ≤R$ 30 |
| CPC | ≤R$ 2,50 | ≤R$ 3,00 |
| CTR | ≥3% | ≥2,5% |
| ROAS | ≥3x | ≥2,5x |
| Cost per Trial Start | ≤R$ 50 | ≤R$ 60 |
| Frequency (Meta) | 2-4x/sem | 2-4x/sem |

**Nível de Automação:** 60% — Segmentação de audiences é automatizada (n8n + APIs), mas criação de copy, ajuste de bids e análise criativa são manuais.

**Tabelas do Banco de Dados:**
```sql
ad_campaigns              -- Campanhas Google e Meta
ad_creatives              -- Criativos e variantes
ad_audiences              -- Segmentações de audiência
ad_performance_daily      -- Métricas diárias por campanha
customer_match_uploads    -- Log de uploads para Customer Match
conversions_api_events    -- Eventos enviados via Conversions API
```

---

### Fase 4 — Pipeline de Eventos (5 Estágios)

**Objetivo:** Capturar, normalizar, enriquecer e rotear todos os eventos digitais do lead em um pipeline estruturado de 5 estágios, alimentando o scoring e as automações downstream.

**Gatilho de Entrada:** Qualquer evento digital gerado pelo lead (email open, page view, click, form submit, WhatsApp message).

**Ferramentas:** n8n (orquestrador), Redis + BullMQ (fila), PostgreSQL (persistência), GA4 (coleta web), Resend Webhooks (email), Z-API Webhooks (WhatsApp).

**Os 5 Estágios do Pipeline:**

```
┌──────────┐    ┌──────────────┐    ┌─────────────┐    ┌───────────┐    ┌──────────┐
│ STAGE 1  │───→│  STAGE 2     │───→│  STAGE 3    │───→│  STAGE 4  │───→│  STAGE 5  │
│ CAPTURE  │    │  NORMALIZE   │    │  ENRICH     │    │  SCORE    │    │  ROUTE    │
│          │    │              │    │             │    │           │    │           │
│ - Webhook│    │ - Schema     │    │ - Geo IP    │    │ - Calc    │    │ - Cluster │
│ - Pixel  │    │   validation │    │ - Device    │    │   18 dims  │    │   assign  │
│ - API    │    │ - Dedup      │    │ - Session   │    │ - Update  │    │ - Trigger │
│ - Crawl  │    │ - Taxonomy   │    │ - UTM parse │    │   scores  │    │   actions │
│          │    │   mapping    │    │ - Append    │    │ - Persist │    │ - Notify  │
└──────────┘    └──────────────┘    └─────────────┘    └───────────┘    └──────────┘
     ↓                  ↓                  ↓                  ↓               ↓
  <500ms          <200ms            <100ms            <300ms          <200ms
```

**Stage 1 — CAPTURE:**
Recebe eventos brutos de múltiplas fontes via webhooks. Não valida nem processa — apenas aceita e enfileira.

**Stage 2 — NORMALIZE:**
Valida contra JSON Schema, remove duplicatas (dedup por hash de evento), mapeia para taxonomia interna (ver seção 6 para taxonomia completa).

**Stage 3 — ENRICH:**
Adiciona contexto: geolocalização por IP, device fingerprint, parse de UTM parameters, dados do contato existente.

**Stage 4 — SCORE:**
Recalcula scoring do lead nas 18 dimensões, atualiza pontuação total, detecta mudança de cluster.

**Stage 5 — ROUTE:**
Dispara ações baseadas no cluster atualizado: notificação SDR para REDs, enfileiramento de retargeting para ORANGEs, pausa de comunicação para INATIVOs.

**Nível de Automação:** 95% — Pipeline é 100% automatizado. Intervenção humana apenas para debugging e ajustes de configuração.

**Tabelas do Banco de Dados:**
```sql
event_queue               -- BullMQ: eventos pendentes de processamento
event_processed           -- Eventos já processados
event_dedup_log           -- Log de deduplicação
event_enrichment_cache    -- Cache de enriquecimento (Geo, Device)
event_scoring_log         -- Log de cada cálculo de scoring
event_routing_log         -- Log de ações disparadas
```

---

### Fase 5 — WhatsApp SDR

**Objetivo:** Estabelecer contato humano via WhatsApp (canal nativo do hoteleiro) com leads classificados como RED, utilizando método SBI (Situation-Behavior-Impact) para qualificação e agendamento de demonstração.

**Gatilho de Entrada:** Lead atingiu cluster RED (≥120 pontos) ou iniciou interação via WhatsApp espontaneamente.

**Ferramentas:** Z-API (integração WhatsApp Business), Typebot (triagem inicial), HubSpot (CRM), n8n (automação de mensagens).

**Fluxo de Triagem Typebot:**

```
Lead envia mensagem WhatsApp
        ↓
┌─────────────────────────────────┐
│ TYPEBOT TRIAGE                  │
│                                 │
│ "Olá! 👋 Sou o assistente      │
│ virtual do ZEHLA.              │
│                                 │
│ Que ajuda você precisa?         │
│                                 │
│ 1️⃣ Conhecer o ZEHLA            │
│ 2️⃣ Já sou cliente (suporte)    │
│ 3️⃣ Falar com um especialista"  │
└─────────────────────────────────┘
        ↓
   Opção 1 → Perguntas qualificação:
   - "Quantos quartos tem sua pousada?"
   - "Você usa WhatsApp para reservas?"
   - "Qual sua maior dor hoje?"
        ↓
   Se RED → Transferência para SDR humano
   Se ORANGE → Nutrição via bot + email
   Se BLUE → Conteúdo educativo
```

**Método SBI (Situation-Behavior-Impact) para SDRs:**

```
MENSAGEM 1 (Warm-up — após Typebot identificar RED):

"Oi [NOME]! Aqui é a [NOME_SDR] do ZEHLA 👋

Vi que você acessou nossa página sobre gestão de reservas.
Percebi que sua pousada em [CIDADE] tem [N] quartos — é exatamente
o perfil que mais se beneficia do nosso sistema.

Posso te mostrar em 15 minutos como o ZEHLA pode ajudar
especificamente a [POUNTA_DO_LEAD_BASEADA_NO_SCORING]?

Qual o melhor horário pra você hoje ou amanhã?"

--- Se aceitar agendamento ---

MENSAGEM 2 (Confirmação):

"Perfeito! Agendado para [DATA/HORA] 🔒

Vou te mandar o link da demonstração 5 min antes.
Enquanto isso, se quiser dar uma olhada:
→ https://zehla.com.br/demo-preview

Até lá! 😊"

--- Se não responder em 24h ---

MENSAGEM 3 (Follow-up com SBI):

"[NOME], só um toque rápido.

A situação que mais vejo em pousadas como a sua é:
🚩 reservas se perdendo entre WhatsApp e planilhas
🚩 comissões de 15-20% no Booking que poderiam ser evitadas

Isso geralmente significa R$ 3.000-5.000/mês em receita perdida.

O que acha de vermos juntos se o ZEHLA resolve isso pra você?
15 minutos, sem compromisso. 👇
[LINK AGENDAMENTO]"

--- Se não responder em 48h total ---

MENSAGEM 4 (Break-up com porta aberta):

"[NOME], entendo que pode não ser o momento ideal.

Deixo o link aqui caso mude de ideia — o trial de 7 dias
é sempre gratuito:
→ https://zehla.com.br/trial

Qualquer coisa, estou no WhatsApp. Abraços! 🙏"
```

**SLAs do WhatsApp SDR:**

| Ação | SLA | Escalação |
|---|---|---|
| Primeira resposta a lead RED | ≤30 minutos (horário comercial 8h-18h) | Se 30min sem resposta → alerta no Slack |
| Follow-up sem resposta | 24h após última mensagem | Automático via n8n |
| Segundo follow-up | 48h após primeiro follow-up | Automático |
| Transferência para Closer | ≤2h após SDR qualificar como SQL | Manual |
| Resposta fora de horário | Até 8h do dia seguinte | Automático com mensagem "voltei" |

**KPIs da Fase 5:**

| Métrica | Meta | Amarelo | Vermelho |
|---|---|---|---|
| Taxa de Resposta (lead → conversation) | ≥60% | 45-59% | <45% |
| Taxa de Agendamento (conversation → demo) | ≥30% | 20-29% | <20% |
| Tempo Primeira Resposta | ≤30min | 30-60min | >60min |
| Conversas por SDR/dia | ≥15 | 10-14 | <10 |
| SQL gerados por SDR/semana | ≥8 | 5-7 | <5 |
| NPS do contato WhatsApp | ≥70 | 50-69 | <50 |

**Nível de Automação:** 50% — Triagem inicial via Typebot é automática. SBI messages são templates com personalização semi-automática. A conversa humana real é 100% manual.

**Tabelas do Banco de Dados:**
```sql
whatsapp_conversations     -- Sessões de conversa
whatsapp_messages          -- Cada mensagem enviada/recebida
whatsapp_triage_results    -- Resultados da triagem Typebot
sdr_activities             -- Log de ações dos SDRs
sdr_performance_daily      -- Métricas diárias por SDR
```

---

### Fase 6 — Landing Page Dinâmica

**Objetivo:** Apresentar uma landing page personalizada para cada lead, baseada em seu cluster, score, e fonte de tráfego, maximizando a taxa de conversão para trial.

**Gatilho de Entrada:** Lead clica em qualquer link nos emails ou anúncios.

**Ferramentas:** Next.js (SSR), PostgreSQL (dados do lead), Fathom Analytics, n8n (personalização).

**Variáveis de Personalização:**

```
Baseado em Scoring + Cluster:
├── RED Leads:
│   → Headline: "Sua pousada em [CIDADE] pode aumentar a receita em R$ 3.800/mês"
│   → CTA: "Iniciar Trial Agora" (botão grande, verde)
│   → Social proof: Cases de pousadas da mesma região
│   → Urgência: Badge "Vagas limitadas para onboarding este mês"
│   → WhatsApp flutuante: "Falar agora com especialista"
│
├── ORANGE Leads:
│   → Headline: "Veja como 340 pousadas estão aumentando a ocupação"
│   → CTA: "Ver Demonstração Gratuita"
│   → Social proof: Número geral de clientes + ratings
│   → Educação: Seção "Como funciona em 3 passos"
│   → Recaptura: Email exit-intent popup
│
└── BLUE Leads:
    → Headline: "O guia completo para modernizar sua pousada em 2025"
    → CTA: "Baixar Guia Gratuito" (lead magnet)
    → Social proof: Logo de parceiros/trust badges
    → Educação: Blog posts relacionados, FAQ extenso
    → Retargeting pixel carregado (Facebook + Google)
```

**Elementos de Conversão:**

1. **Above the Fold:** Headline personalizada + CTA + badge de confiança ("340+ pousadas")
2. **Prova Social:** 3 depoimentos em carrossel (filtro por região do lead)
3. **Calculadora de ROI:** Input "quartos" e "diária média" → output estimativa de ganho
4. **Seção FAQ:** 6-8 perguntas baseadas nas dores detectadas pelo scoring
5. **CTA Final:** Trial grátis + número WhatsApp para dúvidas
6. **Exit Intent:** Popup com oferta de trial + desconto de 10% no primeiro mês

**KPIs da Fase 6:**

| Métrica | Meta | Amarelo | Vermelho |
|---|---|---|---|
| Taxa de Conversão LP → Trial (RED) | ≥12% | 8-11% | <8% |
| Taxa de Conversão LP → Trial (ORANGE) | ≥5% | 3-4% | <3% |
| Taxa de Conversão LP → Trial (BLUE) | ≥1,5% | 0,8-1,4% | <0,8% |
| Bounce Rate (RED) | ≤35% | 36-50% | >50% |
| Tempo na Página | ≥90s | 60-89s | <60s |

**Nível de Automação:** 80% — Personalização é dinâmica via SSR. Apenas criação de copy e testes A/B são manuais.

**Tabelas do Banco de Dados:**
```sql
landing_page_variants      -- Variantes de LP (por cluster)
landing_page_views         -- Cada visualização de LP
landing_page_conversions   -- Conversões (CTA clicks, form submits)
ab_tests                  -- Testes A/B ativos
ab_test_assignments        -- Qual variante cada lead viu
```

---

### Fase 7 — Trial de 7 Dias

**Objetivo:** Converter leads em trialistas ativos e guiá-los através de uma experiência de 7 dias que demonstre valor concreto, levando à conversão para plano pago.

**Gatilho de Entrada:** Lead clica em CTA de trial na LP ou é redirecionado pelo SDR.

**Ferramentas:** Plataforma ZEHLA (onboarding), n8n (sequências de ativação), Resend (emails de onboarding), Z-API (mensagens WhatsApp), PostgreSQL (tracking de engajamento).

**Experiência Dia-a-Dia:**

```
DIA 0 — Ativação
├── Email: "Bem-vindo ao ZEHLA! Seu trial de 7 dias começou 🎉"
├── WhatsApp: "Oi [NOME]! Seu trial está ativo. Vou te guiar pelos próximos 7 dias."
├── Dentro da plataforma: Checklist de 5 passos iniciais
│   1. Cadastrar quartos
│   2. Configurar preços base
│   3. Conectar WhatsApp Business
│   4. Importar reservas existentes
│   5. Configurar calendário de disponibilidade
├── Meta: Completar pelo menos 3/5 passos
└── Engajamento esperado: Login + 2 ações

DIA 1 — Primeiro Valor
├── Email: "Viu? Já dá pra sentir a diferença 📊"
├── Dentro da plataforma: Dashboard de insights
│   → "Sua pousada tem [X] quartos. Se vendesse 10% mais na alta temporada,
│      isso significaria +R$ [Y]/mês"
├── WhatsApp: "Conseguiu cadastrar seus quartos? Posso ajudar!"
├── Meta: Completar checklist + ver dashboard
└── Engajamento esperado: Login + feature de precificação explorada

DIA 2 — Recomendação Inteligente
├── Email: "A inteligência do ZEHLA encontrou uma oportunidade para você"
├── Dentro da plataforma: Alerta de oportunidade
│   → "Baseado nos seus preços atuais, você poderia cobrar R$ XX a mais
│      nos finais de semana de [MÊS]. Veja a projeção."
├── Meta: Usar feature de recomendação de preços
└── Engajamento esperado: Login + visualização de recomendação

DIA 3 — Automação WhatsApp
├── Email: "Imagina receber reservas pelo WhatsApp automaticamente? 💬"
├── Dentro da plataforma: Setup do canal WhatsApp
│   → Tutorial de conexão + primeiro teste de reserva
├── WhatsApp: "Quando você conectar seu WhatsApp, hóspedes poderão
│   reservar direto. Vamos testar?"
├── Meta: Conectar WhatsApp e receber 1 reserva teste
└── Engajamento esperado: WhatsApp conectado + 1 interação

DIA 4 — Prova Social
├── Email: "Como a Pousada [SIMILAR] aumentou 35% a ocupação em 60 dias"
├── Dentro da plataforma: Case study popup
├── Meta: Ler case study + engajar com feature similar
└── Engajamento esperado: Login + tempo > 3 min

DIA 5 — Check-in do Progresso
├── Email: "Você está no dia 5. Veja o que já configurou ✅"
├── Dentro da plataforma: Relatório de progresso do trial
│   → Quartos cadastrados: ✓/✗
│   → Precificação: ✓/✗
│   → WhatsApp: ✓/✗
│   → Reservas recebidas: [N]
│   → Score de ativação: [X]%
├── Meta: Score de ativação ≥ 70%
└── Engajamento esperado: Login + ver progresso

DIA 6 — Urgência
├── Email: "Seu trial termina amanhã. Não perca o que já construiu."
├── WhatsApp: "[NOME], amanhã é o último dia do trial.
│   Qualquer coisa configurada será salva se você assinar."
├── Dentro da plataforma: Banner "Último dia — Assine e continue"
├── Meta: Login + interação com CTA de upgrade
└── Engajamento esperado: Clique em CTA de upgrade

DIA 7 — Conversão
├── Email: "Seu trial terminou. Continue com o ZEHLA por R$ 397/mês"
├── WhatsApp: "Oi [NOME]! Seu trial acabou, mas tudo que você configurou
│   está salvo. Quer continuar? Posso te ajudar a escolher o plano ideal."
├── Dentro da plataforma: Paywall + comparação de planos
├── Meta: Assinatura de plano pago
└── Engajamento esperado: Conversão trial → pago
```

**Detecção de Estagnação (Stagnation Detection):**

```
Regras de estagnação (disparam ação de resgate):

STAGNATION LEVEL 1 (Amarelo):
- Login dia 1 OK, mas sem login dia 2
→ Ação: Email + WhatsApp "Está com alguma dificuldade?"
- Menos de 2 ações no dia anterior
→ Ação: Email "Dica rápida: [FEATURE] pode te ajudar agora"

STAGNATION LEVEL 2 (Vermelho):
- Sem login por 48h consecutivos
→ Ação: SDR liga/WhatsApp "Posso te ajudar a configurar?"
- Checklist 0/5 preenchido no dia 3
→ Ação: Oferta de "onboarding assistido" (SDR compartilha tela)

STAGNATION LEVEL 3 (Crítico):
- Sem login por 72h+
→ Ação: Email de re-engajamento forte + link para reiniciar trial
- Interagiu apenas com 1 feature em 5 dias
→ Ação: "Parece que o ZEHLA não é prioridade agora. Vou pausar
         seus emails e voltar a contactar em 30 dias."
```

**KPIs da Fase 7:**

| Métrica | Meta | Amarelo | Vermelho |
|---|---|---|---|
| Trial Start Rate (lead → trial) | ≥8% | 5-7% | <5% |
| Activation Rate (trial → ativo) | ≥70% | 55-69% | <55% |
| Conversion Rate (trial → pago) | ≥25% | 18-24% | <18% |
| Time to Value (TTV) | ≤48h | 48-72h | >72h |
| Stagnation Rate | ≤20% | 21-35% | >35% |
| Rescue Success Rate | ≥30% | 20-29% | <20% |

**Nível de Automação:** 75% — Sequências de email e WhatsApp são automatizadas. Detecção de estagnação é automática. Intervenção de SDR em estagnation level 2+ é manual.

**Tabelas do Banco de Dados:**
```sql
trials                    -- Registros de trials (start, end, status)
trial_daily_engagement    -- Engajamento diário por trialista
trial_checklist_progress  -- Progresso do checklist de ativação
trial_stagnation_events   -- Eventos de estagnação detectados
trial_rescue_actions      -- Ações de resgate realizadas
trial_conversion_events   -- Conversões trial → pago
```

---

### Fase 8 — Fechamento (Closing)

**Objetivo:** Conduzir demonstração personalizada, tratar objeções e fechar a assinatura do plano pago, seja via Closer (SDR qualificado) ou via automação (self-service conversion).

**Gatilho de Entrada:** Trial concluído (Dia 7) OU SQL qualificado pelo SDR (não passou por trial).

**Ferramentas:** Zoom/Google Meet (demo), Stripe (pagamento), HubSpot (CRM), Z-API (WhatsApp para objeções), n8n (follow-ups automatizados).

**Script de Demonstração Closer:**

```
ABERTURA (2 min):
"Bom dia [NOME]! Sou [NOME_CLOSER], especialista em pousadas.
Vi que sua pousada [NOME_POUSADA] em [CIDADE] tem [X] quartos.
Hoje em 20 minutos vou te mostrar exatamente como o ZEHLA
vai gerar [R$ Y] a mais por mês pra você.

Primeiro, me conta: qual é a sua MAIOR frustração hoje
com a gestão da pousada?"
← Ouvir, anotar, conectar com o script

DEMO PERSONALIZADA (12 min):
[Baseada na dor declarada pelo pousadeiro]

Se DOR FINANCEIRA:
→ Mostrar módulo de precificação dinâmica
→ Projetar: "Se você reajustasse +15% nos finais de semana,
   somaria R$ X/mês a mais"
→ Mostrar relatório de receita perdida

Se DOR OPERACIONAL:
→ Mostrar check-in digital
→ Demonstrar calendário unificado
→ Simular recebimento de reserva via WhatsApp

Se DOR OCUPAÇÃO:
→ Mostrar módulo de campanhas automáticas
→ Demonstrair follow-up de hóspedes anteriores
→ Projetar ocupação otimizada

TRATAMENTO DE OBJEÇÕES (4 min):

Objeção "É caro":
"Entendo. R$ 397 parece muito. Mas vamos às contas:
- Uma reserva direta que você deixa de perder = R$ 200-400
- Se o ZEHLA trouxer só 2 reservas/mês diretas, já pagou
- Na média, nossos clientes recebem 8-12 reservas diretas/mês
- Ou seja: investimento de R$ 397, retorno de R$ 3.800.
  Payback de 15 dias."

Objeção "Não tenho tempo":
"É exatamente por isso que o ZEHLA existe.
A configuração inicial leva 2 horas — eu faço com você agora.
Depois, o sistema trabalha sozinho.
Pousadeiro nosso cliente disse: 'Pela primeira vez em 10 anos,
consegui tirar domingo de folga.'"

Objeção "Já uso o [concorrente]":
"Respeito. E se eu te mostrasse o que o ZEHLA faz diferente?
[Mostrar 2-3 diferenciais específicos]
Além disso, fazemos migração gratuita. Zero dor de transição."

Objeção "Preciso pensar":
"Claro! Pensar é importante. Só quero deixar claro que:
- O trial de 7 dias já mostrou [X] na sua pousada
- Se assinar hoje, o preço fixa por 12 meses
- Se não gostar em 30 dias, devolvemos 100%
Qual seria a sua principal dúvida pra decidir?"

FECHAMENTO (2 min):
"Então [NOME], vimos que o ZEHLA pode gerar [R$ Y]/mês
a mais para a [NOME_POUSADA]. O plano Professional por R$ 397/mês
é o ideal para seus [X] quartos.

Vamos começar? Posso te mandar o link de pagamento agora.
Aceitamos cartão, Pix ou boleto (com 5% desconto)."
```

**Follow-up pós-demo:**

```
Se FECHOU:
→ WhatsApp: "🎉 Parabéns! Sua conta está ativa.
   Vou te acompanhar nos próximos 30 dias."
→ Email: "Bem-vindo oficial ao ZEHLA! Próximos passos..."
→ n8n dispara: onboarding de 30 dias (customer success)

Se NÃO FECHOU ("preciso pensar"):
→ Dia +1: Email com case study de pousada similar
→ Dia +3: WhatsApp com oferta especial
   "E se começássemos com o plano Starter (mais barato) e
    fizéssemos upgrade quando ver o resultado?"
→ Dia +7: "Último contato — quero respeitar seu tempo.
   O trial gratuito continua disponível quando quiser."

Se OBJEÇÃO DE PREÇO forte:
→ Oferecer Starter (≤5 quartos) se aplicável
→ Oferecer pagamento trimestral (5% desconto)
→ Oferecer garantia de 30 dias
```

**KPIs da Fase 8:**

| Métrica | Meta | Amarelo | Vermelho |
|---|---|---|---|
| Show Rate (agendou → apareceu) | ≥75% | 60-74% | <60% |
| Close Rate (demo → assinatura) | ≥35% | 25-34% | <25% |
| Self-service Conversion (trial → pago sem Closer) | ≥15% | 10-14% | <10% |
| Tempo Demo → Conversão | ≤48h | 48-96h | >96h |
| Churn no Mês 1 (pós-adesão) | ≤5% | 6-10% | >10% |
| ARPU no momento da conversão | ≥R$ 397 | R$ 350-396 | <R$ 350 |

**Nível de Automação:** 40% — Follow-ups são automatizados. Demo e closing são 100% humanos. Apenas self-service conversions são 100% automáticas.

**Tabelas do Banco de Dados:**
```sql
demos                     -- Agendamentos e realizações de demos
demo_outcomes             -- Resultados (fechou, objeção, no-show)
objection_log             -- Objeções registradas (para análise)
closing_attempts          -- Tentativas de fechamento
payment_intents           -- Intenções de pagamento Stripe
subscriptions             -- Assinaturas ativas
```

---

### Fase 9 — Otimização Contínua

**Objetivo:** Analisar dados do funil continuamente, identificar gargalos, testar hipóteses e implementar melhorias incrementais para aumentar taxas de conversão em todas as 8 fases anteriores.

**Gatilho de Entrada:** Análise semanal automática de KPIs + review mensal de performance.

**Ferramentas:** Metabase (dashboards), PostgreSQL (dados), n8n (alertas automáticos), Google Sheets (planejamento de experimentos), Slack (notificações).

**Framework de Otimização:**

```
SEMESTRE → 1 SPRINT (4 semanas) → 1 CICLO PDCA por semana

Semana 1: PLAN (Análise)
- Review completo dos KPIs das 8 fases
- Identificar top 3 gargalos
- Formular 3 hipóteses de melhoria
- Priorizar por impacto (ICE: Impact × Confidence × Ease)

Semana 2: DO (Implementação)
- Implementar testes A/B para hipótese #1
- Ajustar automações para hipótese #2
- Preparar tracking para hipótese #3

Semana 3: CHECK (Análise)
- Avaliar resultados dos testes
- Comparar vs. baseline
- Documentar aprendizados

Semana 4: ACT (Escala ou Pivotar)
- Se ganhou: escalar para 100% do tráfego
- Se perdeu: documentar learning, testar próxima hipótese
- Se neutro: coletar mais dados ou pivotar
```

**Hipóteses de Otimização Prioritárias (Exemplos):**

```
H1: "Emails enviados às 18h terão 15% mais open rate que 8h"
→ Teste: 50/50 cohort, medir open rate por 2 semanas

H2: "Lead scoring com peso maior em WhatsApp interação prevê melhor conversão"
→ Teste: Ajustar peso de 30→40 para WhatsApp, medir ROC/AUC

H3: "Landing pages com calculadora de ROI terão 20% mais conversão"
→ Teste: A/B com e sem calculadora, medir trial start rate

H4: "SDRs que enviam mensagem entre 10h-11h têm mais agendamentos"
→ Teste: Analisar dados históricos de agendamento por horário

H5: "Trial de 14 dias tem 10% mais conversão que 7 dias"
→ Teste: 50/50 cohort, medir conversion rate (cuidado com payback)
```

**Dashboard de Otimização (Metabase):**

| Panel | Métricas |
|---|---|
| Funil Overview | Volume por fase, taxas de conversão entre fases, tendência 4 semanas |
| Financial | CAC por canal, LTV por cohort, payback, MRR, churn |
| Email Performance | Open/click/unsub por variante, cohort, dia da semana |
| Scoring | Distribuição RED/ORANGE/BLUE, scoring accuracy, dimension correlation |
| Retargeting | CPC/CPM/ROAS por plataforma, cost per trial, frequency distribution |
| SDR Performance | Conversations, appointments, SQLs, close rate por SDR |
| Trial | Activation rate, stagnation, conversion by day, feature engagement |
| Closing | Show rate, close rate, objection breakdown, ARPU |

**KPIs da Fase 9:**

| Métrica | Meta |
|---|---|
| Experiments running (simultâneos) | ≥3 |
| Experiments concluded/month | ≥4 |
| Winning experiments/month | ≥1 |
| Funnel conversion improvement/month | ≥5% (compound) |
| Time to insight (análise → ação) | ≤48h |

**Nível de Automação:** 30% — Dashboards são automáticos. Alertas de KPI são automáticos. Formulação de hipóteses, implementação de testes e decisões de escala são 100% manuais.

**Tabelas do Banco de Dados:**
```sql
optimization_experiments    -- Registro de experimentos
experiment_variants         -- Variantes de cada experimento
experiment_results          -- Resultados de cada variante
funnel_snapshots            -- Snapshot semanal do funil completo
kpi_alerts                  -- Alertas de KPI fora da meta
kpi_history                 -- Histórico de todos os KPIs
```

---

## 3. Base de 10.000 Contatos

### 3.1 Estratégia de Cohorts

A base de 10.000 contatos é o ativo comercial inicial do ZEHLA. Não é uma lista comprada — é construída ao longo de 6-12 meses através de:

1. **Scraping ético** (3.000 contatos): Portais como Booking.com, TripAdvisor, Guia 4 Rodas, catálogos estaduais de turismo. Dados públicos de pousadas: nome, telefone, email, localização, número de quartos.
2. **Inbound via conteúdo** (3.000 contatos): E-books, webinars, calculadoras de ROI, templates de gestão. Leads que baixaram conteúdo em troca do email.
3. **Indicações e eventos** (2.000 contatos): Indicações de clientes existentes, networking em feiras de turismo (FITUR, ABAV), parcerias com associations (ABIH).
4. **Social media engagement** (2.000 contatos): Comentários em posts, DMs no Instagram, engajamento com conteúdo no LinkedIn.

**Hygiene da Base:**

```
Processo de limpeza (mensal):
1. Verificar emails válidos (SMTP check via n8n + Resend)
2. Remover bounces duros (5+ bounces = remove)
3. Identificar e segmentar inativos (sem engagement em 90 dias)
4. Atualizar dados de pousadas (fechou? mudou? novo contato?)
5. Verificar conformidade LGPD (opt-in status)
```

### 3.2 Estrutura de Cohorts

```
BASE: 10.000 CONTATOS

COHORT SEGMENTATION (Critérios Múltiplos):

Por Tamanho de Pousada:
├── Micro (1-5 quartos): ~3.500 contatos → Free/Starter
├── Média (6-15 quartos): ~4.000 contatos → Professional (ICP)
├── Grande (16-30 quartos): ~1.500 contatos → Enterprise
└── Extra Grande (30+): ~1.000 contatos → Custom

Por Origem:
├── Scraping: ~3.000 → Sequência cold email
├── Inbound: ~3.000 → Sequência warm (nutrição)
├── Indicação: ~2.000 → Sequência VIP (SLG direto)
└── Social: ~2.000 → Sequência engagement-driven

Por Score Atual (dinâmico):
├── 🔴 RED (≥120): ~800 contatos → Ação imediata SDR
├── 🟠 ORANGE (60-119): ~2.500 contatos → Nutrição ativa
├── 🔵 BLUE (20-59): ~4.000 contatos → Re-engajamento
└── ⚫ INATIVO (<20): ~2.700 contatos → Pausa 60 dias

Por Status LGPD:
├── Opt-in confirmado: ~7.000 → Comunicação full
├── Soft opt-in: ~2.000 → Apenas informativos
└── Sem opt-in: ~1.000 → Não contactar (remover em 30 dias)
```

### 3.3 Calendário de Envios

```
SEMANA TIPO (1.000-1.500 emails/semana):

Terça-feira 8h:  Cohort Financial — Email principal (500 emails)
Terça-feira 18h: Cohort Operational — Email principal (500 emails)

Quinta-feira 8h:  Cohort Occupancy — Email principal (500 emails)
Quinta-feira 18h: Follow-up para não-abridores da terça (300 emails)

Sábado 10h:       Email leve/educacional para BLUE cohort (300 emails)
                   (sábado = dia de folga do hoteleiro, mais propenso a ler)

Total semanal: ~2.100 emails (mas com dedup, chega a 1.000-1.500 únicos)

REGRAS:
- Cada contato recebe máximo 3 emails/semana
- Respeitar 48h entre emails para mesmo contato
- Excluir contatos que abrem <10% dos últimos 10 emails
- Aquecer IPs novos gradualmente (100/dia → 500/dia em 2 semanas)
```

### 3.4 Taxonomia de Email Copy (Framework)

```
ESTRUTURA DO EMAIL ZEHLA:

1. ASSUNTO (Subject Line):
   - Máximo 50 caracteres
   - Sem emojis no subject (deliverability)
   - Personalização: [CIDADE] ou [NOME_POUSADA]
   - Formatos que funcionam:
     a) Dado chocante: "Sua pousada perde R$ X por mês"
     b) História: "A receptionist que pediu demissão"
     c) Curiosidade: "O que 340 pousadas fazem diferente"
     d) Urgência: "Última chance para trial gratuito"

2. PREVIEW TEXT (20-30 chars):
   - Complementa o subject, não repete

3. CORPO DO EMAIL:
   - Tom: Conversacional, não corporativo
   - Linguagem: Português do Brasil (PT-BR)
   - Comprimento: 150-250 palavras
   - Estrutura: 1 história/dado → 3 bullets → 1 CTA
   - Sem imagens pesadas (carregamento rápido)
   - CTA: 1 só, acima da fold e no final

4. CTA (Call-to-Action):
   - URL personalizada com UTM parameters
   - Texto do botão: ação, não descrição
   - Exemplo: "Ver como funciona" (não "Clique aqui")
```

**KPIs da Base de Contatos:**

| Métrica | Meta |
|---|---|
| Contatos válidos (email OK) | ≥85% |
| Contatos opt-in | ≥70% |
| Email delivery rate | ≥98% |
| Contatos com scoring ≥60 (ORANGE+) | ≥33% |
| Contatos que já iniciaram trial | ≥8% |
| Base em crescimento mensal | +5% |

---

## 4. Lead Scoring e Classificação

### 4.1 Modelo Detalhado de 18 Dimensões

O modelo de lead scoring do ZEHLA avalia cada contato em 18 dimensões independentes, com pesos ajustáveis e multiplicadores contextuais.

**Dimensões por Categoria:**

```
ENGAGEMENT DIGITAL (Pontuação Dinâmica):
├── D1: Email Open (+5 por evento, multiplicador por recência)
├── D2: Email Click (+15 por evento)
├── D3: Specific Content Click (+5 a +20 por tipo de conteúdo)
├── D4: Video View (+10 por ≥50% assistido)
├── D5: Landing Page Time (+5 por >60s, +10 por >180s)
├── D6: Repeat LP Visits (+8 por 2 visitas, +15 por 3+)
├── D7: Material Download (+20 por download)
├── D8: WhatsApp Interaction (+30 por mensagem, +10 por áudio)
├── D9: Trial Initiation (+50 por início)
└── D10: Trial Engagement (+5 por dia ativo, +3 por feature usada)

FIRMOGRAPHIC (Pontuação Base — atribuída 1x):
├── D11: Property Size (1-5 quartos: +5, 6-15: +20, 16-30: +15, 30+: +10)
├── D12: Location (Destino A: +15, B: +10, C: +5)
├── D13: Booking.com Presence (Sim: +15, Não: +5)

CONTEXTUAL (Pontuação Dinâmica):
├── D14: Detected Complaints (+15 se encontrado em Reclame Aqui/Reviews)
├── D15: Seasonality (+10 se entrando em alta temporada)
├── D16: Competitive Pressure (+10 se concorrentes com tech no raio)
└── D17: Referral Source (+25 se indicado por cliente ZEHLA)
```

### 4.2 Fórmula de Cálculo

```
SCORE_TOTAL = (
  Σ(Engagement_Digital × Peso) × Multiplicador_Recência
  + Σ(Firmographic × Peso)
  + Σ(Contextual × Peso)
)

MULTIPLICADOR_RECÊNCIA:
  Último evento < 48h: × 1.5
  Último evento < 7 dias: × 1.2
  Último evento < 14 dias: × 1.0
  Último evento < 30 dias: × 0.7
  Último evento > 30 dias: × 0.4
  Último evento > 60 dias: × 0.2 (decai para INATIVO)

DECAY (decaimento semanal):
  Sem engajamento por 1 semana: -5% do score total
  Sem engajamento por 2 semanas: -15% do score total
  Sem engajamento por 4 semanas: -30% do score total
```

### 4.3 Thresholds de Cluster

```
CLASSIFICAÇÃO AUTOMÁTICA:

Score ≥ 120 → 🔴 RED
  → Ação: SLA 30min, SDR contacta via WhatsApp
  → Re-score: a cada evento (tempo real)
  → Downgrade: se sem evento por 72h → recalcular

Score 60-119 → 🟠 ORANGE
  → Ação: Nutrição ativa (2 emails/semana + retargeting)
  → Re-score: diário
  → Upgrade: se atingir ≥120 → notificar SDR

Score 20-59 → 🔵 BLUE
  → Ação: Re-engajamento mensal (1 email/semana)
  → Re-score: semanal
  → Upgrade: se atingir ≥60 → mover para nutrição ativa

Score < 20 → ⚫ INATIVO
  → Ação: Pausa 60 dias, re-engajamento com oferta especial
  → Re-score: mensal
  → Reset: se ouver novo evento → reavaliar imediatamente
```

### 4.4 Exemplos Práticos de Scoring

**Exemplo A: Pousada Imbatível (RED)**
| Dimensão | Valor | Pontos |
|---|---|---|
| D1: 6 emails abertos | 6 × 5 | 30 |
| D2: 2 cliques | 2 × 15 | 30 |
| D5: Tempo LP >180s | 1 × 10 | 10 |
| D8: WhatsApp | 1 × 30 | 30 |
| D11: 10 quartos | base | 20 |
| D12: Ubatuba (Destino A) | base | 15 |
| D13: Tem Booking | base | 15 |
| D15: Entrando alta temporada | 1 × 10 | 10 |
| Recency (último evento 24h) | × 1.5 | — |
| **TOTAL (antes recency)** | | **160** |
| **TOTAL (com recency)** | | **240 → 🔴 RED** |

**Exemplo B: Pousada Curiosa (ORANGE)**
| Dimensão | Valor | Pontos |
|---|---|---|
| D1: 3 emails abertos | 3 × 5 | 15 |
| D6: 2 visitas LP | 1 × 8 | 8 |
| D4: Vídeo 60% assistido | 1 × 10 | 10 |
| D11: 4 quartos | base | 5 |
| D13: Tem Booking | base | 15 |
| Recency (último evento 5d) | × 1.2 | — |
| **TOTAL (com recency)** | | **61 → 🟠 ORANGE** |

### 4.5 Calibração e Monitoramento

```
CALIBRAÇÃO MENSAL:
1. Comparar scores preditos com resultados reais de conversão
2. Calcular ROC/AUC do modelo de scoring
3. Analisar falsos positivos (RED que não converteram)
4. Ajustar pesos das dimensões com maior erro preditivo
5. Revisar thresholds de cluster se distribuição estiver desbalanceada

META DE QUALIDADE:
- AUC do scoring model: ≥ 0.75
- Precision (RED → conversão): ≥ 35%
- Recall (todos que converteram foram RED): ≥ 70%
```

---

## 5. Arquitetura de Retargeting

### 5.1 Google Ads — Configuração Detalhada

**Estrutura de Conta:**

```
Conta Google Ads ZEHLA
├── Campanha 1: RLSA — Search (Orçamento: R$ 15/dia)
│   ├── Grupo 1: "[RED] Keywords alta intenção"
│   │   → Bids: +50% sobre base para RED audience
│   │   → Ads: Headlines financeiros
│   ├── Grupo 2: "[ORANGE] Keywords médio intenção"
│   │   → Bids: +20% sobre base para ORANGE audience
│   │   → Ads: Headlines operacionais
│   └── Grupo 3: "[BLUE] Keywords baixa intenção"
│       → Bids: base para BLUE audience
│       → Ads: Headlines de conteúdo
│
├── Campanha 2: Display Retargeting (Orçamento: R$ 10/dia)
│   ├── Grupo 1: LP Visitors (todos)
│   │   → Ads: Banner estático + responsivo
│   │   → Frequency cap: 3x/dia, 7x/semana
│   ├── Grupo 2: LP Visitors que clicaram CTA
│   │   → Ads: Dinâmicos com produto
│   │   → Frequency cap: 5x/dia, 12x/semana
│   └── Grupo 3: Trial starters que não converteram
│       → Ads: Urgência "últimos dias do trial"
│       → Frequency cap: 5x/dia, 15x/semana
│
├── Campanha 3: YouTube In-Stream (Orçamento: R$ 10/dia)
│   ├── Grupo 1: Video Viewers ≥50% (maior engajamento)
│   │   → Ads: Vídeo testimonial 30s
│   │   → Bidding: CPV otimizado
│   └── Grupo 2: ORANGE leads que nunca viram vídeo
│       → Ads: Vídeo explicativo 45s
│       → Bidding: CPV otimizado
│
└── Campanha 4: Performance Max (Orçamento: R$ 5/dia)
    ├── Audience: Todos os leads scoring ≥20
    └── Auto-optimized across Search, Display, YouTube, Gmail, Discover
```

### 5.2 Meta Ads — Configuração Detalhada

**Estrutura de Conta:**

```
Conta Meta Ads ZEHLA
├── Campanha 1: Retargeting — Conversão (Orçamento: R$ 15/dia)
│   ├── Conjunto 1: CA-Web Visitors 7d
│   │   → Optimization: Conversions (trial start via CAPI)
│   │   → Placement: Feed + Stories + Reels
│   │   → Creatives: Carrossel de dores
│   ├── Conjunto 2: CA-Email Openers 14d
│   │   → Optimization: Conversions
│   │   → Placement: Feed + Stories
│   │   → Creatives: Vídeo testimonial
│   └── Conjunto 3: CA-Engaged (scoring ≥30) 30d
│       → Optimization: Conversions
│       → Placement: Auto
│       → Creatives: Single image + copy longo
│
├── Campanha 2: Retargeting — Tráfego (Orçamento: R$ 10/dia)
│   ├── Conjunto 1: CA-Web Visitors 30d (sem trial)
│   │   → Optimization: Link clicks
│   │   → Placement: Feed + Stories + Messenger
│   │   → Creatives: Carousel features
│   └── Conjunto 2: CA-Lookalike 1% (de clientes ativos)
│       → Optimization: Link clicks
│       → Placement: Feed + Reels
│       → Creatives: Vídeo demo 60s
│
└── Campanha 3: Retargeting — Engagement (Orçamento: R$ 10/dia)
    ├── Conjunto 1: Engagers with Page 90d
    │   → Optimization: Engagement
    │   → Placement: Feed + Stories
    │   → Creatives: Polls + Quizzes
    ├── Conjunto 2: Instagram Profile Engagers 90d
    │   → Optimization: Engagement
    │   → Placement: Feed + Stories + Reels
    └── Conjunto 3: Lead Form Abandoners 7d
        → Optimization: Leads
        → Placement: Messenger
        → Creatives: "Continuar de onde parou"
```

### 5.3 Customer Match

**Processo de Upload (semanal via n8n):**

```
Toda segunda-feira, 8h:
1. Query PostgreSQL: leads com scoring ≥30 (ORANGE+RED)
2. Hash emails com SHA-256 (conformidade GDPR/LGPD)
3. Upload para Google Customer Match (via Google Ads API)
4. Upload para Meta Custom Audience (via Marketing API)
5. Criar Lookalike audiences (1%, 3%, 5%) baseado em clientes ativos
6. Log em customer_match_uploads
```

### 5.4 Conversions API (CAPI) do Meta

**Eventos Trackeados:**

```
Eventos enviados via CAPI (Server-Side):
1. trial_start — Quando lead inicia trial de 7 dias
   → Value: 0, Currency: BRL
   → Content: "ZEHLA Trial"

2. pricing_page_view — Quando lead visita página de preços
   → Value: 0, Currency: BRL

3. demo_scheduled — Quando lead agenda demonstração
   → Value: 0, Currency: BRL
   → Content: "Demo Request"

4. subscription_created — Quando lead assina plano pago
   → Value: R$ 397 ou R$ 697, Currency: BRL
   → Content: "ZEHLA Professional" ou "ZEHLA Enterprise"

5. whatsapp_interaction — Quando lead envia mensagem WhatsApp
   → Value: 0, Currency: BRL
   → Custom: "whatsapp_sdr"
```

**Benefícios do CAPI:**
- Tracking server-side não afetado por ad-blockers
- Otimização de campanhas por conversão real (não apenas clique)
- Medição de ROAS mais precisa
- Attribution window extendida

---

## 6. Pipeline de Eventos

### 6.1 Taxonomia de Eventos

Todos os eventos no ecossistema ZEHLA seguem uma taxonomia padronizada:

```
FORMATO: {category}.{object}.{action}

CATEGORIAS:
├── email        — Eventos de email marketing
├── web          — Eventos de interação web
├── whatsapp     — Eventos de WhatsApp
├── trial        — Eventos de trial
├── billing      — Eventos de pagamento
├── scoring      — Eventos de scoring
└── ads          — Eventos de anúncios

OBJETOS:
├── email        — Mensagem de email
├── page         — Página web
├── campaign     — Campanha de marketing
├── contact      — Contato/lead
├── conversation — Conversa WhatsApp
├── trial        — Período de trial
├── subscription — Assinatura
└── ad_creative  — Criativo de anúncio

AÇÕES:
├── sent         — Enviado
├── delivered    — Entregue
├── opened       — Aberto
├── clicked      — Clicado
├── bounced      — Devolvido
├── unsubscribed — Descadastrado
├── viewed       — Visualizado
├── submitted    — Submetido
├── started      — Iniciado
├── completed    — Completado
├── converted    — Converteu
├── abandoned    — Abandonado
├── scored       — Pontuado
├── upgraded     — Migrou de plano
└── churned      — Cancelou

EXEMPLOS:
├── email.campaign.opened
├── email.campaign.clicked
├── email.campaign.bounced
├── email.campaign.unsubscribed
├── web.page.viewed
├── web.form.submitted
├── whatsapp.conversation.started
├── whatsapp.conversation.message_sent
├── trial.period.started
├── trial.period.completed
├── trial.period.abandoned
├── billing.subscription.created
├── billing.subscription.upgraded
├── billing.subscription.churned
├── scoring.lead.scored
└── scoring.lead.cluster_changed
```

### 6.2 JSON Schema de Evento

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "ZehlaEvent",
  "type": "object",
  "required": ["event_id", "event_type", "contact_id", "timestamp", "source"],
  "properties": {
    "event_id": {
      "type": "string",
      "format": "uuid",
      "description": "UUID único do evento"
    },
    "event_type": {
      "type": "string",
      "pattern": "^[a-z]+\\.[a-z]+\\.[a-z]+$",
      "description": "Taxonomia: category.object.action"
    },
    "contact_id": {
      "type": "string",
      "format": "uuid",
      "description": "ID do contato no banco de dados"
    },
    "timestamp": {
      "type": "string",
      "format": "date-time",
      "description": "ISO 8601 timestamp do evento"
    },
    "source": {
      "type": "string",
      "enum": ["resend_webhook", "ga4", "z_api_webhook", "stripe_webhook", "internal", "manual"],
      "description": "Fonte originária do evento"
    },
    "properties": {
      "type": "object",
      "description": "Propriedades específicas do evento (flexível)"
    },
    "context": {
      "type": "object",
      "properties": {
        "utm_source": { "type": ["string", "null"] },
        "utm_medium": { "type": ["string", "null"] },
        "utm_campaign": { "type": ["string", "null"] },
        "utm_content": { "type": ["string", "null"] },
        "utm_term": { "type": ["string", "null"] },
        "ip_address": { "type": ["string", "null"] },
        "user_agent": { "type": ["string", "null"] },
        "page_url": { "type": ["string", "null"] },
        "session_id": { "type": ["string", "null"] }
      }
    },
    "metadata": {
      "type": "object",
      "properties": {
        "processing_stage": {
          "type": "string",
          "enum": ["captured", "normalized", "enriched", "scored", "routed"],
          "description": "Estágio atual no pipeline de 5 estágios"
        },
        "pipeline_version": {
          "type": "string",
          "description": "Versão do pipeline que processou"
        },
        "retry_count": {
          "type": "integer",
          "minimum": 0,
          "default": 0
        },
        "error": {
          "type": ["string", "null"],
          "description": "Mensagem de erro se processamento falhou"
        }
      }
    }
  }
}
```

**Exemplo de Evento Real:**

```json
{
  "event_id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "event_type": "email.campaign.clicked",
  "contact_id": "f8e7d6c5-b4a3-2910-fedc-ba0987654321",
  "timestamp": "2025-01-15T14:32:10.000Z",
  "source": "resend_webhook",
  "properties": {
    "campaign_id": "camp-financial-v3-2025-01",
    "variant": "A",
    "email_subject": "Sua pousada está perdendo R$ 4.200 por mês",
    "click_url": "https://zehla.com.br/financeiro?utm_source=email&utm_campaign=financial_v3&utm_content=variant_a",
    "link_id": "cta_primary"
  },
  "context": {
    "utm_source": "email",
    "utm_medium": "campaign",
    "utm_campaign": "financial_v3",
    "utm_content": "variant_a",
    "utm_term": null,
    "ip_address": "177.71.xxx.xxx",
    "user_agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 17_2 like Mac OS X)",
    "page_url": null,
    "session_id": null
  },
  "metadata": {
    "processing_stage": "scored",
    "pipeline_version": "2.1.0",
    "retry_count": 0,
    "error": null
  }
}
```

### 6.3 Redis + BullMQ: Infraestrutura da Fila

```
REDIS CONFIGURAÇÃO:
├── Host: redis.zehla.internal:6379
├── Memory: 512MB dedicado
├── Max clients: 100
├── Eviction: allkeys-lru
└── Persistence: AOF every 1s

BULLMQ QUEUES:
├── Queue: "events-capture" (Stage 1)
│   ├── Concurrency: 20 workers
│   ├── Priority: 1 (highest)
│   ├── Timeout: 5s per job
│   └── Retry: 3 attempts, exponential backoff
│
├── Queue: "events-normalize" (Stage 2)
│   ├── Concurrency: 10 workers
│   ├── Priority: 2
│   ├── Timeout: 10s per job
│   └── Retry: 3 attempts
│
├── Queue: "events-enrich" (Stage 3)
│   ├── Concurrency: 5 workers
│   ├── Priority: 3
│   ├── Timeout: 15s per job
│   ├── External API calls: IP geolocation
│   └── Retry: 2 attempts
│
├── Queue: "events-score" (Stage 4)
│   ├── Concurrency: 5 workers
│   ├── Priority: 4
│   ├── Timeout: 10s per job
│   └── Retry: 2 attempts
│
├── Queue: "events-route" (Stage 5)
│   ├── Concurrency: 3 workers
│   ├── Priority: 5
│   ├── Timeout: 30s per job
│   ├── External calls: SDR notification, retargeting API
│   └── Retry: 1 attempt
│
└── Queue: "events-dead-letter" (Falhas após todos os retries)
    ├── Manual inspection required
    └── Alert to Slack #events-errors

THROUGHPUT ESPERADO:
- Pico: 500 eventos/minuto (durante campanha de email)
- Média: 50 eventos/minuto
- Latência total: <2s do capture ao route (P95)
```

---

## 7. WhatsApp como Canal Principal

### 7.1 Por Que WhatsApp

Pousadeiros brasileiros usam WhatsApp como ferramenta de trabalho primária. Dados do mercado:

- **95%** dos pousadeiros usam WhatsApp para comunicação com hóspedes
- **60%+** das reservas em pousadas pequenas chegam via WhatsApp
- **88%** dos hoteleiros respondem mais rápido no WhatsApp que email
- Tempo médio de resposta em email: 6 horas. Em WhatsApp: 12 minutos.

O ZEHLA torna o WhatsApp o canal central de todo o funil comercial — prospecção, qualificação, suporte e customer success.

### 7.2 Método SBI (Situation-Behavior-Impact)

Framework utilizado pelos SDRs para qualificação de leads via WhatsApp:

```
S — SITUAÇÃO (Descrever o estado atual do pousadeiro)
   "Vi que sua pousada [NOME] tem [X] quartos em [CIDADE]
    e aparece no Booking.com com [Y] avaliações."

B — BEHAVIOR (Comportamento observado ou inferido)
   "Percebi que você visitou nossa página sobre [tópico],
    o que me leva a entender que [dor específica] é uma prioridade."

I — IMPACTO (Consequência da inação vs. valor da ação)
   "Pousadas similares que implementaram o ZEHLA viram
    [resultado específico] em [tempo]. Sem isso, estimamos
    que você continua perdendo [valor]."

TRANSIÇÃO PARA CTA:
   "O que acha de vermos isso na prática? 15 minutos de
    demonstração, sem compromisso."
```

### 7.3 Typebot — Triagem e Qualificação

**Fluxo de Triagem Completo:**

```
MENSAGEM INICIAL (automática):
"Olá! 👋 Sou o assistente virtual do ZEHLA.
Ajudo pousadas a aumentarem receita e organizarem reservas.

Qual seu nome?"
→ Salva nome no contato

"Prazer, [NOME]! Sou o assistente do ZEHLA.

Para te ajudar melhor, me conta:
🏠 Quantos quartos sua pousada tem?"
→ [1-5] [6-10] [11-20] [21+]
→ Salva no firmographic

"Onde fica sua pousada?"
→ Captura cidade
→ Salva no firmographic

"Qual é o seu MAIOR desafio hoje?"
→ [1] Reservas se perdendo/desorganização
→ [2] Pouca ocupação na baixa temporada
→ [3] Comissões altas do Booking/Airbnb
→ [4] Dificuldade com check-in/check-out
→ [5] Outro
→ Salva dor principal + atualiza scoring

"[NOME], perfeito! Baseado no que você me contou,
o ZEHLA pode te ajudar com [personalizado baseado na dor].

O que você prefere?
📋 Ver uma demonstração rápida (15 min)
📖 Receber material por email
💬 Falar com um especialista agora"
→ Se demo → Agenda via Calendly link
→ Se material → Dispara email automatizado
→ Se especialista → Notifica SDR humano
```

### 7.4 Z-API — Integração Técnica

```
Z-API CONFIGURAÇÃO:
├── Provider: Z-API (z-api.io)
├── Instance: Instância WhatsApp Business conectada
├── Número: +55 XX XXXXX-XXXX (número comercial ZEHLA)
├── Token: API token autenticado
│
├── CAPACIDADES:
│   ├── Envio de mensagens de texto: ✓
│   ├── Envio de imagens: ✓
│   ├── Envio de documentos PDF: ✓
│   ├── Envio de templates (approved): ✓
│   ├── Recebimento de mensagens (webhook): ✓
│   ├── Detecção de áudio/video: ✓
│   ├── Status de mensagem (delivered/read): ✓
│   └── Chatbot API: ✓ (integração com Typebot)
│
├── LIMITES:
│   ├── 100 mensagens/hora (inicial)
│   ├── 5.000 mensagens/dia (Tier 1)
│   └── Rate limit: 30 mensagens/minuto burst
│
├── WEBHOOK CONFIGURAÇÃO:
│   ├── URL: https://api.zehla.com.br/webhooks/whatsapp
│   ├── Events: message.received, message.status, message.delivered
│   ├── Retry: 3 tentativas, exponential backoff
│   └── Timeout: 5s
│
└── SLAs:
    ├── Latência de envio: <3s (P95)
    ├── Latência de webhook: <5s (P95)
    └── Uptime: ≥99.5%
```

### 7.5 SLAs de Atendimento WhatsApp

| Tipo de Mensagem | SLA de Resposta | Responsável |
|---|---|---|
| Lead RED — primeira interação | ≤30 min (8h-18h) | SDR humano |
| Lead ORANGE — triagem | ≤2h | Typebot + SDR |
| Lead BLUE — informação | ≤24h | Typebot |
| Cliente ativo — suporte urgente | ≤15 min | Suporte humano |
| Cliente ativo — suporte normal | ≤4h | Suporte humano |
| Prospects fora horário | Até 8h do dia seguinte | Automático "horário de atendimento" |

---

## 8. Trial de 7 Dias

### 8.1 Estrutura da Experiência

O trial de 7 dias é o coração do PLG. Cada dia é projetado para entregar um "momento de valor" específico, mantendo o trialista engajado e progredindo em direção à conversão.

**Princípios de Design:**
1. **Sem cartão de crédito** — Reduzir atrito ao máximo
2. **Valor no Dia 1** — O trialista deve "sentir" o ZEHLA em <24h
3. **Guided, não self-service** — Cada dia tem objetivo claro e suporte
4. **Stakes crescentes** — Quanto mais o trialista configura, mais perde ao não assinar
5. **Urgência natural** — 7 dias é curto o suficiente para criar urgência

### 8.2 Detalhamento Dia a Dia

```
DIA 0 — ONBOARDING IMEDIATO
═════════════════════════════
Trigger: Lead clica em "Iniciar Trial" na LP

Email (imediato):
  Subject: "Bem-vindo ao ZEHLA! 🎉"
  Body:
    "[NOME], seu trial de 7 dias do ZEHLA começou!

     Seu login: [EMAIL]
     Acesse: https://app.zehla.com.br

     Nos próximos 7 dias, vou te guiar passo a passo.
     Hoje: configure os básicos (15 min).

     → https://app.zehla.com.br/onboarding

     Qualquer dúvida, estou no WhatsApp: [NÚMERO]"

WhatsApp (5 min após):
  "[NOME]! Aqui é a [NOME_SDR] do ZEHLA 👋
   Seu trial de 7 dias está ativado!

   Vou te acompanhar esses 7 dias.
   O primeiro passo é cadastrar seus quartos — leva 5 min.

   Posso te ajudar agora ou prefere começar sozinho?"

Dentro da plataforma:
  - Wizard de 5 passos
  - Vídeo de 60s: "O que você vai conquistar em 7 dias"
  - Chat de suporte embutido (WhatsApp redirect)

KPI: Login ≤2h após ativação | Checklist ≥1/5 completado

---

DIA 1 — PRIMEIRO MOMENTO DE VALOR
══════════════════════════════════
Email (10h):
  Subject: "Dia 1: A inteligência que sua pousada precisa"
  Body:
    "[NOME], agora que seus quartos estão cadastrados,
     o ZEHLA já tem dados suficientes pra te mostrar algo.

     🔍 Insight: Com [X] quartos e diária média de R$ [Y],
     sua receita POTENCIAL é R$ [Z]/mês.
     Hoje você captura apenas [W]%.

     Isso significa R$ [Z-W] em receita deixada na mesa.

     Vá ao dashboard para ver a análise completa:
     → https://app.zehla.com.br/dashboard/insights"

WhatsApp (se sem login em 12h):
  "[NOME], acessou o ZEHLA hoje?
   O dashboard de insights tem uma surpresa sobre
   a receita da [NOME_POUSADA] 👀"

KPI: Login dia 1 | Dashboard visualizado | ≥2/5 checklist

---

DIA 2 — RECOMENDAÇÃO DE PREÇOS
════════════════════════════════
Email (10h):
  Subject: "Seu próximo fim de semana pode render 15% mais"
  Body:
    "Oi [NOME]!

     O ZEHLA analisou a demanda da sua região e encontrou:

     📈 Este final de semana: demanda [+]15% acima da média
     💡 Recomendação: ajustar diária de R$ [X] → R$ [Y]

     Se todos os quartos forem vendidos no novo preço,
     você ganha R$ [Z] a mais. Só neste fim de semana.

     Veja a recomendação completa no ZEHLA:
     → https://app.zehla.com.br/pricing/recommendations"

KPI: Feature de precificação usada | Recomendação visualizada

---

DIA 3 — WHATSAPP INTEGRAÇÃO
═════════════════════════════
Email (10h):
  Subject: "Reservas pelo WhatsApp? Isso existe 😄"
  Body:
    "[NOME], hoje é o dia de conectar seu WhatsApp ao ZEHLA.

     Quando conectado, hóspedes podem:
     ✅ Ver disponibilidade em tempo real
     ✅ Fazer reserva direta (sem comissão!)
     ✅ Receber confirmação automática
     ✅ Fazer check-in digital

     Passo a passo (3 minutos):
     1. Acesse Configurações → Canais → WhatsApp
     2. Escaneie o QR Code com seu WhatsApp Business
     3. Pronto! Teste enviando 'Quartos disponíveis'

     → https://app.zehla.com.br/settings/channels/whatsapp"

WhatsApp (se WhatsApp conectado):
  "🎉 Conectado! Agora teste: envie 'reservar' para seu
   número do ZEHLA. Funciona assim."

WhatsApp (se NÃO conectado até 18h):
  "[NOME], a conexão do WhatsApp é o passo mais importante.
   Posso te ajudar? Responda 'SIM' que eu te guio."

KPI: WhatsApp conectado | 1 reserva teste recebida

---

DIA 4 — PROVA SOCIAL + CASE STUDY
══════════════════════════════════
Email (10h):
  Subject: "Como a Pousada [SIMILAR_DA_REGIÃO] aumentou 35% a ocupação"
  Body:
    "Oi [NOME],

     Conheça a Pousada Sol e Lua, em [CIDADE_SIMILAR].
     [NOME_PROPRIETÁRIO] tinha os mesmos desafios que você:
     - 40% ocupação na baixa
     - Reservas perdidas no WhatsApp
     - Comissões de R$ 3.000/mês no Booking

     Em 60 dias com ZEHLA:
     ✅ Ocupação subiu para 62%
     ✅ 25% das reservas vieram pelo WhatsApp direto
     ✅ Economia de R$ 2.800/mês em comissões

     [Citação direta do proprietário]

     Leia o case completo:
     → [LINK CASE STUDY]"

KPI: Case study visualizado | Engajamento >3 min

---

DIA 5 — CHECK-IN DO PROGRESSO
═══════════════════════════════
Email (10h):
  Subject: "Você está indo bem! Veja seu progresso ✅"
  Body:
    "[NOME], dia 5 de 7! Olha o que você já conquistou:

     ✅ Quartos cadastrados
     ✅ Precificação dinâmica ativa
     ✅ [Feature usada]
     ⬜ WhatsApp conectado [ou ✅]
     ⬜ Primeira reserva direta [ou ✅]

     Seu Score de Ativação: [X]% (meta: 80%)

     [Se score <70%:]
     Parece que deu uma travada. Posso te ajudar
     a configurar o que falta? Responda este email.

     [Se score ≥70%:]
     Excelente! Você já está vendo resultados.
     Continue explorando — amanhã tem mais."

Dentro da plataforma:
  - Relatório de progresso visual
  - Badges de conquista desbloqueados
  - Próximo passo sugerido baseado no que falta

KPI: Score de ativação ≥70% | ≥4/5 checklist

---

DIA 6 — URGÊNCIA + FEAR OF MISSING OUT
══════════════════════════════════════
Email (10h):
  Subject: "Seu trial acaba amanhã — não perca o que construiu"
  Body:
    "[NOME],

     Só mais 1 dia de trial. Tudo que você configurou —
     quartos, preços, calendário — está funcionando agora.

     Se não assinar, em 24h:
     ❌ Recomendações de preço param
     ❌ WhatsApp desconectado
     ❌ Dashboard de insights inativo
     ❌ Reservas automáticas pausadas

     Não deixe a [NOME_POUSADA] voltar ao caos.

     Planos disponíveis:
     🟢 Starter (≤5 quartos) — R$ 197/mês
     🔵 Professional (6-15 quartos) — R$ 397/mês
     🟣 Enterprise (15+ quartos) — R$ 697/mês

     → https://app.zehla.com.br/upgrade

     Garantia: 30 dias ou seu dinheiro de volta."

WhatsApp (18h):
  "[NOME], amanhã seu trial encerra.
   Mas se assinar hoje, o preço fica fixo por 12 meses
   (mesmo com ajustes futuros).

   Quer que eu te ajude a escolher o melhor plano?"

KPI: Login dia 6 | Visualização de planos | Clique em CTA upgrade

---

DIA 7 — CONVERSÃO FINAL
═══════════════════════
Email (8h):
  Subject: "Seu trial terminou. Continue com o ZEHLA 🚀"
  Body:
    "[NOME],

     Seus 7 dias de trial do ZEHLA terminaram.

     Aqui está o resumo do que você conquistou:
     📊 [X] quartos configurados
     💰 [Y] recomendações de preço geradas
     📅 [Z] dias de calendário organizado
     💬 [W] interações pelo WhatsApp

     Para continuar usando tudo isso (e muito mais):
     → Assinar Professional (R$ 397/mês)
     → https://app.zehla.com.br/upgrade

     Ou me chama no WhatsApp — posso te ajudar
     a escolher o plano ideal para a [NOME_POUSADA]."

WhatsApp (se não converteu até 12h):
  "[NOME], seu trial acabou, mas quero que saiba que:
   1. Tudo que você configurou está salvo por 30 dias
   2. Você pode reativar a qualquer momento
   3. Posso estender o trial por +3 dias se quiser ver mais

   O que acha?"

KPI: Conversão trial → pago | Se não converteu: re-engajamento agendado
```

### 8.3 Métricas de Stagnação — Detalhamento Técnico

```
STAGNATION ENGINE (executa a cada 6h):

Query:
  SELECT trial_id, contact_id, last_login, actions_count,
         checklist_progress, activation_score
  FROM trials
  WHERE status = 'active'
    AND trial_start_date <= NOW() - INTERVAL '24 hours'

Regras:

SE (NOW() - last_login) > 48h E checklist_progress < 2/5:
  → STAGNATION LEVEL 2
  → Ação: Notificar SDR → SDR contacta via WhatsApp em <1h
  → Tag: "trial_stagnation_manual_rescue"

SE (NOW() - last_login) > 24h E checklist_progress < 1/5:
  → STAGNATION LEVEL 1
  → Ação: Email + WhatsApp automático com dica rápida
  → Tag: "trial_stagnation_auto_nudge"

SE (actions_count_last_24h) == 0 E (NOW() - last_login) > 12h:
  → STAGNATION WARNING
  → Ação: WhatsApp automático "Está tudo bem? Posso ajudar?"
  → Tag: "trial_stagnation_warning"

SE (NOW() - last_login) > 72h:
  → STAGNATION LEVEL 3
  → Ação: Email de re-engajamento + oferta de restart
  → Tag: "trial_stagnation_critical"
```

---

## 9. Preços e Receita

### 9.1 Estrutura de Preços

| Plano | Quartos | Preço Mensal | Preço Trimestral | Preço Anual | Público-Alvo |
|---|---|---|---|---|---|
| **Free** | ≤3 | R$ 0 | — | — | Micro pousadas, entrada |
| **Trial** | Todos | R$ 0 | — | — | Avaliação (7 dias) |
| **Starter** | ≤5 | R$ 197 | R$ 561 (5% off) | R$ 2.124 (10% off) | Micro pousadas |
| **Professional** | 6-15 | R$ 397 | R$ 1.131 (5% off) | R$ 4.284 (10% off) | Pousadas médias (ICP) |
| **Enterprise** | 15+ | R$ 697 | R$ 1.986 (5% off) | R$ 7.524 (10% off) | Hotéis boutique |

### 9.2 Matriz de Features

| Feature | Free | Starter | Professional | Enterprise |
|---|---|---|---|---|
| **Gestão de Quartos** | 3 quartos | 5 quartos | 15 quartos | Ilimitado |
| **Calendário de Reservas** | Básico | Completo | Completo | Multi-propriedade |
| **Reservas via WhatsApp** | ❌ | ✅ (50/mês) | ✅ (200/mês) | ✅ (Ilimitado) |
| **Check-in Digital** | ❌ | QR Code | QR Code + App Hóspede | App Personalizado |
| **Channel Manager** | ❌ | Booking.com | Booking + Airbnb + Expedia | Todos os canais |
| **Precificação Dinâmica** | Manual | 3 sugestões/dia | Ilimitado + ML | IA Avançada |
| **Dashboard Analytics** | Básico | Intermediário | Avançado | Custom + API |
| **Campanhas Automáticas** | ❌ | Email | Email + WhatsApp | Multi-canal |
| **Follow-up Hóspedes** | ❌ | Pós-check-out | Pós-check-out + Pré-estada | Ciclo completo |
| **Relatórios** | 1/mês | 5/mês | Ilimitados | Custom |
| **Suporte** | Community | Email (48h) | WhatsApp (4h) | WhatsApp (1h) + Gerente |
| **Onboarding** | Self-service | Guiado | Assisted (SDR) | White-glove |
| **Integrações** | Nenhuma | 3 | 10+ | API completa |
| **SLA de Uptime** | Best effort | 99% | 99.5% | 99.9% |
| **Faturamento/Financeiro** | ❌ | Básico | Notas + DAS | Contábil completo |

### 9.3 Projeção de Receita (12 Meses)

```
MÊS 1-3: Lançamento e Tração
├── Clientes Free: 20 → 50
├── Clientes Starter: 5 → 15
├── Clientes Professional: 2 → 10
├── Clientes Enterprise: 0 → 2
├── MRR: R$ 3.000 → R$ 12.000
└── Conversão total: ~27 clientes pagos

MÊS 4-6: Escala do Funil
├── Clientes Free: 50 → 150
├── Clientes Starter: 15 → 40
├── Clientes Professional: 10 → 50
├── Clientes Enterprise: 2 → 8
├── MRR: R$ 12.000 → R$ 45.000
└── Conversão total: ~98 clientes pagos

MÊS 7-9: Otimização e Upsell
├── Clientes Free: 150 → 300
├── Clientes Starter: 40 → 60
├── Clientes Professional: 50 → 120
├── Clientes Enterprise: 8 → 20
├── MRR: R$ 45.000 → R$ 95.000
└── Conversão total: ~200 clientes pagos

MÊS 10-12: Maturidade
├── Clientes Free: 300 → 500
├── Clientes Starter: 60 → 80
├── Clientes Professional: 120 → 180
├── Clientes Enterprise: 20 → 40
├── MRR: R$ 95.000 → R$ 155.000
└── Conversão total: ~300 clientes pagos
├── ARPU: R$ 517 (mix de planos)
└── ARR: R$ 1.860.000
```

### 9.4 Estratégia de Receita

**Upgrade Path:**
```
Free → Starter: "Você preencheu 3 quartos.
                 Faça upgrade para ter até 5 quartos + reservas WhatsApp."
Starter → Professional: "Você atingiu 200 reservas/mês pelo WhatsApp.
                           Upgrade para precificação dinâmica ilimitada."
Professional → Enterprise: "Com 16+ quartos, o Enterprise dá acesso a
                            múltiplas propriedades + API completa."
```

**Redução de Churn:**
- Promoção de fidelidade: 10% desconto no plano anual
- Mês de cortesia por indicação que converte (1 mês free)
- Win-back: 30 dias após cancelamento, oferta de 2 meses a 50%
- Feature lock: dados salvos por 90 dias após cancelamento (perda aversiva)

---

## 10. Equipe Comercial

### 10.1 Estrutura

```
EQUIPE COMERCIAL (Fase 1 — Mês 1-6)

CEO/Founder
├── Head Comercial (Founder até Mês 6, hire depois)
│   ├── 2 SDRs (Sales Development Representatives)
│   └── 1 Closer (Account Executive)
│
├── Marketing (1 pessoa)
│   ├── Email marketing e automações
│   ├── Google/Meta Ads
│   └── Conteúdo
│
└── Customer Success (1 pessoa)
    ├── Onboarding de novos clientes
    ├── Suporte WhatsApp
    └── Retenção e upsell

TOTAL: 5 pessoas (incluindo founder)
```

### 10.2 Modelo de Compensação — SDRs (70/30)

```
COMPOSIÇÃO DO SALÁRIO SDR:
├── Salário Base (Fixo): 70% do OTE (On-Target Earnings)
│   └── OTE = R$ 4.000/mês
│   └── Fixo = R$ 2.800/mês
│
└── Variável (Comissão): 30% do OTE
    └── Meta variável = R$ 1.200/mês
    └── Métrica: SQLs gerados (Sales Qualified Leads)

BÔNUS POR PERFORMANCE:
├── ≥ 8 SQLs/mês: 100% do variável (R$ 1.200)
├── ≥ 12 SQLs/mês: 120% do variável (R$ 1.440)
├── ≥ 16 SQLs/mês: 150% do variável (R$ 1.800)
├── ≥ 20 SQLs/mês: 200% do variável (R$ 2.400)
└── < 5 SQLs/mês: PIP (Performance Improvement Plan)
```

**KPIs dos SDRs:**

| KPI | Meta Diária | Meta Semanal | Meta Mensal |
|---|---|---|---|
| Conversas iniciadas (WhatsApp) | ≥5 | ≥25 | ≥100 |
| Respostas recebidas | ≥3 | ≥15 | ≥60 |
| Agendamentos de demo | ≥1 | ≥5 | ≥20 |
| SQLs qualificados | — | ≥2 | ≥8 |
| Taxa de resposta (conversa iniciada → resposta) | ≥60% | — | — |
| Taxa de agendamento (resposta → demo) | ≥30% | — | — |
| Tempo primeira resposta a RED lead | ≤30min | — | — |

### 10.3 Modelo de Compensação — Closers (10% Comm)

```
COMPOSIÇÃO DO SALÁRIO CLOSER:
├── Salário Base (Fixo): 90% do OTE
│   └── OTE = R$ 6.000/mês
│   └── Fixo = R$ 5.400/mês
│
└── Variável (Comissão): 10% do OTE + % sobre vendas
    └── Meta variável = R$ 600/mês (base) + comissão sobre ARPU
    └── Comissão: 10% do primeiro mês de MRR gerado

EXEMPLO DE COMISSÃO:
├── Vendeu Professional (R$ 397/mês): comissão = R$ 39,70
├── Vendeu Enterprise (R$ 697/mês): comissão = R$ 69,70
├── Se fechou 20 clientes em um mês:
│   → 15 Professional × R$ 39,70 = R$ 595,50
│   → 5 Enterprise × R$ 69,70 = R$ 348,50
│   → Total comissão = R$ 944,00
│   → Salário total = R$ 5.400 + R$ 600 + R$ 944 = R$ 6.944

BÔNUS POR META:
├── ≥ 15 novos MRR/mês: 100% do bônus base
├── ≥ 25 novos MRR/mês: 150% do bônus base
├── ≥ 40 novos MRR/mês: 200% do bônus base
└── Close rate ≥ 40%: +R$ 200 bônus extra
```

**KPIs dos Closers:**

| KPI | Meta Semanal | Meta Mensal |
|---|---|---|
| Demos realizadas | ≥8 | ≥32 |
| Fechamentos (new MRR) | ≥4 | ≥15 |
| Close rate (demo → closed) | ≥35% | — |
| MRR gerado | ≥R$ 3.000 | ≥R$ 12.000 |
| Tempo demo → close | ≤48h | — |
| Show rate (agendado → compareceu) | ≥75% | — |

### 10.4 KPIs da Equipe como um Todo

| KPI | Meta | Avaliação |
|---|---|---|
| CAC médio | ≤R$ 200 | Marketing + Vendas |
| CAC payback | ≤15 dias | Financeiro |
| Velocity (lead → MRR) | ≤14 dias | Pipeline |
| Ramp time (novo SDR produtivo) | ≤30 dias | Treinamento |
| Quota attainment (média equipe) | ≥80% | Performance |
| Employee NPS | ≥70 | Cultura |

---

## 11. Stack Tecnológica

### 11.1 Tabela Completa de Ferramentas

| Categoria | Ferramenta | Uso no ZEHLA | Plano | Custo Mensal |
|---|---|---|---|---|
| **Email Sending** | Resend | Envio de emails transacionais e marketing | Pro | R$ 250 |
| **WhatsApp API** | Z-API | Conexão WhatsApp Business, envio/recebimento de mensagens | Enterprise | R$ 500 |
| **CRM** | HubSpot Free | Gestão de contatos, pipeline de vendas, notes | Free | R$ 0 |
| **Analytics Web** | GA4 + Fathom | GA4 para ads, Fathom para analytics privacy-first | Free + Solo | R$ 0 |
| **Pagamentos** | Stripe | Assinaturas recorrentes, trials, internacional | Standard | 2.9% + $0.30 |
| **Pagamentos BR** | Asaas | Boleto, Pix (para clientes sem cartão), NF | Empresa | R$ 99 |
| **Automação** | n8n (self-hosted) | Orquestração de workflows, webhooks, scoring pipeline | Self-hosted | R$ 0 (infra) |
| **Chatbot WhatsApp** | Typebot | Triagem de leads, qualificação, FAQ automático | Cloud | R$ 150 |
| **Dashboards** | Metabase (self-hosted) | Dashboards de KPIs, análise de funil | Self-hosted | R$ 0 (infra) |
| **Hospedagem Web** | Vercel | Landing pages (Next.js), API routes | Pro | R$ 100 |
| **Banco de Dados** | PostgreSQL (Supabase) | Banco principal de todos os dados comerciais | Pro | R$ 125 |
| **Cache/Filas** | Redis + BullMQ | Fila de eventos, cache de scoring, rate limiting | Upstash | R$ 50 |
| **Tag Manager** | Google Tag Manager | Disparo de pixels, tracking UTM, CAPI | Free | R$ 0 |
| **Email Validation** | NeverBounce | Validação de emails da base (mensal) | Pay-per-use | R$ 80 |
| **Agendamento** | Calendly | Agendamento de demos (integrado ao Typebot) | Standard | R$ 80 |
| **Comunicação Interna** | Slack | Alertas de pipeline, notificações de SDRs | Pro | R$ 50 |
| **Documentação** | Notion | Playbooks SDR, scripts, base de conhecimento | Team | R$ 100 |
| **DNS/Email Warmup** | Mailgun + Lemwarm | Domínio de envio + warmup de IPs | Basic | R$ 50 |

**Custo Total da Stack: ~R$ 1.634/mês**

### 11.2 Arquitetura de Integrações

```
                    ┌─────────────┐
                    │   CONTATOS   │
                    │ (PostgreSQL) │
                    └──────┬──────┘
                           │
        ┌──────────────────┼──────────────────┐
        │                  │                    │
   ┌────▼────┐        ┌────▼────┐        ┌────▼────┐
   │  RESEND  │        │  Z-API  │        │ STRIPE  │
   │ (Emails) │        │(WhatsApp)│        │(Pagto)  │
   └────┬────┘        └────┬────┘        └────┬────┘
        │                  │                    │
        └──────────┐  ┌────┘                    │
                   │  │                         │
              ┌────▼──▼────┐               ┌────▼────┐
              │    n8n     │               │  Asaas  │
              │(Orquest.)  │               │(Pix/Bole)│
              └────┬───────┘               └────┬────┘
                   │                            │
     ┌─────────────┼─────────────┐              │
     │             │             │              │
┌────▼────┐  ┌────▼────┐  ┌─────▼───┐    ┌─────▼────┐
│ TYPEBOT │  │  GA4    │  │ GOOGLE  │    │ METABASE │
│ (Triagem)│  │(Analytics)│  │  ADS   │    │(Dashbds)│
└────┬────┘  └────┬────┘  └────┬────┘    └──────────┘
     │            │            │
     └────────────┼────────────┘
                  │
           ┌──────▼──────┐
           │  LANDING PG │
           │  (Next.js)  │
           └─────────────┘
```

---

## 12. CRM Pipeline — 13 Estágios

### 12.1 Definição dos Estágios

```
PIPELINE ZEHLA (HubSpot CRM)

1.  🌱 SEED
    → Contato importado para base (sem interação)
    → Critério: email validado + na base de 10.000
    → Ação: atribuir a cohort (Financial/Operational/Occupancy)

2.  📬 CONTACTED
    → Primeiro email enviado + delivery confirmada
    → Critério: email_delivered = true para este contato
    → Ação: aguardar evento de open/click

3.  👁️ ENGAGED
    → Abriu ou clicou em pelo menos 1 email
    → Critério: email.opened OU email.clicked ≥1
    → Ação: scoring inicia, retargeting pixel disparado

4.  🟡 WARM
    → Engajamento repetido + score ≥40
    → Critério: score_total ≥40 E ≥2 eventos engagement
    → Ação: adicionar ao retargeting, intensificar emails

5.  🔵 COOL/COLD
    → Engajamento inicial mas sem continuidade (score decay)
    → Critério: foi WARM mas score caiu <40 nos últimos 14 dias
    → Ação: re-engajamento com oferta diferente

6.  🔴 HOT
    → Alta intenção de compra (score ≥120)
    → Critério: cluster = RED
    → Ação: SDR contacta em ≤30min via WhatsApp

7.  🤝 SDR QUALIFIED
    → SDR teve conversa e validou fit
    → Critério: conversa ≥3 mensagens + pousadeiro confirmou interesse
    → Ação: agendar demo com Closer

8.  ✅ SQL (Sales Qualified Lead)
    → Qualificado para fechamento, demo agendada
    → Critério: demo agendada no calendário
    → Ação: preparar demo personalizada

9.  🧪 TRIAL
    → Iniciou trial de 7 dias
    → Critério: trial_started = true
    → Ação: guidar por experiência de 7 dias

10. 💬 NEGOTIATION
    → Pós-trial, em conversação sobre preço/plano
    → Critério: trial ended OU Closer em negociação
    → Ação: tratar objeções, oferecer condições

11. ✍️ PROPOSAL SENT
    → Proposta comercial enviada
    → Critério: proposta com preços e condições enviada
    → Ação: follow-up em 24h

12. 🎉 CLOSED WON
    → Assinatura realizada, pagamento confirmado
    → Critério: subscription_created = true
    → Ação: transferir para Customer Success

13. ❌ CLOSED LOST
    → Não converteu (por agora)
    → Critério: explicitamente recusou OU sem resposta por 90 dias
    → Ação: arquivar + re-engajamento em 6 meses
```

### 12.2 SLAs por Estágio

| Estágio | Tempo Máximo no Estágio | Escalação |
|---|---|---|
| Seed → Contacted | 7 dias (primeiro email) | Auto |
| Contacted → Engaged | 14 dias | Auto |
| Engaged → Warm/Cool | 7 dias | Auto |
| Warm → Hot | 14 dias | Auto |
| Hot → SDR Qualified | 24h | SDR SLA |
| SDR Qualified → SQL | 48h | SDR SLA |
| SQL → Trial | 7 dias | Closer SLA |
| Trial → Negotiation | 7 dias (duração trial) | Auto |
| Negotiation → Proposal | 48h | Closer SLA |
| Proposal → Closed | 7 dias | Closer SLA |

### 12.3 Probabilidades de Conversão por Estágio

```
Seed (10.000) → Contacted (9.800) — 98% (delivery)
Contacted → Engaged (3.430) — 35% (open/click)
Engaged → Warm (1.029) — 30% (repeat engagement)
Warm → Hot (412) — 40% (score threshold)
Hot → SDR Qualified (247) — 60% (SDR conversation)
SDR Qualified → SQL (173) — 70% (demo booked)
SQL → Trial (121) — 70% (trial started)
Trial → Negotiation (73) — 60% (trial → negotiation)
Negotiation → Closed Won (51) — 70% (closing)
Closed Won → Retained (45) — 88% (month 1 retention)

TAXA GERAL: Seed → Closed Won = 0,45%
COM 10.000 CONTATOS = 45 CLIENTES POR CICLO
```

---

## 13. KPIs de Sucesso

### 13.1 KPIs de Funil

| KPI | Fórmula | Meta | Frequência |
|---|---|---|---|
| Funnel Conversion Rate | Closed Won / Seed | ≥0,45% | Mensal |
| Velocity (Lead → MRR) | Tempo médio Seed → Closed Won | ≤21 dias | Mensal |
| Stage Conversion Rate | Exitos do estágio / Entradas | Varia por estágio | Semanal |
| Pipeline Value | Sum (valor × probabilidade) de todos os deals ativos | ≥R$ 50.000 | Semanal |
| Pipeline Coverage | Pipeline Value / Target MRR | ≥3x | Mensal |
| Lead Response Time | Tempo primeiro contato após evento RED | ≤30 min | Diário |
| Trial Activation Rate | Trials com ≥70% score ativação / Total trials | ≥70% | Semanal |
| Trial Conversion Rate | Trials convertidos / Trials iniciados | ≥25% | Semanal |

### 13.2 KPIs Financeiros

| KPI | Fórmula | Meta | Frequência |
|---|---|---|---|
| CAC (Customer Acquisition Cost) | Custo total marketing+vendas / Novos clientes | ≤R$ 200 | Mensal |
| CAC por Canal | Custo canal / Clientes do canal | Varia | Mensal |
| LTV (Lifetime Value) | ARPU × (1/churn mensal) | ≥R$ 6.000 | Trimestral |
| LTV:CAC Ratio | LTV / CAC | ≥30:1 | Trimestral |
| Payback Period | CAC / (ARPU × margem) | ≤15 dias | Mensal |
| MRR (Monthly Recurring Revenue) | Sum de todas assinaturas ativas | Ver roadmap | Diário |
| MRR Growth Rate | (MRR atual - MRR mês anterior) / MRR anterior | ≥15% | Mensal |
| ARR (Annual Recurring Revenue) | MRR × 12 | Ver roadmap | Mensal |
| Churn Rate | Clientes perdidos / Clientes totais | ≤5% mensal | Mensal |
| Net Revenue Retention | (MRR início + expansion - contraction - churn) / MRR início | ≥100% | Trimestral |
| Gross Margin | (Receita - Custo serviços) / Receita | ≥80% | Mensal |
| Burn Rate | Despesas operacionais / Mês | Ver roadmap | Mensal |
| Runway | Caixa / Burn Rate | ≥12 meses | Mensal |

### 13.3 KPIs de Equipe

| KPI | Para | Meta | Frequência |
|---|---|---|---|
| Conversas por SDR/dia | SDR | ≥5 | Diário |
| SQLs por SDR/semana | SDR | ≥2 | Semanal |
| Agendamentos por conversa | SDR | ≥20% | Semanal |
| Close Rate | Closer | ≥35% | Semanal |
| Demos realizadas/semana | Closer | ≥8 | Semanal |
| MRR gerado/semana | Closer | ≥R$ 3.000 | Semanal |
| Show Rate | Closer | ≥75% | Semanal |
| Time to Productivity (novo hire) | Manager | ≤30 dias | Por admissão |
| Ramp Revenue (novo SDR 30 dias) | Manager | ≥1 SQL/semana | Por admissão |
| Employee NPS | Todos | ≥70 | Trimestral |

### 13.4 KPIs de Sistema

| KPI | Meta | Alerta | Frequência |
|---|---|---|---|
| Pipeline Event Throughput | ≥50 events/min (P95) | <20 events/min | Real-time |
| Event Processing Latency | <2s (P95) | >5s | Real-time |
| Lead Score Update Latency | <5s após evento | >30s | Real-time |
| WhatsApp Response Latency | <3s envio (P95) | >10s | Real-time |
| Email Delivery Rate | ≥98% | <95% | Diário |
| Email Open Rate | ≥35% | <25% | Semanal |
| Landing Page Load Time | <2s | >4s | Diário |
| System Uptime | ≥99.5% | <99% | Mensal |
| Dead Letter Queue Size | 0 | >10 | Diário |
| Scoring Model AUC | ≥0.75 | <0.65 | Mensal |

---

## 14. Roadmap — 12 Semanas (3 Sprints)

### Sprint 1: Fundação (Semanas 1-4)

**Objetivo:** Construir a infraestrutura base do sistema comercial — banco de dados, pipeline de eventos, email marketing inicial, e CRM configurado.

```
SEMANA 1: Infraestrutura
├── ☐ Setup PostgreSQL (supabase) com schema comercial completo
├── ☐ Setup Redis + BullMQ para fila de eventos
├── ☐ Setup n8n com workflows base (email triggers, webhooks)
├── ☐ Setup Resend com domínio de envio configurado + DKIM/SPF
├── ☐ Setup Z-API com instância WhatsApp conectada
├── ☐ Setup GA4 + GTM na landing page
├── ☐ Setup HubSpot Free com pipeline de 13 estágios
└── ☐ Setup Fathom Analytics (privacy-first)

SEMANA 2: Base de Contatos + Email Marketing
├── ☐ Importar 10.000 contatos no PostgreSQL (clean + validate)
├── ☐ Segmentar em 3 cohorts (Financial, Operational, Occupancy)
├── ☐ Criar 9 emails (3 cohorts × 3 variants)
├── ☐ Configurar workflow n8n: envio sequencial terça/quinta/sábado
├── ☐ Implementar webhooks Resend → n8n (opens, clicks, bounces)
├── ☐ Implementar landing page dinâmica (Next.js + SSR)
└── ☐ Setup NeverBounce para validação mensal

SEMANA 3: Lead Scoring + Pipeline de Eventos
├── ☐ Implementar pipeline de 5 estágios (capture → route)
├── ☐ Implementar modelo de scoring 18 dimensões
├── ☐ Implementar classificação RED/ORANGE/BLUE
├── ☐ Conectar eventos de email ao scoring engine
├── ☐ Implementar dashboards Metabase (funil + scoring)
├── ☐ Criar alertas automáticos (Slack) para leads RED
└── ☐ Documentar esquema de banco de dados

SEMANA 4: WhatsApp + Typebot
├── ☐ Implementar Typebot com fluxo de triagem
├── ☐ Conectar Z-API ao Typebot (bidirecional)
├── ☐ Implementar scripts SDR (SBI method) no HubSpot
├── ☐ Configurar SLAs de resposta automática
├── ☐ Primeiro envio de cohort (500 emails, teste A/B)
├── ☐ Coletar métricas baseline (open rate, click rate)
└── ☐ Review Sprint 1 + retrospectiva

ENTREGÁVEIS DO SPRINT 1:
✅ Infraestrutura completa operacional
✅ 10.000 contatos importados e segmentados
✅ 9 emails criados e testados
✅ Pipeline de eventos funcionando
✅ Lead scoring operacional
✅ WhatsApp triagem via Typebot
✅ Primeiros métricas coletadas
```

### Sprint 2: Ativação (Semanas 5-8)

**Objetivo:** Ativar o funil completo — retargeting pago, trial de 7 dias, equipe SDR operacional, e ciclo de vendas funcionando.

```
SEMANA 5: Google + Meta Ads
├── ☐ Setup conta Google Ads (Search RLSA + Display + YouTube)
├── ☐ Setup conta Meta Ads (Retargeting + Lookalike)
├── ☐ Implementar Customer Match (upload semanal via n8n)
├── ☐ Implementar Conversions API do Meta (server-side)
├── ☐ Criar 10 criativos Meta (carrossel + vídeo + image)
├── ☐ Criar 5 copy groups Google Ads
├── ☐ Implementar tracking de offline conversions (WhatsApp → GA4)
└── ☐ Budget: R$ 50-90/dia (Google + Meta)

SEMANA 6: Trial de 7 Dias
├── ☐ Implementar experiência de 7 dias na plataforma ZEHLA
├── ☐ Implementar checklist de ativação (5 passos)
├── ☐ Criar sequência de 7 emails de onboarding
├── ☐ Criar 7 templates de WhatsApp de onboarding
├── ☐ Implementar stagnation detection engine
├── ☐ Implementar paywall e página de upgrade
└── ☐ Criar páginas de comparação de planos

SEMANA 7: Equipe SDR + Closing
├── ☐ Contratar 2 SDRs + 1 Closer (se não já existentes)
├── ☐ Treinamento: método SBI, scripts, CRM, SLAs
├── ☐ Implementar sistema de métricas por SDR (dashboard)
├── ☐ Criar playbooks: objeções, follow-ups, break-up
├── ☐ Configurar Calendly para agendamento de demos
├── ☐ Implementar roteamento automático (RED → SDR via Slack)
└── ☐ Primeira demo de teste ( Closer + founder)

SEMANA 8: Otimização Inicial
├── ☐ Analisar 4 semanas de dados (primeiro cohort completo)
├── ☐ Ajustar pesos do scoring baseado em conversões reais
├── ☐ Ajustar copy de emails (A/B test winners vs losers)
├── ☐ Otimizar Google Ads (bids, keywords, negatives)
├── ☐ Otimizar Meta Ads (audiences, placements, creatives)
├── ☐ Calcular CAC real por canal
└── ☐ Review Sprint 2 + retrospectiva

ENTREGÁVEIS DO SPRINT 2:
✅ Google + Meta Ads operacionais
✅ Trial de 7 dias funcionando
✅ Equipe SDR treinada e operacional
✅ Primeiras demos e fechamentos
✅ CAC real calculado por canal
✅ Primeiras otimizações baseadas em dados
```

### Sprint 3: Escala (Semanas 9-12)

**Objetivo:** Otimizar para eficiência, escalar volume, e estabelecer processos repeatáveis para crescimento contínuo.

```
SEMANA 9: Escala de Volume
├── ☐ Aumentar email volume: 1.500 → 2.500/semana
├── ☐ Aumentar ad spend: R$ 50-90 → R$ 100-150/dia
├── ☐ Ativar segunda onda de cohorts (contatos inativos re-engajados)
├── ☐ Implementar automação de follow-up pós-demo (n8n)
├── ☐ Implementar win-back flow para trials não convertidos
├── ☐ Implementar referral program (indicação de clientes)
└── ☐ Criar 5 novas variantes de email (baseado em learnings)

SEMANA 10: Customer Success + Retenção
├── ☐ Implementar onboarding pós-venda (30 dias)
├── ☐ Implementar health scoring de clientes (churn prediction)
├── ☐ Criar playbook de retenção (contatos preventivos)
├── ☐ Implementar upsell automation (Starter → Professional)
├── ☐ Criar NPS survey automatizado (dia 30 pós-adesão)
├── ☐ Implementar feature de "resumo mensal" por WhatsApp
└── ☐ Primeiro ciclo de win-back (churned Mês 1)

SEMANA 11: Advanced Analytics + ML
├── ☐ Implementar attribution modeling (multi-touch)
├── ☐ Implementar predictive scoring (ML: probabilidade de conversão)
├── ☐ Implementar churn prediction para clientes ativos
├── ☐ Dashboard executivo (CEO view: MRR, pipeline, team)
├── ☐ Dashboard operacional (SDR: leads, SLAs, queue)
├── ☐ Implementar alertas preditivos (lead likely to churn do trial)
└── ☐ A/B test: trial 7 dias vs 14 dias (100 leads cada)

SEMANA 12: Documentação + Handoff
├── ☐ Documentar todos os processos comerciais (playbook completo)
├── ☐ Documentar arquitetura técnica (diagramas + schemas)
├── ☐ Criar runbooks para operação diária
├── ☐ Criar checklist de launch review
├── ☐ Definir roadmap meses 4-6 (próximas melhorias)
├── ☐ Review Sprint 3 + retrospectiva final
├── ☐ Apresentação de resultados ao time/conselho
└── ☐ Celebrar! 🎉

ENTREGÁVEIS DO SPRINT 3:
✅ Volume escalado (2.500 emails/semana + ads otimizados)
✅ Customer Success operacional
✅ Analytics avançado (attribution + predictive)
✅ Documentação completa
✅ Roadmap M4-6 definido
✅ Processos repeatáveis estabelecidos
```

---

## 15. Mapeamento para Banco de Dados

### 15.1 Entidades Comerciais → Tabelas

```
ENTIDADES PRIMÁRIAS:
├── contacts → contacts
├── email_campaigns → email_campaigns + email_variants + email_sends + email_events
├── scoring → lead_scores + lead_score_dimensions + lead_clusters
├── events → event_queue + event_processed + event_routing_log
├── whatsapp → whatsapp_conversations + whatsapp_messages + whatsapp_triage_results
├── landing_pages → landing_page_variants + landing_page_views + landing_page_conversions
├── trials → trials + trial_daily_engagement + trial_checklist_progress
├── demos → demos + demo_outcomes + objection_log
├── billing → payment_intents + subscriptions
├── ads → ad_campaigns + ad_creatives + ad_audiences + ad_performance_daily
├── team → sdr_activities + sdr_performance_daily + closing_attempts
└── optimization → optimization_experiments + funnel_snapshots + kpi_history
```

### 15.2 Novas Tabelas Necessárias

As tabelas abaixo não existem no schema PostgreSQL atual e precisam ser criadas:

```sql
-- =========================================
-- TABELAS DE EMAIL MARKETING
-- =========================================

CREATE TABLE email_campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  cohort_type VARCHAR(50) NOT NULL, -- 'financial', 'operational', 'occupancy'
  status VARCHAR(50) DEFAULT 'draft', -- 'draft', 'scheduled', 'sending', 'sent', 'paused'
  scheduled_at TIMESTAMP WITH TIME ZONE,
  sent_at TIMESTAMP WITH TIME ZONE,
  total_recipients INTEGER DEFAULT 0,
  delivery_count INTEGER DEFAULT 0,
  open_count INTEGER DEFAULT 0,
  click_count INTEGER DEFAULT 0,
  bounce_count INTEGER DEFAULT 0,
  unsubscribe_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE email_variants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID REFERENCES email_campaigns(id),
  variant_letter VARCHAR(5) NOT NULL, -- 'A', 'B', 'C'
  subject_line VARCHAR(255) NOT NULL,
  preview_text VARCHAR(100),
  body_html TEXT NOT NULL,
  body_text TEXT NOT NULL,
  cta_url VARCHAR(500),
  cta_text VARCHAR(100),
  recipient_count INTEGER DEFAULT 0,
  open_rate DECIMAL(5,4) DEFAULT 0,
  click_rate DECIMAL(5,4) DEFAULT 0,
  is_winner BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE email_sends (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contact_id UUID NOT NULL,
  campaign_id UUID REFERENCES email_campaigns(id),
  variant_id UUID REFERENCES email_variants(id),
  resend_email_id VARCHAR(255), -- ID retornado pelo Resend
  status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'delivered', 'bounced', 'failed'
  sent_at TIMESTAMP WITH TIME ZONE,
  delivered_at TIMESTAMP WITH TIME ZONE,
  bounced_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(contact_id, campaign_id) -- Evitar envio duplicado
);

CREATE TABLE email_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email_send_id UUID REFERENCES email_sends(id),
  contact_id UUID NOT NULL,
  event_type VARCHAR(50) NOT NULL, -- 'opened', 'clicked', 'bounced', 'unsubscribed', 'complained'
  event_data JSONB, -- Dados extras do webhook
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  INDEX idx_email_events_contact_type (contact_id, event_type),
  INDEX idx_email_events_created (created_at)
);

-- =========================================
-- TABELAS DE LEAD SCORING
-- =========================================

CREATE TABLE lead_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contact_id UUID NOT NULL UNIQUE,
  total_score INTEGER NOT NULL DEFAULT 0,
  previous_score INTEGER DEFAULT 0,
  cluster VARCHAR(20) DEFAULT 'BLUE', -- 'RED', 'ORANGE', 'BLUE', 'INACTIVE'
  previous_cluster VARCHAR(20),
  recency_multiplier DECIMAL(3,2) DEFAULT 1.0,
  last_event_at TIMESTAMP WITH TIME ZONE,
  last_scored_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  score_history JSONB DEFAULT '[]', -- Array de scores históricos
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE lead_score_dimensions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contact_id UUID NOT NULL,
  dimension_number INTEGER NOT NULL, -- 1-18
  dimension_name VARCHAR(100) NOT NULL,
  dimension_category VARCHAR(50) NOT NULL, -- 'engagement', 'firmographic', 'contextual'
  raw_points INTEGER DEFAULT 0,
  weighted_points DECIMAL(8,2) DEFAULT 0,
  multiplier DECIMAL(4,2) DEFAULT 1.0,
  final_points DECIMAL(8,2) DEFAULT 0,
  event_count INTEGER DEFAULT 0,
  last_event_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(contact_id, dimension_number)
);

CREATE TABLE lead_clusters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contact_id UUID NOT NULL UNIQUE,
  current_cluster VARCHAR(20) NOT NULL,
  previous_cluster VARCHAR(20),
  cluster_changed_at TIMESTAMP WITH TIME ZONE,
  days_in_current_cluster INTEGER DEFAULT 0,
  total_cluster_changes INTEGER DEFAULT 0,
  cluster_history JSONB DEFAULT '[]',
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE scoring_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dimension_number INTEGER NOT NULL UNIQUE,
  dimension_name VARCHAR(100) NOT NULL,
  weight DECIMAL(4,2) DEFAULT 1.0,
  points_per_event INTEGER DEFAULT 5,
  cluster_red_threshold INTEGER DEFAULT 120,
  cluster_orange_threshold INTEGER DEFAULT 60,
  cluster_blue_threshold INTEGER DEFAULT 20,
  decay_weekly_pct DECIMAL(4,2) DEFAULT 5.0,
  updated_by VARCHAR(100),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =========================================
-- TABELAS DE EVENTOS (PIPELINE)
-- =========================================

CREATE TABLE event_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type VARCHAR(100) NOT NULL,
  contact_id UUID NOT NULL,
  source VARCHAR(50) NOT NULL,
  payload JSONB NOT NULL,
  processing_stage VARCHAR(50) DEFAULT 'captured',
  priority INTEGER DEFAULT 5, -- 1=highest, 10=lowest
  retry_count INTEGER DEFAULT 0,
  max_retries INTEGER DEFAULT 3,
  error_message TEXT,
  locked_at TIMESTAMP WITH TIME ZONE,
  locked_by VARCHAR(100),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  processed_at TIMESTAMP WITH TIME ZONE
);

CREATE TABLE event_processed (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  original_event_id UUID NOT NULL,
  event_type VARCHAR(100) NOT NULL,
  contact_id UUID NOT NULL,
  normalized_payload JSONB,
  enriched_payload JSONB,
  scoring_result JSONB,
  routing_actions JSONB,
  processing_time_ms INTEGER,
  pipeline_version VARCHAR(20),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE event_routing_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL,
  action_type VARCHAR(100) NOT NULL,
  action_payload JSONB,
  target_system VARCHAR(50), -- 'slack', 'email', 'whatsapp', 'ads', 'crm'
  status VARCHAR(50) DEFAULT 'pending',
  executed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =========================================
-- TABELAS DE WHATSAPP
-- =========================================

CREATE TABLE whatsapp_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contact_id UUID NOT NULL,
  phone_number VARCHAR(20) NOT NULL,
  triage_result VARCHAR(50), -- 'RED', 'ORANGE', 'BLUE', 'SUPPORT', 'UNKNOWN'
  assigned_sdr UUID,
  status VARCHAR(50) DEFAULT 'active', -- 'active', 'transferred', 'closed'
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_message_at TIMESTAMP WITH TIME ZONE,
  closed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE whatsapp_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID REFERENCES whatsapp_conversations(id),
  contact_id UUID NOT NULL,
  direction VARCHAR(10) NOT NULL, -- 'inbound', 'outbound'
  message_type VARCHAR(20) NOT NULL, -- 'text', 'image', 'audio', 'document', 'template'
  content TEXT NOT NULL,
  media_url TEXT,
  z_api_message_id VARCHAR(255),
  status VARCHAR(50) DEFAULT 'sent', -- 'sent', 'delivered', 'read', 'failed'
  sent_by VARCHAR(100), -- 'typebot', 'sdr_name', 'automation'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE whatsapp_triage_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID REFERENCES whatsapp_conversations(id),
  contact_id UUID NOT NULL,
  responses JSONB, -- Respostas coletadas pelo Typebot
  pain_point VARCHAR(100),
  room_count INTEGER,
  city VARCHAR(100),
  cluster_assigned VARCHAR(20),
  sdr_notified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =========================================
-- TABELAS DE TRIAL
-- =========================================

CREATE TABLE trials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contact_id UUID NOT NULL,
  plan_selected VARCHAR(50) DEFAULT 'professional',
  status VARCHAR(50) DEFAULT 'active', -- 'active', 'completed', 'converted', 'abandoned', 'extended'
  start_date TIMESTAMP WITH TIME ZONE NOT NULL,
  end_date TIMESTAMP WITH TIME ZONE NOT NULL,
  converted_at TIMESTAMP WITH TIME ZONE,
  cancelled_at TIMESTAMP WITH TIME ZONE,
  activation_score DECIMAL(5,2) DEFAULT 0,
  stagnation_level INTEGER DEFAULT 0,
  stagnation_count INTEGER DEFAULT 0,
  days_active INTEGER DEFAULT 0,
  features_used JSONB DEFAULT '[]',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE trial_daily_engagement (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trial_id UUID REFERENCES trials(id),
  contact_id UUID NOT NULL,
  day_number INTEGER NOT NULL, -- 0-7
  login_count INTEGER DEFAULT 0,
  actions_count INTEGER DEFAULT 0,
  features_accessed JSONB DEFAULT '[]',
  time_spent_seconds INTEGER DEFAULT 0,
  activation_progress DECIMAL(5,2) DEFAULT 0,
  stagnation_detected BOOLEAN DEFAULT FALSE,
  stagnation_action_taken VARCHAR(100),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(trial_id, day_number)
);

CREATE TABLE trial_checklist_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trial_id UUID REFERENCES trials(id),
  contact_id UUID NOT NULL,
  step_number INTEGER NOT NULL,
  step_name VARCHAR(100) NOT NULL,
  completed BOOLEAN DEFAULT FALSE,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(trial_id, step_number)
);

-- =========================================
-- TABELAS DE ADS / RETARGETING
-- =========================================

CREATE TABLE ad_campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  platform VARCHAR(20) NOT NULL, -- 'google', 'meta'
  campaign_name VARCHAR(255) NOT NULL,
  campaign_type VARCHAR(100), -- 'rlsa_search', 'display', 'youtube', 'retargeting', 'lookalike'
  status VARCHAR(50) DEFAULT 'paused',
  daily_budget DECIMAL(10,2) DEFAULT 0,
  external_campaign_id VARCHAR(255), -- ID na plataforma (Google/Meta)
  audience_segment VARCHAR(50), -- 'RED', 'ORANGE', 'BLUE', 'ALL', 'LOOKALIKE'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE ad_performance_daily (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID REFERENCES ad_campaigns(id),
  date DATE NOT NULL,
  impressions INTEGER DEFAULT 0,
  clicks INTEGER DEFAULT 0,
  ctr DECIMAL(5,4) DEFAULT 0,
  cpc DECIMAL(10,2) DEFAULT 0,
  cpm DECIMAL(10,2) DEFAULT 0,
  spend DECIMAL(10,2) DEFAULT 0,
  conversions INTEGER DEFAULT 0,
  cost_per_conversion DECIMAL(10,2) DEFAULT 0,
  roas DECIMAL(6,2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(campaign_id, date)
);

CREATE TABLE customer_match_uploads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  platform VARCHAR(20) NOT NULL,
  audience_name VARCHAR(255) NOT NULL,
  contacts_uploaded INTEGER DEFAULT 0,
  contacts_matched INTEGER DEFAULT 0,
  upload_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  status VARCHAR(50) DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =========================================
-- TABELAS DE EQUIPE COMERCIAL
-- =========================================

CREATE TABLE sdr_activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sdr_user_id UUID NOT NULL,
  contact_id UUID NOT NULL,
  activity_type VARCHAR(50) NOT NULL, -- 'whatsapp_sent', 'call_made', 'email_sent', 'note_added'
  channel VARCHAR(20), -- 'whatsapp', 'phone', 'email'
  content TEXT,
  outcome VARCHAR(50), -- 'replied', 'no_reply', 'interested', 'not_interested', 'demo_booked'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE sdr_performance_daily (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sdr_user_id UUID NOT NULL,
  date DATE NOT NULL,
  conversations_started INTEGER DEFAULT 0,
  replies_received INTEGER DEFAULT 0,
  demos_booked INTEGER DEFAULT 0,
  sqls_generated INTEGER DEFAULT 0,
  avg_response_time_min DECIMAL(6,2) DEFAULT 0,
  messages_sent INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(sdr_user_id, date)
);

CREATE TABLE demos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contact_id UUID NOT NULL,
  closer_user_id UUID,
  scheduled_at TIMESTAMP WITH TIME ZONE NOT NULL,
  actual_start_at TIMESTAMP WITH TIME ZONE,
  actual_end_at TIMESTAMP WITH TIME ZONE,
  duration_minutes INTEGER DEFAULT 20,
  status VARCHAR(50) DEFAULT 'scheduled', -- 'scheduled', 'completed', 'no_show', 'rescheduled'
  demo_type VARCHAR(50) DEFAULT 'standard', -- 'standard', 'emergency', 'follow_up'
  pain_discussed VARCHAR(100),
  features_demonstrated JSONB DEFAULT '[]',
  outcome VARCHAR(50), -- 'closed_won', 'closed_lost', 'follow_up', 'objection'
  objection VARCHAR(200),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE objection_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  demo_id UUID REFERENCES demos(id),
  contact_id UUID NOT NULL,
  objection_category VARCHAR(100) NOT NULL, -- 'price', 'time', 'competitor', 'need', 'trust'
  objection_text TEXT NOT NULL,
  how_handled VARCHAR(200),
  resolution VARCHAR(50), -- 'overcome', 'partially_overcome', 'not_overcome'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =========================================
-- TABELAS DE OTIMIZAÇÃO
-- =========================================

CREATE TABLE optimization_experiments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  hypothesis TEXT NOT NULL,
  status VARCHAR(50) DEFAULT 'planned', -- 'planned', 'running', 'completed', 'paused'
  funnel_phase VARCHAR(100),
  metric_primary VARCHAR(100) NOT NULL,
  metric_baseline DECIMAL(10,2),
  metric_target DECIMAL(10,2),
  started_at TIMESTAMP WITH TIME ZONE,
  ended_at TIMESTAMP WITH TIME ZONE,
  result VARCHAR(50), -- 'won', 'lost', 'inconclusive'
  learnings TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE funnel_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  snapshot_date DATE NOT NULL,
  seed_count INTEGER DEFAULT 0,
  contacted_count INTEGER DEFAULT 0,
  engaged_count INTEGER DEFAULT 0,
  warm_count INTEGER DEFAULT 0,
  cool_count INTEGER DEFAULT 0,
  hot_count INTEGER DEFAULT 0,
  sdr_qualified_count INTEGER DEFAULT 0,
  sql_count INTEGER DEFAULT 0,
  trial_count INTEGER DEFAULT 0,
  negotiation_count INTEGER DEFAULT 0,
  closed_won_count INTEGER DEFAULT 0,
  closed_lost_count INTEGER DEFAULT 0,
  mrr DECIMAL(12,2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(snapshot_date)
);

CREATE TABLE kpi_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  kpi_name VARCHAR(100) NOT NULL,
  kpi_category VARCHAR(50) NOT NULL, -- 'funnel', 'financial', 'team', 'system'
  kpi_value DECIMAL(12,4) NOT NULL,
  kpi_target DECIMAL(12,4),
  period_date DATE NOT NULL,
  period_type VARCHAR(20) NOT NULL, -- 'daily', 'weekly', 'monthly'
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =========================================
-- TABELAS DE LANDING PAGES
-- =========================================

CREATE TABLE landing_page_variants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  page_slug VARCHAR(100) NOT NULL,
  cluster_target VARCHAR(20) NOT NULL, -- 'RED', 'ORANGE', 'BLUE'
  headline VARCHAR(255),
  subheadline TEXT,
  cta_text VARCHAR(100),
  cta_url VARCHAR(500),
  social_proof_type VARCHAR(50), -- 'regional', 'general', 'industry'
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE landing_page_views (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contact_id UUID,
  variant_id UUID REFERENCES landing_page_variants(id),
  page_slug VARCHAR(100) NOT NULL,
  session_id VARCHAR(255),
  referrer TEXT,
  utm_source VARCHAR(100),
  utm_medium VARCHAR(100),
  utm_campaign VARCHAR(100),
  utm_content VARCHAR(100),
  time_on_page_seconds INTEGER,
  viewport_width INTEGER,
  viewport_height INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =========================================
-- ÍNDICES ADICIONAIS
-- =========================================

CREATE INDEX idx_lead_scores_cluster ON lead_scores(cluster);
CREATE INDEX idx_lead_scores_total ON lead_scores(total_score DESC);
CREATE INDEX idx_email_events_contact ON email_events(contact_id);
CREATE INDEX idx_email_events_type ON email_events(event_type);
CREATE INDEX idx_event_queue_stage ON event_queue(processing_stage);
CREATE INDEX idx_event_queue_priority ON event_queue(priority ASC, created_at ASC);
CREATE INDEX idx_trials_status ON trials(status);
CREATE INDEX idx_trials_contact ON trials(contact_id);
CREATE INDEX idx_whatsapp_conversations_status ON whatsapp_conversations(status);
CREATE INDEX idx_ad_performance_campaign_date ON ad_performance_daily(campaign_id, date);
CREATE INDEX idx_kpi_history_name_period ON kpi_history(kpi_name, period_date);
CREATE INDEX idx_funnel_snapshots_date ON funnel_snapshots(snapshot_date);
CREATE INDEX idx_sdr_performance_date ON sdr_performance_daily(sdr_user_id, date);
```

### 15.3 Relacionamentos entre Tabelas

```
RELACIONAMENTOS PRINCIPAIS:

contacts (1) ──→ (N) email_sends
contacts (1) ──→ (N) email_events
contacts (1) ──→ (1) lead_scores
contacts (1) ──→ (1) lead_clusters
contacts (1) ──→ (N) lead_score_dimensions
contacts (1) ──→ (N) event_processed
contacts (1) ──→ (N) whatsapp_conversations
contacts (1) ──→ (N) whatsapp_messages
contacts (1) ──→ (1) trials
contacts (1) ──→ (N) trial_daily_engagement
contacts (1) ──→ (N) landing_page_views
contacts (1) ──→ (N) sdr_activities
contacts (1) ──→ (N) demos

email_campaigns (1) ──→ (N) email_variants
email_campaigns (1) ──→ (N) email_sends
email_variants (1) ──→ (N) email_sends
email_sends (1) ──→ (N) email_events

trials (1) ──→ (N) trial_daily_engagement
trials (1) ──→ (N) trial_checklist_progress

whatsapp_conversations (1) ──→ (N) whatsapp_messages
whatsapp_conversations (1) ──→ (1) whatsapp_triage_results

demos (1) ──→ (N) objection_log
ad_campaigns (1) ──→ (N) ad_performance_daily

users (1) ──→ (N) sdr_activities
users (1) ──→ (N) sdr_performance_daily
users (1) ──→ (N) demos (as closer)
```

---

## Anexos

### Anexo A: Glossário

| Termo | Definição |
|---|---|
| PLG | Product-Led Growth — crescimento liderado pelo produto |
| SLG | Sales-Led Growth — crescimento liderado por vendas |
| CAC | Customer Acquisition Cost — custo de aquisição de cliente |
| LTV | Lifetime Value — valor total do cliente durante a relação |
| ARPU | Average Revenue Per User — receita média por usuário |
| MRR | Monthly Recurring Revenue — receita recorrente mensal |
| ARR | Annual Recurring Revenue — receita recorrente anual |
| SDR | Sales Development Representative — representante de desenvolvimento de vendas |
| SQL | Sales Qualified Lead — lead qualificado para vendas |
| CTA | Call to Action — chamada para ação |
| CAPI | Conversions API — API de conversões server-side (Meta) |
| RLSA | Remarketing Lists for Search Ads — retargeting no Google Search |
| ICP | Ideal Customer Profile — perfil ideal de cliente |
| TTV | Time to Value — tempo para primeiro valor percebido |
| OTE | On-Target Earnings — ganhos totais no alvo |
| PIP | Performance Improvement Plan — plano de melhoria de performance |
| ICE | Impact × Confidence × Ease — framework de priorização |

### Anexo B: Conformidade LGPD

- Todos os emails incluem link de descadastro (1-clique unsubscribe)
- Opt-in obtido antes de adicionar à base de comunicação comercial
- Dados armazenados com criptografia at-rest (Supabase)
- Retenção de dados: 90 dias após cancelamento, depois anonimização
- DPO (Data Protection Officer): responsabilidade do CEO na fase inicial
- Privacy policy atualizada em: [URL]
- Formulários de consentimento documentados

---

> **Fim do Documento**
> Próxima revisão: Sprint 2, Semana 5 (após dados reais dos primeiros 30 dias)
