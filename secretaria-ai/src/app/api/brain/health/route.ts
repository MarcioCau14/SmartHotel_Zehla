import { NextResponse } from 'next/server';
import { getBrainHealth } from '@/lib/brain-health';

export async function GET() {
  return NextResponse.json(getBrainHealth());
}
