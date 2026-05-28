import { NextResponse } from 'next/server';
import { ZehlaTestAgent } from '@/lib/testing/test-agent';

const testAgent = new ZehlaTestAgent();

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));

    if (!body.runId) {
      return NextResponse.json(
        { success: false, error: 'runId é obrigatorio' },
        { status: 400 }
      );
    }

    const execution = await testAgent.execute(body.type || 'unit');

    if (execution.results.length > 0) {
      const healing = await testAgent.heal(execution);
      return NextResponse.json({
        success: true,
        data: {
          originalRunId: body.runId,
          healing,
          reexecution: execution,
        },
      });
    }

    return NextResponse.json({
      success: true,
      data: { message: 'Nenhum teste para heal', execution },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
