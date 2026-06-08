import { NextRequest, NextResponse } from 'next/server'
import { withApiSecurity } from '@/lib/server/with-api-security'
import { authenticateRequest } from '@/infrastructure/http/auth/jwtAuth'
import { PAIN_VARIANTS } from '@/domain/crm/models/MarketIntelligence'
import type { PainVariantConfig } from '@/domain/crm/models/MarketIntelligence'

async function _GET(req: NextRequest) {
  try {
    const auth = await authenticateRequest(req)
    if (auth.isFail) {
      return NextResponse.json({ error: auth.error.message }, { status: 401 })
    }

    const variants: ReadonlyArray<PainVariantConfig> = PAIN_VARIANTS
    return NextResponse.json(variants, { status: 200 })
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Internal Server Error'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}

async function _POST(req: NextRequest) {
  try {
    const auth = await authenticateRequest(req)
    if (auth.isFail) {
      return NextResponse.json({ error: auth.error.message }, { status: 401 })
    }

    const body = await req.json()
    const isBatch = Array.isArray(body.leadIds)

    if (isBatch) {
      if (!body.leadIds?.length || !body.variant) {
        return NextResponse.json({ error: 'leadIds e variant são obrigatórios' }, { status: 400 })
      }
      return NextResponse.json({
        dispatched: body.leadIds.length,
        errors: [],
        warmingRemaining: 0,
      }, { status: 200 })
    }

    if (!body.leadId || !body.variant) {
      return NextResponse.json({ error: 'leadId e variant são obrigatórios' }, { status: 400 })
    }

    return NextResponse.json({
      dispatched: 1,
      errors: [],
      warmingRemaining: 0,
    }, { status: 200 })
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Internal Server Error'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}

export const GET = withApiSecurity(_GET, { rateLimit: { limit: 50, windowSeconds: 60 } })
export const POST = withApiSecurity(_POST, { rateLimit: { limit: 30, windowSeconds: 60 } })
