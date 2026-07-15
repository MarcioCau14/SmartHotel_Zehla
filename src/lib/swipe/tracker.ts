import { db } from '@/lib/db';

export async function registrarUsoSwipe(swipeId: string, leadId: string, options?: { agentId?: string; responseTimeMs?: number }): Promise<void> {
  await db.swipeUsage.upsert({
    where: { swipeId_leadId: { swipeId, leadId } },
    create: { swipeId, leadId, wasUsed: true, agentId: options?.agentId ?? null, responseTimeMs: options?.responseTimeMs ?? null },
    update: { wasUsed: true, agentId: options?.agentId ?? null, responseTimeMs: options?.responseTimeMs ?? null },
  });
  await db.swipeTemplate.update({ where: { id: swipeId }, data: { timesUsed: { increment: 1 }, lastUsedAt: new Date() } });
  await db.lead.update({ where: { id: leadId }, data: { lastSwipeUsedId: swipeId, lastSwipeAction: "usado" } });
}

export async function registrarConversao(leadId: string): Promise<void> {
  const lastUsage = await db.swipeUsage.findFirst({ where: { leadId, wasUsed: true, converted: null }, orderBy: { createdAt: "desc" } });
  if (lastUsage) {
    await db.swipeUsage.update({ where: { id: lastUsage.id }, data: { converted: true } });
    await db.swipeTemplate.update({ where: { id: lastUsage.swipeId }, data: { conversions: { increment: 1 }, provenByConversion: true } });
  }
}

export async function registrarIgnorado(swipeId: string, leadId: string): Promise<void> {
  await db.swipeUsage.upsert({ where: { swipeId_leadId: { swipeId, leadId } }, create: { swipeId, leadId, wasUsed: false }, update: { wasUsed: false } });
  await db.lead.update({ where: { id: leadId }, data: { lastSwipeAction: "ignorado" } });
}

export async function registrarFeedback(usageId: string, feedback: "positivo" | "neutro" | "negativo"): Promise<void> {
  await db.swipeUsage.update({ where: { id: usageId }, data: { feedback } });
}

export async function recalcularTodosRankings(): Promise<number> {
  const templates = await db.swipeTemplate.findMany({ where: { isActive: true } });
  let atualizados = 0;
  for (const t of templates) {
    const totalUsados = await db.swipeUsage.count({ where: { swipeId: t.id, wasUsed: true } });
    const totalConvertidos = await db.swipeUsage.count({ where: { swipeId: t.id, wasUsed: true, converted: true } });
    const newRate = totalUsados > 0 ? totalConvertidos / totalUsados : 0;
    if (newRate !== (t as any).convRate) {
      await db.swipeTemplate.update({ where: { id: t.id }, data: { convRate: newRate, provenByConversion: newRate > 0 } });
      atualizados++;
    }
  }
  return atualizados;
}
