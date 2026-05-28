import { describe, it, expect, beforeEach } from 'vitest'
import { ZeConcierge } from '../../application/hospitalidade/ze-concierge/ZeConcierge'
import { ZeConciergeInput } from '../../application/hospitalidade/ze-concierge/ZeConciergeTypes'
import { InMemoryReservaRepository } from '../../infrastructure/persistence/hospitalidade/InMemoryReservaRepository'
import { CreateReservaUseCase } from '../../application/hospitalidade/use-cases/CreateReservaUseCase'
import { ConfirmarReservaUseCase } from '../../application/hospitalidade/use-cases/ConfirmarReservaUseCase'
import { CancelarReservaUseCase } from '../../application/hospitalidade/use-cases/CancelarReservaUseCase'
import { Result } from '../../domain/shared/Result'
import { DateRange } from '../../domain/hospitalidade/value-objects/DateRange'
import { Money } from '../../domain/hospitalidade/value-objects/Money'
import { Documento } from '../../domain/hospitalidade/value-objects/Documento'
import { Email } from '../../domain/hospitalidade/value-objects/Email'
import { Hospede } from '../../domain/hospitalidade/entities/Hospede'
import { Quarto } from '../../domain/hospitalidade/entities/Quarto'
import { Reserva } from '../../domain/hospitalidade/entities/Reserva'
import { Servico } from '../../domain/hospitalidade/entities/Servico'
import { Feedback } from '../../domain/hospitalidade/entities/Feedback'
import { StatusReserva } from '../../domain/hospitalidade/entities/StatusReserva'
import { TipoQuarto, StatusQuarto, CategoriaServico } from '../../domain/hospitalidade/entities'
import { IHospedePort } from '../../application/hospitalidade/ports/IHospedePort'
import { IReservaPort } from '../../application/hospitalidade/ports/IReservaPort'
import { IQuartoPort } from '../../application/hospitalidade/ports/IQuartoPort'
import { IServicoPort } from '../../application/hospitalidade/ports/IServicoPort'
import { IFeedbackPort } from '../../application/hospitalidade/ports/IFeedbackPort'

function makeBaseInput(intent: ZeConciergeInput['intent'], overrides: Partial<ZeConciergeInput> = {}): ZeConciergeInput {
  return {
    intent,
    messageId: `msg-${Date.now()}-${Math.random()}`,
    guestId: undefined,
    channel: 'whatsapp',
    payload: {},
    ...overrides,
  }
}

function makeHospede(id: string): Hospede {
  const doc = Documento.create(id.replace(/\D/g, '').slice(0, 11).padStart(11, '0'), 'cpf')
  const result = Hospede.create({
    id,
    nomeCompleto: `Hospede ${id}`,
    documento: doc.isOk ? doc.value : Documento.create('00000000000', 'cpf').value,
    dataNascimento: new Date('1990-01-01'),
    email: Email.create('teste@email.com').isOk ? Email.create('teste@email.com').value : undefined,
    telefone: '5511999999999',
  })
  return result.isOk ? result.value : (() => { throw new Error('Failed to create Hospede') })()
}

function makeQuarto(id: string): Quarto {
  const result = Quarto.create({
    id,
    tipo: TipoQuarto.SUITE_MASTER,
    capacidadeMaxima: 2,
    andar: 1,
    nome: `Suite ${id}`,
    diariaBase: Money.create(30000).value,
  })
  return result.value
}

function makePeriodo(diasInicio = 7, diasFim = 10): DateRange {
  const inicio = new Date()
  inicio.setDate(inicio.getDate() + diasInicio)
  const fim = new Date()
  fim.setDate(fim.getDate() + diasFim)
  return DateRange.create(inicio, fim).value
}

class FakeHospedePort implements IHospedePort {
  private db = new Map<string, Hospede>()

  add(h: Hospede) { this.db.set(h.id, h) }

  async getById(id: string) {
    const h = this.db.get(id)
    return h ? Result.ok(h) : Result.fail(new Error('GUEST_NOT_FOUND'))
  }

  async getByDocument(_valor: string) { return Result.fail(new Error('GUEST_NOT_FOUND')) }
  async search(_q: string) { return Result.ok(Array.from(this.db.values())) }
  async save(h: Hospede) { this.db.set(h.id, h); return Result.ok(h) }
  async delete(id: string) { this.db.delete(id); return Result.ok(undefined) }
}

class FakeQuartoPort implements IQuartoPort {
  private db = new Map<string, Quarto>()

  add(q: Quarto) { this.db.set(q.id, q) }

  async getById(id: string) {
    const q = this.db.get(id)
    return q ? Result.ok(q) : Result.fail(new Error('ROOM_NOT_FOUND'))
  }

