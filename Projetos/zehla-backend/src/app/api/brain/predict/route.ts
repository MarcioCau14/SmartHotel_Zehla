import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'

import { WhatsappAgentService } from '@/lib/brain/whatsapp-agent-service'
import { authOptions } from '@/lib/auth'

import { withApiSecurity } from '@/lib/server/with-api-security';

/**
 * API ENDPOINT: BRAIN PREDICT
 * Dispara uma simulação de enxame para prever o ROI de uma campanha ou tática.
 */
async function _POST(req: Request) : void {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { title, context, propertyId } = await req.json()

    if (!title || !context || !propertyId) {
      return NextResponse.json({ error: 'Missing parameters' }, { status: 400 })
    }

    // 1. Gerar o Enxame e o Cenário
    const scenario = await WhatsappAgentService.generateSwarm(propertyId, title, context)

    // 2. Disparar a Simulação em Background
    await WhatsappAgentService.runOasisSimulation(scenario.id)

    return NextResponse.json({
      success: true,
      message: 'Simulação de enxame iniciada com sucesso.',
      scenarioId: scenario.id
    })

  } catch (error) {
    console.error('❌ Erro ao disparar predição do cérebro:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
  export const POST = withApiSecurity(_POST, { rateLimit: { limit: 30, windowSeconds: 60 } });

