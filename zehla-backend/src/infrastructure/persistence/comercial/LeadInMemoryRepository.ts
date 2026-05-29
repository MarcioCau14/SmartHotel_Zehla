import { ILeadPort } from '../../../application/comercial/ports/ILeadPort'
import { Lead } from '../../../domain/comercial/entities/Lead'
import { Result } from '../../../shared/Result'
import { Email } from '../../../domain/comercial/value-objects/Email'
import { Documento } from '../../../domain/comercial/value-objects/Documento'
import { Score } from '../../../domain/comercial/value-objects/Score'
import { Canal } from '../../../domain/comercial/value-objects/Canal'

export class LeadInMemoryRepository implements ILeadPort {
  private leads: Map<string, Lead> = new Map()

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
      // Gerar ID simples para o lead
      const id = `lead_${Date.now()}_${Math.floor(Math.random() * 10000)}`
      
      // Criar objetos de valor se fornecidos
      let emailObj: Email | undefined
      if (dados.email) {
        const emailResult = Email.criar(dados.email)
        if (emailResult.isFail) {
          return Result.fail(emailResult.error)
        }
        emailObj = emailResult.value
      }
      
      let documentoObj: Documento | undefined
      if (dados.documento) {
        const documentoResult = Documento.criar(dados.documento)
        if (documentoResult.isFail) {
          return Result.fail(documentoResult.error)
        }
        documentoObj = documentoResult.value
      }
      
      let scoreObj: Score | undefined
      // Score não é fornecido na criação inicial, será atualizado posteriormente
      
      let canalObj: Canal
      try {
        canalObj = Canal.criar(dados.canal)
        if (canalObj.isFail) {
          return Result.fail(canalObj.error)
        }
      } catch (error) {
        return Result.fail(new Error('Invalid channel'))
      }
      
      const leadProps = {
        id,
        canal: canalObj.value,
        propriedadeId: dados.propriedadeId,
        dataCaptura: new Date(),
        nome: dados.nome,
        email: emailObj,
        telefone: dados.telefone,
        documento: documentoObj,
        score: scoreObj,
        status: 'novo',
        origemUrl: dados.origemUrl,
        tags: dados.tags,
        ultimaInteracao: undefined
      }
      
      const leadResult = Lead.create(leadProps)
      if (leadResult.isFail) {
        return Result.fail(leadResult.error)
      }
      
      const lead = leadResult.value
      this.leads.set(lead.id, lead)
      
