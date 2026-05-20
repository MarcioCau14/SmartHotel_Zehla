---
name: zehla-ml-brain
description: >
  Define os protocolos e fluxos de Machine Learning (ML) para o "Zehla Brain".
  Instrucoes para os agentes sobre como processar interacoes do WhatsApp para
  treinamento (Fine-Tuning) ou enriquecimento de contexto (RAG), garantindo que
  o agente aprenda continuamente o tom de voz e estrategias de conversao de cada pousada.
  Cobertura completa: Voice Cloning via analise de conversas, Voice Fingerprinting,
  Drift Detection (Zehla Guardian), Isolamento Multi-Tenant, Privacidade LGPD,
  integracao com DNA Wizard e Insights Engine, e roadmap de implementacao.
---

# ML Brain Protocol

O ZEHLA ML Brain e o sistema nervoso central da inteligencia artificial da plataforma SMARTHOTEL. Enquanto o ZEHLA Brain (camada cognitiva) gerencia a logica de atendimento, classificacao de leads e respostas em tempo real, o ML Brain e responsavel por garantir que esse atendimento se torne progressivamente mais personalizado, convergente e alinhado com a identidade de cada pousada. Ele nao opera como um modelo estatico: aprende continuamente com cada interacao WhatsApp, cada resultado de reserva e cada ajuste feito pelo dono da pousada atraves do DNA Wizard.

A premissa fundamental e que cada pousada possui um DNA de comunicacao unico. O dono que trata os clientes como "amigos de ferias" usa um vocabulario, ritmo de resposta e estrategia de negociacao completamente diferente daquele que opera com formalidade corporativa. O ML Brain extrai, codifica e replica esse DNA para que o agente de IA atenda com a mesma naturalidade que o proprietario faria pessoalmente.

Este documento rege como o agente de desenvolvimento deve implementar, monitorar e iterar sobre os componentes de Machine Learning do ZEHLA.

---

## 1. Visao Geral e Principios Arquiteturais

### 1.1 Principios Fundamentais

- **Multi-Tenant Isolation:** Cada pousada possui seu proprio espaco de embeddings, modelo fine-tuned e perfil de voz. Dados de tenant A nunca influenciam o modelo de tenant B.
- **Privacy-First ML:** Todo processamento de dados pessoais segue LGPD. Mensagens sao anonimizadas antes da vetorizacao. Embeddings sao criados sobre textos sanitizados, nao sobre dados brutos com nomes e telefones.
- **Continuous Learning com Guardrails:** O sistema aprende com cada interacao, mas possui limites claros: validacao de qualidade minima, deteccao de drift e intervencao humana automatica quando necessario.
- **Hybrid Intelligence:** A combinacao de RAG (memoria de longo prazo e contexto em tempo real) com Fine-Tuning (reducao de custos em alta escala) garante precisao e economia simultaneamente.
- **Observable Cognition:** Cada decisao do modelo e rastreavel. O ZCC exibe metricas em tempo real de alinhamento de tom, taxa de conversao por modelo e alertas de drift.

### 1.2 Arquitetura - 4 Camadas

A arquitetura do ML Brain opera em tres camadas interconectadas que formam um ciclo continuo de aprendizado:

| Camada | Funcao | Tecnologias |
|--------|--------|-------------|
| **Ingestao** | Captura, sanitiza e vetoriza conversas WhatsApp | BullMQ, PGVector, Zod schemas |
| **Aprendizado** | Gera embeddings, treina modelos fine-tuned | OpenAI Ada-3, LoRA, jsonl pipelines |
| **Aplicacao** | Injeta contexto e tom nas respostas do agente | RAG retrieval, system prompts dinamicos |
| **Observabilidade** | Monitora drift, alinhamento e performance | CognitiveObservability, Grafana |

Cada ciclo do loop gera novos dados que realimentam a Camada de Ingestao, criando um sistema que melhora progressivamente com o uso.

---

## 2. Arquitetura Hibrida: RAG + Fine-Tuning

A infraestrutura de ML do ZEHLA utiliza uma abordagem em duas camadas complementares. O RAG fornece memoria contextual e atualizacao em tempo real, enquanto o Fine-Tuning oferece reducao dramatica de custos e especializacao profunda por pousada.

### 2.1 Camada 1: RAG (Retrieval-Augmented Generation)

A camada RAG constitui a memoria de longo prazo do sistema. Quando um lead inicia uma conversa, o sistema busca nos embeddings as 3 a 5 interacoes de maior sucesso daquela pousada para guiar o tom e a estrategia.

