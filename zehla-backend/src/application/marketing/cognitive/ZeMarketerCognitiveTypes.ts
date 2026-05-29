import { Result } from '../../../shared/Result'

export enum ZeMarketerIntent {
  ANALISAR_SENTIMENTO_REVIEW = 'ANALISAR_SENTIMENTO_REVIEW',
  RESPONDER_REVIEW = 'RESPONDER_REVIEW',
  CRIAR_CAMPANHA_REMARKETING = 'CRIAR_CAMPANHA_REMARKETING',
  AGENDAR_POST = 'AGENDAR_POST',
  CALCULAR_METRICAS_MARKETING = 'CALCULAR_METRICAS_MARKETING',
  PROCESSAR_WEBHOOK_REVIEW = 'PROCESSAR_WEBHOOK_REVIEW',
}

export interface ZcpHandoffPackage {
  tipo: string
  needsEscalation: boolean
  destino: string
  payload: Record<string, unknown>
}

export type ZeMarketerResult<T> = Promise<Result<
  { dados: T; handoff?: ZcpHandoffPackage },
  Error
>>

export interface ReviewAnalisada {
  reviewId: string
  sentimento: string
  nota: number
  precisaHandoff: boolean
  taskSugerida?: string
}

export interface ReviewRespondida {
  reviewId: string
  conteudoId: string
  tom: string
}

export interface CampanhaCriada {
  campanhaId: string
  conteudoId: string
  possuiPromiseFinanceira: boolean
  precisaHandoffAnalyst: boolean
}

export interface PostAgendado {
  postId: string
  canal: string
  dataAgendamento: Date | null
}

export interface MetricasCalculadas {
  metricaId: string
  totalReviews: number
  notaMedia: number | null
}

export interface WebhookProcessado {
  reviewId: string
  sentimento: string
  portal: string
  handoff?: ZcpHandoffPackage
}

export const ERROR_MESSAGES: Record<string, string> = {
  REVIEW_NOT_FOUND: 'Não encontramos esse review. Pode ser que ele tenha sido removido ou o ID esteja incorreto.',
  REVIEW_ALREADY_RESPONDED: 'Este review já foi respondido. Se precisar alterar a resposta, entre em contato com o Zé-Host.',
  REVIEW_NOT_CRITICAL: 'Este review não foi classificado como crítico. Apenas reviews com nota até 3 podem ser escalados.',
  REVIEW_INVALID_SENTIMENT: 'Não foi possível classificar o sentimento com a nota informada. Verifique se a nota está entre 1 e 10.',
  REVIEW_RESPONSE_BLOCKED: 'A resposta contém termos que não podem ser publicados. Revise o texto e tente novamente.',
  REVIEW_RESPONSE_GENERIC: 'A resposta precisa fazer referência à experiência do hóspede. Inclua detalhes da estadia para evitar respostas genéricas.',
  CAMPANHA_SEM_SEGMENTO: 'Toda campanha precisa ter um público-alvo definido. Escolha entre hóspedes satisfeitos, leads frios ou todos.',
  CAMPANHA_SEM_OPTIN: 'Este contato não autorizou o recebimento de comunicações de marketing. Não podemos enviar campanhas sem consentimento.',
  CAMPANHA_PROMISE_FINANCEIRA: 'A campanha contém promise financeira que precisa ser validada pelo Zé-Analyst antes de ser aprovada.',
  CONTEUDO_TOM_INVALIDO: 'O tom do conteúdo não é reconhecido. Use: profissional, acolhedor, entusiasta ou neutro.',
  POST_CANAL_INVALIDO: 'Canal de publicação não suportado. Use Instagram ou Facebook para posts.',
  POST_SEM_MIDIA_PROMOCIONAL: 'Posts promocionais precisam de pelo menos uma imagem ou vídeo.',
  METRICA_PERIODO_INVALIDO: 'O período informado para as métricas é inválido. A data final deve ser posterior à data inicial.',
  HANDOFF_REQUIRED: 'Esta ação precisa ser aprovada pelo Zé-Host antes de ser executada.',
  INTENT_NOT_RECOGNIZED: 'Não entendi a intenção. As opções são: analisar sentimento, responder review, criar campanha, agendar post, calcular métricas ou processar webhook.',
}

export function translateError(error: Error): string {
  const key = error.message.trim()
  return ERROR_MESSAGES[key] || `Ocorreu um erro inesperado: ${error.message}`
}

export function buildHandoff(
  tipo: string,
  destino: string,
  payload: Record<string, unknown>,
): ZcpHandoffPackage {
  return {
    tipo,
    destino,
    needsEscalation: true,
    payload,
  }
}
