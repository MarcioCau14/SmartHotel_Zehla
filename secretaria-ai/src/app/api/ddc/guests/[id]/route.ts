import { NextRequest, NextResponse } from 'next/server';
import type { Guest } from '@/types/ddc';
import { mockGuests } from '@/lib/ddc/mock-data';

interface RouteContext {
  params: Promise<{
    id: string;
  }>;
}

export async function GET(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const { id: guestId } = await context.params;
    const guest = mockGuests.find(g => g.id === guestId);

    if (!guest) {
      return NextResponse.json({
        success: false,
        error: {
          code: '404',
          message: 'Guest not found'
        }
      }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: guest
    });
  } catch (error) {
    console.error('Error fetching guest:', error);
    return NextResponse.json({
      success: false,
      error: {
        code: '500',
        message: 'Failed to fetch guest',
        details: error instanceof Error ? error.message : 'Unknown error'
      }
    }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const { id: guestId } = await context.params;
    const body = await request.json();

    const guestIndex = mockGuests.findIndex(g => g.id === guestId);

    if (guestIndex === -1) {
      return NextResponse.json({
        success: false,
        error: {
          code: '404',
          message: 'Guest not found'
        }
      }, { status: 404 });
    }

    // Update guest
    const updatedGuest: Guest = {
      ...mockGuests[guestIndex],
      ...body,
      updatedAt: new Date()
    };

    mockGuests[guestIndex] = updatedGuest;

    // Dispatch pipeline update event
    // Note: In a real implementation, this would trigger a WebSocket event

    return NextResponse.json({
      success: true,
      data: updatedGuest
    });
  } catch (error) {
    console.error('Error updating guest:', error);
    return NextResponse.json({
      success: false,
      error: {
        code: '500',
        message: 'Failed to update guest',
        details: error instanceof Error ? error.message : 'Unknown error'
      }
    }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const { id: guestId } = await context.params;
    const guestIndex = mockGuests.findIndex(g => g.id === guestId);

    if (guestIndex === -1) {
      return NextResponse.json({
        success: false,
        error: {
          code: '404',
          message: 'Guest not found'
        }
      }, { status: 404 });
    }

    mockGuests.splice(guestIndex, 1);

    return NextResponse.json({
      success: true,
      data: null
    });
  } catch (error) {
    console.error('Error deleting guest:', error);
    return NextResponse.json({
      success: false,
      error: {
        code: '500',
        message: 'Failed to delete guest',
        details: error instanceof Error ? error.message : 'Unknown error'
      }
    }, { status: 500 });
  }
}