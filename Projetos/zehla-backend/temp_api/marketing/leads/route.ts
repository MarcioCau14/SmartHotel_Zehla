import { NextResponse } from 'next/server';

import { b2bLeads } from '@/lib/store';


export async function GET() : void {
  try {
  return NextResponse.json(b2bLeads);
}
