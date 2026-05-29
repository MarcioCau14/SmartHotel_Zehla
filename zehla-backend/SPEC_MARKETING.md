# SPEC — Domínio de Marketing & Reputação (Zé-Marketer)

> **Córtex Criativo do ZEHLA.**  
> O Zé-Marketer é o agente responsável pela imagem digital da pousada: gestão de reputação em OTAs e portais, copywriting de respostas a reviews, campanhas de remarketing e análise de sentimento do público. Aqui a pousada é amada ou cancelada. Não há margem para tom sarcástico ou SPAM.

---

## 0. Escopo e Responsabilidade

### Zé-Marketer PODE:
- Redigir respostas profissionais a reviews positivos, neutros, negativos e críticos em portais (Booking, TripAdvisor, Google)
- Analisar sentimento de reviews e classificar automaticamente (Positivo, Neutro, Negativo, Crítico)
- Criar campanhas de remarketing segmentadas por perfil de hóspede (ex: hóspedes satisfeitos → oferta de retorno; hóspedes críticos → pesquisa de melhoria)
- Sugerir conteúdo para redes sociais (Instagram, Facebook) baseado em datas comemorativas e alta temporada
- Agendar posts promocionais para canais sociais
- Calcular métricas de engajamento: taxa de resposta, sentimento médio, NPS derivado de reviews, CTR de campanhas
- Acionar o Zé-Ops via ZCP se um review crítico relatar problema estrutural (ar-condicionado, vazamento, etc.)
- Emitir relatórios de reputação para o Zé-Host (Human Overwatch)

### Zé-Marketer NÃO PODE:
- ❌ Alterar preços de pacotes, tarifas ou diárias — jurisdição exclusiva do Zé-Analyst
- ❌ Oferecer estorno financeiro, reembolso ou compensação em respostas públicas sem Handoff ZCP para o Zé-Host
- ❌ Usar tom ofensivo, sarcástico, agressivo ou passivo-agressivo em respostas — mesmo com hóspedes injustos
- ❌ Mentir ou inventar informações sobre a pousada, serviços ou amenidades
- ❌ Divulgar dados pessoais de hóspedes em respostas públicas (LGPD violation)
- ❌ Responder a reviews com conteúdo automatizado genérico sem contexto da estadia
- ❌ Criar campanhas com promise de desconto sem aprovação do Zé-Analyst (margem financeira)
- ❌ **Cross-Context é Read-Only:** O Zé-Marketer tem acesso SOMENTE LEITURA às portas de outros contextos (`IReservaReadOnlyPort` para obter dados da estadia ao responder um review, `IPropostaReadOnlyPort` para segmentar campanhas). Nenhum caso de uso pode invocar métodos de escrita em entidades de outros Bounded Contexts sem mediação via ZCP.

### Gatilhos que Acordam o Zé-Marketer:
| Gatilho | Fonte | Ação |
|---------|-------|------|
| Novo review recebido | Webhook Booking/TripAdvisor/Google | Classificar sentimento e gerar resposta |
| Review crítico detectado | Zé-Marketer (auto) | Emitir `ReviewCriticoRegistrado` + Handoff Zé-Ops |
| Nota média ≤ 7.0 nos últimos 30 dias | Métrica (auto) | Acionar alerta de reputação para Zé-Host |
| Início de mês | Time-scheduler | Gerar relatório de reputação mensal |
| Feriado próximo | Calendário | Sugerir campanha sazonal |
| Hóspede satisfeito (checkout c/ nota ≥ 9) | Checkout (Hospitalidade) | Gatilho de campanha de remarketing |

---

## 1. Entidades de Domínio Rico

### 1.1 Review

**Propósito:** Representa um review/avaliação recebida de um hóspede em um portal externo (Booking, TripAdvisor, Google) ou canal interno.

**Invariantes Dogmáticas:**

