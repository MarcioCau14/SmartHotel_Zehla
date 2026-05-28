import { Result } from '../../../shared/Result'
import { Money } from '../value-objects/Money'
import { DateRange } from '../../hospitalidade/value-objects/DateRange'
import { Lead } from './Lead'

export type PropostaStatus = 
  | 'rascunho'
  | 'enviada'
  | 'vista'
  | 'negociacao'
  | 'aceita'
  | 'recusada'
  | 'expirada'
  | 'convertida'

export interface PropostaProps {
  id: string
  leadId: string
  propriedadeId: string
  pacoteId: string
  dataCriacao: Date
  dataCheckIn?: Date
  dataCheckOut?: Date
  quantidadeHospedes?: number
  valorTotal?: Money
  valorSinal?: Money
  descontoAplicado?: Money
  status?: PropostaStatus
  validade?: Date
  observacoes?: string
  historicoVersoes?: Array<any>
}

export class Proposta {
  private constructor(
    public readonly id: string,
    public readonly leadId: string,
    public readonly propriedadeId: string,
    public readonly pacoteId: string,
    public readonly dataCriacao: Date,
    public readonly dataCheckIn: Date | undefined,
    public readonly dataCheckOut: Date | undefined,
    public readonly quantidadeHospedes: number | undefined,
    public readonly valorTotal: Money | undefined,
    public readonly valorSinal: Money | undefined,
    public readonly descontoAplicado: Money | undefined,
    public readonly status: PropostaStatus,
    public readonly validade: Date | undefined,
    public readonly observacoes: string | undefined,
    public readonly historicoVersoes: Array<any> | undefined
  ) {
    Object.freeze(this)
  }

