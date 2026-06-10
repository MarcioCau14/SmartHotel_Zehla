import { IDomainEventHandler } from '../../../domain/shared/events/IDomainEventHandler';
import { DomainEvent } from '../../../domain/shared/DomainEvent';
import { Queue } from 'bullmq';

export class PlaybookGeneratedEventHandler implements IDomainEventHandler {
  constructor(private readonly followupQueue: Queue) {}

  async handle(event: DomainEvent): Promise<void> {
    if (event.eventName !== 'PlaybookGeneratedEvent') {
      return;
    }

    const leadId = event.aggregateId;
    const { score, category, lgpdRisk, playbookUrl } = event.payload;

    console.log(`[Event Handler] Playbook gerado para Lead ${leadId}. Agendando follow-up.`);

    // 1. Regra de Negócio: 2 horas de intervalo base (7.200.000 ms)
    const baseDelayMs = 2 * 60 * 60 * 1000;

    // 2. Pragmatismo Anti-Ban: Ruído Gaussiano para simular comportamento humano (Box-Muller transform)
    // Retorna um atraso entre 30s e 5min para adicionar na base do tempo
    const gaussianJitterMs = this.calculateGaussianDelay();
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
        },
      },
      {
        delay: safeDelayMs,
        attempts: 3,
        backoff: { type: 'exponential', delay: 10000 },
      }
    );
  }

  private calculateGaussianDelay(): number {
    // Implementação Box-Muller para gerar atrasos não-lineares
    let u1 = 0;
    let u2 = 0;
    while (u1 === 0) u1 = Math.random();
    while (u2 === 0) u2 = Math.random();
    const z0 = Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2.0 * Math.PI * u2);
    // Retorna um atraso entre 30s e 5min (com média em torno de 150s e desvio padrão de 50s)
    return Math.max(30000, Math.min(300000, Math.floor(150000 + z0 * 50000)));
  }
}