> M1. **Sentimento Classificado:** `sentimento` deve ser derivado deterministicamente da `nota` na criação. Nota ≤ 3 → `Critico`, Nota 4-5 → `Negativo`, Nota 6-7 → `Neutro`, Nota 8-9 → `Positivo`, Nota 10 → `Positivo`. Nenhum review pode ficar sem classificação de sentimento.

> M2. **Resposta Profissional:** `resposta` não pode conter palavras da lista de bloqueio (ofensas, sarcasmo, termos LGPD). Um `Review` com `sentimento = Critico` obrigatoriamente dispara `ReviewCriticoRegistradoEvent` com payload para o Zé-Ops.

> M3. **Porta Intocável:** Um `Review` já respondido (`status = 'respondido'`) não pode ser re-respondido sem autorização do Zé-Host. Evita retratação pública inconsistente.

> M4. **Contexto Obrigatório:** `resposta` deve referenciar o contexto da estadia (período, problema mencionado). Respostas genéricas sem referência ao relato do hóspede são rejeitadas.

**Máquina de Estados:**
```
[recebido] → [analisado] → [respondido] → [publicado]
                  ↓ (se crítico)
            [escalado_zops] → [respondido_apos_manutencao]
```

**Eventos de Domínio:**
| Evento | Payload | Dispara |
|--------|---------|---------|
| `ReviewRecebidoEvent` | reviewId, portal, nota, sentimento | Log, classificação |
| `ReviewCriticoRegistradoEvent` | reviewId, problemaRelatado, quartoId, dataEstadia | Handoff Zé-Ops (abrir tarefa) |
| `ReviewRespondidoEvent` | reviewId, textoResposta, sentimento | Métrica de resposta |
| `ReviewEscaladoZopsEvent` | reviewId, taskId, timestamp | Zé-Ops confirma |

---

### 1.2 Campanha

**Propósito:** Agrupa ações de marketing para um objetivo específico (remarketing, sazonal, fidelização).

**Invariantes Dogmáticas:**

> M5. **Segmentação Informada:** Toda campanha deve ter `publicoAlvo` definido (ex: `hospedes_satisfeitos`, `leads_frios`, `todos`). Campanhas sem segmento são rejeitadas.

> M6. **Conteúdo Aprovado:** Nenhum conteúdo em campanha pode conter promise financeira não validada (preço, desconto) sem assinatura do Zé-Analyst.

> M7. **Sem SPAM:** Uma `Campanha` com `tipo = 'remarketing'` só pode atingir hóspedes com `optInMarketing = true` (RP). Violar isso é LGPD violation.

**Máquina de Estados:**
```
[draft] → [aprovada] → [agendada] → [em_execucao] → [concluida]
                                            ↓
                                       [cancelada]
```

---

### 1.3 Conteúdo

**Propósito:** Todo texto gerado pelo Zé-Marketer — respostas, posts, e-mails, scripts de campanha. Cada peça de conteúdo é versionada e rastreável.

**Invariantes Dogmáticas:**

> M8. **Tom Controlado:** `tom` deve ser um dos valores controlados: `profissional`, `acolhedor`, `entusiasta`, `neutro`. Zé-Marketer nunca gera conteúdo com tom ofensivo, sarcástico ou passivo-agressivo.

> M9. **Copy Auditável:** `Conteudo` gerado é imutável após criação. Alterações criam nova versão com referência à anterior. Toda resposta a review é arquivada.

---

### 1.4 Post

**Propósito:** Publicação para redes sociais (Instagram, Facebook) agendada ou publicada.

**Invariantes Dogmáticas:**

> M10. **Canal Válido:** O `canal` deve ser suportado: `instagram`, `facebook`. Novos canais requerem extensão explícita.

> M11. **Mídia Obrigatória:** Posts com `tipo = 'promocional'` exigem ao menos 1 mídia (imagem/vídeo). Posts apenas textuais são rejeitados para promoções.

**Máquina de Estados:**
```
[draft] → [agendado] → [publicado] → [arquivado]
                        ↓
                   [falhou]
```

---

### 1.5 Métrica

