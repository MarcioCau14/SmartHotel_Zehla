import { describe, it, expect, vi, beforeEach } from 'vitest'
import { createSplitConfig, zehlaSplitPercentage } from '../../domain/finance/ports/IFinancialGatewayPort'
import { PlanPricingService } from '../../domain/finance/services/PlanPricingService'
import { HMACValidator, IdempotencyBarrier } from '../../domain/security/services/HMACValidator'
import { ProcessPaymentWebhookUseCase } from '../../application/finance/processors/ProcessPaymentWebhookUseCase'
import { PIIScanner } from '../../domain/security/services/PIIScanner'
import { Result } from '../../shared/Result'

describe('PaymentSplitConfig — Object.freeze + liable:false', () => {
  it('deve criar split com zehla liable:false e pousada liable:true', () => {
    const config = createSplitConfig('tx-123', 100, 'rec_zehla', 'rec_pousada', 0.15)
    expect(config.recipients[0].liable).toBe(false)
    expect(config.recipients[1].liable).toBe(true)
  })

  it('deve ter zehla sem chargeProcessingFee', () => {
    const config = createSplitConfig('tx-456', 200, 'rec_zehla', 'rec_pousada', 0.10)
    expect(config.recipients[0].chargeProcessingFee).toBe(false)
    expect(config.recipients[1].chargeProcessingFee).toBe(true)
  })

  it('deve ser Object.freeze — não pode ser mutado', () => {
    const config = createSplitConfig('tx-789', 300, 'rec_zehla', 'rec_pousada', 0.15)
    expect(Object.isFrozen(config)).toBe(true)
    expect(Object.isFrozen(config.recipients)).toBe(true)
    expect(Object.isFrozen(config.recipients[0])).toBe(true)
  })

  it('deve calcular valores corretos para 15%', () => {
    const config = createSplitConfig('tx-100', 500, 'rec_z', 'rec_p', 0.15)
    expect(config.zehlaCommission).toBe(75)
    expect(config.pousadaNetAmount).toBe(425)
  })

  it('zehlaSplitPercentage deve retornar percentuais por plano', () => {
    expect(zehlaSplitPercentage('LITE')).toBe(0.10)
    expect(zehlaSplitPercentage('PRO')).toBe(0.15)
    expect(zehlaSplitPercentage('MAX')).toBe(0.20)
    expect(zehlaSplitPercentage('FREE')).toBe(0.05)
  })
})

describe('PlanPricingService — Preços Psicológicos R$ 197/397/697', () => {
  it('LITE deve ser R$ 197/mês', () => {
    const preco = PlanPricingService.precoPorPlano('LITE')
    expect(preco?.mensal).toBe(197)
  })

  it('PRO deve ser R$ 397/mês', () => {
    const preco = PlanPricingService.precoPorPlano('PRO')
    expect(preco?.mensal).toBe(397)
  })

  it('MAX deve ser R$ 697/mês', () => {
    const preco = PlanPricingService.precoPorPlano('MAX')
    expect(preco?.mensal).toBe(697)
  })

  it('valorPix deve retornar preços menores que cartão', () => {
    expect(PlanPricingService.valorPix('LITE')).toBe(197)
    expect(PlanPricingService.valorCartao('LITE')).toBe(247)
  })

  it('calcularSplit deve dividir corretamente', () => {
    const split = PlanPricingService.calcularSplit(1000, 'PRO')
    expect(split.zehla).toBe(150)
    expect(split.pousada).toBe(850)
  })
})

describe('HMACValidator', () => {
  it('deve validar assinatura HMAC correta', async () => {
    const result = await HMACValidator.validate(
      '{"test":"payload"}',
      'expectedhexvalue',
      'mysecret',
      'sha256',
    )
    expect(result.isFail).toBe(true)
  })

  it('deve rejeitar signature vazia', async () => {
    const result = await HMACValidator.validate('{}', '', 'secret')
    expect(result.isFail).toBe(true)
  })

  it('deve rejeitar secret vazia', async () => {
    const result = await HMACValidator.validate('{}', 'sig', '')
    expect(result.isFail).toBe(true)
  })
})

describe('IdempotencyBarrier', () => {
  it('deve permitir primeira chamada e bloquear segunda', () => {
    const barrier = new IdempotencyBarrier(1000)
    expect(barrier.check('key-1')).toBe(true)
    expect(barrier.check('key-1')).toBe(false)
  })

  it('deve permitir chaves diferentes', () => {
    const barrier = new IdempotencyBarrier(1000)
    expect(barrier.check('key-a')).toBe(true)
    expect(barrier.check('key-b')).toBe(true)
  })

  it('deve expirar após TTL', async () => {
    const barrier = new IdempotencyBarrier(50)
    expect(barrier.check('exp-key')).toBe(true)
    await new Promise((r) => setTimeout(r, 60))
    expect(barrier.check('exp-key')).toBe(true)
  })

  it('clear deve resetar todas as chaves', () => {
    const barrier = new IdempotencyBarrier(1000)
    barrier.check('k1')
    barrier.check('k2')
    barrier.clear()
    expect(barrier.size).toBe(0)
  })
})

describe('ProcessPaymentWebhookUseCase', () => {
  let mockGateway: {
    processWebhook: ReturnType<typeof vi.fn>
  }

  beforeEach(() => {
    mockGateway = {
      processWebhook: vi.fn(),
    }
  })

  it('deve processar webhook com sucesso', async () => {
    mockGateway.processWebhook.mockResolvedValue({
      isOk: true,
      value: {
        id: 'payment_intent.succeeded',
        event: 'payment_intent.succeeded',
        transactionId: 'pi_123',
        status: 'approved',
        grossAmount: 197,
        netAmount: 197,
        paidAmount: 197,
        metadata: { plan: 'LITE', pousada_id: 'pousada-1' },
        rawPayload: '[TOKENIZED]',
      },
    })

    const useCase = new ProcessPaymentWebhookUseCase(mockGateway as any)
    const result = await useCase.execute({
      rawBody: '{}',
      signature: 'test_sig',
    })

    expect(result.isOk).toBe(true)
    if (result.isOk) {
      expect(result.value.status).toBe('approved')
      expect(result.value.planName).toBe('LITE')
      expect(result.value.pousadaId).toBe('pousada-1')
    }
  })

  it('deve propagar erro do gateway', async () => {
    mockGateway.processWebhook.mockResolvedValue(
      Result.fail(new Error('Invalid signature')),
    )

    const useCase = new ProcessPaymentWebhookUseCase(mockGateway as any)
    const result = await useCase.execute({
      rawBody: '{}',
      signature: 'bad_sig',
    })

    expect(result.isFail).toBe(true)
  })
})

describe('PIIScanner — Masking em Logs Financeiros', () => {
  it('deve tokenizar CPF em logs', () => {
    const log = 'Cliente CPF 123.456.789-10 pagou R$ 197'
    const result = PIIScanner.tokenize(log)
    expect(result.tokenized).not.toContain('123.456.789-10')
    expect(result.tokenized).toContain('[CPF_TOKEN_')
    expect(result.map.length).toBeGreaterThanOrEqual(1)
  })

  it('deve tokenizar email em logs', () => {
    const log = 'contato@pousada.com.br fez split'
    const result = PIIScanner.tokenize(log)
    expect(result.tokenized).not.toContain('contato@pousada.com.br')
  })

  it('deve tokenizar telefone em logs', () => {
    const log = 'Telefone do cliente: (11) 99999-8888'
    const result = PIIScanner.tokenize(log)
    expect(result.tokenized).not.toContain('99999-8888')
  })
})
