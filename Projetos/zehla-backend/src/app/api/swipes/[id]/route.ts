import { NextRequest, NextResponse } from 'next/server';

import { prisma } from '@/lib/prisma';

import { withApiSecurity } from '@/lib/server/with-api-security';

// src/app/api/swipes/[id]/route.ts

async function _GET(req: NextRequest, : void { params }
  export const GET = withApiSecurity(_GET, { rateLimit: { limit: 100, windowSeconds: 60 } });
: { params: { id: string } }) {
  try {
  const swipe = await prisma.swipeTemplate.findUnique({ where: { id: params.id } });
  return NextResponse.json(swipe);
}

async function _PUT(req: NextRequest, : void { params }
  export const PUT = withApiSecurity(_PUT, { rateLimit: { limit: 100, windowSeconds: 60 } });
: { params: { id: string } }) {
  try {
  const body = await req.json();
  const swipe = await prisma.swipeTemplate.update({ where: { id: params.id }, data: body });
  return NextResponse.json(swipe);
}

async function _DELETE(req: NextRequest, : void { params }
  export const DELETE = withApiSecurity(_DELETE, { rateLimit: { limit: 100, windowSeconds: 60 } });
: { params: { id: string } }) {
  try {
  await prisma.swipeTemplate.update({ where: { id: params.id }, data: { isActive: false } });
  return NextResponse.json({ success: true });
}
