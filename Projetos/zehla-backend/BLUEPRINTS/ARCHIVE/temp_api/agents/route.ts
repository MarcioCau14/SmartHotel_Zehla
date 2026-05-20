import { NextResponse } from 'next/server';

import { aiAgents } from '@/lib/store';


export async function GET() : void {
  try {
  return NextResponse.json(aiAgents);
}