**Pipeline RAG - 4 etapas:**

1. **Capture:** Cada mensagem enviada/recebida e armazenada com metadados completos: tenantId, leadId, timestamp, tipo de mensagem, sentimento detectado e tag de outcome.
2. **Enrich:** Mensagens sao enriquecidas com analise de sentimento (LLM lightweight), extracao de entidades (datas, valores, tipo de quarto) e classificacao de intencao (reserva, duvida, reclamacao, cancelamento).
3. **Vectorize:** Batches de 50 mensagens sao enviados a API de embeddings (OpenAI text-embedding-3-small) apos sanitizacao LGPD.
4. **Retrieve:** Quando um novo lead envia mensagem, o sistema gera o embedding da query e busca os top-k documentos mais similares usando cosine similarity no PGVector.

> **Regra de Ouro RAG:** Nunca injetar embeddings brutos no prompt. Sempre usar um reranker para selecionar os 3-5 documentos mais relevantes e formatar como contexto estruturado antes de enviar ao LLM.

**Estrategia de Chunking:** O sistema agrupa mensagens em "turnos conversacionais" delimitados por janelas temporais de ate 24 horas. Cada turno e um chunk. Se exceder 1500 tokens, e subdividido por topicos via classificador lightweight. Cada chunk recebe metadados de: outcome final, sentimento medio, categorias de topico e score de sucesso.

**Configuracao Tecnica RAG:**

| Parametro | Configuracao | Justificativa |
|-----------|-------------|---------------|
| Modelo | text-embedding-3-small | Melhor custo-beneficio para PT-BR |
| Dimensoes | 1536 (small) / 3072 (large) | Trade-off precision vs storage |
| Chunk Size | Ate 1500 tokens por turno | Preserva contexto conversacional |
| Janela Temporal | 24h por chunk | Ciclo completo de atendimento |
| Top-K Retrieve | 3 a 5 documentos | Enriquece sem sobrecarregar prompt |
| Reranker | Cohere Rerank / LLM judge | Seleciona os mais relevantes |
| Storage | PGVector + IVFFlat index | Busca sub-50ms em ate 1M vetores |

### 2.2 Camada 2: Fine-Tuning de Modelos Especificos

Projetada para reducao de custos em alta escala. Uma vez por semana (ou sob demanda com 200+ conversas success=true), o sistema compila logs em arquivos .jsonl e envia para a API de Fine-Tuning da OpenAI, criando um modelo dedicado (gpt-4o-mini fine-tuned) que internaliza o tom e as estrategias da pousada.

**Pipeline de Fine-Tuning - 5 etapas:**

1. **Select:** Seleciona conversas com `outcome=BOOKED` e `toneAlignmentScore > 0.7`.
2. **Format:** Transforma no formato jsonl exigido pela API, com pares user/assistant e contexto minimo.
3. **Validate:** Separa 10% para validacao holdout.
4. **Train:** Submete job via API OpenAI.
5. **Evaluate:** Testa fine-tuned vs base em 50 cenarios. So e promovido se superar o base em 15%+ nas metricas.

**Formato do Dataset (.jsonl):**

```jsonl
{
  "messages": [
    {"role": "system", "content": "<system_prompt_personalizado_da_pousada>"},
    {"role": "user", "content": "Olá, tenho interesse em reservar para o feriado..."},
    {"role": "assistant", "content": "Que otimo! Temos suites disponíveis..."}
  ],
  "metadata": {
    "tenantId": "uuid-da-pousada",
    "outcome": "BOOKED",
    "toneDetected": "informal_carinhoso"
  }
}
```

**Regras de Qualidade do Dataset:**
- Conversas com menos de 4 turnos sao descartadas
- Mensagens maiores que 2000 caracteres sao truncadas
- Conversas com insatisfacao expressa sao excluidas do treinamento positivo
- Tamanho ideal: 500 a 5000 exemplos (sweet spot: ~2000 pares)

**Comparacao Base vs Fine-Tuned:**

| Metrica | Base (GPT-4o-mini) | Fine-Tuned | Melhoria |
|---------|--------------------|------------|----------|
| Custo por 1K tokens (input) | US$ 0.15 | US$ 0.15 | 0% (mesmo custo base) |
| Tokens de system prompt | ~1500 | ~300 | -80% de overhead |
| Custo efetivo por conversa | US$ 0.045 | US$ 0.018 | -60% |
| Tone Alignment Score | 0.72 | 0.89 | +24% |
| Taxa de Conversao (IA) | 18% | 26% | +44% |
| Tempo de Resposta (p95) | 2.1s | 1.4s | -33% |

