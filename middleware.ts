import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  console.log('🔍 Production Middleware Check');

  let sessionCartId = request.cookies.get('sessionCartId')?.value;
  const sessionToken = request.cookies.get('authjs.session-token');

  console.log('🔍 Cookies in Middleware:', request.cookies.getAll());

  if (!sessionCartId) {
    console.log('🛒 No sessionCartId, generating one...');
    sessionCartId = crypto.randomUUID();

    const response = NextResponse.next();
    response.cookies.set('sessionCartId', sessionCartId, {
      httpOnly: true,
      secure: true, // ✅ Enforce secure cookies
      sameSite: 'lax',
      path: '/',
    });
    return response;
  }

  const protectedRoutes = ['/shipping-address'];
  const isProtected = protectedRoutes.some((route) =>
    request.nextUrl.pathname.startsWith(route)
  );

  if (isProtected && !sessionToken) {
    console.log('🚫 No session token in production, redirecting to /sign-in');
    return NextResponse.redirect(new URL('/sign-in', request.url));
  }

  console.log('✅ User is authenticated, proceeding');
  return NextResponse.next();
}

// ✅ Middleware applies to all routes to ensure cart session is always set
export const config = {
  matcher: ['/:path*'],
};
