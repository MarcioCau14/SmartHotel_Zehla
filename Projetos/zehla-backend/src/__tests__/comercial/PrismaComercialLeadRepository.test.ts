import { describe, it, expect, beforeEach } from 'vitest'
import { ComercialLead } from '../../domain/comercial/entities/ComercialLead'
import { LeadScore } from '../../domain/comercial/value-objects/LeadScore'
import { OrigemLead } from '../../domain/comercial/value-objects/OrigemLead'
import { Documento } from '../../domain/comercial/value-objects/Documento'
import { PrismaComercialLeadRepository } from '../../infrastructure/persistence/comercial/PrismaComercialLeadRepository'

function createMockPrisma() {
  const store = new Map<string, Record<string, unknown>>()

  return {
    comercialLead: {
      async findUnique({ where }: { where: { id: string } }) {
        return store.get(where.id) ?? null
      },
      async upsert({ where, create, update }: {
        where: { id: string }
        create: Record<string, unknown>
        update: Record<string, unknown>
      }) {
        store.set(where.id, { ...update })
        return update
      },
    },
    _clear() {
      store.clear()
    },
    _store: store,
  }
}

type MockPrisma = ReturnType<typeof createMockPrisma>

describe('PrismaComercialLeadRepository — Data Mapper', () => {
  let prisma: MockPrisma
  let repo: PrismaComercialLeadRepository

  function criarLeadCompleto(): ComercialLead {
    const origem = OrigemLead.criar('site', 'google', 'campanha_verao', 'cpc').value as OrigemLead
    const score = LeadScore.criar(85, 'ideal', {
      budget: true, authority: true, need: true, timeline: true,
    }).value as LeadScore
    const doc = Documento.criar('12345678909', 'CPF').value as Documento
    const lead = ComercialLead.create({
      id: 'lead_mapper_001',
      origem,
      propriedadeId: 'prop_abc',
      nome: 'Maria Mapper',
      telefone: '11988887777',
      score,
      documento: doc,
      sdrResponsavel: 'ze_sales',
      tags: ['hot', 'urgente'],
    }).value as ComercialLead

    const contato = lead.primeiroContato().value as ComercialLead
    return contato.agendar(new Date('2026-07-15'), 'closer_01').value as ComercialLead
  }

  beforeEach(() => {
    prisma = createMockPrisma()
    repo = new PrismaComercialLeadRepository(prisma as any)
  })

  it('deve salvar e recuperar lead comercial com hidratação bidirecional', async () => {
    const leadOriginal = criarLeadCompleto()

    const salvo = await repo.salvar(leadOriginal)
    expect(salvo.isOk).toBe(true)

    const buscado = await repo.buscarPorId('lead_mapper_001')
    if (buscado.isFail) console.error('Hydrate error:', buscado.error.message)
    expect(buscado.isOk).toBe(true)
    expect(buscado.value).not.toBeNull()

    if (buscado.isOk && buscado.value) {
      expect(buscado.value.id).toBe('lead_mapper_001')
      expect(buscado.value.propriedadeId).toBe('prop_abc')
      expect(buscado.value.nome).toBe('Maria Mapper')
      expect(buscado.value.telefone).toBe('11988887777')
      expect(buscado.value.estado).toBe('agendado')

      expect(buscado.value.score).toBeDefined()
      expect(buscado.value.score?.valor).toBe(85)
      // icpFit não é persistido no schema Prisma (default 'fora_icp' após restore)

      expect(buscado.value.origem).toBeDefined()
      expect(buscado.value.origem.canal).toBe('site')

      expect(buscado.value.documento).toBeDefined()
      expect(buscado.value.documento?.valor).toBe('12345678909')
      expect(buscado.value.documento?.tipo).toBe('CPF')
    }
  })

  it('deve preservar a FSM após ciclo salvar+hidratar', async () => {
    const origem = OrigemLead.criar('whatsapp').value as OrigemLead
    const score = LeadScore.criar(30, 'minimo', {
      budget: true, authority: false, need: true, timeline: false,
    }).value as LeadScore
    const lead = ComercialLead.create({
      id: 'lead_fsm_001',
      origem,
      propriedadeId: 'prop_xyz',
      nome: 'FSM Test',
      score,
    }).value as ComercialLead

    const contato = lead.primeiroContato().value as ComercialLead
    const fu1 = contato.realizarFollowUp().value as ComercialLead
    const fu2 = fu1.realizarFollowUp().value as ComercialLead
    const fu3 = fu2.realizarFollowUp().value as ComercialLead

    expect(fu3.estado).toBe('follow_up_3')
    expect(fu3.quantidadeInteracoes).toBe(4)

    const salvo = await repo.salvar(fu3)
    expect(salvo.isOk).toBe(true)

    const buscado = await repo.buscarPorId('lead_fsm_001')
    if (buscado.isFail) console.error('Hydrate FSM error:', buscado.error.message)
    expect(buscado.isOk).toBe(true)
    if (buscado.isOk && buscado.value) {
      expect(buscado.value.estado).toBe('follow_up_3')
      // quantidadeInteracoes não é persistida no schema Prisma (default 0 após restore)
      // Mas o FSM é preservado: podemos transitar a partir do estado restaurado
      const agendado = buscado.value.agendar(new Date('2026-08-01'))
      expect(agendado.isOk).toBe(true)
      if (agendado.isOk) {
        expect(agendado.value.estado).toBe('agendado')
      }
    }
  })

  it('deve retornar null para ID inexistente', async () => {
    const result = await repo.buscarPorId('id_inexistente')
    expect(result.isOk).toBe(true)
    expect(result.value).toBeNull()
  })

  it('deve atualizar upsert quando salvar mesmo ID duas vezes', async () => {
    const origem = OrigemLead.criar('site').value as OrigemLead
    const lead = ComercialLead.create({
      id: 'lead_update_001',
      origem,
      propriedadeId: 'prop_1',
      nome: 'Versão 1',
    }).value as ComercialLead

    await repo.salvar(lead)

    const origem2 = OrigemLead.criar('whatsapp').value as OrigemLead
    const score2 = LeadScore.criar(90, 'ideal', {
      budget: true, authority: true, need: true, timeline: true,
    }).value as LeadScore
    const leadAtualizado = ComercialLead.create({
      id: 'lead_update_001',
      origem: origem2,
      propriedadeId: 'prop_1',
      nome: 'Versão 2',
      score: score2,
    }).value as ComercialLead

    const contato = leadAtualizado.primeiroContato().value as ComercialLead
    await repo.salvar(contato)

    const buscado = await repo.buscarPorId('lead_update_001')
    if (buscado.isFail) console.error('Hydrate update error:', buscado.error.message)
    expect(buscado.isOk).toBe(true)
    if (buscado.isOk && buscado.value) {
      expect(buscado.value.nome).toBe('Versão 2')
      expect(buscado.value.origem.canal).toBe('whatsapp')
      expect(buscado.value.score?.valor).toBe(90)
      expect(buscado.value.estado).toBe('primeira_interacao')
    }
  })
})
