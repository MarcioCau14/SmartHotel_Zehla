import { describe, it, expect, vi, beforeEach } from 'vitest';
import { EvaluateReadinessUseCase } from '../../../src/application/readiness/use-cases/EvaluateReadinessUseCase';
import { ICRMRepositoryPort } from '../../../src/domain/crm/ports/ICRMRepositoryPort';
import { LeadProfile } from '../../../src/domain/crm/models/LeadProfile';
import { Result } from '../../../src/shared/Result';

// Mock playbookQueue
vi.mock('../../../src/lib/queues', () => ({
  playbookQueue: {
    add: vi.fn().mockResolvedValue({ id: 'playbook_job_id' }),
  },
}));

class FakeCRMRepository implements ICRMRepositoryPort {
  public leads: Map<string, LeadProfile> = new Map();
  public savedLeads: LeadProfile[] = [];

  async buscarLeadPorPropriedade(propriedadeId: string): Promise<Result<LeadProfile | null, Error>> {
    for (const lead of this.leads.values()) {
      if (lead.propriedadeId === propriedadeId) {
        return Result.ok(lead);
      }
    }
    return Result.ok(null);
  }

  async salvarLead(lead: LeadProfile): Promise<Result<LeadProfile, Error>> {
    this.leads.set(lead.id, lead);
    this.savedLeads.push(lead);
    return Result.ok(lead);
  }

  async buscarLeadPorId(id: string): Promise<Result<LeadProfile | null, Error>> {
    return Result.ok(this.leads.get(id) || null);
  }

  async buscarLeadPorTelefone(telefone: string): Promise<Result<LeadProfile | null, Error>> {
    return Result.ok(null);
  }

  async listarLeadsPorStage(): Promise<Result<LeadProfile[], Error>> {
    return Result.ok([]);
  }

  async registrarInteracao(): Promise<Result<any, Error>> {
    return Result.ok({});
  }

  async listarInteracoesPorLead(): Promise<Result<any[], Error>> {
    return Result.ok([]);
  }

  async atualizarStage(): Promise<Result<LeadProfile, Error>> {
    return Result.fail(new Error('Not implemented'));
  }

  async atualizarLead(lead: LeadProfile): Promise<Result<LeadProfile, Error>> {
    return this.salvarLead(lead);
  }
}

describe('EvaluateReadinessUseCase Unit Tests', () => {
  let fakeRepo: FakeCRMRepository;
  let useCase: EvaluateReadinessUseCase;

  beforeEach(() => {
    fakeRepo = new FakeCRMRepository();
    useCase = new EvaluateReadinessUseCase(fakeRepo);
    vi.clearAllMocks();
  });

  it('should successfully execute evaluation, persist to repo, and enqueue playbook job', async () => {
    const input = {
      propertyId: 'prop_abc123',
      answers: {
        hasPMS: true,
        hasChannelManager: true,
        hasBookingEngine: true,
        hasWhatsAppAutomation: true,
        hasReviewAutomation: false,
        hasConsolidatedDatabase: true,
        hasHistoricalData: false,
        teamOpenToAI: true,
        teamTrained: false,
        hasLgpdConsent: true,
        hasLgpdDeletionProcess: true,
        hasSecureDataStorage: true,
        propertyName: 'Pousada Teste'
      },
      roiInput: {
        roomsCount: 15,
        averageDailyRate: 250,
        currentOccupancy: 60,
        staffAverageHourlyRate: 20
      }
    };

    const result = await useCase.execute(input);
    expect(result.isOk).toBe(true);

    const output = result.value;
    expect(output.assessment.score).toBe(75); // PMS(15) + CM(15) + BE(10) + WA(15) + DB(10) + teamOpenToAI(10) = 75
    expect(output.assessment.category).toBe('Brains');
    expect(output.roi.occupancyBoostPercent).toBe(8.0);
    expect(output.recommendations.length).toBeGreaterThan(0);

    expect(fakeRepo.savedLeads.length).toBe(1);
    const saved = fakeRepo.savedLeads[0];
    expect(saved.propriedadeId).toBe('prop_abc123');
    expect(saved.readinessScore).toBe(75);
    expect(saved.lgpdRiskLevel).toBe('LOW');
    expect(JSON.parse(saved.roiEstimation || '{}')).toEqual(output.roi);

    // Verify BullMQ job enqueued
    const { playbookQueue } = await import('../../../src/lib/queues');
    expect(playbookQueue.add).toHaveBeenCalledWith('generate-playbook', {
      propertyId: 'prop_abc123',
      assessment: output.assessment,
      roi: output.roi,
      recommendations: output.recommendations
    });
  });
});
