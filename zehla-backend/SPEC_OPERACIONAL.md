# SPEC — Domínio Operacional (Bounded Context)

> **Propósito:** Especificar o Bounded Context Operacional — o tronco encefálico do ZEHLA PRIME — suas entidades, invariantes de negócio, contratos de porta e as fronteiras do agente Zé-Ops. Nenhuma linha de código. Apenas intenção, regras e contratos.
>
> **Arquitetura:** DDD Estrito + Ports & Adapters + Zero-Trust Mesh de Agentes
>
> **Linguagem:** Natural (Português) — ubíqua, não técnica

---

## 1. Contexto Delimitado (Bounded Context)

### 1.1 Nome
**Operacional Context** — também referido como **Domínio de Operações** ou **Bastidores da Pousada**.

### 1.2 Propósito
Gerencia o ciclo de vida de tarefas operacionais, manutenção preditiva e corretiva, escala de staff, SLA de reparos, checklist de higienização, e integração com fornecedores externos via webhook. É o contexto que garante que a pousada funcione 24/7 — quando a torneira quebra, o Zé-Ops sabe, dispara o chamado, rastreia o técnico e interdita o quarto se necessário. Tolerância a falhas: mínima. SLA: crítico.

### 1.3 Fronteira (O que PERTENCE ao contexto)
- Criação, atribuição e acompanhamento de **Tarefas** operacionais (manutenção, limpeza, revisão)
- Gestão de **Manutenções** preditivas e corretivas com gravidade e impacto na disponibilidade
- Cadastro e alocação de **Staff** (equipe interna: camareiras, recepcionistas, técnicos)
- Cadastro e integração com **Fornecedores** externos (encanador, eletricista, dedetizadora)
- Definição e execução de **Checklists** de higienização, vistoria e entrega de quarto
- Monitoramento de **SLAs** com alertas por violação de prazo
- Webhooks de fornecedores (atualização de status de serviço externo)
- Interdição e liberação de quartos (impacta o Domínio de Hospitalidade via evento)
- Histórico de manutenções por ativo (quarto, área comum, equipamento)

### 1.4 Fronteira (O que NÃO pertence)
- Cadastro e gestão de hóspedes → **Hospitalidade Context**
- Reservas, check-in, check-out → **Hospitalidade Context**
- Cobranças, reembolsos, faturas → **Financeiro Context**
- Precificação de pacotes e yield management → **Comercial Context**
- Autenticação de usuários (JWT, OAuth) → **Segurança Context**
- Vendas e leads → **Comercial Context**
- Emissão de reembolsos diretos → **Financeiro Context**

### 1.5 Interfaces de Porta (Segregadas)
O contexto expõe **6 portas granulares**. Nenhum agente ou serviço acessa entidades diretamente. Toda interação passa pela porta correspondente.

| Porta | Consumidor | Descrição |
|---|---|---|
| `ITarefaPort` | Zé-Ops, Staff | Gerenciamento de tarefas operacionais |
| `IManutencaoPort` | Zé-Ops, Fornecedor (webhook) | Ciclo de vida de manutenções |
| `IStaffPort` | Zé-Ops, RH | Cadastro e alocação de equipe |
| `IFornecedorPort` | Zé-Ops, Financeiro | Cadastro de prestadores externos |
| `IChecklistPort` | Zé-Ops, Staff | Definição e execução de checklists |
| `ISlaPort` | Zé-Ops | Métricas e violações de SLA |

---

## 2. Linguagem Ubíqua

| Termo | Definição |
|---|---|
| **Tarefa** | Unidade atômica de trabalho operacional. Pode ser de limpeza, manutenção, vistoria ou entrega. Possui prazo, responsável e status. |
| **Manutenção** | Tipo especial de tarefa com gravidade (baixa, média, alta, severa). Uma manutenção severa interdita o quarto automaticamente. |
| **Staff** | Membro da equipe interna da pousada. Possui habilidades, turno e carga horária. |
| **Fornecedor** | Prestador de serviço externo (PJ). Integra via webhook para atualização de status. |
| **Checklist** | Lista de itens de verificação associada a um tipo de tarefa ou evento (check-out, entrega, vistoria diária). |
| **SLA** | Acordo de nível de serviço: prazo máximo para execução de uma tarefa por prioridade. |
| **Interdição** | Bloqueio temporário de um quarto para hóspedes. Dispara evento `QuartoInterditado` para o Domínio de Hospitalidade. |
| **Ativo** | Recurso físico monitorado: quarto, área comum, equipamento (piscina, ar-condicionado, caldeira). |
| **Gravidade** | Nível de criticidade de uma manutenção: `baixa | media | alta | severa`. |
| **Turno** | Período de trabalho: `matutino | vespertino | noturno | integral`. |
| **Webhook** | Chamada HTTP externa do fornecedor informando progresso/chegada/conclusão. Assinada HMAC. |

---

## 3. Entidades (Modelo Rico)

Nenhuma entidade expõe setters públicos. Nenhuma entidade aceita estado inválido. Toda mutação retorna `Result<T, E>`.

### 3.1 Tarefa

**Identidade:** `tarefaId: UUIDv7`

