import { NextResponse } from 'next/server';

import { launchCampaign } from '@/services/blast/campaign-sender';

import { withApiSecurity } from '@/lib/server/with-api-security';

async function _POST(
  req: Request,
  { params }
  export const POST = withApiSecurity(_POST, { rateLimit: { limit: 30, windowSeconds: 60 } });
: { params: { id: string } }
) {
  const id = params.id;

  try {
    await launchCampaign(id);
    return NextResponse.json({ success: true, message: 'Campaign launched successfully' });
  } catch (error: unknown) {
    console.error('Launch error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
