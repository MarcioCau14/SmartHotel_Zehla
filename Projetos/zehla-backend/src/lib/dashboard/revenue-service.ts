import { prisma } from '@/lib/prisma';
import { startOfDay, endOfDay, subDays } from 'date-fns';

export async function getRealRevenueKPIs() {
  const now = new Date();
  const todayStart = startOfDay(now);
  const todayEnd = endOfDay(now);

  // 1. Receita Hoje (Baseado em pagamentos confirmados)
  const todayPayments = await prisma.payment.aggregate({
    _sum: { amount: true },
    where: {
      status: 'PAID',
      createdAt: { gte: todayStart, lte: todayEnd }
    }
  });

  // 2. Hóspedes Ativos (Check-ins realizados hoje ou estadias vigentes)
  const activeGuests = await prisma.reservation.count({
    where: {
      status: 'CONFIRMED',
      checkIn: { lte: now },
      checkOut: { gte: now }
    }
  });

  // 3. Check-ins Pendentes (Reservas para hoje que ainda não deram check-in)
  // Nota: Precisamos de um campo 'checkInStatus' no schema para ser mais preciso, 
  // mas por enquanto usamos o status 'CONFIRMED' vs checkIn date.
  const pendingCheckins = await prisma.reservation.count({
    where: {
      status: 'PENDING',
      checkIn: { gte: todayStart, lte: todayEnd }
    }
  });

  // 4. Taxa de Ocupação
  const totalRooms = await prisma.room.count();
  const occupiedRooms = await prisma.reservation.count({
    where: {
      status: 'CONFIRMED',
      checkIn: { lte: now },
      checkOut: { gte: now }
    }
  });
  const occupancyRate = totalRooms > 0 ? (occupiedRooms / totalRooms) * 100 : 0;

  // 5. ADR Médio (Average Daily Rate)
  const avgDailyRate = await prisma.reservation.aggregate({
    _avg: { totalAmount: true },
    where: {
      status: 'CONFIRMED',
      createdAt: { gte: todayStart, lte: todayEnd }
    }
  });

  return {
    active_guests: activeGuests,
    today_revenue: todayPayments._sum.amount || 0,
    pending_checkins: pendingCheckins,
    ai_tickets_resolved: 0, // A ser implementado via AgentLog
    ai_tickets_total: 0,
    occupancy_rate: +occupancyRate.toFixed(1),
    avg_daily_rate: Math.floor(avgDailyRate._avg.totalAmount || 0),
    revpar: Math.floor((todayPayments._sum.amount || 0) / (totalRooms || 1)),
  };
}
