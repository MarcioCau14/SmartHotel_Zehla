import { PrismaClient } from '@prisma/client'
import { PixTransaction } from '../../../domain/financeiro/entities/PixTransaction'
import { PixKey, PixKeyType } from '../../../domain/financeiro/value-objects/PixKey'
import { Money } from '../../../domain/financeiro/value-objects/Money'
import { PixStatus } from '../../../domain/financeiro/enums'
import { IPixTransactionRepository } from '../../../application/financeiro/ports/IPixTransactionRepository'

export class PrismaPixTransactionRepository implements IPixTransactionRepository {
  constructor(private prisma: PrismaClient) {}

  async save(tx: PixTransaction): Promise<PixTransaction> {
    const data = {
      id: tx.id,
      paymentId: '',
      pixKeyType: tx.pixKey.type,
      pixKeyValue: tx.pixKey.value,
      amount: tx.amount.toNumber(),
      description: tx.description,
      qrCode: tx.qrCode,
      expiresAt: tx.expiresAt,
      endToEndId: tx.endToEndId,
      status: tx.status as any,
      confirmedAt: tx.confirmedAt,
    }

    await this.prisma.financeiroPixTransaction.upsert({
      where: { id: tx.id },
      create: data,
      update: data,
    })

    return tx
  }

  async findById(id: string): Promise<PixTransaction | null> {
    const row = await this.prisma.financeiroPixTransaction.findUnique({
      where: { id },
    })
    if (!row) return null
    return this.hydrate(row)
  }

  async findByEndToEndId(endToEndId: string): Promise<PixTransaction | null> {
    const row = await this.prisma.financeiroPixTransaction.findUnique({
      where: { endToEndId },
    })
    if (!row) return null
    return this.hydrate(row)
  }

  async findExpired(): Promise<PixTransaction[]> {
    const rows = await this.prisma.financeiroPixTransaction.findMany({
      where: {
        status: 'AWAITING_PAYMENT' as any,
        expiresAt: { lt: new Date() },
      },
    })
    return rows.map((r) => this.hydrate(r)).filter(Boolean) as PixTransaction[]
  }

  async findByPaymentId(paymentId: string): Promise<PixTransaction | null> {
    const row = await this.prisma.financeiroPixTransaction.findUnique({
      where: { paymentId },
    })
    if (!row) return null
    return this.hydrate(row)
  }

  private hydrate(row: any): PixTransaction | null {
    try {
      const pixKeyResult = PixKey.create(
        (row.pixKeyType as PixKeyType) ?? PixKeyType.RANDOM,
        row.pixKeyValue ?? ''
      )
      if (pixKeyResult.isFail) return null

      const amount = Money.create(row.amount ?? 0).isOk
        ? Money.create(row.amount ?? 0).value
        : Money.zero()

      return PixTransaction.restore({
        id: row.id,
        status: (row.status as PixStatus) ?? PixStatus.AWAITING_PAYMENT,
        pixKey: pixKeyResult.value,
        amount,
        description: row.description ?? '',
        endToEndId: row.endToEndId ?? null,
        qrCode: row.qrCode ?? '',
        expiresAt: row.expiresAt ?? new Date(),
        confirmedAt: row.confirmedAt ?? null,
        createdAt: row.createdAt ?? new Date(),
      })
    } catch {
      return null
    }
  }
}
