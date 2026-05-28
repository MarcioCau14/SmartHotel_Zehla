# SPEC — Domínio Comercial (Bounded Context)

> **Propósito:** Especificar o Bounded Context Comercial — o sistema límbico de vendas e marketing do ZEHLA PRIME — suas entidades, invariantes de negócio, contratos de porta e as fronteiras dos agentes Zé-Sales e Zé-Marketer. Nenhuma linha de código. Apenas intenção, regras e contratos.
>
> **Arquitetura:** DDD Estrito + Ports & Adapters + Topologia Mesh de Agentes
>
> **Linguagem:** Natural (Português) — ubíqua, não técnica

---

## 1. Contexto Delimitado (Bounded Context)

### 1.1 Nome
**Comercial Context** — também referido como **Domínio de Vendas** ou **Funil de Conversão**.

### 1.2 Propósito
Gerencia o ciclo de vida comercial do cliente potencial ao pagamento confirmado: captura de leads, nutrição, propostas comerciais, precificação de pacotes, processamento de pagamentos, e gatilhos de marketing. É o contexto que alimenta a receita da pousada. Tolerância a falhas: zero.

### 1.3 Fronteira (O que PERTENCE ao contexto)
- Captura e qualificação de **Leads** (site, WhatsApp, marketplace, indicação)
- Criação e gestão de **Propostas** comerciais (orçamentos, pré-reservas)
- Definição e versionamento de **Pacotes** (produtos compostos: quarto + serviços + diárias)
- Processamento de **Pagamentos** (PIX, cartão, link de pagamento, voucher)
- Registro de **Conversões** (lead → cliente pagante)
- Gatilhos de **Marketing** (e-mail automático, WhatsApp, push, ofertas sazonais)
- Yield Management (sugestão de descontos e upgrades via Zé-Analyst)

### 1.4 Fronteira (O que NÃO pertence)
- Cadastro de hóspedes e reservas → **Hospitalidade Context**
- Execução de pagamentos (gateway real) → **Infraestrutura (Pagarme/Stripe)**
- Experiência durante a estadia → **Hospitalidade Context**
- Pós-checkout e feedback → **Hospitalidade Context**
- Criptografia, JWT, HMAC → **Segurança Context**
- Automação de limpeza e manutenção → **Operacional Context**

### 1.5 Interfaces de Porta (Segregadas)
O contexto expõe **5 portas granulares** no diretório `application/comercial/ports/`. Nenhum agente ou serviço acessa entidades diretamente. Toda interação passa pela porta correspondente.

| Porta | Agente Consumidor |
|---|---|
| `ILeadPort` | Zé-Sales, Zé-Marketer |
| `IPropostaPort` | Zé-Sales |
| `IPacotePort` | Zé-Marketer, Zé-Analyst |
| `IPagamentoPort` | Zé-Sales (leitura), Infraestrutura (escrita) |
| `IConversaoPort` | Zé-Sales, Zé-Analyst |

---

## 2. Linguagem Ubíqua

| Termo | Definição |
|---|---|
| **Lead** | Pessoa ou empresa com potencial de compra. Origem: site, WhatsApp, marketplace, indicação. Possui score de qualificação. |
| **Proposta** | Oferta comercial formal contendo pacote, período, valor, condições de pagamento e validade. Pode ser editada até a conversão. |
| **Pacote** | Produto composto pré-definido: combinação de tipo de quarto, diárias, serviços e regras de precificação. Versionado. |
| **Pagamento** | Transação financeira vinculada a uma proposta. Pode ser parcial (sinal) ou total. Suporta PIX, cartão e voucher. |
| **Conversão** | Evento de domínio que marca a transição de Lead para Cliente. Exige pagamento validado vinculado à proposta. |
| **Sinal** | Percentual mínimo do valor total pago antes do check-in para garantir a reserva. Definido por política da pousada. |
| **Yield** | Precificação dinâmica: desconto ou upgrade sugerido por data, ocupação e perfil do lead. |
| **Nutrição** | Sequência automatizada de contatos (e-mail, WhatsApp) para leads não convertidos. |
| **Gatilho** | Evento que dispara uma ação de marketing (ex: lead parou na proposta → e-mail de recuperação). |
| **Score** | Nota de 0 a 100 que indica probabilidade de conversão do lead. Calculado por comportamento + dados cadastrais. |
| **Canal** | Origem do lead: `site`, `whatsapp`, `booking-engine`, `marketplace`, `indicacao`, `presencial`. |

