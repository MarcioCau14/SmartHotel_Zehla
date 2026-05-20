import { prisma } from '@/lib/prisma';
import { blastProcessQueue } from '@/lib/blast/queues';
import { EvolutionClient } from '@/lib/blast/evolution-client';

export async function launchCampaign(campaignId: string) {
  const campaign = await prisma.blastCampaign.findUniqueOrThrow({
    where: { id: campaignId },
    include: { messages: true }
  });

  if (campaign.status === 'active') {
    throw new Error('Esta campanha já está em execução.');
  }

  // 1. Verificação de Horários Respeitosos (Section 3.3 Rule 9)
  const now = new Date();
  const currentHour = now.getHours();
  if (currentHour < 8 || currentHour >= 20) {
    throw new Error('Fora do horário permitido (08h às 20h). O disparo foi bloqueado para evitar banimentos.');
  }

  // Configuração de Throttling (Extraída do JSON da campanha ou valores padrão)
  const config = campaign.config as any || {};
  const delayMsg = config.delayMsg || 30000; // 30s default entre mensagens
  const batchSize = config.batchSize || 25;
  const batchPause = config.batchPause || 600000; // 10 min de pausa entre lotes
  const jitter = config.jitter || 15000; // 15s de variação aleatória

  // Buscar instâncias ativas no pool
  const instances = await prisma.blastInstance.findMany({
    where: { status: 'connected' }
  });

  if (instances.length === 0) {
    throw new Error('Nenhuma instância do WhatsApp está conectada no momento.');
  }

  // Marcar campanha como ativa
  await prisma.blastCampaign.update({
    where: { id: campaignId },
    data: {
      status: 'active',
      startedAt: new Date()
    }
  });

  // 2. Buscar mensagens pendentes e FILTRAR OPT-OUTS (Section 3.3 Rule 1 & 6)
  const messages = await prisma.blastMessage.findMany({
    where: {
      campaignId,
      status: 'pending'
    },
    orderBy: { createdAt: 'asc' }
  });

  console.log(`🚀 [BLAST] Iniciando campanha "${campaign.name}" para ${messages.length} leads.`);

  // Distribuição entre instâncias (Round-Robin) com Throttling
  let instanceIdx = 0;
  let batchCounter = 0;
  let currentDelay = 0;const blastContactBatch = await prisma.blastContact.findMany({ where: { phone: { in: messages.map((msg) => msg.contactPhone) } } });const blastContactMap = new Map(blastContactBatch.map((r) => [r.phone, r]));

  for (const msg of messages) {
    // Verificar se o contato optou por sair em outra campanha entre a criação e o lançamento desta
    const contact = await blastContactMap.get(
      msg.contactPhone);


    if (contact?.optedOut) {
      console.log(`🚫 [BLAST] Ignorando ${msg.contactPhone} (Opt-out detectado)`);
      await prisma.blastMessage.update({
        where: { id: msg.id },
        data: { status: 'failed', failedReason: 'Usuário optou por sair' }
      });
      continue;
    }

    const instance = instances[instanceIdx % instances.length];
    instanceIdx++;
    batchCounter++;

    // Cálculo do delay acumulado para o BullMQ
    // 1. Delay base entre mensagens + Jitter aleatório
    const messageDelay = delayMsg + Math.floor(Math.random() * jitter);
    currentDelay += messageDelay;

    // 2. Adicionar pausa de lote se atingir o tamanho do lote
    if (batchCounter >= batchSize) {
      currentDelay += batchPause;
      batchCounter = 0;
      console.log(`⏳ [BLAST] Lote concluído. Aplicando pausa de ${batchPause / 60000} min.`);
    }

    await blastProcessQueue.add(
      'send-message',
      {
        messageId: msg.id,
        campaignId,
        phoneNumber: msg.contactPhone,
        content: {
          text: msg.renderedMessage,
          mediaUrl: msg.mediaUrl,
          mediaType: campaign.mediaType
        },
        instanceId: instance.id,
        delay: messageDelay // Delay informativo para o log do worker
      },
      {
        delay: currentDelay, // Este é o delay REAL que o BullMQ respeitará
        jobId: `msg-${msg.id}`
      }
    );
  }

  console.log(`✅ [BLAST] Todas as mensagens da campanha "${campaign.name}" foram enfileiradas.`);
}

export async function pauseCampaign(campaignId: string) {
  // Em uma implementação real, poderíamos remover os jobs da fila processQueue
  // Para simplificar agora, apenas mudamos o status
  await prisma.blastCampaign.update({
    where: { id: campaignId },
    data: { status: 'paused' }
  });
}