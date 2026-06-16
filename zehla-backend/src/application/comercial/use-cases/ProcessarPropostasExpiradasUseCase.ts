import { IPropostaPort } from '../../../application/comercial/ports/IPropostaPort'
import { ILeadPort } from '../../../application/comercial/ports/ILeadPort'
import { Result } from '../../../shared/Result'
import { Proposta } from '../../../domain/comercial/entities/Proposta'
import { Lead } from '../../../domain/comercial/entities/Lead'

export class ProcessarPropostasExpiradasUseCase {
  constructor(
    private readonly propostaPort: IPropostaPort,
    private readonly leadPort: ILeadPort
  ) {}

  async execute(propriedadeId: string): Promise<Result<{ propostasExpiradas: Proposta[]; leadsAfetados: Lead[]; totalProcessadas: number }, Error>> {
    try {
      // Buscar todas as propostas que podem expirar
      const propostasResult = await this.propostaPort.listarPropostasPorStatus(
        propriedadeId, 
        ['enviada', 'vista', 'negociacao'], 
        1000
      )
      
      if (propostasResult.isFail) {
        return Result.fail(propostasResult.error)
      }
      
      const propostas = propostasResult.value
      const propostasExpiradas: Proposta[] = []
      const leadsAfetados: Lead[] = []
      
      const agora = new Date()
      
      for (const proposta of propostas) {
        if (proposta.validade && proposta.validade < agora) {
          const expirarResult = proposta.expirar()
          if (expirarResult.isFail) {
            continue
          }
          
          const propostaExpirada = expirarResult.value
          
          // Persistir no port específico
          const updateResult = await this.propostaPort.expirarProposta(propostaExpirada.id, propostaExpirada.propriedadeId)
          if (updateResult.isFail) {
            continue
          }
          
          propostasExpiradas.push(updateResult.value)
          
          // Buscar o lead associado
          const leadResult = await this.leadPort.buscarLeadPorId(
            propostaExpirada.leadId, 
            propostaExpirada.propriedadeId
          )
          
          if (leadResult.isFail || !leadResult.value) {
            continue
          }
          
          const lead = leadResult.value
          
          // Se o lead não tiver outras propostas ativas, transita status para perdido
          const outrasPropostasAtivas = propostas.filter(p => 
            p.leadId === lead.id && 
            p.id !== propostaExpirada.id && 
            (p.ehEnviada || p.ehVista || p.ehNegociacao)
          )
          
          if (outrasPropostasAtivas.length === 0 && lead.status === 'negotiation') {
            const perderResult = lead.perder('Proposal expired without action')
            if (perderResult.isOk) {
              const leadPerdido = perderResult.value
              
              const leadUpdateResult = await this.leadPort.atualizarLead(
                leadPerdido.id,
                leadPerdido.propriedadeId,
                {
                  nome: leadPerdido.nome,
                  email: leadPerdido.email?.valor,
                  telefone: leadPerdido.telefone,
                  documento: leadPerdido.documento?.valor,
                  score: leadPerdido.score?.value,
                  tags: leadPerdido.tags,
                  status: leadPerdido.status
                }
              )
              
              if (leadUpdateResult.isOk) {
                leadsAfetados.push(leadUpdateResult.value)
              }
            }
          }
        }
      }
      
      return Result.ok({
        propostasExpiradas,
        leadsAfetados,
        totalProcessadas: propostasExpiradas.length
      })
    } catch (error) {
      return Result.fail(error instanceof Error ? error : new Error('Unexpected error processing expired proposals'))
    }
  }
}