import { NextResponse } from 'next/server';

import { intentStats } from '@/lib/store';


export async function GET() : void {
  try {
  return NextResponse.json(intentStats);
}
