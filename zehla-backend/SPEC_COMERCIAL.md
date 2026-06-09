# SPEC — Domínio Comercial (Bounded Context) v2.0

> **Propósito:** Especificar o Bounded Context Comercial — o sistema límbico de vendas e CRM Cognitivo do ZEHLA PRIME — suas entidades, Máquina de Estados Finito (FSM), fronteiras dos agentes Zé-Sales (SDR) e Zé-Closer, Escada de Valor e Domain Events. Nenhuma linha de código. Apenas intenção, regras e contratos.
>
> **Arquitetura:** DDD Estrito + Ports & Adapters + CQRS + Event-Driven
>
> **Fonte de Verdade de Negócio:** Playbook Interno de Estruturação Comercial (Full Sales System)
>
> **Linguagem:** Natural (Português) — ubíqua, não técnica

---

## 1. Contexto Delimitado (Bounded Context)

### 1.1 Nome
**Comercial Context** — também referido como **CRM Cognitivo** ou **Funil de Conversão**.

### 1.2 Propósito
Gerencia o ciclo de vida comercial completo do cliente potencial ao onboarding pós-venda: captura de leads, Social Selling, nutrição, qualificação, agendamento, propostas, fechamento, sinal, conversão e handoff para onboarding. Este contexto é o **sistema límbico** do ZEHLA — onde a receita é gerada e o relacionamento com o cliente é iniciado. Tolerância a falhas: zero.

### 1.3 Fronteira (O que PERTENCE ao contexto)
- Captura e qualificação de **Leads** (site, WhatsApp, Instagram, marketplace, indicação)
- **Social Selling** receptivo e prospectivo (SDR2)
- **Prospecção ativa** (SDR3 - Hunter)
- **Repescagem de leads** (SDR4 - Sales Farmer)
- Criação e gestão de **Propostas** comerciais
- Definição e versionamento de **Pacotes**
- Processamento de **Pagamentos** (sinal e total)
- Registro de **Conversões** (lead → cliente pagante)
- **Escada de Valor** (Upsell/Cross-sell pós-conversão)
- **Handoff Humano** (SDR → Closer) com gatilhos explícitos
- Gatilhos de **Marketing** (e-mail, WhatsApp, push via eventos)
- Yield Management (desconto inteligente via Zé-Analyst)

### 1.4 Fronteira (O que NÃO pertence)
- Cadastro de hóspedes e reservas → **Hospitalidade Context**
- Execução de pagamentos (gateway real) → **Infraestrutura (Pagarme/Stripe)**
- Experiência durante a estadia → **Hospitalidade Context**
- Pós-checkout e feedback → **Hospitalidade Context**
- Criptografia, JWT, HMAC → **Segurança Context**
- Automação de limpeza e manutenção → **Operacional Context**
- Análise de sentimento e campanhas → **Marketing Context**
- Decisão de roteamento LLM → **Decision Context**

### 1.5 Interfaces de Porta (Segregadas)
O contexto expõe **5 portas granulares**. Nenhum agente ou serviço acessa entidades diretamente.

| Porta | Agente Consumidor |
|---|---|
| `ILeadPort` | Zé-Sales, Zé-Marketer, Zé-Closer (leitura) |
| `IPropostaPort` | Zé-Sales, Zé-Closer |
| `IPacotePort` | Zé-Marketer, Zé-Analyst |
| `IPagamentoPort` | Zé-Sales (leitura), Infraestrutura (escrita) |
| `IConversaoPort` | Zé-Sales, Zé-Analyst, Financeiro |

---

## 2. Linguagem Ubíqua (Glossário Comercial)

### 2.1 Personas e Papéis

| Termo | Definição |
|---|---|
| **Lead** | Pessoa física (PF) ou jurídica (PJ) com potencial de compra de uma solução ZEHLA. Origem: site, WhatsApp, Instagram, marketplace, indicação, presencial. |
| **ICP** | Ideal Customer Profile — perfil do cliente ideal. Guia a pontuação e qualificação do lead. Definição: `{ faturamentoMinimo, setor, cargo, regiao }` |
| **SDR** | Sales Development Representative — profissional de pré-vendas. No ZEHLA, o SDR é um agente de IA (Zé-Sales) com 4 especializações. |
| **Social Seller (SDR2)** | SDR especializado em Social Selling receptivo e prospectivo. Atua no Instagram, WhatsApp e redes sociais. |
| **Hunter (SDR3)** | SDR de prospecção ativa. Busca leads que se encaixam no ICP mas ainda não têm contato com a empresa. |
| **Sales Farmer (SDR4)** | SDR de repescagem. Atua na recuperação coordenada e periódica de leads frios ou perdidos. |
| **Closer** | Fechador de vendas (humano). Responsável pela reunião de fechamento, negociação de objeções e conversão. |
| **Zé-Sales** | Agente cognitivo de IA que atua como SDR1, SDR2, SDR3 e SDR4 conforme o estágio do lead. |
| **Zé-Closer** | Não é um agente de IA — é o humano no loop. O Zé-Sales prepara o terreno e faz handoff para o Closer no momento certo. |
| **Lead Score** | Nota de 0 a 100 que indica probabilidade de conversão. Calculado por: dados cadastrais + comportamento + fit com ICP + interações. |

### 2.2 Ciclo de Vida do Lead (Pipeline)

| Termo | Definição |
|---|---|
| **Entrada** | Lead é capturado por qualquer canal. Status inicial. |
| **Primeira Interação** | Zé-Sales (SDR1) faz o primeiro contato (WhatsApp, e-mail, direct). |
| **Follow-up** | Sequência de contatos programados (cadência) com intervalo definido por política. |
| **Agendamento** | Lead aceita uma reunião com o Closer. |
| **Sinal** | Percentual mínimo (padrão: 30-50%) do valor total pago para garantir a venda. |
| **No-Show** | Lead agendou mas não compareceu à reunião. Entra em cadência de recuperação. |
| **Venda com Sinal** | Lead pagou o sinal. Contrato firmado. Transição para Onboarding. |
| **Onboarding** | Período pós-venda onde o cliente é ambientado no produto ZEHLA. |
| **Sales Farming** | Ciclo de reaproximação de leads perdidos ou expirados em intervalos regulares. |
| **Handoff** | Transferência de um lead do SDR (IA) para o Closer (humano). |