**Atributos imutáveis (definidos na criação):**
- `propriedadeId` — escopo RLS (tenant)
- `dataCriacao` — timestamp ISO
- `tipo` — enum: `limpeza | manutencao | vistoria | entrega | inspecao`

**Atributos mutáveis (por processo específico):**
- `titulo` — string, não-vazia, até 200 caracteres
- `descricao` — string, até 1000 caracteres
- `prioridade` — enum: `baixa | media | alta | urgente`
- `status` — enum: `pendente | em_andamento | concluida | cancelada | bloqueada`
- `responsavelId` — string, referência ao staff ou fornecedor
- `tipoResponsavel` — enum: `staff | fornecedor`
- `ativoId` — string, referência ao ativo (quarto, equipamento), opcional
- `dataLimite` — timestamp ISO, prazo definido pelo SLA
- `dataConclusao` — timestamp ISO, preenchido na conclusão
- `observacoes` — texto livre, até 500 caracteres

**Invariantes:**
- `dataLimite` deve ser futura na criação
- `dataConclusao` só pode ser preenchida se `status === concluida`
- Uma tarefa `cancelada` ou `concluida` não pode ser reaberta
- Uma tarefa `bloqueada` depende de outra tarefa ou manutenção para prosseguir
- `tipo === manutencao` exige criação de entidade `Manutencao` vinculada
- Se `status` muda para `concluida` e existe `Checklist` pendente, valida conclusão do checklist primeiro

**Transições de status:**

```
pendente ──(iniciar)──→ em_andamento
em_andamento ──(concluir)──→ concluida
em_andamento ──(bloquear)──→ bloqueada
bloqueada ──(desbloquear)──→ em_andamento
pendente ──(cancelar)──→ cancelada
em_andamento ──(cancelar)──→ cancelada
```

**Eventos emitidos:**
- `TarefaCriadaEvent` — nova tarefa no sistema
- `TarefaIniciadaEvent` — staff assumiu a tarefa
- `TarefaConcluidaEvent` — tarefa finalizada (se manutenção severa, dispara liberação de quarto)
- `TarefaAtrasadaEvent` — violação de SLA (disparado por scheduler)

### 3.2 Manutencao

**Identidade:** `manutencaoId: UUIDv7`

**Atributos imutáveis:**
- `tarefaId` — vínculo com a tarefa raiz
- `propriedadeId` — escopo RLS
- `dataAbertura` — timestamp ISO

**Atributos:**
- `tipo` — enum: `corretiva | preventiva | preditiva`
- `gravidade` — enum: `baixa | media | alta | severa`
- `categoria` — enum: `hidraulica | eletrica | estrutura | climatizacao | dedetizacao | equipamento | mobilia | outro`
- `ativoId` — string, referência ao ativo (quarto 101, piscina, caldeira)
- `tipoAtivo` — enum: `quarto | area_comum | equipamento`
- `descricaoProblema` — string, até 2000 caracteres
- `descricaoSolucao` — string, preenchida na conclusão
- `dataInicio` — timestamp ISO, quando o técnico começou
- `dataFim` — timestamp ISO, quando o reparo foi concluído
- `fornecedorId` — string, referência opcional ao fornecedor externo
- `custoPecas` — Money, opcional
- `custoServico` — Money, opcional
- `status` — enum: `aberta | agendada | em_andamento | concluida | cancelada`
- `interditaQuarto` — boolean, true se `gravidade === severa`

**Invariantes:**
- `gravidade severa` DEFINE `interditaQuarto = true` automaticamente — invariante de negócio
- Se `interditaQuarto === true`, a entidade DEVE emitir `ManutencaoIniciadaEvent` com `{ tipoAtivo: 'quarto', ativoId }` para o Barramento de Eventos
- INTERDIÇÃO NÃO PODE ACONTECER sem a devida emissão do evento `QuartoInterditado` para o Domínio de Hospitalidade
- **CIRCUIT BREAKER:** Zé-Ops NÃO PODE interditar mais de 2 (dois) quartos em um intervalo de 24 horas de forma autônoma — se o threshold for atingido, o estado transita para `HUMAN_OVERWATCH_REQUIRED` e exige aprovação manual do Gerente/Arquiteto antes de emitir `QuartoInterditado` para o Hospitalidade Context
- `custoPecas + custoServico` é calculado apenas após `concluida`
- Manutenção `concluida` não pode ser reaberta
- Se manutenção `concluida` com `interditaQuarto === true`, dispara liberação automática (`QuartoLiberadoEvent`)
- Uma manutenção preventiva não interdita quarto

**Transições de status:**

```
aberta ──(agendar)──→ agendada
agendada ──(iniciar)──→ em_andamento
em_andamento ──(concluir)──→ concluida
aberta ──(iniciar)──→ em_andamento
em_andamento ──(cancelar)──→ cancelada
agendada ──(cancelar)──→ cancelada
```

**Eventos emitidos:**
- `ManutencaoAbertaEvent` — nova manutenção registrada
- `ManutencaoIniciadaEvent` — se `interditaQuarto`, carrega flag para orquestrador emitir `QuartoInterditado`
- `ManutencaoConcluidaEvent` — se estava interditado, carrega flag para emitir `QuartoLiberadoEvent`
- `ManutencaoCanceladaEvent`