---

## 3. Entidades (Modelo Rico)

Nenhuma entidade expõe setters públicos. Nenhuma entidade aceita estado inválido. Toda mutação retorna `Result<T, E>`.

### 3.1 Lead

**Identidade:** `leadId: UUIDv7`

**Atributos imutáveis (definidos na criação):**
- `canal` — enum: `site | whatsapp | booking-engine | marketplace | indicacao | presencial`
- `dataCaptura` — timestamp ISO, gerado na criação
- `propriedadeId` — escopo RLS (tenant)

**Atributos mutáveis (por processo específico):**
- `nome` — string não-vazia, mínimo 2 caracteres
- `email` — Value Object `Email`, validado estruturalmente
- `telefone` — string BR formatada (opcional)
- `documento` — Value Object `Documento` (CPF/CNPJ), opcional até a conversão
- `score` — inteiro 0-100, calculado pelo domínio
- `status` — enum: `novo | qualificado | propostado | convertido | perdido | inativo`
- `origemUrl` — string, URL de captura (UTM params)
- `tags` — array de strings para segmentação
- `ultimaInteracao` — timestamp da última atividade com o lead

**Invariantes:**
- Um lead não pode ser convertido sem um pagamento validado vinculado
- `status` só avança no funil: `novo → qualificado → propostado → convertido`. Não retrocede (exceto `perdido`).
- `score` mínimo para qualificação: 30
- Nome e email são obrigatórios para qualquer status exceto `novo`
- Documento é obrigatório para `convertido` (validação LGPD)

**Transições de status:**

```
novo ──(qualificar)──→ qualificado
qualificado ──(propostar)──→ propostado
propostado ──(converter)──→ convertido
qualificado ──(perder)──→ perdido
propostado ──(perder)──→ perdido
novo ──(perder)──→ perdido
qualificado ──(reativar)──→ novo
perdido ──(reativar)──→ novo
```

**Eventos emitidos:**
- `LeadCapturadoEvent` — lead criado
- `LeadQualificadoEvent` — score atinge mínimo
- `LeadConvertidoEvent` — lead vira cliente (dispara faturamento no Financeiro Context)

### 3.2 Proposta

**Identidade:** `propostaId: UUIDv7`

**Atributos imutáveis (definidos na criação):**
- `leadId` — referência ao lead
- `pacoteId` — referência ao pacote contratado
- `dataCriacao` — timestamp ISO
- `propriedadeId` — escopo RLS

**Atributos mutáveis:**
- `dataCheckIn` — data ISO, deve ser futura na criação
- `dataCheckOut` — data ISO, deve ser posterior ao check-in
- `quantidadeHospedes` — inteiro positivo, respeita capacidade do pacote
- `valorTotal` — Value Object `Money`, calculado pelo domínio (pacote + serviços + diárias)
- `valorSinal` — Value Object `Money`, percentual do total definido por política
- `descontoAplicado` — Value Object `Money`, opcional, não pode exceder valor total
- `status` — enum: `rascunho | enviada | vista | negociacao | aceita | recusada | expirada | convertida`
- `validade` — data ISO, proposta expira após 7 dias (padrão) ou conforme política
- `observacoes` — texto livre, até 1000 caracteres
- `historicoVersoes` — lista de snapshots anteriores da proposta (rastreabilidade)

**Invariantes:**
- `dataCheckIn` deve ser no mínimo 1 dia após a data de criação
- `dataCheckOut` - `dataCheckIn` ≥ 1 noite
- `quantidadeHospedes` ≤ capacidade máxima do pacote
- `descontoAplicado` + `valorSinal` ≤ `valorTotal`
- Nenhum campo de valor pode ser alterado após a proposta estar `aceita`
- Uma proposta `convertida` não pode ser reaberta
- Proposta expira automaticamente se `validade` < `agora` e status não for `aceita` ou `convertida`

**Transições de status:**

