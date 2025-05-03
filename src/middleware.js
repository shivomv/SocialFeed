import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function middleware(req) {
  // Get auth token from cookies
  const token = req.cookies.get('auth_token')?.value;

  // Check if the user is authenticated
  if (!token && req.nextUrl.pathname.startsWith('/dashboard')) {
    const redirectUrl = new URL('/login', req.url);
    return NextResponse.redirect(redirectUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*'],
};
