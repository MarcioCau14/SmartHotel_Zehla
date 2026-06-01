import { NextRequest, NextResponse } from 'next/server'
import { ReservationControllerFactory } from '@/infrastructure/http/reservation/ReservationControllerFactory'
import { ProcessPaymentProofController } from '@/infrastructure/http/reservation/ProcessPaymentProofController'

export async function POST(request: NextRequest) {
  const controller = new ProcessPaymentProofController(
    ReservationControllerFactory.makeProcessPaymentProofUseCase()
  )
  return controller.handle(request)
}