### 3.3 Staff

**Identidade:** `staffId: UUIDv7`

**Atributos imutáveis:**
- `propriedadeId` — escopo RLS
- `dataContratacao` — timestamp ISO

**Atributos:**
- `nome` — string, não-vazia
- `email` — Email VO (para notificações internas)
- `telefone` — string BR formatada
- `cargo` — enum: `camareira | recepcionista | tecnico | gerente | auxiliar_servicos_gerais`
- `turno` — enum: `matutino | vespertino | noturno | integral`
- `ativo` — boolean, se false não recebe novas tarefas
- `habilidades` — array de strings: `["limpeza", "eletrica", "hidraulica", "pintura", "jardinagem"]`
- `cargaHorariaSemanal` — inteiro, horas
- `tarefasEmAndamento` — contagem, no máximo 3 simultâneas (invariante)

**Invariantes:**
- Um staff não pode ter mais que 3 tarefas `em_andamento` simultaneamente
- Um staff `ativo === false` não recebe novas tarefas automáticas
- Carga horária semanal ≤ 44 horas
- Staff com cargo `tecnico` DEVE ter ao menos uma habilidade

### 3.4 Fornecedor

**Identidade:** `fornecedorId: UUIDv7`

**Atributos imutáveis:**
- `dataCadastro` — timestamp ISO

**Atributos:**
- `razaoSocial` — string, não-vazia
- `cnpj` — Documento VO (CNPJ), validado
- `nomeContato` — string
- `emailContato` — Email VO
- `telefoneContato` — string BR
- `especialidades` — array de strings: `["hidraulica", "eletrica", "climatizacao", "dedetizacao"]`
- `status` — enum: `ativo | inativo | suspenso`
- `slaMedioHoras` — número, prazo médio de atendimento
- `taxaAvaliacao` — número 0-5, média das avaliações pós-serviço
- `webhookUrl` — string, URL para callbacks de atualização de status
- `webhookSecret` — hash do segredo compartilhado (armazenado como hash, NUNCA plaintext)

**Invariantes:**
- Fornecedor `suspenso` ou `inativo` NÃO recebe novas manutenções
- `webhookUrl` só pode ser atualizada com validação de prova de posse (desafio-resposta)
- `cnpj` deve ser único no sistema

**Eventos emitidos:**
- `FornecedorCadastradoEvent`
- `FornecedorSuspensoEvent` — dispara alerta no Zé-Ops

### 3.5 Checklist

**Identidade:** `checklistId: UUIDv7`

**Atributos imutáveis:**
- `propriedadeId` — escopo RLS

**Atributos:**
- `nome` — string, não-vazia
- `tipoTrigger` — enum: `checkout | checkin | diario | semanal | pre_entrega | manutencao`
- `ativoId` — string, referência opcional ao ativo (ex: quarto 101)
- `itens` — array de `{ itemId: string; descricao: string; obrigatorio: boolean; concluido: boolean }`
- `status` — enum: `pendente | em_andamento | concluido | cancelado`
- `responsavelId` — string, staff responsável
- `dataCriacao` — timestamp ISO
- `dataConclusao` — timestamp ISO

**Invariantes:**
- Checklists `checkout` e `pre_entrega` são obrigatórios antes de um check-in no Hospitalidade Context
- Um checklist `concluido` exige TODOS os itens obrigatórios marcados como `concluido === true`
- Itens não obrigatórios podem ficar pendentes na conclusão (apenas logados)
- Checklist não pode ser reaberto após concluído

**Eventos emitidos:**
- `ChecklistCriadoEvent`
- `ChecklistConcluidoEvent` — dispara liberação de quarto se for `checkout` ou `pre_entrega`

### 3.6 SLA

**Identidade:** `slaId: UUIDv7`

**Identidade natural:** `{ tipoTarefa, prioridade, propriedadeId }` (unique compound)

**Atributos:**
- `tipoTarefa` — enum: `limpeza | manutencao | vistoria | entrega | inspecao`
- `prioridade` — enum: `baixa | media | alta | urgente`
- `prazoHoras` — número, horas máximas para conclusão
- `prazoMinutos` — número, minutos, usado para urgências
- `regraEscalacao` — string, descrição de para quem escalar se violado
- `notificarEm` — percentual do prazo para disparar alerta preventivo (ex: `0.8` = 80% do prazo)
- `ativo` — boolean

**Invariantes:**
- SLA `urgente` deve ter `prazoMinutos ≤ 120` (2 horas máximo)
- SLA `alta` deve ter `prazoHoras ≤ 24`
- SLA `media` deve ter `prazoHoras ≤ 72`
- SLA `baixa` deve ter `prazoHoras ≤ 168` (7 dias)
- Apenas um SLA ativo por `{ tipoTarefa, prioridade }` por propriedade

---

## 4. Value Objects

### 4.1 Prioridade
- Enum: `baixa | media | alta | urgente`
- Ordem de precedência: urgente > alta > media > baixa
- SLA é calculado com base na Prioridade + Tipo de Tarefa

### 4.2 Gravidade
- Enum: `baixa | media | alta | severa`
- `severa` sempre interdita o ativo
- `alta` interdita apenas se o ativo for quarto ocupado ou com check-in nas próximas 48h

