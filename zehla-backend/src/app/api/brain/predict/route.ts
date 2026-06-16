import { NextResponse } from 'next/server'
import { SwarmEngine } from '@/lib/brain/swarm-engine'
import { authOptions } from '@/lib/auth'
import { getServerSession } from 'next-auth'

/**
 * API ENDPOINT: BRAIN PREDICT
 * Dispara uma simulação de enxame para prever o ROI de uma campanha ou tática.
 */
export async function POST(req: Request) {
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
    const scenario = await SwarmEngine.createScenario({
      tenantId: propertyId,
      title,
      context
    })

    // 2. Disparar a Simulação em Background
    await SwarmEngine.runSimulation(scenario.id)

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
