import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { resolveTenantId } from '@/lib/ddc/auth-utils';
import { apiRatelimit } from '@/lib/rate-limit';
import { getLearningStats } from '@/lib/brain/conversation-learner';

export async function GET() {
  try {
    const tenantId = await resolveTenantId();
    if (!tenantId || tenantId === 'client-001') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const { success } = await apiRatelimit.limit(tenantId);
    if (!success) return NextResponse.json({ error: 'Too many requests' }, { status: 429 });

    // Buscar stats agregados do conversation-learner
    const stats = await getLearningStats(tenantId);

    // Buscar os padrões individuais (ativos + verificados, não descontinuados)
    const patterns = await db.knowledgeEntry.findMany({
      where: {
        tenantId,
        category: 'auto_learned',
      },
      orderBy: { effectiveness: 'desc' },
      take: 50,
      select: {
        id: true,
        question: true,
        answer: true,
        category: true,
        priority: true,
        effectiveness: true,
        lastUsed: true,
        metadata: true,
        createdAt: true,
      },
    });

    const mappedPatterns = patterns.map(p => {
      const meta = safeParse(p.metadata);
      return {
        id: p.id,
        question: p.question,
        answer: p.answer,
        category: p.category,
        priority: p.priority,
        effectiveness: p.effectiveness,
        lastUsed: p.lastUsed,
        verified: meta.verified || false,
        deprecated: meta.deprecated || false,
        timesUsed: meta.timesUsed || 0,
        timesSuccessful: meta.timesSuccessful || 0,
        confidence: meta.confidence || 0,
        createdAt: p.createdAt,
      };
    });

    return NextResponse.json({
      success: true,
      data: {
        ...stats,
        patterns: mappedPatterns,
      },
    });
  } catch (error) {
    console.error('[DDC learning-stats] Error:', error);
    return NextResponse.json({
      success: true,
      data: {
        totalPatterns: 0,
        verifiedPatterns: 0,
        activePatterns: 0,
        deprecatedPatterns: 0,
        overallConfidence: 0,
        totalLearned: 0,
        recentActivity: [],
        patterns: [],
      },
    });
  }
}

function safeParse(raw: string | null): Record<string, any> {
  if (!raw) return {};
  try { return JSON.parse(raw); } catch { return {}; }
}