### 2.3 Métricas Comerciais

| Termo | Definição |
|---|---|
| **Taxa de Agendamento** | % de leads que avançam para uma reunião agendada. Meta: 15-25% |
| **Taxa de Comparecimento** | % de leads que comparecem à reunião. Meta: > 70% |
| **Taxa de Conversão** | % de reuniões que viram venda. Meta: 20-30% |
| **Ticket Médio** | Valor médio das vendas realizadas. |
| **Ciclo de Vendas** | Tempo médio entre captura e conversão. |
| **CAC** | Custo de Aquisição de Cliente: investimento total / número de novos clientes. |
| **ROAS** | Retorno sobre investimento em anúncios. |
| **Custo por Lead** | Investimento em marketing / número de leads capturados. |
| **Custo por Comparecimento** | Custo por lead × taxa de comparecimento. |

### 2.4 Escada de Valor (Produtos)

| Termo | Definição |
|---|---|
| **Front-End** | Produto de entrada, baixo ticket. Ex: diagnóstico gratuito, isca digital, workshop. |
| **Back-End** | Produto principal, ticket médio. Ex: ZEHLA PRIME (plano mensal). |
| **High-End** | Produto premium, alto ticket. Ex: ZEHLA Enterprise, consultoria dedicada. |
| **Isca** | Produto gratuito ou de custo muito baixo para atrair o ICP. Ex: Playbook, calculadora online. |
| **Complementar** | Upsell/Cross-sell pós-venda. Ex: módulo de IA avançado, treinamento de equipe. |
| **Upsell** | Upgrade para um plano superior (ex: Lite → Pro, Pro → Max). |
| **Cross-sell** | Adição de módulo complementar sem mudar o plano base. |

---

## 3. A Máquina de Estados do Lead (FSM)

### 3.1 Pipeline Completo (Pré-Vendas + Vendas + Pós-Vendas)

O pipeline segue a estrutura dogmática do Playbook FSS, dividido em 3 setores:

```
PRÉ-VENDAS (Zé-Sales / IA)
──────────────────────────────────────────────
    Entrada → Primeira Interação → Follow-up 1 → Follow-up 2 → Follow-up 3 → Agendamento
                                                                                  │
                                                                    (Reagendamento ← ┘)
                                                                                  │
                                                                       Transferência de SDR
                                                                                  │
                                                                            ┌─────┴──────┐
                                                                            │            │
                                                                       Compareceu    No-Show
                                                                            │
VENDAS (Closer / Humano)                                                      │
──────────────────────────────────────────────                                │
                                                                             │
                                                                   Agendado (reunião de fechamento)
                                                                        │              │
                                                                   Venda c/        Perdeu
                                                                   Sinal
                                                                     │
                                                              Venda Concluída
                                                                     │
PÓS-VENDAS (Zé-Onboarding)                                               │
──────────────────────────────────────────────                          │
                                                                 Onboarding
                                                                     │
                                                            Acompanhamento
                                                                     │
                                                            Renovação
```

### 3.2 Estados do Lead (Formal)

| Estado | Setor | Descrição |
|---|---|---|
| `entrada` | Pré-Vendas | Lead capturado, nenhuma ação tomada |
| `primeira_interacao` | Pré-Vendas | Zé-Sales fez o primeiro contato |
| `follow_up_1` | Pré-Vendas | Primeiro follow-up da cadência |
| `follow_up_2` | Pré-Vendas | Segundo follow-up da cadência |
| `follow_up_3` | Pré-Vendas | Terceiro follow-up da cadência |
| `agendado` | Pré-Vendas | Lead agendou reunião com o Closer |
| `reagendado` | Pré-Vendas | Lead reagendou a reunião |
| `no_show` | Pré-Vendas | Lead não compareceu à reunião |
| `transferido_sdr` | Pré-Vendas | Lead transferido entre SDRs |
| `em_negociacao` | Vendas | Closer está conduzindo a reunião de fechamento |
| `venda_sinal` | Vendas | Lead pagou o sinal, venda garantida |
| `venda_concluida` | Vendas | Pagamento total confirmado |
| `perdido` | Vendas | Lead recusou ou desistiu |
| `em_onboarding` | Pós-Vendas | Cliente em processo de ambientação |
| `acompanhamento` | Pós-Vendas | Cliente ativo, em uso do produto |
| `renovacao` | Pós-Vendas | Próximo do vencimento, em negociação de renovação |
| `sales_farming` | Repescagem | Lead frio sendo reaproximado periodicamente |

### 3.3 Transições Válidas (Grafo FSM)

```
entrada ──(primeiro_contato)──→ primeira_interacao
primeira_interacao ──(follow_up)──→ follow_up_1
follow_up_1 ──(follow_up)──→ follow_up_2
follow_up_2 ──(follow_up)──→ follow_up_3
follow_up_3 ──(agendar)──→ agendado
qualquer follow_up ──(agendar)──→ agendado
agendado ──(reagendar)──→ reagendado
reagendado ──(reagendar)──→ reagendado
agendado ──(no_show)──→ no_show
no_show ──(reagendar)──→ reagendado
agendado ──(transferir_sdr)──→ transferido_sdr
transferido_sdr ──(agendar)──→ agendado
agendado ──(iniciar_negociacao)──→ em_negociacao
em_negociacao ──(fechar_sinal)──→ venda_sinal
venda_sinal ──(concluir_pagamento)──→ venda_concluida
venda_concluida ──(iniciar_onboarding)──→ em_onboarding
em_onboarding ──(completar_onboarding)──→ acompanhamento
acompanhamento ──(proximo_renovacao)──→ renovacao
renovacao ──(renovar)──→ acompanhamento
qualquer estado (exceto venda_sinal, venda_concluida, em_onboarding) ──(perder)──→ perdido
perdido ──(reativar)──→ entrada
qualquer estado sem interação por 30+ dias ──→ sales_farming (automático)
sales_farming ──(follow_up)──→ primeira_interacao
sales_farming ──(perder)──→ perdido
```

