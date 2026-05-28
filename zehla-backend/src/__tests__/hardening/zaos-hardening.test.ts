import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { TenantSession } from '../../domain/hardening/value-objects/TenantSession'
import { JwtGuard } from '../../infrastructure/hardening/JwtGuard'
import { HMACValidator } from '../../infrastructure/hardening/HMACValidator'
import { IdempotencyBarrier } from '../../infrastructure/hardening/IdempotencyBarrier'

describe('TenantSession', () => {
  it('deve criar sessao com pousadaId valido', () => {
    const session = TenantSession.create({ pousadaId: 'pousada-123' })
    expect(session.isOk).toBe(true)
    expect(session.value.pousadaId).toBe('pousada-123')
  })

  it('deve falhar se pousadaId for vazio', () => {
    const session = TenantSession.create({ pousadaId: '' })
    expect(session.isFail).toBe(true)
  })

  it('deve falhar se pousadaId for espacos', () => {
    const session = TenantSession.create({ pousadaId: '   ' })
    expect(session.isFail).toBe(true)
  })

  it('deve criar sessao com dados completos', () => {
    const session = TenantSession.create({
      pousadaId: 'p-1',
      userId: 'user-1',
      email: 'host@example.com',
      role: 'OWNER',
      permissions: ['read:reservations', 'write:reservations'],
    })
    expect(session.isOk).toBe(true)
    expect(session.value.userId).toBe('user-1')
    expect(session.value.role).toBe('OWNER')
  })

  it('deve verificar permissoes', () => {
    const session = TenantSession.create({
      pousadaId: 'p-1',
      permissions: ['read:reservations'],
    }).value
    expect(session.hasPermission('read:reservations')).toBe(true)
    expect(session.hasPermission('write:reservations')).toBe(false)
  })

  it('deve verificar role', () => {
    const session = TenantSession.create({
      pousadaId: 'p-1',
      role: 'ADMIN',
    }).value
    expect(session.isRole('ADMIN')).toBe(true)
    expect(session.isRole('OWNER')).toBe(false)
  })
})

describe('JwtGuard', () => {
  let guard: JwtGuard

  beforeEach(() => {
    vi.stubEnv('JWT_SECRET', 'test_secret_key_for_jwt_guard_2026')
    guard = new JwtGuard()
  })

  afterEach(() => {
    vi.unstubAllEnvs()
  })

  it('deve rejeitar token com algoritmo "none"', async () => {
    const token = 'eyJhbGciOiJub25lIiwidHlwIjoiSldUIn0.eyJzdWIiOiIxMjM0NTY3ODkwIiwidGVuYW50SWQiOiJwLTEiLCJpYXQiOjE1MTYyMzkwMjJ9.'
    const result = await guard.validate(token)
    expect(result.isFail).toBe(true)
    expect(result.error.message).toContain('none')
  })

  it('deve rejeitar token com algoritmo proibido (HS512)', async () => {
    const token = 'eyJhbGciOiJIUzUxMiIsInR5cCI6IkpXVCJ9.eyJ0ZW5hbnRJZCI6InAtMSJ9.fake_signature'
    const result = await guard.validate(token)
    expect(result.isFail).toBe(true)
    expect(result.error.message).toContain('not allowed')
  })

  it('deve rejeitar token mal formatado', async () => {
    const result = await guard.validate('invalid-token')
    expect(result.isFail).toBe(true)
  })

  it('deve rejeitar token com duas partes', async () => {
    const result = await guard.validate('header.payload')
    expect(result.isFail).toBe(true)
  })

  it('deve usar sub como fallback quando tenantId nao existe', async () => {
    const signResult = await guard.sign({ sub: 'user-1' }, 'test_secret_key_for_jwt_guard_2026')
    expect(signResult.isOk).toBe(true)

    const result = await guard.validate(signResult.value)
    expect(result.isOk).toBe(true)
    expect(result.value.pousadaId).toBe('user-1')
  })

  it('deve validar token valido e retornar TenantSession', async () => {
    const signResult = await guard.sign(
      { tenantId: 'p-1', sub: 'user-1', role: 'ADMIN', permissions: ['read'] },
      'test_secret_key_for_jwt_guard_2026'
    )
    expect(signResult.isOk).toBe(true)

    const result = await guard.validate(signResult.value)
    expect(result.isOk).toBe(true)
    expect(result.value.pousadaId).toBe('p-1')
    expect(result.value.userId).toBe('user-1')
    expect(result.value.role).toBe('ADMIN')
    expect(result.value.hasPermission('read')).toBe(true)
  })

  it('deve rejeitar token com assinatura invalida', async () => {
    const signResult = await guard.sign(
      { tenantId: 'p-1' },
      'test_secret_key_for_jwt_guard_2026'
    )
    expect(signResult.isOk).toBe(true)

    const parts = signResult.value.split('.')
    parts[2] = 'invalidsignature'
    const tampered = parts.join('.')

    const result = await guard.validate(tampered)
    expect(result.isFail).toBe(true)
  })

  it('deve aceitar token com pousada_id em vez de tenantId', async () => {
    const signResult = await guard.sign(
      { pousada_id: 'p-99', sub: 'user-99' },
      'test_secret_key_for_jwt_guard_2026'
    )
    expect(signResult.isOk).toBe(true)

    const result = await guard.validate(signResult.value)
    expect(result.isOk).toBe(true)
    expect(result.value.pousadaId).toBe('p-99')
  })

  it('deve extrair pousadaId de tenantId no payload', async () => {
    const signResult = await guard.sign(
      { tenantId: 'p-999' },
      'test_secret_key_for_jwt_guard_2026'
    )
    expect(signResult.isOk).toBe(true)

    const result = await guard.validate(signResult.value)
    expect(result.isOk).toBe(true)
    expect(result.value.pousadaId).toBe('p-999')
  })
})

