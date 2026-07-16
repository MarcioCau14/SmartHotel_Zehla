import { NextResponse } from 'next/server';

export async function GET() {
  const envInfo = {
    VERCEL: process.env.VERCEL || 'NOT_SET',
    VERCEL_ENV: process.env.VERCEL_ENV || 'NOT_SET',
    DATABASE_URL: process.env.DATABASE_URL ? 'SET (starts with: ' + process.env.DATABASE_URL.substring(0, 15) + ')' : 'NOT_SET',
    NEXTAUTH_URL: process.env.NEXTAUTH_URL || 'NOT_SET',
    NODE_ENV: process.env.NODE_ENV || 'NOT_SET',
    isVercel: !!(process.env.VERCEL || process.env.VERCEL_ENV),
  };
  return NextResponse.json(envInfo);
}
