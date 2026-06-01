import { describe, it, expect, beforeEach, beforeAll } from 'vitest'
import crypto from 'crypto'
import { getBasePrisma } from '../../lib/prisma'
import { JwtGuard } from '../../infrastructure/hardening/JwtGuard'
import { buildPost, parseResponse } from '../helpers/http-test'

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
    const endpoints = [
      { name: 'Concierge', post: conciergePOST, url: '/api/hospitalidade/concierge' },
      { name: 'Leads', post: leadsPOST, url: '/api/comercial/leads' },
      { name: 'Propostas', post: propostasPOST, url: '/api/comercial/propostas' },
      { name: 'Tarefas', post: tarefasPOST, url: '/api/operacional/tarefas' },
      { name: 'Tarifas', post: tarifasPOST, url: '/api/revenue/tarifas' },
      { name: 'Reviews', post: reviewsPOST, url: '/api/marketing/reviews' },
      { name: 'Campanhas', post: campanhasPOST, url: '/api/marketing/campanhas' },
    ]

    for (const ep of endpoints) {
      it(`[${ep.name}] deve retornar 401 se a chamada for feita sem o header de autorização`, async () => {
        const req = buildPost(ep.url, { intent: 'TEST_INTENT' })
        const res = await ep.post(req)
        const { status, body } = await parseResponse(res)
        expect(status).toBe(401)
        expect(body).toHaveProperty('error')
        expect(body.error).toContain('authorization')
      })

      it(`[${ep.name}] deve retornar 401 se o token JWT for inválido ou fraudulento`, async () => {
        const req = buildPost(ep.url, { intent: 'TEST_INTENT' }, { Authorization: 'Bearer invalid-token-sig' })
        const res = await ep.post(req)
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

  // ─── 7. WEBHOOKS EXTERNOS: ZERO-TRUST HMAC ───────────────────────────────
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
