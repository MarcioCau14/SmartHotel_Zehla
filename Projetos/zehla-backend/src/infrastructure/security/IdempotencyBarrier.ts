import { redis } from '@/lib/redis';

export class IdempotencyBarrier {
  /**
   * Tenta adquirir a trava de idempotência.
   * Retorna true se a trava foi adquirida (primeira execução).
   * Retorna false se a chave já existe (execução duplicada).
   */
  static async checkAndLock(key: string, ttlSeconds: number = 86400): Promise<boolean> {
    try {
      // SET key value EX ttl NX
      // Retorna 'OK' se inserido, null caso contrário
      const result = await redis.set(key, 'locked', 'EX', ttlSeconds, 'NX');
      return result === 'OK';
    } catch (error) {
      console.error(`[IdempotencyBarrier] Erro ao acessar Redis para chave ${key}:`, error);
      // Fallback em caso de falha no Redis: por segurança, não bloqueia o fluxo financeiro principal
      return true;
    }
  }
}
