import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function proxy(request: NextRequest) {
  const session = request.cookies.get('session');
  const { pathname } = request.nextUrl;

  // Define paths that require authentication
  const protectedPaths = ['/dashboard', '/orders', '/cod-bridge', '/reconcile'];
  
  const isProtected = protectedPaths.some(path => 
    pathname === path || pathname.startsWith(`${path}/`)
  );

  if (isProtected && !session) {
    // Redirect to landing page if there's no session
    const url = request.nextUrl.clone();
    url.pathname = '/';
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

// See "Matching Paths" below to learn more
export const config = {
  matcher: [
    '/dashboard/:path*',
    '/orders/:path*',
    '/cod-bridge/:path*',
    '/reconcile/:path*',
  ],
};
