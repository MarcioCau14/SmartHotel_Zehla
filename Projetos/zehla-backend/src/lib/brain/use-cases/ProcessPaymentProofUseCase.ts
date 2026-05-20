import { PrismaClient } from '@prisma/client';
import { db as prisma } from '@/lib/db';

export interface ProcessPaymentResult {
  success: boolean;
  message: string;
  reservationId?: string;
  amount?: number;
}

export class ProcessPaymentProofUseCase {
  /**
   * Executa a lógica de processamento de comprovante com Veda-Fraude 2.0 e Atomicidade ACID
   */
  static async execute(
    phone: string, 
    propertyId: string,
    receiptData: { amount: number; transactionId: string; [key: string]: any },
    contextReservationId?: string
  ): Promise<ProcessPaymentResult> {
    let targetReservationId = contextReservationId;

    // 1. Lógica de Fallback (Veda-Fraude 2.0)
    if (!targetReservationId || targetReservationId === 'UNKNOWN') {
      const lastPending = await prisma.reservation.findFirst({
        where: { 
          propertyId, 
          guestPhone: phone, 
          status: 'PENDING_PAYMENT' 
        },
        orderBy: { createdAt: 'desc' }
      });
      targetReservationId = lastPending?.id;
    }

    if (!targetReservationId) {
      console.warn(`🚨 [USE-CASE ALERT] Comprovante recebido para ${phone}, mas nenhuma reserva pendente foi localizada.`);
      return { success: false, message: 'Reserva não encontrada para este número.' };
    }

    try {
      // 2. Transação ACID: Garantia de Tudo ou Nada
      return await prisma.$transaction(async (tx) => {
        // Criar o pagamento
        const payment = await tx.payment.create({
          data: {
            amount: receiptData.amount,
            status: 'PAID',
            externalId: receiptData.transactionId,
            propertyId,
            reservationId: targetReservationId as string,
            metadata: JSON.stringify({
              ...receiptData,
              processedAt: new Date().toISOString(),
              autoMatched: true
            })
          }
        });

        // Atualizar a reserva
        await tx.reservation.update({
          where: { id: targetReservationId },
          data: { status: 'PAID' }
        });

        console.log(`✅ [FINANCIAL SUCCESS] Reserva ${targetReservationId} confirmada via Transação.`);
        
        return { 
          success: true, 
          message: 'Pagamento processado com sucesso.', 
          reservationId: targetReservationId,
          amount: receiptData.amount
        };
      });
    } catch (error) {
      console.error(`❌ [TRANSACTION ERROR] Falha crítica no processamento financeiro:`, error);
      return { success: false, message: 'Erro interno ao processar transação financeira.' };
    }
  }
}