### 4.3 AtivoId
- `tipo: 'quarto' | 'area_comum' | 'equipamento'`
- `id: string` — identificador único do ativo no contexto de origem
- Invariante: `tipo === 'quarto'` exige que o ID exista no Hospitalidade Context

### 4.4 PeriodoInterdicao
- `dataInicio: Date`
- `dataFim: Date` (opcional, null se ainda interditado)
- `motivo: string`
- Invariante: `dataFim > dataInicio` se presente

### 4.5 Prioridade
- `peso: number` — 1 (baixa) a 4 (urgente)
- `label: string` — descrição amigável
- Invariante: peso deve estar entre 1 e 4

---

## 5. Portas (Interfaces)

### 5.1 ITarefaPort
```typescript
interface ITarefaPort {
  getById(id: string): Promise<Result<Tarefa, Error>>
  listPorPeriodo(inicio: Date, fim: Date): Promise<Result<Tarefa[], Error>>
  listPorResponsavel(responsavelId: string): Promise<Result<Tarefa[], Error>>
  listPorStatus(status: StatusTarefa): Promise<Result<Tarefa[], Error>>
  listPorAtivo(ativoId: string): Promise<Result<Tarefa[], Error>>
  listAtrasadas(): Promise<Result<Tarefa[], Error>>  // violação de SLA
  save(tarefa: Tarefa): Promise<Result<Tarefa, Error>>
  cancelar(id: string): Promise<Result<Tarefa, Error>>
  concluir(id: string, observacoes?: string): Promise<Result<Tarefa, Error>>
}
```

### 5.2 IManutencaoPort
```typescript
interface IManutencaoPort {
  getById(id: string): Promise<Result<Manutencao, Error>>
  listPorPeriodo(inicio: Date, fim: Date): Promise<Result<Manutencao[], Error>>
  listPorAtivo(ativoId: string): Promise<Result<Manutencao[], Error>>
  listPorStatus(status: StatusManutencao): Promise<Result<Manutencao[], Error>>
  listPorGravidade(gravidade: Gravidade): Promise<Result<Manutencao[], Error>>
  listInterditadas(): Promise<Result<Manutencao[], Error>>  // quartos interditados ativos
  save(manutencao: Manutencao): Promise<Result<Manutencao, Error>>
  concluir(id: string, solucao: string, custoPecas?: Money, custoServico?: Money): Promise<Result<Manutencao, Error>>
  countInterdicoes24h(propriedadeId: string): Promise<Result<number, Error>>  // circuit breaker
}
```

### 5.3 IStaffPort
```typescript
interface IStaffPort {
  getById(id: string): Promise<Result<Staff, Error>>
  listDisponiveis(turno?: Turno): Promise<Result<Staff[], Error>>
  listPorHabilidade(habilidade: string): Promise<Result<Staff[], Error>>
  listPorCargo(cargo: Cargo): Promise<Result<Staff[], Error>>
  save(staff: Staff): Promise<Result<Staff, Error>>
  ativar(id: string): Promise<Result<Staff, Error>>
  desativar(id: string): Promise<Result<Staff, Error>>
  tarefasEmAndamento(staffId: string): Promise<Result<number, Error>>
}
```

### 5.4 IFornecedorPort
```typescript
interface IFornecedorPort {
  getById(id: string): Promise<Result<Fornecedor, Error>>
  listAtivos(): Promise<Result<Fornecedor[], Error>>
  listPorEspecialidade(especialidade: string): Promise<Result<Fornecedor[], Error>>
  save(fornecedor: Fornecedor): Promise<Result<Fornecedor, Error>>
  suspender(id: string): Promise<Result<Fornecedor, Error>>
  avaliar(id: string, nota: number): Promise<Result<Fornecedor, Error>>
  getWebhookSecret(id: string): Promise<Result<string, Error>>  // para verificação HMAC
}
```

### 5.5 IChecklistPort
```typescript
interface IChecklistPort {
  getById(id: string): Promise<Result<Checklist, Error>>
  listPorAtivo(ativoId: string): Promise<Result<Checklist[], Error>>
  listPorTrigger(tipoTrigger: TipoTrigger): Promise<Result<Checklist[], Error>>
  listPendentesPorAtivo(ativoId: string): Promise<Result<Checklist[], Error>>
  save(checklist: Checklist): Promise<Result<Checklist, Error>>
  concluirItem(checklistId: string, itemId: string): Promise<Result<Checklist, Error>>
  concluir(checklistId: string): Promise<Result<Checklist, Error>>
  criarParaAtivo(ativoId: string, tipoTrigger: TipoTrigger): Promise<Result<Checklist, Error>>
}
```

### 5.6 ISlaPort
```typescript
interface ISlaPort {
  getPorTarefa(tipoTarefa: TipoTarefa, prioridade: Prioridade): Promise<Result<SLA, Error>>
  listAtivos(): Promise<Result<SLA[], Error>>
  save(sla: SLA): Promise<Result<SLA, Error>>
  desativar(id: string): Promise<Result<SLA, Error>>
  verificarViolacao(tarefa: Tarefa): Promise<Result<boolean, Error>>
  calcularPrazoLimite(tipoTarefa: TipoTarefa, prioridade: Prioridade): Promise<Result<Date, Error>>
}
```