### 3.4 Invariantes (Dogmas da FSM)

| # | Invariante | Justificativa (Playbook FSS) |
|---|---|---|
| 1 | Um lead NÃO pode pular de `entrada` para `venda_sinal` sem passar por `agendado` e `em_negociacao` | O Playbook determina que a qualificação e o agendamento são etapas obrigatórias para garantir a qualidade da venda. Pular etapas queima o Closer com leads não qualificados. |
| 2 | Um lead NÃO pode ir de `follow_up_1` para `follow_up_3` sem passar por `follow_up_2` | A cadência de follow-up existe para aquecer o lead gradualmente. Pulá-la quebra a taxa de agendamento (meta: 15-25%). |
| 3 | `venda_sinal` exige um `Pagamento` confirmado com tipo `sinal` (mínimo 30% do valor) | O sinal é a prova de compromisso financeiro. Sem ele, o lead pode desistir sem custo. |
| 4 | `venda_concluida` exige que a soma de pagamentos confirmados ≥ valor total da proposta | A venda só é concluída quando o valor integral está garantido. |
| 5 | `perdido` só pode sair para `entrada` via reativação explícita | Um lead perdido não pode ser reaquecido automaticamente — exige uma nova abordagem estratégica. |
| 6 | Um lead em `em_onboarding` ou `acompanhamento` não pode retroceder no funil | Cliente ativo está em jornada pós-venda; não faz sentido recolocá-lo no funil de captação. |
| 7 | A transição automática `→ sales_farming` só ocorre após 30+ dias sem interação | O Playbook define a repescagem como um ciclo coordenado, não aleatório. |
| 8 | Todo lead em `agendado` tem um tempo máximo de 7 dias para comparecer. Após isso → `no_show` automático | O Playbook estipula que a taxa de comparecimento deve ser > 70%. Leads que não comparecem precisam ser recuperados ativamente. |

### 3.5 Atributos da Entidade Lead (Modelo Rico)

**Identidade:** `leadId: UUIDv7`

**Atributos imutáveis:**
- `canal` — enum: `site | whatsapp | instagram | booking-engine | marketplace | indicacao | presencial`
- `dataCaptura` — timestamp ISO
- `propriedadeId` — escopo RLS (tenant)

**Atributos mutáveis:**
- `nome` — string não-vazia, mínimo 2 caracteres
- `email` — Value Object `Email`, validado estruturalmente
- `telefone` — string BR formatada (opcional)
- `documento` — Value Object `Documento` (CPF/CNPJ), opcional até a conversão
- `empresa` — string, nome do negócio (opcional)
- `cargo` — string, cargo do contato (opcional)
- `faturamentoEstimado` — Money, para validação de ICP (opcional)
- `score` — inteiro 0-100
- `estado` — enum FSM (seção 3.2)
- `icpFit` — enum: `ideal | minimo | fora_icp`
- `tipoSdr` — enum: `sdr1_funis | sdr2_social_seller | sdr3_hunter | sdr4_sales_farmer | closer`
- `sdrResponsavel` — string, ID do SDR (agente ou humano)
- `closerResponsavel` — string, ID do Closer (humano), opcional até agendamento
- `ultimaInteracao` — timestamp da última atividade
- `quantidadeInteracoes` — contador de interações no ciclo atual
- `origemUrl` — string, URL de captura com UTM params
- `tags` — array de strings para segmentação
- `observacoes` — texto livre, até 1000 caracteres
- `dataAgendamento` — timestamp, preenchido quando transita para `agendado`
- `dataUltimoFollowUp` — timestamp do último follow-up enviado

**Eventos emitidos:**
- `LeadCapturadoEvent` — lead criado
- `LeadPrimeiraInteracaoEvent` — primeiro contato feito
- `LeadFollowUpRealizadoEvent` — follow-up enviado
- `LeadAgendadoEvent` — reunião agendada
- `LeadNoShowEvent` — lead não compareceu
- `LeadReagendadoEvent` — reagendamento ocorreu
- `LeadHandoffParaCloserEvent` — lead transferido para o Closer
- `LeadEmNegociacaoEvent` — Closer iniciou negociação
- `LeadVendaSinalEvent` — sinal pago
- `LeadVendaConcluidaEvent` — pagamento total confirmado
- `LeadPerdidoEvent` — lead perdido
- `LeadReativadoEvent` — lead reativado
- `LeadSalesFarmingEvent` — lead entrou em ciclo de repescagem
- `LeadOnboardingIniciadoEvent` — cliente em onboarding
- `LeadRenovacaoProximaEvent` — renovação próxima

---

## 4. O Modelo de Agenciamento (Zé-Sales SDR)

### 4.1 Arquitetura do Zé-Sales

O Zé-Sales é um **agente cognitivo de IA** que incorpora os 4 papéis de SDR definidos pelo Playbook FSS. Ele não é um chatbot genérico — é um sistema especialista que segue roteiros, cadências e gatilhos rigorosos.

```
Zé-Sales (Agente Mestre)
├── Modo SDR1 (Funis)
│   ├── Atende leads de funil (site, booking-engine, marketplace)
│   ├── Segue cadência fixa de 30 dias
│   └── Scripts de abordagem: ligação → WhatsApp → e-mail
├── Modo SDR2 (Social Seller)
│   ├── Atua no Social Selling receptivo (direct Instagram, comentários)
│   ├── Atua no Social Selling prospectivo (abordagem ativa de seguidores)
│   └── 50-150 abordagens/dia, 30-50 directs/dia
├── Modo SDR3 (Hunter)
│   ├── Prospecção ativa em leads que se encaixam no ICP
│   ├── Busca em listas, grupos, concorrentes, hashtags
│   └── Abordagem fria qualificada
└── Modo SDR4 (Sales Farmer)
    ├── Repescagem coordenada da base fria
    ├── Cadência trimestral de reaproximação
    └── Ofertas especiais para reativação
```

