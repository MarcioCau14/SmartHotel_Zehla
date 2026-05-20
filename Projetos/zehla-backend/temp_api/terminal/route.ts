import { NextResponse } from 'next/server';

import { terminalMessages } from '@/lib/store';


export async function GET() : void {
  try {
  return NextResponse.json(terminalMessages);
}
