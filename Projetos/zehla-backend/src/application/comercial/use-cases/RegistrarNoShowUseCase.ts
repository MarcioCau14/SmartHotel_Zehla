import { Result } from '../../../shared/Result'
import { IComercialLeadPort } from '../ports/IComercialLeadPort'
import { ComercialLead } from '../../../domain/comercial/entities/ComercialLead'

export class RegistrarNoShowUseCase {
  constructor(private readonly leadPort: IComercialLeadPort) {}

  async execute(leadId: string): Promise<Result<ComercialLead, Error>> {
    const busca = await this.leadPort.buscarPorId(leadId)
    if (busca.isFail) {
      return Result.fail(busca.error)
    }
    const lead = busca.value
    if (!lead) {
      return Result.fail(new Error('LEAD_NAO_ENCONTRADO'))
    }

    const noShow = lead.marcarNoShow()
    if (noShow.isFail) {
      return Result.fail(noShow.error)
    }

    return this.leadPort.salvar(noShow.value)
  }
}
