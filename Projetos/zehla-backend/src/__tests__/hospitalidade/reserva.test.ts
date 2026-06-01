import { describe, it, expect, beforeEach } from 'vitest'
import { Reserva } from '../../domain/hospitalidade/entities/Reserva'
import { StatusReserva, TRANSICOES_VALIDAS } from '../../domain/hospitalidade/entities/StatusReserva'
import { DateRange } from '../../domain/hospitalidade/value-objects/DateRange'
import { Money } from '../../domain/hospitalidade/value-objects/Money'
import { CreateReservaUseCase } from '../../application/hospitalidade/use-cases/CreateReservaUseCase'
import { ConfirmarReservaUseCase } from '../../application/hospitalidade/use-cases/ConfirmarReservaUseCase'
import { CancelarReservaUseCase } from '../../application/hospitalidade/use-cases/CancelarReservaUseCase'
import { RealizarCheckInUseCase } from '../../application/hospitalidade/use-cases/RealizarCheckInUseCase'
import { RealizarCheckOutUseCase } from '../../application/hospitalidade/use-cases/RealizarCheckOutUseCase'
import { InMemoryReservaRepository } from '../../infrastructure/persistence/hospitalidade/InMemoryReservaRepository'
import { Hospede } from '../../domain/hospitalidade/entities/Hospede'
import { Quarto } from '../../domain/hospitalidade/entities/Quarto'
import { TipoQuarto, StatusQuarto } from '../../domain/hospitalidade/entities'
import { Documento } from '../../domain/hospitalidade/value-objects/Documento'

function makeValidaHospede(id = 'guest-1'): Hospede {
  const doc = Documento.create('12345678901', 'cpf')
  return Hospede.create({
    id,
    nomeCompleto: 'Joao Silva',
    documento: doc.value,
    dataNascimento: new Date('1990-01-01'),
  }).value
}

function makeQuarto(id = 'room-1'): Quarto {
  return Quarto.create({
    id,
    tipo: TipoQuarto.SUITE_MASTER,
    capacidadeMaxima: 2,
    andar: 1,
    nome: 'Suite Master',
    diariaBase: Money.create(30000).value,
  }).value
}

function makePeriodo(diasInicio = 7, diasFim = 10): DateRange {
  const inicio = new Date()
  inicio.setDate(inicio.getDate() + diasInicio)
  const fim = new Date()
  fim.setDate(fim.getDate() + diasFim)
  return DateRange.create(inicio, fim).value
}

function makeReserva(
  id = 'booking-1',
  guestId = 'guest-1',
  roomId = 'room-1'
): Reserva {
  return Reserva.create({
    id,
    guestId,
    roomId,
    periodo: makePeriodo(),
    numeroHospedes: 1,
    capacidadeMaxima: 2,
    diariaBase: Money.create(30000).value,
  }).value
}

function hoje(): Date {
  return new Date()
}

function adicionarDias(data: Date, dias: number): Date {
  const d = new Date(data)
  d.setDate(d.getDate() + dias)
  return d
}

