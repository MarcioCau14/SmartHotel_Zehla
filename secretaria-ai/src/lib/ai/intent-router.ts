/**  
 * Intent Router — Classificador de Intenção para o Pipeline Cognitivo  
 *  
 * Determina o que o hóspede quer ANTES de carregar contexto pesado.  
 * Usa DUAS estratégias em cascata:  
 *   1. Heurística rápida (<1ms) — regex para padrões óbvios  
 *   2. LLM Classificador (Tier 1, <200ms) — para casos ambíguos  
 *  
 * Três intenções principais:  
 *   - `duvida_geral`     → RAG semântico (FAQ)  
 *   - `cotacao_reserva`  → Tool Calling (disponibilidade de quartos)  
 *   - `human_handover`   → Escala para atendente humano  
 */

import { getNeuroRouter } from './zaos-neuro-router';

// ── Tipos ───────────────────────────────────────────────────────────

export type GuestIntent = 'duvida_geral' | 'cotacao_reserva' | 'human_handover';

export interface IntentResult {  
  /** Intenção classificada */  
  intent: GuestIntent;  
  /** Confiança da classificação (0-1) */  
  confidence: number;  
  /** Método usado: 'heuristic' | 'llm' */  
  method: 'heuristic' | 'llm';  
  /** Palavras-chave que motivaram a classificação */  
  matchedKeywords: string[];  
  /** Data/hora da classificação */  
  timestamp: Date;  
}

// ── Heurísticas rápidas ──────────────────────────────────────────────

/** Padrões que indicam claramente intenção de cotação/reserva */  
const BOOKING_INTENT_PATTERNS: Array<{ regex: RegExp; keywords: string[]; confidence: number }> = [  
  { regex: /\b(reserv[aei]|quero reservar|fazer reserva|agendar|dispon[ií]vel para|quarto para)\b/i, keywords: ['reserva', 'reservar', 'agendar', 'disponível'], confidence: 0.95 },  
  { regex: /\b(pre[cç]o|valor|custo|tarifa|quanto\s*(custa|cobras?|fica))\s.*(quarto|su[ií]te|di[aá]ria|noite|hospedagem|estadia)/i, keywords: ['preço', 'valor', 'tarifa'], confidence: 0.90 },  
  { regex: /\b(tem\s*(vaga|quarto|dispon[ií]vel|lugar)|quartos?\s*(dispon[ií]veis|livres))\b/i, keywords: ['tem vaga', 'tem quarto', 'disponível'], confidence: 0.92 },  
  { regex: /\b(check[\s-]?in|check[\s-]?out|chegar|sair|data|di[aá]ria|noite)\b.*\b(\d{1,2}[\/\-]\d{1,2}|\d{1,2}\s*de\s*\w+|fim\s*de\s*semana|semana\s*que\s*vem|pr[oó]ximo|pr[oó]xima)/i, keywords: ['check-in', 'data', 'fim de semana'], confidence: 0.93 },  
  { regex: /\b(quero\s*uma?\s*(su[ií]te|quarto|chal[eé])|busco\s*(hospedagem|pousada|quarto))\b/i, keywords: ['quero uma suíte', 'quero um quarto'], confidence: 0.91 },  
  { regex: /\b(para\s*(\d|dois|tr[eê]s|quatro|cinco|seis|sete|oito|nove|dez)\s*(pessoas?|h[oó]spedes?|adultos?|camas?))\b/i, keywords: ['pessoas', 'hóspedes'], confidence: 0.88 },  
  { regex: /\b(cota[cç][aã]o|or[cç]amento|simular|calcular)\b/i, keywords: ['cotação', 'orçamento', 'simular'], confidence: 0.94 },  
];

