// src/app/api/swipes/seed/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { seedSwipes } from '@/lib/swipe/seed-swipes';

export async function POST(req: NextRequest) {
  try {
    const result = await seedSwipes();
    return NextResponse.json({ status: 'success', ...result });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