### 2.3 Complementaridade RAG + Fine-Tuning

As duas camadas se complementam em producao:

1. Mensagem do lead chega
2. Sistema busca via RAG contextos relevantes de conversas anteriores
3. Modelo fine-tuned da pousada gera a resposta usando prompt de sistema + contextos RAG
4. Resposta e enviada ao WhatsApp com tom e estilo internalizados

Este design permite que o sistema mantenha personalizacao mesmo sem fine-tuning (usando RAG puro no inicio) e evolua continuamente conforme mais dados sao acumulados.

---

## 3. Ingestao de Conversas WhatsApp (Voice Cloning Pipeline)

Esta secao descreve o mecanismo pelo qual o ZEHLA extrai o perfil de voz real de um proprietario a partir do seu historico de conversas WhatsApp. O conceito e similar ao de ferramentas como wisprflow.ai: analisar padroes reais de comunicacao para construir um "DNA digital" que permita a IA replicar o estilo, o tom e a estrategia de forma natural.

### 3.1 Metodos de Coleta do Historico

**Metodo Primario - Exportacao Nativa do WhatsApp:**
O proprietario acessa Configuracoes > Conversas > Exportar Conversa no WhatsApp Business, seleciona conversas relevantes com clientes (que resultaram em reservas) e envia o arquivo .txt ao ZEHLA via upload seguro no painel de onboarding.

**Metodo Secundario - API Cloud da Meta:**
Se o proprietario ja utiliza a WhatsApp Business API, o ZEHLA pode solicitar acesso as mensagens historicas via endpoint messages da Graph API (limitado a 6 meses retroativos).

**Metodo Terciario - Bridge de Forward:**
Durante o onboarding, o proprietario encaminha manualmente 30 a 50 conversas representativas para o numero do ZEHLA. O sistema parseriza cada conversa encaminhada e extrai os padroes.

### 3.2 Pipeline de Sanitizacao LGPD

Antes de qualquer processamento, todas as mensagens passam por 5 etapas de sanitizacao:

1. **Deteccao de PII** via regex + NER (Named Entity Recognition) para identificar nomes, telefones, emails, CPFs, enderecos e dados bancarios.
2. **Substituicao por Placeholders** onde cada dado sensivel e trocado por tokens genericos: `[NOME]`, `[TELEFONE]`, `[CPF]`, etc.
3. **Validacao de Consentimento** verificando se o proprietario assinou o Termo de Autorizacao para uso de dados de comunicacao no ML.
4. **Registro de Audit Trail** onde cada operacao de sanitizacao e logada com timestamp e hash da mensagem original.
5. **Descarte Seguro** onde a mensagem original (com dados pessoais) e descartada apos 72 horas, mantendo apenas a versao sanitizada.

### 3.3 Extracao de Features de Voz (Voice Fingerprinting)

O coracao do sistema de Voice Cloning e a engine de extracao de features, que analisa as mensagens sanitizadas e mede atributos linguisticos e comportamentais organizados em 6 dimensoes:

| Dimensao | Atributos Extraidos | Exemplo de Output |
|----------|-------------------|-------------------|
| **Vocabulario** | Frequencia de palavras, termos unicos, regionalismos, gírias | `{"vocab_diversity": 0.72, "top_terms": ["amor", "querido", "refresco"]}` |
| **Ritmo** | Tamanho medio de mensagem, variacao, frequencia de multi-msg | `{"avg_chars": 87, "std_chars": 42, "multi_msg_rate": 0.35}` |
| **Emoji** | Tipo, frequencia, posicao no texto, substituicoes por emoji | `{"emoji_rate": 0.12, "top_emoji": ["\ud83d\ude0a", "\ud83d\ude4c", "\ud83c\udfd6\ufe0f"]}` |
| **Saudacao** | Forma de abrir conversa, horarios, personalizacao | `{"greeting_style": "informal_first_name", "time_aware": true}` |
| **Negociacao** | Estrategia de desconto, urgencia, comparacao, follow-up | `{"discount_style": "soft_comparison", "urgency_freq": 0.08}` |
| **Encerramento** | Forma de fechar, CTA frequente, promessa de retorno | `{"closing_cta_rate": 0.65, "next_step_freq": 0.45}` |

