# SPEC — Domínio de Hospitalidade (Bounded Context)

> **Propósito:** Especificar o coração do ZEHLA PRIME — o Bounded Context de Hospitalidade — suas entidades, invariantes de negócio, contratos de porta e a fronteira do agente Zé-Concierge. Nenhuma linha de código. Apenas intenção, regras e contratos.
>
> **Arquitetura:** DDD Estrito + Ports & Adapters + Organismo de 7 Camadas
>
> **Linguagem:** Natural (Português) — ubíqua, não técnica

---

## 1. Contexto Delimitado (Bounded Context)

### 1.1 Nome
**Hospitalidade Context** — também referido como **Domínio de Hospitalidade** ou **Núcleo de Atendimento**.

### 1.2 Propósito
Gerencia a experiência do hóspede do primeiro contato ao pós-checkout: cadastro, reservas, serviços de quarto, feedback, e personalização de estadia. É o contexto mais sensível do ecossistema porque lida diretamente com dados pessoais (PII), preferências íntimas, e a percepção de qualidade do cliente.

### 1.3 Fronteira (O que PERTENCE ao contexto)
- Gestão de hóspedes (cadastro, histórico, preferências)
- Gestão de quartos (inventário, tipos, capacidades, amenities)
- Gestão de reservas (criação, check-in, check-out, alteração, cancelamento)
- Gestão de serviços de quarto (SPA, passeios, room service, transfers)
- Gestão de feedback (avaliações, sentimentos, NPS)

### 1.4 Fronteira (O que NÃO pertence)
- Financeiro (pagamentos, faturas, PIX) → **Comercial Context**
- Leads e prospecção → **Comercial Context**
- Manutenção predial e SLAs de staff → **Operacional Context**
- Tokenização PII, JWT, HMAC → **Segurança Context**
- Campanhas de marketing e posts → **Marketing Context**

### 1.5 Interface de Porta
O contexto expõe **`IHospitalityContextPort`** — um contrato (interface) no diretório `application/ports/`. Nenhum agente ou serviço externo acessa as entidades diretamente. Tudo passa pela Porta.

---

## 2. Linguagem Ubíqua

| Termo | Definição |
|---|---|
| **Hóspede** | Pessoa física que se hospeda ou já se hospedou. Pode ser o titular da reserva ou acompanhante. Identificado por ID único UUIDv7. |
| **Quarto** | Unidade física de hospedagem. Possui tipo, capacidade máxima, amenities e estado de ocupação. |
| **Reserva** | Contrato temporário entre hóspede e pousada que garante direito de uso a um quarto por um período. |
| **Serviço** | Item não-hospedagem vendido ou ofertado: café da manhã, SPA, passeio, transfer, room service. |
| **Feedback** | Avaliação pós-estadia. Inclui nota (0-10), texto livre, e metadados de sentimento. |
| **Check-in** | Ato de ocupação física do quarto. Dispara faturamento de diárias. |
| **Check-out** | Ato de desocupação. Dispara cobrança final e solicitação de feedback. |
| **Estadia** | Período contínuo entre check-in e check-out de uma reserva. |
| **Capacidade** | Número máximo de hóspedes que um quarto pode acomodar legalmente. |
| **Amenities** | Comodidades do quarto: ar-condicionado, frigobar, TV, cofre, Wi-Fi. |

---

## 3. Entidades (Modelo Rico)

Nenhuma entidade expõe setters públicos. Nenhuma entidade aceita estado inválido. Toda mutação retorna um novo estado ou um erro de negócio.

### 3.1 Hóspede (Guest)

**Identidade:** `guestId: UUIDv7`

**Atributos imutáveis (definidos na criação):**
- `nomeCompleto` — string não-vazia, mínimo 2 caracteres
- `documento` — CPF ou Passaporte (Value Object separado)
- `dataNascimento` — data ISO, deve ser maior que 18 anos atrás (salvo menor acompanhado)

