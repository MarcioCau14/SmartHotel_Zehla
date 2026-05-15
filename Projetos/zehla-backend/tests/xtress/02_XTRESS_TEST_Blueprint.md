# XTRESS_TEST — ECOSSISTEMA DE TESTE DE ESTRESSE

> **Versao:** 1.0 | Data: 09/05/2026 | Status: BLUEPRINT DEFINITIVO
> **Integracao:** Ferramenta externa e independente do ZEHLA SMARTHOTEL
> **Funcao:** Simular, testar, calibrar e validar todo o ecossistema ZEHLA
> **Precos ZEHLA:** LITE R$248 | PRO R$448 | MAX R$798

---

## SUMARIO EXECUTIVO

O XTRESS_TEST e o ecossistema de teste de estresse definitivo do ZEHLA SMARTHOTEL. Ele existe para responder a uma pergunta simples mas critica: "O ZEHLA aguenta a vida real?". Antes de colocar uma ferramenta de inteligencia artificial hospitalaria nas maos de centenas de pousadeiros brasileiros, precisamos ter certeza absoluta de que cada modulo, cada agente, cada pipeline e cada integracao funciona corretamente sob carga — nao apenas em ambiente de desenvolvimento com 3 pousadas de teste, mas com 500 pousadas recebendo milhares de mensagens simultaneas de hospedes de todos os 27 estados do Brasil.

A filosofia do XTRESS_TEST e baseada em tres pilares fundamentais. O primeiro pilar e a **externalidade absoluta**: o XTRESS_TEST nao toca em uma unica linha de codigo interno do ZEHLA. Ele se conecta ao sistema da mesma forma que uma pousada real conectaria — atraves da API REST do ZMG (Zehla Messaging Gateway) e dos webhooks de entrada. Se o ZEHLA esta funcionando para o XTRESS_TEST, esta funcionando para qualquer pousada real. O segundo pilar e a **fidelidade da simulacao**: cada mensagem gerada pelo XTRESS_TEST e indistinguivel de uma mensagem real de um hospede brasileiro. Usamos templates linguisticos regionalizados, variacao de formalidade, emojis, abreviacoes e giral regionais para garantir que os agentes do ZCC recebam exatamente o tipo de input que encontraram na producao. O terceiro pilar e a **acao sobre os dados**: o XTRESS_TEST nao apenas coleta metricas — ele analisa, diagnostica e sugere melhorias especificas. Se o ZCC-WPP esta demorando 3.2 segundos para responder a uma mensagem de reserva, o XTRESS_TEST identifica que o gargalo esta no enrichment do ZCC-TRENDS e sugere aumentar o cache TTL de 6 para 12 horas.

O resultado esperado e que, apos cada ciclo de testes do XTRESS_TEST, o ZEHLA saia mais robusto, mais rapido e mais preparado para operar em escala real. O XTRESS_TEST transforma testes de algo teorico em algo concreto: "Nossos testes mostram que o ZEHLA consegue atender simultaneamente 500 pousadas com 50.000 mensagens por hora, mantendo tempo de resposta abaixo de 2 segundos em 95% dos casos."

---

## PARTE I: FILOSOFIA E PRINCIPIOS

### 1.1 O Que e o XTRESS_TEST

O XTRESS_TEST e uma ferramenta de teste de estresse e calibragem projetada especificamente para o ecossistema ZEHLA SMARTHOTEL. Ele nao e um framework de testes unitarios ou de integracao conventional. E um **simulador de realidade** que replica o comportamento de centenas de pousadas e milhares de hospedes interagindo com o ZEHLA ao mesmo tempo, atraves dos mesmos canais (WhatsApp, SMS, Email) e APIs que seriam usados em producao.

A grande diferenca entre o XTRESS_TEST e ferramentas convencionais de load testing (como JMeter, k6 ou Artillery) e que ele entende o **dominio hospitalario brasileiro**. Ele sabe que uma pousada em Paraty no feriado de Corpus Christi recebe 5x mais mensagens que no meio de uma terca-feira de novembro. Ele sabe que hospedes do Sul falam diferente de hospedes do Nordeste. Ele sabe que o ZCC-REV precisa de dados do ZCC-TRENDS para ajustar precos, e que o ZCC-WPP depende da Inteligencia Swipe para escolher o template correto. Em resumo, o XTRESS_TEST testa nao apenas se o sistema aguenta carga, mas se ele age **corretamente** sob carga.

### 1.2 Por Que Teste de Estresse Externo

A decisao de manter o XTRESS_TEST como uma ferramenta **externa** ao codigo do ZEHLA e deliberada e estrategica. Existem quatro razoes fundamentais para essa arquitetura:

**Primeira: Isolamento de Falhas.** Se o XTRESS_TEST estivesse embutido no ZEHLA, um bug no simulador poderia afetar a producao. Mantendo-o externo, garantimos que qualquer falha no XTRESS_TEST nao impacta pousadas reais. O pior cenario e o simulador parar de funcionar — o ZEHLA continua operando normalmente.

**Segunda: Fidelidade do Teste.** Ao se conectar via API REST e webhooks — exatamente como uma pousada real faria — o XTRESS_TEST testa toda a cadeia: load balancer, API routes, Prisma ORM, PostgreSQL, Redis cache, ZMG pipeline, providers (Z-API, 360dialog), e os 10 agentes do ZCC. Um teste interno (unitario) nunca conseguiria validar essa cadeia completa com a mesma fidelidade.

**Terceira: Reprodutibilidade.** O XTRESS_TEST pode ser executado em qualquer ambiente (dev, staging, producao) sem modificar o codigo do ZEHLA. Basta apontar a URL da API e rodar. Isso permite testes regulares (ex: toda sexta-feira) e testes pos-deploy (ex: toda vez que uma nova versao do ZEHLA for deployada).

**Quarta: Independencia de Evolucao.** O ZEHLA evolui constantemente (novos agentes, novos modulos, novas integracoes). O XTRESS_TEST, sendo externo, pode ser atualizado independentemente para cobrir novos cenarios sem risco de conflito com o codigo principal.

### 1.3 Principios Fundamentais

O XTRESS_TEST opera sob cinco principios inviolaveis que guiam cada decisao de design e implementacao:

**Principio 1 — Externalidade Absoluta:** O XTRESS_TEST nunca importa, nunca referencia e nunca depende de codigo interno do ZEHLA. Toda comunicacao acontece via HTTP (API REST e webhooks). O XTRESS_TEST e, do ponto de vista do ZEHLA, indistinguivel de uma pousada real.

**Principio 2 — Realismo Maximizado:** Cada mensagem, cada pousada, cada hospede e cada cenario e gerado com dados reais do contexto hospitalario brasileiro. Destinos reais (Paraty, Tiradentes, Gramado), nomes brasileiros (regionalizados), DDDs por estado, sazonalidade real (feriados nacionais e estaduais), e variacao linguistica natural (formal, informal, regional, com emojis).

**Principio 3 — Mensurabilidade Total:** Tudo que acontece durante um teste e medido, armazenado e analisavel. Tempo de resposta, taxa de entrega, uso de CPU, queries por segundo, erros por tipo, latencia por agente, custo por mensagem. Se nao pode ser medido, nao pode ser melhorado.

**Principio 4 — Reprodutibilidade Cientifica:** Cada teste e identificado por um hash deterministico. Mesmos parametros = mesmos resultados (dentro de margem estatistica). Isso permite comparacoes "antes vs. depois" objetivas: "A otimizacao do cache reduziu o tempo de resposta do ZCC-WPP em 34%."

**Principio 5 — Acao sobre Dados:** O XTRESS_TEST nao para em "coletar metricas". Ele analisa, identifica gargalos, calcula vulnerabilidades (com scoring proprio) e gera recomendacoes de calibragem especificas e acionaveis. O output final nao e um grafico — e um plano de acao.

---

## PARTE II: ARQUITETURA GERAL DO XTRESS_TEST

### 2.1 Visao Geral dos 8 Modulos

O XTRESS_TEST e composto por 8 modulos independentes que trabalham em conjunto para simular, medir, analisar e calibrar o ecossistema ZEHLA:

