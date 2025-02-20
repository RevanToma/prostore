import type { NextAuthConfig } from 'next-auth';
import { NextResponse } from 'next/server';

export const authConfig = {
  providers: [],
  callbacks: {
    authorized({ request, auth }: any) {
      if (!request.cookies.get('sessionCartId')) {
        const protectedPaths = [
          /\/shipping-address/,
          /\/payment-method/,
          /\/place-order/,
          /\/profile/,
          /\/user\/(.*)/,
          /\/order\/(.*)/,
          /\/admin/,
        ];
        const { pathname } = request.nextUrl,
          isProtected = protectedPaths.some((path) => path.test(pathname));

        if (!auth && isProtected) return false;

        const sessionCartId = crypto.randomUUID();

        const newRequestHeaders = new Headers(request.headers);

        const response = NextResponse.next({
          request: {
            headers: newRequestHeaders,
          },
        });

        response.cookies.set('sessionCartId', sessionCartId);
        return response;
      } else {
        return true;
      }
    },
  },
} satisfies NextAuthConfig;
