import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  let sessionCartId = request.cookies.get('sessionCartId')?.value;
  const sessionToken = request.cookies.get('authjs.session-token');

  // ✅ Ensure sessionCartId is always set
  if (!sessionCartId) {
    console.log('🛒 No sessionCartId, generating a new one...');
    sessionCartId = crypto.randomUUID();

    const response = NextResponse.next();
    response.cookies.set('sessionCartId', sessionCartId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
    });
    return response; // ✅ Allows the request to continue without redirection
  }

  // ✅ If the user visits a protected page but is not authenticated, redirect
  const protectedRoutes = ['/shipping-address'];
  const isProtected = protectedRoutes.some((route) =>
    request.nextUrl.pathname.startsWith(route)
  );

  if (isProtected && !sessionToken) {
    console.log('🚫 No session token found, redirecting to /sign-in');
    return NextResponse.redirect(new URL('/sign-in', request.url));
  }

  console.log('✅ Session and cart session found, allowing access');
  return NextResponse.next();
}

// ✅ Middleware applies to all routes to ensure cart session is always set
export const config = {
  matcher: ['/:path*'], // Runs for all requests
};
