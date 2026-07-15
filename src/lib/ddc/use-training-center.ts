// ZEHLA DDC - Cognitive OS Command Center
// Hook: use-training-center
import { useState, useEffect, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { TrainingPrompt, TestResult } from '@/types/ddc';
import { fetchTrainings, createTraining, updateTraining, deleteTraining, testTraining as testTrainingAPI } from './api';

interface UseTrainingCenterReturn {
  trainings: TrainingPrompt[];
  isLoading: boolean;
  error: Error | null;
  isTesting: boolean;
  isCreating: boolean;
  addTraining: (training: Omit<TrainingPrompt, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  editTraining: (trainingId: string, training: Partial<TrainingPrompt>) => Promise<void>;
  removeTraining: (trainingId: string) => Promise<void>;
  testTraining: (trainingId: string) => Promise<TestResult>;
  activateTraining: (trainingId: string) => Promise<void>;
  deactivateTraining: (trainingId: string) => Promise<void>;
  refreshTrainings: () => void;
}

export function useTrainingCenter(): UseTrainingCenterReturn {
  const queryClient = useQueryClient();
  const [isTesting, setIsTesting] = useState(false);

  // Fetch trainings
  const {
    data: trainingsData,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['ddc-trainings'],
    queryFn: () => fetchTrainings(),
    refetchInterval: 120000, // Refresh every 2 minutes
    staleTime: 60000
  });

  const trainings = trainingsData?.success ? (trainingsData.data || []) : [];

  // Create training mutation
  const createMutation = useMutation({
    mutationFn: createTraining,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ddc-trainings'] });

      // Dispatch training added event
      window.dispatchEvent(new CustomEvent('ddc:training-added'));
    }
  });

  // Update training mutation
  const updateMutation = useMutation({
    mutationFn: ({ trainingId, training }: { trainingId: string; training: Partial<TrainingPrompt> }) =>
      updateTraining(trainingId, training),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ddc-trainings'] });

      // Dispatch training updated event
      window.dispatchEvent(new CustomEvent('ddc:training-updated'));
    }
  });

  // Delete training mutation
  const deleteMutation = useMutation({
    mutationFn: deleteTraining,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ddc-trainings'] });

      // Dispatch training deleted event
      window.dispatchEvent(new CustomEvent('ddc:training-deleted'));
    }
  });

  // Add training
  const addTraining = useCallback(async (training: Omit<TrainingPrompt, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      await createMutation.mutateAsync(training);
    } catch (err) {
      console.error('Error adding training:', err);
      throw err;
    }
  }, [createMutation]);

  // Edit training
  const editTraining = useCallback(async (trainingId: string, training: Partial<TrainingPrompt>) => {
    try {
      await updateMutation.mutateAsync({ trainingId, training });
    } catch (err) {
      console.error('Error editing training:', err);
      throw err;
    }
  }, [updateMutation]);

  // Remove training
  const removeTraining = useCallback(async (trainingId: string) => {
    try {
      await deleteMutation.mutateAsync(trainingId);
    } catch (err) {
      console.error('Error removing training:', err);
      throw err;
    }
  }, [deleteMutation]);

  // Test training
  const testTraining = useCallback(async (trainingId: string): Promise<TestResult> => {
    try {
      setIsTesting(true);

      const result = await testTrainingAPI(trainingId);

      if (result.success && result.data) {
        return {
          status: result.data.status,
          score: result.data.score,
          feedback: result.data.feedback,
          timestamp: new Date()
        };
      } else {
        throw new Error(result.error?.message || 'Failed to test training');
      }
    } catch (err) {
      console.error('Error testing training:', err);
      throw err;
    } finally {
      setIsTesting(false);
    }
  }, []);

  // Activate training
  const activateTraining = useCallback(async (trainingId: string) => {
    try {
      await updateMutation.mutateAsync({
        trainingId,
        training: { isActive: true }
      });
    } catch (err) {
      console.error('Error activating training:', err);
      throw err;
    }
  }, [updateMutation]);

  // Deactivate training
  const deactivateTraining = useCallback(async (trainingId: string) => {
    try {
      await updateMutation.mutateAsync({
        trainingId,
        training: { isActive: false }
      });
    } catch (err) {
      console.error('Error deactivating training:', err);
      throw err;
    }
  }, [updateMutation]);

  return {
    trainings,
    isLoading,
    error: error as Error | null,
    isTesting,
    isCreating: createMutation.isPending,
    addTraining,
    editTraining,
    removeTraining,
    testTraining,
    activateTraining,
    deactivateTraining,
    refreshTrainings: () => refetch()
  };
}

// Hook for testing a training prompt
export function useTrainingTest(trainingId: string) {
  const [result, setResult] = useState<TestResult | null>(null);
  const [isTesting, setIsTesting] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const test = useCallback(async () => {
    try {
      setIsTesting(true);
      setError(null);

      const response = await fetch(`/api/ddc/training/${trainingId}/test`, {
        method: 'POST'
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to test training');
      }

      setResult({
        status: data.status,
        score: data.score,
        feedback: data.feedback,
        timestamp: new Date()
      });
    } catch (err) {
      setError(err as Error);
      console.error('Error testing training:', err);
    } finally {
      setIsTesting(false);
    }
  }, [trainingId]);

  const reset = useCallback(() => {
    setResult(null);
    setError(null);
  }, []);

  return {
    result,
    isTesting,
    error,
    test,
    reset
  };
}