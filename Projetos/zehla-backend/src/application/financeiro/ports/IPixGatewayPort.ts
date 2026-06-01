import { Result } from '../../../domain/shared/Result'
import { Money } from '../../../domain/financeiro/value-objects/Money'
import { PixKey } from '../../../domain/financeiro/value-objects/PixKey'

export interface PixQrCodeData {
  qrCode: string
  qrCodeBase64: string
  copyPasteKey: string
  expiration: Date
  gatewayTransactionId: string
}

export interface PixTransactionStatus {
  status: string
  endToEndId?: string
  settled: boolean
}

export interface IPixGatewayPort {
  generateQrCode(amount: Money, pixKey: PixKey, expirationMinutes: number): Promise<Result<PixQrCodeData, string>>
  checkTransactionStatus(endToEndId: string): Promise<Result<PixTransactionStatus, string>>
}
