# SKILL — Contrato Determinístico

## Leis Imutáveis da Arquitetura

Este arquivo define os contratos que todo agente (IA ou humano) DEVE seguir ao implementar, refatorar ou estender o ZEHLA SmartHotel. Violações destas leis são rejeitadas automaticamente.

---

## Lei 1: Isolamento do Domínio

**O domínio é o centro. Frameworks e infraestrutura são detalhes periféricos.**

```
src/
  domain/         ← REGRA: Nunca importa nada de fora do domínio
    entities/       Entidades puras com auto-validação
    value-objects/  Objetos imutáveis com invariantes
    events/         Eventos de domínio
    services/       Serviços de domínio (operam sobre entidades)
  application/
    use-cases/      Casos de uso (orquestradores, sem regras de negócio)
    ports/          Interfaces (repositórios, gateways, presenters)
  infrastructure/
    persistence/    Prisma, SQL, MongoDB — implementação dos ports
    http/           Next.js API routes, controllers
    queue/          BullMQ workers, filas
  interface/
    react/          Componentes, páginas Next.js
    api/            Serialização, validação de input HTTP
```

### Proibições Absolutas

- ❌ `entity.ts` NÃO pode importar `next/server`, `@prisma/client`, `react`
- ❌ `value-object.ts` NÃO pode conter lógica de framework
- ❌ `use-case.ts` NÃO pode acessar banco de dados diretamente — usa `Port`
- ❌ `api/route.ts` NÃO pode conter regras de negócio — chama `UseCase`

---

## Lei 2: Modelagem Rica (Não Anêmica)

**Entidades e Value Objects validam a si mesmos no momento da criação.**

```typescript
// ❌ ERRADO: modelo anêmico (sacola de dados)
class Reservation {
  guestCount: number   // qualquer valor vale? NÃO.
}

// ✅ CORRETO: modelo rico com invariantes
class Reservation {
  private constructor(
    public readonly id: string,
    public readonly guestCount: GuestCount,
    public readonly period: DateRange,
    public readonly price: Money
  ) {}

  static create(props: CreateReservationProps): Result<Reservation, Error> {
    // Todas as validações acontecem aqui
    const guestCount = GuestCount.create(props.guestCount)
    const period = DateRange.create(props.checkIn, props.checkOut)
    // ... falha rápido se invariante violada
  }
}
```

### Value Objects são IMUTÁVEIS

- Uma vez criados, seus valores nunca mudam
- Para "atualizar", crie um novo VO com novos valores
- Toda operação retorna uma NOVA instância

---

## Lei 3: Casos de Uso São Orquestradores

**Use Cases coordenam, não contêm regras de negócio.**

```typescript
// ❌ ERRADO: regra de negócio dentro do use case
class CreateReservationUseCase {
  async execute(input) {
    if (input.guestCount > input.room.capacity) {
      throw new Error('Excede capacidade')
    }
    // ^ ISSO PERTENCE À ENTIDADE
  }
}

// ✅ CORRETO: use case orquestra, entidade valida
class CreateReservationUseCase {
  constructor(
    private repo: ReservationRepository,
    private roomRepo: RoomRepository,
    private pricingService: PricingService
  ) {}

  async execute(input: CreateReservationInput): Result<Reservation> {
    const room = await this.roomRepo.findById(input.roomId)
    const reservation = Reservation.create({ ...input, room })
    // entidade já validou tudo internamente
    return this.repo.save(reservation)
  }
}
```

### Fluxo de um Use Case

1. Recebe input DTO
2. Busca entidades via Ports (repositórios)
3. Chama métodos das entidades (onde as regras vivem)
4. Persiste via Ports
5. Publica eventos de domínio
6. Retorna output DTO

---

## Lei 4: Inversão de Dependência

**O domínio NUNCA enxerga a infraestrutura.**

```
┌─────────────────────┐
│   application/       │
│   ports/             │  ← Interfaces (contratos)
│   ─ IReservationRepo │
│   ─ IPricingService  │
└──────┬──────────────┘
       │ implementa
┌──────▼──────────────┐
│ infrastructure/      │
│ persistence/         │  ← PrismaRepository implementa IReservationRepo
└─────────────────────┘
```

### Regras