| # | Modulo | Funcao | Input | Output |
|---|--------|--------|-------|--------|
| 1 | **PousadaFactory** | Gera pousadas virtuais realistas | Config (quantidade, regiao, plano) | Lista de pousadas com perfis completos |
| 2 | **GuestSimulator** | Gera hospedes sinteticos | Config (quantidade, regiao, perfil) | Lista de hospedes com dados de contato |
| 3 | **MessageGenerator** | Gera mensagens WhatsApp realistas | Pousada + Hospede + Categoria | Mensagens em PT-BR natural |
| 4 | **LoadInjector** | Injeta carga no sistema | Cenario + Mensagens + Config | Metricas de injecao (rate, throughput) |
| 5 | **MetricsCollector** | Captura todas as metricas | Events from ZEHLA + Internal | Time-series de metricas brutas |
| 6 | **VulnerabilityScanner** | Identifica vulnerabilidades | Metricas coletadas | Relatorio de vulnerabilidades |
| 7 | **CalibrationEngine** | Sugere melhorias | Vulnerabilidades + Metricas | Plano de calibragem |
| 8 | **DashboardReporter** | Gera relatorios visuais | Todos os dados acima | Dashboard + Relatorio PDF/HTML |

### 2.2 Diagrama de Arquitetura

```
+==========================================================================+
|                    XTRESS_TEST — ARQUITETURA GERAL                        |
|                                                                          |
|  [CONFIG] Cenario de Teste (JSON)                                        |
|  "crush_test_500pousadas_feriado.json"                                   |
|      |                                                                   |
|      v                                                                   |
|  +------------------+    +------------------+    +------------------+     |
|  | POUSADA FACTORY  |    | GUEST SIMULATOR  |    | MESSAGE GENERATOR|    |
|  | 500 pousadas     |--->| 5.000 hospedes   |--->| 50.000 msgs      |    |
|  | 27 estados       |    | todos os DDDs    |    | PT-BR realista   |    |
|  +------------------+    +------------------+    +------------------+     |
|                                                          |               |
|                                                          v               |
|  +------------------+    +------------------+    +------------------+     |
|  | LOAD INJECTOR    |    | METRICS COLLECTOR|<---| ZMG API (ZEHLA) |    |
|  | Controla ritmo   |--->| Captura tudo    |    | /api/zmg/...     |     |
|  | Ramp-up/down     |    | Tempo real      |    | /api/webhooks/.. |     |
|  +------------------+    +------------------+    +------------------+     |
|                                     |                                    |
|                          +----------+----------+                         |
|                          v                     v                         |
|                   +------------+        +------------+                   |
|                   | VULNERAB.  |        | CALIBRATION|                   |
|                   | SCANNER    |------->| ENGINE     |                   |
|                   | Encontra   |        | Sugere     |                   |
|                   | falhas     |        | melhorias  |                   |
|                   +------------+        +------------+                   |
|                          |                     |                         |
|                          v                     v                         |
|                   +----------------------------------------+            |
|                   |       DASHBOARD & REPORTER              |            |
|                   |  Graficos + Relatorio + Plano de Acao   |            |
|                   +----------------------------------------+            |
+==========================================================================+
                              |
                              v
                    [ZEHLA SMARTHOTEL]
                    ZCC + ZMG + LIS + 10 Agentes
                    (tratado como CAIXA PRETA)
```

### 2.3 Fluxo de Dados: Simulacao → Metrica → Calibragem

O fluxo de dados do XTRESS_TEST segue um pipeline de 6 etapas que transforma uma configuracao de teste em um plano de acao concreto para melhorar o ZEHLA:

**Etapa 1 — Preparacao:** O operador define um cenario de teste (ex: "500 pousadas, feriado de Corpus Christi, pico de 50 msgs/segundo"). O PousadaFactory gera as pousadas, o GuestSimulator gera os hospedes, e o MessageGenerator cria o corpus de mensagens. Tudo e armazenado em um banco de dados SQLite local (dedicado ao XTRESS_TEST, nao toca no PostgreSQL do ZEHLA).

**Etapa 2 — Injecao:** O LoadInjector comeca a enviar mensagens para a API do ZMG na cadencia configurada. Cada mensagem e enviada como se fosse uma pousada real enviando via API REST. O LoadInjector controla ramp-up (comeca devagar e acelera), sustentacao (mantem o pico por N minutos) e ramp-down (reduz gradualmente).

**Etapa 3 — Captura:** Enquanto as mensagens sao enviadas, o MetricsCollector captura metricas em tres frentes: (a) metricas de injecao (quantas mensagens foram enviadas, quantas falharam, latencia de cada request), (b) metricas de resposta do ZEHLA (tempo de resposta do ZCC-WPP, status do ZMG, webhooks recebidos), e (c) metricas internas do ZEHLA (via endpoints de monitoring se disponiveis).

**Etapa 4 — Analise:** Apos o teste, o VulnerabilityScanner analisa as metricas coletadas procurando por: gargalos (qual agente/modulo limita o sistema), timeouts (quais operacoes excedem os limites aceitaveis), erros (quais tipos de falha ocorrem e com que frequencia), degradacao (como a performance degrada ao longo do tempo), e pontos criticos (quais cenarios causam falhas em cascata).

**Etapa 5 — Calibragem:** O CalibrationEngine recebe as vulnerabilidades encontradas e gera recomendacoes especificas: "Aumentar pool de conexoes do Prisma de 5 para 15", "Aumentar timeout do ZCC-TRENDS de 3s para 5s", "Adicionar cache Redis para queries de ContactProfile", etc. Cada recomendacao inclui impacto estimado, complexidade de implementacao e prioridade.

**Etapa 6 — Reporte:** O DashboardReporter gera um relatorio completo com graficos, tabelas, metricas-chave, vulnerabilidades encontradas e plano de acao recomendado. O relatorio e salvo em HTML (interativo) e os dados brutos em JSON (para analise posterior).

### 2.4 Integracao com ZMG API (Como Conecta Externamente)

O XTRESS_TEST se conecta ao ZEHLA de forma completamente externa, sem nenhuma dependencia de codigo interno. Toda a comunicacao acontece via HTTP, usando os mesmos endpoints que uma pousada real usaria:

```
XTRESS_TEST → POST /api/zmg (enviar mensagem simulada)
XTRESS_TEST → GET /api/zmg/messages/status (verificar status)
XTRESS_TEST → GET /api/zmg/dashboard (coletar metricas do ZMG)
XTRESS_TEST → GET /api/zmg/costs (coletar custos)
XTRESS_TEST ← POST /api/zmg/webhooks/inbound (receber webhooks do ZEHLA)
```

O XTRESS_TEST precisa apenas de: (1) URL base do ZEHLA, (2) API Key de autenticacao, (3) Configuracao do cenario de teste. Com esses tres parametros, ele esta pronto para simular qualquer cenario.

Para receber webhooks (status de mensagens, respostas dos agentes), o XTRESS_TEST inicia um servidor HTTP local que o ZEHLA notifica via webhook callback. Isso permite medir o tempo total de round-trip: mensagem enviada → processada pelo ZCC → resposta gerada → webhook recebido.

---

## PARTE III: MODULO 1 — POUSADA FACTORY

### 3.1 Funcao: Gerar Centenas de Pousadas Virtuais

O PousadaFactory e responsavel por criar um universo de pousadas virtuais que servem como "clientes" do ZEHLA durante os testes. Cada pousada gerada possui um perfil completo e realista: nome, localizacao, tamanho, amenities, plano contratado, historico de reservas e preferencias de comunicacao. A variedade é fundamental — o XTRESS_TEST precisa cobrir desde a pequena pousada familiar de Tiradentes com 4 quartos ate o grande chale de Campos do Jordao com 35 suites.

O PousadaFactory usa uma base de dados de 50 destinos turisticos brasileiros reais, com informacoes como estado, regiao turistica (litoral, serra, historico, natureza), clima predominante, sazonalidade tipica e perfil de demanda. A partir dessa base, ele combina atributos aleatorios (mas realistas) para gerar pousadas unicas a cada execucao. Cada pousada recebe um ID de propriedade que e usado para autenticar as chamadas a API do ZMG durante o teste.

### 3.2 Modelo de Dados da Pousada Virtual

