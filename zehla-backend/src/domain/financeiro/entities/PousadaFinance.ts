import { Result } from '../../shared/Result';

export interface PousadaFinanceProps {
  id: string;
  propertyId: string;
  scope: 'CORPORATE' | 'CLIENT';
  date: Date;
  grossRevenue: number;
  netRevenue: number;
  channelBreakdown: Record<string, number> | null;
  totalRooms: number;
  occupiedRooms: number;
  occupancyRate: number;
  adr: number;
  revpar: number;
  operatingCosts: Record<string, number> | null;
  totalCosts: number;
  aiInsight: string | null;
  healthScore: number | null;
  alertLevel: string | null;
}

export class PousadaFinance {
  private constructor(private readonly props: PousadaFinanceProps) {
    Object.freeze(this.props);
  }

  static create(props: Omit<PousadaFinanceProps, 'occupancyRate' | 'revpar'>): Result<PousadaFinance, Error> {
    if (!props.id) {
      return Result.fail(new Error('ID_OBRIGATORIO'));
    }
    if (!props.propertyId) {
      return Result.fail(new Error('PROPERTY_ID_OBRIGATORIO'));
    }
    if (!props.date) {
      return Result.fail(new Error('DATA_OBRIGATORIA'));
    }
    if (props.grossRevenue < 0 || props.netRevenue < 0 || props.totalCosts < 0) {
      return Result.fail(new Error('VALORES_MONETARIOS_POSITIVOS'));
    }
    if (props.totalRooms < 0 || props.occupiedRooms < 0) {
      return Result.fail(new Error('QUARTOS_NEGATIVOS'));
    }
    if (props.occupiedRooms > props.totalRooms) {
      return Result.fail(new Error('OCUPACAO_MAIOR_QUE_TOTAL'));
    }

    const occupancyRate = props.totalRooms > 0 
      ? (props.occupiedRooms / props.totalRooms) * 100 
      : 0;
    
    const revpar = props.totalRooms > 0 
      ? props.netRevenue / props.totalRooms 
      : 0;

    return Result.ok(new PousadaFinance({
      ...props,
      occupancyRate,
      revpar
    }));
  }

  static restore(props: PousadaFinanceProps): PousadaFinance {
    return new PousadaFinance(props);
  }

  get id(): string { return this.props.id; }
  get propertyId(): string { return this.props.propertyId; }
  get scope(): 'CORPORATE' | 'CLIENT' { return this.props.scope; }
  get date(): Date { return this.props.date; }
  get grossRevenue(): number { return this.props.grossRevenue; }
  get netRevenue(): number { return this.props.netRevenue; }
  get channelBreakdown(): Record<string, number> | null { return this.props.channelBreakdown; }
  get totalRooms(): number { return this.props.totalRooms; }
  get occupiedRooms(): number { return this.props.occupiedRooms; }
  get occupancyRate(): number { return this.props.occupancyRate; }
  get adr(): number { return this.props.adr; }
  get revpar(): number { return this.props.revpar; }
  get operatingCosts(): Record<string, number> | null { return this.props.operatingCosts; }
  get totalCosts(): number { return this.props.totalCosts; }
  get aiInsight(): string | null { return this.props.aiInsight; }
  get healthScore(): number | null { return this.props.healthScore; }
  get alertLevel(): string | null { return this.props.alertLevel; }

  toJSON(): PousadaFinanceProps {
    return { ...this.props };
  }
}
