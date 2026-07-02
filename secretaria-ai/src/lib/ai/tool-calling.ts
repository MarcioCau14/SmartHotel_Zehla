/**  
 * Tool Calling System — Function Calling para o Cérebro ZÉLLA  
 *  
 * Implementa o loop de tool calling para o pipeline cognitivo:  
 * 1. Envia mensagem + tools ao LLM (com tool definitions)  
 * 2. Se o LLM retorna tool_calls, executa cada ferramenta localmente  
 * 3. Alimenta os resultados de volta ao LLM  
 * 4. Repete até o LLM responder com texto final  
 *  
 * Ferramentas disponíveis:  
 *   - check_availability: Consulta disponibilidade real de quartos  
 *  
 * Arquitetura: o loop de tool calling é ORTODONAL ao ZaosNeuroRouter.  
 * O router seleciona o provider; o tool calling loop gerencia a execução.  
 */

import { db } from '@/lib/db';  
import { getNeuroRouter } from './zaos-neuro-router';  
import type { LLMResponse } from './zaos-neuro-router';

// ── Tipos ───────────────────────────────────────────────────────────

/** Definição de uma ferramenta (Function Calling) */  
export interface ToolDefinition {  
  name: string;  
  description: string;  
  parameters: {  
    type: 'object';  
    properties: Record<string, ToolParameterDef>;  
    required: string[];  
  };  
}

interface ToolParameterDef {  
  type: string;  
  description: string;  
  enum?: string[];  
}

/** Resultado da execução de uma ferramenta */  
export interface ToolResult {  
  toolName: string;  
  success: boolean;  
  data: unknown;  
  executionTimeMs: number;  
}

/** Configuração do loop de tool calling */  
export interface ToolCallingConfig {  
  /** Ferramentas disponíveis para esta chamada */  
  tools: ToolDefinition[];  
  /** Número máximo de iterações (evita loop infinito) */  
  maxIterations?: number;  
  /** ID do tenant para consultas ao banco */  
  tenantId: string;  
  /** Prompt do sistema (persona) */  
  systemPrompt: string;  
}

/** Resposta completa do loop de tool calling */  
export interface ToolCallingResponse extends LLMResponse {  
  /** Ferramentas que foram chamadas e seus resultados */  
  toolCalls: Array<{  
    toolName: string;  
    arguments: Record<string, unknown>;  
    result: ToolResult;  
  }>;  
  /** Número de iterações do loop */  
  iterations: number;  
}

// ── Ferramentas disponíveis ──────────────────────────────────────────

export const AVAILABLE_TOOLS: ToolDefinition[] = [  
  {  
    name: 'check_availability',  
    description: 'Consulta a disponibilidade e preços de quartos para um intervalo de datas. Retorna quartos disponíveis com preço por noite.',  
    parameters: {  
      type: 'object',  
      properties: {  
        checkInDate: { type: 'string', description: 'Data de check-in no formato YYYY-MM-DD' },  
        checkOutDate: { type: 'string', description: 'Data de check-out no formato YYYY-MM-DD' },  
        guestCount: { type: 'number', description: 'Número de hóspedes' },  
      },  
      required: ['checkInDate', 'checkOutDate', 'guestCount'],  
    },  
  },  
  {  
    name: 'get_room_details',  
    description: 'Retorna detalhes de todos os quartos da pousada (nome, tipo, capacidade, preço, status).',  
    parameters: {  
      type: 'object',  
      properties: {},  
      required: [],  
    },  
  },  
  {  
    name: 'get_policies',  
    description: 'Retorna as políticas da pousada: check-in, check-out, cancelamento, crianças, pets.',  
    parameters: {  
      type: 'object',  
      properties: {},  
      required: [],  
    },  
  },  
];

// ── Executores de ferramentas ────────────────────────────────────────

/**  
 * Executa a ferramenta `check_availability`:  
 * - Busca quartos do tenant  
 * - Verifica reservas conflitantes no intervalo de datas  
 * - Calcula preço total (noites × preço por noite)  
 */  
