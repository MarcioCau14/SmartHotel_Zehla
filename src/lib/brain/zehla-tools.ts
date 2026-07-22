/**
 * ╔══════════════════════════════════════════════════════════════════╗
 * ║  DEPRECATED — Phase 1 Compatibility Wrapper                     ║
 * ║                                                                  ║
 * ║  This file is Phase 1 dead code. All tools now DELEGATE to the  ║
 * ║  Phase 2 pipeline in @/lib/ai/tool-calling.ts which correctly   ║
 * ║  queries Property, Room, Booking, and KnowledgeEntry tables.    ║
 * ║                                                                  ║
 * ║  The ONLY consumer of this file is the dead Phase 1 orchestrator ║
 * ║  at @/lib/brain/agent-orchestrator.ts (also deprecated).        ║
 * ║                                                                  ║
 * ║  DO NOT add new tools here — use @/lib/ai/tool-calling.ts       ║
 * ║  directly instead.                                               ║
 * ╚══════════════════════════════════════════════════════════════════╝
 *
 * Tool name mapping (Phase 1 → Phase 2):
 *   zehla_analisar_ocupacao     → get_occupancy
 *   zehla_sugerir_preco         → check_availability
 *   zehla_analisar_reviews      → get_policies
 *   zehla_gerar_relatorio_diario → get_occupancy + get_room_details + get_policies
 *   zehla_buscar_dados_property → get_room_details
 */

import { executeSingleTool } from '@/lib/ai/tool-calling';
import { db } from '@/lib/db';

// ── Types (kept for backward compatibility) ──────────────────────────

export interface ToolDefinition {
  type: 'function';
  function: {
    name: string;
    description: string;
    parameters: Record<string, any>;
  };
}

// ── Tenant resolution ────────────────────────────────────────────────

/**
 * Resolves a tenantId from the legacy `pousada_id` argument.
 *
 * The old Phase 1 interface used `pousada_id` which could be:
 *  - A tenant ID directly
 *  - A property ID that needs lookup to find the tenantId
 *
 * This function tries both paths and returns the tenantId.
 */
async function resolveTenantId(pousadaId: string): Promise<string | null> {
  // 1. Try as tenantId directly — check if a Property with this tenantId exists
  const propertyByTenant = await db.property.findFirst({
    where: { tenantId: pousadaId },
    select: { tenantId: true },
  });
  if (propertyByTenant) return pousadaId;

  // 2. Try as property ID — look up the tenantId
  const propertyById = await db.property.findUnique({
    where: { id: pousadaId },
    select: { tenantId: true },
  });
  if (propertyById) return propertyById.tenantId;

  return null;
}

// ── executeTool (backward-compatible entry point) ────────────────────

/**
 * Executes a Phase 1 tool by delegating to Phase 2 tool-calling.ts.
 *
 * @deprecated Use `executeSingleTool` from @/lib/ai/tool-calling directly.
 */
export async function executeTool(
  toolName: string,
  args: Record<string, any>,
): Promise<string> {
  // Resolve tenantId from pousada_id
  const pousadaId = args.pousada_id || args.propertyId || '';
  const tenantId = pousadaId ? await resolveTenantId(pousadaId) : null;

  if (!tenantId) {
    return JSON.stringify({
      error: 'Não foi possível resolver o tenantId. Forneça pousada_id válido.',
      fonte: 'zehla_tools_compat',
    });
  }

  try {
    switch (toolName) {
      case 'zehla_analisar_ocupacao':
        return await handleAnalisarOcupacao(tenantId, args);
      case 'zehla_sugerir_preco':
        return await handleSugerirPreco(tenantId, args);
      case 'zehla_analisar_reviews':
        return await handleAnalisarReviews(tenantId, args);
      case 'zehla_gerar_relatorio_diario':
        return await handleGerarRelatorioDiario(tenantId, args);
      case 'zehla_buscar_dados_property':
        return await handleBuscarDadosProperty(tenantId, args);
      default:
        return JSON.stringify({
          error: `Ferramenta desconhecida: ${toolName}`,
          fonte: 'zehla_tools_compat',
        });
    }
  } catch (error) {
    return JSON.stringify({
      error: `Erro ao executar ${toolName}: ${error instanceof Error ? error.message : 'desconhecido'}`,
      fonte: 'zehla_tools_compat',
    });
  }
}