---

## 6. Casos de Uso

### 6.1 CriarTarefaUseCase
- **Input:** tipo, titulo, descricao, prioridade, ativoId (opcional), responsavelId (opcional), tipoResponsavel (opcional)
- **Fluxo:**
  1. Se `tipo === manutencao`, exige criação de Manutencao vinculada
  2. Se `responsavelId` informado, verifica disponibilidade via IStaffPort (máx 3 simultâneas)
  3. Se não informado, aloca automaticamente por turno + habilidade + carga
  4. Calcula `dataLimite` via ISlaPort baseado em tipo + prioridade
  5. Cria Tarefa com status `pendente`
  6. Dispara `TarefaCriadaEvent`
- **Output:** Tarefa criada

### 6.2 IniciarTarefaUseCase
- **Input:** tarefaId, responsavelId
- **Fluxo:**
  1. Busca tarefa, valida status `pendente`
  2. Verifica se responsável não excedeu limite de 3 tarefas simultâneas
  3. Transita para `em_andamento`
  4. Se `tipo === manutencao`, inicia Manutencao vinculada
  5. Dispara `TarefaIniciadaEvent`
- **Output:** Tarefa em andamento

### 6.3 ConcluirTarefaUseCase
- **Input:** tarefaId, observacoes (opcional)
- **Fluxo:**
  1. Busca tarefa, valida status `em_andamento`
  2. Se existe Checklist pendente e obrigatório para o tipo, valida conclusão
  3. Transita para `concluida`, preenche `dataConclusao`
  4. Se `tipo === manutencao`, conclui Manutencao vinculada
  5. Se manutenção estava com `interditaQuarto`, dispara `QuartoLiberadoEvent`
  6. Dispara `TarefaConcluidaEvent`
- **Output:** Tarefa concluída

### 6.4 AbrirManutencaoUseCase
- **Input:** tipo, gravidade, categoria, ativoId, tipoAtivo, descricaoProblema, fornecedorId (opcional)
- **Fluxo:**
  1. Cria Tarefa do tipo `manutencao` via CriarTarefaUseCase
  2. Cria Manutencao vinculada à tarefa
  3. Se `gravidade === severa`:
     a. Verifica Circuit Breaker: `countInterdicoes24h < 2`
     b. Se threshold atingido → status = `HUMAN_OVERWATCH_REQUIRED`, não interdita automaticamente
     c. Se abaixo do threshold → marca `interditaQuarto = true`, emite `ManutencaoIniciadaEvent` com flag de interdição
  4. Se `fornecedorId` informado, aloca fornecedor
  5. Dispara `ManutencaoAbertaEvent`
- **Output:** Manutencao + Tarefa vinculada
- **Invariante:** Circuit Breaker de 2 interdições/24h validado na criação de manutenção severa

### 6.5 ProcessarWebhookFornecedorUseCase
- **Input:** payload (JSON), signature (header `X-Zehla-Signature`), fornecedorId
- **Fluxo:**
  1. Busca segredo do fornecedor via `IFornecedorPort.getWebhookSecret`
  2. Recalcula HMAC-SHA256 do payload com o segredo
  3. Compara assinaturas com `hmac.compare_digest` (timing-safe)
  4. Se inválido → rejeita com erro `WEBHOOK_SIGNATURE_INVALID`
  5. Se válido → processa ação conforme payload (ex: `status: "a_caminho"`, `status: "concluido"`)
  6. Atualiza Manutencão vinculada
- **Output:** Status atualizado
- **Segurança:** HMAC inegociável — nenhum webhook é processado sem assinatura válida

### 6.6 CalcularMetricasSlaUseCase
- **Input:** propriedadeId, dataInicio, dataFim
- **Fluxo:**
  1. Lista tarefas concluídas no período via ITarefaPort
  2. Para cada tarefa, calcula `dataConclusao - dataCriacao` vs prazo do SLA
  3. Agrega: total, dentro do prazo, violadas, taxa de cumprimento percentual
  4. Breakdown por tipo de tarefa e prioridade
- **Output:** `{ total, dentroPrazo, violadas, taxaCumprimento, breakdown }`

### 6.7 ProcessarTarefasAtrasadasUseCase (Job)
- **Input:** (nenhum — job schedulado, execução a cada 15 minutos)
- **Fluxo:**
  1. Lista tarefas com `dataLimite < agora` e status `pendente | em_andamento`
  2. Para cada uma, dispara `TarefaAtrasadaEvent`
  3. Escala conforme regra de SLA (notificar supervisor, reatribuir, etc.)
- **Output:** Lista de tarefas atrasadas processadas

### 6.8 ExecutarChecklistUseCase
- **Input:** checklistId, acao ('iniciar' | 'concluir_item' | 'concluir'), itemId (opcional)
- **Fluxo:**
  1. Busca checklist por ID
  2. Se `iniciar`: valida pendente, transita para `em_andamento`
  3. Se `concluir_item`: marca item como concluído
  4. Se `concluir`: valida todos itens obrigatórios concluídos, transita para `concluido`
  5. Se `checkout` ou `pre_entrega` concluído, dispara `ChecklistConcluidoEvent` → libera quarto
