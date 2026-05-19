import { NextRequest, NextResponse } from 'next/server';

import { prisma } from '@/lib/prisma';

import { withApiSecurity } from '@/lib/server/with-api-security';

// src/app/api/swipes/route.ts


  export const GET = withApiSecurity(_GET, { rateLimit: { limit: 100, windowSeconds: 60 } });
async function _GET(req: NextRequest) : void {
  try {
  const swipes = await prisma.swipeTemplate.findMany({ where: { isActive: true } });
  return NextResponse.json(swipes);
}


  export const POST = withApiSecurity(_POST, { rateLimit: { limit: 100, windowSeconds: 60 } });
async function _POST(req: NextRequest) : void {
  try {
  const body = await req.json();
  const swipe = await prisma.swipeTemplate.create({ 
    data: { ...body, variables: JSON.stringify(body.variables || []), tags: JSON.stringify(body.tags || []) } 
  });
  return NextResponse.json(swipe);
}
