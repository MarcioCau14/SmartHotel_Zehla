import { PrismaClient } from '@prisma/client'
import { ILeadPort } from '../../../application/comercial/ports/ILeadPort'
import { Lead } from '../../../domain/comercial/entities/Lead'
import { Result } from '../../../shared/Result'
import { Email } from '../../../domain/comercial/value-objects/Email'
import { Documento } from '../../../domain/comercial/value-objects/Documento'
import { Score } from '../../../domain/comercial/value-objects/Score'
import { Canal } from '../../../domain/comercial/value-objects/Canal'

export class PrismaLeadRepository implements ILeadPort {
  constructor(private readonly prisma: PrismaClient) {}

  private toData(lead: Lead): any {
    return {
      id: lead.id,
      canal: lead.canal.valor,
      propriedadeId: lead.propriedadeId,
      dataCaptura: lead.dataCaptura,
      nome: lead.nome || null,
      email: lead.email?.valor || null,
      telefone: lead.telefone || null,
      documento: lead.documento?.valor || null,
      documentoTipo: lead.documento?.tipo || null,
      score: lead.score?.value || null,
      status: lead.status,
      origemUrl: lead.origemUrl || null,
      tags: lead.tags ? JSON.stringify(lead.tags) : null,
      ultimaInteracao: lead.ultimaInteracao || null
    }
  }

  private hydrate(row: any): Result<Lead, Error> {
    try {
      const canalResult = Canal.criar(row.canal)
      if (canalResult.isFail) return Result.fail(canalResult.error)

      let emailObj: Email | undefined
      if (row.email) {
        const emailResult = Email.criar(row.email)
        if (emailResult.isFail) return Result.fail(emailResult.error)
        emailObj = emailResult.value
      }

      let documentoObj: Documento | undefined
      if (row.documento) {
        const docResult = Documento.criar(row.documento, row.documentoTipo || 'CPF')
        if (docResult.isFail) return Result.fail(docResult.error)
        documentoObj = docResult.value
      }

      let scoreObj: Score | undefined
      if (row.score !== null && row.score !== undefined) {
        const scoreResult = Score.criar(row.score)
        if (scoreResult.isFail) return Result.fail(scoreResult.error)
        scoreObj = scoreResult.value
      }

      let tagsArr: string[] | undefined
      if (row.tags) {
        try {
          tagsArr = JSON.parse(row.tags)
        } catch {
          tagsArr = undefined
        }
      }

      const leadProps = {
        id: row.id,
        canal: canalResult.value,
        propriedadeId: row.propriedadeId,
        dataCaptura: row.dataCaptura,
        nome: row.nome || undefined,
        email: emailObj,
        telefone: row.telefone || undefined,
        documento: documentoObj,
        score: scoreObj,
        status: row.status as any,
        origemUrl: row.origemUrl || undefined,
        tags: tagsArr,
        ultimaInteracao: row.ultimaInteracao || undefined
      }

      return Lead.create(leadProps)
    } catch (error) {
      return Result.fail(error instanceof Error ? error : new Error('Error hydrating ComercialLead'))
    }
  }

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
      const id = `lead_${Date.now()}_${Math.floor(Math.random() * 10000)}`

      const canalResult = Canal.criar(dados.canal)
      if (canalResult.isFail) return Result.fail(canalResult.error)

      let emailObj: Email | undefined
      if (dados.email) {
        const emailResult = Email.criar(dados.email)
        if (emailResult.isFail) return Result.fail(emailResult.error)
        emailObj = emailResult.value
      }

      let documentoObj: Documento | undefined
      if (dados.documento) {
        const documentoResult = Documento.criar(dados.documento)
        if (documentoResult.isFail) return Result.fail(documentoResult.error)
        documentoObj = documentoResult.value
      }

      const leadProps = {
        id,
        canal: canalResult.value,
        propriedadeId: dados.propriedadeId, // RLS
        dataCaptura: new Date(),
        nome: dados.nome,
        email: emailObj,
        telefone: dados.telefone,
        documento: documentoObj,
        score: undefined,
        status: 'novo' as const,
        origemUrl: dados.origemUrl,
        tags: dados.tags,
        ultimaInteracao: undefined
      }

      const leadResult = Lead.create(leadProps)
      if (leadResult.isFail) return Result.fail(leadResult.error)

      const lead = leadResult.value
      const data = this.toData(lead)

      await this.prisma.comercialLead.create({ data })

