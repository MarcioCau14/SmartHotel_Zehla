import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { GoogleAdsMcpClient } from '@/infrastructure/marketing/google-ads/GoogleAdsMcpClient'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')

    const proposals = await prisma.adsChangeProposal.findMany({
      where: status ? { status } : {},
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ success: true, proposals }, { status: 200 })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, status } = body

    if (!id || !status) {
      return NextResponse.json({ error: 'ID e status são obrigatórios' }, { status: 400 })
    }

    if (status !== 'APPROVED' && status !== 'REJECTED') {
      return NextResponse.json({ error: 'Status inválido. Deve ser APPROVED ou REJECTED.' }, { status: 400 })
    }

    const proposal = await prisma.adsChangeProposal.findUnique({
      where: { id },
    })

    if (!proposal) {
      return NextResponse.json({ error: 'Proposta não encontrada' }, { status: 404 })
    }

    if (status === 'APPROVED') {
      const adsClient = new GoogleAdsMcpClient({ shadowMode: false })
      const applyResult = await adsClient.addNegativeKeyword(
        proposal.campaignId,
        proposal.keyword!,
        proposal.adGroupId,
        proposal.reason
      )

      if (applyResult.isFail) {
        return NextResponse.json({ error: applyResult.error.message }, { status: 422 })
      }
    }

    const updatedProposal = await prisma.adsChangeProposal.update({
      where: { id },
      data: { status },
    })

    return NextResponse.json({ success: true, proposal: updatedProposal }, { status: 200 })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
