import { Result } from '../../../shared/Result'
import { IPropostaReadOnlyPort } from '../../../application/revenue/ports/IPropostaReadOnlyPort'

export class PropostaReadOnlyInMemoryRepository implements IPropostaReadOnlyPort {
  private propostasPorLead: Map<string, Date> = new Map()

  adicionarProposta(leadId: string, data: Date): void {
    this.propostasPorLead.set(leadId, data)
  }

  async contarPropostasPorLeadComMaisDe(propriedadeId: string, dias: number): Promise<Result<number, Error>> {
    const limite = new Date(Date.now() - dias * 86400000)
    let count = 0
    for (const [, data] of this.propostasPorLead) {
      if (data < limite) count++
    }
    return Result.ok(count)
  }
}
