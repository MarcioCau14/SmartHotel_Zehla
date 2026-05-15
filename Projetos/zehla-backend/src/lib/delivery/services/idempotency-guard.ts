import { redis } from './redis-connection';

/**
 * ZEHLA IDEMPOTENCY GUARD
 * Impede o reprocessamento acidental de eventos/leads.
 * Utiliza operações atômicas do Redis (SET NX EX).
 */

export class IdempotencyGuard {
  private static readonly NAMESPACE = 'idempotency:events:';
  private static readonly DEFAULT_TTL = 3600; // 1 hora de proteção

  /**
   * Tenta reservar um evento.
   * Retorna true se for a primeira vez (reservado com sucesso).
   * Retorna false se o evento já estiver sendo/foi processado.
   */
  static async canProcess(eventId: string, ttlSeconds: number = this.DEFAULT_TTL): Promise<boolean> {
    const key = `${this.NAMESPACE}${eventId}`;
    
    // SET key 1 NX EX ttl
    // NX: Só define se não existir
    // EX: Define expiração automática
    const result = await redis.set(key, '1', 'NX', 'EX', ttlSeconds);
    
    if (result === 'OK') {
      return true;
    }
    
    console.warn(`⚠️ [IDEMPOTENCY] Evento duplicado bloqueado: ${eventId}`);
    return false;
  }

  /**
   * Libera um evento em caso de erro crítico (opcional)
   */
  static async release(eventId: string): Promise<void> {
    const key = `${this.NAMESPACE}${eventId}`;
    await redis.del(key);
  }
}
