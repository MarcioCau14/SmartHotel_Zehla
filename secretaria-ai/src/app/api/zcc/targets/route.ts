import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const targets = await db.target.findMany({
      orderBy: { priority: 'desc' },
    });

    const mapped = await Promise.all(
      targets.map(async (target) => {
        const leadCount = await db.lead.count({ where: { targetId: target.id } });
        return {
          id: target.id,
          name: target.name,
          domain: target.domain || '',
          city: target.city || '',
          state: target.state || '',
          priority: target.priority || 1,
          status: target.status as 'active' | 'pending' | 'inactive',
          leadCount,
        };
      })
    );

    return NextResponse.json(mapped);
  } catch (error) {
    console.error('[ZCC Targets]', error);
    return NextResponse.json([], { status: 500 });
  }
}
