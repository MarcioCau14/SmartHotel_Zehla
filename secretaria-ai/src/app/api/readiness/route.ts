import { NextRequest, NextResponse } from 'next/server';

interface ReadinessInput {
  hasPMS: boolean;
  hasChannelManager: boolean;
  hasBookingEngine: boolean;
  hasWhatsAppAutomation: boolean;
  hasReviewAutomation: boolean;
  hasConsolidatedDatabase: boolean;
  hasHistoricalData: boolean;
  teamOpenToAI: boolean;
  teamTrained: boolean;
}

function calculateReadiness(input: ReadinessInput): { score: number; category: string } {
  let score = 0;

  if (input.hasPMS) score += 15;
  if (input.hasChannelManager) score += 15;
  if (input.hasBookingEngine) score += 10;
  if (input.hasWhatsAppAutomation) score += 15;
  if (input.hasReviewAutomation) score += 10;
  if (input.hasConsolidatedDatabase) score += 10;
  if (input.hasHistoricalData) score += 10;
  if (input.teamOpenToAI) score += 10;
  if (input.teamTrained) score += 5;

  let category: string;
  if (score < 40) {
    category = 'Co-Pilots';
  } else if (score <= 75) {
    category = 'Brains';
  } else {
    category = 'Autonomous Agents';
  }

  return { score, category };
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const input: ReadinessInput = {
      hasPMS: Boolean(body.hasPMS),
      hasChannelManager: Boolean(body.hasChannelManager),
      hasBookingEngine: Boolean(body.hasBookingEngine),
      hasWhatsAppAutomation: Boolean(body.hasWhatsAppAutomation),
      hasReviewAutomation: Boolean(body.hasReviewAutomation),
      hasConsolidatedDatabase: Boolean(body.hasConsolidatedDatabase),
      hasHistoricalData: Boolean(body.hasHistoricalData),
      teamOpenToAI: Boolean(body.teamOpenToAI),
      teamTrained: Boolean(body.teamTrained),
    };

    const result = calculateReadiness(input);

    return NextResponse.json(result);
  } catch {
    return NextResponse.json(
      { error: 'Dados inválidos. Envie os 9 campos booleanos de prontidão.' },
      { status: 400 }
    );
  }
}