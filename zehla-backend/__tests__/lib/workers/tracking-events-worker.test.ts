import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Result } from '../../../src/shared/Result';
import { Lead } from '../../../src/domain/comercial/entities/Lead';
import { Canal } from '../../../src/domain/comercial/value-objects/Canal';
import { Score } from '../../../src/domain/comercial/value-objects/Score';

const mockBuscarLeadPorId = vi.fn();
const mockAtualizarLead = vi.fn();

vi.mock('../../../src/infrastructure/persistence/comercial/PrismaLeadRepository', () => {
  return {
    PrismaLeadRepository: class {
      buscarLeadPorId = (...args: any[]) => mockBuscarLeadPorId(...args);
      atualizarLead = (...args: any[]) => mockAtualizarLead(...args);
    }
  };
});

// Importamos a função de processamento após registrar o mock do repositório
import { processDeliveryStatusJob } from '../../../src/lib/workers/tracking-events-worker';

const createTestLead = (scoreVal = 10, status: any = 'prospect') => {
  const canal = Canal.criar('WHATSAPP').value;
  const score = Score.criar(scoreVal).value;
  return Lead.create({
    id: 'test-lead-id',
    canal,
    propriedadeId: 'test-prop-id',
    dataCaptura: new Date(),
    nome: 'João Silva',
    score,
    status
  }).value;
};

describe('processDeliveryStatusJob', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('deve processar o job de status de entrega com sucesso', async () => {
    const lead = createTestLead(10, 'prospect');
    mockBuscarLeadPorId.mockResolvedValue(Result.ok(lead));
    mockAtualizarLead.mockResolvedValue(Result.ok(lead));

    const job = {
      data: {
        leadId: 'test-lead-id',
        status: 'READ',
        propriedadeId: 'test-prop-id'
      }
    } as any;

    const result = await processDeliveryStatusJob(job);
    expect(result.success).toBe(true);
    expect(result.leadId).toBe('test-lead-id');

    expect(mockBuscarLeadPorId).toHaveBeenCalledWith('test-lead-id', 'test-prop-id');
    expect(mockAtualizarLead).toHaveBeenCalled();
  });
});
