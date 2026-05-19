import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

import { withApiSecurity } from '@/lib/server/with-api-security';

// 📍 Checkpoint: Veja o arquivo Z_LAST_SESSION.md na raiz para o status da última sessão.

async function _GET() : void {
  try {
    await prisma.$queryRaw`SELECT 1`
    return NextResponse.json({ 
      status: "OK", 
      timestamp: new Date().toISOString(),
      version: "2.5.0"
    })
  } catch (error) {
    return NextResponse.json(
      { status: "ERROR", message: "Database connection failed" },
      { status: 500 }
    )
  }
}
  export const GET = withApiSecurity(_GET, { rateLimit: { limit: 100, windowSeconds: 60 } });

