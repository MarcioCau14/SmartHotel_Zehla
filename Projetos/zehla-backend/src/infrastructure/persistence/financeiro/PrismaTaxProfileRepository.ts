import type { PrismaClient } from '@prisma/client';
import { TaxProfile } from '../../../domain/financeiro/entities/TaxProfile';
import { ITaxProfileRepositoryPort } from '../../../domain/financeiro/ports/ITaxProfileRepositoryPort';

export class PrismaTaxProfileRepository implements ITaxProfileRepositoryPort {
  constructor(private readonly prisma: PrismaClient) {}

  async findByPropertyId(propertyId: string): Promise<TaxProfile | null> {
    const row = await this.prisma.tax_profiles.findUnique({
      where: { propertyId },
    });

    if (!row) return null;
    return this.hydrate(row);
  }

  async save(profile: TaxProfile): Promise<void> {
    const data = {
      id: profile.id,
      propertyId: profile.propertyId,
      cnpj: profile.cnpj,
      razaoSocial: profile.razaoSocial,
      nomeFantasia: profile.nomeFantasia,
      inscricaoMunicipal: profile.inscricaoMunicipal,
      inscricaoEstadual: profile.inscricaoEstadual,
      regimeTributario: profile.regimeTributario,
      codigoAtividade: profile.codigoAtividade,
      certificadoDigital: profile.certificadoDigital ?? undefined,
      enderecoCompleto: profile.enderecoCompleto ?? undefined,
      emailNF: profile.emailNF,
      telefoneNF: profile.telefoneNF,
      autoEmissaoNF: profile.autoEmissaoNF,
      tipoNFS: profile.tipoNFS,
      provedorNF: profile.provedorNF,
      chaveAPIProvedor: profile.chaveAPIProvedor,
      ambienteEmissao: profile.ambienteEmissao,
      updatedAt: new Date(),
    };

    await this.prisma.tax_profiles.upsert({
      where: { propertyId: profile.propertyId },
      create: data,
      update: data,
    });
  }

  private hydrate(row: any): TaxProfile {
    const result = TaxProfile.create({
      id: row.id,
      propertyId: row.propertyId,
      cnpj: row.cnpj,
      razaoSocial: row.razaoSocial,
      nomeFantasia: row.nomeFantasia,
      inscricaoMunicipal: row.inscricaoMunicipal,
      inscricaoEstadual: row.inscricaoEstadual,
      regimeTributario: row.regimeTributario,
      codigoAtividade: row.codigoAtividade,
      certificadoDigital: row.certificadoDigital,
      enderecoCompleto: row.enderecoCompleto,
      emailNF: row.emailNF,
      telefoneNF: row.telefoneNF,
      autoEmissaoNF: row.autoEmissaoNF,
      tipoNFS: row.tipoNFS,
      provedorNF: row.provedorNF,
      chaveAPIProvedor: row.chaveAPIProvedor,
      ambienteEmissao: row.ambienteEmissao,
    });

    if (result.isFail) {
      throw new Error(`[PrismaTaxProfileRepository] Erro ao hidratar entidade: ${result.error}`);
    }

    return result.value;
  }
}
