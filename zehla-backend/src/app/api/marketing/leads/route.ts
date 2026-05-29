import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const db = prisma as PrismaClient
    const total = await db.lead.count()
    const qualified = await db.lead.count({ where: { status: 'QUALIFIED' } })
    const converted = await db.lead.count({ where: { status: 'CONVERTED' } })
    const withEmail = await db.lead.count({ where: { email: { not: null } } })
    const avgScore = await db.lead.aggregate({ _avg: { score: true } })

    return NextResponse.json({
      success: true,
      metrics: {
        total,
        qualified,
        converted,
        withEmail,
        avgScore: Math.round(avgScore._avg.score ?? 0),
      },
    })
  } catch (error: any) {
    console.error('[Marketing Leads API] Error:', error)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}
