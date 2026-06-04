import { Result } from '../../shared/Result'
import { PIIScanner } from '../../domain/security/services/PIIScanner'
import { HMACValidator, IdempotencyBarrier } from '../../domain/security/services/HMACValidator'
import { createSplitConfig, zehlaSplitPercentage } from '../../domain/finance/ports/IFinancialGatewayPort'
import type { IFinancialGatewayPort, PaymentNotification, PaymentSplitConfig } from '../../domain/finance/ports/IFinancialGatewayPort'

const STRIPE_API_VERSION = '2025-02-24'
const STRIPE_BASE_URL = 'https://api.stripe.com/v1'

export class StripeGatewayAdapter implements IFinancialGatewayPort {
  private readonly apiKey: string
  private readonly zehlaRecipientId: string
  private readonly webhookSecret: string
  private readonly idempotency: IdempotencyBarrier

  constructor(
    apiKey: string,
    zehlaRecipientId: string,
    webhookSecret: string,
  ) {
    this.apiKey = apiKey
    this.zehlaRecipientId = zehlaRecipientId
    this.webhookSecret = webhookSecret
    this.idempotency = new IdempotencyBarrier()
  }

  async createSplitPayment(
    amount: number,
    _zehlaRecipientId: string,
    pousadaRecipientId: string,
    planName: string,
    idempotencyKey: string,
  ): Promise<Result<PaymentSplitConfig, Error>> {
    if (!this.idempotency.check(idempotencyKey)) {
      return Result.fail(new Error('Idempotency key already processed'))
    }

    const percentage = zehlaSplitPercentage(planName)
    const applicationFee = Math.round(amount * percentage)

    const body = new URLSearchParams({
      amount: String(Math.round(amount * 100)),
      currency: 'brl',
      'transfer_data[destination]': pousadaRecipientId,
      'transfer_data[amount]': String(Math.round((amount - applicationFee) * 100)),
      application_fee_amount: String(applicationFee),
      description: `ZEHLA ${planName} — Split automático`,
      'metadata[plan]': planName,
      'metadata[platform]': 'zehla_smarthotel',
    })

    try {
      const response = await fetch(`${STRIPE_BASE_URL}/payment_intents`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          'Content-Type': 'application/x-www-form-urlencoded',
          'Stripe-Version': STRIPE_API_VERSION,
          'Idempotency-Key': idempotencyKey,
        },
        body: body.toString(),
      })

      if (!response.ok) {
        const errBody = await response.text()
        const masked = PIIScanner.tokenize(errBody)
        return Result.fail(new Error(`Stripe API error: ${masked.tokenized}`))
      }

      const data = await response.json()

      const config = createSplitConfig(
        data.id,
        amount,
        this.zehlaRecipientId,
        pousadaRecipientId,
        percentage,
      )

      return Result.ok(config)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown Stripe error'
      return Result.fail(new Error(`Stripe split failed: ${message}`))
    }
  }

  async processWebhook(rawBody: string, signature: string): Promise<Result<PaymentNotification, Error>> {
    const validation = await HMACValidator.validate(rawBody, signature, this.webhookSecret)
    if (validation.isFail) {
      return Result.fail(validation.error)
    }

    let event: { type: string; data: { object: Record<string, unknown> } }
    try {
      event = JSON.parse(rawBody)
    } catch {
      return Result.fail(new Error('Invalid webhook payload'))
    }

    const paymentIntent = event.data.object as Record<string, unknown>

    const idempotentKey = `webhook_${paymentIntent.id ?? 'unknown'}`
    if (!this.idempotency.check(idempotentKey)) {
      return Result.fail(new Error('Duplicate webhook event'))
    }

    const statusMap: Record<string, 'pending' | 'approved' | 'failed' | 'refunded'> = {
      'payment_intent.succeeded': 'approved',
      'payment_intent.pending': 'pending',
      'payment_intent.payment_failed': 'failed',
      'charge.refunded': 'refunded',
      'charge.refund.updated': 'refunded',
    }

    const notification: PaymentNotification = {
      id: event.type,
      event: event.type,
      transactionId: String(paymentIntent.id ?? ''),
      status: statusMap[event.type] ?? 'pending',
      grossAmount: Number(paymentIntent.amount ?? 0) / 100,
      netAmount: (Number(paymentIntent.amount_received ?? paymentIntent.amount ?? 0)) / 100,
      paidAmount: Number(paymentIntent.amount_received ?? 0) / 100,
      metadata: (paymentIntent.metadata as Record<string, string>) ?? {},
      rawPayload: PIIScanner.tokenize(rawBody).tokenized,
    }

    return Result.ok(Object.freeze(notification))
  }

  async getRecipientBalance(recipientId: string): Promise<Result<{ available: number; pending: number }, Error>> {
    try {
      const response = await fetch(`${STRIPE_BASE_URL}/balance`, {
        headers: { Authorization: `Bearer ${this.apiKey}` },
      })

      if (!response.ok) {
        return Result.fail(new Error('Failed to fetch Stripe balance'))
      }

      const data = await response.json()
      const brlBalance = data.available?.find(
        (b: { currency: string }) => b.currency === 'brl',
      )

      return Result.ok({
        available: (brlBalance?.amount ?? 0) / 100,
        pending: 0,
      })
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error'
      return Result.fail(new Error(`Balance fetch failed: ${message}`))
    }
  }

  async cancelSplit(transactionId: string): Promise<Result<void, Error>> {
    try {
      const response = await fetch(`${STRIPE_BASE_URL}/payment_intents/${transactionId}/cancel`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${this.apiKey}` },
      })

      if (!response.ok) {
        return Result.fail(new Error('Failed to cancel Stripe payment'))
      }

      return Result.ok(undefined)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error'
      return Result.fail(new Error(`Cancel failed: ${message}`))
    }
  }
}
