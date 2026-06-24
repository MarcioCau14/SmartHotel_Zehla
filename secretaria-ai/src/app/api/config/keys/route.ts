import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const keys = await db.apiConfig.findMany();
    return NextResponse.json({ success: true, keys });
  } catch (error) {
    return NextResponse.json({ success: false, keys: [] });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const key = await db.apiConfig.create({ data: body });
    return NextResponse.json({ success: true, key });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to create key' }, { status: 500 });
  }
}
