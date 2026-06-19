import { NextRequest, NextResponse } from 'next/server';
import type { Notification } from '@/types/ddc';

// Mock notifications storage
const mockNotifications: Notification[] = [
  {
    id: 'notif-1',
    type: 'new_guest',
    title: 'Novo Hóspede',
    message: 'Maria Silva entrou em contato via WhatsApp',
    status: 'unread',
    priority: 'normal',
    userId: 'user-1',
    propertyId: 'prop-001',
    createdAt: new Date(Date.now() - 5 * 60 * 1000)
  },
  {
    id: 'notif-2',
    type: 'booking_created',
    title: 'Reserva Confirmada',
    message: 'Nova reserva de João Santos confirmada',
    status: 'unread',
    priority: 'high',
    userId: 'user-1',
    propertyId: 'prop-001',
    createdAt: new Date(Date.now() - 15 * 60 * 1000)
  },
  {
    id: 'notif-3',
    type: 'payment_received',
    title: 'Pagamento Recebido',
    message: 'Pagamento de R$ 1.250,00 confirmado',
    status: 'unread',
    priority: 'normal',
    userId: 'user-1',
    propertyId: 'prop-001',
    createdAt: new Date(Date.now() - 30 * 60 * 1000)
  },
  {
    id: 'notif-4',
    type: 'escalation_needed',
    title: '⚠️ Escalonamento Necessário',
    message: 'Conversa com Pedro Costa requer atenção humana',
    status: 'unread',
    priority: 'urgent',
    userId: 'user-1',
    propertyId: 'prop-001',
    createdAt: new Date(Date.now() - 45 * 60 * 1000)
  },
  {
    id: 'notif-5',
    type: 'booking_created',
    title: 'Reserva Confirmada',
    message: 'Nova reserva de Ana Paula confirmada',
    status: 'read',
    priority: 'high',
    userId: 'user-1',
    propertyId: 'prop-001',
    readAt: new Date(Date.now() - 60 * 60 * 1000),
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000)
  }
];

export async function GET(request: NextRequest) {
  try {
    return NextResponse.json({
      success: true,
      data: mockNotifications.sort((a, b) =>
        (b.createdAt ? new Date(b.createdAt).getTime() : 0) - (a.createdAt ? new Date(a.createdAt).getTime() : 0)
      )
    });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return NextResponse.json({
      success: false,
      error: {
        code: '500',
        message: 'Failed to fetch notifications',
        details: error instanceof Error ? error.message : 'Unknown error'
      }
    }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { notificationId, status } = body;

    if (!notificationId || !status) {
      return NextResponse.json({
        success: false,
        error: {
          code: '400',
          message: 'Missing required fields: notificationId, status'
        }
      }, { status: 400 });
    }

    const notification = mockNotifications.find(n => n.id === notificationId);

    if (!notification) {
      return NextResponse.json({
        success: false,
        error: {
          code: '404',
          message: 'Notification not found'
        }
      }, { status: 404 });
    }

    notification.status = status;
    if (status === 'read') {
      notification.readAt = new Date();
    }

    return NextResponse.json({
      success: true,
      data: notification
    });
  } catch (error) {
    console.error('Error updating notification:', error);
    return NextResponse.json({
      success: false,
      error: {
        code: '500',
        message: 'Failed to update notification',
        details: error instanceof Error ? error.message : 'Unknown error'
      }
    }, { status: 500 });
  }
}