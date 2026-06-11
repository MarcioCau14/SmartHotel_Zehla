import { useState, useCallback, useEffect } from 'react';
import { Result } from '../shared/Result';
import { apiGet, apiPost } from './apiClient';

export interface TaxProfileData {
  id: string;
  propertyId: string;
  cnpj: string | null;
  razaoSocial: string | null;
  nomeFantasia: string | null;
  inscricaoMunicipal: string | null;
  inscricaoEstadual: string | null;
  regimeTributario: string;
  codigoAtividade: string | null;
  certificadoDigital: any | null;
  enderecoCompleto: any | null;
  emailNF: string | null;
  telefoneNF: string | null;
  autoEmissaoNF: boolean;
  tipoNFS: string;
  provedorNF: string | null;
  chaveAPIProvedor: string | null;
  ambienteEmissao: string;
}

export function useTaxProfile() {
  const [profile, setProfile] = useState<TaxProfileData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    const result = await apiGet<TaxProfileData | null>('/api/zcc/tax-profile');
    setIsLoading(false);
    
    if (result.isFail) {
      setError(result.error.message);
    } else {
      setProfile(result.value);
    }
  }, []);

  const saveProfile = useCallback(async (data: Partial<TaxProfileData>): Promise<Result<TaxProfileData, Error>> => {
    setIsSaving(true);
    setError(null);
    const result = await apiPost<TaxProfileData>('/api/zcc/tax-profile', data);
    setIsSaving(false);

    if (result.isFail) {
      setError(result.error.message);
      return Result.fail(result.error);
    }

    setProfile(result.value);
    return Result.ok(result.value);
  }, []);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  return {
    profile,
    isLoading,
    isSaving,
    error,
    fetchProfile,
    saveProfile
  };
}