```typescript
interface VirtualPousada {
  id: string;                      // ID unico (cuid)
  propertyId: string;              // ID usado na API do ZMG
  nome: string;                    // "Pousada Sol e Mar", "Chale da Serra"
  destino: string;                 // "Paraty", "Tiradentes"
  estado: string;                  // "RJ", "MG"
  regiao: string;                  // "Litoral Sul", "Serra da Mantiqueira"
  
  // Perfil operacional
  totalQuartos: number;            // 4 a 40
  quartosDisponiveis: number;      // calculado dinamicamente
  ocupacaoMedia: number;           // 0.3 a 0.95
  precoMedioDiaria: number;        // R$ 150 a R$ 800
  plano: "LITE" | "PRO" | "MAX";  // distribuicao: 50% LITE, 35% PRO, 15% MAX
  
  // Amenities (subconjunto aleatorio)
  amenities: string[];             // ["piscina", "cafe colonial", "wifi", ...]
  
  // Contato
  whatsapp: string;                // +5512999990001 (E.164)
  email: string;                   // pousada@email.com
  
  // Configuracao do ZCC
  agentesAtivos: string[];         // Agentes configurados para esta pousada
  trendsKeywords: string[];        // Keywords monitoradas pelo ZCC-TRENDS
  
  // Historico simulado
  reservasMes: number;             // 15 a 200
  avaliacaoMedia: number;          // 3.5 a 5.0
  mesesAtivo: number;              // 1 a 48
  
  // Metadados do teste
  createdAt: Date;
  scenarioId: string;
}
```

### 3.3 Distribuicao Geografica

O PousadaFactory distribui as pousadas virtuais por todos os 27 estados brasileiros, com concentracao proporcional a demanda turistica real. Destinos como Rio de Janeiro, Sao Paulo, Minas Gerais, Bahia e Santa Catarina recebem mais pousadas que estados com menor fluxo turistico. A tabela abaixo mostra a distribuicao para um cenario de 500 pousadas:

| Regiao | Estados | Pousadas | Principais Destinos |
|--------|---------|----------|-------------------|
| **Sudeste** | SP, RJ, MG, ES | 175 (35%) | Paraty, Tiradentes, Campos do Jordao, Buzios, Petropolis, Ouro Preto, Monte Verde, Caparao |
| **Nordeste** | BA, PE, CE, RN, AL, PB, PI, MA, SE | 125 (25%) | Porto Seguro, Trancoso, Itacare, Jericoacoara, Maragogi, Pipa, Fernando de Noronha, Lencois Maranhenses, Sao Miguel dos Milagres |
| **Sul** | PR, SC, RS | 100 (20%) | Florianopolis, Gramado, Canela, Blumenau, Bombinhas, Balneario Camboriu, Ilha do Mel, Cambara do Sul |
| **Norte** | AM, PA, TO, RO, AC, RR, AP | 50 (10%) | Manaus (Amazonia), Alter do Chao, Chapada dos Veadeiros, Caldas Novas, Bonito MS |
| **Centro-Oeste** | GO, MT, MS, DF | 50 (10%) | Pirenopolis, Bonito MS, Chapada dos Veadeiros, Pantanal, Caldas Novas |

### 3.4 Perfil de Pousada

Cada pousada virtual recebe um perfil que combina tamanho, amenities e tipo de hospedes predominante. O PousadaFactory gera perfis variados para garantir que o ZEHLA seja testado em todas as configuracoes possiveis:

| Perfil | Quartos | Preco Medio | Amenidades Tipicas | % do Total |
|--------|---------|-------------|-------------------|------------|
| **Familiar** | 8-20 | R$ 200-400 | Piscina, playground, cafe colonial | 35% |
| **Romantico** | 4-12 | R$ 350-600 | Suite com banheira, lareira, vista | 25% |
| **Eco/Natureza** | 6-15 | R$ 180-350 | Trilhas, natureza, silencio | 15% |
| **Pet Friendly** | 5-10 | R$ 200-400 | Area para pets, gramado | 10% |
| **Luxo/Boutique** | 8-25 | R$ 500-800 | Spa, gourmet, piscina aquecida | 8% |
| **Historico/Cultural** | 6-18 | R$ 250-450 | Casaron, charme, localizacao centro | 7% |

### 3.5 Variedade de Cenarios de Pousada

Alem dos perfis acima, o PousadaFactory adiciona variabilidade temporal e situacional:

- **Pousada Nova (0-3 meses):** Poucas reservas, sem historico, agentes ainda aprendendo. Testa o onboarding do ZEHLA.
- **Pousada Consolidada (12+ meses):** Muitas reservas, historico rico, agentes calibrados. Testa performance com dados pesados.
- **Pousada em Alta Temporada:** Ocupacao 95%+, precos no teto, muitas solicitacoes. Testa o ZCC-REV e ZCC-RES sob pressao.
- **Pousada em Baixa Temporada:** Ocupacao 20-40%, precos reduzidos, busca por campanhas. Testa o ZCC-MKT em modo de recuperacao.
- **Pousada com Problemas:** Avaliacoes baixas, reclamacoes recentes, hospedes insatisfeitos. Testa o ZCC-HRD em modo de crise.

---

## PARTE IV: MODULO 2 — GUEST SIMULATOR

### 4.1 Funcao: Gerar Hospedes Sinteticos Realistas

O GuestSimulator cria hospedes virtuais que enviam mensagens para as pousadas. Cada hospede possui um perfil completo: nome brasileiro (regionalizado), telefone com DDD correto, email, preferencias de viagem, historico de interacoes e padrao de comunicacao. A qualidade dos hospedes simulados e crucial — se os nomes forem "Teste 1", "Teste 2" e as mensagens forem genericas, os agentes do ZCC nao seriam testados de forma realista.

O GuestSimulator usa uma base de dados de 2.000+ nomes brasileiros regionais, 500+ sobrenomes comuns, e um gerador de DDDs que garante que cada hospede tenha um telefone compativel com seu estado de origem. Ele tambem gera emails realistas usando providers brasileiros comuns (gmail.com, hotmail.com, yahoo.com.br, uol.com.br, terra.com.br).

### 4.2 Modelo de Dados do Hospede Virtual

```typescript
interface VirtualGuest {
  id: string;
  nomeCompleto: string;           // "Maria Aparecida Silva"
  primeiroNome: string;           // "Maria"
  sobrenome: string;              // "Silva"
  telefone: string;               // "+5511998765432" (E.164)
  ddd: string;                    // "11"
  estado: string;                 // "SP"
  cidade: string;                 // "Sao Paulo"
  email: string;                  // "maria.silva@gmail.com"
  instagram?: string;             // "@maria.silva"
  
  // Perfil de viagem
  perfilViagem: "casal" | "familia" | "solo" | "amigos" | "pet" | "business";
  faixaEtaria: "18-25" | "26-35" | "36-50" | "50+";
  preferenciaPagamento: "pix" | "cartao" | "boleto" | "dinheiro";
  
  // Comportamento de comunicacao
  formalidade: "formal" | "informal" | "muito_informal";
  usaEmoji: boolean;              // true/false
  regiaoLinguistica: "sudeste" | "nordeste" | "sul" | "norte" | "centro_oeste";
  
  // Relacao com a pousada
  ehHospedeRecorrente: boolean;
  visitasAnteriores: number;      // 0 a 10
  ultimaVisita?: Date;
  
  // Metadados
  pousadaId: string;
  scenarioId: string;
  createdAt: Date;
}
```

### 4.3 Gerador de Nomes Brasileiros Regionalizados

O GuestSimulator gera nomes brasileiros realistas variando por regiao. Cada regiao tem probabilidades diferentes para nomes comuns, refletindo a demografia real do Brasil:

| Regiao | Nomes Femininos Comuns | Nomes Masculinos Comuns | Sobrenomes Comuns |
|--------|----------------------|------------------------|-------------------|
| **Sudeste** | Maria, Ana, Julia, Camila, Fernanda | Pedro, Lucas, Gabriel, Rafael, Thiago | Silva, Santos, Oliveira, Souza, Lima |
| **Nordeste** | Maria, Ana, Francisca, Antonia, Josefa | Jose, Francisco, Antonio, Joao, Carlos | Silva, Santos, Oliveira, Pereira, Costa |
| **Sul** | Maria, Ana, Julia, Bruna, Taiane | Pedro, Lucas, Gabriel, Mateus, Rafael | Silva, Santos, Oliveira, Souza, Muller |
| **Norte** | Maria, Ana, Lucia, Francisca, Nazare | Jose, Francisco, Antonio, Joao, Raimundo | Silva, Santos, Oliveira, Costa, Miranda |
| **Centro-Oeste** | Maria, Ana, Julia, Camila, Luisa | Pedro, Lucas, Gabriel, Rafael, Bruno | Silva, Santos, Oliveira, Souza, Rodrigues |

### 4.4 Gerador de Telefones por Estado

Cada hospede recebe um telefone com o DDD correto para seu estado de origem, formatado em E.164:

| Estado | DDD | Estado | DDD | Estado | DDD |
|--------|-----|--------|-----|--------|-----|
| SP | 11,12,13,14,15,16,17,18,19 | MG | 31,32,33,34,35,37,38 | RJ | 21,22,24 |
| BA | 71,73,74,75,77 | PR | 41,42,43,44,45,46 | SC | 47,48,49 |
| RS | 51,53,54,55 | PE | 81,87 | CE | 85,88 |
| PA | 91,93,94 | MA | 98,99 | GO | 62,64 |
| MT | 65,66 | MS | 67 | AM | 92 |
| RN | 84 | AL | 82 | PB | 83 |
| PI | 86 | SE | 79 | TO | 63 |
| RO | 69 | AC | 68 | AP | 96 |
| RR | 95 | ES | 27,28 | DF | 61 |

### 4.5 Perfis de Hospede

O GuestSimulator distribui os hospedes virtuais em perfis que refletem a realidade do turismo brasileiro:

| Perfil | % | Caracteristicas | Mensagens Tipicas |
|--------|---|-----------------|-------------------|
| **Casal Romantic** | 25% | Busca suite, vista, lareira, jantar | "Tem suite com banheira pra fds de aniversario?" |
| **Familia com Filhos** | 20% | Busca espaco, piscina, cafe, atividades | "Aceita crianca de 5 anos? Tem piscina?" |
| **Solo Aventureiro** | 15% | Busca trilhas, natureza, preco baixo | "Quarto individual? Quanto fica 3 noites?" |
| **Grupo de Amigos** | 15% | Busca churrasqueira, area comum, festa | "Preciso de 3 quartos pro fds, tem churrasqueira?" |
| **Pet Lover** | 10% | Busca aceitar pet, area gramada | "Vou com meu dog, aceita? Tem area pra ele?" |
| **Business/Trabalho** | 10% | Busca wifi, silencio, localizacao | "Tem wifi bom? Preciso trabalhar remotamente" |
| **Idoso/Aposentado** | 5% | Busca acessibilidade, tranquilidade, cafe | "Tem acesso para cadeirante? Escada?" |

### 4.6 Distribuicao Temporal

O simulador respeita padroes temporais realistas de comunicacao de hospedes:

| Horario | Volume | Tipo de Mensagem |
|---------|--------|-----------------|
| 06:00-08:00 | Baixo (5%) | "Bom dia, vou chegar hoje as 14h" |
| 08:00-12:00 | Medio (20%) | Consultas de preco, disponibilidade |
| 12:00-14:00 | Medio-Baixo (10%) | Almoco, menos mensagens |
| 14:00-18:00 | Alto (30%) | Reservas, confirmacoes, informacoes |
| 18:00-21:00 | Pico (30%) | Reservas de ultima hora, urgencias |
| 21:00-23:00 | Medio (5%) | Confirmacoes noturnas, "ainda tem quarto?" |
| 23:00-06:00 | Muito Baixo (0%) | Raramente (exceto feriados) |
## PARTE V: MODULO 3 — MESSAGE GENERATOR

### 5.1 Funcao: Gerar Mensagens WhatsApp Realistas

O MessageGenerator e o coracao do XTRESS_TEST. Ele transforma pousadas virtuais e hospedes sinteticos em mensagens WhatsApp que sao indistinguiveis de mensagens reais. Cada mensagem e gerada a partir de um template linguistico que considera: o perfil do hospede (formal vs. informal), a regiao (girias locais), o tipo de interacao (reserva, reclamacao, elogio), o horario do dia (bom dia vs. boa noite), e o contexto da pousada (alta vs. baixa temporada).

O MessageGenerator possui 20+ categorias de mensagens, cada uma com 10-15 templates variados. Isso garante que, mesmo em um teste com 50.000 mensagens, haja variedade suficiente para nao gerar padroes previsiveis que os agentes poderiam "decorar". A variacao inclui: diferentes formas de perguntar a mesma coisa (ex: "Qual o preco?" vs. "Quanto fica?" vs. "Me passa o valor"), diferentes niveis de urgencia, e diferentes contextos sazonais (feriado, fim de semana, dia de semana).

### 5.2 Categorias de Mensagens

| # | Categoria | % do Total | Agentes Envolvidos | Complexidade |
|---|-----------|-----------|-------------------|-------------|
| 1 | **Consulta de Disponibilidade** | 18% | WPP, RES, REV | Media |
| 2 | **Consulta de Preco** | 15% | WPP, REV | Media |
| 3 | **Solicitacao de Reserva** | 12% | WPP, RES, FIN | Alta |
| 4 | **Confirmacao de Check-in** | 8% | WPP, RES | Baixa |
| 5 | **Cancelamento** | 5% | WPP, RES, FIN | Alta |
| 6 | **Reclamacao** | 5% | WPP, HRD | Alta |
| 7 | **Elogio** | 5% | WPP, HRD, MKT | Baixa |
| 8 | **Pedido de Informacao** | 8% | WPP, SEC | Media |
| 9 | **Follow-up Reserva** | 5% | WPP, RES | Media |
| 10 | **Mensagem Fora do Horario** | 4% | WPP | Baixa |
| 11 | **Solicitacao Especial** | 3% | WPP, HRD, OPN | Alta |
| 12 | **Pet Friendly** | 2% | WPP, RES | Media |
| 13 | **Grupo/Familia Grande** | 2% | WPP, RES, REV | Alta |
| 14 | **Mensagem com Imagem** | 2% | WPP, LIS | Media |
| 15 | **Mensagem Longa** | 2% | WPP, LIS | Media |
| 16 | **Multi-idioma** | 1% | WPP | Alta |
| 17 | **Mensagem Malformada** | 1% | WPP, LIS | Baixa |
| 18 | **Solicitacao de Transferencia** | 1% | WPP, RES | Media |
| 19 | **Pedido de Avaliacao** | 1% | WPP, HRD | Baixa |
| 20 | **Spam/Fake** | 0.5% | WPP, SEC | Baixa |

### 5.3 Templates de Mensagens por Categoria

#### Categoria 1: Consulta de Disponibilidade (18%)

```
Template 1 (Informal - Sudeste):
"Oi! Boa tarde 😊 Tem quarto disponivel pro fim de semana que vem? Somos um casal."

Template 2 (Formal - Sul):
"Boa tarde. Gostaria de saber se ha disponibilidade para o periodo de 15 a 18 de junho, para 2 pessoas."

Template 3 (Muito Informal - Nordeste):
"E aí, mano! Tem quartos pro feriado? Sou eu e minha namorada, queria um lugar bonitão"

Template 4 (Direto - Centro-Oeste):
"Tem quarto pra 2 pessoas esse fds? 16 e 17 de junho. Me fala rapidao pfv"

Template 5 (Familia - Sudeste):
"Oiii boa tarde!! Tem quartos pra familia? Somos eu meu marido e 2 crianças (6 e 9 anos) pro feriado de corpus christi"

Template 6 (Casal Romantic - Sul):
"Boa noite 💕 Vocês tem suite com banheira de hidromassagem pra comemorar nosso aniversario de casamento? Seria dia 20/06"

Template 7 (Solo - Nordeste):
"Opa, bom dia! Queria saber se tem quarto individual, so pra mim, pra ficar 3 noites no inicio de julho. Aceita pix?"

Template 8 (Grupo - Sudeste):
"OIIII! Preciso de 4 quartos pro fds!! Somos 12 amigos, sera que vcs conseguem nos acomodar? Tem area de churrasqueira?"

Template 9 (Recorrente - Qualquer regiao):
"Oi de novo! 😄 A gente ficou la em marco e amou demais! Tem vaga pra gente em julho? Queremos o mesmo quarto se possivel"

Template 10 (Urgente - Sudeste):
"BOA NOITE!! To precisando MUITO de um quarto pra essa sexta e sabado!! Meu hotel cancelou tudo de ultima hora, ajuda por favor 😭"
```

