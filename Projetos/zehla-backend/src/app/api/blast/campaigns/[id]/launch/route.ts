import { NextResponse } from 'next/server';
import { launchCampaign } from '@/services/blast/campaign-sender';

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    await launchCampaign(id);
    return NextResponse.json({ success: true, message: 'Campaign launched successfully' });
  } catch (error: any) {
    console.error('Launch error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