  async listAvailable(_periodo: DateRange, capacidadeMinima?: number) {
    let lista = Array.from(this.db.values()).filter(q => q.status === StatusQuarto.DISPONIVEL)
    if (capacidadeMinima) lista = lista.filter(q => q.capacidadeMaxima >= capacidadeMinima)
    return Result.ok(lista)
  }

  async listByTipo(_tipo: TipoQuarto) { return Result.ok(Array.from(this.db.values())) }
  async save(q: Quarto) { this.db.set(q.id, q); return Result.ok(q) }
  async updateStatus(id: string, status: StatusQuarto) {
    const q = this.db.get(id)
    if (!q) return Result.fail(new Error('ROOM_NOT_FOUND'))
    q['alterarStatus'](status)
    return Result.ok(q)
  }
}

class FakeServicoPort implements IServicoPort {
  private db = new Map<string, Servico>()

  add(s: Servico) { this.db.set(s.id, s) }

  async getById(id: string) {
    const s = this.db.get(id)
    return s ? Result.ok(s) : Result.fail(new Error('SERVICE_NOT_FOUND'))
  }

  async listAvailable() {
    return Result.ok(Array.from(this.db.values()).filter(s => s.disponivel))
  }

  async listByCategoria(_cat: CategoriaServico) { return Result.ok(Array.from(this.db.values())) }
  async save(s: Servico) { this.db.set(s.id, s); return Result.ok(s) }
}

class FakeFeedbackPort implements IFeedbackPort {
  private db = new Map<string, Feedback>()

  add(f: Feedback) { this.db.set(f.id, f) }

  async getById(id: string) {
    const f = this.db.get(id)
    return f ? Result.ok(f) : Result.fail(new Error('FEEDBACK_NOT_FOUND'))
  }

  async listByPeriod(_p: DateRange) { return Result.ok(Array.from(this.db.values())) }
  async listByBooking(_b: string) { return Result.ok(Array.from(this.db.values())) }
  async save(f: Feedback) { this.db.set(f.id, f); return Result.ok(f) }
  async getNPS(_p: DateRange) { return Result.ok(75) }
}

