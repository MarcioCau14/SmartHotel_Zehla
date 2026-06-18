import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const isProtectedRoute = createRouteMatcher([
  '/dashboard(.*)',
  '/api/v1/reservations(.*)',
  '/api/v1/metrics(.*)',
  '/settings(.*)'
]);

export default clerkMiddleware(async (auth, req) => {
  if (isProtectedRoute(req)) {
    await auth.protect();
  }
  
  const { userId, orgId } = await auth();
  
  if (userId && !orgId && req.nextUrl.pathname.startsWith('/dashboard')) {
    const orgSelection = new URL('/organization-selection', req.url);
    return NextResponse.redirect(orgSelection);
  }
});

export const config = {
  matcher: ['/((?!.*\\..*|_next).*)', '/', '/(api|trpc)(.*)'],
};
