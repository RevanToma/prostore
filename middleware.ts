import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  let sessionCartId = request.cookies.get('sessionCartId')?.value;

  if (!sessionCartId) {
    sessionCartId = crypto.randomUUID();

    const response = NextResponse.next();
    response.cookies.set('sessionCartId', sessionCartId, {
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      path: '/',
    });
    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/:path*'],
};
