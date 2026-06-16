import { Worker, Job } from 'bullmq';
import { getBasePrisma } from '../lib/prisma';
import { QUEUE_NAMES, slaAlertsQueue } from '../lib/queues';
import { redisWorker } from '../lib/redis';
import { PrismaTarefaRepository } from '../infrastructure/persistence/operacional/PrismaTarefaRepository';
import { PrismaSlaRepository } from '../infrastructure/persistence/operacional/PrismaSlaRepository';
import { sendWhatsAppAlert } from '../lib/notifications';

// src/workers/slaAlertsWorker.ts — ZEHLA Brain v4: SLA Check Worker
// Verifica se há tarefas atrasadas ou próximas ao limite do SLA e notifica via WhatsApp / SystemLog

const prisma = getBasePrisma();

export async function processSlaAlertsJob(job: Job): Promise<{ success: boolean; alertsSent?: number }> {
  if (job.name === 'CHECK_SLA') {
    console.log(`[SLA Alerts Worker] Iniciando verificação de SLAs às ${new Date().toISOString()}`);

    try {
      const properties = await prisma.property.findMany({
        where: { status: 'ACTIVE' },
      });

      let alertsSent = 0;

      for (const prop of properties) {
        const tarefaRepo = new PrismaTarefaRepository(prisma, prop.id);
        const slaRepo = new PrismaSlaRepository(prisma, prop.id);

        const tasksResult = await tarefaRepo.listarTarefasPorPropriedade(prop.id, {
          status: ['pendente', 'em_andamento', 'bloqueada'],
        });
        if (tasksResult.isFail) continue;
        const tasks = tasksResult.value || [];

        const slasResult = await slaRepo.listarAtivos();
        if (slasResult.isFail) continue;
        const slas = slasResult.value || [];

        for (const task of tasks) {
          const sla = slas.find(
            (s) => s.tipoTarefa === task.tipo && s.prioridade.value === task.prioridade.value
          );

          // Calcula o limite do SLA
          const dataLimite = task.dataLimite || (sla ? sla.calcularDataLimite(task.dataCriacao) : undefined);
          if (!dataLimite) continue;

          const now = new Date();
          const isOverdue = now > dataLimite;
          
          // Calcula o limite de alerta em minutos (ex: 80% do tempo do SLA)
          const limiteAlertaMinutos = sla ? sla.limiteDeAlerta : 0.8 * 60; // fallback para 80% de 1 hora
          const limiteAlertaMs = limiteAlertaMinutos * 60 * 1000;
          const tempoDecorridoMs = now.getTime() - task.dataCriacao.getTime();
          const isNearBreach = !isOverdue && tempoDecorridoMs >= limiteAlertaMs;

          if (isOverdue) {
            const key = `sla_alert_sent:${task.id}:overdue`;
            const alreadySent = await redisWorker.get(key);

            if (!alreadySent) {
              const message = `⚠️ [ALERTA SLA - ATRASADA] A tarefa "${task.titulo}" (ID: ${task.id}, Prioridade: ${task.prioridade.value}) na pousada ${prop.name} ultrapassou o limite do SLA!`;
              await sendWhatsAppAlert(message);
              
              await prisma.systemLog.create({
                data: {
                  level: 'ERROR',
                  component: 'ZE-OPS',
                  message,
                  metadata: JSON.stringify({
                    taskId: task.id,
                    propertyId: prop.id,
                    delayMinutes: Math.round((now.getTime() - dataLimite.getTime()) / 60000),
                  }),
                },
              });

              await redisWorker.setex(key, 86400, 'true'); // Cache de 24h
              alertsSent++;
            }
          } else if (isNearBreach) {
            const key = `sla_alert_sent:${task.id}:near-breach`;
            const alreadySent = await redisWorker.get(key);

            if (!alreadySent) {
              const message = `⏰ [ALERTA SLA - PRÓXIMO DO LIMITE] A tarefa "${task.titulo}" (ID: ${task.id}, Prioridade: ${task.prioridade.value}) na pousada ${prop.name} atingiu seu limite de alerta do SLA!`;
              await sendWhatsAppAlert(message);

              await prisma.systemLog.create({
                data: {
                  level: 'WARN',
                  component: 'ZE-OPS',
                  message,
                  metadata: JSON.stringify({
                    taskId: task.id,
                    propertyId: prop.id,
                  }),
                },
              });

              await redisWorker.setex(key, 86400, 'true'); // Cache de 24h
              alertsSent++;
            }
          }
        }
      }

      console.log(`[SLA Alerts Worker] Sucesso: Verificação concluída. ${alertsSent} alerta(s) emitido(s).`);
      return { success: true, alertsSent };
    } catch (err: any) {
      console.error('[SLA Alerts Worker] Erro ao executar verificação de SLA:', err.message);
      throw err;
    }
  }

  return { success: false };
}

export const slaAlertsWorker = new Worker(
  QUEUE_NAMES.SLA_ALERTS,
  processSlaAlertsJob,
  {
    connection: redisWorker,
    concurrency: 1,
  }
);

slaAlertsWorker.on('failed', (job, err) => {
  console.error(`[SLA Alerts Worker] Job ${job?.id} falhou:`, err.message);
});

// Agendamento automático (Roda de hora em hora)
export async function scheduleSlaCheck(): Promise<void> {
  try {
    const jobs = await slaAlertsQueue.getRepeatableJobs();

    // Remove jobs repetidos existentes para evitar duplicados
    for (const job of jobs) {
      await slaAlertsQueue.removeRepeatableByKey(job.key);
    }

    await slaAlertsQueue.add(
      'CHECK_SLA',
      {},
      {
        repeat: {
          pattern: '0 * * * *', // De hora em hora
        },
      }
    );

    console.log('✅ [SLA Alerts Worker] Cron de SLA agendado com sucesso (de hora em hora).');
  } catch (err: any) {
    console.error('❌ [SLA Alerts Worker] Falha ao agendar cron:', err.message);
  }
}

// Inicia o agendamento automaticamente caso o ambiente permita
if (process.env.START_WORKERS === 'true' || process.env.NODE_ENV === 'production') {
  scheduleSlaCheck();
}
