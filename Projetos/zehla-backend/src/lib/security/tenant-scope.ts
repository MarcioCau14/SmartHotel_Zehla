import { prisma } from '@/lib/prisma';


/**
 * ZEHLA Tenant Isolation Helper
 * Garante que todas as queries sejam filtradas pelo tenantId do usuário logado.
 */

export class TenantScope {
  constructor(private tenantId: string) {
    if (!tenantId) {
      throw new Error('Tenant ID is required for scoped operations');
    }
  }

  /**
   * Encapsula uma query do Prisma com o filtro de tenant.
   * Exemplo: scope.with(prisma.reservation).findMany({ ... })
   */
  async property() {
    return prisma.property.findFirst({
      where: { userId: this.tenantId }
    });
  }

  async reservations(query: any = {}) {
    const property = await this.property();
    if (!property) return [];
    
    return prisma.reservation.findMany({
      ...query,
      where: {
        ...query.where,
        propertyId: property.id
      }
    });
  }

  async rooms(query: any = {}) {
    const property = await this.property();
    if (!property) return [];

    return prisma.room.findMany({
      ...query,
      where: {
        ...query.where,
        propertyId: property.id
      }
    });
  }

  /**
   * Valida se um objeto pertence ao tenant antes de permitir ação
   */
  async validateOwnership(model: 'reservation' | 'room', id: string): Promise<boolean> {
    const property = await this.property();
    if (!property) return false;

    const count = await (prisma[model] as any).count({
      where: { id, propertyId: property.id }
    });
    return count > 0;
  }
}

/**
 * Extrai o tenantId do token da sessão (em um cenário real, via middleware/headers)
 */
export function getTenantFromRequest(req: Request): string | null {
  try {
  // Para o MVP, o frontend envia o tenantId/userId no body ou query
  // Em produção, isso viria decodificado do JWT
  const url = new URL(req.url);
  return url.searchParams.get('tenantId') || null;
}
