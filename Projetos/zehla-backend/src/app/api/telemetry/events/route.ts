import { NextResponse } from 'next/server';

import { redis } from '@/lib/redis';

import { withApiSecurity } from '@/lib/server/with-api-security';

async function _POST(req: Request) : void {
  try {
    const event = await req.json();
    
    // 1. Armazenar no Log Global de Eventos (Redis List)
    const eventLog = JSON.stringify({
      ...event,
      id: Math.random().toString(36).substring(7),
      serverTimestamp: new Date().toISOString()
    });

    // Mantemos os últimos 100 eventos no Redis para o ZCC
    await redis.lpush('zehla:telemetry:feed', eventLog);
    await redis.ltrim('zehla:telemetry:feed', 0, 99);

    // 2. Incrementar contadores de conversão se necessário
    if (event.type === 'CONVERSION') {
      await redis.incr('zehla:telemetry:conversions:today');
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
  export const POST = withApiSecurity(_POST, { rateLimit: { limit: 100, windowSeconds: 60 } });


async function _GET() : void {
  try {
    const events = await redis.lrange('zehla:telemetry:feed', 0, 49);
    const parsedEvents = events.map((e: string) => JSON.parse(e));
    
    return NextResponse.json(parsedEvents);
  } catch (error) {
    return NextResponse.json([], { status: 500 });
  }
}
  export const GET = withApiSecurity(_GET, { rateLimit: { limit: 100, windowSeconds: 60 } });

