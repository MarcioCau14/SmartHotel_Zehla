import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { resolveTenantId } from '@/lib/ddc/auth-utils';
import { z } from 'zod';
import { withSecurity } from '@/lib/security/api-shield';

const feedbackSchema = z.object({
  conversationId: z.string(),
  messageId: z.string(),
  rating: z.number().min(1).max(5), // 5 = Positive/Thumbs Up, 1 = Negative/Thumbs Down
  notes: z.string().optional(),
  source: z.string().default('ddc'),
  metadata: z.string().optional(),
});

async function postHandler(request: NextRequest, _ctx: any) {
  try {
    const tenantId = await resolveTenantId();
    if (!tenantId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const data = feedbackSchema.parse(body);

    const feedback = await db.feedback.create({
      data: {
        tenantId,
        conversationId: data.conversationId,
        messageId: data.messageId,
        rating: data.rating,
        notes: data.notes || '',
        source: data.source,
        metadata: data.metadata || '{}',
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Feedback recorded successfully',
      feedback,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation Error', details: error.issues },
        { status: 400 }
      );
    }
    console.error('[feedback POST] Error recording feedback:', error);
    return NextResponse.json(
      { error: 'Internal Server Error', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export const POST = withSecurity(postHandler, { routeLabel: 'feedback' });