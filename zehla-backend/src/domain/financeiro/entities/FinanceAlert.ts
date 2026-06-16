import { Result } from '../../shared/Result';

export interface FinanceAlertProps {
  id: string;
  propertyId: string;
  scope: 'CORPORATE' | 'CLIENT';
  type: string;
  severity: 'INFO' | 'WARNING' | 'CRITICAL';
  agentName: string;
  message: string;
  metric: Record<string, any> | null;
  isRead: boolean;
  actionTaken: string | null;
  createdAt: Date;
}

export class FinanceAlert {
  private constructor(private readonly props: FinanceAlertProps) {
    Object.freeze(this.props);
  }

  static create(props: Omit<FinanceAlertProps, 'createdAt'>): Result<FinanceAlert, Error> {
    if (!props.id) {
      return Result.fail(new Error('ID_OBRIGATORIO'));
    }
    if (!props.propertyId) {
      return Result.fail(new Error('PROPERTY_ID_OBRIGATORIO'));
    }
    if (!props.type || props.type.trim().length === 0) {
      return Result.fail(new Error('TIPO_ALERTA_OBRIGATORIO'));
    }
    if (!props.severity) {
      return Result.fail(new Error('SEVERIDADE_OBRIGATORIA'));
    }
    if (!props.agentName || props.agentName.trim().length === 0) {
      return Result.fail(new Error('NOME_AGENTE_OBRIGATORIO'));
    }
    if (!props.message || props.message.trim().length === 0) {
      return Result.fail(new Error('MENSAGEM_OBRIGATORIA'));
    }

    return Result.ok(new FinanceAlert({
      ...props,
      createdAt: new Date()
    }));
  }

  static restore(props: FinanceAlertProps): FinanceAlert {
    return new FinanceAlert(props);
  }

  get id(): string { return this.props.id; }
  get propertyId(): string { return this.props.propertyId; }
  get scope(): 'CORPORATE' | 'CLIENT' { return this.props.scope; }
  get type(): string { return this.props.type; }
  get severity(): 'INFO' | 'WARNING' | 'CRITICAL' { return this.props.severity; }
  get agentName(): string { return this.props.agentName; }
  get message(): string { return this.props.message; }
  get metric(): Record<string, any> | null { return this.props.metric; }
  get isRead(): boolean { return this.props.isRead; }
  get actionTaken(): string | null { return this.props.actionTaken; }
  get createdAt(): Date { return this.props.createdAt; }

  toJSON(): FinanceAlertProps {
    return { ...this.props };
  }
}