/** Padrões que indicam pedido de atendente humano */  
const HUMAN_HANDOVER_PATTERNS: Array<{ regex: RegExp; keywords: string[]; confidence: number }> = [  
  { regex: /\b(urgente|emerg[eê]ncia|socorro|pol[ií]cia|samu|bombeiro)\b/i, keywords: ['urgente', 'emergência', 'socorro'], confidence: 0.98 },  
  { regex: /\b(fal[ae]r?\s*(com|para)\s*(o|um)\s*(gerente|dono|respons[aá]vel|humano|persona|atendente))\b/i, keywords: ['falar com gerente', 'atendente humano'], confidence: 0.95 },  
  { regex: /^(n[aã]o\s*(quero|gosto)\s*(de|do?)\s*(ia|robo?t?|autom[aá]tico|virtual|chat))/i, keywords: ['não quero IA', 'não gosto de robô'], confidence: 0.90 },  
  { regex: /\b(ningu[eé]m\s*responde|demor[oa]\s*(demais|muito)|j[aá]\s*(esperei|tento|horras?)|insatisfeit[oa])\b/i, keywords: ['ninguém responde', 'demora', 'já esperei'], confidence: 0.85 },  
  { regex: /\b(advogado|processo|justi[cç]a|procon|reclame\s*aqui|den[uú]ncia)\b/i, keywords: ['advogado', 'procon', 'denúncia'], confidence: 0.92 },  
  { regex: /\b(agress[aã]o|amea[cç]a|perigo|viol[eê]ncia|roubo|furto)\b/i, keywords: ['agressão', 'ameaça', 'perigo'], confidence: 0.97 },  
];

/** Padrões de dúvida geral (FAQ) — positivo para não ser cotação nem urgência */  
const FAQ_INTENT_PATTERNS: Array<{ regex: RegExp; keywords: string[]; confidence: number }> = [  
  { regex: /\b(hor[aá]rio|funciona|abre|fecha|hor[aá]rio\s*(de )?(check|piscina|caf[eé]|restaurante|academia|spa|bar))\b/i, keywords: ['horário', 'funciona', 'abre'], confidence: 0.88 },  
  { regex: /\b(piscina|wi[\s-]?fi|wifi|academia|spa|estacionamento|churrasqueira|playground|p[eé]tio|lareira)\b/i, keywords: ['piscina', 'wifi', 'estacionamento'], confidence: 0.85 },  
  { regex: /\b(como\s*chegar|endere[cç]o|localiza[cç][aã]o|onde\s*fica|gps|waze|google\s*maps)\b/i, keywords: ['como chegar', 'endereço', 'localização'], confidence: 0.90 },  
  { regex: /\b(aceita\s*(cachorro|pet|animal)|pet|c[aã]o|gato|animal\s*de\s*estima[cç][aã]o)\b/i, keywords: ['aceita pet', 'cachorro', 'animal de estimação'], confidence: 0.93 },  
  { regex: /\b(caf[eé]\s*(da\s*)?manh[aã]|caf[eé]\s*incluso|incluso|inclui|tem\s*caf[eé])\b/i, keywords: ['café da manhã', 'café incluso'], confidence: 0.87 },  
  { regex: /\b(crian[cç]a|beb[eê]|ber[cç]o|cama\s*extra|cama\s*adicional)\b/i, keywords: ['criança', 'berço', 'cama extra'], confidence: 0.84 },  
  { regex: /\b(o\s*que\s*(fazer|tem|oferece)|atividade|passeio|restaurante|comer|dica|recomend)/i, keywords: ['o que fazer', 'atividade', 'restaurante'], confidence: 0.82 },  
  { regex: /\b(pol[ií]tica|regras|cancelamento|check[\s-]?in|check[\s-]?out)\b(?!\s*(\d|data|di[aá]ria|noite))/i, keywords: ['política', 'regras', 'cancelamento'], confidence: 0.86 },  
];

// ── LLM Intent Classifier prompt ────────────────────────────────────