- `domain/` e `application/` importam ZERO bibliotecas externas
- `infrastructure/` importa `application/ports/`, nunca o contrário
- Use Cases recebem Ports por injeção no construtor (Dependency Injection)
- Testes substituem Ports por mocks — sem banco de dados

---

## Lei 5: Testes São Domain-First

**Teste as regras de negócio sem framework, sem banco, sem HTTP.**

```
Prioridade:
  1. Testes de domínio (entidades + VOs)  → 90%+ da cobertura
  2. Testes de use case (com ports mockados)
  3. Testes de integração (port → banco real)
  4. Testes E2E (fluxos completos)
```

- Um Value Object sem testes é um bug esperando acontecer
- Entidades são testadas com `new Entity()` sem setup de framework
- Use Cases são testados com repositórios em memória (não Mock, mas InMemoryRepo)

---

## Lei 6: Pastas e Nomenclatura

```
domain/
  reservation/
    Reservation.ts          ← Entidade
    ReservationStatus.ts    ← Enum
    ReservationFactory.ts   ← Fábrica (opcional)
    events/
      ReservationCreatedEvent.ts
      ReservationCancelledEvent.ts

application/
  reservation/
    use-cases/
      CreateReservationUseCase.ts
      CancelReservationUseCase.ts
    ports/
      IReservationRepository.ts
      IPricingService.ts

infrastructure/
  persistence/
    reservation/
      PrismaReservationRepository.ts
  http/
    reservation/
      CreateReservationController.ts
      ReservationRoutes.ts
```

---

## Lei 7: Result Type (Sem Exceções para Fluxo)

**Toda operação que pode falhar retorna `Result<T, E>`, não lança exceção.**

```typescript
class Result<T, E = Error> {
  private constructor(
    private readonly _value?: T,
    private readonly _error?: E
  ) {}

  static ok<T>(value: T): Result<T, never> { return new Result(value) }
  static fail<E>(error: E): Result<never, E> { return new Result(undefined, error) }

  get isOk(): boolean { return this._error === undefined }
  get isFail(): boolean { return !this.isOk }
  get value(): T { if (this.isFail) throw this._error; return this._value! }
  get error(): E { if (this.isOk) throw new Error('No error'); return this._error! }
}
```

Exceções são apenas para erros de infraestrutura (banco offline, rede), NUNCA para regras de negócio.

---

## Lei 8: Eventos de Domínio

**Transições de estado relevantes emitem eventos.**

```typescript
interface DomainEvent {
  aggregateId: string
  eventName: string
  occurredAt: Date
  payload: Record<string, unknown>
}
```

Eventos são:
- Criados pela entidade durante mutações
- Coletados pelo Use Case após `entity.events`
- Publicados em um `EventBus` (port)
- Consumidos por outros contextos (projeções, notificações, sagas)

---

## Lei 9: Migrações e Schema

- `prisma/schema.prisma` é a implementação, NÃO o modelo de domínio
- O schema Prisma reflete a persistência, não necessariamente as entidades
- Uma entidade pode ser composta de várias tabelas; uma tabela pode conter vários VOs serializados
- Migrações são versionadas e nunca alteradas retroativamente

---

## Lei 10: Regra de Ouro

> **Se uma regra de negócio pode ser explicada para um recepcionista de hotel, ela vive na entidade, não no banco, não no framework, não na API.**

"Um quarto não pode ser reservado para mais hóspedes do que sua capacidade" → `Room.canAccommodate(guestCount)`
"Uma reserva não pode ser cancelada após o check-out" → `Reservation.cancel()`
"Desconto não pode exceder o valor total" → `Money.subtract(discount)`

---

## Checklist de Conformidade

Antes de criar/modificar qualquer arquivo, marque:

- [ ] A regra mora na entidade ou no use case?
- [ ] A entidade valida seus próprios dados?
- [ ] O VO é imutável?
- [ ] O use case orquestra sem conter regras?
- [ ] A dependência aponta para dentro (domínio)?
- [ ] O teste testa domínio sem framework?
- [ ] Erros de negócio são `Result`, não `throw`?
- [ ] A transição de estado emitiu evento?
- [ ] Nenhum import de framework no domínio?
- [ ] O schema Prisma é detalhe de implementação?

---

> **Navegação:** [[ZEHLA_INDEX]] | [[AGENTS]] | [[SPEC]] | [[SPEC_OPERACIONAL]] | [[CLAUDE]]
