import { ServicoContratado } from '../../../domain/hospitalidade/entities/Reserva'
import { Feedback } from '../../../domain/hospitalidade/entities/Feedback'
import { DateRange } from '../../../domain/hospitalidade/value-objects/DateRange'
import { Money } from '../../../domain/hospitalidade/value-objects/Money'
import { IHospedePort } from '../ports/IHospedePort'
import { IReservaPort } from '../ports/IReservaPort'
import { IQuartoPort } from '../ports/IQuartoPort'
import { IServicoPort } from '../ports/IServicoPort'
import { IFeedbackPort } from '../ports/IFeedbackPort'
import { CreateReservaUseCase, CreateReservaInput } from '../use-cases/CreateReservaUseCase'
import { ConfirmarReservaUseCase } from '../use-cases/ConfirmarReservaUseCase'
import { CancelarReservaUseCase } from '../use-cases/CancelarReservaUseCase'
import { ZeConciergeInput, ZeConciergeOutput } from './ZeConciergeTypes'

function generateId(): string {
  return `zcp-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

const ERROR_MESSAGES: Record<string, string> = {
  GUEST_NOT_FOUND: 'Não encontrei seu cadastro. Você poderia me informar seu CPF ou telefone?',
  ROOM_NOT_FOUND: 'Quarto não encontrado. Verifique o identificador e tente novamente.',
  ROOM_UNAVAILABLE: 'Infelizmente este quarto não está disponível no período solicitado. Gostaria de ver opções similares?',
  ROOM_CAPACITY_EXCEEDED: 'A quantidade de hóspedes excede a capacidade máxima do quarto. Por favor, reduza o número.',
  BOOKING_NOT_FOUND: 'Não encontrei esta reserva. Verifique o código e tente novamente.',
  BOOKING_WRONG_STATUS: 'Esta ação não é permitida no status atual da sua reserva.',
  CHECKIN_TOO_EARLY: 'O check-in só pode ser realizado a partir da data de entrada. Em até 2 horas de tolerância, está liberado.',
  CHECKIN_ROOM_MAINTENANCE: 'O quarto está em manutenção. Entre em contato com a recepção para alternativas.',
  CHECKOUT_BEFORE_DEPARTURE: 'O check-out antes da data prevista precisa ser agendado com pelo menos 12 horas de antecedência.',
  SERVICE_NOT_FOUND: 'Serviço não encontrado.',
  SERVICE_UNAVAILABLE: 'Este serviço está temporariamente indisponível.',
  SERVICE_CANNOT_BE_ADDED: 'Só é possível adicionar serviços durante a confirmação ou durante o check-in.',
  FEEDBACK_ALREADY_EXISTS: 'Esta reserva já possui um feedback registrado.',
  FEEDBACK_INVALID_RATING: 'A nota deve ser entre 0 e 10.',
  BOOKING_NOT_FINALIZED: 'A reserva precisa estar finalizada para registrar um feedback.',
  ROOM_IN_MAINTENANCE: 'Este quarto está em manutenção no momento.',
  ROOM_DAILY_RATE_ZERO: 'A diária do quarto não pode ser zero.',
  ROOM_NAME_REQUIRED: 'O nome do quarto é obrigatório.',
  ROOM_INVALID_CAPACITY: 'Capacidade inválida para o quarto.',
  DISCOUNT_EXCEEDS_TOTAL: 'O desconto não pode exceder o valor total da reserva.',
  BOOKING_ID_REQUIRED: 'Identificador da reserva é obrigatório.',
  BOOKING_GUEST_REQUIRED: 'Hóspede é obrigatório para criar uma reserva.',
  BOOKING_ROOM_REQUIRED: 'Quarto é obrigatório para criar uma reserva.',
  BOOKING_INVALID_GUEST_COUNT: 'Número de hóspedes inválido.',
  GUEST_ID_REQUIRED: 'Identificador do hóspede é obrigatório.',
  GUEST_NAME_TOO_SHORT: 'O nome deve ter pelo menos 2 caracteres.',
  GUEST_UNDERAGE: 'Hóspede deve ter pelo menos 18 anos.',
  GUEST_INVALID_BIRTH_DATE: 'Data de nascimento inválida.',
  FEEDBACK_ID_REQUIRED: 'Identificador do feedback é obrigatório.',
  FEEDBACK_BOOKING_REQUIRED: 'Reserva é obrigatória para o feedback.',
  SERVICE_ID_REQUIRED: 'Identificador do serviço é obrigatório.',
  SERVICE_NAME_REQUIRED: 'Nome do serviço é obrigatório.',
  SERVICE_PRICE_ZERO: 'O preço do serviço não pode ser zero.',
  ROOM_ID_REQUIRED: 'Identificador do quarto é obrigatório.',
  ROOM_INVALID_FLOOR: 'Andar inválido.',
}

export class ZeConcierge {
  constructor(
    private readonly hospedePort: IHospedePort,
    private readonly reservaPort: IReservaPort,
    private readonly quartoPort: IQuartoPort,
    private readonly servicoPort: IServicoPort,
    private readonly feedbackPort: IFeedbackPort,
    private readonly createReservaUseCase: CreateReservaUseCase,
    private readonly confirmarReservaUseCase: ConfirmarReservaUseCase,
    private readonly cancelarReservaUseCase: CancelarReservaUseCase,
  ) {}

  async processIntent(input: ZeConciergeInput): Promise<ZeConciergeOutput> {
    try {
      switch (input.intent) {
        case 'CONSULTAR_HOSPEDE':
          return await this.handleConsultarHospede(input)
        case 'CONSULTAR_DISPONIBILIDADE':
          return await this.handleConsultarDisponibilidade(input)
        case 'CONSULTAR_SERVICOS':
          return await this.handleConsultarServicos(input)
        case 'CRIAR_RESERVA':
          return await this.handleCriarReserva(input)
        case 'CONFIRMAR_RESERVA':
          return await this.handleConfirmarReserva(input)
        case 'CANCELAR_RESERVA':
          return await this.handleCancelarReserva(input)
        case 'CONSULTAR_RESERVA':
          return await this.handleConsultarReserva(input)
        case 'ADICIONAR_SERVICO':
          return await this.handleAdicionarServico(input)
        case 'CRIAR_FEEDBACK':
          return await this.handleCriarFeedback(input)
        case 'CONSULTAR_CHECKINS':
          return await this.handleConsultarCheckins(input)
        case 'CONSULTAR_CHECKOUTS':
          return await this.handleConsultarCheckouts(input)
        default:
          return this.output(false, 'Desculpe, não entendi o que você deseja. Pode repetir?', input.messageId, 0.3)
      }
    } catch (err) {
      return this.output(
        false,
        'Ocorreu um erro interno. Já avisei a equipe de suporte.',
        input.messageId,
        0.0,
        true,
      )
    }
  }

  private async handleConsultarHospede(input: ZeConciergeInput): Promise<ZeConciergeOutput> {
    if (!input.guestId) {
      return this.output(false, 'Preciso do seu identificador para consultar seus dados.', input.messageId, 0.5)
    }
    const result = await this.hospedePort.getById(input.guestId)
    if (result.isFail) {
      return this.fromError(result.error, input.messageId)
    }
    const h = result.value
    return this.output(
      true,
      `Olá, ${h.nomeCompleto}! Seu cadastro está ativo. Posso ajudar com reservas, serviços ou informações?`,
      input.messageId,
      0.95,
      false,
      null,
      { nome: h.nomeCompleto, email: h.email?.valor, telefone: h.telefone },
    )
  }

  private async handleConsultarDisponibilidade(input: ZeConciergeInput): Promise<ZeConciergeOutput> {
    const { dataInicio, dataFim, capacidadeMinima } = input.payload as any
    if (!dataInicio || !dataFim) {
      return this.output(false, 'Preciso das datas de check-in e check-out para verificar disponibilidade.', input.messageId, 0.4)
    }
    const periodo = DateRange.create(new Date(dataInicio as string), new Date(dataFim as string))
    if (periodo.isFail) {
      return this.output(false, 'As datas informadas são inválidas. Verifique e tente novamente.', input.messageId, 0.4)
    }
    const quartos = await this.quartoPort.listAvailable(periodo.value, capacidadeMinima as number | undefined)
    if (quartos.isFail) {
      return this.fromError(quartos.error, input.messageId)
    }
    if (quartos.value.length === 0) {
      return this.output(true, 'Não encontrei quartos disponíveis para este período. Gostaria de tentar outras datas?', input.messageId, 0.85)
    }
    const lista = quartos.value.map(q => `${q.nome} (R$ ${(q.diariaBase.centavos / 100).toFixed(2)}/diária - até ${q.capacidadeMaxima} hóspedes)`).join('\n')
    return this.output(
      true,
      `Encontrei ${quartos.value.length} quarto(s) disponível(is):\n${lista}\n\nQual deles te interessa?`,
      input.messageId,
      0.9,
      false,
      null,
      quartos.value.map(q => ({ id: q.id, nome: q.nome, diaria: q.diariaBase.centavos, capacidade: q.capacidadeMaxima })),
    )
  }

  private async handleConsultarServicos(input: ZeConciergeInput): Promise<ZeConciergeOutput> {
    const servicos = await this.servicoPort.listAvailable()
    if (servicos.isFail) {
      return this.fromError(servicos.error, input.messageId)
    }
    if (servicos.value.length === 0) {
      return this.output(true, 'No momento não há serviços disponíveis para contratação.', input.messageId, 0.85)
    }
    const lista = servicos.value.map(s => `• ${s.nome} — R$ ${(s.precoAtual.centavos / 100).toFixed(2)}`).join('\n')
    return this.output(
      true,
      `Serviços disponíveis:\n${lista}\n\nQual deles você gostaria de adicionar à sua reserva?`,
      input.messageId,
      0.9,
    )
  }

  private async handleCriarReserva(input: ZeConciergeInput): Promise<ZeConciergeOutput> {
    if (!input.guestId) {
      return this.output(false, 'Preciso identificar você primeiro. Qual o seu CPF ou telefone cadastrado?', input.messageId, 0.4)
    }
    const { roomId, dataInicio, dataFim, numeroHospedes } = input.payload as any
    if (!roomId || !dataInicio || !dataFim) {
      return this.output(false, 'Preciso do quarto, data de check-in e data de check-out para criar a reserva.', input.messageId, 0.4)
    }
    const createInput: CreateReservaInput = {
      id: generateId(),
      guestId: input.guestId,
      roomId: roomId as string,
      dataInicio: new Date(dataInicio as string),
      dataFim: new Date(dataFim as string),
      numeroHospedes: (numeroHospedes as number) ?? 1,
    }
    const result = await this.createReservaUseCase.execute(createInput)
    if (result.isFail) {
      return this.fromError(result.error, input.messageId)
    }
    const r = result.value
    return this.output(
      true,
      `Reserva criada com sucesso! Código: ${r.id}. Status: ${r.status}. Em breve enviaremos a confirmação.`,
      input.messageId,
      0.95,
      false,
      'adicionar_servico',
      { bookingId: r.id, status: r.status },
    )
  }

  private async handleConfirmarReserva(input: ZeConciergeInput): Promise<ZeConciergeOutput> {
    const { bookingId } = input.payload as any
    if (!bookingId) {
      return this.output(false, 'Preciso do código da reserva para confirmar.', input.messageId, 0.4)
    }
    const result = await this.confirmarReservaUseCase.execute(bookingId as string)
    if (result.isFail) {
      return this.fromError(result.error, input.messageId)
    }
    return this.output(
      true,
      'Reserva confirmada! Seu quarto está garantido. Posso ajudar com mais alguma coisa?',
      input.messageId,
      0.95,
    )
  }

  private async handleCancelarReserva(input: ZeConciergeInput): Promise<ZeConciergeOutput> {
    const { bookingId, motivo } = input.payload as any
    if (!bookingId) {
      return this.output(false, 'Preciso do código da reserva para cancelar.', input.messageId, 0.4)
    }
    const result = await this.cancelarReservaUseCase.execute(bookingId as string, motivo as string | undefined)
    if (result.isFail) {
      return this.fromError(result.error, input.messageId)
    }
    const multa = result.value.calcularMultaCancelamento()
    const textoMulta = multa.centavos > 0
      ? ` Haverá multa de R$ ${(multa.centavos / 100).toFixed(2)} por cancelamento próximo à data de check-in.`
      : ''
    return this.output(
      true,
      `Reserva cancelada com sucesso.${textoMulta} Se precisar de algo mais, estou aqui!`,
      input.messageId,
      0.95,
    )
  }

  private async handleConsultarReserva(input: ZeConciergeInput): Promise<ZeConciergeOutput> {
    const { bookingId } = input.payload as any
    if (!bookingId) {
      return this.output(false, 'Preciso do código da reserva para consultar.', input.messageId, 0.4)
    }
    const result = await this.reservaPort.getById(bookingId as string)
    if (result.isFail) {
      return this.fromError(result.error, input.messageId)
    }
    const r = result.value
    const checkInStr = r.periodo.dataInicio.toLocaleDateString('pt-BR')
    const checkOutStr = r.periodo.dataFim.toLocaleDateString('pt-BR')
    const valorStr = `R$ ${(r.valorTotal.centavos / 100).toFixed(2)}`
    return this.output(
      true,
      `Reserva ${r.id}: ${r.status}.\nCheck-in: ${checkInStr}\nCheck-out: ${checkOutStr}\nValor total: ${valorStr}\nHóspedes: ${r.numeroHospedes}`,
      input.messageId,
      0.95,
      false,
      null,
      { id: r.id, status: r.status, checkIn: checkInStr, checkOut: checkOutStr, valor: valorStr },
    )
  }

  private async handleAdicionarServico(input: ZeConciergeInput): Promise<ZeConciergeOutput> {
    const { bookingId, serviceId, nome, quantidade, precoCentavos } = input.payload as any
    if (!bookingId || !serviceId) {
      return this.output(false, 'Preciso do código da reserva e do serviço para adicionar.', input.messageId, 0.4)
    }
    const reservaResult = await this.reservaPort.getById(bookingId as string)
    if (reservaResult.isFail) {
      return this.fromError(reservaResult.error, input.messageId)
    }
    const preco = Money.create((precoCentavos as number) ?? 0)
    if (preco.isFail) {
      return this.output(false, 'Valor do serviço inválido.', input.messageId, 0.4)
    }
    const servicoContratado: ServicoContratado = {
      serviceId: serviceId as string,
      nome: (nome as string) ?? 'Serviço',
      quantidade: (quantidade as number) ?? 1,
      precoUnitario: preco.value,
      dataContratacao: new Date(),
    }
    const addResult = reservaResult.value.adicionarServico(servicoContratado)
    if (addResult.isFail) {
      return this.fromError(addResult.error, input.messageId)
    }
    const saved = await this.reservaPort.save(addResult.value)
    if (saved.isFail) {
      return this.output(false, 'Erro ao salvar. Tente novamente.', input.messageId, 0.4)
    }
    return this.output(
      true,
      `${servicoContratado.nome} adicionado à sua reserva com sucesso!`,
      input.messageId,
      0.9,
      false,
      null,
      { bookingId, serviceId, quantidade: servicoContratado.quantidade },
    )
  }

  private async handleCriarFeedback(input: ZeConciergeInput): Promise<ZeConciergeOutput> {
    const { bookingId, notaGeral, comentario, categorias } = input.payload as any
    if (!bookingId || notaGeral === undefined) {
      return this.output(false, 'Preciso da reserva e da nota para registrar seu feedback.', input.messageId, 0.4)
    }
    const feedback = Feedback.create({
      id: generateId(),
      bookingId: bookingId as string,
      notaGeral: notaGeral as number,
      comentario: comentario as string | undefined,
      categorias: categorias as Record<string, number> | undefined,
    })
    if (feedback.isFail) {
      return this.fromError(feedback.error, input.messageId)
    }
    const saved = await this.feedbackPort.save(feedback.value)
    if (saved.isFail) {
      return this.output(false, 'Erro ao salvar feedback. Tente novamente.', input.messageId, 0.4)
    }
    if (feedback.value.ehCritico) {
      return this.output(
        true,
      'Obrigado pelo seu feedback! Lamento que sua experiência não tenha sido excelente. Já encaminhei seu relato para nossa gerência.',
        input.messageId,
        0.9,
        true,
      )
    }
    return this.output(
      true,
      'Obrigado pelo seu feedback! Sua opinião nos ajuda a melhorar cada vez mais. Volte sempre!',
      input.messageId,
      0.95,
    )
  }

  private async handleConsultarCheckins(input: ZeConciergeInput): Promise<ZeConciergeOutput> {
    const { dataInicio, dataFim } = input.payload as any
    if (!dataInicio || !dataFim) {
      return this.output(false, 'Preciso do período para consultar os check-ins agendados.', input.messageId, 0.4)
    }
    const periodo = DateRange.create(new Date(dataInicio as string), new Date(dataFim as string))
    if (periodo.isFail) {
      return this.output(false, 'Período inválido.', input.messageId, 0.4)
    }
    const result = await this.reservaPort.listUpcomingCheckins(periodo.value)
    if (result.isFail) {
      return this.fromError(result.error, input.messageId)
    }
    if (result.value.length === 0) {
      return this.output(true, 'Não há check-ins agendados para este período.', input.messageId, 0.85)
    }
    return this.output(
      true,
      `Check-ins previstos: ${result.value.length} reserva(s).`,
      input.messageId,
      0.9,
      false,
      null,
      result.value.map(r => ({ id: r.id, guestId: r.guestId, data: r.periodo.dataInicio })),
    )
  }

  private async handleConsultarCheckouts(input: ZeConciergeInput): Promise<ZeConciergeOutput> {
    const { dataInicio, dataFim } = input.payload as any
    if (!dataInicio || !dataFim) {
      return this.output(false, 'Preciso do período para consultar os check-outs agendados.', input.messageId, 0.4)
    }
    const periodo = DateRange.create(new Date(dataInicio as string), new Date(dataFim as string))
    if (periodo.isFail) {
      return this.output(false, 'Período inválido.', input.messageId, 0.4)
    }
    const result = await this.reservaPort.listUpcomingCheckouts(periodo.value)
    if (result.isFail) {
      return this.fromError(result.error, input.messageId)
    }
    if (result.value.length === 0) {
      return this.output(true, 'Não há check-outs agendados para este período.', input.messageId, 0.85)
    }
    return this.output(
      true,
      `Check-outs previstos: ${result.value.length} reserva(s).`,
      input.messageId,
      0.9,
      false,
      null,
      result.value.map(r => ({ id: r.id, guestId: r.guestId, data: r.periodo.dataFim })),
    )
  }

  private fromError(err: Error, messageId: string): ZeConciergeOutput {
    const friendly = ERROR_MESSAGES[err.message] ?? `Desculpe, não consegui processar: ${err.message}.`
    const needsEscalation = err.message.includes('ERROR') || err.message.includes('INTERNAL')
    return this.output(false, friendly, messageId, 0.3, needsEscalation)
  }

  private output(
    success: boolean,
    responseText: string,
    messageId: string,
    confidenceScore: number,
    needsEscalation = false,
    suggestedUpsellId: string | null = null,
    data?: unknown,
  ): ZeConciergeOutput {
    return {
      responseId: generateId(),
      responseText,
      confidenceScore,
      needsEscalation,
      suggestedUpsellId,
      data,
    }
  }
}
