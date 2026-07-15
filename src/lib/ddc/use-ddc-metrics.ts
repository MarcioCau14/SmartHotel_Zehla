// ZEHLA DDC - Cognitive OS Command Center
// Hook: use-ddc-metrics
import { useState, useEffect, useCallback } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import type { RevenueMetrics, AIStatusData } from '@/types/ddc';
import { fetchMetrics, fetchAIStatus } from './api';

interface UseDDCMetricsReturn {
  metrics: RevenueMetrics | null;
  aiStatus: AIStatusData | null;
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
  lastUpdated: Date | null;
}

export function useDDCMetrics(
  period: 'today' | 'week' | 'month' = 'today',
  autoRefresh: boolean = true
): UseDDCMetricsReturn {
  const queryClient = useQueryClient();
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  // Fetch revenue metrics
  const {
    data: metricsData,
    isLoading: isLoadingMetrics,
    error: metricsError,
    refetch: refetchMetrics
  } = useQuery({
    queryKey: ['ddc-metrics', period],
    queryFn: () => fetchMetrics(period),
    refetchInterval: autoRefresh ? 30000 : false, // Refresh every 30s
    staleTime: 15000,
    meta: {
      onSuccess: (data: any) => {
        if (data.success && data.data) {
          setLastUpdated(new Date());
        }
      }
    }
  });

  // Fetch AI status
  const {
    data: aiStatusData,
    isLoading: isLoadingAIStatus,
    error: aiStatusError,
    refetch: refetchAIStatus
  } = useQuery({
    queryKey: ['ddc-ai-status'],
    queryFn: () => fetchAIStatus(),
    refetchInterval: autoRefresh ? 10000 : false, // Refresh every 10s
    staleTime: 5000
  });

  // Extract metrics from response
  const metrics = metricsData?.success ? (metricsData.data as RevenueMetrics) : null;
  const aiStatus = aiStatusData?.success ? (aiStatusData.data as AIStatusData) : null;

  // Combined refetch function
  const refetch = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ['ddc-metrics'] });
    queryClient.invalidateQueries({ queryKey: ['ddc-ai-status'] });
  }, [queryClient]);

  return {
    metrics,
    aiStatus,
    isLoading: isLoadingMetrics || isLoadingAIStatus,
    error: metricsError || aiStatusError || null,
    refetch,
    lastUpdated
  };
}

// Hook for live metrics updates using custom event emitter
export function useLiveMetrics() {
  const [updates, setUpdates] = useState<RevenueMetrics | null>(null);

  useEffect(() => {
    const handleMetricsUpdate = (event: CustomEvent<RevenueMetrics>) => {
      setUpdates(event.detail);
    };

    window.addEventListener('ddc:metrics-update', handleMetricsUpdate as EventListener);

    return () => {
      window.removeEventListener('ddc:metrics-update', handleMetricsUpdate as EventListener);
    };
  }, []);

  return updates;
}