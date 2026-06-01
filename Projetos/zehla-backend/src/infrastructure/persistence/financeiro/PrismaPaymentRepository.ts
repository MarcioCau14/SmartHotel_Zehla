import { PrismaClient } from '@prisma/client'
import { Payment } from '../../../domain/financeiro/entities/Payment'
import { PixTransaction } from '../../../domain/financeiro/entities/PixTransaction'
import { PixKey, PixKeyType } from '../../../domain/financeiro/value-objects/PixKey'
import { Money } from '../../../domain/financeiro/value-objects/Money'
import { PaymentStatus, PixStatus } from '../../../domain/financeiro/enums'
import { IPaymentRepository } from '../../../application/financeiro/ports/IPaymentRepository'

export class PrismaPaymentRepository implements IPaymentRepository {
  constructor(private prisma: PrismaClient) {}

  async save(payment: Payment, propertyId?: string): Promise<Payment> {
    const pixTx = payment.pixTransaction
    let pixTxId: string | undefined

    if (pixTx) {
      const ptData = {
        id: pixTx.id,
        paymentId: payment.id,
        pixKeyType: pixTx.pixKey.type,
        pixKeyValue: pixTx.pixKey.value,
        amount: pixTx.amount.toNumber(),
        description: pixTx.description,
        qrCode: pixTx.qrCode,
        expiresAt: pixTx.expiresAt,
        endToEndId: pixTx.endToEndId,
        status: pixTx.status as any,
        confirmedAt: pixTx.confirmedAt,
      }

      await this.prisma.financeiroPixTransaction.upsert({
        where: { id: pixTx.id },
        create: ptData,
        update: ptData,
      })
      pixTxId = pixTx.id
    }

    const pmData = {
      id: payment.id,
      invoiceId: payment.invoiceId,
      propertyId: propertyId ?? '',
      amount: payment.amount.toNumber(),
      method: payment.method as any,
      status: payment.status as any,
      gatewayTransactionId: payment.gatewayTransactionId,
      failureReason: payment.failureReason,
      processedAt: payment.processedAt,
    }

    await this.prisma.financeiroPayment.upsert({
      where: { id: payment.id },
      create: pmData,
      update: pmData,
    })

    return payment
  }

  async findById(id: string): Promise<Payment | null> {
    const row = await this.prisma.financeiroPayment.findUnique({
      where: { id },
      include: { pixTransaction: true },
    })
    if (!row) return null
    return this.hydrate(row)
  }

  async findByInvoice(invoiceId: string): Promise<Payment[]> {
    const rows = await this.prisma.financeiroPayment.findMany({
      where: { invoiceId },
      include: { pixTransaction: true },
    })
    return rows.map((r) => this.hydrate(r)).filter(Boolean) as Payment[]
  }

  async findByStatus(status: PaymentStatus): Promise<Payment[]> {
    const rows = await this.prisma.financeiroPayment.findMany({
      where: { status: status as any },
      include: { pixTransaction: true },
    })
    return rows.map((r) => this.hydrate(r)).filter(Boolean) as Payment[]
  }

  async findByGatewayTransactionId(gatewayTxnId: string): Promise<Payment | null> {
    const row = await this.prisma.financeiroPayment.findFirst({
      where: { gatewayTransactionId: gatewayTxnId },
      include: { pixTransaction: true },
    })
    if (!row) return null
    return this.hydrate(row)
  }

  async findPendingByProperty(propertyId: string): Promise<Payment[]> {
    const rows = await this.prisma.financeiroPayment.findMany({
      where: { propertyId, status: 'PENDING' as any },
      include: { pixTransaction: true },
    })
    return rows.map((r) => this.hydrate(r)).filter(Boolean) as Payment[]
  }

  private hydrate(row: any): Payment | null {
    try {
      const amount = Money.create(row.amount ?? 0).isOk
        ? Money.create(row.amount ?? 0).value
        : Money.zero()

      let pixTransaction: PixTransaction | null = null
      if (row.pixTransaction) {
        const pt = row.pixTransaction
        const pixKeyResult = PixKey.create(
          (pt.pixKeyType as PixKeyType) ?? PixKeyType.RANDOM,
          pt.pixKeyValue ?? ''
        )
        if (pixKeyResult.isOk) {
          pixTransaction = PixTransaction.restore({
            id: pt.id,
            status: (pt.status as PixStatus) ?? PixStatus.AWAITING_PAYMENT,
            pixKey: pixKeyResult.value,
            amount: Money.create(pt.amount ?? 0).isOk
              ? Money.create(pt.amount ?? 0).value
              : Money.zero(),
            description: pt.description ?? '',
            endToEndId: pt.endToEndId ?? null,
            qrCode: pt.qrCode ?? '',
            expiresAt: pt.expiresAt ?? new Date(),
            confirmedAt: pt.confirmedAt ?? null,
            createdAt: pt.createdAt ?? new Date(),
          })
        }
      }

      return Payment.restore({
        id: row.id,
        invoiceId: row.invoiceId,
        status: (row.status as PaymentStatus) ?? PaymentStatus.PENDING,
        method: (row.method as any) ?? 'PIX',
        amount,
        gatewayTransactionId: row.gatewayTransactionId ?? null,
        failureReason: row.failureReason ?? null,
        pixTransaction,
        processedAt: row.processedAt ?? null,
        createdAt: row.createdAt ?? new Date(),
      })
    } catch {
      return null
    }
  }
}