### 4.2 Fronteira de Atuação da IA (O que Zé-Sales PODE)

**PODE:**
- Capturar leads de todos os canais (automático via webhook ou manual)
- Classificar o lead por ICP Fit e calcular score
- Executar a cadência de follow-up completa (SDR1) — até 3 follow-ups
- Realizar Social Selling receptivo (SDR2) — responder directs e comentários
- Realizar Social Selling prospectivo (SDR2) — abordar seguidores que se encaixam no ICP
- Prospectar ativamente (SDR3) — buscar leads em listas públicas, grupos, hashtags
- Qualificar leads via perguntas estruturadas (BANT: Budget, Authority, Need, Timeline)
- Agendar reuniões na agenda do Closer (via integração de calendário)
- Criar e editar propostas comerciais (rascunho, envio, negociação básica)
- Aplicar descontos padrão (até 10%) desde que validados pelo Zé-Analyst
- Executar repescagem (SDR4) — reativar leads perdidos com ofertas especiais
- Enviar lembretes automáticos de reunião (reduzir no-show)
- Atualizar o estado do lead na FSM conforme as interações
- Disparar eventos de domínio para outros contextos

### 4.3 Fronteira de Atuação da IA (O que Zé-Sales NÃO PODE)

**NÃO PODE:**
- ❌ Conduzir a reunião de fechamento — isso é domínio exclusivo do Closer humano
- ❌ Aprovar descontos acima de 10% — precisa de validação do Zé-Analyst + Closer
- ❌ Confirmar pagamentos — processamento é feito por gateway externo
- ❌ Aceitar ou recusar propostas em nome do lead — o lead precisa agir
- ❌ Acessar dados de outros tenants (RLS inviolável)
- ❌ Modificar proposta depois de `aceita` ou `convertida`
- ❌ Criar conversão manualmente — conversão só existe após pagamento confirmado
- ❌ Excluir leads ou propostas
- ❌ Alterar regras de precificação de pacotes
- ❌ Decidir sozinho que um lead é `perdido` — precisa de 30+ dias sem interação

### 4.4 Gatilhos de Handoff Humano (SDR → Closer)

O **Handoff** é o momento crítico onde o Zé-Sales (IA) para de atuar e repassa o controle para o Closer (humano). Esses gatilhos são dogmáticos e não podem ser ignorados pela IA.

#### Gatilhos OBRIGATÓRIOS de Handoff

| # | Gatilho | Condição | Ação |
|---|---|---|---|
| H1 | **ICP Confirmado** | Lead respondeu às perguntas de qualificação e se encaixa no ICP mínimo | Zé-Sales agenda reunião e transfere para o Closer |
| H2 | **Interesse Explícito** | Lead perguntou "quanto custa?", "como funciona?", "quero comprar" | Handoff imediato sem follow-up adicional |
| H3 | **Objeção Complexa** | Lead levantou objeção técnica, financeira ou legal que a IA não pode resolver | Zé-Sales documenta objeção e passa para o Closer |
| H4 | **Reagendamento > 2x** | Lead reagendou a reunião mais de 2 vezes | Zé-Sales para de tentar e notifica o Closer para intervenção manual |
| H5 | **Solicitação Explícita** | Lead pediu para falar com um humano | Handoff imediato e obrigatório |

#### Gatilhos OPCIONAIS de Handoff

| # | Gatilho | Condição | Ação |
|---|---|---|---|
| H6 | **Alto Score** | Lead com score > 80 e ICP ideal | Zé-Sales pode optar por acelerar o handoff |
| H7 | **Proposta Vista sem Retorno** | Lead visualizou proposta mas não respondeu em 48h | Zé-Sales notifica Closer para call de fechamento |
| H8 | **Objeção de Preço** | Lead disse "é caro" ou "não tenho budget" | Zé-Sales aplica desconto padrão; se lead recusar, handoff para Closer |

#### Protocolo de Handoff

```
1. Zé-Sales identifica gatilho de handoff
2. Zé-Sales congela o lead no estado atual (ex: agendado, em_negociacao)
3. Zé-Sales gera um SummaryPackage contendo:
   a. Histórico completo de interações
   b. Respostas do lead às perguntas de qualificação
   c. Score e ICP Fit
   d. Objeções levantadas e respostas dadas
   e. Próximo passo recomendado pelo Zé-Sales
4. Zé-Sales dispara LeadHandoffParaCloserEvent
5. Closer recebe notificação com o SummaryPackage
6. Lead é marcado com tipoSdr = 'closer'
7. Zé-Sales para de interagir com o lead (exceto se Closer devolver)
```

#### Protocolo de Devolução (Closer → SDR)

Se o Closer identificar que o lead não está pronto para fechamento, ele pode **devolver** o lead para o Zé-Sales com instruções:

```
1. Closer marca lead para devolução com motivo (ex: "lead precisa de mais nutrição")
2. Zé-Sales retoma o lead no estado anterior (ex: follow_up_2)
3. Zé-Sales ajusta a cadência conforme as instruções do Closer
4. Lead é marcado com o tipoSdr apropriado
```

---

## 5. Casos de Uso (Application Layer)

### 5.1 CapturarLeadUseCase
- **Input:** `{ canal, nome?, email?, telefone?, empresa?, cargo?, origemUrl?, tags?, utmParams? }`
- **Fluxo:**
  1. Verifica duplicidade por email ou telefone
  2. Se lead existente e `perdido` ou `sales_farming` → reativa
  3. Se lead existente e ativo → retorna lead existente (não duplica)
  4. Calcula ICP Fit e Score iniciais
  5. Cria Lead com estado `entrada` e tipoSdr conforme canal:
     - `site`, `booking-engine`, `marketplace` → sdr1_funis
     - `instagram` → sdr2_social_seller
     - `indicacao` → sdr1_funis
     - `presencial`, `whatsapp` → sdr1_funis
  6. Dispara `LeadCapturadoEvent`
