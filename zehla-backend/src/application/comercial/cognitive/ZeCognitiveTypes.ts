import { createHmac, timingSafeEqual } from 'crypto'

export type ZeSalesIntent =
  | 'CAPTURAR_LEAD'
  | 'QUALIFICAR_LEAD'
  | 'CRIAR_PROPOSTA'
  | 'ACEITAR_PROPOSTA'
  | 'SUGERIR_DESCONTO'
  | 'CONFIRMAR_PAGAMENTO'
  | 'CONSULTAR_CONVERSAO'
  | 'CONSULTAR_PAGAMENTO'
  | 'LISTAR_LEADS'

export type ZeMarketerIntent =
  | 'CRIAR_PACOTE'
  | 'EDITAR_PACOTE'
  | 'LISTAR_PACOTES'
  | 'ATIVAR_PACOTE'
  | 'PAUSAR_PACOTE'
  | 'ARQUIVAR_PACOTE'
  | 'ATUALIZAR_PRECIFICACAO'
  | 'CONSULTAR_LEAD'
  | 'LISTAR_LEADS'
  | 'CALCULAR_TAXA_CONVERSAO'
  | 'PROCESSAR_PROPOSTAS_EXPIRADAS'

export interface ZeCognitiveInput {
  messageId: string
  propriedadeId: string
  payload: Record<string, unknown>
  agentId?: string
  zcpToken?: string
}

export interface ZeCognitiveOutput {
  responseId: string
  success: boolean
  responseText: string
  confidenceScore: number
  needsEscalation: boolean
  handoffRequired: boolean
  handoffTo?: 'ze-sales' | 'ze-marketer' | 'ze-host'
  handoffPackage?: ZcpHandoffPackage
  data?: unknown
}

export interface ZcpHandoffPackage {
  packageId: string
  timestamp: string
  origem: 'ze-sales' | 'ze-marketer' | 'ze-ops' | 'ze-analyst'
  destino: 'ze-sales' | 'ze-marketer' | 'ze-host'
  leadId?: string
  propostaId?: string
  pacoteId?: string
  contexto: string
  motivo: string
  payload: Record<string, unknown>
  zcpSignature: string
  zcpSignedAt: string
}

export interface ZeSalesInput extends ZeCognitiveInput {
  intent: ZeSalesIntent
}

export interface ZeMarketerInput extends ZeCognitiveInput {
  intent: ZeMarketerIntent
}

function generateId(): string {
  return `zcp-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

function signZcp(payload: string, secret: string): string {
  return createHmac('sha256', secret).update(payload).digest('hex')
}

export function createZcpHandoff(params: {
  origem: ZcpHandoffPackage['origem']
  destino: ZcpHandoffPackage['destino']
  leadId?: string
  propostaId?: string
  pacoteId?: string
  contexto: string
  motivo: string
  payload: Record<string, unknown>
  zcpSecret: string
}): ZcpHandoffPackage {
  const timestamp = new Date().toISOString()
  const pkg: ZcpHandoffPackage = {
    packageId: generateId(),
    timestamp,
    origem: params.origem,
    destino: params.destino,
    leadId: params.leadId,
    propostaId: params.propostaId,
    pacoteId: params.pacoteId,
    contexto: params.contexto,
    motivo: params.motivo,
    payload: params.payload,
    zcpSignature: '',
    zcpSignedAt: timestamp,
  }
  const { zcpSignature: _, zcpSignedAt: __, ...pkgToSign } = pkg
  pkg.zcpSignature = signZcp(JSON.stringify(pkgToSign), params.zcpSecret)
  return pkg
}

export function verifyZcpHandoff(pkg: ZcpHandoffPackage, zcpSecret: string): boolean {
  const { zcpSignature, zcpSignedAt, ...pkgToVerify } = pkg
  const payloadStr = JSON.stringify(pkgToVerify)
  const expectedSignature = signZcp(payloadStr, zcpSecret)
  try {
    return timingSafeEqual(Buffer.from(expectedSignature, 'utf-8'), Buffer.from(zcpSignature, 'utf-8'))
  } catch {
    return expectedSignature === zcpSignature
  }
}

const ERROR_MESSAGES: Record<string, string> = {
  LEAD_NOT_FOUND: 'Lead não encontrado. Verifique o identificador e tente novamente.',
  LEAD_NOT_QUALIFIED: 'Este lead não está qualificado para receber propostas. Qualifique-o primeiro.',
  LEAD_ALREADY_EXISTS: 'Já existe um lead com este email ou documento.',
  PROPOSTA_NOT_FOUND: 'Proposta não encontrada. Verifique o identificador.',
  PROPOSTA_WRONG_STATUS: 'Esta ação não é permitida no status atual da proposta.',
  PACOTE_NOT_FOUND: 'Pacote não encontrado. Verifique o identificador.',
  PACOTE_INACTIVE: 'Este pacote não está ativo no momento.',
  PAGAMENTO_NOT_FOUND: 'Pagamento não encontrado.',
  PAGAMENTO_WRONG_STATUS: 'Este pagamento não pode ser processado no status atual.',
  CONVERSAO_NOT_FOUND: 'Conversão não encontrada.',
  INVALID_PAYMENT_AMOUNT: 'O valor do pagamento não corresponde ao sinal da proposta.',
  DISCOUNT_EXCEEDS_LIMIT: 'O desconto sugerido excede o limite máximo de 20%.',
  UNAUTHORIZED_ACCESS: 'Acesso não autorizado. Este agente não possui permissão para esta operação.',
  PROPERTY_ID_REQUIRED: 'O identificador da propriedade é obrigatório.',
  INSUFFICIENT_SCORE: 'Score insuficiente para qualificação. Mínimo necessário: 50.',
}

export function translateError(err: Error): string {
  return ERROR_MESSAGES[err.message] ?? `Erro ao processar: ${err.message}.`
}
