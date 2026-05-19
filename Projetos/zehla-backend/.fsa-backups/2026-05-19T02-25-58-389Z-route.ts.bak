import { NextResponse } from 'next/server';
import { rooms } from '@/lib/store';

export async function GET() {
  const summary = {
    total: rooms.length,
    available: rooms.filter(r => r.status === 'available').length,
    occupied: rooms.filter(r => r.status === 'occupied').length,
    dirty: rooms.filter(r => r.status === 'dirty').length,
    maintenance: rooms.filter(r => r.status === 'maintenance').length,
    reserved: rooms.filter(r => r.status === 'reserved').length,
    byFloor: Array.from({ length: 5 }, (_, i) => ({
      floor: i + 1,
      rooms: rooms.filter(r => r.floor === i + 1),
    })),
  };
  return NextResponse.json({ rooms, summary });
}