- **Output:** `Result<Lead, Erro>`

### 5.2 QualificarLeadUseCase
- **Input:** `{ leadId }`
- **Fluxo:**
  1. Busca lead por ID
  2. Executa perguntas de qualificação BANT (via Zé-Sales):
     - **B**udget: lead tem orçamento? qual a faixa?
     - **A**uthority: lead tem poder de decisão?
     - **N**eed: qual a necessidade identificada?
     - **T**imeline: qual o prazo para implementação?
  3. Recalcula score com base nas respostas
  4. Se score ≥ 50: lead é qualificado como ICP ideal
  5. Se score ≥ 30 e < 50: lead é qualificado como ICP mínimo
  6. Se score < 30: lead permanece em follow-up para mais nutrição
  7. Atualiza `icpFit` e dispara `LeadQualificadoEvent`
- **Output:** `Result<Lead, Erro>`

### 5.3 MoverPipelineUseCase (Validador da FSM)
- **Input:** `{ leadId, novaEstado, metadata? }`
- **Fluxo:**
  1. Busca lead por ID
  2. Valida a transição no grafo FSM (seção 3.3)
  3. Se transição inválida → retorna erro `TRANSICAO_INVALIDA`
  4. Valida invariantes da transição (seção 3.4):
     - Se `agendado`: valida que existe data de agendamento
     - Se `venda_sinal`: valida que existe pagamento do tipo sinal confirmado
     - Se `venda_concluida`: valida que soma de pagamentos ≥ valor total
     - Se `perdido`: valida que lead está há 30+ dias sem interação
  5. Se `follow_up`: incrementa `quantidadeInteracoes` e atualiza `dataUltimoFollowUp`
  6. Atualiza estado do lead
  7. Dispara evento de domínio correspondente
- **Invariante:** O estado transicionado deve respeitar EXATAMENTE o grafo FSM. Não existe "atalho".
- **Output:** `Result<Lead, Erro>`

### 5.4 ExecutarCadenciaFollowUpUseCase
- **Input:** `{ leadId }`
- **Fluxo:**
  1. Busca lead com estado em follow_up_1, follow_up_2, ou follow_up_3
  2. Verifica intervalo mínimo desde o último follow-up:
     - Follow-up 1 → 24h após primeira interação
     - Follow-up 2 → 48h após follow-up 1
     - Follow-up 3 → 72h após follow-up 2
  3. Se intervalo não respeitado → retorna erro `INTERVALO_FOLLOWUP_INVALIDO`
  4. Gera mensagem personalizada baseada no perfil do lead e estágio
  5. Envia via canal preferencial do lead (WhatsApp > E-mail > Instagram)
  6. Transita lead para próximo estado de follow-up (ou mantém se for o último)
  7. Dispara `LeadFollowUpRealizadoEvent`
- **Output:** `Result<Lead, Erro>`

### 5.5 RealizarHandoffParaCloserUseCase
- **Input:** `{ leadId, gatilho, summaryPackage }`
- **Fluxo:**
  1. Busca lead, valida que está em estado que permite handoff (`agendado`, `em_negociacao`)
  2. Gera SummaryPackage com:
     - Histórico de interações
     - Respostas BANT
     - Score e ICP Fit
     - Objeções e respostas
     - Próximo passo recomendado
  3. Marca lead com `tipoSdr = 'closer'`
  4. Atribui `closerResponsavel` (próximo Closer disponível por round-robin)
  5. Dispara `LeadHandoffParaCloserEvent` com SummaryPackage
  6. Zé-Sales para de interagir com o lead (modo leitura)
- **Output:** `Result<{ lead: Lead; summaryPackage: SummaryPackage }, Erro>`

### 5.6 RegistrarPagamentoSinalUseCase
- **Input:** `{ propostaId, metodo, valor }`
- **Fluxo:**
  1. Busca proposta, valida que está `aceita`
  2. Valida que valor do sinal está entre 30% e 50% do valor total
  3. Cria Pagamento com tipo `sinal`, status `pendente`
  4. Dispara `PagamentoSinalSolicitadoEvent`
- **Output:** `Result<Pagamento, Erro>`

### 5.7 ConfirmarPagamentoUseCase
- **Input:** `{ pagamentoId, codigoTransacao }`
- **Fluxo:**
  1. Busca pagamento, valida status `pendente`
  2. Transita para `confirmado`
  3. Se pagamento é `sinal`:
     - Busca lead vinculado
     - Transita lead para `venda_sinal` via MoverPipelineUseCase
     - Dispara `LeadVendaSinalEvent`
  4. Se pagamento é `total` (ou complemento) e já existe sinal:
     - Verifica se soma de pagamentos ≥ valor total
     - Se sim: transita lead para `venda_concluida`
     - Dispara `LeadVendaConcluidaEvent` → `ConversaoRegistradaEvent`
- **Output:** `Result<Pagamento, Erro>`

### 5.8 CalcularEscadaDeValorUseCase (Upsell/Cross-sell)
- **Input:** `{ leadId, produtoAtual }`
- **Fluxo:**
  1. Busca lead pelo ID (deve estar em `venda_concluida`, `em_onboarding` ou `acompanhamento`)
  2. Identifica o plano/produto atual do cliente
  3. Consulta a matriz de Upsell/Cross-sell:
     - Se plano `Lite` → sugere upgrade para `Pro` (+X% de valor)
     - Se plano `Pro` → sugere upgrade para `Max` (+Y% de valor)
     - Se plano `Max` → sugere módulos complementares (IA avançada, treinamento)
  4. Calcula o valor adicional potencial:
     - `valorUpsell = precoProximoPlano - precoPlanoAtual`
     - `valorCrossSell = somaDosModulosComplementares`
     - `valorTotalEscada = max(valorUpsell, valorCrossSell) * probabilidadePorPerfil`
  5. Gera recomendação textual para o Zé-Sales ou Closer abordar na renovação
  6. Dispara `EscadaDeValorCalculadaEvent`
