import { db } from '@/lib/db';
import { type SwipeTemplate } from "./types";

export async function listarTemplates(filtros?: { channel?: string; category?: string; tier?: string; painType?: string; isActive?: boolean; search?: string }): Promise<SwipeTemplate[]> {
  const where: any = {};
  if (filtros?.channel) where.channel = filtros.channel;
  if (filtros?.category) where.category = filtros.category;
  if (filtros?.tier) where.tier = filtros.tier;
  if (filtros?.painType) where.painType = filtros.painType;
  if (filtros?.isActive !== undefined) where.isActive = filtros.isActive;
  if (filtros?.search) { where.OR = [{ title: { contains: filtros.search } }, { content: { contains: filtros.search } }]; }
  return db.swipeTemplate.findMany({ where, orderBy: [{ convRate: "desc" }, { timesUsed: "desc" }], take: 50 }) as unknown as Promise<SwipeTemplate[]>;
}

export async function obterTemplate(id: string): Promise<SwipeTemplate | null> {
  return db.swipeTemplate.findUnique({ where: { id } }) as unknown as Promise<SwipeTemplate | null>;
}

export async function criarTemplate(data: { tenantId: string; title: string; content: string; channel?: string; category?: string; tone?: string; tier?: string; painType?: string; tags?: string[]; isAiGenerated?: boolean; createdBy?: string }): Promise<SwipeTemplate> {
  return db.swipeTemplate.create({ data: { tenantId: data.tenantId, title: data.title, content: data.content, variables: extrairVariaveis(data.content), channel: data.channel || "whatsapp", category: data.category || "saudacao", tone: data.tone || "casual", tier: data.tier || "universal", painType: data.painType || null, tags: JSON.stringify(data.tags || []), isAiGenerated: data.isAiGenerated || false, createdBy: data.createdBy || null } }) as unknown as Promise<SwipeTemplate>;
}


export async function atualizarTemplate(id: string, data: Partial<SwipeTemplate>): Promise<SwipeTemplate> {
  const { variables, tags, ...rest } = data;
  const updatePayload: any = {
    ...rest,
    ...(data.content ? { variables: extrairVariaveis(data.content) } : {}),
    ...(tags ? { tags: JSON.stringify(tags) } : {}),
    updatedAt: new Date()
  };
  return db.swipeTemplate.update({ where: { id }, data: updatePayload }) as unknown as Promise<SwipeTemplate>;
}

export async function desativarTemplate(id: string): Promise<void> {
  await db.swipeTemplate.update({ where: { id }, data: { isActive: false } });
}

function extrairVariaveis(content: string): string {
  const matches = content.match(/\{\{(\w+)\}\}/g) || [];
  return JSON.stringify(matches.map(m => m.replace(/\{\{|\}\}/g, "")));
}
