import { NextResponse } from 'next/server';
import { ZehlaTestAgent } from '@/lib/testing/test-agent';

const testAgent = new ZehlaTestAgent();

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const type = body.type || 'unit';

    const execution = await testAgent.execute(type as any);

    if (execution.results.length > 0) {
      const healing = await testAgent.heal(execution);
      const reportPath = await testAgent.report(execution, healing);

      return NextResponse.json({
        success: true,
        data: { execution, healing, reportPath },
        meta: {
          runId: execution.runId,
          timestamp: new Date().toISOString(),
        },
      });
    }

    return NextResponse.json({
      success: true,
      data: execution,
      meta: { message: 'Nenhum teste executado' },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
