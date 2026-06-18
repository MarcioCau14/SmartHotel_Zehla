import { prisma } from '../../prisma';

export interface ProcessPaymentResult {
  success: boolean;
  message: string;
  reservationId?: string;
  amount?: number;
}

export class ProcessPaymentProofUseCase {
  static async execute(
    phone: string,
    propertyId: string,
    receiptData: { amount: number; transactionId: string; [key: string]: any },
    contextReservationId?: string
  ): Promise<ProcessPaymentResult> {
    return { success: false, message: 'Payment processing not available in standalone mode.' };
  }
}
