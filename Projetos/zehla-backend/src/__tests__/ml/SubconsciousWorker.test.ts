import { describe, it, expect, vi, beforeEach } from 'vitest';
import { prisma } from '@/lib/prisma';

// Mock do prisma para o CognitiveTerminal
vi.mock('@/lib/prisma', () => ({
  prisma: {
    cognitiveTerminalLog: {
      create: vi.fn().mockResolvedValue({ id: 'log-123' }),
    },
  },
}));

// Mock do IORedis usando vi.hoisted para evitar ReferenceError
const { mockKeys, mockGet, mockOn, mockPing, MockRedis } = vi.hoisted(() => {
  const mockKeys = vi.fn();
  const mockGet = vi.fn();
  const mockOn = vi.fn();
  const mockPing = vi.fn().mockResolvedValue('PONG');

  class MockRedis {
    keys = mockKeys;
    get = mockGet;
    on = mockOn;
    ping = mockPing;
  }

  return { mockKeys, mockGet, mockOn, mockPing, MockRedis };
});

vi.mock('ioredis', () => {
  return {
    default: MockRedis
  };
});

// Importar o worker (isso vai disparar o construtor do IORedis mockado)
import { subconsciousWorker } from '../../lib/ml/subconscious-worker';

describe('Subconscious Worker — DISPATCH_FINOPS_REPORT', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('deve coletar custos diários dos inquilinos no Redis e registrar relatórios de FinOps', async () => {
    const yesterday = new Date();
    yesterday.setUTCDate(yesterday.getUTCDate() - 1);
    const dateStr = yesterday.toISOString().split('T')[0];

    // Simular chaves encontradas no Redis
    mockKeys.mockResolvedValue([
      `finops:cost:tenant-a:${dateStr}`,
      `finops:cost:tenant-b:${dateStr}`,
    ]);

    // Simular valores de custo
    mockGet.mockImplementation((key: string) => {
      if (key.includes('tenant-a')) return Promise.resolve('4.5200');
      if (key.includes('tenant-b')) return Promise.resolve('0.1250');
      return Promise.resolve(null);
    });

    const handler = (subconsciousWorker as any).processFn;
    const mockJob: any = { id: 'job-999', data: { type: 'DISPATCH_FINOPS_REPORT' } };

    await handler(mockJob);

    // Deve registrar logs individuais para cada inquilino no CognitiveTerminal (que chama prisma.cognitiveTerminalLog.create)
    expect(prisma.cognitiveTerminalLog.create).toHaveBeenCalled();

    // Deve ter chamado create pelo menos 3 vezes (2 para tenants + 1 para o resumo geral)
    const calls = (prisma.cognitiveTerminalLog.create as any).mock.calls;
    expect(calls.length).toBeGreaterThanOrEqual(3);

    // Verificar se o primeiro log individual tem o tenant e valor corretos
    const firstTenantLog = calls.find((c: any) => c[0].data.message.includes('Inquilino tenant-a'));
    expect(firstTenantLog).toBeDefined();
    expect(firstTenantLog[0].data.level).toBe('success');
    expect(firstTenantLog[0].data.source).toBe('FINOPS');
    expect(firstTenantLog[0].data.propertyId).toBe('tenant-a');
    expect(firstTenantLog[0].data.metadata.cost).toBe(4.52);

    // Verificar se o log de resumo consolidado geral foi gravado
    const summaryLog = calls.find((c: any) => c[0].data.message.includes('Relatório diário de consumo de IA enviado com sucesso'));
    expect(summaryLog).toBeDefined();
    expect(summaryLog[0].data.metadata.totalTenantsReported).toBe(2);
    expect(summaryLog[0].data.metadata.totalCostReported).toBe(4.645); // 4.52 + 0.125
  });
});
