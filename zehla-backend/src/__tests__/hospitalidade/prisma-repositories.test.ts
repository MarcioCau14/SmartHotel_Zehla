import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { PrismaClient } from '@prisma/client'
import { db } from '../../lib/db'
import { PrismaHospedeRepository } from '../../infrastructure/persistence/hospitalidade/PrismaHospedeRepository'
import { PrismaReservaRepository } from '../../infrastructure/persistence/hospitalidade/PrismaReservaRepository'
import { PrismaQuartoRepository } from '../../infrastructure/persistence/hospitalidade/PrismaQuartoRepository'
import { PrismaServicoRepository } from '../../infrastructure/persistence/hospitalidade/PrismaServicoRepository'
import { PrismaFeedbackRepository } from '../../infrastructure/persistence/hospitalidade/PrismaFeedbackRepository'
import { Hospede } from '../../domain/hospitalidade/entities/Hospede'
import { Quarto } from '../../domain/hospitalidade/entities/Quarto'
import { Reserva } from '../../domain/hospitalidade/entities/Reserva'
import { Servico } from '../../domain/hospitalidade/entities/Servico'
import { Feedback } from '../../domain/hospitalidade/entities/Feedback'
import { StatusReserva } from '../../domain/hospitalidade/entities/StatusReserva'
import { TipoQuarto, StatusQuarto, CategoriaServico } from '../../domain/hospitalidade/entities'
import { DateRange } from '../../domain/hospitalidade/value-objects/DateRange'
import { Money } from '../../domain/hospitalidade/value-objects/Money'
import { Documento } from '../../domain/hospitalidade/value-objects/Documento'
import { Email } from '../../domain/hospitalidade/value-objects/Email'

const TEST_PREFIX = `test-${Date.now()}`
let userId: string
let propertyId: string

const prismaDb = db as PrismaClient
let hospedeRepo: PrismaHospedeRepository
let reservaRepo: PrismaReservaRepository
let quartoRepo: PrismaQuartoRepository
let servicoRepo: PrismaServicoRepository
let feedbackRepo: PrismaFeedbackRepository

let _hospedeCounter = 0
function nextCpf(): string {
  _hospedeCounter++
  return String(_hospedeCounter).padStart(11, '0').slice(0, 11)
}

function makeHospede(id: string): Hospede {
  const doc = Documento.create(nextCpf(), 'cpf')
  return Hospede.create({
    id,
    nomeCompleto: `Guest ${id}`,
    documento: doc.isOk ? doc.value : Documento.create('00000000000', 'cpf').value,
    dataNascimento: new Date('1990-01-01'),
    telefone: `551199999${id.slice(-4)}`,
  }).value
}

