import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
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

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const room = await prisma.room.create({ data: body })
    return NextResponse.json({ success: true, data: room }, { status: 201 })
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Erro ao criar quarto' }, { status: 500 })
  }
}
