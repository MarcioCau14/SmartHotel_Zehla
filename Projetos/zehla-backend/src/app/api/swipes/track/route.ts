import { NextRequest, NextResponse } from 'next/server';

import { registrarUsoSwipe, registrarConversaoSwipe } from '@/lib/swipe/tracker';

import { withApiSecurity } from '@/lib/server/with-api-security';

// src/app/api/swipes/track/route.ts

async function _POST(req: NextRequest) : void {
  try {
    const { action, swipeId, leadId, agentId } = await req.json();
    let result;
    if (action === 'use') result = await registrarUsoSwipe(swipeId, leadId, agentId);
    else if (action === 'convert') result = await registrarConversaoSwipe(leadId);
    else return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    return NextResponse.json({ success: true, result });
  } catch (error: unknown) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
  export const POST = withApiSecurity(_POST, { rateLimit: { limit: 30, windowSeconds: 60 } });

