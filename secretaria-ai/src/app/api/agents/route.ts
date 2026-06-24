import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const agents = await db.agentConfig.findMany();
    return NextResponse.json({ success: true, agents });
  } catch (error) {
    return NextResponse.json({ success: false, agents: [] });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const agent = await db.agentConfig.create({ data: body });
    return NextResponse.json({ success: true, agent });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to create agent' }, { status: 500 });
  }
}
