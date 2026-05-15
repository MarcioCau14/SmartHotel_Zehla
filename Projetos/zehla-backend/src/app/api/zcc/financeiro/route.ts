import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const payments = await prisma.payment.findMany({
      include: {
        reservation: {
          include: { property: true }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 100
    });
    
    const aggregations = await prisma.payment.aggregate({
      _sum: { amount: true },
      where: { status: 'PAID' }
    });
    
    return NextResponse.json({
      payments,
      totalRevenue: aggregations._sum.amount || 0
    });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
