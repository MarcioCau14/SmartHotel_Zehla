import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    success: true,
    repos: [
      { name: 'SmartHotel_Zehla', url: 'https://github.com/MarcioCau14/SmartHotel_Zehla', commits: 0 },
    ],
  });
}
