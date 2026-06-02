import { Result } from '../../../shared/Result'
import { ITarefaPort } from '../ports/ITarefaPort'
import { IStaffPort } from '../ports/IStaffPort'
import { IManutencaoPort } from '../ports/IManutencaoPort'
import { IFornecedorPort } from '../ports/IFornecedorPort'
import { ISlaPort } from '../ports/ISlaPort'
import { IChecklistPort } from '../ports/IChecklistPort'
import { CriarTarefaUseCase } from '../use-cases/CriarTarefaUseCase'
import { IniciarTarefaUseCase } from '../use-cases/IniciarTarefaUseCase'
import { ConcluirTarefaUseCase } from '../use-cases/ConcluirTarefaUseCase'
import { AbrirManutencaoUseCase } from '../use-cases/AbrirManutencaoUseCase'
import { ProcessarWebhookFornecedorUseCase } from '../use-cases/ProcessarWebhookFornecedorUseCase'
import { CalcularMetricasSlaUseCase } from '../use-cases/CalcularMetricasSlaUseCase'
import { ProcessarTarefasAtrasadasUseCase } from '../use-cases/ProcessarTarefasAtrasadasUseCase'
import { ExecutarChecklistUseCase } from '../use-cases/ExecutarChecklistUseCase'
import { ZeOpsInput, ZeCognitiveOutput, ZcpHandoffPackage, createZcpHandoff, translateError } from './ZeOpsCognitiveTypes'
import { createLogger } from '../../../infrastructure/observability/Logger'
import { getTraceId, getTenantId } from '../../../infrastructure/observability/RequestLogger'

