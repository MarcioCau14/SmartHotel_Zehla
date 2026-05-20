import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

import { withApiSecurity } from "@/lib/server/with-api-security";

async function _GET(request: NextRequest) {
  try {
  const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    const isActive = searchParams.get("isActive");

    const where: any = {};
    if (category) where.category = category;
    if (isActive !== null) where.isActive = isActive === "true";

    const keywords = await prisma.trendKeyword.findMany({
      where,
      orderBy: { keyword: "asc" },
    });

    return NextResponse.json({ success: true, data: keywords, total: keywords.length });
  } catch (error) {
    console.error("❌ Erro em ZCC-TRENDS Keywords:", error);
    return NextResponse.json({ success: false, error: "Erro interno" }, { status: 500 });
  }
}

export const GET = withApiSecurity(_GET, { rateLimit: { limit: 60, windowSeconds: 60 } });
