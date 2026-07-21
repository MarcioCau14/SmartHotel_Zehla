// ZEHLA DDC - Deliveries Hook (Promessas Funcionais)
// Fetches real-time data from /api/ddc/deliveries
import { useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import type { DeliveriesData } from '@/types/ddc';
import { fetchDeliveries } from './api';

interface UseDDCDeliveriesReturn {
  deliveries: DeliveriesData | null;
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
}

export function useDDCDeliveries(
  period: string = 'month',
  autoRefresh: boolean = true
): UseDDCDeliveriesReturn {
  const {
    data: deliveriesData,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['ddc-deliveries', period],
    queryFn: async () => {
      const result = await fetchDeliveries(period);
      if (result.success && result.data) {
        return result.data;
      }
      return null;
    },
    refetchInterval: autoRefresh ? 30000 : false,
    staleTime: 15000,
  });

  const manualRefetch = useCallback(() => {
    refetch();
  }, [refetch]);

  return {
    deliveries: deliveriesData ?? null,
    isLoading,
    error: error as Error | null,
    refetch: manualRefetch,
  };
}