  static create(props: PropostaProps): Result<Proposta, Error> {
    // Validações obrigatórias
    if (!props.id || props.id.trim().length === 0) {
      return Result.fail(new Error('Proposal ID is required'))
    }
    
    if (!props.leadId || props.leadId.trim().length === 0) {
      return Result.fail(new Error('Lead ID is required'))
    }
    
    if (!props.propriedadeId || props.propriedadeId.trim().length === 0) {
      return Result.fail(new Error('Property ID is required for RLS'))
    }
    
    if (!props.pacoteId || props.pacoteId.trim().length === 0) {
      return Result.fail(new Error('Package ID is required'))
    }
    
    if (!props.dataCriacao) {
      return Result.fail(new Error('Creation date is required'))
    }
    
    // Validações de datas
    if (props.dataCheckIn && props.dataCheckOut) {
      if (props.dataCheckOut <= props.dataCheckIn) {
        return Result.fail(new Error('Check-out date must be after check-in date'))
      }
      const diffTime = Math.abs(props.dataCheckOut.getTime() - props.dataCheckIn.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
      if (diffDays < 1) {
        return Result.fail(new Error('Stay must be at least 1 night'))
      }
    }
    
    if (props.dataCheckIn && props.dataCheckIn < new Date()) {
      return Result.fail(new Error('Check-in date must be in the future'))
    }
    
    if (props.validade && props.validade < new Date() && props.status === 'rascunho') {
      return Result.fail(new Error('Validity date cannot be in the past'))
    }
    
    // Quantidade de hospedes
    if (props.quantidadeHospedes !== undefined && props.quantidadeHospedes <= 0) {
      return Result.fail(new Error('Number of guests must be positive'))
    }
    
    // Valores
    if (props.valorTotal !== undefined && !(props.valorTotal instanceof Money)) {
      return Result.fail(new Error('Total value must be a Money object'))
    }
    
    if (props.valorSinal !== undefined && !(props.valorSinal instanceof Money)) {
      return Result.fail(new Error('Deposit value must be a Money object'))
    }
    
    if (props.descontoAplicado !== undefined && !(props.descontoAplicado instanceof Money)) {
      return Result.fail(new Error('Discount applied must be a Money object'))
    }
    
    // Validações de valores monetários
    if (props.valorTotal instanceof Money && props.valorTotal.isZero()) {
      return Result.fail(new Error('Total value must be greater than zero'))
    }
    
    if (props.valorSinal instanceof Money && props.valorTotal instanceof Money) {
      if (props.valorSinal.centavos > props.valorTotal.centavos) {
        return Result.fail(new Error('Deposit cannot exceed total value'))
      }
      // Regra de negócio: sinal não pode exceder 50% do total
      const metadeTotal = Math.floor(props.valorTotal.centavos / 2);
      if (props.valorSinal.centavos > metadeTotal) {
        return Result.fail(new Error('Deposit cannot exceed 50% of total value'))
      }
    }
    
    if (props.descontoAplicado instanceof Money && props.valorTotal instanceof Money) {
      if (props.descontoAplicado.centavos > props.valorTotal.centavos) {
        return Result.fail(new Error('Discount cannot exceed total value'))
      }
    }
    
    // Status validação
    const validStatuses: PropostaStatus[] = [
      'rascunho', 'enviada', 'vista', 'negociacao', 'aceita', 
      'recusada', 'expirada', 'convertida'
    ];
    if (props.status && !validStatuses.includes(props.status)) {
      return Result.fail(new Error(`Invalid status: ${props.status}`));
    }
    
    // Observações
    if (props.observacoes !== undefined && props.observacoes.length > 1000) {
      return Result.fail(new Error('Observations cannot exceed 1000 characters'));
    }
    
    const proposta = new Proposta(
      props.id.trim(),
      props.leadId.trim(),
      props.propriedadeId.trim(),
      props.pacoteId.trim(),
      props.dataCriacao,
      props.dataCheckIn,
      props.dataCheckOut,
      props.quantidadeHospedes,
      props.valorTotal,
      props.valorSinal,
      props.descontoAplicado,
      props.status || 'rascunho',
      props.validade,
      props.observacoes?.trim() || undefined,
      props.historicoVersoes
    );
    
    return Result.ok(proposta);
  }

  // Getters
  get ehRascunho(): boolean {
    return this.status === 'rascunho';
  }
  
  get ehEnviada(): boolean {
    return this.status === 'enviada';
  }
  
  get ehVista(): boolean {
    return this.status === 'vista';
  }
  
  get ehNegociacao(): boolean {
    return this.status === 'negociacao';
  }
  
  get ehAceita(): boolean {
    return this.status === 'aceita';
  }
  
  get ehRecusada(): boolean {
    return this.status === 'recusada';
  }
  
  get ehExpirada(): boolean {
    return this.status === 'expirada';
  }
  
  get ehConvertida(): boolean {
    return this.status === 'convertida';
  }

  // Métodos de transição de estado
  enviar(): Result<Proposta, Error> {
    if (this.status !== 'rascunho') {
      return Result.fail(new Error('Only draft proposals can be sent'));
    }
    
    if (!this.dataCheckIn || !this.dataCheckOut) {
      return Result.fail(new Error('Check-in and check-out dates are required'));
    }
    
    if (!this.valorTotal) {
      return Result.fail(new Error('Total value must be calculated'));
    }
    
    return Result.ok(new Proposta(
      this.id,
      this.leadId,
      this.propriedadeId,
      this.pacoteId,
      this.dataCriacao,
      this.dataCheckIn,
      this.dataCheckOut,
      this.quantidadeHospedes,
      this.valorTotal,
      this.valorSinal,
      this.descontoAplicado,
      'enviada',
      this.validade,
      this.observacoes,
      this.historicoVersoes
    ));
  }

  visualizar(): Result<Proposta, Error> {
    if (this.status !== 'enviada') {
      return Result.fail(new Error('Only sent proposals can be viewed'));
    }
    
    return Result.ok(new Proposta(
      this.id,
      this.leadId,
      this.propriedadeId,
      this.pacoteId,
      this.dataCriacao,
      this.dataCheckIn,
      this.dataCheckOut,
      this.quantidadeHospedes,
      this.valorTotal,
      this.valorSinal,
      this.descontoAplicado,
      'vista',
      this.validade,
      this.observacoes,
      this.historicoVersoes
    ));
  }

  negociar(): Result<Proposta, Error> {
    if (this.status !== 'vista') {
      return Result.fail(new Error('Only viewed proposals can be negotiated'));
    }
    
    return Result.ok(new Proposta(
      this.id,
      this.leadId,
      this.propriedadeId,
      this.pacoteId,
      this.dataCriacao,
      this.dataCheckIn,
      this.dataCheckOut,
      this.quantidadeHospedes,
      this.valorTotal,
      this.valorSinal,
      this.descontoAplicado,
      'negociacao',
      this.validade,
      this.observacoes,
      this.historicoVersoes
    ));
  }

  aceitar(): Result<Proposta, Error> {
    if (this.status !== 'negociacao') {
      return Result.fail(new Error('Only negotiated proposals can be accepted'));
    }
    
    return Result.ok(new Proposta(
      this.id,
      this.leadId,
      this.propriedadeId,
      this.pacoteId,
      this.dataCriacao,
      this.dataCheckIn,
      this.dataCheckOut,
      this.quantidadeHospedes,
      this.valorTotal,
      this.valorSinal,
      this.descontoAplicado,
      'aceita',
      this.validade,
      this.observacoes,
      this.historicoVersoes
    ));
  }

  recusar(motivo?: string): Result<Proposta, Error> {
    if (this.status !== 'enviada' && this.status !== 'vista' && this.status !== 'negociacao') {
      return Result.fail(new Error('Only sent, viewed, or negotiated proposals can be rejected'));
    }
    
    return Result.ok(new Proposta(
      this.id,
      this.leadId,
      this.propriedadeId,
      this.pacoteId,
      this.dataCriacao,
      this.dataCheckIn,
      this.dataCheckOut,
      this.quantidadeHospedes,
      this.valorTotal,
      this.valorSinal,
      this.descontoAplicado,
      'recusada',
      this.validade,
      this.observacoes,
      this.historicoVersoes
    ));
  }

  expirar(): Result<Proposta, Error> {
    if (this.status === 'convertida') {
      return Result.fail(new Error('Converted proposals cannot be expired'));
    }
    
    return Result.ok(new Proposta(
      this.id,
      this.leadId,
      this.propriedadeId,
      this.pacoteId,
      this.dataCriacao,
      this.dataCheckIn,
      this.dataCheckOut,
      this.quantidadeHospedes,
      this.valorTotal,
      this.valorSinal,
      this.descontoAplicado,
      'expirada',
      this.validade,
      this.observacoes,
      this.historicoVersoes
    ));
  }

  converter(): Result<Proposta, Error> {
    if (this.status !== 'aceita') {
      return Result.fail(new Error('Only accepted proposals can be converted'));
    }
    
    return Result.ok(new Proposta(
      this.id,
      this.leadId,
      this.propriedadeId,
      this.pacoteId,
      this.dataCriacao,
      this.dataCheckIn,
      this.dataCheckOut,
      this.quantidadeHospedes,
      this.valorTotal,
      this.valorSinal,
      this.descontoAplicado,
      'convertida',
      this.validade,
      this.observacoes,
      this.historicoVersoes
    ));
  }

  // Métodos de negócio
  aplicarDesconto(desconto: Money): Result<Proposta, Error> {
    if (!this.valorTotal) {
      return Result.fail(new Error('Total value must be set before applying discount'));
    }
    
    if (desconto.isZero()) {
      return Result.ok(this);
    }
    
    if (desconto.centavos > this.valorTotal.centavos) {
      return Result.fail(new Error('Discount cannot exceed total value'));
    }
    
    const novoValorTotal = this.valorTotal.subtract(desconto);
    if (novoValorTotal.isFail) {
      return novoValorTotal;
    }
    
    return Result.ok(new Proposta(
      this.id,
      this.leadId,
      this.propriedadeId,
      this.pacoteId,
      this.dataCriacao,
      this.dataCheckIn,
      this.dataCheckOut,
      this.quantidadeHospedes,
      novoValorTotal.value,
      this.valorSinal,
      desconto, // desconto aplicado
      this.status,
      this.validade,
      this.observacoes,
      this.historicoVersoes
    ));
  }

  calcularSinal(percentual: number): Result<Money, Error> {
    if (!this.valorTotal) {
      return Result.fail(new Error('Total value must be set to calculate deposit'));
    }
    
    if (percentual < 0 || percentual > 100) {
      return Result.fail(new Error('Percentage must be between 0 and 100'));
    }
    
    // Regra de negócio: sinal não pode exceder 50% do total
    if (percentual > 50) {
      return Result.fail(new Error('Deposit cannot exceed 50% of total value'));
    }
    
    return this.valorTotal.percentage(percentual);
  }

  // Eventos de domínio (simplificado)
  get eventos(): Array<{ type: string; payload: any }> {
    return [];
  }
}