#### Categoria 2: Consulta de Preco (15%)

```
Template 1 (Informal):
"Quanto fica a diaria pra 2 pessoas no fds?"

Template 2 (Especifico):
"Oi! Quero reservar 3 noites (22, 23 e 24 de junho) pra casal. Quanto fica o total? Tem cafe da manha?"

Template 3 (Orcamento):
"Boa tarde! Podem me fazer um orcamento pra 2 adultos e 1 crianca de 7 anos, 4 diarias na alta temporada? Inclui cafe colonial?"

Template 4 (Negociacao):
"Oi! Vi o preco de voces no booking e queria saber se fazem preco melhor reservando direto? Pra 2 noites em agosto"

Template 5 (Grupo):
"Quanto fica pra 10 pessoas em 3 quartos no feriado? Faz algum pacote?"

Template 6 (Pet):
"Quanto fica a diaria pra casal com 1 cachorro pequeno? Tem alguma taxa extra pra pet?"

Template 7 (Longa Estadia):
"Bom dia! Quero ficar 7 noites em outubro. Tem desconto pra semana? Quanto fica?"

Template 8 (Ultima Hora):
"Olá! Vcs tem alguma promocao de ultima hora pra essa noite? So eu"

Template 9 (Comparativo):
"Quanto fica o fim de semana inteiro? E se for so sabado e domingo? Tem pacote com jantar incluso?"
```

#### Categoria 3: Solicitacao de Reserva (12%)

```
Template 1 (Direta):
"Quero reservar! Suite casal 15 e 16 de junho. Como faco?"

Template 2 (Com Detalhes):
"Oi! Gostaria de fazer uma reserva: Suite Premium, 2 adultos, 3 noites (12 a 15 de julho). Aceita cartao de credito?"

Template 3 (Pix):
"Boa! Vou reservar pra 2 noites. Faz pix? Manda a chave pfv"

Template 4 (Tiramassa):
"E aí! Posso reservar pra esse fds e pagar a vista? Quanto fica com desconto?"

Template 5 (Feriado):
"Bom dia! Quero reservar pro feriado de corpus christi (20 a 23/06). Suite casal. Pode reservar pra mim? Me confirma pfv"
```

#### Categoria 4: Reclamacao (5%)

```
Template 1 (Barulho):
"Boa noite... to na pousada agora e o quarto ao lado ta fazendo MUITO barulho. Ja sao 23h. Podem falar com eles?"

Template 2 (Limpeza):
"Oi, o banheiro do quarto 5 nao foi limpo direito. Tem cabelo no ralo e a toalha esta suja. Podem mandar alguem?"

Template 3 (Ar-Condicionado):
"BOM DIA! O ar condicionado do nosso quarto nao ta funcionando! Ta 35 graus la dentro, impossivel dormir. Me ajudem pfv!"

Template 4 (WiFi):
"A internet aqui ta pessima!! Nao consigo nem mandar uma mensagem. Falei la na recepcao mas nada mudou. Resolva isso urgente"

Template 5 (Check-in Problem):
"Cheguei as 14h como combinado e ninguem apareceu na recepcao. Ja esperei 30 minutos. To aqui com minha familia cansada da viagem. ONDE ESTAO VOCES?"
```

#### Categoria 5: Elogio (5%)

```
Template 1 (Geral):
"Nossa, que pousada MARAVILHOSA! 🌟 Tudo perfeito, cafe colonial incrivel, equipe super atenciosa. Voltaremos com certeza!"

Template 2 (Equipe):
"So pra agradecer a Joana e o Pedro que sao incriveis! Eles fizeram nossa estadia ficar ainda melhor. Nota 10!"

Template 3 (Comida):
"O cafe da manha dessa pousada e o MELHOR que ja comi em toda a minha vida! Pao de queijo, bolo de cenoura, frutas frescas... demais!"

Template 4 (Vista):
"A vista do quarto e ABSURDA! Acordei com o nascer do sol la de cima e parecia um quadro. Fotos nao fazem justica"
```

#### Categoria 6: Solicitacao Especial (3%)

```
Template 1 (Aniversario):
"Oi! Vou comemorar meu aniversario de casamento la dia 15/06. Tem como preparar algo especial? Flores, champanhe,那种 coisa?"

Template 2 (Alergia):
"Boa tarde! Minha esposa tem alergia grave a gluten e lactose. O cafe da manha tem opcoes sem gluten? Posso levar minha comida?"

Template 3 (Cadeirante):
"Boa noite! Preciso saber se a pousada tem acessibilidade total: rampa, quarto adaptado, banheiro com barras de apoio. Meu pai usa cadeira de rodas"

Template 4 (Casamento):
"Oi! Estamos planejando nosso casamento la em novembro. Voces aceitam eventos? Teria espaco pra 40 pessoas?"
```

### 5.4 Variacao Linguistica Regional

O MessageGenerator adiciona variacao linguistica regional para tornar as mensagens ainda mais realistas:

| Regiao | Expressoes Tipicas | Exemplo |
|--------|-------------------|---------|
| **Sudeste** | "Mano", "Cara", "Top", "Show", "Mermo" | "Cara, a pousada e top demais!" |
| **Nordeste** | "Meu amor", "Amor", "Deus me livre", "Nossa Senhora" | "Meu amor, tem quartos pro fds?" |
| **Sul** | "Bah", "Tchê", "Legal", "Gostoso" | "Bah, que lugar bonito demais!" |
| **Norte** | "Velho", "Parceiro", "E o negocio e o seguinte" | "Velho, quanto fica a diaria?" |
| **Centro-Oeste** | "Mermão", "Tranquilo", "Beleza" | "Mermão, faz desconto pra mim?" |

### 5.5 Mensagens Edge Case

O XTRESS_TEST inclui mensagens edge case que testam limites do sistema:

```
Edge Case 1 - Mensagem muito longa (500+ caracteres):
"Oi bom dia! Entao, minha situacao e a seguinte: eu e minha familia queremos viajar em julho mas ainda nao definimos as datas exatas porque meu marido nao conseguiu tirar ferias ainda no trabalho, mas a gente queria saber se vcs tem disponibilidade na primeira ou na segunda semana de julho, e qual seria o preco pra um quarto de casal e um quarto triplo, e se tem cafe colonial incluso, e se aceitam pix com desconto, e se tem estacionamento, e se a piscina e aquecida no inverno, e se fica perto do centrinho..."

Edge Case 2 - Mensagem em ingles:
"Hello! Do you have availability for this weekend? We are a couple from Sao Paulo. English or Spanish preferred."

Edge Case 3 - Somente emoji:
"🌊☀️🌴📞"

Edge Case 4 - Mensagem com link suspeito:
"Olá! Vi seu anuncio no Google e queria fazer uma reserva. Aqui esta o link: http://reserva-fake-pousada.com.br/cadastro"

Edge Case 5 - Mensagem vazia:
[conteudo vazio]

Edge Case 6 - Numero enorme de mensagens seguidas do mesmo hospede:
[20 mensagens consecutivas em 2 minutos]

Edge Case 7 - Caracteres especiais:
"O!í qüer0 r3s3rv4r... @#$%"
```

---

## PARTE VI: MODULO 4 — LOAD INJECTOR

### 6.1 Funcao: Controlar a Injecao de Carga no Sistema

O LoadInjector e o maestro do teste. Ele determina QUANDO, QUANTAS e COM QUE FREQUENCIA as mensagens sao enviadas para o ZEHLA. Inspirado em ferramentas de load testing como k6 e Artillery, o LoadInjector opera com perfis de carga predefinidos que simulam diferentes padroes de uso real:

O LoadInjector nao envia mensagens "de qualquer jeito". Ele segue um script temporal preciso que replica padroes reais de comunicacao de hospedes com pousadas. Por exemplo, no cenario "Domingo a Noite" (pico de reservas para o fim de semana seguinte), o LoadInjector comeca as 18h com 5 mensagens/segundo, acelera para 30 mensagens/segundo as 20h, mantem o pico ate as 22h, e desacelera gradualmente ate meia-noite. Isso replica o comportamento real de hospedes que pesquisam pousadas no domingo a noite.

### 6.2 Perfis de Carga

| Perfil | Duracao | Pico (msgs/seg) | Total Mensagens | Uso |
|--------|---------|-----------------|-----------------|-----|
| **Baseline** | 30 min | 5 | 9.000 | Teste rapido de sanidade |
| **Dia Normal** | 2 horas | 10 | 72.000 | Simula um dia medio |
| **Fim de Semana** | 4 horas | 25 | 360.000 | Simula pico de fds |
| **Feriado Bomba** | 6 horas | 50 | 1.080.000 | Simula feriado de alta demanda |
| **Crush Test** | 1 hora | 100 | 360.000 | Testa limite absoluto |
| **Sustained 24h** | 24 horas | 15 | 1.296.000 | Teste de resistencia |
| **Chaos Monkey** | 2 horas | Variavel | Variavel | Falhas aleatorias |

### 6.3 Padroes Temporais

O LoadInjector replica padroes temporais realistas baseados em dados do setor hoteleiro brasileiro:

```
Perfil "Domingo a Noite":
06:00 ─── 8:00 ─── 12:00 ─── 14:00 ─── 18:00 ─── 20:00 ─── 22:00 ─── 00:00
  1        3         7          5         15         30         25          10
  │        │         │          │         │          │          │          │
  RAMP-UP  │    ESTAVEL  │   RAMP-UP   │  RAMP-UP   │  PIQUE   │  DECAY   │
           │         │          │         │          │          │          │

Perfil "Alta Temporada Sustentada":
00:00 ─── 06:00 ─── 12:00 ─── 18:00 ─── 00:00
  1         3         15         25         20
  │         │          │          │          │
 SUSTAINED (carga constante por 24h, sem varianca significativa)
```

### 6.4 Controle de Concorrencia

O LoadInjector controla a concorrencia de envio para garantir que o teste seja realista:

```typescript
interface LoadConfig {
  maxConcurrent: number;          // Max requests simultaneos (default: 100)
  requestsPerSecond: number;      // Target de throughput
  rampUpDuration: number;         // Segundos para chegar no pico
  sustainedDuration: number;      // Segundos no pico
  rampDownDuration: number;       // Segundos para desacelerar
  timeoutPerRequest: number;      // Timeout por request (default: 10000ms)
  retryOnFailure: boolean;        // Retry em caso de falha (default: true)
  maxRetries: number;             // Max retries (default: 2)
  batchSize: number;              // Mensagens por batch (default: 10)
  delayBetweenBatches: number;    // Delay entre batches (ms)
}
```

### 6.5 Ramp-up / Ramp-down Progressivo

O LoadInjector nunca comeca no pico. Ele segue uma curva progressiva:

```
Ramp-up: 0% ─── 25% ─── 50% ─── 75% ─── 100% (ramp-up duration)
          │        │        │        │        │
          t0       t1       t2       t3       t4

Sustained: 100% ─── 100% ─── 100% ─── ... ─── 100% (sustained duration)

Ramp-down: 100% ─── 75% ─── 50% ─── 25% ─── 0% (ramp-down duration)
```

### 6.6 Chaos Engineering

O LoadInjector possui um modo de Chaos Engineering que simula falhas e situacoes extremas:

| Tipo de Caos | Descricao | Probabilidade |
|-------------|-----------|--------------|
| **Timeout** | Simula timeout no envio (nao envia realmente) | 2% |
| **Duplicate** | Envia mensagem duplicada | 1% |
| **Malformed** | Envia JSON malformado | 0.5% |
| **Burst** | Envia 50 mensagens em 1 segundo (spike) | Aleatorio |
| **Silence** | Para de enviar por 30 segundos (simula downtime) | 1x por teste |
| **Wrong Property** | Envia mensagem para propriedade inexistente | 0.5% |
| **Old Message** | Envia mensagem com timestamp de 30 dias atras | 0.5% |
| **Rate Limit** | Envia acima do rate limit configurado | Aleatorio |

---

## PARTE VII: MODULO 5 — METRICS COLLECTOR

### 7.1 Funcao: Capturar Todas as Metricas do Teste

O MetricsCollector e o modulo que transforma um teste de carga em dados acionaveis. Ele captura metricas em tres frentes simultaneas, armazenando tudo em um banco de dados SQLite dedicado (com time-series otimizado) para analise posterior. Cada metrica e timestamped com precisao de milissegundos, permitindo reconstrucao temporal completa de qualquer momento do teste.

### 7.2 Metricas por Agente ZCC

| Metrica | Agente | Unidade | Threshold Sucesso | Threshold Alerta |
|---------|--------|---------|-------------------|------------------|
| Tempo de resposta | ZCC-WPP | ms | < 2.000 | > 5.000 |
| Acuracia da resposta | ZCC-WPP | % | > 85% | < 70% |
| Templates usados | ZCC-WPP | count | > 10/variedade | < 3 |
| Precos ajustados | ZCC-REV | count/hora | > 5 | 0 |
| Campanhas criadas | ZCC-MKT | count/hora | > 2 | 0 |
| Leads classificados | ZCC-ANA | count/hora | > 50 | < 10 |
| Reservas processadas | ZCC-RES | count/hora | > 20 | < 5 |
| Consultas de trend | ZCC-TRENDS | count | > 100 | < 10 |
| Fallbacks executados | ZMG | % do total | < 10% | > 30% |
| Mensagens entregues | ZMG | % do total | > 95% | < 80% |

### 7.3 Metricas do ZMG

| Metrica | Descricao | Formula |
|---------|-----------|---------|
| **Delivery Rate** | % de mensagens entregues | delivered / sent * 100 |
| **Read Rate** | % de mensagens lidas | read / delivered * 100 |
| **Fallback Rate** | % de mensagens que precisaram de fallback | fallbacks / total * 100 |
| **Cost per Message** | Custo medio por mensagem enviada | total_cost / total_messages |
| **WhatsApp Utilization** | % de mensagens por WhatsApp | wa_messages / total * 100 |
| **Avg Response Time** | Tempo medio de resposta do sistema | sum(response_time) / count |
| **P95 Response Time** | 95o percentil do tempo de resposta | sorted_times[0.95 * count] |
| **P99 Response Time** | 99o percentil do tempo de resposta | sorted_times[0.99 * count] |
| **Error Rate** | % de mensagens com erro | errors / total * 100 |
| **Throughput** | Mensagens processadas por segundo | total_messages / duration_seconds |

### 7.4 Modelo de Dados das Metricas (Prisma)

```prisma
model XtressTestRun {
  id            String   @id @default(cuid())
  name          String
  scenario      String                 // "crush_test_500pousadas"
  status        String   @default("pending") // pending, running, completed, failed
  config        String                 // JSON config usado
  startedAt     DateTime?
  completedAt   DateTime?
  totalMessages Int      @default(0)
  totalErrors   Int      @default(0)
  avgResponseMs Float?
  p95ResponseMs Float?
  p99ResponseMs Float?
  createdAt     DateTime @default(now())

  metrics       XtressMetric[]
  vulnerabilities XtressVulnerability[]
  @@index([status])
  @@index([createdAt])
}

model XtressMetric {
  id          String   @id @default(cuid())
  testRunId   String
  timestamp   DateTime
  category    String               // "agent", "zmg", "lis", "trends", "system"
  metricName  String               // "response_time", "delivery_rate"
  metricValue Float
  unit        String?              // "ms", "%", "count"
  agent       String?              // "ZCC-WPP", "ZCC-REV"
  channel     String?              // "whatsapp", "sms", "email"
  propertyId  String?
  metadata    String   @default("{}") // JSON com dados extras

  testRun     XtressTestRun @relation(fields: [testRunId], references: [id])
  @@index([testRunId, timestamp])
  @@index([category])
  @@index([agent])
}

model XtressVulnerability {
  id            String   @id @default(cuid())
  testRunId     String
  type          String               // "timeout", "bottleneck", "race_condition"
  severity      String   @default("media") // baixa, media, alta, critica
  component     String               // "ZCC-WPP", "ZMG", "LIS"
  description   String
  impact        String               // O que acontece
  recommendation String              // Como resolver
  score         Float?               // 0-10 (quanto pior, maior)
  detectedAt    DateTime @default(now())

  testRun       XtressTestRun @relation(fields: [testRunId], references: [id])
  @@index([testRunId])
  @@index([severity])
}

model XtressCalibration {
  id              String   @id @default(cuid())
  testRunId       String
  component       String
  current         String               // Estado atual (metrica)
  target          String               // Estado desejado
  action          String               // O que fazer
  estimatedImpact String               // Impacto esperado
  priority        String   @default("media")
  complexity      String   @default("media")
  createdAt       DateTime @default(now())

  @@index([testRunId])
  @@index([priority])
}
```