- **Output:** `Result<{ recomendacao: string; valorPotencial: Money; acoes: AcaoRecomendada[] }, Erro>`

### 5.9 ProcessarNoShowUseCase (Job Automático)
- **Input:** `{ leadId }`
- **Fluxo:**
  1. Busca leads em `agendado` com data de agendamento > 24h sem comparecimento
  2. Transita para `no_show`
  3. Zé-Sales envia mensagem de recuperação: "Notamos que você não pôde comparecer..."
  4. Oferece novo agendamento (reagendamento)
  5. Dispara `LeadNoShowEvent`
- **Output:** `Result<void, Erro>`

### 5.10 ExecutarSalesFarmingUseCase (Job de Repescagem)
- **Input:** `{ leadId }`
- **Fluxo:**
  1. Busca leads nos estados `perdido` ou sem interação há 30+ dias
  2. Transita para `sales_farming`
  3. Zé-Sales envia oferta especial de reativação (ex: 15% de desconto no primeiro mês)
  4. Se lead responde → transita para `primeira_interacao`
  5. Se lead não responde em 30 dias → mantém em `sales_farming` (ciclo trimestral)
  6. Dispara `LeadSalesFarmingEvent`
- **Output:** `Result<void, Erro>`

---

## 6. A Escada de Valor (Value Ladder)

### 6.1 Matriz de Produtos ZEHLA

| Degrau | Produto | Ticket Médio | Público-Alvo |
|---|---|---|---|
| **Isca** | Playbook / Diagnóstico Gratuito | R$ 0 | Todo lead |
| **Front-End** | ZEHLA Lite | R$ 97-197/mês | Pequenas pousadas (1-5 quartos) |
| **Back-End** | ZEHLA Pro | R$ 497-997/mês | Pousadas médias (5-20 quartos) |
| **High-End** | ZEHLA Max | R$ 1.997-4.997/mês | Hotéis e redes (20+ quartos) |
| **Complementar** | Módulo IA Avançada | +R$ 297/mês | Qualquer plano |
| **Complementar** | Treinamento de Equipe | R$ 2.997 (único) | Qualquer plano |
| **Complementar** | Consultoria Dedicada | R$ 9.997/mês | Planos Pro e Max |

### 6.2 Regras de Upsell

| De | Para | Gatilho | Timing |
|---|---|---|---|
| Lite | Pro | Cliente atingiu 80% da capacidade do plano | Após 3 meses de uso ativo |
| Lite | Max | Cliente cresceu 2x+ desde a contratação | Após 6 meses |
| Pro | Max | Cliente atingiu 80% da capacidade do plano | Após 3 meses de uso ativo |
| Qualquer | +IA | Cliente usa o sistema há 2+ meses | Na renovação |

### 6.3 Regras de Cross-sell

| Produto Base | Complementar | Gatilho |
|---|---|---|
| Lite/Pro/Max | Treinamento de Equipe | Nova contratação de colaborador |
| Lite/Pro/Max | Consultoria Dedicada | Cliente com ticket > R$ 2.000/mês |
| Pro/Max | Módulo IA Avançada | Cliente usa recursos básicos de IA há 1+ mês |

---

## 7. Reatividade via Domain Events

### 7.1 Catálogo de Eventos

| Evento | Origem (Caso de Uso) | Payload | Consumidores | Ação |
|---|---|---|---|---|
| `LeadCapturadoEvent` | CapturarLeadUseCase | `{ leadId, nome, email, canal, score, icpFit }` | Zé-Marketer, N8N | Iniciar nutrição + disparar webhook de boas-vindas |
| `LeadQualificadoEvent` | QualificarLeadUseCase | `{ leadId, score, icpFit, questoesBant }` | Zé-Sales (SDR1), N8N | Avançar na cadência + notificar SDR |
| `LeadAgendadoEvent` | MoverPipelineUseCase | `{ leadId, dataAgendamento, closerId }` | Closer, N8N, Google Calendar | Criar evento na agenda do Closer + email de confirmação |
| `LeadHandoffParaCloserEvent` | RealizarHandoffParaCloserUseCase | `{ leadId, closerId, summaryPackage }` | Closer, N8N, Slack | Notificar Closer com resumo do lead + disparar alerta |
| `LeadNoShowEvent` | ProcessarNoShowUseCase | `{ leadId, dataAgendamentoOriginal }` | Zé-Sales (SDR4), N8N | Disparar mensagem de recuperação + oferta de reagendamento |
| `LeadVendaSinalEvent` | ConfirmarPagamentoUseCase | `{ leadId, propostaId, valorSinal, plano }` | Financeiro, N8N, Slack | Criar contrato + notificar equipe + disparar onboarding |
| `LeadVendaConcluidaEvent` | ConfirmarPagamentoUseCase | `{ leadId, conversaoId, valorTotal, plano }` | Hospitalidade, Financeiro, N8N | Criar cadastro de hóspede + emitir NF + disparar checklist de onboarding |
| `LeadPerdidoEvent` | MoverPipelineUseCase | `{ leadId, motivo, diasNoFunil }` | Zé-Marketer, N8N | Adicionar a lista de repescagem + disparar oferta de recuperação em 30 dias |
| `LeadSalesFarmingEvent` | ExecutarSalesFarmingUseCase | `{ leadId, diasDesdeUltimaInteracao }` | Zé-Sales (SDR4), N8N | Iniciar cadência trimestral de reaproximação |
| `EscadaDeValorCalculadaEvent` | CalcularEscadaDeValorUseCase | `{ leadId, produtoAtual, upsellSugerido, crossSellSugerido, valorPotencial }` | Zé-Sales, N8N | Agendar abordagem de renovação com oferta de upgrade |
| `PropostaCriadaEvent` | CriarPropostaUseCase | `{ propostaId, leadId, valorTotal, pacote }` | Zé-Sales, Zé-Marketer | Acompanhar funil + notificar lead |
| `PropostaAceitaEvent` | AceitarPropostaUseCase | `{ propostaId, leadId, valorSinal }` | Zé-Sales, Financeiro | Solicitar pagamento do sinal |
| `PagamentoRecusadoEvent` | ConfirmarPagamentoUseCase | `{ pagamentoId, propostaId, motivo }` | Zé-Sales, N8N | Notificar lead + oferecer nova forma de pagamento |
| `ConversaoRegistradaEvent` | ConfirmarPagamentoUseCase | `{ leadId, conversaoId, valorTotal, plano }` | **Hospitalidade Context**, N8N, Slack | Criar cadastro de hóspede + disparar onboarding |