**Propósito:** Agrega indicadores de performance do Marketing Context. Imutável após criação — cada snapshot é um registro histórico.

**Invariantes Dogmáticas:**

> M12. **Período Obrigatório:** `dataInicio` e `dataFim` são obrigatórios e `dataFim > dataInicio`. A métrica cobre um intervalo específico.

> M13. **Taxa de Resposta:** `taxaResposta = totalRespondidos / totalReviewsRecebidos` no período. Se `totalReviewsRecebidos = 0`, `taxaResposta = 100` (não há pendentes).

> M14. **Sentimento Médio:** `sentimentoMedio` é calculado como média ponderada das notas no período. Armazenado como `Percentual` (0-100).

---

## 2. Value Objects

### 2.1 Sentimento

Enumera a classificação emocional de um review ou feedback.

| Valor | Faixa de Nota | Descrição |
|-------|---------------|-----------|
| `positivo` | 8-10 | Hóspede satisfeito, elogios |
| `neutro` | 6-7 | Experiência mediana, sem destaques |
| `negativo` | 4-5 | Hóspede insatisfeito com aspectos pontuais |
| `critico` | 1-3 | Problema grave relatado, risco de reputação |

**Regras:**
- `Sentimento.critico()` sempre dispara `ReviewCriticoRegistradoEvent` na criação do Review
- `Sentimento` é derivado deterministicamente — não editável manualmente
- Um `Sentimento` com valor `critico` nunca transiciona automaticamente; requer validação do Zé-Host

### 2.2 ScoreEngajamento

Score 0-100 que mede o nível de interação de uma campanha ou post.

**Regras:**
- `ScoreEngajamento.criar(valor)`: valida `0 <= valor <= 100`
- Se `score < 10` por 7 dias consecutivos → gatilho de alerta para Zé-Host
- Se `score > 90` → gatilho de sucesso para alimentar modelo de Conteúdo

### 2.3 CanalDistribuicao

Portais e canais onde a pousada tem presença digital.

| Canal | Tipo | Read-Only | Descrição |
|-------|------|-----------|-----------|
| `booking` | OTA | Sim | Booking.com — webhook de reviews |
| `tripadvisor` | Portal | Sim | TripAdvisor — webhook de reviews |
| `google` | Portal | Sim | Google Meu Negócio — webhook de reviews |
| `instagram` | Social | Não | Postagens e stories |
| `facebook` | Social | Não | Postagens e anúncios |
| `email` | Proprio | Não | Campanhas de e-mail marketing |
| `whatsapp` | Proprio | Não | Comunicação direta (via Zé-Concierge) |

**Regras:**
- Canais com `Read-Only = Sim` só aceitam leitura de reviews (via webhook)
- Canais com `Read-Only = Não` aceitam criação de Posts

---

## 3. Portas Segregadas

### 3.1 Portas Próprias do Marketing

| Porta | Métodos | Descrição |
|-------|---------|-----------|
| `IReviewPort` | `receberReview(dados)`, `buscarReviewPorId(id, pousadaId)`, `listarPorSentimento(sentimento, pousadaId)`, `listarPorPeriodo(pousadaId, inicio, fim)`, `responderReview(id, pousadaId, textoResposta)`, `calcularNotaMedia(pousadaId, inicio, fim)` | Gestão de reviews |
| `ICampanhaPort` | `criarCampanha(dados)`, `buscarPorId(id, pousadaId)`, `listarAtivas(pousadaId)`, `atualizarStatus(id, pousadaId, status)`, `cancelarCampanha(id, pousadaId)` | Ciclo de vida de campanhas |
| `IConteudoPort` | `criarConteudo(dados)`, `buscarPorId(id)`, `listarVersoes(conteudoId)` | Versionamento de texto |
| `IPostPort` | `agendarPost(dados)`, `publicar(id, pousadaId)`, `buscarPorId(id, pousadaId)`, `listarPorCanal(canal, pousadaId)` | Posts em redes sociais |
| `IMetricaPort` | `registrarMetrica(dados)`, `buscarMetricaPeriodo(pousadaId, inicio, fim)`, `listarHistorico(pousadaId, limite)` | Snapshot de indicadores |

