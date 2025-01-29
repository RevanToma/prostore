import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { auth } from '@/auth';

export async function middleware(request: NextRequest) {
  const session = await auth();
  console.log('🔍 Middleware Session:', session);

  if (!session || !session.user?.id) {
    console.log('🚫 No session found, redirecting to /sign-in');
    return NextResponse.redirect(new URL('/sign-in', request.url));
  }

  console.log('✅ User is authenticated, allowing access');
  return NextResponse.next();
}

export const config = {
  matcher: ['/shipping-address'],
};
