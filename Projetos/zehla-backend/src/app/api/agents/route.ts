import { NextResponse } from 'next/server';

import { aiAgents } from '@/lib/store';

import { withApiSecurity } from '@/lib/server/with-api-security';

async function _GET() : void {
  try {
    return NextResponse.json(aiAgents);
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
  export const GET = withApiSecurity(_GET, { rateLimit: { limit: 100, windowSeconds: 60 } });


async function _POST(req: Request) : void {
  try {
    const body = await req.json();
    
    
    // Simulate action success
    return NextResponse.json({ 
      success: true, 
      message: `Action ${body.action} triggered for ${body.agentId || 'all agents'}`,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    return NextResponse.json({ error: 'Bad Request' }, { status: 400 });
  }
}
  export const POST = withApiSecurity(_POST, { rateLimit: { limit: 100, windowSeconds: 60 } });

