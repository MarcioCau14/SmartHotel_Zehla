import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { resolveTenantId, mapTraining } from '@/lib/ddc/ddc-mapper';

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