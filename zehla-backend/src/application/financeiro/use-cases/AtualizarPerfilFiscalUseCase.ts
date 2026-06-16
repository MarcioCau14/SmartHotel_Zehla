import { Result } from '../../../domain/shared/Result';
import { TaxProfile } from '../../../domain/financeiro/entities/TaxProfile';
import { ITaxProfileRepository } from '../ports/ITaxProfileRepository';
import crypto from 'crypto';

export interface AtualizarPerfilFiscalInput {
  propertyId: string;
  cnpj: string;
  razaoSocial: string;
  inscricaoEstadual?: string;
  inscricaoMunicipal?: string;
  taxRegime: string;
  environment: string;
  encryptedKeys?: string;
}

export class AtualizarPerfilFiscalUseCase {
  constructor(private readonly taxProfileRepo: ITaxProfileRepository) {}

  async execute(input: AtualizarPerfilFiscalInput): Promise<Result<TaxProfile, Error>> {
    try {
      // 1. Buscar se já existe perfil cadastrado para a pousada
      const existingProfile = await this.taxProfileRepo.findByPropertyId(input.propertyId);
      
      const id = existingProfile?.id || crypto.randomUUID();
      
      // 2. Criar a entidade com as novas propriedades
      const profileResult = TaxProfile.create({
        id,
        propertyId: input.propertyId,
        cnpj: input.cnpj,
        razaoSocial: input.razaoSocial,
        inscricaoEstadual: input.inscricaoEstadual || null,
        inscricaoMunicipal: input.inscricaoMunicipal || null,
        taxRegime: input.taxRegime,
        environment: input.environment,
        encryptedKeys: input.encryptedKeys || null,
      });

      if (profileResult.isFail) {
        return Result.fail(profileResult.error);
      }

      const taxProfile = profileResult.value;

      // 3. Persistir
      await this.taxProfileRepo.save(taxProfile);

      return Result.ok(taxProfile);
    } catch (error) {
      return Result.fail(error instanceof Error ? error : new Error('ERRO_INESPERADO_AO_ATUALIZAR_PERFIL_FISCAL'));
    }
  }
}
