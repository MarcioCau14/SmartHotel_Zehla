# CAMPO AKASHICO ZEHLA — O Subconsciente Vivo do SmartHotel

## Documento Arquitetural Completo

**Versao**: 1.0
**Data**: 11 de junho de 2026
**Autoria**: Agente ZEHLA OS — Deep Architecture
**Classificacao**: CONFIDENCIAL — Tecnologia Nuclear ZEHLA

---

## 0. Prefacio — O que e o Campo Akashico

Na cosmologia esoterica, o "Campo Akashico" e um registro universal que armazena
todas as experiencias, pensamentos e emocoes ja vividos — um campo de informacao
que conecta tudo e esta sempre disponivel para quem sabe acessa-lo.

No ZEHLA, o Campo Akashico e a camada de memoria profunda que vive no centro
do sistema, entre o ZCC (ZEHLA Command Center) e o cerebro, armazenando:

- Toda experiencia real de hospedes (conversas, preferencias, reclamacoes, elogios)
- Todo conhecimento operacional acumulado (politicas, procedimentos, sazonalidade)
- Todo aprendizado de maquina derivado (padroes, insights, previsoes)
- Toda historia de decisoes e seus resultados (o que funcionou, o que nao funcionou)
- Todas as interacoes entre hospedes e o cerebro (que perguntas, que respostas, com que resultado)

NAO e um simples banco de dados. E um **organismo vivo de memoria** que:

1. Absorve informacoes automaticamente (sem intervencao humana)
2. Processa e cristaliza conhecimento (transforma dados brutos em sabedoria)
3. Aprende continuamente (melhora com cada interacao)
4. Preve e antecipa (usa padroes passados para prever o futuro)
5. Se protege (memoria blindada, encriptada, isolada por pousada)
6. Responde em milissegundos (cache quente + indexacao hibrida)

---

## 1. Visao Arquitetural — Onde o Akashico Vive

```
                          ZEHLA OS — COGNITIVE HOSPITALITY
┌─────────────────────────────────────────────────────────────────┐
│                        ZCC (Command Center)                      │
│   ┌──────────────────────────────────────────────────────────┐   │
│   │  Dashboard │ Analytics │ Predictions │ Alerts │ Settings  │   │
│   └─────────────────────────┬────────────────────────────────┘   │
│                             │                                     │
│                    ┌────────▼────────┐                             │
│                    │  CAMPO AKASHICO │ ◄──► NUCLEO COGNITIVO      │
│                    │  (Subconsciente)│                             │
│                    └────────┬────────┘                             │
│                             │                                     │
│  ┌──────────┬───────────────┼───────────────┬──────────┐          │
│  │ Pilar 1  │ Pilar 2       │ Pilar 3       │ Pilar 4   │ Pilar 5 │
│  │ Cortex   │ Memoria       │ Router        │ Topologia  │ Agentic │
│  │ AutoEvo  │ Blindada      │ NeuroEcon     │ Raciocinio │ Memory  │
│  │ DSPy/GEPA│ EWC-DR        │ Thompson/CAD  │ GraphRAG   │ A-MEM   │
│  └──────────┴──────┬────────┴──────┬────────┴──────────┘          │
│                    │               │                               │
│         ┌──────────▼───────────────▼──────────┐                    │
│         │    WHISPER STREAM (Ingestao Real)     │                    │
│         │  Redis Streams + Event Sourcing       │                    │
│         └──────────────────────────────────────┘                    │
│                                                                   │
│  ┌────────────────────────────────────────────────────────┐       │
│  │  CANAIS DE ENTRADA (Fontes de Memoria Viva)            │       │
│  │  WhatsApp │ Instagram │ Booking │ Reviews │ ZCC Chat   │       │
│  └────────────────────────────────────────────────────────┘       │
└─────────────────────────────────────────────────────────────────┘
```

### O Akashico NAO e um novo pilar. E a "cola" entre todos os pilares.

Ele se alimenta de todos e devolve inteligencia cristalizada para todos.

---

## 2. As 4 Camadas do Campo Akashico

O campo e estruturado em 4 camadas concêntricas, cada uma com funcao,
tecnologia e tempo de acesso distintos:

```
╔══════════════════════════════════════════════════════╗
║  CAMADA 4: AKASHA RAIZ (Deep Memory)                  ║
║  Sabedoria cristalizada — insights de alto nivel       ║
║  Tecnologia: ChromaDB + NetworkX Graph                ║
║  Acesso: ~10ms (hibrido vector + PPR)                 ║
║  Retencao: Permanente (nunca esquece)                  ║
║  Uso: Decisoes estrategicas, previsoes, aprendizado    ║
╠══════════════════════════════════════════════════════╣
║  CAMADA 3: AKASHA FLUIDO (Working Memory)              ║
║  Contexto ativo — memorias operacionais em uso         ║
║  Tecnologia: Redis Hash + SQLite WAL                   ║
║  Acesso: ~2ms (cache quente)                           ║
║  Retencao: 30 dias ativo, depois cristaliza            ║
║  Uso: Respostas ao hospede, decisoes operacionais      ║
╠══════════════════════════════════════════════════════╣
║  CAMADA 2: AKASHA ECOICO (Episodic Memory)             ║
║  Experiencias vividas — cada interacao hospede         ║
║  Tecnologia: SQLite WAL (append-only log)              ║
║  Acesso: ~5ms (range scan + index)                    ║
║  Retencao: 90 dias ativo, resumo cristalizado           ║
║  Uso: Historico, padroes, recuperacao de contexto       ║
╠══════════════════════════════════════════════════════╣
║  CAMADA 1: AKASHA SUTIL (Ingestion Buffer)             ║
║  Impressoes brutas — dados que acabaram de chegar       ║
║  Tecnologia: Redis Streams (append-only)                ║
║  Acesso: ~0.5ms (stream read)                          ║
║  Retencao: 24h (depois processa e promove)             ║
  Uso: Buffer temporario, deduplicacao, normalizacao     ║
╚══════════════════════════════════════════════════════╝
```

---

## 3. Tipos de Memoria Armazenados

### 3.1 Memoria Episodica (Experiencias Vivas)

Cada interacao com um hospede gera uma "episodica":

```python
@dataclass
class AkashicEpisode:
    episode_id: str           # UUID v7 (time-ordered)
    timestamp: datetime      # Momento exato da experiencia
    pousada_id: str          # Isolamento por pousada
    source_channel: str      # "whatsapp", "instagram", "booking", "zcc", "review"
    
    # Conteudo da experiencia
    guest_id: Optional[str]  # Hospede identificado (se conhecido)
    guest_profile: Optional[str]  # "hospede_romantico", "familiar_lazer", etc.
    input_text: str          # O que o hospede disse/preguntou
    intent_classified: str   # Bucket CADMAS (ex: "faq_hours_operating")
    ai_response: str          # O que o cerebro respondeu
    provider_used: str        # Qual LLM atendeu
    tier_used: int            # Nivel de esforco
    
    # Resultado da interacao
    outcome: str              # "resolved", "escalated", "unresolved", "positive_feedback"
    sentiment_after: float   # -1.0 a 1.0 (sentimento apos interacao)
    duration_ms: int         # Duracao da interacao
    tokens_used: int         # Custo token da interacao
    
    # Metadata para aprendizado
    seasonality: str         # "alta_temporada", "baixa_temporada", "feriado"
    weather_context: Optional[str]  # "chuva", "sol", "frio" (via API meteo)
    occupancy_at_time: float # Ocupacao da pousada no momento (0.0-1.0)
    cadmas_bucket: int       # Bucket 0-31
    was_sticky: bool         # Se o hospode continuou na mesma sessao
```

### 3.2 Memoria Semantica (Conhecimento Cristalizado)

Extraida automaticamente das experiencias vividas:

```python
@dataclass
class AkashicKnowledge:
    knowledge_id: str
    crystalized_at: datetime
    source_episodes: List[str]  # IDs dos episodios que geraram este conhecimento
    pousada_id: str
    pousada_scope: str  # "specific" (so esta pousada) ou "global" (aprende com todas)
    
    # Conteudo
    category: str  # "insight", "pattern", "preference", "anomaly", "prediction"
    title: str
    content: str
    confidence: float  # 0.0-1.0 (baseado em frequencia e consistencia)
    
    # Proveniencia
    occurrence_count: int     # Quantas vezes este padrao apareceu
    first_seen: datetime
    last_seen: datetime
    
    # Grafos
    embedding: List[float]    # Para busca vetorial
    graph_node_id: str        # Para busca em knowledge graph
    
    # Impacto
    actionable: bool          # Se gera acao automatica
    action_suggested: Optional[str]  # "aumentar_preco_suite", "enviar_promo_ferias"
    zcc_alert_level: str      # "info", "warning", "critical"
```

### 3.3 Memoria Preditiva (Antecipacoes)

```python
@dataclass
class AkashicPrediction:
    prediction_id: str
    created_at: datetime
    pousada_id: str
    prediction_type: str  # "demand", "churn_risk", "price_optimal", "complaint_likely"
    
    # Conteudo
    predicted_value: float
    confidence: float
    prediction_window: str  # "7d", "14d", "30d"
    
    # Base
    based_on_episodes: List[str]
    based_on_knowledge: List[str]
    features_used: Dict[str, float]  # Feature importance
    
    # Resultado (pos-facto)
    actual_value: Optional[float]
    was_correct: Optional[bool]
    error_magnitude: Optional[float]
```

---

## 4. Whisper Stream — O Rio de Entrada Viva

O Whisper Stream e o sistema de ingestao que captura TUDO que acontece
e canaliza para o campo akashico:

### 4.1 Canais de Captura

```
WHISPER_STREAM (Redis Streams)
│
├── canal:whatsapp       → Mensagens de hospedes via WhatsApp Business API
├── canal:instagram      → DMs, comentarios, stories mencionados
├── canal:booking        → Reservas, modificacoes, cancelamentos
├── canal:reviews        → Google Reviews, Booking.com, TripAdvisor
├── canal:zcc_chat       → Conversas no ZCC (dono de pousada)
├── canal:email          → Emails recebidos
├── canal:checkin        → Eventos de check-in/check-out
├── canal:payment        → Pagamentos, estornos, reembolsos
├── canal:weather        → Dados meteorologicos (API externa)
├── canal:occupancy      │→ Atualizacao de ocupacao em tempo real
└── canal:system         → Logs internos, erros, alertas
```

### 4.2 Pipeline de Processamento

```
Evento Bruto (Redis Stream)
    │
    ▼  [0.5ms] Camada 1: Buffer Sutil
Normalizacao + Deduplicacao
    │
    ▼  [~50ms] Classificacao CADMAS-CTX
Bucket 0-31 + Sentimento + Intent
    │
    ▼  [~100ms] Enriquecimento
Lookup de hospede (Redis), sazonalidade, ocupacao atual
    │
    ▼  [~5ms] Camada 2: Episodica (SQLite WAL append)
Armazena episodio completo
    │
    ▼  [~2ms] Camada 3: Fluida (Redis Hash atualizacao)
Atualiza working memory do hospede + pousada
    │
    ▼  [Async] Cristalizacao (Batch - a cada 15min ou 50 episodios)
    │
    ├── Extrai padroes (frequencia, correlacoes)
    ├── Gera insights (regras, preferencias, anomalias)
    ├── Atualiza Knowledge Graph (NetworkX)
    ├── Re-indexa embeddings (ChromaDB)
    └── Gera previsoes (Thompson Sampling + ML)
         │
         ▼  [~10ms] Camada 4: Akasha Raiz
    Armazena conhecimento cristalizado permanentemente
```

---

## 5. Como o Akashico Aprende — O Ciclo de Cristalizacao

O processo de aprender nao e simplesmente "salvar dados". E um ciclo de
transformacao que vai de dados brutos ate sabedoria acionavel:

### 5.1 Ciclo de 4 Fases

