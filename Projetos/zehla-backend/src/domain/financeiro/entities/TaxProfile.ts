import { Result } from '../../shared/Result'

export interface TaxProfileProps {
  id: string;
  propertyId: string;
  cnpj: string | null;
  razaoSocial: string | null;
  nomeFantasia: string | null;
  inscricaoMunicipal: string | null;
  inscricaoEstadual: string | null;
  regimeTributario: string; // ex: "SIMPLES_NACIONAL" | "LUCRO_PRESUMIDO" | "LUCRO_REAL"
  codigoAtividade: string | null;
  certificadoDigital: any | null;
  enderecoCompleto: any | null;
  emailNF: string | null;
  telefoneNF: string | null;
  autoEmissaoNF: boolean;
  tipoNFS: string; // ex: "NFS_E"
  provedorNF: string | null;
  chaveAPIProvedor: string | null;
  ambienteEmissao: string; // "HOMOLOGACAO" | "PRODUCAO"
}

export class TaxProfile {
  private readonly props: TaxProfileProps;

  private constructor(props: TaxProfileProps) {
    this.props = { ...props };
  }

  public static create(props: TaxProfileProps): Result<TaxProfile, string> {
    if (!props.id) {
      return Result.fail('ID do perfil fiscal é obrigatório');
    }
    if (!props.propertyId) {
      return Result.fail('ID da propriedade (tenant) é obrigatório');
    }

    // Validação básica de CNPJ se fornecido
    if (props.cnpj) {
      const cleanCnpj = props.cnpj.replace(/\D/g, '');
      if (cleanCnpj.length !== 14) {
        return Result.fail('CNPJ deve conter exatamente 14 dígitos numéricos');
      }
    }

    return Result.ok(new TaxProfile(props));
  }

  public get id(): string {
    return this.props.id;
  }

  public get propertyId(): string {
    return this.props.propertyId;
  }

  public get cnpj(): string | null {
    return this.props.cnpj;
  }

  public get razaoSocial(): string | null {
    return this.props.razaoSocial;
  }

  public get nomeFantasia(): string | null {
    return this.props.nomeFantasia;
  }

  public get inscricaoMunicipal(): string | null {
    return this.props.inscricaoMunicipal;
  }

  public get inscricaoEstadual(): string | null {
    return this.props.inscricaoEstadual;
  }

  public get regimeTributario(): string {
    return this.props.regimeTributario;
  }

  public get codigoAtividade(): string | null {
    return this.props.codigoAtividade;
  }

  public get certificadoDigital(): any | null {
    return this.props.certificadoDigital;
  }

  public get enderecoCompleto(): any | null {
    return this.props.enderecoCompleto;
  }

  public get emailNF(): string | null {
    return this.props.emailNF;
  }

  public get telefoneNF(): string | null {
    return this.props.telefoneNF;
  }

  public get autoEmissaoNF(): boolean {
    return this.props.autoEmissaoNF;
  }

  public get tipoNFS(): string {
    return this.props.tipoNFS;
  }

  public get provedorNF(): string | null {
    return this.props.provedorNF;
  }

  public get chaveAPIProvedor(): string | null {
    return this.props.chaveAPIProvedor;
  }

  public get ambienteEmissao(): string {
    return this.props.ambienteEmissao;
  }

  public toDTO(): TaxProfileProps {
    return { ...this.props };
  }
}
