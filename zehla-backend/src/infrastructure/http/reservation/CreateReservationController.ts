import { NextRequest, NextResponse } from 'next/server'
import { CreateReservationUseCase, CreateReservationInput } from '../../../application/reservation/use-cases/CreateReservationUseCase'
import { Result } from '../../../domain/shared/Result'

export class CreateReservationController {
  constructor(private useCase: CreateReservationUseCase) {}

  async handle(request: NextRequest): Promise<NextResponse> {
    try {
      const body: CreateReservationInput = await request.json()

      const required = ['propertyId', 'roomId', 'guestName', 'guestPhone', 'checkIn', 'checkOut'] as const
      for (const field of required) {
        if (!body[field]) {
          return NextResponse.json({ error: `Campo obrigatório: ${field}` }, { status: 422 })
        }
      }

      if (!body.guestCount) body.guestCount = 1

      const result = await this.useCase.execute(body)

      if (result.isFail) {
        const status = result.error.includes('não disponível') ? 409 : 422
        return NextResponse.json({ error: result.error }, { status })
      }

      return NextResponse.json({ success: true, data: result.value }, { status: 201 })
    } catch (error: any) {
      console.error('[CreateReservationController]', error)
      return NextResponse.json({ error: 'Erro interno', details: error.message }, { status: 500 })
    }
  }
}
