import { describe, it, expect, vi, beforeEach } from 'vitest';
import { TaxProfile } from '../../domain/financeiro/entities/TaxProfile';
import { AtualizarPerfilFiscalUseCase } from '../../application/financeiro/use-cases/AtualizarPerfilFiscalUseCase';
import { ITaxProfileRepositoryPort } from '../../domain/financeiro/ports/ITaxProfileRepositoryPort';

// 1. Mock do Repositório
class InMemoryTaxProfileRepository implements ITaxProfileRepositoryPort {
  private profiles = new Map<string, TaxProfile>();

  async findByPropertyId(propertyId: string): Promise<TaxProfile | null> {
    return this.profiles.get(propertyId) || null;
  }

  async save(profile: TaxProfile): Promise<void> {
    this.profiles.set(profile.propertyId, profile);
  }

  // Helper de teste
  clear() {
    this.profiles.clear();
  }
}

// 2. Mocks de Borda / Next/Prisma
vi.mock('@/lib/security/tenant-context', () => ({
  getTenantId: vi.fn(async () => 'pousada-test-123'),
}));

vi.mock('@/lib/prisma', () => {
  return {
    prisma: {
      tax_profiles: {
        findUnique: vi.fn(),
        upsert: vi.fn(),
      },
    },
  };
});

import { GET, POST } from '../../app/api/zcc/tax-profile/route';
import { NextRequest } from 'next/server';
import { getTenantId } from '@/lib/security/tenant-context';

describe('TaxProfile Domain Entity & Invariants', () => {
  it('deve instanciar com sucesso um perfil fiscal válido', () => {
    const res = TaxProfile.create({
      id: 'tp-1',
      propertyId: 'p-1',
      cnpj: '12345678000190',
      razaoSocial: 'Pousada Rosa Sul Ltda',
      nomeFantasia: 'Pousada Rosa Sul',
      inscricaoMunicipal: '123456',
      inscricaoEstadual: '789012',
      regimeTributario: 'SIMPLES_NACIONAL',
      codigoAtividade: '55.10-8-01',
      certificadoDigital: null,
      enderecoCompleto: null,
      emailNF: 'financeiro@rosasul.com.br',
      telefoneNF: '4833556677',
      autoEmissaoNF: true,
      tipoNFS: 'NFS_E',
      provedorNF: 'FocusNFe',
      chaveAPIProvedor: 'token_api_123',
      ambienteEmissao: 'HOMOLOGACAO',
    });

    expect(res.isOk).toBe(true);
    expect(res.value.cnpj).toBe('12345678000190');
    expect(res.value.razaoSocial).toBe('Pousada Rosa Sul Ltda');
  });

  it('deve rejeitar se o CNPJ não possuir exatamente 14 dígitos', () => {
    const res = TaxProfile.create({
      id: 'tp-1',
      propertyId: 'p-1',
      cnpj: '1234567', // cnpj inválido
      razaoSocial: 'Pousada Rosa Sul Ltda',
      nomeFantasia: 'Pousada Rosa Sul',
      inscricaoMunicipal: '123456',
      inscricaoEstadual: '789012',
      regimeTributario: 'SIMPLES_NACIONAL',
      codigoAtividade: '55.10-8-01',
      certificadoDigital: null,
      enderecoCompleto: null,
      emailNF: 'financeiro@rosasul.com.br',
      telefoneNF: '4833556677',
      autoEmissaoNF: true,
      tipoNFS: 'NFS_E',
      provedorNF: 'FocusNFe',
      chaveAPIProvedor: 'token_api_123',
      ambienteEmissao: 'HOMOLOGACAO',
    });

    expect(res.isFail).toBe(true);
    expect(res.error).toContain('CNPJ deve conter exatamente 14 dígitos');
  });

  it('deve permitir CNPJ nulo para fins de onboarding parcial', () => {
    const res = TaxProfile.create({
      id: 'tp-1',
      propertyId: 'p-1',
      cnpj: null,
      razaoSocial: null,
      nomeFantasia: null,
      inscricaoMunicipal: null,
      inscricaoEstadual: null,
      regimeTributario: 'SIMPLES_NACIONAL',
      codigoAtividade: null,
      certificadoDigital: null,
      enderecoCompleto: null,
      emailNF: null,
      telefoneNF: null,
      autoEmissaoNF: false,
      tipoNFS: 'NFS_E',
      provedorNF: null,
      chaveAPIProvedor: null,
      ambienteEmissao: 'HOMOLOGACAO',
    });

    expect(res.isOk).toBe(true);
    expect(res.value.cnpj).toBeNull();
  });
});

describe('AtualizarPerfilFiscalUseCase', () => {
  let repo: InMemoryTaxProfileRepository;
  let useCase: AtualizarPerfilFiscalUseCase;

  beforeEach(() => {
    repo = new InMemoryTaxProfileRepository();
    useCase = new AtualizarPerfilFiscalUseCase(repo);
  });

  it('deve criar um novo perfil fiscal se não existir', async () => {
    const res = await useCase.execute({
      propertyId: 'pousada-test-123',
      cnpj: '12345678000190',
      razaoSocial: 'Pousada Teste S/A',
      nomeFantasia: 'Pousada Teste',
      inscricaoMunicipal: '9999',
      inscricaoEstadual: '8888',
    });

    expect(res.isOk).toBe(true);
    expect(res.value.id).toBeDefined();
    expect(res.value.propertyId).toBe('pousada-test-123');
    expect(res.value.razaoSocial).toBe('Pousada Teste S/A');

    const saved = await repo.findByPropertyId('pousada-test-123');
    expect(saved).not.toBeNull();
    expect(saved?.razaoSocial).toBe('Pousada Teste S/A');
  });

  it('deve atualizar o perfil existente mantendo o ID', async () => {
    // 1. Criar perfil inicial
    const firstRes = await useCase.execute({
      propertyId: 'pousada-test-123',
      cnpj: '12345678000190',
      razaoSocial: 'Pousada Teste S/A',
      nomeFantasia: 'Pousada Teste',
      inscricaoMunicipal: '9999',
      inscricaoEstadual: '8888',
    });
    expect(firstRes.isOk).toBe(true);
    const initialId = firstRes.value.id;

    // 2. Atualizar razão social
    const secondRes = await useCase.execute({
      propertyId: 'pousada-test-123',
      cnpj: '12345678000190',
      razaoSocial: 'Razão Social Editada Ltda',
      nomeFantasia: 'Pousada Teste',
      inscricaoMunicipal: '9999',
      inscricaoEstadual: '8888',
    });

    expect(secondRes.isOk).toBe(true);
    expect(secondRes.value.id).toBe(initialId);
    expect(secondRes.value.razaoSocial).toBe('Razão Social Editada Ltda');
  });
});

describe('TaxProfile API Routes (HTTP Controllers)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('deve retornar 401 se a requisição GET não tiver tenant autenticado', async () => {
    vi.mocked(getTenantId).mockResolvedValueOnce(null as any);
    const req = new NextRequest('http://localhost/api/zcc/tax-profile');
    const res = await GET(req);
    expect(res.status).toBe(401);
  });

  it('deve retornar 401 se a requisição POST não tiver tenant autenticado', async () => {
    vi.mocked(getTenantId).mockResolvedValueOnce(null as any);
    const req = new NextRequest('http://localhost/api/zcc/tax-profile', {
      method: 'POST',
      body: JSON.stringify({ cnpj: '12345678000190' }),
    });
    const res = await POST(req);
    expect(res.status).toBe(401);
  });
});
