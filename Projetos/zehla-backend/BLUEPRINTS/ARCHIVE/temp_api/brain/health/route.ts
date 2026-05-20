import { NextResponse } from 'next/server';

import { getBrainHealth } from '@/lib/store';


export async function GET() : void {
  try {
  return NextResponse.json(getBrainHealth());
}