describe('HMACValidator', () => {
  let hmac: HMACValidator

  beforeEach(() => {
    hmac = new HMACValidator()
  })

  it('deve gerar assinatura HMAC-SHA256', () => {
    const sig = hmac.sign('payload', 'secret')
    expect(sig).toBeTruthy()
    expect(sig.length).toBe(64)
    expect(/^[a-f0-9]+$/.test(sig)).toBe(true)
  })

  it('deve verificar assinatura valida', () => {
    const payload = '{"event":"pix.received","amount":150.00}'
    const secret = 'webhook_secret'
    const sig = hmac.sign(payload, secret)
    expect(hmac.verify(payload, sig, secret)).toBe(true)
  })

  it('deve rejeitar assinatura invalida', () => {
    const payload = '{"event":"pix.received"}'
    const secret = 'webhook_secret'
    const sig = hmac.sign(payload, secret)
    expect(hmac.verify(payload, sig + 'x', secret)).toBe(false)
  })

  it('deve rejeitar assinatura com payload alterado', () => {
    const payload = '{"event":"pix.received"}'
    const secret = 'webhook_secret'
    const sig = hmac.sign(payload, secret)
    expect(hmac.verify('{"event":"pix.received","amount":999}', sig, secret)).toBe(false)
  })

  it('deve rejeitar assinatura com comprimento diferente', () => {
    const payload = 'test'
    const sig = 'short' // length differs from 64-char hex
    expect(hmac.verify(payload, sig, 'secret')).toBe(false)
  })

  it('deve usar algoritmo diferente se configurado', () => {
    const hmacSha1 = new HMACValidator('sha1')
    const sig = hmacSha1.sign('payload', 'secret')
    expect(sig.length).toBe(40) // SHA1 hex = 40 chars
    expect(hmacSha1.verify('payload', sig, 'secret')).toBe(true)
  })

  it('deve ter comparacao em tempo constante - mesmo comprimento nao vaza', async () => {
    const payload = 'sensitive-data'
    const secret = 'my-secret'
    const correctSig = hmac.sign(payload, secret)
    const wrongSig = hmac.sign(payload + 'x', secret)

    const iterations = 5000
    let correctTime = 0
    let wrongTime = 0

    for (let i = 0; i < iterations; i++) {
      const start1 = performance.now()
      hmac.verify(payload, correctSig, secret)
      correctTime += performance.now() - start1

      const start2 = performance.now()
      hmac.verify(payload, wrongSig, secret)
      wrongTime += performance.now() - start2
    }

    const avgCorrect = correctTime / iterations
    const avgWrong = wrongTime / iterations
    const ratio = Math.max(avgCorrect, avgWrong) / Math.min(avgCorrect, avgWrong)
    expect(ratio).toBeLessThan(2.5)
  })
})

