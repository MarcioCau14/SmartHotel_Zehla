import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { leadIds, templateId } = body;

    if (!Array.isArray(leadIds) || leadIds.length === 0) {
      return NextResponse.json(
        { error: 'O campo "leadIds" deve ser um array não vazio de IDs' },
        { status: 400 }
      );
    }

    if (leadIds.length > 500) {
      return NextResponse.json(
        { error: 'Limite de 500 leads por envio em lote' },
        { status: 400 }
      );
    }

    // Optionally validate template exists
    if (templateId) {
      const template = await db.swipeTemplate.findUnique({
        where: { id: templateId },
      });
      if (!template) {
        return NextResponse.json(
          { error: 'Template não encontrado' },
          { status: 404 }
        );
      }

      // Increment usage count
      await db.swipeTemplate.update({
        where: { id: templateId },
        data: { usageCount: { increment: leadIds.length } },
      });
    }

    // Mark all specified leads as 'contacted'
    const result = await db.lead.updateMany({
      where: {
        id: { in: leadIds },
        status: { not: 'contacted' },
      },
      data: { status: 'contacted' },
    });

    const sentCount = result.count;

    // Log the bulk send action
    await db.agentLog.create({
      data: {
        agentId: 'lessie',
        action: 'bulk_whatsapp_sent',
        inputTokens: 0,
        outputTokens: 0,
        latencyMs: Math.round(100 + Math.random() * 300),
        costUsd: parseFloat((sentCount * 0.005).toFixed(4)),
        status: 'success',
        metadata: JSON.stringify({
          templateId: templateId || null,
          requestedCount: leadIds.length,
          sentCount,
          skippedCount: leadIds.length - sentCount,
        }),
      },
    });

    return NextResponse.json({
      success: true,
      sentCount,
      requestedCount: leadIds.length,
      skippedCount: leadIds.length - sentCount,
      templateId: templateId || null,
    });
  } catch (error) {
    console.error('[BULK_WHATSAPP_POST]', error);
    return NextResponse.json(
      { error: 'Erro ao enviar mensagens em lote' },
      { status: 500 }
    );
  }
}