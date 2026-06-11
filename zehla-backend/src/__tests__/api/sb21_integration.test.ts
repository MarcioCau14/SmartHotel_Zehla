import { describe, it, expect, beforeEach, beforeAll } from 'vitest'
import crypto from 'crypto'
import { NextRequest } from 'next/server'
import { getBasePrisma } from '../../lib/prisma'
import { JwtGuard } from '../../infrastructure/hardening/JwtGuard'
import { buildPost, buildGet, parseResponse } from '../helpers/http-test'
import { redis } from '../../lib/redis'

// Importações diretas dos Route Handlers (Entrypoints)
import { POST as conciergePOST } from '../../app/api/hospitalidade/concierge/route'
import { POST as leadsPOST } from '../../app/api/comercial/leads/route'
import { POST as propostasPOST } from '../../app/api/comercial/propostas/route'
import { POST as tarefasPOST } from '../../app/api/operacional/tarefas/route'
import { POST as tarifasPOST } from '../../app/api/revenue/tarifas/route'
import { POST as reviewsPOST } from '../../app/api/marketing/reviews/route'
import { POST as campanhasPOST } from '../../app/api/marketing/campanhas/route'
import { POST as whatsappPOST } from '../../app/api/webhooks/whatsapp/route'
import { POST as pagamentoPOST } from '../../app/api/webhooks/pagamento/route'

// Route Handlers SB32 (Digital Guidebook + Mass Dispatch)
import { POST as guidebookPOST, GET as guidebookGET } from '../../app/api/guidebook/route'
import { POST as dispatchPOST } from '../../app/api/marketing/campaigns/dispatch/route'

const JWT_SECRET = process.env.JWT_SECRET ?? 'zehla_shield_secret_2026'
const PROPERTY_ID = 'api_integration_test_prop'