**Atributos mutáveis (por processo específico):**
- `email` — string email válido
- `telefone` — string telefone BR formatado
- `preferencias` — mapa chave-valor (ex: `{ "tipo_travesseiro": "antialérgico", "andar": "baixo" }`)
- `observacoes` — texto livre, máximo 500 caracteres
- `historicoEstadias` — lista de referências a reservas concluídas

**Invariantes:**
- Um Hóspede não pode estar vinculado a duas reservas simultâneas no mesmo período na mesma pousada (regra de negócio validada pelo Caso de Uso, não pela entidade isolada)
- `documento` é único por pousada (RLS)
- `email` pode ser atualizado, mas o antigo deve ser mantido em log de auditoria

### 3.2 Quarto (Room)

**Identidade:** `roomId: UUIDv7`

**Atributos imutáveis:**
- `tipo` — enum: `suite_master | suite_casal | quarto_duplo | quarto_solteiro | cabana`
- `capacidadeMaxima` — inteiro >= 1 (valor legal ANVISA)
- `andar` — inteiro >= 0

**Atributos mutáveis:**
- `nome` — string não-vazia (ex: "Suíte Lua de Mel")
- `status` — enum: `disponivel | ocupado | manutencao | reservado | limpeza`
- `diariaBase` — Money (valor em reais, centavos)
- `amenities` — lista de strings
- `descricao` — texto livre, máximo 1000 caracteres

**Invariantes:**
- Status `manutencao` bloqueia novas reservas e exige data de retorno
- Status `ocupado` exige uma reserva ativa vinculada
- Um quarto não pode ser excluído se possui reservas passadas (deve ser arquivado)
- `diariaBase` não pode ser zero ou negativa

### 3.3 Reserva (Booking)

**Identidade:** `bookingId: UUIDv7`

**Atributos imutáveis:**
- `guestId` — referência ao Hóspede
- `roomId` — referência ao Quarto
- `dataCheckIn` — data ISO (>= hoje no ato da criação, salvo check-in retroagendado por admin)
- `dataCheckOut` — data ISO (estritamente > dataCheckIn)
- `dataCriacao` — timestamp

**Atributos mutáveis por eventos:**
- `status` — enum máquina de estados (ver abaixo)
- `numeroHospedes` — inteiro entre 1 e `room.capacidadeMaxima`
- `servicosContratados` — lista de referências a Serviço com quantidade e preço na data
- `descontoAplicado` — Money, deve ser < valor total
- `checkInRealizado` — timestamp, nulo até check-in
- `checkOutRealizado` — timestamp, nulo até check-out

**Máquina de Estados (imutável):**

```
[pendente] → [confirmada] → [checkin] → [checkout] → [finalizada]
    │             │                              │
    └→ [cancelada] └→ [cancelada]                └→ [cancelada]
```

- `pendente`: reserva criada, sem garantia financeira. Expira em 24h se não paga.
- `confirmada`: pagamento confirmado ou garantia dada. Bloqueia o quarto.
- `checkin`: hóspede ocupou o quarto. Diárias começam a contar.
- `checkout`: hóspede desocupou. Faturamento finalizado.
- `finalizada`: período fechado, fatura quitada. Disponível para feedback.
- `cancelada`: reserva cancelada. Quarto liberado. Pode ter multa.

**Regras de Transição:**
- `pendente → confirmada` exige garantia financeira (pagamento ou cartão em arquivo)
- `confirmada → checkin` só se a data atual == dataCheckIn (com tolerância de 2h) e quarto não está em manutenção
- `confirmada → cancelada` pode ter multa se faltar menos de 48h para o check-in. Multa = 50% da primeira diária.
- `checkin → checkout` exige que data atual >= dataCheckOut. Pode ser antecipado com aviso de 12h.
- `checkout → finalizada` exige fatura quitada
- Uma reserva `finalizada` não pode mais ser alterada. Apenas o Feedback pode ser vinculado.

### 3.4 Serviço (Service)

**Identidade:** `serviceId: UUIDv7`

