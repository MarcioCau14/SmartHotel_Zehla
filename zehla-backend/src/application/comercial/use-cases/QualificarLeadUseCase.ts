import { ILeadPort } from '../../../application/comercial/ports/ILeadPort'
import { Result } from '../../../shared/Result'
import { Lead } from '../../../domain/comercial/entities/Lead'
import { ROICalculator } from '../../../domain/comercial/services/ROICalculator'
import { Score } from '../../../domain/comercial/value-objects/Score'

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
      
      let qualifiedLead = lead
      let finalScore = lead.score?.value || 0
      let roomsCount = 0
      let averageDailyRate = 250
      let occupancyRate = 60
      let hourlyRate = 35

      if (lead.tags) {
        for (const tag of lead.tags) {
          const match = tag.match(/rooms(?:Count)?[_:](\d+)/i) || tag.match(/^rooms(?:Count)?(\d+)$/i)
          if (match) {
            roomsCount = parseInt(match[1], 10)
          }
          const adrMatch = tag.match(/adr[_:](\d+)/i) || tag.match(/^adr(\d+)$/i)
          if (adrMatch) {
            averageDailyRate = parseInt(adrMatch[1], 10)
          }
          const occMatch = tag.match(/occupancy(?:Rate)?[_:](\d+)/i) || tag.match(/^occupancy(\d+)$/i)
          if (occMatch) {
            occupancyRate = parseInt(occMatch[1], 10)
          }
          const hrMatch = tag.match(/hourlyRate[_:](\d+)/i) || tag.match(/^hourlyRate(\d+)$/i)
          if (hrMatch) {
            hourlyRate = parseInt(hrMatch[1], 10)
          }
        }
      }

      const roiCalculator = new ROICalculator()
      const roiResult = roiCalculator.calculate({
        totalRooms: roomsCount || 15, // fallback to 15 if not specified
        averageDailyRate,
        occupancyRate,
        monthlyStaffCost: 2000,
        hourlyRate,
        hoursSavedPerRoomPerMonth: 2.5
      })

      if (roiResult.isOk && roiResult.value.yearlyROI > 200) {
        finalScore = Math.min(100, finalScore + 20)
      }

      if (finalScore !== (lead.score?.value || 0)) {
        const scoreResult = Score.criar(finalScore)
        if (scoreResult.isOk) {
          const updatedLeadProps = {
            id: lead.id,
            canal: lead.canal,
            propriedadeId: lead.propriedadeId,
            dataCaptura: lead.dataCaptura,
            nome: lead.nome,
            email: lead.email,
            telefone: lead.telefone,
            documento: lead.documento,
            score: scoreResult.value,
            status: lead.status,
            origemUrl: lead.origemUrl,
            tags: lead.tags,
            ultimaInteracao: lead.ultimaInteracao
          }
          const recreatedResult = Lead.create(updatedLeadProps)
          if (recreatedResult.isOk) {
            qualifiedLead = recreatedResult.value
          }
        }
      }

      // 2. Qualificar delegando a invariante ao domínio rico
      const qualificacaoResult = qualifiedLead.qualificar()
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