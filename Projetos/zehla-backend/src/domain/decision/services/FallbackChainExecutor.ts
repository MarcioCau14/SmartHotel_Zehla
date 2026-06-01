/**
 * ZEHLA SMARTHOTEL — FallbackChainExecutor Domain Service
 * Módulo: src/domain/decision/services/FallbackChainExecutor.ts
 */

import { Result } from '../../shared/Result';

export class FallbackChainExecutor {
  async execute<T>(
    providers: ReadonlyArray<string>,
    fn: (provider: string, signal: AbortSignal) => Promise<T>,
    isTransientError: (error: any) => boolean = () => true
  ): Promise<Result<T, Error>> {
    const globalTimeoutMs = 8000;
    const attemptTimeoutMs = 5000;
    const startTime = Date.now();

    const globalController = new AbortController();
    const globalTimeoutId = setTimeout(() => globalController.abort(), globalTimeoutMs);

    try {
      for (const provider of providers) {
        let attempts = 0;
        const maxRetries = 2; // 1 tentativa original + 2 retries = 3 tentativas no total por provedor

        while (attempts <= maxRetries) {
          const elapsed = Date.now() - startTime;
          if (elapsed >= globalTimeoutMs || globalController.signal.aborted) {
            return Result.fail(new Error('Global execution timeout of 8.0s exceeded'));
          }

          attempts++;
          const attemptController = new AbortController();

          // Linkar abort global ao abort da tentativa
          const onGlobalAbort = () => attemptController.abort();
          globalController.signal.addEventListener('abort', onGlobalAbort);

          // Timeout da tentativa: o menor entre 5.0s e o tempo global restante
          const remainingGlobalTime = globalTimeoutMs - (Date.now() - startTime);
          const currentTimeout = Math.min(attemptTimeoutMs, remainingGlobalTime);

          const attemptTimeoutId = setTimeout(() => attemptController.abort(), currentTimeout);

          try {
            const result = await fn(provider, attemptController.signal);
            return Result.ok(result);
          } catch (err: any) {
            const isTimeout = attemptController.signal.aborted && !globalController.signal.aborted;
            const isGlobalTimeout = globalController.signal.aborted;

            if (isGlobalTimeout) {
              return Result.fail(new Error('Global execution timeout of 8.0s exceeded'));
            }

            if (isTimeout) {
              // Se a tentativa estourou o timeout de 5.0s, pula imediatamente para o próximo provedor
              break;
            }

            const isTransient = isTransientError(err);
            if (!isTransient || attempts > maxRetries) {
              // Se o erro for definitivo ou esgotou os retries, passa para o próximo provedor da cadeia
              break;
            }
            // Se for transiente, continua no loop de retry para o mesmo provedor
          } finally {
            clearTimeout(attemptTimeoutId);
            globalController.signal.removeEventListener('abort', onGlobalAbort);
          }
        }
      }

      return Result.fail(new Error('All providers in the fallback chain failed'));
    } finally {
      clearTimeout(globalTimeoutId);
    }
  }
}