**Atributos:**
- `nome` — string não-vazia (ex: "Café da Manhã", "Massagem Relaxante")
- `descricao` — texto livre, máximo 500 caracteres
- `precoAtual` — Money > 0
- `categoria` — enum: `alimentacao | spa | passeio | transfer | lavanderia | outro`
- `disponivel` — boolean. Se false, não pode ser vendido.

**Regras de Negócio:**
- Um Serviço só pode ser vinculado a uma Reserva se `status` da reserva for `confirmada` ou `checkin`
- Serviços quitados no check-in não podem ser estornados após o consumo (data do serviço passou)
- O preço do serviço é congelado no momento da contratação (valor histórico preservado na reserva)

### 3.5 Feedback (Feedback)

**Identidade:** `feedbackId: UUIDv7`

**Atributos:**
- `bookingId` — referência à Reserva (chave estrangeira)
- `notaGeral` — inteiro 0-10
- `comentario` — texto livre, máximo 2000 caracteres
- `categorias` — mapa de notas por categoria: `{ "atendimento": 9, "limpeza": 8, "cafe": 10 }`
- `dataCriacao` — timestamp
- `sentimento` — calculado pelo Zé-Analyst (enum: `positivo | neutro | negativo`)

**Invariantes:**
- Só pode existir um Feedback por Reserva
- Só pode ser criado se a Reserva está `finalizada`
- `notaGeral` é um campo obrigatório; `comentario` é opcional
- Se `notaGeral` < 4, um alerta crítico deve ser disparado para Zé-Ops

---

## 4. Contratos de Porta (Segregados por Agregado)

Nenhuma interface monolítica. Cada agregado de domínio expõe sua própria porta, respeitando o **Princípio da Segregação de Interfaces (SOLID — I)**. Um Caso de Uso ou Agente recebe apenas a porta de que precisa.

### 4.1 IHospedePort

```
interface IHospedePort:
    getById(guestId: GuestId): Result<Hospede, Error>
    getByDocument(documento: Documento): Result<Hospede, Error>
    search(query: GuestSearchQuery): Result<Hospede[], Error>
    save(hospede: Hospede): Result<Hospede, Error>
    delete(guestId: GuestId): Result<void, Error>
```

### 4.2 IReservaPort

```
interface IReservaPort:
    getById(bookingId: BookingId): Result<Reserva, Error>
    listByGuest(guestId: GuestId): Result<Reserva[], Error>
    listByRoom(roomId: RoomId, periodo?: DateRange): Result<Reserva[], Error>
    listUpcomingCheckins(timeWindow: DateRange): Result<Reserva[], Error>
    listUpcomingCheckouts(timeWindow: DateRange): Result<Reserva[], Error>
    listByPeriod(periodo: DateRange): Result<Reserva[], Error>
    isRoomAvailable(roomId: RoomId, periodo: DateRange): Result<boolean, Error>
    save(reserva: Reserva): Result<Reserva, Error>
    delete(bookingId: BookingId): Result<void, Error>
```

### 4.3 IQuartoPort

```
interface IQuartoPort:
    getById(roomId: RoomId): Result<Quarto, Error>
    listAvailable(periodo: DateRange, capacidadeMinima?: int): Result<Quarto[], Error>
    listByTipo(tipo: TipoQuarto): Result<Quarto[], Error>
    save(quarto: Quarto): Result<Quarto, Error>
    updateStatus(roomId: RoomId, status: StatusQuarto): Result<Quarto, Error>
```

### 4.4 IServicoPort

```
interface IServicoPort:
    getById(serviceId: ServiceId): Result<Servico, Error>
    listAvailable(): Result<Servico[], Error>
    listByCategoria(categoria: CategoriaServico): Result<Servico[], Error>
    save(servico: Servico): Result<Servico, Error>
```

### 4.5 IFeedbackPort

