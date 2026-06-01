# Plano: Reservation Domain Model

## Objetivo
Criar o modelo de domínio rico para o contexto de Reservas, seguindo Clean Architecture e DDD conforme SKILL.md.

## Arquivos Criados

### Domain Layer (`src/domain/`)
| Arquivo | Tipo | Regras validadas |
|---|---|---|
| `shared/Result.ts` | Base | T ERROS como Result, não throw |
| `shared/DomainEvent.ts` | Base | Interface de evento |
| `reservation/ReservationStatus.ts` | Enum | Diagrama de transições com `canTransition()` |
| `reservation/CheckInStatus.ts` | Enum | Status de check-in |
| `reservation/PaymentMethod.ts` | Enum | Métodos de pagamento |
| `reservation/PaymentStatus.ts` | Enum | Status de pagamento |
| `reservation/value-objects/DateRange.ts` | VO | Datas, sobreposição, noites |
| `reservation/value-objects/Money.ts` | VO | Valor, operações aritméticas seguras |
| `reservation/value-objects/GuestCount.ts` | VO | Capacidade, inteiro >= 1 |
| `reservation/value-objects/GuestInfo.ts` | VO | Nome, telefone, email, CPF |
| `reservation/value-objects/PricingBreakdown.ts` | VO | Cálculo de preço + regras |
| `reservation/entities/Payment.ts` | Entity | Confirma, reembolsa, falha |
| `reservation/entities/ReservationItem.ts` | Entity | Item de serviço |
| `reservation/entities/Reservation.ts` | Entity | Aggregate root — TODAS as invariantes |
| `reservation/events/*.ts` | Events | 5 eventos de domínio |

### Application Layer (`src/application/`)
| Arquivo | Tipo |
|---|---|
| `reservation/ports/IReservationRepository.ts` | Port |
| `reservation/ports/IRoomRepository.ts` | Port |
| `reservation/ports/IPaymentRepository.ts` | Port |
| `reservation/ports/IPricingService.ts` | Port |
| `reservation/ports/IAvailabilityService.ts` | Port |
| `reservation/ports/IEventBus.ts` | Port |
| `reservation/use-cases/CreateReservationUseCase.ts` | Use Case |
| `reservation/use-cases/CancelReservationUseCase.ts` | Use Case |
| `reservation/use-cases/CheckInUseCase.ts` | Use Case |
| `reservation/use-cases/CheckOutUseCase.ts` | Use Case |
| `reservation/use-cases/LinkPaymentUseCase.ts` | Use Case |
| `reservation/use-cases/ListReservationsUseCase.ts` | Use Case |

### Infrastructure Layer (`src/infrastructure/`)
| Arquivo | Tipo |
|---|---|
| `persistence/reservation/PrismaReservationRepository.ts` | Repository |
| `persistence/reservation/PrismaRoomRepository.ts` | Repository |
| `persistence/reservation/PrismaPaymentRepository.ts` | Repository |
| `persistence/reservation/PrismaPricingService.ts` | Service |
| `persistence/reservation/PrismaAvailabilityService.ts` | Service |
| `persistence/reservation/InMemoryReservationRepository.ts` | Test Double |
| `events/ConsoleEventBus.ts` | Event Bus |
| `http/reservation/CreateReservationController.ts` | Controller |
| `http/reservation/ReservationControllerFactory.ts` | Factory |

### API v2 Routes (`src/app/api/v2/reservations/`)
| Rota | Método | Use Case |
|---|---|---|
| `/api/v2/reservations` | POST | CreateReservationUseCase |
| `/api/v2/reservations` | GET | ListReservationsUseCase |
| `/api/v2/reservations/:id` | PATCH | Cancel/CheckIn/CheckOut |
| `/api/v2/reservations/:id/payment` | POST | LinkPaymentUseCase |

### Testes (`__tests__/`)
| Arquivo | Testes |
|---|---|
| `domain/reservation/ReservationStatus.test.ts` | 12 |
| `domain/reservation/value-objects/DateRange.test.ts` | 7 |
| `domain/reservation/value-objects/Money.test.ts` | 11 |
| `domain/reservation/value-objects/GuestCount.test.ts` | 7 |
| `domain/reservation/value-objects/GuestInfo.test.ts` | 7 |
| `domain/reservation/value-objects/PricingBreakdown.test.ts` | 4 |
| `domain/reservation/entities/Reservation.test.ts` | 16 |
| `domain/reservation/entities/Payment.test.ts` | 8 |
| `domain/reservation/use-cases/CreateReservationUseCase.test.ts` | 9 |
| **Total** | **81 testes** |

## Invariantes Cobertas
- [x] Disponibilidade: overbooking detectado
- [x] Capacidade: guestCount ≤ room.capacity
- [x] Período: checkOut > checkIn, ≥ 1 noite
- [x] Preço: totalAmount ≥ 0, discount ≤ total
- [x] Pagamento: check-in bloqueado sem pagamento
- [x] Transições: diagrama de estados respeitado
- [x] PII: validação de CPF, email, telefone
- [x] Quarto bloqueado: rejeita reserva
- [x] Eventos emitidos em cada transição

## Próximos Passos
1. Rodar `npx vitest run` para validar os 81 testes
2. Migrar API routes legadas (`reservations/route.ts`) para usar os Use Cases
3. Migrar agent route (`agents/reservations/route.ts`) para usar os Use Cases
4. Substituir `ProcessPaymentProofUseCase.ts` legado para usar o novo domain
5. Corrigir `PENDING_PAYMENT` → `CONFIRMED` no payment proof