describe('ZEHLA PRIME SB21 — Adaptadores de Entrada / Route Handlers HTTP', () => {
  let validToken: string
  let guard: JwtGuard

  beforeAll(async () => {
    guard = new JwtGuard()
    const signResult = await guard.sign({ tenantId: PROPERTY_ID, sub: 'user-http-test' }, JWT_SECRET)
    if (signResult.isFail) throw signResult.error
    validToken = signResult.value

    // Garantir que o usuário e a propriedade de teste existam no banco real local
    const basePrisma = getBasePrisma()
    await basePrisma.user.upsert({
      where: { id: 'user-http-test' },
      create: {
        id: 'user-http-test',
        email: 'api-test-user@smarthotel.com',
        name: 'API Test User',
        password: 'hashed-password-123',
      },
      update: {},
    })

    await basePrisma.property.upsert({
      where: { id: PROPERTY_ID },
      create: {
        id: PROPERTY_ID,
        name: 'SmartHotel API Test Hotel',
        slug: 'api-test-hotel',
        address: 'Rua do Teste, 123',
        userId: 'user-http-test',
        email: 'api-test@smarthotel.com',
        phone: '5511999999999',
        whatsapp: '5511999999999',
        plan: 'PRO',
      },
      update: {},
    })
  })

  // ─── 1. TESTES DE AUTENTICAÇÃO (JWT GUARD) ───────────────────────────────
  describe('Segurança de Borda: JWT Guard Inegociável', () => {
    interface Endpoint { name: string; handler: (req: NextRequest) => Promise<NextResponse> | NextResponse; buildReq: (headers?: Record<string, string>) => NextRequest }
    const endpoints: Endpoint[] = [
      { name: 'Concierge', handler: conciergePOST, buildReq: (h) => buildPost('/api/hospitalidade/concierge', { intent: 'TEST_INTENT' }, h) },
      { name: 'Leads', handler: leadsPOST, buildReq: (h) => buildPost('/api/comercial/leads', { intent: 'TEST_INTENT' }, h) },
      { name: 'Propostas', handler: propostasPOST, buildReq: (h) => buildPost('/api/comercial/propostas', { intent: 'TEST_INTENT' }, h) },
      { name: 'Tarefas', handler: tarefasPOST, buildReq: (h) => buildPost('/api/operacional/tarefas', { intent: 'TEST_INTENT' }, h) },
      { name: 'Tarifas', handler: tarifasPOST, buildReq: (h) => buildPost('/api/revenue/tarifas', { intent: 'TEST_INTENT' }, h) },
      { name: 'Reviews', handler: reviewsPOST, buildReq: (h) => buildPost('/api/marketing/reviews', { intent: 'TEST_INTENT' }, h) },
      { name: 'Campanhas', handler: campanhasPOST, buildReq: (h) => buildPost('/api/marketing/campanhas', { intent: 'TEST_INTENT' }, h) },
      { name: 'Guidebook POST', handler: guidebookPOST, buildReq: (h) => buildPost('/api/guidebook', { id: 'test', sections: [] }, h) },
      { name: 'Guidebook GET', handler: guidebookGET, buildReq: (h) => buildGet('/api/guidebook', h) },
      { name: 'Campaign Dispatch', handler: dispatchPOST, buildReq: (h) => buildPost('/api/marketing/campaigns/dispatch', { campanhaId: 'test', templateId: 't1', recipients: [{ id: 'r1', name: 'T', phone: '5511999999999', language: 'pt' }] }, h) },
    ]

    for (const ep of endpoints) {
      it(`[${ep.name}] deve retornar 401 se a chamada for feita sem o header de autorização`, async () => {
        const req = ep.buildReq()
        const res = await ep.handler(req)
        const { status, body } = await parseResponse(res)
        expect(status).toBe(401)
        expect(body).toHaveProperty('error')
      })

      it(`[${ep.name}] deve retornar 401 se o token JWT for inválido ou fraudulento`, async () => {
        const req = ep.buildReq({ Authorization: 'Bearer invalid-token-sig' })
        const res = await ep.handler(req)
        const { status, body } = await parseResponse(res)
        expect(status).toBe(401)
        expect(body).toHaveProperty('error')
      })
    }
  })

  // ─── 2. HOSPITALIDADE: CONCIERGE ─────────────────────────────────────────
  describe('Hospitalidade: Zé-Concierge API', () => {
    it('deve aceitar e processar uma consulta de serviços disponível legítima', async () => {
      const req = buildPost(
        '/api/hospitalidade/concierge',
        { intent: 'CONSULTAR_SERVICOS' },
        { Authorization: `Bearer ${validToken}` }
      )
      const res = await conciergePOST(req)
      const { status, body } = await parseResponse(res)
      expect(status).toBe(200)
      expect(body).toHaveProperty('responseText')
      expect(body).toHaveProperty('confidenceScore')
    })
  })

  // ─── 3. COMERCIAL: LEADS E PROPOSTAS ─────────────────────────────────────
  describe('Comercial: Zé-Sales API', () => {
    it('deve processar uma captura de lead com sucesso e retornar 200', async () => {
      const req = buildPost(
        '/api/comercial/leads',
        {
          intent: 'CAPTURAR_LEAD',
          payload: {
            canal: 'site',
            nome: 'Lead Integração HTTP',
            email: `integration-${Date.now()}@sales.com`,
            telefone: '5511999990000',
          },
        },
        { Authorization: `Bearer ${validToken}` }
      )
      const res = await leadsPOST(req)
      const { status, body } = await parseResponse(res)
      expect(status).toBe(200)
      expect(body.success).toBe(true)
      expect(body.data).toHaveProperty('leadId')
    })

    it('deve falhar e retornar 400 se o canal de captura for inválido', async () => {
      const req = buildPost(
        '/api/comercial/leads',
        {
          intent: 'CAPTURAR_LEAD',
          payload: { canal: 'canal_fake' },
        },
        { Authorization: `Bearer ${validToken}` }
      )
      const res = await leadsPOST(req)
      const { status, body } = await parseResponse(res)
      expect(status).toBe(400)
      expect(body.success).toBe(false)
    })
  })

  // ─── 4. OPERACIONAL: TAREFAS ─────────────────────────────────────────────
  describe('Operacional: Zé-Ops API', () => {
    it('deve criar uma nova tarefa legítima através da API e retornar 200', async () => {
      const req = buildPost(
        '/api/operacional/tarefas',
        {
          intent: 'CRIAR_TAREFA',
          payload: {
            tipo: 'limpeza',
            titulo: 'Limpar Quarto Executivo API',
          },
        },
        { Authorization: `Bearer ${validToken}` }
      )
      const res = await tarefasPOST(req)
      const { status, body } = await parseResponse(res)
      expect(status).toBe(200)
      expect(body.success).toBe(true)
      expect(body.data).toHaveProperty('tarefaId')
    })
  })

  // ─── 5. REVENUE: YIELD E TARIFAS ─────────────────────────────────────────
  describe('Revenue & Yield: Zé-Analyst API', () => {
    it('deve falhar ao tentar validar break-even sem dados de tarifas corretas', async () => {
      const req = buildPost(
        '/api/revenue/tarifas',
        {
          intent: 'VALIDAR_BREAK_EVEN',
          payload: {
            regraTarifariaId: 'regra-inexistente',
            valorPretendido: 120,
          },
        },
        { Authorization: `Bearer ${validToken}` }
      )
      const res = await tarifasPOST(req)
      const { status, body } = await parseResponse(res)
      expect(status).toBe(400)
      expect(body.success).toBe(false)
    })
  })

  // ─── 6. MARKETING: REVIEWS E CAMPANHAS ───────────────────────────────────
  describe('Marketing: Zé-Marketer API', () => {
    it('deve agendar uma postagem institucional legítima de marketing', async () => {
      const futuro = new Date(Date.now() + 5 * 24 * 60 * 60 * 1000)
      const req = buildPost(
        '/api/marketing/campanhas',
        {
          intent: 'AGENDAR_POST',
          params: {
            canal: 'facebook',
            tipo: 'institucional',
            texto: 'Conheça nosso resort e curta o melhor da vida! 🏖️',
            tom: 'profissional',
            dataAgendamento: futuro.toISOString(),
          },
        },
        { Authorization: `Bearer ${validToken}` }
      )
      const res = await campanhasPOST(req)
      const { status, body } = await parseResponse(res)
      if (status !== 200) {
        console.error("DEBUG MARKETING TEST ERROR BODY:", JSON.stringify(body, null, 2))
      }
      expect(status).toBe(200)
      expect(body.dados).toHaveProperty('postId')
      expect(body.dados.canal).toBe('facebook')
    })
  })

  // ─── 8. SB32: DIGITAL GUIDEBOOK ──────────────────────────────────────────
  describe('Digital Guidebook (SB32): CriarGuiaDigital HTTP', () => {
    beforeAll(async () => {
      const bp = getBasePrisma()
      await bp.guideSection.deleteMany({ where: { guide: { propertyId: PROPERTY_ID } } })
      await bp.digitalGuide.deleteMany({ where: { propertyId: PROPERTY_ID } })
    })

    it('GET /api/guidebook deve retornar 404 para propriedade sem guia', async () => {
      const noGuideReq = buildGet('/api/guidebook', { Authorization: `Bearer ${validToken}` })
      const res = await guidebookGET(noGuideReq)
      const { status } = await parseResponse(res)
      expect(status).toBe(404)
    })

    it('POST /api/guidebook deve criar guia e retornar 201 com token válido', async () => {
      const guideId = `guide_test_${Date.now()}`
      const req = buildPost('/api/guidebook', {
        id: guideId,
        sections: [{ sectionType: 'wifi', icon: 'wifi', order: 0, content: [{ title: 'Wi-Fi', content: 'Senha: 1234', language: 'pt-BR' }] }],
      }, { Authorization: `Bearer ${validToken}` })
      const res = await guidebookPOST(req)
      const { status, body } = await parseResponse(res)
      expect(status).toBe(201)
      expect(body).toHaveProperty('id')
      expect(body.id).toBe(guideId)
    })

    it('POST /api/guidebook deve retornar 409 para guia duplicado na mesma propriedade', async () => {
      const req = buildPost('/api/guidebook', {
        id: `dup_${Date.now()}`,
        sections: [{ sectionType: 'wifi', icon: 'wifi', order: 0, content: [{ title: 'Wi-Fi', content: 'Senha', language: 'pt-BR' }] }],
      }, { Authorization: `Bearer ${validToken}` })
      await guidebookPOST(req)
      const res2 = await guidebookPOST(buildPost('/api/guidebook', {
        id: `dup2_${Date.now()}`,
        sections: [{ sectionType: 'wifi', icon: 'wifi', order: 0, content: [{ title: 'Wi-Fi', content: 'Senha', language: 'pt-BR' }] }],
      }, { Authorization: `Bearer ${validToken}` }))
      const { status } = await parseResponse(res2)
      expect(status).toBe(409)
    })

    it('POST /api/guidebook deve retornar 400 quando sections está vazio', async () => {
      const req = buildPost('/api/guidebook', { id: 'bad', sections: [] }, { Authorization: `Bearer ${validToken}` })
      const res = await guidebookPOST(req)
      const { status } = await parseResponse(res)
      expect(status).toBe(400)
    })
  })

  // ─── 9. SB32: CAMPAIGN DISPATCH ──────────────────────────────────────────
  describe('Campaign Dispatch (SB32): Disparo em Massa HTTP', () => {
    let campanhaId: string

    beforeAll(async () => {
      const basePrisma = getBasePrisma()
      await basePrisma.marketingCampanha.deleteMany({ where: { pousadaId: PROPERTY_ID } })
      try { await redis.del(`rl:dispatch:${PROPERTY_ID}`) } catch {}
      const camp = await basePrisma.marketingCampanha.create({
        data: {
          id: `dispatch_test_${Date.now()}`,
          pousadaId: PROPERTY_ID,
          nome: 'SB32 Dispatch Test',
          publicoAlvo: 'todos',
          tipo: 'mass_messaging',
          dataInicio: new Date(Date.now() + 86400000),
          dataFim: new Date(Date.now() + 86400000 * 7),
          status: 'aprovada',
        },
      })
      campanhaId = camp.id
    })

    it('POST /api/marketing/campaigns/dispatch deve retornar 400 quando campanhaId está ausente', async () => {
      const req = buildPost('/api/marketing/campaigns/dispatch', {
        templateId: 't1',
        recipients: [{ id: 'g1', name: 'João', phone: '5511999999999', language: 'pt' }],
      }, { Authorization: `Bearer ${validToken}` })
      const res = await dispatchPOST(req)
      const { status } = await parseResponse(res)
      expect(status).toBe(400)
    })

    it('POST /api/marketing/campaigns/dispatch deve retornar 404 para campanha inexistente', async () => {
      const req = buildPost('/api/marketing/campaigns/dispatch', {
        campanhaId: 'nao_existe',
        templateId: 't1',
        recipients: [{ id: 'g1', name: 'João', phone: '5511999999999', language: 'pt' }],
      }, { Authorization: `Bearer ${validToken}` })
      const res = await dispatchPOST(req)
      const { status } = await parseResponse(res)
      expect(status).toBe(404)
    })

    it('POST /api/marketing/campaigns/dispatch deve retornar 202 com token válido', async () => {
      const req = buildPost('/api/marketing/campaigns/dispatch', {
        campanhaId,
        templateId: 'template_promocao',
        templateVariables: { nome: '{{nome}}' },
        recipients: [{ id: 'guest-1', name: 'João', phone: '5511999999999', language: 'pt-BR' }],
      }, { Authorization: `Bearer ${validToken}` })
      const res = await dispatchPOST(req)
      const { status, body } = await parseResponse(res)
      if (status === 429) {
        expect(body.code).toBe('RATE_LIMITED')
        return
      }
      expect(status).toBe(202)
      expect(body).toHaveProperty('status')
      expect(body.status).toBe('em_execucao')
    })
  })

  // ─── 10. WEBHOOKS EXTERNOS: ZERO-TRUST HMAC ──────────────────────────────
  describe('Webhooks Externos: Zero-Trust HMAC Timing-Safe', () => {
    const WH_SECRET_WA = 'zehla_whatsapp_webhook_secret_2026'
    const WH_SECRET_PAY = 'zehla_payment_webhook_secret_2026'

    it('[WhatsApp] deve retornar 401 se a requisição não contiver cabeçalho HMAC', async () => {
      const req = buildPost('/api/webhooks/whatsapp', { messageId: 'wa-msg-1' })
      const res = await whatsappPOST(req)
      const { status, body } = await parseResponse(res)
      expect(status).toBe(401)
      expect(body.error).toContain('signature')
    })

    it('[WhatsApp] deve aceitar requisição com assinatura HMAC SHA256 legítima', async () => {
      const payload = { messageId: 'wa-msg-integration-test', text: 'Olá!' }
      const payloadStr = JSON.stringify(payload)
      const signature = crypto.createHmac('sha256', WH_SECRET_WA).update(payloadStr).digest('hex')

      const req = buildPost(
        '/api/webhooks/whatsapp',
        payload,
        { 'X-WhatsApp-Signature': signature }
      )
      const res = await whatsappPOST(req)
      const { status, body } = await parseResponse(res)
      expect(status).toBe(200)
      expect(body.status).toBe('verified_and_processed')
    })

    it('[Payment] deve rejeitar webhook de pagamento com assinatura inválida', async () => {
      const payload = { pagamentoId: 'pay-1', propriedadeId: PROPERTY_ID }
      const req = buildPost(
        '/api/webhooks/pagamento',
        payload,
        { 'X-Payment-Signature': 'fraudulent-hmac-sig-123456' }
      )
      const res = await pagamentoPOST(req)
      const { status, body } = await parseResponse(res)
      expect(status).toBe(401)
      expect(body.error).toBeDefined()
    })
  })
})
