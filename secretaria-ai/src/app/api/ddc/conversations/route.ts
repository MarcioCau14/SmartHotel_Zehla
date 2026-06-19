import { NextRequest, NextResponse } from 'next/server';
import type { ConversationLog, ConversationFilters } from '@/types/ddc';
import { mockConversationLogs } from '@/lib/ddc/mock-data';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get('status');
    const escalated = searchParams.get('escalated');
    const search = searchParams.get('search');

    // Filter conversations based on query params
    let filteredConversations = [...mockConversationLogs];

    if (status) {
      filteredConversations = filteredConversations.filter(c => c.status === status);
    }

    if (escalated === 'true') {
      filteredConversations = filteredConversations.filter(c => c.needsEscalation);
    }

    if (search) {
      const searchLower = search.toLowerCase();
      filteredConversations = filteredConversations.filter(c =>
        c.guestName.toLowerCase().includes(searchLower) ||
        (c.phoneNumber || '').includes(search)
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        items: filteredConversations,
        total: filteredConversations.length,
        page: 1,
        limit: filteredConversations.length,
        totalPages: 1
      }
    });
  } catch (error) {
    console.error('Error fetching conversations:', error);
    return NextResponse.json({
      success: false,
      error: {
        code: '500',
        message: 'Failed to fetch conversations',
        details: error instanceof Error ? error.message : 'Unknown error'
      }
    }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();
    const { conversationId } = body;

    if (!conversationId) {
      return NextResponse.json({
        success: false,
        error: {
          code: '400',
          message: 'Missing conversationId'
        }
      }, { status: 400 });
    }

    const index = mockConversationLogs.findIndex(c => c.id === conversationId);

    if (index === -1) {
      return NextResponse.json({
        success: false,
        error: {
          code: '404',
          message: 'Conversation not found'
        }
      }, { status: 404 });
    }

    mockConversationLogs.splice(index, 1);

    return NextResponse.json({
      success: true,
      data: null
    });
  } catch (error) {
    console.error('Error deleting conversation:', error);
    return NextResponse.json({
      success: false,
      error: {
        code: '500',
        message: 'Failed to delete conversation',
        details: error instanceof Error ? error.message : 'Unknown error'
      }
    }, { status: 500 });
  }
}