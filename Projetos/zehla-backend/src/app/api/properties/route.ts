import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (id) {
      const property = await prisma.property.findUnique({
        where: { id },
        include: { rooms: true, services: true }
      })
      return NextResponse.json({ success: true, data: property })
    }

    const properties = await prisma.property.findMany({
      include: { rooms: true }
    })

    return NextResponse.json({ success: true, data: properties })
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Erro interno' }, { status: 500 })
  }
}
