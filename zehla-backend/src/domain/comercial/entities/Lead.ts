import { Result } from '../../../shared/Result'
import { Email } from '../value-objects/Email'
import { Documento } from '../value-objects/Documento'
import { Score } from '../value-objects/Score'
import { Canal } from '../value-objects/Canal'

export type LeadStatus = 
  | 'novo'
  | 'qualificado'
  | 'propostado'
  | 'convertido'
  | 'perdido'
  | 'inativo'

export interface LeadProps {
  id: string
  canal: Canal
  propriedadeId: string
  dataCaptura: Date
  nome?: string
  email?: Email
  telefone?: string
  documento?: string | Documento
  score?: Score
  status?: LeadStatus
  origemUrl?: string
  tags?: string[]
  ultimaInteracao?: Date
}

export class Lead {
  private constructor(
    public readonly id: string,
    public readonly canal: Canal,
    public readonly propriedadeId: string,
    public readonly dataCaptura: Date,
    public readonly nome: string | undefined,
    public readonly email: Email | undefined,
    public readonly telefone: string | undefined,
    public readonly documento: Documento | undefined,
    public readonly score: Score | undefined,
    public readonly status: LeadStatus,
    public readonly origemUrl: string | undefined,
    public readonly tags: string[] | undefined,
    public readonly ultimaInteracao: Date | undefined
  ) {
    Object.freeze(this)
  }

  static create(props: LeadProps): Result<Lead, Error> {
    // Validações obrigatórias
    if (!props.id || props.id.trim().length === 0) {
      return Result.fail(new Error('Lead ID is required'))
    }
    
    if (!props.canal) {
      return Result.fail(new Error('Canal is required'))
    }
    
    if (!props.propriedadeId || props.propriedadeId.trim().length === 0) {
      return Result.fail(new Error('Property ID is required for RLS'))
    }
    
    if (!props.dataCaptura) {
      return Result.fail(new Error('Capture date is required'))
    }
    
    // Nome é obrigatório para qualquer status exceto 'novo'
    if (props.status && props.status !== 'novo' && (!props.nome || props.nome.trim().length < 2)) {
      return Result.fail(new Error('Name must be at least 2 characters for status != novo'))
    }
    
    // Email é obrigatório se fornecido (para validação)
    if (props.email instanceof Email) {
      // já validado pelo construtor do Email
    } else if (props.email !== undefined && props.email !== null) {
      return Result.fail(new Error('Invalid email format'))
    }
    
    // Documento: opcional até a conversão
    if (props.documento instanceof Documento) {
      // já validado pelo construtor do Documento
    } else if (props.documento !== undefined && props.documento !== null) {
      return Result.fail(new Error('Invalid document format'))
    }
    
    // Documento obrigatório para leads convertidos (LGPD)
    if (props.status === 'convertido' && !props.documento) {
      return Result.fail(new Error('Documento is required for converted lead (LGPD)'))
    }
    
    // Score: se fornecido, deve estar entre 0-100
    if (props.score instanceof Score) {
      // já validado pelo construtor do Score
    } else if (props.score !== undefined && props.score !== null) {
      return Result.fail(new Error('Score must be between 0 and 100'))
    }
    
    // Status: deve ser um dos valores válidos
    const validStatuses: LeadStatus[] = ['novo', 'qualificado', 'propostado', 'convertido', 'perdido', 'inativo']
    if (props.status && !validStatuses.includes(props.status)) {
      return Result.fail(new Error(`Invalid status: ${props.status}`))
    }
    
    // Tags: se fornecido, deve ser array de strings
    if (props.tags && (!Array.isArray(props.tags) || !props.tags.every(t => typeof t === 'string'))) {
      return Result.fail(new Error('Tags must be an array of strings'))
    }
    
    // Ultima interacao: se fornecido, deve ser data válida
    if (props.ultimaInteracao && !(props.ultimaInteracao instanceof Date)) {
      return Result.fail(new Error('Last interaction must be a valid date'))
    }
    
    const lead = new Lead(
      props.id.trim(),
      props.canal,
      props.propriedadeId,
      props.dataCaptura,
      props.nome?.trim() || undefined,
      props.email,
      props.telefone?.trim() || undefined,
      props.documento,
      props.score,
      props.status || 'novo',
      props.origemUrl?.trim() || undefined,
      props.tags?.filter(t => t.trim().length > 0) || undefined,
      props.ultimaInteracao
    )
    
    return Result.ok(lead)
  }