### 3.2 Portas Cross-Context (Read-Only)

| Porta | Origem | Métodos | Propósito |
|-------|--------|---------|-----------|
| `IReservaReadOnlyPort` | Hospitalidade | `buscarPorId(id)`, `listarPorHospede(hospedeId)` | Contexto da estadia ao responder review |
| `IHospedeReadOnlyPort` | Hospitalidade | `buscarPorId(id)`, `buscarPorDocumento(documento)` | Dados do hóspede para segmentação |
| `IPropostaReadOnlyPort` | Comercial | `buscarPorId(id)`, `listarPorLead(leadId)` | Histórico de negociação para campanhas |

---

## 4. Casos de Uso

### 4.1 AnalisarSentimentoReviewUseCase

**Entrada:** `reviewId: string, pousadaId: string`
**Saída:** `{ review, sentimento, criticidade }`
**Fluxo:**
1. Busca `Review` via `IReviewPort.buscarPorId()`
2. Deriva `Sentimento` da `nota` (M1)
3. Se `sentimento = critico`, cria tarefa no Zé-Ops via ZCP (M2)
4. Atualiza `status` do Review para `analisado`
5. Retorna análise completa

**Invariantes validadas:** M1, M2

### 4.2 ResponderReviewPortalUseCase

**Entrada:** `reviewId: string, pousadaId: string, textoResposta: string, tom: string`
**Saída:** `{ review, resposta }`
**Fluxo:**
1. Busca `Review` — se `status = respondido` (M3), rejeita
2. Busca dados da reserva via `IReservaReadOnlyPort` para contextualizar
3. Valida `textoResposta` contra lista de bloqueio (M2)
4. Cria `Conteudo` com o texto e `tom` (M8)
5. Associa resposta ao `Review`
6. Atualiza `Review.status` para `respondido`

**Invariantes validadas:** M2, M3, M4, M8

### 4.3 CriarCampanhaRemarketingUseCase

**Entrada:** `pousadaId: string, nome: string, publicoAlvo: string, conteudo: string, dataInicio: Date, dataFim: Date`
**Saída:** `{ campanha }`
**Fluxo:**
1. Valida `publicoAlvo` (M5)
2. Se `publicoAlvo = hospedes_satisfeitos`, consulta `IReservaReadOnlyPort` por hóspedes com nota ≥ 9
3. Valida que `conteudo` não contém promise financeira não assinada (M6)
4. Filtra contatos com `optInMarketing = true` (M7)
5. Cria `Campanha` e `Conteudo` associado
6. Agenda execução para `dataInicio`

**Invariantes validadas:** M5, M6, M7

### 4.4 AgendarPostUseCase

**Entrada:** `pousadaId: string, canal: string, tipo: string, texto: string, midias: string[], dataAgendamento: Date`
**Saída:** `{ post }`
**Fluxo:**
1. Valida `canal` suportado (M10)
2. Se `tipo = promocional`, valida ao menos 1 mídia (M11)
3. Cria `Conteudo` com o texto
4. Cria `Post` com status `agendado`

**Invariantes validadas:** M8, M10, M11

### 4.5 CalcularMetricasMarketingUseCase

**Entrada:** `pousadaId: string, dataInicio: Date, dataFim: Date`
**Saída:** `{ metricas }`
**Fluxo:**
1. Lista reviews no período via `IReviewPort.listarPorPeriodo()`
2. Calcula `notaMedia`, `taxaResposta` (M13), `sentimentoMedio` (M14)
3. Lista campanhas no período via `ICampanhaPort.listarAtivas()`
4. Agrupa métricas por canal
5. Cria snapshot `Metrica` via `IMetricaPort.registrarMetrica()`

**Invariantes validadas:** M12, M13, M14

