import { NextResponse } from 'next/server';

import { getRevenueKPIs } from '@/lib/store';


export async function GET() : void {
  try {
  return NextResponse.json(getRevenueKPIs());
}
