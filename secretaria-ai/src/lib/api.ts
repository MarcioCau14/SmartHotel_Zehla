import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { Lead } from './leads-types';

/* ============================================
   TIPOS DA API (contrato com back-end v1.1.0)
   ============================================ */
export interface Target {
  name: string;
  domain: string;
  status: 'active' | 'pending' | 'inactive' | 'prospected';
}

export interface HuntPayload {
  company_name: string;
  domains?: string[];
}

/* ============================================
   useLeads — GET /api/proxy/leads

   Back-end retorna: { "leads": [{ empresa, decisor, cargo, email,
     whatsapp, setor, social_media, porte, status, hook }] }
   ============================================ */
export function useLeads() {
  return useQuery<Lead[]>({
    queryKey: ['leads'],
    queryFn: async () => {
      const res = await fetch('/api/proxy/leads');
      if (!res.ok) throw new Error('Erro ao buscar leads');
      const data = await res.json();
      return Array.isArray(data.leads) ? data.leads : data;
    },
    staleTime: 30 * 1000,
    retry: 1,
  });
}

/* ============================================
   useTargets — GET /api/proxy/targets

   Back-end retorna: { "targets": [{ name, domain, status }] }
   Status normalizado para lowercase.
   ============================================ */
export function useTargets() {
  return useQuery<Target[]>({
    queryKey: ['targets'],
    queryFn: async () => {
      const res = await fetch('/api/proxy/targets');
      if (!res.ok) throw new Error('Erro ao buscar alvos');
      const data = await res.json();
      const raw = Array.isArray(data.targets) ? data.targets : data;
      return raw.map((t: Record<string, unknown>) => ({
        ...t,
        status: String(t.status ?? 'active').toLowerCase(),
      }));
    },
    staleTime: 60 * 1000,
    retry: 1,
  });
}

/* ============================================
   useHunt — POST /api/proxy/hunt (JSON fallback)

   NOTA: O HunterConsole usa SSE via fetch + ReadableStream.
   Este hook permanece como fallback para cenários sem streaming.
   ============================================ */
export function useHunt() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: HuntPayload) => {
      const res = await fetch('/api/proxy/hunt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const errBody = await res.json().catch(() => ({}));
        throw new Error(errBody.error || 'Erro ao iniciar caçada');
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      queryClient.invalidateQueries({ queryKey: ['targets'] });
    },
  });
}