### 4.6 ProcessarWebhookReviewUseCase

**Entrada:** `payload: { portal: string, hóspede: string, nota: number, texto: string, dataEstadia: Date, quartoId?: string }`
**Saída:** `{ review }`
**Fluxo:**
1. Recebe webhook de portal externo
2. Cria `Review` com `status = recebido`
3. Invoca `AnalisarSentimentoReviewUseCase` internamente
4. Se `sentimento = critico`, prepara `ZcpHandoffPackage` para Zé-Ops com:
   - `tipo: 'abrir_tarefa'`
   - `needsEscalation: true`
   - `payload: { reviewId, problemaRelatado }`
5. Se `sentimento = positivo`, prepara gatilho para campanha de remarketing
6. Retorna `Review` criado

---

## 5. Invariantes Dogmáticas (Consolidadas)

| ID | Regra | Violação | Aplicação |
|----|-------|----------|-----------|
| M1 | Sentimento derivado deterministicamente da nota | Review sem sentimento | `Review.create()` |
| M2 | Review crítico sempre dispara evento Zé-Ops | Crítico sem notificação | `AnalisarSentimentoReviewUseCase` |
| M3 | Review respondido não pode ser re-respondido | Re-resposta sem Zé-Host | `ResponderReviewPortalUseCase` |
| M4 | Resposta deve contextualizar a estadia | Resposta genérica sem referência | `ResponderReviewPortalUseCase` |
| M5 | Campanha sem segmento é rejeitada | `publicoAlvo` vazio | `Campanha.create()` |
| M6 | Conteúdo sem validação financeira | Promise de desconto sem Zé-Analyst | `CriarCampanhaRemarketingUseCase` |
| M7 | Remarketing só para optIn = true | Disparo sem consentimento | `CriarCampanhaRemarketingUseCase` |
| M8 | Tom deve ser controlado | Tom ofensivo/sarcástico | `Conteudo.create()` |
| M9 | Conteúdo é imutável após criação | Edição in-place | `Conteudo.create()` |
| M10 | Canal deve ser suportado | Canal inexistente | `Post.create()` |
| M11 | Post promocional exige mídia | Texto sem imagem/vídeo | `Post.create()` |
| M12 | Métrica exige período válido | `dataFim <= dataInicio` | `Metrica.create()` |
| M13 | Taxa de resposta calculada | Divisão por zero | `CalcularMetricasMarketingUseCase` |
| M14 | Sentimento médio como Percentual | Fora de 0-100 | `Metrica.create()` |

---

## 6. Sagas e Eventos de Domínio

### 6.1 Saga: Review Crítico → Manutenção

```
Zé-Marketer                           Zé-Ops
    │                                      │
    │ ReviewCriticoRegistradoEvent          │
    │──────────────────────────────────────>│
    │                                      │  Analisa problema
    │                                      │  Cria Tarefa
    │                                      │  Aloca Staff/Fornecedor
    │                                      │
    │    ZcpHandoffResponse (taskId)        │
    │<──────────────────────────────────────│
    │                                      │
    │ Atualiza Review.status =              │
    │ 'escalado_zops'                       │
    │                                      │
    │    ...dias depois...                  │
    │                                      │
    │    ManutencaoConcluidaEvent            │
    │<──────────────────────────────────────│
    │                                      │
    │ Prepara nova resposta                 │
    │ informando resolução                  │
    │ Publica resposta                      │
```

### 6.2 Saga: Hóspede Satisfeito → Remarketing

```
Hospitalidade                          Zé-Marketer
    │                                      │
    │ CheckoutConcluidoEvent (nota >= 9)    │
    │──────────────────────────────────────>│
    │                                      │  Cria Campanha remarketing
    │                                      │  Gera Conteúdo personalizado
    │                                      │  Dispara via WhatsApp/E-mail
    │                                      │
    │    CampanhaCriadaEvent                 │
    │──────────────────────────────────────>│ (Zé-Host para aprovação)
```

