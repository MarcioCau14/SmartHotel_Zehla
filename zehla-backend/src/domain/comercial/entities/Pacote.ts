import { Result } from '../../../shared/Result'
import { RegraPrecificacao } from '../value-objects/RegraPrecificacao'
import { Money } from '../value-objects/Money'

export type PacoteStatus = 
  | 'ativo'
  | 'pausado'
  | 'arquivado'

export interface PacoteProps {
  id: string
  propriedadeId: string
  nome: string
  descricao?: string
  tipoQuarto?: string
  capacidadeMaxima?: number
  servicosInclusos?: string[] // IDs de serviços do Hospitalidade Context
  regraPrecificacao?: RegraPrecificacao
  validadeInicio?: Date
  validadeFim?: Date
  status?: PacoteStatus
  versao?: number
  categorias?: string[]
  midias?: string[]
}

export class Pacote {
  private constructor(
    public readonly id: string,
    public readonly propriedadeId: string,
    public readonly nome: string,
    public readonly descricao: string | undefined,
    public readonly tipoQuarto: string | undefined,
    public readonly capacidadeMaxima: number | undefined,
    public readonly servicosInclusos: string[] | undefined,
    public readonly regraPrecificacao: RegraPrecificacao | undefined,
    public readonly validadeInicio: Date | undefined,
    public readonly validadeFim: Date | undefined,
    public readonly status: PacoteStatus,
    public readonly versao: number,
    public readonly categorias: string[] | undefined,
    public readonly midias: string[] | undefined
  ) {
    Object.freeze(this)
  }

  static create(props: PacoteProps): Result<Pacote, Error> {
    // Validações obrigatórias
    if (!props.id || props.id.trim().length === 0) {
      return Result.fail(new Error('Package ID is required'))
    }
    
    if (!props.propriedadeId || props.propriedadeId.trim().length === 0) {
      return Result.fail(new Error('Property ID is required for RLS'))
    }
    
    if (!props.nome || props.nome.trim().length === 0) {
      return Result.fail(new Error('Package name is required'))
    }
    
    if (props.nome.trim().length > 120) {
      return Result.fail(new Error('Package name cannot exceed 120 characters'))
    }
    
    if (props.descricao && props.descricao.length > 500) {
      return Result.fail(new Error('Package description cannot exceed 500 characters'))
    }
    
    if (props.capacidadeMaxima !== undefined && props.capacidadeMaxima <= 0) {
      return Result.fail(new Error('Maximum capacity must be positive'))
    }
    
    if (props.validadeInicio && props.validadeFim) {
      if (props.validadeFim <= props.validadeInicio) {
        return Result.fail(new Error('End date must be after start date'))
      }
    }
    
    if (props.versao === undefined) {
      props.versao = 1
    }
    
    if (props.regraPrecificacao === undefined) {
      return Result.fail(new Error('Pricing rule is required'));
    }
    
    if (!(props.regraPrecificacao instanceof RegraPrecificacao)) {
      return Result.fail(new Error('Invalid pricing rule'));
    }
    
    // Validações de categorias
    if (props.categorias && (!Array.isArray(props.categorias) || !props.categorias.every(c => typeof c === 'string'))) {
      return Result.fail(new Error('Categories must be an array of strings'));
    }
    
    if (props.midias && (!Array.isArray(props.midias) || !props.midias.every(m => typeof m === 'string'))) {
      return Result.fail(new Error('Media URLs must be an array of strings'));
    }
    
    const pacote = new Pacote(
      props.id.trim(),
      props.propriedadeId.trim(),
      props.nome.trim(),
      props.descricao?.trim() || undefined,
      props.tipoQuarto?.trim() || undefined,
      props.capacidadeMaxima,
      props.servicosInclusos,
      props.regraPrecificacao,
      props.validadeInicio,
      props.validadeFim,
      props.status || 'ativo',
      props.versao,
      props.categorias?.filter(c => c.trim().length > 0) || undefined,
      props.midias?.filter(m => m.trim().length > 0) || undefined
    );
    
    return Result.ok(pacote);
  }

  // Getters
  get ehAtivo(): boolean {
    return this.status === 'ativo';
  }
  
  get ehPausado(): boolean {
    return this.status === 'pausado';
  }
  
  get ehArquivado(): boolean {
    return this.status === 'arquivado';
  }

  // Métodos de transição de estado
  ativar(): Result<Pacote, Error> {
    if (this.status === 'arquivado') {
      return Result.fail(new Error('Archived packages cannot be reactivated directly'));
    }
    
    return Result.ok(new Pacote(
      this.id,
      this.propriedadeId,
      this.nome,
      this.descricao,
      this.tipoQuarto,
      this.capacidadeMaxima,
      this.servicosInclusos,
      this.regraPrecificacao,
      this.validadeInicio,
      this.validadeFim,
      'ativo',
      this.versao,
      this.categorias,
      this.midias
    ));
  }

  pausar(): Result<Pacote, Error> {
    if (this.status === 'arquivado') {
      return Result.fail(new Error('Archived packages cannot be paused'));
    }
    
    return Result.ok(new Pacote(
      this.id,
      this.propriedadeId,
      this.nome,
      this.descricao,
      this.tipoQuarto,
      this.capacidadeMaxima,
      this.servicosInclusos,
      this.regraPrecificacao,
      this.validadeInicio,
      this.validadeFim,
      'pausado',
      this.versao,
      this.categorias,
      this.midias
    ));
  }

  arquivar(): Result<Pacote, Error> {
    if (this.status === 'arquivado') {
      return Result.ok(this); // já está arquivado
    }
    
    return Result.ok(new Pacote(
      this.id,
      this.propriedadeId,
      this.nome,
      this.descricao,
      this.tipoQuarto,
      this.capacidadeMaxima,
      this.servicosInclusos,
      this.regraPrecificacao,
      this.validadeInicio,
      this.validadeFim,
      'arquivado',
      this.versao,
      this.categorias,
      this.midias
    ));
  }

  // Métodos de negócio
  estaVigente(data: Date = new Date()): boolean {
    if (!this.validadeInicio || !this.validadeFim) {
      return false;
    }
    return data >= this.validadeInicio && data <= this.validadeFim;
  }

  calcularValorTotal(quantidadeHospedes: number, quantidadeDiarias: number): Result<Money, Error> {
    if (!this.regraPrecificacao) {
      return Result.fail(new Error('Pricing rule is required'));
    }
    
    return this.regraPrecificacao.calcularValorTotal(this, quantidadeHospedes, quantidadeDiarias);
  }

  getServicosInclusos(): string[] {
    return this.servicosInclusos || [];
  }

  // Eventos de domínio (simplificado)
  get eventos(): Array<{ type: string; payload: any }> {
    return [];
  }
}