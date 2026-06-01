import { NextResponse } from 'next/server';
import { ZehlaTestAgent } from '@/lib/testing/test-agent';

const testAgent = new ZehlaTestAgent();

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));

    const discovery = await testAgent.discover(body.scope || 'codebase');
    const plan = await testAgent.generatePlan(discovery);

    return NextResponse.json({
      success: true,
      data: plan,
      meta: {
        timestamp: new Date().toISOString(),
        totalTests: plan.testCases.length,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
