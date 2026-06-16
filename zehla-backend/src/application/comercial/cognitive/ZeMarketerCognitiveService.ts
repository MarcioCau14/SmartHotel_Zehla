import { Result } from '../../../shared/Result'
import { ILeadPort } from '../ports/ILeadPort'
import { IPacotePort } from '../ports/IPacotePort'
import { IConversaoPort } from '../ports/IConversaoPort'
import { CalcularTaxaConversaoUseCase } from '../use-cases/CalcularTaxaConversaoUseCase'
import { ProcessarPropostasExpiradasUseCase } from '../use-cases/ProcessarPropostasExpiradasUseCase'
import { RegraPrecificacao, TipoRegra } from '../../../domain/comercial/value-objects/RegraPrecificacao'
import { Money } from '../../../domain/comercial/value-objects/Money'
import { ZeMarketerInput, ZeCognitiveOutput, ZcpHandoffPackage, createZcpHandoff, translateError } from './ZeCognitiveTypes'

function generateId(): string {
  return `zm-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

export class ZeMarketerCognitiveService {
  constructor(
    private readonly leadPort: ILeadPort,
    private readonly pacotePort: IPacotePort,
    private readonly conversaoPort: IConversaoPort,
    private readonly calcularTaxaConversaoUseCase: CalcularTaxaConversaoUseCase,
    private readonly processarPropostasExpiradasUseCase: ProcessarPropostasExpiradasUseCase,
    private readonly zcpSecret: string,
  ) {}

  async processIntent(input: ZeMarketerInput): Promise<ZeCognitiveOutput> {
    try {
      switch (input.intent) {
        case 'CRIAR_PACOTE':
          return await this.handleCriarPacote(input)
        case 'EDITAR_PACOTE':
          return await this.handleEditarPacote(input)
        case 'LISTAR_PACOTES':
          return await this.handleListarPacotes(input)
        case 'ATIVAR_PACOTE':
          return await this.handleAtivarPacote(input)
        case 'PAUSAR_PACOTE':
          return await this.handlePausarPacote(input)
        case 'ARQUIVAR_PACOTE':
          return await this.handleArquivarPacote(input)
        case 'ATUALIZAR_PRECIFICACAO':
          return await this.handleAtualizarPrecificacao(input)
        case 'CONSULTAR_LEAD':
          return await this.handleConsultarLead(input)
        case 'LISTAR_LEADS':
          return await this.handleListarLeads(input)
        case 'CALCULAR_TAXA_CONVERSAO':
          return await this.handleCalcularTaxaConversao(input)
        case 'PROCESSAR_PROPOSTAS_EXPIRADAS':
          return await this.handleProcessarPropostasExpiradas(input)
        default:
          return this.output(false, 'Intenção não reconhecida pelo Zé-Marketer.', input.messageId, 0.3)
      }
    } catch {
      return this.output(false, 'Erro interno no Zé-Marketer. Operação cancelada.', input.messageId, 0.0, true)
    }
  }

  private async handleCriarPacote(input: ZeMarketerInput): Promise<ZeCognitiveOutput> {
    const { nome, descricao, tipoQuarto, capacidadeMaxima, servicosInclusos, regraPrecificacao, validadeInicio, validadeFim, categorias, midias } = input.payload as any
    if (!nome) {
      return this.output(false, 'Preciso do nome do pacote para criá-lo.', input.messageId, 0.4)
    }
    let regra: RegraPrecificacao
    if (regraPrecificacao) {
      const regraResult = RegraPrecificacao.criar(regraPrecificacao as any)
      if (regraResult.isFail) {
        return this.output(false, `Regra de precificação inválida: ${regraResult.error.message}`, input.messageId, 0.3)
      }
      regra = regraResult.value
    } else {
      const vBase = Money.deReais(100)
      if (vBase.isFail) return this.output(false, 'Erro ao criar valor base padrão.', input.messageId, 0.3)
      const vNoite = Money.deReais(80)
      if (vNoite.isFail) return this.output(false, 'Erro ao criar valor noturno padrão.', input.messageId, 0.3)
      const vPessoa = Money.deReais(0)
      if (vPessoa.isFail) return this.output(false, 'Erro ao criar valor por pessoa padrão.', input.messageId, 0.3)
      const regraResult = RegraPrecificacao.criar({
        tipo: 'por_noite',
        valorBase: vBase.value,
        valorPorNoite: vNoite.value,
        valorPorPessoa: vPessoa.value,
      })
      if (regraResult.isFail) {
        return this.output(false, 'Erro ao criar regra de precificação padrão.', input.messageId, 0.3)
      }
      regra = regraResult.value
    }
    const result = await this.pacotePort.criarPacote({
      propriedadeId: input.propriedadeId,
      nome: nome as string,
      descricao: descricao as string | undefined,
      tipoQuarto: tipoQuarto as string | undefined,
      capacidadeMaxima: capacidadeMaxima as number | undefined,
      servicosInclusos: servicosInclusos as string[] | undefined,
      regraPrecificacao: regra,
      validadeInicio: validadeInicio ? new Date(validadeInicio as string) : undefined,
      validadeFim: validadeFim ? new Date(validadeFim as string) : undefined,
      categorias: categorias as string[] | undefined,
      midias: midias as string[] | undefined,
    })
    if (result.isFail) {
      return this.output(false, translateError(result.error), input.messageId, 0.3, true)
    }
    return this.output(
      true,
      `Pacote "${result.value.nome}" criado com sucesso! ID: ${result.value.id}.`,
      input.messageId,
      0.95,
      false,
      false,
      undefined,
      { pacoteId: result.value.id, status: result.value.status },
    )
  }

  private async handleEditarPacote(input: ZeMarketerInput): Promise<ZeCognitiveOutput> {
    const { pacoteId, nome, descricao, tipoQuarto, capacidadeMaxima, servicosInclusos, validadeInicio, validadeFim, categorias, midias } = input.payload as any
    if (!pacoteId) {
      return this.output(false, 'Preciso do ID do pacote para editá-lo.', input.messageId, 0.4)
    }
    const result = await this.pacotePort.atualizarPacote(pacoteId as string, input.propriedadeId, {
      nome: nome as string | undefined,
      descricao: descricao as string | undefined,
      tipoQuarto: tipoQuarto as string | undefined,
      capacidadeMaxima: capacidadeMaxima as number | undefined,
      servicosInclusos: servicosInclusos as string[] | undefined,
      validadeInicio: validadeInicio ? new Date(validadeInicio as string) : undefined,
      validadeFim: validadeFim ? new Date(validadeFim as string) : undefined,
      categorias: categorias as string[] | undefined,
      midias: midias as string[] | undefined,
    })
    if (result.isFail) {
      return this.output(false, translateError(result.error), input.messageId, 0.3, true)
    }
    return this.output(
      true,
      `Pacote "${result.value.nome}" atualizado com sucesso!`,
      input.messageId,
      0.9,
    )
  }

  private async handleListarPacotes(input: ZeMarketerInput): Promise<ZeCognitiveOutput> {
    const { status, tipoQuarto, ativoApenas } = input.payload as any
    const result = await this.pacotePort.listarPacotesPorPropriedade(input.propriedadeId, {
      status: status as string[] | undefined,
      tipoQuarto: tipoQuarto as string | undefined,
      ativoApenas: ativoApenas as boolean | undefined,
    })
    if (result.isFail) {
      return this.output(false, translateError(result.error), input.messageId, 0.3)
    }
    return this.output(
      true,
      `${result.value.length} pacote(s) encontrado(s).`,
      input.messageId,
      0.85,
      false,
      false,
      undefined,
      { pacotes: result.value.map(p => ({ id: p.id, nome: p.nome, status: p.status })) },
    )
  }

  private async handleAtivarPacote(input: ZeMarketerInput): Promise<ZeCognitiveOutput> {
    const { pacoteId } = input.payload as any
    if (!pacoteId) {
      return this.output(false, 'Preciso do ID do pacote para ativar.', input.messageId, 0.4)
    }
    const result = await this.pacotePort.ativarPacote(pacoteId as string, input.propriedadeId)
    if (result.isFail) {
      return this.output(false, translateError(result.error), input.messageId, 0.3, true)
    }
    return this.output(true, `Pacote "${result.value.nome}" ativado!`, input.messageId, 0.9)
  }

  private async handlePausarPacote(input: ZeMarketerInput): Promise<ZeCognitiveOutput> {
    const { pacoteId } = input.payload as any
    if (!pacoteId) {
      return this.output(false, 'Preciso do ID do pacote para pausar.', input.messageId, 0.4)
    }
    const result = await this.pacotePort.pausarPacote(pacoteId as string, input.propriedadeId)
    if (result.isFail) {
      return this.output(false, translateError(result.error), input.messageId, 0.3, true)
    }
    return this.output(true, `Pacote "${result.value.nome}" pausado.`, input.messageId, 0.9)
  }

  private async handleArquivarPacote(input: ZeMarketerInput): Promise<ZeCognitiveOutput> {
    const { pacoteId } = input.payload as any
    if (!pacoteId) {
      return this.output(false, 'Preciso do ID do pacote para arquivar.', input.messageId, 0.4)
    }
    const result = await this.pacotePort.arquivarPacote(pacoteId as string, input.propriedadeId)
    if (result.isFail) {
      return this.output(false, translateError(result.error), input.messageId, 0.3, true)
    }
    return this.output(true, `Pacote "${result.value.nome}" arquivado.`, input.messageId, 0.9)
  }

  private async handleAtualizarPrecificacao(input: ZeMarketerInput): Promise<ZeCognitiveOutput> {
    const { pacoteId, tipo, valorBase, valorPorNoite, valorPorPessoa } = input.payload as any
    if (!pacoteId) {
      return this.output(false, 'Preciso do ID do pacote para atualizar a precificação.', input.messageId, 0.4)
    }
    const vBase = valorBase ? Money.deReais(valorBase as number) : Money.deReais(100)
    if (vBase.isFail) return this.output(false, 'Valor base inválido.', input.messageId, 0.3)
    const vNoite = valorPorNoite ? Money.deReais(valorPorNoite as number) : Money.deReais(0)
    if (vNoite.isFail) return this.output(false, 'Valor por noite inválido.', input.messageId, 0.3)
    const vPessoa = valorPorPessoa ? Money.deReais(valorPorPessoa as number) : Money.deReais(0)
    if (vPessoa.isFail) return this.output(false, 'Valor por pessoa inválido.', input.messageId, 0.3)
    const regraResult = RegraPrecificacao.criar({
      tipo: (tipo as TipoRegra) || 'por_noite',
      valorBase: vBase.value,
      valorPorNoite: vNoite.value,
      valorPorPessoa: vPessoa.value,
    })
    if (regraResult.isFail) {
      return this.output(false, `Regra de precificação inválida: ${regraResult.error.message}`, input.messageId, 0.3)
    }
    const result = await this.pacotePort.atualizarRegraPrecificacao(pacoteId as string, input.propriedadeId, regraResult.value)
    if (result.isFail) {
      return this.output(false, translateError(result.error), input.messageId, 0.3, true)
    }
    return this.output(true, `Precificação do pacote "${result.value.nome}" atualizada!`, input.messageId, 0.9)
  }

  private async handleConsultarLead(input: ZeMarketerInput): Promise<ZeCognitiveOutput> {
    const { leadId } = input.payload as any
    if (!leadId) {
      return this.output(false, 'Preciso do ID do lead para consultar.', input.messageId, 0.4)
    }
    const result = await this.leadPort.buscarLeadPorId(leadId as string, input.propriedadeId)
    if (result.isFail || !result.value) {
      return this.output(false, translateError(result.error || new Error('LEAD_NOT_FOUND')), input.messageId, 0.3)
    }
    const l = result.value
    return this.output(
      true,
      `Lead: ${l.nome || 'sem nome'}. Canal: ${l.canal?.valor || 'N/A'}. Status: ${l.status}. Score: ${l.score?.value || 'N/A'}.`,
      input.messageId,
      0.85,
      false,
      false,
      undefined,
      { id: l.id, nome: l.nome, status: l.status, score: l.score?.value, canal: l.canal?.valor },
    )
  }

  private async handleListarLeads(input: ZeMarketerInput): Promise<ZeCognitiveOutput> {
    const { status, canal } = input.payload as any
    const result = await this.leadPort.listarLeadsPorPropriedade(input.propriedadeId, {
      status: status as string[] | undefined,
      canal: canal as string | undefined,
    })
    if (result.isFail) {
      return this.output(false, translateError(result.error), input.messageId, 0.3)
    }
    return this.output(
      true,
      `${result.value.length} lead(s) encontrado(s).`,
      input.messageId,
      0.85,
      false,
      false,
      undefined,
      { leads: result.value.map(l => ({ id: l.id, nome: l.nome, status: l.status, canal: l.canal?.valor })) },
    )
  }

  private async handleCalcularTaxaConversao(input: ZeMarketerInput): Promise<ZeCognitiveOutput> {
    const { dataInicio, dataFim } = input.payload as any
    const result = await this.calcularTaxaConversaoUseCase.execute(
      input.propriedadeId,
      dataInicio ? new Date(dataInicio as string) : undefined,
      dataFim ? new Date(dataFim as string) : undefined,
    )
    if (result.isFail) {
      return this.output(false, translateError(result.error), input.messageId, 0.3, true)
    }
    const { taxaConversao, detalhes, breakdown } = result.value
    return this.output(
      true,
      `Taxa de conversão: ${taxaConversao}% (${detalhes.conversoes} conversões / ${detalhes.leads} leads).`,
      input.messageId,
      0.9,
      false,
      false,
      undefined,
      { taxaConversao, detalhes, breakdown },
    )
  }

  private async handleProcessarPropostasExpiradas(input: ZeMarketerInput): Promise<ZeCognitiveOutput> {
    const result = await this.processarPropostasExpiradasUseCase.execute(input.propriedadeId)
    if (result.isFail) {
      return this.output(false, translateError(result.error), input.messageId, 0.3, true)
    }
    const { totalProcessadas, leadsAfetados } = result.value
    return this.output(
      true,
      `${totalProcessadas} proposta(s) expirada(s) processada(s). ${leadsAfetados.length} lead(s) afetado(s).`,
      input.messageId,
      0.9,
    )
  }

  requestHandoff(params: {
    destino: 'ze-sales' | 'ze-host'
    leadId?: string
    pacoteId?: string
    contexto: string
    motivo: string
    payload: Record<string, unknown>
  }): ZcpHandoffPackage {
    return createZcpHandoff({
      origem: 'ze-marketer',
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
