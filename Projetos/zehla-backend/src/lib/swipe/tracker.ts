import { prisma } from '@/lib/prisma';


// src/lib/swipe/tracker.ts

export async function registrarUsoSwipe(swipeId: string, leadId: string, agentId?: string) : void {
  try {
  return await prisma.$transaction(async (tx) => {
    const usage = await tx.swipeUsage.upsert({
      where: { swipeId_leadId: { swipeId, leadId } },
      update: { wasUsed: true, agentId, createdAt: new Date() },
      create: { swipeId, leadId, wasUsed: true, agentId }
    });

    await tx.swipeTemplate.update({
      where: { id: swipeId },
      data: { timesUsed: { increment: 1 }, lastUsedAt: new Date() }
    });

    await tx.lead.update({
      where: { id: leadId },
      data: { lastSwipeUsedId: swipeId, lastSwipeAction: 'used' }
    });

    return usage;
  });
}

export async function registrarConversaoSwipe(leadId: string) : void {
  try {
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

    const template = await tx.swipeTemplate.findUnique({
      where: { id: swipeId },
      select: { timesUsed: true, conversions: true }
    });

    if (template) {
      const newConversions = template.conversions + 1;
      const newConvRate = newConversions / template.timesUsed;

      await tx.swipeTemplate.update({
        where: { id: swipeId },
        data: { conversions: newConversions, convRate: newConvRate, provenByConversion: true }
      });
    }

    return { swipeId, leadId, status: 'converted' };
  });
}

export async function registrarIgnorado(swipeId: string, leadId: string, agentId?: string) : void {
  try {
  return await prisma.lead.update({
    where: { id: leadId },
    data: { lastSwipeAction: 'ignored' }
  });
}

export async function registrarFeedback(swipeId: string, leadId: string, feedback: unknown) : void {
  try {
  return await prisma.swipeUsage.update({
    where: { swipeId_leadId: { swipeId, leadId } },
    data: { feedback }
  });
}