```
interface IFeedbackPort:
    getById(feedbackId: FeedbackId): Result<Feedback, Error>
    listByPeriod(periodo: DateRange): Result<Feedback[], Error>
    listByBooking(bookingId: BookingId): Result<Feedback[], Error>
    save(feedback: Feedback): Result<Feedback, Error>
    getNPS(periodo: DateRange): Result<number, Error>
```

**Observação:** As implementações destas interfaces (ex: `PrismaReservaRepository`) estarão em `infrastructure/persistence/hospitalidade/`. O domínio nunca vê essas implementações. Casos de Uso recebem as portas por injeção no construtor.

---

## 5. Fronteira do Agente Zé-Concierge

### 5.1 Quem é Zé-Concierge

O Zé-Concierge é a **boca do cérebro**. É o agente responsável pelo atendimento ao hóspede nos canais de I/O (WhatsApp, Web Chat). Ele traduz linguagem natural em comandos de domínio.

### 5.2 O que Zé-Concierge PODE fazer (via Portas segregadas)

O Zé-Concierge recebe **apenas as portas de que precisa** por injeção no construtor: `IHospedePort`, `IReservaPort`, `IQuartoPort`, `IServicoPort`, `IFeedbackPort`. Ele nunca vê a interface inteira de outro agregado.

- Consultar dados de hóspede (`IHospedePort.getById`, `IHospedePort.getByDocument`)
- Consultar disponibilidade de quartos (`IQuartoPort.listAvailable`)
- Consultar serviços disponíveis (`IServicoPort.listAvailable`)
- Criar uma nova reserva (`IReservaPort.save`) — apenas se hóspede já cadastrado
- Adicionar serviços a uma reserva confirmada
- Consultar dados da própria reserva (`IReservaPort.getById`)
- Criar feedback pós-estadia (`IFeedbackPort.save`)
- Consultar check-ins e check-outs futuros (`IReservaPort.listUpcomingCheckins`)

### 5.3 O que Zé-Concierge NÃO PODE fazer

- Alterar status de reserva exceto criar e cancelar (`updateBookingStatus` só via confirmação explícita do hóspede)
- Realizar check-in ou check-out fisicamente (`performCheckin`, `performCheckout` — exclusivo de Zé-Ops)
- Excluir hóspedes ou dados
- Alterar preços de serviços ou quartos
- Acessar dados financeiros (valor total da fatura ele pode ver, mas não processar pagamento)
- Acessar dados de segurança (tokens, HMAC, JWT)
- Falar diretamente com leads não-convertidos (isso é Zé-Sales)

### 5.4 Fluxo Típico de Atendimento

```
Hóspede (WhatsApp): "Quero reservar a suíte master para o próximo fim de semana"
    │
    ▼
[PIIScanner] → tokeniza PII da mensagem
    │
    ▼
[PromptSanitizer] → verifica jailbreak
    │
    ▼
[Zé-Concierge] → interpreta intenção → chama IHospitalityContextPort:
    ├── 1. getGuestByDocument (localiza hóspede ou cria)
    ├── 2. listAvailableRooms (periodo, capacidade=2)
    ├── 3. createBooking (guestId, roomId, datas)
    └── 4. retorna confirmação para o canal
    │
    ▼
[OutputValidator] → verifica se resposta não vazou PII
    │
    ▼
Resposta enviada ao WhatsApp
```

### 5.5 ZCP DTOs do Zé-Concierge

**Input (do canal para o agente):**
```json
{
  "tenant_id": "string (RLS Scope)",
  "agent_signature": "string (HMAC SHA-256 ZCP)",
  "message_id": "string (UUIDv7)",
  "guest_id": "string | null (se identificado)",
  "raw_text": "string (texto tokenizado ZDR)",
  "channel": "string (whatsapp | web | api)"
}
```

**Output (do agente para o canal):**
```json
{
  "response_id": "string (UUIDv7)",
  "response_text": "string (texto sem PII)",
  "confidence_score": "number (0.0-1.0)",
  "needs_escalation": "boolean",
  "suggested_upsell_id": "string | null"
}
```