// ── Individual tool handlers (delegate to Phase 2) ──────────────────

/**
 * zehla_analisar_ocupacao → get_occupancy
 *
 * Maps old args: { pousada_id, periodo_inicio, periodo_fim }
 * Phase 2 `get_occupancy` returns current occupancy (no date range).
 * We include the original date range in the response for compatibility.
 */
async function handleAnalisarOcupacao(
  tenantId: string,
  args: Record<string, any>,
): Promise<string> {
  const result = await executeSingleTool('get_occupancy', tenantId);

  const compatResponse = {
    ...(result.success ? (result.data as any) : {}),
    pousada_id: args.pousada_id || tenantId,
    periodo: args.periodo_inicio && args.periodo_fim
      ? `${args.periodo_inicio} a ${args.periodo_fim}`
      : 'atual',
    fonte: 'zehla_tools_compat → get_occupancy',
    ...(result.success ? {} : { error: result.data }),
  };

  return JSON.stringify(compatResponse, null, 2);
}

/**
 * zehla_sugerir_preco → check_availability
 *
 * Maps old args: { pousada_id, tipo_quarto, data_checkin, data_checkout }
 * Phase 2 `check_availability` requires: { checkInDate, checkOutDate, guestCount }
 * If guestCount is not provided, defaults to 1.
 * The availability result includes room prices which serve as the price suggestion.
 */
async function handleSugerirPreco(
  tenantId: string,
  args: Record<string, any>,
): Promise<string> {
  const checkInDate = args.data_checkin || new Date().toISOString().slice(0, 10);
  const checkOutDate = args.data_checkout || new Date(Date.now() + 86400000).toISOString().slice(0, 10);
  const guestCount = args.guestCount || args.num_hospedes || 1;

  const result = await executeSingleTool('check_availability', tenantId, {
    checkInDate,
    checkOutDate,
    guestCount,
  });

  const compatResponse = {
    ...(result.success ? (result.data as any) : {}),
    tipo_quarto: args.tipo_quarto || 'todos',
    data_checkin: checkInDate,
    data_checkout: checkOutDate,
    fonte: 'zehla_tools_compat → check_availability',
    ...(result.success ? {} : { error: result.data }),
  };

  return JSON.stringify(compatResponse, null, 2);
}

/**
 * zehla_analisar_reviews → get_policies
 *
 * Closest Phase 2 match — policies include rules/reviews context
 * stored in KnowledgeEntry. The old tool queried the `lead` table
 * for reviews which was incorrect; policies from KnowledgeEntry
 * provide the actual operational context.
 */
async function handleAnalisarReviews(
  tenantId: string,
  args: Record<string, any>,
): Promise<string> {
  const result = await executeSingleTool('get_policies', tenantId);

  const compatResponse = {
    ...(result.success ? (result.data as any) : {}),
    pousada_id: args.pousada_id || tenantId,
    limite: args.limite || 20,
    nota: 'Políticas e regras da pousada substituem reviews (Phase 1 consultava tabela errada)',
    fonte: 'zehla_tools_compat → get_policies',
    ...(result.success ? {} : { error: result.data }),
  };

  return JSON.stringify(compatResponse, null, 2);
}

/**
 * zehla_gerar_relatorio_diario → get_occupancy + get_room_details + get_policies
 *
 * Combines three Phase 2 tools to produce a comprehensive daily report,
 * replacing the old version that incorrectly queried the `lead` table.
 */
