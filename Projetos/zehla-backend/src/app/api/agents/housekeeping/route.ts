import { NextRequest, NextResponse } from 'next/server'
import { RoomStatus } from '@prisma/client'

import { prisma } from '@/lib/prisma'

import { withApiSecurity } from '@/lib/server/with-api-security';

async function _POST(request: NextRequest) : void {
  try {
    const body = await request.json()
    const { action, propertyId, data } = body

    switch (action) {
      case 'UPDATE_STATUS':
        return await updateRoomStatus(data.roomId, data.status)
      case 'GET_STATUS':
        return await getRoomsStatus(propertyId)
      case 'SCHEDULE_CLEANING':
        return await scheduleCleaning(data.roomId, data.scheduledAt)
      case 'MARK_READY':
        return await markRoomReady(data.roomId)
      default:
        return NextResponse.json({ success: false, error: 'Ação inválida' }, { status: 400 })
    }
  } catch (error) {
    console.error('❌ Erro em Housekeeping:', error)
    return NextResponse.json({ success: false, error: 'Erro interno' }, { status: 500 })
  }
}
  export const POST = withApiSecurity(_POST, { rateLimit: { limit: 100, windowSeconds: 60 } });



async function updateRoomStatus(roomId: string, status: string) {
  try {
  const validStatuses = ['AVAILABLE', 'OCCUPIED', 'CLEANING', 'MAINTENANCE', 'BLOCKED']

  if (!validStatuses.includes(status)) {
    return NextResponse.json({ success: false, error: 'Status inválido' }, { status: 400 })
  }

  const room = await prisma.room.update({
    where: { id: roomId },
    data: { status: status as RoomStatus },
    include: { property: true }
  })

  return NextResponse.json({ success: true, data: room })
}

async function getRoomsStatus(propertyId: string) {
  try {
  const rooms = await prisma.room.findMany({
    where: { propertyId },
    orderBy: { number: 'asc' }
  })

  const summary = {
    total: rooms.length,
    available: rooms.filter(r => r.status === 'AVAILABLE').length,
    occupied: rooms.filter(r => r.status === 'OCCUPIED').length,
    cleaning: rooms.filter(r => r.status === 'CLEANING').length,
    maintenance: rooms.filter(r => r.status === 'MAINTENANCE').length,
    blocked: rooms.filter(r => r.status === 'BLOCKED').length,
    rooms
  }

  return NextResponse.json({ success: true, data: summary })
}

async function scheduleCleaning(roomId: string, scheduledAt: string) {
  try {
  const room = await prisma.room.update({
    where: { id: roomId },
    data: { status: 'CLEANING' as RoomStatus }
  })

  return NextResponse.json({ 
    success: true, 
    data: room,
    message: `Limpeza agendada para ${scheduledAt}`
  })
}

async function markRoomReady(roomId: string) {
  try {
  const room = await prisma.room.update({
    where: { id: roomId },
    data: { status: 'AVAILABLE' as RoomStatus }
  })

  return NextResponse.json({ 
    success: true, 
    data: room,
    message: `Quarto ${room.number} pronto para check-in`
  })
}


  export const GET = withApiSecurity(_GET, { rateLimit: { limit: 100, windowSeconds: 60 } });
async function _GET(request: NextRequest) : void {
  try {
  const { searchParams } = new URL(request.url)
  const propertyId = searchParams.get('propertyId')

  if (!propertyId) {
    return NextResponse.json({ success: false, error: 'propertyId obrigatório' }, { status: 400 })
  }

  return getRoomsStatus(propertyId)
}