```
FASE 1: OBSERVAR (Ingestao)
─────────────────────────────
Captura eventos brutos dos canais.
Armazena como episodios na Camada 2.
Sem filtragem, sem julgamento — absorve tudo.

FASE 2: PERCEBER (Processamento)
─────────────────────────────────
Agrupa episodios similares.
Identifica padroes repetitivos.
Calcula estatisticas (frequencia, correlacao, tendencia).
Detecta anomalias (o que foge do padrao).

FASE 3: ENTENDER (Cristalizacao)
─────────────────────────────────
Transforma padroes em conhecimento.
Gera insights acionaveis.
Cria links no knowledge graph.
Calcula confianca de cada insight.
Decide se e conhecimento global ou especifico.

FASE 4: AGIR (Integracao)
───────────────────────────
Atualiza A-MEM com novas notas atomicas.
Ajusta Thompson Sampling priors com base em resultados.
Gera alertas para o ZCC.
Sugere acoes automaticas.
Realimenta o CADMAS-CTX com novos contextos.
```

### 5.2 Exemplos de Aprendizado Automatico

**Exemplo 1: Descoberta de Preferencia**
```
Episodios: 12 hospedes perguntam "tem estacionamento?" em janeiro
Percep: 8 de 12 reservaram apos confirmacao de estacionamento
Entendimento: Insight cristalizado — "Hospedes em janeiro dao alta prioridade
             a estacionamento. Mencionar estacionamento em respostas de janeiro
             aumenta conversao em 67%"
Acao: A-MEM atualizado com nota PREFERENCE. CADMAS ajustado para janeiro.
      ZCC alerta: "Atencao: mencionar estacionamento em respostas de janeiro"
```

**Exemplo 2: Previsao de Demanda**
```
Episodios: Ocupacao 85% em feriados de 2024, 92% em 2025, tendencia de alta
Percep: Correlacao com buscas online + 14 dias de antecedencia
Entendimento: Predicao cristalizada — "Probabilidade 87% de ocupacao >90% no
             proximo feriado de 3 dias. Recomendado: preco premium +30%"
Acao: ZCC dashboard mostra predicao. Dono decide aplicar ou nao.
      Apos resultado, o Akashico aprende se acertou.
```

**Exemplo 3: Anomalia de Reclamacao**
```
Episodios: 3 reclamacoes de barulho em 2 semanas (media: 0.5/mes)
Percep: Todas no Quarto 204, todas sabados a noite
Entendimento: Anomalia detectada — "Quarto 204 tem problema de barulho
             sabados a noite. Provavelmente causado por evento no salao ao lado."
Acao: ZCC alerta CRITICAL. Sugestao: relocar hospedes do 204 sabados.
      Acao automatica: nao reservar 204 sabados ate resolver.
```

---

## 6. Integracao com os 7 Aneis de Consciencia

```
ANEL 1 — PERCEPCAO (Input)
    │  O Whisper Stream captura eventos de todos os canais
    │  → AkashicEpisode criado automaticamente
    │
ANEL 2 — ATENCAO (Classification)
    │  CADMAS-CTX classifica bucket + sentimento
    │  → Camada 2 armazena episodio classificado
    │
ANEL 3 — MEMORIA (Storage)
    │  Camada 1 → 2 → 3 (promocao automatica)
    │  → Memoria operacional disponivel em <5ms
    │
ANEL 4 — RACIOCINIO (Processing)
    │  Ciclo de cristalizacao: Observar → Perceber → Entender
    │  → Knowledge Graph atualizado
    │  → Insights gerados
    │
ANEL 5 — DECISAO (Prediction)
    │  Thompson Sampling usa historico do Akashico como priors
    │  → Previsoes de demanda, churn, precos
    │
ANEL 6 — ORQUESTRACAO (Action)
    │  Agentes ZEHLA consultam Akashico antes de agir
    │  → A-MEM enriquecido com notas cristalizadas
    │  → ZCC recebe alertas e sugestoes
    │
ANEL 7 — METACOGNICAO (Evolution)
       Ciclo de feedback: resultado da acao alimenta novo episodio
       → EWC-DR protege conhecimento critico
       → GEPA otimiza prompts com base em outcomes
       → Akashico ajusta confiancas
```

---

## 7. Seguranca — A "Formula da Coca-Cola"

O Campo Akashico contem os dados mais valiosos do sistema:
preferencias de hospedes, padroes de precificacao, estrategia competitiva.
Proteger isso e tao importante quanto a formula da Coca-Cola.

### 7.1 Isolamento Multi-Tenant

