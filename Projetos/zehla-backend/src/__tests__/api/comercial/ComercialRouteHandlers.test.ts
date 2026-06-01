import { describe, it, expect, beforeEach } from 'vitest'
import crypto from 'crypto'
import { JwtGuard } from '../../../infrastructure/hardening/JwtGuard'
import { ComercialControllerFactory } from '../../../infrastructure/http/comercial/ComercialControllerFactory'
import { InMemoryComercialLeadAdapter } from '../../../infrastructure/persistence/comercial/InMemoryComercialLeadAdapter'
import { ComercialLead } from '../../../domain/comercial/entities/ComercialLead'
import { OrigemLead } from '../../../domain/comercial/value-objects/OrigemLead'
import { LeadScore } from '../../../domain/comercial/value-objects/LeadScore'
import { buildGet, buildPost, parseResponse } from '../../helpers/http-test'
import { POST as qualificarPOST } from '../../../app/api/comercial/leads/[id]/qualificar/route'
import { POST as handoffPOST } from '../../../app/api/comercial/leads/[id]/handoff/route'
import { GET as escadaValorGET } from '../../../app/api/comercial/leads/[id]/escada-valor/route'
import { POST as pagamentoSinalPOST } from '../../../app/api/webhooks/comercial/pagamento-sinal/route'

const JWT_SECRET = 'zehla_shield_secret_2026'

describe('POST /api/comercial/leads/[id]/qualificar', () => {
  let guard: JwtGuard
  let inMemory: InMemoryComercialLeadAdapter
  let validToken: string

  beforeEach(async () => {
    inMemory = new InMemoryComercialLeadAdapter()
    inMemory.limpar()
    ComercialControllerFactory.configure({ leadRepo: inMemory, publisher: ComercialControllerFactory['publisher'] })

    guard = new JwtGuard()
    const signResult = await guard.sign({ tenantId: 'prop-1', sub: 'user-test' }, JWT_SECRET)
    if (signResult.isFail) throw signResult.error
    validToken = signResult.value
  })

  it('deve retornar 401 sem token JWT', async () => {
    const req = buildPost('/api/comercial/leads/lead-1/qualificar', {})
    const res = await qualificarPOST(req, { params: Promise.resolve({ id: 'lead-1' }) })
    const { status } = await parseResponse(res)
    expect(status).toBe(401)
  })

  it('deve retornar 200 ao qualificar lead com score suficiente', async () => {
    const origem = OrigemLead.criar('site').value
    const score = LeadScore.criar(70, 'ideal', { budget: true, authority: true, need: true, timeline: true }).value
    const lead = ComercialLead.create({
      id: 'lead-qualify-1', origem, propriedadeId: 'prop-1',
      nome: 'Marcio', score,
    }).value
    inMemory.salvarMock(lead)

    const req = buildPost('/api/comercial/leads/lead-qualify-1/qualificar', {}, { Authorization: `Bearer ${validToken}` })
    const res = await qualificarPOST(req, { params: Promise.resolve({ id: 'lead-qualify-1' }) })
    const { status, body } = await parseResponse(res)
    expect(status).toBe(200)
    expect(body.success).toBe(true)
    expect(body.data.id).toBe('lead-qualify-1')
  })

  it('deve retornar 400 para qualificar lead sem score', async () => {
    const origem = OrigemLead.criar('site').value
    const lead = ComercialLead.create({
      id: 'lead-noscore', origem, propriedadeId: 'prop-1',
    }).value
    inMemory.salvarMock(lead)

    const req = buildPost('/api/comercial/leads/lead-noscore/qualificar', {}, { Authorization: `Bearer ${validToken}` })
    const res = await qualificarPOST(req, { params: Promise.resolve({ id: 'lead-noscore' }) })
    const { status } = await parseResponse(res)
    expect(status).toBe(400)
  })
})

