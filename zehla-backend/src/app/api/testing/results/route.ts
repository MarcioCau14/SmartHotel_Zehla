import { NextResponse } from 'next/server';

interface StoredRun {
  runId: string;
  type: string;
  totalTests: number;
  passed: number;
  failed: number;
  passRate: number;
  duration: number;
  timestamp: string;
}

const recentRuns: StoredRun[] = [];

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));

    if (body.runId) {
      const run = recentRuns.find(r => r.runId === body.runId);
      return NextResponse.json({
        success: true,
        data: run || null,
        meta: { found: !!run },
      });
    }

    return NextResponse.json({
      success: true,
      data: recentRuns.slice(-20),
      meta: {
        total: recentRuns.length,
        returned: Math.min(recentRuns.length, 20),
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

export function addRun(run: StoredRun) {
  recentRuns.push(run);
  if (recentRuns.length > 100) recentRuns.shift();
}
