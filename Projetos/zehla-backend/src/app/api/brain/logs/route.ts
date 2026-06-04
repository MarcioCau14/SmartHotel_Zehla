import { NextRequest, NextResponse } from 'next/server'
import { withApiSecurity } from '@/lib/server/with-api-security'
import { authenticateRequest } from '@/infrastructure/http/auth/jwtAuth'
import { GetBrainLogsUseCase } from '@/application/brain/use-cases/GetBrainLogsUseCase'
import { PrismaBrainLogRepository } from '@/infrastructure/persistence/brain/PrismaBrainLogRepository'

async function _GET(req: NextRequest) {
  try {
    const auth = await authenticateRequest(req)
    if (auth.isFail) {
      return NextResponse.json({ error: auth.error.message }, { status: 401 })
    }

    const propertyId = auth.value.pousadaId
    const { searchParams } = new URL(req.url)
    const limit = parseInt(searchParams.get('limit') ?? '50', 10)

    const repo = new PrismaBrainLogRepository()
    const useCase = new GetBrainLogsUseCase(repo)

    const result = await useCase.execute(propertyId, limit)
    if (result.isFail) {
      return NextResponse.json({ error: result.error.message }, { status: 400 })
    }

    return NextResponse.json(result.value, { status: 200 })
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Internal Server Error'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}

export const GET = withApiSecurity(_GET, { rateLimit: { limit: 120, windowSeconds: 60 } })
