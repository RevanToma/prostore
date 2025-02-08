// import { NextResponse } from 'next/server';
// import type { NextRequest } from 'next/server';

import NextAuth from 'next-auth';
import { authConfig } from './auth.config';

// export async function middleware(request: NextRequest) {
//   let sessionCartId = request.cookies.get('sessionCartId')?.value;

//   if (!sessionCartId) {
//     sessionCartId = crypto.randomUUID();

//     const response = NextResponse.next();
//     response.cookies.set('sessionCartId', sessionCartId, {
//       httpOnly: true,
//       secure: true,
//       sameSite: 'lax',
//       path: '/',
//     });
//     return response;
//   }

//   return NextResponse.next();
// }

// export const config = {
//   matcher: ['/:path*'],
// };

export const { auth: middleware } = NextAuth(authConfig);