#### Indice de Formalidade

Um dos indicadores mais importantes e o Indice de Formalidade (0 a 1), calculado pela analise combinada de 5 fatores:

1. Uso de pronome de tratamento (voce vs senhor/a)
2. Presenca de abreviaturas formais (Sr., Sra., Prezado/a)
3. Uso de pontuacao rigorosa vs casual (multiplos pontos de exclamacao)
4. Vocabulario tecnico vs coloquial
5. Uso de emojis e emoticons

**Mapeamento para Tone Thermometer:**

| Indice | Arquetipo Tone Thermometer |
|--------|---------------------------|
| 0.0 - 0.3 | Amigao de Infancia |
| 0.3 - 0.5 | Anfitriiao Carinhoso |
| 0.5 - 0.7 | Conselheiro Local |
| 0.7 - 0.85 | Gestor Eficiente |
| 0.85 - 1.0 | Gerente 5 Estrelas |

#### Padroes de Resposta Temporal

- **Tempo Medio de Primeira Resposta (time-to-first-reply):** Calculado a partir dos timestamps das conversas exportadas.
- **Padrao de Agrupamento de Mensagens:** Mede se o proprietario envia mensagens longas unicas ou varias curtas em sequencia.
- **Horario de Pico de Atendimento:** Identifica periodos de maior atividade para replicar disponibilidade.
- **Padrao de Follow-up:** Intervalo tipico entre proposta e proximo contato proativo.

### 3.4 Geracao do Perfil de Voz Estruturado (Voice Profile Document)

Apos extracao de features, o sistema compila o Voice Profile Document (JSON estruturado) composto por 4 secoes:

1. **Diretrizes de Tom** geradas a partir do Indice de Formalidade e vocabulario extraido
2. **Padroes de Saudacao e Encerramento** baseados nas mensagens de abertura/fechamento mais frequentes
3. **Vocabulario Preferido e Termos a Evitar** extraidos por frequencia e sentimento
4. **Estrategias de Negociacao** identificadas pelo padrao de discurso persuasivo

> **Integracao com DNA Wizard:** O Voice Profile gerado automaticamente preenche os campos do Tone Thermometer do DNA Wizard. O proprietario pode validar, ajustar ou refinar cada parametro durante o onboarding, criando um perfil hibrido: dados reais + preferencias explicitas.

---

## 4. Voice Fingerprinting: Tecnicas Avancadas

### 4.1 Extracao de Sentimento por Turno

Cada turno conversacional e analisado por BERTimbau (BERT fine-tuned para portugues brasileiro) que atribui pontuacao de -1 a +1. Alem do sentimento geral, sao extraidas 3 dimensoes:

- **Empatia:** Frequencia de frases que demonstram compreensao ("Entendo sua preocupacao", "Sei como e importante")
- **Entusiasmo:** Adjectives positivos, emojis, pontuacao exclamativa
- **Proatividade:** Frequencia com que o proprietario antecipa proximos passos e faz ofertas espontaneas

Estas 3 dimensoes formam o "Triangulo Emocional" injetado no system prompt.

### 4.2 Analise de Topicos com LDA

O sistema utiliza LDA (Latent Dirichlet Allocation) para identificar topicos recorrentes. Topicos tipicos de pousadas: disponibilidade de datas, preco e pagamento, localizacao, atrativos turisticos, servicos inclusos, politicas de cancelamento, atividades recomendadas. A distribuicao de topicos prioriza abordagens proativas do agente.

### 4.3 Detecao de Estrategias de Conversao

O sistema analisa conversas com `outcome=BOOKED` e identifica padroes correlacionados com sucesso, classificados em 4 categorias:

1. **Ganchos de Abertura:** Frases que geram engajamento imediato ("Que otimo que voce nos encontrou! Temos datas disponiveis para o feriado")
2. **Construtores de Confianca:** Elementos que reduzem hesitacao ("Temos mais de 500 avaliacoes positivas no Booking", "Sou a Maria, estarei pessoalmente a recebe-lo")
3. **Gatilhos de Urgencia Natural:** Escassez sem agressividade ("Temos apenas 2 suites disponiveis para esse final de semana")
4. **Fechamento Suave:** Conducao a reserva sem pressao ("Posso fazer uma reserva provisoria sem compromisso?")

Cada estrategia recebe um **Score de Eficacia** (proporcao de aparicoes em conversas bem-sucedidas vs total). Apenas estrategias com score > 0.3 e presentes em 5+ conversas distintas sao incorporadas ao perfil ativo.

