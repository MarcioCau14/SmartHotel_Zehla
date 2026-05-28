import { Result } from '../../../../shared/Result'
import { Lead } from '../../../domain/comercial/entities/Lead'
import { Email } from '../../../domain/comercial/value-objects/Email'
import { Documento } from '../../../domain/comercial/value-objects/Documento'

export interface ILeadPort {
  criarLead(dados: {
    canal: string
    propriedadeId: string
    nome?: string
    email?: string
    telefone?: string
    documento?: string
    origemUrl?: string
    tags?: string[]
  }): Promise<Result<Lead, Error>>
  
  buscarLeadPorId(id: string, propriedadeId: string): Promise<Result<Lead | null, Error>>
  
  listarLeadsPorPropriedade(propriedadeId: string, filtros?: {
    status?: string[]
    canal?: string
    dataInicio?: Date
    dataFim?: Date
  }): Promise<Result<Lead[], Error>>
  
  atualizarLead(id: string, propriedadeId: string, dados: {
    nome?: string
    email?: string
    telefone?: string
    documento?: string
    score?: number
    tags?: string[]
    status?: string
  }): Promise<Result<Lead, Error>>
  
  atualizarScoreLead(id: string, propriedadeId: string, score: number): Promise<Result<Lead, Error>>
  
  buscarLeadPorEmail(email: string, propriedadeId: string): Promise<Result<Lead | null, Error>>
  
  buscarLeadPorDocumento(documento: string, propriedadeId: string): Promise<Result<Lead | null, Error>>
}