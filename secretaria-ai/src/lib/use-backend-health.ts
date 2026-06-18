import { useQuery } from '@tanstack/react-query';

/**
 * Hook que verifica a conectividade com o back-end FastAPI (porta 8000).
 * Faz um ping leve a cada 15s. Retorna `isOnline` para renderização condicional.
 */
export function useBackendHealth() {
  return useQuery({
    queryKey: ['backend-health'],
    queryFn: async () => {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 4000);

      try {
        const res = await fetch('/api/proxy/leads', {
          signal: controller.signal,
          headers: { 'Accept': 'application/json' },
        });
        clearTimeout(timeout);
        return res.ok;
      } catch {
        clearTimeout(timeout);
        return false;
      }
    },
    refetchInterval: 15_000,
    staleTime: 10_000,
    retry: false,
  });
}