      return Result.ok(lead)
    } catch (error) {
      return Result.fail(error instanceof Error ? error : new Error('Unexpected error creating lead'))
    }
  }

  async buscarLeadPorId(id: string, propriedadeId: string): Promise<Result<Lead | null, Error>> {
    try {
      // RLS - Filtro silencioso por propriedadeId
      const row = await this.prisma.comercialLead.findFirst({
        where: {
          id,
          propriedadeId
        }
      })

      if (!row) return Result.ok(null)

      const leadResult = this.hydrate(row)
      if (leadResult.isFail) return Result.fail(leadResult.error)

      return Result.ok(leadResult.value)
    } catch (error) {
      return Result.fail(error instanceof Error ? error : new Error('Unexpected error finding lead by ID'))
    }
  }

  async listarLeadsPorPropriedade(
    propriedadeId: string,
    filtros?: {
      status?: string[]
      canal?: string
      dataInicio?: Date
      dataFim?: Date
    }
  ): Promise<Result<Lead[], Error>> {
    try {
      const where: any = {
        propriedadeId // RLS
      }

      if (filtros) {
        if (filtros.status && filtros.status.length > 0) {
          where.status = { in: filtros.status }
        }
        if (filtros.canal) {
          where.canal = filtros.canal
        }
        if (filtros.dataInicio) {
          where.dataCaptura = { gte: filtros.dataInicio }
        }
        if (filtros.dataFim) {
          where.dataCaptura = { ...where.dataCaptura, lte: filtros.dataFim }
        }
      }

      const rows = await this.prisma.comercialLead.findMany({ where })

      const leads: Lead[] = []
      for (const row of rows) {
        const leadResult = this.hydrate(row)
        if (leadResult.isFail) return Result.fail(leadResult.error)
        leads.push(leadResult.value)
      }

      return Result.ok(leads)
    } catch (error) {
      return Result.fail(error instanceof Error ? error : new Error('Unexpected error listing leads'))
    }
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
    try {
      // RLS - Garante que o lead pertence ao tenant antes de atualizar
      const row = await this.prisma.comercialLead.findFirst({
        where: {
          id,
          propriedadeId
        }
      })

      if (!row) {
        return Result.fail(new Error('Lead not found or access denied'))
      }

      const currentLeadResult = this.hydrate(row)
      if (currentLeadResult.isFail) return Result.fail(currentLeadResult.error)
      const lead = currentLeadResult.value

      let emailObj = lead.email
      if (dados.email !== undefined && dados.email !== null) {
        if (dados.email.trim() === '') {
          emailObj = undefined
        } else {
          const emailResult = Email.criar(dados.email)
          if (emailResult.isFail) return Result.fail(emailResult.error)
          emailObj = emailResult.value
        }
      }

      let documentoObj = lead.documento
      if (dados.documento !== undefined && dados.documento !== null) {
        if (dados.documento.trim() === '') {
          documentoObj = undefined
        } else {
          const docResult = Documento.criar(dados.documento)
          if (docResult.isFail) return Result.fail(docResult.error)
          documentoObj = docResult.value
        }
      }

      let scoreObj = lead.score
      if (dados.score !== undefined && dados.score !== null) {
        const scoreResult = Score.criar(dados.score)
        if (scoreResult.isFail) return Result.fail(scoreResult.error)
        scoreObj = scoreResult.value
      }

      const updatedLeadProps = {
        id: lead.id,
        canal: lead.canal,
        propriedadeId: lead.propriedadeId,
        dataCaptura: lead.dataCaptura,
        nome: dados.nome !== undefined ? dados.nome : lead.nome,
        email: emailObj,
        telefone: dados.telefone !== undefined ? dados.telefone : lead.telefone,
        documento: documentoObj,
        score: scoreObj,
        status: dados.status !== undefined ? (dados.status as any) : lead.status,
        origemUrl: lead.origemUrl,
        tags: dados.tags !== undefined ? dados.tags : lead.tags,
        ultimaInteracao: new Date()
      }

      const updatedResult = Lead.create(updatedLeadProps)
      if (updatedResult.isFail) return Result.fail(updatedResult.error)

      const updatedLead = updatedResult.value
      const data = this.toData(updatedLead)

      await this.prisma.comercialLead.update({
        where: { id },
        data
      })

      return Result.ok(updatedLead)
    } catch (error) {
      return Result.fail(error instanceof Error ? error : new Error('Unexpected error updating lead'))
    }
  }

  async atualizarScoreLead(id: string, propriedadeId: string, score: number): Promise<Result<Lead, Error>> {
    return this.atualizarLead(id, propriedadeId, { score })
  }

  async buscarLeadPorEmail(email: string, propriedadeId: string): Promise<Result<Lead | null, Error>> {
    try {
      const emailTrim = email.trim().toLowerCase()
      // RLS - Filtro silencioso por propriedadeId
      const row = await this.prisma.comercialLead.findFirst({
        where: {
          email: emailTrim,
          propriedadeId
        }
      })

      if (!row) return Result.ok(null)

      const leadResult = this.hydrate(row)
      if (leadResult.isFail) return Result.fail(leadResult.error)

      return Result.ok(leadResult.value)
    } catch (error) {
      return Result.fail(error instanceof Error ? error : new Error('Unexpected error finding lead by email'))
    }
  }

  async buscarLeadPorDocumento(documento: string, propriedadeId: string): Promise<Result<Lead | null, Error>> {
    try {
      const cleanDoc = documento.trim().replace(/[^\d]/g, '')
      // RLS - Filtro silencioso por propriedadeId
      const row = await this.prisma.comercialLead.findFirst({
        where: {
          documento: cleanDoc,
          propriedadeId
        }
      })

      if (!row) return Result.ok(null)

      const leadResult = this.hydrate(row)
      if (leadResult.isFail) return Result.fail(leadResult.error)

      return Result.ok(leadResult.value)
    } catch (error) {
      return Result.fail(error instanceof Error ? error : new Error('Unexpected error finding lead by document'))
    }
  }
}
