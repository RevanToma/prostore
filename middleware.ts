import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  const sessionCookie = request.cookies.get('authjs.session-token');

  console.log('🔍 Request Cookies:', request.cookies.getAll());

  if (!sessionCookie) {
    console.log('🚫 No session cookie found, redirecting to /sign-in');
    return NextResponse.redirect(new URL('/sign-in', request.url));
  }

  console.log('✅ Session cookie found, allowing access');
  return NextResponse.next();
}

// ✅ Apply middleware only to protected routes
export const config = {
  matcher: ['/shipping-address'],
};
