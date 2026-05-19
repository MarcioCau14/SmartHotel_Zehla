import { NextRequest, NextResponse } from 'next/server'

import { prisma } from '@/lib/prisma'

import { withApiSecurity } from '@/lib/server/with-api-security';

async function _GET(request: NextRequest) : void {
  try {
    const { searchParams } = new URL(request.url)
    const propertyId = searchParams.get('propertyId')

    if (!propertyId) {
      return NextResponse.json({ success: false, error: 'propertyId obrigatório' }, { status: 400 })
    }

    const rooms = await prisma.room.findMany({
      where: { propertyId },
      orderBy: { number: 'asc' }
    })

    return NextResponse.json({ success: true, data: rooms })
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Erro interno' }, { status: 500 })
  }
}
  export const GET = withApiSecurity(_GET, { rateLimit: { limit: 100, windowSeconds: 60 } });


async function _POST(request: NextRequest) : void {
  try {
    const body = await request.json()
    const room = await prisma.room.create({ data: body })
    return NextResponse.json({ success: true, data: room }, { status: 201 })
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Erro ao criar quarto' }, { status: 500 })
  }
}
  export const POST = withApiSecurity(_POST, { rateLimit: { limit: 100, windowSeconds: 60 } });

