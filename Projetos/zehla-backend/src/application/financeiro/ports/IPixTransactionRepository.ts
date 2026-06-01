import { PixTransaction } from '../../../domain/financeiro/entities/PixTransaction'

export interface IPixTransactionRepository {
  save(tx: PixTransaction): Promise<PixTransaction>
  findById(id: string): Promise<PixTransaction | null>
  findByEndToEndId(endToEndId: string): Promise<PixTransaction | null>
  findExpired(): Promise<PixTransaction[]>
  findByPaymentId(paymentId: string): Promise<PixTransaction | null>
}
