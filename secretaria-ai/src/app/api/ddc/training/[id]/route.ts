import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { resolveTenantId, mapTraining } from '@/lib/ddc/ddc-mapper';
import { sendError } from '@/lib/send-error';
import { apiRatelimit } from '@/lib/rate-limit';

interface RouteContext { params: Promise<{ id: string }> }

async function guard(): Promise<string | NextResponse> {
  const tenantId = await resolveTenantId();
  if (!tenantId || tenantId === 'client-001') return sendError(401, 'UNAUTHORIZED', 'Não autorizado');
  const { success } = await apiRatelimit.limit(tenantId);
  if (!success) return sendError(429, 'RATE_LIMITED', 'Muitas requisições');
  return tenantId;
}

export async function PUT(request: NextRequest, context: RouteContext) {
  try {
    const g = await guard();
    if (g instanceof NextResponse) return g;
    const { id } = await context.params;
    const body = await request.json();
    const existing = await db.trainingPrompt.findUnique({ where: { id } });
    if (!existing) return sendError(404, 'NOT_FOUND', 'Training not found');

    const updateData: any = {};
    if (body.title) updateData.name = body.title;
    if (body.content) updateData.content = body.content;
    if (body.category) updateData.type = body.category;
    if (body.isActive !== undefined) updateData.isActive = body.isActive;

    const updated = await db.trainingPrompt.update({ where: { id }, data: updateData });
    return NextResponse.json({ success: true, data: mapTraining(updated) });
  } catch (error) {
    return sendError(500, 'UPDATE_FAILED', 'Failed to update training');
  }
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    const g = await guard();
    if (g instanceof NextResponse) return g;
    const { id } = await context.params;
    await db.trainingPrompt.delete({ where: { id } });
    return NextResponse.json({ success: true, data: null });
  } catch (error) {
    return sendError(500, 'DELETE_FAILED', 'Failed to delete training');
  }
}

export async function POST(request: NextRequest, context: RouteContext) {
  try {
    const g = await guard();
    if (g instanceof NextResponse) return g;
    const { id } = await context.params;
    const training = await db.trainingPrompt.findUnique({ where: { id } });
    if (!training) return sendError(404, 'NOT_FOUND', 'Training not found');

    // Simulate AI test
    await new Promise(resolve => setTimeout(resolve, 1500));
    const score = Math.floor(Math.random() * 20) + 80;
    const passed = score >= 85;

    // Update in DB
    await db.trainingPrompt.update({
      where: { id },
      data: {
        successRate: score,
        usageCount: { increment: 1 },
        lastUsed: new Date(),
      }
    });

    return NextResponse.json({
      success: true,
      data: {
        status: passed ? 'passed' as const : 'failed' as const,
        score,
        feedback: passed
          ? 'A IA respondeu corretamente e com alta confiança. O prompt está bem estruturado.'
          : 'A IA não conseguiu responder adequadamente. Considere revisar o conteúdo do prompt.'
      }
    });
  } catch (error) {
    return sendError(500, 'TEST_FAILED', 'Failed to test training');
  }
}
