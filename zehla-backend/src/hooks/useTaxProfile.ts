'use client';

import { useState, useCallback, useEffect } from 'react';

export interface TaxProfileData {
  id?: string;
  propertyId: string;
  cnpj: string;
  razaoSocial: string;
  inscricaoEstadual?: string | null;
  inscricaoMunicipal?: string | null;
  taxRegime: string;
  environment: string;
  encryptedKeys?: string | null;
  updatedAt?: string;
}

export function useTaxProfile(propertyId: string | null) {
  const [profile, setProfile] = useState<TaxProfileData | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = useCallback(async () => {
    if (!propertyId) return;
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/zcc/tax-profile?propertyId=${propertyId}`);
      if (!response.ok) {
        throw new Error('Falha ao carregar perfil fiscal');
      }
      const result = await response.json();
      if (result.success && result.data) {
        setProfile(result.data);
      } else {
        setProfile(null);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
    } finally {
      setLoading(false);
    }
  }, [propertyId]);

  const saveProfile = useCallback(async (data: Omit<TaxProfileData, 'propertyId'>) => {
    if (!propertyId) return { success: false, error: 'Propriedade não selecionada' };
    setSaving(true);
    setError(null);
    try {
      const response = await fetch('/api/zcc/tax-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          propertyId,
          ...data,
        }),
      });
      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || 'Falha ao salvar perfil fiscal');
      }
      if (result.success && result.data) {
        setProfile(result.data);
        return { success: true, data: result.data };
      }
      throw new Error('Retorno inválido do servidor');
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Erro ao salvar';
      setError(msg);
      return { success: false, error: msg };
    } finally {
      setSaving(false);
    }
  }, [propertyId]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  return {
    profile,
    loading,
    saving,
    error,
    saveProfile,
    refresh: fetchProfile,
  };
}