### 4.4 Validacao do Perfil Gerado

Processo de validacao em 3 etapas:

1. **Consistencia Interna:** Verifica se atributos sao mutuamente consistentes (alto Indice de Formalidade nao deveria coexistir com alta frequencia de emojis)
2. **Comparacao com DNA Wizard:** Compara respostas do formulario com dados extraidos. Divergencias > 20% geram prompt de reconciliacao
3. **Teste de Turing Parcial:** Sistema gera 10 respostas simuladas para avaliacao do proprietario (escala 1-5). Media deve ser >= 3.5 para aprovacao

---

## 5. Pipeline de Feedback e Conversao

Nenhuma resposta da IA deve ir para o vazio. Este e o principio do loop de feedback obrigatorio: cada interacao e pareada com um mecanismo de rastreamento de resultado.

### 5.1 Interface MLInteractionLog

```typescript
interface MLInteractionLog {
  tenantId: string;              // Identificador unico da pousada
  leadId: string;                // Identificador unico do lead/hospede
  threadHistory: Message[];      // Historico completo da conversa (sanitizado)
  outcome: 'BOOKED' | 'LOST' | 'PENDING' | 'IGNORED';
  confidenceScore: number;       // Score de confianca do modelo (0-1)
  modelUsed: string;             // gpt-4o-mini, ft-pousada-xyz, etc.
  ragDocumentsUsed: UUID[];      // IDs dos documentos RAG injetados
  toneAlignmentScore: number;    // Cosine similarity com perfil de voz esperado
  responseTimeMs: number;        // Tempo total de processamento
  vectorsGenerated: boolean;     // Se embeddings foram gerados nesta interacao
  feedbackManual?: 'THUMBS_UP' | 'THUMBS_DOWN' | null;  // Feedback do dono
  createdAt: DateTime;           // Timestamp da interacao
}
```

### 5.2 Mecanismo de Pontuacao - 3 Niveis

- **Nivel 1 (Outcome Binary):** +1 para conversas que resultaram em reserva, -1 para perdidas. Sinal mais forte de aprendizado.
- **Nivel 2 (Tone Alignment):** Distancia semantica (cosine similarity) entre resposta gerada e respostas tipicas do proprietario. Scores < 0.5 marcam "fora de tom".
- **Nivel 3 (Lead Progression):** Mede se a interacao avancou o lead no funil (de "primeiro contato" para "cotacao enviada"). Util para conversas pendentes com progresso.

### 5.3 Feedback Ativo do Proprietario

Dois mecanismos complementares:

1. **Painel de Revisao de Conversas** no ZCC: proprietario avalia cada resposta com thumbs up/down
2. **Correcao em Tempo Real:** Quando o proprietario assume manualmente uma conversa do agente, o sistema registra o ponto de intervencao e analisa a diferenca entre o que o agente disse e o que o proprietario disse a seguir. Estas correcoes entram com peso **3x** no dataset de fine-tuning em relacao as interacoes automaticas.

---

## 6. Integracao com DNA Wizard e Insights Engine

### 6.1 Tone Thermometer: Entrada e Saida ML

O Tone Thermometer opera como interface entre preferencias explicitas do proprietario e dados implicitos do ML Brain. Quando o proprietario seleciona um arquetipo durante o onboarding, essa selecao define os parametros iniciais do system prompt. Porem, o ML Brain pode ajustar dinamicamente com base nos dados reais.

Exemplo: se o proprietario se classificou como "Gestor Eficiente" mas a analise revela Indice de Formalidade de 0.35 (mais proximo de "Anfitriiao Carinhoso"), o sistema sugere reconciliacao e ajusta para modelo hibrido.

As 6 dimensoes do Tone Thermometer (Vocabulario, Empatia, Urgencia, Formalidade, Proatividade, Humor) sao recalibradas a cada 100 novas conversas. Desvio > 15% em qualquer dimensao notifica o proprietario no ZCC.

### 6.2 Discount Keys: ML-Powered Pricing Intelligence

O sistema analisa historicamente quais chaves de desconto foram mais eficazes e em quais contextos. Exemplo: se a "Chave Temporada" tem conversao de 42% quando usada nos primeiros 3 dias, mas apenas 15% apos o dia 5, o sistema ajusta automaticamente a janela de ativacao.

O Insights Engine complementa com dados de elasticidade de preco: o ML estima a curva de demanda e identifica o "sweet spot" de desconto que maximiza receita (nao apenas ocupacao). Exposto ao agente como diretrizes contextuais:

> "Para este lead especifico, o desconto maximo sugerido e 12% com base no perfil historico de conversoes desta pousada para este tipo de quarto nesta epoca do ano."

### 6.3 Insights Engine: Dos Dados ao ML

Os 12 insights sao gerados a partir de queries sobre o banco de vetores e o MLInteractionLog:

- **Palavra-Gatilho:** Termo que mais frequentemente aparece em conversas BOOKED (ex: "cafe da manha artesanal")
- **Hora de Ouro:** Janela de 2 horas com maior taxa de conversao (via timestamps)
- **Temperatura de Preco:** Sensibilidade ao preco por tipo de quarto e epoca

O Insights Engine roda diariamente via cron job, compilando dados das ultimas 24 horas e atualizando os 12 insights no perfil da pousada como cards acionaveis no ZCC.

---

## 7. Cognitive Observability e ZCC

Todo modelo utilizado pelo ZEHLA deve emitir logs para a interface de Cognitive Observability do ZCC. Cada decisao da IA deve ser transparente, rastreavel e auditavel.

### 7.1 Metricas Principais

| Metrica | Fonte de Dados | Alerta Threshold | Frequencia |
|---------|---------------|-------------------|------------|
| Taxa de Conversao IA | MLInteractionLog.outcome | < 10% em 7 dias | Real-time + Diario |
| Tone Alignment Score | Embedding cosine sim | < 0.5 por 24h | Real-time |
| Model Drift Index | Prediction vs Outcome | > 0.3 em 7 dias | Semanal |
| Response Latency p95 | responseTimeMs | > 3000ms | Real-time |
| Handoff Rate | Transfer events | > 30% em 7 dias | Diario |
| Lead Temperature | Lead.stage distribution | > 60% "frio" por 5 dias | Diario |

### 7.2 Componente CognitiveObservability.tsx

O componente deve implementar:

1. **Cards de resumo** com valor atual, variacao percentual semanal e badge de status (verde/amarelo/vermelho)
2. **Grafico de linha temporal** para cada metrica com comparacao semana-a-semana
3. **Tabela de ultimas interacoes** com score de alinhamento, outcome e modelo utilizado
4. **Botao de drill-down** que exibe prompt completo e documentos RAG injetados para qualquer interacao
5. **Painel de alertas** com recomendacoes automaticas de acao

---

## 8. Model Drift Detection e Zehla Guardian

O drift de modelo e um dos maiores riscos em sistemas de ML em producao. O Zehla Guardian opera em 3 niveis de deteccao e 4 niveis de resposta automatica.

### 8.1 Tipos de Drift Detectados

- **Data Drift:** Mudancas na distribuicao das mensagens recebidas (novos topicos, vocabulario diferente). Medido via Population Stability Index (PSI) semanal. PSI > 0.2 = drift moderado, > 0.5 = severo.
- **Concept Drift:** Mudancas na relacao entre features e outcomes (estrategia que funcionava no verao para de funcionar no inverno). Monitora divergencia entre predicoes e outcomes reais.
- **Performance Drift:** Degradacao nas metricas de negocio. Compara medias moveis de 7 dias com medias dos 30 dias anteriores.

### 8.2 Niveis de Resposta do Guardian

| Nivel | Condicao | Acao Automatica | Notificacao |
|-------|----------|----------------|-------------|
| **Verde (Normal)** | Todas as metricas dentro do threshold | Nenhuma. Operacao normal. | Nenhuma |
| **Amarelo (Atencao)** | 1 metrica fora do threshold por 24h | Log de warning. Coleta de dados intensificada. | Email ao suporte ZEHLA |
| **Laranja (Alerta)** | 2+ metricas fora do threshold por 48h | Fallback para modelo base. Resposta mais conservadora. | Push + Email ao proprietario |
| **Vermelho (Critico)** | Tone alignment < 0.3 ou drift severo (PSI>0.5) | Agente desativado. 100% transferido para humano. | Push + Email + SMS ao proprietario |

### 8.3 Auto-Recovery

Quando drift e detectado no nivel amarelo:
1. Sistema agenda automaticamente ciclo de re-treinamento com dados das ultimas 2 semanas
2. Se re-treinamento resolver o drift, modelo atualizado e promovido sem intervencao humana
3. Se drift persistir apos re-treinamento, escala para nivel laranja e solicita revisao manual

---