```
rascunho ──(enviar)──→ enviada
enviada ──(visualizar)──→ vista
vista ──(negociar)──→ negociacao
negociacao ──(aceitar)──→ aceita
aceita ──(converter)──→ convertida
enviada ──(recusar)──→ recusada
vista ──(recusar)──→ recusada
negociacao ──(recusar)──→ recusada
qualquer(exceto convertida) ──→ expirada (automático)
rascunho ──(editar)──→ rascunho (loop de edição)
```

**Eventos emitidos:**
- `PropostaCriadaEvent` — proposta gerada para lead
- `PropostaAceitaEvent` — lead aceita os termos (dispara cobrança de sinal)
- `PropostaConvertidaEvent` — proposta vinculada a conversão
- `PropostaExpiradaEvent` — proposta perdeu validade

### 3.3 Pacote

**Identidade:** `pacoteId: UUIDv7`

**Atributos imutáveis:**
- `propriedadeId` — escopo RLS

**Atributos:**
- `nome` — string, não-vazia, até 120 caracteres
- `descricao` — string, até 500 caracteres (markdown permitido)
- `tipoQuarto` — string, referência ao tipo no Hospitalidade Context
- `capacidadeMaxima` — inteiro positivo
- `servicosInclusos` — array de referências a serviços
- `regraPrecificacao` — Value Object: `{ tipo: 'por_diaria' | 'pacote_fechado', valorBase: Money, ajustePorOcupacao?: number }`
- `validadeInicio` — data ISO, início da vigência
- `validadeFim` — data ISO, fim da vigência
- `status` — `ativo | pausado | arquivado`
- `versao` — inteiro, incrementado a cada alteração
- `categorias` — array de strings (ex: `["romântico", "família", "aventura"]`)
- `midias` — array de URLs de fotos/vídeos

**Invariantes:**
- Um pacote não pode ter `valorBase ≤ 0`
- `validadeFim` > `validadeInicio`
- Serviços inclusos devem existir no catálogo do Hospitalidade Context (validação via porta)
- Apenas pacotes `ativo` podem ser usados em novas propostas
- Alterações em pacote com propostas ativas criam nova versão (não altera propostas existentes)
- Capacidade máxima não pode ser alterada se houver propostas ativas

**Eventos emitidos:**
- `PacoteCriadoEvent`
- `PacoteAtualizadoEvent`
- `PacoteArquivadoEvent`

### 3.4 Pagamento

**Identidade:** `pagamentoId: UUIDv7`

**Atributos imutáveis:**
- `propostaId` — vínculo com a proposta
- `propriedadeId` — escopo RLS
- `dataCriacao` — timestamp ISO

**Atributos:**
- `tipo` — `sinal | restante | total`
- `metodo` — `pix | cartao_credito | cartao_debito | voucher | boleto | dinheiro`
- `valor` — Value Object `Money`, deve ser > 0
- `status` — `pendente | processando | confirmado | recusado | estornado | reembolsado`
- `codigoTransacao` — string, código do gateway (opcional até confirmação)
- `dataConfirmacao` — timestamp ISO, preenchido na confirmação
- `gatewayResponse` — JSON opaco com resposta do provedor
- `parcelas` — inteiro, 1-12, apenas para cartão de crédito

**Invariantes:**
- Um `sinal` não pode exceder 50% do valor total da proposta
- A soma de todos pagamentos `confirmado` para uma proposta não pode exceder o valor total da proposta
- Antes de `confirmado`, o pagamento pode ser cancelado sem efeitos
- Um `estorno` só é possível se houve `confirmado` antes
- Pagamento `recusado` pode ser retentado (novo pagamento para mesma proposta)
- A proposta só pode ser `convertida` após ao menos um pagamento `confirmado`

**Transições de status:**

```
pendente ──(processar)──→ processando
processando ──(confirmar)──→ confirmado
processando ──(recusar)──→ recusado
confirmado ──(estornar)──→ estornado
estornado ──(reembolsar)──→ reembolsado
pendente ──(cancelar)──→ recusado
```

**Eventos emitidos:**
- `PagamentoConfirmadoEvent` — dispara conversão se for o pagamento mínimo exigido
- `PagamentoRecusadoEvent` — dispara notificação ao lead + alerta no Zé-Sales
- `PagamentoEstornadoEvent` — dispara reversão no Financeiro Context

### 3.5 Conversão

**Identidade:** `conversaoId: UUIDv7`