describe('POST /api/comercial/leads/[id]/handoff', () => {
  let guard: JwtGuard
  let inMemory: InMemoryComercialLeadAdapter
  let validToken: string

  beforeEach(async () => {
    inMemory = new InMemoryComercialLeadAdapter()
    inMemory.limpar()
    ComercialControllerFactory.configure({ leadRepo: inMemory, publisher: ComercialControllerFactory['publisher'] })

    guard = new JwtGuard()
    const signResult = await guard.sign({ tenantId: 'prop-1', sub: 'user-test' }, JWT_SECRET)
    if (signResult.isFail) throw signResult.error
    validToken = signResult.value
  })

  it('deve retornar 401 sem token JWT', async () => {
    const req = buildPost('/api/comercial/leads/lead-1/handoff', {})
    const res = await handoffPOST(req, { params: Promise.resolve({ id: 'lead-1' }) })
    const { status } = await parseResponse(res)
    expect(status).toBe(401)
  })

  it('deve retornar 400 para handoff de lead NAO agendado (FSM violation)', async () => {
    const origem = OrigemLead.criar('site').value
    const lead = ComercialLead.create({
      id: 'lead-handoff-fail', origem, propriedadeId: 'prop-1',
    }).value
    inMemory.salvarMock(lead)

    const req = buildPost('/api/comercial/leads/lead-handoff-fail/handoff', {
      closerId: 'closer-1',
      summaryPackage: {
        score: 70,
        icpFit: 'ideal',
        objecoes: [],
        respostas: [],
        gatilho: 'lead_quente',
      },
    }, { Authorization: `Bearer ${validToken}` })
    const res = await handoffPOST(req, { params: Promise.resolve({ id: 'lead-handoff-fail' }) })
    const { status } = await parseResponse(res)
    expect(status).toBe(400)
  })

  it('deve retornar 400 quando closerId estiver faltando', async () => {
    const req = buildPost('/api/comercial/leads/lead-1/handoff', {
      summaryPackage: { score: 70, icpFit: 'ideal', objecoes: [], respostas: [], gatilho: 'lead_quente' },
    }, { Authorization: `Bearer ${validToken}` })
    const res = await handoffPOST(req, { params: Promise.resolve({ id: 'lead-1' }) })
    const { status } = await parseResponse(res)
    expect(status).toBe(400)
  })

  it('deve retornar 200 ao realizar handoff de lead agendado', async () => {
    const origem = OrigemLead.criar('site').value
    const score = LeadScore.criar(70, 'ideal', { budget: true, authority: true, need: true, timeline: true }).value
    let lead = ComercialLead.create({
      id: 'lead-handoff-ok', origem, propriedadeId: 'prop-1', score,
    }).value
    lead = lead.primeiroContato().value
    lead = lead.agendar(new Date('2026-06-15'), 'sdr-1').value
    inMemory.salvarMock(lead)

    const req = buildPost('/api/comercial/leads/lead-handoff-ok/handoff', {
      closerId: 'closer-1',
      summaryPackage: {
        score: 70,
        icpFit: 'ideal',
        objecoes: ['preco_alto'],
        respostas: ['ofereceu_desconto'],
        gatilho: 'lead_quente',
      },
    }, { Authorization: `Bearer ${validToken}` })
    const res = await handoffPOST(req, { params: Promise.resolve({ id: 'lead-handoff-ok' }) })
    const { status, body } = await parseResponse(res)
    expect(status).toBe(200)
    expect(body.success).toBe(true)
    expect(body.data.id).toBe('lead-handoff-ok')
    expect(body.data.estado).toBe('em_negociacao')
  })
})