```
Pousada A    Pousada B    Pousada C
    │            │            │
    ▼            ▼            ▼
┌─────────┐ ┌─────────┐ ┌─────────┐
│ SQLite  │ │ SQLite  │ │ SQLite  │   ← Episodicas isoladas
│ WAL     │ │ WAL     │ │ WAL     │
└────┬────┘ └────┬────┘ └────┬────┘
     │           │           │
     ▼           ▼           ▼
┌─────────────────────────────────┐
│   ChromaDB (Partitionado)       │  ← Knowledge com scope
│   pousada_A/ | pousada_B/ | ... │
└─────────────────────────────────┘
     │           │           │
     ▼           ▼           ▼
┌─────────────────────────────────┐
│   GLOBAL AKASHA (Apenas        │  ← Apenas patterns agregados
│   insights nao-identificaveis)│     sem dados pessoais
│   "Hospedes de MG preferem    │
│    cafe da manha continental" │
└─────────────────────────────────┘
```

### 7.2 Regras de Seguranca

1. **Zero PII no Global**: Dados pessoais de hospedes NUNCA saem da particao da pousada
2. **Encryption at Rest**: SQLite WAL + ChromaDB encriptados (SQLCipher + custom)
3. **Encryption in Transit**: TLS 1.3 para toda comunicacao
4. **Access Control**: Apenas o ZCC e o cerebro da pousada podem acessar
5. **Audit Trail**: Todo acesso ao Akashico e logado
6. **Retention Policy**: Episodicas: 90 dias ativos, resumo cristalizado permanente
7. **Data Ownership**: Dados pertencem ao dono da pousada. Pode exportar/apagar.
8. **Global Learning Anonimizado**: Apenas estatisticas agregadas sao compartilhadas

### 7.3 Criptografia

```python
# Episodias: Criptografia AES-256 por pousada
# Cada pousada tem sua chave derivada de um master key + pousada_id
# Master key: Armazenada em secrets manager (env var, nunca em codigo)
# Key rotation: A cada 90 dias automaticamente

# ChromaDB: Particoes separadas + encryption
# Graph: NetworkX em memoria + snapshot criptografado em disco

# ZCC Dashboard: HTTPS + session tokens + RBAC
# API endpoints: JWT com expiracao de 15min
```

---

## 8. Performance — Rápido e Sutil

O Akashico nao pode ser um gargalo. Precisa ser mais rapido que
o tempo de resposta do LLM:

### 8.1 Tempos de Acesso

| Operacao | Latencia Alvo | Tecnologia |
|----------|--------------|-------------|
| Ingestao de episodio | <1ms | Redis Stream XADD |
| Classificacao | <5ms | RegExp + Feature Path |
| Busca por hospede | <2ms | Redis Hash (working memory) |
| Busca semantica | <10ms | ChromaDB + PPR Fusion |
| Recuperacao de contexto | <5ms | A-MEM ACE PromptBuilder |
| Cristalizacao (batch) | <500ms/50 eps | SQLite + Python |
| Geracao de predicao | <20ms | Thompson Sampling |
| ZCC alerta | <50ms | Redis Pub/Sub |

### 8.2 Otimizacoes

- **Redis como cache quente**: Working memory dos hospedes ativos em Redis Hash
- **SQLite WAL**: Leituras nao bloqueiam escritas, ideais para ingestao continua
- **ChromaDB local**: Zero latencia de rede, embeddings em memoria
- **Batch cristalizacao**: Processa em lotes a cada 15min, nao inline
- **PPR Fusion**: Combina busca vetorial + estrutural em uma passagem
- **Token Budget**: A-MEM ACE limita a injecao de contexto a 2000 tokens

---

## 9. Metricas do Campo Akashico

### 9.1 KPIs Operacionais

| Metrica | Descricao | Meta |
|---------|-----------|------|
| Episodios/dia | Volume de memorias capturadas | >100 por pousada |
| Cristalizacoes/dia | Insights gerados | >10 por pousada |
| Predicoes acuracia | Taxa de acerto das predicoes | >80% em 90 dias |
| Tempo de ingestao | Latencia do buffer | <1ms |
| Tempo de cristalizacao | Latencia do batch | <500ms/50 eps |
| Factual consistency | Consistencia de respostas com memoria | >96% |
| Guest satisfaction lift | Aumento de satisfacao apos Akashico | >15% |
| Revenue lift | Aumento de receita via insights | >10% |