**Atributos imutáveis:**
- `leadId` — referência ao lead convertido
- `propostaId` — referência à proposta aceita
- `pagamentoId` — referência ao pagamento que confirmou a conversão
- `dataConversao` — timestamp ISO
- `propriedadeId` — escopo RLS

**Atributos:**
- `valorTotal` — Value Object `Money`, snapshot do valor final pago
- `comissao` — Value Object `Money`, calculada por regra de negócio (se marketplace)
- `canal` — herdado do lead no momento da conversão
- `observacoes` — texto livre, até 500 caracteres

**Invariantes:**
- Conversão é IMUTÁVEL após criada — não pode ser editada ou removida
- Uma conversão só existe se `Pagamento.status === 'confirmado'` para a proposta vinculada
- Um lead só pode ter UMA conversão ativa (não pode ser convertido duas vezes)
- Uma proposta só pode gerar UMA conversão
- `valorTotal` da conversão = snapshot do `Pagamento.valor` no momento da confirmação (congela câmbio/preço)

**Eventos emitidos:**
- `ConversaoRegistradaEvent` — lead vira hóspede (disparaa criação de cadastro no Hospitalidade Context)
- `ConversaoComissionadaEvent` — se marketplace, dispara financeiro

---

## 4. Value Objects

### 4.1 Email
- Valida estrutura: `local@domínio.tld`
- Imutável — uma vez criado, não muda
- Armazenado em lowercase normalizado
- Invariante: não pode ser vazio, deve conter exatamente um `@`

### 4.2 Documento (CPF/CNPJ)
- Tipo: `cpf | cnpj | passaporte`
- CPF: 11 dígitos, validação de dígitos verificadores
- CNPJ: 14 dígitos, validação de dígitos verificadores
- Passaporte: string alfanumérica, sem validação além de não-vazia
- Armazenado sem formatação (apenas dígitos)
- Invariante: tipo `cpf` exige 11 dígitos numéricos com DV válido

### 4.3 Money
- `centavos: number` — inteiro positivo
- `moeda: string` — ISO 4217 (padrão `BRL`)
- Operações: `add`, `subtract`, `multiply`, `percentage`, `compare`
- Invariante: `centavos ≥ 0`

### 4.4 Score
- `valor: number` entre 0 e 100
- Invariante: sempre arredondado para inteiro
- Regras de cálculo (serviço de domínio):
  - +30 pontos se lead tem documento completo
  - +20 pontos se lead já se hospedou antes (via Hospitalidade Context)
  - +10 pontos por interação nos últimos 7 dias (até +30)
  - +20 pontos se origem é indicação
  - -15 pontos se lead não responde há 30+ dias

### 4.5 RegraPrecificacao
- `tipo: 'por_diaria' | 'pacote_fechado'`
- `valorBase: Money`
- `ajustePorOcupacao?: number` — percentual de acréscimo por hóspede extra (0-100)
- `temporada?: { inicio: Date; fim: Date; multiplicador: number }[]`
- Invariante: `tipo 'por_diaria'` exige `ajustePorOcupacao` opcional; `tipo 'pacote_fechado'` ignora ocupação

### 4.6 Canal
- Enum: `site | whatsapp | booking-engine | marketplace | indicacao | presencial`
- Cada canal tem um `custoAquisicao` associado (para métricas de marketing)

---

## 5. Portas (Interfaces)

### 5.1 ILeadPort
```typescript
interface ILeadPort {
  getById(id: string): Promise<Result<Lead, Error>>
  getByEmail(email: string): Promise<Result<Lead | null, Error>>
  search(criteria: LeadSearchCriteria): Promise<Result<Lead[], Error>>
  save(lead: Lead): Promise<Result<Lead, Error>>
  delete(id: string): Promise<Result<void, Error>>
  countByPeriod(inicio: Date, fim: Date): Promise<Result<number, Error>>
  listByCanal(canal: Canal): Promise<Result<Lead[], Error>>
}
```

### 5.2 IPropostaPort
```typescript
interface IPropostaPort {
  getById(id: string): Promise<Result<Proposta, Error>>
  listByLead(leadId: string): Promise<Result<Proposta[], Error>>
  listByPeriod(inicio: Date, fim: Date): Promise<Result<Proposta[], Error>>
  save(proposta: Proposta): Promise<Result<Proposta, Error>>
  delete(id: string): Promise<Result<void, Error>>
  listByStatus(status: StatusProposta): Promise<Result<Proposta[], Error>>
  listExpiradas(): Promise<Result<Proposta[], Error>>  // para job de expiração
}
```

