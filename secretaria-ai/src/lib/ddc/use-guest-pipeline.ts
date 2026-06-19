// ZEHLA DDC - Cognitive OS Command Center
// Hook: use-guest-pipeline
import { useState, useEffect, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { Guest, GuestStatus, GuestFilters } from '@/types/ddc';
import { fetchGuests, updateGuest, deleteGuest } from './api';

interface UseGuestPipelineReturn {
  pipeline: {
    hot: Guest[];
    warm: Guest[];
    cold: Guest[];
    closed: Guest[];
    lost: Guest[];
  };
  allGuests: Guest[];
  isLoading: boolean;
  error: Error | null;
  filters: GuestFilters;
  setFilters: (filters: GuestFilters) => void;
  updateGuestStatus: (guestId: string, status: GuestStatus) => Promise<void>;
  removeGuest: (guestId: string) => Promise<void>;
  refreshGuests: () => void;
}

export function useGuestPipeline(): UseGuestPipelineReturn {
  const queryClient = useQueryClient();
  const [filters, setFilters] = useState<GuestFilters>({});

  // Fetch guests
  const {
    data: guestsData,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['ddc-guests', filters],
    queryFn: () => fetchGuests(filters),
    refetchInterval: 60000, // Refresh every minute
    staleTime: 30000
  });

  const allGuests: Guest[] = guestsData?.success
    ? (Array.isArray(guestsData.data)
        ? guestsData.data
        : guestsData.data?.items || [])
    : [];

  // Organize guests into pipeline stages
  const pipeline = {
    hot: allGuests.filter(g => g.status === 'hot'),
    warm: allGuests.filter(g => g.status === 'warm'),
    cold: allGuests.filter(g => g.status === 'cold'),
    closed: allGuests.filter(g => g.status === 'closed'),
    lost: allGuests.filter(g => g.status === 'lost')
  };

  // Update guest status mutation
  const updateStatusMutation = useMutation({
    mutationFn: ({ guestId, status }: { guestId: string; status: GuestStatus }) =>
      updateGuestStatus(guestId, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ddc-guests'] });

      // Dispatch pipeline update event
      window.dispatchEvent(new CustomEvent('ddc:pipeline-updated'));
    }
  });

  // Delete guest mutation
  const deleteMutation = useMutation({
    mutationFn: deleteGuest,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ddc-guests'] });

      // Dispatch pipeline update event
      window.dispatchEvent(new CustomEvent('ddc:pipeline-updated'));
    }
  });

  // Update guest status
  const updateGuestStatus = useCallback(async (guestId: string, status: GuestStatus) => {
    try {
      await updateStatusMutation.mutateAsync({ guestId, status });
    } catch (err) {
      console.error('Error updating guest status:', err);
      throw err;
    }
  }, [updateStatusMutation]);

  // Remove guest
  const removeGuest = useCallback(async (guestId: string) => {
    try {
      await deleteMutation.mutateAsync(guestId);
    } catch (err) {
      console.error('Error removing guest:', err);
      throw err;
    }
  }, [deleteMutation]);

  return {
    pipeline,
    allGuests,
    isLoading,
    error: error as Error | null,
    filters,
    setFilters,
    updateGuestStatus,
    removeGuest,
    refreshGuests: () => refetch()
  };
}

// Hook for managing filters
export function useGuestFilters() {
  const [filters, setFilters] = useState<GuestFilters>({});

  const updateFilter = useCallback((key: keyof GuestFilters, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  }, []);

  const clearFilters = useCallback(() => {
    setFilters({});
  }, []);

  const hasActiveFilters = Object.values(filters).some(
    value => value !== undefined && value !== null && value !== ''
  );

  return {
    filters,
    updateFilter,
    clearFilters,
    hasActiveFilters
  };
}

// Helper function for updateGuestStatus (imported from api.ts)
async function updateGuestStatus(guestId: string, status: Guest['status']) {
  const response = await fetch(`/api/ddc/guests/${guestId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status })
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || 'Failed to update guest status');
  }

  return data.data;
}