  // Getters
  get nomeCompleto(): string | undefined {
    return this.nome
  }

  get ehQualificado(): boolean {
    return this.score ? this.score.isQualificado() : false
  }

  get ehConvertido(): boolean {
    return this.status === 'convertido'
  }

  get ehPerdido(): boolean {
    return this.status === 'perdido'
  }

  get ehAtivo(): boolean {
    return this.status === 'novo' || this.status === 'qualificado' || this.status === 'propostado'
  }

  // Métodos de transição de estado
  qualificar(): Result<Lead, Error> {
    if (!this.score) {
      return Result.fail(new Error('Lead must have a score to be qualified'))
    }
    if (!this.score.isQualificado()) {
      return Result.fail(new Error('Lead score is insufficient for qualification'))
    }
    
    return Result.ok(new Lead(
      this.id,
      this.canal,
      this.propriedadeId,
      this.dataCaptura,
      this.nome,
      this.email,
      this.telefone,
      this.documento,
      this.score,
      'qualificado',
      this.origemUrl,
      this.tags,
      new Date() // atualiza ultimaInteracao
    ))
  }

  propostar(): Result<Lead, Error> {
    if (this.status !== 'qualificado') {
      return Result.fail(new Error('Only qualified leads can be proposed'))
    }
    
    return Result.ok(new Lead(
      this.id,
      this.canal,
      this.propriedadeId,
      this.dataCaptura,
      this.nome,
      this.email,
      this.telefone,
      this.documento,
      this.score,
      'propostado',
      this.origemUrl,
      this.tags,
      new Date()
    ))
  }

  converter(): Result<Lead, Error> {
    if (this.status !== 'propostado') {
      return Result.fail(new Error('Only proposed leads can be converted'))
    }
    if (!this.documento) {
      return Result.fail(new Error('Document is required for conversion (LGPD)'))
    }
    
    return Result.ok(new Lead(
      this.id,
      this.canal,
      this.propriedadeId,
      this.dataCaptura,
      this.nome,
      this.email,
      this.telefone,
      this.documento,
      this.score,
      'convertido',
      this.origemUrl,
      this.tags,
      new Date()
    ))
  }

  perder(motivo?: string): Result<Lead, Error> {
    if (this.status === 'convertido') {
      return Result.fail(new Error('Converted leads cannot be marked as lost'))
    }
    
    return Result.ok(new Lead(
      this.id,
      this.canal,
      this.propriedadeId,
      this.dataCaptura,
      this.nome,
      this.email,
      this.telefone,
      this.documento,
      this.score,
      'perdido',
      this.origemUrl,
      this.tags,
      new Date()
    ))
  }

  reativar(): Result<Lead, Error> {
    if (this.status !== 'perdido') {
      return Result.fail(new Error('Only lost leads can be reactivated'))
    }
    
    return Result.ok(new Lead(
      this.id,
      this.canal,
      this.propriedadeId,
      this.dataCaptura,
      this.nome,
      this.email,
      this.telefone,
      this.documento,
      this.score,
      'novo',
      this.origemUrl,
      this.tags,
      new Date()
    ))
  }

  atualizarInteracao(): Lead {
    return new Lead(
      this.id,
      this.canal,
      this.propriedadeId,
      this.dataCaptura,
      this.nome,
      this.email,
      this.telefone,
      this.documento,
      this.score,
      this.status,
      this.origemUrl,
      this.tags,
      new Date()
    )
  }

  // Eventos de domínio
  get eventos(): Array<{ type: string; payload: any }> {
    // Implementação simplificada - em um sistema real, isso seria mais sofisticado
    const eventos: Array<{ type: string; payload: any }> = []
    
    // Este método seria chamado pelo use case após mutações
    // Por simplicidade, retornamos vazio - os use cases são responsáveis por emitir eventos
    return eventos
  }
}