### 5.3 IPacotePort
```typescript
interface IPacotePort {
  getById(id: string): Promise<Result<Pacote, Error>>
  listAtivos(): Promise<Result<Pacote[], Error>>
  listByCategoria(categoria: string): Promise<Result<Pacote[], Error>>
  listByPeriodo(data: Date): Promise<Result<Pacote[], Error>>  // vigentes na data
  save(pacote: Pacote): Promise<Result<Pacote, Error>>
  archive(id: string): Promise<Result<void, Error>>
  getVersao(id: string, versao: number): Promise<Result<Pacote, Error>>
}
```

### 5.4 IPagamentoPort
```typescript
interface IPagamentoPort {
  getById(id: string): Promise<Result<Pagamento, Error>>
  listByProposta(propostaId: string): Promise<Result<Pagamento[], Error>>
  save(pagamento: Pagamento): Promise<Result<Pagamento, Error>>
  confirmar(id: string, codigoTransacao: string): Promise<Result<Pagamento, Error>>
  recusar(id: string): Promise<Result<Pagamento, Error>>
  estornar(id: string): Promise<Result<Pagamento, Error>>
  totalConfirmadoPorProposta(propostaId: string): Promise<Result<Money, Error>>
}
```

### 5.5 IConversaoPort
```typescript
interface IConversaoPort {
  getById(id: string): Promise<Result<Conversao, Error>>
  listByLead(leadId: string): Promise<Result<Conversao[], Error>>
  listByPeriod(inicio: Date, fim: Date): Promise<Result<Conversao[], Error>>
  save(conversao: Conversao): Promise<Result<Conversao, Error>>
  countByCanal(inicio: Date, fim: Date): Promise<Result<{ canal: Canal; total: number }[], Error>>
  taxaConversao(inicio: Date, fim: Date): Promise<Result<number, Error>>  // convertidos / leads
}
```

---

## 6. Casos de Uso

### 6.1 CapturarLeadUseCase
- **Input:** canal, nome, email, telefone (opcional), origemUrl (opcional), tags (opcional)
- **Fluxo:**
  1. Verifica se lead já existe pelo email (duplicidade)
  2. Se existir e estiver `perdido`, reativa
  3. Cria Lead com status `novo`
  4. Calcula score inicial
  5. Dispara `LeadCapturadoEvent`
- **Regras de negócio:** validadas na entidade
- **Output:** Lead criado

### 6.2 QualificarLeadUseCase
- **Input:** leadId, documento (opcional)
- **Fluxo:**
  1. Busca lead por ID
  2. Se score < 30, retorna erro `SCORE_INSUFICIENTE`
  3. Transita lead para `qualificado`
  4. Dispara `LeadQualificadoEvent`
- **Invariante:** score mínimo validado na entidade

### 6.3 CriarPropostaUseCase
- **Input:** leadId, pacoteId, dataCheckIn, dataCheckOut, quantidadeHospedes
- **Fluxo:**
  1. Busca lead e pacote via portas
  2. Valida capacidade do pacote vs quantidade de hóspedes
  3. Calcula valor total via serviço de precificação
  4. Cria Proposta com status `rascunho`
  5. Dispara `PropostaCriadaEvent`
- **Output:** Proposta criada
- **Nota:** Zé-Sales pode instruir descontos, mas a proposta só é editada via `EditarPropostaUseCase`

### 6.4 AceitarPropostaUseCase
- **Input:** propostaId
- **Fluxo:**
  1. Busca proposta, valida se está `vista` ou `negociacao`
  2. Transita para `aceita`
  3. Calcula valor do sinal (percentual configurado por propriedade)
  4. Cria Pagamento do tipo `sinal` com status `pendente`
  5. Dispara `PropostaAceitaEvent`
- **Output:** Proposta + Pagamento (sinal pendente)

