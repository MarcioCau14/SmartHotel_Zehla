import { Result } from '../../../shared/Result'
import { Money } from '../value-objects/Money'
import { Proposta } from './Proposta'

export type PagamentoStatus = 
  | 'rascunho'
  | 'processando'
  | 'aprovado'
  | 'recusado'
  | 'estornado'
  | 'reembolsado'

export interface PagamentoProps {
  id: string
  propostaId: string
  propriedadeId: string
  valor: Money
  metodoPagamento?: string
  transactionId?: string
  dataCriacao?: Date
  dataProcessamento?: Date
  status?: PagamentoStatus
  codigoAutorizacao?: string
  mensagemRecusa?: string
  observacoes?: string
}

export class Pagamento {
  private constructor(
    public readonly id: string,
    public readonly propostaId: string,
    public readonly propriedadeId: string,
    public readonly valor: Money,
    public readonly metodoPagamento: string | undefined,
    public readonly transactionId: string | undefined,
    public readonly dataCriacao: Date | undefined,
    public readonly dataProcessamento: Date | undefined,
    public readonly status: PagamentoStatus,
    public readonly codigoAutorizacao: string | undefined,
    public readonly mensagemRecusa: string | undefined,
    public readonly observacoes: string | undefined
  ) {
    Object.freeze(this)
  }

  static create(props: PagamentoProps): Result<Pagamento, Error> {
    // Validações obrigatórias
    if (!props.id || props.id.trim().length === 0) {
      return Result.fail(new Error('Payment ID is required'))
    }
    
    if (!props.propostaId || props.propostaId.trim().length === 0) {
      return Result.fail(new Error('Proposal ID is required'))
    }
    
    if (!props.propriedadeId || props.propriedadeId.trim().length === 0) {
      return Result.fail(new Error('Property ID is required for RLS'))
    }
    
    if (!(props.valor instanceof Money)) {
      return Result.fail(new Error('Value must be a Money object'))
    }
    
    if (props.valor.isZero()) {
      return Result.fail(new Error('Payment value must be greater than zero'))
    }
    
    if (!props.dataCriacao) {
      props.dataCriacao = new Date()
    }
    
    // Validação de datas
    if (props.dataProcessamento && props.dataProcessamento < props.dataCriacao) {
      return Result.fail(new Error('Processing date cannot be before creation date'))
    }
    
    // Status validação
    const validStatuses: PagamentoStatus[] = [
      'rascunho', 'processando', 'aprovado', 'recusado', 'estornado', 'reembolsado'
    ];
    if (props.status && !validStatuses.includes(props.status)) {
      return Result.fail(new Error(`Invalid status: ${props.status}`));
    }
    
    // Se aprovado, deve ter transactionId e codigoAutorizacao
    if (props.status === 'aprovado' && (!props.transactionId || props.transactionId.trim().length === 0)) {
      return Result.fail(new Error('Transaction ID is required for approved payment'));
    }
    
    if (props.status === 'aprovado' && (!props.codigoAutorizacao || props.codigoAutorizacao.trim().length === 0)) {
      return Result.fail(new Error('Authorization code is required for approved payment'));
    }
    
    // Se recusado, deve ter mensagemRecusa
    if (props.status === 'recusado' && (!props.mensagemRecusa || props.mensagemRecusa.trim().length === 0)) {
      return Result.fail(new Error('Rejection message is required for rejected payment'));
    }
    
    // Observações
    if (props.observacoes !== undefined && props.observacoes.length > 1000) {
      return Result.fail(new Error('Observations cannot exceed 1000 characters'));
    }
    
    const pagamento = new Pagamento(
      props.id.trim(),
      props.propostaId.trim(),
      props.propriedadeId.trim(),
      props.valor,
      props.metodoPagamento?.trim() || undefined,
      props.transactionId?.trim() || undefined,
      props.dataCriacao,
      props.dataProcessamento,
      props.status || 'rascunho',
      props.codigoAutorizacao?.trim() || undefined,
      props.mensagemRecusa?.trim() || undefined,
      props.observacoes?.trim() || undefined
    );
    
    return Result.ok(pagamento);
  }

  // Getters
  get ehRascunho(): boolean {
    return this.status === 'rascunho';
  }
  
  get ehProcessando(): boolean {
    return this.status === 'processando';
  }
  
  get ehAprovado(): boolean {
    return this.status === 'aprovado';
  }
  