function generateId(): string {
  return `zo-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

export class ZeOpsCognitiveService {
  constructor(
    private readonly tarefaPort: ITarefaPort,
    private readonly staffPort: IStaffPort,
    private readonly manutencaoPort: IManutencaoPort,
    private readonly fornecedorPort: IFornecedorPort,
    private readonly slaPort: ISlaPort,
    private readonly checklistPort: IChecklistPort,
    private readonly criarTarefaUseCase: CriarTarefaUseCase,
    private readonly iniciarTarefaUseCase: IniciarTarefaUseCase,
    private readonly concluirTarefaUseCase: ConcluirTarefaUseCase,
    private readonly abrirManutencaoUseCase: AbrirManutencaoUseCase,
    private readonly processarWebhookUseCase: ProcessarWebhookFornecedorUseCase,
    private readonly calcularMetricasSlaUseCase: CalcularMetricasSlaUseCase,
    private readonly processarTarefasAtrasadasUseCase: ProcessarTarefasAtrasadasUseCase,
    private readonly executarChecklistUseCase: ExecutarChecklistUseCase,
    private readonly zcpSecret: string,
  ) {}

  private readonly log = createLogger()

  async processIntent(input: ZeOpsInput): Promise<ZeCognitiveOutput> {
    try {
      switch (input.intent) {
        case 'CRIAR_TAREFA':
          return await this.handleCriarTarefa(input)
        case 'INICIAR_TAREFA':
          return await this.handleIniciarTarefa(input)
        case 'CONCLUIR_TAREFA':
          return await this.handleConcluirTarefa(input)
        case 'ABRIR_MANUTENCAO':
          return await this.handleAbrirManutencao(input)
        case 'PROCESSAR_WEBHOOK':
          return await this.handleProcessarWebhook(input)
        case 'CALCULAR_METRICAS_SLA':
          return await this.handleCalcularMetricasSla(input)
        case 'PROCESSAR_TAREFAS_ATRASADAS':
          return await this.handleProcessarTarefasAtrasadas(input)
        case 'EXECUTAR_CHECKLIST':
          return await this.handleExecutarChecklist(input)
        default:
          return this.output(false, 'Intenção não reconhecida pelo Zé-Ops.', input.messageId, 0.3)
      }
    } catch (error) {
      this.log.error({ err: error, traceId: getTraceId(), tenantId: getTenantId() }, 'Erro de infraestrutura: falha ao processar intenção no Zé-Ops')
      return this.output(false, 'Erro interno no Zé-Ops. Operação cancelada.', input.messageId, 0.0, true)
    }
  }

  private async handleCriarTarefa(input: ZeOpsInput): Promise<ZeCognitiveOutput> {
    const { tipo, titulo, descricao, prioridade, responsavelId, tipoResponsavel, ativoId, tipoAtivo } = input.payload as Record<string, unknown>
    if (!tipo || !titulo) {
      this.log.warn({ error: 'Campos obrigatórios: tipo e título', traceId: getTraceId(), tenantId: getTenantId() }, 'Regra de negócio violada: campos obrigatórios ausentes para criar tarefa')
      return this.output(false, 'Preciso do tipo e título da tarefa para criá-la.', input.messageId, 0.4)
    }
    const result = await this.criarTarefaUseCase.execute({
      tipo: tipo as string,
      propriedadeId: input.propriedadeId,
      titulo: titulo as string,
      descricao: descricao as string | undefined,
      prioridade: prioridade as string | undefined,
      responsavelId: responsavelId as string | undefined,
      tipoResponsavel: tipoResponsavel as 'staff' | 'fornecedor' | undefined,
      ativoId: ativoId as string | undefined,
      tipoAtivo: tipoAtivo as string | undefined,
    })
    if (result.isFail) {
      this.log.warn({ error: result.error.message, traceId: getTraceId(), tenantId: getTenantId() }, 'Regra de negócio violada: falha ao criar tarefa')
      return this.output(false, translateError(result.error), input.messageId, 0.3, true)
    }
    return this.output(
      true,
      `Tarefa "${result.value.titulo}" criada com sucesso! ID: ${result.value.id}.`,
      input.messageId,
      0.95,
      false,
      false,
      undefined,
      { tarefaId: result.value.id, tipo: result.value.tipo, status: result.value.status },
    )
  }

  private async handleIniciarTarefa(input: ZeOpsInput): Promise<ZeCognitiveOutput> {
    const { tarefaId, responsavelId, tipoResponsavel } = input.payload as Record<string, unknown>
    if (!tarefaId || !responsavelId || !tipoResponsavel) {
      this.log.warn({ error: 'Campos obrigatórios: tarefaId, responsavelId, tipoResponsavel', traceId: getTraceId(), tenantId: getTenantId() }, 'Regra de negócio violada: campos obrigatórios ausentes para iniciar tarefa')
      return this.output(false, 'Preciso do ID da tarefa, responsável e tipo de responsável para iniciá-la.', input.messageId, 0.4)
    }
    const result = await this.iniciarTarefaUseCase.execute({
      tarefaId: tarefaId as string,
      propriedadeId: input.propriedadeId,
      responsavelId: responsavelId as string,
      tipoResponsavel: tipoResponsavel as 'staff' | 'fornecedor',
    })
    if (result.isFail) {
      this.log.warn({ error: result.error.message, traceId: getTraceId(), tenantId: getTenantId() }, 'Regra de negócio violada: falha ao iniciar tarefa')
      return this.output(false, translateError(result.error), input.messageId, 0.3, true)
    }
    return this.output(
      true,
      `Tarefa "${result.value.titulo}" iniciada por ${responsavelId}.`,
      input.messageId,
      0.9,
    )
  }

  private async handleConcluirTarefa(input: ZeOpsInput): Promise<ZeCognitiveOutput> {
    const { tarefaId, observacoes } = input.payload as Record<string, unknown>
    if (!tarefaId) {
      this.log.warn({ error: 'Campo obrigatório: tarefaId', traceId: getTraceId(), tenantId: getTenantId() }, 'Regra de negócio violada: ID da tarefa ausente para concluir')
      return this.output(false, 'Preciso do ID da tarefa para concluí-la.', input.messageId, 0.4)
    }
    const result = await this.concluirTarefaUseCase.execute({
      tarefaId: tarefaId as string,
      propriedadeId: input.propriedadeId,
      observacoes: observacoes as string | undefined,
    })
    if (result.isFail) {
      this.log.warn({ error: result.error.message, traceId: getTraceId(), tenantId: getTenantId() }, 'Regra de negócio violada: falha ao concluir tarefa')
      return this.output(false, translateError(result.error), input.messageId, 0.3, true)
    }
    return this.output(
      true,
      `Tarefa "${result.value.titulo}" concluída!`,
      input.messageId,
      0.95,
    )
  }

  private async handleAbrirManutencao(input: ZeOpsInput): Promise<ZeCognitiveOutput> {
    const { tipo, gravidade, categoria, ativoId, tipoAtivo, descricaoProblema, fornecedorId, titulo } = input.payload as Record<string, unknown>
    if (!tipo || !gravidade || !categoria || !descricaoProblema) {
      this.log.warn({ error: 'Campos obrigatórios: tipo, gravidade, categoria, descricaoProblema', traceId: getTraceId(), tenantId: getTenantId() }, 'Regra de negócio violada: campos obrigatórios ausentes para abrir manutenção')
      return this.output(false, 'Preciso do tipo, gravidade, categoria e descrição do problema para abrir manutenção.', input.messageId, 0.4)
    }
    const result = await this.abrirManutencaoUseCase.execute({
      propriedadeId: input.propriedadeId,
      tipo: tipo as string,
      gravidade: gravidade as string,
      categoria: categoria as string,
      ativoId: ativoId as string | undefined,
      tipoAtivo: tipoAtivo as string | undefined,
      descricaoProblema: descricaoProblema as string,
      fornecedorId: fornecedorId as string | undefined,
      titulo: titulo as string | undefined,
    })
    if (result.isFail) {
      this.log.warn({ error: result.error.message, traceId: getTraceId(), tenantId: getTenantId() }, 'Regra de negócio violada: falha ao abrir manutenção')
      return this.output(false, translateError(result.error), input.messageId, 0.3, result.error.message === 'Manutenção preventiva não pode ter gravidade severa')
    }
    if (result.value.requerAprovacaoHumana) {
      const handoff = this.requestHandoff({
        destino: 'ze-host',
        contexto: `Manutenção ${result.value.manutencao.id} requer aprovação humana.`,
        motivo: `3ª interdição severa em 24h na propriedade ${input.propriedadeId}. Circuit Breaker ativado.`,
        payload: {
          manutencaoId: result.value.manutencao.id,
          tarefaId: result.value.tarefa.id,
          gravidade: gravidade as string,
          categoria: categoria as string,
        },
      })
      return this.output(
        true,
        `Manutenção criada, mas requer aprovação humana (3ª interdição severa). Protocolo gerado para Zé-Host.`,
        input.messageId,
        0.6,
        true,
        true,
        'ze-host',
        {
          tarefaId: result.value.tarefa.id,
          manutencaoId: result.value.manutencao.id,
          requerAprovacaoHumana: true,
          handoff,
        },
      )
    }
    return this.output(
      true,
      `Manutenção ${result.value.manutencao.id} aberta com sucesso! Tarefa: ${result.value.tarefa.id}.`,
      input.messageId,
      0.95,
      false,
      false,
      undefined,
      {
        tarefaId: result.value.tarefa.id,
        manutencaoId: result.value.manutencao.id,
        interditado: result.value.manutencao.interditaQuarto,
      },
    )
  }

  private async handleProcessarWebhook(input: ZeOpsInput): Promise<ZeCognitiveOutput> {
    const { fornecedorId, manutencaoId, acao, payload, signature, observacoes } = input.payload as Record<string, unknown>
    if (!fornecedorId || !manutencaoId || !acao) {
      this.log.warn({ error: 'Campos obrigatórios: fornecedorId, manutencaoId, acao', traceId: getTraceId(), tenantId: getTenantId() }, 'Regra de negócio violada: campos obrigatórios ausentes para processar webhook')
      return this.output(false, 'Preciso do ID do fornecedor, ID da manutenção e ação para processar o webhook.', input.messageId, 0.4)
    }
    const result = await this.processarWebhookUseCase.execute({
      fornecedorId: fornecedorId as string,
      manutencaoId: manutencaoId as string,
      propriedadeId: input.propriedadeId,
      acao: acao as 'a_caminho' | 'em_andamento' | 'concluido' | 'cancelado' | 'problema',
      payload: (payload as Record<string, unknown>) || {},
      signature: signature as string | undefined,
      observacoes: observacoes as string | undefined,
    })
    if (result.isFail) {
      this.log.warn({ error: result.error.message, traceId: getTraceId(), tenantId: getTenantId() }, 'Regra de negócio violada: falha ao processar webhook de fornecedor')
      const errMsg = result.error.message
      if (errMsg.includes('HMAC') || errMsg.includes('Assinatura') || errMsg.includes('secret')) {
        return this.output(false, translateError(result.error), input.messageId, 0.2)
      }
      return this.output(false, translateError(result.error), input.messageId, 0.3, true)
    }
    return this.output(
      true,
      `Webhook processado: manutenção ${manutencaoId} atualizada para "${acao}".`,
      input.messageId,
      0.9,
    )
  }

  private async handleCalcularMetricasSla(input: ZeOpsInput): Promise<ZeCognitiveOutput> {
    const { dataInicio, dataFim } = input.payload as Record<string, unknown>
    if (!dataInicio || !dataFim) {
      this.log.warn({ error: 'Campos obrigatórios: dataInicio, dataFim', traceId: getTraceId(), tenantId: getTenantId() }, 'Regra de negócio violada: datas obrigatórias ausentes para calcular SLA')
      return this.output(false, 'Preciso das datas de início e fim para calcular métricas de SLA.', input.messageId, 0.4)
    }
    const result = await this.calcularMetricasSlaUseCase.execute({
      propriedadeId: input.propriedadeId,
      dataInicio: new Date(dataInicio as string),
      dataFim: new Date(dataFim as string),
    })
    if (result.isFail) {
      this.log.warn({ error: result.error.message, traceId: getTraceId(), tenantId: getTenantId() }, 'Regra de negócio violada: falha ao calcular métricas de SLA')
      return this.output(false, translateError(result.error), input.messageId, 0.3, true)
    }
    const { total, dentroPrazo, violadas, taxaCumprimento, breakdown } = result.value
    return this.output(
      true,
      `SLA: ${taxaCumprimento}% de cumprimento (${dentroPrazo} dentro do prazo / ${total} total). ${violadas} violação(ões).`,
      input.messageId,
      0.9,
      false,
      false,
      undefined,
      { total, dentroPrazo, violadas, taxaCumprimento, breakdown },
    )
  }

  private async handleProcessarTarefasAtrasadas(input: ZeOpsInput): Promise<ZeCognitiveOutput> {
    const result = await this.processarTarefasAtrasadasUseCase.execute(input.propriedadeId)
    if (result.isFail) {
      this.log.warn({ error: result.error.message, traceId: getTraceId(), tenantId: getTenantId() }, 'Regra de negócio violada: falha ao processar tarefas atrasadas')
      return this.output(false, translateError(result.error), input.messageId, 0.3, true)
    }
    return this.output(
      true,
      `${result.value.length} tarefa(s) atrasada(s) encontrada(s).`,
      input.messageId,
      0.85,
      false,
      false,
      undefined,
      { tarefasAtrasadas: result.value.map(t => ({ id: t.id, titulo: t.titulo, tipo: t.tipo, dataLimite: t.dataLimite })) },
    )
  }

  private async handleExecutarChecklist(input: ZeOpsInput): Promise<ZeCognitiveOutput> {
    const { checklistId, acao, itemId } = input.payload as Record<string, unknown>
    if (!checklistId || !acao) {
      this.log.warn({ error: 'Campos obrigatórios: checklistId, acao', traceId: getTraceId(), tenantId: getTenantId() }, 'Regra de negócio violada: campos obrigatórios ausentes para executar checklist')
      return this.output(false, 'Preciso do ID do checklist e da ação (iniciar, concluir_item, concluir).', input.messageId, 0.4)
    }
    const result = await this.executarChecklistUseCase.execute({
      checklistId: checklistId as string,
      propriedadeId: input.propriedadeId,
      acao: acao as 'iniciar' | 'concluir_item' | 'concluir',
      itemId: itemId as string | undefined,
    })
    if (result.isFail) {
      this.log.warn({ error: result.error.message, traceId: getTraceId(), tenantId: getTenantId() }, 'Regra de negócio violada: falha ao executar checklist')
      return this.output(false, translateError(result.error), input.messageId, 0.3, true)
    }
    const status = result.value.status
    const totalItens = result.value.itens.length
    const concluidos = result.value.itens.filter(i => i.concluido).length
    return this.output(
      true,
      `Checklist "${result.value.nome}" ${acao === 'concluir' ? 'concluído' : 'atualizado'}. Status: ${status}. Itens: ${concluidos}/${totalItens}.`,
      input.messageId,
      0.9,
      false,
      false,
      undefined,
      { checklistId: result.value.id, status, itens: { total: totalItens, concluidos } },
    )
  }

  requestHandoff(params: {
    destino: 'ze-host'
    contexto: string
    motivo: string
    payload: Record<string, unknown>
  }): ZcpHandoffPackage {
    return createZcpHandoff({
      origem: 'ze-ops',
      ...params,
      zcpSecret: this.zcpSecret,
    })
  }

  private output(
    success: boolean,
    responseText: string,
    messageId: string,
    confidenceScore: number,
    needsEscalation = false,
    handoffRequired = false,
    handoffTo?: 'ze-sales' | 'ze-marketer' | 'ze-host',
    data?: unknown,
  ): ZeCognitiveOutput {
    return {
      responseId: generateId(),
      success,
      responseText,
      confidenceScore,
      needsEscalation,
      handoffRequired,
      handoffTo,
      data,
    }
  }
}