function makeQuarto(id: string): Quarto {
  return Quarto.create({
    id,
    tipo: TipoQuarto.SUITE_MASTER,
    capacidadeMaxima: 2,
    andar: 1,
    nome: `Suite ${id}`,
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

function makeServico(id: string): Servico {
  const result = Servico.create({
    id,
    nome: `Cafe ${id}`,
    preco: Money.create(5000).value,
    categoria: CategoriaServico.ALIMENTACAO,
  })
  return result.value
}

beforeAll(async () => {
  userId = `${TEST_PREFIX}-user`
  propertyId = `${TEST_PREFIX}-property`

  await prismaDb.user.create({
    data: {
      id: userId,
      email: `${TEST_PREFIX}@test.com`,
      name: `Test User ${TEST_PREFIX}`,
      password: 'hashed-password',
    },
  })

  await prismaDb.property.create({
    data: {
      id: propertyId,
      name: `Test Property ${TEST_PREFIX}`,
      slug: `test-property-${TEST_PREFIX}`,
      address: 'Rua Teste, 123',
      city: 'Imbituba',
      state: 'SC',
      status: 'ACTIVE' as any,
      plan: 'LITE' as any,
      userId,
    },
  })

  hospedeRepo = new PrismaHospedeRepository(prismaDb, propertyId)
  reservaRepo = new PrismaReservaRepository(prismaDb, propertyId)
  quartoRepo = new PrismaQuartoRepository(prismaDb, propertyId)
  servicoRepo = new PrismaServicoRepository(prismaDb, propertyId)
  feedbackRepo = new PrismaFeedbackRepository(prismaDb, propertyId)
})

afterAll(async () => {
  await prismaDb.feedbackHosp.deleteMany({ where: { propertyId } })
  await prismaDb.reservaHosp.deleteMany({ where: { propertyId } })
  await prismaDb.servicoHosp.deleteMany({ where: { propertyId } })
  await prismaDb.quartoHosp.deleteMany({ where: { propertyId } })
  await prismaDb.hospede.deleteMany({ where: { propertyId } })
  await prismaDb.property.delete({ where: { id: propertyId } }).catch(() => {})
  await prismaDb.user.delete({ where: { id: userId } }).catch(() => {})
})

describe('PrismaHospedeRepository', () => {
  const guestId = `${TEST_PREFIX}-guest-1`
  const guestCpf = '12345678901'

  it('deve salvar e recuperar hospede', async () => {
    const doc = Documento.create(guestCpf, 'cpf')
    const hospede = Hospede.create({
      id: guestId,
      nomeCompleto: 'Joao Hospede',
      documento: doc.isOk ? doc.value : Documento.create('00000000000', 'cpf').value,
      dataNascimento: new Date('1990-01-01'),
      telefone: '5511999990001',
    }).value
    const saved = await hospedeRepo.save(hospede)
    expect(saved.isOk).toBe(true)

    const found = await hospedeRepo.getById(guestId)
    expect(found.isOk).toBe(true)
    expect(found.value.nomeCompleto).toBe('Joao Hospede')
  })

  it('deve buscar por documento', async () => {
    const found = await hospedeRepo.getByDocument(guestCpf)
    expect(found.isOk).toBe(true)
    expect(found.value.id).toBe(guestId)
  })

  it('deve buscar por termo', async () => {
    const results = await hospedeRepo.search('Joao')
    expect(results.isOk).toBe(true)
    expect(results.value.length).toBeGreaterThanOrEqual(1)
  })

  it('deve retornar erro se nao encontrado', async () => {
    const found = await hospedeRepo.getById('nonexistent-guest')
    expect(found.isFail).toBe(true)
  })
})

describe('PrismaQuartoRepository', () => {
  const roomId = `${TEST_PREFIX}-room-1`

  it('deve salvar e recuperar quarto', async () => {
    const quarto = makeQuarto(roomId)
    const saved = await quartoRepo.save(quarto)
    expect(saved.isOk).toBe(true)

    const found = await quartoRepo.getById(roomId)
    expect(found.isOk).toBe(true)
    expect(found.value.nome).toBe(`Suite ${roomId}`)
    expect(found.value.diariaBase.centavos).toBe(30000)
  })

  it('deve listar por tipo', async () => {
    const results = await quartoRepo.listByTipo(TipoQuarto.SUITE_MASTER)
    expect(results.isOk).toBe(true)
    expect(results.value.length).toBeGreaterThanOrEqual(1)
  })

  it('deve listar disponiveis', async () => {
    const periodo = makePeriodo(30, 33)
    const results = await quartoRepo.listAvailable(periodo)
    expect(results.isOk).toBe(true)
    expect(results.value.length).toBeGreaterThanOrEqual(1)
  })

  it('deve atualizar status', async () => {
    const result = await quartoRepo.updateStatus(roomId, StatusQuarto.MANUTENCAO)
    expect(result.isOk).toBe(true)
  })
})

describe('PrismaReservaRepository', () => {
  const bookingId = `${TEST_PREFIX}-booking-1`
  const guestId = `${TEST_PREFIX}-guest-2`
  const roomId = `${TEST_PREFIX}-room-2`

  beforeAll(async () => {
    const hospede = makeHospede(guestId)
    await hospedeRepo.save(hospede)

    const quarto = makeQuarto(roomId)
    await quartoRepo.save(quarto)
  })

  it('deve criar e recuperar reserva', async () => {
    const periodo = makePeriodo(60, 63)
    const diariaBase = Money.create(30000).value
    const reserva = Reserva.create({
      id: bookingId,
      guestId,
      roomId,
      periodo,
      numeroHospedes: 1,
      capacidadeMaxima: 2,
      diariaBase,
    }).value

    const saved = await reservaRepo.save(reserva)
    expect(saved.isOk).toBe(true)

    const found = await reservaRepo.getById(bookingId)
    expect(found.isOk).toBe(true)
    expect(found.value.status).toBe(StatusReserva.PENDENTE)
    expect(found.value.guestId).toBe(guestId)
    expect(found.value.roomId).toBe(roomId)
  })

  it('deve confirmar reserva e persistir', async () => {
    const found = await reservaRepo.getById(bookingId)
    expect(found.isOk).toBe(true)
    found.value.confirmar()
    const saved = await reservaRepo.save(found.value)
    expect(saved.isOk).toBe(true)

    const reloaded = await reservaRepo.getById(bookingId)
    expect(reloaded.isOk).toBe(true)
    expect(reloaded.value.status).toBe(StatusReserva.CONFIRMADA)
  })

  it('deve listar por hospede', async () => {
    const results = await reservaRepo.listByGuest(guestId)
    expect(results.isOk).toBe(true)
    expect(results.value.length).toBeGreaterThanOrEqual(1)
  })

  it('deve listar por quarto', async () => {
    const results = await reservaRepo.listByRoom(roomId)
    expect(results.isOk).toBe(true)
    expect(results.value.length).toBeGreaterThanOrEqual(1)
  })

  it('deve verificar disponibilidade', async () => {
    const periodo = makePeriodo(60, 63)
    const available = await reservaRepo.isRoomAvailable(roomId, periodo)
    expect(available.isOk).toBe(true)
    expect(available.value).toBe(false)
  })

  it('deve listar check-ins futuros', async () => {
    const future = makePeriodo(55, 70)
    const checkins = await reservaRepo.listUpcomingCheckins(future)
    expect(checkins.isOk).toBe(true)
    expect(checkins.value.length).toBeGreaterThanOrEqual(1)
  })

  it('fluxo completo: checkin → checkout', async () => {
    const found = await reservaRepo.getById(bookingId)
    if (!found.isOk || found.value.status !== StatusReserva.CONFIRMADA) return

    const checkin = found.value.realizarCheckIn(found.value.periodo.dataInicio)
    expect(checkin.isOk).toBe(true)
    await reservaRepo.save(checkin.value)

    const afterCheckin = await reservaRepo.getById(bookingId)
    expect(afterCheckin.isOk).toBe(true)
    expect(afterCheckin.value.status).toBe(StatusReserva.CHECKIN)

    const checkout = afterCheckin.value.realizarCheckOut(afterCheckin.value.periodo.dataFim)
    expect(checkout.isOk).toBe(true)
    await reservaRepo.save(checkout.value)

    const afterCheckout = await reservaRepo.getById(bookingId)
    expect(afterCheckout.isOk).toBe(true)
    expect(afterCheckout.value.status).toBe(StatusReserva.CHECKOUT)
  })

  it('deve deletar reserva', async () => {
    const delId = `${TEST_PREFIX}-booking-del`
    const periodo = makePeriodo(90, 93)
    const reserva = Reserva.create({
      id: delId,
      guestId,
      roomId,
      periodo,
      numeroHospedes: 1,
      capacidadeMaxima: 2,
      diariaBase: Money.create(30000).value,
    }).value
    await reservaRepo.save(reserva)

    const deleted = await reservaRepo.delete(delId)
    expect(deleted.isOk).toBe(true)

    const found = await reservaRepo.getById(delId)
    expect(found.isFail).toBe(true)
  })
})

describe('PrismaServicoRepository', () => {
  const svcId = `${TEST_PREFIX}-svc-1`

  it('deve salvar e recuperar servico', async () => {
    const servico = makeServico(svcId)
    const saved = await servicoRepo.save(servico)
    expect(saved.isOk).toBe(true)

    const found = await servicoRepo.getById(svcId)
    expect(found.isOk).toBe(true)
    expect(found.value.nome).toBe(`Cafe ${svcId}`)
  })

  it('deve listar por categoria', async () => {
    const results = await servicoRepo.listByCategoria(CategoriaServico.ALIMENTACAO)
    expect(results.isOk).toBe(true)
    expect(results.value.length).toBeGreaterThanOrEqual(1)
  })

  it('deve listar disponiveis', async () => {
    const results = await servicoRepo.listAvailable()
    expect(results.isOk).toBe(true)
    expect(results.value.length).toBeGreaterThanOrEqual(1)
  })
})

describe('PrismaFeedbackRepository', () => {
  const feedbackId = `${TEST_PREFIX}-fb-1`
  const bookingId = `${TEST_PREFIX}-booking-fb`
  const guestId = `${TEST_PREFIX}-guest-fb`
  const roomId = `${TEST_PREFIX}-room-fb`

  beforeAll(async () => {
    const hospede = makeHospede(guestId)
    await hospedeRepo.save(hospede)

    const quarto = makeQuarto(roomId)
    await quartoRepo.save(quarto)

    const periodo = makePeriodo(120, 123)
    const reserva = Reserva.create({
      id: bookingId,
      guestId,
      roomId,
      periodo,
      numeroHospedes: 1,
      capacidadeMaxima: 2,
      diariaBase: Money.create(30000).value,
    }).value
    await reservaRepo.save(reserva)
  })

  it('deve salvar e recuperar feedback', async () => {
    const feedback = Feedback.create({
      id: feedbackId,
      bookingId,
      notaGeral: 9,
      comentario: 'Excelente estadia!',
      categorias: { limpeza: 10, atendimento: 9 },
    }).value

    const saved = await feedbackRepo.save(feedback)
    expect(saved.isOk).toBe(true)

    const found = await feedbackRepo.getById(feedbackId)
    expect(found.isOk).toBe(true)
    expect(found.value.notaGeral).toBe(9)
    expect(found.value.comentario).toBe('Excelente estadia!')
  })

  it('deve listar por reserva', async () => {
    const results = await feedbackRepo.listByBooking(bookingId)
    expect(results.isOk).toBe(true)
    expect(results.value.length).toBeGreaterThanOrEqual(1)
  })

  it('deve listar por periodo', async () => {
    const inicio = new Date()
    inicio.setFullYear(2023, 1, 1)
    const fim = new Date()
    fim.setFullYear(2027, 1, 1)
    const periodo = DateRange.create(inicio, fim).value
    const results = await feedbackRepo.listByPeriod(periodo)
    expect(results.isOk).toBe(true)
    expect(results.value.length).toBeGreaterThanOrEqual(1)
  })

  it('deve calcular NPS', async () => {
    const inicio = new Date()
    inicio.setFullYear(2023, 1, 1)
    const fim = new Date()
    fim.setFullYear(2027, 1, 1)
    const periodo = DateRange.create(inicio, fim).value
    const nps = await feedbackRepo.getNPS(periodo)
    expect(nps.isOk).toBe(true)
    expect(typeof nps.value).toBe('number')
  })
})
