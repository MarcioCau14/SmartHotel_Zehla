// =============================================================================
// ZEHLA SmartHotel — TanStack Query Hooks (Prospecção Lessie AI)
// Todas as chamadas usam fetch relativo para as rotas /api/ do Next.js
// =============================================================================

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type {
  Lead,
  Target,
  SwipeTemplate,
  Campaign,
  AgentLog,
  RouterProvider,
  BudgetGuardState,
  RevenueDiagnosis,
  LeadFilter,
  HuntProgress,
} from './leads-types';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Serializa filtros em query string para appending na URL */
function buildQueryString(params: Record<string, unknown>): string {
  const entries = Object.entries(params).filter(
    ([, v]) => v !== undefined && v !== null && v !== '',
  );
  if (entries.length === 0) return '';
  const qs = entries
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`)
    .join('&');
  return qs ? `?${qs}` : '';
}

// ---------------------------------------------------------------------------
// Query Keys
// ---------------------------------------------------------------------------

export const queryKeys = {
  leads: (filter?: LeadFilter) => ['leads', filter] as const,
  targets: () => ['targets'] as const,
  campaigns: () => ['campaigns'] as const,
  agentLogs: (limit?: number) => ['agentLogs', limit] as const,
  routerProviders: () => ['routerProviders'] as const,
  budgetGuard: () => ['budgetGuard'] as const,
  swipeTemplates: () => ['swipeTemplates'] as const,
  diagnosis: (leadId?: string) => ['diagnosis', leadId] as const,
} as const;

// ---------------------------------------------------------------------------
// Queries — Leitura de dados
// ---------------------------------------------------------------------------

/** Busca lista de leads com filtros opcionais */
export function useLeads(filter?: LeadFilter) {
  const qs = buildQueryString(filter ?? {});

  return useQuery<Lead[]>({
    queryKey: queryKeys.leads(filter),
    queryFn: async () => {
      const res = await fetch(`/api/leads${qs}`);
      if (!res.ok) throw new Error(`Erro ao buscar leads: ${res.statusText}`);
      return res.json();
    },
    staleTime: 30_000,
    refetchInterval: 60_000,
  });
}

/** Busca lista de alvos de prospecção */
export function useTargets() {
  return useQuery<Target[]>({
    queryKey: queryKeys.targets(),
    queryFn: async () => {
      const res = await fetch('/api/targets');
      if (!res.ok) throw new Error(`Erro ao buscar alvos: ${res.statusText}`);
      return res.json();
    },
    staleTime: 60_000,
  });
}

/** Busca campanhas de outreach */
export function useCampaigns() {
  return useQuery<Campaign[]>({
    queryKey: queryKeys.campaigns(),
    queryFn: async () => {
      const res = await fetch('/api/campaigns');
      if (!res.ok) throw new Error(`Erro ao buscar campanhas: ${res.statusText}`);
      return res.json();
    },
    staleTime: 30_000,
  });
}

/** Busca logs de execução dos agentes Lessie */
export function useAgentLogs(limit?: number) {
  const qs = limit !== undefined ? buildQueryString({ limit }) : '';

  return useQuery<AgentLog[]>({
    queryKey: queryKeys.agentLogs(limit),
    queryFn: async () => {
      const res = await fetch(`/api/agent-logs${qs}`);
      if (!res.ok) throw new Error(`Erro ao buscar logs: ${res.statusText}`);
      return res.json();
    },
    staleTime: 15_000,
    refetchInterval: 30_000,
  });
}

/** Busca providers do ZaosNeuroRouter */
export function useRouterProviders() {
  return useQuery<RouterProvider[]>({
    queryKey: queryKeys.routerProviders(),
    queryFn: async () => {
      const res = await fetch('/api/router/providers');
      if (!res.ok) throw new Error(`Erro ao buscar providers: ${res.statusText}`);
      return res.json();
    },
    staleTime: 10_000,
    refetchInterval: 15_000,
  });
}

/** Busca estado atual do Budget Guard */
export function useBudgetGuard() {
  return useQuery<BudgetGuardState>({
    queryKey: queryKeys.budgetGuard(),
    queryFn: async () => {
      const res = await fetch('/api/router/budget');
      if (!res.ok) throw new Error(`Erro ao buscar orçamento: ${res.statusText}`);
      return res.json();
    },
    staleTime: 10_000,
    refetchInterval: 30_000,
  });
}

/** Busca templates de swipe (WhatsApp / Email) */
export function useSwipeTemplates() {
  return useQuery<SwipeTemplate[]>({
    queryKey: queryKeys.swipeTemplates(),
    queryFn: async () => {
      const res = await fetch('/api/swipe-templates');
      if (!res.ok) throw new Error(`Erro ao buscar templates: ${res.statusText}`);
      return res.json();
    },
    staleTime: 60_000,
  });
}

/** Busca diagnóstico de receita de um lead específico */
export function useDiagnosis(leadId?: string) {
  return useQuery<RevenueDiagnosis>({
    queryKey: queryKeys.diagnosis(leadId),
    queryFn: async () => {
      if (!leadId) throw new Error('leadId é obrigatório para diagnóstico');
      const res = await fetch(`/api/diagnose?leadId=${encodeURIComponent(leadId)}`);
      if (!res.ok) throw new Error(`Erro ao buscar diagnóstico: ${res.statusText}`);
      return res.json();
    },
    enabled: !!leadId,
    staleTime: 60_000,
  });
}

// ---------------------------------------------------------------------------
// Mutations — Ações de escrita
// ---------------------------------------------------------------------------

/** Inicia uma nova caça prospectiva (hunt) */
export function useStartHunt() {
  const queryClient = useQueryClient();

  return useMutation<
    { huntId: string; estimatedLeads: number },
    Error,
    { targetIds?: string[]; regiao?: string }
  >({
    mutationFn: async (payload) => {
      const res = await fetch('/api/hunt/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? `Erro ao iniciar caça: ${res.statusText}`);
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      queryClient.invalidateQueries({ queryKey: ['agentLogs'] });
    },
  });
}

/** Cria uma nova campanha de outreach */
export function useCreateCampaign() {
  const queryClient = useQueryClient();

  return useMutation<
    Campaign,
    Error,
    {
      name: string;
      type: Campaign['type'];
      targetAudience: string;
      messageTemplate: string;
      scheduledAt?: string;
    }
  >({
    mutationFn: async (payload) => {
      const res = await fetch('/api/campaigns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? `Erro ao criar campanha: ${res.statusText}`);
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['campaigns'] });
    },
  });
}

/** Envia mensagens WhatsApp em massa para leads selecionados */
export function useSendBulkWhatsApp() {
  const queryClient = useQueryClient();

  return useMutation<
    { queued: number; estimatedCostUsd: number },
    Error,
    { leadIds: string[]; templateId: string; scheduledAt?: string }
  >({
    mutationFn: async (payload) => {
      const res = await fetch('/api/bulk-whatsapp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? `Erro ao enviar WhatsApp: ${res.statusText}`);
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      queryClient.invalidateQueries({ queryKey: ['campaigns'] });
      queryClient.invalidateQueries({ queryKey: ['agentLogs'] });
    },
  });
}

/**
 * Registra feedback de performance do ZaosNeuroRouter
 * (Thompson Sampling — atualiza alfa/beta do provider selecionado)
 */
export function useRecordFeedback() {
  const queryClient = useQueryClient();

  return useMutation<
    { success: boolean; updatedAlpha: number; updatedBeta: number },
    Error,
    { providerId: string; isSuccess: boolean; latencyMs: number; costUsd: number }
  >({
    mutationFn: async (payload) => {
      const res = await fetch('/api/router/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? `Erro ao registrar feedback: ${res.statusText}`);
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['routerProviders'] });
      queryClient.invalidateQueries({ queryKey: ['budgetGuard'] });
    },
  });
}

// ---------------------------------------------------------------------------
// Hook auxiliar — SSE para progresso de hunt em tempo real
// ---------------------------------------------------------------------------

/**
 * Hook para consumir eventos de progresso da caça via Server-Sent Events.
 * Retorna a última mensagem de progresso recebida.
 */
export function useHuntProgressStream(huntId: string | null) {
  return useQuery<HuntProgress | null>({
    queryKey: ['huntProgress', huntId],
    queryFn: () => {
      if (!huntId) return Promise.resolve(null);

      return new Promise<HuntProgress | null>((resolve, reject) => {
        const eventSource = new EventSource(
          `/api/hunt/${encodeURIComponent(huntId)}/progress`,
        );
        let resolved = false;

        eventSource.onmessage = (event) => {
          try {
            const data: HuntProgress = JSON.parse(event.data);
            if (data.progress >= 100) {
              eventSource.close();
            }
            if (!resolved) {
              resolved = true;
              resolve(data);
            }
          } catch {
            reject(new Error('Erro ao processar evento de progresso'));
          }
        };

        eventSource.onerror = () => {
          if (!resolved) {
            resolved = true;
            eventSource.close();
            resolve(null);
          }
        };

        // Timeout de segurança de 30 segundos
        setTimeout(() => {
          if (!resolved) {
            resolved = true;
            eventSource.close();
            resolve(null);
          }
        }, 30_000);
      });
    },
    enabled: !!huntId,
    staleTime: 0,
    refetchOnWindowFocus: false,
  });
}