- **Output:** Checklist atualizado

---

## 7. Fronteira do Agente

### 7.1 Zé-Ops (Tronco Encefálico — Operações e Manutenção)

**Personalidade:** Operacional, pragmático, orientado a métricas de SLA e disponibilidade. Fala a linguagem de prazos, gravidade e eficiência. Não vende, não convence — executa.

**PODE:**
- Criar, listar, acompanhar e concluir tarefas operacionais
- Abrir manutenções e classificar por gravidade/categoria
- Alocar staff automaticamente por turno + habilidade + disponibilidade
- Alocar fornecedores externos para manutenções especializadas
- Executar checklists de higienização e vistoria
- Monitorar SLAs e disparar alertas de violação
- Processar webhooks de fornecedores (com validação HMAC)
- Interditar quartos (respeitando Circuit Breaker de 2/24h)
- Liberar quartos após conclusão de manutenção ou checklist
- Consultar histórico de manutenções por ativo
- Encaminhar para Zé-Host eventos de interdição/liberação de quarto via ZCP
- Solicitar aprovação humana quando Circuit Breaker é atingido

**NÃO PODE:**
- ❌ Emitir reembolsos diretos ao hóspede — competência do Financeiro Context
- ❌ Alterar tabelas de precificação ou yield management — competência do Zé-Analyst
- ❌ Acessar dados de pagamento ou faturamento
- ❌ Acessar dados de hóspedes não mascarados (ZDR — apenas dados anonimizados)
- ❌ Criar propostas comerciais ou conversões
- ❌ Modificar reservas no Hospitalidade Context (apenas emitir eventos)
- ❌ Interditar mais de 2 quartos em 24h sem aprovação humana
- ❌ Excluir tarefas, manutenções ou checklists
- ❌ Acessar dados de outros tenants (RLS inviolável)
- ❌ Realizar movimentos laterais (Lateral Movement) no core de operações — toda requisição ao Zé-Host deve conter `tenant_id` + `agent_signature` válida (ZCP Shield)

---

## 8. Fluxos de Domínio (Sagas)

### 8.1 Fluxo de Manutenção com Interdição

```
Hóspede reporta vazamento no quarto 101
     │
     ▼ (Zé-Ops)
AbrirManutencaoUseCase → Manutencao.gravidade: severa
     │
     ├── Circuit Breaker: countInterdicoes24h < 2?
     │   ├── SIM → interditaQuarto = true
     │   │       │
     │   │       ▼
     │   │   ManutencaoIniciadaEvent → Zé-Host → QuartoInterditado(quartoId: 101)
     │   │       │
     │   │       ▼ (Hospitalidade Context bloqueia o quarto)
     │   │   Quarto.status → interditado (sem novas reservas)
     │   │
     │   └── NÃO → HUMAN_OVERWATCH_REQUIRED
     │           │
     │           ▼ (Gerente aprova manualmente)
     │       Zé-Ops aguarda aprovação → só então interdita
     │
     ▼
Tarefa criada + alocação automática (staff ou fornecedor)
     │
     ▼ (Técnico chega, inicia tarefa)
Tarefa.em_andamento → Manutencao.em_andamento
     │
     ▼ (Reparo concluído)
ConcluirTarefaUseCase → Tarefa.concluida, Manutencao.concluida
     │
     ▼ (Se estava interditado)
ManutencaoConcluidaEvent → QuartoLiberadoEvent(quartoId: 101)
     │
     ▼ (Hospitalidade libera o quarto)
Quarto.status → disponivel
     │
     ▼ (Checklist de entrega executado)
ChecklistConcluidoEvent → Quarto pronto para check-in
```

### 8.2 Fluxo de Webhook de Fornecedor

```
Fornecedor envia POST para /webhook/manutencao
     │
     ▼ (Zé-Ops)
ProcessarWebhookFornecedorUseCase
     │
     ├── Valida HMAC: X-Zehla-Signature
     │   ├── INVÁLIDA → rejeita 401
     │   └── VÁLIDA → continua
     │
     ▼
Atualiza status da Manutencao conforme payload
     │
     ▼ (Se "concluido")
Dispara ManutencaoConcluidaEvent
```

### 8.3 Fluxo de Checkout + Higienização

```
Hóspede faz check-out
     │
     ▼ (Evento do Hospitalidade Context)

Checklist de checkout criado automaticamente (tipoTrigger: checkout)
     │
     ▼ (Camareira executa)
ExecutarChecklistUseCase → itens concluídos um a um
     │
     ▼ (Todos obrigatórios concluídos)
ChecklistConcluidoEvent
     │
     ▼ (Zé-Ops libera quarto para limpeza pesada)
Tarefa de limpeza criada (prioridade: alta)
     │
     ▼ (Limpeza concluída)
Checklist de pre-entrega executado
     │
     ▼ (Quarto liberado)
QuartoLiberadoEvent → Hospitalidade → quarto disponível
```

---

## 9. Invariantes de Negócio (Resumo)

