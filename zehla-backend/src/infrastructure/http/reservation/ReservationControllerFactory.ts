import { getRepoPrisma } from '../../../lib/prisma'
import { CreateReservationUseCase } from '../../../application/reservation/use-cases/CreateReservationUseCase'
import { CancelReservationUseCase } from '../../../application/reservation/use-cases/CancelReservationUseCase'
import { CheckInUseCase } from '../../../application/reservation/use-cases/CheckInUseCase'
import { CheckOutUseCase } from '../../../application/reservation/use-cases/CheckOutUseCase'
import { PrismaChecklistRepository } from '../../persistence/operacional/PrismaChecklistRepository'
import { UpdateReservationUseCase } from '../../../application/reservation/use-cases/UpdateReservationUseCase'
import { LinkPaymentUseCase } from '../../../application/reservation/use-cases/LinkPaymentUseCase'
import { ListReservationsUseCase } from '../../../application/reservation/use-cases/ListReservationsUseCase'
import { ProcessPaymentProofUseCase } from '../../../application/reservation/use-cases/ProcessPaymentProofUseCase'
import { PrismaReservationRepository } from '../../persistence/reservation/PrismaReservationRepository'
import { PrismaRoomRepository } from '../../persistence/reservation/PrismaRoomRepository'
import { PrismaPaymentRepository } from '../../persistence/reservation/PrismaPaymentRepository'
import { PrismaPricingService } from '../../persistence/reservation/PrismaPricingService'
import { PrismaAvailabilityService } from '../../persistence/reservation/PrismaAvailabilityService'
import { ConsoleEventBus } from '../../events/ConsoleEventBus'
import { CreateReservationController } from './CreateReservationController'
import type { IReservationRepository } from '../../../application/reservation/ports/IReservationRepository'
import type { IRoomRepository } from '../../../application/reservation/ports/IRoomRepository'
import type { IPaymentRepository } from '../../../application/reservation/ports/IPaymentRepository'
import type { IPricingService } from '../../../application/reservation/ports/IPricingService'
import type { IAvailabilityService } from '../../../application/reservation/ports/IAvailabilityService'
import type { IEventBus } from '../../../application/reservation/ports/IEventBus'

export class ReservationControllerFactory {
  private static db = getRepoPrisma()
  private static eventBus: IEventBus = new ConsoleEventBus()

  private static _reservationRepo: IReservationRepository = new PrismaReservationRepository(ReservationControllerFactory.db)
  private static _roomRepo: IRoomRepository = new PrismaRoomRepository(ReservationControllerFactory.db)
  private static _paymentRepo: IPaymentRepository = new PrismaPaymentRepository(ReservationControllerFactory.db)
  private static _pricingService: IPricingService = new PrismaPricingService(ReservationControllerFactory.db)
  private static _availabilityService: IAvailabilityService = new PrismaAvailabilityService(ReservationControllerFactory.db)

  static configure(deps: {
    reservationRepo?: IReservationRepository
    roomRepo?: IRoomRepository
    paymentRepo?: IPaymentRepository
    pricingService?: IPricingService
    availabilityService?: IAvailabilityService
    eventBus?: IEventBus
  }): void {
    if (deps.reservationRepo) ReservationControllerFactory._reservationRepo = deps.reservationRepo
    if (deps.roomRepo) ReservationControllerFactory._roomRepo = deps.roomRepo
    if (deps.paymentRepo) ReservationControllerFactory._paymentRepo = deps.paymentRepo
    if (deps.pricingService) ReservationControllerFactory._pricingService = deps.pricingService
    if (deps.availabilityService) ReservationControllerFactory._availabilityService = deps.availabilityService
    if (deps.eventBus) ReservationControllerFactory.eventBus = deps.eventBus
  }

  static reset(): void {
    ReservationControllerFactory.configure({
      reservationRepo: new PrismaReservationRepository(ReservationControllerFactory.db),
      roomRepo: new PrismaRoomRepository(ReservationControllerFactory.db),
      paymentRepo: new PrismaPaymentRepository(ReservationControllerFactory.db),
      pricingService: new PrismaPricingService(ReservationControllerFactory.db),
      availabilityService: new PrismaAvailabilityService(ReservationControllerFactory.db),
      eventBus: new ConsoleEventBus(),
    })
  }

  static makeCreateReservationController(): CreateReservationController {
    const useCase = new CreateReservationUseCase(
      ReservationControllerFactory._reservationRepo,
      ReservationControllerFactory._roomRepo,
      ReservationControllerFactory._pricingService,
      ReservationControllerFactory._availabilityService,
      ReservationControllerFactory.eventBus
    )
    return new CreateReservationController(useCase)
  }

  static makeCreateUseCase(): CreateReservationUseCase {
    return new CreateReservationUseCase(
      ReservationControllerFactory._reservationRepo,
      ReservationControllerFactory._roomRepo,
      ReservationControllerFactory._pricingService,
      ReservationControllerFactory._availabilityService,
      ReservationControllerFactory.eventBus
    )
  }

  static makeCancelUseCase(): CancelReservationUseCase {
    return new CancelReservationUseCase(
      ReservationControllerFactory._reservationRepo,
      ReservationControllerFactory._roomRepo,
      ReservationControllerFactory.eventBus
    )
  }

  static makeCheckInUseCase(): CheckInUseCase {
    return new CheckInUseCase(
      ReservationControllerFactory._reservationRepo,
      ReservationControllerFactory._roomRepo,
      ReservationControllerFactory.eventBus
    )
  }

  static makeCheckOutUseCase(): CheckOutUseCase {
    return new CheckOutUseCase(
      ReservationControllerFactory._reservationRepo,
      ReservationControllerFactory._roomRepo,
      ReservationControllerFactory.eventBus,
      new PrismaChecklistRepository(ReservationControllerFactory.db)
    )
  }

  static makeLinkPaymentUseCase(): LinkPaymentUseCase {
    return new LinkPaymentUseCase(
      ReservationControllerFactory._reservationRepo,
      ReservationControllerFactory._paymentRepo,
      ReservationControllerFactory.eventBus
    )
  }

  static makeUpdateUseCase(): UpdateReservationUseCase {
    return new UpdateReservationUseCase(
      ReservationControllerFactory._reservationRepo,
      ReservationControllerFactory._availabilityService
    )
  }

  static makeListUseCase(): ListReservationsUseCase {
    return new ListReservationsUseCase(ReservationControllerFactory._reservationRepo)
  }

  static makeProcessPaymentProofUseCase(): ProcessPaymentProofUseCase {
    return new ProcessPaymentProofUseCase(
      ReservationControllerFactory._reservationRepo,
      ReservationControllerFactory._paymentRepo,
      ReservationControllerFactory.eventBus
    )
  }
}
