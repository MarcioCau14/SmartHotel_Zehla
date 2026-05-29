import { Result } from '../../../shared/Result'
import { Lead } from './Lead'
import { Proposta } from './Proposta'
import { Pagamento } from './Pagamento'

export type ConversaoStatus = 
  | 'pendente'
  | 'confirmada'
  | 'cancelada'
  | 'invalida'

export interface ConversaoProps {
  id: string
  leadId: string
  propostaId: string
  propriedadeId: string
  pagamentoId: string
  dataConversao?: Date
  dataConfirmacao?: Date
  status?: ConversaoStatus
  motivoCancelamento?: string
  observacoes?: string
}

export class Conversao {
  private constructor(
    public readonly id: string,
    public readonly leadId: string,
    public readonly propostaId: string,
    public readonly propriedadeId: string,
    public readonly pagamentoId: string,
    public readonly dataConversao: Date | undefined,
    public readonly dataConfirmacao: Date | undefined,
    public readonly status: ConversaoStatus,
    public readonly motivoCancelamento: string | undefined,
    public readonly observacoes: string | undefined
  ) {
    Object.freeze(this)
  }

  static create(props: ConversaoProps): Result<Conversao, Error> {
    // Validações obrigatórias
    if (!props.id || props.id.trim().length === 0) {
      return Result.fail(new Error('Conversion ID is required'))
    }
    
    if (!props.leadId || props.leadId.trim().length === 0) {
      return Result.fail(new Error('Lead ID is required'))
    }
    
    if (!props.propostaId || props.propostaId.trim().length === 0) {
      return Result.fail(new Error('Proposal ID is required'))
    }
    
    if (!props.propriedadeId || props.propriedadeId.trim().length === 0) {
      return Result.fail(new Error('Property ID is required for RLS'))
    }
    
    if (!props.pagamentoId || props.pagamentoId.trim().length === 0) {
      return Result.fail(new Error('Payment ID is required'))
    }
    
    // Status validação
    const validStatuses: ConversaoStatus[] = ['pendente', 'confirmada', 'cancelada', 'invalida'];
    if (props.status && !validStatuses.includes(props.status)) {
      return Result.fail(new Error(`Invalid status: ${props.status}`));
    }
    
    // Se confirmada, deve ter data de confirmação
    if (props.status === 'confirmada' && !props.dataConfirmacao) {
      return Result.fail(new Error('Confirmation date is required for confirmed conversion'));
    }
    
    // Se cancelada, deve ter motivo
    if (props.status === 'cancelada' && (!props.motivoCancelamento || props.motivoCancelamento.trim().length === 0)) {
      return Result.fail(new Error('Cancellation reason is required for cancelled conversion'));
    }
    
    // Observações
    if (props.observacoes !== undefined && props.observacoes.length > 1000) {
      return Result.fail(new Error('Observations cannot exceed 1000 characters'));
    }
    
    const conversao = new Conversao(
      props.id.trim(),
      props.leadId.trim(),
      props.propostaId.trim(),
      props.propriedadeId.trim(),
      props.pagamentoId.trim(),
      props.dataConversao,
      props.dataConfirmacao,
      props.status || 'pendente',
      props.motivoCancelamento?.trim() || undefined,
      props.observacoes?.trim() || undefined
    );
    
    return Result.ok(conversao);
  }

  // Getters
  get ehPendente(): boolean {
    return this.status === 'pendente';
  }
  
  get ehConfirmada(): boolean {
    return this.status === 'confirmada';
  }
  
  get ehCancelada(): boolean {
    return this.status === 'cancelada';
  }
  
  get ehInvalida(): boolean {
    return this.status === 'invalida';
  }

  // Métodos de transição de estado
  confirmar(dataConfirmacao: Date = new Date()): Result<Conversao, Error> {
    if (this.status !== 'pendente') {
      return Result.fail(new Error('Only pending conversions can be confirmed'));
    }
    
    return Result.ok(new Conversao(
      this.id,
      this.leadId,
      this.propostaId,
      this.propriedadeId,
      this.pagamentoId,
      this.dataConversao,
      dataConfirmacao,
      'confirmada',
      this.motivoCancelamento,
      this.observacoes
    ));
  }

  cancelar(motivo: string): Result<Conversao, Error> {
    if (this.status !== 'pendente') {
      return Result.fail(new Error('Only pending conversions can be cancelled'));
    }
    
    if (!motivo || motivo.trim().length === 0) {
      return Result.fail(new Error('Cancellation reason is required'));
    }
    
    return Result.ok(new Conversao(
      this.id,
      this.leadId,
      this.propostaId,
      this.propriedadeId,
      this.pagamentoId,
      this.dataConversao,
      this.dataConfirmacao,
      'cancelada',
      motivo.trim(),
      this.observacoes
    ));
  }

  invalidar(motivo?: string): Result<Conversao, Error> {
    if (this.status !== 'pendente' && this.status !== 'confirmada') {
      return Result.fail(new Error('Only pending or confirmed conversions can be invalidated'));
    }
    
    return Result.ok(new Conversao(
      this.id,
      this.leadId,
      this.propostaId,
      this.propriedadeId,
      this.pagamentoId,
      this.dataConversao,
      this.dataConfirmacao,
      'invalida',
      motivo?.trim() || undefined,
      this.observacoes
    ));
  }

  atualizarDataConversao(data: Date = new Date()): Result<Conversao, Error> {
    if (this.status !== 'pendente') {
      return Result.fail(new Error('Only pending conversions can have their date updated'));
    }
    
    return Result.ok(new Conversao(
      this.id,
      this.leadId,
      this.propostaId,
      this.propriedadeId,
      this.pagamentoId,
      data,
      this.dataConfirmacao,
      this.status,
      this.motivoCancelamento,
      this.observacoes
    ));
  }

  // Eventos de domínio (simplificado)
  get eventos(): Array<{ type: string; payload: any }> {
    return [];
  }
}