import { Result } from '../../shared/Result';

export interface FinanceTransactionProps {
  id: string;
  propertyId: string;
  scope: 'CORPORATE' | 'CLIENT';
  date: Date;
  type: 'INCOME' | 'EXPENSE';
  category: string;
  channel: string | null;
  description: string;
  amount: number;
  status: string;
  metadata: Record<string, any> | null;
}

export class FinanceTransaction {
  private constructor(private readonly props: FinanceTransactionProps) {
    Object.freeze(this.props);
  }

  static create(props: FinanceTransactionProps): Result<FinanceTransaction, Error> {
    if (!props.id) {
      return Result.fail(new Error('ID_OBRIGATORIO'));
    }
    if (!props.propertyId) {
      return Result.fail(new Error('PROPERTY_ID_OBRIGATORIO'));
    }
    if (!props.date) {
      return Result.fail(new Error('DATA_OBRIGATORIA'));
    }
    if (!props.type) {
      return Result.fail(new Error('TIPO_TRANSACAO_OBRIGATORIO'));
    }
    if (!props.category || props.category.trim().length === 0) {
      return Result.fail(new Error('CATEGORIA_OBRIGATORIA'));
    }
    if (!props.description || props.description.trim().length === 0) {
      return Result.fail(new Error('DESCRICAO_OBRIGATORIA'));
    }
    if (props.amount < 0) {
      return Result.fail(new Error('VALOR_POSITIVO_OBRIGATORIO'));
    }
    if (!props.status) {
      return Result.fail(new Error('STATUS_OBRIGATORIO'));
    }

    return Result.ok(new FinanceTransaction(props));
  }

  static restore(props: FinanceTransactionProps): FinanceTransaction {
    return new FinanceTransaction(props);
  }

  get id(): string { return this.props.id; }
  get propertyId(): string { return this.props.propertyId; }
  get scope(): 'CORPORATE' | 'CLIENT' { return this.props.scope; }
  get date(): Date { return this.props.date; }
  get type(): 'INCOME' | 'EXPENSE' { return this.props.type; }
  get category(): string { return this.props.category; }
  get channel(): string | null { return this.props.channel; }
  get description(): string { return this.props.description; }
  get amount(): number { return this.props.amount; }
  get status(): string { return this.props.status; }
  get metadata(): Record<string, any> | null { return this.props.metadata; }

  toJSON(): FinanceTransactionProps {
    return { ...this.props };
  }
}
