// src/lib/swipe/tracker.ts
import { prisma } from '@/lib/prisma';

/**
 * Recalcula a taxa de conversão de um template.
 */
async function recalcularConvRate(tx: any, swipeId: string): Promise<number> {
  const totalUsados = await tx.swipeUsage.count({
    where: { swipeId, wasUsed: true },
  });

  const totalConvertidos = await tx.swipeUsage.count({
    where: { swipeId, wasUsed: true, converted: true },
  });

  return totalUsados > 0 ? totalConvertidos / totalUsados : 0;
}

/**
 * Registra que um swipe foi usado para um lead.
 */
export async function registrarUsoSwipe(swipeId: string, leadId: string, agentId?: string) {
  return await prisma.$transaction(async (tx) => {
    const usage = await tx.swipeUsage.upsert({
      where: { swipeId_leadId: { swipeId, leadId } },
      update: { wasUsed: true, agentId, createdAt: new Date() },
      create: { swipeId, leadId, wasUsed: true, agentId }
    });

    // Recalcula a taxa de conversão com o novo uso
    const newConvRate = await recalcularConvRate(tx, swipeId);

    await tx.swipeTemplate.update({
      where: { id: swipeId },
      data: { 
        timesUsed: { increment: 1 }, 
        lastUsedAt: new Date(),
        convRate: newConvRate
      }
    });

    await tx.lead.update({
      where: { id: leadId },
      data: { lastSwipeUsedId: swipeId, lastSwipeAction: 'used' }
    });

    return usage;
  });
}

/**
 * Registra que um lead converteu após usar um swipe.
 */
export async function registrarConversaoSwipe(leadId: string) {
  const lead = await prisma.lead.findUnique({
    where: { id: leadId },
    select: { lastSwipeUsedId: true }
  });

  if (!lead?.lastSwipeUsedId) return null;
  const swipeId = lead.lastSwipeUsedId;

  return await prisma.$transaction(async (tx) => {
    await tx.swipeUsage.update({
      where: { swipeId_leadId: { swipeId, leadId } },
      data: { converted: true }
    });

    const newConvRate = await recalcularConvRate(tx, swipeId);

    await tx.swipeTemplate.update({
      where: { id: swipeId },
      data: { 
        conversions: { increment: 1 }, 
        convRate: newConvRate, 
        provenByConversion: true 
      }
    });

    return { swipeId, leadId, status: 'converted' };
  });
}

/**
 * Registra que um swipe foi ignorado pelo agente.
 */
export async function registrarIgnorado(swipeId: string, leadId: string) {
  return await prisma.$transaction(async (tx) => {
    const usage = await tx.swipeUsage.upsert({
      where: { swipeId_leadId: { swipeId, leadId } },
      update: { wasUsed: false },
      create: { swipeId, leadId, wasUsed: false }
    });

    await tx.lead.update({
      where: { id: leadId },
      data: { lastSwipeAction: 'ignored' }
    });

    return usage;
  });
}

/**
 * Registra feedback do agente sobre o swipe.
 */
export async function registrarFeedback(swipeId: string, leadId: string, feedback: any) {
  return await prisma.swipeUsage.update({
    where: { swipeId_leadId: { swipeId, leadId } },
    data: { feedback }
  });
}

/**
 * Recalcula convRate de TODOS os templates (rodar periodicamente).
 */
export async function recalcularTodosRankings(): Promise<number> {
  const templates = await prisma.swipeTemplate.findMany({
    where: { isActive: true },
  });

  let atualizados = 0;
  for (const t of templates) {
    const newRate = await prisma.$transaction(async (tx) => {
      return await recalcularConvRate(tx, t.id);
    });

    if (newRate !== t.convRate) {
      await prisma.swipeTemplate.update({
        where: { id: t.id },
        data: { convRate: newRate, provenByConversion: newRate > 0 },
      });
      atualizados++;
    }
  }

  return atualizados;
}