### 9.2 Health Checks

- Tamanho do buffer Whisper Stream (deve ser <1000 pendentes)
- SQLite WAL size (deve ser <100MB por pousada)
- ChromaDB collection size (deve ter <100K documentos)
- Graph nodes/edges (deve crescer linearmente)
- Cristalizacao queue (deve ser <50 episodios pendentes)

---

## 10. Roadmap de Implementacao

### Fase 1: Fundacao (Sprint 1-2)
- [ ] Whisper Stream (Redis Streams para ingestao)
- [ ] AkashicEpisode dataclass + SQLite WAL schema
- [ ] Camada 1 (Buffer) + Camada 2 (Episodica)
- [ ] Integracao com CADMAS-CTX para classificacao

### Fase 2: Memoria Viva (Sprint 3-4)
- [ ] Working Memory (Redis Hash) — Camada 3
- [ ] Cristalizacao batch (pattern extraction)
- [ ] A-MEM integration (notas atomicas do Akashico)
- [ ] ZCC dashboard: "Memorias Vivas" panel

### Fase 3: Sabedoria (Sprint 5-6)
- [ ] Knowledge Graph (NetworkX) — Camada 4
- [ ] ChromaDB partitionado por pousada
- [ ] PPR Fusion retrieval
- [ ] Predicoes com Thompson Sampling + historico real
- [ ] ZCC dashboard: "Insights & Predictions" panel

### Fase 4: Autonomia (Sprint 7-8)
- [ ] Global learning anonimizado (cross-pousada)
- [ ] Acoes automaticas (precos, alertas, sugestoes)
- [ ] EWC-DR para protecao de conhecimento critico
- [ ] GEPA auto-evolution com feedback do Akashico
- [ ] Export/import de dados (propriedade do dono)

---

## 11. Relacao com Claude Fable 5

O Claude Fable 5 (Mythos-class) e o motor de raciocinio ideal para
o Ciclo de Cristalizacao do Akashico:

| Tarefa Akashica | Modelo Recomendado | Justificativa |
|----------------|-------------------|---------------|
| Cristalizar padroes | Fable 5 | Raciocinio senior + hipoteses novas |
| Gerar insights | Fable 5 | Knowledge work SOTA |
| Predicoes de precos | Fable 5 | Hebbia Finance Benchmark #1 |
| Classificacao rapida | Sonnet 4.5 | Baixo custo, alta velocidade |
| Resposta ao hospede | Sonnet 4.5 | Conversacional, economico |
| Cristalizacao noturna | Fable 5 | Extended thinking para batch profundo |

---

## 12. Conclusao — O Subconsciente Vivo

O Campo Akashico ZEHLA nao e um banco de dados. E um organismo
cognitivo que vive no centro do sistema, absorvendo experiencias,
cristalizando sabedoria e alimentando decisoes.

Assim como o cerebro humano tem memoria de curto prazo (hipocampo),
memoria de trabalho (cortex prefrontal) e memoria de longo prazo
(cortex), o Akashico tem 4 camadas que mimetizam essa arquitetura:

```
Camada 1 (Sutil)     ≈ Memoria sensorial    (0.5ms)  — Impressoes brutas
Camada 2 (Episodica) ≈ Memoria de trabalho   (5ms)    — Experiencias vividas
Camada 3 (Fluida)    ≈ Memoria operacional   (2ms)    — Contexto ativo
Camada 4 (Raiz)      ≈ Memoria de longo prazo (10ms)  — Sabedoria cristalizada
```

Ele aprende sem parar. Protege o que aprendeu. E usa o que sabe
para melhorar cada interacao com cada hospede de cada pousada.

Esse e o segredo da ZEHLA. Guardado como a formula da Coca-Cola.
Vivo como o coracao do sistema.

---

*Documento Nuclear ZEHLA — Classificacao: CONFIDENCIAL*
*Criado por Agente ZEHLA OS — 11/06/2026*
