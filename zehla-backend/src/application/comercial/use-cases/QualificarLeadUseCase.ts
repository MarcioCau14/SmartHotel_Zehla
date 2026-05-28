import { ILeadPort } from '../../../application/comercial/ports/ILeadPort'
import { Result } from '../../../shared/Result'
import { Lead } from '../../../domain/comercial/entities/Lead'

export class QualificarLeadUseCase {
  constructor(private readonly leadPort: ILeadPort) {}

  async execute(leadId: string, propriedadeId: string): Promise<Result<Lead, Error>> {
    try {
      // 1. Buscar o lead
      const leadResult = await this.leadPort.buscarLeadPorId(leadId, propriedadeId)
      if (leadResult.isFail) {
        return Result.fail(leadResult.error)
      }
      
      const lead = leadResult.value
      if (!lead) {
        return Result.fail(new Error('Lead not found'))
      }
      
      // 2. Qualificar delegando a invariante ao domínio rico
      const qualificacaoResult = lead.qualificar()
      if (qualificacaoResult.isFail) {
        return Result.fail(qualificacaoResult.error)
      }
      
      // 3. Persistir a alteração utilizando a interface de porta
      const leadAtualizado = qualificacaoResult.value
      const updateResult = await this.leadPort.atualizarLead(
        leadAtualizado.id,
        leadAtualizado.propriedadeId,
        {
          nome: leadAtualizado.nome,
          email: leadAtualizado.email?.valor,
          telefone: leadAtualizado.telefone,
          documento: leadAtualizado.documento?.valor,
          score: leadAtualizado.score?.value,
          tags: leadAtualizado.tags,
          status: leadAtualizado.status
        }
      )
      
      if (updateResult.isFail) {
        return Result.fail(updateResult.error)
      }
      
      return Result.ok(updateResult.value)
    } catch (error) {
      return Result.fail(error instanceof Error ? error : new Error('Unexpected error qualifying lead'))
    }
  }
}