describe('Reserva — Máquina de Estados', () => {
  it('deve criar reserva com status pendente', () => {
    const reserva = makeReserva()
    expect(reserva.status).toBe(StatusReserva.PENDENTE)
  })

  it('deve falhar ao criar reserva com numero de hospedes maior que capacidade', () => {
    const result = Reserva.create({
      id: 'booking-1',
      guestId: 'guest-1',
      roomId: 'room-1',
      periodo: makePeriodo(),
      numeroHospedes: 5,
      capacidadeMaxima: 2,
      diariaBase: Money.create(30000).value,
    })
    expect(result.isFail).toBe(true)
    expect(result.error.message).toBe('ROOM_CAPACITY_EXCEEDED')
  })

  it('deve confirmar reserva pendente', () => {
    const reserva = makeReserva()
    const result = reserva.confirmar()
    expect(result.isOk).toBe(true)
    expect(result.value.status).toBe(StatusReserva.CONFIRMADA)
  })

  it('deve cancelar reserva pendente', () => {
    const reserva = makeReserva()
    const result = reserva.cancelar('Mudanca de planos')
    expect(result.isOk).toBe(true)
    expect(result.value.status).toBe(StatusReserva.CANCELADA)
    expect(result.value.motivoCancelamento).toBe('Mudanca de planos')
  })

  it('deve fazer check-in de reserva confirmada', () => {
    const reserva = makeReserva()
    reserva.confirmar()
    const dataCheckIn = new Date()
    dataCheckIn.setDate(dataCheckIn.getDate() + 7)
    const result = reserva.realizarCheckIn(dataCheckIn)
    expect(result.isOk).toBe(true)
    expect(result.value.status).toBe(StatusReserva.CHECKIN)
    expect(result.value.checkInRealizado).toBeDefined()
  })

  it('deve rejeitar check-in com mais de 2h de atraso', () => {
    const reserva = makeReserva()
    reserva.confirmar()
    const dataCheckIn = new Date()
    dataCheckIn.setFullYear(2020, 1, 1)
    const result = reserva.realizarCheckIn(dataCheckIn)
    expect(result.isFail).toBe(true)
    expect(result.error.message).toBe('CHECKIN_TOO_EARLY')
  })

  it('deve fazer check-out de reserva em check-in', () => {
    const reserva = makeReserva()
    reserva.confirmar()
    const dataInicio = reserva.periodo.dataInicio
    reserva.realizarCheckIn(dataInicio)
    const dataFim = reserva.periodo.dataFim
    const result = reserva.realizarCheckOut(dataFim)
    expect(result.isOk).toBe(true)
    expect(result.value.status).toBe(StatusReserva.CHECKOUT)
  })

  it('deve finalizar reserva apos check-out', () => {
    const reserva = makeReserva()
    reserva.confirmar()
    reserva.realizarCheckIn(reserva.periodo.dataInicio)
    reserva.realizarCheckOut(reserva.periodo.dataFim)
    const result = reserva.finalizar()
    expect(result.isOk).toBe(true)
    expect(result.value.status).toBe(StatusReserva.FINALIZADA)
  })

  it('deve rejeitar transicao invalida (check-in direto de pendente)', () => {
    const reserva = makeReserva()
    const result = reserva.realizarCheckIn(new Date())
    expect(result.isFail).toBe(true)
    expect(result.error.message).toContain('BOOKING_WRONG_STATUS')
  })

  it('deve rejeitar finalizacao sem check-out', () => {
    const reserva = makeReserva()
    reserva.confirmar()
    const result = reserva.finalizar()
    expect(result.isFail).toBe(true)
    expect(result.error.message).toContain('BOOKING_WRONG_STATUS')
  })

  it('deve rejeitar cancelamento apos check-in', () => {
    const reserva = makeReserva()
    reserva.confirmar()
    reserva.realizarCheckIn(reserva.periodo.dataInicio)
    const result = reserva.cancelar()
    expect(result.isFail).toBe(true)
    expect(result.error.message).toContain('BOOKING_WRONG_STATUS')
  })

  it('deve rejeitar alteracao de reserva finalizada', () => {
    const reserva = makeReserva()
    reserva.confirmar()
    reserva.realizarCheckIn(reserva.periodo.dataInicio)
    reserva.realizarCheckOut(reserva.periodo.dataFim)
    reserva.finalizar()
    expect(reserva.cancelar().isFail).toBe(true)
    expect(reserva.confirmar().isFail).toBe(true)
  })
})

describe('Reserva — Calculo de Multa', () => {
  it('deve calcular multa de 50% se cancelamento faltar menos de 48h', () => {
    const amanha = new Date()
    amanha.setDate(amanha.getDate() + 1)
    const depoisAmanha = new Date()
    depoisAmanha.setDate(depoisAmanha.getDate() + 2)
    const periodoCurto = DateRange.create(amanha, depoisAmanha).value
    const reserva = Reserva.create({
      id: 'booking-multa',
      guestId: 'guest-1',
      roomId: 'room-1',
      periodo: periodoCurto,
      numeroHospedes: 1,
      capacidadeMaxima: 2,
      diariaBase: Money.create(30000).value,
    }).value
    reserva.confirmar()
    const multa = reserva.calcularMultaCancelamento()
    expect(multa.centavos).toBe(15000)
  })

  it('nao deve ter multa se status nao e confirmada', () => {
    const reserva = makeReserva()
    const multa = reserva.calcularMultaCancelamento()
    expect(multa.centavos).toBe(0)
  })
})

