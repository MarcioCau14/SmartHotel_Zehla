import { PixTransaction } from '../../../domain/financeiro/entities/PixTransaction'
import { IPixTransactionRepository } from '../../../application/financeiro/ports/IPixTransactionRepository'

export class InMemoryPixTransactionRepository implements IPixTransactionRepository {
  private transactions = new Map<string, PixTransaction>()
  private paymentLinks = new Map<string, string>()

  async save(tx: PixTransaction): Promise<PixTransaction> {
    this.transactions.set(tx.id, tx)
    return tx
  }

  async findById(id: string): Promise<PixTransaction | null> {
    return this.transactions.get(id) ?? null
  }

  async findByEndToEndId(endToEndId: string): Promise<PixTransaction | null> {
    for (const tx of this.transactions.values()) {
      if (tx.endToEndId === endToEndId) return tx
    }
    return null
  }

  async findExpired(): Promise<PixTransaction[]> {
    const now = new Date()
    return Array.from(this.transactions.values()).filter((tx) => tx.isExpired())
  }

  async findByPaymentId(paymentId: string): Promise<PixTransaction | null> {
    for (const tx of this.transactions.values()) {
      if (this.paymentLinks.get(tx.id) === paymentId) return tx
    }
    return null
  }

  linkPayment(pixTransactionId: string, paymentId: string): void {
    this.paymentLinks.set(pixTransactionId, paymentId)
  }

  clear(): void {
    this.transactions.clear()
    this.paymentLinks.clear()
  }
}