async function executeCheckAvailability(  
  tenantId: string,  
  args: { checkInDate: string; checkOutDate: string; guestCount: number },  
): Promise<ToolResult> {  
  const startTime = Date.now();

  try {  
    const checkIn = new Date(args.checkInDate + 'T14:00:00');  
    const checkOut = new Date(args.checkOutDate + 'T11:00:00');

    if (isNaN(checkIn.getTime()) || isNaN(checkOut.getTime())) {  
      return {  
        toolName: 'check_availability',  
        success: false,  
        data: { error: 'Datas inválidas. Use o formato YYYY-MM-DD.' },  
        executionTimeMs: Date.now() - startTime,  
      };  
    }

    if (checkIn >= checkOut) {  
      return {  
        toolName: 'check_availability',  
        success: false,  
        data: { error: 'Check-out deve ser posterior ao check-in.' },  
        executionTimeMs: Date.now() - startTime,  
      };  
    }

    const nights = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24));

    // Buscar propriedade do tenant  
    const property = await db.property.findFirst({  
      where: { tenantId },  
      include: { rooms: true },  
    });

    if (!property || property.rooms.length === 0) {  
      return {  
        toolName: 'check_availability',  
        success: false,  
        data: { error: 'Nenhum quarto cadastrado para esta pousada.' },  
        executionTimeMs: Date.now() - startTime,  
      };  
    }

    // Buscar reservas conflitantes (que se sobrepõem ao intervalo solicitado)  
    const conflictingBookings = await db.booking.findMany({  
      where: {  
        tenantId,  
        status: { in: ['confirmed', 'checked_in'] },  
        AND: [  
          { checkIn: { lt: checkOut } },  
          { checkOut: { gt: checkIn } },  
        ],  
      },  
      select: { roomId: true },  
    });

    const occupiedRoomIds = new Set(  
      conflictingBookings  
        .filter(b => b.roomId)  
        .map(b => b.roomId!),  
    );

    // Filtrar quartos disponíveis  
    const availableRooms = property.rooms  
      .filter(room => {  
        // Pular quartos indisponíveis por status  
        if (room.status === 'manutencao' || room.status === 'sujo') return false;  
        // Pular quartos já reservados no período  
        if (occupiedRoomIds.has(room.id)) return false;  
        // Verificar capacidade  
        if (room.capacity < args.guestCount) return false;  
        return true;  
      })  
      .map(room => ({  
        name: room.name,  
        type: room.type,  
        capacity: room.capacity,  
        pricePerNight: room.price,  
        totalPrice: room.price * nights,  
        status: room.status,  
      }));

    return {  
      toolName: 'check_availability',  
      success: true,  
      data: {  
        property: property.name,  
        checkIn: args.checkInDate,  
        checkOut: args.checkOutDate,  
        nights,  
        guestCount: args.guestCount,  
        availableRooms,  
        totalRoomCount: property.rooms.length,  
      },  
      executionTimeMs: Date.now() - startTime,  
    };  
  } catch (error) {  
    return {  
      toolName: 'check_availability',  
      success: false,  
      data: { error: `Erro interno: ${error instanceof Error ? error.message : 'desconhecido'}` },  
      executionTimeMs: Date.now() - startTime,  
    };  
  }  
}

/**  
 * Executa a ferramenta `get_room_details`.  
 */  
async function executeGetRoomDetails(tenantId: string): Promise<ToolResult> {  
  const startTime = Date.now();

  try {  
    const property = await db.property.findFirst({  
      where: { tenantId },  
      include: { rooms: { orderBy: { price: 'asc' } } },  
    });

    if (!property) {  
      return {  
        toolName: 'get_room_details',  
        success: false,  
        data: { error: 'Propriedade não encontrada.' },  
        executionTimeMs: Date.now() - startTime,  
      };  
    }

    const rooms = property.rooms.map(r => ({  
      name: r.name,  
      type: r.type,  
      capacity: r.capacity,  
      pricePerNight: r.price,  
      status: r.status,  
    }));

    return {  
      toolName: 'get_room_details',  
      success: true,  
      data: { property: property.name, rooms },  
      executionTimeMs: Date.now() - startTime,  
    };  
  } catch (error) {  
    return {  
      toolName: 'get_room_details',  
      success: false,  
      data: { error: `Erro: ${error instanceof Error ? error.message : 'desconhecido'}` },  
      executionTimeMs: Date.now() - startTime,  
    };  
  }  
}

/**  
 * Executa a ferramenta `get_policies`.  
 */  
async function executeGetPolicies(tenantId: string): Promise<ToolResult> {  
  const startTime = Date.now();

  try {  
    const policies = await db.knowledgeEntry.findMany({  
      where: { tenantId, category: 'policies' },  
      select: { question: true, answer: true },  
      take: 10,  
    });

    return {  
      toolName: 'get_policies',  
      success: true,  
      data: {  
        policies: policies.map(p => ({ question: p.question, answer: p.answer })),  
      },  
      executionTimeMs: Date.now() - startTime,  
    };  
  } catch (error) {  
    return {  
      toolName: 'get_policies',  
      success: false,  
      data: { error: `Erro: ${error instanceof Error ? error.message : 'desconhecido'}` },  
      executionTimeMs: Date.now() - startTime,  
    };  
  }  
}

// ── Dispatch de ferramentas ──────────────────────────────────────────

const TOOL_EXECUTORS: Record<string, (tenantId: string, args: Record<string, unknown>) => Promise<ToolResult>> = {  
  check_availability: async (tenantId, args) =>  
    executeCheckAvailability(tenantId, args as { checkInDate: string; checkOutDate: string; guestCount: number }),  
  get_room_details: async (tenantId) =>  
    executeGetRoomDetails(tenantId),  
  get_policies: async (tenantId) =>  
    executeGetPolicies(tenantId),  
};