describe('Reserva — Servicos', () => {
  it('deve adicionar servico a reserva confirmada', () => {
    const reserva = makeReserva()
    reserva.confirmar()
    const result = reserva.adicionarServico({
      serviceId: 'svc-1',
      nome: 'Cafe da Manha',
      quantidade: 2,
      precoUnitario: Money.create(5000).value,
      dataContratacao: new Date(),
    })
    expect(result.isOk).toBe(true)
    expect(result.value.servicosContratados.length).toBe(1)
  })

  it('deve rejeitar servico se reserva nao esta confirmada ou check-in', () => {
    const reserva = makeReserva()
    const result = reserva.adicionarServico({
      serviceId: 'svc-1',
      nome: 'SPA',
      quantidade: 1,
      precoUnitario: Money.create(15000).value,
      dataContratacao: new Date(),
    })
    expect(result.isFail).toBe(true)
    expect(result.error.message).toBe('SERVICE_CANNOT_BE_ADDED')
  })
})

describe('Reserva — Use Cases Integrados', () => {
  let repo: InMemoryReservaRepository
  let hospede: Hospede
  let quarto: Quarto
  const mockHospedePort = {
    getById: async () => Promise.resolve({ isOk: true, value: {} as Hospede }),
    getByDocument: async () => Promise.resolve({ isOk: false }),
    search: async () => Promise.resolve({ isOk: true, value: [] }),
    save: async (h: Hospede) => Promise.resolve({ isOk: true, value: h }),
    delete: async () => Promise.resolve({ isOk: true, value: undefined }),
  }
  const mockQuartoPort = {
    getById: async () => Promise.resolve({ isOk: true, value: {} as Quarto }),
    listAvailable: async () => Promise.resolve({ isOk: true, value: [] }),
    listByTipo: async () => Promise.resolve({ isOk: true, value: [] }),
    save: async (q: Quarto) => Promise.resolve({ isOk: true, value: q }),
    updateStatus: async () => Promise.resolve({ isOk: true, value: {} as Quarto }),
  }

  beforeEach(() => {
    repo = new InMemoryReservaRepository()
    repo.clear()
    hospede = makeValidaHospede()
    quarto = makeQuarto()
    mockHospedePort.getById = async () => Promise.resolve({ isOk: true, value: hospede })
    mockQuartoPort.getById = async () => Promise.resolve({ isOk: true, value: quarto })
    mockQuartoPort.save = async (q: Quarto) => Promise.resolve({ isOk: true, value: q })
  })

  it('CreateReservaUseCase deve criar e persistir reserva', async () => {
    const useCase = new CreateReservaUseCase(repo, mockHospedePort, mockQuartoPort)
    const periodo = makePeriodo()
    const result = await useCase.execute({
      id: 'uc-booking-1',
      guestId: 'guest-1',
      roomId: 'room-1',
      dataInicio: periodo.dataInicio,
      dataFim: periodo.dataFim,
      numeroHospedes: 1,
    })
    expect(result.isOk).toBe(true)
    expect(result.value.status).toBe(StatusReserva.PENDENTE)
    expect(repo.count()).toBe(1)
  })

  it('ConfirmarReservaUseCase deve confirmar e persistir', async () => {
    const reserva = makeReserva('uc-booking-2')
    await repo.save(reserva)
    const useCase = new ConfirmarReservaUseCase(repo)
    const result = await useCase.execute('uc-booking-2')
    expect(result.isOk).toBe(true)
    expect(result.value.status).toBe(StatusReserva.CONFIRMADA)
  })

  it('CancelarReservaUseCase deve cancelar e persistir', async () => {
    const reserva = makeReserva('uc-booking-3')
    reserva.confirmar()
    await repo.save(reserva)
    const useCase = new CancelarReservaUseCase(repo)
    const result = await useCase.execute('uc-booking-3', 'Cliente desistiu')
    expect(result.isOk).toBe(true)
    expect(result.value.status).toBe(StatusReserva.CANCELADA)
    expect(result.value.motivoCancelamento).toBe('Cliente desistiu')
  })

  it('fluxo completo: criar → confirmar → checkin → checkout → finalizar', async () => {
    const createUseCase = new CreateReservaUseCase(repo, mockHospedePort, mockQuartoPort)
    const periodo = makePeriodo()
    const created = await createUseCase.execute({
      id: 'uc-booking-full',
      guestId: 'guest-1',
      roomId: 'room-1',
      dataInicio: periodo.dataInicio,
      dataFim: periodo.dataFim,
      numeroHospedes: 1,
    })
    expect(created.isOk).toBe(true)

    const confirmUseCase = new ConfirmarReservaUseCase(repo)
    const confirmed = await confirmUseCase.execute('uc-booking-full')
    expect(confirmed.isOk).toBe(true)
    expect(confirmed.value.status).toBe(StatusReserva.CONFIRMADA)

    const checkinUseCase = new RealizarCheckInUseCase(repo)
    const checkedIn = await checkinUseCase.execute('uc-booking-full', periodo.dataInicio)
    expect(checkedIn.isOk).toBe(true)
    expect(checkedIn.value.status).toBe(StatusReserva.CHECKIN)

    const checkoutUseCase = new RealizarCheckOutUseCase(repo)
    const checkedOut = await checkoutUseCase.execute('uc-booking-full', periodo.dataFim)
    expect(checkedOut.isOk).toBe(true)
    expect(checkedOut.value.status).toBe(StatusReserva.CHECKOUT)

    const finalized = checkedOut.value.finalizar()
    expect(finalized.isOk).toBe(true)
    expect(finalized.value.status).toBe(StatusReserva.FINALIZADA)
  })

  it('deve impedir reserva duplicada no mesmo periodo', async () => {
    const useCase = new CreateReservaUseCase(repo, mockHospedePort, mockQuartoPort)
    const periodo = makePeriodo()
    await useCase.execute({
      id: 'uc-booking-d1',
      guestId: 'guest-1',
      roomId: 'room-1',
      dataInicio: periodo.dataInicio,
      dataFim: periodo.dataFim,
      numeroHospedes: 1,
    })
    const second = await useCase.execute({
      id: 'uc-booking-d2',
      guestId: 'guest-1',
      roomId: 'room-1',
      dataInicio: periodo.dataInicio,
      dataFim: periodo.dataFim,
      numeroHospedes: 1,
    })
    expect(second.isFail).toBe(true)
    expect(second.error.message).toBe('ROOM_UNAVAILABLE')
  })
})

