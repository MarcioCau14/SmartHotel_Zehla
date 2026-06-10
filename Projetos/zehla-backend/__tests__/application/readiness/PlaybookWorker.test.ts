import { describe, it, expect, vi, beforeEach } from 'vitest';
import { handlePlaybookJob } from '../../../src/lib/workers/playbook-worker';
import { LeadProfile } from '../../../src/domain/crm/models/LeadProfile';
import { CRMPipelineStage } from '../../../src/domain/crm/models/CRMPipelineStage';
import { Result } from '../../../src/shared/Result';
import { Job } from 'bullmq';

// Declare fs mocks at module scope
const mockMkdir = vi.fn().mockResolvedValue(undefined);
const mockWriteFile = vi.fn().mockResolvedValue(undefined);

vi.mock('fs/promises', () => ({
  default: {
    mkdir: (...args: any[]) => mockMkdir(...args),
    writeFile: (...args: any[]) => mockWriteFile(...args),
  }
}));

// Mock @/lib/prisma
vi.mock('../../../src/lib/prisma', () => ({
  prisma: {
    property: {
      findUnique: vi.fn().mockResolvedValue({
        id: 'prop_worker_test',
        configJson: {},
      }),
      update: vi.fn().mockResolvedValue({}),
    },
  },
}));

// Mock class methods as spy/mock functions
const mockBuscarLeadPorPropriedade = vi.fn();
const mockSalvarLead = vi.fn();
const mockRegistrarInteracao = vi.fn();

vi.mock('../../../src/infrastructure/persistence/crm/PrismaCRMRepository', () => {
  return {
    PrismaCRMRepository: class {
      buscarLeadPorPropriedade = mockBuscarLeadPorPropriedade;
      salvarLead = mockSalvarLead;
      registrarInteracao = mockRegistrarInteracao;
    }
  };
});

const mockPublish = vi.fn();

vi.mock('../../../src/infrastructure/events/ConsoleEventBus', () => {
  return {
    ConsoleEventBus: class {
      publish = mockPublish;
    }
  };
});

describe('PlaybookWorker Integration/Unit Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should generate playbook, update property config, update crm lead to QUALIFICACAO and dispatch PlaybookGeneratedEvent', async () => {
    const job = {
      data: {
        propertyId: 'prop_worker_test',
        assessment: {
          score: 85,
          category: 'Brains',
          lgpdRisk: 'LOW',
          propertyName: 'Hotel Beira Mar',
          evaluatedAt: new Date(),
          recommendations: [],
        },
        roi: {
          occupancyBoostPercent: 8.0,
          occupancyRevenueGain: 1500,
          otaCommissionSavings: 450,
          staffTimeSavedHours: 20,
          staffCostSavings: 400,
          totalMonthlyGain: 2350,
          totalYearlyGain: 28200,
        },
        recommendations: [
          {
            agentName: 'Zé-Sales',
            priority: 'HIGH',
            description: 'High occupancy rates require better conversion engines',
            estimatedRoiMultiplier: 2.5,
          }
        ]
      }
    } as unknown as Job;

    // Create a mock lead in ENTRADA stage
    const lead = LeadProfile.create({
      id: 'lead_worker_01',
      nome: 'Hotel Beira Mar',
      telefone: '5511999999999',
      canalOrigem: 'website',
      ltvScore: 75,
      stage: CRMPipelineStage.ENTRADA,
      createdAt: new Date(),
      propriedadeId: 'prop_worker_test',
    }).value as LeadProfile;

    // Set mock responses
    mockBuscarLeadPorPropriedade.mockResolvedValue(Result.ok(lead));
    mockSalvarLead.mockResolvedValue(Result.ok(lead));
    mockRegistrarInteracao.mockResolvedValue(Result.ok({}));
    mockPublish.mockResolvedValue(undefined);

    // Run processor
    const result = await handlePlaybookJob(job);
    expect(result.status).toBe('COMPLETED');
    expect(result.playbookUrl).toBe('/playbooks/playbook_prop_worker_test.md');

    // Verify fs/promises mock was called
    expect(mockWriteFile).toHaveBeenCalled();

    // Verify lead was updated to QUALIFICACAO and saved
    expect(mockSalvarLead).toHaveBeenCalled();
    const savedLead = mockSalvarLead.mock.calls[0][0] as LeadProfile;
    expect(savedLead.stage).toBe(CRMPipelineStage.QUALIFICACAO);
    expect(savedLead.readinessScore).toBe(85);
    expect(savedLead.lgpdRiskLevel).toBe('LOW');

    // Verify interaction was registered
    expect(mockRegistrarInteracao).toHaveBeenCalled();

    // Verify PlaybookGeneratedEvent was dispatched via EventBus
    expect(mockPublish).toHaveBeenCalled();
    const dispatchedEvent = mockPublish.mock.calls[0][0];
    expect(dispatchedEvent.eventName).toBe('PlaybookGeneratedEvent');
    expect(dispatchedEvent.aggregateId).toBe('lead_worker_01');
    expect(dispatchedEvent.payload.score).toBe(85);
    expect(dispatchedEvent.payload.category).toBe('Brains');
    expect(dispatchedEvent.payload.lgpdRisk).toBe('LOW');
  });
});