### 7.2 Mapa de Reatividade Assíncrona

```
                    ┌──────────────────────────────────────────────┐
                    │               DOMÍNIO COMERCIAL              │
                    │                                              │
                    │  Casos de Uso ──emitem──→ DomainEvents       │
                    │                           │                  │
                    └───────────────────────────┼──────────────────┘
                                                │
                    ┌───────────────────────────┼──────────────────┐
                    │                           ▼                  │
                    │                Message Bus (Event Bus)       │
                    │                           │                  │
                    │          ┌────────────────┼────────────┐     │
                    │          ▼                ▼            ▼     │
                    │    Zé-Sales (IA)    Zé-Marketer (IA)   N8N  │
                    │    (processa evento (processa evento   │     │
                    │     e decide ação)  e decide ação)     │     │
                    │                                        ▼     │
                    │                                  Webhooks   │
                    │                              (E-mail, SMS,  │
                    │                               Slack,        │
                    │                              Google Calendar)│
                    └──────────────────────────────────────────────┘

```

### 7.3 Contrato de Eventos (Exemplo)

```typescript
interface DomainEvent {
  eventId: string       // UUIDv7
  aggregateId: string   // ID da entidade raiz
  aggregateType: string // "lead" | "proposta" | "pagamento" | "conversao"
  eventType: string     // ex: "LeadHandoffParaCloserEvent"
  timestamp: string     // ISO 8601
  data: Record<string, unknown>
  metadata: {
    tenantId: string
    correlationId: string  // rastreabilidade entre eventos do mesmo fluxo
    causationId?: string   // evento que causou este evento
  }
}

// Exemplo concreto:
// LeadHandoffParaCloserEvent
{
  eventId: "0193a7f0-5e6b-7b00-8c00-123456789abc",
  aggregateId: "lead_abc123",
  aggregateType: "lead",
  eventType: "LeadHandoffParaCloserEvent",
  timestamp: "2026-06-01T14:30:00.000Z",
  data: {
    leadId: "lead_abc123",
    closerId: "closer_456",
    summaryPackage: {
      score: 85,
      icpFit: "ideal",
      interacoes: 4,
      objecoes: ["preco"],
      respostas: ["cliente disse que precisa ver ROI"],
      ultimoEstado: "agendado"
    },
    gatilho: "H1-ICP_CONFIRMADO"
  },
  metadata: {
    tenantId: "tenant_pousada_sol",
    correlationId: "flow_lead_abc123_20260601",
    causationId: "event_qualificacao_abc123"
  }
}
```

---

## 8. Portas (Interfaces)

### 8.1 ILeadPort
```typescript
interface ILeadPort {
  getById(id: string): Promise<Result<Lead, Error>>
  getByEmail(email: string): Promise<Result<Lead | null, Error>>
  search(criteria: LeadSearchCriteria): Promise<Result<Lead[], Error>>
  save(lead: Lead): Promise<Result<Lead, Error>>
  delete(id: string): Promise<Result<void, Error>>
  countByPeriod(inicio: Date, fim: Date): Promise<Result<number, Error>>
  listByCanal(canal: Canal): Promise<Result<Lead[], Error>>
  listByEstado(estado: EstadoLead): Promise<Result<Lead[], Error>>
  listBySdrResponsavel(sdrId: string): Promise<Result<Lead[], Error>>
  listByCloserResponsavel(closerId: string): Promise<Result<Lead[], Error>>
  listParaFollowUp(): Promise<Result<Lead[], Error>>            // leads que precisam de follow-up hoje
  listParaNoShow(): Promise<Result<Lead[], Error>>              // leads agendados há > 24h sem ação
  listParaSalesFarming(): Promise<Result<Lead[], Error>>        // leads sem interação há 30+ dias
  listParaReativacao(): Promise<Result<Lead[], Error>>          // leads em sales_farming há 90+ dias
}
```

### 8.2 IPropostaPort, IPacotePort, IPagamentoPort, IConversaoPort
(As interfaces permanecem conforme especificado na versão anterior — vide seções 5.2 a 5.5 da v1.)

---

## 9. Invariantes de Negócio (Resumo)

| # | Invariante | Onde é validada | Playbook FSS |
|---|---|---|---|
| 1 | Transições de estado respeitam o grafo FSM dogmático | `MoverPipelineUseCase` | Funil não pode pular etapas |
| 2 | Lead não pula de `entrada` para `venda_sinal` | `MoverPipelineUseCase` | Qualificação obrigatória |
| 3 | `follow_up_N` segue ordem sequencial | `ExecutarCadenciaFollowUpUseCase` | Cadência precisa ser respeitada |
| 4 | Sinal mínimo de 30% do valor total | `RegistrarPagamentoSinalUseCase` | Compromisso financeiro mínimo |
| 5 | Sinal máximo de 50% do valor total | `RegistrarPagamentoSinalUseCase` | Não onerar o cliente |
| 6 | Handoff só ocorre em estados permitidos | `RealizarHandoffParaCloserUseCase` | Não queimar o Closer |
| 7 | Intervalo mínimo entre follow-ups respeitado | `ExecutarCadenciaFollowUpUseCase` | Não spammar o lead |
| 8 | Lead `perdido` exige 30+ dias sem interação | `MoverPipelineUseCase` | Não desistir cedo demais |
| 9 | Conversão só existe com pagamento confirmado | `ConfirmarPagamentoUseCase` | Venda só é venda com dinheiro |
| 10 | Um lead = uma conversão ativa | `IConversaoPort` | Integridade do cliente |
| 11 | Escada de Valor só calculada para clientes ativos | `CalcularEscadaDeValorUseCase` | Upsell só para quem já comprou |
| 12 | RLS: dado comercial pertence a UMA propriedade | Todas as portas | Isolamento de tenant |

