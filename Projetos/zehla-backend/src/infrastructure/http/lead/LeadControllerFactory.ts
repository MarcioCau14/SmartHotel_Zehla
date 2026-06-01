import { getRepoPrisma } from '../../../lib/prisma'
import { CaptureLeadUseCase } from '../../../application/lead/use-cases/CaptureLeadUseCase'
import { QualifyLeadUseCase } from '../../../application/lead/use-cases/QualifyLeadUseCase'
import { MoveFunnelUseCase } from '../../../application/lead/use-cases/MoveFunnelUseCase'
import { ConvertLeadUseCase } from '../../../application/lead/use-cases/ConvertLeadUseCase'
import { IdentifyDuplicateUseCase } from '../../../application/lead/use-cases/IdentifyDuplicateUseCase'
import { TrackInteractionUseCase } from '../../../application/lead/use-cases/TrackInteractionUseCase'
import { ProcessWebhookUseCase } from '../../../application/lead/use-cases/ProcessWebhookUseCase'
import { PrismaLeadRepository } from '../../persistence/lead/PrismaLeadRepository'
import { InMemoryLeadEventRepository } from '../../persistence/lead/InMemoryLeadEventRepository'
import { FakeClusterActionService } from '../../persistence/lead/FakeClusterActionService'
import { FakeEventBus } from '../../persistence/lead/FakeEventBus'
import { FakeDuplicateDetectionService } from '../../persistence/lead/FakeDuplicateDetectionService'

export class LeadControllerFactory {
  private static db = getRepoPrisma()
  private static leadRepo = new PrismaLeadRepository(LeadControllerFactory.db)
  private static eventBus = new FakeEventBus()
  private static clusterActions = new FakeClusterActionService()
  private static eventRepo = new InMemoryLeadEventRepository()

  static makeCaptureUseCase(): CaptureLeadUseCase {
    const duplicateService = new FakeDuplicateDetectionService(
      new PrismaLeadRepository(LeadControllerFactory.db)
    )
    return new CaptureLeadUseCase(LeadControllerFactory.leadRepo, duplicateService, LeadControllerFactory.eventBus)
  }

  static makeQualifyUseCase(): QualifyLeadUseCase {
    return new QualifyLeadUseCase(
      LeadControllerFactory.leadRepo,
      LeadControllerFactory.clusterActions,
      LeadControllerFactory.eventBus
    )
  }

  static makeMoveFunnelUseCase(): MoveFunnelUseCase {
    return new MoveFunnelUseCase(LeadControllerFactory.leadRepo, LeadControllerFactory.eventBus)
  }

  static makeConvertUseCase(): ConvertLeadUseCase {
    return new ConvertLeadUseCase(LeadControllerFactory.leadRepo, LeadControllerFactory.eventBus)
  }

  static makeIdentifyDuplicateUseCase(): IdentifyDuplicateUseCase {
    const duplicateService = new FakeDuplicateDetectionService(
      new PrismaLeadRepository(LeadControllerFactory.db) as any
    )
    return new IdentifyDuplicateUseCase(LeadControllerFactory.leadRepo, duplicateService)
  }

  static makeTrackInteractionUseCase(): TrackInteractionUseCase {
    return new TrackInteractionUseCase(
      LeadControllerFactory.leadRepo,
      LeadControllerFactory.eventRepo,
      LeadControllerFactory.eventBus
    )
  }

  static makeProcessWebhookUseCase(): ProcessWebhookUseCase {
    return new ProcessWebhookUseCase(
      LeadControllerFactory.leadRepo,
      LeadControllerFactory.eventRepo,
      LeadControllerFactory.eventBus
    )
  }
}
