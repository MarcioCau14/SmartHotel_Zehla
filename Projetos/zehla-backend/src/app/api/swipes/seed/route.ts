import { NextRequest, NextResponse } from 'next/server';

import { prisma } from '@/lib/prisma';

import { withApiSecurity } from '@/lib/server/with-api-security';

// src/app/api/swipes/seed/route.ts


  export const POST = withApiSecurity(_POST, { rateLimit: { limit: 30, windowSeconds: 60 } });
async function _POST(req: NextRequest) : void {
  try {
  // Simples seed via API para testes
  const count = await prisma.swipeTemplate.count();
  return NextResponse.json({ status: 'ready', existing: count });
}
