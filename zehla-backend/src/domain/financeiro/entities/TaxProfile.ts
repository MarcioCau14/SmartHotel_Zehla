import { Result } from '../../shared/Result';

export interface TaxProfileProps {
  id: string;
  propertyId: string;
  cnpj: string;
  razaoSocial: string;
  inscricaoEstadual: string | null;
  inscricaoMunicipal: string | null;
  taxRegime: string;
  environment: string;
  encryptedKeys: string | null;
  updatedAt: Date;
}

export class TaxProfile {
  private constructor(private readonly props: TaxProfileProps) {
    Object.freeze(this.props);
  }

  static create(props: Omit<TaxProfileProps, 'updatedAt'>): Result<TaxProfile, Error> {
    if (!props.id) {
      return Result.fail(new Error('ID_OBRIGATORIO'));
    }
    if (!props.propertyId) {
      return Result.fail(new Error('PROPERTY_ID_OBRIGATORIO'));
    }
    if (!props.cnpj || props.cnpj.trim().length === 0) {
      return Result.fail(new Error('CNPJ_OBRIGATORIO'));
    }
    if (!props.razaoSocial || props.razaoSocial.trim().length === 0) {
      return Result.fail(new Error('RAZAO_SOCIAL_OBRIGATORIA'));
    }
    if (!props.taxRegime) {
      return Result.fail(new Error('REGIME_TRIBUTARIO_OBRIGATORIO'));
    }
    if (!props.environment) {
      return Result.fail(new Error('AMBIENTE_OBRIGATORIO'));
    }

    return Result.ok(new TaxProfile({
      ...props,
      updatedAt: new Date()
    }));
  }

  static restore(props: TaxProfileProps): TaxProfile {
    return new TaxProfile(props);
  }

  get id(): string { return this.props.id; }
  get propertyId(): string { return this.props.propertyId; }
  get cnpj(): string { return this.props.cnpj; }
  get razaoSocial(): string { return this.props.razaoSocial; }
  get inscricaoEstadual(): string | null { return this.props.inscricaoEstadual; }
  get inscricaoMunicipal(): string | null { return this.props.inscricaoMunicipal; }
  get taxRegime(): string { return this.props.taxRegime; }
  get environment(): string { return this.props.environment; }
  get encryptedKeys(): string | null { return this.props.encryptedKeys; }
  get updatedAt(): Date { return this.props.updatedAt; }

  toJSON(): TaxProfileProps {
    return { ...this.props };
  }
}
