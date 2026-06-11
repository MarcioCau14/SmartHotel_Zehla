import { Result } from '../../../domain/shared/Result';
import { TaxProfile, type TaxProfileProps } from '../../../domain/financeiro/entities/TaxProfile';
import { ITaxProfileRepositoryPort } from '../../../domain/financeiro/ports/ITaxProfileRepositoryPort';
import { randomUUID } from 'crypto';

export interface AtualizarPerfilFiscalInput {
  propertyId: string;
  cnpj: string | null;
  razaoSocial: string | null;
  nomeFantasia: string | null;
  inscricaoMunicipal: string | null;
  inscricaoEstadual: string | null;
  regimeTributario?: string;
  codigoAtividade?: string | null;
  certificadoDigital?: any | null;
  enderecoCompleto?: any | null;
  emailNF?: string | null;
  telefoneNF?: string | null;
  autoEmissaoNF?: boolean;
  tipoNFS?: string;
  provedorNF?: string | null;
  chaveAPIProvedor?: string | null;
  ambienteEmissao?: string;
}

export type AtualizarPerfilFiscalOutput = TaxProfileProps;

export class AtualizarPerfilFiscalUseCase {
  constructor(private readonly taxProfileRepo: ITaxProfileRepositoryPort) {}

  async execute(input: AtualizarPerfilFiscalInput): Promise<Result<AtualizarPerfilFiscalOutput, string>> {
    try {
      if (!input.propertyId) {
        return Result.fail('ID da propriedade é obrigatório');
      }

      // 1. Tentar carregar perfil existente
      let profile = await this.taxProfileRepo.findByPropertyId(input.propertyId);

      // 2. Se não existir, criaremos um novo perfil fiscal com ID único
      const id = profile ? profile.id : `tp_${randomUUID().replace(/-/g, '')}`;

      const props: TaxProfileProps = {
        id,
        propertyId: input.propertyId,
        cnpj: input.cnpj !== undefined ? input.cnpj : (profile ? profile.cnpj : null),
        razaoSocial: input.razaoSocial !== undefined ? input.razaoSocial : (profile ? profile.razaoSocial : null),
        nomeFantasia: input.nomeFantasia !== undefined ? input.nomeFantasia : (profile ? profile.nomeFantasia : null),
        inscricaoMunicipal: input.inscricaoMunicipal !== undefined ? input.inscricaoMunicipal : (profile ? profile.inscricaoMunicipal : null),
        inscricaoEstadual: input.inscricaoEstadual !== undefined ? input.inscricaoEstadual : (profile ? profile.inscricaoEstadual : null),
        regimeTributario: input.regimeTributario !== undefined ? input.regimeTributario : (profile ? profile.regimeTributario : 'SIMPLES_NACIONAL'),
        codigoAtividade: input.codigoAtividade !== undefined ? input.codigoAtividade : (profile ? profile.codigoAtividade : null),
        certificadoDigital: input.certificadoDigital !== undefined ? input.certificadoDigital : (profile ? profile.certificadoDigital : null),
        enderecoCompleto: input.enderecoCompleto !== undefined ? input.enderecoCompleto : (profile ? profile.enderecoCompleto : null),
        emailNF: input.emailNF !== undefined ? input.emailNF : (profile ? profile.emailNF : null),
        telefoneNF: input.telefoneNF !== undefined ? input.telefoneNF : (profile ? profile.telefoneNF : null),
        autoEmissaoNF: input.autoEmissaoNF !== undefined ? input.autoEmissaoNF : (profile ? profile.autoEmissaoNF : false),
        tipoNFS: input.tipoNFS !== undefined ? input.tipoNFS : (profile ? profile.tipoNFS : 'NFS_E'),
        provedorNF: input.provedorNF !== undefined ? input.provedorNF : (profile ? profile.provedorNF : null),
        chaveAPIProvedor: input.chaveAPIProvedor !== undefined ? input.chaveAPIProvedor : (profile ? profile.chaveAPIProvedor : null),
        ambienteEmissao: input.ambienteEmissao !== undefined ? input.ambienteEmissao : (profile ? profile.ambienteEmissao : 'HOMOLOGACAO'),
      };

      // 3. Instanciar entidade de domínio (que executará as validações de invariants)
      const profileResult = TaxProfile.create(props);
      if (profileResult.isFail) {
        return Result.fail(profileResult.error);
      }

      const validatedProfile = profileResult.value;

      // 4. Persistir através do Port
      await this.taxProfileRepo.save(validatedProfile);

      return Result.ok(validatedProfile.toDTO());
    } catch (error: any) {
      console.error('❌ [AtualizarPerfilFiscalUseCase] Falha crítica:', error);
      return Result.fail(`Falha interna ao atualizar perfil fiscal: ${error.message}`);
    }
  }
}