describe('GET /api/comercial/leads/[id]/escada-valor', () => {
  let guard: JwtGuard
  let inMemory: InMemoryComercialLeadAdapter
  let validToken: string

  beforeEach(async () => {
    inMemory = new InMemoryComercialLeadAdapter()
    inMemory.limpar()
    ComercialControllerFactory.configure({ leadRepo: inMemory, publisher: ComercialControllerFactory['publisher'] })

    guard = new JwtGuard()
    const signResult = await guard.sign({ tenantId: 'prop-1', sub: 'user-test' }, JWT_SECRET)
    if (signResult.isFail) throw signResult.error
    validToken = signResult.value
  })

  it('deve retornar 401 sem token JWT', async () => {
    const req = buildGet('/api/comercial/leads/lead-1/escada-valor?tierAtual=front_end')
    const res = await escadaValorGET(req, { params: Promise.resolve({ id: 'lead-1' }) })
    const { status } = await parseResponse(res)
    expect(status).toBe(401)
  })

  it('deve retornar 400 quando tierAtual nao for informado', async () => {
    const req = buildGet('/api/comercial/leads/lead-1/escada-valor', { Authorization: `Bearer ${validToken}` })
    const res = await escadaValorGET(req, { params: Promise.resolve({ id: 'lead-1' }) })
    const { status } = await parseResponse(res)
    expect(status).toBe(400)
  })

  it('deve retornar 200 com recomendacao de escada de valor', async () => {
    const origem = OrigemLead.criar('site').value
    const score = LeadScore.criar(85, 'ideal', { budget: true, authority: true, need: true, timeline: true }).value
    const lead = ComercialLead.create({
      id: 'lead-escada-1', origem, propriedadeId: 'prop-1', score,
      quantidadeInteracoes: 3,
    }).value
    inMemory.salvarMock(lead)

    const req = buildGet('/api/comercial/leads/lead-escada-1/escada-valor?tierAtual=front_end', { Authorization: `Bearer ${validToken}` })
    const res = await escadaValorGET(req, { params: Promise.resolve({ id: 'lead-escada-1' }) })
    const { status, body } = await parseResponse(res)
    expect(status).toBe(200)
    expect(body.success).toBe(true)
    expect(body.data.tipoRecomendacao).toBe('upsell')
    expect(body.data.tierRecomendado).toBe('back_end')
  })
})

describe('POST /api/webhooks/comercial/pagamento-sinal', () => {
  let inMemory: InMemoryComercialLeadAdapter

  beforeEach(() => {
    inMemory = new InMemoryComercialLeadAdapter()
    inMemory.limpar()
    ComercialControllerFactory.configure({ leadRepo: inMemory, publisher: ComercialControllerFactory['publisher'] })
  })

  it('deve retornar 401 sem assinatura HMAC', async () => {
    const req = buildPost('/api/webhooks/comercial/pagamento-sinal', {
      leadId: 'lead-1', propostaId: 'prop-1', valorSinal: 5000, plano: 'mensal',
    })
    const res = await pagamentoSinalPOST(req)
    const { status } = await parseResponse(res)
    expect(status).toBe(401)
  })

  it('deve retornar 400 quando campos obrigatorios estiverem faltando', async () => {
    const rawBody = JSON.stringify({ leadId: 'lead-1' })
    const hmac = crypto.createHmac('sha256', 'zehla_payment_webhook_secret_2026').update(rawBody).digest('hex')
    const req = buildPost('/api/webhooks/comercial/pagamento-sinal', JSON.parse(rawBody), {
      'X-Webhook-Signature': hmac,
    })
    const res = await pagamentoSinalPOST(req)
    const { status } = await parseResponse(res)
    expect(status).toBe(400)
  })

  it('deve retornar 200 ao registrar pagamento sinal com HMAC valido', async () => {
    const origem = OrigemLead.criar('site').value
    const score = LeadScore.criar(70, 'ideal', { budget: true, authority: true, need: true, timeline: true }).value
    let lead = ComercialLead.create({
      id: 'lead-sinal-1', origem, propriedadeId: 'prop-1', score,
    }).value
    lead = lead.primeiroContato().value
    lead = lead.agendar(new Date('2026-06-15'), 'sdr-1').value
    lead = lead.realizarHandoff('closer-1', {
      score: 70, icpFit: 'ideal', objecoes: [], respostas: [], gatilho: 'lead_quente',
    }).value
    inMemory.salvarMock(lead)

    const payload = { leadId: 'lead-sinal-1', propostaId: 'proposta-1', valorSinal: 5000, plano: 'premium' }
    const rawBody = JSON.stringify(payload)
    const hmac = crypto.createHmac('sha256', 'zehla_payment_webhook_secret_2026').update(rawBody).digest('hex')
    const req = buildPost('/api/webhooks/comercial/pagamento-sinal', payload, {
      'X-Webhook-Signature': hmac,
    })
    const res = await pagamentoSinalPOST(req)
    const { status, body } = await parseResponse(res)
    expect(status).toBe(200)
    expect(body.success).toBe(true)
    expect(body.data.id).toBe('lead-sinal-1')
    expect(body.data.estado).toBe('venda_sinal')
  })
})