describe('Transicoes Validas (Tabela)', () => {
  it('pendente pode ir para confirmada ou cancelada', () => {
    expect(TRANSICOES_VALIDAS[StatusReserva.PENDENTE]).toEqual([
      StatusReserva.CONFIRMADA,
      StatusReserva.CANCELADA,
    ])
  })

  it('confirmada pode ir para checkin ou cancelada', () => {
    expect(TRANSICOES_VALIDAS[StatusReserva.CONFIRMADA]).toEqual([
      StatusReserva.CHECKIN,
      StatusReserva.CANCELADA,
    ])
  })

  it('checkin pode ir para checkout', () => {
    expect(TRANSICOES_VALIDAS[StatusReserva.CHECKIN]).toEqual([
      StatusReserva.CHECKOUT,
    ])
  })

  it('checkout pode ir para finalizada ou cancelada', () => {
    expect(TRANSICOES_VALIDAS[StatusReserva.CHECKOUT]).toEqual([
      StatusReserva.FINALIZADA,
      StatusReserva.CANCELADA,
    ])
  })

  it('finalizada nao tem transicoes', () => {
    expect(TRANSICOES_VALIDAS[StatusReserva.FINALIZADA]).toEqual([])
  })

  it('cancelada nao tem transicoes', () => {
    expect(TRANSICOES_VALIDAS[StatusReserva.CANCELADA]).toEqual([])
  })
})