### 6.3 Eventos de Domínio Completos

| Evento | Origem | Payload | Consumidores |
|--------|--------|---------|-------------|
| `ReviewRecebidoEvent` | ProcessarWebhookReviewUseCase | reviewId, portal, nota, texto, dataEstadia, quartoId | Métrica, Log |
| `ReviewCriticoRegistradoEvent` | AnalisarSentimentoReviewUseCase | reviewId, problemaRelatado, quartoId, dataEstadia, portal | Zé-Ops (ZCP) |
| `ReviewRespondidoEvent` | ResponderReviewPortalUseCase | reviewId, textoResposta, sentimento, tom | Métrica, Log |
| `ReviewEscaladoZopsEvent` | Zé-Ops (ZCP Callback) | reviewId, taskId, timestamp | Zé-Marketer |
| `ManutencaoConcluidaEvent` | Zé-Ops | reviewId, taskId, solucao | Zé-Marketer (nova resposta) |
| `CampanhaCriadaEvent` | CriarCampanhaRemarketingUseCase | campanhaId, nome, publicoAlvo, dataInicio | Zé-Host |
| `CampanhaConcluidaEvent` | Campanha (auto) | campanhaId, metricas | Métrica, Zé-Host |
| `PostPublicadoEvent` | AgendarPostUseCase | postId, canal, tipo, data | Métrica |

---

## 7. Códigos de Erro do Domínio

| Código | Mensagem | Causa |
|--------|----------|-------|
| `REVIEW_NOT_FOUND` | Review não encontrado | ID inválido |
| `REVIEW_ALREADY_RESPONDED` | Review já foi respondido | Re-resposta sem Zé-Host |
| `REVIEW_NOT_CRITICAL` | Review não é crítico, não requer escalação | Tentativa de escalar sem critério |
| `REVIEW_INVALID_SENTIMENT` | Sentimento inválido para a nota fornecida | Nota fora da faixa |
| `REVIEW_RESPONSE_BLOCKED` | Resposta contém termos bloqueados | Palavra ofensiva/LGPD |
| `REVIEW_RESPONSE_GENERIC` | Resposta genérica sem contexto da estadia | Falta referência ao relato |
| `CAMPANHA_SEM_SEGMENTO` | Campanha sem público-alvo definido | Segmento vazio |
| `CAMPANHA_SEM_OPTIN` | Contato sem consentimento de marketing | LGPD violation |
| `CAMPANHA_PROMISE_FINANCEIRA` | Conteúdo com promise financeira não validada | Falta assinatura do Zé-Analyst |
| `CONTEUDO_TOM_INVALIDO` | Tom de conteúdo não é um valor controlado | Tom ofensivo/sarcástico |
| `POST_CANAL_INVALIDO` | Canal de publicação não suportado | Canal inexistente |
| `POST_SEM_MIDIA_PROMOCIONAL` | Post promocional sem mídia obrigatória | Falta imagem/vídeo |
| `METRICA_PERIODO_INVALIDO` | Período da métrica é inválido | `dataFim <= dataInicio` |
| `HANDOFF_REQUIRED` | Ação requer aprovação do Zé-Host | Escalação necessária |

---

## 8. Fronteiras do Zé-Marketer (Cognitive Service)

### Zé-Marketer PODE processar intenções:
| Intenção | Handler | Handoff |
|----------|---------|---------|
| `ANALISAR_SENTIMENTO_REVIEW` | `AnalisarSentimentoReviewUseCase` | Se crítico → Zé-Ops |
| `RESPONDER_REVIEW` | `ResponderReviewPortalUseCase` | — |
| `CRIAR_CAMPANHA_REMARKETING` | `CriarCampanhaRemarketingUseCase` | Se financeiro → Zé-Analyst |
| `AGENDAR_POST` | `AgendarPostUseCase` | — |
| `CALCULAR_METRICAS_MARKETING` | `CalcularMetricasMarketingUseCase` | — |
| `PROCESSAR_WEBHOOK_REVIEW` | `ProcessarWebhookReviewUseCase` | Se crítico → Zé-Ops |

