import { ILeadPort } from '../../../../src/application/comercial/ports/ILeadPort'
import { Lead } from '../../../../src/domain/comercial/entities/Lead'
import { Result } from '../../../../src/shared/Result'
import { Canal } from '../../../../src/domain/comercial/value-objects/Canal'
import { Email } from '../../../../src/domain/comercial/value-objects/Email'
import { Documento } from '../../../../src/domain/comercial/value-objects/Documento'
import { Score } from '../../../../src/domain/comercial/value-objects/Score'

export class FakeLeadRepository implements ILeadPort {
  public leads: Lead[] = []

  async criarLead(dados: {
    canal: string
    propriedadeId: string
    nome?: string
    email?: string
    telefone?: string
    documento?: string
    origemUrl?: string
    tags?: string[]
  }): Promise<Result<Lead, Error>> {
    try {
      const canalResult = Canal.criar(dados.canal)
      if (canalResult.isFail) return Result.fail(canalResult.error)

      const emailResult = dados.email ? Email.criar(dados.email) : undefined
      if (emailResult && emailResult.isFail) return Result.fail(emailResult.error)

      const documentoResult = dados.documento ? Documento.criar(dados.documento) : undefined
      if (documentoResult && documentoResult.isFail) return Result.fail(documentoResult.error)

      const id = `lead_${Math.random().toString(36).substr(2, 9)}`
      const scoreResult = Score.criar(10) // score inicial padrão
      if (scoreResult.isFail) return Result.fail(scoreResult.error)

      const leadResult = Lead.create({
        id,
        canal: canalResult.value,
        propriedadeId: dados.propriedadeId,
        dataCaptura: new Date(),
        nome: dados.nome,
        email: emailResult ? emailResult.value : undefined,
        telefone: dados.telefone,
        documento: documentoResult ? documentoResult.value : undefined,
        score: scoreResult.value,
        status: 'prospect',
        origemUrl: dados.origemUrl,
        tags: dados.tags,
        ultimaInteracao: new Date()
      })

      if (leadResult.isFail) return Result.fail(leadResult.error)

      this.leads.push(leadResult.value)
      return Result.ok(leadResult.value)
    } catch (error) {
      return Result.fail(error instanceof Error ? error : new Error('Error creating lead in fake repo'))
    }
  }

  async buscarLeadPorId(id: string, propriedadeId: string): Promise<Result<Lead | null, Error>> {
    const lead = this.leads.find(l => l.id === id && l.propriedadeId === propriedadeId)
    return Result.ok(lead || null)
  }

  async listarLeadsPorPropriedade(
    propriedadeId: string,
    filtros?: { status?: string[]; canal?: string; dataInicio?: Date; dataFim?: Date }
  ): Promise<Result<Lead[], Error>> {
    let result = this.leads.filter(l => l.propriedadeId === propriedadeId)

    if (filtros) {
      if (filtros.status && filtros.status.length > 0) {
        result = result.filter(l => filtros.status!.includes(l.status))
      }
      if (filtros.canal) {
        result = result.filter(l => l.canal.valor === filtros.canal)
      }
      if (filtros.dataInicio) {
        result = result.filter(l => l.dataCaptura >= filtros.dataInicio!)
      }
      if (filtros.dataFim) {
        result = result.filter(l => l.dataCaptura <= filtros.dataFim!)
      }
    }

    return Result.ok(result)
  }

  async atualizarLead(
    id: string,
    propriedadeId: string,
    dados: {
      nome?: string
      email?: string
      telefone?: string
      documento?: string
      score?: number
      tags?: string[]
      status?: string
    }
  ): Promise<Result<Lead, Error>> {
    const index = this.leads.findIndex(l => l.id === id && l.propriedadeId === propriedadeId)
    if (index === -1) {
      return Result.fail(new Error('Lead not found'))
    }

    const currentLead = this.leads[index]

    try {
      const emailResult = dados.email ? Email.criar(dados.email) : undefined
      if (emailResult && emailResult.isFail) return Result.fail(emailResult.error)

      const documentoResult = dados.documento ? Documento.criar(dados.documento) : undefined
      if (documentoResult && documentoResult.isFail) return Result.fail(documentoResult.error)

      const scoreResult = dados.score !== undefined ? Score.criar(dados.score) : undefined
      if (scoreResult && scoreResult.isFail) return Result.fail(scoreResult.error)

      // Criar nova instância do Lead mantendo o status atual
      const leadResult = Lead.create({
        id: currentLead.id,
        canal: currentLead.canal,
        propriedadeId: currentLead.propriedadeId,
        dataCaptura: currentLead.dataCaptura,
        nome: dados.nome !== undefined ? dados.nome : currentLead.nome,
        email: emailResult ? emailResult.value : currentLead.email,
        telefone: dados.telefone !== undefined ? dados.telefone : currentLead.telefone,
        documento: documentoResult ? documentoResult.value : currentLead.documento,
        score: scoreResult ? scoreResult.value : currentLead.score,
        status: dados.status !== undefined ? (dados.status as any) : currentLead.status,
        origemUrl: currentLead.origemUrl,
        tags: dados.tags !== undefined ? dados.tags : currentLead.tags,
        ultimaInteracao: new Date()
      })

      if (leadResult.isFail) return Result.fail(leadResult.error)

      this.leads[index] = leadResult.value
      return Result.ok(leadResult.value)
    } catch (error) {
      return Result.fail(error instanceof Error ? error : new Error('Error updating lead in fake repo'))
    }
  }

  async atualizarScoreLead(id: string, propriedadeId: string, score: number): Promise<Result<Lead, Error>> {
    return this.atualizarLead(id, propriedadeId, { score })
  }

  async buscarLeadPorEmail(email: string, propriedadeId: string): Promise<Result<Lead | null, Error>> {
    const lead = this.leads.find(l => l.email?.valor === email && l.propriedadeId === propriedadeId)
    return Result.ok(lead || null)
  }

  async buscarLeadPorDocumento(documento: string, propriedadeId: string): Promise<Result<Lead | null, Error>> {
    const lead = this.leads.find(l => l.documento?.valor === documento && l.propriedadeId === propriedadeId)
    return Result.ok(lead || null)
  }

  // Método auxiliar para testes para adicionar leads diretamente
  public addLeadDirectly(lead: Lead): void {
    const index = this.leads.findIndex(l => l.id === lead.id)
    if (index !== -1) {
      this.leads[index] = lead
    } else {
      this.leads.push(lead)
    }
  }
}