// ── Prompt do sistema para tool calling ──────────────────────────────

function buildToolCallingSystemPrompt(baseSystemPrompt: string, tools: ToolDefinition[]): string {  
  const toolDescriptions = tools.map(t =>  
    `- ${t.name}: ${t.description}\n  Parâmetros: ${JSON.stringify(t.parameters.properties)}`  
  ).join('\n');

  return `${baseSystemPrompt}

Você tem acesso às seguintes ferramentas para consultar dados reais da pousada:

${toolDescriptions}

INSTRUÇÕES IMPORTANTES:  
1. Quando o hóspede perguntar sobre disponibilidade, preços ou quartos, SEMPRE use a ferramenta check_availability com as datas mencionadas.  
2. Se o hóspede não mencionar datas, pergunte ANTES de usar qualquer ferramenta.  
3. Após receber o resultado da ferramenta, formule uma resposta natural e amigável em português.  
4. NUNCA invente preços ou disponibilidade — use SEMPRE os dados reais das ferramentas.  
5. Quando quiser usar uma ferramenta, responda APENAS com JSON no formato: {"tool": "nome_da_ferramenta", "arguments": {"param1": "valor1"}}  
6. Quando tiver a resposta final para o hóspede, responda normalmente em português (sem JSON).`;  
}

// ── Loop principal de Tool Calling ───────────────────────────────────

/**  
 * Executa o loop completo de tool calling.  
 *  
 * Fluxo:  
 * 1. Envia mensagem + tools ao LLM (Tier 2)  
 * 2. Se resposta é JSON com tool call → executa → alimenta resultado → volta ao passo 1  
 * 3. Se resposta é texto normal → retorna  
 * 4. Máximo de `maxIterations` iterações  
 */  
export async function executeToolCallingLoop(  
  message: string,  
  config: ToolCallingConfig,  
): Promise<ToolCallingResponse> {  
  const { tools, maxIterations = 3, tenantId, systemPrompt } = config;  
  const router = await getNeuroRouter();

  const toolCallsLog: ToolCallingResponse['toolCalls'] = [];  
  let currentMessage = message;  
  let currentContext = '';  
  let lastLlmResponse: LLMResponse | null = null;

  for (let iteration = 0; iteration < maxIterations; iteration++) {  
    const fullPrompt = buildToolCallingSystemPrompt(systemPrompt, tools)  
      + (currentContext ? `\n\nResultado das ferramentas:\n${currentContext}\n\n` : '')  
      + `\nMensagem do hóspede: ${currentMessage}`  
      + (iteration > 0 ? '\n\nAgora, com base nos dados acima, responda ao hóspede em português de forma natural.' : '');

    const result = await router.generate({  
      message: fullPrompt,  
      tier: 2,  
      noCache: true,  
    });

    lastLlmResponse = result;  
    const response = result.response.trim();

    // Tentar parsear como tool call JSON  
    let toolCall: { tool: string; arguments: Record<string, unknown> } | null = null;  
    try {  
      // O LLM pode retornar JSON puro ou JSON dentro de markdown  
      const jsonMatch = response.match(/```json\s*([\s\S]*?)\s*```/) || response.match(/(\{[\s\S]*\})/);  
      if (jsonMatch) {  
        const parsed = JSON.parse(jsonMatch[1]);  
        if (parsed.tool && typeof parsed.tool === 'string') {  
          toolCall = {  
            tool: parsed.tool,  
            arguments: parsed.arguments || parsed.params || {},  
          };  
        }  
      }  
    } catch {  
      // Não é JSON — é resposta final  
    }

    if (!toolCall) {  
      // Resposta final do LLM em texto natural  
      return {  
        ...result,  
        response,  
        toolCalls: toolCallsLog,  
        iterations: iteration + 1,  
      };  
    }

    // Executar a ferramenta  
    const executor = TOOL_EXECUTORS[toolCall.tool];  
    if (!executor) {  
      currentContext += `\n[Erro] Ferramenta "${toolCall.tool}" não existe. Disponíveis: ${tools.map(t => t.name).join(', ')}`;  
      continue;  
    }

    const toolResult = await executor(tenantId, toolCall.arguments);  
    toolCallsLog.push({  
      toolName: toolCall.tool,  
      arguments: toolCall.arguments,  
      result: toolResult,  
    });

    if (toolResult.success) {  
      currentContext += `\n[${toolCall.tool}] Sucesso:\n${JSON.stringify(toolResult.data, null, 2)}`;  
    } else {  
      currentContext += `\n[${toolCall.tool}] Erro: ${JSON.stringify(toolResult.data)}`;  
    }  
  }

  // Excedeu maxIterations — usar última resposta  
  return {  
    ...lastLlmResponse!,  
    toolCalls: toolCallsLog,  
    iterations: maxIterations,  
  };  
}  