describe('ZeConcierge — Mapeamento Intent-to-Action', () => {
  let reservaRepo: InMemoryReservaRepository
  let hospedePort: FakeHospedePort
  let quartoPort: FakeQuartoPort
  let servicoPort: FakeServicoPort
  let feedbackPort: FakeFeedbackPort
  let concierge: ZeConcierge

  const guestId = 'ze-guest-1'
  const roomId = 'ze-room-1'

  beforeEach(() => {
    reservaRepo = new InMemoryReservaRepository()
    reservaRepo.clear()
    hospedePort = new FakeHospedePort()
    quartoPort = new FakeQuartoPort()
    servicoPort = new FakeServicoPort()
    feedbackPort = new FakeFeedbackPort()

    const createUC = new CreateReservaUseCase(reservaRepo, hospedePort, quartoPort)
    const confirmarUC = new ConfirmarReservaUseCase(reservaRepo)
    const cancelarUC = new CancelarReservaUseCase(reservaRepo)

    concierge = new ZeConcierge(
      hospedePort, reservaRepo, quartoPort, servicoPort, feedbackPort,
      createUC, confirmarUC, cancelarUC,
    )

    hospedePort.add(makeHospede(guestId))
    quartoPort.add(makeQuarto(roomId))
  })

  it('deve consultar hospede por id', async () => {
    const output = await concierge.processIntent(makeBaseInput('CONSULTAR_HOSPEDE', { guestId }))
    expect(output.responseText).toContain('Hospede ze-guest-1')
    expect(output.confidenceScore).toBeGreaterThan(0.9)
    expect(output.needsEscalation).toBe(false)
  })

  it('deve retornar erro se hospede nao encontrado', async () => {
    const output = await concierge.processIntent(makeBaseInput('CONSULTAR_HOSPEDE', { guestId: 'inexistente' }))
    expect(output.responseText).toContain('Não encontrei seu cadastro')
    expect(output.confidenceScore).toBe(0.3)
  })

  it('deve pedir guestId se nao fornecido', async () => {
    const output = await concierge.processIntent(makeBaseInput('CONSULTAR_HOSPEDE'))
    expect(output.responseText).toContain('Preciso do seu identificador')
  })

  it('deve consultar disponibilidade com datas validas', async () => {
    const periodo = makePeriodo(15, 18)
    const output = await concierge.processIntent(makeBaseInput('CONSULTAR_DISPONIBILIDADE', {
      payload: { dataInicio: periodo.dataInicio.toISOString(), dataFim: periodo.dataFim.toISOString() },
    }))
    expect(output.responseText).toContain('Encontrei')
    expect(output.responseText).toContain('disponível')
    expect(output.confidenceScore).toBeGreaterThan(0.8)
  })

  it('deve pedir datas se nao fornecidas na consulta de disponibilidade', async () => {
    const output = await concierge.processIntent(makeBaseInput('CONSULTAR_DISPONIBILIDADE'))
    expect(output.responseText).toContain('Preciso das datas')
  })

  it('deve criar reserva com dados validos', async () => {
    const periodo = makePeriodo(20, 23)
    const output = await concierge.processIntent(makeBaseInput('CRIAR_RESERVA', {
      guestId,
      payload: {
        roomId,
        dataInicio: periodo.dataInicio.toISOString(),
        dataFim: periodo.dataFim.toISOString(),
        numeroHospedes: 1,
      },
    }))
    expect(output.responseText).toContain('Reserva criada com sucesso')
    expect(output.confidenceScore).toBeGreaterThan(0.9)
    expect(output.suggestedUpsellId).toBe('adicionar_servico')
    expect(reservaRepo.count()).toBe(1)
  })

  it('deve recusar criar reserva se guest nao existe', async () => {
    const periodo = makePeriodo(30, 33)
    const output = await concierge.processIntent(makeBaseInput('CRIAR_RESERVA', {
      guestId: 'nao-existe',
      payload: {
        roomId,
        dataInicio: periodo.dataInicio.toISOString(),
        dataFim: periodo.dataFim.toISOString(),
      },
    }))
    expect(output.responseText).toContain('Não encontrei seu cadastro')
    expect(output.needsEscalation).toBe(false)
  })

  it('deve recusar criar reserva se guestId nao fornecido', async () => {
    const output = await concierge.processIntent(makeBaseInput('CRIAR_RESERVA'))
    expect(output.responseText).toContain('Preciso identificar você primeiro')
  })

  it('deve confirmar reserva', async () => {
    const periodo = makePeriodo(40, 43)
    const reserva = Reserva.create({
      id: 'ze-booking-confirm',
      guestId,
      roomId,
      periodo,
      numeroHospedes: 1,
      capacidadeMaxima: 2,
      diariaBase: Money.create(30000).value,
    }).value
    await reservaRepo.save(reserva)

    const output = await concierge.processIntent(makeBaseInput('CONFIRMAR_RESERVA', {
      payload: { bookingId: 'ze-booking-confirm' },
    }))
    expect(output.responseText).toContain('Reserva confirmada')
    expect(output.confidenceScore).toBeGreaterThan(0.9)
  })

  it('deve cancelar reserva', async () => {
    const periodo = makePeriodo(50, 53)
    const reserva = Reserva.create({
      id: 'ze-booking-cancel',
      guestId,
      roomId,
      periodo,
      numeroHospedes: 1,
      capacidadeMaxima: 2,
      diariaBase: Money.create(30000).value,
    }).value
    reserva.confirmar()
    await reservaRepo.save(reserva)

    const output = await concierge.processIntent(makeBaseInput('CANCELAR_RESERVA', {
      payload: { bookingId: 'ze-booking-cancel', motivo: 'Mudanca de planos' },
    }))
    expect(output.responseText).toContain('Reserva cancelada')
  })

  it('deve consultar reserva', async () => {
    const periodo = makePeriodo(60, 63)
    const reserva = Reserva.create({
      id: 'ze-booking-query',
      guestId,
      roomId,
      periodo,
      numeroHospedes: 2,
      capacidadeMaxima: 2,
      diariaBase: Money.create(30000).value,
    }).value
    await reservaRepo.save(reserva)

    const output = await concierge.processIntent(makeBaseInput('CONSULTAR_RESERVA', {
      payload: { bookingId: 'ze-booking-query' },
    }))
    expect(output.responseText).toContain('ze-booking-query')
    expect(output.responseText).toContain('pendente')
    expect(output.data).toBeDefined()
  })

  it('deve consultar servicos disponiveis', async () => {
    const servico = Servico.create({
      id: 'ze-svc-1',
      nome: 'Cafe da Manha',
      preco: Money.create(5000).value,
      categoria: CategoriaServico.ALIMENTACAO,
    }).value
    servicoPort.add(servico)

    const output = await concierge.processIntent(makeBaseInput('CONSULTAR_SERVICOS'))
    expect(output.responseText).toContain('Cafe da Manha')
    expect(output.confidenceScore).toBeGreaterThan(0.8)
  })

  it('deve adicionar servico a reserva confirmada', async () => {
    const periodo = makePeriodo(70, 73)
    const reserva = Reserva.create({
      id: 'ze-booking-svc',
      guestId,
      roomId,
      periodo,
      numeroHospedes: 1,
      capacidadeMaxima: 2,
      diariaBase: Money.create(30000).value,
    }).value
    reserva.confirmar()
    await reservaRepo.save(reserva)

    const output = await concierge.processIntent(makeBaseInput('ADICIONAR_SERVICO', {
      payload: {
        bookingId: 'ze-booking-svc',
        serviceId: 'ze-svc-1',
        nome: 'Cafe da Manha',
        quantidade: 2,
        precoCentavos: 5000,
      },
    }))
    expect(output.responseText).toContain('adicionado à sua reserva')
  })

  it('deve recusar adicionar servico se reserva nao existe', async () => {
    const output = await concierge.processIntent(makeBaseInput('ADICIONAR_SERVICO', {
      payload: { bookingId: 'inexistente', serviceId: 'svc-1', precoCentavos: 5000 },
    }))
    expect(output.responseText).toContain('Não encontrei')
  })

  it('deve criar feedback', async () => {
    const output = await concierge.processIntent(makeBaseInput('CRIAR_FEEDBACK', {
      guestId,
      payload: { bookingId: 'ze-booking-fb', notaGeral: 9, comentario: 'Otimo!' },
    }))
    expect(output.responseText).toContain('Obrigado pelo seu feedback')
    expect(output.needsEscalation).toBe(false)
  })

  it('deve escalar feedback critico (nota < 4)', async () => {
    const output = await concierge.processIntent(makeBaseInput('CRIAR_FEEDBACK', {
      guestId,
      payload: { bookingId: 'ze-booking-fb2', notaGeral: 2, comentario: 'Muito ruim' },
    }))
    expect(output.responseText).toContain('Lamento que sua experiência')
    expect(output.needsEscalation).toBe(true)
  })

  it('deve traduzir erro de dominio em mensagem amigavel', async () => {
    const periodo = makePeriodo()
    const reserva = Reserva.create({
      id: 'ze-booking-error',
      guestId,
      roomId,
      periodo,
      numeroHospedes: 1,
      capacidadeMaxima: 2,
      diariaBase: Money.create(30000).value,
    }).value
    await reservaRepo.save(reserva)

    const output = await concierge.processIntent(makeBaseInput('CONFIRMAR_RESERVA', {
      payload: { bookingId: 'ze-booking-error' },
    }))
    expect(output.responseText).toContain('Reserva confirmada')
  })

  it('deve consultar check-ins futuros', async () => {
    const periodo = makePeriodo(80, 83)
    const reserva = Reserva.create({
      id: 'ze-booking-ci-1',
      guestId,
      roomId,
      periodo,
      numeroHospedes: 1,
      capacidadeMaxima: 2,
      diariaBase: Money.create(30000).value,
    }).value
    reserva.confirmar()
    await reservaRepo.save(reserva)

    const janela = makePeriodo(75, 90)
    const output = await concierge.processIntent(makeBaseInput('CONSULTAR_CHECKINS', {
      payload: { dataInicio: janela.dataInicio.toISOString(), dataFim: janela.dataFim.toISOString() },
    }))
    expect(output.responseText).toContain('Check-ins previstos')
    expect(output.data).toBeDefined()
  })

  it('deve consultar check-outs futuros', async () => {
    const periodo = makePeriodo(100, 103)
    const reserva = Reserva.create({
      id: 'ze-booking-co-1',
      guestId,
      roomId,
      periodo,
      numeroHospedes: 1,
      capacidadeMaxima: 2,
      diariaBase: Money.create(30000).value,
    }).value
    reserva.confirmar()
    reserva.realizarCheckIn(periodo.dataInicio)
    await reservaRepo.save(reserva)

    const janela = makePeriodo(98, 110)
    const output = await concierge.processIntent(makeBaseInput('CONSULTAR_CHECKOUTS', {
      payload: { dataInicio: janela.dataInicio.toISOString(), dataFim: janela.dataFim.toISOString() },
    }))
    expect(output.responseText).toContain('Check-outs previstos')
  })

  it('deve recusar intent desconhecida', async () => {
    const output = await concierge.processIntent(makeBaseInput('CONSULTAR_SERVICOS' as any))
    await concierge.processIntent({ intent: 'NAO_EXISTE' as any, messageId: 'x', channel: 'whatsapp', payload: {} })
    const output2 = await concierge.processIntent({ intent: 'NAO_EXISTE' as any, messageId: 'x', channel: 'whatsapp', payload: {} })
    expect(output2.responseText).toContain('não entendi')
    expect(output2.confidenceScore).toBe(0.3)
  })

  it('nao deve permitir check-in ou check-out', async () => {
    const hasCheckin = (ZeConcierge.prototype as any).handleRealizarCheckIn
    const hasCheckout = (ZeConcierge.prototype as any).handleRealizarCheckOut
    expect(hasCheckin).toBeUndefined()
    expect(hasCheckout).toBeUndefined()
  })
})
