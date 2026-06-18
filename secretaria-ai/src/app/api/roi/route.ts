import { NextRequest, NextResponse } from 'next/server';

interface ROIInput {
  roomsCount: number;
  adr: number;
  occupancy: number;
  staffHourlyRate: number;
}

function calculateROI(input: ROIInput) {
  const { roomsCount, adr, occupancy, staffHourlyRate } = input;

  // 1. Occupancy boost based on current occupancy
  let boostPercent: number;
  if (occupancy < 40) {
    boostPercent = 12;
  } else if (occupancy <= 80) {
    boostPercent = 8;
  } else {
    boostPercent = 4;
  }

  // 2. Revenue gain: (rooms * 30) * boostPercent * adr
  const revenueGain = roomsCount * 30 * (boostPercent / 100) * adr;

  // 3. OTA savings: existing_reservations * 0.20 * adr * 0.15
  const existingReservations = Math.round(roomsCount * (occupancy / 100) * 30);
  const otaSavings = existingReservations * 0.20 * adr * 0.15;

  // 4. Staff savings: 3 hours * 30 * staffHourlyRate
  const staffSavings = 3 * 30 * staffHourlyRate;

  // 5. ROI Monthly
  const roiMonthly = revenueGain + otaSavings + staffSavings;

  // 6. ROI Annual
  const roiAnnual = roiMonthly * 12;

  // Current monthly revenue (for chart comparison)
  const currentMonthlyRevenue = roomsCount * (occupancy / 100) * 30 * adr;

  // Projected monthly revenue
  const projectedOccupancy = Math.min(100, occupancy + boostPercent);
  const projectedMonthlyRevenue = roomsCount * (projectedOccupancy / 100) * 30 * adr;

  // Payback period (assuming ZEHLA subscription ~R$ 997/month based on Brazilian pousada market)
  const zehlaMonthlyCost = 997;
  const netMonthlyGain = roiMonthly - zehlaMonthlyCost;
  const paybackMonths = netMonthlyGain > 0 ? Math.ceil(zehlaMonthlyCost / (netMonthlyGain / 12)) : null;

  return {
    boostPercent,
    revenueGain: Math.round(revenueGain * 100) / 100,
    otaSavings: Math.round(otaSavings * 100) / 100,
    staffSavings: Math.round(staffSavings * 100) / 100,
    roiMonthly: Math.round(roiMonthly * 100) / 100,
    roiAnnual: Math.round(roiAnnual * 100) / 100,
    currentMonthlyRevenue: Math.round(currentMonthlyRevenue * 100) / 100,
    projectedMonthlyRevenue: Math.round(projectedMonthlyRevenue * 100) / 100,
    existingReservations,
    projectedOccupancy,
    paybackMonths,
    zehlaMonthlyCost,
  };
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const roomsCount = Number(body.roomsCount) || 20;
    const adr = Number(body.adr) || 300;
    const occupancy = Number(body.occupancy) || 50;
    const staffHourlyRate = Number(body.staffHourlyRate) || 25;

    const clamped = {
      roomsCount: Math.max(1, Math.min(200, roomsCount)),
      adr: Math.max(50, Math.min(2000, adr)),
      occupancy: Math.max(10, Math.min(100, occupancy)),
      staffHourlyRate: Math.max(10, Math.min(100, staffHourlyRate)),
    };

    const result = calculateROI(clamped);

    return NextResponse.json(result);
  } catch {
    return NextResponse.json(
      { error: 'Dados inválidos. Envie roomsCount, adr, occupancy e staffHourlyRate.' },
      { status: 400 }
    );
  }
}