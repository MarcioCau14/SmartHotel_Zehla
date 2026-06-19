import { NextRequest, NextResponse } from 'next/server';
import type { AIStatusData } from '@/types/ddc';

export async function GET(request: NextRequest) {
  try {
    // Mock AI status data
    const aiStatus: AIStatusData = {
      status: 'online',
      isProcessing: false,
      activeConversations: 12,
      totalToday: 45,
      averageResponseTime: 2.3,
      lastActivity: new Date()
    };

    return NextResponse.json({
      success: true,
      data: aiStatus,
      meta: {
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Error fetching AI status:', error);
    return NextResponse.json({
      success: false,
      error: {
        code: '500',
        message: 'Failed to fetch AI status',
        details: error instanceof Error ? error.message : 'Unknown error'
      }
    }, { status: 500 });
  }
}