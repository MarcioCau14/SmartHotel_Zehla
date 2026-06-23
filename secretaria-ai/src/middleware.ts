import { NextRequest, NextResponse } from 'next/server';

const publicPaths = ['/login', '/api/auth', '/api/checkout/webhook', '/api/checkout/pix-status'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (publicPaths.some((path) => pathname.startsWith(path))) {
    return NextResponse.next();
  }

  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/favicon') ||
    pathname.startsWith('/og-image') ||
    (pathname.startsWith('/api/') &&
      !pathname.startsWith('/api/dashboard') &&
      !pathname.startsWith('/api/ddc') &&
      !pathname.startsWith('/api/zcc'))
  ) {
    return NextResponse.next();
  }

  const sessionToken =
    request.cookies.get('next-auth.session-token')?.value ??
    request.cookies.get('__Secure-next-auth.session-token')?.value;

  if (!sessionToken && (pathname.startsWith('/dashboard') || pathname.startsWith('/zcc'))) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|og-image.png|robots.txt).*)'],
};
