import { NextRequest, NextResponse } from 'next/server';
import type { Booking } from '@/types/ddc';
import { mockBookings } from '@/lib/ddc/mock-data';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get('status');
    const guestId = searchParams.get('guestId');

    // Filter bookings based on query params
    let filteredBookings = [...mockBookings];

    if (status) {
      filteredBookings = filteredBookings.filter(b => b.status === status);
    }

    if (guestId) {
      filteredBookings = filteredBookings.filter(b => b.guestId === guestId);
    }

    return NextResponse.json({
      success: true,
      data: {
        items: filteredBookings,
        total: filteredBookings.length,
        page: 1,
        limit: filteredBookings.length,
        totalPages: 1
      }
    });
  } catch (error) {
    console.error('Error fetching bookings:', error);
    return NextResponse.json({
      success: false,
      error: {
        code: '500',
        message: 'Failed to fetch bookings',
        details: error instanceof Error ? error.message : 'Unknown error'
      }
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate required fields
    if (!body.guestId || !body.checkIn || !body.checkOut || !body.total) {
      return NextResponse.json({
        success: false,
        error: {
          code: '400',
          message: 'Missing required fields: guestId, checkIn, checkOut, total'
        }
      }, { status: 400 });
    }

    // Create new booking
    const newBooking: Booking = {
      id: `booking-${Date.now()}`,
      guestId: body.guestId,
      roomId: body.roomId,
      checkIn: new Date(body.checkIn),
      checkOut: new Date(body.checkOut),
      total: body.total,
      status: body.status || 'pending',
      paymentStatus: body.paymentStatus || 'pending',
      propertyId: body.propertyId || 'prop-001',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    // In a real implementation, this would save to database
    mockBookings.unshift(newBooking);

    // Dispatch notification for new booking
    console.log('New booking created:', newBooking.id);

    return NextResponse.json({
      success: true,
      data: newBooking
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating booking:', error);
    return NextResponse.json({
      success: false,
      error: {
        code: '500',
        message: 'Failed to create booking',
        details: error instanceof Error ? error.message : 'Unknown error'
      }
    }, { status: 500 });
  }
}