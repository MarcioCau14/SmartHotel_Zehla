import { Result } from '../../../domain/shared/Result'
import { Money } from '../../../domain/financeiro/value-objects/Money'
import { PixKey } from '../../../domain/financeiro/value-objects/PixKey'
import { IPixGatewayPort, PixQrCodeData, PixTransactionStatus } from '../../../application/financeiro/ports/IPixGatewayPort'

export class FakePixGateway implements IPixGatewayPort {
  async generateQrCode(
    amount: Money,
    _pixKey: PixKey,
    expirationMinutes: number
  ): Promise<Result<PixQrCodeData, string>> {
    const expiresAt = new Date()
    expiresAt.setMinutes(expiresAt.getMinutes() + expirationMinutes)

    return Result.ok({
      qrCode: `fake-qr-code-${amount.toNumber()}-${Date.now()}`,
      qrCodeBase64: Buffer.from(`fake-pix-${amount.toNumber()}`).toString('base64'),
      copyPasteKey: `00020126360014BR.GOV.BCB.PIX0114${_pixKey.value}520400005303986540${Math.round(amount.toNumber())}5802BR5913Fake PIX${expiresAt.getTime()}`,
      expiration: expiresAt,
      gatewayTransactionId: `gtx-${crypto.randomUUID()}`,
    })
  }

  async checkTransactionStatus(_endToEndId: string): Promise<Result<PixTransactionStatus, string>> {
    return Result.ok({
      status: 'CONFIRMED',
      endToEndId: _endToEndId,
      settled: true,
    })
  }
}
