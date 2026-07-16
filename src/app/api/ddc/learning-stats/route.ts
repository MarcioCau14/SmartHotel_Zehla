import { NextResponse } from 'next/server';
import { db, isDatabaseAvailable } from '@/lib/db';
import { resolveTenantId } from '@/lib/ddc/auth-utils';
import { apiRatelimit } from '@/lib/rate-limit';
import { getLearningStats } from '@/lib/brain/conversation-learner';

export async function GET() {
  try {
    const dbAvailable = await isDatabaseAvailable();
    if (!dbAvailable) {
      return NextResponse.json({
        success: true,
        data: {
          totalPatterns: 12,
          verifiedPatterns: 8,
          activePatterns: 10,
          deprecatedPatterns: 2,
          overallConfidence: 87.3,
          totalLearned: 45,
          recentActivity: [
            { type: 'learned', question: 'Horário do café da manhã', answer: 'O café da manhã é servido das 7h às 10h.', confidence: 92, timestamp: new Date(Date.now() - 1800000).toISOString() },
            { type: 'verified', question: 'Política de cancelamento', answer: 'Cancelamento gratuito até 48h antes do check-in.', confidence: 95, timestamp: new Date(Date.now() - 7200000).toISOString() },
            { type: 'learned', question: 'Tem estacionamento?', answer: 'Sim, estacionamento gratuito para hóspedes.', confidence: 88, timestamp: new Date(Date.now() - 14400000).toISOString() },
          ],
          patterns: [
            { id: 'demo-p-1', question: 'Horário do café da manhã', answer: 'O café da manhã é servido das 7h às 10h na sala de estar.', category: 'auto_learned', priority: 1, effectiveness: 95, lastUsed: new Date(Date.now() - 1800000).toISOString(), verified: true, deprecated: false, timesUsed: 23, timesSuccessful: 22, confidence: 95, createdAt: new Date(Date.now() - 86400000).toISOString() },
            { id: 'demo-p-2', question: 'Política de cancelamento', answer: 'Cancelamento gratuito até 48h antes do check-in. Após esse prazo, cobramos 1 diária.', category: 'auto_learned', priority: 1, effectiveness: 90, lastUsed: new Date(Date.now() - 7200000).toISOString(), verified: true, deprecated: false, timesUsed: 15, timesSuccessful: 14, confidence: 92, createdAt: new Date(Date.now() - 172800000).toISOString() },
            { id: 'demo-p-3', question: 'Tem Wi-Fi?', answer: 'Sim, Wi-Fi de 300 Mbps em todas as áreas.', category: 'auto_learned', priority: 2, effectiveness: 85, lastUsed: new Date(Date.now() - 14400000).toISOString(), verified: false, deprecated: false, timesUsed: 10, timesSuccessful: 9, confidence: 88, createdAt: new Date(Date.now() - 259200000).toISOString() },
          ],
        },
      });
    }

    const tenantId = await resolveTenantId();
    if (!tenantId) {
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