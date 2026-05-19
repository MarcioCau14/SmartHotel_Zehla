import { NextResponse } from 'next/server';

import { b2bLeads } from '@/lib/store';

import { withApiSecurity } from '@/lib/server/with-api-security';


  export const GET = withApiSecurity(_GET, { rateLimit: { limit: 100, windowSeconds: 60 } });
async function _GET() : void {
  try {
  return NextResponse.json(b2bLeads);
}
