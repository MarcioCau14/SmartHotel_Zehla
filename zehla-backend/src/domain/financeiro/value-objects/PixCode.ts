import { Result } from '../../shared/Result';

export interface PixCodeProps {
  qrCode: string;           // String do QR Code (copia e cola)
  qrCodeBase64: string;     // Imagem base64 do QR Code
  expirationDate: Date;     // Data de expiração
  transactionId: string;    // ID da transação Mercado Pago
}

export class PixCode {
  private constructor(private readonly props: PixCodeProps) {
    Object.freeze(this.props);
  }

  static create(props: PixCodeProps): Result<PixCode, string> {
    if (!props.qrCode || props.qrCode.length < 10) {
      return Result.fail('QR_CODE_INVALIDO');
    }
    if (props.expirationDate <= new Date()) {
      return Result.fail('DATA_EXPIRACAO_INVALIDA');
    }
    return Result.ok(new PixCode(props));
  }

  get qrCode(): string { return this.props.qrCode; }
  get qrCodeBase64(): string { return this.props.qrCodeBase64; }
  get expirationDate(): Date { return this.props.expirationDate; }
  get transactionId(): string { return this.props.transactionId; }
  get isExpired(): boolean { return new Date() > this.props.expirationDate; }

  toJSON(): PixCodeProps {
    return { ...this.props };
  }
}
