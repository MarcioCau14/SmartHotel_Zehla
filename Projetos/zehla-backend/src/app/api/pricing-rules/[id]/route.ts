import { NextRequest, NextResponse } from 'next/server'
import { getRepoPrisma } from '../../../../lib/prisma'

const db = getRepoPrisma()

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    await db.pricingRule.delete({ where: { id } })
    return NextResponse.json({ success: true, message: 'Regra de precificação removida' })
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Erro ao remover regra' }, { status: 500 })
  }
}
