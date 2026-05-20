import { NextRequest, NextResponse } from "next/server";

import { collectAllTrends } from "@/lib/trends/collector";

import { withApiSecurity } from "@/lib/server/with-api-security";

async function _POST(request: NextRequest) {
  try {
  const body = await request.json().catch(() => ({}));
    const tierFilter = body.tier;

    const results = await collectAllTrends(tierFilter);

    return NextResponse.json({
      success: true,
      data: {
        message: "Sincronização ZCC-TRENDS concluída",
        results,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error("❌ Erro em ZCC-TRENDS Sync:", error);
    return NextResponse.json({ success: false, error: "Erro interno na coleta" }, { status: 500 });
  }
}

export const POST = withApiSecurity(_POST, { rateLimit: { limit: 10, windowSeconds: 60 } });
