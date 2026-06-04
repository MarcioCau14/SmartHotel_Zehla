import { describe, it, expect, beforeAll } from 'vitest'
import { buildGet, buildPatch, buildPost, parseResponse } from '../helpers/http-test'
import { JwtGuard } from '../../infrastructure/hardening/JwtGuard'

import { GET as leadsGET, PATCH as leadsPATCH } from '../../app/api/crm/leads/route'
import { GET as candidatesGET } from '../../app/api/crm/farmer/candidates/route'
import { POST as reactivatePOST } from '../../app/api/crm/farmer/reactivate/route'
import { GET as brainLogsGET } from '../../app/api/brain/logs/route'

const JWT_SECRET = process.env.JWT_SECRET ?? 'zehla_shield_secret_2026'

describe('ZEHLA PRIME SB21 — CRM + Farmer + Brain Route Handlers', () => {
  let validToken: string

  beforeAll(async () => {
    const guard = new JwtGuard()
    const signResult = await guard.sign({ tenantId: 'test-prop-id', sub: 'test-user' }, JWT_SECRET)
    if (signResult.isFail) throw signResult.error
    validToken = signResult.value
  })

  describe('Segurança de Borda: 401 Sem Token', () => {
    it('[GET /api/crm/leads] deve rejeitar sem Authorization', async () => {
      const req = buildGet('/api/crm/leads')
      const res = await leadsGET(req)
      const { status, body } = await parseResponse(res)
      expect(status).toBe(401)
      expect(body).toHaveProperty('error')
    })

    it('[PATCH /api/crm/leads] deve rejeitar sem Authorization', async () => {
      const req = buildPatch('/api/crm/leads', { leadId: 'x', stage: 'QUALIFICACAO' })
      const res = await leadsPATCH(req)
      const { status, body } = await parseResponse(res)
      expect(status).toBe(401)
      expect(body).toHaveProperty('error')
    })

    it('[GET /api/crm/farmer/candidates] deve rejeitar sem Authorization', async () => {
      const req = buildGet('/api/crm/farmer/candidates')
      const res = await candidatesGET(req)
      const { status, body } = await parseResponse(res)
      expect(status).toBe(401)
      expect(body).toHaveProperty('error')
    })

    it('[POST /api/crm/farmer/reactivate] deve rejeitar sem Authorization', async () => {
      const req = buildPost('/api/crm/farmer/reactivate', { leadId: 'x' })
      const res = await reactivatePOST(req)
      const { status, body } = await parseResponse(res)
      expect(status).toBe(401)
      expect(body).toHaveProperty('error')
    })

    it('[GET /api/brain/logs] deve rejeitar sem Authorization', async () => {
      const req = buildGet('/api/brain/logs')
      const res = await brainLogsGET(req)
      const { status, body } = await parseResponse(res)
      expect(status).toBe(401)
      expect(body).toHaveProperty('error')
    })
  })

  describe('Segurança de Borda: 401 com Token Inválido', () => {
    it('[GET /api/crm/leads] deve rejeitar token fraudulento', async () => {
      const req = buildGet('/api/crm/leads', { Authorization: 'Bearer invalid-token' })
      const res = await leadsGET(req)
      const { status, body } = await parseResponse(res)
      expect(status).toBe(401)
      expect(body).toHaveProperty('error')
    })

    it('[POST /api/crm/farmer/reactivate] deve rejeitar token fraudulento', async () => {
      const req = buildPost(
        '/api/crm/farmer/reactivate',
        { leadId: 'x' },
        { Authorization: 'Bearer eyJhbGciOiJub25lIn0.eyJ0ZW5hbnRJZCI6InRlc3QifQ.' },
      )
      const res = await reactivatePOST(req)
      const { status, body } = await parseResponse(res)
      expect(status).toBe(401)
      expect(body).toHaveProperty('error')
    })
  })

  describe('Validação de Input: 400 em Dados Inválidos', () => {
    it('[PATCH /api/crm/leads] deve rejeitar sem leadId', async () => {
      const req = buildPatch(
        '/api/crm/leads',
        { stage: 'QUALIFICACAO' },
        { Authorization: `Bearer ${validToken}` },
      )
      const res = await leadsPATCH(req)
      const { status, body } = await parseResponse(res)
      expect(status).toBe(400)
      expect(body).toHaveProperty('error')
    })

    it('[POST /api/crm/farmer/reactivate] deve rejeitar sem leadId', async () => {
      const req = buildPost(
        '/api/crm/farmer/reactivate',
        {},
        { Authorization: `Bearer ${validToken}` },
      )
      const res = await reactivatePOST(req)
      const { status, body } = await parseResponse(res)
      expect(status).toBe(400)
      expect(body).toHaveProperty('error')
    })
  })

  describe('PIIScanner — Respostas Sem Vazamento de PII', () => {
    it('[GET /api/crm/leads] deve ter telefone mascarado com token JWT válido', async () => {
      const req = buildGet('/api/crm/leads', { Authorization: `Bearer ${validToken}` })
      const res = await leadsGET(req)
      const { status, body } = await parseResponse(res)
      if (status === 200 && body.columns) {
        const allLeads = body.columns.flatMap((c: { leads: Array<Record<string, unknown>> }) => c.leads)
        for (const lead of allLeads) {
          if (lead.telefone) {
            expect(String(lead.telefone)).toMatch(/\[(CPF|EMAIL|PHONE|CARD)_TOKEN_/)
          }
        }
      }
    })
  })
})
