import { subconsciousQueue } from './subconscious-worker';

export class ZccScheduler {
  static async start() {
    try {
      console.log('⏰ [ZccScheduler] Inicializando agendador de repeatable jobs (BullMQ)...');
      
      // 1. Agendar auto-correção do sistema (HEAL_SYSTEM) a cada 5 minutos
      await subconsciousQueue.add(
        'HEAL_SYSTEM',
        { type: 'HEAL_SYSTEM' },
        {
          repeat: { pattern: '*/5 * * * *' },
          jobId: 'heal-system-job',
        }
      );
      console.log('✅ [ZccScheduler] Agendada tarefa HEAL_SYSTEM (a cada 5 minutos)');

      // 2. Agendar verificação de trials expirando (CHECK_TRIALS) a cada hora
      await subconsciousQueue.add(
        'CHECK_TRIALS',
        { type: 'CHECK_TRIALS' },
        {
          repeat: { pattern: '0 * * * *' },
          jobId: 'check-trials-job',
        }
      );
      console.log('✅ [ZccScheduler] Agendada tarefa CHECK_TRIALS (a cada hora)');
    } catch (error) {
      console.error('❌ [ZccScheduler] Erro ao registrar tarefas agendadas:', error);
    }
  }
}
