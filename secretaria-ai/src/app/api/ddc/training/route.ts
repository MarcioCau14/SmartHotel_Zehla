import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { resolveTenantId } from '@/lib/ddc/auth-utils';

function mapTraining(t: any) {
  return {
    id: t.id,
    title: t.name,
    content: t.content,
    category: t.type,
    version: 1,
    isActive: t.isActive,
    testResult: t.successRate > 0 ? { status: t.successRate >= 85 ? 'passed' as const : 'failed' as const, score: t.successRate } : undefined,
    propertyId: t.tenantId,
    createdAt: t.createdAt,
    updatedAt: t.updatedAt,
  };
}

export async function GET(request: NextRequest) {
  try {
    const tenantId = await resolveTenantId();
    const trainings = await db.trainingPrompt.findMany({
      where: { tenantId },
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json({ success: true, data: trainings.map(mapTraining) });
  } catch (error) {
    console.error('[DDC training] Prisma error:', error);
    return NextResponse.json({ success: true, data: [] });
  }
}

export async function POST(request: NextRequest) {
  try {
    const tenantId = await resolveTenantId();
    const body = await request.json();
    if (!body.title || !body.content || !body.category) {
      return NextResponse.json({ success: false, error: { code: '400', message: 'Missing required fields: title, content, category' } }, { status: 400 });
    }
    const training = await db.trainingPrompt.create({
      data: {
        tenantId,
        name: body.title,
        type: body.category,
        content: body.content,
        isActive: body.isActive !== undefined ? body.isActive : true,
        variables: JSON.stringify(body.variables || []),
      }
    });
    return NextResponse.json({ success: true, data: mapTraining(training) }, { status: 201 });
  } catch (error) {
    console.error('[DDC training POST] Error:', error);
    return NextResponse.json({ success: false, error: { code: '500', message: 'Failed to create training' } }, { status: 500 });
  }
}