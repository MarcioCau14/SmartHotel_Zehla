import { useState, useEffect, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import type { LearningStatsResponse, LearnedPattern } from '@/types/ddc';
import { fetchLearningStats } from './api';

export function useLearningStats() {
  const {
    data: responseData,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['ddc-learning-stats'],
    queryFn: fetchLearningStats,
    refetchInterval: 60000, // Refresh a cada 60s
    staleTime: 30000,
  });

  const stats: LearningStatsResponse | null = responseData?.success
    ? (responseData.data || null)
    : null;

  return {
    stats,
    patterns: stats?.patterns || [],
    isLoading,
    error: error as Error | null,
    refresh: () => refetch(),
  };
}

// Hook simplificado para o AIStatusBadge mostrar contadores de aprendizado
export function useLearningCounters() {
  const { stats, isLoading } = useLearningStats();

  return {
    totalPatterns: stats?.totalPatterns || 0,
    verifiedPatterns: stats?.verifiedPatterns || 0,
    overallConfidence: stats?.overallConfidence || 0,
    isLoading,
  };
}