---

## 6. Validações (Questions para o Implementador)

Estas perguntas devem ser respondidas pelo Arquiteto antes de qualquer linha de código:

1. **Reserva nasce sem hóspede?** Sim — uma reserva pode ser criada como `pendente` com dados parciais (apenas nome + WhatsApp), mas exige cadastro completo antes do check-in. O Caso de Uso `CreateBookingUseCase` deve aceitar um `guestId` opcional.

2. **Serviço de SPA pode ser atrelado a reserva com status `checkout`?** Não. Um serviço só pode ser contratado enquanto a reserva está `confirmada` ou `checkin`. Após o check-out, a reserva está em fase de finalização financeira e nenhum novo serviço pode ser adicionado.

3. **Quarto pode ficar sem diária?** Não. Toda reserva tem pelo menos 1 diária (check-in e check-out em datas diferentes). Reservas de mesmo dia (check-in = check-out) são proibidas — exceto para "day use", que é um tipo de reserva separado com regras próprias.

4. **Hóspede pode ter múltiplas reservas simultâneas?** Depende. Na mesma pousada, não (um hóspede não pode ocupar dois quartos ao mesmo tempo). Em pousadas diferentes (cross-property), sim — cada pousada é um tenant separado (RLS).

5. **Feedback pode ser editado?** Não. Feedback é imutável após a criação. Se o hóspede quiser alterar, um novo feedback é criado e o antigo é arquivado.

---

## 7. Glossário de Erros de Negócio

| Erro | Significado |
|---|---|
| `GUEST_NOT_FOUND` | Hóspede não encontrado |
| `ROOM_NOT_FOUND` | Quarto não encontrado |
| `ROOM_UNAVAILABLE` | Quarto ocupado ou em manutenção no período |
| `ROOM_CAPACITY_EXCEEDED` | Número de hóspedes excede a capacidade do quarto |
| `BOOKING_NOT_FOUND` | Reserva não encontrada |
| `BOOKING_WRONG_STATUS` | Operação inválida para o status atual da reserva |
| `BOOKING_OVERLAP` | Hóspede já tem reserva no mesmo período |
| `CHECKIN_TOO_EARLY` | Check-in antes da data permitida |
| `CHECKIN_ROOM_MAINTENANCE` | Quarto está em manutenção |
| `CHECKOUT_BEFORE_DEPARTURE` | Check-out antes da data sem aviso prévio |
| `SERVICE_NOT_FOUND` | Serviço não encontrado |
| `SERVICE_UNAVAILABLE` | Serviço indisponível para venda |
| `SERVICE_CANNOT_BE_REFUNDED` | Serviço já consumido não pode ser estornado |
| `FEEDBACK_ALREADY_EXISTS` | Reserva já possui feedback |
| `FEEDBACK_INVALID_RATING` | Nota fora do intervalo 0-10 |
| `BOOKING_NOT_FINALIZED` | Reserva ainda não finalizada para receber feedback |

---

## 8. Pendências (Decisions Log)

| # | Decisão | Status |
|---|---|---|
| 1 | Feedback imutável? | **SIM** — arquivar é suficiente |
| 2 | Criar hóspede no ato da reserva? | **SIM** — dados mínimos (nome+contato) |
| 3 | Check-in antecipado permitido? | **DEPENDE** — tolerância 2h, ou configuração por pousada |
| 4 | Dia de check-out cobra diária? | **SIM** — política padrão hotelaria |
| 5 | Serviços com preço histórico? | **SIM** — preço congelado no ato da contratação |

---

*Esta SPEC é o contrato. O código é artefato descartável. A especificação é o ativo.*

---

> **Navegação:** [[ZEHLA_INDEX]] | [[AGENTS]] | [[DESIGN]] | [[SPEC_COMERCIAL]] | [[SPEC_MARKETING]] | [[SPEC_OPERACIONAL]] | [[SPEC_REVENUE]] | [[SKILL]]