describe('IdempotencyBarrier', () => {
  let barrier: IdempotencyBarrier

  beforeEach(() => {
    barrier = new IdempotencyBarrier(60000)
    barrier.clear()
  })

  it('deve marcar webhookId como processado', () => {
    const isDuplicate = barrier.checkAndMark('wh-001')
    expect(isDuplicate).toBe(false)
    expect(barrier.getProcessedCount()).toBe(1)
  })

  it('deve detectar webhookId duplicado', () => {
    barrier.checkAndMark('wh-001')
    const isDuplicate = barrier.checkAndMark('wh-001')
    expect(isDuplicate).toBe(true)
  })

  it('deve detectar duplicata com isDuplicate', () => {
    barrier.markProcessed('wh-001')
    expect(barrier.isDuplicate('wh-001')).toBe(true)
    expect(barrier.isDuplicate('wh-002')).toBe(false)
  })

  it('deve permitir ids diferentes', () => {
    barrier.checkAndMark('wh-001')
    expect(barrier.checkAndMark('wh-002')).toBe(false)
    expect(barrier.getProcessedCount()).toBe(2)
  })

  it('deve limpar todos os registros', () => {
    barrier.markProcessed('wh-001')
    barrier.markProcessed('wh-002')
    barrier.clear()
    expect(barrier.getProcessedCount()).toBe(0)
  })

  it('deve expirar registros apos TTL', () => {
    vi.useFakeTimers()
    const fastBarrier = new IdempotencyBarrier(50)
    fastBarrier.markProcessed('wh-001')
    expect(fastBarrier.isDuplicate('wh-001')).toBe(true)
    vi.advanceTimersByTime(51)
    expect(fastBarrier.isDuplicate('wh-001')).toBe(false)
    vi.useRealTimers()
  })

  it('deve remover apenas expirados e manter recentes', () => {
    vi.useFakeTimers()
    const fastBarrier = new IdempotencyBarrier(100)
    fastBarrier.markProcessed('wh-old')
    vi.advanceTimersByTime(60)
    fastBarrier.markProcessed('wh-recent')
    vi.advanceTimersByTime(50)
    expect(fastBarrier.isDuplicate('wh-old')).toBe(false)
    expect(fastBarrier.isDuplicate('wh-recent')).toBe(true)
    vi.useRealTimers()
  })

  it('deve retornar 0 para barrier vazia', () => {
    expect(barrier.getProcessedCount()).toBe(0)
  })

  it('deve funcionar com idempotencia apos clear', () => {
    barrier.markProcessed('wh-001')
    barrier.clear()
    expect(barrier.checkAndMark('wh-001')).toBe(false)
  })

  it('deve aceitar webhookId com caracteres especiais', () => {
    const id = 'pix_evt_9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d'
    barrier.markProcessed(id)
    expect(barrier.isDuplicate(id)).toBe(true)
  })

  it('deve manter contagem correta apos multiplos marks', () => {
    for (let i = 0; i < 100; i++) {
      barrier.markProcessed(`wh-${i}`)
    }
    expect(barrier.getProcessedCount()).toBe(100)
  })

  it('deve retornar true para processado mesmo apos checkAndMark repetido', () => {
    barrier.checkAndMark('wh-001')
    barrier.checkAndMark('wh-001')
    barrier.checkAndMark('wh-001')
    expect(barrier.getProcessedCount()).toBe(1)
  })
})
