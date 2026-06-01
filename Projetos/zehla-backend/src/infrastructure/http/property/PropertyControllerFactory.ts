import { PrismaClient } from '@prisma/client'
import { getBasePrisma } from '../../../lib/prisma'
import { PrismaPropertyRepository } from '../../persistence/property/PrismaPropertyRepository'
import { InMemoryPropertyRepository } from '../../persistence/property/InMemoryPropertyRepository'
import { TrialService } from '../../../domain/property/services/TrialService'
import { PlanFeatureService } from '../../../domain/property/services/PlanFeatureService'
import { VoiceTokenService } from '../../../domain/property/services/VoiceTokenService'
import { CadasturService } from '../../../domain/property/services/CadasturService'
import { RegistrationNumberGenerator } from '../../../domain/property/services/RegistrationNumberGenerator'
import { CriarPropertyUseCase } from '../../../application/property/use-cases/CriarPropertyUseCase'
import { AtivarPropertyUseCase } from '../../../application/property/use-cases/AtivarPropertyUseCase'
import { AlterarPlanoUseCase } from '../../../application/property/use-cases/AlterarPlanoUseCase'
import { SuspenderReativarUseCase } from '../../../application/property/use-cases/SuspenderReativarUseCase'
import { ConsumirTokenVozUseCase } from '../../../application/property/use-cases/ConsumirTokenVozUseCase'
import { AtualizarConfiguracaoUseCase } from '../../../application/property/use-cases/AtualizarConfiguracaoUseCase'
import { VerificarTrialUseCase } from '../../../application/property/use-cases/VerificarTrialUseCase'
import { VerificarCadasturUseCase } from '../../../application/property/use-cases/VerificarCadasturUseCase'

export class PropertyControllerFactory {
  private static db: PrismaClient = getBasePrisma()
  private static propertyRepo = new PrismaPropertyRepository(PropertyControllerFactory.db)
  private static planFeatureService = new PlanFeatureService()
  private static registrationNumberGenerator = new RegistrationNumberGenerator()

  static makeCriarPropertyUseCase(): CriarPropertyUseCase {
    return new CriarPropertyUseCase(
      PropertyControllerFactory.propertyRepo,
      PropertyControllerFactory.registrationNumberGenerator
    )
  }

  static makeAtivarPropertyUseCase(): AtivarPropertyUseCase {
    return new AtivarPropertyUseCase(PropertyControllerFactory.propertyRepo)
  }

  static makeAlterarPlanoUseCase(): AlterarPlanoUseCase {
    return new AlterarPlanoUseCase(
      PropertyControllerFactory.propertyRepo,
      PropertyControllerFactory.planFeatureService
    )
  }

  static makeSuspenderReativarUseCase(): SuspenderReativarUseCase {
    return new SuspenderReativarUseCase(PropertyControllerFactory.propertyRepo)
  }

  static makeConsumirTokenVozUseCase(): ConsumirTokenVozUseCase {
    return new ConsumirTokenVozUseCase(PropertyControllerFactory.propertyRepo)
  }

  static makeAtualizarConfiguracaoUseCase(): AtualizarConfiguracaoUseCase {
    return new AtualizarConfiguracaoUseCase(PropertyControllerFactory.propertyRepo)
  }

  static makeVerificarTrialUseCase(): VerificarTrialUseCase {
    return new VerificarTrialUseCase(PropertyControllerFactory.propertyRepo)
  }

  static makeVerificarCadasturUseCase(): VerificarCadasturUseCase {
    return new VerificarCadasturUseCase(
      PropertyControllerFactory.propertyRepo,
      new CadasturService()
    )
  }

  static getRepository(): PrismaPropertyRepository {
    return PropertyControllerFactory.propertyRepo
  }
}
