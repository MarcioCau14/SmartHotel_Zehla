'use client';

import { useState, useCallback, useEffect } from 'react';

export interface VoiceDNAData {
  id?: string;
  propertyId: string;
  acousticWeights: {
    formality: number;
    energy: number;
    warmth: number;
    authority: number;
    speed: number;
  };
  referenceHash?: string;
  updatedAt?: string;
}

export function useVoiceDNA(propertyId: string | null) {
  const [voiceDna, setVoiceDna] = useState<VoiceDNAData | null>(null);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchVoiceDNA = useCallback(async () => {
    if (!propertyId) return;
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/zcc/voice/upload?propertyId=${propertyId}`);
      if (!response.ok) {
        throw new Error('Falha ao carregar DNA de voz');
      }
      const result = await response.json();
      if (result.success && result.data) {
        setVoiceDna(result.data);
      } else {
        setVoiceDna(null);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
    } finally {
      setLoading(false);
    }
  }, [propertyId]);

  const uploadAudio = useCallback(async (audioBase64: string) => {
    if (!propertyId) return { success: false, error: 'Propriedade não selecionada' };
    setUploading(true);
    setError(null);
    try {
      const response = await fetch('/api/zcc/voice/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          propertyId,
          audioBase64,
        }),
      });
      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || 'Falha no upload do áudio');
      }
      if (result.success && result.data) {
        setVoiceDna(result.data);
        return { success: true, data: result.data };
      }
      throw new Error('Retorno inválido do servidor');
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Erro no upload';
      setError(msg);
      return { success: false, error: msg };
    } finally {
      setUploading(false);
    }
  }, [propertyId]);

  useEffect(() => {
    fetchVoiceDNA();
  }, [fetchVoiceDNA]);

  return {
    voiceDna,
    loading,
    uploading,
    error,
    uploadAudio,
    refresh: fetchVoiceDNA,
  };
}
