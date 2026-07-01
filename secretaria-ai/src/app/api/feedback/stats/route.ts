import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { resolveTenantId } from '@/lib/ddc/auth-utils';

export async function GET() {
  try {
    const tenantId = await resolveTenantId();
    if (!tenantId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const feedbacks = await db.feedback.findMany({
      where: { tenantId },
      orderBy: { createdAt: 'desc' }
    });

    const totalFeedback = feedbacks.length;
    const thumbsUpCount = feedbacks.filter(f => f.rating >= 4).length;
    const thumbsDownCount = feedbacks.filter(f => f.rating <= 2).length;
    
    const satisfactionRate = totalFeedback > 0 
      ? Math.round((thumbsUpCount / totalFeedback) * 100) 
      : 100; // Default to 100% if no feedbacks yet

    // Get the 5 most recent feedbacks with text notes
    const recentFeedbacks = feedbacks
      .filter(f => f.notes && f.notes.trim() !== '')
      .slice(0, 5)
      .map(f => ({
        id: f.id,
        rating: f.rating,
        notes: f.notes,
        createdAt: f.createdAt,
        conversationId: f.conversationId
      }));

    return NextResponse.json({
      success: true,
      stats: {
        totalFeedback,
        thumbsUpCount,
        thumbsDownCount,
        satisfactionRate,
        recentFeedbacks
      }
    });
  } catch (error) {
    console.error('[feedback stats GET] Error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