async function handleGerarRelatorioDiario(
  tenantId: string,
  args: Record<string, any>,
): Promise<string> {
  const data = args.data || new Date().toISOString().slice(0, 10);

  const [occupancyResult, roomResult, policiesResult] = await Promise.all([
    executeSingleTool('get_occupancy', tenantId),
    executeSingleTool('get_room_details', tenantId),
    executeSingleTool('get_policies', tenantId),
  ]);

  const compatResponse = {
    data,
    ocupacao: occupancyResult.success ? occupancyResult.data : { error: occupancyResult.data },
    quartos: roomResult.success ? roomResult.data : { error: roomResult.data },
    politicas: policiesResult.success ? policiesResult.data : { error: policiesResult.data },
    fonte: 'zehla_tools_compat → get_occupancy + get_room_details + get_policies',
  };

  return JSON.stringify(compatResponse, null, 2);
}

/**
 * zehla_buscar_dados_property → get_room_details
 *
 * Phase 2 `get_room_details` returns property name + all room details,
 * which is a superset of what the old tool returned.
 */
async function handleBuscarDadosProperty(
  tenantId: string,
  args: Record<string, any>,
): Promise<string> {
  const result = await executeSingleTool('get_room_details', tenantId);

  const compatResponse = {
    ...(result.success ? (result.data as any) : {}),
    pousada_id: args.pousada_id || tenantId,
    fonte: 'zehla_tools_compat → get_room_details',
    ...(result.success ? {} : { error: result.data }),
  };

  return JSON.stringify(compatResponse, null, 2);
}

// ── ZEHLA_TOOLS (backward-compatible tool definitions) ───────────────

/**
 * @deprecated Use AVAILABLE_TOOLS from @/lib/ai/tool-calling instead.
 * Kept for backward compatibility with Phase 1 orchestrator.
 */
export const ZEHLA_TOOLS: ToolDefinition[] = [
  {
    type: 'function',
    function: {
      name: 'zehla_analisar_ocupacao',
      description: '[DEPRECATED] Analisa taxa de ocupação. Delegates to Phase 2 get_occupancy.',
      parameters: {
        type: 'object',
        properties: {
          pousada_id: { type: 'string', description: 'ID da pousada (property ID ou tenantId)' },
          periodo_inicio: { type: 'string', description: 'Data início (YYYY-MM-DD)' },
          periodo_fim: { type: 'string', description: 'Data fim (YYYY-MM-DD)' },
        },
        required: ['pousada_id'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'zehla_sugerir_preco',
      description: '[DEPRECATED] Sugere preço ótimo. Delegates to Phase 2 check_availability.',
      parameters: {
        type: 'object',
        properties: {
          pousada_id: { type: 'string', description: 'ID da pousada (property ID ou tenantId)' },
          tipo_quarto: { type: 'string', description: 'Tipo de quarto' },
          data_checkin: { type: 'string', description: 'Data check-in (YYYY-MM-DD)' },
          data_checkout: { type: 'string', description: 'Data check-out (YYYY-MM-DD)' },
        },
        required: ['pousada_id', 'tipo_quarto', 'data_checkin', 'data_checkout'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'zehla_analisar_reviews',
      description: '[DEPRECATED] Analisa reviews/políticas. Delegates to Phase 2 get_policies.',
      parameters: {
        type: 'object',
        properties: {
          pousada_id: { type: 'string', description: 'ID da pousada (property ID ou tenantId)' },
          limite: { type: 'number', default: 20 },
        },
        required: ['pousada_id'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'zehla_gerar_relatorio_diario',
      description: '[DEPRECATED] Relatório operacional diário. Delegates to Phase 2 get_occupancy + get_room_details + get_policies.',
      parameters: {
        type: 'object',
        properties: {
          pousada_id: { type: 'string', description: 'ID da pousada (property ID ou tenantId)' },
          data: { type: 'string', description: 'Data do relatório (YYYY-MM-DD)' },
        },
        required: ['pousada_id'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'zehla_buscar_dados_property',
      description: '[DEPRECATED] Dados cadastrais da pousada. Delegates to Phase 2 get_room_details.',
      parameters: {
        type: 'object',
        properties: {
          pousada_id: { type: 'string', description: 'ID da pousada (property ID ou tenantId)' },
        },
        required: ['pousada_id'],
      },
    },
  },
];
