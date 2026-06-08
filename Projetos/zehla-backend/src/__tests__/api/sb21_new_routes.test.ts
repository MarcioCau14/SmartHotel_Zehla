import { describe, it, expect, beforeAll } from 'vitest'
import { buildGet, buildPost, parseResponse } from '../helpers/http-test'
import { JwtGuard } from '../../infrastructure/hardening/JwtGuard'

import { GET as socialGET, POST as socialPOST } from '../../app/api/webhooks/social/route'
import { GET as outboundGET, POST as outboundPOST } from '../../app/api/marketing/outbound/route'
import { GET as strategyGET, POST as strategyPOST } from '../../app/api/revenue/strategy/route'

const JWT_SECRET = process.env.JWT_SECRET ?? 'zehla_shield_secret_2026'

describe('ZEHLA SB21 — Social Webhook /api/webhooks/social', () => {
  it('[POST] deve rejeitar sem x-hub-signature-256', async () => {
    const req = buildPost('/api/webhooks/social', {})
    const res = await socialPOST(req)
    const { status, body } = await parseResponse(res)
    expect(status).toBe(401)
    expect(body).toHaveProperty('error')
  })

  it('[POST] deve rejeitar com HMAC inválido', async () => {
    const req = buildPost('/api/webhooks/social', { foo: 'bar' }, { 'x-hub-signature-256': 'sha256=fake' })
    const res = await socialPOST(req)
    const { status, body } = await parseResponse(res)
    expect(status).toBe(401)
    expect(body).toHaveProperty('error')
  })

  it('[POST] deve rejeitar HMAC inválido mesmo com payload vazio', async () => {
    const req = buildPost('/api/webhooks/social', { entry: [{ changes: [{}] }] }, { 'x-hub-signature-256': 'sha256=abc' })
    const res = await socialPOST(req)
    const { status } = await parseResponse(res)
    expect(status).toBe(401)
  })

  it('[GET] deve rejeitar verificação sem token', async () => {
    const req = buildGet('/api/webhooks/social')
    const res = await socialGET(req)
    const { status } = await parseResponse(res)
    expect(status).toBe(403)
  })
})

describe('ZEHLA SB21 — Outbound Engine /api/marketing/outbound', () => {
  let validToken: string

  beforeAll(async () => {
    const guard = new JwtGuard()
    const signResult = await guard.sign({ tenantId: 'test-prop', sub: 'test-user' }, JWT_SECRET)
    if (signResult.isFail) throw signResult.error
    validToken = signResult.value
  })

  it('[GET] deve rejeitar sem Authorization', async () => {
    const req = buildGet('/api/marketing/outbound')
    const res = await outboundGET(req)
    const { status, body } = await parseResponse(res)
    expect(status).toBe(401)
    expect(body).toHaveProperty('error')
  })

  it('[GET] deve rejeitar token inválido', async () => {
    const req = buildGet('/api/marketing/outbound', { Authorization: 'Bearer bad-token' })
    const res = await outboundGET(req)
    const { status, body } = await parseResponse(res)
    expect(status).toBe(401)
    expect(body).toHaveProperty('error')
  })

  it('[GET] deve retornar variantes com token válido', async () => {
    const req = buildGet('/api/marketing/outbound', { Authorization: `Bearer ${validToken}` })
    const res = await outboundGET(req)
    const { status, body } = await parseResponse(res)
    expect(status).toBe(200)
    expect(Array.isArray(body)).toBe(true)
    expect(body.length).toBeGreaterThanOrEqual(3)
    expect(body[0]).toHaveProperty('variant')
    expect(body[0]).toHaveProperty('emailSubject')
  })

  it('[POST] deve rejeitar sem Authorization', async () => {
    const req = buildPost('/api/marketing/outbound', { leadId: 'x', variant: 'FINANCIAL' })
    const res = await outboundPOST(req)
    const { status, body } = await parseResponse(res)
    expect(status).toBe(401)
    expect(body).toHaveProperty('error')
  })

  it('[POST] deve rejeitar sem leadId', async () => {
    const req = buildPost('/api/marketing/outbound', { variant: 'FINANCIAL' }, { Authorization: `Bearer ${validToken}` })
    const res = await outboundPOST(req)
    const { status, body } = await parseResponse(res)
    expect(status).toBe(400)
    expect(body).toHaveProperty('error')
  })

  it('[POST] deve aceitar dispatch válido', async () => {
    const req = buildPost('/api/marketing/outbound', { leadId: 'lead-1', variant: 'FINANCIAL' }, { Authorization: `Bearer ${validToken}` })
    const res = await outboundPOST(req)
    const { status, body } = await parseResponse(res)
    expect(status).toBe(200)
    expect(body).toHaveProperty('dispatched')
    expect(body.dispatched).toBe(1)
  })

  it('[POST] deve aceitar batch dispatch', async () => {
    const req = buildPost('/api/marketing/outbound', { leadIds: ['lead-1', 'lead-2'], variant: 'FINANCIAL', canal: 'email_corporativo' }, { Authorization: `Bearer ${validToken}` })
    const res = await outboundPOST(req)
    const { status, body } = await parseResponse(res)
    expect(status).toBe(200)
    expect(body.dispatched).toBe(2)
  })
})

