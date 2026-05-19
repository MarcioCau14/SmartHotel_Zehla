import { prisma } from '@/lib/prisma';


export interface BlastEventData {
  messageId: string;
  leadId?: string;
  contactPhone: string;
  eventType: 
    | 'whatsapp_sent' 
    | 'whatsapp_delivered' 
    | 'whatsapp_open' 
    | 'whatsapp_reply' 
    | 'whatsapp_blocked' 
    | 'whatsapp_opted_out' 
    | 'whatsapp_link_clicked';
  campaignId: string;
  content?: string;
}

export async function trackBlastEvent(data: BlastEventData) : void {
  try {
  const { messageId, leadId, contactPhone, eventType, campaignId, content } = data;

  // 1. Localizar o Lead (se ainda não tiver leadId)
  let targetLeadId = leadId;
  if (!targetLeadId) {
    const lead = await prisma.lead.findFirst({
      where: {
        OR: [
          { whatsapp: contactPhone },
          { phone: contactPhone }
        ]
      }
    });
    targetLeadId = lead?.id;
  }

  // 2. Mapeamento de Eventos e Impacto no Score (Blueprint Section 5.1)
  const eventMapping: Record<string, { type: unknown, score: number, funnel?: string }> = {
    whatsapp_sent: { type: 'WHATSAPP_SENT', score: 0 },
    whatsapp_delivered: { type: 'WHATSAPP_DELIVERED', score: 0 },
    whatsapp_open: { type: 'WHATSAPP_OPEN', score: 5 },
    whatsapp_reply: { type: 'WHATSAPP_REPLY', score: 25, funnel: 'INTEREST' },
    whatsapp_blocked: { type: 'WHATSAPP_BLOCKED', score: -50, funnel: 'NEUTRAL' },
    whatsapp_opted_out: { type: 'WHATSAPP_OPTED_OUT', score: 0 },
    whatsapp_link_clicked: { type: 'WHATSAPP_LINK_CLICKED', score: 40, funnel: 'TRIAL' }
  };

  const mapping = eventMapping[eventType];
  if (!mapping) return;

  // 3. Criar Evento no ZEHLA Brain Pipeline
  if (targetLeadId) {
    await prisma.leadEvent.create({
      data: {
        leadId: targetLeadId,
        type: mapping.type,
        scoreImpact: mapping.score,
        eventSource: 'zehla_blast',
        status: 'received',
        metadata: {
          messageId,
          campaignId,
          content: content || '',
          blastCampaign: true
        }
      }
    });

    // 4. Atualizar Score e Cluster do Lead
    const updateData: any = {
      lastInteractionAt: new Date(),
    };

    if (mapping.score !== 0) {
      updateData.score = { increment: mapping.score };
    }

    if (mapping.funnel) {
      updateData.funnelStage = mapping.funnel;
    }

    if (eventType === 'whatsapp_blocked') {
      updateData.cluster = 'COLD';
      updateData.status = 'BLACKLISTED';
    }

    await prisma.lead.update({
      where: { id: targetLeadId },
      data: updateData
    });

    // 5. Se for Opt-out, marcar no Lead e no BlastContact
    if (eventType === 'whatsapp_opted_out') {
      await prisma.lead.update({
        where: { id: targetLeadId },
        data: { status: 'BLACKLISTED' }
      });
      
      await prisma.blastContact.updateMany({
        where: { phone: contactPhone },
        data: { 
          optedOut: true,
          optedOutAt: new Date(),
          optedOutReason: 'Solicitado pelo usuário via WhatsApp'
        }
      });
    }
  }

  // 6. Atualizar o status da mensagem no histórico do Blast
  const statusMapping: Record<string, string> = {
    whatsapp_sent: 'sent',
    whatsapp_delivered: 'delivered',
    whatsapp_open: 'read',
    whatsapp_reply: 'replied',
    whatsapp_blocked: 'failed',
    whatsapp_opted_out: 'opted_out',
    whatsapp_link_clicked: 'read'
  };

  const messageUpdate: any = {
    status: statusMapping[eventType] || 'sent'
  };

  if (eventType === 'whatsapp_sent') messageUpdate.sentAt = new Date();
  if (eventType === 'whatsapp_delivered') messageUpdate.deliveredAt = new Date();
  if (eventType === 'whatsapp_open' || eventType === 'whatsapp_link_clicked') messageUpdate.readAt = new Date();
  if (eventType === 'whatsapp_reply') messageUpdate.repliedAt = new Date();
  if (eventType === 'whatsapp_opted_out') messageUpdate.optedOutAt = new Date();
  if (eventType === 'whatsapp_blocked') messageUpdate.failedReason = 'Bloqueado pelo usuário';

  await prisma.blastMessage.update({
    where: { id: messageId },
    data: messageUpdate
  });

  // 7. Incrementar contadores da campanha
  const campaignUpdate: any = {};
  if (eventType === 'whatsapp_sent') campaignUpdate.sentCount = { increment: 1 };
  if (eventType === 'whatsapp_delivered') campaignUpdate.deliveredCount = { increment: 1 };
  if (eventType === 'whatsapp_open') campaignUpdate.readCount = { increment: 1 };
  if (eventType === 'whatsapp_reply') campaignUpdate.repliedCount = { increment: 1 };
  if (eventType === 'whatsapp_opted_out') campaignUpdate.optedOutCount = { increment: 1 };
  if (eventType === 'whatsapp_blocked') campaignUpdate.failedCount = { increment: 1 };

  await prisma.blastCampaign.update({
    where: { id: campaignId },
    data: campaignUpdate
  });

  
}
