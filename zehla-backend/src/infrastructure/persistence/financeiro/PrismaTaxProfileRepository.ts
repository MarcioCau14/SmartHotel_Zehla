import { prisma } from '@/lib/prisma';
import { TaxProfile } from '../../../domain/financeiro/entities/TaxProfile';
import { ITaxProfileRepository } from '../../../application/financeiro/ports/ITaxProfileRepository';

export class PrismaTaxProfileRepository implements ITaxProfileRepository {
  async save(taxProfile: TaxProfile): Promise<void> {
    const data = {
      cnpj: taxProfile.cnpj,
      razaoSocial: taxProfile.razaoSocial,
      inscricaoEstadual: taxProfile.inscricaoEstadual,
      inscricaoMunicipal: taxProfile.inscricaoMunicipal,
      taxRegime: taxProfile.taxRegime,
      environment: taxProfile.environment,
      encryptedKeys: taxProfile.encryptedKeys,
    };

    await prisma.taxProfile.upsert({
      where: { propertyId: taxProfile.propertyId },
      update: data,
      create: {
        id: taxProfile.id,
        propertyId: taxProfile.propertyId,
        ...data,
      },
    });
  }

  async findByPropertyId(propertyId: string): Promise<TaxProfile | null> {
    const record = await prisma.taxProfile.findUnique({
      where: { propertyId },
    });

    if (!record) return null;

    return TaxProfile.restore({
      id: record.id,
      propertyId: record.propertyId,
      cnpj: record.cnpj,
      razaoSocial: record.razaoSocial,
      inscricaoEstadual: record.inscricaoEstadual,
      inscricaoMunicipal: record.inscricaoMunicipal,
      taxRegime: record.taxRegime,
      environment: record.environment,
      encryptedKeys: record.encryptedKeys,
      updatedAt: record.updatedAt,
    });
  }
}