### 6.5 ConfirmarPagamentoUseCase
- **Input:** pagamentoId, codigoTransacao, metodo
- **Fluxo:**
  1. Busca pagamento, valida status `pendente` ou `processando`
  2. Transita para `confirmado`
  3. Se pagamento é `sinal` OU `total`:
     - Busca proposta vinculada
     - Se for primeira confirmação da proposta, dispara `ConversaoRegistradaEvent`
     - Cria Conversão via `IConversaoPort`
     - Transita lead para `convertido` via `ILeadPort`
  4. Dispara `PagamentoConfirmadoEvent`
- **Invariante:** Conversão só é criada se pagamento está confirmado

### 6.6 CalcularTaxaConversaoUseCase
- **Input:** dataInicio, dataFim
- **Fluxo:**
  1. Conta leads capturados no período via `ILeadPort`
  2. Conta conversões no período via `IConversaoPort`
  3. Calcula: `conversoes / leads * 100`
- **Output:** taxa percentual + breakdown por canal

### 6.7 SugerirDescontoUseCase (Zé-Analyst / Yield Management)
- **Input:** propostaId, ocupacaoAtual (do Hospitalidade Context)
- **Fluxo:**
  1. Busca proposta e pacote
  2. Consulta ocupação do período via `IReservaPort` (Hospitalidade)
  3. Se ocupação < 60%, sugere desconto de 10% no pacote
  4. Se ocupação < 30%, sugere desconto de 20%
  5. Se lead está há 7+ dias sem resposta, sugere desconto gradual
- **Output:** `{ descontoSugerido: Money, justificativa: string }`
- **Nota:** Zé-Sales NÃO PODE aprovar o desconto sozinho — a sugestão passa pelo Zé-Analyst que valida viabilidade financeira

### 6.8 ProcessarPropostasExpiradasUseCase (Job)
- **Input:** (nenhum — job schedulado)
- **Fluxo:**
  1. Lista propostas expiradas via `listExpiradas`
  2. Para cada uma, transita para `expirada`
  3. Dispara `PropostaExpiradaEvent` + gatilho de marketing (Zé-Marketer)

---

## 7. Fronteira dos Agentes

### 7.1 Zé-Sales (Sistema Límbico — Conversão e Fechamento)

**Personalidade:** Fechador, persuasivo, orientado a dados de conversão. Fala a linguagem do hóspede, não do sistema.

**PODE:**
- Consultar leads, propostas, pacotes e conversões (via portas de leitura)
- Capturar leads manuais (recepcionista qualifica no balcão)
- Criar e editar propostas (rascunho, envio, negociação)
- Aplicar descontos DESDE QUE validados pelo Zé-Analyst
- Solicitar reativação de leads perdidos
- Visualizar taxas de conversão e métricas de funil
- Encaminhar lead para Zé-Marketer para nutrição automática
- Acionar o `AceitarPropostaUseCase` para iniciar fluxo de pagamento

**NÃO PODE:**
- ❌ Aprovar pagamentos sozinho — pagamento é processado por gateway externo, validado pelo `ConfirmarPagamentoUseCase`
- ❌ Alterar regras de precificação de pacotes — isso é domínio do Zé-Marketer
- ❌ Acessar dados de outros tenants (RLS inviolável)
- ❌ Modificar proposta depois de `aceita`
- ❌ Criar conversão manualmente — conversão só existe após pagamento confirmado
- ❌ Ver dados brutos de pagamento (apenas status e valor)
- ❌ Excluir leads ou propostas

### 7.2 Zé-Marketer (Córtex Criativo — Copywriting e Campanhas)

**Personalidade:** Criativo, analítico, orientado a métricas de engajamento. Pensa em segmentação, timing e conteúdo.

**PODE:**
- Consultar leads por segmento (tags, canal, score, status)
- Criar e gerenciar pacotes (versões, precificação, categorias)
- Ativar/pausar/arquivar pacotes
- Disparar gatilhos de marketing (e-mail, WhatsApp, push) baseados em eventos
- Visualizar taxas de conversão por canal e campanha
- Consultar métricas de nutrição (abertura, clique, resposta)
- Sugerir segmentações para campanhas

**NÃO PODE:**
- ❌ Acessar propostas de leads individuais sem permissão do Zé-Sales
- ❌ Aprovar descontos ou yield management (competência do Zé-Analyst)
- ❌ Ver dados de pagamento (apenas saber se houve ou não conversão)
- ❌ Acessar dados de outros tenants (RLS inviolável)
- ❌ Criar propostas comerciais
- ❌ Solicitar conversão manual

