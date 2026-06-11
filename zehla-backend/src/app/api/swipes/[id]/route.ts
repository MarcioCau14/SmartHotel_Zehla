// src/app/api/swipes/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const swipe = await prisma.swipeTemplate.findUnique({ where: { id } });
  return NextResponse.json(swipe);
}

export async function PUT(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const body = await req.json();
  const swipe = await prisma.swipeTemplate.update({ where: { id }, data: body });
  return NextResponse.json(swipe);
}

export async function DELETE(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  await prisma.swipeTemplate.update({ where: { id }, data: { isActive: false } });
  return NextResponse.json({ success: true });
}