describe('ZEHLA SB21 — Revenue Strategy /api/revenue/strategy', () => {
  let validToken: string

  beforeAll(async () => {
    const guard = new JwtGuard()
    const signResult = await guard.sign({ tenantId: 'test-prop', sub: 'test-user' }, JWT_SECRET)
    if (signResult.isFail) throw signResult.error
    validToken = signResult.value
  })

  it('[GET] deve rejeitar sem Authorization', async () => {
    const req = buildGet('/api/revenue/strategy')
    const res = await strategyGET(req)
    const { status, body } = await parseResponse(res)
    expect(status).toBe(401)
    expect(body).toHaveProperty('error')
  })

  it('[GET] deve rejeitar token inválido', async () => {
    const req = buildGet('/api/revenue/strategy', { Authorization: 'Bearer bad-token' })
    const res = await strategyGET(req)
    const { status, body } = await parseResponse(res)
    expect(status).toBe(401)
    expect(body).toHaveProperty('error')
  })

  it('[GET] deve retornar panorama estratégico com token válido', async () => {
    const req = buildGet('/api/revenue/strategy', { Authorization: `Bearer ${validToken}` })
    const res = await strategyGET(req)
    const { status, body } = await parseResponse(res)
    expect(status).toBe(200)
    expect(body).toHaveProperty('planos')
    expect(body).toHaveProperty('conversao')
    expect(body).toHaveProperty('estrategiasRegionais')
    expect(body).toHaveProperty('lgpd')
    expect(body).toHaveProperty('benchmark')
    expect(Array.isArray(body.planos)).toBe(true)
    expect(body.planos.length).toBe(3)
  })

  it('[POST] deve rejeitar sem Authorization', async () => {
    const req = buildPost('/api/revenue/strategy', { nome: 'Test' })
    const res = await strategyPOST(req)
    const { status, body } = await parseResponse(res)
    expect(status).toBe(401)
    expect(body).toHaveProperty('error')
  })

  it('[POST] deve rejeitar sem nome', async () => {
    const req = buildPost('/api/revenue/strategy', {}, { Authorization: `Bearer ${validToken}` })
    const res = await strategyPOST(req)
    const { status, body } = await parseResponse(res)
    expect(status).toBe(400)
    expect(body).toHaveProperty('error')
  })

  it('[POST] deve recomendar plano para lead válido', async () => {
    const req = buildPost('/api/revenue/strategy', { leadId: 'lead-test-1', nome: 'Pousada Sol', telefone: '11999999999', totalSpentUsd: 500, staysCount: 5 }, { Authorization: `Bearer ${validToken}` })
    const res = await strategyPOST(req)
    const { status, body } = await parseResponse(res)
    expect(status).toBe(200)
    expect(body).toHaveProperty('planoRecomendado')
    expect(body).toHaveProperty('canalPrioritario')
    expect(body).toHaveProperty('justificativa')
    expect(body.planoRecomendado.nome).toBe('PRO')
  })
})
