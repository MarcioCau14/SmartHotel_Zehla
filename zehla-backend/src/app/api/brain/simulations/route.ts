import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { authOptions } from '@/lib/auth'
import { getServerSession } from 'next-auth'

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { searchParams } = new URL(req.url)
    const propertyId = searchParams.get('propertyId')

    if (!propertyId) return NextResponse.json({ error: 'Missing propertyId' }, { status: 400 })

    const simulations = await prisma.brainSimulationScenario.findMany({
      where: { tenantId: propertyId },
      include: {
        roundsRel: {
          orderBy: { createdAt: 'desc' },
          take: 10
        },
        agents: true
      },
      orderBy: { createdAt: 'desc' },
      take: 5
    })

    return NextResponse.json(simulations)
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
