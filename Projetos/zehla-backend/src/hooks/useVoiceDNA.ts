import { useState, useCallback, useEffect } from 'react';
import { Result } from '../shared/Result';
import { apiGet, apiPost } from './apiClient';

export interface VoiceProfileData {
  tone: {
    tonePosition: number;
    toneProactivity: string;
    toneEmojiLevel: string;
    toneFormality: string;
    toneStyle: string;
    toneGrammar: string;
    toneHumor: string;
    voiceSample1: string | null;
    voiceSample2: string | null;
    voiceSample3: string | null;
    generatedSystemPrompt: string | null;
  } | null;
  keys: Array<{ type: string; maxPercent: number }>;
  pains: Array<{ questionId: number; score: number; priority: boolean }>;
}

export function useVoiceDNA() {
  const [data, setData] = useState<VoiceProfileData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchDNA = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    const result = await apiGet<VoiceProfileData>('/api/zcc/dna');
    setIsLoading(false);
    if (result.isFail) {
      setError(result.error.message);
    } else {
      setData(result.value);
    }
  }, []);

  const saveDNA = useCallback(async (body: any): Promise<Result<void, Error>> => {
    setIsSaving(true);
    setError(null);
    const result = await apiPost<{ success: boolean; message: string }>('/api/zcc/dna', body);
    setIsSaving(false);
    if (result.isFail) {
      setError(result.error.message);
      return Result.fail(result.error);
    }
    await fetchDNA(); // Atualizar o estado local
    return Result.ok(undefined);
  }, [fetchDNA]);

  const uploadVoiceSample = useCallback(
    async (audioBlob: Blob, filename: string): Promise<Result<string, Error>> => {
      try {
        setError(null);
        const token = typeof window !== 'undefined' ? localStorage.getItem('zehla_session_token') : null;
        const headers: Record<string, string> = {};
        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
        }

        const formData = new FormData();
        formData.append('file', audioBlob, filename);

        const response = await fetch('/api/zcc/voice/upload', {
          method: 'POST',
          headers,
          body: formData,
        });

        const text = await response.text();
        const resData = text ? JSON.parse(text) : {};

        if (!response.ok) {
          const errMsg = resData.error || `HTTP ${response.status}`;
          return Result.fail(new Error(errMsg));
        }

        return Result.ok(resData.url);
      } catch (err: any) {
        return Result.fail(new Error(err.message || 'Erro de rede ao fazer upload.'));
      }
    },
    []
  );

  useEffect(() => {
    fetchDNA();
  }, [fetchDNA]);

  return {
    data,
    isLoading,
    isSaving,
    error,
    fetchDNA,
    saveDNA,
    uploadVoiceSample,
  };
}
