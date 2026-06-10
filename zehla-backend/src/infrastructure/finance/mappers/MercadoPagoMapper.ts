import { PaymentResult } from '../../../domain/financeiro/gateways/IPaymentGateway';
import { PaymentMethodType } from '../../../domain/financeiro/enums/PaymentMethodType';

export class MercadoPagoMapper {
  static toPaymentResult(response: any, method?: PaymentMethodType): PaymentResult {
    const paymentMethod = method || this.mapPaymentMethod(response.payment_method_id);
    return {
      id: response.external_reference || '',
      externalId: response.id?.toString() || '',
      status: this.mapStatus(response.status),
      paymentMethod,
      amount: response.transaction_amount || 0,
      paidAmount: response.transaction_amount_refunded
        ? (response.transaction_amount - response.transaction_amount_refunded)
        : (response.transaction_amount || 0),
      transactionDetails: response.transaction_details ? {
        bankTransferId: response.transaction_details.bank_transfer_id,
        financialInstitution: response.transaction_details.financial_institution,
        installmentAmount: response.transaction_details.installment_amount,
        totalPaidAmount: response.transaction_details.total_paid_amount
      } : undefined,
      pointOfInteraction: response.point_of_interaction?.transaction_data ? {
        qrCode: response.point_of_interaction.transaction_data.qr_code,
        qrCodeBase64: response.point_of_interaction.transaction_data.qr_code_base64,
        ticketUrl: response.point_of_interaction.transaction_data.ticket_url
      } : undefined,
      createdAt: new Date(response.date_created || Date.now())
    };
  }

  private static mapStatus(mpStatus: string): PaymentResult['status'] {
    const statusMap: Record<string, PaymentResult['status']> = {
      'pending': 'pending',
      'in_process': 'pending',
      'approved': 'approved',
      'authorized': 'approved',
      'in_mediation': 'pending',
      'rejected': 'rejected',
      'cancelled': 'cancelled',
      'refunded': 'cancelled',
      'charged_back': 'cancelled'
    };
    return statusMap[mpStatus] || 'pending';
  }

  private static mapPaymentMethod(methodId: string): PaymentMethodType {
    const methodMap: Record<string, PaymentMethodType> = {
      'pix': PaymentMethodType.PIX,
      'visa': PaymentMethodType.CREDIT_CARD,
      'master': PaymentMethodType.CREDIT_CARD,
      'amex': PaymentMethodType.CREDIT_CARD,
      'hipercard': PaymentMethodType.CREDIT_CARD,
      'elo': PaymentMethodType.CREDIT_CARD,
      'visa_electron': PaymentMethodType.DEBIT_CARD,
      'maestro': PaymentMethodType.DEBIT_CARD,
      'bolbradesco': PaymentMethodType.BOLETO,
      'bolsantander': PaymentMethodType.BOLETO,
      'account_money': PaymentMethodType.ACCOUNT_MONEY
    };
    return methodMap[methodId] || PaymentMethodType.CREDIT_CARD;
  }

  static toDomainPayment(response: any): any {
    return {
      externalId: response.id?.toString(),
      status: this.mapStatus(response.status),
      paymentMethod: this.mapPaymentMethod(response.payment_method_id),
      amount: Math.round(response.transaction_amount * 100), // em centavos
      paidAmount: Math.round((response.transaction_amount - (response.transaction_amount_refunded || 0)) * 100),
      metadata: JSON.stringify({
        mercado_pago_response: response,
        point_of_interaction: response.point_of_interaction,
        transaction_details: response.transaction_details
      })
    };
  }
}
