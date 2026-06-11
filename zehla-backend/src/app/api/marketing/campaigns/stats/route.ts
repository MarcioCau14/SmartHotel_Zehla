import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { authenticateRequest } from '../../../../../infrastructure/http/auth/jwtAuth'

export interface CampaignStats {
  total: number
  active: number
  sentCount: number
  deliveredCount: number
  readCount: number
  repliedCount: number
  failedCount: number
  optedOutCount: number
  campaigns: Array<{
    id: string
    name: string
    status: string
    totalContacts: number
    sentCount: number
    deliveredCount: number
    readCount: number
    repliedCount: number
    failedCount: number
    optedOutCount: number
    startedAt: string | null
    completedAt: string | null
    createdAt: string
  }>
}

export async function GET(request: NextRequest) {
  const auth = await authenticateRequest(request)
  if (auth.isFail) {
    return NextResponse.json({ error: auth.error.message }, { status: 401 })
  }

  try {
    const campaigns = await prisma.blastCampaign.findMany({
      orderBy: { createdAt: 'desc' },
      take: 50,
    })

    const stats: CampaignStats = {
      total: campaigns.length,
      active: campaigns.filter(c => c.status === 'active' || c.status === 'scheduled').length,
      sentCount: campaigns.reduce((sum, c) => sum + c.sentCount, 0),
      deliveredCount: campaigns.reduce((sum, c) => sum + c.deliveredCount, 0),
      readCount: campaigns.reduce((sum, c) => sum + c.readCount, 0),
      repliedCount: campaigns.reduce((sum, c) => sum + c.repliedCount, 0),
      failedCount: campaigns.reduce((sum, c) => sum + c.failedCount, 0),
      optedOutCount: campaigns.reduce((sum, c) => sum + c.optedOutCount, 0),
      campaigns: campaigns.map(c => ({
        id: c.id,
        name: c.name,
        status: c.status,
        totalContacts: c.totalContacts,
        sentCount: c.sentCount,
        deliveredCount: c.deliveredCount,
        readCount: c.readCount,
        repliedCount: c.repliedCount,
        failedCount: c.failedCount,
        optedOutCount: c.optedOutCount,
        startedAt: c.startedAt?.toISOString() ?? null,
        completedAt: c.completedAt?.toISOString() ?? null,
        createdAt: c.createdAt.toISOString(),
      })),
    }

    return NextResponse.json(stats)
  } catch (error) {
    console.error('[CAMPAIGN STATS ERROR]', error)
    return NextResponse.json({ error: 'Erro ao carregar estatísticas' }, { status: 500 })
  }
}
