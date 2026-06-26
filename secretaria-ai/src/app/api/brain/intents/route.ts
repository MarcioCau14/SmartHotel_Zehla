import { NextResponse } from 'next/server';
import { intentStats } from '@/lib/brain-health';

export async function GET() {
  return NextResponse.json(intentStats);
}
