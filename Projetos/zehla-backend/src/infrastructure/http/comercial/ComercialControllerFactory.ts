import { IComercialLeadPort } from '../../../application/comercial/ports/IComercialLeadPort'
import { DomainEventPublisher } from '../../../domain/shared/events/DomainEventPublisher'
import { QualificarLeadUseCase } from '../../../application/comercial/use-cases/QualificarLeadUseCase'
import { RealizarHandoffUseCase } from '../../../application/comercial/use-cases/RealizarHandoffUseCase'
import { CalcularEscadaDeValorUseCase } from '../../../application/comercial/use-cases/CalcularEscadaDeValorUseCase'
import { RegistrarPagamentoSinalUseCase } from '../../../application/comercial/use-cases/RegistrarPagamentoSinalUseCase'
import { InMemoryComercialLeadAdapter } from '../../persistence/comercial/InMemoryComercialLeadAdapter'

export class ComercialControllerFactory {
  private static leadRepo: IComercialLeadPort = new InMemoryComercialLeadAdapter()
  private static publisher = new DomainEventPublisher()

  static configure(deps: {
    leadRepo?: IComercialLeadPort
    publisher?: DomainEventPublisher
  }): void {
    if (deps.leadRepo) ComercialControllerFactory.leadRepo = deps.leadRepo
    if (deps.publisher) ComercialControllerFactory.publisher = deps.publisher
  }

  static reset(): void {
    ComercialControllerFactory.leadRepo = new InMemoryComercialLeadAdapter()
    ComercialControllerFactory.publisher = new DomainEventPublisher()
  }

  static makeQualificarLeadUseCase(): QualificarLeadUseCase {
    return new QualificarLeadUseCase(
      ComercialControllerFactory.leadRepo,
      ComercialControllerFactory.publisher,
    )
  }

  static makeRealizarHandoffUseCase(): RealizarHandoffUseCase {
    return new RealizarHandoffUseCase(
      ComercialControllerFactory.leadRepo,
      ComercialControllerFactory.publisher,
    )
  }

  static makeCalcularEscadaDeValorUseCase(): CalcularEscadaDeValorUseCase {
    return new CalcularEscadaDeValorUseCase(
      ComercialControllerFactory.leadRepo,
    )
  }

  static makeRegistrarPagamentoSinalUseCase(): RegistrarPagamentoSinalUseCase {
    return new RegistrarPagamentoSinalUseCase(
      ComercialControllerFactory.leadRepo,
      ComercialControllerFactory.publisher,
    )
  }

  static getLeadRepo(): IComercialLeadPort {
    return ComercialControllerFactory.leadRepo
  }
}