| # | Invariante | Onde é validada |
|---|---|---|
| 1 | Manutenção severa interdita quarto automaticamente | `Manutencao.create()` |
| 2 | Máx 3 tarefas em andamento por staff | `Tarefa.iniciar()` |
| 3 | SLA urgente ≤ 2h, alta ≤ 24h, média ≤ 72h, baixa ≤ 168h | `SLA.create()` |
| 4 | Checklist obrigatório antes de conclusão de tarefa | `Tarefa.concluir()` |
| 5 | Webhook sem HMAC válido é rejeitado | `ProcessarWebhookFornecedorUseCase` |
| 6 | Circuit Breaker: máx 2 interdições autônomas em 24h | `AbrirManutencaoUseCase` |
| 7 | Interdição exige evento `QuartoInterditado` para Hospitalidade | `AbrirManutencaoUseCase` |
| 8 | Staff inativo não recebe novas tarefas | `CriarTarefaUseCase` |
| 9 | Fornecedor suspenso não recebe novas manutenções | `AbrirManutencaoUseCase` |
| 10 | Checklist concluído exige todos itens obrigatórios marcados | `Checklist.concluir()` |
| 11 | RLS: dado operacional pertence a UMA propriedade | Todas as portas |
| 12 | Conclusão de manutenção com interdição libera quarto automaticamente | `ConcluirTarefaUseCase` |
| 13 | Toda requisição ao Zé-Host deve conter `tenant_id` + `agent_signature` | ZCP Shield |
| 14 | Zé-Ops lê apenas dados mascarados (ZDR) — sem PII original | Camada de integração |

---

## 10. Swarm Lite — Mapa de Agentes

| Agente | Contexto | Portas Consumidas | Gatilhos |
|---|---|---|---|
| **Zé-Ops** | Operacional | `ITarefaPort`, `IManutencaoPort`, `IStaffPort`, `IFornecedorPort`, `IChecklistPort`, `ISlaPort` | Webhook de fornecedor, check-out, tarefa atrasada, manutenção criada |
| **Zé-Host** | Hospitalidade | `IReservaPort`, `IHospedePort`, `IQuartoPort` (operações recebe eventos) | `QuartoInterditado`, `QuartoLiberado` |
| **Zé-Concierge** | Hospitalidade | — (notificado de eventos) | Check-list concluído, quarto liberado |

---

## 11. Eventos de Domínio (Cross-Context)

| Evento | Origem | Consumidores | Ação |
|---|---|---|---|
| `TarefaCriadaEvent` | Operacional | Zé-Ops | Notificar responsável |
| `TarefaAtrasadaEvent` | Operacional | Zé-Ops, Staff | Escalar, notificar supervisor |
| `ManutencaoIniciadaEvent` | Operacional → **Hospitalidade** | Zé-Host | Interditar quarto (se flag ativa) |
| `ManutencaoConcluidaEvent` | Operacional → **Hospitalidade** | Zé-Host | Liberar quarto (se estava interditado) |
| `QuartoInterditadoEvent` | Operacional via Zé-Host | Zé-Host, Zé-Concierge | Bloquear reservas, notificar hóspedes afetados |
| `QuartoLiberadoEvent` | Operacional via Zé-Host | Zé-Host, Zé-Concierge | Reabrir para reservas |
| `ChecklistConcluidoEvent` | Operacional | Zé-Ops, Zé-Host | Liberar quarto para check-in |
| `FornecedorSuspensoEvent` | Operacional | Zé-Ops | Reatribuir manutenções pendentes |

---

## 12. Erros de Domínio

| Código | Mensagem | Contexto |
|---|---|---|
| `TAREFA_NOT_FOUND` | Tarefa não encontrada | ITarefaPort |
| `TAREFA_INVALID_STATUS` | Status inválido para a transição solicitada | Tarefa.transitar() |
| `TAREFA_ALREADY_CONCLUDED` | Tarefa já concluída | ConcluirTarefaUseCase |
| `TAREFA_CANNOT_REOPEN` | Tarefa concluída ou cancelada não pode ser reaberta | Tarefa.transitar() |
| `TAREFA_CHECKLIST_PENDENTE` | Checklist obrigatório não foi concluído | ConcluirTarefaUseCase |
| `MANUTENCAO_NOT_FOUND` | Manutenção não encontrada | IManutencaoPort |
| `MANUTENCAO_ALREADY_CONCLUDED` | Manutenção já concluída | ConcluirTarefaUseCase |
| `MANUTENCAO_SEVERA_INTERDITA` | Manutenção severa exige interdição do ativo | AbrirManutencaoUseCase |
| `CIRCUIT_BREAKER_ACTIVATED` | Limite de 2 interdições em 24h atingido — aprovação humana necessária | AbrirManutencaoUseCase |
| `STAFF_NOT_FOUND` | Staff não encontrado | IStaffPort |
| `STAFF_INACTIVE` | Staff inativo não pode receber tarefas | CriarTarefaUseCase |
| `STAFF_MAX_TASKS` | Staff já possui 3 tarefas em andamento | IniciarTarefaUseCase |
| `FORNECEDOR_NOT_FOUND` | Fornecedor não encontrado | IFornecedorPort |
| `FORNECEDOR_SUSPENSO` | Fornecedor suspenso não pode receber novas manutenções | AbrirManutencaoUseCase |
| `WEBHOOK_SIGNATURE_INVALID` | Assinatura HMAC do webhook inválida | ProcessarWebhookFornecedorUseCase |
| `WEBHOOK_SECRET_NOT_FOUND` | Segredo do webhook não configurado para o fornecedor | ProcessarWebhookFornecedorUseCase |
| `CHECKLIST_NOT_FOUND` | Checklist não encontrado | IChecklistPort |
| `CHECKLIST_ITENS_OBRIGATORIOS` | Itens obrigatórios pendentes — conclusão não permitida | Checklist.concluir() |
| `CHECKLIST_ALREADY_CONCLUDED` | Checklist já concluído | ExecutarChecklistUseCase |
| `SLA_NOT_FOUND` | SLA não encontrado para a combinação tipo + prioridade | ISlaPort |
| `SLA_INVALID_PRAZO` | Prazo do SLA fora dos limites permitidos por prioridade | SLA.create() |
| `INVALID_ATIVO_ID` | Ativo não encontrado no contexto de origem | AtivoId.create() |

