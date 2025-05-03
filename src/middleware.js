import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function middleware(req) {
  // Get auth token from cookies or Authorization header
  // Note: In middleware, we can't access localStorage directly
  // We'll check for the token in cookies (for backward compatibility)
  // and also in the Authorization header (which our client code will set)
  let token = req.cookies.get('auth_token')?.value;

  // If no token in cookies, check Authorization header
  if (!token) {
    const authHeader = req.headers.get('Authorization');
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    }
  }

  // Get the pathname of the request
  const { pathname } = req.nextUrl;

  // Check if the request is for a protected route
  const isProtectedRoute = pathname.startsWith('/dashboard');

  // Check if the request is for an API route
  const isApiRoute = pathname.startsWith('/api');

  // If it's a protected route and there's no token, redirect to login
  if (isProtectedRoute && !token) {
    const redirectUrl = new URL('/login', req.url);
    // Add the original URL as a parameter to redirect back after login
    redirectUrl.searchParams.set('from', pathname);
    return NextResponse.redirect(redirectUrl);
  }

  // For API routes that need authentication (except auth-related endpoints)
  if (isApiRoute &&
      !pathname.startsWith('/api/auth/login') &&
      !pathname.startsWith('/api/auth/register') &&
      pathname.startsWith('/api/posts') ||
      pathname.startsWith('/api/upload')) {

    // If there's no token, return unauthorized response for API routes
    if (!token) {
      return new NextResponse(
        JSON.stringify({ message: 'Authentication required' }),
        {
          status: 401,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }
  }

  // Continue with the request
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/api/posts/:path*',
    '/api/upload/:path*',
    '/api/auth/:path*'
  ],
};
