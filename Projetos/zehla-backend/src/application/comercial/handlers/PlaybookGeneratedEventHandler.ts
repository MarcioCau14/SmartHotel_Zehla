import { IDomainEventHandler } from '../../../domain/shared/events/IDomainEventHandler';
import { DomainEvent } from '../../../domain/shared/DomainEvent';
import { Queue } from 'bullmq';
import { GaussianDelayCalculator } from '../../../infrastructure/scraping/GaussianDelayCalculator';

export class PlaybookGeneratedEventHandler implements IDomainEventHandler {
  private readonly delayCalculator = new GaussianDelayCalculator();

  constructor(private readonly followupQueue: Queue) {}

  async handle(event: DomainEvent): Promise<void> {
    if (event.eventName !== 'PlaybookGeneratedEvent') {
      return;
    }

    const leadId = event.aggregateId;
    const { score, category, lgpdRisk, playbookUrl, roiSavings } = event.payload;

    console.log(`[Event Handler] Playbook gerado para Lead ${leadId}. Agendando follow-up.`);

    // 1. Regra de Negócio: 2 horas de intervalo base (7.200.000 ms)
    const baseDelayMs = 2 * 60 * 60 * 1000;

    // 2. Pragmatismo Anti-Ban: Ruído Gaussiano usando GaussianDelayCalculator (5s a 45s)
    const gaussianJitterMs = this.delayCalculator.sample();
    const safeDelayMs = baseDelayMs + gaussianJitterMs;

    // 3. Enfileiramento Seguro no BullMQ
    await this.followupQueue.add(
      'DispatchFollowUp',
      {
        leadId,
        cadenceType: 'ENGAJAMENTO',
        roiData: {
          score,
          category,
          lgpdRisk,
          playbookUrl,
          roiSavings: roiSavings || 0,
        },
      },
      {
        delay: safeDelayMs,
        attempts: 3,
        backoff: { type: 'exponential', delay: 10000 },
      }
    );
  }
}
