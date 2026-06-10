import { Worker, Job } from 'bullmq';
import { redisWorker } from '@/lib/redis';
import { prisma } from '@/lib/prisma';
import { PlaybookGenerator } from '@/domain/readiness/entities/PlaybookGenerator';
import { PrismaCRMRepository } from '@/infrastructure/persistence/crm/PrismaCRMRepository';
import { InteractionRecord } from '@/domain/crm/models/InteractionRecord';
import { CRMPipelineStage } from '@/domain/crm/models/CRMPipelineStage';
import { ConsoleEventBus } from '@/infrastructure/events/ConsoleEventBus';
import { PlaybookGeneratedEvent } from '@/domain/comercial/events/ComercialDomainEvents';
import fs from 'fs/promises';
import path from 'path';

export const handlePlaybookJob = async (job: Job) => {
  const { propertyId, assessment, roi, recommendations } = job.data;
  console.log(`🌙 [PLAYBOOK WORKER] Iniciando geração de playbook para a propriedade ${propertyId}...`);

  try {
    const playbookResult = PlaybookGenerator.generate(assessment, roi, recommendations);
    if (playbookResult.isFail) {
      throw playbookResult.error;
    }
    const playbook = playbookResult.value;

    const playbooksDir = path.join(process.cwd(), 'public', 'playbooks');
    await fs.mkdir(playbooksDir, { recursive: true });

    const fileName = `playbook_${propertyId}.md`;
    const filePath = path.join(playbooksDir, fileName);
    await fs.writeFile(filePath, playbook.markdown, 'utf-8');

    console.log(`✅ [PLAYBOOK WORKER] Playbook gerado com sucesso em ${filePath}`);

    // Atualiza Property configJson
    const property = await prisma.property.findUnique({
      where: { id: propertyId }
    });

    const currentConfig = property?.configJson ? (property.configJson as Record<string, any>) : {};
    const newConfig = {
      ...currentConfig,
      playbookUrl: `/playbooks/${fileName}`,
      playbookGeneratedAt: playbook.generatedAt.toISOString(),
      readinessScore: assessment.score,
      lgpdRisk: assessment.lgpdRisk,
    };

    await prisma.property.update({
      where: { id: propertyId },
      data: { configJson: newConfig }
    });

    console.log(`✅ [PLAYBOOK WORKER] Propriedade ${propertyId} atualizada no banco com o novo Playbook.`);

    // --- CRM Lead Score & Stage Transition ---
    try {
      const crmRepo = new PrismaCRMRepository();
      const leadResult = await crmRepo.buscarLeadPorPropriedade(propertyId);
      if (leadResult.isOk && leadResult.value) {
        let lead = leadResult.value;
        console.log(`🌙 [PLAYBOOK WORKER] Lead encontrado no CRM para a propriedade ${propertyId}. Status atual: ${lead.stage}`);

        // Update score and readiness data
        const updatedLeadResult = lead.withReadiness(
          assessment.score,
          assessment.lgpdRisk,
          JSON.stringify(roi)
        );

        if (updatedLeadResult.isOk) {
          let updatedLead = updatedLeadResult.value;

          // Transition to QUALIFICACAO automatically if currently in ENTRADA
          if (lead.stage === CRMPipelineStage.ENTRADA) {
            const transitionedResult = updatedLead.withStage(CRMPipelineStage.QUALIFICACAO);
            if (transitionedResult.isOk) {
              updatedLead = transitionedResult.value;
              console.log(`🚀 [PLAYBOOK WORKER] Transição automática de FSM executada para o Lead: ENTRADA -> QUALIFICACAO`);
            }
          }

          // Save the updated Lead in the CRM
          const saveResult = await crmRepo.salvarLead(updatedLead);
          if (saveResult.isOk) {
            console.log(`✅ [PLAYBOOK WORKER] Lead do CRM atualizado e persistido com sucesso.`);

            // Log this rollout trigger as a CRM Lead Interaction
            const interactionResult = InteractionRecord.create({
              id: `int_playbook_${propertyId}_${Date.now()}`,
              leadId: lead.id,
              canal: 'READINESS_PLAYBOOK',
              timestamp: new Date(),
              sentimentScore: 1.0,
              tokenCost: 0,
              outcome: 'PENDING',
              resumo: `Playbook gerado automaticamente. Score: ${assessment.score}/100. Risco LGPD: ${assessment.lgpdRisk}. Categoria: ${assessment.category}.`
            });

            if (interactionResult.isOk) {
              await crmRepo.registrarInteracao(interactionResult.value);
              console.log(`✅ [PLAYBOOK WORKER] Interação de 'Playbook Gerado' registrada no histórico do Lead.`);
            }

            // Dispatch domain event to notify systems/CadenceClock about playbook generation
            try {
              const eventBus = new ConsoleEventBus();
              const event = PlaybookGeneratedEvent(lead.id, {
                score: assessment.score,
                category: assessment.category,
                lgpdRisk: assessment.lgpdRisk,
                playbookUrl: `/playbooks/${fileName}`,
              });
              await eventBus.publish(event);
              console.log(`🚀 [PLAYBOOK WORKER] Evento de domínio PlaybookGeneratedEvent publicado para o lead ${lead.id}.`);
            } catch (eventErr) {
              console.error(`❌ [PLAYBOOK WORKER] Erro ao publicar PlaybookGeneratedEvent:`, eventErr);
            }
          }
        }
      } else {
        console.log(`⚠️ [PLAYBOOK WORKER] Nenhum Lead correspondente encontrado no CRM para a propriedade ${propertyId}.`);
      }
    } catch (crmErr) {
      console.error(`❌ [PLAYBOOK WORKER] Erro ao tentar atualizar o CRM ou registrar evento de domínio:`, crmErr);
    }

    return { status: 'COMPLETED', playbookUrl: `/playbooks/${fileName}` };
  } catch (error) {
    console.error(`❌ [PLAYBOOK WORKER] Erro ao processar playbook para ${propertyId}:`, error);
    throw error;
  }
};

export const playbookWorker = new Worker('brain-playbook', handlePlaybookJob, {
  connection: redisWorker,
  concurrency: 2
});