---

## 8. Fluxos de Domínio (Sagas)

### 8.1 Funil de Conversão (Fluxo Principal)

```
Lead entra no sistema (site/WhatsApp)
    │
    ▼
CapturarLeadUseCase → Lead.novo
    │
    ▼ (score ≥ 30)
QualificarLeadUseCase → Lead.qualificado
    │
    ▼ (Zé-Sales cria oferta)
CriarPropostaUseCase → Proposta.rascunho → enviada
    │
    ▼ (Lead visualiza)
Proposta.vista
    │
    ▼ (Negociação)
Proposta.negociacao → aceita
    │
    ▼ (Sinal ou Total)
AceitarPropostaUseCase → Pagamento.pendente
    │
    ▼ (Gateway confirma)
ConfirmarPagamentoUseCase → Pagamento.confirmado → Conversao → Lead.convertido
    │
    ▼ (Dispara criação de hóspede)
Evento: ConversaoRegistradaEvent → Hospitalidade Context
```

### 8.2 Abandono de Funil (Recuperação)

```
Proposta.enviada ou vista sem interação por 3+ dias
    │
    ▼ (Gatilho Zé-Marketer)
E-mail/WhatsApp de recuperação automática
    │
    ▼ (Lead responde)
Lead volta ao fluxo → Zé-Sales retoma negociação
    │
    ▼ (Lead não responde por 7+ dias)
Proposta → expirada → Gatilho de oferta especial
```

### 8.3 Yield Management (Desconto Inteligente)

```
Ocupação do período < 60%
    │
    ▼
SugerirDescontoUseCase → { desconto, justificativa }
    │
    ▼ (Zé-Analyst valida)
Zé-Sales aplica desconto na proposta
    │
    ▼ (Lead recebe nova versão)
Proposta.negociacao com valor atualizado
```

---

## 9. Invariantes de Negócio (Resumo)

| # | Invariante | Onde é validada |
|---|---|---|
| 1 | Lead não converte sem pagamento confirmado | `Conversao.create()` |
| 2 | Score mínimo 30 para qualificação | `Lead.qualificar()` |
| 3 | Desconto não excede valor total da proposta | `Proposta.aplicarDesconto()` |
| 4 | Sinal máximo 50% do valor total | `Pagamento.create(tipo: 'sinal')` |
| 5 | Soma pagamentos confirmados ≤ valor total | `ConfirmarPagamentoUseCase` |
| 6 | Proposta expira após validade | `ProcessarPropostasExpiradasUseCase` |
| 7 | Proposta convertida é imutável | `Proposta.transitar('convertida')` |
| 8 | Um lead = uma conversão ativa | `ConversaoPort.listByLead()` |
| 9 | Capacidade do pacote respeitada | `Proposta.create()` |
| 10 | Conversão é imutável | `Conversao` sem setters |
| 11 | Documento obrigatório na conversão (LGPD) | `Lead.converter()` |
| 12 | RLS: dado comercial pertence a UMA propriedade | Todas as portas |

---

## 10. Swarm Lite — Mapa de Agentes

| Agente | Contexto | Portas Consumidas | Gatilhos |
|---|---|---|---|
| **Zé-Sales** | Comercial (Conversão) | `ILeadPort`, `IPropostaPort`, `IPagamentoPort` (leitura), `IConversaoPort` | Lead qualificado, proposta vista, pagamento recusado |
| **Zé-Marketer** | Comercial (Marketing) | `ILeadPort`, `IPacotePort`, `IConversaoPort` | Lead capturado, proposta expirada, lead inativo 7+ dias |
| **Zé-Analyst** | Comercial (Yield) | `IPacotePort`, `IPropostaPort`, `IReservaPort` (via Hospitalidade) | Ocupação baixa, lead parado na negociação |

---

## 11. Eventos de Domínio (Cross-Context)

