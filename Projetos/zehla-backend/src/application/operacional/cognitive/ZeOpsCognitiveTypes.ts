import { ZeCognitiveInput, ZeCognitiveOutput, ZcpHandoffPackage, createZcpHandoff, verifyZcpHandoff } from '../../comercial/cognitive/ZeCognitiveTypes'

export type ZeOpsIntent =
  | 'CRIAR_TAREFA'
  | 'INICIAR_TAREFA'
  | 'CONCLUIR_TAREFA'
  | 'ABRIR_MANUTENCAO'
  | 'PROCESSAR_WEBHOOK'
  | 'CALCULAR_METRICAS_SLA'
  | 'PROCESSAR_TAREFAS_ATRASADAS'
  | 'EXECUTAR_CHECKLIST'

export interface ZeOpsInput extends ZeCognitiveInput {
  intent: ZeOpsIntent
}

export type { ZeCognitiveInput, ZeCognitiveOutput, ZcpHandoffPackage }
export { createZcpHandoff, verifyZcpHandoff }

const OPS_ERROR_MESSAGES: Record<string, string> = {
  TIPO_INVALIDO: 'Tipo de tarefa inválido. Os tipos válidos são: limpeza, manutencao, vistoria, entrega, inspecao.',
  TAREFA_NOT_FOUND: 'Tarefa não encontrada. Verifique o identificador.',
  STAFF_NOT_FOUND: 'Staff não encontrado. Verifique o identificador do colaborador.',
  MAX_TAREFAS_STAFF: 'Staff já possui o limite de tarefas em andamento ou está inativo.',
  CHECKLIST_PENDENTE: 'Existem checklists pendentes para este ativo. Conclua-os antes de finalizar a tarefa.',
  FORNECEDOR_NOT_FOUND: 'Fornecedor não encontrado. Verifique o identificador.',
  FORNECEDOR_INATIVO: 'Fornecedor suspenso ou inativo não pode receber manutenções.',
  MANUTENCAO_NOT_FOUND: 'Manutenção não encontrada. Verifique o identificador.',
  CHECKLIST_NOT_FOUND: 'Checklist não encontrado. Verifique o identificador.',
  HMAC_AUSENTE: 'Assinatura HMAC ausente. Webhook rejeitado.',
  HMAC_INVALIDO: 'Assinatura HMAC inválida. Webhook rejeitado.',
  HMAC_SECRET_NAO_CONFIGURADO: 'Webhook secret não configurado para este fornecedor.',
  ACAO_DESCONHECIDA: 'Ação de webhook desconhecida.',
  SLASEVERA_EXCEDIDA: 'SLA severo excedido. Operação requer avaliação manual.',
  MAXIMO_TAREFAS_STAFF: 'Capacidade máxima de tarefas atingida para este staff.',
  MANUTENCAO_PREVENTIVA_SEVERA_REJEITADA: 'Manutenção preventiva não pode ter gravidade severa.',
  PROPERTY_ID_REQUIRED: 'O identificador da propriedade é obrigatório.',
}

export function translateError(err: Error): string {
  return OPS_ERROR_MESSAGES[err.message] ?? `Erro ao processar: ${err.message}.`
}