      return Result.ok(lead)
    } catch (error) {
      return Result.fail(error instanceof Error ? error : new Error('Unexpected error creating lead'))
    }
  }

  async buscarLeadPorId(id: string, propriedadeId: string): Promise<Result<Lead | null, Error>> {
    try {
      const lead = this.leads.get(id)
      if (!lead) {
        return Result.ok(null)
      }
      
      // Verificar RLS - propriedadeId deve corresponder
      if (lead.propriedadeId !== propriedadeId) {
        return Result.ok(null)
      }
      
      return Result.ok(lead)
    } catch (error) {
      return Result.fail(error instanceof Error ? error : new Error('Unexpected error finding lead by ID'))
    }
  }

  async listarLeadsPorPropriedade(propriedadeId: string, filtros?: {
    status?: string[]
    canal?: string
    dataInicio?: Date
    dataFim?: Date
  }): Promise<Result<Lead[], Error>> {
    try {
      let leads = Array.from(this.leads.values()).filter(lead => lead.propriedadeId === propriedadeId)
      
      // Aplicar filtros
      if (filtros) {
        if (filtros.status && filtros.status.length > 0) {
          leads = leads.filter(lead => filtros.status!.includes(lead.status))
        }
        
        if (filtros.canal) {
          leads = leads.filter(lead => lead.canal.valor === filtros.canal)
        }
        
        if (filtros.dataInicio) {
          leads = leads.filter(lead => lead.dataCaptura >= filtros.dataInicio!)
        }
        
        if (filtros.dataFim) {
          leads = leads.filter(lead => lead.dataCaptura <= filtros.dataFim!)
        }
      }
      
      return Result.ok(leads)
    } catch (error) {
      return Result.fail(error instanceof Error ? error : new Error('Unexpected error listing leads by property'))
    }
  }

  async atualizarLead(id: string, propriedadeId: string, dados: {
    nome?: string
    email?: string
    telefone?: string
    documento?: string
    score?: number
    tags?: string[]
    status?: string
  }): Promise<Result<Lead, Error>> {
    try {
      const lead = this.leads.get(id)
      if (!lead) {
        return Result.fail(new Error('Lead not found'))
      }
      
      // Verificar RLS
      if (lead.propriedadeId !== propriedadeId) {
        return Result.fail(new Error('Lead not found or access denied'))
      }
      
      // Criar objetos de valor se fornecidos
      let emailObj: Email | undefined
      if (dados.email !== undefined && dados.email !== null) {
        if (dados.email === '') {
          emailObj = undefined
        } else {
          const emailResult = Email.criar(dados.email)
          if (emailResult.isFail) {
            return Result.fail(emailResult.error)
          }
          emailObj = emailResult.value
        }
      }
      
      let documentoObj: Documento | undefined
      if (dados.documento !== undefined && dados.documento !== null) {
        if (dados.documento === '') {
          documentoObj = undefined
        } else {
          const documentoResult = Documento.criar(dados.documento)
          if (documentoResult.isFail) {
            return Result.fail(documentoResult.error)
          }
          documentoObj = documentoResult.value
        }
      }
      
      let scoreObj: Score | undefined
      if (dados.score !== undefined && dados.score !== null) {
        const scoreResult = Score.criar(dados.score)
        if (scoreResult.isFail) {
          return Result.fail(scoreResult.error)
        }
        scoreObj = scoreResult.value
      }
      
      const leadAtualizado = new Lead(
        lead.id,
        lead.canal,
        lead.propriedadeId,
        lead.dataCaptura,
        dados.nome !== undefined ? dados.nome : lead.nome,
        emailObj !== undefined ? emailObj : lead.email,
        dados.telefone !== undefined ? dados.telefone : lead.telefone,
        documentoObj !== undefined ? documentoObj : lead.documento,
        scoreObj !== undefined ? scoreObj : lead.score,
        dados.status !== undefined ? (dados.status as any) : lead.status,
        lead.origemUrl,
        lead.tags,
        new Date() // atualiza ultimaInteracao
      )
      
      this.leads.set(id, leadAtualizado)
      
      return Result.ok(leadAtualizado)
    } catch (error) {
      return Result.fail(error instanceof Error ? error : new Error('Unexpected error updating lead'))
    }
  }

  async atualizarScoreLead(id: string, propriedadeId: string, score: number): Promise<Result<Lead, Error>> {
    try {
      const lead = this.leads.get(id)
      if (!lead) {
        return Result.fail(new Error('Lead not found'))
      }
      
      // Verificar RLS
      if (lead.propriedadeId !== propriedadeId) {
        return Result.fail(new Error('Lead not found or access denied'))
      }
      
      // Validar score
      const scoreResult = Score.criar(score)
      if (scoreResult.isFail) {
        return Result.fail(scoreResult.error)
      }
      const scoreObj = scoreResult.value
      
      const leadAtualizado = new Lead(
        lead.id,
        lead.canal,
        lead.propriedadeId,
        lead.dataCaptura,
        lead.nome,
        lead.email,
        lead.telefone,
        lead.documento,
        scoreObj,
        lead.status,
        lead.origemUrl,
        lead.tags,
        new Date() // atualiza ultimaInteracao
      )
      
      this.leads.set(id, leadAtualizado)
      
      return Result.ok(leadAtualizado)
    } catch (error) {
      return Result.fail(error instanceof Error ? error : new Error('Unexpected error updating lead score'))
    }
  }

  async buscarLeadPorEmail(email: string, propriedadeId: string): Promise<Result<Lead | null, Error>> {
    try {
      const emailObj = Email.criar(email)
      if (emailObj.isFail) {
        return Result.ok(null) // Email inválido, não encontrado
      }
      
      for (const lead of this.leads.values()) {
        if (lead.propriedadeId === propriedadeId && 
            lead.email && 
            lead.email.valor === emailObj.value) {
          return Result.ok(lead)
        }
      }
      
      return Result.ok(null)
    } catch (error) {
      return Result.fail(error instanceof Error ? error : new Error('Unexpected error finding lead by email'))
    }
  }

  async buscarLeadPorDocumento(documento: string, propriedadeId: string): Promise<Result<Lead | null, Error>> {
    try {
      const documentoObj = Documento.criar(documento)
      if (documentoObj.isFail) {
        return Result.ok(null) // Documento inválido, não encontrado
      }
      
      for (const lead of this.leads.values()) {
        if (lead.propriedadeId === propriedadeId && 
            lead.documento && 
            lead.documento.valor === documentoObj.value) {
          return Result.ok(lead)
        }
      }
      
      return Result.ok(null)
    } catch (error) {
      return Result.fail(error instanceof Error ? error : new Error('Unexpected error finding lead by document'))
    }
  }
}