---

## PARTE VIII: MODULO 6 — VULNERABILITY SCANNER

### 8.1 Funcao: Identificar Vulnerabilidades e Pontos Fracos

O VulnerabilityScanner analisa as metricas coletadas durante o teste para identificar pontos fracos no ecossistema ZEHLA. Ele opera com uma abordagem de "score de vulnerabilidade" inspirada no CVSS (Common Vulnerability Scoring System), adaptada para o contexto de performance e confiabilidade de sistemas hoteleiros.

### 8.2 Tipos de Vulnerabilidade Detectadas

| Tipo | Descricao | Exemplo | Score Max |
|------|-----------|---------|-----------|
| **Timeout** | Operacao excede tempo limite | ZCC-WPP demora >5s para responder | 8 |
| **Bottleneck** | Modulo limita throughput do sistema | ZCC-TRENDS processa apenas 10 req/s | 9 |
| **Memory Leak** | Uso de memoria cresce ao longo do tempo | Processo Node.js cresce 100MB/hora | 10 |
| **Race Condition** | Operacoes concorrentes causam inconsistencia | 2 reservas para o mesmo quarto ao mesmo tempo | 7 |
| **Fallback Chain** | Taxa de fallback excessiva | 40% das mensagens precisam de fallback SMS | 6 |
| **Queue Overflow** | Fila de processamento excede capacidade | BullMQ queue com 10.000+ jobs pendentes | 8 |
| **Cache Miss** | Cache nao esta efetivo | 95% cache misses no ZCC-TRENDS | 5 |
| **Error Spike** | Pico de erros em momento especifico | 15% de erros entre 20h e 21h | 7 |
| **Degradation** | Performance degrada ao longo do tempo | P95 sobe de 1s para 4s em 2 horas | 8 |
| **Single Point of Failure** | Falha de um componente derruba tudo | Se Redis cai, ZMG para de funcionar | 9 |

### 8.3 Scan de Bottleneck

O scanner identifica qual modulo/agente e o gargalo do sistema usando analise de throughput:

```
Pipeline: Mensagem → ZMG → LIS → ZCC-TRENDS → Swipe → ZCC-WPP → ZMG → Provider

Throughput por estagio (msgs/seg):
ZMG Receive:     100 ████████████████████████████████████
LIS Pipeline:     95 ██████████████████████████████████░
ZCC-TRENDS:       30 ████████████░░░░░░░░░░░░░░░░░░░░░░  ← GARGALO!
Swipe Match:      90 ████████████████████████████████░░░
ZCC-WPP:          85 ███████████████████████████████░░░░
ZMG Send:         95 ██████████████████████████████████░

Conclusao: ZCC-TRENDS e o bottleneck (30 msgs/s vs. 100 de entrada)
Recomendacao: Adicionar cache Redis com TTL de 1h para TrendSignals
Impacto esperado: +200% throughput no ZCC-TRENDS (30 → 90 msgs/s)
```

### 8.4 Teste de Limite

O VulnerabilityScanner determina o limite maximo do sistema:

```
Teste Progressivo:
  5 msgs/seg   → 100% delivery, P95 = 450ms  ✓
 10 msgs/seg   → 100% delivery, P95 = 680ms  ✓
 20 msgs/seg   → 99% delivery,  P95 = 1.2s   ✓
 30 msgs/seg   → 98% delivery,  P95 = 2.1s   ⚠ (ZCC-TRENDS timeout)
 50 msgs/seg   → 92% delivery,  P95 = 4.8s   ✗
 75 msgs/seg   → 78% delivery,  P95 = 12s    ✗
100 msgs/seg   → 45% delivery,  P95 = 30s    ✗ (system crash)

LIMITE DETECTADO: 25-30 msgs/segundo (com estabilidade)
LIMITE ABSOLUTO: 50 msgs/segundo (com degradacao aceitavel)
LIMITE CRITICO: 75+ msgs/segundo (falhas em cascata)
```

---

## PARTE IX: MODULO 7 — CALIBRATION ENGINE

### 9.1 Funcao: Sugerir Melhorias e Calibrar o Sistema

O CalibrationEngine e o modulo que transforma dados em acao. Ele analisa as vulnerabilidades encontradas, calcula o impacto potencial de cada otimizacao, e gera um plano de calibragem priorizado. Cada recomendacao inclui: o que mudar, como mudar, impacto estimado, complexidade de implementacao, e prioridade.

### 9.2 Sugestoes de Tuning Automaticas

| Vulnerabilidade | Tuning Sugerido | Impacto | Complexidade | Prioridade |
|----------------|-----------------|---------|--------------|------------|
| ZCC-TRENDS bottleneck | Adicionar cache Redis TTL=1h | +200% throughput | Baixa | CRITICA |
| ZCC-WPP P95 > 2s | Aumentar pool de workers de 3 para 8 | -60% P95 | Baixa | ALTA |
| Cache miss 95% | Ajustar cache strategy de LRU para FIFO | +40% hit rate | Baixa | MEDIA |
| Memory leak no LIS | Adicionar GC manual a cada 1000 msgs | Estabiliza memoria | Media | ALTA |
| Fallback rate > 30% | Melhorar channel detection accuracy | -50% fallbacks | Alta | MEDIA |
| Queue overflow | Aumentar concurrencia BullMQ de 5 para 20 | +300% processamento | Baixa | CRITICA |
| Database CPU > 80% | Adicionar indices compostos nas queries mais lentas | -70% query time | Baixa | ALTA |
| P99 > 10s | Implementar circuit breaker no ZCC-TRENDS | Corta picos extremos | Media | ALTA |

### 9.3 Plano de Calibragem Progressiva

O CalibrationEngine sugere uma abordagem incremental de 4 fases:

```
FASE 1 — Quick Wins (Semanas 1-2):
  1. Aumentar pool de workers do ZCC-WPP (3 → 8)
  2. Adicionar cache Redis para TrendSignals (TTL=1h)
  3. Aumentar concurrencia BullMQ (5 → 20)
  Impacto esperado: +150% throughput, -50% P95

FASE 2 — Database Tuning (Semanas 3-4):
  4. Adicionar indices compostos (propertyId + createdAt)
  5. Implementar connection pooling (Prisma pool size 10 → 25)
  6. Ativar query logging para identificar slow queries
  Impacto esperado: -70% query time, +30% throughput

FASE 3 — Architecture (Semanas 5-6):
  7. Implementar circuit breaker (ZCC-TRENDS, ZMG providers)
  8. Adicionar rate limiting por propriedade
  9. Implementar dead letter queue para mensagens falhadas
  Impacto esperado: -90% error spikes, +50% resilience

FASE 4 — Advanced (Semanas 7-8):
  10. Implementar horizontal scaling (multiple workers)
  11. Adicionar CDN para assets estaticos
  12. Implementar load shedding em picos extremos
  Impacto esperado: +300% capacity, +99.9% uptime
```

---

## PARTE X: MODULO 8 — DASHBOARD E REPORTS

### 10.1 Dashboard em Tempo Real

O XTRESS_TEST gera um dashboard HTML interativo que mostra metricas em tempo real durante o teste:

```
+============================================================+
|  XTRESS_TEST — Teste: crush_test_500pousadas               |
|  Status: EXECUTANDO | Duracao: 01:23:45 | Mensagens: 45.678 |
+============================================================+
|  THROUGHPUT          |  LATENCIA         |  ERROS          |
|  ████ 42 msgs/s     |  P50: 680ms       |  █ 2.1%         |
|  Target: 50 msgs/s   |  P95: 2.1s  ⚠    |  Target: <5%    |
|  Peak: 58 msgs/s     |  P99: 4.8s  ✗    |  Last 5min: 3%  |
+============================================================+
|  AGENTES ZCC         |  ZMG ROUTING       |  TOP ERROS      |
|  WPP: 45ms   ✓      |  WA: 78%           |  Timeout WPP:15 |
|  REV: 12ms   ✓      |  SMS: 18%          |  504 Gateway:8  |
|  MKT: 23ms   ✓      |  Email: 4%         |  DB Connect:3   |
|  RES: 34ms   ✓      |  Fallback: 8% ⚠   |  Invalid JSON:2 |
|  TRENDS: 180ms ⚠    |                    |                |
+============================================================+
```

### 10.2 Relatorio Pos-Teste

Apos cada teste, o XTRESS_TEST gera um relatorio completo em HTML com:
- Resumo executivo (1 pagina)
- Metricas-chave com graficos (tempo de resposta, throughput, erros)
- Vulnerabilidades encontradas (com scores e recomendacoes)
- Comparativo com testes anteriores (evolucao)
- Plano de calibragem recomendado (priorizado)
- Dados brutos em JSON para exportacao

---

## PARTE XI: CENARIOS DE TESTE PRE-DEFINIDOS

### 11.1 Cenario 1: "Domingo a Noite"

**Objetivo:** Simular o pico de reservas de domingo a noite (maior volume de mensagens semanal).
**Configuracao:** 200 pousadas, 4 horas (18h-22h), pico de 25 msgs/segundo.
**Criterio de Sucesso:** P95 < 2s, error rate < 5%, delivery rate > 95%.

### 11.2 Cenario 2: "Vira Temporada"

**Objetivo:** Simular a transicao de baixa para alta temporada (demanda cresce 300%).
**Configuracao:** 300 pousadas, 6 horas, ramp-up progressivo de 5 para 40 msgs/segundo.
**Criterio de Sucesso:** Sistema mantem P95 < 3s durante ramp-up, sem crash.

### 11.3 Cenario 3: "Feriado Bomba"

**Objetivo:** Simular Corpus Christi com demanda explosiva (buscas +400%, reservas +200%).
**Configuracao:** 500 pousadas, 8 horas, pico de 50 msgs/segundo com trend signals ativos.
**Criterio de Sucesso:** ZCC-TRENDS responde em < 500ms, ZCC-REV ajusta precos automaticamente.

### 11.4 Cenario 4: "Chuva Destroi"

**Objetivo:** Simular clima ruim cancelando reservas (weather signal ativo, pico de cancelamentos).
**Configuracao:** 100 pousadas litoraneas, 2 horas, 60% das mensagens sao cancelamentos.
**Criterio de Sucesso:** ZCC-REV reajusta precos, ZCC-MKT envia campanha emergencial.

### 11.5 Cenario 5: "Crush Test"

**Objetivo:** Encontrar o limite absoluto do sistema (ate onde consegue ir antes de falhar).
**Configuracao:** 500 pousadas, 1 hora, ramp-up progressivo ate 100 msgs/segundo.
**Criterio de Sucesso:** Encontrar o throughput maximo estavel e documentar ponto de falha.

### 11.6 Cenario 6: "Chaos Monkey"

**Objetivo:** Testar resiliencia do sistema com falhas aleatorias.
**Configuracao:** 200 pousadas, 3 horas, com chaos injection (timeouts, duplicatas, bursts).
**Criterio de Sucesso:** Recovery time < 30s apos cada falha, nenhum data loss.

### 11.7 Cenario 7: "Maratona 24h"

**Objetivo:** Teste de resistencia prolongada (memory leaks, degradacao, estabilidade).
**Configuracao:** 300 pousadas, 24 horas, carga sustentada de 15 msgs/segundo.
**Criterio de Sucesso:** P95 nao degrada mais de 20% ao longo das 24h, sem memory leak.

### 11.8 Cenario 8: "Zero to Hero"

**Objetivo:** Simular crescimento explosivo (de 10 para 500 pousadas em 1 hora).
**Configuracao:** Comeca com 10 pousadas, adiciona 8 pousadas a cada minuto ate 500.
**Criterio de Sucesso:** Sistema escala sem degradacao perceptivel para pousadas existentes.

---

## PARTE XII: ROADMAP DE IMPLEMENTACAO

| Fase | Semanas | Modulos | Entregaveis |
|------|---------|---------|-------------|
| **Foundation** | 1-2 | PousadaFactory, GuestSimulator, Types | Modelos de dados, geradores base, 50 destinos |
| **Messages** | 3-4 | MessageGenerator | 20 categorias, 100+ templates, variacao regional |
| **Injection** | 5 | LoadInjector | Perfis de carga, ramp-up/down, chaos mode |
| **Metrics** | 6-7 | MetricsCollector, VulnerabilityScanner | Coleta, analise, scoring de vulnerabilidades |
| **Calibration** | 8-9 | CalibrationEngine, DashboardReporter | Recomendacoes, dashboard HTML, relatorios |
| **Scenarios** | 10+ | 8 Cenarios Pre-definidos | Suite completa de testes, CI/CD integration |

---

## PARTE XIII: ESTRUTURA DE ARQUIVOS

```
xtress-test/
  src/
    core/
      orchestrator.ts          # Orquestrador principal dos testes
      config.ts                # Configuracoes e constantes
      types.ts                 # Todos os tipos TypeScript
    simulators/
      pousada-factory.ts       # Gera pousadas virtuais
      guest-simulator.ts       # Gera hospedes sinteticos
      message-generator.ts     # Gera mensagens WhatsApp
      scenario-builder.ts      # Monta cenarios de teste
    injectors/
      load-injector.ts         # Injeta carga no ZEHLA
      chaos-injector.ts        # Modo chaos engineering
      rate-controller.ts       # Controla ritmo de envio
    collectors/
      metrics-collector.ts     # Captura metricas
      latency-tracker.ts       # Rastreia latencia
      error-tracker.ts         # Rastreia erros
    analyzers/
      vulnerability-scanner.ts # Identifica vulnerabilidades
      bottleneck-detector.ts   # Detecta gargalos
      calibration-engine.ts    # Sugere melhorias
    reporters/
      dashboard.ts             # Dashboard em tempo real
      report-generator.ts      # Relatorio pos-teste
      console-reporter.ts      # Output no console
    data/
      destinations.json        # 50 destinos turisticos
      names.json               # 2000+ nomes brasileiros
      ddd-map.json             # DDDs por estado
      message-templates.json   # Templates de mensagens
      scenarios/               # Cenarios pre-definidos
        domingo-a-noite.json
        feriado-bomba.json
        crush-test.json
        chaos-monkey.json
        maratona-24h.json
        zero-to-hero.json
  package.json
  tsconfig.json
  README.md
```

---

## PARTE XIV: MATRIZ DE CAPACIDADE

### Thresholds de Sucesso vs. Falha

| Metrica | Sucesso | Aceitavel | Alerta | Falha |
|---------|---------|-----------|--------|-------|
| P50 Response Time | < 500ms | 500ms-1s | 1-3s | > 3s |
| P95 Response Time | < 2s | 2-5s | 5-10s | > 10s |
| P99 Response Time | < 5s | 5-15s | 15-30s | > 30s |
| Delivery Rate | > 98% | 95-98% | 90-95% | < 90% |
| Read Rate | > 70% | 50-70% | 30-50% | < 30% |
| Error Rate | < 1% | 1-3% | 3-5% | > 5% |
| Fallback Rate | < 10% | 10-20% | 20-30% | > 30% |
| Throughput | > 90% target | 70-90% | 50-70% | < 50% |
| Memory Growth | < 10MB/h | 10-50MB/h | 50-100MB/h | > 100MB/h |
| CPU Usage | < 60% | 60-80% | 80-90% | > 90% |
| DB Connections | < 50% pool | 50-70% | 70-90% | > 90% |