### Handoff ZCP:

| Condição | Destino | Payload |
|----------|---------|---------|
| Review crítico (`nota ≤ 3`) | Zé-Ops | `{ tipo: 'abrir_tarefa', problemaRelatado, quartoId }` |
| Conteúdo com promise financeira | Zé-Analyst | `{ tipo: 'validar_desconto', campanhaId, valorSugerido }` |
| Re-resposta de review | Zé-Host | `{ tipo: 'aprovar_resposta', reviewId, textoResposta }` |

---

## 9. Arquitetura de Implementação

```
┌──────────────────────────────────────────────────────────┐
│                    Cognitive Layer                         │
│  ZeMarketerCognitiveService (Intent-to-Action Router)     │
│  ZeMarketerCognitiveTypes (Intents, Errors)               │
└───────────────────────┬──────────────────────────────────┘
                        │
┌───────────────────────▼──────────────────────────────────┐
│                  Application Layer                         │
│  Use Cases:                                                │
│  - AnalisarSentimentoReviewUseCase                        │
│  - ResponderReviewPortalUseCase                           │
│  - CriarCampanhaRemarketingUseCase                        │
│  - AgendarPostUseCase                                     │
│  - CalcularMetricasMarketingUseCase                       │
│  - ProcessarWebhookReviewUseCase                          │
│                                                            │
│  Ports (Interfaces):                                       │
│  ├─ IReviewPort (própria)                                  │
│  ├─ ICampanhaPort (própria)                                │
│  ├─ IConteudoPort (própria)                                │
│  ├─ IPostPort (própria)                                    │
│  ├─ IMetricaPort (própria)                                 │
│  ├─ IReservaReadOnlyPort (Cross-Context)                   │
│  ├─ IHospedeReadOnlyPort (Cross-Context)                   │
│  └─ IPropostaReadOnlyPort (Cross-Context)                  │
└───────────────────────┬──────────────────────────────────┘
                        │
┌───────────────────────▼──────────────────────────────────┐
│                   Domain Layer                             │
│  Entities: Review, Campanha, Conteudo, Post, Metrica       │
│  VOs: Sentimento, ScoreEngajamento, CanalDistribuicao      │
│  Events: ReviewCriticoRegistradoEvent, ...                 │
└───────────────────────┬──────────────────────────────────┘
                        │
┌───────────────────────▼──────────────────────────────────┐
│               Infrastructure Layer                         │
│  InMemory Repos (testes)                                   │
│  Prisma Repos (Data Mapper)                                │
└──────────────────────────────────────────────────────────┘
```

### Enums e Constantes (Pré-definição para Implementação)

```typescript
type Sentimento = 'positivo' | 'neutro' | 'negativo' | 'critico'
type TomConteudo = 'profissional' | 'acolhedor' | 'entusiasta' | 'neutro'
type CanalSocial = 'instagram' | 'facebook'
type StatusReview = 'recebido' | 'analisado' | 'respondido' | 'publicado' | 'escalado_zops'
type StatusCampanha = 'draft' | 'aprovada' | 'agendada' | 'em_execucao' | 'concluida' | 'cancelada'
type StatusPost = 'draft' | 'agendado' | 'publicado' | 'falhou' | 'arquivado'
type PublicoAlvo = 'hospedes_satisfeitos' | 'leads_frios' | 'todos'

const NOTA_CRITICO_MAX = 3
const NOTA_NEGATIVO_MAX = 5
const NOTA_NEUTRO_MAX = 7
const NOTA_POSITIVO_MIN = 8

const TONS_VALIDOS: TomConteudo[] = ['profissional', 'acolhedor', 'entusiasta', 'neutro']
const CANAIS_SOCIAIS_VALIDOS: CanalSocial[] = ['instagram', 'facebook']
const PALAVRAS_BLOQUEADAS: string[] = [] // Populado via config externa
```
