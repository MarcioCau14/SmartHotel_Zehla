import { NextRequest, NextResponse } from 'next/server'
import { ProcessPaymentProofUseCase, ProcessPaymentProofInput } from '../../../application/reservation/use-cases/ProcessPaymentProofUseCase'

export class ProcessPaymentProofController {
  constructor(private useCase: ProcessPaymentProofUseCase) {}

  async handle(request: NextRequest): Promise<NextResponse> {
    try {
      const body = await request.json() as ProcessPaymentProofInput & { phone?: string }

      const required = ['propertyId', 'amount', 'transactionId'] as const
      for (const field of required) {
        if (!body[field]) {
          return NextResponse.json({ error: `Campo obrigatório: ${field}` }, { status: 422 })
        }
      }

      const phone = body.phone ?? request.headers.get('x-guest-phone') ?? ''
      if (!phone) {
        return NextResponse.json({ error: 'Campo obrigatório: phone' }, { status: 422 })
      }

      const result = await this.useCase.execute({
        phone,
        propertyId: body.propertyId,
        amount: body.amount,
        transactionId: body.transactionId,
        contextReservationId: body.contextReservationId,
      })

      if (result.isFail) {
        const status = result.error.includes('não encontrada') ? 404 : 422
        return NextResponse.json({ error: result.error }, { status })
      }

      return NextResponse.json({ success: true, data: result.value }, { status: 200 })
    } catch (error: any) {
      console.error('[ProcessPaymentProofController]', error)
      return NextResponse.json({ error: 'Erro interno', details: error.message }, { status: 500 })
    }
  }
}
