import { NextResponse } from 'next/server';
import { ZehlaTestAgent } from '@/lib/testing/test-agent';

const testAgent = new ZehlaTestAgent();

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const scope = body.scope || 'codebase';

    const discovery = await testAgent.discover(scope);

    return NextResponse.json({
      success: true,
      data: discovery,
      meta: {
        timestamp: new Date().toISOString(),
        scope,
        project: 'zehla-smarthotel',
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
