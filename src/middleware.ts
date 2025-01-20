import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function middleware(request: NextRequest) {
  const token = await getToken({ req: request });

  // Check if the route is an admin route
  const isAdminRoute = request.nextUrl.pathname.startsWith('/admin');
  const isApiAdminRoute = request.nextUrl.pathname.startsWith('/api/admin');
  const isSchoolClaimRoute = request.nextUrl.pathname.includes('/api/schools/claims/process');

  // If it's an admin route and user is not authenticated, redirect to login
  if ((isAdminRoute || isApiAdminRoute || isSchoolClaimRoute) && !token) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('callbackUrl', request.url);
    return NextResponse.redirect(loginUrl);
  }

  // For API routes that require authentication
  if ((isApiAdminRoute || isSchoolClaimRoute) && !token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/api/admin/:path*', '/api/schools/claims/process'],
};
