// src/app/api/swipes/track/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { registrarUsoSwipe, registrarConversaoSwipe } from '@/lib/swipe/tracker';

export async function POST(req: NextRequest) {
  try {
    const { action, swipeId, leadId, agentId } = await req.json();
    let result;
    if (action === 'use') result = await registrarUsoSwipe(swipeId, leadId, agentId);
    else if (action === 'convert') result = await registrarConversaoSwipe(leadId);
    else return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    return NextResponse.json({ success: true, result });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
