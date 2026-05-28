import { getRepoPrisma } from '../../../lib/prisma'
import { PrismaRoomRepository } from '../../persistence/room/PrismaRoomRepository'
import { PrismaPricingRuleRepository } from '../../persistence/room/PrismaPricingRuleRepository'
import { PrismaRevenueSettingsRepository } from '../../persistence/room/PrismaRevenueSettingsRepository'
import { PricingCalculatorService } from '../../../domain/room/services/PricingCalculatorService'
import { AvailabilityService } from '../../../domain/room/services/AvailabilityService'
import { CreateRoomUseCase } from '../../../application/room/use-cases/CreateRoomUseCase'
import { UpdateRoomStatusUseCase } from '../../../application/room/use-cases/UpdateRoomStatusUseCase'
import { CalculateStayPriceUseCase } from '../../../application/room/use-cases/CalculateStayPriceUseCase'
import { CheckAvailabilityUseCase } from '../../../application/room/use-cases/CheckAvailabilityUseCase'
import { CreatePricingRuleUseCase } from '../../../application/room/use-cases/CreatePricingRuleUseCase'
import { ListRoomsUseCase } from '../../../application/room/use-cases/ListRoomsUseCase'
import { ListPricingRulesUseCase } from '../../../application/room/use-cases/ListPricingRulesUseCase'
import { UpdateRoomPricingUseCase } from '../../../application/room/use-cases/UpdateRoomPricingUseCase'
import { InMemoryRoomStatusLogRepository } from '../../persistence/room/InMemoryRoomStatusLogRepository'
import { InMemoryRoomMaintenanceRepository } from '../../persistence/room/InMemoryRoomMaintenanceRepository'
import type { IRoomRepository } from '../../../application/room/ports/IRoomRepository'
import type { IPricingRuleRepository } from '../../../application/room/ports/IPricingRuleRepository'
import type { IRevenueSettingsRepository } from '../../../application/room/ports/IRevenueSettingsRepository'
import type { IRoomStatusLogRepository } from '../../../application/room/ports/IRoomStatusLogRepository'
import type { IRoomMaintenanceRepository } from '../../../application/room/ports/IRoomMaintenanceRepository'

export class RoomControllerFactory {
  private static db = getRepoPrisma()
  private static roomRepo: IRoomRepository = new PrismaRoomRepository(RoomControllerFactory.db)
  private static ruleRepo: IPricingRuleRepository = new PrismaPricingRuleRepository(RoomControllerFactory.db)
  private static revenueRepo: IRevenueSettingsRepository = new PrismaRevenueSettingsRepository(RoomControllerFactory.db)
  private static logRepo: IRoomStatusLogRepository = new InMemoryRoomStatusLogRepository()
  private static maintenanceRepo: IRoomMaintenanceRepository = new InMemoryRoomMaintenanceRepository()
  private static pricingCalculator = new PricingCalculatorService()
  private static availabilityService = new AvailabilityService()

  static configure(deps: {
    roomRepo?: IRoomRepository
    ruleRepo?: IPricingRuleRepository
    revenueRepo?: IRevenueSettingsRepository
    logRepo?: IRoomStatusLogRepository
    maintenanceRepo?: IRoomMaintenanceRepository
  }): void {
    if (deps.roomRepo) RoomControllerFactory.roomRepo = deps.roomRepo
    if (deps.ruleRepo) RoomControllerFactory.ruleRepo = deps.ruleRepo
    if (deps.revenueRepo) RoomControllerFactory.revenueRepo = deps.revenueRepo
    if (deps.logRepo) RoomControllerFactory.logRepo = deps.logRepo
    if (deps.maintenanceRepo) RoomControllerFactory.maintenanceRepo = deps.maintenanceRepo
  }

  static reset(): void {
    RoomControllerFactory.configure({
      roomRepo: new PrismaRoomRepository(RoomControllerFactory.db),
      ruleRepo: new PrismaPricingRuleRepository(RoomControllerFactory.db),
      revenueRepo: new PrismaRevenueSettingsRepository(RoomControllerFactory.db),
      logRepo: new InMemoryRoomStatusLogRepository(),
      maintenanceRepo: new InMemoryRoomMaintenanceRepository(),
    })
  }

  static makeCreateRoomUseCase(): CreateRoomUseCase {
    return new CreateRoomUseCase(RoomControllerFactory.roomRepo)
  }

  static makeUpdateRoomStatusUseCase(): UpdateRoomStatusUseCase {
    return new UpdateRoomStatusUseCase(RoomControllerFactory.roomRepo, RoomControllerFactory.logRepo)
  }

  static makeCalculateStayPriceUseCase(): CalculateStayPriceUseCase {
    return new CalculateStayPriceUseCase(
      RoomControllerFactory.roomRepo,
      RoomControllerFactory.ruleRepo,
      RoomControllerFactory.revenueRepo,
      RoomControllerFactory.pricingCalculator
    )
  }

  static makeCheckAvailabilityUseCase(): CheckAvailabilityUseCase {
    return new CheckAvailabilityUseCase(
      RoomControllerFactory.roomRepo,
      RoomControllerFactory.maintenanceRepo,
      RoomControllerFactory.availabilityService
    )
  }

  static makeCreatePricingRuleUseCase(): CreatePricingRuleUseCase {
    return new CreatePricingRuleUseCase(RoomControllerFactory.ruleRepo)
  }

  static makeListRoomsUseCase(): ListRoomsUseCase {
    return new ListRoomsUseCase(RoomControllerFactory.roomRepo)
  }

  static makeListPricingRulesUseCase(): ListPricingRulesUseCase {
    return new ListPricingRulesUseCase(RoomControllerFactory.ruleRepo)
  }

  static makeUpdateRoomPricingUseCase(): UpdateRoomPricingUseCase {
    return new UpdateRoomPricingUseCase(RoomControllerFactory.roomRepo)
  }
}