---

## 13. DIRETRIZES DE SEGURANÇA E HARDENING (ZÉ-OPS)

O Zé-Ops opera sobre infraestrutura crítica e deve obedecer a um paradigma Zero-Trust absoluto.

### 13.1 Validação de Ingress (HMAC inegociável)

A porta de entrada `IFornecedorWebhookPort` rejeitará sumariamente qualquer payload que não contenha um cabeçalho de assinatura (`X-Zehla-Signature`). A assinatura será verificada matematicamente usando `hmac.compare_digest` com o `ZEHLA_GLOBAL_PEPPER` efêmero injetado em RAM (`/dev/shm`).

- **Obrigatório:** todo webhook DEVE conter header `X-Zehla-Signature`
- **Formato:** `HMAC-SHA256` do body JSON canonicalizado
- **Verificação:** `hmac.compare_digest(calculado, recebido)` — timing-safe, sem curto-circuito
- **Rejeição:** se inválido → HTTP 401 + log de auditoria + alerta no Zé-Ops
- **Chave:** segredo específico do fornecedor armazenado como hash, NUNCA plaintext

### 13.2 Circuit Breaker Físico (Anti-ASI08)

A emissão do evento `QuartoInterditado` (ou similares que bloqueiem inventário) possui um limiar de segurança (Threshold).

- **Regra de Domínio:** O Zé-Ops NÃO PODE interditar mais de 2 (dois) quartos em um intervalo de 24 horas de forma autônoma
- **Monitoramento:** `IManutencaoPort.countInterdicoes24h()` antes de toda `gravidade === severa`
- **Transição forçada:** se `count >= 2`, a manutenção NÃO interdita o quarto — estado vai para `HUMAN_OVERWATCH_REQUIRED`
- **Aprovação humana:** Gerente/Arquiteto aprova manualmente no dashboard — só então o `QuartoInterditadoEvent` é emitido para o Hospitalidade Context
- **Reset:** contador zera após 24h do carimbo da primeira interdição

### 13.3 Autenticação Inter-Agentes (ZCP Shield)

Toda requisição originada do Zé-Ops (OpsJobOutputDTO) enviada ao Zé-Host DEVE conter:

- `tenant_id` — escopo da propriedade (RLS)
- `agent_signature` — HMAC-SHA256 do payload com chave compartilhada entre agentes

**Proibido:**
- ❌ Movimentos laterais (Lateral Movement) — Zé-Ops NÃO pode invocar portas do Domínio Comercial ou Financeiro
- ❌ PIIs originais — Zé-Ops lê apenas dados mascarados pelo ZDR (Zero Data Retention). Números de documento, telefone e email de hóspedes são estritamente proibidos no contexto operacional

**Garantias:**
- Agentes periféricos (Zé-Ops) não escalam privilégio sem assinatura válida
- Toda troca entre contextos é auditada e rastreável por `messageId` + `agentId`

---

## 14. Glossário de Eventos vs Ações Automáticas

| Evento de Domínio | Ação Zé-Ops | Destino |
|---|---|---|
| `Check-out realizado` (Hospitalidade) | Criar checklist de checkout + tarefa de limpeza | Staff |
| `Manutencao.gravidade === severa` | Interditar quarto (se CB OK) ou solicitar aprovação | Zé-Host |
| `TarefaAtrasadaEvent` | Notificar supervisor + reatribuir se necessário | Staff / Gerente |
| `Webhook fornecedor: "a_caminho"` | Atualizar status da manutenção para `em_andamento` | Zé-Ops |
| `Webhook fornecedor: "concluido"` | Concluir manutenção + liberar quarto se interditado | Zé-Host |
| `Checklist.pre_entrega concluído` | Sinalizar quarto disponível para check-in | Zé-Host |

---

> **This specification is the contract.** The Operational Context is the nervous system of the pousada — it runs 24/7, reacts to failures, and ensures every room is ready for the next guest. All code is disposable — these invariants, ports, agent boundaries, and security shields are the immutable assets.
>
> *Nenhuma linha de controlador, banco ou framework será escrita antes da homologação destes contratos.*

---

> **Navegação:** [[ZEHLA_INDEX]] | [[SPEC]] | [[AGENTS]] | [[SKILL]] | [[SPEC_COMERCIAL]] | [[SPEC_REVENUE]]
