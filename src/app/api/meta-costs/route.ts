import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getMetaCostSummary } from "@/lib/meta-cost-guard";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.tenantId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    
    // Default to last 30 days
    const startParam = searchParams.get("start");
    const endParam = searchParams.get("end");
    
    const startDate = startParam ? new Date(startParam) : new Date(Date.now() - 30 * 86400000);
    const endDate = endParam ? new Date(endParam) : new Date();

    const summary = await getMetaCostSummary(
      session.user.tenantId,
      startDate,
      endDate
    );

    return NextResponse.json(summary);
  } catch (error) {
    console.error("GET /api/meta-costs error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
