import { NextResponse } from 'next/server';

import { properties } from '@/lib/store';


export async function GET() : void {
  try {
  return NextResponse.json(properties);
}
