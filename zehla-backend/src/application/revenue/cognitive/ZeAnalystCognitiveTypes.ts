import { createZcpHandoff, verifyZcpHandoff } from '../../comercial/cognitive/ZeCognitiveTypes'
import type { ZeCognitiveInput, ZeCognitiveOutput, ZcpHandoffPackage } from '../../comercial/cognitive/ZeCognitiveTypes'

export type ZeAnalystIntent =
  | 'CALCULAR_TARIFA_DINAMICA'
  | 'VALIDAR_BREAK_EVEN'
  | 'SUGERIR_DESCONTO_ESTRATEGICO'
  | 'GERAR_FORECAST'
  | 'CALCULAR_METRICAS_REVENUE'
  | 'REBALANCEAR_TARIFAS_POR_CANAL'

export interface ZeAnalystInput extends ZeCognitiveInput {
  intent: ZeAnalystIntent
}

export { createZcpHandoff, verifyZcpHandoff }
export type { ZeCognitiveInput, ZeCognitiveOutput, ZcpHandoffPackage }

const ANALYST_ERROR_MESSAGES: Record<string, string> = {
  TARIFA_NOT_FOUND: 'Regra tarifária não encontrada. Verifique o identificador.',
  TARIFA_BREAK_EVEN_VIOLATION: 'Valor proposto viola o break-even point. Operação bloqueada.',
  TARIFA_DELTA_EXCEEDED: 'Variação máxima de 20% excedida.',
  TARIFA_FERIADO_BLOCKED: 'Tarifa de feriado não pode ser alterada pelo Zé-Analyst. Encaminhando para Zé-Host.',
  TARIFA_PROMOCIONAL_BLOCKED: 'Tarifa promocional requer aprovação do Zé-Host.',
  RATE_PARITY_VIOLATION: 'Tarifa do canal direto viola paridade contratual com OTAs (máx 10% de diferença).',
  OCUPACAO_NOT_FOUND: 'Ocupação não encontrada para a data especificada.',
  OCUPACAO_INVALIDA: 'Ocupação não pode exceder a capacidade total da propriedade.',
  SAZONALIDADE_NOT_FOUND: 'Sazonalidade não encontrada para o período.',
  FORECAST_HORIZONTE_INVALIDO: 'Horizonte deve ser 7, 30 ou 90 dias.',
  FORECAST_CONFIANCA_EXCEDIDA: 'Confiança excede o limite do horizonte.',
  CANAL_INVALIDO: 'Canal deve ser direto, booking, airbnb ou expedia.',
  PROPERTY_ID_REQUIRED: 'O identificador da propriedade é obrigatório.',
  NENHUM_DADO_OCUPACAO: 'Nenhum dado de ocupação encontrado para o período.',
}

export function translateError(err: Error): string {
  return ANALYST_ERROR_MESSAGES[err.message] ?? `Erro ao processar: ${err.message}.`
}
