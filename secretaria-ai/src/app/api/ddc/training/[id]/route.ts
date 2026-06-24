import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { mapTraining } from '@/lib/ddc/ddc-mapper';

interface RouteContext { params: Promise<{ id: string }> }

export async function PUT(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const body = await request.json();
    const existing = await db.trainingPrompt.findUnique({ where: { id } });
    if (!existing) return NextResponse.json({ success: false, error: { code: '404', message: 'Training not found' } }, { status: 404 });

    const updateData: any = {};
    if (body.title) updateData.name = body.title;
    if (body.content) updateData.content = body.content;
    if (body.category) updateData.type = body.category;
    if (body.isActive !== undefined) updateData.isActive = body.isActive;

    const updated = await db.trainingPrompt.update({ where: { id }, data: updateData });
    return NextResponse.json({ success: true, data: mapTraining(updated) });
  } catch (error) {
    return NextResponse.json({ success: false, error: { code: '500', message: 'Failed to update training' } }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    await db.trainingPrompt.delete({ where: { id } });
    return NextResponse.json({ success: true, data: null });
  } catch (error) {
    return NextResponse.json({ success: false, error: { code: '500', message: 'Failed to delete training' } }, { status: 500 });
  }
}

export async function POST(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const training = await db.trainingPrompt.findUnique({ where: { id } });
    if (!training) return NextResponse.json({ success: false, error: { code: '404', message: 'Training not found' } }, { status: 404 });

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
    return NextResponse.json({ success: false, error: { code: '500', message: 'Failed to test training' } }, { status: 500 });
  }
}