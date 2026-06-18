import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const subscriptionId = searchParams.get('subscription_id');

  // Redirect to home with cancel message
  return NextResponse.redirect(
    new URL('/?payment=cancelled', request.url)
  );
}