## 9. Isolamento Multi-Tenant

Isolamento rigoroso entre tenants e requisito nao negociavel, tanto por LGPD quanto por qualidade.

### 9.1 4 Camadas de Isolamento

| Camada | Implementacao |
|--------|--------------|
| **Dados** | Todas as queries incluem `tenantId`. Prisma middleware (`tenantGuard`) injeta filtro automaticamente |
| **Embeddings** | Cada tenant possui namespace proprio no PGVector. Toda query inclui filtro de metadata |
| **Modelos** | Cada pousada com fine-tuning tem modelo dedicado com ID unico (`ft-pousada-{tenantId}`). LLM Router seleciona automaticamente |
| **Prompts** | Cada tenant possui system prompt proprio no banco. Cacheado em Redis com TTL de 5 minutos |

> **Regra de Ouro Multi-Tenant:** Nunca consultar embeddings, modelos ou prompts sem o filtro tenantId. O tenantGuard middleware garante isso em nivel de banco, mas todo acesso direto ao PGVector ou a modelos fine-tuned tambem deve incluir verificacao explicita.

---

## 10. Privacidade e LGPD no Contexto ML

### 10.1 Cinco Pilares de Privacidade ML

1. **Consentimento Especifico para ML:** Termo de consentimento com clausula explicita e separada autorizando uso de conversas para treinamento de IA. Sem consentimento, ML Brain opera apenas com RAG (sem fine-tuning).
2. **Anonimizacao Pre-Vetorizacao:** Pipeline de PII detection e substituicao antes de gerar embeddings. Mapeamento PII-anonimizado mantido apenas 72h para debug, depois descartado.
3. **Direito ao Esquecimento ML:** Se proprietario solicita exclusao (LGPD Art. 18), o sistema remove: (a) embeddings do PGVector, (b) modelo fine-tuned via API, (c) caches de prompt no Redis. Processo concluido em ate 24h.
4. **Minimizacao de Dados:** Mensagens com `outcome=IGNORED` descartadas apos 30 dias. Embeddings de conversas com 6+ meses e sem conversao sao arquivados em cold storage.
5. **Audit Trail Completo:** Cada operacao de ML (geracao de embedding, fine-tuning, atualizacao de perfil) e registrada com: operador, tenantId, tipo de dado, timestamp e hash de verificacao. Mantido por 24 meses.

### 10.2 Pipeline de Sanitizacao de Dados

Regex + NER (spaCy para portugues) detectam e substituem:

| Tipo de Dado | Metodo de Deteccao |
|-------------|-------------------|
| Nomes proprios | NER (threshold confianca 0.85) |
| Telefones brasileiros | Regex (+55 XX XXXXX-XXXX e variantes) |
| CPF | Regex com validacao de digitos verificadores |
| Emails | Regex RFC 5322 |
| Enderecos | NER + regex de CEP |
| Dados bancarios | Regex especificas (agencia, conta, cartao) |
| Placa de veiculo | Regex (formato mercosul e antigo) |

---

## 11. Comandos do Agente de Desenvolvimento

### 11.1 Implementacao do Feedback Loop

Ao modificar `llm-router.ts` ou qualquer componente de IA:

1. Verificar que toda resposta do LLM dispara registro no MLInteractionLog antes de ser enviada ao WhatsApp
2. Garantir que `toneAlignmentScore` e calculado em tempo real (embedding da resposta vs embedding do perfil de voz)
3. Confirmar que `outcome` e atualizado por webhook quando reserva e criada/cancelada
4. Validar que `tenantGuard` middleware esta ativo em todas as operacoes de banco relacionadas a ML

### 11.2 Exportacao para Fine-Tuning

Script: `scripts/ml-training/export-training-data.ts`

```bash
# Execucao semanal via cron job (todas as pousadas)
npx tsx scripts/ml-training/export-training-data.ts

# Execucao manual para pousada especifica
npx tsx scripts/ml-training/export-training-data.ts --tenant-id <uuid>
```

O script seleciona conversas com `outcome=BOOKED` e `toneAlignmentScore >= 0.7`, formata em jsonl, valida integridade e faz upload para bucket seguro. Gera relatorio com: numero de exemplos, distribuicao de sentimento, cobertura de topicos e qualidade do dataset.

### 11.3 Atualizacao do CognitiveObservability

Ao adicionar novas metricas:

1. Adicionar metrica ao schema MLInteractionLog se necessario
2. Atualizar endpoint `/api/ml/metrics`
3. Adicionar card correspondente no `CognitiveObservability.tsx` com grafico e thresholds
4. Documentar metrica no ZCC com descricao, formula de calculo e acao recomendada

### 11.4 Scripts ML Disponiveis

| Script | Localizacao | Funcao | Frequencia |
|--------|------------|--------|------------|
| `export-training-data.ts` | `scripts/ml-training/` | Exporta conversas para fine-tuning | Semanal (cron) |
| `generate-voice-profile.ts` | `scripts/ml-training/` | Gera Voice Profile a partir de conversas | On-demand |
| `run-fine-tuning.ts` | `scripts/ml-training/` | Submete job de fine-tuning a API OpenAI | Semanal (cron) |
| `evaluate-model.ts` | `scripts/ml-training/` | Avalia modelo fine-tuned vs base | Apos treinamento |
| `detect-drift.ts` | `scripts/ml/` | Calcula PSI e detecta data/concept drift | Diario (cron) |
| `cleanup-old-embeddings.ts` | `scripts/ml/` | Remove embeddings com mais de 6 meses | Mensal (cron) |
| `sanitization-pipeline.ts` | `scripts/ml/` | Executa pipeline de PII detection | Real-time (middleware) |

---

## 12. Roadmap de Implementacao

A implementacao segue um roadmap de 16 semanas em 4 fases progressivas:

| Fase | Semanas | Entregavel Principal | Criterio de Aceitacao |
|------|---------|---------------------|----------------------|
| **Fase 1: RAG Foundation** | 1-4 | Pipeline de embeddings + busca semantica | Busca sub-200ms, top-3 relevantes |
| **Fase 2: Voice Cloning** | 5-8 | Pipeline de analise de conversas + Voice Profile | Perfil gerado com 6 dimensoes |
| **Fase 3: Fine-Tuning** | 9-12 | Pipeline de treinamento + deploy de modelos | Modelo fine-tuned supera base em 15% |
| **Fase 4: Guardian** | 13-16 | Drift detection + auto-remediation + observability | Drift detectado em < 24h, recovery automatico |

### Fase 1: RAG Foundation (Semanas 1-4)

- **Semana 1:** Setup do PGVector, schema de embeddings, middleware de sanitizacao PII, service de embedding (OpenAI wrapper com retry e rate limiting)
- **Semana 2:** Pipeline de ingestao de conversas (Capture + Enrich), parser de arquivos .txt do WhatsApp, integracao com event pipeline existente
- **Semana 3:** Busca semantica (Retrieve) com reranker, integracao com llm-router para injecao de contexto RAG, testes com 50 cenarios simulados
- **Semana 4:** MLInteractionLog basico, metricas de Tone Alignment Score, deploy em staging com 3 pousadas piloto

### Fase 2: Voice Cloning (Semanas 5-8)

- **Semana 5:** Voice Fingerprinting completo (6 dimensoes), parser avancado de conversas, calculo do Indice de Formalidade
- **Semana 6:** Analise de sentimento por turno (BERTimbau), extracao de topicos com LDA, deteccao de estrategias de conversao
- **Semana 7:** Geracao automatica do Voice Profile Document, integracao com DNA Wizard, fluxo de validacao pelo proprietario
- **Semana 8:** Teste de Turing Parcial (10 cenarios), refinamentos baseados em feedback dos pilotos

### Fase 3: Fine-Tuning (Semanas 9-12)

- **Semana 9:** Script de exportacao para fine-tuning, integracao com API OpenAI Fine-Tuning, pipeline de submissao
- **Semana 10:** Script de avaliacao (base vs fine-tuned em 50 cenarios), pipeline de promocao para producao (A/B testing), rollback automatico
- **Semana 11:** LLM Router com selecao automatica de modelo por tenant, cache de modelos no Redis, fallback graceful
- **Semana 12:** Cron job semanal de treinamento automatico, otimizacao de custos, deploy em producao

### Fase 4: Guardian (Semanas 13-16)

- **Semana 13:** Calculo de PSI para data drift, deteccao de concept drift, deteccao de performance drift
- **Semana 14:** 4 niveis de resposta do Zehla Guardian, auto-recovery com re-treinamento automatico, notificacoes multi-canal
- **Semana 15:** CognitiveObservability.tsx completo (6 metricas real-time, graficos interativos, drill-down, alertas)
- **Semana 16:** Testes de integracao end-to-end, stress test (1000 conversas simultaneas), audit LGPD, documentacao final
