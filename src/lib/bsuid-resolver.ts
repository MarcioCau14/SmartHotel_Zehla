import { db } from "@/lib/db";

interface WebhookPayload {
  phone?: string;
  bsuid?: string;
  profileName?: string;
}

export async function resolveGuest(
  tenantId: string,
  payload: WebhookPayload
) {
  // 1. Tentar encontrar por BSUID primeiro (se fornecido)
  if (payload.bsuid) {
    const existing = await db.guest.findFirst({
      where: { tenantId, bsuid: payload.bsuid },
    });
    if (existing) return existing;
  }

  // 2. Tentar encontrar por telefone
  if (payload.phone) {
    const existing = await db.guest.findFirst({
      where: {
        tenantId,
        OR: [
          { phone: payload.phone },
          { realPhone: payload.phone },
        ],
      },
    });

    if (existing) {
      // Atualizar BSUID se o guest existir mas nao tiver
      if (payload.bsuid && !existing.bsuid) {
        await db.guest.update({
          where: { id: existing.id },
          data: { bsuid: payload.bsuid },
        });
      }
      return existing;
    }
  }

  // 3. Criar novo guest
  const isBsuid = payload.phone ? (payload.phone.startsWith('meta-') || payload.phone.length > 20 || /^[a-zA-Z]/.test(payload.phone)) : true;
  
  const newGuest = await db.guest.create({
    data: {
      tenantId,
      name: payload.profileName || (payload.phone ? `Hóspede — ${payload.phone}` : "Hóspede"),
      phone: isBsuid ? null : (payload.phone || null),
      bsuid: payload.bsuid || (isBsuid ? payload.phone : null) || null,
      realPhone: isBsuid ? null : (payload.phone || null),
      status: "new",
      source: "whatsapp",
      conversationCount: 1,
      metadata: "{}",
    },
  });
  
  return newGuest;
}
