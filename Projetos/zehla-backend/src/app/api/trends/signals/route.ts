import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

import { withApiSecurity } from "@/lib/server/with-api-security";

const VALID_SEVERITIES = ["baixa", "media", "alta", "critica"];

async function _GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const severity = searchParams.get("severity");
    const type = searchParams.get("type");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const limit = Math.min(parseInt(searchParams.get("limit") ?? "50", 10), 200);

    const where: any = {};

    if (severity) {
      const severities = severity.split(",").filter((s) => VALID_SEVERITIES.includes(s));
      if (severities.length > 0) where.severity = { in: severities };
    }

    if (type) {
      where.type = { in: type.split(",") };
    }

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = new Date(startDate);
      if (endDate) where.createdAt.lte = new Date(endDate);
    }

    const [signals, total] = await Promise.all([
      prisma.trendSignal.findMany({
        where,
        orderBy: { createdAt: "desc" },
        take: limit,
      }),
      prisma.trendSignal.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      data: signals,
      meta: { total, returned: signals.length, limit },
    });
  } catch (error) {
    console.error("❌ Erro em ZCC-TRENDS Signals:", error);
    return NextResponse.json({ success: false, error: "Erro interno" }, { status: 500 });
  }
}

export const GET = withApiSecurity(_GET, { rateLimit: { limit: 60, windowSeconds: 60 } });
