import { NextRequest, NextResponse } from 'next/server'

import { prisma } from '@/lib/prisma'

import { withApiSecurity } from '@/lib/server/with-api-security';

async function _POST(request: NextRequest) : void {
  try {
    const body = await request.json()
    const { id, status, data } = body

    

    // Atualizar pagamento
    const payment = await prisma.payment.updateMany({
      where: { externalId: data.id },
      data: {
        status: status === 'paid' ? 'PAID' : status === 'failed' ? 'FAILED' : 'PENDING',
        paidAt: status === 'paid' ? new Date() : null
      }
    })

    // Se pago, atualizar reserva
    if (status === 'paid') {
      const paymentRecord = await prisma.payment.findFirst({
        where: { externalId: data.id },
        include: { reservation: true }
      })

      if (paymentRecord) {
        await prisma.reservation.update({
          where: { id: paymentRecord.reservationId },
          data: { paidAmount: paymentRecord.amount }
        })
      }
    }

    return NextResponse.json({ success: true, received: true })
  } catch (error) {
    console.error('❌ Erro no webhook Pagarme:', error)
    return NextResponse.json({ success: false, error: 'Webhook error' }, { status: 500 })
  }
}
  export const POST = withApiSecurity(_POST, { rateLimit: { limit: 300, windowSeconds: 60 } });