const INTENT_CLASSIFIER_PROMPT = `Você é um classificador de intenção de mensagens de hóspedes de pousada via WhatsApp.

Classifique EXCLUSIVAMENTE em UMA destas três intenções:

1. "duvida_geral" — Perguntas sobre a pousada (horários, serviços, localização, políticas, recomendações). Qualquer pergunta que NÃO envolva datas específicas ou cotação.

2. "cotacao_reserva" — O hóspede quer saber preço, disponibilidade para datas específicas, fazer reserva, ou está mencionando datas e número de pessoas.

3. "human_handover" — Situações de emergência, insatisfação grave, solicitação de falar com humano, ameaças, ou questões legais.

Responda APENAS com o nome da intenção, nada mais. Exemplo de resposta: cotacao_reserva`;

// ── Funções ──────────────────────────────────────────────────────────

/**  
 * Classifica a intenção de uma mensagem de hóspede.  
 *  
 * Estratégia em cascata:  
 * 1. Tenta heurística (<1ms)  
 * 2. Se heurística não confia (confidence < 0.85), chama LLM Tier 1 (<200ms)  
 */  
export async function classifyIntent(message: string): Promise<IntentResult> {  
  const lower = message.toLowerCase().trim();

  // ── Passo 1: Heurística rápida ──

  // Verificar human_handover primeiro (prioridade de segurança)  
  for (const { regex, keywords, confidence } of HUMAN_HANDOVER_PATTERNS) {  
    if (regex.test(lower)) {  
      const matched = keywords.filter(kw => lower.includes(kw.toLowerCase()));  
      return {  
        intent: 'human_handover',  
        confidence,  
        method: 'heuristic',  
        matchedKeywords: matched,  
        timestamp: new Date(),  
      };  
    }  
  }

  // Verificar cotacao_reserva  
  for (const { regex, keywords, confidence } of BOOKING_INTENT_PATTERNS) {  
    if (regex.test(lower)) {  
      const matched = keywords.filter(kw => lower.includes(kw.toLowerCase()));  
      return {  
        intent: 'cotacao_reserva',  
        confidence,  
        method: 'heuristic',  
        matchedKeywords: matched,  
        timestamp: new Date(),  
      };  
    }  
  }

  // Verificar FAQ  
  for (const { regex, keywords, confidence } of FAQ_INTENT_PATTERNS) {  
    if (regex.test(lower)) {  
      const matched = keywords.filter(kw => lower.includes(kw.toLowerCase()));  
      return {  
        intent: 'duvida_geral',  
        confidence,  
        method: 'heuristic',  
        matchedKeywords: matched,  
        timestamp: new Date(),  
      };  
    }  
  }

  // ── Passo 2: LLM Classifier (Tier 1) ──  
  try {  
    const router = await getNeuroRouter();  
    const result = await router.generate({  
      message: `${INTENT_CLASSIFIER_PROMPT}\n\nMensagem do hóspede: "${message}"`,  
      tier: 1,  
      noCache: true,  
      maxLatencyMs: 500,  
    });

    const llmIntent = result.response.trim().toLowerCase();  
    const validIntents: GuestIntent[] = ['duvida_geral', 'cotacao_reserva', 'human_handover'];  
    const matchedIntent = validIntents.find(i => llmIntent.includes(i));

    if (matchedIntent) {  
      return {  
        intent: matchedIntent,  
        confidence: 0.78,  
        method: 'llm',  
        matchedKeywords: [],  
        timestamp: new Date(),  
      };  
    }  
  } catch {  
    // LLM falhou — fallback para duvida_geral (mais seguro)  
  }

  // ── Fallback: duvida_geral ──  
  return {  
    intent: 'duvida_geral',  
    confidence: 0.5,  
    method: 'heuristic',  
    matchedKeywords: [],  
    timestamp: new Date(),  
  };  
}

/**  
 * Retorna um resumo legível da intenção para logging.  
 */  
export function formatIntentLog(intentResult: IntentResult): string {  
  const intentLabels: Record<GuestIntent, string> = {  
    duvida_geral: '📝 Dúvida Geral',  
    cotacao_reserva: '💰 Cotação/Reserva',  
    human_handover: '👤 Handover Humano',  
  };  
  return `${intentLabels[intentResult.intent]} (conf: ${intentResult.confidence}, via: ${intentResult.method})`;  
}  