  get ehRecusado(): boolean {
    return this.status === 'recusado';
  }
  
  get ehEstornado(): boolean {
    return this.status === 'estornado';
  }
  
  get ehReembolsado(): boolean {
    return this.status === 'reembolsado';
  }

  // Métodos de transição de estado
  processar(transactionId: string, codigoAutorizacao: string): Result<Pagamento, Error> {
    if (this.status !== 'rascunho') {
      return Result.fail(new Error('Only draft payments can be processed'));
    }
    
    if (!transactionId || transactionId.trim().length === 0) {
      return Result.fail(new Error('Transaction ID is required'));
    }
    
    if (!codigoAutorizacao || codigoAutorizacao.trim().length === 0) {
      return Result.fail(new Error('Authorization code is required'));
    }
    
    return Result.ok(new Pagamento(
      this.id,
      this.propostaId,
      this.propriedadeId,
      this.valor,
      this.metodoPagamento,
      transactionId.trim(),
      this.dataCriacao,
      new Date(), // data de processamento
      'processando',
      codigoAutorizacao.trim(),
      this.mensagemRecusa,
      this.observacoes
    ));
  }

  aprovar(transactionId: string, codigoAutorizacao: string): Result<Pagamento, Error> {
    if (this.status !== 'processando') {
      return Result.fail(new Error('Only processing payments can be approved'));
    }
    
    if (!transactionId || transactionId.trim().length === 0) {
      return Result.fail(new Error('Transaction ID is required'));
    }
    
    if (!codigoAutorizacao || codigoAutorizacao.trim().length === 0) {
      return Result.fail(new Error('Authorization code is required'));
    }
    
    return Result.ok(new Pagamento(
      this.id,
      this.propostaId,
      this.propriedadeId,
      this.valor,
      this.metodoPagamento,
      transactionId.trim(),
      this.dataCriacao,
      this.dataProcessamento,
      'aprovado',
      codigoAutorizacao.trim(),
      this.mensagemRecusa,
      this.observacoes
    ));
  }

  recusar(mensagem: string): Result<Pagamento, Error> {
    if (this.status !== 'processando') {
      return Result.fail(new Error('Only processing payments can be rejected'));
    }
    
    if (!mensagem || mensagem.trim().length === 0) {
      return Result.fail(new Error('Rejection message is required'));
    }
    
    return Result.ok(new Pagamento(
      this.id,
      this.propostaId,
      this.propriedadeId,
      this.valor,
      this.metodoPagamento,
      this.transactionId,
      this.dataCriacao,
      this.dataProcessamento,
      'recusado',
      this.codigoAutorizacao,
      mensagem.trim(),
      this.observacoes
    ));
  }

  estornar(motivo?: string): Result<Pagamento, Error> {
    if (this.status !== 'aprovado') {
      return Result.fail(new Error('Only approved payments can be refunded'));
    }
    
    const obs = this.observacoes 
      ? `${this.observacoes} [Estorno: ${motivo || 'Não informado'}]`
      : `[Estorno: ${motivo || 'Não informado'}]`;
    
    return Result.ok(new Pagamento(
      this.id,
      this.propostaId,
      this.propriedadeId,
      this.valor,
      this.metodoPagamento,
      this.transactionId,
      this.dataCriacao,
      this.dataProcessamento,
      'estornado',
      this.codigoAutorizacao,
      this.mensagemRecusa,
      obs
    ));
  }

  reembolsar(motivo?: string): Result<Pagamento, Error> {
    if (this.status !== 'aprovado' && this.status !== 'estornado') {
      return Result.fail(new Error('Only approved or refunded payments can be reimbursed'));
    }
    
    const obs = this.observacoes 
      ? `${this.observacoes} [Reembolso: ${motivo || 'Não informado'}]`
      : `[Reembolso: ${motivo || 'Não informado'}]`;
    
    return Result.ok(new Pagamento(
      this.id,
      this.propostaId,
      this.propriedadeId,
      this.valor,
      this.metodoPagamento,
      this.transactionId,
      this.dataCriacao,
      this.dataProcessamento,
      'reembolsado',
      this.codigoAutorizacao,
      this.mensagemRecusa,
      obs
    ));
  }

  // Eventos de domínio (simplificado)
  get eventos(): Array<{ type: string; payload: any }> {
    return [];
  }
}