| Evento | Origem | Consumidores | Ação |
|---|---|---|---|
| `LeadCapturadoEvent` | Comercial | Zé-Marketer | Iniciar nutrição automática |
| `LeadQualificadoEvent` | Comercial | Zé-Sales | Notificar para contato |
| `PropostaCriadaEvent` | Comercial | Zé-Sales, Zé-Marketer | Acompanhar funil |
| `PropostaAceitaEvent` | Comercial | Zé-Sales | Disparar cobrança de sinal |
| `PagamentoConfirmadoEvent` | Comercial | Zé-Sales, Financeiro | Criar conversão + fatura |
| `PagamentoRecusadoEvent` | Comercial | Zé-Sales | Notificar lead + tentar nova forma |
| `ConversaoRegistradaEvent` | Comercial → **Hospitalidade** | Zé-Concierge | Criar cadastro de hóspede + reserva |
| `PropostaExpiradaEvent` | Comercial | Zé-Marketer | Disparar oferta de recuperação |

---

## 12. Erros de Domínio

| Código | Mensagem | Contexto |
|---|---|---|
| `LEAD_NOT_FOUND` | Lead não encontrado | ILeadPort |
| `LEAD_ALREADY_CONVERTED` | Este lead já foi convertido | QualificarLeadUseCase |
| `SCORE_INSUFFICIENT` | Score mínimo para qualificação é 30 | QualificarLeadUseCase |
| `INVALID_SCORE_VALUE` | Score deve estar entre 0 e 100 | Score.create() |
| `PROPOSTA_NOT_FOUND` | Proposta não encontrada | IPropostaPort |
| `PROPOSTA_EXPIRED` | Proposta expirada | AceitarPropostaUseCase |
| `PROPOSTA_ALREADY_CONVERTED` | Proposta já convertida | AceitarPropostaUseCase |
| `PROPOSTA_CANNOT_BE_EDITED` | Proposta não pode ser editada no status atual | EditarPropostaUseCase |
| `DISCOUNT_EXCEEDS_TOTAL` | Desconto não pode exceder o valor total | Proposta.aplicarDesconto() |
| `PACOTE_NOT_FOUND` | Pacote não encontrado | IPacotePort |
| `PACOTE_INACTIVE` | Pacote inativo não pode ser usado em propostas | CriarPropostaUseCase |
| `PACOTE_CAPACITY_EXCEEDED` | Quantidade de hóspedes excede capacidade do pacote | Proposta.create() |
| `PAGAMENTO_NOT_FOUND` | Pagamento não encontrado | IPagamentoPort |
| `PAGAMENTO_ALREADY_CONFIRMED` | Pagamento já confirmado | ConfirmarPagamentoUseCase |
| `PAGAMENTO_EXCEEDS_TOTAL` | Pagamento excede valor total da proposta | ConfirmarPagamentoUseCase |
| `SINAL_EXCEEDS_MAX` | Sinal não pode exceder 50% do valor total | Pagamento.create() |
| `CONVERSAO_NOT_FOUND` | Conversão não encontrada | IConversaoPort |
| `CONVERSAO_ALREADY_EXISTS` | Lead já possui conversão ativa | ConfirmarPagamentoUseCase |
| `INVALID_DOCUMENT` | Documento inválido para o tipo informado | Documento.create() |
| `INVALID_EMAIL` | E-mail inválido | Email.create() |
| `PAYMENT_REQUIRED_FOR_CONVERSION` | Pagamento é obrigatório para conversão | Conversao.create() |

---

## 13. Glossário de Eventos vs Gatilhos de Marketing

| Evento de Domínio | Gatilho Zé-Marketer | Canal |
|---|---|---|
| `LeadCapturadoEvent` | Boas-vindas automáticas | WhatsApp + E-mail |
| `Lead.qualificado` sem proposta em 24h | Lembrete de oferta | E-mail |
| `PropostaCriadaEvent` | Resumo da proposta | WhatsApp |
| `Proposta vista` sem retorno em 48h | Oferta especial limitada | E-mail + WhatsApp |
| `PropostaExpiradaEvent` | "Saudades" com desconto exclusivo | E-mail |
| `PagamentoRecusadoEvent` | "Tivemos um problema" + nova tentativa | WhatsApp |
| `PagamentoConfirmadoEvent` | Confirmação + próximos passos | WhatsApp |
| `ConversaoRegistradaEvent` | Preparação para estadia (checklist) | E-mail |

---

> **This specification is the contract.** The Commercial Context is the artery through which revenue flows. Zero tolerance for failure. All code is disposable — these invariants, ports, and agent boundaries are the immutable assets.
>
> *Nenhuma linha de controlador, banco ou framework será escrita antes da homologação destes contratos.*
