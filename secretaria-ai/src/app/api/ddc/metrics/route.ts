import { NextRequest, NextResponse } from 'next/server';
import { mockRevenueMetrics } from '@/lib/ddc/mock-data';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const period = searchParams.get('period') || 'today';

    return NextResponse.json({
      success: true,
      data: mockRevenueMetrics,
      meta: {
        period,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Error fetching metrics:', error);
    return NextResponse.json({
      success: false,
      error: {
        code: '500',
        message: 'Failed to fetch metrics',
        details: error instanceof Error ? error.message : 'Unknown error'
      }
    }, { status: 500 });
  }
}