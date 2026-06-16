import { describe, it, expect, beforeEach } from 'vitest';
import { TaxProfile } from '../../domain/financeiro/entities/TaxProfile';
import { AtualizarPerfilFiscalUseCase } from '../../application/financeiro/use-cases/AtualizarPerfilFiscalUseCase';
import { ITaxProfileRepository } from '../../application/financeiro/ports/ITaxProfileRepository';

class InMemoryTaxProfileRepository implements ITaxProfileRepository {
  private profiles: Map<string, TaxProfile> = new Map();

  async save(taxProfile: TaxProfile): Promise<void> {
    this.profiles.set(taxProfile.propertyId, taxProfile);
  }

  async findByPropertyId(propertyId: string): Promise<TaxProfile | null> {
    return this.profiles.get(propertyId) || null;
  }
}

describe('TaxProfile Domain & Use Case', () => {
  let repository: InMemoryTaxProfileRepository;
  let useCase: AtualizarPerfilFiscalUseCase;

  beforeEach(() => {
    repository = new InMemoryTaxProfileRepository();
    useCase = new AtualizarPerfilFiscalUseCase(repository);
  });

  it('should create and validate a TaxProfile domain entity successfully', () => {
    const result = TaxProfile.create({
      id: 'tax_123',
      propertyId: 'prop_abc',
      cnpj: '12.345.678/0001-90',
      razaoSocial: 'Smart Hotel S/A',
      inscricaoEstadual: 'ISENTO',
      inscricaoMunicipal: '445566',
      taxRegime: 'SIMPLES_NACIONAL',
      environment: 'Sandbox',
      encryptedKeys: 'my-keys-hash',
    });

    expect(result.isOk).toBe(true);
    const profile = result.value;
    expect(profile.id).toBe('tax_123');
    expect(profile.cnpj).toBe('12.345.678/0001-90');
    expect(profile.taxRegime).toBe('SIMPLES_NACIONAL');
    expect(profile.environment).toBe('Sandbox');
  });

  it('should fail creation if mandatory fields are missing', () => {
    const result = TaxProfile.create({
      id: 'tax_123',
      propertyId: 'prop_abc',
      cnpj: '',
      razaoSocial: 'Smart Hotel S/A',
      inscricaoEstadual: null,
      inscricaoMunicipal: null,
      taxRegime: 'SIMPLES_NACIONAL',
      environment: 'Sandbox',
      encryptedKeys: null,
    });

    expect(result.isFail).toBe(true);
    expect(result.error.message).toBe('CNPJ_OBRIGATORIO');
  });

  it('should execute AtualizarPerfilFiscalUseCase successfully', async () => {
    const input = {
      propertyId: 'prop_123',
      cnpj: '99.888.777/0001-66',
      razaoSocial: 'Pousada Flor de Sal LTDA',
      taxRegime: 'SIMPLES_NACIONAL',
      environment: 'Production',
    };

    const result = await useCase.execute(input);
    expect(result.isOk).toBe(true);
    expect(result.value.propertyId).toBe('prop_123');
    expect(result.value.cnpj).toBe('99.888.777/0001-66');

    // Verify it was persisted
    const persisted = await repository.findByPropertyId('prop_123');
    expect(persisted).not.toBeNull();
    expect(persisted?.razaoSocial).toBe('Pousada Flor de Sal LTDA');
  });
});