---

## 10. Mapa de Agentes

| Agente | Papel | Contexto | Portas Consumidas | Gatilhos |
|---|---|---|---|---|
| **Zé-Sales** | SDR1 (Funis) | Comercial (Pré-Vendas) | `ILeadPort`, `IPropostaPort` | Lead capturado, follow-up programado |
| **Zé-Sales** | SDR2 (Social Seller) | Comercial (Social) | `ILeadPort` | Direct Instagram, comentário, menção |
| **Zé-Sales** | SDR3 (Hunter) | Comercial (Prospecção) | `ILeadPort` | Lista de ICP, hashtag, concorrente |
| **Zé-Sales** | SDR4 (Sales Farmer) | Comercial (Repescagem) | `ILeadPort` | 30+ dias sem interação, `LeadSalesFarmingEvent` |
| **Zé-Closer** | Closer (Humano) | Comercial (Vendas) | `ILeadPort` (leitura), `IPropostaPort` (escrita) | `LeadHandoffParaCloserEvent` |
| **Zé-Marketer** | Marketing | Marketing Context | `ILeadPort` (leitura) | `LeadCapturadoEvent`, nutrição |
| **Zé-Analyst** | Yield | Revenue Context | `IPacotePort` (leitura) | Ocupação baixa, desconto |

---

## 11. Erros de Domínio

| Código | Mensagem | Contexto |
|---|---|---|
| `TRANSICAO_INVALIDA` | A transição solicitada não é permitida no grafo FSM | `MoverPipelineUseCase` |
| `LEAD_JA_CONVERTIDO` | Este lead já foi convertido | `CapturarLeadUseCase` |
| `SCORE_INSUFICIENTE` | Score mínimo para qualificação é 30 | `QualificarLeadUseCase` |
| `ICP_FIT_INSUFICIENTE` | Lead não se encaixa no ICP mínimo | `QualificarLeadUseCase` |
| `INTERVALO_FOLLOWUP_INVALIDO` | Intervalo mínimo entre follow-ups não respeitado | `ExecutarCadenciaFollowUpUseCase` |
| `HANDOFF_NAO_PERMITIDO` | Handoff só pode ocorrer nos estados `agendado` ou `em_negociacao` | `RealizarHandoffParaCloserUseCase` |
| `SINAL_ACIMA_MAXIMO` | Sinal não pode exceder 50% do valor total | `RegistrarPagamentoSinalUseCase` |
| `SINAL_ABAIXO_MINIMO` | Sinal mínimo é 30% do valor total | `RegistrarPagamentoSinalUseCase` |
| `LEAD_NAO_ATIVO` | Escada de Valor só pode ser calculada para clientes ativos | `CalcularEscadaDeValorUseCase` |
| `LEAD_NOT_FOUND` | Lead não encontrado | `ILeadPort` |
| `PROPOSTA_NOT_FOUND` | Proposta não encontrada | `IPropostaPort` |
| `PROPOSTA_EXPIRED` | Proposta expirada | `AceitarPropostaUseCase` |
| `PAGAMENTO_NOT_FOUND` | Pagamento não encontrado | `IPagamentoPort` |
| `CONVERSAO_NOT_FOUND` | Conversão não encontrada | `IConversaoPort` |
| `PAGAMENTO_EXCEDE_TOTAL` | Soma de pagamentos excede valor total da proposta | `ConfirmarPagamentoUseCase` |

---

## 12. Glossário de Eventos vs Automações Externas (N8N)

| Evento | Webhook / Automação | Canal | Gatilho N8N |
|---|---|---|---|
| `LeadCapturadoEvent` | Boas-vindas automáticas | WhatsApp + E-mail | `POST /webhook/boas-vindas` |
| `LeadQualificadoEvent` | Notificar SDR responsável | Slack / Discord | `POST /webhook/notificar-sdr` |
| `LeadAgendadoEvent` | Criar evento no Google Calendar | Google Calendar API | `POST /webhook/criar-evento` |
| `LeadHandoffParaCloserEvent` | Notificar Closer com resumo | Slack + WhatsApp | `POST /webhook/notificar-closer` |
| `LeadNoShowEvent` | Disparar mensagem de recuperação | WhatsApp | `POST /webhook/recuperar-no-show` |
| `LeadVendaSinalEvent` | Parabenizar equipe + criar contrato | Slack + E-mail | `POST /webhook/venda-sinal` |
| `LeadVendaConcluidaEvent` | Emitir NF + iniciar onboarding | API Financeira + E-mail | `POST /webhook/venda-concluida` |
| `LeadPerdidoEvent` | Adicionar à fila de repescagem | CRM (tag) | `POST /webhook/lead-perdido` |
| `LeadSalesFarmingEvent` | Disparar oferta de reativação | E-mail + WhatsApp | `POST /webhook/sales-farming` |
| `PagamentoRecusadoEvent` | Notificar lead + oferecer nova forma | WhatsApp | `POST /webhook/pagamento-recusado` |
| `EscadaDeValorCalculadaEvent` | Agendar abordagem de renovação | CRM (tarefa) | `POST /webhook/agendar-upsell` |

---

> **This specification is the contract.** The Commercial Context v2.0 é o sistema límbico do ZEHLA — onde leads viram clientes, vendas viram receita e a máquina comercial opera em escala previsível.
>
> O Playbook Interno de Estruturação Comercial (Full Sales System) é a fonte de verdade de negócio. A FSM é dogmática. Os handoffs são explícitos. Os eventos são o sistema nervoso.
>
> *Nenhuma linha de controlador, banco ou framework será escrita antes da homologação destes contratos.*
